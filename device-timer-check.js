/* Local-only phone-background diagnostics. No notifications or false lock detection. */
(()=>{
 "use strict";
 const T=window.FoodTimers; if(!T)return;
 const KEY="good-food-phone-timer-test-v1", RESULT="good-food-phone-timer-result-v1";
 const by=id=>document.getElementById(id);
 const idA="test-a:0",idB="test-b:0";
 let state={timers:{},logs:[],startedAt:null};
 function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||"{}");return x&&typeof x==="object"?{timers:T.clean(x.timers),logs:Array.isArray(x.logs)?x.logs.slice(-50):[],startedAt:x.startedAt||null}:state}catch{return state}}
 state=load();
 function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
 const log=(event)=>{state.logs.push({at:new Date().toISOString(),event,visibility:document.visibilityState});state.logs=state.logs.slice(-50);save()};
 function draw(){
  const checked=T.advance(state.timers,Date.now());state.timers=checked.timers;
  if(checked.expired.length)log("Expiry detected on an active script tick: "+checked.expired.join(", "));
  const one=state.timers[idA],two=state.timers[idB];
  for(const [t,k] of [[one,"A"],[two,"B"]]){
   by("clock"+k).textContent=t?T.format(T.remaining(t,Date.now())):k==="A"?"00:45":"01:30";
   by("state"+k).textContent=!t?"Not started":t.status==="done"?"Finished (observed on return or foreground)":
     t.status==="running"?"Running by wall-clock deadline":"Paused";
  }
  by("deviceStatus").textContent=!one&&!two?"No active test.":one?.status==="done"&&two?.status==="done"?
   "Both clocks reached zero. This does NOT prove an alarm ran during phone lock.":
   "Running. You can switch tabs, lock your phone or refresh.";
  by("deviceLog").textContent=JSON.stringify({startedAt:state.startedAt,visibility:document.visibilityState,
   browser:navigator.userAgent,logs:state.logs,feedback:localStorage.getItem(RESULT)||"not supplied"},null,2);
  save();
 }
 by("beginDeviceTest").addEventListener("click",()=>{
  const now=Date.now();
  state={timers:{},logs:[],startedAt:new Date(now).toISOString()};
  state.timers=T.start(state.timers,idA,{recipeId:"test-a",stepIndex:0,title:"Test A",durationSec:45},now);
  state.timers=T.start(state.timers,idB,{recipeId:"test-b",stepIndex:0,title:"Test B",durationSec:90},now);
  log("Both real-clock test timers started");draw();
 });
 by("clearDeviceTest").addEventListener("click",()=>{state={timers:{},logs:[],startedAt:null};log("Test reset");draw()});
 document.addEventListener("visibilitychange",()=>{log("Visibility changed");draw()});
 window.addEventListener("pageshow",()=>{log("Page shown");draw()});
 window.addEventListener("pagehide",()=>{log("Page hidden/unloaded");draw()});
 document.querySelectorAll('input[name="backgroundAlert"]').forEach(el=>el.addEventListener("change",()=>{
  try{localStorage.setItem(RESULT,el.value)}catch{}
  by("resultNote").textContent="Self-reported result saved on this device. For safety-critical cooking, use a separate alarm.";
  draw();
 }));
 try{const saved=localStorage.getItem(RESULT);if(saved)document.querySelector('input[name="backgroundAlert"][value="'+saved+'"]')?.setAttribute("checked","")}catch{}
 by("copyDeviceLog").addEventListener("click",()=>{
  const content=by("deviceLog").textContent;
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(content).then(()=>{by("copyDeviceLog").textContent="Copied ✓"}).catch(()=>{by("copyDeviceLog").textContent="Copy unavailable"});
 });
 window.setInterval(draw,1000);
 draw();
})();
