const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
const ctx={window:{},URLSearchParams,Intl,Date};vm.createContext(ctx);
for(const x of ["site-data.js","whole-day-data.js","cooking-methods-data.js","cooking-methods.js"])vm.runInContext(read(x),ctx,{filename:x});
const D=ctx.window.CookingMethodsData,L=ctx.window.CookingMethodsLab,F=ctx.window.FOOD_DATA;
const labelList=[...new Set([...F.recipes.flatMap(r=>r.ingredients.map(i=>i[2])),...F.shopping.map(i=>i.name)])];
test("Exact active ingredient inventory covers all 17 recipes and 35 retailer products",()=>{
 assert.equal(F.recipes.length,17);
 assert.equal(F.shopping.length,35);
 assert.equal(labelList.length,132);
 const result=L.summary();
 assert.equal(result.labels,labelList.length);
 assert.equal(result.mapped,labelList.length,"unmapped: "+result.unmapped.join("; "));
 assert.deepEqual(result.unmapped,[]);
 assert.ok(result.families>=56);
});
test("Every food family has evidence links, safe advice and multiple methods",()=>{
 for(const g of D.entries){
  assert.ok(g.name&&g.group&&g.recommended&&g.why&&g.important&&g.certainty,g.id);
  assert.ok(g.options.length>=3,g.id);
  assert.ok(g.options.every(m=>m.name&&m.advantage&&m.tradeoff&&m.tip),g.id);
  assert.ok(g.refs.length>=1,g.id);
  for(const src of g.refs){
   assert.ok(D.evidence[src],g.id+": "+src);
   assert.match(D.evidence[src],/^https:\/\//);
  }
 }
});
test("Eggs offer genuinely distinct options including poach, boil, fry, scramble",()=>{
 const g=D.match("large eggs");assert.equal(g.id,"egg");
 for(const term of ["poach","boil","fry","scramble"]){
  assert.ok(g.options.some(x=>x.name.toLowerCase().includes(term)),term);
 }
 assert.match(g.important,/vulnerable/i);
 assert.ok(g.refs.includes("egg"));
});
test("Special food safety cannot be confused with vitamin optimisation",()=>{
 for(const [name,id,unsafe] of [["kidney beans","kidney","Slow cook raw"],["raw chicken thigh","chicken","Deep fry"],["rice brown","rice","Fried rice"],["frozen berries","berries","thaw frozen"]]){
  const g=D.entries.find(x=>x.id===id);
  assert.ok(g, id);
  assert.ok(g.options.some(x=>x.name.toLowerCase().includes(unsafe.toLowerCase())), id);
  assert.ok(g.important.length>30);
 }
 assert.match(D.match("no-added-salt kidney beans 420 g each, drained/rinsed").important,/30 minutes/);
 assert.match(D.match("brown onion").recommended,/sauté|soften/i);
});
test("Methods are not prescribed as artificial nutrition scores or lifespan predictions",()=>{
 assert.ok(!read("cooking-methods.html").includes('score/100'));
 assert.match(read("cooking-methods.html"),/no universal/i);
 assert.match(read("cooking-methods.js"),/No source here proves a longer human lifespan/);
});
test("Each 17-recipe detail can link to its own filtered methods comparison",()=>{
 const src=read("app.js");
 assert.ok(src.includes("cooking-methods.html?recipe="));
 for(const r of F.recipes)assert.ok(L.familyUsage(D.entries.find(g=>r.ingredients.some(i=>D.match(i[2])?.id===g.id))).recipes.some(x=>x.id===r.id),r.id);
});
test("Food lab script and page wiring are parsable and responsive",()=>{
 assert.doesNotThrow(()=>new vm.Script(read("cooking-methods-data.js")));
 assert.doesNotThrow(()=>new vm.Script(read("cooking-methods.js")));
 const h=read("cooking-methods.html"),site=read("index.html"),css=read("site.css");
 assert.ok(h.includes('id="cmRoot"'));
 assert.ok(h.indexOf('src="whole-day-data.js"')<h.indexOf('src="cooking-methods-data.js"'));
 assert.ok(h.indexOf('src="cooking-methods-data.js"')<h.indexOf('src="cooking-methods.js"'));
 assert.ok(site.includes('href="cooking-methods.html"'));
 assert.ok(css.includes("@media(max-width:600px)"));
 assert.ok(css.includes(".cm-compare-results"));
});
