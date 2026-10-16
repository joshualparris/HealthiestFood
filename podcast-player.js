/* Persistent in-page ABC podcast player. Audio streams directly from publisher's public RSS MP3 enclosures.
 * No rehosting. Audio session is kept alive when the mini-player collapses and as SPA tabs change.
 * Android/iOS background playback is ultimately controlled by the browser/operating system.
 */
(function(root,factory){const api=factory(root);if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.FoodPodcastPlayer=api;})(typeof window!=="undefined"?window:null,function(w){
"use strict";
const catalog=w?.FoodMediaData?.items.filter(x=>x.kind==="podcast")||[];
const streams=w?.FoodPodcastStreams?.episodes||{};
const esc=x=>String(x).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[ch]));
const validStream=url=>{try{const u=new URL(url);return u.protocol==="https:"&&(u.hostname==="mediacore-live-production.akamaized.net"||u.hostname==="abcmedia.akamaized.net")&&u.pathname.endsWith(".mp3");}catch{return false}};
const STORE="good-food-podcast-resume-v1";
const data={episode:null,audio:null,element:null,expanded:true,playing:false,error:"",dur:0,seekDragging:false,positions:{},volume:1};
const item=id=>catalog.find(x=>x.id===id)||null;
const fmt=t=>{if(!Number.isFinite(t)||t<0)return "0:00";const n=Math.floor(t);return Math.floor(n/3600)?Math.floor(n/3600)+":"+String(Math.floor(n%3600/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0"):Math.floor(n/60)+":"+String(n%60).padStart(2,"0")};
const order=()=>catalog.filter(x=>validStream(streams[x.id]?.url));
function persist(){try{localStorage.setItem(STORE,JSON.stringify({last:data.episode,positions:data.positions,speed:data.audio?.playbackRate||1}));}catch{}}
function restore(){try{const saved=JSON.parse(localStorage.getItem(STORE)||"{}");if(saved.positions&&typeof saved.positions==="object")data.positions=saved.positions;data.rememberedSpeed=[.75,1,1.25,1.5,1.75,2].includes(saved.speed)?saved.speed:1;}catch{data.rememberedSpeed=1;}}
function state(){return {episode:data.episode,playing:data.playing,expanded:data.expanded,error:data.error,available:order().length,total:catalog.length,currentTime:data.audio?.currentTime||0,duration:data.audio?.duration||0};}
function sync(){
 const box=data.element,a=data.audio,now=item(data.episode);
 if(!box)return;
 box.hidden=!now;
 document.body.classList.toggle("podcast-active",!!now);
 if(!now)return;
 const text=box.querySelector("#podcastTitle"),title=now.title||"Podcast";
 if(text)text.textContent=title;
 const meta=box.querySelector("#podcastMeta");if(meta)meta.textContent=now.publisher||"ABC Podcasts";
 const primary=box.querySelector("#podcastToggle");if(primary){primary.textContent=data.playing?"❚❚":"▶";primary.setAttribute("aria-label",data.playing?"Pause podcast":"Play podcast");primary.setAttribute("aria-pressed",String(data.playing));}
 const compact=box.querySelector("#podcastCompact");if(compact)compact.setAttribute("aria-expanded",String(data.expanded));
 const contents=box.querySelector("#podcastExpanded");if(contents)contents.hidden=!data.expanded;
 const time=box.querySelector("#podcastTime");if(time)time.textContent=fmt(a?.currentTime||0)+" / "+(Number.isFinite(a?.duration)?fmt(a.duration):"—");
 const progress=box.querySelector("#podcastSeek");if(progress&&a&&!data.seekDragging){const duration=Number.isFinite(a.duration)&&a.duration>0?a.duration:0;progress.value=duration?Math.round(a.currentTime/duration*1000):0;progress.disabled=!duration;}
 const speed=box.querySelector("#podcastSpeed");if(speed&&a)speed.value=String(a.playbackRate);
 const link=box.querySelector("#podcastSource");if(link)link.href=now.url;
 const err=box.querySelector("#podcastError");if(err){err.textContent=data.error;err.hidden=!data.error;}
}
function mediaSession(now){
 if(!("mediaSession" in navigator)||!now)return;
 try{
  navigator.mediaSession.metadata=new MediaMetadata({title:now.title,artist:now.publisher,album:"HealthiestFood · ABC podcast audio"});
  const action=(key,fn)=>{try{navigator.mediaSession.setActionHandler(key,fn);}catch{}};
  action("play",()=>resume());
  action("pause",()=>pause());
  action("stop",()=>stop());
  action("seekbackward",e=>seekDelta(-(e.seekOffset||15)));
  action("seekforward",e=>seekDelta(e.seekOffset||30));
  action("seekto",e=>seekTo(e.seekTime));
  action("previoustrack",()=>adjacent(-1));
  action("nexttrack",()=>adjacent(1));
 }catch{}
}
function updatePosition(){
 if(!("mediaSession" in navigator)||!navigator.mediaSession.setPositionState||!data.audio)return;
 const a=data.audio;
 if(Number.isFinite(a.duration)&&a.duration>0){try{navigator.mediaSession.setPositionState({duration:a.duration,playbackRate:a.playbackRate,position:Math.min(a.duration,a.currentTime||0)});}catch{}}
}
function rememberPosition(){if(!data.audio||!data.episode)return;const t=data.audio.currentTime;if(Number.isFinite(t)&&t>=0)data.positions[data.episode]=Math.round(t);persist();}
function makeAudio(){
 const a=new Audio();a.preload="metadata";a.playsInline=true;a.setAttribute("aria-hidden","true");
 a.addEventListener("play",()=>{data.playing=true;data.error="";sync();try{navigator.mediaSession.playbackState="playing";}catch{}});
 a.addEventListener("pause",()=>{data.playing=false;rememberPosition();sync();try{navigator.mediaSession.playbackState="paused";}catch{}});
 a.addEventListener("timeupdate",()=>{sync();if(Math.floor(a.currentTime)%10===0&&Math.floor(a.currentTime)!==data.lastSaved){data.lastSaved=Math.floor(a.currentTime);rememberPosition()}});
 a.addEventListener("loadedmetadata",()=>{
  const at=data.positions[data.episode];
  if(Number.isFinite(at)&&at>0&&at<a.duration-12){try{a.currentTime=at;}catch{}}
  sync();updatePosition();
 });
 a.addEventListener("durationchange",()=>{sync();updatePosition();});
 a.addEventListener("ratechange",()=>{updatePosition();sync();persist();});
 a.addEventListener("ended",()=>{data.positions[data.episode]=0;data.playing=false;persist();sync();});
 a.addEventListener("error",()=>{if(!data.episode)return;data.playing=false;data.error="The ABC audio stream is unavailable or has expired. Open the original episode to listen.";sync()});
 data.audio=a;document.body.appendChild(a);return a;
}
async function playEpisode(id){
 const now=item(id),stream=streams[id];
 if(!now)return false;
 if(!stream||!validStream(stream.url)){data.error="No verified ABC audio stream is available for this episode. Use the publisher link.";data.episode=id;data.expanded=true;sync();return false;}
 const a=data.audio||makeAudio();
 if(data.episode!==id){
  rememberPosition();a.pause();a.removeAttribute("src");
  data.episode=id;data.error="";data.lastSaved=-1;a.src=stream.url;a.playbackRate=data.rememberedSpeed||1;a.load();mediaSession(now);persist();
 }
 data.expanded=true;sync();
 return resume();
}
async function resume(){
 if(!data.audio||!data.episode)return false;
 try{await data.audio.play();data.error="";sync();return true}
 catch(e){data.playing=false;data.error=e?.name==="NotAllowedError"?"Tap Play again: your browser requires a direct touch to start audio.":"Playback could not start. The ABC stream may be unavailable on this browser.";sync();return false}
}
function pause(){data.audio?.pause();sync()}
function stop(){if(data.audio){data.audio.pause();rememberPosition();data.audio.removeAttribute("src");data.audio.load()}data.episode=null;data.playing=false;data.error="";persist();sync()}
function seekTo(t){const a=data.audio;if(!a||!Number.isFinite(a.duration)||!Number.isFinite(t))return;a.currentTime=Math.max(0,Math.min(a.duration,t));updatePosition();sync()}
function seekDelta(t){if(data.audio)seekTo(data.audio.currentTime+t)}
function adjacent(n){const all=order(),i=all.findIndex(x=>x.id===data.episode);if(!all.length)return false;return playEpisode(all[(i+n+all.length)%all.length].id)}
function collapse(){data.expanded=false;sync()}function expand(){data.expanded=true;sync()}
function mount(){
 if(!w||typeof document==="undefined"||data.element||!catalog.length)return;
 restore();
 const box=document.createElement("aside");box.id="podcastPlayer";box.className="podcast-player";box.hidden=true;
 box.setAttribute("aria-label","Persistent podcast audio player");
 box.innerHTML='<div class="podcast-mini"><div class="podcast-mini-icon" aria-hidden="true">♫</div><div class="podcast-mini-names"><strong id="podcastTitle">Podcast</strong><span id="podcastMeta">ABC Podcasts</span></div><button type="button" id="podcastToggle" class="podcast-main-play" aria-label="Play podcast">▶</button><button type="button" id="podcastCompact" class="podcast-minimise" aria-label="Expand or minimise the podcast player" aria-expanded="true">⌄</button></div>'+
 '<div id="podcastExpanded" class="podcast-expanded"><div class="podcast-times"><span id="podcastTime">0:00 / —</span><span>Audio from ABC</span></div><label for="podcastSeek" class="sr-only">Seek within podcast</label><input type="range" min="0" max="1000" step="1" value="0" id="podcastSeek" aria-label="Seek through the podcast" disabled>'+
 '<div class="podcast-controls"><button type="button" id="podcastPrev" aria-label="Previous podcast">|◀</button><button type="button" id="podcastBack" aria-label="Back 15 seconds">↶ 15</button><button type="button" id="podcastAhead" aria-label="Forward 30 seconds">30 ↷</button><button type="button" id="podcastNext" aria-label="Next podcast">▶|</button><label for="podcastSpeed">Speed</label><select id="podcastSpeed" aria-label="Podcast playback speed"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="1.75">1.75×</option><option value="2">2×</option></select></div>'+
 '<div class="podcast-bottom"><a id="podcastSource" target="_blank" rel="noopener noreferrer">ABC episode ↗</a><button type="button" id="podcastStop">Stop and close ×</button></div><p id="podcastError" class="podcast-error" role="alert" hidden></p></div>';
 document.body.appendChild(box);data.element=box;
 box.addEventListener("click",e=>{
  const btn=e.target.closest("button");if(!btn)return;
  switch(btn.id){
   case "podcastToggle":if(data.playing)pause();else resume();break;
   case "podcastCompact":data.expanded?collapse():expand();break;
   case "podcastBack":seekDelta(-15);break;
   case "podcastAhead":seekDelta(30);break;
   case "podcastPrev":adjacent(-1);break;
   case "podcastNext":adjacent(1);break;
   case "podcastStop":stop();break;
  }
 });
 const slider=box.querySelector("#podcastSeek");
 slider.addEventListener("input",e=>{data.seekDragging=true;const a=data.audio;if(a&&Number.isFinite(a.duration)&&a.duration>0){const s=box.querySelector("#podcastTime");if(s)s.textContent=fmt(Number(slider.value)/1000*a.duration)+" / "+fmt(a.duration);}});
 slider.addEventListener("change",()=>{data.seekDragging=false;if(data.audio)seekTo(Number(slider.value)/1000*data.audio.duration)});
 box.querySelector("#podcastSpeed").addEventListener("change",e=>{const rate=Number(e.target.value);if([.75,1,1.25,1.5,1.75,2].includes(rate)&&data.audio){data.audio.playbackRate=rate;data.rememberedSpeed=rate}});
 window.addEventListener("pagehide",rememberPosition);
 document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")rememberPosition();}); // IMPORTANT: never pause on hide
 sync();
}
if(w&&typeof document!=="undefined"){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();}
return {mount,playEpisode,resume,pause,stop,seekDelta,seekTo,adjacent,collapse,expand,state,item,validStream,order,fmt};
});
