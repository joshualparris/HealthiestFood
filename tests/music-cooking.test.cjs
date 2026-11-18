const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const ENV={GOOGLE_CLIENT_ID:"cid",GOOGLE_CLIENT_SECRET:"csecret",MUSIC_SESSION_SECRET:"x".repeat(40),ALLOWED_GOOGLE_EMAILS:"cook@example.com, Other@Example.com"};
for(const [k,v] of Object.entries(ENV))process.env[k]=v;
const L=require("../api/_music-lib.js");
const stream=require("../api/music/stream.js"),tracks=require("../api/music/tracks.js"),callback=require("../api/music/callback.js"),login=require("../api/music/login.js");
const music=require("../music-cooking.js");

function mockRes(){const h={};return{statusCode:200,headers:h,body:null,setHeader(k,v){h[k.toLowerCase()]=v},getHeader(k){return h[k.toLowerCase()]},end(b){this.body=b;this.done=true}}}
const req=(url,headers={})=>({method:"GET",url,headers:{host:"food.example",...headers}});
const sessionCookie=(over={})=>L.SESSION_COOKIE+"="+encodeURIComponent(L.seal({email:"cook@example.com",rt:"r",at:"live",exp:Date.now()+3600e3,...over},ENV.MUSIC_SESSION_SECRET));
function withFetch(fn,body){const old=global.fetch;global.fetch=fn;return body().finally(()=>{global.fetch=old});}

test("Sessions are encrypted and tamper-evident",()=>{
 const t=L.seal({email:"a@b.c"},ENV.MUSIC_SESSION_SECRET);
 assert.deepEqual(L.unseal(t,ENV.MUSIC_SESSION_SECRET),{email:"a@b.c"});
 assert.equal(L.unseal(t,"y".repeat(40)),null);
 const raw=Buffer.from(t,"base64url");raw[raw.length-1]^=1;
 assert.equal(L.unseal(raw.toString("base64url"),ENV.MUSIC_SESSION_SECRET),null);
 assert.ok(!t.includes("a@b.c"));
});

test("Range requests are clamped to a bounded chunk",()=>{
 const M=L.MAX_CHUNK;
 assert.equal(L.clampRange(undefined),"bytes=0-"+(M-1));
 assert.equal(L.clampRange("bytes=0-"),"bytes=0-"+(M-1));
 assert.equal(L.clampRange("bytes=0-1"),"bytes=0-1");
 assert.equal(L.clampRange("bytes=100-"),"bytes=100-"+(100+M-1));
 assert.equal(L.clampRange("bytes=-500"),"bytes=-500");
 assert.equal(L.clampRange("bytes=9-3"),null);
 assert.equal(L.clampRange("bytes=0-1,5-9"),"bytes=0-"+(M-1));
});

test("Not configured: functions fail closed, including with no allowlist",async()=>{
 const saved=process.env.ALLOWED_GOOGLE_EMAILS;process.env.ALLOWED_GOOGLE_EMAILS="";
 try{
  assert.equal(L.config().ready,false);
  const r=mockRes();await tracks(req("/api/music/tracks"),r);
  assert.deepEqual(JSON.parse(r.body),{configured:false,signedIn:false,tracks:[]});
  const s=mockRes();await stream(req("/api/music/stream?id=1EJMB8Vtm180c_ODspX_fwKiMfrr7Muoq",{cookie:sessionCookie()}),s);
  assert.equal(s.statusCode,503);
 }finally{process.env.ALLOWED_GOOGLE_EMAILS=saved}
});

test("Login uses read-only Drive scope, offline access and a state cookie",()=>{
 const r=mockRes();login(req("/api/music/login"),r);
 assert.equal(r.statusCode,302);
 const u=new URL(r.headers.location);
 assert.equal(u.searchParams.get("scope"),"openid email https://www.googleapis.com/auth/drive.readonly");
 assert.equal(u.searchParams.get("access_type"),"offline");
 assert.equal(u.searchParams.get("redirect_uri"),"https://food.example/api/music/callback");
 const state=u.searchParams.get("state");
 assert.ok(String(r.headers["set-cookie"]).includes(L.STATE_COOKIE+"="+state));
 assert.match(String(r.headers["set-cookie"]),/HttpOnly; Secure; SameSite=Lax/);
});

test("Callback rejects a mismatched state and accounts not on the allowlist",async()=>{
 const bad=mockRes();await callback(req("/api/music/callback?code=c&state=nope",{cookie:L.STATE_COOKIE+"=expected"}),bad);
 assert.equal(bad.headers.location,"/?music=bad_state#media");
 const idToken=email=>"h."+Buffer.from(JSON.stringify({email,email_verified:true})).toString("base64url")+".s";
 for(const [email,expect] of [["stranger@example.com","not_allowed"],["other@example.com","signed_in"]]){
  const r=mockRes();
  await withFetch(async()=>({ok:true,status:200,json:async()=>({access_token:"at",refresh_token:"rt",expires_in:3600,id_token:idToken(email)})}),
   ()=>callback(req("/api/music/callback?code=c&state=s1",{cookie:L.STATE_COOKIE+"=s1"}),r));
  assert.equal(r.headers.location,"/?music="+expect+"#media",email);
  assert.equal([].concat(r.headers["set-cookie"]).some(c=>c.startsWith(L.SESSION_COOKIE+"=")&&!c.includes("Max-Age=0")),expect==="signed_in");
 }
});

test("A session for a removed email is no longer honoured",async()=>{
 const r=mockRes();
 await tracks(req("/api/music/tracks",{cookie:sessionCookie({email:"removed@example.com"})}),r);
 assert.equal(JSON.parse(r.body).signedIn,false);
});

test("Tracks walks subfolders and returns only audio",async()=>{
 const calls=[];
 await withFetch(async url=>{calls.push(url);const q=new URL(url).searchParams.get("q");
  const files=q.startsWith("'17p5ZJtrUNVKJMlW0EO4aatiguzv9BM1v'")?[{id:"folderAAAAAAAA",name:"Hillsong",mimeType:"application/vnd.google-apps.folder"},{id:"songAAAAAAAAAA",name:"Riptide.mp3",mimeType:"audio/mpeg",size:"10"}]:[{id:"songBBBBBBBBBB",name:"Oceans.mp3",mimeType:"audio/mpeg",size:"20"}];
  return {ok:true,json:async()=>({files})};},async()=>{
  const r=mockRes();await tracks(req("/api/music/tracks",{cookie:sessionCookie()}),r);
  const body=JSON.parse(r.body);
  assert.deepEqual(body.tracks.map(t=>[t.title,t.album]),[["Riptide",""],["Oceans","Hillsong"]]);
  assert.equal(r.headers["cache-control"],"private, max-age=300");
 });
 assert.equal(calls.length,2);
 assert.ok(calls.every(u=>u.startsWith("https://www.googleapis.com/drive/v3/files?")));
});

test("Stream forwards a clamped Range with the user's token and refuses non-audio",async()=>{
 const seen=[];
 const mk=type=>async(url,opts)=>{seen.push([url,opts.headers]);return{ok:true,status:206,headers:new Headers({"content-type":type,"content-range":"bytes 0-3/100"}),arrayBuffer:async()=>new Uint8Array([1,2,3,4]).buffer,body:{cancel(){}}};};
 await withFetch(mk("audio/mpeg"),async()=>{
  const r=mockRes();await stream(req("/api/music/stream?id=1EJMB8Vtm180c_ODspX_fwKiMfrr7Muoq",{cookie:sessionCookie(),range:"bytes=0-"}),r);
  assert.equal(r.statusCode,206);
  assert.equal(r.headers["content-range"],"bytes 0-3/100");
  assert.equal(r.body.length,4);
 });
 assert.equal(seen[0][0],"https://www.googleapis.com/drive/v3/files/1EJMB8Vtm180c_ODspX_fwKiMfrr7Muoq?alt=media&supportsAllDrives=true");
 assert.equal(seen[0][1].Authorization,"Bearer live");
 assert.equal(seen[0][1].Range,"bytes=0-"+(L.MAX_CHUNK-1));
 await withFetch(mk("application/pdf"),async()=>{
  const r=mockRes();await stream(req("/api/music/stream?id=1EJMB8Vtm180c_ODspX_fwKiMfrr7Muoq",{cookie:sessionCookie()}),r);
  assert.equal(r.statusCode,415);
 });
});

test("Stream reports Drive network failures as 502 instead of crashing",async()=>{
 await withFetch(async()=>{throw new Error("offline")},async()=>{
  const r=mockRes();await stream(req("/api/music/stream?id=1EJMB8Vtm180c_ODspX_fwKiMfrr7Muoq",{cookie:sessionCookie()}),r);
  assert.equal(r.statusCode,502);
 });
});

test("Stream requires sign-in and a valid file id",async()=>{
 const a=mockRes();await stream(req("/api/music/stream?id=1EJMB8Vtm180c_ODspX_fwKiMfrr7Muoq"),a);assert.equal(a.statusCode,401);
 const b=mockRes();await stream(req("/api/music/stream?id=../../etc",{cookie:sessionCookie()}),b);assert.equal(b.statusCode,400);
});

test("Client shuffle keeps every song once and search matches titles and folders",()=>{
 const list=[{id:"a",title:"Riptide",album:"Pop"},{id:"b",title:"Oceans",album:"Hillsong"},{id:"c",title:"Halo",album:"Pop"}];
 const s=music.shuffled(list,()=>0);
 assert.deepEqual(s.map(x=>x.id).sort(),["a","b","c"]);
 assert.deepEqual(list.map(x=>x.id),["a","b","c"],"original list unchanged");
 assert.deepEqual(music.filtered(list,"hill").map(x=>x.id),["b"]);
 assert.deepEqual(music.filtered(list,"POP").map(x=>x.id),["a","c"]);
 assert.equal(music.streamUrl("a b"),"/api/music/stream?id=a%20b");
});

test("Page wiring: section, persistent mini player, podcast interlock and offline cache",()=>{
 const html=read("index.html");
 assert.ok(html.includes('id="musicCooking"')&&html.includes('id="musicMini"'));
 assert.ok(html.indexOf('src="podcast-player.js"')<html.indexOf('src="music-cooking.js"'));
 assert.ok(html.includes('href="#media">Play music while cooking</a>'));
 assert.ok(read("podcast-player.js").includes("w?.FoodMusic?.pause?.()"));
 assert.ok(read("music-cooking.js").includes("w.FoodPodcastPlayer?.pause?.()"));
 assert.ok(read("service-worker.js").includes('"./music-cooking.js"'));
 assert.doesNotMatch(read("api/_music-lib.js"),/@gmail\.com|@cornerstone/i,"no personal emails in source");
});
