'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const N=require('../nutrient-ledger.js');
const D={};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'..','site-data.js'),'utf8'),{window:D});
const r=id=>D.FOOD_DATA.recipes.find(x=>x.id===id);
const near=(actual,expected,tolerance=0.02)=>assert.ok(Math.abs(actual-expected)<tolerance,actual+' expected '+expected);

test('Every recorded product has immutable identity, dated provenance and no fabricated vitamins',()=>{
 assert.equal(N.observed,'2026-10-17');
 assert.equal(N.items.length,11);
 const ids=new Set();
 for(const p of N.items){
  assert.ok(!ids.has(p.productId));ids.add(p.productId);
  assert.equal(p.url,'https://www.woolworths.com.au/shop/productdetails/'+p.productId);
  assert.ok(p.packG>0);
  for(const value of Object.values(p.per100))assert.ok(value===null||(Number.isFinite(value)&&value>=0));
  assert.ok(!Object.hasOwn(p.per100,'calcium'),'Do not claim an unsupported precise calcium amount');
 }
 assert.equal(N.items.find(x=>x.id==='tofu').per100.protein,24);
 assert.equal(N.items.find(x=>x.id==='sardines').ediblePerTinG,75);
 assert.equal(N.items.find(x=>x.id==='black-beans').ediblePerTinG,225);
});

test('Four lunch portions reconcile nutrient *subtotals* to raw, dry and drained labels',()=>{
 const expectations=[
  ['a',1921.136,34.036,12.2472,369.064,6],
  ['b',1943.386,36.091,11.6172,120.264,5],
  ['c',1696.2,35.42,8.315,62.825,5],
  ['d',1997.1,39.32,13.265,29.225,4]
 ];
 for(const [id,kj,protein,fibre,sodium,matched] of expectations){
  const result=N.calculate(r(id));
  assert.equal(result.servings,5);
  assert.equal(result.totalLines,r(id).ingredients.length);
  assert.equal(result.matchedLines,matched,id);
  near(result.totals.kj/5,kj);
  near(result.totals.protein/5,protein);
  near(result.totals.fibre/5,fibre);
  near(result.totals.sodium/5,sodium);
  assert.equal(result.allMatched,false);
  assert.ok(result.unmatched.length>0);
 }
});

test('Unknown nutrient fields remain excluded, not zero, and portion scaling keeps ratios',()=>{
 const base=N.calculate(r('a'));const small=N.calculate(r('a'),2);
 near(small.totals.protein/base.totals.protein,2/5,0.00001);
 assert.ok(base.metricCoverage.fibre<base.matchedLines,'Sardines have no listed fibre');
 const rice=N.matchIngredient([150,'g','dry brown rice']);
 assert.equal(rice.product.per100.sodium,null,'Retail listing only gives <5');
 assert.equal(N.matchIngredient([2,'tins','Woolworths black beans no added salt, 420 g']).grams,450);
 assert.equal(N.matchIngredient([2,'tins','Woolworths no-added-salt chickpeas, 420 g']).grams,504);
 assert.equal(N.matchIngredient([150,'g','quinoa cooked']),null,'Never apply dry panel to cooked mass');
 assert.equal(N.matchIngredient([150,'mL','dry brown rice']),null,'Never apply grams to mL');
});

test('UI and end-to-end automation reference audited nutrition data',()=>{
 const html=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
 assert.ok(html.indexOf('src="nutrient-ledger.js"')<html.indexOf('src="nutrition-coverage.js"'));
 assert.match(fs.readFileSync(require('node:path').join(__dirname,'..','nutrition-coverage.js'),'utf8'),/window\.FoodNutrients/);
 assert.match(fs.readFileSync(require('node:path').join(__dirname,'..','site.css'),'utf8'),/\.nutrient-scroll/);
});

test('FSANZ AFCD3 profiles add source-backed minerals without replacing branded tofu',()=>{
 const afcd=require('../afcd3-selected.js');
 assert.equal(afcd.release,'AFCD Release 3');
 assert.equal(Object.keys(afcd.foods).length,12);
 for(const [id,p] of Object.entries(afcd.foods)){
  assert.match(id,/^F[0-9]{6}$/);
  for(const key of ['kj','protein','fibre','calcium','iron','magnesium','potassium','iodine','folate']){
    assert.ok(p.per100[key]===null||Number.isFinite(p.per100[key]));
  }
 }
 const c=N.calculateExpanded(r('c'),5,afcd),a=N.calculateExpanded(r('a'),5,afcd);
 assert.ok(c.matchedLines>N.calculate(r('c')).matchedLines);
 assert.ok(a.matchedLines>N.calculate(r('a')).matchedLines);
 assert.ok(c.metricCoverage.iron>0);
 assert.ok(c.metricCoverage.calcium>0);
 assert.ok(c.metricCoverage.calcium<c.totalLines,'Not all calcium panels are published');
 assert.ok(c.unmatched.some(x=>/pumpkin/i.test(x)),'No implicit pumpkin variety substitution');
 assert.ok(a.sources.some(x=>x.sourceId==='F002276'),'Raw carrots mapped to correct AFCD ID');
 assert.ok(c.sources.some(x=>x.sourceId==='F005184'),'Dry red lentils match dry profile');
 assert.ok(c.sources.some(x=>x.sourceId==='595465'),'Branded Evergreen tofu label retained');
 const two=N.calculateExpanded(r('a'),2,afcd);
 near(two.totals.iron/a.totals.iron,0.4,0.0001);
 const noAFCD=N.calculateExpanded(r('c'),5,null);
 assert.equal(noAFCD.matchedLines,N.calculate(r('c')).matchedLines);
});
