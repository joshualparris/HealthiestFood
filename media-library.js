/* ABC audio plays in a persistent first-party HTML5 player via official public RSS streams; third-party video and research remain link-out. */
(function(root,factory){const api=factory(root);if(typeof module==="object"&&module.exports)module.exports=api;if(root)root.FoodMedia=api;})(typeof window!=="undefined"?window:null,function(w){
"use strict";
const D=w?.FoodMediaData, el=()=>typeof document!=="undefined"?document.getElementById("mediaLibrary"):null;
const esc=v=>String(v).replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
const state={kind:"all",topic:"all",query:""};
const safeUrl=u=>/^https:\/\/(?:www\.)?(?:abc\.net\.au|heartfoundation\.org\.au|heartfoundation\.au|foodstandards\.gov\.au|youtube\.com|youtu\.be|eatforhealth\.gov\.au|nejm\.org|bmjmedicine\.bmj\.com)(?:\/|$)/i.test(u)?u:"#";
function filtered(){
 if(!D)return [];
 const q=state.query.trim().toLocaleLowerCase("en-AU");
 return D.items.filter(x=>(state.kind==="all"||state.kind===x.kind)&&(state.topic==="all"||state.topic===x.topic)&&(!q||[x.title,x.publisher,x.topic,x.claim,x.limitations].join(" ").toLocaleLowerCase("en-AU").includes(q)));
}
function card(x){
 const icon=x.kind==="video"?"▶":"♫",noun=x.kind==="video"?"Watch":"Listen",title=esc(x.title),hasStream=x.kind==="podcast"&&!!window.FoodPodcastStreams?.episodes?.[x.id]?.url;
 return '<article class="media-resource" data-media-id="'+esc(x.id)+'"><div class="media-resource-top"><span class="media-resource-kind" aria-label="'+esc(x.kind)+'">'+icon+" "+esc(x.kind)+"</span><span class=\"media-resource-date\">"+esc(x.duration)+"</span></div>"+
 '<div class="media-resource-body"><div class="media-resource-topic">'+esc(x.topic)+'</div><h3>'+title+'</h3><div class="media-resource-publisher">'+esc(x.publisher)+'</div>'+
 '<p class="media-resource-claim"><strong>What it explains</strong> '+esc(x.claim)+'</p>'+
 '<p class="media-resource-limits"><strong>What it does not prove</strong> '+esc(x.limitations)+'</p></div>'+
 '<div class="media-resource-links">'+(hasStream?'<button type="button" class="media-resource-watch" data-play-episode="'+esc(x.id)+'" aria-label="Play '+title+' in the HealthiestFood player">▶ Play here</button>':'')+
 '<a class="media-resource-original" href="'+esc(safeUrl(x.url))+'" target="_blank" rel="noopener noreferrer">'+(x.kind==="podcast"?"Original episode ↗":noun+" on publisher ↗")+'</a>'+
 '<a class="media-resource-primary" href="'+esc(safeUrl(x.primary))+'" target="_blank" rel="noopener noreferrer">Research / guideline ↗</a></div></article>';
}
function render(){
 const node=el();if(!node||!D)return;
 const results=filtered();
 const output=node.querySelector("#mediaResults"),status=node.querySelector("#mediaCount");
 if(status)status.textContent=results.length+" of "+D.items.length+" resources";
 if(output)output.innerHTML=results.length?results.map(card).join(""):'<div class="media-empty">No matching episodes. Try another topic or clear the search.</div>';
 node.querySelectorAll("[data-media-kind]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mediaKind===state.kind)));
 const topic=node.querySelector("#mediaTopic");if(topic&&topic.value!==state.topic)topic.value=state.topic;
}
function init(){
 const node=el();if(!node||!D||node.dataset.mediaReady)return;
 node.dataset.mediaReady="true";
 document.addEventListener("click",e=>{const play=e.target.closest(".recipe-media-links [data-play-episode]");if(play)window.FoodPodcastPlayer?.playEpisode(play.dataset.playEpisode);});
 // A contextual URL such as index.html?topic=Fish%20%26%20omega-3#media selects its matching topic.
 try{const chosen=new URLSearchParams(location.search).get("topic");if(chosen&&D.topics.includes(chosen))state.topic=chosen;}catch{}
 node.innerHTML='<div class="media-library-toolbar"><div class="media-kind-filters" role="group" aria-label="Media format">'+
 [["all","All resources"],["podcast","Podcasts"],["video","Videos"]].map(([kind,text])=>'<button type="button" data-media-kind="'+kind+'" aria-pressed="'+String(kind==="all")+'">'+text+'</button>').join("")+
 '</div><label class="media-topic-filter" for="mediaTopic">Topic<select id="mediaTopic"><option value="all">All health topics</option>'+D.topics.map(t=>'<option value="'+esc(t)+'">'+esc(t)+'</option>').join("")+'</select></label>'+
 '<label class="media-search-filter" for="mediaSearch">Search episodes<input id="mediaSearch" type="search" autocomplete="off" placeholder="e.g. omega-3, calcium, food safety"></label>'+
 '<div class="media-results-count" id="mediaCount" role="status" aria-live="polite"></div></div><div id="mediaResults" class="media-grid"></div>';
 node.addEventListener("click",e=>{const play=e.target.closest("[data-play-episode]");if(play){window.FoodPodcastPlayer?.playEpisode(play.dataset.playEpisode);return;}const b=e.target.closest("[data-media-kind]");if(!b)return;state.kind=b.dataset.mediaKind;render();});
 node.addEventListener("change",e=>{if(e.target.id==="mediaTopic"){state.topic=e.target.value;render();}});
 node.addEventListener("input",e=>{if(e.target.id==="mediaSearch"){state.query=e.target.value;render();}});
 render();
}
function relatedMarkup(r){
 if(!D)return "";
 const links=D.relatedForRecipe(r,3);
 if(!links.length)return "";
 return '<aside class="recipe-media-links" aria-label="Further listening and watching for this recipe"><h3>Why these ingredients?</h3><p>Learn the science behind the choices, not a claim this recipe extends lifespan.</p><div>'+links.map(x=>x.kind==="podcast"&&window.FoodPodcastStreams?.episodes?.[x.id]?.url?'<button class="recipe-media-play" type="button" data-play-episode="'+esc(x.id)+'">▶ Play here: '+esc(x.title)+'</button>':'<a href="'+esc(safeUrl(x.url))+'" target="_blank" rel="noopener noreferrer">'+(x.kind==="video"?"▶ Watch":"♫ Listen")+": "+esc(x.title)+" ↗</a>").join("")+'</div><a class="recipe-media-browse" href="#media">Browse all podcasts & videos ↗</a></aside>';
}
function injectRecipe(r,target){
 if(!target)return;
 target.querySelectorAll(".recipe-media-links").forEach(node=>node.remove());
 const markup=relatedMarkup(r);
 if(!markup)return;
 const node=document.createElement("div");node.innerHTML=markup;
 (target.querySelector(".detail-left")||target).append(...node.children);
}
return {init,render,relatedMarkup,injectRecipe,filtered,state,safeUrl};
});
