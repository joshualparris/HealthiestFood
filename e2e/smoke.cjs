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
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp'};
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
    await check('uploaded homepage photograph replaces hero SVG without breaking interactive controls',async()=>{
      const img=page.locator('#view-home img.homepage-bowl-photo');
      assert.equal(await img.count(),1);
      assert.equal(await img.getAttribute('src'),'homepage-bowl.webp');
      assert.equal(await page.locator('#view-home .bowl-art').count(),0);
      assert.equal(await page.locator('#view-home .art-caption').count(),0);
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(el=>el.decode());
      assert.ok(await img.evaluate(el=>el.naturalWidth>=700&&el.naturalHeight>=600),'New hero image must decode');
      const response=await page.request.get(new URL('homepage-bowl.webp',base+'/').href,{timeout:15000});
      assert.equal(response.status(),200);
      assert.ok((await response.body()).length>25000);
      assert.deepEqual(await page.locator('#view-home .hero-facts strong').allTextContents(),['20','17','7']);
      const cookingLink=page.locator('#view-home .hero-actions a[href="cooking-methods.html"]');
      assert.equal(await cookingLink.count(),1);
      assert.match(await cookingLink.innerText(),/Compare cooking methods/);
      // The destination must remain a real HTML link, not a button painted
      // into the hero image. Validate the destination without waiting for
      // external embeds/font requests to finish loading in another tab.
      const destination=await page.request.get(new URL(await cookingLink.getAttribute('href'),base+'/').href,{timeout:15000});
      assert.equal(destination.status(),200);
      assert.match(await destination.text(),/<title>[^<]*[Cc]ooking/i);
    });
    if(!process.env.SMOKE_URL)await check('Science evidence register opens 17 recipe sources and exposes unknowns on mobile',async()=>{
      await page.locator('.mobile-nav [data-goto="science"]').click();
      await page.locator('#view-science').waitFor({state:'visible'});
      const register=page.locator('#scienceEvidenceRegister');
      assert.equal(await register.locator('.evidence-recipe').count(),17);
      assert.equal(await register.locator('.evidence-status-item').count(),6);
      await register.locator('.evidence-recipe').first().locator(':scope > summary').click();
      const open=register.locator('.evidence-recipe[open]').first();
      assert.ok(await open.locator('tbody tr').count()>3);
      assert.match(await open.innerText(),/AFCD|Retail label|No modelled nutrient value/);
      assert.match(await register.innerText(),/Not established/);
      await page.locator('.mobile-nav [data-goto="home"]').click();
      await page.locator('#view-home').waitFor({state:'visible'});
    });
    await check('serving +/- really scales amounts, shopping quantity and cooking from phone and desktop',async()=>{
      for(const width of [390,1280]){
        const p=await browser.newPage({viewport:{width,height:844}});
        const errors=[];p.on('pageerror',e=>errors.push(e.message));
        await p.goto(base+'/#recipes',{waitUntil:'domcontentloaded'});
        await p.locator('#view-recipes').waitFor({state:'visible'});
        const selected=p.locator('#recipeDetail');
        // Default recipe A: 8 sardine tins and 150 g quinoa for 5 portions.
        assert.equal((await selected.locator('.stepper output').innerText()).trim(),'5');
        assert.match(await selected.locator('.ingredients-list').innerText(),/8 tins[\s\S]*sardines/);
        await selected.locator('button[data-servings="1"]').click();
        assert.equal((await selected.locator('.stepper output').innerText()).trim(),'6',width+' plus');
        assert.match(await selected.locator('.ingredients-list').innerText(),/9\.6 tins[\s\S]*sardines/);
        assert.match(await selected.locator('.ingredients-list').innerText(),/180 g[\s\S]*quinoa/);
        assert.match(await selected.locator('[data-add-to-shop="a"]').innerText(),/6 portions/);
        await selected.locator('button[data-servings="-1"]').click();
        assert.equal((await selected.locator('.stepper output').innerText()).trim(),'5',width+' minus');
        assert.match(await selected.locator('.ingredients-list').innerText(),/150 g[\s\S]*quinoa/);
        assert.ok(await selected.locator('button[data-servings="1"]').evaluate(el=>el.getBoundingClientRect().width>=44),'touch target too small');
        assert.equal(errors.length,0,errors.join('; '));
        await p.close();
      }
    });
    await check('all thirteen related health website links render in longevity guide on mobile and desktop',async()=>{
      for(const width of [390,1280]){
        const guide=await browser.newPage({viewport:{width,height:844}});
        const errors=[];guide.on('pageerror',e=>errors.push(e.message));
        await guide.goto(base+'/longevity.html',{waitUntil:'domcontentloaded'});
        const links=guide.locator('#relatedHealthSites .related-actions a');
        await links.first().waitFor({state:'visible',timeout:10000});
        assert.equal(await guide.locator('#relatedHealthSites article').count(),8);
        assert.equal(await links.count(),13);
        assert.equal(await guide.locator('#relatedHealthSites .related-offline li a').count(),3);
        const values=await links.evaluateAll(nodes=>nodes.map(el=>({url:el.href,target:el.target,rel:el.rel})));
        assert.equal(new Set(values.map(x=>x.url)).size,13);
        assert.ok(values.every(x=>x.url.startsWith('https://')&&x.target==='_blank'&&x.rel.includes('noopener')));
        assert.equal(await guide.locator('nav.jump a[href="#your-health-sites"]').count(),1);
        assert.equal(errors.length,0,errors.join("; "));
        await guide.close();
      }
    });
    await check('canonical ingredient IDs connect all 17 meals without changing recipes',async()=>{
      const stats=await page.evaluate(()=>{
        const c=window.FoodIngredients,recipes=window.FOOD_DATA.recipes;
        if(!c)return null;
        return {summary:c.verify(recipes), ids:recipes.flatMap(r=>r.ingredientRecords.map(x=>x.id)),
         check:c.resolve("dry white quinoa","g")?.id,
         tofuBrand:window.FoodShopping.lookup("Evergreen hard tofu, raw","g")?.productSku,
         tofuGeneric:window.FoodShopping.lookup("firm tofu, soy allergen","g"),
         allergen:c.allergensFor(recipes.find(r=>r.id==="a")).contains};
      });
      assert.ok(stats,'Ingredient registry must load on published host');
      assert.equal(stats.summary.recipes,17);
      assert.equal(stats.summary.lines,151);
      assert.equal(stats.summary.variants,99);
      assert.equal(stats.summary.identities,62);
      assert.equal(stats.check,'grain-quinoa-dry');
      assert.equal(stats.tofuBrand,'595465');
      assert.equal(stats.tofuGeneric,null);
      assert.ok(stats.allergen.includes('fish'));
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
      assert.match(await media.innerText(),/What it does not prove/i);
      assert.equal(await media.locator('a[target="_blank"]').count(),2);
      await page.locator('#mediaSearch').fill('');
      await page.locator('#mediaTopic').selectOption('all');
      await page.locator('[data-media-kind="all"]').click();
      assert.equal(await page.locator('#mediaResults .media-resource').count(),23);
    });
    await check('embedded Cooking Lab and Longevity Guide display only one navigation bar and one scrollbar',async()=>{
      const p=await browser.newPage({viewport:{width:390,height:844}});
      const errors=[];p.on("pageerror",e=>errors.push(e.message));
      await p.goto(base+"/#lab",{waitUntil:"domcontentloaded"});
      await p.locator("#view-lab").waitFor({state:"visible"});
      const lab=p.frameLocator("#foodLabFrame");
      await lab.locator("html.embedded-site").waitFor();
      await lab.locator("#cmChoices [data-cm-food]").first().waitFor();
      assert.equal(await lab.locator(".site-header").isHidden(),true,"Inner Cooking Lab header must not repeat");
      assert.equal(await lab.locator(".mobile-nav").isHidden(),true,"Inner Cooking Lab bottom nav must not repeat");
      assert.equal(await p.locator(".mobile-nav").isVisible(),true,"Main app navigation must remain");
      assert.equal(await p.locator("#view-lab .inapp-page-head").isHidden(),true,"Do not duplicate article heading outside frame");
      await p.waitForFunction(()=>{
        const f=document.querySelector("#foodLabFrame"),main=f?.contentDocument?.querySelector("main");
        if(!main)return false;
        const pageHeight=Math.ceil(main.getBoundingClientRect().bottom+f.contentWindow.scrollY+32);
        return Math.abs(f.getBoundingClientRect().height-pageHeight)<50;
      },null,{timeout:12000});
      const iframeCss=await p.locator("#foodLabFrame").evaluate(f=>({border:getComputedStyle(f).borderTopWidth,radius:getComputedStyle(f).borderTopLeftRadius,width:f.getBoundingClientRect().width,viewport:innerWidth,scrolling:f.getAttribute("scrolling")}));
      assert.equal(iframeCss.border,"0px");
      assert.equal(iframeCss.radius,"0px");
      assert.equal(iframeCss.scrolling,"no");
      assert.ok(iframeCss.width>=iframeCss.viewport-3,JSON.stringify(iframeCss));
      await p.evaluate(()=>location.hash="guide");
      await p.locator("#view-guide").waitFor({state:"visible"});
      const guide=p.frameLocator("#foodGuideFrame");
      await guide.locator("html.embedded-site").waitFor();
      assert.equal(await guide.locator(".site-header").isHidden(),true);
      assert.equal(await p.locator(".mobile-nav").isVisible(),true);
      assert.equal(errors.length,0,errors.join("; "));
      await p.close();
    });
    if(browserName==="chromium")await check('dated pantry pack consumption is reversible and can be copied to shopping',async()=>{
      const p=await browser.newPage({viewport:{width:390,height:844}});
      await p.goto(base+'/#shop',{waitUntil:'domcontentloaded'});
      await p.locator('#pantryAddForm').waitFor({state:'visible'});
      await p.locator('#pantryNewKey').selectOption('rice');
      await p.locator('#pantryAddForm [name="amount"]').fill('500');
      await p.locator('#pantryAddForm [name="bestBefore"]').fill('2026-10-23');
      await p.locator('#pantryAddForm button[type="submit"]').click();
      assert.match(await p.locator('.pantry-lot').first().innerText(),/500 g/);
      await p.locator('.pantry-lot [data-qty]').first().fill('150');
      await p.locator('.pantry-lot [data-lot-use]').first().click();
      assert.match(await p.locator('.pantry-lot').first().innerText(),/350 g/);
      await p.locator('.pantry-lot [data-lot-undo]').first().click();
      assert.match(await p.locator('.pantry-lot').first().innerText(),/500 g/);
      p.once('dialog',dialog=>dialog.accept());
      await p.locator('[data-pantry-sync]').click();
      assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('good-food-planned-have-v1')).rice),500);
      await p.close();
    });
    if(browserName==="chromium")await check('cooking handling log records real cumulative intervals and does not call unknown zero',async()=>{
      const p=await browser.newPage({viewport:{width:390,height:844}});
      await p.goto(base+'/#recipes',{waitUntil:'domcontentloaded'});
      await p.locator('[data-start="a"]').first().click();
      await p.locator('#foodHandlingMount').waitFor();
      await p.locator('#foodHandlingMount summary').click();
      assert.match(await p.locator('#handlingStatus').innerText(),/not established/i);
      await p.locator('#handlingPrior').fill('135');
      await p.locator('[data-handling-action="prior"]').click();
      assert.match(await p.locator('#handlingStatus').innerText(),/do not return/i);
      await p.locator('[data-handling-action="start"]').click();
      assert.equal(await p.locator('#handlingStatus').getAttribute('data-state'),'use-now');
      await p.locator('[data-handling-action="stop"]').click();
      await p.locator('#closeCook').click();
      await p.locator('[data-start="a"]').first().click();
      await p.locator('#foodHandlingMount summary').click();
      assert.equal(await p.locator('#handlingStatus').getAttribute('data-state'),'use-now');
      await p.close();
    });
    await check('ingredient-by-ingredient cooking lab filters and compares without claiming longevity scores',async()=>{
      const lab=await browser.newPage({viewport:{width:390,height:844}});
      const errors=[];lab.on('pageerror',e=>errors.push(e.message));
      await lab.goto(base+'/cooking-methods.html?food=egg',{waitUntil:'domcontentloaded'});
      await lab.locator('#cmChoices [data-cm-food]').first().waitFor();
      assert.ok((await lab.locator('#cmChoices [data-cm-food]').count())>=56);
      assert.match(await lab.locator('#cmCoverage').innerText(),/132\/132/);
      assert.match(await lab.locator('#cmDetail h2').innerText(),/Eggs/);
      await lab.locator('#cmMethodA').selectOption('4');
      assert.match(await lab.locator('.cm-compare-card').first().innerText(),/Lightly fry/);
      await lab.locator('#cmSearch').fill('broccoli');
      assert.ok(await lab.locator('[data-cm-food]').count()>=1);
      await lab.locator('#cmCategory').selectOption('All');
      await lab.locator('#cmSearch').fill('');
      await lab.locator('#cmRecipe').selectOption('br-eggs');
      assert.ok(await lab.locator('[data-cm-food]').count()>=4);
      assert.equal(errors.length,0,errors.join(', '));
      await lab.close();
    });
    if(browserName==="chromium")await check('ABC podcast stays playing when minimised and across recipes, planner, guide and cooking lab',async()=>{
      // Locally generated 45-second silence fixture replaces the remote MP3 in this browser test only.
      // Production points directly to first-party ABC public podcast enclosures, never stored on our site.
      const duration=45,rate=8000,pcm=Buffer.alloc(duration*rate*2),wav=Buffer.alloc(44+pcm.length);
      wav.write("RIFF",0);wav.writeUInt32LE(wav.length-8,4);wav.write("WAVE",8);wav.write("fmt ",12);
      wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);
      wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write("data",36);wav.writeUInt32LE(pcm.length,40);pcm.copy(wav,44);
      const audioPage=await browser.newPage({viewport:{width:390,height:844}});
      await audioPage.route(/https:\/\/(?:mediacore-live-production|abcmedia)\.akamaized\.net\/.*\.mp3/,route=>route.fulfill({status:200,contentType:"audio/wav",headers:{"Accept-Ranges":"bytes"},body:wav}));
      await audioPage.goto(base,{waitUntil:"domcontentloaded"});
      await audioPage.locator('.mobile-nav [data-goto="media"]').click();
      const pod=audioPage.locator('[data-media-id="med"] [data-play-episode="med"]');
      await pod.click();
      await audioPage.waitForFunction(()=>window.FoodPodcastPlayer?.state().playing,{timeout:10000});
      assert.equal(await audioPage.locator('#podcastPlayer').isVisible(),true);
      const active=await audioPage.evaluate(()=>{const a=document.querySelector('#podcastPlayer')?.previousElementSibling;const el=document.querySelector('audio');if(el)el.dataset.keepPlaying="same-node";return {src:el?.currentSrc,playing:!el?.paused,episode:window.FoodPodcastPlayer.state().episode}});
      assert.equal(active.playing,true);assert.equal(active.episode,"med");
      assert.match(active.src,/akamaized\.net/);
      await audioPage.locator('#podcastCompact').click();
      assert.equal(await audioPage.locator('#podcastExpanded').isHidden(),true);
      for(const route of ["recipes","plan","lab","guide","media"]){
        await audioPage.evaluate(hash=>location.hash=hash,route);
        await audioPage.locator('#view-'+route).waitFor({state:"visible"});
        assert.equal(await audioPage.evaluate(()=>document.querySelector('audio')?.dataset.keepPlaying),"same-node","Audio element got replaced at "+route);
        assert.equal(await audioPage.evaluate(()=>window.FoodPodcastPlayer.state().playing),true,"Audio paused at "+route);
      }
      await audioPage.locator('#podcastCompact').click();
      await audioPage.locator('#podcastSpeed').selectOption('1.25');
      assert.equal(await audioPage.evaluate(()=>document.querySelector('audio')?.playbackRate),1.25);
      // Autoplay is opt-in: existing users are not started automatically.
      assert.equal(await audioPage.locator('#podcastAutoplayNext').isChecked(),false);
      await audioPage.locator('#podcastAutoplayNext').check();
      assert.equal(await audioPage.evaluate(()=>window.FoodPodcastPlayer.state().autoplayNext),true);
      assert.equal(await audioPage.evaluate(()=>JSON.parse(localStorage.getItem('good-food-podcast-resume-v1')).autoplayNext),true);
      const nextId=await audioPage.evaluate(()=>window.FoodPodcastPlayer.nextInQueue('med'));
      await audioPage.evaluate(()=>document.querySelector('audio').dispatchEvent(new Event('ended')));
      await audioPage.waitForFunction(id=>window.FoodPodcastPlayer.state().episode===id,nextId,{timeout:10000});
      assert.equal(await audioPage.locator('#podcastAutoplayNext').isChecked(),true);
      // The queue must stop at the last playable episode rather than loop.
      const last=await audioPage.evaluate(()=>window.FoodPodcastPlayer.order().at(-1).id);
      await audioPage.evaluate(id=>window.FoodPodcastPlayer.playEpisode(id),last);
      await audioPage.evaluate(()=>document.querySelector('audio').dispatchEvent(new Event('ended')));
      assert.equal(await audioPage.evaluate(()=>window.FoodPodcastPlayer.state().episode),last);
      assert.equal(await audioPage.evaluate(()=>window.FoodPodcastPlayer.state().playing),false);
      await audioPage.locator('#podcastStop').click();
      assert.equal(await audioPage.locator('#podcastPlayer').isHidden(),true);
      await audioPage.close();
    });
    await check('17 recipes and category controls render',async()=>{
      await page.locator('.mobile-nav [data-goto="recipes"]').click();
      assert.equal(await page.locator('#recipeCards .recipe-card').count(),17);
      await page.locator('[data-recipe-type="breakfast"]').click();
      assert.equal(await page.locator('#recipeCards .recipe-card').count(),4);
      await page.locator('[data-recipe-type="all"]').click();
    });
    await check('all seventeen uploaded recipe photographs load and decode in the browser',async()=>{
      const ids=['br-oats','br-eggs','br-smoothie','br-toast','di-lentil','di-chicken','di-chilli','di-stirfry','di-salmon','sn-hummus','a','b','c','d','sn-apple','sn-eggs','sn-berries'];
      assert.equal(await page.locator('#recipeCards img.recipe-card-image').count(),ids.length);
      assert.equal(await page.locator('#recipeCards .mini-plate').count(),0,'All built-in meals now have their own photographs');
      for(const id of ids){
        const img=page.locator('#recipeCards .recipe-card:has([data-select="'+id+'"]) img.recipe-card-image');
        assert.equal(await img.count(),1,id);
        assert.equal(await img.getAttribute('src'),id+'.webp');
        assert.match(await img.getAttribute('alt'),/Illustrative food photograph of /);
        const response=await page.request.get(new URL(id+'.webp',base+'/').href,{timeout:15000});
        assert.equal(response.status(),200,'Photo should load from host: '+id);
        assert.ok((await response.body()).length>10000,id+' should not be an empty placeholder');
      }
      await page.locator('#recipeCards [data-select="a"]').click();
      const detail=page.locator('#recipeDetail img.recipe-detail-photo');
      assert.equal(await detail.getAttribute('src'),'a.webp','Expanded sardine recipe must use its uploaded photograph');
      const first=page.locator('#recipeCards .recipe-card:has([data-select="br-oats"]) img');
      await first.scrollIntoViewIfNeeded();
      await first.evaluate(el=>el.decode());
      assert.ok(await first.evaluate(el=>el.naturalWidth>0&&el.naturalHeight>0),'First card photo must decode');
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
      await page.waitForFunction(()=>document.querySelector('#recipeDetail h2')?.textContent?.includes('Spinach, mushroom & egg scramble'),null,{timeout:3500});
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
    await check('57 explicitly explained recipe timers, including the screenshot 7-minute prep reminder',async()=>{
      const result=await page.evaluate(()=>window.RecipeTimerPurposes.validate(window.FOOD_DATA.recipes));
      assert.equal(result.timedSteps,57);
      await page.locator('#prevStep').click();
      const heading=page.locator('.timer-purpose');
      assert.match(await heading.innerText(),/OPTIONAL PREPARATION REMINDER · 7 MINUTES/);
      assert.match(await heading.innerText(),/Chop the carrots, capsicum and zucchini/);
      assert.match(await heading.innerText(),/Start when:/);
      assert.match(await heading.innerText(),/When it rings:/);
      assert.match(await heading.innerText(),/oven is preheated separately/);
      assert.match(await page.locator('#timerToggle').innerText(),/Start prep reminder/);
      await page.locator('#nextStep').click();
      const roast=await page.locator('.timer-purpose').innerText();
      assert.match(roast,/COOKING REMINDER · 30 MINUTES/);
      assert.match(roast,/Roast the carrots, capsicum and zucchini/);
      assert.match(roast,/loaded trays go into/);
      await page.locator('#nextStep').click();
      const quinoa=await page.locator('#cookContent .cook-body>p').first().innerText();
      const quantities=quinoa.match(/Measure (\\d+(?:\\.\\d+)?) g[^.]*?approximately (\\d+(?:\\.\\d+)?) mL/);
      assert.ok(quantities,'Quinoa cooking step must state the current dry quantity and explicit water');
      assert.ok(Math.abs(Number(quantities[2])/Number(quantities[1])-2.8)<0.0001,'Water scales with the actual chosen portions');
      assert.doesNotMatch(quinoa,/of dry quinoa of dry quinoa/);
      assert.match(quinoa,/low/);
      assert.match(quinoa,/10–15 minutes/);
      assert.match(quinoa,/5 minutes/);
      assert.match(quinoa,/BY VOLUME/);
      assert.match(await page.locator('.timer-purpose').innerText(),/gentle low simmer/);
      await page.locator('#prevStep').click();
    });
    await check('two overlapping timers persist after page refresh',async()=>{
      await page.locator('#prevStep').click();
      await page.locator('#timerToggle').click();
      await page.locator('#nextStep').click();
      await page.locator('#timerToggle').click();
      assert.equal(await page.locator('#timerDashboard .timer-tile').count(),2);
      assert.match(await page.locator('#timerDashboard').innerText(),/Chop the carrots, capsicum and zucchini/);
      assert.match(await page.locator('#timerDashboard').innerText(),/Roast the carrots, capsicum and zucchini/);
      assert.match(await page.locator('#timerDashboard').innerText(),/When it rings:/);
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
    await check('custom shopping allows one or two chosen meals with their own portions',async()=>{
      await page.locator('.mobile-nav [data-goto="shop"]').click();
      await page.locator('#view-shop').waitFor({state:'visible'});
      const custom=page.locator('#customShopping');
      await custom.locator('[data-custom-recipe="br-oats"]').check();
      assert.match(await custom.locator('.custom-shopping-stats').innerText(),/1 recipes · 1 portions/);
      await custom.locator('[data-custom-recipe="a"]').check();
      await custom.locator('[data-custom-portions="a"]').fill('5');
      await custom.locator('[data-custom-portions="a"]').dispatchEvent('change');
      assert.match(await custom.locator('.custom-shopping-stats').innerText(),/2 recipes · 6 portions/);
      assert.ok(await custom.locator('.custom-shopping-item').count()>8);
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('.mobile-nav [data-goto="shop"]').click();
      await page.locator('#view-shop').waitFor({state:'visible'});
      assert.equal(await page.locator('[data-custom-recipe="a"]').isChecked(),true);
      assert.equal(await page.locator('[data-custom-portions="a"]').inputValue(),'5');
    });
    await check('archived V6 basket checks persist when expanded',async()=>{
      await page.locator('#legacyV6Shop summary').click();
      await page.locator('#shopTotal').waitFor({state:'visible'});
      assert.match(await page.locator('#shopTotal').innerText(),/256\.43/);
      await page.locator('[data-filter="all"]').click();
      await page.locator('#shoppingList [data-item="0"]').check();
      await page.reload({waitUntil:'domcontentloaded'});
      await page.locator('.mobile-nav [data-goto="shop"]').click();
      await page.locator('#view-shop').waitFor({state:'visible'});
      await page.locator('#legacyV6Shop summary').click();
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
