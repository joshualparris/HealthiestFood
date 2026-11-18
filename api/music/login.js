"use strict";
const crypto = require("node:crypto");
const L = require("../_music-lib");
module.exports = (req, res) => {
  const cfg = L.config();
  if (!cfg.ready) return L.json(res, 503, { error: "not_configured" });
  const state = crypto.randomBytes(24).toString("base64url");
  L.appendCookie(res, L.cookie(L.STATE_COOKIE, state, 600));
  const url = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
    client_id: cfg.clientId, redirect_uri: L.redirectUri(req), response_type: "code", scope: L.SCOPE,
    access_type: "offline", prompt: "consent", include_granted_scopes: "true", state
  });
  res.statusCode = 302; res.setHeader("Location", url); res.setHeader("Cache-Control", "no-store"); res.end();
};
