/* Adult serving suggestions, adapted from historical Drive meal-plans and Australian dietary patterns.
 * NOT verified kitchen cook-ups, children's feeding guidance, exact nutrient analyses, or live-price products.
 * Historical family menus and research documents are private: no personal/medical contents in this public file.
 */
(() => {
"use strict";
const D=window.FOOD_DATA;
if(!D) return;
D.recipes.forEach(r=>r.category="lunch");
const make=(id,category,name,short,description,yieldCount,time,icon,accent,ingredients,steps,note,tags=[])=>({
 id,category,name,short,label:category==="breakfast"?"Good mornings":category==="dinner"?"Family table":"Simple snacks",
 description,yield:yieldCount,time,icon,accent,tags:[category[0].toUpperCase()+category.slice(1),...tags],
 nutrition:note,ingredients,steps:steps.map(s=>({title:s[0],minutes:s[1],detail:s[2],tip:s[3]||""}))
});
const recipes=[
 make("br-oats","breakfast","Berry, chia & walnut overnight oats","Oats · berries · chia",
 "A fridge-ready breakfast with wholegrain oats, berries, walnuts and calcium-fortified soy. Dairy-free with checked labels.",
 1,10,"🫐","berry",[[50,"g","plain rolled oats (gluten-free certified if needed)"],[180,"mL","calcium-fortified unsweetened soy milk"],[10,"g","chia seeds"],[80,"g","frozen mixed berries"],[15,"g","unsalted walnuts"],[0.25,"tsp","cinnamon"]],
 [["Stir the base",4,"Mix oats, soy milk, chia and cinnamon in a clean covered jar."],["Chill",0,"Refrigerate below 5°C overnight (at least 6 hours). Use within 1–2 days; don't leave unrefrigerated overnight."],["Top and eat",2,"For most healthy adults, use fruit according to its label; for pregnant people or those with weakened immunity, use washed fresh berries or frozen berries cooked thoroughly then chilled. Do not assume thawing eliminates pathogens. Add walnuts just before serving."]],"Wholegrain, fibre, plant protein and optional fortified calcium; no validated longevity score.",["No cooking","Dairy-free"]),
 make("br-eggs","breakfast","Spinach, mushroom & egg scramble","Eggs · greens · mushrooms",
 "A savoury breakfast adapted from the older family breakfast plan, served with wholegrain toast.",
 1,15,"🍳","sage",[[2,"","large eggs"],[70,"g","mushrooms, sliced"],[50,"g","baby spinach"],[5,"mL","extra virgin olive oil"],[1,"slice","wholegrain bread (check dairy/gluten labels)"],[1,"","small tomato"]],
 [["Cook vegetables",7,"Heat oil, cook sliced mushrooms 4–5 minutes; add spinach until wilted."],["Scramble eggs",4,"Whisk eggs and stir over medium-low heat until set throughout; avoid serving runny eggs to higher-risk eaters."],["Serve",2,"Serve hot with toast and sliced tomato."]],"Eggs provide protein; vegetables and wholegrain improve variety. Dairy-free only after checking bread.",["Savoury"]),
 make("br-smoothie","breakfast","Berry, banana, spinach & soy smoothie","Berries · banana · soy",
 "A convenient breakfast inspired by a historical family plan. Whole fruit is usually more filling; drink a smoothie slowly as a meal, not in addition to meals when you are not hungry.",
 1,7,"🥤","gold",[[250,"mL","unsweetened calcium-fortified soy milk"],[100,"g","frozen berries"],[1,"","small banana"],[30,"g","baby spinach"],[15,"g","natural peanut butter (allergen)"],[10,"g","chia seeds"]],
 [["Wash and measure",2,"Wash spinach. Follow the frozen-fruit label. For pregnant or immunocompromised people, use thoroughly cooked then chilled frozen berries, or well-washed fresh berries; thawing alone does not kill germs. Measure soy and toppings."],["Blend",2,"Blend all ingredients until smooth; use enough liquid for comfortable consistency."],["Drink promptly",1,"Drink straight away or cover, refrigerate below 5°C and consume soon."]],"A whole-food option with nuts/seeds and calcium when labelled fortified. Check peanut/soy allergies.",["Quick","Dairy-free"]),
 make("br-toast","breakfast","Avocado, tomato & chickpea toast","Avocado · chickpeas · tomato",
 "No-fuss savoury wholegrain toast with legumes and vegetables.",
 1,12,"🥑","leaf",[[2,"slices","wholegrain toast (dairy/gluten labels)"],[80,"g","no-added-salt canned chickpeas, drained/rinsed"],[60,"g","avocado flesh"],[1,"","medium tomato"],[5,"mL","lemon juice"],[1,"pinch","black pepper"]],
 [["Toast bread",3,"Toast bread to preferred crispness."],["Mash topping",3,"Mash rinsed chickpeas with avocado and lemon; add black pepper."],["Assemble",3,"Top toast with chickpea mix and fresh chopped tomato."]],"Legumes and avocado supply fibre and healthy fats, but this breakfast may be relatively modest in protein. Optional side: 250 mL So Good High Protein Soy adds 10 g labelled protein and 400 mg calcium, plus vitamin B12 and vitamin D; this drink is NOT automatically included in recipe ingredients or the shopping list. Choose according to the rest of your day, not a universal protein target.",["Plant-based"]),
 make("di-lentil","dinner","Tomato lentil & vegetable soup","Red lentils · carrot · tomatoes",
 "A balanced, reheatable family dinner with protein-rich lentils, vegetables and brown rice.",
 4,45,"🍲","gold",[[240,"g","dry red split lentils"],[400,"g","no-added-salt diced tomatoes"],[400,"g","carrots, cubed"],[150,"g","brown onion"],[200,"g","frozen spinach"],[20,"mL","olive oil"],[750,"mL","water, add more as needed"],[160,"g","dry brown rice"],[2,"tsp","ground cumin"]],
 [["Start rice",35,"Rinse and cook brown rice to pack directions; cool promptly if storing."],["Make soup",25,"Sauté onion/carrot in oil 5 minutes, add rinsed lentils, tomato, cumin and 750 mL water; simmer 20–25 minutes until lentils fully soft."],["Finish safely",5,"Cook spinach through, divide soup and rice into four portions; serve hot. Cool leftovers promptly in shallow containers and reheat once."]],"Adapted from a family dinner plan; quantities are newly specified suggestions, not a previously measured historical recipe.",["Plant-based","Freezer-friendly"]),
 make("di-chicken","dinner","Lemon chicken, sweet potato & green beans","Chicken · sweet potato · beans",
 "One-tray family dinner inspired by older household chicken-and-vegetable meals.",
 4,55,"🍗","berry",[[600,"g","boneless skinless chicken thigh (raw)"],[650,"g","sweet potato, trimmed"],[400,"g","green beans"],[20,"mL","extra virgin olive oil"],[1,"","lemon, juice"],[2,"tsp","smoked paprika"],[2,"cloves","garlic, minced"]],
 [["Preheat and prepare",10,"Heat fan oven to 200°C. Chop sweet potato evenly, coat with 10 mL oil and paprika."],["Roast chicken",30,"Place chicken and sweet potato on separate clean trays; cook chicken until thickest centre reaches 75°C. Avoid raw-chicken cross-contact."],["Finish vegetables",10,"Steam green beans until tender; season with lemon, garlic and remaining olive oil; serve four equal portions."]],"Protein, colourful vegetables and unsaturated fat. Raw-chicken handling and thorough cooking are essential.",["Family","Dairy-free"]),
 make("di-chilli","dinner","Smoky bean & vegetable chilli","Beans · capsicum · tomatoes",
 "A hearty plant-based version of an older family chilli dinner with beans, spices and brown rice.",
 4,50,"🫘","sage",[[2,"tins","no-added-salt kidney beans 420 g each, drained/rinsed"],[1,"tin","no-added-salt black beans 420 g, drained/rinsed"],[400,"g","diced tomatoes no added salt"],[300,"g","red capsicum"],[200,"g","mushrooms"],[120,"g","onion"],[160,"g","dry brown rice"],[20,"mL","olive oil"],[2,"tsp","ground cumin"],[2,"tsp","smoked paprika"]],
 [["Cook rice",35,"Cook dry brown rice as per packet, keep hot or cool it quickly."],["Prepare vegetables",9,"Sauté onion, capsicum and mushrooms in olive oil until softened."],["Simmer chilli",15,"Add rinsed fully cooked canned beans, tomatoes and spices; simmer 15 minutes until hot throughout. Divide with rice; chill leftover portions promptly."]],"Fibre-rich beans and vegetables; substantial servings. Make smaller portions if fibre-heavy meals cause discomfort.",["Plant-based","Freezer-friendly"]),
 make("di-stirfry","dinner","Ginger tofu & rainbow veggie stir-fry","Tofu · broccoli · ginger",
 "A quick family stir-fry using a reduced-sodium flavouring and plenty of vegetables.",
 4,35,"🥦","leaf",[[600,"g","firm tofu, soy allergen"],[500,"g","frozen broccoli/cauliflower"],[250,"g","carrots"],[300,"g","red capsicum"],[200,"g","mushrooms"],[240,"g","dry brown rice"],[20,"mL","olive oil"],[20,"mL","reduced-sodium gluten-free tamari (check label)"],[15,"g","fresh ginger"],[2,"cloves","garlic"]],
 [["Begin rice",30,"Rinse and cook 240 g dry rice according to its packet."],["Brown tofu",8,"Drain/cube tofu, pat dry and brown in half the oil on a hot non-stick pan."],["Cook vegetables",10,"Stir-fry carrots, mushrooms and capsicum in remaining oil. Add frozen broccoli/cauliflower and cook to packet directions until hot throughout."],["Finish",2,"Toss tofu, ginger, garlic and 20 mL tamari through hot vegetables. Serve with rice; store promptly."]],"Tofu calcium depends on its actual label; low-salt tamari helps limit sodium but is not sodium free.",["Plant-based","Dairy-free"]),
 make("di-salmon","dinner","Salmon, quinoa & roast vegetables","Salmon · quinoa · greens",
 "Optional fish dinner inspired by historic meal plans; count it toward the whole week's fish meals.",
 2,40,"🐟","berry",[[250,"g","raw salmon fillet"],[90,"g","dry quinoa"],[300,"g","broccoli"],[200,"g","carrots"],[15,"mL","extra virgin olive oil"],[1,"","lemon"],[1,"tsp","dried oregano"]],
 [["Roast vegetables",25,"Heat fan oven to 190°C; roast carrots with oil about 20–25 minutes until tender."],["Cook quinoa",17,"Rinse and cook 90 g quinoa per packet."],["Bake salmon",15,"Bake salmon at 180°C fan about 12–20 minutes depending on thickness, to 63°C at the centre or pack instructions; cook broccoli fully."],["Serve",2,"Divide across two plates and squeeze lemon. Reheat any leftovers thoroughly only once."]],"Oily fish supplies omega-3. Do not assume fish dinner must be added on top of two fish lunches every week.",["Fish"]),
 make("sn-hummus","snack","Crunchy vegetables & hummus","Carrot · cucumber · hummus",
 "A practical savoury snack from the historical rotation for people who can safely eat chilled hummus; see the higher-risk food-safety alternative in the method.",
 1,5,"🥕","sage",[[80,"g","carrot sticks"],[80,"g","cucumber slices"],[50,"g","hummus (check sesame and dairy labels)"]],
 [["Wash and slice",3,"Wash carrots and cucumber; slice into safe bite-sized sticks."],["Serve",1,"Measure hummus and enjoy promptly, keeping leftovers chilled. For pregnant or immunocompromised people, replace chilled hummus/tahini with a freshly cooked legume spread or an alternative considered safe for them."]],"Vegetables and legumes add fibre; check salt/sesame allergens. Store-bought hummus/tahini is a higher-risk ready-to-eat food for people with weakened immunity.",["No cooking"]),
 make("sn-apple","snack","Apple & nut butter","Apple · nut butter",
 "Simple fruit plus a modest serving of unsweetened nut butter.",
 1,3,"🍎","berry",[[1,"","medium apple"],[15,"g","natural almond or peanut butter (check allergens)"]],
 [["Wash and slice",2,"Wash the apple, remove core and slice."],["Serve",1,"Pair with nut butter; keep nut butter in a separate container for travel."]],"Whole fruit supplies fibre; nut butter provides unsaturated fat. Not suitable for nut allergy.",["No cooking"]),
 make("sn-eggs","snack","Hard-boiled egg & cherry tomatoes","Egg · tomatoes",
 "A make-ahead protein snack from the older family snack ideas.",
 1,16,"🥚","gold",[[1,"","large egg"],[100,"g","cherry tomatoes"]],
 [["Boil egg",12,"Put egg in simmering water and cook about 10 minutes until fully set."],["Cool promptly",2,"Cool under cold running water, refrigerate below 5°C; don't leave cooked eggs at room temperature."],["Serve",1,"Wash and serve tomato halves alongside the egg."]],"A protein snack; allergy is egg. Halve/quarter cherry tomatoes for young children if sharing.",["Protein"]),
 make("sn-berries","snack","Berries, soy yoghurt & walnuts","Berries · soy yoghurt",
 "A dairy-free yoghurt and fruit option rather than the dairy Greek-yoghurt entry in the older plans.",
 1,4,"🍓","leaf",[[120,"g","plain calcium-fortified soy yoghurt, if available"],[80,"g","berries"],[10,"g","walnut pieces"]],
 [["Check label",1,"Choose an unsweetened dairy-free soy yoghurt with verified calcium fortification if possible; otherwise calcium remains unknown."],["Assemble",2,"Use washed fresh berries, or follow frozen berry package directions. Higher-risk people should use thoroughly cooked/chilled frozen berries instead of just thawed fruit. Top with walnuts and serve cold."]],"Product-specific calcium, protein, price and allergen claims are unverified; not suitable for nut/soy allergy.",["No cooking","Dairy-free"])
];
const ids=new Set(D.recipes.map(x=>x.id));
for(const r of recipes){if(ids.has(r.id))throw Error("Duplicate recipe id "+r.id);ids.add(r.id);D.recipes.push(r);}
D.mealTypes=[{id:"breakfast",label:"Breakfast"},{id:"snack",label:"Snack"},{id:"lunch",label:"Lunch"},{id:"dinner",label:"Dinner"}];
D.familyRecipeSources={origin:"Historical household Google Drive meal plans (2023) plus adapted evidence-led adult portion suggestions",verification:"Uncooked proposals; original historical documents are not published",timing:"Flexible examples, not clinically prescribed optimal meal times"};
})();