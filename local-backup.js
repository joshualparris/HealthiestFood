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
 // FNV-1a 32-bit protects against accidental file corruption only, NOT tampering.
 function checksum(records){
   const data=JSON.stringify(Object.entries(records).sort(([a],[b])=>a<b?-1:a>b?1:0));
   let hash=2166136261;
   for(let i=0;i<data.length;i++){hash=Math.imul(hash^data.charCodeAt(i),16777619)>>>0;}
   return "fnv1a32:"+hash.toString(16).padStart(8,"0");
 }

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
   const records=collect(storage);
   return JSON.stringify({schema:SCHEMA,exportedAt:new Date().toISOString(),origin,recordCount:Object.keys(records).length,checksum:checksum(records),warning:"Private browser data. Integrity checksum detects accidental corruption only; it is not a signature or encryption.",records},null,2);
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
   if(obj.recordCount!==undefined&&obj.recordCount!==keys.length)throw Error("Backup record count does not match its contents.");
   if(obj.checksum!==undefined&&obj.checksum!==checksum(obj.records))throw Error("Backup checksum mismatch. Do not import a modified or corrupted file.");
   return {records:obj.records,exportedAt:String(obj.exportedAt||"unknown"),origin:String(obj.origin||"unknown").slice(0,100),count:keys.length,checksumState:obj.checksum?"verified":"legacy-unverified"};

 }
 function restore(storage, parsed, replace=false){
   // Storage is not transactional: stage new values, then delete stale app-owned
   // keys. On ANY failure, try to restore the complete original app snapshot.
   // Never claim import succeeded when writes or rollback are unreliable.
   const keys=Object.keys(parsed.records);
   const before=collect(storage);
   try{
     for(const k of keys)storage.setItem(k,parsed.records[k]);
     if(replace)for(const k of Object.keys(before)){
       if(!Object.hasOwn(parsed.records,k))storage.removeItem(k);
     }
   }catch(e){
     let rollbackError=null;
     try{
       const now=collect(storage);
       // Restore original values before deleting imported-only records.
       for(const [k,v] of Object.entries(before))storage.setItem(k,v);
       for(const k of Object.keys(now)){
         if(!Object.hasOwn(before,k))storage.removeItem(k);
       }
     }catch(restoreError){rollbackError=restoreError;}
     const reason=rollbackError?
       "Import failed and browser storage could not be fully rolled back. Keep your original private backup and inspect saved data before retrying.":
       "Import failed; original app data restored where browser storage allowed.";
     throw new Error(reason,{cause:e});
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
       // Dry-run preview: display the record names, not their private values.
       const names=Object.keys(parsed.records).sort().join("\\n• ");
       const preview="Preview "+parsed.count+" app records from "+parsed.exportedAt+" ("+parsed.origin+").\\nIntegrity: "+(parsed.checksumState==="verified"?"checksum matches":"older backup without checksum verification")+".\\n• "+names+"\\n\\nImport replaces existing HealthiestFood data on THIS domain. Save a backup first. Continue?";
       const proceed=confirm(preview);
       if(!proceed){announce("Import cancelled. No changes made.");return;}
       restore(localStorage,parsed,true);
       announce("Backup imported. Reloading the page to read your restored plan.");
       location.reload();
     }catch(e){announce("Import did not complete: "+(e.message||"Invalid file"))}
     finally{picker.value="";}
   });
 }
 return {PREFIX,SCHEMA,collect,checksum,serialize,parse,restore,init};
});
