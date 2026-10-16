/* DOM adapter for the separate, user-reported cumulative food time log.
   The UI does not read thermometers, infer food temperatures, or certify safety. */
(function(root,factory){const api=factory(root);if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.FoodHandlingUI=api;})(typeof window!=="undefined"?window:null,function(w){
"use strict";
const H=w?.FoodHandling,selector="#foodHandlingMount";
function store(){try{return w.localStorage}catch{return null}}
function read(recipeId){return H?.forRecipe(store(),recipeId)||null}
function ensure(recipeId){let b=read(recipeId);if(b)return b;b=H?.create(recipeId,Date.now());if(b){const data=H.parse(store());data[b.id]=b;H.persist(store(),data)}return b}
function current(){const node=document.querySelector(selector);if(!node)return null;const id=node.dataset.recipeId;const data=H.parse(store());return data[node.dataset.batchId]||read(id)}
function update(batch,show=true){
 const host=document.querySelector(selector);if(!host||!H)return;
 if(batch){const data=H.parse(store());data[batch.id]=batch;if(!H.persist(store(),data)){host.dataset.storageError="true"}host.dataset.batchId=batch.id}
 if(show)host.innerHTML=H.render(batch||current());
}
function mount(recipeId){
 if(!H||typeof document==="undefined")return;
 const content=document.getElementById("cookContent"),panel=content?.querySelector(".cook-body, .cook-complete");
 if(!panel)return;
 let host=content.querySelector(selector);
 if(!host){host=document.createElement("div");host.id="foodHandlingMount";host.className="handling-mount";panel.insertBefore(host,panel.firstChild)}
 host.dataset.recipeId=recipeId;
 const batch=ensure(recipeId);host.dataset.batchId=batch?.id||"";
 host.innerHTML='<details class="handling-details"><summary>Time outside refrigeration · optional manual safety log</summary>'+H.render(batch)+'</details>';
}
function status(){
 const b=current();return b?H.inspect(b):H.decision(null);
}
function act(action){
 const host=document.querySelector(selector);if(!host||!H)return;
 const b=current(),now=Date.now();let next=null;
 if(action==="new"){
  if(!confirm("Is this a genuinely DIFFERENT batch of food? Never reset the clock for the same food."))return;
  const data=H.parse(store());let when=now;while(data[host.dataset.recipeId+":"+when])when++;
  next=H.create(host.dataset.recipeId,when);
 }else if(action==="start")next=H.start(b,now);
 else if(action==="stop")next=H.stop(b,now);
 else if(action==="prior"){
  const value=Number(host.querySelector("#handlingPrior")?.value);
  if(Number.isInteger(value)&&value>0&&value<=10080)next=H.addPriorMinutes(b,value);
 }
 if(!next){const msg=host.querySelector("#handlingMessage");if(msg)msg.textContent="No change recorded. Enter valid minutes or check the last interval.";return}
 const details=host.querySelector("details"),open=!!details?.open;
 update(next,false);
 host.innerHTML='<details class="handling-details"'+(open?' open':'')+'><summary>Time outside refrigeration · optional manual safety log</summary>'+H.render(next)+'</details>';
 const message=host.querySelector("#handlingMessage");if(message&&host.dataset.storageError)message.textContent+=" The log could not be saved to this device; do not rely on its persistence.";
}
function clock(){
 const host=document.querySelector(selector);
 if(!host||!H||!host.querySelector("details")?.open)return;
 const currentInfo=status(),time=host.querySelector("#handlingElapsed"),badge=host.querySelector("#handlingStatus"),message=host.querySelector("#handlingMessage");
 if(time)time.textContent=H.formatted(currentInfo.minutes);
 if(badge){badge.textContent=currentInfo.title;badge.dataset.state=currentInfo.state}
 if(message)message.textContent=currentInfo.message;
}
if(w&&typeof document!=="undefined"){
 document.addEventListener("click",e=>{
  const btn=e.target.closest("#foodHandlingMount [data-handling-action]");
  if(btn){e.preventDefault();act(btn.dataset.handlingAction)}
 },true);
 // Explicit recorded four-hour discard result blocks claiming a completed batch.
 document.addEventListener("click",e=>{
  if(!e.target.closest("#finishCook"))return;
  const info=status();
  if(info.state==="discard"){
   e.preventDefault();e.stopImmediatePropagation();
   alert("Do not mark this batch finished or store it: the recorded 5–60°C exposure is four hours or more. Discard the food. A time log is not a thermometer.");
  }
 },true);
 setInterval(clock,2000);
}
return {mount,read,ensure,current,status,clock};
});
