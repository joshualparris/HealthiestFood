/* Cloud sync opt-in screen: no credentials or uploads while config is disabled. */
(function(){
"use strict";
if(typeof document==="undefined")return;
const $=id=>document.getElementById(id);
async function boot(){
 if(!$("cloudSyncRoot"))return;
 const config=window.FOOD_CLOUD_CONFIG,api=window.FoodCloudSync,backup=window.FoodDataBackup;
 const status=s=>{if($("cloudSyncStatus"))$("cloudSyncStatus").textContent=s;};
 if(!api?.validConfig(config)){status("Not connected. A dedicated Supabase project, owner account and costs have not yet been approved. All records stay on this device.");return;}
 // A fixed version is loaded only for an explicitly configured HTTPS project.
 if(!window.supabase?.createClient){
  try{await new Promise((resolve,reject)=>{
   const script=document.createElement("script");
   script.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/dist/umd/supabase.js";
   script.onload=resolve;script.onerror=()=>reject(Error("Supabase client unavailable"));document.head.append(script);
  });}catch(e){status("Cloud client not available: "+e.message);return;}
 }
 if(!window.supabase?.createClient){status("Supabase client failed to initialise.");return;}
 const client=window.supabase.createClient(config.url,config.publishableKey,{
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true},
  global:{headers:{"X-Client-Info":"HealthiestFood-SmartKitchen"}}
 });
 const bridge=api.make(client,backup,localStorage);
 $("cloudSyncControls").hidden=false;
 let signedIn=false;
 async function refresh(){
  const {data:{user},error}=await client.auth.getUser();
  signedIn=!!user&&!error;
  for(const id of ["cloudInspect","cloudPush","cloudPull","cloudSignOut"])$(id).disabled=!signedIn;
  status(signedIn?"Signed in. Your cloud copy is NOT automatically overwritten. Choose Compare before syncing.":"Signed out. Only your current browser contains your local records.");
 }
 $("cloudLogin").addEventListener("click",async()=>{
  const email=$("cloudEmail").value.trim().slice(0,200);
  if(!confirm("Request a HealthiestFood magic-link sign-in email? This does not upload your pantry."))return;
  try{const result=await bridge.signIn(email,location.origin+location.pathname);
   status(result.reason);}catch(e){status("Sign-in request failed: "+e.message);}
 });
 $("cloudInspect").addEventListener("click",async()=>{
  if(!signedIn)return;
  try{
   const x=await bridge.inspect();
   status("Local: "+x.localRecords+" record(s). Cloud: "+x.remoteRecords+" record(s), revision "+x.remoteRevision+
    (x.remoteUpdated?" saved "+x.remoteUpdated:"")+
    (x.needsDecision?" · Copies differ. Decide which you want before overwriting.":" · Copies appear aligned by checksums.")+
    (x.changedElsewhere?" · Another device has changed the cloud copy.":""));
  }catch(e){status("Could not inspect private cloud copy: "+e.message);}
 });
 $("cloudPush").addEventListener("click",async()=>{
  if(!signedIn)return;
  try{
   const x=await bridge.inspect();
   const text="Upload "+x.localRecords+" local saved record(s) to your private account"+
    (x.remoteRevision?" and replace the cloud copy at revision "+x.remoteRevision:" as its first copy")+
    "? Do not proceed if another device has newer changes.";
   if(!confirm(text))return;
   const response=await bridge.push();
   if(response.ok){status("Uploaded revision "+response.revision+" to your private account. No other device has been automatically overwritten.");return;}
   if(response.conflict){
    status("SYNC BLOCKED — "+response.reason+" Use Download Cloud Copy or compare devices. No data overwritten.");
    return;
   }
   status("Cloud upload not completed: "+response.reason);
  }catch(e){status("Cloud upload failed: "+e.message);}
 });
 $("cloudPull").addEventListener("click",async()=>{
  if(!signedIn)return;
  try{
   const x=await bridge.inspect();
   if(!x.remoteRevision){status("No remote copy exists to download.");return;}
   if(!confirm("This replaces the HealthiestFood data IN THIS BROWSER with the cloud copy ("+x.remoteRecords+
    " records, revision "+x.remoteRevision+"). Download a rollback backup of this browser first?"))return;
   // Always produce a real rollback backup before asking to proceed.
   const data=backup.serialize(localStorage,location.origin),url=URL.createObjectURL(new Blob([data],{type:"application/json"}));
   const a=document.createElement("a");a.href=url;a.download="healthiestfood-before-cloud-pull.json";document.body.append(a);a.click();a.remove();
   setTimeout(()=>URL.revokeObjectURL(url),1000);
   if(!confirm("A local rollback file was offered for download. Have you safely saved it, and do you want to replace local app records now?"))return;
   const result=await bridge.pull({replace:true});
   if(result.ok){status("Downloaded cloud revision "+result.revision+" and restored "+result.count+" records. Refresh the app to read them.");return;}
   status("Download stopped: "+(result.reason||"Unknown conflict"));
  }catch(e){status("Cloud download failed: "+e.message);}
 });
 $("cloudSignOut").addEventListener("click",async()=>{
  if(!signedIn)return;
  try{await bridge.signOut();await refresh();}catch(e){status("Sign-out error: "+e.message);}
 });
 await refresh();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);
else boot();
})();
