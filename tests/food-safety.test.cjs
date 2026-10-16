const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');
const src=fs.readFileSync(require('node:path').join(__dirname,'..','food-safety.js'),'utf8');
test('Safety module parses and is loaded before app',()=>{
 assert.doesNotThrow(()=>new vm.Script(src));
 const html=fs.readFileSync('index.html','utf8');
 assert.ok(html.indexOf('src="food-safety.js"')<html.indexOf('src="app.js"'));
});
const safety=require('../food-safety.js');
const r=(id,ingredients,step="Bake thoroughly then freeze")=>({id,ingredients:ingredients.map(x=>[100,"g",x]),steps:[{title:"Prepare",detail:step}]});
test('Poultry/fish get safe handling and doneness reminders',()=>{
 const chicken=safety.checklist(r("di-chicken",["boneless skinless chicken thigh","brown rice"]));
 assert.ok(chicken.some(x=>x.label.includes("74°C")));
 assert.ok(chicken.some(x=>x.label.includes("shallow")));
 assert.ok(chicken.some(x=>x.label.includes("two days")));
 const fish=safety.checklist(r("b",["raw salmon fillet"]));
 assert.ok(fish.some(x=>x.label.includes("63°C")));
 assert.ok(fish.every(x=>x.source.startsWith("https://www.foodauthority.nsw.gov.au/")));
});
test('Cold snacks not required to acknowledge irrelevant oven or rice temperatures',()=>{
 const cold=safety.checklist(r("sn-apple",["medium apple","natural peanut butter"],"Wash and slice; serve immediately"));
 assert.ok(cold.some(x=>x.id==="chilled"));
 assert.ok(!cold.some(x=>x.id==="rice"));
 assert.ok(!cold.some(x=>x.id==="cool"));
});
test('The completion action is disabled until every self-check is acknowledged',()=>{
 const app=fs.readFileSync('app.js','utf8');
 assert.match(app,/id="finishCook" class="btn btn-primary" disabled/);
 assert.ok(app.includes('possible.filter(x=>!next.has(x.id)).length'));
 assert.ok(app.includes('done.disabled=remaining!==0'));
 assert.ok(app.includes('required.every(x=>cook.safetyChecked.includes(x.id))'));
});

test('HF-048 preflight prevents false confidence with large hot batches',()=>{
 const meal=r("a",["chickpeas","brown rice"],"Bake vegetables, simmer sauce, chill and freeze");
 meal.yield=5;
 const large=safety.checklist(meal,5);
 const small=safety.checklist(meal,1);
 assert.ok(large.some(x=>x.id==="capacity"&&x.source.includes("foodauthority.nsw.gov.au")));
 assert.ok(!small.some(x=>x.id==="capacity"));
 assert.match(safety.capacityWarning(meal,7),/7 hot portions/);
 assert.match(safety.capacityWarning(meal,5),/BEFORE cooking/);
 assert.match(safety.capacityWarning(meal,5),/separate sessions/);
 assert.equal(safety.capacityWarning(meal,1),"");
 const chilled=r("sn-apple",["apple"],"Wash and slice; serve immediately");chilled.yield=5;
 assert.equal(safety.capacityWarning(chilled,5),"");
 const h=safety.render(meal,[],5);
 assert.match(h,/data-cook-safety="capacity"/);
 const app=fs.readFileSync("app.js","utf8");
 assert.match(app,/capacityWarning\(r,cook\.portions\)/);
 assert.match(app,/checklist\(recipe\(cook\.id\),cook\.portions\)/);
 assert.match(app,/render\(r,cook\.safetyChecked,cook\.portions\)/);
});
