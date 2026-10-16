#!/usr/bin/env python3
"""V6 unit checks for purchase arithmetic. No dependencies or clinical nutrient claims."""
from decimal import Decimal
from collections import Counter
# A/B/C/D each 5 meals. Units in edible g (except oil mL, lemon mL).
batches = {
 "A":dict(sardines=600,chickpeas=504,quinoa_dry=150,tomatoes=400,brassicas=400,carrots=250,capsicum=200,zucchini=200,onion=100,spinach=150,oil_ml=25,garlic=10,lemon_ml=40,walnuts=50,oranges=5),
 "B":dict(salmon_raw=625,chickpeas=504,rice_dry=150,brassicas=500,carrots=250,peas=250,kale=150,onion=100,oil_ml=25,garlic=10,lemon_ml=40,walnuts=50,kiwis=5),
 "C":dict(tofu_raw=625,lentils_dry=200,rice_dry=150,tomatoes=400,pumpkin=500,carrots=250,brassicas=300,spinach=150,onion=150,oil_ml=25,garlic=10,ginger=30,lemon_ml=40,walnuts=50,flax=25,oranges=5),
 "D":dict(tofu_raw=625,blackbeans=504,quinoa_dry=150,tomatoes=400,mushrooms=300,capsicum=300,zucchini=300,kale=150,onion=150,oil_ml=25,garlic=10,lemon_ml=40,walnuts=50,flax=25,kiwis=5)
}
# AUD approximate full purchase packs for 35 lines in SHOPPING.md (not Woolworths Dubbo checkout).
prices = ["29.60","38.00","13.98","3.80","3.00","6.00","5.75","3.50","3.50","13.50","5.50","10.00","10.50","9.80","4.00","2.50","6.00","3.60","3.00","3.00","5.00","2.40","1.50","7.20","8.50","15.10","8.80","2.20","2.20","2.00","2.50","2.20","2.00","1.30","15.00"]
totals = Counter()
for b in batches.values():
    totals.update(b)
assert len(batches)==4
portion_counts = {name: 5 for name in batches}
assert sum(portion_counts.values()) == 20
assert totals["sardines"]==8*75
assert totals["salmon_raw"]==5*125
assert totals["tofu_raw"]==2*625
assert totals["chickpeas"]==4*252
assert totals["blackbeans"]==2*252
assert totals["tomatoes"]==3*400
assert totals["brassicas"]==1200 and totals["brassicas"]<=3*500
assert totals["quinoa_dry"]==300 and totals["rice_dry"]==300
assert totals["spinach"]==300 and totals["kale"]==300
assert totals["oil_ml"]==100 and totals["walnuts"]==200 and totals["flax"]==50
assert totals["oranges"]==10 and totals["kiwis"]==10
assert len(prices)==35
amount=sum(map(Decimal,prices))
assert amount==Decimal("256.43"), amount
print("All V6 recipe-total and pack arithmetic checks passed.")
print(f"35-line first shop: AUD {amount} / 20 lunches: AUD {amount/20:.2f} (includes pack leftovers).")
print(f"Without optional 5 L soy: AUD {amount-Decimal('15.00')}.")
print("Totals by edible/raw quantity:", dict(sorted(totals.items())))
print("IMPORTANT: Fish weights use LABEL ESTIMATES; store prices and nutritional adequacy NOT validated.")
