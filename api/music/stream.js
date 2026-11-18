"use strict";
const L = require("../_music-lib");
const PASS = ["content-type", "content-length", "content-range", "accept-ranges", "etag", "last-modified"];
module.exports = async (req, res) => {
  const cfg = L.config();
  if (!cfg.ready) return L.json(res, 503, { error: "not_configured" });
  const id = new URL(req.url, "https://x").searchParams.get("id") || "";
  if (!L.FILE_ID.test(id)) return L.json(res, 400, { error: "bad_id" });
  const range = L.clampRange(req.headers.range);
  if (!range) { res.statusCode = 416; return res.end(); }
  const s = await L.session(req, res, cfg);
  if (!s) return L.json(res, 401, { error: "sign_in_required" });
  let upstream;
  try {
    upstream = await fetch("https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(id) + "?alt=media&supportsAllDrives=true", {
      headers: { Authorization: "Bearer " + s.at, Range: range }
    });
  } catch { return L.json(res, 502, { error: "drive_unreachable" }); }
  if (!upstream.ok) { res.statusCode = upstream.status === 416 ? 416 : upstream.status === 404 ? 404 : 502; return res.end(); }
  const type = String(upstream.headers.get("content-type") || "");
  // Only proxy audio: this endpoint must not become a general Drive download link.
  if (!/^audio\//i.test(type)) { upstream.body?.cancel?.(); return L.json(res, 415, { error: "not_audio" }); }
  const body = Buffer.from(await upstream.arrayBuffer());
  res.statusCode = upstream.status;
  for (const h of PASS) { const v = upstream.headers.get(h); if (v) res.setHeader(h, v); }
  res.setHeader("Content-Length", body.length);
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("Cache-Control", "private, max-age=3600");
  res.end(body);
};
