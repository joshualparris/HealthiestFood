"use strict";
const L = require("../_music-lib");
module.exports = (req, res) => {
  if (req.method !== "POST") return L.json(res, 405, { error: "method_not_allowed" });
  L.appendCookie(res, L.cookie(L.SESSION_COOKIE, "", 0));
  return L.json(res, 200, { signedIn: false });
};
