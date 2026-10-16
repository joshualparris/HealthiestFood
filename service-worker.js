/* Static PWA offline fallback (after successful online visit).
 * Network FIRST to avoid treating stale recipes, nutrition labels or food-safety
 * guidance as current. Cache only same-origin static assets, never personal data.
 * An offline copy is a convenience, NOT current supermarket/product information.
 */
const CACHE_NAME="healthiestfood-shell-20261016-v1";
const ASSETS=[
 "./","./index.html","./longevity.html","./site.css","./site-data.js",
 "./whole-day-data.js","./timers.js","./recipe-scale.js","./food-safety.js",
 "./local-backup.js","./offline-ready.js","./cook-trial.js","./app.js","./food-shopping.js",
 "./food-planner.js","./nutrition-coverage.js","./nutrient-ledger.js",
 "./afcd3-selected.js","./afcd3-foods.js","./whole-day-analysis.js",
 "./whole-day-report.js","./site-audit.js","./favicon.svg","./manifest.webmanifest"
];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>
  Promise.allSettled(ASSETS.map(async url=>{
   try{const response=await fetch(url,{cache:"no-cache"});if(response.ok)await cache.put(url,response.clone());}catch{}
  }))
 ).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("healthiestfood-shell-")&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
 const req=event.request;
 if(req.method!=="GET")return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return;
 if(!(/\/[^/]*\.(?:html|css|js|svg|webmanifest)$/.test(url.pathname)||url.pathname.endsWith("/")))return;
 event.respondWith((async()=>{
  try{
   const response=await fetch(req);
   if(response.ok && response.type==="basic"){
    const cache=await caches.open(CACHE_NAME);
    try{await cache.put(req,response.clone());}catch{}
   }
   return response;
  }catch{
   const cached=await caches.match(req,{ignoreSearch:true});
   if(cached)return cached;
   if(req.mode==="navigate"){
    const home=await caches.match("./index.html");
    if(home)return home;
   }
   return new Response("Offline: this page was not saved during your last online visit.",{status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}});
  }
 })());
});
