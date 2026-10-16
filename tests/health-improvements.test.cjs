const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const Scale=require('../recipe-scale.js');
const Shopping=require('../food-shopping.js');
const Nutrition=require('../nutrition-coverage.js');
test('New modules parse and are loaded in dependency order',()=>{
 for(const x of ['recipe-scale.js','food-shopping.js','nutrition-coverage.js','app.js','food-planner.js']) assert.doesNotThrow(()=>new vm.Script(read(x)),x);
 const html=read('index.html');
 assert.ok(html.indexOf('src="recipe-scale.js"')<html.indexOf('src="app.js"'));
 assert.ok(html.indexOf('src="food-shopping.js"')<html.indexOf('src="food-planner.js"'));
 assert.ok(html.indexOf('src="nutrition-coverage.js"')<html.indexOf('src="app.js"'));
 assert.ok(html.includes('id="nutritionCoverage"'));
});
test('Scaled cooking measurements do not change minutes, temperatures or per-person toppings',()=>{
 const doubled=Scale.scaleDetail('Rinse 150 g quinoa. Add 40 mL lemon and 2 tsp cumin. Simmer 15 min at 190°C. Top with 10 g walnuts per serving.',2);
 assert.match(doubled,/300 g quinoa/);assert.match(doubled,/80 mL lemon/);assert.match(doubled,/4 tsp cumin/);
 assert.match(doubled,/15 min at 190°C/);assert.match(doubled,/10 g walnuts per serving/);
 assert.match(Scale.scaleDetail('Thaw five 125 g raw salmon portions, then keep remaining 375 g frozen.',2),/five 125 g raw salmon portions/);
 assert.match(Scale.scaleDetail('Distribute 125 g raw equivalent each.',2),/125 g raw equivalent each/);
 assert.match(Scale.caution({yield:5},10),/separate original-size batches/);
});
test('Fish and grocery pack math merges comparable ingredient units conservatively',()=>{
 const sample=[
  {id:'a',yield:5,ingredients:[[8,'tins','John West springwater sardines, 110 g (75 g drained each)'],[2,'tins','Woolworths no-added-salt chickpeas, 420 g'],[150,'g','dry quinoa']]},
  {id:'br-toast',yield:1,ingredients:[[80,'g','no-added-salt canned chickpeas, drained/rinsed'],[50,'g','dry plain quinoa']]}
 ];
 const out=Shopping.merge([{recipeId:'a',portions:5},{recipeId:'br-toast',portions:1}],sample);
 const by=Object.fromEntries(out.rows.map(r=>[r.key,r]));
 assert.equal(by.sardines.amount,8);assert.equal(by.sardines.packs,8);
 assert.equal(by.chickpeas.amount,584);assert.equal(by.chickpeas.packs,3);
 assert.equal(by.quinoa.amount,200);assert.equal(by.quinoa.packs,1);
 assert.equal(by.quinoa.price,5.75);
});
test('Unmatched shopping requirements remain unpriced rather than treated as free or unavailable',()=>{
 const out=Shopping.merge([{recipeId:'eggs',portions:1}], [{id:'eggs',yield:1,ingredients:[[2,'','large eggs'],[90,'g','unknown exotic ingredient']]}]);
 assert.equal(out.unknown,2);assert.equal(out.priced,0);assert.equal(out.knownPrice,0);
 assert.ok(out.rows.every(x=>x.price===null));
});
test('Only source-backed protein subtotals are presented; no fabricated full-day sufficiency',()=>{
 assert.equal(Nutrition.ref.length,4);
 const a=Nutrition.ref.find(r=>r.id==='a');
 assert.ok(a.protein>30&&a.protein<31);
 assert.equal(Nutrition.drinks.sogood.calcium,400);
 assert.equal(Nutrition.drinks.sogood.b12,1);
 assert.equal(Nutrition.drinks.sogood.d,5);
 assert.equal(Nutrition.drinks.vitasoy.calcium,300);
 assert.equal(Nutrition.drinks.vitasoy.b12,null);
 assert.equal(Nutrition.fishReport([{recipeId:'a'},{recipeId:'b'},{recipeId:'di-salmon'}]).fishMeals,3);
});
test('Planner shopping integration is implemented and label unknowns persist',()=>{
 const planner=read('food-planner.js'),app=read('app.js'),html=read('index.html');
 assert.ok(planner.includes('window.FoodShopping.render('));
 assert.ok(planner.includes('window.FoodShopping?.handle('));
 assert.ok(app.includes('window.FoodNutrition?.render()'));
 assert.ok(app.includes('window.RecipeScale.scaleDetail('));
 assert.ok(read('nutrition-coverage.js').includes('unknown, not zero'));
 assert.ok(html.includes('id="nutritionCoverage"'));
});

test('optional cook-up log is local only, escaped and connected to recipe view',()=>{
 const trial=read('cook-trial.js'),app=read('app.js'),html=read('index.html');
 assert.doesNotThrow(()=>new vm.Script(trial));
 assert.match(trial,/localStorage\.setItem\(KEY/);
 assert.match(trial,/Cooked date/);
 assert.match(trial,/After freezing\/reheating/);
 assert.match(trial,/esc\(value\.notes/);
 assert.ok(app.includes('window.FoodTrial?.render(r)'));
 assert.ok(app.includes('window.FoodTrial?.init()'));
 assert.ok(html.indexOf('src="cook-trial.js"')<html.indexOf('src="app.js"'));
});
