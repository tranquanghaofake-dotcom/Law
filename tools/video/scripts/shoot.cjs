// Chụp màn hình web thật (390×844 @3x) cho video → public/shots/.
// Cần build trước ở gốc repo: BASE_PATH=/Law/ npm run build
const { chromium } = require('playwright');
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const ROOT = path.join(__dirname, '..', '..', '..', 'apps', 'web', 'dist'), BASE = '/Law/', OUT = path.join(__dirname, '..', 'public', 'shots');
const SCREENS = [['subjects', '#/mon'], ['lesson', '#/hoc/hien-phap/hp-1']];
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => { let p = decodeURIComponent(req.url.split('?')[0]); if (p.startsWith(BASE)) p = '/' + p.slice(BASE.length); if (p === '/') p = '/index.html'; const f = path.join(ROOT, p); fs.readFile(f, (e, d) => { if (e) { res.statusCode = 404; return res.end(); } res.setHeader('content-type', T[path.extname(f)] ?? 'application/octet-stream'); res.end(d); }); });
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  await new Promise((r) => server.listen(0, r)); const url = `http://localhost:${server.address().port}${BASE}`;
  const exe = process.env.PW_CHROMIUM ?? (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const b = await chromium.launch(exe ? { executablePath: exe } : {});
  const page = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, colorScheme: 'light', reducedMotion: 'reduce' });
  for (const [n, h] of SCREENS) { await page.goto(url + h); await page.waitForTimeout(1500); await page.screenshot({ path: path.join(OUT, n + '.png') }); }
  // Bộ đề đặt cọc: chọn đáp án đúng để có khung "Chính xác" + căn cứ Điều 328 BLDS 2015.
  await page.goto(url + '#/bo/dat-coc'); await page.waitForTimeout(1500);
  await page.getByText('Bảo đảm việc giao kết').click(); await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, 'quiz-ok.png') });
  await b.close(); server.close(); console.log('Đã chụp →', OUT);
})();
