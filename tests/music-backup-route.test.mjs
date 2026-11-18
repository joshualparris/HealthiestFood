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
