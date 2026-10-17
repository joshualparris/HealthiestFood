# HealthiestFood

## Further implementation of the 231-item backlog (17 October 2026)

**[Open the new evidence-based implementation report](docs/IMPLEMENTATION_PASS_2026-10-17.md)** · [Full 231-item acceptance audit](docs/REPOSITORY_ACCEPTANCE_AUDIT_2026-10-17.md) · [Original acceptance criteria](docs/IMPROVEMENT_BACKLOG_2026-10-17.csv).

This pass added an optional **cumulative 5–60°C food handling log** in guided cooking (with prior-time correction, same-batch persistence, 2/4-hour safety status and storage-completion blocking), an **individual dated pantry pack manager** (opened/unopened, location, use-by/best-before, reversible consumption, user-confirmed shared shopping quantities), **dinner ideas ranked by fewest missing recorded ingredients**, and a repeatable **axe-core multi-view accessibility audit with automatic evidence uploads**. Accessible labels, table keyboard scrolling and contrast have been strengthened, with targeted regressions and live browser checks. A follow-up ten-state axe scan [reported zero automatically detected violations](https://github.com/joshualparris/HealthiestFood/actions/runs/38984312769), not a full WCAG or real-device certification.

These changes address **specific portions of several acceptance rows**, not all 231. The original counts are a snapshot, not a current certified completion percentage. Photographed exact labels, weighed edible/cooked yields, real Dubbo checkout, food temperature trials, hardware/mobile behaviour and comprehensive research validation are still required.


## Listen to every ABC podcast without leaving HealthiestFood

**[Start in-app podcast playback on GitHub Pages](https://joshualparris.github.io/HealthiestFood/#media)** · [Live Render alternative](https://healthiest-food-backup.onrender.com/#media) · [Audio-player methods, limitations and Android testing](PODCAST_PLAYER_IMPLEMENTATION_2026-10-17.md).

All 16 ABC podcast episodes in the curated media collection are matched *by original title and publication year* to their media URLs published in the [official What's That Rash? RSS](https://www.abc.net.au/feeds/12017248/podcast.xml) and [Health Report separate-stories RSS](https://www.abc.net.au/feeds/2887252/podcast.xml). We **stream them directly** from ABC/Akamai; we never mirror or package copyrighted recordings. Click **▶ Play here** on the episode card or in a recipe's related listening links. The player supports pause/resume, 15-second back, 30-second forward, changing episodes, 0.75–2× speed, seek, current position saved on this device, and a compact listening bar. **Minimising the bar does not stop audio.** The app's internal sections and embedded research/tool pages share **one top-level audio element**, so moving among them does not interrupt playback. Media Session asks supported mobile browsers to offer background/lock-screen controls.

**Important limit:** Chrome/Android and other browsers/OSes ultimately control whether playback continues after switching apps or locking the screen. We cannot guarantee playback after the browser is force-closed or background-killed; this is a web PWA, not a native Android background audio service. Headless Chromium playback and in-app page continuity are tested; physical Android screen-off behaviour still needs on-device verification. The separate official ABC app is a fallback if the browser suspends it. All streams depend on ABC continuing to publish them; a non-playing episode retains its original ABC link.


## Repository acceptance audit — 231 items (17 October 2026)

**[Read the full source-and-test acceptance audit](docs/REPOSITORY_ACCEPTANCE_AUDIT_2026-10-17.md)** · [231-item auditable CSV](docs/REPOSITORY_ACCEPTANCE_AUDIT_2026-10-17.csv) · [Current tracker](docs/IMPLEMENTATION_TRACKER_2026-10-17.csv).

The audit reviewed every backlog ID against source, automated tests and evidence limits: **15 code/test evidenced, 140 partially implemented, 71 not demonstrated by the inspected evidence and 5 requiring real-world verification**. These are *not* percentages of features completed. Post-audit changes include [HF-003 canonical ingredient IDs covering all 151 recipe lines](docs/HF003_CANONICAL_INGREDIENT_MIGRATION_2026-10-17.md), improve canned bean product-yield consistency and add a pre-cook cooling-capacity acknowledgement for five-or-more hot portions. Store labels, physical kitchen safety, Android lock-screen alerts and full WCAG conformance remain unverified. Render and GitHub Pages are independently deployable backups; Vercel may lag when its quota is reached.


## New: Cooking Methods Lab (17 October 2026)

**[Open the interactive Cooking Methods Lab on GitHub Pages](https://joshualparris.github.io/HealthiestFood/cooking-methods.html)** · [Research, safety and original scientific sources](COOKING_METHODS_EVIDENCE_2026-10-17.md) · [Source data](cooking-methods-data.js) · [Coverage tests](tests/cooking-methods.test.cjs).

A full food-by-food comparison of **77 food families**, covering **all 132 distinct labels in the 17 active recipes and original 35-product V6 shopping basket**, plus 21 additional historic food categories. The interactive guide compares boiling, steaming, poaching, frying, stir-frying, roasting, baking, microwaving, air-frying, pressure cooking and raw preparation where appropriate. For each food, choose two methods side by side, view all options, see safety precautions, exact ingredient aliases and official source links. Recipe details link directly to a version filtered to that meal (`cooking-methods.html?recipe=br-eggs`); `?food=egg` jumps directly to eggs. The five evidence principles include food safety, vitamin retention, bioavailability, charring/acrylamide and realistic uncertainty. **No invented longevity scores or claims that boiling is best for everything.** The 132-label test is recomputed from the actual live recipe/shopping code, and fails if an active ingredient becomes unmapped.

Older recipe archive prose is not a machine-verified exhaustive ingredient inventory; the 21 historical groups are added explicitly, while the active 17-recipes-plus-basket coverage is complete. No actual kitchen/lab preparation trials of the 77 groups have been performed.


## Podcasts & videos backed by source science (17 October 2026)

**[Open the searchable audio/video library](https://joshualparris.github.io/HealthiestFood/#media)** · [Source-to-claim editorial evidence map](MEDIA_EVIDENCE_MAP_2026-10-17.md) · [Official video safety guidance](https://www.foodstandards.gov.au/consumer/prevention-of-foodborne-illness/food-safety-basics).

The latest website includes **16 original ABC Health Report / What's That Rash? podcast episodes plus 7 Australian video resources** (5 official Food Standards Australia New Zealand video links and 2 Australian Heart Foundation webpages containing embedded video demonstrations). Each episode card spells out **the claim it can help explain**, **what it cannot prove**, and a separate **original study or government/Heart Foundation reference**. Filters select Podcasts or Videos, topics, and free-text search; recipe details provide up to three directly relevant resources. The main science section and all seven sections of the longevity guide link back to relevant media topics. Click **Play here** on any of the 16 ABC podcasts for an in-app persistent player. It uses the ABC's official RSS audio files directly, with skip/seek/speed, compact mode, lock-screen Media Session controls where supported, and continued audio across recipes, planner, Cooking Lab and Longevity Guide. **Videos and research still open at their original publishers**; no autoplay, account, self-hosted/copyright-copied audio/video or paid affiliate placement.

**Media explain science but do not verify grocery checkout, individual branded nutrients, cooked-food laboratory values, exact lifespan benefit, personal medical advice or food-safety compliance.** For those claims the app relies on current product labels, official FSANZ and NSW Food Authority rules, and the incomplete AFCD3 labelled calculations. The evidence map explicitly flags gaps such as iodine bread fortification with no verified audio match.


## Official AFCD3 model: all 17 recipes + seven dated days (17 Oct 2026)

**[Read the 17-recipe and seven-day source-traced nutrient report](FULL_DAY_NUTRIENT_MODEL_2026-10-17.md)** · [Open the interactive website nutrition view](https://healthiest-food.vercel.app/#science) · [Open independent GitHub Pages backup](https://joshualparris.github.io/HealthiestFood/)

A GitHub Actions job downloaded **FSANZ Australian Food Composition Database Release 3**, extracted **51 precisely identified generic-food profiles**, and combined them with explicitly matched Woolworths product labels where available. The interactive science view now models **energy, protein, fibre, calcium, iron, iodine** and additional available nutrients across **17 adult recipes** and **seven actual calendar days** from the browser's local planner. Source and assumptions are in [scripts/afcd3_extract.py](scripts/afcd3_extract.py), [whole-day-analysis.js](whole-day-analysis.js), and [scripts/generate_full_day_report.cjs](scripts/generate_full_day_report.cjs). **These are incomplete pre-cooking, raw/dry/drained ingredient subtotals, not verified complete meal nutrient totals**. Undefined nutrients are marked *Unknown*, including unquantified tofu calcium, and explicit cooking losses / particular product discrepancies remain. *Do not infer deficiency from the seven-day partial iodine or calcium sums.*

**Backup:** GitHub Pages is enabled; [.github/workflows/github-pages-backup.yml](.github/workflows/github-pages-backup.yml) deploys the same static app separately from Vercel after repository changes. Both hosts should be checked after each relevant push.


## Master improvement backlog (17 October 2026)

**[231 prioritised improvements — detailed, with acceptance criteria](docs/IMPROVEMENT_BACKLOG_2026-10-17.md)** · **[CSV for issue/agent tracking](docs/IMPROVEMENT_BACKLOG_2026-10-17.csv)**. Includes nutrition/AFCD, food safety, recipe precision, Dubbo Woolworths shopping, pantry carryover, cooking and timers, accessibility, privacy, backups, deployment validation and QA. **23 P0, 151 P1, 56 P2, 1 P3.** Labels distinguish observed repo limitations, unverified physical/device questions and new feature proposals. **Backlog documentation only:** not a claim that these changes have been implemented or personally kitchen-tested.
**Implementation status (17 October 2026):** [Evidence-based progress report](docs/IMPLEMENTATION_PROGRESS_2026-10-17.md) · [231-row implementation tracker](docs/IMPLEMENTATION_TRACKER_2026-10-17.csv). First improvements include source-linked cooking safety checks, three core meals with optional snacks, private browser-data backup/import and network-first offline cooking. **These are partial milestones; 231/231 are not finished.**




## Latest evidence-led website improvements — 17 October 2026

**[Open the live cooking website](https://healthiest-food.vercel.app/)** · **[Implementation audit and scientific gaps](HEALTH_IMPROVEMENTS_AND_REMAINING_GAPS_2026-10-17.md)**

The live site now has a dated planner and **day/week shopping reconciliation** for chosen portions, with approximate pack prices only where a specific product has known pack data; unmatched products remain **unpriced**. Guided cooking scales measured ingredient quantities where unambiguous and warns when equipment, piece counts and cook times require checking. The Science page explains **verified label-only nutrient subtotals**, compares fortified soy drinks, and demotes subjective /100 ratings. There is an optional **private cook-up record** for genuine taste, yield, freezer texture and cost results.

**Important:** full AFCD3 micronutrient calculations, live Dubbo Woolworths checkout verification and physical kitchen tests remain outstanding. These are not guaranteed or silently replaced by estimates. [See detailed status](HEALTH_IMPROVEMENTS_AND_REMAINING_GAPS_2026-10-17.md).


## October 17, 2026: full-day health, safety and timing re-audit

**[Read the full evidence-linked audit, 17 recipe improvements and prioritised roadmap](WHOLE_SITE_EVIDENCE_REVIEW_2026-10-17.md).** Includes Australian vegetable, fruit, fibre, calcium, iodine, fish, sodium and nut guidance; current time-restricted-eating trials; food-safety changes for frozen berries and chilled hummus for higher-risk eaters; weekly plan fish/lunch-stock reality checks; and explicit evidence limits. Latest app: [Daily planner](https://healthiest-food.vercel.app/#plan) · [Longevity and meal-timing guide](https://healthiest-food.vercel.app/longevity.html#timing).



## NEW — Complete daily meals and real-date scheduling (17 October 2026)

**[Open the live daily planner](https://healthiest-food.vercel.app/#plan)** · [Browse every recipe](https://healthiest-food.vercel.app/#recipes) · [Drive source coverage, limitations and exact example meal times](WHOLE_DAY_MEAL_SOURCES.md)

The app now has **17 adult recipe suggestions**: **4 breakfasts, 4 V6 freezer lunches, 5 dinners and 4 snacks**. Unlike the old static four-week weekday checklist, **Plan** starts on the actual local date in **Australia/Sydney** (including Saturday 17 October 2026), displays a seven-day week, supports any calendar date, allows adding/removing/editing breakfast, lunch, dinner and snack slots with precise times, and marks meals completed. **Today**, previous/next day, date picker and **copy to tomorrow** are available.

Initial times are **07:30 breakfast, 10:00 snack, 12:30 lunch, 15:30 snack, 18:00 dinner**; these are **editable convenience defaults**, not proven longevity-optimal timings or medical fasting advice. Your plan is stored only in this browser/device; it is **not** automatically synced to Google Calendar and **does not send notifications**. The old $256.43 estimated Woolworths basket still represents **V6 lunches only**. The planner also supports **portions per slot** and copying **a selected day or entire week's ingredient quantities** (unpriced, not rounded to store packs); breakfast/dinner/snack ingredients do not silently alter the original V6 checkout estimate. Local Dubbo checkout prices remain unverified. The extra recipes are adult suggestions **adapted from historical household Drive plans**, not verified recent cook-ups; see source notes.

Automated tests: `node --test tests/*.test.cjs` including timezone/DST, recipe data, legacy timers and site checks. Other historical recipes and V2–V6 audit files remain preserved.


## 🍃 Live interactive cooking website

**[Open Good Food, Long Game → https://healthiest-food.vercel.app/](https://healthiest-food.vercel.app/)**

The public, mobile-friendly website is automatically deployed from the GitHub **main** branch to Vercel. It includes:

- Guided cooking for all four V6 five-meal recipes, cooking timers, ingredients that scale by serving count, and practical freezer-safe handling.
- Four-week (20-lunch) planner and a 35-line Woolworths shopping checklist with indicative AUD prices, checkout caveats and checkboxes stored **only on your device** (browser localStorage; no user account/analytics).
- Transparent science page with a ten-metric **subjective** rubric, expandable claim ledger, links to national/state Australian guidance and actual retailer product labels.
- [Detailed fact-check and remaining uncertainties](SITE_FACT_CHECK.md) and [automatic dependency-free verification tests](tests/site.test.cjs).

**Important:** The estimated $256.43 V6 basket is not a verified Dubbo Woolworths checkout; local stock, labels and prices can vary. These meal plans have not been kitchen-tested or independently nutrient-analysed, and none is proven "100/100" for health or longevity.

**To preview locally:** open `index.html` via a basic local web server, e.g. `python3 -m http.server 8000`, then visit `http://localhost:8000`. No npm build is required. Run `node --test tests/site.test.cjs` to check data and source structure. Vercel deploys the static site automatically on pushes to `main`.

## October 2026 whole-repository longevity audit

**[Read the ranked audit and concrete improvements](LONGEVITY_AUDIT_2026-10-16.md)** — covers the archived cook-ups and versions V2–V6, checks V6 fish/tofu/soy options, calcium, four-versus-five workday scheduling, food safety, full-diet nutrient gaps, cost provenance and script limitations. No recipe was shown to increase lifespan; this is an evidence/practicality review, not a medical or kitchen test.

## Latest — V6 (16 October 2026): Woolworths-only, four-batch freezer lunches

**V6 is a planned recipe design, not a proven or kitchen-tested longevity optimum.** Built after inspecting **[V5](v5/RECIPES.md)** and the current repository tree. Unlike V5's mixed Coles/Woolworths shop, V6 names Woolworths-listed alternatives for all main proteins.

- **[V6 recipes and full step-by-step cooking methods](v6/RECIPES.md)** — four flavours × five lunches = **20 lunches**, precise drained/raw/dry weights, fish + tofu portions, A/B/C/D four-week rotation, dairy-free and gluten-label checks, cooling/reheating requirements.
- **[V6 Woolworths Dubbo shopping list](v6/SHOPPING.md)** — 35 combined item rows, pack-size reconciliation, estimated **$256.43 full first shop** including optional 5 L fortified soy and pantry ingredients. **These are not verified Dubbo shelf prices or stock**; cheaper when using available pantry items.
- **[V6 scientific evidence, nutrient-label maths and ten-metric audit](v6/EVIDENCE.md)** — anchored to Heart Foundation, dietary guidelines, NSW Food Authority and product labels; refuses fake 100/100 longevity claims.
- **[V6 shopping/recipe arithmetic validation script](v6/verify.py)** — check recipe totals and forecast basket.

**V6 improvements** focus on Woolworths-only practical shopping, repeatability, actual protein sources, calcium set vs quantified calcium, label accuracy and safe four-batch preparation—not more “superfood” additions. Earlier versions are preserved as historical research. No V6 meal is confirmed cooked; ingredients/price calculations are planning estimates until checked in kitchen and the Woolworths Dubbo app.

A source-linked, dairy-free collection of home-cooked and historically planned freezer meals, compiled from recipe documents and cook-up records through **16 October 2026**.

**Important:** “healthiest” means a practical food-pattern comparison, **not** a claim that any one recipe maximises lifespan. The historical scores below are subjective, unvalidated 10-category assessments from an earlier recipe audit; scores are not medical evidence, and a meal that scores higher is not necessarily better for everyone.

## V4 — 20-lunch recipe revision (16 October 2026)

**[V4: exact 20-lunch recipes and four-week menu](V4_RECIPES_2026-10-16.md)** — two cook days, 10 lunches each; 4 sardine, 4 salmon and 12 high-protein-tofu/legume lunches in total. Uses drained fish weights, labelled calcium-rich tofu and practical freezer handling.

**[V4: Dubbo Woolworths + Coles shopping list](V4_SHOPPING_DUBBO_2026-10-16.md)** — **37 product lines** with quantities, price provenance and an estimated **$224.52** first shopping basket including 5 L optional fortified soy milk (**$209.52** without). Actual Dubbo store stock/prices were **not** independently checkout-verified. [Editable CSV for price checking](V4_SHOPPING_DUBBO_2026-10-16.csv).

**[V4: evidence and V3 comparison](V4_EVIDENCE_AUDIT_2026-10-16.md)** — fish/label arithmetic, objective changes and subjective 10-metric rubric. V4 proposed score **94/100 (A)** and **91/100 (B)** in the non-validated editorial rubric; **these are not longevity predictions**.

**Status:** V4 is a new **proposed, not yet cooked** variation, and cannot be claimed scientifically superior for every person. All original historical recipes and V3 documents remain untouched.

---

## Start here

- **[V5: four five-portion recipes](v5/RECIPES.md)** — twenty varied adult lunches, exact ingredients and methods, with salmon cost/energy trade-offs.
- **[V5: Dubbo shopping and prices](v5/SHOPPING.md)** — estimated $229.40 core full-pack basket, or $193.40 using canned salmon; local stock/checkout unverified.
- **[V5: evidence and nutrition estimates](v5/EVIDENCE.md)** — transparent assumptions and [reproducible calculation](v5/calculate.py); not a perfect-health score.

- **[V2 recipes: 20 practical Dubbo freezer lunches](RECIPES_V2.md)** — revised protein portions, two full cooking methods and safe cooling.
- **[V2 consolidated shopping and prices](SHOPPING_V2_DUBBO.md)** — exact pack quantities, estimated budget, product links and price confidence.
- **[V2 evidence and corrections](V2_EVIDENCE.md)** — source checks and what remains unverified.

- [Documented cook-ups](COOKED_BATCHES.md) — which batches were made, approximate dates and actual versus planned yields.
- [Recipe archive](RECIPES_ARCHIVE.md) — complete recovered recipes from the frozen-lunch audit, including alternatives not confirmed as cooked.
- [5 September 2026 actual 18-portion batch](RECIPES_2026_SEPTEMBER.md) — distinguishes the 10-portion recipe design from the actual 18-portion cook-up.
- [Mediterranean sardine / salmon / tofu 10-meal recipe](RECIPES_MEDITERRANEAN.md) — a strong, **planned**, dairy-free rotation.
- [Latest 20-lunch concept](LATEST_20_LUNCH_CONCEPT.md) — identified as proposed until preparation evidence is available.
- [June 2026 paired 12-lunch recipe](RECIPES_2026_JUNE.md) — exact six salmon/brown-rice bowls plus six lentil/pumpkin/tofu curry bowls.
- [August 2026 fact-checked 10-lunch recipe](RECIPES_2026_AUGUST.md) — exact salmon/red-lentil/quinoa/vegetable amounts and method.
- [Additional freezer recipes](ADDITIONAL_RECIPES.md) — full July tomato-lentil rice recipe and ten four-portion alternatives (the alternatives are not confirmed cooked).
- [Older family-meal ideas](FAMILY_MEAL_CANDIDATES.md) — historical roster entries, distinctly labelled **unverified**.
- [Provenance, limitations and safe food handling](SOURCES_AND_METHOD.md).

## Historical top five (older audit; subject to revision)

| Score | Recipe | Date of recipe | Status |
|---:|---|---|---|
| 96/100 | Salmon, red lentil, quinoa & vegetable bowls | 15 Aug 2026 | Cook-up evidence |
| 95/100 | Red lentil, pumpkin & tofu curry | 6 Jun 2026 | Cook-up evidence |
| 94/100 | Salmon, brown rice & tomato vegetable bowls | 6 Jun 2026 | Cook-up evidence |
| 89/100 | Chickpea, brown rice & vegetable stew | 21 Dec 2025 | Cook-up evidence |
| 86/100 | Red lentil, root vegetable & walnut bowls | 13 Sep 2025 | Cook-up evidence; 11 visible containers vs 10 planned |

**September 2026 note:** The salmon/bean/quinoa recipe was designed for ten substantial containers, but the documented actual cook-up produced **18**. Never apply the 10-portion nutrition estimates to the 18-portion containers.

## Food pattern

Prioritise vegetables, legumes, high-fibre grains, oily fish or tofu, extra-virgin olive oil, nuts and seeds; watch unnecessary added sodium and processed meats. Rotate meals and include other calcium-rich and nutrient-dense foods through the week. All recipes are intended to be **dairy-free**, subject to product labels.

## What's not included

Personal clinical records, wearable metrics, family information and private photos are deliberately **not** copied into this public repository. Drive source URLs are references and may require the owner's access permission.

_Last compiled: 16 October 2026._


## 16 October 2026 — updated 20-lunch plan and research

The [original October 20-lunch concept](LATEST_20_LUNCH_CONCEPT.md) is retained unchanged as an historical proposal. The newer, **not yet cooked** revision corrects fish drained weights, the gluten-containing soy product, questionable shelled-edamame availability, portion/protein allocations and rice cooling.

- **[Optimised 20 freezer lunches — full recipes](OPTIMISED_20_LUNCHES_2026-10-16.md)** (10 Mediterranean fish bowls + 10 lentil/pea/tofu bowls, alternating across four weeks).
- **[Consolidated Woolworths 36-line shopping list](WOOLWORTHS_20_LUNCH_SHOPPING_2026-10-16.md)** — buy/usage quantities, estimated ~$204.25 first shop including optional soy milk and pantry staples, pantry-photo adjustment guidance; *not a verified Dubbo checkout*.
- **[Nutrition science audit and 10-metric /100 scorecard](NUTRITION_AUDIT_2026-10-16.md)** — original 89/86, revised 92/89 subjective rubric, primary sources and caveats.

**A “100/100” nutritional/longevity claim is unsupported.** The revised recipe has a **100% specification checklist** only; the 10-category nutrition rubric is openly subjective and does not predict lifespan.


## V3 — 16 October 2026: precision-first Woolworths recipes

**Latest proposed plan (not yet cooked or proven "100/100"):**

- **[V3: 20 freezer lunches — complete weighed recipes and detailed cooking instructions](V3_RECIPES_20_LUNCHES.md)** — 10 Mediterranean sardine/salmon/quinoa + 10 lentil/tofu/pea/brown-rice bowls; four-week alternating schedule, measured fish drained weights, distinct fruit/nut toppings, gluten/dairy checks and safe freezing.
- **[V3: Woolworths Dubbo shopping list](V3_WOOLWORTHS_DUBBO_SHOPPING.md)** — 38 consolidated ingredient lines, exact pack count and recipe use, links, price provenance and estimated **$221.99** initial cart (including optional 5 L high-protein soy). **Not a live Dubbo checkout or stock confirmation**. Check pantry before buying.
- **[V3: nutrition evidence and 10-metric audit](V3_NUTRITION_EVIDENCE_AND_SCORES.md)** — explicitly subjective scores, source links, known gaps, label-based protein subtotal and food safety.

**Relative to V2:** improves fruit/topping variety, buying accuracy, calcium-label clarity and verification detail. No scientific evidence proves this exact recipe increases lifespan over V2, and a perfect-health “100/100” label would be misleading. Older versions and cooked-batch documentation remain preserved.
