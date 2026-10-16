const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const read=f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8');
const sandbox={window:{},Intl,Date};vm.createContext(sandbox);
for(const p of ['site-data.js','whole-day-data.js','media-data.js','media-library.js'])vm.runInContext(read(p),sandbox,{filename:p});
const M=sandbox.window.FoodMediaData,C=sandbox.window.FoodMedia,R=sandbox.window.FOOD_DATA.recipes;
test('All 23 publisher-linked resources are original podcasts or videos',()=>{
 assert.equal(M.items.length,23);
 assert.equal(M.items.filter(x=>x.kind==='podcast').length,16);
 assert.equal(M.items.filter(x=>x.kind==='video').length,7);
 assert.equal(new Set(M.items.map(x=>x.id)).size,23);
 for(const item of M.items){
  assert.ok(item.title&&item.claim&&item.limitations&&item.primary&&item.publisher&&item.topic,item.id);
  assert.ok(item.claim!==item.limitations,item.id);
  assert.match(item.url,/^https:\/\//,item.id);
  assert.match(item.primary,/^https:\/\//,item.id);
  assert.notEqual(C.safeUrl(item.url),'#',item.id+' resource');
  assert.notEqual(C.safeUrl(item.primary),'#',item.id+' research');
  assert.ok(Array.isArray(item.recipes));
 }
});
test('Every adult recipe has related explanation without claiming recipe-specific longevity proof',()=>{
 assert.equal(R.length,17);
 for(const r of R){
  const selected=M.relatedForRecipe(r);
  assert.ok(selected.length>=1,r.id);
  assert.ok(selected.length<=3);
  const html=C.relatedMarkup(r);
  assert.match(html,/Why these ingredients/i);
  assert.match(html,/Browse all podcasts/);
  assert.match(html,/does not|not a claim/i);
  assert.ok(selected.every(x=>x.recipes.includes(r.id)));
 }
});
test('Media search and format/subject filters are independent and honour user choices',()=>{
 assert.equal(C.filtered().length,23);
 C.state.kind='video';assert.equal(C.filtered().length,7);
 C.state.topic='Food safety';assert.equal(C.filtered().length,5);
 C.state.kind='podcast';assert.equal(C.filtered().length,0);
 C.state.kind='all';C.state.topic='all';C.state.query='calcium';
 assert.ok(C.filtered().some(x=>x.id==='calcium'));
 C.state.query='';assert.equal(C.filtered().length,23);
});
test('Media links reject javascript and unapproved unrelated domains',()=>{
 for(const invalid of ['javascript:alert(1)','https://evil.example/','http://www.abc.net.au/','https://youtube.com.evil.example/watch?v=abc']) assert.equal(C.safeUrl(invalid),'#');
});
test('Mobile, desktop, science and longevity-guide media entry points are wired',()=>{
 const html=read('index.html'),app=read('app.js'),guide=read('longevity.html'),sw=read('service-worker.js');
 assert.ok(html.includes('id="view-media"'));
 assert.ok(html.includes('id="mediaLibrary"'));
 assert.ok(html.includes('data-route="media"'));
 assert.ok(html.includes('data-goto="media"'));
 assert.ok(html.includes('src="media-data.js"'));
 assert.ok(html.includes('src="media-library.js"'));
 assert.ok(html.indexOf('src="media-library.js"')<html.indexOf('src="app.js"'));
 assert.ok(app.includes('window.FoodMedia?.init()'));
 assert.ok(app.includes('window.FoodMedia?.injectRecipe(r'));
 assert.ok(/function setRoute\(route\)/.test(app) && /"media"[^\n]*\.includes\(route\)/.test(app),"Media remains in the recognised routes, even when new app-page routes are added");
 assert.ok(guide.includes('index.html?topic=Meal%20timing#media'));
 assert.ok(guide.includes('index.html?topic=Calcium%20%26%20fortification#media'));
 assert.ok(sw.includes('./media-data.js')&&sw.includes('./media-library.js'));
 assert.ok(read('site.css').includes('.media-grid{'));
 assert.doesNotThrow(()=>new vm.Script(read('media-data.js')));
 assert.doesNotThrow(()=>new vm.Script(read('media-library.js')));
});
test('Official FSANZ cooking-safety video links are publisher-grounded and not unrelated content',()=>{
 const videos=M.items.filter(x=>x.kind==='video'&&x.topic==='Food safety');
 assert.equal(videos.length,5);
 for(const v of videos)assert.ok(v.publisher.includes('Food Standards Australia New Zealand'));
 assert.ok(videos.every(x=>x.primary==='https://www.foodstandards.gov.au/consumer/prevention-of-foodborne-illness/food-safety-basics'));
});
