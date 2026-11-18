/* Smart Kitchen: pure, testable helpers. User confirmation is required for all imports. */
(function(root,factory) {
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.FoodSmartCore=api;
})(typeof window!=="undefined"?window:null,function() {
"use strict";
const ZONE="Australia/Sydney";
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clean=s=>String(s??"").replace(/\s+/g," ").trim();
const tday=(date=new Date())=>Object.fromEntries(new Intl.DateTimeFormat("en-CA",{timeZone:ZONE,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(date).filter(x=>x.type!=="literal").map(x=>[x.type,x.value]));
function dateISO(date=new Date()){const p=tday(date);return p.year+"-"+p.month+"-"+p.day;}
function addDays(date,n){const d=new Date(date+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
const ALIASES=[
 ["salmon",/\b(?:pink salmon|wild pink|canned salmon|tinned salmon)\b/i],
 ["lentils",/\b(?:red split lentils?|red lentils?)\b/i],
 ["quinoa",/\bquinoa\b/i],
 ["rice",/\b(?:brown rice|medium grain rice)\b/i],
 ["chickpeas",/\bchickpeas?\b/i],
 ["passata",/\b(?:passata|crushed tomato(?:es)?)\b/i],
 ["tofu",/\b(?:firm tofu|hard tofu|perfectly firm tofu)\b/i],
 ["broccoli",/\b(?:broccoli|broccolini)\b/i],
 ["spinach",/\b(?:spinach|bok choy|baby leaf)\b/i],
 ["carrot",/\bcarrots?\b/i],
 ["onion",/\b(?:brown onions?|onions?)\b/i],
 ["pumpkin",/\b(?:pumpkin|butternut)\b/i],
 ["capsicum",/\b(?:red capsicum|capsicum)\b/i],
 ["lemon",/\blemons?\b/i],
 ["garlic",/\bgarlic\b/i],
 ["oil",/\b(?:extra virgin olive oil|olive oil)\b/i],
 ["cumin",/\bcumin\b/i],
 ["paprika",/\bpaprika\b/i],
 ["curry",/\bcurry powder\b/i],
 ["turmeric",/\bturmeric\b/i],
 ["pepper",/\bblack pepper\b/i]
];
function parseReceipt(text,max=80){
 const lines=String(text||"").split(/\r?\n/).map(clean).filter(x=>x.length>=3).slice(0,500);
 const hits=[];
 for(const [index,line] of lines.entries()){
  for(const [id,re] of ALIASES) if(re.test(line)){
   const multiple=line.match(/(?:^|\s)(\d{1,2})\s*[x×]\s*/i);
   const g=line.match(/\b(\d{2,4})\s?g\b/i);
   hits.push({id,line:line.slice(0,180),lineNumber:index+1,unitsGuess:multiple?Number(multiple[1]):null,gramsGuess:g?Number(g[1]):null,confidence:"keyword-only",confirmed:false});
   break;
  }
  if(hits.length>=max)break;
 }
 return hits;
}
const SWAPS={
 broccoli:[{id:"broccolini",name:"Broccolini",basis:"gram-for-gram fresh weight"},{id:"cauliflower",name:"Cauliflower",basis:"gram-for-gram fresh weight"}],
 spinach:[{id:"bok-choy",name:"Bok choy leaves",basis:"gram-for-gram edible leaves"},{id:"kale",name:"Kale",basis:"gram-for-gram edible leaves"}],
 pumpkin:[{id:"sweet-potato",name:"Sweet potato",basis:"gram-for-gram peeled weight"},{id:"carrot",name:"Carrots",basis:"gram-for-gram edible weight"}],
 quinoa:[{id:"rice",name:"Brown rice",basis:"same dry grams; cooking ratios differ"}],
 passata:[{id:"crushed-tomato",name:"Plain crushed tomatoes",basis:"gram-for-gram; adjust water"}],
 salmon:[{id:"sardines",name:"Canned sardines",basis:"match actual drained edible weight, not number of cans"}]
};
function swap(itemId,alternative,amount){
 const x=(SWAPS[itemId]||[]).find(s=>s.id===alternative),q=Number(amount);
 if(!x||!Number.isFinite(q)||q<=0||q>100000)return null;
 return {...x,amount:q,original:itemId,caveat:"Not nutritionally identical; check allergens, cooking times, edible yield and label."};
}
function findRecipeObjects(raw) {
 const parsed=[];
 function traverse(o,depth=0){
  if(depth>12||!o||typeof o!=="object")return;
  if(Array.isArray(o)){o.slice(0,100).forEach(x=>traverse(x,depth+1));return;}
  const types=Array.isArray(o["@type"])?o["@type"]:[o["@type"]];
  if(types.some(t=>typeof t==="string"&&/(^|:)recipe$/i.test(t)))parsed.push(o);
  for(const k of ["@graph","mainEntity","itemListElement","recipe"])if(o[k])traverse(o[k],depth+1);
 }
 try{traverse(JSON.parse(raw));}catch{}
 return parsed;
}
function normaliseRecipe(obj) {
 if(!obj||typeof obj!=="object")return null;
 const ingredients=(Array.isArray(obj.recipeIngredient)?obj.recipeIngredient:[]).slice(0,120).map(clean).filter(Boolean);
 const directions=Array.isArray(obj.recipeInstructions)?
   obj.recipeInstructions.flatMap(i=>typeof i==="string"?[i]:typeof i?.text==="string"?[i.text]:[]):
   typeof obj.recipeInstructions==="string"?obj.recipeInstructions.split(/\r?\n/):[];
 const title=clean(obj.name).slice(0,150);
 if(!title||!ingredients.length)return null;
 return {title,ingredients,steps:directions.slice(0,80).map(clean).filter(Boolean),source:clean(obj.url||"").slice(0,400),servings:clean(obj.recipeYield||"").slice(0,40),warning:"Imported text is unverified. Check milk allergens, instructions, yields and food safety before cooking."};
}
function extractRecipe(raw,source=""){
 const text=String(raw||"").slice(0,250000);
 let matches=findRecipeObjects(text);
 if(!matches.length){
  for(const m of text.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi))
   matches.push(...findRecipeObjects(m[1].replace(/&quot;/g,'"')));
 }
 for(const m of matches){const x=normaliseRecipe(m);if(x)return {...x,source:x.source||source};}
 const lines=text.replace(/<[^>]{1,200}>/g,"\n").split(/\r?\n/).map(clean).filter(Boolean).slice(0,350);
 const marked=lines.findIndex(l=>/^ingredients\s*:?\s*$/i.test(l));
 let ingredients=[],steps=[],title=lines[0]?.slice(0,150)||"";
 if(marked>=0){
  const end=lines.findIndex((l,i)=>i>marked&&/^(?:method|instructions|directions|steps)\s*:?\s*$/i.test(l));
  ingredients=lines.slice(marked+1,end<0?Math.min(lines.length,marked+50):end).filter(l=>l.length<220).slice(0,80);
  steps=end>=0?lines.slice(end+1).slice(0,80):[];
 } else {
  ingredients=lines.filter(l=>/^(?:[-•*]\s*)?(?:\d+(?:\.\d+)?(?:\/\d+)?\s*(?:g|kg|ml|l|cup|cups|tsp|tbsp|tablespoons?|teaspoons?|can|cans|tin|tins|whole)\b)/i.test(l)).slice(0,80);
  steps=lines.filter(l=>/^(?:\d+[.)]\s+)(?:preheat|heat|cook|chop|mix|add|stir|simmer|bake|roast|slice|combine|serve)/i.test(l)).slice(0,60);
 }
 if(!ingredients.length)return null;
 return {title:title||"Imported recipe",ingredients,steps,source,servings:"",warning:"Text extracted heuristically. Review EVERY ingredient, method, quantity, allergen and cooking temperature."};
}
function expiring(lots,now=dateISO(),within=7){
 const until=addDays(now,within);
 return (Array.isArray(lots)?lots:[]).filter(x=>x&&Number(x.amount)>0).map(x=>{
  const date=x.useBy||x.bestBefore||"",pastUseBy=!!x.useBy&&x.useBy<now;
  return {...x,due:date,priority:pastUseBy?"DO_NOT_USE":date&&date<=until?"CHECK_SOON":"OTHER",label:pastUseBy?"Past use-by: do not eat":x.useBy?"Use-by":"Best-before"};
 }).sort((a,b)=>(a.priority==="DO_NOT_USE"?1:0)-(b.priority==="DO_NOT_USE"?1:0)||(a.due||"9999").localeCompare(b.due||"9999"));
}
function mealSuggestions(recipes,shop,pantry={},limit=10){
 if(!Array.isArray(recipes)||!shop?.merge||!shop?.reconcile)return[];
 return recipes.filter(x=>["lunch","dinner"].includes(x.category)).map(r=>{
  const computed=shop.reconcile(shop.merge([{recipeId:r.id,portions:1}],recipes),pantry);
  const outstanding=computed.rows.filter(x=>x.toBuy>0);
  return {id:r.id,name:r.name,missing:outstanding.length,knownPrice:computed.knownPrice,unpriced:computed.unknown,matched:computed.rows.length-outstanding.length,caveat:"Price covers only mapped products at historical or personal-observation rates; not current checkout."};
 }).sort((a,b)=>a.missing-b.missing||a.unpriced-b.unpriced||a.knownPrice-b.knownPrice||a.name.localeCompare(b.name)).slice(0,limit);
}
function createMenu(recipes,days=7,start=dateISO()){
 if(!Array.isArray(recipes)||!recipes.length)return[];
 const byCat=c=>recipes.filter(r=>r.category===c);
 if(["breakfast","lunch","dinner"].some(c=>!byCat(c).length))return[];
 const out=[];
 for(let i=0;i<Math.max(1,Math.min(14,days));i++){
  const date=addDays(start,i),slots=[];
  for(const [index,cat,time] of [[0,"breakfast","07:30"],[1,"lunch","12:30"],[2,"dinner","18:00"]]){
   const pool=byCat(cat),r=pool[(i+(cat==="lunch"?1:0))%pool.length];
   slots.push({id:cat+"-0",type:cat,time,recipeId:r.id,portions:1,done:false});
  }
  out.push({date,slots});
 }
 return out;
}
function estimatePlan(menu,recipes,shop,pantry={}){
 if(!menu?.length||!shop?.merge||!shop?.reconcile)return null;
 const slots=menu.flatMap(x=>x.slots.map(s=>({recipeId:s.recipeId,portions:s.portions})));
 const calc=shop.reconcile(shop.merge(slots,recipes),pantry);
 return {known:calc.knownPrice,unknown:calc.unknown,items:calc.rows.filter(x=>x.toBuy>0).length,coverage:"partial historical prices only; unknowns excluded",rows:calc.rows};
}
function escapeIcs(s){return String(s??"").replace(/\\/g,"\\\\").replace(/\r?\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;").slice(0,500);}
function exportCalendar(menu,recipes){
 const dict=new Map(recipes.map(r=>[r.id,r]));
 const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//HealthiestFood//Meal Planner//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH",
 "BEGIN:VTIMEZONE","TZID:Australia/Sydney","BEGIN:STANDARD","DTSTART:19700405T030000","TZOFFSETFROM:+1100","TZOFFSETTO:+1000","RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=1SU","END:STANDARD","BEGIN:DAYLIGHT","DTSTART:19701004T020000","TZOFFSETFROM:+1000","TZOFFSETTO:+1100","RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=1SU","END:DAYLIGHT","END:VTIMEZONE"];
 for(const item of menu.slice(0,35)){const day=item.date.replaceAll("-","");
  for(const s of item.slots.slice(0,20)){
   const r=dict.get(s.recipeId);if(!r||!/^([01]\d|2[0-3]):[0-5]\d$/.test(s.time))continue;
   const [h,m]=s.time.split(":").map(Number),end=String((h+(m+45>=60?1:0))%24).padStart(2,"0")+String((m+45)%60).padStart(2,"0");
   const start=s.time.replace(":","")+"00";
   lines.push("BEGIN:VEVENT","UID:"+day+"-"+s.type+"-"+s.recipeId+"@healthiestfood.local","DTSTAMP:20261118T000000Z",
   "DTSTART;TZID=Australia/Sydney:"+day+"T"+start,"DTEND;TZID=Australia/Sydney:"+day+"T"+end+"00",
   "SUMMARY:"+escapeIcs(r.name),"DESCRIPTION:"+escapeIcs(s.portions+" portion(s) planned in HealthiestFood. This event is an export, not live sync."),"END:VEVENT");
  }
 }
 lines.push("END:VCALENDAR","");
 return lines.join("\r\n");
}
function normalizePreset(p,valid){
 const name=clean(p?.name).slice(0,80);
 const recipes=Array.isArray(p?.recipes)?p.recipes.filter(x=>valid.has(x.id)&&Number.isInteger(x.portions)&&x.portions>=1&&x.portions<=30).slice(0,20):[];
 return name&&recipes.length?{name,recipes,createdAt:typeof p.createdAt==="string"?p.createdAt:""}:null;
}
return {ALIASES,SWAPS,escape,clean,dateISO,addDays,parseReceipt,swap,findRecipeObjects,normaliseRecipe,extractRecipe,expiring,mealSuggestions,createMenu,estimatePlan,exportCalendar,normalizePreset};
});
