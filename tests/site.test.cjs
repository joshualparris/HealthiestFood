// Run: node --test tests/site.test.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sandbox = {window:{}};
vm.runInNewContext(read('site-data.js'), sandbox);
const data = sandbox.window.FOOD_DATA;
const appJS = read('app.js'), timerJS = read('timers.js'), auditJS = read('site-audit.js'), html = read('index.html'), css = read('site.css');
test('browser JavaScript parses',()=>{assert.doesNotThrow(()=>new vm.Script(appJS));assert.doesNotThrow(()=>new vm.Script(timerJS));assert.doesNotThrow(()=>new vm.Script(auditJS));assert.doesNotThrow(()=>new vm.Script(read('site-data.js')));});
test('four distinct recipes, 5 portions each, have complete guided steps',()=>{
 assert.equal(data.recipes.length,4);
 assert.deepEqual(Array.from(data.recipes, r=>r.id), ['a','b','c','d']);
 for(const r of data.recipes){assert.equal(r.yield,5);assert.ok(r.ingredients.length>=15,r.id);assert.ok(r.steps.length>=5,r.id);assert.ok(r.steps.every(s=>s.title && s.detail && Number.isFinite(s.minutes) && s.minutes>=0));}
});
test('shopping list matches published V6 $256.43 basket arithmetic',()=>{
 assert.equal(data.shopping.length,35);
 const total=data.shopping.reduce((sum,i)=>sum+Math.round(i.price*100),0);
 assert.equal(total,25643);
 assert.equal(Math.round(data.totalBudget*100),total);
 assert.ok(data.shopping.every(i=>i.buy && i.use && i.evidence && i.url.startsWith('https://www.woolworths.com.au')));
});
test('all required views, data/assets and accessibility landmarks exist',()=>{
 for(const id of ['view-home','view-recipes','view-plan','view-shop','view-science','cookOverlay','recipeCards','recipeDetail','shoppingList','sourceList','planGrid']) assert.ok(html.includes('id="'+id+'"'),id);
 for(const asset of ['site.css','site-data.js','timers.js','app.js']) assert.ok(html.includes('"'+asset+'"'),asset);
 assert.ok(html.includes('role="dialog"') && html.includes('aria-modal="true"'));
 assert.ok(html.includes('Skip to content'));
 assert.ok(html.includes('id="auditScores"') && html.includes('id="auditClaims"'));
 assert.ok(css.includes('.recipe-card .recipe-click{display:block'));assert.ok(html.indexOf('src="timers.js"') < html.indexOf('src="app.js"'));assert.ok(html.includes('id="floatingTimers"'));assert.ok(css.includes('.timer-dashboard{'));
});
test('nutrition sources and cooling advice are transparently available',()=>{
 assert.ok(data.sources.length >= 7);
 assert.ok(data.sources.some(s=>s.url.includes('heartfoundation.org.au')));
 assert.ok(data.sources.some(s=>s.url.includes('foodauthority.nsw.gov.au')));
 assert.ok(data.sources.some(s=>s.url.includes('woolworths.com.au')));
 assert.match(data.safety.cool,/2 hours/);
 assert.match(data.safety.rice,/2 days/);
 assert.match(html,/no scientifically proven.*healthiest meal/i);
});
test('shopping and plan persistence, recipe scaling and timer implementation exist',()=>{
 for(const keyword of ['localStorage','data-servings','data-day','data-item','T.start(timers','T.pause(timers','renderTimerBoard','copyShop','window.print']) assert.ok(appJS.includes(keyword),keyword);
});

test('science ledger distinguishes evidence from unsupported perfect-health claims',()=>{
 assert.match(auditJS,/Not supported/);
 assert.match(auditJS,/calcium remains unquantified/i);
 assert.match(auditJS,/Prices unverified|prices unverified|price/i);
 assert.match(html,/SITE_FACT_CHECK\.md/);
});

const timers = require('../timers.js');
const meta = (recipeId,stepIndex,title,durationSec) => ({recipeId,stepIndex,title,durationSec});
test('two countdowns run independently across recipe steps', () => {
 const now = 10_000_000;
 let state=timers.start({},'a:1',meta('a',1,'Roast vegetables',30*60),now);
 state=timers.start(state,'a:2',meta('a',2,'Cook quinoa',18*60),now+30_000);
 const {timers:both}=timers.advance(state,now+90_000);
 assert.equal(Object.keys(both).length,2);
 assert.equal(timers.remaining(both['a:1'],now+90_000),1710);
 assert.equal(timers.remaining(both['a:2'],now+90_000),1020);
 assert.match(appJS,/Moving between steps does not modify other timers/);
});
test('pausing/resetting one does not affect other timer', () => {
 const now=1_000;
 let t=timers.start({},'a:1',meta('a',1,'Veg',1800),now);
 t=timers.start(t,'a:2',meta('a',2,'Quinoa',1080),now);
 t=timers.pause(t,'a:1',now+5000);
 assert.equal(t['a:1'].status,'paused');
 assert.equal(timers.remaining(t['a:1'],now+100_000),1795);
 assert.equal(t['a:2'].status,'running');
 t=timers.reset(t,'a:1',now+100_000);
 assert.equal(timers.remaining(t['a:1'],now+100_000),1800);
 assert.equal(t['a:2'].status,'running');
});
test('saved timers restore after reload and show expired timers',()=>{
 const now=1_000_000;
 let t=timers.start({},'a:1',meta('a',1,'Roast vegetables',100),now);
 const restored=timers.clean(JSON.parse(JSON.stringify(t)));
 assert.equal(timers.remaining(restored['a:1'],now+60_000),40);
 const expired=timers.advance(restored,now+120_000);
 assert.equal(expired.timers['a:1'].status,'done');
 assert.deepEqual(expired.expired,['a:1']);
 assert.equal(timers.format(75),'01:15');
});
test('invalid old timer records are ignored safely',()=>{
 const restored=timers.clean({bad:{status:'running',durationSec:1},'a:1':{recipeId:'a',stepIndex:1,title:'Veg',status:'running',durationSec:100,remainingSec:100,deadline:9000}});
 assert.equal(Object.keys(restored).length,1);
});
