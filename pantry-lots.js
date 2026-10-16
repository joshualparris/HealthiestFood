/* Local-first, user-entered per-pack pantry lots with dates and reversible usage.
 * Barcode is an optional unverified typed identifier, never a claim of scanned product identity.
 * Never pronounce any food 'safe' from a date alone. Nothing syncs without explicit action.
 */
(function(root,factory){const api=factory(root);if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.FoodPantryLots=api;})(typeof window!=="undefined"?window:null,function(w){
"use strict";
const KEY="good-food-pantry-lots-v1",PANTRY="good-food-planned-have-v1",MAX=120,ESC={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};
const escape=s=>String(s).replace(/[&<>"']/g,x=>ESC[x]);
const dateValid=d=>typeof d==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d))&&new Date(d+"T12:00:00Z").toISOString().slice(0,10)===d;
const today=()=>{const p=Object.fromEntries(new Intl.DateTimeFormat("en-AU",{timeZone:"Australia/Sydney",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()).filter(x=>x.type!=="literal").map(x=>[x.type,x.value]));return p.year+"-"+p.month+"-"+p.day};
function clean(l){
 if(!l||typeof l!=="object"||Array.isArray(l))return null;
 const id=String(l.id||"");if(!/^lot-[0-9]{9,16}-[0-9]{1,4}$/.test(id))return null;
 const key=String(l.key||"").slice(0,64),name=String(l.name||"").trim().slice(0,120);
 const unit=String(l.unit||"");if(!/^[a-z][a-z0-9-]{0,60}$/.test(key)||!name||!["g","mL","each","tins"].includes(unit))return null;
 const amount=Number(l.amount);if(!Number.isFinite(amount)||amount<0||amount>100000)return null;
 const condition=["unopened","opened"].includes(l.condition)?l.condition:"unopened";
 const location=["fridge","freezer","pantry"].includes(l.location)?l.location:"pantry";
 const useBy=dateValid(l.useBy)?l.useBy:"",bestBefore=dateValid(l.bestBefore)?l.bestBefore:"";
 const barcode=String(l.barcode||"").replace(/[^0-9A-Za-z-]/g,"").slice(0,40);
 const history=(Array.isArray(l.history)?l.history:[]).slice(-20).filter(x=>x&&Number.isFinite(x.before)&&Number.isFinite(x.after)&&Number.isFinite(x.delta)&&["consume","add"].includes(x.action)).map(x=>({before:x.before,after:x.after,delta:x.delta,action:x.action,at:Number(x.at)||0}));
 return {id,key,name,unit,amount,condition,location,useBy,bestBefore,barcode,history,addedAt:Number(l.addedAt)||Number(id.split("-")[1])};
}
function load(storage){if(!storage)return[];let raw;try{raw=JSON.parse(storage.getItem(KEY)||"[]")}catch{return[]}return Array.isArray(raw)?raw.slice(0,MAX).map(clean).filter(Boolean):[]}
function save(storage,rows){if(!storage||rows.length>MAX)return false;try{storage.setItem(KEY,JSON.stringify(rows.map(clean).filter(Boolean)));return true}catch{return false}}
function add(rows,params,now=Date.now()){
 if(rows.length>=MAX||!params)return null;
 const id="lot-"+Math.floor(now)+"-"+(rows.filter(x=>x.id.startsWith("lot-"+Math.floor(now)+"-")).length+1);
 const row=clean({id,key:params.key,name:params.name,unit:params.unit,amount:params.amount,condition:params.condition,location:params.location,useBy:params.useBy,bestBefore:params.bestBefore,barcode:params.barcode,history:[],addedAt:Math.floor(now)});
 return row?[...rows,row]:null;
}
function change(rows,id,delta,now=Date.now()){
 const n=Number(delta),i=rows.findIndex(x=>x.id===id);
 if(i<0||!Number.isFinite(n)||n===0||Math.abs(n)>100000)return null;
 const l=clean(rows[i]);if(!l)return null;const amount=l.amount+n;
 if(amount<0||amount>100000)return null;
 const next={...l,amount,history:[...l.history,{before:l.amount,after:amount,delta:n,action:n<0?"consume":"add",at:now}].slice(-20)};
 return rows.map((x,j)=>i===j?next:x);
}
function undo(rows,id){
 const i=rows.findIndex(x=>x.id===id);if(i<0)return null;
 const l=clean(rows[i]),last=l?.history.at(-1);if(!last)return null;
 return rows.map((x,j)=>i===j?{...l,amount:last.before,history:l.history.slice(0,-1)}:x);
}
function status(l,now=today()){
 if(l.useBy&&l.useBy<now)return {id:"past-use-by",label:"Past use-by: do not eat"};
 if(l.useBy&&l.useBy===now)return {id:"use-by-today",label:"Use-by today; check storage"};
 if(l.bestBefore&&l.bestBefore<now)return {id:"past-best-before",label:"Past best-before; assess condition"};
 if(l.useBy||l.bestBefore)return {id:"dated",label:"Date recorded; check storage"};
 return {id:"unknown",label:"No date: check label"};
}
function ordered(rows,now=today()){
 return rows.slice().sort((a,b)=>{
  const x=status(a,now).id==="past-use-by",y=status(b,now).id==="past-use-by";
  if(x!==y)return x?1:-1;
  return (a.useBy||a.bestBefore||"9999-99-99").localeCompare(b.useBy||b.bestBefore||"9999-99-99")||a.addedAt-b.addedAt;
 });
}
function totals(rows,now=today()){
 const totals={};
 for(const l of rows){if(l.amount<=0||status(l,now).id==="past-use-by")continue;
  const k=l.key;if(!totals[k])totals[k]={amount:0,unit:l.unit,name:l.name,lotCount:0};
  if(totals[k].unit!==l.unit)continue;
  totals[k].amount+=l.amount;totals[k].lotCount++;
 }
 return totals;
}
function dinnerNeeds(lots,recipes,shop,now=today()){
 if(!shop||!Array.isArray(recipes))return [];
 const inventory=Object.fromEntries(Object.entries(totals(lots,now)).map(([k,v])=>[k,v.amount]));
 return recipes.filter(r=>r.category==="dinner").map(recipe=>{
   const rows=shop.reconcile(shop.merge([{recipeId:recipe.id,portions:1}],recipes),inventory).rows;
   const missing=rows.filter(x=>Number(x.toBuy)>0);
   return {id:recipe.id,name:recipe.name,missing:missing.length,unknown:missing.filter(x=>!x.map).length,items:missing.map(x=>x.name),estimate:missing.every(x=>x.map)?missing.reduce((total,x)=>total+(Number(x.priceToBuy)||0),0):null};
 }).sort((a,b)=>a.missing-b.missing||a.unknown-b.unknown||a.name.localeCompare(b.name));
}
function storage(){try{return w?.localStorage||null}catch{return null}}
const elem=()=>typeof document==="undefined"?null:document.getElementById("pantryLotManager");
function mappings(){return w?.FoodShopping?.mappings||[]}
function present(message=""){
 const node=elem();if(!node)return;
 const rows=load(storage()),map=mappings();
 const ideas=dinnerNeeds(rows,w?.FOOD_DATA?.recipes||[],w?.FoodShopping);
 const soon=ordered(rows).filter(l=>l.amount>0&&l.useBy&&status(l).id!=="past-use-by").slice(0,3);
 const ideasHtml='<section class="pantry-dinner-ideas"><h3>Dinner ideas: fewest missing ingredients</h3><p>Based only on the amounts you recorded in dated lots, for one adult portion. This does not confirm food safety, allergies, or live shop availability. Any unrecorded pantry items are counted as missing.</p><div>'+ideas.map(d=>'<article><strong>'+escape(d.name)+'</strong><span>'+d.missing+' purchase lines to check'+(d.unknown?' · '+d.unknown+' product matches unknown':'')+'</span><small>'+escape(d.items.slice(0,4).join("; ")||"No recorded purchases needed")+(d.items.length>4?" …":"")+'</small><button type="button" data-select="'+escape(d.id)+'">View recipe ↗</button></article>').join("")+'</div></section><p class="pantry-next-dates">Next recorded use-by dates to check: '+(soon.length?soon.map(l=>escape(l.name)+" ("+l.useBy+")").join(" · "):"None recorded")+'. Check cold-chain history before using anything.</p>';
 const options=map.map(m=>'<option value="'+escape(m.key)+'">'+escape(m.buy)+' ('+escape(m.unit||"each")+')</option>').join("");
 const first=map[0];
 node.innerHTML='<div class="pantry-lot-head"><span class="section-kicker">LOCAL · MANUAL INVENTORY</span><h2>What’s already in the pantry?</h2><p>Record individual opened/unopened packs and dates instead of one misleading combined quantity. All records stay on this device; the dates are reminders, <strong>never proof of food safety</strong>. Refrigerated food needs correct temperatures and handling regardless of the printed date.</p></div>'+
 '<form id="pantryAddForm" class="pantry-lot-form"><label>Product / pack<select name="key" id="pantryNewKey" required>'+options+'</select></label><label>Quantity<input type="number" name="amount" min="0.01" max="100000" step="any" inputmode="decimal" required></label><label>Pack state<select name="condition"><option value="unopened">Unopened</option><option value="opened">Opened</option></select></label>'+
 '<label>Stored in<select name="location"><option value="pantry">Pantry</option><option value="fridge">Fridge</option><option value="freezer">Freezer</option></select></label><label>Use-by (if applicable)<input type="date" name="useBy"></label><label>Best-before (if applicable)<input type="date" name="bestBefore"></label>'+
 '<label>Optional barcode (typed, unverified)<input type="text" name="barcode" maxlength="40" inputmode="numeric" placeholder="Read from pack"></label><button type="submit" class="btn btn-primary">Add this pack</button></form>'+
 ideasHtml+'<div class="pantry-lot-meta"><span>'+rows.length+' separate lots · '+Object.keys(totals(rows)).length+' recognised product types</span><button type="button" data-pantry-sync>Copy counted quantities to shopping checklist ↗</button></div>'+
 '<p id="pantryFeedback" role="status" class="pantry-feedback">'+escape(message)+'</p>'+
 '<div class="pantry-lot-items">'+(rows.length?ordered(rows).map(l=>{const st=status(l),date=l.useBy?"Use-by "+l.useBy:l.bestBefore?"Best-before "+l.bestBefore:"No printed date";
 return '<article class="pantry-lot" data-lot="'+escape(l.id)+'"><div class="pantry-lot-title"><strong>'+escape(l.name)+'</strong><span class="pantry-lot-state" data-state="'+escape(st.id)+'">'+escape(st.label)+'</span></div><p>'+escape(String(l.amount))+' '+escape(l.unit)+' · '+escape(l.condition)+' · '+escape(l.location)+' · '+escape(date)+(l.barcode?' · Barcode (unverified): '+escape(l.barcode):'')+'</p><div class="pantry-lot-controls"><label>Amount to use / add <input type="number" min="0.01" step="any" max="100000" inputmode="decimal" data-qty></label><button type="button" data-lot-use="'+escape(l.id)+'">Used this amount</button><button type="button" data-lot-add="'+escape(l.id)+'">Added amount</button><button type="button" data-lot-undo="'+escape(l.id)+'"'+(l.history.length?"":" disabled")+'>Undo last change</button><button type="button" data-lot-remove="'+escape(l.id)+'">Remove record</button></div></article>'
 }).join(""):'<p class="pantry-lot-empty">No packs recorded yet. Add one above to start a dated inventory.</p>')+'</div>'+
 '<p class="pantry-lot-caveat">Use-first suggestions sort by your recorded dates, excluding items already past their use-by. They cannot establish whether food is safe. Opening a pack changes its safe life; follow the current manufacturer label. No stock, barcode identity, temperature or use-by date has been independently verified.</p>';
 node.dataset.init="true";
}
function commit(rows,msg){if(!save(storage(),rows)){present("Could not save to this browser; no changes were confirmed.");return}present(msg)}
function init(){
 const node=elem();if(!node||node.dataset.bound)return;node.dataset.bound="true";present();
 node.addEventListener("submit",e=>{
  if(e.target.id!=="pantryAddForm")return;e.preventDefault();
  const form=new FormData(e.target),key=String(form.get("key")),m=mappings().find(x=>x.key===key);
  const amount=Number(form.get("amount"));if(!m||!Number.isFinite(amount)||amount<=0)return;
  const data=add(load(storage()),{key,name:m.buy,unit:m.unit||"each",amount,condition:String(form.get("condition")),location:String(form.get("location")),useBy:String(form.get("useBy")||""),bestBefore:String(form.get("bestBefore")||""),barcode:String(form.get("barcode")||"")});
  if(!data){present("Please check the quantity and dates, or the maximum of 120 lots.");return}commit(data,"Pack recorded. The dates and quantity are user supplied, not verified.");
 });
 node.addEventListener("click",e=>{
  const btn=e.target.closest("button");if(!btn||btn.type==="submit")return;
  let rows=load(storage());
  if(btn.matches("[data-pantry-sync]")){
   if(!w.confirm("Replace shared shopping-checklist quantities for these products with your manually counted lot totals? Existing manual amounts for other items remain unchanged; this DOES NOT verify edible yield, stock condition or safe storage."))return;
   let prior={};try{prior=JSON.parse(storage().getItem(PANTRY)||"{}");if(!prior||Array.isArray(prior)||typeof prior!=="object")prior={}}catch{}
   for(const [k,v] of Object.entries(totals(rows)))if(mappings().some(m=>m.key===k&&((m.unit||"each")===v.unit)))prior[k]=v.amount;
   try{storage().setItem(PANTRY,JSON.stringify(prior));w.dispatchEvent(new Event("goodfood:pantry-updated"));present("Counted lots copied to the shared pantry quantities. Check each actual pack and the shopping list.");}catch{present("Storage unavailable; pantry was not updated.")}return;
  }
  const id=btn.dataset.lotUse||btn.dataset.lotAdd||btn.dataset.lotUndo||btn.dataset.lotRemove;if(!id)return;
  if(btn.hasAttribute("data-lot-remove")){if(!w.confirm("Remove this inventory record? This cannot be undone."))return;commit(rows.filter(x=>x.id!==id),"Inventory record removed.");return}
  if(btn.hasAttribute("data-lot-undo")){const result=undo(rows,id);if(result)commit(result,"The last stock adjustment was undone.");return}
  const qty=Number(btn.closest(".pantry-lot")?.querySelector("[data-qty]")?.value);if(!Number.isFinite(qty)||qty<=0){present("Enter the real quantity used or added first.");return}
  const result=change(rows,id,btn.hasAttribute("data-lot-use")?-qty:qty);if(!result){present("Not enough stock in that lot, or invalid amount.");return}commit(result,"Lot updated. This is a manual inventory entry.");
 });
}
if(w&&typeof document!=="undefined"){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init()}
return {KEY,PANTRY,clean,load,save,add,change,undo,status,ordered,totals,dinnerNeeds,init};
});
