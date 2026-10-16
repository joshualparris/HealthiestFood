'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const P=require('../pantry-lots.js'),S=require('../food-shopping.js');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const at=1760000000000,base={key:'rice',name:'Brown rice 1 kg',unit:'g',amount:800,condition:'unopened',location:'pantry',useBy:'',bestBefore:'2026-10-20',barcode:'09345678'};
test('Separate dated packs retain amounts, storage state and typed unverified barcode',()=>{
 const a=P.add([],base,at),b=P.add(a,{...base,amount:250,condition:'opened',location:'fridge',bestBefore:'2026-10-24'},at+1);
 assert.equal(b.length,2);
 assert.notEqual(b[0].id,b[1].id);
 assert.equal(P.totals(b,'2026-10-17').rice.amount,1050);
 assert.equal(P.totals(b,'2026-10-17').rice.lotCount,2);
 assert.equal(b[1].condition,'opened');
 assert.equal(b[0].barcode,'09345678');
});
test('An expired use-by never appears as suggested usable stock',()=>{
 const a=P.add([],{...base,key:'tofu',useBy:'2026-10-16',bestBefore:''},at);
 const b=P.add(a,{...base,key:'chickpeas',amount:300,useBy:'2026-10-18',bestBefore:''},at+1);
 assert.equal(P.status(a[0],'2026-10-17').id,'past-use-by');
 assert.equal(P.status(b[1],'2026-10-17').id,'dated');
 assert.equal(P.totals(b,'2026-10-17').tofu,undefined);
 assert.equal(P.ordered(b,'2026-10-17')[0].key,'chickpeas');
 assert.match(P.status(a[0],'2026-10-17').label,/do not eat/i);
});
test('Consumption and restocking are reversible, lot by lot, without editing recipe records',()=>{
 const a=P.add([],base,at),b=P.change(a,a[0].id,-200,at+1),c=P.change(b,a[0].id,40,at+2);
 assert.equal(a[0].amount,800);
 assert.equal(b[0].amount,600);
 assert.equal(c[0].amount,640);
 assert.equal(P.undo(c,a[0].id)[0].amount,600);
 assert.equal(P.undo(b,a[0].id)[0].amount,800);
 assert.equal(P.change(a,a[0].id,-801),null);
 assert.equal(P.change(a,a[0].id,NaN),null);
});
test('Invalid dates, forged IDs, negative stock and oversized barcodes are handled safely',()=>{
 const a=P.add([],{...base,amount:-3},at);assert.equal(a,null);
 const forged=P.clean({...P.add([],base,at)[0],id:'__proto__'});assert.equal(forged,null);
 const invalidDate=P.add([],{...base,useBy:'2026-02-30'},at)[0];
 assert.equal(invalidDate.useBy,'');
 assert.ok(P.add([],{...base,barcode:'0'.repeat(100)},at)[0].barcode.length<=40);
});
test('Persisted records are local-only and maintain independent ID, unit, date and lot count',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
 const a=P.add([],base,at);assert.equal(P.save(storage,a),true);
 const readBack=P.load(storage);assert.equal(readBack.length,1);
 assert.equal(readBack[0].amount,800);
 assert.ok(values.has('good-food-pantry-lots-v1'));
 assert.equal(values.has('good-food-planned-have-v1'),false,'Do not write shared shopping amounts without an explicit user action');
});
test('All known shopping mappings have a normalised name, key and supported unit',()=>{
 assert.ok(S.mappings.length>=15);
 for(const m of S.mappings){assert.ok(m.key&&m.buy,m.key);assert.ok(['g','mL','tins',''].includes(m.unit),m.key+': '+m.unit)}
});
test('Lot manager is wired into website and cached for offline after online visit',()=>{
 const html=read('index.html'),sw=read('service-worker.js'),custom=read('custom-shopping.js');
 assert.ok(html.includes('src="pantry-lots.js"'));
 assert.ok(html.includes('id="pantryLotManager"'));
 assert.ok(sw.includes('"./pantry-lots.js"'));
 assert.ok(custom.includes('goodfood:pantry-updated'));
 assert.match(read('site.css'),/\.pantry-lot-manager/);
 assert.doesNotThrow(()=>new vm.Script(read('pantry-lots.js')));
});
