/* Smart Kitchen integration: user-confirmed actions only; browser-local unless explicitly requested. */
(function(){
"use strict";
if(typeof window==="undefined"||typeof document==="undefined")return;
const $=id=>document.getElementById(id);
function init(){
 const C=window.FoodSmartCore,P=window.FoodPantryLots,Shop=window.FoodShopping,D=window.FOOD_DATA,
       Lunch=window.TenLunch,T=window.FoodTimers,B=window.FoodDataBackup;
 if(!C||!P||!Shop||!D||!Lunch||!T){$("photoStatus").textContent="A required script failed to load; refresh online.";return;}
 const esc=C.escape;
 const keys={presets:"good-food-menu-presets-v1",imports:"good-food-imported-recipes-v1",freezer:"good-food-freezer-inventory-v1",step:"good-food-smart-step-v1",timer:"good-food-smart-timers-v1",aisle:"good-food-smart-aisle-v1"};
 const read=(k,fallback)=>{try{const val=JSON.parse(localStorage.getItem(k));return val??fallback}catch{return fallback}};
 const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
 const say=(id,txt)=>{const el=$(id);if(el)el.textContent=txt;};
 const saveFile=(text,name,type="text/plain")=>{
  const url=URL.createObjectURL(new Blob([text],{type}));
  const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 const locDate=()=>C.dateISO();
 let detected=[],barcode="",barcodeResult=null,pendingRecipe=null,menu=[],timerState=T.clean(read(keys.timer,{}));
 let stepSeq=Lunch.phases.flatMap(p=>p.steps.map(([id,text])=>({id,phase:p.name,text}))),
     stepIndex=Math.max(0,Math.min(stepSeq.length-1,Number(read(keys.step,0))||0)),
     activeVoice=null,activeStream=null,scanActive=false,wakeLock=null;
 const mapping=Shop.mappings||[];
 function placeProductChoices(){
  $("recognisedLotKey").innerHTML=mapping.map(m=>'<option value="'+esc(m.key)+'">'+esc(m.buy)+" ("+esc(m.unit||"each")+')</option>").join("");
  setLotUnit();
 }
 function setLotUnit(){
  const item=mapping.find(x=>x.key===$("recognisedLotKey").value);
  const label=item?item.buy+" uses "+(item.unit||"each")+" in the pantry model. Enter your ACTUAL quantity; a tin count is not automatically grams.":"Select a product type.";
  say("lotStatus",label);
 }
 placeProductChoices();
 $("recognisedLotKey").addEventListener("change",setLotUnit);
 function renderDetected(){
  $("detectedProducts").innerHTML=detected.length?detected.map((x,i)=>'<div class="entry"><strong>'+esc(x.id.replaceAll("-"," "))+'</strong><small>Line '+x.lineNumber+' · '+esc(x.line)+'</small><small>Keyword match only. Quantities / brands unverified.</small><button type="button" data-suggest-index="'+i+'">Use category for pantry entry</button></div>').join(""):"No recognised ingredients. Edit the text and try again.";
 }
 $("detectProducts").addEventListener("click",()=>{
  detected=C.parseReceipt($("groceryText").value);renderDetected();
 });
 $("detectedProducts").addEventListener("click",e=>{
  const b=e.target.closest("[data-suggest-index]");if(!b)return;
  const s=detected[Number(b.dataset.suggestIndex)];if(!s)return;
  const direct=mapping.find(m=>m.key===s.id);
  if(direct)$("recognisedLotKey").value=direct.key;
  else{
   const approx=mapping.find(m=>m.test?.test(s.line));if(approx)$("recognisedLotKey").value=approx.key;
  }
  setLotUnit();$("recognisedLotQuantity").focus();
  say("lotStatus","Suggested category selected. Enter the exact owned "+(mapping.find(x=>x.key===$("recognisedLotKey").value)?.unit||"unit")+" amount and inspect the package before saving.");
 });
 $("copyDetected").addEventListener("click",async()=>{
  const s=detected.map(x=>x.id+": "+x.line).join("\n")||"No product candidates";
  try{await navigator.clipboard.writeText(s);say("photoStatus","Copied the unverified text matches.");}catch{say("photoStatus","Clipboard unavailable. Select the suggestions above instead.");}
 });
 async function loadOCR(){
  if(window.Tesseract)return window.Tesseract;
  if(!navigator.onLine)throw Error("An online connection is required to load the OCR engine.");
  await new Promise((resolve,reject)=>{
   const script=document.createElement("script");
   script.src="https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
   script.onload=resolve;script.onerror=()=>reject(Error("Could not load OCR engine."));
   document.head.append(script);
  });
  if(!window.Tesseract)throw Error("OCR engine unavailable.");return window.Tesseract;
 }
 $("recognisePhoto").addEventListener("click",async()=>{
  const file=$("groceryPhoto").files?.[0];if(!file){say("photoStatus","Select a photo first.");return;}
  if(file.size>15*1024*1024||!/^image\/(?:jpeg|png|webp)$/.test(file.type)){say("photoStatus","Choose a JPG, PNG or WebP image under 15 MB.");return;}
  $("recognisePhoto").disabled=true;say("photoStatus","Reading text locally. Loading the recognition engine…");
  let worker;
  try{
   const ocr=await loadOCR();
   worker=await ocr.createWorker("eng");
   const out=await worker.recognize(file);
   const text=String(out?.data?.text||"").slice(0,18000);
   $("groceryText").value=text;
   detected=C.parseReceipt(text);renderDetected();
   say("photoStatus","Text recognition completed. "+detected.length+" possible ingredients found; verify and correct everything before adding stock.");
  }catch(e){say("photoStatus","OCR couldn't complete: "+(e.message||"unknown error")+". You can paste text manually.");}
  finally{if(worker)try{await worker.terminate()}catch{};$("recognisePhoto").disabled=false;}
 });
 function stopCamera(){
  scanActive=false;
  if(activeStream){activeStream.getTracks().forEach(t=>t.stop());activeStream=null;}
  $("barcodeVideo").srcObject=null;$("barcodeVideo").hidden=true;
 }
 $("stopBarcode").addEventListener("click",()=>{stopCamera();say("barcodeInfo","Camera stopped.");});
 $("startBarcode").addEventListener("click",async()=>{
  if(typeof BarcodeDetector==="undefined"||!navigator.mediaDevices?.getUserMedia){
   say("barcodeInfo","Camera barcode scanning isn't supported here. Type the printed barcode instead.");return;
  }
  try{
   stopCamera();
   const detector=new BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e","itf","code_128"]});
   activeStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"},audio:false});
   $("barcodeVideo").srcObject=activeStream;$("barcodeVideo").hidden=false;await $("barcodeVideo").play();
   scanActive=true;say("barcodeInfo","Point the camera at a barcode. Detection never adds stock by itself.");
   const scan=async()=>{
    if(!scanActive)return;
    try{const codes=await detector.detect($("barcodeVideo"));
     const code=String(codes[0]?.rawValue||"").replace(/\D/g,"");
     if(/^\d{8,14}$/.test(code)){$("barcode").value=code;barcode=code;stopCamera();say("barcodeInfo","Detected barcode "+code+". Choose lookup or confirm manually.");return;}
    }catch(e){stopCamera();say("barcodeInfo","Scan failed: "+(e.message||"camera unavailable"));return;}
    if(scanActive)setTimeout(scan,280);
   };scan();
  }catch(e){stopCamera();say("barcodeInfo","Camera unavailable or permission denied: "+(e.message||"unsupported"));}
 });
 $("lookupBarcode").addEventListener("click",async()=>{
  const code=$("barcode").value.replace(/\D/g,"");
  if(!/^\d{8,14}$/.test(code)){say("barcodeInfo","Enter a valid 8–14 digit barcode.");return;}
  barcode=code;
  const local=P.load(localStorage).find(x=>x.barcode===code);
  say("barcodeInfo",local?"Your saved pack: "+local.name+". Checking Open Food Facts…":"Looking up Open Food Facts with your permission…");
  const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),9000);
  try{
   const res=await fetch("https://world.openfoodfacts.org/api/v2/product/"+encodeURIComponent(code)+".json?fields=product_name,brands,quantity,ingredients_text,allergens_tags", {signal:ctl.signal});
   if(!res.ok)throw Error("HTTP "+res.status);
   const data=await res.json(),p=data?.product;
   if(data.status!==1||!p){barcodeResult=null;say("barcodeInfo","No community product record found for "+code+". Check the actual pack manually.");return;}
   barcodeResult={code,name:String(p.product_name||"Unknown").slice(0,120),brands:String(p.brands||"").slice(0,90),quantity:String(p.quantity||"").slice(0,80),ingredients:String(p.ingredients_text||"").slice(0,700),allergens:Array.isArray(p.allergens_tags)?p.allergens_tags.slice(0,12):[]};
   say("barcodeInfo",barcodeResult.name+" ("+barcodeResult.brands+") · "+barcodeResult.quantity+"\nIngredients (community data): "+(barcodeResult.ingredients||"Unknown")+"\nAllergen tags: "+(barcodeResult.allergens.join(", ")||"Not provided")+"\nCompare with your physical pack; an absent allergen tag is NOT a dairy-free guarantee.");
   const candidate=C.parseReceipt(barcodeResult.name);const wanted=candidate[0]?.id;
   if(wanted&&mapping.some(m=>m.key===wanted)){$("recognisedLotKey").value=wanted;setLotUnit();}
  }catch(e){say("barcodeInfo","Product lookup unavailable: "+(e.message||"network error")+". You can still record a physically checked pack.");}
  finally{clearTimeout(timer);}
 });
 $("saveRecognisedLot").addEventListener("click",()=>{
  const key=$("recognisedLotKey").value,m=mapping.find(x=>x.key===key),n=Number($("recognisedLotQuantity").value);
  if(!m||!Number.isFinite(n)||n<=0||n>100000){say("lotStatus","Choose a product and enter a valid real amount in its displayed unit.");return;}
  if(!confirm("I checked the actual product and measured "+n+" "+m.unit+" of "+m.buy+". Add a pack record?"))return;
  const rows=P.load(localStorage),next=P.add(rows,{key,name:barcodeResult?.name||m.buy,unit:m.unit||"each",amount:n,
   condition:"unopened",location:$("recognisedLotStorage").value,useBy:$("recognisedLotDate").value,bestBefore:"",barcode:barcode||$("barcode").value});
  if(!next||!P.save(localStorage,next)){say("lotStatus","Could not save stock. Check date/quantity or browser storage.");return;}
  say("lotStatus","Confirmed pack saved to your existing dated pantry.");renderPantry();
 });
 function renderPantry(){
  const lots=P.load(localStorage),soon=C.expiring(lots).filter(x=>x.priority!=="OTHER").slice(0,12);
  $("expiringPacks").innerHTML=soon.length?soon.map(x=>'<div class="entry"><strong>'+esc(x.name)+'</strong><small>'+esc(x.label)+' '+esc(x.due)+' · '+x.amount+' '+esc(x.unit)+' · '+esc(x.location)+'</small><small>'+esc(x.priority==="DO_NOT_USE"?"Do not eat past a use-by date.":x.priority==="CHECK_SOON"?"Check storage history and label before using.":"")+'</small></div>').join(""):"No dated packs due in the next week. Your recorded inventory may be incomplete.";
  const inv=Object.fromEntries(Object.entries(P.totals(lots)).map(([k,x])=>[k,x.amount]));
  const ideas=C.mealSuggestions(D.recipes,Shop,inv,8);
  $("mealSuggestions").innerHTML=ideas.map(x=>'<div class="entry"><strong>'+esc(x.name)+'</strong><small>'+x.missing+' ingredient lines not covered by recorded stock · '+x.unpriced+' unpriced · known mapped-pack subtotal ~$'+x.knownPrice.toFixed(2)+'</small></div>').join("")||"No recipes available";
 }
 $("refreshPantry").addEventListener("click",renderPantry);renderPantry();
 $("swapOriginal").innerHTML=Object.keys(C.SWAPS).map(x=>'<option value="'+esc(x)+'">'+esc(x)+'</option>').join("");
 function renderSwaps(){
  const choices=C.SWAPS[$("swapOriginal").value]||[];
  $("swapAlternative").innerHTML=choices.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.name)+'</option>').join("");
 }
 $("swapOriginal").addEventListener("change",renderSwaps);renderSwaps();
 $("calculateSwap").addEventListener("click",()=>{
  const r=C.swap($("swapOriginal").value,$("swapAlternative").value,Number($("swapGrams").value));
  say("swapResult",r?"Use "+r.amount+" g "+r.name+" instead of "+r.amount+" g "+r.original+" ("+r.basis+"). "+r.caveat:"Choose a valid ingredient and amount.");
 });
 $("planStart").value=locDate();$("freezerDate").value=locDate();
 const savedAisle=read(keys.aisle,"original");
 if(["original","produce-first","frozen-first"].includes(savedAisle))$("aisleLayout").value=savedAisle;
 $("aisleLayout").addEventListener("change",()=>write(keys.aisle,$("aisleLayout").value));
 const category=n=>/\b(?:carrots?|onions?|lemon|capsicum|pumpkin|garlic|tomato|spinach|zucchini|apple|orange)\b/i.test(n)?"Produce":/\b(?:tofu|frozen|broccoli|kale|peas)\b/i.test(n)?"Chilled/frozen":"Pantry/cans";
 function renderMenu(){
  if(!menu.length){say("menuPreview","No plan generated yet.");return;}
  $("menuPreview").innerHTML=menu.map(d=>'<div class="entry"><strong>'+esc(d.date)+'</strong>'+d.slots.map(s=>{
    const r=D.recipes.find(r=>r.id===s.recipeId);return '<small>'+esc(s.time)+" · "+esc(s.type)+": "+esc(r?.name||s.recipeId)+'</small>';}).join("")+'</div>').join("");
  $("saveToCalendar").disabled=false;$("downloadIcs").disabled=false;
  const pantry=read("good-food-planned-have-v1",{}),cost=C.estimatePlan(menu,D.recipes,Shop,pantry);
  if(!cost)return;
  const requested=Number($("planBudget").value),estimate="Known mapped-pack estimate: $"+cost.known.toFixed(2)+", "+cost.unknown+" unmatched items with unknown prices.";
  say("budgetStatus",estimate+" "+(cost.unknown?"Cannot confirm budget from incomplete price data.":cost.known>requested?"Estimate exceeds your target by $"+(cost.known-requested).toFixed(2)+".":"Estimated matched items are within target, but this is not live checkout pricing."));
  const ordering=$("aisleLayout").value,weight=(v)=>ordering==="produce-first"?{"Produce":0,"Pantry/cans":1,"Chilled/frozen":2}[v]:ordering==="frozen-first"?{"Chilled/frozen":0,"Produce":1,"Pantry/cans":2}[v]:{"Pantry/cans":0,"Chilled/frozen":1,"Produce":2}[v];
  const needed=cost.rows.filter(x=>x.toBuy>0).sort((a,b)=>weight(category(a.name))-weight(category(b.name))||a.name.localeCompare(b.name));
  $("menuPreview").insertAdjacentHTML("beforeend",'<h3>Combined shopping check (not a live cart)</h3><p class="muted">'+needed.map(x=>esc(x.name)+" · "+x.toBuy.toFixed(1)+" "+esc(x.unit)).join("<br>")+"</p>");
 }
 $("suggestMenu").addEventListener("click",()=>{
  const start=$("planStart").value;if(!/^\d{4}-\d{2}-\d{2}$/.test(start)){say("budgetStatus","Choose a start date.");return;}
  menu=C.createMenu(D.recipes,7,start);renderMenu();
 });
 function planSave(){
  if(!menu.length)return;
  let current=read("good-food-dated-schedule-v1",{});
  if(!current||typeof current!=="object"||Array.isArray(current))current={};
  const overwritten=menu.filter(x=>Object.hasOwn(current,x.date)).map(x=>x.date);
  const note=overwritten.length?"This will REPLACE existing meals for "+overwritten.length+" planned dates.":"This will create seven new planned dates.";
  if(!confirm(note+" Continue?"))return;
  const next={...current};for(const d of menu)next[d.date]=d.slots;
  say("presetStatus",write("good-food-dated-schedule-v1",next)?"Seven days saved to the existing meal planner on this device. Reload that view to see them.":"Could not save meal plan.");
 }
 $("saveToCalendar").addEventListener("click",planSave);
 $("downloadIcs").addEventListener("click",()=>{if(menu.length)saveFile(C.exportCalendar(menu,D.recipes),"healthiestfood-meals.ics","text/calendar;charset=utf-8");});
 function presets(){return read(keys.presets,[]).filter(x=>C.normalizePreset(x,new Set(D.recipes.map(r=>r.id)))).slice(0,20);}
 function renderPresets(){
  $("presetPicker").innerHTML='<option value="">Choose saved menu</option>'+presets().map((x,i)=>'<option value="'+i+'">'+esc(x.name)+'</option>').join("");
 }
 renderPresets();
 $("savePreset").addEventListener("click",()=>{
  const name=C.clean($("presetName").value);if(!name||!menu.length){say("presetStatus","Generate a menu and give it a name first.");return;}
  let p=presets();
  p=p.filter(x=>x.name!==name);
  p.unshift({name,recipes:menu.map(d=>d.slots.map(s=>({id:s.recipeId,portions:s.portions}))).flat(),createdAt:new Date().toISOString()});
  p=p.slice(0,20);
  const valid=p.map(x=>C.normalizePreset(x,new Set(D.recipes.map(r=>r.id)))).filter(Boolean);
  say("presetStatus",write(keys.presets,valid)?"Saved locally.":"Could not save preset.");renderPresets();
 });
 $("loadPreset").addEventListener("click",()=>{
  const p=presets()[Number($("presetPicker").value)];
  if(!p){say("presetStatus","Choose a stored menu.");return;}
  const start=$("planStart").value||locDate();
  const slots=p.recipes.slice(0,21);
  menu=Array.from({length:7},(_,i)=>({date:C.addDays(start,i),slots:slots.slice(i*3,(i+1)*3).map((s,j)=>{
   const rec=D.recipes.find(r=>r.id===s.id);
   return{id:(rec?.category||"lunch")+"-"+j,type:rec?.category||"lunch",time:["07:30","12:30","18:00"][j],recipeId:s.id,portions:s.portions,done:false};
  })})).filter(x=>x.slots.length);
  renderMenu();say("presetStatus","Loaded stored combination. Review the days before saving it.");
 });
 $("applyShopping").addEventListener("click",()=>{
  if(!menu.length){say("presetStatus","Generate a menu first.");return;}
  const portions={};
  for(const d of menu)for(const s of d.slots)portions[s.recipeId]=Math.min(20,(portions[s.recipeId]||0)+s.portions);
  if(!confirm("Replace your existing custom recipe selections with this week's quantities? Existing pantry amounts won't be deleted."))return;
  say("presetStatus",write("good-food-custom-shop-v1",{portions,checked:{}})?"Sent selections to the original shopping planner. Open Shopping List to review them.":"Storage unavailable; no changes saved.");
 });
 $("aisleLayout").addEventListener("change",renderMenu);
 // Imports: a third-party URL may be blocked by CORS. No server-side scraping is implied.
 function previewImport(x){
  pendingRecipe=x;$("saveImportedRecipe").disabled=!x;
  if(!x){say("recipePreview","No structured ingredients found. Paste the ingredient lines and retry.");return;}
  $("recipePreview").innerHTML='<label>Title <input id="importTitle" maxlength="150" value="'+esc(x.title)+'"></label>'+
   '<label>Ingredients, one per line <textarea id="importIngredients" rows="6">'+esc(x.ingredients.join("\n"))+'</textarea></label>'+
   '<label>Cooking steps, one per line <textarea id="importSteps" rows="5">'+esc(x.steps.join("\n"))+'</textarea></label>'+
   '<p class="warning">'+esc(x.warning)+'</p>';
 }
 $("extractRecipe").addEventListener("click",()=>{
  previewImport(C.extractRecipe($("recipePaste").value,$("recipeSource").value));
 });
 $("tryRecipeUrl").addEventListener("click",async()=>{
  const url=$("recipeSource").value.trim();let parsed;try{parsed=new URL(url)}catch{say("recipePreview","Enter a public HTTPS recipe URL.");return;}
  if(parsed.protocol!=="https:"){say("recipePreview","For safety only HTTPS pages are supported.");return;}
  say("recipePreview","Trying a direct read; some publishers block browser fetches.");
  const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),8000);
  try{const res=await fetch(parsed.href,{signal:ctl.signal,redirect:"follow"});
   if(!res.ok)throw Error("HTTP "+res.status);
   const type=res.headers.get("content-type")||"";if(!/html|json|text/i.test(type))throw Error("Not a text recipe page");
   const raw=(await res.text()).slice(0,240000);
   $("recipePaste").value=raw;previewImport(C.extractRecipe(raw,url));
  }catch(e){say("recipePreview","Direct import blocked or unavailable ("+(e.message||"CORS") +"). Copy the page recipe text or JSON-LD into the box instead.");}
  finally{clearTimeout(timer);}
 });
 function imported(){const v=read(keys.imports,[]);return Array.isArray(v)?v.slice(0,50):[];}
 function renderImports(){
  $("importedRecipes").innerHTML=imported().length?imported().map((r,i)=>'<div class="entry"><strong>'+esc(r.title)+'</strong><small>'+r.ingredients.length+' ingredients · '+r.steps.length+' steps · saved only here</small><button data-cook-import="'+i+'">Cook this recipe</button></div>').join(""):"No imported recipes yet.";
 }
 renderImports();
 $("saveImportedRecipe").addEventListener("click",()=>{
  if(!pendingRecipe)return;
  const title=C.clean($("importTitle")?.value).slice(0,150),ingredients=($("importIngredients")?.value||"").split(/\r?\n/).map(C.clean).filter(Boolean).slice(0,100),steps=($("importSteps")?.value||"").split(/\r?\n/).map(C.clean).filter(Boolean).slice(0,100);
  if(!title||!ingredients.length){say("recipePreview","Enter a title and at least one ingredient.");return;}
  const item={title,ingredients,steps,source:pendingRecipe.source||"",savedAt:new Date().toISOString()};
  const list=imported().filter(r=>r.title!==title);list.unshift(item);
  if(write(keys.imports,list.slice(0,50))){renderImports();say("recipePreview","Saved '"+title+"' to your local imported recipe collection. Validate allergens and full instructions before cooking.");}
  else say("recipePreview","Storage unavailable. Nothing saved.");
 });
 $("importedRecipes").addEventListener("click",e=>{
  const b=e.target.closest("[data-cook-import]");if(!b)return;
  const recipe=imported()[Number(b.dataset.cookImport)];if(!recipe?.steps?.length){say("voiceStatus","No cooking instructions in this import.");return;}
  stepSeq=recipe.steps.map((text,i)=>({id:"import-"+i,phase:recipe.title,text}));
  stepIndex=0;renderStep();$("cooking").scrollIntoView({behavior:"smooth"});
  say("voiceStatus","Using imported cooking steps. Check the original method and food safety carefully.");
 });
 function renderStep(){
  const x=stepSeq[stepIndex];
  say("stepPosition","Step "+(stepIndex+1)+" of "+stepSeq.length+" · "+x.phase);
  say("currentCookStep",x.text);
  $("previousStep").disabled=stepIndex===0;$("nextStep").disabled=stepIndex===stepSeq.length-1;
  if(x.id.startsWith("import-"))return;
  write(keys.step,stepIndex);
 }
 function nextStep(delta){stepIndex=Math.max(0,Math.min(stepSeq.length-1,stepIndex+delta));renderStep();}
 $("previousStep").addEventListener("click",()=>nextStep(-1));
 $("nextStep").addEventListener("click",()=>nextStep(1));
 function readAloud(){
  if(!("speechSynthesis" in window)){say("voiceStatus","Speech output unsupported in this browser.");return;}
  speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(stepSeq[stepIndex].text);u.lang="en-AU";speechSynthesis.speak(u);
 }
 $("readStep").addEventListener("click",readAloud);renderStep();
 function clock(){
  const advanced=T.advance(timerState,Date.now());timerState=advanced.timers;
  if(advanced.expired.length){
   write(keys.timer,timerState);
   say("voiceStatus",advanced.expired.length+" timer(s) finished. Confirm cooking by observation, not just elapsed time.");
  }
  const entries=Object.values(timerState);
  $("smartTimers").innerHTML=entries.length?entries.map(x=>'<div class="entry"><strong>'+esc(x.title)+'</strong><span>'+T.format(T.remaining(x,Date.now()))+' · '+esc(x.status)+'</span> <button data-pause-timer="'+esc(x.id)+'">'+(x.status==="running"?"Pause":"Resume")+'</button> <button data-remove-timer="'+esc(x.id)+'">Remove</button></div>').join(""):"No timers set.";
 }
 let timerSerial=0;
 function startTimer(min=Number($("timerMinutes").value),label=$("timerName").value){
  const duration=Math.round(min*60);
  if(!Number.isFinite(duration)||duration<60||duration>14400){say("voiceStatus","Enter 1–240 minutes.");return;}
  const index=timerSerial++%80,id="smart:"+index;
  timerState=T.start(timerState,id,{recipeId:"smart",stepIndex:index,title:C.clean(label).slice(0,60)||"Cooking",durationSec:duration},Date.now());
  write(keys.timer,timerState);clock();
 }
 $("startTimer").addEventListener("click",()=>startTimer());
 $("smartTimers").addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.removeTimer){timerState=T.remove(timerState,b.dataset.removeTimer);}
  if(b.dataset.pauseTimer){
   const id=b.dataset.pauseTimer,t=timerState[id];
   if(t?.status==="running")timerState=T.pause(timerState,id,Date.now());
   else if(t)timerState=T.start(timerState,id,{recipeId:t.recipeId,stepIndex:t.stepIndex,title:t.title,durationSec:t.durationSec},Date.now());
  }
  write(keys.timer,timerState);clock();
 });
 setInterval(clock,1000);clock();
 function voiceCommand(t){
  const cmd=String(t||"").toLowerCase();
  if(/\b(next|continue|forward)\b/.test(cmd))nextStep(1);
  else if(/\b(previous|back)\b/.test(cmd))nextStep(-1);
  else if(/\b(repeat|read)\b/.test(cmd))readAloud();
  else{
   const n=cmd.match(/\b(?:start|set)\s+(\d{1,3})\s*(?:minute|min)/);
   if(n)startTimer(Number(n[1]),"Voice timer");
   else say("voiceStatus","Didn't recognise a cooking command: "+cmd.slice(0,90));
  }
 }
 function stopVoice(){
  if(activeVoice){try{activeVoice.onend=null;activeVoice.stop()}catch{}activeVoice=null;}
 }
 $("voiceStop").addEventListener("click",()=>{stopVoice();say("voiceStatus","Voice recognition stopped.");});
 $("voiceStart").addEventListener("click",()=>{
  const Constructor=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Constructor){say("voiceStatus","Speech recognition isn't supported in this browser. Read-aloud and buttons still work.");return;}
  if(!confirm("Enable speech recognition? Your browser may send audio to its speech service. Continue?"))return;
  stopVoice();
  const rec=new Constructor();rec.lang="en-AU";rec.continuous=true;rec.interimResults=false;rec.onresult=e=>{
   for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)voiceCommand(e.results[i][0]?.transcript||"");
  };
  rec.onerror=e=>say("voiceStatus","Voice recognition issue: "+e.error+". Use the buttons if unavailable.");
  rec.onend=()=>{if(activeVoice===rec){activeVoice=null;say("voiceStatus","Voice recognition ended; restart with your permission if needed.");}};
  try{activeVoice=rec;rec.start();say("voiceStatus","Listening for cooking commands. Stop when not needed.");}catch(e){activeVoice=null;say("voiceStatus","Could not start voice input: "+e.message);}
 });
 $("keepScreenOn").addEventListener("click",async()=>{
  if(wakeLock){try{await wakeLock.release()}catch{}wakeLock=null;say("voiceStatus","Screen wake lock released.");return;}
  if(!navigator.wakeLock?.request){say("voiceStatus","Screen wake lock unsupported here. Adjust device sleep settings manually.");return;}
  try{wakeLock=await navigator.wakeLock.request("screen");say("voiceStatus","Screen requested to stay awake while this page is visible. Device may still override it.");wakeLock.addEventListener("release",()=>{wakeLock=null;});}
  catch(e){say("voiceStatus","Wake lock not available: "+e.message);}
 });
 document.addEventListener("visibilitychange",()=>{if(document.hidden)stopCamera();});
 window.addEventListener("pagehide",()=>{stopCamera();stopVoice();if(wakeLock)wakeLock.release().catch(()=>{});});
 // Freezer stock tracked only after user confirms it was really cooked and frozen.
 function freezer(){const a=read(keys.freezer,[]);return Array.isArray(a)?a.filter(x=>x&&typeof x.name==="string"&&Number.isInteger(x.remaining)&&x.remaining>=0).slice(0,100):[];}
 function renderFreezer(){
  const list=freezer();
  $("freezerStock").innerHTML=list.length?list.map(x=>'<div class="entry"><strong>'+esc(x.name)+'</strong><small>'+x.remaining+' remaining of '+x.total+' portions · cooked '+esc(x.date)+' · recorded locally</small><button data-eat-portion="'+esc(x.id)+'" '+(!x.remaining?"disabled":"")+'>Used one portion</button></div>').join(""):"No actual frozen portions recorded yet.";
 }
 $("addFreezer").addEventListener("click",()=>{
  const n=Number($("freezerPortions").value),date=$("freezerDate").value,name=$("freezerRecipe").value;
  if(!Number.isInteger(n)||n<1||n>50||!/^\d{4}-\d{2}-\d{2}$/.test(date)){say("freezerStock","Enter a valid actual portion count and cooking date.");return;}
  if(!confirm("Confirm "+n+" portions have actually been safely cooled and frozen?"))return;
  const list=freezer(),id="batch-"+Date.now()+"-"+Math.floor(Math.random()*1000);
  list.unshift({id,name,date,total:n,remaining:n});
  say("freezerStock",write(keys.freezer,list.slice(0,100))?"Frozen portions recorded.":"Could not save freezer inventory.");renderFreezer();
 });
 $("freezerStock").addEventListener("click",e=>{
  const b=e.target.closest("[data-eat-portion]");if(!b)return;
  const list=freezer(),x=list.find(y=>y.id===b.dataset.eatPortion);
  if(!x||!x.remaining)return;
  if(!confirm("Mark one "+x.name+" portion as used?"))return;
  x.remaining--;write(keys.freezer,list);renderFreezer();
 });
 $("exportFreezer").addEventListener("click",async()=>{
  const s=freezer().map(x=>x.name+": "+x.remaining+" remaining, cooked "+x.date).join("\n");
  try{await navigator.clipboard.writeText(s);say("shareStatus","Copied your freezer stock.");}catch{say("shareStatus","Copy failed; use a private backup instead.");}
 });
 renderFreezer();
 async function shareData(share){
  if(!B?.serialize){say("shareStatus","Backup module unavailable.");return;}
  const data=B.serialize(localStorage,location.origin),name="healthiestfood-private-backup-"+locDate()+".json";
  const file=new File([data],name,{type:"application/json"});
  if(share&&navigator.canShare?.({files:[file]})&&navigator.share){
   try{await navigator.share({files:[file],title:"Private HealthiestFood backup"});say("shareStatus","Shared using your device picker. This is a one-time transfer, not live sync.");return;}
   catch(e){if(e.name==="AbortError"){say("shareStatus","Sharing cancelled.");return;}}
  }
  saveFile(data,name,"application/json");say("shareStatus","Private backup downloaded. Import it on the other device using the existing HealthiestFood planner's backup controls.");
 }
 $("shareBackup").addEventListener("click",()=>shareData(true));
 $("downloadBackup").addEventListener("click",()=>shareData(false));
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
