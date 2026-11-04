const { chromium } = require('playwright');
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const ROOT = '/home/user/Law/apps/web/dist', OUT = path.join(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });
const SCREENS = [['home','#/'],['subjects','#/mon'],['subject','#/mon/hien-phap'],['concepts-list','#/mon/hien-phap/khai-niem'],['concept','#/mon/hien-phap/khai-niem/chu-quyen-nhan-dan'],['quizzes','#/luyen-de'],['quiz','#/bo/dat-coc'],['lesson','#/hoc/hien-phap/hp-1'],['review','#/on'],['profile','#/toi'],['settings','#/cai-dat'],['notfound','#/khong-co']];
const TYPES = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
const server = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p==='/'||!p) p='/index.html'; fs.readFile(path.join(ROOT,p),(e,d)=>{ if(e){r.statusCode=404;return r.end();} r.setHeader('content-type',TYPES[path.extname(p)]??'application/octet-stream'); r.end(d);});});
const probe = () => {
  const lum = (c) => { const m = c.match(/[\d.]+/g); if (!m) return null; const [r,g,b,a] = m.map(Number); if (a===0) return null; return [r,g,b].map(v=>{v/=255;return v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[0.2126,0.7152,0.0722][i],0); };
  const bgOf = (el) => { for (let e=el; e; e=e.parentElement) { const c=getComputedStyle(e).backgroundColor; const L=lum(c); if (L!==null && !/rgba\([^)]*,\s*0(\.\d+)?\)/.test(c.replace(/, 1\)$/,''))) return L; if (getComputedStyle(e).backgroundImage!=='none') return 'img'; } return lum('rgb(255,255,255)'); };
  const out = { overflowX: document.documentElement.scrollWidth > innerWidth, lowContrast: [], smallTargets: [], noName: [], headings: [...document.querySelectorAll('h1,h2,h3')].map(h=>h.tagName+':'+h.textContent.trim().slice(0,40)), imgNoAlt: [...document.querySelectorAll('img:not([alt])')].length, landmarks: ['main','nav','header'].map(t=>t+'='+document.querySelectorAll(t).length).join(' ') };
  for (const el of document.querySelectorAll('body *')) {
    const s = getComputedStyle(el); if (s.visibility==='hidden'||s.display==='none') continue;
    const r = el.getBoundingClientRect(); if (!r.width||!r.height) continue;
    const own = [...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
    if (own) { const f=lum(s.color), b=bgOf(el); if (f!==null && b!=='img') { const ratio=(Math.max(f,b)+0.05)/(Math.min(f,b)+0.05); const big=parseFloat(s.fontSize)>=24||(parseFloat(s.fontSize)>=18.66&&+s.fontWeight>=700); if (ratio<(big?3:4.5)) out.lowContrast.push(`${ratio.toFixed(2)} ${s.fontSize} "${el.textContent.trim().slice(0,30)}" <${el.tagName.toLowerCase()}.${(el.className?.baseVal??el.className).toString().split(' ')[0]}>`); } }
    if (el.matches('a,button,input,select,[role=button],[tabindex]:not([tabindex="-1"])')) {
      if (r.width<24||r.height<24) out.smallTargets.push(`${Math.round(r.width)}x${Math.round(r.height)} <${el.tagName.toLowerCase()}> "${(el.getAttribute('aria-label')||el.textContent).trim().slice(0,25)}"`);
      if (!(el.getAttribute('aria-label')||el.getAttribute('aria-labelledby')||el.textContent.trim()||el.getAttribute('title')||el.labels?.length)) out.noName.push(el.outerHTML.slice(0,80));
    }
  }
  out.lowContrast=[...new Set(out.lowContrast)].slice(0,25); out.smallTargets=[...new Set(out.smallTargets)].slice(0,25);
  return out;
};
(async () => {
  await new Promise(r=>server.listen(0,r)); const port=server.address().port;
  const browser = await chromium.launch(); const report = {};
  for (const [vw,vh] of [[390,844],[1280,800]]) for (const scheme of ['light','dark']) {
    const page = await browser.newPage({ viewport:{width:vw,height:vh}, colorScheme:scheme });
    const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,120));}); page.on('pageerror',e=>errs.push(String(e).slice(0,120)));
    for (const [name,hash] of SCREENS) {
      await page.goto(`http://localhost:${port}/${hash}`); await page.waitForTimeout(1300);
      const key=`${vw}-${scheme}-${name}`;
      await page.screenshot({ path: path.join(OUT, key+'.png'), fullPage: true });
      report[key] = { ...(await page.evaluate(probe)), errors: errs.splice(0) };
    }
    await page.close();
  }
  fs.writeFileSync(path.join(__dirname,'probe.json'), JSON.stringify(report,null,1));
  await browser.close(); server.close(); console.log('ok', Object.keys(report).length);
})();
