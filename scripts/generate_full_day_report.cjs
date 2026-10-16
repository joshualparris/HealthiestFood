// Reproducible report based on official AFCD3 subset + matched retail labels.
// Raw input model, NEVER certified complete cooked-food nutritional totals.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const context={window:{},Intl,Date};vm.createContext(context);
for(const p of ['site-data.js','whole-day-data.js','afcd3-foods.js','nutrient-ledger.js','whole-day-analysis.js','food-planner.js'])vm.runInContext(read(p),context,{filename:p});
const {FOOD_DATA,FoodDayAnalysis:A,FoodPlannerCore:P,AFCD3_FOODS:AF}=context.window;
const start='2026-10-17',dates=Array.from({length:7},(_,i)=>P.shift(start,i));
const fmt=(obj,k,dec=1)=>{const v=obj.subtotal[k];return v===null?'Unknown':v.toFixed(dec)+(obj.unknown?.[k]>0?'†':'');};
let lines=[
 '# AFCD3 ingredient nutrient modelling — 17 adult recipes & 7 days',
 '',
 '**Generated from official FSANZ Australian Food Composition Database Release 3 generic food entries, supplemented with specific retailer labels.** The output is a **partial model of raw/dry/drained inputs** and assumed edible portions. This is **not a verified finished-food nutrient profile**, a clinical adequacy result, or a prediction of lifespan. Nutrient losses from cooking, exact brands, edible yields, mixed frozen vegetables and some ingredients remain unresolved. Blank values are never set to zero; a numeric subtotal may still omit some ingredients.',
 '',
 'Reference: '+AF.sourceUrl+'; original [food-pattern and limitations audit](WHOLE_SITE_EVIDENCE_REVIEW_2026-10-17.md); source mapper [whole-day-analysis.js](whole-day-analysis.js). Generated generic foods: '+AF.verifiedFoodIds+'.',
 '',
 '## Per adult meal portion: mapped ingredient subtotals',
 '',
 '| Recipe | Group | kJ† | Protein g† | Fibre g† | Calcium mg† | Iron mg† | Iodine µg† | B12 µg† | Vitamin D µg† | Ingredients mapped |',
 '|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|'
];
for(const r of FOOD_DATA.recipes){const c=A.analyze(r,1);lines.push('| '+r.name.replaceAll('|','/')+' | '+r.category+' | '+fmt(c,'kj',0)+' | '+fmt(c,'protein')+' | '+fmt(c,'fibre')+' | '+fmt(c,'calcium',0)+' | '+fmt(c,'iron')+' | '+fmt(c,'iodine')+' | '+fmt(c,'b12',2)+' | '+fmt(c,'vitaminD',2)+' | '+c.matched+'/'+c.inputs+' |');}
lines.push('','† **Subtotals only.** A † denotes at least one unmapped or nutrient-unknown component. No † does *not* certify cooking retention or brand equivalence. Sodium is modelled but actual added salt, drained yields and label substitutions may substantially change it. Do not compare these directly with daily RDIs.','',
 '## Seven-day sample menu: Saturday 17 to Friday 23 October 2026','',
 'This samples the app’s default Australia/Sydney schedule, **not a diet individually prescribed or evidence of actual consumption**. For nutrient sums, each named meal is modelled as **one adult serving**, even if the planner schedules a four-person dinner cook-up. Snacks are optional and the default includes two daily.','',
 '| Date | Breakfast | Lunch | Dinner | Optional snacks | kJ† | Protein g† | Fibre g† | Calcium mg† | Iodine µg† |',
 '|---|---|---|---|---|---:|---:|---:|---:|---:|'
);
const weekly=A.week(dates,P.makeDefaults,FOOD_DATA.recipes);
for(const day of weekly){const find=t=>day.meals.filter(m=>m.type===t).map(m=>FOOD_DATA.recipes.find(r=>r.id===m.recipeId)?.name||m.recipeId).join('; ');
 const parts=['kj','protein','fibre','calcium','iodine'].map(k=>day.subtotal[k]===null?'Unknown':day.subtotal[k].toFixed(k==='kj'||k==='calcium'?0:1)+(day.incomplete[k]?'†':''));
 lines.push('| '+day.date+' | '+find('breakfast')+' | '+find('lunch')+' | '+find('dinner')+' | '+find('snack')+' | '+parts.join(' | ')+' |');
}
lines.push('',
 '## What the model cannot determine','',
 'The exact purchased brands (except matched Woolworths panels), actual drained/cooked portion weights, vegetable variety and frozen mixture proportions, fruit edible yields, egg sizes, reliable calcium in Evergreen tofu, specific soy yoghurt composition, ingredient cooking losses, unscheduled water/drinks/foods, pregnancy/age-specific requirements, actual taste and food-safety compliance, and personal dietary adequacy. Some generic food nutrients are zero because official AFCD records report zero; **unknown is null**, not assumed zero. Some important ingredients have no appropriate match, and a seven-day subtotal does not establish full-day intake.',
 '',
 '## Next verification priorities','',
 '1. Weigh a real portion of each recipe before/after cooking and confirm the purchased labels, particularly the tofu calcium and soy-drink fortification.',
 '2. Fill remaining ingredient gaps, use correct food preparation state and scientifically justified retention factors rather than applying raw values to cooked serving weights.',
 '3. Complete a real Woolworths Dubbo checkout basket for the chosen week, clearly separating owned pantry stocks and uncertain estimates.',
 '4. Reassess the whole-day nutrient profile once breakfasts/dinners/snacks are actually eaten; do not infer longevity benefits from simulated numbers.',
 '',
 'Generated automatically by scripts/generate_full_day_report.cjs. No personal schedule is included; only default public meal templates.'
);
const out=path.join(root,'FULL_DAY_NUTRIENT_MODEL_2026-10-17.md');fs.writeFileSync(out,lines.join('\n')+'\n','utf8');
console.log('GENERATED',out,'17 recipes and',weekly.length,'days;',lines.length,'lines');
