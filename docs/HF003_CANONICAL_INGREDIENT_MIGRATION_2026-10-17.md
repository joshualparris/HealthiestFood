# HF-003: Canonical ingredient identity — implemented in app code

**Date:** 17 October 2026 (Australia/Sydney)  
**Primary code:** [ingredient-catalogue.js](../ingredient-catalogue.js)  
**Regression tests:** [ingredient-catalogue.test.cjs](../tests/ingredient-catalogue.test.cjs) and [browser smoke journey](../e2e/smoke.cjs)  
**Status:** Implemented for the currently published **17 recipes**; does not imply every package label, weight conversion or substitution has been verified.

## Why this exists

Prior versions used 151 independent `[amount, unit, displayName]` tuples, unverified product regexes and multiple different per-tin conversions. A text rename could change shopping estimates, nutrient source mapping or pantry deductions without intending it. This creates a hidden, exact-version identity layer **without overwriting** the historical recipes or existing browser storage.

| Scope | Result |
|---|---:|
| Existing recipe IDs | 17 preserved |
| Ingredient quantity lines | 151 preserved and explicitly mapped |
| Distinct exact unit/label combinations | 99 |
| Stable canonical ingredient identities | 62 |
| Existing `[amount, unit, name]` tuples | Preserved byte-for-byte as data |
| New attached records | `recipe.ingredientRecords` (non-enumerable, derived at load) |
| Persisted local storage | Unchanged, no destructive migration |
| Shopping/ingredient matching | Exact `(unit, label) → canonical ID → linked candidate SKU` for every built-in line |
| AFCD generic reference | `canonicalId → food ID(s) + share` with explicit proxy notes |
| Allergen summary | Family-level flags and label-check uncertainty, **not allergen clearance** |

## Public API and model

Each stable catalogue entry holds its ID, explicit pairs of source unit and label, optional precise Woolworths SKU, independent candidate shopping-key, product-family allergen flags, `mayContain` review flags, and optionally linked AFCD3 generic foods with provenance notes.

`window.FoodIngredients.resolve("dry brown rice","g")` returns `grain-brown-rice-dry`. A request to interpret `"dry brown rice"` as `"mL"` returns null. Exact input matching is deliberate; neither nicknames nor fuzzy names silently cross unit/physical-state boundaries.

`FoodIngredients.apply(FOOD_DATA.recipes)` validates all built-in recipes and attaches one immutable `ingredientRecords` array to each recipe. Each record has `id, amount, unit, label, sku, allergens, mayContain, shoppingKey`. It is deliberately **not enumerable**, so JSON-serialised legacy recipe arrays, saved plans, portions, progress and cooking logs stay unchanged. This is a compatibility projection, not an unreviewed mass rewrite of existing recipe archives.

### Crucial identity distinctions

- **Ocean Chef coho** is `fish-salmon-coho`; a generic salmon fillet is `fish-salmon-generic`. No forced Ocean Chef price or SKU for the generic product.
- **Evergreen branded hard tofu** is `protein-tofu-evergreen`; generic firm tofu is `protein-tofu-generic`. Branded product nutrient values and optional pricing are not silently claimed for generic tofu.
- Canned **black beans** use the published 225g per tin as a *provisional label-serving yield*; actual physical drained mass could differ. Chilled/frozen, dry/cooked, gross/drained and unknown per-piece conversions require HF-004 review.
- `grain-quinoa-dry` joins dry plain, white and plain quinoa labels; dry grain quantity remains distinct from any cooked weight.
- Whole lemon and lemon juice have **different** canonical IDs, so count-of-fruits cannot be automatically treated as mL.
- Fresh and frozen spinach, cherry and ordinary tomatoes, raw vs mixed frozen broccoli/cauliflower, frozen versus unspecified berries and specific versus unspecified nut butter remain separate identities where the evidence does not permit equivalence.

## Integration

1. **Recipes / cooking:** `ingredientRecords` attaches to all 151 built-in ingredient tuples without modifying their displayed amounts. The existing structured step ingredient allocation in `recipe-methods.js` keeps its numeric ingredient index contract.
2. **Shopping:** `food-shopping.lookup(name,unit)` resolves known catalogued ingredients by ID and declared shopping key *before* any outside-recipe compatibility fallback. A generic food with no reviewed matching SKU is **unpriced**, not assigned a specific brand by word similarity. `merge()` adds `ingredientId` and `productSku` to each purchase row.
3. **Pantry:** historical candidate pack keys (such as `walnuts`, `oil`, `chickpeas`) remain unchanged. Newly catalogued unpriced ingredients group under `ing:<canonicalId>:<unit>`, with `legacyKeys` preserving older `unit|label` pantry observations. Reconciliation reads legacy observations without deleting any; where multiple aliases have values, the **maximum** is used rather than adding values and accidentally counting the same stock twice. The new canonical key takes priority where provided. Historical `good-food-planned-have-v1` remains readable by both custom shopping and the day/week planner.
4. **Nutrition:** `whole-day-analysis.js` uses the registry's explicit AFCD crosswalk for every known recipe ingredient instead of its previous regex chain. Branded figures override generic nutrient data where appropriate; candidate store-label substitutions explicitly say the SKU is unverified. The earlier broad regex mapping remains as a compatibility fallback for synthetic/historical ad-hoc inputs, **not for the shipped 151 records**.
5. **Allergens and food safety:** `FoodSafety.allergenSummary()` obtains declared family-level fish, soy, egg, tree nut, peanut and wheat/gluten flags and possible cross-contact notes from canonical IDs, displaying an explicit warning to inspect real manufacturer labels. An unknown ingredient is treated as unknown, **never as allergen-free**. No menu filtering claims coeliac or allergy safety without product verification.
6. **Offline and host parity:** the registry loads after `whole-day-data.js` and before nutrition/cooking/shopping, appears in the service-worker asset cache, and changes trigger unit and browser test workflows.

## Test and migration invariants

`tests/ingredient-catalogue.test.cjs` proves:

- All **17/151** currently defined recipe entries resolve to **99 exact variants / 62 stable IDs**.
- Source tuple JSON remains exactly identical before/after projection.
- Quantities, units and labels survive round-trip, and unknown labels/wrong units do not map.
- Different brands remain different even when food names contain the same word.
- Source-linked product IDs are not quietly attached to generic tofu/salmon.
- Example fish, walnuts, soy and unknown tree-nut/peanut flags surface correctly.
- Planned-shop entries expose canonical identity while historical pantry keys are read without deletion, double-counting or silent data loss.
- Official AFCD food IDs and physical tin edible-yield source links remain explicit.

The live browser journey also checks that **Render / GitHub Pages / local app** expose 17 recipes with 151 canonical references, plus brand-safe purchasing. Availability of those exact deployments must be verified independently for each run.

## Outstanding, not included in HF-003 completion

**HF-004:** a full typed physical-state conversion engine, including validated raw/dry/drained/cooked yield and unknown density; the catalogue does not authorise conversion without evidence.

**HF-005/HF-062:** fully validated current pack SKU choice and dynamic brand substitution, especially for generic ingredients. Generic future ingredients have a backwards-compatible regex fallback outside the shipped canonical corpus. A real substitution editor would need fresh variant records and tests.

**HF-020/HF-021:** medically reliable allergy/coeliac exclusion filtering with verified real pack cross-contact and manufacturer labels. Family flags are only precautionary information.

**HF-181/HF-196:** exact live release-SHA manifest on every deployed host; a green GitHub build is not a substitute.

**Real-world:** confirm Woolworths Dubbo product packaging, nutritional content, true edible drained weights and actual cooking yields.

This is an implementation rather than an AI-authored certification that every related 231-backlog item is complete.
