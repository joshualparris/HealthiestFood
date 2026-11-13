'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=(file)=>fs.readFileSync(path.join(root,file),'utf8');
const sandbox={window:{}};
vm.runInNewContext(read('health-hub-data.js'),sandbox,{timeout:2000});
const catalog=sandbox.window.JoshHealthHubCatalog;

test('health hub has a coherent multi-project health catalogue',()=>{
 assert.equal(catalog.schema,'josh-health-hub-catalog-v1');
 assert.equal(catalog.checked,'2026-11-13');
 assert.ok(catalog.items.length>=20,'catalogue must cover legacy and newer projects');
 const ids=catalog.items.map(x=>x.id);
 assert.equal(new Set(ids).size,ids.length);
 const cats=new Set(catalog.categories.map(x=>x.id));
 const statuses=new Set(['live','protected','unavailable','source']);
 for(const item of catalog.items) {
  assert.ok(cats.has(item.category),'valid category for '+item.id);
  assert.ok(statuses.has(item.status),'valid status for '+item.id);
  assert.match(item.url,/^https:\/\//,'secure primary link for '+item.id);
  assert.ok(item.description.length>20);
  for(const link of item.links||[]) {
   assert.match(link.url,/^https:\/\//,'secure alias for '+item.id);
   assert.ok(statuses.has(link.status),'alias status for '+item.id);
  }
 }
});
test('prior inactive and protected sites are not presented as accessible',()=>{
 const byId=Object.fromEntries(catalog.items.map(x=>[x.id,x]));
 assert.equal(byId['healthlens'].status,'protected');
 assert.equal(byId['healthreference'].status,'protected');
 assert.equal(byId['healthiest-people'].status,'unavailable');
 assert.equal(byId['sleepy'].status,'unavailable');
 assert.equal(byId['health-data-manager'].status,'source');
 assert.equal(byId['joshhealthhub'].status,'live');
 assert.ok(byId['josh-health-analyser'].links.every(x=>x.status==='live'));
});
test('standalone interactive page loads its catalogue first, supports filters, favourites and external-link safety',()=>{
 const html=read('health-hub.html');
 assert.match(html,/<script src="health-hub-data\.js"><\/script>/);
 assert.match(html,/<input id="search" type="search"/);
 assert.match(html,/id="categoryFilters"/);
 assert.match(html,/id="statusFilters"/);
 assert.match(html,/data\.setAttribute|setAttribute\('aria-pressed'/);
 assert.match(html,/localStorage\.setItem/);
 assert.match(html,/navigator\.clipboard\.writeText/);
 assert.match(html,/noopener noreferrer/);
 assert.match(html,/id="resultCount" role="status" aria-live="polite"/);
 assert.match(html,/prefers-reduced-motion/);
 assert.ok(html.indexOf('<script src="health-hub-data.js"></script>')<html.indexOf("const catalog = window.JoshHealthHubCatalog"));
});
test('nutrition and longevity website cross-links the new hub',()=>{
 assert.match(read('index.html'),/href="health-hub\.html"/);
 assert.match(read('longevity.html'),/href="health-hub\.html"/);
 assert.match(read('longevity.html'),/EARLIER DEPLOYMENT SNAPSHOT/);
});
test('public directory embeds no sensitive health metrics, source export or credentials',()=>{
 const src=read('health-hub-data.js');
 const html=read('health-hub.html');
 assert.doesNotMatch(src,/heartbug|bisoprolol|medicare|jcv|ferritin|memory\.dmp|Health Connect \(7\)\.zip/i);
 assert.doesNotMatch(src,/\bsk-(?:proj|live)-[a-zA-Z0-9]+/);
 assert.doesNotMatch(src,/@gmail\.com|@avance\.technology|@cornerstone\.edu\.au/i);
 assert.doesNotMatch(html,/fetch\(|XMLHttpRequest|sendBeacon/);
});
