/* Cross-browser shop-to-cook functional test, no external network/retail calls.
 * Run after installing playwright: node e2e/ten-lunch.cjs
 */
'use strict';
const {chromium,firefox,webkit}=require('playwright');
const http=require('node:http');
const fs=require('node:fs/promises');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const server=http.createServer(async(req,res)=>{
 try{
  const name=new URL(req.url,'http://localhost').pathname.replace(/^\/+/,'')||'index.html';
  const full=path.resolve(root,decodeURIComponent(name));
  if(!full.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const contents=await fs.readFile(full);
  res.writeHead(200,{'Content-Type':mime[path.extname(full)]||'application/octet-stream','Cache-Control':'no-store'});res.end(contents);
 }catch{res.writeHead(404);res.end('Not found');}
});
async function run(){
 const remote=process.env.SMOKE_URL?.replace(/\/$/,'');
 if(!remote)await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=remote||'http://127.0.0.1:'+server.address().port;
 const engine=({chromium,firefox,webkit})[process.env.BROWSER_ENGINE||'chromium'];
 if(!engine)throw Error('Unknown BROWSER_ENGINE');
 const browser=await engine.launch();
 try{
  for(const width of [390,1280]){
   const context=await browser.newContext({viewport:{width,height:844}});
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/ten-lunch-cook.html',{waitUntil:'domcontentloaded'});
   await page.locator('#shopList .ingredient').first().waitFor();
   assert.equal(await page.locator('#shopList .ingredient').count(),21);
   await page.locator('input[data-item="salmon"]').fill('1');
   await page.locator('input[data-item="spinach"]').fill('280');
   assert.match(await page.locator('#shortList').innerText(),/Pink salmon.*1 tins/);
   assert.match(await page.locator('#shortList').innerText(),/Spinach.*120 g/);
   await page.locator('#tab-cook').click();
   assert.equal(await page.locator('#pane-cook').isVisible(),true);
   assert.equal(await page.locator('#steps .step').count(),18);
   await page.locator('input[data-step="containers"]').check();
   assert.match(await page.locator('#counts').innerText(),/1 \/ 18 cooking steps/);
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('#steps .step').first().waitFor();
   assert.equal(await page.locator('input[data-step="containers"]').isChecked(),true);
   assert.equal(await page.locator('input[data-item="salmon"]').inputValue(),'1');
   await page.locator('#tab-finish').click();
   assert.equal(await page.locator('#freezerLabels .f-label').count(),10);
   await page.emulateMedia({media:'print'});
   assert.equal(await page.locator('#pane-finish').evaluate(e=>getComputedStyle(e).display!=='none'),true);
   await page.emulateMedia({media:'screen'});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2);
   assert.equal(overflow,false,'Horizontal overflow at '+width);
   assert.deepEqual(errors,[],'Browser console errors at '+width);
   page.once('dialog',d=>d.accept());
   await page.locator('#resetSession').click();
   assert.match(await page.locator('#counts').innerText(),/0 \/ 21 ingredients/);
   await context.close();
   process.stdout.write('PASS standalone ten-lunch experience at '+width+'px\n');
  }
  // Simulate legacy Safari: the modern syntax bundle fails to load.
  // The ES5 fallback must still build the checklist and switch to cooking.
  const oldContext=await browser.newContext({viewport:{width:768,height:1024}});
  const oldPage=await oldContext.newPage();
  await oldPage.route('**/ten-lunch-planner.js',route=>route.abort());
  await oldPage.goto(base+'/ten-lunch-cook.html',{waitUntil:'domcontentloaded'});
  await oldPage.locator('#shopList .ingredient').first().waitFor();
  assert.equal(await oldPage.locator('#shopList .ingredient').count(),21);
  await oldPage.locator('input[data-item="salmon"]').fill('1');
  await oldPage.locator('input[data-item="salmon"]').blur();
  await oldPage.locator('#pane-shop button[data-tab="cook"]').click();
  assert.equal(await oldPage.locator('#pane-cook').isVisible(),true,'Old Safari cook button must work');
  assert.equal(await oldPage.locator('#steps .step').count(),18);
  await oldPage.locator('input[data-step="containers"]').check();
  assert.match(await oldPage.locator('#counts').innerText(),/1 \/ 18 steps/);
  await oldPage.reload({waitUntil:'domcontentloaded'});
  assert.equal(await oldPage.locator('#pane-cook').isVisible(),true,'Legacy progress persists');
  await oldContext.close();
  process.stdout.write('PASS iPad Safari ES5 fallback with modern script unavailable\n');
  // If all JavaScript fails, the full instructions must remain readable.
  const noJsContext=await browser.newContext({javaScriptEnabled:false,viewport:{width:768,height:1024}});
  const noJsPage=await noJsContext.newPage();
  await noJsPage.goto(base+'/ten-lunch-cook.html',{waitUntil:'domcontentloaded'});
  assert.equal(await noJsPage.locator('#staticCookingSteps .phase').count(),5);
  assert.equal(await noJsPage.locator('#staticCookingSteps li').count(),18);
  assert.equal(await noJsPage.locator('#staticCookingSteps').isVisible(),true);
  await noJsContext.close();
  process.stdout.write('PASS static instructions when JavaScript is disabled\n');
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const p=await context.newPage();const errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'/#home',{waitUntil:'domcontentloaded'});
  await p.locator('#view-home').waitFor({state:'visible'});
  await p.locator('#view-home .hero-actions a[href="ten-lunch-cook.html"]').click();
  await p.waitForURL(/#page$/);
  await p.frameLocator('#foodOtherFrame').locator('#shopList .ingredient').first().waitFor();
  assert.equal(await p.frameLocator('#foodOtherFrame').locator('#shopList .ingredient').count(),21);
  assert.deepEqual(errors,[]);
  await context.close();process.stdout.write('PASS embedded in-app route\n');
 }finally{await browser.close();if(server.listening)await new Promise(resolve=>server.close(resolve));}
}
run().catch(e=>{console.error(e.stack||e);process.exitCode=1;if(server.listening)server.close();});
