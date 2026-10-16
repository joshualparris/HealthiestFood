# HealthiestFood 231-item backlog: further implementation pass

**Date:** 17 October 2026 (Australia/Sydney)
**Original acceptance baseline:** [231-row repository acceptance audit](REPOSITORY_ACCEPTANCE_AUDIT_2026-10-17.md) and [original criteria](IMPROVEMENT_BACKLOG_2026-10-17.csv).

## Important status boundary

The original 231-row audit is a dated snapshot, **not an automatically updated percentage or complete task list**. It initially recorded **15 implemented-and-tested, 140 partial, 71 not-demonstrated and 5 requiring physical observation**. Many source files have changed since that snapshot. **The entire 231-item specification has NOT been implemented or certified**. Do not automatically mark any item completed solely because the source contains a function with a similar name. Tests, source provenance, meaningful UI workflows and any real-world criteria must independently pass. Not every original proposal can be completed by a coding agent (e.g. physical food weighing, supermarket checkout and sensory trials).

## Substantive changes delivered in this pass

### HF-051 + portions of HF-046/047/048: cumulative food temperature history

**Code:** [food-handling-log.js](../food-handling-log.js), [food-handling-ui.js](../food-handling-ui.js), [guided cooking](../app.js), [FoodSafety](../food-safety.js), [model tests](../tests/food-handling-log.test.cjs).

- Separate manual handling log per identifiable recipe batch, local-only; supports starts, stops, and adding previously unrecorded minutes.
- Time between 5°C and 60°C **adds across multiple exposures**, including time before chilling. Closing/reopening the cooking overlay preserves the recorded batch and exposure history; a different batch requires explicit confirmation.
- **No recorded history is UNKNOWN, not zero**. Bad, reversed, overlapping or otherwise inconsistent intervals are rejected.
- Recorded total below 2 hours is advice only; between 2–4 hours warns **do not refrigerate for later**, while ≥4 hours tells the user to **discard**. A finished-batch safety-confirmation click is blocked at the 2+ hour threshold for storing the batch.
- Distinguishes the cumulative 2/4-hour rule for ready-to-eat temperature-controlled foods from **separate probe-measured rapid cooling of freshly cooked foods**. FSANZ business guidance: 60→21°C within two hours, 21→5°C within the next four hours. The UI explicitly states a clock cannot measure actual temperature, pathogen growth, fridge capacity, or the safety of a cooked product.
- Changed the poultry centre-temperature guidance in the cooking checklist to **at least 75°C** per FSANZ processing guidance (rather than the previous 74°C).
- Regression tests cover thresholds, cumulative exposures, history and local persistence, unknown records, invalid changes, the safety block, and source-related UI wiring.

**Sources:** [NSW Food Authority leftovers and cumulative 2/4-hour guidance](https://www.foodauthority.nsw.gov.au/consumer/food-extra-care/leftovers), [FSANZ 2-hour/4-hour explanation](https://www.foodstandards.gov.au/business/food-safety/2-hour-4-hour-rule), [FSANZ rapid cooling](https://www.foodstandards.gov.au/business/food-safety/cooling-and-reheating-food), [FSANZ processing (75°C)](https://www.foodstandards.gov.au/business/food-safety/processing-food-safely).

**Not verified:** real temperature readings, actual start/stop accuracy in a kitchen, shallow-tray cooling measured in real containers, food-completion photography, fridge temperature/reheat probe measurements. Recorded manual time is **not** a certificate of food safety.

### HF-080/081/083/084/085/086 (partial scope): dated individual pantry stock and dinner shortlist

**Code:** [pantry-lots.js](../pantry-lots.js), [Shopping page](../index.html), [custom-shopping.js](../custom-shopping.js), [model tests](../tests/pantry-lots.test.cjs).

- Records individual **opened/unopened packs**, amounts and units, storage location, use-by and best-before dates, and optionally typed **unverified** barcodes.
- Consumption/addition events change **only the specified lot**, and the immediately previous change can be undone.
- Computes pantry totals from the lot records, excludes **past-use-by** stock from usable-count estimates, and shows explicit warnings. An unverified date/location cannot certify safe food.
- Shows existing dinner recipes sorted by **fewest recorded purchase lines still missing**, based on the same ingredient/shopping mapping used by the planner. Missing or unpriced ingredients are labelled, and no health ranking is implied.
- Highlights packs with the nearest recorded use-by dates **for inspection**, not as automatic permission to eat.
- **Never silently overwrites** the existing pantry: copying the counted lot totals into the site's shared shopping quantities requires an explicit confirmation, and a same-document refresh of the custom shopping panel.
- Data remains local to each website origin, and can be included in the user's explicit site-data backup export. New JS assets included in the PWA caching manifest.

**Not yet complete:** automatic cooking-to-pantry deduction, physical barcode camera scans or database verification, trustworthy receipt reconciliation, actual freezer container weights/cooling verification, automatic recognition of each brand/product's safe-life after opening, guaranteed checkout/stock totals, and seamless synchronization between distinct website origins. These remain open acceptance criteria.

### HF-139 (partial scope): repeatable accessibility audit evidence

**Files:** [multi-state axe audit](../e2e/a11y-audit.cjs), [GitHub Actions workflow](../.github/workflows/accessibility-audit.yml).

- Automated axe-core scans cover 10 states: mobile home/recipes/planner/shopping/science/podcasts/longevity/cooking lab plus desktop home and shopping.
- Uploads machine-readable evidence as a GitHub Actions artifact. Results identify violations and source nodes, rather than claiming a green unit-test run establishes WCAG.
- The **initial scan found 19 serious/critical rule occurrences across ten states** and no JS runtime errors; rule occurrences can repeat across views and are not 19 independent bugs. Follow-up node-level investigation and fixes are required.
- Axe coverage does **not** replace manual keyboard-only/screen-reader/touch-target, 200/400% zoom, OS colour/contrast checks, and hardware-device verification.

## Concrete remaining categories from the original 231

1. **Priority P0 nutrition and safety:** verified exact gross/drained/raw/cooked unit conversions; photographed exact product labels and stock; cooked-yield observations; full ingredient-specific AFCD3 mapping with cooked retention and honest unknowns; verified high-risk food cooling; safety tests on a real kitchen setup.
2. **Shopping and meal plan correctness:** per-product measured pack weights, live store-local Dubbo checkout availability, substitutions that recheck costs, allergens and nutrients, receipt/expiry scans, connected rather than duplicate pantry and freezer records.
3. **Cooking and QA:** device screen-off/lock-screen tests, multi-timer behaviour on actual Android hardware, physical meal texture/taste/portion tests, on-device accessibility, 200/400% zoom, axe issues, formal regression in different browsers.
4. **Research/editorial:** per-health-claim evidence audits beyond current source map, nutritional-model comparisons against labels/AFCD, and documented uncertainty for every "healthiest" recommendation.
5. **Engineering and backup confidence:** deployed commit comparisons across Render, GitHub Pages and Vercel; backup/export roundtrips with real data; regression tests of state and edge cases, error feedback and accessible controls.

The remaining physical-verification rows cannot be truthfully closed from source code, web searches, or automated simulations.

## Acceptance standard for future passes

For every backlog ID, record: source revision and paths, exact acceptance text, evidence of working behaviour, test ID/run and host SHA (where relevant), remaining unverified assumptions, and either **verified**, **partial**, **not demonstrated** or **physical evidence required**. Never infer universal completion from passing CI or from adding a documentation heading.

**Live sites:** [GitHub Pages](https://joshualparris.github.io/HealthiestFood/) · [Render backup](https://healthiest-food-backup.onrender.com/) · [Vercel (may lag)](https://healthiest-food.vercel.app/). Each is a different storage origin; local pantry/timer data do not automatically transfer. For up-to-date completion claims, check the specific deployment's version and current successful CI run first.
