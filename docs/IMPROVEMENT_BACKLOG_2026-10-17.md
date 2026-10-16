# HealthiestFood — master improvement backlog

**Version:** 2026-10-17 · **Source repo:** [joshualparris/HealthiestFood](https://github.com/joshualparris/HealthiestFood) · **Backlog:** **231 candidate improvements across 17 areas** (P0: 23, P1: 151, P2: 56, P3: 1) · **Scope of change:** documentation/backlog only; no feature in this list is claimed implemented by this commit.

> **Purpose:** practical, evidence-based development choices, not a race to add features or invent a “100/100 longevity meal”. Prioritise food safety, verified nutrients, honest local prices, and reliable cooking. This document **does not claim every item is a confirmed bug**. Status distinguishes findings seen in the repository from proposals and checks needing a real device or kitchen.

## Recommended order — first 15 work items

1. **[HF-001](#hf-001)** — Reconcile black-bean drained weight discrepancy (Nutrition data & mathematical correctness)
2. **[HF-002](#hf-002)** — Replace partial nutrients with complete AFCD-mapped ingredient coverage (Nutrition data & mathematical correctness)
3. **[HF-003](#hf-003)** — Use canonical ingredient IDs across the whole app (Nutrition data & mathematical correctness)
4. **[HF-004](#hf-004)** — Distinct weight bases for gross, drained, raw, dry and cooked (Nutrition data & mathematical correctness)
5. **[HF-005](#hf-005)** — Separate brand panels from generic AFCD nutrition (Nutrition data & mathematical correctness)
6. **[HF-017](#hf-017)** — Retire unvalidated longevity scores as decision criteria (Nutrition science, personalisation & public-health integrity)
7. **[HF-031](#hf-031)** — Replace risky prose-only serving scaling with structured step ingredients (Recipe integrity, enjoyment & food variety)
8. **[HF-032](#hf-032)** — Kitchen-test actual five-portion cooked yields (Recipe integrity, enjoyment & food variety)
9. **[HF-046](#hf-046)** — Make safety checks first-class cooking steps (Cooking and food safety)
10. **[HF-047](#hf-047)** — Handle cooked rice and pasta special rules everywhere (Cooking and food safety)
11. **[HF-048](#hf-048)** — Make batch-cooling capacity an explicit gate (Cooking and food safety)
12. **[HF-060](#hf-060)** — Differentiate fixed V6 lunch basket from plan-derived basket (Woolworths Dubbo product research and shopping)
13. **[HF-061](#hf-061)** — Resolve contradictory bean drained yields (Woolworths Dubbo product research and shopping)
14. **[HF-062](#hf-062)** — Replace name regex purchase matching with SKU/ingredient mapping (Woolworths Dubbo product research and shopping)
15. **[HF-090](#hf-090)** — Default new plans to three core meals plus optional snacks (Meal planning, timing and nutrition patterns)

**Suggested implementation sequence:** (1) measurement consistency and food safety; (2) canonical product/ingredient records; (3) AFCD nutrient mapping; (4) shopping/pantry and scaling regression fixes; (5) real mobile/kitchen verification; (6) usability and optional enhancements. Do not add expensive tracking, medical profiles, or biological-age features without a demonstrated user benefit.

## Status and evidence conventions

- **Confirmed:** Directly observed in repository source or explicitly acknowledged in its audit; still reproduce in the current app before changing code. Examples: `nutrient-ledger.js` black beans 225 g versus `food-shopping.js` 252 g, AFCD probe workflow references a script absent from the current repository tree, current CI production URL targets Vercel, Render `publishPath: .`.
- **Unverified:** Requires actual checkout, device test, label photo, physical preparation, or real measurement.
- **Proposal:** Potential benefit and an actionable design acceptance criterion, **not** a proven defect or guaranteed nutritional/longevity improvement.
- **P0:** correctness, safety and false-claim risk. **P1:** strong practical value. **P2:** useful after foundations. **P3:** exploratory.
- **Done definition:** Only mark an item complete with evidence (source checks, unit tests, browser tests, deployment SHA, or real kitchen measurement as applicable). A code push is not proof of physical cooking, safe storage or live Dubbo stock.

**Grounding and evidence:** [whole-site evidence review](../WHOLE_SITE_EVIDENCE_REVIEW_2026-10-17.md), [nutrient reconciliation](../NUTRIENT_LABEL_RECONCILIATION_2026-10-17.md), [QA ledger](../QA_EVIDENCE_AND_VERIFICATION_2026-10-17.md), [existing improvement status](../HEALTH_IMPROVEMENTS_AND_REMAINING_GAPS_2026-10-17.md), and the current source files. Australian primary guidance: [AFCD Release 3](https://www.foodstandards.gov.au/science-data/food-nutrient-databases/afcd/data-files), [Heart Foundation pattern](https://www.heartfoundation.org.au/healthy-living/healthy-eating/heart-healthy-eating-pattern), [omega-3 guidance](https://www.heartfoundation.au/healthy-living/healthy-eating/omega-3-omega-6-heart-health), [NSW leftovers](https://www.foodauthority.nsw.gov.au/consumer/food-extra-care/leftovers), [low-immunity safety](https://www.foodauthority.nsw.gov.au/consumer/food-risk-you/low-immunity), [FSANZ allergen labels](https://www.foodstandards.gov.au/consumer/labelling/allergen-labelling), [Australian nutrient reference values](https://www.eatforhealth.gov.au/nutrient-reference-values). Sources support *dietary patterns and safety principles*, not “the healthiest possible meal”.

## Complete prioritised backlog

### 1. Nutrition data & mathematical correctness (16)

<a id="hf-001"></a>
**HF-001 · P0 · Confirmed — Reconcile black-bean drained weight discrepancy**

Acceptance: nutrient-ledger.js currently uses 225 g per can while food-shopping.js converts the same 420 g tin to 252 g; verify actual label/drained contents, use one product-level conversion and unit-test both views.

<a id="hf-002"></a>
**HF-002 · P0 · Confirmed — Replace partial nutrients with complete AFCD-mapped ingredient coverage**

Acceptance: Import FSANZ AFCD Release 3 with named source IDs and match each of the 17 recipes; display matched/unmatched ingredients, unknown values and date of source.

<a id="hf-003"></a>
**HF-003 · P0 · Confirmed — Use canonical ingredient IDs across the whole app**

Acceptance: Replace fragile wording and regex matching with one versioned ingredient record for nutrition, recipes, allergies, shopping and pantry; round-trip all recipe entries without loss.

<a id="hf-004"></a>
**HF-004 · P0 · Confirmed — Distinct weight bases for gross, drained, raw, dry and cooked**

Acceptance: Store unit and physical state explicitly; reject comparisons and conversions without declared edible yield; build fixtures for canned fish/beans and grains.

<a id="hf-005"></a>
**HF-005 · P0 · Confirmed — Separate brand panels from generic AFCD nutrition**

Acceptance: Maintain distinct product variants and nutrient provenance; never silently swap a generic tofu for an exact branded high-protein tofu.

<a id="hf-006"></a>
**HF-006 · P1 · Proposal — Model cooking-water uptake and yield**

Acceptance: Record raw-to-cooked yield ranges for quinoa, rice, legumes, meats and tofu; show measured yield where kitchen trial exists.

<a id="hf-007"></a>
**HF-007 · P1 · Proposal — Account for nutrient retention where scientifically justified**

Acceptance: Record nutrient-specific cooking retention assumptions and methods; keep unknown where supporting data are missing.

<a id="hf-008"></a>
**HF-008 · P1 · Proposal — Show complete energy and macros only above a coverage threshold**

Acceptance: Require sufficiently matched grams, validated energy factors and source coverage before publishing a 'full meal' total; otherwise show partial label-based subtotal.

<a id="hf-009"></a>
**HF-009 · P1 · Proposal — Daily and weekly nutrient coverage for selected portions**

Acceptance: Sum scheduled eaten portions, not entire batch weights; show age/life-stage appropriate reference ranges with no diagnoses or hard pass/fail when data are incomplete.

<a id="hf-010"></a>
**HF-010 · P1 · Proposal — Cover calcium, iron, zinc, potassium, folate, sodium, iodine, B12, vitamin D and fats**

Acceptance: Expose per-nutrient data coverage plus source and explicitly nullable units rather than implying all data exist.

<a id="hf-011"></a>
**HF-011 · P1 · Proposal — Compute omega-3 ALA separately from marine EPA and DHA**

Acceptance: Keep plant and marine omega-3 distinct and add fish cooked-weight adjustments; do not equate fish occasions with grams.

<a id="hf-012"></a>
**HF-012 · P1 · Proposal — Validate protein by recipe and substitution**

Acceptance: Recalculate when users switch tofu, soy drink, beans or fish brands, including manufacturer labels and edible yield.

<a id="hf-013"></a>
**HF-013 · P1 · Proposal — Model food labels using intervals and less-than values**

Acceptance: Treat '<5 mg sodium' as bounded, not zero or exactly 5; expose resulting uncertainty for sums.

<a id="hf-014"></a>
**HF-014 · P2 · Proposal — Show meaningful serving-size and satiety ranges**

Acceptance: Offer configurable portions and variety without presenting more protein, lower calories or higher fibre as automatically better.

<a id="hf-015"></a>
**HF-015 · P2 · Proposal — Automate nutrient coverage diff for recipe revisions**

Acceptance: Require before/after reports, mapped-food coverage and sources for V7+, not arbitrary /100 score changes.

<a id="hf-016"></a>
**HF-016 · P2 · Proposal — Version nutrition snapshots with revision hashes**

Acceptance: A recipe version refers to immutable product label/AFCD release and conversion rules, enabling historical reproducibility.

### 2. Nutrition science, personalisation & public-health integrity (14)

<a id="hf-017"></a>
**HF-017 · P0 · Confirmed — Retire unvalidated longevity scores as decision criteria**

Acceptance: Keep historical scores explicitly subjective and never use them as diet-completeness or lifespan forecasts.

<a id="hf-018"></a>
**HF-018 · P1 · Proposal — Separate well-supported recommendations from speculation**

Acceptance: Mark claims with source type, study population, evidence quality and whether the finding concerns a surrogate or clinical outcome.

<a id="hf-019"></a>
**HF-019 · P1 · Proposal — Expose nutrient shortfalls only when data are sufficiently complete**

Acceptance: For unknown iodine/calcium/B12 etc display 'not enough data', not deficiency, a green check or automatic supplement recommendations.

<a id="hf-020"></a>
**HF-020 · P1 · Proposal — Allow user-selected dietary exclusions safely**

Acceptance: Support dairy, gluten, fish, soy, egg, nuts, sesame and other allergen filters without claiming a filtered product is certified safe unless pack verified.

<a id="hf-021"></a>
**HF-021 · P1 · Proposal — Differentiate strict coeliac-style gluten avoidance from food preference**

Acceptance: Warnings reflect ingredient gluten, may-contain cross-contact and unknown labels without equating those risks.

<a id="hf-022"></a>
**HF-022 · P1 · Proposal — Uncouple food goals from calorie restriction**

Acceptance: No automatic fasting windows, weight-loss targets or excessive portions; let users prioritise adequacy, budget, appetite and convenience.

<a id="hf-023"></a>
**HF-023 · P1 · Proposal — Model whole-week oily-fish intake accurately**

Acceptance: Use edible cooked/tinned grams and fish outside lunch; disclose the guidance's serving conventions and uncertainties.

<a id="hf-024"></a>
**HF-024 · P1 · Proposal — Support calcium-fortified dairy-free alternatives**

Acceptance: Compare fortification and protein alongside added sugar and label provenance; choose based on overall-day needs.

<a id="hf-025"></a>
**HF-025 · P1 · Proposal — Highlight iodine sources and uncertainty without megadosing**

Acceptance: Track iodised bread/salt, seafood and fortified foods appropriately; do not suggest kelp or high salt intake to chase targets.

<a id="hf-026"></a>
**HF-026 · P1 · Proposal — Provide gentle reminders about adequate food and non-moralised meal timing**

Acceptance: Allow missed time slots, appetite changes and sleep preferences without red failure language.

<a id="hf-027"></a>
**HF-027 · P2 · Proposal — Offer a professional review export**

Acceptance: Export selected recipes and transparent nutrition assumptions for an accredited practising dietitian, without sharing automatically.

<a id="hf-028"></a>
**HF-028 · P2 · Proposal — Check the Australian guidelines and nutrient-reference version dates**

Acceptance: Display guidance revision date and link to authoritative Australian pages instead of stale copied values.

<a id="hf-029"></a>
**HF-029 · P2 · Proposal — Introduce a 'why this swap' evidence comparator**

Acceptance: Show expected nutrient/cost/allergen/cooking trade-offs when swapping one real product for another.

<a id="hf-030"></a>
**HF-030 · P2 · Proposal — Avoid turning Blue Zones or influencer protocols into prescriptions**

Acceptance: Source-check observational versus experimental evidence; flag unsupported longevity marketing.

### 3. Recipe integrity, enjoyment & food variety (15)

<a id="hf-031"></a>
**HF-031 · P0 · Confirmed — Replace risky prose-only serving scaling with structured step ingredients**

Acceptance: Each method step references canonical ingredient quantities/portions; do not multiply an embedded fish-per-piece number or cooking time by mistake.

<a id="hf-032"></a>
**HF-032 · P0 · Unverified — Kitchen-test actual five-portion cooked yields**

Acceptance: Record raw food weights, output grams, container sizes, water needed, textures and time before calling any recipe 'tested'.

<a id="hf-033"></a>
**HF-033 · P1 · Proposal — Make every recipe use one authoritative ingredient data structure**

Acceptance: Generate shopping, detail, cook mode and print layout from the same measured recipe record.

<a id="hf-034"></a>
**HF-034 · P1 · Proposal — Define ingredient variants and substitutions with recalculation**

Acceptance: Stock swap propagates to nutrition, allergen warnings, costs, directions and shopping units.

<a id="hf-035"></a>
**HF-035 · P1 · Proposal — Record estimated total and active preparation time separately**

Acceptance: Distinguish chopping, oven time, passive simmer and cooling; verify times against actual cook-up logs.

<a id="hf-036"></a>
**HF-036 · P1 · Proposal — Use a shared pantry-aware seasoning profile**

Acceptance: Avoid buying duplicate cumin/paprika/garlic where products/quantities genuinely match.

<a id="hf-037"></a>
**HF-037 · P1 · Proposal — Offer optional topping or sauce modules**

Acceptance: Keep walnuts, lemon, seeds and fresh fruit separate until serving where texture or safety benefits.

<a id="hf-038"></a>
**HF-038 · P1 · Proposal — Review breakfast protein consistency**

Acceptance: Ensure oatmeal, smoothie, avocado toast and soy yoghurt dishes have practical optional protein/calcium pairings, not invented macros.

<a id="hf-039"></a>
**HF-039 · P1 · Proposal — Offer lighter/heavier batch variants**

Acceptance: Adjust energy or legumes/grain proportion to appetite and tolerance without branding one as universally healthier.

<a id="hf-040"></a>
**HF-040 · P1 · Proposal — Improve plant and seasonal diversity across a month**

Acceptance: Measure unique vegetables, fruit, grains and legumes by canonical type while avoiding meaningless targets.

<a id="hf-041"></a>
**HF-041 · P2 · Proposal — Create lower-cost nutrition-equivalent variants**

Acceptance: Compare tofu and legume choices or tinned/frozen salmon without claiming every more expensive product is better.

<a id="hf-042"></a>
**HF-042 · P2 · Proposal — Pilot practical freezer-friendly sauces**

Acceptance: Test flavour, moisture and reheating stability, sodium and allergen impact before adding.

<a id="hf-043"></a>
**HF-043 · P2 · Proposal — Add 15-minute emergency dinners and minimal-prep lunches**

Acceptance: Provide evidence-aligned fallbacks for days without a freezer meal, using available pantry foods.

<a id="hf-044"></a>
**HF-044 · P2 · Proposal — Record actual family-sized cooking results separately**

Acceptance: Scale adult portions carefully; do not assert child-specific nutrition from adult recipes.

<a id="hf-045"></a>
**HF-045 · P2 · Proposal — Check title/description/ingredients consistency**

Acceptance: Automated test rejects contradictions such as 'tomato-free' wording when diced tomatoes are in the ingredients.

### 4. Cooking and food safety (14)

<a id="hf-046"></a>
**HF-046 · P0 · Confirmed — Make safety checks first-class cooking steps**

Acceptance: Prominent controls for raw-fish separation, doneness, shallow cooling, refrigeration/freezing, thawing and reheat rather than burying them in prose.

<a id="hf-047"></a>
**HF-047 · P0 · Confirmed — Handle cooked rice and pasta special rules everywhere**

Acceptance: Check two-day refrigerated limit, rapid cooling and only one reheating in all relevant recipe and freezer flows.

<a id="hf-048"></a>
**HF-048 · P0 · Confirmed — Make batch-cooling capacity an explicit gate**

Acceptance: Warn that five deep hot containers may exceed home fridge cooling; offer two-session cook-ups and shallow, spaced trays.

<a id="hf-049"></a>
**HF-049 · P1 · Proposal — Use a trustworthy internal-temperature table**

Acceptance: Link NSW guidance and food/probe method, identify fish/poultry/reheated leftovers correctly and reconcile any different 60 versus 75°C contexts.

<a id="hf-050"></a>
**HF-050 · P1 · Proposal — Add an optional thermometer check during cooking**

Acceptance: Let users record measured centre temperature, while noting a time countdown cannot prove safe cooking.

<a id="hf-051"></a>
**HF-051 · P1 · Proposal — Track cumulative time outside refrigeration**

Acceptance: For potentially hazardous foods, record estimated time in the 5–60°C danger zone rather than repeatedly resetting a two-hour clock.

<a id="hf-052"></a>
**HF-052 · P1 · Proposal — Provide safe thawing instructions per food type**

Acceptance: Show frozen fish thaw window, fridge-only defrost where advised and avoid freezing whole sealed tins.

<a id="hf-053"></a>
**HF-053 · P1 · Proposal — Make reheating advice match each recipe's components**

Acceptance: Rice, fish, toppings and cold fruit should not be treated as a single identical microwave process.

<a id="hf-054"></a>
**HF-054 · P1 · Proposal — Create vulnerable-eater food safety mode**

Acceptance: Opt-in stricter NSW low-immunity, pregnancy or under-five rules with prominent clinician guidance; do not quietly reclassify meals as safe.

<a id="hf-055"></a>
**HF-055 · P1 · Proposal — Frozen berries and leafy salads warning framework**

Acceptance: Follow current package and FSANZ advice, especially for high-risk eaters; never assert all raw frozen produce is safe.

<a id="hf-056"></a>
**HF-056 · P1 · Proposal — Check cross-contact workflows**

Acceptance: Show wash-hands, separate boards, raw-poultry handling and allergy-related utensil cleaning in the appropriate steps.

<a id="hf-057"></a>
**HF-057 · P1 · Proposal — Add freezer-date and use-by label generation**

Acceptance: Each cooked batch can be labelled with recipe, cooked/frozen date, instructions and verified best-use range.

<a id="hf-058"></a>
**HF-058 · P2 · Proposal — Capture actual cooling time during test cooks**

Acceptance: Track shallow container depth, time to fridge and observed food temp in cook-trial logs with privacy-preserving storage.

<a id="hf-059"></a>
**HF-059 · P2 · Proposal — Create food-safety source regression checks**

Acceptance: Notify maintainers when NSW guidance changes and review affected step text, rather than using a fixed old value forever.

### 5. Woolworths Dubbo product research and shopping (18)

<a id="hf-060"></a>
**HF-060 · P0 · Confirmed — Differentiate fixed V6 lunch basket from plan-derived basket**

Acceptance: Display an obvious scope label and never present the $256.43 historical estimate as all 17 recipes or a live checkout.

<a id="hf-061"></a>
**HF-061 · P0 · Confirmed — Resolve contradictory bean drained yields**

Acceptance: One verified product pack record must inform retail packs, pantry conversion, ingredients and nutrient analysis; preserve uncertainty.

<a id="hf-062"></a>
**HF-062 · P0 · Confirmed — Replace name regex purchase matching with SKU/ingredient mapping**

Acceptance: Normalize chickpeas, capsicum, baby peas and oil variants without merging different forms or allergen profiles.

<a id="hf-063"></a>
**HF-063 · P1 · Proposal — Add Woolworths store selection with provenance**

Acceptance: Explicitly choose Dubbo/Delroy when supported and timestamp any observed local price/stock; otherwise state unverified.

<a id="hf-064"></a>
**HF-064 · P1 · Proposal — Distinguish live, historic, estimated and missing price**

Acceptance: Require observed date, retailer and store for each price; suppress 'current' badges without evidence.

<a id="hf-065"></a>
**HF-065 · P1 · Proposal — Retail package optimisation**

Acceptance: Minimise total shop cost and food waste while respecting pack sizes, edible mass and purchased unit, not just ceil(required/pack).

<a id="hf-066"></a>
**HF-066 · P1 · Proposal — Respect pantry quantities in shopping maths**

Acceptance: Subtract owned usable quantities with units and expiry; do not silently equate checked product with unlimited stock.

<a id="hf-067"></a>
**HF-067 · P1 · Proposal — Support nested substitutions with shopping recalculation**

Acceptance: Unavailable salmon or tofu generates labelled alternatives and recomputes packs, nutrition, allergens and total.

<a id="hf-068"></a>
**HF-068 · P1 · Proposal — Add checkout-ready grouped list**

Acceptance: Group fresh/frozen/pantry, with purchased size and recipe usage, portable as copied text/print rather than falsely claiming an API cart.

<a id="hf-069"></a>
**HF-069 · P1 · Proposal — Track prices per edible 100 g**

Acceptance: Correct comparisons for shells, drained canned beans, pumpkin seeds/peel and sale sizes, with sensitivity range.

<a id="hf-070"></a>
**HF-070 · P1 · Proposal — Deduplicate across all 17 recipe categories**

Acceptance: Breakfast, lunch, dinner and snack share ingredients in one exact consolidated shopping calculation.

<a id="hf-071"></a>
**HF-071 · P1 · Proposal — Recognise more product forms and units**

Acceptance: Map tins to drained grams, bags to edible grams, each to estimated grams only with stated yield and customer confirmation.

<a id="hf-072"></a>
**HF-072 · P1 · Proposal — Add configurable shopping horizon**

Acceptance: One day, seven days, 14 days, four weeks, selected meal slots or a saved cooking batch.

<a id="hf-073"></a>
**HF-073 · P1 · Proposal — Add substitution priority controls**

Acceptance: Allow lowest cost, lowest sodium, verified GF, easiest availability or preferred product without inventing optimisation benefits.

<a id="hf-074"></a>
**HF-074 · P2 · Proposal — Model supermarket specials carefully**

Acceptance: Use specials' effective dates and per-unit rate; invalidate stale discounts and avoid scraping around access controls.

<a id="hf-075"></a>
**HF-075 · P2 · Proposal — Separate required ingredients from optional nutritional sides**

Acceptance: Fortified drink, walnuts, fruit and toppings must appear only when chosen or clearly marked optional.

<a id="hf-076"></a>
**HF-076 · P2 · Proposal — Link exact product page with fallback search**

Acceptance: Handle retired Woolworths IDs gracefully and show alternative products as unverified until reviewed.

<a id="hf-077"></a>
**HF-077 · P2 · Proposal — Allow notes on store aisle, pickup and substitutions**

Acceptance: Store user observations separately from official facts; don't invent store-specific aisle numbers.

### 6. Pantry inventory, leftovers and food waste (12)

<a id="hf-078"></a>
**HF-078 · P1 · Proposal — Build canonical quantity-based pantry stock**

Acceptance: Track product, edible quantity, unit, open status, expiry, frozen date and storage location; not just a checked checkbox.

<a id="hf-079"></a>
**HF-079 · P1 · Proposal — Deduct shopping plan from pantry via consistent units**

Acceptance: Never subtract dry rice grams from cooked rice grams, or gross canned weights from drained food.

<a id="hf-080"></a>
**HF-080 · P1 · Proposal — Carry partially used packs forward**

Acceptance: After a 20-lunch cook-up, calculate 700 g rice, remaining peas, oil, nuts and spices based on measured usage.

<a id="hf-081"></a>
**HF-081 · P1 · Proposal — Provide 'use this first' meal suggestions**

Acceptance: Recommend existing foods with soonest safe-use date, matching dietary rules and recipe quantities.

<a id="hf-082"></a>
**HF-082 · P1 · Proposal — Offer shopping list item overrides with persistence**

Acceptance: Allow buyer to adjust planned number of packs and keep source quantity versus selected purchase.

<a id="hf-083"></a>
**HF-083 · P1 · Proposal — Handle multiple packs with different dates**

Acceptance: Separate opened and unopened tofu, frozen fish packs and overlapping pantry stock instead of one aggregate balance.

<a id="hf-084"></a>
**HF-084 · P1 · Proposal — Track actual consumption and leftovers**

Acceptance: Completed meal deducts inventory only when confirmed prepared or consumed, with reversible log.

<a id="hf-085"></a>
**HF-085 · P1 · Proposal — Add barcode/manual product entry**

Acceptance: Use optional device camera or typing, with explicit verification because barcode databases can be stale.

<a id="hf-086"></a>
**HF-086 · P1 · Proposal — Build a sensible 'what's missing for dinner?' filter**

Acceptance: Find recipes needing fewest purchase lines and report assumptions.

<a id="hf-087"></a>
**HF-087 · P2 · Proposal — Track waste by cause**

Acceptance: Record spoiled, uneaten or overbought ingredients and adjust future pack calculation.

<a id="hf-088"></a>
**HF-088 · P2 · Proposal — Create shopping day checklist and reset semantics**

Acceptance: Allow clear purchased items without deleting permanent pantry data or future meal plans.

<a id="hf-089"></a>
**HF-089 · P2 · Proposal — Provide an export/import inventory file**

Acceptance: Private JSON or CSV transfer between devices with schema/version validation and clear user-controlled import.

### 7. Meal planning, timing and nutrition patterns (13)

<a id="hf-090"></a>
**HF-090 · P0 · Confirmed — Default new plans to three core meals plus optional snacks**

Acceptance: Avoid rigid automatic five eating occasions daily; preserve existing user schedules until explicit migration.

<a id="hf-091"></a>
**HF-091 · P1 · Proposal — Allow per-person meal count without guessing child servings**

Acceptance: Adults and children are different contexts; support portions by diner while leaving paediatric guidance outside scope.

<a id="hf-092"></a>
**HF-092 · P1 · Proposal — Calculate Australian/Sydney civil time across DST boundaries**

Acceptance: Add spring-forward, fall-back, leap day and Saturday rollover tests; show local timezone and avoid midnight UTC mix-ups.

<a id="hf-093"></a>
**HF-093 · P1 · Proposal — Differentiate planned, cooked, frozen, eaten and skipped**

Acceptance: Don't mark a recipe physically cooked just because its calendar entry was ticked.

<a id="hf-094"></a>
**HF-094 · P1 · Proposal — Support recurring meal templates and quick week copy**

Acceptance: Edit and apply templates with preview, reversible change and no silent overwriting.

<a id="hf-095"></a>
**HF-095 · P1 · Proposal — Make lunch rotation adaptable to remaining freezer inventory**

Acceptance: Choose available older safe portions first, not blindly suggest freshly cooking more food.

<a id="hf-096"></a>
**HF-096 · P1 · Proposal — Allow switching a scheduled meal safely**

Acceptance: Recalculate grocery lists, time, stock and optional drink immediately without losing other dates.

<a id="hf-097"></a>
**HF-097 · P1 · Proposal — Show preparation sessions separately from eating times**

Acceptance: Saturday five-meal cook-up and weekday consumption should have different reminders and safety instructions.

<a id="hf-098"></a>
**HF-098 · P1 · Proposal — Fix fish-meal occasion versus serving calculation**

Acceptance: Compute actual edible fish weight when available and note other weekly meals; avoid a misleading threshold tick.

<a id="hf-099"></a>
**HF-099 · P1 · Proposal — Include realistic breakfast/dinner/snack alternatives**

Acceptance: Offer switchable slots, no moralised missed-meal badges and hunger-responsive timing.

<a id="hf-100"></a>
**HF-100 · P2 · Proposal — Add a daily 'nutritional coverage uncertainty' summary**

Acceptance: Show mapped versus unmapped nutrient share and what remains unknown, not a red deficiency banner.

<a id="hf-101"></a>
**HF-101 · P2 · Proposal — Keep food timing guidance flexible and evidence graded**

Acceptance: No 'optimal 7:30 breakfast' or 16:8 claims unless clearly stated as an unproven optional preference.

<a id="hf-102"></a>
**HF-102 · P2 · Proposal — Make family batch choices separately configurable**

Acceptance: Shopping quantities can include partners or shared dinners without implying all eat equal adult portions.

### 8. Guided cooking, steps and multimodal interaction (14)

<a id="hf-103"></a>
**HF-103 · P0 · Confirmed — Link every step's measurements to structured quantities**

Acceptance: Eliminate duplicated hard-coded '150 g quinoa' in narrative when scale differs; validate against total recipe amounts.

<a id="hf-104"></a>
**HF-104 · P1 · Proposal — Preflight kitchen mise en place**

Acceptance: List utensils, washed produce, preheated oven, chilled ingredients, storage containers and expected worktop space before timers.

<a id="hf-105"></a>
**HF-105 · P1 · Proposal — Build dependency-aware parallel step schedule**

Acceptance: Allow roast, quinoa and sauce simultaneously without suggesting impossible one-person actions.

<a id="hf-106"></a>
**HF-106 · P1 · Proposal — Show current step with a pinned ingredient strip**

Acceptance: Keep units and next needed quantities visible without scrolling back to ingredient list.

<a id="hf-107"></a>
**HF-107 · P1 · Proposal — Add batch scaling warnings for equipment constraints**

Acceptance: Doubling recipe warns about trays/pan capacity, liquid evaporation and fridge/freezer chilling throughput.

<a id="hf-108"></a>
**HF-108 · P1 · Proposal — Create ingredient-level prep checkboxes**

Acceptance: Tick measured/chopped/opened items independently of shopping and cooking completion.

<a id="hf-109"></a>
**HF-109 · P1 · Proposal — Support recipe 'pause' without losing position**

Acceptance: Reopen the same step, completed steps and running timers; distinguish pausing work from safely holding cooked food.

<a id="hf-110"></a>
**HF-110 · P1 · Proposal — Add quick manual step notes**

Acceptance: Users can record a substituted amount or timing while cooking; preserve original source recipe.

<a id="hf-111"></a>
**HF-111 · P1 · Proposal — Provide 'why this step?' food-science explanations**

Acceptance: Explain rinsing beans, roasting, rice cooling, reheating and vitamin C with plant iron, supported by sources.

<a id="hf-112"></a>
**HF-112 · P1 · Proposal — Allow easy unit display without reinterpreting measures**

Acceptance: Use grams/mL as source of truth and show teaspoons/cups only as approximate compatible assistance.

<a id="hf-113"></a>
**HF-113 · P1 · Proposal — Add hands-free next/back where supported**

Acceptance: Voice or large touch controls are optional, local-first and should never execute unsafe steps automatically.

<a id="hf-114"></a>
**HF-114 · P2 · Proposal — Offer staged ingredient prep sequence**

Acceptance: Group vegetables, sauce, grains and toppings by cutting-board use, cross-contact needs and time.

<a id="hf-115"></a>
**HF-115 · P2 · Proposal — Create a one-page printable cook sheet**

Acceptance: Print scaled amounts, parallel timeline, timers and food-safety checks with no promotional navigation.

<a id="hf-116"></a>
**HF-116 · P2 · Proposal — Provide verified cooking photos and alt text**

Acceptance: Use genuine step visuals only where helpful; avoid generated images that misrepresent doneness/food safety.

### 9. Simultaneous timers and phone behaviour (12)

<a id="hf-117"></a>
**HF-117 · P0 · Confirmed — Treat countdown completion as advisory only**

Acceptance: Never claim timed minutes guarantee doneness; continue showing food-temperature and texture checks.

<a id="hf-118"></a>
**HF-118 · P1 · Proposal — Surface running/paused/completed timer counts globally**

Acceptance: Keep all timer badges accessible in a step, planner and shopping without covering bottom navigation.

<a id="hf-119"></a>
**HF-119 · P1 · Proposal — Validate timers after device clock changes**

Acceptance: Use wall-clock deadline plus observed monotonic reconciliation where possible; warn if user-adjusted clock creates a large jump.

<a id="hf-120"></a>
**HF-120 · P1 · Proposal — Add deliberate background/phone-lock instructions**

Acceptance: On Android provide Clock fallback for unattended cooking; do not promise service-worker alarms.

<a id="hf-121"></a>
**HF-121 · P1 · Proposal — Add optional wake-lock with visible state**

Acceptance: Request only after user action, explain battery drain and release when cooking mode closes.

<a id="hf-122"></a>
**HF-122 · P1 · Proposal — Offer audible/vibration alerts when page foregrounded**

Acceptance: Respect autoplay permissions, accessible settings and reduced-distraction preferences; never assume OS will deliver while locked.

<a id="hf-123"></a>
**HF-123 · P1 · Proposal — Allow named custom timers beyond recipe steps**

Acceptance: One labelled countdown per saucepan or oven tray with maximum count and safe defaults.

<a id="hf-124"></a>
**HF-124 · P1 · Proposal — Prevent duplicate running timers accidentally**

Acceptance: One timer per recipe/step unless user deliberately creates another; re-entry should resume rather than silently reset.

<a id="hf-125"></a>
**HF-125 · P1 · Proposal — Create timer expiry history**

Acceptance: Record completed timestamps and dismissals without confusing an expired timer with newly cooked food.

<a id="hf-126"></a>
**HF-126 · P1 · Proposal — Add grouped alerts for overlapping expiry**

Acceptance: Multiple completions announce each label clearly and avoid endless repeated alerts.

<a id="hf-127"></a>
**HF-127 · P2 · Proposal — Test close/reopen/tab visibility and storage failure**

Acceptance: Cross-browser tests for independent pauses, reset, negative time, clock drift, timer ID migration and private browsing storage denial.

<a id="hf-128"></a>
**HF-128 · P2 · Proposal — Support multi-step kitchen schedule without overlapping impossible tasks**

Acceptance: Suggest sequencing based on single cook versus two cooks, equipment and preheat.

### 10. Freezer inventory and cooked-batch records (10)

<a id="hf-129"></a>
**HF-129 · P1 · Proposal — Create per-container freezer records**

Acceptance: Store recipe/version, cooked date, batch ID, portions, container grams and best-use information.

<a id="hf-130"></a>
**HF-130 · P1 · Proposal — Maintain FIFO meal suggestions**

Acceptance: Show oldest safely stored batch first without making a blanket guarantee about temperature or shelf life.

<a id="hf-131"></a>
**HF-131 · P1 · Proposal — Attach cook-trial notes to a dated batch**

Acceptance: Current local log is per recipe; support multiple historical cook-ups rather than one overwriteable record.

<a id="hf-132"></a>
**HF-132 · P1 · Proposal — Record microwave wattage and real reheat results**

Acceptance: Use observed method and portion weight, don't publish universal 'three minute' reheating certainty.

<a id="hf-133"></a>
**HF-133 · P1 · Proposal — Provide a freezer capacity estimator**

Acceptance: Calculate rough container count and space needed, clearly marking estimates until actual box measurements.

<a id="hf-134"></a>
**HF-134 · P1 · Proposal — Offer thaw-this-evening preparation reminders**

Acceptance: Optional user-initiated reminders based on planned meal and fridge defrost timing.

<a id="hf-135"></a>
**HF-135 · P1 · Proposal — Track reheat-once status for rice**

Acceptance: A clear 'reheated once' mark helps prevent storing and heating cooked rice again.

<a id="hf-136"></a>
**HF-136 · P2 · Proposal — Save a printable label with QR or short ID**

Acceptance: Open a local recipe/batch record without user accounts or public health data.

<a id="hf-137"></a>
**HF-137 · P2 · Proposal — Export individual cook logs**

Acceptance: Download private text/CSV/JSON to compare taste, cost, texture and yield without uploading.

<a id="hf-138"></a>
**HF-138 · P2 · Proposal — Warn when a batch is untested**

Acceptance: New recipe should be 'planned' until a real cook-up record exists, not display a misleading cooking success badge.

### 11. Mobile design, accessibility and clarity (14)

<a id="hf-139"></a>
**HF-139 · P0 · Confirmed — Audit WCAG 2.2 AA across real states**

Acceptance: Check not only landing page but modal, nested timers, forms, errors, calendar and shopping filters with axe and manual keyboard/AT.

<a id="hf-140"></a>
**HF-140 · P1 · Proposal — Fix small-width and text-zoom overflow systematically**

Acceptance: Test 320/360/390/430 px, 200% and 400% text zoom, not CSS clipping as a substitute.

<a id="hf-141"></a>
**HF-141 · P1 · Proposal — Build consistent modal focus trapping and return**

Acceptance: Escape/close, screen-reader labels, modal heading and focus restoration must work for timer dashboard and nested controls.

<a id="hf-142"></a>
**HF-142 · P1 · Proposal — Make sticky controls avoid hiding content**

Acceptance: Check iOS safe-area insets, bottom browser chrome, keyboard popup and 320px landscape.

<a id="hf-143"></a>
**HF-143 · P1 · Proposal — Larger one-hand cooking controls**

Acceptance: Target comfortable touch sizes, generous spacing and optional always-visible next/back actions.

<a id="hf-144"></a>
**HF-144 · P1 · Proposal — Accessible timer alerts**

Acceptance: Polite and assertive announcement design; visual colour alone must not indicate expired/paused states.

<a id="hf-145"></a>
**HF-145 · P1 · Proposal — Accessible shopping group controls**

Acceptance: Label checkbox quantity and actual product; allow bulk actions with undo and avoid ambiguous 'have' state.

<a id="hf-146"></a>
**HF-146 · P1 · Proposal — Respect reduced-motion and high-contrast modes**

Acceptance: Test with OS preferences, colour-blind palettes and avoid gratuitous animations.

<a id="hf-147"></a>
**HF-147 · P1 · Proposal — Support clear 'empty/error/loading' states**

Acceptance: Explain no recipes, no stock, unknown nutrient values, missing browser data and offline loading rather than silent failure.

<a id="hf-148"></a>
**HF-148 · P1 · Proposal — Make ingredient measures readable in bright kitchens**

Acceptance: High-contrast typography, numbers, units, adequate line length and tabular numerals.

<a id="hf-149"></a>
**HF-149 · P2 · Proposal — Add novice-versus-compact cooking display**

Acceptance: Novice gets full descriptions and safety cues, experienced cooks see short checklist without losing key warnings.

<a id="hf-150"></a>
**HF-150 · P2 · Proposal — Add a searchable recipe index with correct filters**

Acceptance: Filters for meal type, dairy-free/GF label status, allergens, total time, cost and freezer compatibility.

<a id="hf-151"></a>
**HF-151 · P2 · Proposal — Improve print modes and contrast**

Acceptance: Recipe, date planner, stock list and batch labels print with precise units and citations.

<a id="hf-152"></a>
**HF-152 · P2 · Proposal — Review editorial language for certainty and accessibility**

Acceptance: Avoid 'perfect', shame language and specialist jargon without explanations.

### 12. Offline readiness, storage and data ownership (13)

<a id="hf-153"></a>
**HF-153 · P1 · Confirmed — Treat private local state as fragile, not permanent**

Acceptance: Describe browser-cache and storage-clearing risk; optional export/import for plans, pantry, timers and cook logs.

<a id="hf-154"></a>
**HF-154 · P1 · Proposal — Add installable PWA manifest and offline core-shell cache**

Acceptance: After first visit, recipes, local images/assets and basic cooking steps should remain accessible offline; do not claim a first offline visit works.

<a id="hf-155"></a>
**HF-155 · P1 · Proposal — Version localStorage schemas with migrations**

Acceptance: Validate old recipe IDs and product records; preserve old schedules and provide rollback/export.

<a id="hf-156"></a>
**HF-156 · P1 · Proposal — Provide explicit private-data controls**

Acceptance: Export, import, erase each collection separately and erase all with confirmation; do not silently remove user entries.

<a id="hf-157"></a>
**HF-157 · P1 · Proposal — Audit external requests and third-party fonts**

Acceptance: Document Google Fonts/retailer link requests and provide privacy-friendly local fallbacks where licensing allows.

<a id="hf-158"></a>
**HF-158 · P1 · Proposal — Sanitise imported JSON and user-edited notes**

Acceptance: Apply schema, size caps, HTML escaping and URL allowlists; add malicious-value regression tests.

<a id="hf-159"></a>
**HF-159 · P1 · Proposal — Use safe product-link handling**

Acceptance: External links rel=noopener/noreferrer, validate schemes, and avoid hard-coded untrusted HTML injection.

<a id="hf-160"></a>
**HF-160 · P1 · Proposal — Add offline shopping and cook-trial save indicator**

Acceptance: When browser storage is unavailable, report failure clearly rather than showing a false success.

<a id="hf-161"></a>
**HF-161 · P1 · Proposal — Avoid external analytics by default**

Acceptance: No accounts, ads, user tracking, precise location or medical data upload without specific opt-in and purpose.

<a id="hf-162"></a>
**HF-162 · P1 · Proposal — Create deterministic backup snapshot format**

Acceptance: Include schema version, export date and item count with checksum; support dry-run import preview.

<a id="hf-163"></a>
**HF-163 · P2 · Proposal — Offer cross-device migration without a cloud account**

Acceptance: Manual file or QR transfer where small enough, explaining privacy risks and limits.

<a id="hf-164"></a>
**HF-164 · P2 · Proposal — Support browser low-memory recovery**

Acceptance: Restore plan and cooking step after reload/crash while timers keep truthful elapsed time.

<a id="hf-165"></a>
**HF-165 · P2 · Proposal — Prepare a transparent privacy and offline behaviour page**

Acceptance: Explain that localStorage stays per-domain (Render, Vercel and GitHub Pages do NOT automatically share progress).

### 13. Engineering architecture and code quality (14)

<a id="hf-166"></a>
**HF-166 · P0 · Confirmed — Correct or remove broken AFCD probe workflow reference**

Acceptance: .github/workflows/afcd3-probe.yml references scripts/afcd3_explore.py absent from current repository tree; add and test script or disable workflow with explanation.

<a id="hf-167"></a>
**HF-167 · P1 · Proposal — Introduce typed recipe, ingredient, SKU and nutrient schemas**

Acceptance: JSON Schema or TypeScript types with runtime validation; fail build on invalid units and missing IDs.

<a id="hf-168"></a>
**HF-168 · P1 · Proposal — Consolidate duplicated legacy recipe versions safely**

Acceptance: Keep historical archives immutable but designate one current canonical source of truth and use generated docs/views.

<a id="hf-169"></a>
**HF-169 · P1 · Proposal — Stop mixing source data and view HTML string assembly**

Acceptance: Move into testable modules with safe rendering and explicit selectors; mitigate accidental DOM insertion bugs.

<a id="hf-170"></a>
**HF-170 · P1 · Proposal — Implement a single units-and-conversions service**

Acceptance: Safe ml/g/tin/piece/serving conversions with measurement basis and provenance; reject ambiguous conversions.

<a id="hf-171"></a>
**HF-171 · P1 · Proposal — Add a reproducible build script**

Acceptance: Lock runtime tooling and produce only public static assets, not all GitHub research archives.

<a id="hf-172"></a>
**HF-172 · P1 · Proposal — Add dependencies/version pinning**

Acceptance: Use package lockfiles for Playwright and any new tools to prevent 'works yesterday' CI drift.

<a id="hf-173"></a>
**HF-173 · P1 · Proposal — Separate price, ingredient, recipe and calendar databases**

Acceptance: Data versioning prevents price updates altering historical cooked recipes or nutrition claims.

<a id="hf-174"></a>
**HF-174 · P1 · Proposal — Test event-listener lifecycle**

Acceptance: Repeated modal/recipe rerenders must not attach duplicate handlers or leak state.

<a id="hf-175"></a>
**HF-175 · P1 · Proposal — Set a performance budget**

Acceptance: Profile initial JS, CSS, fonts, image payload and time to interactive on average Android hardware.

<a id="hf-176"></a>
**HF-176 · P1 · Proposal — Lint code, data and Markdown**

Acceptance: ESLint, Prettier (or equivalent), broken link checker and JSON/schema checks run in CI.

<a id="hf-177"></a>
**HF-177 · P2 · Proposal — Add migration/deprecation contract**

Acceptance: Deprecate old fields with converters and tests rather than rewriting old local save data.

<a id="hf-178"></a>
**HF-178 · P2 · Proposal — Use single-source derived counts and totals**

Acceptance: Recipe counts, shopping item totals and explanatory prose should be computed from data not manually copied.

<a id="hf-179"></a>
**HF-179 · P2 · Proposal — Add source comments for every critical food-safety constant**

Acceptance: Store authority URL, review date and value in testable constants.

### 14. Testing, quality assurance and operational reliability (16)

<a id="hf-180"></a>
**HF-180 · P0 · Confirmed — Test Render production as well as Vercel**

Acceptance: Current browser-smoke production job targets only healthi­est-food.vercel.app; verify Render backup and canonical hash after GitHub push.

<a id="hf-181"></a>
**HF-181 · P0 · Confirmed — Avoid interpreting green CI as live deployment**

Acceptance: Compare exact GitHub SHA with Render/Vercel/GitHub Pages reported deployed SHAs, verify page assets and key flows.

<a id="hf-182"></a>
**HF-182 · P1 · Proposal — Add cross-browser scenario coverage for all 17 meals**

Acceptance: Every recipe can open, scale, start, save notes and show ingredient totals without JS errors.

<a id="hf-183"></a>
**HF-183 · P1 · Proposal — Test cross-component substitutions**

Acceptance: Changing tofu/fish affects nutrition, shopping, warning and scale values together.

<a id="hf-184"></a>
**HF-184 · P1 · Proposal — Test 2026/2027 Sydney DST and day rollover**

Acceptance: Explicit fixture for October clock change, April clock change, leap years, Saturday midnight and travel timezone.

<a id="hf-185"></a>
**HF-185 · P1 · Proposal — Simulate browser storage disabled/full**

Acceptance: Planner, cooking logs, pantry and timer state must announce save failures clearly.

<a id="hf-186"></a>
**HF-186 · P1 · Proposal — Test offline PWA flow**

Acceptance: Cache reset/first visit/return offline, missing font fallback and no network while cooking.

<a id="hf-187"></a>
**HF-187 · P1 · Proposal — Add automatic accessibility scans**

Acceptance: axe, keyboard-only and landmark/button name checks on every major route and modal state.

<a id="hf-188"></a>
**HF-188 · P1 · Proposal — Audit ingredient and pack conversion invariants**

Acceptance: Property-based tests for unit conversions, rounding, pack leftovers and negative/invalid amounts.

<a id="hf-189"></a>
**HF-189 · P1 · Proposal — Test unsafe cooking edge cases**

Acceptance: Reheat once, raw fish temperature, broken thermometer, stale food date, freezer too warm and at-risk setting warnings.

<a id="hf-190"></a>
**HF-190 · P1 · Proposal — Use real viewport screenshots as regression baselines**

Acceptance: Cover narrow Android, iOS WebKit, tablet, desktop, font zoom and bottom navigation.

<a id="hf-191"></a>
**HF-191 · P1 · Proposal — Test hosting failover explicitly**

Acceptance: Verify direct access to Render during Vercel limit, independent asset paths and localStorage migration warning.

<a id="hf-192"></a>
**HF-192 · P1 · Proposal — Check missing product and source links periodically**

Acceptance: Link failures should create an issue/task, not silently substitute unsupported product data.

<a id="hf-193"></a>
**HF-193 · P2 · Proposal — Publish transparent release validation matrix**

Acceptance: For each release distinguish source lint, unit tests, local-browser tests, live browser and real-food testing.

<a id="hf-194"></a>
**HF-194 · P2 · Proposal — Add small canary deployment checks**

Acceptance: After host deploy confirm main HTML, scripts, CSS, recipe count and no console errors.

<a id="hf-195"></a>
**HF-195 · P2 · Proposal — Test cleanup and unused code**

Acceptance: Review inherited CSS, duplicate styles and dead routes without deleting archival science/history.

### 15. Deployments, backups, security and observability (12)

<a id="hf-196"></a>
**HF-196 · P0 · Confirmed — Show current deployment commit per host**

Acceptance: Render site exists and auto-deploys; display Render, Vercel, GitHub Pages commit/version, last checked, status and source link, without misleading "live" badges.

<a id="hf-197"></a>
**HF-197 · P1 · Proposal — Use Render as independently monitored backup**

Acceptance: Make Render health test and smoke suite first-class; show a link to its build/deploy dashboard.

<a id="hf-198"></a>
**HF-198 · P1 · Proposal — Ensure GitHub Pages genuinely builds and is tested**

Acceptance: Workflow exists, but availability, correct branch and URL should be independently verified before presenting it as working.

<a id="hf-199"></a>
**HF-199 · P1 · Proposal — Handle Vercel quota failures gracefully**

Acceptance: Production-readiness summary should not imply Vercel caught up when an API limit prevents deployment.

<a id="hf-200"></a>
**HF-200 · P1 · Proposal — Avoid publishing whole repository at static root**

Acceptance: Render publishPath '.' and GitHub Pages artifact '.' may serve documentation/test fixtures; generate a minimal dist/ public directory.

<a id="hf-201"></a>
**HF-201 · P1 · Proposal — Add baseline security headers on hosts**

Acceptance: CSP where compatible, Referrer-Policy, X-Content-Type-Options, cache policy and safe external link behaviour.

<a id="hf-202"></a>
**HF-202 · P1 · Proposal — Verify DNS, TLS and HTTP every release**

Acceptance: Check actual public routes/resources, not merely provider 'deploy live' state.

<a id="hf-203"></a>
**HF-203 · P1 · Proposal — Add deployment rollback instructions**

Acceptance: Document last known good Git SHA and backup host, with non-destructive rollback steps.

<a id="hf-204"></a>
**HF-204 · P1 · Proposal — Show an optional in-app environment/version diagnostics dialog**

Acceptance: Expose deployed build ID and migration warnings, without collecting user-identifying analytics.

<a id="hf-205"></a>
**HF-205 · P2 · Proposal — Monitor meaningful outages and content failures**

Acceptance: Optional low-frequency checks for 5xx, missing files and stale deployment SHA with notifications only on changes.

<a id="hf-206"></a>
**HF-206 · P2 · Proposal — Separate staging from production**

Acceptance: Test changed data/recipes in preview branch before putting untested food-safety claims on main.

<a id="hf-207"></a>
**HF-207 · P2 · Proposal — Manage service costs and limits**

Acceptance: Document free/paid plan constraints, build minutes, frequency and storage without silently upgrading billing.

### 16. Research, sourcing and editorial governance (12)

<a id="hf-208"></a>
**HF-208 · P0 · Confirmed — Give every health claim a source and verification grade**

Acceptance: Not all ingredient and timing statements are measured facts; support an evidence ledger linking assertion to source, date, population and uncertainty.

<a id="hf-209"></a>
**HF-209 · P1 · Proposal — Add dated product-label snapshots**

Acceptance: Store label panel, ingredient list, warnings and observed date for each SKU; distinguish retailer page from photograph of actual pack.

<a id="hf-210"></a>
**HF-210 · P1 · Proposal — Review source links for currency**

Acceptance: Link directly to FSANZ, NHMRC, Heart Foundation and NSW pages; replace outdated links after explicit check.

<a id="hf-211"></a>
**HF-211 · P1 · Proposal — Track contested or uncertain claims openly**

Acceptance: Include 'not tested in these recipes' for PREDIMED, Blue Zones, fasting and observational longevity associations.

<a id="hf-212"></a>
**HF-212 · P1 · Proposal — Annotate original/updated recipe versions**

Acceptance: Show why V6 changed V5, what is actually better and what remains theoretical; keep rollback.

<a id="hf-213"></a>
**HF-213 · P1 · Proposal — Build scientific correction log**

Acceptance: When a label or guideline is wrong, document correction and affected app pages and tests.

<a id="hf-214"></a>
**HF-214 · P1 · Proposal — Add a product-label freshness review cadence**

Acceptance: Flag old price/label observations for recheck without making unapproved external network requests in the user app.

<a id="hf-215"></a>
**HF-215 · P1 · Proposal — Separate expert sign-off from AI-generated claims**

Acceptance: Require independent dietitian/food-safety review before 'clinically verified' badge could ever appear.

<a id="hf-216"></a>
**HF-216 · P1 · Proposal — Show method of comparison for nutritional suggestions**

Acceptance: State baseline food, serving, unit, intended outcome, uncertainty and trade-offs.

<a id="hf-217"></a>
**HF-217 · P2 · Proposal — Use PubMed/primary research for mechanistic or timing claims**

Acceptance: Distinguish cohort associations, surrogate markers and hard endpoints; avoid implying proven additional lifespan.

<a id="hf-218"></a>
**HF-218 · P2 · Proposal — Make citation links accessible during cooking**

Acceptance: Short 'why?' explanations open exact sources without blocking the current cooking step.

<a id="hf-219"></a>
**HF-219 · P2 · Proposal — Create a public corrections issue template**

Acceptance: Users can report wrong pack size, unsafe wording or source mismatch with reproducible information.

### 17. Household usefulness, sustainability and carefully scoped additions (12)

<a id="hf-220"></a>
**HF-220 · P1 · Proposal — Add a 'minimum effort' weekly mode**

Acceptance: Three main meals and optional snacks with the lowest cooking complexity; it should be selectable, not a rigid wellness target.

<a id="hf-221"></a>
**HF-221 · P1 · Proposal — Compare true repeat-shop versus first-shop cost**

Acceptance: Pantry leftovers, packaging and meal yields change per-serve spending; show both estimates honestly.

<a id="hf-222"></a>
**HF-222 · P1 · Proposal — Improve weekly cash-flow planning**

Acceptance: Optional hard budget cap, cheapest suitable brands and an explanation when nutrition or allergen options increase price.

<a id="hf-223"></a>
**HF-223 · P1 · Proposal — Build food waste reduction reports**

Acceptance: Track actual expired/unconsumed portions and missed cooking commitments, without guilt framing.

<a id="hf-224"></a>
**HF-224 · P1 · Proposal — Calculate greenhouse/resource impacts cautiously**

Acceptance: Use transparent approximate factors when credible, never treat environmental benefit as proof of personal health.

<a id="hf-225"></a>
**HF-225 · P1 · Proposal — Offer practical all-ages family cooking steps**

Acceptance: Identify optional child participation tasks and raw-fish/hot-pan restrictions; don't infer suitable child portions.

<a id="hf-226"></a>
**HF-226 · P2 · Proposal — Plan alongside local seasonal supply**

Acceptance: Dubbo seasonal fruit/vegetable substitutions with measured edible weights and current product availability where checked.

<a id="hf-227"></a>
**HF-227 · P2 · Proposal — Add equipment inventory**

Acceptance: User can note oven capacity, saucepan volume, scale, thermometer and containers; avoid recommending equipment they lack.

<a id="hf-228"></a>
**HF-228 · P2 · Proposal — Add fridge/freezer space preview**

Acceptance: Estimate total container volume, permit manual correction, and warn before overloading storage.

<a id="hf-229"></a>
**HF-229 · P2 · Proposal — Support leftovers-to-next-recipe suggestions**

Acceptance: Suggestions depend on known safe storage state and ingredients, not arbitrary same-name reuse.

<a id="hf-230"></a>
**HF-230 · P2 · Proposal — Offer optional shopping reminder after planning**

Acceptance: Only if explicitly requested, with date/time and no unrequested background monitoring.

<a id="hf-231"></a>
**HF-231 · P3 · Proposal — Build retailer-independent export adapters**

Acceptance: Once canonical products and live-price legality are solved, support Coles/Aldi comparisons as optional research without losing Woolworths focus.


## Implementation rules (all changes)

1. **Inspect first.** Search existing code and archives, and check live GitHub/Render/Vercel revisions so this backlog does not duplicate work already completed concurrently.
2. **Small PR/commit units.** Prefer one cohesive safety or correctness improvement at a time with acceptance tests, data migration details and evidence.
3. **Never invent verification.** Woolworths listing ≠ current Dubbo stock/price; browser tests ≠ physical cook-up; coagulant ≠ measured calcium; daily unknown nutrients ≠ deficiencies.
4. **Keep private data private.** Plans, nutrition-related preferences, timers, pantry and cook logs stay local unless a user knowingly opts in to transfer them.
5. **Separate unit, browser, live deploy and kitchen test states.** Host readiness and a successful Git SHA are independent of taste, texture, nutrient sufficiency and safe cooling.
6. **Do not fabricate 100/100.** If scoring is useful, score reproducible software acceptance checks; never assign a validated longevity score to a single recipe.
7. **Hold the line on accessibility and simplicity.** An option is only useful if it can be found and understood while cooking, and is worth the added maintenance.
8. **For developer hand-offs**, use the companion machine-readable [CSV](IMPROVEMENT_BACKLOG_2026-10-17.csv); preserve IDs. `HF-001` is a backlog ID, not a GitHub Issue number.

## Out of scope until evidence or explicit request

Prescriptions, clinical diagnosis, supplement dosing, weight-loss enforcement, misleading calorie or longevity scores, unsupported store scraping, mandatory accounts and tracking, child-specific nutritional advice without qualified assessment, and automatic claims that a packed meal is safe for an immunocompromised diner.

## Maintenance protocol

Review monthly or when key label/guideline changes occur. Mark items as `proposed → in progress → tested → deployed → kitchen verified` as appropriate; add commit, browser run, relevant source and changed recipe IDs. Don't rewrite historical audit or quietly remove a previously documented limitation.
