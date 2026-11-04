// Chụp các màn chính ở 4 bề rộng để đối chiếu trước/sau khi đổi layout.
//   npm run shots                 → tools/shots/<kích cỡ>-<màn>.png (từ apps/web/dist, build sẵn với BASE_PATH=/Law/)
//   SHOTS_OUT=/đường/dẫn npm run shots
// Thêm (học từ nateherkai/scroll-craft, MIT — scripts/shoot.mjs): lượt reduced-motion (rm-*), đo tương phản trên trang
// đã render (contrast.txt) và ảnh ghép sheet.png để xem mọi màn cạnh nhau. Chỉ báo cáo, không làm lệnh thất bại.
// Dùng Chromium của Playwright đã cài; không cần server riêng (tự dựng server tĩnh tạm).
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('@playwright/test')); }
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', 'apps', 'web', 'dist');
const BASE = process.env.BASE_PATH ?? '/Law/';
const OUT = process.env.SHOTS_OUT ?? path.join(__dirname, 'shots');
const WIDTHS = { mobile: [390, 844], tablet: [820, 1180], laptop: [1280, 800], desktop: [1440, 900] };
const SCREENS = [['home', '#/'], ['subjects', '#/mon'], ['subject', '#/mon/hien-phap'], ['concepts', '#/mon/hien-phap/khai-niem/chu-quyen-nhan-dan'], ['quizzes', '#/luyen-de'], ['profile', '#/toi'], ['lesson', '#/hoc/hien-phap/hp-1'], ['quiz', '#/bo/dat-coc']];
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.ogg': 'audio/ogg', '.webmanifest': 'application/manifest+json' };

if (!fs.existsSync(path.join(ROOT, 'index.html'))) { console.error(`Chưa có ${ROOT}. Chạy: BASE_PATH=${BASE} npm run build`); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.startsWith(BASE)) p = '/' + p.slice(BASE.length);
  if (p === '/' || p === '') p = '/index.html';
  const file = path.join(ROOT, p);
  fs.readFile(file, (err, data) => {
    if (err) { res.statusCode = 404; res.end(); return; }
    res.setHeader('content-type', TYPES[path.extname(file)] ?? 'application/octet-stream');
    res.end(data);
  });
});

(async () => {
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  // Container cloud có Chromium ở /opt/pw-browsers/chromium; máy khác: PW_CHROMIUM=… hoặc `npx playwright install chromium`.
  const exe = process.env.PW_CHROMIUM ?? (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const runs = Object.entries(WIDTHS).map(([name, wh]) => ({ name, wh, motion: 'no-preference', prefix: '' }));
  // Giảm chuyển động: chụp 390 và 1280 (hai cỡ bắt buộc của PR) — khung hình ổn định nên đo tương phản ở lượt này.
  for (const name of ['mobile', 'laptop']) runs.push({ name, wh: WIDTHS[name], motion: 'reduce', prefix: 'rm-', audit: true });
  const report = [];
  for (const { name, wh: [w, h], motion, prefix, audit } of runs) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, colorScheme: 'light', reducedMotion: motion });
    for (const [screen, hash] of SCREENS) {
      await page.goto(`http://localhost:${port}${BASE}${hash}`);
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(OUT, `${prefix}${name}-${screen}.png`), fullPage: screen === 'home' });
      if (audit) for (const f of await contrastAudit(page)) report.push(`${prefix}${name}-${screen}\t${f}`);
    }
    await page.close();
  }
  fs.writeFileSync(path.join(OUT, 'contrast.txt'), report.length ? report.join('\n') + '\n' : 'Không có dòng chữ nào dưới ngưỡng AA.\n');
  await contactSheet(browser, runs);
  await browser.close();
  server.close();
  console.log(`Đã chụp ${runs.length * SCREENS.length} ảnh → ${OUT}`);
  console.log(`Tương phản: ${report.length} dòng dưới ngưỡng AA (4,5:1; chữ lớn 3:1) → ${path.join(OUT, 'contrast.txt')}`);
})();

// Đo tương phản trên ảnh thật, không tin vào màu khai báo: nền có thể là tranh SVG, gỗ, gradient.
// Cách làm: ghi màu + khung của từng phần tử có chữ, giấu chữ đi rồi chụp lại để có nền, lấy mẫu điểm ảnh dưới khung,
// tính tương phản với từng điểm và lấy phân vị 10 % xấu nhất (bỏ qua viền lẻ). Chữ trong <svg> không đo.
async function contrastAudit(page) {
  const items = await page.evaluate(() => {
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const seen = new Set();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement;
      if (!el || seen.has(el) || !n.textContent.trim() || el.closest('svg')) continue;
      seen.add(el);
      const cs = getComputedStyle(el);
      // Bỏ: chữ không hiển thị (details đóng, content-visibility), .sr-only 1 px, control bị vô hiệu (WCAG miễn 1.4.3).
      if (cs.visibility === 'hidden' || (el.checkVisibility && !el.checkVisibility({ contentVisibilityAuto: true }))) continue;
      const own = el.getBoundingClientRect();
      if (own.width <= 1 || own.height <= 1 || el.closest(':disabled, [aria-disabled="true"]')) continue;
      const r = document.createRange(); r.selectNodeContents(n);
      // Phần nhìn thấy thật: cắt theo tổ tiên có overflow/clip (bỏ .sr-only, link "Bỏ qua…" đẩy ra ngoài, chữ bị cắt).
      const r0 = r.getBoundingClientRect();
      let b = { left: r0.left, top: r0.top, right: r0.right, bottom: r0.bottom }, clipped = false;
      for (let a = el; a && a !== document.documentElement; a = a.parentElement) {
        const s = getComputedStyle(a);
        if ((s.clip && s.clip !== 'auto') || s.display === 'none') { clipped = true; break; }
        if (s.overflow !== 'visible' || s.position === 'fixed') {
          const q = a.getBoundingClientRect();
          b = { left: Math.max(b.left, q.left), top: Math.max(b.top, q.top), right: Math.min(b.right, q.right), bottom: Math.min(b.bottom, q.bottom) };
        }
      }
      if (b.top + scrollY < 0) clipped = true;
      b = { left: b.left, top: b.top, width: b.right - b.left, height: b.bottom - b.top };
      if (clipped || b.width < 2 || b.height < 2) continue;
      let op = 1; for (let a = el; a; a = a.parentElement) op *= +getComputedStyle(a).opacity;
      if (op < 0.05) continue;
      const m = cs.color.match(/[\d.]+/g).map(Number);
      if ((m[3] ?? 1) < 0.05) continue; // chữ tô bằng background-clip: text — không đo được theo cách này
      const px = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700;
      out.push({ text: n.textContent.trim().slice(0, 40), rgb: m.slice(0, 3), alpha: (m[3] ?? 1) * op,
        x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height, large: px >= 24 || (bold && px >= 18.66) });
    }
    return out;
  });
  const hide = await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;-webkit-text-stroke:0!important}' });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const png = (await page.screenshot({ fullPage: true })).toString('base64');
  await hide.evaluate((n) => n.remove());
  return page.evaluate(async ({ png, items }) => {
    const img = new Image(); img.src = `data:image/png;base64,${png}`; await img.decode();
    const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
    const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0);
    const k = devicePixelRatio; // ảnh fullPage gồm cả thanh cuộn: không chia theo clientWidth
    const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    const fails = [];
    for (const it of items) {
      const x0 = Math.max(0, Math.round(it.x * k)), y0 = Math.max(0, Math.round(it.y * k));
      const w = Math.min(Math.round(it.w * k), img.width - x0), h = Math.min(Math.round(it.h * k), img.height - y0);
      if (w < 1 || h < 1) continue;
      const d = cx.getImageData(x0, y0, w, h).data, step = Math.max(1, Math.floor(Math.sqrt((w * h) / 400)));
      const ratios = [];
      for (let yy = 0; yy < h; yy += step) for (let xx = 0; xx < w; xx += step) {
        const i = (yy * w + xx) * 4, bg = [d[i], d[i + 1], d[i + 2]];
        const fg = it.rgb.map((c, j) => c * it.alpha + bg[j] * (1 - it.alpha));
        const [a, b] = [lum(fg), lum(bg)];
        ratios.push((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05));
      }
      ratios.sort((p, q) => p - q);
      const worst = ratios[Math.floor(ratios.length * 0.1)], need = it.large ? 3 : 4.5;
      if (worst < need) fails.push(`${worst.toFixed(2)}:1 < ${need}\t«${it.text}»`);
    }
    return fails;
  }, { png, items });
}

// Ảnh ghép: mỗi hàng một lượt chụp, mỗi cột một màn (cắt phần đầu trang) → sheet.png.
async function contactSheet(browser, runs) {
  const cell = (f) => `<figure><img src="${f}"><figcaption>${f}</figcaption></figure>`;
  const rows = runs.map(({ name, prefix }) => `<div class="row">${SCREENS.map(([s]) => cell(`${prefix}${name}-${s}.png`)).join('')}</div>`).join('');
  const html = `<!doctype html><meta charset="utf-8"><style>body{margin:12px;font:11px system-ui;background:#ddd}.row{display:flex;gap:8px;margin-bottom:8px}
figure{margin:0;width:180px}img{width:180px;height:300px;object-fit:cover;object-position:left top;display:block;background:#fff}figcaption{padding-top:2px}</style>${rows}`;
  const file = path.join(OUT, 'sheet.html');
  fs.writeFileSync(file, html);
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.goto('file://' + file);
  await page.screenshot({ path: path.join(OUT, 'sheet.png'), fullPage: true });
  await page.close();
  fs.rmSync(file);
}
