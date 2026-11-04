const { chromium } = require('/home/user/Law/node_modules/playwright'); const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const ROOT='/home/user/Law/apps/web/dist'; const OUT=(process.argv[2]??require('node:os').tmpdir())+'/s3-dot2-out'; fs.mkdirSync(OUT,{recursive:true});
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png'};
const s=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p.startsWith('/Law/'))p=p.slice(4);if(p==='/')p='/index.html';fs.readFile(path.join(ROOT,p),(e,d)=>{if(e){r.statusCode=404;return r.end();}r.setHeader('content-type',T[path.extname(p)]??'application/octet-stream');r.end(d)})});
const ROUTES=['#/','#/mon','#/mon/hien-phap','#/mon/hien-phap/khai-niem','#/hoc/hien-phap/hp-1','#/on','#/luyen-de','#/bo/dat-coc','#/toi','#/cai-dat'];
const scan=()=>{const inf=document.getAnimations().filter(a=>a.effect?.getComputedTiming().iterations===Infinity).map(a=>a.animationName+'@'+(a.effect.target?.getAttribute?.('class')||a.effect.target?.tagName));
 const small=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode())){const t=n.textContent.trim();if(!t)continue;const e=n.parentElement;const cs=getComputedStyle(e);const fs=parseFloat(cs.fontSize);if(fs>=11.95)continue;const r=e.getBoundingClientRect();if(r.width<1||r.height<1||cs.visibility==='hidden'||e.closest('.sr-only'))continue;if(e.closest('svg'))continue;small.push(fs.toFixed(1)+'px '+(e.closest('[aria-hidden="true"]')?'[ah] ':'')+(e.className?.baseVal??e.className)+' «'+t.slice(0,18)+'»');}
 const clip=[...document.querySelectorAll('.me-sub,.me-next-t,.me-title,.org-tpill,.org-name,.bk-plate span,.sc-sub')].filter(e=>e.getBoundingClientRect().width>0).map(e=>({c:e.className,fs:getComputedStyle(e).fontSize,over:e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+1,t:e.textContent.trim().slice(0,30)})).filter(x=>x.over);
 return {inf:[...new Set(inf)],small:[...new Set(small)].slice(0,25),clip,legal:document.querySelectorAll('.legal-line,.legal-note').length,hscroll:document.documentElement.scrollWidth>innerWidth};};
(async()=>{await new Promise(r=>s.listen(0,r));const U=`http://localhost:${s.address().port}/Law/`;const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM});const out={};
 for(const vw of [1280,390]){const p=await b.newPage({viewport:{width:vw,height:vw>500?800:844}});for(const r of ROUTES){await p.goto(U+r);await p.waitForTimeout(1300);out[vw+' '+r]=await p.evaluate(scan);}
  await p.goto(U+'#/toi');await p.waitForTimeout(1200);await p.screenshot({path:OUT+`/toi-${vw}.png`,fullPage:true});await p.close();}
 // Feedback in lesson + quiz in progress
 const p=await b.newPage({viewport:{width:390,height:844}});
 await p.goto(U+'#/hoc/hien-phap/hp-1');await p.waitForTimeout(1200);
 const fb={};for(let i=0;i<12;i++){ if(await p.$('.feedback')){fb.feedbackLegal=await p.evaluate(()=>!!document.querySelector('.feedback .legal-line, .legal-line'));fb.hasWhyQuote=await p.evaluate(()=>!!document.querySelector('.why-quote'));fb.src=await p.evaluate(()=>document.querySelector('.feedback .source')?.textContent.slice(0,60));break;}
  const opt=await p.$('.opt:not([disabled])'); if(opt){await opt.click();await p.waitForTimeout(500);continue;}
  const nx=await p.$('.intro-layers ~ * .btn.primary, .step-wrap .btn.primary'); if(nx){await nx.click();await p.waitForTimeout(500);continue;} await p.keyboard.press('Enter');await p.waitForTimeout(500);}
 out.lessonFeedback=fb;
 await p.goto(U+'#/bo/dat-coc');await p.waitForSelector('.opt');await (await p.$('.opt')).click();await p.waitForTimeout(500);
 out.quizInProgress=await p.evaluate(()=>({legal:!!document.querySelector('.legal-line'),basis:document.querySelector('.source')?.textContent.slice(0,60)}));
 await p.close();
 // rest pose of finite decorative animations on Home
 const h=await b.newPage({viewport:{width:1280,height:800}});await h.goto(U+'#/');await h.waitForTimeout(1500);
 out.rest=await h.evaluate(()=>document.getAnimations().map(a=>{const e=a.effect.target;const d=a.effect.getComputedTiming().endTime;a.pause();a.currentTime=d-1;const before=getComputedStyle(e).transform;a.currentTime=d+1;const after=getComputedStyle(e).transform;return a.animationName+': end-1ms '+before+' -> after '+after;}));
 await h.close();
 console.log(JSON.stringify(out,null,1));await b.close();s.close();})();
