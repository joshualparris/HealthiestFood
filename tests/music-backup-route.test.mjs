import test from "node:test";
import assert from "node:assert/strict";

test("production Good Food can proxy a safe Cloudflare backup health probe", async () => {
  const url = "https://healthiest-food.vercel.app/__music-backup-health";
  const response = await fetch(url, { signal: AbortSignal.timeout(20000), redirect: "manual" });
  assert.equal(response.status, 200, "Vercel project routing proxy should return HTTP 200");
  const json = await response.json();
  assert.equal(json.ok, true);
  assert.equal(json.service, "cloudflare-healthiest-food-music");
});

test("production Google Drive music API is configured and denies anonymous library and streaming access",async()=>{
 const origin="https://healthiest-food.vercel.app";
 const response=await fetch(origin+"/api/music/tracks?mode=page&stream=1",{
  headers:{Accept:"application/x-ndjson, application/json"},
  signal:AbortSignal.timeout(20000)
 });
 assert.equal(response.status,200);
 assert.match(response.headers.get("content-type")||"",/application\/json/);
 const body=await response.json();
 assert.equal(body.configured,true,"Production music OAuth server settings must be configured");
 assert.equal(body.signedIn,false);
 assert.deepEqual(body.tracks,[]);
 const audio=await fetch(origin+"/api/music/stream?id=abcdefghijklmno",{signal:AbortSignal.timeout(20000)});
 assert.equal(audio.status,401,"Audio streams must require a signed-in Google account");
});
