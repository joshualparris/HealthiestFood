'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const sandbox={window:{}};vm.createContext(sandbox);
vm.runInContext(read('site-data.js'),sandbox);
vm.runInContext(read('whole-day-data.js'),sandbox);
const methods=require('../recipe-methods.js');
const purposes=require('../recipe-timer-purposes.js');
const recipes=sandbox.window.FOOD_DATA.recipes;
methods.apply(recipes);
const get=id=>recipes.find(x=>x.id===id);
const cases=[['a',2,150,5,420],['d',0,150,5,420],['di-salmon',1,90,2,250]];
test('Every quinoa step includes a full in-app water quantity and stovetop technique',()=>{
 for(const [id,index,grams,portions,water] of cases){
  const recipe=get(id),step=recipe.steps[index];
  assert.ok(step.minutes>0,id);
  const text=methods.describe(recipe,step,portions);
  assert.ok(text.includes(grams+' g'),id+' dry quantity');
  assert.ok(text.includes(water+' mL'),id+' water quantity');
  for(const detail of ['fine-mesh sieve','Bring to','low','cover','10–15 minutes','5 minutes','fluff','BY VOLUME'])
   assert.ok(text.toLowerCase().includes(detail.toLowerCase()),id+' missing '+detail);
  assert.doesNotMatch(text,/cook (?:using|according to|with) (?:the )?(?:quinoa )?packet(?:'s)? (?:instructions|water ratio)/i,id);
  assert.doesNotMatch(text,/\{\{/,id);
  const timer=purposes.get(recipe,index);
  assert.match(timer.startWhen,/simmer/i);
  assert.match(timer.checkWhenDone,/10–15 minutes/);
 }
});
test('The quinoa water quantity scales when a home cook changes selected portion count',()=>{
 for(const [id,index,,basePortions,baseWater]of cases){
  const r=get(id);
  const one=methods.describe(r,r.steps[index],1);
  const doubled=methods.describe(r,r.steps[index],basePortions*2);
  assert.match(one,new RegExp(Math.round(baseWater/basePortions)+' mL'));
  assert.match(doubled,new RegExp((baseWater*2)+' mL'));
 }
});
test('Every timed recipe step has a specific purpose, start trigger and finish check',()=>{
 assert.deepEqual(purposes.validate(recipes),{recipes:17,timedSteps:57});
 const example=purposes.get(get('a'),0);
 assert.match(example.purpose,/carrots, capsicum and zucchini/i);
 assert.match(example.startWhen,/begin washing/i);
 assert.match(example.checkWhenDone,/Vegetables are cut/i);
 assert.equal(example.kind,'prep');
});
