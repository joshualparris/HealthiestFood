/* Load only user-reviewed local recipes into existing app planners and shopping UI.
 * No automatic adoption of OCR or third-party recipe content.
 */
(function(root,factory) {
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.FoodUserRecipes=api;
 if(root?.FOOD_DATA?.recipes&&root.FoodWorkflowV2){
  let stored=[];
  try{stored=JSON.parse(root.localStorage.getItem(api.KEY)||"[]");}catch{}
  const checked=root.FoodWorkflowV2.validateUserRecipes(stored);
  const ids=new Set(root.FOOD_DATA.recipes.map(x=>x.id));
  for(const r of checked){if(ids.has(r.id))continue;root.FOOD_DATA.recipes.push(r);ids.add(r.id);}
 }
})(typeof window!=="undefined"?window:null,function(){
 "use strict";
 const KEY="good-food-user-recipes-v2";
 function save(storage,recipe,validator){
  if(!storage||!validator)return {ok:false,reason:"Storage or validation missing"};
  const v=validator.validateUserRecipes([recipe])[0];
  if(!v)return {ok:false,reason:"Recipe requires a name, servings, complete measured ingredients and a cooking step"};
  let current=[];try{current=JSON.parse(storage.getItem(KEY)||"[]");}catch{}
  const checked=validator.validateUserRecipes(current);
  if(checked.length>=35)return {ok:false,reason:"Maximum 35 saved recipes"};
  if(checked.some(x=>x.id===v.id))return {ok:false,reason:"Duplicate recipe ID"};
  const next=[...checked,v];
  try{storage.setItem(KEY,JSON.stringify(next));return {ok:true,count:next.length};}
  catch{return {ok:false,reason:"Browser storage could not save"};}
 }
 return {KEY,save};
});
