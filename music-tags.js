/* Lightweight, optional music metadata for Google Drive files.
 * Filename/folder browsing is immediate. ID3 is read only when the user requests it.
 * No dependency, no entire-song download, and no automatic 1,000-file scan.
 */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.FoodMusicTags=api;})(typeof window!=="undefined"?window:null,function(){
"use strict";
const genres=["Blues","Classic Rock","Country","Dance","Disco","Funk","Grunge","Hip-Hop","Jazz","Metal","New Age","Oldies","Other","Pop","R&B","Rap","Reggae","Rock","Techno","Industrial","Alternative","Ska","Death Metal","Pranks","Soundtrack","Euro-Techno","Ambient","Trip-Hop","Vocal","Jazz+Funk","Fusion","Trance","Classical","Instrumental","Acid","House","Game","Sound Clip","Gospel","Noise","Alternative Rock","Bass","Soul","Punk","Space","Meditative","Instrumental Pop","Instrumental Rock","Ethnic","Gothic","Darkwave","Techno-Industrial","Electronic","Pop-Folk","Eurodance","Dream","Southern Rock","Comedy","Cult","Gangsta","Top 40","Christian Rap","Pop/Funk","Jungle","Native American","Cabaret","New Wave","Psychadelic","Rave","Showtunes","Trailer","Lo-Fi","Tribal","Acid Punk","Acid Jazz","Polka","Retro","Musical","Rock & Roll","Hard Rock"];
const read32=(b,i)=>((b[i]*16777216)+(b[i+1]<<16)+(b[i+2]<<8)+b[i+3])>>>0;
const syncsafe=(b,i)=>((b[i]&127)<<21)|((b[i+1]&127)<<14)|((b[i+2]&127)<<7)|(b[i+3]&127);
function textBytes(bytes,enc){
 if(!bytes.length)return "";
 try{
  if(enc===0)return new TextDecoder("iso-8859-1").decode(bytes).split("\0")[0].trim();
  if(enc===3)return new TextDecoder("utf-8").decode(bytes).split("\0")[0].trim();
  if(enc===1||enc===2){
   let b=bytes,le=enc===1;
   if(bytes[0]===255&&bytes[1]===254){b=bytes.subarray(2);le=true;}
   else if(bytes[0]===254&&bytes[1]===255){b=bytes.subarray(2);le=false;}
   const swapped=new Uint8Array(b.length-(b.length%2));
   if(le)swapped.set(b.subarray(0,swapped.length));
   else for(let i=0;i<swapped.length;i+=2){swapped[i]=b[i+1];swapped[i+1]=b[i];}
   return new TextDecoder("utf-16le").decode(swapped).split("\0")[0].trim();
  }
 }catch{}
 return "";
}
function genreText(value){
 const raw=String(value||"").trim();
 if(!raw)return "";
 const m=/^\((\d+)\)(.*)$/.exec(raw)||/^(\d+)$/.exec(raw);
 if(m){const label=m[2]?.trim();return label||genres[Number(m[1])]||raw;}
 return raw;
}
function parseId3(input){
 const b=input instanceof Uint8Array?input:new Uint8Array(input||0),out={};
 if(b.length<10||b[0]!==73||b[1]!==68||b[2]!==51)return out;
 const version=b[3];if(version<2||version>4)return out;
 let pos=10,limit=Math.min(b.length,10+syncsafe(b,6));
 if(b[5]&64){
  if(version===3&&pos+4<=limit)pos+=4+read32(b,pos);
  else if(version===4&&pos+4<=limit)pos+=syncsafe(b,pos);
 }
 const names={TPE1:"artist",TALB:"album",TCON:"genre",TIT2:"title",TPE:"artist",TAL:"album",TCO:"genre",TT2:"title"};
 while(pos+(version===2?6:10)<=limit){
  const len=version===2?3:4,header=version===2?6:10;
  const id=String.fromCharCode(...b.subarray(pos,pos+len));
  if(!/^[A-Z0-9]+$/.test(id))break;
  const size=version===2?(b[pos+3]<<16)|(b[pos+4]<<8)|b[pos+5]:version===4?syncsafe(b,pos+4):read32(b,pos+4);
  if(size<=0||pos+header+size>limit)break;
  const field=names[id];
  if(field&&!out[field]){
   const frame=b.subarray(pos+header,pos+header+size);
   const value=textBytes(frame.subarray(1),frame[0]);
   if(value)out[field]=field==="genre"?genreText(value):value;
  }
  pos+=header+size;
 }
 return out;
}
function parseId3v1(input){
 const b=input instanceof Uint8Array?input:new Uint8Array(input||0),out={};
 if(b.length<128)return out;
 const s=b.subarray(b.length-128);
 if(s[0]!==84||s[1]!==65||s[2]!==71)return out;
 const read=(start,length)=>textBytes(s.subarray(start,start+length),0);
 out.title=read(3,30);out.artist=read(33,30);out.album=read(63,30);
 out.genre=genres[s[127]]||"";
 return Object.fromEntries(Object.entries(out).filter(([,v])=>!!v));
}
function filenameParts(raw){
 const name=String(raw||"").replace(/\.(mp3|m4a|aac|ogg|oga|wav|flac|opus)$/i,"").trim();
 const withoutNumber=name.replace(/^\d{1,3}[\s._-]+(?=\D)/,"").trim();
 const match=/^(.+?)\s+[-–—]\s+(.+)$/.exec(withoutNumber);
 return match?{artist:match[1].trim(),title:match[2].trim()}:{artist:"",title:withoutNumber||name};
}
function details(track,tags={}){
 const path=String(track.folder||track.album||"").trim(),parts=path.split(/\s*\/\s*/).filter(Boolean);
 const file=filenameParts(track.title||track.name);
 return {
  title:tags.title||file.title||"Untitled",artist:tags.artist||track.artist||file.artist||"Unknown artist",
  album:tags.album||(parts.length>1?parts[parts.length-1]:"Unknown album"),
  genre:tags.genre||track.genre||"Unknown genre",folder:path||"Unfiled",
  albumFromFolder:!tags.album&&parts.length>1
 };
}
const labels={title:"Title",artist:"Artist",album:"Album",genre:"Genre",folder:"Folder"};
function sortTracks(tracks,key="title",cache={}){
 const field=labels[key]?key:"title";
 return tracks.slice().sort((a,b)=>{
  const x=details(a,cache[a.id]||{}),y=details(b,cache[b.id]||{});
  const ax=x[field],by=y[field];
  const missing=v=>/^Unknown |^Unfiled$/.test(v);
  if(missing(ax)!==missing(by))return missing(ax)?1:-1;
  return ax.localeCompare(by,"en-AU",{numeric:true,sensitivity:"base"})||
   x.title.localeCompare(y.title,"en-AU",{numeric:true,sensitivity:"base"});
 });
}
function filterTracks(tracks,query,cache={}){
 const q=String(query||"").trim().toLocaleLowerCase("en-AU");
 return q?tracks.filter(t=>{
  const d=details(t,cache[t.id]||{});
  return [t.title,d.title,d.artist,d.album,d.genre,d.folder].join(" ").toLocaleLowerCase("en-AU").includes(q);
 }):tracks;
}
return {parseId3,parseId3v1,filenameParts,details,sortTracks,filterTracks,genreText};
});
