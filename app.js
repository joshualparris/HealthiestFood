(() => {
"use strict";
const D = window.FOOD_DATA;
if (!D) { document.body.innerHTML = '<p role="alert">The recipe data could not load. Please refresh this page.</p>'; return; }
const KEY = "good-food-v6-progress";
const R = D.recipes, $ = (s, scope=document) => scope.querySelector(s), $$ = (s, scope=document) => Array.from(scope.querySelectorAll(s));
const escapeHTML = v => String(v).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const money = n => new Intl.NumberFormat("en-AU", {style:"currency",currency:"AUD"}).format(n);
const makeState = () => ({checked:[],days:[],finished:[],selected:"a"});
let state;
try { state = {...makeState(),...JSON.parse(localStorage.getItem(KEY)||"{}")}; } catch {state=makeState();}
if(!Array.isArray(state.checked))state.checked=[];if(!Array.isArray(state.days))state.days=[];if(!Array.isArray(state.finished))state.finished=[];
if(!state.prepped || typeof state.prepped!=="object" || Array.isArray(state.prepped))state.prepped={};
if(!state.cookPortions || typeof state.cookPortions!=="object" || Array.isArray(state.cookPortions))state.cookPortions={};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}};
const recipe=id=>R.find(r=>r.id===id)||R[0];
let selected=recipe(state.selected).id,servings=5,search="",shopFilter="remaining";
let cook=null;
let recipeType="all";
const T = window.FoodTimers;
const TIMER_KEY="good-food-cook-timers-v1";
let timers={};
try { timers=T.clean(JSON.parse(localStorage.getItem(TIMER_KEY)||"{}")); }catch{timers={};}
const firstTick=T.advance(timers,Date.now());
timers=firstTick.timers;
const pendingAlerts=new Set(firstTick.expired);
const saveTimers=()=>{try{localStorage.setItem(TIMER_KEY,JSON.stringify(timers));}catch{}};
saveTimers();
let lastCookRecipe=null;
let lastFocus=null, toastTimeout=null;
let wakeLock=null,wakeRequested=false;
async function releaseWakeLock(){
 wakeRequested=false;
 if(wakeLock){try{await wakeLock.release();}catch{} wakeLock=null;}
 updateWakeButton();
}
function updateWakeButton(){
 const b=$("#cookWakeLock");if(!b)return;
 b.textContent=wakeLock&&!wakeLock.released?"Screen awake: On":"Keep screen awake";
 b.setAttribute("aria-pressed",wakeLock&&!wakeLock.released?"true":"false");
 const note=$("#cookWakeNote");
 if(note)note.textContent=!navigator.wakeLock?"Screen wake lock unsupported here. Use your device screen-timeout setting.":wakeLock&&!wakeLock.released?"The browser is requesting an awake screen. It can be released by the phone, battery settings or changing tabs.":"Optional, only while this page is visible; not a background alarm.";
}
async function toggleWakeLock(){
 if(wakeLock&&!wakeLock.released){await releaseWakeLock();return;}
 if(!navigator.wakeLock){updateWakeButton();toast("Screen wake lock unavailable on this device");return;}
 wakeRequested=true;
 try{
  const sentinel=await navigator.wakeLock.request("screen");
  if(!wakeRequested||!cook){await sentinel.release();return;}
  wakeLock=sentinel;
  sentinel.addEventListener("release",()=>{if(wakeLock===sentinel)wakeLock=null;updateWakeButton();});
  updateWakeButton();
 }catch{wakeRequested=false;wakeLock=null;updateWakeButton();toast("Screen stay-awake request was declined");}
}
function toast(message){const t=$("#toast"); t.textContent=message;t.classList.add("show");clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>t.classList.remove("show"),3400);}
function setRoute(route){const target=["home","recipes","plan","shop","science","media","lab","guide","page"].includes(route)?route:"home"; if(location.hash!== "#"+target){location.hash=target;return}renderView(target);}
function renderView(route){const target=["home","recipes","plan","shop","science","media","lab","guide","page"].includes(route)?route:"home";
 $$(".view").forEach(v=>{const inactive=v.id!=="view-"+target;v.classList.toggle("hidden",inactive);v.hidden=inactive;v.inert=inactive;});
 $$("[data-route]").forEach(a=>{const active=a.dataset.route===target;a.classList.toggle("active",active);if(active)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");});
 $$(".mobile-nav button").forEach(b=>{const active=b.dataset.goto===target;b.classList.toggle("active",active);if(active)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");});
 if(target==="shop")renderShop();
 if(target==="plan")renderPlan();
 if(target==="recipes")renderDetail();
 if(target==="media")window.FoodMedia?.render();
 window.scrollTo({top:0,behavior:"instant"});
 document.title=(target==="home"?"Good Food, Long Game":target.charAt(0).toUpperCase()+target.slice(1)+" | Good Food, Long Game");
}
const RECIPE_PHOTOS=Object.freeze({"br-oats":"br-oats.webp","br-eggs":"br-eggs.webp","br-smoothie":"br-smoothie.webp","br-toast":"br-toast.webp","di-lentil":"di-lentil.webp","di-chicken":"di-chicken.webp","di-chilli":"di-chilli.webp","di-stirfry":"di-stirfry.webp","di-salmon":"di-salmon.webp","sn-hummus":"sn-hummus.webp"});
function recipePhoto(r,large=false){
 const file=RECIPE_PHOTOS[r.id];
 if(!file)return '';
 return '<img class="'+(large?'recipe-detail-photo':'recipe-card-image')+'" src="'+escapeHTML(file)+'" alt="Illustrative food photograph of '+escapeHTML(r.name)+'" loading="lazy" decoding="async">';
}
function artwork(r){
 const image=recipePhoto(r);
 return '<div class="recipe-card-visual '+escapeHTML(r.accent)+(image?' has-photo':'')+'"><span class="card-number">RECIPE '+escapeHTML(r.id.toUpperCase())+'</span>'+
 (image||'<div class="mini-plate"><span aria-hidden="true">'+escapeHTML(r.icon)+'</span></div>')+'</div>';
}
function card(r){return '<article class="recipe-card">'+artwork(r)+'<div class="card-content"><span class="card-overline">'+escapeHTML(r.label)+'</span><h3>'+escapeHTML(r.name)+'</h3><p>'+escapeHTML(r.description)+'</p><div class="card-meta"><span>◷ '+r.time+' min</span><span>◉ '+r.yield+' '+(r.yield===1?'meal':'meals')+'</span></div><div class="card-footer">Cook this recipe <span class="round-arrow" aria-hidden="true">↗</span></div></div><button class="recipe-click" data-select="'+r.id+'" aria-label="View recipe '+escapeHTML(r.name)+'"></button></article>'}
function renderCards(){
 $("#featuredCards").innerHTML=R.filter(r=>r.category==="lunch").map(card).join("");
 $("#recipeCards").innerHTML=R.filter(r=>recipeType==="all"||r.category===recipeType).map(card).join("");
 $$("[data-recipe-type]").forEach(b=>{const on=b.dataset.recipeType===recipeType;b.classList.toggle("is-active",on);b.setAttribute("aria-pressed",on?"true":"false");});
}
// The expanded detail is part of the same filtered collection, not a separate featured lunch.
function selectRecipe(id){
 const entry=R.find(r=>r.id===id);
 if(!entry)return false;
 selected=entry.id;
 state.selected=selected;
 servings=entry.yield;
 save();
 return true;
}
function changeRecipeType(type){
 if(!["all","breakfast","lunch","dinner","snack"].includes(type))return;
 recipeType=type;
 // Filtering cards alone leaves the old lunch expanded under Breakfasts.
 // Keep the detail in the selected category, preserving the chosen recipe when possible.
 if(type!=="all"&&recipe(selected).category!==type){
  const first=R.find(r=>r.category===type);
  if(first)selectRecipe(first.id);
 }
 renderCards();
 renderDetail();
}
function formatNum(n){return Number(n.toFixed(2)).toLocaleString("en-AU",{maximumFractionDigits:2});}
function renderDetail(){
 const r=recipe(selected),multiplier=servings/r.yield;
 const ing=r.ingredients.map(([amt,unit,name])=>'<li><span class="ingredient-amount">'+formatNum(amt*multiplier)+' '+escapeHTML(unit)+'</span><span>'+escapeHTML(name)+'</span></li>').join("");
 const steps=r.steps.map(s=>'<li><strong>'+escapeHTML(s.title)+'</strong><span class="method-preview-detail">'+escapeHTML(window.RecipeMethods.describe(r,s,servings))+'</span></li>').join("");
 $("#recipeDetail").innerHTML='<div class="detail-layout" id="selected-recipe"><div class="detail-left"><div class="detail-eyebrow">✳ &nbsp; RECIPE '+r.id.toUpperCase()+' · '+escapeHTML(r.label)+'</div><h2>'+escapeHTML(r.name)+'</h2><p>'+escapeHTML(r.description)+'</p>'+(RECIPE_PHOTOS[r.id]?'<figure class="recipe-detail-figure">'+recipePhoto(r,true)+'</figure>':'')+'<div class="detail-pills">'+r.tags.map(t=>'<span class="pill">'+escapeHTML(t)+'</span>').join("")+'</div><div class="detail-highlight"><strong>Nutrition note:</strong> '+escapeHTML(r.nutrition)+'</div><div class="detail-actions"><button class="btn btn-primary" data-start="'+r.id+'">Start guided cooking →</button><button class="btn btn-outline" data-add-to-shop="'+r.id+'" data-shop-portions="'+servings+'">Add '+servings+' '+(servings===1?'portion':'portions')+' to shopping list ↗</button><a class="btn btn-outline" href="cooking-methods.html?recipe='+encodeURIComponent(r.id)+'">Compare cooking methods ↗</a></div><div class="evidence-chip">'+(r.category==="lunch"?"Original V6 lunch quantities; nutrition totals are partial estimates.":"New adult recipe suggestions adapted from historical family plans; not kitchen or lab tested.")+'</div></div><div class="detail-right"><div class="servings-box"><span>SCALE THE RECIPE<br><small>Base yield: '+r.yield+' '+(r.yield===1?"portion":"portions")+'</small></span><div class="stepper"><button data-servings="-1" aria-label="Decrease servings">−</button><output aria-live="polite">'+servings+'</output><button data-servings="1" aria-label="Increase servings">+</button></div></div><h3>What you’ll need</h3><p>All quantities shown for '+servings+' '+(servings===1?'portion':'portions')+'. Changing this scales ingredients. Choose “Add to shopping list” to buy just these portions. Cooking times and equipment may still need adjusting.</p><ul class="ingredients-list">'+ing+'</ul><h3 style="margin-top:29px">The simple steps</h3><ol class="method-preview">'+steps+'</ol></div></div>';
 window.FoodMedia?.injectRecipe(r,$("#recipeDetail"));
 window.FoodTrial?.render(r);
}
const DAYS=["Monday","Tuesday","Wednesday","Thursday","Friday"];const WEEKS=[["a","c","b","d","a"],["c","b","d","a","c"],["b","d","a","c","b"],["d","a","c","b","d"]];
function renderPlan(){
 if(window.FoodPlanner){window.FoodPlanner.render();return;}
 $("#planGrid").innerHTML=WEEKS.map((w,wi)=>'<section class="week-card"><span>THE LONG GAME</span><h3>Week '+(wi+1)+'</h3>'+w.map((id,di)=>{let r=recipe(id),idx=wi*5+di,checked=state.days.includes(idx);return '<label class="plan-day '+(checked?'done':'')+'"><input type="checkbox" data-day="'+idx+'" '+(checked?'checked':'')+' aria-label="Mark '+DAYS[di]+' week '+(wi+1)+' lunch prepared"><div><span>'+DAYS[di]+' · Recipe '+id.toUpperCase()+'</span><strong>'+escapeHTML(r.name)+'</strong></div></label>';}).join("")+'</section>').join("");
}
function renderShop(){
 let chosen=state.checked;
 $("#shopTotal").textContent=money(D.shopping.reduce((sum,item)=>sum+item.price,0));
 $("#shopRemaining").textContent=money(D.shopping.reduce((sum,item,i)=>sum+(chosen.includes(i)?0:item.price),0));
 $("#shopProgress").textContent=chosen.length+' of '+D.shopping.length+' items ticked';
 const filtered=D.shopping.map((item,i)=>({...item,i})).filter(item=>(shopFilter==="all"||shopFilter==="checked"&&chosen.includes(item.i)||shopFilter==="remaining"&&!chosen.includes(item.i)) && (item.name+" "+item.use).toLowerCase().includes(search));
 const categories=["Proteins & legumes","Fresh produce","Frozen","Pantry & staples","Drinks"];
 $("#shoppingList").innerHTML=filtered.length?categories.map(cat=>{const group=filtered.filter(item=>item.category===cat);if(!group.length)return"";return '<section class="shop-group"><div class="shop-group-header"><h3>'+cat+'</h3><span>'+group.length+' items</span></div>'+group.map(item=>'<div class="shop-line '+(chosen.includes(item.i)?'is-checked':'')+'"><input class="shop-check" type="checkbox" data-item="'+item.i+'" '+(chosen.includes(item.i)?'checked':'')+' aria-label="Mark '+escapeHTML(item.name)+' as bought or already owned"><div><span class="shop-name">'+escapeHTML(item.buy)+' · '+escapeHTML(item.name)+'</span><div class="shop-usage">Use: '+escapeHTML(item.use)+'</div></div><div class="shop-price">'+money(item.price)+'<a href="'+escapeHTML(item.url)+'" target="_blank" rel="noopener noreferrer" aria-label="Open retailer listing for '+escapeHTML(item.name)+'">Check product ↗</a></div></div>').join("")+'</section>'}).join(""):'<div class="empty-state">All clear here! Change the filter or search to see other items. ✳</div>';
 $$("[data-filter]").forEach(b=>b.classList.toggle("is-active",b.dataset.filter===shopFilter));
}
function renderSources(){
 $("#sourceList").innerHTML=D.sources.map(src=>'<article class="source-row"><div><span>'+escapeHTML(src.type)+'</span><h3>'+escapeHTML(src.title)+'</h3><p>'+escapeHTML(src.why)+'</p></div><a target="_blank" rel="noopener noreferrer" href="'+escapeHTML(src.url)+'">Read source ↗</a></article>').join("");
}
// Independent step timers survive Next/Previous, modal close and page reload.
function currentTimerId(){return cook ? T.idFor(cook.id,cook.index) : null;}
function timerMetadata(id){
 const [recipeId,si]=id.split(":"),stepIndex=Number(si),r=recipe(recipeId),s=r.steps[stepIndex];
 return s ? {recipeId,stepIndex,title:s.title,durationSec:s.minutes*60}:null;
}
function updateTimerDisplays(){
 const now=Date.now();
 const id=currentTimerId(),t=id?timers[id]:null;
 const out=$("#timerClock");
 if(out && cook){ const step=recipe(cook.id).steps[cook.index];
   if(step)out.textContent=T.format(t?T.remaining(t,now):step.minutes*60);
 }
 const toggle=$("#timerToggle");
 if(toggle){toggle.textContent=t?(t.status==="running"?"Pause timer":t.status==="done"?"Restart timer":"Resume timer"):"Start timer";}
 const reset=$("#timerReset"); if(reset)reset.disabled=!t;
 for(const el of $$("[data-live-timer]")){
   const t=timers[el.dataset.liveTimer];
   if(t)el.textContent=t.status==="done"?"00:00 · Done":T.format(T.remaining(t,now));
 }
 const floating=$("#floatingTimers");
 if(floating){const total=Object.keys(timers).length;floating.classList.toggle("hidden",total===0||!!cook);
  const count=$("#floatingTimerCount");if(count)count.textContent=String(total);
 }
}
function renderTimerBoard(){
 const panel=$("#timerDashboard");
 if(!panel){updateTimerDisplays();return;}
 const entries=Object.values(timers).sort((a,b)=>["running","done","paused"].indexOf(a.status)-["running","done","paused"].indexOf(b.status) || a.recipeId.localeCompare(b.recipeId) || a.stepIndex-b.stepIndex);
 panel.classList.toggle("hidden",entries.length===0);
 panel.innerHTML=entries.length?'<div class="timer-board-head"><strong>◷ Your cooking timers <span>'+entries.length+'</span></strong><small>Each keeps counting when you move to another step · Swipe to see all</small></div><div class="timer-cards">'+entries.map(t=>{
   const name="Recipe "+t.recipeId.toUpperCase()+" · Step "+(t.stepIndex+1);
   return '<div class="timer-tile '+t.status+'" role="group" aria-label="'+escapeHTML(name+" "+t.title)+'"><div class="timer-tile-name">'+escapeHTML(name)+'</div><strong>'+escapeHTML(t.title)+'</strong><div class="timer-tile-bottom"><span class="timer-tile-clock" data-live-timer="'+escapeHTML(t.id)+'">'+T.format(T.remaining(t,Date.now()))+'</span><div class="timer-tile-actions"><button type="button" data-timer-action="'+(t.status==="running"?"pause":"start")+'" data-timer-id="'+escapeHTML(t.id)+'" aria-label="'+(t.status==="running"?"Pause":t.status==="done"?"Restart":"Resume")+' '+escapeHTML(t.title)+'">'+(t.status==="running"?"Ⅱ":t.status==="done"?"↻":"▶")+'</button><button type="button" data-timer-action="reset" data-timer-id="'+escapeHTML(t.id)+'" title="Reset timer" aria-label="Reset '+escapeHTML(t.title)+'">↺</button><button type="button" data-timer-action="dismiss" data-timer-id="'+escapeHTML(t.id)+'" title="Remove timer" aria-label="Remove '+escapeHTML(t.title)+'">×</button></div></div></div>';
 }).join("")+'</div><div class="timer-board-warning">These timers use real elapsed time. Phone lock-screen alarms are not guaranteed; use your phone Clock for unattended cooking.</div>':"";
 updateTimerDisplays();
}
function handleTimerAction(action,id){
 const meta=timerMetadata(id);
 if(action==="dismiss"){timers=T.remove(timers,id);pendingAlerts.delete(id);}
 else if(meta&&meta.durationSec>0){
   if(action==="start") {timers=T.start(timers,id,meta,Date.now());pendingAlerts.delete(id);}
   if(action==="pause")timers=T.pause(timers,id,Date.now());
   if(action==="reset"){timers=T.reset(timers,id,Date.now());pendingAlerts.delete(id);}
 }
 saveTimers();renderTimerBoard();
}
function timerTick(){
 const checked=T.advance(timers,Date.now());timers=checked.timers;
 if(checked.expired.length){checked.expired.forEach(id=>pendingAlerts.add(id));saveTimers();renderTimerBoard();}
 updateTimerDisplays();
 if(!document.hidden&&pendingAlerts.size){
  const labels=[...pendingAlerts].map(id=>timers[id]?.title||"Cooking timer");pendingAlerts.clear();
  toast(labels.length===1?"Timer finished: "+labels[0]+". Check your food.":labels.length+" cooking timers finished. Check the timer panel.");
 }
}
function openCook(id,stepIndex=0){
 lastFocus=document.activeElement;lastCookRecipe=id;
 const r=recipe(id);
 const requested=id===selected?servings:state.cookPortions[id];
 const portions=Number.isInteger(requested)&&requested>=1&&requested<=20?requested:r.yield;
 state.cookPortions[id]=portions;save();
 cook={id,index:Math.min(Math.max(0,stepIndex),r.steps.length-1),portions,safetyChecked:[]};
 $("#cookOverlay").classList.remove("hidden");
 document.body.classList.add("modal-open");
 renderCook();
 $("#closeCook")?.focus();
}
function closeCook(){
 cook=null;
 $("#cookOverlay").classList.add("hidden");
 document.body.classList.remove("modal-open");
 // No timer cancellation: countdowns remain available from the floating badge.
 void releaseWakeLock();
 updateTimerDisplays();
 if(lastFocus?.focus)lastFocus.focus();
}
function renderCook(){
 if(!cook)return;
 const r=recipe(cook.id),step=r.steps[cook.index],last=cook.index===r.steps.length-1;
 const h='<header class="cook-header"><div><span>YOUR KITCHEN COMPANION · RECIPE '+r.id.toUpperCase()+'</span><h2 id="cookHeading">'+escapeHTML(r.name)+'</h2></div><button class="cook-close" id="closeCook" aria-label="Close cooking guide">×</button></header>';
 const p='<div class="cook-track" aria-label="Cooking progress"><div style="width:'+Math.round((cook.index+1)/r.steps.length*100)+'%"></div></div>';
 const board='<section class="timer-dashboard hidden" id="timerDashboard" aria-label="Running, paused and finished cooking timers"></section>'+
 '<div class="cook-wake-control"><button type="button" id="cookWakeLock" aria-pressed="false">Keep screen awake</button><small id="cookWakeNote">Optional. This is not a background alarm.</small><a href="device-timer-check.html" target="_blank" rel="noopener noreferrer">Test this phone ↗</a></div>';
 if(cook.index>=r.steps.length){
  $("#cookContent").innerHTML=h+p+board+'<div class="cook-complete"><h3>Nearly finished</h3><p>Complete these real-world food safety reminders before marking this batch done. You can close and return without claiming the food is finished.</p>'+window.FoodSafety.render(r,cook.safetyChecked,cook.portions)+'<button id="finishCook" class="btn btn-primary" disabled>Confirm checks and finish ↗</button></div>';
  renderTimerBoard();updateWakeButton();return;
 }
 const ready=Array.isArray(state.prepped[r.id])?state.prepped[r.id].filter(n=>Number.isInteger(n)&&n>=0&&n<r.ingredients.length):[];
 const readySet=new Set(ready);
 const coolingNotice=window.FoodSafety.capacityWarning(r,cook.portions);
 const capacityMarkup=coolingNotice?'<aside class="cooling-capacity-note" role="note"><strong>Check your fridge before cooking</strong><p>'+escapeHTML(coolingNotice)+'</p><a href="https://www.foodauthority.nsw.gov.au/consumer/food-safety-home/entertaining-home" target="_blank" rel="noopener noreferrer">NSW Food Authority guidance ↗</a></aside>':'';
 const prep='<details class="cook-prep"><summary>Ingredient checklist · '+cook.portions+' '+(cook.portions===1?'portion':'portions')+' <span id="prepProgress">'+readySet.size+'/'+r.ingredients.length+' ready</span></summary><p>Check ingredients as you measure them. Quantities below and in each cooking step reflect your selected '+cook.portions+' portions. Cooking times, pan size and cooling capacity may need adjusting.</p><div class="cook-prep-list">'+r.ingredients.map(([amt,unit,name],i)=>'<label><input type="checkbox" data-prep-index="'+i+'"'+(readySet.has(i)?' checked':'')+'><span><strong>'+formatNum(amt*cook.portions/r.yield)+' '+escapeHTML(unit)+'</strong> '+escapeHTML(name)+'</span></label>').join('')+'</div><button type="button" id="resetPrep" class="timer-button">Clear ingredient checks</button></details>';
 const measured=window.RecipeMethods.stage(r,step,cook.portions);
 const stepQuantities='<section class="step-measures" aria-label="Measured ingredients for this step"><h4>Measure for this step</h4>'+(measured.length?'<ul>'+measured.map(row=>'<li><strong>'+escapeHTML(formatNum(row.amount)+(row.unit?" "+row.unit:""))+'</strong> '+escapeHTML(row.name)+'</li>').join("")+'</ul>':'<p>No new ingredients to measure. Use the ingredients prepared in earlier steps.</p>')+'</section>';
 $("#cookContent").innerHTML=h+p+board+'<div class="cook-body">'+capacityMarkup+prep+'<div class="cook-stepcount">STEP '+(cook.index+1)+' OF '+r.steps.length+'</div><h3 tabindex="-1" id="cookStepHeading">'+escapeHTML(step.title)+'</h3>'+stepQuantities+'<p>'+escapeHTML(window.RecipeMethods.describe(r,step,cook.portions))+'</p><div class="cook-scale-note">'+escapeHTML(window.RecipeScale.caution(r,cook.portions))+'</div><div class="cook-tip"><strong>✳</strong><span>'+escapeHTML(step.tip)+'</span></div>'+(step.minutes?'<div class="cook-timer"><div class="timer-display" id="timerClock" aria-live="off">'+T.format(step.minutes*60)+'</div><button class="timer-button" id="timerToggle">Start timer</button><button class="timer-button" id="timerReset">Reset</button><span class="timer-safety">Timers continue independently when you press Next. Check doneness and packet instructions.</span></div>':'<p class="evidence-chip" style="margin-top:20px">No countdown for this safety/finishing step.</p>')+'</div><footer class="cook-footer"><button class="btn btn-outline" id="prevStep" '+(cook.index===0?'disabled':'')+'>← Previous</button><button class="btn btn-primary" id="nextStep">'+(last?'Finish this batch ✓':'Next step →')+'</button></footer>';
 renderTimerBoard();updateWakeButton();
}
function stepChange(by){
 if(!cook)return;
 const n=cook.index+by,r=recipe(cook.id);
 if(n<0||n>r.steps.length)return;
 cook.index=n;
 // Moving between steps does not modify other timers.
 renderCook();
 $("#cookStepHeading")?.focus();
}
setInterval(timerTick,700);
document.addEventListener("visibilitychange",()=>{
 timerTick();
 if(!document.hidden&&wakeRequested&&cook&&!wakeLock){void toggleWakeLock();}
});
window.addEventListener("pageshow",timerTick);
function copyShop(){
 const toBuy=D.shopping.filter((_,i)=>!state.checked.includes(i));
 const content="WOOLWORTHS V6 · TO BUY (estimates, not live Dubbo prices)\n\n"+toBuy.map(item=>item.buy+" × "+item.name+" — "+money(item.price)+"\nUse: "+item.use).join("\n\n")+"\n\nEstimate remaining: "+money(toBuy.reduce((s,i)=>s+i.price,0))+"\nCheck labels and current shelf prices.";
 if(navigator.clipboard?.writeText){navigator.clipboard.writeText(content).then(()=>toast("Shopping list copied")).catch(()=>fallbackCopy(content));}else fallbackCopy(content);
}
function fallbackCopy(content){const t=document.createElement("textarea");t.value=content;document.body.append(t);t.select();try{document.execCommand("copy");toast("Shopping list copied");}catch{toast("Copy unavailable on this browser");}t.remove();}
function resetAll(){if(!confirm("Clear all saved shopping ticks and 20-day planning progress on this device?"))return;state=makeState();save();renderShop();renderPlan();toast("Progress reset");}
document.addEventListener("click",e=>{
 const nav=e.target.closest("[data-goto]");if(nav){setRoute(nav.dataset.goto);return}
 const typeBtn=e.target.closest("[data-recipe-type]");if(typeBtn){changeRecipeType(typeBtn.dataset.recipeType);return;}
 const choice=e.target.closest("[data-select]");if(choice){if(!selectRecipe(choice.dataset.select))return;if(recipeType!=="all"&&recipe(selected).category!==recipeType)recipeType=recipe(selected).category;renderCards();setRoute("recipes");renderDetail();setTimeout(()=>$("#selected-recipe")?.scrollIntoView({behavior:"smooth",block:"start"}),40);return}
 const scaled=e.target.closest("[data-servings]");if(scaled){servings=Math.max(1,Math.min(20,servings+Number(scaled.dataset.servings)));state.cookPortions[selected]=servings;save();renderDetail();return}
 const start=e.target.closest("[data-start]");if(start){openCook(start.dataset.start);return}
 if(e.target.closest("#jumpToShop")){setRoute("shop");return}
 if(e.target.closest("#closeCook")){closeCook();return}
 if(e.target.closest("#nextStep")){stepChange(1);return}
 if(e.target.closest("#prevStep")){stepChange(-1);return}
 if(e.target.closest("#resetPrep") && cook){delete state.prepped[cook.id];save();renderCook();return}
 if(e.target.closest("#cookWakeLock")){void toggleWakeLock();return}
 if(e.target.closest("#timerToggle")){const id=currentTimerId(),t=timers[id];if(id)handleTimerAction(t?.status==="running"?"pause":"start",id);return}
 if(e.target.closest("#timerReset")){const id=currentTimerId();if(id)handleTimerAction("reset",id);return}
 const timerButton=e.target.closest("[data-timer-action]");if(timerButton){handleTimerAction(timerButton.dataset.timerAction,timerButton.dataset.timerId);return}
 if(e.target.closest("#floatingTimers")){const first=Object.values(timers).sort((a,b)=>(a.status==="running"?0:a.status==="done"?1:2)-(b.status==="running"?0:b.status==="done"?1:2))[0];if(first)openCook(first.recipeId,first.stepIndex);return}
 if(e.target.closest("#finishCook")){if(!cook)return;const required=window.FoodSafety.checklist(recipe(cook.id),cook.portions);if(!required.every(x=>cook.safetyChecked.includes(x.id))){toast("Finish the food-safety checklist before marking the batch complete.");return;}if(!state.finished.includes(cook.id))state.finished.push(cook.id);save();closeCook();toast("Cook-up checklist acknowledged. Food safety depends on actual handling and temperatures.");return}
 if(e.target.closest("#copyShop")){copyShop();return}
 if(e.target.closest("#printShop")){window.print();return}
 if(e.target.closest("#resetProgress")){resetAll();return}
 const filter=e.target.closest("[data-filter]");if(filter){shopFilter=filter.dataset.filter;renderShop();}
});
document.addEventListener("change",e=>{
 if(e.target.matches("[data-cook-safety]")&&cook){
   const possible=window.FoodSafety.checklist(recipe(cook.id),cook.portions);const ids=new Set(possible.map(x=>x.id));
   const selected=e.target.dataset.cookSafety;if(!ids.has(selected))return;
   const next=new Set(cook.safetyChecked);
   if(e.target.checked)next.add(selected);else next.delete(selected);
   cook.safetyChecked=[...next];
   const remaining=possible.filter(x=>!next.has(x.id)).length;
   const status=$("#cookSafetyRemaining");if(status)status.textContent=remaining?remaining+" reminders not yet acknowledged":"All reminders acknowledged; use your own judgement about actual food safety.";
   const done=$("#finishCook");if(done)done.disabled=remaining!==0;
   return;
 }
 if(e.target.matches("[data-prep-index]") && cook){
  const n=Number(e.target.dataset.prepIndex),r=recipe(cook.id);
  if(!Number.isInteger(n)||n<0||n>=r.ingredients.length)return;
  const ready=new Set(Array.isArray(state.prepped[cook.id])?state.prepped[cook.id]:[]);
  if(e.target.checked)ready.add(n);else ready.delete(n);
  state.prepped[cook.id]=[...ready].filter(i=>Number.isInteger(i)&&i>=0&&i<r.ingredients.length);save();
  const progress=$("#prepProgress");if(progress)progress.textContent=state.prepped[cook.id].length+"/"+r.ingredients.length+" ready";
  return;
 }
 if(e.target.matches("[data-item]")){const n=Number(e.target.dataset.item);state.checked=e.target.checked?Array.from(new Set([...state.checked,n])):state.checked.filter(x=>x!==n);save();renderShop();}
 if(e.target.matches("[data-day]")){const n=Number(e.target.dataset.day);state.days=e.target.checked?Array.from(new Set([...state.days,n])):state.days.filter(x=>x!==n);save();renderPlan();}
});
$("#shopSearch").addEventListener("input",e=>{search=e.target.value.toLowerCase().trim();renderShop();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&cook){closeCook();return}if(e.key==="Tab"&&cook){const list=$("button:not(:disabled),input:not(:disabled),a[href],select:not(:disabled)",$("#cookOverlay")).filter(el=>el.getClientRects().length);if(list.length){const first=list[0],last=list[list.length-1];if(e.shiftKey&&document.activeElement===first){last.focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===last){first.focus();e.preventDefault();}}}});
window.addEventListener("hashchange",()=>renderView(location.hash.slice(1)));
servings=recipe(selected).yield;window.FoodDataBackup?.init();window.FoodTrial?.init();renderCards();renderDetail();renderPlan();renderShop();renderSources();window.FoodMedia?.init();window.FoodNutrition?.render();renderView(location.hash.slice(1));
})();
