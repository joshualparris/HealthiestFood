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
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state));}catch{}};
const recipe=id=>R.find(r=>r.id===id)||R[0];
let selected=recipe(state.selected).id,servings=5,search="",shopFilter="remaining";
let cook=null,timerRemaining=0,timerRunning=false,timerInterval=null,timerDeadline=0;
let lastFocus=null, toastTimeout=null;
function toast(message){const t=$("#toast"); t.textContent=message;t.classList.add("show");clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>t.classList.remove("show"),3400);}
function setRoute(route){const target=["home","recipes","plan","shop","science"].includes(route)?route:"home"; if(location.hash!== "#"+target){location.hash=target;return}renderView(target);}
function renderView(route){const target=["home","recipes","plan","shop","science"].includes(route)?route:"home";
 $$(".view").forEach(v=>v.classList.toggle("hidden",v.id!=="view-"+target));
 $$("[data-route]").forEach(a=>{const active=a.dataset.route===target;a.classList.toggle("active",active);if(active)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");});
 $$(".mobile-nav button").forEach(b=>b.classList.toggle("active",b.dataset.goto===target));
 if(target==="shop")renderShop();
 if(target==="plan")renderPlan();
 if(target==="recipes")renderDetail();
 window.scrollTo({top:0,behavior:"instant"});
 document.title=(target==="home"?"Good Food, Long Game":target.charAt(0).toUpperCase()+target.slice(1)+" | Good Food, Long Game");
}
function artwork(r){return '<div class="recipe-card-visual '+escapeHTML(r.accent)+'"><span class="card-number">RECIPE '+escapeHTML(r.id.toUpperCase())+'</span><div class="mini-plate"><span aria-hidden="true">'+escapeHTML(r.icon)+'</span></div></div>';}
function card(r){return '<article class="recipe-card">'+artwork(r)+'<div class="card-content"><span class="card-overline">'+escapeHTML(r.label)+'</span><h3>'+escapeHTML(r.name)+'</h3><p>'+escapeHTML(r.description)+'</p><div class="card-meta"><span>◷ '+r.time+' min</span><span>◉ '+r.yield+' meals</span></div><div class="card-footer">Cook this recipe <span class="round-arrow" aria-hidden="true">↗</span></div></div><button class="recipe-click" data-select="'+r.id+'" aria-label="View recipe '+escapeHTML(r.name)+'"></button></article>'}
function renderCards(){$("#featuredCards").innerHTML=R.map(card).join("");$("#recipeCards").innerHTML=R.map(card).join("");}
function formatNum(n){return Number(n.toFixed(2)).toLocaleString("en-AU",{maximumFractionDigits:2});}
function renderDetail(){
 const r=recipe(selected),multiplier=servings/r.yield;
 const ing=r.ingredients.map(([amt,unit,name])=>'<li><span class="ingredient-amount">'+formatNum(amt*multiplier)+' '+escapeHTML(unit)+'</span><span>'+escapeHTML(name)+'</span></li>').join("");
 const steps=r.steps.map(s=>'<li>'+escapeHTML(s.title)+'</li>').join("");
 $("#recipeDetail").innerHTML='<div class="detail-layout" id="selected-recipe"><div class="detail-left"><div class="detail-eyebrow">✳ &nbsp; RECIPE '+r.id.toUpperCase()+' · '+escapeHTML(r.label)+'</div><h2>'+escapeHTML(r.name)+'</h2><p>'+escapeHTML(r.description)+'</p><div class="detail-pills">'+r.tags.map(t=>'<span class="pill">'+escapeHTML(t)+'</span>').join("")+'</div><div class="detail-highlight"><strong>Nutrition note:</strong> '+escapeHTML(r.nutrition)+'</div><div class="detail-actions"><button class="btn btn-primary" data-start="'+r.id+'">Start guided cooking →</button><button class="btn btn-outline" id="jumpToShop">See shopping list ↗</button></div><div class="evidence-chip">Ingredient quantities transcribed from V6; some nutritional totals are partial estimates.</div></div><div class="detail-right"><div class="servings-box"><span>SCALE THE RECIPE<br><small>Base yield: 5 lunches</small></span><div class="stepper"><button data-servings="-1" aria-label="Decrease servings">−</button><output aria-live="polite">'+servings+'</output><button data-servings="1" aria-label="Increase servings">+</button></div></div><h3>What you’ll need</h3><p>All quantities shown for '+servings+' '+(servings===1?'portion':'portions')+'. Changing this scales the recipe ingredients, not the separate 20-lunch shopping list. Times and oven capacity may also need adjustment.</p><ul class="ingredients-list">'+ing+'</ul><h3 style="margin-top:29px">The simple steps</h3><ol class="method-preview">'+steps+'</ol></div></div>';
}
const DAYS=["Monday","Tuesday","Wednesday","Thursday","Friday"];const WEEKS=[["a","c","b","d","a"],["c","b","d","a","c"],["b","d","a","c","b"],["d","a","c","b","d"]];
function renderPlan(){
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
function timerClear(){clearInterval(timerInterval);timerInterval=null;timerRunning=false;}
function timerShow(){const out=$("#timerClock");if(out)out.textContent=String(Math.floor(timerRemaining/60)).padStart(2,"0")+":"+String(timerRemaining%60).padStart(2,"0");const b=$("#timerToggle");if(b)b.textContent=timerRunning?"Pause timer":"Start timer";}
function timerTick(){timerRemaining=Math.max(0,Math.ceil((timerDeadline-Date.now())/1000));timerShow();if(timerRemaining===0){timerClear();toast("Timer finished! Check the food is properly cooked.");timerShow();}}
function timerStart(){if(timerRunning)return;timerRunning=true;timerDeadline=Date.now()+timerRemaining*1000;timerInterval=setInterval(timerTick,250);timerShow();}
function timerPause(){if(!timerRunning)return;timerTick();timerClear();timerShow();}
function timerReset(){timerClear();if(cook)timerRemaining=recipe(cook.id).steps[cook.index].minutes*60;timerShow();}
function timerLoad(){timerClear();timerRemaining=recipe(cook.id).steps[cook.index]?.minutes*60||0;}
function openCook(id){lastFocus=document.activeElement;cook={id,index:0};timerLoad();$("#cookOverlay").classList.remove("hidden");document.body.classList.add("modal-open");renderCook();}
function closeCook(){timerClear();cook=null;$("#cookOverlay").classList.add("hidden");document.body.classList.remove("modal-open");if(lastFocus?.focus)lastFocus.focus();}
function renderCook(){
 if(!cook)return;const r=recipe(cook.id), step=r.steps[cook.index],last=cook.index===r.steps.length-1;
 const h='<header class="cook-header"><div><span>YOUR KITCHEN COMPANION · RECIPE '+r.id.toUpperCase()+'</span><h2 id="cookHeading">'+escapeHTML(r.name)+'</h2></div><button class="cook-close" id="closeCook" aria-label="Close cooking guide">×</button></header>';
 const p='<div class="cook-track" aria-label="Cooking progress"><div style="width:'+Math.round((cook.index+1)/r.steps.length*100)+'%"></div></div>';
 if(cook.index>=r.steps.length){$("#cookContent").innerHTML=h+p+'<div class="cook-complete"><div class="big-check">✓</div><span class="section-kicker">YOU DID IT</span><h3>Something good is cooking.</h3><p>Your five lunches are one step closer. Chill safely, label the containers, and enjoy the week ahead.</p><button id="finishCook" class="btn btn-primary">Finish and close ↗</button></div>';return;}
 $("#cookContent").innerHTML=h+p+'<div class="cook-body"><div class="cook-stepcount">STEP '+(cook.index+1)+' OF '+r.steps.length+'</div><h3>'+escapeHTML(step.title)+'</h3><p>'+escapeHTML(step.detail)+'</p><div class="cook-tip"><strong>✳</strong> <span>'+escapeHTML(step.tip)+'</span></div>'+(step.minutes?'<div class="cook-timer"><div class="timer-display" id="timerClock" aria-live="off">00:00</div><button class="timer-button" id="timerToggle">Start timer</button><button class="timer-button" id="timerReset">Reset</button><span style="font-size:11px;color:#6e8373">Guide only — check doneness and packet instructions.</span></div>':'<p class="evidence-chip" style="margin-top:20px">No countdown for this safety/finishing step.</p>')+'</div><footer class="cook-footer"><button class="btn btn-outline" id="prevStep" '+(cook.index===0?'disabled':'')+'>← Previous</button><button class="btn btn-primary" id="nextStep">'+(last?'Finish this batch ✓':'Next step →')+'</button></footer>';
 timerShow();$("#closeCook")?.focus();
}
function stepChange(by){if(!cook)return;const n=cook.index+by;const r=recipe(cook.id);if(n<0||n>r.steps.length)return;cook.index=n;timerLoad();renderCook();}
function copyShop(){
 const toBuy=D.shopping.filter((_,i)=>!state.checked.includes(i));
 const content="WOOLWORTHS V6 · TO BUY (estimates, not live Dubbo prices)\n\n"+toBuy.map(item=>item.buy+" × "+item.name+" — "+money(item.price)+"\nUse: "+item.use).join("\n\n")+"\n\nEstimate remaining: "+money(toBuy.reduce((s,i)=>s+i.price,0))+"\nCheck labels and current shelf prices.";
 if(navigator.clipboard?.writeText){navigator.clipboard.writeText(content).then(()=>toast("Shopping list copied")).catch(()=>fallbackCopy(content));}else fallbackCopy(content);
}
function fallbackCopy(content){const t=document.createElement("textarea");t.value=content;document.body.append(t);t.select();try{document.execCommand("copy");toast("Shopping list copied");}catch{toast("Copy unavailable on this browser");}t.remove();}
function resetAll(){if(!confirm("Clear all saved shopping ticks and 20-day planning progress on this device?"))return;state=makeState();save();renderShop();renderPlan();toast("Progress reset");}
document.addEventListener("click",e=>{
 const nav=e.target.closest("[data-goto]");if(nav){setRoute(nav.dataset.goto);return}
 const choice=e.target.closest("[data-select]");if(choice){selected=choice.dataset.select;state.selected=selected;servings=5;save();setRoute("recipes");renderDetail();setTimeout(()=>$("#selected-recipe")?.scrollIntoView({behavior:"smooth",block:"start"}),40);return}
 const scaled=e.target.closest("[data-servings]");if(scaled){servings=Math.max(1,Math.min(20,servings+Number(scaled.dataset.servings)));renderDetail();return}
 const start=e.target.closest("[data-start]");if(start){openCook(start.dataset.start);return}
 if(e.target.closest("#jumpToShop")){setRoute("shop");return}
 if(e.target.closest("#closeCook")){closeCook();return}
 if(e.target.closest("#nextStep")){stepChange(1);return}
 if(e.target.closest("#prevStep")){stepChange(-1);return}
 if(e.target.closest("#timerToggle")){if(timerRunning)timerPause();else timerStart();return}
 if(e.target.closest("#timerReset")){timerReset();return}
 if(e.target.closest("#finishCook")){if(cook&&!state.finished.includes(cook.id))state.finished.push(cook.id);save();closeCook();toast("Beautiful work. Your recipe is marked complete.");return}
 if(e.target.closest("#copyShop")){copyShop();return}
 if(e.target.closest("#printShop")){window.print();return}
 if(e.target.closest("#resetProgress")){resetAll();return}
 const filter=e.target.closest("[data-filter]");if(filter){shopFilter=filter.dataset.filter;renderShop();}
});
document.addEventListener("change",e=>{
 if(e.target.matches("[data-item]")){const n=Number(e.target.dataset.item);state.checked=e.target.checked?Array.from(new Set([...state.checked,n])):state.checked.filter(x=>x!==n);save();renderShop();}
 if(e.target.matches("[data-day]")){const n=Number(e.target.dataset.day);state.days=e.target.checked?Array.from(new Set([...state.days,n])):state.days.filter(x=>x!==n);save();renderPlan();}
});
$("#shopSearch").addEventListener("input",e=>{search=e.target.value.toLowerCase().trim();renderShop();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&cook){closeCook();return}if(e.key==="Tab"&&cook){const list=$$("button:not(:disabled)",$("#cookOverlay"));if(list.length){const first=list[0],last=list[list.length-1];if(e.shiftKey&&document.activeElement===first){last.focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===last){first.focus();e.preventDefault();}}}});
window.addEventListener("hashchange",()=>renderView(location.hash.slice(1)));
renderCards();renderDetail();renderPlan();renderShop();renderSources();renderView(location.hash.slice(1));
})();
