// S1 verify: contrast thật (canvas chuẩn hoá màu, trộn alpha, lấy mẫu pixel khi nền gradient), touch target, tab order, 320px reflow, reduced-motion, font.
const { chromium } = require('playwright');
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const ROOT = '/home/user/Law/apps/web/dist';
const OUT = path.join(__dirname, 'verify-a.json');
const SCREENS = [['home', '#/'], ['subjects', '#/mon'], ['subject', '#/mon/hien-phap'], ['concepts-list', '#/mon/hien-phap/khai-niem'], ['concept', '#/mon/hien-phap/khai-niem/chu-quyen-nhan-dan'], ['quizzes', '#/luyen-de']];
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p === '/' || !p) p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', TYPES[path.extname(p)] ?? 'application/octet-stream'); r.end(d); }); });

const measure = () => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true });
  const norm = (c) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; // alpha thật: vẽ lên trong suốt
    cx.clearRect(0, 0, 1, 1); cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const e = cx.getImageData(0, 0, 1, 1).data; return [e[0], e[1], e[2], e[3] / 255]; };
  const over = (top, bot) => { const a = top[3]; return [top[0] * a + bot[0] * (1 - a), top[1] * a + bot[1] * (1 - a), top[2] * a + bot[2] * (1 - a), 1]; };
  const L = (c) => { const f = c.slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]; };
  const ratio = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const hex = (c) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const bgOf = (el) => { const chain = []; let grad = false; for (let e = el; e; e = e.parentElement) { const s = getComputedStyle(e); const c = norm(s.backgroundColor); if (c[3] > 0) chain.push(c); if (s.backgroundImage !== 'none') grad = true; if (c[3] === 1) break; } let bg = norm(getComputedStyle(document.body).backgroundColor); if (bg[3] < 1) bg = [247, 244, 238, 1]; for (const c of chain.reverse()) bg = over(c, bg); return { bg, grad }; };
  const res = { contrast: [], gradient: [], small: [], fonts: [], fsSet: {} };
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none') continue;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    if (el.closest('svg') || el.closest('.sr-only')) { if (!el.closest('svg')) continue; }
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()); if (!own || el.closest('svg')) continue;
    // phần tử bị che khỏi viewport do display:none ở ancestor đã loại ở trên; loại phần tử clip sr-only
    if (s.position === 'absolute' && r.width <= 1) continue;
    const fs = parseFloat(s.fontSize); res.fsSet[fs] = (res.fsSet[fs] || 0) + 1;
    let fg = norm(s.color); const { bg, grad } = bgOf(el); fg = over(fg, bg);
    const ratioV = ratio(fg, bg); const big = fs >= 24 || (fs >= 18.66 && +s.fontWeight >= 700);
    const need = big ? 3 : 4.5; const key = `${hex(fg)}|${hex(bg)}|${fs}|${grad}`;
    const item = { r: +ratioV.toFixed(2), need, fs, fg: hex(fg), bg: hex(bg), txt: el.textContent.trim().slice(0, 36), sel: `${el.tagName.toLowerCase()}.${(el.className?.baseVal ?? el.className).toString().split(' ')[0]}`, grad, op: s.opacity };
    if (seen.has(key)) continue; seen.add(key);
    if (grad) res.gradient.push(item); else res.contrast.push(item);
  }
  // target
  for (const el of document.querySelectorAll('a,button,input,select,summary,[role=button]')) {
    const s = getComputedStyle(el); if (s.visibility === 'hidden' || s.display === 'none') continue;
    let r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    // vùng ::after mở rộng (liên kết .more) không đo được bằng rect: đo thêm pseudo
    const af = getComputedStyle(el, '::after'); let ah = 0; if (af.content !== 'none' && af.position === 'absolute') ah = parseFloat(af.height) || 0;
    const inline = s.display === 'inline' && !!el.closest('p,li,nav.crumbs');
    res.small.push({ w: Math.round(r.width), h: Math.round(r.height), afterH: ah, inline, tag: el.tagName.toLowerCase(), txt: (el.getAttribute('aria-label') || el.textContent || el.placeholder || '').trim().slice(0, 28), cls: (el.className?.baseVal ?? el.className).toString().split(' ')[0], top: Math.round(r.top + scrollY) });
  }
  res.fonts = [...document.fonts].map((f) => `${f.family}|${f.weight}|${f.style}|${f.status}`);
  res.fontFamilyBody = getComputedStyle(document.body).fontFamily;
  res.scrollW = document.documentElement.scrollWidth; res.innerW = innerWidth;
  res.h1 = [...document.querySelectorAll('h1')].map((h) => h.textContent.trim() + ' @' + getComputedStyle(h).fontSize);
  res.heads = [...document.querySelectorAll('h1,h2,h3,[role=heading]')].length;
  res.lang = document.documentElement.lang;
  return res;
};

(async () => {
  await new Promise((r) => server.listen(0, r)); const port = server.address().port;
  const browser = await chromium.launch(); const rep = {};
  for (const [vw, vh] of [[390, 844], [1280, 800], [320, 640], [640, 800]]) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh } }); const page = await ctx.newPage();
    for (const [name, hash] of SCREENS) {
      await page.goto(`http://localhost:${port}/${hash}`); await page.waitForTimeout(1200);
      const m = await page.evaluate(measure);
      const key = `${vw}-${name}`; rep[key] = m;
      if (vw === 390 || vw === 1280) {
        // gradient: lấy mẫu pixel — ẩn chữ, chụp hộp, lấy pixel trung vị
        const items = m.gradient.slice(0, 12);
        for (const it of items) {
          const loc = page.locator(it.sel.replace(/\.$/, '').replace('.', '.')).filter({ hasText: it.txt.slice(0, 20) }).first();
          try {
            await loc.scrollIntoViewIfNeeded({ timeout: 1500 });
            const box = await loc.boundingBox(); if (!box) continue;
            await loc.evaluate((e) => { e.dataset.oc = e.style.webkitTextFillColor; e.style.webkitTextFillColor = 'transparent'; e.style.textShadow = 'none'; });
            const buf = await page.screenshot({ clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.max(2, Math.min(box.width, vw - box.x)), height: Math.max(2, box.height) } });
            await loc.evaluate((e) => { e.style.webkitTextFillColor = e.dataset.oc || ''; });
            const b64 = buf.toString('base64');
            const px = await page.evaluate(async (b) => { const im = new Image(); im.src = 'data:image/png;base64,' + b; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, im.width, im.height).data; const rs = [], gs = [], bs = []; for (let i = 0; i < d.length; i += 4) { rs.push(d[i]); gs.push(d[i + 1]); bs.push(d[i + 2]); } const med = (a) => a.sort((p, q) => p - q)[a.length >> 1]; return [med(rs), med(gs), med(bs)]; }, b64);
            const Lx = (c) => { const f = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]; };
            const fgv = it.fg.match(/[0-9a-f]{2}/g).map((h) => parseInt(h, 16));
            const a = Lx(fgv), bb = Lx(px); it.sampled = px.join(','); it.rSampled = +((Math.max(a, bb) + 0.05) / (Math.min(a, bb) + 0.05)).toFixed(2);
          } catch (e) { it.err = String(e).slice(0, 60); }
        }
      }
    }
    await ctx.close();
  }
  // tab order + focus ring (1280, trang môn học & luyện đề & khái niệm)
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } }); const page = await ctx.newPage();
  rep.tab = {};
  for (const [name, hash] of SCREENS) {
    await page.goto(`http://localhost:${port}/${hash}`); await page.waitForTimeout(1000);
    const seq = [];
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press('Tab');
      seq.push(await page.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return 'BODY'; const s = getComputedStyle(e); const r = e.getBoundingClientRect(); return `${e.tagName.toLowerCase()}.${(e.className?.baseVal ?? e.className).toString().split(' ')[0]} "${(e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 22)}" outline=${s.outlineStyle}/${s.outlineWidth}/${s.outlineColor} y=${Math.round(r.top)} h=${Math.round(r.height)}`; }));
    }
    rep.tab[name] = seq;
  }
  // reduced motion
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' }); const p2 = await ctx2.newPage();
  await p2.goto(`http://localhost:${port}/#/luyen-de`); await p2.waitForTimeout(1000);
  rep.reduced = await p2.evaluate(() => { const q = (s) => document.querySelector(s); const g = (s, p) => { const e = q(s); return e ? getComputedStyle(e)[p] : 'n/a'; }; return { ticketTransition: g('.ticket', 'transitionDuration'), cabAnim: g('.fire-ring', 'animationName'), htmlClass: document.documentElement.className, pref: matchMedia('(prefers-reduced-motion: reduce)').matches }; });
  await p2.goto(`http://localhost:${port}/#/`); await p2.waitForTimeout(800);
  rep.reducedHome = await p2.evaluate(() => { const out = []; for (const a of document.getAnimations()) out.push(a.animationName || a.transitionProperty || 'x'); return { running: out.length }; });
  // no-pref: animations running trên home (1280)
  const ctx3 = await browser.newContext({ viewport: { width: 1280, height: 800 } }); const p3 = await ctx3.newPage();
  await p3.goto(`http://localhost:${port}/#/`); await p3.waitForTimeout(1200);
  rep.noPrefHome = await p3.evaluate(() => { const n = {}; for (const a of document.getAnimations()) { const k = a.animationName || ('t:' + a.transitionProperty); n[k] = (n[k] || 0) + 1; } return n; });
  // DOM size & số phần tử mỗi màn (1280)
  rep.dom = {};
  for (const [name, hash] of SCREENS) { await p3.goto(`http://localhost:${port}/${hash}`); await p3.waitForTimeout(800); rep.dom[name] = await p3.evaluate(() => ({ nodes: document.querySelectorAll('*').length, svgs: document.querySelectorAll('svg').length, imgs: document.querySelectorAll('img').length, lazy: document.querySelectorAll('img[loading=lazy]').length })); }
  // token màu / ratio cố định
  rep.tokens = await p3.evaluate(() => { const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true }); const n = (c) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2]]; }; const L = (c) => { const f = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]; }; const R = (a, b) => { const x = L(a), y = L(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
    const t = (c) => n(c); const paper = t('#f7f4ee'), card = t('#fff'), accent = t('#d97a1e'), ink = t('#14213d'), muted = t('#5b6475'), line = t('#e3ddd1'), seal = t('#b3261e');
    const mix = (a, b, pa) => a.map((v, i) => v * pa + b[i] * (1 - pa)); const accText = mix(accent, ink, .62); const accTint16 = mix(accent, card, .16); const accTint8 = mix(accent, card, .08); const accTint14 = mix(accent, paper, .14);
    const lvs = [.25, .40, .55, .70, .85].map((p) => mix(accent, paper, p));
    const out = { 'muted/paper': R(muted, paper), 'muted/card': R(muted, card), 'accent/paper(focus ring)': R(accent, paper), 'accent/card(focus ring)': R(accent, card), 'accentText/paper': R(accText, paper), 'accentText/card': R(accText, card), 'accentText/tint16(card)': R(accText, accTint16), 'accentText/tint8': R(accText, accTint8), 'accentText/tint14(sidenav on)': R(accText, accTint14), 'accent-ink/accent(btn primary)': R(t('#1a1206'), accent), 'ink/accent': R(ink, accent), 'line/card (viền)': R(line, card), 'line/paper': R(line, paper), 'seal/card': R(seal, card), 'lv0/card': R(line, card), 'lv1/card': R(lvs[0], card), 'lv5/card': R(lvs[4], card), 'lv6 ok/card': R(t('#1f7a4d'), card) };
    for (let i = 0; i < 4; i++) out[`lv${i + 1}→lv${i + 2}`] = R(lvs[i], lvs[i + 1]); out['lv0→lv1'] = R(line, lvs[0]);
    // chip trên giấy: màu chip (accent 55% ink) trên nền accent 16% over paper
    const chipFg = mix(accent, ink, .55); out['chip text/chip bg(paper)'] = R(chipFg, mix(accent, paper, .16)); out['chip text/chip bg(card)'] = R(chipFg, accTint16);
    out['placeholder default(#757575)/card'] = R([117, 117, 117], card);
    return out; });
  rep.shelves = await p3.evaluate(() => { const out = []; document.querySelectorAll('.tk-head').forEach((e, i) => { if (i < 60) out.push(getComputedStyle(e).backgroundColor); }); return [...new Set(out)]; });
  fs.writeFileSync(OUT, JSON.stringify(rep, null, 1)); await browser.close(); server.close(); console.log('ok');
})().catch((e) => { console.error(e); process.exit(1); });
