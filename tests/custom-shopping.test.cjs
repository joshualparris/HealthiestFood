// node --test tests/custom-shopping.test.cjs
const test=require("node:test");
const assert=require("node:assert/strict");
const vm=require("node:vm");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const sandbox={window:{}};
vm.runInNewContext(read("site-data.js"),sandbox);
vm.runInNewContext(read("whole-day-data.js"),sandbox);
const recipes=sandbox.window.FOOD_DATA.recipes;
const shop=require("../food-shopping.js");
const custom=require("../custom-shopping.js");

test("custom shopping module parses and all 17 recipes are selectable",()=>{
 assert.doesNotThrow(()=>new vm.Script(read("custom-shopping.js")));
 assert.equal(recipes.length,17);
 assert.deepEqual(new Set(recipes.map(r=>r.category)),new Set(["breakfast","lunch","dinner","snack"]));
 const html=read("index.html");
 assert.ok(html.includes('id="customShopping"'));
 assert.ok(html.includes('id="legacyV6Shop"'));
 assert.ok(html.indexOf('src="food-shopping.js"')<html.indexOf('src="custom-shopping.js"'));
 assert.ok(html.indexOf('id="customShopping"')<html.indexOf('id="legacyV6Shop"'));
 assert.ok(read("app.js").includes("data-add-to-shop"));
});
test("no recipes selected means zero items and zero estimated spend",()=>{
 const result=custom.build({},recipes,shop);
 assert.equal(result.selectedRecipes,0);
 assert.equal(result.totalPortions,0);
 assert.equal(result.rows.length,0);
 assert.equal(result.knownPrice,0);
});
test("single recipe with one portion scales ingredients to one fifth of lunch",()=>{
 const result=custom.build({a:1},recipes,shop);
 assert.equal(result.selectedRecipes,1);
 assert.equal(result.totalPortions,1);
 const fish=result.rows.find(row=>row.key==="sardines");
 assert.ok(fish);
 assert.equal(fish.amount,1.6);
 assert.equal(fish.packsToBuy,2);
 assert.equal(fish.priceToBuy,7.4);
 assert.ok(result.unknown>0,"Unknown packs must not be estimated");
});
test("two different recipes combine a shared ingredient before rounding retail packs",()=>{
 const combined=custom.build({a:1,"di-chicken":1},recipes,shop);
 const oil=combined.rows.find(row=>row.key==="oil");
 assert.ok(oil);
 assert.equal(oil.amount,10);
 assert.equal(oil.packsToBuy,1);
 assert.equal(oil.priceToBuy,8.8);
 assert.equal(combined.totalPortions,2);
});
test("five meal portions of one selected recipe scale its ingredient amounts",()=>{
 const result=custom.build({"br-oats":5},recipes,shop);
 assert.equal(result.selectedRecipes,1);
 assert.equal(result.totalPortions,5);
 const walnuts=result.rows.find(row=>row.key==="walnuts");
 assert.equal(walnuts.amount,75);
 assert.equal(walnuts.packsToBuy,1);
});
test("pantry quantity reduces remaining purchase, with zero if enough is owned",()=>{
 const base=custom.build({"br-oats":5},recipes,shop);
 const reduced=custom.build({"br-oats":5},recipes,shop,{walnuts:45});
 const full=custom.build({"br-oats":5},recipes,shop,{walnuts:75});
 const original=base.rows.find(row=>row.key==="walnuts");
 const partial=reduced.rows.find(row=>row.key==="walnuts");
 const covered=full.rows.find(row=>row.key==="walnuts");
 assert.equal(original.toBuy,75);
 assert.equal(partial.toBuy,30);
 assert.equal(partial.packsToBuy,1);
 assert.equal(covered.toBuy,0);
 assert.equal(covered.priceToBuy,0);
 assert.ok(full.knownPrice<=base.knownPrice);
});
test("selection bounds and unknown saved recipe IDs are discarded",()=>{
 const saved=custom.normalise({portions:{a:1,b:0,c:21,garbage:3,"br-oats":5},checked:{"oil|20":true,other:false}},recipes);
 assert.deepEqual({...saved.portions},{a:1,"br-oats":5});
 assert.equal(saved.checked["oil|20"],true);
 assert.equal(saved.checked.other,undefined);
 assert.equal(custom.slots(saved.portions,recipes).length,2);
});
