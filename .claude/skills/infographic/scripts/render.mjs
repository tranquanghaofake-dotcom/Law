// Xuất infographic HTML (khổ A4 dọc, .sheet 1080×1528 px) → PNG + PDF A4 để in.
// Dùng: node render.mjs <index.html> [--gray]   (--gray: thêm bản xám khi định photo đen trắng)
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Không chết khi đầu ra bị cắt (vd. `| head`): vẫn ghi đủ PNG và PDF.
process.stdout.on('error', () => {});
process.stderr.on('error', () => {});
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
if (!file) {
  console.error('Thiếu đường dẫn file HTML.');
  process.exit(1);
}
const wantGray = args.includes('--gray');
const htmlPath = resolve(file);
const outDir = dirname(htmlPath);

// Chromium: PW_CHROMIUM nếu có; nếu bản Playwright không tìm thấy trình duyệt của nó thì thử /opt/pw-browsers/chromium.
async function launch() {
  if (process.env.PW_CHROMIUM) return chromium.launch({ executablePath: process.env.PW_CHROMIUM });
  try {
    return await chromium.launch();
  } catch (e) {
    const fallback = '/opt/pw-browsers/chromium';
    if (existsSync(fallback)) return chromium.launch({ executablePath: fallback });
    throw e;
  }
}

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1600 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const sheet = page.locator('.sheet');
const box = await sheet.boundingBox();
if (Math.abs(box.height / box.width - 297 / 210) > 0.01) {
  console.warn(`CẢNH BÁO: .sheet ${box.width}×${box.height} không đúng tỉ lệ A4 (1080×1528).`);
}
const overflow = await page.evaluate(() => {
  const s = document.querySelector('.sheet');
  return Math.max(0, s.scrollHeight - s.clientHeight);
});
if (overflow > 1) console.warn(`CẢNH BÁO: nội dung tràn ${overflow}px khỏi khổ A4.`);

// Tự kiểm bố cục: (1) chữ nằm ngoài vùng an toàn in, (2) chữ đè chữ, (3) chữ tràn khỏi khung.
// Phần tử cố ý ra sát mép gắn data-margin (ngưỡng 26 px ≈ 5 mm); nhãn cố ý nằm ngoài khung gắn data-free.
const issues = await page.evaluate(() => {
  const sheet = document.querySelector('.sheet').getBoundingClientRect();
  const out = [];
  const label = (el) => el.textContent.trim().replace(/\s+/g, ' ').slice(0, 40);
  // các đoạn chữ thật (theo dòng), không dùng hộp phần tử để tránh báo nhầm
  const runs = [];
  const walker = document.createTreeWalker(document.querySelector('.sheet'), NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const r = document.createRange();
    r.selectNodeContents(n);
    for (const b of r.getClientRects()) if (b.width > 1 && b.height > 1) runs.push({ el, b });
  }
  for (const { el, b } of runs) {
    const safe = el.closest('[data-margin]') ? 26 : 52;
    const d = Math.min(b.left - sheet.left, b.top - sheet.top, sheet.right - b.right, sheet.bottom - b.bottom);
    if (d < safe) out.push(`Sát mép ${Math.round(d)}px (cần ≥${safe}): "${label(el)}"`);
  }
  const seen = new Set();
  for (let i = 0; i < runs.length; i++) {
    for (let j = i + 1; j < runs.length; j++) {
      const a = runs[i], c = runs[j];
      if (a.el === c.el || a.el.contains(c.el) || c.el.contains(a.el)) continue;
      const w = Math.min(a.b.right, c.b.right) - Math.max(a.b.left, c.b.left);
      const h = Math.min(a.b.bottom, c.b.bottom) - Math.max(a.b.top, c.b.top);
      if (w > 2 && h > 3) {
        const k = label(a.el) + '|' + label(c.el);
        if (!seen.has(k)) { seen.add(k); out.push(`Chữ đè chữ: "${label(a.el)}" ↔ "${label(c.el)}"`); }
      }
    }
  }
  // khung = tổ tiên gần nhất có nền hoặc viền nhìn thấy được (thẻ, thanh, con dấu…)
  const isBox = (x) => {
    const cs = getComputedStyle(x);
    const bg = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent';
    return bg || parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0;
  };
  const flagged = new Set();
  for (const { el, b } of runs) {
    if (el.closest('[data-free]')) continue; // nhãn cố ý đặt ngoài khung (vd. số trên thanh đo)
    let box = el;
    while (box && !box.matches('.sheet') && !isBox(box)) box = box.parentElement;
    if (!box || box.matches('.sheet')) continue;
    const R = box.getBoundingClientRect();
    const bs = getComputedStyle(box);
    // so với mép trong của viền: chữ chạm/đè lên viền cũng tính là tràn
    const r = { left: R.left + parseFloat(bs.borderLeftWidth), right: R.right - parseFloat(bs.borderRightWidth), top: R.top + parseFloat(bs.borderTopWidth), bottom: R.bottom - parseFloat(bs.borderBottomWidth) };
    const over = Math.max(b.right - r.right, b.bottom - r.bottom, r.left - b.left, r.top - b.top);
    if (over > 1 && !flagged.has(el)) { flagged.add(el); out.push(`Chữ tràn khung ${Math.round(over)}px: "${label(el)}"`); }
  }
  return out;
});
if (issues.length) {
  console.warn(`TỰ KIỂM: ${issues.length} vấn đề bố cục`);
  for (const m of issues) console.warn('  - ' + m);
} else console.log('TỰ KIỂM: bố cục ổn (vùng an toàn, không đè chữ, không tràn khung).');

const png = join(outDir, 'infographic.png');
await sheet.screenshot({ path: png });
console.log('PNG:', png);

// PDF đúng khổ A4, không lề máy; thu phóng 1080 px → 210 mm.
const pdf = join(outDir, 'infographic.pdf');
await page.addStyleTag({ content: '@page{size:A4;margin:0} html,body{background:#fff!important} .sheet{margin:0!important}' });
await page.pdf({ path: pdf, format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, scale: 793.7 / box.width, pageRanges: '1' });
console.log('PDF:', pdf);

if (wantGray) {
  await page.addStyleTag({ content: '.sheet{filter:grayscale(1)}' });
  const gray = join(outDir, 'infographic-xam.png');
  await sheet.screenshot({ path: gray });
  console.log('Bản xám (thử photo đen trắng):', gray);
}
await browser.close();
