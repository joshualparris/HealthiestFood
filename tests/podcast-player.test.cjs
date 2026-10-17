const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const context={window:{},URL,Intl,Date};vm.createContext(context);
for(const name of ["media-data.js","podcast-streams.js","podcast-player.js","media-library.js"])
 vm.runInContext(read(name),context,{filename:name});
const catalog=context.window.FoodMediaData,streams=context.window.FoodPodcastStreams,player=context.window.FoodPodcastPlayer,media=context.window.FoodMedia;
test("Exactly all 16 curated ABC podcasts have official RSS MP3 sources",()=>{
 const episodes=catalog.items.filter(x=>x.kind==="podcast");
 assert.equal(episodes.length,16);
 assert.equal(streams.count,16);
 assert.equal(Object.keys(streams.episodes).length,16);
 assert.equal(player.order().length,16);
 for(const episode of episodes){
  const source=streams.episodes[episode.id];
  assert.ok(source,episode.id);
  assert.equal(source.source,"ABC public podcast RSS enclosure");
  assert.equal(source.publisherUrl,episode.url);
  assert.ok(source.feed.startsWith("https://www.abc.net.au/feeds/"));
  assert.ok(player.validStream(source.url),episode.id);
  assert.ok(source.title&&source.published);
  assert.match(source.url,/\.mp3(?:\?|$)/);
 }
});
test("The player refuses fabricated, unsafe and unrelated stream URLs",()=>{
 assert.equal(player.validStream("javascript:alert(1)"),false);
 assert.equal(player.validStream("https://evil.example/podcast.mp3"),false);
 assert.equal(player.validStream("http://mediacore-live-production.akamaized.net/x.mp3"),false);
 assert.equal(player.validStream("https://mediacore-live-production.akamaized.net.evil.example/audio.mp3"),false);
 assert.ok(player.validStream(streams.episodes.med.url));
});
test("Episode playback is wired into media and recipe cards without forced external navigation",()=>{
 const s=read("media-library.js");
 assert.match(s,/data-play-episode/);
 assert.match(s,/Play here/);
 assert.match(s,/FoodPodcastPlayer/);
 const recipe=media.relatedMarkup({id:"a"});
 assert.match(recipe,/data-play-episode/);
 assert.match(recipe,/Browse all podcasts/);
});
test("Main document owns playback across recipe, planner, research, guide, lab and product-check views",()=>{
 const html=read("index.html"),app=read("app.js");
 for(const x of ['id="view-home"','id="view-recipes"','id="view-plan"','id="view-shop"','id="view-science"','id="view-media"','id="view-guide"','id="view-lab"','id="view-page"'])assert.ok(html.includes(x),x);
 for(const x of ["podcast-streams.js","podcast-player.js","app-pages.js","media-library.js"])assert.ok(html.includes('src="'+x+'"'),x);
 assert.ok(html.indexOf('src="media-data.js"')<html.indexOf('src="podcast-streams.js"'));
 assert.ok(html.indexOf('src="podcast-streams.js"')<html.indexOf('src="podcast-player.js"'));
 assert.ok(html.indexOf('src="podcast-player.js"')<html.indexOf('src="media-library.js"'));
 assert.ok(app.includes('"media","lab","guide","page"'));
 for(const page of ["longevity.html","cooking-methods.html","product-check.html","device-timer-check.html"])
  assert.ok(read(page).includes('src="iframe-route-bridge.js"'),page);
 assert.ok(read("app-pages.js").includes("healthiestfood-page-navigation"));
});
test("Playback persists when the player is collapsed, and does not pause when document is hidden",()=>{
 const code=read("podcast-player.js");
 assert.match(code,/function collapse\(\)\{data.expanded=false;sync\(\)\}/);
 assert.match(code,/visibilitychange/);
 assert.ok(!/visibilitychange[^\n]*\.pause\(/.test(code));
 assert.match(code,/navigator.mediaSession/);
 assert.match(code,/seekbackward/);
 assert.match(code,/seekforward/);
 assert.match(code,/setPositionState/);
 assert.match(code,/playbackRate/);
 assert.match(code,/good-food-podcast-resume-v1/);
 assert.match(code,/Audio\(\)/);
 for(const source of ["podcast-player.js","app-pages.js","iframe-route-bridge.js"])
  assert.doesNotThrow(()=>new vm.Script(read(source)),source);
});
test("No ABC audio downloads are placed in the offline cache",()=>{
 const sw=read("service-worker.js");
 for(const item of ["podcast-streams.js","podcast-player.js","app-pages.js","iframe-route-bridge.js"])assert.ok(sw.includes(item));
 assert.ok(!sw.includes(".mp3"));
 assert.ok(read("site.css").includes(".podcast-player"));
});


test("Autoplay next is opt-in, follows curated playable order and stops after the last episode",()=>{
 const ids=player.order().map(x=>x.id);
 assert.equal(ids.length,16);
 assert.equal(player.state().autoplayNext,false);
 assert.equal(player.nextInQueue(ids[0]),ids[1]);
 assert.equal(player.nextInQueue(ids[ids.length-2]),ids[ids.length-1]);
 assert.equal(player.nextInQueue(ids[ids.length-1]),null);
 assert.equal(player.nextInQueue("unknown"),null);
 assert.equal(player.setAutoplayNext(true),true);
 assert.equal(player.state().autoplayNext,true);
 assert.equal(player.setAutoplayNext(false),false);
 assert.equal(player.state().autoplayNext,false);
});
test("Next-episode preference is accessible, persisted, and only starts following a natural end",()=>{
 const src=read("podcast-player.js");
 assert.match(src,/autoplayNext:data.autoplayNext/);
 assert.match(src,/saved\.autoplayNext===true/);
 assert.match(src,/data\.autoplayNext\?nextInQueue\(finished\):null/);
 assert.match(src,/startAtBeginning:true/);
 assert.match(src,/id="podcastAutoplayNext"/);
 assert.match(src,/type="checkbox"/);
 assert.match(src,/Last podcast in this list/);
 assert.match(src,/a\.addEventListener\("ended"/);
 assert.match(read("index.html"),/Autoplay next podcast/);
 assert.match(read("site.css"),/\.podcast-autoplay input:focus-visible/);
});
