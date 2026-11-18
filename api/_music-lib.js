/* Google Drive music for "Music while cooking" — same architecture as JoshBooksOnline:
 * Google OAuth on the server, an email allowlist, and a Range-forwarding stream proxy
 * that uses the signed-in user's own Drive token. Nothing is rehosted or cached here.
 *
 * Required Vercel env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, MUSIC_SESSION_SECRET
 * (32+ random chars) and ALLOWED_GOOGLE_EMAILS (comma separated). Optional: MUSIC_FOLDER_ID.
 * The session is an AES-256-GCM encrypted, HttpOnly cookie, so no database is needed.
 */
"use strict";
const crypto = require("node:crypto");

const SESSION_COOKIE = "hf_music";
const STATE_COOKIE = "hf_music_state";
const SESSION_DAYS = 30;
const DEFAULT_FOLDER = "17p5ZJtrUNVKJMlW0EO4aatiguzv9BM1v"; // starred "Music" folder
const SCOPE = "openid email https://www.googleapis.com/auth/drive.readonly";
// Vercel functions cap response bodies, so each stream response carries at most this many bytes.
// Audio elements request the next range automatically.
const MAX_CHUNK = 3 * 1024 * 1024;
const FILE_ID = /^[A-Za-z0-9_-]{10,200}$/;

function config() {
  const env = process.env;
  const allowed = String(env.ALLOWED_GOOGLE_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  const folder = FILE_ID.test(env.MUSIC_FOLDER_ID || "") ? env.MUSIC_FOLDER_ID : DEFAULT_FOLDER;
  const ready = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && String(env.MUSIC_SESSION_SECRET || "").length >= 32 && allowed.length);
  return { ready, clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET, secret: env.MUSIC_SESSION_SECRET, allowed, folder };
}

function origin(req) {
  if (process.env.MUSIC_PUBLIC_ORIGIN) return process.env.MUSIC_PUBLIC_ORIGIN.replace(/\/$/, "");
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "").split(",")[0].trim();
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  return proto + "://" + host;
}
const redirectUri = req => origin(req) + "/api/music/callback";

function parseCookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || "").split(";")) {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
function cookie(name, value, maxAge) {
  return name + "=" + encodeURIComponent(value) + "; Path=/api/music; HttpOnly; Secure; SameSite=Lax; Max-Age=" + maxAge;
}
function appendCookie(res, value) {
  const prev = res.getHeader("Set-Cookie");
  res.setHeader("Set-Cookie", prev ? [].concat(prev, value) : value);
}

const key = secret => crypto.createHash("sha256").update(String(secret)).digest();
function seal(obj, secret) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv("aes-256-gcm", key(secret), iv);
  const body = Buffer.concat([c.update(JSON.stringify(obj), "utf8"), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), body]).toString("base64url");
}
function unseal(token, secret) {
  try {
    const raw = Buffer.from(String(token), "base64url");
    if (raw.length < 29) return null;
    const d = crypto.createDecipheriv("aes-256-gcm", key(secret), raw.subarray(0, 12));
    d.setAuthTag(raw.subarray(12, 28));
    return JSON.parse(Buffer.concat([d.update(raw.subarray(28)), d.final()]).toString("utf8"));
  } catch { return null; }
}

function json(res, status, body, extra = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", extra.cache || "no-store");
  res.end(JSON.stringify(body));
}

function decodeIdToken(idToken) {
  // The id_token arrives directly from Google's token endpoint over TLS, so Google's
  // guidance allows reading its claims without separate signature verification.
  try { return JSON.parse(Buffer.from(String(idToken).split(".")[1], "base64url").toString("utf8")); } catch { return {}; }
}

async function tokenRequest(cfg, params) {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: cfg.clientId, client_secret: cfg.clientSecret, ...params })
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data.access_token) throw Object.assign(new Error("Google token request failed"), { status: r.status, detail: data.error });
  return data;
}

/* Returns the live session (refreshing the access token when needed) or null. */
async function session(req, res, cfg) {
  const s = unseal(parseCookies(req)[SESSION_COOKIE], cfg.secret);
  if (!s || !s.email || !cfg.allowed.includes(String(s.email).toLowerCase())) return null;
  if (s.at && s.exp > Date.now() + 60000) return s;
  if (!s.rt) return null;
  try {
    const t = await tokenRequest(cfg, { grant_type: "refresh_token", refresh_token: s.rt });
    const next = { ...s, at: t.access_token, exp: Date.now() + (t.expires_in || 3600) * 1000 };
    appendCookie(res, cookie(SESSION_COOKIE, seal(next, cfg.secret), SESSION_DAYS * 86400));
    return next;
  } catch { return null; }
}

/* Breadth-first walk of the music folder (Drive v3 only supports direct `in parents`). */
async function listTracks(accessToken, rootId, limits = { folders: 150, tracks: 2000 }) {
  const queue = [{ id: rootId, path: "" }], tracks = [];
  let visited = 0;
  while (queue.length && visited < limits.folders && tracks.length < limits.tracks) {
    const folder = queue.shift(); visited++;
    let pageToken = "";
    do {
      const q = "'" + folder.id + "' in parents and trashed=false and (mimeType='application/vnd.google-apps.folder' or mimeType contains 'audio/')";
      const url = "https://www.googleapis.com/drive/v3/files?" + new URLSearchParams({
        q, pageSize: "1000", orderBy: "name", supportsAllDrives: "true", includeItemsFromAllDrives: "true",
        fields: "nextPageToken,files(id,name,mimeType,size)", ...(pageToken ? { pageToken } : {})
      });
      const r = await fetch(url, { headers: { Authorization: "Bearer " + accessToken } });
      if (!r.ok) throw Object.assign(new Error("Drive list failed"), { status: r.status });
      const data = await r.json();
      for (const f of data.files || []) {
        if (f.mimeType === "application/vnd.google-apps.folder") queue.push({ id: f.id, path: folder.path ? folder.path + " / " + f.name : f.name });
        else if (tracks.length < limits.tracks) tracks.push({ id: f.id, title: f.name.replace(/\.(mp3|m4a|aac|ogg|oga|wav|flac|opus)$/i, ""), album: folder.path, mime: f.mimeType, size: Number(f.size) || 0 });
      }
      pageToken = data.nextPageToken || "";
    } while (pageToken && tracks.length < limits.tracks);
  }
  return { tracks, truncated: queue.length > 0 || tracks.length >= limits.tracks };
}

/* Clamp a browser Range header to a bounded chunk. Returns the upstream Range value. */
function clampRange(header, max = MAX_CHUNK) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(String(header || "").trim());
  if (!m || (m[1] === "" && m[2] === "")) return "bytes=0-" + (max - 1);
  if (m[1] === "") { const n = Math.min(Number(m[2]), max); return "bytes=-" + n; } // suffix range
  const start = Number(m[1]);
  const end = m[2] === "" ? start + max - 1 : Math.min(Number(m[2]), start + max - 1);
  return end < start ? null : "bytes=" + start + "-" + end;
}

module.exports = { SESSION_COOKIE, STATE_COOKIE, SESSION_DAYS, SCOPE, FILE_ID, MAX_CHUNK, config, origin, redirectUri, parseCookies, cookie, appendCookie, seal, unseal, json, decodeIdToken, tokenRequest, session, listTracks, clampRange };
