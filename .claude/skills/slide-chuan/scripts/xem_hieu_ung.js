#!/usr/bin/env node
// XEM TRƯỚC HIỆU ỨNG XUẤT HIỆN + CHUYỂN CẢNH khi không có PowerPoint: quay MP4 từ <tên>_lop/deck.html của dung.js.
//   node scripts/xem_hieu_ung.js <tên>_lop/deck.html <ra.mp4> [--tu=1] [--den=N] [--giu=1400] [--rong=960] [--fps=20]
// Mô phỏng: phần tử có data-a (fade, rise, up, down, wipe, wipe-r, pop, grow, slide, slide-r, drop, fall, flip, appear…)
// hiện theo data-at (ms tính từ lúc vào slide) hoặc data-click="n" (giả lập bấm mỗi 1,2 s), trong data-dur (mặc định 500 ms);
// chuyển slide theo data-trans của slide sau (fade → mờ chéo, push → đẩy sang trái, none → cắt) trong data-dur của section.
// Hiệu ứng bắt đầu SAU khi chuyển cảnh xong, như PowerPoint. Đây là bản xấp xỉ để soát nhịp; bản thật mở bằng PowerPoint 2019 / 365.
const path = require("path"), fs = require("fs"), os = require("os"), { execFileSync } = require("child_process");

const EASE = (p) => 1 - Math.pow(1 - p, 3);
// trạng thái CSS của một phần tử ở tiến độ p (0 → 1) của hiệu ứng a
function trangThai(a, p) {
  const e = EASE(Math.min(1, Math.max(0, p)));
  switch (a) {
    case "rise": case "up": return { opacity: e, transform: `translateY(${((1 - e) * 60).toFixed(1)}px)` };
    case "down": return { opacity: e, transform: `translateY(${(-(1 - e) * 60).toFixed(1)}px)` };
    case "drop": case "fall": return { opacity: e, transform: `translateY(${(-(1 - e) * 140).toFixed(1)}px)` };
    case "wipe": return { opacity: 1, clipPath: `inset(0 ${((1 - e) * 100).toFixed(1)}% 0 0)` };
    case "wipe-r": return { opacity: 1, clipPath: `inset(0 0 0 ${((1 - e) * 100).toFixed(1)}%)` };
    case "pop": case "grow": case "stamp": case "slam": return { opacity: Math.min(1, e * 1.6), transform: `scale(${(0.6 + 0.4 * e).toFixed(3)})` };
    case "slide": return { opacity: e, transform: `translateX(${(-(1 - e) * 160).toFixed(1)}px)` };
    case "slide-r": return { opacity: e, transform: `translateX(${((1 - e) * 160).toFixed(1)}px)` };
    case "flip": return { opacity: e, transform: `perspective(1200px) rotateY(${((1 - e) * 90).toFixed(1)}deg)` };
    case "appear": return { opacity: p > 0 ? 1 : 0 };
    default: return { opacity: e };
  }
}
// thời điểm bắt đầu / độ dài của từng hiệu ứng; tổng thời lượng slide (chưa gồm phần giữ)
function lich(ds, buocBam = 1200) {
  const pt = ds.map((d) => ({ ...d, bd: d.at != null ? +d.at : d.click != null ? +d.click * buocBam : 0, dur: d.dur ? +d.dur : 500 }));
  return { pt, het: pt.reduce((m, d) => Math.max(m, d.bd + d.dur), 0) };
}
const CHUYEN = { fade: "fade", push: "slideleft", none: "fade" };

module.exports = { trangThai, lich };

if (require.main === module) (async () => {
  const args = process.argv.slice(2), pos = args.filter((a) => !a.startsWith("--")), opt = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? +a.split("=")[1] : d; };
  if (pos.length < 2) { console.error("Dùng: node scripts/xem_hieu_ung.js <deck.html> <ra.mp4> [--tu=1] [--den=N] [--giu=1400] [--rong=960] [--fps=20]"); process.exit(2); }
  let chromium; try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require(path.join(process.cwd(), "node_modules", "playwright"))); }
  const [html, out] = pos, GIU = opt("giu", 1400), RONG = opt("rong", 960), FPS = opt("fps", 20), dt = 1000 / FPS;
  const exe = process.env.PW_CHROMIUM || ["/opt/pw-browsers/chromium"].find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
  const b = await chromium.launch(exe ? { executablePath: exe } : {});
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "xem-hu-"));
  const page = await (await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: RONG / 1920 })).newPage();
  await page.goto("file://" + path.resolve(html)); await page.evaluate(() => window.hinhSanSang); await page.waitForTimeout(500);
  const n = await page.evaluate(() => { const st = document.createElement("style");
    st.textContent = `html, body { margin: 0 !important; background: #000; overflow: hidden; } section.s { position: fixed !important; left: 0 !important; top: 0 !important; margin: 0 !important; display: none !important; } section.s.xem { display: block !important; }`;
    document.head.appendChild(st); return document.querySelectorAll("section.s").length; });
  const tu = opt("tu", 1), den = Math.min(opt("den", n), n), clip = [];
  for (let k = tu - 1; k < den; k++) {
    const info = await page.evaluate((k) => { const ss = document.querySelectorAll("section.s"); ss.forEach((s) => s.classList.remove("xem")); const s = ss[k]; s.classList.add("xem");
      const ds = [...s.querySelectorAll("[data-a]")].map((el, i) => { el.dataset.xi = i; return { i, a: el.dataset.a, at: el.dataset.at, click: el.dataset.click, dur: el.dataset.dur }; });
      return { ds, trans: s.dataset.trans || "fade", tdur: +(s.dataset.dur || 600) }; }, k);
    const { pt, het } = lich(info.ds), truoc = k > tu - 1 ? info.tdur : 0, T = truoc + het + GIU;
    let f = 0;
    for (let t = 0; t <= T; t += dt) {
      const st = pt.map((d) => ({ i: d.i, css: trangThai(d.a, (t - truoc - d.bd) / d.dur) }));
      await page.evaluate((st) => { for (const { i, css } of st) { const el = document.querySelector(`section.s.xem [data-xi="${i}"]`); if (!el) continue; el.style.opacity = css.opacity; el.style.transform = css.transform || ""; el.style.clipPath = css.clipPath || ""; } }, st);
      await page.screenshot({ path: path.join(dir, `s${k}_${String(f++).padStart(5, "0")}.jpg`), type: "jpeg", quality: 82 });
    }
    const c = path.join(dir, `s${k}.mp4`);
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(dir, `s${k}_%05d.jpg`), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", String(FPS), c]);
    clip.push({ c, len: f / FPS, trans: info.trans, tdur: Math.max(0.05, info.tdur / 1000) });
    process.stdout.write(`slide ${k + 1} ${(f / FPS).toFixed(1)} s · `);
  }
  await b.close();
  // nối các đoạn bằng xfade (chuyển cảnh của slide sau)
  if (clip.length === 1) fs.copyFileSync(clip[0].c, out);
  else { let loc = "", trc = "[0:v]", acc = clip[0].len;
    for (let i = 1; i < clip.length; i++) { const d = clip[i].trans === "none" ? 0.05 : clip[i].tdur, o = `[v${i}]`;
      loc += `${trc}[${i}:v]xfade=transition=${CHUYEN[clip[i].trans] || "fade"}:duration=${d}:offset=${(acc - d).toFixed(3)}${o};`; trc = o; acc += clip[i].len - d; }
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...clip.flatMap((x) => ["-i", x.c]), "-filter_complex", loc.replace(/;$/, ""), "-map", trc, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]); }
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`\n✓ ${out}`);
})().catch((e) => { console.error(e); process.exit(1); });
