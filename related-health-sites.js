/* Public health and wellbeing deployments, checked 17 October 2026.
 * 13 public HTTP-200 destinations across 8 distinct apps.
 * No private repositories, raw measurements, personal medical archives or
 * account credentials are included. Availability is a point-in-time check.
 */
(function(){
"use strict";
const GROUPS=[
 {title:"Health information, longevity & symptoms",items:[
  {name:"HealthLens",type:"Personal health analysis",summary:"Explore wearable, recovery, nutrition and laboratory trends with your own data. This is for interpretation, not medical diagnosis.",links:[["Open HealthLens","https://health-lens-rust.vercel.app/"]]},
  {name:"HeartCalm",type:"Breathing & episode support",summary:"Palpitation and breathing support, episode notes and prompts to seek appropriate help when necessary.",links:[["Open HeartCalm","https://heart-calm-vert.vercel.app/"]]},
  {name:"Health Reference / Cold & Flu App",type:"Health education",summary:"General health reference, first aid, medicines and cold-and-flu learning. Always check current clinical guidance.",links:[["Open Health Reference","https://cold-flu-app.vercel.app/"]]}
 ]},
 {title:"Daily health, routines & dashboards",items:[
  {name:"JoshHub · Health",type:"Sleep, movement & nutrition",summary:"Health metrics, food, sleep, movement and daily routines. The same project has three working public deployment addresses.",links:[["Main health hub","https://josh-hub-two.vercel.app/health"],["Render backup","https://joshhub-backup.onrender.com/health"],["Earlier deployment","https://josh-hub-96no.vercel.app/health"]]},
  {name:"LifeHub Dashboard",type:"Lifestyle & wellbeing planning",summary:"Life planning and personal dashboards, with two working deployment editions.",links:[["Updated edition","https://lifehubdashboard-fixed.vercel.app/"],["Original edition","https://lifehubdashboard-one.vercel.app/"]]},
  {name:"Josh · Personal Intelligence Dashboard",type:"Personal overview",summary:"Broader life dashboard alongside the specialist health applications.",links:[["Open dashboard","https://josh-dashboard-black.vercel.app/app/dashboard.html"]]}
 ]},
 {title:"Relationships & emotional wellbeing",items:[
  {name:"HugCoach",type:"Relationship learning",summary:"Relationship reflection and learning tools. Both deployment domains currently show HugCoach.",links:[["HugCoach","https://hug-coach.vercel.app/"],["JoshCoach deployment","https://joshcoach.vercel.app/"]]},
  {name:"Ignite Us",type:"Relationship wellbeing",summary:"Relationship-focused wellbeing and reflection, including the original and newer deployed editions.",links:[["Ignite Us app","https://ignite-us-app.vercel.app/"],["Earlier edition","https://ignite-us-sage.vercel.app/"]]}
 ]}
];
const UNAVAILABLE=[
 {name:"HealthiestPeople · longevity case-study research",url:"https://joshualparris.github.io/HealthiestPeople/"},
 {name:"Sylvie’s Sleepy Stories · bedtime library",url:"https://joshualparris.github.io/Sleepy/"},
 {name:"FaithHub · faith and life resources",url:"https://joshualparris.github.io/FaithHub/"}
];
function add(parent,tag,text,cls){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==null)el.textContent=text;parent.append(el);return el;}
function link(parent,label,url){
 if(!/^https:\/\/[a-z0-9.-]+(?:\/[a-z0-9_/?=.%#&-]*)?$/i.test(url))throw Error("Unexpected external site URL");
 const a=add(parent,"a",label+" ↗");
 a.href=url;a.target="_blank";a.rel="noopener noreferrer";
 return a;
}
const root=document.getElementById("relatedHealthSites");
if(!root)return;
for(const group of GROUPS){
 add(root,"h3",group.title);
 const grid=add(root,"div",null,"grid");
 for(const site of group.items){
  const card=add(grid,"article",null,"card related-site");
  add(card,"span",site.type,"tag");
  add(card,"h4",site.name);
  add(card,"p",site.summary);
  const actions=add(card,"div",null,"related-actions");
  for(const [label,url] of site.links)link(actions,label,url);
 }
}
const details=add(root,"details",null,"related-offline");
add(details,"summary","Previously published sites that are not currently reachable");
add(details,"p","These three websites were previously listed as public, but returned HTTP 404 on 17 October 2026. They are recovery references, not working public sites.");
const list=add(details,"ul",null);
for(const site of UNAVAILABLE){const li=add(list,"li",null);link(li,site.name+" (currently 404)",site.url);}
const footer=add(root,"p",null,"muted related-provenance");
add(footer,"span","Independent apps do not share your browser storage or health records. Public availability was checked without signing in. ");
link(footer,"Read the deployment inventory","https://github.com/joshualparris/HealthiestFood/blob/main/docs/RELATED_HEALTH_DEPLOYMENTS_2026-10-17.md");
if(typeof window!=="undefined")window.RelatedHealthSites=Object.freeze({groups:GROUPS,unavailable:UNAVAILABLE});
})();
