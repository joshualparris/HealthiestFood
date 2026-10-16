/* Independent, real-clock cooking countdowns. Pure state functions; no network or timers.
 * Running timers use wall-clock deadlines so tab throttling does not lose elapsed time.
 * Browser notifications while the screen is locked are NOT guaranteed.
 */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FoodTimers = api;
})(typeof window !== 'undefined' ? window : undefined, function() {
  "use strict";
  const VALID = new Set(["running","paused","done"]);
  const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
  const idFor = (recipeId, stepIndex) => recipeId + ":" + stepIndex;
  function clean(raw) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    const out = {};
    for (const [id, t] of Object.entries(raw).slice(0, 80)) {
      if (!/^[a-z][a-z0-9-]{0,48}:\d{1,2}$/.test(id) || !t || !VALID.has(t.status)) continue;
      const durationSec = Number(t.durationSec);
      if (!Number.isFinite(durationSec) || durationSec <= 0 || durationSec > 24*60*60) continue;
      const stepIndex = Number(t.stepIndex), recipeId = String(t.recipeId || "");
      if (id !== idFor(recipeId,stepIndex)) continue;
      const remainingSec = clamp(Number(t.remainingSec) || 0, 0, durationSec);
      const deadline = Number(t.deadline) || null;
      out[id] = {
        id, recipeId, stepIndex, title: String(t.title || "Cooking").slice(0,120),
        durationSec, remainingSec, deadline: t.status === "running" && Number.isFinite(deadline) ? deadline : null,
        status: t.status === "running" && Number.isFinite(deadline) ? "running" : t.status === "running" ? "paused" : t.status
      };
    }
    return out;
  }
  function remaining(t, now) {
    if (!t) return 0;
    return t.status === "running" ?
      Math.max(0, Math.ceil((t.deadline - now)/1000)) : t.remainingSec;
  }
  function advance(raw, now) {
    const timers = clean(raw);
    const expired = [];
    for (const [id,t] of Object.entries(timers)) {
      if (t.status !== "running") continue;
      const left=remaining(t,now);
      if (left === 0) {
        timers[id] = {...t,status:"done",remainingSec:0,deadline:null};
        expired.push(id);
      } else timers[id] = {...t,remainingSec:left};
    }
    return {timers,expired};
  }
  function start(raw, id, meta, now) {
    const timers = advance(raw, now).timers;
    const durationSec = clamp(Math.round(meta.durationSec),1,24*60*60);
    const old=timers[id];
    const left=old && old.status !== "done" ? old.remainingSec : durationSec;
    timers[id]={id,recipeId:meta.recipeId,stepIndex:meta.stepIndex,title:meta.title,durationSec,remainingSec:left,deadline:now+left*1000,status:"running"};
    return timers;
  }
  function pause(raw,id,now) {
    const timers=advance(raw,now).timers, t=timers[id];
    if(t && t.status==="running")timers[id]={...t,status:"paused",remainingSec:remaining(t,now),deadline:null};
    return timers;
  }
  function reset(raw,id,now) {
    const timers=advance(raw,now).timers,t=timers[id];
    if(t)timers[id]={...t,status:"paused",remainingSec:t.durationSec,deadline:null};
    return timers;
  }
  function remove(raw,id) {
    const timers=clean(raw);delete timers[id];return timers;
  }
  function format(seconds) {
    const total=Math.max(0,Math.ceil(seconds)),min=Math.floor(total/60),sec=total%60;
    return String(min).padStart(2,"0")+":"+String(sec).padStart(2,"0");
  }
  return {idFor,clean,advance,start,pause,reset,remove,remaining,format};
});
