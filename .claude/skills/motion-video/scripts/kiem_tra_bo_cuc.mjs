#!/usr/bin/env node
// Kiểm bố cục bằng máy TRƯỚC khi render cả video: dựng từng khung lấy mẫu với inputProps {probe:true},
// đọc hộp chữ/ảnh do src/core/probe.tsx ghi ra, rồi bắt các lỗi mà mắt hay bỏ sót trên tờ xem nhanh.
//
//   node <skill>/scripts/kiem_tra_bo_cuc.mjs <dự án> [--every 0.25] [--from giây] [--to giây]
//
// Một lỗi chỉ được tính khi có ở 2 mẫu liên tiếp (kéo dài ≥ --every giây) — bỏ qua khung đang nện chữ / đang chuyển cảnh.
// LỖI (phải sửa): chữ đè chữ > 15 % hộp nhỏ hơn · chữ tràn ra ngoài khung · khung TRỐNG (không chữ, không ảnh) > 0,8 s
// CẢNH BÁO: chữ nằm ngoài vùng an toàn của nền tảng · chữ nhỏ hơn mức đọc được trên điện thoại · khung THƯA (phủ < 4 %) > 2 s
// Ghi out/review/bo_cuc.json (mọi khung, mọi hộp) để tra lại. Thoát 1 nếu có LỖI.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const args = process.argv.slice(2);
const proj = path.resolve(args.find((a) => !a.startsWith("--")) ?? ".");
const opt = (k, d) => (args.includes(k) ? parseFloat(args[args.indexOf(k) + 1]) : d);
const req = createRequire(path.join(proj, "package.json"));
const { bundle } = req("@remotion/bundler");
const { selectComposition, renderStill, openBrowser } = req("@remotion/renderer");

const chromium = process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium";
const browserExecutable = fs.existsSync(chromium) ? chromium : null;
console.log("Đóng gói dự án…");
const serveUrl = await bundle({ entryPoint: path.join(proj, "src/index.ts"), onProgress: () => {} });
const inputProps = { probe: true };
const browser = await openBrowser("chrome", { browserExecutable, chromiumOptions: { gl: "swangle" } });
const comp = await selectComposition({ serveUrl, id: "Main", inputProps, puppeteerInstance: browser, browserExecutable });
const { fps, width: W, height: H, durationInFrames: N } = comp;
const VERT = H > W;
// vùng an toàn: dọc theo TikTok/Reels (trên 168, chữ trong dải tới 1330, chừa cột nút phải 120); ngang 4 % mép
const SAFE = VERT ? { top: 168, bottom: 1330, left: 40, right: W - 120 } : { top: H * 0.04, bottom: H * 0.96, left: W * 0.04, right: W * 0.96 };
const MIN_FS = Math.round(Math.min(W, H) * 0.024); // dưới mức này thu về 360 px là không đọc được
const step = Math.max(1, Math.round(opt("--every", 0.25) * fps));
const f0 = Math.round(opt("--from", 0) * fps);
const f1 = Math.min(N - 1, Math.round(opt("--to", N / fps) * fps));

const frames = [];
for (let f = f0; f <= f1; f += step) frames.push(f);
console.log(`${frames.length} khung (mỗi ${step} khung) · ${W}×${H}@${fps} · ${(N / fps).toFixed(1)} s`);
const tmp = path.join(proj, "out", "review", "_probe.jpeg");
fs.mkdirSync(path.dirname(tmp), { recursive: true });
const data = [];
for (const frame of frames) {
  let got = null;
  await renderStill({
    serveUrl, composition: comp, frame, inputProps, output: tmp, imageFormat: "jpeg", scale: 0.25, puppeteerInstance: browser, browserExecutable,
    onBrowserLog: (l) => { if (l.text.startsWith("MVPROBE ")) got = JSON.parse(l.text.slice(8)); },
  });
  if (!got) { console.error(`khung ${frame}: không nhận được số đo (Main.tsx thiếu <Probe/>?)`); process.exit(2); }
  data.push(got);
  if (data.length % 20 === 0) process.stdout.write(`  ${data.length}/${frames.length}\r`);
}
await browser.close({ silent: true });
fs.rmSync(tmp, { force: true });

const inter = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
const clipArea = (e) => Math.max(0, Math.min(e.x + e.w, W) - Math.max(e.x, 0)) * Math.max(0, Math.min(e.y + e.h, H) - Math.max(e.y, 0));
const sec = (f) => (f / fps).toFixed(2) + " s";
const loi = [], canh = [];
const once = new Set();
// Lỗi bố cục phải KÉO DÀI: chỉ tính khi cùng lỗi có ở 2 mẫu liên tiếp (≥ 1 bước lấy mẫu). Khung đang nện chữ (scale 2→1)
// hay đang whip chuyển cảnh chỉ chồng nhau vài khung — mắt người không thấy, đừng báo.
let prevKeys = new Set(), curKeys = new Set();
const add = (list, key, msg) => {
  if (list === loi || list === canh) curKeys.add(key);
  if (!prevKeys.has(key) || once.has(key)) return;
  once.add(key);
  list.push(msg);
};
const addNow = (list, key, msg) => { if (!once.has(key)) { once.add(key); list.push(msg); } };
let emptyRun = null, thinRun = null;
const flushRun = (run, f, limit, list, kind) => {
  if (run !== null && (f - run) / fps > limit) addNow(list, `${kind}${run}`, `${kind} ${sec(run)}–${sec(f)}: ${((f - run) / fps).toFixed(1)} s ${kind === "TRỐNG" ? "không có chữ hay ảnh nào" : "chỉ phủ < 4 % khung"} → thêm nội dung cùng phong cách hoặc rút ngắn`);
};
for (const d of data) {
  prevKeys = curKeys;
  curKeys = new Set();
  const t = d.boxes.filter((b) => b.kind === "text");
  const m = d.boxes.filter((b) => b.kind === "media");
  // xét đè bằng hộp DÒNG (cao = line-height, giữa hộp chữ) — hộp chữ đo được cao hơn dòng vì chừa chỗ cho dấu
  const core = t.map((b) => (b.lh && b.lh < b.h ? { ...b, y: b.y + (b.h - b.lh) / 2, h: b.lh } : b));
  for (let i = 0; i < t.length; i++) for (let j = i + 1; j < t.length; j++) {
    const r = inter(core[i], core[j]) / Math.min(core[i].w * core[i].h, core[j].w * core[j].h);
    if (r > 0.15 && t[i].t !== t[j].t) add(loi, `dè${t[i].t}|${t[j].t}`, `ĐÈ CHỮ từ ~${sec(d.frame - step)}: "${t[i].t}" ✕ "${t[j].t}" ${(r * 100) | 0} %`);
  }
  for (const b of t) {
    if (b.x < -1 || b.y < -1 || b.x + b.w > W + 1 || b.y + b.h > H + 1) add(loi, `tràn${b.t}`, `TRÀN KHUNG từ ~${sec(d.frame - step)}: "${b.t}" (${b.x | 0},${b.y | 0} ${b.w | 0}×${b.h | 0})`);
    else if (b.y < SAFE.top || b.y + b.h > SAFE.bottom || b.x < SAFE.left || b.x + b.w > SAFE.right) add(canh, `an${b.t}`, `NGOÀI VÙNG AN TOÀN từ ~${sec(d.frame - step)}: "${b.t}" (${b.x | 0},${b.y | 0} ${b.w | 0}×${b.h | 0}) — dưới UI nền tảng thì không đọc được`);
    if (b.fs && b.fs < MIN_FS) add(canh, `nho${b.t}`, `CHỮ NHỎ từ ~${sec(d.frame - step)}: "${b.t}" cỡ ${b.fs} px < ${MIN_FS} px (thu về điện thoại không đọc được)`);
  }
  const cover = Math.min(1, [...t, ...m].reduce((s, e) => s + clipArea(e), 0) / (W * H));
  if (!t.length && !m.length) { emptyRun ??= d.frame; } else { flushRun(emptyRun, d.frame, 0.8, loi, "TRỐNG"); emptyRun = null; }
  if (cover < 0.04 && (t.length || m.length)) { thinRun ??= d.frame; } else { flushRun(thinRun, d.frame, 2, canh, "THƯA"); thinRun = null; }
}
const last = data.length ? data[data.length - 1].frame + step : 0;
flushRun(emptyRun, last, 0.8, loi, "TRỐNG");
flushRun(thinRun, last, 2, canh, "THƯA");

fs.writeFileSync(path.join(proj, "out", "review", "bo_cuc.json"), JSON.stringify({ W, H, fps, step, frames: data }, null, 0));
for (const x of loi) console.log("  LỖI:", x);
for (const x of canh) console.log("  CẢNH BÁO:", x);
console.log(loi.length ? `ĐỎ (${loi.length} lỗi)` : "XANH", "· số đo từng khung: out/review/bo_cuc.json");
process.exit(loi.length ? 1 : 0);
