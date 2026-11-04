const { chromium } = require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const ROOT='/home/user/Law/apps/web/dist', OUT=path.join(__dirname,'s4');
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.mp3':'audio/mpeg','.woff2':'font/woff2'};
const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';fs.readFile(path.join(ROOT,p),(e,d)=>{if(e){r.statusCode=404;return r.end();}r.setHeader('content-type',TYPES[path.extname(p)]??'application/octet-stream');r.end(d)})});
const log=(...a)=>console.log(...a);
(async()=>{
await new Promise(r=>s.listen(0,r));const base=`http://localhost:${s.address().port}/`;
const b=await chromium.launch();
// 1) 404 hunt: same tab sequential like shoot.cjs
{const pg=await b.newPage({viewport:{width:390,height:844}});
 pg.on('response',x=>{if(x.status()>=400)log('404?',x.status(),x.url())});
 pg.on('requestfailed',x=>log('reqfail',x.url()));
 for(const h of ['#/','#/mon','#/mon/hien-phap','#/mon/hien-phap/khai-niem','#/mon/hien-phap/khai-niem/chu-quyen-nhan-dan','#/luyen-de','#/bo/dat-coc','#/hoc/hien-phap/hp-1','#/on','#/toi']){await pg.goto(base+h);await pg.waitForTimeout(1300);}
 await pg.close();}
log('--- 404 hunt done');
// 2) quiz interaction
const ctx=await b.newContext({viewport:{width:390,height:844}});
const pg=await ctx.newPage();
const errs=[];pg.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.text().slice(0,150))});pg.on('pageerror',e=>errs.push('PAGEERR '+e));
await pg.goto(base+'#/bo/dat-coc');await pg.waitForTimeout(1000);
log('focus initial', await pg.evaluate(()=>document.activeElement?.outerHTML.slice(0,80)));
// tab order
const tabs=[];for(let i=0;i<7;i++){await pg.keyboard.press('Tab');tabs.push(await pg.evaluate(()=>{const e=document.activeElement;return e.tagName+':'+(e.getAttribute('aria-label')||e.textContent.trim().slice(0,20))}));}
log('tab order',JSON.stringify(tabs));
// optsize
log('opt sizes',JSON.stringify(await pg.$$eval('.opt',els=>els.map(e=>{const r=e.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height)]}))));
log('exit size',JSON.stringify(await pg.$eval('.qexit',e=>{const r=e.getBoundingClientRect();return [r.width,r.height]})));
// press key 2 (maybe wrong)
await pg.keyboard.press('2');await pg.waitForTimeout(600);
await pg.screenshot({path:OUT+'/quiz-fb-390.png',fullPage:true});
log('feedback', await pg.$eval('.feedback',e=>e.className+' | '+e.innerText.slice(0,200)));
log('focus after answer', await pg.evaluate(()=>document.activeElement?.tagName+' '+document.activeElement?.className));
log('opts disabled',await pg.$$eval('.opt',els=>els.map(e=>e.disabled+':'+e.className)));
log('fb pos',JSON.stringify(await pg.$eval('.feedback',e=>{const r=e.getBoundingClientRect();return [r.top,r.bottom,innerHeight]})));
log('kbd', await pg.$eval('.feedback .btn',e=>{const r=e.getBoundingClientRect();return [r.width,r.height]}));
// colors for contrast of feedback
log('fb colors',JSON.stringify(await pg.evaluate(()=>{const g=s=>{const e=document.querySelector(s);if(!e)return null;const c=getComputedStyle(e);return [c.color,c.backgroundColor,c.borderLeftWidth,c.borderLeftColor]};return{fb:g('.feedback'),verdict:g('.feedback .verdict'),wrong:g('.opt.wrong'),correct:g('.opt.correct'),dim:g('.opt.dim'),src:g('.feedback .source'),kicker:g('.qno')}})));
// Enter -> next
await pg.keyboard.press('Enter');await pg.waitForTimeout(300);
log('after enter', await pg.$eval('.qno',e=>e.textContent));
// answer all remaining with key 1
for(let k=0;k<9;k++){await pg.keyboard.press('1');await pg.waitForTimeout(150);await pg.keyboard.press('Enter');await pg.waitForTimeout(200);}
await pg.waitForTimeout(500);
await pg.screenshot({path:OUT+'/quiz-end-390.png',fullPage:true});
log('end text',(await pg.evaluate(()=>document.querySelector('.qr')?.innerText.slice(0,300)))?.replace(/\n/g,' | '));
log('end focus',await pg.evaluate(()=>document.activeElement?.tagName+' '+(document.activeElement?.className||'')));
log('end scores', await pg.evaluate(()=>[...document.querySelectorAll('.qr .btn')].map(e=>{const r=e.getBoundingClientRect();return e.textContent+' '+Math.round(r.height)})));
log('ERRS',JSON.stringify(errs));
await ctx.close();
// 3) quiz desktop wrong+right
{const c=await b.newContext({viewport:{width:1280,height:800}});const p=await c.newPage();await p.goto(base+'#/bo/dat-coc');await p.waitForTimeout(900);
 await p.keyboard.press('1');await p.waitForTimeout(500);await p.screenshot({path:OUT+'/quiz-fb-1280.png'});
 // does feedback scroll into view on mobile after answer? tested above (fb pos)
 await c.close();}
// 4) reduced-motion quiz: does feedback still appear & distinguishable
{const c=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const p=await c.newPage();await p.goto(base+'#/bo/dat-coc');await p.waitForTimeout(900);
 await p.keyboard.press('3');await p.waitForTimeout(500);
 log('RM feedback', await p.$eval('.feedback',e=>getComputedStyle(e).animationName+' '+getComputedStyle(e).transitionDuration));
 log('RM opts', await p.$$eval('.opt',e=>e.map(x=>x.className+' '+getComputedStyle(x).backgroundColor)));
 await c.close();}
await b.close();s.close();
})();
