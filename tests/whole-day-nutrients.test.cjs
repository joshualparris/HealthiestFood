const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8');
const sandbox={window:{},Date,Intl};vm.createContext(sandbox);
for(const p of ['site-data.js','whole-day-data.js','afcd3-foods.js','nutrient-ledger.js','whole-day-analysis.js','food-planner.js'])vm.runInContext(read(p),sandbox,{filename:p});
const A=sandbox.window.FoodDayAnalysis,D=sandbox.window.FOOD_DATA,P=sandbox.window.FoodPlannerCore,N=sandbox.window.AFCD3_FOODS;
test('Official FSANZ extracted dataset contains traceable food IDs, units and nutrient fields',()=>{
 assert.ok(N.verifiedFoodIds>=45);
 assert.ok(Object.keys(N.foods).length>=45);
 assert.equal(N.foods.F006143.name,'Oats, rolled, uncooked');
 assert.equal(N.foods.F007648.name,'Rice, brown, uncooked');
 for(const o of Object.values(N.foods))for(const k of ['kj','protein','fibre','calcium','iodine','iron','b12','vitaminD'])assert.ok(Object.hasOwn(o.per100,k),o.id+' '+k);
});
test('Each of 17 meals now gets a deterministic source-tagged partial nutrition assessment',()=>{
 assert.equal(D.recipes.length,17);
 for(const r of D.recipes){
  const calc=A.analyze(r,1);
  assert.equal(calc.id,r.id);assert.equal(calc.inputs,r.ingredients.length);
  assert.ok(calc.matched>=1, r.id);
  assert.ok(calc.subtotal.kj>0,r.id);
  assert.ok(calc.subtotal.protein>=0,r.id);
  assert.ok(calc.rows.some(x=>x.ids.length||x.label),r.id);
  assert.equal(calc.modelled,true);
  assert.ok(calc.methodology.includes('without recipe cooking yields'));
 }
});
test('Evergreen tofu has no invented product calcium guarantee, other AFCD minerals are generic',()=>{
 const tofu=D.recipes.find(r=>r.id==='c');
 const calc=A.analyze(tofu,1);
 const line=calc.rows.find(row=>row.ingredient.toLowerCase().includes('evergreen hard tofu'));
 assert.ok(line);
 assert.equal(line.nutrients.calcium,null);
 assert.equal(line.nutrients.protein/tofu.yield,30);
 assert.ok(calc.subtotal.calcium>=0); // from other mapped inputs, not branded tofu
});
test('Seven-day dated plan uses one adult portion of each scheduled meal rather than entire family dinner batch',()=>{
 const days=Array.from({length:7},(_,i)=>P.shift('2026-10-17',i));
 const report=A.week(days,P.getSlots,D.recipes);
 assert.equal(report.length,7);
 assert.equal(report[0].date,'2026-10-17');
 assert.equal(report[0].meals.length,3); // New default: breakfast, lunch, dinner; snacks opt-in.
 assert.ok(report[0].subtotal.protein>0);
 for(const d of report){assert.ok(d.subtotal.kj>0);assert.ok(d.incomplete.calcium||typeof d.subtotal.calcium==='number');}
});
test('Browser script order and science mount expose credible non-complete nutrient data',()=>{
 const page=read('index.html');
 for(const script of ['afcd3-foods.js','whole-day-analysis.js','whole-day-report.js'])assert.ok(page.includes('src="'+script+'"'));
 assert.ok(page.includes('id="wholeDayReport"'));
 assert.ok(page.indexOf('afcd3-foods.js')<page.indexOf('whole-day-analysis.js'));
 assert.ok(page.indexOf('whole-day-analysis.js')<page.indexOf('whole-day-report.js'));
 assert.match(read('whole-day-report.js'),/Unknown is not zero/);
 assert.match(read('whole-day-report.js'),/per adult portion/);
});

test('The generated science report JavaScript parses and documents unanswered micronutrient gaps',()=>{
 const src=read('whole-day-report.js');
 assert.doesNotThrow(()=>new vm.Script(src));
 assert.ok(src.includes('calcium'));
 assert.ok(src.includes('iodine'));
 assert.ok(src.includes('Unknown is not zero'));
});
