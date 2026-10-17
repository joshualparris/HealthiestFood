# Related public health and wellbeing deployments — 17 October 2026

This is the source trail for the **Longevity Guide → Your other health & wellbeing websites** directory. This report is about availability and identity, **not an endorsement of any clinical claims**.

## Verification

Checked public URLs from a GitHub Actions runner **without authentication**, recording the HTTP response status and HTML title. Source: [deployment probe workflow](../.github/workflows/check-health-deployments.yml) and [successful public HTTP audit run](https://github.com/joshualparris/HealthiestFood/actions/runs/38985021671). Vercel project metadata was inspected for production deployments. Render services, authenticated GitHub repository READMEs and Replit publish status were inspected where applicable.

**Results: 13 responding primary public URLs from eight distinct related projects.** All listed public entries returned HTTP **200**, with HTML titles matching the intended app (except the Josh Dashboard custom path, which also returned a valid title). The URL response check is point-in-time evidence; it does not prove that logins, external APIs or every feature works.

### Health knowledge and symptom support

| Project | Public deployed URL | Observed HTML title |
|---|---|---|
| HealthLens | https://health-lens-rust.vercel.app/ | Josh Health Analyser |
| HeartCalm | https://heart-calm-vert.vercel.app/ | Calm — Breathing & Palpitation Support |
| Health Reference / Cold & Flu App | https://cold-flu-app.vercel.app/ | Health Reference |

HealthLens's [GitHub README](https://github.com/joshualparris/HealthLens) expressly identifies the other two as companion health projects. Source pages may invite the user to enter private measurements. **The guide does not publish measurements, personal health histories, medical documents, authentication details or data-provider tokens.**

### Health, habits and general life dashboards

| Project | Public deployed URL | Observed title |
|---|---|---|
| JoshHub health (main) | https://josh-hub-two.vercel.app/health | JoshHub |
| JoshHub health (Render backup) | https://joshhub-backup.onrender.com/health | JoshHub |
| JoshHub health (earlier edition) | https://josh-hub-96no.vercel.app/health | JoshHub |
| LifeHub Dashboard (updated) | https://lifehubdashboard-fixed.vercel.app/ | LifeHub Dashboard |
| LifeHub Dashboard (original) | https://lifehubdashboard-one.vercel.app/ | LifeHub Dashboard |
| Josh personal dashboard | https://josh-dashboard-black.vercel.app/app/dashboard.html | Josh — Personal Intelligence Dashboard |

The two LifeHub deployments are two independently deployed projects, not automatically synchronised datasets. JoshHub's backup is separate from Vercel and may have a cold-start delay.

### Emotional and relationship wellbeing

| Project | Public deployed URL | Observed title |
|---|---|---|
| HugCoach | https://hug-coach.vercel.app/ | HugCoach |
| JoshCoach deployment (currently HugCoach app) | https://joshcoach.vercel.app/ | HugCoach |
| Ignite Us (newer app) | https://ignite-us-app.vercel.app/ | Ignite Us |
| Ignite Us (earlier edition) | https://ignite-us-sage.vercel.app/ | Ignite Us |

These are wellbeing-adjacent relationship projects; they are **not** proven health or lifespan interventions. Similar names or identical HTML titles do not imply shared storage or accounts.

## Previously listed, but not functioning as public links

| Formerly listed URL | 17 October 2026 result | Evidence |
|---|---|---|
| https://joshualparris.github.io/HealthiestPeople/ | **HTTP 404** | HealthiestPeople README calls this a live research site, but public HTTP failed; do not claim it is currently deployed |
| https://joshualparris.github.io/Sleepy/ | **HTTP 404** | Sleepy repository home-page link exists; current public deployment did not |
| https://joshualparris.github.io/FaithHub/ | **HTTP 404** | Earlier bookmark exists; currently unavailable |

These are in a labelled **Previously published, currently unavailable** disclosure in the guide, so their former addresses are recoverable without misleading readers.

## Other candidate projects checked and excluded

- `https://clearcore.vercel.app/`: HTTP 200, but no informative page title or independently supported health-specific purpose; not identified as a health/longevity website.
- Replit **Health Data Manager**, **Dinner Decider**, **Drunk Josh Guardian** and **Hub Improvement**: projects exist in the linked Replit account, but their publish status is `found=false`; a Replit development URL is **not** a public deployment.
- WordPress sites accessible in the linked account did not belong to a public health/longevity app catalogue.
- Other projects/aliases may exist in unconnected accounts, archived/renamed properties or external custom domains. We do not claim omniscience about inaccessible providers.
- HealthiestFood's own [Render](https://healthiest-food-backup.onrender.com/), [GitHub Pages](https://joshualparris.github.io/HealthiestFood/) and [Vercel](https://healthiest-food.vercel.app/) addresses are intentionally **not** counted as *other* websites.

## Maintenance and privacy

- Distinguish a working public HTTP response from Vercel's `READY` deployment flag; one alone does not prove public availability.
- Update this inventory and `related-health-sites.js` when a project URL changes. Links are reviewed URLs, not dynamically fetched advertisements.
- The Longevity Guide remains evidence-aware: owning a health app is not evidence that an intervention increases lifespan.
- Do not expose personally identifying medical history or copied health data on this public guide.
