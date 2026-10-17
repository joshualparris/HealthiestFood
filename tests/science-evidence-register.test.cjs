const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const base=path.resolve(__dirname,"..");
const read=f=>fs.readFileSync(path.join(base,f),"utf8");
const sandbox={window:{}};
vm.createContext(sandbox);
for(const file of ["site-data.js","whole-day-data.js","ingredient-catalogue.js","afcd3-selected.js","afcd3-foods.js","nutrient-ledger.js","whole-day-analysis.js","science-evidence-register.js"]){
 assert.doesNotThrow(()=>vm.runInContext(read(file),sandbox,{filename:file}),file);
}
const {FOOD_DATA,FoodDayAnalysis,FoodEvidenceRegister}=sandbox.window;
test("Evidence register includes all 17 recipes and every ingredient use",()=>{
 const x=FoodEvidenceRegister.summary(FOOD_DATA.recipes,FoodDayAnalysis);
 assert.equal(x.recipeCount,17);
 assert.equal(x.ingredientUses,FOOD_DATA.recipes.reduce((n,r)=>n+r.ingredients.length,0));
 assert.ok(x.sourceMatched>0&&x.sourceMatched<=x.ingredientUses);
 assert.ok(x.numericMatched>0&&x.numericMatched<=x.ingredientUses);
 assert.ok(x.unquantified>0,"Unknowns must not vanish");
});
test("Evidence UI visibly distinguishes AFCD models, retailer records and unquantified inputs",()=>{
 const html=FoodEvidenceRegister.markup(FoodEvidenceRegister.summary(FOOD_DATA.recipes,FoodDayAnalysis));
 assert.equal((html.match(/class="evidence-recipe"/g)||[]).length,17);
 for(const word of ["Generic AFCD reference only","Retail label and/or generic reference","No modelled nutrient value","Not established","AFCD food ID","not a completion percentage"])
 assert.ok(html.includes(word),word);
 assert.ok(html.includes("not physical label verification"));
});
test("Science page uses source register and current wording",()=>{
 const index=read("index.html");
 assert.ok(index.indexOf('src="science-evidence-register.js"')>index.indexOf('src="whole-day-analysis.js"'));
 assert.ok(index.indexOf('id="scienceEvidenceRegister"')<index.indexOf('id="nutritionCoverage"'));
 const nutrition=read("nutrition-coverage.js");
 assert.ok(nutrition.includes("Official AFCD Release 3 data have already been linked"));
 assert.ok(!nutrition.includes("Next data requirement: map exact Australian Food Composition Database"));
 assert.ok(read("site.css").includes(".evidence-status-grid"));
});
