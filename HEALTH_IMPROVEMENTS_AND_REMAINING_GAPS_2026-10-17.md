# HealthiestFood — implementation and evidence audit (17 Oct 2026, AEDT)

**Mission:** implement corrections arising from the site's nutrition, convenience and safety review. **Status: substantial improvements shipped; not all work is complete.** The site cannot be proved "the healthiest food possible" and there is no universally validated longevity meal score.

## Implemented in site code

1. **Scaled guided cooking instructions:** added `recipe-scale.js` and wired it into cook mode. Numeric batch weights in grams, millilitres and spoon measures are adjusted when portions change, while minutes/temperatures and explicit per-serving values are not intentionally scaled. The cooking screen warns that English words, single-piece amounts, container sizes and heating times may still need adjustment; for highest safety use **original-size batches**. The measured ingredient checklist remains the primary quantitative source. Automated tests protect example raw-fish per-piece amounts and walnut toppings.
2. **Plan-dependent shopping:** added `food-shopping.js` and integrated it with the dated planner. Select a day or week; sums chosen recipes at selected portions, groups matching product/units and estimates retail packs only for products with explicitly listed historical prices and pack yields. Unmatched ingredients are **unpriced**, not assumed to cost $0 or be available. Includes a local-only "Already have" pantry tick and a copyable shopping list. The existing static 20-lunch basket remains for the four full V6 batches and is **not** replaced by the dynamic week basket.
3. **Fish across the week:** a planner note counts fish-containing meal slots (sardines, salmon bowls, salmon dinner), NOT automatically the edible standard serves eaten by one person. Fish from outside the planner matters.
4. **Nutrition uncertainty:** added `nutrition-coverage.js` to the science page: four V6 label-based **partial protein subtotals** and a comparison between So Good High Protein Soy and Vitasoy Protein Plus Unsweetened per 250 mL (with unknown vitamins **shown as unknown**, not zero). The page states which *complete-day* micronutrients and total energy remain uncalculated.
5. **No misleading perfect score:** previous subjective /100 scores remain available only as historical expandable detail, not central evidence of longevity.
6. **Breakfast protein improvement:** avocado/chickpea toast documentation now suggests a verified optional 250 mL calcium-fortified high-protein soy side where useful, without silently adding its price or nutrients into the planned recipe.
7. **Validation:** new `tests/health-improvements.test.cjs` checks scaling, unchanged cooking temperatures/timing, item reconciliation, unpriced unknowns, fortified soy data and wiring. The GitHub workflow includes new module paths.

## Scientific source provenance

- [FSANZ Australian Food Composition Database Release 3 — download files](https://www.foodstandards.gov.au/science-data/food-nutrient-databases/afcd/data-files): official food details and nutrient tables, including 58 core nutrients over 1,588 foods. **Not yet downloaded/mapped to the 17 recipe ingredient records**. Until ingredients, product nutrition panels, edible/drained yields and cooking retention factors are reconciled, full-recipe and day nutrient totals **must remain unknown**.
- [So Good High Protein Soy manufacturer label](https://sogood.com.au/products/soy-milks/Soy-High-Protein-1L): per 250 mL, **10 g protein, 400 mg calcium, 1 µg B12, 5 µg vitamin D**, energy 156 kcal, 163 mg sodium. Contains cane sugar/maltodextrin; gluten listed as not detected.
- [Vitasoy Protein Plus Unsweetened manufacturer label](https://soy.com.au/product/soy-milk-protein-plus/): **10.5 g protein, 300 mg calcium, 135 kcal**, 100 mg sodium per 250 mL. B12 and vitamin D are **not quantified in the currently linked label**. Fewer additives do not automatically make it better for longevity; fortification can matter more.
- [Australian Nutrient Reference Values](https://www.eatforhealth.gov.au/nutrient-reference-values): for most adults 19–50, calcium 1,000 mg/day, iodine 150 µg/day, B12 2.4 µg/day (requirements differ by life stage; not a daily plan prescription).
- [NSW Food Authority leftovers](https://www.foodauthority.nsw.gov.au/consumer/food-extra-care/leftovers): shallow cooling and fridge/freezer within 2 hours, fridge under 5°C, rice ≤2 refrigerated days, leftovers ≤3 days, freeze up to 3 months, reheat steaming hot (at least 60°C), rice/pasta only once. [Other NSW entertaining-home guidance](https://www.foodauthority.nsw.gov.au/consumer/food-safety-home/entertaining-home) recommends 75°C reheating and warns against overloading the fridge. A probe and adequate cooling capacity are sensible where practical.
- [Heart Foundation — healthy eating pattern](https://www.heartfoundation.org.au/healthy-living/healthy-eating/heart-healthy-eating-pattern): variety across plant foods, wholegrains, legumes, fish, nuts and unsaturated fats; no one ingredient or meal clock is a scientifically proven life-extension optimum.

## Known unfinished tasks (do not claim these are complete)

| Category | Remaining work | Why it matters |
|---|---|---|
| **Complete nutrient analysis** | Obtain FSANZ AFCD Release 3 spreadsheets, match all 17 recipes ingredient-by-ingredient, reconcile product labels, cooking retention/yield, missing values; compute daily/weekly amounts and confidence bands | Can't make evidence-based adequacy or clinical deficiency claims yet |
| **Shopping checkout** | Authenticate/select a real Dubbo Woolworths store, verify all 17 recipes' live pack sizes, shelf prices, stock and substitution availability | Only historical/estimated prices are displayed; dynamic "known cost" is **not full cart cost** |
| **Recipe scaling verification** | Audit every unusual amount phrase (worded quantities, per-piece counts) and test batches with physical pans; do not assume the automatic prose parser resolves them all | Avoid wrong instructions when doubling/halving |
| **Kitchen trial** | Prepare at least one portion of each new meal, record taste, finished edible yields, temperature, freezer texture and genuine household appetite | Cannot be achieved remotely through software or research |
| **Personal nutritional adequacy** | Optional professional dietary assessment when individual requirements or health restrictions warrant it | Adult population NRVs don't automatically match every individual |
| **Full mobile E2E** | Playwright tests in real Android/iOS-compatible browsers for planner, shopping checkboxes, browser reload, all cooking steps and overlapping timers | Automated JS tests alone do not prove full device compatibility |

## Why the tool does not claim 100/100

There is no evidence of a single perfect recipe that maximises lifespan for every person. V6's four lunches remain a strong nutrient-dense pattern, but no trial tested these exact meals and nothing justifies numerical longevity improvement from V5 or V6. The practical priority is sufficient daily dietary variety, a trustworthy pantry/shop process, careful cooking, comfort, affordability and repeated enjoyment.

## Developer verification

Run `node --test tests/*.test.cjs`. New modules must stay loaded in the following order: `site-data.js`, `whole-day-data.js`, `recipe-scale.js`, `nutrition-coverage.js`, `app.js`, `food-shopping.js` before `food-planner.js` (exact relative position before `app.js` or `food-planner.js` matters). Ensure no new unit converter merges a 420 g **gross can** directly with 420 g **drained legumes**. Existing 20-lunch basket remains fixed at $256.43 **historical estimate**, not a guaranteed live checkout.
