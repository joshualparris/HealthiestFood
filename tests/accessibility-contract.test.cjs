const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
function rgb(h){return h.replace('#','').match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4)}
function contrast(a,b){const lum=h=>{const v=rgb(h);return .2126*v[0]+.7152*v[1]+.0722*v[2]};const [x,y]=[lum(a),lum(b)].sort((a,b)=>b-a);return (x+.05)/(y+.05)}
test('Known previously low contrast tokens pass WCAG AA for ordinary-size text',()=>{
 const css=read('site.css');
 for(const hex of ['#355a43','#365b44','#405b49'])assert.ok(contrast(hex,'#f8f8f1')>=4.5,hex);
 for(const hex of ['#355a43','#365b44','#405b49'])assert.ok(contrast(hex,'#fffdf6')>=4.5,hex);
 assert.ok(css.includes('#355a43'));
 assert.ok(!css.includes('#79936a'));
 assert.ok(!css.includes('color:#6d7b70'));
});
test('Brand accessible name includes visible brand text, and podcast Play here matches button name',()=>{
 const page=read('index.html'),media=read('media-library.js');
 assert.match(page,/<a class="brand" href="#home">/);
 assert.ok(!page.includes('class="brand" href="#home" aria-label='));
 assert.ok(media.includes('aria-label="Play here:'));
 assert.ok(media.includes('>▶ Play here</button>'));
});
test('Scrollably wide evidence tables are keyboard accessible and named',()=>{
 assert.equal((read('nutrition-coverage.js').match(/class="nutrient-scroll" tabindex="0" role="region"/g)||[]).length,2);
 assert.equal((read('whole-day-report.js').match(/class="whole-day-scroll" tabindex="0" role="region"/g)||[]).length,2);
});
