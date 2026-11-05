// Quay/chụp asset THẬT của web cho video → public/cap/ (không commit, sinh lại bằng `npm run capture`).
//  - Harness (harness/, Vite riêng) mount thẳng component Svelte: thẻ chuyên cần, màn thắp chuỗi, tủ trưng bày chức danh, bìa sách, tranh.
//  - Bản build web (apps/web/dist) cho luồng thật: trả lời đúng (dấu ĐÚNG), tìm không dấu, Hồ sơ đã nạp sẵn tiến độ.
// Quay theo "thời gian ảo" để mỗi khung 60 fps đều đặn (ý tưởng từ tungs/timesnap — MIT, tự viết lại):
// Playwright clock điều khiển setTimeout/rAF/Date; Web Animations + CSS animation bị dừng và đặt currentTime theo đồng hồ ảo; SMIL dùng setCurrentTime.
// Cần: build web trước (ở gốc: BASE_PATH=/Law/ npm run build).
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const VIDEO = path.join(HERE, '..');
const REPO = path.join(VIDEO, '..', '..');
const OUT = path.join(VIDEO, 'public', 'cap');
const TMP = path.join(VIDEO, '.cap-tmp');
const DIST = path.join(REPO, 'apps', 'web', 'dist');
const FPS = 60;
const only = process.argv.slice(2);
const want = (n) => !only.length || only.some((o) => n.startsWith(o));
fs.mkdirSync(OUT, { recursive: true });
const stats = JSON.parse(fs.readFileSync(path.join(VIDEO, 'src', 'stats.json'), 'utf8'));

// ---------- máy chủ ----------
function serveDist() {
  const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.webmanifest': 'application/manifest+json' };
  const s = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.startsWith('/Law/')) p = p.slice(4);
    if (p === '/' || p === '') p = '/index.html';
    fs.readFile(path.join(DIST, p), (e, d) => { if (e) { res.statusCode = 404; return res.end(); } res.setHeader('content-type', T[path.extname(p)] ?? 'application/octet-stream'); res.end(d); });
  });
  return new Promise((r) => s.listen(0, () => r({ url: `http://localhost:${s.address().port}/Law/`, close: () => s.close() })));
}
async function startHarness() {
  const p = spawn('npx', ['vite', '--config', path.join(VIDEO, 'harness', 'vite.config.mjs')], { cwd: REPO, stdio: 'ignore' });
  for (let i = 0; i < 60; i++) { try { await fetch('http://localhost:5199/'); return p; } catch { await new Promise((r) => setTimeout(r, 500)); } }
  throw new Error('Không mở được harness');
}
const H = (name, props = {}) => `http://localhost:5199/#${name}?${encodeURIComponent(JSON.stringify(props))}`;

// ---------- quay theo thời gian ảo ----------
// clock.install() mặc định vẫn trôi theo giờ thật → phải pauseAt để chỉ tiến khi gọi runFor.
const T0 = new Date('2026-11-05T09:00:00+07:00').getTime();
async function fakeClock(page) { await page.clock.install({ time: T0 }); await page.clock.pauseAt(T0 + 1000); }
async function freezeStep(page, t) {
  await page.evaluate((t) => {
    const seen = (window.__seen ??= new WeakMap());
    for (const a of document.getAnimations()) {
      if (!seen.has(a)) { seen.set(a, t - (a.currentTime ?? 0)); a.pause(); }
      a.currentTime = Math.max(0, t - seen.get(a));
    }
    for (const s of document.querySelectorAll('svg')) {
      if (s.ownerSVGElement) continue;
      if (s.__b == null) { s.__b = t; try { s.pauseAnimations(); } catch {} }
      try { s.setCurrentTime((t - s.__b) / 1000); } catch {}
    }
  }, t);
}
/** Quay `sec` giây thành chuỗi ảnh rồi ghép video. alpha=true → webm VP9 có kênh trong suốt. */
async function record(page, name, sec, { clip, alpha = false, act } = {}) {
  const dir = path.join(TMP, name);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const n = Math.round(sec * FPS);
  
  for (let i = 0; i < n; i++) {
    if (act) await act(i / FPS, page);
    await page.clock.runFor(Math.round(((i + 1) * 1000) / FPS) - Math.round((i * 1000) / FPS));
    await freezeStep(page, await page.evaluate(() => performance.now()));
    await page.screenshot({ path: path.join(dir, `${String(i).padStart(5, '0')}.png`), clip, omitBackground: alpha });
  }
  const out = path.join(OUT, `${name}.${alpha ? 'webm' : 'mp4'}`);
  const args = ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(dir, '%05d.png')];
  if (alpha) args.push('-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '6M', '-auto-alt-ref', '0', out);
  else args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '14', '-preset', 'slow', out);
  execFileSync('ffmpeg', args);
  if (!alpha) fs.copyFileSync(path.join(dir, '00000.png'), path.join(OUT, `${name}-0.png`)); // khung đầu để giữ hình trước khi video chạy
  if (!process.env.KEEP) fs.rmSync(dir, { recursive: true, force: true });
  console.log(`  ✓ ${path.basename(out)} (${n} khung)`);
}
async function shot(page, name, el = '#app') {
  await page.locator(el).first().screenshot({ path: path.join(OUT, `${name}.png`), omitBackground: true });
}
async function openHarness(browser, name, props, viewport = { width: 1000, height: 1000 }, scale = 3, clock = false) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: scale });
  if (clock) await fakeClock(page);
  await page.goto(H(name, props));
  if (clock) await page.clock.runFor(200);
  await page.waitForFunction(() => document.body.dataset.ready === '1');
  await page.evaluate(() => document.fonts.ready);
  return page;
}

// ---------- tiến độ giả cho Hồ sơ ----------
function allConcepts() {
  const dir = path.join(REPO, 'packages', 'content', 'data', 'concepts');
  const out = [];
  for (const d of fs.readdirSync(dir)) for (const f of fs.readdirSync(path.join(dir, d))) if (f.endsWith('.json')) { const c = JSON.parse(fs.readFileSync(path.join(dir, d, f), 'utf8')); out.push({ id: c.id, subject: c.subject }); }
  return out;
}
async function seed(page, { level = 6, streak = 120 } = {}) {
  const concepts = allConcepts();
  await page.evaluate(async ({ concepts, level, streak }) => {
    const db = await new Promise((r, j) => { const q = indexedDB.open('luyen-luat'); q.onsuccess = () => r(q.result); q.onerror = j; });
    const now = Date.now(), day = new Date().toLocaleDateString('sv');
    const tx = db.transaction(['concepts', 'stats'], 'readwrite');
    for (const c of concepts) tx.objectStore('concepts').put({ conceptId: c.id, subject: c.subject, level, wrongStreak: 0, updatedAt: now,
      card: { due: new Date(now + 30 * 864e5), stability: 60, difficulty: 4, elapsed_days: 10, scheduled_days: 30, learning_steps: 0, reps: 8, lapses: 0, state: 2, last_review: new Date(now) } });
    tx.objectStore('stats').put({ key: 'streak', value: { count: streak, lastDay: day, freezes: 2, longest: streak } });
    tx.objectStore('stats').put({ key: 'xp', value: 48210 });
    await new Promise((r) => (tx.oncomplete = r));
    db.close();
  }, { concepts, level, streak });
}

// ---------- việc ----------
const exe = process.env.PW_CHROMIUM ?? (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const harness = await startHarness();
const app = await serveDist();
try {
  if (want('ignite')) {
    console.log('Màn thắp chuỗi');
    for (const count of (process.env.COUNTS ?? '75').split(',').map(Number)) {
      const p = await openHarness(browser, 'ignite', { count }, { width: 540, height: 960 }, 2, true);
      await record(p, `ignite-${count}`, Number(process.env.SEC ?? 8.5));
      await p.close();
    }
  }
  if (want('card')) {
    console.log('Thẻ chuyên cần (4 màu chu kỳ)');
    for (const count of [25, 50, 75, 100]) { const p = await openHarness(browser, 'card', { count, longest: count }); await p.waitForTimeout(400); await shot(p, `card-${count}`, '#app svg'); await p.close(); }
  }
  if (want('portrait')) {
    console.log('Tủ trưng bày chức danh');
    const posts = ['cong-dan', 'cong-chuc-xa', 'chu-tich-xa', 'giam-doc-so', 'chu-tich-tinh', 'bo-truong', 'thu-tuong', 'dai-bieu-quoc-hoi', 'chu-tich-qh', 'tham-phan', 'chanh-an-tc', 'kiem-sat-vien', 'vien-truong-tc', 'chu-tich-nuoc'];
    for (const post of posts) { const p = await openHarness(browser, 'portrait', { post, w: 460 }); await p.waitForTimeout(500); await shot(p, `post-${post}`); await p.close(); }
    const p = await openHarness(browser, 'portrait', { post: 'chu-tich-nuoc', w: 460, celebrate: true }, { width: 600, height: 900 }, 2, true);
    const box = await p.locator('#app').boundingBox();
    await record(p, 'post-celebrate', 5, { clip: box, alpha: true });
    await p.close();
  }
  if (want('cover')) {
    console.log('Bìa sách 23 môn');
    for (const s of stats.subjectList) { const p = await openHarness(browser, 'subjectcover', { id: s.id, title: s.title, w: 300, state: 'done', percent: 100 }); await shot(p, `cover-${s.id}`, '#app svg'); await p.close(); }
  }
  if (want('art')) {
    console.log('Tranh kiến trúc');
    for (const name of ['khue-van-cac', 'quoc-hoi', 'toa-an', 'ngo-mon', 'tam-quan', 'bia-tien-si', 'chua-mot-cot', 'ha-long', 'thien-mu', 'hoi-an']) { const p = await openHarness(browser, 'art', { name, w: 1000 }); await p.waitForTimeout(300); await shot(p, `art-${name}`); await p.close(); }
  }
  // ---- luồng thật trên bản build ----
  const phone = { viewport: { width: 432, height: 768 }, deviceScaleFactor: 2.5, colorScheme: 'light' };
  if (want('quiz')) {
    console.log('Trả lời đúng: dấu ĐÚNG');
    const ctx = await browser.newContext(phone); const p = await ctx.newPage();
    await fakeClock(p); await p.goto(app.url + '#/bo/dat-coc');
    for (let i = 0; i < 30; i++) { await p.clock.runFor(100); if (await p.getByText('Bảo đảm việc giao kết').count()) break; await p.waitForTimeout(100); }
    await p.evaluate(() => document.fonts.ready);
    let clicked = false;
    await record(p, 'quiz-dung', 4.2, { act: async (t, pg) => { if (!clicked && t >= 0.6) { clicked = true; await pg.getByText('Bảo đảm việc giao kết').click(); } } });
    await ctx.close();
  }
  if (want('search')) {
    console.log('Tìm không dấu');
    const ctx = await browser.newContext(phone); const p = await ctx.newPage();
    await fakeClock(p); await p.goto(app.url + '#/mon/dan-su-2/khai-niem');
    for (let i = 0; i < 30; i++) { await p.clock.runFor(100); if (await p.locator('input[type=search], input').count()) break; await p.waitForTimeout(100); }
    await p.evaluate(() => document.fonts.ready); await p.clock.runFor(800);
    const text = 'dat coc'; let k = 0;
    await record(p, 'search', 3.2, { act: async (t, pg) => { const want = Math.min(text.length, Math.floor(Math.max(0, t - 0.4) / 0.12)); while (k < want) { await pg.locator('input').first().press(text[k] === ' ' ? 'Space' : text[k]); k++; } } });
    await ctx.close();
  }
  if (want('profile')) {
    console.log('Hồ sơ đã nạp tiến độ');
    for (const [name, size] of [['profile-phone', phone], ['profile-desk', { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1.5, colorScheme: 'light' }]]) {
      const ctx = await browser.newContext({ ...size, reducedMotion: 'reduce' }); const p = await ctx.newPage();
      await p.goto(app.url + '#/'); await p.waitForTimeout(1500); await seed(p);
      await p.goto(app.url + '#/toi'); await p.reload(); await p.waitForTimeout(3000);
      await p.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
      await ctx.close();
    }
  }
  if (want('lesson')) {
    console.log('Thẻ khái niệm (sơ đồ + mẹo nhớ)');
    const ctx = await browser.newContext({ ...phone, reducedMotion: 'reduce' }); const p = await ctx.newPage();
    await p.goto(app.url + '#/mon/dan-su/khai-niem/dat-coc'); await p.waitForTimeout(2500);
    await p.screenshot({ path: path.join(OUT, 'concept-dat-coc.png'), fullPage: true });
    await ctx.close();
  }
} finally {
  await browser.close(); harness.kill(); app.close();
  if (!process.env.KEEP) fs.rmSync(TMP, { recursive: true, force: true });
}
