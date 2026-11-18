const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const T=require('../ten-lunch-planner.js');

test('new batch-cook module and HTML script parse',()=>{
  assert.doesNotThrow(()=>new vm.Script(read('ten-lunch-planner.js')));
  const html=read('ten-lunch-cook.html');
  assert.ok(html.includes('<script src="ten-lunch-planner.js" defer>'));
  assert.ok(html.includes('id="printDate"'));
  for(const name of ['shopList','shortList','counts','progress','steps','doneSummary','freezerLabels','pageTitle','pane-shop','pane-cook','pane-finish'])
    assert.ok(html.includes('id="'+name+'"'),'Missing DOM target '+name);
  assert.equal((html.match(/class="f-label"/g)||[]).length,10);
  assert.equal((html.match(/<strong>A[1-5] · Salmon/g)||[]).length,5);
  assert.equal((html.match(/<strong>B[1-5] · Tofu/g)||[]).length,5);
});
test('exact shopping quantities are reconciled across two 5-portion batches',()=>{
 const qty=Object.fromEntries(T.items.map(x=>[x.id,x.need]));
 assert.equal(T.items.length,21);
 assert.equal(qty.salmon,2); assert.equal(qty.lentils,300); assert.equal(qty.quinoa,150);
 assert.equal(qty.rice,200); assert.equal(qty.tofu,450);assert.equal(qty.chickpeas,1);
 assert.equal(qty.broccoli,700);assert.equal(qty.spinach,400);assert.equal(qty.carrot,450);
 assert.equal(qty.onion,350); assert.equal(qty.passata,700);assert.equal(qty.oil,40);
 assert.equal(qty.pumpkin,400);assert.equal(qty.capsicum,200);assert.equal(qty.garlic,20);
 const html=read('ten-lunch-cook.html');
 for(const count of ['400 g broccoli','300 g broccoli','200 g greens','150 g dry quinoa','200 g dry brown rice','400 g passata','300 g passata'])
  assert.ok(html.includes(count),count);
});
test('in-basket amounts are clamped and missing quantities never negative',()=>{
 const by=id=>T.items.find(x=>x.id===id);
 assert.equal(T.gap(by('salmon'),0),2);
 assert.equal(T.gap(by('salmon'),1),1);
 assert.equal(T.gap(by('salmon'),2),0);
 assert.equal(T.gap(by('salmon'),99),0);
 assert.equal(T.gap(by('spinach'),280),120);
 assert.equal(T.gap(by('spinach'),-10),400);
 assert.equal(T.gap(by('spinach'),NaN),400);
 assert.equal(T.gap(by('quinoa'),'150'),0);
 const state=T.normalise({have:{salmon:1,spinach:280,lentils:99999},done:{setup:true,containers:true,garbage:true},tab:'hijack'});
 assert.equal(state.have.salmon,1);
 assert.equal(state.have.spinach,280);
 assert.equal(state.have.lentils,300);
 assert.equal(state.done.containers,true);
 assert.equal(state.done.garbage,undefined);
 assert.equal(state.tab,'shop');
 assert.match(T.shoppingText(state),/Pink salmon.*1 tins/);
 assert.match(T.shoppingText(state),/Spinach.*120 g/);
});
test('all shopping targets complete and cooking checklist 18 steps',()=>{
 let state=T.normalise({});
 assert.equal(T.missing(state).length,T.items.length);
 state.have=Object.fromEntries(T.items.map(i=>[i.id,i.need]));
 assert.equal(T.missing(state).length,0);
 assert.equal(T.completed(state),0);
 assert.equal(T.totalSteps,18);
 for(const p of T.phases)for(const [id] of p.steps)state.done[id]=true;
 assert.equal(T.completed(state),18);
});
test('offline cache and in-app link include new guide',()=>{
 const sw=read('service-worker.js'),html=read('index.html'),pages=read('app-pages.js');
 assert.ok(sw.includes('"./ten-lunch-cook.html"'));
 assert.ok(sw.includes('"./ten-lunch-planner.js"'));
 assert.ok(html.includes('href="ten-lunch-cook.html"'));
 assert.ok(pages.includes('"ten-lunch-cook.html":{route:"page",frame:"foodOtherFrame"}'));
});
test('guide labels unverified photo inference and preserves food safety boundaries',()=>{
 const h=read('ten-lunch-cook.html'),js=read('ten-lunch-planner.js');
 assert.match(h,/photo hints are|Photo hints are/);
 assert.match(js,/Possibly seen in your basket photo/);
 assert.match(h,/within two hours/i);
 assert.match(h,/Reheat until steaming hot/i);
 assert.match(h,/local|device/i);
 assert.match(js,/confirm\("Clear this 10-lunch/);
 assert.ok(!/face.?recognition/i.test(js));
});
