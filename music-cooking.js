/* "Music while cooking": streams the owner's Google Drive MP3s through /api/music (Vercel only),
 * the same server-side OAuth + Range proxy design as JoshBooksOnline. The audio element lives
 * outside the views, so music keeps playing while you move between recipes, timers and tabs.
 */
(function(root,factory){const api=factory(root);if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.FoodMusic=api;})(typeof window!=="undefined"?window:null,function(w){
"use strict";
const STORE="good-food-music-v1";
const esc=x=>String(x).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));
const data={tracks:[],queue:[],index:-1,status:"idle",message:"",shuffle:false,playing:false,filter:"",audio:null,root:null,mini:null};
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
function filtered(tracks,text){const q=String(text||"").trim().toLowerCase();return q?tracks.filter(t=>(t.title+" "+(t.album||"")).toLowerCase().includes(q)):tracks;}
const streamUrl=id=>"/api/music/stream?id="+encodeURIComponent(id);
const current=()=>data.queue[data.index]||null;
function persist(){try{localStorage.setItem(STORE,JSON.stringify({shuffle:data.shuffle}));}catch{}}
function restore(){try{data.shuffle=JSON.parse(localStorage.getItem(STORE)||"{}").shuffle===true;}catch{}}
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
 try{navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:t.album||"My music",album:"HealthiestFood · Music while cooking"});
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
 const base=filtered(data.tracks,data.filter);
 const start=base.findIndex(t=>t.id===id);if(start<0)return;
 data.queue=data.shuffle?[base[start]].concat(shuffled(base.filter(t=>t.id!==id))):base;
 playAt(data.shuffle?0:start);
}
function playAll(){const base=filtered(data.tracks,data.filter);if(!base.length)return;data.queue=data.shuffle?shuffled(base):base;playAt(0);}
function next(){if(data.index+1<data.queue.length)playAt(data.index+1);else{data.audio?.pause();data.message="End of the playlist.";sync();}}
function prev(){const a=data.audio;if(a&&a.currentTime>4){a.currentTime=0;return;}if(data.index>0)playAt(data.index-1);}
function toggle(){const a=data.audio;if(!a||!current())return playAll();if(a.paused)a.play().catch(()=>{});else a.pause();}
function setShuffle(on){data.shuffle=!!on;persist();sync();}
async function signOut(){try{await fetch("/api/music/logout",{method:"POST",credentials:"same-origin"});}catch{}data.audio?.pause();data.tracks=[];data.queue=[];data.index=-1;data.status="signedOut";sync();}
async function load(){
 data.status="loading";sync();
 try{
  const r=await fetch("/api/music/tracks",{credentials:"same-origin",headers:{Accept:"application/json"}});
  const type=r.headers.get("content-type")||"";
  if(!type.includes("application/json")){data.status="unavailable";data.message=MESSAGES.offline_host;return sync();}
  const body=await r.json();
  if(!body.configured){data.status="unavailable";data.message=MESSAGES.not_configured;}
  else if(!body.signedIn){data.status="signedOut";}
  else if(body.error){data.status="error";data.message=MESSAGES[body.error]||MESSAGES.drive_error;}
  else{data.status="ready";data.tracks=Array.isArray(body.tracks)?body.tracks:[];data.truncated=!!body.truncated;if(body.missingFolders>0)data.message="One of your music folders couldn't be opened with this Google account, so its songs aren't listed.";}
 }catch{data.status="unavailable";data.message=MESSAGES.offline_host;}
 sync();
}
function listHtml(){
 const items=filtered(data.tracks,data.filter),now=current();
 if(!items.length)return '<p class="music-empty">'+(data.tracks.length?"No songs match that search.":"No audio files were found in the music folder.")+'</p>';
 return '<ol class="music-list">'+items.slice(0,400).map(t=>'<li><button type="button" class="music-track'+(now&&now.id===t.id?' is-current':'')+'" data-music-track="'+esc(t.id)+'"><span class="music-track-title">'+esc(t.title)+'</span>'+(t.album?'<span class="music-track-album">'+esc(t.album)+'</span>':'')+'</button></li>').join("")+'</ol>'+(items.length>400?'<p class="music-empty">Showing the first 400 songs. Search to find others.</p>':'');
}
function sync(){
 const box=data.root,now=current();
 if(box){
  const body=box.querySelector("#musicBody");
  if(body){
   if(data.status==="loading")body.innerHTML='<p class="music-empty">Loading your music from Google Drive…</p>';
   else if(data.status==="signedOut")body.innerHTML='<p>Sign in with the Google account that holds your music. Songs stream from your Drive and nothing is copied to this site.</p><a class="btn btn-primary" href="/api/music/login">Sign in with Google to play music</a>';
   else if(data.status==="ready"){
    if(!body.querySelector("#musicList"))body.innerHTML='<div class="music-toolbar"><button type="button" class="btn btn-primary" data-music="all">▶ Play all</button><label class="music-shuffle"><input type="checkbox" id="musicShuffle"> Shuffle</label><label class="music-search"><span class="sr-only">Search songs</span><input type="search" id="musicFilter" placeholder="Search songs, artists or folders" autocomplete="off"></label><button type="button" class="text-link" data-music="signout">Sign out</button></div><p class="music-count" id="musicCount" aria-live="polite"></p><div id="musicList"></div>';
    body.querySelector("#musicShuffle").checked=data.shuffle;
    const f=body.querySelector("#musicFilter");if(f&&f.value!==data.filter)f.value=data.filter;
    body.querySelector("#musicCount").textContent=data.tracks.length+" songs"+(data.truncated?" (large library: list was capped)":"");
    body.querySelector("#musicList").innerHTML=listHtml();
   }else body.innerHTML="";
  }
  const msg=box.querySelector("#musicMessage");if(msg){msg.textContent=data.message;msg.hidden=!data.message;}
 }
 const mini=data.mini;
 if(mini){
  mini.hidden=!now;
  document.body.classList.toggle("music-active",!!now);
  if(now){
   mini.querySelector("#musicNowTitle").textContent=now.title;
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
  const b=e.target.closest("[data-music]");if(!b)return;
  ({all:playAll,signout:signOut,toggle,next,prev,open:()=>{location.hash="media";setTimeout(()=>data.root?.scrollIntoView({behavior:"smooth",block:"start"}),60);}})[b.dataset.music]?.();
 };
 data.root?.addEventListener("click",onClick);
 data.mini?.addEventListener("click",onClick);
 data.root?.addEventListener("change",e=>{if(e.target.id==="musicShuffle")setShuffle(e.target.checked);});
 data.root?.addEventListener("input",e=>{if(e.target.id==="musicFilter"){data.filter=e.target.value;const list=data.root.querySelector("#musicList");if(list)list.innerHTML=listHtml();}});
 const status=new URLSearchParams(location.search).get("music");
 if(status){if(status!=="signed_in")data.message=MESSAGES[status]||MESSAGES.error;try{history.replaceState(null,"",location.pathname+location.hash);}catch{}}
 if(data.root)load();
}
if(w&&w.document){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();}
const pause=()=>data.audio?.pause();
return {mount,load,pause,playTrack,playAll,next,prev,toggle,setShuffle,shuffled,filtered,streamUrl,state:()=>({status:data.status,tracks:data.tracks.length,index:data.index,shuffle:data.shuffle,playing:data.playing,current:current()}),_data:data};
});
