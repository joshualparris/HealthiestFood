# Independent music backend on Render

The GitHub Pages and existing Render *static* backups cannot execute `/api/music/*`. The music player requires a same-origin private Google Drive API. `render-music-server.js` reuses the Vercel music handlers on a standard Node.js service with **no third-party packages**, so `/`, `/api/music/tracks`, `/api/music/stream`, `/api/music/login`, `/api/music/callback`, and `/api/music/logout` can work from the same Render hostname.

## Before deploying

- Check the Render workspace and the price/limits of creating a new **web service**. The optional `render.yaml` explicitly chooses the Free plan (sleep after inactivity; first music load may be slow). It does **not** replace the working backup static site.
- Create a new Render Node web service from this repo, or review the `render.yaml` Blueprint first. Start command: `node render-music-server.js`; health check: `/health`.
- Set **server-only** variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ALLOWED_GOOGLE_EMAILS`, and a unique random 32+-character `MUSIC_SESSION_SECRET`. `render.yaml` can generate the latter. Optionally set `MUSIC_FOLDER_IDS` for library folders.
- Set `MUSIC_PUBLIC_ORIGIN` to the exact resulting HTTPS Render service origin (e.g. `https://healthiest-food-music.onrender.com`, **only if that is the actual hostname**). Add `<actual origin>/api/music/callback` to the Google OAuth client's *authorised redirect URIs* in Google Cloud Console. This is essential: a Vercel-only redirect URI is not sufficient.
- Do not copy Google Drive tokens into the browser, GitHub, or CI. The private keys belong exclusively in Render environment variables. No Google sign-in or streaming is performed until configured.

## Verify

1. `GET /health` -> HTTP 200, `ok: true`, `musicConfigured: true`. This indicates settings are present, not that Google login works.
2. `GET /api/music/tracks` when signed out -> JSON with `configured: true`, `signedIn: false`; no private songs are returned.
3. Open `/#media`, sign in with an allowlisted Google account, confirm the callback stays on the Render hostname and lists songs.
4. Play a track and seek; confirm `/api/music/stream?id=...` responds `206` with `audio/*`, `Content-Range` and private cookie auth. Check artist/album/genre/folder controls; **read MP3 tags** is opt-in.
5. Sign out and verify music API calls no longer return private tracks. Verify unauthenticated stream returns `401` and no tokens leak in browser source or the URL.

GitHub Pages cannot run private server-side endpoints, and shouldn't be given credentials. It can provide a link to the Render music site after that site is configured and verified.

Local test: `node --test tests/render-music-server.test.cjs`. CI mocks the unconfigured service; it cannot verify real Google login without user credentials and a completed OAuth redirect.
