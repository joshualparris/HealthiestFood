/* Independent HealthiestFood private Google Drive music API on Cloudflare Workers.
 * Serves the current public Render static site on this same origin.
 * No client-side tokens, no access to GitHub secrets and no paid infrastructure required.
 */
const FOLDERS = ["17p5ZJtrUNVKJMlW0EO4aatiguzv9BM1v", "1k1AcSLD9HfkeY1-C8nO7aSSr7K8KXI09"];
const COOKIE = "hf_music", STATE = "hf_music_state", DAYS = 30;
const FILE_ID = /^[A-Za-z0-9_-]{10,200}$/;
const SCOPE = "openid email https://www.googleapis.com/auth/drive.readonly";
const STATIC_ORIGIN = "https://healthiest-food-backup.onrender.com";
const enc = new TextEncoder(), dec = new TextDecoder();
const base64url = bytes => {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};
const unbase64url = v => {
  const s = String(v).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(s + "=".repeat((4 - s.length % 4) % 4));
  return Uint8Array.from(bin, c => c.charCodeAt(0));
};
const random = n => crypto.getRandomValues(new Uint8Array(n));
function config(env) {
  const allowed = String(env.ALLOWED_GOOGLE_EMAILS || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  const specified = String(env.MUSIC_FOLDER_IDS || "").split(",").map(s => s.trim()).filter(x => FILE_ID.test(x));
  return {
    ready: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && String(env.MUSIC_SESSION_SECRET || "").length >= 32 && allowed.length),
    clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET, secret: env.MUSIC_SESSION_SECRET,
    allowed, folders: specified.length ? [...new Set(specified)] : FOLDERS
  };
}
function cookies(request) {
  const obj = {};
  for (const p of String(request.headers.get("cookie") || "").split(";")) {
    const i = p.indexOf("=");
    if (i > 0) {
      try { obj[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); } catch {}
    }
  }
  return obj;
}
const setCookie = (name, value, maxAge) => name + "=" + encodeURIComponent(value) +
  "; Path=/api/music; HttpOnly; Secure; SameSite=Lax; Max-Age=" + maxAge;
const apiHeaders = () => ({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
function json(status, data, extraCookie) {
  const headers = new Headers(apiHeaders());
  if (extraCookie) headers.append("Set-Cookie", extraCookie);
  return new Response(JSON.stringify(data), { status, headers });
}
function redirect(path, cookiesToSet = []) {
  const headers = new Headers({ "Location": path, "Cache-Control": "no-store" });
  for (const c of cookiesToSet) if (c) headers.append("Set-Cookie", c);
  return new Response(null, { status: 302, headers });
}
async function cryptoKey(secret) {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(secret));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}
async function seal(value, secret) {
  const iv = random(12);
  const raw = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await cryptoKey(secret), enc.encode(JSON.stringify(value)));
  const out = new Uint8Array(iv.length + raw.byteLength);
  out.set(iv, 0); out.set(new Uint8Array(raw), iv.length);
  return base64url(out);
}
async function unseal(value, secret) {
  try {
    const raw = unbase64url(value);
    if (raw.length < 29) return null;
    const jsonText = await crypto.subtle.decrypt({ name: "AES-GCM", iv: raw.slice(0, 12) }, await cryptoKey(secret), raw.slice(12));
    return JSON.parse(dec.decode(jsonText));
  } catch { return null; }
}
async function tokenRequest(cfg, body) {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: cfg.clientId, client_secret: cfg.clientSecret, ...body })
  });
  const payload = await r.json().catch(() => ({}));
  if (!r.ok || !payload.access_token) throw new Error("Google OAuth token exchange failed");
  return payload;
}
async function session(request, cfg) {
  const s = await unseal(cookies(request)[COOKIE], cfg.secret);
  if (!s?.email || !cfg.allowed.includes(String(s.email).toLowerCase())) return null;
  if (s.at && s.exp > Date.now() + 60000) return { s, cookie: null };
  if (!s.rt) return null;
  try {
    const t = await tokenRequest(cfg, { grant_type: "refresh_token", refresh_token: s.rt });
    const next = { ...s, at: t.access_token, exp: Date.now() + (t.expires_in || 3600) * 1000 };
    return { s: next, cookie: setCookie(COOKIE, await seal(next, cfg.secret), DAYS * 86400) };
  } catch { return null; }
}
async function listTracks(accessToken, roots) {
  async function folderName(id) {
    try {
      const r = await fetch("https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(id) + "?fields=name&supportsAllDrives=true",
        { headers: { Authorization: "Bearer " + accessToken } });
      return r.ok ? String((await r.json()).name || "") : "";
    } catch { return ""; }
  }
  const names = await Promise.all(roots.map(folderName));
  const queue = roots.map((id, i) => ({ id, path: names[i] }));
  const visitedIds = new Set(roots), seen = new Set(), tracks = [];
  let visited = 0, missing = 0;
  while (queue.length && visited < 300 && tracks.length < 4000) {
    const folder = queue.shift(); visited++;
    let pageToken = "";
    do {
      const q = "'" + folder.id + "' in parents and trashed=false and (mimeType='application/vnd.google-apps.folder' or mimeType contains 'audio/')";
      const args = new URLSearchParams({ q, pageSize: "1000", orderBy: "name",
        supportsAllDrives: "true", includeItemsFromAllDrives: "true",
        fields: "nextPageToken,files(id,name,mimeType,size)", ...(pageToken ? { pageToken } : {}) });
      const r = await fetch("https://www.googleapis.com/drive/v3/files?" + args,
        { headers: { Authorization: "Bearer " + accessToken } });
      if (!r.ok) {
        if (roots.includes(folder.id) && (r.status === 403 || r.status === 404)) { missing++; break; }
        throw new Error("Drive listing failed: " + r.status);
      }
      const d = await r.json();
      for (const f of d.files || []) {
        if (f.mimeType === "application/vnd.google-apps.folder") {
          if (!visitedIds.has(f.id)) {
            visitedIds.add(f.id);
            queue.push({ id: f.id, path: folder.path ? folder.path + " / " + f.name : f.name });
          }
        } else if (!seen.has(f.id) && tracks.length < 4000) {
          seen.add(f.id);
          tracks.push({ id: f.id, title: f.name.replace(/\.(mp3|m4a|aac|ogg|oga|wav|flac|opus)$/i, ""),
            album: folder.path, mime: f.mimeType, size: Number(f.size) || 0 });
        }
      }
      pageToken = d.nextPageToken || "";
    } while (pageToken && tracks.length < 4000);
  }
  if (missing === roots.length) throw new Error("folder_not_found");
  return { tracks, truncated: queue.length > 0 || tracks.length >= 4000, missingFolders: missing };
}

/* Cursor-based listing: each request stays below Cloudflare Free's 50 external
 * subrequests. Cursor state is authenticated and encrypted with the same
 * server-only key as sessions, and bound to the signed-in Google account. */
const PAGE_BATCH=20,MAX_SCAN_FOLDERS=8000,MAX_SCAN_TRACKS=15000,MAX_SCAN_PAGES=500;
async function scanPage(accessToken,cfg,email,cursor) {
 let state;
 if (cursor) {
  if(typeof cursor!=="string"||cursor.length>750000)throw new Error("invalid_cursor");
  state=await unseal(cursor,cfg.secret);
  if(!state||state.email!==email||state.roots!==cfg.folders.join(",")||
     !Array.isArray(state.queue)||!Array.isArray(state.seenFolders)||
     !Number.isInteger(state.pages)||state.pages>=MAX_SCAN_PAGES)throw new Error("invalid_cursor");
 } else {
  const names=await Promise.all(cfg.folders.map(async (id,i)=>{
   try {
    const r=await fetch("https://www.googleapis.com/drive/v3/files/"+encodeURIComponent(id)+"?fields=name&supportsAllDrives=true",
     {headers:{Authorization:"Bearer "+accessToken}});
    return r.ok?String((await r.json()).name||"Music"):"Music "+(i+1);
   } catch{return "Music "+(i+1);}
  }));
  state={email,roots:cfg.folders.join(","),pages:0,visited:0,total:0,missing:0,skipped:0,
   queue:cfg.folders.map((id,i)=>({id,path:names[i],token:"",root:true})),
   seenFolders:[...cfg.folders]};
 }
 const seenFolders=new Set(state.seenFolders),pageTracks=[],seenTracks=new Set();
 let requests=0;
 async function listItem(item){
  const q="'"+item.id+"' in parents and trashed=false and (mimeType='application/vnd.google-apps.folder' or mimeType contains 'audio/')";
  const args=new URLSearchParams({q,pageSize:"1000",orderBy:"name",supportsAllDrives:"true",
   includeItemsFromAllDrives:"true",fields:"nextPageToken,files(id,name,mimeType,size)",...(item.token?{pageToken:item.token}:{})});
  let r;
  for(let attempt=0;attempt<2;attempt++){
   r=await fetch("https://www.googleapis.com/drive/v3/files?"+args,{headers:{Authorization:"Bearer "+accessToken}});
   if(r.ok||![429,500,502,503,504].includes(r.status)||attempt===1)break;
  }
  if(!r.ok)throw Object.assign(new Error("Drive listing error"),{status:r.status});
  return await r.json();
 }
 while(state.queue.length&&requests<PAGE_BATCH&&state.visited<MAX_SCAN_FOLDERS&&state.total<MAX_SCAN_TRACKS){
  const batch=state.queue.splice(0,Math.min(6,PAGE_BATCH-requests));
  const data=await Promise.all(batch.map(async item=>{try{return{data:await listItem(item)}}catch(error){return{error}}}));
  requests+=batch.length;
  for(let i=0;i<batch.length;i++){
   const item=batch[i],result=data[i];
   state.visited++;
   if(result.error){
    if([403,404].includes(result.error.status)){
     if(item.root)state.missing++;
     else state.skipped++;
     continue;
    }
    throw result.error;
   }
   const rows=Array.isArray(result.data.files)?result.data.files:[];
   if(result.data.nextPageToken)
    state.queue.unshift({...item,token:result.data.nextPageToken});
   for(const file of rows){
    if(!file?.id)continue;
    if(file.mimeType==="application/vnd.google-apps.folder"){
     if(!seenFolders.has(file.id)){
      seenFolders.add(file.id);
      state.queue.push({id:file.id,path:item.path?item.path+" / "+file.name:file.name,token:""});
     }
    }else if(String(file.mimeType||"").startsWith("audio/")&&!seenTracks.has(file.id)&&state.total<MAX_SCAN_TRACKS){
     seenTracks.add(file.id);
     pageTracks.push({id:file.id,title:String(file.name||"").replace(/\.(mp3|m4a|aac|ogg|oga|wav|flac|opus)$/i,""),
      album:item.path,mime:file.mimeType,size:Number(file.size)||0});
     state.total++;
    }
   }
  }
 }
 state.pages++;
 state.seenFolders=[...seenFolders];
 const truncated=state.visited>=MAX_SCAN_FOLDERS||state.total>=MAX_SCAN_TRACKS||state.pages>=MAX_SCAN_PAGES;
 const done=!state.queue.length||truncated;
 if(state.missing===cfg.folders.length)throw new Error("folder_not_found");
 return{
  pageMode:"cursor",configured:true,signedIn:true,tracks:pageTracks,
  nextCursor:done?null:await seal(state,cfg.secret),done,truncated,
  foldersScanned:state.visited,foldersQueued:state.queue.length,songsFound:state.total,
  missingFolders:state.missing,skippedFolders:state.skipped
 };
}

function clampRange(header) {
  const max = 3 * 1024 * 1024;
  const m = /^bytes=(\d*)-(\d*)$/.exec(String(header || "").trim());
  if (!m || (!m[1] && !m[2])) return "bytes=0-" + (max - 1);
  if (!m[1]) return "bytes=-" + Math.min(Number(m[2]), max);
  const start = Number(m[1]);
  if (!Number.isSafeInteger(start)) return null;
  const end = !m[2] ? start + max - 1 : Math.min(Number(m[2]), start + max - 1);
  return end < start || !Number.isSafeInteger(end) ? null : "bytes=" + start + "-" + end;
}
async function musicApi(request, env, pathname) {
  const cfg = config(env);
  if (pathname === "/api/music/logout") {
    if (request.method !== "POST") return json(405, { error: "method_not_allowed" });
    return json(200, { signedIn: false }, setCookie(COOKIE, "", 0));
  }
  if (request.method !== "GET" && !(pathname === "/api/music/tracks" && request.method === "POST")) return json(405, { error: "method_not_allowed" });
  if (!cfg.ready) {
    if (pathname === "/api/music/tracks") return json(200, { configured: false, signedIn: false, tracks: [] });
    return json(503, { error: "not_configured" });
  }
  const origin = String(env.MUSIC_PUBLIC_ORIGIN || new URL(request.url).origin).replace(/\/$/, "");
  const callback = origin + "/api/music/callback";
  if (pathname === "/api/music/login") {
    const state = base64url(random(24));
    const url = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
      client_id: cfg.clientId, redirect_uri: callback, response_type: "code",
      scope: SCOPE, access_type: "offline", prompt: "consent",
      include_granted_scopes: "true", state
    });
    return redirect(url, [setCookie(STATE, state, 600)]);
  }
  if (pathname === "/api/music/callback") {
    const q = new URL(request.url).searchParams;
    const expected = cookies(request)[STATE] || "";
    const got = q.get("state") || "";
    const clear = setCookie(STATE, "", 0);
    if (!expected || got !== expected) return redirect("/?music=bad_state#media", [clear]);
    if (!q.get("code")) return redirect("/?music=cancelled#media", [clear]);
    try {
      const t = await tokenRequest(cfg, {
        grant_type: "authorization_code", code: q.get("code"), redirect_uri: callback
      });
      const result = await fetch("https://openidconnect.googleapis.com/v1/userinfo",
        { headers: { Authorization: "Bearer " + t.access_token } });
      if (!result.ok) throw new Error("Google identity verification failed");
      const info = await result.json();
      const email = String(info.email || "").toLowerCase();
      if (info.email_verified !== true || !cfg.allowed.includes(email))
        return redirect("/?music=not_allowed#media", [clear]);
      const s = { email, at: t.access_token, rt: t.refresh_token || "",
        exp: Date.now() + (t.expires_in || 3600) * 1000 };
      return redirect("/?music=signed_in#media", [clear, setCookie(COOKIE, await seal(s, cfg.secret), DAYS * 86400)]);
    } catch { return redirect("/?music=error#media", [clear]); }
  }
  if (pathname === "/api/music/tracks") {
    const logged = await session(request, cfg);
    if (!logged) return json(200, { configured: true, signedIn: false, tracks: [] });
    const paged = new URL(request.url).searchParams.get("mode") === "page";
    if (paged) {
      try {
        const input = request.method === "POST" ? await request.json() : {};
        const d = await scanPage(logged.s.at, cfg, logged.s.email, input?.cursor);
        return json(200, d, logged.cookie);
      } catch (error) {
        return json(error?.message==="invalid_cursor"?400:502, { configured:true,signedIn:true,
          error:error?.message==="invalid_cursor"?"invalid_cursor":error?.message==="folder_not_found"?"folder_not_found":"drive_error",
          tracks:[] },logged.cookie);
      }
    }
    try {
      const d = await listTracks(logged.s.at, cfg.folders);
      return json(200, { configured: true, signedIn: true, ...d }, logged.cookie);
    } catch (e) {
      return json(502, { configured: true, signedIn: true,
        error: e.message === "folder_not_found" ? "folder_not_found" : "drive_error", tracks: [] }, logged.cookie);
    }
  }
  if (pathname === "/api/music/stream") {
    const id = new URL(request.url).searchParams.get("id") || "";
    if (!FILE_ID.test(id)) return json(400, { error: "bad_id" });
    const range = clampRange(request.headers.get("range"));
    if (!range) return json(416, { error: "bad_range" });
    const logged = await session(request, cfg);
    if (!logged) return json(401, { error: "sign_in_required" });
    let upstream;
    try {
      upstream = await fetch("https://www.googleapis.com/drive/v3/files/" + encodeURIComponent(id) +
        "?alt=media&supportsAllDrives=true", {
        headers: { Authorization: "Bearer " + logged.s.at, Range: range }
      });
    } catch { return json(502, { error: "drive_unreachable" }, logged.cookie); }
    if (!upstream.ok) return json(upstream.status === 404 ? 404 : upstream.status === 416 ? 416 : 502,
      { error: "stream_unavailable" }, logged.cookie);
    const type = String(upstream.headers.get("content-type") || "");
    if (!/^audio\//i.test(type) || upstream.status !== 206) {
      await upstream.body?.cancel?.();
      return json(415, { error: "invalid_audio_response" }, logged.cookie);
    }
    const headers = new Headers({ "Cache-Control": "private, no-store",
      "Accept-Ranges": "bytes", "X-Content-Type-Options": "nosniff" });
    for (const h of ["content-type", "content-length", "content-range", "etag", "last-modified"]) {
      const value = upstream.headers.get(h);
      if (value) headers.set(h, value);
    }
    if (logged.cookie) headers.append("Set-Cookie", logged.cookie);
    return new Response(upstream.body, { status: 206, headers });
  }
  return json(404, { error: "not_found" });
}
async function handle(request, env) {
  const url = new URL(request.url);
  if (url.pathname === "/health") {
    return json(200, { ok: true, service: "cloudflare-healthiest-food-music",
      musicConfigured: config(env).ready });
  }
  if (url.pathname.startsWith("/api/")) {
    if (!["/api/music/login", "/api/music/callback", "/api/music/tracks",
      "/api/music/stream", "/api/music/logout"].includes(url.pathname))
      return json(404, { error: "not_found" });
    return musicApi(request, env, url.pathname);
  }
  if (request.method !== "GET" && request.method !== "HEAD")
    return json(405, { error: "method_not_allowed" });
  const target = STATIC_ORIGIN + url.pathname + url.search;
  const upstream = await fetch(target, { method: request.method, redirect: "manual" });
  const headers = new Headers(upstream.headers);
  headers.delete("set-cookie");
  headers.set("X-Content-Type-Options", "nosniff");
  if (url.pathname === "/" || url.pathname === "/index.html" || url.pathname === "/service-worker.js")
    headers.set("Cache-Control", "no-cache");
  return new Response(upstream.body, { status: upstream.status, headers });
}
export { config, clampRange, seal, unseal, handle };
export default {
  async fetch(request, env) {
    try { return await handle(request, env); }
    catch { return json(502, { error: "temporary_unavailable" }); }
  }
};
