/* HealthiestFood basic navigation + 17 recipe viewer for older iPad Safari.
 * ECMAScript 5 only. Modern app takes priority; no user data is overwritten.
 */
(function(){
"use strict";
var booted=false;
function el(id){return document.getElementById(id);}
function esc(x){return String(x===null||x===undefined?"":x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function findAttr(node,attr){while(node&&node!==document){if(node.getAttribute&&node.getAttribute(attr)!==null)return node;node=node.parentNode;}return null;}
function hasClass(el,cl){return (" "+el.className+" ").indexOf(" "+cl+" ")>=0;}
function setClass(el,cl,yes){if(!el)return;var before=" "+el.className+" ";var cleaned=before.replace(new RegExp(" "+cl+" ","g")," ");el.className=(cleaned+(yes?" "+cl:"")).replace(/^\s+|\s+$/g,"");}
function each(nodes,fn){for(var i=0;i<nodes.length;i++)fn(nodes[i],i);}
function storageGet(key,def){try{var x=JSON.parse(localStorage.getItem(key)||"null");return x===null?def:x;}catch(e){return def;}}
function storagePut(key,val){try{localStorage.setItem(key,JSON.stringify(val));}catch(e){}}
function main(){
 if(booted||window.HealthiestFoodMainAppReady)return;
 var all=window.GoodFoodLegacyRecipes;
 if(!all||all.length!==17||!el("view-recipes"))return;
 booted=true;
 document.documentElement.className+=" legacy-main";
 var types=["home","recipes","plan","shop","science","media","lab","guide","page"];
 var filter="all",selected=storageGet("good-food-legacy-selected-v1","a"),servings=null,cart=storageGet("good-food-legacy-cart-v1",[]);
 if(!cart||Object.prototype.toString.call(cart)!=="[object Array]")cart=[];
 function recipe(id){for(var i=0;i<all.length;i++)if(all[i].id===id)return all[i];return all[0];}
 function fmt(n){return String(Math.round(Number(n)*100)/100);}
 function current(){return recipe(selected);}
 function linkFor(r){return '<a class="legacy-recipe-card" href="#recipes" data-legacy-select="'+esc(r.id)+'"><strong>'+esc(r.icon||"🍽")+' '+esc(r.name)+'</strong><span>'+esc(r.short||"")+'</span><small>'+esc(r.category||"meal")+' · '+esc(r.yield)+' portions · '+esc(r.time||"?")+' min</small></a>';}
 function list(){
  var cards=[],featured=[],i,r;
  for(i=0;i<all.length;i++){r=all[i];if(filter==="all"||r.category===filter)cards.push(linkFor(r));if(r.category==="lunch")featured.push(linkFor(r));}
  el("recipeCards").innerHTML='<div class="legacy-recipe-list">'+cards.join("")+'</div>';
  el("featuredCards").innerHTML='<div class="legacy-recipe-list">'+featured.join("")+'</div>';
  each(document.querySelectorAll("[data-recipe-type]"),function(b){var yes=b.getAttribute("data-recipe-type")===filter;setClass(b,"is-active",yes);b.setAttribute("aria-pressed",yes?"true":"false");});
 }
 function detail(){
  var r=current(),mult=(servings||r.yield)/r.yield,li=[],steps=[],i,row,step;
  for(i=0;i<r.ingredients.length;i++){row=r.ingredients[i];li.push("<li><strong>"+fmt(row[0]*mult)+" "+esc(row[1])+"</strong> "+esc(row[2])+"</li>");}
  for(i=0;i<r.steps.length;i++){step=r.steps[i];steps.push("<li><strong>"+esc(step.title)+"</strong>: "+esc(step.detail)+
   (step.tip?" <em>"+esc(step.tip)+"</em>":"")+"</li>");}
  el("recipeDetail").innerHTML='<div class="legacy-detail"><h2>'+esc(r.name)+'</h2><p>'+esc(r.description)+'</p>'+
   '<p><strong>Portions:</strong> <button type="button" data-legacy-portions="-1" aria-label="Fewer portions">−</button> '+
   '<strong id="legacyServingCount">'+fmt(servings||r.yield)+'</strong> <button type="button" data-legacy-portions="1" aria-label="More portions">+</button></p>'+
   '<h3>Measured ingredients</h3><ul>'+li.join("")+'</ul>'+
   '<h3>Cooking method</h3><ol>'+steps.join("")+'</ol>'+
   '<p class="legacy-warning"><strong>Nutrition:</strong> '+esc(r.nutrition||"Not verified")+
   '. Follow food labels and safe temperatures; this is a reading guide, not a thermometer.</p>'+
   '<p><button type="button" class="btn btn-primary" data-legacy-add="'+esc(r.id)+'">Add portions to shopping list</button> '+
   '<a class="btn btn-ghost" href="ten-lunch-cook.html">Ten-lunch cooking guide</a></p></div>';
 }
 function shop(){
  var totals={},order=[],i,k,j,r,scale,ing,key,q;
  for(i=0;i<cart.length;i++){
   r=recipe(cart[i].id);if(!r||cart[i].id!==r.id)continue;
   scale=(Number(cart[i].portions)||r.yield)/r.yield;
   for(j=0;j<r.ingredients.length;j++){
    ing=r.ingredients[j];key=String(ing[1])+"|"+String(ing[2]).toLowerCase();
    if(!totals[key]){totals[key]={name:ing[2],unit:ing[1],amount:0};order.push(key);}
    totals[key].amount+=Number(ing[0])*scale;
   }
  }
  var lines=[],meals=[];
  for(i=0;i<order.length;i++){var entry=totals[order[i]];lines.push("<li>"+fmt(entry.amount)+" "+esc(entry.unit)+" "+esc(entry.name)+"</li>");}
  for(i=0;i<cart.length;i++){r=recipe(cart[i].id);meals.push("<li>"+esc(r.name)+" — "+esc(cart[i].portions)+" portion(s)</li>");}
  if(el("customShopping"))el("customShopping").innerHTML='<div class="legacy-detail"><h2>Your basic shopping list</h2><p>These are recipe totals only; pantry deductions, live prices and automatic cloud sync are unavailable in this older browser.</p>'+
   (cart.length?'<h3>Meals selected</h3><ul>'+meals.join("")+'</ul><h3>Total ingredient quantities</h3><ul>'+lines.join("")+'</ul><button type="button" data-legacy-clear>Clear this basic list</button>':
   '<p>No recipes added yet. <a href="#recipes">Browse recipes</a>, then tap “Add portions to shopping list”.</p>')+'</div>';
 }
 function showLimited(view){
  var area=view==="plan"?el("planGrid"):null;
  if(area)area.innerHTML='<div class="legacy-detail"><h2>Plan your next meal</h2>'+
   '<p>The full interactive calendar needs a newer browser. You can browse all recipes here and build a basic shopping list.</p>'+
   '<p><a class="btn btn-primary" href="#recipes">Choose a recipe</a> <a class="btn btn-ghost" href="ten-lunch-cook.html">Cook ten freezer lunches</a></p></div>';
 }
 function route(where){
  if(types.indexOf(where)<0)where="home";
  each(document.querySelectorAll(".view"),function(view){var active=view.id==="view-"+where;setClass(view,"hidden",!active);view.hidden=!active;});
  each(document.querySelectorAll("[data-route]"),function(link){var yes=link.getAttribute("data-route")===where;setClass(link,"active",yes);if(yes)link.setAttribute("aria-current","page");else link.removeAttribute("aria-current");});
  if(where==="recipes")detail();
  if(where==="shop")shop();
  if(where==="plan")showLimited("plan");
  if(where==="lab"||where==="guide"||where==="page"){
   var frame=el("foodOtherFrame");
   if(frame)frame.setAttribute("scrolling","auto");
  }
  // Older Safari supports numeric scrollTo, not ScrollToOptions.
  try{window.scrollTo(0,0);}catch(e){}
 }
 function navigate(name){
  if(types.indexOf(name)<0)return;
  if(window.location.hash==="#"+name)route(name);
  else window.location.hash=name;
 }
 function selectedRecipe(id){var r=recipe(id);if(r.id!==id)return;selected=id;servings=r.yield;storagePut("good-food-legacy-selected-v1",id);detail();navigate("recipes");}
 each(document.querySelectorAll("[data-goto]"),function(b){
  // Buttons are enhanced with ES5 delegation; links work with or without scripts.
  if(b.tagName.toLowerCase()==="button")b.setAttribute("aria-label",b.getAttribute("aria-label")||b.textContent);
 });
 document.addEventListener("click",function(e){
  var choice=findAttr(e.target,"data-legacy-select");
  if(choice){e.preventDefault();selectedRecipe(choice.getAttribute("data-legacy-select"));return;}
  var type=findAttr(e.target,"data-recipe-type");
  if(type){e.preventDefault();var x=type.getAttribute("data-recipe-type");if(["all","breakfast","lunch","dinner","snack"].indexOf(x)<0)return;filter=x;list();var cur=current();if(x!=="all"&&cur.category!==x){for(var k=0;k<all.length;k++)if(all[k].category===x){selected=all[k].id;servings=all[k].yield;break;}}detail();return;}
  var portion=findAttr(e.target,"data-legacy-portions");
  if(portion){e.preventDefault();servings=Math.max(1,Math.min(20,(servings||current().yield)+Number(portion.getAttribute("data-legacy-portions"))));detail();return;}
  var add=findAttr(e.target,"data-legacy-add");
  if(add){e.preventDefault();var rr=current();cart.push({id:rr.id,portions:servings||rr.yield});storagePut("good-food-legacy-cart-v1",cart);navigate("shop");shop();return;}
  var clear=findAttr(e.target,"data-legacy-clear");
  if(clear){e.preventDefault();if(window.confirm("Clear the basic shopping list on this iPad?")){cart=[];storagePut("good-food-legacy-cart-v1",cart);shop();}return;}
  var goto=findAttr(e.target,"data-goto");
  if(goto){e.preventDefault();navigate(goto.getAttribute("data-goto"));return;}
 },false);
 window.addEventListener("hashchange",function(){route(window.location.hash.replace(/^#/,""));},false);
 list();servings=current().yield;detail();shop();route(window.location.hash.replace(/^#/,""));
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",main,false);
else main();
}());
