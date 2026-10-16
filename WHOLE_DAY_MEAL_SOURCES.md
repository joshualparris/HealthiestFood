# Whole-day meal planner: historical source coverage and limitations

**Added 17 October 2026 (Australia/Sydney).** The website now contains **four original V6 freezer lunches** and **13 additional adult meal suggestions**: four breakfasts, five dinners and four snacks. A real local-date calendar permits selecting any day, assigning meals at editable 24-hour times, marking meals done, adding or removing slots and copying a day to the next day. Planning data is kept in browser `localStorage`, not a Google Calendar or cloud database.

## Google Drive sources reviewed

The owners' personal and family Drive accounts contain meal-planning information outside the freezer-lunch archive:

- An earlier **cheap weekly family meal-plan document** includes breakfasts of oats + banana + walnuts, berries/spinach/chia smoothies, eggs with greens/mushrooms; dinners such as lentil soup with brown rice, roast chicken and vegetables, bean chilli, fish with quinoa and stir-fries; snacks including vegetable sticks with hummus, fruit + nut butter and hard-boiled eggs. Its content had older household dietary constraints, dairy-containing alternatives and child meal suggestions, so **none is copied wholesale**. The new website versions are explicitly dairy-free *subject to actual label review* and are specified as **adult** recipe suggestions.
- Older **family meal-planning sheets (2019–2023)** provide further examples of family dinners, including chicken/rice/vegetables and vegetable stir-fries. These sheets are historical plans, **not evidence each recipe was cooked or tested**.
- A **circadian-rhythm and family resilience research document** includes example times of **7:30am breakfast, 12:30pm lunch and about 5:00–5:30pm dinner**, plus advice about avoiding heavy late meals. It contains **research interpretations, not personalised, experimentally validated meal-time prescriptions**. Some claims about fasting, autophagy, HRV and life extension are overstated for translation into a compulsory family schedule.
- An earlier **dietary nutrition research document** reviews vegetables, fish, nuts, legumes, dairy-free calcium and possible nutrient gaps. Its scientific confidence varies, so it is **context only**, not a validated source for exact calories or mortality benefits.

**Privacy:** The public repository does not publish original private Google Drive documents, access tokens, household schedules, personal health conditions or children's food/feeding instructions. The app's sample recipes are reauthored adult suggestions, not a public mirror of private Drive files.

## What the UI actually does

- **Discover** retains the original four V6 featured lunch recipes.
- **Recipes** filters by **All, Breakfast, Lunch, Dinner, Snack** and scales each recipe from its own real base yield. Guided cooking retains the existing independent timer system.
- **My plan** starts on **the actual current date in Australia/Sydney**, regardless of browser/phone timezone. The week strip includes **Saturday and Sunday**, not only workdays. Choose another day with the 7-day strip, date picker, previous/next or **Today** buttons.
- Every date suggests editable example slots: **07:30 breakfast, 10:00 morning snack, 12:30 lunch, 15:30 afternoon snack and 18:00 dinner**. **18:00 is a flexible ordinary-family default**, not a contradiction of the older document's 17:00–17:30 example. Users can set any valid local time, add/delete meals, mark completion, or copy a day to tomorrow.
- If the browser stays open across midnight in Dubbo and the user was on the prior day's Today view, the planner advances automatically; manually selected historical/future dates are not forcibly changed.
- Plans persist **only on that browser/device**. This does **not** create Google Calendar events, send reminders/push notifications, upload personal meals to GitHub or automatically synchronise phones and computers.
- The **Shopping list continues to represent the four original V6 freezer-lunch batches only** at their historical estimated basket. Breakfast/dinner/snack prices, pack quantities and local Dubbo availability are **not checkout-verified** and are not automatically added to the lunch-shopping estimate.

## Nutrition safety and evidence

- No exact breakfast/dinner/snack nutrient totals or claims of the 'healthiest possible' recipe are presented. The 13 recipes are **proposed and kitchen-untested** with stated quantities and methods.
- Oats, bread, tofu, nut butters, soy products, yoghurt, tamari and hummus **may carry allergens or gluten/dairy cross-contact**; inspect purchased labels for individual needs.
- Check [NSW Food Authority food storage and leftovers advice](https://www.foodauthority.nsw.gov.au/consumer/food-extra-care/leftovers) for cooked rice, egg, chicken and leftovers. Cook chicken until **75°C at thickest centre**, and check fish cooking instructions. Children require age-appropriate serving sizes, choking precautions and nutritional advice, which this adult meal catalogue does not provide.
- The [Australian Heart Foundation healthy-eating pattern](https://www.heartfoundation.org.au/healthy-living/healthy-eating/heart-healthy-eating-pattern) supports vegetables, wholegrains, legumes, nuts, fish and unsaturated fats. **No specific meal time or listed recipe is proven to maximise lifespan.**

## Developer checks

Run `node --test tests/*.test.cjs`. The new `tests/whole-day.test.cjs` covers **Australia/Sydney midnight on 16→17 October 2026**, daylight-saving civil date stepping, the Saturday week view, all meal-type recipes and frontend wiring. Production is a static site deployed from the repository's `main` branch through Vercel. The public route is [healthiest-food.vercel.app/#plan](https://healthiest-food.vercel.app/#plan).
