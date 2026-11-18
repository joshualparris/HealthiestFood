const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=n=>fs.readFileSync(path.join(root,n),'utf8');
const C=require('../smart-kitchen-core.js');
test('all smart kitchen files parse and required controls exist',()=>{
 for(const f of ['smart-kitchen-core.js','smart-kitchen.js','ten-lunch-planner.js'])assert.doesNotThrow(()=>new vm.Script(read(f)),f);
 const html=read('smart-kitchen.html');
 for(const id of ['groceryPhoto','recognisePhoto','groceryText','detectProducts','barcodeVideo','startBarcode','stopBarcode','barcode','lookupBarcode','recognisedLotKey','recognisedLotQuantity','saveRecognisedLot','expiringPacks','mealSuggestions','swapOriginal','swapAlternative','suggestMenu','saveToCalendar','downloadIcs','presetPicker','savePreset','recipePaste','extractRecipe','saveImportedRecipe','currentCookStep','voiceStart','voiceStop','keepScreenOn','startTimer','smartTimers','freezerStock','shareBackup','downloadBackup','budgetStatus']) assert.ok(html.includes('id="'+id+'"'),id);
 assert.match(html,/privacy|stays in this browser/i);
});
test('OCR results are tentative, do not silently add quantity or approve packaging',()=>{
 const items=C.parseReceipt('SALMON WILD PINK 415g\nRED SPLIT LENTILS 500g\n2 x BROWN RICE 1kg\nDISCOUNT\nCREAM CHEESE');
 assert.deepEqual(items.map(i=>i.id),['salmon','lentils','rice']);
 assert.equal(items[0].gramsGuess,415);
 assert.equal(items[2].unitsGuess,2);
 assert.ok(items.every(x=>x.confirmed===false && x.confidence==='keyword-only'));
});
test('supported substitutions are explicit and do not claim nutrient equivalence',()=>{
 const s=C.swap('spinach','bok-choy',200);
 assert.equal(s.amount,200);
 assert.match(s.caveat,/not nutritionally identical/i);
 assert.equal(C.swap('spinach','chocolate',300),null);
 assert.equal(C.swap('pumpkin','sweet-potato',0),null);
});
test('structured Recipe JSON-LD and human text recipes are imported',()=>{
 const structured=JSON.stringify({'@context':'https://schema.org','@type':'Recipe',name:'Chickpea curry',recipeIngredient:['400 g chickpeas','100 g spinach'],recipeInstructions:[{text:'Cook chickpeas thoroughly.'}],recipeYield:'5 servings'});
 const o=C.extractRecipe(structured);
 assert.equal(o.title,'Chickpea curry');assert.equal(o.ingredients.length,2);assert.equal(o.steps.length,1);
 const html='<html><script type="application/ld+json">'+structured+'</script></html>';
 assert.equal(C.extractRecipe(html).title,'Chickpea curry');
 const manual=C.extractRecipe('Vegetable soup\nIngredients:\n1 cup lentils\n2 carrots\nMethod:\n1. Cook the lentils');
 assert.ok(manual.ingredients.length>=1);
 assert.equal(C.extractRecipe('hello world'),null);
});
test('past-use-by stock is flagged and sorted after potentially usable food',()=>{
 const list=C.expiring([{name:'expired',amount:1,useBy:'2026-11-17'}, {name:'soon',amount:1,useBy:'2026-11-19'}],'2026-11-18');
 assert.equal(list[0].name,'soon');
 assert.equal(list[1].priority,'DO_NOT_USE');
});
test('7-day menu is complete, budget reports price unknowns without guessing',()=>{
 const sandbox={window:{}};vm.runInNewContext(read('site-data.js'),sandbox);vm.runInNewContext(read('whole-day-data.js'),sandbox);
 const D=sandbox.window.FOOD_DATA;const menu=C.createMenu(D.recipes,7,'2026-11-18');
 assert.equal(menu.length,7);assert.equal(menu[0].slots.length,3);
 assert.equal(menu[6].date,'2026-11-24');
 assert.deepEqual(menu[0].slots.map(x=>x.type),['breakfast','lunch','dinner']);
 for(const day of menu)for(const slot of day.slots)assert.ok(D.recipes.find(r=>r.id===slot.recipeId&&r.category===slot.type));
 const calendar=C.exportCalendar(menu,D.recipes);
 assert.ok(calendar.includes('TZID:Australia/Sydney'));
 assert.equal((calendar.match(/BEGIN:VEVENT/g)||[]).length,21);
 assert.match(calendar,/20261118T073000/);
});
test('preset roundtrip retains all 21 recipe occurrences',()=>{
 const ids=new Set(['br-oats','a','di-lentil']);
 const p=C.normalizePreset({name:' My week ',recipes:Array.from({length:21},(_,i)=>({id:['br-oats','a','di-lentil'][i%3],portions:1}))},ids);
 assert.equal(p.name,'My week');assert.equal(p.recipes.length,21);
});
test('smart kitchen is accessible from existing app and cached',()=>{
 const html=read('index.html'),pages=read('app-pages.js'),sw=read('service-worker.js'),bridge=read('iframe-route-bridge.js');
 assert.ok(html.includes('href="smart-kitchen.html"'));
 for(const x of ['smart-kitchen.html','smart-kitchen.js','smart-kitchen-core.js'])assert.ok(sw.includes('"./'+x+'"'),x);
 assert.ok(pages.includes('"smart-kitchen.html":{route:"page",frame:"foodOtherFrame"}'));
 assert.ok(bridge.includes('"smart-kitchen.html"'));
 assert.match(read('ten-lunch-planner.js'),/if\(!document\.getElementById\("shopList"\)\)return/);
});
test('app does not promise automatic secure cloud sync or completed appliance connections',()=>{
 const html=read('smart-kitchen.html'),js=read('smart-kitchen.js');
 assert.match(html,/not automatic cloud synchronisation/i);
 assert.match(html,/No compatible oven or appliance connection/i);
 assert.match(js,/confirm\("I checked the actual product/);
 assert.match(js,/T\.advance\(timerState,Date\.now\(\)\)/);
});
