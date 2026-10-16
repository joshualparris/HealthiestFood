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
 const mappings=[
  {key:"sardines",test:/john west.*sardine/i,unit:"tins",pack:1,price:3.70,buy:"John West Sardines 110 g tin (75 g edible)",url:"https://www.woolworths.com.au/shop/productdetails/98523"},
  {key:"salmon",test:/salmon/i,unit:"g",pack:500,price:19,buy:"Ocean Chef Coho Salmon 500 g (raw equivalent; confirm substitution)",url:"https://www.woolworths.com.au/shop/productdetails/6050076"},
  {key:"tofu",test:/\btofu\b/i,unit:"g",pack:650,price:6.99,buy:"Evergreen Hard Tofu 650 g (check product and protein label)",url:"https://www.woolworths.com.au/shop/productdetails/595465"},
  {key:"chickpeas",test:/chickpeas/i,unit:"g",pack:252,price:0.95,buy:"Woolworths No Added Salt Chickpeas 420 g tin (~252 g drained)",url:"https://www.woolworths.com.au/shop/productdetails/259399"},
  {key:"blackbeans",test:/black beans/i,unit:"g",pack:252,price:1.50,buy:"Woolworths No Added Salt Black Beans 420 g tin (~252 g drained)",url:"https://www.woolworths.com.au/shop/productdetails/663581"},
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
 function lookup(name,unit){
   for(const map of mappings){if(!map.test.test(name))continue;
     if(map.key==="chickpeas"||map.key==="blackbeans"){if(unit==="tins"||unit==="tin")return {...map,multiplier:252};}
     if(unit===map.unit)return {...map,multiplier:1};
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
       const match=lookup(name,unit);
       const amount=value*mult*(match?match.multiplier:1);
       const key=match?match.key:unit+"|"+name.trim().toLowerCase();
       if(!combined.has(key))combined.set(key,{key,name:match?match.buy:name,unit:match?match.unit:unit,amount:0,map:match,detail:new Set()});
       const entry=combined.get(key);entry.amount+=amount;entry.detail.add(r.name);
     }
   }
   const rows=[...combined.values()].map(x=>({
     ...x,detail:[...x.detail],packs:x.map?Math.ceil((x.amount-1e-8)/x.map.pack):null,
     price:x.map?Math.ceil((x.amount-1e-8)/x.map.pack)*x.map.price:null
   })).sort((a,b)=>a.name.localeCompare(b.name));
   return {rows,knownPrice:rows.reduce((s,x)=>s+(x.price??0),0),unknown:rows.filter(x=>x.price===null).length,priced:rows.filter(x=>x.price!==null).length};
 }
 const STORAGE="good-food-planned-have-v1";
 let have={};try{if(typeof localStorage!=="undefined")have=JSON.parse(localStorage.getItem(STORAGE)||"{}")||{}}catch{have={};}
 let mode="week",snapshot=null;
 function render(root,days,getSlots,recipes){
   const region=root.querySelector("#dynamicShop") || document.createElement("section");
   region.id="dynamicShop";region.className="dynamic-shop";
   if(!region.parentNode)root.append(region);
   const included=mode==="day"?[days[0]]:days;
   const slots=included.flatMap(d=>getSlots(d));
   const data=merge(slots,recipes);
   snapshot=data;
   const hasHave=x=>!!have[x.key];
   const remaining=data.rows.filter(x=>!hasHave(x));
   const estimate=remaining.reduce((s,x)=>s+(x.price??0),0);
   const noPrice=remaining.filter(x=>x.price===null).length;
   const fishMealCount=slots.filter(s=>['a','b','di-salmon'].includes(s.recipeId)).length;
   region.innerHTML='<div class="dynamic-shop-head"><span class="section-kicker">YOUR ACTUAL PLANNED MEALS</span><h2>Shopping for this '+mode+'</h2><p>Aggregated from the scheduled portions. This is separate from the fixed 20-lunch bulk basket. Select <strong>Already have</strong> to exclude pantry items.</p><div class="dynamic-shop-actions"><button type="button" data-shop-range="day" aria-pressed="'+(mode==="day")+'">Selected day</button><button type="button" data-shop-range="week" aria-pressed="'+(mode==="week")+'">Seven-day week</button><button type="button" id="copyPlannedShopping">Copy to clipboard ↗</button></div></div>'+
   '<div class="dynamic-shop-stats"><strong>'+remaining.length+' ingredients left</strong><span>About $'+estimate.toFixed(2)+' in <em>priced matching packs only</em> · '+noPrice+' unpriced items · <strong>NOT your complete checkout total</strong></span></div>'+
   '<div class="dynamic-shop-items">'+data.rows.map(x=>'<label class="dynamic-shop-line"><input type="checkbox" data-planned-have="'+esc(x.key)+'" '+(hasHave(x)?'checked':'')+'><span><strong>'+esc(x.name)+'</strong><small>Need: '+qty(x.amount)+' '+esc(x.unit)+(x.map?' · Buy '+x.packs+' pack'+(x.packs===1?'':'s')+' (~$'+x.price.toFixed(2)+')':' · No validated retail pack/price')+'</small></span><span class="dynamic-shop-have">Already have</span></label>').join("")+'</div>'+
   '<p class="planner-fish-note">'+fishMealCount+' scheduled fish-containing meal'+(fishMealCount===1?'':'s')+' in this '+mode+'. This counts meal slots, not edible fish grams or portions consumed by one person. Heart-health recommendations concern the whole week, including food outside this plan; more fish is not automatically better.</p>'+ 
   '<p class="dynamic-shop-warning">Price estimates are dated planning values, not live Dubbo stock or checkout. Pack conversions for canned beans use approximately 252 g drained per 420 g tin. Check product labels, use-by dates and equivalent substitutions. Cooking water, spices and fresh produce may be unpriced.</p>';
 }
 function copyList(){
   if(!snapshot)return "";
   return "PLANNED FOOD SHOP — "+mode.toUpperCase()+"\nIndicative matched-pack costs only; unpriced foods also required.\n\n"+
   snapshot.rows.filter(x=>!have[x.key]).map(x=>qty(x.amount)+" "+x.unit+" "+x.name+(x.map?" — "+x.packs+" pack(s), approx $"+x.price.toFixed(2):" — CHECK PACKAGE / PRICE")).join("\n")+
   "\n\nNot an actual Woolworths Dubbo checkout.";
 }
 function handle(e,refresh){
   const change=e.target.closest?.("[data-planned-have]");
   if(change){have[change.dataset.plannedHave]=change.checked;try{localStorage.setItem(STORAGE,JSON.stringify(have));}catch{}refresh();return true;}
   const button=e.target.closest?.("[data-shop-range]");
   if(button){mode=button.dataset.shopRange;refresh();return true;}
   if(e.target.closest?.("#copyPlannedShopping")){const content=copyList();if(navigator.clipboard?.writeText)navigator.clipboard.writeText(content);else{const ta=document.createElement("textarea");ta.value=content;document.body.append(ta);ta.select();document.execCommand("copy");ta.remove();}return true;}
   return false;
 }
 return {merge,lookup,render,handle,mappings};
});
