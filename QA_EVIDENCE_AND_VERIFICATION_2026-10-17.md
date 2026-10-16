# HealthiestFood — independent verification ledger (17 October 2026)

**Status: actively improved, not fully verified.** This document records reproducible checks and limitations instead of claiming a scientifically *optimal* meal or a completed Woolworths Dubbo checkout. It complements (does not replace) the V6 recipes, original dated plan, prior longevity evidence, and archived versions. The existing app must remain dairy-free and preserve local browser progress.

## Existing system inventory

- Four distinct V6 adult freezer lunches A–D, with five portions each. **Four batches make 20 lunch portions**, not 20 unique lunch recipes. Those four recipes are *proposals*, not measured cook-ups or guaranteed nutrition.
- Thirteen further dated-planner meal ideas: four breakfasts, five dinners, four snacks, producing seventeen selectable recipes in all.
- Daily Sydney-time schedule, weekly ingredient export, recently introduced editable shopping and pantry checkboxes, original 35-line V6 priced *estimate*, and timer-based step-by-step guided cooking.
- Client-side localStorage persists schedule, shopping ticks, scaled cooking ingredient checks and real-clock countdowns; no cross-device sync guaranteed.
- Static Vercel website, GitHub Actions Node unit/structure tests, with new headless Chromium smoke-test workflow added on 17 October.
- Food science ledger and extensive original V2–V6 + older recipe archives retained.

## Science and product-check outcomes

**High confidence: dietary pattern, not one magic recipe.** Prioritise dietary variety with vegetables, fruit, whole grains, legumes, unsalted nuts/seeds and unsaturated fats; prefer fish and plant proteins, limit high saturated fat, salt and discretionary ultra-processed choices. The Australian Heart Foundation guidance supports the overall pattern, not claims of more lifespan from a specific bowl.

**Trial context.** PREDIMED (Estruch et al., 2018) reported lower cardiovascular-event risk with Mediterranean dietary interventions in high-risk older adults. The original trial paper was withdrawn and reanalysed following important non-random assignment at several sites. The corrected analysis supports the *dietary-pattern* comparison but **does not validate an individual recipe, personal lifespan predictions, or branded products**.

**Marine omega-3 is not the same as plant ALA.** Fish, walnuts and flax can all fit an adequate diet; walnuts/flax do not supply predictable amounts of the marine DHA/EPA found in oily fish. Count fish at dinner and elsewhere rather than treating the meal plan as a mandatory additional daily fish serving.

**Dairy-free calcium.** Product identity checked against the Woolworths listing for Evergreen Fresh Hard Tofu 650g: Australian soya bean extract, water and calcium sulphate; listing reports protein 24g/100g, energy 884kJ/100g, saturated fat 1.69g/100g, sodium 12.5mg/100g. **The listing does not report a quantified calcium content**. Thus 125g tofu would provide roughly 30g *labelled protein* but cannot be credited as a verified exact calcium amount. Calcium-fortified soy requires current package verification as well.

**Food safety:** NSW Food Authority advises dividing leftovers into shallow portions and refrigerating/freezing within 2h, cold storage below 5°C, eating refrigerated cooked rice/pasta within 2 days (most other leftovers within 3 days), defrosting in the fridge, and reheating leftovers steaming hot. For rice, only reheat once. Scale-up must allow adequate refrigerator and freezer space; cooking large amounts in one go is not automatically safer.

**Unverified:** exact whole-recipe kilojoules/calories; usable weights and cooked yield in user's kitchen; iron, iodine, zinc, B12, vitamin D, calcium and potassium totals; independent protein digestibility; every product's allergens in each Dubbo store; current Woolworths price, sale, in-store inventory, and full-cart checkout total. **Do not treat indicative estimates as live observations.**

### Independent 10-dimension *planning-quality* appraisal of the four V6 lunches

These points are **subjective risk/coverage indicators for the proposed rotation**, not measured nutrient adequacy or a probability of living longer. Each dimension: 0–3 = poor evidence/coverage, 4–6 = partially addressed or materially unverified, 7–8 = reasonably planned, 9–10 = exceptionally documented *and tested*. We do **not** add these to a longevity score.

| Requested assessment dimension | /10 | Reasoned limitation |
|---|---:|---|
| Plant diversity | 8 | Legumes, vegetable colours and wholegrains in the four-batch rotation; household whole-week diversity still unknown. |
| Protein quality and adequacy | 7 | Fish/soy/legume design; dry/cooked and drained fish distinctions mostly recorded; not full quantified daily requirements. |
| Fibre and gut support | 8 | Legumes, wholegrains, produce and optional nuts; not all whole-recipe label/dataset fibre calculations completed. |
| Fat quality and omega-3 | 8 | EVOO, walnuts and two fish batches; actual consumed fish frequency and EPA/DHA amounts unverified. |
| Micronutrient breadth | 5 | Calcium, iron, B12, vitamin D and iodine not completely reconciled with the rest of the day or measured foods. |
| Cardiovascular dietary quality | 8 | Reasonable Mediterranean-inspired pattern and salt restraint; tin/product and portion-specific sodium needs final verification. |
| Long-term pattern evidence | 7 | Strong general pattern evidence, but PREDIMED limitations and no V6 recipe-specific outcomes. |
| Energy adequacy and satiety | 5 | Serving yields and fat/fibre plausibly filling, but no verified full energy or user needs and recipe taste testing. |
| Affordability and sustainability | 5 | One-supermarket plan, pack math and leftover handling, but 35-row \$256.43 allowance **not selected-store checkout verified**. |
| Cooking practicality and food safety | 6 | Clear cooking and cooling advice and timers, but batch volume, reheating and real-device lock-screen testing remain incomplete. |

No amount of tweaking these ten subjective numbers can turn them into validated clinical scores. Improving the weak dimensions means **closing evidence gaps** (nutrition composition, kitchen tests, live cost provenance), not automatically adding more ingredients.

## Changes delivered during 17 October continuation

- Repaired countdown persistence for multi-character recipe IDs such as `br-oats` and `di-lentil`; regression tests for multiple running and paused timers.
- Added saved, scaled cooking-ingredient prep checkboxes and responsive mobile controls. Cooking timers remain independent of step navigation.
- Corrected recipe category startup bug: browser `querySelector` cannot be iterated with `.forEach`; now uses `querySelectorAll`. This was not caught by original source-only tests.
- Added date-aware weekly ingredients and pantry-like tick boxes; these are **not a current-priced Woolworths basket**. More sophisticated combined packs/prices should be validated separately.
- Introduced CI-driven real Chromium navigation/timer/shopping tests. Their outcome must be read from GitHub Actions; a successful build alone does not prove an Android locked-screen alarm works.

## Remaining issue/status register

| Issue | Current verification status |
|---|---|
| Single-letter-only saved timer identifier | **Fixed**, unit tests added. |
| Recipe filter startup `.forEach` crash | **Fixed**, source readback and Node CI validation. Browser smoke remains separate. |
| Scaled ingredient quantities in cooking | **Implemented**, but cook methods, equipment capacity and heating times are not universally scalable. |
| Persistent pantry + dates | **Partially implemented**, counts for same named ingredient may still refer to different SKUs/usable yields. |
| Selected Dubbo Woolworths stock and live prices | **Blocked/unverified**: no valid store-specific checkout evidence. Do not invent stock or till prices. |
| Recipe calories and complete micronutrients | **Unverified**: an ingredient-specific nutrient-database analysis with food losses and edible yield is still required. |
| Actual kitchen cooking, flavour, exact yield and safe batch cooling | **Unverified**: cooking trial and thermometer checks needed. |
| Android Chrome/iPhone Safari device and phone-lock alarms | **Unverified**: Chromium CI is not equivalent to mobile OS background testing. Built-in warning should remain. |
| WCAG 2.2 AA and all device/browser matrices | **Partial**: static fixes and automated Chromium checks are not a formal accessibility audit. |
| Remote grocery cart / checkout | **Not implemented or claimed**. |

## Primary evidence and disclosure links

1. Heart Foundation, [heart-healthy eating pattern](https://www.heartfoundation.org.au/healthy-living/healthy-eating/heart-healthy-eating-pattern), [healthy fats and fish](https://www.heartfoundation.org.au/healthy-living/healthy-eating/fats-oils-and-heart-health).
2. Estruch et al. (2018), [corrected PREDIMED cardiovascular outcomes](https://www.nejm.org/doi/10.1056/NEJMoa1800389), noting reported original randomisation issues and correction.
3. NSW Food Authority, [leftovers and food safety](https://www.foodauthority.nsw.gov.au/consumer/food-extra-care/leftovers).
4. Woolworths [Evergreen Fresh Hard Tofu 650g](https://www.woolworths.com.au/shop/productdetails/595465) online ingredients/nutrient listing. **Listing presence does not establish Dubbo price or stock**.
5. Existing [V6 recipes](v6/RECIPES.md), [shopping/provenance](v6/SHOPPING.md), [evidence](v6/EVIDENCE.md) and [full site fact-check](SITE_FACT_CHECK.md).
