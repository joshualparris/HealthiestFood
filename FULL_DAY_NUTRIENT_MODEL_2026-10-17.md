# AFCD3 ingredient nutrient modelling — 17 adult recipes & 7 days

**Generated from official FSANZ Australian Food Composition Database Release 3 generic food entries, supplemented with specific retailer labels.** The output is a **partial model of raw/dry/drained inputs** and assumed edible portions. This is **not a verified finished-food nutrient profile**, a clinical adequacy result, or a prediction of lifespan. Nutrient losses from cooking, exact brands, edible yields, mixed frozen vegetables and some ingredients remain unresolved. Blank values are never set to zero; a numeric subtotal may still omit some ingredients.

Reference: https://www.foodstandards.gov.au/sites/default/files/2025-12/AFCD%20Release%203%20-%20Nutrient%20profiles.xlsx; original [food-pattern and limitations audit](WHOLE_SITE_EVIDENCE_REVIEW_2026-10-17.md); source mapper [whole-day-analysis.js](whole-day-analysis.js). Generated generic foods: 51.

## Per adult meal portion: mapped ingredient subtotals

| Recipe | Group | kJ† | Protein g† | Fibre g† | Calcium mg† | Iron mg† | Iodine µg† | B12 µg† | Vitamin D µg† | Ingredients mapped |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Lemon–paprika sardine bowls | lunch | 2798† | 38.4† | 19.3† | 194† | 5.3† | 3.1† | 0.00† | 0.00† | 15/19 |
| Lemon coho salmon bowls | lunch | 2714† | 40.1† | 18.5† | 247† | 4.0† | 8.4† | 2.75† | 7.76† | 13/15 |
| Golden pumpkin lentil curry | lunch | 3350† | 51.5† | 23.8† | 180† | 9.4† | 12.3† | 0.00† | 0.00† | 16/21 |
| Smoky black-bean tofu bowls | lunch | 2982† | 46.8† | 22.5† | 157† | 6.6† | 5.7† | 0.00† | 1.36† | 15/19 |
| Berry, chia & walnut overnight oats | breakfast | 1999† | 19.0† | 12.2† | 305† | 4.6† | 39.3† | 1.62† | 0.00† | 5/6 |
| Spinach, mushroom & egg scramble | breakfast | 903† | 16.3† | 3.5† | 107† | 3.3† | 61.3† | 1.40† | 7.36† | 5/6 |
| Berry, banana, spinach & soy smoothie | breakfast | 1809 | 19.9 | 11.3 | 395 | 3.9 | 8.5 | 2.25 | 0.00 | 6/6 |
| Avocado, tomato & chickpea toast | breakfast | 864† | 6.8† | 9.5† | 56† | 2.0† | 0.0† | 0.00† | 0.00† | 4/6 |
| Tomato lentil & vegetable soup | dinner | 1892† | 20.2† | 16.1† | 145† | 7.7† | 13.3† | 0.00† | 0.00† | 7/9 |
| Lemon chicken, sweet potato & green beans | dinner | 1283† | 31.1† | 4.7† | 55† | 1.6† | 0.0† | 0.60† | 1.97† | 5/7 |
| Smoky bean & vegetable chilli | dinner | 1578† | 14.5† | 12.9† | 81† | 4.2† | 8.8† | 0.00† | 1.13† | 7/10 |
| Ginger tofu & rainbow veggie stir-fry | dinner | 2255† | 29.3† | 10.1† | 371† | 5.2† | 16.1† | 0.00† | 1.13† | 9/10 |
| Salmon, quinoa & roast vegetables | dinner | 2521† | 38.1† | 14.2† | 165† | 3.5† | 0.8† | 2.75† | 7.76† | 6/7 |
| Crunchy vegetables & hummus | snack | 676 | 4.6 | 5.6 | 60 | 1.1 | 1.4 | 0.00 | 0.00 | 3/3 |
| Apple & nut butter | snack | 312† | 0.5† | 3.8† | 6† | 0.2† | 0.0† | 0.00† | 0.00† | 1/2 |
| Hard-boiled egg & cherry tomatoes | snack | 340 | 6.9 | 1.1 | 35 | 1.2 | 28.8 | 0.70 | 2.89 | 2/2 |
| Berries, soy yoghurt & walnuts | snack | 426† | 1.9† | 2.7† | 21† | 0.6† | 0.0† | 0.00† | 0.00† | 2/3 |

† **Subtotals only.** A † denotes at least one unmapped or nutrient-unknown component. No † does *not* certify cooking retention or brand equivalence. Sodium is modelled but actual added salt, drained yields and label substitutions may substantially change it. Do not compare these directly with daily RDIs.

## Seven-day sample menu: Saturday 17 to Friday 23 October 2026

This samples the app’s default Australia/Sydney schedule, **not a diet individually prescribed or evidence of actual consumption**. For nutrient sums, each named meal is modelled as **one adult serving**, even if the planner schedules a four-person dinner cook-up. Snacks are optional and the default includes two daily.

| Date | Breakfast | Lunch | Dinner | Optional snacks | kJ† | Protein g† | Fibre g† | Calcium mg† | Iodine µg† |
|---|---|---|---|---|---:|---:|---:|---:|---:|
| 2026-10-17 | Avocado, tomato & chickpea toast | Golden pumpkin lentil curry | Lemon chicken, sweet potato & green beans | Crunchy vegetables & hummus; Apple & nut butter | 6485† | 94.3† | 47.4† | 357† | 13.7† |
| 2026-10-18 | Berry, chia & walnut overnight oats | Smoky black-bean tofu bowls | Tomato lentil & vegetable soup | Crunchy vegetables & hummus; Apple & nut butter | 7860† | 91.1† | 60.1† | 672† | 59.7† |
| 2026-10-19 | Spinach, mushroom & egg scramble | Lemon–paprika sardine bowls | Lemon chicken, sweet potato & green beans | Crunchy vegetables & hummus; Apple & nut butter | 5972† | 90.7† | 36.9† | 422† | 65.7† |
| 2026-10-20 | Avocado, tomato & chickpea toast | Golden pumpkin lentil curry | Smoky bean & vegetable chilli | Crunchy vegetables & hummus; Apple & nut butter | 6780† | 77.7† | 55.6† | 383† | 22.5† |
| 2026-10-21 | Berry, banana, spinach & soy smoothie | Lemon coho salmon bowls | Ginger tofu & rainbow veggie stir-fry | Crunchy vegetables & hummus; Apple & nut butter | 7765† | 94.3† | 49.3† | 1079† | 34.3† |
| 2026-10-22 | Berry, chia & walnut overnight oats | Smoky black-bean tofu bowls | Tomato lentil & vegetable soup | Crunchy vegetables & hummus; Apple & nut butter | 7860† | 91.1† | 60.1† | 672† | 59.7† |
| 2026-10-23 | Spinach, mushroom & egg scramble | Lemon–paprika sardine bowls | Salmon, quinoa & roast vegetables | Crunchy vegetables & hummus; Apple & nut butter | 7210† | 97.8† | 46.4† | 531† | 66.5† |

## What the model cannot determine

The exact purchased brands (except matched Woolworths panels), actual drained/cooked portion weights, vegetable variety and frozen mixture proportions, fruit edible yields, egg sizes, reliable calcium in Evergreen tofu, specific soy yoghurt composition, ingredient cooking losses, unscheduled water/drinks/foods, pregnancy/age-specific requirements, actual taste and food-safety compliance, and personal dietary adequacy. Some generic food nutrients are zero because official AFCD records report zero; **unknown is null**, not assumed zero. Some important ingredients have no appropriate match, and a seven-day subtotal does not establish full-day intake.

## Next verification priorities

1. Weigh a real portion of each recipe before/after cooking and confirm the purchased labels, particularly the tofu calcium and soy-drink fortification.
2. Fill remaining ingredient gaps, use correct food preparation state and scientifically justified retention factors rather than applying raw values to cooked serving weights.
3. Complete a real Woolworths Dubbo checkout basket for the chosen week, clearly separating owned pantry stocks and uncertain estimates.
4. Reassess the whole-day nutrient profile once breakfasts/dinners/snacks are actually eaten; do not infer longevity benefits from simulated numbers.

Generated automatically by scripts/generate_full_day_report.cjs. No personal schedule is included; only default public meal templates.
