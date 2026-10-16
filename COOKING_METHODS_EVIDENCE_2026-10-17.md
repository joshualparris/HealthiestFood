# Cooking Methods Lab — ingredient-complete evidence review (17 October 2026)

**Launch:** [Interactive Cooking Methods Lab](https://joshualparris.github.io/HealthiestFood/cooking-methods.html) · [Source data](cooking-methods-data.js) · [Ingredient coverage tests](tests/cooking-methods.test.cjs)

## Purpose, scope and verification

This is a **food-specific, safety-first practical comparison**, not a ranked mortality experiment or universally healthier-cooking algorithm. `cooking-methods-data.js` stores **77 individually named food-family records** with ≥3 realistic methods, method-specific benefits, downsides, practical advice, the food-specific default, a safety warning, evidence limits, and source links. Food categories now include **56 families covering every ingredient in the currently published 17 adult recipes**, plus **21 additional named groups recovered from archived versions** (potato, swede, broccolini, sweetcorn, edamame, coconut cream, sesame oil, sesame seeds, pepitas, stock, pasta, tuna, beef, pork, turkey, bacon, cheese, flour, chilli paste, lime, parsley). The most significant variants are separately treated: salmon versus **already heat-processed canned sardines**, dried kidney beans versus canned, raw/frozen produce, rice absorption versus drained-cooking, and ready-to-eat dips and fortified soy.

**Coverage is mechanically checked, not merely asserted:** the test collects ingredients directly from the complete live runtime after `site-data.js` and `whole-day-data.js` load and includes every original V6 retailer basket item. On 17 October, these yielded **132 unique labels** (97 distinct recipe ingredient strings plus 35 original priced shopping product names), all mapped to an ingredient family. This is **132 distinct text labels, not 132 distinct foods**. Newly added active ingredients must pass coverage again. Archival markdown contains earlier recipe ideas, historical shopping comparators, alternatives, broad ingredient names and hypothetical recipe concepts; the added 21 historical food-family records increase coverage but **do not establish a formally complete machine-validated inventory of every possible food mentioned in all historic narrative prose, connected Drive archives or external repos**. The page explicitly states that boundary rather than claiming universal historical completeness.

**What the science actually measures:** cooking temperature, time, water contact, chopping and fat alter food composition, bioaccessibility, foodborne microbial safety and how much people enjoy eating. The strongest evidence comes from authoritative **regulatory food safety** rules; published **food-composition and true-retention studies**; selected short **human absorption trials**; and broader healthy-eating advice. A carotenoid appearing in blood or a vegetable containing more vitamin C after a particular preparation is **not direct evidence of lower mortality or extra lifespan**. Comparisons reflect different objectives, so this website does not invent numerical percentage rankings.

## The specific comparison findings

### Eggs: boiled, poached, fried, scrambled, omelette, baked or raw?

**Practical default:** hard-boil, fully set poach or gently scramble with a small amount of unsaturated oil. All cooked choices provide egg protein. Boiling and poaching can be done without fat; light pan-frying is also a reasonable food method, but the amount/kind of added fat and whether the egg is thoroughly cooked can make a bigger difference than the pan label. There's **no good human trial showing hard-boiled eggs extend lifespan more than poached eggs**. Lightly cooked yolks are a higher microbial risk, especially to medically vulnerable people; for those groups fully set yolk and white is a better priority. **Never recommend raw eggs as a superior protein strategy.**

Grounding: [NSW Food Authority: Eggs](https://www.foodauthority.nsw.gov.au/consumer/food-extra-care/eggs-enjoy-safely), [FSANZ higher-risk people](https://www.foodstandards.gov.au/consumer/prevention-of-foodborne-illness/Food-safety-for-vulnerable-populations), [Heart Foundation cooking techniques](https://www.heartfoundation.au/healthy-living/healthy-eating/skills/heart-healthy-cooking-tips). FSANZ describes fully firm egg yolk/white and approximately 72°C for vulnerable groups; this **does not mean every healthy adult egg must have precisely the same preparation or that egg methods have validated longevity scores**.

### Broccoli and cauliflower: steaming, microwave, boiling, stir-fry, raw or roasting?

A [broccoli-specific 2009 food-composition experiment](https://pubmed.ncbi.nlm.nih.gov/19650196/) found steaming retained vitamin C and glucosinolates more effectively than its compared methods. A [2018 vegetable true-retention experiment](https://pubmed.ncbi.nlm.nih.gov/30263756/) found microwaving frequently conserved vitamin C better than boiling, while effects varied by vegetable/vitamin. **However, a different broccoli-processing experiment** detected no sulforaphane after either boiling or steaming under its protocol: [broccoli processing and sulforaphane](https://pubmed.ncbi.nlm.nih.gov/17995854/). These are *not contradictory about every outcome*: the precursor glucosinolates, active enzyme myrosinase, actual sulforaphane measured, temperature and stored/frozen state differ. **Don't promise sulforaphane is preserved simply by steaming**, and don't infer lifetime cancer reduction from a lab comparison. Frozen blanched broccoli isn't necessarily chemically identical to fresh cut broccoli.

**Practical default:** brief steam or minimal-water microwave; raw well-washed is fine if appropriate; don't prolong cooking or dump large volumes of vitamin-containing water unnecessarily. Eating more vegetables reliably matters more than a mythical exact minute count.

### Tomatoes: raw, simmered, roasted and olive-oil-cooked

A [small Australian human trial](https://pubmed.ncbi.nlm.nih.gov/15927929/) comparing cooked tomatoes **with/without olive oil** (470 g tomato + 25 mL oil per day in intervention, a much larger experiment portion than the app's dishes) found higher circulating lycopene with olive oil. [Lycopene absorption review](https://pmc.ncbi.nlm.nih.gov/articles/PMC7996133/) describes how heat changes the food matrix and carotenoid bioavailability; raw tomatoes preserve some heat-sensitive vitamins better. This is evidence for **absorption**, **not that simmering tomatoes with oil prevents cancer or extends life**.

**Practical default:** alternate whole raw tomatoes in salads with gently simmered no-added-salt tomato sauces containing some healthy fat already in the meal. Do **not** add 25 mL oil to every individual meal because it was used in a small clinical study.

### Carrots and pumpkin: raw versus cooked

Plant cell disruption and gentle heat can improve access to beta-carotene; a [2025 crossover experiment in 16 adults](https://pubmed.ncbi.nlm.nih.gov/40226756/) found higher beta-carotene response from carrot juice than raw carrots, but **a juice-versus-whole-carrot test does not prove boiling is the best preparation, and juice loses some of whole vegetables' structural/fibre benefits**. Pumpkin with some meal fat is practical; moderate roasting is compatible with a healthy pattern, but prolonged high-heat browning isn't required.

**Practical default:** rotate raw carrots for snacks with gently steamed/roasted carrots or pumpkin at dinner; retain actual food fibre rather than straining into juice.

### Spinach, kale, capsicum, other leafy and colourful vegetables

Vitamin C and some heat-sensitive compounds can decrease with long cooking. Minimal-water steaming/microwaving, brief wilting and washing raw leaves (when appropriate) offer different balances. Spinach calcium is not fully available due to oxalates, and cooking alone cannot convert it into a reliable dairy-free calcium target. Try both raw leaves and cooked greens where safe and tasty.

Source: [2018 food-specific vitamin retention](https://pubmed.ncbi.nlm.nih.gov/30263756/).

### Salmon versus already-canned sardines

A [2014 fish cooking experiment](https://pubmed.ncbi.nlm.nih.gov/24996368/) found little omega-3 loss from baking/broiling/frying in four particular species, but frying changed fatty acids absorbed from the oil. A [2025 wet-heat fish comparison](https://www.sciencedirect.com/science/article/pii/S0889157525002972) found steaming retained more EPA/DHA than baking in foil **for three different warm-water species**. Different species, methods, edible yield and denominator produce different answers. **Do not transfer those percentages directly to Patagonian coho** or assume high-heat searing destroys all omega-3. **Canned sardines are already cooked** and can be eaten cold or stirred into hot rice just before serving. Check fish edible weight, salt and bones actually eaten.

NSW food guidance specifies **fish core 63°C** and describes a clean thermometer: [Cooking temperatures](https://www.foodauthority.nsw.gov.au/consumer/food-safety-home/cooking-temperatures).

### Chicken, beef, pork, mince and other animal proteins

**Safety precedes a minor vitamin advantage.** FSANZ's household food-safety guidance recommends **at least 75°C in the centre for all poultry and minced/rolled meat**, whereas the NSW cooking-temperatures table lists poultry at 74°C. As a practical, conservative app default, recommend **75°C for chicken** (do not tell cooks that a timer or colour alone establishes this). For fresh non-minced red meat, the temperature requirements differ by cut and preparation. Poaching, roasting, stewing and lightly pan cooking can all fit a nutritious pattern. Deep-fried or heavily charred meat is not the default, and **processed meat such as bacon is more usefully replaced than 'optimised' by frying method**.

Sources: [FSANZ household food safety](https://www.foodstandards.gov.au/consumer/prevention-of-foodborne-illness/food-safety-basics), [NSW thermometer table](https://www.foodauthority.nsw.gov.au/consumer/food-safety-home/cooking-temperatures), [Heart Foundation cooking](https://www.heartfoundation.au/healthy-living/healthy-eating/skills/heart-healthy-cooking-tips).

### Dried red kidney beans, chickpeas, black beans, split lentils and soy

Commercial tins are cooked. **Raw/soaked red kidney beans must not be served or moved directly into a slow cooker at sub-boiling temperatures.** FDA's Bad Bug Book warns of phytohaemagglutinin (lectins): [Kidney-bean chapter](https://www.fda.gov/files/food/published/Bad-Bug-Book-2nd-Edition-%28PDF%29.pdf). Although controlled boiling may destroy toxin more rapidly, the FDA recommends **boiling dried beans for at least 30 minutes** as consumer precaution. A correctly operated pressure cooker can cook properly, but don't supply an invented universal programme length. Red split lentils simmer until soft and don't routinely need soaking. **Canned kidney beans, black beans and chickpeas are pre-cooked**, so they can be rinsed and reheated briefly.

A [2026 legume processing review](https://pmc.ncbi.nlm.nih.gov/articles/PMC13396823/) discusses soaking, cooking, mineral leaching and antinutrients, with food-specific differences. This **does not justify eating undercooked pulses to maximise vitamin C**.

### Brown rice, quinoa, oats, wholegrain bread and historical pasta

The [US FDA rice arsenic advice](https://www.fda.gov/food/environmental-contaminants-food/what-you-can-do-limit-exposure-arsenic) finds boiling rice in 6–10 parts water and draining can remove **about 40–60% inorganic arsenic**, depending on rice, but it can also remove enriched nutrients (including folate, iron, thiamine and niacin in fortified polished rice). [Original experimental paper](https://pubmed.ncbi.nlm.nih.gov/26515534/). Rice absorption cooking keeps more soluble food compounds. **Neither method is unconditionally 'best'**. Varying grains, including quinoa and oats, is sensible.

Wholegrain bread can be eaten soft or lightly toasted; [FSANZ acrylamide advice, updated 2026](https://www.foodstandards.gov.au/consumer/chemicals/acrylamide), recommends **toasting as lightly as acceptable** and avoiding dark scorching. Potatoes/other starches browned very dark at high temperatures may form acrylamide; for moderate oven potato products, FSANZ cites 180–190°C and light-golden finish. For rice/pasta, the **cooling/holding temperatures and reheating limits are a separate, serious issue**: refrigerate promptly, rice/pasta for **no more than 2 days**, never reheat them more than once. [NSW Food Authority leftovers](https://www.foodauthority.nsw.gov.au/consumer/food-extra-care/leftovers).

### Olive oil, walnuts, chia, flax, soy milk, spice and fruit handling

- **Olive oil:** raw dressings and normal moderate sauté/roast cooking are reasonable; don't smoke/reuse oils repeatedly. [Heart Foundation fats](https://www.heartfoundation.au/healthy-living/healthy-eating/fats-oils-and-heart-health).
- **Walnuts/flax/chia:** add walnuts and ground flax after heating for texture and to avoid unnecessary additional exposure; **no strong human evidence that raw flax must never be baked**. Chia can be hydrated in safely refrigerated oats.
- **Fortified soy milk:** warming doesn't remove its calcium; the package and manufacturer-specific fortified nutrient panel remain crucial. **Do not equate coconut cream with fortified soy milk**.
- **Berry handling:** washing fresh produce or properly cooking frozen berries as needed for vulnerable people takes precedence over any marginal theoretical raw vitamin advantage. Follow [FSANZ higher-risk food guidance](https://www.foodstandards.gov.au/consumer/prevention-of-foodborne-illness/Food-safety-for-vulnerable-populations).
- **Hummus:** for vulnerable groups, FSANZ flags chilled ready-to-eat hummus/tahini as higher-risk; warming a dip briefly without proper handling isn't a reliable safety fix. Opt for freshly prepared cooked legumes when advised.
- **Garlic, ginger, cinnamon, pepper, cumin, smoked paprika, turmeric, oregano, coriander and parsley:** gently cook/bloom or finish according to taste. No real evidence for cooking each spice at a particular second to add human lifespan. Normal food amounts are not clinical doses or medical therapy.
- **Water and iodised salt:** classified as cooking mediums/seasoning instead of forcing nonsensical 'deep-fry salt' comparisons. Water contact changes leaching; iodised salt supports iodine but added sodium should still be moderated.

## Evidence-confidence interpretation

| Domain | Strongest available kind of evidence | Proper inference |
|---|---|---|
| Poultry centre temperatures, raw kidney-bean lectin poisoning, cooled rice, raw egg vulnerable population | Regulatory safety guidance plus established outbreaks/hazards | Essential safety decisions |
| Broccoli glucosinolates/vitamin C, general steamed vs boiled vegetables, fish EPA/DHA retention | Laboratory food-composition studies | Nutrient-specific, preparation-specific; not mortality |
| Tomato lycopene and carrot beta-carotene absorption | Small controlled human interventions | Biomarker response, not longevity benefit |
| Cooking fats, reducing deep-frying/processed meat and eating diverse plants | National cardiovascular dietary-pattern guidance | Sensible default culinary advice |
| Minor spice-specific 'optimal technique', old recipe substitutions and historical foods | General evidence/extrapolation | Culinary preference; substantial uncertainty |

### Implementation contract

- Site navigation, homepage, science, longevity guide and **every recipe detail** link to the Lab. Recipe detail adds `?recipe=<id>` to show its ingredients immediately; `?food=egg` opens eggs directly.
- Filter by ingredient name/product alias, food type or the original 17 recipes; the detail shows **method A vs method B**, plus the complete all-method comparison table.
- Every record has a practical starting suggestion, differences, safety warnings, source links and explicit uncertainty. **No fabricated numerical lifespan or nutrient retention ranks.**
- The lab loads all current recipe and basket names dynamically, so the 132/132 coverage status is genuine and changes when ingredients are edited.
- Unit tests fail if an active ingredient is unmatched or an entry loses its evidence links.
- This public static content does **not** upload meal schedules or identities; research links navigate to the original publisher.
- **Still unverified:** real cooking trials for every food; measured times for each household stove/appliance; AFCD raw-to-cooked yield/retention for every specific retail product; systematic named-ingredient extraction from every archived markdown and private Google Drive historical version; any direct life-extension from a cooking method.
