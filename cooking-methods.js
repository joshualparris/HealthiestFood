/* All active recipe + V6 basket ingredient names are resolved at runtime against the
 * scientific food-family atlas. No rankings / guessed nutrient retention percentages. */
(function(root,factory){
 const api=factory(root);
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.CookingMethodsLab=api;
})(typeof window!=="undefined"?window:null,function(w){
"use strict";
const db=w?.CookingMethodsData,food=w?.FOOD_DATA;
const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const uniq=a=>[...new Set(a)];
const getNames=()=>food?uniq([...food.recipes.flatMap(r=>r.ingredients.map(i=>i[2])),...food.shopping.map(x=>x.name)]):[];
const relatedRecipe=(id)=>food?.recipes.find(r=>r.id===id)||null;
const state={query:"",category:"All",recipe:"All",selected:"egg",methodA:0,methodB:1};
function mapData(names=getNames()){return names.map(label=>({label,group:db?.match(label)?.id||null}));}
function summary(){
 const map=mapData(),unmapped=map.filter(m=>!m.group).map(x=>x.label);
 return {labels:map.length,mapped:map.length-unmapped.length,unmapped,families:db?.entries.length||0,recipes:food?.recipes.length||0,retailProducts:food?.shopping.length||0};
}
function familyUsage(g){
 const recipes=food?.recipes.filter(r=>r.ingredients.some(i=>db.match(i[2])?.id===g.id))||[];
 const products=food?.shopping.filter(i=>db.match(i.name)?.id===g.id)||[];
 const labels=getNames().filter(n=>db.match(n)?.id===g.id);
 return {recipes,products,labels};
}
function collection(){
 if(!db)return[];
 const q=state.query.trim().toLowerCase();
 return db.entries.filter(g=>(state.category==="All"||g.group===state.category)&&(state.recipe==="All"||familyUsage(g).recipes.some(r=>r.id===state.recipe))&&(!q||[g.name,g.group,g.why,g.important,...familyUsage(g).labels].join(" ").toLowerCase().includes(q)));
}
function sourceLinks(g){return g.refs.map((key,i)=>db.evidence[key]?'<a href="'+esc(db.evidence[key])+'" target="_blank" rel="noopener noreferrer">'+esc(keyLabel[key]||key)+" ↗</a>":'').filter(Boolean).join("");}
const keyLabel={veg:"Vegetable vitamin-retention study",broc:"Broccoli-specific cooking study",brocCounter:"Contrasting broccoli sulforaphane result",tomato:"Human tomato–olive oil trial",lycopene:"Lycopene research review",egg:"NSW egg-safety advice",vulnerable:"FSANZ advice for vulnerable people",chicken:"FSANZ poultry food safety",temps:"NSW cooking temperatures",fish:"Fish omega-3 cooking study",fishWet:"Fish steaming versus foil study",rice:"US FDA rice arsenic advice",arsenic:"Measured rice arsenic versus nutrients",beans:"US FDA kidney-bean lectin safety",legume:"Legume processing research review",fats:"Heart Foundation cooking fats",cooking:"Heart Foundation healthy cooking methods",acry:"FSANZ acrylamide reduction",leftovers:"NSW safe leftovers",foodSafety:"FSANZ food-safety basics",carrot:"Human carotene absorption study",enoki:"FSANZ enoki safety guidance",afcd:"Australian food composition database"};
function panel(method,letter){
 if(!method)return'<p>Select a method.</p>';
 return '<div class="cm-compare-card"><div class="cm-mini-label">METHOD '+letter+'</div><h4>'+esc(method.name)+'</h4><strong>Potential advantages</strong><p>'+esc(method.advantage)+'</p><strong>Trade-offs</strong><p>'+esc(method.tradeoff)+'</p><strong>How to do it</strong><p>'+esc(method.tip)+'</p></div>';
}
function detail(g){
 if(!g)return'<div class="cm-empty">Choose a food to compare cooking methods.</div>';
 const used=familyUsage(g),n=g.options.length;
 state.methodA=Math.min(Math.max(state.methodA,0),n-1);state.methodB=Math.min(Math.max(state.methodB,0),n-1);
 const chooses=letter=>'<label for="cmMethod'+letter+'">Method '+letter+'<select id="cmMethod'+letter+'" data-cm-method="'+letter+'">'+g.options.map((x,i)=>'<option value="'+i+'"'+(i===state['method'+letter]?' selected':'')+'>'+esc(x.name)+'</option>').join("")+'</select></label>';
 const tbl=g.options.map((m,i)=>'<tr><th scope="row">'+esc(m.name)+(i===0?'<span class="cm-default-tag">First practical option</span>':'')+'</th><td>'+esc(m.advantage)+'</td><td>'+esc(m.tradeoff)+'</td><td>'+esc(m.tip)+'</td></tr>').join("");
 return '<div class="cm-detail-head"><span class="section-kicker">'+esc(g.group)+' · '+n+' realistic methods</span><h2>'+esc(g.name)+'</h2><h3>Practical starting choice: '+esc(g.recommended)+'</h3><p>'+esc(g.why)+'</p><div class="cm-certainty"><strong>Evidence limits:</strong> '+esc(g.certainty)+'</div></div>'+
 '<div class="cm-warning" role="note"><strong>Safety and context</strong><p>'+esc(g.important)+'</p></div>'+
 '<div class="cm-compare-head"><h3>Compare two methods</h3><p>These are food-specific trade-offs, not invented 0–100 longevity scores.</p></div>'+
 '<div class="cm-compare-controls">'+chooses("A")+chooses("B")+'</div><div class="cm-compare-results">'+panel(g.options[state.methodA],"A")+panel(g.options[state.methodB],"B")+'</div>'+
 '<details class="cm-table-details"><summary>Show all '+n+' methods side by side</summary><div class="cm-table-scroll"><table><thead><tr><th scope="col">Method</th><th scope="col">Why use it</th><th scope="col">What you trade off</th><th scope="col">Practical guidance</th></tr></thead><tbody>'+tbl+'</tbody></table></div></details>'+
 '<section class="cm-where"><h3>Where this food appears in HealthiestFood</h3><p>'+used.labels.length+' exact active ingredient/retail labels matched.</p><details><summary>Show the exact names from recipes and shopping</summary><ul>'+used.labels.map(l=>'<li>'+esc(l)+'</li>').join("")+'</ul></details><div class="cm-recipe-pills">'+used.recipes.map(r=>'<a href="index.html#recipes">'+esc(r.name)+' ↗</a>').join("")+'</div></section>'+
 '<section class="cm-sources"><h3>Verify the evidence</h3><p>Original clinical, composition or food-safety sources. Studies vary by food, time, cut size, water and whether nutrients are measured in raw or cooked weight. No source here proves a longer human lifespan from choosing one method.</p><div>'+sourceLinks(g)+'</div></section>';
}
function render(){
 const d=document.getElementById("cmRoot");if(!d||!db)return;
 const list=collection(),g=db.entries.find(x=>x.id===state.selected)||list[0];
 if(!list.some(x=>x.id===state.selected)){state.selected=list[0]?.id||"";state.methodA=0;state.methodB=1;}
 const current=db.entries.find(x=>x.id===state.selected)||null;
 const cards=list.map(x=>'<button type="button" class="cm-food-item" data-cm-food="'+esc(x.id)+'" aria-pressed="'+String(x.id===state.selected)+'"><span>'+esc(x.group)+'</span><strong>'+esc(x.name)+'</strong><small>'+x.options.length+' methods · '+familyUsage(x).recipes.length+' recipes</small></button>').join("");
 d.querySelector("#cmCount").textContent=list.length+' food families';
 d.querySelector("#cmChoices").innerHTML=cards||'<div class="cm-empty">No foods match these filters. Try another search.</div>';
 d.querySelector("#cmDetail").innerHTML=current?detail(current):'<div class="cm-empty">No selected food. Clear the filters.</div>';
 const notice=d.querySelector("#cmCoverage");const result=summary();
 notice.textContent=result.mapped+'/'+result.labels+' exact active recipe/shopping labels covered by '+result.families+' families. '+(result.unmapped.length?'Review required: '+result.unmapped.join("; "):'All currently listed active labels mapped.');
}
function init(){
 const d=document.getElementById("cmRoot");if(!d||!db||!food||d.dataset.init)return;
 d.dataset.init="true";
 const params=new URLSearchParams(location.search),start=params.get("food"),recipe=params.get("recipe");
 if(start&&db.entries.some(x=>x.id===start))state.selected=start;
 if(recipe&&relatedRecipe(recipe)){state.recipe=recipe;const first=db.entries.find(g=>familyUsage(g).recipes.some(r=>r.id===recipe));if(first)state.selected=first.id;}
 const categories=uniq(db.entries.map(g=>g.group)).sort();
 d.innerHTML='<div class="cm-toolbar"><label for="cmSearch">Search foods and ingredient names<input id="cmSearch" type="search" placeholder="e.g. egg, salmon, broccoli, raw, tofu" autocomplete="off"></label><label for="cmCategory">Food group<select id="cmCategory"><option value="All">Every food group</option>'+categories.map(v=>'<option>'+esc(v)+'</option>').join("")+'</select></label><label for="cmRecipe">Used in recipe<select id="cmRecipe"><option value="All">All 17 recipes</option>'+food.recipes.map(r=>'<option value="'+esc(r.id)+'"'+(r.id===state.recipe?' selected':'')+'>'+esc(r.name)+'</option>').join("")+'</select></label></div>'+
 '<p id="cmCoverage" class="cm-coverage" role="status"></p><div class="cm-workspace"><div class="cm-side"><h2>Choose a food <small id="cmCount"></small></h2><div id="cmChoices" class="cm-choices"></div></div><div id="cmDetail" class="cm-detail"></div></div>';
 d.addEventListener("input",e=>{if(e.target.id==="cmSearch"){state.query=e.target.value;render();}});
 d.addEventListener("change",e=>{
  if(e.target.id==="cmCategory"){state.category=e.target.value;render();}
  if(e.target.id==="cmRecipe"){state.recipe=e.target.value;render();}
  if(e.target.matches("[data-cm-method]")){state["method"+e.target.dataset.cmMethod]=Number(e.target.value);render();}
 });
 d.addEventListener("click",e=>{const b=e.target.closest("[data-cm-food]");if(!b)return;state.selected=b.dataset.cmFood;state.methodA=0;state.methodB=1;render();if(innerWidth<=850)d.querySelector("#cmDetail").scrollIntoView({behavior:"smooth",block:"start"});});
 render();
}
return {init,render,summary,mapData,collection,familyUsage,state,detail};
});
