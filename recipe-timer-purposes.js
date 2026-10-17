/* Specific timer purposes for every timed step in all 17 recipe guides.
 * A timer is a reminder for an action, NOT a food-safety or refrigeration guarantee.
 * Keep the original recipe step durations; do not let a timer stand in for
 * checking a product's pack directions or measuring the centre temperature.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.RecipeTimerPurposes=api;
})(typeof window!=="undefined"?window:null,function(){
 "use strict";
 const DATA={
  "a": [
    [
      0,
      "Chop the carrots, capsicum and zucchini",
      "When you begin washing and cutting the vegetables",
      "Vegetables are cut, trays are ready, and the fan oven is preheated separately",
      "prep"
    ],
    [
      1,
      "Roast the carrots, capsicum and zucchini",
      "When the loaded trays go into the preheated oven",
      "Turn once during roasting; remove when tender, not simply because time is up",
      "cook"
    ],
    [
      2,
      "Cook the dry quinoa",
      "When the rinsed quinoa and measured water start cooking",
      "Follow your packet; confirm water is absorbed, then rest covered for 5 minutes",
      "cook"
    ],
    [
      3,
      "Simmer the tomato and chickpea sauce",
      "Once the tomato, chickpeas and water have been added to the softened onion",
      "Sauce is bubbling gently and fully heated; the earlier onion sauté is separate",
      "cook"
    ],
    [
      4,
      "Cook the frozen broccoli and cauliflower",
      "When the frozen vegetables begin cooking",
      "Check packet instructions and that vegetables are fully hot; wilt spinach after",
      "cook"
    ],
    [
      5,
      "Weigh and divide the five sardine bowls",
      "When you start weighing and dividing the cooked base and drained fish",
      "Each portion has equal cooked base and about one-fifth of the actual drained fish; this is an organisation reminder",
      "prep"
    ]
  ],
  "b": [
    [
      1,
      "Cook the brown rice",
      "When rinsed rice and water begin cooking",
      "Rice is cooked according to its packet; if holding, cool it safely and promptly",
      "cook"
    ],
    [
      2,
      "Bake the coho salmon portions",
      "When the salmon goes into the preheated fan oven",
      "Check the thickest centre with a thermometer (recipe target about 63°C); time alone cannot prove safety",
      "cook"
    ],
    [
      3,
      "Simmer the chickpeas and vegetables",
      "After the sautéed onion and carrots, when chickpeas, water and frozen veg begin simmering",
      "Frozen vegetables are fully cooked to packet directions, and kale is wilted",
      "cook"
    ],
    [
      4,
      "Divide the salmon, rice and vegetables",
      "When you begin portioning the fully cooked components",
      "Five shallow containers are evenly portioned; start safe cooling promptly",
      "prep"
    ]
  ],
  "c": [
    [
      0,
      "Cook the brown rice",
      "When rinsed brown rice and water begin cooking",
      "Check packet directions and cooked texture; cool promptly if waiting",
      "cook"
    ],
    [
      1,
      "Soften the onion and carrots",
      "When onion and carrots enter the warm oiled pan",
      "Vegetables are softened; add garlic, ginger and spices briefly without burning",
      "cook"
    ],
    [
      2,
      "Simmer red lentils and pumpkin",
      "After adding lentils, pumpkin and water and bringing to a simmer",
      "Lentils have softened/collapsed and pumpkin is tender; stir and add water if needed",
      "cook"
    ],
    [
      3,
      "Heat tofu and vegetables through",
      "After adding tofu and tomatoes to the simmering lentils",
      "Tofu and vegetables are hot throughout; cook frozen brassicas to packet directions",
      "cook"
    ],
    [
      4,
      "Finish and divide the curry and rice",
      "When you begin adding the finishing oil/lemon and weighing portions",
      "Five shallow portions have similar amounts of rice, curry and tofu; chill promptly",
      "prep"
    ]
  ],
  "d": [
    [
      0,
      "Cook the quinoa",
      "When quinoa and measured water begin cooking",
      "Follow packet instructions, confirm cooked, then rest covered for 5 minutes",
      "cook"
    ],
    [
      1,
      "Sauté onion and mushrooms",
      "When the onion goes into the warm oiled pan",
      "Onion is softened and mushrooms have released most of their moisture; avoid burning",
      "cook"
    ],
    [
      2,
      "Soften capsicum and zucchini",
      "When chopped capsicum and zucchini join the pan",
      "Vegetables are softening; add garlic and spices near the end",
      "cook"
    ],
    [
      3,
      "Simmer tofu, black beans and tomato",
      "When tofu, beans, tomatoes and water start simmering",
      "Tofu and beans are hot throughout and sauce gently bubbles; stir carefully",
      "cook"
    ],
    [
      4,
      "Wilt kale and divide the bowls",
      "When kale is added to the simmering sauce",
      "Kale is tender and the completed food is portioned into five shallow containers",
      "cook"
    ]
  ],
  "br-oats": [
    [
      0,
      "Mix oats, soy milk and chia",
      "When you begin measuring and stirring the overnight-oats base",
      "Mixture is stirred together and covered; the 4-minute estimate is not refrigeration time",
      "prep"
    ],
    [
      2,
      "Add berries and walnuts to the oats",
      "When you begin topping the already chilled oats",
      "Toppings are prepared safely per berry-pack advice; serve promptly",
      "prep"
    ]
  ],
  "br-eggs": [
    [
      0,
      "Cook mushrooms and wilt spinach",
      "When the sliced mushrooms enter the warm pan",
      "Mushrooms have softened and spinach is wilted, not just when the clock rings",
      "cook"
    ],
    [
      1,
      "Scramble the eggs",
      "When the whisked eggs go into the pan",
      "Eggs are set throughout, particularly for people at higher food-safety risk",
      "cook"
    ],
    [
      2,
      "Plate eggs, tomato and toast",
      "When you start to assemble the cooked breakfast",
      "Serve hot; this is a plating reminder, not a cooking-temperature timer",
      "prep"
    ]
  ],
  "br-smoothie": [
    [
      0,
      "Wash and measure smoothie ingredients",
      "When you begin washing spinach and measuring the ingredients",
      "Ingredients are ready and any frozen berries have been handled per safety instructions",
      "prep"
    ],
    [
      1,
      "Blend the smoothie",
      "When the blender starts",
      "Mixture is smooth and comfortable to drink; stop earlier if already blended",
      "prep"
    ],
    [
      2,
      "Serve or refrigerate the smoothie",
      "When you begin pouring/covering the finished smoothie",
      "Serve immediately or cover and refrigerate; 1 minute is NOT safe room-temperature storage time",
      "prep"
    ]
  ],
  "br-toast": [
    [
      0,
      "Toast the wholegrain bread",
      "When the bread goes into the toaster",
      "Bread is as crisp as you want; stop early to avoid burning",
      "cook"
    ],
    [
      1,
      "Mash chickpeas, avocado and lemon",
      "When you start mashing the topping",
      "A spreadable topping is mixed; this is prep timing",
      "prep"
    ],
    [
      2,
      "Assemble the avocado-chickpea toast",
      "When you begin spreading topping and adding tomato",
      "Bread is topped and ready to eat; no doneness test applies",
      "prep"
    ]
  ],
  "di-lentil": [
    [
      0,
      "Cook the dinner brown rice",
      "When rinsed rice and measured water begin cooking",
      "Rice is cooked to its packet directions; keep hot or cool promptly",
      "cook"
    ],
    [
      1,
      "Simmer the lentil and vegetable soup",
      "When rinsed lentils, tomatoes and water begin simmering AFTER sautéing onion/carrot",
      "Lentils are fully soft; the preceding 5-minute vegetable sauté is separate",
      "cook"
    ],
    [
      2,
      "Finish spinach and portion dinner",
      "When you add spinach to the hot soup",
      "Spinach is cooked through and rice/soup are portioned; start safe storage promptly",
      "cook"
    ]
  ],
  "di-chicken": [
    [
      0,
      "Chop and season sweet potatoes",
      "When you begin chopping and coating the sweet potato",
      "Potatoes are ready on their tray and oven has been preheated separately",
      "prep"
    ],
    [
      1,
      "Roast chicken and sweet potato",
      "When the loaded trays enter the preheated oven",
      "Check chicken thickest centre reaches 75°C with a thermometer; the clock is NOT proof of doneness",
      "cook"
    ],
    [
      2,
      "Steam green beans and finish dinner",
      "When the green beans start steaming",
      "Beans are tender and chicken is verified cooked before serving",
      "cook"
    ]
  ],
  "di-chilli": [
    [
      0,
      "Cook brown rice for chilli",
      "When rice and measured water begin cooking",
      "Rice is done according to packet; keep hot or cool quickly",
      "cook"
    ],
    [
      1,
      "Sauté chilli onions, capsicum and mushrooms",
      "When the vegetables enter the heated oiled pan",
      "Vegetables are softened and not scorched",
      "cook"
    ],
    [
      2,
      "Simmer bean chilli",
      "When canned beans, tomatoes and spices start simmering",
      "Chilli is hot throughout, not just timed; cool leftovers promptly",
      "cook"
    ]
  ],
  "di-stirfry": [
    [
      0,
      "Cook rice for tofu stir-fry",
      "When rice and measured water begin cooking",
      "Rice reaches cooked texture according to packet",
      "cook"
    ],
    [
      1,
      "Brown tofu cubes",
      "When tofu enters the hot oiled pan",
      "Tofu is lightly browned on the surfaces, not burnt",
      "cook"
    ],
    [
      2,
      "Stir-fry mixed vegetables",
      "When carrots, mushrooms and capsicum start cooking",
      "Add frozen brassicas and finish to their packet directions until fully hot",
      "cook"
    ],
    [
      3,
      "Toss tofu, aromatics and tamari",
      "When ginger, garlic and tamari are added to the hot pan",
      "Ingredients are mixed and hot throughout; serve promptly",
      "cook"
    ]
  ],
  "di-salmon": [
    [
      0,
      "Roast the carrots",
      "When carrots go into the preheated fan oven",
      "Carrots are tender and not burnt, even if roast time varies",
      "cook"
    ],
    [
      1,
      "Cook the quinoa",
      "When quinoa and measured water begin cooking",
      "Quinoa is cooked per packet and water has been absorbed",
      "cook"
    ],
    [
      2,
      "Bake the salmon",
      "When salmon enters the preheated oven",
      "Check thickest centre reaches the recipe target (about 63°C) with a thermometer, and broccoli is fully cooked",
      "cook"
    ],
    [
      3,
      "Plate the salmon dinner",
      "When you begin dividing cooked ingredients across plates",
      "Two plates are ready; 2 minutes is a serving estimate",
      "prep"
    ]
  ],
  "sn-hummus": [
    [
      0,
      "Wash and slice carrots and cucumber",
      "When you start washing and cutting vegetables",
      "Vegetables are clean and cut into safe pieces",
      "prep"
    ],
    [
      1,
      "Measure and serve hummus",
      "When you start serving the hummus",
      "Serve promptly; keep leftovers refrigerated and check product safety for higher-risk eaters",
      "prep"
    ]
  ],
  "sn-apple": [
    [
      0,
      "Wash, core and slice the apple",
      "When you start washing and cutting the apple",
      "Apple is cut into manageable pieces",
      "prep"
    ],
    [
      1,
      "Serve apple with nut butter",
      "When you start plating and portioning the nut butter",
      "Snack is ready; verify allergens on your actual nut butter",
      "prep"
    ]
  ],
  "sn-eggs": [
    [
      0,
      "Boil egg until fully set",
      "When the egg is in simmering water",
      "Check yolk and white are fully set; 12 minutes is an approximate boiling reminder",
      "cook"
    ],
    [
      1,
      "Cool the cooked egg promptly",
      "When you begin cooling the cooked egg under cold water",
      "Egg is being cooled and refrigerated promptly; this short countdown is NOT a food-safety certificate",
      "prep"
    ],
    [
      2,
      "Wash tomato and serve egg",
      "When you begin plating the cooked egg and washed tomato",
      "Snack is served or chilled promptly",
      "prep"
    ]
  ],
  "sn-berries": [
    [
      0,
      "Check soy yoghurt label",
      "When you begin reading the yoghurt ingredient and allergen label",
      "Confirm dairy-free and the actual fortification/allergen claims; this is a label-check reminder",
      "prep"
    ],
    [
      1,
      "Top soy yoghurt with berries and walnuts",
      "When you start preparing the toppings",
      "Use washed fresh or appropriately handled frozen berries; topping is ready to serve",
      "prep"
    ]
  ]
};
 function get(recipe,stepIndex){
  if(!recipe||!Number.isInteger(stepIndex)||stepIndex<0)return null;
  const step=recipe.steps?.[stepIndex];
  if(!step?.minutes||step.minutes<=0)return null;
  const found=DATA[recipe.id]?.find(x=>x[0]===stepIndex);
  if(!found)throw Error("Missing explicit timer purpose for "+recipe.id+" step "+(stepIndex+1));
  return Object.freeze({recipeId:recipe.id,stepIndex,stepTitle:step.title,
   durationSec:Math.round(step.minutes*60),purpose:found[1],startWhen:found[2],checkWhenDone:found[3],
   kind:found[4],isEstimate:found[4]==="prep"});
 }
 function validate(recipes){
  let count=0;
  for(const r of recipes){
   const spec=DATA[r.id];
   if(!spec)throw Error("No timer config for "+r.id);
   const timed=r.steps.map((s,i)=>s.minutes>0?i:null).filter(i=>i!==null);
   const configured=spec.map(x=>x[0]);
   if(new Set(configured).size!==configured.length||configured.length!==timed.length||timed.some(i=>!configured.includes(i)))
    throw Error("Unmapped or extraneous timers for "+r.id);
   for(const index of timed){
    const x=get(r,index);
    for(const k of ["purpose","startWhen","checkWhenDone"])if(x[k].trim().length<12)throw Error("Vague timer "+r.id+" "+index+" "+k);
    count++;
   }
  }
  return {recipes:recipes.length,timedSteps:count};
 }
 return Object.freeze({get,validate});
});
