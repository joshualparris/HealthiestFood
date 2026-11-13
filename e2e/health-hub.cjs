'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium,firefox,webkit}=require('playwright');

const engineName=process.env.BROWSER_ENGINE||'chromium';
const engine={chromium,firefox,webkit}[engineName];
if(!engine)throw Error('Unsupported browser: '+engineName);
const base=path.resolve(__dirname,'..');
const available=new Map([
 ['/health-hub.html',['health-hub.html','text/html; charset=utf-8']],
 ['/health-hub-data.js',['health-hub-data.js','text/javascript; charset=utf-8']],
 ['/favicon.svg',['favicon.svg','image/svg+xml']]
]);
const server=http.createServer((req,res)=>{
 const pathName=new URL(req.url,'http://localhost').pathname;
 const item=available.get(pathName);
 if(!item){res.writeHead(404);res.end('Not found');return}
 const data=fs.readFileSync(path.join(base,item[0]));
 res.writeHead(200,{'content-type':item[1],'cache-control':'no-store'});
 res.end(data);
});
const listen=()=>new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const close=()=>new Promise(resolve=>server.close(resolve));
async function check(browser,viewport){
 const page=await browser.newPage({viewport});
 const errors=[];
 page.on('pageerror',error=>errors.push(String(error)));
 const url='http://127.0.0.1:'+server.address().port+'/health-hub.html';
 await page.goto(url,{waitUntil:'load'});
 await page.locator('article.site').first().waitFor();
 assert.equal(await page.locator('article.site').count(),22, 'all indexed projects render');
 const counters=await page.locator('#totalDetails').innerText();
 assert.match(counters,/33 destinations/);
 await page.locator('#search').fill('physio');
 assert.ok((await page.locator('article.site').count())>=2,'physio search works');
 await page.locator('#resetFilters').click();
 await page.locator('button[data-category="Movement"]').click();
 assert.equal(await page.locator('article.site').count(),2,'movement category works');
 await page.locator('button[data-status="live"]').click();
 assert.equal(await page.locator('article.site').count(),2,'combining filters works');
 await page.locator('#resetFilters').click();
 await page.locator('button[data-status="protected"]').click();
 assert.equal(await page.locator('article.site').count(),6,'protected sites are labelled separately');
 await page.locator('#resetFilters').click();
 await page.locator('button[data-save="healthlens"]').click();
 await page.locator('button[data-status="saved"]').click();
 assert.equal(await page.locator('article.site').count(),1,'saved filter works');
 await page.reload();
 await page.locator('button[data-status="saved"]').click();
 assert.equal(await page.locator('article.site').count(),1,'saved items persist on the same browser');
 const links=await page.locator('article.site a[target="_blank"]').count();
 assert.ok(links>=1);
 assert.equal(await page.locator('article.site a[target="_blank"]:not([rel="noopener noreferrer"])').count(),0,'outbound links use safe rel');
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
 assert.ok(overflow<=1,'no horizontal overflow on '+viewport.width+'px viewport: '+overflow);
 assert.deepEqual(errors,[],'no uncaught JS errors');
 await page.close();
}
(async()=>{
 await listen();
 let browser;
 try{
  browser=await engine.launch({headless:true});
  for(const viewport of [{width:1440,height:900},{width:390,height:844}])await check(browser,viewport);
  console.log('PASS health hub '+engineName+': desktop, mobile, search, combined filters, save, reload, links and JavaScript');
 }finally{
  if(browser)await browser.close();
  await close();
 }
})().catch(error=>{console.error(error);process.exitCode=1});
