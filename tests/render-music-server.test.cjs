"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { once } = require("node:events");
const { createServer, publicFile } = require("../render-music-server");
let server, base;
test.before(async () => {
  server = createServer().listen(0, "127.0.0.1");
  await once(server, "listening");
  base = "http://127.0.0.1:" + server.address().port;
});
test.after(async () => { if (server) await new Promise(resolve => server.close(resolve)); });
test("health reports music readiness, without exposing secrets", async () => {
  const r = await fetch(base + "/health");
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true, service: "healthiest-food-music", musicConfigured: false });
  assert.equal(r.headers.get("cache-control"), "no-store");
});
test("serves website, player and tags on the same origin", async () => {
  for (const [name, type] of [["/", "text/html"], ["/music-cooking.js", "text/javascript"], ["/music-tags.js", "text/javascript"], ["/site.css", "text/css"]]) {
    const r = await fetch(base + name);
    assert.equal(r.status, 200, name);
    assert.ok(r.headers.get("content-type").startsWith(type), name);
    assert.equal(r.headers.get("x-content-type-options"), "nosniff");
    assert.ok((await r.text()).length > 50, name);
  }
});
test("private routes reuse server-side handlers and fail closed without configuration", async () => {
  const t = await fetch(base + "/api/music/tracks");
  assert.equal(t.status, 200);
  assert.deepEqual(await t.json(), { configured: false, signedIn: false, tracks: [] });
  const s = await fetch(base + "/api/music/stream?id=abcdefghijkl");
  assert.equal(s.status, 503);
  assert.deepEqual(await s.json(), { error: "not_configured" });
  const login = await fetch(base + "/api/music/login", { redirect: "manual" });
  assert.equal(login.status, 503);
});
test("blocks source code, dotfiles, traversal, incorrect methods and unknown API", async () => {
  for (const url of ["/api/_music-lib.js", "/tests/music-cooking.test.cjs", "/.github/workflows/site-tests.yml", "/render.yaml", "/api/music/unknown", "/%2e%2e/%2e%2e/api/_music-lib.js", "/v6/%2e%2e/api/_music-lib.js"]) {
    const r = await fetch(base + url);
    assert.equal(r.status, 404, url);
  }
  assert.equal((await fetch(base + "/api/music/tracks", { method: "POST" })).status, 405);
  assert.equal((await fetch(base + "/api/music/logout", { method: "GET" })).status, 405);
  assert.equal((await fetch(base + "/site.css", { method: "POST" })).status, 405);
  assert.equal(publicFile("/v5/../../api/_music-lib.js"), null);
});
test("supports HEAD without downloading assets", async () => {
  const r = await fetch(base + "/index.html", { method: "HEAD" });
  assert.equal(r.status, 200);
  assert.ok(Number(r.headers.get("content-length")) > 100);
  assert.equal((await r.text()).length, 0);
});
