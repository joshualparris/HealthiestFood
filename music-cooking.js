/* "Music while cooking": streams the owner's Google Drive MP3s through /api/music (Vercel only),
 * the same server-side OAuth + Range proxy design as JoshBooksOnline. The audio element lives
 * outside the views, so music keeps playing while you move between recipes, timers and tabs.
 */
(function(root,factory){const api=factory(root);if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.FoodMusic=api;})(typeof window!=="undefined"?window:null,function(w){
"use strict";
const Tags=w?.FoodMusicTags||(typeof module==="object"&&module.exports?require("./music-tags.js"):null);
const TAG_STORE="good-food-music-tags-v1";
const STORE="good-food-music-v1";
const esc=x=>String(x).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));
const data={tracks:[],queue:[],index:-1,status:"idle",message:"",shuffle:false,playing:false,filter:"",sort:"title",group:"none",visible:200,tags:{},scanning:false,scanDone:0,scanTotal:0,scanGeneration:0,scanAbort:null,loadAbort:null,loadTimer:null,loadStarted:0,loadDuration:0,loadGeneration:0,loadLog:[],loadNotice:0,justSignedIn:false,audio:null,root:null,mini:null};
const MESSAGES={
 not_configured:"Music isn't set up on this site yet. It needs Google sign-in settings on the Vercel project.",
 offline_host:"Drive music only works on the main Vercel site, because it needs the private streaming service.",
 not_allowed:"That Google account isn't on the allowed list for this music library.",
 bad_state:"Sign-in expired before it finished. Please try again.",
 cancelled:"Sign-in was cancelled.",
 error:"Google sign-in failed. Please try again.",
 folder_not_found:"The music folder couldn't be found in Google Drive.",
 drive_error:"Google Drive didn't return the music list. Try again shortly."
};
/* Fisher–Yates on a copy; rand is injectable for tests. */
function shuffled(list,rand=Math.random){const a=list.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function filtered(tracks,text){return Tags?Tags.filterTracks(tracks,text,data.tags):tracks.filter(t=>(t.title+" "+(t.album||"")).toLowerCase().includes(String(text||"").toLowerCase()));}
function sorted(tracks){return Tags?Tags.sortTracks(tracks,data.sort,data.tags):tracks.slice();}
function shownTracks(){return sorted(filtered(data.tracks,data.filter));}
function info(t){return Tags?Tags.details(t,data.tags[t.id]||{}):{title:t.title,artist:"Unknown artist",album:t.album||"Unknown album",genre:"Unknown genre",folder:t.album||"Unfiled"};}
function groups(tracks){
 if(data.group==="none")return [["",tracks]];
 const map=new Map();
 tracks.forEach(t=>{const name=info(t)[data.group]||"Unknown";if(!map.has(name))map.set(name,[]);map.get(name).push(t);});
 return [...map.entries()].sort((a,b)=>{
  const missing=s=>/^(Unknown|Unfiled)/.test(s);
  return missing(a[0])!==missing(b[0])?(missing(a[0])?1:-1):a[0].localeCompare(b[0],"en-AU",{numeric:true,sensitivity:"base"});
 });
}
function saveTags(){try{localStorage.setItem(TAG_STORE,JSON.stringify(data.tags));}catch{}}
function pendingTags(){return data.tracks.filter(t=>/mpeg|mp3/i.test(t.mime||"")&&(!data.tags[t.id]?.scanned||data.tags[t.id].size!==t.size));}
function stopScan(){
 data.scanGeneration++;data.scanning=false;
 data.scanAbort?.abort();data.scanAbort=null;sync();
}
async function scanTags(){
 if(data.scanning||data.status!=="ready"||!Tags)return;
 const pending=pendingTags();if(!pending.length)return sync();
 const generation=++data.scanGeneration;
 data.scanning=true;data.scanDone=0;data.scanTotal=pending.length;
 data.scanAbort=new AbortController();const signal=data.scanAbort.signal;sync();
 let nextIndex=0;
 async function worker(){
  while(data.scanning&&generation===data.scanGeneration&&nextIndex<pending.length){
   const t=pending[nextIndex++];let found={},failed=false;
   try{
    const res=await fetch(streamUrl(t.id),{credentials:"same-origin",headers:{Range:"bytes=0-131071"},signal});
    if(!res.ok||!/^audio\//i.test(res.headers.get("content-type")||""))throw Error("Unavailable tag");
    found=Tags.parseId3(await res.arrayBuffer());
    if(!found.genre||!found.artist||!found.album){
     const tail=await fetch(streamUrl(t.id),{credentials:"same-origin",headers:{Range:"bytes=-128"},signal});
     if(tail.ok&&/^audio\//i.test(tail.headers.get("content-type")||"")){
      const older=Tags.parseId3v1(await tail.arrayBuffer());
      found={...older,...found};
     }
    }
   }catch(e){if(signal.aborted)return;failed=true;}
   if(generation!==data.scanGeneration||!data.scanning)return;
   if(!failed)data.tags[t.id]={size:t.size,scanned:true,...found};
   data.scanDone++;
   if(data.scanDone%10===0){saveTags();sync();}
  }
 }
 try{await Promise.all([worker(),worker()]);}
 finally{if(generation===data.scanGeneration){saveTags();data.scanning=false;data.scanAbort=null;sync();}}
}
const streamUrl=id=>"/api/music/stream?id="+encodeURIComponent(id);
const current=()=>data.queue[data.index]||null;
function persist(){try{localStorage.setItem(STORE,JSON.stringify({shuffle:data.shuffle,sort:data.sort,group:data.group}));}catch{}}
function restore(){
 try{
  const options=JSON.parse(localStorage.getItem(STORE)||"{}");
  data.shuffle=options.shuffle===true;
  if(["title","artist","album","genre","folder"].includes(options.sort))data.sort=options.sort;
  if(["none","artist","album","genre","folder"].includes(options.group))data.group=options.group;
 }catch{}
 try{const cache=JSON.parse(localStorage.getItem(TAG_STORE)||"{}");if(cache&&typeof cache==="object"&&!Array.isArray(cache))data.tags=cache;}catch{}
}
function ensureAudio(){
 if(data.audio)return data.audio;
 const a=new Audio();a.preload="metadata";
 a.addEventListener("play",()=>{data.playing=true;w.FoodPodcastPlayer?.pause?.();sync();});
 a.addEventListener("pause",()=>{data.playing=false;sync();});
 a.addEventListener("ended",()=>next());
 a.addEventListener("error",()=>{if(!current())return;data.message="Couldn't play “"+current().title+"”. Skipping to the next song.";sync();setTimeout(next,1200);});
 data.audio=a;return a;
}
function mediaSession(t){
 if(!("mediaSession" in navigator)||!t)return;
 try{const d=info(t);navigator.mediaSession.metadata=new MediaMetadata({title:d.title,artist:d.artist,album:d.album});
  const on=(k,fn)=>{try{navigator.mediaSession.setActionHandler(k,fn);}catch{}};
  on("play",()=>data.audio?.play());on("pause",()=>data.audio?.pause());on("nexttrack",()=>next());on("previoustrack",()=>prev());}catch{}
}
function playAt(i){
 if(i<0||i>=data.queue.length)return;
 data.index=i;data.message="";
 const a=ensureAudio(),t=current();
 a.src=streamUrl(t.id);
 a.play().catch(()=>{data.message="Press play to start the music.";sync();});
 mediaSession(t);sync();
}
function playTrack(id){
 const base=shownTracks();
 const start=base.findIndex(t=>t.id===id);if(start<0)return;
 data.queue=data.shuffle?[base[start]].concat(shuffled(base.filter(t=>t.id!==id))):base;
 playAt(data.shuffle?0:start);
}
function playAll(){const base=shownTracks();if(!base.length)return;data.queue=data.shuffle?shuffled(base):base;playAt(0);}
function next(){if(data.index+1<data.queue.length)playAt(data.index+1);else{data.audio?.pause();data.message="End of the playlist.";sync();}}
function prev(){const a=data.audio;if(a&&a.currentTime>4){a.currentTime=0;return;}if(data.index>0)playAt(data.index-1);}
function toggle(){const a=data.audio;if(!a||!current())return playAll();if(a.paused)a.play().catch(()=>{});else a.pause();}
function setShuffle(on){data.shuffle=!!on;persist();sync();}
async function signOut(){data.loadGeneration++;data.loadAbort?.abort();if(data.loadTimer)clearInterval(data.loadTimer);data.loadTimer=null;stopScan();try{await fetch("/api/music/logout",{method:"POST",credentials:"same-origin"});}catch{}data.audio?.pause();data.tracks=[];data.queue=[];data.tags={};try{localStorage.removeItem(TAG_STORE);}catch{}data.index=-1;data.status="signedOut";sync();}
function loadingHtml(){
 return '<section class="music-load" aria-labelledby="musicLoadTitle"><div class="music-load-icon" aria-hidden="true">♫</div>'+
  '<h3 id="musicLoadTitle">Loading your music…</h3>'+
  '<p>Connecting to Google Drive and building your song library. Large folders can take a little longer.</p>'+
  '<div class="music-load-bar" role="progressbar" aria-label="Loading music from Google Drive" aria-valuetext="Loading; exact percentage is not available yet"><span></span></div>'+
  '<div class="music-load-meta"><span id="musicLoadElapsed">0s elapsed</span><span>Waiting for Google Drive</span></div>'+
  '<details class="music-load-details"><summary>Show loading details</summary><ol id="musicLoadLog"></ol></details>'+
  '<button type="button" class="btn btn-outline" data-music="retry">↻ Retry loading</button></section>';
}
function loadLog(message){
 const elapsed=Math.max(0,Math.floor((Date.now()-data.loadStarted)/1000));
 data.loadLog.push({elapsed,message});
 if(data.loadLog.length>16)data.loadLog.shift();
 const list=data.root?.querySelector("#musicLoadLog");
 if(list)list.innerHTML=data.loadLog.map(item=>'<li><time>'+item.elapsed+'s</time> '+esc(item.message)+'</li>').join("");
}
function loadTick(){
 if(data.status!=="loading")return;
 const elapsed=Math.max(0,Math.floor((Date.now()-data.loadStarted)/1000));
 const counter=data.root?.querySelector("#musicLoadElapsed");if(counter)counter.textContent=elapsed+"s elapsed";
 if(elapsed>=10&&data.loadNotice===0){
  data.loadNotice=1;loadLog("Still waiting for Google Drive to list the music folders.");
 }
 if(elapsed>=30&&data.loadNotice===1){
  data.loadNotice=2;loadLog("This is taking longer than usual. You can retry without signing in again.");
 }
}
async function load(){
 data.loadGeneration++;
 const generation=data.loadGeneration;
 data.loadAbort?.abort();
 if(data.loadTimer)clearInterval(data.loadTimer);
 const controller=new AbortController();
 data.loadAbort=controller;
 data.loadStarted=Date.now();data.loadDuration=0;data.loadNotice=0;data.loadLog=[];
 data.message="";data.status="loading";
 sync();
 loadLog(data.justSignedIn?"Google sign-in finished. Requesting your music library.":"Connecting to the music service and checking your sign-in.");
 data.justSignedIn=false;
 data.loadTimer=setInterval(loadTick,1000);
 // Google Drive can be slow with many nested folders, but should not hang forever.
 const timeout=setTimeout(()=>controller.abort(),90000);
 try{
  const r=await fetch("/api/music/tracks",{credentials:"same-origin",headers:{Accept:"application/json"},signal:controller.signal});
  if(generation!==data.loadGeneration)return;
  const type=r.headers.get("content-type")||"";
  if(!type.includes("application/json")){
   data.status="unavailable";data.message=MESSAGES.offline_host;
   loadLog("The music service did not return JSON. Please try the main Vercel site.");return;
  }
  const body=await r.json();
  if(generation!==data.loadGeneration)return;
  if(!r.ok&&!body.error)throw Error("Music service returned HTTP "+r.status);
  if(!body.configured){data.status="unavailable";data.message=MESSAGES.not_configured;loadLog("Music sign-in is not configured on the server.");}
  else if(!body.signedIn){data.status="signedOut";loadLog("Google sign-in is needed before songs can be listed.");}
  else if(body.error){data.status="error";data.message=MESSAGES[body.error]||MESSAGES.drive_error;loadLog("Google Drive couldn't complete the music listing ("+body.error+").");}
  else{
   const tracks=Array.isArray(body.tracks)?body.tracks:[];
   loadLog("Received "+tracks.length+" songs. Preparing your library.");
   data.tracks=tracks;data.truncated=!!body.truncated;
   const valid=new Map(data.tracks.map(t=>[t.id,t.size]));
   for(const [key,entry] of Object.entries(data.tags))if(valid.get(key)!==entry.size)delete data.tags[key];
   if(body.missingFolders>0)data.message="One of your music folders couldn't be opened with this Google account, so its songs aren't listed.";
   data.status="ready";
  }
 }catch(e){
  if(generation!==data.loadGeneration)return;
  data.status="error";
  data.message=e?.name==="AbortError"?"Google Drive took too long to respond. Please retry loading your songs.":"Couldn't contact the music service. Check your internet connection and try again.";
  loadLog(e?.name==="AbortError"?"Music request timed out after 90 seconds.":"Music request failed before the song list was available.");
 }finally{
  clearTimeout(timeout);
  if(generation===data.loadGeneration){
   if(data.loadTimer)clearInterval(data.loadTimer);
   data.loadTimer=null;data.loadAbort=null;
   data.loadDuration=Math.max(0,Math.round((Date.now()-data.loadStarted)/1000));
   sync();
  }
 }
}
function trackHtml(t,now){
 const d=info(t);
 const meta=[d.artist!=="Unknown artist"?d.artist:"",d.album!=="Unknown album"?d.album+(d.albumFromFolder?" (folder)":""):"",d.genre!=="Unknown genre"?d.genre:""].filter(Boolean).join(" · ");
 return '<li><button type="button" class="music-track'+(now?.id===t.id?' is-current':'')+'" data-music-track="'+esc(t.id)+'"><span class="music-track-title">'+esc(d.title)+'</span>'+(meta?'<span class="music-track-album">'+esc(meta)+'</span>':'')+'</button></li>';
}
function listHtml(){
 const items=shownTracks(),now=current();
 if(!items.length)return '<p class="music-empty">'+(data.tracks.length?"No songs match that search.":"No audio files were found in the music folder.")+'</p>';
 let shown=0;
 const markup=groups(items).map(([name,list])=>{
  const subset=list.slice(0,Math.max(0,data.visible-shown));shown+=subset.length;
  if(!subset.length)return "";
  const header=name?'<div class="music-group-heading"><h3>'+esc(name)+' <small>('+list.length+')</small></h3><button type="button" data-music-group="'+esc(name)+'">▶ Play group</button></div>':"";
  return '<section class="music-group">'+header+'<ol class="music-list">'+subset.map(t=>trackHtml(t,now)).join("")+'</ol></section>';
 }).join("");
 return '<div class="music-browse-scroll">'+markup+'</div>'+(items.length>shown?'<button type="button" class="btn btn-outline music-more" data-music="more">Show more songs ('+shown+' of '+items.length+')</button>':'');
}
function playGroup(name){
 const list=groups(shownTracks()).find(([key])=>key===name)?.[1]||[];
 if(!list.length)return;
 data.queue=data.shuffle?shuffled(list):list;
 playAt(0);
}
function setSort(value){if(!["title","artist","album","genre","folder"].includes(value))return;data.sort=value;data.visible=200;persist();sync();}
function setGroup(value){if(!["none","artist","album","genre","folder"].includes(value))return;data.group=value;data.visible=200;persist();sync();}

function sync(){
 const box=data.root,now=current();
 if(box){
  const body=box.querySelector("#musicBody");
  if(body){
   if(data.status==="loading"){if(!body.querySelector(".music-load"))body.innerHTML=loadingHtml();const list=body.querySelector("#musicLoadLog");if(list&&!list.children.length)list.innerHTML=data.loadLog.map(item=>'<li><time>'+item.elapsed+'s</time> '+esc(item.message)+'</li>').join("");loadTick();}
   else if(data.status==="signedOut")body.innerHTML='<p>Sign in with the Google account that holds your music. Songs stream from your Drive and nothing is copied to this site.</p><a class="btn btn-primary" href="/api/music/login">Sign in with Google to play music</a>';
   else if(data.status==="ready"){
    if(!body.querySelector("#musicList"))body.innerHTML='<div class="music-toolbar"><button type="button" class="btn btn-primary" data-music="all">▶ Play all</button><label class="music-shuffle"><input type="checkbox" id="musicShuffle"> Shuffle</label><label class="music-search"><span class="sr-only">Search songs</span><input type="search" id="musicFilter" placeholder="Search songs, artists, albums, genres or folders" autocomplete="off"></label><label class="music-sort">Sort by<select id="musicSort"><option value="title">Song title</option><option value="artist">Artist</option><option value="album">Album</option><option value="genre">Genre</option><option value="folder">Folder</option></select></label><label class="music-sort">Group by<select id="musicGroup"><option value="none">No grouping</option><option value="artist">Artist</option><option value="album">Album</option><option value="genre">Genre</option><option value="folder">Folder</option></select></label><button type="button" class="btn btn-outline" data-music="scan" id="musicScan">Read MP3 tags</button><button type="button" class="text-link" data-music="signout">Sign out</button></div><p class="music-scan-note" id="musicScanNote"></p><p class="music-count" id="musicCount" aria-live="polite"></p><div id="musicList"></div>';
    body.querySelector("#musicShuffle").checked=data.shuffle;
    const f=body.querySelector("#musicFilter");if(f&&f.value!==data.filter)f.value=data.filter;
    body.querySelector("#musicSort").value=data.sort;
    body.querySelector("#musicGroup").value=data.group;
    const toScan=pendingTags().length,scanButton=body.querySelector("#musicScan");
    scanButton.textContent=data.scanning?"Stop reading tags":"Read MP3 tags";
    scanButton.dataset.music=data.scanning?"stop":"scan";
    scanButton.disabled=!data.scanning&&!toScan;
    body.querySelector("#musicScanNote").textContent=data.scanning?"Reading song details: "+data.scanDone+" of "+data.scanTotal+" MP3 files. You can stop at any time.":"Artist names are estimated from filenames; album names use folders until tags are read. Genres are only available from MP3 tags. "+(toScan?toScan+" MP3 files haven't been checked.":"Available MP3 files have been checked.")+" No music is downloaded in full.";
    body.querySelector("#musicCount").textContent=shownTracks().length+" matching of "+data.tracks.length+" songs"+(data.truncated?" (Drive listing was capped)":"")+" · Loaded in "+data.loadDuration+"s";
    const target=body.querySelector("#musicList"),scroll=target.querySelector(".music-browse-scroll"),position=scroll?.scrollTop||0;
    target.innerHTML=listHtml();
    const nextScroll=target.querySelector(".music-browse-scroll");if(nextScroll)nextScroll.scrollTop=position;
   }else if(data.status==="error"||data.status==="unavailable")body.innerHTML='<div class="music-load-error"><h3>Couldn\'t load your music</h3><p>You can try again without changing your Google sign-in.</p><button type="button" class="btn btn-primary" data-music="retry">↻ Retry loading</button><details class="music-load-details"><summary>Show loading details</summary><ol>'+data.loadLog.map(item=>'<li><time>'+item.elapsed+'s</time> '+esc(item.message)+'</li>').join("")+'</ol></details></div>';
   else body.innerHTML="";
  }
  const msg=box.querySelector("#musicMessage");if(msg){msg.textContent=data.message;msg.hidden=!data.message;}
 }
 const mini=data.mini;
 if(mini){
  mini.hidden=!now;
  document.body.classList.toggle("music-active",!!now);
  if(now){
   mini.querySelector("#musicNowTitle").textContent=info(now).title;
   const t=mini.querySelector("#musicToggle");t.textContent=data.playing?"❚❚":"▶";t.setAttribute("aria-label",data.playing?"Pause music":"Play music");t.setAttribute("aria-pressed",String(data.playing));
  }
 }
}
function mount(){
 if(!w||!w.document)return;
 restore();
 data.root=document.getElementById("musicCooking");
 data.mini=document.getElementById("musicMini");
 const onClick=e=>{
  const t=e.target.closest("[data-music-track]");if(t)return playTrack(t.dataset.musicTrack);
  const g=e.target.closest("[data-music-group]");if(g)return playGroup(g.dataset.musicGroup);
  const b=e.target.closest("[data-music]");if(!b)return;
  ({all:playAll,retry:load,signout:signOut,toggle,next,prev,more:()=>{data.visible+=200;sync();},scan:scanTags,stop:stopScan,open:()=>{location.hash="media";setTimeout(()=>data.root?.scrollIntoView({behavior:"smooth",block:"start"}),60);}})[b.dataset.music]?.();
 };
 data.root?.addEventListener("click",onClick);
 data.mini?.addEventListener("click",onClick);
 data.root?.addEventListener("change",e=>{if(e.target.id==="musicShuffle")setShuffle(e.target.checked);if(e.target.id==="musicSort")setSort(e.target.value);if(e.target.id==="musicGroup")setGroup(e.target.value);});
 data.root?.addEventListener("input",e=>{if(e.target.id==="musicFilter"){data.filter=e.target.value;data.visible=200;sync();}});
 const status=new URLSearchParams(location.search).get("music");
 if(status){if(status==="signed_in")data.justSignedIn=true;else data.message=MESSAGES[status]||MESSAGES.error;try{history.replaceState(null,"",location.pathname+location.hash);}catch{}}
 if(data.root)load();
}
if(w&&w.document){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();}
const pause=()=>data.audio?.pause();
return {mount,load,loadingHtml,pause,playTrack,playAll,playGroup,next,prev,toggle,setShuffle,setSort,setGroup,scanTags,stopScan,shuffled,filtered,sorted,groups,listHtml,streamUrl,state:()=>({status:data.status,tracks:data.tracks.length,index:data.index,shuffle:data.shuffle,sort:data.sort,group:data.group,scanning:data.scanning,playing:data.playing,current:current()}),_data:data};
});
