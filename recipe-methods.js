/* Evidence-led, portion-aware step quantities. Every cooking quantity is resolved from
 * the ingredient array: no independent hard-coded amount can drift out of sync.
 * Steps describe a base-batch technique, but measured amounts scale on screen.
 */
(function(root, factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root){root.RecipeMethods=api;if(root.FOOD_DATA)api.apply(root.FOOD_DATA.recipes);}
})(typeof window!=="undefined"?window:null,function(){
 "use strict";
 // Ingredient references are array indices; [index,fraction] allocates a split ingredient.
 // Each ingredient must be allocated exactly once across the steps.
 const uses={
  "br-oats":[[0,1,2,5],[],[3,4]],
  "br-eggs":[[1,2,3],[0],[4,5]],
  "br-smoothie":[[1,3],[0,2,4,5],[]],
  "br-toast":[[0],[1,2,4,5],[3]],
  "di-lentil":[[7],[0,1,2,3,5,6,8],[4]],
  "di-chicken":[[1,[3,0.5],5],[0],[2,[3,0.5],4,6]],
  "di-chilli":[[6],[3,4,5,7],[0,1,2,8,9]],
  "di-stirfry":[[5],[0,[6,0.5]],[1,2,3,4,[6,0.5]],[7,8,9]],
  "di-salmon":[[3,4,6],[1],[0,2],[5]],
  "sn-hummus":[[0,1],[2]],
  "sn-apple":[[0],[1]],
  "sn-eggs":[[0],[],[1]],
  "sn-berries":[[0],[1,2]],
  "a":[[5,6,7],[[10,0.6],[13,0.5],[14,0.5]],[2],[1,3,8,[10,0.4],11,[13,0.5],[14,0.5],15,16],[4,9,12],[0],[17,18]],
  "b":[[0],[2],[[8,0.4],11,12],[1,3,4,5,6,7,[8,0.6],9],[10],[13,14]],
  "c":[[2],[5,8,[9,0.6],10,11,12,13,14,15],[1,4,17],[0,3,6,7],[[9,0.4],16],[18,19,20]],
  "d":[[2],[4,8,[9,0.6]],[5,6,10,11,12,13,14],[0,1,3],[7,[9,0.4],15],[16,17,18]]
 };
 // {{ingredient index}} and {{index@fraction}} become exact scaled ingredient
 // amounts at display time, with fractions matching the measured step allocation.
 const method={
  "br-oats":[
   "In a clean covered jar, combine {{0}}, {{1}}, {{2}} and {{5}}. Stir thoroughly so the chia is dispersed.",
   "Cover and refrigerate below 5°C for at least 6 hours (overnight). Keep chilled; eat within 1–2 days.",
   "Top the chilled oats with {{3}} and {{4}} just before eating. For people who are pregnant or have weakened immunity, use thoroughly cooked then chilled frozen berries, or well-washed fresh berries. Thawing alone does not eliminate pathogens."
  ],
  "br-eggs":[
   "Heat {{3}} in a non-stick pan over medium heat. Cook {{1}} for 4–5 minutes, stirring. Add {{2}} and wilt for 1–2 minutes.",
   "Crack {{0}} into a bowl and whisk with a fork. Reduce the pan to medium-low, pour in the eggs and gently fold for about 3–4 minutes, until set throughout. Cook fully for higher-risk eaters; avoid runny eggs.",
   "Toast {{4}}. Wash and slice {{5}}; serve alongside the hot egg and vegetables."
  ],
  "br-smoothie":[
   "Wash {{3}}. Prepare {{1}} according to the packet. If pregnant or immunocompromised, thoroughly cook frozen berries then chill before use, or substitute washed fresh berries; thawing alone is not enough.",
   "Put the prepared berries and spinach in a blender with {{0}}, {{2}}, {{4}} and {{5}}. Blend 30–60 seconds until smooth. If too thick, add a small measured splash of water and note the extra amount.",
   "Serve immediately. If preparing ahead, cover promptly, refrigerate below 5°C and consume soon."
  ],
  "br-toast":[
   "Toast {{0}} until crisp. Check the bread label for dairy and any required gluten avoidance.",
   "Drain and rinse {{1}}, then mash with {{2}}, {{4}} and {{5}} in a bowl until roughly combined.",
   "Wash and chop {{3}}. Spread the prepared chickpea–avocado mixture over the toast, top with tomato and eat promptly."
  ],
  "di-lentil":[
   "Rinse {{7}} and cook in water according to the rice packet (often about 30–40 minutes for brown rice). Keep hot for serving or cool promptly if storing.",
   "Heat {{5}} in a large pot. Cook {{3}} and {{2}} for about 5 minutes, stirring. Rinse {{0}}, then add the lentils, {{1}}, {{8}} and {{6}}. Bring to a simmer and cook 20–25 minutes until the lentils are very soft. Add extra water only if required and record the amount.",
   "Add {{4}} to the hot soup and cook through to the pack directions. Divide both soup and cooked rice evenly into your selected number of portions. Serve hot, or cool in shallow containers within 2 hours and refrigerate or freeze."
  ],
  "di-chicken":[
   "Preheat a fan oven to 200°C. Cut {{1}} into even 2–3 cm pieces and coat with {{3@0.5}} and {{5}} on a clean baking tray.",
   "Pat {{0}} dry using paper towel, place on a separate clean tray from ready-to-eat foods and roast alongside the sweet potato, allowing roughly 25–35 minutes. Check the thickest chicken piece with a thermometer and cook to at least 75°C; use clean utensils to avoid cross-contact.",
   "Trim and steam {{2}} for about 5–8 minutes until tender. Combine with {{3@0.5}}, juice squeezed from {{4}} and {{6}}; cook the garlic through in a pan for 1–2 minutes before tossing with the beans. Divide the cooked chicken, sweet potato and beans equally between portions."
  ],
  "di-chilli":[
   "Rinse {{6}} and cook to its pack instructions (commonly 30–40 minutes). Hold hot, or cool promptly if making portions for later.",
   "Heat {{7}} in a large pan. Add diced {{5}}, {{3}} and {{4}}; sauté about 8–10 minutes until softened.",
   "Drain and rinse {{0}} and {{1}}, then stir into the pan with {{2}}, {{8}} and {{9}}. Bring to a simmer for about 15 minutes until fully hot. Serve with the cooked rice, dividing evenly into your selected portions."
  ],
  "di-stirfry":[
   "Rinse {{5}} and cook to its packet directions, allowing around 30–40 minutes for brown rice.",
   "Drain and cube {{0}}, pat dry, then brown gently in {{6@0.5}} in a non-stick pan for about 6–8 minutes. Remove and keep hot.",
   "Add {{6@0.5}} to the pan, then cook sliced {{2}}, {{3}} and {{4}} for about 5–7 minutes. Add {{1}} and cook fully according to the frozen vegetable pack.",
   "Return the tofu to the hot pan with {{8}}, {{9}} and {{7}}. Stir-fry 1–2 minutes until the garlic is cooked through, then serve with the rice. Divide into the selected number of portions."
  ],
  "di-salmon":[
   "Preheat the fan oven to 190°C. Cut {{3}} into even 2 cm pieces; toss with {{4}} and {{6}}. Roast in one layer for about 20–25 minutes or until tender.",
   "Rinse {{1}} and cook with the water ratio and time on the quinoa packet (often 12–18 minutes). Rest covered for 5 minutes.",
   "Put {{0}} in an ovenproof dish and bake at 190°C fan, usually 12–20 minutes depending on thickness. Verify the thickest centre reaches 63°C or follow stricter package instructions. Steam {{2}} for around 5–7 minutes until fully cooked.",
   "Divide salmon, cooked quinoa, broccoli and carrots equally into the selected portions. Squeeze juice from {{5}} over the plates and serve immediately; chill any leftovers promptly."
  ],
  "sn-hummus":[
   "Wash {{0}} and {{1}}, then cut into bite-sized sticks or slices appropriate for the eater.",
   "Spoon out {{2}} and serve with the vegetables. Keep hummus refrigerated. For pregnant or immunocompromised people, use an alternative considered safe for them rather than higher-risk chilled ready-to-eat dips."
  ],
  "sn-apple":[
   "Wash and core {{0}}, then cut into bite-sized wedges.",
   "Measure {{1}} and serve alongside the apple. Check nut allergies, and keep the spread separately covered for travel."
  ],
  "sn-eggs":[
   "Lower {{0}} into gently simmering water (enough to cover the eggs) and cook about 10–12 minutes once simmering, until the yolk and white are fully set.",
   "Transfer the cooked egg(s) to cold water to stop cooking. If not eating immediately, refrigerate below 5°C promptly.",
   "Wash and halve {{1}}, then serve alongside the cooked egg(s). Halve or quarter tomatoes further if needed for safer eating."
  ],
  "sn-berries":[
   "Measure {{0}} into a bowl and check its dairy-free and calcium-fortification claims on the actual label; if not listed, calcium is unknown.",
   "Wash {{1}} if fresh. For people at higher risk from foodborne illness, use thoroughly cooked then chilled frozen berries or suitably washed fresh fruit. Top yoghurt with the berries and {{2}}; serve cold."
  ],
  "a":[
   "Preheat a fan oven to 190°C. Wash, trim and cut {{5}} into ~1 cm pieces, and {{6}} plus {{7}} into ~2 cm pieces. Keep ready-to-eat fruit and nuts separate from other prep.",
   "Toss the prepared carrots, capsicum and zucchini with {{10@0.6}}, {{13@0.5}} and {{14@0.5}}. Spread in a single layer across roomy trays; roast about 25–35 minutes, turning halfway, until tender.",
   "Rinse {{2}}, cook using the quinoa packet's water ratio, then stand covered for 5 minutes and fluff.",
   "Soften {{8}} in {{10@0.4}} for 6–8 minutes. Add {{11}}, {{13@0.5}}, {{14@0.5}}, {{15}} and {{16}} and stir 30 seconds. Add {{3}} and drained/rinsed {{1}}; add up to 100 mL extra water only if the sauce is too thick. Simmer 8–10 minutes.",
   "Cook {{4}} thoroughly to its packet directions. Wilt {{9}} into the hot vegetables, then fold in roasted vegetables, cooked quinoa and {{12}}.",
   "Drain {{0}} and weigh the edible sardines. Divide the cooked vegetable/grain base equally into your selected portions, then divide the drained fish equally by weight. Fractional tin counts require weighing the edible fish, not guessing a fraction of a can.",
   "Cool the meals promptly in shallow containers and refrigerate/freeze within 2 hours. Reheat once until steaming hot throughout. At serving, add {{17}} and {{18}}, divided evenly between portions."
  ],
  "b":[
   "Keep {{0}} covered in the fridge below 4°C until thawed, following the fish pack's use-within-24-hours advice. Separate only the required raw portion(s); keep unused still-frozen salmon frozen. Do not thaw on the benchtop.",
   "Rinse {{2}} and cook to brown rice packet directions, usually 30–40 minutes. If waiting to pack, spread rice thinly and chill promptly.",
   "Preheat the fan oven to 180°C. Coat the thawed salmon with {{8@0.4}}, {{11}} and {{12}}. Bake 12–20 minutes depending on thickness, checking the thickest centre reaches 63°C or the stricter packet instruction.",
   "Sauté {{7}} and {{4}} in {{8@0.6}} for about 8 minutes; add {{9}} for 30 seconds. Stir in rinsed/drained {{1}}, {{3}}, {{5}} and about 100 mL extra water if needed. Simmer until frozen vegetables are fully cooked; add {{6}} and cook until tender.",
   "Add {{10}} to the vegetables. Divide the cooked rice and vegetable/bean mixture evenly into your selected portions, and add the cooked salmon in equal weighed portions.",
   "Cool shallow portions promptly and refrigerate/freeze within 2 hours. Reheat the meal once until steaming hot. At serving, add {{13}} and {{14}}, divided evenly between portions."
  ],
  "c":[
   "Rinse {{2}} and cook to brown rice packet directions, usually 30–40 minutes. Spread in a shallow container to cool promptly if not serving straight away. Rinse the red lentils before their later step.",
   "Soften {{8}} and {{5}} in {{9@0.6}} over medium heat for 6–8 minutes. Stir in {{11}}, {{10}}, {{12}}, {{13}}, {{14}} and {{15}} for 30 seconds without burning.",
   "Add rinsed {{1}}, diced {{4}} and {{17}}. Bring to a boil, then simmer 15–25 minutes until lentils and pumpkin are fully tender. Stir often; add further measured water only if too thick.",
   "Add {{3}} and cubed {{0}}; simmer about 8–10 minutes. Fully cook {{6}} to packet directions, then fold in {{7}} until wilted.",
   "Stir in {{9@0.4}} and {{16}}. Weigh and divide cooked rice and curry evenly among your selected shallow portions, distributing tofu equally.",
   "Cool promptly, refrigerate/freeze within 2 hours and reheat once until steaming hot. At serving, top with {{18}}, {{19}} and {{20}}, shared evenly between portions."
  ],
  "d":[
   "Rinse {{2}} and cook using the quinoa pack's water ratio; rest covered 5 minutes after cooking and fluff.",
   "Cook {{8}} in {{9@0.6}} over medium heat for about 5 minutes. Add {{4}} and sauté for 6–8 minutes until much of the moisture evaporates.",
   "Add {{5}} and {{6}}, cooking about 5 minutes. Stir in {{10}}, {{11}}, {{12}}, {{13}} and {{14}} for 30 seconds.",
   "Add {{3}}, drained/rinsed {{1}} and diced {{0}}. If too thick, add up to 100 mL extra water (not a shopping item); simmer gently 10–12 minutes until hot throughout.",
   "Fold in {{7}} and simmer 4–6 minutes until tender. Stir through {{15}} and {{9@0.4}}. Divide cooked quinoa and tofu/bean mixture evenly among your selected portions.",
   "Chill shallow portions promptly and freeze if keeping longer. Reheat once until steaming hot. At serving, add {{16}}, {{17}} and {{18}}, divided equally."
  ]
 };
 const fmt=n=>Number(n.toFixed(2)).toLocaleString("en-AU",{maximumFractionDigits:2});
 function parts(ref){return Array.isArray(ref)?{index:ref[0],fraction:ref[1]}:{index:ref,fraction:1};}
 function allocation(recipe,index,fraction,portions){
  const ing=recipe.ingredients[index];
  if(!ing)throw Error("Invalid ingredient index "+index+" for "+recipe.id);
  const amount=ing[0]*fraction*portions/recipe.yield;
  const units=ing[1],name=ing[2];
  const label=fmt(amount)+(units?" "+units:"")+" "+name;
  return {index,amount,unit:units,name,label};
 }
 function stage(recipe,step,portions){
  return (step.uses||[]).map(ref=>{const p=parts(ref);return allocation(recipe,p.index,p.fraction,portions);});
 }
 function describe(recipe,step,portions){
  const amount=portions/recipe.yield;
  return String(step.detail).replace(/\{\{(\d+)(?:@(\d+(?:\.\d+)?))?\}\}/g,(all,index,part)=>{
   const found=allocation(recipe,Number(index),part===undefined?1:Number(part),portions);
   return found.label;
  });
 }
 function validate(recipe){
  const stages=uses[recipe.id],texts=method[recipe.id];
  if(!stages||!texts||stages.length!==recipe.steps.length||texts.length!==recipe.steps.length)throw Error(recipe.id+": missing step plan");
  const total=new Array(recipe.ingredients.length).fill(0);
  for(let i=0;i<stages.length;i++){
   const valid=new Map();
   for(const ref of stages[i]){
    const p=parts(ref);
    if(!Number.isInteger(p.index)||p.index<0||p.index>=total.length||!Number.isFinite(p.fraction)||p.fraction<=0||p.fraction>1)throw Error(recipe.id+": bad reference "+JSON.stringify(ref));
    total[p.index]+=p.fraction;valid.set(p.index,(valid.get(p.index)||0)+p.fraction);
   }
   for(const match of texts[i].matchAll(/\{\{(\d+)(?:@(\d+(?:\.\d+)?))?\}\}/g)){
    const ix=Number(match[1]),fraction=match[2]===undefined?1:Number(match[2]);
    if(!Number.isFinite(valid.get(ix))||Math.abs(valid.get(ix)-fraction)>0.0001)throw Error(recipe.id+": unallocated template "+match[0]+" step "+i);
   }
  }
  const errors=total.map((n,i)=>Math.abs(n-1)<.0001?null:(i+":"+n)).filter(Boolean);
  if(errors.length)throw Error(recipe.id+": ingredient allocation mismatch "+errors.join(", "));
  return true;
 }
 function apply(recipes){
  for(const r of recipes){validate(r);r.steps.forEach((s,i)=>{s.uses=uses[r.id][i];s.detail=method[r.id][i];});}
  return recipes;
 }
 return {apply,stage,describe,validate,uses,method};
});
