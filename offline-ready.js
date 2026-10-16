/* Browser-local offline helper. No notifications or background sync. */
(function(){
 "use strict";
 function update(){
  const el=document.getElementById("offlineCookingNote");if(!el)return;
  el.hidden=navigator.onLine!==false;
  if(navigator.onLine===false)el.textContent="Offline copy: saved recipes may still work, but Woolworths prices, labels and research links may be outdated. Recheck online before shopping or following changed food-safety advice.";
 }
 function boot(){
  update();window.addEventListener("online",update);window.addEventListener("offline",update);
  if("serviceWorker" in navigator && location.protocol==="https:"){
   navigator.serviceWorker.register("./service-worker.js").catch(()=>{});
  }
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
