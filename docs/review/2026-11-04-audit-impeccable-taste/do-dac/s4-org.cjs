const { chromium } = require('playwright');
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const ROOT = '/home/user/Law/apps/web/dist';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };
const s = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', TYPES[path.extname(p)] ?? 'application/octet-stream'); r.end(d); }); });
(async () => {
  await new Promise((r) => s.listen(0, r)); const base = `http://localhost:${s.address().port}/`;
  const b = await chromium.launch();
  for (const w of [390, 1280]) {
    const pg = await (await b.newContext({ viewport: { width: w, height: 844 } })).newPage();
    await pg.goto(base + '#/toi'); await pg.waitForTimeout(1500);
    // scroll through to trigger reveal
    await pg.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
    await pg.waitForTimeout(1200);
    const res = await pg.evaluate(() => {
      const toRgb = (c) => { const n = c.match(/[\d.]+/g).map(Number); if (c.startsWith('color(')) return { r: n[0] * 255, g: n[1] * 255, b: n[2] * 255, a: n[3] ?? 1 }; return { r: n[0], g: n[1], b: n[2], a: n[3] ?? 1 }; };
      const lum = ({ r, g, b }) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
      const over = (f, bg) => ({ r: f.r * f.a + bg.r * (1 - f.a), g: f.g * f.a + bg.g * (1 - f.a), b: f.b * f.a + bg.b * (1 - f.a), a: 1 });
      const bgOf = (el) => { const st = []; for (let e = el; e; e = e.parentElement) { const c = toRgb(getComputedStyle(e).backgroundColor); if (c.a > 0) { st.push(c); if (c.a >= 1) break; } } let bg = { r: 255, g: 255, b: 255, a: 1 }; for (const c of st.reverse()) bg = over(c, bg); return bg; };
      const out = [];
      document.querySelectorAll('.org-node[data-status="locked"] .org-name').forEach((el, i) => { if (i > 3) return; const cs = getComputedStyle(el); const fg = over(toRgb(cs.color), bgOf(el)); const bg = bgOf(el); const a = lum(fg), b2 = lum(bg); out.push({ t: el.textContent.trim(), fs: cs.fontSize, fw: cs.fontWeight, color: cs.color, ratio: +((Math.max(a, b2) + 0.05) / (Math.min(a, b2) + 0.05)).toFixed(2), appear: el.closest('.org-node').dataset.appear, filter: getComputedStyle(el.closest('.org-node')).filter }); });
      const m = document.querySelector('.org-node[data-status="locked"] .org-meta'); const mr = m ? m.getBoundingClientRect() : null;
      return { out, metaSize: mr && [mr.width, mr.height], countLocked: document.querySelectorAll('.org-node[data-status="locked"]').length };
    });
    console.log(w, JSON.stringify(res));
  }
  await b.close(); s.close();
})();
