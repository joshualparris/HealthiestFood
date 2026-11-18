const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const Cloud=require('../cloud-sync.js'),Backup=require('../local-backup.js');
function memory(initial={}){
 const m=new Map(Object.entries(initial));
 return {get length(){return m.size},key:i=>[...m.keys()][i]??null,getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};
}
function clientMock(){
 let data=null,userId="private-user";
 return {
  auth:{getUser:async()=>({data:{user:{id:userId}},error:null}),signInWithOtp:async()=>({error:null}),signOut:async()=>({error:null})},
  from:()=>({select:()=>({eq:()=>({maybeSingle:async()=>({data,error:null})})})}),
  rpc:async(name,args)=>{
   assert.equal(name,'save_healthiestfood_snapshot');
   if(args.expected_revision!==(data?.revision||0))return {data:[{was_conflict:true,saved_revision:0}],error:null};
   data={snapshot:args.new_snapshot,revision:(data?.revision||0)+1,updated_at:new Date().toISOString()};
   return {data:[{was_conflict:false,saved_revision:data.revision}],error:null};
  },
  switchUser:id=>{userId=id;},
  inject:(snapshot,revision)=>{data={snapshot,revision,updated_at:new Date().toISOString()}},
  current:()=>data
 };
}
test('cloud sync disabled until dedicated HTTPS project and public key configured',()=>{
 assert.equal(Cloud.validConfig({enabled:false,url:'',publishableKey:''}),false);
 assert.equal(Cloud.validConfig({enabled:true,url:'https://not-supabase.example.com',publishableKey:'sb_publishable_abcdefghijklm'}),false);
 assert.equal(Cloud.validConfig({enabled:true,url:'https://abc.supabase.co',publishableKey:'sb_secret_abcdefghijklm'}),false);
 assert.equal(Cloud.validConfig({enabled:true,url:'https://abc.supabase.co',publishableKey:'sb_publishable_abcdefghijklmnop'}),true);
 const sql=read('supabase/migrations/20261118_healthiestfood_private_sync.sql').toLowerCase();
 assert.match(sql,/enable row level security/);
 assert.match(sql,/with check \(\(select auth.uid\(\)\) = owner_id\)/);
 assert.match(sql,/security invoker/);
 assert.doesNotMatch(sql,/security definer/);
});
test('initial upload creates private record, next update increments revision and stale write is blocked',async()=>{
 const store=memory({'good-food-test':'{"pantry":true}'}),remote=clientMock(),s=Cloud.make(remote,Backup,store);
 const first=await s.push();assert.equal(first.ok,true);assert.equal(first.revision,1);
 assert.equal(remote.current().snapshot.records['good-food-test'],'{"pantry":true}');
 store.setItem('good-food-test','{"pantry":false}');
 const second=await s.push();assert.equal(second.ok,true);assert.equal(second.revision,2);
 assert.equal(remote.current().snapshot.records['good-food-test'],'{"pantry":false}');
 const outside={...remote.current().snapshot};remote.inject(outside,3);
 store.setItem('good-food-test','{"pantry":"changed locally"}');
 const blocked=await s.push();assert.equal(blocked.conflict,true);
 assert.equal(remote.current().revision,3);
 assert.equal(remote.current().snapshot.records['good-food-test'],'{"pantry":false}');
});
test('pull requires explicit consent and refuses overwriting dirty local changes',async()=>{
 const remote=clientMock(),one=memory({'good-food-test':'{"local":1}'}),a=Cloud.make(remote,Backup,one);
 await a.push();
 const other=memory({'good-food-test':'{"local":99}'}),b=Cloud.make(remote,Backup,other);
 await assert.rejects(()=>b.pull(),/consent/);
 const got=await b.inspect();assert.equal(got.remoteRecords,1);
 const pulled=await b.pull({replace:true});assert.equal(pulled.ok,true);
 assert.equal(other.getItem('good-food-test'),'{"local":1}');
 other.setItem('good-food-test','{"modified":2}');
 const blocked=await b.pull({replace:true});assert.equal(blocked.conflict,true);
 assert.equal(other.getItem('good-food-test'),'{"modified":2}');
});
test('cloud js and new UI compile and do not silently send or download data',()=>{
 for(const x of ['cloud-sync.js','cloud-sync-ui.js','cloud-config.js'])assert.doesNotThrow(()=>new vm.Script(read(x)),x);
 assert.match(read('cloud-config.js'),/enabled:false/);
 assert.match(read('cloud-sync-ui.js'),/confirm\(/);
 assert.match(read('cloud-sync-ui.js'),/before-cloud-pull\.json/);
 assert.match(read('smart-kitchen.html'),/id="cloudSyncRoot"/);
});

test('same-browser account switch cannot inherit another account\'s revision authority',async()=>{
 const store=memory({'good-food-pantry':'{"amount":3}'}),remote=clientMock();
 const sync=Cloud.make(remote,Backup,store);
 const first=await sync.push();assert.equal(first.ok,true);
 assert.equal(first.revision,1);
 const m=JSON.parse(store.getItem(Cloud.META));assert.equal(m.ownerId,'private-user');
 remote.switchUser('a-different-user');
 store.setItem('good-food-pantry','{"amount":7}');
 const blocked=await sync.push();
 assert.equal(blocked.conflict,true);
 assert.equal(remote.current().revision,1);
 assert.equal(remote.current().snapshot.records['good-food-pantry'],'{"amount":3}');
 remote.switchUser('private-user');
 const allowed=await sync.push();
 assert.equal(allowed.ok,true);
 assert.equal(allowed.revision,2);
});
