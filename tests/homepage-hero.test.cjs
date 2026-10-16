'use strict';
const test=require('node:test'), assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const get=p=>fs.readFileSync(path.join(root,p),'utf8');

test('uploaded homepage image replaces decorative SVG, while actionable HTML remains',()=>{
 const html=get('index.html'), css=get('site.css'),sw=get('service-worker.js');
 const hero=html.slice(html.indexOf('<div class="hero section-shell">'),html.indexOf('<section class="intro-note',html.indexOf('<div class="hero section-shell">')));
 assert.match(hero,/<img class="homepage-bowl-photo" src="homepage-bowl\.webp"/);
 assert.doesNotMatch(hero,/<svg class="bowl-art"/);
 assert.doesNotMatch(hero,/<div class="art-caption/);
 assert.match(hero,/<a class="btn btn-ghost" href="cooking-methods\.html">Compare cooking methods/);
 for(const [value,caption] of [['20','V6 freezer lunches'],['17','meal and snack recipes'],['7','days you can schedule']]){
  assert.ok(hero.includes('<strong>'+value+'</strong><span>'+caption+'</span>'),caption+' remains real selectable text');
 }
 assert.match(css,/\.homepage-bowl-photo\{[^}]*object-fit:contain/);
 assert.match(css,/\.hero-art\.hero-art-photo:before\{display:none\}/);
 assert.ok(sw.includes('"./homepage-bowl.webp"'));
 const bytes=fs.readFileSync(path.join(root,'homepage-bowl.webp'));
 assert.equal(bytes.toString('ascii',0,4),'RIFF');
 assert.equal(bytes.toString('ascii',8,12),'WEBP');
 assert.ok(bytes.length>25000 && bytes.length<500000);
});
