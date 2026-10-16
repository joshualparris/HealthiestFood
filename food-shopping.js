/* Day/week cooking shopping reconciliation. Imported as data, no external calls.
 * Never represents estimates as a live Woolworths Dubbo cart.
 * Skips retail-price guesses for products without an exact pack mapping.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.FoodShopping=api;
})(typeof window!=="undefined"?window:null,function(){
 "use strict";
 // One source of truth for *declared* edible tin yield across nutrition and shopping.
 // These are label-serving proxies; they are NOT kitchen-verified drained weights.
 // The labelled black-bean 225 g conflicts with the 60% ingredient declaration.
 const nutrientLabels=(typeof module==="object"&&module.exports)?
  require("./nutrient-ledger.js"):(typeof window!=="undefined"?window.FoodNutrients:null);
 function declaredEdibleTin(productId){
  const product=nutrientLabels?.items.find(p=>p.productId===productId);
  if(!product||!Number.isFinite(product.ediblePerTinG)||product.ediblePerTinG<=0)
   throw Error("Missing explicitly declared edible tin yield for Woolworths product "+productId);
  return product.ediblePerTinG;
 }
 const catalog=()=>typeof window!=="undefined"&&window.FoodIngredients?window.FoodIngredients:
  typeof module==="object"&&module.exports?require("./ingredient-catalogue.js"):null;
 const mappings=[
  {key:"sardines",test:/john west.*sardine/i,unit:"tins",pack:1,price:3.70,buy:"John West Sardines 110 g tin (75 g edible)",url:"https://www.woolworths.com.au/shop/productdetails/98523"},
  {key:"salmon",test:/salmon/i,unit:"g",pack:500,price:19,buy:"Ocean Chef Coho Salmon 500 g (raw equivalent; confirm substitution)",url:"https://www.woolworths.com.au/shop/productdetails/6050076"},
  {key:"tofu",test:/\btofu\b/i,unit:"g",pack:650,price:6.99,buy:"Evergreen Hard Tofu 650 g (check product and protein label)",url:"https://www.woolworths.com.au/shop/productdetails/595465"},
  {key:"chickpeas",test:/chickpeas/i,unit:"g",pack:declaredEdibleTin("259399"),price:0.95,buy:"Woolworths No Added Salt Chickpeas 420 g tin (~252 g drained)",url:"https://www.woolworths.com.au/shop/productdetails/259399"},
  {key:"blackbeans",test:/black beans/i,unit:"g",pack:declaredEdibleTin("663581"),price:1.50,buy:"Woolworths No Added Salt Black Beans 420 g tin (225 g NIP servings; verify actual drained weight)",url:"https://www.woolworths.com.au/shop/productdetails/663581"},
  {key:"tomatoes-tinned",test:/\b(diced tomatoes|plain diced tomatoes|tomatoes no added salt)\b/i,unit:"g",pack:400,price:2,buy:"SPC Diced Tomatoes 400 g",url:"https://www.woolworths.com.au/shop/productdetails/322960"},
  {key:"quinoa",test:/\bquinoa\b/i,unit:"g",pack:500,price:5.75,buy:"Macro White Quinoa 500 g",url:"https://www.woolworths.com.au/shop/productdetails/335073"},
  {key:"rice",test:/\bbrown rice\b/i,unit:"g",pack:1000,price:3.50,buy:"SunRice Brown Rice 1 kg (dry)",url:"https://www.woolworths.com.au/shop/productdetails/94536"},
  {key:"brassicas",test:/frozen broccoli\/cauliflower/i,unit:"g",pack:500,price:4.50,buy:"Woolworths Frozen Broccoli/Cauliflower 500 g",url:"https://www.woolworths.com.au/shop/productdetails/768561"},
  {key:"peas",test:/frozen (?:baby )?peas/i,unit:"g",pack:1000,price:5.50,buy:"Woolworths Frozen Baby Peas 1 kg",url:"https://www.woolworths.com.au/shop/productdetails/754181"},
  {key:"spinach-fresh",test:/baby spinach/i,unit:"g",pack:280,price:5,buy:"Baby Leaf Spinach 280 g",url:"https://www.woolworths.com.au/shop/productdetails/524336"},
  {key:"walnuts",test:/walnuts?|walnut pieces/i,unit:"g",pack:190,price:4.90,buy:"Woolworths Walnuts 190 g",url:"https://www.woolworths.com.au/shop/search/products?searchTerm=walnuts%20190g"},
  {key:"carrot",test:/carrots?(?:,|\b)/i,unit:"g",pack:1000,price:2.50,buy:"Carrots 1 kg bag",url:"https://www.woolworths.com.au/shop/search/products?searchTerm=carrots%201kg"},
  {key:"mushrooms",test:/mushrooms?/i,unit:"g",pack:400,price:5,buy:"Cup Mushrooms 400 g",url:"https://www.woolworths.com.au/shop/search/products?searchTerm=cup%20mushrooms"},
  {key:"oil",test:/^(?:EVOO|olive oil|extra virgin olive oil)$/i,unit:"mL",pack:500,price:8.80,buy:"Extra Virgin Olive Oil 500 mL",url:"https://www.woolworths.com.au/shop/search/products?searchTerm=olive%20oil%20500ml"},
  {key:"kiwi",test:/kiwifruit/i,unit:"",pack:1,price:1.51,buy:"Green kiwifruit (each)",url:"https://www.woolworths.com.au/shop/productdetails/267083"}
 ];
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const qty=q=>Number(q.toFixed(2)).toLocaleString("en-AU",{maximumFractionDigits:2});
 function personalObservation(map){
   const id=map.url?.match(/productdetails\/(\d+)/)?.[1];
   if(!id||typeof localStorage==="undefined")return null;
   try{
    const records=JSON.parse(localStorage.getItem("good-food-dubbo-product-check-v1")||"{}");
    const x=records?.[id];
    const age=Date.now()-Date.parse(x?.observedAt||"");
    if(x?.store!=="Woolworths Orana Mall, Dubbo NSW"||!Number.isFinite(x.price)||x.price<0||x.price>9999||
       !Number.isFinite(age)||age<0||age>14*86400000)return null;
    return {price:x.price,observedAt:x.observedAt,stock:x.stock};
   }catch{return null;}
 }
 function withObservedPrice(map){
  const rec=personalObservation(map);
  return rec?{...map,price:rec.price,priceSource:"Your Dubbo observation, "+rec.observedAt.slice(0,10),observedStock:rec.stock}:
   {...map,priceSource:"Historical estimate (Dubbo checkout not checked)"};
 }
 function lookup(name,unit){
   const identity=catalog()?.resolve(name,unit);
   if(identity){
    if(!identity.shop)return null; // Do not silently price generic salmon/tofu as a specific brand.
    const map=mappings.find(x=>x.key===identity.shop);
    if(!map)return null;
    if((unit==="tins"||unit==="tin")&&(map.key==="chickpeas"||map.key==="blackbeans"))
      return {...withObservedPrice(map),multiplier:map.pack,ingredientId:identity.id,productSku:identity.sku||null};
    if(unit===map.unit)return {...withObservedPrice(map),multiplier:1,ingredientId:identity.id,productSku:identity.sku||null};
    return null; // Wrong physical basis must not become another unit by accident.
   }
   // Backwards-compatible fallback for outside-recipe user inputs; all 151
   // shipped recipe lines are catalogued and NEVER enter this regex branch.
   for(const map of mappings){if(!map.test.test(name))continue;
     if(map.key==="chickpeas"||map.key==="blackbeans"){if(unit==="tins"||unit==="tin")return {...withObservedPrice(map),multiplier:map.pack,identityFallback:true};}
     if(unit===map.unit)return {...withObservedPrice(map),multiplier:1,identityFallback:true};
   }
   return null;
 }
 function merge(slots,recipes){
   const byRecipe=new Map(recipes.map(r=>[r.id,r]));
   const combined=new Map();
   for(const slot of slots){
     const r=byRecipe.get(slot.recipeId);if(!r)continue;
     const n=Number(slot.portions)||r.yield,mult=n/r.yield;
     for(const [value,unit,name] of r.ingredients){
       if(!Number.isFinite(value)||value<=0)continue;
       const identity=catalog()?.resolve(name,unit);
       const match=lookup(name,unit);
       const amount=value*mult*(match?match.multiplier:1);
       // Keep established SKU pantry keys unchanged; new unpriced canonical
       // ingredients can share a stable unit-aware key across recipe variants.
       const key=match?match.key:identity?"ing:"+identity.id+":"+unit:unit+"|"+name.trim().toLowerCase();
       const legacyKey=unit+"|"+name.trim().toLowerCase();
       if(!combined.has(key))combined.set(key,{key,ingredientId:identity?.id||null,
         productSku:identity?.sku||null,legacyKeys:new Set(),
         name:match?match.buy:name,unit:match?match.unit:unit,amount:0,map:match,detail:new Set()});
       const entry=combined.get(key);
       entry.legacyKeys.add(legacyKey);
       entry.amount+=amount;entry.detail.add(r.name);
     }
   }
   const rows=[...combined.values()].map(x=>({
     ...x,detail:[...x.detail],legacyKeys:[...x.legacyKeys],packs:x.map?Math.ceil((x.amount-1e-8)/x.map.pack):null,
     price:x.map?Math.ceil((x.amount-1e-8)/x.map.pack)*x.map.price:null
   })).sort((a,b)=>a.name.localeCompare(b.name));
   return {rows,knownPrice:rows.reduce((s,x)=>s+(x.price??0),0),unknown:rows.filter(x=>x.price===null).length,priced:rows.filter(x=>x.price!==null).length};
 }
 const STORAGE="good-food-planned-have-v1";
 let have={};try{if(typeof localStorage!=="undefined"){const raw=JSON.parse(localStorage.getItem(STORAGE)||"{}");if(raw&&typeof raw==="object"&&!Array.isArray(raw))have=raw;}}catch{have={};}
 let mode="week",snapshot=null;
 function safeAmount(value){
  const n=Number(value);
  return Number.isFinite(n)&&n>0?Math.min(n,1000000):0;
 }
 function reconcile(data,inventory={}){
  const rows=data.rows.map(x=>{
   // No automatic destructive migration: read legacy pantry records safely,
   // favour the greatest observed quantity to avoid double-counting aliases.
   const fallback=x.legacyKeys?.map(k=>inventory[k]).filter(v=>v!==undefined)||[];
   const raw=Object.hasOwn(inventory,x.key)?inventory[x.key]:
    fallback.length?fallback.reduce((a,b)=>Math.max(a===true?x.amount:safeAmount(a),b===true?x.amount:safeAmount(b)),0):undefined;
   const owned=raw===true?x.amount:safeAmount(raw);
   const toBuy=Math.max(0,Number((x.amount-owned).toFixed(4)));
   const packsToBuy=x.map?Math.ceil((toBuy-1e-8)/x.map.pack):null;
   const priceToBuy=x.map?Math.max(0,packsToBuy)*x.map.price:null;
   return {...x,owned,toBuy,packsToBuy,priceToBuy};
  });
  return {rows,knownPrice:rows.reduce((sum,x)=>sum+(x.priceToBuy||0),0),
   unknown:rows.filter(x=>x.toBuy>0&&x.priceToBuy===null).length,
   itemsLeft:rows.filter(x=>x.toBuy>0).length};
 }
 function persist(){try{localStorage.setItem(STORAGE,JSON.stringify(have));return true}catch{return false;}}
 function render(root,days,getSlots,recipes){
   // The custom recipe shop and dated planner use the same pantry record.
   // Re-read it so edits made on the other screen are reflected immediately.
   try{const current=JSON.parse(localStorage.getItem(STORAGE)||"{}");have=current&&typeof current==="object"&&!Array.isArray(current)?current:{};}catch{have={};}
   const region=root.querySelector("#dynamicShop") || document.createElement("section");
   region.id="dynamicShop";region.className="dynamic-shop";
   if(!region.parentNode)root.append(region);
   const included=mode==="day"?[days[0]]:days;
   const slots=included.flatMap(d=>getSlots(d).filter(s=>!s.done));
   const merged=merge(slots,recipes);
   // Migrate old boolean "already have everything" ticks to a measured quantity
   // at the current planned amount, so later increases in portions still trigger buying.
   let migrated=false;
   for(const row of merged.rows){if(have[row.key]===true){have[row.key]=row.amount;migrated=true;}
    else if(have[row.key]===false){have[row.key]=0;migrated=true;}}
   if(migrated)persist();
   const data=reconcile(merged,have);
   snapshot=data;
   const rowMarkup=data.rows.map(x=>{
     const extra=x.map?" · Buy "+x.packsToBuy+" pack(s), estimated AUD "+x.priceToBuy.toFixed(2)+" · "+esc(x.map.priceSource):" · Retail pack/price unverified";
     return '<div class="dynamic-shop-line"><label class="dynamic-shop-row-check"><input type="checkbox" data-planned-have="'+esc(x.key)+'" '+(x.owned>=x.amount?'checked':'')+' aria-label="Enough at home: '+esc(x.name)+'"><span><strong>'+esc(x.name)+'</strong><small>Required: '+qty(x.amount)+' '+esc(x.unit)+' · Still needed: '+qty(x.toBuy)+' '+esc(x.unit)+extra+'</small></span></label><label class="dynamic-shop-pantry">In pantry <input type="number" min="0" max="1000000" step="any" inputmode="decimal" data-pantry-amount="'+esc(x.key)+'" value="'+x.owned+'" aria-label="Quantity already in pantry for '+esc(x.name)+' in '+esc(x.unit)+'"><span>'+esc(x.unit||"items")+'</span></label></div>';
   }).join("");
   region.innerHTML='<div class="dynamic-shop-head"><span class="section-kicker">YOUR ACTUAL PLANNED MEALS</span><h2>Shopping for this '+mode+'</h2><p>Totals reflect scheduled portions not yet marked done. Enter how much is already in your pantry to calculate the remaining requirement. This remains separate from the fixed V6 20-lunch basket.</p><div class="dynamic-shop-actions"><button type="button" data-shop-range="day" aria-pressed="'+(mode==="day")+'">Selected day</button><button type="button" data-shop-range="week" aria-pressed="'+(mode==="week")+'">Seven-day week</button><button type="button" id="copyPlannedShopping">Copy to clipboard ↗</button></div></div>'+
   '<div class="dynamic-shop-stats"><strong>'+data.itemsLeft+' ingredients left</strong><span>About $'+data.knownPrice.toFixed(2)+' in <em>matched retail packs only</em> · '+data.unknown+' unpriced items · <strong>NOT the complete checkout total</strong></span></div>'+
   '<div class="dynamic-shop-items">'+rowMarkup+'</div>'+
   '<p class="dynamic-shop-warning">Partial pantry quantities reduce what you need to buy. Quantities are manual estimates, not tracked automatically when a meal is cooked. Buy counts round up to full packs; this estimate excludes products without a reliable mapping. All prices are dated planning allowances, not live Dubbo checkout or stock. Check labels, pack sizes and edible yields.</p>';
 }
 function copyList(){
   if(!snapshot)return "";
   return "PLANNED FOOD SHOP — "+mode.toUpperCase()+"\nIndicative matching-pack prices only; unknown foods also required.\n\n"+
   snapshot.rows.filter(x=>x.toBuy>0).map(x=>qty(x.toBuy)+" "+x.unit+" "+x.name+(x.map?" — "+x.packsToBuy+" pack(s), approx $"+x.priceToBuy.toFixed(2):" — CHECK RETAIL PACK AND PRICE")).join("\n")+
   "\n\nNot a complete or live Woolworths Dubbo checkout.";
 }
 function handle(e,refresh){
   const target=e.target;
   if(e.type==="change"&&target?.matches?.("[data-planned-have]")){
    const key=target.dataset.plannedHave,row=snapshot?.rows.find(x=>x.key===key);
    if(!row)return false;
    have[key]=target.checked?row.amount:0;persist();refresh();return true;
   }
   if(e.type==="change"&&target?.matches?.("[data-pantry-amount]")){
    const key=target.dataset.pantryAmount;
    if(!snapshot?.rows.some(x=>x.key===key))return false;
    have[key]=safeAmount(target.value);persist();refresh();return true;
   }
   if(e.type!=="click")return false;
   const button=target.closest?.("[data-shop-range]");
   if(button){mode=button.dataset.shopRange;refresh();return true;}
   if(target.closest?.("#copyPlannedShopping")){
    const content=copyList();
    if(navigator.clipboard?.writeText)navigator.clipboard.writeText(content);
    else{const ta=document.createElement("textarea");ta.value=content;document.body.append(ta);ta.select();document.execCommand("copy");ta.remove();}
    return true;
   }
   return false;
 }
 return {merge,lookup,reconcile,render,handle,mappings};
});
