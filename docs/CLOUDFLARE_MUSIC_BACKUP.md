# Cloudflare Workers private music backup

This independent backend avoids Render's 25-service limit and reuses the public static HealthiestFood site served from `https://healthiest-food-backup.onrender.com`. On its separate Workers hostname, it handles **same-origin** `/api/music/*` requests, using Google OAuth and an encrypted HttpOnly session cookie. No Google Drive tokens appear in frontend code. It works without a Node server or copying music.

## Deploy

The public code lives in `cloudflare-music-worker.mjs`. Deploy as an ES module Worker (`main_module: worker.mjs`) with the Cloudflare Workers API or CLI; enable its `workers.dev` subdomain. It can run on the Free plan subject to its execution and request limits.

Provide private secrets using **Workers environment secrets**, never source control: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `MUSIC_SESSION_SECRET` (random, at least 32 characters), `ALLOWED_GOOGLE_EMAILS`. Optionally `MUSIC_FOLDER_IDS`.

**Important:** the Google OAuth client needs the additional **Authorised redirect URI** `https://<actual-worker-name>.<actual-workers-subdomain>.workers.dev/api/music/callback`. A working Vercel callback does not authorise this separate Worker hostname. The code fails closed until the secrets are present.

## Verify

1. `GET /health` returns HTTP 200 and `musicConfigured: true` after settings exist. It can be false while the static proxy works.
2. `GET /` and `GET /music-tags.js` show the current front end and sort/filter controls.
3. Unauthenticated `GET /api/music/tracks` returns `signedIn: false`. Streaming without the session returns HTTP 401.
4. Open `/#media`, sign in with an allowlisted Google account, and verify the Google callback stays on the Worker hostname. It must not redirect to Vercel.
5. Songs must load; play/seek must get HTTP 206 and audio content with `Content-Range`; genre scan is opt-in and downloads only MP3 tag ranges.
6. Sign out and verify no list or stream access remains. Never use Google Drive credentials, refresh tokens or cookies in GitHub Actions.

Fallback site is static and remains usable if the Google private API is not configured. The existing Vercel site is unchanged.

Tests: `node --test tests/cloudflare-music-worker.test.mjs`. These mock Google and cannot prove live sign-in until Google Cloud redirect authorisation has been made.
