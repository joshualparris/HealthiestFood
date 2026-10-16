/* Local-only meal schedule. Dates/times are civil dates in Australia/Sydney;
 * no timezone-incorrect UTC-toISOString for "today" and no invented optimal meal-time claim.
 */
(function(){
"use strict";
const ZONE="Australia/Sydney",KEY="good-food-dated-schedule-v1",D=window.FOOD_DATA;
const TYPES={breakfast:"Breakfast",snack:"Snack",lunch:"Lunch",dinner:"Dinner"};
const LABELS={breakfast:"🌅",snack:"🍓",lunch:"🥗",dinner:"🍲"};
const weekdays=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function today(now=new Date()){
 const parts=Object.fromEntries(new Intl.DateTimeFormat("en-GB",{timeZone:ZONE,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now).filter(p=>p.type!=="literal").map(p=>[p.type,p.value]));
 return parts.year+"-"+parts.month+"-"+parts.day;
}
function timeInSydney(now=new Date()){
 return new Intl.DateTimeFormat("en-GB",{timeZone:ZONE,hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(now);
}
function validDate(s){if(typeof s!=="string"||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(s))return false;const d=new Date(s+"T12:00:00Z");return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s;}
function shift(s,days){if(!validDate(s))throw Error("Invalid date");const d=new Date(s+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
function weekday(s){return new Date(s+"T12:00:00Z").getUTCDay();}
function monday(s){return shift(s,-((weekday(s)+6)%7));}
function format(s,opts={weekday:"short",day:"numeric",month:"short",year:"numeric"}){return new Intl.DateTimeFormat("en-AU",{timeZone:"UTC",...opts}).format(new Date(s+"T12:00:00Z"));}
function makeDefaults(day){
 const dow=weekday(day),lunchIds=["d","a","c","b","d","a","c"];
 return [
  {id:"breakfast-0",type:"breakfast",time:"07:30",recipeId:["br-oats","br-eggs","br-toast","br-smoothie"][dow%4],done:false},
  {id:"snack-0",type:"snack",time:"10:00",recipeId:"sn-hummus",done:false},
  {id:"lunch-0",type:"lunch",time:"12:30",recipeId:lunchIds[dow],done:false},
  {id:"snack-1",type:"snack",time:"15:30",recipeId:"sn-apple",done:false},
  {id:"dinner-0",type:"dinner",time:"18:00",recipeId:["di-lentil","di-chicken","di-chilli","di-stirfry","di-lentil","di-salmon","di-chicken"][dow],done:false}
 ];
}
function validTime(s){return typeof s==="string"&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s);}
function cleanSlots(value){if(!Array.isArray(value))return null;return value.filter(s=>s&&typeof s.id==="string"&&TYPES[s.type]&&validTime(s.time)&&D.recipes.some(r=>r.id===s.recipeId&&r.category===s.type)).slice(0,24).map(s=>({id:s.id.slice(0,70),type:s.type,time:s.time,recipeId:s.recipeId,done:!!s.done}));}
function load(){
 try{const raw=JSON.parse(localStorage.getItem(KEY)||"{}");if(!raw||typeof raw!=="object"||Array.isArray(raw))return {};const out={};for(const [k,v] of Object.entries(raw)){if(validDate(k)){const clean=cleanSlots(v);if(clean)out[k]=clean;}}return out;}catch{return {};}
}
function save(data){try{localStorage.setItem(KEY,JSON.stringify(data));return true;}catch{return false;}}
function escape(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function recipesOf(type){return D.recipes.filter(r=>r.category===type);}
function options(type,chosen){return recipesOf(type).map(r=>'<option value="'+escape(r.id)+'"'+(r.id===chosen?' selected':'')+'>'+escape(r.name)+'</option>').join("");}
let active=today(),data=load(),lastAutoToday=today(),message="";
function slotsFor(day){return (Object.hasOwn(data,day)?data[day]:makeDefaults(day)).map(s=>({...s}));}
function change(day,fn){const slots=slotsFor(day);fn(slots);data[day]=slots;const ok=save(data);message=ok?"Saved on this device":"Unable to save on this device (storage unavailable)";render();}
function badgeText(s,isToday,current){if(s.done)return "✓ Done";if(!isToday)return "Planned";if(s.time<current)return "Earlier";return "Upcoming";}
function render(){
 const root=document.getElementById("planGrid");if(!root)return;
 const now=today(),isToday=active===now,clock=timeInSydney();
 const weekStart=monday(active),week=Array.from({length:7},(_,i)=>shift(weekStart,i));
 const slots=slotsFor(active).sort((a,b)=>a.time.localeCompare(b.time)||a.id.localeCompare(b.id));
 const next=slots.find(s=>!s.done&&(isToday?s.time>=clock:true));
 const recipeById=id=>D.recipes.find(r=>r.id===id);
 root.classList.add("daily-planner");
 root.innerHTML=
 '<div class="planner-toolbar"><div><span class="section-kicker">DUBBO · AUSTRALIA/SYDNEY</span><h2 id="plannerHeading">'+escape(format(active,{weekday:"long",day:"numeric",month:"long",year:"numeric"}))+'</h2><p class="planner-description">'+(isToday?"Today · local time "+escape(clock):"Choose any date and customise its meals")+' · meal times are editable suggestions, not medical targets.</p></div>'+
 '<div class="planner-nav"><button type="button" data-planner="previous" aria-label="Previous day">←</button><label for="plannerDate">Choose date</label><input id="plannerDate" aria-label="Choose meal plan date" type="date" value="'+active+'"><button type="button" data-planner="next" aria-label="Next day">→</button><button type="button" data-planner="today" class="planner-today">Today</button></div></div>'+
 '<div class="planner-week" role="group" aria-label="Week of '+escape(format(weekStart))+'">'+week.map(d=>{const items=slotsFor(d);return '<button class="planner-weekday'+(d===active?" is-selected":"")+(d===now?" is-today":"")+'" type="button" data-plan-date="'+d+'" aria-pressed="'+(d===active?'true':'false')+'"><span>'+escape(format(d,{weekday:"short"}))+'</span><strong>'+escape(format(d,{day:"numeric"}))+'</strong><small>'+items.filter(s=>s.done).length+'/'+items.length+'</small></button>';}).join("")+'</div>'+
 '<div class="planner-day-summary"><div><strong>'+slots.filter(s=>s.done).length+' of '+slots.length+'</strong><span>meals marked done</span></div><div><strong>'+(next?escape(next.time):"—")+'</strong><span>'+(next?"next planned meal":"no upcoming meals")+'</span></div><div><strong>'+escape(format(active,{day:"numeric",month:"short"}))+'</strong><span>selected calendar day</span></div></div>'+
 '<div class="planner-slots">'+(slots.length?slots.map(s=>{const r=recipeById(s.recipeId);return '<article class="planner-slot'+(s.done?" is-done":"")+'" data-slot-id="'+escape(s.id)+'"><div class="planner-slot-head"><span class="planner-slot-icon" aria-hidden="true">'+LABELS[s.type]+'</span><strong>'+TYPES[s.type]+'</strong><span class="planner-slot-status">'+badgeText(s,isToday,clock)+'</span></div><div class="planner-slot-fields"><label>Time<input type="time" data-slot-time="'+escape(s.id)+'" value="'+escape(s.time)+'"></label><label>Meal<select data-slot-recipe="'+escape(s.id)+'">'+options(s.type,s.recipeId)+'</select></label></div><div class="planner-slot-actions"><button type="button" data-select="'+escape(s.recipeId)+'" class="planner-open">View recipe ↗</button><label class="planner-check"><input type="checkbox" data-slot-done="'+escape(s.id)+'"'+(s.done?" checked":"")+'> Done</label><button type="button" data-slot-remove="'+escape(s.id)+'" aria-label="Remove '+escape(TYPES[s.type])+' at '+escape(s.time)+'">Remove</button></div></article>';}).join(""):'<p>No meals scheduled. Add one below.</p>')+'</div>'+
 '<form class="planner-add" id="plannerAddForm"><h3>+ Schedule another meal</h3><div class="planner-add-fields"><label>Type<select id="plannerMealType">'+Object.entries(TYPES).map(([id,label])=>'<option value="'+id+'">'+label+'</option>').join("")+'</select></label><label>Meal<select id="plannerRecipe">'+options("breakfast","")+'</select></label><label>Time<input id="plannerTime" type="time" required value="08:00"></label><button class="btn btn-primary" type="submit">Add to '+escape(format(active,{weekday:"short",day:"numeric",month:"short"}))+'</button></div></form>'+
 '<div class="planner-bottom"><button type="button" class="btn btn-outline" data-planner="copy-tomorrow">Copy this day to tomorrow →</button><button type="button" data-planner="restore">Restore suggested day</button></div>'+
 '<p class="planner-message" role="status">'+escape(message||"Changes to dates, meals and times are saved in this browser on this device. No calendar account is connected.")+'</p>'+
 '<p class="planner-note">Start with these editable times: 7:30 breakfast, 10:00 snack, 12:30 lunch, 15:30 snack and 18:00 dinner. Eat according to your appetite, family and work routines; there is no proven single longevity-optimal meal clock. The Woolworths basket currently covers only the four V6 freezer lunches, not these added meals.</p>';
}
function changeDate(v){if(!validDate(v))return;active=v;message="";render();}
function init(){
 const root=document.getElementById("planGrid");if(!root)return;render();
 root.addEventListener("click",e=>{
 const day=e.target.closest("[data-plan-date]");if(day){changeDate(day.dataset.planDate);return;}
 const action=e.target.closest("[data-planner]");if(action){const a=action.dataset.planner;
  if(a==="previous")changeDate(shift(active,-1));if(a==="next")changeDate(shift(active,1));if(a==="today")changeDate(today());
  if(a==="restore"){if(!window.confirm("Restore suggested meals for "+format(active)+"? This replaces your edits on that day."))return;delete data[active];save(data);message="Suggested day restored";render();}
  if(a==="copy-tomorrow"){const future=shift(active,1);if(Object.hasOwn(data,future)&&!window.confirm("Replace the existing plan for "+format(future)+"?"))return;data[future]=slotsFor(active).map((s,i)=>({...s,id:"copy-"+i+"-"+Date.now(),done:false}));save(data);changeDate(future);message="Copied meals to tomorrow";render();}
  return;
 }
 const remove=e.target.closest("[data-slot-remove]");if(remove){change(active,s=>{const i=s.findIndex(x=>x.id===remove.dataset.slotRemove);if(i>=0)s.splice(i,1);});return;}
 });
 root.addEventListener("change",e=>{
 if(e.target.id==="plannerDate"){changeDate(e.target.value);return;}
 if(e.target.id==="plannerMealType"){const type=e.target.value;root.querySelector("#plannerRecipe").innerHTML=options(type,"");return;}
 for(const [selector,key] of [["data-slot-time","time"],["data-slot-recipe","recipeId"],["data-slot-done","done"]])if(e.target.hasAttribute(selector)){const id=e.target.getAttribute(selector),value=key==="done"?e.target.checked:e.target.value;
  if(key==="time"&&!validTime(value)){message="Please enter a valid time";render();return;}
  change(active,s=>{const entry=s.find(x=>x.id===id);if(entry)entry[key]=value;});return;
 }
 });
 root.addEventListener("submit",e=>{if(e.target.id!=="plannerAddForm")return;e.preventDefault();
 const type=root.querySelector("#plannerMealType").value,recipeId=root.querySelector("#plannerRecipe").value,tm=root.querySelector("#plannerTime").value;
 if(!TYPES[type]||!validTime(tm)||!recipesOf(type).some(r=>r.id===recipeId)){message="Choose a valid meal and time";render();return;}
 if(slotsFor(active).length>=24){message="Maximum 24 meals per day";render();return;}
 change(active,s=>s.push({id:"new-"+Date.now()+"-"+Math.round(Math.random()*1000000),type,recipeId,time:tm,done:false}));
 });
 // If user stays on this screen past Sydney midnight, move with the date only if they were following yesterday's today.
 window.setInterval(()=>{const n=today();if(n!==lastAutoToday){if(active===lastAutoToday)active=n;lastAutoToday=n;render();}else if(active===n&&root.closest(".view:not(.hidden)")){const clock=root.querySelector(".planner-description");if(clock&&clock.textContent.includes("Today")){const fresh="Today · local time "+timeInSydney();if(!clock.textContent.includes(fresh))render();}}},60000);
}
window.FoodPlannerCore={today,timeInSydney,validDate,validTime,shift,weekday,monday,makeDefaults};
window.FoodPlanner={render,init,selectDate:changeDate};
if(typeof document!=="undefined")init();
})();
