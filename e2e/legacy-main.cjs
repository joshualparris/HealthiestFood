/* Explicit old-iPad compatibility acceptance test.
 * Simulates modern main bundle failure; verifies every recipe and a useful shopping list.
 */
'use strict';
const {chromium,webkit}=require('playwright'),http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 try {
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname.replace(/^\/+/,''))||'index.html';
  const dest=path.resolve(root,name);
  if(!dest.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const bytes=await fs.readFile(dest);res.writeHead(200,{'Content-Type':mime[path.extname(dest)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);
 }catch(e){res.writeHead(404);res.end('Not found');}
});
async function run(){
 const remote=process.env.SMOKE_URL?.replace(/\/$/,'');
 if(!remote)await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=remote||'http://127.0.0.1:'+server.address().port;
 const engine=process.env.BROWSER_ENGINE==='webkit'?webkit:chromium;
 const browser=await engine.launch();
 try{
  for(const width of [390,768]){
   const context=await browser.newContext({viewport:{width,height:1024}});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/app.js',route=>route.abort());
   await page.route('**/whole-day-data.js',route=>route.abort());
   await page.goto(base+'/index.html#home',{waitUntil:'domcontentloaded'});
   await page.locator('#featuredCards .legacy-recipe-card').first().waitFor();
   assert.equal(await page.locator('#featuredCards .legacy-recipe-card').count(),4);
   await page.locator('#view-home .hero-actions [data-goto="recipes"]').click();
   await page.locator('#view-recipes').waitFor({state:'visible'});
   assert.equal(await page.locator('#recipeCards .legacy-recipe-card').count(),17);
   await page.locator('[data-recipe-type="breakfast"]').click();
   assert.equal(await page.locator('#recipeCards .legacy-recipe-card').count(),4);
   await page.locator('[data-recipe-type="all"]').click();
   await page.locator('#recipeCards a[data-legacy-select="a"]').click();
   assert.match(await page.locator('#recipeDetail').innerText(),/Lemon–paprika sardine bowls/);
   assert.ok(await page.locator('#recipeDetail ol li').count()>=7);
   assert.ok(await page.locator('#recipeDetail ul li').count()>=15);
   const before=await page.locator('#legacyServingCount').innerText();
   await page.locator('[data-legacy-portions="1"]').click();
   assert.notEqual(await page.locator('#legacyServingCount').innerText(),before);
   await page.locator('#recipeDetail [data-legacy-add="a"]').click();
   await page.locator('#view-shop').waitFor({state:'visible'});
   assert.match(await page.locator('#customShopping').innerText(),/Lemon–paprika sardine bowls/);
   await page.locator('#view-home').waitFor({state:'hidden'});
   await page.locator('.hero-actions [data-goto="plan"]').evaluate(el=>el.click());
   await page.locator('#view-plan').waitFor({state:'visible'});
   assert.match(await page.locator('#planGrid').innerText(),/newer browser/);
   await page.goto(base+'/index.html#shop',{waitUntil:'domcontentloaded'});
   await page.locator('#customShopping').waitFor({state:'visible'});
   assert.match(await page.locator('#customShopping').innerText(),/Lemon–paprika sardine bowls/);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+3),false,'Horizontal overflow '+width);
   // Other unrelated modern-only scripts may fail in simulated old browsers;
   // fallback itself must never throw.
   assert.equal(errors.filter(x=>/legacy-main\.js|GoodFoodLegacyRecipes/i.test(x)).length,0);
   await context.close();
   console.log('PASS 17 recipes, filtering, cooking method, shopping and navigation on old iPad fallback at '+width+'px');
  }
  const noJs=await browser.newContext({javaScriptEnabled:false,viewport:{width:768,height:1024}});
  const page=await noJs.newPage();
  await page.goto(base+'/index.html',{waitUntil:'domcontentloaded'});
  await page.locator('#view-home .hero-actions [data-goto="recipes"]').click();
  await page.waitForURL(/recipes-classic\.html/);
  assert.equal(await page.locator('main article').count(),17);
  assert.ok(await page.locator('main article ol li').count()>=60);
  await noJs.close();
  console.log('PASS Browse recipes works even with all JavaScript disabled');
 }finally{await browser.close();if(server.listening)await new Promise(resolve=>server.close(resolve));}
}
run().catch(e=>{console.error(e.stack||e);process.exitCode=1;if(server.listening)server.close();});
