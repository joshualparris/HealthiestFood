/* Evidence-led nutrition coverage, not a complete AFCD analysis.
   Labelled subtotals explicitly exclude unknown ingredients and cooking losses.
   All quantities shown per recipe SERVING, not totals for a family plan.
*/
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.FoodNutrition=api;
})(typeof window!=="undefined"?window:null,function(){
"use strict";
const ref=[
 {id:"a",label:"Sardine bowl",protein:8*13.9/5+(2*252*0.045)/5+(150*0.122)/5,known:["sardines","chickpeas","quinoa"],source:"https://www.woolworths.com.au/shop/productdetails/98523"},
 {id:"b",label:"Salmon bowl",protein:24.4+(2*252*0.045)/5,known:["salmon","chickpeas"],source:"https://www.woolworths.com.au/shop/productdetails/6050076"},
 {id:"c",label:"Pumpkin tofu curry",protein:125*0.24,known:["hard tofu"],source:"https://www.woolworths.com.au/shop/productdetails/595465"},
 {id:"d",label:"Black-bean tofu",protein:125*.24+(2*252*.054)/5+150*.122/5,known:["tofu","black beans","quinoa"],source:"https://www.woolworths.com.au/shop/productdetails/595465"}
];
const drinks={
 none:{label:"No drink included",protein:0,calcium:null,b12:null,d:null,kcal:null,source:null},
 sogood:{label:"So Good High Protein Soy — 250 mL",protein:10,calcium:400,b12:1,d:5,kcal:156,source:"https://sogood.com.au/products/soy-milks/Soy-High-Protein-1L"},
 vitasoy:{label:"Vitasoy Protein Plus Unsweetened — 250 mL",protein:10.5,calcium:300,b12:null,d:null,kcal:135,source:"https://soy.com.au/product/soy-milk-protein-plus/"}
};
function fishReport(slots){
 let slotsWithFish=0;
 for(const s of slots){if(["a","b","di-salmon"].includes(s.recipeId))slotsWithFish++;}
 return {fishMeals:slotsWithFish,description:slotsWithFish+" scheduled fish-containing meals this week. This is a *meal count*, not grams eaten or a guaranteed fish-serving target; family portions may be shared and fish eaten elsewhere also counts."};
}
function render(){
 const root=document.getElementById("nutritionCoverage");if(!root)return;
 root.innerHTML='<div class="nutrition-head"><span class="section-kicker">SOURCE-TRACED FOOD LABELS</span><h2>Nutrition, without invented totals.</h2><p>The comparison below combines known nutrient label panels for matched raw/dry/drained ingredients only. <strong>These are partial pre-cooking figures</strong>, not whole-meal calories, not finished cooked nutrients, and not an adequacy verdict. Unmatched ingredients, cooking losses, and most vitamins/minerals remain unknown. Label data should be rechecked before shopping.</p></div>'+
 '<div id="nutrientLedger" class="nutrient-ledger"></div>'+
 '<div class="nutrition-milk"><h3>Optional dairy-free fortified drink comparison</h3><p>Choose a drink to compare <em>verified</em> per-250 mL label contributions. These are not automatically included in your planned meals.</p><label for="nutritionDrink">Drink to compare</label> <select id="nutritionDrink"><option value="none">No drink included</option><option value="sogood">So Good High Protein Soy (250 mL)</option><option value="vitasoy">Vitasoy Protein Plus Unsweetened (250 mL)</option></select><div id="nutritionDrinkResult" role="status"></div></div>'+
 '<div class="nutrition-unknown"><strong>Still not verified for your complete day</strong><p>Calcium, iodine, vitamin B12, vitamin D, iron, zinc, fibre, energy and total protein from all 17 recipes. A missing result is <strong>unknown, not zero</strong>. For context, Australian adult 19–50 calcium RDI is generally 1,000 mg/day; iodine RDI 150 µg/day and B12 RDI 2.4 µg/day. Requirements differ by age, sex, pregnancy, lactation and health circumstances.</p><p>Next data requirement: map exact Australian Food Composition Database Release 3 food IDs and current branded labels to each raw, dry and drained ingredient, then apply cooking yields. Until then, this app must not declare a diet nutritionally complete.</p><a href="https://www.foodstandards.gov.au/science-data/food-nutrient-databases/afcd/data-files" target="_blank" rel="noopener noreferrer">Official AFCD Release 3 nutrient files ↗</a> · <a href="https://www.eatforhealth.gov.au/nutrient-reference-values" target="_blank" rel="noopener noreferrer">Australian Nutrient Reference Values ↗</a></div>';
 renderLedger();
 updateDrink("none");
 root.addEventListener("change",e=>{if(e.target.id==="nutritionDrink")updateDrink(e.target.value);});
}

function escape(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderLedger(){
 const el=document.getElementById("nutrientLedger");
 const ledger=typeof window!=="undefined"&&window.FoodNutrients;
 const data=typeof window!=="undefined"&&window.FOOD_DATA;
 if(!el||!ledger||!data){if(el)el.textContent="Label calculations unavailable. Full nutrient totals cannot be verified.";return;}
 const rows=data.recipes.filter(r=>["a","b","c","d"].includes(r.id)).map(r=>({r,calc:ledger.calculateExpanded(r)}));
 const fmt=(n,d=0)=>n===null?"Unknown":Number(n).toLocaleString("en-AU",{maximumFractionDigits:d,minimumFractionDigits:d});
 el.innerHTML='<div class="nutrient-scroll" tabindex="0" role="region" aria-label="Scrollable nutrient evidence table"><table class="nutrient-table"><caption>Partial pre-cooking nutrient contributions per adult lunch portion. Unknown is never zero.</caption><thead><tr><th scope="col">V6 lunch</th><th scope="col">Energy (kJ)</th><th scope="col">Protein (g)</th><th scope="col">Fibre (g)</th><th scope="col">Sodium (mg)</th><th scope="col">Matched ingredients</th></tr></thead><tbody>'+
 rows.map(({r,calc})=>'<tr><th scope="row">'+escape(r.name)+'</th><td>'+fmt(calc.totals.kj/calc.servings)+'</td><td>'+fmt(calc.totals.protein/calc.servings,1)+'</td><td>'+fmt(calc.totals.fibre/calc.servings,1)+'</td><td>'+fmt(calc.totals.sodium/calc.servings,1)+'</td><td>'+calc.matchedLines+'/'+calc.totalLines+'</td></tr>').join('')+
 '</tbody></table></div><p class="nutrient-warning">Values combine exact linked Woolworths product labels with specific FSANZ AFCD Release 3 raw/dry reference foods. Each amount is a <strong>pre-cooking estimate</strong>, not a laboratory-tested finished meal. Generic carrot, red capsicum, kale, zucchini, mushrooms and walnut identities require ingredient confirmation. Water, spices, cooking losses, portions of produce and some product sodium values remain unresolved.</p>'+
 '<div class="nutrient-scroll" tabindex="0" role="region" aria-label="Scrollable nutrient evidence table"><table class="nutrient-table"><caption>Partial vitamin and mineral contributions. Most branded foods have NO matching vitamin/mineral panel. A zero or small subtotal does not indicate a deficiency or adequate intake.</caption><thead><tr><th scope="col">Lunch</th><th scope="col">Calcium (mg)</th><th scope="col">Iron (mg)</th><th scope="col">Potassium (mg)</th><th scope="col">Zinc (mg)</th><th scope="col">Iodine (µg)</th><th scope="col">Folate (µg)</th></tr></thead><tbody>'+
 rows.map(({r,calc})=>'<tr><th scope="row">'+escape(r.name)+'</th>'+["calcium","iron","potassium","zinc","iodine","folate"].map(k=>'<td>'+fmt(calc.totals[k]===null?null:calc.totals[k]/calc.servings,1)+' <small>('+calc.metricCoverage[k]+'/'+calc.totalLines+')</small></td>').join('')+'</tr>').join('')+
 '</tbody></table></div>'+
 rows.map(({r,calc})=>'<details class="nutrient-details"><summary>'+escape(r.name)+': '+calc.matchedLines+' matched, '+calc.unmatched.length+' unresolved ingredients</summary><div class="nutrient-detail-inner"><p><strong>Included labels and reference food data:</strong></p><ul>'+calc.sources.map(x=>'<li>'+escape(x.grams.toFixed(1))+' g '+escape(x.product)+' — <a href="'+escape(x.url)+'" target="_blank" rel="noopener noreferrer">Source profile ↗</a> <small>'+escape(x.flags)+'</small></li>').join('')+'</ul><p><strong>Not yet matched to a raw/edible food profile:</strong> '+escape(calc.unmatched.join("; ")||"None")+'</p></div></details>').join('')+
 '<p class="nutrient-warning"><strong>Important:</strong> black beans are calculated at 225 g edible per 420 g can (three 75 g labelled servings). Ingredient declaration suggests 60% beans (252 g), so weigh drained beans at home and check your pack. Salmon, fish and tofu are not interchangeable with unrelated store brands for these numeric values. <a href="https://github.com/joshualparris/HealthiestFood/blob/main/NUTRIENT_LABEL_RECONCILIATION_2026-10-17.md" target="_blank" rel="noopener noreferrer">Read provenance and calculation rules ↗</a></p>';
}
function updateDrink(id){
 const box=document.getElementById("nutritionDrinkResult");if(!box)return;
 const x=drinks[id]||drinks.none;
 if(id==="none"){box.innerHTML="<p>No fortified drink counted. Neither adequacy nor deficiency can be determined from this alone.</p>";return;}
 box.innerHTML='<div class="drink-stats"><span><b>'+x.protein+' g</b> protein</span><span><b>'+x.calcium+' mg</b> calcium</span><span><b>'+(x.b12===null?"Unknown":x.b12+" µg")+'</b> vitamin B12</span><span><b>'+(x.d===null?"Unknown":x.d+" µg")+'</b> vitamin D</span></div><p>~'+x.kcal+' kcal/250 mL. <a href="'+x.source+'" target="_blank" rel="noopener noreferrer">Manufacturer label ↗</a>. Product availability and price in Dubbo unconfirmed. Fortification differs; neither drink is universally better.</p>';
}
return {ref,drinks,fishReport,render,renderLedger};
});
