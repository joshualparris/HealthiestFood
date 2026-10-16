// Extra evidence-led safety and schedule regression tests.
// Run: node --test tests/*.test.cjs
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const sandbox={window:{},Date,Intl};vm.createContext(sandbox);
vm.runInContext(read('site-data.js'),sandbox);
vm.runInContext(read('whole-day-data.js'),sandbox);
vm.runInContext(read('food-planner.js'),sandbox);
const D=sandbox.window.FOOD_DATA,P=sandbox.window.FoodPlannerCore;
test('planner explicitly distinguishes fish meal occasions from weight-based fish serves',()=>{
 const days=Array.from({length:7},(_,i)=>P.shift('2026-10-12',i));
 const pattern=P.weeklyPattern(days);
 assert.equal(pattern.fishOccasions,4);
 assert.equal(pattern.lunchPortions,7);
 assert.ok(pattern.mainMeals>=14);
 const source=read('food-planner.js');
 assert.match(source,/not.*calculated fish serves/i);
 assert.match(source,/Snacks are optional/i);
 assert.match(source,/20 V6 portions/);
});
test('high-risk frozen berry and hummus warnings exist in actual guided recipe steps',()=>{
 for(const id of ['br-oats','br-smoothie','sn-berries']){
  const r=D.recipes.find(x=>x.id===id);
  assert.ok(r,id);assert.match(r.steps.map(s=>s.detail).join(' '),/cook|cooked/i,id);
  assert.match(r.steps.map(s=>s.detail).join(' '),/frozen berr|frozen fruit|fresh berr/i,id);
 }
 const hummus=D.recipes.find(x=>x.id==='sn-hummus');
 assert.match(hummus.steps.map(s=>s.detail).join(' '),/immunocompromised/);
 assert.match(hummus.steps.map(s=>s.detail).join(' '),/freshly cooked legume/);
});
test('public longevity guide cites both early-eating evidence and limits on exact timing',()=>{
 const c=read('longevity.html');
 assert.match(c,/id="timing"/);
 assert.match(c,/bmjmedicine\.bmj\.com\/content\/5\/1\/e001071/);
 assert.match(c,/NEJMoa2114833/);
 assert.match(c,/13½ hours/);
 assert.match(c,/Snacks.*quota|Snacks.*preference/i);
 assert.match(c,/WHOLE_SITE_EVIDENCE_REVIEW_2026-10-17\.md/);
});
test('new public research report traces Australian NRVs and actual recipe tradeoffs',()=>{
 const c=read('WHOLE_SITE_EVIDENCE_REVIEW_2026-10-17.md');
 for(const marker of ['calcium','iodine','fibre','sodium','food safety','br-oats','di-stirfry','AFCD Release 3'])assert.ok(c.toLowerCase().includes(marker.toLowerCase()),marker);
});
