# Science and evidence verification pass — 17 October 2026

## Scope and meaning

A verification pass on the HealthiestFood Science page, its 17 current recipes, provenance code, AFCD nutrient estimates, manufacturer label figures, and published evidence caveats. **It is not** a physical recipe trial, complete dietetic assessment, laboratory analysis, user-specific nutritional prescription, or authenticated Woolworths Dubbo checkout.

Three evidence levels must remain distinct:

1. **Verified primary-source claim:** an official government or manufacturer source was directly checked and supports the stated generic recommendation or declared product-panel figure.
2. **Derived/modelled estimate:** calculations from specific AFCD Release 3 reference foods or linked product-panel quantities, using assumptions about variety, weights, edible fraction, brands and preparation. *Models are not measurements.*
3. **Not established:** actual purchased pack identity and cross-contact history, in-kitchen yields and temperatures, real-time local inventory and prices, total diet intake and individual long-term health outcomes.

## Primary-source checks this pass

| Question | Current evidence | Conclusion |
|---|---|---|
| Does FSANZ AFCD Release 3 exist? | [FSANZ dataset](https://www.foodstandards.gov.au/science-data/food-nutrient-databases/afcd/data-files), 1,588 generic foods and 58 nutrient profile columns, with a workbook and provenance information | **Established** as reference-data source; not finished-recipe testing. |
| Is the existing site missing AFCD data altogether? | [afcd3-foods.js](afcd3-foods.js), [afcd3-selected.js](afcd3-selected.js), [whole-day-analysis.js](whole-day-analysis.js), [ingredient-catalogue.js](ingredient-catalogue.js) and [FULL_DAY_NUTRIENT_MODEL_2026-10-17.md](FULL_DAY_NUTRIENT_MODEL_2026-10-17.md) | **False as a blanket statement.** The model already calculates partial ingredient totals for all 17 recipes. Older copy has now been corrected. |
| How should model values be described? | Food IDs and ingredient weights are coded in [whole-day-analysis.js](whole-day-analysis.js); the new per-recipe register exposes the exact source associations | **Modelled**, with known gaps; NOT confirmed cooked-portion nutrients, exact completeness or personal adequacy. |
| Are the soy-drink example numbers source reported? | [So Good High Protein Soy](https://sogood.com.au/products/soy-milks/Soy-High-Protein-1L) declares per 250 mL 10 g protein, 400 mg calcium, 1 µg B12, 5 µg vitamin D. [Vitasoy Protein Plus](https://soy.com.au/product/soy-milk-protein-plus/) declares 10.5 g protein, 300 mg calcium and no B12 or D quantified on that current product page | **Manufacturer figures established online**, but actual cartons, flavour variations and stock not checked. Unknown vitamin values are NOT zero. |
| Does NSW specify safe leftover practice? | [NSW Food Authority leftovers](https://www.foodauthority.nsw.gov.au/consumer/food-extra-care/leftovers) | **Established:** refrigerate/freeze within 2 hours, below 5°C, rice/pasta refrigerated no longer than 2 days, other leftovers 3 days, and steaming-hot reheating; do not reheat rice more than once. |
| Are Australian calcium/iodine targets available? | [Calcium NRVs](https://www.eatforhealth.gov.au/nutrient-reference-values/nutrients/calcium) and [iodine NRVs](https://www.eatforhealth.gov.au/nutrient-reference-values/nutrients/iodine) | **Established as adult population guidance** (many adults 19–50: calcium 1,000 mg/day, iodine 150 µg/day). Requirements vary by age and life stage and don't prove adequacy from a sample plan. |
| Is a dairy-/gluten-free claim established just from ingredient names? | [FSANZ allergen labelling](https://www.foodstandards.gov.au/consumer/labelling/allergen-labelling) | **No.** Pack declarations and kitchen cross-contact need actual checking. Voluntary ‘may contain’ statements are not standardised risk measures. |
| Has the tofu's calcium in mg been measured for this pack? | Retailer listing and site ledger do not give a numeric calcium panel for the exact Evergreen hard tofu | **No**: calcium-sulphate ingredient alone cannot supply a numeric amount; generic tofu AFCD values are not a branded guarantee. |
| Are current Dubbo Woolworths prices and stock established? | No authenticated selected-store live cart or recorded dated checkout, only historical notes | **No.** Do not present the $256.43 historical V6 basket as a live shop total. |
| Has the actual food been cooked and eaten? | No documented independently repeatable temperature, yield, portion-mass, freezer/reheat and taste evidence for all proposed batches | **No.** Recipe images are generated illustrations, not photographs of measured cook-ups. |
| Does any exact recipe prove longer lifespan? | Pattern-based research does not test a particular app recipe as a life-extension intervention | **No.** Avoid invented /100 longevity certainty. |

## Implemented changes

- New [science-evidence-register.js](science-evidence-register.js) gives six evidence-status categories and *every one* of the 17 recipes an ingredient-level provenance table, showing model weight, matched AFCD keys, source type, known nutrient columns and unresolved ingredients.
- The Science page mounts that register **before** the older label-only comparisons and the AFCD 17-recipe/day tables. Existing research links and calculators remain.
- Corrected out-of-date description that said all AFCD mapping still needed to be done.
- Reworded the complete-day limitation and retailer-panel language so source-linked online panel data are not confused with personally examined packets.
- [tests/science-evidence-register.test.cjs](tests/science-evidence-register.test.cjs) and browser Science journey test protect source visibility, missing-nutrient coverage and page wiring.
- Network-first offline cache updated to include the new module.

## Evidence still required (specific collection protocol)

| Priority | Missing evidence | What would resolve it | What we must not claim in the meantime |
|---|---|---|---|
| P0 | Exact edible mass of drained black beans, chickpeas and sardines | Weigh at least one drained pack from the actual purchased SKU, note net/drained mass and original label | That 225 g or 252 g is guaranteed for all tins |
| P0 | Actual purchased brand, allergens and dairy-free compatibility | Check dated label photographs of front, ingredients, allergen statements, NIP and batch details; assess cross-contact separately | Guaranteed allergen safety for an unexamined pack |
| P0 | Tofu calcium, iodine and other missing micronutrients | Obtain manufacturer numeric data or suitably matched laboratory analysis, or show unknown | Guaranteed calcium contribution from calcium sulphate |
| P0 | Batch safe cooking, rapid cooling and storage | Record actual internal probe temperature and time, fridge load, shallow cooling, storage and reheat temperatures | That recipe cook times alone make a cooked batch safe |
| P1 | Full nutrient composition and cooking effects | Match all missing inputs to correct raw/cooked AFCD reference foods, use validated edible yields and retention factors and include substitutions | Complete energy/calcium/iodine/B12/D/iron/zinc adequacy |
| P1 | Live Dubbo checkout | Select the specific Woolworths Dubbo store, record screenshot or authorised checkout basket with date, quantities, stock and substitutions | Guaranteed savings, product availability or a $256.43 live basket |
| P1 | Meal satisfaction, taste and repeatability | Log actual cook-ups, portion weights and household preference with permission | That the meals are physically tested and desirable for everyone |
| P2 | Individual nutritional adequacy/clinical benefit | Confirm real food intake and relevant needs with a qualified clinician/dietitian where appropriate | Clinical diagnosis, longevity prediction or a perfect universal meal |
| P2 | External research update cycle | Revisit authoritative scientific guidance periodically and flag any superseded URLs/studies | That a source link will remain permanent and unchanged |

## Release gate

Code/unit tests and a browser smoke test can verify the **website's display and maths**. They cannot make pack labels, local availability, food temperature, real consumption or lifespan effects certain. Only promote each remaining item on receipt of that type of evidence; don't silently change the status just to reach “100% verified”.

This document is an audit snapshot. Official reference links were checked 17 October 2026; manufacturer webpages and recipes may change.
