/* Functional Playwright journey for the connected pantry-to-plan workflow. */
'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..'),mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const server=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname.replace(/^\/+/,''))||'index.html';
  const p=path.resolve(root,name);if(!p.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const buffer=await fs.readFile(p);res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream','Cache-Control':'no-store'});res.end(buffer);
 }catch{res.writeHead(404);res.end('Not found');}
});
async function run(){
 const remote=process.env.SMOKE_URL?.replace(/\/$/,'');
 if(!remote)await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url=remote||'http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch();
 try{
  for(const width of [390,1280]){
   const context=await browser.newContext({viewport:{width,height:844},acceptDownloads:true});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));
   await page.goto(url+'/smart-kitchen.html',{waitUntil:'domcontentloaded'});
   await page.locator('#connectedRecipe option').first().waitFor({state:'attached'});
   await page.locator('#connectedStart').fill('2026-11-18');
   await page.locator('#connectedBudget').fill('120');
   await page.locator('#connectedOptimise').click();
   assert.equal(await page.locator('#connectedPlanPreview .entry').count(),7);
   assert.match(await page.locator('#connectedPlanPreview').innerText(),/Known mapped-pack cost/);
   page.once('dialog',d=>d.accept());
   await page.locator('#connectedSave').click();
   assert.equal(await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('good-food-dated-schedule-v1')||'{}')).length),7);
   await page.locator('#connectedAisles').click();
   const first=page.locator('#connectedAisleEditor [data-aisle-key]').first();
   await first.fill('12');
   await page.locator('#connectedSaveAisles').click();
   const count=await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('good-food-v2-observed-aisles')||'{}')).length);
   assert.equal(count,1);
   await page.locator('#connectedRecipe').selectOption('a');
   assert.ok(await page.locator('#connectedIngredient option').count()>0);
   await page.locator('#connectedSwapPreview').click();
   assert.match(await page.locator('#connectedSwapResult').innerText(),/Nutrition estimates are invalid|nutrition estimates are invalid|nutrition estimates/i);
   page.once('dialog',d=>d.accept());
   await page.locator('#connectedSwapSave').click();
   let x=await page.evaluate(()=>JSON.parse(localStorage.getItem('good-food-user-recipes-v2')||'[]'));
   assert.equal(x.length,1);
   await page.locator('#recipePaste').fill(JSON.stringify({'@context':'https://schema.org','@type':'Recipe',name:'Woolworths vegan bean stew',recipeIngredient:['400 g lentils','200 g tomatoes'],recipeInstructions:[{text:'Simmer until fully cooked.'}]}));
   await page.locator('#extractRecipe').click();await page.locator('#saveImportedRecipe').click();
   await page.locator('#connectedImport').focus();
   assert.ok(await page.locator('#connectedImport option').count()>=1);
   await page.locator('#connectedImportReview').click();
   assert.match(await page.locator('#connectedImportResult').innerText(),/Woolworths vegan bean stew/);
   page.once('dialog',d=>d.accept());
   await page.locator('#connectedImportSave').click();
   x=await page.evaluate(()=>JSON.parse(localStorage.getItem('good-food-user-recipes-v2')||'[]'));
   assert.equal(x.length,2);
   if((new URL(url)).origin==="https://joshualparris.github.io"){
     await page.locator('#cloudSyncControls').waitFor({state:'visible',timeout:15000});
     assert.match(await page.locator('#cloudSyncStatus').innerText(),/Signed out|Signed in/);
     assert.equal(await page.locator('#cloudLogin').isDisabled(),true);
     assert.equal(await page.locator('#cloudRedirectConfirmed').isVisible(),true);
   }else{
     assert.match(await page.locator('#cloudSyncStatus').innerText(),/not connected|not configured|only enabled on the canonical/i);
     assert.equal(await page.locator('#cloudSyncControls').isVisible(),false);
   }
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('#connectedRecipe option').first().waitFor({state:'attached'});
   assert.ok(await page.locator('#connectedRecipe option').count()>=19);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+3);
   assert.equal(overflow,false,'Horizontal scroll at width '+width);
   assert.deepEqual(errors,[],'Browser JavaScript errors at '+width);
   await context.close();console.log('PASS connected pantry-to-cooking workflow at '+width+' px');
  }
 }finally{await browser.close();if(server.listening)await new Promise(resolve=>server.close(resolve));}
}
run().catch(e=>{console.error(e.stack||e);process.exitCode=1;if(server.listening)server.close();});
