/* Explicit, revision-checked Supabase sync. No remote writes until user signs in and clicks Push.
 * Does not implement unsafe blind background overwrites or household sharing.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.FoodCloudSync=api;
})(typeof window!=="undefined"?window:null,function(){
"use strict";
const META="hf-cloud-snapshot-meta-v1",TABLE="healthiestfood_snapshots";
function make(client,backup,storage){
 if(!client?.from||!client?.rpc||!backup?.serialize||!backup?.parse||!backup?.restore)throw Error("Missing trusted sync dependencies");
 function meta(){try{return JSON.parse(storage.getItem(META)||"null")||{}}catch{return {}}}
 function setMeta(v){storage.setItem(META,JSON.stringify(v));}
 function local(){return JSON.parse(backup.serialize(storage,"HealthiestFood browser"));}
 async function remote(){
  const {data:{user},error:authError}=await client.auth.getUser();
  if(authError||!user)throw Error("Sign in before syncing");
  const {data,error}=await client.from(TABLE).select("revision,snapshot,updated_at").eq("doc_key","primary").maybeSingle();
  if(error)throw error;
  if(data){
   // Validate full backup structure before exposing it to restore or comparing revisions.
   const parsed=backup.parse(JSON.stringify(data.snapshot));
   return {revision:Number(data.revision),updatedAt:data.updated_at,parsed,snapshot:data.snapshot};
  }
  return null;
 }
 function fingerprints(){
  const l=local();return {checksum:l.checksum,count:l.recordCount};
 }
 async function inspect(){
  const r=await remote(),here=fingerprints(),prior=meta();
  const changed=!!r&&prior.revision!==undefined&&prior.revision!==r.revision;
  return {remoteRevision:r?.revision||0,remoteUpdated:r?.updatedAt||null,remoteRecords:r?.parsed.count||0,
   localRecords:here.count,localChecksum:here.checksum,remoteChecksum:r?.snapshot?.checksum||null,
   changedElsewhere:changed,needsDecision:!!r&&(changed||here.checksum!==r.snapshot?.checksum)};
 }
 async function push({allowInitialReplace=false}={}){
  const r=await remote(),prior=meta(),payload=local();
  if(r&&(!prior.revision||prior.revision!==r.revision)&&!allowInitialReplace){
   return {ok:false,conflict:true,reason:"A remote copy exists that this browser has not downloaded. Pull it or explicitly authorise replacing it."};
  }
  if(prior.revision&&r?.revision!==prior.revision)
   return {ok:false,conflict:true,reason:"Another device updated the cloud copy. Download or reconcile before pushing."};
  const expected=r?.revision||0;
  const {data,error}=await client.rpc("save_healthiestfood_snapshot",{expected_revision:expected,new_snapshot:payload});
  if(error)throw error;
  const response=Array.isArray(data)?data[0]:data;
  if(response?.was_conflict||!Number.isFinite(Number(response?.saved_revision))||Number(response.saved_revision)<1)
   return {ok:false,conflict:true,reason:"Cloud revision changed during upload; your local data were not overwritten."};
  setMeta({revision:Number(response.saved_revision),checksum:payload.checksum,at:new Date().toISOString()});
  return {ok:true,revision:Number(response.saved_revision),count:payload.recordCount};
 }
 async function pull({replace=false}={}){
  if(!replace)throw Error("Explicit restore consent required");
  const r=await remote();
  if(!r)return {ok:false,reason:"No cloud copy to download"};
  const before=local(),prior=meta();
  // An existing local copy must never be silently overwritten when it diverges.
  const localChanged=prior.checksum!==undefined&&prior.checksum!==before.checksum;
  if(localChanged)return {ok:false,conflict:true,reason:"Local records changed since the last cloud copy; export or resolve before replacing."};
  const count=backup.restore(storage,r.parsed,true);
  setMeta({revision:r.revision,checksum:r.snapshot.checksum,at:new Date().toISOString()});
  return {ok:true,revision:r.revision,count};
 }
 async function signIn(email,redirect){
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))throw Error("Enter a valid email address");
  const url=new URL(redirect);
  if(url.protocol!=="https:")throw Error("Secure HTTPS redirect required");
  const {error}=await client.auth.signInWithOtp({email,options:{emailRedirectTo:url.href}});
  if(error)throw error;
  return {ok:true,reason:"Check your inbox for the sign-in link. No data have been uploaded."};
 }
 async function signOut(){
  const {error}=await client.auth.signOut();if(error)throw error;
  // Keep local pantry and meals; clear only sync metadata.
  storage.removeItem(META);
  return {ok:true};
 }
 return {inspect,push,pull,signIn,signOut,remote,fingerprints};
}
function validConfig(c){
 if(!c||c.enabled!==true)return false;
 try{
  const url=new URL(c.url);
  return url.protocol==="https:"&&/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url.origin)
   &&typeof c.publishableKey==="string"&&/^sb_publishable_[A-Za-z0-9_=-]{12,}$/.test(c.publishableKey);
 }catch{return false;}
}
return {make,validConfig,META,TABLE};
});
