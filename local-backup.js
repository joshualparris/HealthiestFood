/* Explicit, user-controlled portable backup of this site's own local records.
 * Render/Vercel/GitHub Pages are different origins: data do not sync.
 * No network calls, accounts or analytics. Import replaces existing prefixed records
 * only after confirmation; keeps a local rollback snapshot when a write fails.
 */
(function(root, factory) {
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.FoodDataBackup=api;
})(typeof window!=="undefined"?window:null,function(){
 "use strict";
 const PREFIX="good-food-";
 const SCHEMA="healthiestfood-local-backup-v1";
 const MAX_BYTES=1024*1024; // 1 MiB limit protects against accidental huge imports
 const KEY_RE=/^good-food-[a-z0-9_-]{1,80}$/;
 function collect(storage){
   const records={};
   for(let i=0;i<storage.length;i++){
     const k=storage.key(i);
     if(!KEY_RE.test(k||""))continue;
     const v=storage.getItem(k);
     if(typeof v==="string"&&v.length<MAX_BYTES)records[k]=v;
   }
   return records;
 }
 function serialize(storage,origin="this browser"){
   return JSON.stringify({schema:SCHEMA,exportedAt:new Date().toISOString(),origin,warning:"Private browser data; do not upload to public issue trackers.",records:collect(storage)},null,2);
 }
 function parse(raw){
   if(typeof raw!=="string"||raw.length>MAX_BYTES)throw Error("Backup must be less than 1 MB.");
   let obj;try{obj=JSON.parse(raw)}catch{throw Error("Not valid JSON.");}
   if(!obj||obj.schema!==SCHEMA||!obj.records||typeof obj.records!=="object"||Array.isArray(obj.records))throw Error("Not a recognised HealthiestFood data backup.");
   const keys=Object.keys(obj.records);
   if(keys.length>100)throw Error("Backup has too many records.");
   for(const k of keys){
     if(!KEY_RE.test(k))throw Error("Backup contains an unexpected key.");
     const v=obj.records[k];
     if(typeof v!=="string"||v.length>MAX_BYTES||!(/^[\[{]/.test(v.trim())))throw Error("Record is not a valid saved-data string.");
     try{JSON.parse(v)}catch{throw Error("Record '"+k+"' is not valid JSON.");}
   }
   return {records:obj.records,exportedAt:String(obj.exportedAt||"unknown"),count:keys.length};
 }
 function restore(storage, parsed, replace=false){
   const keys=Object.keys(parsed.records);
   const before=collect(storage);
   if(replace)for(const k of Object.keys(before))if(!Object.hasOwn(parsed.records,k))storage.removeItem(k);
   try{
     for(const k of keys)storage.setItem(k,parsed.records[k]);
   }catch(e){
     // Best-effort rollback of only app-owned keys.
     for(const k of Object.keys(collect(storage)))storage.removeItem(k);
     for(const [k,v] of Object.entries(before))storage.setItem(k,v);
     throw e;
   }
   return keys.length;
 }
 function init(){
   const root=document.getElementById("dataPortability");if(!root)return;
   const feedback=root.querySelector("#dataBackupStatus");
   const announce=msg=>{if(feedback)feedback.textContent=msg;};
   const exportBtn=root.querySelector("#exportFoodData");
   const picker=root.querySelector("#importFoodData");
   exportBtn?.addEventListener("click",()=>{
     let value;
     try{value=serialize(localStorage,location.origin)}catch{announce("Could not read local storage. Export unavailable in this browser.");return}
     const blob=new Blob([value],{type:"application/json"}),href=URL.createObjectURL(blob),a=document.createElement("a");
     a.href=href;a.download="healthiestfood-private-backup-"+new Date().toISOString().slice(0,10)+".json";
     document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),5000);
     announce("Backup download requested. Store it somewhere private.");
   });
   picker?.addEventListener("change",async()=>{
     const file=picker.files?.[0];if(!file)return;
     try{
       if(file.size>MAX_BYTES)throw Error("The file is larger than 1 MB.");
       const parsed=parse(await file.text());
       const proceed=confirm("Import "+parsed.count+" saved HealthiestFood data records from "+parsed.exportedAt+"? Existing meal plans, shopping progress, timers and cook-up notes on THIS host may be replaced. Save a backup first.");
       if(!proceed){announce("Import cancelled. No changes made.");return;}
       restore(localStorage,parsed,true);
       announce("Backup imported. Reloading the page to read your restored plan.");
       location.reload();
     }catch(e){announce("Import did not complete: "+(e.message||"Invalid file"))}
     finally{picker.value="";}
   });
 }
 return {PREFIX,SCHEMA,collect,serialize,parse,restore,init};
});
