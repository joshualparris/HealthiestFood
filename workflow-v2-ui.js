/* Connected Kitchen: reviewed pantry-to-plan and recipe-to-shopping workflows. */
(function(){
"use strict";
if(typeof document==="undefined")return;
const $=id=>document.getElementById(id);
function init(){
 const V=window.FoodWorkflowV2,P=window.FoodPantryLots,Shop=window.FoodShopping,
  D=window.FOOD_DATA,Core=window.FoodSmartCore,User=window.FoodUserRecipes;
 if(!$("connected")||!V||!P||!Shop||!D||!Core||!User)return;
 const esc=V.esc,KEY_AISLES="good-food-v2-observed-aisles",KEY_PLAN="good-food-dated-schedule-v1";
 const read=(k,otherwise)=>{try{return JSON.parse(localStorage.getItem(k)||"null")??otherwise}catch{return otherwise}};
 const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
 const message=s=>$("connectedStatus").textContent=s;
 let proposal=null,adapted=null,importCandidate=null;
 let lastAisleRows=[];
 const recipes=()=>D.recipes;
 const lots=()=>P.load(localStorage);
 const shoppingFor=days=>Shop.reconcile(Shop.merge(days.flatMap(x=>x.slots.map(s=>({recipeId:s.recipeId,portions:s.portions}))),recipes()),
  V.usableInventory(lots(),days[0]?.date||Core.dateISO()).inventory);
 const pretty=(v)=>Number(v).toLocaleString("en-AU",{maximumFractionDigits:2});
 function renderUseFirst(){
  const now=Core.dateISO(),rank=V.rankedRecipes(recipes(),Shop,lots(),now);
  const due=Object.values(rank.stock.due).sort((a,b)=>a.days-b.days);
  $("connectedUseFirst").innerHTML=due.length?due.slice(0,12).map(x=>
   '<div class="entry"><strong>'+esc(x.name)+'</strong><small>'+pretty(x.amount)+' '+esc(x.unit)+' · '+x.days+' days until recorded '+esc(x.kind)+' date. Check actual food and storage.</small></div>').join(""):"No dated ingredients due within seven days in your recorded pantry.";
  if(rank.stock.exclude.length)$("connectedUseFirst").insertAdjacentHTML("beforeend",
   '<p class="warning">'+rank.stock.exclude.length+' past-use-by record(s) excluded from usable stock. Do not eat these foods.</p>');
 }
 function renderPlan(){
  if(!proposal?.days?.length)return;
  const p=proposal,shop=shoppingFor(p.days);
  $("connectedPlanPreview").innerHTML=p.days.map(day=>'<div class="entry"><strong>'+esc(day.date)+'</strong>'+
   day.slots.map(slot=>'<small>'+esc(slot.time)+' · '+esc(slot.type)+' · '+esc(recipes().find(r=>r.id===slot.recipeId)?.name||slot.recipeId)+'</small>').join("")+'</div>').join("")+
   '<div class="warning">Known mapped-pack cost: approx A$'+pretty(shop.knownPrice)+'. '+shop.unknown+
   ' missing unpriced ingredient line(s), '+shop.itemsLeft+' purchase lines. Budget cannot be guaranteed; no live Dubbo pricing or stock.</div>';
  $("connectedSave").disabled=false;$("connectedAisles").disabled=false;
  lastAisleRows=shop.rows.filter(x=>x.toBuy>0);
  const aisles=read(KEY_AISLES,{});
  const sorted=V.aisleSort(lastAisleRows,aisles);
  $("connectedShopAisles").innerHTML=sorted.map(x=>'<div class="entry"><strong>'+esc(x.name)+'</strong><small>Need '+pretty(x.toBuy)+' '+esc(x.unit)+
   ' · '+(Number.isInteger(aisles[x.key])?'Your aisle '+aisles[x.key]:'Aisle not recorded')+'</small></div>').join("")||"Everything in this plan is covered by your manually entered quantities.";
 }
 $("connectedStart").value=Core.dateISO();
 $("connectedOptimise").addEventListener("click",()=>{
  const date=$("connectedStart").value,budget=Number($("connectedBudget").value);
  if(!V.validDate(date)||!Number.isFinite(budget)||budget<10||budget>2000){message("Enter a valid date and budget A$10–2,000.");return;}
  proposal=V.optimiseWeekly(recipes(),Shop,lots(),{date,budget,days:7});
  if(!proposal.days.length){message(proposal.reason||"Not enough recipes to build a balanced week.");return;}
  renderPlan();
  message("Proposed week only. Nothing changed in your existing meal calendar or pantry.");
 });
 $("connectedSave").addEventListener("click",()=>{
  if(!proposal?.days?.length)return;
  const old=read(KEY_PLAN,{});
  if(!old||typeof old!=="object"||Array.isArray(old)){message("Existing planner data is invalid. Export a backup and restore before changing it.");return;}
  const overlap=proposal.days.filter(d=>Object.hasOwn(old,d.date)).length;
  if(!confirm("Replace meals on "+overlap+" existing planned date(s) and add the rest of these 7 days? This will change your local meal plan, NOT consume pantry stock."))return;
  const result={...old};
  for(const d of proposal.days)result[d.date]=d.slots;
  message(write(KEY_PLAN,result)?"Saved the approved week in your existing planner. Open Meal Plan to review it.":"Could not save the plan to this browser.");
 });
 $("connectedAisles").addEventListener("click",()=>{
  $("connectedAisleEditor").hidden=false;
  const aisles=read(KEY_AISLES,{});
  $("connectedAisleEditor").innerHTML='<p class="muted">Only enter aisle numbers you actually checked at your preferred store. Blank means unknown.</p>'+
   lastAisleRows.map(x=>'<div class="entry"><label>'+esc(x.name)+' <input type="number" min="1" max="200" step="1" data-aisle-key="'+esc(x.key)+'" value="'+(aisles[x.key]||"")+'" placeholder="Unknown"></label></div>').join("")+
   '<button id="connectedSaveAisles" class="primary">Save my observed aisles</button>';
 });
 $("connectedAisleEditor").addEventListener("click",e=>{
  if(e.target.id!=="connectedSaveAisles")return;
  const prior=read(KEY_AISLES,{}),next=prior&&typeof prior==="object"&&!Array.isArray(prior)?{...prior}:{};
  for(const i of $("connectedAisleEditor").querySelectorAll("[data-aisle-key]")){
   const key=i.dataset.aisleKey,n=Number(i.value);
   if(!i.value)delete next[key];
   else if(!Number.isInteger(n)||n<1||n>200){message("Aisle numbers must be 1–200 or blank.");return;}
   else next[key]=n;
  }
  message(write(KEY_AISLES,next)?"Saved your personally observed aisle numbers on this browser.":"Could not save aisle order.");
  renderPlan();$("connectedAisleEditor").hidden=true;
 });
 function renderRecipes(){
  $("connectedRecipe").innerHTML=recipes().map(r=>'<option value="'+esc(r.id)+'">'+esc(r.name)+'</option>').join("");
  renderIngredients();
 }
 function activeRecipe(){return recipes().find(r=>r.id===$("connectedRecipe").value);}
 function choicesFor(r){
  return (r?.ingredients||[]).map(([n,u,name],index)=>({index,name,unit:u,
   swaps:V.SWAPS.filter(x=>x.match.test(name)&&x.unit===u)})).filter(x=>x.swaps.length);
 }
 function renderIngredients(){
  const eligible=choicesFor(activeRecipe());
  $("connectedIngredient").innerHTML=eligible.map(x=>'<option value="'+x.index+'">'+esc(x.name)+'</option>').join("");
  renderReplacement();
 }
 function renderReplacement(){
  const r=activeRecipe(),ix=Number($("connectedIngredient").value);
  const item=choicesFor(r).find(x=>x.index===ix);
  $("connectedReplacement").innerHTML=item?item.swaps.map(x=>'<option value="'+esc(x.replacement)+'">'+esc(x.label)+'</option>').join(""):"";
  $("connectedSwapPreview").disabled=!item;
  adapted=null;$("connectedSwapSave").disabled=true;
 }
 $("connectedRecipe").addEventListener("change",renderIngredients);
 $("connectedIngredient").addEventListener("change",renderReplacement);
 $("connectedSwapPreview").addEventListener("click",()=>{
  const r=activeRecipe(),ix=Number($("connectedIngredient").value),replacement=$("connectedReplacement").value;
  adapted=V.substitute(r,ix,replacement);
  if(!adapted){message("This swap isn't supported for the selected unit.");return;}
  const newShop=Shop.reconcile(Shop.merge([{recipeId:adapted.id,portions:adapted.yield}], [adapted]),{});
  const oldShop=Shop.reconcile(Shop.merge([{recipeId:r.id,portions:r.yield}], [r]),{});
  const a=adapted.substitution;
  $("connectedSwapResult").innerHTML='<strong>Ingredient changed</strong><p>'+pretty(a.amount)+' '+esc(a.unit)+' '+esc(a.original[2])+
   ' → '+pretty(a.amount)+' '+esc(a.unit)+' '+esc(a.replacement)+'</p><p class="warning">'+esc(a.methodWarning)+
   ' Old nutrition estimates are invalid for the changed recipe. Read every step and verify the packet.</p>'+
   '<h3>Updated shopping ingredients (full recipe)</h3>'+newShop.rows.map(x=>'<small>'+pretty(x.amount)+' '+esc(x.unit)+' '+esc(x.name)+'</small>').join("<br>")+
   '<p class="muted">Original had '+oldShop.rows.length+' shopping lines, adapted version '+newShop.rows.length+
   '. No stock has been consumed. Unpriced or unmatched ingredients have unknown costs.</p>';
  $("connectedSwapSave").disabled=false;message("Preview only — no changes saved.");
 });
 $("connectedSwapSave").addEventListener("click",()=>{
  if(!adapted)return;
  if(!confirm("I checked the substitution, allergens and ALL original cooking instructions. Save as a separate unverified recipe in the main planner?"))return;
  const id="user-adapt-"+Date.now().toString(36);
  const candidate=V.asUserRecipe({...adapted,title:adapted.name},{id,category:adapted.category,servings:adapted.yield});
  const result=User.save(localStorage,candidate,V);
  if(!result.ok){message(result.reason);return;}
  D.recipes.push(candidate);
  renderRecipes();message("Adapted recipe saved to the existing recipe library on this device. Nutrition remains unverified.");
 });
 function imports(){
  const saved=read("good-food-imported-recipes-v1",[]);
  return Array.isArray(saved)?saved.slice(0,50).filter(x=>x&&typeof x.title==="string"):[];
 }
 function renderImports(){
  const arr=imports();
  $("connectedImport").innerHTML=arr.map((x,i)=>'<option value="'+i+'">'+esc(x.title)+'</option>').join("");
  importCandidate=null;$("connectedImportSave").disabled=true;
 }
 $("connectedImport").addEventListener("focus",renderImports);
 $("connectedImportReview").addEventListener("click",()=>{
  const ix=Number($("connectedImport").value),entry=imports()[ix],type=$("connectedImportType").value,n=Number($("connectedImportServes").value);
  importCandidate=V.asUserRecipe(entry,{id:"user-import-"+Date.now().toString(36),category:type,servings:n});
  if(!importCandidate){
   $("connectedImportResult").textContent="This import isn't ready: it needs actual measured ingredient lines (e.g. 400 g lentils), valid servings, and at least one cooking step. Edit the source in the Import Recipes area first.";
   $("connectedImportSave").disabled=true;return;
  }
  $("connectedImportResult").innerHTML='<strong>'+esc(importCandidate.name)+'</strong>'+
   '<p>'+importCandidate.ingredients.length+' measurable ingredients · '+importCandidate.steps.length+
   ' cooking steps · '+importCandidate.yield+' portions.</p>'+
   importCandidate.ingredients.map(x=>'<small>'+pretty(x[0])+' '+esc(x[1])+' '+esc(x[2])+'</small>').join("<br>")+
   '<p class="warning">No nutrition, allergen status, safe cooking time or costs have been verified. You must review the imported method.</p>';
  $("connectedImportSave").disabled=false;
 });
 $("connectedImportSave").addEventListener("click",()=>{
  if(!importCandidate)return;
  if(!confirm("I checked every ingredient, cooking instruction, quantity and allergen against the original recipe. Add this to my personal app library?"))return;
  const result=User.save(localStorage,importCandidate,V);
  if(!result.ok){message(result.reason);return;}
  D.recipes.push(importCandidate);
  renderRecipes();$("connectedImportSave").disabled=true;
  message("Approved recipe added to your original app's recipe list, meal planner and shopping reconciliation (unpriced items stay unknown).");
 });
 renderRecipes();renderImports();renderUseFirst();
 window.addEventListener("focus",()=>{renderUseFirst();renderImports();});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
else init();
})();
