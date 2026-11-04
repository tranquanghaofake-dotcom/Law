const { chromium } = require('playwright');
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const ROOT = '/home/user/Law/apps/web/dist';
const TYPES = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const server = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p==='/'||!p) p='/index.html'; fs.readFile(path.join(ROOT,p),(e,d)=>{ if(e){r.statusCode=404;return r.end();} r.setHeader('content-type',TYPES[path.extname(p)]??'application/octet-stream'); r.end(d);});});
const out = {};
(async () => {
  await new Promise(r=>server.listen(0,r)); const port=server.address().port; const U=`http://localhost:${port}/`;
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM });
  // 1. Requests at concepts list, cold, fresh context (no SW reuse)
  for (const [k,h] of [['home','#/'],['concepts','#/mon/hien-phap/khai-niem']]) {
    const ctx = await browser.newContext({ viewport:{width:390,height:844}, serviceWorkers:'block' }); const p = await ctx.newPage();
    let n=0, json=0, bytes=0; p.on('response', async r=>{ n++; if(r.url().endsWith('.json')) json++; try{ bytes += (await r.body()).length; }catch{} });
    await p.goto(U+h); await p.waitForTimeout(2500);
    out['req_'+k] = { n, json, kb: Math.round(bytes/1024) }; await ctx.close();
  }
  // 2. Quiz Enter hijack + undefined.json
  { const ctx = await browser.newContext({ viewport:{width:390,height:844}, serviceWorkers:'block' }); const p = await ctx.newPage();
    const bad=[]; p.on('response', r=>{ if(r.status()>=400) bad.push(r.status()+' '+r.url().replace(U,'/')); });
    await p.goto(U+'#/bo/dat-coc'); await p.waitForSelector('.opt');
    await p.focus('.qexit'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
    out.quiz_enter_on_exit_hash = await p.evaluate(()=>location.hash);
    await p.focus('.opt'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
    out.quiz_enter_on_option_chosen = await p.evaluate(()=>!!document.querySelector('.feedback'));
    await p.focus('.opt'); await p.keyboard.press('Space'); await p.waitForTimeout(400);
    out.quiz_space_on_option_chosen = await p.evaluate(()=>!!document.querySelector('.feedback'));
    // focus after answer, button below fold
    out.quiz_after_pick = await p.evaluate(()=>({ active: document.activeElement.tagName, nextBottom: Math.round(document.querySelector('.feedback .btn').getBoundingClientRect().bottom), vh: innerHeight }));
    // dim contrast measured: opacity composite
    out.quiz_dim = await p.evaluate(()=>{ const d=document.querySelector('.opt.dim'); if(!d) return null; const s=getComputedStyle(d); return { opacity: s.opacity, color: s.color, bg: s.backgroundColor, disabled: d.disabled }; });
    // Enter on source link inside feedback
    const link = await p.$('.feedback a'); if (link) { await link.focus(); const before = await p.evaluate(()=>document.querySelector('.count')?.textContent); await p.keyboard.press('Enter'); await p.waitForTimeout(400); out.quiz_enter_on_source_link = { before, after: await p.evaluate(()=>document.querySelector('.count')?.textContent), pages: ctx.pages().length }; }
    await p.goto(U+'#/hoc/hien-phap/hp-1'); await p.waitForTimeout(1500);
    await p.goto(U+'#/on'); await p.waitForTimeout(1500);
    await p.goto(U+'#/'); await p.waitForTimeout(800);
    out.bad_responses = bad; await ctx.close(); }
  // 3. Lesson intro toggle Enter + Esc dialog + Enter on Thoát
  { const ctx = await browser.newContext({ viewport:{width:390,height:844}, serviceWorkers:'block' }); const p = await ctx.newPage();
    await p.goto(U+'#/hoc/hien-phap/hp-1'); await p.waitForTimeout(1500);
    const steps=[];
    for (let k=0;k<6;k++) { const t = await p.$('.intro-toggle'); if (t) break; const b = await p.$('.session-hint .btn'); if (b) { await b.click(); continue; } steps.push(await p.evaluate(()=>document.querySelector('.session-main')?.innerText.slice(0,60))); break; }
    const t = await p.$('.intro-toggle');
    if (t) { const termBefore = await p.evaluate(()=>document.querySelector('.term')?.textContent.trim()); await t.focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(500);
      out.lesson_toggle_enter = { termBefore, verbatimOpen: await p.evaluate(()=>{const v=document.getElementById('intro-verbatim'); return v? getComputedStyle(v).display+' '+(v.hidden):'absent';}), termAfter: await p.evaluate(()=>document.querySelector('.term')?.textContent.trim()), feedback: await p.evaluate(()=>!!document.querySelector('.feedback')) };
    } else out.lesson_toggle_enter = 'no .intro-toggle; ' + steps.join('|');
    await p.keyboard.press('Escape'); await p.waitForTimeout(300);
    out.lesson_esc = await p.evaluate(()=>({ dialog: !!document.querySelector('.confirm'), active: document.activeElement.tagName }));
    await ctx.close(); }
  // 4. reduced motion
  { const ctx = await browser.newContext({ viewport:{width:1280,height:800}, reducedMotion:'reduce', serviceWorkers:'block' }); const p = await ctx.newPage();
    await p.goto(U+'#/luyen-de'); await p.waitForTimeout(1500);
    out.reduce = await p.evaluate(()=>{ const t=document.querySelector('.ticket')||document.querySelector('.btn'); const s=getComputedStyle(t); return { el: t.className, td: s.transitionDuration, anims: document.getAnimations().length, rootCls: document.documentElement.className }; });
    await ctx.close(); }
  { const ctx = await browser.newContext({ viewport:{width:1280,height:800}, serviceWorkers:'block' }); const p = await ctx.newPage();
    await p.goto(U+'#/'); await p.waitForTimeout(1500);
    out.home_anims = await p.evaluate(()=>document.getAnimations().filter(a=>a.effect?.getTiming().iterations===Infinity).map(a=>a.animationName||a.constructor.name));
    // focus ring computed
    await p.keyboard.press('Tab');
    out.focus1 = await p.evaluate(()=>{ const a=document.activeElement; const s=getComputedStyle(a); return a.tagName+'.'+a.className+' '+s.outlineColor+' '+s.outlineWidth; });
    out.fonts = await p.evaluate(()=>[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight+' '+f.style).filter((v,i,a)=>a.indexOf(v)===i));
    await ctx.close(); }
  console.log(JSON.stringify(out,null,1));
  await browser.close(); server.close();
})().catch(e=>{console.error(e); process.exit(1);});
