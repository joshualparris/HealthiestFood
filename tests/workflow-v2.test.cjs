const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const V=require('../workflow-v2-core.js'),User=require('../user-recipes.js'),Shop=require('../food-shopping.js');
const sandbox={window:{}};vm.runInNewContext(read('site-data.js'),sandbox);vm.runInNewContext(read('whole-day-data.js'),sandbox);
const recipes=sandbox.window.FOOD_DATA.recipes;
test('all workflow scripts parse and are loaded in the correct order',()=>{
 for(const file of ['workflow-v2-core.js','workflow-v2-ui.js','user-recipes.js'])assert.doesNotThrow(()=>new vm.Script(read(file)),file);
 const html=read('index.html'),smart=read('smart-kitchen.html');
 assert.ok(html.includes('src="workflow-v2-core.js"'));
 assert.ok(html.includes('src="user-recipes.js"'));
 assert.ok(html.indexOf('src="user-recipes.js"')<html.indexOf('src="app.js"'));
 for(const s of ['workflow-v2-core.js','workflow-v2-ui.js','user-recipes.js'])assert.ok(smart.includes('src="'+s+'"'),s);
 for(const id of ['connected','connectedOptimise','connectedSave','connectedRecipe','connectedSwapSave','connectedImport','connectedImportSave','connectedShopAisles'])
  assert.ok(smart.includes('id="'+id+'"'),id);
});
test('excludes all past-use-by packs, flags due ingredient and never merges mismatched units',()=>{
 const lots=[
 {key:'quinoa',unit:'g',amount:100,useBy:'2026-11-17',name:'expired'},
 {key:'rice',unit:'g',amount:200,useBy:'2026-11-19',name:'rice'},
 {key:'rice',unit:'tins',amount:3,useBy:'2026-11-19',name:'mismatched'},
 {key:'carrot',unit:'g',amount:50,bestBefore:'2026-11-22',name:'carrot'}
 ];
 const s=V.usableInventory(lots,'2026-11-18');
 assert.equal(s.inventory.quinoa,undefined);
 assert.equal(s.inventory.rice,200);
 assert.equal(s.exclude[0].key,'quinoa');
 assert.equal(s.due.rice.days,1);
 const x=V.rankedRecipes(recipes,Shop,lots,'2026-11-18');
 assert.ok(x.suggestions.length>=12);
 assert.equal(x.stock.exclude.length,1);
});
test('pantry-first week has 7 dated days, 21 valid recipe slots and unknown-price warning',()=>{
 const out=V.optimiseWeekly(recipes,Shop,[],{date:'2026-11-18',days:7,budget:100});
 assert.equal(out.days.length,7);
 assert.equal(out.days[6].date,'2026-11-24');
 assert.equal(out.days.flatMap(x=>x.slots).length,21);
 for(const day of out.days)for(const slot of day.slots){
  const r=recipes.find(x=>x.id===slot.recipeId);assert.ok(r);assert.equal(r.category,slot.type);
 }
 assert.equal(typeof out.cost.knownPrice,'number');
 assert.ok(out.warnings.some(x=>/true checkout|unknown|price/i.test(x)));
 const capped=V.optimiseWeekly(recipes,Shop,[],{date:'2026-11-18',days:999,budget:10});
 assert.equal(capped.days.length,14);
});
test('substitutes real measured ingredient but invalidates old nutrition',()=>{
 const original={id:'test1',name:'Pumpkin lentils',yield:4,category:'dinner',ingredients:[[400,'g','pumpkin cubed'],[25,'mL','olive oil']],steps:[{title:'Roast',minutes:25,detail:'Roast pumpkin until tender.'}],nutrition:'old numbers'};
 const out=V.substitute(original,0,'sweet potato, peeled and cubed');
 assert.ok(out);assert.equal(out.ingredients[0][0],400);
 assert.equal(out.ingredients[0][2],'sweet potato, peeled and cubed');
 assert.equal(original.ingredients[0][2],'pumpkin cubed');
 assert.match(out.nutrition,/UNVERIFIED/i);
 assert.match(out.substitution.methodWarning,/review every step/i);
 assert.equal(V.substitute(original,1,'brown rice'),null);
});
test('parses strict measured ingredients, promotes only reviewed recipes and rejects unsafe placeholders',()=>{
 assert.deepEqual(V.parseIngredient('400 g red lentils'),[400,'g','red lentils']);
 assert.deepEqual(V.parseIngredient('1 kg carrots'),[1000,'g','carrots']);
 assert.deepEqual(V.parseIngredient('1/2 cup quinoa'),[0.5,'cups','quinoa']);
 assert.equal(V.parseIngredient('some spinach'),null);
 const incoming={title:'Freezer tomato soup',ingredients:['400 g tomatoes','200 g lentils'],steps:['Boil vegetables and simmer until cooked.'],source:'https://example.com'};
 const r=V.asUserRecipe(incoming,{id:'user-abcdef',category:'dinner',servings:4});
 assert.equal(r.ingredients.length,2);assert.equal(r.steps.length,1);assert.equal(r.yield,4);
 assert.equal(V.asUserRecipe({...incoming,ingredients:['a handful of sugar']},{id:'user-unsafe',category:'dinner',servings:4}),null);
 assert.equal(V.validateUserRecipes([r]).length,1);
 assert.equal(V.validateUserRecipes([{...r,ingredients:[['bad','g','spam']]}]).length,0);
});
test('user recipe save is atomic, isolated and rejects duplicates',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
 const recipe=V.asUserRecipe({title:'Bean stew',ingredients:['250 g cooked beans'],steps:['Simmer until hot and cooked.']},{id:'user-beanstew',category:'dinner',servings:2});
 assert.equal(User.save(storage,recipe,V).ok,true);
 assert.equal(User.save(storage,recipe,V).ok,false);
 assert.equal(JSON.parse(storage.getItem(User.KEY)).length,1);
});
test('observed aisle numbers reorder known grocery products, without claiming official locations',()=>{
 const sorted=V.aisleSort([{key:'onion',name:'Onion'},{key:'rice',name:'Rice'}],{onion:8,rice:2});
 assert.equal(sorted[0].key,'rice');
 assert.equal(V.aisleSort([{key:'onion',name:'Onion'},{key:'rice',name:'Rice'}],{onion:'3',rice:400})[0].key,'onion');
});
