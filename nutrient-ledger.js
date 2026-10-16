/* Label-only, ingredient-level nutrient ledger. No invented AFCD values or complete-meal claims.
 * Snapshot 2026-10-17. Australian Woolworths product page nutrition panels; reconfirm pack.
 * Amounts below refer to grams of raw/dry/drained edible ingredient as stated.
 * Missing metrics are null, NEVER zero. Do not substitute cooking water or gross tin weight.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.FoodNutrients=api;
})(typeof window!=="undefined"?window:null,function(){
 "use strict";
 const observed="2026-10-17";
 // All nutrient values per 100 g edible product in the nutrient panel, before cooking.
 // Fibre and sodium may legitimately be absent; < signs not rounded into exact figures.
 const items=[
  {id:"sardines",name:"John West Sardines in Springwater 110 g",productId:"98523",url:"https://www.woolworths.com.au/shop/productdetails/98523",packG:110,ediblePerTinG:75,match:/john west.*sardines/i,unit:"tins",per100:{kj:844,protein:18.5,fibre:null,sodium:234},allergens:["fish"],status:"product listing; stock and price not verified"},
  {id:"salmon",name:"Ocean Chef Patagonian Coho Salmon 500 g",productId:"6050076",url:"https://www.woolworths.com.au/shop/productdetails/6050076",packG:500,match:/raw ocean chef coho salmon/i,unit:"g",per100:{kj:799,protein:19.5,fibre:null,sodium:48},allergens:["fish"],status:"product listing; stock and price not verified"},
  {id:"tofu",name:"Evergreen Fresh Hard Tofu 650 g",productId:"595465",url:"https://www.woolworths.com.au/shop/productdetails/595465",packG:650,match:/evergreen hard tofu/i,unit:"g",per100:{kj:884,protein:24,fibre:3.5,sodium:12.5},allergens:["soy"],status:"contains calcium sulphate, calcium mg not disclosed"},
  {id:"chickpeas",name:"Woolworths No Added Salt Chickpeas 420 g",productId:"259399",url:"https://www.woolworths.com.au/shop/productdetails/259399",packG:420,ediblePerTinG:252,match:/woolworths no-added-salt chickpeas/i,unit:"tins",per100:{kj:267,protein:4.5,fibre:5.9,sodium:33},allergens:[],status:"four labelled 63 g serves per tin = 252 g"},
  {id:"black-beans",name:"Woolworths No Added Salt Black Beans 420 g",productId:"663581",url:"https://www.woolworths.com.au/shop/productdetails/663581",packG:420,ediblePerTinG:225,match:/woolworths black beans no added salt/i,unit:"tins",per100:{kj:397,protein:5.4,fibre:5.4,sodium:8},allergens:[],status:"3 × 75 g labelled serves = 225 g; can's 60% bean ingredient declaration suggests 252 g; verify actual drained weight"},
  {id:"quinoa",name:"Macro Organic Quinoa 500 g (dry)",productId:"335073",url:"https://www.woolworths.com.au/shop/productdetails/335073",packG:500,match:/dry (?:plain|white) quinoa/i,unit:"g",per100:{kj:1580,protein:12.2,fibre:10.5,sodium:8},allergens:[],status:"dry grain; do not use cooked mass with dry nutrient panel"},
  {id:"brown-rice",name:"SunRice Australian Brown Rice 1 kg (dry)",productId:"94536",url:"https://www.woolworths.com.au/shop/productdetails/94536",packG:1000,match:/dry brown rice/i,unit:"g",per100:{kj:1490,protein:7.6,fibre:3.9,sodium:null},allergens:[],status:"sodium panel <5 mg/100 g; withheld rather than set zero"},
  {id:"tomatoes",name:"SPC Diced Tomatoes 400 g, no added salt",productId:"322960",url:"https://www.woolworths.com.au/shop/productdetails/322960",packG:400,match:/^(?:diced tomatoes, no added salt|plain diced tomatoes)$/i,unit:"g",per100:{kj:76,protein:1,fibre:1.1,sodium:5},allergens:[],status:"SPC no-added-salt SKU assumed only when chosen; confirm actual canned tomato"},
  {id:"brassicas",name:"Woolworths Australian Broccoli & Cauliflower 500 g",productId:"768561",url:"https://www.woolworths.com.au/shop/productdetails/768561",packG:500,match:/^frozen broccoli\/cauliflower$/i,unit:"g",per100:{kj:105,protein:2.5,fibre:1.9,sodium:27},allergens:[],status:"frozen raw weight, cooked values may change"},
  {id:"peas",name:"Woolworths Australian Baby Peas 1 kg",productId:"754181",url:"https://www.woolworths.com.au/shop/productdetails/754181",packG:1000,match:/^frozen baby peas$/i,unit:"g",per100:{kj:247,protein:4.8,fibre:5.2,sodium:null},allergens:[],status:"label has <5 mg sodium per 100 g, excluded from sodium subtotal"},
  {id:"spinach",name:"Woolworths Baby Leaf Spinach 280 g",productId:"524336",url:"https://www.woolworths.com.au/shop/productdetails/524336",packG:280,match:/^baby spinach$/i,unit:"g",per100:{kj:68,protein:2.8,fibre:2.5,sodium:90},allergens:[],status:"per-100g label; cooking losses unmodelled"}
 ];
 const metrics=["kj","protein","fibre","sodium"];
 function matchIngredient(ing) {
  if(!Array.isArray(ing)||ing.length!==3)return null;
  const [amount,unit,name]=ing;
  if(!Number.isFinite(amount)||amount<=0)return null;
  const p=items.find(x=>x.match.test(name)&&x.unit===unit);
  if(!p)return null;
  const grams=unit==="tins"?amount*p.ediblePerTinG:amount;
  return {product:p,grams,ingredient:name,quantity:amount,unit};
 }
 function calculate(recipe,servings=recipe?.yield){
  if(!recipe||!Array.isArray(recipe.ingredients)||!Number.isFinite(recipe.yield)||recipe.yield<=0||!Number.isFinite(servings)||servings<=0)throw Error("Invalid recipe or serving count");
  const lines=recipe.ingredients.map((ing,i)=>({index:i,raw:ing,m:matchIngredient(ing)}));
  const matched=lines.filter(x=>x.m);
  const missing=lines.filter(x=>!x.m).map(x=>x.raw[2]);
  const scale=servings/recipe.yield;
  const totals={},counts={};
  for(const key of metrics){
   const usable=matched.filter(x=>Number.isFinite(x.m.product.per100[key]));
   totals[key]=usable.length?usable.reduce((sum,x)=>sum+x.m.grams*x.m.product.per100[key]/100,0)*scale:null;
   counts[key]=usable.length;
  }
  return {recipeId:recipe.id,servings,matchedLines:matched.length,totalLines:lines.length,
   unmatched:missing,totals,metricCoverage:counts,allMatched:missing.length===0,
   sources:matched.map(x=>({ingredient:x.m.ingredient,product:x.m.product.name,grams:x.m.grams*scale,url:x.m.product.url,
    flags:x.m.product.status}))};
 }

 // Mapping to analysed/borrowed AFCD foods only when the actual raw ingredient
 // description matches or the clearly declared, cautious approximation is shown.
 const afcdMatches=[
  {id:"F005184",match:/^dry red split lentils$/i,unit:"g",note:"raw hulled red lentil; split form approximated"},
  {id:"F002276",match:/^carrots$/i,unit:"g",note:"raw peeled mature carrot assumed; weigh after trimming"},
  {id:"F002247",match:/^red capsicum$/i,unit:"g",note:"raw red capsicum"},
  {id:"F009775",match:/^zucchini$/i,unit:"g",note:"raw unpeeled green zucchini assumed"},
  {id:"F006225",match:/^peeled brown onion$/i,unit:"g",note:"raw peeled brown onion"},
  {id:"F004781",match:/^de-stemmed kale(?: leaves)?$/i,unit:"g",note:"raw kale; AFCD includes generic kale, leaf/stem distinction uncertain"},
  {id:"F005946",match:/^mushrooms$/i,unit:"g",note:"common mushrooms, raw; variety assumed"},
  {id:"F004193",match:/^garlic$/i,unit:"g",note:"fresh peeled garlic, raw"},
  {id:"F004213",match:/^grated fresh ginger$/i,unit:"g",note:"fresh peeled ginger, raw"},
  {id:"F004726",match:/^(?:fresh )?lemon juice$/i,unit:"mL",multiplier:1,note:"40 mL estimated approximately 40 g; density not kitchen-verified"},
  {id:"F006116",match:/^walnuts?/i,unit:"g",note:"raw unsalted walnuts assumed; add after reheating"},
  {id:"F008210",match:/^ground flaxseed/i,unit:"g",note:"AFCD raw linseed profile used for ground flaxseed"}
 ];
 const mineralKeys=["calcium","iron","magnesium","potassium","zinc","iodine","folate","b12","vitaminD"];
 function matchAFCD(ing,dataset){
  if(!dataset?.foods||!Array.isArray(ing)||ing.length!==3)return null;
  const [amount,unit,name]=ing;
  if(!Number.isFinite(amount)||amount<=0)return null;
  const rule=afcdMatches.find(x=>x.unit===unit&&x.match.test(name));
  if(!rule||!dataset.foods[rule.id])return null;
  const x=dataset.foods[rule.id];
  const source={name:x.name,per100:x.per100,source:"AFCD Release 3",
   url:"https://www.foodstandards.gov.au/science-data/food-nutrient-databases/afcd/search",
   status:"FSANZ food "+rule.id+" · "+x.derivation+" · "+rule.note};
  return {product:source,grams:amount*(rule.multiplier||1),ingredient:name,sourceId:rule.id};
 }
 function calculateExpanded(recipe,servings=recipe?.yield,afcdData=typeof window!=="undefined"?window.AFCD3_SELECTED:null){
  const old=calculate(recipe,servings);
  const allMetrics=[...metrics,...mineralKeys];
  const rows=recipe.ingredients.map((ing)=>{
   const match=matchIngredient(ing);
   return match||matchAFCD(ing,afcdData);
  });
  const checked=rows.filter(Boolean);
  const totals={},metricCoverage={};
  const scale=servings/recipe.yield;
  for(const key of allMetrics){
   const compatible=checked.filter(x=>Number.isFinite(x.product.per100[key]));
   totals[key]=compatible.length?compatible.reduce((sum,x)=>sum+x.grams*x.product.per100[key]/100,0)*scale:null;
   metricCoverage[key]=compatible.length;
  }
  return {...old,totals,metricCoverage,matchedLines:checked.length,
   unmatched:rows.map((m,i)=>m?null:recipe.ingredients[i][2]).filter(Boolean),
   allMatched:checked.length===recipe.ingredients.length,
   sources:checked.map(x=>({ingredient:x.ingredient,product:x.product.name,grams:x.grams*scale,url:x.product.url,
    flags:x.product.status||"Exact Woolworths product; check live label",
    sourceId:x.sourceId||x.product.productId||"product-label"})),
   sourceClass:"Woolworths product panel OR FSANZ AFCD Release 3 food profile; assumptions disclosed",
   completedAFCD:!!afcdData};
 }

 return {items,metrics,mineralKeys,observed,matchIngredient,matchAFCD,calculate,calculateExpanded};
});
