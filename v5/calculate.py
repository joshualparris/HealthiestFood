"""Reproduce V5 planning estimates. Python 3, no dependencies.
Energy/protein only: no claim of full nutrient or clinical accuracy.
Label sources and generic assumptions are documented in EVIDENCE.md.
"""
from collections import defaultdict
import json
# kcal and protein g per 100 g; oil is per 100 mL. G = generic planning assumption.
foods = {
 'sardines': (844/4.184,18.5,'label'), 'salmon': (1100/4.184,20,'label'),
 'tofu': (490/4.184,17.9,'label'), 'rice_dry': (1450/4.184,7.9,'label'),
 'quinoa_dry': (370,14,'G'), 'lentils_dry': (330,25,'G'),
 'chickpeas_drained': (120,6,'G'), 'blackbeans_drained': (451/4.184,7.8,'label'),
 'tomato':(25,1,'G'), 'brassicas':(30,2.5,'G'), 'carrot':(40,1,'G'),
 'capsicum':(30,1,'G'), 'zucchini':(20,1.2,'G'), 'onion':(40,1.1,'G'),
 'spinach':(25,2.5,'G'), 'peas':(75,5,'G'), 'kale':(35,3,'G'),
 'pumpkin':(40,1,'G'), 'mushrooms':(25,3,'G'), 'oil_ml':(810,0,'G'),
 'walnuts':(650,15,'G')}
recipes={
 'A Sardine':{'sardines':600,'quinoa_dry':150,'chickpeas_drained':500,'tomato':400,'brassicas':400,'carrot':250,'capsicum':200,'zucchini':200,'onion':100,'spinach':150,'oil_ml':25,'walnuts':50},
 'B Salmon':{'salmon':750,'rice_dry':150,'chickpeas_drained':400,'brassicas':500,'carrot':250,'peas':250,'kale':150,'onion':100,'oil_ml':25,'walnuts':50},
 'C Lentil curry':{'tofu':750,'lentils_dry':175,'rice_dry':150,'tomato':400,'pumpkin':500,'carrot':250,'brassicas':300,'spinach':150,'onion':150,'oil_ml':25,'walnuts':50},
 'D Smoky tofu beans':{'tofu':750,'blackbeans_drained':500,'quinoa_dry':150,'tomato':400,'mushrooms':300,'capsicum':300,'zucchini':300,'kale':150,'onion':150,'oil_ml':25,'walnuts':50}}
# Unit basis: quantity bought, price allowance for that quantity, amount consumed.
# Produce amounts are edible recipe weights; where bought heavier, charge trims too.
basket=[
 ('Sardines, 8 x 110 g tins',600,29.60,600),('Salmon, 2 x 500 g packs',1000,50,750),
 ('Pureland high-protein tofu, 3 x 500 g',1500,18,1500),('Quinoa 1 kg',1000,11.50,300),
 ('Brown rice 1 kg',1000,2.50,300),('Red split lentils 1 kg',1000,4,175),
 ('Chickpeas, 4 x 420 g',1000,4.80,900),('Black beans, 2 x 400 g',500,5,500),
 ('Tomatoes, 3 x 400 g',1200,4.50,1200),('Frozen brassicas, 3 x 500 g',1500,13.50,1200),
 ('Carrots 1 kg',1000,2.50,750),('Capsicum about 650 g',500,6.50,500),
 ('Zucchini about 550 g',500,3.80,500),('Onions 1 kg',1000,3,600),
 ('Baby spinach, 2 x 280 g bags',560,10,300),
 ('Frozen peas 1 kg',1000,5.20,250),('Kale 2 bunches, at least 300 g leaves',300,7,300),
 ('Pumpkin about 700 g',500,2.80,500),('Mushrooms 300 g',300,4,300),
 ('EVOO 500 mL',500,10,100),('Walnuts 200 g',200,6,200),
 ('Lemons 4 medium',4,4.80,4),('Garlic 2 bulbs',2,2.40,2),('Ginger 50 g',50,1.50,30),
 ('Cumin jar',1,2.50,1),('Paprika jar',1,2.50,1),('Oregano jar',1,2,1),
 ('Coriander jar',1,2.50,1),('Turmeric jar',1,2.50,1),('Black pepper jar',1,3,1),
 ('Iodised salt optional pack',1,1.50,1)]

def results():
 out={}
 for name, ingredients in recipes.items():
  kcal=sum(foods[k][0]*v/100 for k,v in ingredients.items())/5
  protein=sum(foods[k][1]*v/100 for k,v in ingredients.items())/5
  out[name]={'kcal_rounded_10':round(kcal/10)*10,'protein_rounded_g':round(protein),'planning_kcal_20pct_band':[round(kcal*.8/10)*10,round(kcal*1.2/10)*10]}
 return out
if __name__=='__main__':
 totals=defaultdict(float)
 for ingredients in recipes.values():
  for k,v in ingredients.items(): totals[k]+=v
 assert len(recipes)*5==20
 assert totals['tofu']==1500 and totals['oil_ml']==100 and totals['walnuts']==200
 print(json.dumps({'per_meal':results(),'ingredient_totals':dict(totals),'core_checkout':round(sum(r[2] for r in basket),2),'allocated_core_cost':round(sum(r[2]*r[3]/r[1] for r in basket),2)},indent=2))
