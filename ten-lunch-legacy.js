/* ES5 fallback for older iPad Safari: modern TenLunch cannot parse on iOS 9. */
(function () {
  "use strict";
  if (window.TenLunch) return;
  var KEY="good-food-ten-lunch-session-v1";
  function el(id) { return document.getElementById(id); }
  function text(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
  function ancestor(node, attr) { while(node && node!==document) { if(node.getAttribute && node.getAttribute(attr)!==null) return node;node=node.parentNode; } return null; }
  function value(n,max) { n=Number(n);return !isFinite(n)||n<0?0:Math.min(max,n); }
  function display(n) { return String(Math.round(n*100)/100); }
  function start() {
    if (window.TenLunch || !el("tenLunchFallbackData") || !el("shopList")) return;
    var data;
    try { data=JSON.parse(el("tenLunchFallbackData").textContent||el("tenLunchFallbackData").innerText); }
    catch(e) { el("shortList").textContent="Use the full printable instructions below.";return; }
    var items=data.items,phases=data.phases,s={tab:"shop",have:{},done:{}};
    try { var saved=JSON.parse(localStorage.getItem(KEY)||"{}");if(saved.have)s.have=saved.have;if(saved.done)s.done=saved.done;if(saved.tab==="cook"||saved.tab==="shop"||saved.tab==="finish")s.tab=saved.tab; }catch(e){}
    function persist() { try { localStorage.setItem(KEY,JSON.stringify(s)); }catch(e){} }
    function have(i) { return value(s.have[i.id]||0,i.need); }
    function missing(i) { return Math.max(0,Math.round((i.need-have(i))*100)/100); }
    function completed() { var count=0,p,k;for(p=0;p<phases.length;p++)for(k=0;k<phases[p].steps.length;k++)if(s.done[phases[p].steps[k][0]]===true)count++;return count; }
    function draw() {
      var groups=[],h="",steps="",missingList=[],covered=0,total=0,i,j,k,p;
      for(i=0;i<items.length;i++){if(groups.indexOf(items[i].group)<0)groups.push(items[i].group);if(missing(items[i])===0)covered++;else missingList.push(items[i].name+" "+display(missing(items[i]))+" "+items[i].unit);}
      for(i=0;i<groups.length;i++){
        h+="<h2>"+text(groups[i])+"</h2>";
        for(j=0;j<items.length;j++){
          var x=items[j],left=missing(x);if(x.group!==groups[i])continue;
          h+='<div class="ingredient"><div><strong>'+text(x.name)+'</strong><p>Need '+display(x.need)+" "+text(x.unit)+" · "+text(x.note)+'</p></div><label>In basket / at home <span class="value"><input type="number" min="0" step="any" data-item="'+text(x.id)+'" value="'+display(have(x))+'"> '+text(x.unit)+'</span></label><output class="'+(left?"missing":"enough")+'">'+(left?"Still need "+display(left)+" "+text(x.unit):"Quantity covered")+'</output></div>';
        }
      }
      el("shopList").innerHTML=h;
      el("shortList").textContent=missingList.length?"Still to confirm / buy ("+missingList.length+"): "+missingList.join("; "):"All quantities entered; check labels.";
      for(p=0;p<phases.length;p++){
        var phase=phases[p];steps+='<section class="phase"><h2>'+text(phase.name)+'</h2><p>'+text(phase.detail)+'</p>';
        for(k=0;k<phase.steps.length;k++){
          var step=phase.steps[k],checked=s.done[step[0]]===true;total++;
          steps+='<label class="step '+(checked?"is-done":"")+'"><input type="checkbox" data-step="'+text(step[0])+'" '+(checked?'checked="checked"':"")+'><span>'+text(step[1])+'</span></label>';
        }
        steps+="</section>";
      }
      el("steps").innerHTML=steps;
      el("counts").textContent=covered+" / "+items.length+" ingredients confirmed · "+completed()+" / "+total+" steps done";
      el("progress").max=total;el("progress").value=completed();
      el("doneSummary").textContent=completed()+" / "+total+" steps ticked. Confirm actual food cooling and temperatures.";
      var names=["shop","cook","finish"];
      for(i=0;i<names.length;i++){el("tab-"+names[i]).setAttribute("aria-selected",names[i]===s.tab?"true":"false");el("pane-"+names[i]).hidden=names[i]!==s.tab;}
      if(el("staticCookingSteps"))el("staticCookingSteps").hidden=true;
      var date=new Date().toDateString(),labels=document.getElementsByClassName("labelDate");
      for(i=0;i<labels.length;i++)labels[i].textContent=date;
      if(el("printDate"))el("printDate").textContent=date;
    }
    function reveal(tab){
      if(tab!=="shop"&&tab!=="cook"&&tab!=="finish")return;
      s.tab=tab;persist();draw();
      try {
        if(window.parent && window.parent!==window && window.frameElement) {
          var rect=window.frameElement.getBoundingClientRect();
          window.parent.scrollTo(0,Math.max(0,(window.parent.pageYOffset||0)+rect.top-90));
        } else window.scrollTo(0,0);
      } catch(e){window.scrollTo(0,0);}
    }
    function update(input,redraw){
      var id=input.getAttribute("data-item"),i;
      for(i=0;i<items.length;i++)if(items[i].id===id){s.have[id]=value(input.value,items[i].need);persist();if(redraw)draw();break;}
    }
    document.addEventListener("click",function(e){
      var tab=ancestor(e.target,"data-tab");
      if(tab){e.preventDefault();reveal(tab.getAttribute("data-tab"));return;}
      if(e.target.id==="resetSession" && window.confirm("Clear this 10-lunch session?")){s={tab:"shop",have:{},done:{}};persist();reveal("shop");}
      if(e.target.id==="printLabels")window.print();
      if(e.target.id==="copyMissing"){
        var lines=[],i;for(i=0;i<items.length;i++)if(missing(items[i])>0)lines.push("- "+items[i].name+": "+display(missing(items[i]))+" "+items[i].unit);
        var field=document.createElement("textarea");field.value=lines.join("\n");document.body.appendChild(field);field.select();
        var ok=false;try{ok=document.execCommand("copy");}catch(err){}
        document.body.removeChild(field);e.target.textContent=ok?"Copied missing items":"Select the missing list above";
      }
    },false);
    document.addEventListener("input",function(e){if(ancestor(e.target,"data-item")===e.target)update(e.target,false);},false);
    document.addEventListener("change",function(e){
      if(ancestor(e.target,"data-item")===e.target)update(e.target,true);
      if(ancestor(e.target,"data-step")===e.target){s.done[e.target.getAttribute("data-step")]=e.target.checked;persist();draw();}
    },false);
    draw();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,false);else start();
}());
