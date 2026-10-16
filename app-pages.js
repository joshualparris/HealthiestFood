/* Single-document navigation bridge for persistent podcast playback.
 * Research and utility HTML pages load INSIDE same-origin frames under the app,
 * so the top-level <audio> element is never removed when changing pages.
 */
(function(){
"use strict";
if(typeof window==="undefined"||typeof document==="undefined")return;
const known={"cooking-methods.html":{route:"lab",frame:"foodLabFrame"},"longevity.html":{route:"guide",frame:"foodGuideFrame"},
 "product-check.html":{route:"page",frame:"foodOtherFrame"},"device-timer-check.html":{route:"page",frame:"foodOtherFrame"}};
function routeForUrl(url){try{
 const u=new URL(url,location.href);
 if(u.origin!==location.origin)return null;
 const file=u.pathname.split("/").pop();
 return known[file]?{...known[file],url:u.href}:null;
}catch{return null}}
function open(url){
 const details=routeForUrl(url);if(!details)return false;
 const frame=document.getElementById(details.frame);if(!frame)return false;
 if(frame.src!==details.url)frame.src=details.url;
 if(location.hash==="#"+details.route)window.dispatchEvent(new Event("hashchange"));
 else location.hash=details.route;
 return true;
}
document.addEventListener("click",e=>{
 if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
 const a=e.target.closest("a[href]");if(!a||a.target==="_blank"||a.hasAttribute("download"))return;
 if(!routeForUrl(a.href))return;
 e.preventDefault();open(a.href);
},true);
window.addEventListener("message",e=>{
 if(e.origin!==location.origin||!e.data||e.data.type!=="healthiestfood-frame-size")return;
 const frame=[document.getElementById("foodGuideFrame"),document.getElementById("foodLabFrame"),document.getElementById("foodOtherFrame")].find(f=>f?.contentWindow===e.source);
 if(!frame)return;
 const height=Number(e.data.height);
 if(!Number.isFinite(height)||height<350||height>30000)return;
 const target=Math.ceil(height);
 if(Math.abs(frame.getBoundingClientRect().height-target)>3)frame.style.height=target+"px";
});
window.addEventListener("message",e=>{
 if(e.origin!==location.origin||!e.data||e.data.type!=="healthiestfood-page-navigation")return;
 const guide=document.getElementById("foodGuideFrame"),lab=document.getElementById("foodLabFrame"),extra=document.getElementById("foodOtherFrame");
 if(![guide?.contentWindow,lab?.contentWindow,extra?.contentWindow].includes(e.source))return;
 const route=e.data.route;
 if(typeof route==="string"&&["home","recipes","shop","science","media","plan","lab","guide"].includes(route))location.hash=route;
 else if(typeof e.data.url==="string")open(e.data.url);
});
window.FoodInAppPages={open,routeForUrl};
})();
