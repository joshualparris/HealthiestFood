"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const H=require("../food-handling-log.js"),S=require("../food-safety.js");
const T=1760000000000;
const newBatch=(id="a",stamp=T)=>H.create(id,stamp);
test("Untouched log means UNKNOWN exposure, not zero or safe for later",()=>{
 const b=newBatch();assert.ok(b);assert.equal(H.inspect(b,T).state,"unknown");
 assert.equal(H.inspect(b,T).minutes,null);
 assert.match(H.render(b,T),/Time not established/);
});
test("Multiple danger-zone intervals add cumulatively without resetting after chilling",()=>{
 let b=newBatch();b=H.start(b,T);assert.equal(H.inspect(b,T+20*60000).state,"under-two");
 b=H.stop(b,T+60*60000);assert.equal(H.minutes(b,T+60*60000),60);
 b=H.start(b,T+3*60*60000);b=H.stop(b,T+4.5*60*60000);
 assert.equal(H.minutes(b,T+5*60*60000),150);
 assert.equal(H.inspect(b,T+5*60*60000).state,"use-now");
 assert.match(H.inspect(b,T+5*60*60000).message,/do not refrigerate/i);
 b=H.start(b,T+6*60*60000);b=H.stop(b,T+7.5*60*60000);
 assert.equal(H.minutes(b,T+8*60*60000),240);
 assert.equal(H.inspect(b,T+8*60*60000).state,"discard");
});
test("Exact threshold boundaries: 0 known, 119.9, 120, 239.9, 240; invalid unknown",()=>{
 for(const [minutes,expected] of [[0,"under-two"],[119.9,"under-two"],[120,"use-now"],[239.9,"use-now"],[240,"discard"],[1000,"discard"],[null,"unknown"],[-1,"unknown"]]){
  assert.equal(H.decision(minutes).state,expected,String(minutes));
 }
});
test("Manual earlier exposure is included, validated and never silently erased",()=>{
 let b=newBatch();b=H.addPriorMinutes(b,100);assert.ok(b);
 assert.equal(H.inspect(b,T).minutes,100);
 b=H.start(b,T);b=H.stop(b,T+25*60000);
 assert.equal(H.inspect(b,T+25*60000).minutes,125);
 assert.equal(H.inspect(b,T+25*60000).state,"use-now");
 assert.equal(H.addPriorMinutes(b,-2),null);
 assert.equal(H.addPriorMinutes(b,11000),null);
});
test("Bad or overlapping intervals fail closed",()=>{
 const b=newBatch();
 assert.equal(H.stop(b,T),null);
 const running=H.start(b,T);assert.equal(H.start(running,T+5000),null);
 assert.equal(H.stop(running,T-1),null);
 const finished=H.stop(running,T+5*60000);assert.equal(H.start(finished,T+1),null);
 assert.equal(H.minutes({...finished,events:[{start:T,end:T+10000},{start:T+5000,end:T+20000}]},T+30000),null);
 assert.equal(H.inspect({...finished,events:[{start:T,end:T+10000},{start:T+5000,end:T+20000}]},T+30000).state,"unknown");
});
test("Local persistence maintains separate batch identities and chronological exposure",()=>{
 const mem=new Map();const storage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,v),get length(){return mem.size},key:i=>[...mem.keys()][i]};
 const one=H.stop(H.start(newBatch("a",T),T),T+90*60000);
 const two=H.stop(H.start(newBatch("a",T+100000000),T+100000000),T+100000000+50*60000);
 assert.ok(H.persist(storage,{[one.id]:one,[two.id]:two}));
 assert.equal(H.forRecipe(storage,"a").id,two.id);
 assert.equal(H.inspect(H.parse(storage)[one.id],T+200000000).minutes,90);
 assert.equal(H.inspect(H.parse(storage)[two.id],T+200000000).minutes,50);
});
test("UI is present in cooking states and blocks marking clearly discarded food complete",()=>{
 const app=read("app.js"),html=read("index.html"),ui=read("food-handling-ui.js");
 assert.ok(app.includes("window.FoodHandlingUI?.mount(r.id)"));
 assert.equal(app.split("window.FoodHandlingUI?.mount(r.id)").length-1,2);
 assert.ok(html.includes('src="food-handling-log.js"'));
 assert.ok(html.includes('src="food-handling-ui.js"'));
 assert.ok(ui.includes('info.state==="discard"||info.state==="use-now"'));
 assert.ok(ui.includes("e.stopImmediatePropagation()"));
 assert.ok(ui.includes("setInterval(clock,2000)"));
 assert.ok(ui.includes("data-handling-action"));
});
test("Poultry centre temperature follows 75 Celsius FSANZ standard",()=>{
 const r={yield:5,ingredients:[[500,"g","raw chicken thigh"]],steps:[{title:"Cook chicken",detail:"Roast until safe."}]};
 const x=S.checklist(r);assert.ok(x.find(z=>z.id==="done")?.label.includes("75°C"));
 assert.equal(x.some(z=>z.id==="capacity"),true);
});
