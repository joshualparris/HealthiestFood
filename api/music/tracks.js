"use strict";
const L = require("../_music-lib");
module.exports = async (req, res) => {
  const cfg = L.config();
  if (!cfg.ready) return L.json(res, 200, { configured: false, signedIn: false, tracks: [] });
  const s = await L.session(req, res, cfg);
  if (!s) return L.json(res, 200, { configured: true, signedIn: false, tracks: [] });
  try {
    const { tracks, truncated } = await L.listTracks(s.at, cfg.folder);
    return L.json(res, 200, { configured: true, signedIn: true, tracks, truncated }, { cache: "private, max-age=300" });
  } catch (e) {
    return L.json(res, 502, { configured: true, signedIn: true, error: e.status === 404 ? "folder_not_found" : "drive_error", tracks: [] });
  }
};
