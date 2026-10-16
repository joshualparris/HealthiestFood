# Nutrient-label reconciliation — 17 October 2026

## What has and hasn't been completed

**Completed:** a reproducible calculation from 11 specific, linked Woolworths products, respecting dry grain weights, raw meat/fish weights and *drained* canned fish/bean weights. The calculator now reports sourced **partial pre-cooking nutrient contributions**, explicitly excludes missing ingredients and refuses to display invented total calcium/iron/zinc/B12/vitamin D/iodine/potassium. It does not adjust nutrients for cooking losses or water absorption. The published website must not describe these as fully verified, finished-meal nutrient profiles.

**Blocked:** the official [FSANZ Australian Food Composition Database Release 3 downloadable food details and nutrient profiles](https://www.foodstandards.gov.au/science-data/food-nutrient-databases/afcd/data-files) could not be fetched into the analysis environment. Release 3 was the correct official dataset to use for raw vegetables, fruits, lentils, nuts, seeds, oils, and minerals, but **no AFCD ID or nutrient value has been invented**. Do not create a fabricated 100% accurate calorie/micronutrient report.

## Exactly matched product nutrition (per 100 g raw/dry/drained)

These are **observations of product information panels accessed 17 Oct 2026**, *not actual pack-label photo verification or Woolworths Dubbo stock checks.* Quoted figures may change and must be reconfirmed at purchase.

| Product, Woolworths ID | Input basis | Energy kJ | Protein g | Fibre g | Sodium mg | Direct listing |
|---|---|---:|---:|---:|---:|---|
| John West springwater sardines 110g, **98523** | 75 g *drained edible* per tin | 844 | 18.5 | Unknown | 234 | [Product](https://www.woolworths.com.au/shop/productdetails/98523) |
| Ocean Chef skinless coho salmon 500g, **6050076** | 125 g raw portion; can buy two 500 g packs to obtain 625g raw | 799 | 19.5 | Unknown | 48 | [Product](https://www.woolworths.com.au/shop/productdetails/6050076) |
| Evergreen Fresh Hard Tofu 650g, **595465** | 625g raw tofu per batch | 884 | 24 | 3.5 | 12.5 | [Product](https://www.woolworths.com.au/shop/productdetails/595465) |
| Woolworths no added salt chickpeas 420g, **259399** | Four 63g edible servings = 252g per tin | 267 | 4.5 | 5.9 | 33 | [Product](https://www.woolworths.com.au/shop/productdetails/259399) |
| Woolworths no added salt black beans 420g, **663581** | Three 75g labelled edible servings = **225g per tin, provisional** | 397 | 5.4 | 5.4 | 8 | [Product](https://www.woolworths.com.au/shop/productdetails/663581) |
| Macro Organic White Quinoa 500g, **335073** | Dry grain mass before cooking | 1580 | 12.2 | 10.5 | 8 | [Product](https://www.woolworths.com.au/shop/productdetails/335073) |
| SunRice Australian Medium Grain Brown Rice 1kg, **94536** | Dry grain mass before cooking | 1490 | 7.6 | 3.9 | Unknown (<5) | [Product](https://www.woolworths.com.au/shop/productdetails/94536) |
| SPC Diced Tomatoes 400g no-added-salt, **322960** | 400g tin including tomato juice | 76 | 1 | 1.1 | 5 | [Product](https://www.woolworths.com.au/shop/productdetails/322960) |
| Woolworths Frozen Broccoli & Cauliflower 500g, **768561** | Frozen vegetable weight | 105 | 2.5 | 1.9 | 27 | [Product](https://www.woolworths.com.au/shop/productdetails/768561) |
| Woolworths Australian Baby Peas 1kg, **754181** | Frozen vegetable weight; 500 g pack has **different panel** | 247 | 4.8 | 5.2 | Unknown (<5) | [Product](https://www.woolworths.com.au/shop/productdetails/754181) |
| Woolworths Baby Leaf Spinach 280g, **524336** | Fresh mass, raw panel | 68 | 2.8 | 2.5 | 90 | [Product](https://www.woolworths.com.au/shop/productdetails/524336) |

**Important bean discrepancy.** Black-bean ingredients say beans are 60% of the gross 420g (suggests 252g), *but the pack NIP says 3 × 75g = 225g*. Neither is a reliable actual weighed drained yield for your can. Nutrient calculator uses the conservative **225g NIP declared servings**; store shopping pack calculations should NOT blindly use 252g. Weigh drained/rinsed contents on a kitchen scale next cook-up and update the mapping. Chickpea NIP equals 252g and matches 60% ingredient declaration.

**"Less than" values** cannot be converted into exact mg; sodium subtotal excludes brown rice and frozen baby peas. Sardine and salmon fibre is not published; it is unknown in this evidence ledger, not entered as zero.

## Reconciliation formula

For nutrient `n` reported in grams/milligrams/kJ per **100g of the source product**:

`subtotal_batch[n] = Σ (edible_weight_grams × product_label[n] / 100)`

`subtotal_per_portion[n] = subtotal_batch[n] / recipe_yield`

For a tin: `edible_weight_grams = number_of_tins × declared_edible_mass`. For dry grain: use **dry** mass; for fish and tofu: use **raw** mass. The model reports ingredient-line and nutrient-field coverage; unknown components are not zero, and labelled average values are not guaranteed personal nutrient intake.

## Partial label-only contributions per adult portion (5 servings/batch)

| Recipe | Energy kJ | Protein g | Fibre g | Sodium mg | Matched lines / total |
|---|---:|---:|---:|---:|---|
| A Sardine bowl | 1921.1 | 34.0 | 12.2 | 369.1 | 6 / 19 |
| B Salmon bowl | 1943.4 | 36.1 | 11.6 | 120.3 | 5 / 15 |
| C Pumpkin tofu curry | 1696.2 | 35.4 | 8.3 | 62.8 | 5 / 21 |
| D Black-bean tofu bowl | 1997.1 | 39.3 | 13.3 | 29.2 | 4 / 19 |

**Never interpret these as full calories or recommended portions.** Oil, walnuts, fruit, raw vegetables, some legumes/lentils and other important foods are *missing from the above sums*. Cooking and draining losses were not assessed. Missing sodium may substantially change the calculated sum. A batch that's too low in energy for someone's needs should be adjusted based on their full dietary context, not this partial table.

## Next verification tasks that require actual items or AFCD data

1. Import genuine AFCD Release 3 food IDs and nutrient columns for every unmatched ingredient. Document exact raw/cooked match and derivation (never substitute different weight states); handle nutrient retention correctly and mark unquantified nutrients unknown.
2. Confirm the pack photos and label for exact tofu, chickpeas, black beans, sardines, salmon, rice, spinach, frozen mix, baby peas and tomatoes. Reweigh one drained tin of each bean and compare to declared label.
3. Cook each five-portion batch in an actual kitchen and measure total cooked yield, per-container grams, internal doneness, cooling time, and freezer/reheat temperature. Enter findings through the optional on-device cook-up log.
4. Compare the entire day's eating with Australian age/sex-relevant nutrient reference values **after** the whole-day meal planner is nutrient-analysed. This includes B12, calcium, iodine, iron, zinc, folate and vitamin D.

## Nutritional interpretation

The nutrient pattern evidence prioritises food diversity, adequate energy/protein and cardiovascular quality. Neither higher calories nor higher protein/fibre automatically makes a meal healthier. In an actual home freezer, safe cooling and storage are at least as important as the theoretical calculated micronutrient composition.

Sources: [FSANZ AFCD Release 3](https://www.foodstandards.gov.au/science-data/food-nutrient-databases/afcd/about-afcd); [NSW Food Authority leftovers](https://www.foodauthority.nsw.gov.au/consumer/food-extra-care/leftovers). See source URLs in the product table above.

## Update: official AFCD Release 3 data retrieved and modelled

On 17 October 2026, GitHub Actions fetched the actual FSANZ nutrient-profiles workbook. The repository now includes [an officially sourced, reproducible AFCD3 subset](afcd3-selected.js) and [a broader generic-food subset](afcd3-foods.js), with source parsing scripts under `scripts/`. See [full day nutrient model](FULL_DAY_NUTRIENT_MODEL_2026-10-17.md) and [exact, unresolved ingredient-level maths](nutrient-ledger.js). Some **estimated raw/dry ingredient vitamin and mineral subtotals** are now supported. None of these estimates measures vitamin retention after cooking or establishes sufficient intake for any person. Branded products without quantifiable nutrients, variable frozen vegetable proportions and real drained/cooked yield remain unverified. Original table above deliberately documents the narrower *retailer-label-only* results; it has not been retroactively described as a full meal analysis.

The official workbook includes nutrient data for foods that may differ by raw preparation, variety or packaging from those actually used. A named match must remain documented, not silently treated as exact.
