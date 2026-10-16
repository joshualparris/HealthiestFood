# V5: evidence, product trade-offs and reproducible estimates

**16 October 2026.** V5's strongest claim is that it is a detailed, varied, practical implementation of a broadly supported healthy dietary pattern. It is not a ranking of every ingredient sold in Dubbo, not a clinical diet prescription and not evidence that a fifth version is biologically superior to every earlier version.

## What the evidence supports

| Design decision | Source | Interpretation |
|---|---|---|
| Keep legumes, tofu, nuts and fish central | [Heart Foundation: protein and heart health](https://www.heartfoundation.org.au/healthy-living/healthy-eating/protein-and-heart-health) | These are useful protein choices in the overall pattern; no need to replace them with exotic products. |
| Use vegetables, fruit and wholegrains regularly | [Heart Foundation eating pattern](https://www.heartfoundation.org.au/healthy-living/healthy-eating/heart-healthy-eating-pattern); [wholegrains](https://www.heartfoundation.org.au/healthy-living/healthy-eating/wholegrains-and-heart-health) | Supports the broad combination, not one unique recipe or brand. Quinoa is a practical pseudocereal, not a requirement. |
| Rotate fish through the week | [Heart Foundation fish guidance](https://www.heartfoundation.org.au/blog/not-eating-enough-fish) | Uses about 150 g fresh fish or 100 g canned fish as a portion convention. Raw and cooked weights are not interchangeable. |
| Retain nuts and olive oil, with measured portions | [Australian Dietary Guidelines](https://www.eatforhealth.gov.au/guidelines/australian-dietary-guidelines-1-5) and the pattern above | Adding unlimited oil/nuts is not a guaranteed health upgrade. V5 uses 5 mL oil and 10 g walnuts per lunch; other meals can supply more. |
| More flavour variety and smaller batches | Recipe-design judgement | May improve enjoyment and make cooling easier; no trial proves four flavours improve lifespan over two. |
| Use verified cooking/cooling instructions | [NSW cooking temperatures](https://www.foodauthority.nsw.gov.au/consumer/food-safety-home/cooking-temperatures), [leftovers](https://www.foodauthority.nsw.gov.au/consumer/food-extra-care/leftovers), [cooling benchmarks](https://www.foodauthority.nsw.gov.au/retail/standard-322a-food-safety-management-tools/showing-food-safe) | Fish 63°C; prompt cooling and short refrigerated storage matter. V5's 75°C reheating target is conservative, above NSW consumer guidance's at-least-60°C/steaming-hot minimum. [FSANZ](https://www.foodstandards.gov.au/business/food-safety/cooling-and-reheating-food) distinguishes controlled initial cooling from subsequent 2/4-hour handling time. |

The [2018 republished PREDIMED trial](https://www.nejm.org/doi/abs/10.1056/NEJMoa1800389) is relevant to Mediterranean dietary patterns, not a direct trial of these lunches. It involved older adults at elevated cardiovascular risk; its original publication was retracted/reanalysed following randomisation irregularities. It does not support a precise longevity score for V5.

## Product-specific decisions, with real trade-offs

### Salmon: less sodium does not mean universally better

[Tassal Frozen Salmon Portions 500 g](https://www.coles.com.au/product/tassal-frozen-salmon-portions-500g-1386720) lists 100% salmon, 60 mg sodium, 20 g protein and 1,100 kJ per 100 g. V5 B's **150 g raw portion** therefore contributes approximately **90 mg sodium, 30 g protein and 394 kcal** before the other ingredients. The price captured was $25/500 g.

[Woolworths canned pink salmon 415 g](https://www.woolworths.com.au/shop/productdetails/220697) lists edible bones, 382 mg sodium, 20.7 g protein and 581 kJ per 100 g. The **100 g canned substitution** contributes approximately **382 mg sodium, 21 g protein and 139 kcal**. It is cheaper under the stated price allowance and provides edible bones. These are different portions/products, not a controlled nutrition experiment. Canned fish remains a valid healthy option.

Not all frozen salmon is plain: the inspected [I&J skin-off 500 g](https://www.coles.com.au/product/iandj-the-finest-frozen-salmon-portions-skin-off-500g-3580246) lists 95% salmon, water and salt, with 197 mg sodium/100 g. The product called “frozen salmon” cannot automatically inherit Tassal's figures. Neither wild nor farmed wording alone establishes the best choice.

### Sardines: useful bones and fish omega-3

The [John West manufacturer panel](https://johnwest.com.au/product/sardines-in-springwater-110g/11531) lists a 75 g serving per 110 g can, 18.5 g protein, 234 mg sodium and 259 mg calcium per 100 g. Eight cans yield about 600 g on this convention, so a fifth provides **about 22 g protein, 281 mg sodium and 311 mg calcium from fish alone**. Keep the soft bones. Actual drained yield must be weighed. Retailer calls the corresponding product “Salt Reduced”; the manufacturer's title is simply “Sardines in Springwater”. Check the actual pack rather than assuming all John West sardines match.

### Tofu: declared calcium is more useful than guessing

[Pureland High Protein Firm Tofu 500 g](https://www.coles.com.au/product/pureland-high-protein-firm-tofu-500g-6848120) lists 17.9 g protein, 120 mg calcium and 490 kJ/100 g. A 150 g portion contributes **about 27 g protein, 180 mg calcium and 176 kcal**. This is not the ordinary Pureland tofu. Its unusually high listed fibre is not used to generate a precise whole-bowl fibre claim.

Macro Firm Tofu is a cheaper protein option; its retrieved label gives 14.8 g protein/100 g, and no calcium amount. Missing calcium data means unknown, not zero. Do not claim that simply using tofu closes a daily calcium gap.

### No-added-salt beans and fortified milk

[Edgell no-added-salt black beans](https://www.coles.com.au/product/edgell-organic-black-beans-no-added-salt-400g-5071232) list 3 mg sodium and 7.8 g protein/100 g. Organic status is incidental; no-added-salt and the food itself are the useful features. The calculation treats its listed panel as applicable to drained beans; packaging conventions and residual water add uncertainty.

[So Good High Protein Almond](https://sogood.com.au/products/protein-milks/Almond%20High%20Protein-1L) supplies 300 mg calcium and 10.2 g protein per 250 mL in the inspected panel. It is optional and excluded from meal totals. A fortified soy alternative is acceptable; check its own panel. These foods do not make the entire diet nutritionally complete.

## Nutrition calculation: useful estimates, explicitly limited

Run `python v5/calculate.py` from the repository root. It sums each ingredient amount multiplied by its per-100 g value, divides by five, and rounds. Oil is measured per 100 mL. **Weights are dry for grains/lentils, raw for salmon and drained for canned legumes/fish.** Cooking-water gain is not counted as extra energy. All added oil and walnuts are assumed eaten.

Label inputs:

- Sardines: manufacturer panel linked above, kJ converted to kcal using 4.184 kJ/kcal.
- Salmon: Tassal panel above, raw/as-sold basis.
- Tofu: Pureland high-protein panel above.
- Rice: [Woolworths Brown Rice Grain](https://www.woolworths.com.au/shop/productdetails/777630/woolworths-brown-rice-grain), 1,450 kJ and 7.9 g protein/100 g dry.
- Black beans: Edgell panel above.

**Generic planning assumptions, not laboratory data or a verified nutrient database extract:**

| Ingredient | kcal/100 g | Protein g/100 g |
|---|---:|---:|
| Dry quinoa | 370 | 14 |
| Dry red lentils | 330 | 25 |
| Drained chickpeas | 120 | 6 |
| Tomato | 25 | 1 |
| Broccoli/cauliflower mix | 30 | 2.5 |
| Carrot | 40 | 1 |
| Capsicum | 30 | 1 |
| Zucchini | 20 | 1.2 |
| Onion | 40 | 1.1 |
| Spinach | 25 | 2.5 |
| Peas | 75 | 5 |
| Kale | 35 | 3 |
| Pumpkin | 40 | 1 |
| Mushrooms | 25 | 3 |
| Walnuts | 650 | 15 |
| Olive oil, **per 100 mL** | 810 | 0 |

These rounded assumptions are disclosed so they can be replaced with actual pack/database values, not mistaken for measurements. Small garlic/ginger/lemon/spice energy is omitted. Energy lost into discarded fish juices is not subtracted. Depending on labels and cooking, actual numbers can differ materially. The script also outputs a simple **±20% energy sensitivity band**; this is an illustrative scenario, **not a validated error bound or statistical confidence interval**. Protein is also approximate and has no validated confidence interval.

| Meal | Rounded model kcal | Illustrative ±20% kcal range | Rounded protein |
|---|---:|---:|---:|
| A | 680 | 540–810 | 39 g |
| B | 810 | 640–970 | 45 g |
| C | 620 | 490–740 | 44 g |
| D | 590 | 470–700 | 45 g |

A full micronutrient, fibre, sodium and fatty-acid analysis has **not** been completed. Do not sum the selected component calcium/sodium examples as if they were whole-meal totals. No claim is made that vitamin D, iodine, B12, calcium or energy needs are met for the day. Recipe design and nutrition evidence are separate from a personal medical assessment.

## Honest comparison with V2

| Area | V5 change | Assessment |
|---|---|---|
| Enjoyment/variety | Four recipes instead of two bases | Practical improvement, awaiting taste testing |
| Portion control | Five portions per recipe; explicit component division | Clearer cooking workflow |
| Protein | 150 g tofu per plant meal; specified fish weights | More explicit; not a claim everyone needs more protein |
| Sodium | Optional plain salmon instead of canned | Lower in this component; more expensive, less bone calcium |
| Plant foods | Legumes, greens, brassicas and wholegrains retained | Strong foundation preserved; no need for endless additions |
| Fibre tolerance | Smaller legume amounts in some meals; no extra powders | Individual response still unknown |
| Energy fit | Estimates make B's high energy visible | Better transparency; not a weight-loss design |
| Calcium | Labelled tofu, sardine bones, optional fortified drink | Quantified components, not a full-day guarantee |
| Cost | More salmon and four ingredient combinations | Worse than V2 default; canned alternative offered |
| Evidence | Reproducible model with assumptions | Better auditability, still incomplete nutrient analysis |

## Additional comparison with V3

[V3 recipes](../V3_RECIPES_20_LUNCHES.md) and its audit became available during V5 preparation and were inspected. V3 already fixes fish arithmetic, distinguishes calcium labels and varies fruit/toppings. V5 therefore does not claim those ideas as new. V5 uses four five-portion recipes instead of two ten-portion bases, changes the tofu to a declared-calcium product, offers plain salmon with its cost/energy trade-offs, and supplies an explicitly approximate calculation. It reduces the nut/seed topping to 10 g walnuts per meal instead of V3's 15 g walnuts or 10 g walnuts plus 10 g pepitas; that reduces energy/complexity but does not establish better longevity.

## Validation performed

Ingredient totals and budget arithmetic were generated from the same script; protein/grain/oil/nut allocations were checked against the recipes and shopping list. Twenty portions and use of 1.5 kg tofu, 100 mL oil and 200 g walnuts are checked in the script. Markdown relative links were checked before publication. No kitchen trial, local checkout, full nutrient database calculation or exhaustive Dubbo-wide product comparison has been performed.

**Priority after V5:** measure the actual batch and review whether it tastes good, reheats well and leaves you comfortably fed. Further rewrites without that feedback cannot establish “healthiest possible”.
