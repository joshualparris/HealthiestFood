/* HealthiestFood Connected Workflow V2: pure helpers, no network, no mutations of app state. */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.FoodWorkflowV2=api;
})(typeof window!=="undefined"?window:null,function(){
 "use strict";
 const safeNum=(n,min=0,max=1e6)=>{const v=Number(n);return Number.isFinite(v)?Math.min(max,Math.max(min,v)):min;};
 const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(String(s||""))&&!Number.isNaN(Date.parse(s+"T12:00:00Z"));
 const daysUntil=(today,date)=>Math.round((Date.parse(date+"T12:00:00Z")-Date.parse(today+"T12:00:00Z"))/86400000);
 const IGNORE=/^(?:unknown|not set)$/i;
 function usableInventory(lots,now){
  const owned={},due={},exclude=[];
  for(const l of Array.isArray(lots)?lots:[]){
   if(!l||!Number.isFinite(Number(l.amount))||Number(l.amount)<=0||typeof l.key!=="string"||IGNORE.test(l.key))continue;
   if(l.useBy&&validDate(l.useBy)&&l.useBy<now){exclude.push({key:l.key,name:l.name,reason:"Past use-by — do not eat"});continue;}
   if(l.unit&&l.key in owned&&owned[l.key].unit!==l.unit)continue; // incompatible physical units
   if(!owned[l.key])owned[l.key]={amount:0,unit:l.unit||"",name:l.name||l.key};
   owned[l.key].amount+=safeNum(l.amount);
   const date=l.useBy||l.bestBefore;
   if(date&&validDate(date)&&date>=now){
    const days=daysUntil(now,date);
    if(days<=7&&!IGNORE.test(l.key)){
     if(!due[l.key])due[l.key]={name:l.name||l.key,amount:0,unit:l.unit||"",days,kind:l.useBy?"use-by":"best-before"};
     due[l.key].amount+=safeNum(l.amount);
     due[l.key].days=Math.min(due[l.key].days,days);
    }
   }
  }
  return {inventory:Object.fromEntries(Object.entries(owned).map(([k,v])=>[k,v.amount])),due,exclude};
 }
 // Conservative scoring: existing canonical key+unit only, never substitute a matching substring.
 function recipeUseFirst(recipe,recipes,shop,stock) {
  const merged=shop.merge([{recipeId:recipe.id,portions:1}],recipes);
  const matched=merged.rows.filter(r=>stock.due[r.key]&&stock.due[r.key].unit===r.unit)
   .map(r=>({key:r.key,name:r.name,days:stock.due[r.key].days,amount:Math.min(r.amount,stock.due[r.key].amount),unit:r.unit}));
  const score=matched.reduce((s,m)=>s+(m.days<=2?4:m.days<=4?2:1),0);
  return {score,matched};
 }
 function rankedRecipes(recipes,shop,lots,now){
  const stock=usableInventory(lots,now);
  const inventory=stock.inventory;
  const suggestions=recipes.filter(r=>["breakfast","lunch","dinner"].includes(r.category)).map(r=>{
   const rows=shop.reconcile(shop.merge([{recipeId:r.id,portions:1}],recipes),inventory);
   const due=recipeUseFirst(r,recipes,shop,stock);
   const waste=rows.rows.filter(x=>x.toBuy>0&&x.map).reduce((s,x)=>s+Math.max(0,x.packsToBuy*x.map.pack-x.toBuy),0);
   return {id:r.id,name:r.name,category:r.category,matched:due.matched,urgency:due.score,missing:rows.itemsLeft,unknown:rows.unknown,knownPrice:rows.knownPrice,unusedPackUnits:waste,warning:"Known price covers matched packs only; expiry and safety depend on real storage and label"};
  });
  return {stock,suggestions:suggestions.sort((a,b)=>b.urgency-a.urgency||a.missing-b.missing||a.unknown-b.unknown||a.knownPrice-b.knownPrice||a.name.localeCompare(b.name))};
 }
 function costOf(slots,recipes,shop,stock){
  if(!slots.length)return {knownPrice:0,unknown:0,itemsLeft:0,rows:[]};
  return shop.reconcile(shop.merge(slots,recipes),stock.inventory);
 }
 function optimiseWeekly(recipes,shop,lots,{date,budget=100,days=7,repeatLimit=3}={}){
  const now=validDate(date)?date:new Date().toISOString().slice(0,10);
  const stock=usableInventory(lots,now),counts={},result=[],selected=[];
  const pool=recipes.filter(r=>["breakfast","lunch","dinner"].includes(r.category));
  if(!["breakfast","lunch","dinner"].every(c=>pool.some(r=>r.category===c)))return {days:[],reason:"Requires a breakfast, lunch and dinner recipe."};
  const types=[["breakfast","07:30"],["lunch","12:30"],["dinner","18:00"]];
  const length=Math.max(1,Math.min(14,Math.floor(days)));
  for(let d=0;d<length;d++){
   const iso=new Date(Date.parse(now+"T12:00:00Z")+d*86400000).toISOString().slice(0,10);
   const slots=[];
   for(const [cat,time] of types){
    const candidates=pool.filter(r=>r.category===cat);
    const ranked=candidates.map(r=>{
     const proposal=[...selected,...slots.map(s=>({recipeId:s.recipeId,portions:s.portions})),{recipeId:r.id,portions:1}];
     const next=costOf(proposal,recipes,shop,stock),prior=costOf([...selected,...slots.map(s=>({recipeId:s.recipeId,portions:s.portions}))],recipes,shop,stock);
     const addedPrice=next.knownPrice-prior.knownPrice,addedUnknown=next.unknown-prior.unknown;
     const expiredCredit=recipeUseFirst(r,recipes,shop,stock).score;
     const repeats=counts[r.id]||0,overRepeat=repeats>=repeatLimit;
     const budgetPenalty=next.knownPrice>budget?40+(next.knownPrice-budget):0;
     const rank=addedPrice+Math.max(0,addedUnknown)*30+repeats*8+(overRepeat?50:0)+budgetPenalty-expiredCredit*3;
     return {r,rank,addedPrice,addedUnknown};
    }).sort((a,b)=>a.rank-b.rank||a.r.name.localeCompare(b.r.name));
    const winner=ranked[0];if(!winner)continue;
    slots.push({id:cat+"-0",type:cat,time,recipeId:winner.r.id,portions:1,done:false});
    counts[winner.r.id]=(counts[winner.r.id]||0)+1;
   }
   selected.push(...slots.map(s=>({recipeId:s.recipeId,portions:s.portions})));
   result.push({date:iso,slots});
  }
  const cost=costOf(selected,recipes,shop,stock);
  return {days:result,cost:{knownPrice:cost.knownPrice,unknown:cost.unknown,itemsLeft:cost.itemsLeft},stock,warnings:[
   "The algorithm prioritises recorded use-first foods, varied recipes and lower mapped-pack purchase cost. It does NOT calculate a nutritionally complete diet.",
   "Unpriced items make the true checkout total and budget fit unknown.",
   "Products and expiry dates are not evidence of safe storage; never eat past use-by.",
   "No live Woolworths Dubbo price, aisle or availability feed is connected."
  ]};
 }
 const SWAPS=[
 {match:/\b(?:baby spinach|spinach|bok choy)\b/i,label:"Bok choy leaves",replacement:"baby bok choy leaves",unit:"g"},
 {match:/\b(?:broccoli|broccolini)\b/i,label:"Broccolini",replacement:"broccolini, fresh",unit:"g"},
 {match:/\bpumpkin\b/i,label:"Sweet potato",replacement:"sweet potato, peeled and cubed",unit:"g"},
 {match:/\b(?:diced tomatoes|passata)\b/i,label:"Plain crushed tomatoes",replacement:"plain crushed tomatoes (check label)",unit:"g"},
 {match:/\bquinoa\b/i,label:"Brown rice",replacement:"dry brown rice (cook to packet)",unit:"g"}
 ];
 function substitute(recipe,index,replacement){
  if(!recipe||!Array.isArray(recipe.ingredients)||!Number.isInteger(index)||index<0||index>=recipe.ingredients.length)return null;
  const original=recipe.ingredients[index],q=Number(original?.[0]),unit=original?.[1],name=String(original?.[2]||"");
  const match=SWAPS.find(s=>s.match.test(name)&&s.replacement===replacement&&s.unit===unit);
  if(!match||!(q>0))return null;
  const ingredients=recipe.ingredients.map(i=>Array.isArray(i)?i.slice():i);
  ingredients[index]=[q,unit,replacement];
  return {...recipe,ingredients,id:"user-sub-"+String(recipe.id||"recipe")+"-"+index,sourceId:recipe.id,
   name:recipe.name+" (adapted)",description:"Adaptation of "+recipe.name+". Substitute ingredient is not nutritionally equivalent.",
   nutrition:"UNVERIFIED after substitution; do not reuse original nutrition totals.",
   steps:recipe.steps,substitution:{index,original:[...original],replacement,amount:q,unit,
    methodWarning:"Original cooking instructions may refer to the replaced ingredient or a different cook time; review every step and the actual packet."}};
 }
 const UNITS={g:"g",kg:"kg",ml:"mL",l:"L",tsp:"tsp",tbsp:"tbsp",cup:"cups",cups:"cups",tin:"tins",tins:"tins",can:"tins",cans:"tins",slice:"slices",slices:"slices",clove:"cloves",cloves:"cloves"};
 function parseIngredient(line){
  const l=String(line||"").trim();
  const m=l.match(/^(\d+(?:\.\d+)?|\d+\/\d+)\s*(kg|g|ml|l|tsp|tbsp|cups?|tins?|cans?|slices?|cloves?)\b\s*(.*)$/i);
  if(!m)return null;
  const q=m[1].includes("/")?m[1].split("/").map(Number).reduce((a,b)=>a/b):Number(m[1]);
  let unit=UNITS[m[2].toLowerCase()],amount=q;
  if(unit==="kg"){unit="g";amount*=1000;}if(unit==="L"){unit="mL";amount*=1000;}
  const name=m[3].replace(/^[,:\s]+/,"").trim().slice(0,150);
  if(!name||!Number.isFinite(amount)||amount<=0||amount>100000)return null;
  return [amount,unit,name];
 }
 function asUserRecipe(raw,{id,category="dinner",servings=4}={}){
  if(!raw||!Array.isArray(raw.ingredients)||!["breakfast","lunch","dinner","snack"].includes(category))return null;
  const title=String(raw.title||raw.name||"").trim().slice(0,120),n=Number(servings);
  if(!title||!/^[a-z0-9][a-z0-9_-]{5,79}$/.test(String(id||""))||!Number.isInteger(n)||n<1||n>30)return null;
  const ingredients=raw.ingredients.slice(0,80).map(x=>Array.isArray(x)?x:parseIngredient(x));
  if(ingredients.some(x=>!x||x.length!==3||!(Number(x[0])>0)||!String(x[2]).trim()))return null;
  const steps=(raw.steps||[]).slice(0,50).map((x,i)=>typeof x==="string"?{title:"Step "+(i+1),minutes:0,detail:x.slice(0,1400)}:x).filter(x=>x&&typeof x.detail==="string"&&x.detail.length>0);
  if(!steps.length)return null;
  return {id,title,name:title,category,yield:n,time:0,short:"Imported · verify pack labels",label:"Your reviewed import",
   description:"Imported user recipe. Check allergens and all instructions against its source.",icon:"🍽️",accent:"sage",
   tags:["Imported","Nutrition unverified"],nutrition:"No verified nutrition: labels, edible yield and portion values unknown.",
   ingredients,steps,sourceUrl:String(raw.source||raw.sourceUrl||"").slice(0,400)};
 }
 function validateUserRecipes(raw){
  const arr=Array.isArray(raw)?raw.slice(0,35):[];
  const out=[],ids=new Set();
  for(const r of arr){const parsed=asUserRecipe({...r,title:r.name||r.title},{id:r.id,category:r.category,servings:r.yield});
   if(parsed&&!ids.has(parsed.id)){out.push(parsed);ids.add(parsed.id);}
  }
  return out;
 }
 // Keep private data out of share links; generate a local calendar file rather than server upload.
 function aisleSort(rows,aisles={}){
  const clean=Object.fromEntries(Object.entries(aisles||{}).filter(([k,v])=>k.length<100&&Number.isInteger(v)&&v>0&&v<=200));
  return rows.slice().sort((a,b)=>(clean[a.key]||999)-(clean[b.key]||999)||a.name.localeCompare(b.name));
 }
 return {usableInventory,rankedRecipes,optimiseWeekly,substitute,SWAPS,parseIngredient,asUserRecipe,validateUserRecipes,aisleSort,esc,validDate};
});
