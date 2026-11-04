const { chromium } = require('playwright'); const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const ROOT='/home/user/Law/apps/web/dist'; const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml'};
const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';fs.readFile(path.join(ROOT,p),(e,d)=>{if(e){r.statusCode=404;return r.end();}r.setHeader('content-type',T[path.extname(p)]??'application/octet-stream');r.end(d)})});
const act=p=>p.evaluate(()=>{const a=document.activeElement;const r=a.getBoundingClientRect();return a.tagName+'.'+(a.className||'')+':'+(a.textContent||'').trim().slice(0,20)+` top=${Math.round(r.top)} bot=${Math.round(r.bottom)} sy=${Math.round(scrollY)}`});
(async()=>{await new Promise(r=>s.listen(0,r));const U=`http://localhost:${s.address().port}/`;const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const out={};
 const ctx=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});const p=await ctx.newPage();let STEP='';const bad=[];p.on('response',r=>{if(r.status()>=400&&!r.url().includes('tts'))bad.push(STEP+' '+r.url().replace(U,'/'))});
 const go=async(h,w=1200)=>{await p.evaluate(x=>{location.hash=x},h);await p.waitForTimeout(w)};
 await p.goto(U+'#/bo/dat-coc');await p.waitForSelector('.opt');
 out.q=[];
 for(let k=0;k<10;k++){await p.keyboard.press('1');await p.waitForTimeout(250);const a1=await act(p);await p.keyboard.press('Enter');await p.waitForTimeout(400);out.q.push(a1+' || '+await act(p));}
 out.finishVis=await p.evaluate(()=>{const r=document.querySelector('.qr-ring')?.getBoundingClientRect();return r?`ring top=${Math.round(r.top)}`:'no ring'});
 // Làm lại
 await p.locator('button:has-text("Làm lại")').focus();await p.keyboard.press('Enter');await p.waitForTimeout(800);out.retry=await act(p);
 // Lesson: returnFocus
 STEP='lesson';await p.goto(U+'#/hoc/hien-phap/hp-1');await p.waitForTimeout(1500);
 const toggle=p.locator('button.intro-toggle');await toggle.focus();
 await p.keyboard.press('Escape');await p.waitForTimeout(200);out.escOpen=await act(p);
 await p.keyboard.press('Enter');await p.waitForTimeout(300);out.oLaiEnter=await act(p);  // Ở lại via Enter
 // now open via the bar exit button, close with Esc -> stale returnFocus?
 const ex=await p.$('.session-bar .exit, button[aria-label*="Thoát"], .exit');out.exitBtn=!!ex;
 await p.locator('button.btn.primary:has-text("Đã hiểu")').focus().catch(()=>{});
 if(ex){await ex.click();await p.waitForTimeout(200);out.barOpen=await act(p);await p.keyboard.press('Escape');await p.waitForTimeout(300);out.barEscClose=await act(p);}
 // Concepts / Subject leave
 for (const [h,l] of [['#/mon/dan-su/khai-niem','concepts'],['#/mon/dan-su','subject'],['#/bo/dat-coc','quiz'],['#/hoc/hien-phap/hp-1','lesson']]){STEP=l;await go(h,1500);await go('#/toi',1000);}
 // desktop: side-glass book + bookcase spine
 const d=await b.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});const q=await d.newPage();await q.goto(U+'#/');await q.waitForTimeout(1500);
 const bk=await q.$('.side-glass .book a');out.sideBook=!!bk;
 if(bk){await q.keyboard.press('Tab');await bk.focus();await q.evaluate(()=>{});await q.waitForTimeout(400);const bb=await bk.boundingBox();await q.screenshot({path:process.argv[2]+'/side-book.png',clip:{x:bb.x-20,y:bb.y-20,width:bb.width+40,height:bb.height+40}});out.sideBookStyle=await bk.evaluate(e=>getComputedStyle(e).outline+' fv='+e.matches(':focus-visible'));}
 await q.goto(U+'#/toi');await q.waitForTimeout(2000);const sp=await q.$('.bk-spine');out.spine=!!sp;
 if(sp){await q.keyboard.press('Tab');await sp.focus();await q.waitForTimeout(500);const bb=await sp.boundingBox();await q.screenshot({path:process.argv[2]+'/spine.png',clip:{x:bb.x-30,y:bb.y-30,width:bb.width+60,height:bb.height+60}});out.spineStyle=await sp.evaluate(e=>getComputedStyle(e).outline+' fv='+e.matches(':focus-visible'));}
 out.bad=bad;console.log(JSON.stringify(out,null,1));await b.close();s.close();})();
