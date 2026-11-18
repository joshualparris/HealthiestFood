/* Ten-lunch shop-to-cook companion. All data is device-local; no image analysis or live stock claims. */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.TenLunch=api;
})(typeof window!=="undefined"?window:null,function(){
"use strict";
const KEY="good-food-ten-lunch-session-v1";
const items=[
 {id:"salmon",name:"Pink salmon, 415 g tins",unit:"tins",need:2,group:"Canned & dry",seen:true,note:"2 × 415 g cans, check actual edible/drained weight"},
 {id:"lentils",name:"Red split lentils",unit:"g",need:300,group:"Canned & dry",seen:true,note:"150 g per batch; check milk cross-contact on pack"},
 {id:"quinoa",name:"Quinoa, dry",unit:"g",need:150,group:"Canned & dry",note:"For the five salmon bowls"},
 {id:"rice",name:"Brown rice, dry",unit:"g",need:200,group:"Canned & dry",seen:true,note:"For the five tofu bowls"},
 {id:"chickpeas",name:"Chickpeas, 400–420 g can",unit:"cans",need:1,group:"Canned & dry",seen:true,note:"Drain and rinse; actual edible weight varies"},
 {id:"passata",name:"Plain tomato passata",unit:"g",need:700,group:"Canned & dry",note:"400 g fish + 300 g tofu. Plain crushed tomatoes also work"},
 {id:"tofu",name:"Firm tofu",unit:"g",need:450,group:"Chilled & frozen",seen:true,note:"Check dairy-free label; calcium depends on firming agent"},
 {id:"broccoli",name:"Broccoli or broccolini",unit:"g",need:700,group:"Chilled & frozen",seen:true,note:"400 g fish + 300 g tofu; fresh or frozen is fine"},
 {id:"spinach",name:"Spinach or bok choy leaves",unit:"g",need:400,group:"Chilled & frozen",seen:true,note:"200 g each; a photographed 280 g bag alone would leave 120 g"},
 {id:"carrot",name:"Carrots",unit:"g",need:450,group:"Fresh produce",seen:true,note:"250 g fish + 200 g tofu"},
 {id:"onion",name:"Brown onions",unit:"g",need:350,group:"Fresh produce",seen:true,note:"150 g fish + 200 g tofu"},
 {id:"pumpkin",name:"Prepared pumpkin",unit:"g",need:400,group:"Fresh produce",note:"Weigh after peeling; sweet potato can substitute"},
 {id:"capsicum",name:"Red capsicum",unit:"g",need:200,group:"Fresh produce",note:"For salmon bowls; other sweet capsicum works"},
 {id:"lemon",name:"Lemons",unit:"whole",need:2,group:"Fresh produce",seen:true,note:"Approximately 30 mL juice into each batch"},
 {id:"garlic",name:"Garlic, peeled",unit:"g",need:20,group:"Fresh produce",note:"10 g each batch; jarred garlic is fine"},
 {id:"oil",name:"Extra virgin olive oil",unit:"mL",need:40,group:"Pantry",seen:true,note:"20 mL per batch"},
 {id:"cumin",name:"Ground cumin",unit:"tsp",need:2,group:"Pantry",seen:true,note:"1 tsp each batch"},
 {id:"paprika",name:"Paprika",unit:"tsp",need:2,group:"Pantry",note:"Fish batch"},
 {id:"curry",name:"Curry powder",unit:"tsp",need:2,group:"Pantry",note:"Tofu batch; check allergen label"},
 {id:"turmeric",name:"Ground turmeric",unit:"tsp",need:1,group:"Pantry",note:"Tofu batch"},
 {id:"pepper",name:"Black pepper",unit:"tsp",need:0.5,group:"Pantry",note:"To taste; approximate amount"}
];
const phases=[
 {id:"setup",name:"0 · Set up your kitchen",detail:"Get ten clean shallow containers and space in the fridge. Wash produce. Check every pack's ingredients, especially milk/cross-contact. If cooling 10 portions won't fit safely, cook five tonight and five later.",steps:[
  ["containers","Lay out 10 freezer-safe containers. Label five A1–A5 and five B1–B5."],
  ["weights","Weigh ingredients before cooking. Recipe A and B below show the split amounts."],
  ["prep","Wash and chop vegetables; keep the raw fish-free and tofu preparations clean."]]},
 {id:"grains",name:"1 · Start grains and lentils",detail:"Parallel cooking saves time. Follow each packet for water ratios, and keep cooked rice out of prolonged room-temperature holding.",steps:[
  ["rice","Cook 200 g dry brown rice in fresh water according to the packet (often 25–40 minutes)."],
  ["quinoa","Rinse and cook 150 g dry quinoa according to the packet (often 12–15 minutes)."],
  ["lentil-a","Rinse 150 g red lentils; simmer 10–15 minutes until tender. Drain excess liquid. Save the remaining 150 g for curry."]]},
 {id:"fish",name:"2 · Make 5 salmon bowls (A1–A5)",detail:"Fresh greens and broccolini can replace the frozen vegetables by weight. This is the full amount for this batch only.",steps:[
  ["fish-veg","In 20 mL olive oil cook 150 g onion + 250 g carrot for 6–10 min; add 200 g capsicum, 10 g garlic, 1 tsp cumin and 2 tsp paprika."],
  ["fish-sauce","Add 400 g passata, 400 g broccoli/broccolini and 200 g spinach/bok choy leaves. Simmer until cooked and sauce thickens."],
  ["fish-combine","Mix in the cooked 150 g quinoa and 150 g lentils. Fold in both salmon tins (drained as appropriate); mash any soft edible bones. Heat through, finish with ~30 mL lemon juice."],
  ["fish-portions","Weigh finished fish batch and divide evenly among A1–A5. Do not assume a fixed cooked weight."]]},
 {id:"tofu",name:"3 · Make 5 tofu bowls (B1–B5)",detail:"Cook the plant-based curry until pumpkin and lentils are tender and the tofu is heated through.",steps:[
  ["tofu-base","In 20 mL olive oil soften 200 g onion + 200 g carrot; add 10 g garlic, 2 tsp curry powder, 1 tsp cumin and 1 tsp turmeric."],
  ["tofu-simmer","Add 400 g prepared pumpkin, 150 g dry rinsed lentils, 300 g passata and 300–500 mL water. Simmer, stirring, ~20–30 minutes until tender."],
  ["tofu-greens","Add 450 g diced firm tofu, 1 drained/rinsed chickpea tin, 300 g broccoli and 200 g greens. Cook ~8–10 minutes until hot throughout; add ~30 mL lemon juice."],
  ["tofu-portions","Portion the cooked 200 g dry-equivalent brown rice evenly into B1–B5. Divide finished curry evenly over rice by weight."]]},
 {id:"cool",name:"4 · Chill, freeze and pack",detail:"Food safety is more important than ticking every box. Refrigerate promptly; do not leave fish/rice/egg/lentil meals on the bench for hours.",steps:[
  ["vent","Divide food into shallow containers as cooking finishes. Vent steam briefly; don't stack hot full containers."],
  ["fridge","Refrigerate promptly and within 2 hours of cooking. Use fridge space so food can cool rapidly; work in smaller batches if necessary."],
  ["freeze","Once thoroughly chilled, close and freeze around −18°C. Label contents and cooking date; freeze the rest if not eating within 2 days."],
  ["reheat","At work, keep meal chilled/frozen in transit and microwave, stirring, until steaming hot throughout."]]}
];
const clamp=(x,max)=>{const n=Number(x);return Number.isFinite(n)?Math.max(0,Math.min(max,n)):0;};
const gap=(item,have)=>Math.max(0,Math.round((item.need-clamp(have,item.need))*100)/100);
const display=(num)=>Number.isInteger(num)?String(num):String(Number(num.toFixed(2)));
function missing(state){return items.map(i=>({item:i,qty:gap(i,state?.have?.[i.id])})).filter(x=>x.qty>0);}
function shoppingText(state){const left=missing(state);return left.length?left.map(x=>"- "+x.item.name+": "+display(x.qty)+" "+x.item.unit).join("\n"):"All quantities confirmed — still check labels, freshness and storage.";}
function completed(state){return phases.reduce((n,p)=>n+p.steps.filter(s=>!!state?.done?.[s[0]]).length,0);}
const totalSteps=phases.reduce((n,p)=>n+p.steps.length,0);
function normalise(s){const obj=s&&typeof s==="object"?s:{};const have={};for(const item of items)have[item.id]=clamp(obj.have?.[item.id],item.need);const done={};for(const p of phases)for(const [id] of p.steps)done[id]=obj.done?.[id]===true;return{have,done,tab:["shop","cook","finish"].includes(obj.tab)?obj.tab:"shop"};}
function load(){try{return normalise(JSON.parse(localStorage.getItem(KEY)||"{}"));}catch{return normalise({});}}
function save(s){try{localStorage.setItem(KEY,JSON.stringify(normalise(s)));return true;}catch{return false;}}
const escapeHTML=(s)=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function init(){
 if(!document.getElementById("shopList"))return; // Library reused by Smart Kitchen without mounting the ten-lunch UI.
 const $=id=>document.getElementById(id);
 let state=load();
 const groups=[...new Set(items.map(i=>i.group))];
 function draw(){
  const left=missing(state),stepCount=completed(state);
  $("counts").textContent=(items.length-left.length)+" / "+items.length+" ingredients fully confirmed · "+stepCount+" / "+totalSteps+" cooking steps completed";
  $("progress").value=stepCount;$("progress").max=totalSteps;
  for(const t of ["shop","cook","finish"]){$("tab-"+t).setAttribute("aria-selected",String(t===state.tab));$("pane-"+t).hidden=t!==state.tab;}
  $("shopList").innerHTML=groups.map(g=>'<h2>'+escapeHTML(g)+'</h2>'+items.filter(i=>i.group===g).map(i=>{
   const have=state.have[i.id]||0,short=gap(i,have);
   return '<div class="ingredient"><div><strong>'+escapeHTML(i.name)+'</strong><p>Need '+display(i.need)+' '+escapeHTML(i.unit)+' · '+escapeHTML(i.note)+'</p>'+(i.seen?'<small class="photo">Possibly seen in your basket photo — confirm quantity</small>':'')+'</div><label>In basket / at home <span class="value"><input type="number" inputmode="decimal" min="0" step="any" max="'+i.need+'" data-item="'+i.id+'" value="'+display(have)+'"> '+escapeHTML(i.unit)+'</span></label><output class="'+(short?"missing":"enough")+'">'+(short?'Still need '+display(short)+' '+escapeHTML(i.unit):'✓ Quantity covered')+'</output></div>';
  }).join("")).join("");
  $("shortList").textContent=left.length?'Still to confirm / buy ('+left.length+'): '+left.map(x=>x.item.name+' '+display(x.qty)+' '+x.item.unit).join("; "):"All target quantities entered. Check allergen labels and freshness.";
  $("steps").innerHTML=phases.map(p=>'<section class="phase"><h2>'+escapeHTML(p.name)+'</h2><p>'+escapeHTML(p.detail)+'</p>'+p.steps.map(([id,task])=>'<label class="step '+(state.done[id]?'is-done':'')+'"><input type="checkbox" data-step="'+id+'" '+(state.done[id]?'checked':'')+'><span>'+escapeHTML(task)+'</span></label>').join("")+'</section>').join("");
  $("doneSummary").textContent=stepCount===totalSteps?'All checkboxes completed. Confirm the meals have actually chilled and frozen safely.':stepCount+' of '+totalSteps+' cooking steps ticked. A checkbox is not proof of food safety.';
  $("printDate").textContent=new Intl.DateTimeFormat("en-AU",{timeZone:"Australia/Sydney",day:"2-digit",month:"short",year:"numeric"}).format(new Date());
  if($("staticCookingSteps"))$("staticCookingSteps").hidden=true;
  if($("legacyHelp"))$("legacyHelp").hidden=true;
 }
 function goto(tab){
  if(!["shop","cook","finish"].includes(tab))return;
  state.tab=tab;save(state);draw();
  // When nested in the main app, the OUTER page owns the scrollbar.
  // Scrolling only this iframe leaves the user looking at the old page position.
  try{
   if(window.parent!==window&&window.frameElement&&window.parent.location.origin===window.location.origin){
    const frameBox=window.frameElement.getBoundingClientRect();
    window.parent.scrollTo(0,Math.max(0,window.parent.pageYOffset+frameBox.top-90));
   }else window.scrollTo(0,0);
  }catch(err){window.scrollTo(0,0);}
 }
 document.addEventListener("click",e=>{
  const tab=e.target.closest("[data-tab]");if(tab){goto(tab.dataset.tab);return;}
  if(e.target.id==="copyMissing"){
   const value=shoppingText(state),btn=e.target;
   const fallback=()=>{const el=document.createElement("textarea");el.value=value;document.body.append(el);el.select();const ok=document.execCommand&&document.execCommand("copy");el.remove();btn.textContent=ok?"Copied missing items":"Copy unavailable — select list above";};
   if(navigator.clipboard?.writeText)navigator.clipboard.writeText(value).then(()=>btn.textContent="Copied missing items").catch(fallback);else fallback();
  }
  if(e.target.id==="resetSession"&&confirm("Clear this 10-lunch shopping and cooking progress on this device?")){state=normalise({});save(state);draw();}
  if(e.target.id==="printLabels")window.print();
 });
 document.addEventListener("input",e=>{
  if(!e.target.matches("[data-item]"))return;
  const i=items.find(x=>x.id===e.target.dataset.item);if(!i)return;
  state.have[i.id]=clamp(e.target.value,i.need);
  save(state);
  const short=gap(i,state.have[i.id]),out=e.target.closest(".ingredient")?.querySelector("output");
  if(out){out.className=short?"missing":"enough";out.textContent=short?"Still need "+display(short)+" "+i.unit:"✓ Quantity covered";}
  const left=missing(state);
  $("shortList").textContent=left.length?"Still to confirm / buy ("+left.length+"): "+left.map(x=>x.item.name+" "+display(x.qty)+" "+x.item.unit).join("; "):"All target quantities entered. Check allergen labels and freshness.";
  $("counts").textContent=(items.length-left.length)+" / "+items.length+" ingredients fully confirmed · "+completed(state)+" / "+totalSteps+" cooking steps completed";
 });
 document.addEventListener("change",e=>{
  if(e.target.matches("[data-item]")){const i=items.find(x=>x.id===e.target.dataset.item);if(!i)return;state.have[i.id]=clamp(e.target.value,i.need);e.target.value=display(state.have[i.id]);save(state);/* Do not replace focused inputs on blur: would detach the next field. */}
  if(e.target.matches("[data-step]")){state.done[e.target.dataset.step]=e.target.checked;save(state);draw();}
 });
 draw();
}
if(typeof document!=="undefined"){if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();}
return {items,phases,clamp,gap,missing,shoppingText,completed,totalSteps,normalise,escapeHTML};
});
