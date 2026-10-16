/* Modelled raw/prepared-ingredient nutrition from specific AFCD3 generic foods
 * and branded Woolworths labels. This is NOT measured nutrient content of cooked meals.
 * Only mapped inputs contribute; missing values are null, never zero. No RDI claims.
 */
(function(root,factory){const api=factory(root);if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.FoodDayAnalysis=api;})(typeof window!=="undefined"?window:null,function(root){
"use strict";
const F=()=>root?.AFCD3_FOODS?.foods||{},L=()=>root?.FoodNutrients;
const fields=["kj","protein","fat","fibre","sodium","calcium","iron","iodine","magnesium","potassium","selenium","zinc","b12","vitaminD","folate","vitaminC"];
const SOURCE="https://www.foodstandards.gov.au/science-data/food-nutrient-databases/afcd/data-files";
const food=(id,portion)=>({id,portion});
function ingredientId(name){
 const n=name.toLowerCase();let ids=[];
 // A declared 50/50 vegetable mixture is only a modelling convention, not a product analysis.
 if(/frozen broccoli\/cauliflower/.test(n))return [food("F001905",.5),food("F002378",.5)];
 if(/rolled oats/.test(n))return [food("F006143",1)];
 if(/quinoa/.test(n))return [food("F007598",1)];
 if(/brown rice/.test(n))return [food("F007648",1)];
 if(/red.*lentil|split lentil/.test(n))return [food("F005184",1)];
 if(/chickpea/.test(n))return [food("F002880",1)];
 if(/kidney beans/.test(n))return [food("F000448",1)];
 if(/black bean/.test(n))return [];
 if(/evergreen hard tofu|firm tofu/.test(n))return [food("F009176",1)];
 if(/broccoli/.test(n))return [food("F001905",1)];
 if(/cauliflower/.test(n))return [food("F002378",1)];
 if(/spinach/.test(n))return [food("F008749",1)];
 if(/kale/.test(n))return [food("F004781",1)];
 if(/frozen baby peas/.test(n))return []; // Frozen raw product is not identical to AFCD's cooked frozen peas.
 if(/carrot/.test(n))return [food("F002276",1)];
 if(/pumpkin/.test(n))return [food("F007535",1)]; // Butternut assumed; not a verified pumpkin cultivar.
 if(/sweet potato/.test(n))return [food("F009035",1)];
 if(/mushroom/.test(n))return [food("F005946",1)];
 if(/zucchini/.test(n))return [food("F009775",1)];
 if(/capsicum/.test(n))return [food("F002247",1)];
 if(/onion/.test(n))return [food(/red onion/.test(n)?"F009800":"F006225",1)];
 if(/diced tomato|plain diced tomato/.test(n))return [food("F010071",1)];
 if(/tomato/.test(n))return [food("F009193",1)];
 if(/avocado/.test(n))return [food("F000162",1)];
 if(/walnut/.test(n))return [food("F006116",1)];
 if(/flaxseed|linseed/.test(n))return [food("F008210",1)];
 if(/chia seed/.test(n))return [food("F008209",1)];
 if(/olive oil|\bevoo\b/i.test(n))return [food("F006177",1)];
 if(/garlic/.test(n))return [food("F004193",1)];
 if(/ginger/.test(n))return [food("F004213",1)];
 if(/lemon/.test(n))return [food("F004726",1)];
 if(/kiwi/.test(n))return [food("F004816",1)];
 if(/orange/.test(n))return [food("F006277",1)];
 if(/banana/.test(n))return [food("F000262",1)];
 if(/apple/.test(n))return [food("F000095",1)];
 if(/berries|mixed berries|blueberries/.test(n))return [food("F001289",.5),food("F008951",.5)]; // 50/50 blueberry/strawberry proxy
 if(/hard-boiled egg/.test(n))return [food("F003721",1)];
 if(/large egg|eggs/.test(n))return [food("F003729",1)];
 if(/chicken thigh/.test(n))return [food("F002806",1)];
 if(/salmon/.test(n))return [food("F007827",1)]; // Atlantic salmon is a proxy, NOT Ocean Chef coho.
 if(/soy milk/.test(n))return [food("F008720",1)]; // Generic calcium-fortified soy drink, not a branded label.
 if(/peanut butter/.test(n)&&!/almond or peanut/.test(n))return [food("F006579",1)];
 if(/cucumber/.test(n))return [food("F003320",1)];
 if(/hummus/.test(n))return [food("F003539",1)];
 return [];
}
function weight(ing){
 const [v,unit,name]=ing;
 if(!Number.isFinite(v)||v<0)return null;
 const n=name.toLowerCase();
 if(unit==="g")return v;
 if(unit==="mL")return v*(/oil|\bevoo\b/i.test(n)?.91:1);
 if(unit==="tins"||unit==="tin"){
  if(/sardine/.test(n))return v*75;
  if(/chickpea/.test(n))return v*252;
  if(/black bean/.test(n))return v*225;
  if(/kidney bean/.test(n))return v*250; // Assumed, verify drained weight.
  return null;
 }
 if(unit==="tsp")return v*(/oregano/.test(n)?1:/cinnamon/.test(n)?2.6:2.5);
 if(unit==="pinch")return v*.3;
 if(unit==="cloves")return v*3;
 if(unit==="slice"||unit==="slices")return v*35;
 if(unit===""){
  if(/egg/.test(n))return v*50;
  if(/banana/.test(n))return v*100;
  if(/orange/.test(n))return v*130;
  if(/kiwi/.test(n))return v*70;
  if(/apple/.test(n))return v*150;
  if(/tomato/.test(n))return v*120;
  if(/lemon/.test(n))return v*35;
 }
 return null;
}
function row(ing){
 const grams=weight(ing);
 const branded=L()?.matchIngredient?.(ing);
 const ids=ingredientId(ing[2]);
 const generic=ids.filter(x=>F()[x.id]);
 // Brand label's energy, protein, fibre and sodium takes precedence.
 const label=branded?.product?.per100||{};
 const nums={};const origin={};
 for(const key of fields){
  const fromLabel=Object.prototype.hasOwnProperty.call(label,key)&&Number.isFinite(label[key]);
  let value=null,src=null;
  if(fromLabel){value=label[key];src="Retail label";}
  else if(generic.length===ids.length&&ids.length&&!(branded&&/tofu/i.test(branded.product.id)&&key==="calcium")){
   const weighted=generic.reduce((acc,x)=>{const v=F()[x.id].per100[key];return Number.isFinite(v)?acc+v*x.portion:null;},0);
   if(weighted!==null&&Number.isFinite(weighted)){value=weighted;src="AFCD3 generic proxy";}
  }
  // Absent nutrient data must remain null; a blank is NOT zero.
  nums[key]=Number.isFinite(value)&&Number.isFinite(grams)?value*grams/100:null;
  origin[key]=nums[key]===null?null:src;
 }
 return {ingredient:ing[2],grams,ids:generic.map(x=>x.id),label:branded?.product?.name||null,nutrients:nums,sources:origin,complete:fields.every(k=>nums[k]!==null)};
}
function analyze(recipe,portions=1){
 if(!recipe||!Array.isArray(recipe.ingredients)||!(recipe.yield>0)||!(portions>0))throw Error("Invalid recipe");
 const rows=recipe.ingredients.map(row),ratio=portions/recipe.yield,subtotal={},known={},unknown={};
 for(const k of fields){
  const good=rows.filter(x=>Number.isFinite(x.nutrients[k]));
  subtotal[k]=good.length?Number((ratio*good.reduce((s,x)=>s+x.nutrients[k],0)).toFixed(2)):null;
  known[k]=good.length;unknown[k]=rows.length-good.length;
 }
 const matched=rows.filter(r=>r.ids.length>0||r.label).length;
 return {id:recipe.id,name:recipe.name,portions,inputs:rows.length,matched,matchedShare:Math.round(matched/rows.length*100),subtotal,known,unknown,unmapped:rows.filter(r=>r.ids.length===0&&!r.label).map(r=>r.ingredient),
 methodology:"Sum of mapped raw/dry/drained ingredients, without recipe cooking yields or nutrient retention corrections. Missing values omitted, not zeros. Brand macros prefer product labels; generic minerals from AFCD3 are NOT branded guarantees.",
 modelled:!!root?.AFCD3_FOODS,rows};
}
function week(dates,getSlots,recipes){
 const all=new Map(recipes.map(r=>[r.id,r]));
 return dates.map(date=>{
  const slots=getSlots(date).filter(s=>!s.done);
  const meals=slots.map(s=>({type:s.type,time:s.time,recipeId:s.recipeId,part:analyze(all.get(s.recipeId),1)}));
  const subtotal={};const incomplete={};
  for(const k of fields){const x=meals.map(m=>m.part.subtotal[k]);subtotal[k]=x.some(Number.isFinite)?Number(x.filter(Number.isFinite).reduce((a,b)=>a+b,0).toFixed(1)):null;incomplete[k]=meals.some(m=>m.part.unknown[k]>0)||x.some(v=>v===null);}
  return {date,meals,subtotal,incomplete};
 });
}
return {fields,ingredientId,weight,row,analyze,week,source:SOURCE};
});
