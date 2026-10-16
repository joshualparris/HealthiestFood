// node --test tests/recipe-methods.test.cjs
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const context={window:{}};
vm.runInNewContext(read("site-data.js"),context);
vm.runInNewContext(read("whole-day-data.js"),context);
const methods=require("../recipe-methods.js");
const recipes=context.window.FOOD_DATA.recipes;
methods.apply(recipes);
const get=id=>recipes.find(r=>r.id===id);

test("all 17 recipes and all methods have validated step-by-step ingredient allocation",()=>{
 assert.equal(recipes.length,17);
 for(const r of recipes){
  assert.doesNotThrow(()=>methods.validate(r),r.id);
  assert.ok(r.steps.length>0,r.id);
  for(const s of r.steps){
   assert.ok(Array.isArray(s.uses),r.id);
   for(const n of [1,r.yield,20]){
    const staged=methods.stage(r,s,n);
    const text=methods.describe(r,s,n);
    assert.ok(staged.every(item=>Number.isFinite(item.amount)&&item.amount>=0),r.id);
    assert.doesNotMatch(text,/\{\{.*?\}\}/,r.id);
    assert.ok(text.length>25,r.id+" "+s.title);
   }
  }
 }
});
test("2 large eggs are explicit in a single-serving scramble, six when scaled threefold",()=>{
 const r=get("br-eggs");
 assert.match(methods.describe(r,r.steps[1],1),/Crack 2 large eggs/);
 assert.match(methods.describe(r,r.steps[1],3),/Crack 6 large eggs/);
 assert.equal(methods.stage(r,r.steps[1],3)[0].amount,6);
});
test("each olive-oil split is exact and adds back to the ingredient total",()=>{
 for(const id of ["a","b","c","d","di-chicken","di-stirfry"]){
  const r=get(id),idx=r.ingredients.findIndex(x=>/olive oil|evoo/i.test(x[2]));
  assert.ok(idx>=0,id);
  const stages=r.steps.flatMap(s=>methods.stage(r,s,1)).filter(s=>s.index===idx);
  const total=stages.reduce((s,x)=>s+x.amount,0);
  assert.ok(Math.abs(total-r.ingredients[idx][0]/r.yield)<0.00001,id);
  assert.ok(stages.length===2,id);
 }
});
test("ingredient-stage totals match source quantities for 1, base yield and 20 portions",()=>{
 for(const r of recipes)for(const n of [1,r.yield,20]){
  const totals=r.ingredients.map(()=>0);
  for(const s of r.steps)for(const x of methods.stage(r,s,n))totals[x.index]+=x.amount;
  r.ingredients.forEach(([amount],i)=>assert.ok(Math.abs(totals[i]-amount*n/r.yield)<0.0001,r.id+":"+i));
 }
});
test("scaled directions preserve cooking temperatures and time ranges",()=>{
 const r=get("di-salmon");
 const s=r.steps[2];
 assert.match(methods.describe(r,s,1),/190°C fan/);
 assert.match(methods.describe(r,s,4),/190°C fan/);
 assert.match(methods.describe(r,s,4),/63°C/);
 const eggs=get("br-eggs");
 assert.match(methods.describe(eggs,eggs.steps[1],2),/3–4 minutes/);
});
test("recipe page loads method metadata before app and renders measured amounts in every guided step",()=>{
 const html=read("index.html"),app=read("app.js"),css=read("site.css");
 assert.ok(html.indexOf('src="whole-day-data.js"')<html.indexOf('src="recipe-methods.js"'));
 assert.ok(html.indexOf('src="recipe-methods.js"')<html.indexOf('src="app.js"'));
 assert.match(app,/RecipeMethods\.stage\(r,step,cook\.portions\)/);
 assert.match(app,/RecipeMethods\.describe\(r,step,cook\.portions\)/);
 assert.match(app,/RecipeMethods\.describe\(r,s,servings\)/);
 assert.match(css,/\.step-measures/);
});
