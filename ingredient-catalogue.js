/* Explicit version-1 ingredient identities for all 17 recipes (151 ingredient uses).
 * Exact source labels and units map to stable IDs, NEVER approximate name regexes.
 * Known varieties, branded SKUs, physical states and incomplete allergens remain distinct.
 * Added as a backward-compatible projection: legacy recipe tuples, shopping/pantry keys,
 * user plans and saved cooking records are never overwritten.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root){root.FoodIngredients=api;if(root.FOOD_DATA?.recipes)api.apply(root.FOOD_DATA.recipes);}
})(typeof window!=="undefined"?window:null,function(){
 "use strict";
 const VERSION="ingredient-catalogue-v1";
 const entries=[
  {
    "id": "condiment-tamari",
    "variants": [
      [
        "mL",
        "reduced-sodium gluten-free tamari (check label)"
      ]
    ],
    "allergens": [
      "soy"
    ],
    "mayContain": [
      "wheat/gluten"
    ],
    "note": "GF claim requires pack verification"
  },
  {
    "id": "drink-soy-milk-fortified",
    "variants": [
      [
        "mL",
        "calcium-fortified unsweetened soy milk"
      ],
      [
        "mL",
        "unsweetened calcium-fortified soy milk"
      ]
    ],
    "allergens": [
      "soy"
    ],
    "afcd": [
      [
        "F008720",
        1
      ]
    ],
    "note": "fortification and protein must be checked on actual carton"
  },
  {
    "id": "fish-salmon-coho",
    "variants": [
      [
        "g",
        "raw Ocean Chef coho salmon (125 g raw per serving; buy whole 500 g packs as needed)"
      ]
    ],
    "allergens": [
      "fish"
    ],
    "sku": "6050076",
    "shop": "salmon",
    "afcd": [
      [
        "F007827",
        1
      ]
    ],
    "note": "Atlantic salmon AFCD proxy does NOT represent branded coho"
  },
  {
    "id": "fish-salmon-generic",
    "variants": [
      [
        "g",
        "raw salmon fillet"
      ]
    ],
    "allergens": [
      "fish"
    ],
    "afcd": [
      [
        "F007827",
        1
      ]
    ],
    "note": "generic Atlantic salmon proxy"
  },
  {
    "id": "fish-sardines",
    "variants": [
      [
        "tins",
        "John West springwater sardines, 110 g (75 g drained each)"
      ]
    ],
    "allergens": [
      "fish"
    ],
    "sku": "98523",
    "shop": "sardines"
  },
  {
    "id": "food-soy-yoghurt-fortified",
    "variants": [
      [
        "g",
        "plain calcium-fortified soy yoghurt, if available"
      ]
    ],
    "allergens": [
      "soy"
    ],
    "note": "fortification is unverified"
  },
  {
    "id": "fruit-apple",
    "variants": [
      [
        "",
        "medium apple"
      ]
    ],
    "afcd": [
      [
        "F000095",
        1
      ]
    ]
  },
  {
    "id": "fruit-banana",
    "variants": [
      [
        "",
        "small banana"
      ]
    ],
    "afcd": [
      [
        "F000262",
        1
      ]
    ]
  },
  {
    "id": "fruit-berries-frozen",
    "variants": [
      [
        "g",
        "frozen mixed berries"
      ],
      [
        "g",
        "frozen berries"
      ]
    ],
    "afcd": [
      [
        "F001289",
        0.5
      ],
      [
        "F008951",
        0.5
      ]
    ],
    "note": "50/50 berries proxy, not measured mix"
  },
  {
    "id": "fruit-berries-unspecified",
    "variants": [
      [
        "g",
        "berries"
      ]
    ],
    "afcd": [
      [
        "F001289",
        0.5
      ],
      [
        "F008951",
        0.5
      ]
    ],
    "note": "unspecified fresh/frozen berries; proxy"
  },
  {
    "id": "fruit-kiwifruit",
    "variants": [
      [
        "",
        "green kiwifruit, fresh"
      ],
      [
        "",
        "green kiwifruit"
      ]
    ],
    "shop": "kiwi",
    "afcd": [
      [
        "F004816",
        1
      ]
    ]
  },
  {
    "id": "fruit-lemon-juice",
    "variants": [
      [
        "mL",
        "fresh lemon juice"
      ],
      [
        "mL",
        "lemon juice"
      ]
    ],
    "afcd": [
      [
        "F004726",
        1
      ]
    ]
  },
  {
    "id": "fruit-lemon-whole",
    "variants": [
      [
        "",
        "lemon, juice"
      ],
      [
        "",
        "lemon"
      ]
    ],
    "afcd": [
      [
        "F004726",
        1
      ]
    ],
    "note": "lemon juice not whole lemon; edible grams require measurement"
  },
  {
    "id": "fruit-orange",
    "variants": [
      [
        "",
        "oranges, served fresh"
      ],
      [
        "",
        "oranges, fresh"
      ]
    ],
    "afcd": [
      [
        "F006277",
        1
      ]
    ]
  },
  {
    "id": "grain-bread-wholegrain",
    "variants": [
      [
        "slice",
        "wholegrain bread (check dairy/gluten labels)"
      ],
      [
        "slices",
        "wholegrain toast (dairy/gluten labels)"
      ]
    ],
    "allergens": [
      "wheat/gluten"
    ],
    "note": "Gluten-free-labelled variant not defined"
  },
  {
    "id": "grain-brown-rice-dry",
    "variants": [
      [
        "g",
        "dry brown rice"
      ]
    ],
    "shop": "rice",
    "afcd": [
      [
        "F007648",
        1
      ]
    ]
  },
  {
    "id": "grain-oats-rolled",
    "variants": [
      [
        "g",
        "plain rolled oats (gluten-free certified if needed)"
      ]
    ],
    "afcd": [
      [
        "F006143",
        1
      ]
    ],
    "mayContain": [
      "wheat/gluten cross-contact"
    ]
  },
  {
    "id": "grain-quinoa-dry",
    "variants": [
      [
        "g",
        "dry plain quinoa"
      ],
      [
        "g",
        "dry white quinoa"
      ],
      [
        "g",
        "dry quinoa"
      ]
    ],
    "shop": "quinoa",
    "afcd": [
      [
        "F007598",
        1
      ]
    ]
  },
  {
    "id": "herb-garlic",
    "variants": [
      [
        "g",
        "garlic"
      ],
      [
        "cloves",
        "garlic, minced"
      ],
      [
        "cloves",
        "garlic"
      ]
    ],
    "afcd": [
      [
        "F004193",
        1
      ]
    ]
  },
  {
    "id": "herb-ginger",
    "variants": [
      [
        "g",
        "grated fresh ginger"
      ],
      [
        "g",
        "fresh ginger"
      ]
    ],
    "afcd": [
      [
        "F004213",
        1
      ]
    ]
  },
  {
    "id": "herb-oregano",
    "variants": [
      [
        "tsp",
        "dried oregano"
      ],
      [
        "tsp",
        "oregano"
      ]
    ]
  },
  {
    "id": "ingredient-water",
    "variants": [
      [
        "mL",
        "water for lentil simmer; add extra only as needed"
      ],
      [
        "mL",
        "water, add more as needed"
      ]
    ]
  },
  {
    "id": "legume-black-beans-canned",
    "variants": [
      [
        "tins",
        "Woolworths black beans no added salt, 420 g"
      ],
      [
        "tin",
        "no-added-salt black beans 420 g, drained/rinsed"
      ]
    ],
    "shop": "blackbeans"
  },
  {
    "id": "legume-chickpeas-canned",
    "variants": [
      [
        "tins",
        "Woolworths no-added-salt chickpeas, 420 g"
      ],
      [
        "g",
        "no-added-salt canned chickpeas, drained/rinsed"
      ]
    ],
    "shop": "chickpeas",
    "afcd": [
      [
        "F002880",
        1
      ]
    ],
    "note": "generic AFCD legume proxy; exact Woolworths SKU only for branded variant"
  },
  {
    "id": "legume-kidney-beans-canned",
    "variants": [
      [
        "tins",
        "no-added-salt kidney beans 420 g each, drained/rinsed"
      ]
    ],
    "afcd": [
      [
        "F000448",
        1
      ]
    ],
    "note": "product edible yield unverified"
  },
  {
    "id": "legume-red-lentils-dry",
    "variants": [
      [
        "g",
        "dry red split lentils"
      ]
    ],
    "afcd": [
      [
        "F005184",
        1
      ]
    ]
  },
  {
    "id": "nut-walnuts",
    "variants": [
      [
        "g",
        "walnuts, added after reheating"
      ],
      [
        "g",
        "walnuts, add after reheating"
      ],
      [
        "g",
        "walnuts after reheating"
      ],
      [
        "g",
        "unsalted walnuts"
      ],
      [
        "g",
        "walnut pieces"
      ]
    ],
    "allergens": [
      "tree nuts"
    ],
    "shop": "walnuts",
    "afcd": [
      [
        "F006116",
        1
      ]
    ]
  },
  {
    "id": "oil-olive",
    "variants": [
      [
        "mL",
        "extra virgin olive oil"
      ],
      [
        "mL",
        "EVOO"
      ],
      [
        "mL",
        "olive oil"
      ]
    ],
    "shop": "oil",
    "afcd": [
      [
        "F006177",
        1
      ]
    ]
  },
  {
    "id": "protein-chicken-thigh",
    "variants": [
      [
        "g",
        "boneless skinless chicken thigh (raw)"
      ]
    ],
    "afcd": [
      [
        "F002806",
        1
      ]
    ]
  },
  {
    "id": "protein-eggs",
    "variants": [
      [
        "",
        "large eggs"
      ],
      [
        "",
        "large egg"
      ]
    ],
    "allergens": [
      "egg"
    ],
    "afcd": [
      [
        "F003729",
        1
      ]
    ]
  },
  {
    "id": "protein-tofu-evergreen",
    "variants": [
      [
        "g",
        "Evergreen hard tofu, raw"
      ]
    ],
    "allergens": [
      "soy"
    ],
    "sku": "595465",
    "shop": "tofu",
    "afcd": [
      [
        "F009176",
        1
      ]
    ],
    "note": "Use branded energy/protein; do not invent calcium"
  },
  {
    "id": "protein-tofu-generic",
    "variants": [
      [
        "g",
        "firm tofu, soy allergen"
      ]
    ],
    "allergens": [
      "soy"
    ],
    "afcd": [
      [
        "F009176",
        1
      ]
    ],
    "note": "No Evergreen product/price equivalence"
  },
  {
    "id": "seed-chia",
    "variants": [
      [
        "g",
        "chia seeds"
      ]
    ],
    "afcd": [
      [
        "F008209",
        1
      ]
    ]
  },
  {
    "id": "seed-flaxseed",
    "variants": [
      [
        "g",
        "ground flaxseed after reheating"
      ],
      [
        "g",
        "ground flaxseed, add after reheating"
      ]
    ],
    "afcd": [
      [
        "F008210",
        1
      ]
    ]
  },
  {
    "id": "spice-black-pepper",
    "variants": [
      [
        "tsp",
        "black pepper"
      ],
      [
        "pinch",
        "black pepper"
      ]
    ]
  },
  {
    "id": "spice-cinnamon",
    "variants": [
      [
        "tsp",
        "cinnamon"
      ]
    ]
  },
  {
    "id": "spice-coriander",
    "variants": [
      [
        "tsp",
        "ground coriander"
      ]
    ]
  },
  {
    "id": "spice-cumin",
    "variants": [
      [
        "tsp",
        "ground cumin"
      ],
      [
        "tsp",
        "cumin"
      ]
    ]
  },
  {
    "id": "spice-paprika-smoked",
    "variants": [
      [
        "tsp",
        "smoked paprika"
      ]
    ]
  },
  {
    "id": "spice-turmeric",
    "variants": [
      [
        "tsp",
        "turmeric"
      ]
    ]
  },
  {
    "id": "spread-hummus",
    "variants": [
      [
        "g",
        "hummus (check sesame and dairy labels)"
      ]
    ],
    "mayContain": [
      "sesame"
    ],
    "afcd": [
      [
        "F003539",
        1
      ]
    ],
    "note": "hummus tahini and allergen label must be checked"
  },
  {
    "id": "spread-nut-butter-unspecified",
    "variants": [
      [
        "g",
        "natural almond or peanut butter (check allergens)"
      ]
    ],
    "mayContain": [
      "peanut",
      "tree nuts"
    ],
    "note": "Choice of almond OR peanut unresolved; do not classify allergy-safe"
  },
  {
    "id": "spread-peanut-butter",
    "variants": [
      [
        "g",
        "natural peanut butter (allergen)"
      ]
    ],
    "allergens": [
      "peanut"
    ],
    "afcd": [
      [
        "F006579",
        1
      ]
    ]
  },
  {
    "id": "vegetable-avocado",
    "variants": [
      [
        "g",
        "avocado flesh"
      ]
    ],
    "afcd": [
      [
        "F000162",
        1
      ]
    ]
  },
  {
    "id": "vegetable-brassica-frozen-mix",
    "variants": [
      [
        "g",
        "frozen broccoli/cauliflower"
      ]
    ],
    "shop": "brassicas",
    "afcd": [
      [
        "F001905",
        0.5
      ],
      [
        "F002378",
        0.5
      ]
    ],
    "note": "50/50 modelling assumption; actual frozen mix proportions unverified"
  },
  {
    "id": "vegetable-broccoli-fresh",
    "variants": [
      [
        "g",
        "broccoli"
      ]
    ],
    "afcd": [
      [
        "F001905",
        1
      ]
    ]
  },
  {
    "id": "vegetable-capsicum-red",
    "variants": [
      [
        "g",
        "red capsicum"
      ]
    ],
    "afcd": [
      [
        "F002247",
        1
      ]
    ]
  },
  {
    "id": "vegetable-carrot",
    "variants": [
      [
        "g",
        "carrots"
      ],
      [
        "g",
        "carrots, cubed"
      ],
      [
        "g",
        "carrot sticks"
      ]
    ],
    "shop": "carrot",
    "afcd": [
      [
        "F002276",
        1
      ]
    ]
  },
  {
    "id": "vegetable-cucumber",
    "variants": [
      [
        "g",
        "cucumber slices"
      ]
    ],
    "afcd": [
      [
        "F003320",
        1
      ]
    ]
  },
  {
    "id": "vegetable-green-beans",
    "variants": [
      [
        "g",
        "green beans"
      ]
    ]
  },
  {
    "id": "vegetable-kale",
    "variants": [
      [
        "g",
        "de-stemmed kale leaves"
      ],
      [
        "g",
        "de-stemmed kale"
      ]
    ],
    "afcd": [
      [
        "F004781",
        1
      ]
    ]
  },
  {
    "id": "vegetable-mushroom",
    "variants": [
      [
        "g",
        "mushrooms"
      ],
      [
        "g",
        "mushrooms, sliced"
      ]
    ],
    "shop": "mushrooms",
    "afcd": [
      [
        "F005946",
        1
      ]
    ]
  },
  {
    "id": "vegetable-onion",
    "variants": [
      [
        "g",
        "peeled brown onion"
      ],
      [
        "g",
        "peeled onion"
      ],
      [
        "g",
        "brown onion"
      ],
      [
        "g",
        "onion"
      ]
    ],
    "afcd": [
      [
        "F006225",
        1
      ]
    ],
    "note": "brown onion proxy; onion colour can vary"
  },
  {
    "id": "vegetable-peas-frozen",
    "variants": [
      [
        "g",
        "frozen baby peas"
      ]
    ]
  },
  {
    "id": "vegetable-pumpkin",
    "variants": [
      [
        "g",
        "peeled/deseeded pumpkin"
      ]
    ],
    "afcd": [
      [
        "F007535",
        1
      ]
    ],
    "note": "butternut proxy; exact pumpkin cultivar unverified"
  },
  {
    "id": "vegetable-spinach-baby",
    "variants": [
      [
        "g",
        "baby spinach"
      ]
    ],
    "shop": "spinach-fresh",
    "afcd": [
      [
        "F008749",
        1
      ]
    ]
  },
  {
    "id": "vegetable-spinach-frozen",
    "variants": [
      [
        "g",
        "frozen spinach"
      ]
    ],
    "afcd": [
      [
        "F008749",
        1
      ]
    ],
    "note": "raw spinach AFCD proxy; frozen product may differ"
  },
  {
    "id": "vegetable-sweet-potato",
    "variants": [
      [
        "g",
        "sweet potato, trimmed"
      ]
    ],
    "afcd": [
      [
        "F009035",
        1
      ]
    ]
  },
  {
    "id": "vegetable-tomato-canned",
    "variants": [
      [
        "g",
        "diced tomatoes, no added salt"
      ],
      [
        "g",
        "plain diced tomatoes"
      ],
      [
        "g",
        "no-added-salt diced tomatoes"
      ],
      [
        "g",
        "diced tomatoes no added salt"
      ]
    ],
    "shop": "tomatoes-tinned",
    "afcd": [
      [
        "F010071",
        1
      ]
    ]
  },
  {
    "id": "vegetable-tomato-cherry",
    "variants": [
      [
        "g",
        "cherry tomatoes"
      ]
    ],
    "afcd": [
      [
        "F009193",
        1
      ]
    ],
    "note": "generic raw tomato proxy"
  },
  {
    "id": "vegetable-tomato-fresh",
    "variants": [
      [
        "",
        "small tomato"
      ],
      [
        "",
        "medium tomato"
      ]
    ],
    "afcd": [
      [
        "F009193",
        1
      ]
    ]
  },
  {
    "id": "vegetable-zucchini",
    "variants": [
      [
        "g",
        "zucchini"
      ]
    ],
    "afcd": [
      [
        "F009775",
        1
      ]
    ]
  }
];
 const byId=new Map(),byVariant=new Map(),byName=new Map();
 function key(unit,name){return JSON.stringify([unit,name]);}
 for(const entry of entries){
  if(byId.has(entry.id))throw Error("Duplicate ingredient ID: "+entry.id);
  const row=Object.freeze({...entry,allergens:Object.freeze([...(entry.allergens||[])]),
    mayContain:Object.freeze([...(entry.mayContain||[])]),
    afcd:Object.freeze((entry.afcd||[]).map(x=>Object.freeze([...x]))),
    variants:Object.freeze(entry.variants.map(x=>Object.freeze([...x])))});
  byId.set(entry.id,row);
  for(const [unit,name] of entry.variants){
   const k=key(unit,name);
   if(byVariant.has(k))throw Error("Duplicate exact ingredient variant: "+k);
   byVariant.set(k,row);
   if(!byName.has(name))byName.set(name,new Set());
   byName.get(name).add(row.id);
  }
 }
 function resolve(name,unit){
  if(typeof name!=="string"||typeof unit!=="string")return null;
  return byVariant.get(key(unit,name))||null;
 }
 function resolveName(name){
  const found=byName.get(name);
  return found?.size===1?byId.get([...found][0]):null;
 }
 function byIngredient(tuple){return Array.isArray(tuple)?resolve(tuple[2],tuple[1]):null;}
 function products(ingredient){
  const row=typeof ingredient==="string"?byId.get(ingredient):byIngredient(ingredient);
  return row?{id:row.id,sku:row.sku||null,shoppingKey:row.shop||null,allergens:row.allergens,
    mayContain:row.mayContain,note:row.note||null}:null;
 }
 function apply(recipes){
  if(!Array.isArray(recipes))throw Error("Recipes must be an array");
  for(const r of recipes){
   if(!Array.isArray(r.ingredients))throw Error("Missing recipe ingredient tuples in "+r.id);
   const resolved=r.ingredients.map((ing,i)=>{
    const match=byIngredient(ing);
    if(!match)throw Error("Missing canonical ingredient "+r.id+"["+i+"]: "+JSON.stringify(ing));
    const [amount,unit,label]=ing;
    if(!Number.isFinite(amount)||amount<0)throw Error("Invalid measured ingredient in "+r.id);
    return Object.freeze({id:match.id,amount,unit,label,sku:match.sku||null,
      allergens:match.allergens,mayContain:match.mayContain,shoppingKey:match.shop||null});
   });
   // Non-serialised projection: saved recipe IDs and original arrays stay unchanged.
   Object.defineProperty(r,"ingredientRecords",{value:Object.freeze(resolved),writable:true,configurable:true,enumerable:false});
  }
  return recipes;
 }
 function allergensFor(recipe){
  if(!recipe?.ingredients)return {contains:[],labelCheck:[],unknown:false};
  // Synthetic or imported recipes may contain unknown food names. Do not
  // throw or pronounce them allergen-safe; strict apply() is only for the
  // validated 17 shipped recipes, and the unknown flag remains true.
  const records=recipe.ingredientRecords||recipe.ingredients.map(x=>{
   const match=byIngredient(x);
   return {allergens:match?.allergens||[],mayContain:match?.mayContain||[],sku:match?.sku||null,unmapped:!match};
  });
  return {contains:[...new Set(records.flatMap(r=>r.allergens))].sort(),
    labelCheck:[...new Set(records.flatMap(r=>r.mayContain))].sort(),
    unknown:records.some(r=>r.unmapped||!r.sku || r.mayContain.length>0)};
 }
 function verify(recipes){
  const arr=apply(recipes);return {version:VERSION,recipes:arr.length,
   lines:arr.reduce((n,r)=>n+r.ingredientRecords.length,0),variants:byVariant.size,identities:byId.size};
 }
 return Object.freeze({VERSION,entries:Object.freeze([...byId.values()]),resolve,resolveName,byIngredient,products,apply,allergensFor,verify,get:id=>byId.get(id)||null});
});
