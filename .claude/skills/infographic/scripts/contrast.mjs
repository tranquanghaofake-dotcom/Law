// Đo tương phản WCAG 2.1 cho mọi phần tử có chữ trong infographic.
// Dùng: node contrast.mjs <index.html>
// Nền được lấy từ background-color của tổ tiên gần nhất (bỏ qua ảnh/gradient — tự kiểm bằng mắt).
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const file = process.argv[2];
if (!file) {
  console.error('Thiếu đường dẫn file HTML.');
  process.exit(1);
}
// Chromium: PW_CHROMIUM nếu có; nếu bản Playwright không tìm thấy trình duyệt của nó thì thử /opt/pw-browsers/chromium.
async function launch() {
  if (process.env.PW_CHROMIUM) return chromium.launch({ executablePath: process.env.PW_CHROMIUM });
  try {
    return await chromium.launch();
  } catch (e) {
    const { existsSync } = await import('node:fs');
    const fallback = '/opt/pw-browsers/chromium';
    if (existsSync(fallback)) return chromium.launch({ executablePath: fallback });
    throw e;
  }
}
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });
await page.goto(pathToFileURL(resolve(file)).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const rows = await page.evaluate(() => {
  const parse = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const over = (top, bottom) => ({
    r: top.r * top.a + bottom.r * (1 - top.a),
    g: top.g * top.a + bottom.g * (1 - top.a),
    b: top.b * top.a + bottom.b * (1 - top.a),
    a: 1,
  });
  const bgOf = (el) => {
    const stack = [];
    for (let n = el; n; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) {
        stack.push(c);
        if (c.a >= 1) break;
      }
    }
    let bg = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = stack.length - 1; i >= 0; i--) bg = over(stack[i], bg);
    return bg;
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const out = [];
  for (const el of document.querySelectorAll('.sheet *')) {
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!own) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const bg = bgOf(el);
    const fg = over(parse(cs.color), bg);
    const L1 = lum(fg), L2 = lum(bg);
    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const px = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    const large = px >= 24 || (bold && px >= 18.66);
    const need = large ? 3 : 4.5;
    out.push({
      text: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 48),
      ratio: Math.round(ratio * 100) / 100,
      need,
      px,
      ok: ratio >= need,
    });
  }
  return out;
});
await browser.close();

const fails = rows.filter((r) => !r.ok);
for (const r of rows) {
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.ratio.toFixed(2)}:1 (cần ${r.need})  ${r.px}px  "${r.text}"`);
}
console.log(`\nTổng ${rows.length} phần tử chữ — ${fails.length} không đạt.`);
process.exit(fails.length ? 1 : 0);
