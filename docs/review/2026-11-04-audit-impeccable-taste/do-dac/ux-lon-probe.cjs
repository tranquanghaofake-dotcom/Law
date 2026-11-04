// Probe theo checklist ui-ux-pro-max: tràn ngang, nhảy cấp heading, vùng bấm < 24 px, tương phản chữ < 4.5 (3 cho chữ lớn), lỗi console.
const { chromium } = require('playwright');
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const ROOT = process.argv[2], BASE = '/Law/';
const SCREENS = [['home', '#/'], ['subjects', '#/mon'], ['subject', '#/mon/hien-phap'], ['concepts-list', '#/mon/hien-phap/khai-niem'], ['concept', '#/mon/hien-phap/khai-niem/chu-quyen-nhan-dan'], ['quizzes', '#/luyen-de'], ['profile', '#/toi'], ['settings', '#/cai-dat'], ['lesson', '#/hoc/hien-phap/hp-1'], ['quiz', '#/bo/dat-coc'], ['review', '#/on']];
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p.startsWith(BASE)) p = '/' + p.slice(BASE.length); if (p === '/') p = '/index.html'; fs.readFile(path.join(ROOT, p), (e, d) => { if (e) { res.statusCode = 404; return res.end(); } res.setHeader('content-type', TYPES[path.extname(p)] ?? 'application/octet-stream'); res.end(d); }); });
const inPage = () => {
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (m) { const v = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v[3] ?? 1]; } const n = c.match(/color\(srgb ([^)]+)\)/); if (n) { const v = n[1].split(/[ \/]+/).filter(Boolean).map(Number); return [v[0] * 255, v[1] * 255, v[2] * 255, v[3] ?? 1]; } return null; };
  const lum = ([r, g, b]) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const blend = (top, bot) => [0, 1, 2].map((i) => top[i] * top[3] + bot[i] * (1 - top[3])).concat(1);
  const bgOf = (el) => { const stack = []; for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.backgroundImage !== 'none' && !cs.backgroundImage.startsWith('url')) return null; const c = parse(cs.backgroundColor); if (c && c[3] > 0) { stack.push(c); if (c[3] >= 1) break; } } let bg = [255, 255, 255, 1]; for (const c of stack.reverse()) bg = blend(c, bg); return bg; };
  const out = { overflow: document.documentElement.scrollWidth > innerWidth + 1, headings: [], skips: [], small: [], contrast: [] };
  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter((h) => !h.closest('[hidden]'));
  let prev = 0; for (const h of hs) { const l = +h.tagName[1]; if (prev && l > prev + 1) out.skips.push(`${h.tagName} sau H${prev}: ${h.textContent.trim().slice(0, 40)}`); prev = l; }
  out.headings = hs.length;
  for (const el of document.querySelectorAll('a[href],button,input,select,summary,[role=button],[tabindex="0"]')) {
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue; const cs = getComputedStyle(el); if (cs.visibility === 'hidden') continue;
    if (el.classList.contains('sr-only') || el.closest('.sr-only')) continue;
    if (el.tagName === 'INPUT' && (el.type === 'file' || el.type === 'checkbox' && el.closest('label'))) continue;
    const inline = el.tagName === 'A' && cs.display === 'inline' && el.parentElement && /^(P|LI|SPAN|SMALL|TD|NAV)$/.test(el.parentElement.tagName) && el.parentElement.textContent.trim().length > el.textContent.trim().length + 3;
    if (inline) continue;
    // vùng bấm mở rộng bằng ::after
    const af = getComputedStyle(el, '::after'); const afH = af.content !== 'none' && af.position === 'absolute' ? parseFloat(af.height) || 0 : 0;
    if ((r.width < 24 || Math.max(r.height, afH) < 24)) out.small.push(`${el.tagName}.${[...el.classList].join('.')} ${Math.round(r.width)}×${Math.round(r.height)} «${(el.getAttribute('aria-label') || el.textContent).trim().slice(0, 30)}»`);
  }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const seen = new Set();
  while (walker.nextNode()) { const t = walker.currentNode; if (!t.textContent.trim()) continue; const el = t.parentElement; if (seen.has(el)) continue; seen.add(el);
    if (el.closest('svg,[aria-hidden=true],.sr-only,script,style,noscript')) continue; const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden') continue; let fg = parse(cs.color); const bg = bgOf(el); if (!fg || !bg) continue;
    let op = 1; for (let e = el; e; e = e.parentElement) op *= parseFloat(getComputedStyle(e).opacity);
    fg = blend([fg[0], fg[1], fg[2], fg[3] * op], bg);
    const L1 = lum(fg), L2 = lum(bg), ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700; const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
    if (ratio < need) out.contrast.push(`${ratio.toFixed(2)} «${t.textContent.trim().slice(0, 30)}» ${el.tagName}.${[...el.classList].join('.')}`);
  }
  return out;
};
(async () => {
  await new Promise((r) => server.listen(0, r)); const port = server.address().port;
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined }); let total = 0; const report = {};
  for (const [w, h] of [[390, 844], [1280, 800]]) for (const [name, hash] of SCREENS) {
    const page = await browser.newPage({ viewport: { width: w, height: h } }); const errs = [];
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 100)); }); page.on('pageerror', (e) => errs.push(String(e).slice(0, 100)));
    await page.goto(`http://localhost:${port}${BASE}${hash}`); await page.waitForTimeout(1200);
    if (name === 'quiz') { const o = page.locator('.opt').first(); if (await o.count()) { await o.click(); await page.waitForTimeout(500); } }
    const r = await page.evaluate(inPage); r.console = errs.filter((e) => !/manifest|tts|404/.test(e));
    const n = (r.overflow ? 1 : 0) + r.skips.length + r.small.length + r.contrast.length + r.console.length; total += n;
    report[`${w}-${name}`] = r; console.log(`${w} ${name.padEnd(14)} lỗi=${n} h=${r.headings}${r.overflow ? ' TRÀN' : ''}`);
    for (const k of ['skips', 'small', 'contrast', 'console']) for (const x of r[k].slice(0, 6)) console.log(`   ${k}: ${x}`);
    await page.close();
  }
  console.log('TỔNG', total); fs.writeFileSync(path.join(process.env.REPORT_DIR || require('node:os').tmpdir(), 'ux-probe-report.json'), JSON.stringify(report, null, 1));
  await browser.close(); server.close();
})();
