# In-app podcast player: exact audio sources, persistence, background audio and verification

*Implementation date: 17 October 2026 (Australia/Sydney). Source code is public in this repository.*

**Play:** [HealthiestFood Podcasts & Videos — GitHub Pages](https://joshualparris.github.io/HealthiestFood/#media) | [Render backup](https://healthiest-food-backup.onrender.com/#media).

## What was implemented

HealthiestFood's **16 individual Australian Broadcasting Corporation podcast episodes** now offer **Play here**, not just an outbound ABC Listen link. This uses a **single normal HTML5 `Audio` element created in the top-level HealthiestFood document**. The component is never removed when switching between Home, Recipes, Meal Planner, Shopping, Science, Podcasts, embedded Longevity Guide, embedded Cooking Methods Lab or other internal tools. The small fixed player is available across these routes, and **minimising it collapses its controls without pausing audio**.

Controls: play/pause, seek/drag progress, 15 seconds backwards, 30 seconds forwards, previous/next curated ABC episode, 0.75×/1×/1.25×/1.5×/1.75×/2× speeds, current episode title, media-publisher link, stop/close, and last playback position per episode saved **locally on the same device**. Positions are not sent to a server. The current audio resumes from where it stopped after an ordinary reload *when you explicitly press Play again*; **the site does not autoplay**. There is no login, download button, or audio file hosted in the app.

The `navigator.mediaSession` browser interface supplies the episode title, publisher, play/pause, seeking, previous/next and position for **supported** lock-screen / notification / headphone controls. It is a request to the browser; its presence does not override system restrictions.

## Direct publisher streaming, not copyrighted audio rehosting

The official RSS feeds are:

- [ABC What's That Rash? public podcast RSS](https://www.abc.net.au/feeds/12017248/podcast.xml).
- [ABC Health Report — Separate stories public podcast RSS](https://www.abc.net.au/feeds/2887252/podcast.xml).

The source builder `scripts/generate_podcast_sources.py` reads those official XML feeds, matches each curated episode by **exact normalised episode title and publication year**, and writes `podcast-streams.js` with the corresponding `<enclosure type="audio/mpeg">` URL. **All 16/16 streams were checked successfully with an HTTP HEAD request on GitHub's network on 17 October 2026**. ABC hosts/streams the files on `mediacore-live-production.akamaized.net` or `abcmedia.akamaized.net`; the site does **not** download, transcode, republish, cache or proxy the audio bytes. The browser makes a normal request directly to the ABC/Akamai CDN only when playback is requested; that provider will receive standard network request information, such as IP address. ABC may change or withdraw the URLs, and availability can change in the future. If playing fails, the UI shows the ABC original-episode link.

A GitHub Actions workflow `abc-podcast-sources.yml` can refresh links weekly while failing closed if a historical episode disappears or matches ambiguously. The source file contains publicly served URLs and episode metadata only.

The seven curated video resources **are not podcasts**. They still open at their publisher, and continue to have separate primary-research/guideline citations. Browser autoplay and background playback of embedded YouTube is not claimed.

## Why navigation is different

A normal hyperlink to a **new HTML document tears down the current HTML5 audio instance**, stopping playback. The new `app-pages.js` converts internal links to the standalone `longevity.html`, `cooking-methods.html`, `product-check.html` and `device-timer-check.html` into **same-document views** with those pages embedded in same-origin iframes. These pages use `iframe-route-bridge.js` to send navigation back to the parent by origin-checked `postMessage`. The audio instance stays in the parent app. Standalone direct URLs still function separately. Clicking an external site link or navigating away/reloading the entire page may stop playback; you may have to tap Play again to resume.

## What 'background playback' does and does not mean

- **Minimise the podcast controls inside the website:** playback continues; verified in Chromium browser automation.
- **Change pages using the website menus:** top-level audio stays alive through the app routes; verified in Chromium browser automation.
- **Turn the phone screen off or switch apps:** this can work in Android Chrome or an installed PWA through HTML5 audio plus Media Session. **The browser and phone ultimately decide** whether audio continues in the background, subject to power management and media policy; this cannot be guaranteed by this static web app.
- **Force-close the app/browser, kill its process or restart the device:** continued playback is not expected. You can return and press Play again; position was saved locally.
- **Download all podcasts for offline/background playback:** not implemented. Only the page shell and audio source references are cacheable; the remote ABC recordings require the network.
- **Seamless playback when entering the direct `longevity.html` or `cooking-methods.html` document in a new browser tab from outside the main app:** not promised, because that creates a separate browser document and separate audio lifecycle.

For Android: open [HealthiestFood](https://joshualparris.github.io/HealthiestFood/#media) in Chrome, play an episode, minimise the *podcast bar*, navigate between Recipes and Cooking Methods, then lock the phone. Try playback from the lock-screen or notifications. If the phone suspends background audio, review the device's browser battery/background restrictions and test the same link in the browser; do not disable essential power protections solely because of this feature. You can use the official **ABC listen** app for podcast playback if background restrictions prevent the site continuing.

## Evidence and test status

- `tests/podcast-player.test.cjs` tests all **16 original-episode URL→RSS enclosure mappings**, explicit URL host restrictions, source links, local media playback/UI contract and the one-document navigation architecture.
- `tests/media-library.test.cjs` covers the separate 23-resource library, filters and source labels.
- `e2e/smoke.cjs` tests the player in a simulated mobile Chromium browser with a locally generated **45-second WAV test tone/silence fixture** substituted for the remote MP3 for deterministic testing. The code verifies the episode starts via a real Play click, the compact bar stays active, and the **identical original `<audio>` DOM element remains playing** through Recipes, Planner, Cooking Lab, Longevity Guide and back to Podcasts; plus playback speed and stopping. This validates navigation behaviour, **not the phone operating system's real screen-off/background restrictions**.
- Live GitHub Pages and Render Playwright smoke tests also run for the published website. The original Vercel deployment may trail GitHub Pages/Render depending on its deployment quota.

## Further enhancement opportunities

Real Android Chrome physical-device lock-screen/notification/headphone testing remains important; the current session has no physical access to the user's phone. If verified OS-level **uninterrupted playback after the browser's process is killed** is a strict requirement, a native Android app or trusted podcast app running a background foreground-media service is required rather than a static PWA. Do not claim static websites can silently run sound after force-close.

**Copyright and correctness:** This project references publicly published podcast RSS enclosures in the standard manner and preserves original ABC attribution and an original-episode link; it does not redistribute or claim ownership of any audio.
