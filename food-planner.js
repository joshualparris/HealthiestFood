/* Local-only meal schedule. Dates/times are civil dates in Australia/Sydney;
 * no timezone-incorrect UTC-toISOString for "today" and no invented optimal meal-time claim.
 */
(function(){
"use strict";
const ZONE="Australia/Sydney",KEY="good-food-dated-schedule-v1",SHOP_KEY="good-food-plan-shopping-v1",D=window.FOOD_DATA;
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
 ].map(s=>({...s,portions:s.type==="dinner"?(D.recipes.find(r=>r.id===s.recipeId)?.yield||1):1}));
}
function validTime(s){return typeof s==="string"&&/^([01]\d|2[0-3]):[0-5]\d$/.test(s);}
function cleanSlots(value){if(!Array.isArray(value))return null;return value.filter(s=>s&&typeof s.id==="string"&&TYPES[s.type]&&validTime(s.time)&&D.recipes.some(r=>r.id===s.recipeId&&r.category===s.type)).slice(0,24).map(s=>({id:s.id.slice(0,70),type:s.type,time:s.time,recipeId:s.recipeId,portions:Number.isInteger(s.portions)&&s.portions>=1&&s.portions<=20?s.portions:(s.type==="dinner"?(D.recipes.find(r=>r.id===s.recipeId)?.yield||1):1),done:!!s.done}));}
function load(){
 try{const raw=JSON.parse(localStorage.getItem(KEY)||"{}");if(!raw||typeof raw!=="object"||Array.isArray(raw))return {};const out={};for(const [k,v] of Object.entries(raw)){if(validDate(k)){const clean=cleanSlots(v);if(clean)out[k]=clean;}}return out;}catch{return {};}
}
function save(data){try{localStorage.setItem(KEY,JSON.stringify(data));return true;}catch{return false;}}
function escape(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function recipesOf(type){return D.recipes.filter(r=>r.category===type);}
function options(type,chosen){return recipesOf(type).map(r=>'<option value="'+escape(r.id)+'"'+(r.id===chosen?' selected':'')+'>'+escape(r.name)+'</option>').join("");}
function loadShopChecks(){try{const val=JSON.parse(localStorage.getItem(SHOP_KEY)||"{}");return val&&typeof val==="object"&&!Array.isArray(val)?val:{}}catch{return {}}}
let active=today(),data=load(),lastAutoToday=today(),message="",shopChecks=loadShopChecks();
function saveShopChecks(){try{localStorage.setItem(SHOP_KEY,JSON.stringify(shopChecks));return true}catch{return false}}
function slotsFor(day){return (Object.hasOwn(data,day)?data[day]:makeDefaults(day)).map(s=>({...s}));}
function change(day,fn){const slots=slotsFor(day);fn(slots);data[day]=slots;const ok=save(data);message=ok?"Saved on this device":"Unable to save on this device (storage unavailable)";render();}
function weeklyPattern(days){
 let fishOccasions=0,lunchPortions=0,mainMeals=0;
 const fishIds=new Set(["a","b","di-salmon"]);
 for(const date of days){for(const slot of slotsFor(date)){
  if(slot.type==="lunch")lunchPortions+=slot.portions;
  if(slot.type==="lunch"||slot.type==="dinner")mainMeals++;
  if(fishIds.has(slot.recipeId))fishOccasions++;
 }}
 return {fishOccasions,lunchPortions,mainMeals};
}
function shoppingRows(days){
 const all=new Map();
 for(const day of days){for(const slot of slotsFor(day)){
  if(slot.done)continue; // already eaten meals are not new shopping requirements
  const r=D.recipes.find(x=>x.id===slot.recipeId);if(!r)continue;
  const multiplier=slot.portions/r.yield;
  for(const [amount,unit,name] of r.ingredients){
   const key=unit+"|"+name;
   const row=all.get(key)||{key,name,unit,amount:0};
   row.amount+=amount*multiplier;all.set(key,row);
  }
 }}
 return [...all.values()].sort((a,b)=>a.name.localeCompare(b.name));
}
function shoppingText(days){
 const rows=shoppingRows(days);
 const label=days.map(day=>format(day));
 const lines=[days.length===1?"INGREDIENTS FOR "+label[0]:"INGREDIENTS · WEEK "+label[0]+" TO "+label[label.length-1],"Amounts are for scheduled adult portions not yet marked done, not whole batch quantities. Round up to retail pack sizes; items are unpriced and stock is unverified.",""];
 for(const v of rows)lines.push((Math.round(v.amount*100)/100).toLocaleString("en-AU",{maximumFractionDigits:2})+" "+v.unit+" "+v.name);
 return lines.join("\\n").replace(/\\n/g,"\n");
}
function copyText(s){
 if(navigator.clipboard?.writeText){navigator.clipboard.writeText(s).then(()=>{message="Ingredient list copied to clipboard";render();}).catch(()=>fallbackCopy(s));}
 else fallbackCopy(s);
}
function fallbackCopy(s){
 const e=document.createElement("textarea");e.value=s;document.body.append(e);e.select();let ok=false;try{ok=document.execCommand("copy");}catch{}e.remove();message=ok?"Ingredient list copied":"Clipboard unavailable. Try another browser.";render();
}
function badgeText(s,isToday,current){if(s.done)return "✓ Done";if(!isToday)return "Planned";if(s.time<current)return "Earlier";return "Upcoming";}
function render(){
 const root=document.getElementById("planGrid");if(!root)return;
 const now=today(),isToday=active===now,clock=timeInSydney();
 const weekStart=monday(active),week=Array.from({length:7},(_,i)=>shift(weekStart,i));
 const slots=slotsFor(active).sort((a,b)=>a.time.localeCompare(b.time)||a.id.localeCompare(b.id));
 const pattern=weeklyPattern(week);
 const required=shoppingRows(week),checked=new Set(Array.isArray(shopChecks[weekStart])?shopChecks[weekStart]:[]);
 const checkedCount=required.filter(r=>checked.has(r.key)).length;
 const next=slots.find(s=>!s.done&&(isToday?s.time>=clock:true));
 const recipeById=id=>D.recipes.find(r=>r.id===id);
 root.classList.add("daily-planner");
 root.innerHTML=
 '<div class="planner-toolbar"><div><span class="section-kicker">DUBBO · AUSTRALIA/SYDNEY</span><h2 id="plannerHeading">'+escape(format(active,{weekday:"long",day:"numeric",month:"long",year:"numeric"}))+'</h2><p class="planner-description">'+(isToday?"Today · local time "+escape(clock):"Choose any date and customise its meals")+' · meal times are editable suggestions, not medical targets.</p></div>'+
 '<div class="planner-nav"><button type="button" data-planner="previous" aria-label="Previous day">←</button><label for="plannerDate">Choose date</label><input id="plannerDate" aria-label="Choose meal plan date" type="date" value="'+active+'"><button type="button" data-planner="next" aria-label="Next day">→</button><button type="button" data-planner="today" class="planner-today">Today</button></div></div>'+
 '<div class="planner-week" role="group" aria-label="Week of '+escape(format(weekStart))+'">'+week.map(d=>{const items=slotsFor(d);return '<button class="planner-weekday'+(d===active?" is-selected":"")+(d===now?" is-today":"")+'" type="button" data-plan-date="'+d+'" aria-pressed="'+(d===active?'true':'false')+'"><span>'+escape(format(d,{weekday:"short"}))+'</span><strong>'+escape(format(d,{day:"numeric"}))+'</strong><small>'+items.filter(s=>s.done).length+'/'+items.length+'</small></button>';}).join("")+'</div>'+
 '<div class="planner-day-summary"><div><strong>'+slots.filter(s=>s.done).length+' of '+slots.length+'</strong><span>meals marked done</span></div><div><strong>'+(next?escape(next.time):"—")+'</strong><span>'+(next?"next planned meal":"no upcoming meals")+'</span></div><div><strong>'+escape(format(active,{day:"numeric",month:"short"}))+'</strong><span>selected calendar day</span></div></div>'+
 '<section class="planner-pattern" aria-label="Week dietary pattern guidance"><h3>Nutrition across this week</h3><p><strong>'+pattern.fishOccasions+' scheduled fish meal occasions</strong> across seven days. For context, the Heart Foundation suggests fish about 2–3 times weekly: roughly 150 g fresh fish or 100 g tinned per serve. Occasions here are <em>not</em> calculated fish serves or proof of DHA/EPA adequacy; check actual portion sizes and other meals. <a href="https://www.heartfoundation.org.au/blog/not-eating-enough-fish" target="_blank" rel="noopener noreferrer">Fish serve sizes ↗</a></p><p><strong>'+pattern.lunchPortions+' adult lunch portions</strong> scheduled this week. The original freezer shopping list makes 20 V6 portions; it does not cover an unlimited seven-day recurring schedule. Adjust portions and shopping to your actual freezer stock.</p><p><strong>Snacks are optional:</strong> keep them if useful for hunger, energy or nutrient needs; otherwise remove them. These times are convenient defaults, not an ideal lifespan-optimising fasting window. <a href="longevity.html#timing">See research on meal timing ↗</a></p></section>'+ 
 '<div class="planner-slots">'+(slots.length?slots.map(s=>{const r=recipeById(s.recipeId);return '<article class="planner-slot'+(s.done?" is-done":"")+'" data-slot-id="'+escape(s.id)+'"><div class="planner-slot-head"><span class="planner-slot-icon" aria-hidden="true">'+LABELS[s.type]+'</span><strong>'+TYPES[s.type]+'</strong><span class="planner-slot-status">'+badgeText(s,isToday,clock)+'</span></div><div class="planner-slot-fields"><label>Time<input type="time" data-slot-time="'+escape(s.id)+'" value="'+escape(s.time)+'"></label><label>Portions<input type="number" min="1" max="20" step="1" data-slot-portions="'+escape(s.id)+'" value="'+escape(s.portions)+'"></label><label>Meal<select data-slot-recipe="'+escape(s.id)+'">'+options(s.type,s.recipeId)+'</select></label></div><div class="planner-slot-actions"><button type="button" data-select="'+escape(s.recipeId)+'" class="planner-open">View recipe ↗</button><label class="planner-check"><input type="checkbox" data-slot-done="'+escape(s.id)+'"'+(s.done?" checked":"")+'> Done</label><button type="button" data-slot-remove="'+escape(s.id)+'" aria-label="Remove '+escape(TYPES[s.type])+' at '+escape(s.time)+'">Remove</button></div></article>';}).join(""):'<p>No meals scheduled. Add one below.</p>')+'</div>'+
 '<form class="planner-add" id="plannerAddForm"><h3>+ Schedule another meal</h3><div class="planner-add-fields"><label>Type<select id="plannerMealType">'+Object.entries(TYPES).map(([id,label])=>'<option value="'+id+'">'+label+'</option>').join("")+'</select></label><label>Meal<select id="plannerRecipe">'+options("breakfast","")+'</select></label><label>Time<input id="plannerTime" type="time" required value="08:00"></label><label>Portions<input type="number" min="1" max="20" step="1" id="plannerPortions" value="1" required></label><button class="btn btn-primary" type="submit">Add to '+escape(format(active,{weekday:"short",day:"numeric",month:"short"}))+'</button></div></form>'+
 '<details class="planner-week-shopping"><summary>Weekly shopping checklist · <span id="planShoppingProgress">'+checkedCount+'/'+required.length+' ticked</span></summary><p>Combined ingredient amounts for this week’s meals not marked done. This is <strong>not a priced Woolworths basket</strong>; identical ingredient names are merged, but differing product descriptions still need checking. Tick what you already have or buy. Quantities update when your meal plan changes.</p><div class="planner-shopping-items">'+required.map(row=>'<label><input type="checkbox" data-plan-shop="'+escape(row.key)+'"'+(checked.has(row.key)?' checked':'')+'><span><strong>'+escape((Math.round(row.amount*100)/100).toLocaleString("en-AU",{maximumFractionDigits:2})+' '+row.unit)+'</strong> '+escape(row.name)+'</span></label>').join("")+'</div></details>'+
 '<div class="planner-bottom"><button type="button" data-planner="remove-snacks">Remove optional snacks from this day</button><button type="button" class="btn btn-outline" data-planner="copy-tomorrow">Copy this day to tomorrow →</button><button type="button" data-planner="copy-day-shopping">Copy day ingredients</button><button type="button" data-planner="copy-week-shopping">Copy week ingredients</button><button type="button" data-planner="restore">Restore suggested day</button></div>'+
 '<p class="planner-message" role="status">'+escape(message||"Changes to dates, meals and times are saved in this browser on this device. No calendar account is connected.")+'</p>'+
 '<p class="planner-note">Start with these editable times: 7:30 breakfast, 10:00 snack, 12:30 lunch, 15:30 snack and 18:00 dinner. Eat according to your appetite, family and work routines; there is no proven single longevity-optimal meal clock. The Woolworths basket currently covers only the four V6 freezer lunches, not these added meals.</p>';
 if(window.FoodShopping){const scope=[active,...week.filter(day=>day!==active)];window.FoodShopping.render(root,scope,slotsFor,D.recipes);}

}
function changeDate(v){if(!validDate(v))return;active=v;message="";render();}
function init(){
 const root=document.getElementById("planGrid");if(!root)return;render();
 root.addEventListener("click",e=>{
 if(window.FoodShopping?.handle(e,()=>render()))return;
 const day=e.target.closest("[data-plan-date]");if(day){changeDate(day.dataset.planDate);return;}
 const action=e.target.closest("[data-planner]");if(action){const a=action.dataset.planner;
  if(a==="previous")changeDate(shift(active,-1));if(a==="next")changeDate(shift(active,1));if(a==="today")changeDate(today());
  if(a==="restore"){if(!window.confirm("Restore suggested meals for "+format(active)+"? This replaces your edits on that day."))return;delete data[active];save(data);message="Suggested day restored";render();}
  if(a==="remove-snacks"){change(active,slots=>{for(let i=slots.length-1;i>=0;i--)if(slots[i].type==="snack")slots.splice(i,1);});message="Optional snacks removed from this day";return;}
  if(a==="copy-day-shopping"){copyText(shoppingText([active]));return;}
  if(a==="copy-week-shopping"){copyText(shoppingText(Array.from({length:7},(_,i)=>shift(monday(active),i))));return;}
  if(a==="copy-tomorrow"){const future=shift(active,1);if(Object.hasOwn(data,future)&&!window.confirm("Replace the existing plan for "+format(future)+"?"))return;data[future]=slotsFor(active).map((s,i)=>({...s,id:"copy-"+i+"-"+Date.now(),done:false}));save(data);changeDate(future);message="Copied meals to tomorrow";render();}
  return;
 }
 const remove=e.target.closest("[data-slot-remove]");if(remove){change(active,s=>{const i=s.findIndex(x=>x.id===remove.dataset.slotRemove);if(i>=0)s.splice(i,1);});return;}
 });
 root.addEventListener("change",e=>{
 if(window.FoodShopping?.handle(e,()=>render()))return;
 if(e.target.hasAttribute("data-plan-shop")){
  const week=monday(active),key=e.target.getAttribute("data-plan-shop");
  const required=shoppingRows(Array.from({length:7},(_,i)=>shift(week,i)));
  if(!required.some(r=>r.key===key))return;
  const check=new Set(Array.isArray(shopChecks[week])?shopChecks[week]:[]);
  if(e.target.checked)check.add(key);else check.delete(key);
  shopChecks[week]=[...check].slice(0,300);saveShopChecks();
  const el=root.querySelector("#planShoppingProgress");if(el)el.textContent=required.filter(r=>check.has(r.key)).length+"/"+required.length+" ticked";
  return;
 }
 if(e.target.id==="plannerDate"){changeDate(e.target.value);return;}
 if(e.target.id==="plannerMealType"){const type=e.target.value;root.querySelector("#plannerRecipe").innerHTML=options(type,"");const selected=recipesOf(type)[0];root.querySelector("#plannerPortions").value=type==="dinner"?(selected?.yield||1):1;return;}
 if(e.target.id==="plannerRecipe"){const r=D.recipes.find(x=>x.id===e.target.value);root.querySelector("#plannerPortions").value=r?.category==="dinner"?r.yield:1;return;}
 for(const [selector,key] of [["data-slot-time","time"],["data-slot-recipe","recipeId"],["data-slot-portions","portions"],["data-slot-done","done"]])if(e.target.hasAttribute(selector)){const id=e.target.getAttribute(selector),value=key==="done"?e.target.checked:key==="portions"?Number(e.target.value):e.target.value;
  if(key==="portions"&&(!Number.isInteger(value)||value<1||value>20)){message="Portions must be between 1 and 20";render();return;}
  if(key==="time"&&!validTime(value)){message="Please enter a valid time";render();return;}
  change(active,s=>{const entry=s.find(x=>x.id===id);if(entry)entry[key]=value;});return;
 }
 });
 root.addEventListener("submit",e=>{if(e.target.id!=="plannerAddForm")return;e.preventDefault();
 const type=root.querySelector("#plannerMealType").value,recipeId=root.querySelector("#plannerRecipe").value,tm=root.querySelector("#plannerTime").value,portions=Number(root.querySelector("#plannerPortions").value);
 if(!TYPES[type]||!validTime(tm)||!Number.isInteger(portions)||portions<1||portions>20||!recipesOf(type).some(r=>r.id===recipeId)){message="Choose a valid meal and time";render();return;}
 if(slotsFor(active).length>=24){message="Maximum 24 meals per day";render();return;}
 change(active,s=>s.push({id:"new-"+Date.now()+"-"+Math.round(Math.random()*1000000),type,recipeId,time:tm,portions,done:false}));
 });
 // If user stays on this screen past Sydney midnight, move with the date only if they were following yesterday's today.
 window.setInterval(()=>{const n=today();if(n!==lastAutoToday){if(active===lastAutoToday)active=n;lastAutoToday=n;render();}else if(active===n&&root.closest(".view:not(.hidden)")){const clock=root.querySelector(".planner-description");if(clock&&clock.textContent.includes("Today")){const fresh="Today · local time "+timeInSydney();if(!clock.textContent.includes(fresh))render();}}},60000);
}
window.FoodPlannerCore={today,timeInSydney,validDate,validTime,shift,weekday,monday,makeDefaults,weeklyPattern,shoppingText};
window.FoodPlanner={render,init,selectDate:changeDate};
if(typeof document!=="undefined")init();
})();
