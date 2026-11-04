const { chromium } = require('playwright');
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const ROOT = '/home/user/Law/apps/web/dist', OUT = path.join(__dirname, 's4');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const s = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', TYPES[path.extname(p)] ?? 'application/octet-stream'); r.end(d); }); });
const log = (...a) => console.log(...a);
const MEASURE = () => {
  const parse = (c) => { const m = c.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
  const L = ({ r, g, b }) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  const over = (f, bg) => ({ r: f.r * f.a + bg.r * (1 - f.a), g: f.g * f.a + bg.g * (1 - f.a), b: f.b * f.a + bg.b * (1 - f.a), a: 1 });
  const bgOf = (el) => { let stack = []; for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.backgroundImage !== 'none') return null; const c = parse(cs.backgroundColor); if (c.a > 0) { stack.push(c); if (c.a >= 1) break; } } let bg = { r: 247, g: 244, b: 238, a: 1 }; for (const c of stack.reverse()) bg = over(c, bg); return bg; };
  const opac = (el) => { let o = 1; for (let e = el; e; e = e.parentElement) o *= +getComputedStyle(e).opacity; return o; };
  const out = [];
  for (const el of document.querySelectorAll('main *')) {
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    if (el.closest('.sr-only')) continue;
    const fs = parseFloat(cs.fontSize);
    const bg = bgOf(el); const o = opac(el);
    let ratio = null;
    if (bg) { const fg = over({ ...parse(cs.color), a: parse(cs.color).a * o }, bg); const a = L(fg), b = L(bg); ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); }
    out.push({ t: el.textContent.trim().slice(0, 28), fs, fw: cs.fontWeight, ratio: ratio && +ratio.toFixed(2), o: +o.toFixed(2), cls: (el.className?.baseVal ?? el.className).toString().split(' ')[0], tt: cs.textTransform, ls: cs.letterSpacing, lh: cs.lineHeight });
  }
  return out;
};
(async () => {
  await new Promise((r) => s.listen(0, r)); const base = `http://localhost:${s.address().port}/`;
  const b = await chromium.launch();
  for (const [name, hash] of [['profile', '#/toi'], ['settings', '#/cai-dat'], ['notfound', '#/khong-co'], ['quiz', '#/bo/dat-coc'], ['lesson', '#/hoc/hien-phap/hp-1']]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const pg = await ctx.newPage(); await pg.goto(base + hash); await pg.waitForTimeout(1300);
    if (name === 'profile') { await pg.click('#acc-btn-chuyen-can').catch(() => {}); await pg.waitForTimeout(500); }
    const rows = await pg.evaluate(MEASURE);
    const low = rows.filter((x) => (x.ratio !== null && x.ratio < (x.fs >= 24 ? 3 : 4.5)) || x.fs < 12);
    log('==', name, 'texts', rows.length, 'font sizes', JSON.stringify([...new Set(rows.map((x) => x.fs))].sort((a, b) => a - b)));
    for (const x of low.slice(0, 22)) log('  LOW', JSON.stringify(x));
    log('  caps/tracking', JSON.stringify(rows.filter((x) => x.tt === 'uppercase').map((x) => x.t + '|' + x.fs + '|' + x.ls).slice(0, 8)));
    log('  overflowX', await pg.evaluate(() => document.documentElement.scrollWidth > innerWidth));
    await ctx.close();
    // 320 width
    const c2 = await b.newContext({ viewport: { width: 320, height: 640 } }); const p2 = await c2.newPage(); await p2.goto(base + hash); await p2.waitForTimeout(1000);
    log('  320 overflowX', await p2.evaluate(() => [document.documentElement.scrollWidth, innerWidth]));
    await c2.close();
  }
  // contrast of dim opts + settings controls
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const pg = await ctx.newPage(); await pg.goto(base + '#/bo/dat-coc'); await pg.waitForTimeout(900); await pg.keyboard.press('1'); await pg.waitForTimeout(400);
    log('dim opts', JSON.stringify((await pg.evaluate(MEASURE)).filter((x) => /opt|^$/.test(x.cls) || x.o < 1).slice(0, 6)));
    await ctx.close();
    const c3 = await b.newContext({ viewport: { width: 390, height: 844 } }); const p3 = await c3.newPage(); await p3.goto(base + '#/cai-dat'); await p3.waitForTimeout(1000);
    log('settings controls', JSON.stringify(await p3.evaluate(() => [...document.querySelectorAll('.settings label.setting, .settings select, .settings input[type=range], .settings .btn')].map((e) => { const r = e.getBoundingClientRect(); return [e.tagName + '.' + (e.className || ''), Math.round(r.width), Math.round(r.height)]; }))));
    log('accent-color', JSON.stringify(await p3.evaluate(() => ['input[type=checkbox]', 'input[type=range]', 'select'].map((s) => { const e = document.querySelector(s); return [s, getComputedStyle(e).accentColor, getComputedStyle(e).fontSize, getComputedStyle(e).height]; }))));
    log('h1/h2', JSON.stringify(await p3.evaluate(() => [...document.querySelectorAll('h1,h2,h3')].map((h) => [h.tagName, h.className, getComputedStyle(h).fontSize, getComputedStyle(h).fontFamily.slice(0, 24), h.textContent.trim()]))));
    await c3.close();
  }
  // reduced-motion: confirm kills transitions on opt & progress, and 'on' override
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }); const pg = await ctx.newPage(); await pg.goto(base + '#/hoc/hien-phap/hp-1'); await pg.waitForTimeout(1000);
    log('RM computed', JSON.stringify(await pg.evaluate(() => { const g = (s) => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e); return [c.animationName, c.transitionDuration]; }; return { progress: g('.session-bar .progress span'), flame: g('.fire-ring'), ring: g('.ring'), hint: g('.session-hint') }; })));
    await ctx.close();
  }
  // keyboard: Enter on quiz exit link
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const pg = await ctx.newPage(); await pg.goto(base + '#/bo/dat-coc'); await pg.waitForTimeout(900);
    await pg.focus('.qexit'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(400);
    log('Enter on exit link -> hash', await pg.evaluate(() => location.hash));
    await pg.goto(base + '#/bo/dat-coc'); await pg.waitForTimeout(600);
    await pg.focus('.qexit'); await pg.keyboard.press('Space'); await pg.waitForTimeout(300);
    log('Space on exit link -> hash', await pg.evaluate(() => location.hash));
    // viewport scroll after answering
    await pg.goto(base + '#/bo/dat-coc'); await pg.waitForTimeout(600); await pg.reload(); await pg.waitForTimeout(900);
    await pg.click('.opt >> nth=0'); await pg.waitForTimeout(500);
    log('after click: scrollY', await pg.evaluate(() => scrollY), 'next-btn bottom', await pg.$eval('.feedback .btn', (e) => e.getBoundingClientRect().bottom), 'vh 844', 'active', await pg.evaluate(() => document.activeElement.tagName));
    await pg.screenshot({ path: OUT + '/quiz-after-click-390.png' });
    await ctx.close();
  }
  await b.close(); s.close();
})();
