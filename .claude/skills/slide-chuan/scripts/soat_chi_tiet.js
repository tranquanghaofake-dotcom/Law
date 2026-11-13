#!/usr/bin/env node
// SOÁT CHI TIẾT (nguyên tắc "mỗi chi tiết một lý do", references/nguyen-tac-bo-cuc.md mục 8) — đo trên deck.html của hinh/dung.js:
//   node scripts/soat_chi_tiet.js <thư_mục>_lop/deck.html [--json=out.json] [--lech=2..10]
// Dữ liệu đặt theo số (nhãn giá trị cạnh thanh): hộp chữ có data-dl → không xét thẳng hàng.
// Bóng chữ (text-shadow) GIỮ ở cả hai lần chụp: chữ trong suốt vẫn đổ bóng → nền đo được có bóng (bóng giúp đọc rõ là có thật);
// nét chữ chỉ tính điểm gần màu chữ nên bóng không làm lệch phép đo thẳng hàng.
// Mỗi slide chụp hai lần: đủ chữ và ẩn chữ (chữ trong suốt — GIỮ nền riêng của hộp chữ: viên nhãn, nút, vòng chữ cái). Hiệu hai ảnh = NÉT CHỮ THẬT (không phải hộp chữ).
//   (1) GẦN THẲNG HÀNG: mép trái nét chữ của hai hộp chữ canh trái lệch nhau 2–10 px — gần như thẳng mà không thẳng (Robin Williams:
//       "Nothing should be placed on the page arbitrarily"). Cố ý lệch thì lệch hẳn (≥ 16 px); thẳng thì thẳng tới từng px.
//   (2) TƯƠNG PHẢN: màu chữ so với NỀN THẬT ngay sau nét chữ (ảnh nền, ảnh, dải màu đều tính) — WCAG 2.1: chữ thường ≥ 4,5 : 1,
//       chữ lớn (≥ 24 px đậm hoặc ≥ 32 px) ≥ 3 : 1. Lấy mức 15 % xấu nhất của các điểm nền quanh nét chữ.
const path = require("path"), fs = require("fs");
let chromium; try { ({ chromium } = require("playwright")); } catch { ({ chromium } = require(path.join(process.cwd(), "node_modules", "playwright"))); }
const sharp = require("sharp");

const args = process.argv.slice(2), pos = args.filter((a) => !a.startsWith("--")), opt = (k) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a && a.split("=")[1]; };
const [LO, HI] = ((require.main === module && opt("lech")) || "4..10").split("..").map(Number);   // dưới 4 px: lề trong của từng con chữ (Anton "M" khác "Đ"), không đo được bằng mắt

const lum = (r, g, b) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const tp = (a, b) => { const [x, y] = [lum(...a), lum(...b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

async function soat(html) {
  const exe = process.env.PW_CHROMIUM || ["/opt/pw-browsers/chromium"].find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
  const b = await chromium.launch(exe ? { executablePath: exe } : {});
  const page = await (await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })).newPage();
  await page.goto("file://" + path.resolve(html)); await page.evaluate(() => window.hinhSanSang); await page.waitForTimeout(400);
  const n = await page.evaluate(() => { const st = document.createElement("style");
    st.textContent = `html, body { margin: 0 !important; overflow: hidden; } section.s { position: fixed !important; left: 0 !important; top: 0 !important; margin: 0 !important; display: none !important; }
      section.s.xem { display: block !important; } section.s.anchu [data-t], section.s.anchu [data-t] * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-decoration-color: transparent !important; } [data-a] { opacity: 1 !important; }`;
    document.head.appendChild(st); window.scrollTo(0, 0); return document.querySelectorAll("section.s").length; });
  const anh = async () => { const { data, info } = await sharp(await page.screenshot({ type: "png" })).removeAlpha().raw().toBuffer({ resolveWithObject: true }); return { d: data, w: info.width, h: info.height }; };
  const out = [];
  for (let k = 0; k < n; k++) {
    const meta = await page.evaluate((k) => { const ss = document.querySelectorAll("section.s"); ss.forEach((s) => s.classList.remove("xem", "anchu")); const s = ss[k]; s.classList.add("xem");
      const rgb = (c) => (c.match(/[\d.]+/g) || []).slice(0, 4).map(Number);
      const hop = [...s.querySelectorAll("[data-t]")].filter((t) => (t.textContent || "").trim() && getComputedStyle(t).display !== "none").map((t, i) => { const cs = getComputedStyle(t), r = t.getBoundingClientRect();
        // màu từng đoạn: hộp chữ + con có màu riêng (b, em…)
        const doan = [{ mau: rgb(cs.color), dam: +cs.fontWeight || 400, q: [...(() => { const g = document.createRange(); g.selectNodeContents(t); return g.getClientRects(); })()].map((q) => [q.left, q.top, q.width, q.height]) }];
        for (const c of t.querySelectorAll("*")) { if (c.closest("[data-t]") !== t) continue; const cc = getComputedStyle(c); if (cc.color !== cs.color) doan.push({ mau: rgb(cc.color), dam: +cc.fontWeight || 400, co: parseFloat(cc.fontSize), q: [...c.getClientRects()].map((q) => [q.left, q.top, q.width, q.height]), con: true }); }
        const longR = [...t.querySelectorAll("[data-t]")].map((c) => { const q = c.getBoundingClientRect(); return [q.left, q.top, q.width, q.height]; });   // hộp chữ con lồng bên trong: đo riêng
        return { i, longR, dl: t.hasAttribute("data-dl"), chu: t.textContent.trim().replace(/\s+/g, " ").slice(0, 40), lop: t.className.split(" ")[0], r: [r.left, r.top, r.width, r.height], canh: cs.textAlign, co: parseFloat(cs.fontSize), dam: +cs.fontWeight || 400, xoay: (() => { for (let a = t; a && !a.matches("section.s"); a = a.parentElement) { const c = getComputedStyle(a), m = (c.transform.match(/matrix\(([^)]+)\)/) || [])[1]; if ((c.rotate && c.rotate !== "none" && c.rotate !== "0deg") || (m && Math.abs(+m.split(",")[1]) > 0.01)) return true; } return false; })() /* chỉ tính xoay thật; scale / dịch của hiệu ứng vào không tính */, doan }; });
      return { ten: (s.dataset.title || s.dataset.type || "").slice(0, 48), type: s.dataset.type, hop }; }, k);
    await page.waitForTimeout(60); const A = await anh();
    await page.evaluate((k) => document.querySelectorAll("section.s")[k].classList.add("anchu"), k); await page.waitForTimeout(40); const B = await anh();
    const px = (I, x, y) => { const o = (y * I.w + x) * 3; return [I.d[o], I.d[o + 1], I.d[o + 2]]; };
    const khac = (x, y) => { const a = px(A, x, y), c = px(B, x, y); return Math.abs(a[0] - c[0]) + Math.abs(a[1] - c[1]) + Math.abs(a[2] - c[2]) > 60; };
    // NÉT của màu m: điểm đổi khi ẩn chữ VÀ lúc hiện chữ gần màu m hơn hẳn (loại viền chữ / bóng khác màu chữ)
    const kc = (p, m) => Math.abs(p[0] - m[0]) + Math.abs(p[1] - m[1]) + Math.abs(p[2] - m[2]);
    const net = (x, y, m) => khac(x, y) && kc(px(A, x, y), m) < kc(px(B, x, y), m) * 0.7;
    const ketQua = { slide: k + 1, type: meta.type, ten: meta.ten, lech: [], tuongPhan: [] };
    // mép trái nét chữ của từng hộp canh trái (dòng đầu)
    const mep = [];
    for (const h of meta.hop) { if (h.dl || h.xoay || (h.canh !== "left" && h.canh !== "start") || h.r[2] < 120) continue; const q = h.doan[0].q[0]; if (!q) continue;
      const y0 = Math.max(0, Math.round(q[1])), y1 = Math.min(1079, Math.round(q[1] + q[3])), x0 = Math.max(0, Math.round(h.r[0]) - 4), x1 = Math.min(1919, Math.round(h.r[0] + 80));
      let L = null; const m0 = h.doan[0].mau; for (let x = x0; x <= x1 && L == null; x++) for (let y = y0; y <= y1; y += 2) if (net(x, y, m0)) { L = x; break; }
      if (L != null) mep.push({ L, y: q[1], h }); }
    for (let i = 0; i < mep.length; i++) for (let j = i + 1; j < mep.length; j++) { const d = Math.abs(mep[i].L - mep[j].L);
      if (mep[i].h.co >= 80 && mep[j].h.co >= 80) continue;   // hai dòng chữ trưng bày cỡ lớn: canh theo mắt, lề trong của nét chữ khác nhau
      if (d >= LO && d <= HI) ketQua.lech.push(`“${mep[i].h.chu}” (x ${mep[i].L}) và “${mep[j].h.chu}” (x ${mep[j].L}) lệch ${d} px`); }
    // tương phản: nền lấy ở ảnh ẩn chữ, tại các điểm có nét chữ
    for (const h of meta.hop) for (const dn of h.doan) { if (!dn.mau.length || (dn.mau[3] != null && dn.mau[3] < 0.5)) continue; const ds = [];
      for (const q of dn.q) { const x0 = Math.max(0, Math.round(q[0])), x1 = Math.min(1919, Math.round(q[0] + q[2])), y0 = Math.max(0, Math.round(q[1])), y1 = Math.min(1079, Math.round(q[1] + q[3]));
        const bx = Math.max(1, Math.floor((x1 - x0) / 40)), by = Math.max(1, Math.floor((y1 - y0) / 8));
        for (let x = x0; x < x1; x += bx) for (let y = y0; y < y1; y += by) if (net(x, y, dn.mau) && !h.longR.some((r) => x >= r[0] && x <= r[0] + r[2] && y >= r[1] && y <= r[1] + r[3])) ds.push(tp(dn.mau.slice(0, 3), px(B, x, y))); }
      if (ds.length < 6) continue; ds.sort((a, b) => a - b);
      if (ds[Math.floor(ds.length / 2)] < 1.25) continue;   // nền sau nét chữ trùng màu chữ ở đa số điểm: chữ còn nằm trong một lớp ảnh (huy hiệu dựng sẵn) — không đo được, soát bằng mắt
      const co = dn.co || h.co, v = ds[Math.floor(ds.length * 0.15)], lon = (co >= 24 && dn.dam >= 700) || co >= 32, nguong = lon ? 3 : 4.5;
      if (v < nguong) ketQua.tuongPhan.push(`“${h.chu}”${dn.con ? " (đoạn nhấn)" : ""} .${h.lop} ${Math.round(co)} px: ${v.toFixed(2)} : 1 < ${nguong} : 1`); }
    out.push(ketQua);
  }
  await b.close(); return out;
}

if (require.main === module && !pos.length) { console.error("Dùng: node scripts/soat_chi_tiet.js <deck.html> [--json=out.json] [--lech=4..10]"); process.exit(2); }
if (require.main === module) soat(pos[0]).then((kq) => { let nl = 0, nt = 0;
  for (const s of kq) { if (!s.lech.length && !s.tuongPhan.length) continue; console.log(`slide ${s.slide} (${s.type}) ${s.ten}`);
    for (const m of s.lech) { nl++; console.log(`  ↔ gần thẳng hàng: ${m}`); } for (const m of s.tuongPhan) { nt++; console.log(`  ◐ tương phản thấp: ${m}`); } }
  console.log(`Soát chi tiết: ${kq.length} slide · ${nl} chỗ gần thẳng hàng (lệch ${LO}–${HI} px) · ${nt} chỗ tương phản thấp`);
  if (opt("json")) fs.writeFileSync(opt("json"), JSON.stringify(kq, null, 1)); }).catch((e) => { console.error(e); process.exit(1); });
module.exports = { soat, tp };
