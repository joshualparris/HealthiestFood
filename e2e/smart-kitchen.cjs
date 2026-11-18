/* Playwright smoke for Smart Kitchen, desktop and mobile, network-independent. */
'use strict';
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs/promises'),path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const server=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname.replace(/^\/+/,''))||'index.html';
  const file=path.resolve(root,name);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  const content=await fs.readFile(file);
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(content);
 }catch{res.writeHead(404);res.end('Not found');}
});
async function main(){
 const remote=process.env.SMOKE_URL?.replace(/\/$/,'');
 if(!remote)await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=remote||'http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of [390,1280]){
   const ctx=await browser.newContext({viewport:{width,height:844},acceptDownloads:true});
   const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));
   await page.goto(base+'/smart-kitchen.html',{waitUntil:'domcontentloaded'});
   await page.locator('#recognisedLotKey option').first().waitFor();
   const count=await page.locator('#recognisedLotKey option').count();
   assert.ok(count>=10,'Barcode pantry categories loaded');
   await page.locator('#groceryText').fill('Wild Pink Salmon 415g\nAustralian Brown Rice 1kg\nRed Lentils 500g');
   await page.locator('#detectProducts').click();
   assert.equal(await page.locator('#detectedProducts .entry').count(),3);
   await page.locator('#swapOriginal').selectOption('spinach');
   await page.locator('#swapAlternative').selectOption('bok-choy');
   await page.locator('#swapGrams').fill('200');await page.locator('#calculateSwap').click();
   assert.match(await page.locator('#swapResult').innerText(),/200 g Bok choy leaves/);
   await page.locator('#suggestMenu').click();
   assert.equal(await page.locator('#menuPreview .entry').count(),7);
   assert.match(await page.locator('#budgetStatus').innerText(),/estimate|unknown/i);
   await page.locator('#presetName').fill('My test week');await page.locator('#savePreset').click();
   assert.equal(await page.locator('#presetPicker option').count(),2);
   page.once('dialog',d=>d.accept());
   await page.locator('#saveToCalendar').click();
   const hasPlan=await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('good-food-dated-schedule-v1')||'{}')).length);
   assert.ok(hasPlan>=7);
   await page.locator('#recipePaste').fill(JSON.stringify({'@type':'Recipe',name:'Test lentil soup',recipeIngredient:['100 g lentils','2 carrots'],recipeInstructions:[{text:'Cook thoroughly.'}]}));
   await page.locator('#extractRecipe').click();
   await page.locator('#saveImportedRecipe').click();
   assert.match(await page.locator('#importedRecipes').innerText(),/Test lentil soup/);
   await page.locator('#nextStep').click();
   assert.match(await page.locator('#stepPosition').innerText(),/Step 2/);
   await page.locator('#timerMinutes').fill('1');await page.locator('#startTimer').click();
   assert.match(await page.locator('#smartTimers').innerText(),/Rice/);
   page.once('dialog',d=>d.accept());
   await page.locator('#addFreezer').click();
   assert.match(await page.locator('#freezerStock').innerText(),/5 remaining/);
   await page.reload({waitUntil:'domcontentloaded'});
   await page.locator('#recognisedLotKey option').first().waitFor();
   assert.match(await page.locator('#freezerStock').innerText(),/5 remaining/);
   assert.equal(await page.locator('#presetPicker option').count(),2);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+3);
   assert.equal(overflow,false,'Horizontal overflow at '+width+'px');
   assert.deepEqual(errors,[],'Client JS errors '+width);
   await ctx.close();console.log('PASS Smart Kitchen at '+width+'px');
  }
  const ctx=await browser.newContext({viewport:{width:390,height:844}});
  const home=await ctx.newPage(),errors=[];home.on('pageerror',e=>errors.push(e.message));
  await home.goto(base+'/index.html#home',{waitUntil:'domcontentloaded'});
  await home.locator('#view-home').waitFor({state:'visible'});
  await home.locator('#view-home a[href="smart-kitchen.html"]').click();
  await home.waitForURL(/#page$/);
  await home.frameLocator('#foodOtherFrame').locator('#recognisedLotKey option').first().waitFor();
  assert.deepEqual(errors,[]);
  await ctx.close();console.log('PASS Smart Kitchen in-app route');
 }finally{await browser.close();if(server.listening)await new Promise(resolve=>server.close(resolve));}
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;if(server.listening)server.close();});
