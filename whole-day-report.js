/* Visual report from real date-specific planned recipes; local only.
 * Every number is a modelled partial pre-cooking input, not a validated meal nutrient total.
 */
(function(){
"use strict";
const esc=v=>String(v).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const nf=(x,d=0)=>Number.isFinite(x)?Number(x).toLocaleString("en-AU",{maximumFractionDigits:d,minimumFractionDigits:d}):"Unknown";
const units={kj:"kJ",protein:"g",fibre:"g",calcium:"mg",iron:"mg",iodine:"µg",sodium:"mg",b12:"µg",vitaminD:"µg"};
let startDate=null;
function render(){
 const root=document.getElementById("wholeDayReport"),P=window.FoodPlannerCore,A=window.FoodDayAnalysis,D=window.FOOD_DATA;
 if(!root||!P||!A||!D)return;
 if(!startDate)startDate=P.today();
 const dates=Array.from({length:7},(_,i)=>P.shift(startDate,i));
 const detail=A.week(dates,P.getSlots||P.makeDefaults,D.recipes);
 const rows=D.recipes.map(r=>({recipe:r,calc:A.analyze(r,1)}));
 const tr=(s,ns)=>'<tr><th scope="row">'+esc(s)+'</th>'+ns.map(n=>'<td>'+n+'</td>').join("")+'</tr>';
 const fmt=(o,k,dec=0)=>o.subtotal[k]===null||(o.unknown[k]>0&&["calcium","iodine"].includes(k)&&o.subtotal[k]===0)?"Unknown":nf(o.subtotal[k],dec)+(o.unknown[k]>0?'*':'');
 const dayFmt=(d,k,dec=0)=>d.subtotal[k]===null||(d.incomplete[k]&&["calcium","iodine"].includes(k)&&d.subtotal[k]===0)?"Unknown":nf(d.subtotal[k],dec)+(d.incomplete[k]?'*':'');
 root.innerHTML=
 '<div class="page-head"><span class="section-kicker">OFFICIAL AUSTRALIAN FOOD DATA · PARTIAL MODEL</span><h2>All 17 meals, <em>measured against evidence.</em></h2><p>Ingredient models from <a href="https://www.foodstandards.gov.au/science-data/food-nutrient-databases/afcd/data-files" target="_blank" rel="noopener noreferrer">FSANZ AFCD Release 3</a> and labelled Woolworths products. Values below are <strong>raw/dry/drained-ingredient subtotals per adult portion</strong>, not tested finished-food totals. Missing inputs and preparation losses prevent a certified nutrient-adequacy conclusion.</p></div>'+
 '<div class="whole-day-scroll" tabindex="0" role="region" aria-label="Scrollable recipe and daily nutrient table"><table class="audit-table whole-day-table"><caption>17 recipes · sources and unknowns visible</caption><thead><tr><th>Meal</th><th>kJ*</th><th>Protein g*</th><th>Fibre g*</th><th>Calcium mg*</th><th>Iron mg*</th><th>Iodine µg*</th><th>Mapped ingredients</th></tr></thead><tbody>'+
 rows.map(({recipe,calc})=>tr(recipe.name,[fmt(calc,"kj"),fmt(calc,"protein",1),fmt(calc,"fibre",1),fmt(calc,"calcium"),fmt(calc,"iron",1),fmt(calc,"iodine",1),calc.matched+"/"+calc.inputs])).join("")+'</tbody></table></div>'+
 '<p class="whole-day-asterisk">* A number means a <strong>modelled subtotal</strong>, not that all the meal’s nutrients have been calculated. An asterisk beside a value means at least one ingredient was missing for that nutrient. A generic food may not match your brand, and some raw/frozen/cooked states or edible weights are only approximated. <strong>Unknown is not zero.</strong></p>'+
 '<div class="whole-day-controls"><h3>Your next seven dated days</h3><label for="wholeDayStart">Start date <input type="date" id="wholeDayStart" value="'+startDate+'"></label><p>Uses the exact meal slots currently saved on this device. Dinner family portions are normalised to <strong>one adult serving</strong> for the nutrient figures; the shopping plan separately uses your chosen household portions. Marked-done meals are omitted from future-intake subtotals, so a completed past day will show only remaining meals.</p></div>'+
 '<div class="whole-day-scroll" tabindex="0" role="region" aria-label="Scrollable recipe and daily nutrient table"><table class="audit-table whole-day-table"><caption>Example mapped daily nutrient subtotals, not validated whole-diet daily totals</caption><thead><tr><th>Date</th><th>Meals remaining</th><th>kJ*</th><th>Protein g*</th><th>Fibre g*</th><th>Calcium mg*</th><th>Iodine µg*</th></tr></thead><tbody>'+
 detail.map(d=>tr(new Intl.DateTimeFormat("en-AU",{timeZone:"UTC",weekday:"short",day:"numeric",month:"short"}).format(new Date(d.date+"T12:00:00Z")),[esc(d.meals.map(m=>m.type).join(", ")||"None"),dayFmt(d,"kj"),dayFmt(d,"protein",1),dayFmt(d,"fibre",1),dayFmt(d,"calcium"),dayFmt(d,"iodine",1)])).join("")+'</tbody></table></div>'+
 '<details class="whole-day-caveats"><summary>Why these figures cannot yet certify a healthy, complete seven-day diet</summary><p>Some ingredient-to-food matches are only generic proxies: e.g. unknown pumpkin cultivar, Atlantic versus coho salmon, frozen mixed berries assumed 50:50 blueberry/strawberry, mixed broccoli/cauliflower assumed 50:50, unspecified edible fruit weights, eggs assumed 50 g each and dry-versus-cooked weights. Soy alternatives and tofu nutrient panels vary by brand; calcium from generic tofu must not be presented as verified for Evergreen. Unmapped ingredients such as bread or ambiguous nut butter are omitted; their nutrients are not zero. Frying/roasting, cooking water and nutrient retention are not modelled. Sodium estimates can be skewed by substitutions and cooking additions; no nutrient threshold or deficiency should be inferred from this table. The purpose is to direct precise verification, not claim extra years of life.</p><p>Sources: <a href="https://www.foodstandards.gov.au/science-data/food-nutrient-databases/afcd/data-files" target="_blank" rel="noopener noreferrer">Official AFCD3 file</a>, product labels listed in the existing Science ledger, and <a href="https://github.com/joshualparris/HealthiestFood/blob/main/WHOLE_SITE_EVIDENCE_REVIEW_2026-10-17.md" target="_blank" rel="noopener noreferrer">full evidence audit</a>.</p></details>';
}
function init(){const root=document.getElementById("wholeDayReport");if(!root)return;root.addEventListener("change",e=>{if(e.target.id==="wholeDayStart"&&window.FoodPlannerCore?.validDate(e.target.value)){startDate=e.target.value;render();}});render();}
window.FoodDayReport={render,init};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
