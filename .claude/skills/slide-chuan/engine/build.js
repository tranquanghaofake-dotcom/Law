#!/usr/bin/env node
// slide-chuan — dựng PPTX từ deck.json bằng bộ giao diện cố định.
// Dùng: node build.js <deck.json> <out.pptx> [--theme teal|kem|son|toa|xanh|muc] [--native] [--strict]
//   --strict: có bất kỳ cảnh báo nào (ký tự, chữ không vừa khung, logo, ghi chú...) thì thoát mã 1 và không ghi file.
//   Deck sai cấu trúc: in lỗi tiếng Việt kèm số slide, thoát mã 2.
const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");
const React = require("react");
const RDS = require("react-dom/server");
const sharp = require("sharp");
const fa = require("react-icons/fa6");
const pi = require("react-icons/pi"); // Phosphor (MIT) — bản Duotone hai tông, chi tiết hơn fa6
// Lucide (ISC) và Tabler (MIT): thêm ~7.700 icon nét mảnh, không bắt ghi nguồn. Font Awesome Free (fa6) là CC BY 4.0 → PHẢI ghi nguồn (build tự in khi dùng)
const lu = require("react-icons/lu"), tb = require("react-icons/tb");
const FA_USED = new Set();
const { optimize: svgo } = require("svgo"); // MIT — nén SVG trước khi nhúng (file nhẹ hơn, PowerPoint mở nhanh hơn)
const rough = require("roughjs/bundled/rough.cjs.js"); // Rough.js (MIT) — nét vẽ tay cho dấu khoanh/gạch chân
const THEMES = require("./themes");
const LIMITS = require("./limits");
const { validate } = require("./validate");
const { measure, textW } = require("./measure");
const { MOTIFS, MIN: MOTIF_MIN, MAX: MOTIF_MAX, largestFree } = require("./motifs");
// bề rộng khung vừa khít chữ: đo font thật + lề trong (pad, inch); không có font -> ước lượng theo số ký tự (est inch/ký tự)
const fitW = (text, o, pad, est, max) => { const t = textW(text, o); return Math.min(max, pad + (t == null ? String(text).length * est : t * 1.04)); };

const W = 13.333, H = 7.5, M = 0.6;
let pres, TH, ASSETS = {};
const LANG = "vi-VN"; // để PowerPoint không gạch đỏ chính tả chữ Việt

// Hình vector hai tông (nét dày + mảng màu trong suốt), không dùng ảnh AI.
// c = màu nhấn, s = màu phụ (dấu/con dấu). Mỗi hình chỉ là hình học — chữ luôn để ở ô chữ của slide.
const ART = {
  courthouse: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" stroke="#${c}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
<polygon points="30,98 200,22 370,98" fill="#${c}" fill-opacity=".22"/><circle cx="200" cy="70" r="15" fill="#${s}" fill-opacity=".55" stroke="none"/>
<rect x="44" y="98" width="312" height="24" fill="#${c}" fill-opacity=".55"/>
${[78, 138, 198, 258, 318].map(x => `<rect x="${x - 11}" y="134" width="22" height="112" fill="#${c}" fill-opacity=".85" stroke="none"/>`).join("")}
<rect x="34" y="250" width="332" height="18" fill="#${c}" fill-opacity=".35"/><rect x="18" y="268" width="364" height="18" fill="#${c}" fill-opacity=".5"/><rect x="4" y="286" width="392" height="20" fill="#${c}" fill-opacity=".7"/></svg>`,
  scales: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 360" fill="none" stroke="#${c}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
<line x1="200" y1="50" x2="200" y2="300"/><circle cx="200" cy="38" r="14" fill="#${s}" fill-opacity=".6" stroke="none"/><line x1="62" y1="86" x2="338" y2="66"/>
<line x1="80" y1="85" x2="42" y2="196"/><line x1="80" y1="85" x2="118" y2="196"/><path d="M28 196 Q80 250 132 196 Z" fill="#${c}" fill-opacity=".35"/>
<line x1="320" y1="67" x2="282" y2="170"/><line x1="320" y1="67" x2="358" y2="170"/><path d="M268 170 Q320 224 372 170 Z" fill="#${c}" fill-opacity=".2"/>
<path d="M140 300 L260 300 L282 334 L118 334 Z" fill="#${c}" fill-opacity=".55"/></svg>`,
  document: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380" fill="none" stroke="#${c}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
<path d="M20 10 H215 L280 75 V370 H20 Z" fill="#${c}" fill-opacity=".12"/><path d="M215 10 V75 H280" fill="#${c}" fill-opacity=".4"/>
${[[70, 170], [110, 240], [145, 240], [180, 240], [215, 190], [250, 150]].map(([y, x2]) => `<line x1="55" y1="${y}" x2="${x2}" y2="${y}" stroke-opacity=".6"/>`).join("")}
<circle cx="212" cy="305" r="40" fill="#${s}" fill-opacity=".18" stroke="#${s}"/><circle cx="212" cy="305" r="24" stroke="#${s}" stroke-width="4"/></svg>`,
  house: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" stroke="#${c}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
<rect x="282" y="52" width="34" height="62" fill="#${c}" fill-opacity=".5"/><polygon points="36,152 200,30 364,152" fill="#${c}" fill-opacity=".38"/>
<rect x="70" y="152" width="260" height="146" fill="#${c}" fill-opacity=".12"/><rect x="170" y="204" width="60" height="94" fill="#${c}" fill-opacity=".75"/>
<rect x="96" y="182" width="50" height="44" fill="#${s}" fill-opacity=".3"/><rect x="254" y="182" width="50" height="44" fill="#${s}" fill-opacity=".3"/><line x1="20" y1="300" x2="380" y2="300"/></svg>`,
  gavel: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" stroke="#${c}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
<g transform="rotate(-35 190 120)"><rect x="110" y="70" width="160" height="70" rx="12" fill="#${c}" fill-opacity=".55"/><rect x="96" y="62" width="22" height="86" rx="6" fill="#${c}" fill-opacity=".85"/><rect x="262" y="62" width="22" height="86" rx="6" fill="#${c}" fill-opacity=".85"/>
<rect x="180" y="140" width="22" height="170" rx="8" fill="#${c}" fill-opacity=".3"/></g>
<rect x="210" y="250" width="170" height="30" rx="8" fill="#${s}" fill-opacity=".35"/><rect x="190" y="280" width="210" height="26" rx="8" fill="#${c}" fill-opacity=".55"/></svg>`,
  land: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" stroke="#${c}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
<polygon points="20,250 120,170 380,190 300,300 40,300" fill="#${c}" fill-opacity=".12"/><polygon points="120,170 230,178 210,262 100,250" fill="#${c}" fill-opacity=".45"/>
<line x1="230" y1="178" x2="300" y2="300" stroke-opacity=".5"/><line x1="100" y1="250" x2="40" y2="300" stroke-opacity=".5"/>
<path d="M165 150 C165 105 125 95 125 62 A40 40 0 0 1 205 62 C205 95 165 105 165 150 Z" fill="#${s}" fill-opacity=".55" stroke="#${s}"/><circle cx="165" cy="62" r="13" fill="#${c}" stroke="none"/></svg>`,
  // ---- hình gắn với BHXH (11/2026): đồ vật người học nhận ra ngay — không vẽ quốc huy / biểu trưng cơ quan ----
  // sổ BHXH mở: bìa xanh phía sau, hai trang có dòng kẻ + ô dấu tròn trơn
  passbook: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 320" stroke-linejoin="round" stroke-linecap="round">
<g transform="rotate(-6 210 160)"><rect x="40" y="40" width="340" height="236" rx="16" fill="#${c}" fill-opacity=".85"/>
<path d="M58 54 H206 V262 H58 Z" fill="#FFFFFF" stroke="#${c}" stroke-width="4"/><path d="M214 54 H362 V262 H214 Z" fill="#FFFFFF" stroke="#${c}" stroke-width="4"/>
<line x1="210" y1="50" x2="210" y2="268" stroke="#${c}" stroke-width="8"/>
<circle cx="132" cy="110" r="30" fill="#${s}" fill-opacity=".18" stroke="#${s}" stroke-width="5"/><circle cx="132" cy="110" r="14" fill="none" stroke="#${s}" stroke-width="4"/>
${[160, 186, 212, 238].map(y => `<line x1="80" y1="${y}" x2="186" y2="${y}" stroke="#${c}" stroke-width="5" stroke-opacity=".45"/>`).join("")}
${[86, 112, 138, 164, 190, 216, 242].map((y, i) => `<line x1="232" y1="${y}" x2="${i % 3 === 2 ? 300 : 344}" y2="${y}" stroke="#${c}" stroke-width="5" stroke-opacity="${i < 4 ? ".6" : ".25"}"/>`).join("")}
<rect x="300" y="214" width="48" height="34" rx="6" fill="#${s}" fill-opacity=".85"/></g></svg>`,
  // thẻ BHXH / thẻ định danh: ảnh chân dung tròn, dòng chữ, mã QR tối giản
  idcard: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 300" stroke-linejoin="round" stroke-linecap="round">
<rect x="70" y="60" width="320" height="200" rx="22" fill="#${c}" fill-opacity=".25" transform="rotate(8 230 160)"/>
<rect x="30" y="40" width="330" height="210" rx="22" fill="#FFFFFF" stroke="#${c}" stroke-width="6"/><rect x="30" y="40" width="330" height="54" rx="22" fill="#${c}"/><rect x="30" y="72" width="330" height="22" fill="#${c}"/>
<circle cx="100" cy="160" r="40" fill="#${c}" fill-opacity=".18" stroke="#${c}" stroke-width="5"/><circle cx="100" cy="148" r="14" fill="#${c}" fill-opacity=".7"/><path d="M74 186 Q100 160 126 186" fill="#${c}" fill-opacity=".7"/>
${[128, 154, 180].map((y, i) => `<line x1="160" y1="${y}" x2="${[300, 270, 240][i]}" y2="${y}" stroke="#${c}" stroke-width="7" stroke-opacity=".55"/>`).join("")}
${[0, 1, 2, 3].flatMap(r => [0, 1, 2, 3].map(q => ((r * 7 + q * 3) % 5 < 3 ? `<rect x="${282 + q * 14}" y="${198 + r * 11}" width="12" height="9" fill="#${s}"/>` : ""))).join("")}</svg>`,
  // ---- hình mặc định của 4 world đợt 2 (11/2026) ----
  // hoá đơn cuộn: mép dưới răng cưa, dòng hàng, gạch đôi + dòng tổng
  receipt: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 320" stroke-linejoin="round" stroke-linecap="round">
<g transform="rotate(5 210 160)"><path d="M120 20 H300 V290 ${[...Array(10).keys()].map(i => `L${291 - i * 18} 278 L${282 - i * 18} 290`).join(" ")} H120 Z" fill="#FFFFFF" stroke="#${c}" stroke-width="5"/>
${[60, 88, 116, 144, 172].map((y, i) => `<line x1="140" y1="${y}" x2="${[230, 210, 240, 200, 220][i]}" y2="${y}" stroke="#${c}" stroke-width="6" stroke-opacity=".45"/><line x1="250" y1="${y}" x2="282" y2="${y}" stroke="#${c}" stroke-width="6" stroke-opacity=".7"/>`).join("")}
<line x1="140" y1="200" x2="282" y2="200" stroke="#${c}" stroke-width="3"/><line x1="140" y1="208" x2="282" y2="208" stroke="#${c}" stroke-width="3"/>
<line x1="140" y1="236" x2="190" y2="236" stroke="#${c}" stroke-width="9"/><line x1="226" y1="236" x2="282" y2="236" stroke="#${s}" stroke-width="12"/></g></svg>`,
  // sổ tài khoản mở + thẻ: cột số dư, dòng xen màu
  bankbook: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 320" stroke-linejoin="round" stroke-linecap="round">
<rect x="40" y="50" width="300" height="210" rx="14" fill="#FFFFFF" stroke="#${c}" stroke-width="5"/><rect x="40" y="50" width="300" height="40" rx="14" fill="#${c}"/><rect x="40" y="76" width="300" height="14" fill="#${c}"/>
${[0, 1, 2, 3, 4].map(i => `<rect x="45" y="${98 + i * 30}" width="290" height="26" fill="#${c}" fill-opacity="${i % 2 ? ".1" : "0"}"/><line x1="60" y1="${111 + i * 30}" x2="${[150, 170, 140, 160, 150][i]}" y2="${111 + i * 30}" stroke="#${c}" stroke-width="6" stroke-opacity=".5"/><line x1="${i % 2 ? 210 : 230}" y1="${111 + i * 30}" x2="${i % 2 ? 250 : 270}" y2="${111 + i * 30}" stroke="#${i === 2 ? s : c}" stroke-width="6"/><line x1="290" y1="${111 + i * 30}" x2="322" y2="${111 + i * 30}" stroke="#${c}" stroke-width="6" stroke-opacity=".75"/>`).join("")}
<g transform="rotate(-12 330 240)"><rect x="260" y="196" width="140" height="88" rx="12" fill="#${s}" fill-opacity=".9"/><rect x="276" y="220" width="28" height="20" rx="4" fill="#FFFFFF" fill-opacity=".85"/><line x1="276" y1="262" x2="380" y2="262" stroke="#FFFFFF" stroke-width="6" stroke-opacity=".7"/></g></svg>`,
  // sơ đồ sở hữu: 3 nút trên nối về 1 khối dưới, đường dày theo tỉ lệ
  orgchart: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 320" stroke-linejoin="round" stroke-linecap="round">
${[[70, 14], [210, 8], [350, 4]].map(([x, w]) => `<line x1="${x}" y1="110" x2="210" y2="220" stroke="#${c}" stroke-width="${w}" stroke-opacity=".75"/>`).join("")}
${[70, 210, 350].map((x, i) => `<rect x="${x - 52}" y="56" width="104" height="58" rx="12" fill="${i ? "#FFFFFF" : "#" + c}" stroke="#${c}" stroke-width="5"/><circle cx="${x}" cy="85" r="12" fill="${i ? "#" + c : "#FFFFFF"}" fill-opacity=".7"/>`).join("")}
<rect x="130" y="214" width="160" height="66" rx="10" fill="#${s}"/><line x1="160" y1="247" x2="260" y2="247" stroke="#FFFFFF" stroke-width="8" stroke-opacity=".75"/></svg>`,
  // phong bì hồ sơ có băng niêm phong chéo (không chữ, không con dấu cơ quan)
  sealed: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 320" stroke-linejoin="round" stroke-linecap="round">
<rect x="60" y="60" width="300" height="210" rx="8" fill="#${c}" fill-opacity=".14" stroke="#${c}" stroke-width="5" transform="rotate(-4 210 165)"/>
<rect x="76" y="44" width="280" height="200" rx="6" fill="#FFFFFF" stroke="#${c}" stroke-width="5"/>
${[86, 112, 138, 164, 190].map((y, i) => `<line x1="100" y1="${y}" x2="${[300, 330, 280, 320, 250][i]}" y2="${y}" stroke="#${c}" stroke-width="6" stroke-opacity=".4" stroke-dasharray="${i > 2 ? "2 9" : "none"}"/>`).join("")}
<g transform="rotate(-28 216 150)"><rect x="40" y="132" width="352" height="38" fill="#${s}" fill-opacity=".92"/><line x1="40" y1="139" x2="392" y2="139" stroke="#FFFFFF" stroke-dasharray="10 8"/><line x1="40" y1="163" x2="392" y2="163" stroke="#FFFFFF" stroke-dasharray="10 8"/><path d="M180 152 c14 -16 24 12 38 -2 s20 8 30 -4" fill="none" stroke="#FFFFFF" stroke-width="4"/></g></svg>`,
  // bến cảng: tàu chở container nhiều màu + cần cẩu (world cang-bien)
  harbor: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 320" stroke-linejoin="round" stroke-linecap="round">
<path d="M300 40 V200 M300 40 H380 M300 40 L240 90 M380 40 V70" stroke="#${c}" stroke-width="8" fill="none"/><line x1="360" y1="70" x2="360" y2="120" stroke="#${c}" stroke-width="3"/><rect x="346" y="120" width="28" height="18" fill="#${s}"/>
${[[60, 150], [112, 150], [164, 150], [216, 150], [86, 116], [138, 116], [190, 116], [112, 82]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="50" height="32" rx="2" fill="#${i % 3 === 1 ? s : c}" fill-opacity="${i % 3 === 2 ? ".55" : ".9"}"/>${[12, 24, 36].map(k => `<line x1="${x + k}" y1="${y + 5}" x2="${x + k}" y2="${y + 27}" stroke="#fff" stroke-opacity=".45" stroke-width="2"/>`).join("")}`).join("")}
<path d="M30 184 H300 L272 236 H62 Z" fill="#${c}"/><rect x="250" y="160" width="40" height="24" fill="#${c}" fill-opacity=".75"/><path d="M20 250 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#${c}" stroke-width="5" fill="none" stroke-opacity=".5"/></svg>`,
  // lương hưu: đồng hồ (thời gian đóng) + chồng xu (khoản hưởng hằng tháng)
  pension: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 320" stroke-linejoin="round" stroke-linecap="round">
<circle cx="160" cy="150" r="118" fill="#${c}" fill-opacity=".12" stroke="#${c}" stroke-width="8"/>
${[...Array(12).keys()].map(i => { const a = i * Math.PI / 6, r1 = i % 3 ? 100 : 92; return `<line x1="${(160 + Math.sin(a) * r1).toFixed(1)}" y1="${(150 - Math.cos(a) * r1).toFixed(1)}" x2="${(160 + Math.sin(a) * 108).toFixed(1)}" y2="${(150 - Math.cos(a) * 108).toFixed(1)}" stroke="#${c}" stroke-width="${i % 3 ? 4 : 8}"/>`; }).join("")}
<line x1="160" y1="150" x2="160" y2="78" stroke="#${c}" stroke-width="10"/><line x1="160" y1="150" x2="214" y2="176" stroke="#${s}" stroke-width="8"/><circle cx="160" cy="150" r="12" fill="#${c}"/>
${[0, 1, 2, 3, 4].map(i => `<ellipse cx="330" cy="${282 - i * 26}" rx="62" ry="20" fill="#${s}" fill-opacity="${0.55 + i * 0.08}" stroke="#${s}" stroke-width="4"/>`).join("")}
<ellipse cx="330" cy="178" rx="62" ry="20" fill="#FFFFFF" fill-opacity=".35"/></svg>`,
};
// Hình vẽ bằng code: mặc định nhúng SVG THẬT (vector — phóng to không vỡ; PowerPoint 365: chuột phải → "Convert to Shape" để sửa từng nét).
// pptxgenjs chạy trên Node không tạo được ảnh PNG dự phòng cho SVG (gitbrent/PptxGenJS#401) → engine tự vẽ PNG dự phòng bằng sharp
// lúc ghi file (fixSvgFallbacks) để Office cũ / trình xem không đọc SVG vẫn thấy hình. SVG có <filter>/<mask> (PowerPoint vẽ sai) giữ dạng PNG.
// Cờ --raster: tắt SVG, mọi hình thành PNG như trước.
let NATIVE = false; // --native / meta.native: biểu đồ (bar, column, line, donut) và bảng thành đối tượng PowerPoint gốc — mở "Edit Data" để sửa số
let MOTION_ON = false; const MOTIONS = {}, SIGS = []; // --motion / meta.motion / slide.motion: các ý TỰ lộ dần khi vào slide (nhịp video giải thích), xem motionXml
let BUILD_ON = false; // --build / meta.build / slide.build: hiện từng ý khi bấm (steps, cards, checklist, timeline)
let VECTOR = true; const SVG_W = new Map(); // nội dung SVG -> bề rộng px cho ảnh dự phòng
async function png(svg, w) {
  if (VECTOR && !/<filter|<mask|<image/.test(svg)) {
    try { svg = svgo(svg, { multipass: true, plugins: [{ name: "preset-default", params: { overrides: { removeViewBox: false } } }] }).data; } catch (e) { /* SVG lạ: nhúng nguyên bản */ }
    SVG_W.set(svg, Math.max(SVG_W.get(svg) || 0, w)); return "image/svg+xml;base64," + Buffer.from(svg).toString("base64"); }
  return "image/png;base64," + (await sharp(Buffer.from(svg)).resize(w).png().toBuffer()).toString("base64");
}
async function fixSvgFallbacks(z) { // thay PNG dự phòng "ảnh hỏng" của pptxgenjs bằng bản vẽ thật của chính SVG đi kèm
  const media = Object.keys(z.files).filter(f => /^ppt\/media\/image-\d+-\d+\.svg$/.test(f));
  for (const f of media) {
    const [, sl, k] = f.match(/image-(\d+)-(\d+)\.svg$/), pngF = `ppt/media/image-${sl}-${+k - 1}.png`;
    if (!z.file(pngF)) continue;
    const svg = await z.file(f).async("string"), w = SVG_W.get(svg) || 800;
    z.file(pngF, await sharp(Buffer.from(svg)).resize(Math.min(2400, w)).png().toBuffer());
  }
}
// ---------- cảnh minh hoạ lớn & hoạ tiết nền (vẽ hoàn toàn bằng code) ----------
// justice: vòng tròn nền + chồng sách + búa toà + cán cân — "hero" cho bìa / chuyển phần / kết luận.
ART.justice = (c, s, b) => {
  const B = b || "FFFFFF";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 520" stroke-linejoin="round" stroke-linecap="round">
<circle cx="300" cy="250" r="232" fill="#${c}" fill-opacity=".14"/><circle cx="300" cy="250" r="232" fill="none" stroke="#${c}" stroke-opacity=".4" stroke-width="2" stroke-dasharray="2 9"/>
<g stroke="#${c}" stroke-width="7" fill="none">
  <line x1="440" y1="92" x2="440" y2="420"/><line x1="350" y1="128" x2="530" y2="112"/>
  <line x1="366" y1="127" x2="338" y2="226"/><line x1="366" y1="127" x2="394" y2="226"/>
  <line x1="514" y1="114" x2="486" y2="206"/><line x1="514" y1="114" x2="542" y2="206"/></g>
<circle cx="440" cy="80" r="14" fill="#${s}"/>
<path d="M324 226 Q366 272 408 226 Z" fill="#${c}" fill-opacity=".9"/><path d="M472 206 Q514 252 556 206 Z" fill="#${c}" fill-opacity=".45"/>
<path d="M396 420 L484 420 L504 448 L376 448 Z" fill="#${c}"/>
<rect x="70" y="402" width="270" height="46" rx="6" fill="#${c}"/><rect x="80" y="411" width="240" height="8" rx="3" fill="#${B}" fill-opacity=".5"/>
<rect x="92" y="356" width="232" height="46" rx="6" fill="#${s}" fill-opacity=".9"/><rect x="102" y="365" width="208" height="8" rx="3" fill="#${B}" fill-opacity=".45"/>
<rect x="80" y="316" width="214" height="40" rx="6" fill="#${c}" fill-opacity=".55"/><rect x="90" y="324" width="190" height="7" rx="3" fill="#${B}" fill-opacity=".5"/>
<g transform="rotate(-24 190 250)">
  <rect x="104" y="268" width="188" height="18" rx="9" fill="#${c}" fill-opacity=".85"/>
  <rect x="58" y="216" width="58" height="122" rx="14" fill="#${c}"/><rect x="50" y="206" width="74" height="18" rx="7" fill="#${s}"/><rect x="50" y="330" width="74" height="18" rx="7" fill="#${s}"/>
  <rect x="68" y="232" width="10" height="90" rx="4" fill="#${B}" fill-opacity=".4"/></g>
<line x1="40" y1="452" x2="560" y2="452" stroke="#${c}" stroke-width="5"/>
<g fill="#${s}"><circle cx="150" cy="120" r="6"/><circle cx="560" cy="300" r="4"/><circle cx="96" cy="200" r="3"/></g></svg>`;
};
// gcn: giấy chứng nhận — khung viền kép, quốc huy giản lược, dải hoa văn sóng, các dòng chữ, con dấu đỏ, chữ ký
ART.gcn = (c, s) => {
  let wave = ""; for (let k = 0; k < 5; k++) { let p = ""; for (let x = 40; x <= 260; x += 4) p += (x === 40 ? "M" : "L") + x + " " + (150 + 9 * Math.sin((x / 14) + k * 0.9)).toFixed(1); wave += `<path d="${p}" fill="none" stroke="#${c}" stroke-opacity=".55" stroke-width="1.4"/>`; }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380" stroke-linejoin="round" stroke-linecap="round">
<rect x="10" y="10" width="280" height="360" rx="6" fill="#${c}" fill-opacity=".12" stroke="#${c}" stroke-width="5"/>
<rect x="24" y="24" width="252" height="332" fill="none" stroke="#${c}" stroke-width="2"/><rect x="31" y="31" width="238" height="318" fill="none" stroke="#${c}" stroke-opacity=".6" stroke-width="1"/>
<circle cx="150" cy="70" r="20" fill="#${s}" fill-opacity=".85"/><polygon points="150,56 154,66 165,66 156,73 160,84 150,77 140,84 144,73 135,66 146,66" fill="#${c}"/>
<line x1="95" y1="108" x2="205" y2="108" stroke="#${c}" stroke-width="6"/><line x1="115" y1="124" x2="185" y2="124" stroke="#${c}" stroke-opacity=".6" stroke-width="4"/>
${wave}
${[200, 222, 244, 266].map((y, i) => `<line x1="52" y1="${y}" x2="${[248, 230, 248, 190][i]}" y2="${y}" stroke="#${c}" stroke-opacity=".55" stroke-width="4"/>`).join("")}
<circle cx="214" cy="306" r="30" fill="#${s}" fill-opacity=".15" stroke="#${s}" stroke-width="4"/><circle cx="214" cy="306" r="19" fill="none" stroke="#${s}" stroke-width="2.5"/>
<path d="M62 312 C78 292 86 324 100 304 S122 300 132 314" fill="none" stroke="#${c}" stroke-width="3"/></svg>`;
};
// ---------- hình cho bài giảng / tài chính – bảo hiểm (viewBox 400×360, cùng tỉ lệ với scales) ----------
// umbrella: ô che mưa — bảo hiểm, phòng ngừa rủi ro
ART.umbrella = (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 360" fill="none" stroke="#${c}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
<path d="M60 170 Q200 20 340 170 Q317 150 293 170 Q270 150 247 170 Q223 150 200 170 Q177 150 153 170 Q130 150 107 170 Q83 150 60 170 Z" fill="#${c}" fill-opacity=".35"/>
<path d="M200 60 Q160 110 153 170 M200 60 Q240 110 247 170" stroke-opacity=".6"/>
<line x1="200" y1="44" x2="200" y2="60"/><path d="M200 170 V300 Q200 330 228 330 Q252 330 252 306" />
${[[70, 40], [120, 18], [300, 26], [350, 52], [44, 92]].map(([x, y]) => `<path d="M${x} ${y} q-7 14 0 18 q7 -4 0 -18 Z" fill="#${s}" fill-opacity=".7" stroke="#${s}" stroke-width="3"/>`).join("")}
<line x1="40" y1="340" x2="360" y2="340" stroke-opacity=".5"/></svg>`;
// shield: khiên có dấu tích — được bảo vệ, phạm vi bảo hiểm, an toàn
ART.shield = (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 360" fill="none" stroke="#${c}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
<path d="M200 22 L320 66 V170 Q320 270 200 336 Q80 270 80 170 V66 Z" fill="#${c}" fill-opacity=".14"/>
<path d="M200 50 L295 85 V170 Q295 250 200 304 Z" fill="#${c}" fill-opacity=".35" stroke="none"/>
<path d="M140 178 L186 222 L268 132" stroke="#${s}" stroke-width="16"/>
<circle cx="56" cy="80" r="8" fill="#${s}" fill-opacity=".6" stroke="none"/><circle cx="350" cy="250" r="6" fill="#${s}" fill-opacity=".6" stroke="none"/></svg>`;
// fund: quỹ chung — nhiều dòng tiền nhỏ đổ vào một quỹ lớn (chồng xu)
ART.fund = (c, s) => {
  const coin = (x, y, n, op) => Array.from({ length: n }, (_, i) => `<ellipse cx="${x}" cy="${y - i * 22}" rx="46" ry="14" fill="#${c}" fill-opacity="${op}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 360" stroke="#${c}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
<rect x="70" y="150" width="260" height="170" rx="22" fill="#${c}" fill-opacity=".12"/><rect x="150" y="136" width="100" height="22" rx="10" fill="#${c}" fill-opacity=".5"/>
${coin(140, 296, 4, 0.55)}${coin(200, 296, 6, 0.8)}${coin(260, 296, 3, 0.4)}
${[[70, 30], [200, 14], [330, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y + 14}" r="14" fill="#${s}" fill-opacity=".7" stroke="#${s}" stroke-width="3"/><path d="M${x} ${y + 36} Q${(x + 200) / 2} ${y + 70} 200 126" fill="none" stroke-opacity=".55" stroke-dasharray="4 12"/>`).join("")}
<line x1="40" y1="330" x2="360" y2="330" stroke-opacity=".5"/></svg>`;
};
// book: sách mở + dấu trang — bài giảng, giáo trình, khái niệm
ART.book = (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 360" fill="none" stroke="#${c}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
<path d="M200 96 Q140 60 40 74 V286 Q140 272 200 306 Z" fill="#${c}" fill-opacity=".14"/><path d="M200 96 Q260 60 360 74 V286 Q260 272 200 306 Z" fill="#${c}" fill-opacity=".32"/>
<line x1="200" y1="96" x2="200" y2="306"/>
${[120, 150, 180, 210, 240].map((y, i) => `<path d="M72 ${y} Q130 ${y - 10} 170 ${y + 4}" stroke-width="4" stroke-opacity=".5"/><path d="M230 ${y + 4} Q270 ${y - 10} ${i === 4 ? 300 : 328} ${y}" stroke-width="4" stroke-opacity=".5"/>`).join("")}
<path d="M300 66 V140 L316 126 L332 140 V62" fill="#${s}" fill-opacity=".8" stroke="#${s}" stroke-width="4"/>
<path d="M40 286 Q140 272 200 318 Q260 272 360 286" stroke-opacity=".6"/></svg>`;
// quiz: khung hỏi đáp — câu hỏi kiểm tra, thảo luận (dấu hỏi là HÌNH, không phải chữ)
ART.quiz = (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 360" fill="none" stroke="#${c}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
<path d="M40 40 H280 Q300 40 300 60 V190 Q300 210 280 210 H120 L70 256 V210 H60 Q40 210 40 190 V60 Q40 40 60 40 Z" fill="#${c}" fill-opacity=".14"/>
<path d="M140 100 Q140 66 172 66 Q204 66 204 96 Q204 118 176 128 V150" stroke-width="14"/><circle cx="176" cy="180" r="9" fill="#${c}" stroke="none"/>
<path d="M230 150 H340 Q360 150 360 170 V270 Q360 290 340 290 H330 V330 L290 290 H230 Q210 290 210 270 V170 Q210 150 230 150 Z" fill="#${s}" fill-opacity=".22" stroke="#${s}"/>
<path d="M252 222 L276 246 L322 196" stroke="#${s}" stroke-width="10"/></svg>`;
// guilloche: hoa văn giấy chứng nhận / tiền giấy (đường hypotrochoid chồng lớp) — nền trang trọng, không chứa chữ
ART.guilloche = (c) => {
  // vòng sin r(θ) = R + A·sin(nθ + φ), lệch pha dần → dải ren đan nhau
  const ring = (R, A, n, ph, op) => { let p = ""; for (let i = 0; i <= 720; i++) { const t = i / 720 * Math.PI * 2, r = R + A * Math.sin(n * t + ph);
    p += (i ? "L" : "M") + (400 + r * Math.cos(t)).toFixed(1) + " " + (400 + r * Math.sin(t)).toFixed(1); }
    return `<path d="${p}Z" fill="none" stroke="#${c}" stroke-opacity="${op}" stroke-width="1.3"/>`; };
  const out = [];
  for (let k = 0; k < 9; k++) out.push(ring(330, 30, 36, k * Math.PI * 2 / 9, 0.5));
  for (let k = 0; k < 7; k++) out.push(ring(235, 24, 24, k * Math.PI * 2 / 7, 0.42));
  for (let k = 0; k < 5; k++) out.push(ring(150, 18, 16, k * Math.PI * 2 / 5, 0.38));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">${out.join("")}<circle cx="400" cy="400" r="378" fill="none" stroke="#${c}" stroke-opacity=".5" stroke-width="2"/><circle cx="400" cy="400" r="388" fill="none" stroke="#${c}" stroke-opacity=".3" stroke-width="1"/><circle cx="400" cy="400" r="98" fill="none" stroke="#${c}" stroke-opacity=".45" stroke-width="1.5"/></svg>`;
};
// glow: quầng sáng mềm cho nền tối (tạo chiều sâu, kiểu slide hiện đại)
ART.glow = (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs>
<radialGradient id="a" cx="88%" cy="8%" r="62%"><stop offset="0" stop-color="#${c}" stop-opacity=".20"/><stop offset="1" stop-color="#${c}" stop-opacity="0"/></radialGradient>
<radialGradient id="b" cx="4%" cy="100%" r="45%"><stop offset="0" stop-color="#${c}" stop-opacity=".10"/><stop offset="1" stop-color="#${c}" stop-opacity="0"/></radialGradient></defs>
<rect width="1600" height="900" fill="url(#a)"/><rect width="1600" height="900" fill="url(#b)"/></svg>`;
const ART_INTERNAL = new Set(["guilloche", "glow"]); // không cho deck.json chọn trực tiếp
// landscape: núi nhiều lớp + sương + mây cuộn + mặt trời + sóng, viền vàng trên sống núi (cảm hứng tranh thuỷ mặc / cắt giấy).
// variant "hero": núi cao bên phải, chừa góc trên-trái cho chữ (bìa). "low": chỉ dải núi thấp + sóng ở đáy (chuyển phần, kết luận, nền trang).
// c = màu chủ (núi), g = vàng (viền, mặt trời), b = màu nền (sương, ruột mây). Toạ độ 1600x900 = cả slide.
const smooth = (pts) => { let d = `M${pts[0][0]} ${pts[0][1]}`; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
  d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0]} ${p2[1]}`; } return d; };
const ridge = (pts, fill, op, g, gw) => { const top = smooth(pts), last = pts[pts.length - 1], first = pts[0];
  return `<path d="${top} L${last[0]} 900 L${first[0]} 900 Z" fill="${fill}" fill-opacity="${op}"/>` + (g ? `<path d="${top}" fill="none" stroke="#${g}" stroke-width="${gw}" stroke-linecap="round"/>` : ""); };
const cloud = (x, y, s, g, b) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#${b}" stroke="#${g}" stroke-width="${3 / s}" stroke-linecap="round">
<path d="M0 40 C0 10 40 0 60 20 C70 -10 120 -10 130 20 C150 0 190 10 185 40 Z"/><path d="M60 22 C66 8 84 8 86 22 C88 32 74 36 70 28" fill="none"/><path d="M130 22 C136 10 152 12 152 24" fill="none"/></g>`;
ART.landscape = (c, g, b, v) => {
  const C = "#" + c, out = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs>
<linearGradient id="m1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C}" stop-opacity=".95"/><stop offset="1" stop-color="${C}" stop-opacity=".55"/></linearGradient>
<linearGradient id="m2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C}" stop-opacity=".55"/><stop offset="1" stop-color="${C}" stop-opacity=".12"/></linearGradient>
<linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#${b}" stop-opacity="0"/><stop offset="1" stop-color="#${b}" stop-opacity=".9"/></linearGradient></defs>`];
  if (v === "hero") {
    out.push(`<circle cx="1270" cy="250" r="105" fill="#${g}" fill-opacity=".35"/><circle cx="1270" cy="250" r="128" fill="none" stroke="#${g}" stroke-width="3" stroke-opacity=".7"/>`);
    out.push(ridge([[760, 900], [900, 560], [1010, 430], [1090, 470], [1200, 330], [1330, 410], [1440, 300], [1600, 380]], C, ".16", null));
    out.push(`<rect x="700" y="420" width="900" height="260" fill="url(#mist)"/>`);
    out.push(ridge([[640, 900], [820, 690], [960, 560], [1060, 610], [1180, 470], [1300, 560], [1420, 500], [1600, 470]], "url(#m2)", "1", g, 3));
    out.push(cloud(980, 170, 1.4, g, b), cloud(1420, 600, 1.0, g, b));
  }
  out.push(`<rect x="0" y="560" width="1600" height="340" fill="url(#mist)" opacity=".6"/>`);
  out.push(ridge([[0, 790], [180, 730], [380, 770], [560, 700], [760, 730], [980, 640], [1180, 690], [1380, 600], [1600, 640]], "url(#m2)", "1", g, 2.5));
  out.push(ridge([[0, 860], [220, 820], [430, 845], [640, 800], [860, 830], [1080, 770], [1300, 800], [1600, 740]], "url(#m1)", "1", g, 3));
  // sóng cuộn ở đáy
  let w = ""; for (let x = -40; x < 1640; x += 80) w += `<path d="M${x} 900 C${x + 10} 868 ${x + 46} 860 ${x + 58} 880 C${x + 66} 892 ${x + 50} 900 ${x + 40} 890" fill="none" stroke="#${b}" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>`;
  out.push(w, "</svg>");
  return out.join("");
};
ART_INTERNAL.add("landscape");
// cadastral: bản đồ địa chính — lưới thửa đất méo tự nhiên, một con đường, thửa tranh chấp tô nổi + đường tách thửa nét đứt + ghim.
// Hợp với chủ đề đất đai / nhà ở / bất động sản. Không chứa chữ: số thửa đặt bằng ô chữ thật (meta.motifLabel).
// v "hero": phủ nửa phải slide (bìa). Trang nội dung / chuyển phần / kết: dùng engine/motifs.js (đặt vào vùng trống thật).
const CAD_PIN = { x: 1190, y: 430 }; // toạ độ ghim (hệ 1600x900) để build.js đặt nhãn thửa
ART.cadastral = (c, g, b, v) => {
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const xs = [640, 800, 960, 1110, 1270, 1430, 1600], ys = [40, 200, 350, 520, 690, 900];
  const P = ys.map((y, j) => xs.map((x, i) => [x + (i && i < xs.length - 1 ? (rnd() - 0.5) * 70 : 0), y + (j && j < ys.length - 1 ? (rnd() - 0.5) * 60 : 0)]));
  const out = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" stroke-linejoin="round">`];
  const poly = (pts, fill, op, sw, so, dash) => `<polygon points="${pts.map(p => p.map(n => n.toFixed(1)).join(",")).join(" ")}" fill="${fill}" fill-opacity="${op}" stroke="#${c}" stroke-width="${sw}" stroke-opacity="${so}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
  for (let j = 0; j < ys.length - 1; j++) for (let i = 0; i < xs.length - 1; i++) {
    const q = [P[j][i], P[j][i + 1], P[j + 1][i + 1], P[j + 1][i]], fade = Math.min(1, (i + 0.6) / 2.2);
    if (j === 2) continue; // hàng này là đường giao thông
    out.push(poly(q, "#" + c, (0.05 + 0.07 * ((i * 3 + j * 5) % 4) / 3) * fade, 2.2, 0.55 * fade));
  }
  // đường giao thông (dải giữa hàng 2) + vạch tim đường
  const top = P[2], bot = P[3], mid = top.map((p, i) => [(p[0] + bot[i][0]) / 2, (p[1] + bot[i][1]) / 2]);
  out.push(`<path d="M${top.map(p => p.join(" ")).join(" L")} L${bot.slice().reverse().map(p => p.join(" ")).join(" L")} Z" fill="#${b}" stroke="#${c}" stroke-width="2.5" stroke-opacity=".6"/>`);
  out.push(`<path d="M${mid.map(p => p.join(" ")).join(" L")}" fill="none" stroke="#${g}" stroke-width="3" stroke-dasharray="18 14"/>`);
  if (v === "hero") {
    // thửa tranh chấp: ô (hàng 1, cột 3), tách đôi bằng nét đứt (tách thửa)
    const t = [P[1][3], P[1][4], P[2][4], P[2][3]];
    out.push(poly(t, "#" + g, 0.55, 5, 1));
    const a = [(t[0][0] + t[1][0]) / 2, (t[0][1] + t[1][1]) / 2], z = [(t[3][0] + t[2][0]) / 2, (t[3][1] + t[2][1]) / 2];
    out.push(`<line x1="${a[0]}" y1="${a[1]}" x2="${z[0]}" y2="${z[1]}" stroke="#${c}" stroke-width="3.5" stroke-dasharray="12 9"/>`);
    // nhà trên thửa
    const hx = (t[0][0] + t[2][0]) / 2 + 38, hy = (t[0][1] + t[2][1]) / 2 + 30;
    out.push(`<g fill="#${c}"><polygon points="${hx - 34},${hy} ${hx},${hy - 30} ${hx + 34},${hy}"/><rect x="${hx - 26}" y="${hy}" width="52" height="36"/><rect x="${hx - 8}" y="${hy + 14}" width="16" height="22" fill="#${b}"/></g>`);
    // ghim vị trí
    const { x, y } = CAD_PIN;
    out.push(`<path d="M${x} ${y} C${x} ${y - 40} ${x - 34} ${y - 52} ${x - 34} ${y - 84} A34 34 0 0 1 ${x + 34} ${y - 84} C${x + 34} ${y - 52} ${x} ${y - 40} ${x} ${y} Z" fill="#${c}"/><circle cx="${x}" cy="${y - 84}" r="13" fill="#${b}"/>`);
    // la bàn + khung toạ độ
    out.push(`<g transform="translate(1500 110)" stroke="#${c}" stroke-width="2.5"><circle r="44" fill="#${b}"/><polygon points="0,-38 9,0 0,38 -9,0" fill="#${c}"/><polygon points="0,-38 9,0 -9,0" fill="#${g}"/></g>`);
    for (let k = 0; k < 9; k++) out.push(`<line x1="${700 + k * 110}" y1="895" x2="${700 + k * 110}" y2="875" stroke="#${c}" stroke-width="2" stroke-opacity=".6"/>`);
  }
  // mép trái tan dần vào nền (không có đường cắt thẳng)
  out.push(`<defs><linearGradient id="fade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#${b}" stop-opacity="1"/><stop offset="1" stop-color="#${b}" stop-opacity="0"/></linearGradient></defs><rect x="600" y="0" width="${v === "hero" ? 420 : 300}" height="900" fill="url(#fade)"/><rect x="0" y="0" width="601" height="900" fill="#${b}" fill-opacity="0"/>`);
  out.push("</svg>");
  return out.join("");
};
ART_INTERNAL.add("cadastral");
// ART_RATIO: tỉ lệ rộng/cao của từng hình (đọc từ viewBox) — ô ảnh "Hình minh hoạ" tự co về đúng tỉ lệ, hình không bị kéo méo.
// ART_USE: hình nào xuất hiện ở slide nào (chỉ trang nội dung) — cùng một hình lặp ≥ 3 slide là hình trang trí, không nói gì về nội dung.
const ART_RATIO = new Map(), ART_USE = {}, HERO_TYPES = new Set(["cover", "section", "end", "closing"]);
let DEF_ART = { hero: "justice", small: "scales", doc: "document" }, FLOW_CROSS = [], ART_FIXED = false;
// Hình mặc định cho mục lục / kết luận / slide cuối: XOAY trong họ hình hợp loại bài, mỗi lần gọi lấy hình dùng ít nhất —
// trước đây cả ba đều là cán cân (lặp 3 lần trong một deck). meta.art ghi tay → giữ nguyên một hình (ART_FIXED).
const ART_FAMILY = { case: ["scales", "justice", "gavel", "courthouse", "document"], lecture: ["book", "quiz", "document", "shield"], report: ["document", "fund", "shield", "umbrella"] };
let ART_KIND = "case"; const ROT_USED = {};
function rotArt() { if (ART_FIXED) return DEF_ART.small;
  const fam = [DEF_ART.small, ...(ART_FAMILY[ART_KIND] || ART_FAMILY.case)].filter((v, i, a) => a.indexOf(v) === i);
  const pick = fam.reduce((b, a) => ((ROT_USED[a] || 0) < (ROT_USED[b] || 0) ? a : b), fam[0]); ROT_USED[pick] = (ROT_USED[pick] || 0) + 1; return pick; }
async function art(name, c, s, b, w = 900, v) { const k = `art:${name}:${c}:${s}:${b}:${w}:${v}`;
  if (!ASSETS[k]) { const svg = ART[name](c, s || c, b, v), vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/); ASSETS[k] = await png(svg, w); if (vb) ART_RATIO.set(ASSETS[k], +vb[1] / +vb[2]); }
  if (CUR && !ART_INTERNAL.has(name) && !HERO_TYPES.has(CUR.type)) (ART_USE[name] = ART_USE[name] || new Set()).add(CUR.n);
  return ASSETS[k]; }
function fitArt(o) { // giữ tỉ lệ hình trong ô (căn giữa) — chỉ với hình minh hoạ vẽ bằng code
  const r = o && o.data && o.altText === "Hình minh hoạ" && ART_RATIO.get(o.data); if (!r || !o.w || !o.h) return o;
  const w = Math.min(o.w, o.h * r), h = w / r; return Object.assign({}, o, { x: o.x + (o.w - w) / 2, y: o.y + (o.h - h) / 2, w, h }); }
// icon fa6 phổ biến -> bản Phosphor Duotone cùng nghĩa (tự nâng cấp deck cũ; tên Pi... dùng trực tiếp cũng được)
const DUO = { FaHouse: "PiHouseDuotone", FaHouseChimney: "PiHouseLineDuotone", FaUser: "PiUserDuotone", FaUsers: "PiUsersDuotone", FaUserTie: "PiUserDuotone",
  FaHandHoldingDollar: "PiHandCoinsDuotone", FaBuildingColumns: "PiBankDuotone", FaLandmark: "PiBankDuotone", FaScaleBalanced: "PiScalesDuotone", FaGavel: "PiGavelDuotone",
  FaLightbulb: "PiLightbulbDuotone", FaQuoteLeft: "PiQuotesDuotone", FaFileContract: "PiFileTextDuotone", FaFileSignature: "PiFileTextDuotone", FaFileLines: "PiFileTextDuotone",
  FaCalendarDays: "PiCalendarDuotone", FaHandshake: "PiHandshakeDuotone", FaStamp: "PiStampDuotone", FaMoneyBill: "PiMoneyDuotone", FaCoins: "PiCoinsDuotone",
  FaTriangleExclamation: "PiWarningDuotone", FaLocationDot: "PiMapPinDuotone", FaShieldHalved: "PiShieldCheckDuotone", FaBook: "PiBookOpenTextDuotone", FaBookOpen: "PiBookOpenTextDuotone",
  FaKey: "PiKeyDuotone", FaLock: "PiLockDuotone", FaClock: "PiClockDuotone", FaMagnifyingGlass: "PiMagnifyingGlassDuotone", FaIdCard: "PiIdentificationCardDuotone", FaCertificate: "PiCertificateDuotone" };
// Tự đổi FaX → PiXDuotone khi Phosphor có bản cùng tên (FaGlobe → PiGlobeDuotone...): mọi icon trong một slide cùng MỘT kiểu
// (trước đây icon chưa có trong bảng DUO hiện kiểu khối đặc, nằm cạnh icon hai tông → lệch phong cách). Dấu ✓ ✗ ? › giữ nét fa6.
const GLYPH = new Set(["FaCheck", "FaXmark", "FaQuestion", "FaMinus", "FaChevronRight", "FaArrowRight"]);
// dấu ✓ ✗ ? › → bản Phosphor Bold (MIT): nét đậm như fa6 nhưng không phải ghi nguồn CC BY
const GLYPH_PI = { FaCheck: "PiCheckBold", FaXmark: "PiXBold", FaQuestion: "PiQuestionBold", FaMinus: "PiMinusBold", FaChevronRight: "PiCaretRightBold", FaArrowRight: "PiArrowRightBold" };
Object.assign(DUO, { FaStore: "PiStorefrontDuotone", FaArrowTrendUp: "PiTrendUpDuotone", FaArrowTrendDown: "PiTrendDownDuotone" });
const duoName = (name) => DUO[name] || (!GLYPH.has(name) && /^Fa/.test(name) && pi["Pi" + name.slice(2) + "Duotone"] ? "Pi" + name.slice(2) + "Duotone" : null);
const iconComp = (name) => pi[duoName(name)] || pi[GLYPH_PI[name]] || pi[name] || lu[name] || tb[name] || (fa[name] && (FA_USED.add(name), fa[name]));
// ---------- ẢNH THẬT ----------
// Cắt đúng khung theo vùng nổi bật (sharp "attention"), nhuộm theo tông theme, phủ lớp chuyển màu phía có chữ.
// side: "left" = chữ nằm bên trái (lớp tối từ trái sang), "full" = phủ đều, "none" = không phủ.
let DECK_DIR = ".", PHOTOS = {}, CREDITS = [];
function hexRgb(h) { return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) }; }
let FOCUS = null; // vùng giữ lại khi cắt ảnh: d.photoFocus của slide đang dựng (top | center | bottom), mặc định tự chọn vùng nổi bật
async function photo(src, w, h, tint, overlay, side = "left", strength = 0.9, style = "tint") {
  const k = `ph:${src}:${w}:${h}:${tint}:${overlay}:${side}:${strength}:${style}:${FOCUS}`;
  if (!ASSETS[k]) {
    const file = path.resolve(DECK_DIR, src), px = Math.round(Math.min(2400, w * 180)), py = Math.round(px * h / w);
    let img = sharp(file).rotate().resize(px, py, { fit: "cover", position: FOCUS || sharp.strategy.attention });
    // photoStyle: tint (nhuộm tông theme) | natural (màu thật) | bw (đen trắng — tư liệu, hồ sơ) | duotone (2 màu theme)
    if (style === "bw") img = img.grayscale().modulate({ brightness: 0.95 });
    else if (style === "duotone" && tint) img = img.grayscale().tint(hexRgb(tint));
    else if (style === "tint" && tint) img = img.modulate({ saturation: 0.35, brightness: 0.8 }).tint(hexRgb(tint));
    const grad = side === "none" ? null : side === "full"
      ? `<rect width="${px}" height="${py}" fill="#${overlay}" fill-opacity="${strength * 0.55}"/>`
      // side: left | right (phía có chữ); hậu tố "-narrow": lớp tối chỉ phủ ~55% bề ngang để phần ảnh còn lại giữ chi tiết (ảnh có chú thích)
      : (() => { const nar = /narrow/.test(side), rt = /^right/.test(side), [m1, e1] = nar ? [".38", ".58"] : [".5", ".86"];
          return `<defs><linearGradient id="g" x1="${rt ? 1 : 0}" y1="0" x2="${rt ? 0 : 1}" y2="0"><stop offset="0" stop-color="#${overlay}" stop-opacity="${strength}"/><stop offset="${m1}" stop-color="#${overlay}" stop-opacity="${strength * 0.88}"/><stop offset="${e1}" stop-color="#${overlay}" stop-opacity="0"/></linearGradient></defs><rect width="${px}" height="${py}" fill="url(#g)"/>`; })();
    if (grad) img = img.composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${py}">${grad}</svg>`), top: 0, left: 0 }]);
    ASSETS[k] = "image/jpeg;base64," + (await img.jpeg({ quality: 86 }).toBuffer()).toString("base64");
  }
  return ASSETS[k];
}
// ---------- ĐỌC ẢNH: bố cục đi theo ảnh, không ép ảnh vào khung cố định ----------
// Trên đúng vùng ảnh sẽ hiện (cắt như photo()), ở độ phân giải nhỏ:
//  · busy: mật độ chi tiết (độ lớn gradient độ sáng) theo cột/hàng → "vùng yên tĩnh" để đặt chữ, phía còn lại là chủ thể
//  · bright: độ sáng trung bình từng phía → chọn lớp phủ / màu chữ
//  · accent: màu nổi bật nhất của ảnh (đủ bão hoà, không quá tối/sáng) → màu nhấn của slide; accentDark đạt 4.5:1 trên nền trắng
const PH_INFO = {};
async function analyzePhoto(src, w, h) {
  const k = `${src}:${(w / h).toFixed(2)}:${FOCUS}`; if (PH_INFO[k]) return PH_INFO[k];
  const file = path.resolve(DECK_DIR, src), cw = 96, ch = Math.max(8, Math.round(cw * h / w));
  const { data } = await sharp(file).rotate().resize(cw, ch, { fit: "cover", position: FOCUS || sharp.strategy.attention }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const L = new Float32Array(cw * ch), bins = new Map();
  for (let i = 0; i < cw * ch; i++) { const r = data[3 * i], g = data[3 * i + 1], b = data[3 * i + 2];
    L[i] = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx ? (mx - mn) / mx : 0, val = mx / 255;
    if (sat > 0.35 && val > 0.25 && val < 0.92) { const key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5), e = bins.get(key) || { n: 0, r: 0, g: 0, b: 0, s: 0 };
      e.n++; e.r += r; e.g += g; e.b += b; e.s += sat; bins.set(key, e); } }
  const G = new Float32Array(cw * ch);
  for (let y = 1; y < ch - 1; y++) for (let x = 1; x < cw - 1; x++) { const i = y * cw + x; G[i] = Math.abs(L[i + 1] - L[i - 1]) + Math.abs(L[i + cw] - L[i - cw]); }
  const reg = (x0, x1, y0, y1) => { let gs = 0, ls = 0, n = 0; for (let y = Math.max(1, Math.round(y0 * ch)); y < Math.min(ch - 1, Math.round(y1 * ch)); y++) for (let x = Math.max(1, Math.round(x0 * cw)); x < Math.min(cw - 1, Math.round(x1 * cw)); x++) { const i = y * cw + x; gs += G[i]; ls += L[i]; n++; } return { busy: n ? gs / n : 0, bright: n ? ls / n : 0.5 }; };
  const R = { left: reg(0, 0.42, 0, 1), right: reg(0.58, 1, 0, 1), top: reg(0, 1, 0, 0.4), bottom: reg(0, 1, 0.6, 1), all: reg(0, 1, 0, 1) };
  const quiet = R.left.busy <= R.right.busy ? "left" : "right", quietV = R.top.busy <= R.bottom.busy ? "top" : "bottom";
  const best = [...bins.values()].filter(e => e.n >= cw * ch * 0.02).sort((a, b) => b.n * (b.s / b.n) - a.n * (a.s / a.n))[0];
  let accent = null, accentDark = null;
  if (best) { const hx = (v) => Math.round(v / best.n).toString(16).padStart(2, "0"); accent = (hx(best.r) + hx(best.g) + hx(best.b)).toUpperCase();
    accentDark = accent; for (let f = 0.08; f <= 0.8 && ratio(accentDark, "FFFFFF") < 4.6; f += 0.08) accentDark = mix(accent, "000000", f); // làm tối dần tới khi đọc được trên nền trắng
    if (ratio(accentDark, "FFFFFF") < 4.5) accentDark = null; }
  return (PH_INFO[k] = { quiet, quietV, R, accent, accentDark, contrastBusy: Math.max(R.left.busy, R.right.busy) / Math.max(1e-4, Math.min(R.left.busy, R.right.busy)) });
}
// màu nhấn của slide ảnh: lấy từ ảnh nếu đủ tương phản và khác hẳn màu chữ; meta.photoAccent = false để tắt
function photoAccent(c, info) { return (PHOTO_ACCENT && info && info.accentDark) ? info.accentDark : c.acc; }
let PHOTO_ACCENT = true;
// phía đặt chữ: textSide của slide (người làm slide chỉnh tay) > phía yên tĩnh của ảnh (chỉ khi hai phía khác nhau rõ, > 12%) > mặc định của bố cục
function sideOf(d, info, def) { if (d.textSide === "left" || d.textSide === "right") return d.textSide; return info && info.contrastBusy > 1.12 ? info.quiet : def; }
// màu nhấn đọc được trên nền tối (chữ trên lớp phủ ảnh): làm sáng dần màu của ảnh tới khi đạt 4.5:1
// chữ màu nhấn trên nền nhạt cùng màu: sẫm dần về màu chữ chính tới khi đạt 4.5:1
function darkOn(col, bg) { let x = col; for (let f = 0.1; f <= 1.0001 && ratio(x, bg) < 4.6; f += 0.1) x = mix(col, TH.l.text, f); return x; }
function lightOn(col, bg) { let x = col; for (let f = 0.1; f <= 0.9 && ratio(x, bg) < 4.6; f += 0.1) x = mix(col, "FFFFFF", f); return ratio(x, bg) >= 4.5 ? x : "FFFFFF"; }
// thông tin ghi công ảnh (bắt buộc với giấy phép CC BY / BY-SA): tác giả · giấy phép · nguồn — KHÔNG in lên slide, xuất ra file *_ghi-cong.md để dán vào bản Word
function creditOf(src, d) {
  if (d && d.photoCredit) return d.photoCredit;
  if (d && d.photoSource) { let host = String(d.photoSource); try { host = new URL(d.photoSource).hostname.replace(/^www\./, ""); } catch (e) {} return `Nguồn ảnh: ${host}`; }
  const m = PHOTOS[path.basename(String(src))]; if (!m) return null;
  return `Ảnh: ${String(m.creator).slice(0, 40)} · ${m.license}${m.license_version && !/\d/.test(m.license) ? " " + m.license_version : ""} · ${m.via}${m.edited ? " · đã tách nền" : ""}`; // CC BY/BY-SA: phải ghi rõ đã chỉnh sửa
}
async function photoCredit(s, src, d) { // ảnh KHÔNG in dòng ghi nguồn lên slide (nguồn ghi trong bản Word đi kèm) — chỉ gom vào danh sách ghi công
  const t = creditOf(src, d); if (!t) return;
  CREDITS.push({ slide: CUR.n, text: t, source: (PHOTOS[path.basename(String(src))] || {}).source || "" });
}
async function icon(name, c) {
  const k = `ic:${name}:${c}`;
  if (!ASSETS[k]) {
    const C = iconComp(name);
    if (!C) throw new Error(`Icon không tồn tại: ${name} (xem references/icons.md)`);
    ASSETS[k] = await png(RDS.renderToStaticMarkup(React.createElement(C, { color: "#" + c, size: 256 })), 256);
  }
  return ASSETS[k];
}
// dấu vẽ tay (Rough.js): CHỈ dùng để khoanh/gạch đúng con số hoặc hàng người nói đang chỉ vào — mỗi slide tối đa 1 dấu
async function mark(s, kind, x, y, w, h, color, seed = 2) {
  const k = `mk:${kind}:${w.toFixed(2)}:${h.toFixed(2)}:${color}:${seed}`, P = 100, pad = 12;
  if (!ASSETS[k]) {
    const g = rough.generator({ options: { seed } }), o = { stroke: "#" + color, strokeWidth: 4.5, roughness: 1.4, bowing: 1.1 };
    const W_ = w * P, H_ = h * P, d = kind === "underline" ? g.curve([[0, H_ - 8], [W_ * 0.35, H_ - 2], [W_ * 0.7, H_ - 10], [W_, H_ - 4]], o)
      : kind === "box" ? g.rectangle(2, 2, W_ - 4, H_ - 4, o) : g.ellipse(W_ / 2, H_ / 2, W_ - 6, H_ - 6, o);
    const paths = g.toPaths(d).map(p => `<path d="${p.d}" fill="none" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" stroke-linecap="round"/>`).join("");
    ASSETS[k] = await png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${W_ + 2 * pad} ${H_ + 2 * pad}">${paths}</svg>`, Math.round((W_ + 2 * pad) * 2));
  }
  s.addImage({ data: ASSETS[k], x: x - pad / P, y: y - pad / P, w: w + 2 * pad / P, h: h + 2 * pad / P, altText: "Dấu nhấn mạnh vẽ tay" });
}

// hatch: mục biểu đồ có `hatch: true` tô GẠCH CHÉO gốc PowerPoint (a:pattFill) — nghĩa cố định trong cả deck:
// "chưa chắc / đang tranh chấp / đã hết hiệu lực / ước tính". Có viền cùng màu để vẫn thấy khối khi in đen trắng.
function hatchOf(it, c, col) { if (!it || !it.hatch) return {}; if (ratio(col, c.bg) < 3) col = c.acc; // nét gạch màu nhạt trên nền trắng gần như vô hình
  return { objectName: `HATCH:${col}:${CUR && CUR.bg ? CUR.bg : c.bg}`, line: { color: col, width: 1.25 } }; }

// annotate: chú thích VIẾT TAY chỉ vào MỘT cột/thanh — vòng khoanh + mũi tên cong + câu ngắn chữ nghiêng (perfect-freehand, MIT).
// Chữ là ô chữ thật (đo tràn, đọc được bằng trình đọc màn hình); nét bút là SVG vector. Vị trí câu: thử 6 chỗ quanh vòng khoanh,
// chọn chỗ nằm trong vùng biểu đồ và đè ít nhất lên các cột khác.
async function handNote(s, c, b, text, A, others) {
  const pad = 0.14, rx = b.w / 2 + pad, ry = b.h / 2 + pad * 0.8, cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  // đo và vẽ bằng CÙNG một bộ thuộc tính chữ (theme có chữ nhấn đậm như "son" làm câu rộng hơn)
  const runs = rich(text, c.bad, c.bad).map(r => ({ text: r.text, options: Object.assign({}, r.options, { fontFace: TH.accentFont, italic: true, bold: !!TH.accentBold }) }));
  const fo = { fontFace: TH.accentFont, fontSize: 18, italic: true, bold: !!TH.accentBold };
  const tw = Math.min(2.3, fitW(String(text).replace(/[\[\]]/g, ""), fo, 0.2, 0.11, 2.3)); // ≤ 2.3 in: câu dài xuống 2 dòng thay vì chen ngang
  const th = realH(runs, fo, tw, 0.9) + 0.08;
  const ring = { x: cx - rx, y: cy - ry, w: 2 * rx, h: 2 * ry }, ov = (p, q) => Math.max(0, Math.min(p.x + p.w, q.x + q.w) - Math.max(p.x, q.x)) * Math.max(0, Math.min(p.y + p.h, q.y + q.h) - Math.max(p.y, q.y));
  // mũi tên không được cắt ngang cột/thanh khác (người xem sẽ tưởng chú thích chỉ vào cột đó)
  const crossCost = (r) => { let k = 0; const ax = r.x + r.w / 2, ay = r.y + r.h / 2;
    for (let t = 0.1; t < 0.95; t += 0.05) { const px = ax + (cx - ax) * t, py = ay + (cy - ay) * t; if (others.some(o => px > o.x && px < o.x + o.w && py > o.y && py < o.y + o.h)) k += 3; } return k; };
  // quét cả vùng biểu đồ theo lưới 0.25 in: chỗ đè vòng khoanh / cột khác / nhãn / vạch mốc bị LOẠI (phạt 1000), còn lại chọn chỗ gần cột nhất
  const cand = [];
  for (let y = A.y0; y + th <= A.y1; y += 0.25) for (let x = A.x0; x + tw <= A.x1 + 0.3; x += 0.25) cand.push({ x, y, w: tw, h: th });
  const pad2 = (o) => ({ x: o.x - 0.08, y: o.y - 0.08, w: o.w + 0.16, h: o.h + 0.16 });
  // mọi ô chữ đã vẽ trên slide (nhãn năm, nhãn giá trị, tên hàng, nhãn mốc) cũng là vật cản — dùng khung chữ THẬT (textBottom)
  for (const r of CUR.recs) if (r.body && !["title", "kicker"].includes(r.label) && String(Array.isArray(r.text) ? r.text.map(q => q.text).join("") : r.text).trim()) { const tb = textBottom(r); others = others.concat([{ x: r.o.x, y: tb.top, w: r.o.w, h: tb.bot - tb.top }]); }
  const scored = cand.map(r => ({ r, cost: (ov(r, pad2(ring)) > 0 ? 1000 : 0) + (others.some(o => ov(r, pad2(o)) > 0) ? 1000 : 0)
    + Math.hypot(r.x + r.w / 2 - cx, r.y + r.h / 2 - cy) + crossCost(r) }));
  const best = (scored.sort((p, q) => p.cost - q.cost)[0] || { r: { x: A.x0, y: A.y0, w: tw, h: th } }).r;
  // mũi tên: từ mép câu gần vòng khoanh nhất tới điểm trên vòng khoanh theo hướng tâm
  const sx = best.x + best.w / 2 < cx ? best.x + best.w + 0.08 : best.x - 0.08, sy = best.y + best.h / 2;
  const ang = Math.atan2(sy - cy, sx - cx), ex = cx + Math.cos(ang) * (rx + 0.06), ey = cy + Math.sin(ang) * (ry + 0.06);
  const svg = CA.handMarks([{ kind: "ring", x: cx, y: cy, rx, ry }, { kind: "arrow", x1: sx, y1: sy, x2: ex, y2: ey, bend: 0.22 * (sx < cx ? -1 : 1) }], c.bad, CUR ? CUR.n : 3);
  s.addImage({ data: await png(svg, 1600), x: 0, y: 0, w: W, h: H, altText: "Chú thích viết tay: " + String(text).replace(/[\[\]]/g, "") });
  T(s, runs, { _label: "annotate.text", x: best.x, y: best.y, w: best.w, h: best.h, fontSize: 18, color: c.bad, bold: !!TH.accentBold, align: best.x + best.w / 2 < cx ? "right" : "left" });
}

// cutout: ẢNH THẬT đã tách nền (scripts/cutout.py → images/<tên>_cut.png) đặt vào đúng ô của hình vẽ `art` — vật thật (chìa khoá, cuốn sổ đỏ, toà nhà)
// thay hình vẽ minh hoạ. Giữ tỉ lệ ảnh, căn giữa trong ô; ghi nguồn như ảnh thường (images.json do cutout.py ghi).
async function artOrCut(s, d, mk, x, y, w, h) {
  if (d.cutout) {
    const f = path.resolve(DECK_DIR, d.cutout), md = await sharp(f).metadata(), r = Math.min(w / md.width, h / md.height), iw = md.width * r, ih = md.height * r;
    s.addImage({ path: f, x: x + (w - iw) / 2, y: y + (h - ih) / 2, w: iw, h: ih, altText: d.cutoutAlt || d.photoAlt || "Ảnh vật thật đã tách nền" });
    const t = creditOf(d.cutout, d); if (t) CREDITS.push({ slide: CUR.n, text: t, source: (PHOTOS[path.basename(String(d.cutout))] || {}).source || "" });
    return;
  }
  if (d.art !== "none") s.addImage({ altText: "Hình minh hoạ", data: await mk(), x, y, w, h });
}
// ---------- primitives ----------
function rich(str, base, acc, size) {
  return String(str).split(/(\[[^\]]+\])/).filter(Boolean).map(p => p.startsWith("[")
    ? { text: p.slice(1, -1), options: { fontFace: TH.accentFont, italic: TH.accentItalic, bold: TH.accentBold, color: acc } }
    : { text: p, options: { fontFace: TH.titleFont, bold: TH.titleBold, color: base } });
}
// ---------- ghi nhận ô chữ: đặt tên duy nhất (cho check_overflow.py) + đo chữ lúc dựng ----------
let CUR = null, PARTS = {}; // trạng thái slide đang dựng
const norm = (v) => String(v).replace(/[\[\]]/g, "").replace(/^—\s*/, "").replace(/\s+/g, " ").trim().toUpperCase();
function beginSlide(n, d, meta, resolved) {
  const labels = new Map(), add = (k, p) => { k = norm(k); if (!k) return; if (!labels.has(k)) labels.set(k, { paths: [], i: 0 }); labels.get(k).paths.push(p); };
  const walk = (v, p) => {
    if (typeof v === "string" || typeof v === "number") add(v, p);
    else if (Array.isArray(v)) { if (v.length === 2 && v.every(x => typeof x === "string")) add(v.join(" "), p); v.forEach((x, i) => walk(x, `${p}[${i}]`)); }
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (k !== "notes" && k !== "type") walk(x, p ? `${p}.${k}` : k);
  };
  walk(d, ""); if (meta.short) add(meta.short, "meta.short");
  // "phần" của slide lấy từ kicker dạng "Câu 02 · ..." / "Phần 1 ..." — hiện ở thanh trên và số lớn mờ ở góc
  const pm = String(d._kick0 != null ? d._kick0 : d.kicker || "").match(/^(Câu|Phần|Chương|Mục)\s*(\d+)/i);
  CUR = { n, type: d.type, labels, cnt: 0, names: new Set(), recs: [], fills: [], geo: [], inBody: false, mode: null, seq: 0, bg: null, grp: 0, build: {}, bcnt: 0, mo: {}, mk: 0, sfx: null, sig: { macro: new Set(), meso: new Set(), micro: new Set() }, part: pm ? { label: `${pm[1]} ${pm[2]}`, num: pm[2] } : null };
}
function labelOf(text) {
  const runs = Array.isArray(text) ? text : [{ text }];
  const parts = runs.map(r => r.text == null ? "" : r.text), full = parts.join(" ");
  if (/^\d\d \/ \d\d$/.test(full)) return "số trang";
  // rich() tách [từ khoá] thành nhiều run nối liền nhau (nối ""); cặp [mốc, nhãn] nối bằng khoảng trắng
  for (const k of [norm(parts.join("")), norm(full), norm(parts[0])]) {
    const e = CUR.labels.get(k); if (e) return e.paths[Math.min(e.i++, e.paths.length - 1)];
  }
  return null;
}
function addT(s, text, o) {
  if (!Array.isArray(text)) text = String(text == null ? "" : text);
  const label = o._label || labelOf(text);
  o = Object.assign({}, o); delete o._label;
  let name = `S${CUR.n}|${CUR.type}|${label || "t" + CUR.cnt}`;
  for (let k = 2; CUR.names.has(name); k++) name = `S${CUR.n}|${CUR.type}|${label || "t" + CUR.cnt}#${k}`;
  CUR.names.add(name); CUR.cnt++;
  if (CUR.grp && (BUILD_ON || MOTION_ON)) (CUR.build[CUR.grp] = CUR.build[CUR.grp] || []).push(name);
  moName(name);
  const opt = Object.assign({ lang: LANG, objectName: name }, o);
  CUR.recs.push({ name, label, text, o: opt, seq: CUR.seq++, body: CUR.inBody });
  s.addText(text, opt);
}
// Lớp 2: đo số dòng thật so với chiều cao ô. Trả về mảng cảnh báo.
let NOFONT = new Set();
// ---------- ĐỘ TƯƠNG PHẢN (nhìn rõ khi trình chiếu) ----------
// Ghi lại mọi mảng màu đã vẽ; với mỗi ô chữ, tìm màu nền thật bên dưới (có tính độ trong suốt) và tính tỉ lệ WCAG.
// build (hiện từng ý khi bấm): mọi đối tượng vẽ trong lúc CUR.grp = k thuộc nhóm k — đặt tên riêng để bước hậu xử lý tìm id
function buildTag(o) { if (!o || !CUR) return o; const b = CUR.grp && (BUILD_ON || MOTION_ON);
  if (!b && !CUR.mk) return o;
  o = Object.assign({}, o); if (!o.objectName) o.objectName = `B${CUR.n}_${CUR.grp || "m" + CUR.mk}_${CUR.bcnt++}`;
  if (b) (CUR.build[CUR.grp] = CUR.build[CUR.grp] || []).push(o.objectName);
  moName(o.objectName); return o; }
// motion: mo(k, fx, gap) — mọi đối tượng vẽ sau lệnh này thuộc NHỊP k (hiện bằng hiệu ứng fx, chờ thêm gap ms trước nhịp này); mo(0) = đứng yên.
// fx: rise (nổi lên) · fade · wipe (trượt từ trái — chiều đọc) · up (mọc từ đáy) · slam (con số đáp xuống). CUR.sfx: hiệu ứng riêng cho vài hình trong nhịp.
function mo(k, fx = "rise", gap = 0, pulse = false) { if (!CUR) return; CUR.mk = MOTION_ON ? k : 0; CUR.sfx = null; if (CUR.mk && !CUR.mo[k]) CUR.mo[k] = { names: [], fx, gap, nfx: {}, pulse }; }
function moName(name) { if (!CUR || !CUR.mk) return; const g = CUR.mo[CUR.mk]; g.names.push(name); if (CUR.sfx) g.nfx[name] = CUR.sfx; }
function trackSlide(s, bg) {
  CUR.bg = bg;
  const addShape = s.addShape.bind(s), addImage = s.addImage.bind(s);
  s.addShape = (type, o) => { if (o && o.fill && o.fill.color && o.fill.type !== "none" && type !== pres.shapes.BLOCK_ARC /* vành donut: khung bao phủ cả lỗ giữa — không coi là nền */) CUR.fills.push({ x: o.x, y: o.y, w: o.w, h: o.h, color: o.fill.color, tr: o.fill.transparency || 0, seq: CUR.seq++ });
    if (CUR.inBody && o) CUR.geo.push({ kind: type === pres.shapes.LINE ? "line" : type === pres.shapes.BLOCK_ARC ? "arc" : "shape", x: o.x, y: o.y, w: o.w, h: o.h, filled: !!(o.fill && o.fill.color && o.fill.type !== "none" && (o.fill.transparency || 0) < 95), tr: (o.fill && o.fill.transparency) || 0 });
    if (o && o._deco) { CUR.inBody && CUR.geo.length && (CUR.geo[CUR.geo.length - 1].deco = true); o = Object.assign({}, o); delete o._deco; } // hình trang trí (dải màu thẻ…): bộ kiểm không coi là icon
    return addShape(type, buildTag(o)); };
  s.addImage = (o) => { o = fitArt(o); if (CUR.inBody && o) CUR.geo.push({ kind: "image", x: o.x, y: o.y, w: o.w, h: o.h, filled: false, deco: !!o._deco });
    if (o && (o._bg || o._deco)) { if (o._bg) CUR.fills.push({ x: o.x, y: o.y, w: o.w, h: o.h, color: o._bg, tr: 0, seq: CUR.seq++ }); o = Object.assign({}, o); delete o._bg; delete o._deco; } return addImage(buildTag(o)); };
}
// ---------- KHÔNG GIAN (lớp 3): dư khoảng trống, thẻ rỗng, khối sát nhau ----------
// Đo trên toạ độ thật của mọi hình/ô chữ trong phần thân (sau tiêu đề, trước hàng chú thích).
// Học từ nguyên tắc "đều khoảng trắng" của Refactoring UI / Material: khoảng trắng phải có chủ đích —
// một dải trống > ~1 in giữa thân và chú thích nghĩa là bố cục không co giãn theo nội dung.
const SPACE_SKIP = new Set(["headline", "lens", "collage", "cover", "section", "photo", "split", "gallery", "statement", "closing", "quote", "end", "mosaic", "photostats", "quiz"]); // quote: khoảng trắng quanh câu trích là chủ đích; quiz: chừa sẵn chỗ "Vì sao" để thẻ đứng yên giữa slide hỏi → đáp án
const GAP_MIN = 0.15; // in — hai khối (thẻ, ô) đứng cạnh nhau phải cách ít nhất chừng này, hoặc chạm/lồng hẳn vào nhau
function textBottom(r) { // đáy thật của chữ (không phải đáy khung)
  const o = r.o, m = measure(r.text, o, o.w); if (!m.ok) return { top: o.y, bot: o.y + o.h };
  const hh = Math.min(o.h, m.height);
  if (o.valign === "middle") return { top: o.y + (o.h - hh) / 2, bot: o.y + (o.h + hh) / 2 };
  if (o.valign === "bottom") return { top: o.y + o.h - hh, bot: o.y + o.h };
  return { top: o.y, bot: o.y + hh };
}
function checkSpace() {
  const warn = [], where = `Slide ${CUR.n} (${CUR.type})`;
  if (SPACE_SKIP.has(CUR.type) || CUR.mode === "d") return warn;
  const texts = CUR.recs.filter(r => r.body && r.o.w > 0 && (Array.isArray(r.text) ? r.text.some(x => String(x.text || "").trim()) : String(r.text).trim()));
  const isFoot = (r) => r.label === "chú thích" || r.o.y >= FOOT_Y - 0.02;
  const hasFoot = texts.some(isFoot);
  const items = [
    ...CUR.geo.filter(g => !g.deco && g.y + g.h > BODY_Y - 0.15 && g.y < FOOT_Y - 0.02).map(g => ({ top: g.y, bot: g.y + g.h })),
    ...texts.filter(r => !isFoot(r) && r.o.y + r.o.h > BODY_Y - 0.15 && !["title", "kicker"].includes(r.label)).map(textBottom),
  ];
  if (items.length) {
    const lim = hasFoot ? FOOT_Y - 0.1 : 6.9, bot = Math.max(...items.map(i => i.bot)), top = Math.max(BODY_Y - 0.1, Math.min(...items.map(i => i.top)));
    const free = (lim - bot) + Math.max(0, top - BODY_Y - 0.25);
    if (free > 1.15) warn.push({ kind: "space", msg: `${where}: phần thân chỉ dùng ${top.toFixed(1)}–${bot.toFixed(1)} in, trống ≈ ${free.toFixed(1)} in theo chiều dọc — gộp với slide kề bên hoặc đổi type hợp lượng nội dung` });
  }
  // thẻ rỗng: nhóm thẻ cùng hàng (cùng y, h) mà thẻ đầy nhất vẫn trống > 40% chiều cao
  const cards = CUR.geo.filter(g => g.kind === "shape" && g.filled && (g.tr || 0) < 60 && g.w >= 1.2 && g.h >= 1.1 && g.y >= BODY_Y - 0.2
    && !(CUR.spaceOk || []).some(q => Math.abs(q.x - g.x) < 0.01 && Math.abs(q.y - g.y) < 0.01 && Math.abs(q.h - g.h) < 0.01)); // dải nền mờ (đánh dấu giai đoạn) không phải thẻ
  const groups = {};
  for (const g of cards) (groups[`${g.y.toFixed(2)}|${g.h.toFixed(2)}`] = groups[`${g.y.toFixed(2)}|${g.h.toFixed(2)}`] || []).push(g);
  for (const gs of Object.values(groups)) {
    const fill = gs.map(g => { const ins = texts.filter(r => r.o.x >= g.x - 0.01 && r.o.x < g.x + g.w && r.o.y >= g.y - 0.6 && r.o.y < g.y + g.h).map(textBottom);
      return ins.length ? Math.max(...ins.map(i => i.bot)) : null; }).filter(v => v != null);
    if (!fill.length) continue;
    const g = gs[0], empty = g.y + g.h - Math.max(...fill);
    if (empty > 0.75 && empty / g.h > 0.28) warn.push({ kind: "space", msg: `${where}: thẻ cao ${g.h.toFixed(2)} in nhưng phần dưới trống ${empty.toFixed(2)} in — thẻ phải cao vừa chữ` });
  }
  return warn.concat(gapBlocks(texts, cards, where));
}
// chữ đè chữ chạy cho MỌI slide (kể cả section / cover / closing / nền tối) — trước đây nằm trong checkSpace nên bị SPACE_SKIP bỏ qua
// (lỗi "Trong chương này" đè dải tên chương ở section kiểu dark chỉ bị bắt ở bước soát sau render).
function checkTextOverlap() {
  const warn = [], where = `Slide ${CUR.n} (${CUR.type})`;
  const texts = CUR.recs.filter(r => r.body && r.o.w > 0 && (Array.isArray(r.text) ? r.text.some(x => String(x.text || "").trim()) : String(r.text).trim()));
  const ext = texts.map(r => { const tb = textBottom(r), o = r.o, m = measure(r.text, o, o.w); let x = o.x, w = o.w;
    const flat = Array.isArray(r.text) ? r.text.map(q => q.text || "").join("") : String(r.text);
    if (m.ok && m.lines === 1 && !o.fill) { const tw = textW(flat, o); if (tw) { w = Math.min(o.w, tw * 1.02); if (o.align === "right") x = o.x + o.w - w; else if (o.align === "center") x = o.x + (o.w - w) / 2; } }
    let top = tb.top, hh = tb.bot - tb.top;
    // số trình bày ≥ 100pt (hero, section, bignum): khung dòng gồm khoảng đệm rất lớn — đo theo chiều cao nét chữ (cap ≈ 0,72 em), nằm giữa khung dòng
    if ((o.fontSize || 0) >= 100 && m.ok && m.lines === 1) { const cap = o.fontSize / 72 * 0.72; top += (hh - cap) / 2; hh = cap; }
    return { x, y: top, w, h: hh, r, flat }; });
  for (let i = 0; i < ext.length; i++) for (let j = i + 1; j < ext.length; j++) { const a = ext[i], b = ext[j];
    const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    if (ox > 0.05 && oy > 0.05 && !(a.r.o.fill && b.r.o.fill)) warn.push({ kind: "gap", msg: `${where}: chữ "${a.flat.slice(0, 24)}" đè lên "${b.flat.slice(0, 24)}" — dời/ rút gọn một trong hai` }); }
  return warn;
}
function gapBlocks(texts, cards, where) {
  const warn = [];
  // khối sát nhau: hai mảng màu/ô có nền không lồng, không chạm mà cách nhau < GAP_MIN
  const blocks = [...cards.map(g => ({ x: g.x, y: g.y, w: g.w, h: g.h })),
    ...texts.filter(r => r.o.fill && r.o.fill.color && r.o.w >= 0.3 && r.o.h >= 0.3).map(r => ({ x: r.o.x, y: r.o.y, w: r.o.w, h: r.o.h }))];
  const inside = (a, b) => a.x >= b.x - 0.01 && a.y >= b.y - 0.01 && a.x + a.w <= b.x + b.w + 0.01 && a.y + a.h <= b.y + b.h + 0.01;
  const seen = new Set();
  for (let i = 0; i < blocks.length; i++) for (let j = i + 1; j < blocks.length; j++) {
    const a = blocks[i], b = blocks[j];
    if (inside(a, b) || inside(b, a)) continue;
    if (Math.abs(a.w - b.w) < 0.01 && Math.abs(a.h - b.h) < 0.01) continue; // chuỗi ô lặp lại (lịch ngày, lưới) — khoảng hẹp là chủ đích
    const dx = Math.max(b.x - (a.x + a.w), a.x - (b.x + b.w)), dy = Math.max(b.y - (a.y + a.h), a.y - (b.y + b.h));
    const d = dx > 0 && dy > 0 ? Math.hypot(dx, dy) : Math.max(dx, dy);
    if (d > 0.005 && d < GAP_MIN) { const k = `${Math.min(a.y, b.y).toFixed(1)}`; if (seen.has(k)) continue; seen.add(k);
      warn.push({ kind: "gap", msg: `${where}: hai khối chỉ cách nhau ${d.toFixed(2)} in (y≈${Math.max(a.y, b.y).toFixed(2)}) — cần ≥ ${GAP_MIN} in hoặc gộp vào một thẻ` }); }
  }
  return warn;
}
const lum = (h) => { const c = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const mix = (a, b, t) => [0, 2, 4].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, "0")).join("").toUpperCase();
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
function bgAt(px, py, seq) { // màu nền tại điểm (px, py) trước thời điểm seq
  let col = CUR.bg;
  for (const f of CUR.fills) if (f.seq < seq && px >= f.x && px <= f.x + f.w && py >= f.y && py <= f.y + f.h) col = mix(f.color, col, f.tr / 100);
  return col;
}
function contrast(r) {
  const o = r.o, cy = o.y + Math.min(o.h, 0.5) / 2; // điểm đầu dòng đầu — nơi chữ thật sự nằm (theo căn lề: trái / giữa / phải)
  const cx = o.align === "center" ? o.x + o.w / 2 : o.align === "right" ? o.x + o.w - Math.min(o.w, 1.2) / 2 : o.x + Math.min(o.w, 1.2) / 2;
  let bg = bgAt(cx, cy, r.seq);
  if (o.fill && o.fill.color && o.fill.type !== "none") bg = mix(o.fill.color, bg, (o.fill.transparency || 0) / 100);
  const runs = Array.isArray(r.text) ? r.text : [{ text: r.text, options: {} }];
  let worst = null;
  for (const run of runs) { if (!String(run.text || "").trim()) continue;
    const ro = run.options || {}, fg = ro.color || o.color; if (!fg) continue;
    const size = ro.fontSize || o.fontSize || 16, bold = ro.bold != null ? ro.bold : o.bold, big = size >= 18 || (bold && size >= 14);
    const need = big ? 3 : 4.5, cr = ratio(fg, bg);
    if (cr < need && (!worst || cr < worst.cr)) worst = { cr, need, fg, bg, size }; }
  return worst;
}
function checkSlide() {
  const warn = [];
  for (const r of CUR.recs) {
    const o = r.o, m = measure(r.text, o, o.w);
    if (!m.ok) { NOFONT.add(m.face); continue; }
    const where = `Slide ${CUR.n} (${CUR.type}) ${r.label || "ô chữ"}`;
    const flat = (Array.isArray(r.text) ? r.text.map(x => x.text).join(" ") : r.text).replace(/\s+/g, " ").trim();
    const shown = flat.length > 40 ? flat.slice(0, 38) + "…" : flat;
    // nhãn một dòng (khung thấp hơn 2 dòng): xuống dòng là lỗi dù tổng chiều cao còn lọt dung sai 0.03 in ("KHÔNG CÓ HẠN" 2 dòng trong pill 0.3 in)
    if ((o.shape || o.charSpacing) && m.lines > 1 && o.h < 2 * m.lineH + 0.05 && m.height <= o.h + 0.03) warn.push({ kind: "fit", msg: `${where}: nhãn "${shown}" phải nằm một dòng nhưng cần ${m.lines} dòng — rút gọn nhãn` });
    if (m.height > o.h + 0.03) {
      const cap = Math.max(1, Math.floor((o.h + 0.03) / m.lineH)), cut = Math.max(1, Math.ceil(flat.length * (m.lines - cap) / m.lines));
      warn.push({ kind: "fit", msg: `${where}: "${shown}" cần ${m.lines} dòng (cao ${m.height.toFixed(2)}in), khung chỉ cao ${o.h.toFixed(2)}in — rút bớt khoảng ${cut} ký tự` });
    }
    const cw = contrast(r);
    if (cw) warn.push({ kind: "contrast", msg: `${where}: "${shown}" tương phản ${cw.cr.toFixed(1)}:1 (chữ #${cw.fg} trên nền #${cw.bg}, ${cw.size}pt) — cần ≥ ${cw.need}:1 để nhìn rõ khi chiếu` });
    if (r.label === "title" && m.lines > (CUR.type === "photo" ? 4 : CUR.type === "hero" ? 3 : 2) && CUR.type !== "cover") /* photo: trích dẫn được dài tới 4 dòng */ warn.push({ kind: "title", msg: `${where}: tiêu đề xuống ${m.lines} dòng (nên ≤ 2) — rút gọn` });
  }
  return warn;
}
// chống dòng mồ côi: nối 2 chữ cuối bằng khoảng trắng không ngắt (NBSP) -> dòng cuối luôn có ≥ 2 chữ
function noOrphan(text) {
  if (Array.isArray(text)) {
    for (let i = text.length - 1; i >= 0; i--) { const t = text[i].text; if (t == null) continue; const k = String(t).lastIndexOf(" ");
      if (k > 0 && k < String(t).length - 1) { const nt = text.slice(); nt[i] = Object.assign({}, text[i], { text: t.slice(0, k) + "\u00A0" + t.slice(k + 1) }); return nt; }
      // chữ cuối đứng ngay sau đoạn [nhấn mạnh]: khoảng trắng nằm ĐẦU đoạn cuối ("… [thu hẹp] lúa") → nối với đoạn trước bằng NBSP
      if (k === 0 && String(t).trim().length && i > 0) { const nt = text.slice(); nt[i] = Object.assign({}, text[i], { text: "\u00A0" + String(t).slice(1) }); return nt; }
      if (String(t).trim().length) return text; }
    return text;
  }
  const t = String(text == null ? "" : text), k = t.lastIndexOf(" ");
  return t.length > 18 && k > 0 && k < t.length - 1 ? t.slice(0, k) + "\u00A0" + t.slice(k + 1) : t;
}
// chiều cao dùng để XẾP phần tử kế tiếp: đo sát thực tế (không chừa 3% như lớp kiểm tràn), để không hở khoảng trắng thừa
function realH(text, o, w, fallback) { const m = measure(noOrphan(text), o, w); /* cùng hệ số an toàn với bộ kiểm tràn */ return m.ok ? m.height : fallback; }
function T(s, text, o) { addT(s, noOrphan(text), Object.assign({ isTextBox: true, margin: 0, valign: "top", fontFace: TH.bodyFont, fontSize: 16 }, o)); }
// MỖI Ý MỘT Ô CHỮ (nhận xét giảng viên 11/2026: "mỗi ý một text box, căn đều"): danh sách không gộp thành một ô nhiều đoạn có gạch đầu dòng.
// Mỗi ý đo chiều cao bằng font thật rồi xếp từ trên xuống, khoảng cách giữa các ô BẰNG NHAU và cố định (o.gap).
// Dấu đầu ý là hình (chấm tròn màu nhấn), không phải ký tự — sửa / di chuyển từng ý trong PowerPoint không kéo theo ý khác.
// Ý không vừa vùng: ô cuối bị giới hạn chiều cao → bộ kiểm tràn báo "cần N dòng" (cắt chữ, không hạ cỡ chữ).
function itemBoxes(s, items, o) {
  const list = (items || []).filter(t => t != null && String(t).trim() !== ""), n = list.length; if (!n) return o.y;
  const fo = { fontFace: TH.bodyFont, fontSize: o.fontSize || 16 }, ix = o.mark === false ? 0 : 0.24, tw = o.w - ix;
  const runs = list.map(t => (o.prefix ? [{ text: o.prefix, options: { color: o.markColor || o.color } }] : []).concat(rich(String(t), o.color, o.acc || o.color)));
  const hs = runs.map(r => realH(r, fo, tw, 0.4) + 0.04), sum = hs.reduce((a, b) => a + b, 0);
  const g = n > 1 ? (o.gap == null ? 0.12 : o.gap) : 0; // khoảng cách CỐ ĐỊNH giữa mọi ý (không giãn cho lấp vùng — giãn làm khoảng cách tiêu đề → ý 1 khác ý 1 → ý 2)
  let yy = o.y; const end = o.y + o.h, line = (o.fontSize || 16) / 72 * 1.2;
  runs.forEach((r, i) => { const h = Math.max(0.2, Math.min(hs[i], end - yy));
    if (ix) s.addShape(pres.shapes.OVAL, { x: o.x + 0.02, y: yy + line / 2 - 0.045, w: 0.09, h: 0.09, fill: { color: o.markColor || o.color }, line: { type: "none" } });
    T(s, r, { _label: `${o.lab || "items"}[${i}]`, x: o.x + ix, y: yy, w: tw, h, fontSize: o.fontSize || 16, color: o.color });
    yy += hs[i] + g; });
  return yy - g;
}
const LIGHT_CARD = new Set(["FFFFFF", "FFFDF9", "F4F4F4"]);
function box(s, x, y, w, h, fill, line, name) {
  const kc = KIT && LIGHT_CARD.has(fill) ? KIT.card : null; // bộ chất liệu chỉ đổi THẺ SÁNG (thẻ tối / màu nhấn giữ nguyên để đủ tương phản)
  if (kc && kc.border && !line) line = kc.line === "acc" ? TH.l.acc : TH.l.line;
  const r = kc && kc.radius != null ? kc.radius : TH.radius, o = { x, y, w, h, fill: { color: fill }, line: line ? { color: line, width: 1 } : { type: "none" } };
  if (kc && CUR && CUR.inBody) (CUR.cards = CUR.cards || []).push({ x, y, w, h, idx: (s._slideObjects || []).length });
  if (name) o.objectName = name; // tên "!!…" = cặp Morph giữa hai slide liền nhau
  if (r) o.rectRadius = r;
  // thẻ trắng trên nền sáng: bóng đổ mềm tạo chiều sâu (object mới mỗi lần — pptxgenjs sửa option tại chỗ)
  if (LIGHT_CARD.has(fill) && !(kc && kc.shadow === 0)) o.shadow = { type: "outer", blur: kc ? 16 : 12, offset: kc ? 4 : 3, angle: 90, color: "000000", opacity: kc ? kc.shadow : 0.09 };
  // khối nền tối: gradient chéo GỐC của PowerPoint (sửa được ở Format Shape) từ nền tối sang màu thẻ tối — có chiều sâu mà vẫn đủ tương phản
  if (fill === TH.d.bg && TH.d.card !== TH.d.bg) o.objectName = `GRAD:${TH.d.bg}:${TH.d.card}`;
  s.addShape(r ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, o);
  // world: dải màu nhấn trên mép thẻ (bìa sổ / đầu cột bảng chấm công = mép trên; thẻ container = mép trái) — chỉ thẻ đủ lớn
  if (kc && CUR && CUR.inBody && KIT.fits && (kc.strip || kc.skin)) sig("meso", "thẻ " + (kc.skin || kc.strip));
  if (kc && kc.strip && w >= 1.2 && h >= 0.6) s.addShape(pres.shapes.RECTANGLE, kc.strip === "left" ? { x, y, w: kc.skin === "container" ? 0.16 : 0.09, h, fill: { color: TH.l.acc }, line: { type: "none" }, _deco: true } : { x, y, w, h: 0.07, fill: { color: TH.l.acc }, line: { type: "none" }, _deco: true });
  // VỎ THẺ theo vật chủ đạo của thế giới — thẻ "là" một vật (tờ sổ, thẻ chấm công, cửa container, tờ bản vẽ), không chỉ là hộp trắng
  if (kc && kc.skin && w >= 1.2 && h >= 0.6) { const A = TH.l.acc, D = { _deco: true };
    if (kc.skin === "ledger") s.addShape(pres.shapes.RECTANGLE, Object.assign({ x: x + 0.07, y: y + 0.14, w: w - 0.14, h: h - 0.21, fill: { type: "none" }, line: { color: A, width: 0.5, transparency: 55 } }, { _deco: true })); // viền trong mảnh như khung trang sổ
    else if (kc.skin === "timecard") s.addShape(pres.shapes.OVAL, Object.assign({ x: x + w / 2 - 0.07, y: y + 0.13, w: 0.14, h: 0.14, fill: { color: TH.l.bg }, line: { color: A, width: 0.75, transparency: 30 } }, { _deco: true })); // lỗ bấm thẻ chấm công
    else if (kc.skin === "container") for (let k = 1; k <= 2; k++) s.addShape(pres.shapes.LINE, Object.assign({ x: x + 0.05 * k, y: y + 0.08, w: 0, h: h - 0.16, line: { color: "FFFFFF", width: 0.75, transparency: 35 } }, { _deco: true })); // gờ tôn trên dải cửa
    else if (kc.skin === "receipt") s.addShape(pres.shapes.LINE, Object.assign({ x: x + 0.15, y: y + h - 0.16, w: w - 0.3, h: 0, line: { color: A, width: 0.75, dashType: "dash", transparency: 40 } }, D)); // vạch "cộng" cuối hoá đơn
    else if (kc.skin === "stub") s.addShape(pres.shapes.LINE, Object.assign({ x: x + 0.28, y: y + 0.1, w: 0, h: h - 0.2, line: { color: A, width: 0.75, dashType: "sysDot", transparency: 30 } }, D)); // đường xé cuống séc
    else if (kc.skin === "node" && y > 1.9) { s.addShape(pres.shapes.LINE, Object.assign({ x: x + w / 2, y: y - 0.16, w: 0, h: 0.16, line: { color: A, width: 1.25 } }, D)); s.addShape(pres.shapes.OVAL, Object.assign({ x: x + w / 2 - 0.05, y: y - 0.21, w: 0.1, h: 0.1, fill: { color: A }, line: { type: "none" } }, D)); } // đầu nối nút sơ đồ
    else if (kc.skin === "field") s.addShape(pres.shapes.LINE, Object.assign({ x: x + 0.15, y: y + h - 0.12, w: w - 0.3, h: 0, line: { color: TH.l.muted, width: 0.75, dashType: "sysDot", transparency: 30 } }, D)); // dòng kẻ chấm để ghi
    else if (kc.skin === "dimension" && y > 1.9) { const yy = y - 0.13; // đường kích thước phía trên thẻ (bản vẽ)
      s.addShape(pres.shapes.LINE, Object.assign({ x: x + 0.04, y: yy, w: w - 0.08, h: 0, line: { color: A, width: 0.75, beginArrowType: "triangle", endArrowType: "triangle" } }, D));
      for (const xx of [x, x + w]) s.addShape(pres.shapes.LINE, Object.assign({ x: xx, y: yy - 0.07, w: 0, h: 0.14, line: { color: A, width: 0.75 } }, D)); } }
  // ĐỢT B (11/2026): chi tiết "đọc được từ xa" — mỗi world thêm một nét lớn, nằm ở MÉP / NGOÀI thẻ (không chạm vùng chữ: chữ thẻ bắt đầu từ x + 0.3, y + 0.5)
  if (kc && kc.skin && KIT.fits && w >= 1.2 && h >= 0.9 && CUR && CUR.inBody) { const A = TH.l.acc, B = TH.l.bad, D = { _deco: true }, sh = (t, o) => s.addShape(pres.shapes[t], Object.assign(o, D));
    const alt = CUR.n % 2 === 1; // BIẾN THỂ xoay theo slide chẵn / lẻ — cùng một vật nhưng hai "mặt", deck dài không lặp một dáng thẻ
    const teethAt = (yy, up) => { const nT = Math.max(4, Math.round(w / 0.18)), tw = w / nT; for (let k = 0; k < nT; k++) sh("ISOSCELES_TRIANGLE", { x: x + k * tw, y: up ? yy - 0.09 : yy - 0.01, w: tw, h: 0.1, rotate: up ? 0 : 180, fill: { color: fill }, line: { type: "none" } }); };
    if (kc.skin === "ledger") { if (!alt) { sh("RECTANGLE", { x, y, w, h: 0.16, fill: { color: A }, line: { type: "none" } }); sh("RECTANGLE", { x: x + 0.07, y: y + h + 0.05, w: w - 0.14, h: 0.05, fill: { color: A, transparency: 45 }, line: { type: "none" } }); } // gáy trang sổ + tờ dưới
      else { sh("RECTANGLE", { x, y, w: 0.14, h, fill: { color: A }, line: { type: "none" } }); for (let yy = y + 0.2; yy < y + h - 0.1; yy += 0.28) sh("LINE", { x: x + 0.07, y: yy, w: 0, h: 0.12, line: { color: "FFFFFF", width: 1 } }); // gáy dọc có đường chỉ khâu
        sh("OVAL", { x: x + w - 0.5, y: y + h - 0.5, w: 0.62, h: 0.62, fill: { type: "none" }, line: { color: B, width: 1.25, transparency: 35 } }); } } // dấu tròn mờ góc dưới
    else if (kc.skin === "timecard") { const yy = alt ? y + h - 0.2 : y; sh("RECTANGLE", { x, y: yy, w, h: 0.2, fill: { color: A }, line: { type: "none" } }); for (let k = 1; k < 7; k++) sh("LINE", { x: x + w * k / 7, y: yy, w: 0, h: 0.2, line: { color: "FFFFFF", width: 1 } });
      sh("RECTANGLE", { x: x + w * 6 / 7, y: yy, w: w / 7, h: 0.2, fill: { color: B }, line: { type: "none" } }); } // dải 7 ô thứ (trên / dưới), ô CN đỏ
    else if (kc.skin === "container") { sh("RECTANGLE", { x, y: alt ? y + h - 0.14 : y, w, h: 0.14, fill: { color: TH.l.text }, line: { type: "none" } });
      for (const [cx, cy] of [[x, y], [x + w - 0.2, y], [x, y + h - 0.2], [x + w - 0.2, y + h - 0.2]]) sh("RECTANGLE", { x: cx, y: cy, w: 0.2, h: 0.2, fill: { color: TH.l.text }, line: { type: "none" } }); // góc đúc container
    }
    else if (kc.skin === "dimension") { for (const [cx, cy, sx, sy] of [[x, y, -1, -1], [x + w, y, 1, -1], [x, y + h, -1, 1], [x + w, y + h, 1, 1]]) { // dấu xén góc bản vẽ (ngoài thẻ)
        sh("LINE", { x: Math.min(cx, cx + sx * 0.22), y: cy, w: 0.22, h: 0, line: { color: A, width: 1.25 } }); sh("LINE", { x: cx, y: Math.min(cy, cy + sy * 0.22), w: 0, h: 0.22, line: { color: A, width: 1.25 } }); }
      if (alt) sh("LINE", { x: x - 0.16, y: y + 0.04, w: 0, h: h - 0.08, line: { color: A, width: 0.75, beginArrowType: "triangle", endArrowType: "triangle" } }); } // đường kích thước cạnh đứng
    else if (kc.skin === "receipt") { if (alt) { teethAt(y, true); sh("LINE", { x: x + 0.15, y: y + h - 0.12, w: w - 0.3, h: 0, line: { color: A, width: 1.5 } }); sh("LINE", { x: x + 0.15, y: y + h - 0.07, w: w - 0.3, h: 0, line: { color: A, width: 1.5 } }); } // mép xé trên + gạch đôi "tổng"
      else { teethAt(y + h, false); sh("RECTANGLE", { x, y, w, h: 0.06, fill: { color: A }, line: { type: "none" } }); } }
    else if (kc.skin === "stub") { if (!alt) { sh("RECTANGLE", { x, y: y + h - 0.16, w, h: 0.16, fill: { color: A }, line: { type: "none" } }); for (let k = 0; k < 3; k++) sh("LINE", { x: x + 0.1, y: y + h - 0.12 + k * 0.04, w: w - 0.2, h: 0, line: { color: "FFFFFF", width: 0.5, transparency: 40 } }); } // dải bảo an chân thẻ
      else sh("ROUNDED_RECTANGLE", { x: x + w - 0.62, y: y + 0.16, w: 0.42, h: 0.32, rectRadius: 0.05, fill: { color: TH.gold }, line: { color: mix(TH.gold, "000000", 0.3), width: 0.5 } }); } // chip thẻ góc trên phải
    else if (kc.skin === "node") { if (!alt) sh("RECTANGLE", { x, y: y + h - 0.1, w, h: 0.1, fill: { color: A }, line: { type: "none" } });
      else { sh("LINE", { x: x - 0.3, y: y + h / 2, w: 0.3, h: 0, line: { color: A, width: 1.5 } }); sh("OVAL", { x: x - 0.38, y: y + h / 2 - 0.08, w: 0.16, h: 0.16, fill: { color: A }, line: { type: "none" } }); } } // nhánh nối từ trái
    else if (kc.skin === "field") { if (!alt) sh("RECTANGLE", { x: x + w - 0.75, y: y - 0.06, w: 0.95, h: 0.22, rotate: 40, fill: { color: B, transparency: 10 }, line: { color: "FFFFFF", width: 0.75, dashType: "dash" } }); // băng niêm phong góc
      else sh("OVAL", { x: x + w - 0.4, y: y - 0.16, w: 0.36, h: 0.36, fill: { color: B }, line: { color: mix(B, "000000", 0.3), width: 1 } }); // dấu xi
      sh("LINE", { x: x + 0.16, y: y + 0.08, w: 0, h: h - 0.16, line: { color: B, width: 1, transparency: 40 } }); } // lề đỏ
  }
}

// ---------- WORLD: nền + khung toàn slide (11/2026). Vẽ ở lớp DƯỚI CÙNG, khung chỉ nằm trong dải ≤ 0.2 in sát mép slide (ngoài lề nội dung 0.6 in) ----------
async function worldBg(s, c, kind) { const k = `wbg:${kind}:${c.acc}:${c.bg}`;
  if (!ASSETS[k]) { let b = "";
    if (kind === "corrugated") for (let x = 0; x < 1600; x += 22) b += `<rect x="${x}" y="0" width="11" height="900" fill="#${c.text}" fill-opacity=".045"/>`; // tôn gợn container
    else if (kind === "blueprint") { for (let x = 0; x <= 1600; x += 20) b += `<line x1="${x}" y1="0" x2="${x}" y2="900" stroke="#${c.acc}" stroke-opacity="${x % 100 ? ".07" : ".15"}" stroke-width="1"/>`;
      for (let y = 0; y <= 900; y += 20) b += `<line x1="0" y1="${y}" x2="1600" y2="${y}" stroke="#${c.acc}" stroke-opacity="${y % 100 ? ".07" : ".15"}" stroke-width="1"/>`; } // lưới bản vẽ: ô nhỏ + ô lớn
    else if (kind === "cells") { for (let x = 0; x <= 1600; x += 40) b += `<line x1="${x}" y1="0" x2="${x}" y2="900" stroke="#${c.acc}" stroke-opacity=".08"/>`; for (let y = 0; y <= 900; y += 28) b += `<line x1="0" y1="${y}" x2="1600" y2="${y}" stroke="#${c.acc}" stroke-opacity=".08"/>`; } // lưới ô bảng chấm công
    else if (kind === "dotrows") for (let y = 30; y < 900; y += 30) b += `<line x1="0" y1="${y}" x2="1600" y2="${y}" stroke="#${c.text}" stroke-opacity=".12" stroke-dasharray="2 7"/>`; // dòng chấm dẫn của hoá đơn
    else if (kind === "guilloche") for (let k = 0; k < 7; k++) { let d0 = `M0 ${120 + k * 110}`; for (let x = 0; x <= 1600; x += 20) d0 += ` L${x} ${(120 + k * 110 + 26 * Math.sin(x / 70 + k) * Math.cos(x / 230)).toFixed(1)}`; b += `<path d="${d0}" fill="none" stroke="#${c.acc}" stroke-opacity=".12" stroke-width="1.4"/>`; } // hoa văn bảo an kiểu séc
    else if (kind === "dots") { for (let x = 20; x < 1600; x += 40) for (let y = 20; y < 900; y += 40) b += `<circle cx="${x}" cy="${y}" r="1.8" fill="#${c.acc}" fill-opacity=".24"/>`; } // lưới chấm của bảng vẽ sơ đồ
    else if (kind === "lined") for (let y = 36; y < 900; y += 36) b += `<line x1="0" y1="${y}" x2="1600" y2="${y}" stroke="#${c.muted}" stroke-opacity=".14" stroke-dasharray="1 5"/>`; // dòng kẻ chấm của biên bản viết tay
    else if (kind === "sage") b = `<rect x="0" y="0" width="1600" height="900" fill="url(#g)"/>`; // bìa sổ: sắc xanh rất nhạt đậm dần về góc
    ASSETS[k] = await png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs><radialGradient id="g" cx=".2" cy=".1" r="1.1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".55"/><stop offset="1" stop-color="#${c.acc}" stop-opacity=".12"/></radialGradient></defs>${b}</svg>`, 1600); }
  s.addImage({ data: ASSETS[k], x: 0, y: 0, w: W, h: H, altText: "Nền", _deco: true }); sig("macro", "nền " + kind); }
async function worldFrame(s, c, kind, type) {
  const k = `wfr:${kind}:${c.acc}:${c.bad}`, P = 1600 / W; // px mỗi inch
  if (!ASSETS[k]) { let b = "";
    if (kind === "double") { // khung viền đôi như bìa sổ + hoa văn nhỏ giữa chân trang
      b = `<rect x="${0.16 * P}" y="${0.16 * P}" width="${1600 - 0.32 * P}" height="${900 - 0.32 * P}" fill="none" stroke="#${c.acc}" stroke-width="3"/><rect x="${0.22 * P}" y="${0.22 * P}" width="${1600 - 0.44 * P}" height="${900 - 0.44 * P}" fill="none" stroke="#${c.acc}" stroke-width="1.2"/>`
        + `<g transform="translate(800 ${900 - 0.19 * P})"><line x1="-60" y1="0" x2="-12" y2="0" stroke="#${c.acc}" stroke-width="2"/><line x1="12" y1="0" x2="60" y2="0" stroke="#${c.acc}" stroke-width="2"/><rect x="-6" y="-6" width="12" height="12" transform="rotate(45)" fill="#${c.acc}"/></g>`; }
    else if (kind === "hazard") { // băng cảnh báo vàng – đen ở đáy (container, cảng)
      let st = ""; for (let x = -40; x < 1640; x += 36) st += `<polygon points="${x},900 ${x + 18},900 ${x + 38},${900 - 0.15 * P} ${x + 20},${900 - 0.15 * P}" fill="#1B2433"/>`;
      b = `<rect x="0" y="${900 - 0.15 * P}" width="1600" height="${0.15 * P}" fill="#F2B705"/>${st}`; }
    else if (kind === "dimension") { // đường kích thước ngang mép trên (bản vẽ) + khung viền đôi mảnh
      const y = 0.12 * P; let t = ""; for (let x = 0.4 * P; x <= 1600 - 0.4 * P; x += 0.5 * P) t += `<line x1="${x}" y1="${y - 6}" x2="${x}" y2="${y + 6}" stroke="#${c.acc}" stroke-width="1.5"/>`;
      b = `<line x1="${0.4 * P}" y1="${y}" x2="${1600 - 0.4 * P}" y2="${y}" stroke="#${c.acc}" stroke-width="1.5"/>${t}<polygon points="${0.4 * P},${y} ${0.4 * P + 14},${y - 6} ${0.4 * P + 14},${y + 6}" fill="#${c.acc}"/><polygon points="${1600 - 0.4 * P},${y} ${1600 - 0.4 * P - 14},${y - 6} ${1600 - 0.4 * P - 14},${y + 6}" fill="#${c.acc}"/>`
        + `<rect x="${0.08 * P}" y="${0.22 * P}" width="${1600 - 0.16 * P}" height="${900 - 0.3 * P}" fill="none" stroke="#${c.acc}" stroke-opacity=".5" stroke-width="1.2"/>`; }
    else if (kind === "perforated") { // mép răng cưa trên + dưới (giấy cuộn hoá đơn xé ra)
      const t = 0.09 * P; for (let x = 0; x < 1600; x += 24) b += `<polygon points="${x},0 ${x + 12},${t} ${x + 24},0" fill="#${c.acc}" fill-opacity=".22"/><polygon points="${x},900 ${x + 12},${900 - t} ${x + 24},900" fill="#${c.acc}" fill-opacity=".22"/>`; }
    else if (kind === "secure") { // dải hoa văn bảo an ở đáy + đường mảnh trên đỉnh
      const y = 900 - 0.17 * P; b = `<rect x="0" y="${y}" width="1600" height="${0.17 * P}" fill="#${c.acc}" fill-opacity=".1"/><line x1="0" y1="${0.06 * P}" x2="1600" y2="${0.06 * P}" stroke="#${c.acc}" stroke-width="2"/>`;
      for (let k = 0; k < 3; k++) { let d0 = `M0 ${y + 8 + k * 8}`; for (let x = 0; x <= 1600; x += 8) d0 += ` L${x} ${(y + 8 + k * 8 + 4 * Math.sin(x / 9 + k * 2)).toFixed(1)}`; b += `<path d="${d0}" fill="none" stroke="#${c.acc}" stroke-opacity=".45" stroke-width="1"/>`; } }
    else if (kind === "corners") { const a = 0.32 * P, m = 0.1 * P; // dấu góc của khung sơ đồ
      for (const [x, y, sx, sy] of [[m, m, 1, 1], [1600 - m, m, -1, 1], [m, 900 - m, 1, -1], [1600 - m, 900 - m, -1, -1]]) b += `<path d="M${x} ${y + sy * a} L${x} ${y} L${x + sx * a} ${y}" fill="none" stroke="#${c.acc}" stroke-width="3"/><circle cx="${x + sx * 14}" cy="${y + sy * 14}" r="4" fill="#${c.acc}"/>`; }
    else if (kind === "seal") { // băng niêm phong vắt góc phải dưới + đường lề đỏ mảnh bên trái
      b = `<g transform="translate(${1600 - 0.55 * P} ${900 - 0.2 * P}) rotate(-35)"><rect x="-150" y="-13" width="300" height="26" fill="#${c.bad}" fill-opacity=".8"/><line x1="-150" y1="-9" x2="150" y2="-9" stroke="#fff" stroke-dasharray="6 5" stroke-opacity=".8"/><line x1="-150" y1="9" x2="150" y2="9" stroke="#fff" stroke-dasharray="6 5" stroke-opacity=".8"/></g>`
        + `<line x1="${0.14 * P}" y1="0" x2="${0.14 * P}" y2="900" stroke="#${c.bad}" stroke-opacity=".35" stroke-width="2"/>`; }
    else if (kind === "daystrip") { // dải 31 ô ngày ở mép trên (bảng chấm công); ô "Chủ nhật" tô đỏ nhạt
      const x0 = 0.6 * P, cw = (1600 - 1.2 * P) / 31, y = 0.04 * P, h = 0.11 * P;
      for (let i = 0; i < 31; i++) b += `<rect x="${x0 + i * cw + 1}" y="${y}" width="${cw - 2}" height="${h}" fill="#${i % 7 === 6 ? c.bad : c.acc}" fill-opacity="${i % 7 === 6 ? ".55" : ".16"}"/>`; }
    ASSETS[k] = await png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">${b}</svg>`, 1600); }
  s.addImage({ data: ASSETS[k], x: 0, y: 0, w: W, h: H, altText: "Khung trang", _deco: true }); sig("macro", "khung " + kind); }
// lớp nền trang trí (đặt trước mọi thứ khác): quầng sáng cho nền tối
// motif = hoạ tiết nền theo CHỦ ĐỀ (meta.motif). Không có motif hợp chủ đề thì để "none" — không trang trí cho có.
let MOTIF = "none", MOTIF_LIST = ["none"];
async function decor(s, c, mode, type) {
  if (KIT && KIT.page && mode === "l") s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: H, fill: { color: /^[0-9A-F]{6}$/i.test(KIT.page) ? KIT.page : KIT.page === "manila" ? mix(TH.gold, "FFFFFF", 0.9) : mix(c.acc, "FFFFFF", 0.92) }, line: { type: "none" } }); // màu trang của thế giới
  if (KIT && mode === "l" && ["sage", "corrugated", "blueprint", "cells", "dotrows", "guilloche", "dots", "lined"].includes(KIT.bg)) await worldBg(s, c, KIT.bg);
  if (KIT && KIT.frame && mode === "l") await worldFrame(s, c, KIT.frame, type);
  if (KIT && KIT.bg === "ruled" && mode === "l") await kitRuled(s, c);
  if ((PAPER || (KIT && (KIT.bg === "grain" || KIT.bg === "ruled"))) && mode === "l") await paperGrain(s);
  if (KIT && KIT.bg === "glow" && mode === "l") await kitGlow(s, c);
  if (mode === "d") s.addImage({ altText: "Nền", data: await art("glow", c.acc, null, null, 1600), x: 0, y: 0, w: W, h: H });
  if (mode !== "l" || ["cover", "section", "closing"].includes(type)) return;
  // trang nội dung: hoạ tiết KHÔNG vẽ ở đây nữa — bgMotif() đặt sau khi xếp nội dung, vào đúng vùng trống (xem dưới).
  // Lỗi cũ: ảnh cỡ cả slide đặt lệch ra ngoài mép (x 4.2, y 4.1) → chỉ còn một mảnh nét bị cắt, bị thẻ che dở dang, trông như vết bẩn.
}
// Hoạ tiết theo chủ đề, đặt vào hình chữ nhật trống lớn nhất (cách nội dung ≥ 0.25 in), mép tan vào nền; không đủ chỗ → không vẽ.
const MOTIF_ALT = { cadastral: "Hoạ tiết bản đồ địa chính", contour: "Hoạ tiết đường đồng mức", dots: "Hoạ tiết lưới chấm", landscape: "Hoạ tiết núi", certificate: "Hoa văn giấy chứng nhận",
  lines: "Hoạ tiết giấy kẻ dòng", waves: "Hoạ tiết sóng mảnh", blobs: "Hoạ tiết mảng màu", grid: "Hoạ tiết giấy kẻ ô" };
async function bgMotif(s, c, where) {
  const name = where === "content" ? MOTIF_LIST[CUR.n % MOTIF_LIST.length] : MOTIF, fn = MOTIFS[name]; if (!fn) return;
  const hero = where !== "content", occ = [];
  for (const g of CUR.geo) if (!g.deco) occ.push({ x: g.x, y: g.y, w: Math.max(g.w, 0.02), h: Math.max(g.h, 0.02) });
  for (const r of CUR.recs) { const o = r.o; if (!o.w) continue;
    const flat = Array.isArray(r.text) ? r.text.map(x => x.text || "").join("") : String(r.text); if (!flat.trim()) continue;
    const tb = textBottom(r), m = measure(r.text, o, o.w);
    let x = o.x, w = o.w; // dòng đơn căn trái: chỉ chiếm đúng bề rộng chữ (hàng chú thích dài cả slide nhưng chữ ngắn)
    if (m.ok && m.lines === 1 && !o.fill && (!o.align || o.align === "left")) { const tw = textW(flat, o); if (tw) w = Math.min(o.w, tw * 1.05); }
    occ.push({ x, y: tb.top, w, h: tb.bot - tb.top }); }
  const area = { x0: 0, y0: hero ? 0.75 : BODY_Y - 0.35, x1: W, y1: H };
  // trang nội dung: chỉ nhận vùng trống CHẠM MÉP PHẢI slide (hình "đi ra ngoài khung" ở góc phải — có chủ đích);
  // vùng trống lọt thỏm giữa slide (dưới trục biểu đồ, giữa hai thẻ) → không vẽ, tránh mảnh hình lơ lửng
  const fr = largestFree(occ, area, 0.25, 0.1, !hero); if (!fr) return;
  const [mw, mh] = MOTIF_MIN[name], [Mw, Mh] = MOTIF_MAX[name];
  if (fr.w < mw || fr.h < mh) return;
  let w = Math.min(fr.w, Mw * (hero ? 1.3 : 1)), h = Math.min(fr.h, Mh * (hero ? 1.3 : 1));
  if (name === "certificate") w = h = Math.min(w, h);
  // neo vào góc của ô trống gần góc dưới-phải slide nhất (hướng đọc chữ Z kết thúc ở đó) — hình "đứng" chứ không trôi giữa chừng
  // trang nội dung: LUÔN neo mép phải (vùng đã chạm mép phải) — dải trống chạy suốt đáy slide không kéo hình sang trái
  const x = !hero || fr.x + fr.w / 2 > W / 2 ? fr.x + fr.w - w : fr.x, y = fr.y + fr.h / 2 > H / 2 || name === "landscape" ? fr.y + fr.h - h : fr.y;
  // cạnh chạm mép slide thì tràn ra mép (không làm mờ phía đó) — hình "đi ra ngoài khung" có chủ đích, không lơ lửng
  // mỗi slide một biến thể (hạt giống theo số slide, lật ngang slide chẵn) — cùng "họ" hình nhưng không lặp y hệt
  const seed = CUR.n * 7 + 3, open = { l: x < 0.05, r: x + w > W - 0.05, t: false, b: y + h > H - 0.05, flip: CUR.n % 2 === 0 };
  const k = `motif:${name}:${w.toFixed(1)}:${h.toFixed(1)}:${c.acc}:${c.bg}:${hero}:${JSON.stringify(open)}:${seed}`;
  if (!ASSETS[k]) { const svg = fn(c.acc, TH.gold, c.bg, Math.round(w * 120), Math.round(h * 120), open, seed);
    // độ đậm: trang nội dung rất nhạt (không tranh với chữ), bìa/chuyển phần/kết rõ hơn
    ASSETS[k] = await png(svg.replace("<svg ", `<svg opacity="${hero ? 0.75 : 0.42}" `), Math.round(w * 160)); }
  s.addImage({ altText: MOTIF_ALT[name], data: ASSETS[k], x, y, w, h, _deco: true });
  // đưa xuống lớp dưới cùng (sau nền): không bao giờ đè lên nội dung kể cả khi PowerPoint đo chữ khác LibreOffice
  const so = s._slideObjects; if (Array.isArray(so) && so.length > 1) so.unshift(so.pop());
}
// dấu góc chữ L (dấu xén bản in) — đóng khung trang như một văn bản; chỉ dùng cho motif giấy tờ (cadastral, certificate)
function cropMarks(s, color) {
  const L = 0.42, m = 0.32, ln = { color, width: 1.5 };
  for (const [x, y, dx, dy] of [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]) {
    s.addShape(pres.shapes.LINE, { x: dx > 0 ? x : x - L, y, w: L, h: 0, line: ln });
    s.addShape(pres.shapes.LINE, { x, y: dy > 0 ? y : y - L, w: 0, h: L, line: ln });
  }
}
// hoạ tiết lớn cho bìa / chuyển phần / kết luận theo motif
async function heroArt(s, c, where) {
  if ((MOTIF === "cadastral" || MOTIF === "certificate") && where !== "closing") cropMarks(s, c.acc); // không đè thanh trên cùng
  if (MOTIF === "landscape") {
    if (where === "cover") s.addImage({ altText: "Minh hoạ phong cảnh", data: await art("landscape", c.acc, TH.gold, c.bg, 2000, "hero"), x: 0, y: 0, w: W, h: H });
    else if (where === "section") s.addImage({ altText: "Minh hoạ phong cảnh", data: await art("landscape", c.acc, TH.gold, c.bg, 1600, "low"), x: 0, y: 0, w: W, h: H });
    // closing: bgMotif() đặt dải núi vào vùng trống sau khi xếp nội dung
  } else if (MOTIF === "cadastral") {
    if (where === "cover") s.addImage({ altText: "Minh hoạ bản đồ địa chính, thửa đất tranh chấp được tô nổi", data: await art("cadastral", c.acc, TH.gold, c.bg, 2000, "hero"), x: 0, y: 0, w: W, h: H });
    // section / closing: bgMotif() đặt bản đồ vào vùng trống thật (không đặt ảnh cỡ cả slide lệch ra ngoài mép như trước)
  } else if (MOTIF === "certificate" && where === "cover") s.addImage({ altText: "Hoa văn giấy chứng nhận", data: await art("guilloche", c.acc, null, null, 1400), x: 7.6, y: 0.9, w: 5.9, h: 5.9, transparency: 35 });
}
function pill(s, text, x, y, w, color) {
  // nhãn nền nhạt, không viền: nhóm thông tin mà không tranh chỗ với tiêu đề
  // bề rộng đo bằng font thật: chữ hoa + giãn chữ rộng hơn ước lượng → nhãn dài thì GIÃN sang trái (giữ mép phải), không xuống dòng
  const need = pillW(text); if (need > w) { x -= need - w; w = need; }
  addT(s, String(text).toUpperCase(), { shape: TH.radius ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, rectRadius: 0.15, x, y, w, h: 0.3,
    fill: { color, transparency: 90 }, line: { type: "none" }, color, fontFace: TH.bodyFont, fontSize: 10, bold: true, align: "center", valign: "middle", margin: 0, charSpacing: 1 });
}
// kicker: gạch ngắn + chữ hoa màu nhấn (thay pill viền cho nhãn đầu slide)
function kicker(s, text, x, y, color) {
  if (KIT) { if (KIT.fits) sig("micro", "nhãn"); // nhãn đầu slide = nhãn siêu dữ liệu của thế giới (tab hồ sơ / ruy băng / viên thuốc) — xuất hiện ở MỌI slide nên là dấu hiệu nhận ra bộ chất liệu
    const kt = KIT.tag, t = String(text).toUpperCase(), ex = kt.shape === "PENTAGON" ? 0.25 : 0, w = fitW(t, { fontFace: TH.bodyFont, fontSize: 12, bold: true, charSpacing: 1.2 }, 0.4, 0.1, 6.2) + ex;
    if (kt.style === "outline") { // ô chữ nhật viền (ô trống trên bìa sổ / khung tên bản vẽ): nền trang, chữ + viền màu nhấn
      const under0 = CUR ? bgAt(x + 0.1, y + 0.15, CUR.seq) : TH.l.bg; // nền ô = nền thật bên dưới (trên khối tối: ô tối, chữ sáng)
      addT(s, t, { _label: "kicker", shape: pres.shapes.RECTANGLE, x, y: y - 0.03, w, h: 0.36, fill: { color: under0 }, line: { color, width: 1.25 }, color, fontFace: TH.bodyFont, fontSize: 12, bold: true, charSpacing: 1.2, align: "center", valign: "middle", margin: 0 });
      return; }
    const solid = kt.style === "solid", under = CUR ? bgAt(x + 0.1, y + 0.15, CUR.seq) : "FFFFFF", fill = solid ? color : mix(color, under, 0.85), fg = solid ? (ratio(color, "FFFFFF") >= 4.5 ? "FFFFFF" : TH.l.text) : (lum(under) > 0.4 ? darkOn(color, fill) : lightOn(color, fill));
    addT(s, t, { _label: "kicker", shape: pres.shapes[kt.shape], rectRadius: 0.17, x, y: y - 0.03, w, h: 0.36, fill: { color: fill }, line: { type: "none" }, color: fg, fontFace: TH.bodyFont, fontSize: 12, bold: true, charSpacing: 1.2, align: "center", valign: "middle", margin: 0 });
    return; }
  s.addShape(pres.shapes.LINE, { x, y: y + 0.15, w: 0.32, h: 0, line: { color, width: 2 } });
  T(s, String(text).toUpperCase(), { x: x + 0.44, y, w: 6, h: 0.3, fontSize: 12.5, bold: true, color, charSpacing: 1.5, valign: "middle" });
}
const pillW = (t) => fitW(String(t).toUpperCase(), { fontFace: TH.bodyFont, fontSize: 10, bold: true, charSpacing: 1 }, 0.4, 0.085, 4.6);
function num(s, n, x, y, d, bg, fg, size = 14) { if (KIT && KIT.fits) sig("meso", "ô số " + KIT.num);
  addT(s, String(n), { _label: "số thứ tự", shape: KIT ? (KIT.num === "square" || KIT.num === "cell" ? pres.shapes.RECTANGLE : pres.shapes.OVAL) : TH.radius ? pres.shapes.OVAL : pres.shapes.RECTANGLE, x, y, w: d, h: d, fill: { color: bg }, line: KIT && KIT.num === "cell" ? { color: fg, width: 1, transparency: 40 } /* ô bảng: viền mảnh như ô trong sổ / bảng chấm công */ : { type: "none" }, color: fg, fontFace: TH.numFont, italic: TH.numItalic, bold: true, fontSize: size, align: "center", valign: "middle", margin: 0 });
}
// icon trong vòng tròn: icon Duotone -> nền tròn nhạt cùng màu + icon màu đậm (kiểu hiện đại); icon thường -> nền đặc + icon trắng
async function circIcon(s, n, x, y, d, bg, fg) {
  // MỘT kiểu cho mọi icon trong vòng tròn: nền tròn nhạt + icon cùng màu (kể cả icon fa6 không có bản Duotone) — không còn khối đặc lẫn nét nhạt
  // màu chủ = màu (bg hoặc fg) tương phản mạnh hơn với nền slide — vd. dấu ✓/✗ gọi với bg nhạt + fg đỏ/xanh thì lấy fg
  const k = CUR && CUR.bg ? (ratio(bg, CUR.bg) >= ratio(fg, CUR.bg) ? bg : fg) : bg;
  s.addShape(TH.radius ? pres.shapes.OVAL : pres.shapes.RECTANGLE, { x, y, w: d, h: d, fill: { color: k, transparency: 80 }, line: { color: k, width: 1.25 } });
  const p = d * 0.2; s.addImage({ data: await icon(n, k), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p, altText: n });
}
async function chrome(s, c, meta, i, n) {
  // trái: tên PHẦN đang trình bày (đổi theo phần → có ích); chưa vào phần nào thì hiện tên đề tài ngắn
  const pn = CUR.part && PARTS[+CUR.part.num];
  // slide ảnh tràn viền: góc trên có thể là vùng ảnh sáng → nền tối mờ sau nhãn trái và cụm số trang bên phải
  // phía nào nằm trên ảnh → nền tối mờ + chữ sáng ở phía đó (photo: cả hai phía; photostats: chỉ phía có ảnh)
  const onL = CUR.type === "photo" || CUR.type === "headline" || (CUR.type === "hero" && CUR.heroPhoto) || (CUR.type === "photostats" && CUR.photoSide === "left"), onR = CUR.type === "photo" || CUR.type === "headline" || CUR.closingPhoto || (CUR.type === "hero" && CUR.heroPhoto) || (CUR.type === "photostats" && CUR.photoSide === "right");
  const dk = TH.d, cl = onL && c !== dk ? dk : c, cr = onR && c !== dk ? dk : c;
  if (onL || onR) { const lt = CUR.part ? (CUR.part.label + (pn ? " · " + pn : "")).toUpperCase() : meta.short || "";
    const lw = fitW(lt, { fontFace: TH.bodyFont, fontSize: 11, bold: true, charSpacing: CUR.part ? 1 : 0 }, 0.75, 0.09, 6.6);
    for (const [x, w, on] of [[M - 0.14, lw, onL], [W - M - 2.75, 2.89, onR]]) if (on) s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 0.23, w, h: 0.42, rectRadius: 0.1, fill: { color: dk.deep, transparency: 25 }, line: { type: "none" } }); }
  s.addImage({ data: await icon(meta.chromeIcon || (KIT && KIT.icons ? KIT.icons[0] : null) || (meta.kind === "lecture" ? "PiBookOpenTextDuotone" : meta.kind === "report" ? "PiChartBarDuotone" : "FaScaleBalanced"), cl.acc), x: M, y: 0.32, w: 0.24, h: 0.24 });
  T(s, CUR.part ? (CUR.part.label + (pn ? " · " + pn : "")).toUpperCase() : meta.short || "", { _label: CUR.part ? "phần đang trình bày" : "meta.short", x: M + 0.33, y: 0.31, w: 6.5, h: 0.26, fontSize: 11, bold: true, color: cl.acc, valign: "middle", charSpacing: CUR.part ? 1 : 0 });
  // thanh tiến độ: người nghe biết đã đi được bao xa
  const bw = 1.5, bx = W - M - bw;
  const pg = KIT && KIT.progress, folio = pg === "folio";
  T(s, (folio ? "TỜ " : "") + String(i).padStart(2, "0") + (folio ? "/" : " / ") + String(n).padStart(2, "0"), { x: bx - (folio ? 1.4 : 1.1), y: 0.31, w: folio ? 1.3 : 1.0, bold: folio, h: 0.26, fontSize: 11, color: onR && c !== TH.d ? TH.d.text /* trên ảnh: chữ sáng, màu mờ không đủ tương phản */ : cr.muted, align: "right", valign: "middle" });
  // meta.thread: thanh tiến độ mang tên Morph cố định → qua các slide trong cùng chương, thanh DÀI DẦN mượt thay vì nhảy (sợi chỉ nối mạch)
  if (pg) { worldProgress(s, pg, bx, 0.3, bw, i / n, cr); return; } // meta.thread: các mảnh mang tên "!!prog…" → Morph cho thanh "chạy tiếp" (thêm ô dấu / container) giữa hai slide
  s.addShape(pres.shapes.RECTANGLE, Object.assign({ x: bx, y: 0.42, w: bw, h: 0.05, fill: { color: cr.line }, line: { type: "none" } }, THREAD ? { objectName: "!!thread-track" } : {}));
  s.addShape(pres.shapes.RECTANGLE, Object.assign({ x: bx, y: 0.42, w: Math.max(0.05, bw * i / n), h: 0.05, fill: { color: cr.acc }, line: { type: "none" } }, THREAD ? { objectName: "!!thread-fill" } : {}));
}

// ---------- DẤU HIỆU WORLD (11/2026 — "che chữ vẫn đoán được chủ đề") ----------
// Mỗi slide nội dung phải có dấu hiệu của world ở CẢ BA cỡ: macro (nền, khung toàn slide) · meso (dáng thẻ, ô số, khối hình chính, đồ vật, hình vẽ)
// · micro (icon riêng, nhãn, thanh tiến độ hình vật thật). Ghi lại khi vẽ; build báo slide thiếu cỡ nào (lintSig). In bảng: --sig
function sig(level, what) { if (CUR && CUR.sig) CUR.sig[level].add(what); }
function worldIcon(i) { if (!KIT || !KIT.icons) return null; sig("micro", "icon"); return KIT.icons[i % KIT.icons.length]; }
// thanh tiến độ = VẬT của world (ô dấu sổ, ô ngày, đoàn container, thước, giấy hoá đơn, cột số dư, nút sơ đồ, số tờ) — có ở mọi slide nội dung
function worldProgress(s, kind, x, y, w, P, c) { sig("micro", "tiến độ " + kind);
  let pi = 0; const A = c.acc, D = { _deco: true }, sh = (t, o) => s.addShape(pres.shapes[t], Object.assign(o, D, THREAD ? { objectName: `!!prog${pi++}` } : {})), n = 10, k = Math.max(1, Math.round(P * n));
  if (kind === "stamps" || kind === "days") { const cw = w / n;
    for (let i = 0; i < n; i++) { const on = i < k, sun = kind === "days" && i % 7 === 6, col = sun ? c.bad : A;
      sh("RECTANGLE", { x: x + i * cw + 0.01, y, w: cw - 0.03, h: 0.2, fill: { color: on ? col : c.bg }, line: { color: col, width: 0.75 } }); }
    if (kind === "stamps") sh("OVAL", { x: x + (k - 0.5) * cw - 0.11, y: y - 0.01, w: 0.22, h: 0.22, fill: { type: "none" }, line: { color: c.bad, width: 1.25 } }); } // dấu tròn ở ô mới nhất
  else if (kind === "train") { const m = 6, cw = w / m, kk = Math.max(1, Math.round(P * m));
    sh("LINE", { x, y: y + 0.23, w, h: 0, line: { color: c.muted, width: 1 } });
    for (let i = 0; i < m; i++) { sh("RECTANGLE", { x: x + i * cw + 0.02, y: y + 0.02, w: cw - 0.05, h: 0.18, fill: { color: i < kk ? A : c.bg }, line: { color: A, width: 0.75 } });
      if (i < kk) sh("LINE", { x: x + i * cw + cw / 2 - 0.01, y: y + 0.05, w: 0, h: 0.12, line: { color: c.bg, width: 0.5 } }); } }
  else if (kind === "ruler") { sh("LINE", { x, y: y + 0.2, w, h: 0, line: { color: A, width: 1 } });
    for (let i = 0; i <= 20; i++) sh("LINE", { x: x + i * w / 20, y: y + (i % 5 ? 0.13 : 0.06), w: 0, h: i % 5 ? 0.07 : 0.14, line: { color: A, width: 0.75 } });
    sh("RECTANGLE", { x, y: y + 0.17, w: Math.max(0.05, w * P), h: 0.06, fill: { color: A }, line: { type: "none" } });
    sh("ISOSCELES_TRIANGLE", { x: x + w * P - 0.07, y: y - 0.04, w: 0.14, h: 0.1, rotate: 180, fill: { color: c.bad }, line: { type: "none" } }); }
  else if (kind === "tape") { sh("LINE", { x, y: y + 0.1, w, h: 0, line: { color: A, width: 1, dashType: "sysDot" } });
    sh("RECTANGLE", { x, y: y + 0.02, w: Math.max(0.08, w * P), h: 0.16, fill: { color: A }, line: { type: "none" } });
    for (let j = 0; j < 2; j++) sh("ISOSCELES_TRIANGLE", { x: x + w * P - 0.01, y: y + 0.02 + j * 0.08, w: 0.08, h: 0.08, rotate: 90, fill: { color: A }, line: { type: "none" } }); } // mép xé răng cưa
  else if (kind === "balance") { const cw = w / n; for (let i = 0; i < n; i++) { const hh = 0.06 + 0.17 * (i + 1) / n;
      sh("RECTANGLE", { x: x + i * cw + 0.02, y: y + 0.24 - hh, w: cw - 0.05, h: hh, fill: { color: i < k ? A : c.line }, line: { type: "none" } }); }
    sh("LINE", { x, y: y + 0.25, w, h: 0, line: { color: A, width: 1 } }); }
  else if (kind === "nodes") { const m = 6, kk = Math.max(1, Math.round(P * m)), st = (w - 0.16) / (m - 1);
    sh("LINE", { x: x + 0.08, y: y + 0.12, w: st * (m - 1), h: 0, line: { color: A, width: 1 } });
    for (let i = 0; i < m; i++) sh("OVAL", { x: x + i * st, y: y + 0.04, w: 0.16, h: 0.16, fill: { color: i < kk ? A : c.bg }, line: { color: A, width: 1 } }); }
  else if (kind === "folio") { sh("LINE", { x, y: y + 0.08, w, h: 0, line: { color: A, width: 1 } }); sh("LINE", { x, y: y + 0.13, w, h: 0, line: { color: A, width: 0.5 } });
    sh("OVAL", { x: x + Math.max(0, w * P - 0.2), y: y + 0.0, w: 0.2, h: 0.2, fill: { color: c.bad }, line: { type: "none" } }); } // dấu xi đỏ chạy theo số tờ
}
// slide nội dung trên nền sáng của một WORLD (có fits) phải đủ 3 cỡ dấu hiệu — thiếu 1 cỡ: gợi ý; thiếu ≥ 2 cỡ: cảnh báo (--strict dừng)
const SIG_SKIP = new Set(["cover", "section", "end", "closing", "quote", "photo", "split", "gallery", "frame", "beforeafter", "mosaic", "photostats", "photostrip", "headline", "lens", "collage", "hero"]);
function lintSig(d, c) { if (!KIT || !KIT.fits || c !== TH.l || SIG_SKIP.has(d.type)) return [];
  const miss = ["macro", "meso", "micro"].filter(k => !CUR.sig[k].size), NM = { macro: "cỡ lớn (nền / khung)", meso: "cỡ vừa (dáng thẻ, ô số, khối hình chính, đồ vật)", micro: "cỡ nhỏ (icon, nhãn, thanh tiến độ)" };
  if (!miss.length) return [];
  return [{ kind: miss.length >= 2 ? "sigw" : "sig", msg: `Slide ${CUR.n} (${d.type}): che chữ đi khó nhận ra world "${KIT_NAME}" — thiếu dấu hiệu ${miss.map(k => NM[k]).join(", ")}. Thêm kicker / dùng khối hình chính "${KIT.hero}" / bố cục có thẻ hoặc ô số` }]; }

// ---------- WORLD × LAYOUT (11/2026): mỗi world có MỘT "dáng" (KIT.form) dùng chung cho nhiều bố cục ----------
// ô bước (steps) · đường nối (steps, timeline) · điểm mốc (timeline, stats) — để steps / timeline / stats của 8 world không còn giống nhau khi che chữ.
// stamp (ô dấu sổ BHXH) · day (tờ lịch) · container · dim (khung bản vẽ + đường kích thước) · ticket (cuống vé hoá đơn, khía tròn hai mép)
// · card (thẻ ngân hàng có chip) · node (nút sơ đồ) · tab (tab hồ sơ + dây niêm phong đỏ). Hình trang trí đều _deco; chữ số vẫn là ô chữ thật.
const FORM = () => (KIT && KIT.fits && KIT.form) || null;
function worldTile(s, c, x, y, w, h, on, label, lab) { const f = FORM(), A = c.acc, D = { _deco: true }, sh = (t, o) => s.addShape(pres.shapes[t], Object.assign(o, D));
  sig("meso", "ô bước " + f); const soft = mix(A, c.bg, 0.78), fill = on ? A : soft, fg = on ? c.onAcc : A, tx = { x, y, w, h };
  if (f === "stamp") { sh("RECTANGLE", { x, y, w, h, fill: { color: fill }, line: { color: A, width: 1.25 } }); sh("RECTANGLE", { x: x + 0.05, y: y + 0.05, w: w - 0.1, h: h - 0.1, fill: { type: "none" }, line: { color: on ? c.onAcc : A, width: 0.5 } });
    sh("OVAL", { x: x + w - 0.42, y: y - 0.12, w: 0.5, h: 0.5, fill: { type: "none" }, line: { color: c.bad, width: 1.5 }, rotate: 15 }); }
  else if (f === "day") { sh("RECTANGLE", { x, y, w, h, fill: { color: on ? A : "FFFFFF" }, line: { color: A, width: 1 } }); sh("RECTANGLE", { x, y, w, h: 0.2, fill: { color: on ? c.text : A }, line: { type: "none" } });
    for (const k of [0.25, 0.75]) sh("OVAL", { x: x + w * k - 0.05, y: y + 0.05, w: 0.1, h: 0.1, fill: { color: c.bg }, line: { type: "none" } }); Object.assign(tx, { y: y + 0.18, h: h - 0.18 }); } // khoen lịch
  else if (f === "container") { sh("RECTANGLE", { x, y, w, h, fill: { color: fill }, line: { color: A, width: 1 } });
    for (let xx = x + 0.12; xx < x + w - 0.05; xx += 0.12) sh("LINE", { x: xx, y: y + 0.06, w: 0, h: h - 0.12, line: { color: on ? c.onAcc : A, width: 0.5, transparency: on ? 55 : 70 } }); // gờ tôn
    for (const k of [0.32, 0.68]) sh("LINE", { x: x + w - 0.1, y: y + h * k - 0.12, w: 0, h: 0.24, line: { color: on ? c.onAcc : A, width: 1.5 } }); } // thanh khoá cửa
  else if (f === "dim") { sh("RECTANGLE", { x, y, w, h, fill: { color: on ? A : "FFFFFF" }, line: { color: A, width: 1.25 } });
    sh("LINE", { x: x + 0.04, y: y - 0.14, w: w - 0.08, h: 0, line: { color: A, width: 0.75, beginArrowType: "triangle", endArrowType: "triangle" } });
    for (const xx of [x, x + w]) sh("LINE", { x: xx, y: y - 0.22, w: 0, h: 0.16, line: { color: A, width: 0.75 } });
    sh("RECTANGLE", { x: x + w - 0.42, y: y + h - 0.22, w: 0.42, h: 0.22, fill: { type: "none" }, line: { color: on ? c.onAcc : A, width: 0.5 } }); } // ô khung tên
  else if (f === "ticket") { sh("RECTANGLE", { x, y, w, h, fill: { color: fill }, line: { type: "none" } });
    for (const xx of [x - 0.11, x + w - 0.11]) sh("OVAL", { x: xx, y: y + h / 2 - 0.11, w: 0.22, h: 0.22, fill: { color: c.bg }, line: { type: "none" } }); // khía tròn
    sh("LINE", { x: x + 0.28, y: y + 0.08, w: 0, h: h - 0.16, line: { color: on ? c.onAcc : A, width: 1, dashType: "sysDot" } }); if (w >= 1.2) Object.assign(tx, { x: x + 0.28, w: w - 0.28 }); }
  else if (f === "card") { sh("ROUNDED_RECTANGLE", { x, y, w, h, rectRadius: 0.1, fill: { color: fill }, line: { color: A, width: 0.75 } });
    sh("ROUNDED_RECTANGLE", w >= 1.2 ? { x: x + 0.14, y: y + h / 2 - 0.13, w: 0.32, h: 0.26, rectRadius: 0.04, fill: { color: TH.gold }, line: { color: mix(TH.gold, "000000", 0.3), width: 0.5 } } : { x: x - 0.08, y: y + h - 0.12, w: 0.2, h: 0.16, rectRadius: 0.03, fill: { color: TH.gold }, line: { color: mix(TH.gold, "000000", 0.3), width: 0.5 } }); if (w >= 1.2) Object.assign(tx, { x: x + 0.46, w: w - 0.46 }); } // chip thẻ (ô nhỏ: chip nằm dưới số)
  else if (f === "node") { const d = Math.min(h, 0.78); sh("OVAL", { x: x + w / 2 - d / 2, y: y + (h - d) / 2, w: d, h: d, fill: { color: on ? A : "FFFFFF" }, line: { color: A, width: 2 } }); Object.assign(tx, { x: x + w / 2 - d / 2, w: d }); }
  else if (f === "tab") { sh("ROUND_2_SAME_RECTANGLE", { x: x + 0.05, y, w: w - 0.1, h, rectRadius: 0.14, fill: { color: fill }, line: { color: A, width: 0.75 } });
    sh("RECTANGLE", { x: x + 0.05, y: y + h - 0.06, w: w - 0.1, h: 0.06, fill: { color: c.bad }, line: { type: "none" } }); } // mép băng niêm phong
  addT(s, label, Object.assign({ _label: lab || "số thứ tự", fill: { type: "none" }, line: { type: "none" }, color: fg, fontFace: TH.numFont, italic: TH.numItalic, bold: true, fontSize: Math.min(22, Math.round(Math.min(tx.w, tx.h) * 36)), align: "center", valign: "middle", margin: 0 }, tx));
}
function worldLink(s, c, x1, y, x2) { const f = FORM(), A = c.acc, D = { _deco: true }, sh = (t, o) => s.addShape(pres.shapes[t], Object.assign(o, D)), w = x2 - x1; sig("meso", "đường nối " + f);
  if (f === "container") { sh("LINE", { x: x1, y: y - 0.05, w, h: 0, line: { color: c.muted, width: 1.5 } }); sh("LINE", { x: x1, y: y + 0.05, w, h: 0, line: { color: c.muted, width: 1.5 } });
    for (let xx = x1; xx <= x2; xx += 0.28) sh("LINE", { x: xx, y: y - 0.1, w: 0, h: 0.2, line: { color: c.muted, width: 2.5, transparency: 40 } }); } // ray + tà vẹt
  else if (f === "dim") { sh("LINE", { x: x1, y, w, h: 0, line: { color: A, width: 1, beginArrowType: "triangle", endArrowType: "triangle" } }); }
  else if (f === "ticket") sh("LINE", { x: x1, y, w, h: 0, line: { color: A, width: 2, dashType: "sysDot" } }); // đường xé
  else if (f === "stamp") { sh("LINE", { x: x1, y: y - 0.03, w, h: 0, line: { color: A, width: 1 } }); sh("LINE", { x: x1, y: y + 0.03, w, h: 0, line: { color: A, width: 1 } }); } // kẻ đôi như sổ
  else if (f === "day") { sh("LINE", { x: x1, y, w, h: 0, line: { color: A, width: 1.5 } }); for (let xx = x1; xx <= x2; xx += w / 30) sh("LINE", { x: xx, y: y - 0.05, w: 0, h: 0.1, line: { color: A, width: 0.75 } }); } // thước ngày
  else if (f === "card") { const pts = []; for (let k = 0; k <= 60; k++) pts.push({ x: w * k / 60, y: 0.08 + 0.06 * Math.sin(k / 3) }); sh("LINE", { x: x1, y, w, h: 0, line: { color: A, width: 1.5, transparency: 30 } });
    s.addShape(pres.shapes.CUSTOM_GEOMETRY || "custGeom", Object.assign({ x: x1, y: y - 0.08, w, h: 0.16, points: pts.map((p, k) => k ? { x: p.x, y: p.y } : { x: p.x, y: p.y, moveTo: true }), line: { color: A, width: 1, transparency: 40 }, fill: { type: "none" } }, D)); } // vân bảo an
  else if (f === "node") sh("LINE", { x: x1, y, w, h: 0, line: { color: A, width: 2.5 } });
  else if (f === "tab") { sh("LINE", { x: x1, y, w, h: 0, line: { color: c.bad, width: 3 } }); sh("LINE", { x: x1, y: y - 0.05, w, h: 0, line: { color: "FFFFFF", width: 0.75, dashType: "dash" } }); } // dây niêm phong
  else sh("LINE", { x: x1, y, w, h: 0, line: { color: c.line, width: 2.5, endArrowType: "triangle" } });
}
// thanh / cột biểu đồ mang VẬT của world (lớp phủ trong thân thanh — số và nhãn vẫn ở ngoài): ô dấu, ô ngày, gờ container, đường kích thước,
// đường xé hoá đơn, chồng xu, nút đầu thanh, băng niêm phong. vert = cột đứng. Thanh quá nhỏ (< 0.25 in) thì bỏ qua.
function worldBar(s, c, x, y, w, h, vert) { const f = FORM(); if (!f || (vert ? h : w) < 0.25) return; sig("meso", "thanh " + f);
  const W0 = "FFFFFF", D = { _deco: true }, sh = (t, o) => s.addShape(pres.shapes[t], Object.assign(o, D)), L = vert ? h : w, cut = (step, o = {}) => { for (let k = step; k < L - 0.04; k += step) sh("LINE", vert ? { x, y: y + h - k, w, h: 0, line: Object.assign({ color: W0, width: 1 }, o) } : { x: x + k, y, w: 0, h, line: Object.assign({ color: W0, width: 1 }, o) }); };
  if (f === "stamp") cut(0.22, { width: 0.75, transparency: 35 }); // ô dấu (mảnh — không để thanh trông như khối đếm được)
  else if (f === "day") cut(0.13, { width: 0.75, transparency: 20 }); // ô ngày
  else if (f === "container") { cut(0.09, { width: 0.5, transparency: 45 }); sh("RECTANGLE", vert ? { x, y, w, h: 0.07, fill: { color: c.text }, line: { type: "none" } } : { x: x + w - 0.07, y, w: 0.07, h, fill: { color: c.text }, line: { type: "none" } }); }
  else if (f === "dim") { sh("LINE", vert ? { x: x - 0.1, y, w: 0, h, line: { color: c.acc, width: 0.75, beginArrowType: "triangle", endArrowType: "triangle" } } : { x, y: y - 0.08, w, h: 0, line: { color: c.acc, width: 0.75, beginArrowType: "triangle", endArrowType: "triangle" } }); }
  else if (f === "ticket") sh("LINE", vert ? { x: x + w / 2, y: y + 0.05, w: 0, h: h - 0.1, line: { color: W0, width: 1.25, dashType: "sysDot" } } : { x: x + 0.05, y: y + h / 2, w: w - 0.1, h: 0, line: { color: W0, width: 1.25, dashType: "sysDot" } });
  else if (f === "card") cut(0.1, { width: 0.5, transparency: 40 }); // chồng xu
  else if (f === "node") { const d = Math.min(0.26, (vert ? w : h) + 0.08); sh("OVAL", vert ? { x: x + w / 2 - d / 2, y: y + h - d / 2, w: d, h: d, fill: { color: W0 }, line: { color: c.acc, width: 2 } } : { x: x - d / 2, y: y + h / 2 - d / 2, w: d, h: d, fill: { color: W0 }, line: { color: c.acc, width: 2 } }); } // nút ở GỐC thanh — đầu thanh là chỗ của con số
  else if (f === "tab") sh("RECTANGLE", vert ? { x, y: y + Math.min(0.2, h * 0.3), w, h: 0.07, fill: { color: c.bad }, line: { type: "none" } } : { x: x + w - Math.min(0.3, w * 0.3), y, w: 0.07, h, fill: { color: c.bad }, line: { type: "none" } }); // vạch niêm phong
}
// vành biểu đồ tròn mang dáng world: viền đôi sổ · vạch giờ tờ lịch · gờ container · đường kính có kích thước · răng cưa hoá đơn · khía mép đồng xu · 4 nút sơ đồ · dây niêm phong
function worldRing(s, c, x, y, D) { const f = FORM(); if (!f) return; sig("meso", "vành " + f); const A = c.acc, R = D / 2, cx = x + R, cy = y + R, Dd = { _deco: true }, sh = (t, o) => s.addShape(pres.shapes[t], Object.assign(o, Dd)), ring = (pad, o) => sh("OVAL", Object.assign({ x: x - pad, y: y - pad, w: D + 2 * pad, h: D + 2 * pad, fill: { type: "none" } }, o));
  const ticks = (m, len, o) => { for (let k = 0; k < m; k++) { const a = 2 * Math.PI * k / m, r1 = R + 0.1, x1 = cx + r1 * Math.cos(a), y1 = cy + r1 * Math.sin(a), x2 = cx + (r1 + len) * Math.cos(a), y2 = cy + (r1 + len) * Math.sin(a);
    sh("LINE", Object.assign({ x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(0.001, Math.abs(x2 - x1)), h: Math.max(0.001, Math.abs(y2 - y1)), flipH: (x2 < x1) !== (y2 < y1) }, o)); } };
  if (f === "stamp") { ring(0.1, { line: { color: c.bad, width: 1.5 } }); ring(0.18, { line: { color: c.bad, width: 0.75 } }); }
  else if (f === "day") ticks(12, 0.14, { line: { color: A, width: 1.5 } });
  else if (f === "container") ring(0.12, { line: { color: c.text, width: 4, dashType: "dash" } });
  else if (f === "dim") { ring(0.08, { line: { color: A, width: 0.75 } }); sh("LINE", { x: x - 0.08, y: y + D + 0.28, w: D + 0.16, h: 0, line: { color: A, width: 0.75, beginArrowType: "triangle", endArrowType: "triangle" } }); }
  else if (f === "ticket") ring(0.1, { line: { color: A, width: 2, dashType: "sysDot" } });
  else if (f === "card") ticks(48, 0.06, { line: { color: mix(TH.gold, "000000", 0.25), width: 1.25 } });
  else if (f === "node") { ring(0.1, { line: { color: A, width: 1 } }); for (let k = 0; k < 4; k++) { const a = Math.PI / 2 * k; sh("OVAL", { x: cx + (R + 0.1) * Math.cos(a) - 0.08, y: cy + (R + 0.1) * Math.sin(a) - 0.08, w: 0.16, h: 0.16, fill: { color: A }, line: { color: c.bg, width: 1 } }); } }
  else if (f === "tab") ring(0.12, { line: { color: c.bad, width: 3 } });
}
// bảng mang dáng world: kẻ dòng + chi tiết đầu bảng theo vật thật (không đụng vào chữ trong ô)
function worldTable(s, c, x, y, w, hh, n, rh, xs) { const f = FORM(); if (!f) return; sig("meso", "bảng " + f); const A = c.acc, Dd = { _deco: true }, sh = (t, o) => s.addShape(pres.shapes[t], Object.assign(o, Dd)), H2 = hh + n * rh;
  if (f === "stamp") for (let i = 1; i < n; i++) sh("LINE", { x, y: y + hh + i * rh + 0.04, w, h: 0, line: { color: A, width: 0.5, transparency: 40 } }); // kẻ đôi như sổ
  else if (f === "day") for (const xx of xs.slice(1)) sh("LINE", { x: xx, y: y + hh, w: 0, h: n * rh, line: { color: c.line, width: 0.75 } }); // lưới cột như bảng chấm công
  else if (f === "container") for (let xx = x + 0.15; xx < x + w; xx += 0.15) sh("LINE", { x: xx, y: y + 0.06, w: 0, h: hh - 0.12, line: { color: "FFFFFF", width: 0.5, transparency: 70 } }); // gờ tôn trên đầu bảng
  else if (f === "dim") { sh("LINE", { x, y: y - 0.16, w, h: 0, line: { color: A, width: 0.75, beginArrowType: "triangle", endArrowType: "triangle" } }); sh("LINE", { x: x - 0.16, y, w: 0, h: H2, line: { color: A, width: 0.75, beginArrowType: "triangle", endArrowType: "triangle" } }); }
  else if (f === "ticket") { const m = Math.max(4, Math.round(w / 0.18)), tw = w / m; for (let k = 0; k < m; k++) sh("ISOSCELES_TRIANGLE", { x: x + k * tw, y: y + H2 - 0.01, w: tw, h: 0.1, rotate: 180, fill: { color: "FFFFFF" }, line: { type: "none" } }); }
  else if (f === "card") for (let k = 0; k < 3; k++) sh("LINE", { x: x + 0.1, y: y + hh - 0.1 + k * 0.035, w: w - 0.2, h: 0, line: { color: "FFFFFF", width: 0.5, transparency: 50 } });
  else if (f === "node") for (let i = 0; i < n; i++) sh("OVAL", { x: x - 0.09, y: y + hh + i * rh + rh / 2 - 0.09, w: 0.18, h: 0.18, fill: { color: A }, line: { color: c.bg, width: 1 } });
  else if (f === "tab") sh("LINE", { x: x + 0.12, y: y + hh, w: 0, h: n * rh, line: { color: c.bad, width: 1.25, transparency: 30 } }); // lề đỏ
}
function worldMarker(s, c, cx, cy, on, small) { const f = FORM(), A = c.acc, D = { _deco: true }, sh = (t, o) => s.addShape(pres.shapes[t], Object.assign(o, D)), r = small ? 0.13 : on ? 0.26 : 0.2; sig("meso", "điểm mốc " + f);
  if (f === "stamp") { sh("OVAL", { x: cx - r - 0.04, y: cy - r - 0.04, w: 2 * r + 0.08, h: 2 * r + 0.08, fill: { color: c.bg }, line: { color: c.bad, width: 1.5 } }); sh("OVAL", { x: cx - r + 0.06, y: cy - r + 0.06, w: 2 * r - 0.12, h: 2 * r - 0.12, fill: { color: on ? c.bad : c.bg }, line: { color: c.bad, width: 0.75 } }); }
  else if (f === "day") { sh("RECTANGLE", { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r, fill: { color: on ? A : "FFFFFF" }, line: { color: A, width: 1.25 } }); sh("RECTANGLE", { x: cx - r, y: cy - r, w: 2 * r, h: 0.08, fill: { color: c.bad }, line: { type: "none" } }); }
  else if (f === "container") { sh("RECTANGLE", { x: cx - r * 1.6, y: cy - r * 0.9, w: r * 3.2, h: r * 1.8, fill: { color: on ? A : mix(A, c.bg, 0.7) }, line: { color: A, width: 1 } }); for (const k of [-0.5, 0, 0.5]) sh("LINE", { x: cx + k * r * 1.6, y: cy - r * 0.6, w: 0, h: r * 1.2, line: { color: c.bg, width: 0.75 } }); }
  else if (f === "dim") { sh("LINE", { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r, line: { color: A, width: 1.5 } }); sh("LINE", { x: cx - r, y: cy + r, w: 2 * r, h: 2 * r, flipV: true, line: { color: A, width: 1.5 } }); sh("OVAL", { x: cx - r * 0.7, y: cy - r * 0.7, w: r * 1.4, h: r * 1.4, fill: { color: on ? A : "FFFFFF" }, line: { color: A, width: 1 } }); }
  else if (f === "ticket") { sh("RECTANGLE", { x: cx - r, y: cy - r * 1.3, w: 2 * r, h: r * 2.6, fill: { color: on ? A : "FFFFFF" }, line: { color: A, width: 1 } }); sh("LINE", { x: cx - r * 0.6, y: cy, w: r * 1.2, h: 0, line: { color: on ? c.onAcc : A, width: 0.75, dashType: "sysDot" } }); }
  else if (f === "card") { for (const k of [0.12, 0]) sh("OVAL", { x: cx - r, y: cy - r - k, w: 2 * r, h: 2 * r * 0.6, fill: { color: on ? TH.gold : mix(TH.gold, "FFFFFF", 0.5) }, line: { color: mix(TH.gold, "000000", 0.35), width: 0.75 } }); } // chồng xu
  else if (f === "node") { sh("OVAL", { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r, fill: { color: on ? A : "FFFFFF" }, line: { color: A, width: 2.5 } }); sh("LINE", { x: cx, y: cy - r - 0.18, w: 0, h: 0.18, line: { color: A, width: 1.5 } }); }
  else if (f === "tab") { sh("OVAL", { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r, fill: { color: c.bad }, line: { color: mix(c.bad, "000000", 0.3), width: 1 } }); sh("OVAL", { x: cx - r * 0.55, y: cy - r * 0.55, w: r * 1.1, h: r * 1.1, fill: { type: "none" }, line: { color: "FFFFFF", width: 0.75, transparency: 30 } }); } // dấu xi
}

// ---------- LƯỚI CHUNG (mọi slide nội dung) ----------
// hàng kicker 0.85 · tiêu đề 1.25 (luôn cố định, có hay không có kicker) · thân từ 2.3 · hàng chú thích/nguồn 6.62
const KICK_Y = 0.85, TITLE_Y = 1.25, BODY_Y = 2.3, FOOT_Y = 6.62, FOOT_H = 0.42;
function title(s, c, str, y = TITLE_Y, size = 34, w = W - 2 * M) { T(s, rich(str, c.text, c.acc), { x: M, y, w, h: 1.0, fontSize: size }); }
function kickerTitle(s, c, d) {
  if (d.kicker) kicker(s, d.kicker, M, KICK_Y, c.acc);
  title(s, c, d.title); return BODY_Y;
}
function foot(s, c, text) {
  if (!text) return;
  if (CUR && CUR.take) { // dải kết luận: thanh nhạt cả bề ngang + nhãn đặc màu nhấn vắt qua mép trái thanh (cùng vị trí ở mọi slide)
    const tk = CUR.take, rest = String(text).startsWith(tk) ? String(text).slice(tk.length).replace(/^\s*·\s*/, "") : ""; text = tk; // nguồn / ghi chú bố cục tự nối thêm → dòng nhỏ dưới dải
    const lab = "Ghi nhớ", lw = fitW(lab, { fontFace: TH.bodyFont, fontSize: 13, bold: true }, 0.4, 0.1, 1.6), by = FOOT_Y, bh = 0.48;
    if (rest) T(s, rich(rest, c.muted, c.text), { _label: "nguồn", x: M + 0.25, y: by + bh + 0.03, w: W - 2 * M - 0.25, h: 0.3, fontSize: 12, color: c.muted, align: "right" });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M + 0.25, y: by, w: W - 2 * M - 0.25, h: bh, rectRadius: 0.28, fill: { color: mix(c.acc, c.bg, 0.9) }, line: { type: "none" } });
    addT(s, lab, { _label: "nhãn ghi nhớ", shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.2, x: M - 0.05, y: by + 0.08, w: lw, h: bh - 0.16, fill: { color: c.acc }, line: { type: "none" }, color: c.onAcc, fontFace: TH.bodyFont, fontSize: 13, bold: true, align: "center", valign: "middle", margin: 0 });
    return T(s, rich(text, c.text, c.acc), { _label: "chú thích", x: M + lw + 0.15, y: by + 0.06, w: W - 2 * M - lw - 0.35, h: bh - 0.12, fontSize: 15, valign: "middle" }); }
  T(s, rich(text, c.muted, c.text), { _label: "chú thích", x: M, y: FOOT_Y, w: W - 2 * M, h: FOOT_H, fontSize: 13 }); }

// ---------- TRANG TRÍ LỒNG VÀO THÀNH PHẦN (học từ mẫu Pinterest) ----------
// tab: nhãn vắt qua mép trên của thẻ — tên thẻ gắn liền với thẻ, mắt đọc nhãn trước rồi xuống nội dung
function tab(s, text, x, y, color, fg, w) {
  const tw = w || fitW(String(text).toUpperCase(), { fontFace: TH.bodyFont, fontSize: 12.5, bold: true, charSpacing: 1 }, 0.45, 0.098, 5.0);
  addT(s, String(text).toUpperCase(), { _label: "tab", shape: TH.radius ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, rectRadius: 0.18, x, y: y - 0.19, w: tw, h: 0.38,
    fill: { color }, line: { color: fg === "FFFFFF" ? color : TH.l.bg, width: 2 }, color: fg, fontFace: TH.bodyFont, fontSize: 12.5, bold: true, align: "center", valign: "middle", margin: 0, charSpacing: 1 });
}
// góc chìm: mảng phần tư hình tròn nằm trong góc trên-phải của thẻ (trang trí, không mang chữ)
function corner(s, x, y, w, color, r = 0.9, tr = 80) {
  s.addShape(pres.shapes.PIE, { x: x + w - r, y: y - r, w: 2 * r, h: 2 * r, angleRange: [90, 180], fill: { color, transparency: tr }, line: { type: "none" } });
}
// thẻ chồng lớp: một lớp màu lệch phía sau thẻ nhấn (insight, trích dẫn) — tạo độ nổi, báo "đây là điểm chính"
function stack(s, x, y, w, h, color) {
  s.addShape(TH.radius ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, Object.assign({ x: x + 0.14, y: y + 0.14, w, h, fill: { color, transparency: 55 }, line: { type: "none" } }, TH.radius ? { rectRadius: TH.radius } : {}));
}
const tone = (c, t) => t === "bad" ? c.bad : t === "good" ? c.good : t === "muted" ? c.muted : c.text;

// ---------- layouts ----------
const L = {};

// THANG CỠ CHỮ (pt) — đừng hạ dưới mức này; nội dung không vừa thì cắt chữ / tách slide / đổi type:
//   tiêu đề 34–44 · dẫn 17–18 · thân 15–16 · chú thích, nguồn 13 · nhãn chữ hoa 12 · chrome 11
const isLight = (c) => c.card === "FFFFFF" || c.card === "FFFDF9" || c.card === "F4F4F4";
function cap(s, text, x, y, w, color, o = {}) { // nhãn chữ hoa nhỏ (đầu cột, đầu danh sách)
  T(s, String(text).toUpperCase(), Object.assign({ x, y, w, h: 0.3, fontSize: 12, bold: true, color, charSpacing: 1.5 }, o));
}

L.cover = async (s, c, d, meta) => {
  if (await styled("cover", s, c, Object.assign({}, d, { authorSub: [d.authorSub, d.date].filter(Boolean).join(" · ") || undefined }), meta)) return;
  // layout: art (mặc định khi không có ảnh) | typo (chữ lớn tối giản) | band (dải ảnh trên đầu) | full (ảnh tràn viền) | split (ảnh 58% + thẻ chữ)
  const lay = d.layout === "frame" && !d.photo ? "art" : d.layout || (d.photo ? (d.photoLayout === "split" ? "split" : "full") : "art"); // frame: ảnh trong khung (cần photo)
  d = Object.assign({}, d, { authorSub: [d.authorSub, d.date].filter(Boolean).join(" · ") || undefined });
  if (d.photo && (lay === "frame" || (!d.layout && framed(d)))) return coverFrame(s, c, Object.assign({}, d, { frame: d.frame || FRAME_DEF || "arch" }), meta);
  if (lay === "poster" && d.photo) return coverPoster(s, c, d, meta);
  if (lay === "typo") return coverTypo(s, c, d, meta);
  if (lay === "paper") return coverPaper(s, c, d, meta);
  if (lay === "band" && d.photo) return coverBand(s, c, d, meta);
  if (lay === "art" && d.photo) d = Object.assign({}, d, { photo: undefined });
  if (d.photo && lay === "split") return L.split(s, c, Object.assign({}, d, { sub: d.subtitle, items: d.author ? [{ icon: "PiUserDuotone", head: d.author, text: d.authorSub }] : [] }), meta);
  if (d.photo) return coverPhoto(s, c, d, meta);
  if (c === TH.l) return coverLight(s, c, d, meta);
  box(s, 6.95, 0.6, 5.78, 6.3, c.deep);
  s.addImage({ altText: "Hoa văn giấy chứng nhận", data: await art("guilloche", c.acc, null, null, 1400), x: 9.84 - 2.8, y: 3.75 - 2.8, w: 5.6, h: 5.6, transparency: 45 });
  const a = d.art || DEF_ART.hero;
  if (a === "justice") s.addImage({ altText: "Hình minh hoạ", data: await art(a, c.acc, c.bad, c.deep, 1400), x: 9.84 - 2.3, y: 3.75 - 2.0, w: 4.6, h: 3.99 });
  else if (a !== "none") s.addImage({ altText: "Hình minh hoạ", data: await art(a, c.acc, c.bad), x: 7.75, y: 2.15, w: 4.2, h: 3.36 });
  let y = 1.0;
  if (meta.logo && fs.existsSync(meta.logo)) { box(s, M, 0.55, 1.75, 0.52, "FFFFFF"); s.addImage({ path: meta.logo, x: M + 0.08, y: 0.6, w: 1.59, h: 0.42, sizing: { type: "contain", w: 1.59, h: 0.42 } }); y = 1.55; }
  if (d.kicker) kicker(s, d.kicker, M, y, c.acc);
  T(s, rich(d.title, c.text, c.acc), { x: M, y: y + 0.5, w: 6.1, h: 2.5, fontSize: 40 });
  if (d.subtitle) T(s, d.subtitle, { x: M, y: y + 3.05, w: 5.9, h: 0.85, fontSize: 17, color: c.muted });
  if (d.author) {
    if (d.initials) addT(s, d.initials, { shape: pres.shapes.OVAL, x: M, y: 5.85, w: 0.62, h: 0.62, fill: { color: c.acc }, line: { type: "none" }, color: c.onAcc, fontFace: TH.numFont, italic: TH.numItalic, bold: true, fontSize: 16, align: "center", valign: "middle", margin: 0 });
    T(s, [{ text: d.author, options: { bold: true, color: c.text, fontSize: 16, breakLine: true } }, { text: d.authorSub || "", options: { color: c.muted, fontSize: 13 } }], { x: M + 0.8, y: 5.82, w: 5.4, h: 0.7, valign: "middle" });
  }
};

L.statement = async (s, c, d) => {
  const dk = TH.d;
  box(s, M, 0.85, W - 2 * M, 6.05, dk.bg);
  corner(s, M, 0.85, W - 2 * M, dk.acc, 1.6, 88);
  if (d.kicker) kicker(s, d.kicker, M + 0.45, 1.25, dk.acc);
  T(s, rich(d.title, dk.text, dk.acc), { x: M + 0.45, y: 1.72, w: 7.7, h: 1.55, fontSize: 36 });
  if (d.sub) T(s, d.sub, { x: M + 0.45, y: 3.3, w: 7.5, h: 0.8, fontSize: 17, color: dk.muted });
  (d.stats || []).slice(0, 3).forEach((st, i) => {
    const x = M + 0.45 + i * 2.6;
    cap(s, st.label, x, 4.4, 2.35, dk.acc);
    T(s, st.value, { x, y: 4.75, w: 2.45, h: 0.75, fontSize: 34, fontFace: TH.numFont, italic: TH.numItalic, bold: TH.titleBold, color: tone(dk, st.tone) });
    T(s, st.desc || "", { x, y: 5.55, w: 2.35, h: 0.95, fontSize: 14, color: dk.muted });
    if (i) s.addShape(pres.shapes.LINE, { x: x - 0.2, y: 4.4, w: 0, h: 2.0, line: { color: dk.line, width: 0.75 } });
  });
  if (d.art !== "none" || d.cutout) { // tấm nền sau hình: có viền rõ (trước đây cùng tông khối tối, không mép → đọc như lỗi lớp)
    s.addShape(pres.shapes.RECTANGLE, { x: 8.95, y: 1.25, w: 3.38, h: 5.25, fill: { color: dk.card }, line: { color: dk.line, width: 1 } });
    await artOrCut(s, d, () => art(d.art || "document", dk.acc, dk.bad), 9.55, 1.7, 2.2, 2.79); }
  if (d.stamp) addT(s, d.stamp, { shape: pres.shapes.RECTANGLE, x: 9.45, y: 4.55, w: 2.4, h: 0.65, rotate: -8, fill: { color: dk.card }, line: { color: dk.bad, width: 3 }, color: dk.bad, fontFace: TH.accentFont, bold: true, fontSize: 22, align: "center", valign: "middle", margin: 0, charSpacing: 3 });
  if (d.artCaption) T(s, d.artCaption, { x: 9.15, y: 5.55, w: 3.0, h: 0.7, fontSize: 13, color: dk.muted, align: "center" });
};

// cards có ảnh: mỗi thẻ đầu là ảnh thật (người/vật/nơi chốn được nói tới), tên + mô tả bên dưới — không có huy hiệu icon
async function cardsPhoto(s, c, d, items, n, w, gap, y0, avail, dfs) {
  // thẻ có ảnh; focus = thẻ đang bàn: ảnh màu + vạch màu nhấn, các thẻ khác ảnh đen trắng
  const f = Number.isInteger(d.focus) ? d.focus : -1;
  const nh = Math.max(...items.map(it => realH(it.name || "", { fontFace: TH.bodyFont, fontSize: 19, bold: true }, w - 0.5, 0.4)));
  const dh = Math.max(0, ...items.map(it => it.desc ? realH(it.desc, { fontFace: TH.bodyFont, fontSize: dfs }, w - 0.5, 0.6) : 0));
  const room = 6.9 - (y0 - 0.45); // ảnh không còn dòng ghi nguồn trên slide (ghi công ở bản Word)
  const top = y0 - 0.45, txt = 0.25 + nh + (items.some(it => it.who) ? 0.36 : 0) + (dh ? 0.12 + dh : 0) + 0.3, ih = Math.min(2.4, Math.max(1.3, room - txt));
  const h = Math.min(room, ih + txt), y = top + Math.max(0, (room - h) / 2);
  for (const [i, it] of items.entries()) { const x = M + i * (w + gap), on = i === f;
    box(s, x, y, w, h, on ? c.deep : c.card, on ? c.acc : isLight(c) ? c.line : null);
    if (it.photo) s.addImage({ _bg: TH.d.bg, data: await photo(it.photo, w, ih, null, null, "none", 0, it.photoStyle || (f >= 0 && !on ? "bw" : "natural")), x, y, w, h: ih, altText: it.alt || it.name || "Ảnh" });
    else await circIcon(s, it.icon || worldIcon(i) || "PiUserDuotone", x + (w - 0.9) / 2, y + (ih - 0.9) / 2, 0.9, c.acc, c.onAcc);
    if (on) s.addShape(pres.shapes.RECTANGLE, { x, y: y + ih - 0.08, w, h: 0.08, fill: { color: c.acc }, line: { type: "none" } });
    let yy = y + ih + 0.25;
    T(s, it.name, { _label: `items[${i}].name`, x: x + 0.25, y: yy, w: w - 0.5, h: nh + 0.04, fontSize: 19, bold: true, color: on ? c.acc : c.text }); yy += nh + 0.04;
    if (it.who) { T(s, it.who, { _label: `items[${i}].who`, x: x + 0.25, y: yy, w: w - 0.5, h: 0.32, fontSize: 14, fontFace: TH.accentFont, italic: TH.accentItalic, color: c.acc }); yy += 0.36; }
    if (it.desc) T(s, it.desc, { _label: `items[${i}].desc`, x: x + 0.25, y: yy + 0.08, w: w - 0.5, h: dh + 0.04, fontSize: dfs, color: c.muted }); }
}
// cards: icon là huy hiệu vắt qua mép trên của thẻ (nửa trong nửa ngoài)
L.cards = async (s, c, d) => {
  kickerTitle(s, c, d);
  if (d.sub) T(s, d.sub, { x: M, y: BODY_Y, w: W - 2 * M, h: 0.5, fontSize: 16, color: c.muted });
  const items = (d.items || []).slice(0, 4), n = items.length, gap = 0.3, w = (W - 2 * M - gap * (n - 1)) / n, y0 = (d.sub ? BODY_Y + 0.65 : BODY_Y) + 0.45, avail = 6.9 - y0;
  // thẻ cao vừa nội dung (không kéo dài tới đáy để lại khoảng trống); khối thẻ đặt giữa vùng thân
  const dfs = n <= 3 ? 17 : 15; // ít thẻ → thẻ rộng → chữ mô tả to hơn
  const need = Math.max(...items.map(it => realH(it.desc || "", { fontFace: TH.bodyFont, fontSize: dfs }, w - 0.55, 1.2)));
  // labels: ["Hậu quả", "Nên làm"] → nhãn chữ hoa nhỏ trước dòng who và trước desc: người xem biết hai tầng chữ quan hệ gì với nhau
  const lb = Array.isArray(d.labels) ? d.labels : [], LB = 0.32, lw = lb[0] && items.some(it => it.who) ? LB : 0, ld = lb[1] ? LB : 0;
  const dy = (items.some(it => it.tag) ? 2.0 : items.some(it => it.who) ? 1.6 : 1.2) + lw; // mô tả bắt đầu ngay dưới phần đầu thẻ đang có
  const h = Math.min(avail, Math.max(n <= 3 ? 2.8 : 2.6, dy + ld + need + 0.45)), y = y0 + Math.max(0, (avail - h) / 2 - 0.1); // ít thẻ → thẻ cao hơn, không để dải trống lớn
  if (items.some(it => it.photo)) return cardsPhoto(s, c, d, items, n, w, gap, y0, avail, dfs);
  for (let i = 0; i < n; i++) { CUR.grp = i + 1;
    const it = items[i], x = M + i * (w + gap);
    box(s, x, y, w, h, c.card, isLight(c) ? c.line : null);
    s.addShape(pres.shapes.OVAL, { x: x + 0.24, y: y - 0.48, w: 0.96, h: 0.96, fill: { color: c.bg }, line: { type: "none" } });
    await circIcon(s, it.icon || worldIcon(i) || "FaUser", x + 0.3, y - 0.42, 0.84, c.acc, c.onAcc);
    T(s, it.name, { x: x + 0.3, y: y + 0.6, w: w - 0.55, h: 0.45, fontSize: 21, bold: true, color: c.text });
    if (it.who && lw) cap(s, lb[0], x + 0.3, y + 1.08, w - 0.55, c.muted);
    if (it.who) T(s, it.who, { x: x + 0.3, y: y + 1.05 + lw, w: w - 0.55, h: 0.35, fontSize: 15, fontFace: TH.accentFont, italic: TH.accentItalic, color: c.acc });
    if (it.tag) pill(s, it.tag, x + 0.3, y + 1.52 + lw, w - 0.6, c.muted);
    if (ld && it.desc) cap(s, lb[1], x + 0.3, y + dy, w - 0.55, c.muted);
    T(s, it.desc || "", { x: x + 0.3, y: y + dy + ld, w: w - 0.55, h: h - dy - ld - 0.15, fontSize: dfs, color: c.muted });
    if (d.chain && i < n - 1) { s.addShape(pres.shapes.OVAL, { x: x + w - 0.04, y: y + 1.0, w: 0.38, h: 0.38, fill: { color: c.bg }, line: { color: c.acc, width: 1 } });
      s.addImage({ data: await icon("FaChevronRight", c.acc), x: x + w + 0.08, y: y + 1.12, w: 0.15, h: 0.15 }); }
  }
  CUR.grp = 0;
};

L.scene = async (s, c, d) => {
  T(s, d.year, { valign: "middle", x: M, y: TITLE_Y - 0.35, w: 3.3, h: 1.2, fontSize: String(d.year).length > 5 ? (TH.titleBold ? 44 : 50) : 60, fontFace: TH.numFont, italic: TH.numItalic, bold: TH.titleBold, color: c.acc });
  T(s, rich(d.title, c.text, c.acc), { valign: "middle", x: 4.05, y: TITLE_Y - 0.35, w: W - M - 4.05, h: 1.2, fontSize: 32 });
  if (d.sum) T(s, d.sum, { x: 4.05, y: BODY_Y + 0.02, w: W - M - 4.05, h: 0.7, fontSize: 16, color: c.muted });
  const ev = (d.events || []).slice(0, 3), tl = d.timeline, pts = (tl && tl.points) || [], act = (tl && tl.active) || [];
  const ly = 3.6, cy = 4.72;
  const n = Math.max(1, ev.length), gap = 0.3, cw = (W - 2 * M - gap * (n - 1)) / n, cx = (i) => M + i * (cw + gap);
  // thẻ cao vừa đủ chữ dài nhất (không để khoảng trống chết ở đáy thẻ)
  const need = Math.max(0.5, ...ev.map(e => { const m = measure(e.text, { fontFace: TH.bodyFont, fontSize: 18 }, cw - 0.55); return m.ok ? m.height : 1.2; }));
  const ch = Math.min(2.2, Math.max(1.45, 0.7 + need + 0.3));
  let px = () => 0;
  if (pts.length > 1) {
    const LW = 1.56, x0 = M + LW / 2, step = (W - 2 * M - LW) / (pts.length - 1); px = (i) => x0 + i * step; // nhãn 2 đầu không lòi khỏi lề
    s.addShape(pres.shapes.LINE, { objectName: "!!tl-track", x: M, y: ly, w: W - 2 * M, h: 0, line: { color: c.line, width: 2 } });
    // trạng thái từng mốc: đã qua (chấm đặc nhạt + đoạn đường đã đi) · đang bàn (màu nhấn) · chưa tới (vòng rỗng)
    const a0 = act.length ? Math.min(...act) : -1;
    if (a0 > 0) s.addShape(pres.shapes.LINE, { objectName: "!!tl-past", x: M, y: ly, w: px(a0) - M, h: 0, line: { color: c.acc, width: 3, transparency: 65 } });
    if (act.length > 1) s.addShape(pres.shapes.LINE, { objectName: "!!tl-active", x: px(Math.min(...act)), y: ly, w: (Math.max(...act) - Math.min(...act)) * step, h: 0, line: { color: c.acc, width: 4 } });
    pts.forEach(([dt, lb], i) => { const on = act.includes(i), past = !on && i < a0, x = px(i), r = on ? 0.13 : 0.08;
      s.addShape(pres.shapes.OVAL, { objectName: `!!tl-${i}`, x: x - r, y: ly - r, w: 2 * r, h: 2 * r, fill: on ? { color: c.acc } : past ? { color: c.acc, transparency: 55 } : { color: c.bg }, line: on ? { color: c.acc, width: 1.5 } : past ? { type: "none" } : { color: c.muted, width: 1.5 } });
      T(s, dt, { _label: "mốc", x: x - 0.75, y: ly - 0.45, w: 1.5, h: 0.28, fontSize: 12, bold: on, color: on ? c.acc : c.muted, align: "center" });
      if (!on || ev.length !== act.length) T(s, lb, { _label: "nhãn mốc", x: x - 0.78, y: ly + 0.17, w: 1.56, h: 0.3, fontSize: 12, color: c.muted, align: "center" }); });
  }
  // đường nối mốc -> thẻ: mỗi đường một tầng riêng (dưới hàng nhãn mốc) để không chập/cắt nhau
  const link = pts.length > 1 && ev.length === act.length, acts = [...act].sort((a, b) => a - b);
  const lvl = {};
  if (link) {
    const R = ev.map((_, i) => i).filter(i => cx(i) + cw / 2 >= px(acts[i])), Lf = ev.map((_, i) => i).filter(i => cx(i) + cw / 2 < px(acts[i]));
    R.slice().reverse().forEach((i, k) => { lvl[i] = k; }); Lf.forEach((i, k) => { lvl[i] = R.length ? Math.max(...Object.values(lvl)) + 1 + k : k; });
  }
  ev.forEach((e, i) => { const x = cx(i);
    box(s, x, cy, cw, ch, c.card, isLight(c) ? c.line : null);
    if (link) { const ax = px(acts[i]), mx = x + cw / 2, hy = ly + 0.58 + lvl[i] * 0.14;
      const ln = { color: c.acc, width: 1.5 };
      s.addShape(pres.shapes.LINE, { x: ax, y: ly + 0.13, w: 0, h: hy - ly - 0.13, line: ln });
      if (Math.abs(mx - ax) > 0.01) s.addShape(pres.shapes.LINE, { x: Math.min(ax, mx), y: hy, w: Math.abs(mx - ax), h: 0, line: ln });
      s.addShape(pres.shapes.LINE, { x: mx, y: hy, w: 0, h: cy - hy, line: Object.assign({ endArrowType: "triangle" }, ln) }); }
    T(s, e.date, { x: x + 0.3, y: cy + 0.25, w: cw - 0.6, h: 0.35, fontSize: 15, bold: true, color: c.acc });
    T(s, e.text, { x: x + 0.3, y: cy + 0.7, w: cw - 0.55, h: ch - 0.85, fontSize: 18, color: c.text }); });
};

// duel: tên mỗi bên là tab vắt qua mép thẻ
L.duel = async (s, c, d) => {
  kickerTitle(s, c, d);
  const dk = TH.d, y = BODY_Y + 0.25, h = 6.9 - y;
  // focus: bên nền đậm (mặc định phải) — đặt vào điều đang áp dụng / kết luận
  const fl = d.focus === "left", LT = [c.card, c.text, c.muted, c.acc, c.deep], DK = [dk.bg, dk.text, dk.muted, dk.acc, dk.acc];
  [[M, d.left, ...(fl ? DK : LT), fl], [6.95, d.right, ...(fl ? LT : DK), !fl]].forEach(([x, p, fill, tc, mc, ac, nb, side]) => {
    box(s, x, y, 5.78, h, fill, side ? null : c.line);
    if (side) corner(s, x, y, 5.78, dk.acc, 1.0, 86);
    tab(s, p.tag, x + 0.35, y, side ? dk.acc : c.acc, side ? dk.onAcc : c.onAcc);
    if (p.sub) T(s, p.sub, { x: x + 0.4, y: y + 0.38, w: 5.0, h: 0.5, fontSize: 13, color: mc });
    // paired: true → dòng i bên trái đối ứng dòng i bên phải (cùng số, cùng hàng, vạch nối mờ).
    // Không paired → chấm tròn, không đánh số: hai cột là hai danh sách độc lập, người xem không đọc thành cặp.
    (p.items || []).slice(0, 4).forEach((t, i) => { const yy = y + 1.0 + i * 0.84;
      if (d.paired) num(s, i + 1, x + 0.4, yy, 0.42, nb, side ? dk.onAcc : c.acc, 13);
      else s.addShape(pres.shapes.OVAL, { x: x + 0.53, y: yy + 0.14, w: 0.14, h: 0.14, fill: { color: side ? dk.acc : c.acc }, line: { type: "none" } });
      T(s, rich(t, tc, ac), { x: x + 1.0, y: yy + 0.06, w: 4.5, h: 0.72, fontSize: 16 }); });
  });
  if (d.paired) { const k = Math.min((d.left.items || []).length, (d.right.items || []).length, 4);
    for (let i = 0; i < k; i++) s.addShape(pres.shapes.LINE, { x: M + 5.78, y: y + 1.21 + i * 0.84, w: 6.95 - M - 5.78, h: 0, line: { color: c.acc, width: 1, dashType: "dash" } }); }
  if (d.paired) return; // vạch nối từng cặp đã chỉ hướng trái → phải; nút mũi tên giữa sẽ đè lên vạch
  s.addShape(pres.shapes.OVAL, { x: 6.42, y: y + h / 2 - 0.23, w: 0.46, h: 0.46, fill: { color: c.bg }, line: { color: c.acc, width: 1.25 } });
  s.addImage({ data: await icon("FaChevronRight", c.acc), x: 6.56, y: y + h / 2 - 0.09, w: 0.18, h: 0.18 });
};

L.stats = async (s, c, d) => {
  kickerTitle(s, c, d);
  if (d.sub) T(s, d.sub, { x: M, y: BODY_Y, w: 11.8, h: 0.8, fontSize: 16, color: c.muted });
  const it = (d.items || []).slice(0, 4), n = it.length, cw = (W - 2 * M - 0.8) / n, y1 = d.sub ? BODY_Y + 0.9 : BODY_Y + 0.1;
  const need = Math.max(0.4, ...it.map(st => realH(st.desc || "", { fontFace: TH.bodyFont, fontSize: 16 }, cw - 0.4, 1.0)));
  const h = Math.min(6.9 - y1, Math.max(3.0, 2.35 + need + 0.45)), y = y1 + (6.9 - y1 - h) / 2;
  box(s, M, y, W - 2 * M, h, c.card, isLight(c) ? c.line : null);
  corner(s, M, y, W - 2 * M, c.acc, 1.1, 88);
  it.forEach((st, i) => { const x = M + 0.4 + i * cw; mo(i + 1, (KIT && KIT.fits && KIT.motion) || "rise", i ? 60 : 100, i === 0);
    if (FORM()) { worldMarker(s, c, x + 0.16, y + 0.5, i === 0, true); cap(s, st.label, x + 0.5, y + 0.35, cw - 0.8, c.acc); } else
    cap(s, st.label, x, y + 0.35, cw - 0.3, c.acc);
    T(s, st.value, { x, y: y + 0.8, w: cw - 0.2, h: 1.25, fontSize: 54, fontFace: TH.numFont, italic: TH.numItalic, bold: TH.titleBold, color: tone(c, st.tone) });
    T(s, st.desc || "", { x, y: y + 2.15, w: cw - 0.4, h: h - 2.35, fontSize: 16, color: c.muted });
    mo(0); if (i) s.addShape(pres.shapes.LINE, { x: x - 0.25, y: y + 0.35, w: 0, h: h - 0.7, line: { color: c.line, width: 0.75 } }); });
};

L.agenda = async (s, c, d) => {
  if (d.photo && framed(d)) return agendaFrame(s, c, d);
  await artOrCut(s, d, () => art(d.art || rotArt(), c.acc, c.bad), 9.3, 2.35, 3.4, 3.06);
  kickerTitle(s, c, d);
  // ít câu → hàng cao hơn, chữ to hơn; khối các câu căn giữa vùng thân (2.3 → 6.9)
  const qs = (d.items || []).slice(0, 4), n = Math.max(1, qs.length), gap = 0.28, rh = Math.min(1.3, (6.75 - BODY_Y - 0.15 - gap * (n - 1)) / n);
  const fs = n <= 3 ? 21 : 19, y0 = BODY_Y + 0.15 + Math.max(0, (6.75 - BODY_Y - 0.15 - (rh * n + gap * (n - 1))) / 2), nd = Math.min(0.8, rh - 0.36);
  qs.forEach((q, i) => { const y = y0 + i * (rh + gap);
    // bộ chất liệu: ô số VẮT QUA MÉP TRÁI thẻ (nửa trong nửa ngoài) — mắt bám vào ranh giới, thẻ rộng thêm cho chữ
    const AW = d.art === "none" && !d.cutout ? W - 2 * M : 8.3; // không hình minh hoạ → thẻ giãn hết bề ngang (trước đây chừa trống 1/3 phải)
    const bx = KIT ? M + nd / 2 : M, bw = KIT ? AW - nd / 2 : AW;
    box(s, bx, y, bw, rh, c.card, c.line);
    if (FORM()) worldTile(s, c, M, y + (rh - nd) / 2, nd, nd, i === 0, String(i + 1).padStart(2, "0")); // mục lục: ô số mang dáng world (ô dấu, tờ lịch, container…)
    else num(s, String(i + 1).padStart(2, "0"), KIT ? M : M + 0.3, y + (rh - nd) / 2, nd, TH.d.bg, TH.d.acc, 20);
    T(s, rich(q, c.text, c.acc), { x: KIT ? M + nd + 0.3 : M + 0.55 + nd, y: y + 0.08, w: KIT ? AW - nd - 0.55 : AW - 0.85 - nd, h: rh - 0.16, fontSize: fs, valign: "middle" }); });
};

L.evidence = async (s, c, d) => {
  const y0 = kickerTitle(s, c, d);
  if (d.listTitle) cap(s, d.listTitle, M, y0, 5.5, c.muted);
  (d.items || []).slice(0, 3).forEach((it, i) => { const y = y0 + 0.5 + i * 1.3;
    num(s, i + 1, M, y, 0.5, c.acc, c.onAcc, 15);
    T(s, it.head, { x: M + 0.72, y: y - 0.05, w: 5.3, h: 0.45, fontSize: 20, bold: true, color: c.text });
    T(s, it.desc || "", { x: M + 0.72, y: y + 0.42, w: 5.3, h: 0.75, fontSize: 15, color: c.muted }); });
  if (d.quoteDoc) return quoteDoc(s, c, d);
  stack(s, 6.95, 2.3, 5.78, 4.6, c.acc);
  box(s, 6.95, 2.3, 5.78, 4.6, c.acc);
  s.addImage({ data: await icon("PiQuotesDuotone", c.onAcc), x: 7.3, y: 2.5, w: 0.8, h: 0.8, altText: "Dấu trích dẫn" });
  T(s, d.quote || "", { x: 7.35, y: 3.35, w: 5.0, h: 1.45, fontSize: 20, fontFace: TH.accentFont, italic: TH.accentItalic, color: c.onAcc });
  if (d.quoteBy) T(s, "— " + d.quoteBy, { x: 7.35, y: 4.82, w: 5.0, h: 0.35, fontSize: 13, color: c.onAcc });
  s.addShape(pres.shapes.LINE, { x: 7.35, y: 5.28, w: 5.0, h: 0, line: { color: c.onAcc, width: 0.75 } });
  if (d.foot) T(s, rich(d.foot, c.onAcc, c.onAcc), { x: 7.35, y: 5.42, w: 5.0, h: 1.3, fontSize: 14 });
};

// trích dẫn dạng "trang bản án": giấy trắng, tiêu đề văn bản, các dòng chữ mờ, câu trích được tô dạ quang — người xem thấy đây là nguyên văn trong hồ sơ
async function quoteDoc(s, c, d) {
  const x = 7.05, y = 2.25, w = 5.6, h = 4.4;
  s.addShape(pres.shapes.RECTANGLE, { x: x + 0.18, y: y + 0.18, w, h, fill: { color: c.line, transparency: 35 }, line: { type: "none" } });
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: "FFFFFF" }, line: { color: c.line, width: 1 }, shadow: { type: "outer", blur: 14, offset: 4, angle: 90, color: "000000", opacity: 0.12 } });
  T(s, d.quoteDoc, { _label: "quoteDoc", x: x + 0.4, y: y + 0.3, w: w - 0.8, h: 0.3, fontSize: 12, bold: true, color: c.text, align: "center", charSpacing: 1 });
  s.addShape(pres.shapes.LINE, { x: x + w / 2 - 0.6, y: y + 0.7, w: 1.2, h: 0, line: { color: c.text, width: 0.75 } });
  for (const [k, ww] of [0.95, 0.88, 0.92].entries()) s.addShape(pres.shapes.RECTANGLE, { x: x + 0.4, y: y + 0.95 + k * 0.22, w: (w - 0.8) * ww, h: 0.07, fill: { color: c.line }, line: { type: "none" } });
  const qy = y + 1.75, q = "“" + String(d.quote || "").replace(/^[“"]|[”"]$/g, "") + "”", qh = realH(q, { fontFace: TH.accentFont, fontSize: 18 }, w - 0.8, 1.6);
  s.addShape(pres.shapes.RECTANGLE, { x: x + 0.32, y: qy - 0.06, w: w - 0.64, h: qh + 0.16, fill: { color: TH.gold, transparency: 62 }, line: { type: "none" } }); // vệt dạ quang
  T(s, q, { _label: "quote", x: x + 0.4, y: qy, w: w - 0.8, h: qh + 0.08, fontSize: 18, fontFace: TH.accentFont, italic: TH.accentItalic, color: c.text });
  for (const [k, ww] of [0.9, 0.7].entries()) s.addShape(pres.shapes.RECTANGLE, { x: x + 0.4, y: qy + qh + 0.35 + k * 0.22, w: (w - 0.8) * ww, h: 0.07, fill: { color: c.line }, line: { type: "none" } });
  if (d.quoteBy) T(s, "— " + d.quoteBy, { x: x + 0.4, y: y + h - 0.95, w: w - 0.8, h: 0.3, fontSize: 13, color: c.muted, align: "right" });
  if (d.foot) T(s, rich(d.foot, c.text, c.acc), { x: M, y: FOOT_Y, w: W - 2 * M, h: FOOT_H, fontSize: 14 });
}

L.compare = async (s, c, d) => {
  kickerTitle(s, c, d);
  const dk = TH.d;
  // focus: bên được nhấn (khối đậm) — đặt vào điều ĐANG áp dụng / kết luận, không phải điều đã bị thay thế
  const fr = d.focus === "right";
  // thẻ cao VỪA CHỮ (đo bằng font thật), đặt giữa vùng thân — không kéo cao cố định để trống nửa dưới
  const tH = (p) => p && p.text ? realH(p.text, { fontFace: TH.bodyFont, fontSize: 16 }, 5.0, 0.5) : 0, nH = (p) => p && p.note ? realH(p.note, { fontFace: TH.bodyFont, fontSize: 13 }, 5.0, 0.4) : 0;
  const tx = Math.max(tH(d.left), tH(d.right)), nx = Math.max(nH(d.left), nH(d.right));
  const bh = Math.min(3.9, Math.max(2.6, 1.95 + tx + (nx ? 0.12 + nx : 0) + 0.35)), lim = d.footer ? 6.2 : 6.9, by = BODY_Y + Math.max(0, (lim - BODY_Y - bh) / 2);
  [[M, d.left, !fr], [6.95, d.right, fr]].map(([x, p, f]) => [x, p, f ? dk.bg : c.card, f ? dk.text : c.text, f ? dk.muted : c.muted, f]).forEach(([x, p, fill, tc, mc, f]) => { const side = !f;
    box(s, x, by, 5.78, bh, fill, side ? c.line : null);
    T(s, p.title, { x: x + 0.4, y: by + 0.25, w: 5.0, h: 0.4, fontSize: 18, bold: true, color: tc });
    if (p.tag) T(s, p.tag, { x: x + 0.4, y: by + 0.65, w: 5.0, h: 0.3, fontSize: 13, color: mc });
    T(s, p.value, { x: x + 0.4, y: by + 1.05, w: 5.0, h: 0.85, fontSize: 38, fontFace: TH.accentFont, italic: TH.accentItalic, bold: TH.accentBold, color: tone(side ? c : dk, p.tone) });
    T(s, p.text || "", { x: x + 0.4, y: by + 1.95, w: 5.0, h: Math.max(0.5, tx + 0.05), fontSize: 16, color: tc });
    if (p.note) T(s, p.note, { x: x + 0.4, y: by + 1.95 + tx + 0.12, w: 5.0, h: Math.max(0.4, nH(p) + 0.05), fontSize: 13, color: mc });
  });
  if (d.footer) { box(s, M, 6.38, W - 2 * M, 0.6, c.deep);
    T(s, rich(d.footer, c.text, c.bad), { x: M + 0.3, y: 6.38, w: 11.6, h: 0.6, fontSize: 15, valign: "middle" }); }
};

L.fork = async (s, c, d) => {
  kickerTitle(s, c, d);
  const ax = d.axis || [];
  s.addShape(pres.shapes.LINE, { x: M, y: 2.5, w: W - 2 * M, h: 0, line: { color: c.line, width: 2 } });
  ax.forEach(([dt, lb], i) => { const x = [M + 1.3, W / 2, W - M - 1.3][i]; const hi = i === 1; // nhãn rộng 2.6 nằm gọn trong lề
    s.addShape(pres.shapes.OVAL, { x: x - 0.12, y: 2.38, w: 0.24, h: 0.24, fill: { color: hi ? c.acc : c.bg }, line: { color: c.acc, width: 1.5 } });
    T(s, [{ text: dt, options: { bold: true, color: hi ? c.acc : c.text, breakLine: true } }, { text: lb, options: { color: c.muted } }], { x: x - 1.3, y: 2.68, w: 2.6, h: 0.6, fontSize: 13, align: "center" }); });
  const ck = d.checklist || { items: [] };
  box(s, M, 3.45, 3.6, 3.05, c.card, isLight(c) ? c.line : null);
  cap(s, ck.title || "", M + 0.3, 3.7, 3.0, c.muted);
  for (const [i, it] of ck.items.slice(0, 3).entries()) { const y = 4.15 + i * 0.58;
    s.addImage({ data: await icon(it.ok ? "FaCheck" : "FaXmark", it.ok ? c.good : c.bad), x: M + 0.3, y: y + 0.06, w: 0.26, h: 0.26 });
    T(s, it.text, { x: M + 0.72, y, w: 2.7, h: 0.38, fontSize: 17, bold: true, color: c.text }); }
  if (ck.q) T(s, ck.q, { x: M + 0.3, y: 5.9, w: 3.1, h: 0.45, fontSize: 15, fontFace: TH.accentFont, italic: TH.accentItalic, color: c.acc });
  const picked = (d.branches || []).some(b => b.pick); // có "pick": cách được chọn nổi bật, cách còn lại mờ đi (người xem thấy ngay kết luận)
  (d.branches || []).slice(0, 2).forEach((b, i) => { const y = [3.45, 5.05][i], hi = picked ? !!b.pick : i === 0, dim = picked && !b.pick;
    const fill = hi ? c.acc : dim ? c.deep : c.card, tc = hi ? c.onAcc : dim ? c.muted : c.text;
    box(s, 4.55, y, 8.18, 1.45, fill, hi ? null : c.line);
    cap(s, b.tag, 4.85, y + 0.18, 3.3, hi ? c.onAcc : c.acc);
    T(s, b.head, { x: 4.85, y: y + 0.52, w: 3.3, h: 0.8, fontSize: 19, fontFace: TH.accentFont, italic: TH.accentItalic, color: tc });
    T(s, b.text, { x: 8.3, y: y + 0.16, w: 4.25, h: 0.8, fontSize: 15, color: tc });
    if (b.src) T(s, b.src, { x: 8.3, y: y + 0.95, w: 4.25, h: 0.42, fontSize: 12.5, color: hi ? c.onAcc : c.muted }); });
  if (d.footer) T(s, rich(d.footer, c.muted, c.bad), { x: M, y: FOOT_Y, w: W - 2 * M, h: FOOT_H, fontSize: 13 });
};

L.bignum = async (s, c, d) => {
  kickerTitle(s, c, d);
  const dk = TH.d;
  box(s, M, 2.3, 3.9, 4.6, dk.bg);
  corner(s, M, 2.3, 3.9, dk.acc, 1.2, 86);
  // khối số: số + đơn vị + mô tả là MỘT cụm, căn giữa theo chiều dọc thẻ tối (không dồn lên trên để trống nửa dưới)
  const ndH = d.numDesc ? realH(d.numDesc, { fontFace: TH.bodyFont, fontSize: 17 }, 3.2, 1.0) : 0;
  const gH = 2.05 + (d.unit ? 0.6 : 0) + (d.numDesc ? 0.15 + ndH : 0), gy = 2.3 + Math.max(0.05, (4.6 - gH) / 2);
  T(s, d.num, { x: M + 0.35, y: gy, w: 3.4, h: 2.05, fontSize: 120, fontFace: TH.numFont, italic: TH.numItalic, bold: TH.titleBold, color: dk.acc });
  // vòng khoanh vẽ tay ôm ĐÚNG bề rộng con số (trước đây cố định 2.5 in → số 1 chữ số bị khoanh lệch, thừa một nửa vòng)
  { const nw = Math.min(3.3, (textW(String(d.num), { fontFace: TH.numFont, fontSize: 120, italic: TH.numItalic, bold: TH.titleBold }) || 2.2) + 0.5);
    await mark(s, "ellipse", M + 0.35 - 0.25, gy + 0.2, nw, 1.75, TH.gold, 4); }
  if (d.unit) T(s, d.unit, { x: M + 0.4, y: gy + 2.0, w: 3, h: 0.5, fontSize: 26, fontFace: TH.accentFont, italic: TH.accentItalic, color: dk.text });
  if (d.numDesc) T(s, d.numDesc, { x: M + 0.4, y: gy + 2.05 + (d.unit ? 0.6 : 0) + 0.15, w: 3.2, h: Math.max(0.5, ndH + 0.05), fontSize: 17, color: dk.muted });
  const days = Array.isArray(d.days) ? dayRange(d.days[0], d.days[1]) : null, conds = (d.conds || []).slice(0, 2);
  // thẻ điều kiện cao vừa chữ; phần còn lại của cột phải chia cho lịch ngày / chú thích, khoảng cách đều 0.3 in
  // cột phải phải nằm gọn trên hàng chú thích (nếu có): lịch + nhãn hai đầu cao 0.94 in; không có lịch thì chú thích nằm ngay dưới thẻ
  const noteH = !days && d.note ? realH(rich(d.note, c.muted, c.text), { fontFace: TH.bodyFont, fontSize: 15 }, 7.88, 0.8) + 0.05 : 0;
  const colLim = (days && d.note ? FOOT_Y - 0.12 : 6.9) - 2.3;
  let gap = 0.25, minH = 1.15, padB = 0.3, chs, colH;
  for (let k = 0; k < 3; k++) { // thiếu chỗ (chữ dài / font rộng) → thu khoảng cách trước, không thu cỡ chữ
    chs = conds.map(q => Math.max(minH, 0.62 + realH(q.desc || "", { fontFace: TH.bodyFont, fontSize: 16 }, 5.15, 0.4) + padB));
    colH = (d.condTitle ? 0.42 : 0) + chs.reduce((a, h) => a + h, 0) + gap * Math.max(0, chs.length - 1) + (days ? 0.1 + 0.94 : 0) + (noteH ? 0.25 + noteH : 0);
    if (colH <= colLim) break; gap = 0.18; minH = 1.0; padB = 0.2; }
  let cy = 2.3 + Math.max(0, (colLim - colH) / 2);
  if (d.condTitle) { cap(s, d.condTitle, 4.85, cy, 7.8, c.muted); cy += 0.42; }
  for (const [i, k] of conds.entries()) { const y = cy, ch = chs[i], good = k.ok === "yes", na = k.ok === "na", col = good ? c.good : na ? c.muted : c.bad;
    // "na" = không áp dụng / khác loại (trung tính, xám, dấu gạch) — không dùng đỏ cho điều không tiêu cực
    box(s, 4.85, y, 7.88, ch, c.card, c.line);
    await circIcon(s, good ? "FaCheck" : k.ok === "no" ? "FaXmark" : na ? "FaMinus" : "FaQuestion", 5.15, y + (ch - 0.7) / 2, 0.7, c.deep, col);
    T(s, k.head, { x: 6.1, y: y + 0.16, w: 4.9, h: 0.45, fontSize: 20, bold: true, color: c.text });
    T(s, k.desc || "", { x: 6.1, y: y + 0.62, w: 5.15, h: ch - 0.72, fontSize: 16, color: c.muted });
    if (k.verdict) pill(s, k.verdict, 11.2, y + 0.2, 1.3, col);
    cy += ch + gap; }
  if (days) { // lịch ngày: mỗi ô một ngày, ô đầu/cuối là hai mốc — người nghe "thấy" độ ngắn của khoảng thời gian
    const n = days.length, gw = 7.88, cw = Math.min(0.62, (gw - 0.06 * (n - 1)) / n), x0 = 4.85, y = cy + 0.1;
    days.forEach((dt, i) => { const end = i === 0 || i === n - 1, x = x0 + i * (cw + 0.06);
      addT(s, String(dt.getUTCDate()), { _label: "ngày", shape: pres.shapes.RECTANGLE, x, y, w: cw, h: 0.48, fill: end ? { color: c.acc } : { color: c.acc, transparency: 82 }, line: { type: "none" },
        color: end ? c.onAcc : c.text, fontFace: TH.bodyFont, fontSize: 13, bold: end, align: "center", valign: "middle", margin: 0 }); });
    const lb = d.daysLabels || [];
    if (lb[0]) T(s, lb[0], { _label: "daysLabels[0]", x: x0, y: y + 0.54, w: 3.2, h: 0.3, fontSize: 13, bold: true, color: c.acc });
    if (lb[1]) T(s, lb[1], { _label: "daysLabels[1]", x: x0 + n * (cw + 0.06) - 0.06 - 3.2, y: y + 0.54, w: 3.2, h: 0.3, fontSize: 13, bold: true, color: c.acc, align: "right" });
    if (d.note) T(s, rich(d.note, c.muted, c.text), { _label: "chú thích", x: x0, y: FOOT_Y, w: gw, h: FOOT_H, fontSize: 13 }); // hàng chú thích, thẳng cột với lịch (bên trái là khối tối)
  } else if (d.note) T(s, rich(d.note, c.muted, c.text), { x: 4.85, y: cy - gap + 0.25, w: 7.88, h: Math.max(noteH, 0.4), fontSize: 15 });
};
// "09/9/2014" -> Date (UTC); null nếu sai
function parseD(t) { const m = String(t || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if (!m) return null; const x = new Date(Date.UTC(+m[3], +m[2] - 1, +m[1])); return isNaN(x) ? null : x; }
function dayRange(a, b) { const A = parseD(a), B = parseD(b); if (!A || !B || B < A) return null; const out = []; for (let t = A; t <= B && out.length < 32; t = new Date(t.getTime() + 864e5)) out.push(t); return out; }
const monthsBetween = (A, B) => (B.getUTCFullYear() - A.getUTCFullYear()) * 12 + (B.getUTCMonth() - A.getUTCMonth()) + (B.getUTCDate() - A.getUTCDate()) / 30;

// ---------- chart: biểu đồ + ô kết luận (insight) — người nghe đọc kết luận trước, biểu đồ là bằng chứng ----------
L.chart = async (s, c, d) => {
  const items = (d.items || []).slice(0, d.kind === "step" ? 20 : d.kind === "column" || d.kind === "line" ? 12 : d.kind === "waterfall" ? 8 : 6), dk = TH.d;
  // NGUYÊN NHÂN TẠI TỪNG NĂM (items[].why, chỉ kind column, tối đa 4): biểu đồ nhường đáy cho một hàng thẻ lý do,
  // mỗi thẻ một ô chữ, đánh số khớp với số tròn trên đúng cột đó — người nghe thấy "vì sao" ngay tại năm tăng/giảm,
  // không phải lật sang một slide "nguyên nhân chung cho cả giai đoạn".
  const WHY = d.kind === "column" ? items.map((it, i) => ({ it, i })).filter(q => q.it && q.it.why).slice(0, 4) : [];
  // thẻ lý do: rộng tối đa 2.6 in, chữ 14pt "năm · lý do" trong MỘT ô; chiều cao hàng thẻ đo theo câu dài nhất (tối đa 2.3 in)
  const WG = 0.15, WW = WHY.length ? Math.min(2.6, (7.85 - WG * (WHY.length - 1)) / WHY.length) : 0;
  const whyRuns = (it) => [{ text: String(it.label) + "  ", options: { bold: true, color: TH.l.text } }].concat(rich(String(it.why), TH.l.text, TH.l.acc));
  const whyTH = WHY.length ? Math.max(...WHY.map(({ it }) => realH(whyRuns(it), { fontFace: TH.bodyFont, fontSize: 14 }, WW - 0.62, 0.9))) : 0;
  const bot0 = d.note ? 6.5 : 6.95, whyH = WHY.length ? Math.min(2.3, Math.max(0.8, whyTH + 0.3) + 0.3) : 0;
  const y0 = kickerTitle(s, c, d), top = y0 + 0.15, bot = bot0 - whyH, cx = M, cw = 7.85;
  const BOX = []; BOX.obstacles = []; // khung thật của từng cột/thanh — để `annotate` khoanh đúng chỗ
  const col = (it, i, n) => it.tone === "bad" ? { color: c.bad } : it.tone === "muted" ? { color: c.muted } : it.focus || n === 1 ? { color: c.acc } : { color: c.acc, transparency: [55, 70, 82, 88, 92][Math.min(4, i)] };
  if (NATIVE && !WHY.length /* có why → vẽ bằng hình để đặt số tròn + thẻ lý do */ && ["bar", "column", "line", "donut"].includes(d.kind)) {
    // BIỂU ĐỒ GỐC CỦA POWERPOINT: chuột phải → Edit Data để sửa số. Màu lấy từ theme; nhãn giá trị bật sẵn.
    const two = items.some(it => it.value2 != null), names = Array.isArray(d.series) && d.series.length ? d.series : [d.unit || "Giá trị", "Chuỗi 2"];
    const labels = items.map(it => String(it.label)), data = [{ name: names[0], labels, values: items.map(it => +it.value || 0) }];
    if (two && d.kind !== "donut") data.push({ name: names[1] || "Chuỗi 2", labels, values: items.map(it => +it.value2 || 0) });
    const type = d.kind === "line" ? pres.charts.LINE : d.kind === "donut" ? pres.charts.DOUGHNUT : pres.charts.BAR;
    const cols = d.kind === "donut" ? items.map((it, i) => it.focus || i === 0 ? c.acc : mix(c.acc, "FFFFFF", 0.3 + 0.15 * i)) : [c.acc, TH.gold];
    s.addChart(type, data, { x: cx, y: top, w: cw, h: bot - top, barDir: d.kind === "bar" ? "bar" : "col", barGrouping: two && d.stack !== false && d.kind !== "line" ? "stacked" : "clustered",
      chartColors: cols, showValue: true, dataLabelColor: c.text, dataLabelFontSize: 12, dataLabelFontFace: TH.bodyFont, dataLabelPosition: d.kind === "donut" ? "outEnd" : undefined,
      showLegend: two || d.kind === "donut", legendPos: "t", legendFontSize: 12, legendColor: c.text, legendFontFace: TH.bodyFont,
      catAxisLabelColor: c.muted, catAxisLabelFontSize: 12, catAxisLabelFontFace: TH.bodyFont, valAxisHidden: true, valAxisMinVal: typeof d.base === "number" && d.kind === "line" ? d.base : undefined, valGridLine: { style: "none" }, catGridLine: { style: "none" },
      lineSize: 3, lineDataSymbol: "circle", lineDataSymbolSize: 8, holeSize: 60, showPercent: d.kind === "donut", showTitle: false, altText: d.title ? String(d.title).replace(/[\[\]]/g, "") : "Biểu đồ" });
  } else if (d.kind === "bar") {
    const mx = Math.max(...items.map(it => Math.abs(+it.value || 0)), 1), rh = Math.min(0.9, (bot - top) / Math.max(1, items.length)), bw = cw - 1.2;
    items.forEach((it, i) => { const y = top + i * rh, v = +it.value || 0, w = Math.max(0.04, bw * Math.abs(v) / mx), f = it.focus || items.every(q => !q.focus);
      T(s, it.label, { x: cx, y, w: cw, h: 0.32, fontSize: 15, bold: !!it.focus, color: c.text });
      s.addShape(pres.shapes.RECTANGLE, { x: cx, y: y + 0.36, w: bw, h: 0.3, fill: { color: c.line, transparency: 55 }, line: { type: "none" } });
      s.addShape(pres.shapes.RECTANGLE, Object.assign({ x: cx, y: y + 0.36, w, h: 0.3, fill: it.tone === "bad" ? { color: c.bad } : f ? { color: c.acc } : { color: c.muted, transparency: 30 }, line: { type: "none" } }, hatchOf(it, c, it.tone === "bad" ? c.bad : f ? c.acc : c.muted)));
      if (!it.hatch) worldBar(s, c, cx, y + 0.36, w, 0.3, false);
      BOX[i] = { x: cx, y, w: w + 0.75, h: 0.66 }; // gồm cả nhãn tên và số
      T(s, (it.display || fmtNum(v)) + (d.unit ? " " + d.unit : ""), { _label: "giá trị", x: cx + w + 0.12, y: y + 0.3, w: 1.6, h: 0.42, fontSize: 15, bold: true, color: it.tone === "bad" ? c.bad : f ? c.acc : c.muted, valign: "middle" }); });
  } else if (d.kind === "donut") {
    const tot = items.reduce((a, it) => a + Math.max(0, +it.value || 0), 0) || 1, D = Math.min(3.9, bot - top), dx = cx + 0.1, dy = top + (bot - top - D) / 2;
    let a = 270;
    items.forEach((it, i) => { const sweep = 360 * Math.max(0, +it.value || 0) / tot; if (sweep <= 0) return;
      s.addShape(pres.shapes.BLOCK_ARC, { x: dx, y: dy, w: D, h: D, angleRange: [a % 360, (a + sweep - (items.length > 1 ? 1.2 : 0)) % 360 || 360], arcThicknessRatio: 0.26, fill: col(it, i, items.length), line: { type: "none" } });
      a += sweep; });
    worldRing(s, c, dx, dy, D);
    const f = items.find(it => it.focus) || items[0];
    T(s, d.center || Math.round(100 * (+f.value || 0) / tot) + "%", { _label: "giữa vành", x: dx, y: dy + D / 2 - 0.5, w: D, h: 0.75, fontSize: 40, fontFace: TH.numFont, italic: TH.numItalic, bold: TH.titleBold, color: c.text, align: "center", valign: "middle" });
    const lx = dx + D + 0.45, lh = Math.min(0.75, (bot - top) / Math.max(1, items.length)), ly = top + (bot - top - lh * items.length) / 2;
    items.forEach((it, i) => { const y = ly + i * lh;
      s.addShape(pres.shapes.RECTANGLE, { x: lx, y: y + 0.08, w: 0.22, h: 0.22, fill: col(it, i, items.length), line: { type: "none" } });
      T(s, it.label, { x: lx + 0.36, y, w: cx + cw - lx - 1.3, h: lh - 0.05, fontSize: 15, bold: !!it.focus, color: c.text });
      T(s, it.display || Math.round(100 * (+it.value || 0) / tot) + "%", { _label: "giá trị", x: cx + cw - 0.95, y, w: 0.95, h: 0.38, fontSize: 15, bold: true, color: c.text, align: "right" }); });
  } else if (d.kind === "slope") {
    // trước/sau: mỗi dòng là một đường nối giá trị ở mốc trước → mốc sau; trục từ 0 để độ dốc trung thực
    const mx = Math.max(...items.flatMap(it => [+it.value || 0, +it.after || 0]), 1), xa = cx + 3.1, xb = cx + cw - 2.0, ya = top + 0.75, yh = bot - ya - 0.25;
    const Y = (v) => ya + yh * (1 - v / mx), ends = d.ends || ["", ""];
    for (const [x, t] of [[xa, ends[0]], [xb, ends[1]]]) {
      s.addShape(pres.shapes.LINE, { x, y: ya - 0.1, w: 0, h: yh + 0.1, line: { color: c.line, width: 1.25 } });
      T(s, t, { _label: "ends", x: x - 1.2, y: top, w: 2.4, h: 0.4, fontSize: 15, bold: true, color: c.text, align: "center" }); }
    const lab = (v) => fmtNum(v) + (d.unit ? " " + d.unit : "");
    // tách nhãn khi hai dòng quá gần nhau
    const place = (key) => { const ys = items.map((it, i) => ({ i, y: Y(+it[key] || 0) })).sort((a, b) => a.y - b.y);
      for (let k = 1; k < ys.length; k++) if (ys[k].y - ys[k - 1].y < 0.42) ys[k].y = ys[k - 1].y + 0.42; return Object.fromEntries(ys.map(q => [q.i, q.y])); };
    const LA = place("value"), LB = place("after");
    items.forEach((it, i) => { const f = it.focus || items.every(q => !q.focus), cl = it.tone === "bad" ? c.bad : f ? c.acc : c.muted;
      const y1 = Y(+it.value || 0), y2 = Y(+it.after || 0);
      s.addShape(pres.shapes.LINE, { x: xa, y: Math.min(y1, y2), w: xb - xa, h: Math.max(0.001, Math.abs(y2 - y1)), flipV: y2 < y1, line: { color: cl, width: f ? 3.5 : 2.25 } });
      for (const [x, y] of [[xa, y1], [xb, y2]]) s.addShape(pres.shapes.OVAL, { x: x - 0.1, y: y - 0.1, w: 0.2, h: 0.2, fill: { color: cl }, line: { color: c.bg, width: 1.5 } });
      T(s, [{ text: it.label + "  ", options: { color: c.muted, bold: false } }, { text: lab(+it.value || 0), options: { color: cl, bold: true } }], { _label: `items[${i}]`, x: cx, y: LA[i] - 0.2, w: xa - cx - 0.18, h: 0.4, fontSize: 14, align: "right", valign: "middle" });
      const dv = (+it.after || 0) - (+it.value || 0);
      T(s, [{ text: lab(+it.after || 0), options: { color: cl, bold: true } }, { text: dv ? "  " + fmtN(dv) : "", options: { color: c.muted, bold: false } }], { _label: `items[${i}].after`, x: xb + 0.18, y: LB[i] - 0.2, w: cx + cw - xb - 0.18, h: 0.4, fontSize: 14, valign: "middle" }); });
  } else if (d.kind === "column") {
    // CỘT THEO THỜI GIAN: năm nằm trên trục ngang (đọc trái → phải), đủ các năm (≤ 12) — không chọn lọc vài năm.
    // value2 + series: chuỗi thứ hai, chồng lên (stack) hoặc đứng cạnh; giá trị âm đi xuống dưới trục, màu bad.
    // bands: dải nền đánh dấu giai đoạn (COVID-19, luật mới…) — người xem thấy "vì sao" ngay trên hình.
    const n = Math.max(1, items.length), two = items.some(it => it.value2 != null), stk = two && d.stack !== false;
    const tot = (it) => (+it.value || 0) + (stk ? Math.max(0, +it.value2 || 0) : 0);
    const hi = Math.max(0, ...items.map(it => Math.max(tot(it), two && !stk ? +it.value2 || 0 : 0))), lo = Math.min(0, ...items.map(it => Math.min(+it.value || 0, two ? +it.value2 || 0 : 0)));
    // hàng đầu: chú giải chuỗi + đơn vị (bên trái, trên cột — không đè số của cột cao nhất); cột âm: nhãn năm nằm TRÊN trục, số nằm dưới đáy cột
    const leg = (two && Array.isArray(d.series)) || d.unit ? 0.45 : 0, cTop = top + 0.45 + leg + (WHY.length ? 0.36 : 0) /* chỗ cho số tròn của why trên cột cao nhất */, xLab = lo < 0 ? 0.36 : 0.38, cBot = bot - xLab, H0 = cBot - cTop, span = (hi - lo) || 1;
    const Y = (v) => cTop + H0 * (hi - v) / span, base = Y(0), slot = cw / n, bw = slot * (two && !stk ? 0.36 : 0.6);
    const anyF = items.some(it => it.focus), fill = (it, k) => it.tone === "bad" || (+it.value || 0) < 0 ? c.bad : k === 2 ? TH.gold : c.acc;
    const tr = (it) => anyF && !it.focus ? 45 : 0, fz = n > 8 ? 12 : 13.5;
    // dải giai đoạn (vẽ trước cột)
    for (const b of (d.bands || [])) { const i0 = items.findIndex(it => String(it.label) === String(b.from)), i1 = items.findIndex(it => String(it.label) === String(b.to)); if (i0 < 0 || i1 < i0) continue;
      s.addShape(pres.shapes.RECTANGLE, { x: cx + i0 * slot + 0.03, y: cTop - 0.35, w: (i1 - i0 + 1) * slot - 0.06, h: cBot - cTop + 0.35, fill: { color: c.bad, transparency: 92 }, line: { type: "none" } });
      if (b.label) T(s, b.label, { _label: "dải", x: cx + i0 * slot, y: cTop - 0.38, w: (i1 - i0 + 1) * slot, h: 0.3, fontSize: 12, bold: true, color: c.bad, align: "center" }); }
    let lx = cx;
    if (two && Array.isArray(d.series)) d.series.slice(0, 2).forEach((nm, k) => { const tw = fitW(nm, { fontFace: TH.bodyFont, fontSize: 13 }, 0.1, 0.1, 3);
      s.addShape(pres.shapes.RECTANGLE, { x: lx, y: top + 0.07, w: 0.24, h: 0.24, fill: { color: k ? TH.gold : c.acc }, line: { type: "none" } });
      T(s, nm, { _label: "series", x: lx + 0.32, y: top, w: tw, h: 0.38, fontSize: 13, color: c.text, valign: "middle" }); lx += 0.32 + tw + 0.4; });
    if (d.unit) { const t = "Đơn vị: " + d.unit, tw = fitW(t, { fontFace: TH.bodyFont, fontSize: 12 }, 0.1, 0.1, 3.5); T(s, t, { _label: "unit", x: lx, y: top, w: tw, h: 0.38, fontSize: 12, color: c.muted, valign: "middle" }); }
    s.addShape(pres.shapes.LINE, { x: cx, y: base, w: cw, h: 0, line: { color: c.text, width: 1 } });
    // nhãn giá trị: đủ hết khi ít cột; nhiều cột thì chỉ đầu, cuối, cột nhấn, cột âm, đỉnh — tránh rừng số
    const vmax = Math.max(...items.map(tot)), show = (it, i) => n <= 8 || i === 0 || i === n - 1 || it.focus || it.tone === "bad" || (+it.value || 0) < 0 || tot(it) === vmax;
    items.forEach((it, i) => { const v = +it.value || 0, x = cx + i * slot + (slot - bw * (two && !stk ? 2 : 1)) / 2;
      const y1 = Math.min(Y(v), base), h1 = Math.max(0.02, Math.abs(Y(v) - base));
      s.addShape(pres.shapes.RECTANGLE, Object.assign({ x, y: y1, w: bw, h: h1, fill: { color: fill(it, 1), transparency: tr(it) }, line: { type: "none" } }, hatchOf(it, c, fill(it, 1))));
      if (!two && !it.hatch && v >= 0) worldBar(s, c, x, y1, bw, h1, true);
      let topY = y1;
      if (two) { const v2 = Math.max(0, +it.value2 || 0);
        if (stk) { const y2 = Y(v + v2); s.addShape(pres.shapes.RECTANGLE, { x, y: y2, w: bw, h: Math.max(0.02, Y(v) - y2), fill: { color: TH.gold, transparency: tr(it) }, line: { type: "none" } }); topY = y2; }
        else { const y2 = Y(v2); s.addShape(pres.shapes.RECTANGLE, { x: x + bw, y: y2, w: bw, h: Math.max(0.02, base - y2), fill: { color: TH.gold, transparency: tr(it) }, line: { type: "none" } }); topY = Math.min(topY, y2); } }
      BOX[i] = { x, y: Math.min(topY, y1) - 0.32, w: bw * (two && !stk ? 2 : 1), h: Math.max(base, y1 + h1) - Math.min(topY, y1) + 0.32, top: v < 0 ? base - 0.36 /* cột âm: nhãn năm nằm TRÊN trục */ : show(it, i) ? Math.min(topY, y1) - 0.32 : Math.min(topY, y1) }; // top: đỉnh thật (nhãn giá trị / nhãn năm) — số tròn why bám sát đây
      if (show(it, i)) { const neg = v < 0, lab = it.display || fmtNum(stk ? tot(it) : v);
        T(s, lab, { _label: "giá trị", x: cx + i * slot - 0.2, y: neg ? Y(v) + 0.03 : topY - 0.32, w: slot + 0.4, h: 0.3, fontSize: fz, bold: true, color: neg || it.tone === "bad" ? c.bad : it.focus || !anyF ? c.text : c.muted, align: "center" }); }
      T(s, String(it.label), { _label: "năm", x: cx + i * slot - 0.1, y: v < 0 ? base - 0.34 : lo < 0 ? base + 0.04 : cBot + 0.06, w: slot + 0.2, h: 0.3, fontSize: fz, bold: !!it.focus, color: it.focus ? c.text : c.muted, align: "center" }); });
  } else if (d.kind === "step") {
    // BẬC THANG: giá trị đổi theo từng mốc rồi GIỮ NGUYÊN tới mốc sau (lộ trình tuổi hưu, lương cơ sở qua các năm) — ≤ 20 mốc.
    // base = gốc trục dọc (mặc định 0); khác 0 thì in rõ trên trục để không phóng đại chênh lệch.
    const n = Math.max(1, items.length), two = items.some(it => it.value2 != null);
    const vals = items.flatMap(it => [+it.value, two && it.value2 != null ? +it.value2 : NaN]).filter(v => !isNaN(v));
    const b0 = typeof d.base === "number" ? d.base : 0, hi = Math.max(b0 + 1e-9, ...vals), span = (hi - b0) || 1;
    const leg = (two && Array.isArray(d.series)) || d.unit ? 0.45 : 0, cTop = top + 0.55 + leg, cBot = bot - 0.4, H0 = cBot - cTop, ax = cx + 0.6, aw = cw - 0.6, slot = aw / n;
    const Y = (v) => cBot - H0 * (v - b0) / span, X = (i) => ax + i * slot, LINE = pres.shapes.LINE;
    let lx = cx;
    if (two && Array.isArray(d.series)) d.series.slice(0, 2).forEach((nm, k) => { const tw = fitW(nm, { fontFace: TH.bodyFont, fontSize: 13 }, 0.1, 0.1, 2.6);
      s.addShape(LINE, { x: lx, y: top + 0.19, w: 0.26, h: 0, line: { color: k ? TH.gold : c.acc, width: 3.5 } });
      T(s, nm, { _label: "series", x: lx + 0.34, y: top, w: tw, h: 0.38, fontSize: 13, color: c.text, valign: "middle" }); lx += 0.34 + tw + 0.4; });
    if (d.unit) { const t = "Đơn vị: " + d.unit, tw = fitW(t, { fontFace: TH.bodyFont, fontSize: 12 }, 0.1, 0.1, 3.5); T(s, t, { _label: "unit", x: lx, y: top, w: tw, h: 0.38, fontSize: 12, color: c.muted, valign: "middle" }); }
    const r2 = (v) => Math.round(v * 100) / 100;
    [b0, b0 + span / 2, hi].forEach((v, k) => { const y = Y(v);
      if (!k && FORM()) worldLink(s, c, ax, y, ax + aw); else s.addShape(LINE, { x: ax, y, w: aw, h: 0, line: { color: k ? c.line : c.text, width: k ? 0.75 : 1, dashType: k ? "dash" : "solid" } });
      T(s, fmtNum(r2(v)), { _label: "trục", x: cx - 0.05, y: y - 0.15, w: 0.55, h: 0.3, fontSize: 12, color: c.muted, align: "right" }); });
    const draw = (key, color) => { for (let i = 0; i < n; i++) { const v = +items[i][key]; if (items[i][key] == null || isNaN(v)) continue; const y = Y(v);
      s.addShape(LINE, { x: X(i), y, w: slot, h: 0, line: { color, width: 3.25 } });
      const nx = items[i + 1], v2 = nx && nx[key] != null ? +nx[key] : NaN;
      if (!isNaN(v2) && v2 !== v) { const y2 = Y(v2); s.addShape(LINE, { x: X(i + 1), y: Math.min(y, y2), w: 0, h: Math.abs(y2 - y), line: { color, width: 3.25 } }); } } };
    draw("value", c.acc); if (two) draw("value2", TH.gold);
    const every = Math.ceil(n / 8);
    items.forEach((it, i) => {
      if (i % every === 0 || i === n - 1 || it.focus) T(s, String(it.label), { _label: "mốc", x: X(i) + slot / 2 - 0.45, y: cBot + 0.06, w: 0.9, h: 0.3, fontSize: 12, bold: !!it.focus, color: it.focus ? c.text : c.muted, align: "center" });
      if (!(it.focus || i === 0 || i === n - 1)) return;
      for (const [key, col, dsp, up] of [["value", c.acc, it.display, true], ["value2", TH.gold, it.display2, false]]) { if (it[key] == null) continue;
        const v = +it[key], y = Y(v), hiFirst = two && it.value2 != null && +it.value2 > +it.value, above = hiFirst ? !up : up;
        if (FORM() && col === c.acc) worldMarker(s, c, X(i) + slot / 2, y, false, true); else s.addShape(pres.shapes.OVAL, { x: X(i) + slot / 2 - 0.09, y: y - 0.09, w: 0.18, h: 0.18, fill: { color: col }, line: { color: c.bg, width: 1 } });
        T(s, dsp || fmtNum(r2(v)), { _label: "giá trị", x: Math.min(X(i) + slot / 2 - 0.8, cx + cw + 0.4 - 1.6), y: above ? y - 0.42 : y + 0.12, w: 1.6, h: 0.3, fontSize: 13, bold: true, color: key === "value" ? c.acc : c.text, align: "center" }); } });
  } else if (d.kind === "line") {
    // ĐƯỜNG: xu hướng liên tục theo thời gian (≤ 12 mốc, 1–2 chuỗi). base = gốc trục dọc khi giá trị xa 0 (ghi rõ ở note).
    const n = Math.max(1, items.length), two = items.some(it => it.value2 != null);
    const vals = items.flatMap(it => [+it.value, two && it.value2 != null ? +it.value2 : NaN]).filter(v => !isNaN(v));
    const b0 = typeof d.base === "number" ? d.base : Math.min(0, ...vals), hi = Math.max(b0 + 1e-9, ...vals), span = (hi - b0) || 1;
    const leg = (two && Array.isArray(d.series)) || d.unit ? 0.45 : 0, cTop = top + 0.55 + leg, cBot = bot - 0.4, H0 = cBot - cTop, ax = cx + 0.6, aw = cw - 0.6, slot = aw / n;
    const Y = (v) => cBot - H0 * (v - b0) / span, X = (i) => ax + slot * (i + 0.5), LN = pres.shapes.LINE;
    let lx = cx;
    if (two && Array.isArray(d.series)) d.series.slice(0, 2).forEach((nm, k) => { const tw = fitW(nm, { fontFace: TH.bodyFont, fontSize: 13 }, 0.1, 0.1, 2.6);
      s.addShape(LN, { x: lx, y: top + 0.19, w: 0.26, h: 0, line: { color: k ? TH.gold : c.acc, width: 3.5 } });
      T(s, nm, { _label: "series", x: lx + 0.34, y: top, w: tw, h: 0.38, fontSize: 13, color: c.text, valign: "middle" }); lx += 0.34 + tw + 0.4; });
    if (d.unit) { const t = "Đơn vị: " + d.unit, tw = fitW(t, { fontFace: TH.bodyFont, fontSize: 12 }, 0.1, 0.1, 3.5); T(s, t, { _label: "unit", x: lx, y: top, w: tw, h: 0.38, fontSize: 12, color: c.muted, valign: "middle" }); }
    const r2 = (v) => Math.round(v * 100) / 100;
    [b0, b0 + span / 2, hi].forEach((v, k) => { const y = Y(v);
      if (!k && FORM()) worldLink(s, c, ax, y, ax + aw); else s.addShape(LN, { x: ax, y, w: aw, h: 0, line: { color: k ? c.line : c.text, width: k ? 0.75 : 1, dashType: k ? "dash" : "solid" } });
      T(s, fmtNum(r2(v)), { _label: "trục", x: cx - 0.05, y: y - 0.15, w: 0.55, h: 0.3, fontSize: 12, color: c.muted, align: "right" }); });
    const seg = (x1, y1, x2, y2, color, w) => s.addShape(LN, { x: x1, y: Math.min(y1, y2), w: x2 - x1, h: Math.max(0.001, Math.abs(y2 - y1)), flipV: y2 < y1, line: { color, width: w } });
    for (const [key, col] of [["value", c.acc], ["value2", TH.gold]]) { if (key === "value2" && !two) continue;
      for (let i = 0; i < n - 1; i++) { const a = items[i][key], bb = items[i + 1][key]; if (a == null || bb == null) continue; seg(X(i), Y(+a), X(i + 1), Y(+bb), col, 3); }
      items.forEach((it, i) => { if (it[key] == null) return; const y = Y(+it[key]), big = it.focus || i === 0 || i === n - 1;
        if (big && key === "value" && FORM()) worldMarker(s, c, X(i), y, !!it.focus, true); else // mốc chính của đường mang dáng world (dấu tròn, ô ngày, container…)
        s.addShape(pres.shapes.OVAL, { x: X(i) - (big ? 0.09 : 0.06), y: y - (big ? 0.09 : 0.06), w: big ? 0.18 : 0.12, h: big ? 0.18 : 0.12, fill: { color: col }, line: { color: c.bg, width: 1 } });
        if (big) { const up = key === "value" ? !(two && it.value2 != null && +it.value2 > +it.value) : (two && +it.value2 > +it.value);
          T(s, (key === "value" ? it.display : it.display2) || fmtNum(r2(+it[key])), { _label: "giá trị", x: Math.min(X(i) - 0.8, cx + cw + 0.4 - 1.6), y: up ? y - 0.42 : y + 0.12, w: 1.6, h: 0.3, fontSize: 13, bold: true, color: key === "value" ? c.acc : c.text, align: "center" }); } }); }
    const every = Math.ceil(n / 8);
    items.forEach((it, i) => { if (i % every === 0 || i === n - 1 || it.focus) T(s, String(it.label), { _label: "mốc", x: X(i) - 0.45, y: cBot + 0.06, w: 0.9, h: 0.3, fontSize: 12, bold: !!it.focus, color: it.focus ? c.text : c.muted, align: "center" }); });
  } else if (d.kind === "waterfall") {
    // THÁC NƯỚC: từ một số ban đầu, cộng / trừ từng khoản ra số cuối (tính thuế, bồi thường, lương thực nhận). total: true = cột tổng (từ 0).
    const n = Math.max(1, items.length); let run = 0; const bars = items.map(it => { const v = +it.value || 0;
      if (it.total) { const r = { it, a: 0, b: it.value != null ? v : run, tot: true }; run = r.b; return r; }
      const r = { it, a: run, b: run + v, tot: false }; run += v; return r; });
    const lo = Math.min(0, ...bars.flatMap(q => [q.a, q.b])), hi = Math.max(0, ...bars.flatMap(q => [q.a, q.b])), span = (hi - lo) || 1;
    const cTop = top + 0.5 + (d.unit ? 0.4 : 0), cBot = bot - 0.62, H0 = cBot - cTop, slot = cw / n, bw = slot * 0.62, Y = (v) => cTop + H0 * (hi - v) / span;
    if (d.unit) T(s, "Đơn vị: " + d.unit, { _label: "unit", x: cx, y: top, w: 3.5, h: 0.38, fontSize: 12, color: c.muted, valign: "middle" });
    if (FORM()) worldLink(s, c, cx, Y(0), cx + cw); else s.addShape(pres.shapes.LINE, { x: cx, y: Y(0), w: cw, h: 0, line: { color: c.text, width: 1 } });
    bars.forEach((q, i) => { const x = cx + i * slot + (slot - bw) / 2, y1 = Y(Math.max(q.a, q.b)), h = Math.max(0.03, Math.abs(Y(q.a) - Y(q.b))), neg = !q.tot && q.b < q.a;
      const col = q.tot ? c.acc : neg ? c.bad : c.good;
      s.addShape(pres.shapes.RECTANGLE, { x, y: y1, w: bw, h, fill: { color: col, transparency: q.tot || q.it.focus ? 0 : 25 }, line: { type: "none" } }); if (q.tot) worldBar(s, c, x, y1, bw, h, true);
      if (i < n - 1) s.addShape(pres.shapes.LINE, { x: x + bw, y: Y(q.b), w: slot - bw, h: 0, line: { color: c.muted, width: 1, dashType: "dash" } });
      const lab = q.it.display || ((q.tot ? "" : (q.b - q.a >= 0 ? "+" : "−")) + fmtNum(Math.abs(q.tot ? q.b : q.b - q.a)));
      T(s, lab, { _label: "giá trị", x: cx + i * slot - 0.15, y: y1 - 0.34, w: slot + 0.3, h: 0.3, fontSize: n > 6 ? 12 : 13.5, bold: true, color: q.tot ? c.text : neg ? c.bad : c.good, align: "center" });
      T(s, String(q.it.label), { _label: `items[${i}].label`, x: cx + i * slot, y: cBot + 0.08, w: slot, h: 0.55, fontSize: 12.5, bold: q.tot || !!q.it.focus, color: q.tot ? c.text : c.muted, align: "center" }); });
  } else if (d.kind === "gantt") {
    // GANTT THEO SỐ NGÀY / THÁNG: from, to là SỐ (ngày thứ…) — thời hạn tố tụng, thủ tục tính từ một mốc chung. Có ngày dd/mm/yyyy thì dùng span.
    const g = items.map(it => ({ it, A: +it.from || 0, B: +it.to || 0 })), T0 = Math.min(0, ...g.map(q => q.A)), T1 = Math.max(...g.map(q => q.B), T0 + 1);
    const lw = 2.6, ax = cx + lw, aw = cw - lw, X = (v) => ax + aw * (v - T0) / (T1 - T0), rh = Math.min(0.85, (bot - top - 0.75) / Math.max(1, g.length)), ry = top + 0.45;
    const step = [1, 2, 5, 7, 10, 15, 30, 60, 90, 180, 365].find(k => (T1 - T0) / k <= 8) || 365;
    for (let v = Math.ceil(T0 / step) * step; v <= T1 + 1e-9; v += step) { const x = X(v);
      s.addShape(pres.shapes.LINE, { x, y: ry - 0.08, w: 0, h: rh * g.length + 0.08, line: { color: c.line, width: 0.75 } });
      T(s, String(v), { _label: "trục", x: x - 0.4, y: ry + rh * g.length + 0.04, w: 0.8, h: 0.28, fontSize: 12, color: c.muted, align: "center" }); }
    if (d.unit) T(s, d.unit, { _label: "unit", x: ax, y: ry + rh * g.length + 0.32, w: aw, h: 0.28, fontSize: 12, color: c.muted, align: "center" });
    g.forEach((q, i) => { const y = ry + i * rh, x1 = X(q.A), x2 = X(q.B);
      T(s, q.it.label, { _label: `items[${i}].label`, x: cx, y: y + 0.04, w: lw - 0.15, h: rh - 0.08, fontSize: 14.5, bold: !!q.it.focus, color: c.text, valign: "middle" });
      s.addShape(pres.shapes.RECTANGLE, { x: x1, y: y + 0.16, w: Math.max(0.06, x2 - x1), h: rh - 0.32, fill: col(q.it, i, g.length), line: { type: "none" } });
      const lab = q.it.display || (fmtNum(q.B - q.A) + (d.unit ? " " + String(d.unit).replace(/^(số\s+)?/i, "").split(" ")[0] : ""));
      const inside = x2 - x1 > 1.3, right = x2 + 1.55 <= cx + cw; // không đủ chỗ bên phải → nhãn nằm bên trái thanh
      T(s, lab, { _label: "giá trị", align: inside || right ? "left" : "right", x: inside ? x1 + 0.1 : right ? x2 + 0.08 : x1 - 1.58, y: y + 0.16, w: inside ? x2 - x1 - 0.15 : 1.5, h: rh - 0.32, fontSize: 13, bold: true, color: inside ? (q.it.focus || g.length === 1 ? c.onAcc : c.text) : c.text, valign: "middle" }); });
  } else if (d.kind === "progress") {
    // TIẾN ĐỘ / MỤC TIÊU: mỗi dòng một tỉ lệ 0–100 (+ target = vạch mục tiêu) — tỉ lệ bao phủ BHYT theo nhóm, mức hoàn thành chỉ tiêu.
    const rh = Math.min(0.95, (bot - top) / Math.max(1, items.length)), bw = cw - 1.3, y0 = top + Math.max(0, (bot - top - rh * items.length) / 2);
    items.forEach((it, i) => { const y = y0 + i * rh, v = Math.max(0, Math.min(100, +it.value || 0)), f = it.focus || items.every(q => !q.focus);
      T(s, it.label, { _label: `items[${i}].label`, x: cx, y, w: bw, h: 0.32, fontSize: 15, bold: !!it.focus, color: c.text });
      s.addShape(pres.shapes.RECTANGLE, { x: cx, y: y + 0.38, w: bw, h: 0.26, fill: { color: c.line, transparency: 40 }, line: { type: "none" } });
      s.addShape(pres.shapes.RECTANGLE, { x: cx, y: y + 0.38, w: Math.max(0.04, bw * v / 100), h: 0.26, fill: { color: it.tone === "bad" ? c.bad : f ? c.acc : c.muted }, line: { type: "none" } });
      if (it.target != null) { const tx = cx + bw * Math.max(0, Math.min(100, +it.target)) / 100; s.addShape(pres.shapes.LINE, { x: tx, y: y + 0.3, w: 0, h: 0.42, line: { color: c.text, width: 2.25 } }); }
      T(s, it.display || fmtNum(v) + "%", { _label: "giá trị", x: cx + bw + 0.12, y: y + 0.3, w: 1.15, h: 0.42, fontSize: 16, bold: true, color: it.tone === "bad" ? c.bad : f ? c.acc : c.muted, valign: "middle" }); });
    if (items.some(it => it.target != null)) T(s, "Vạch đứng = mục tiêu", { _label: "chú giải", x: cx, y: Math.min(bot - 0.02, y0 + rh * items.length + 0.02), w: 3.5, h: 0.28, fontSize: 12, color: c.muted });
  } else if (d.kind === "span") {
    const sp = items.map(it => ({ it, A: parseD(it.from), B: parseD(it.to) })).filter(q => q.A && q.B);
    const mk = (d.markers || []).map(m => ({ m, D: parseD(m.date) })).filter(q => q.D);
    const all = [...sp.flatMap(q => [q.A, q.B]), ...mk.map(q => q.D)];
    if (all.length) {
      const y0a = Math.min(...all.map(t => t.getUTCFullYear())), y1a = Math.max(...all.map(t => t.getUTCFullYear())) + 1;
      const T0 = Date.UTC(y0a, 0, 1), T1 = Date.UTC(y1a, 0, 1), lw = 2.3, ax = cx + lw, aw = cw - lw, X = (t) => ax + aw * (t - T0) / (T1 - T0);
      const rh = Math.min(1.1, (bot - 0.45 - top - 0.55) / Math.max(1, sp.length)), ry = top + 0.55 + Math.max(0, (bot - 0.45 - top - 0.55 - rh * sp.length) / 2 - 0.2);
      for (let y = y0a; y <= y1a; y++) { const x = X(Date.UTC(y, 0, 1));
        s.addShape(pres.shapes.LINE, { x, y: ry - 0.1, w: 0, h: rh * sp.length + 0.1, line: { color: c.line, width: 0.75 } });
        T(s, String(y), { _label: "năm", x: x - 0.4, y: ry + rh * sp.length + 0.05, w: 0.8, h: 0.3, fontSize: 13, color: c.muted, align: "center" }); } // nhãn năm ngay dưới vạch 01/01
      sp.forEach((q, i) => { const y = ry + i * rh, x1 = X(q.A), x2 = X(q.B), mo = monthsBetween(q.A, q.B);
        T(s, q.it.label, { x: cx, y: y + 0.08, w: lw - 0.15, h: rh - 0.12, fontSize: 15, bold: !!q.it.focus, color: c.text, valign: "middle" });
        s.addShape(pres.shapes.RECTANGLE, Object.assign({ x: x1, y: y + 0.18, w: Math.max(0.06, x2 - x1), h: rh - 0.36, fill: col(q.it, i, sp.length), line: { type: "none" } }, hatchOf(q.it, c, (col(q.it, i, sp.length) || {}).color || c.acc)));
        BOX[items.indexOf(q.it)] = { x: x1, y: y + 0.18, w: Math.max(0.06, x2 - x1), h: rh - 0.36 };
        const lab = q.it.display || (mo >= 2 ? "≈ " + Math.round(mo) + " tháng" : Math.round((q.B - q.A) / 864e5) + " ngày");
        // nhãn đặt ngoài thanh phải bám sát thanh và KHÔNG bị vạch mốc (luật đổi) cắt ngang — nếu không, người xem không biết nhãn thuộc thanh nào
        const lwid = fitW(lab, { fontFace: TH.bodyFont, fontSize: 14, bold: true }, 0.12, 0.11, 2.4), inside = x2 - x1 > lwid + 0.25;
        const clear = (a, b) => !mk.some(({ D }) => { const mx = X(D); return mx > a - 0.05 && mx < b + 0.05; });
        const R = [x2 + 0.1, x2 + 0.1 + lwid], Lf = [x1 - 0.1 - lwid, x1 - 0.1];
        const okR = R[1] <= cx + cw && clear(...R), okL = Lf[0] >= ax && clear(...Lf);
        const where = inside ? "in" : okR ? "r" : okL ? "l" : (R[1] <= cx + cw ? "r" : "l");
        if (where !== "in" && !(where === "r" ? okR : okL)) { // cả hai phía đều vướng mốc → nhãn xuống dưới tên hàng
          T(s, lab, { _label: "giá trị", x: cx, y: y + rh / 2 + 0.12, w: lw - 0.15, h: 0.3, fontSize: 13, bold: true, color: c.muted }); return; }
        const lx = where === "in" ? x1 + 0.12 : where === "r" ? R[0] : Lf[0], lwW = where === "in" ? x2 - x1 - 0.2 : lwid;
        T(s, lab, { _label: "giá trị", align: where === "l" ? "right" : "left", x: lx, y: y + 0.18, w: lwW, h: rh - 0.36, fontSize: 14, bold: true, color: where === "in" ? (q.it.focus || sp.length === 1 || q.it.tone ? c.onAcc : c.text) : c.text, valign: "middle" }); });
      mk.forEach(({ m, D }) => { const x = X(D); BOX.obstacles.push({ x: x - 0.12, y: top, w: 0.24, h: bot - top }, { x: x - 1.6, y: top - 0.05, w: 3.2, h: 0.4 }); // vạch mốc + nhãn mốc
        s.addShape(pres.shapes.LINE, { x, y: top + 0.35, w: 0, h: rh * sp.length + (ry - top - 0.35) + 0.1, line: { color: c.bad, width: 2, dashType: "dash" } });
        T(s, m.label, { _label: "mốc", x: x - 1.6, y: top, w: 3.2, h: 0.3, fontSize: 13, bold: true, color: c.bad, align: "center" }); });
    }
  }
  if (WHY.length) { const wy = bot + 0.3, wh = bot0 - wy, nd = 0.3;
    // thẻ đặt ngay dưới cột của nó (tâm thẻ ≈ tâm cột), đẩy sang phải nếu chồng thẻ trước, kéo về nếu tràn mép phải
    const xs = WHY.map(({ i }) => { const b = BOX[i]; return b ? b.x + b.w / 2 - WW / 2 : cx; });
    for (let j = 0; j < xs.length; j++) { xs[j] = Math.max(cx, j ? xs[j - 1] + WW + WG : xs[j]); }
    for (let j = xs.length - 1; j >= 0; j--) { xs[j] = Math.min(xs[j], (j < xs.length - 1 ? xs[j + 1] - WG : cx + cw) - WW); }
    WHY.forEach(({ it, i }, j) => { const b = BOX[i], wx = xs[j], lab = String(j + 1), col = it.tone === "bad" || (+it.value || 0) < 0 ? c.bad : c.acc;
      if (b) { // số tròn sát đỉnh thật của cột (hoặc nhãn giá trị), trùng số với thẻ lý do bên dưới
        const bx = b.x + b.w / 2 - nd / 2, by = Math.max(top, (b.top != null ? b.top : b.y) - nd - 0.04);
        num(s, lab, bx, by, nd, col, c.onAcc, 12);
        BOX.obstacles.push({ x: bx, y: by, w: nd, h: nd }); }
      box(s, wx, wy, WW, wh, c.card, c.line);
      num(s, lab, wx + 0.12, wy + 0.15, nd, col, c.onAcc, 12);
      T(s, whyRuns(it).map(r => ({ text: r.text, options: Object.assign({}, r.options, { color: r.options.color === TH.l.text ? c.text : r.options.color === TH.l.acc ? c.acc : r.options.color }) })), { _label: `items[${i}].why`, x: wx + 0.5, y: wy + 0.15, w: WW - 0.62, h: wh - 0.3, fontSize: 14, color: c.text }); }); }
  if (d.annotate && BOX[d.annotate.item]) await handNote(s, c, BOX[d.annotate.item], d.annotate.text, { x0: cx, y0: top - 0.1, x1: cx + cw, y1: bot }, BOX.filter((b, i) => b && i !== d.annotate.item).concat(BOX.obstacles));
  if (d.insight) { const x = 8.95, w = W - M - x;
    // thẻ kết luận nền SÁNG + vạch màu nhấn: khối nền đậm để dành cho điều cần nhấn nhất của cả bộ (compare/duel focus, statement)
    // cao vừa nội dung (không kéo dài hết vùng biểu đồ để lại đáy trống), đặt giữa theo chiều dọc
    const ty = d.insight.unit ? 2.0 : 1.5, th = realH(rich(d.insight.text || "", c.text, c.acc), { fontFace: TH.bodyFont, fontSize: 17 }, w - 0.7, 1.0); // đo đúng chữ sẽ vẽ (theme "son": chữ thường cũng in đậm)
    // ô kết luận ở cột phải, không chung bề ngang với hàng thẻ lý do (why) → dùng cả chiều cao vùng thân (bot0), không phải đáy biểu đồ đã co
    const ih = Math.min(bot0 - top + 0.1, ty + th + 0.4), iy = WHY.length ? bot0 - ih /* đáy thẳng hàng thẻ lý do */ : top - 0.1 + (bot0 - top + 0.1 - ih) / 2;
    stack(s, x, iy, w, ih, c.acc);
    box(s, x, iy, w, ih, c.card, c.line);
    s.addShape(pres.shapes.RECTANGLE, { x, y: iy, w: 0.08, h: ih, fill: { color: c.acc }, line: { type: "none" } });
    T(s, d.insight.value || "", { x: x + 0.35, y: iy + 0.3, w: w - 0.6, h: 1.2, fontSize: 58, fontFace: TH.numFont, italic: TH.numItalic, bold: TH.titleBold, color: c.acc });
    if (d.insight.unit) T(s, d.insight.unit, { x: x + 0.38, y: iy + 1.5, w: w - 0.6, h: 0.45, fontSize: 20, fontFace: TH.accentFont, italic: TH.accentItalic, color: c.text });
    T(s, rich(d.insight.text || "", c.text, c.acc), { x: x + 0.38, y: iy + ty + 0.1, w: w - 0.7, h: ih - ty - 0.3, fontSize: 17, color: c.text }); }
  const foot = d.note || "";
  if (foot) T(s, rich(foot, c.muted, c.text), { _label: "note", x: M, y: FOOT_Y, w: W - 2 * M, h: FOOT_H, fontSize: 13 });
};
const fmtNum = (v) => Number(v).toLocaleString("vi-VN");

L.panelrows = async (s, c, d) => {
  kickerTitle(s, c, d);
  box(s, M, 2.3, 4.6, 4.6, c.deep);
  for (const r of [1.9, 1.35]) s.addShape(pres.shapes.OVAL, { x: 2.9 - r, y: 4.45 - r, w: 2 * r, h: 2 * r, fill: { type: "none" }, line: { color: c.line, width: 0.75 } });
  if (d.icon) await circIcon(s, d.icon, 1.0, 2.7, 0.95, c.acc, c.onAcc);
  if (d.cutout) await artOrCut(s, d, null, M + 0.35, 2.75, 3.9, d.artCaption ? 3.2 : 3.75); // ảnh vật thật: dùng gần hết khung (hình vẽ thì nhỏ ở giữa)
  else await artOrCut(s, d, () => art(d.art || DEF_ART.doc, c.acc, c.bad), 2.1, 3.0, 1.95, 2.47);
  if (d.stamp) addT(s, d.stamp, { shape: pres.shapes.RECTANGLE, x: 2.25, y: 4.8, w: 1.8, h: 0.58, rotate: -10, fill: { color: c.deep }, line: { color: c.bad, width: 3 }, color: c.bad, fontFace: TH.accentFont, bold: true, fontSize: 22, align: "center", valign: "middle", margin: 0, charSpacing: 4 });
  if (d.artCaption) T(s, d.artCaption, { x: M + 0.3, y: 6.05, w: 4.0, h: 0.7, fontSize: 13, color: c.muted, align: "center" });
  (d.rows || []).slice(0, 3).forEach((r, i) => { const y = 2.3 + i * 1.57;
    box(s, 5.5, y, 7.23, 1.45, c.card, isLight(c) ? c.line : null);
    // khối chữ (nhãn → nội dung → ghi chú) căn giữa thẻ theo chiều dọc — không để nửa dưới thẻ trống
    const th = realH(r.text, { fontFace: TH.bodyFont, fontSize: 16 }, 6.7, 0.6), blk = 0.32 + th + (r.note ? 0.06 + 0.3 : 0), oy = Math.max(0.14, (1.45 - blk) / 2);
    cap(s, r.head, 5.8, y + oy, 6.6, r.tone === "bad" ? c.bad : c.acc);
    T(s, r.text, { x: 5.8, y: y + oy + 0.32, w: 6.7, h: Math.min(th + 0.04, 1.45 - oy - 0.36), fontSize: 16, color: c.text });
    if (r.note) T(s, r.note, { x: 5.8, y: y + oy + 0.38 + th, w: 6.7, h: 0.32, fontSize: 13, fontFace: TH.accentFont, italic: TH.accentItalic, color: c.muted }); });
};

// scorecard: bảng 2 cột được/chưa được; ô trống để trống thật (không in "—")
L.scorecard = async (s, c, d) => {
  kickerTitle(s, c, d);
  const ca = 3.7, cb = 8.3;
  cap(s, d.colA || "", ca, 2.3, 4.2, c.good, { fontSize: 13 });
  cap(s, d.colB || "", cb, 2.3, 4.2, c.bad, { fontSize: 13 });
  const nr = Math.min(3, (d.rows || []).length), lim = d.footer ? FOOT_Y - 0.2 : 6.85, rg = 0.16;
  const rh = Math.min(1.4, (lim - 2.72 - rg * Math.max(0, nr - 1)) / Math.max(1, nr)), fs = rh >= 1.25 ? 17 : 15;
  for (const [i, r] of (d.rows || []).slice(0, 3).entries()) { const y = 2.72 + i * (rh + rg);
    box(s, M, y, W - 2 * M, rh, c.card, c.line);
    T(s, r.q || "", { x: M + 0.3, y: y + 0.12, w: 2.75, h: rh - 0.24, fontSize: fs + 2, bold: true, color: c.text, valign: "middle" });
    for (const [col, txt, ic, colr] of [[ca, r.a, "FaCheck", c.good], [cb, r.b, "FaXmark", c.bad]]) {
      if (!txt) continue;
      s.addImage({ data: await icon(ic, colr), x: col, y: y + rh / 2 - 0.14, w: 0.28, h: 0.28 });
      T(s, txt, { x: col + 0.42, y: y + 0.08, w: col === ca ? 3.85 : 4.0, h: rh - 0.16, fontSize: fs, color: c.text, valign: "middle" }); } }
  if (nr) s.addShape(pres.shapes.LINE, { x: cb - 0.3, y: 2.72, w: 0, h: nr * (rh + rg) - rg, line: { color: c.line, width: 0.75 } });
  if (d.footer) T(s, rich(d.footer, c.text, c.acc), { x: M, y: FOOT_Y, w: W - 2 * M, h: FOOT_H, fontSize: 15 });
};

// closing có "answers": trả lời từng câu hỏi đã đặt ở agenda (đánh số khớp 01, 02, 03) + một dòng nhận định + kiến nghị.
// Đây là việc chính của kết luận bình luận bản án: người nghe ra về với câu trả lời gọn cho từng câu, không phải với lời cảm ơn.
async function closingAnswers(s, c, d) {
  const phx = !!d.photo && !(d.rec && (d.rec.items || []).length); // có ảnh: ảnh thay hình vẽ, tiêu đề chỉ rộng bằng cột chữ
  if (d.art !== "none" && !phx) s.addImage({ altText: "Hình minh hoạ", data: await art(d.art || rotArt(), c.acc, c.bad), x: 10.75, y: 0.7, w: 1.95, h: 1.76 });
  if (d.kicker) kicker(s, d.kicker, M, KICK_Y, c.acc);
  const ctf = TH.titleBold ? 30 : 34, cth = phx ? realH(rich(d.title, c.text, c.acc), { fontFace: TH.titleFont, fontSize: ctf }, 7.55, 1.0) + 0.05 : 1.0;
  T(s, rich(d.title, c.text, c.acc), { _label: "title", x: M, y: TITLE_Y, w: phx ? 7.55 : 9.8, h: cth, fontSize: ctf });
  const rec = d.rec && (d.rec.items || []).length, ph = !!d.photo && !rec, lw = rec ? 7.35 : ph ? 7.55 : W - 2 * M;
  if (ph) { // ẢNH TRÀN MÉP PHẢI (kết bài có hình ảnh con người — người nghe mang về một hình, không chỉ một danh sách)
    const px = M + lw + 0.4; s.addImage({ data: await photo(d.photo, W - px, H, null, null, "none", 0, d.photoStyle || "natural"), x: px, y: 0, w: W - px, h: H, altText: d.photoAlt || "Ảnh kết luận" });
    await photoCredit(s, d.photo, d, null, 0, 0, 0); }
  let y = Math.max(BODY_Y + 0.1, TITLE_Y + cth + 0.2); // tiêu đề 2 dòng (cột hẹp cạnh ảnh) đẩy phần trả lời xuống
  if (d.verdict) { // nhận định của người viết: DẢI NỀN TỐI chạy hết bề ngang — điều người nghe mang về, nổi hơn mọi thẻ trả lời
    const dk = TH.d, vw = W - 2 * M, vt = rich(d.verdict, dk.text, dk.acc), vh = Math.max(0.6, realH(vt, { fontFace: TH.titleFont, fontSize: 20 }, vw - 2.4, 0.45) + 0.24);
    box(s, M, y, vw, vh, dk.bg);
    T(s, "NHẬN ĐỊNH", { _label: "verdict label", x: M + 0.3, y, w: 1.8, h: vh, fontSize: 12, bold: true, color: dk.acc, charSpacing: 1.5, valign: "middle" });
    T(s, vt, { _label: "verdict", x: M + 2.1, y, w: vw - 2.4, h: vh, fontSize: 20, fontFace: TH.titleFont, valign: "middle" });
    y += vh + 0.15; }
  const an = (d.answers || []).slice(0, 4), lim = d.thanks ? FOOT_Y - 0.12 : 6.9, gap = 0.14;
  const rh = Math.min(1.2, (lim - y - gap * (an.length - 1)) / Math.max(1, an.length)), nd = 0.56;
  for (const [i, q] of an.entries()) { const ry = y + i * (rh + gap);
    box(s, M, ry, lw, rh, c.card, c.line);
    num(s, String(i + 1).padStart(2, "0"), M + 0.22, ry + (rh - nd) / 2, nd, TH.d.bg, TH.d.acc, 16);
    cap(s, q.q, M + 0.98, ry + 0.14, lw - 1.2, q.tone === "bad" ? c.bad : c.muted);
    T(s, rich(q.a, c.text, c.acc), { x: M + 0.98, y: ry + 0.4, w: lw - 1.2, h: rh - 0.46, fontSize: 17, color: c.text }); }
  if (rec) { const x = M + lw + 0.3, w = W - M - x, ry = y, rh2 = Math.max(2.4, an.length ? an.length * (rh + gap) - gap : 2.4); // ≥ 2.4: 1 câu trả lời vẫn đủ chỗ icon + tiêu đề + ý
    box(s, x, ry, w, rh2, c.deep);
    await circIcon(s, "FaLightbulb", x + 0.3, ry + 0.3, 0.55, c.acc, c.onAcc);
    const rt = d.rec.title || "Kiến nghị", rth = realH(rt, { fontFace: TH.bodyFont, fontSize: 15, bold: true }, w - 0.55, 0.3) + 0.04;
    T(s, rt, { x: x + 0.3, y: ry + 1.0, w: w - 0.55, h: rth, fontSize: 15, bold: true, color: c.acc });
    // tiêu đề → ý 1 cách bằng ý 1 → ý 2 (0.14 in)
    itemBoxes(s, d.rec.items.slice(0, 2), { lab: "rec.items", x: x + 0.3, y: ry + 1.0 + rth + 0.14, w: w - 0.55, h: ry + rh2 - 0.2 - (ry + 1.0 + rth + 0.14), fontSize: 15, color: c.text, acc: c.acc, markColor: c.acc, gap: 0.14 }); }
  if (d.thanks) T(s, d.thanks, { x: M, y: FOOT_Y, w: 8, h: 0.45, fontSize: 18, fontFace: TH.accentFont, italic: TH.accentItalic, color: c.acc });
}
L.closing = async (s, c, d) => {
  if (Array.isArray(d.answers) && d.answers.length) return closingAnswers(s, c, d);
  if (c === TH.l) await heroArt(s, c, "closing");
  if (d.art !== "none") s.addImage({ altText: "Hình minh hoạ", data: await art(d.art || rotArt(), c.acc, c.bad), x: 10.3, y: 0.75, w: 2.4, h: 2.16 });
  if (d.kicker) kicker(s, d.kicker, M, KICK_Y, c.acc);
  T(s, rich(d.title, c.text, c.acc), { x: M, y: TITLE_Y, w: 9.4, h: 1.9, fontSize: TH.titleBold ? 30 : 34 });
  const ls = (d.lessons || []).slice(0, 3), lw = (W - 2 * M) / Math.max(1, ls.length);
  for (const [i, l] of ls.entries()) { const x = M + i * lw;
    await circIcon(s, l.icon || "FaCheck", x, 3.42, 0.6, c.acc, c.onAcc);
    cap(s, l.head || "", x + 0.78, 3.45, lw - 1.0, c.acc);
    T(s, l.text, { x: x + 0.78, y: 3.78, w: lw - 1.0, h: 0.85, fontSize: 16, color: c.text }); }
  if (d.rec) { // khung kiến nghị rộng vừa chữ (2 ý ngắn không kéo khung hết bề ngang slide)
    const its = d.rec.items || [], tw = Math.max(textW(d.rec.title || "", { fontFace: TH.bodyFont, fontSize: 14, bold: true }) || 3, ...its.map(t => (textW(t, { fontFace: TH.bodyFont, fontSize: 16 }) || String(t).length * 0.11) + 0.3));
    const bw = Math.min(W - 2 * M, Math.max(6.0, tw + 1.6));
    box(s, M, 4.85, bw, 1.6, c.card);
    await circIcon(s, "FaLightbulb", M + 0.3, 5.1, 0.55, c.acc, c.onAcc);
    T(s, d.rec.title || "", { x: M + 1.05, y: 5.08, w: bw - 1.35, h: 0.35, fontSize: 14, bold: true, color: c.acc });
    itemBoxes(s, its.slice(0, 2), { lab: "rec.items", x: M + 1.05, y: 5.47, w: bw - 1.3, h: 0.9, fontSize: 16, color: c.text, acc: c.acc, markColor: c.acc, gap: 0.06 }); }
  if (d.thanks) T(s, d.thanks, { x: M, y: 6.62, w: 8, h: 0.45, fontSize: 18, fontFace: TH.accentFont, italic: TH.accentItalic, color: c.acc });
};

// bìa nền trắng: tranh phong cảnh vẽ bằng code chiếm nửa phải + đáy; chữ ở góc trên-trái
// bìa có ảnh thật: ảnh nhuộm tông tối tràn viền, chữ trắng bên trái, khung kính mờ cho thông tin tác giả
async function coverPhoto(s, c, d, meta) {
  // bìa ảnh tràn viền: chữ đặt ở PHÍA YÊN TĨNH của ảnh (đọc ảnh), lớp phủ chỉ phía chữ, đậm theo độ sáng thật của phía đó;
  // điểm nhấn: vạch dày màu lấy từ ảnh + tiêu đề rất lớn; từ khoá tô màu sáng của chính ảnh
  const dk = TH.d, info = await analyzePhoto(d.photo, W, H), side = sideOf(d, info, "left"), rt = side === "right";
  const strength = Math.min(0.94, 0.55 + 0.4 * info.R[side].bright + 2.2 * Math.max(0, info.R[side].busy - 0.06)); // phía chữ sáng hoặc RỐI (nhiều chi tiết) → phủ đậm hơn; ảnh tối, trơn → phủ nhẹ, giữ màu ảnh
  s.addImage({ _bg: dk.bg, data: await photo(d.photo, W, H, dk.bg, dk.bg, side, strength, d.photoStyle || "natural"), x: 0, y: 0, w: W, h: H, altText: d.photoAlt || "Ảnh bìa" });
  const tw = 7.4, tx = rt ? W - M - tw : M, bar = dk.acc, acc = dk.acc; // vạch nhấn = màu của ảnh; từ khoá = màu nhấn sáng của theme (màu ảnh pha trắng dễ thành xám)
  let y = 1.0;
  if (meta.logo && fs.existsSync(meta.logo)) { box(s, tx, 0.5, 1.75, 0.52, "FFFFFF"); s.addImage({ path: meta.logo, x: tx + 0.08, y: 0.55, w: 1.59, h: 0.42, sizing: { type: "contain", w: 1.59, h: 0.42 } }); y = 1.45; }
  const runs = rich(d.title, dk.text, acc).map(r => (r.options.fontFace === TH.titleFont ? { text: r.text, options: Object.assign({}, r.options, { bold: true }) } : r));
  let fs_ = 50, th = 2.4; for (fs_ of [54, 48, 44, 40]) { const m = measure(noOrphan(runs), { fontFace: TH.titleFont, fontSize: fs_ }, tw); th = m.ok ? m.height + 0.08 : 2.4; if (!m.ok || m.lines <= 3) break; }
  const sh = d.subtitle ? realH(d.subtitle, { fontFace: TH.bodyFont, fontSize: 18 }, tw - 0.4, 0.75) : 0, blk = 0.55 + th + (sh ? 0.3 + sh : 0);
  y = Math.max(y, Math.min((H - blk) / 2 - 0.3, 5.3 - blk));
  if (info.R[side].busy > 0.1) // phía chữ vẫn rối (đèn, toà nhà, lá cây) → tấm nền tối mờ sau khối chữ: chữ luôn đọc được, ảnh vẫn thấy qua
    s.addShape(TH.radius ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, Object.assign({ x: tx - 0.4, y: y - 0.4, w: Math.min(tw + 0.8, W - 0.3 - (tx - 0.4)), h: blk + 0.85, fill: { color: dk.deep, transparency: 22 }, line: { type: "none" } }, TH.radius ? { rectRadius: 0.16 } : {}));
  s.addShape(pres.shapes.RECTANGLE, { x: tx, y, w: 1.0, h: 0.1, fill: { color: bar }, line: { type: "none" } });
  if (d.kicker) T(s, String(d.kicker).toUpperCase(), { _label: "kicker", x: tx + 1.2, y: y - 0.12, w: tw - 1.2, h: 0.34, fontSize: 13, bold: true, color: dk.text, charSpacing: 2, valign: "middle" });
  T(s, runs, { _label: "title", x: tx, y: y + 0.45, w: tw, h: th, fontSize: fs_ });
  if (d.subtitle) T(s, d.subtitle, { _label: "subtitle", x: tx, y: y + 0.45 + th + 0.3, w: tw - 0.4, h: sh + 0.05, fontSize: 18, color: dk.muted });
  if (d.author) { const gy = 5.75;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: tx, y: gy, w: 5.6, h: 1.0, rectRadius: 0.12, fill: { color: "FFFFFF", transparency: 88 }, line: { color: "FFFFFF", transparency: 55, width: 1 } });
    T(s, [{ text: d.author, options: { bold: true, color: dk.text, fontSize: 17, breakLine: !!d.authorSub } }, ...(d.authorSub ? [{ text: d.authorSub, options: { color: dk.muted, fontSize: 13 } }] : [])], { _label: "author", x: tx + 0.3, y: gy + 0.12, w: 5.0, h: 0.76, valign: "middle" }); }
  await photoCredit(s, d.photo, d, dk.muted, rt ? M : W - M - 6, H - 0.36, 6);
}
async function coverLight(s, c, d, meta) {
  await heroArt(s, c, "cover");
  const wide = MOTIF === "cadastral" || MOTIF === "landscape" ? 6.3 : 7.0; // chừa chỗ cho tranh bên phải
  if (MOTIF === "none" || MOTIF === "certificate") { const a = d.art || DEF_ART.hero; if (a !== "none") s.addImage({ altText: "Hình minh hoạ", data: await art(a, c.acc, c.bad, c.bg, 1400), x: 8.1, y: 1.6, w: 4.8, h: a === "justice" ? 4.16 : 3.84 }); }
  else if (MOTIFS[MOTIF] && !["cadastral", "landscape"].includes(MOTIF)) {
    // hoạ tiết chung (contour, dots, lines, waves, blobs, grid): bìa có MẢNG HOẠ TIẾT LỚN tràn mép phải (không phải mảnh nhỏ lọt thỏm) + hình minh hoạ đặt lên trên
    const px = 7.3, pw = W - px, svg = MOTIFS[MOTIF](c.acc, TH.gold, c.bg, Math.round(pw * 120), Math.round(H * 120), { r: true, t: true, b: true }, 17);
    s.addImage({ altText: "Hoạ tiết bìa", data: await png(svg.replace("<svg ", '<svg opacity="0.85" '), Math.round(pw * 160)), x: px, y: 0, w: pw, h: H, _deco: true });
    const a = d.art || "none"; if (a !== "none") { const aw = 3.6, ah = a === "justice" ? 3.12 : 2.88; s.addImage({ altText: "Hình minh hoạ", data: await art(a, c.acc, c.bad, c.bg, 1400), x: px + (pw - aw) / 2 + 0.3, y: (H - ah) / 2, w: aw, h: ah }); } }
  if (MOTIF === "cadastral" && meta.motifLabel) { const px = CAD_PIN.x / 120, lw = fitW(meta.motifLabel, { fontFace: TH.bodyFont, fontSize: 14, bold: true }, 0.5, 0.105, 4.2);
    addT(s, meta.motifLabel, { _label: "meta.motifLabel", shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.2, x: px - lw / 2, y: 1.05, w: lw, h: 0.42, fill: { color: c.acc }, line: { type: "none" }, color: c.onAcc, fontFace: TH.bodyFont, fontSize: 14, bold: true, align: "center", valign: "middle", margin: 0 });
    s.addShape(pres.shapes.LINE, { x: px, y: 1.47, w: 0, h: 0.38, line: { color: c.acc, width: 1.5 } }); }
  let y = 1.0;
  if (meta.logo && fs.existsSync(meta.logo)) { s.addImage({ path: meta.logo, x: M, y: 0.55, w: 1.59, h: 0.42, sizing: { type: "contain", w: 1.59, h: 0.42 } }); y = 1.4; }
  const runs = rich(d.title, c.text, c.acc).map(r => (r.options.fontFace === TH.titleFont ? { text: r.text, options: Object.assign({}, r.options, { bold: true }) } : r));
  const tw = wide + 0.25; let tfs = 44, mt = null; // tiêu đề bìa to nhất có thể mà ≤ 3 dòng (bìa là chỗ duy nhất chữ được làm chủ)
  for (tfs of [46, 42, 38, 34]) { mt = measure(noOrphan(runs), { fontFace: TH.titleFont, fontSize: tfs }, tw); if (!mt.ok || mt.lines <= 3) break; }
  const th = mt && mt.ok ? mt.height + 0.08 : 2.3;
  { // khối chữ bìa (kicker → tiêu đề → phụ đề → tác giả) căn giữa theo chiều dọc — không dồn lên trên để trống nửa dưới
    const ms0 = d.subtitle ? measure(noOrphan(d.subtitle), { fontFace: TH.bodyFont, fontSize: 18 }, wide - 0.3) : null;
    const blockH = 0.45 + th + 0.3 + (d.subtitle ? (ms0 && ms0.ok ? ms0.height : 0.7) + 0.45 : 0.15) + (d.author ? 0.62 : 0);
    y = Math.max(y, (H - blockH) / 2 - 0.15); }
  if (d.kicker) kicker(s, d.kicker, M, y, c.acc);
  T(s, runs, { _label: "title", x: M, y: y + 0.45, w: tw, h: th, fontSize: tfs });
  const sy = y + 0.45 + realH(runs, { fontFace: TH.titleFont, fontSize: tfs }, tw, th) + 0.3, ms = d.subtitle ? measure(noOrphan(d.subtitle), { fontFace: TH.bodyFont, fontSize: 18 }, wide - 0.3) : null, sh = ms && ms.ok ? ms.height + 0.05 : 0.7;
  if (d.subtitle) T(s, d.subtitle, { x: M, y: sy, w: wide - 0.3, h: sh, fontSize: 18, color: c.muted });
  y = (d.subtitle ? sy + sh : sy) + 0.45 - 3.75; // để khối tác giả đặt ngay dưới phụ đề
  if (d.author) { // có tên viết tắt → vòng tròn chữ; không có → icon người (không còn dấu "•" trống nghĩa)
    if (d.initials) addT(s, d.initials, { shape: pres.shapes.OVAL, x: M, y: y + 3.75, w: 0.58, h: 0.58, fill: { color: c.acc }, line: { type: "none" }, color: c.onAcc, fontFace: TH.numFont, italic: TH.numItalic, bold: true, fontSize: 15, align: "center", valign: "middle", margin: 0 });
    else await circIcon(s, "PiUserDuotone", M, y + 3.75, 0.58, c.acc, c.onAcc);
    T(s, [{ text: d.author, options: { bold: true, color: c.text, fontSize: 16, breakLine: true } }, { text: d.authorSub || "", options: { color: c.muted, fontSize: 13 } }], { x: M + 0.75, y: y + 3.72, w: wide - 0.8, h: 0.66, valign: "middle" });
  }
}
L.section = async (s, c, d, meta) => {
  if (await styled("section", s, c, d, meta)) return;
  if (c === TH.l) { const styled = !d.photo && Object.keys(PARTS).length >= 2 && PARTS[+d.num] != null; if (!styled) await heroArt(s, c, "section"); return sectionLight(s, c, d); } // kiểu mới tự có mảng hình lớn: không thêm dấu góc / phong cảnh // nền trắng: số chương lớn + bản đồ chương
  // số phần khổng lồ, mờ, tràn mép — kiểu chữ tạp chí; không đo tràn (cố ý vượt khung)
  if (d.num) s.addText(String(d.num), { lang: LANG, x: -0.25, y: -0.9, w: 9, h: 6.2, fontSize: 380, fontFace: TH.numFont, italic: TH.numItalic, bold: true, color: c.acc, transparency: 80, margin: 0, valign: "top", wrap: false });
  s.addImage({ altText: "Hoa văn giấy chứng nhận", data: await art("guilloche", c.acc, null, null, 1400), x: 8.0, y: 0.95, w: 5.6, h: 5.6, transparency: 35 });
  await artOrCut(s, d, () => art(d.art || DEF_ART.hero, c.acc, c.bad, c.bg, 1400), 8.75, 2.15, 4.1, 3.55);
  T(s, rich(d.title, c.text, c.acc), { x: M, y: 3.0, w: 7.2, h: 2.3, fontSize: 48 });
  if (d.sub) T(s, d.sub, { x: M, y: 5.45, w: 7, h: 1.0, fontSize: 18, color: c.muted });
};
// ---------- photo: ảnh thật tràn viền + cột chữ (lời kết, khoảnh khắc then chốt) — học từ slide NotebookLM ----------
// share: một tỷ lệ % vẽ thành 100 phần — "thửa đất" (lưới địa chính méo nhẹ) hoặc ô vuông. Phần đạt tô màu nhấn,
// phần còn lại tô nhạt màu cảnh báo: người xem "đếm" được tỷ lệ thay vì đọc con số.
function parcelsSvg(pct, style, on, off, bg) {
  const N = 10, S = 100, rnd = ((a) => () => ((a = (a * 1103515245 + 12345) % 2147483648) / 2147483648))(42);
  const P = [...Array(N + 1)].map((_, i) => [...Array(N + 1)].map((_, j) => [j * S + (j % N ? (rnd() - 0.5) * (style === "grid" ? 0 : 46) : 0), i * S + (i % N ? (rnd() - 0.5) * (style === "grid" ? 0 : 46) : 0)]));
  // parcels: phần chưa đạt rải rác như các hộ riêng lẻ. grid: tô LIỀN KHỐI từ dưới lên (waffle chuẩn) — mắt đếm được, không phải dò từng ô
  const order = style === "grid" ? [...Array(N * N).keys()] : [...Array(N * N).keys()].map(k => [k, rnd()]).sort((a, b) => a[1] - b[1]).map(q => q[0]);
  const offSet = new Set(order.slice(0, N * N - Math.round(pct)));
  let out = "";
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const k = i * N + j, q = [P[i][j], P[i][j + 1], P[i + 1][j + 1], P[i + 1][j]];
    if (style === "grid") out += `<rect x="${j * S + 9}" y="${i * S + 9}" width="${S - 18}" height="${S - 18}" rx="14" fill="#${offSet.has(k) ? off : on}" ${offSet.has(k) ? 'fill-opacity="0.28"' : ""}/>`;
    else out += `<path d="M${q.map(p => p.join(" ")).join(" L")}Z" fill="#${offSet.has(k) ? off : on}" ${offSet.has(k) ? 'fill-opacity="0.22"' : ""} stroke="#${bg}" stroke-width="7" stroke-linejoin="round"/>`; }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 1012 1012">${out}</svg>`;
}
L.share = async (s, c, d) => {
  kickerTitle(s, c, d);
  const pct = Math.max(0, Math.min(100, +d.pct || 0)), st = d.style || "parcels", D = FOOT_Y - 0.62 - BODY_Y, x0 = M;
  // offTone: màu phần còn lại — "bad" (chưa đạt ngưỡng: đỏ nhạt) hoặc "muted" (chỉ là phần khác, không xấu: xám)
  const offC = d.offTone === "muted" ? c.muted : c.bad, k = `share:${pct}:${st}:${c.acc}:${offC}`;
  if (!ASSETS[k]) ASSETS[k] = await png(parcelsSvg(pct, st, c.acc, offC, c.bg), 1400);
  s.addImage({ data: ASSETS[k], x: x0, y: BODY_Y, w: D, h: D, altText: `${st === "parcels" ? "100 thửa đất" : "100 ô"}: ${pct} phần tô đậm${d.label ? " — " + d.label : ""}, ${100 - pct} phần nhạt` });
  const rx = x0 + D + 0.6, rw = W - M - rx;
  T(s, [{ text: fmtNum(pct), options: {} }, { text: "%", options: { fontSize: 44 } }], { _label: "pct", x: rx, y: BODY_Y - 0.35, w: rw, h: 1.4, fontSize: 80, fontFace: TH.numFont, italic: TH.numItalic, bold: TH.titleBold, color: c.acc, valign: "top" });
  if (d.label) T(s, rich(d.label, c.text, c.acc), { _label: "label", x: rx, y: BODY_Y + 1.05, w: rw, h: 0.75, fontSize: 18, color: c.text });
  // chú giải 2 ô màu ngay dưới hình — đọc được hình mà không cần người nói giải thích
  const ly = BODY_Y + D + 0.1;
  const lg = d.legend || ["phần đạt", "phần chưa đạt"];
  let lx = x0; [[c.acc, 0, `${pct} ${lg[0]}`], [offC, 78, `${100 - pct} ${lg[1]}`]].forEach(([col, tr, t]) => { const x = lx, tw = fitW(t, { fontFace: TH.bodyFont, fontSize: 14 }, 0.15, 0.1, 3.0); lx += 0.36 + tw + 0.35;
    s.addShape(pres.shapes.RECTANGLE, { x, y: ly + 0.06, w: 0.26, h: 0.26, fill: { color: col, transparency: tr }, line: tr ? { color: col, width: 1 } : { type: "none" } });
    T(s, t, { _label: "chú giải", x: x + 0.36, y: ly, w: tw, h: 0.38, fontSize: 14, color: c.muted, valign: "middle" }); });
  const items = (d.items || []).slice(0, 3), iy = BODY_Y + (d.label ? 1.95 : 1.3), ih = Math.min(1.05, (FOOT_Y - 0.15 - iy) / Math.max(1, items.length));
  s.addShape(pres.shapes.LINE, { x: rx, y: iy - 0.12, w: rw, h: 0, line: { color: c.line, width: 1 } });
  for (const [i, it] of items.entries()) { const y = iy + i * ih;
    await circIcon(s, it.icon || "PiCheckCircleDuotone", rx, y + 0.06, 0.5, c.acc, c.onAcc);
    T(s, it.head, { _label: `items[${i}].head`, x: rx + 0.68, y, w: rw - 0.68, h: 0.36, fontSize: 16, bold: true, color: c.text });
    if (it.text) T(s, rich(it.text, c.muted, c.text), { _label: `items[${i}].text`, x: rx + 0.68, y: y + 0.36, w: rw - 0.68, h: ih - 0.4, fontSize: 14, color: c.muted }); }
  foot(s, c, d.note);
};
// ---------- isotype: đếm bằng hình — mỗi hình = unit.value (Otto Neurath; Haroz et al., CHI 2015) ----------
// Phần "mất / thiếu / không còn" (lost) vẽ KHUNG RỖNG nét đứt ở cuối hàng — không tô đỏ đặc (đọc nhầm thành "có nhưng xấu").
const CA = require("./codeart");
// meta.style: dossier | cadastral | portico — bìa, mở chương, slide cuối theo chất liệu của thế giới bản án (engine/styles.js)
const STYLEMOD = require("./styles");
async function styled(kind, s, c, d, meta) {
  const st = meta && meta.style; if (!st || !STYLEMOD.STYLES.includes(st) || d.photo || d.style === "classic") return false;
  if (kind === "cover" && d.layout && d.layout !== "art") return false; // bìa chọn typo / band / full / split / paper → theo layout đó; "art" là mặc định → theo phong cách
  const X = { T, addT, box, png, kicker, cap, num, rich, realH, measure, mix, isLight, fitW, TH, CUR, PARTS, W, H, M, pres, ASSETS };
  await STYLEMOD.make(X).run(st, kind, s, c, d, meta); return true;
}
L.isotype = async (s, c, d) => {
  kickerTitle(s, c, d);
  const u = d.unit || {}, uv = +u.value || 1, kind = d.icon || "note", rows = (d.rows || []).slice(0, 3), nr = Math.max(1, rows.length);
  // màu khung rỗng: đỏ "mất" — trừ khi màu nhấn của theme đã là đỏ (toa, son): khi đó đỏ đặc và khung đỏ khó tách → khung xám đậm
  const near = (a, b) => Math.hypot(...[0, 2, 4].map(i => parseInt(a.slice(i, i + 2), 16) - parseInt(b.slice(i, i + 2), 16))) < 140;
  const gCol = near(c.acc, c.bad) ? c.text : c.bad, gFill = near(c.acc, c.bad) ? mix(c.text, "FFFFFF", 0.92) : (isLight(c) ? "FBEDEB" : c.card);
  // chú giải: 1 hình = …  (+ khung rỗng = …) — đặt ngay dưới tiêu đề, căn phải
  const lg = [[false, `= ${fmtNum(uv)} ${u.label || ""}`.trim()]];
  if (rows.some(r => +r.lost > 0)) lg.push([true, `= ${d.lostLabel || "không còn"}`]);
  let lx = W - M; const ly = BODY_Y - 0.05, gs = 0.3, gw = kind === "note" ? 0.42 : 0.3;
  for (const [ghost, t] of lg.slice().reverse()) { const tw = fitW(t, { fontFace: TH.bodyFont, fontSize: 14 }, 0.1, 0.1, 3.6); lx -= tw;
    T(s, t, { _label: "chú giải", x: lx, y: ly, w: tw, h: gs + 0.06, fontSize: 14, color: c.muted, valign: "middle" }); lx -= gw + 0.1;
    const one = CA.isotypeRow(kind, 1, ghost ? 1 : 0, 1, 1, c.acc, gCol, gFill, c.bg), hh = gw * CA.ISO_RATIO[kind];
    s.addImage({ data: await png(one.svg, 120), x: lx, y: ly + (gs + 0.06 - hh) / 2, w: gw, h: hh, altText: ghost ? "Khung rỗng" : "Một đơn vị" }); lx -= 0.35; }
  const y0 = BODY_Y + 0.5, avail = FOOT_Y - 0.2 - y0, rh = avail / nr, LW = 2.75, gx = M + LW + 0.25, gwid = W - M - gx;
  // mọi hàng dùng CÙNG lưới (số cột, cỡ hình) của hàng dài nhất — người xem so độ dài hàng như so cột biểu đồ
  const nmax = Math.max(1, ...rows.map(r => Math.round((+r.value || 0) / uv))), ref = CA.isotypeRow(kind, nmax, 0, gwid, rh - 0.3, c.acc, c.bad, "FFFFFF", c.bg), fix = { cols: ref.cols, cell: ref.cell };
  for (const [i, r] of rows.entries()) { const y = y0 + i * rh, n = Math.max(1, Math.round((+r.value || 0) / uv)), lost = Math.min(n, Math.round((+r.lost || 0) / uv));
    const col = r.tone === "bad" ? c.bad : r.tone === "muted" ? c.muted : c.acc;
    const g = CA.isotypeRow(kind, n, lost, gwid, rh - 0.3, col, gCol, gFill, c.bg, fix);
    const gy = y + (rh - 0.3 - ref.h) / 2; // căn theo hàng dài nhất: hàng ngắn vẫn bắt đầu cùng mép trên
    s.addImage({ data: await png(g.svg, Math.round(g.w * 160)), x: gx, y: gy, w: g.w, h: g.h, altText: `${r.label}: ${n} hình${lost ? `, ${lost} khung rỗng` : ""}, mỗi hình ${uv} ${u.label || ""}` });
    T(s, rich(r.label, c.text, c.acc), { _label: `rows[${i}].label`, x: M, y: gy - 0.04, w: LW, h: 0.4, fontSize: 18, bold: true, color: c.text });
    const disp = r.display || fmtNum(+r.value) + (u.short ? " " + u.short : "");
    T(s, disp, { _label: `rows[${i}].display`, x: M, y: gy + 0.36, w: LW, h: 0.6, fontSize: 28, fontFace: TH.numFont, italic: TH.numItalic, bold: TH.titleBold, color: col });
    if (lost) T(s, `− ${fmtNum(+r.lost)}${u.short ? " " + u.short : ""}`, { _label: `rows[${i}].lost`, x: M, y: gy + 0.96, w: LW, h: 0.38, fontSize: 15, bold: true, color: c.bad }); }
  foot(s, c, d.note);
};

// ---------- iso: cảnh isometric dựng bằng toạ độ (thửa đất, nhà, toà nhà, ngân hàng, toà án, cây, người) ----------
// Người xem thấy AI Ở ĐÂU, TRÊN THỬA NÀO — điều sơ đồ flow không cho thấy. Vật có focus tô màu nhấn, vật khác màu trầm;
// nhãn ở cột phải, đường dẫn gấp khúc tới đỉnh vật (không đặt chữ đè lên hình).
L.iso = async (s, c, d) => {
  kickerTitle(s, c, d);
  const obs = (d.objects || []).slice(0, 8), anyF = obs.some(o => o.focus), mx = (a, t) => mix(a, "FFFFFF", t);
  const calm = { base: mx(c.muted, 0.93), baseLine: mx(c.muted, 0.55), top: mx(c.muted, 0.85), left: mx(c.muted, 0.8), right: mx(c.muted, 0.62), roof: mx(c.muted, 0.35), roof2: c.muted, door: c.muted, window: mx(c.muted, 0.55), leaf: mx(c.muted, 0.6), line: TH.d.bg, pin: c.bad };
  const hot = { base: mx(c.acc, 0.86), baseLine: c.acc, top: mx(c.acc, 0.85), left: mx(c.acc, 0.88), right: mx(c.acc, 0.7), roof: c.acc, roof2: TH.d.bg, door: TH.d.bg, window: mx(c.acc, 0.45), leaf: mx(c.acc, 0.55), line: TH.d.bg, pin: c.bad };
  const col = anyF ? Object.assign({}, calm, { f: hot }) : hot;
  const labs = obs.map((o, i) => ({ o, i })).filter(q => q.o.label), LX = 8.75, sw = labs.length ? LX - M - 0.6 : W - 2 * M, sh = FOOT_Y - 0.25 - BODY_Y;
  const sc = CA.isoScene(obs, sw, sh, col);
  const sceneImg = { data: await png(sc.svg, 1500), x: M, y: BODY_Y, w: sw, h: sh, altText: "Hình isometric: " + obs.map(o => (o.label || o.kind)).join(", ") };
  // nhãn: xếp theo độ cao điểm neo, giãn đều để không chồng nhau
  const order = labs.map(q => Object.assign(q, { ay: BODY_Y + sc.anchors[q.i][1], ax: M + sc.anchors[q.i][0] })).sort((a, b) => a.ay - b.ay);
  const LH = 0.95, top0 = BODY_Y + 0.1, bot0 = FOOT_Y - 0.3 - LH; let prev = -1e9;
  order.forEach((q, k) => { q.ly = Math.min(Math.max(q.ay - 0.3, prev + LH, top0), bot0 - (order.length - 1 - k) * LH); prev = q.ly; });
  // đường dẫn vẽ TRƯỚC hình (nằm sau nhà, toà nhà — như đi vòng phía sau) rồi mới đặt hình; chấm neo vẽ SAU hình để luôn thấy
  const ex = LX - 0.15;
  for (const q of order) { const lc = q.o.focus || !anyF ? c.acc : c.muted, ly = q.ly + 0.2;
    s.addShape(pres.shapes.LINE, { x: q.ax, y: Math.min(q.ay, ly), w: 0, h: Math.abs(ly - q.ay), line: { color: lc, width: 1.25 } });
    s.addShape(pres.shapes.LINE, { x: q.ax, y: ly, w: ex - q.ax, h: 0, line: { color: lc, width: 1.25 } }); }
  s.addImage(sceneImg);
  for (const q of order) { const lc = q.o.focus || !anyF ? c.acc : c.muted;
    s.addShape(pres.shapes.OVAL, { x: q.ax - 0.07, y: q.ay - 0.07, w: 0.14, h: 0.14, fill: { color: lc }, line: { color: "FFFFFF", width: 1.5 } });
    T(s, rich(q.o.label, c.text, c.acc), { _label: `objects[${q.i}].label`, x: LX, y: q.ly, w: W - M - LX, h: 0.4, fontSize: 18, bold: true, color: c.text });
    if (q.o.sub) T(s, rich(q.o.sub, c.muted, c.text), { _label: `objects[${q.i}].sub`, x: LX, y: q.ly + 0.4, w: W - M - LX, h: 0.5, fontSize: 14, color: c.muted }); }
  foot(s, c, d.note);
};

// ---------- redline: so hai bản của MỘT điều luật theo từng chữ — chữ bị bỏ gạch ngang đỏ, chữ thêm tô nền + đậm ----------
// Dùng cho bài cập nhật luật / bình luận "luật cũ trả lời khác luật mới". Nhiều quy định → changelog; khác về NỘI DUNG (không phải câu chữ) → compare.
L.redline = async (s, c, d) => {
  kickerTitle(s, c, d);
  const o = d.old || {}, n = d.new || {}, parts = CA.wordDiff(o.text, n.text), hl = mix(c.acc, "FFFFFF", 0.8);
  // hàng nhãn: [văn bản cũ] → [văn bản mới] + chú giải cách đọc
  let x = M, y = BODY_Y - 0.02;
  const lab = (t, col, strike) => { const w = fitW(t, { fontFace: TH.bodyFont, fontSize: 15, bold: true }, 0.12, 0.11, 5.2);
    T(s, [{ text: t, options: { bold: true, color: col, strike: strike ? "sngStrike" : undefined } }], { _label: strike ? "old.label" : "new.label", x, y, w, h: 0.36, fontSize: 15, valign: "middle" }); x += w + 0.1; };
  if (o.label) lab(o.label, c.bad, false);
  if (o.label && n.label) { T(s, "→", { _label: "mũi tên", x, y, w: 0.35, h: 0.36, fontSize: 16, bold: true, color: c.muted, valign: "middle" }); x += 0.45; }
  if (n.label) lab(n.label, c.acc, false);
  const L1 = "bị bỏ", L2 = "thêm mới", lw1 = fitW(L1, { fontFace: TH.bodyFont, fontSize: 13 }, 0.1, 0.1, 1.4), lw2 = fitW(L2, { fontFace: TH.bodyFont, fontSize: 13, bold: true }, 0.1, 0.1, 1.4);
  let lx = W - M - lw2; T(s, [{ text: L2, options: { bold: true, color: c.acc, highlight: hl } }], { _label: "chú giải thêm", x: lx, y, w: lw2, h: 0.36, fontSize: 13, valign: "middle" });
  lx -= 0.3 + lw1; T(s, [{ text: L1, options: { color: c.bad, strike: "sngStrike" } }], { _label: "chú giải bỏ", x: lx, y, w: lw1, h: 0.36, fontSize: 13, valign: "middle" });
  // thân: một thẻ, chữ cỡ lớn nhất vừa khung (22 → 14pt)
  const by = BODY_Y + 0.55, bh = (d.note ? FOOT_Y - 0.2 : 6.85) - by, tw = W - 2 * M - 0.9;
  const runs = parts.map(q => ({ text: q.v, options: q.t === "del" ? { color: c.bad, strike: "sngStrike" } : q.t === "ins" ? { color: c.acc, bold: true, highlight: hl } : { color: c.text } }));
  let fz = 22; for (; fz > 14; fz -= 1) { const m = measure(runs, { fontFace: TH.bodyFont, fontSize: fz }, tw); if (m.ok && m.height * 1.06 + 0.3 <= bh - 0.5) break; }
  const th = realH(runs, { fontFace: TH.bodyFont, fontSize: fz }, tw, bh - 0.5) * 1.06 + 0.06, ch = Math.min(bh, th + 0.75); // dự phòng 6%: chữ đậm + gạch ngang đo lệch nhẹ so với bản dựng thật
  box(s, M, by, W - 2 * M, ch, c.card, isLight(c) ? c.line : null);
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: by, w: 0.09, h: ch, fill: { color: c.acc }, line: { type: "none" } });
  T(s, runs, { _label: "văn bản so sánh", x: M + 0.45, y: by + 0.36, w: tw, h: th + 0.04, fontSize: fz, fontFace: TH.bodyFont });
  foot(s, c, d.note);
};

// ---------- deadline: lịch tháng cho THỜI HẠN dài (thời hiệu khởi kiện, thời hạn kháng cáo tính bằng tháng/năm) ----------
// Mỗi hàng một năm × 12 ô tháng; phần đã trôi trong thời hạn tô màu nhấn theo đúng tỉ lệ ngày; mốc (khởi kiện, hết hạn…) là chấm đánh số.
// ENGINE KHÔNG TỰ TÍNH NGÀY HẾT HẠN (cách tính thời hạn — Điều 147–148 BLDS 2015 — có ngoại lệ): người dùng ghi rõ from / to.
L.deadline = async (s, c, d) => {
  kickerTitle(s, c, d);
  const A = parseD(d.from), B = parseD(d.to); if (!A || !B || B < A) return foot(s, c, "from / to phải là ngày dd/mm/yyyy, to sau from");
  const mk = (d.markers || []).slice(0, 4).map(m => ({ m, D: parseD(m.date) })).filter(q => q.D);
  const y0 = Math.min(A.getUTCFullYear(), ...mk.map(q => q.D.getUTCFullYear())), y1 = Math.max(B.getUTCFullYear(), ...mk.map(q => q.D.getUTCFullYear())), ny = Math.min(6, y1 - y0 + 1);
  const gx = M + 0.85, gw = 7.4, cw = gw / 12, top = BODY_Y + 0.45, avail = (d.note ? FOOT_Y - 0.25 : 6.85) - top, rh = Math.min(0.78, avail / ny), ch = rh * 0.62;
  const now = d.today ? parseD(d.today) : null, MS = 864e5;
  ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"].forEach((t, k) => T(s, t, { _label: "tháng", x: gx + k * cw, y: top - 0.38, w: cw, h: 0.3, fontSize: 12, color: c.muted, align: "center" }));
  for (let r = 0; r < ny; r++) { const yr = y0 + r, y = top + r * rh;
    T(s, String(yr), { _label: "năm", x: M, y, w: 0.8, h: ch, fontSize: 15, bold: true, color: c.text, valign: "middle" });
    for (let k = 0; k < 12; k++) { const a = Date.UTC(yr, k, 1), b = Date.UTC(yr, k + 1, 1), x = gx + k * cw + 0.03, w = cw - 0.06;
      s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: ch, fill: { color: c.bg }, line: { color: c.line, width: 0.75 } });
      const lo = Math.max(a, A.getTime()), hi = Math.min(b, B.getTime() + MS); if (hi <= lo) continue;
      const f0 = (lo - a) / (b - a), f1 = (hi - a) / (b - a), past = now && hi <= now.getTime() + MS;
      s.addShape(pres.shapes.RECTANGLE, { x: x + w * f0, y, w: Math.max(0.03, w * (f1 - f0)), h: ch, fill: { color: c.acc, transparency: now && !past ? 70 : 0 }, line: { type: "none" } }); } }
  if (now) { const ly2 = top + ny * rh + 0.02; s.addShape(pres.shapes.RECTANGLE, { x: gx, y: ly2 + 0.08, w: 0.24, h: 0.2, fill: { color: c.acc }, line: { type: "none" } });
    T(s, "đã trôi qua", { _label: "chú giải đã trôi", x: gx + 0.32, y: ly2, w: 1.4, h: 0.36, fontSize: 13, color: c.muted, valign: "middle" });
    s.addShape(pres.shapes.RECTANGLE, { x: gx + 1.85, y: ly2 + 0.08, w: 0.24, h: 0.2, fill: { color: c.acc, transparency: 70 }, line: { type: "none" } });
    T(s, "còn lại", { _label: "chú giải còn lại", x: gx + 2.17, y: ly2, w: 1.2, h: 0.36, fontSize: 13, color: c.muted, valign: "middle" }); }
  // mốc: chấm đánh số trên ô tháng, giải thích ở cột phải
  const px = (D) => { const a = Date.UTC(D.getUTCFullYear(), D.getUTCMonth(), 1), b = Date.UTC(D.getUTCFullYear(), D.getUTCMonth() + 1, 1); return gx + D.getUTCMonth() * cw + 0.03 + (cw - 0.06) * (D.getTime() - a) / (b - a); };
  const py = (D) => top + (D.getUTCFullYear() - y0) * rh + ch / 2;
  const all = [{ m: { date: d.from, label: d.fromLabel || "Bắt đầu tính" }, D: A }, ...mk, { m: { date: d.to, label: d.toLabel || "Hết hạn" }, D: B, end: true }].sort((p, q) => p.D - q.D);
  const rx = gx + gw + 0.45, rw = W - M - rx;
  const big = d.display || "", by = top - 0.4;
  if (big) T(s, big, { _label: "display", x: rx, y: by, w: rw, h: 0.9, fontSize: 44, fontFace: TH.numFont, italic: TH.numItalic, bold: TH.titleBold, color: c.acc });
  const lbH = d.label ? realH(rich(d.label, c.text, c.acc), { fontFace: TH.bodyFont, fontSize: 16 }, rw, 0.45) + 0.06 : 0; // đo thật: theme chữ đậm xuống 2 dòng
  if (d.label) T(s, rich(d.label, c.text, c.acc), { _label: "label", x: rx, y: by + (big ? 0.9 : 0), w: rw, h: lbH, fontSize: 16, color: c.text });
  let ly = by + (big ? 0.9 : 0) + (d.label ? lbH + 0.15 : 0.1); const lh = Math.min(0.8, (top + ny * rh - ly) / all.length);
  for (const [i, q] of all.entries()) { const col = q.end ? c.bad : c.acc;
    num(s, i + 1, px(q.D) - 0.15, py(q.D) - 0.15, 0.3, col, "FFFFFF", 11);
    num(s, i + 1, rx, ly + 0.03, 0.3, col, "FFFFFF", 11);
    T(s, q.m.date, { _label: `mốc ${i + 1} ngày`, x: rx + 0.42, y: ly, w: rw - 0.42, h: 0.3, fontSize: 13, bold: true, color: col });
    T(s, rich(q.m.label, c.text, c.acc), { _label: `mốc ${i + 1}`, x: rx + 0.42, y: ly + 0.28, w: rw - 0.42, h: lh - 0.3, fontSize: 14, color: c.text }); ly += lh; }
  foot(s, c, d.note);
};

L.photo = async (s, c, d) => {
  const dk = TH.d;
  // side: phía đặt chữ (mặc định trái); ảnh có chú thích → lớp tối hẹp hơn để chi tiết được chỉ vào còn rõ
  const rt = d.side === "right", co = (d.callouts || []).length > 0, TW = co ? 5.6 : 7.4, TX = rt ? W - M - TW : M;
  s.addImage({ _bg: dk.bg, data: await photo(d.photo, W, H, dk.bg, dk.bg, (rt ? "right" : "left") + (co ? "-narrow" : ""), 0.94, d.photoStyle || "tint"), x: 0, y: 0, w: W, h: H, altText: d.photoAlt || "Ảnh minh hoạ" });
  if (d.kicker) kicker(s, d.kicker, TX, KICK_Y + 0.9, dk.acc);
  // trích dẫn / kết luận: chữ có chân nghiêng (cả câu), từ khoá đổi màu
  const q = rich(d.title, dk.text, dk.acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { fontFace: TH.accentFont, italic: true, bold: false }) }));
  const mq = measure(noOrphan(q), { fontFace: TH.accentFont, fontSize: 36 }, TW), qh = mq.ok ? mq.height + 0.08 : 2.4;
  T(s, q, { _label: "title", x: TX, y: TITLE_Y + 0.9, w: TW, h: qh, fontSize: 36 });
  if (d.sub) T(s, rich(d.sub, dk.muted, dk.text), { x: TX, y: TITLE_Y + 0.9 + realH(q, { fontFace: TH.accentFont, fontSize: 36 }, TW, qh) + 0.4, w: TW - 0.4, h: 1.2, fontSize: 17, color: dk.muted });
  // chú thích đánh số chỉ thẳng vào chi tiết trong ảnh (x, y = tỉ lệ 0–1 theo bề ngang/dọc slide)
  for (const [i, co] of (d.callouts || []).slice(0, 3).entries()) {
    const px = W * co.x, py = H * co.y, lw = fitW(co.label, { fontFace: TH.bodyFont, fontSize: 14, bold: true }, 0.36, 0.11, 3.4), left = px + 0.4 + lw > W - 0.3;
    s.addShape(pres.shapes.OVAL, { x: px - 0.27, y: py - 0.27, w: 0.54, h: 0.54, fill: { color: "FFFFFF", transparency: 10 }, line: { type: "none" } });
    num(s, i + 1, px - 0.22, py - 0.22, 0.44, dk.acc === "FFFFFF" ? TH.gold : dk.acc, dk.bg, 14);
    addT(s, co.label, { _label: `callouts[${i}].label`, shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.12, x: left ? px - 0.38 - lw : px + 0.38, y: py - 0.2, w: lw, h: 0.4, fill: { color: dk.deep, transparency: 12 }, line: { type: "none" }, color: "FFFFFF", fontFace: TH.bodyFont, fontSize: 14, bold: true, align: "center", valign: "middle", margin: 0 });
  }
  await photoCredit(s, d.photo, d, dk.muted);
};

// ---------- split: bố cục "editorial bất đối xứng" — ảnh màu thật ~58%, thẻ chữ nổi đè lên mép ảnh ----------
async function photoMark(s, d, x0, y0, w0, h0, c) { // khoanh 1 điểm trên ảnh + nhãn: chỉ đúng chỗ người xem cần nhìn
  const m = d.photoMark; if (!m || m.x == null || m.y == null) return;
  const px = x0 + w0 * m.x, py = y0 + h0 * m.y;
  await mark(s, "ellipse", px - 0.55, py - 0.42, 1.1, 0.84, TH.gold, 8);
  if (m.label) { const lw = fitW(m.label, { fontFace: TH.bodyFont, fontSize: 13, bold: true }, 0.4, 0.11, 3.2), lx = Math.min(Math.max(px - lw / 2, x0 + 0.15), x0 + w0 - lw - 0.15);
    addT(s, m.label, { _label: "photoMark.label", shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.15, x: lx, y: Math.min(py + 0.5, y0 + h0 - 0.5), w: lw, h: 0.38, fill: { color: TH.d.deep, transparency: 15 }, line: { type: "none" }, color: "FFFFFF", fontFace: TH.bodyFont, fontSize: 13, bold: true, align: "center", valign: "middle", margin: 0 }); }
}
L.split = async (s, c, d, meta) => {
  const right = d.side !== "left", pw = W * 0.58, px = right ? W - pw : 0;
  s.addImage({ _bg: c.bg, data: await photo(d.photo, pw, H, null, null, "none", 0, d.photoStyle || "natural"), x: px, y: 0, w: pw, h: H, altText: d.photoAlt || "Ảnh minh hoạ" });
  await photoMark(s, d, px, 0, pw, H, c);
  const cw = 6.3, cx = right ? M : W - M - cw; // thẻ chữ đè lên mép ảnh ~0.9in; cao vừa nội dung, căn giữa theo chiều dọc
  const tt = rich(d.title, c.text, c.acc), th = realH(tt, { fontFace: TH.titleFont, fontSize: 30 }, cw - 0.9, 1.2);
  const logo = meta && meta.logo && fs.existsSync(meta.logo) && CUR.type === "cover", sh0 = d.sub ? realH(d.sub, { fontFace: TH.bodyFont, fontSize: 16 }, cw - 0.9, 0.8) + 0.35 : 0;
  const ch = (logo ? 0.7 : 0) + 0.85 + th + 0.3 + sh0 + Math.min(3, (d.items || []).length) * 1.0 + 0.3, cy = Math.max(0.6, (H - ch) / 2);
  box(s, cx, cy, cw, ch, "FFFFFF", c.line);
  let top = cy;
  if (logo) { s.addImage({ path: meta.logo, x: cx + 0.45, y: cy + 0.4, w: 1.59, h: 0.42, sizing: { type: "contain", w: 1.59, h: 0.42 } }); top += 0.7; }
  if (d.kicker) kicker(s, d.kicker, cx + 0.45, top + 0.4, c.acc);
  T(s, tt, { _label: "title", x: cx + 0.45, y: top + 0.85, w: cw - 0.9, h: th + 0.1, fontSize: 30 });
  let y = top + 0.85 + th + 0.3;
  if (d.sub) { const sh = realH(d.sub, { fontFace: TH.bodyFont, fontSize: 16 }, cw - 0.9, 0.8); T(s, d.sub, { x: cx + 0.45, y, w: cw - 0.9, h: sh + 0.1, fontSize: 16, color: c.muted }); y += sh + 0.35; }
  for (const [i, it] of (d.items || []).slice(0, 3).entries()) {
    if (it.icon) await circIcon(s, it.icon, cx + 0.45, y, 0.5, c.acc, c.onAcc); else num(s, i + 1, cx + 0.45, y + 0.04, 0.42, c.deep, c.acc, 13);
    T(s, it.head || "", { x: cx + 1.15, y: y - 0.02, w: cw - 1.6, h: 0.36, fontSize: 17, bold: true, color: c.text });
    if (it.text) T(s, it.text, { x: cx + 1.15, y: y + 0.34, w: cw - 1.6, h: 0.62, fontSize: 14, color: c.muted });
    y += 1.0;
  }
  await photoCredit(s, d.photo, d, null, right ? W - M - 6 : M, H - 0.36, 6);
};

// ---------- gallery: 2–3 ảnh dạng bento — ảnh đầu lớn nhất (quan trọng nhất), mỗi ảnh một chú thích ----------
L.gallery = async (s, c, d) => {
  kickerTitle(s, c, d);
  const ps = (d.photos || []).slice(0, 3), y0 = BODY_Y + 0.1, hh = FOOT_Y - 0.25 - y0, gap = 0.25;
  const slots = ps.length === 1 ? [[M, y0, W - 2 * M, hh]] : ps.length === 2 ? [[M, y0, 7.3, hh], [M + 7.3 + gap, y0, W - 2 * M - 7.3 - gap, hh]]
    : [[M, y0, 7.3, hh], [M + 7.3 + gap, y0, W - 2 * M - 7.3 - gap, (hh - gap) / 2], [M + 7.3 + gap, y0 + (hh - gap) / 2 + gap, W - 2 * M - 7.3 - gap, (hh - gap) / 2]];
  for (const [i, p] of ps.entries()) { const [x, y, w, h] = slots[i];
    s.addImage({ _bg: TH.d.bg, data: await photo(p.photo, w, h, null, TH.d.deep, "none", 0, p.photoStyle || d.photoStyle || "natural"), x, y, w, h, altText: p.alt || p.caption || "Ảnh" });
    s.addShape(pres.shapes.RECTANGLE, { x, y: y + h - 0.62, w, h: 0.62, fill: { color: TH.d.deep, transparency: 22 }, line: { type: "none" } });
    if (p.caption) T(s, rich(p.caption, "FFFFFF", TH.d.acc), { _label: `photos[${i}].caption`, x: x + 0.25, y: y + h - 0.56, w: w - 0.5, h: 0.5, fontSize: i ? 13 : 15, color: "FFFFFF", valign: "middle" });
    const cr = creditOf(p.photo, p); if (cr) CREDITS.push({ slide: CUR.n, text: cr, source: (PHOTOS[path.basename(String(p.photo))] || {}).source || p.photoSource || "" }); }
  foot(s, c, d.note);
};

// ---------- map: bản đồ Việt Nam (Natural Earth, phạm vi công cộng) — địa danh đánh số, danh sách bên phải dùng cùng số ----------
// LUÔN vẽ quần đảo Hoàng Sa và Trường Sa. Ranh giới tỉnh: trước sắp xếp đơn vị hành chính năm 2025.
let VNMAP = null;
const fold = (t) => String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/^(tinh|thanh pho|tp\.?)\s+/, "").trim();
function vnProvince(name, layer) { if (!VNMAP) VNMAP = require("./assets/vn_provinces.json"); const k = fold(name); return Object.entries(layer || VNMAP.provinces34).find(([n]) => fold(n) === k); }
L.map = async (s, c, d) => {
  kickerTitle(s, c, d);
  if (!VNMAP) VNMAP = require("./assets/vn_provinces.json");
  if ((d.groups || []).length) return mapGroups(s, c, d);
  const PV = d.admin === 63 ? VNMAP.provinces : VNMAP.provinces34;
  const [, , vw, vh] = VNMAP.viewBox, places = (d.places || []).slice(0, 4);
  const hi = places.map(p => vnProvince(p.name, PV)).filter(Boolean), hiNames = new Set(hi.map(h => h[0]));
  const P = (lon, lat) => [((lon - VNMAP.lon0) * VNMAP.k * VNMAP.scale), ((VNMAP.lat1 - lat) * VNMAP.scale)];
  // vùng phóng to = khung bao các tỉnh được nêu + lề 45%, theo tỉ lệ khung hiển thị
  const pts = hi.flatMap(([, p]) => [...p.d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map(m => [+m[1], +m[2]]));
  const zx = BODY_Y - 0.05, ZW = 4.55, ZH = FOOT_Y - 0.2 - zx;
  let [x0, y0, x1, y1] = pts.length ? [Math.min(...pts.map(q => q[0])), Math.min(...pts.map(q => q[1])), Math.max(...pts.map(q => q[0])), Math.max(...pts.map(q => q[1]))] : [0, 0, vw, vh];
  let bw = (x1 - x0) * 1.9 + 40, bh = (y1 - y0) * 1.9 + 40; const cxm = (x0 + x1) / 2, cym = (y0 + y1) / 2;
  if (bw / bh > ZW / ZH) bh = bw * ZH / ZW; else bw = bh * ZW / ZH;
  const zb = [cxm - bw / 2, cym - bh / 2, bw, bh];
  const provinces = (fillHi, fillLo, sw) => Object.entries(PV).map(([n, p]) => `<path d="${p.d}" fill="#${hiNames.has(n) ? fillHi : fillLo}" stroke="#FFFFFF" stroke-width="${sw}"/>`).join("");
  const isl = Object.values(VNMAP.islands).flat().map(([lo, la]) => { const [x, y] = P(lo, la); return `<circle cx="${x}" cy="${y}" r="5" fill="#${c.muted}"/>`; }).join("");
  // 1) bản đồ định vị toàn quốc (có Hoàng Sa, Trường Sa) + khung đỏ vùng phóng to
  const OH = 3.75, OW = OH * vw / vh, ox = M, oy = zx + (ZH - OH) / 2;
  const k1 = "mapO:" + [...hiNames] + c.acc; if (!ASSETS[k1]) ASSETS[k1] = await png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}">${provinces(c.acc, c.line, 0.8)}${isl}<rect x="${zb[0]}" y="${zb[1]}" width="${zb[2]}" height="${zb[3]}" fill="none" stroke="#${c.bad}" stroke-width="5"/></svg>`, 1200);
  s.addImage({ data: ASSETS[k1], x: ox, y: oy, w: OW, h: OH, altText: "Bản đồ Việt Nam (gồm quần đảo Hoàng Sa, Trường Sa), khung đỏ là vùng phóng to" });
  for (const [nm, ip] of Object.entries(VNMAP.islands)) { const cx = ip.reduce((a, q) => a + q[0], 0) / ip.length, cy = ip.reduce((a, q) => a + q[1], 0) / ip.length, [px, py] = P(cx, cy);
    const left = /Trường Sa/.test(nm); // Trường Sa: nhãn bên trái cụm đảo, tránh đường nối sang khung phóng to
    T(s, nm.replace("Quần đảo", "QĐ."), { _label: "đảo", x: ox + px / vw * OW - (left ? 1.75 : 0.85), y: oy + py / vh * OH + (left ? -0.14 : 0.18), w: 1.7, h: 0.28, fontSize: 12, italic: true, color: c.muted, align: left ? "right" : "center" }); }
  // 2) khung phóng to + 2 đường nối từ khung đỏ
  const zxp = ox + OW + 0.35, zyp = zx;
  const k2 = "mapZ:" + [...hiNames] + c.acc; if (!ASSETS[k2]) ASSETS[k2] = await png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${zb.join(" ")}"><rect x="${zb[0]}" y="${zb[1]}" width="${zb[2]}" height="${zb[3]}" fill="#${c.deep}"/>${provinces(c.acc, c.line, bw / 260)}</svg>`, 1600);
  s.addImage({ data: ASSETS[k2], x: zxp, y: zyp, w: ZW, h: ZH, altText: "Khung phóng to: " + places.map(p => p.name).join(", ") });
  s.addShape(pres.shapes.RECTANGLE, { x: zxp, y: zyp, w: ZW, h: ZH, fill: { type: "none" }, line: { color: c.bad, width: 1.5 } });
  const bx = ox + zb[0] / vw * OW, by = oy + zb[1] / vh * OH, bx2 = bx + zb[2] / vw * OW, by2 = by + zb[3] / vh * OH;
  for (const [ya, yb] of [[by, zyp], [by2, zyp + ZH]]) s.addShape(pres.shapes.LINE, { x: bx2, y: Math.min(ya, yb), w: zxp - bx2, h: Math.abs(yb - ya), flipV: yb < ya, line: { color: c.bad, width: 0.75, dashType: "dash" } });
  // ghim đánh số trong khung phóng to + mũi tên đường đi
  const toZ = ([x, y]) => [zxp + (x - zb[0]) / zb[2] * ZW, zyp + (y - zb[1]) / zb[3] * ZH];
  const pins = places.map((p, i) => { const f = vnProvince(p.name, PV); return f ? { i, p, xy: toZ(f[1].c) } : null; }).filter(Boolean);
  if (d.route) for (let k = 0; k + 1 < pins.length; k++) { const [x1_, y1_] = pins[k].xy, [x2_, y2_] = pins[k + 1].xy, L_ = Math.hypot(x2_ - x1_, y2_ - y1_) || 1, r = 0.3;
    const ax = x1_ + (x2_ - x1_) * r / L_, ay = y1_ + (y2_ - y1_) * r / L_, bx_ = x2_ - (x2_ - x1_) * r / L_, by_ = y2_ - (y2_ - y1_) * r / L_;
    s.addShape(pres.shapes.LINE, { x: Math.min(ax, bx_), y: Math.min(ay, by_), w: Math.abs(bx_ - ax), h: Math.abs(by_ - ay), flipH: bx_ < ax, flipV: by_ < ay, line: { color: c.bad, width: 2.5, dashType: "dash", endArrowType: "triangle" } }); }
  for (const { i, xy: [x, y] } of pins) { s.addShape(pres.shapes.OVAL, { x: x - 0.27, y: y - 0.27, w: 0.54, h: 0.54, fill: { color: "FFFFFF" }, line: { type: "none" } }); num(s, i + 1, x - 0.22, y - 0.22, 0.44, c.bad, "FFFFFF", 14); }
  // 3) danh sách: cùng số với ghim
  const lx = zxp + ZW + 0.4, lw = W - M - lx, rh = Math.min(1.5, (FOOT_Y - 0.3 - BODY_Y) / Math.max(1, pins.length));
  for (const [k, { i, p }] of pins.entries()) { const y = BODY_Y + 0.1 + k * rh;
    num(s, i + 1, lx, y, 0.46, c.bad, "FFFFFF", 14);
    T(s, p.label || p.name, { _label: `places[${i}].label`, x: lx + 0.62, y: y - 0.02, w: lw - 0.62, h: 0.42, fontSize: 19, bold: true, color: c.text });
    if (p.note) T(s, rich(p.note, c.muted, c.text), { _label: `places[${i}].note`, x: lx + 0.62, y: y + 0.42, w: lw - 0.62, h: rh - 0.5, fontSize: 14, color: c.muted }); }
  foot(s, c, [d.note, mapSrc(d)].filter(Boolean).join(" · "));
};
const mapSrc = (d) => "Bản đồ: Natural Earth (phạm vi công cộng)" + (d.admin === 63 ? " · ranh giới tỉnh trước sắp xếp năm 2025" : /202\/2025/.test(d.note || "") ? "" : " · 34 tỉnh, thành theo NQ 202/2025/QH15"); // note đã nêu NQ 202 → không lặp
// bản đồ tô màu nhóm tỉnh (choropleth theo nhóm): bản đồ lớn bên trái, số lớn + chú giải bên phải.
// Lớp 34 tỉnh vẽ thêm ranh giới tỉnh CŨ bằng nét mảnh mờ → người xem thấy mỗi tỉnh mới ghép từ những tỉnh nào.
async function mapGroups(s, c, d) {
  const a34 = d.admin !== 63, PV = a34 ? VNMAP.provinces34 : VNMAP.provinces, [, , vw, vh] = VNMAP.viewBox;
  const COL = [c.acc, TH.d.bg, c.bad], groups = d.groups.slice(0, 3).map((g, i) => {
    const names = g.preset ? Object.keys(PV).filter(n => (PV[n].from || [n]).length > 1 === (g.preset === "merged")) : (g.provinces || []).map(nm => (vnProvince(nm, PV) || [])[0]).filter(Boolean);
    return { g, names: new Set(names), col: g.tone === "bad" ? c.bad : g.tone === "muted" ? c.muted : COL[i] };
  });
  const colOf = (n) => (groups.find(q => q.names.has(n)) || {}).col;
  const fills = Object.entries(PV).map(([n, p]) => `<path d="${p.d}" fill="#${colOf(n) || c.line}"/>`).join("");
  const oldLines = a34 ? Object.values(VNMAP.provinces).map(p => `<path d="${p.d}" fill="none" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="0.7" stroke-dasharray="2.5 2"/>`).join("") : "";
  const borders = Object.values(PV).map(p => `<path d="${p.d}" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linejoin="round"/>`).join("");
  const P = (lon, lat) => [((lon - VNMAP.lon0) * VNMAP.k * VNMAP.scale), ((VNMAP.lat1 - lat) * VNMAP.scale)];
  const isl = Object.values(VNMAP.islands).flat().map(([lo, la]) => { const [x, y] = P(lo, la); return `<circle cx="${x}" cy="${y}" r="5" fill="#${c.muted}"/>`; }).join("");
  const OH = FOOT_Y - 0.1 - (BODY_Y - 0.25), OW = OH * vw / vh, ox = M - 0.1, oy = BODY_Y - 0.25;
  const k = "mapG:" + d.admin + groups.map(q => [...q.names].join("|") + q.col).join("/");
  if (!ASSETS[k]) ASSETS[k] = await png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vw} ${vh}">${fills}${oldLines}${borders}${isl}</svg>`, 1800);
  s.addImage({ data: ASSETS[k], x: ox, y: oy, w: OW, h: OH, altText: "Bản đồ Việt Nam (gồm quần đảo Hoàng Sa, Trường Sa) tô màu theo nhóm: " + groups.map(q => `${q.g.label} (${q.names.size})`).join("; ") });
  for (const [nm, ip] of Object.entries(VNMAP.islands)) { const cx = ip.reduce((a, q) => a + q[0], 0) / ip.length, cy = ip.reduce((a, q) => a + q[1], 0) / ip.length, [px, py] = P(cx, cy);
    T(s, nm.replace("Quần đảo", "QĐ."), { _label: "đảo", x: ox + px / vw * OW - 0.85, y: oy + py / vh * OH + 0.2, w: 1.7, h: 0.28, fontSize: 12, italic: true, color: c.muted, align: "center" }); }
  // cột phải: con số lớn → chú giải (ô màu + tên nhóm + số tỉnh đếm từ bản đồ, không gõ tay)
  const rx = ox + OW + 0.2, rw = W - M - rx; let y = BODY_Y;
  if (d.stat) { T(s, d.stat.value, { _label: "stat.value", x: rx, y: y - 0.3, w: rw, h: 1.4, fontSize: 80, fontFace: TH.numFont, italic: TH.numItalic, bold: TH.titleBold, color: c.acc, valign: "top" });
    if (d.stat.label) T(s, rich(d.stat.label, c.muted, c.text), { _label: "stat.label", x: rx, y: y + 1.05, w: rw, h: 0.4, fontSize: 16, color: c.muted });
    y += 1.75; s.addShape(pres.shapes.LINE, { x: rx, y: y - 0.12, w: rw, h: 0, line: { color: c.line, width: 1 } }); }
  const rh = Math.min(1.25, (FOOT_Y - 0.15 - y) / groups.length);
  for (const q of groups) {
    s.addShape(TH.radius ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, { x: rx, y: y + 0.1, w: 0.34, h: 0.34, rectRadius: 0.06, fill: { color: q.col }, line: { type: "none" } });
    T(s, String(q.names.size), { _label: "số tỉnh", x: rx + 0.5, y: y - 0.02, w: 0.9, h: 0.55, fontSize: 30, fontFace: TH.numFont, italic: TH.numItalic, bold: true, color: q.col, valign: "middle" });
    T(s, q.g.label, { _label: "groups.label", x: rx + 1.4, y: y + 0.03, w: rw - 1.4, h: 0.48, fontSize: 18, bold: true, color: c.text, valign: "middle" });
    if (q.g.note) T(s, rich(q.g.note, c.muted, c.text), { _label: "groups.note", x: rx + 1.4, y: y + 0.5, w: rw - 1.4, h: rh - 0.55, fontSize: 14, color: c.muted });
    y += rh;
  }
  foot(s, c, [d.note, mapSrc(d) + (a34 ? " · nét đứt: ranh giới tỉnh cũ" : "")].filter(Boolean).join(" · "));
}

// ---------- table: bảng số liệu gốc — đi TRƯỚC slide biểu đồ để người nghe thấy số liệu và nguồn ----------
L.table = async (s, c, d) => {
  kickerTitle(s, c, d);
  if (NATIVE) { // BẢNG GỐC CỦA POWERPOINT: sửa ô trực tiếp, thêm/bớt dòng bằng Table Design
    const cols = (d.cols || []).slice(0, 5), rows = (d.rows || []).slice(0, 6), tw = W - 2 * M;
    const len = cols.map((cl, j) => Math.max(String(cl.label || "").length, ...rows.map(r => String((r || [])[j] || "").length), 4)), tot = len.reduce((a, x) => a + x, 0);
    const head = cols.map(cl => ({ text: String(cl.label).toUpperCase(), options: { bold: true, color: c.onAcc, fill: { color: c.acc }, fontSize: 12.5, align: cl.align || "left", charSpacing: 1 } }));
    const body = rows.map((r, i) => cols.map((cl, j) => ({ text: String((r || [])[j] == null ? "" : r[j]), options: { bold: j === 0 || d.focus === i, color: d.focus === i && j ? c.acc : c.text, fontSize: 16, align: cl.align || "left",
      fill: { color: d.focus === i ? mix(c.acc, "FFFFFF", 0.86) : i % 2 ? c.deep : c.card } } })));
    const rh = Math.min(0.88, (FOOT_Y - 0.25 - BODY_Y - 0.1 - 0.5) / Math.max(1, rows.length));
    s.addTable([head, ...body], { x: M, y: BODY_Y + 0.1, w: tw, colW: len.map(l => tw * l / tot), rowH: [0.5, ...rows.map(() => rh)], fontFace: TH.bodyFont, valign: "middle", margin: [0, 0.18, 0, 0.18], border: { type: "solid", pt: 0.75, color: c.line } });
    foot(s, c, d.note);
    return;
  }
  const cols = (d.cols || []).slice(0, 5), rows = (d.rows || []).slice(0, 6), nc = cols.length;
  const len = cols.map((cl, j) => Math.max(String(cl.label || "").length, ...rows.map(r => String((r || [])[j] || "").length), 4));
  const tw = W - 2 * M, tot = len.reduce((a, b) => a + b, 0), cw = len.map(l => tw * l / tot);
  const xs = cw.map((_, j) => M + cw.slice(0, j).reduce((a, b) => a + b, 0));
  const y0 = BODY_Y + 0.1, hh = 0.5, rh = Math.min(0.88, (FOOT_Y - 0.25 - y0 - hh) / Math.max(1, rows.length));
  box(s, M, y0, tw, hh + rh * rows.length, c.card, c.line);
  s.addShape(TH.radius ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, Object.assign({ x: M, y: y0, w: tw, h: hh, fill: { color: c.acc }, line: { type: "none" } }, TH.radius ? { rectRadius: TH.radius } : {}));
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: y0 + hh - 0.15, w: tw, h: 0.15, fill: { color: c.acc }, line: { type: "none" } });
  cols.forEach((cl, j) => T(s, String(cl.label).toUpperCase(), { _label: `cols[${j}].label`, x: xs[j] + 0.25, y: y0, w: cw[j] - 0.5, h: hh, fontSize: 12.5, bold: true, color: c.onAcc, charSpacing: 1, valign: "middle", align: cl.align || "left" }));
  rows.forEach((r, i) => { const y = y0 + hh + i * rh, f = d.focus === i;
    if (f) s.addShape(pres.shapes.RECTANGLE, { x: M, y, w: tw, h: rh, fill: { color: c.acc, transparency: 86 }, line: { type: "none" } });
    else if (i % 2) s.addShape(pres.shapes.RECTANGLE, { x: M, y, w: tw, h: rh, fill: { color: c.deep, transparency: 40 }, line: { type: "none" } });
    if (i) s.addShape(pres.shapes.LINE, { x: M, y, w: tw, h: 0, line: { color: c.line, width: 0.75 } });
    cols.forEach((cl, j) => T(s, String((r || [])[j] == null ? "" : r[j]), { _label: `rows[${i}][${j}]`, x: xs[j] + 0.25, y: y + 0.04, w: cw[j] - 0.5, h: rh - 0.08, /* lề trong 0.25 hai bên: chữ căn phải không chạm nét khoanh vẽ tay */ fontSize: 16, bold: j === 0 || f, color: f && j ? c.acc : c.text, valign: "middle", align: cl.align || "left" })); });
  worldTable(s, c, M, y0, tw, hh, rows.length, rh, xs);
  if (Number.isInteger(d.focus) && d.focus < rows.length) await mark(s, "box", M + 0.05, y0 + hh + d.focus * rh + 0.03, tw - 0.1, rh - 0.06, TH.gold, 6);
  foot(s, c, d.note);
};

// ---------- flow: sơ đồ quan hệ các bên, mũi tên có nhãn ----------
// Các bên xếp thành một hàng; mũi tên trái→phải đi phía trên, phải→trái đi phía dưới, tự xếp tầng để không đè nhau.
function vline(s, x, y1, y2, ln, arrow) { // đoạn thẳng đứng từ y1 tới y2 (mũi tên ở y2)
  const o = Object.assign({}, ln); if (arrow) { o.endArrowType = "triangle"; }
  s.addShape(pres.shapes.LINE, { x, y: Math.min(y1, y2), w: 0, h: Math.abs(y2 - y1), flipV: y2 < y1, line: o });
}
L.flow = async (s, c, d) => {
  const y0 = kickerTitle(s, c, d);
  const nodes = (d.nodes || []).slice(0, 5), n = nodes.length, edges = (d.edges || []).slice(0, 6);
  // ít nút (2) thì nút không kéo dài nửa slide (thẻ rộng mà trống) — tối đa 4.2 in, cả cụm căn giữa
  const gap = n <= 2 ? 2.0 : n <= 3 ? 1.3 : 0.7, nw = Math.min(4.2, (W - 2 * M - gap * (n - 1)) / n), fx0 = (W - (n * nw + gap * (n - 1))) / 2;
  let nh = 1.6; // chiều cao nút: tính lại sau khi biết số tầng mũi tên (nút to ra khi còn chỗ)
  let top = 0, bot = 0; // tính sau khi biết số tầng mũi tên trên/dưới
  const idx = Object.fromEntries(nodes.map((nd, i) => [nd.id, i])), nx = (i) => fx0 + i * (nw + gap);
  // điểm gắn mũi tên: chia đều trên cạnh trên/dưới của mỗi bên, xếp theo vị trí bên kia
  const es = edges.filter(e => e.from in idx && e.to in idx && e.from !== e.to).map(e => ({ e, a: idx[e.from], b: idx[e.to], up: e.side ? e.side === "above" : idx[e.from] < idx[e.to] })); // side: đặt mũi tên phía trên/dưới các nút (tránh cắt nhau)
  for (const side of [true, false]) for (let i = 0; i < n; i++) {
    const ends = [];
    es.filter(q => q.up === side).forEach(q => { if (q.a === i) ends.push([q, "xa", q.b]); if (q.b === i) ends.push([q, "xb", q.a]); });
    ends.sort((p, q) => p[2] - q[2]).forEach(([q, k], j) => { q[k] = nx(i) + nw * (j + 1) / (ends.length + 1); });
  }
  // xếp tầng: cạnh ngắn ở tầng sát hộp, cạnh dài lên tầng ngoài
  for (const side of [true, false]) {
    const used = [];
    es.filter(q => q.up === side).sort((p, q) => Math.abs(p.xb - p.xa) - Math.abs(q.xb - q.xa)).forEach(q => {
      const lo = Math.min(q.xa, q.xb), hi = Math.max(q.xa, q.xb);
      let lv = 0; while ((used[lv] || []).some(([l, h]) => lo < h + 0.1 && hi > l - 0.1)) lv++;
      (used[lv] = used[lv] || []).push([lo, hi]); q.lv = Math.min(lv, 1);
    });
    // ĐƯỜNG CẮT NHAU: chân dọc của mũi tên tầng ngoài đi xuyên đoạn ngang của mũi tên tầng trong (hoặc hai mũi tên cùng tầng chồng nhau)
    const S = es.filter(q => q.up === side);
    for (const p of S) for (const q of S) { if (p === q) continue; const lo = Math.min(p.xa, p.xb), hi = Math.max(p.xa, p.xb);
      const hit = (q.lv > p.lv && [q.xa, q.xb].some(x => x > lo + 0.05 && x < hi - 0.05)) || (q.lv === p.lv && p.e !== q.e && Math.min(hi, Math.max(q.xa, q.xb)) - Math.max(lo, Math.min(q.xa, q.xb)) > 0.05 && edges.indexOf(p.e) < edges.indexOf(q.e));
      if (hit) FLOW_CROSS.push({ kind: "cross", msg: `Slide ${CUR.n} (flow): mũi tên "${q.e.label}" cắt mũi tên "${p.e.label}" — đặt "side": "${side ? "below" : "above"}" cho một trong hai, đổi thứ tự nodes, hoặc bớt mũi tên` }); }
  }
  // đặt sơ đồ vào giữa vùng trống giữa tiêu đề và ghi chú
  const la = Math.max(0, ...es.filter(q => q.up).map(q => q.lv + 1)), lb = Math.max(0, ...es.filter(q => !q.up).map(q => q.lv + 1));
  const ext = (l) => l ? 0.5 + (l - 1) * 0.6 + 0.25 : 0, y1 = y0 + 0.25, y2 = d.note ? 6.45 : 7.0;
  nh = Math.max(1.6, Math.min(2.4, y2 - y1 - ext(la) - ext(lb) - 0.3)); // còn chỗ → nút cao hơn, chữ to hơn (không để sơ đồ nhỏ giữa khoảng trắng)
  const big = nh >= 1.85, tot = ext(la) + nh + ext(lb);
  top = y1 + Math.max(0, (y2 - y1 - tot) / 2) + ext(la); bot = top + nh;
  for (const q of es) {
    const col = q.e.tone === "bad" ? c.bad : q.e.tone === "muted" ? c.muted : c.acc;
    const ln = { color: col, width: 2.25 }; if (q.e.dash) ln.dashType = "dash";
    const yb = q.up ? top : bot, yl = q.up ? top - 0.5 - q.lv * 0.6 : bot + 0.5 + q.lv * 0.6;
    vline(s, q.xa, yb, yl, ln, false);
    s.addShape(pres.shapes.LINE, { x: Math.min(q.xa, q.xb), y: yl, w: Math.abs(q.xb - q.xa), h: 0, line: ln });
    vline(s, q.xb, yl, yb, ln, true);
    const lw = Math.max(1.2, fitW(q.e.label, { fontFace: TH.bodyFont, fontSize: 12.5, bold: true }, 0.4, 0.093, Math.abs(q.xb - q.xa) - 0.3));
    addT(s, q.e.label, { _label: "nhãn mũi tên", shape: TH.radius ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, rectRadius: 0.19,
      // cạnh vượt qua nút khác: nhãn đặt sát đầu nguồn để không bị đọc nhầm là của nút ở giữa
      x: Math.abs(q.b - q.a) > 1 ? (q.xa < q.xb ? q.xa - 0.2 : q.xa + 0.2 - lw) : (q.xa + q.xb) / 2 - lw / 2, y: yl - 0.19, w: lw, h: 0.38, fill: { color: c.bg }, line: { color: col, width: 1 },
      color: col, fontFace: TH.bodyFont, fontSize: 12.5, bold: true, align: "center", valign: "middle", margin: 0 });
  }
  for (const [i, nd] of nodes.entries()) {
    const x = nx(i);
    box(s, x, top, nw, nh, c.card, c.line);
    const id = big ? 0.72 : 0.56, pad = big ? 0.28 : 0.22, ny = big ? top + nh - 1.12 : top + 0.86;
    await circIcon(s, nd.icon || "FaUser", x + pad, top + pad, id, c.acc, c.onAcc);
    if (nd.tag) T(s, nd.tag.toUpperCase(), { _label: "tag", x: x + pad + id + 0.14, y: top + pad + id / 2 - 0.25, w: nw - pad - id - 0.24, h: 0.5, fontSize: big ? 12 : 11, bold: true, color: c.acc, charSpacing: 1, valign: "middle" });
    // cỡ tên: to nhất mà vẫn một dòng với font của theme (Arial đậm rộng hơn Calibri)
    const nfs = big ? [22, 20, 19].find(z => { const tw = textW(nd.name, { fontFace: TH.bodyFont, fontSize: z, bold: true }); return tw == null || tw * 1.04 <= (nw - 0.4) * 0.97; }) || 19 : 19;
    T(s, nd.name, { x: x + pad, y: ny, w: nw - 0.4, h: big ? 0.45 : 0.38, fontSize: nfs, bold: true, color: c.text });
    if (nd.who) T(s, nd.who, { x: x + pad, y: ny + (big ? 0.46 : 0.34), w: nw - 0.4, h: big ? 0.36 : 0.3, fontSize: big ? 16 : 13.5, color: c.muted });
  }
  foot(s, c, d.note);
};

// ---------- ledger: mỗi bên bỏ ra / nhận về bao nhiêu, còn lại bao nhiêu ----------
const fmtN = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toLocaleString("vi-VN");
L.ledger = async (s, c, d) => {
  const y0 = kickerTitle(s, c, d);
  const rows = (d.rows || []).slice(0, 4).map(r => ({ r, st: (r.steps || []).slice(0, 3), net: (r.steps || []).slice(0, 3).reduce((a, x) => a + (+x.value || 0), 0) }));
  const ax = 6.55, half = 3.05, nx = 10.35;
  const mx = Math.max(1, ...rows.map(q => Math.max(q.st.filter(x => x.value > 0).reduce((a, x) => a + x.value, 0), -q.st.filter(x => x.value < 0).reduce((a, x) => a + x.value, 0))));
  const k = half / mx, hy = y0 + 0.1;
  T(s, "BỎ RA", { _label: "đầu cột", x: ax - 2.0, y: hy, w: 1.9, h: 0.3, fontSize: 11.5, bold: true, color: c.bad, align: "right", charSpacing: 2 });
  T(s, "NHẬN VỀ", { _label: "đầu cột", x: ax + 0.1, y: hy, w: 1.9, h: 0.3, fontSize: 11.5, bold: true, color: c.good, charSpacing: 2 });
  T(s, ("CÒN LẠI" + (d.unit ? " · " + d.unit : "")).toUpperCase(), { _label: "đầu cột", x: nx - 2, y: hy, w: W - M - nx + 2, h: 0.3, fontSize: 11.5, bold: true, color: c.muted, align: "right", charSpacing: 2 });
  const ry0 = hy + 0.45, avail = (d.note ? 6.55 : 7.0) - ry0, rh = Math.min(1.25, avail / Math.max(1, rows.length));
  s.addShape(pres.shapes.LINE, { x: ax, y: ry0 - 0.05, w: 0, h: rh * rows.length, line: { color: c.text, width: 1.25 } });
  for (const [i, q] of rows.entries()) {
    const y = ry0 + i * rh;
    if (q.r.focus) box(s, M - 0.15, y + 0.02, W - 2 * M + 0.3, rh - 0.08, c.deep);
    if (i) s.addShape(pres.shapes.LINE, { x: M, y, w: W - 2 * M, h: 0, line: { color: c.line, width: 0.75 } });
    T(s, q.r.name, { x: M, y: y + 0.17, w: 2.75, h: 0.4, fontSize: 19, bold: true, color: c.text });
    if (q.r.sub) T(s, q.r.sub, { x: M, y: y + 0.55, w: 2.75, h: 0.32, fontSize: 13, color: c.muted });
    let pos = ax, neg = ax;
    for (const st of q.st) {
      const v = +st.value || 0, w = Math.max(0.05, Math.abs(v) * k), x = v >= 0 ? pos : neg - w, col = v >= 0 ? c.good : c.bad;
      if (v >= 0) pos += w + 0.03; else neg -= w + 0.03;
      s.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.18, w, h: 0.42, fill: { color: col }, line: { type: "none" } });
      const inside = w >= 0.75;
      T(s, fmtN(v), { _label: "giá trị", x: inside ? x : (v >= 0 ? x + w + 0.05 : x - 0.85), y: y + 0.18, w: inside ? w : 0.8, h: 0.42, fontSize: 13, bold: true,
        color: inside ? (TH.d.bg === c.bg ? c.bg : "FFFFFF") : col, align: inside ? "center" : (v >= 0 ? "left" : "right"), valign: "middle" });
      const lw = Math.max(w, 1.7);
      T(s, st.label, { x: Math.min(Math.max(x + w / 2 - lw / 2, 3.45), nx - 0.2 - lw), y: y + 0.66, w: lw, h: 0.3, fontSize: 12.5, color: c.muted, align: "center" });
    }
    const col = q.net < 0 ? c.bad : q.net > 0 ? c.good : c.muted;
    T(s, q.r.result != null ? String(q.r.result) : fmtN(q.net), { _label: "còn lại", x: nx, y: y + 0.08, w: W - M - nx, h: 0.65, fontSize: 32, bold: !TH.numItalic, fontFace: TH.numFont, italic: TH.numItalic, color: col, align: "right", valign: "middle" });
    if (q.r.focus) await mark(s, "ellipse", W - M - 1.95, y - 0.02, 2.15, 0.9, c.bad, 5); // khoanh con số kết luận của dòng được nhấn
  }
  foot(s, c, d.note);
};

// default mode per type (dark/light rhythm)

// ================= BỐ CỤC BỔ SUNG (đợt 11/2026) =================
// Nhóm theo phân loại SmartArt của Microsoft (List · Process · Cycle · Hierarchy · Relationship · Matrix · Pyramid · Picture)
// và "Visual Vocabulary" của Financial Times (MIT): mỗi hình trả lời MỘT kiểu câu hỏi của người nghe.
// Mọi hình là shape gốc của PowerPoint (sửa được), chữ luôn ở ô chữ riêng để đo tràn.
// chip: nhãn nhỏ nền nhạt (thời hạn, điều kiện) — 12.5pt đậm, rộng vừa chữ
function chip(s, text, x, y, c, o = {}) {
  // bộ chất liệu: nhãn ngày / thời hạn / căn cứ mang hình riêng của thế giới (tab hồ sơ, ruy băng, viên thuốc) — tách "dữ kiện" khỏi lời bình
  const kt = KIT && !o.fill ? KIT.tag : null, extra = kt && kt.shape === "PENTAGON" ? 0.22 : 0;
  const t = String(text), w = fitW(t, { fontFace: TH.bodyFont, fontSize: 12.5, bold: true }, 0.36, 0.1, o.max || 4.0) + extra;
  const cx = o.center ? x - w / 2 : o.right ? x - w : x; // right: x là mép phải
  const look = !kt ? { shape: TH.radius ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, fill: { color: o.fill || c.deep }, line: { color: o.line || c.line, width: 1 }, color: o.color || c.text }
    : kt.style === "solid" ? { shape: pres.shapes[kt.shape], fill: { color: c.acc }, line: { type: "none" }, color: c.onAcc }
    : { shape: pres.shapes[kt.shape], fill: { color: mix(c.acc, c.bg, 0.86) }, line: { color: mix(c.acc, c.bg, 0.6), width: 1 }, color: (lum(c.bg) > 0.4 ? darkOn : lightOn)(c.acc, mix(c.acc, c.bg, 0.86)) };
  addT(s, t, Object.assign({ _label: o._label, rectRadius: 0.17, x: cx, y, w, h: 0.36, fontFace: TH.bodyFont, fontSize: 12.5, bold: true, align: "center", valign: "middle", margin: 0 }, look, extra ? { inset: 0 } : {}));
  return w;
}
// ---------- BỘ DỰNG HÌNH (engine/shapes.js): hình cơ bản → gộp → hình tự do của PowerPoint; "Tô bằng ảnh" thật ----------
const SH = require("./shapes");
let PICFILL = [], FRAME_DEF = null, PAPER = false; // ảnh chờ nhúng vào hình (hậu xử lý); meta.frame; meta.paper
// vẽ một hình đã gộp thành custGeom; picture → hình mang tên "PICFILL:n", nativePictures() thay phần tô màu bằng tô ảnh
function drawShape(s, sh, o = {}) { const { box: b, points } = SH.toPoints(sh);
  const opt = { x: b.x, y: b.y, w: b.w, h: b.h, points, fill: { color: o.fill || "FFFFFF" }, line: o.line ? { color: o.line, width: o.lineW || 1.5 } : { type: "none" } };
  if (o.picture) { PICFILL.push(o.picture); opt.objectName = `PICFILL:${PICFILL.length - 1}`; }
  s.addShape(pres.shapes.CUSTOM_GEOMETRY, opt); return b; }
// ảnh trong khung (cách làm trong bài mẫu): khung = công thức ghép hình (SH.FRAMES) → bản sao phóng lớn nhẹ, màu nhạt, đặt dưới làm viền
// → khung trên "Tô bằng ảnh". Mở PowerPoint: bấm vào khung → Định dạng hình › Tô › Ảnh để thay ảnh, kéo giãn khung như hình thường.
// Chỉ slide chương / slide kết dùng (bố cục riêng framedSection / framedEnd — khung không bị thẻ đè). split, photostats giữ ảnh tràn mép:
// bố cục của chúng là thẻ chữ đè mép ảnh, đặt khung vào sẽ bị thẻ che (đã thử, trông như lỗi).
async function placePhoto(s, c, d, x, y, w, h, alt, bg, acc = c.acc) { // acc: màu nhấn đang dùng cho chữ của slide (thường lấy từ ảnh) — viền cùng tông với chữ
  const kind = d.frame || FRAME_DEF;
  const pad = 0.38, rim = 0.13, sh = SH.frame(kind, x + pad, y + pad, w - 2 * pad, h - 2 * pad), b = SH.bbox(sh);
  drawShape(s, SH.grow(sh, rim), { fill: mix(acc, c.bg, 0.72) });
  const buf = Buffer.from((await photo(d.photo, b.w, b.h, null, null, "none", 0, d.photoStyle || "natural")).split(",")[1], "base64");
  drawShape(s, sh, { fill: TH.d.bg, picture: { buf, ext: "jpeg", alt: d.photoAlt || alt } });
}
// Mở chương NỀN ẢNH MỜ + LỚP MÀU (photoLayout "backdrop"): ảnh thật phủ kín slide, làm mờ thành "không khí" (không tranh chỗ với chữ),
// lớp màu tối của theme bên trái nhạt dần sang màu nhấn bên phải; chữ lớn màu sáng. Ảnh mờ nên ảnh hơi kém nét / nền rối vẫn dùng được.
async function sectionBackdrop(s, c, d, parts, cur, numTxt) {
  const dk = TH.d, many = parts.length >= 2 && parts.includes(cur), k = `backdrop:${d.photo}:${dk.bg}:${c.acc}:${FOCUS}`;
  if (!ASSETS[k]) { const px = 1600, py = 900, base = await sharp(path.resolve(DECK_DIR, d.photo)).rotate().resize(px, py, { fit: "cover", position: FOCUS || sharp.strategy.attention }).blur(14).modulate({ saturation: 0.8 }).toBuffer();
    const wash = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${py}"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#${dk.bg}" stop-opacity=".93"/><stop offset=".55" stop-color="#${dk.bg}" stop-opacity=".78"/><stop offset="1" stop-color="#${c.acc}" stop-opacity=".55"/></linearGradient></defs><rect width="${px}" height="${py}" fill="url(#g)"/></svg>`);
    ASSETS[k] = "image/jpeg;base64," + (await sharp(base).composite([{ input: wash }]).jpeg({ quality: 84 }).toBuffer()).toString("base64"); }
  s.addImage({ _bg: dk.bg, data: ASSETS[k], x: 0, y: 0, w: W, h: H, altText: d.photoAlt || "Ảnh mở đầu chương (làm mờ)" });
  CUR.noMotif = true; await photoCredit(s, d.photo, d, null, W - M - 6, H - 0.36, 6);
  const x0 = M, tw = 8.4, inside = (Array.isArray(d.inside) ? d.inside : d._inside || []).slice(0, 3), tot = String(parts.length).padStart(2, "0");
  const tr = rich(d.title, dk.text, dk.acc).map(r => (r.options.fontFace === TH.titleFont ? { text: r.text, options: Object.assign({}, r.options, { bold: true }) } : r));
  let tfs = 48, th = 1.4; for (tfs of [50, 46, 42, 38]) { const m = measure(noOrphan(tr), { fontFace: TH.titleFont, fontSize: tfs }, tw); th = m.ok ? m.height * 1.04 + 0.1 : 1.5; if (!m.ok || m.lines <= 2) break; }
  const sh = d.sub ? realH(d.sub, { fontFace: TH.bodyFont, fontSize: 21 }, tw, 0.6) + 0.06 : 0, ih = inside.map(t => realH(t, { fontFace: TH.bodyFont, fontSize: 19 }, tw - 0.45, 0.35) + 0.12);
  const blk = 1.75 + th + (sh ? 0.2 + sh : 0) + (inside.length ? 0.5 + 0.45 + ih.reduce((a, b) => a + b, 0) : 0);
  let y = Math.max(0.5, Math.min((H - 0.8 - blk) / 2, H - 1.45 - blk));
  T(s, numTxt, { _label: "num", x: x0 - 0.06, y: y - 0.4, w: 3.6, h: 2.0, fontSize: 120, fontFace: TH.numFont, italic: TH.numItalic, bold: TH.titleBold, color: dk.acc, valign: "bottom" });
  if (many) T(s, `/ ${tot}`, { _label: "tổng số chương", x: x0 + (textW(numTxt, { fontFace: TH.numFont, fontSize: 120, italic: TH.numItalic, bold: TH.titleBold }) || 2.6) + 0.1, y: y + 0.85, w: 1.3, h: 0.55, fontSize: 26, fontFace: TH.numFont, italic: TH.numItalic, color: dk.muted });
  y += 1.75; T(s, tr, { _label: "title", x: x0, y, w: tw, h: th, fontSize: tfs }); y += th;
  if (d.sub) { y += 0.2; T(s, rich(d.sub, dk.muted, dk.text), { _label: "sub", x: x0, y, w: tw, h: sh, fontSize: 21, color: dk.muted }); y += sh; }
  if (inside.length) { y += 0.5; s.addShape(pres.shapes.LINE, { x: x0, y: y - 0.14, w: 5.6, h: 0, line: { color: dk.line, width: 1 } });
    T(s, `TRONG ${PART_WORD.toUpperCase()} NÀY`, { _label: "trong chương này", x: x0, y, w: tw, h: 0.34, fontSize: 14, bold: true, color: dk.acc, charSpacing: 1.5 }); y += 0.45;
    for (const [i, t] of inside.entries()) { s.addShape(pres.shapes.OVAL, { x: x0 + 0.04, y: y + 0.13, w: 0.14, h: 0.14, fill: { color: dk.acc }, line: { type: "none" } });
      T(s, t, { _label: `trong chương ${i + 1}`, x: x0 + 0.38, y, w: tw - 0.45, h: ih[i] - 0.08, fontSize: 19, color: dk.text }); y += ih[i]; } }
  if (many) { const bw = 7.2, gap = 0.12, sw = (bw - gap * (parts.length - 1)) / parts.length;
    parts.forEach((p, i) => { const on = p === cur; s.addShape(pres.shapes.RECTANGLE, { x: x0 + i * (sw + gap), y: H - 1.0, w: sw, h: on ? 0.1 : 0.06, fill: { color: dk.acc, transparency: p <= cur ? 0 : 65 }, line: { type: "none" } });
      T(s, PARTS[p] || "", { _label: `chương ${p}`, x: x0 + i * (sw + gap), y: H - 0.84, w: sw, h: 0.6, fontSize: 15, bold: on, color: on ? dk.text : dk.muted }); }); }
}
const framed = (d) => !!(d.photo && (d.frame || FRAME_DEF) && (d.frame || FRAME_DEF) !== "none");
// Slide chương / slide kết CÓ KHUNG: khung là điểm nhìn chính nên KHÔNG có gì đè lên (bài mẫu: chữ xếp quanh khung, không che khung).
// Khung chiếm ~45% phải, cao gần hết slide; cột chữ trái đặt thẳng trên nền, cỡ chữ cho máy chiếu (tiêu đề ≥ 40, thân ≥ 20).
const FRAME_BOX = { x: 7.05, y: 0.3, w: W - 7.05 - 0.3, h: H - 0.75 };
async function framedSection(s, c, d, parts, cur, numTxt) {
  const info = await analyzePhoto(d.photo, FRAME_BOX.w, FRAME_BOX.h), acc = photoAccent(c, info), many = parts.length >= 2 && parts.includes(cur);
  await placePhoto(s, c, d, FRAME_BOX.x, FRAME_BOX.y, FRAME_BOX.w, FRAME_BOX.h, "Ảnh mở đầu chương", c.bg, acc);
  await photoCredit(s, d.photo, d, null, W - 0.3 - 6, H - 0.36, 6);
  const x0 = M, tw = FRAME_BOX.x - M - 0.45, inside = (Array.isArray(d.inside) ? d.inside : d._inside || []).slice(0, 3);
  const tr = rich(d.title, c.text, acc).map(r => (r.options.fontFace === TH.titleFont ? { text: r.text, options: Object.assign({}, r.options, { bold: true }) } : r));
  let tfs = 44, th = 1.4; for (tfs of [46, 42, 38]) { const m = measure(noOrphan(tr), { fontFace: TH.titleFont, fontSize: tfs }, tw); th = m.ok ? m.height * 1.04 + 0.1 : 1.5; if (!m.ok || m.lines <= 2) break; }
  const sh = d.sub ? realH(d.sub, { fontFace: TH.bodyFont, fontSize: 21 }, tw, 0.6) + 0.06 : 0, ih = inside.map(t => realH(t, { fontFace: TH.bodyFont, fontSize: 19 }, tw - 0.45, 0.35) + 0.12);
  const blkOf = () => 1.5 + th + (sh ? 0.2 + sh : 0) + (inside.length ? 0.5 + 0.45 + ih.reduce((a, b) => a + b, 0) : 0);
  // không đủ chỗ trên dải tiến độ → bớt ý "Trong chương này" từ cuối (trước đây khối chữ tràn xuống, đè tên chương ở đáy)
  while (inside.length && blkOf() > H - 1.45 - 0.55) { inside.pop(); ih.pop(); }
  const blk = blkOf();
  let y = Math.max(0.55, Math.min((H - 0.7 - blk) / 2, H - 1.45 - blk)); // chừa ≥ 0.4 in trên dải tiến độ chương ở đáy
  T(s, numTxt, { _label: "num", x: x0 - 0.06, y: y - 0.25, w: 3.2, h: 1.6, fontSize: 96, fontFace: TH.numFont, italic: TH.numItalic, bold: TH.titleBold, color: acc, valign: "bottom" });
  if (many) T(s, `/ ${String(parts.length).padStart(2, "0")}`, { _label: "tổng số chương", x: x0 + (textW(numTxt, { fontFace: TH.numFont, fontSize: 96, italic: TH.numItalic, bold: TH.titleBold }) || 2.2) + 0.1, y: y + 0.7, w: 1.3, h: 0.55, fontSize: 26, fontFace: TH.numFont, italic: TH.numItalic, color: c.muted });
  y += 1.5; T(s, tr, { _label: "title", x: x0, y, w: tw, h: th, fontSize: tfs }); y += th;
  if (d.sub) { y += 0.2; T(s, rich(d.sub, c.muted, c.text), { _label: "sub", x: x0, y, w: tw, h: sh, fontSize: 21, color: c.muted }); y += sh; }
  if (inside.length) { y += 0.5; s.addShape(pres.shapes.LINE, { x: x0, y: y - 0.14, w: Math.min(tw, 5.6), h: 0, line: { color: c.line, width: 1 } });
    T(s, `TRONG ${PART_WORD.toUpperCase()} NÀY`, { _label: "trong chương này", x: x0, y, w: tw, h: 0.34, fontSize: 14, bold: true, color: acc, charSpacing: 1.5 }); y += 0.45;
    for (const [i, t] of inside.entries()) { s.addShape(pres.shapes.OVAL, { x: x0 + 0.04, y: y + 0.13, w: 0.14, h: 0.14, fill: { color: acc }, line: { type: "none" } });
      T(s, t, { _label: `trong chương ${i + 1}`, x: x0 + 0.38, y, w: tw - 0.45, h: ih[i] - 0.08, fontSize: 19, color: c.text }); y += ih[i]; } }
  // dải tiến độ chương ở đáy cột chữ (tên chương 15pt)
  if (many) { const gap = 0.12, sw = (tw - gap * (parts.length - 1)) / parts.length;
    parts.forEach((p, i) => { const on = p === cur; s.addShape(pres.shapes.RECTANGLE, { x: x0 + i * (sw + gap), y: H - 1.0, w: sw, h: on ? 0.1 : 0.06, fill: { color: acc, transparency: p <= cur ? 0 : 70 }, line: { type: "none" } });
      T(s, PARTS[p] || "", { _label: `chương ${p}`, x: x0 + i * (sw + gap), y: H - 0.84, w: sw, h: 0.6, fontSize: 15, bold: on, color: on ? c.text : c.muted }); }); }
}
async function framedEnd(s, c, d, meta) {
  const info = await analyzePhoto(d.photo, FRAME_BOX.w, FRAME_BOX.h), acc = photoAccent(c, info);
  await placePhoto(s, c, d, FRAME_BOX.x, FRAME_BOX.y, FRAME_BOX.w, FRAME_BOX.h, "Ảnh kết thúc", c.bg, acc);
  await photoCredit(s, d.photo, d, null, W - 0.3 - 6, H - 0.36, 6);
  const x0 = M, tw = FRAME_BOX.x - M - 0.45, team = (d.team || []).slice(0, 6), cols = team.length > 3 ? 2 : 1, rows = Math.ceil(team.length / cols);
  const tr = rich(d.title, c.text, acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { fontFace: TH.accentFont, italic: TH.accentItalic, bold: TH.accentBold }) }));
  let efs = 56, th = 1.2; for (efs of [58, 52, 46, 42]) { const m = measure(noOrphan(tr), { fontFace: TH.accentFont, fontSize: efs }, tw); th = m.ok ? m.height * 1.04 + 0.1 : 1.3; if (!m.ok || m.lines <= 2) break; }
  const sh = d.sub ? realH(d.sub, { fontFace: TH.bodyFont, fontSize: 21 }, tw, 0.5) + 0.06 : 0, teamH = team.length ? 0.5 + rows * 0.72 : 0;
  const blk = (d.kicker ? 0.55 : 0) + th + (sh ? 0.25 + sh : 0) + (teamH ? 0.5 + teamH : 0) + (d.contact ? 0.7 : 0);
  let y = Math.max(0.6, (H - blk) / 2);
  if (d.kicker) { kicker(s, d.kicker, x0, y, acc); y += 0.55; }
  T(s, tr, { _label: "title", x: x0, y, w: tw, h: th, fontSize: efs }); y += th;
  if (d.sub) { y += 0.25; T(s, d.sub, { _label: "sub", x: x0, y, w: tw, h: sh, fontSize: 21, color: c.muted }); y += sh; }
  if (team.length) { y += 0.5; cap(s, d.teamTitle || ((d.team || []).length === 1 ? "Trình bày" : "Nhóm thực hiện"), x0, y, tw, acc, { fontSize: 14 }); y += 0.5; const cw = tw / cols;
    for (const [i, m] of team.entries()) { const x = x0 + (i % cols) * cw, yy = y + Math.floor(i / cols) * 0.72;
      T(s, [{ text: m.name, options: { bold: true, color: c.text, fontSize: 18, breakLine: !!m.role } }, ...(m.role ? [{ text: m.role, options: { color: c.muted, fontSize: 15 } }] : [])], { _label: `team[${i}]`, x, y: yy, w: cw - 0.2, h: 0.68, valign: "middle" }); }
    y += rows * 0.72; }
  if (d.contact) { y += 0.22; await circIcon(s, "PiEnvelopeSimpleDuotone", x0, y + 0.02, 0.42, acc, c.onAcc); T(s, d.contact, { _label: "contact", x: x0 + 0.6, y, w: tw - 0.6, h: 0.46, fontSize: 17, color: c.text, valign: "middle" }); }
}
// Bìa CÓ KHUNG (layout "frame", hoặc bìa có ảnh + meta.frame mà không ghi layout): cùng ngữ pháp với slide chương / slide kết có khung
// → mở – chương – kết thành một bộ. Cột chữ trái trên nền, khung ảnh đứng trọn bên phải.
async function coverFrame(s, c, d, meta) {
  const info = await analyzePhoto(d.photo, FRAME_BOX.w, FRAME_BOX.h), acc = photoAccent(c, info);
  await placePhoto(s, c, d, FRAME_BOX.x, FRAME_BOX.y, FRAME_BOX.w, FRAME_BOX.h, "Ảnh bìa", c.bg, acc);
  await photoCredit(s, d.photo, d, null, W - 0.3 - 6, H - 0.36, 6);
  const x0 = M, tw = FRAME_BOX.x - M - 0.45, logo = meta.logo && fs.existsSync(meta.logo);
  const tr = rich(d.title, c.text, acc).map(r => (r.options.fontFace === TH.titleFont ? { text: r.text, options: Object.assign({}, r.options, { bold: true }) } : r));
  let tfs = 50, th = 2; for (tfs of [54, 50, 46, 42, 38]) { const m = measure(noOrphan(tr), { fontFace: TH.titleFont, fontSize: tfs }, tw); th = m.ok ? m.height * 1.04 + 0.1 : 2.2; if (!m.ok || m.lines <= 3) break; }
  const sh = d.subtitle ? realH(d.subtitle, { fontFace: TH.bodyFont, fontSize: 21 }, tw, 0.6) + 0.06 : 0;
  const blk = (d.kicker ? 0.6 : 0) + th + (sh ? 0.25 + sh : 0);
  if (logo) s.addImage({ path: meta.logo, x: x0, y: 0.55, w: 1.59, h: 0.42, sizing: { type: "contain", w: 1.59, h: 0.42 } });
  let y = Math.max(logo ? 1.3 : 0.7, Math.min((H - 1.6 - blk) / 2 + 0.2, H - 2.0 - blk));
  if (d.kicker) { kicker(s, d.kicker, x0, y, acc); y += 0.6; }
  T(s, tr, { _label: "title", x: x0, y, w: tw, h: th, fontSize: tfs }); y += th;
  if (d.subtitle) { y += 0.25; T(s, d.subtitle, { _label: "subtitle", x: x0, y, w: tw, h: sh, fontSize: 21, color: c.muted }); }
  if (d.author) { s.addShape(pres.shapes.LINE, { x: x0, y: H - 1.45, w: Math.min(tw, 5.6), h: 0, line: { color: c.line, width: 1 } });
    T(s, [{ text: d.author, options: { bold: true, color: c.text, fontSize: 19, breakLine: !!d.authorSub } }, ...(d.authorSub ? [{ text: d.authorSub, options: { color: c.muted, fontSize: 16 } }] : [])], { _label: "author", x: x0, y: H - 1.3, w: tw, h: 0.8, valign: "top" }); }
}
// Mục lục CÓ KHUNG (agenda có photo): các phần xếp dọc bên trái, số thứ tự lớn màu nhấn + tên phần 22pt; khung ảnh bên phải dưới thanh trên cùng.
async function agendaFrame(s, c, d) {
  const bx = FRAME_BOX.x + 0.6, by = 0.85, bw = W - bx - 0.3, bh = H - by - 0.45;
  const info = await analyzePhoto(d.photo, bw, bh), acc = photoAccent(c, info);
  await placePhoto(s, c, d, bx, by, bw, bh, "Ảnh mục lục", c.bg, acc);
  await photoCredit(s, d.photo, d, null, W - 0.3 - 5, H - 0.36, 5);
  if (d.kicker) kicker(s, d.kicker, M, KICK_Y, acc);
  const tw = bx - M - 0.5, tt = rich(d.title, c.text, acc), tth = realH(tt, { fontFace: TH.titleFont, fontSize: 34, bold: !!TH.titleBold }, tw, 0.6) + 0.08;
  T(s, tt, { _label: "title", x: M, y: TITLE_Y, w: tw, h: tth, fontSize: 34 }); const top = Math.max(BODY_Y, TITLE_Y + tth + 0.3); // tiêu đề 2 dòng (theme chữ đậm) đẩy danh sách xuống
  const qs = (d.items || []).slice(0, 4), fsz = qs.length <= 3 ? 23 : 21, nw = 1.05;
  const hs = qs.map(q => Math.max(0.75, realH(rich(q, c.text, acc), { fontFace: TH.bodyFont, fontSize: fsz }, tw - nw, 0.5) + 0.2)), gap = 0.22;
  const tot = hs.reduce((a, b) => a + b, 0) + gap * (qs.length - 1); let y = top + 0.15 + Math.max(0, (6.85 - top - 0.15 - tot) / 2);
  qs.forEach((q, i) => { if (i) s.addShape(pres.shapes.LINE, { x: M, y: y - gap / 2, w: tw, h: 0, line: { color: c.line, width: 1 } });
    T(s, String(i + 1).padStart(2, "0"), { _label: `số ${i + 1}`, x: M, y, w: nw, h: hs[i], fontSize: 40, fontFace: TH.numFont, italic: TH.numItalic, color: acc, valign: "middle" });
    T(s, rich(q, c.text, acc), { _label: `items[${i}]`, x: M + nw, y, w: tw - nw, h: hs[i], fontSize: fsz, color: c.text, valign: "middle" }); y += hs[i] + gap; });
}
// nền giấy có vân (thao tác 1 của bài mẫu): lớp hạt rất nhạt phủ cả slide nền sáng — trang trí, không mang nghĩa
async function paperGrain(s) { const k = "paper-grain";
  if (!ASSETS[k]) ASSETS[k] = await png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs><filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="11" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .3  0 0 0 0 .2  0 0 0 .07 0"/></filter></defs><rect width="1600" height="900" filter="url(#g)"/></svg>`, 1600);
  s.addImage({ data: ASSETS[k], x: 0, y: 0, w: W, h: H, altText: "Vân giấy", _deco: true }); }
// ---------- BỘ CHẤT LIỆU (engine/kits.js) ----------
const KITMOD = require("./kits");
let KIT = null, KIT_NAME = null, THREAD = false, SEC_NUM = {}, PART_WORD = "Chương", LAST_PROP = -99, LAST_MARK = -99; // "Phần" / "Chương": theo meta.partWord hoặc kicker của deck — một từ cho cả bài
const kitPal = (c) => ({ acc: c.acc, accLight: mix(c.acc, "FFFFFF", 0.7), gold: TH.gold, ink: TH.l.text, bad: TH.l.bad, tape: mix(TH.gold, "FFFFFF", 0.55) });
async function propImg(name, c) { const k = `prop:${name}:${c.acc}:${TH.gold}`;
  if (!ASSETS[k]) { const p = KITMOD.PROPS[name](kitPal(c)); ASSETS[k] = await png(p.svg, 600); ASSETS[k + ":r"] = p.ratio; } return { data: ASSETS[k], ratio: ASSETS[k + ":r"] }; }
// giấy kẻ dòng (vở / sổ tay): dòng kẻ rất nhạt + lề đỏ mảnh bên trái — chỉ trang trí, không kéo mắt khỏi chữ
async function kitRuled(s, c) { const k = `kit-ruled:${c.bg}`;
  if (!ASSETS[k]) { let b = ""; for (let y = 110; y < 900; y += 50) b += `<line x1="0" y1="${y}" x2="1600" y2="${y}" stroke="#7FA3C4" stroke-opacity=".16" stroke-width="2"/>`;
    ASSETS[k] = await png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">${b}<line x1="52" y1="0" x2="52" y2="900" stroke="#D9534F" stroke-opacity=".28" stroke-width="2"/></svg>`, 1600); }
  s.addImage({ data: ASSETS[k], x: 0, y: 0, w: W, h: H, altText: "Giấy kẻ dòng", _deco: true }); }
// quầng màu nhấn rất nhạt ở góc trên-phải và dưới-trái (nền "kính")
async function kitGlow(s, c) { const k = `kit-glow:${c.acc}:${c.bg}`;
  if (!ASSETS[k]) ASSETS[k] = await png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs><radialGradient id="a"><stop offset="0" stop-color="#${c.acc}" stop-opacity=".16"/><stop offset="1" stop-color="#${c.acc}" stop-opacity="0"/></radialGradient></defs><circle cx="1500" cy="60" r="520" fill="url(#a)"/><circle cx="80" cy="880" r="460" fill="url(#a)"/></svg>`, 1600);
  s.addImage({ data: ASSETS[k], x: 0, y: 0, w: W, h: H, altText: "Nền", _deco: true }); }
const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
// vùng chữ THẬT: dòng đơn căn trái chỉ chiếm đúng bề rộng chữ (tiêu đề ngắn không "giữ chỗ" cả bề ngang slide)
function textRects() { return CUR.recs.filter(r => r.o && r.o.w && String(Array.isArray(r.text) ? r.text.map(x => x.text || "").join("") : r.text).trim()).map(r => { const tb = textBottom(r), o = r.o;
  let w = o.w; const flat = Array.isArray(r.text) ? r.text.map(x => x.text || "").join("") : String(r.text), m = measure(r.text, o, o.w);
  if (m.ok && m.lines === 1 && !o.fill && (!o.align || o.align === "left")) { const tw = textW(flat, o); if (tw) w = Math.min(o.w, tw * 1.08 + 0.1); }
  return { x: o.x, y: tb.top, w, h: tb.bot - tb.top }; }); }
// THẺ CHÍNH của slide (thẻ sáng lớn nhất) được "vật hoá": tờ giấy lệch phía sau (hồ sơ) + một vật vắt qua mép trên (kẹp giấy / băng dính / viên kính).
// Chỉ MỘT thẻ mỗi slide — điểm nhấn, không trang trí đều tay. Vật không được đè lên chữ.
async function kitMark(s, c) {
  // nhịp (người dùng 11/2026: "viên bi lặp khắp nơi"): vật vắt mép tối đa MỘT lần mỗi 3 slide — đánh dấu ở mọi slide thì không còn là điểm nhấn
  if (CUR.n - LAST_MARK < 3) return;
  const cards = (CUR.cards || []).filter(k => k.w * k.h >= 2.2 && k.y > 1.2); if (!cards.length) return;
  const k = cards.reduce((a, b) => (b.w * b.h > a.w * a.h ? b : a)), texts = textRects(), so = s._slideObjects;
  if (KIT.card.stack && Array.isArray(so)) { s.addShape(pres.shapes.RECTANGLE, { x: k.x + 0.1, y: k.y + 0.12, w: k.w, h: k.h, rotate: 1.2, fill: { color: mix(TH.l.line, "FFFFFF", 0.4) }, line: { color: TH.l.line, width: 0.75 } });
    so.splice(k.idx, 0, so.pop()); } // đưa tờ lệch xuống NGAY DƯỚI thẻ chính
  const m = KIT.mark, im = await propImg(m.prop, c);
  const sz = m.prop === "tape" ? { w: 1.35, h: 1.35 / im.ratio } : m.prop === "clip" ? { w: 0.34, h: 0.34 / im.ratio } : { w: 0.62, h: 0.62 / im.ratio };
  const spots = m.at === "top-center" ? [[k.x + k.w / 2 - sz.w / 2, k.y - sz.h / 2], [k.x + k.w - sz.w - 0.25, k.y - sz.h / 2], [k.x + k.w * 0.25 - sz.w / 2, k.y - sz.h / 2]]
    : [[k.x + k.w - sz.w - 0.35, k.y - sz.h * 0.45], [k.x + 0.3, k.y - sz.h * 0.45]];
  // vật vắt mép không được che chữ, icon, huy hiệu vắt mép, ô số (hình nhỏ không phải trang trí) — trước đây chỉ né chữ nên băng dính đè icon thẻ đầu
  const marks = CUR.geo.filter(g => !g.deco && (g.kind === "line" || g.w * g.h < 2) && !(Math.abs(g.x - k.x) < 0.01 && Math.abs(g.y - k.y) < 0.01)).map(g => ({ x: g.x - 0.06, y: g.y - 0.06, w: g.w + 0.12, h: g.h + 0.12 })); // đường nối / mũi tên cũng là vật cản (băng dính từng che đầu mũi tên ở flow)
  for (const [x, y] of spots) { const r = { x, y, w: sz.w, h: sz.h }; if (y < 0.75 || texts.some(t => hit(r, t)) || marks.some(g => hit(r, g))) continue;
    CUR.markName = `MK${CUR.n}`; s.addImage({ data: im.data, x, y, w: sz.w, h: sz.h, altText: "Trang trí", _deco: true, rotate: m.prop === "tape" ? -3 : 0, objectName: CUR.markName }); (CUR.props = CUR.props || []).push({ name: m.prop, x, y, w: sz.w, h: sz.h }); LAST_MARK = CUR.n; return; }
}
// TIỀN CẢNH: một đồ vật của thế giới tràn ra mép slide, ở vùng trống chạm mép phải (không đè chữ / thẻ) — tầng thứ ba của chiều sâu
async function kitProp(s, c) {
  const names = KIT.props; if (!names || !names.length) return;
  const occ = [];
  const PAD = 0.15; // đồ vật không được "suýt chạm" chữ / thẻ (bút chì sát nhãn nhánh cây điều kiện)
  for (const g of CUR.geo) if (!g.deco) occ.push({ x: g.x - PAD, y: g.y - PAD, w: Math.max(g.w, 0.02) + 2 * PAD, h: Math.max(g.h, 0.02) + 2 * PAD });
  for (const t of textRects()) occ.push({ x: t.x - PAD, y: t.y - PAD, w: t.w + 2 * PAD, h: t.h + 2 * PAD });
  // nhịp: tối đa MỘT đồ vật mỗi 3 slide (đặt ở mọi slide trống thì thành tiếng ồn — bút chì từng xuất hiện 6 lần trong 19 slide)
  if (CUR.n - LAST_PROP < 3) return;
  const fr = largestFree(occ, { x0: 0, y0: BODY_Y - 0.35, x1: W, y1: H }, 0.2, 0.1, true); if (!fr) return;
  if (fr.y + fr.h < H - 0.05) return; // chỉ ở GÓC DƯỚI (vùng trống chạm mép dưới) — không treo lơ lửng giữa tiêu đề và nội dung
  const name = names[CUR.n % names.length], im = await propImg(name, c), wide = im.ratio >= 1.4;
  let w = Math.min(wide ? 3.2 : 1.6, fr.w * 1.35), h = w / im.ratio; if (h > fr.h) { h = fr.h; w = h * im.ratio; }
  if (w < (wide ? 1.6 : 0.8)) return; // không đủ chỗ thì thôi — trống còn hơn chật
  const x = Math.min(fr.x + fr.w - w * 0.7, W - w * 0.7), y = fr.y + fr.h - h; // ~30% tràn ra ngoài mép phải slide (bị khung slide cắt — có chủ đích)
  s.addImage({ data: im.data, x, y, w, h, altText: "Đồ vật trang trí", _deco: true }); (CUR.props = CUR.props || []).push({ name, x, y, w, h }); LAST_PROP = CUR.n;
}
// LỚP KIỂM ĐỒ TRANG TRÍ: vật vắt mép / đồ vật tiền cảnh không được đè lên chữ hoặc icon (bộ kiểm chữ-đè-chữ không thấy được hình).
// Đo trên khung bao của hình (PNG có phần trong suốt — khung bao là giới hạn trên, nên cho dung sai 0.04 in).
function checkDeco() {
  const out = [], where = `Slide ${CUR.n} (${CUR.type})`, texts = textRects();
  const icons = CUR.geo.filter(g => !g.deco && (g.kind === "line" || g.w * g.h < 2));
  for (const p of CUR.props || []) { const r = { x: p.x + 0.04, y: p.y + 0.04, w: p.w - 0.08, h: p.h - 0.08 };
    if (texts.some(t => hit(r, t))) out.push({ kind: "gap", msg: `${where}: đồ trang trí "${p.name}" đè lên chữ — engine đặt sai chỗ (báo lỗi engine), tạm thời đặt "pin" hoặc đổi type` });
    else if (icons.some(g => hit(r, g))) out.push({ kind: "gap", msg: `${where}: đồ trang trí "${p.name}" đè lên icon / hình nhỏ — engine đặt sai chỗ (báo lỗi engine)` }); }
  return out;
}
// ảnh đã tách nền bị CẮT ở mép nào (chủ thể chạm mép ảnh: cổ tay, thân người, chân tượng) — đọc kênh alpha dọc 4 mép
async function cutEdges(f) { const k = "cutedge:" + f; if (ASSETS[k]) return ASSETS[k];
  const { data, info } = await sharp(f).ensureAlpha().resize(200, 200, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true }), n = info.channels, A = (x, y) => data[(y * 200 + x) * n + n - 1];
  const frac = (pts) => pts.filter(([x, y]) => A(x, y) > 128).length / pts.length, R = [...Array(200).keys()];
  return (ASSETS[k] = { left: frac(R.map(y => [0, y])) > 0.06, right: frac(R.map(y => [199, y])) > 0.06, top: frac(R.map(x => [x, 0])) > 0.06, bottom: frac(R.map(x => [x, 199])) > 0.06 }); }
// ---------- hub: MỘT khái niệm ở giữa + 4–6 yếu tố hai bên (yếu tố cấu thành, điều kiện, thành phần) ----------
// Nguyên tắc: điểm nhìn chính ở giữa, các ý toả ra; icon VẮT MÉP trong của thẻ (phía hướng về tâm) để mắt đi từ tâm ra thẻ.
L.hub = async (s, c, d) => {
  kickerTitle(s, c, d);
  const its = (d.items || []).slice(0, 6), n = its.length, nl = Math.ceil(n / 2), lim = lowerLim(d), top = BODY_Y + 0.05, avail = lim - top;
  const D = Math.min(2.4, avail * 0.66), cx = W / 2, cy = top + avail / 2, gapC = 0.5, cw = (W - 2 * M - D - 2 * gapC) / 2, ic = 0.58;
  const hz = n <= 4 ? 18 : 17, tz = n <= 4 ? 16 : 15, tw = cw - ic / 2 - 0.55;
  const hs = its.map(it => 0.3 + realH(it.head || "", { fontFace: TH.bodyFont, fontSize: hz, bold: true }, tw, 0.32) + (it.text ? 0.06 + realH(it.text, { fontFace: TH.bodyFont, fontSize: tz }, tw, 0.5) : 0) + 0.26);
  const rowsL = its.slice(0, nl), gap = 0.24, colH = (arr, off) => arr.reduce((a, _, i) => a + hs[off + i], 0) + gap * Math.max(0, arr.length - 1);
  const place = []; for (const [side, off, cnt] of [["L", 0, nl], ["R", nl, n - nl]]) { let y = top + Math.max(0, (avail - colH(its.slice(off, off + cnt), off)) / 2);
    for (let k = 0; k < cnt; k++) { const i = off + k; place[i] = { side, x: side === "L" ? M : W - M - cw, y, h: hs[i] }; y += hs[i] + gap; } }
  const seg = (x1, y1, x2, y2, col) => s.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(0.01, Math.abs(x2 - x1)), h: Math.max(0.01, Math.abs(y2 - y1)), flipV: (x2 - x1) * (y2 - y1) < 0, line: { color: col, width: 1.25, dashType: "dash" } });
  // đường nối từ mép vòng tâm tới icon của từng yếu tố (vẽ trước để thẻ đè lên đầu đường)
  for (const [i, p] of place.entries()) { const ix = p.side === "L" ? p.x + cw : p.x, iy = p.y + p.h / 2, a = Math.atan2(iy - cy, ix - cx);
    seg(cx + Math.cos(a) * D / 2, cy + Math.sin(a) * D / 2, ix, iy, d.focus === i ? c.acc : c.line); }
  s.addShape(pres.shapes.OVAL, { x: cx - D / 2 - 0.14, y: cy - D / 2 - 0.14, w: D + 0.28, h: D + 0.28, fill: { color: c.acc, transparency: 90 }, line: { type: "none" } });
  s.addShape(pres.shapes.OVAL, { x: cx - D / 2, y: cy - D / 2, w: D, h: D, fill: { color: c.acc }, line: { type: "none" } });
  const ce = d.center || {}, ciz = D * 0.3;
  if (ce.icon) s.addImage({ data: await icon(ce.icon, c.onAcc), x: cx - ciz / 2, y: cy - D * 0.3, w: ciz, h: ciz, altText: ce.icon });
  T(s, ce.label || "", { _label: "center.label", x: cx - D / 2 + 0.2, y: ce.icon ? cy + 0.02 : cy - 0.45, w: D - 0.4, h: ce.icon ? D * 0.4 : 0.9, fontSize: 18, bold: true, color: c.onAcc, align: "center", valign: ce.icon ? "top" : "middle" });
  for (const [i, it] of its.entries()) { const p = place[i], on = d.focus === i, L0 = p.side === "L";
    box(s, p.x, p.y, cw, p.h, on ? c.acc : c.card, on ? null : c.line);
    const ix = L0 ? p.x + cw - ic / 2 : p.x - ic / 2, iy = p.y + (p.h - ic) / 2; // icon vắt mép trong (hướng về tâm)
    s.addShape(pres.shapes.OVAL, { x: ix, y: iy, w: ic, h: ic, fill: { color: c.bg }, line: { type: "none" } });
    await circIcon(s, it.icon || "PiCircleDuotone", ix, iy, ic, c.acc, c.onAcc);
    const tx = L0 ? p.x + 0.3 : p.x + ic / 2 + 0.25, fg = on ? c.onAcc : c.text;
    T(s, [{ text: it.head || "", options: { bold: true, fontSize: hz, color: fg, breakLine: !!it.text } }, ...(it.text ? [{ text: it.text, options: { fontSize: tz, color: on ? c.onAcc : c.muted } }] : [])],
      { _label: `items[${i}]`, x: tx, y: p.y + 0.15, w: tw, h: p.h - 0.3, valign: "middle" }); }
  foot(s, c, d.note);
};
// ---------- pin: câu / số CHÍNH của slide viết trên một tờ giấy ghim (vật của thế giới đang dùng) ----------
// Engine tự tìm vùng trống đủ lớn; không đủ chỗ → báo (không chèn ép). Tờ giấy nghiêng nhẹ, vật giữ tờ theo bộ chất liệu.
async function kitPin(s, c, pin) {
  const text = typeof pin === "string" ? pin : pin.text, by = typeof pin === "object" ? pin.by : null; if (!text) return;
  const occ = []; for (const g of CUR.geo) if (!g.deco) occ.push({ x: g.x, y: g.y, w: Math.max(g.w, 0.02), h: Math.max(g.h, 0.02) });
  for (const t of textRects()) occ.push(t);
  const fr = largestFree(occ, { x0: 0.4, y0: 0.75, x1: W - 0.4, y1: H - 0.35 }, 0.32, 0.1, false); // cả dải tiêu đề (thường trống bên phải)
  // hai cỡ: thường (chữ 19, rộng ≤ 4.8) → gọn (chữ 16, dải rộng ≤ 6.2 — vừa khoảng trống dẹt trên / dưới nội dung căn giữa); không cỡ nào vừa → báo
  let w = 0, tz = 19, th = 9, bh = 0, h = 99;
  for ([tz, w] of [[19, Math.min(4.8, fr ? fr.w : 0)], [16, Math.min(6.2, fr ? fr.w : 0)]]) {
    th = w > 1 ? realH(rich(text, c.text, c.acc), { fontFace: TH.accentFont, fontSize: tz, italic: TH.accentItalic }, w - 0.6, 0.8) + 0.08 : 9;
    bh = by ? realH("— " + by, { fontFace: TH.bodyFont, fontSize: 14 }, (w > 1 ? w : 3) - 0.6, 0.3) + 0.08 : 0; h = th + bh + 0.55;
    if (fr && w >= 2.6 && fr.h >= h) break; }
  if (!fr || w < 2.6 || fr.h < h) { FLOW_CROSS.push({ kind: "fit", msg: `Slide ${CUR.n} (${CUR.type}) pin: không còn vùng trống ≥ 2.6 × ${h.toFixed(1)} in cho tờ giấy ghim (đã thử cả cỡ gọn) — rút gọn nội dung slide, rút ngắn pin, hoặc bỏ pin` }); return; }
  const x = fr.x + (fr.w - w) / 2, y = fr.y + (fr.h - h) / 2, rot = -2, kit = KIT_NAME || "none";
  const paper = kit === "paper" ? mix(TH.gold, "FFFFFF", 0.72) : kit === "glass" ? "FFFFFF" : kit === "file" ? "FFFDF6" : mix(TH.gold, "FFFFFF", 0.8);
  CUR.inBody = true;
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, rotate: rot, fill: { color: paper }, line: kit === "file" || kit === "glass" ? { color: TH.l.line, width: 1 } : { type: "none" }, shadow: { type: "outer", blur: 14, offset: 5, angle: 80, color: "000000", opacity: 0.16 } });
  T(s, rich(text, TH.l.text, TH.l.acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { fontFace: TH.accentFont, italic: TH.accentItalic }) })), { _label: "pin", x: x + 0.3, y: y + 0.3, w: w - 0.6, h: th, fontSize: tz, rotate: rot, color: TH.l.text });
  if (by) T(s, "— " + by, { _label: "pin.by", x: x + 0.3, y: y + 0.3 + th, w: w - 0.6, h: bh, fontSize: 14, rotate: rot, color: darkOn(TH.l.muted, paper), align: "right" });
  const mk = kit === "file" ? "clip" : kit === "paper" ? "tape" : kit === "glass" ? "orb" : "pin", im = await propImg(mk, c);
  const mw = mk === "tape" ? 1.2 : mk === "clip" ? 0.32 : 0.5, mh = mw / im.ratio;
  s.addImage({ data: im.data, x: mk === "clip" ? x + w - 0.6 : x + w / 2 - mw / 2, y: y - mh * 0.5, w: mw, h: mh, rotate: mk === "tape" ? -4 : 0, altText: "Trang trí", _deco: true });
  CUR.inBody = false;
}
// đa giác bằng shape gốc (custGeom): pts = [[x,y],...] toạ độ tuyệt đối (inch)
function poly(s, pts, fill, line, tr = 0) {
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x = Math.min(...xs), y = Math.min(...ys), w = Math.max(...xs) - x, h = Math.max(...ys) - y;
  s.addShape(pres.shapes.CUSTOM_GEOMETRY, { x, y, w, h, fill: { color: fill, transparency: tr }, line: line ? { color: line, width: 2.5 } : { type: "none" },
    points: [...pts.map(([px, py]) => ({ x: px - x, y: py - y })), { close: true }] });
}

// pyramid: thứ bậc / tầng ưu tiên (thứ bậc văn bản QPPL, tháp nhu cầu...). Tầng 0 = đỉnh (hẹp nhất, quan trọng/hiệu lực cao nhất).
// Hình tháp bên trái (số tầng trong từng dải), tên + giải thích bên phải, nối bằng đường dẫn mảnh.
L.pyramid = async (s, c, d) => {
  kickerTitle(s, c, d);
  const lv = (d.levels || []).slice(0, 5), n = Math.max(1, lv.length), lim = d.note ? FOOT_Y - 0.2 : 6.85;
  const PW = 5.0, bh = Math.min(1.2, (lim - BODY_Y - 0.05) / n), ph = bh * n, y0 = BODY_Y + 0.05 + Math.max(0, (lim - BODY_Y - 0.05 - ph) / 2), cx = M + PW / 2;
  const wAt = (yy) => PW * (0.16 + 0.84 * (yy - y0) / ph); // bề rộng tháp tại độ cao yy (đỉnh không nhọn hẳn: còn chỗ cho số)
  const tx = M + PW + 0.75, tw = W - M - tx;
  for (const [i, it] of lv.entries()) {
    const yt = y0 + i * bh, yb = yt + bh, a = wAt(yt) / 2, b = wAt(yb) / 2, on = d.focus === i;
    const fill = on ? c.acc : c.acc, tr = on ? 0 : 88 - i * 6; // tầng dưới đậm dần nhẹ — khối đỡ; tầng focus đặc
    poly(s, [[cx - a, yt], [cx + a, yt], [cx + b, yb], [cx - b, yb]], fill, c.bg, tr);
    T(s, String(i + 1), { _label: "số thứ tự", x: cx - 0.4, y: yt, w: 0.8, h: bh, fontSize: bh >= 0.9 ? 24 : 20, fontFace: TH.numFont, italic: TH.numItalic, bold: true, color: on ? c.onAcc : c.acc, align: "center", valign: "middle" });
    const ym = yt + bh / 2, ex = cx + (a + b) / 2 + 0.12;
    s.addShape(pres.shapes.LINE, { x: ex, y: ym, w: tx - 0.15 - ex, h: 0, line: { color: on ? c.acc : c.line, width: on ? 1.5 : 1, dashType: "dash" } });
    const hh = realH(it.head, { fontFace: TH.bodyFont, fontSize: 19, bold: true }, tw, 0.36), th = it.text ? realH(it.text, { fontFace: TH.bodyFont, fontSize: 15 }, tw, 0.5) : 0;
    const blk = hh + (it.text ? 0.06 + th : 0), by = ym - blk / 2;
    T(s, rich(it.head, tone(c, it.tone), c.acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { fontFace: TH.bodyFont, bold: true }) })), { _label: `levels[${i}].head`, x: tx, y: by, w: tw, h: hh + 0.04, fontSize: 19 });
    if (it.text) T(s, rich(it.text, c.muted, c.acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { fontFace: r.options.fontFace === TH.titleFont ? TH.bodyFont : r.options.fontFace }) })), { _label: `levels[${i}].text`, x: tx, y: by + hh + 0.06, w: tw, h: th + 0.04, fontSize: 15, color: c.muted });
  }
  foot(s, c, d.note);
};

// steps: quy trình có thứ tự + thời hạn từng bước (thủ tục tố tụng, đăng ký, khiếu nại). Mũi tên chevron đánh số; bước focus nền đặc.
L.steps = async (s, c, d) => {
  kickerTitle(s, c, d);
  const st = (d.steps || []).slice(0, 5), n = Math.max(1, st.length), lim = d.note ? FOOT_Y - 0.15 : 6.85, gap = 0.08;
  const cw = (W - 2 * M - gap * (n - 1)) / n, tw = cw - 0.3, hs = n <= 3 ? 20 : 18, fs = n <= 3 ? 16 : 15;
  const hH = Math.max(...st.map(x => realH(x.head, { fontFace: TH.bodyFont, fontSize: hs, bold: true }, tw, 0.4)));
  const tH = Math.max(0, ...st.map(x => x.text ? realH(x.text, { fontFace: TH.bodyFont, fontSize: fs }, tw, 0.8) : 0));
  const hasW = st.some(x => x.when), blk = 0.78 + 0.3 + hH + (hasW ? 0.5 : 0) + (tH ? 0.12 + tH : 0);
  const y0 = BODY_Y + 0.05 + Math.max(0, (lim - BODY_Y - 0.05 - blk) / 2 - 0.1);
  for (const [i, it] of st.entries()) { CUR.grp = i + 1;
    const x = M + i * (cw + gap), on = d.focus === i;
    if (FORM()) { if (i === 0 && n > 1) { CUR.grp = 0; worldLink(s, c, M + cw / 2, y0 + 0.39, M + (n - 1) * (cw + gap) + cw / 2); CUR.grp = i + 1; }
      worldTile(s, c, x + 0.08, y0, cw - 0.16, 0.78, on, String(i + 1).padStart(2, "0")); } else
    addT(s, String(i + 1).padStart(2, "0"), { _label: "số thứ tự", shape: i === 0 ? pres.shapes.PENTAGON : pres.shapes.CHEVRON, x, y: y0, w: cw, h: 0.78,
      fill: { color: c.acc, transparency: on ? 0 : 84 }, line: { type: "none" }, color: on ? c.onAcc : c.acc, fontFace: TH.numFont, italic: TH.numItalic, bold: true, fontSize: 22, align: "center", valign: "middle", margin: 0 });
    let y = y0 + 0.78 + 0.3;
    T(s, rich(it.head, c.text, c.acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { fontFace: TH.bodyFont, bold: true }) })), { _label: `steps[${i}].head`, x: x + 0.15, y, w: tw, h: hH + 0.04, fontSize: hs });
    y += hH + 0.12;
    if (it.when) chip(s, it.when, x + 0.15, y, c, { _label: `steps[${i}].when`, max: tw, fill: on ? c.acc : c.deep, line: on ? c.acc : c.line, color: on ? c.onAcc : c.text });
    if (hasW) y += 0.5; // giữ hàng thời hạn cho mọi bước → phần giải thích thẳng hàng
    if (it.text) T(s, it.text, { _label: `steps[${i}].text`, x: x + 0.15, y, w: tw, h: tH + 0.04, fontSize: fs, color: c.muted });
  } CUR.grp = 0;
  foot(s, c, d.note);
};

// matrix: ma trận 2×2 — xếp các trường hợp theo HAI tiêu chí (lỗi cố ý/vô ý × thiệt hại lớn/nhỏ; rủi ro × khả năng xảy ra).
// cells theo thứ tự: [trên-trái, trên-phải, dưới-trái, dưới-phải] (trục dọc: trên = cao). focus = ô nền nhấn.
L.matrix = async (s, c, d) => {
  kickerTitle(s, c, d);
  const X = d.x || {}, Y = d.y || {}, lim = d.note ? FOOT_Y - 0.15 : 6.9;
  const gx = M + 1.75, gw = W - M - gx, gap = 0.18, cw = (gw - gap) / 2, cells = (d.cells || []).slice(0, 4);
  // ô cao vừa chữ (không kéo thẻ dài tới đáy để lại khoảng chết); lưới đặt giữa vùng thân
  const hh = cells.map(it => realH(it.head, { fontFace: TH.bodyFont, fontSize: 19, bold: true }, cw - 0.6, 0.4)), th = cells.map(it => it.text ? realH(it.text, { fontFace: TH.bodyFont, fontSize: 15 }, cw - 0.6, 0.5) : 0);
  const room = (lim - 0.62 - BODY_Y - 0.05 - gap) / 2, ch = Math.min(room, Math.max(1.35, ...cells.map((_, i) => 0.22 + hh[i] + 0.1 + th[i] + 0.3)));
  const gh = 2 * ch + gap, gy = BODY_Y + 0.05 + (room - ch);
  // trục dọc + trục ngang có mũi tên (hướng tăng)
  s.addShape(pres.shapes.LINE, { x: gx - 0.22, y: gy, w: 0, h: gh + 0.2, line: { color: c.muted, width: 1.5, beginArrowType: "triangle" } });
  s.addShape(pres.shapes.LINE, { x: gx - 0.22, y: gy + gh + 0.2, w: gw + 0.22, h: 0, line: { color: c.muted, width: 1.5, endArrowType: "triangle" } });
  if (Y.label) T(s, String(Y.label).toUpperCase(), { _label: "y.label", x: M, y: gy + gh / 2 - 0.45, w: 1.4, h: 0.9, fontSize: 12, bold: true, color: c.acc, charSpacing: 1, valign: "middle" });
  if (Y.hi) T(s, Y.hi, { _label: "y.hi", x: M, y: gy + 0.05, w: 1.4, h: 0.5, fontSize: 13, color: c.muted });
  if (Y.lo) T(s, Y.lo, { _label: "y.lo", x: M, y: gy + gh - 0.5, w: 1.4, h: 0.5, fontSize: 13, color: c.muted, valign: "bottom" });
  const ay = gy + gh + 0.3;
  if (X.lo) T(s, X.lo, { _label: "x.lo", x: gx, y: ay, w: 3.0, h: 0.3, fontSize: 13, color: c.muted });
  if (X.label) T(s, String(X.label).toUpperCase(), { _label: "x.label", x: gx + gw / 2 - 2.0, y: ay, w: 4.0, h: 0.3, fontSize: 12, bold: true, color: c.acc, charSpacing: 1, align: "center" });
  if (X.hi) T(s, X.hi, { _label: "x.hi", x: gx + gw - 3.0, y: ay, w: 3.0, h: 0.3, fontSize: 13, color: c.muted, align: "right" });
  for (const [i, it] of cells.entries()) {
    const x = gx + (i % 2) * (cw + gap), y = gy + Math.floor(i / 2) * (ch + gap), on = d.focus === i;
    box(s, x, y, cw, ch, on ? c.deep : c.card, on ? c.acc : c.line);
    if (on) corner(s, x, y, cw, c.acc, 0.8, 80);
    T(s, rich(it.head, tone(c, it.tone), c.acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { fontFace: TH.bodyFont, bold: true }) })), { _label: `cells[${i}].head`, x: x + 0.3, y: y + 0.22, w: cw - 0.6, h: hh[i] + 0.04, fontSize: 19 });
    if (it.text) T(s, it.text, { _label: `cells[${i}].text`, x: x + 0.3, y: y + 0.32 + hh[i], w: cw - 0.6, h: th[i] + 0.04, fontSize: 15, color: c.muted });
  }
  foot(s, c, d.note);
};

// venn: hai chế định / hai khái niệm — điểm riêng mỗi bên và điểm CHUNG ở giữa (giao hai hình elip trong suốt)
L.venn = async (s, c, d) => {
  kickerTitle(s, c, d);
  const lim = d.note ? FOOT_Y - 0.12 : 6.9, ew = 6.1, ov = 2.5, eh = Math.min(4.3, lim - BODY_Y - 0.1), x1 = (W - (2 * ew - ov)) / 2, x2 = x1 + ew - ov, y = BODY_Y + 0.05 + (lim - BODY_Y - 0.1 - eh) / 2;
  s.addShape(pres.shapes.OVAL, { x: x1, y, w: ew, h: eh, fill: { color: c.acc, transparency: 91 }, line: { color: c.acc, width: 1.5 } });
  s.addShape(pres.shapes.OVAL, { x: x2, y, w: ew, h: eh, fill: { color: c.text, transparency: 91 }, line: { color: c.muted, width: 1.5 } });
  const zones = [[d.left, x1 + 0.55, x2 - x1 - 0.85, c.acc], [d.both, x2 + 0.2, ov - 0.4, c.text], [d.right, x1 + ew + 0.3, x2 + ew - (x1 + ew) - 0.55, c.text]];
  for (const [k, [z, zx, zw, lc]] of zones.entries()) { if (!z) continue;
    const nm = ["left", "both", "right"][k], fs = k === 1 ? 14 : 15, its = (z.items || []).slice(0, 3);
    const ih = its.map(t => realH(t, { fontFace: TH.bodyFont, fontSize: fs }, zw, 0.3));
    const lh = z.label ? realH(String(z.label).toUpperCase(), { fontFace: TH.bodyFont, fontSize: 12.5, bold: true, charSpacing: 1 }, zw, 0.3) : 0;
    const tot = lh + (lh ? 0.15 : 0) + ih.reduce((a, b) => a + b + 0.14, 0);
    let yy = y + eh / 2 - tot / 2;
    if (z.label) { T(s, String(z.label).toUpperCase(), { _label: `${nm}.label`, x: zx, y: yy, w: zw, h: lh + 0.04, fontSize: 12.5, bold: true, color: lc, charSpacing: 1, align: k === 1 ? "center" : "left" }); yy += lh + 0.15; }
    for (const [j, t] of its.entries()) { T(s, rich(t, c.text, c.acc), { _label: `${nm}.items[${j}]`, x: zx, y: yy, w: zw, h: ih[j] + 0.04, fontSize: fs, fontFace: TH.bodyFont, align: k === 1 ? "center" : "left" }); yy += ih[j] + 0.14; }
  }
  foot(s, c, d.note);
};

// tree: cây điều kiện — một câu hỏi pháp lý, 2–3 nhánh "nếu … thì …" (hệ quả khác nhau theo điều kiện). focus = nhánh áp dụng cho vụ việc.
L.tree = async (s, c, d) => {
  kickerTitle(s, c, d);
  const r = d.root || {}, br = (d.branches || []).slice(0, 3), n = Math.max(1, br.length), lim = d.note ? FOOT_Y - 0.15 : 6.9;
  const rw = Math.min(8.6, W - 2 * M), rx = (W - rw) / 2, qh = realH(rich(r.q || "", c.text, c.acc), { fontFace: TH.titleFont, fontSize: 21 }, rw - 0.8, 0.5);
  const sh = r.src ? realH(r.src, { fontFace: TH.bodyFont, fontSize: 13 }, rw - 0.8, 0.3) : 0, rh = 0.3 + qh + (sh ? 0.08 + sh : 0) + 0.3;
  const gap = 0.3, cw = (W - 2 * M - gap * (n - 1)) / n, tw = cw - 0.85;
  const hh = Math.max(...br.map(b => realH(b.head || "", { fontFace: TH.bodyFont, fontSize: 18, bold: true }, tw, 0.4)));
  const th = Math.max(0, ...br.map(b => b.text ? realH(b.text, { fontFace: TH.bodyFont, fontSize: 15 }, cw - 0.6, 0.6) : 0));
  const ch = 0.28 + hh + (th ? 0.12 + th : 0) + 0.3, drop = 1.2, tot = rh + drop + ch;
  const y0 = BODY_Y + 0.05 + Math.max(0, (lim - BODY_Y - 0.05 - tot) / 2 - 0.1), ry = y0, cy = y0 + rh + drop, by = y0 + rh + 0.35;
  box(s, rx, ry, rw, rh, c.card, c.acc);
  T(s, rich(r.q || "", c.text, c.acc), { _label: "root.q", x: rx + 0.4, y: ry + 0.3, w: rw - 0.8, h: qh + 0.04, fontSize: 21, align: "center" });
  if (r.src) T(s, r.src, { _label: "root.src", x: rx + 0.4, y: ry + 0.38 + qh, w: rw - 0.8, h: sh + 0.04, fontSize: 13, color: c.muted, align: "center" });
  const ln = { color: c.muted, width: 1.5 }, mids = br.map((_, i) => M + i * (cw + gap) + cw / 2);
  s.addShape(pres.shapes.LINE, { x: W / 2, y: ry + rh, w: 0, h: by - ry - rh, line: ln });
  if (n > 1) s.addShape(pres.shapes.LINE, { x: mids[0], y: by, w: mids[n - 1] - mids[0], h: 0, line: ln });
  for (const [i, b] of br.entries()) {
    const x = M + i * (cw + gap), on = d.focus === i, mx = mids[i];
    s.addShape(pres.shapes.LINE, { x: mx, y: by, w: 0, h: cy - by, line: Object.assign({ endArrowType: "triangle" }, on ? { color: c.acc, width: 2.25 } : ln) });
    if (b.when) chip(s, b.when, mx, by + 0.22, c, { _label: `branches[${i}].when`, center: true, max: cw - 0.2, fill: on ? c.acc : c.bg, line: on ? c.acc : c.muted, color: on ? c.onAcc : c.text });
    box(s, x, cy, cw, ch, on ? mix(c.acc, c.bg, 0.88) : c.card, on ? c.acc : c.line); // nhánh focus: nền nhấn nhạt + viền nhấn (nền be "deep" đọc thành thẻ bị tắt)
    const ic = b.tone === "bad" ? ["FaXmark", c.bad] : b.tone === "good" ? ["FaCheck", c.good] : ["FaArrowRight", c.acc];
    await circIcon(s, ic[0], x + 0.25, cy + 0.26, 0.42, ic[1], c.onAcc);
    T(s, rich(b.head || "", tone(c, b.tone), c.acc).map(q => ({ text: q.text, options: Object.assign({}, q.options, { fontFace: TH.bodyFont, bold: true }) })), { _label: `branches[${i}].head`, x: x + 0.82, y: cy + 0.28, w: tw, h: hh + 0.04, fontSize: 18 });
    if (b.text) T(s, b.text, { _label: `branches[${i}].text`, x: x + 0.3, y: cy + 0.4 + hh, w: cw - 0.6, h: th + 0.04, fontSize: 15, color: c.muted });
  }
  foot(s, c, d.note);
};

// quote: MỘT câu trích nguyên văn đủ sức làm luận điểm (điều luật, nhận định của toà, lời khai). Chữ có chân nghiêng, cỡ lớn tự co.
L.quote = async (s, c, d) => {
  // "CHỮ LÀ HÌNH": dấu ngoặc kép khổng lồ rất nhạt làm hình nền góc trên-trái (thay icon nhỏ) — câu trích là nhân vật chính của slide.
  // cutout (ảnh thật đã tách nền): chủ thể đứng bên phải, TRÀN QUA MÉP DƯỚI slide, mảng tròn màu nhấn phía sau tách chủ thể khỏi nền (ba tầng chiều sâu).
  if (d.kicker) kicker(s, d.kicker, M, KICK_Y, c.acc);
  let cw = 0;
  if (d.cutout) { const f = path.resolve(DECK_DIR, d.cutout), md = await sharp(f).metadata(), cut = await cutEdges(f), ch = H * 0.86, iw = Math.min(W * 0.42, ch * md.width / md.height), ih = iw * md.height / md.width;
    // CHỖ ẢNH BỊ CẮT PHẢI TRÙNG MÉP SLIDE: cắt ở trái/phải → lật để mép cắt nằm sát mép phải slide; cắt ở dưới → tràn mép dưới; không cắt → đứng trên mép dưới
    const flip = cut.left && !cut.right; cw = iw + 0.5;
    const ix = cut.left || cut.right ? W - iw + 0.02 : W - iw - 0.2, iy = cut.bottom ? H - ih + 0.02 : cut.top ? 0 : H - ih + ih * 0.06;
    const D = Math.min(iw * 1.05, 4.6); s.addShape(pres.shapes.OVAL, { x: ix + (iw - D) / 2, y: Math.max(1.0, iy + ih * 0.12), w: D, h: D, fill: { color: c.acc, transparency: 82 }, line: { type: "none" } });
    const ck = `cut:${d.cutout}:${d.photoStyle || ""}:${flip}`;
    if (!ASSETS[ck]) { let im = sharp(f); if (flip) im = im.flop(); if (d.photoStyle === "bw") im = im.grayscale(); ASSETS[ck] = "image/png;base64," + (await im.png().toBuffer()).toString("base64"); }
    s.addImage({ data: ASSETS[ck], x: ix, y: iy, w: iw, h: ih, altText: d.cutoutAlt || "Ảnh minh hoạ đã tách nền", _deco: true });
    const t = creditOf(d.cutout, d); if (t) CREDITS.push({ slide: CUR.n, text: t, source: (PHOTOS[path.basename(String(d.cutout))] || {}).source || "" }); }
  const x = M + 0.95, w = W - M - x - 0.4 - cw, lim = 6.15;
  // câu trích DÀI (> 25 chữ) in nghiêng cả đoạn thì khó đọc trên máy chiếu → chữ đứng; chữ [nhấn] luôn ĐẬM (khác màu thôi thì máy chiếu làm nhạt mất)
  const longQ = String(d.quote || "").replace(/[\[\]]/g, "").split(/\s+/).filter(Boolean).length > 25;
  const q = (fs) => rich(d.quote || "", c.text, c.acc).map(r => { const em = r.options.color === c.acc;
    return { text: r.text, options: Object.assign({}, r.options, { fontFace: TH.accentFont, italic: longQ ? false : (TH.accentItalic || r.options.italic), bold: em }) }; });
  let fs = 34, qh = 0; for (fs of [34, 31, 28, 25]) { qh = realH(q(fs), { fontFace: TH.accentFont, fontSize: fs }, w, 2); if (qh <= 3.3) break; }
  const byh = d.by ? 0.42 + (d.role ? 0.32 : 0) : 0, tot = qh + (byh ? 0.45 + byh : 0), y = Math.max(TITLE_Y + 0.1, Math.min(BODY_Y, (TITLE_Y + lim - tot) / 2));
  // dấu ngoặc khổng lồ bám vào góc trên-trái CÂU TRÍCH (không bám góc slide — tránh đè nhãn đầu slide)
  const qk = `qmark:${c.acc}:${TH.accentFont}`, qz = 2.2;
  if (!ASSETS[qk]) ASSETS[qk] = await png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><text x="0" y="400" font-family="${TH.accentFont === "Calibri" ? "Carlito" : TH.accentFont === "Arial" ? "Liberation Sans" : "Liberation Serif"}" font-size="560" font-weight="700" fill="#${c.acc}" fill-opacity=".12">“</text></svg>`, 800);
  s.addImage({ data: ASSETS[qk], x: x - qz * 0.5, y: Math.max(KICK_Y + 0.42, y - qz * 0.3), w: qz, h: qz, altText: "Dấu trích dẫn", _deco: true });
  T(s, q(fs), { _label: "quote", x, y, w, h: qh + 0.06, fontSize: fs });
  if (d.by) { const yb = y + qh + 0.45;
    if (FORM()) { worldLink(s, c, x, yb - 0.2, x + 2.4); worldMarker(s, c, x + 2.6, yb - 0.2, true, true); } else // trích dẫn: dây niêm phong / ray / đường kích thước… nối tới người nói
    s.addShape(pres.shapes.LINE, { x, y: yb - 0.18, w: 0.6, h: 0, line: { color: c.acc, width: 2 } });
    T(s, d.by, { _label: "by", x, y: yb, w, h: 0.4, fontSize: 18, bold: true, color: c.text });
    if (d.role) T(s, d.role, { _label: "role", x, y: yb + 0.4, w, h: 0.32, fontSize: 14, color: c.muted }); }
  foot(s, c, d.note);
};

// frame: ảnh trong khung (không tràn viền) + 2–4 điểm đánh số trên ảnh, giải thích ở cột bên — ảnh là CHỨNG CỨ cần đọc từng chi tiết
L.frame = async (s, c, d) => {
  kickerTitle(s, c, d);
  const right = d.side === "right", lim = FOOT_Y - 0.2, pw = 7.15, ph = lim - BODY_Y, px = right ? W - M - pw : M, py = BODY_Y;
  box(s, px - 0.1, py - 0.1, pw + 0.2, ph + 0.2, "FFFFFF", c.line);
  s.addImage({ _bg: TH.d.bg, data: await photo(d.photo, pw, ph, null, null, "none", 0, d.photoStyle || "natural"), x: px, y: py, w: pw, h: ph, altText: d.photoAlt || "Ảnh minh hoạ" });
  const pts = (d.points || []).slice(0, 4), lx = right ? M : px + pw + 0.55, lw = W - M - (px + pw + 0.55);
  for (const [i, p] of pts.entries()) if (p.x != null && p.y != null) {
    const cx = px + pw * p.x, cy = py + ph * p.y;
    s.addShape(pres.shapes.OVAL, { x: cx - 0.29, y: cy - 0.29, w: 0.58, h: 0.58, fill: { color: "FFFFFF", transparency: 8 }, line: { type: "none" } });
    num(s, i + 1, cx - 0.23, cy - 0.23, 0.46, c.acc, c.onAcc, 14); }
  const hs = pts.map(p => realH(p.head || "", { fontFace: TH.bodyFont, fontSize: 18, bold: true }, lw - 0.7, 0.36)), ts = pts.map(p => p.text ? realH(p.text, { fontFace: TH.bodyFont, fontSize: 15 }, lw - 0.7, 0.5) : 0);
  const rows = pts.map((_, i) => hs[i] + (ts[i] ? 0.06 + ts[i] : 0)), gap = 0.32, tot = rows.reduce((a, b) => a + b, 0) + gap * Math.max(0, pts.length - 1);
  let y = py + Math.max(0, (ph - tot) / 2);
  for (const [i, p] of pts.entries()) {
    num(s, i + 1, lx, y, 0.42, c.deep, c.acc, 13);
    T(s, p.head || "", { _label: `points[${i}].head`, x: lx + 0.62, y: y + 0.02, w: lw - 0.7, h: hs[i] + 0.04, fontSize: 18, bold: true, color: c.text });
    if (p.text) T(s, p.text, { _label: `points[${i}].text`, x: lx + 0.62, y: y + 0.08 + hs[i], w: lw - 0.7, h: ts[i] + 0.04, fontSize: 15, color: c.muted });
    y += rows[i] + gap; }
  const cr = creditOf(d.photo, d); if (cr) CREDITS.push({ slide: CUR.n, text: cr, source: (PHOTOS[path.basename(String(d.photo))] || {}).source || d.photoSource || "" });
  foot(s, c, [d.note, cr].filter(Boolean).join(" · "));
};

// beforeafter: hai ảnh cùng một đối tượng ở hai thời điểm (trước/sau vi phạm, trước/sau cưỡng chế, trước/sau quy hoạch).
L.beforeafter = async (s, c, d) => {
  kickerTitle(s, c, d);
  const sides = [d.before || {}, d.after || {}], gap = 0.9, pw = (W - 2 * M - gap) / 2, py = BODY_Y + 0.25, lim = FOOT_Y - 0.2;
  const caps = sides.map(p => p.caption ? realH(rich(p.caption, c.text, c.acc), { fontFace: TH.bodyFont, fontSize: 15 }, pw, 0.5) : 0), cH = Math.max(...caps);
  const ph = lim - py - (cH ? cH + 0.2 : 0);
  const cr = [];
  for (const [i, p] of sides.entries()) {
    const x = M + i * (pw + gap);
    s.addImage({ _bg: TH.d.bg, data: await photo(p.photo, pw, ph, null, null, "none", 0, p.photoStyle || (i === 0 ? "bw" : "natural")), x, y: py, w: pw, h: ph, altText: p.alt || p.caption || (i ? "Ảnh sau" : "Ảnh trước") });
    const lab = [p.label || (i ? "Sau" : "Trước"), p.date].filter(Boolean).join(" · ");
    tab(s, lab, x + 0.3, py, i ? c.acc : TH.d.bg, i ? c.onAcc : TH.d.text);
    if (p.caption) T(s, rich(p.caption, c.text, c.acc), { _label: `${i ? "after" : "before"}.caption`, x, y: py + ph + 0.2, w: pw, h: caps[i] + 0.04, fontSize: 15 });
    const t = creditOf(p.photo, p); if (t) { cr.push(t); CREDITS.push({ slide: CUR.n, text: t, source: (PHOTOS[path.basename(String(p.photo))] || {}).source || p.photoSource || "" }); }
  }
  const ax = M + pw + gap / 2 - 0.28, ay = py + ph / 2 - 0.28;
  s.addShape(pres.shapes.OVAL, { x: ax, y: ay, w: 0.56, h: 0.56, fill: { color: c.bg }, line: { color: c.acc, width: 1.5 } });
  s.addImage({ data: await icon("FaArrowRight", c.acc), x: ax + 0.16, y: ay + 0.16, w: 0.24, h: 0.24, altText: "Mũi tên trước → sau" });
  foot(s, c, d.note);
};


// ================= MỞ ĐẦU · CHUYỂN CHƯƠNG · KẾT THÚC · BỐ CỤC ẢNH (đợt 2, 11/2026) =================
// dòng tác giả dùng chung cho bìa: tên đậm + dòng phụ (lớp, GVHD, ngày)
function authorLine(s, d, x, y, w, c) {
  T(s, [{ text: d.author, options: { bold: true, color: c.text, fontSize: 17, breakLine: !!d.authorSub } }, ...(d.authorSub ? [{ text: d.authorSub, options: { color: c.muted, fontSize: 14 } }] : [])], { _label: "author", x, y, w, h: 0.7, valign: "middle" });
}
// bìa "typo": chữ là hình — tiêu đề rất lớn chiếm 2/3 bề ngang, vạch nhấn dày phía trên, hàng tác giả ngăn bằng đường kẻ mảnh ở đáy
// bìa "paper": các lớp giấy cắt chồng nhau (bóng mềm → PNG), dáng sóng sinh từ TÊN ĐỀ TÀI — mỗi đề tài một hình riêng nhưng
// dựng lại luôn ra đúng hình đó. Chữ nằm trên thẻ trắng (đo chiều cao tiêu đề thật rồi xếp phụ đề, tác giả ngay dưới).
async function coverPaper(s, c, d, meta) {
  const mx = (t) => mix(c.acc, "FFFFFF", t), tones = [mx(0.9), mx(0.75), mx(0.55), mx(0.3), c.acc, TH.d.bg];
  const k = `paper:${meta.title || d.title}:${tones.join("")}`;
  if (!ASSETS[k]) ASSETS[k] = await png(CA.paperLayers(meta.title || d.title, tones, 1600, 900, 0.4), 2000);
  s.addImage({ _bg: c.bg, data: ASSETS[k], x: 0, y: 0, w: W, h: H, altText: "Hình nền: các lớp giấy cắt chồng nhau" });
  const cw = 7.4, x = M, tw = cw - 0.9; let y = 0.95;
  const th = realH(rich(d.title, c.text, c.acc), { fontFace: TH.titleFont, fontSize: 40 }, tw, 1.6) + 0.1;
  const sh = d.subtitle ? realH(d.subtitle, { fontFace: TH.bodyFont, fontSize: 17 }, tw, 0.6) + 0.1 : 0;
  const hasLogo = meta.logo && fs.existsSync(meta.logo), ch = 0.45 + (hasLogo ? 0.6 : 0) + (d.kicker ? 0.5 : 0) + th + (sh ? sh + 0.15 : 0) + (d.author ? 0.95 : 0) + 0.3;
  box(s, x, 0.6, cw, ch, "FFFFFF");
  let yy = 0.6 + 0.4;
  if (hasLogo) { s.addImage({ path: meta.logo, x: x + 0.45, y: yy, w: 1.59, h: 0.42, sizing: { type: "contain", w: 1.59, h: 0.42 } }); yy += 0.6; }
  if (d.kicker) { kicker(s, d.kicker, x + 0.45, yy, c.acc); yy += 0.5; }
  T(s, rich(d.title, c.text, c.acc), { _label: "title", x: x + 0.45, y: yy, w: tw, h: th, fontSize: 40, fontFace: TH.titleFont }); yy += th + 0.15;
  if (d.subtitle) { T(s, d.subtitle, { x: x + 0.45, y: yy, w: tw, h: sh, fontSize: 17, color: c.muted }); yy += sh + 0.15; }
  if (d.author) T(s, [{ text: d.author, options: { bold: true, color: c.text, fontSize: 16, breakLine: true } }, { text: d.authorSub || "", options: { color: c.muted, fontSize: 13 } }], { x: x + 0.45, y: yy + 0.05, w: tw, h: 0.7, valign: "middle" });
}

// ---------- hero: MỘT con số khổng lồ cho khoảnh khắc bước ngoặt — nền gradient tối có hạt mịn (PNG, vì hạt cần SVG filter) ----------
// Số là ô chữ thật (sửa được, đo tràn, đo tương phản). Tối đa ~1 slide hero / 8 slide: dùng nhiều thì hết "bước ngoặt".
L.hero = async (s, c, d) => {
  const dk = TH.d, k = `grain:${dk.deep}:${dk.card}`;
  if (d.photo) { // số lớn trên ẢNH duotone tối (thẻ số liệu của video motion): ảnh là bối cảnh của con số, chữ vẫn đọc được nhờ lớp phủ tối
    s.addImage({ _bg: dk.bg, data: await photo(d.photo, W, H, dk.deep, dk.bg, "full", 1.25, d.photoStyle || "duotone"), x: 0, y: 0, w: W, h: H, altText: d.photoAlt || "Ảnh nền" });
    await photoCredit(s, d.photo, d, null, W - M - 6, H - 0.36, 6); }
  else { if (!ASSETS[k]) ASSETS[k] = await png(CA.grainBg(dk.deep, dk.card, 1600, 900, 0.08), 1600);
    s.addImage({ _bg: dk.bg, data: ASSETS[k], x: 0, y: 0, w: W, h: H, altText: "Nền chuyển màu" }); }
  const num = String(d.num || ""), fs0 = num.length <= 2 ? 300 : num.length === 3 ? 220 : 165, nw = 6.6;
  mo(1, "slam", 150, true); T(s, num, { _label: "num", x: M - 0.1, y: 0.9, w: nw, h: 5.6, fontSize: fs0, fontFace: TH.numFont, italic: TH.numItalic, bold: TH.titleBold, color: dk.acc, valign: "middle", align: "left" });
  const tx = M + nw + 0.3, tw2 = W - M - tx;
  let y = 2.0;
  // đơn vị đi LIỀN con số (ngay dưới chân số) — đặt ở cột phải thì đọc thành tiêu đề phụ
  mo(2, "fade"); if (d.unit) { const capH = fs0 / 72 * 0.72; T(s, d.unit, { _label: "unit", x: M, y: 0.9 + 2.8 + capH / 2 + 0.15, w: nw, h: 0.6, fontSize: 28, fontFace: TH.accentFont, italic: TH.accentItalic, color: dk.acc }); }
  mo(0); if (d.kicker) { kicker(s, d.kicker, tx, y, dk.acc); y += 0.5; }
  const th = realH(rich(d.title, dk.text, dk.acc), { fontFace: TH.titleFont, fontSize: 36 }, tw2, 2.2) + 0.1;
  T(s, rich(d.title, dk.text, dk.acc), { _label: "title", x: tx, y, w: tw2, h: th, fontSize: 36, color: dk.text }); y += th + 0.25;
  mo(3, "fade", 200); if (d.sub) T(s, rich(d.sub, dk.muted, dk.text), { _label: "sub", x: tx, y, w: tw2, h: 1.3, fontSize: 17, color: dk.muted }); mo(0);
  if (d.note) T(s, rich(d.note, dk.muted, dk.text), { _label: "chú thích", x: M, y: FOOT_Y, w: W - 2 * M, h: FOOT_H, fontSize: 13, color: dk.muted });
};


// ---------- BỐ CỤC ẢNH MỚI (11/2026 — học từ video giải thích / motion: kinetic typography, zoom vào chủ thể, digital collage) ----------
// headline: ảnh TRÀN VIỀN + 2–3 dòng chữ lớn, MỖI DÒNG trên một dải màu riêng (kiểu phụ đề TikTok) — một câu khẳng định đọc trong 3 giây.
// Dải màu bảo đảm tương phản trên mọi ảnh; dòng có [ ] thành dải màu nhấn. Dùng cho bước ngoặt / mở luận điểm, tối đa 1–2 slide/deck.
L.headline = async (s, c, d) => {
  const dk = TH.d, info = await analyzePhoto(d.photo, W, H), side = d.side || (info.quiet === "right" ? "right" : "left"), rt = side === "right";
  s.addImage({ _bg: dk.bg, data: await photo(d.photo, W, H, null, dk.deep, rt ? "right" : "left", 0.55, d.photoStyle || "natural"), x: 0, y: 0, w: W, h: H, altText: d.photoAlt || "Ảnh nền" });
  await photoCredit(s, d.photo, d, null, rt ? M : W - M - 6, H - 0.36, 6);
  const lines = (d.lines || []).slice(0, 3), fz = 40, fo = { fontFace: TH.titleFont, fontSize: fz, bold: true }, bh = fz / 72 * 1.62 /* đủ cao cho dấu tiếng Việt — thấp hơn thì trình chiếu tự nới dải, các dải đè nhau */, gap = 0.16, padX = 0.24;
  const ws = lines.map(t => Math.min(W - 2 * M - 0.6, (textW(String(t).replace(/[\[\]]/g, ""), fo) || String(t).length * 0.3) + 2 * padX + 0.1));
  const subH = d.sub ? realH(d.sub, { fontFace: TH.bodyFont, fontSize: 19 }, 6.2, 0.6) + 0.1 : 0;
  const blk = (d.kicker ? 0.55 : 0) + lines.length * (bh + gap) + (subH ? 0.25 + subH : 0); let y = Math.max(1.0, (H - blk) / 2);
  const xOf = (w) => (rt ? W - M - w : M);
  if (d.kicker) { const kw = fitW(String(d.kicker).toUpperCase(), { fontFace: TH.bodyFont, fontSize: 13, bold: true, charSpacing: 1.5 }, 0.5, 0.1, 6);
    addT(s, String(d.kicker).toUpperCase(), { _label: "kicker", shape: pres.shapes.RECTANGLE, x: xOf(kw), y, w: kw, h: 0.38, fill: { color: dk.acc }, color: dk.bg, fontSize: 13, bold: true, charSpacing: 1.5, align: "center", valign: "middle", margin: 0, fontFace: TH.bodyFont }); y += 0.55; }
  lines.forEach((t, i) => { mo(i + 1, "rise", i ? 10 : 100); const on = /\[.+\]/.test(String(t)), fill = on ? c.acc : "FFFFFF", fg = on ? c.onAcc : TH.l.text;
    addT(s, String(t).replace(/[\[\]]/g, ""), { _label: `lines[${i}]`, shape: pres.shapes.RECTANGLE, x: xOf(ws[i]), y, w: ws[i], h: bh, fill: { color: fill }, line: { type: "none" }, color: fg, fontSize: fz, bold: true, fontFace: TH.titleFont, align: rt ? "right" : "left", valign: "middle", margin: [0, padX * 72, 0, padX * 72] });
    y += bh + gap; });
  mo(9, "fade", 200); if (d.sub) { y += 0.13; T(s, rich(d.sub, "FFFFFF", dk.acc), { _label: "sub", x: rt ? W - M - 6.2 : M, y, w: 6.2, h: subH, fontSize: 19, color: "FFFFFF", align: rt ? "right" : "left" }); } mo(0);
  if (d.note) T(s, rich(d.note, "FFFFFF", dk.acc), { _label: "chú thích", x: rt ? M : W - M - 6, y: FOOT_Y, w: 6, h: FOOT_H, fontSize: 13, color: "FFFFFF", align: rt ? "left" : "right" });
};
// lens: ảnh + VÒNG KÍNH LÚP phóng to MỘT chi tiết (zoom vào chủ thể của video giải thích) — người xem thấy toàn cảnh VÀ đúng chỗ cần nhìn.
// focus {x, y} = tâm chi tiết (tỉ lệ 0–1 trên ảnh đang hiện), r = bán kính vùng phóng (tỉ lệ theo bề ngang ảnh, mặc định 0.12).
L.lens = async (s, c, d) => {
  const y0 = kickerTitle(s, c, d), px = M, py = y0 + 0.15, pw = 6.4, ph = Math.min(4.6, (d.note ? 6.45 : 6.85) - py), D = 3.1;
  const file = path.resolve(DECK_DIR, d.photo), PX = Math.round(pw * 200), PY = Math.round(ph * 200);
  const base = await sharp(file).rotate().resize(PX, PY, { fit: "cover", position: "centre" }).jpeg({ quality: 88 }).toBuffer();
  s.addImage({ data: "image/jpeg;base64," + base.toString("base64"), x: px, y: py, w: pw, h: ph, altText: d.photoAlt || "Ảnh" });
  await photoCredit(s, d.photo, d, null, px, py + ph + 0.02, pw);
  const f = d.focus || { x: 0.5, y: 0.5 }, fr = Math.min(0.3, Math.max(0.05, f.r || 0.12)), side = Math.round(fr * 2 * PX);
  const lx = Math.max(0, Math.min(PX - side, Math.round(f.x * PX - side / 2))), ly = Math.max(0, Math.min(PY - side, Math.round(f.y * PY - side / 2)));
  const zoom = await sharp(base).extract({ left: lx, top: ly, width: side, height: side }).resize(720, 720).jpeg({ quality: 90 }).toBuffer();
  // vòng nhỏ trên ảnh (chỗ được phóng) + đường nối + vòng kính lúp lớn vắt mép phải ảnh
  const sx = px + (lx + side / 2) / PX * pw, sy = py + (ly + side / 2) / PY * ph, sr = side / PX * pw / 2;
  const cx = px + pw + 0.25, cy = py + ph / 2, R = D / 2;
  const ang = Math.atan2(cy - sy, cx - sx), x1 = sx + Math.cos(ang) * sr, y1 = sy + Math.sin(ang) * sr, x2 = cx - Math.cos(ang) * R, y2 = cy - Math.sin(ang) * R;
  s.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.max(0.01, Math.abs(x2 - x1)), h: Math.max(0.01, Math.abs(y2 - y1)), flipV: (y2 - y1) * (x2 - x1) < 0, line: { color: c.acc, width: 2.5 } });
  s.addShape(pres.shapes.OVAL, { x: sx - sr, y: sy - sr, w: 2 * sr, h: 2 * sr, fill: { type: "none" }, line: { color: c.acc, width: 3 } });
  s.addShape(pres.shapes.OVAL, { x: cx - R - 0.08, y: cy - R - 0.08, w: D + 0.16, h: D + 0.16, fill: { color: "FFFFFF" }, line: { color: c.acc, width: 4 }, shadow: { type: "outer", blur: 8, offset: 3, angle: 90, opacity: 0.25, color: "000000" } });
  s.addImage({ data: "image/jpeg;base64," + zoom.toString("base64"), x: cx - R, y: cy - R, w: D, h: D, rounding: true, altText: "Phóng to: " + ((d.focus && d.focus.label) || "chi tiết ảnh") });
  if (d.focus && d.focus.label) { const lw2 = fitW(d.focus.label, { fontFace: TH.bodyFont, fontSize: 14, bold: true }, 0.3, 0.1, 3.2);
    addT(s, d.focus.label, { _label: "focus.label", shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.12, x: cx - lw2 / 2, y: cy + R - 0.05, w: lw2, h: 0.4, fill: { color: c.acc }, color: c.onAcc, fontSize: 14, bold: true, align: "center", valign: "middle", margin: 0, fontFace: TH.bodyFont }); }
  // cột phải: 1–3 ý, mỗi ý một ô (đầu ý đậm + giải thích)
  const tx = cx + R + 0.4, tw2 = W - M - tx, its = (d.items || []).slice(0, 3);
  const hs = its.map(it => realH(it.head || "", { fontFace: TH.bodyFont, fontSize: 18, bold: true }, tw2, 0.35) + (it.text ? realH(rich(it.text, c.muted, c.text), { fontFace: TH.bodyFont, fontSize: 15 }, tw2, 0.4) + 0.06 : 0)); // đo đúng chữ sẽ vẽ (theme "son" in đậm cả chữ thường)
  let ty = Math.max(py, cy - (hs.reduce((a, b) => a + b, 0) + 0.3 * (its.length - 1)) / 2);
  its.forEach((it, i) => { const hh = realH(it.head || "", { fontFace: TH.bodyFont, fontSize: 18, bold: true }, tw2, 0.35);
    T(s, rich(it.head || "", c.text, c.acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { bold: true }) })), { _label: `items[${i}].head`, x: tx, y: ty, w: tw2, h: hh + 0.02, fontSize: 18 });
    if (it.text) T(s, rich(it.text, c.muted, c.text), { _label: `items[${i}].text`, x: tx, y: ty + hh + 0.06, w: tw2, h: hs[i] - hh - 0.04, fontSize: 15, color: c.muted });
    ty += hs[i] + 0.3; });
  if (d.note) T(s, rich(d.note, c.muted, c.text), { _label: "note", x: M, y: FOOT_Y, w: W - 2 * M, h: FOOT_H, fontSize: 13 });
};
// collage: 2–3 ảnh IN (viền trắng, bóng, xoay nhẹ, băng dính) xếp chồng như sổ tay — digital collage của video giải thích.
// Cột trái: 1–3 ý ngắn. Ảnh thứ i có chú thích viết tay. Dùng khi nhiều mặt của MỘT đối tượng (nơi làm thủ tục, người hưởng, giấy tờ).
L.collage = async (s, c, d) => {
  const y0 = kickerTitle(s, c, d), ph = (d.photos || []).slice(0, 3), n = ph.length, lw = 4.6;
  const its = (d.items || []).slice(0, 3); let ty = y0 + 0.35;
  its.forEach((it, i) => { const hh = realH(it.head || "", { fontFace: TH.bodyFont, fontSize: 18, bold: true }, lw - 0.55, 0.35), th2 = it.text ? realH(rich(it.text, c.muted, c.text), { fontFace: TH.bodyFont, fontSize: 15 }, lw - 0.55, 0.4) : 0;
    num(s, String(i + 1), M, ty + 0.02, 0.38, c.acc, c.onAcc, 13);
    T(s, rich(it.head || "", c.text, c.acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { bold: true }) })), { _label: `items[${i}].head`, x: M + 0.55, y: ty, w: lw - 0.55, h: hh + 0.02, fontSize: 18 });
    if (it.text) T(s, rich(it.text, c.muted, c.text), { _label: `items[${i}].text`, x: M + 0.55, y: ty + hh + 0.06, w: lw - 0.55, h: th2 + 0.02, fontSize: 15, color: c.muted });
    ty += hh + (th2 ? th2 + 0.06 : 0) + 0.4; });
  // vị trí các tờ ảnh (inch) — ảnh sau đè ảnh trước nhưng KHÔNG che chú thích của ảnh trước
  // 3 ảnh: tờ 3 nằm DƯỚI chú thích tờ 2 và BÊN PHẢI chú thích tờ 1 — không che chữ; đáy tờ thấp nhất ≤ 7.25 in
  const P = n >= 3 ? [{ x: 5.5, y: y0 + 0.1, w: 3.6, rot: -3 }, { x: 9.05, y: y0 - 0.1, w: 3.4, rot: 3 }, { x: 8.95, y: Math.min(y0 + 2.45, 7.25 - 2.45), w: 3.3, rot: -2 }]
    : [{ x: 5.5, y: y0 + 0.2, w: 4.0, rot: -3 }, { x: 8.7, y: y0 + 1.25, w: 3.95, rot: 2.5 }];
  for (const [i, q] of ph.entries()) { const p = P[i], iw = p.w - 0.3, ih = iw * 0.6, capH = q.caption ? 0.5 : 0.15, hh = 0.15 + ih + capH;
    s.addShape(pres.shapes.RECTANGLE, { x: p.x, y: p.y, w: p.w, h: hh, rotate: p.rot, fill: { color: "FFFFFF" }, line: { color: c.line, width: 0.5 }, shadow: { type: "outer", blur: 10, offset: 4, angle: 90, opacity: 0.28, color: "000000" } });
    s.addImage({ data: await photo(q.photo, iw, ih, null, null, "none", 0, q.photoStyle || d.photoStyle || "natural"), x: p.x + 0.15, y: p.y + 0.15, w: iw, h: ih, rotate: p.rot, altText: q.alt || q.caption || "Ảnh" });
    s.addShape(pres.shapes.RECTANGLE, { x: p.x + p.w / 2 - 0.55, y: p.y - 0.14, w: 1.1, h: 0.3, rotate: p.rot * -2 + (i % 2 ? 6 : -6), fill: { color: TH.gold, transparency: 35 }, line: { type: "none" } }); // băng dính
    if (q.caption) T(s, q.caption, { _label: `photos[${i}].caption`, x: p.x + 0.2, y: p.y + 0.18 + ih, w: p.w - 0.4, h: 0.4, rotate: p.rot, fontSize: 15, fontFace: TH.accentFont, italic: true, color: TH.l.text, align: "center", valign: "middle" });
    await photoCredit(s, q.photo, q, null, 0, 0, 0); }
  if (d.note) T(s, rich(d.note, c.muted, c.text), { _label: "note", x: M, y: FOOT_Y, w: W - 2 * M, h: FOOT_H, fontSize: 13 });
};


// ---------- POSTER (11/2026 — người dùng: "mở đầu và kết chưa đủ wow"): ảnh TRÀN VIỀN như ảnh bìa tạp chí / thumbnail video ----------
// lớp phủ tối từ trái + từ đáy (chữ trắng luôn đọc được), tiêu đề rất lớn, hàng "thẻ dữ kiện" kính mờ ở đáy. Bìa và slide cảm ơn dùng CÙNG ngôn ngữ → mở – kết khớp nhau.
async function posterBg(s, d, alt) { const dk = TH.d;
  s.addImage({ _bg: dk.bg, data: await photo(d.photo, W, H, null, dk.deep, "left", 0.78, d.photoStyle || "natural"), x: 0, y: 0, w: W, h: H, altText: d.photoAlt || alt });
  const k = `poster-shade:${dk.deep}`; if (!ASSETS[k]) ASSETS[k] = await png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#${dk.deep}" stop-opacity="0"/><stop offset=".55" stop-color="#${dk.deep}" stop-opacity=".25"/><stop offset="1" stop-color="#${dk.deep}" stop-opacity=".9"/></linearGradient></defs><rect y="380" width="1600" height="520" fill="url(#b)"/></svg>`, 1600);
  s.addImage({ data: ASSETS[k], x: 0, y: 0, w: W, h: H, altText: "Lớp phủ tối", _deco: true });
  await photoCredit(s, d.photo, d, null, 0, 0, 0); }
function posterChips(s, items, y) { const fo = { fontFace: TH.bodyFont, fontSize: 17, bold: true }; let x = M;
  for (const [i, t] of items.slice(0, 3).entries()) { mo(i + 1, "rise", i ? 0 : 450); const w = Math.min(4.0, fitW(String(t), fo, 0.6, 0.12, 4.0));
    addT(s, String(t), { _label: `facts[${i}]`, shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.22, x, y, w, h: 0.62, fill: { color: "FFFFFF", transparency: 84 }, line: { color: "FFFFFF", transparency: 55, width: 1 }, color: "FFFFFF", fontSize: 17, bold: true, fontFace: TH.bodyFont, align: "center", valign: "middle", margin: 0 });
    x += w + 0.22; } mo(0); }
async function coverPoster(s, c, d, meta) { const dk = TH.d; await posterBg(s, d, "Ảnh bìa");
  const tw = 8.6, facts = Array.isArray(d.facts) ? d.facts : [];
  const tr = rich(d.title, "FFFFFF", dk.acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { bold: true }) }));
  let fz = 56, th = 2; for (fz of [58, 52, 46]) { const m = measure(noOrphan(tr), { fontFace: TH.titleFont, fontSize: fz, bold: true }, tw); th = m.ok ? m.lines * fz / 72 * 1.18 + 0.08 : 2.2; if (!m.ok || m.lines <= 3) break; } // cao theo SỐ DÒNG thật — ước dư thì vạch màu rơi xa tiêu đề
  const sh = d.subtitle ? realH(d.subtitle, { fontFace: TH.bodyFont, fontSize: 20 }, 7.6, 0.6) + 0.06 : 0;
  const bottom = facts.length ? H - 1.75 : H - 1.0, blk = (d.kicker ? 0.6 : 0) + th + 0.32 + (sh ? sh + 0.1 : 0); let y = Math.max(0.7, bottom - blk - 0.2);
  if (d.kicker) { const kw = fitW(String(d.kicker).toUpperCase(), { fontFace: TH.bodyFont, fontSize: 13, bold: true, charSpacing: 1.5 }, 0.5, 0.1, 7);
    addT(s, String(d.kicker).toUpperCase(), { _label: "kicker", shape: pres.shapes.RECTANGLE, x: M, y, w: kw, h: 0.4, fill: { color: dk.acc }, color: dk.bg, fontSize: 13, bold: true, charSpacing: 1.5, align: "center", valign: "middle", margin: 0, fontFace: TH.bodyFont }); y += 0.6; }
  T(s, tr, { _label: "title", x: M, y, w: tw, h: th, fontSize: fz, fontFace: TH.titleFont, color: "FFFFFF", valign: "bottom" /* chữ bám đáy khung → luôn sát vạch màu dù trình chiếu ngắt dòng khác */ }); y += th + 0.08;
  s.addShape(pres.shapes.RECTANGLE, { x: M, y, w: 1.3, h: 0.09, fill: { color: dk.acc }, line: { type: "none" } }); y += 0.24;
  if (d.subtitle) T(s, rich(d.subtitle, "F1F5F6", dk.acc), { _label: "subtitle", x: M, y, w: 7.6, h: sh, fontSize: 20, color: "F1F5F6" });
  if (facts.length) posterChips(s, facts, H - 1.45);
  const who = [d.author, d.authorSub].filter(Boolean).join(" · "); if (who) T(s, who, { _label: "author", x: W - M - 5.2, y: H - 0.6, w: 5.2, h: 0.36, fontSize: 13, color: "E6ECEE", align: "right" }); }
async function endPoster(s, c, d, meta) { const dk = TH.d; await posterBg(s, d, "Ảnh kết thúc");
  const tw = 8.6, tr = rich(d.title, "FFFFFF", dk.acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { fontFace: TH.accentFont, italic: TH.accentItalic, bold: TH.accentBold }) }));
  const th = realH(tr, { fontFace: TH.accentFont, fontSize: 64 }, tw, 1.3) + 0.1, sh = d.sub ? realH(d.sub, { fontFace: TH.bodyFont, fontSize: 21 }, 7.6, 0.5) + 0.06 : 0;
  const msg = d.message ? realH(d.message, { fontFace: TH.bodyFont, fontSize: 19, bold: true }, 7.6, 0.5) + 0.06 : 0;
  let y = Math.max(0.8, H - 1.0 - (msg ? msg + 0.3 : 0) - th - (sh ? sh + 0.12 : 0) - 0.2);
  if (d.message) { T(s, d.message, { _label: "message", x: M, y, w: 7.6, h: msg, fontSize: 19, bold: true, color: dk.acc }); y += msg + 0.3; }
  T(s, tr, { _label: "title", x: M, y, w: tw, h: th, fontSize: 64, color: "FFFFFF" }); y += th + 0.12;
  if (d.sub) T(s, rich(d.sub, "F1F5F6", dk.acc), { _label: "sub", x: M, y, w: 7.6, h: sh, fontSize: 21, color: "F1F5F6" });
  const team = (d.team || []).slice(0, 3).map(m => m.name + (m.role ? " · " + m.role : "")); if (team.length) posterChips(s, team, H - 1.05);
  if (d.contact) T(s, d.contact, { _label: "contact", x: W - M - 5.2, y: H - 0.6, w: 5.2, h: 0.36, fontSize: 13, color: "E6ECEE", align: "right" }); }


// ---------- KHỐI HÌNH CHÍNH THEO VẬT CHỦ ĐẠO (11/2026) — vật thật CHỞ dữ liệu, không chỉ trang trí (học từ cây thước tuổi / thanh container của infographic) ----------
const footNote = (s, c, d) => { if (d.note) T(s, rich(d.note, c.muted, c.text), { _label: "note", x: M, y: FOOT_Y, w: W - 2 * M, h: FOOT_H, fontSize: 13 }); };
// sheet — TỜ RỜI KẺ BẢNG (sổ BHXH: "quá trình đóng"): mỗi dòng một mốc, thanh giá trị trong ô, cột ghi chú = lý do tại đúng dòng đó.
// Hàng số cột (1)(2)(3) dưới đầu bảng như biểu mẫu thật; dòng focus tô nền; tone "bad" thanh đỏ.
L.sheet = async (s, c, d) => {
  const y0 = kickerTitle(s, c, d), rows = (d.rows || []).slice(0, 12), n = Math.max(1, rows.length), cols = d.cols || ["Mốc", "Giá trị", "Ghi chú"];
  const x0 = M, w0 = W - 2 * M, top = y0 - 0.05, bot = d.note ? 6.5 : 6.92, hh = 0.4, nh = 0.26;
  const rh = Math.min(0.46, (bot - top - hh - nh - 0.12) / n), sh = hh + nh + rh * n + 0.12;
  s.addShape(pres.shapes.RECTANGLE, { x: x0, y: top, w: w0, h: sh, fill: { color: "FFFFFF" }, line: { color: c.acc, width: 1.75 }, shadow: { type: "outer", blur: 10, offset: 3, angle: 90, color: "000000", opacity: 0.08 } });
  s.addShape(pres.shapes.RECTANGLE, { x: x0 + 0.06, y: top + 0.06, w: w0 - 0.12, h: sh - 0.12, fill: { type: "none" }, line: { color: c.acc, width: 0.5 } }); // viền kép
  const cw = [1.35, 5.2, w0 - 0.12 - 1.35 - 5.2], cx = [x0 + 0.06, x0 + 0.06 + cw[0], x0 + 0.06 + cw[0] + cw[1]], y1 = top + 0.06;
  s.addShape(pres.shapes.RECTANGLE, { x: x0 + 0.06, y: y1, w: w0 - 0.12, h: hh, fill: { color: c.deep }, line: { type: "none" } });
  cols.slice(0, 3).forEach((t, i) => { T(s, String(t).toUpperCase(), { _label: `cols[${i}]`, x: cx[i] + 0.12, y: y1, w: cw[i] - 0.24, h: hh, fontSize: 12, bold: true, color: c.acc, charSpacing: 1, valign: "middle" });
    T(s, `(${i + 1})`, { _label: "số cột", x: cx[i], y: y1 + hh, w: cw[i], h: nh, fontSize: 11, italic: true, color: c.muted, align: "center", valign: "middle" }); });
  for (const xx of cx.slice(1)) s.addShape(pres.shapes.LINE, { x: xx, y: y1, w: 0, h: sh - 0.12, line: { color: c.acc, width: 0.75, transparency: 30 } });
  s.addShape(pres.shapes.LINE, { x: x0 + 0.06, y: y1 + hh + nh, w: w0 - 0.12, h: 0, line: { color: c.acc, width: 1 } });
  const vmax = Math.max(...rows.map(r => Math.abs(+r.value || 0)), 1), bx = cx[1] + 0.15, bwMax = cw[1] - 1.6;
  rows.forEach((r, i) => { const y = y1 + hh + nh + i * rh, bad = r.tone === "bad" || (+r.value || 0) < 0;
    mo(100 + i, "wipe", 350); if (r.focus) s.addShape(pres.shapes.RECTANGLE, { x: x0 + 0.07, y, w: w0 - 0.14, h: rh, fill: { color: mix(TH.gold, "FFFFFF", 0.78) }, line: { type: "none" } });
    mo(0); if (i) s.addShape(pres.shapes.LINE, { x: x0 + 0.06, y, w: w0 - 0.12, h: 0, line: { color: c.line, width: 0.5 } });
    mo(i + 1, "fade"); T(s, String(r.label), { _label: `rows[${i}].label`, x: cx[0] + 0.12, y, w: cw[0] - 0.24, h: rh, fontSize: 14, bold: !!r.focus, color: c.text, valign: "middle" });
    const bw = Math.max(0.04, bwMax * Math.abs(+r.value || 0) / vmax), bh2 = Math.min(0.24, rh * 0.55);
    CUR.sfx = MOTION_ON ? "wipe" : null; s.addShape(pres.shapes.RECTANGLE, Object.assign({ x: bx, y: y + (rh - bh2) / 2, w: bw, h: bh2, fill: { color: bad ? c.bad : c.acc, transparency: r.hatch ? 55 : 0 }, line: r.hatch ? { color: bad ? c.bad : c.acc, width: 0.75, dashType: "dash" } : { type: "none" } }));
    CUR.sfx = null; T(s, r.display || String(r.value), { _label: `rows[${i}].display`, x: bx + bw + 0.1, y, w: 1.3, h: rh, fontSize: 14, bold: true, color: bad ? c.bad : c.text, valign: "middle" });
    if (r.note) T(s, rich(String(r.note), c.text, c.acc), { _label: `rows[${i}].note`, x: cx[2] + 0.12, y, w: cw[2] - 0.24, h: rh, fontSize: 13, color: bad ? c.bad : c.text, valign: "middle" }); mo(0); });
  if (d.unit) T(s, "Đơn vị: " + d.unit, { _label: "unit", x: cx[1] + 0.12, y: y1, w: cw[1] - 0.24, h: hh, fontSize: 11, color: c.muted, align: "right", valign: "middle" });
  footNote(s, c, d);
};
// calendar — LỊCH CHẤM CÔNG một tháng: khoảng ngày tô màu = thời hạn (báo trước, thử việc, nghỉ, giải quyết hồ sơ). Cột Chủ nhật nền đỏ nhạt.
L.calendar = async (s, c, d) => {
  const y0 = kickerTitle(s, c, d), days = Math.min(31, Math.max(28, +d.days || 30)), st = Math.min(7, Math.max(1, +d.startDay || 1)); // 1 = thứ Hai
  const gx = M, gw = 7.3, top = y0 + 0.05, cwid = gw / 7, rowsN = Math.ceil((st - 1 + days) / 7), bot = d.note ? 6.45 : 6.9, hh = 0.38, ch = Math.min(0.78, (bot - top - hh - 0.5) / rowsN);
  const marks = (d.marks || []).slice(0, 4), pal = [c.acc, c.bad, TH.gold, c.muted], colOf = (m, i) => m.tone === "bad" ? c.bad : m.tone === "muted" ? c.muted : pal[i % pal.length];
  if (d.month) T(s, d.month, { _label: "month", x: gx, y: top, w: gw, h: 0.42, fontSize: 18, bold: true, color: c.acc });
  const gy = top + 0.5; ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].forEach((t, i) => { s.addShape(pres.shapes.RECTANGLE, { x: gx + i * cwid, y: gy, w: cwid, h: hh, fill: { color: i === 6 ? c.bad : c.acc }, line: { color: "FFFFFF", width: 1 } });
    T(s, t, { _label: "thứ", x: gx + i * cwid, y: gy, w: cwid, h: hh, fontSize: 13, bold: true, color: "FFFFFF", align: "center", valign: "middle" }); });
  for (let k = 0; k < rowsN * 7; k++) { const day = k - (st - 1) + 1, cxx = gx + (k % 7) * cwid, cyy = gy + hh + Math.floor(k / 7) * ch, sun = k % 7 === 6;
    const mi = marks.findIndex(m => day >= +m.from && day <= +m.to), inM = day >= 1 && day <= days && mi >= 0; mo(inM ? 2 * mi + 1 : 0, "fade");
    s.addShape(pres.shapes.RECTANGLE, { x: cxx, y: cyy, w: cwid, h: ch, fill: { color: inM ? mix(colOf(marks[mi], mi), "FFFFFF", 0.76) : sun ? mix(c.bad, "FFFFFF", 0.9) : "FFFFFF" }, line: { color: c.line, width: 0.75 } });
    if (day >= 1 && day <= days) T(s, String(day), { _label: "ngày", x: cxx + 0.06, y: cyy + 0.04, w: cwid - 0.12, h: 0.3, fontSize: 13, bold: inM, color: sun && !inM ? c.bad : c.text });
    if (inM && day === +marks[mi].from) s.addShape(pres.shapes.OVAL, { x: cxx + cwid - 0.3, y: cyy + 0.07, w: 0.2, h: 0.2, fill: { color: colOf(marks[mi], mi) }, line: { type: "none" } }); } mo(0);
  // cột phải: mỗi khoảng một thẻ (màu khớp ô lịch) + số ngày
  const lx = gx + gw + 0.45, lw = W - M - lx; let ly = gy;
  marks.forEach((m, i) => { mo(2 * i + 2, "rise"); const nd = (+m.to) - (+m.from) + 1, col = colOf(m, i), th2 = realH(m.label || "", { fontFace: TH.bodyFont, fontSize: 15 }, lw - 1.35, 0.4), hb = Math.max(0.8, th2 + 0.5);
    box(s, lx, ly, lw, hb, "FFFFFF", c.line);
    s.addShape(pres.shapes.RECTANGLE, { x: lx, y: ly, w: 0.12, h: hb, fill: { color: col }, line: { type: "none" } });
    T(s, String(nd), { _label: `marks[${i}] số ngày`, x: lx + 0.22, y: ly + 0.06, w: 1.0, h: 0.5, fontSize: 28, bold: true, fontFace: TH.numFont, italic: TH.numItalic, color: col });
    T(s, "ngày", { _label: "ngày", x: lx + 0.22, y: ly + 0.52, w: 1.0, h: 0.26, fontSize: 12, color: c.muted });
    T(s, rich(m.label || "", c.text, c.acc), { _label: `marks[${i}].label`, x: lx + 1.25, y: ly + 0.1, w: lw - 1.35, h: hb - 0.2, fontSize: 15, color: c.text, valign: "middle" });
    ly += hb + 0.16; }); mo(0);
  footNote(s, c, d);
};
// riskbar — THANH CONTAINER theo chặng: mỗi dòng một phương án, phần bên A chịu (container màu, có gờ) tới vạch chuyển; "pay" = bên A còn trả chi phí tới chặng (nét đứt).
L.riskbar = async (s, c, d) => {
  const y0 = kickerTitle(s, c, d), st = (d.stages || []).slice(0, 7), rows = (d.rows || []).slice(0, 8), ns = Math.max(1, st.length);
  const lx = M, lw = 2.5, bx = lx + lw + 0.2, bw = W - M - bx, sw = bw / ns, top = y0, hh = 0.62, bot = d.note || d.legend ? 6.35 : 6.85, rh = Math.min(0.88, (bot - top - hh) / Math.max(1, rows.length)); // ít phương án thì dòng cao hơn, không dồn lên trên
  st.forEach((t, i) => T(s, String(t), { _label: `stages[${i}]`, x: bx + i * sw, y: top, w: sw, h: hh, fontSize: 13, bold: true, color: c.text, align: "center", valign: "bottom" }));
  const A = c.acc, Bc = mix(c.acc, "FFFFFF", 0.85);
  rows.forEach((r, i) => { const y = top + hh + 0.1 + i * rh, bh2 = Math.min(0.42, rh * 0.55), yb = y + (rh - bh2) / 2, at = Math.max(0, Math.min(ns, +r.at || 0));
    T(s, String(r.label), { _label: `rows[${i}].label`, x: lx, y: y + 0.02, w: lw, h: rh * 0.55, fontSize: 18, bold: true, color: c.text, valign: "bottom" });
    if (r.sub) T(s, String(r.sub), { _label: `rows[${i}].sub`, x: lx, y: y + rh * 0.55, w: lw, h: rh * 0.42, fontSize: 12, color: c.muted, valign: "top" });
    s.addShape(pres.shapes.RECTANGLE, { x: bx, y: yb, w: bw, h: bh2, fill: { color: Bc }, line: { color: c.line, width: 0.75 } });
    mo(i + 1, "wipe", i ? 40 : 100); if (at > 0) { s.addShape(pres.shapes.RECTANGLE, { x: bx, y: yb, w: at * sw, h: bh2, fill: { color: A }, line: { type: "none" } });
      for (let k = 1; k < at * 4; k++) s.addShape(pres.shapes.LINE, { x: bx + k * sw / 4, y: yb + 0.05, w: 0, h: bh2 - 0.1, line: { color: "FFFFFF", width: 0.5, transparency: 55 } }); } // gờ tôn container
    mo(50 + i, "wipe", i ? 0 : 300); if (r.pay != null && +r.pay > at) s.addShape(pres.shapes.LINE, { x: bx + at * sw, y: yb + bh2 / 2, w: (+r.pay - at) * sw, h: 0, line: { color: A, width: 2, dashType: "dash", endArrowType: "oval" } });
    mo(i + 1); CUR.sfx = MOTION_ON ? "fade" : null; s.addShape(pres.shapes.RECTANGLE, { x: bx + at * sw - 0.04, y: yb - 0.08, w: 0.08, h: bh2 + 0.16, fill: { color: c.text }, line: { type: "none" } }); mo(0); // vạch chuyển
    if (i) s.addShape(pres.shapes.LINE, { x: lx, y, w: W - 2 * M, h: 0, line: { color: c.line, width: 0.5, dashType: "dash" } }); });
  const lg = d.legend || [];
  if (lg.length) { let x = M; [[A, lg[0]], [Bc, lg[1]], [A, lg[2], true]].forEach(([col, t, dash]) => { if (!t) return;
    if (dash) s.addShape(pres.shapes.LINE, { x, y: 6.62 + 0.2, w: 0.4, h: 0, line: { color: col, width: 2, dashType: "dash" } }); else s.addShape(pres.shapes.RECTANGLE, { x, y: 6.62 + 0.08, w: 0.4, h: 0.24, fill: { color: col }, line: { color: c.line, width: 0.5 } });
    const tw = fitW(t, { fontFace: TH.bodyFont, fontSize: 13 }, 0.2, 0.1, 4); T(s, t, { _label: "legend", x: x + 0.5, y: 6.62, w: tw, h: 0.4, fontSize: 13, color: c.text, valign: "middle" }); x += 0.5 + tw + 0.4; }); }
  else footNote(s, c, d);
};
// plan — MẶT BẰNG có đường kích thước: khung (thửa đất / căn nhà / phòng) + vùng bên trong (tỉ lệ 0–1) + nhãn kích thước cạnh trên & cạnh phải; cột phải 1–3 ý.
L.plan = async (s, c, d) => {
  const y0 = kickerTitle(s, c, d), bot = d.note ? 6.35 : 6.8, px = M + 0.45, py = y0 + 0.55, ph = bot - py, pw = Math.min(6.6, ph * (+d.ratio || 1.45));
  s.addShape(pres.shapes.RECTANGLE, { x: px, y: py, w: pw, h: ph, fill: { color: "FFFFFF" }, line: { color: c.acc, width: 4 } });
  for (const [i, z] of (d.zones || []).slice(0, 5).entries()) { mo(i + 1, "fade", i ? 0 : 100); const zx = px + pw * (+z.x || 0), zy = py + ph * (+z.y || 0), zw = pw * (+z.w || 0.3), zh = ph * (+z.h || 0.3), bad = z.tone === "bad";
    s.addShape(pres.shapes.RECTANGLE, { x: zx, y: zy, w: zw, h: zh, fill: { color: bad ? mix(c.bad, "FFFFFF", 0.82) : mix(c.acc, "FFFFFF", 0.86) }, line: { color: bad ? c.bad : c.acc, width: 1.25, dashType: z.dash ? "dash" : "solid" } });
    T(s, rich(String(z.label || ""), bad ? c.bad : c.text, c.acc), { _label: `zones[${i}].label`, x: zx + 0.08, y: zy + 0.06, w: zw - 0.16, h: Math.max(0.3, zh - 0.12), fontSize: 14, bold: true, color: bad ? c.bad : c.text, align: "center", valign: "middle" }); }
  mo(20, "wipe", 150); const dim = (x1, y1, x2, y2, label, vert) => { s.addShape(pres.shapes.LINE, { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1), line: { color: c.acc, width: 1, beginArrowType: "triangle", endArrowType: "triangle" } });
    if (label) T(s, label, { _label: "kích thước", x: vert ? x1 + 0.08 : (x1 + x2) / 2 - 1.2, y: vert ? (y1 + y2) / 2 - 0.2 : y1 - 0.36, w: vert ? 1.6 : 2.4, h: 0.32, fontSize: 13, bold: true, color: c.acc, align: vert ? "left" : "center", valign: "middle" }); };
  dim(px, py - 0.22, px + pw, py - 0.22, d.width); dim(px + pw + 0.22, py, px + pw + 0.22, py + ph, d.height, true);
  const tx = px + pw + 1.9, tw2 = W - M - tx; let ty = py;
  for (const [i, it] of (d.items || []).slice(0, 3).entries()) { mo(30 + i, "rise", i ? 0 : 200); const hh = realH(it.head || "", { fontFace: TH.bodyFont, fontSize: 18, bold: true }, tw2, 0.35), th2 = it.text ? realH(rich(it.text, c.muted, c.text), { fontFace: TH.bodyFont, fontSize: 15 }, tw2, 0.4) : 0;
    T(s, rich(it.head || "", c.text, c.acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { bold: true }) })), { _label: `items[${i}].head`, x: tx, y: ty, w: tw2, h: hh + 0.02, fontSize: 18 });
    if (it.text) T(s, rich(it.text, c.muted, c.text), { _label: `items[${i}].text`, x: tx, y: ty + hh + 0.06, w: tw2, h: th2 + 0.02, fontSize: 15, color: c.muted });
    ty += hh + (th2 ? th2 + 0.06 : 0) + 0.35; } mo(0);
  footNote(s, c, d);
};

// ---------- KHỐI HÌNH CHÍNH ĐỢT 2 (11/2026): hoá đơn · sao kê · cơ cấu sở hữu · biên bản ----------
// Hình MINH HOẠ chở dữ liệu, không phải mẫu giấy tờ thật: không số ký hiệu, không mã cơ quan, không quốc huy / con dấu cơ quan.
const pointsCol = (s, c, d, tx, ty, base = 30) => { const tw2 = W - M - tx;
  for (const [i, it] of (d.points || []).slice(0, 3).entries()) { mo(base + i, "rise", i ? 0 : 250);
    const hh = realH(it.head || "", { fontFace: TH.bodyFont, fontSize: 18, bold: true }, tw2, 0.35), th2 = it.text ? realH(rich(it.text, c.muted, c.text), { fontFace: TH.bodyFont, fontSize: 15 }, tw2, 0.4) : 0;
    T(s, rich(it.head || "", c.text, c.acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { bold: true }) })), { _label: `points[${i}].head`, x: tx, y: ty, w: tw2, h: hh + 0.02, fontSize: 18 });
    if (it.text) T(s, rich(it.text, c.muted, c.text), { _label: `points[${i}].text`, x: tx, y: ty + hh + 0.06, w: tw2, h: th2 + 0.02, fontSize: 15, color: c.muted });
    ty += hh + (th2 ? th2 + 0.06 : 0) + 0.35; } mo(0); };
const teeth = async (fill, w) => png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.round(w * 100)} 12" preserveAspectRatio="none"><polygon points="${[...Array(Math.round(w * 100 / 16) + 1).keys()].map(i => `${i * 16},0 ${i * 16 + 8},11`).join(" ")} ${Math.round(w * 100)},0" fill="#${fill}"/></svg>`, 1200);
// receipt — HOÁ ĐƠN / BIÊN LAI (world hoa-don): dòng hàng có chấm dẫn → cộng tiền hàng → thuế → TỔNG đậm dưới gạch đôi; mép dưới răng cưa như giấy xé. Cột phải 1–3 ý giải thích.
L.receipt = async (s, c, d) => {
  const y0 = kickerTitle(s, c, d), items = (d.items || []).slice(0, 8), px = M + 0.15, pw = 6.3, top = y0, bot = d.note ? 6.2 : 6.65;
  const nr = items.length + (d.sub ? 1 : 0) + (d.tax ? 1 : 0), headH = d.head ? 0.55 : 0.15, totH = 0.75, rh = Math.min(0.46, (bot - top - headH - totH - 0.4) / Math.max(1, nr)), ph = headH + nr * rh + totH + 0.4;
  s.addShape(pres.shapes.RECTANGLE, { x: px, y: top, w: pw, h: ph, fill: { color: "FFFFFF" }, line: { type: "none" }, shadow: { type: "outer", blur: 8, offset: 2, angle: 90, color: "000000", opacity: 0.1 } });
  s.addImage({ data: await teeth("FFFFFF", pw), x: px, y: top + ph - 0.005, w: pw, h: 0.12, altText: "Mép giấy xé", _deco: true });
  let y = top + 0.12; const lx = px + 0.3, rx = px + pw - 0.3, dw = 1.9, sep = (yy, dash) => s.addShape(pres.shapes.LINE, { x: lx, y: yy, w: rx - lx, h: 0, line: { color: c.acc, width: dash ? 1 : 1.25, dashType: dash ? "dash" : "solid", transparency: dash ? 35 : 0 } });
  if (d.head) { T(s, String(d.head).toUpperCase(), { _label: "head", x: lx, y, w: rx - lx, h: 0.34, fontSize: 14, bold: true, color: c.acc, align: "center", charSpacing: 1.5, valign: "middle" }); y += 0.4; sep(y, true); y += 0.03; }
  const row = (lab, disp, key, o = {}) => { const fo = { fontFace: TH.bodyFont, fontSize: o.fz || 15, bold: !!o.bold }, lw = Math.min(rx - lx - dw - 0.2, (textW(String(lab), fo) || String(lab).length * 0.1) + 0.12);
    T(s, String(lab), { _label: `${key}.label`, x: lx, y, w: lw, h: rh, fontSize: o.fz || 15, bold: !!o.bold, color: o.col || c.text, valign: "middle" });
    s.addShape(pres.shapes.LINE, { x: lx + lw + 0.05, y: y + rh * 0.68, w: Math.max(0.1, rx - dw - 0.05 - (lx + lw + 0.05)), h: 0, line: { color: c.muted, width: 0.75, dashType: "sysDot", transparency: 30 } });
    T(s, String(disp), { _label: `${key}.display`, x: rx - dw, y, w: dw, h: rh, fontSize: o.fz || 15, bold: true, color: o.col || c.text, align: "right", valign: "middle", fontFace: TH.numFont }); };
  items.forEach((it, i) => { if (it.focus) { mo(100 + i, "wipe", 350); s.addShape(pres.shapes.RECTANGLE, { x: px + 0.08, y, w: pw - 0.16, h: rh, fill: { color: mix(TH.gold, "FFFFFF", 0.75) }, line: { type: "none" } }); }
    mo(i + 1, "fade"); row(it.label, it.display, `items[${i}]`, { col: it.tone === "bad" ? c.bad : null, bold: !!it.focus }); y += rh; mo(0); });
  if (d.sub || d.tax) { sep(y + 0.03, true); y += 0.06; }
  if (d.sub) { mo(40, "fade", 120); row(d.sub.label, d.sub.display, "sub"); y += rh; }
  if (d.tax) { mo(41, "fade"); row(d.tax.label, d.tax.display, "tax", { col: c.acc }); y += rh; } mo(0);
  sep(y + 0.08); sep(y + 0.14); y += 0.24;
  const tot = d.total || {}; mo(60, "slam", 350, true); CUR.sfx = MOTION_ON ? "fade" : null;
  T(s, String(tot.label || "Tổng"), { _label: "total.label", x: lx, y, w: rx - lx - 2.6, h: totH - 0.1, fontSize: 18, bold: true, color: c.text, valign: "middle" }); CUR.sfx = null;
  T(s, String(tot.display || ""), { _label: "total.display", x: rx - 2.6, y, w: 2.6, h: totH - 0.1, fontSize: 28, bold: true, color: c.acc, align: "right", valign: "middle", fontFace: TH.numFont }); mo(0);
  if (d.unit) T(s, "Đơn vị: " + d.unit, { _label: "unit", x: px, y: top + ph + 0.2, w: pw, h: 0.3, fontSize: 12, italic: true, color: c.muted, align: "right" });
  pointsCol(s, c, d, px + pw + 0.6, top + 0.05, 70); footNote(s, c, d); // cột giải thích hiện SAU dòng tổng
};
// account — SAO KÊ TÀI KHOẢN (world sao-ke): Ngày | Diễn giải | Ghi nợ (−) | Ghi có (+) | Số dư; dòng xen màu, khoản ra đỏ / khoản vào xanh; số dư đầu – cuối kỳ; focus = vạch trái + tô nền.
L.account = async (s, c, d) => {
  const y0 = kickerTitle(s, c, d), rows = (d.rows || []).slice(0, 8), x0 = M, w0 = W - 2 * M, top = y0 - 0.02, bot = d.note ? 6.45 : 6.88, hh = 0.42, good = c.good || c.acc;
  const ex = (d.open ? 1 : 0) + (d.close ? 1 : 0), rh = Math.min(0.5, (bot - top - hh - 0.12) / (rows.length + ex)), nw = 1.7, cw = [1.25, w0 - 1.25 - nw * 3, nw, nw, nw], cx = cw.map((_, i) => x0 + cw.slice(0, i).reduce((a, b) => a + b, 0));
  const cols = d.cols || ["Ngày", "Diễn giải", "Ghi nợ (−)", "Ghi có (+)", "Số dư"];
  s.addShape(pres.shapes.RECTANGLE, { x: x0, y: top, w: w0, h: hh, fill: { color: c.acc }, line: { type: "none" } });
  cols.slice(0, 5).forEach((t, i) => T(s, String(t), { _label: `cols[${i}]`, x: cx[i] + 0.12, y: top, w: cw[i] - 0.24, h: hh, fontSize: 13, bold: true, color: c.onAcc || "FFFFFF", align: i >= 2 ? "right" : "left", valign: "middle" }));
  let y = top + hh; const line = (yy, wdt = 0.5) => s.addShape(pres.shapes.LINE, { x: x0, y: yy, w: w0, h: 0, line: { color: c.line, width: wdt } });
  if (d.open) { T(s, "Số dư đầu kỳ", { _label: "open.label", x: cx[1] + 0.12, y, w: cw[1] - 0.24, h: rh, fontSize: 14, italic: true, color: c.muted, valign: "middle" });
    T(s, String(d.open), { _label: "open", x: cx[4] + 0.12, y, w: cw[4] - 0.24, h: rh, fontSize: 14, color: c.muted, align: "right", valign: "middle", fontFace: TH.numFont }); y += rh; line(y); }
  rows.forEach((r, i) => { const a = +r.amount || 0, out = a < 0, disp = r.display || (out ? "−" : "+") + Math.abs(a).toLocaleString("vi-VN");
    s.addShape(pres.shapes.RECTANGLE, { x: x0, y, w: w0, h: rh, fill: { color: i % 2 ? mix(c.acc, "FFFFFF", 0.93) : "FFFFFF" }, line: { type: "none" } });
    if (r.focus) { mo(100 + i, "wipe", 350); s.addShape(pres.shapes.RECTANGLE, { x: x0, y, w: w0, h: rh, fill: { color: mix(TH.gold, "FFFFFF", 0.72) }, line: { type: "none" } }); CUR.sfx = MOTION_ON ? "fade" : null;
      s.addShape(pres.shapes.RECTANGLE, { x: x0, y, w: 0.08, h: rh, fill: { color: c.acc }, line: { type: "none" } }); mo(0); }
    mo(i + 1, "fade"); T(s, String(r.date), { _label: `rows[${i}].date`, x: cx[0] + 0.12, y, w: cw[0] - 0.24, h: rh, fontSize: 14, color: c.text, valign: "middle", fontFace: TH.numFont });
    T(s, rich(String(r.desc), c.text, c.acc), { _label: `rows[${i}].desc`, x: cx[1] + 0.12, y, w: cw[1] - 0.24, h: rh, fontSize: 14, bold: !!r.focus, color: c.text, valign: "middle" });
    T(s, disp, { _label: `rows[${i}].display`, x: cx[out ? 2 : 3] + 0.12, y, w: cw[2] - 0.24, h: rh, fontSize: 14, bold: true, color: out ? c.bad : good, align: "right", valign: "middle", fontFace: TH.numFont });
    if (r.balance) T(s, String(r.balance), { _label: `rows[${i}].balance`, x: cx[4] + 0.12, y, w: cw[4] - 0.24, h: rh, fontSize: 14, bold: !!r.focus, color: c.text, align: "right", valign: "middle", fontFace: TH.numFont });
    mo(0); y += rh; });
  if (d.close) { mo(60, "fade", 250, true); line(y, 1.25); line(y + 0.05, 1.25); T(s, "Số dư cuối kỳ", { _label: "close.label", x: cx[1] + 0.12, y: y + 0.05, w: cw[1] - 0.24, h: rh, fontSize: 15, bold: true, color: c.text, valign: "middle" });
    T(s, String(d.close), { _label: "close", x: cx[4] + 0.02, y: y + 0.05, w: cw[4] - 0.14, h: rh, fontSize: 17, bold: true, color: c.acc, align: "right", valign: "middle", fontFace: TH.numFont }); mo(0); y += rh + 0.05; }
  for (const xx of cx.slice(1)) s.addShape(pres.shapes.LINE, { x: xx, y: top + hh, w: 0, h: y - top - hh, line: { color: c.line, width: 0.5 } });
  s.addShape(pres.shapes.RECTANGLE, { x: x0, y: top, w: w0, h: y - top, fill: { type: "none" }, line: { color: c.acc, width: 1 } });
  if (d.unit) T(s, "Đơn vị: " + d.unit, { _label: "unit", x: x0, y: y + 0.06, w: w0, h: 0.3, fontSize: 12, italic: true, color: c.muted, align: "right" });
  footNote(s, c, d);
};
// captable — CƠ CẤU SỞ HỮU (world co-cau): các chủ sở hữu ở trên, đường nối về công ty (dày theo tỉ lệ, nhãn %), dưới cùng thanh 0–100 % chồng phần + vạch ngưỡng biểu quyết.
L.captable = async (s, c, d) => {
  const y0 = kickerTitle(s, c, d), hs = (d.holders || []).slice(0, 5), n = Math.max(1, hs.length), top = y0 + 0.02, bh = 0.95, bw = Math.min(2.35, (W - 2 * M - 0.35 * (n - 1)) / n), gap = n > 1 ? (W - 2 * M - n * bw) / (n - 1) : 0;
  const cw = 4.4, cx = (W - cw) / 2, cy = top + bh + 0.95, ch = 0.72, sum = hs.reduce((a, h) => a + (+h.pct || 0), 0);
  const hx = (i) => n === 1 ? (W - bw) / 2 : M + i * (bw + gap), shade = (i) => mix(c.acc, "FFFFFF", Math.min(0.75, 0.15 + 0.15 * i));
  hs.forEach((h, i) => { const x = hx(i), mx = x + bw / 2, ex = cx + cw * (i + 1) / (n + 1), p = +h.pct || 0;
    mo(10 + i, "fade", i ? 0 : 150); s.addShape(pres.shapes.LINE, { x: Math.min(mx, ex), y: top + bh, w: Math.abs(ex - mx), h: cy - top - bh, flipH: ex < mx, line: { color: h.focus ? c.acc : shade(i), width: 1.25 + 6 * p / 100 } });
    const t = 0.42, qx = mx + (ex - mx) * t, qy = top + bh + (cy - top - bh) * t; addT(s, `${String(p).replace(".", ",")}%`, { _label: `holders[${i}].pct`, shape: pres.shapes.ROUNDED_RECTANGLE, rectRadius: 0.15, x: qx - 0.5, y: qy - 0.19, w: 1.0, h: 0.38, fill: { color: "FFFFFF" }, line: { color: c.acc, width: 1 }, color: c.acc, fontSize: 14, bold: true, align: "center", valign: "middle", margin: 0, fontFace: TH.bodyFont }); });
  hs.forEach((h, i) => { const x = hx(i), on = !!h.focus; mo(i + 1, "rise", i ? 0 : 80);
    box(s, x, top, bw, bh, on ? c.acc : "FFFFFF", c.acc);
    T(s, String(h.name), { _label: `holders[${i}].name`, x: x + 0.1, y: top + 0.08, w: bw - 0.2, h: h.sub ? 0.5 : bh - 0.16, fontSize: 16, bold: true, color: on ? c.onAcc || "FFFFFF" : c.text, align: "center", valign: h.sub ? "bottom" : "middle" });
    if (h.sub) T(s, String(h.sub), { _label: `holders[${i}].sub`, x: x + 0.1, y: top + 0.56, w: bw - 0.2, h: 0.32, fontSize: 12, color: on ? c.onAcc || "FFFFFF" : c.muted, align: "center", valign: "top" }); });
  mo(20, "pop", 150, true); addT(s, String(d.company || "Công ty"), { _label: "company", shape: pres.shapes.RECTANGLE, x: cx, y: cy, w: cw, h: ch, fill: { color: c.text }, line: { type: "none" }, color: "FFFFFF", fontSize: 18, bold: true, align: "center", valign: "middle", margin: 0, fontFace: TH.bodyFont }); mo(0);
  const by = cy + ch + 0.5, bx = M, bwid = W - 2 * M, bhh = 0.42; let x = bx;
  s.addShape(pres.shapes.RECTANGLE, { x: bx, y: by, w: bwid, h: bhh, fill: { color: mix(c.muted, "FFFFFF", 0.85) }, line: { color: c.line, width: 0.75 } });
  hs.forEach((h, i) => { const w = bwid * Math.max(0, +h.pct || 0) / 100; if (w <= 0) return; mo(40 + i, "wipe", i ? 0 : 200);
    s.addShape(pres.shapes.RECTANGLE, { x, y: by, w, h: bhh, fill: { color: h.focus ? c.acc : shade(i) }, line: { color: "FFFFFF", width: 1 } });
    const k0 = h.focus ? c.acc : shade(i), fg = ratio("FFFFFF", k0) >= ratio(c.text, k0) ? "FFFFFF" : c.text;
    if (w > 1.0 && ratio(fg, k0) >= 4.6) T(s, String(h.name), { _label: `holders[${i}] trên thanh`, x: x + 0.06, y: by, w: w - 0.12, h: bhh, fontSize: 12, bold: true, color: fg, valign: "middle", align: "center" }); x += w; }); // màu giữa không đủ tương phản → bỏ nhãn (tên đã có ở ô trên) mo(0);
  if (sum < 99.95) T(s, "khác", { _label: "khác", x, y: by, w: Math.max(0.6, bx + bwid - x), h: bhh, fontSize: 12, color: c.text, align: "center", valign: "middle" });
  const ths = (d.thresholds || []).slice(0, 3).map(t => Object.assign({}, t)).sort((a, b) => a.pct - b.pct), placed = []; // nhãn gần nhau → tầng thấp nhất còn trống (tối đa 3 tầng), vạch dài theo
  ths.forEach((t, i) => { const tx = bx + bwid * (+t.pct || 0) / 100, lx = Math.min(W - M - 2.8, Math.max(M, tx - 1.4)); let lv = 0; while (lv < 2 && placed.some(p => p.lv === lv && Math.abs(p.lx - lx) < 2.9)) lv++; placed.push({ lv, lx }); mo(60 + i, "fade", i ? 0 : 300);
    s.addShape(pres.shapes.LINE, { x: tx, y: by - 0.14, w: 0, h: bhh + 0.28 + lv * 0.38, line: { color: c.text, width: 2 } });
    T(s, rich(String(t.label), c.text, c.acc), { _label: `thresholds[${i}].label`, x: lx, y: by + bhh + 0.16 + lv * 0.38, w: 2.8, h: 0.36, fontSize: 13, color: c.text, align: "center", valign: "top" }); }); mo(0);
  footNote(s, c, d);
};
// record — BIÊN BẢN (world bien-ban): tờ giấy có băng niêm phong vắt góc; các trường "nhãn: nội dung" kẻ chấm; hàng chữ ký cuối (đã ký / TỪ CHỐI KÝ / vắng mặt). Cột phải 1–3 ý.
L.record = async (s, c, d) => {
  const y0 = kickerTitle(s, c, d), fsx = (d.fields || []).slice(0, 6), sg = (d.signs || []).slice(0, 3), px = M + 0.1, pw = 7.3, top = y0, bot = d.note ? 6.35 : 6.8;
  const sgH = sg.length ? 1.15 : 0, headH = 0.6, rh = Math.min(0.62, (bot - top - headH - sgH - 0.3) / Math.max(1, fsx.length)), ph = headH + rh * fsx.length + sgH + 0.3;
  s.addShape(pres.shapes.RECTANGLE, { x: px, y: top, w: pw, h: ph, fill: { color: "FFFFFF" }, line: { color: c.line, width: 0.75 }, shadow: { type: "outer", blur: 8, offset: 2, angle: 90, color: "000000", opacity: 0.08 } });
  T(s, String(d.head || "Biên bản").toUpperCase(), { _label: "head", x: px + 0.3, y: top + 0.12, w: pw - 0.6, h: 0.42, fontSize: 18, bold: true, color: c.text, align: "center", valign: "middle", charSpacing: 1.5 });
  let y = top + headH; const lw = 1.85;
  fsx.forEach((f, i) => { const bad = f.tone === "bad"; mo(i + 1, "fade", i ? 0 : 100);
    T(s, String(f.label) + ":", { _label: `fields[${i}].label`, x: px + 0.3, y, w: lw, h: rh, fontSize: 14, bold: true, color: c.text, valign: "middle" });
    T(s, rich(String(f.value), bad ? c.bad : c.text, c.acc), { _label: `fields[${i}].value`, x: px + 0.3 + lw, y, w: pw - 0.6 - lw, h: rh, fontSize: 15, color: bad ? c.bad : c.text, bold: bad, valign: "middle" });
    s.addShape(pres.shapes.LINE, { x: px + 0.3 + lw, y: y + rh - 0.08, w: pw - 0.6 - lw, h: 0, line: { color: bad ? c.bad : c.muted, width: 0.75, dashType: "sysDot", transparency: bad ? 0 : 35 } }); y += rh; }); mo(0);
  if (sg.length) { const sw = (pw - 0.6) / sg.length; y += 0.12;
    for (const [i, g] of sg.entries()) { const x = px + 0.3 + i * sw; mo(20 + i, "rise", i ? 0 : 250);
      T(s, String(g.role), { _label: `signs[${i}].role`, x, y, w: sw - 0.1, h: 0.32, fontSize: 13, bold: true, color: c.text, align: "center" });
      if (g.state === "signed") s.addImage({ data: await png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 80"><path d="M12 52 C 40 8, 62 76, 92 38 S 140 14, 168 46 S 214 64, 248 22" fill="none" stroke="#${c.acc}" stroke-width="6" stroke-linecap="round"/></svg>`, 520), x: x + sw / 2 - 0.85, y: y + 0.34, w: 1.7, h: 0.52, altText: "Chữ ký" });
      else if (g.state === "refused") { mo(29, "slam", 300); /* trước cột ý (30+) — khoá riêng, không dùng chung nhịp */ addT(s, "TỪ CHỐI KÝ", { _label: `signs[${i}].state`, shape: pres.shapes.RECTANGLE, x: x + sw / 2 - 0.95, y: y + 0.38, w: 1.9, h: 0.46, rotate: -7, fill: { color: "FFFFFF" }, line: { color: c.bad, width: 2.5 }, color: c.bad, fontSize: 15, bold: true, align: "center", valign: "middle", margin: 0, charSpacing: 1.5, fontFace: TH.bodyFont }); }
      else T(s, "(vắng mặt)", { _label: `signs[${i}].state`, x, y: y + 0.4, w: sw - 0.1, h: 0.4, fontSize: 13, italic: true, color: c.muted, align: "center", valign: "middle" }); } mo(0); }
  // băng niêm phong vắt góc phải trên của tờ giấy
  s.addShape(pres.shapes.RECTANGLE, { x: px + pw - 1.45, y: top + 0.18, w: 2.0, h: 0.3, rotate: 38, fill: { color: c.bad, transparency: 12 }, line: { color: "FFFFFF", width: 1, dashType: "dash" }, _deco: true });
  pointsCol(s, c, d, px + pw + 0.75, top + 0.05); footNote(s, c, d);
};

async function coverTypo(s, c, d, meta) {
  // chữ nền khổng lồ VIỀN RỖNG ở nửa trên bên phải (vùng trắng chủ đích của bìa tạp chí): số hiệu bản án tự lấy từ phụ đề / meta.short
  // ("Bản án 142/2019/DS-PT" → "142"); d.mark chọn tay, d.mark = "" tắt. Là hình SVG trang trí — không đo chữ, nằm dưới mọi lớp.
  const auto = (String(d.subtitle || "") + " " + String(meta.short || "")).match(/(\d{1,4})\/(\d{4})/), mk = d.mark != null ? String(d.mark) : auto ? auto[1] : "";
  if (mk) { const fz = mk.length <= 3 ? 620 : mk.length === 4 ? 480 : 380;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 620"><text x="1090" y="560" text-anchor="end" font-family="${TH.numFont}" font-size="${fz}" ${TH.numItalic ? 'font-style="italic"' : ""} font-weight="${TH.titleBold ? 700 : 400}" fill="none" stroke="#${c.acc}" stroke-width="5" stroke-opacity=".28">${mk.replace(/[<&>]/g, "")}</text></svg>`; // nhạt: chữ tiêu đề chồng lên vẫn đọc rõ
    s.addImage({ data: await png(svg, 1800), x: W - 7.4, y: -0.55, w: 7.4, h: 4.17, altText: "Chữ nền " + mk, _deco: true }); }
  if (meta.logo && fs.existsSync(meta.logo)) s.addImage({ path: meta.logo, x: M, y: 0.55, w: 1.59, h: 0.42, sizing: { type: "contain", w: 1.59, h: 0.42 } });
  const tw = 10.6, runs = rich(d.title, c.text, c.acc).map(r => (r.options.fontFace === TH.titleFont ? { text: r.text, options: Object.assign({}, r.options, { bold: true }) } : r));
  let fs_ = 60, th = 2.5; for (fs_ of [64, 58, 52, 46, 40]) { const m = measure(noOrphan(runs), { fontFace: TH.titleFont, fontSize: fs_ }, tw); th = m.ok ? m.height * 1.04 + 0.1 : 2.5; if (!m.ok || m.lines <= 3) break; } // dự phòng 4%: chữ đậm cỡ lớn (theme son) đo lệch nhẹ so với bản dựng
  const sh = d.subtitle ? realH(d.subtitle, { fontFace: TH.bodyFont, fontSize: 20 }, 9.0, 0.7) : 0;
  const blk = 0.42 + th + (sh ? 0.3 + sh : 0), y = Math.max(1.1, (d.author ? 5.55 : 6.4) - blk); // khối chữ dựa xuống đường kẻ đáy — khoảng trắng phía trên là chủ đích (bìa tạp chí)
  s.addShape(pres.shapes.RECTANGLE, { x: M, y, w: 1.1, h: 0.09, fill: { color: c.acc }, line: { type: "none" } });
  if (d.kicker) T(s, String(d.kicker).toUpperCase(), { _label: "kicker", x: M + 1.3, y: y - 0.12, w: 8, h: 0.34, fontSize: 13, bold: true, color: c.acc, charSpacing: 2, valign: "middle" });
  T(s, runs, { _label: "title", x: M, y: y + 0.42, w: tw, h: th, fontSize: fs_ });
  if (d.subtitle) T(s, d.subtitle, { _label: "subtitle", x: M, y: y + 0.42 + th + 0.3, w: 9.0, h: sh + 0.05, fontSize: 20, color: c.muted });
  if (d.author) { s.addShape(pres.shapes.LINE, { x: M, y: 6.0, w: W - 2 * M, h: 0, line: { color: c.line, width: 1 } }); authorLine(s, d, M, 6.15, 8.5, c); }
  if (d.art && d.art !== "none") s.addImage({ altText: "Hình minh hoạ", data: await art(d.art, c.acc, c.bad, c.bg, 900), x: W - M - 1.5, y: 6.08, w: 1.5, h: 1.2 * (d.art === "justice" ? 0.87 : 0.8) });
}
// bìa "band": dải ảnh thật phía trên (~46% chiều cao) + khối chữ trên nền trắng — ảnh làm bối cảnh, chữ vẫn đọc trên nền sạch
async function coverBand(s, c, d, meta) {
  // dải ảnh trên đầu + THẺ CHỮ ĐÈ MÉP DẢI ẢNH (nửa trên ảnh, nửa trên nền trắng) + mảng màu lấy từ ảnh lệch sau thẻ
  const bh = 4.15, info = await analyzePhoto(d.photo, W, bh), acc = photoAccent(c, info);
  s.addImage({ _bg: TH.d.bg, data: await photo(d.photo, W, bh, null, null, "none", 0, d.photoStyle || "natural"), x: 0, y: 0, w: W, h: bh, altText: d.photoAlt || "Ảnh bìa" });
  if (meta.logo && fs.existsSync(meta.logo)) { box(s, M, 0.45, 1.85, 0.6, "FFFFFF"); s.addImage({ path: meta.logo, x: M + 0.12, y: 0.54, w: 1.59, h: 0.42, sizing: { type: "contain", w: 1.59, h: 0.42 } }); }
  const cw = 8.7, tw = cw - 0.9, runs = rich(d.title, c.text, acc).map(r => (r.options.fontFace === TH.titleFont ? { text: r.text, options: Object.assign({}, r.options, { bold: true }) } : r));
  let fs_ = 40, th = 1.2; for (fs_ of [42, 38, 34, 30]) { const m = measure(noOrphan(runs), { fontFace: TH.titleFont, fontSize: fs_ }, tw); th = m.ok ? m.height + 0.08 : 1.3; if (!m.ok || m.lines <= 2) break; }
  const sh = d.subtitle ? realH(d.subtitle, { fontFace: TH.bodyFont, fontSize: 16 }, tw, 0.5) : 0, chh = 0.4 + (d.kicker ? 0.45 : 0) + th + (sh ? 0.15 + sh : 0) + 0.4;
  const cy = Math.min(bh - 1.1, H - 0.75 - chh), cx = M;
  s.addShape(TH.radius ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, Object.assign({ x: cx + 0.22, y: cy + 0.22, w: cw, h: chh, fill: { color: info.accent || c.acc }, line: { type: "none" } }, TH.radius ? { rectRadius: TH.radius } : {}));
  box(s, cx, cy, cw, chh, "FFFFFF");
  let y = cy + 0.4;
  if (d.kicker) { kicker(s, d.kicker, cx + 0.45, y, acc); y += 0.45; }
  T(s, runs, { _label: "title", x: cx + 0.45, y, w: tw, h: th, fontSize: fs_ }); y += th + 0.15;
  if (d.subtitle) T(s, d.subtitle, { _label: "subtitle", x: cx + 0.45, y, w: tw, h: sh + 0.05, fontSize: 16, color: c.muted });
  if (d.author) authorLine(s, d, cx + cw + 0.6, Math.max(bh + 0.35, cy + chh - 0.75), W - M - (cx + cw + 0.6), c);
  await photoCredit(s, d.photo, d, null, W - M - 6, bh - 0.4, 6);
}

// ---------- section: chuyển chương — số chương lớn + tên chương + "bản đồ chương" (mọi chương, chương đang tới tô nổi) ----------
// Người nghe biết đang ở đâu trong bài và còn bao nhiêu phần. Có ảnh (photo) → ảnh đứng nửa phải, bản đồ chương thành hàng chấm dưới tên.
// Mở chương (≥ 2 chương, không ảnh): 3 kiểu XOAY VÒNG theo số chương để các slide mở chương không giống hệt nhau,
// nhưng cùng một ngữ pháp: số chương rất lớn · câu hỏi của chương · "Trong chương này" (2–4 tiêu đề slide tự gom) · dải tiến độ chương.
//   giant — nền sáng, số chương khổng lồ VIỀN RỖNG tràn mép phải (hình SVG, không đo chữ)
//   block — khối màu nhấn chiếm 40% trái chứa số chương; chữ bên phải
//   dark  — nền tối gradient có hạt (PNG), số chương màu nhấn
// d.style chọn tay; mặc định chương 1 → giant, 2 → block, 3 → dark, 4 → giant …
async function sectionStyled(s, c, d, parts, cur, numTxt) {
  const sty = d.style || ["giant", "block", "dark"][(cur - 1) % 3], dk = TH.d, tot = String(parts.length).padStart(2, "0");
  CUR.noMotif = true;
  const P = sty === "dark" ? dk : c, inside = (Array.isArray(d.inside) ? d.inside : d._inside || []).slice(0, 4);
  let x0 = M, tw = 7.2;
  // giant / dark (11/2026, nhận xét người dùng "nửa phải trống, đơn điệu"): HAI CỘT — trái: nhãn · tên chương · phụ đề · dải tiến độ;
  // phải: số chương + "Trong phần này" thành THẺ đánh số (mỗi ý một thẻ, cao vừa chữ, cách đều) — lấp nửa phải bằng nội dung thật, không trang trí.
  if (sty !== "block") {
    const rx = 7.15, rw = W - M - rx, cardOn = sty === "dark" ? { fill: dk.card, line: dk.line, text: dk.text, num: dk.acc, numFg: dk.bg } : { fill: "FFFFFF", line: c.line, text: c.text, num: c.acc, numFg: c.onAcc };
    if (sty === "dark") { const k = `grain:${dk.deep}:${dk.card}`; if (!ASSETS[k]) ASSETS[k] = await png(CA.grainBg(dk.deep, dk.card, 1600, 900, 0.08), 1600);
      s.addImage({ _bg: dk.bg, data: ASSETS[k], x: 0, y: 0, w: W, h: H, altText: "Nền chuyển màu" }); }
    // số chương: góc trên cột phải — giant viền rỗng (SVG), dark chữ màu nhấn
    // cụm phải (số + nhãn + thẻ) căn giữa dọc theo chiều cao THẬT của các thẻ — chương ít ý không để trống nửa dưới
    const nh = inside.length ? 2.05 : 3.6, fo0 = { fontFace: TH.bodyFont, fontSize: 18 }, txw0 = rw - 0.42 - 0.55;
    const hs0 = inside.map(t => Math.max(0.42 + 0.24, realH(t, fo0, txw0, 0.35) + 0.4)), grp = nh + (inside.length ? 0.35 + 0.48 + hs0.reduce((a, b) => a + b, 0) + 0.16 * (hs0.length - 1) : 0);
    const ny = Math.max(0.45, (H - 0.3 - grp) / 2);
    if (sty === "giant") { const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520"><text x="790" y="470" text-anchor="end" font-family="${TH.numFont}" font-size="560" ${TH.numItalic ? 'font-style="italic"' : ""} font-weight="${TH.titleBold ? 700 : 400}" fill="none" stroke="#${c.acc}" stroke-width="6" stroke-opacity=".6">${numTxt}</text></svg>`;
      s.addImage({ data: await png(svg, 1200), x: W - M - nh * 800 / 520, y: ny, w: nh * 800 / 520, h: nh, altText: "Số chương " + numTxt, _deco: true }); }
    else T(s, numTxt, { _label: "num", x: rx, y: ny - 0.2, w: rw, h: nh + 0.2, fontSize: inside.length ? 120 : 200, fontFace: TH.numFont, italic: TH.numItalic, bold: TH.titleBold, color: dk.acc, align: "right", valign: "bottom" });
    // cột trái
    const tw2 = rx - M - 0.5, tr = rich(d.title, P.text, P.acc).map(r => (r.options.fontFace === TH.titleFont ? { text: r.text, options: Object.assign({}, r.options, { bold: true }) } : r));
    const th = realH(tr, { fontFace: TH.titleFont, fontSize: 44 }, tw2, 1.3) + 0.05, sh = d.sub ? realH(d.sub, { fontFace: TH.bodyFont, fontSize: 21 }, tw2, 0.6) + 0.05 : 0;
    const blk = 0.45 + th + (sh ? 0.25 + sh : 0); let y = Math.max(0.9, (H - 1.0 - blk) / 2);
    kicker(s, `${PART_WORD} ${numTxt} / ${tot}`, M, y, P.acc); y += 0.45;
    T(s, tr, { _label: "title", x: M, y, w: tw2, h: th, fontSize: 44 }); y += th;
    if (d.sub) { y += 0.25; T(s, rich(d.sub, P.muted, P.text), { _label: "sub", x: M, y, w: tw2, h: sh, fontSize: 21, color: P.muted }); }
    // cột phải: thẻ "Trong phần này"
    if (inside.length) {
      const fo = { fontFace: TH.bodyFont, fontSize: 18 }, pad = 0.2, nd = 0.42, txw = rw - nd - 0.55;
      const hs = inside.map(t => Math.max(nd + 2 * 0.12, realH(t, fo, txw, 0.35) + 2 * pad)), g = 0.16;
      let cy = ny + nh + 0.35; T(s, `TRONG ${PART_WORD.toUpperCase()} NÀY`, { _label: "trong chương này", x: rx, y: cy, w: rw, h: 0.34, fontSize: 14, bold: true, color: P.acc, charSpacing: 1.5 }); cy += 0.48;
      const room = H - 0.45 - cy; while (inside.length > 2 && hs.reduce((a, b) => a + b, 0) + g * (hs.length - 1) > room) { inside.pop(); hs.pop(); }
      for (const [i, t] of inside.entries()) { box(s, rx, cy, rw, hs[i], cardOn.fill, cardOn.line);
        if (FORM() && sty !== "dark") worldTile(s, c, rx + 0.18, cy + (hs[i] - nd) / 2, nd, nd, i === 0, String(i + 1)); else
        num(s, String(i + 1), rx + 0.18, cy + (hs[i] - nd) / 2, nd, cardOn.num, cardOn.numFg, 14);
        T(s, t, { _label: `trong chương ${i + 1}`, x: rx + nd + 0.36, y: cy + pad, w: txw, h: hs[i] - 2 * pad, fontSize: 18, color: cardOn.text, valign: "middle" }); cy += hs[i] + g; } }
    // dải tiến độ chương ở đáy cột trái
    const bw = tw2, gap = 0.1, sw = (bw - gap * (parts.length - 1)) / parts.length;
    if (FORM() && sty !== "dark") worldLink(s, c, M, H - 1.08, M + bw); // dải chương = đường nối của world (ray, dây niêm phong, kích thước…) + mốc mỗi chương
    parts.forEach((p, i) => { const on = p === cur;
      if (FORM() && sty !== "dark") worldMarker(s, c, M + i * (sw + gap) + 0.16, H - 1.08, on, true); else
      s.addShape(pres.shapes.RECTANGLE, { x: M + i * (sw + gap), y: H - 0.95, w: sw, h: on ? 0.1 : 0.06, fill: { color: P.acc, transparency: p <= cur ? 0 : 70 }, line: { type: "none" } });
      T(s, PARTS[p] || "", { _label: `chương ${p}`, x: M + i * (sw + gap), y: H - 0.84, w: sw, h: 0.62, fontSize: 15, bold: on, color: on ? P.text : P.muted }); });
    return;
  }
  // block — khối màu nhấn chiếm 40% trái chứa số chương; chữ bên phải
  {
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 4.7, h: H, fill: { color: c.acc }, line: { type: "none" } });
    T(s, numTxt, { _label: "num", x: M, y: 0.55, w: 3.8, h: 3.4, fontSize: 170, fontFace: TH.numFont, italic: TH.numItalic, bold: TH.titleBold, color: c.onAcc, valign: "middle" });
    T(s, "/ " + tot, { _label: "tổng số chương", x: M + 0.05, y: 3.85, w: 3.5, h: 0.6, fontSize: 24, fontFace: TH.numFont, italic: TH.numItalic, color: c.onAcc });
    let py = 4.65; for (const p of parts) { const on = p === cur, t = `${p}  ${PARTS[p] || ""}`, hh = realH(t, { fontFace: TH.bodyFont, fontSize: 17, bold: on }, 4.7 - 2 * M, 0.35) + 0.06;
      T(s, t, { _label: `chương ${p}`, x: M, y: py, w: 4.7 - 2 * M, h: hh, fontSize: 17, bold: on, color: c.onAcc, transparency: on ? 0 : 30 }); py += hh + 0.04; }
    x0 = 5.35; tw = W - M - x0;
  }
  // cột chữ: nhãn "Chương x / n" · câu hỏi · phụ đề · Trong chương này
  const tr = rich(d.title, P.text, P.acc).map(r => (r.options.fontFace === TH.titleFont ? { text: r.text, options: Object.assign({}, r.options, { bold: true }) } : r));
  const th = realH(tr, { fontFace: TH.titleFont, fontSize: 44 }, tw, 1.3) + 0.05, sh = d.sub ? realH(d.sub, { fontFace: TH.bodyFont, fontSize: 21 }, tw, 0.6) + 0.05 : 0; // cỡ chữ cho máy chiếu: tiêu đề 44, phụ đề 21, mục 19
  const ih = inside.map(t => realH(t, { fontFace: TH.bodyFont, fontSize: 19 }, tw - 0.45, 0.35) + 0.12);
  // khối chữ phải dừng TRÊN dải tiến độ chương ở đáy (giant/dark: dải bắt đầu ở H - 0.95) — trước đây dark chỉ chừa 0.5 in nên
  // "Trong chương này" đè lên tên chương. Không đủ chỗ → bớt mục "Trong chương này" từ cuối, rồi mới đẩy khối lên.
  const lim = sty === "block" ? H - 0.5 : H - 1.15, blkOf = () => 0.45 + th + (sh ? 0.2 + sh : 0) + (inside.length ? 0.55 + 0.45 + ih.reduce((a, b) => a + b, 0) : 0);
  while (inside.length > 2 && blkOf() > lim - 0.9) { inside.pop(); ih.pop(); }
  const blk = blkOf();
  let y = sty === "dark" ? Math.max(3.0, (H - blk) / 2 + 0.6) : Math.max(0.9, (H - blk) / 2);
  if (y + blk > lim) y = Math.max(0.9, lim - blk);
  kicker(s, `${PART_WORD} ${numTxt} / ${tot}`, x0, y, P.acc); y += 0.45;
  T(s, tr, { _label: "title", x: x0, y, w: tw, h: th, fontSize: 44 }); y += th;
  if (d.sub) { y += 0.2; T(s, rich(d.sub, P.muted, P.text), { _label: "sub", x: x0, y, w: tw, h: sh, fontSize: 21, color: P.muted }); y += sh; }
  if (inside.length) { y += 0.55; s.addShape(pres.shapes.LINE, { x: x0, y: y - 0.12, w: Math.min(tw, 6.2), h: 0, line: { color: P.line, width: 1 } });
    T(s, `TRONG ${PART_WORD.toUpperCase()} NÀY`, { _label: "trong chương này", x: x0, y, w: tw, h: 0.34, fontSize: 14, bold: true, color: P.acc, charSpacing: 1.5 }); y += 0.45;
    for (const [i, t] of inside.entries()) { s.addShape(pres.shapes.OVAL, { x: x0 + 0.04, y: y + 0.13, w: 0.14, h: 0.14, fill: { color: P.acc }, line: { type: "none" } });
      T(s, t, { _label: `trong chương ${i + 1}`, x: x0 + 0.38, y, w: tw - 0.45, h: ih[i] - 0.08, fontSize: 19, color: P.text }); y += ih[i]; } }
  // dải tiến độ chương ở đáy: chương đã qua đậm, chương hiện tại dài hơn
  const bx = sty === "block" ? M : x0, bw = (sty === "block" ? 4.7 - 2 * M : Math.min(tw, 6.2)), gap = 0.1, sw = (bw - gap * (parts.length - 1)) / parts.length;
  if (sty !== "block") parts.forEach((p, i) => { const on = p === cur;
    s.addShape(pres.shapes.RECTANGLE, { x: bx + i * (sw + gap), y: H - 0.95, w: sw, h: on ? 0.1 : 0.06, fill: { color: P.acc, transparency: p <= cur ? 0 : 70 }, line: { type: "none" } });
    T(s, PARTS[p] || "", { _label: `chương ${p}`, x: bx + i * (sw + gap), y: H - 0.84, w: sw, h: 0.62, fontSize: 15, bold: on, color: on ? P.text : P.muted }); });
}
async function sectionLight(s, c, d) {
  const parts = Object.keys(PARTS).map(Number).sort((a, b) => a - b), cur = +d.num, many = parts.length >= 2 && parts.includes(cur);
  const numTxt = String(d.num || "").padStart(2, "0");
  if (d.photo && d.photoLayout === "backdrop") return sectionBackdrop(s, c, d, parts, cur, numTxt); // nền ảnh mờ + lớp màu
  if (framed(d)) return framedSection(s, c, d, parts, cur, numTxt); // có khung: bố cục riêng, không thẻ đè khung
  if (d.photo) { // ảnh chiếm 60% bên phải (phía theo ảnh), THẺ TRẮNG đè mép ảnh chứa số chương rất lớn màu của ảnh
    const info = await analyzePhoto(d.photo, W * 0.6, H), rt = sideOf(d, info, "left") !== "right"; // chữ trái → ảnh phải
    const pw = W * 0.6, px = rt ? W - pw : 0, acc = photoAccent(c, info);
    s.addImage({ _bg: TH.d.bg, data: await photo(d.photo, pw, H, null, null, "none", 0, d.photoStyle || "natural"), x: px, y: 0, w: pw, h: H, altText: d.photoAlt || "Ảnh mở đầu chương" });
    await photoCredit(s, d.photo, d, null, rt ? W - M - 5 : px + 0.3, H - 0.36, 5);
    const cw = 6.4, cx = rt ? Math.max(M, px - cw + 1.3) : Math.min(W - M - cw, px + pw - 1.3) /* thẻ không lấn qua lề 0.6 in */, tr = rich(d.title, c.text, acc).map(r => (r.options.fontFace === TH.titleFont ? { text: r.text, options: Object.assign({}, r.options, { bold: true }) } : r));
    const th = realH(tr, { fontFace: TH.titleFont, fontSize: 38 }, cw - 0.9, 1.2), sh = d.sub ? realH(d.sub, { fontFace: TH.bodyFont, fontSize: 17 }, cw - 0.9, 0.6) : 0;
    const chh = 0.35 + 1.6 + th + (sh ? 0.2 + sh : 0) + (many ? 0.75 : 0) + 0.4, cy = (H - chh) / 2;
    box(s, cx, cy, cw, chh, "FFFFFF");
    let y = cy + 0.35;
    if (d.num) { T(s, numTxt, { _label: "num", x: cx + 0.4, y: y - 0.2, w: 3.4, h: 1.8, fontSize: 110, fontFace: TH.numFont, italic: TH.numItalic, bold: TH.titleBold, color: acc, valign: "bottom" });
      if (many) { const nw = textW(numTxt, { fontFace: TH.numFont, fontSize: 110, italic: TH.numItalic, bold: TH.titleBold }) || 2.2; T(s, `/ ${String(parts.length).padStart(2, "0")}`, { _label: "tổng số chương", x: cx + 0.4 + nw + 0.12, y: y + 1.05, w: 1.2, h: 0.5, fontSize: 22, fontFace: TH.numFont, italic: TH.numItalic, color: c.muted }); } }
    y += 1.6;
    T(s, tr, { _label: "title", x: cx + 0.45, y, w: cw - 0.9, h: th + 0.05, fontSize: 38 }); y += th;
    if (d.sub) { y += 0.2; T(s, d.sub, { _label: "sub", x: cx + 0.45, y, w: cw - 0.9, h: sh + 0.05, fontSize: 17, color: c.muted }); y += sh; }
    if (many) { y += 0.35; let x = cx + 0.45; for (const p of parts) { const on = p === cur; num(s, p, x, y, 0.4, on ? acc : c.deep, on ? "FFFFFF" : c.muted, 13); x += 0.54; } }
    return;
  }
  if (many) return sectionStyled(s, c, d, parts, cur, numTxt);
  if (!many) { s.addImage({ altText: "Hoa văn giấy chứng nhận", data: await art("guilloche", c.acc, null, null, 1400), x: 8.05, y: 1.05, w: 4.6, h: 4.6, transparency: 30 });
    await artOrCut(s, d, () => art(d.art || DEF_ART.hero, c.acc, c.bad, c.bg, 1400), 8.75, 1.85, 3.2, 2.77); }
  const lw = many ? 6.4 : 7.2, tr = rich(d.title, c.text, c.acc).map(r => (r.options.fontFace === TH.titleFont ? { text: r.text, options: Object.assign({}, r.options, { bold: true }) } : r));
  const th = realH(tr, { fontFace: TH.titleFont, fontSize: 44 }, lw, 1.4), sh = d.sub ? realH(d.sub, { fontFace: TH.bodyFont, fontSize: 18 }, lw - 0.2, 0.7) : 0;
  const blk = 1.9 + 0.2 + th + (sh ? 0.25 + sh : 0); let y = Math.max(0.6, (H - blk) / 2);
  if (d.num) { // số chương rất lớn, nét mảnh màu nhấn — điểm nhấn chính của slide
    T(s, numTxt, { _label: "num", x: M - 0.08, y: y - 0.35, w: 4.0, h: 2.25, fontSize: 140, fontFace: TH.numFont, italic: TH.numItalic, bold: TH.titleBold, color: c.acc, valign: "bottom" });
    if (many) { const nw = textW(numTxt, { fontFace: TH.numFont, fontSize: 140, italic: TH.numItalic, bold: TH.titleBold }) || 2.8; T(s, `/ ${String(parts.length).padStart(2, "0")}`, { _label: "tổng số chương", x: M + nw + 0.1, y: y + 1.3, w: 1.3, h: 0.55, fontSize: 24, fontFace: TH.numFont, italic: TH.numItalic, color: c.muted }); } }
  y += 1.9 + 0.2;
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: y - 0.12, w: 0.9, h: 0.07, fill: { color: c.acc }, line: { type: "none" } });
  T(s, tr, { _label: "title", x: M, y: y + 0.08, w: lw, h: th + 0.05, fontSize: 44 }); y += th + 0.08;
  if (d.sub) { y += 0.25; T(s, d.sub, { _label: "sub", x: M, y, w: lw - 0.2, h: sh + 0.05, fontSize: 18, color: c.muted }); }
  if (many) { // bản đồ chương bên phải: chương hiện tại là thẻ đặc, chương đã qua mờ
    const x0 = 7.75, w0 = W - M - x0, n = parts.length, rh = Math.min(0.8, 5.2 / n), gap = 0.12, top = (H - (rh * n + gap * (n - 1))) / 2;
    s.addShape(pres.shapes.LINE, { x: x0 + 0.33, y: top + rh / 2, w: 0, h: (n - 1) * (rh + gap), line: { color: c.line, width: 1.5 } });
    for (const [i, p] of parts.entries()) { const yy = top + i * (rh + gap), on = p === cur, past = p < cur;
      if (on) box(s, x0 - 0.12, yy, w0 + 0.12, rh, c.acc);
      if (FORM() && !on) worldTile(s, c, x0 + 0.1, yy + (rh - 0.46) / 2, 0.46, 0.46, false, String(p)); else
      num(s, p, x0 + 0.1, yy + (rh - 0.46) / 2, 0.46, on ? c.onAcc : past ? c.deep : c.bg, on ? c.acc : c.muted, 14);
      T(s, PARTS[p] || "", { _label: `chương ${p}`, x: x0 + 0.75, y: yy, w: w0 - 0.9, h: rh, fontSize: on ? 17 : 15, bold: on, color: on ? c.onAcc : past ? c.muted : c.text, valign: "middle" }); } }
}

// ---------- end: Cảm ơn / Hỏi đáp — slide cuối cùng (sau closing) ----------
// Slide cuối kiểu "bookend" (mặc định khi không ảnh, không art/cutout, không style "classic"): dải giấy cắt lớp ở đáy — cùng ngôn ngữ
// với bìa "paper" để mở và kết khớp nhau; "ĐIỀU CẦN NHỚ" = tiêu đề slide closing (tự lấy; d.message ghi tay); lời cảm ơn; nhóm có
// vòng tròn chữ cái đầu cỡ lớn ở cột phải. Mọi chữ nằm phía trên dải giấy (không đè lên hình).
async function endBookend(s, c, d, meta) {
  CUR.noMotif = true;
  const mx = (t) => mix(c.acc, "FFFFFF", t), tones = [mx(0.9), mx(0.75), mx(0.55), mx(0.3), c.acc, TH.d.bg], k = `paperEnd:${meta.title || d.title}:${tones.join("")}`;
  if (!ASSETS[k]) ASSETS[k] = await png(CA.paperLayers(String(meta.title || d.title) + "·end", tones, 1600, 900, 0.66), 2000);
  s.addImage({ _bg: c.bg, data: ASSETS[k], x: 0, y: 0, w: W, h: H, altText: "Hình nền: các lớp giấy cắt chồng nhau" });
  const team = (d.team || []).slice(0, 6), hasR = team.length || d.contact, tw = hasR ? 7.0 : W - 2 * M, lim = 4.55; let y = 0.75;
  if (meta.logo && fs.existsSync(meta.logo)) { s.addImage({ path: meta.logo, x: M, y: 0.55, w: 1.59, h: 0.42, sizing: { type: "contain", w: 1.59, h: 0.42 } }); y = 1.2; }
  const msg = d.message != null ? d.message : d._message;
  if (msg) { cap(s, "Điều cần nhớ", M, y, tw, c.acc); y += 0.4;
    const mr = rich(msg, c.text, c.acc), mh = realH(mr, { fontFace: TH.titleFont, fontSize: 24 }, tw, 0.8) + 0.06;
    s.addShape(pres.shapes.RECTANGLE, { x: M, y: y + 0.05, w: 0.07, h: mh - 0.1, fill: { color: c.acc }, line: { type: "none" } });
    T(s, mr, { _label: "message", x: M + 0.25, y, w: tw - 0.25, h: mh, fontSize: 24, fontFace: TH.titleFont }); y += mh + 0.45; }
  const tr = rich(d.title, c.text, c.acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { fontFace: TH.accentFont, italic: TH.accentItalic, bold: TH.accentBold }) }));
  let efs = 48, th = 0.9; for (efs of [48, 42, 36, 32]) { const m = measure(noOrphan(tr), { fontFace: TH.accentFont, fontSize: efs }, tw); th = m.ok ? m.height + 0.05 : 0.9; if (!m.ok || y + th + (d.sub ? 0.55 : 0) <= lim) break; }
  T(s, tr, { _label: "title", x: M, y, w: tw, h: th, fontSize: efs }); y += th;
  if (d.sub) T(s, rich(d.sub, c.muted, c.text), { _label: "sub", x: M, y: y + 0.12, w: tw, h: 0.45, fontSize: 19, color: c.muted });
  if (hasR) { const rx = M + tw + 0.6, rw = W - M - rx, n = team.length, rh = n ? Math.min(0.95, (lim - 1.5 - (d.contact ? 0.7 : 0)) / n) : 0;
    let ry = 1.0; if (n) { cap(s, d.teamTitle || ((d.team || []).length === 1 ? "Trình bày" : "Nhóm thực hiện"), rx, ry, rw, c.acc); ry += 0.45; }
    for (const [i, m] of team.entries()) { const words = String(m.name || "").trim().split(/\s+/), ini = (words[words.length - 1] || "?")[0].toUpperCase(), dd = Math.min(0.62, rh - 0.12);
      addT(s, ini, { _label: `team[${i}] chữ đầu`, shape: pres.shapes.OVAL, x: rx, y: ry + (rh - dd) / 2, w: dd, h: dd, fill: { color: c.acc }, line: { type: "none" }, color: c.onAcc, fontFace: TH.numFont, italic: TH.numItalic, bold: true, fontSize: Math.round(dd * 34), align: "center", valign: "middle", margin: 0 });
      T(s, [{ text: m.name, options: { bold: true, color: c.text, fontSize: 16, breakLine: !!m.role } }, ...(m.role ? [{ text: m.role, options: { color: c.muted, fontSize: 13 } }] : [])], { _label: `team[${i}]`, x: rx + dd + 0.22, y: ry, w: rw - dd - 0.22, h: rh, valign: "middle" });
      ry += rh; }
    if (d.contact) { ry += 0.15; await circIcon(s, "PiEnvelopeSimpleDuotone", rx, ry + 0.02, 0.38, c.acc, c.onAcc); T(s, d.contact, { _label: "contact", x: rx + 0.55, y: ry, w: rw - 0.55, h: 0.42, fontSize: 14, color: c.text, valign: "middle" }); } }
}
L.end = async (s, c, d, meta) => {
  if (await styled("end", s, c, d, meta)) return;
  if (d.style === "poster" && d.photo) return endPoster(s, c, d, meta);
  if (c === TH.l && !d.photo && !d.cutout && !d.art && d.style !== "classic" && !FORM()) return endBookend(s, c, d, meta); // world: kết bằng VẬT của world (hình lớn) thay lớp giấy cắt chung
  if (framed(d)) return framedEnd(s, c, d, meta); // có khung: chữ đặt thẳng trên nền, khung không bị thẻ che
  const team = (d.team || []).slice(0, 6), cols = team.length > 3 ? 2 : 1, rows = Math.ceil(team.length / cols);
  let acc = c.acc, tx = M, tw = 7.4, card = null;
  if (d.photo) { // ảnh 58% bên phải + thẻ trắng đè mép ảnh (cùng ngôn ngữ với bìa band / chuyển chương)
    const pw = W * 0.58, px = W - pw, info = await analyzePhoto(d.photo, pw, H); acc = photoAccent(c, info);
    s.addImage({ _bg: TH.d.bg, data: await photo(d.photo, pw, H, null, null, "none", 0, d.photoStyle || "natural"), x: px, y: 0, w: pw, h: H, altText: d.photoAlt || "Ảnh kết thúc" });
    await photoCredit(s, d.photo, d, null, W - M - 5, H - 0.36, 5);
    card = { x: M, w: px - M + 1.2 }; tx = M + 0.45; tw = card.w - 0.9;
  } else await artOrCut(s, d, () => art(d.art || (FORM() ? DEF_ART.hero : rotArt()), c.acc, c.bad, c.bg, 1200), 8.6, 1.6, 4.1, 3.69); // world: kết bằng đúng vật của world
  if (meta.logo && fs.existsSync(meta.logo) && !card) s.addImage({ path: meta.logo, x: M, y: 0.55, w: 1.59, h: 0.42, sizing: { type: "contain", w: 1.59, h: 0.42 } });
  const tr = rich(d.title, c.text, acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { fontFace: TH.accentFont, italic: TH.accentItalic, bold: TH.accentBold }) }));
  let efs = 54, th = 1.0; for (efs of [54, 48, 42, 38]) { const m = measure(noOrphan(tr), { fontFace: TH.accentFont, fontSize: efs }, tw); th = m.ok ? m.height : 1.0; if (!m.ok || m.lines <= 2) break; }
  const sh = d.sub ? realH(d.sub, { fontFace: TH.bodyFont, fontSize: 19 }, tw, 0.5) : 0, teamH = team.length ? 0.45 + rows * 0.62 : 0;
  const blk = (d.kicker ? 0.5 : 0) + th + (sh ? 0.3 + sh : 0) + (teamH ? 0.5 + teamH : 0) + (d.contact ? 0.62 : 0);
  let y = Math.max(0.7, Math.min((H - blk) / 2, H - 0.6 - blk));
  if (card) { box(s, card.x, y - 0.45, card.w, blk + 0.9, "FFFFFF"); }
  if (d.kicker) { kicker(s, d.kicker, tx, y, acc); y += 0.5; }
  T(s, tr, { _label: "title", x: tx, y, w: tw, h: th + 0.05, fontSize: efs }); y += th;
  if (d.sub) { y += 0.3; T(s, d.sub, { _label: "sub", x: tx, y, w: tw, h: sh + 0.05, fontSize: 19, color: c.muted }); y += sh; }
  if (team.length) { y += 0.5; cap(s, d.teamTitle || ((d.team || []).length === 1 ? "Trình bày" : "Nhóm thực hiện"), tx, y, tw, acc); y += 0.45; const cw = tw / cols;
    for (const [i, m] of team.entries()) { const x = tx + (i % cols) * cw, yy = y + Math.floor(i / cols) * 0.62;
      T(s, [{ text: m.name, options: { bold: true, color: c.text, fontSize: 16, breakLine: !!m.role } }, ...(m.role ? [{ text: m.role, options: { color: c.muted, fontSize: 13 } }] : [])], { _label: `team[${i}]`, x, y: yy, w: cw - 0.2, h: 0.58, valign: "middle" }); }
    y += rows * 0.62; }
  if (d.contact) { y += 0.2; await circIcon(s, "PiEnvelopeSimpleDuotone", tx, y + 0.02, 0.38, acc, c.onAcc); T(s, d.contact, { _label: "contact", x: tx + 0.55, y, w: tw - 0.55, h: 0.42, fontSize: 15, color: c.text, valign: "middle" }); }
};

// ---------- mosaic: 4–5 ảnh — một ảnh lớn bên trái (chủ đề chính) + lưới ảnh nhỏ (chi tiết) ----------
L.mosaic = async (s, c, d) => {
  kickerTitle(s, c, d);
  // ảnh chính có MẢNG MÀU (lấy từ ảnh) lệch phía sau + chú thích ảnh chính là thẻ trắng đè góc ảnh; ảnh phụ nhỏ hơn, chú thích dải tối
  const ps = (d.photos || []).slice(0, 5), y0 = BODY_Y + 0.05, hh = FOOT_Y - 0.4 - y0, g = 0.16, bw = 6.0, rx = M + bw + 0.35, rw = W - M - rx;
  const n = ps.length, small = n - 1, rows = small <= 2 ? small : 2, cols = small <= 2 ? 1 : 2;
  const info = ps[0] ? await analyzePhoto(ps[0].photo, bw, hh) : null;
  s.addShape(pres.shapes.RECTANGLE, { x: M + 0.2, y: y0 + 0.2, w: bw, h: hh, fill: { color: (info && info.accent) || c.acc }, line: { type: "none" } });
  const slots = [[M, y0, bw, hh]];
  for (let k = 0; k < small; k++) { const cw = (rw - g * (cols - 1)) / cols, ch = (hh - g * (rows - 1)) / rows, col = cols === 1 ? 0 : k % 2, row = cols === 1 ? k : Math.floor(k / 2);
    const span = cols === 2 && small === 3 && k === 2;
    slots.push([rx + col * (cw + g), y0 + row * (ch + g), span ? rw : cw, ch]); }
  for (const [i, p] of ps.entries()) { const [x, y, w, h] = slots[i];
    s.addImage({ _bg: TH.d.bg, data: await photo(p.photo, w, h, null, TH.d.deep, "none", 0, p.photoStyle || d.photoStyle || "natural"), x, y, w, h, altText: p.alt || p.caption || "Ảnh" });
    if (!p.caption) continue;
    if (i === 0) { const cw2 = Math.min(4.2, fitW(p.caption, { fontFace: TH.bodyFont, fontSize: 15, bold: true }, 0.5, 0.11, 4.2)), chh = realH(p.caption, { fontFace: TH.bodyFont, fontSize: 15, bold: true }, cw2 - 0.4, 0.4) + 0.3;
      box(s, x + w - cw2 + 0.35, y + h - chh + 0.25, cw2, chh, "FFFFFF");
      T(s, rich(p.caption, c.text, c.acc), { _label: `photos[${i}].caption`, x: x + w - cw2 + 0.55, y: y + h - chh + 0.4, w: cw2 - 0.4, h: chh - 0.3, fontSize: 15, bold: true, valign: "middle" }); }
    else { s.addShape(pres.shapes.RECTANGLE, { x, y: y + h - 0.44, w, h: 0.44, fill: { color: TH.d.deep, transparency: 22 }, line: { type: "none" } });
      T(s, rich(p.caption, "FFFFFF", TH.d.acc), { _label: `photos[${i}].caption`, x: x + 0.15, y: y + h - 0.42, w: w - 0.3, h: 0.4, fontSize: 13, color: "FFFFFF", valign: "middle" }); } }
  foot(s, c, d.note);
};

// ---------- photostats: ảnh thật nửa slide + 2–3 con số lớn — con số gắn với đối tượng thật (diện tích, số hộ, số tiền) ----------
L.photostats = async (s, c, d) => {
  // ảnh nửa slide (phía theo ảnh) + CON SỐ CHÍNH trong thẻ trắng đè mép ảnh, màu lấy từ ảnh; các số phụ xếp dưới tiêu đề
  const pw = W * 0.47, info = await analyzePhoto(d.photo, pw, H), left = d.side === "left";
  const px = left ? 0 : W - pw, tx = left ? pw + 0.6 : M, tw = W - pw - 0.6 - M, acc = photoAccent(c, info);
  CUR.photoSide = left ? "left" : "right";
  s.addImage({ _bg: TH.d.bg, data: await photo(d.photo, pw, H, null, null, "none", 0, d.photoStyle || "natural"), x: px, y: 0, w: pw, h: H, altText: d.photoAlt || "Ảnh minh hoạ" });
  await photoCredit(s, d.photo, d, null, left ? px + 0.3 : W - M - (pw - 0.6), H - 0.36, pw - 0.6);
  if (d.kicker) kicker(s, d.kicker, tx, KICK_Y, acc);
  const tr = rich(d.title, c.text, acc), th = realH(tr, { fontFace: TH.titleFont, fontSize: 32 }, tw, 1.0);
  T(s, tr, { _label: "title", x: tx, y: TITLE_Y, w: tw, h: th + 0.05, fontSize: 32 });
  const st = (d.stats || []).slice(0, 3), hero = st[0], rest = st.slice(1), top = TITLE_Y + th + 0.4;
  if (hero) { // thẻ số chính: đè mép ảnh 0.9 in
    const hw = 5.0, hx = left ? pw - 0.9 : W - pw - hw + 0.9, lh = realH(hero.label, { fontFace: TH.bodyFont, fontSize: 18, bold: true }, hw - 2.9, 0.4), dh = hero.desc ? realH(hero.desc, { fontFace: TH.bodyFont, fontSize: 14 }, hw - 2.9, 0.4) : 0, hh = Math.max(1.55, 0.5 + lh + (dh ? 0.06 + dh : 0) + 0.4);
    const hx2 = left ? Math.max(hx, pw - 0.9) : hx;
    box(s, hx2, top, hw, hh, "FFFFFF");
    s.addShape(pres.shapes.RECTANGLE, { x: hx2, y: top, w: 0.1, h: hh, fill: { color: acc }, line: { type: "none" } });
    T(s, hero.value, { _label: "stats[0].value", x: hx2 + 0.3, y: top + 0.1, w: 2.5, h: hh - 0.2, fontSize: 52, fontFace: TH.numFont, italic: TH.numItalic, bold: TH.titleBold, color: hero.tone === "bad" ? c.bad : acc, valign: "middle" });
    const by = top + (hh - lh - (dh ? 0.06 + dh : 0)) / 2;
    T(s, hero.label, { _label: "stats[0].label", x: hx2 + 2.75, y: by, w: hw - 2.9, h: lh + 0.04, fontSize: 18, bold: true, color: c.text });
    if (hero.desc) T(s, hero.desc, { _label: "stats[0].desc", x: hx2 + 2.75, y: by + lh + 0.06, w: hw - 2.9, h: dh + 0.04, fontSize: 14, color: c.muted });
    let y = top + hh + 0.35; const lim = d.note ? FOOT_Y - 0.15 : 6.9, rh = Math.min(1.15, (lim - y) / Math.max(1, rest.length));
    for (const [i, it] of rest.entries()) { const yy = y + i * rh;
      s.addShape(pres.shapes.LINE, { x: tx, y: yy, w: tw, h: 0, line: { color: c.line, width: 0.75 } });
      T(s, it.value, { _label: `stats[${i + 1}].value`, x: tx, y: yy + 0.08, w: 2.3, h: rh - 0.16, fontSize: 34, fontFace: TH.numFont, italic: TH.numItalic, bold: TH.titleBold, color: it.tone === "bad" ? c.bad : c.text, valign: "middle" });
      const lh2 = realH(it.label, { fontFace: TH.bodyFont, fontSize: 16, bold: true }, tw - 2.5, 0.36), dh2 = it.desc ? realH(it.desc, { fontFace: TH.bodyFont, fontSize: 14 }, tw - 2.5, 0.4) : 0, by2 = yy + (rh - lh2 - (dh2 ? 0.05 + dh2 : 0)) / 2;
      T(s, it.label, { _label: `stats[${i + 1}].label`, x: tx + 2.45, y: by2, w: tw - 2.5, h: lh2 + 0.04, fontSize: 16, bold: true, color: c.text });
      if (it.desc) T(s, it.desc, { _label: `stats[${i + 1}].desc`, x: tx + 2.45, y: by2 + lh2 + 0.05, w: tw - 2.5, h: dh2 + 0.04, fontSize: 14, color: c.muted }); } }
  if (d.note) T(s, rich(d.note, c.muted, c.text), { _label: "chú thích", x: tx, y: FOOT_Y, w: tw, h: FOOT_H, fontSize: 13 });
};

// ---------- photostrip: 3–5 ảnh nối theo dòng thời gian — mỗi ảnh một mốc (hiện trạng qua các năm, các bước thi công, các lần làm việc) ----------
L.photostrip = async (s, c, d) => {
  kickerTitle(s, c, d);
  // mốc đang bàn (focus) là ảnh MÀU, lớn hơn, viền màu nhấn; các mốc còn lại đen trắng — mắt đi thẳng vào mốc chính
  const it = (d.items || []).slice(0, 5), n = Math.max(1, it.length), g = 0.25, lim = d.note ? FOOT_Y - 0.15 : 6.9, f = Number.isInteger(d.focus) ? d.focus : -1;
  const grow = f >= 0 ? 0.9 : 0, cw0 = (W - 2 * M - g * (n - 1) - grow) / n, cws = it.map((_, i) => cw0 + (i === f ? grow : 0)), xs = cws.map((_, i) => M + cws.slice(0, i).reduce((a, b) => a + b, 0) + g * i);
  const hh = Math.max(...it.map((x, i) => realH(x.head || "", { fontFace: TH.bodyFont, fontSize: 17, bold: true }, cws[i] - 0.1, 0.36)));
  const th = Math.max(0, ...it.map((x, i) => x.text ? realH(x.text, { fontFace: TH.bodyFont, fontSize: 14 }, cws[i] - 0.1, 0.4) : 0));
  const ly = BODY_Y + 0.25, py = ly + 0.42, ph = Math.max(1.5, Math.min(cw0 * 0.75, lim - py - 0.35 - hh - (th ? 0.08 + th : 0)));
  const info = f >= 0 ? await analyzePhoto(it[f].photo, cws[f], ph + 0.3) : null, acc = photoAccent(c, info);
  s.addShape(pres.shapes.LINE, { x: M, y: ly, w: W - 2 * M, h: 0, line: { color: c.line, width: 2 } });
  for (const [i, p] of it.entries()) { const x = xs[i], cw = cws[i], on = i === f, y = on ? py - 0.15 : py, h = on ? ph + 0.3 : ph;
    s.addShape(pres.shapes.OVAL, { x: x + 0.02, y: ly - (on ? 0.12 : 0.08), w: on ? 0.24 : 0.16, h: on ? 0.24 : 0.16, fill: { color: on ? acc : c.bg }, line: { color: on ? acc : c.muted, width: 1.5 } });
    if (p.date) T(s, p.date, { _label: `items[${i}].date`, x: x + 0.34, y: ly - 0.2, w: cw - 0.4, h: 0.3, fontSize: 13, bold: true, color: on ? acc : c.muted, valign: "middle" });
    s.addImage({ _bg: TH.d.bg, data: await photo(p.photo, cw, h, null, null, "none", 0, p.photoStyle || (f >= 0 && !on ? "bw" : "natural")), x, y, w: cw, h, altText: p.alt || p.head || "Ảnh" });
    if (on) s.addShape(pres.shapes.RECTANGLE, { x: x - 0.04, y: y - 0.04, w: cw + 0.08, h: h + 0.08, fill: { type: "none" }, line: { color: acc, width: 5 } }); // viền mốc chính (nét, không phải mảng nền)
    T(s, rich(p.head || "", on ? acc : c.text, acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { fontFace: TH.bodyFont, bold: true }) })), { _label: `items[${i}].head`, x, y: py + ph + 0.3, w: cw - 0.1, h: hh + 0.04, fontSize: 17 });
    if (p.text) T(s, p.text, { _label: `items[${i}].text`, x, y: py + ph + 0.38 + hh, w: cw - 0.1, h: th + 0.04, fontSize: 14, color: c.muted }); }
  foot(s, c, d.note);
};

// ---------- quiz: câu hỏi trắc nghiệm trên lớp (bài giảng) ----------
// Người học cần THẤY đủ phương án để chọn. Hai slide liền nhau: slide hỏi (reveal: false) → slide đáp án (reveal: true, cùng câu hỏi):
// phương án đúng nền nhấn + dấu tích, phương án khác mờ đi; "why" = vì sao đúng (một câu, có căn cứ).
const QUIZ_KEYS = ["A", "B", "C", "D"];
L.quiz = async (s, c, d) => {
  kickerTitle(s, c, d);
  const op = (d.options || []).slice(0, 4), n = op.length, rows = n <= 2 ? 1 : 2, gap = 0.22, rev = d.reveal === true && Number.isInteger(d.answer);
  const why = rev && d.why ? d.why : null, wh = why ? Math.min(1.0, realH(why, { fontFace: TH.bodyFont, fontSize: 16 }, W - 2 * M - 1.5, 0.5) + 0.32) : 0;
  // chừa sẵn chỗ cho dòng "Vì sao" ở CẢ slide hỏi lẫn slide đáp án → các thẻ đứng yên khi chuyển slide (không nhảy vị trí)
  const WHY = 1.0, lim = (d.note ? FOOT_Y - 0.15 : 6.9) - WHY - 0.2, cw = (W - 2 * M - gap) / 2, tw = cw - 1.85; // chừa chỗ dấu ✓ của đáp án ở mép phải thẻ (mọi thẻ cùng bề rộng chữ → không nhảy dòng giữa slide hỏi và đáp án)
  const th = op.map(t => realH(t, { fontFace: TH.bodyFont, fontSize: 20, bold: true }, tw, 0.4)); // đo bản ĐẬM: đáp án đúng in đậm ở slide sau — cùng chiều cao ở cả hai slide
  // whyNot: vì sao phương án SAI — hiện dưới phương án ở slide đáp án; slide hỏi giữ cùng chiều cao thẻ (_whyNot do bước dựng chép sang) để thẻ đứng yên
  const wn = d.whyNot || d._whyNot || [], wh2 = op.map((_, i) => wn[i] ? realH(wn[i], { fontFace: TH.bodyFont, fontSize: 14 }, tw, 0.3) + 0.08 : 0);
  // stem: đề tình huống ngay dưới tiêu đề (cùng chiều cao ở slide hỏi và slide đáp án → thẻ đứng yên)
  const sh = d.stem ? realH(rich(d.stem, c.text, c.acc), { fontFace: TH.bodyFont, fontSize: 18 }, W - 2 * M, 0.4) + 0.2 : 0, top0 = BODY_Y + sh;
  if (d.stem) T(s, rich(d.stem, c.text, c.acc), { _label: "stem", x: M, y: BODY_Y - 0.05, w: W - 2 * M, h: sh - 0.15, fontSize: 18, color: c.text });
  const ch = Math.min((lim - top0 - 0.05 - gap * (rows - 1)) / rows, Math.max(1.3, ...th.map((h, i) => h + wh2[i] + 0.5)));
  const y0 = top0 + 0.05 + Math.max(0, (lim - top0 - 0.05 - rows * ch - gap * (rows - 1)) / 2);
  for (const [i, t] of op.entries()) {
    const x = M + (i % 2) * (cw + gap), y = y0 + Math.floor(i / 2) * (ch + gap), ok = rev && i === d.answer, dim = rev && !ok;
    box(s, x, y, cw, ch, ok ? mix(c.acc, c.bg, 0.88) : c.card, ok ? c.acc : c.line, `!!quiz-${i}`);
    addT(s, QUIZ_KEYS[i], { _label: `options[${i}] key`, shape: pres.shapes.OVAL, x: x + 0.3, y: y + ch / 2 - 0.3, w: 0.6, h: 0.6, fill: { color: ok ? c.acc : c.deep }, line: { color: dim ? c.line : c.acc, width: 1.5 },
      color: ok ? c.onAcc : dim ? c.muted : c.acc, fontFace: TH.numFont, italic: TH.numItalic, bold: true, fontSize: 18, align: "center", valign: "middle", margin: 0 });
    const ty = y + (ch - th[i] - wh2[i]) / 2 - 0.02;
    T(s, t, { _label: `options[${i}]`, x: x + 1.1, y: ty, w: tw, h: th[i] + 0.04, fontSize: 20, bold: ok, color: dim ? c.muted : c.text });
    if (rev && d.whyNot && d.whyNot[i] && i !== d.answer) T(s, d.whyNot[i], { _label: `whyNot[${i}]`, x: x + 1.1, y: ty + th[i] + 0.06, w: tw, h: wh2[i], fontSize: 14, italic: true, color: c.bad });
    if (ok) await circIcon(s, "FaCheck", x + cw - 0.75, y + ch / 2 - 0.25, 0.5, c.acc, c.onAcc);
  }
  if (why) { const wy = lim + 0.2 + (WHY - wh) / 2;
    box(s, M, wy, W - 2 * M, wh, c.deep);
    s.addShape(pres.shapes.RECTANGLE, { x: M, y: wy, w: 0.09, h: wh, fill: { color: c.acc }, line: { type: "none" } });
    T(s, "VÌ SAO", { _label: "why label", x: M + 0.3, y: wy + 0.18, w: 1.0, h: 0.3, fontSize: 12, bold: true, color: c.acc, charSpacing: 1 });
    T(s, why, { _label: "why", x: M + 1.3, y: wy + 0.15, w: W - 2 * M - 1.5, h: wh - 0.3, fontSize: 16, color: c.text }); }
  foot(s, c, d.note);
};

// ---------- timeline: mốc thời gian dạng chữ tự do ("~4.500 năm TCN", "Thế kỷ 14", "1347") ----------
// Dùng khi mốc không có ngày dd/mm/yyyy (lịch sử xa, giai đoạn) — scene/chart span cần ngày chính xác. Trục ngang, mốc focus tô đặc.
L.timeline = async (s, c, d) => {
  kickerTitle(s, c, d);
  const it = (d.items || []).slice(0, 6), n = Math.max(1, it.length), cw = (W - 2 * M) / n, tw = cw - 0.3, lim = d.note ? FOOT_Y - 0.15 : 6.9;
  const hs = n <= 4 ? 22 : 19, ts = n <= 4 ? 17 : 15;
  const hH = Math.max(...it.map(x => realH(x.head, { fontFace: TH.bodyFont, fontSize: hs, bold: true }, tw, 0.4)));
  const tH = Math.max(0, ...it.map(x => x.text ? realH(x.text, { fontFace: TH.bodyFont, fontSize: ts }, tw, 0.6) : 0));
  const blk = 0.42 + 0.35 + 0.45 + hH + (tH ? 0.1 + tH : 0), y0 = BODY_Y + 0.05 + Math.max(0, (lim - BODY_Y - 0.05 - blk) / 2), ay = y0 + 0.42 + 0.35;
  if (FORM()) worldLink(s, c, M, ay, W - M); else s.addShape(pres.shapes.LINE, { x: M, y: ay, w: W - 2 * M, h: 0, line: { color: c.line, width: 2.5, endArrowType: "triangle" } });
  for (const [i, x0] of it.entries()) { CUR.grp = i + 1;
    const cx = M + cw * (i + 0.5), on = d.focus === i, r = on ? 0.17 : 0.12;
    if (x0.when) chip(s, x0.when, cx, y0, c, { _label: `items[${i}].when`, center: true, max: cw - 0.15, fill: on ? c.acc : c.deep, line: on ? c.acc : c.line, color: on ? c.onAcc : c.text });
    s.addShape(pres.shapes.LINE, { x: cx, y: y0 + 0.36, w: 0, h: ay - y0 - 0.36 - r, line: { color: on ? c.acc : c.line, width: 1.25 } });
    if (FORM()) worldMarker(s, c, cx, ay, on); else s.addShape(pres.shapes.OVAL, { x: cx - r, y: ay - r, w: 2 * r, h: 2 * r, fill: { color: on ? c.acc : c.bg }, line: { color: c.acc, width: 2.5 } });
    const ty = ay + 0.45, fs = hs;
    T(s, rich(x0.head, on ? c.acc : c.text, c.acc).map(q => ({ text: q.text, options: Object.assign({}, q.options, { fontFace: TH.bodyFont, bold: true }) })), { _label: `items[${i}].head`, x: cx - tw / 2, y: ty, w: tw, h: hH + 0.04, fontSize: fs, align: "center" });
    if (x0.text) T(s, x0.text, { _label: `items[${i}].text`, x: cx - tw / 2, y: ty + hH + 0.1, w: tw, h: tH + 0.04, fontSize: ts, color: c.muted, align: "center" });
  }
  CUR.grp = 0;
  foot(s, c, d.note);
};


// ================= BỐ CỤC CHO BÀI GIẢNG CÓ TÍNH TOÁN (đợt 11/2026 — học từ deck BNK405 Chương 2) =================
// Môn nghiệp vụ (bảo hiểm, thuế, lao động) có ba kiểu nội dung mà các type cũ không vẽ được: CÔNG THỨC, BÀI TÍNH, ĐỀ BÀI.
// Thêm: formula · calc · exercise · funnel · changelog · journey · cheatsheet (+ chart "step", quiz "whyNot").
const OPS = { "×": "×", "x": "×", "*": "×", "÷": "÷", "/": "÷", "+": "+", "-": "−", "−": "−" };
const bodyRich = (str, base, acc) => rich(str, base, acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { fontFace: r.options.fontFace === TH.titleFont ? TH.bodyFont : r.options.fontFace }) }));
const lowerLim = (d) => (d.note ? FOOT_Y - 0.15 : 6.9);

// formula: công thức thành chuỗi ô "biến × biến"; mỗi ô có ký hiệu lớn + tên biến, chú thích nằm dưới ô.
// result = vế trái (ô đậm viền nhấn); focus = biến người nói muốn chỉ vào (ô nền nhấn); example = một dòng thay số.
L.formula = async (s, c, d) => {
  kickerTitle(s, c, d);
  const tm = (d.terms || []).slice(0, 5), parts = [Object.assign({ res: true }, d.result || {}), ...tm], n = parts.length, opW = 0.5;
  const bw = (W - 2 * M - opW * (n - 1)) / n, tw = bw - 0.3, lim = lowerLim(d);
  const symFs = 34, lab = (p) => p.label || "";
  const lH = Math.max(0.35, ...parts.map(p => realH(lab(p), { fontFace: TH.bodyFont, fontSize: 15, bold: true }, tw, 0.4)));
  const nH = Math.max(0, ...parts.map(p => p.note ? realH(p.note, { fontFace: TH.bodyFont, fontSize: 14 }, bw - 0.05, 0.5) : 0));
  const bh = 0.3 + 0.62 + 0.08 + lH + 0.28, exH = d.example ? realH(d.example, { fontFace: TH.bodyFont, fontSize: 17 }, W - 2 * M - 2.0, 0.4) + 0.36 : 0;
  const blk = bh + (nH ? 0.18 + nH : 0) + (exH ? 0.45 + exH : 0), y0 = BODY_Y + 0.05 + Math.max(0, (lim - BODY_Y - 0.05 - blk) / 2);
  for (const [i, p] of parts.entries()) {
    const x = M + i * (bw + opW), on = !p.res && d.focus === i - 1;
    const fill = p.res ? c.deep : on ? c.acc : c.card, fg = on ? c.onAcc : p.res ? c.acc : c.text;
    if (p.res) stack(s, x, y0, bw, bh, c.acc);
    box(s, x, y0, bw, bh, fill, p.res ? c.acc : on ? null : c.line);
    // ký hiệu: co cỡ vừa một dòng trong ô
    const sym = String(p.sym || ""), sfs = [symFs, 30, 26, 22, 19].find(z => { const t = textW(sym, { fontFace: TH.numFont, fontSize: z, bold: true, italic: TH.numItalic }); return t == null || t * 1.05 <= tw; }) || 19;
    T(s, sym, { _label: p.res ? "result.sym" : `terms[${i - 1}].sym`, x: x + 0.15, y: y0 + 0.28, w: tw, h: 0.62, fontSize: sfs, fontFace: TH.numFont, italic: TH.numItalic, bold: true, color: fg, align: "center", valign: "middle" });
    T(s, lab(p), { _label: p.res ? "result.label" : `terms[${i - 1}].label`, x: x + 0.15, y: y0 + 0.98, w: tw, h: lH + 0.04, fontSize: 15, bold: true, color: on ? c.onAcc : c.text, align: "center" });
    if (p.note) T(s, p.note, { _label: `terms[${i - 1}].note`, x: x + 0.02, y: y0 + bh + 0.18, w: bw - 0.05, h: nH + 0.04, fontSize: 14, color: c.muted, align: "center" });
    if (i < n - 1) { const op = i === 0 ? "=" : (OPS[String(parts[i + 1].op || "×")] || "×");
      T(s, op, { _label: "phép tính", x: x + bw, y: y0 + bh / 2 - 0.35, w: opW, h: 0.7, fontSize: 30, bold: true, color: c.acc, align: "center", valign: "middle" }); }
  }
  if (d.example) { const ey = y0 + bh + (nH ? 0.18 + nH : 0) + 0.45;
    box(s, M, ey, W - 2 * M, exH, c.deep);
    s.addShape(pres.shapes.RECTANGLE, { x: M, y: ey, w: 0.09, h: exH, fill: { color: c.acc }, line: { type: "none" } });
    T(s, "THAY SỐ", { _label: "example label", x: M + 0.3, y: ey + 0.18, w: 1.4, h: 0.3, fontSize: 12, bold: true, color: c.acc, charSpacing: 1 });
    T(s, bodyRich(d.example, c.text, c.acc), { _label: "example", x: M + 1.75, y: ey + 0.16, w: W - 2 * M - 2.0, h: exH - 0.3, fontSize: 17, color: c.text }); }
  foot(s, c, d.note);
};

// calc: bài giải mẫu — dữ kiện (trái) → các bước có số (giữa) → ĐÁP SỐ lớn (phải). Đáp số là thứ người học phải nhớ/đối chiếu.
L.calc = async (s, c, d) => {
  kickerTitle(s, c, d);
  const gv = (d.given || []).slice(0, 5), st = (d.steps || []).slice(0, 4), an = d.answer || {}, lim = lowerLim(d);
  const gx = M, gw = 3.45, sx = gx + gw + 0.3, ax = 9.55, sw = ax - 0.3 - sx, aw = W - M - ax;
  // cột dữ kiện
  const gRow = gv.map(g => Math.max(0.62, 0.3 + realH(g.value, { fontFace: TH.bodyFont, fontSize: 17, bold: true }, gw - 0.5, 0.32) + 0.12));
  const gH = 0.62 + gRow.reduce((a, h) => a + h, 0) + 0.15;
  const sT = st.map(q => realH(q.label, { fontFace: TH.bodyFont, fontSize: 16, bold: true }, sw - 2.3, 0.32)), sE = st.map(q => q.expr ? realH(q.expr, { fontFace: TH.bodyFont, fontSize: 15 }, sw - 2.3, 0.3) : 0);
  const sRow = st.map((q, i) => Math.max(0.85, 0.2 + sT[i] + (sE[i] ? 0.06 + sE[i] : 0) + 0.2)), sH = sRow.reduce((a, h) => a + h, 0) + 0.4;
  const aLH = an.label ? realH(an.label, { fontFace: TH.bodyFont, fontSize: 15 }, aw - 0.6, 0.4) : 0, aH = 0.55 + 0.9 + (an.unit ? 0.45 : 0) + (aLH ? 0.15 + aLH : 0) + 0.3;
  const blk = Math.max(gH, sH, aH), y0 = BODY_Y + 0.05 + Math.max(0, (lim - BODY_Y - 0.05 - blk) / 2);
  // dữ kiện
  box(s, gx, y0, gw, gH, c.deep);
  cap(s, "Dữ kiện", gx + 0.25, y0 + 0.2, gw - 0.5, c.acc);
  let y = y0 + 0.62;
  gv.forEach((g, i) => { if (i) s.addShape(pres.shapes.LINE, { x: gx + 0.25, y, w: gw - 0.5, h: 0, line: { color: c.line, width: 0.75 } });
    T(s, g.label, { _label: `given[${i}].label`, x: gx + 0.25, y: y + 0.06, w: gw - 0.5, h: 0.28, fontSize: 13, color: c.muted });
    T(s, g.value, { _label: `given[${i}].value`, x: gx + 0.25, y: y + 0.32, w: gw - 0.5, h: gRow[i] - 0.36, fontSize: 17, bold: true, color: c.text }); y += gRow[i]; });
  // các bước
  y = y0 + Math.max(0, (blk - sH) / 2) + 0.2;
  st.forEach((q, i) => { const rh = sRow[i];
    num(s, i + 1, sx, y + 0.18, 0.5, c.acc, c.onAcc, 15);
    T(s, bodyRich(q.label, c.text, c.acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { bold: true }) })), { _label: `steps[${i}].label`, x: sx + 0.7, y: y + 0.16, w: sw - 2.3, h: sT[i] + 0.04, fontSize: 16 });
    if (q.expr) T(s, q.expr, { _label: `steps[${i}].expr`, x: sx + 0.7, y: y + 0.22 + sT[i], w: sw - 2.3, h: sE[i] + 0.04, fontSize: 15, color: c.muted });
    if (q.value) T(s, q.value, { _label: `steps[${i}].value`, x: sx + sw - 1.55, y: y + 0.12, w: 1.55, h: 0.5, fontSize: 19, bold: true, fontFace: TH.numFont, italic: TH.numItalic, color: c.acc, align: "right", valign: "middle" });
    if (i < st.length - 1) s.addShape(pres.shapes.LINE, { x: sx + 0.25, y: y + 0.72, w: 0, h: rh - 0.74, line: { color: c.line, width: 1.5, dashType: "dash" } });
    y += rh; });
  // đáp số: thẻ sáng + vạch nhấn (không phải khối đậm — để dành cho điều cần nhấn nhất của deck)
  const ay = y0 + Math.max(0, (blk - aH) / 2);
  stack(s, ax, ay, aw, aH, c.acc);
  box(s, ax, ay, aw, aH, c.card, c.line);
  s.addShape(pres.shapes.RECTANGLE, { x: ax, y: ay, w: 0.08, h: aH, fill: { color: c.acc }, line: { type: "none" } });
  cap(s, "Đáp số", ax + 0.3, ay + 0.25, aw - 0.5, c.acc);
  const v = String(an.value || ""), vfs = [44, 40, 36, 32, 28, 24].find(z => { const t = textW(v, { fontFace: TH.numFont, fontSize: z, bold: true, italic: TH.numItalic }); return t == null || t * 1.06 <= aw - 0.55; }) || 24;
  T(s, v, { _label: "answer.value", x: ax + 0.3, y: ay + 0.62, w: aw - 0.45, h: 0.85, fontSize: vfs, fontFace: TH.numFont, italic: TH.numItalic, bold: true, color: c.text, valign: "middle" });
  await mark(s, "box", ax + 0.2, ay + 0.6, aw - 0.35, 0.9, TH.gold, 7);
  let ly = ay + 1.55;
  if (an.unit) { T(s, an.unit, { _label: "answer.unit", x: ax + 0.3, y: ly, w: aw - 0.5, h: 0.4, fontSize: 18, fontFace: TH.accentFont, italic: TH.accentItalic, color: c.acc }); ly += 0.45; }
  if (an.label) T(s, an.label, { _label: "answer.label", x: ax + 0.3, y: ly + 0.1, w: aw - 0.6, h: aLH + 0.04, fontSize: 15, color: c.muted });
  foot(s, c, d.note);
};

// exercise: đề bài trên màn hình — đoạn đề (dữ kiện then chốt [tô]) + YÊU CẦU; cột phải tách dữ kiện thành thẻ để người học chép nhanh.
// Đi cặp với calc (lời giải) ở slide sau, giống cặp quiz hỏi → đáp.
L.exercise = async (s, c, d) => {
  kickerTitle(s, c, d);
  const gv = (d.given || []).slice(0, 5), lim = d.hint ? FOOT_Y - 0.15 : 6.9, lx = M, lw = gv.length ? 7.75 : W - 2 * M, rx = lx + lw + 0.35, rw = W - M - rx;
  const pH = realH(bodyRich(d.prompt || "", c.text, c.acc), { fontFace: TH.bodyFont, fontSize: 18 }, lw - 0.8, 1.5) + 0.05, aH = d.ask ? realH(d.ask, { fontFace: TH.bodyFont, fontSize: 18, bold: true }, lw - 0.8, 0.5) : 0;
  const cardH = Math.min(lim - BODY_Y, (d.label ? 1.1 : 0.75) + pH + (aH ? 0.35 + 0.35 + aH : 0) + 0.35);
  const gRow = gv.map(g => Math.max(0.78, 0.36 + realH(g.value, { fontFace: TH.bodyFont, fontSize: 18, bold: true }, rw - 0.5, 0.35) + 0.12));
  const gH = 0.45 + gRow.reduce((a, h) => a + h, 0) + 0.08 * Math.max(0, gv.length - 1);
  const blk = Math.max(cardH, gH), y0 = BODY_Y + Math.max(0, (lim - BODY_Y - blk) / 2);
  box(s, lx, y0, lw, cardH, c.card, c.line);
  if (d.label) chip(s, String(d.label).toUpperCase(), lx + 0.4, y0 + 0.25, c, { _label: "label", fill: c.acc, line: c.acc, color: c.onAcc });
  T(s, bodyRich(d.prompt || "", c.text, c.acc), { _label: "prompt", x: lx + 0.4, y: y0 + (d.label ? 0.8 : 0.45), w: lw - 0.8, h: pH + 0.05, fontSize: 18, color: c.text });
  if (d.ask) { const ay = y0 + (d.label ? 0.8 : 0.45) + pH + 0.3;
    s.addShape(pres.shapes.LINE, { x: lx + 0.4, y: ay, w: lw - 0.8, h: 0, line: { color: c.line, width: 1, dashType: "dash" } });
    cap(s, "Yêu cầu", lx + 0.4, ay + 0.15, 3, c.acc);
    T(s, bodyRich(d.ask, c.text, c.acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { bold: true }) })), { _label: "ask", x: lx + 0.4, y: ay + 0.5, w: lw - 0.8, h: aH + 0.05, fontSize: 18 }); }
  if (gv.length) { let y = y0 + Math.max(0, (blk - gH) / 2);
    cap(s, "Dữ kiện", rx, y, rw, c.muted); y += 0.45;
    gv.forEach((g, i) => { const h = gRow[i];
      box(s, rx, y, rw, h, c.deep);
      s.addShape(pres.shapes.RECTANGLE, { x: rx, y, w: 0.07, h, fill: { color: c.acc }, line: { type: "none" } });
      T(s, g.label, { _label: `given[${i}].label`, x: rx + 0.25, y: y + 0.08, w: rw - 0.4, h: 0.28, fontSize: 13, color: c.muted });
      T(s, g.value, { _label: `given[${i}].value`, x: rx + 0.25, y: y + 0.36, w: rw - 0.4, h: h - 0.42, fontSize: 18, bold: true, color: c.text });
      y += h + 0.08; }); }
  foot(s, c, d.hint);
};

// funnel: nhiều nguồn → MỘT quỹ → nhiều hướng chi; độ dày dải tỉ lệ với giá trị — thay flow khi nhiều mũi tên cùng đổ về một nút.
L.funnel = async (s, c, d) => {
  kickerTitle(s, c, d);
  const src = (d.sources || []).slice(0, 4), use = (d.uses || []).slice(0, 4), lim = lowerLim(d), pool = d.pool || {};
  const colW = 3.05, px = 5.25, pw = W - 2 * px, lxR = W - M - colW, top = BODY_Y + 0.1, avail = lim - top;
  const lay = (arr) => { const n = Math.max(1, arr.length), g = 0.22, h = Math.min(1.25, (avail - g * (n - 1)) / n), tot = n * h + g * (n - 1), y = top + (avail - tot) / 2; return arr.map((_, i) => ({ y: y + i * (h + g), h })); };
  const LS = lay(src), LU = lay(use), sy = Math.min(LS[0].y, (LU[0] || LS[0]).y), sh = Math.max(LS[LS.length - 1].y + LS[LS.length - 1].h, LU.length ? LU[LU.length - 1].y + LU[LU.length - 1].h : 0) - sy;
  const ph = Math.min(sh, 2.0 + (pool.sub ? 0.55 : 0)), py = sy + (sh - ph) / 2; // quỹ cao vừa nội dung, đặt giữa — các dải thu hẹp dần về quỹ (hình phễu)
  const val = (it) => Math.max(0, +it.value || 0), band = (arr, side) => { // dải nối thẻ ↔ quỹ, dày theo tỉ trọng
    const tot = arr.reduce((a, it) => a + val(it), 0), eq = !tot, mxS = eq ? 1 : Math.max(...arr.map(it => val(it) / tot));
    let off = py + 0.15; const span = ph - 0.3;
    arr.forEach((it, i) => { const L = (side ? LU : LS)[i], share = eq ? 1 / arr.length : val(it) / tot, t = Math.min(L.h - 0.15, Math.max(0.12, (L.h - 0.15) * (eq ? 0.6 : share / mxS)));
      const seg = span * share, cy = L.y + L.h / 2, a1 = cy - t / 2, a2 = cy + t / 2, b1 = off, b2 = off + seg - 0.04; off += seg;
      const xa = side ? lxR : M + colW, xb = side ? px + pw : px, pts = side ? [[xb, b1], [xa, a1], [xa, a2], [xb, b2]] : [[xa, a1], [xb, b1], [xb, b2], [xa, a2]];
      poly(s, pts, side ? c.good : c.acc, null, it.focus ? 62 : 80); }); };
  band(src, false); if (use.length) band(use, true);
  stack(s, px, py, pw, ph, c.acc);
  box(s, px, py, pw, ph, c.deep, c.acc);
  await circIcon(s, pool.icon || "PiPiggyBankDuotone", px + pw / 2 - 0.4, py + 0.3, 0.8, c.acc, c.onAcc);
  T(s, pool.label || "", { _label: "pool.label", x: px + 0.15, y: py + 1.25, w: pw - 0.3, h: 0.45, fontSize: 20, bold: true, color: c.text, align: "center" });
  if (pool.sub) T(s, pool.sub, { _label: "pool.sub", x: px + 0.15, y: py + 1.72, w: pw - 0.3, h: 0.6, fontSize: 14, color: c.muted, align: "center" });
  const card = (it, L, x, i, k, side) => {
    box(s, x, L.y, colW, L.h, c.card, it.focus ? (side ? c.good : c.acc) : c.line);
    const disp = it.display || (it.value != null ? fmtNum(+it.value) + (d.unit ? " " + d.unit : "") : "");
    T(s, it.label, { _label: `${k}[${i}].label`, x: x + 0.25, y: L.y + 0.1, w: colW - 0.5, h: disp ? Math.min(0.62, L.h - 0.1) : L.h - 0.2, fontSize: 16, bold: true, color: c.text, valign: disp ? "top" : "middle" }); // không có số → tên nằm giữa thẻ
    if (disp) T(s, disp, { _label: `${k}[${i}].display`, x: x + 0.25, y: L.y + L.h - 0.52, w: colW - 0.5, h: 0.44, fontSize: 20, fontFace: TH.numFont, italic: TH.numItalic, bold: true, color: side ? c.good : c.acc }); };
  src.forEach((it, i) => card(it, LS[i], M, i, "sources", false));
  use.forEach((it, i) => card(it, LU[i], lxR, i, "uses", true));
  cap(s, d.inLabel || "Nguồn vào", M, top - 0.38, colW, c.muted);
  if (use.length) cap(s, d.outLabel || "Chi ra", lxR, top - 0.38, colW, c.muted);
  foot(s, c, d.note);
};

// changelog: luật cũ → luật mới theo từng quy định, mỗi dòng một nhãn Mới / Đổi / Bỏ / Giữ — slide "cập nhật luật" của bài giảng.
const CL = { new: ["Mới", "good"], changed: ["Đổi", "acc"], removed: ["Bỏ", "bad"], kept: ["Giữ", "muted"] };
L.changelog = async (s, c, d) => {
  kickerTitle(s, c, d);
  const rows = (d.rows || []).slice(0, 6), lim = lowerLim(d), tw = W - 2 * M, w0 = 3.0, wb = 0.95, wa = 0.45, wo = (tw - w0 - wb - wa) * 0.46, wn = tw - w0 - wb - wa - wo;
  const xs = [M, M + w0, M + w0 + wo, M + w0 + wo + wa, M + w0 + wo + wa + wn], hh = 0.5;
  const rH = rows.map(r => Math.max(0.62, 0.22 + Math.max(realH(r.topic, { fontFace: TH.bodyFont, fontSize: 16, bold: true }, w0 - 0.45, 0.3), realH(r.old || "—", { fontFace: TH.bodyFont, fontSize: 15 }, wo - 0.4, 0.3), realH(r.new || "—", { fontFace: TH.bodyFont, fontSize: 15, bold: true }, wn - 0.4, 0.3))));
  let tot = hh + rH.reduce((a, h) => a + h, 0); const k = Math.min(1, (lim - BODY_Y - 0.05) / tot); const RH = rH.map(h => h * (k < 1 ? k : 1)); tot = hh + RH.reduce((a, h) => a + h, 0);
  const y0 = BODY_Y + 0.05 + Math.max(0, (lim - BODY_Y - 0.05 - tot) / 2);
  box(s, M, y0, tw, tot, c.card, c.line);
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: y0, w: tw, h: hh, fill: { color: c.acc }, line: { type: "none" } });
  [[d.colTopic || "Quy định", 0], [d.colOld || "Trước đây", 1], [d.colNew || "Hiện hành", 3], ["", 4]].forEach(([t, j]) => t && T(s, String(t).toUpperCase(), { _label: "đầu cột", x: xs[j] + 0.22, y: y0, w: (j === 3 ? wn : j === 1 ? wo : w0) - 0.4, h: hh, fontSize: 12.5, bold: true, color: c.onAcc, charSpacing: 1, valign: "middle" }));
  let y = y0 + hh;
  rows.forEach((r, i) => { const h = RH[i], f = d.focus === i, st = CL[r.status] || CL.changed, col = st[1] === "acc" ? c.acc : c[st[1]];
    if (f) s.addShape(pres.shapes.RECTANGLE, { x: M, y, w: tw, h, fill: { color: c.acc, transparency: 88 }, line: { type: "none" } });
    if (i) s.addShape(pres.shapes.LINE, { x: M, y, w: tw, h: 0, line: { color: c.line, width: 0.75 } });
    T(s, r.topic, { _label: `rows[${i}].topic`, x: xs[0] + 0.22, y: y + 0.04, w: w0 - 0.45, h: h - 0.08, fontSize: 16, bold: true, color: c.text, valign: "middle" });
    T(s, r.old || "—", { _label: `rows[${i}].old`, x: xs[1] + 0.2, y: y + 0.04, w: wo - 0.4, h: h - 0.08, fontSize: 15, color: c.muted, valign: "middle" });
    T(s, "→", { _label: "mũi tên", x: xs[2], y: y + 0.04, w: wa, h: h - 0.08, fontSize: 20, bold: true, color: col, align: "center", valign: "middle" });
    T(s, bodyRich(r.new || "—", c.text, c.acc).map(q => ({ text: q.text, options: Object.assign({}, q.options, { bold: true }) })), { _label: `rows[${i}].new`, x: xs[3] + 0.2, y: y + 0.04, w: wn - 0.4, h: h - 0.08, fontSize: 15, valign: "middle" });
    chip(s, st[0], xs[4] + wb / 2, y + h / 2 - 0.18, c, { _label: `rows[${i}].status`, center: true, max: wb - 0.1, fill: col, line: col, color: st[1] === "muted" ? c.bg : c.onAcc });
    y += h; });
  if (Number.isInteger(d.focus) && d.focus < rows.length) { const fy = y0 + hh + RH.slice(0, d.focus).reduce((a, h) => a + h, 0); await mark(s, "box", M + 0.05, fy + 0.03, tw - 0.1, RH[d.focus] - 0.06, TH.gold, 6); }
  foot(s, c, d.note);
};

// match: ĐỐI ỨNG HAI CỘT — mỗi hàng một cặp "A → B" (điều kiện ↔ căn cứ vô hiệu, dấu hiệu ↔ tội danh, nghĩa vụ ↔ chế tài).
// Ô trái giống nhau ở các hàng liền nhau được GỘP thành một ô cao (một điều kiện → nhiều căn cứ). focus = hàng đang bàn.
// Khác table (tra nhiều cột) và hub (một tâm, mất quan hệ từng cặp): người xem đọc được "cái này ứng với cái kia".
L.match = async (s, c, d) => {
  kickerTitle(s, c, d);
  const P = (d.pairs || []).slice(0, 6), lim = lowerLim(d), tw = W - 2 * M, wl = Math.min(4.6, tw * 0.38), ga = 0.85, wr = tw - wl - ga, hh = 0.42;
  const xl = M, xr = M + wl + ga;
  // co theo chỗ: hàng tối thiểu 0.7 → 0.56 in, khoảng cách 0.14 → 0.08 in (không thu cỡ chữ); vẫn không vừa thì lớp đo chữ báo ô cần rút
  const fitRows = (minH, pad) => P.map(p => Math.max(minH, pad + realH(bodyRich(p.right || "", c.text, c.acc), { fontFace: TH.bodyFont, fontSize: 17 }, wr - 0.5, 0.35) + (p.note ? 0.04 + realH(p.note, { fontFace: TH.bodyFont, fontSize: 13 }, wr - 0.5, 0.25) : 0)));
  let gap = 0.14, rH = fitRows(0.7, 0.3);
  // nhóm ô trái: các hàng liền nhau cùng chữ "left" thành một ô
  const groups = []; P.forEach((p, i) => { const g = groups[groups.length - 1]; if (g && String(p.left) === String(g.text)) g.rows.push(i); else groups.push({ text: p.left, rows: [i] }); });
  const grow = () => { for (const g of groups) { const need = 0.3 + realH(g.text || "", { fontFace: TH.bodyFont, fontSize: 18, bold: true }, wl - 0.5, 0.35), have = g.rows.reduce((a, i) => a + rH[i], 0) + gap * (g.rows.length - 1);
    if (need > have) rH[g.rows[g.rows.length - 1]] += need - have; } };
  const total = () => hh + 0.1 + rH.reduce((a, h) => a + h, 0) + gap * Math.max(0, P.length - 1);
  grow(); if (total() > lim - BODY_Y) { gap = 0.08; rH = fitRows(0.56, 0.2); grow(); }
  if (total() > lim - BODY_Y) { gap = 0.06; rH = fitRows(0.48, 0.14); grow(); }
  const tot = total();
  let y = BODY_Y + Math.max(0, (lim - BODY_Y - tot) / 2);
  if (d.colL) T(s, String(d.colL).toUpperCase(), { _label: "colL", x: xl, y, w: wl, h: hh, fontSize: 12.5, bold: true, color: c.acc, charSpacing: 1.2, valign: "bottom" });
  if (d.colR) T(s, String(d.colR).toUpperCase(), { _label: "colR", x: xr, y, w: wr, h: hh, fontSize: 12.5, bold: true, color: c.acc, charSpacing: 1.2, valign: "bottom" });
  y += hh + 0.1;
  const Y = []; { let yy = y; P.forEach((_, i) => { Y[i] = yy; yy += rH[i] + gap; }); }
  for (const g of groups) { const a = g.rows[0], b = g.rows[g.rows.length - 1], gy = Y[a], gh = Y[b] + rH[b] - gy, f = g.rows.includes(d.focus);
    box(s, xl, gy, wl, gh, f ? mix(c.acc, c.bg, 0.86) : c.card, f ? c.acc : c.line);
    if (g.rows.length > 1) (CUR.spaceOk = CUR.spaceOk || []).push({ x: xl, y: gy, w: wl, h: gh }); // ô gộp cao theo các hàng bên phải — trống là chủ đích
    T(s, bodyRich(g.text || "", c.text, c.acc).map(q => ({ text: q.text, options: Object.assign({}, q.options, { bold: true }) })), { _label: `pairs[${a}].left`, x: xl + 0.25, y: gy + 0.1, w: wl - 0.5, h: gh - 0.2, fontSize: 18, valign: "middle" }); }
  for (const [i, p] of P.entries()) { const f = d.focus === i, yy = Y[i], h = rH[i];
    T(s, "→", { _label: "mũi tên", x: xl + wl, y: yy, w: ga, h, fontSize: 24, bold: true, color: f ? c.acc : c.muted, align: "center", valign: "middle" });
    box(s, xr, yy, wr, h, f ? mix(c.acc, c.bg, 0.86) : c.card, f ? c.acc : c.line);
    const rh = realH(bodyRich(p.right || "", c.text, c.acc), { fontFace: TH.bodyFont, fontSize: 17 }, wr - 0.5, 0.35), nh = p.note ? realH(p.note, { fontFace: TH.bodyFont, fontSize: 13 }, wr - 0.5, 0.25) : 0, ty = yy + (h - rh - (nh ? 0.04 + nh : 0)) / 2;
    T(s, bodyRich(p.right || "", c.text, c.acc), { _label: `pairs[${i}].right`, x: xr + 0.25, y: ty, w: wr - 0.5, h: rh + 0.04, fontSize: 17 });
    if (p.note) T(s, p.note, { _label: `pairs[${i}].note`, x: xr + 0.25, y: ty + rh + 0.04, w: wr - 0.5, h: nh + 0.04, fontSize: 13, color: f ? c.text : c.muted }); } // trên nền tô của hàng focus, chữ xám không đủ 4.5:1
  foot(s, c, d.note);
};

// journey: một đời người (hoặc một hồ sơ) đi qua các sự kiện; mỗi sự kiện gắn với chế định/chế độ áp dụng (link).
// Dùng để nối các phần rời rạc thành một câu chuyện (5 chế độ BHXH = 5 lúc trong đời người lao động).
L.journey = async (s, c, d) => {
  kickerTitle(s, c, d);
  const st = (d.stages || []).slice(0, 6), n = Math.max(1, st.length), who = d.who || {}, lim = lowerLim(d);
  const wx = M, ww = who.name ? 1.95 : 0, x0 = M + ww + (ww ? 0.25 : 0), cw = (W - M - x0) / n, tw = cw - 0.2, es = n <= 4 ? 18 : 16;
  const eH = Math.max(...st.map(q => realH(q.event, { fontFace: TH.bodyFont, fontSize: es, bold: true }, tw, 0.4)));
  const blk = 0.36 + 0.3 + 0.9 + 0.3 + eH + (st.some(q => q.link) ? 0.15 + 0.4 : 0), y0 = BODY_Y + 0.05 + Math.max(0, (lim - BODY_Y - 0.05 - blk) / 2), ay = y0 + 0.36 + 0.3 + 0.45;
  if (who.name) { await circIcon(s, who.icon || "PiUserDuotone", wx + ww / 2 - 0.45, ay - 0.45, 0.9, c.acc, c.onAcc);
    T(s, who.name, { _label: "who.name", x: wx, y: ay + 0.6, w: ww, h: 0.4, fontSize: 17, bold: true, color: c.text, align: "center" });
    if (who.sub) T(s, who.sub, { _label: "who.sub", x: wx, y: ay + 1.0, w: ww, h: 0.9, fontSize: 13, color: c.muted, align: "center" }); }
  s.addShape(pres.shapes.LINE, { x: x0 - (ww ? 0.15 : 0), y: ay, w: W - M - x0 + (ww ? 0.15 : 0), h: 0, line: { color: c.acc, width: 3, endArrowType: "triangle", dashType: "solid" } });
  for (const [i, q] of st.entries()) {
    const cx = x0 + cw * (i + 0.5), on = d.focus === i;
    if (q.when) chip(s, q.when, cx, y0, c, { _label: `stages[${i}].when`, center: true, max: cw - 0.1, fill: on ? c.acc : c.deep, line: on ? c.acc : c.line, color: on ? c.onAcc : c.text });
    await circIcon(s, q.icon || "PiCircleDuotone", cx - 0.45, ay - 0.45, 0.9, on ? c.acc : c.card, on ? c.onAcc : c.acc);
    if (!on) s.addShape(pres.shapes.OVAL, { x: cx - 0.45, y: ay - 0.45, w: 0.9, h: 0.9, fill: { type: "none" }, line: { color: c.acc, width: 2 } });
    const ty = ay + 0.6;
    T(s, q.event, { _label: `stages[${i}].event`, x: cx - tw / 2, y: ty, w: tw, h: eH + 0.04, fontSize: es, bold: true, color: on ? c.acc : c.text, align: "center" });
    if (q.link) chip(s, q.link, cx, ty + eH + 0.15, c, { _label: `stages[${i}].link`, center: true, max: cw - 0.05, fill: on ? c.acc : c.bg, line: c.acc, color: on ? c.onAcc : c.acc });
  }
  foot(s, c, d.note);
};

// cheatsheet: lưới tra nhanh N cột (đối tượng) × 2–3 hàng (câu hỏi cố định: ai / khi nào / bao nhiêu), đầu cột có icon.
L.cheatsheet = async (s, c, d) => {
  kickerTitle(s, c, d);
  const cols = (d.cols || []).slice(0, 5), rows = (d.rows || []).slice(0, 3), nc = Math.max(1, cols.length), lim = lowerLim(d);
  const lw = 1.85, gap = 0.12, cw = (W - 2 * M - lw - gap * nc) / nc;
  // cỡ chữ lớn nhất (17 → 14) mà lưới vẫn vừa vùng thân — ít chữ thì chữ to, hàng cao, không để trống nửa slide
  const hH = 1.15, rowsH = (f) => rows.map((_, r) => Math.max(0.75, 0.36 + Math.max(...cols.map(cl => realH(String((cl.cells || [])[r] || ""), { fontFace: TH.bodyFont, fontSize: f }, cw - 0.3, 0.3)))));
  const fs = [17, 16, 15, 14].find(f => hH + rowsH(f).reduce((a, h) => a + h + gap, 0) <= lim - BODY_Y) || 14;
  const room = (lim - BODY_Y - hH) / Math.max(1, rows.length) - gap, rH = rowsH(fs).map(h => Math.max(h, Math.min(1.5, room)));
  let tot = hH + rH.reduce((a, h) => a + h + gap, 0); const k = Math.min(1, (lim - BODY_Y) / tot), RH = rH.map(h => h * k); tot = hH + RH.reduce((a, h) => a + h + gap, 0);
  const y0 = BODY_Y + Math.max(0, (lim - BODY_Y - tot) / 2);
  for (const [j, cl] of cols.entries()) { const x = M + lw + gap + j * (cw + gap), on = d.focus === j;
    await circIcon(s, cl.icon || "PiCircleDuotone", x + cw / 2 - 0.3, y0 + 0.05, 0.6, on ? c.acc : c.deep, on ? c.onAcc : c.acc);
    T(s, cl.name, { _label: `cols[${j}].name`, x: x + 0.05, y: y0 + 0.7, w: cw - 0.1, h: 0.4, fontSize: 16, bold: true, color: on ? c.acc : c.text, align: "center" }); }
  let y = y0 + hH;
  rows.forEach((r, i) => { const h = RH[i];
    T(s, String(r.label || r).toUpperCase(), { _label: `rows[${i}].label`, x: M, y, w: lw, h, fontSize: 12.5, bold: true, color: c.acc, charSpacing: 1, valign: "middle" });
    cols.forEach((cl, j) => { const x = M + lw + gap + j * (cw + gap);
      box(s, x, y, cw, h, d.focus === j ? c.deep : c.card, d.focus === j ? c.acc : c.line); // cột focus: nền nhạt + viền nhấn (không vẽ khung bao ngoài — sát cột bên)
      T(s, bodyRich(String((cl.cells || [])[i] || ""), c.text, c.acc), { _label: `cols[${j}].cells[${i}]`, x: x + 0.15, y: y + 0.05, w: cw - 0.3, h: h - 0.1, fontSize: fs, color: c.text, align: "center", valign: "middle" }); });
    y += h + gap; });
  foot(s, c, d.note);
};

// checklist: kiểm từng điều kiện cần (đủ / thiếu / chưa rõ) rồi ra MỘT kết luận — điều kiện hưởng chế độ, điều kiện có hiệu lực của hợp đồng.
// Khác bignum (tối đa 2 điều kiện, có số lớn) và scorecard (hai cột được/chưa được).
L.checklist = async (s, c, d) => {
  kickerTitle(s, c, d);
  const it = (d.items || []).slice(0, 6), v = d.verdict, lim = lowerLim(d), n = Math.max(1, it.length), tw = W - 2 * M - 1.2 - 2.3;
  const vH = v ? Math.max(0.7, realH(v.text || "", { fontFace: TH.bodyFont, fontSize: 18, bold: true }, W - 2 * M - 1.4, 0.4) + 0.32) : 0;
  const rH = it.map(q => Math.max(0.72, 0.2 + realH(q.head, { fontFace: TH.bodyFont, fontSize: 18, bold: true }, tw, 0.35) + (q.text ? 0.04 + realH(q.text, { fontFace: TH.bodyFont, fontSize: 15 }, tw, 0.3) : 0) + 0.16));
  let tot = rH.reduce((a, h) => a + h, 0) + (v ? 0.3 + vH : 0); const k = Math.min(1, (lim - BODY_Y) / tot), RH = rH.map(h => h * k);
  tot = RH.reduce((a, h) => a + h, 0) + (v ? 0.3 + vH : 0);
  let y = BODY_Y + Math.max(0, (lim - BODY_Y - tot) / 2);
  for (const [i, q] of it.entries()) { CUR.grp = i + 1; const h = RH[i], ok = q.ok === "yes", no = q.ok === "no", col = ok ? c.good : no ? c.bad : c.muted;
    if (i) s.addShape(pres.shapes.LINE, { x: M, y, w: W - 2 * M, h: 0, line: { color: c.line, width: 0.75 } });
    await circIcon(s, ok ? "FaCheck" : no ? "FaXmark" : q.ok === "na" ? "FaMinus" : "FaQuestion", M + 0.1, y + (h - 0.6) / 2, 0.6, c.deep, col);
    const hh = realH(q.head, { fontFace: TH.bodyFont, fontSize: 18, bold: true }, tw, 0.35), th = q.text ? realH(q.text, { fontFace: TH.bodyFont, fontSize: 15 }, tw, 0.3) : 0, by = y + (h - hh - (th ? 0.04 + th : 0)) / 2;
    T(s, bodyRich(q.head, c.text, c.acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { bold: true }) })), { _label: `items[${i}].head`, x: M + 1.0, y: by, w: tw, h: hh + 0.04, fontSize: 18 });
    if (q.text) T(s, q.text, { _label: `items[${i}].text`, x: M + 1.0, y: by + hh + 0.04, w: tw, h: th + 0.04, fontSize: 15, color: c.muted });
    if (q.src) chip(s, q.src, W - M - 0.05, y + (h - 0.36) / 2, c, { _label: `items[${i}].src`, max: 2.2, fill: c.bg, line: c.line, color: c.muted, right: true });
    y += h; }
  CUR.grp = v ? it.length + 1 : 0; // kết luận hiện SAU cùng
  if (v) { y += 0.3; const vc = v.ok === "no" ? c.bad : v.ok === "maybe" ? c.muted : c.good;
    box(s, M, y, W - 2 * M, vH, c.deep);
    s.addShape(pres.shapes.RECTANGLE, { x: M, y, w: 0.09, h: vH, fill: { color: vc }, line: { type: "none" } });
    T(s, "→", { _label: "mũi tên", x: M + 0.25, y, w: 0.5, h: vH, fontSize: 24, bold: true, color: vc, valign: "middle" });
    T(s, bodyRich(v.text || "", c.text, c.acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { bold: true }) })), { _label: "verdict.text", x: M + 0.85, y: y + 0.16, w: W - 2 * M - 1.1, h: vH - 0.32, fontSize: 18, valign: "middle" }); }
  CUR.grp = 0;
  foot(s, c, d.note);
};

// bento: lưới thẻ khác cỡ (học từ bento-ppt-skill, MIT) — thẻ chính lớn bên trái (kết luận / con số then chốt), 2–4 thẻ phụ bên phải.
// Mỗi thẻ: value (số lớn, tuỳ chọn) + head + text hoặc items. Dùng cho tổng quan một chủ đề có nhiều mặt (quỹ BHYT: thu, chi, đối tượng, tỉ lệ bao phủ).
L.bento = async (s, c, d) => {
  kickerTitle(s, c, d);
  const cells = (d.cells || []).slice(0, 5), hero = cells[0] || {}, rest = cells.slice(1), lim = lowerLim(d), g = 0.22;
  const y0 = BODY_Y, H0 = lim - y0, hw = rest.length ? 5.2 : W - 2 * M, rx = M + hw + g, rw = W - M - rx;
  const cols = rest.length >= 3 ? 2 : 1, rowsN = Math.ceil(rest.length / cols), cw = (rw - g * (cols - 1)) / cols, ch = (H0 - g * (rowsN - 1)) / Math.max(1, rowsN);
  const fill = async (q, x, y, w, h, big, lab) => {
    box(s, x, y, w, h, big ? c.deep : c.card, big ? null : c.line);
    let cy = y + (big ? 0.3 : 0.2);
    const inl = !big && q.icon && !q.value, ix = inl ? 0.62 : 0; // thẻ nhỏ: icon nằm cạnh tiêu đề (tiết kiệm chiều cao)
    if (q.icon) { await circIcon(s, q.icon, x + 0.25, cy, big ? 0.7 : 0.48, c.acc, c.onAcc); if (!inl) cy += big ? 0.85 : 0.6; }
    if (q.value) { const vf = big ? 54 : 32; T(s, String(q.value), { _label: `${lab}.value`, x: x + 0.25, y: cy - 0.05, w: w - 0.5, h: big ? 1.0 : 0.62, fontSize: vf, fontFace: TH.numFont, italic: TH.numItalic, bold: true, color: c.acc }); cy += big ? 1.0 : 0.62; }
    const hf = big ? 22 : 17, hh = realH(q.head || "", { fontFace: TH.bodyFont, fontSize: hf, bold: true }, w - 0.5 - ix, 0.35);
    if (q.head) { T(s, bodyRich(q.head, c.text, c.acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { bold: true }) })), { _label: `${lab}.head`, x: x + 0.25 + ix, y: inl ? cy + Math.max(0, (0.48 - hh) / 2) : cy, w: w - 0.5 - ix, h: hh + 0.04, fontSize: hf }); cy += (inl ? Math.max(0.48, hh) : hh) + 0.1; }
    else if (inl) cy += 0.58;
    const room = y + h - 0.2 - cy;
    if (q.text) T(s, q.text, { _label: `${lab}.text`, x: x + 0.25, y: cy, w: w - 0.5, h: Math.max(0.3, room), fontSize: big ? 16 : 14, color: c.muted });
    else if (Array.isArray(q.items)) itemBoxes(s, q.items.slice(0, big ? 4 : 3), { lab: `${lab}.items`, x: x + 0.25, y: cy, w: w - 0.5, h: Math.max(0.3, room), fontSize: big ? 16 : 14, color: c.text, acc: c.acc, markColor: big ? c.acc : c.muted, gap: 0.08 });
  };
  await fill(hero, M, y0, hw, H0, true, "cells[0]");
  for (const [i, q] of rest.entries()) { const r = Math.floor(i / cols), k = i % cols, last = i === rest.length - 1 && cols === 2 && rest.length % 2 === 1;
    await fill(q, rx + k * (cw + g), y0 + r * (ch + g), last ? rw : cw, ch, false, `cells[${i + 1}]`); }
  foot(s, c, d.note);
};

const DEF_MODE = { photo: "d", hero: "d" }; // mặc định mọi slide nền trắng (l); "d"/"a" chỉ khi deck ghi rõ

// ---------- lớp 1: giới hạn ký tự ----------
function checkLimits(slides) {
  const warn = [];
  const len = (v) => String(v || "").replace(/[\[\]]/g, "").length;
  slides.forEach((sl, i) => {
    const lim = LIMITS[sl.type]; if (!lim) return;
    const walk = (obj, rule, p) => { for (const [k, v] of Object.entries(rule)) {
      const val = obj && obj[k]; if (val == null) continue;
      if (typeof v === "number") { if (Array.isArray(val)) val.forEach((x, j) => (Array.isArray(x) ? x : [x]).forEach((y, q) => typeof y === "string" && len(y) > v && warn.push(`Slide ${i + 1} ${p}${k}[${j}]${Array.isArray(x) ? `[${q}]` : ""}: ${len(y)}/${v} ký tự`)));
        else if (len(val) > v) warn.push(`Slide ${i + 1} ${p}${k}: ${len(val)}/${v} ký tự`); }
      else if (Array.isArray(val)) val.forEach((x, j) => walk(x, v, `${p}${k}[${j}].`));
      else walk(val, v, `${p}${k}.`); } };
    walk(sl, lim, "");
  });
  return warn;
}

// Hiệu ứng chuyển slide (PowerPoint đọc được; LibreOffice bỏ qua khi render ảnh soát).
// fade = mờ dần nhẹ, push = đẩy sang trái (hợp dòng thời gian), none = tắt.
// morph: PowerPoint 2019 / 365 (2016 chỉ PHÁT được). Bọc trong mc:AlternateContent — bản không hiểu Morph (LibreOffice, Google Slides,
// PowerPoint cũ) tự dùng phần Fallback = fade. Cặp đối tượng ghép theo tên "!!…" (Microsoft Support: Morph transition tips and tricks).
const MORPH = '<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"><mc:Choice xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main" Requires="p159"><p:transition spd="slow" xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" p14:dur="1200"><p159:morph option="byObject"/></p:transition></mc:Choice><mc:Fallback><p:transition spd="med"><p:fade/></p:transition></mc:Fallback></mc:AlternateContent>';
const TRANS = { morph: MORPH, fade: '<p:transition spd="med"><p:fade/></p:transition>', push: '<p:transition spd="med"><p:push dir="l"/></p:transition>' };
// Tô gốc mà pptxgenjs 3.12 chưa có (gitbrent/PptxGenJS#102): shape mang tên "GRAD:<c1>:<c2>" / "HATCH:<fg>:<bg>"
// được thay <a:solidFill> bằng <a:gradFill> / <a:pattFill> ngay trong XML — vẫn là shape PowerPoint, sửa được ở Format Shape.
async function nativeFills(z) {
  for (const f of Object.keys(z.files).filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f))) {
    let t = await z.file(f).async("string"); if (!/name="(GRAD|HATCH):/.test(t)) continue;
    t = t.replace(/<p:sp>(?:(?!<\/p:sp>)[\s\S])*?<\/p:sp>/g, (sp) => {
      const m = sp.match(/name="(GRAD|HATCH):([0-9A-Fa-f]{6}):([0-9A-Fa-f]{6})"/); if (!m) return sp;
      const fill = m[1] === "GRAD"
        ? `<a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:srgbClr val="${m[2]}"/></a:gs><a:gs pos="100000"><a:srgbClr val="${m[3]}"/></a:gs></a:gsLst><a:lin ang="2700000" scaled="0"/></a:gradFill>`
        : `<a:pattFill prst="wdUpDiag"><a:fgClr><a:srgbClr val="${m[2]}"/></a:fgClr><a:bgClr><a:srgbClr val="${m[3]}"/></a:bgClr></a:pattFill>`;
      return sp.replace(m[0], `name="${m[1] === "GRAD" ? "Nền chuyển màu" : "Gạch chéo"}"`).replace(/(<p:spPr>[\s\S]*?)<a:solidFill>[\s\S]*?<\/a:solidFill>/, (_, a) => a + fill);
    });
    z.file(f, t);
  }
}
// đặt tên Morph cho cặp mục lục → chương: ô số thứ k của agenda và số chương lớn của section k cùng tên "!!part-k" (đổi tên SAU injectBuild — nó tra id theo tên cũ)
async function threadNames(z) {
  for (const f of Object.keys(z.files).filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f))) {
    let t = await z.file(f).async("string"); const o = t;
    let k = 0; t = t.replace(/name="S\d+\|agenda\|(?:số thứ tự(?:#\d+)?|số (\d+))"/g, (m, d) => `name="!!part-${d || ++k}"`);
    const sec = SEC_NUM[+f.match(/slide(\d+)\.xml/)[1]]; if (sec) t = t.replace(/name="S\d+\|section\|num"/, `name="!!part-${sec}"`);
    if (t !== o) z.file(f, t); }
}
// "Tô bằng ảnh" gốc (pptxgenjs chưa có tô ảnh cho hình): hình tên "PICFILL:n" → nhúng ảnh vào ppt/media, thêm quan hệ vào slide,
// thay <a:solidFill> trong spPr bằng <a:blipFill> (kéo giãn theo hộp bao — ảnh đã cắt đúng tỉ lệ hộp nên không méo).
async function nativePictures(z) {
  if (!PICFILL.length) return;
  for (const f of Object.keys(z.files).filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f))) {
    let t = await z.file(f).async("string"); if (!t.includes('name="PICFILL:')) continue;
    const rf = f.replace("slides/", "slides/_rels/") + ".rels"; let rels = await z.file(rf).async("string");
    t = t.replace(/<p:sp>(?:(?!<\/p:sp>)[\s\S])*?<\/p:sp>/g, (sp) => { const m = sp.match(/name="PICFILL:(\d+)"/); if (!m) return sp;
      const k = +m[1], pf = PICFILL[k], rid = `rIdPf${k}`, media = `picfill-${k}.${pf.ext}`;
      z.file(`ppt/media/${media}`, pf.buf);
      rels = rels.replace("</Relationships>", `<Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${media}"/></Relationships>`);
      const alt = String(pf.alt || "Ảnh trong khung").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
      return sp.replace(m[0], `name="Ảnh trong khung" descr="${alt}"`).replace(/(<p:spPr>[\s\S]*?)<a:solidFill>[\s\S]*?<\/a:solidFill>/, (_, a) => a + `<a:blipFill rotWithShape="1"><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></a:blipFill>`); });
    z.file(f, t); z.file(rf, rels);
  }
  let ct = await z.file("[Content_Types].xml").async("string");
  for (const [ext, mime] of [["jpeg", "image/jpeg"], ["png", "image/png"]]) if (!new RegExp(`Extension="${ext}"`, "i").test(ct)) ct = ct.replace("<Default ", `<Default Extension="${ext}" ContentType="${mime}"/><Default `);
  z.file("[Content_Types].xml", ct);
}
// --transition morph: Morph chỉ giữa hai slide liền nhau CÙNG bố cục (cùng type; chart cùng kind) — nơi có vật để "trượt" sang:
// dòng thời gian scene → scene, quiz hỏi → quiz đáp án, isotype, timeline. Các slide khác dùng fade. Slide ghi "transition" thì theo slide.
const BUILDABLE = new Set(["steps", "cards", "checklist", "timeline"]), BUILDS = {};
const MORPHABLE = new Set(["scene", "quiz", "timeline", "chart", "isotype", "journey", "iso"]);
// meta.thread ("sợi chỉ nối mạch"): Morph giữa các slide nội dung LIỀN NHAU TRONG CÙNG CHƯƠNG (thanh tiến độ dài dần, nhãn chương đứng yên)
// + mục lục → slide mở chương ngay sau nó (ô số "01" bay thành số chương lớn); sang chương mới / bìa / kết → fade để người nghe thấy ranh giới.
const THREAD_HERO = new Set(["cover", "section", "end", "closing", "photo", "hero", "quote"]);
function threadOf(deck) { let part = 0; return (deck.slides || []).map(sl => { if (!sl) return part; // chương = section có num, hoặc nhãn "Câu / Phần / Chương / Mục N" ở kicker
  if (sl.type === "section" && /^\d+$/.test(String(sl.num || "").trim())) part = +sl.num;
  else { const m = String(sl.kicker || "").match(/^(?:Câu|Phần|Chương|Mục)\s*(\d+)/i); if (m) part = +m[1]; }
  return part; }); }
function transitionsOf(deck, dflt) {
  if (THREAD) { const parts = threadOf(deck);
    return deck.slides.map((sl, i) => { if (sl.transition) return sl.transition; const pv = deck.slides[i - 1]; if (!pv) return dflt === "morph" ? "fade" : dflt;
      if (pv.type === "agenda" && sl.type === "section") return "morph";
      return parts[i] === parts[i - 1] && !THREAD_HERO.has(sl.type) && !THREAD_HERO.has(pv.type) && pv.type !== "agenda" ? "morph" : (dflt === "morph" ? "fade" : dflt); }); }
  return (deck.slides || []).map((sl, i) => { if (sl.transition) return sl.transition; if (dflt !== "morph") return dflt;
    const pv = deck.slides[i - 1]; return pv && pv.type === sl.type && MORPHABLE.has(sl.type) && (sl.type !== "chart" || (pv.kind || "bar") === (sl.kind || "bar")) ? "morph" : "fade"; });
}
// build: hiệu ứng "xuất hiện mờ dần khi bấm" GỐC của PowerPoint (p:timing, presetID 10 = Fade) — mỗi nhóm một lần bấm.
// Nguyên tắc phân đoạn (segmenting) của Mayer: người nghe chỉ thấy ý đang được nói. Ở chế độ soạn thảo và bản in, mọi ý vẫn hiện đủ.
function timingXml(groups, idOf) {
  let id = 3, par = "", bld = new Set();
  for (const names of groups) { const ids = names.map(n => idOf[n]).filter(Boolean); if (!ids.length) continue;
    let inner = "";
    ids.forEach((sp, k) => { bld.add(sp); const a = id++, b = id++, c2 = id++;
      inner += `<p:par><p:cTn id="${a}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold" grpId="0" nodeType="${k ? "withEffect" : "clickEffect"}"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>`
        + `<p:set><p:cBhvr><p:cTn id="${b}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="${sp}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>`
        + `<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="${c2}" dur="400"/><p:tgtEl><p:spTgt spid="${sp}"/></p:tgtEl></p:cBhvr></p:animEffect></p:childTnLst></p:cTn></p:par>`; });
    const o = id++, i2 = id++;
    par += `<p:par><p:cTn id="${o}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="${i2}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${inner}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>`; }
  if (!par) return "";
  return `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>${par}</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq></p:childTnLst></p:cTn></p:par></p:tnLst>`
    + `<p:bldLst>${[...bld].filter(sp => idOf._sp.has(sp)).map(sp => `<p:bldP spid="${sp}" grpId="0" animBg="1"/>`).join("")}</p:bldLst></p:timing>`;
}
// motion: MỘT chuỗi tự chạy khi vào slide (evt onBegin — người nói không phải bấm). Học từ kỹ thuật edit video giải thích (skill motion-video, mục 8):
// · vật chính có mặt ngay khung đầu: tiêu đề, kicker, ảnh nền KHÔNG có hiệu ứng ("cảnh vào trống" là lỗi);
// · lộ dần: các nhịp cách nhau ~110 ms (chữ từng từ cách 60–120 ms), cùng một hướng — trượt từ trái (chiều đọc) hoặc nổi lên;
// · vào giảm tốc (decel = power-out); khoảng lặng trước cú chốt (gap); tổng ≤ 1,8 s — quá thì nén đều, giữ tỉ lệ khoảng lặng.
const MOTION_T = new Set(["headline", "hero", "stats", "sheet", "calendar", "riskbar", "plan", "receipt", "account", "captable", "record", "cards", "steps", "checklist", "timeline", "cover", "end"]);
const MO_STEP = 110, MO_MAX = 1800;
function fxXml(fx, sp, id) { const tg = `<p:tgtEl><p:spTgt spid="${sp}"/></p:tgtEl>`, vis = `<p:set><p:cBhvr><p:cTn id="${id()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>${tg}<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>`;
  const anim = (attr, from, to, dur) => `<p:anim calcmode="lin" valueType="num"><p:cBhvr additive="base"><p:cTn id="${id()}" dur="${dur}" decel="100000" fill="hold"/>${tg}<p:attrNameLst><p:attrName>${attr}</p:attrName></p:attrNameLst></p:cBhvr><p:tavLst><p:tav tm="0"><p:val><p:strVal val="${from}"/></p:val></p:tav><p:tav tm="100000"><p:val><p:strVal val="${to}"/></p:val></p:tav></p:tavLst></p:anim>`;
  const fltAnim = (attr, from, to, dur) => `<p:anim calcmode="lin" valueType="num"><p:cBhvr><p:cTn id="${id()}" dur="${dur}" decel="100000" fill="hold"/>${tg}<p:attrNameLst><p:attrName>${attr}</p:attrName></p:attrNameLst></p:cBhvr><p:tavLst><p:tav tm="0"><p:val><p:fltVal val="${from}"/></p:val></p:tav><p:tav tm="100000"><p:val><p:fltVal val="${to}"/></p:val></p:tav></p:tavLst></p:anim>`;
  const eff = (filter, dur) => `<p:animEffect transition="in" filter="${filter}"><p:cBhvr><p:cTn id="${id()}" dur="${dur}" decel="100000"/>${tg}</p:cBhvr></p:animEffect>`;
  if (fx === "wipe") return { preset: 22, sub: 8, body: vis + eff("wipe(left)", 500) };
  if (fx === "up") return { preset: 22, sub: 4, body: vis + eff("wipe(down)", 500) };
  if (fx === "fade") return { preset: 10, sub: 0, body: vis + eff("fade", 450) };
  // hiệu ứng có TÍNH CÁCH theo world (KIT.motion) — mỗi vật vào theo cách vật thật xuất hiện:
  if (fx === "stamp") return { preset: 31, sub: 0, body: vis + anim("ppt_w", "#ppt_w*1.22", "#ppt_w", 380) + anim("ppt_h", "#ppt_h*1.22", "#ppt_h", 380) + fltAnim("style.rotation", -9, 0, 380) + eff("fade", 220) }; // con dấu đóng xuống: to → đúng cỡ, xoay về thẳng
  if (fx === "slide") return { preset: 2, sub: 8, body: vis + anim("ppt_x", "#ppt_x-0.14", "#ppt_x", 620) + eff("fade", 300) }; // container trượt theo ray / thẻ quẹt (từ trái — chiều đọc)
  if (fx === "unroll") return { preset: 22, sub: 1, body: vis + eff("wipe(up)", 600) }; // giấy hoá đơn chạy ra từ trên xuống
  if (fx === "flip") return { preset: 10, sub: 0, body: vis + anim("ppt_h", "#ppt_h*0.08", "#ppt_h", 420) + eff("fade", 250) }; // tờ lịch lật xuống
  if (fx === "pop") return { preset: 53, sub: 16, body: vis + anim("ppt_w", "#ppt_w*0.55", "#ppt_w", 360) + anim("ppt_h", "#ppt_h*0.55", "#ppt_h", 360) + eff("fade", 250) }; // nút sơ đồ bật ra
  if (fx === "slam") return { preset: 53, sub: 16, body: vis + anim("ppt_w", "#ppt_w*1.35", "#ppt_w", 450) + anim("ppt_h", "#ppt_h*1.35", "#ppt_h", 450) + eff("fade", 300) };
  return { preset: 42, sub: 0, body: vis + eff("fade", 550) + anim("ppt_x", "#ppt_x", "#ppt_x", 550) + anim("ppt_y", "#ppt_y+.035", "#ppt_y", 550) }; } // rise = Float In, quãng ngắn
function motionPlan(groups) { // [{names, fx, gap, nfx}] theo thứ tự → [{name, fx, t}] — t (ms) đã nén về ≤ MO_MAX
  const out = []; let t = 0;
  groups.forEach((g, i) => { if (!g.names.length) return; t += (out.length ? MO_STEP : 0) + (g.gap || 0); for (const nm of g.names) out.push({ name: nm, fx: g.nfx[nm] || g.fx, t, pulse: !!g.pulse }); });
  const mx = Math.max(0, ...out.map(o => o.t)); if (mx > MO_MAX) for (const o of out) o.t = Math.round(o.t * MO_MAX / mx);
  return out; }
// nhịp NHẤN sau khi dòng chốt đã hiện (Grow/Shrink 108 % rồi tự về, 2 × 200 ms) — khoảnh khắc "đây là kết luận" của video giải thích
function pulseXml(sp, t, id) { const a = id(), b = id();
  return `<p:par><p:cTn id="${a}" presetID="6" presetClass="emph" presetSubtype="0" fill="hold" grpId="1" nodeType="withEffect"><p:stCondLst><p:cond delay="${t}"/></p:stCondLst><p:childTnLst><p:animScale><p:cBhvr><p:cTn id="${b}" dur="200" autoRev="1" fill="hold"/><p:tgtEl><p:spTgt spid="${sp}"/></p:tgtEl></p:cBhvr><p:by x="108000" y="108000"/></p:animScale></p:childTnLst></p:cTn></p:par>`; }
function motionXml(groups, idOf) {
  let n = 3; const id = () => n++, bld = new Set(), pul = new Set(); let eff = "", first = true;
  for (const o of motionPlan(groups)) { const sp = idOf[o.name]; if (!sp) continue; bld.add(sp);
    const a = id(), f = fxXml(o.fx, sp, id);
    eff += `<p:par><p:cTn id="${a}" presetID="${f.preset}" presetClass="entr" presetSubtype="${f.sub}" fill="hold" grpId="0" nodeType="${first ? "afterEffect" : "withEffect"}"><p:stCondLst><p:cond delay="${o.t}"/></p:stCondLst><p:childTnLst>${f.body}</p:childTnLst></p:cTn></p:par>`; first = false;
    if (o.pulse && idOf._sp.has(sp)) { eff += pulseXml(sp, o.t + 520, id); pul.add(sp); } }
  if (!eff) return "";
  const o1 = id(), o2 = id();
  return `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>`
    + `<p:par><p:cTn id="${o1}" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst><p:par><p:cTn id="${o2}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${eff}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>`
    + `</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq></p:childTnLst></p:cTn></p:par></p:tnLst>`
    + `<p:bldLst>${[...bld].filter(sp => idOf._sp.has(sp)).map(sp => `<p:bldP spid="${sp}" grpId="0" animBg="1"/>`).join("")}${[...pul].map(sp => `<p:bldP spid="${sp}" grpId="1" animBg="1"/>`).join("")}</p:bldLst></p:timing>`;
}
async function injectMotion(z, motions) {
  for (const [i, groups] of Object.entries(motions || {})) { const f = `ppt/slides/slide${+i + 1}.xml`, file = z.file(f); if (!file || !groups.length) continue;
    let t = await file.async("string"); if (t.includes("<p:timing>")) continue; const idOf = { _sp: new Set() };
    for (const m of t.matchAll(/<(p:sp|p:pic|p:cxnSp)>\s*<p:nv\w+Pr>\s*<p:cNvPr id="(\d+)" name="([^"]*)"/g)) { idOf[m[3].replace(/&amp;/g, "&")] = m[2]; if (m[1] === "p:sp") idOf._sp.add(m[2]); }
    const x = motionXml(groups, idOf); if (x) z.file(f, t.replace("</p:sld>", x + "</p:sld>"));
  }
}
async function injectBuild(z, builds) {
  for (const [i, groups] of Object.entries(builds || {})) { const f = `ppt/slides/slide${+i + 1}.xml`, file = z.file(f); if (!file || !groups.length) continue;
    let t = await file.async("string"); const idOf = { _sp: new Set() };
    for (const m of t.matchAll(/<(p:sp|p:pic|p:cxnSp)>\s*<p:nv\w+Pr>\s*<p:cNvPr id="(\d+)" name="([^"]*)"/g)) { idOf[m[3].replace(/&amp;/g, "&")] = m[2]; if (m[1] === "p:sp") idOf._sp.add(m[2]); }
    const x = timingXml(groups, idOf); if (x) z.file(f, t.replace("</p:sld>", x + "</p:sld>"));
  }
}
async function postProcess(buf, kind, builds, motions) { // kind: một kiểu cho cả deck, hoặc mảng — kiểu riêng từng slide
  const JSZip = require("jszip"), z = await JSZip.loadAsync(buf);
  await fixSvgFallbacks(z);
  for (const f of Object.keys(z.files).filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f))) {
    const k = Array.isArray(kind) ? kind[+f.match(/slide(\d+)\.xml/)[1] - 1] : kind, xml = TRANS[k];
    if (!xml) continue; // "none"
    const t = await z.file(f).async("string");
    if (!t.includes("<p:transition") && !t.includes("p159:morph")) z.file(f, t.replace("</p:clrMapOvr>", "</p:clrMapOvr>" + xml));
  }
  await injectBuild(z, builds); await injectMotion(z, motions); // sau hiệu ứng chuyển slide (thứ tự trong p:sld: transition rồi timing), trước khi đổi tên shape ở nativeFills
  await nativeFills(z);
  await nativePictures(z);
  if (THREAD) await threadNames(z);
  return z.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

const USAGE = "Dùng: node build.js <deck.json> <out.pptx> [--theme teal|kem|son|toa|xanh|muc] [--native] [--strict] [--transition fade|push|morph|none] [--build] [--motion] [--raster]\n      node build.js <deck.json> --titles   (chỉ in mạch tiêu đề để đọc liền, không dựng)";
function fail(lines, code = 2) { console.error(lines.join("\n")); process.exit(code); }

function parseArgs(argv) {
  const pos = [], o = { strict: false, theme: null, transition: "fade" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--strict") o.strict = true;
    else if (a === "--raster") o.raster = true;
    else if (a === "--native") o.native = true;
    else if (a === "--titles") o.titles = true;
    else if (a === "--build") o.build = true;
    else if (a === "--motion") o.motion = true;
    else if (a === "--sig") o.sig = true;
    else if (a === "--theme") { o.theme = argv[++i]; if (!o.theme) fail(["✗ Cờ --theme thiếu tên theme (teal | kem | son | toa | xanh | muc)", USAGE]); }
    else if (a.startsWith("--theme=")) o.theme = a.slice(8);
    else if (a === "--transition") { o.transition = argv[++i]; if (!["fade", "push", "none", "morph"].includes(o.transition)) fail(["✗ --transition chỉ nhận fade | push | morph | none", USAGE]); }
    else if (a.startsWith("--")) fail([`✗ Cờ không hợp lệ: ${a}`, USAGE]);
    else pos.push(a);
  }
  if (o.titles ? pos.length < 1 : pos.length !== 2) fail([USAGE]);
  [o.deckPath, o.out] = pos;
  return o;
}

// --titles: "ghost deck" — chỉ đọc kicker + tiêu đề từ đầu đến cuối. Đọc liền mà không thành một lập luận
// (thiếu bước, nhảy ý, tiêu đề là nhãn) thì sửa storyboard trước khi tốn công dựng hình.
function printTitles(deck) {
  const plain = (t) => String(t || "").replace(/[\[\]]/g, "").trim();
  const sl = deck.slides || [], out = [], warn = [], seen = {};
  sl.forEach((d, i) => {
    // kiểu không có trường tiêu đề (quote: câu trích CHÍNH LÀ luận điểm) → in đầu câu trích, không báo "không có tiêu đề"
    const noTitle = LIMITS[d.type] && !("title" in LIMITS[d.type]), n = String(i + 1).padStart(2, "0"), k = plain(d.kicker || d.year);
    const t = noTitle ? (plain(d.quote).length > 70 ? "“" + plain(d.quote).slice(0, 68) + "…”" : plain(d.quote) && "“" + plain(d.quote) + "”") : plain(d.title);
    if (d.type === "section") { out.push(`\n${n}  ── PHẦN ${d.num || ""}: ${t.toUpperCase()} ──`); return; }
    out.push(`${n}  ${k ? k + " — " : ""}${t || "(không tiêu đề)"}   [${d.type}]`);
    if (!["cover", "end", "section", "quiz", "agenda"].includes(d.type) && !noTitle) {
      if (!t) warn.push(`Slide ${i + 1}: không có tiêu đề`);
      else if (/\?$/.test(t)) warn.push(`Slide ${i + 1}: tiêu đề là câu hỏi — viết câu trả lời, câu hỏi để ở kicker`);
      else if (t.split(/\s+/).length <= 3) warn.push(`Slide ${i + 1}: "${t}" giống nhãn hơn là câu kết luận (≤ 3 tiếng)`);
    }
    if (t && d.type !== "quiz") { const key = t.toLowerCase(); if (seen[key]) warn.push(`Slide ${seen[key]} và ${i + 1}: trùng tiêu đề "${t}"`); else seen[key] = i + 1; }
  });
  console.log("Mạch tiêu đề (đọc liền như một đoạn văn — mỗi dòng phải nối được với dòng trước):\n" + out.join("\n"));
  if (warn.length) console.log("\n⚠ Kiểm mạch:\n  " + warn.join("\n  "));
  else console.log("\n✓ Không thấy tiêu đề dạng nhãn / câu hỏi / trùng lặp. Còn lại: tự đọc xem lập luận có liền không.");
}

async function main() {
  const args = parseArgs(process.argv.slice(2)), { deckPath, out } = args;
  let deck;
  try { deck = JSON.parse(fs.readFileSync(deckPath, "utf8")); }
  catch (e) { fail([e.code === "ENOENT" ? `✗ Không tìm thấy file deck: ${deckPath}` : `✗ Không đọc được ${deckPath} (JSON sai cú pháp?): ${e.message}`]); }
  if (args.titles) { printTitles(deck); return; }

  if (args.raster) VECTOR = false;
  if (args.native || (deck && deck.meta && deck.meta.native === true)) NATIVE = true;
  const themeName = args.theme || (deck && deck.theme) || "teal";
  TH = THEMES[themeName];
  if (!TH) fail([`✗ Theme "${themeName}" không tồn tại (chọn: ${Object.keys(THEMES).join(" | ")})`]);

  const { errors, warnings, hints } = validate(deck, args.theme ? null : THEMES);
  if (errors.length) fail([`✗ deck.json có ${errors.length} lỗi, chưa dựng:`, ...errors.map(e => "  - " + e)]);

  const meta = deck.meta || {}, errorsLate = [];
  // hình mặc định theo loại bài: bản án → cán cân/búa toà; bài giảng → sách; meta.art ghi đè cho cả deck
  ART_KIND = meta.kind || "case"; ART_FIXED = !!meta.art;
  if (meta.art) DEF_ART = { hero: meta.art, small: meta.art, doc: meta.art };
  else if (meta.kind === "lecture") DEF_ART = { hero: "book", small: "book", doc: "book" };
  else if (meta.kind === "report") DEF_ART = { hero: "document", small: "document", doc: "document" };
  FRAME_DEF = SH.FRAME_NAMES.includes(meta.frame) ? meta.frame : null; PAPER = meta.paper === true; // khung ảnh mặc định cả deck; nền vân giấy
  PHOTO_ACCENT = meta.photoAccent !== false; // màu nhấn lấy từ ảnh ở slide ảnh (tắt: "photoAccent": false)
  // meta.motif: một tên, hoặc 2 tên ["cadastral", "lines"] — tên đầu cho bìa/chuyển phần/kết, trang nội dung xen kẽ hai tên
  MOTIF_LIST = (Array.isArray(meta.motif) ? meta.motif : [meta.motif || "none"]).filter(Boolean); MOTIF = MOTIF_LIST[0] || "none";
  DECK_DIR = path.dirname(path.resolve(deckPath));
  for (const sl of deck.slides) if (sl.photo && path.isAbsolute(sl.photo)) { const pj2 = path.join(path.dirname(sl.photo), "images.json"); if (fs.existsSync(pj2)) try { Object.assign(PHOTOS, JSON.parse(fs.readFileSync(pj2, "utf8"))); } catch (e) {} }
  const pj = path.join(DECK_DIR, "images", "images.json"); if (fs.existsSync(pj)) { try { PHOTOS = JSON.parse(fs.readFileSync(pj, "utf8")); } catch (e) { warnings.push("images/images.json hỏng: " + e.message); } }
  const POLICY = meta.imagePolicy || "classroom"; // mặc định: chỉ chiếu trên lớp (chủ dự án chọn 11/2026); đăng công khai thì đặt "open"
  for (const [i, sl] of deck.slides.entries()) for (const ph of [sl.cutout ? { photo: sl.cutout, photoCredit: sl.photoCredit, photoSource: sl.photoSource, _cut: true } : null, sl.photo ? sl : null, ...(Array.isArray(sl.photos) ? sl.photos : []), ...(Array.isArray(sl.items) ? sl.items.filter(x => x && x.photo) : []), sl.type === "beforeafter" ? sl.before : null, sl.type === "beforeafter" ? sl.after : null].filter(Boolean)) {
    if (!ph.photo) continue;
    const f = path.resolve(DECK_DIR, ph.photo);
    if (!fs.existsSync(f)) { errorsLate.push(`Slide ${i + 1} (${sl.type}): photo — không tìm thấy "${ph.photo}" (đường dẫn tính từ thư mục chứa deck.json)`); continue; }
    const md = await sharp(f).metadata(); const minW = ph._cut ? 600 : sl.type === "cards" ? 700 : ["gallery", "frame", "beforeafter", "mosaic", "photostats", "photostrip", "lens", "collage"].includes(sl.type) ? 1000 : (sl.type === "headline" || sl.type === "hero" || (sl.type === "cover" && sl.layout === "poster") || (sl.type === "end" && sl.style === "poster")) ? 2000 /* ảnh tràn viền, chữ lớn đè lên: ảnh nhỏ thì vỡ hạt khi chiếu */ : 1600; // ảnh chiếm phần nhỏ slide thì không cần 1600px /* ảnh trong khung chỉ chiếm ~nửa slide */ if ((md.width || 0) < minW) warnings.push(`Slide ${i + 1}: ảnh "${ph.photo}" chỉ rộng ${md.width}px — dưới ${minW}px sẽ mờ khi chiếu`);
    if (ph.photoSource && POLICY !== "classroom") warnings.push(`Slide ${i + 1}: ảnh "${ph.photo}" lấy từ web (${ph.photoSource}) không rõ giấy phép — chỉ hợp khi chiếu trên lớp: đặt meta.imagePolicy = "classroom"; đăng công khai thì thay bằng ảnh giấy phép mở (references/image-sources.md)`); // chỉ xảy ra khi deck đặt rõ "open"
    else if (!creditOf(ph.photo, ph)) warnings.push(`Slide ${i + 1}: ảnh "${ph.photo}" thiếu thông tin ghi công (để đưa vào bản Word) — thêm "photoSource" (trang gốc), "photoCredit", hoặc tải bằng scripts/find_images.py / fetch_image.py (tự ghi images.json)`);
  }
  { // ảnh cùng MỘT bài báo / trang nguồn ở nhiều slide → deck trông như minh hoạ một sự kiện; mỗi bài nguồn tối đa 1 ảnh (người dùng 11/2026)
    const bySrc = {}; for (const [i, sl] of deck.slides.entries()) for (const ph of [sl.photo ? sl : null, ...(Array.isArray(sl.photos) ? sl.photos : []), ...(Array.isArray(sl.items) ? sl.items.filter(x => x && x.photo) : [])].filter(Boolean)) {
      const src = ph.photoSource || (PHOTOS[path.basename(String(ph.photo))] || {}).source; if (src && /^https?:/.test(src)) (bySrc[src] = bySrc[src] || new Set()).add(i + 1); }
    for (const [src, ss] of Object.entries(bySrc)) if (ss.size > 1) warnings.push(`${ss.size} ảnh lấy từ CÙNG một trang nguồn (slide ${[...ss].join(", ")}: ${src.slice(0, 80)}) — mỗi bài nguồn tối đa 1 ảnh; tìm ảnh khác đúng brief của từng slide`); }
  if (POLICY === "classroom") console.log('ℹ imagePolicy "classroom": deck có thể chứa ảnh web không rõ giấy phép — CHỈ chiếu trên lớp (ngoại lệ sử dụng hợp lý cho giảng dạy), KHÔNG đăng công khai.');
  if (errorsLate.length) fail([`✗ deck.json có ${errorsLate.length} lỗi, chưa dựng:`, ...errorsLate.map(e => "  - " + e)]);
  const deckDir = path.dirname(path.resolve(deckPath));
  if (meta.logo) {
    if (!path.isAbsolute(meta.logo)) meta.logo = path.resolve(deckDir, meta.logo);
    if (!fs.existsSync(meta.logo)) { warnings.push(`meta.logo: không tìm thấy file "${meta.logo}" (đường dẫn tương đối tính từ thư mục chứa deck.json) — slide bìa sẽ không có logo`); meta.logo = null; }
  }
  if (meta.notesFile) {
    const nf = path.resolve(deckDir, meta.notesFile);
    if (!fs.existsSync(nf)) warnings.push(`meta.notesFile: không tìm thấy file "${nf}" — bỏ qua ghi chú`);
    else {
      const parts = fs.readFileSync(nf, "utf8").replace(/\r\n?/g, "\n").split(/\n---\n/);
      if (parts.length > 1 && !parts[parts.length - 1].trim()) parts.pop();
      const notes = parts.map(b => b.replace(/^\s*#.*\n/, "").trim());
      if (notes.length !== deck.slides.length) warnings.push(`Ghi chú: "${meta.notesFile}" có ${notes.length} phần (cách nhau bằng dòng ---) nhưng deck có ${deck.slides.length} slide`);
      deck.slides.forEach((sl, i) => { if (!sl.notes && notes[i]) sl.notes = notes[i]; });
    }
  }
  deck.slides.forEach(sl => { if (sl.timeline && sl.timeline.ref) sl.timeline.points = (deck.timelines || {})[sl.timeline.ref] || []; });

  // ghi chú thuyết trình: thiếu ở slide nào, nói hết bao lâu (~160 tiếng/phút khi thuyết trình tiếng Việt)
  const withNotes = deck.slides.filter(sl => sl.notes && String(sl.notes).trim());
  if (withNotes.length && withNotes.length < deck.slides.length) warnings.push(`Ghi chú thuyết trình thiếu ở slide ${deck.slides.map((sl, i) => (sl.notes && String(sl.notes).trim()) ? null : i + 1).filter(Boolean).join(", ")}`);
  const syl = withNotes.reduce((a, sl) => a + String(sl.notes).split(/\s+/).filter(Boolean).length, 0);
  // thời gian HOẠT ĐỘNG trên lớp (lớp tự làm bài, chọn đáp án) không nằm trong ghi chú → cộng riêng: activitySec, mặc định exercise 120 s, quiz hỏi 60 s
  const actSec = deck.slides.reduce((a, sl) => a + (!sl ? 0 : sl.activitySec != null ? +sl.activitySec || 0 : sl.type === "exercise" ? 120 : sl.type === "quiz" && sl.reveal !== true ? 60 : 0), 0);
  const talkMin = syl / 160 + actSec / 60;
  // ĐỐI CHIẾU DÀN Ý: mỗi đề mục lá của tài liệu (scripts/outline.py) phải có slide trình bày ("covers") hoặc lý do bỏ (meta.skip)
  if (meta.outline) {
    let ol = meta.outline;
    if (typeof ol === "string") { const f = path.resolve(DECK_DIR, ol); try { ol = JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { warnings.push(`meta.outline: không đọc được "${f}" — chạy: python3 scripts/outline.py <tài liệu> ${meta.outline}`); ol = []; } }
    const ids = new Set(ol.map(o => String(o.id))), skip = meta.skip || {}, cov = new Map();
    deck.slides.forEach((sl, i) => (Array.isArray(sl.covers) ? sl.covers : []).forEach(id => { id = String(id);
      if (!ids.has(id)) warnings.push(`Slide ${i + 1}: covers "${id}" không có trong dàn ý (xem outline.json)`); (cov.get(id) || cov.set(id, []).get(id)).push(i + 1); }));
    const isChild = (a, b) => a.startsWith(b + ".") || (b.startsWith("P") && a.split(".")[0] === b.slice(1)); // a thuộc b
    const leaves = ol.filter(o => o.words > 0 && !ol.some(p => p !== o && isChild(String(p.id), String(o.id)) && p.words > 0));
    const covered = (id) => [...cov.keys()].some(k => k === id || isChild(id, k)) || Object.keys(skip).some(k => k === id || isChild(id, k));
    const miss = leaves.filter(o => !covered(String(o.id)));
    const tot = leaves.reduce((a, o) => a + o.words, 0) || 1, missW = miss.reduce((a, o) => a + o.words, 0);
    console.log(`ℹ Đối chiếu dàn ý: ${leaves.length - miss.length}/${leaves.length} mục có slide hoặc lý do bỏ (${Math.round(100 * (1 - missW / tot))}% nội dung tài liệu)` + (Object.keys(skip).length ? `; bỏ có chủ đích: ${Object.entries(skip).map(([k, v]) => k + " (" + v + ")").join("; ")}` : ""));
    for (const o of miss) warnings.push(`Dàn ý: mục ${o.id} "${String(o.title).slice(0, 50)}" (${o.words} chữ, ${Math.round(100 * o.words / tot)}% tài liệu) chưa có slide nào — thêm "covers": ["${o.id}"] vào slide trình bày nó, hoặc ghi lý do vào meta.skip`);
    // mục chiếm nhiều chữ mà chỉ được 1 dòng trong một slide tổng hợp → gợi ý tách
    for (const o of leaves) { const n = (cov.get(String(o.id)) || []).length; if (n && o.words / tot > 0.12 && n < 2) hints.push(`Dàn ý: mục ${o.id} chiếm ${Math.round(100 * o.words / tot)}% tài liệu nhưng chỉ có 1 slide — cân nhắc tách 2 slide`); }
  }
  if (meta.minutes) { // thời lượng: ~40–65 giây/slide; ghi chú ~160 tiếng/phút
    const m = +meta.minutes, n = deck.slides.length, lo = Math.ceil(m * 0.9), hi = Math.floor(m * 1.5); // làm tròn VÀO TRONG khoảng (13 phút: 12–19, không phải 12–20)
    if (n < lo || n > hi) warnings.push(`meta.minutes = ${m} phút → nên có ${lo}–${hi} slide (40–65 giây/slide), deck đang có ${n} — ${n < lo ? "thiếu: nội dung bị nén, người nghe không theo kịp; tách các slide dày" : "thừa: gộp các slide cùng ý"}`);
    if (syl && Math.abs(talkMin - m) / m > 0.25) warnings.push(`Ghi chú thuyết trình + hoạt động ~${Math.round(talkMin)} phút nhưng meta.minutes = ${m} — viết lại ghi chú cho khớp thời lượng (±25%)`);
  }
  if (syl) console.log(`ℹ Thời lượng ước tính: ~${Math.max(1, Math.round(talkMin))} phút (nói ${syl} tiếng ≈ ${Math.round(syl / 160)} phút, ~160 tiếng/phút${actSec ? ` + hoạt động trên lớp ${Math.round(actSec / 60)} phút` : ""})`);
  // BƯỚC 0 — GÓI CHUẨN BỊ (prep.json, scripts/prep.py): loại bài, nguồn đã kiểm hiệu lực, ảnh/hình cần, kế hoạch type từng slide.
  // Bắt buộc với mọi deck: thiếu hoặc chưa được NGƯỜI DÙNG duyệt → cảnh báo (--strict dừng). Dựng nháp (không --strict) vẫn được để xem trước.
  // SLIDE_CHUAN_NO_PREP=1 chỉ dành cho bộ test của engine.
  if (process.env.SLIDE_CHUAN_NO_PREP !== "1") {
    const pf = path.resolve(DECK_DIR, meta.prep || "prep.json"), K = "python3 scripts/prep.py";
    if (!fs.existsSync(pf)) warnings.push(`Bước 0: chưa có gói chuẩn bị "${path.basename(pf)}" — chạy: ${K} init ${path.relative(process.cwd(), DECK_DIR) || "."} --kind lecture|case|report, điền rồi gửi người dùng duyệt (SKILL.md bước 0)`);
    else { let pr = null; try { pr = JSON.parse(fs.readFileSync(pf, "utf8")); } catch (e) { warnings.push(`Bước 0: ${pf} hỏng (${e.message})`); }
      if (pr) {
        if (pr.approved !== true) warnings.push(`Bước 0: gói chuẩn bị chưa được người dùng duyệt — gửi bản tóm tắt (${K} summary <thư_mục_deck>), chỉ chạy "${K} approve" sau khi người dùng đồng ý`);
        if (pr.kind && meta.kind && pr.kind !== meta.kind) warnings.push(`Bước 0: prep.kind = "${pr.kind}" nhưng meta.kind = "${meta.kind}" — thống nhất loại bài`);
        if (!meta.kind && pr.kind) meta.kind = pr.kind;
        if (pr.minutes && meta.minutes && +pr.minutes !== +meta.minutes) warnings.push(`Bước 0: thời lượng lệch — prep.json ${pr.minutes} phút, meta.minutes ${meta.minutes} phút; sửa cho khớp (người dùng duyệt theo prep.json)`);
        (pr.sources || []).forEach((x, j) => { if (x && x.legal && !x.status) warnings.push(`Bước 0: sources[${j}] "${String(x.title || "").slice(0, 50)}" là văn bản pháp luật nhưng chưa ghi "status" (hiện hành / hết hiệu lực / dự thảo / chưa kiểm)`); });
        const miss = ((pr.assets || {}).missing || []).filter(Boolean);
        if (miss.length) hints.push(`Bước 0: hình engine chưa có (${miss.join("; ")}) — deck này dùng cách thể hiện khác; ghi lại để bổ sung engine sau, không sửa engine giữa lúc làm deck`);
        const plan = Array.isArray(pr.plan) ? pr.plan : [];
        if (plan.length && Math.abs(plan.length - deck.slides.length) / plan.length > 0.25) warnings.push(`Bước 0: kế hoạch duyệt ${plan.length} slide nhưng deck có ${deck.slides.length} — lệch > 25%: cập nhật prep.json và báo người dùng`);
        if (plan.length) { const diff = plan.map((q, i) => q && q.type && deck.slides[i] && deck.slides[i].type !== q.type ? `${i + 1}: ${q.type}→${deck.slides[i].type}` : null).filter(Boolean);
          if (diff.length) hints.push(`Bước 0: ${diff.length} slide đổi type so với kế hoạch (${diff.slice(0, 6).join(", ")}${diff.length > 6 ? "…" : ""}) — nêu lý do khi báo người dùng`); }
      } }
  }
  const lim = checkLimits(deck.slides);
  if (lim.length) console.warn("⚠ Vượt giới hạn ký tự (rút gọn để tránh tràn):\n  " + lim.join("\n  "));
  if (warnings.length) console.warn("⚠ Cảnh báo nội dung/cấu trúc:\n  " + warnings.join("\n  "));
  if (hints && hints.length) console.log("ℹ Gợi ý nội dung (không chặn --strict):\n  " + hints.join("\n  "));

  KIT_NAME = meta.kit === "none" ? null : KITMOD.NAMES.includes(meta.kit) ? meta.kit : (meta.kit == null || meta.kit === "auto") ? KITMOD.AUTO[meta.kind] || null : null;
  KIT = KIT_NAME ? KITMOD.KITS[KIT_NAME] : null;
  if (KIT && (KIT.palette || KIT.font)) { // WORLD: ghi đè màu trang sáng + font tiêu đề (chỉ font Office) — cả deck đổi "chất", không chỉ đổi chữ
    TH = Object.assign({}, TH, KIT.font ? { titleFont: KIT.font.title || TH.titleFont, titleBold: KIT.font.titleBold != null ? KIT.font.titleBold : TH.titleBold } : {});
    if (KIT.palette) TH.l = Object.assign({}, TH.l, KIT.palette, KIT.page ? { bg: KIT.page } : {});
    if (KIT.palette && KIT.palette.acc) TH.d = Object.assign({}, TH.d, { bg: mix(KIT.palette.acc, "000000", 0.55), deep: mix(KIT.palette.acc, "000000", 0.65), card: mix(KIT.palette.acc, "000000", 0.45), line: mix(KIT.palette.acc, "FFFFFF", 0.25) }); }
  if (KIT && KIT.art && !meta.art) DEF_ART = { hero: KIT.art, small: KIT.art, doc: KIT.art }; // hình mặc định của thế giới (mục lục, kết, cảm ơn)
  THREAD = meta.thread === true; SEC_NUM = {}; deck.slides.forEach((sl, i) => { if (sl && sl.type === "section" && /^\d+$/.test(String(sl.num || "").trim())) SEC_NUM[i + 1] = +sl.num; }); // meta.kit: file | paper | glass | none | auto (mặc định: theo meta.kind)
  pres = new pptxgen(); pres.layout = "LAYOUT_WIDE";
  pres.theme = { headFontFace: TH.titleFont, bodyFontFace: TH.bodyFont };
  pres.title = meta.title || ""; pres.author = meta.author || "";
  const n = deck.slides.length, fit = [];
  // tên các phần: lấy từ slide mở đầu phần (section: num + title; photo: kicker "Phần N · Tên")
  const PRE = /^(Câu|Phần|Chương|Mục)\s*(\d+)\s*(?:[·:.\-–—]\s*)?/i;
  // từ gọi đơn vị điều hướng: thanh trên cùng in "PHẦN 1 · …" theo kicker → slide mở phần phải dùng CÙNG từ (trước đây cứng "Chương")
  { const kw = deck.slides.map(q => (String((q && q.kicker) || "").match(/^(Phần|Chương)\s*\d+/i) || [])[1]).filter(Boolean);
    PART_WORD = meta.partWord || (kw.length ? kw[0][0].toUpperCase() + kw[0].slice(1).toLowerCase() : "Chương"); }
  for (const d of deck.slides) {
    if (d.type === "section" && /^\d+$/.test(String(d.num || "").trim())) PARTS[+d.num] = String(d.part || d.title || "").replace(/[\[\]]/g, ""); // part: tên chương NGẮN cho thanh điều hướng / dải tiến độ khi title là câu hỏi dài
    const m = String(d.kicker || "").match(PRE); if (m && d.type === "photo" && !PARTS[+m[2]]) PARTS[+m[2]] = String(d.kicker).slice(m[0].length);
  }
  // slide cuối: "Điều cần nhớ" = tiêu đề slide closing (câu kết luận của cả bài)
  { const cl = deck.slides.find(q => q && q.type === "closing"); if (cl) deck.slides.forEach(q => { if (q && q.type === "end" && q.message == null) q._message = cl.title; }); }
  // "Trong chương này": mỗi section tự gom 2–4 tiêu đề slide thuộc chương (tới section / closing / end kế tiếp)
  deck.slides.forEach((d, i) => { if (!d || d.type !== "section" || Array.isArray(d.inside)) return; const out = [];
    for (let j = i + 1; j < deck.slides.length; j++) { const q = deck.slides[j]; if (!q || ["section", "closing", "end"].includes(q.type)) break;
      if (q.type === "quiz" && q.reveal === true) continue; // đáp án / lời giải không được lộ trước khi lớp làm bài
      if (deck.slides[j - 1] && deck.slides[j - 1].type === "exercise" && ["checklist", "calc", "table", "steps", "bignum"].includes(q.type)) continue; const t = String(q.title || "").replace(/[\[\]]/g, "").trim(); if (t && !out.includes(t)) out.push(t); }
    d._inside = out.slice(0, 4); });
  deck.slides.forEach((d, i) => { const p = deck.slides[i - 1]; // quiz: slide hỏi giữ chỗ cho whyNot của slide đáp án → thẻ không nhảy khi chuyển slide
    if (d && d.type === "quiz" && d.reveal === true && Array.isArray(d.whyNot) && p && p.type === "quiz" && p.reveal !== true && p.title === d.title) p._whyNot = d.whyNot; });
  for (const [i, d0] of deck.slides.entries()) {
    // trang nội dung: thanh trên cùng đã ghi "PHẦN N · TÊN" → kicker bỏ tiền tố "Phần N ·" cho khỏi lặp
    const km = String(d0.kicker || "").match(PRE); let d = km && !["photo", "section", "cover"].includes(d0.type) ? Object.assign({}, d0, { _kick0: d0.kicker, kicker: String(d0.kicker).slice(km[0].length) || undefined }) : d0;
    if (d.takeaway) d = Object.assign({}, d, { note: d.takeaway }); // câu chốt chiếm hàng chú thích → bố cục tự chừa chỗ như note (validate cấm dùng cùng note)
    const mode = d.mode || DEF_MODE[d.type] || "l", c = TH[mode];
    const s = pres.addSlide(); s.background = { color: c.bg };
    beginSlide(i + 1, d, meta); FOCUS = ["top", "center", "bottom"].includes(d.photoFocus) ? d.photoFocus : null; CUR.take = d.takeaway || null;
    trackSlide(s, c.bg);
    await decor(s, c, mode, d.type);
    const full = d.type === "photo" || d.type === "photostats" || d.type === "hero" || d.type === "headline" || (d.type === "closing" && !!d.photo); CUR.heroPhoto = d.type === "hero" && !!d.photo; CUR.closingPhoto = d.type === "closing" && !!d.photo; // ảnh tràn mép trên: vẽ thanh trên cùng SAU ảnh để không bị che
    if (!["cover", "section", "end"].includes(d.type) && !full) await chrome(s, c, meta, i + 1, n);
    CUR.inBody = true; CUR.mode = mode;
    BUILD_ON = BUILDABLE.has(d.type) && (d.build != null ? d.build === true : !!(args.build || meta.build));
    MOTION_ON = !BUILD_ON && MOTION_T.has(d.type) && (d.motion != null ? d.motion === true : !!(args.motion || meta.motion));
    await L[d.type](s, c, d, meta);
    CUR.inBody = false; if (BUILD_ON) BUILDS[i] = Object.keys(CUR.build).sort((a, b) => a - b).map(k => CUR.build[k]);
    if (MOTION_ON) { const ks = Object.keys(CUR.mo).sort((a, b) => a - b); // nhịp vẽ tay (mo) — nếu không có, mỗi ý của steps/cards/checklist/timeline là một nhịp nổi lên
      const gs = ks.length ? ks.map(k => CUR.mo[k]) : Object.keys(CUR.build).sort((a, b) => a - b).map((k, j, all) => ({ names: CUR.build[k], fx: (KIT && KIT.fits && KIT.motion) || "rise", gap: d.type === "checklist" && d.verdict && j === all.length - 1 ? 350 : 0, nfx: {} }));
      if (gs.some(g => g.names.length)) MOTIONS[i] = gs; }
    BUILD_ON = false; MOTION_ON = false; CUR.mk = 0;
    const PHOTO_T = ["photo", "split", "gallery", "frame", "beforeafter", "mosaic", "photostats", "photostrip", "iso", "isotype", "hero", "headline", "lens", "collage"];
    const kitSlide = KIT && c === TH.l && !["cover", "section", "end", "closing", "quote"].includes(d.type) && !PHOTO_T.includes(d.type) && !CUR.noMotif;
    if (d.pin && !["cover", "section", "end"].includes(d.type)) await kitPin(s, c, d.pin); // trước đồ vật tiền cảnh: đồ vật né tờ giấy
    // vật vắt mép = điểm nhấn của "thẻ chính" → KHÔNG đặt khi slide đã có điểm nhấn riêng: focus / đáp án / bên đang áp dụng (băng dính từng rơi vào phương án SAI ở quiz,
    // vào bên luật CŨ ở compare), khối nền đậm, vòng khoanh tay (bignum), hoặc bảng (dải đầu bảng màu đậm). match: các thẻ ngang hàng.
    const MARK_SKIP = new Set(["match", "quiz", "compare", "duel", "table", "bignum", "statement", "tree", "hub", "changelog", "cheatsheet", "ledger"]);
    if (kitSlide && !d.pin && !MARK_SKIP.has(d.type) && d.focus == null) { await kitMark(s, c); // motion: vật vắt mép thẻ hiện CÙNG thẻ đầu tiên (không lơ lửng trước khi thẻ vào)
      const g0 = MOTIONS[i] && MOTIONS[i].find(g => g.names.length); if (g0 && CUR.markName) g0.names.push(CUR.markName); } // đã có giấy ghim = điểm nhấn của slide → không đánh dấu thêm thẻ chính (mỗi slide MỘT điểm nhấn)
    const heroCover = d.type === "cover" || CUR.noMotif || kitSlide; // trang nội dung có bộ chất liệu: đồ vật tiền cảnh thay hoạ tiết nền
    if (kitSlide) await kitProp(s, c); // noMotif: bố cục đã có mảng hình lớn riêng (section kiểu mới, end kiểu mới) // bìa luôn có hình lớn riêng (ảnh, tranh theo motif, hoặc mảng hoạ tiết lớn) — không thêm mảnh nhỏ
    if (c === TH.l && !heroCover && !["photo", "split", "gallery", "frame", "beforeafter", "mosaic", "photostats", "photostrip", "iso", "isotype", "headline", "lens", "collage", "hero"].includes(d.type) /* iso, isotype: cả slide đã là hình vẽ — thêm hoạ tiết là rối */ && !((d.type === "section" || d.type === "end") && d.photo) && !(d.type === "section" && MOTIF === "landscape") && !(d.type === "end" && d.art !== "none") /* slide kết đã có hình minh hoạ: thêm hoạ tiết là hai hình tranh chỗ */)
      await bgMotif(s, c, ["section", "closing", "cover", "end"].includes(d.type) ? "hero" : "content");
    if (full && KIT && KIT.fits && KIT.frame) await worldFrame(s, Object.assign({}, TH.l, { acc: mix(TH.l.acc, "FFFFFF", 0.72), bad: mix(TH.l.bad, "FFFFFF", 0.35) }), KIT.frame, d.type); // trên ảnh: khung màu SÁNG — màu nhấn đậm chìm vào ảnh tối // ảnh tràn viền che khung nền → vẽ lại khung world TRÊN ảnh (băng cảnh báo, viền đôi, răng cưa…)
    if (full) await chrome(s, c, meta, i + 1, n);
    if (d.notes) s.addNotes(d.notes);
    if (["sheet", "calendar", "riskbar", "plan", "receipt", "account", "captable", "record"].includes(d.type) && KIT && KIT.fits) sig("meso", "khối chính " + d.type);
    if (CUR.props && CUR.props.length) sig("meso", "đồ vật");
    if (args.sig) SIGS.push(`Slide ${i + 1} (${d.type}): ` + ["macro", "meso", "micro"].map(k => `${k}[${[...CUR.sig[k]].join(", ")}]`).join(" "));
    fit.push(...checkSlide(), ...checkSpace(), ...checkTextOverlap(), ...checkDeco(), ...FLOW_CROSS.splice(0), ...lintSig(d, c));
  }
  for (const [nm, ss] of Object.entries(ART_USE)) if (ss.size >= 3) fit.push({ kind: "art", msg: `Hình "${nm}" lặp ở ${ss.size} slide nội dung (${[...ss].join(", ")}) — hình phải nói về đúng slide đó: đổi "art" (${Object.keys(ART).filter(k => !ART_INTERNAL.has(k) && !["landscape"].includes(k)).join(", ")}), dùng "cutout"/ảnh thật, hoặc "art": "none"` });
  if (FA_USED.size) console.log(`ℹ Icon Font Awesome Free (CC BY 4.0 — https://fontawesome.com/license/free) đang dùng: ${[...FA_USED].join(", ")} — ghi công ở bản Word (danh sách trong file *_ghi-cong.md), hoặc đổi sang Phosphor (Pi…Duotone) / Lucide (Lu…) / Tabler (Tb…) để khỏi phải ghi`);
  if (CREDITS.length) console.log("ℹ Ảnh đã dùng (ghi công trong bản Word — danh sách đầy đủ ở file *_ghi-cong.md):\n  " + CREDITS.map(c => `Slide ${c.slide}: ${c.text}${c.source ? " — " + c.source : ""}`).join("\n  "));
  const lows = fit.filter(w => w.kind === "contrast");
  if (lows.length) console.warn("⚠ Chữ không đủ tương phản (khó đọc khi trình chiếu):\n  " + lows.map(w => w.msg).join("\n  "));
  const fits = fit.filter(w => w.kind === "fit"), titles = fit.filter(w => w.kind === "title");
  if (fits.length) console.warn("⚠ Chữ không vừa khung (đo bằng font thật; rút gọn đúng trường nêu):\n  " + fits.map(w => w.msg).join("\n  "));
  if (titles.length) console.warn("⚠ Tiêu đề quá dài:\n  " + titles.map(w => w.msg).join("\n  "));
  const crosses = fit.filter(w => w.kind === "cross" || w.kind === "art");
  if (crosses.length) console.warn("⚠ Hình vẽ (đường cắt nhau / hình lặp):\n  " + crosses.map(w => w.msg).join("\n  "));
  const gaps = fit.filter(w => w.kind === "gap"), spaces = fit.filter(w => w.kind === "space");
  if (gaps.length) console.warn("⚠ Chữ đè nhau / khối sát nhau:\n  " + gaps.map(w => w.msg).join("\n  "));
  // dư khoảng trống: GỢI Ý (không tính vào --strict) — engine đã tự giãn bố cục; còn trống là do ít nội dung:
  // gộp với slide bên cạnh hoặc đổi type, KHÔNG nhồi thêm chữ cho đầy.
  // mù màu đỏ–lục (~8% nam giới): slide phân biệt tốt/xấu CHỈ bằng màu, mà ở theme này hai màu gần như trùng khi giả lập (engine/cvd.js)
  { const { minDE } = require("./cvd"), L0 = TH.l, bad = [];
    const pairs = [["good", L0.good, L0.bad], ["acc", L0.acc, L0.bad]].filter(([, a, b]) => minDE(a, b) < 15);
    if (pairs.length) deck.slides.forEach((d, i) => { if (d.type === "chart" && ["bar", "column", "span", "progress", "slope"].includes(d.kind || "bar") && (d.items || []).some((it, k) => it && it.tone === "bad" && !/[−-]/.test(String(it.display || "")) && !(d.annotate && d.annotate.item === k) /* chú thích tay = tín hiệu ngoài màu */)) bad.push(i + 1); });
    if (bad.length) console.log(`ℹ Mù màu đỏ–lục: theme "${themeName}" — màu ${pairs.map(p => p[0] === "good" ? "tốt/xấu" : "nhấn/xấu").join(", ")} gần như trùng khi giả lập (ΔE < 15). Slide ${bad.join(", ")} phân biệt mục "bad" chỉ bằng màu — thêm dấu "−" / chữ ("mất 350") vào display, hoặc annotate, hoặc đổi theme (xanh, muc phân biệt rõ nhất).`); }
  const sigs = fit.filter(w => w.kind === "sig"), sigw = fit.filter(w => w.kind === "sigw");
  if (SIGS.length) console.log("ℹ Dấu hiệu world theo cỡ (--sig):\n  " + SIGS.join("\n  "));
  if (sigs.length) console.log("ℹ Dấu hiệu world (che chữ vẫn phải đoán được chủ đề):\n  " + sigs.map(w => w.msg).join("\n  "));
  if (sigw.length) console.warn("⚠ Slide gần như không mang dấu hiệu world:\n  " + sigw.map(w => w.msg).join("\n  "));
  if (spaces.length) console.log("ℹ Gợi ý bố cục (dư khoảng trống — gộp slide/đổi type, không nhồi chữ):\n  " + spaces.map(w => w.msg).join("\n  "));
  if (NOFONT.size) console.warn(`⚠ KHÔNG ĐO ĐƯỢC CHỮ: không tìm thấy file font (${[...NOFONT].join(", ")}; cần Carlito/Liberation hoặc Calibri/Arial/Times New Roman) — lớp kiểm "chữ vừa khung" bị bỏ qua, chỉ còn giới hạn ký tự. Cài Carlito + Liberation (Linux) hoặc Calibri/Arial/Times New Roman.`);
  const total = lim.length + warnings.length + fit.filter(w => w.kind !== "space" && w.kind !== "sig").length;
  // tách cảnh báo "Bước 0" (gói chuẩn bị chưa duyệt — việc của NGƯỜI DÙNG) khỏi phần còn lại: biết ngay bản nháp đã sạch chưa
  { const step0 = warnings.filter(w => /^Bước 0/.test(w)).length;
    if (step0 && total > step0) console.log(`ℹ Ngoài Bước 0 (chờ người dùng duyệt), còn ${total - step0} cảnh báo chặn --strict — sửa trước khi gửi duyệt`);
    else if (step0 && total === step0) console.log("ℹ Ngoài Bước 0 (chờ người dùng duyệt), deck đã sạch — duyệt xong là qua --strict"); }
  if (total && args.strict) { console.error(`✗ --strict: ${total} cảnh báo, không ghi file.`); process.exit(1); }

  const buf = await pres.write({ outputType: "nodebuffer" });
  fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
  fs.writeFileSync(out, await postProcess(buf, transitionsOf(deck, args.transition), BUILDS, MOTIONS));
  // GHI CÔNG: slide không in nguồn; giấy phép CC BY / BY-SA (ảnh) và CC BY 4.0 (icon Font Awesome) vẫn bắt buộc ghi công → một file Markdown cạnh .pptx để dán vào bản Word
  const credPath = out.replace(/\.pptx$/i, "") + "_ghi-cong.md";
  if (CREDITS.length || FA_USED.size) {
    const L = ["# Ghi công ảnh và icon", "", "Dán vào phần tài liệu tham khảo / ghi công của bản Word đi kèm bài thuyết trình.", ""];
    if (CREDITS.length) { L.push("## Ảnh", ""); for (const c of CREDITS) L.push(`- Slide ${c.slide}: ${c.text}${c.source ? " — " + c.source : ""}`); L.push(""); }
    if (FA_USED.size) L.push("## Icon", "", `- Font Awesome Free (CC BY 4.0 — https://fontawesome.com/license/free): ${[...FA_USED].join(", ")}`, "");
    fs.writeFileSync(credPath, L.join("\n")); console.log(`ℹ Ghi công ảnh/icon: ${credPath}`);
  }
  console.log(`✓ ${out} — ${n} slide, theme "${themeName}"${total ? `, ${total} cảnh báo` : ""}`);
}
if (require.main === module) main().catch(e => { console.error("✗", e.message); process.exit(1); });
module.exports = { analyzePhoto, _setDeckDir: (d) => { DECK_DIR = d; } };
