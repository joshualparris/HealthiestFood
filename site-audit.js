/* Transparent claim ledger. No external requests, accounts or analytics. */
(() => {
  "use strict";
  const metrics = [
   ["Vegetables & colour",9,9,9,9],
   ["Legumes & fibre",9,9,10,9],
   ["Wholegrain quality",9,9,9,9],
   ["Protein consistency",9,9,9,9],
   ["Unsaturated fat quality",9,9,9,9],
   ["Omega-3 coverage",10,9,7,7],
   ["Micronutrient breadth",8,8,8,8],
   ["Sodium & added-sugar restraint",8,9,9,9],
   ["Energy & satiety suitability",8,8,8,8],
   ["Cooking safety & repeatability",9,8,9,9]
  ];
  const claims = [
   {title:"Mediterranean-style eating can support heart health",status:"Guideline + trial evidence",kind:"support",detail:"The corrected PREDIMED study tested long-term Mediterranean eating patterns in adults at higher cardiovascular risk. It did not test any of these particular bowls, supermarkets or individual lifespan gains.",url:"https://www.nejm.org/doi/10.1056/NEJMoa1800389"},
   {title:"Sardines: 110 g tin, approximately 75 g drained fish",status:"Label verified",kind:"support",detail:"John West lists one 75 g edible serving, 13.9 g protein and 176 mg sodium. Eight tins correspond to approximately 600 g edible fish. Weigh drained food if precision matters.",url:"https://www.woolworths.com.au/shop/productdetails/98523"},
   {title:"Coho salmon: four raw 125 g portions per pack",status:"Label verified",kind:"support",detail:"Ocean Chef 500 g contains four 125 g raw portions, around 24.4 g protein each. V6 needs five portions (625 g raw); 375 g remains from two packs, provided unused fish is kept frozen. Raw weight is not cooked weight.",url:"https://www.woolworths.com.au/shop/productdetails/6050076"},
   {title:"Hard tofu: high protein, but calcium remains unquantified",status:"Partly verified",kind:"caution",detail:"Evergreen lists 24 g protein/100 g and calcium sulphate as an ingredient, but does not publish calcium in mg. We should not claim it supplies a precise calcium target.",url:"https://www.woolworths.com.au/shop/productdetails/595465"},
   {title:"Fortified soy can support a dairy-free diet",status:"Label verified",kind:"support",detail:"So Good High Protein Soy lists 10 g protein and about 400 mg calcium per 250 mL. It also has 1.8 g sugars and 163 mg sodium per serve and contains cane sugar and maltodextrin. It is optional if calcium needs are met elsewhere.",url:"https://www.woolworths.com.au/shop/productdetails/6021686"},
   {title:"Oily fish 2–3 times per week; plant omega-3 also useful",status:"Australian recommendation",kind:"support",detail:"Heart Foundation guidance supports oily fish twice or three times weekly, with walnuts and flax as plant ALA sources. ALA is not the same as marine DHA/EPA; count fish eaten at other meals too.",url:"https://www.heartfoundation.org.au/healthy-living/healthy-eating/omega-3-omega-6-heart-health"},
   {title:"Cool meals quickly and reheat rice only once",status:"NSW food safety",kind:"support",detail:"The NSW Food Authority recommends shallow portions and fridge/freezer within two hours, cooked rice refrigerated at most two days, leftovers frozen up to three months and reheated to steaming hot.",url:"https://www.foodauthority.nsw.gov.au/consumer/food-extra-care/leftovers"},
   {title:"$256.43 estimated Woolworths basket",status:"Arithmetic yes · prices unverified",kind:"caution",detail:"The 35 V6 shopping rows total $256.43 as an indicative first shop, with optional five litres soy and many leftover pantry ingredients. We have NOT accessed a live selected-store Dubbo basket, confirmed stock or guaranteed checkout prices.",url:"https://github.com/joshualparris/HealthiestFood/blob/main/v6/SHOPPING.md"},
   {title:"All meals are 'perfect 100/100' for longevity",status:"Not supported",kind:"limit",detail:"No validated universal numerical score or trial demonstrates the healthiest possible lunch. The /100 table is an explicitly subjective organising rubric, not a medical outcome or lifespan prediction.",url:"https://github.com/joshualparris/HealthiestFood/blob/main/v6/EVIDENCE.md"},
   {title:"Exact calories, calcium, vitamin D, iodine and iron are guaranteed",status:"Not established",kind:"limit",detail:"Full nutrient totals depend on labels, cooking losses, edible weights, quantity eaten, fortification and the remainder of the day's food. A complete measured ingredient-level nutrient-database analysis has not yet been done.",url:"https://github.com/joshualparris/HealthiestFood/blob/main/SITE_FACT_CHECK.md"},
   {title:"Naturally gluten-free ingredients guarantee allergy safety",status:"Conditional",kind:"caution",detail:"Rice/quinoa/vegetables are naturally gluten-free ingredients, but the finished meal's strict gluten suitability depends on every purchased label, precautionary allergen warnings and handling. Allergen needs are individual.",url:"https://www.foodstandards.gov.au/consumer/labelling/allergen-labelling"},
   {title:"More vegetables, more seeds or more expensive ingredients always increase lifespan",status:"Not established",kind:"limit",detail:"Dietary-pattern quality, adequate intake, variety, tolerability and consistency matter. There is no reliable trial showing a premium brand, an ever-larger seed serving or maximum meal fibre is automatically better.",url:"https://www.nhmrc.gov.au/adg"}
  ];
  const scoreRoot = document.getElementById("auditScores");
  if(scoreRoot) {
    const sums = [0,1,2,3].map(i=>metrics.reduce((sum,row)=>sum+row[i+1],0));
    scoreRoot.innerHTML =
      '<div class="audit-rating-chips">'+['A · Sardines','B · Salmon','C · Lentils','D · Black beans'].map((label,i)=>
       '<div class="audit-rating"><span>'+label+'</span><strong>'+sums[i]+'<small> / 100</small></strong></div>').join('')+'</div>'+
      '<div class="audit-table-wrap"><table class="audit-table"><thead><tr><th>Nutrition dimension</th><th>A / 10</th><th>B / 10</th><th>C / 10</th><th>D / 10</th></tr></thead><tbody>'+
      metrics.map(r=>'<tr><th>'+r[0]+'</th>'+r.slice(1).map(n=>'<td>'+n+'</td>').join('')+'</tr>').join('')+
      '</tbody></table></div><p class="audit-note">Source: V6/EVIDENCE.md. These equal-weight points are <strong>opinion-based</strong>, not calibrated against health outcomes. The rotation matters more than which bowl scores two points higher.</p>';
  }
  const claimsRoot = document.getElementById("auditClaims");
  if(claimsRoot) claimsRoot.innerHTML = claims.map(claim=>
    '<details class="audit-claim '+claim.kind+'"><summary><span class="claim-title">'+claim.title+'</span><span class="claim-status">'+claim.status+'</span><span class="claim-chevron" aria-hidden="true">＋</span></summary>'+
    '<div class="claim-body"><p>'+claim.detail+'</p><a href="'+claim.url+'" target="_blank" rel="noopener noreferrer">Review source ↗</a></div></details>'
  ).join('');
})();