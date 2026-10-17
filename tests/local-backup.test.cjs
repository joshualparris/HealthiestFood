const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const moduleCode=fs.readFileSync(path.join(__dirname,'..','local-backup.js'),'utf8');
const Data=require('../local-backup.js');
function memory(initial={}){const data=new Map(Object.entries(initial));return {get length(){return data.size},key:i=>[...data.keys()][i]||null,getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};}
test('Portable data module parses, is loaded before app, and UI exists',()=>{
 assert.doesNotThrow(()=>new vm.Script(moduleCode));
 const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
 assert.ok(html.indexOf('src="local-backup.js"')<html.indexOf('src="app.js"'));
 assert.ok(html.includes('id="exportFoodData"')&&html.includes('id="importFoodData"'));
});
test('Export copies only app-prefixed records, preserving JSON strings',()=>{
 const s=memory({'good-food-v6-progress':'{"days":[]}','good-food-cook-timers-v1':'{"a:1":{}}','other-service-token':'secret'});
 const parsed=Data.parse(Data.serialize(s,'render.example'));
 assert.equal(parsed.count,2);assert.equal(parsed.records['good-food-v6-progress'],'{"days":[]}');
 assert.equal(parsed.records['other-service-token'],undefined);
});
test('Import rejects unsafe keys, oversize file and non-JSON records',()=>{
 const invalid=k=>JSON.stringify({schema:Data.SCHEMA,records:{[k]:'{}'}});
 assert.throws(()=>Data.parse(invalid('other-token')));
 assert.throws(()=>Data.parse(JSON.stringify({schema:Data.SCHEMA,records:{'good-food-test':'not JSON'}})));
 assert.throws(()=>Data.parse('x'.repeat(1048577)));
});
test('Import replacement leaves unrelated storage keys intact',()=>{
 const storage=memory({'other-service-token':'keep','good-food-old':'{}'});
 const imported=Data.parse(JSON.stringify({schema:Data.SCHEMA,records:{'good-food-new':'{"done":true}'}}));
 assert.equal(Data.restore(storage,imported,true),1);
 assert.equal(storage.getItem('good-food-old'),null);
 assert.equal(storage.getItem('other-service-token'),'keep');
 assert.deepEqual(JSON.parse(storage.getItem('good-food-new')),{done:true});
});

test('Failed import set rolls back and leaves unrelated browser keys untouched',()=>{
 const base=memory({'other-service-token':'leave','good-food-existing':'{"count":8}'});
 let fail=true;
 const storage={get length(){return base.length},key:i=>base.key(i),getItem:k=>base.getItem(k),setItem(k,v){if(k==='good-food-new'&&fail){fail=false;throw new Error('quota')}base.setItem(k,v)}};
 const incoming=Data.parse(JSON.stringify({schema:Data.SCHEMA,records:{'good-food-new':'{"count":9}'}}));
 assert.throws(()=>Data.restore(storage,incoming,true),/Import failed/);
 assert.equal(storage.getItem('good-food-existing'),'{"count":8}');
 assert.equal(storage.getItem('good-food-new'),null);
 assert.equal(storage.getItem('other-service-token'),'leave');
});
test('Failed stale-key removal is covered by the import rollback',()=>{
 const base=memory({'other-service-token':'leave','good-food-old':'{"saved":true}'});
 let fail=true;
 const storage={get length(){return base.length},key:i=>base.key(i),getItem:k=>base.getItem(k),setItem:(k,v)=>base.setItem(k,v),removeItem(k){if(k==='good-food-old'&&fail){fail=false;throw new Error('storage denial')}base.removeItem(k)}};
 const incoming=Data.parse(JSON.stringify({schema:Data.SCHEMA,records:{'good-food-new':'{"saved":false}'}}));
 assert.throws(()=>Data.restore(storage,incoming,true),/Import failed/);
 assert.equal(storage.getItem('good-food-old'),'{"saved":true}');
 assert.equal(storage.getItem('good-food-new'),null);
 assert.equal(storage.getItem('other-service-token'),'leave');
});
