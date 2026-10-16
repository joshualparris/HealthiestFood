/* Route links from embedded research pages back to the persistent top-level app.
 * Works only inside a same-origin frame; leaves standalone pages functioning normally.
 */
(function(){
"use strict";
if(window.top===window)return;
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
