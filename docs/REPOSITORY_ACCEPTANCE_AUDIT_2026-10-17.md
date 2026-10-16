# HealthiestFood — 231-item repository acceptance audit
**Review date:** 17 October 2026 (Australia/Sydney)  
**Baseline inspected:** `a62a78797f383d57d72d7500e547e25c398fc29b`  
**Scope:** current application JavaScript, static pages, recipe/method and nutrition data, tests and workflows, contemporary food-research reports and deployment evidence.  
**Source-of-truth row-level evidence:** [REPOSITORY_ACCEPTANCE_AUDIT_2026-10-17.csv](REPOSITORY_ACCEPTANCE_AUDIT_2026-10-17.csv)  
**Updated ordinary tracker:** [IMPLEMENTATION_TRACKER_2026-10-17.csv](IMPLEMENTATION_TRACKER_2026-10-17.csv)  
**Acceptance text:** [IMPROVEMENT_BACKLOG_2026-10-17.csv](IMPROVEMENT_BACKLOG_2026-10-17.csv)

## Result (not a completion percentage)

| Assessment | Count | Interpretation |
|---|---:|---|
| Implemented in code with test or deployment-workflow evidence | **15** | Observable behaviour has repo-level automated evidence. Some require ongoing production or device verification |
| Partially implemented | **140** | Existing related code or documentary evidence. **At least one acceptance criterion is not independently established** |
| Not demonstrated in the inspected repository | **71** | **No sufficient implementation-and-verification evidence found in this pass.** Not necessarily absent; may require a targeted review |
| Requires physical verification | **5** | A kitchen/photo/measurement trial is necessary. Software or an LLM cannot supply that observation |
| **Total** | **231** | Every numbered backlog item has an explicit row, status, original acceptance criteria, evidence/gap and baseline revision |

**P0 critical (23):** 9 code/test evidenced; 13 partial; 0 not demonstrated; 1 real-kitchen trial (HF-032). There are 151 P1, 56 P2 and 1 P3, consistent with the original 231-item backlog. **Do not state "15/231 = 6% complete" as the site's overall feature completion: the statuses are evidence grades, and the 140 partial items may have substantial functionality.**

### Audit method and limitations

1. Enumerated the full `main` Git tree; reviewed cooking, meal scheduling, ingredient matching, nutrient, shopping, food safety, offline and backup modules, accompanying test cases, workflows and the 231 original written acceptance criteria.
2. Assigned explicit verified or partial evidence paths to relevant items. The row-level CSV contains the **unchanged original acceptance test** for every item. For items marked *not demonstrated*, the original acceptance remains open; there is no claim that all imaginable alternate implementations were excluded.
3. Used *implemented_code_tested* only for acceptance substantially evidenced by visible code and relevant automated tests/workflows. It does not imply accessibility certification, food laboratory testing, price availability or a live production SHA unless those are actually verified.
4. A feature implemented only in documentation, or a test proving HTML exists, is not automatically a fully delivered feature. *Partial* means there are real related changes, **not** that their acceptance criteria passed.
5. Known incomplete evidence includes pack photography and actual drained food mass, exact selected-store Dubbo checkout/stock, measured cooked/freezer yields, real Android lock-screen background alarms and formal 200%/400% zoom/screen-reader/axe accessibility audits.
6. Multiple agents/workflows may be writing to `main` concurrently. The baseline SHA is recorded so readers can tell which snapshot informed the audit; subsequent changes require targeted re-audit. A successful GitHub unit test does **not** establish that each public host runs the same commit.

## P0 acceptance triage

| Item | Assessment | Findings and next verification |
|---|---|---|
| HF-001, HF-061 canned beans | Partial, code consistency improved after snapshot | Black-bean **225 g** comes from labelled 3 × 75 g; contradictory 60% of gross tin suggests **252 g**. Shared product source now drives planner conversion. **Weigh real rinsed/drained tins and photograph NIP to resolve physical yield** |
| HF-002 full AFCD coverage | Partial | Official Release 3 food IDs and 17-recipe pre-cooking ingredient model exist; incomplete source matches, raw-vs-cooked assumptions and missing branded micronutrients must remain unknown |
| HF-003 canonical IDs | Code tested for current 17 recipes | **151 ingredient entries → 99 exact label/unit variants → 62 stable IDs**. Historical arrays and saved plans preserved; SKU-aware shopping, pantry migration compatibility, AFCD matching and family-level allergen flags are connected. [Implementation and boundaries](HF003_CANONICAL_INGREDIENT_MIGRATION_2026-10-17.md) |
| HF-004 physical mass states | Partial | Nutrition distinguishes some dry/raw/drained inputs but lacks universal structured gross/drained/cooked basis validation |
| HF-005 brand provenance | Partial | Branded label ledger and generic AFCD rows are different, but product substitutions cannot reliably recalculate all components |
| HF-017 longitudinal scores | Code tested | Historical subjective numerical ratings are demoted, not presented as scientifically validated life-extension |
| HF-031, HF-103 structured cooking steps | Code tested | `recipe-methods.js` provides exact step-level ingredient allocation for all 17 meals; `tests/recipe-methods.test.cjs` checks conservation/scaling |
| HF-032 real five-portion yield | Requires physical evidence | No model can verify actual cooked output weight, appliance capacity, cooling or freezer texture. Use the private cook-trial form and actual kitchen scale |
| HF-046 first-class safety prompts | Partial | Safety acknowledgements gate cooking completion; no actual food centre temperature or cold chain automatically measured |
| HF-047 rice/pasta rules | Partial | Rule reminders exist in `food-safety.js`; verify every rice/pasta recipe, reheat operation and freezer record |
| HF-048 cooling capacity | Partial, improved after snapshot | New pre-cooking warning for **5+ hot portions**, scaled acknowledgement in `food-safety.js` and guided cooking, source-linked to NSW. Still must check real shallow-container/refrigeration throughput |
| HF-060 V6 versus dynamic shopping | Code tested | $256.43 is labelled an **archived historical 20-lunch basket**; custom shopping chooses among all 17 recipes |
| HF-062 canonical retail mapping | Partial | `food-shopping.js` still relies on ingredient-name regexes; arbitrary names or brand swaps may mismatch |
| HF-090 three core meals | Code tested | Plans default to three flexible main meals and allow optional snacks while preserving older saved schedules |
| HF-117 timer end not proof of cooked food | Code tested | Timer expiry advisory and doneness wording are displayed, no guaranteed locked-phone notification |
| HF-139 WCAG 2.2 AA | Partial | Responsive local Playwright testing exists, but a full formal route/state/zoom/screen-reader and axe sweep has **not** passed |
| HF-166 AFCD probe reference | Code tested | `.github/workflows/afcd3-probe.yml` names an existing `scripts/afcd3_explore.py`, with additional AFCD generation workflows |
| HF-180 test Render backup | Code tested | Real-browser functional tests check the live Render and GitHub Pages backups separately from an advisory Vercel check |
| HF-181 prevent false CI = deployed | Partial | Tests check functional live pages but no single release manifest confirms exact SHA parity for *every* host |
| HF-196 host build version | Partial | Provider deploy SHA is accessible from Render/Vercel; there is no consistently verified in-app SHA from each public host |
| HF-208 grade every health claim | Partial | Research reviews and media claim caveats exist, but per-claim evidence grading is not universal |

## Post-audit HF-003 implementation (added 17 October 2026)

The canonical registry now maps all 17 meals, 151 ingredient uses, 99 exact source labels/units and 62 stable identities. It powers the per-recipe ID projection, AFCD crosswalk, SKU-aware shopping, additive legacy pantry reads and ingredient-family allergy flags. The historical tuple records remain unchanged. [Full migration and test evidence](HF003_CANONICAL_INGREDIENT_MIGRATION_2026-10-17.md). **HF-004 state-aware edible yield and HF-005/HF-062 verified substitutions remain partial.**

## Actual implementation pushed in this audit pass

**1. HF-001/HF-061 code reconciliation.** Previously the shopping mapping maintained bean per-tin yield values independently of the nutrition label ledger. `food-shopping.js` now derives both chickpea and black-bean edible yield from the matching `nutrient-ledger.js` product IDs. `tests/custom-shopping.test.cjs` verifies a tin maps to precisely the same declared edible grams for pricing and nutrient calculations. **This fixes internal drift, not the outstanding contradiction between the label serving count and kitchen-weighed actual mass.**

**2. HF-048 cooling-capacity preflight.** `food-safety.js` now distinguishes a small batch from **five or more hot portions**, requires an explicit extra acknowledgement for the latter, and provides a pre-cook shallow-container/fridge space warning in `app.js`. The warning recommends separate cook sessions if capacity is insufficient and links NSW safety information. `tests/food-safety.test.cjs` covers scaled 1 vs 5/7 portion scenarios and cold snack exclusion. The self-check is not a measured guarantee.

**3. Auditable backlog.** The [complete acceptance CSV](REPOSITORY_ACCEPTANCE_AUDIT_2026-10-17.csv) and [updated tracker](IMPLEMENTATION_TRACKER_2026-10-17.csv) replace a misleading large pile of `not independently assessed` placeholders with explicit source-backed, partial, not-demonstrated and physical-evidence assessments. Original criteria and IDs are preserved.

## Highest-priority remaining implementation sequence

1. **HF-004/HF-005/HF-062:** extend the **now-implemented HF-003 canonical identity layer** with validated gross/drained/raw/cooked unit conversions and verified retailer product substitutions; preserve older plans.
2. **HF-139:** real WCAG 2.2 AA audit with axe, focus order, landmark names, 320px and 400% zoom, plus manual mobile screen reader and larger text.
3. **HF-181/HF-196:** generate per-host release metadata and verify *actual deployed assets* and SHA parity, not only green CI or a provider deployment status.
4. **HF-002/HF-208:** finish AFCD crosswalk, retain source-specific unknowns, establish critical claim grades for every published assertion; avoid fabricated micronutrient totals.
5. **External verification:** kitchen weighing and cooling for HF-032 and beans; label and live checkout checks at Dubbo Woolworths; Android background alarm behaviour. These **cannot** honestly be marked complete using a web or GitHub connector alone.

## Release checkpoints

- [GitHub unit-test workflow](https://github.com/joshualparris/HealthiestFood/actions/workflows/site-tests.yml)
- [Mobile cross-browser and Render smoke tests](https://github.com/joshualparris/HealthiestFood/actions/workflows/browser-smoke.yml)
- [Live Render and GitHub Pages verification](https://github.com/joshualparris/HealthiestFood/actions/workflows/backup-live-check.yml)
- [Static GitHub Pages deployment](https://github.com/joshualparris/HealthiestFood/actions/workflows/github-pages-backup.yml)

**Deployment URLs:** [Render backup](https://healthiest-food-backup.onrender.com/) · [GitHub Pages](https://joshualparris.github.io/HealthiestFood/) · [Vercel](https://healthiest-food.vercel.app/). Different origins hold different localStorage; automatic data synchronisation is **not** implemented. Vercel can lag when its deployment limit is reached.

**Re-audit trigger:** update status only after code and tests visibly support the actual acceptance, plus deployment checks and external evidence if the criterion requires it. The audit is intentionally conservative and does not assert 231/231 delivery.
