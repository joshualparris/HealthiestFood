const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
test('Manifest and worker are syntactically valid and linked',()=>{
 const manifest=JSON.parse(read('manifest.webmanifest'));
 assert.equal(manifest.start_url,'./index.html#home');
 assert.ok(manifest.scope==='./');
 for(const f of ['service-worker.js','offline-ready.js'])assert.doesNotThrow(()=>new vm.Script(read(f)));
 const html=read('index.html');
 assert.ok(html.includes('rel="manifest"'));
 assert.ok(html.includes('id="offlineCookingNote"'));
});
test('All critical scripts are cached when online and network is preferred',()=>{
 const h=read('index.html'),sw=read('service-worker.js');
 const scripts=[...h.matchAll(/<script[^>]*src="([^"]+)"[^>]*>/g)].map(x=>x[1]);
 const missing=scripts.filter(x=>!sw.includes('"./'+x+'"'));
 assert.deepEqual(missing,[],'Offline cache must include every application script');
 assert.match(sw,/const response=await fetch\(req\)/);
 assert.match(sw,/if\(url.origin!==self.location.origin\)return/);
 assert.match(sw,/\bcaches\.match\(/);
});
test('Offline warning says cached data may be stale and limits promises',()=>{
 const js=read('offline-ready.js');
 assert.ok(js.includes('may be outdated'));
 assert.ok(js.includes('navigator.onLine'));
 assert.ok(js.includes('serviceWorker.register'));
 assert.ok(!js.includes('Notification.requestPermission'));
});
