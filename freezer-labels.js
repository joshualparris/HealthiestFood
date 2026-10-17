/* Print-only freezer labels for the original four freezer lunch recipes.
 * Does not certify that a food batch was cooked, cooled or frozen safely.
 * Labels do not contain a food-safety expiry claim. No local data is saved.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.FreezerLabels=api;
})(typeof window!=="undefined"?window:null,function(){
 "use strict";
 const IDs=["a","b","c","d"];
 const ESC={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};
 const escape=s=>String(s).replace(/[&<>"']/g,c=>ESC[c]);
 const dateValid=d=>typeof d==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d))&&new Date(d+"T12:00:00Z").toISOString().slice(0,10)===d;
 function todaySydney(now=new Date()){
   const parts=Object.fromEntries(new Intl.DateTimeFormat("en-AU",{timeZone:"Australia/Sydney",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now).filter(p=>p.type!=="literal").map(p=>[p.type,p.value]));
   return parts.year+"-"+parts.month+"-"+parts.day;
 }
 function build(recipe,options){
   if(!recipe||!IDs.includes(recipe.id))throw Error("This tool only supports the four planned V6 freezer lunches.");
   const count=Number(options.count);
   if(!Number.isInteger(count)||count<1||count>20)throw Error("Choose between 1 and 20 containers.");
   const cooked=String(options.cooked||""),frozen=String(options.frozen||"");
   if(!dateValid(cooked)||!dateValid(frozen))throw Error("Enter valid cooked and frozen dates.");
   if(frozen<cooked)throw Error("Frozen date cannot be earlier than cooked date.");
   const note=String(options.note||"").trim().slice(0,100);
   const rice=(recipe.ingredients||[]).some(([n,u,name])=>/\brice\b|\bpasta\b/i.test(name));
   const allergens=(recipe.id==="a"||recipe.id==="b")?"Fish, tree nuts (walnuts)":"Soy, tree nuts (walnuts)";
   return Array.from({length:count},(_,i)=>({
      recipeId:recipe.id,name:recipe.name,cooked,frozen,index:i+1,count,note,rice,allergens,
      instructions:"Keep frozen at −18°C or colder. Thaw in fridge; reheat once until steaming hot throughout."+(rice?" Do not reheat rice a second time.":""),
      caution:"Food-safety dates cannot be established from this label alone. Check original storage and handling."
   }));
 }
 function html(labels){
   return labels.map(l=>'<article class="freezer-label"><div class="label-brand">GOOD FOOD · LONG GAME <span>MEAL '+escape(l.recipeId.toUpperCase())+'</span></div><h2>'+escape(l.name)+'</h2><div class="label-dates"><span>Cooked <strong>'+escape(l.cooked)+'</strong></span><span>Frozen <strong>'+escape(l.frozen)+'</strong></span></div><p class="label-index">Container '+l.index+' of '+l.count+'</p><p class="label-instructions">'+escape(l.instructions)+'</p><p class="label-allergens"><strong>Allergens to verify:</strong> '+escape(l.allergens)+'. Check actual packages/cross-contact.</p>'+(l.note?'<p class="label-note">Note: '+escape(l.note)+'</p>':'')+'<p class="label-warning">'+escape(l.caution)+'</p></article>').join("");
 }
 function init(){
   if(typeof document==="undefined")return;
   const recipes=(window.FOOD_DATA?.recipes||[]).filter(r=>IDs.includes(r.id));
   const form=document.getElementById("labelForm"),select=document.getElementById("labelRecipe"),preview=document.getElementById("labelPreview"),message=document.getElementById("labelMessage");
   if(!form||!select||!preview)return;
   select.innerHTML=recipes.map(r=>'<option value="'+escape(r.id)+'">'+escape(r.name)+'</option>').join("");
   const id=new URLSearchParams(location.search).get("recipe");
   if(IDs.includes(id))select.value=id;
   const date=todaySydney();
   form.elements.namedItem("cooked").value=date;
   form.elements.namedItem("frozen").value=date;
   function refresh(){
     try{
       const r=recipes.find(r=>r.id===select.value);
       const rows=build(r,{
         count:Number(form.elements.namedItem("count").value),
         cooked:form.elements.namedItem("cooked").value,
         frozen:form.elements.namedItem("frozen").value,
         note:form.elements.namedItem("note").value
       });
       preview.innerHTML=html(rows);
       message.textContent=rows.length+" printable container labels. No information is saved to a server.";
       return true;
     }catch(e){preview.innerHTML="";message.textContent=e.message;return false;}
   }
   form.addEventListener("input",refresh);form.addEventListener("change",refresh);
   form.addEventListener("submit",e=>{e.preventDefault();if(refresh())window.print();});
   refresh();
 }
 return {IDs,dateValid,todaySydney,build,html,init};
});
