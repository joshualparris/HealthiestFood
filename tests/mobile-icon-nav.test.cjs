const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const nav=html=>(html.match(/<nav class="mobile-nav"[\s\S]*?<\/nav>/)||[])[0];
const routes=['Home','Recipes and cooking','Meal planner','Shopping list','Nutrition research','Podcasts and videos','Compare cooking methods'];

test('seven mobile destinations are icons only and remain accessible',()=>{
 for(const file of ['index.html','cooking-methods.html']){
  const content=nav(read(file));
  assert.ok(content,'Missing mobile navigation in '+file);
  const entries=content.match(/<(?:button|a)\b[^>]*aria-label="[^"]+"[^>]*>/g)||[];
  assert.equal(entries.length,7,file);
  routes.forEach(name=>assert.ok(content.includes('aria-label="'+name+'"'),name+' in '+file));
  assert.equal((content.match(/<span aria-hidden="true">/g)||[]).length,7);
  // No visible word labels may slip outside the icon spans, notably "Methods".
  const visible=content.replace(/<span aria-hidden="true">[^<]*<\/span>/g,'')
    .replace(/<[^>]*>/g,'').replace(/\s/g,'');
  assert.equal(visible,'',file+' unexpectedly contains text in the bar');
  assert.ok(content.includes('href="cooking-methods.html"'),file);
 }
});

test('mobile bar has evenly sized targets and unambiguous selected-state styles',()=>{
 const css=read('site.css');
 assert.match(css,/\/\* Icon-only mobile navigation:/);
 assert.match(css,/\.mobile-nav\s*>\s*:is\(button,a\)[\s\S]*?flex:1 1 0/);
 assert.match(css,/min-height:51px/);
 assert.match(css,/\[aria-current="page"\]/);
 const main=read('app.js');
 assert.match(main,/b\.setAttribute\("aria-current","page"\)/);
 assert.match(main,/b\.removeAttribute\("aria-current"\)/);
 assert.match(nav(read('cooking-methods.html')),/href="cooking-methods\.html" aria-label="Compare cooking methods" aria-current="page"/);
});
