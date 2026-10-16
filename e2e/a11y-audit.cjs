/* Automated axe-core multi-state audit; it does not replace physical keyboard/screen-reader tests.
 * CI uploads evidence rather than declaring the site WCAG certified.
 */
'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.webmanifest':'application/manifest+json','.webp':'image/webp'};
const server=http.createServer((req,res)=>{
 const filename=new URL(req.url,'http://localhost').pathname.replace(/^\//,'')||'index.html';
 const full=path.resolve(root,decodeURIComponent(filename));
 if(!full.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
 fs.readFile(full,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return}res.writeHead(200,{'Content-Type':MIME[path.extname(full)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data)});
});
const wait=()=>new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
async function main(){
 await wait();
 const host='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true});
 const axe=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
 const targets=[
  {id:'home-mobile',url:'/#home',width:390},
  {id:'recipes-mobile',url:'/#recipes',width:390},
  {id:'plan-mobile',url:'/#plan',width:390},
  {id:'shop-mobile',url:'/#shop',width:390},
  {id:'science-mobile',url:'/#science',width:390},
  {id:'podcasts-mobile',url:'/#media',width:390},
  {id:'guide-mobile',url:'/#guide',width:390},
  {id:'cooking-lab-mobile',url:'/#lab',width:390},
  {id:'home-desktop',url:'/#home',width:1280},
  {id:'shop-desktop',url:'/#shop',width:1280}
 ];
 const report={auditedAt:new Date().toISOString(),method:'axe-core (WCAG tagged rules), representative app routes, no assertion of full WCAG conformance',targets:[],totals:{}};
 try{
 for(const x of targets){
  const p=await browser.newPage({viewport:{width:x.width,height:850}});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(host+x.url,{waitUntil:'domcontentloaded',timeout:30000});
  await p.waitForTimeout(500);
  if(x.id.startsWith('shop'))await p.locator('#customShopping').waitFor();
  if(x.id.startsWith('guide'))await p.locator('#foodGuideFrame').waitFor();
  if(x.id.startsWith('cooking-lab'))await p.locator('#foodLabFrame').waitFor();
  await p.addScriptTag({content:axe});
  const found=await p.evaluate(async()=>{
   const result=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}});
   return {passes:result.passes.length,incomplete:result.incomplete.length,violations:result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,helpUrl:v.helpUrl,affected:v.nodes.slice(0,12).map(n=>({target:n.target,summary:n.failureSummary}))}))};
  });
  report.targets.push({...x,errors,...found});
  console.log(x.id,'violations',found.violations.length,'serious/critical',found.violations.filter(v=>['serious','critical'].includes(v.impact)).length,'JS errors',errors.length);
  for(const v of found.violations)console.log('A11Y_ISSUE',x.id,v.id,v.impact,JSON.stringify(v.affected.slice(0,3).map(n=>({target:n.target,summary:n.summary?.slice(0,180)}))));
  await p.close();
 }
 report.totals={states:report.targets.length,violations:report.targets.reduce((n,x)=>n+x.violations.length,0),seriousOrCritical:report.targets.reduce((n,x)=>n+x.violations.filter(v=>['serious','critical'].includes(v.impact)).length,0),runtimeErrors:report.targets.reduce((n,x)=>n+x.errors.length,0)};
 const dest=path.join(root,'a11y-audit-report.json');fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n');
 console.log('REPORT',dest,JSON.stringify(report.totals));
 // Audit findings remain visible via artifact without pretending a machine scan is WCAG certification.
 }finally{await browser.close();server.close()}
}
main().catch(e=>{console.error(e.stack||e);process.exitCode=1;server.close()});
