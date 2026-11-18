/* Browser test: Drive is mocked; no Google account, real streaming or private music is needed. */
"use strict";
const {chromium}=require("playwright");
const {spawn}=require("node:child_process");
const assert=require("node:assert/strict");
const path=require("node:path");
const port=9896,url="http://127.0.0.1:"+port+"/";
const tracks=[
 {id:"songIDAAAAAAAAAA",title:"Andrea Rosario - We Own The Night",album:"Music",mime:"audio/mpeg",size:101},
 {id:"songIDBBBBBBBBBB",title:"Oceans",album:"Music / Bethel",mime:"audio/mpeg",size:102},
 {id:"songIDCCCCCCCCCC",title:"Amazing Grace",album:"Music / Bethel",mime:"audio/mpeg",size:103},
 {id:"songIDDDDDDDDDDD",title:"Instrumental",album:"Music",mime:"audio/aac",size:104}
];
function frame(name,text){
 const payload=Buffer.concat([Buffer.from([3]),Buffer.from(text)]);
 const header=Buffer.alloc(10);header.write(name,0);header.writeUInt32BE(payload.length,4);
 return Buffer.concat([header,payload]);
}
function tag(id){
 const match=id===tracks[0].id?["Andrea Rosario","We Own The Night","Pop"]:id===tracks[1].id?["Hillsong","Zion","Gospel"]:["Choir","Classics","Gospel"];
 const body=Buffer.concat([frame("TPE1",match[0]),frame("TALB",match[1]),frame("TCON",match[2])]);
 const header=Buffer.alloc(10);header.write("ID3");header[3]=3;
 let n=body.length;for(let i=9;i>=6;i--){header[i]=n&127;n>>=7;}
 return Buffer.concat([header,body]);
}
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function main(){
 const server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1"],{cwd:path.resolve(__dirname,".."),stdio:"ignore"});
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
  const page=await browser.newPage({viewport:{width:1280,height:850},serviceWorkers:"block"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  let streams=0;
  await page.route("**/api/music/tracks",async route=>{await pause(700);return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({configured:true,signedIn:true,tracks})});});
  await page.route("**/api/music/stream?**",route=>{
   streams++;
   const id=new URL(route.request().url()).searchParams.get("id");
   return route.fulfill({status:206,headers:{"content-type":"audio/mpeg","accept-ranges":"bytes"},body:tag(id)});
  });
  let loaded=false;
  for(let i=0;i<20;i++){try{const r=await page.goto(url+"#media",{waitUntil:"domcontentloaded",timeout:5000});if(r?.ok()){loaded=true;break;}}catch{}await pause(300);}
  assert.ok(loaded,"Local site unavailable");
  await page.locator("#musicLoadTitle").waitFor();
  assert.equal(await page.locator(".music-load-bar").getAttribute("aria-valuenow"),null);
  assert.match(await page.locator("#musicLoadLog").textContent(),/Connecting to the music service/);
  await page.locator("#musicSort").waitFor();
  assert.equal(await page.locator("[data-music-track]").count(),4);
  assert.equal(streams,0,"Opening the library should not fetch music tags");
  await page.locator("#musicSort").selectOption("artist");
  assert.equal(await page.locator(".music-track-title").first().innerText(),"We Own The Night");
  await page.locator("#musicGroup").selectOption("folder");
  assert.match(await page.locator(".music-group-heading").allInnerTexts().then(a=>a.join(" ")),/Music \/ Bethel/);
  await page.locator("#musicFilter").fill("Andrea");
  assert.equal(await page.locator("[data-music-track]").count(),1);
  await page.locator("#musicFilter").fill("");
  await page.locator("#musicGroup").selectOption("none");
  await page.locator("#musicScan").click();
  await page.waitForFunction(()=>document.querySelector("#musicScan")?.disabled===true,null,{timeout:10000});
  assert.equal(streams,3,"Only MP3s should be scanned");
  await page.locator("#musicSort").selectOption("genre");
  await page.locator("#musicGroup").selectOption("genre");
  assert.match(await page.locator(".music-group-heading").allInnerTexts().then(a=>a.join(" ")),/Gospel/);
  assert.match(await page.locator(".music-group-heading").allInnerTexts().then(a=>a.join(" ")),/Pop/);
  await page.locator("#musicFilter").fill("Gospel");
  assert.equal(await page.locator("[data-music-track]").count(),2);
  await page.setViewportSize({width:390,height:844});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(overflow<=2,"Music controls caused mobile overflow of "+overflow+"px");
  assert.deepEqual(errors,[],"Browser JS errors: "+errors.join("; "));
  console.log("PASS: music sort, group, filename artist, tagged genre, search, opt-in metadata and mobile viewport");
 }finally{if(browser)await browser.close();server.kill();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
