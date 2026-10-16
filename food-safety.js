/* Consumer cooking safety prompts. Authoritative source:
 * https://www.foodauthority.nsw.gov.au/consumer/food-extra-care/leftovers
 * https://www.foodauthority.nsw.gov.au/consumer/food-safety-home/entertaining-home
 * These self-checks are NOT instrumented proof of safe cooking, chilling or storage.
 */
(function(root, factory) {
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.FoodSafety=api;
})(typeof window!=="undefined"?window:null,function(){
 "use strict";
 const LINKS={
  leftovers:"https://www.foodauthority.nsw.gov.au/consumer/food-extra-care/leftovers",
  cooking:"https://www.foodauthority.nsw.gov.au/consumer/food-safety-home/cooking-temperatures",
  entertaining:"https://www.foodauthority.nsw.gov.au/consumer/food-safety-home/entertaining-home",
  vulnerable:"https://www.foodauthority.nsw.gov.au/consumer/food-risk-you/low-immunity"
 };
 function classify(recipe){
  const ing=(recipe.ingredients||[]).map(x=>String(x[2]).toLowerCase()).join(" ");
  const steps=(recipe.steps||[]).map(x=>String(x.detail)+" "+String(x.title)).join(" ").toLowerCase();
  const poultry=/\bchicken\b|\bturkey\b/.test(ing);
  const fish=/\bsalmon\b|\bsardines\b|\bfish\b/.test(ing);
  const rice=/\brice\b|\bpasta\b/.test(ing);
  const heated=/(?:cook|roast|simmer|bake|boil|heated|reheat|stir.fry|steam)/.test(steps);
  const chilled=/\b(smoothie|yoghurt|hummus|berries)\b/.test(ing)||!heated;
  return {poultry,fish,rice,heated,chilled};
 }
 function capacityWarning(recipe,portions=recipe?.yield){
  const profile=classify(recipe);
  // Five portions triggers a warning; it does NOT measure chilling capacity.
  if(!profile.heated||!Number.isFinite(portions)||portions<5)return "";
  return "Cooling plan for "+portions+" hot portions: check enough shallow containers and fridge/freezer space BEFORE cooking. Large deep containers may cool too slowly. If space is limited, cook fewer portions in separate sessions. Follow current NSW Food Authority guidance; a timer cannot verify cooling temperature.";
 }
 function checklist(recipe,portions=recipe?.yield) {
  const profile=classify(recipe);
  const out=[{id:"hands",label:"I checked the food labels/allergens and used clean hands, utensils and work surfaces.",source:LINKS.cooking}];
  if(profile.poultry||profile.fish)out.push({id:"raw",label:"I kept raw animal foods and their juices away from cooked and ready-to-eat foods.",source:LINKS.cooking});
  if(profile.heated)out.push({id:"done",label:profile.poultry?"I checked poultry was thoroughly cooked, preferably 74°C at the centre with a cleaned probe.":profile.fish?"I checked fish was thoroughly cooked, using about 63°C at the thickest centre as a conservative thermometer target.":"I checked the food was properly cooked throughout; a timer alone does not establish doneness.",source:LINKS.cooking});
  if(profile.heated)out.push({id:"cool",label:"I split leftovers into shallow portions, with enough refrigerator/freezer space to cool them safely, and put them into cold storage within two hours.",source:LINKS.leftovers});
  if(capacityWarning(recipe,portions))out.push({id:"capacity",label:"Before cooking this large batch, I checked shallow containers and fridge/freezer capacity for all hot portions, or divided the cooking into smaller sessions.",source:LINKS.entertaining});
  if(profile.rice)out.push({id:"rice",label:"I will keep cooked rice/pasta in the fridge no longer than two days, and reheat it only once until steaming hot.",source:LINKS.leftovers});
  if(profile.heated)out.push({id:"store",label:"I will label and date containers, refrigerate under 5°C or freeze at −18°C, defrost in the fridge and reheat thoroughly.",source:LINKS.leftovers});
  if(profile.chilled&&!profile.heated)out.push({id:"chilled",label:"I washed fresh produce and will serve or refrigerate chilled foods promptly, following the product label.",source:LINKS.entertaining});
  return out;
 }
 const escapeHTML=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 function render(recipe,checked=[],portions=recipe?.yield) {
  const entries=checklist(recipe,portions),ids=new Set(checked);
  return '<section class="cook-safety-gate" aria-labelledby="cookSafetyHeading"><div class="cook-safety-tag">Before you mark the cook-up complete</div><h3 id="cookSafetyHeading">Food-safety check</h3><p class="cook-safety-description">These are self-check reminders, not measurements or a certificate that food is safe. Do not tick a step until it is true; if food is still cooling, leave this cook-up unfinished and return later.</p><div class="cook-safety-items">'+entries.map(x=>'<label class="cook-safety-item"><input type="checkbox" data-cook-safety="'+escapeHTML(x.id)+'" '+(ids.has(x.id)?'checked':'')+'><span>'+escapeHTML(x.label)+'</span></label>').join("")+'</div><div class="cook-safety-sources"><a href="'+LINKS.leftovers+'" target="_blank" rel="noopener noreferrer">NSW leftovers guidance ↗</a> · <a href="'+LINKS.entertaining+'" target="_blank" rel="noopener noreferrer">NSW large-batch guidance ↗</a> · <a href="'+LINKS.vulnerable+'" target="_blank" rel="noopener noreferrer">Extra caution for low immunity ↗</a></div><p id="cookSafetyRemaining" role="status">'+entries.filter(x=>!ids.has(x.id)).length+' reminders not yet acknowledged</p></section>';
 }
 return {LINKS,classify,capacityWarning,checklist,render};
});
