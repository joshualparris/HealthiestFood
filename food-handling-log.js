/* Cumulative handling-time log for potentially hazardous ready-to-eat food.
 * The 2-hour/4-hour rule is cumulative across all intervals 5°C–60°C;
 * recording a button click does not measure actual food temperature.
 * Sources:
 * https://www.foodauthority.nsw.gov.au/consumer/food-extra-care/leftovers
 * https://www.foodstandards.gov.au/business/food-safety/2-hour-4-hour-rule
 */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.FoodHandling=api;})(typeof window!=="undefined"?window:null,function(){
"use strict";
const KEY="good-food-cumulative-handling-v1",MAX_EVENTS=40,MAX_BATCHES=60;
const SOURCE="https://www.foodauthority.nsw.gov.au/consumer/food-extra-care/leftovers";
function num(v){return typeof v==="number"&&Number.isFinite(v)?v:null}
function clean(input){
 if(!input||typeof input!=="object"||Array.isArray(input))return null;
 const id=String(input.id||"");
 if(!/^[a-z][a-z0-9-]{0,40}:[0-9]{9,16}$/.test(id))return null;
 const events=[],raw=Array.isArray(input.events)?input.events:[];
 for(const e of raw.slice(0,MAX_EVENTS)){
   const start=num(e?.start),end=e?.end===null?null:num(e?.end);
   if(start===null||start<0||(e.end!==null&&end===null))return null;
   if(end!==null&&end<start)return null;
   if(events.length&&start<(events[events.length-1].end??Infinity))return null;
   if(events.length&&events[events.length-1].end===null)return null;
   events.push({start,end});
 }
 return {id,recipeId:id.split(":")[0],events,createdAt:num(input.createdAt)||Number(id.split(":")[1])};
}
function minutes(batch,now=Date.now()){
 if(!batch)return null;
 const b=clean(batch),clock=num(now);
 if(!b||clock===null)return null;
 let ms=0;
 for(const e of b.events){
   if(e.start>clock||((e.end??clock)>clock))return null;
   ms+=(e.end??clock)-e.start;
 }
 return ms/60000;
}
function decision(total){
 if(!Number.isFinite(total)||total<0)return {state:"unknown",title:"Time not established",message:"Do not infer safe storage from an unknown temperature history. Check actual time and temperature; when in doubt, discard."};
 if(total>=240)return {state:"discard",title:"Discard this food",message:"Recorded cumulative time at 5–60°C is four hours or more. Do not store or serve it."};
 if(total>=120)return {state:"use-now",title:"Use now; do not return to the fridge",message:"Recorded cumulative time at 5–60°C is between two and four hours. Use immediately or discard; do not refrigerate for later."};
 return {state:"under-two",title:"Under two hours recorded",message:"Food may be used now or promptly refrigerated IF accurate temperature/time observations and all other safety/cooling rules support it. The log is not proof of safety."};
}
function inspect(batch,now=Date.now()){
 const b=clean(batch),total=minutes(b,now),d=decision(total);
 return {...d,minutes:total,running:!!b?.events.length&&b.events[b.events.length-1].end===null};
}
function start(batch,now=Date.now()){
 const b=clean(batch),n=num(now);if(!b||n===null||n<0)return null;
 if(b.events.length>=MAX_EVENTS||inspect(b,n).running||b.events.some(e=>e.end!==null&&e.end>n))return null;
 return {...b,events:[...b.events,{start:n,end:null}]};
}
function stop(batch,now=Date.now()){
 const b=clean(batch),n=num(now);if(!b||n===null||!inspect(b,n).running)return null;
 const events=b.events.map((e,i)=>i===b.events.length-1?{start:e.start,end:n}:e);
 return {...b,events};
}
function create(recipeId,now=Date.now()){
 if(!/^[a-z][a-z0-9-]{0,40}$/.test(String(recipeId||""))||!Number.isFinite(now)||now<1000000000)return null;
 return {id:recipeId+":"+Math.floor(now),recipeId,createdAt:Math.floor(now),events:[]};
}
function parse(storage){
 let raw;try{raw=JSON.parse(storage.getItem(KEY)||"{}")}catch{return {}}
 if(!raw||typeof raw!=="object"||Array.isArray(raw))return {};
 const out={};
 for(const [id,v] of Object.entries(raw).slice(-MAX_BATCHES)){
   const c=clean(v);if(c&&c.id===id)out[id]=c;
 }
 return out;
}
function persist(storage,entries){
 if(!storage||typeof storage.setItem!=="function")return false;
 try{storage.setItem(KEY,JSON.stringify(Object.fromEntries(Object.entries(entries).slice(-MAX_BATCHES))));return true}catch{return false}
}
function forRecipe(storage,recipeId){
 const entries=parse(storage);
 return Object.values(entries).filter(x=>x.recipeId===recipeId).sort((a,b)=>b.createdAt-a.createdAt)[0]||null;
}
function formatted(n){return n===null?"Unknown":Math.floor(n/60)+"h "+String(Math.floor(n%60)).padStart(2,"0")+"m"}
function render(batch,now=Date.now()){
 const b=clean(batch),info=inspect(b,now),text=formatted(info.minutes);
 const esc=s=>String(s).replace(/[&<>"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));
 return '<section class="handling-log" aria-labelledby="handlingTitle"><h3 id="handlingTitle">Food temperature handling log</h3>'+
 '<p>For ready-to-eat foods that need temperature control. Manually mark each interval actually spent between <strong>5°C and 60°C</strong>. This clock is cumulative across preparation, transport and serving, even after refrigeration. This <strong>does not measure temperature</strong> and does not replace a probe or rapid-cooling guidance.</p>'+
 '<p class="handling-total"><strong id="handlingElapsed">'+esc(text)+'</strong> cumulative danger-zone time <span id="handlingStatus" data-state="'+esc(info.state)+'">'+esc(info.title)+'</span></p>'+
 '<p id="handlingMessage" class="handling-advice" role="status">'+esc(info.message)+'</p>'+
 '<div class="handling-actions"><button type="button" data-handling-action="'+(info.running?"stop":"start")+'">'+(info.running?"Stopped being in 5–60°C / safely temperature-controlled":"Start interval: food now 5–60°C")+'</button>'+
 '<button type="button" data-handling-action="new">Start a different batch log</button></div>'+
 '<small>Batch '+esc(b?.id||"not started")+'. Use only if you know the food temperature; unknown prior time must be added manually before relying on the result. A new batch must never reset exposure for the same food. <a target="_blank" rel="noopener noreferrer" href="'+SOURCE+'">NSW Food Authority 2-hour/4-hour guidance ↗</a></small></section>';
}
return {KEY,SOURCE,MAX_EVENTS,create,clean,minutes,inspect,decision,start,stop,parse,persist,forRecipe,render,formatted};
});
