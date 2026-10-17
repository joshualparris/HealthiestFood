'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const rootPath=path.resolve(__dirname,'..');
const file=p=>fs.readFileSync(path.join(rootPath,p),'utf8');
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.attributes={};this.className='';this.textContent='';this.href='';this.rel='';this.target='';}
 append(x){this.children.push(x)}
}
function walk(el){return [el,...el.children.flatMap(walk)]}
const root=new Element('div'),window={};
const document={createElement:tag=>new Element(tag),getElementById:id=>id==='relatedHealthSites'?root:null};
vm.runInNewContext(file('related-health-sites.js'),{document,window},{timeout:2000});
test('longevity guide loads public deployment catalogue and offline disclosure',()=>{
 const html=file('longevity.html'),sw=file('service-worker.js');
 assert.match(html,/id="your-health-sites"/);
 assert.match(html,/href="#your-health-sites"/);
 assert.match(html,/src="related-health-sites\.js" defer/);
 assert.match(sw,/\.\/related-health-sites\.js/);
 const all=walk(root);
 assert.equal(all.filter(x=>x.tag==='article').length,8,'Eight distinct projects');
 assert.equal(all.filter(x=>x.className==='related-actions').length,8);
 assert.equal(all.filter(x=>x.tag==='details').length,1);
 assert.equal(all.filter(x=>x.tag==='h3').length,3);
 assert.match(all.find(x=>x.tag==='summary').textContent,/not currently reachable/);
});
test('all 13 distinct deployed URLs link out safely and three 404 references are clearly separate',()=>{
 const all=walk(root);
 const live=all.filter(x=>x.tag==='div'&&x.className==='related-actions')
   .flatMap(x=>x.children.filter(y=>y.tag==='a'));
 assert.equal(live.length,13);
 assert.equal(new Set(live.map(x=>x.href)).size,13);
 for(const a of live){
  assert.match(a.href,/^https:\/\//);
  assert.equal(a.target,'_blank');
  assert.equal(a.rel,'noopener noreferrer');
  assert.ok(!/localhost|127\.0\.0\.1|\/login\b/.test(a.href));
 }
 const external=window.RelatedHealthSites;
 assert.equal(external.groups.length,3);
 assert.equal(external.groups.reduce((s,g)=>s+g.items.length,0),8);
 assert.equal(external.groups.flatMap(g=>g.items.flatMap(item=>item.links)).length,13);
 assert.equal(external.unavailable.length,3);
 assert.ok(external.unavailable.every(x=>!live.some(a=>a.href===x.url)),'Offline sites cannot be labelled public');
 const unpublished=all.filter(x=>x.tag==='li').flatMap(x=>x.children).filter(x=>x.tag==='a');
 assert.equal(unpublished.length,3);
 assert.ok(unpublished.every(x=>x.textContent.includes('currently 404')));
});
test('public guide avoids copying personal health records or inventing longevity outcomes',()=>{
 const html=file('longevity.html');
 const js=file('related-health-sites.js');
 assert.match(html,/not medical endorsements/);
 assert.match(js,/do not share your browser storage or health records/i);
 assert.doesNotMatch(js,/recovery.key|heartbug|symbicort|bisoprolol|jcv|ferritin/i);
 assert.doesNotMatch(js,/guarantee(?:s|d)? (?:longevity|lifespan)/i);
});
