'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const C=require('../ingredient-catalogue.js'),SHOP=require('../food-shopping.js'),N=require('../nutrient-ledger.js'),SAFETY=require('../food-safety.js');
const sandbox={window:{}};vm.createContext(sandbox);
vm.runInContext(read('site-data.js'),sandbox);
vm.runInContext(read('whole-day-data.js'),sandbox);
const R=sandbox.window.FOOD_DATA.recipes, before=JSON.stringify(R.map(r=>r.ingredients));
vm.runInContext(read('ingredient-catalogue.js'),sandbox);
test('HF-003: 151 recipe lines resolve without fuzzy matching and preserve old tuple fields',()=>{
 const info=C.verify(R);
 assert.equal(info.version,'ingredient-catalogue-v1');
 assert.equal(info.recipes,17);assert.equal(info.lines,151);
 assert.equal(info.variants,99);assert.equal(info.identities,62);
 assert.equal(JSON.stringify(R.map(r=>r.ingredients)),before,'Historical recipe values must not be rewritten');
 for(const r of R){
  assert.equal(r.ingredients.length,r.ingredientRecords.length,r.id);
  for(let i=0;i<r.ingredients.length;i++){
   const tuple=r.ingredients[i],ref=r.ingredientRecords[i];
   assert.equal(ref.amount,tuple[0]);assert.equal(ref.unit,tuple[1]);assert.equal(ref.label,tuple[2]);
   assert.equal(ref.id,C.byIngredient(tuple).id);
   assert.ok(C.get(ref.id));
  }
  assert.ok(!Object.keys(r).includes('ingredientRecords'),'No saved tuple format migration is required');
 }
 assert.equal(C.resolve('unlisted exotic ingredient','g'),null);
 assert.equal(C.resolve('dry plain quinoa','mL'),null,'Wrong unit not valid ID');
});
test('HF-003: aliases aggregate safely but branded salmon/tofu stay distinct from generic',()=>{
 const a=(name,unit)=>C.resolve(name,unit);
 assert.equal(a('dry plain quinoa','g').id,a('dry white quinoa','g').id);
 assert.equal(a('walnuts, added after reheating','g').id,a('walnut pieces','g').id);
 assert.equal(a('EVOO','mL').id,a('olive oil','mL').id);
 assert.notEqual(a('raw Ocean Chef coho salmon (125 g raw per serving; buy whole 500 g packs as needed)','g').id,a('raw salmon fillet','g').id);
 assert.notEqual(a('Evergreen hard tofu, raw','g').id,a('firm tofu, soy allergen','g').id);
 assert.equal(a('Evergreen hard tofu, raw','g').sku,'595465');
 assert.equal(a('firm tofu, soy allergen','g').sku,undefined);
 const fish=C.allergensFor(R.find(x=>x.id==='a'));
 assert.ok(fish.contains.includes('fish'));
 assert.ok(fish.contains.includes('tree nuts'));
 const oats=C.allergensFor(R.find(x=>x.id==='br-oats'));
 assert.ok(oats.contains.includes('soy'));
 assert.ok(oats.labelCheck.includes('wheat/gluten cross-contact'));
 assert.ok(C.allergensFor(R.find(x=>x.id==='sn-apple')).labelCheck.includes('peanut'));
 const summary=SAFETY.allergenSummary(R.find(x=>x.id==='sn-apple'));
 assert.match(summary.note,/Check every actual product label/);
});
test('HF-003: SKU-aware meal shopping uses exact IDs, without silent generic brand substitution',()=>{
 const oldTofu=SHOP.lookup('Evergreen hard tofu, raw','g');
 const generic=SHOP.lookup('firm tofu, soy allergen','g');
 assert.equal(oldTofu.key,'tofu');assert.equal(oldTofu.productSku,'595465');
 assert.equal(generic,null,'Generic tofu must not silently become branded tofu');
 assert.equal(SHOP.lookup('raw salmon fillet','g'),null);
 const sample=SHOP.merge([{recipeId:'a',portions:5},{recipeId:'br-oats',portions:1}],R);
 assert.ok(sample.rows.every(x=>Object.hasOwn(x,'ingredientId')));
 assert.equal(sample.rows.find(x=>x.key==='sardines').ingredientId,'fish-sardines');
 assert.equal(sample.rows.find(x=>x.key==='sardines').productSku,'98523');
 assert.equal(sample.rows.find(x=>x.key==='walnuts').ingredientId,'nut-walnuts');
});
test('HF-003: old per-label pantry keys are readable but not deleted or double-counted',()=>{
 const base=SHOP.merge([{recipeId:'br-oats',portions:2}],R);
 const chia=base.rows.find(x=>x.ingredientId==='seed-chia'),rawKey='g|chia seeds';
 assert.ok(chia.key.startsWith('ing:seed-chia:'));
 const legacy={[rawKey]:12};
 const original=JSON.stringify(legacy);
 const out=SHOP.reconcile(base,legacy);
 assert.equal(out.rows.find(x=>x.key===chia.key).owned,12);
 assert.equal(JSON.stringify(legacy),original,'Never silently modify saved pantry state');
 assert.equal(SHOP.reconcile(base,{...legacy,[chia.key]:4}).rows.find(x=>x.key===chia.key).owned,4,'New canonical key wins');
 const union=SHOP.merge([{recipeId:'br-oats',portions:1},{recipeId:'br-smoothie',portions:1}],R);
 assert.equal(union.rows.filter(x=>x.ingredientId==='seed-chia').length,1);
 assert.equal(union.rows.find(x=>x.ingredientId==='seed-chia').amount,20);
});
test('HF-003: canonical AFCD/label identity is source-traceable',()=>{
 assert.deepEqual([...C.get('grain-brown-rice-dry').afcd[0]],['F007648',1]);
 assert.equal(C.get('legume-black-beans-canned').sku,undefined,'Generic beans must not imply a specific SKU');
 assert.equal(C.get('fish-sardines').sku,'98523');
 assert.equal(N.matchIngredient([1,'tins','John West springwater sardines, 110 g (75 g drained each)']).ingredientId,'fish-sardines');
 const index=read('index.html'),sw=read('service-worker.js');
 assert.ok(index.indexOf('src="whole-day-data.js"')<index.indexOf('src="ingredient-catalogue.js"'));
 assert.ok(index.indexOf('src="ingredient-catalogue.js"')<index.indexOf('src="nutrient-ledger.js"'));
 assert.ok(sw.includes('"./ingredient-catalogue.js"'));
});
