"use strict";
const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const Labels=require("../freezer-labels.js");
const read=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");
const sample=(id,ingredients,name="Lemon bowl")=>({id,name,ingredients:ingredients.map(n=>[100,"g",n])});
test("Only four V6 lunches can be printed as freezer labels",()=>{
 assert.deepEqual(Labels.IDs,["a","b","c","d"]);
 assert.throws(()=>Labels.build(sample("sn-berries",["berries"]),{count:5,cooked:"2026-10-17",frozen:"2026-10-17"}),/only supports/i);
});
test("Dates use Sydney local civil date rather than UTC date",()=>{
 const time=new Date("2026-10-16T14:30:00Z");
 assert.equal(Labels.todaySydney(time),"2026-10-17");
 assert.equal(Labels.dateValid("2026-02-30"),false);
 assert.equal(Labels.dateValid("2026-02-28"),true);
 assert.equal(Labels.dateValid("2026-10-17"),true);
});
test("Printer makes one label per container, and does not invent safety expiry",()=>{
 const rows=Labels.build(sample("b",["raw salmon","dry brown rice"]),{count:5,cooked:"2026-10-17",frozen:"2026-10-18",note:"Additional lemon"});
 assert.equal(rows.length,5);
 assert.equal(rows[4].index,5);
 assert.match(rows[0].instructions,/rice a second time/);
 assert.match(rows[0].caution,/cannot be established/);
 assert.doesNotMatch(Labels.html(rows),/expiry date|use by date/i);
});
test("Invalid dates, backward freezing date and invalid count are rejected",()=>{
 const meal=sample("a",["sardines"]);
 for(const opts of [
 {count:0,cooked:"2026-10-17",frozen:"2026-10-17"},
 {count:21,cooked:"2026-10-17",frozen:"2026-10-17"},
 {count:5,cooked:"2026-10-18",frozen:"2026-10-17"},
 {count:5,cooked:"2026-02-30",frozen:"2026-03-01"}
 ])assert.throws(()=>Labels.build(meal,opts));
});
test("Optional note and recipe name are HTML-escaped",()=>{
 const rows=Labels.build(sample("c",["tofu"],'Curry <script>alert("x")</script>'),{count:1,cooked:"2026-10-17",frozen:"2026-10-17",note:'<img src=x onerror=alert(1)>'});
 const html=Labels.html(rows);
 assert.doesNotMatch(html,/<script|<img/);
 assert.match(html,/&lt;script&gt;/);
 assert.match(html,/&lt;img/);
});
test("Label page has a usable print action and source-linked safety disclaimer",()=>{
 const html=read("freezer-labels.html"),app=read("app.js");
 assert.match(html,/id="labelForm"/);
 assert.match(html,/id="labelPreview"/);
 assert.match(html,/FreezerLabels\?\.init\(\)/);
 assert.match(html,/foodauthority\.nsw\.gov\.au/);
 assert.match(app,/freezer-labels\.html\?recipe=/);
});

test("Freezer-label page and script are included in the returning-user offline cache",()=>{
 const sw=read("service-worker.js");
 assert.match(sw,/"\.\/freezer-labels\.html"/);
 assert.match(sw,/"\.\/freezer-labels\.js"/);
});
