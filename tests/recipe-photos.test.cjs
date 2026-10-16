'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const file=p=>fs.readFileSync(path.join(root,p),'utf8');
const app=file('app.js'),css=file('site.css');
const expected=['br-oats','br-eggs','br-smoothie','br-toast','di-lentil','di-chicken','di-chilli','di-stirfry','di-salmon','sn-hummus','a','b','c','d','sn-apple','sn-eggs','sn-berries'];
test('all seventeen uploaded food photos are available as valid optimized WebP files',()=>{
 const match=app.match(/const RECIPE_PHOTOS=Object.freeze\((\{[^;]+\})\);/);
 assert.ok(match,'Recipe photo manifest must be explicit');
 const photos=JSON.parse(match[1]);
 assert.deepEqual(Object.keys(photos).sort(),expected.slice().sort());
 for(const [recipeId,image] of Object.entries(photos)){
  assert.equal(image,recipeId+'.webp');
  const bytes=fs.readFileSync(path.join(root,image));
  assert.ok(bytes.length>10000,'Image must be nonempty '+image);
  assert.equal(bytes.toString('ascii',0,4),'RIFF',image);
  assert.equal(bytes.toString('ascii',8,12),'WEBP',image);
 }
});
test('all meal cards and details use descriptive photos; illustration fallback remains safe for future recipes',()=>{
 assert.match(app,/alt="Illustrative food photograph of /);
 assert.match(app,/loading="lazy" decoding="async"/);
 assert.match(app,/image\|\|'<div class="mini-plate"/);
 assert.match(app,/RECIPE_PHOTOS\[r\.id\]\?'<figure class="recipe-detail-figure"/);
 assert.match(css,/\.recipe-card-image\{[^}]*object-fit:cover/);
 assert.match(css,/\.recipe-card-visual\.has-photo::after\{display:none\}/);
 assert.match(css,/prefers-reduced-motion:no-preference/);
 const sandbox={window:{}};vm.runInNewContext(file('site-data.js'),sandbox);
 vm.runInNewContext(file('whole-day-data.js'),sandbox);
 const ids=sandbox.window.FOOD_DATA.recipes.map(r=>r.id);
 assert.equal(ids.length,17);
 assert.deepEqual(Array.from(ids.filter(id=>!expected.includes(id))).sort(),[],'Every built-in recipe now has a real photograph');
});
test('offline shell includes the photographs and all displayed photo files exist',()=>{
 const sw=file('service-worker.js');
 for(const id of expected)assert.ok(sw.includes('"./'+id+'.webp"'),'Offline cache missing '+id);
 const html=file('index.html');
 assert.ok(html.includes('src="app.js"'));
});
