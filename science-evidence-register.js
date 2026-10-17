/* Science evidence register: calculated from recipe inputs and the AFCD/retail
 * row provenance already used for nutrient calculations. Does not validate
 * purchased packs, finished meals, a selected store or individual adequacy.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root){root.FoodEvidenceRegister=api; if(root.document){
   if(root.document.readyState==="loading")root.document.addEventListener("DOMContentLoaded",()=>api.render(root));
   else api.render(root);
 }}
})(typeof window!=="undefined"?window:null,function(){
 "use strict";
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const fields=["kj","protein","fibre","calcium","iron","iodine","sodium","b12","vitaminD"];
 const names={kj:"Energy",protein:"Protein",fibre:"Fibre",calcium:"Calcium",iron:"Iron",iodine:"Iodine",sodium:"Sodium",b12:"Vitamin B12",vitaminD:"Vitamin D"};
 const sourceUrl="https://www.foodstandards.gov.au/science-data/food-nutrient-databases/afcd/data-files";
 const group=(r)=>{
  const labels=Object.values(r.sources).filter(Boolean);
  if(!labels.length)return "No quantified nutrients";
  if(labels.some(v=>v.startsWith("Retail label")))return "Retail label and/or generic reference";
  return "Generic AFCD reference only";
 };
 function summary(recipes,analysis){
  if(!Array.isArray(recipes)||!analysis||typeof analysis.analyze!=="function")throw Error("Recipe and analysis modules required");
  const rows=recipes.map(recipe=>({recipe,calc:analysis.analyze(recipe,1)}));
  const uses=rows.flatMap(x=>x.calc.rows);
  const distinct=uses.filter(x=>x.ids.length>0||x.label);
  const withNumbers=uses.filter(x=>fields.some(k=>Number.isFinite(x.nutrients[k])));
  const unresolved=uses.filter(x=>!fields.some(k=>Number.isFinite(x.nutrients[k])));
  const uncertain=uses.filter(x=>x.ids.length>0||x.label).filter(x=>Object.values(x.sources).some(v=>v?.includes("generic proxy")||v?.includes("candidate")));
  return {rows,recipeCount:rows.length,ingredientUses:uses.length,sourceMatched:distinct.length,numericMatched:withNumbers.length,unquantified:unresolved.length,proxyUses:uncertain.length};
 }
 function markup(info){
  const stat=n=>Number(n).toLocaleString("en-AU");
  const cards=[
   ["Source dataset","Available","FSANZ AFCD Release 3 food and nutrient data, with reference food IDs.",sourceUrl],
   ["Recipe modelling","Calculated, not measured",stat(info.recipeCount)+" recipes and "+stat(info.ingredientUses)+" ingredient uses; "+stat(info.numericMatched)+" ingredient uses contribute at least one of the nine highlighted nutrients. Source-matched does not mean physically verified.",null],
   ["Exact products & allergens","Pack check required","Linked retailer or manufacturer listings are not a photograph of the item in your kitchen. Check each current label, fortification and allergen warning.", "https://www.foodstandards.gov.au/consumer/labelling/allergen-labelling"],
   ["Cooked nutrients & portions","Not established","Raw/dry/edible-weight estimates are not measured cooked yields. Actual retention, food swaps and household portions require kitchen evidence.",null],
   ["Dubbo prices & stock","Not established","Historical retailer figures are estimates, not a live local checkout; actual availability depends on selected store and date.",null],
   ["Diet adequacy & longevity","Not established","A planned seven-day pattern does not measure what somebody consumed, individual needs or lifespan effects.", "https://www.eatforhealth.gov.au/nutrient-reference-values"]
  ];
  const statuses=cards.map(([title,state,detail,url])=>
    '<article class="evidence-status-item"><strong>'+esc(title)+'</strong><span>'+esc(state)+'</span><p>'+esc(detail)+'</p>'+(url?'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">Official source ↗</a>':'')+'</article>').join("");
  const details=info.rows.map(({recipe,calc})=>{
   const missing=calc.rows.filter(x=>!fields.some(k=>Number.isFinite(x.nutrients[k])));
   const rows=calc.rows.map(x=>{
    const provenance=fields.map(k=>x.sources[k]).filter(Boolean);
    const all=Array.from(new Set(provenance));
    const provided=fields.filter(k=>Number.isFinite(x.nutrients[k]));
    const status=x.grams===null?"Edible mass not established":
     provided.length?group(x):"No modelled nutrient value";
    return '<tr><th scope="row">'+esc(x.ingredient)+'</th><td>'+esc(x.grams===null?"Unknown":Number(x.grams.toFixed(1))+" g model input")+'</td><td>'+esc(status)+'</td><td>'+esc(x.ids.join(", ")||"—")+'</td><td>'+esc(provided.map(k=>names[k]).join(", ")||"None")+'</td></tr>';
   }).join("");
   const fractions=fields.map(k=>'<li>'+esc(names[k])+': '+calc.known[k]+'/'+calc.inputs+' ingredient lines modelled'+(calc.unknown[k]?' (incomplete)':' (all input lines mapped; cooked value still unverified)')+'</li>').join("");
   return '<details class="evidence-recipe"><summary><span>'+esc(recipe.name)+'</span><small>'+calc.matched+'/'+calc.inputs+' source-matched · '+missing.length+' with no values</small></summary>'+
    '<p>One planned adult portion, modelled before cooking. Multiple nutrient sources may contribute to one ingredient. A product SKU linked online is not physical label verification.</p>'+
    '<div class="whole-day-scroll" tabindex="0" role="region" aria-label="Ingredient evidence for '+esc(recipe.name)+'"><table><thead><tr><th>Ingredient</th><th>Model weight</th><th>Provenance</th><th>AFCD food ID(s)</th><th>Available nutrients</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<details><summary>Show nutrient completeness</summary><ul>'+fractions+'</ul></details>'+
    (missing.length?'<p><strong>No numeric source for highlighted nutrients:</strong> '+esc(missing.map(x=>x.ingredient).join("; "))+'</p>':'')+
    '</details>';
  }).join("");
  return '<div class="page-head"><span class="section-kicker">EVIDENCE REGISTER · 17 OCT 2026</span><h2>What is verified, modelled or still uncertain?</h2>'+
    '<p>The evidence is not a completion percentage. “Source-matched” means that a food-database record or retailer label has been associated with an ingredient; it does <strong>not</strong> prove an exact bought product, the cooked result or a health outcome.</p></div>'+
    '<div class="evidence-status-grid">'+statuses+'</div>'+
    '<p class="evidence-summary-line"><strong>'+stat(info.ingredientUses)+' recipe ingredient uses</strong> · '+stat(info.sourceMatched)+' source-matched · '+stat(info.numericMatched)+' contribute modelled nutrient values · '+stat(info.unquantified)+' without one of the nine highlighted numeric nutrients. Repeated ingredients are counted each time they occur in a recipe.</p>'+
    '<div class="evidence-register-recipes"><h3>Inspect evidence for each recipe</h3><p>Expand a recipe to see every input, modelled edible weight, nutrition-data provenance and unresolved nutrient coverage. Some valid food data are only a generic proxy, such as Atlantic salmon for coho.</p>'+details+'</div>'+
    '<p class="evidence-register-caveat">Independent checks still needed: current purchased packaging and allergens; actual drained weights (especially black beans); product-specific tofu calcium; cooking losses, internal temperature and portion yields; selected-store checkout; and any personal nutrient-adequacy assessment. No “perfect food” or exact lifespan extension has been established.</p>';
 }
 function render(root){
  const el=root.document?.getElementById("scienceEvidenceRegister"),D=root.FOOD_DATA,A=root.FoodDayAnalysis;
  if(!el||!D||!A)return false;
  try{el.innerHTML=markup(summary(D.recipes,A));return true;}
  catch(err){el.textContent="Evidence register unavailable. The source audit remains linked below.";return false;}
 }
 return {summary,markup,render,fields};
});
