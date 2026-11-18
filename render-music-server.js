"use strict";
/* Portable Node HTTP host for HealthiestFood's existing private Google Drive API.
 * No third-party dependencies; same-origin audio, OAuth and encrypted cookies.
 */
const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { pipeline } = require("node:stream/promises");
const music = require("./api/_music-lib");

const root = __dirname;
const endpoints = Object.freeze({
  "/api/music/login": ["GET", require("./api/music/login")],
  "/api/music/callback": ["GET", require("./api/music/callback")],
  "/api/music/tracks": ["GET", require("./api/music/tracks")],
  "/api/music/stream": ["GET", require("./api/music/stream")],
  "/api/music/logout": ["POST", require("./api/music/logout")]
});
const mime = Object.freeze({
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json", ".woff2": "font/woff2"
});
const publicFolders = new Set(["v5", "v6"]);
function publicFile(urlPath) {
  let name;
  try { name = decodeURIComponent(urlPath); } catch { return null; }
  if (name === "/") name = "/index.html";
  if (!name.startsWith("/") || /[\\\0]/.test(name) || name.includes("//")) return null;
  const parts = name.slice(1).split("/");
  if (parts.some(p => !p || p === "." || p === ".." || p.startsWith("."))) return null;
  if (parts.length > 1 && !publicFolders.has(parts[0])) return null;
  if (parts.length > 12 || !mime[path.extname(name).toLowerCase()]) return null;
  const filename = path.resolve(root, name.slice(1));
  return filename.startsWith(root + path.sep) ? filename : null;
}
function fail(res, status, message) {
  if (res.writableEnded) return;
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify({ error: message }));
}
async function handler(req, res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "DENY");
  let pathname;
  try { pathname = new URL(req.url, "https://local.invalid").pathname; }
  catch { return fail(res, 400, "bad_url"); }
  try {
    if (pathname === "/health") {
      if (req.method !== "GET" && req.method !== "HEAD") return fail(res, 405, "method_not_allowed");
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      return res.end(req.method === "HEAD" ? undefined : JSON.stringify({ ok: true, service: "healthiest-food-music", musicConfigured: music.config().ready }));
    }
    if (pathname.startsWith("/api/")) {
      const entry = endpoints[pathname];
      if (!entry) return fail(res, 404, "api_not_found");
      if (req.method !== entry[0]) return fail(res, 405, "method_not_allowed");
      return await entry[1](req, res);
    }
    if (req.method !== "GET" && req.method !== "HEAD") return fail(res, 405, "method_not_allowed");
    const filename = publicFile(pathname);
    if (!filename) return fail(res, 404, "not_found");
    let stats;
    try { stats = await fs.stat(filename); }
    catch { return fail(res, 404, "not_found"); }
    if (!stats.isFile()) return fail(res, 404, "not_found");
    res.setHeader("Content-Type", mime[path.extname(filename).toLowerCase()]);
    res.setHeader("Cache-Control", filename.endsWith("index.html") || filename.endsWith("service-worker.js") ? "no-cache" : "public, max-age=300");
    res.setHeader("Content-Length", stats.size);
    if (req.method === "HEAD") return res.end();
    await pipeline(require("node:fs").createReadStream(filename), res);
  } catch (err) {
    if (!res.headersSent) return fail(res, 500, "internal_error");
    if (!res.writableEnded) res.destroy();
  }
}
const createServer = () => http.createServer((req, res) => { handler(req, res).catch(() => fail(res, 500, "internal_error")); });
if (require.main === module) {
  const port = Number(process.env.PORT || 10000);
  createServer().listen(port, "0.0.0.0", () => console.log("HealthiestFood music backend listening on port " + port));
}
module.exports = { createServer, handler, publicFile };
