// Xuất infographic HTML (khổ A4 dọc, .sheet 1080×1528 px) → PNG + PDF A4 để in.
// Dùng: node render.mjs <index.html> [--gray]   (--gray: thêm bản xám khi định photo đen trắng)
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

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
