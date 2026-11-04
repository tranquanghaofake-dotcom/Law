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
  for (const [name, hash] of [['profile', '#/toi']]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const pg = await ctx.newPage(); await pg.goto(base + hash); await pg.waitForTimeout(1300);
    if (name === 'profile') { await pg.click('#acc-btn-chuyen-can').catch(() => {}); await pg.waitForTimeout(500); }
    const rows = await pg.evaluate(MEASURE);
    const low = rows.filter((x) => !/^bk-/.test(x.cls) && x.ratio !== null && (x.ratio < (x.fs >= 24 ? 3 : 4.5) || x.fs < 12));
    log('==', name, 'texts', rows.length, 'font sizes', JSON.stringify([...new Set(rows.map((x) => x.fs))].sort((a, b) => a - b)));
    for (const x of low.slice(0, 40)) log('  LOW', JSON.stringify(x));
    log('  caps/tracking', JSON.stringify(rows.filter((x) => x.tt === 'uppercase').map((x) => x.t + '|' + x.fs + '|' + x.ls).slice(0, 8)));
    log('  overflowX', await pg.evaluate(() => document.documentElement.scrollWidth > innerWidth));
    await ctx.close();
    // 320 width
    const c2 = await b.newContext({ viewport: { width: 320, height: 640 } }); const p2 = await c2.newPage(); await p2.goto(base + hash); await p2.waitForTimeout(1000);
    log('  320 overflowX', await p2.evaluate(() => [document.documentElement.scrollWidth, innerWidth]));
    await c2.close();
  }
  await b.close(); s.close();
})();
