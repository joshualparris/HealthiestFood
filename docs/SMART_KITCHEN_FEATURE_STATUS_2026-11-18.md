# Smart Kitchen implementation and remaining verification — 18 November 2026

**Repository:** HealthiestFood (public). **Release:** PR #7 merged to main; initial feature code is in smart-kitchen.html, smart-kitchen.js and smart-kitchen-core.js. The existing 17 canonical recipes and dated pantry continue to be authoritative; no protected user data is committed here.

## Feature checklist against the 17 requested comparisons

Status means *source and tests*, not a claim a particular phone, receipt, account, live store or appliance was used.

| # | Comparison feature | Current code status | Remaining acceptance gate |
|---|---|---|---|
| 1 | Photo grocery recognition | IMPLEMENTED, device-dependent: optional on-device Tesseract.js 5.1.1 OCR and keyword candidates | Try actual photographed Woolworths receipts/packages and compare every line; no automatic inventory changes |
| 2 | Camera barcode scan | IMPLEMENTED on browsers offering BarcodeDetector; manual 8–14-digit fallback, optional Open Food Facts API read | Test on Android device; validate physical product label and unit before storing |
| 3 | True cross-device sync | PARTIAL: explicit browser backup download and Web Share file | Needs new dedicated authenticated backend, server configuration, owner-scoped access/RLS, conflict resolution, multi-device tests |
| 4 | Recipe URL/photo import | PARTIAL: structured Recipe JSON-LD and user-pasted plain/HTML, best-effort direct HTTPS import (CORS may block); photo OCR can create editable text | Image recipe parsing needs separate reviewed instructions/servings editor and more accessibility tests; CORS-safe provider integration |
| 5 | Automatic meal-plan generation | IMPLEMENTED basic: one-click 7-day 17-recipe rotation, review-before-overwrite existing planner | Dietary constraints and optimisation goals require more settings, review and real purchased labels |
| 6 | Hands-free cooking | IMPLEMENTED opt-in SpeechRecognition, read-aloud SpeechSynthesis, independent timers and one-step navigation | Physical Android Chrome/Samsung Internet support varies; speech services can be remote; permission and lock-screen test required |
| 7 | Expiry use-first | PARTIAL: dated pantry flags due/past-use-by packs and suggests meals requiring fewer other ingredients | Rank recipes by due-to-use-by pack usage, exclude any past-use-by food from consumption suggestions, avoid assuming dates prove safety |
| 8 | Automatic substitutions | PARTIAL: validated named swaps and equivalent edible grams with a warning | Propagate swap to canonical grocery list, cooking method and recalculated nutrients with checked alternate label |
| 9 | Budget optimisation | PARTIAL: true shopping-reconciliation subtotal on known mapped packs and unknown-cost warning; optional aisle-order display | Re-optimise plan choices under a budget, local exact pack prices and complete stock pricing; cannot claim guaranteed checkout total |
| 10 | Full micronutrient targets | PARTIAL: existing AFCD3 model and evidence links only | Validate edible yields, iodine/calcium/vitamin D and all gaps with actual labels/cooking assumptions; never invent precision |
| 11 | Reusable menus | IMPLEMENTED local presets with approved replacement of custom shopping selections | Cross-device personal/family access and backup restore UX |
| 12 | Calendar / household sharing | PARTIAL: downloadable Australian/Sydney timezone .ics and private file share | Authenticated family collaboration, invitation roles and calendar provider sync |
| 13 | Store-specific aisle order | PARTIAL: manual categories/produce-first/chilled-first ordering of suggestion list | Store-specific actual numbered Woolworths Dubbo aisles require a user-supplied observed mapping or official store feed |
| 14 | Keep screen awake | IMPLEMENTED opt-in Screen Wake Lock API when supported | Physical device display/sleep tests |
| 15 | Minimise food waste | PARTIAL: record real frozen portions, consumption decrement, expiry flags and missing-ingredient meal rankings | Optimise shared pack sizes and prioritize due-to-expire foods across all seven days |
| 16 | Import social video recipes | PARTIAL: copy/paste video caption or transcript and source URL, edited before save | Direct social video content/transcripts require authorised provider API and correct rights, not invented URL access |
| 17 | Smart appliance control | NOT CONNECTED: intentionally no remote oven control | Requires compatible real device, vendor account/API, explicit safety consent and a verified safe control sequence |

## Security and truthfulness

- OCR is initiated **only on user action**; Tesseract.js is downloaded on demand from pinned CDN. Photos are intended to be processed in-browser but this requires physical/device verification. The site must not silently upload image contents.
- Camera barcode detection requests explicit browser camera permission and stops the stream on leaving the page. Only a click on 'Look up' sends a barcode to the Open Food Facts public API; community labels may be outdated. [API reference](https://openfoodfacts.github.io/documentation/docs/Product-Opener/v2/products/get-product-by-code/).
- Adding a recognised pantry item requires the user to confirm an exact amount in the mapping's **actual unit**. Never treat a number of salmon tins as grams or infer a usable weight from a photo.
- Opening a preset requires confirmation before replacing the shopping selections; saving a generated meal plan requires confirmation if any days already exist.
- No medical or clinical outcome is guaranteed. Dated pantry labels and timers are reminders, not proof of refrigeration, ingredient condition or finished food temperature.
- No automatic household sync or appliance management is claimed; keep those disabled until authenticated and tested.
- Cross-origin sites (Vercel/Render/GitHub Pages) have separate localStorage. A Web Share backup is a transfer, **not synchronisation**.
- No secret credentials, uploaded receipt images or household information are included in this public feature code.

## Relevant existing code reused

- Ingredient identities: ingredient-catalogue.js
- Shopping reconciliation and known-price caveats: food-shopping.js
- Dated pantry inventory, use-by awareness and reversible consumption: pantry-lots.js
- Full 17 recipes: site-data.js then whole-day-data.js
- Real-clock timers: timers.js
- Browser backup format: local-backup.js
- Ten-lunch detailed sequence: ten-lunch-planner.js

## Test coverage

- Unit: tests/smart-kitchen.test.cjs; node --test tests/*.test.cjs (original and new tests).
- Browser: e2e/smart-kitchen.cjs checks 390/1280 px, recipe parsing, 7-day plan, local state persistence, timers, frozen portions and same-origin frame navigation.
- Production: backup-live-check.yml independently exercises the GitHub Pages Smart Kitchen route and returns a failure if it is broken.
- Not tested remotely: actual camera, photographic OCR quality, device microphone, notification availability, external Open Food Facts lookup from a physical handset, real freezer temperature or a real Woolworths receipt.
- Avoid claims of *all 17 features complete*. Most are useful now, but cloud collaboration, full optimisation, complete micronutrient analysis, direct video imports and appliances require later releases.

## Next engineering order

1. Complete ingredient substitutions integrated into actual recipe quantity reconciliation and recipe method check; keep original nutrition provenance.
2. Add pantry-lot expiry match scores to recipe selection; exclude past-use-by from suggested usable stock.
3. Improve budget minimisation with full pack waste calculations and observed Woolworths prices, still labelled estimates.
4. Integrate imported recipes into canonical shopping/cooking with schema validation and unit parsing.
5. Add user-controlled encrypted or authenticated multi-device sync with explicit account/role choice and RLS, if a dedicated safe backend becomes available.
6. Build optional household sharing with separate private role controls and events, never use public repo to store real pantry or meal history.
7. Add direct social imports only where provider APIs and terms permit, then real-device integration tests.
8. Leave appliance actions disabled until specific compatible hardware and safety testing are provided.

**Do not confuse merge/deployment status with feature acceptance on the user's actual devices.**
