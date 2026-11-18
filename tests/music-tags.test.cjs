const test=require("node:test");
const assert=require("node:assert/strict");
const Tags=require("../music-tags.js");
const music=require("../music-cooking.js");

function id3Frame(id,value){
 const bytes=Buffer.concat([Buffer.from([3]),Buffer.from(value,"utf8")]);
 const head=Buffer.alloc(10);head.write(id,0,"ascii");head.writeUInt32BE(bytes.length,4);
 return Buffer.concat([head,bytes]);
}
function id3Tag(...frames){
 const body=Buffer.concat(frames),header=Buffer.alloc(10);
 header.write("ID3",0,"ascii");header[3]=3;let length=body.length;
 for(let i=9;i>=6;i--){header[i]=length&127;length>>=7;}
 return Buffer.concat([header,body]);
}
test("ID3v2 artist, album, title and genre are parsed without full-song download",()=>{
 const bytes=id3Tag(id3Frame("TPE1","Andrea Rosario"),id3Frame("TALB","We Own The Night"),id3Frame("TIT2","We Own The Night"),id3Frame("TCON","(17)"));
 assert.deepEqual(Tags.parseId3(bytes),{artist:"Andrea Rosario",album:"We Own The Night",title:"We Own The Night",genre:"Rock"});
 assert.deepEqual(Tags.parseId3(Buffer.from("not an MP3 tag")),{});
 assert.deepEqual(Tags.parseId3(Buffer.alloc(10)),{});
});
test("ID3v1 tail can supply older MP3 metadata and missing fields stay unknown",()=>{
 const b=Buffer.alloc(128);b.write("TAG");b.write("Oceans",3);b.write("Hillsong",33);b.write("Zion",63);b[127]=38;
 assert.deepEqual(Tags.parseId3v1(b),{title:"Oceans",artist:"Hillsong",album:"Zion",genre:"Gospel"});
 assert.deepEqual(Tags.parseId3v1(Buffer.alloc(128)),{});
});
test("Filename fallback, folder path, reliable tags and album label are distinct",()=>{
 const loose=Tags.details({id:"a",title:"Andrea Rosario - We Own The Night",album:"Music"});
 assert.equal(loose.title,"We Own The Night");
 assert.equal(loose.artist,"Andrea Rosario");
 assert.equal(loose.album,"Unknown album");
 assert.equal(loose.folder,"Music");
 const nested=Tags.details({id:"b",title:"Oceans",album:"Music / Bethel"});
 assert.equal(nested.album,"Bethel");
 assert.equal(nested.folder,"Music / Bethel");
 assert.equal(nested.albumFromFolder,true);
 const real=Tags.details({id:"b",title:"Oceans",album:"Music / Bethel"},{artist:"Hillsong UNITED",album:"Zion",genre:"Gospel"});
 assert.equal(real.album,"Zion");assert.equal(real.artist,"Hillsong UNITED");assert.equal(real.albumFromFolder,false);
});
test("Sorting by artist, genre, folder and album is natural and unknown values sort last",()=>{
 const tracks=[
  {id:"1",title:"Unknown",album:"Music"},
  {id:"2",title:"B - Song",album:"Music / Zed"},
  {id:"3",title:"A - Other",album:"Music / Able"}
 ];
 assert.deepEqual(Tags.sortTracks(tracks,"artist").map(t=>t.id),["3","2","1"]);
 assert.deepEqual(Tags.sortTracks(tracks,"folder").map(t=>t.id),["1","3","2"]);
 assert.deepEqual(Tags.sortTracks(tracks,"album").map(t=>t.id),["3","2","1"]);
 assert.deepEqual(Tags.sortTracks(tracks,"genre",{"2":{genre:"Rock"},"3":{genre:"Jazz"}}).map(t=>t.id),["3","2","1"]);
 assert.equal(Tags.filterTracks(tracks,"zed").length,1);
 assert.equal(Tags.filterTracks(tracks,"gospel",{"1":{genre:"Gospel"}})[0].id,"1");
 assert.equal(Tags.filterTracks(tracks,"a - other")[0].id,"3");
 assert.deepEqual(tracks.map(t=>t.id),["1","2","3"],"sorting does not mutate the queue source");
});
test("1,200-track library loads progressively rather than permanently hiding 800 songs",()=>{
 const d=music._data;
 d.tracks=Array.from({length:1200},(_,i)=>({id:"id"+i,title:"Music - Song "+(i+1),album:"Music / Collection",mime:"audio/mpeg",size:100}));
 d.filter="";d.tags={};d.sort="title";d.group="none";d.visible=200;
 let html=music.listHtml();
 assert.equal((html.match(/data-music-track=/g)||[]).length,200);
 assert.match(html,/Show more songs \(200 of 1200\)/);
 d.visible=1200;html=music.listHtml();
 assert.equal((html.match(/data-music-track=/g)||[]).length,1200);
 assert.doesNotMatch(html,/Show more songs/);
 d.group="artist";d.visible=200;html=music.listHtml();
 assert.match(html,/Play group/);
 d.tracks=[{id:"safe",title:"Artist - <script>alert(1)</script>",album:"Music"}];d.group="none";
 assert.ok(music.listHtml().includes("&lt;script&gt;"),"Drive filenames must be escaped before DOM insertion");
});
test("UI loads tag scanner before music player and offline shell includes both",()=>{
 const fs=require("node:fs"),path=require("node:path");
 const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
 const html=read("index.html"),sw=read("service-worker.js"),app=read("music-cooking.js");
 assert.ok(html.indexOf('src="music-tags.js"')<html.indexOf('src="music-cooking.js"'));
 assert.match(sw,/"\.\/music-tags\.js"/);
 assert.match(app,/id="musicSort"/);
 assert.match(app,/id="musicGroup"/);
 assert.match(app,/Stop reading tags/);
 assert.match(app,/bytes=0-131071/);
 assert.match(app,/bytes=-128/);
});
