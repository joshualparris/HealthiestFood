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
 root.innerHTML='<div class="nutrition-head"><span class="section-kicker">WHAT WE CAN REALLY MEASURE</span><h2>Nutrition, without the guesswork.</h2><p>These are <strong>verified label-based protein subtotals for the original V6 lunches</strong>. They leave out foods without reconciled nutrient data, so they are <em>not</em> complete meal protein, energy or nutritional adequacy.</p></div>'+
 '<div class="nutrition-ref">'+ref.map(x=>'<div class="nutrition-ref-card"><span>'+x.label+'</span><strong>'+x.protein.toFixed(1)+' g</strong><small>protein from '+x.known.join(", ")+' only</small><a href="'+x.source+'" target="_blank" rel="noopener noreferrer">See product label ↗</a></div>').join("")+'</div>'+
 '<div class="nutrition-milk"><h3>Optional dairy-free fortified drink comparison</h3><p>Choose a drink to compare <em>verified</em> per-250 mL label contributions. These are not automatically included in your planned meals.</p><label for="nutritionDrink">Drink to compare</label> <select id="nutritionDrink"><option value="none">No drink included</option><option value="sogood">So Good High Protein Soy (250 mL)</option><option value="vitasoy">Vitasoy Protein Plus Unsweetened (250 mL)</option></select><div id="nutritionDrinkResult" role="status"></div></div>'+
 '<div class="nutrition-unknown"><strong>Still not verified for your complete day</strong><p>Calcium, iodine, vitamin B12, vitamin D, iron, zinc, fibre, energy and total protein from all 17 recipes. A missing result is <strong>unknown, not zero</strong>. For context, Australian adult 19–50 calcium RDI is generally 1,000 mg/day; iodine RDI 150 µg/day and B12 RDI 2.4 µg/day. Requirements differ by age, sex, pregnancy, lactation and health circumstances.</p><p>Next data requirement: map exact Australian Food Composition Database Release 3 food IDs and current branded labels to each raw, dry and drained ingredient, then apply cooking yields. Until then, this app must not declare a diet nutritionally complete.</p><a href="https://www.foodstandards.gov.au/science-data/food-nutrient-databases/afcd/data-files" target="_blank" rel="noopener noreferrer">Official AFCD Release 3 nutrient files ↗</a> · <a href="https://www.eatforhealth.gov.au/nutrient-reference-values" target="_blank" rel="noopener noreferrer">Australian Nutrient Reference Values ↗</a></div>';
 updateDrink("none");
 root.addEventListener("change",e=>{if(e.target.id==="nutritionDrink")updateDrink(e.target.value);});
}
function updateDrink(id){
 const box=document.getElementById("nutritionDrinkResult");if(!box)return;
 const x=drinks[id]||drinks.none;
 if(id==="none"){box.innerHTML="<p>No fortified drink counted. Neither adequacy nor deficiency can be determined from this alone.</p>";return;}
 box.innerHTML='<div class="drink-stats"><span><b>'+x.protein+' g</b> protein</span><span><b>'+x.calcium+' mg</b> calcium</span><span><b>'+(x.b12===null?"Unknown":x.b12+" µg")+'</b> vitamin B12</span><span><b>'+(x.d===null?"Unknown":x.d+" µg")+'</b> vitamin D</span></div><p>~'+x.kcal+' kcal/250 mL. <a href="'+x.source+'" target="_blank" rel="noopener noreferrer">Manufacturer label ↗</a>. Product availability and price in Dubbo unconfirmed. Fortification differs; neither drink is universally better.</p>';
}
return {ref,drinks,fishReport,render};
});
