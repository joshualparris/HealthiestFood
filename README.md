# HealthiestFood


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
