// Quay/chụp giao diện THẬT của sản phẩm cho video, theo "thời gian ảo" để đủ khung 60 fps đều đặn.
//   node <skill>/scripts/quay_web.mjs jobs.json        (chạy trong thư mục dự án video; ghi vào public/cap/)
//
// jobs.json: mảng việc, mỗi việc:
//   { "name": "ten", "url": "http://localhost:5173/#/trang",
//     "viewport": [432, 768], "scale": 2.5,               // 432×768 @2,5 = 1080×1920 (dọc); [1280,720] @1,5 = 1920×1080
//     "sec": 4,                                          // có → quay video; không có → chụp ảnh tĩnh
//     "element": "#app svg",                             // chụp/quay đúng phần tử (nền trong suốt nếu "alpha": true)
//     "alpha": false, "fullPage": false, "reducedMotion": false,
//     "waitFor": "text=Câu 1",                           // bộ chọn Playwright phải xuất hiện trước khi quay
//     "init": [{ "type": "eval", "js": "..." }],         // chạy trước khi quay (vd. nạp dữ liệu demo vào IndexedDB rồi reload)
//     "pre": [{ "type": "click", "target": "text=…", "wait": 0.8 }],   // thao tác trước khi quay (đi tới đúng màn), không ghi hình
//     "actions": [{ "at": 0.6, "type": "click", "target": "text=Bảo đảm" },
//                 { "at": 0.4, "type": "type", "target": "input", "text": "dat coc", "every": 0.12 }] }
//
// Cách giữ nhịp (ý tưởng từ tungs/timesnap — BSD-3-Clause, tự viết lại; bổ sung phần timesnap không làm được là CSS/WAAPI):
//  1) page.clock.install + pauseAt: setTimeout/rAF/Date/performance.now chỉ tiến khi gọi runFor (mặc định clock vẫn TRÔI theo giờ thật!).
//  2) Mỗi khung: dừng mọi Web Animation/CSS animation và đặt currentTime theo đồng hồ ảo; SVG SMIL dùng setCurrentTime.
//  3) Ghép PNG → mp4 (H.264, crf 14) hoặc webm VP9 có alpha; lưu khung đầu <name>-0.png làm poster.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const req = createRequire(path.join(process.cwd(), 'noop.js'));
let chromium;
for (const m of ['playwright', '@playwright/test']) { try { ({ chromium } = req(m)); break; } catch {} }
if (!chromium) {
  try { const g = execFileSync('npm', ['root', '-g']).toString().trim(); ({ chromium } = createRequire(path.join(g, 'noop.js'))('playwright')); } catch {}
}
if (!chromium) { console.error('Không tìm thấy playwright. Cài: npm i -D playwright (máy đã có Chromium thì đặt PW_CHROMIUM).'); process.exit(1); }

const jobsFile = process.argv[2];
if (!jobsFile) { console.error('Dùng: node quay_web.mjs jobs.json [tên-việc…]'); process.exit(1); }
const only = process.argv.slice(3);
const jobs = JSON.parse(fs.readFileSync(jobsFile, 'utf8')).filter((j) => !only.length || only.includes(j.name));
const OUT = path.resolve('public/cap');
const TMP = path.resolve('.cap-tmp');
const FPS = 60;
fs.mkdirSync(OUT, { recursive: true });

const exe = process.env.PW_CHROMIUM ?? (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const T0 = Date.parse('2026-01-01T09:00:00Z');

async function freeze(page) {
  await page.evaluate(() => {
    const t = performance.now();
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
  });
}

async function act(page, a, t, state) {
  if (a.type === 'type') {
    const want = Math.min(a.text.length, Math.floor(Math.max(0, t - a.at) / (a.every ?? 0.12)) + (t >= a.at ? 1 : 0));
    state[a.target] ??= 0;
    while (state[a.target] < want) { const ch = a.text[state[a.target]++]; await page.locator(a.target).first().press(ch === ' ' ? 'Space' : ch); }
    return;
  }
  if (t < a.at || state[`done${a.at}${a.type}`]) return;
  state[`done${a.at}${a.type}`] = true;
  if (a.type === 'click') await page.locator(a.target).first().click();
  if (a.type === 'press') await page.keyboard.press(a.key);
  if (a.type === 'eval') await page.evaluate(a.js);
}

for (const j of jobs) {
  const [w, h] = j.viewport ?? [432, 768];
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: j.scale ?? 2.5, colorScheme: 'light', reducedMotion: j.reducedMotion ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  for (const s of j.init ?? []) { await page.goto(j.url); await page.waitForTimeout(1200); await page.evaluate(s.js); }
  if (j.sec) { await page.clock.install({ time: T0 }); await page.clock.pauseAt(T0 + 1000); }
  await page.goto(j.url);
  if (j.alpha) await page.addStyleTag({ content: 'html,body{background:transparent!important;background-image:none!important}' });
  for (let i = 0; i < 80; i++) {
    if (j.sec) await page.clock.runFor(100); else await page.waitForTimeout(100);
    if (!j.waitFor || (await page.locator(j.waitFor).count())) break;
  }
  // "pre": thao tác TRƯỚC khi quay (vd. trả lời các câu trước để tới câu cần quay); mỗi bước chạy rồi cho đồng hồ tiến `wait` giây
  for (const a of j.pre ?? []) {
    if (a.type === 'click') await page.locator(a.target).first().click();
    if (a.type === 'press') await page.keyboard.press(a.key);
    if (a.type === 'eval') await page.evaluate(a.js);
    const ms = (a.wait ?? 0.8) * 1000;
    if (j.sec) await page.clock.runFor(ms); else await page.waitForTimeout(ms);
  }
  await page.evaluate(() => document.fonts.ready);
  const target = j.element ? page.locator(j.element).first() : page;
  const shotOpts = { omitBackground: !!j.alpha, ...(j.element ? {} : { fullPage: !!j.fullPage }) };
  if (!j.sec) {
    await page.waitForTimeout(400);
    await target.screenshot({ path: path.join(OUT, `${j.name}.png`), ...shotOpts });
    console.log(`  ✓ ${j.name}.png`);
    await ctx.close();
    continue;
  }
  const dir = path.join(TMP, j.name);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const clip = j.element ? await page.locator(j.element).first().boundingBox() : undefined;
  const n = Math.round(j.sec * FPS), state = {};
  for (let i = 0; i < n; i++) {
    for (const a of j.actions ?? []) await act(page, a, i / FPS, state);
    await page.clock.runFor(Math.round(((i + 1) * 1000) / FPS) - Math.round((i * 1000) / FPS));
    await freeze(page);
    await page.screenshot({ path: path.join(dir, `${String(i).padStart(5, '0')}.png`), clip: clip ?? undefined, omitBackground: !!j.alpha });
  }
  const out = path.join(OUT, `${j.name}.${j.alpha ? 'webm' : 'mp4'}`);
  const args = ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(dir, '%05d.png')];
  if (j.alpha) args.push('-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '6M', '-auto-alt-ref', '0', out);
  else args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '14', '-preset', 'slow', out);
  execFileSync('ffmpeg', args);
  fs.copyFileSync(path.join(dir, '00000.png'), path.join(OUT, `${j.name}-0.png`));
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`  ✓ ${path.basename(out)} (${n} khung) + ${j.name}-0.png`);
  await ctx.close();
}
await browser.close();
fs.rmSync(TMP, { recursive: true, force: true });
