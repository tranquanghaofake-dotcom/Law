const { chromium } = require('playwright'); const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const ROOT='/home/user/Law/apps/web/dist'; const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml'};
const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';fs.readFile(path.join(ROOT,p),(e,d)=>{if(e){r.statusCode=404;return r.end();}r.setHeader('content-type',T[path.extname(p)]??'application/octet-stream');r.end(d)})});
(async()=>{await new Promise(r=>s.listen(0,r));const U=`http://localhost:${s.address().port}/`;const b=await chromium.launch(process.env.PW_CHROMIUM?{executablePath:process.env.PW_CHROMIUM}:{});const out={};
 const ctx=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});const p=await ctx.newPage();const bad=[];p.on('response',r=>{if(r.status()>=400)bad.push(r.status()+' '+r.url().replace(U,'/'))});
 await p.goto(U+'#/bo/dat-coc');await p.waitForSelector('.opt');
 await p.focus('.qexit');await p.keyboard.press('Enter');await p.waitForTimeout(600);out.enterExit=await p.evaluate(()=>location.hash);
 out.focusAfterRoute=await p.evaluate(()=>document.activeElement.tagName+':'+document.activeElement.textContent.trim().slice(0,30));
 await p.goto(U+'#/bo/dat-coc');await p.waitForSelector('.opt');
 await p.focus('.opt');await p.keyboard.press('Enter');await p.waitForTimeout(500);out.enterOnOption=await p.evaluate(()=>!!document.querySelector('.feedback'));
 out.afterPick=await p.evaluate(()=>({active:document.activeElement.className+':'+document.activeElement.textContent.trim().slice(0,15),bottom:Math.round(document.querySelector('.feedback .btn').getBoundingClientRect().bottom),vh:innerHeight}));
 const link=await p.$('.feedback a');if(link){await link.focus();const before=await p.evaluate(()=>document.querySelector('.count').textContent);await p.keyboard.press('Enter');await p.waitForTimeout(600);out.enterSourceLink={before,after:await p.evaluate(()=>document.querySelector('.count').textContent),pages:ctx.pages().length};}
 out.focusRing=await p.evaluate(()=>{const e=document.querySelector('.feedback .btn');e.focus();return getComputedStyle(e).outlineColor});
 // lesson: Enter trên toggle nguyên văn
 await p.goto(U+'#/hoc/hien-phap/hp-1');await p.waitForTimeout(1500);
 for(let k=0;k<4;k++){const t=await p.$('button[aria-expanded]');if(t){await t.focus();await p.keyboard.press('Enter');await p.waitForTimeout(400);out.lessonToggle=await p.evaluate(()=>({expanded:document.querySelector('button[aria-expanded]')?.getAttribute('aria-expanded'),quote:!!document.querySelector('blockquote')}));break;} const pb=await p.$('.step-wrap button.btn'); if(pb){await pb.click();await p.waitForTimeout(500);} }
 await p.keyboard.press('Escape');await p.waitForTimeout(300);out.escFocus=await p.evaluate(()=>document.activeElement.textContent.trim());
 await p.keyboard.press('Escape');
 await p.goto(U+'#/');await p.waitForTimeout(800);await p.locator('a[href="#/mon"]:visible').first().click();await p.waitForTimeout(800);out.navFocus=await p.evaluate(()=>document.activeElement.tagName+':'+document.activeElement.textContent.trim().slice(0,20));
 // HT2 bổ sung: focus sau Câu tiếp, deep-link, Esc đóng hộp, HT11 Khái niệm
 await p.goto(U+'#/bo/dat-coc');await p.waitForSelector('.opt');await p.keyboard.press('1');await p.waitForTimeout(300);await p.keyboard.press('Enter');await p.waitForTimeout(400);
 out.focusAfterNext=await p.evaluate(()=>document.activeElement.className);
 await p.goto(U+'#/mon/dan-su/khai-niem/phap-nhan');await p.waitForTimeout(1500);out.deepLink=await p.evaluate(()=>({active:document.activeElement.className, inEntry:!!document.activeElement.closest('#c-phap-nhan'), y:Math.round(scrollY)}));
 await p.goto(U+'#/');await p.waitForTimeout(500);await p.goto(U+'#/mon/dan-su/khai-niem');await p.waitForTimeout(1200);await p.goto(U+'#/toi');await p.waitForTimeout(1200);
 out.bad=bad;console.log(JSON.stringify(out,null,1));await b.close();s.close();})();
