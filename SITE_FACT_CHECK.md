
# Website fact-check ledger — Good Food, Long Game (16 October 2026)

This ledger checks **the important claims made by the V6 recipes and published website**. It does **not** claim every possible micronutrient, serving, availability and individual health outcome has been independently verified. This is a public repo: avoid personal health details, family photos, or dietary records.

**How to read:** ✅ Label verified = matched to listed Woolworths manufacturer details; 📗 Australian guidance = national/state government or Heart Foundation; 🧮 Arithmetic verified = computed from stated label weights/pack counts; ⚠️ Estimated / not established = not measured or no valid evidence.

| Claim | Level | What was verified / important correction | Evidence |
|---|---|---|---|
| Mediterranean-style eating can help heart health | 📗 Evidence about **diet patterns** | PREDIMED corrected 2018 trial reports lower cardiovascular events in higher-risk adults with Mediterranean dietary patterns, **not proof these exact bowls extend life** | [PREDIMED](https://www.nejm.org/doi/10.1056/NEJMoa1800389) |
| Eat oily fish two–three times weekly | 📗 Australian guidance | Heart Foundation says 2–3 serves of oily fish/fish per week. Fish eaten at dinner counts too; it's not “more fish always better” | [Heart Foundation](https://www.heartfoundation.org.au/healthy-living/healthy-eating/omega-3-omega-6-heart-health) |
| John West sardines 110 g | ✅ Label verified | The pack's **edible serving is 75 g**, 13.9 g protein and **176 mg sodium**. An 8-tin batch is ~600 g edible fish. Do not call it sodium-free. | [Woolworths](https://www.woolworths.com.au/shop/productdetails/98523) |
| Coho salmon 500 g | ✅ Label verified | Four **125 g RAW** portions, each **24.4 g protein** and **60 mg sodium**. Cooked weight will differ. Follow thawing below 4°C and use within 24 hours. | [Woolworths](https://www.woolworths.com.au/shop/productdetails/6050076) |
| Coho 625 g used from two packs | 🧮 Arithmetic verified | Five raw portions = 625 g; after buying 2 × 500 g bags **375 g of raw salmon remains**, if safely kept frozen. Actual ability to separate frozen portions must be checked. | [Woolworths pack](https://www.woolworths.com.au/shop/productdetails/6050076) |
| Evergreen 650 g tofu | ✅ Label verified | **24 g protein / 100 g**, calcium sulphate ingredient; **calcium mg amount not reported**. Two 650 g packs provide 1250 g recipe use + 50 g remainder. | [Woolworths](https://www.woolworths.com.au/shop/productdetails/595465) |
| Tofu is an assured calcium source | ⚠️ Not established | Calcium-sulphate set indicates a plausible source, but **no quantitative calcium guarantee**. Verify a suitable fortified drink or other calcium sources in the complete diet. | [Woolworths](https://www.woolworths.com.au/shop/productdetails/595465) |
| So Good High Protein Soy | ✅ Label verified | **10 g protein and 400 mg calcium** per 250 mL (check pack), **1.8 g sugars** and **163 mg sodium**; contains cane sugar and maltodextrin. Fortified food can still be healthy. | [Woolworths](https://www.woolworths.com.au/shop/productdetails/6021686) |
| Every lunch has optimal protein/calcium/iodine | ⚠️ Not established | Label-only partial protein subtotals, not full nutrient database calculations; whole-day adequacy, iodine, D, B12 depend on total diet. Do not label **all meals 100/100**. | [V6 audit](v6/EVIDENCE.md) |
| All recipes dairy-free and gluten-free | ⚠️ Conditional | Recipes deliberately exclude dairy ingredients. Strict gluten-free status **depends on exact packages and precautionary cross-contact labels**; some photographed pantry products carried warnings. | [FSANZ](https://www.foodstandards.gov.au/consumer/labelling/allergen-labelling) |
| 20 meals can be safely batch-cooked at once | ⚠️ Not assured | Use **four separate five-portion batches** unless your fridge/freezer cooling capacity is sufficient; shallow portions and prompt cooling are essential. | [NSW Food Authority](https://www.foodauthority.nsw.gov.au/consumer/food-extra-care/leftovers) |
| Refrigerate leftovers within 2 hours | 📗 NSW food safety | Small shallow portions, fridge below 5°C; **rice max 2 refrigerated days**, other leftovers max 3, freeze leftovers up to 3 months, thaw in fridge/use within 24 h and reheat steaming hot; rice only once. | [NSW Food Authority](https://www.foodauthority.nsw.gov.au/consumer/food-extra-care/leftovers) |
| Prices $256.43 | 🧮 Calculation ✅; ⚠️ price estimates | **35 listed pack estimates add to $256.43** with full pantry packs, 5 L optional soy; *actual checkout is unknown*, and pack leftovers mean $12.82 is **not true ingredient consumption cost**. | [V6 shopping](v6/SHOPPING.md), [app data](site-data.js), [tests](tests/site.test.cjs) |
| Woolworths Dubbo has every specific product in stock | ⚠️ Not checked | National listing ≠ local stock; check selected Dubbo Woolworths storefront before going. | [Woolworths site](https://www.woolworths.com.au/) |
| 100/100 health/longevity or uniquely "best" brands | ❌ Unsupported | **No validated universal 100-point nutrition/longevity score exists**. The V6 /100 scores are subjective organisational choices and differences of one or two points are meaningless without outcome data. | [V6 scoring assumptions](v6/EVIDENCE.md) |
| Organic quinoa is proven better for lifespan | ❌ Unsupported | Organic certification does not establish measurable longevity superiority. Practical label, cost and consistent overall dietary quality matter. | [Australian dietary guidelines](https://www.nhmrc.gov.au/adg) |

## Why these ingredients are reasonable choices
- **Sardines and coho salmon:** sources of marine omega-3 and quality protein. Portion sizes matter; source labelling and sodium differ. Don't interpret individual fish lunches as a guaranteed 100 g *cooked* serve.
- **Chickpeas, black beans, red lentils:** inexpensive legumes provide fibre and plant protein; no-added-salt versions help keep sodium lower. Not maximising fibre in every meal: high-fibre foods may need gradual introduction.
- **Hard tofu and fortified soy:** nutritionally useful dairy-free plant proteins; fortified soy has quantified calcium/B12/D ingredients on the label, whereas tofu calcium is unquantified. Ingredient processing alone doesn't establish that food is unhealthy.
- **Quinoa/brown rice:** minimally processed grain/pseudograin components add carbohydrate for energy and some fibre/protein. Different activity levels require different serving energy.
- **Broccoli, cauliflower, spinach, kale, carrots, capsicum, zucchini, peas and pumpkin:** several vegetable subgroups and colours, helping coverage of diverse vitamins/minerals, but cooking modifies amounts.
- **Walnuts and ground flax:** plant ALA omega-3 and unsaturated fats. Plant ALA is **not** the same as marine DHA/EPA. No scientific reason to force extra nuts when calories/satiety are already sufficient.
- **Extra virgin olive oil:** unsaturated-fat cooking choice; regular olive oil is a sound option if already available. An expensive brand does not guarantee additional years alive.
- **Oranges, kiwi and lemon:** whole fruit diversity and vitamin C; vitamin C can support absorption of non-haem plant iron but does not ensure adequate iron status.
- **Ginger/turmeric/cumin/paprika:** taste and enjoyment without heavy salty stock. Don't make disease-prevention claims based on amounts used in these recipes.

## Research quality and outstanding gaps

**What has been done:** Read V6 files including shopping and evidence; inspected authoritative product labels for fish, tofu and soy; verified NSW leftover guidance and current Heart Foundation fish recommendations; checked the shopping arithmetic and web-app syntax; deployed a Git-connected website that returns HTTP 200. Automated tests check source data and app structure.

**What is NOT done:** no locally authenticated Dubbo Woolworths cart; no guaranteed stock/prices; no independent full AUSNUT-style nutrient analysis using actual drained weights and cooking losses; no in-person kitchen taste or freezer texture test; no clinical outcome trial on these recipes; no fully verified public-browser screenshot (testing container blocked public domain). These are explicitly outside current verification.

**Practical shopping rule:** use the app checklist as a guide, but compare *current packet labels* and *the selected Dubbo store price* before purchase. In higher-stakes contexts (allergy, prescribed diet or immunocompromise), seek personalised advice.

The user requested the healthiest possible. **Our scientifically honest response is the best clearly documented, nutritionally coherent *practical* menu — not an untestable perfect-health marketing claim.**
