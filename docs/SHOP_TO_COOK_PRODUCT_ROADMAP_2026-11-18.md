# Shop → Cook → Freeze product roadmap (18 November 2026)

**Goal:** reduce the number of screens between arriving at Woolworths Dubbo and safely putting ten dairy-free work lunches into the freezer.

**Baseline audit:** HealthiestFood already includes recipes, meal planner, ingredient canonical IDs, day/week shopping reconciliation, dated pantry packs, guided timers, food-handling log, offline PWA, private export/import, and freezer labels. Avoid duplicating existing capabilities without evidence.

## Competitor lessons

| Product | Observed feature | Our opportunity |
|---|---|---|
| [Paprika](https://paprikaapp.com/help/v3/android/) | Pantry-to-list reconciliation, cook view, ingredient crossing and timers | Show owned amounts vs required grams; quick shop-to-cook path |
| [AnyList](https://help.anylist.com/articles/meal-plan-queue/) | Queue recipes without scheduling | Immediate cook-tonight experience |
| [Mealime](https://support.mealime.com/article/151-getting-started-guide) | Simple meal to grocery list; pantry exclusions | Combine the two recipes and shopping into a single session |
| [Samsung Food](https://play.google.com/store/apps/details?id=com.foodient.whisk&hl=en_AU) | Smart guided cooking and ingredient lists | Receipt/pack scanning with explicit human confirmation |

## P0 — implemented in feature branch

- [x] Direct cook-ten-lunches link from home, recipes and shopping views.
- [x] Full 5+5 batch plan anchored to [November research](WOOLWORTHS_DUBBO_FREEZER_LUNCH_RESEARCH_2026-11-18.md).
- [x] **Quantity-aware** remaining list: if 1 of 2 salmon tins entered, 1 tin is missing; if 280 g of 400 g greens entered, 120 g remain.
- [x] Photo clues marked unverified, never silently assumed bought.
- [x] Aisle-grouped shopping list with missing-items copy action.
- [x] Guided sequential 18-step path: setup → grain → salmon → tofu → rapid chilling/freezing.
- [x] Browser-local progress, confirmation before reset.
- [x] Ten printable dated freezer labels.
- [x] Dairy cross-contact and cooling warnings; no live Dubbo stock claims.
- [x] Offline cache and same-origin embedded route; accompanying source and regression tests.
- [ ] Physical ten-container cooling-capacity verification (requires home kitchen).
- [ ] Actual Woolworths receipt and exact label verification (requires purchased items).

## P1 — next implementation passes

- [ ] Integrate existing pantry-lot quantities into cook-up as a **review before deduction**, never blind subtraction.
- [ ] Opt-in basket or receipt scanning with editable recognised entries, visible confidence and privacy protection; do not use photos alone to assert allergens.
- [ ] Barcode/SKU label matching, drained yields and date-stamped Dubbo store prices.
- [ ] Coordinated multi-recipe timers using existing timers.js and recipe-timer-purposes.js modules, with dependency-aware steps and safe timer restoration.
- [ ] Live weighed substitution management: fresh/frozen broccoli, bok choy/spinach, pumpkin/sweet potato, recalculating actual needed amounts.
- [ ] Pre-cook fridge-space and cooling-capacity check connected to existing food-handling log and possible two-session fallback.
- [ ] Real weighed cooked yields, portion labels, freezer inventory, meal consumption and thawing schedule.
- [ ] Accessible one-step Android cooking mode, larger text and screen-awake opt-in.
- [ ] Integrate ten-lunch state into existing private local backup/export.
- [ ] Register these recipes via existing canonical recipe/ingredient and FSANZ AFCD3 pipelines, with explicit provisional nutrient caveats.

## P2 — longer-term

- [ ] Opt-in, privacy-safe cross-device synchronisation and family collaboration.
- [ ] Store-specific live stock/price verification with freshness, evidence and SKU.
- [ ] Weekly meal rotation based on pantry, food preferences, time and budget, avoiding unrequested medical inference.
- [ ] Whole-day nutrient analysis, bioavailability and realistic uncertainty; no invented longevity scores.
- [ ] Browser/device playtests on Android Chrome, Samsung Internet, desktop and offline mode.

## Verification gates

1. Run node --test tests/*.test.cjs; no existing tests regress.
2. Open cook page directly and via in-app frame; ensure mobile usability and preserved audio.
3. Test salmon quantity 1/2 and spinach 280/400 calculations.
4. Reload and verify local-only persistence; test explicit reset confirmation.
5. Verify exactly ten freezer labels and print-only label layout.
6. Verify offline caching after first online visit (network-first, data freshness notice).
7. Review chilling and allergen warnings; do not treat step completion as food-safety proof.
8. Check CI + production deployment and confirm actual content, not merely a status label.

## Limits of initial release

This is a companion flow, not yet the canonical 17-recipe catalogue or shared household pantry. No automatic image/receipt recognition, confirmed local checkout prices, verified complete nutrient micronutrients, clinical claims, measured cooked yields or observed kitchen temperatures. Labels use the current Sydney-local print date and should be corrected if batch cooked another day. Existing app timers and advanced food safety records remain separate until deliberate integration.
