/* Local-only batch feedback: real-world sensory and practical observations.
   No account, analytics, uploads or medical/nutrition claims.
*/
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.FoodTrial=api;
})(typeof window!=="undefined"?window:null,function(){
"use strict";
const KEY="good-food-trial-log-v1";
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const load=()=>{try{const val=JSON.parse(localStorage.getItem(KEY)||"{}");return val&&typeof val==="object"?val:{}}catch{return{}}};
function render(recipe){
 const parent=document.getElementById("recipeDetail");if(!parent)return;
 const existing=parent.querySelector("#trialLog");if(existing)existing.remove();
 const value=load()[recipe.id]||{};
 const div=document.createElement("details");div.id="trialLog";div.className="trial-log";
 div.innerHTML='<summary>✎ Record a real cook-up (optional)</summary><p>After actually preparing a batch, record real yield, receipt cost, taste and freezer texture. Stored <strong>only on this device</strong>. Unmeasured fields can stay blank. This does not certify nutrient values or food safety.</p>'+
 '<form id="trialForm" data-trial-recipe="'+esc(recipe.id)+'">'+
 '<label>Cooked date <input name="date" type="date" value="'+esc(value.date||"")+'"></label>'+
 '<label>Servings actually made <input name="portions" type="number" min="1" max="100" step="1" value="'+esc(value.portions??"")+'" placeholder="'+recipe.yield+'"></label>'+
 '<label>Total cooked food weight (g) <input name="yieldGrams" type="number" min="0" max="100000" step="1" value="'+esc(value.yieldGrams??"")+'" placeholder="Weigh only if available"></label>'+
 '<label>Actual ingredient receipt cost (AUD) <input name="cost" type="number" min="0" max="10000" step="0.01" value="'+esc(value.cost??"")+'" placeholder="Optional"></label>'+
 '<label>Enjoyment <select name="taste"><option value="">Not rated</option>'+[1,2,3,4,5].map(n=>'<option value="'+n+'"'+(Number(value.taste)===n?' selected':'')+'>'+n+' / 5</option>').join("")+'</select></label>'+
 '<label>After freezing/reheating <select name="texture"><option value="">Not tested yet</option>'+["Good","Okay","Needs improvement"].map(t=>'<option value="'+t+'"'+(value.texture===t?' selected':'')+'>'+t+'</option>').join("")+'</select></label>'+
 '<label class="trial-notes">What would you change? <textarea name="notes" maxlength="1200" rows="3" placeholder="Flavour, time, freezer space, substitutions, portion size">'+esc(value.notes||"")+'</textarea></label>'+
 '<div class="trial-buttons"><button type="submit" class="btn btn-primary">Save cook-up record</button><button type="button" id="deleteTrial" class="btn btn-outline">Clear this record</button></div><p class="trial-status" role="status" id="trialStatus">'+(value.date||value.taste?'Previously recorded on this device':'No cook-up recorded yet')+'</p></form>';
 parent.append(div);
}
function init(){
 document.addEventListener("submit",e=>{
  if(e.target.id!=="trialForm")return;
  e.preventDefault();const form=e.target,recipeId=form.dataset.trialRecipe;
  if(!recipeId)return;
  const read=n=>form.elements.namedItem(n)?.value||"";
  const data={date:read("date"),portions:read("portions"),yieldGrams:read("yieldGrams"),cost:read("cost"),taste:read("taste"),texture:read("texture"),notes:read("notes").slice(0,1200)};
  const all=load();all[recipeId]=data;
  try{localStorage.setItem(KEY,JSON.stringify(all));document.getElementById("trialStatus").textContent="Saved privately on this device.";}
  catch{document.getElementById("trialStatus").textContent="Could not save locally — check browser storage.";}
 });
 document.addEventListener("click",e=>{
   if(e.target.id!=="deleteTrial")return;
   const form=document.getElementById("trialForm");if(!form)return;
   const recipeId=form.dataset.trialRecipe,all=load();delete all[recipeId];
   try{localStorage.setItem(KEY,JSON.stringify(all));form.reset();document.getElementById("trialStatus").textContent="Record cleared on this device.";}catch{}
 });
}
return{render,init,load};
});
