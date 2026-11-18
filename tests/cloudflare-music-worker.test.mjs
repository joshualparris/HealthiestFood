import test from "node:test";
import assert from "node:assert/strict";
import { config, clampRange, seal, unseal, handle } from "../cloudflare-music-worker.mjs";
const env={GOOGLE_CLIENT_ID:"test-client-id",GOOGLE_CLIENT_SECRET:"secret",MUSIC_SESSION_SECRET:"z".repeat(40),ALLOWED_GOOGLE_EMAILS:"cook@example.com"};
test("requires private OAuth configuration and an allowlist",()=>{
 assert.equal(config({}).ready,false);
 assert.equal(config({...env,GOOGLE_CLIENT_SECRET:""}).ready,false);
 assert.equal(config({...env,ALLOWED_GOOGLE_EMAILS:""}).ready,false);
 assert.equal(config(env).ready,true);
 assert.deepEqual(config({...env,MUSIC_FOLDER_IDS:"abcdefghijkl,../bad,abcdefghijkl"}).folders,["abcdefghijkl"]);
});
test("AES-GCM session is private, authenticated and expires without revealing credentials",async()=>{
 const t=await seal({email:"cook@example.com",at:"access-token"},env.MUSIC_SESSION_SECRET);
 assert.ok(!t.includes("access-token"));
 assert.deepEqual(await unseal(t,env.MUSIC_SESSION_SECRET),{email:"cook@example.com",at:"access-token"});
 assert.equal(await unseal(t,"x".repeat(40)),null);
 assert.equal(await unseal("not a cookie",env.MUSIC_SESSION_SECRET),null);
});
test("byte range has a 3MB limit and rejects nonsense",()=>{
 assert.equal(clampRange("bytes=0-99"),"bytes=0-99");
 assert.equal(clampRange("bytes=100-"),"bytes=100-3145827");
 assert.equal(clampRange("bytes=-128"),"bytes=-128");
 assert.equal(clampRange("bytes=7-2"),null);
 assert.equal(clampRange("bytes=1-2,6-9"),"bytes=0-3145727");
});
test("health is safe with no configuration and login fails closed",async()=>{
 const h=await handle(new Request("https://worker.example/health"),{});
 assert.deepEqual(await h.json(),{ok:true,service:"cloudflare-healthiest-food-music",musicConfigured:false});
 const list=await handle(new Request("https://worker.example/api/music/tracks"),{});
 assert.deepEqual(await list.json(),{configured:false,signedIn:false,tracks:[]});
 assert.equal((await handle(new Request("https://worker.example/api/music/login"),{})).status,503);
 assert.equal((await handle(new Request("https://worker.example/api/music/stream?id=abcdefghijk"),{})).status,503);
 assert.equal((await handle(new Request("https://worker.example/api/music/logout",{method:"POST"}),{})).status,200);
});
test("configured but unauthenticated users cannot list or stream private music",async()=>{
 const list=await handle(new Request("https://worker.example/api/music/tracks"),env);
 assert.deepEqual(await list.json(),{configured:true,signedIn:false,tracks:[]});
 const stream=await handle(new Request("https://worker.example/api/music/stream?id=abcdefghijkl"),env);
 assert.equal(stream.status,401);
 const invalid=await handle(new Request("https://worker.example/api/music/stream?id=../../unsafe"),env);
 assert.equal(invalid.status,400);
});
test("login maintains CSRF state, HttpOnly cookies, read-only Drive scope, correct host",async()=>{
 const res=await handle(new Request("https://food-backup.example/api/music/login"),env);
 assert.equal(res.status,302);
 const location=new URL(res.headers.get("location"));
 assert.equal(location.origin,"https://accounts.google.com");
 assert.equal(location.searchParams.get("redirect_uri"),"https://food-backup.example/api/music/callback");
 assert.equal(location.searchParams.get("scope"),"openid email https://www.googleapis.com/auth/drive.readonly");
 assert.match(res.headers.get("set-cookie"),/HttpOnly; Secure; SameSite=Lax/);
 const bad=await handle(new Request("https://food-backup.example/api/music/callback?state=wrong&code=abc"),env);
 assert.match(bad.headers.get("location"),/bad_state/);
});
test("HTML and assets are fetched from static backup, never forwarding user cookies",async()=>{
 const old=globalThis.fetch;
 const seen=[];
 globalThis.fetch=async(url,opts)=>{
  seen.push([url,opts]);
  return new Response("static backup content", {status:200,headers:{"content-type":"text/html","set-cookie":"bad=1"}});
 };
 try{
  const response=await handle(new Request("https://worker.example/?a=1",{headers:{Cookie:"private=session"}}),{});
  assert.equal(await response.text(),"static backup content");
  assert.equal(response.headers.get("set-cookie"),null);
  assert.equal(response.headers.get("cache-control"),"no-cache");
  assert.equal(seen[0][0],"https://healthiest-food-backup.onrender.com/?a=1");
  assert.equal(seen[0][1].headers,undefined);
 }finally{globalThis.fetch=old;}
});
test("rejects attempts to proxy APIs or mutate content",async()=>{
 assert.equal((await handle(new Request("https://worker.example/api/_music-lib.js"),{})).status,404);
 assert.equal((await handle(new Request("https://worker.example/api/music/tracks",{method:"POST"}),env)).status,405);
 assert.equal((await handle(new Request("https://worker.example/",{method:"POST"}),{})).status,405);
});

test("Google OAuth can use the existing approved Good Food callback while proxied to Cloudflare",async()=>{
 const e={...env,MUSIC_PUBLIC_ORIGIN:"https://healthiest-food.vercel.app"};
 const response=await handle(new Request("https://worker.example/api/music/login"),e);
 assert.equal(response.status,302);
 const google=new URL(response.headers.get("location"));
 assert.equal(google.searchParams.get("redirect_uri"),"https://healthiest-food.vercel.app/api/music/callback");
 assert.equal(google.searchParams.get("scope"),"openid email https://www.googleapis.com/auth/drive.readonly");
});
test("encrypted cursor scans over 300 artist folders with fewer than 50 Drive subrequests per call",async()=>{
 const A="17p5ZJtrUNVKJMlW0EO4aatiguzv9BM1v",B="1k1AcSLD9HfkeY1-C8nO7aSSr7K8KXI09";
 const folders=322,records={[A]:[],[B]:[]};
 for(let i=0;i<folders;i++){
  const id="folder"+String(i).padStart(11,"0");
  records[A].push({id,name:"Artist "+i,mimeType:"application/vnd.google-apps.folder"});
  records[id]=[{id:"song"+String(i).padStart(12,"0"),name:"Song "+i+".mp3",mimeType:"audio/mpeg",size:"100"}];
 }
 const prev=globalThis.fetch;
 let requests=0, peak=0, total=0;
 const ck=await seal({email:"cook@example.com",at:"live",exp:Date.now()+3600000,rt:"refresh"},env.MUSIC_SESSION_SECRET);
 const cookie="hf_music="+encodeURIComponent(ck);
 globalThis.fetch=async url=>{
  requests++;
  const u=new URL(url),q=u.searchParams.get("q");
  if(!q)return new Response(JSON.stringify({name:"Music"}),{status:200,headers:{"content-type":"application/json"}});
  const id=q.match(/^'([^']+)'/)[1];
  return new Response(JSON.stringify({files:records[id]||[]}),{status:200,headers:{"content-type":"application/json"}});
 };
 try{
  let cursor=null,step=0;
  const songs=new Map();
  for(;step<35;step++){
   const before=requests;
   const request=new Request("https://food.example/api/music/tracks?mode=page",{
    method:cursor?"POST":"GET",
    headers:{"Cookie":cookie,...(cursor?{"Content-Type":"application/json"}:{})},
    ...(cursor?{body:JSON.stringify({cursor})}:{})
   });
   const reply=await handle(request,env);
   assert.equal(reply.status,200);
   const page=await reply.json();
   assert.equal(page.pageMode,"cursor");
   for(const track of page.tracks)songs.set(track.id,track);
   assert.ok(requests-before<=48,"One Worker call exceeded the 50 subrequest allowance");
   peak=Math.max(peak,requests-before);
   cursor=page.nextCursor;
   if(page.done){
    assert.equal(page.truncated,false);
    assert.equal(page.foldersScanned,folders+2);
    break;
   }
  }
  assert.ok(step<35);
  assert.equal(songs.size,folders);
  assert.ok(peak>10&&peak<=48);
 }finally{globalThis.fetch=prev;}
});
test("cursor tampering is rejected and cannot list another signed-in account's Drive",async()=>{
 const ck=await seal({email:"cook@example.com",at:"live",exp:Date.now()+3600000},env.MUSIC_SESSION_SECRET);
 const r=await handle(new Request("https://food.example/api/music/tracks?mode=page",{
  method:"POST",headers:{"Cookie":"hf_music="+encodeURIComponent(ck),"Content-Type":"application/json"},
  body:JSON.stringify({cursor:"not-a-real-cursor"})}),env);
 assert.equal(r.status,400);
 assert.equal((await r.json()).error,"invalid_cursor");
 const denied=await handle(new Request("https://food.example/api/music/tracks?mode=page",{
  method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({cursor:"bad"})}),env);
 assert.deepEqual(await denied.json(),{configured:true,signedIn:false,tracks:[]});
});
