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
  if(!process.env.SMOKE_URL)await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=process.env.SMOKE_URL?.replace(/\/$/,'')||'http://127.0.0.1:'+server.address().port;
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
    if(!process.env.SMOKE_URL)await check('mobile podcast/video navigation and source-linked topic search',async()=>{
      await page.locator('.mobile-nav [data-goto="media"]').click();
      await page.locator('#view-media').waitFor({state:'visible'});
      assert.equal(await page.locator('#mediaResults .media-resource').count(),23);
      await page.locator('[data-media-kind="video"]').click();
      assert.equal(await page.locator('#mediaResults .media-resource').count(),7);
      await page.locator('#mediaTopic').selectOption('Food safety');
      assert.equal(await page.locator('#mediaResults .media-resource').count(),5);
      await page.locator('#mediaSearch').fill('leftovers');
      assert.equal(await page.locator('#mediaResults .media-resource').count(),1);
      const media=page.locator('#mediaResults .media-resource').first();
      assert.match(await media.innerText(),/What it does not prove/);
      assert.equal(await media.locator('a[target="_blank"]').count(),2);
      await page.locator('#mediaSearch').fill('');
      await page.locator('#mediaTopic').selectOption('all');
      await page.locator('[data-media-kind="all"]').click();
      assert.equal(await page.locator('#mediaResults .media-resource').count(),23);
    });
    await check('17 recipes and category controls render',async()=>{
      await page.locator('.mobile-nav [data-goto="recipes"]').click();
      assert.equal(await page.locator('#recipeCards .recipe-card').count(),17);
      await page.locator('[data-recipe-type="breakfast"]').click();
      assert.equal(await page.locator('#recipeCards .recipe-card').count(),4);
      await page.locator('[data-recipe-type="all"]').click();
    });
    await check('meal filters never leave an unrelated expanded recipe underneath',async()=>{
      const cases=[
        ['breakfast',4,/Berry, chia & walnut overnight oats/],
        ['lunch',4,/Lemon.paprika sardine bowls/],
        ['dinner',5,/Tomato lentil/],
        ['snack',4,/Crunchy vegetables/]
      ];
      for(const [category,count,expected] of cases){
        await page.locator('[data-recipe-type="'+category+'"]').click();
        assert.equal(await page.locator('#recipeCards .recipe-card').count(),count);
        assert.match(await page.locator('#recipeDetail h2').innerText(),expected);
        assert.equal(await page.locator('[data-recipe-type="'+category+'"]').getAttribute('aria-pressed'),'true');
      }
      await page.locator('[data-recipe-type="breakfast"]').click();
      await page.locator('#recipeCards [data-select="br-eggs"]').click();
      assert.match(await page.locator('#recipeDetail h2').innerText(),/Spinach, mushroom & egg scramble/);
      await page.locator('.mobile-nav [data-goto="home"]').click();
      await page.locator('#featuredCards [data-select="a"]').click();
      assert.equal(await page.locator('[data-recipe-type="lunch"]').getAttribute('aria-pressed'),'true');
      assert.match(await page.locator('#recipeDetail h2').innerText(),/Lemon.paprika sardine bowls/);
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
      const shopLoaded=await page.locator('#shopTotal').isVisible();
      if(!shopLoaded){
        const state=await page.evaluate(()=>({
          href:location.href,hash:location.hash,ready:document.readyState,
          views:[...document.querySelectorAll('.view')].map(v=>({id:v.id,hidden:v.hidden,classes:v.className})),
          selectedNav:[...document.querySelectorAll('.mobile-nav button')].filter(x=>x.classList.contains('active')).map(x=>x.dataset.goto)
        }));
        process.stdout.write('SHOP DEBUG '+JSON.stringify({state,runtimeErrors})+'\n');
      }
      await page.locator('#shopTotal').waitFor({state:'visible',timeout:6000});
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
    await check('dated Woolworths shopper observation is saved without claiming live prices',async()=>{
      const p=await browser.newPage({viewport:{width:390,height:844}});
      await p.goto(base+'/product-check.html',{waitUntil:'domcontentloaded'});
      const product=p.locator('.verify-card[data-product-id="98523"]');
      await product.waitFor();
      await product.locator('[data-field="price"]').fill('4.25');
      await product.locator('[data-field="stock"]').selectOption('available');
      await product.locator('[data-field="labelChecked"]').check();
      await product.locator('[data-save-product]').click();
      await p.reload({waitUntil:'domcontentloaded'});
      assert.equal(await p.locator('.verify-card[data-product-id="98523"] [data-field="price"]').inputValue(),'4.25');
      const record=await p.evaluate(()=>JSON.parse(localStorage.getItem('good-food-dubbo-product-check-v1'))['98523']);
      assert.equal(record.stock,'available');
      assert.ok(record.observedAt);
      await p.goto(base+'/index.html#plan',{waitUntil:'domcontentloaded'});
      const result=await p.evaluate(()=>window.FoodShopping.lookup('John West springwater sardines, 110 g','tins'));
      assert.equal(result.price,4.25);
      assert.match(result.priceSource,/Your Dubbo observation/);
      await p.close();
    });
    await check('on-device test deadlines catch up after simulated time-away and reload',async()=>{
      const context=await browser.newContext({viewport:{width:390,height:844}});
      const p=await context.newPage();
      await p.goto(base+'/device-timer-check.html',{waitUntil:'domcontentloaded'});
      await p.locator('#beginDeviceTest').click();
      await p.close(); // pagehide saves the original state first
      const updater=await context.newPage();
      await updater.goto(base+'/product-check.html',{waitUntil:'domcontentloaded'});
      await updater.evaluate(()=>{
        const k='good-food-phone-timer-test-v1';
        const data=JSON.parse(localStorage.getItem(k));
        for(const t of Object.values(data.timers))t.deadline=Date.now()-150000;
        localStorage.setItem(k,JSON.stringify(data));
      });
      await updater.close();
      const again=await context.newPage();
      await again.goto(base+'/device-timer-check.html',{waitUntil:'domcontentloaded'});
      assert.match(await again.locator('#stateA').innerText(),/^Finished/);
      assert.match(await again.locator('#stateB').innerText(),/^Finished/);
      assert.match(await again.locator('#deviceStatus').innerText(),/does NOT prove an alarm/);
      await context.close();
    });
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
            scroll:el.scrollWidth,client:el.clientWidth,view:el.closest(".view")?.id,html:el.outerHTML.slice(0,150)}))}));
        assert.ok(size.scroll <= size.viewport+2,JSON.stringify(size));
        await p.close();
      });
    }
    process.stdout.write('Passed '+assertions+' browser checks.\n');
  }finally{await browser.close();}
}
main().catch(err=>{process.stderr.write(String(err.stack||err)+'\n');process.exitCode=1;}).finally(()=>{if(server.listening)server.close();});
