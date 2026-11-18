/* Live checks for public HealthiestFood Supabase API.
 * Uses ONLY its public publishable key. Never creates a real user or uploads any personal data.
 * Run: node e2e/cloud-backend-check.cjs
 */
const vm=require("node:vm"),fs=require("node:fs"),assert=require("node:assert/strict");
const root=fs.readFileSync("cloud-config.js","utf8"),sandbox={window:{}};
vm.runInNewContext(root,sandbox);
const cfg=sandbox.window.FOOD_CLOUD_CONFIG;
async function main(){
 assert.equal(cfg.enabled,true);
 assert.equal(cfg.url,"https://rtlnwqdovacxyjwfcgxf.supabase.co");
 assert.equal(cfg.allowedOrigin,"https://joshualparris.github.io");
 assert.equal(cfg.allowedPath,"/HealthiestFood/smart-kitchen.html");
 assert.match(cfg.publishableKey,/^sb_publishable_/);
 const ctrl=new AbortController(),timeout=setTimeout(()=>ctrl.abort(),14000);
 const headers={"apikey":cfg.publishableKey,"Accept":"application/json"};
 try{
  const health=await fetch(cfg.url+"/auth/v1/health",{headers,signal:ctrl.signal});
  assert.ok(health.status>=200&&health.status<500,"Auth health endpoint unreachable: HTTP "+health.status);
  console.log("PASS Supabase Auth endpoint HTTP "+health.status);
  const select=await fetch(cfg.url+"/rest/v1/healthiestfood_snapshots?select=owner_id&limit=1",{headers,signal:ctrl.signal});
  const readBody=(await select.text()).slice(0,700);
  // anon has no table grants, so a success response would be a security failure.
  assert.ok([401,403].includes(select.status),"Anonymous data read unexpectedly HTTP "+select.status+": "+readBody);
  console.log("PASS anonymous snapshot SELECT denied HTTP "+select.status);
  const rpc=await fetch(cfg.url+"/rest/v1/rpc/save_healthiestfood_snapshot",{
   method:"POST",headers:{...headers,"Content-Type":"application/json"},signal:ctrl.signal,
   body:JSON.stringify({expected_revision:0,new_snapshot:{schema:"healthiestfood-local-backup-v1",records:{"good-food-test":"{}"}}})
  });
  const rpcBody=(await rpc.text()).slice(0,700);
  assert.ok([401,403].includes(rpc.status),"Anonymous snapshot write unexpectedly HTTP "+rpc.status+": "+rpcBody);
  console.log("PASS anonymous snapshot RPC denied HTTP "+rpc.status);
  const cdn=await fetch("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/dist/umd/supabase.js",{method:"HEAD",signal:ctrl.signal});
  assert.ok(cdn.ok,"Pinned Supabase UMD browser build unavailable HTTP "+cdn.status);
  console.log("PASS pinned Supabase browser SDK URL HTTP "+cdn.status);
 }finally{clearTimeout(timeout);}
}
main().catch(e=>{console.error("FAIL "+(e?.stack||e));process.exitCode=1;});
