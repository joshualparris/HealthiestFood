/* Safe best-effort quantity scaling of recipe prose.
 * Times, temperatures, cuts, and per-serving weights MUST remain unchanged.
 * Numeric batch ingredient quantities are scaled; ambiguous words are not.
 * Always display a warning for scaled cooking instructions.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.RecipeScale=api;
})(typeof window!=="undefined"?window:null,function(){
 "use strict";
 const fmt=n=>Number(n.toFixed(2)).toLocaleString("en-AU",{maximumFractionDigits:2});
 function scaleDetail(text,multiplier){
  if(!Number.isFinite(multiplier)||multiplier<=0)throw Error("Invalid multiplier");
  if(Math.abs(multiplier-1)<0.00001)return String(text);
  return String(text).replace(/(\d+(?:\.\d+)?)\s*(g|kg|mL|L|tsp|tbsp|cloves?|tins?)\b/gi,(found,number,unit,offset,whole)=>{
   const before=whole.slice(Math.max(0,offset-25),offset);
   const after=whole.slice(offset+found.length,offset+found.length+40);
   // If amount clearly describes a single serving, piece or fruit, do not scale.
   if(/(?:\bper\s+(?:bowl|serving|meal|portion)|\beach)\b/i.test(after.slice(0,25)))return found;
   if(/\b(?:per|each|one|five|four|two|three)\s*$/i.test(before)||/[×x]\s*$/i.test(before))return found;
   if(/\b(?:walnuts?|flaxseed|raw equivalent)\b/i.test(after.slice(0,35)) && /(?:per serving|per meal|each|and one|per bowl)/i.test(after.slice(0,100))) return found;
   return fmt(Number(number)*multiplier)+" "+unit;
  });
 }
 function caution(recipe,portions){
   return portions===recipe.yield?
     "Amounts shown in each step are measured for this recipe. Times are guides, not proof of doneness; check packet directions and food temperatures.":
     "Amounts in these steps have been recalculated for "+portions+" portions. Timings and temperatures do not scale automatically. Check pan capacity, doneness and cooling time. When an ingredient requires a fraction of an egg, tin or other whole item, weigh the edible portion or prepare a full original-size batch.";
 }
 return {scaleDetail,caution};
});
