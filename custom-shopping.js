/* Custom per-recipe shopping list. Shared price mappings and pantry inventory with the date planner.
 * All retail totals are partial historical estimates, never a live Dubbo checkout.
 */
(function(root, factory){
 const api=factory(root);
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root){root.CustomShopping=api;api.init();}
})(typeof window!=="undefined"?window:null,function(root){
 "use strict";
 const STORAGE="good-food-custom-shop-v1";
 const PANTRY="good-food-planned-have-v1";
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const qty=n=>Number(n.toFixed(2)).toLocaleString("en-AU",{maximumFractionDigits:2});
 const money=n=>"$"+Number(n).toFixed(2);
 const TYPES=[["breakfast","Breakfast"],["lunch","Lunch"],["dinner","Dinner"],["snack","Snacks"]];
 let state={portions:{},checked:{}},feedback="",node=null;

 function normalise(saved,recipes){
  const good=new Set(recipes.map(r=>r.id));
  const portions={};
  const incoming=saved&&typeof saved==="object"&&!Array.isArray(saved)?saved.portions:{};
  if(incoming&&typeof incoming==="object"&&!Array.isArray(incoming))
   for(const [id,n] of Object.entries(incoming))
    if(good.has(id)&&Number.isInteger(n)&&n>=1&&n<=20)portions[id]=n;
  const checked=saved?.checked&&typeof saved.checked==="object"&&!Array.isArray(saved.checked)?saved.checked:{};
  return {portions,checked:Object.fromEntries(Object.entries(checked).filter(([key,v])=>key.length<=350&&v===true).slice(0,500))};
 }
 function slots(portions,recipes){
  return recipes.filter(r=>Object.hasOwn(portions,r.id)&&Number.isInteger(portions[r.id])&&portions[r.id]>=1&&portions[r.id]<=20)
   .map(r=>({recipeId:r.id,portions:portions[r.id]}));
 }
 function build(portions,recipes,shop,pantry={}){
  const items=slots(portions,recipes);
  const merged=shop.merge(items,recipes);
  const result=shop.reconcile(merged,pantry);
  return {...result,selectedRecipes:items.length,totalPortions:items.reduce((s,x)=>s+x.portions,0)};
 }
 function read(key){
  try{return JSON.parse(localStorage.getItem(key)||"{}");}catch{return {};}
 }
 function save(){
  try{localStorage.setItem(STORAGE,JSON.stringify(state));return true;}catch{return false;}
 }
 function pantry(){
  const value=read(PANTRY);
  return value&&typeof value==="object"&&!Array.isArray(value)?value:{};
 }
 function savePantry(value){
  try{localStorage.setItem(PANTRY,JSON.stringify(value));return true;}catch{return false;}
 }
 function rowsForCopy(data){
  const selected=Object.entries(state.portions).map(([id,n])=>{
   const r=root.FOOD_DATA.recipes.find(r=>r.id===id);
   return r?n+" portion(s) — "+r.name:"";
  }).filter(Boolean);
  const rows=data.rows.filter(x=>x.toBuy>0&&!state.checked[x.key+"|"+x.toBuy]).map(x=>{
   const pack=x.map?" — buy "+x.packsToBuy+" × "+x.map.buy+" (approx "+money(x.priceToBuy)+")":" — pack and price not verified";
   return "☐ "+qty(x.toBuy)+" "+x.unit+" "+x.name+pack;
  });
  return "GOOD FOOD — CUSTOM SHOPPING LIST\n"+selected.join("\n")+
   "\n\n"+(rows.join("\n")||"Nothing left to buy.")+
   "\n\nKnown matched-pack subtotal: "+money(data.knownPrice)+"; "+data.unknown+" unpriced items. Subtotal may include items already ticked purchased. Not a full or live Woolworths Dubbo checkout.";
 }
 function render(){
  if(!node)return;
  const recipes=root.FOOD_DATA.recipes,shop=root.FoodShopping;
  if(!shop){node.textContent="Shopping calculator unavailable. Reload the page.";return;}
  const data=build(state.portions,recipes,shop,pantry());
  const groups=TYPES.map(([type,label])=>{
   const recipesOfType=recipes.filter(r=>r.category===type);
   return '<fieldset class="custom-recipe-group"><legend>'+label+'</legend>'+
    recipesOfType.map(r=>{
     const selected=Object.hasOwn(state.portions,r.id);
     const portions=selected?state.portions[r.id]:1;
     return '<div class="custom-recipe-row"><label class="custom-recipe-choice"><input type="checkbox" data-custom-recipe="'+esc(r.id)+'"'+(selected?' checked':'')+'><span>'+esc(r.name)+'</span></label>'+
      '<label class="custom-recipe-count">Portions <input type="number" min="1" max="20" step="1" inputmode="numeric" data-custom-portions="'+esc(r.id)+'" value="'+portions+'" aria-label="Portions of '+esc(r.name)+'"></label></div>';
    }).join("")+'</fieldset>';
  }).join("");
  const listed=data.rows.filter(x=>x.toBuy>0);
  const completed=listed.filter(x=>state.checked[x.key+"|"+x.toBuy]).length;
  const purchased=listed.reduce((sum,x)=>sum+(state.checked[x.key+"|"+x.toBuy]&&x.priceToBuy!==null?x.priceToBuy:0),0);
  const lines=data.rows.map(x=>{
   const flag=x.key+"|"+x.toBuy;
   const bought=!!state.checked[flag];
   const covered=x.toBuy<=0;
   const label=x.map
    ?'Buy '+x.packsToBuy+' '+(x.packsToBuy===1?'pack':'packs')+' · '+money(x.priceToBuy)+' · '+esc(x.map.priceSource)
    :'No verified retail pack or price';
   const link=x.map?.url?'<a href="'+esc(x.map.url)+'" target="_blank" rel="noopener noreferrer">Check product ↗</a>':'';
   return '<div class="custom-shopping-item'+(covered||bought?' is-complete':'')+'">'+
    '<label class="custom-shopping-item-main"><input type="checkbox" data-custom-bought="'+esc(flag)+'"'+(bought||covered?' checked':'')+(covered?' disabled':'')+' aria-label="Mark '+esc(x.name)+' bought"><span><strong>'+esc(x.name)+'</strong><small>Need '+qty(x.amount)+' '+esc(x.unit)+' · To buy '+qty(x.toBuy)+' '+esc(x.unit)+' · '+(covered?'Already covered by pantry':label)+'</small>'+link+'</span></label>'+
    '<label class="custom-shopping-have">At home <input type="number" min="0" max="1000000" step="any" inputmode="decimal" data-custom-have="'+esc(x.key)+'" value="'+x.owned+'" aria-label="Amount of '+esc(x.name)+' already at home in '+esc(x.unit||'items')+'"><small>'+esc(x.unit||"items")+'</small></label>'+
   '</div>';
  }).join("");
  node.innerHTML='<div class="custom-shopping-top"><span class="section-kicker">CHOOSE WHAT YOU ACTUALLY WANT</span><h2>Make your own shopping list.</h2><p>Tick one, two or as many recipes as you like. Change portions for each recipe. Shared ingredients are combined automatically, and things already in your pantry are subtracted.</p></div>'+
   '<div class="custom-shopping-groups">'+groups+'</div>'+
   '<div class="custom-shopping-actions"><button type="button" id="customShopClear">Clear selected recipes</button><button type="button" id="customShopCopy"'+(data.selectedRecipes?'':' disabled')+'>Copy what’s left ↗</button><button type="button" id="customShopPrint"'+(data.selectedRecipes?'':' disabled')+'>Print list</button></div>'+
   '<div class="custom-shopping-results" aria-live="polite"><h3>Your list</h3>'+
   '<p class="custom-shopping-stats">'+data.selectedRecipes+' recipes · '+data.totalPortions+' portions · '+listed.length+' ingredients to buy · '+completed+' ticked</p>'+
   (data.selectedRecipes?'<div class="custom-shopping-subtotal"><strong>'+money(Math.max(0,data.knownPrice-purchased))+'</strong><span>Approximate remaining matched-pack cost only; '+data.unknown+' unpriced ingredients still needed. Not a complete checkout total.</span></div>':
    '<p class="custom-shopping-empty">Select a recipe above to generate a shopping list. You don’t have to buy the full V6 basket.</p>')+
   (data.selectedRecipes?'<div class="custom-shopping-items">'+lines+'</div>':'')+
   '<p class="custom-shopping-disclaimer">Amounts scale the recipe ingredients, not cooking times. Retail mappings are partial, based on historical product sizes and prices; substitutions, edible yields, local stock and Dubbo checkout totals need checking. Pantry quantities and selected recipes stay only on this browser and website domain.</p></div>'+
   '<p class="custom-shopping-feedback" role="status">'+esc(feedback)+'</p>';
 }
 function add(recipeId,portions){
  const r=root?.FOOD_DATA?.recipes.find(r=>r.id===recipeId);
  const n=Number(portions);
  if(!r||!Number.isInteger(n)||n<1||n>20)return false;
  state.portions[r.id]=n;
  feedback=r.name+" added ("+n+" portions).";
  if(!save())feedback="Selection added, but this browser could not save it.";
  render();
  if(root){root.location.hash="#shop";node?.scrollIntoView?.({block:"start",behavior:"smooth"});}
  return true;
 }
 function init(){
  if(!root||!root.document)return;
  node=root.document.getElementById("customShopping");
  if(!node||!root.FOOD_DATA)return;
  state=normalise(read(STORAGE),root.FOOD_DATA.recipes);
  render();
  node.addEventListener("change",e=>{
   const t=e.target;
   if(t.matches("[data-custom-recipe]")){
    if(t.checked)state.portions[t.dataset.customRecipe]=1;
    else delete state.portions[t.dataset.customRecipe];
    feedback="";save();render();return;
   }
   if(t.matches("[data-custom-portions]")){
    const n=Number(t.value);
    if(!Number.isInteger(n)||n<1||n>20){feedback="Enter 1–20 whole portions.";render();return;}
    state.portions[t.dataset.customPortions]=n;feedback="";save();render();return;
   }
   if(t.matches("[data-custom-bought]")){
    if(t.checked)state.checked[t.dataset.customBought]=true;
    else delete state.checked[t.dataset.customBought];
    feedback="";save();render();return;
   }
   if(t.matches("[data-custom-have]")){
    const amount=Number(t.value);
    if(!Number.isFinite(amount)||amount<0||amount>1000000){feedback="Enter a valid pantry quantity.";render();return;}
    const stored=pantry();
    stored[t.dataset.customHave]=amount;
    feedback=savePantry(stored)?"Pantry quantity saved.":"Could not save pantry quantity.";
    render();
   }
  });
  node.addEventListener("click",async e=>{
   if(e.target.closest("#customShopClear")){
    if(Object.keys(state.portions).length&&!root.confirm("Clear your chosen recipes? Pantry amounts will be kept."))return;
    state.portions={};state.checked={};feedback="Recipes cleared.";save();render();return;
   }
   if(e.target.closest("#customShopPrint")){root.print();return;}
   if(e.target.closest("#customShopCopy")){
    const data=build(state.portions,root.FOOD_DATA.recipes,root.FoodShopping,pantry());
    const result=rowsForCopy(data);
    try{
     if(!navigator.clipboard?.writeText)throw Error("Unavailable");
     await navigator.clipboard.writeText(result);feedback="Shopping list copied.";
    }catch{
     const area=document.createElement("textarea");area.value=result;document.body.append(area);area.select();
     try{feedback=document.execCommand("copy")?"Shopping list copied.":"Copy failed — please try print.";}
     catch{feedback="Copy failed — please try print.";}area.remove();
    }
    render();
   }
  });
  root.document.addEventListener("click",e=>{
   const btn=e.target.closest("[data-add-to-shop]");
   if(btn){add(btn.dataset.addToShop,Number(btn.dataset.shopPortions));}
  });
 }
 return {normalise,slots,build,add,init};
});
