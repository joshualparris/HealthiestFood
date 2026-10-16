(()=>{"use strict";
 const list=window.FoodNutrients?.items||[];
 const STORAGE="good-food-dubbo-product-check-v1",store="Woolworths Orana Mall, Dubbo NSW";
 const root=document.getElementById("verifyProducts");
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 let records={};
 try{const x=JSON.parse(localStorage.getItem(STORAGE)||"{}");if(x&&typeof x==="object"&&!Array.isArray(x))records=x}catch{}
 const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(records));return true}catch{return false}};
 function render(){
  root.innerHTML=list.map(x=>{
   const rec=records[x.productId]||{},date=rec.observedAt?new Date(rec.observedAt).toLocaleString("en-AU",{timeZone:"Australia/Sydney"}):"Not yet checked";
   return '<article class="verify-card" data-product-id="'+esc(x.productId)+'"><h2>'+esc(x.name)+'</h2><p><a href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">See Woolworths SKU '+esc(x.productId)+' ↗</a></p><small>'+esc(x.status)+'; '+esc(x.packG)+' g gross pack</small>'+
    '<div class="verify-fields"><label>Pack price AUD<input inputmode="decimal" type="number" min="0" max="9999" step=".01" data-field="price" placeholder="Unverified" value="'+(rec.price??"")+'"></label>'+
    '<label>Stock when checked<select data-field="stock"><option value="unknown">Not checked</option>'+[["available","Seen in stock"],["unavailable","Unavailable"],["not-listed","Not listed at store"]].map(([k,v])=>'<option value="'+k+'"'+(rec.stock===k?' selected':'')+'>'+v+'</option>').join("")+'</select></label></div>'+
    '<label style="font-size:12px;display:block"><input type="checkbox" data-field="labelChecked"'+(rec.labelChecked?' checked':'')+'> I checked pack ingredients/allergens and actual label</label>'+
    '<button type="button" data-save-product>Save my observation</button><p class="verify-stamp">Last checked: '+esc(date)+'. '+esc(store)+'.</p></article>';
  }).join("");
  const count=Object.values(records).filter(x=>Number.isFinite(x.price)&&x.price>=0&&x.observedAt).length;
  document.getElementById("verifyCount").textContent=count+" of "+list.length+" products with a recorded price";
 }
 root.addEventListener("click",e=>{
  const button=e.target.closest("[data-save-product]");if(!button)return;
  const card=button.closest("[data-product-id]"),id=card?.dataset.productId;
  if(!list.some(x=>x.productId===id))return;
  const priceText=card.querySelector('[data-field="price"]').value;
  const stock=card.querySelector('[data-field="stock"]').value;
  const labelChecked=card.querySelector('[data-field="labelChecked"]').checked;
  const price=priceText===""?null:Number(priceText);
  if(price!==null&&(!Number.isFinite(price)||price<0||price>9999)){document.getElementById("verifyStatus").textContent="Enter a valid dollar amount or leave price blank.";return;}
  records[id]={price,stock,labelChecked,observedAt:new Date().toISOString(),store};
  const ok=save();render();document.getElementById("verifyStatus").textContent=ok?"Your observation has been saved on this device.":"Browser storage is unavailable; this observation could not be saved.";
 });
 document.getElementById("clearProductPrices").addEventListener("click",()=>{
  if(!window.confirm("Remove every saved local product price and stock observation?"))return;
  records={};save();render();document.getElementById("verifyStatus").textContent="Local checks cleared.";
 });
 document.getElementById("copyProductPrices").addEventListener("click",()=>{
  const lines=["Woolworths Dubbo Orana Mall — personally recorded observations","Not automatically live or externally verified.","SKU,Product,Pack g,Price AUD,Stock,Label checked,Observed at"];
  const csv=v=>'"'+String(v??"").replaceAll('"','""')+'"';
  list.forEach(p=>{const rec=records[p.productId]||{};lines.push([p.productId,p.name,p.packG,rec.price??"",rec.stock??"unknown",rec.labelChecked?"yes":"no",rec.observedAt??""].map(csv).join(","))});
  const output=lines.join("\n");
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(output).then(()=>document.getElementById("verifyStatus").textContent="Copied observation list.").catch(()=>document.getElementById("verifyStatus").textContent="Clipboard unavailable.");
 });
 render();
})();