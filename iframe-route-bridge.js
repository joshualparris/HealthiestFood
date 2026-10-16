/* Route links from embedded research pages back to the persistent top-level app.
 * Works only inside a same-origin frame; leaves standalone pages functioning normally.
 */
(function(){
"use strict";
if(window.top===window)return;
// Embedded pages are content, not another copy of the application shell.
document.documentElement.classList.add("embedded-site");
// Resize to the actual article/lab height so the main page has one scrollbar.
let previousHeight=0;
function reportHeight(){
 const main=document.getElementById("main");
 if(!main)return;
 const bottom=main.getBoundingClientRect().bottom+window.scrollY;
 const height=Math.max(520,Math.min(30000,Math.ceil(bottom+32)));
 if(Math.abs(height-previousHeight)>3){
   previousHeight=height;
   window.parent.postMessage({type:"healthiestfood-frame-size",height},location.origin);
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initFrame,{once:true});
else initFrame();
function initFrame(){
 reportHeight();
 const main=document.getElementById("main");
 if(main&&"ResizeObserver" in window)new ResizeObserver(()=>requestAnimationFrame(reportHeight)).observe(main);
 document.addEventListener("click",()=>requestAnimationFrame(reportHeight),true);
 document.addEventListener("change",()=>requestAnimationFrame(reportHeight),true);
 window.addEventListener("load",reportHeight,{once:true});
}
document.addEventListener("click",e=>{
 if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
 const a=e.target.closest("a[href]");if(!a||a.target==="_blank"||a.hasAttribute("download"))return;
 let u;try{u=new URL(a.href,location.href)}catch{return}
 if(u.origin!==location.origin)return;
 const name=u.pathname.split("/").pop();
 if(name==="index.html"||name===""){
  e.preventDefault();window.parent.postMessage({type:"healthiestfood-page-navigation",route:(u.hash||"#home").slice(1)},location.origin);
 }else if(["cooking-methods.html","longevity.html","product-check.html","device-timer-check.html"].includes(name)){
  e.preventDefault();window.parent.postMessage({type:"healthiestfood-page-navigation",url:u.href},location.origin);
 }
},true);
})();
