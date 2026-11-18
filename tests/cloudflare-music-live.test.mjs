import test from "node:test";
import assert from "node:assert/strict";
const base = "https://healthiest-food-private-music.parris-neathaustralia.workers.dev";
test("deployed Cloudflare Worker health and privacy",async()=>{
 const health=await fetch(base+"/health",{signal:AbortSignal.timeout(20000)});
 assert.equal(health.status,200,"Cloudflare health HTTP status");
 const data=await health.json();
 assert.deepEqual(data.ok,true);
 assert.equal(data.service,"cloudflare-healthiest-food-music");
 assert.equal(typeof data.musicConfigured,"boolean");
 const unauth=await fetch(base+"/api/music/tracks",{signal:AbortSignal.timeout(20000)});
 assert.equal(unauth.status,200);
 const list=await unauth.json();
 assert.equal(list.signedIn,false);
 assert.deepEqual(list.tracks,[]);
 const stream=await fetch(base+"/api/music/stream?id=abcdefghijklmno",{signal:AbortSignal.timeout(20000)});
 assert.ok([401,503].includes(stream.status),"Private streaming must fail closed for guests");
 assert.equal(stream.headers.get("access-control-allow-origin"),null,"No cross-origin private responses");
});
test("Cloudflare Workers serves updated public backup and music sorting assets",async()=>{
 const main=await fetch(base+"/",{signal:AbortSignal.timeout(30000)});
 assert.equal(main.status,200);
 assert.match(main.headers.get("content-type")||"",/html/);
 assert.match(await main.text(),/music-tags\.js/);
 const tags=await fetch(base+"/music-tags.js",{signal:AbortSignal.timeout(20000)});
 assert.equal(tags.status,200);
 assert.match(await tags.text(),/FoodMusicTags/);
});
