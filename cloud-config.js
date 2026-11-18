/* Deployment setting. Primary Supabase organisation selected; dedicated project NOT CREATED (free quota blocked).
 * Do not paste server secrets or service_role keys here.
 * After a free project slot becomes available, or a paid upgrade is separately authorised:
 *  - apply supabase/migrations/20261118_healthiestfood_private_sync.sql to that project
 *  - set its Auth site URL and allowed redirects to your real HealthiestFood HTTPS site
 *  - update ONLY the project URL and public sb_publishable_ key here
 *  - test two separate users for row isolation and two devices for CAS conflicts
 */
window.FOOD_CLOUD_CONFIG={enabled:false,url:"",publishableKey:""};
