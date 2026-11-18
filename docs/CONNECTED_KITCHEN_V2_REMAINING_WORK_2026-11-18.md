# Connected Kitchen V2: implementation and remaining gates (18 November 2026)

Status: Implemented code is not the same thing as a verified, enabled third-party integration. No household data, private credentials, receipts or Supabase secrets are committed to the public repository.

## Delivered in V2
- Date-aware pantry-first meal ranking: excludes lots past their recorded use-by and prioritises compatible lots due soon. A date cannot prove correct storage.
- Seven-day meal suggestions that balance approximate mapped-pack prices, some variety and recorded pantry. Unpriced items make full budget compliance unknowable. Never a scientifically validated optimal diet.
- Reviewed substitutions with separate adapted recipes, adjusted shopping quantities and explicit invalidation of old nutrition/cooking assumptions; manual source-step review required.
- User-reviewed imported recipes with measured ingredients and cooking steps join the actual app recipe library, planner and shopping view. Entries without usable measured quantities are refused.
- User-observed aisle-number mapping. These are personal notes, not official Woolworths Dubbo store location data.
- Supabase owner-only snapshot schema and optimistic-concurrency sync client. Disabled without a dedicated authenticated project, authorised organisation selection and two-user test.
- Original photo OCR, barcodes, pantry, kitchen timers, offline 10-lunch guide, freezer stock, backups and calendar export preserved.

## What still requires development or outside access

| Feature | Current | Remaining |
|---|---|---|
| Cloud sync | RLS database and guarded push/pull client prepared, default DISABLED | Select organisation, approve project cost, create dedicated project, apply schema, configure Auth and verify two accounts/two devices |
| Family sharing | Manual private backup sharing | Family invitations, role boundaries and revocation after individual RLS sync is proven |
| Receipt/basket reading | OCR plus suggested keywords, confirmation required | Live actual receipt tests, robust product/pack identification and measured quantity extraction |
| Barcode scanning | Browser BarcodeDetector if available, manual entry and voluntary Open Food Facts | Physical handset test, product SKU/labels and allergen reconciliation |
| Recipe import | Structured page data/text and reviewed imports in main app | CORS-safe authorised URL imports and layout-aware photographed recipe interpretation |
| Intelligent planner | Seven-day heuristic pantry/cost rotation | Complete budget, preference and nutrient optimisation with actual verified prices |
| Food waste | Use-first dates, measured stock and freezer portions | Leftover allocation and shared-pack multiweek optimisation |
| Substitutions | Updated shopping and separately reviewed recipe | Fully reviewed cooking method changes and AFCD3 recomputation for the alternative |
| Micronutrient targets | Existing AFCD3 partial model | Actual product identities, cooking retention, iodine/calcium/vitamin D completeness |
| Calendar | Exportable .ics | Real provider OAuth and conflict-safe two-way Google/Outlook integration |
| Store aisle | User-recorded aisle numbers | Grounded actual Woolworths aisle map and accuracy checks |
| Voice cooking | Opt-in speech, timers and wake lock | Android device/permissions/lockscreen verification |
| Direct social videos | Copied captions/transcripts | Official provider access, rights and supported extraction |
| Smart appliances | Unconnected | Actual supported oven, vendor API, explicit consent and physical safety tests |

## Cloud activation gate
Two accessible Supabase organisations exist: joshualparris's Org (Primary) and joshuaparris-max's Org (second connection). The project creation integration explicitly requires the user's choice of organisation, and may require cost approval. Do not create the HealthiestFood database inside an unrelated existing project.

After selection:
1. Create a dedicated HealthiestFood project (Sydney region where available), wait for ACTIVE_HEALTHY.
2. Apply the owner-scoped migration in supabase/migrations/20261118_healthiestfood_private_sync.sql.
3. Test two independent authenticated users cannot read/write each other's records, including direct REST and RPC attempts.
4. Test concurrent stale revisions cannot overwrite a newer device's copy.
5. Configure allowed HTTPS login redirects and update only the public project URL and publishable key in cloud-config.js; never expose the server secret.
6. Test login, explicit push, initial download, offline behaviour, conflict and rollback against the live backend.
7. Only then consider automatic account syncing and opt-in household roles.

## Acceptance and validation
- Run the complete original and new Node tests.
- Browser-test the updated Smart Kitchen, user-imported recipes in the original app, live shopping/plan dates and old ten-lunch guide at both mobile and desktop widths.
- Test on published GitHub Pages, not only a deployed job indicator.
- Do not claim in-person barcode, photo OCR, microphone, fridge temperature, actual Woolworths stock or appliance control was physically verified.
- No user files or accounts should be changed through an unverified third-party service.

## Engineering order after V2
1. Approve and verify a dedicated cloud backend.
2. Add true product/pack identification with reviewed counts and compatible pantry units.
3. Finish complete nutrition and cost calculations with reliable brand/AFCD3/retail data.
4. Implement family sharing roles, revocation and cross-device conflict controls.
5. Add a calendar provider connection and verified two-way event mapping.
6. Integrate permitted social-content feeds and compatible kitchen devices, only where access and hardware exist.
