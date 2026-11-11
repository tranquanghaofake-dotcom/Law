#!/usr/bin/env node
// Dựng nhanh các KHUNG TĨNH để soát bằng mắt trước khi render cả video (đóng gói một lần, không dựng lại cho từng khung),
// rồi ghép thành một tờ soát. Nhanh hơn nhiều so với gọi `remotion still` từng khung.
//
//   node <skill>/scripts/khung_tinh.mjs <dự án> [--n 12] [--frames 0,90,240] [--scale 0.5] [--cols 4]
//
// Mặc định lấy --n khung: mỗi cảnh 2 khung (lúc 45 % và 92 % độ dài cảnh — giữa cảnh và ngay trước điểm cắt), rải cho đủ số.
// Ra: out/khung/f-<số khung>.jpg và out/khung/to-soat.jpg (cần ffmpeg để ghép tờ soát; không có thì vẫn có ảnh rời).
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const args = process.argv.slice(2);
const proj = path.resolve(args.find((a, i) => !a.startsWith("--") && !(args[i - 1] ?? "").startsWith("--")) ?? ".");
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const req = createRequire(path.join(proj, "package.json"));
const { bundle } = req("@remotion/bundler");
const { selectComposition, renderStill, openBrowser } = req("@remotion/renderer");
const chromium = process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium";
const browserExecutable = fs.existsSync(chromium) ? chromium : null;

console.log("Đóng gói dự án…");
const serveUrl = await bundle({ entryPoint: path.join(proj, "src/index.ts"), onProgress: () => {} });
const browser = await openBrowser("chrome", { browserExecutable, chromiumOptions: { gl: "swangle" } });
const comp = await selectComposition({ serveUrl, id: "Main", inputProps: {}, puppeteerInstance: browser, browserExecutable });
const { fps, durationInFrames: N, width: W, height: H } = comp;

let frames;
if (opt("--frames")) frames = opt("--frames").split(",").map((x) => Math.max(0, Math.min(N - 1, parseInt(x, 10))));
else {
  // mốc cảnh đọc từ storyboard (chế độ nhạc); chế độ giọng hoặc thiếu bars → rải đều
  const sb = JSON.parse(fs.readFileSync(path.join(proj, "src/storyboard.json"), "utf8"));
  const n = parseInt(opt("--n", "12"), 10);
  const bars = (sb.scenes ?? []).map((s) => s.bars ?? 0);
  if (sb.clock !== "voice" && bars.every((b) => b > 0)) {
    const fpb = (fps * 60) / sb.music.bpm; let bar = 0; frames = [];
    for (const b of bars) { const a = Math.round(bar * 4 * fpb), d = Math.round(b * 4 * fpb); frames.push(a + Math.round(d * 0.45), a + Math.round(d * 0.92)); bar += b; }
    while (frames.length > n) frames = frames.filter((_, i) => i % 2 === 1 || i === 0); // quá nhiều cảnh: giữ khung trước điểm cắt
  } else frames = Array.from({ length: n }, (_, i) => Math.round(((i + 0.5) / n) * N));
  frames = [...new Set(frames.map((f) => Math.min(N - 1, f)))].sort((a, b) => a - b);
}
const scale = parseFloat(opt("--scale", "0.5"));
const out = path.join(proj, "out", "khung");
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const files = [];
for (const frame of frames) {
  const file = path.join(out, `f-${String(frame).padStart(5, "0")}.jpg`);
  await renderStill({ composition: comp, serveUrl, output: file, frame, imageFormat: "jpeg", jpegQuality: 86, scale, puppeteerInstance: browser, browserExecutable, inputProps: {} });
  files.push(file); process.stdout.write(`\r${files.length}/${frames.length} khung`);
}
await browser.close({ silent: true });
console.log(`\n✓ ${files.length} khung ${Math.round(W * scale)}×${Math.round(H * scale)} → ${out}`);
const cols = parseInt(opt("--cols", H > W ? "6" : "3"), 10), rows = Math.ceil(files.length / cols);
const sheet = path.join(out, "to-soat.jpg");
const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-pattern_type", "glob", "-i", path.join(out, "f-*.jpg"), "-vf", `tile=${cols}x${rows}:padding=8:margin=8:color=black`, "-frames:v", "1", "-q:v", "3", sheet], { encoding: "utf8" });
if (r.status === 0) console.log(`✓ Tờ soát: ${sheet} (khung: ${frames.join(", ")})`); else console.log("ℹ Không ghép được tờ soát (thiếu ffmpeg?) — xem ảnh rời trong thư mục trên.");
