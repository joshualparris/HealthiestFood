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
const appJS = read('app.js'), auditJS = read('site-audit.js'), html = read('index.html'), css = read('site.css');
test('browser JavaScript parses',()=>{assert.doesNotThrow(()=>new vm.Script(appJS));assert.doesNotThrow(()=>new vm.Script(auditJS));assert.doesNotThrow(()=>new vm.Script(read('site-data.js')));});
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
 for(const asset of ['site.css','site-data.js','app.js']) assert.ok(html.includes('"'+asset+'"'),asset);
 assert.ok(html.includes('role="dialog"') && html.includes('aria-modal="true"'));
 assert.ok(html.includes('Skip to content'));
 assert.ok(html.includes('id="auditScores"') && html.includes('id="auditClaims"'));
 assert.ok(css.includes('.recipe-card .recipe-click{display:block'));
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
 for(const keyword of ['localStorage','data-servings','data-day','data-item','timerDeadline','timerPause','copyShop','window.print']) assert.ok(appJS.includes(keyword),keyword);
});

test('science ledger distinguishes evidence from unsupported perfect-health claims',()=>{
 assert.match(auditJS,/Not supported/);
 assert.match(auditJS,/calcium remains unquantified/i);
 assert.match(auditJS,/Prices unverified|prices unverified|price/i);
 assert.match(html,/SITE_FACT_CHECK\.md/);
});
