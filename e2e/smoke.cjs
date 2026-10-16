/* Playwright functional smoke tests against the actual static site.
 * Run: npm install --no-save playwright && npx playwright install chromium && node e2e/smoke.cjs
 * No analytics, account, external pricing requests or data writes.
 */
'use strict';
const { chromium, webkit, firefox } = require('playwright');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
const server = http.createServer(async(req,res)=>{
  try {
    const pathname = new URL(req.url,'http://localhost').pathname;
    const name = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).replace(/^\/+/, '');
    const file = path.resolve(root,name);
    if (!file.startsWith(root + path.sep)) {res.writeHead(403); res.end(); return;}
    const content=await fs.readFile(file);
    res.writeHead(200,{'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});
    res.end(content);
  } catch {res.writeHead(404); res.end('Not found');}
});
async function main(){
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browserName=process.env.BROWSER_ENGINE||'chromium';
  const engine={chromium,webkit,firefox}[browserName];
  if(!engine)throw Error('Unsupported browser engine '+browserName);
  const browser=await engine.launch({headless:true});
  process.stdout.write('Browser engine: '+browserName+'\\n'.replace('\\n','\n'));
  let assertions=0;
  async function check(name,fn){
    try{await fn();assertions++;process.stdout.write('PASS '+name+'\n');}
    catch(e){process.stderr.write('FAIL '+name+'\n'+(e.stack||e)+'\n');throw e;}
  }
  try{
    const page=await browser.newPage({viewport:{width:390,height:844}});
    const runtimeErrors=[];
    page.on('pageerror',e=>runtimeErrors.push(e.message));
    await page.goto(base,{waitUntil:'domcontentloaded'});
    await check('app initialises and shows homepage',async()=>{
      await page.locator('#view-home').waitFor({state:'visible'});
      assert.match(await page.title(),/Good Food, Long Game/);
    });
    await check('17 recipes and category controls render',async()=>{
      await page.locator('.mobile-nav [data-goto="recipes"]').click();
      assert.equal(await page.locator('#recipeCards .recipe-card').count(),17);
      await page.locator('[data-recipe-type="breakfast"]').click();
      assert.equal(await page.locator('#recipeCards .recipe-card').count(),4);
      await page.locator('[data-recipe-type="all"]').click();
    });
    await check('recipe scales and guided ingredient prep persists',async()=>{
      await page.locator('#recipeCards .recipe-click').first().click();
      assert.equal((await page.locator('.stepper output').innerText()).trim(),'5');
      await page.locator('[data-servings="1"]').click();
      assert.equal((await page.locator('.stepper output').innerText()).trim(),'6');
      await page.locator('[data-start="a"]').click();
      await page.locator('.cook-prep summary').click();
      const ingredient=page.locator('.cook-prep [data-prep-index="0"]');
      await ingredient.check();
      assert.equal(await ingredient.isChecked(),true);
      await page.locator('#nextStep').click();
      await page.locator('.cook-prep summary').click();
      assert.equal(await ingredient.isChecked(),true);
      assert.match(await page.locator('.cook-prep summary').innerText(),/6 portions/);
    });
    await check('two overlapping timers persist after page refresh',async()=>{
      await page.locator('#prevStep').click();
      await page.locator('#timerToggle').click();
      await page.locator('#nextStep').click();
      await page.locator('#timerToggle').click();
      assert.equal(await page.locator('#timerDashboard .timer-tile').count(),2);
      await page.reload({waitUntil:'domcontentloaded'});
      assert.equal(await page.locator('#floatingTimerCount').innerText(),'2');
      await page.locator('#floatingTimers').click();
      assert.equal(await page.locator('#timerDashboard .timer-tile').count(),2);
      await page.locator('#timerDashboard [data-timer-action="pause"]').first().click();
      assert.equal(await page.locator('#timerDashboard .timer-tile.paused').count(),1);
      await page.locator('#timerDashboard [data-timer-action="reset"]').first().click();
      assert.equal(await page.locator('#timerDashboard .timer-tile').count(),2);
      await page.locator('#timerDashboard [data-timer-action="dismiss"]').first().click();
      assert.equal(await page.locator('#timerDashboard .timer-tile').count(),1);
      await page.locator('#closeCook').click();
    });
    await check('shopping ticks persist after refresh',async()=>{
      await page.locator('.mobile-nav [data-goto="shop"]').click();
      await page.locator('#shopTotal').waitFor({state:'visible'});
      assert.match(await page.locator('#shopTotal').innerText(),/256\.43/);
      await page.locator('[data-filter="all"]').click();
      await page.locator('#shoppingList [data-item="0"]').check();
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('.mobile-nav [data-goto="shop"]').click();
      await page.locator('[data-filter="all"]').click();
      assert.equal(await page.locator('#shoppingList [data-item="0"]').isChecked(),true);
    });
    await check('dated plan provides editable portions and weekly ingredient checklist',async()=>{
      await page.locator('.mobile-nav [data-goto="plan"]').click();
      await page.locator('#plannerHeading').waitFor();
      const first=page.locator('[data-slot-portions]').first();
      await first.fill('2');
      await first.dispatchEvent('change');
      await page.locator('.planner-week-shopping summary').click();
      const rows=page.locator('.planner-shopping-items [data-plan-shop]');
      assert.ok(await rows.count()>4);
      await rows.first().check();
      assert.equal(await rows.first().isChecked(),true);
    });
    await check('no uncaught browser runtime errors',async()=>assert.deepEqual(runtimeErrors,[]));
    await page.close();
    for(const width of [360,390,430,768,1280]){
      await check('no horizontal overflow at '+width+'px',async()=>{
        const p=await browser.newPage({viewport:{width,height:850}});
        await p.goto(base,{waitUntil:'domcontentloaded'});
        const size=await p.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth,
          overshooting:[...document.querySelectorAll('body *')].filter(el=>{
            const st=getComputedStyle(el);if(st.display==='none'||st.visibility==='hidden')return false;
            const r=el.getBoundingClientRect();return r.right>innerWidth+3||r.left< -3;
          }).slice(0,15).map(el=>({tag:el.tagName,id:el.id,cls:String(el.className).slice(0,70),
            left:Math.round(el.getBoundingClientRect().left),right:Math.round(el.getBoundingClientRect().right),
            scroll:el.scrollWidth,client:el.clientWidth}))}));
        assert.ok(size.scroll <= size.viewport+2,JSON.stringify(size));
        await p.close();
      });
    }
    process.stdout.write('Passed '+assertions+' browser checks.\n');
  }finally{await browser.close();}
}
main().catch(err=>{process.stderr.write(String(err.stack||err)+'\n');process.exitCode=1;}).finally(()=>server.close());
