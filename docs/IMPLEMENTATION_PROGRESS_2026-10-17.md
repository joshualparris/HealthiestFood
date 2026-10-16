# Implementation progress against the 231-item HealthiestFood backlog

> **Superseded tracker notice (17 Oct 2026):** This document records an **earlier implementation pass**. Its statement that 220 items remain 'not independently assessed' is historical. The newer [all-231 acceptance audit](REPOSITORY_ACCEPTANCE_AUDIT_2026-10-17.md), [row-by-row source evidence CSV](REPOSITORY_ACCEPTANCE_AUDIT_2026-10-17.csv), and [updated implementation tracker](IMPLEMENTATION_TRACKER_2026-10-17.csv) are authoritative for current assessments. The updated audit classifies 15 code/test evidenced, 140 partial, 71 not demonstrated, and 5 requiring real-world evidence. This is NOT a percentage of 231 features completed.

**Pass:** 16–17 October 2026 · **Current status:** ongoing, **NOT 231/231 complete**.

[Full improvement backlog](IMPROVEMENT_BACKLOG_2026-10-17.md) · [231-line implementation tracker](IMPLEMENTATION_TRACKER_2026-10-17.csv) · [Existing nutrition and evidence audit](../WHOLE_SITE_EVIDENCE_REVIEW_2026-10-17.md).

## What this implementation pass delivered

1. **HF-046 — safer cooking completion (partial).** Added `food-safety.js` with NSW Food Authority source links and recipe-specific checks for chicken, salmon, rice, chilled foods and storage. The final cooking completion button stays disabled until the person actively acknowledges the relevant reminders. These are **self-reported, not measured food-safety certificates**. Real temperature, cooling-time and vulnerable-person rules require further attention. [Food safety source](https://www.foodauthority.nsw.gov.au/consumer/food-extra-care/leftovers).
2. **HF-090 — three main meals as new-plan default (implemented in code).** Breakfast/lunch/dinner remain adjustable; snacks must be consciously added, and older date-specific saved plans continue unchanged. Updated both default-plan and official AFCD weekly nutrient regression fixtures. This deliberately avoids treating five eating occasions as medically superior.
3. **HF-089 / HF-153 / HF-162 — manual private data portability (partial).** `local-backup.js` exports a private JSON file containing only `good-food-` local browser keys (plans, pantry, timers, cooking records), with schema identifier, date, source origin and validation. Import warns before replacing on-device records and does not touch unrelated browser storage. A device-browser check and complete field-level migrations are still required. Data **do not automatically sync** between Vercel, Render and GitHub Pages.
4. **HF-154 / HF-186 — optional offline cooking (partial).** Added network-first caching service worker, home-screen manifest, and an explicit offline warning that cached prices, labels and safety advice may be stale. First online visit is required; installability varies by platform (SVG icon only). Static tests check every main-app script is listed for offline caching; full offline/loss-of-connection browser tests remain outstanding.
5. **Regression testing.** Added `tests/food-safety.test.cjs`, `tests/local-backup.test.cjs`, `tests/offline-cooking.test.cjs`, and updated existing meal-count fixtures and GitHub workflow change triggers. [Passing 58-test suite](https://github.com/joshualparris/HealthiestFood/actions/runs/38974562373), before subsequent documentation-only commits. Previous 5-meal fixture failures were fixed and rerun, not ignored.

### Work implemented in parallel by other ongoing repository changes

- **HF-001:** black-bean canned serving-yield assumptions were adjusted toward the listed **3 × 75 g = 225 g** nutrition panel servings, but actual weighed drained mass is still unverified; 60% ingredients by weight is not an automatic exact drained yield.
- **HF-002:** official AFCD generic model coverage has expanded to the 17 recipes, but ingredient proxies, cooking losses, product-label gaps and confidence need further review. Do not present estimated raw-ingredient model as exact cooked nutritional adequacy.
- **HF-166:** AFCD exploratory scripts are now committed; retain workflow verification as a release gate.
- **HF-197:** Render auto-deploy backup exists at [healthiest-food-backup.onrender.com](https://healthiest-food-backup.onrender.com). GitHub Pages and Vercel should be independently tested and their commit SHAs checked rather than assumed synchronous.

## What remains incomplete

**231 candidates are not 231 delivered features.** The companion CSV tracks the 11 entries actively assessed in this pass and marks other items **not independently assessed** rather than guessing whether parallel work has already solved them. In particular, the following cannot be certified by code alone:

- Exact live Woolworths Dubbo selected-store prices and stock, all SKU allergens and actual labelled brands.
- Physical kitchen trials for 17 recipes (time, flavour, edible cooked yield, temperature, cooling and freezer quality).
- Full, reliable food-composition/cooked-yield reconciliation and individual daily nutrient adequacy.
- Unattended Android phone-lock audible alarms, formal screen-reader testing and real offline mobile behaviour.
- Medical claims, clinical dietitian sign-off or a scientifically validated perfect longevity meal.

## Criteria before marking a remaining item done

A complete item needs a reproducible issue description, files changed, regression test where appropriate, GitHub SHA, actual live host SHA/URL (not merely CI passing) and, for product/food questions, dated store/label or physical kitchen evidence.

**Do not automatically trigger dozens of changes at once** from this list. Implement each dependent set carefully, preserve data and previous recipes, and keep source/modelled/observed evidence separate.
