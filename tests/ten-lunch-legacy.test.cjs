const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function structured(text){return JSON.parse(text.replace(/([,{]\s*)([A-Za-z][A-Za-z0-9_]*)\s*:/g,'$1"$2":'));}
test('legacy iPad code is standalone ES5 without modern-only syntax',()=>{
 const legacy=read('ten-lunch-legacy.js');
 assert.doesNotThrow(()=>new vm.Script(legacy));
 for(const forbidden of [/\bconst\s/,/\blet\s/,/=>/,/\?\./,/\?\?/,/\.closest\s*\(/,/\.includes\s*\(/,/\.forEach\s*\(/])
  assert.equal(forbidden.test(legacy),false,'Unsupported syntax or API '+forbidden);
 assert.match(legacy,/addEventListener\("click"/);
 assert.match(legacy,/data-tab/);
 assert.match(legacy,/parent\.scrollTo\(0,/);
});
test('embedded fallback JSON exactly mirrors canonical recipe quantities and steps',()=>{
 const page=read('ten-lunch-cook.html'),modern=read('ten-lunch-planner.js');
 const match=page.match(/<script id="tenLunchFallbackData" type="application\/json">([\s\S]*?)<\/script>/);
 assert.ok(match,'No embedded old-device data');
 const data=JSON.parse(match[1]);
 const originalItems=structured(modern.match(/const items=(\[[\s\S]*?\]);\nconst phases=/)[1]);
 const originalPhases=structured(modern.match(/const phases=(\[[\s\S]*?\]);\nconst clamp=/)[1]);
 assert.deepEqual(data.items,originalItems);
 assert.deepEqual(data.phases,originalPhases);
 assert.equal(data.items.length,21);
 assert.equal(data.phases.reduce((n,p)=>n+p.steps.length,0),18);
});
test('complete instructions remain legible if browser cannot run any JavaScript',()=>{
 const page=read('ten-lunch-cook.html');
 const phase=page.match(/<section id="staticCookingSteps"[\s\S]*?<\/section>\s*<div class="actions no-print">/);
 assert.ok(phase,'Static instructions missing');
 assert.equal((phase[0].match(/<li>/g)||[]).length,18);
 assert.match(phase[0],/Refrigerate promptly and within 2 hours/);
 assert.match(page,/src="ten-lunch-legacy\.js" defer/);
 assert.match(page,/id="legacyHelp"/);
 assert.match(read('service-worker.js'),/"\.\/ten-lunch-legacy\.js"/);
});
