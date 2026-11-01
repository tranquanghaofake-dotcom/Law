// Chụp các màn chính ở 4 bề rộng để đối chiếu trước/sau khi đổi layout.
//   npm run shots                 → tools/shots/<kích cỡ>-<màn>.png (từ apps/web/dist, build sẵn với BASE_PATH=/Law/)
//   SHOTS_OUT=/đường/dẫn npm run shots
// Dùng Chromium của Playwright đã cài; không cần server riêng (tự dựng server tĩnh tạm).
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('@playwright/test')); }
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', 'apps', 'web', 'dist');
const BASE = process.env.BASE_PATH ?? '/Law/';
const OUT = process.env.SHOTS_OUT ?? path.join(__dirname, 'shots');
const WIDTHS = { mobile: [390, 844], tablet: [820, 1180], laptop: [1280, 800], desktop: [1440, 900] };
const SCREENS = [['home', '#/'], ['subjects', '#/mon'], ['subject', '#/mon/hien-phap'], ['quizzes', '#/luyen-de'], ['profile', '#/toi'], ['lesson', '#/hoc/hien-phap/hp-1'], ['quiz', '#/bo/dat-coc']];
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
  for (const [name, [w, h]] of Object.entries(WIDTHS)) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    for (const [screen, hash] of SCREENS) {
      await page.goto(`http://localhost:${port}${BASE}${hash}`);
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(OUT, `${name}-${screen}.png`), fullPage: screen === 'home' });
    }
    await page.close();
  }
  await browser.close();
  server.close();
  console.log(`Đã chụp ${Object.keys(WIDTHS).length * SCREENS.length} ảnh → ${OUT}`);
})();
