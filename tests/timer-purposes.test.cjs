'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ctx={window:{}};
vm.runInNewContext(read('site-data.js'),ctx);
vm.runInNewContext(read('whole-day-data.js'),ctx);
const recipes=ctx.window.FOOD_DATA.recipes;
const purpose=require('../recipe-timer-purposes.js');
const timers=require('../timers.js');
const get=id=>recipes.find(r=>r.id===id);
test('all 57 timed recipe steps have an unambiguous purpose, start and finish cue',()=>{
 const result=purpose.validate(recipes);
 assert.equal(result.recipes,17);
 assert.equal(result.timedSteps,57);
 for(const r of recipes)for(const [i,s] of r.steps.entries()){
  const m=purpose.get(r,i);
  if(s.minutes===0){assert.equal(m,null,r.id+' '+i);continue}
  assert.equal(m.durationSec,s.minutes*60,r.id+' '+i);
  assert.equal(m.stepIndex,i);
  assert.equal(m.recipeId,r.id);
  assert.ok(['prep','cook'].includes(m.kind));
  assert.ok(m.purpose.length>=12,'Purpose must name the timed task: '+r.id+' step '+i);
  assert.ok(m.startWhen.length>15);
  assert.ok(m.checkWhenDone.length>15);
  assert.ok(!/^(start|begin|continue) timer$/i.test(m.purpose));
  assert.equal(m.isEstimate,m.kind==='prep');
 }
});
test('7-minute prep reminder must explain chopping and avoid implying oven preheat completes in 7 min',()=>{
 const m=purpose.get(get('a'),0);
 assert.equal(m.durationSec,420);
 assert.equal(m.kind,'prep');
 assert.match(m.purpose,/chop.*carrots.*capsicum.*zucchini/i);
 assert.match(m.startWhen,/washing and cutting/i);
 assert.match(m.checkWhenDone,/preheated separately/i);
});
test('dangerous or multi-action steps use safe start triggers and physical end checks',()=>{
 const cases=[
  ['a',3,/once the tomato/i,/earlier onion sauté is separate/i],
  ['b',2,/salmon goes into/i,/63°C|thermometer/i],
  ['di-chicken',1,/loaded trays enter/i,/75°C|thermometer/i],
  ['di-lentil',1,/after sautéing/i,/fully soft/i],
  ['sn-eggs',1,/begin cooling/i,/NOT a food-safety certificate/i]
 ];
 for(const [id,i,start,end] of cases){
  const m=purpose.get(get(id),i);
  assert.match(m.startWhen,start,id+' '+i);
  assert.match(m.checkWhenDone,end,id+' '+i);
 }
 for(const id of ['a','b','c','d','br-oats'])for(const [i,s] of get(id).steps.entries()){
  if(!s.minutes)assert.equal(purpose.get(get(id),i),null,'Storage steps should not get a fake safety timer');
 }
});
test('timers persist by original recipe/step IDs and do not confuse step purpose',()=>{
 const m=purpose.get(get('a'),0),id=timers.idFor('a',0);
 const original=timers.start({},id,{...m,title:m.stepTitle},1700000000000);
 const loaded=timers.clean(JSON.parse(JSON.stringify(original)));
 assert.equal(loaded[id].durationSec,420);
 assert.equal(loaded[id].title,'Prepare your trays');
 assert.equal(purpose.get(get('a'),0).purpose,'Chop the carrots, capsicum and zucchini');
 assert.equal(timers.advance(loaded,1700000450000).timers[id].status,'done');
});
test('web page loads timer definitions before app and uses explanatory UI throughout',()=>{
 const html=read('index.html'),sw=read('service-worker.js'),app=read('app.js');
 assert.ok(html.includes('src="recipe-timer-purposes.js" defer'));
 assert.ok(html.indexOf('src="timers.js"')<html.indexOf('src="recipe-timer-purposes.js"'));
 assert.ok(html.indexOf('src="recipe-timer-purposes.js"')<html.indexOf('src="app.js"'));
 assert.ok(sw.includes('"./recipe-timer-purposes.js"'));
 assert.match(app,/const TP=window\.RecipeTimerPurposes/);
 assert.match(app,/class="timer-purpose"/);
 assert.match(app,/Start when:/);
 assert.match(app,/When it rings:/);
 assert.match(app,/class="timer-tile-purpose"/);
 assert.match(app,/timerMetadata\(id\)/);
 assert.match(app,/This is a reminder, not proof/);
 assert.match(html,/id="floatingTimerSummary"/);
});
