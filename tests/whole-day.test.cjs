// Run: node --test tests/whole-day.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const source = f => fs.readFileSync(path.join(root,f),'utf8');
const context={window:{},Intl,Date};
vm.createContext(context);
vm.runInContext(source('site-data.js'),context);
vm.runInContext(source('whole-day-data.js'),context);
vm.runInContext(source('food-planner.js'),context);
const data=context.window.FOOD_DATA,core=context.window.FoodPlannerCore;
test('All site JavaScript files parse (incl existing cooking timers)',()=>{
 for(const f of ['site-data.js','whole-day-data.js','timers.js','app.js','food-planner.js','site-audit.js'])assert.doesNotThrow(()=>new vm.Script(source(f)),f);
});
test('four original V6 lunches remain unchanged; 13 additional meals include every type',()=>{
 assert.equal(data.recipes.length,17);
 assert.deepEqual(Array.from(data.recipes.slice(0,4),r=>r.id),['a','b','c','d']);
 const counts={};for(const r of data.recipes){counts[r.category]=(counts[r.category]||0)+1;assert.ok(r.id&&r.name&&r.description);assert.ok(r.yield>0&&r.time>=0);assert.ok(r.ingredients.length>0&&r.steps.length>=2);assert.ok(r.steps.every(s=>s.title&&s.detail&&Number.isFinite(s.minutes)&&s.minutes>=0));}
 assert.deepEqual(counts,{lunch:4,breakfast:4,dinner:5,snack:4});
 assert.equal(new Set(data.recipes.map(r=>r.id)).size,data.recipes.length);
});
test('Saturday 17 October 2026 resolves as today when Sydney clock reaches midnight',()=>{
 assert.equal(core.today(new Date('2026-10-16T12:59:59Z')),'2026-10-16');
 assert.equal(core.today(new Date('2026-10-16T13:00:00Z')),'2026-10-17');
 assert.equal(core.weekday('2026-10-17'),6);
 assert.equal(core.monday('2026-10-17'),'2026-10-12');
 assert.equal(core.shift('2026-10-17',1),'2026-10-18');
 assert.equal(core.shift('2026-10-17',-1),'2026-10-16');
});
test('DST boundaries and month/year rollovers use civil dates without UTC date shifts',()=>{
 assert.equal(core.shift('2026-10-03',1),'2026-10-04');
 assert.equal(core.shift('2026-10-04',1),'2026-10-05');
 assert.equal(core.shift('2026-12-31',1),'2027-01-01');
 assert.equal(core.shift('2026-03-01',-1),'2026-02-28');
 assert.equal(core.validDate('2026-02-30'),false);
 assert.equal(core.validDate('2026-10-17'),true);
 assert.equal(core.validTime('18:00'),true);
 assert.equal(core.validTime('25:88'),false);
});
test('each date has sensible editable meal slots and linked recipes',()=>{
 for(const date of ['2026-10-17','2026-10-18','2026-10-19']){
 const slots=core.makeDefaults(date);
 assert.equal(slots.length,5);
 assert.deepEqual(Array.from(slots,s=>s.type),['breakfast','snack','lunch','snack','dinner']);
 assert.deepEqual(Array.from(slots,s=>s.time),['07:30','10:00','12:30','15:30','18:00']);
 for(const s of slots){assert.ok(data.recipes.some(r=>r.id===s.recipeId&&r.category===s.type));assert.equal(s.done,false);assert.ok(Number.isInteger(s.portions)&&s.portions>=1);}
 }
});
test('new meal picker and dated plan screen are wired into HTML and app',()=>{
 const html=source('index.html'),app=source('app.js'),css=source('site.css'),planner=source('food-planner.js');
 for(const x of ['whole-day-data.js','food-planner.js','data-recipe-type="breakfast"','data-recipe-type="dinner"','data-recipe-type="snack"','id="planGrid"'])assert.ok(html.includes(x),x);
 assert.ok(app.includes('window.FoodPlanner.render()'));
 assert.ok(app.includes('r.category==="lunch"'));
 assert.ok(app.includes('servings=recipe(selected).yield'));
 assert.ok(planner.includes('localStorage.setItem(KEY'));
 assert.ok(planner.includes('type="date"'));
 assert.ok(planner.includes('type="time"'));
 assert.ok(planner.includes('data-slot-done'));
 assert.ok(planner.includes('data-planner="copy-tomorrow"'));
 assert.ok(css.includes('.planner-week'));
 assert.ok(css.includes('max-width:470px'));
});

test('scheduled serving counts make an unpriced date/week shopping ingredient list',()=>{
 const day=core.makeDefaults('2026-10-17');
 assert.ok(day.some(s=>s.type==='dinner'&&s.portions>1));
 const list=core.shoppingText(['2026-10-17']);
 assert.match(list,/INGREDIENTS FOR/);
 assert.match(list,/Amounts are for scheduled adult portions/);
 assert.match(list,/boneless skinless chicken thigh|green beans|avocado flesh/);
 assert.match(core.shoppingText(['2026-10-17','2026-10-18']),/INGREDIENTS · WEEK/);
});

test('timers for breakfast and dinner IDs survive refresh and remain independent',()=>{
 const timers=require('../timers.js'),now=1_000_000;
 const breakfast='br-oats:0',dinner='di-lentil:1';
 let state=timers.start({},breakfast,{recipeId:'br-oats',stepIndex:0,title:'Mix oats',durationSec:120},now);
 state=timers.start(state,dinner,{recipeId:'di-lentil',stepIndex:1,title:'Simmer soup',durationSec:1500},now+10_000);
 const restored=timers.clean(JSON.parse(JSON.stringify(state)));
 assert.equal(Object.keys(restored).length,2);
 assert.equal(timers.remaining(restored[breakfast],now+60_000),60);
 assert.equal(timers.remaining(restored[dinner],now+60_000),1450);
 const after=timers.pause(restored,dinner,now+90_000);
 assert.equal(after[dinner].status,'paused');
 assert.equal(after[breakfast].status,'running');
 assert.equal(timers.advance(after,now+140_000).timers[breakfast].status,'done');
 assert.equal(timers.advance(after,now+140_000).timers[dinner].status,'paused');
});
test('timer storage rejects fabricated and unsafe recipe IDs',()=>{
 const timers=require('../timers.js');
 const entry=(id,recipeId)=>({id,recipeId,stepIndex:0,title:'Fake',durationSec:20,remainingSec:20,status:'paused',deadline:null});
 assert.equal(Object.keys(timers.clean({'<img>:0':entry('<img>:0','<img>')})).length,0);
 assert.equal(Object.keys(timers.clean({'br-oats:0':entry('br-oats:0','br-oats')})).length,1);
});
