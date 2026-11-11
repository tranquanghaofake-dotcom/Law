// Dựng ảnh xem trước khi chia sẻ link (Zalo, Facebook, Messenger): apps/web/static/og.png, 1200 × 630.
//   BASE_PATH=/Law/ npm run build && node tools/og-image.cjs
// Mở bản build thật để dùng đúng font, màu và tranh Khuê Văn Các của trang Hôm nay — không vẽ lại riêng.
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('@playwright/test')); }
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', 'apps', 'web', 'dist');
const BASE = process.env.BASE_PATH ?? '/Law/';
const OUT = path.join(__dirname, '..', 'apps', 'web', 'static', 'og.png');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.startsWith(BASE)) p = '/' + p.slice(BASE.length);
  if (p === '/' || p === '') p = '/index.html';
  fs.readFile(path.join(ROOT, p), (err, data) => {
    if (err) { res.statusCode = 404; res.end(); return; }
    res.setHeader('content-type', TYPES[path.extname(p)] ?? 'application/octet-stream');
    res.end(data);
  });
});

(async () => {
  await new Promise((r) => server.listen(0, r));
  const exe = process.env.PW_CHROMIUM ?? (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
  await page.goto(`http://localhost:${server.address().port}${BASE}#/`);
  await page.waitForSelector('.hero-card .stage-art');
  await page.evaluate(async () => {
    const art = document.querySelector('.hero-card .stage-art').cloneNode(true);
    const box = document.createElement('div');
    box.style.cssText = 'position:fixed;inset:0;z-index:99999;background:var(--paper);display:grid;grid-template-columns:1.15fr 1fr;align-items:center;gap:24px;padding:64px 72px;box-sizing:border-box;';
    box.innerHTML = `
      <div>
        <p style="margin:0 0 36px;display:flex;align-items:center;gap:16px;font:800 34px/1 var(--font-ui);color:var(--ink)">
          <span style="display:grid;place-items:center;width:60px;height:60px;border-radius:14px;background:var(--ink);color:var(--paper);font-size:36px">§</span>Luyện Luật</p>
        <p style="margin:0 0 28px;font:800 68px/1.12 var(--font-display);letter-spacing:-.01em;color:var(--ink)">Học khái niệm luật, nhớ theo từng bậc</p>
        <p style="margin:0;font:500 30px/1.45 var(--font-ui);color:var(--muted)">Trắc nghiệm, điền chỗ trống, tình huống. Mỗi khái niệm kèm căn cứ điều luật gốc.</p>
      </div>
      <div data-art style="align-self:stretch;display:grid;place-items:center"></div>`;
    // Giữ class của tranh (màu lấy từ `.art .f-*` trong app.css); chỉ gỡ vị trí tuyệt đối của thẻ Hôm nay.
    art.style.cssText = 'position:static;width:100%;max-width:none;height:auto;margin:0;z-index:auto';
    box.querySelector('[data-art]').append(art);
    document.body.append(box);
    await document.fonts.ready;
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: OUT });
  await browser.close();
  server.close();
  console.log(`Đã ghi ${OUT} (${Math.round(fs.statSync(OUT).size / 1024)} kB)`);
})();
