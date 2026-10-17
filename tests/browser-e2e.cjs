/* Real-browser smoke test. Run with:
 * npm install --no-save playwright && npx playwright install chromium
 * node tests/browser-e2e.cjs
 * Runs local static site; no account or retailer checkout.
 */
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
const path = require('node:path');
const port = 9876, url='http://127.0.0.1:'+port+'/';
const pause = ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function main(){
 const server=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:path.resolve(__dirname,'..'),stdio:'ignore'});
 let browser;
 try {
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1280,height:850}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  let opened=false;
  for(let i=0;i<20;i++){try{const r=await page.goto(url,{waitUntil:'domcontentloaded',timeout:4000});if(r?.ok()){opened=true;break;}}catch{}await pause(250);}
  assert.ok(opened,'Local site did not serve');
  await page.locator('#featuredCards .recipe-card').first().waitFor();
  assert.equal(await page.locator('#featuredCards .recipe-card').count(),4);
  await page.locator('#featuredCards [data-select="a"]').click();
  await page.locator('[data-servings="1"]').first().click();
  assert.equal(await page.locator('.stepper output').innerText(),'6');
  await page.locator('[data-start="a"]').click();
  await page.locator('#nextStep').click();
  assert.match(await page.locator('.cook-action-list').innerText(),/18 mL/);
  assert.ok(await page.locator('.cook-action-list > li').count()>=3,'Guided actions should be individually numbered');
  await page.locator('#timerToggle').click();
  await page.locator('#nextStep').click();
  await page.locator('#timerToggle').click();
  assert.equal(await page.locator('.timer-tile').count(),2);
  await page.locator('#prevStep').click();
  assert.equal(await page.locator('.timer-tile').count(),2,'Next/Previous must keep timers');
  await page.locator('#closeCook').click();
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#floatingTimers').waitFor();
  await page.locator('#floatingTimers').click();
  assert.equal(await page.locator('.timer-tile').count(),2,'Timer persistence across reload');
  await page.locator('#closeCook').click();
  await page.locator('.desktop-nav [data-route="science"]').click();
  await page.locator('#nutritionCoverage').waitFor();
  await page.locator('#nutritionDrink').selectOption('sogood');
  assert.match(await page.locator('#nutritionDrinkResult').innerText(),/400 mg/);
  await page.locator('.desktop-nav [data-route="plan"]').click();
  await page.locator('#dynamicShop .dynamic-shop-line').first().waitFor();
  const initial=await page.locator('#dynamicShop .dynamic-shop-line').count();
  assert.ok(initial>10,'Should list planned meals, not empty plan');
  await page.locator('#dynamicShop [data-planned-have]').first().check();
  await page.locator('#dynamicShop [data-shop-range="day"]').click();
  assert.ok(await page.locator('#dynamicShop .dynamic-shop-line').count()>0);
  await page.setViewportSize({width:390,height:844});
  await page.goto(url+'#home',{waitUntil:'domcontentloaded'});
  await page.locator('#featuredCards .recipe-card').first().waitFor();
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  assert.ok(overflow<=2,'Mobile horizontal overflow '+overflow+' px');
  assert.deepEqual(errors,[], 'Unhandled browser errors: '+errors.join('; '));
  console.log('PASS: 4 featured recipes, scaling, concurrent/persistent timers, labelled soy, planned shopping, mobile overflow');
 } finally {if(browser)await browser.close();server.kill();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
