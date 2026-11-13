#!/usr/bin/env node
// XEM TRƯỚC CHUYỂN ĐỘNG (Morph) khi không có PowerPoint: quay video / GIF từ deck.html của hinh/dung.js.
//   node scripts/xem_morph.js <thư_mục>_lop/deck.html <out.gif|out.mp4> [--tu=1] [--den=N] [--giu=1200] [--rong=960]
// Mô phỏng cách PowerPoint làm Morph: phần tử cùng tên (data-m) ở hai slide kề nhau trượt / đổi cỡ / xoay sang chỗ mới
// (hình khác nhau thì hoà dần), phần tử không có cặp thì mờ ra (slide trước) / mờ vào (slide sau). Thời lượng = data-dur của slide sau.
// Đây là BẢN XẤP XỈ để soát nhịp và ý đồ chuyển động; bản thật vẫn phải mở bằng PowerPoint 2019 / 365.
const path = require("path"), fs = require("fs"), os = require("os"), { execFileSync } = require("child_process");
let chromium; try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require(path.join(process.cwd(), "node_modules", "playwright"))); }

const args = process.argv.slice(2), pos = args.filter((a) => !a.startsWith("--")), opt = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? +a.split("=")[1] : d; };
if (pos.length < 2) { console.error("Dùng: node scripts/xem_morph.js <deck.html> <out.gif|out.mp4> [--tu=1] [--den=N] [--giu=1200] [--rong=960]"); process.exit(2); }
const [html, out] = pos, GIU = opt("giu", 1200), RONG = opt("rong", 960);

(async () => {
  const exe = process.env.PW_CHROMIUM || ["/opt/pw-browsers/chromium-1243/chrome-linux64/chrome", "/opt/pw-browsers/chromium"].find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
  const b = await chromium.launch(exe ? { executablePath: exe } : {});
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "xem-morph-")), FPS = 20;
  const page = await (await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: RONG / 1920 })).newPage();
  await page.goto("file://" + path.resolve(html)); await page.evaluate(() => window.hinhSanSang); await page.waitForTimeout(500);
  const n = await page.evaluate(() => {
    const st = document.createElement("style");
    st.textContent = `html, body { margin: 0 !important; background: #000; overflow: hidden; } section.s { position: fixed !important; left: 0 !important; top: 0 !important; margin: 0 !important; display: none !important; }
      section.s.xem { display: block !important; } section.s.do { display: block !important; visibility: hidden !important; }`;
    document.head.appendChild(st); window.scrollTo(0, 0);
    // nội suy một lần chuyển: mỗi mục { el, a, b } — a, b = hộp (trái, trên, rộng, cao, xoay, cỡ chữ, độ đục)
    window.__xmSet = (t) => { const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, L = (x, y) => x + (y - x) * e;
      for (const { el, a, b } of window.__xm || []) { for (const k of ["l", "t", "w", "h"]) if (a[k] != null) el.style.setProperty({ l: "left", t: "top", w: "width", h: "height" }[k], L(a[k], b[k]) + "px", "important");
        if (a.r != null) el.style.setProperty("rotate", L(a.r, b.r) + "deg", "important"); if (a.fs != null) el.style.setProperty("font-size", L(a.fs, b.fs) + "px", "important"); el.style.setProperty("opacity", String(L(a.op, b.op)), "important"); } };
    return document.querySelectorAll("section.s").length; });
  const tu = Math.max(1, opt("tu", 1)), den = Math.min(n, opt("den", n));
  let f = 0; const chup = async (lap = 1) => { const p = path.join(dir, `f${String(f).padStart(5, "0")}.jpg`); await page.screenshot({ path: p, type: "jpeg", quality: 85 }); f++; for (let i = 1; i < lap; i++) { fs.copyFileSync(p, path.join(dir, `f${String(f).padStart(5, "0")}.jpg`)); f++; } };
  await page.evaluate((k) => document.querySelectorAll("section.s")[k].classList.add("xem"), tu - 1);
  await page.waitForTimeout(200); await chup(Math.round(GIU / 1000 * FPS));
  for (let k = tu; k < den; k++) {
    const dur = await page.evaluate((k) => {
      // hai slide cùng hiện (B đè lên A, nền của B mờ vào); dời thẳng phần tử thật — không nhân bản (nhân bản làm trùng id gradient của SVG)
      const S = [...document.querySelectorAll("section.s")], A = S[k - 1], B = S[k], dur = +(B.dataset.dur || 900);
      const key = (el) => el.getAttribute("data-m"), so = (v) => parseFloat(v) || 0, giu = new Map();
      const nho = (el) => { if (!giu.has(el)) giu.set(el, el.style.cssText); };
      const hop = (el) => { const c = getComputedStyle(el); return { l: el.offsetLeft, t: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight, r: c.rotate === "none" ? 0 : so(c.rotate), fs: so(c.fontSize), op: so(c.opacity) }; };
      A.classList.add("xem"); B.classList.add("xem");
      const cB = getComputedStyle(B), bg = document.createElement("div");
      bg.className = "xm-bg"; bg.style.cssText = `position:absolute;inset:0;z-index:-1;background-image:${cB.backgroundImage};background-color:${cB.backgroundColor};background-size:${cB.backgroundSize};background-position:${cB.backgroundPosition};background-repeat:${cB.backgroundRepeat}`;
      nho(B); B.style.setProperty("background", "none", "important"); B.prepend(bg);
      const top = (R) => [...R.querySelectorAll("[data-t], [data-l]")].filter((el) => !(el.parentElement && el.parentElement.closest("[data-t], [data-l]")));
      const aAll = top(A), bAll = top(B), aMap = new Map(aAll.filter(key).map((el) => [key(el), el])), ha = new Map(aAll.map((el) => [el, hop(el)])), hb = new Map(bAll.map((el) => [el, hop(el)]));
      const ds = [{ el: bg, a: { op: 0 }, b: { op: 1 } }], dung = new Set();
      for (const el of bAll) { const h = hb.get(el), m = key(el), p = m && aMap.get(m); nho(el);
        if (!p) { ds.push({ el, a: { ...h, l: null, fs: null, r: null, op: 0 }, b: h }); continue; }
        dung.add(p); nho(p); const h0 = ha.get(p);
        if (p.innerHTML === el.innerHTML) { ds.push({ el, a: { ...h0, op: h.op }, b: h }); ds.push({ el: p, a: { ...h0, l: null, fs: null, r: null, op: 0 }, b: { op: 0 } }); }
        else { ds.push({ el, a: { ...h0, op: 0 }, b: h }); ds.push({ el: p, a: h0, b: { ...h, op: 0 } }); } }
      for (const el of aAll) if (!dung.has(el)) { const h = ha.get(el); nho(el); ds.push({ el, a: { ...h, l: null, fs: null, r: null }, b: { ...h, op: 0 } }); }
      window.__xm = ds; window.__xmGiu = giu; window.__xmAB = [A, B]; window.__xmSet(0); return dur;
    }, k);
    const F = Math.max(2, Math.round(dur / 1000 * FPS));
    for (let i = 0; i <= F; i++) { await page.evaluate((t) => window.__xmSet(t), i / F); await chup(); }
    await page.evaluate(() => { for (const [el, css] of window.__xmGiu) el.style.cssText = css; document.querySelectorAll(".xm-bg").forEach((c) => c.remove()); window.__xm = []; window.__xmAB[0].classList.remove("xem"); }, k);
    await chup(Math.round(GIU / 1000 * FPS));
  }
  await b.close();
  const inp = ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(dir, "f%05d.jpg")];
  if (/\.mp4$/i.test(out)) execFileSync("ffmpeg", [...inp, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-movflags", "+faststart", out]);
  else execFileSync("ffmpeg", [...inp, "-vf", "split[a][b];[a]palettegen=max_colors=200[p];[b][p]paletteuse=dither=sierra2_4a", out]);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`✓ ${out} — slide ${tu}→${den}, ${f} khung (${FPS} khung/giây), giữ mỗi slide ${GIU} ms (bản xấp xỉ Morph; kiểm bản thật bằng PowerPoint 2019 / 365)`);
})().catch((e) => { console.error("✗ " + (e.stack || e.message)); process.exit(1); });
