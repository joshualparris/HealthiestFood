"use strict";
const crypto = require("node:crypto");
const L = require("../_music-lib");
const back = (res, status) => { res.statusCode = 302; res.setHeader("Location", "/?music=" + status + "#media"); res.setHeader("Cache-Control", "no-store"); res.end(); };
module.exports = async (req, res) => {
  const cfg = L.config();
  if (!cfg.ready) return back(res, "not_configured");
  const q = new URL(req.url, "https://x").searchParams;
  const expected = L.parseCookies(req)[L.STATE_COOKIE] || "";
  const got = q.get("state") || "";
  L.appendCookie(res, L.cookie(L.STATE_COOKIE, "", 0));
  if (!expected || expected.length !== got.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(got))) return back(res, "bad_state");
  if (!q.get("code")) return back(res, "cancelled");
  try {
    const t = await L.tokenRequest(cfg, { grant_type: "authorization_code", code: q.get("code"), redirect_uri: L.redirectUri(req) });
    const claims = L.decodeIdToken(t.id_token);
    const email = String(claims.email || "").toLowerCase();
    if (!claims.email_verified || !cfg.allowed.includes(email)) return back(res, "not_allowed");
    const s = { email, rt: t.refresh_token || "", at: t.access_token, exp: Date.now() + (t.expires_in || 3600) * 1000 };
    L.appendCookie(res, L.cookie(L.SESSION_COOKIE, L.seal(s, cfg.secret), L.SESSION_DAYS * 86400));
    return back(res, "signed_in");
  } catch { return back(res, "error"); }
};
