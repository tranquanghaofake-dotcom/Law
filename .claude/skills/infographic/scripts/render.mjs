// Xuất infographic HTML → PNG (và PDF nếu cần) bằng Playwright.
// Dùng: node render.mjs <index.html> [--size a4|social|story] [--pdf]
import { createRequire } from 'node:module';
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
const sizeIdx = args.indexOf('--size');
const size = sizeIdx >= 0 ? args[sizeIdx + 1] : null;
const wantPdf = args.includes('--pdf');

const htmlPath = resolve(file);
const outDir = dirname(htmlPath);
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
const page = await browser.newPage({ viewport: { width: 1200, height: 1600 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
if (size) await page.evaluate((s) => document.querySelector('.sheet')?.setAttribute('data-size', s), size);
await page.evaluate(() => document.fonts.ready);

const sheet = page.locator('.sheet');
const suffix = size ? `-${size}` : '';
const png = join(outDir, `infographic${suffix}.png`);
await sheet.screenshot({ path: png });
console.log('PNG:', png);

const box = await sheet.boundingBox();
const overflow = await page.evaluate(() => {
  const s = document.querySelector('.sheet');
  return s.scrollHeight > s.clientHeight + 1 ? s.scrollHeight - s.clientHeight : 0;
});
if (overflow) console.warn(`CẢNH BÁO: nội dung tràn ${overflow}px khỏi khổ trang.`);

if (wantPdf) {
  const pdf = join(outDir, `infographic${suffix}.pdf`);
  await page.pdf({
    path: pdf,
    width: `${Math.ceil(box.width)}px`,
    height: `${Math.ceil(box.height)}px`,
    printBackground: true,
    pageRanges: '1',
  });
  console.log('PDF:', pdf);
}
await browser.close();
