"use strict";
const L = require("../_music-lib");

// The signed-in user's encrypted Good Food session stays server-side.
module.exports = async (req, res) => {
  const cfg = L.config();
  if (!cfg.ready) return L.json(res, 200, { configured: false, signedIn: false, tracks: [] });
  const s = await L.session(req, res, cfg);
  if (!s) return L.json(res, 200, { configured: true, signedIn: false, tracks: [] });
  const stream = new URL(req.url || "/api/music/tracks", "https://localhost").searchParams.get("stream") === "1";
  if (!stream) {
    try {
      const result = await L.listTracks(s.at, cfg.folders);
      return L.json(res, 200, { configured: true, signedIn: true, ...result }, { cache: "private, max-age=300" });
    } catch (e) {
      return L.json(res, 502, { configured: true, signedIn: true, error: e.status === 404 ? "folder_not_found" : "drive_error", tracks: [] });
    }
  }
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (typeof res.flushHeaders === "function") res.flushHeaders();
  const emit = data => { if (!res.writableEnded) res.write(JSON.stringify(data) + "\n"); };
  try {
    emit({ type: "start" });
    const result = await L.listTracks(s.at, cfg.folders, undefined, progress => emit({ type: "progress", ...progress }));
    emit({ type: "complete", configured: true, signedIn: true, ...result });
  } catch (e) {
    emit({ type: "error", error: e.status === 404 ? "folder_not_found" : "drive_error" });
  } finally {
    res.end();
  }
};
