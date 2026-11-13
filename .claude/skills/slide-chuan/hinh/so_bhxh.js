// TẦNG HÌNH ẢNH — BỘ HÌNH "BÀN HỒ SƠ BHXH" cho đề tài bảo hiểm xã hội (vẽ bằng SVG/CSS, không dùng hình dán có sẵn).
// Ẩn dụ: mặt bàn lót da có chỉ khâu, đèn bàn chiếu chéo; trên bàn là cuốn sổ BHXH, tờ rời "quá trình đóng", bút máy, xu, con dấu gỗ.
//
// MÁY QUAY: mọi vật có toạ độ trên MẶT BÀN (thế giới 1920×1080 khi máy quay ở chuẩn). Mỗi slide khai báo máy quay
// { x, y, z } = điểm mặt bàn nằm giữa màn hình + độ phóng. Vật giữ nguyên tên Morph ở mọi slide, nên chuyển slide
// thành lia / zoom máy quay thật (PowerPoint nội suy vị trí + cỡ). Vật được "cầm lên" (tờ rời kéo ra) khai báo toạ độ màn hình.
// Không hiệu ứng vào nào (bài học bộ hình sự: nhiều thứ cùng động = rối) — chuyển động chỉ đến từ Morph có nghĩa.
//
//   bhbia   bìa: tiêu đề trên mặt bàn, sổ BHXH đóng, tờ rời thò ra dưới sổ, bút, xu, con dấu
//   bhmo    sổ mở: bìa lật sang trái thành trang thông tin (phạm vi bài), trang phải in câu kết luận + các mốc đóng dấu
//   bhcot   zoom vào tờ rời kéo ra giữa bàn: biểu đồ cột in trên tờ, mốc nguyên nhân tại năm, dải giai đoạn, thẻ kết luận kẹp mép
//   bhket   lùi máy quay: sổ gấp lại, tờ rời cất vào; lời cảm ơn + nhóm
//
// Mọi tên lớp CSS bắt đầu bằng "bh-". Mã màu tránh các mã gốc của bảng "son" (bộ đổi màu của da không được đụng tới).
const { wrap, kit } = require("../stage/templates");
const { handMarks } = require("../engine/codeart");
const { esc, f } = kit;

const TYPES = ["bhbia", "bhdo", "bhtang", "bhba", "bhchuong", "bhtrich", "bhvaitro", "bhnhom", "bhmorong", "bhrutngan", "bhduong", "bhphieu5", "bhcongthuc", "bhcot2", "bhche", "bhquy", "bhrut", "bhmat", "bhdat", "bhhanche", "bhkiennghi", "bhhoi", "bhtraloi", "bhghinho", "bhmo", "bhcot", "bhket"];
const HAI_BUOC = new Set(["bhmorong", "bhrutngan", "bhquy", "bhmat", "bhcongthuc", "bhcot2", "bhrut", "bhdat"]);   // một slide deck.json → 2 slide PowerPoint (bấm sang bước 2): thay đổi nằm trong chính slide
const V = require("./bhxh_vat");
let U = 0; const uid = (p) => `${p}${++U}`;
const tx = (s) => f(s).replace(/\n/g, "<br>");
const num = (v, d = 2) => (typeof v === "number" ? v.toFixed(d).replace(".", ",") : String(v ?? ""));

// ---------- bảng màu của thế giới (không trùng mã gốc của bảng "son") ----------
const M = { ink: "1d2b44", ivory: "f3ead6", paper: "f6efdf", paper2: "ece2c9", green: "276a58", green2: "1b4e40", gold: "d8b35e", gold2: "9b7428", red: "b8322a", navy: "16202f", mute: "9aa3b2" };

// ---------- MÁY QUAY ----------
const SW = 1920, SH = 1080;
const cam = (c = {}) => ({ x: c.x ?? SW / 2, y: c.y ?? SH / 2, z: c.z ?? 1 });
const chieu = (c, o) => ({ x: (o.x - c.x) * c.z + SW / 2, y: (o.y - c.y) * c.z + SH / 2, w: o.w * c.z, h: o.h * c.z, r: o.r || 0 });
// lớp ảnh: name (data-l), m (tên Morph), rect màn hình, svg bên trong; bóng đổ hai lớp theo cỡ (đèn ở góc trên trái)
const lop = (name, R, inner, o = {}) => { const k = Math.max(0.6, (o.k ?? R.w / 600)), sh = o.shadow === false ? "" : `filter:drop-shadow(${(2 * k).toFixed(1)}px ${(3 * k).toFixed(1)}px ${(2.5 * k).toFixed(1)}px rgba(4,8,14,.5)) drop-shadow(${(16 * k).toFixed(1)}px ${(26 * k).toFixed(1)}px ${(26 * k).toFixed(1)}px rgba(4,8,14,.42));`;
  return `<div class="bh-l" data-l="${name}"${o.m ? ` data-m="${o.m}" data-mt="0"` : ""}${o.go ? ` data-go="${o.go}"` : ""} data-pad="${Math.round(o.pad ?? 40 * k + 16)}" data-alt="${esc(o.alt || "Hình minh hoạ")}" style="left:${R.x.toFixed(1)}px;top:${R.y.toFixed(1)}px;width:${R.w.toFixed(1)}px;height:${R.h.toFixed(1)}px;${R.r ? `rotate:${R.r}deg;` : ""}${o.z ? `z-index:${o.z};` : ""}${sh}">${inner}</div>`; };
// hộp chữ sửa được, toạ độ màn hình
const chu = (cls, x, y, w, html, o = {}) => `<div class="${cls}" data-t${o.m ? ` data-m="${o.m}"` : ""}${o.go ? ` data-go="${o.go}"` : ""} style="left:${Math.round(x)}px;top:${Math.round(y)}px;${w ? `width:${Math.round(w)}px;` : ""}${o.size ? `font-size:${o.size}px;` : ""}${o.color ? `color:#${o.color};` : ""}${o.align ? `text-align:${o.align};` : ""}z-index:${o.z ?? 30};${o.r ? `rotate:${o.r}deg;` : ""}">${html}</div>`;

// ---------- VẬT TRÊN BÀN (SVG) ----------
const giayNen = (id, w, h, tone = M.paper) => `<defs><filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="11"/><feColorMatrix values="0 0 0 0 .45 0 0 0 0 .38 0 0 0 0 .25 0 0 0 .16 0"/></filter>
  <linearGradient id="${id}l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#5a4320" stop-opacity=".10"/></linearGradient></defs>
  <rect width="${w}" height="${h}" rx="4" fill="#${tone}"/><rect width="${w}" height="${h}" rx="4" filter="url(#${id})"/><rect width="${w}" height="${h}" rx="4" fill="url(#${id}l)"/>`;

// sổ BHXH đóng (bìa da xanh, chỉ vàng, hoa văn tròn chung chung — KHÔNG mô phỏng logo / quốc huy)
const soBia = () => { const g = uid("sb"); const ros = Array.from({ length: 18 }, (_, i) => `<ellipse cx="0" cy="0" rx="96" ry="34" transform="rotate(${i * 10})"/>`).join("");
  return `<svg viewBox="0 0 560 790" width="100%" height="100%" preserveAspectRatio="none"><defs>
    <linearGradient id="${g}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f7a64"/><stop offset=".55" stop-color="#${M.green}"/><stop offset="1" stop-color="#${M.green2}"/></linearGradient>
    <filter id="${g}n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="5"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .55 -.12"/></filter>
    <filter id="${g}m" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="2" seed="2"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .22 -.06"/></filter>
    <linearGradient id="${g}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5e2a2"/><stop offset=".45" stop-color="#${M.gold}"/><stop offset="1" stop-color="#${M.gold2}"/></linearGradient>
    <linearGradient id="${g}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
    <rect x="8" y="9" width="552" height="781" rx="10" fill="#efe5cb"/>${Array.from({ length: 5 }, (_, i) => `<path d="M${552 - i} ${16 + i * 2} V${783 - i}" stroke="#c9bb98" stroke-width="1"/>`).join("")}
    <rect width="548" height="778" rx="12" fill="url(#${g}c)"/><rect width="548" height="778" rx="12" filter="url(#${g}m)"/><rect width="548" height="778" rx="12" filter="url(#${g}n)" opacity=".7"/>
    <rect width="40" height="778" rx="12" fill="#000" opacity=".2"/><path d="M40 6 V772" stroke="#fff" stroke-opacity=".09" stroke-width="2"/>
    <rect x="70" y="34" width="448" height="710" rx="4" fill="none" stroke="url(#${g}g)" stroke-width="3"/><rect x="80" y="44" width="428" height="690" rx="2" fill="none" stroke="url(#${g}g)" stroke-width="1.2" opacity=".85"/>
    <g transform="translate(294 300)" fill="none" stroke="url(#${g}g)" stroke-width="1.3" opacity=".95">${ros}<circle r="104" stroke-width="3"/><circle r="56" stroke-width="2"/></g>
    <circle cx="294" cy="300" r="40" fill="url(#${g}g)"/><path d="M276 300 l12 12 l24 -26" fill="none" stroke="#${M.green2}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <g font-family="Be Vietnam Pro" font-weight="800" text-anchor="middle"><text x="294" y="508" font-size="64" letter-spacing="10" fill="#0b2a22" opacity=".55">SỔ</text><text x="294" y="505" font-size="64" letter-spacing="10" fill="url(#${g}g)">SỔ</text>
    <text x="294" y="566" font-size="33" letter-spacing="5" fill="#0b2a22" opacity=".55">BẢO HIỂM XÃ HỘI</text><text x="294" y="563" font-size="33" letter-spacing="5" fill="url(#${g}g)">BẢO HIỂM XÃ HỘI</text></g>
    <rect x="190" y="640" width="208" height="40" rx="3" fill="none" stroke="url(#${g}g)" stroke-width="1.5"/><text x="294" y="667" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="700" font-size="17" letter-spacing="3" fill="url(#${g}g)">MÃ SỐ ··········</text>
    <rect width="548" height="778" rx="12" fill="url(#${g}s)"/></svg>`; };

// trang trái khi sổ mở: mặt trong bìa (viền da xanh) + giấy lót in "trang thông tin" — các dòng do slide điền (hộp chữ đè lên)
const soTrongBia = () => { const g = uid("st");
  const song = Array.from({ length: 34 }, (_, i) => { const y0 = 40 + i * 21; let d = `M20 ${y0}`; for (let x = 20; x <= 540; x += 20) d += ` Q${x + 10} ${y0 + (i % 2 ? 7 : -7)} ${x + 20} ${y0}`; return `<path d="${d}"/>`; }).join("");
  return `<svg viewBox="0 0 560 790" width="100%" height="100%" preserveAspectRatio="none"><defs><linearGradient id="${g}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f7a64"/><stop offset="1" stop-color="#${M.green2}"/></linearGradient>
    <linearGradient id="${g}p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dcebe2"/><stop offset="1" stop-color="#c3dacd"/></linearGradient>
    <linearGradient id="${g}f" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#0d2a22" stop-opacity=".3"/><stop offset=".12" stop-color="#0d2a22" stop-opacity="0"/></linearGradient></defs>
    <rect width="560" height="790" rx="12" fill="url(#${g}c)"/><rect x="18" y="16" width="528" height="758" rx="3" fill="url(#${g}p)"/>
    <g fill="none" stroke="#${M.green}" stroke-opacity=".13" stroke-width="1.2">${song}</g>
    <g transform="translate(282 640)" fill="none" stroke="#${M.green}" stroke-opacity=".18" stroke-width="1.2">${Array.from({ length: 16 }, (_, i) => `<ellipse rx="120" ry="40" transform="rotate(${i * 11.25})"/>`).join("")}</g>
    <rect x="18" y="16" width="528" height="758" fill="url(#${g}f)"/>
    <g transform="translate(60 70)"><rect width="440" height="4" fill="#${M.green}"/><rect y="10" width="440" height="1.5" fill="#${M.green}"/></g>
    ${[300, 390, 480, 570].map((y) => `<path d="M60 ${y} H500" stroke="#${M.green}" stroke-opacity=".35" stroke-width="1.6" stroke-dasharray="2 7" stroke-linecap="round"/>`).join("")}</svg>`; };

// trang phải (trang sổ): kẻ bảng "quá trình đóng" mờ, gáy sổ có bóng
const soTrang = () => { const g = uid("sp");
  return `<svg viewBox="0 0 560 790" width="100%" height="100%" preserveAspectRatio="none"><defs><linearGradient id="${g}f" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3b2a10" stop-opacity=".28"/><stop offset=".1" stop-color="#3b2a10" stop-opacity="0"/></linearGradient></defs>
    ${Array.from({ length: 4 }, (_, i) => `<rect x="${4 + i * 2}" y="${4 + i * 2}" width="552" height="782" rx="6" fill="#${i % 2 ? "e6dcc0" : "efe6cf"}"/>`).join("")}
    ${giayNen(g + "p", 552, 782)}<rect width="552" height="782" fill="url(#${g}f)"/>
    <rect x="48" y="60" width="456" height="3" fill="#${M.green}"/>${Array.from({ length: 13 }, (_, i) => `<path d="M48 ${130 + i * 48} H504" stroke="#cdbf9e" stroke-width="1"/>`).join("")}
    <path d="M150 112 V760 M380 112 V760" stroke="#cdbf9e" stroke-width="1"/></svg>`; };

// tờ rời quá trình đóng (khổ ngang): tiêu đề in, lưới mờ; `ve` = SVG biểu đồ in đè lên tờ (cùng hệ toạ độ 1000×640)
const toRoi = (ve = "") => { const g = uid("tr");
  return `<svg viewBox="0 0 1000 640" width="100%" height="100%" preserveAspectRatio="none">${giayNen(g + "p", 1000, 640)}
    <rect x="34" y="30" width="932" height="4" fill="#${M.green}"/><rect x="34" y="40" width="932" height="1.2" fill="#${M.green}"/>
    ${Array.from({ length: 11 }, (_, i) => `<path d="M34 ${150 + i * 42} H966" stroke="#d9cdb0" stroke-width="1"/>`).join("")}
    <path d="M34 606 H966" stroke="#${M.green}" stroke-width="1.5"/>${ve}</svg>`; };

// bút máy (nhìn từ trên xuống)
const but = () => { const g = uid("bt");
  return `<svg viewBox="0 0 620 64" width="100%" height="100%"><defs><linearGradient id="${g}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3c4f70"/><stop offset=".35" stop-color="#1b2a44"/><stop offset=".7" stop-color="#0c1526"/><stop offset="1" stop-color="#25344f"/></linearGradient>
    <linearGradient id="${g}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e3a3"/><stop offset=".5" stop-color="#c69a3e"/><stop offset="1" stop-color="#7f5c1d"/></linearGradient>
    <linearGradient id="${g}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef1f5"/><stop offset=".5" stop-color="#9aa4b2"/><stop offset="1" stop-color="#5e6875"/></linearGradient></defs>
    <path d="M520 20 L612 32 L520 44 Z" fill="url(#${g}s)"/><path d="M540 32 H600" stroke="#4b5360" stroke-width="1.5"/>
    <rect x="24" y="12" width="500" height="40" rx="20" fill="url(#${g}b)"/><rect x="300" y="12" width="14" height="40" fill="url(#${g}g)"/><rect x="470" y="12" width="10" height="40" fill="url(#${g}g)"/>
    <rect x="60" y="8" width="210" height="12" rx="6" fill="url(#${g}g)"/><circle cx="70" cy="14" r="8" fill="url(#${g}g)"/><rect x="24" y="16" width="480" height="7" rx="3.5" fill="#fff" opacity=".18"/></svg>`; };

// chồng xu (nhìn từ trên: các vòng lệch nhau)
const xu = () => { const g = uid("xu"); const one = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${g}e)"/><circle cx="${cx}" cy="${cy}" r="${r - 5}" fill="url(#${g}f)"/><circle cx="${cx}" cy="${cy}" r="${r - 5}" fill="none" stroke="#7d5a1c" stroke-width="1.5" stroke-dasharray="2 3"/><circle cx="${cx}" cy="${cy}" r="${r * 0.62}" fill="none" stroke="#fff3c8" stroke-opacity=".55" stroke-width="2"/><path d="M${cx} ${cy - r * 0.32} l${r * 0.09} ${r * 0.2} l${r * 0.22} 0 l-${r * 0.18} ${r * 0.13} l${r * 0.07} ${r * 0.22} l-${r * 0.2} -${r * 0.13} l-${r * 0.2} ${r * 0.13} l${r * 0.07} -${r * 0.22} l-${r * 0.18} -${r * 0.13} l${r * 0.22} 0 Z" fill="#a67c2a" opacity=".75"/>`;
  return `<svg viewBox="0 0 300 220" width="100%" height="100%"><defs><radialGradient id="${g}f" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff1bd"/><stop offset=".45" stop-color="#dcb35a"/><stop offset="1" stop-color="#9c7326"/></radialGradient>
    <radialGradient id="${g}e" cx=".5" cy=".5" r=".5"><stop offset=".85" stop-color="#8a6420"/><stop offset="1" stop-color="#5f430f"/></radialGradient></defs>${one(96, 122, 82)}${one(110, 112, 82)}${one(122, 100, 82)}${one(214, 140, 64)}</svg>`; };

// con dấu gỗ (nhìn từ trên): tay cầm tròn + đế vuông
const conDau = () => { const g = uid("cd");
  return `<svg viewBox="0 0 220 220" width="100%" height="100%"><defs><radialGradient id="${g}w" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#d9a066"/><stop offset=".6" stop-color="#8f5a2b"/><stop offset="1" stop-color="#5b3416"/></radialGradient>
    <linearGradient id="${g}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a2a1d"/><stop offset="1" stop-color="#1a120b"/></linearGradient></defs>
    <rect x="22" y="22" width="176" height="176" rx="18" fill="url(#${g}b)"/><rect x="32" y="32" width="156" height="156" rx="12" fill="none" stroke="#c9a14f" stroke-width="5"/><rect x="22" y="22" width="176" height="20" rx="10" fill="#fff" opacity=".08"/>
    <circle cx="110" cy="110" r="62" fill="url(#${g}w)"/><circle cx="110" cy="110" r="62" fill="none" stroke="#3b230f" stroke-width="3" opacity=".5"/><ellipse cx="92" cy="90" rx="22" ry="14" fill="#fff" opacity=".22"/></svg>`; };

// dấu mực (khung kép + chữ; mép mực sần và lốm đốm như đóng tay)
const dauMuc = (w, h, col = M.red, o = {}) => { const g = uid("dm");
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%"><defs><filter id="${g}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${o.seed || 4}" result="n"/><feColorMatrix in="n" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.4 1.35" result="a"/><feComposite in="SourceGraphic" in2="a" operator="in" result="s"/><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="1" seed="9" result="d"/><feDisplacementMap in="s" in2="d" scale="3"/></filter></defs>
    <g filter="url(#${g})" fill="none" stroke="#${col}">${o.round ? `<circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) / 2 - 5}" stroke-width="5"/><circle cx="${w / 2}" cy="${h / 2}" r="${Math.min(w, h) / 2 - 14}" stroke-width="2"/>` : `<rect x="4" y="4" width="${w - 8}" height="${h - 8}" rx="8" stroke-width="5"/><rect x="13" y="13" width="${w - 26}" height="${h - 26}" rx="4" stroke-width="2"/>`}${o.fill ? `<rect x="13" y="13" width="${w - 26}" height="${h - 26}" fill="#${col}" fill-opacity=".1" stroke="none"/>` : ""}</g></svg>`; };

// kẹp giấy
const kep = () => `<svg viewBox="0 0 60 150" width="100%" height="100%"><path d="M20 140 V30 a14 14 0 0 1 28 0 V118 a8 8 0 0 1 -16 0 V42" fill="none" stroke="#c7ccd4" stroke-width="6" stroke-linecap="round"/><path d="M20 140 V30 a14 14 0 0 1 28 0 V118" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/></svg>`;

// thẻ giấy kraft có lỗ xỏ dây (nhóm thực hiện)
const theKraft = () => { const g = uid("tk"); return `<svg viewBox="0 0 520 200" width="100%" height="100%" preserveAspectRatio="none">${giayNen(g, 520, 200, "d9bf8a")}<circle cx="44" cy="100" r="14" fill="#8a6a3c"/><circle cx="44" cy="100" r="9" fill="#2a3346"/><path d="M44 100 C10 70, -10 60, -40 40" stroke="#c9b48a" stroke-width="3" fill="none"/></svg>`; };

// ---------- BỐ CỤC THẾ GIỚI: vị trí mặc định của các vật trên bàn (toạ độ mặt bàn) ----------
const BOOK = { x: 1150, y: 150, w: 560, h: 790 };   // trang phải / bìa khi đóng — gáy sổ ở x = 1150
const VAT = {
  but: { x: 1290, y: 50, w: 540, h: 56, r: -8 },
  xu: { x: 1716, y: 918, w: 210, h: 154, r: 0 },
  dau: { x: 1000, y: 880, w: 150, h: 150, r: 12 },
  roi: { x: 1010, y: 560, w: 860, h: 550, r: 7 },     // tờ rời nằm dưới sổ, thò ra phía trái dưới
};
const sach = (c, mo, o = {}) => {   // cuốn sổ: bìa (đóng ở trên trang / mở sang trái) + trang
  const bia = mo ? { x: BOOK.x - BOOK.w, y: BOOK.y, w: BOOK.w, h: BOOK.h, r: 0 } : { ...BOOK, r: o.r ?? -2.5 }, trang = { ...BOOK, r: mo ? 0 : (o.r ?? -2.5) };
  const T = chieu(c, trang), B = chieu(c, bia);
  return `${lop("bh-trang", T, soTrang(), { m: "bh-trang", z: 4, alt: "Trang sổ bảo hiểm xã hội" })}${lop("bh-bia", B, mo ? soTrongBia() : soBia(), { m: "bh-bia", z: mo ? 4 : 5, alt: "Sổ bảo hiểm xã hội" })}`; };
const vatBan = (c, bo = []) => [["but", but, "Bút máy", 7], ["xu", xu, "Chồng xu", 6], ["dau", conDau, "Con dấu", 6]].filter(([k]) => !bo.includes(k)).map(([k, fn, alt, z]) => lop(`bh-${k}`, chieu(c, VAT[k]), fn(), { m: `bh-${k}`, z, alt })).join("");
const chan = (s, deck, i, n) => (s.type === "bhcot" ? "" : chu("bh-pg", 1640, 1000, 200, `${String(i + 1).padStart(2, "0")} <small>/ ${n}</small>`, { align: "right" }));

const S = {};

// BÌA — tiêu đề trên mặt bàn (chữ ngà, cụm nhấn vàng), sổ đóng bên phải, tờ rời thò ra dưới sổ
S.bhbia = (s, deck, c0) => { const c = cam(s.cam || c0);
  const roi = lop("bh-roi", chieu(c, VAT.roi), toRoi(), { m: "bh-roi", z: 3, alt: "Tờ rời quá trình đóng bảo hiểm xã hội" });
  return `${roi}${sach(c, false)}${vatBan(c)}${hoa({ x: 905, y: 610, w: 150 })}${thuoc({ hop: { x: 760, y: 846, w: 150 }, day: { x: 770, y: 935, w: 30 } })}
    ${chu("bh-k", 110, 150, 900, esc(s.kicker || ""))}
    ${chu("bh-h1", 110, 200, 760, tx(s.title || ""), { size: s.titleSize || 84 })}
    ${s.subtitle ? chu("bh-sub", 110, 668, 700, tx(s.subtitle)) : ""}
    ${s.author ? `${lop("bh-the", { x: 96, y: 846, w: 640, h: 150, r: -2 }, theKraft(), { m: "bh-the", z: 6, alt: "Thẻ tên nhóm" })}${chu("bh-tn", 176, 874, 540, esc(s.author), { r: -2 })}${chu("bh-tns", 176, 924, 540, esc([s.authorSub, s.date].filter(Boolean).join(" · ")), { r: -2 })}` : ""}`; };

// SỔ MỞ — bìa lật sang trái thành trang thông tin (fields), trang phải: câu kết luận + các mốc đóng dấu (số bay sang biểu đồ ở slide sau)
S.bhmo = (s, deck, c0) => { const c = cam(s.cam || c0 || { x: 1150, y: 540, z: 1.12 });
  const L = chieu(c, { x: BOOK.x - BOOK.w, y: BOOK.y, w: BOOK.w, h: BOOK.h }), P = chieu(c, BOOK), z = c.z;
  const roi = lop("bh-roi", chieu(c, { ...VAT.roi, x: 1020, y: 600, r: 4 }), toRoi(), { m: "bh-roi", z: 3, alt: "Tờ rời quá trình đóng bảo hiểm xã hội" });
  const info = (s.fields || []).slice(0, 5).map((fl, k) => `${chu("bh-fl", L.x + 60 * z, L.y + (262 + k * 90) * z, 440 * z, esc(fl.label), { size: Math.round(20 * z) })}${chu("bh-fv", L.x + 60 * z, L.y + (288 + k * 90) * z, 440 * z, tx(fl.value), { size: Math.round(27 * z) })}`).join("");
  const moc = (s.marks || []).slice(0, 3).map((mk, k) => { const y = P.y + (440 + k * 104) * z, x = P.x + 48 * z, w = 456 * z, h = 88 * z, col = mk.tone === "bad" ? M.red : M.green;
    return `${lop(`bh-moc${k}`, { x, y, w, h, r: k % 2 ? 0.8 : -0.8 }, dauMuc(456, 88, col, { seed: 3 + k }), { shadow: false, z: 5, alt: "Dấu mốc" })}
      ${chu("bh-my", x + 22 * z, y + 24 * z, 120 * z, esc(mk.year), { size: Math.round(30 * z), color: col, z: 6 })}
      ${chu("bh-mv", x + 132 * z, y + 12 * z, 150 * z, esc(mk.value), { size: Math.round(54 * z), color: col, z: 6, m: mk.year ? `bh-so-${mk.year}` : "" })}
      ${chu("bh-mt", x + 286 * z, y + 18 * z, 160 * z, esc(mk.text || ""), { size: Math.round(19 * z), color: col, z: 6 })}`; }).join("");
  return `${roi}${sach(c, true)}${vatBan(c, ["dau"])}
    ${chu("bh-fh", L.x + 60 * z, L.y + 96 * z, 440 * z, esc(s.infoTitle || "Trang thông tin"), { size: Math.round(24 * z) })}${info}
    ${chu("bh-pk", P.x + 48 * z, P.y + 84 * z, 456 * z, esc(s.kicker || ""), { size: Math.round(21 * z) })}
    ${chu("bh-ph", P.x + 48 * z, P.y + 124 * z, 460 * z, tx(s.title || ""), { size: Math.round((s.titleSize || 42) * z) })}${moc}`; };

// BIỂU ĐỒ CỘT IN TRÊN TỜ RỜI — zoom vào: tờ rời kéo ra giữa bàn; nguyên nhân đặt tại năm; dải giai đoạn; thẻ kết luận kẹp mép
S.bhcot = (s, deck, c0) => { const c = cam(s.cam || { x: 1150, y: 489, z: 1.25 });
  const R = { x: 60, y: 66, w: 1450, h: 944, r: -0.5 }, kx = R.w / 1000, ky = R.h / 640;   // tờ rời trên màn hình; hệ toạ độ trong tờ 1000×640
  const it = s.items || [], n = it.length, hi = Math.max(...it.map((x) => x.value)) * 1.1, X0 = 50, X1 = s.insight ? 880 : 960, Y0 = 500, Y1 = 232;
  const bw = (X1 - X0) / n * 0.58, xs = (k) => X0 + (X1 - X0) / n * (k + 0.5), ys = (v) => Y0 - (Y0 - Y1) * v / hi;
  const bands = (s.bands || []).map((b) => { const a = it.findIndex((x) => x.label === b.from), e = it.findIndex((x) => x.label === b.to); if (a < 0 || e < 0) return "";
    const x0 = xs(a) - (X1 - X0) / n / 2, x1 = xs(e) + (X1 - X0) / n / 2;
    return `<rect x="${x0}" y="${Y1 - 30}" width="${x1 - x0}" height="${Y0 - Y1 + 30}" fill="#${M.red}" fill-opacity=".07"/><path d="M${x0} ${Y1 - 30} V${Y0} M${x1} ${Y1 - 30} V${Y0}" stroke="#${M.red}" stroke-opacity=".5" stroke-width="1.4" stroke-dasharray="5 5"/><text x="${(x0 + x1) / 2}" y="${Y1 - 38}" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" font-size="15" letter-spacing="2" fill="#${M.red}">${esc(String(b.label).toUpperCase())}</text>`; }).join("");
  const g = uid("ink"), mau = (x, k) => (x.focus ? M.gold2 : x.tone === "bad" || (k && x.value < it[k - 1].value) ? M.red : M.ink);
  const cot = it.map((x, k) => { const y = ys(x.value), col = mau(x, k);
    return `<rect x="${xs(k) - bw / 2}" y="${y}" width="${bw}" height="${Y0 - y}" fill="#${col}" filter="url(#${g})"/>${x.morph ? "" : `<text x="${xs(k)}" y="${y - 10}" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" font-size="18" fill="#${col}">${esc(x.display || num(x.value))}</text>`}
      <text x="${xs(k)}" y="${Y0 + 26}" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="${x.focus ? 800 : 600}" font-size="16" fill="#${M.ink}" fill-opacity="${x.focus ? 1 : 0.72}">${esc(x.label)}</text>`; }).join("");
  const whys = it.map((x, k) => (x.why ? k : -1)).filter((k) => k >= 0).slice(0, 3);
  const vong = (s0) => s0.replace(/^<svg[^>]*>|<\/svg>$/g, "");
  const vongTay = vong(handMarks(whys.map((k) => ({ kind: "ring", x: xs(k) / 100, y: ((ys(it[k].value) + Y0) / 2 - 12) / 100, rx: (bw / 2 + 9) / 100, ry: ((Y0 - ys(it[k].value)) / 2 + 16) / 100 })), M.red, 7));
  const so = whys.map((k, j) => `<circle cx="${xs(k) + bw / 2 + 8}" cy="${ys(it[k].value) - 40}" r="13" fill="#${M.red}"/><text x="${xs(k) + bw / 2 + 8}" y="${ys(it[k].value) - 34.5}" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" font-size="15" fill="#fff">${j + 1}</text>`).join("");
  const ghi = whys.length ? `<text x="${X0}" y="548" font-family="Be Vietnam Pro" font-weight="800" font-size="13" letter-spacing="2.4" fill="#${M.green}">GHI CHÚ</text>${whys.map((k, j) => `<circle cx="${X0 + 12 + j * 460}" cy="${574}" r="11" fill="#${M.red}"/><text x="${X0 + 12 + j * 460}" y="${579}" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" font-size="13" fill="#fff">${j + 1}</text>`).join("")}` : "";
  const ve = `<defs><filter id="${g}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="8" result="n"/><feColorMatrix in="n" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.55 1.12" result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/></filter></defs>${bands}${cot}<g>${vongTay}</g>${so}${ghi}`;
  const roi = lop("bh-roi", R, toRoi(ve), { m: "bh-roi", z: 8, k: 2.2, alt: "Tờ rời: biểu đồ cột in trên giấy" });
  const sx = (v) => R.x + v * kx, sy = (v) => R.y + v * ky;
  const soMorph = it.map((x, k) => (x.morph ? chu("bh-cv", sx(xs(k)) - 90, sy(ys(x.value)) - 48, 180, esc(x.display || num(x.value)), { align: "center", color: mau(x, k), m: `bh-so-${x.label}` }) : "")).join("");
  const why = whys.map((k, j) => chu("bh-wt", sx(X0 + 30 + j * 460), sy(560), 590, `<b>${esc(it[k].label)}</b> ${f(it[k].why)}`)).join("");
  const ins = s.insight || {};
  const the = s.insight ? `${lop("bh-ins", { x: 1430, y: 290, w: 420, h: 500, r: 2 }, `<svg viewBox="0 0 420 500" width="100%" height="100%" preserveAspectRatio="none">${giayNen(uid("ip"), 420, 500, "fbf4e2")}<rect x="0" y="0" width="420" height="16" fill="#${M.gold}"/></svg>`, { m: "bh-ins", z: 10, alt: "Thẻ kết luận" })}
    ${lop("bh-kep", { x: 1486, y: 250, w: 44, h: 110, r: 2 }, kep(), { z: 11, k: 0.7, alt: "Kẹp giấy" })}
    ${chu("bh-iv", 1466, 360, 360, f(ins.value || ""), { r: 2, m: "bh-ins-so" })}${chu("bh-iu", 1466, 492, 360, f(ins.unit || ""), { r: 2 })}${chu("bh-it", 1466, 600, 350, f(ins.text || ""), { r: 2 })}` : "";
  return `${sach(c, true)}${vatBan(c, ["dau"])}${roi}
    ${chu("bh-ck", R.x + 52, R.y + 62, 900, esc(s.kicker || ""), { r: -0.5 })}${chu("bh-ch", R.x + 52, R.y + 96, 1300, tx(s.title || ""), { r: -0.5, size: s.titleSize || 50 })}
    ${chu("bh-cu", R.x + 52, R.y + 222, 700, esc(s.unit || ""), { r: -0.5 })}${soMorph}${why}${the}`; };

// ---------- DÀN XUYÊN SUỐT + CHỮ CHUNG cho các kiểu mới ----------
// Luật bố cục (cổng 1b, sau tự soát): chữ ≥ 26 px (13 pt khi chiếu); mỗi slide một vật chính lớn; chú giải đơn vị đóng dấu ngay trên slide;
// bút, xu chỉ ở bìa / kết; chị Hoa chỉ có mặt khi là một phần câu chuyện; tiêu đề luôn ở cùng một chỗ (dải trên cùng).
const HOA = { nu: 1, kieuToc: "buoc", ao: "4f86a8", quan: "2f3b52", vat: "thuoc-day" };   // chị Hoa — công nhân may (slide 11 của bài)
const hoa = (R, o = {}) => lop("bh-hoa", { x: R.x, y: R.y, w: R.w, h: R.w * 430 / 220, r: R.r || 0 }, V.nguoi({ ...HOA, ...o }), { m: "bh-hoa", z: 12, k: R.w / 380, alt: "Chị Hoa — người lao động đóng BHXH" });
const thuoc = ({ hop, day }, nhan = []) => `${day ? lop("bh-thuoc-day", { x: day.x, y: day.y, w: day.w, h: 60, r: 0 }, V.thuocDai(Math.max(day.w, 60), day.w > 400 ? nhan : []), { m: "bh-thuoc-day", z: 9, k: 0.7, alt: "Thước dây" }) : ""}${hop ? lop("bh-thuoc-hop", { x: hop.x, y: hop.y, w: hop.w, h: hop.w * 0.9, r: hop.r || 0 }, V.thuocHop(), { m: "bh-thuoc-hop", z: 10, k: 0.8, alt: "Hộp thước dây" }) : ""}`;
const bia2 = () => "";   // slide nội dung: không bút, không xu (chỉ bìa / kết có đồ vật trên bàn)
const tieuDe = (s, o = {}) => `${chu("bh-k", 110, 92, 1300, esc(s.kicker || ""))}${chu("bh-h2", 110, 132, o.w || 1400, tx(s.title || ""), { size: s.titleSize || o.size || 62 })}${s.sub ? chu("bh-sub2", 110, o.subY ?? 292, o.subW || 1100, tx(s.sub)) : ""}`;
const nguon = (t) => (t ? chu("bh-src", 110, 952, 1500, esc(t)) : "");
// chú giải đơn vị: thẻ kraft nhỏ có hình mẫu + chữ (đứng yên giữa các slide dùng chung đơn vị → Morph giữ nguyên)
const chuGiai = (ten, x, y, hinh, chuT, w = 470) => { const H = 53 + Math.max(1, Math.ceil(String(chuT).length * 14 / (w - 90))) * 31;
  return `${lop(ten, { x, y, w, h: H, r: -1.5 }, `<svg viewBox="0 0 ${w} ${H}" width="100%" height="100%" preserveAspectRatio="none"><rect width="${w}" height="${H}" rx="6" fill="#d9bf8a"/><rect x="5" y="5" width="${w - 10}" height="${H - 10}" rx="4" fill="none" stroke="#8a6a3c" stroke-width="1.5" stroke-dasharray="5 4"/></svg>`, { z: 11, k: 0.5, alt: "Chú giải" })}
  ${lop(`${ten}-h`, { x: x + 14, y: y + 10, w: 46, h: 64 }, hinh, { z: 12, k: 0.3, shadow: false, alt: "Mẫu" })}${chu("bh-cg", x + 74, y + 24, w - 90, esc(chuT), { r: -1.5 })}`; };
const luoi = (n, cot, x0, y0, dx, dy) => Array.from({ length: n }, (_, k) => ({ x: x0 + (k % cot) * dx, y: y0 + Math.floor(k / cot) * dy }));
const SN = { w: 76, h: 106, dx: 88, dy: 116 };   // sổ nhỏ trong hàng đếm
const soNhoLop = (k, P, o = {}) => lop(`bh-ms${k}`, { x: P.x, y: P.y, w: SN.w, h: SN.h, r: o.r ?? ((k * 37) % 7) - 3 }, V.soNho(), { m: `bh-ms${k}`, z: 8, k: 0.4, alt: "Sổ BHXH (1 cuốn = 1 triệu người)" });

// ĐO — "Mười năm, BHXH bắt buộc đi bao xa?": thước dây duỗi 2015 → 2025, 12 cuốn sổ ở vạch 2015, chị Hoa đứng cạnh
const NAM = Array.from({ length: 11 }, (_, k) => String(2015 + k)), TX0 = 300, TX1 = 1780, TY = 846;
const xNam = (y) => TX0 + 30 + (TX1 - TX0 - 60) * (+y - 2015) / 10;
const G15 = luoi(12, 4, 250, 420, SN.dx, SN.dy), CG_SO = { x: 340, y: 934 };
S.bhdo = (s, deck) => `${bia2()}${thuoc({ hop: { x: 110, y: TY - 80, w: 200 }, day: { x: TX0, y: TY, w: TX1 - TX0 } }, NAM)}${G15.map((P, k) => soNhoLop(k + 1, P)).join("")}${hoa({ x: 100, y: 430, w: 136 })}
    ${chuGiai("bh-cg-so", CG_SO.x, CG_SO.y, V.soNho(), s.legend || "1 cuốn sổ = 1 triệu người đóng", 560)}
    ${chu("bh-k", 110, 92, 1300, esc(s.kicker || ""))}${chu("bh-q", 760, 200, 1060, tx((s.lines || []).join("\n")), { size: 92 })}${chu("bh-qb", 760, 420, 1000, tx(s.box || ""), { size: 128 })}
    ${chu("bh-nam", 250, 360, 420, esc(s.tu || "2015 · 12,07 triệu người đóng"))}`;

// TĂNG — 12 cuốn trượt từ vạch 2015 sang 2025, đặt thêm 7 cuốn; chỗ cũ còn bóng nét đứt; dấu đỏ năm đi lùi dưới thước
S.bhtang = (s, deck) => { const st = s.stats || [], a = st[0] || {}, b = st[1] || {}, d = st[2] || {};
  const nB = Math.round(parseFloat(String(b.value).replace(",", "."))) || 19, G25 = luoi(nB, 5, 1290, 360, SN.dx, SN.dy);
  const ve = G15.map((P) => `<rect x="${P.x - 240}" y="${P.y - 410}" width="${SN.w}" height="${SN.h}" rx="5" fill="none" stroke="#d8c08a" stroke-width="3" stroke-dasharray="9 7" opacity=".55"/>`).join("");
  return `${bia2()}<svg class="bh-bong" style="position:absolute;left:240px;top:410px;width:400px;height:380px" viewBox="0 0 400 380">${ve}</svg>
    ${thuoc({ hop: { x: 110, y: TY - 80, w: 200 }, day: { x: TX0, y: TY, w: TX1 - TX0 } }, NAM)}${G25.map((P, k) => soNhoLop(k + 1, P)).join("")}${hoa({ x: 1110, y: 560, w: 136 })}
    ${chuGiai("bh-cg-so", CG_SO.x, CG_SO.y, V.soNho(), s.legend || "1 cuốn sổ = 1 triệu người đóng", 560)}
    ${d.value ? `${lop("bh-dau22", { x: xNam(d.value) - 250, y: TY + 70, w: 540, h: 112, r: -3 }, dauMuc(540, 112, M.red, { seed: 21 }), { shadow: false, z: 11, alt: "Dấu năm đi lùi" })}${chu("bh-d22", xNam(d.value) - 230, TY + 84, 500, `${esc(d.value)} <small>${esc(d.desc || "")}</small>`, { align: "center", color: M.red, r: -3 })}` : ""}
    ${chu("bh-k", 110, 92, 1300, esc(s.kicker || ""))}${chu("bh-h2", 110, 132, 1150, tx(s.title || ""), { size: 62 })}${s.sub ? chu("bh-sub2", 110, 292, 1000, tx(s.sub)) : ""}
    ${chu("bh-sv", 270, 560, 360, esc(a.value), { color: "d8c08a", align: "center" })}${chu("bh-svl", 270, 662, 360, esc(a.label || ""), { align: "center" })}${chu("bh-sv", 1290, 168, 460, esc(b.value), { color: M.gold })}${chu("bh-svl", 1290, 270, 460, esc(b.label || ""))}`; };

// BA NHÓM — ba phiếu, người cắt giấy đứng vắt mép đáy phiếu (chị Hoa là nhóm 1)
const VAI = { vn: { ...HOA }, nn: { kieuToc: "hoi", toc: "8a5a2b", ao: "e8eef3", quan: "39465c", vat: "ho-chieu" }, sd: { kieuToc: "ngan", ao: "23324f", quan: "23324f", vat: "cap" },
  l: { nu: 1, kieuToc: "dai", ao: "e07a3f", quan: "39465c", vay: 1, vat: "dong-ho", da: "e6b48d" }, m: { nu: 1, kieuToc: "buoc", ao: "c0504d", quan: "2f3b52", taDe: 1, vat: "bien-kd", da: "e6b48d" },
  n: { kieuToc: "ngan", ao: "f4f1e8", quan: "2f3b52", vat: "con-dau", da: "d39b72" }, e: { mu: "coi", ao: "5f6f3d", quan: "4b5830", vat: "so", da: "d39b72" }, k: { mu: "non", kieuToc: "ngan", ao: "8a5a3c", quan: "3d3a33", vat: "loa", da: "c08560" } };
const nguoiLop = (ten, vai, R) => (ten === "bh-hoa" ? hoa(R) : lop(ten, { x: R.x, y: R.y, w: R.w, h: R.w * 430 / 220, r: R.r || 0 }, V.nguoi(VAI[vai] || {}), { m: ten, z: 12, k: R.w / 380, alt: "Người lao động" }));
const VAI3 = [["bh-hoa", "vn"], ["bh-nguoi-nn", "nn"], ["bh-nguoi-sd", "sd"]];
S.bhnhom = (s, deck) => { const it = (s.items || []).slice(0, 3);
  return `${bia2()}${tieuDe(s, { w: 1500 })}${it.map((x, k) => { const X = 110 + k * 570, Y = 300;
    return `${lop(`bh-phieu${k}`, { x: X, y: Y, w: 530, h: 590, r: [-1, 0.6, -0.4][k] }, V.phieu(M.green, { dau: 14 }), { z: 5, alt: "Phiếu đối tượng" })}
      ${nguoiLop(VAI3[k][0], VAI3[k][1], { x: X + 318, y: Y + 250, w: 190 })}
      ${chu("bh-pn", X + 40, Y + 50, 450, esc(x.name || ""))}${chu("bh-pw", X + 40, Y + 108, 450, esc(x.who || ""))}${chu("bh-pd", X + 40, Y + 160, 278, tx(x.desc || ""))}`; }).join("")}`; };

// MỞ RỘNG DIỆN (hai bước) — tập hồ sơ xếp ngăn; bước 1: ba nhóm cũ trong ngăn, 5 nhóm mới đứng ngoài; bước 2: hồ sơ giãn ra, 5 người đi vào ngăn
S.bhmorong = (s, deck, b) => { const moi = (s.items || []).slice(0, 5), W = b === 2 ? 1700 : 880, H = 540, X = 110, Y = 380, wN = 140;
  const tap = lop("bh-tap", { x: X, y: Y, w: W, h: H }, V.tapNgan(s.folder || "ĐỐI TƯỢNG THAM GIA BHXH BẮT BUỘC", W, H), { m: "bh-tap", z: 5, k: 1.6, alt: "Tập hồ sơ đối tượng tham gia" });
  const cu = VAI3.map(([ten, vai], k) => nguoiLop(ten, vai, { x: X + 50 + k * (b === 2 ? 212 : 280), y: Y + 96, w: wN })).join("");
  const vao = moi.map((x, k) => { const P = b === 2 ? { x: X + 50 + (k + 3) * 212, y: Y + 96 } : k < 3 ? { x: 1050 + k * 270, y: 300 } : { x: 1185 + (k - 3) * 270, y: 610 };
    return `${nguoiLop(`bh-moi${k + 1}`, x.k || "l", { x: P.x, y: P.y, w: b === 2 ? wN : 118 })}${chu("bh-mt2", P.x - (b === 2 ? 30 : 60), P.y + (b === 2 ? 286 : 238), b === 2 ? 200 : 240, esc(x.text), { align: "center", m: `bh-moit${k + 1}`, color: b === 2 ? "3b2a14" : "efe3c4" })}`; }).join("");
  const big = s.big && b === 2 ? `${lop("bh-dem", { x: 1360, y: 120, w: 460, h: 210, r: -4 }, dauMuc(460, 210, M.red, { seed: 31 }), { shadow: false, z: 13, alt: "Dấu số người" })}${chu("bh-dv", 1385, 140, 410, esc(s.big.value), { align: "center", r: -4, color: M.red })}${chu("bh-dl", 1385, 240, 410, esc(s.big.label || ""), { align: "center", r: -4, color: M.red })}` : "";
  return `${bia2()}${tieuDe(s, { w: 1200 })}${tap}${cu}${vao}${big}${nguon(s.source)}`; };

// RÚT NGẮN (hai bước) — 20 khối năm xếp 2 hàng, phong bì lương hưu sau khối cuối; bước 2: phong bì trượt về sau khối 15, 5 khối thừa rơi xuống nét đứt
S.bhrutngan = (s, deck, b) => { const c0 = (s.cols || [])[0] || { n: 20, label: "" }, c1 = (s.cols || [])[1] || { n: 15, label: "" }, N = c0.n, n = b === 2 ? c1.n : N, X = 330, Y = 380, D = 122, K = 108, hang = 10;
  const o = (k) => ({ x: X + (k % hang) * D, y: Y + Math.floor(k / hang) * 130 });
  const khoi = Array.from({ length: N }, (_, k) => { const P = o(k), roi = b === 2 && k >= c1.n;
    return lop(`bh-kn${k + 1}`, { x: P.x, y: P.y + (roi ? 150 : 0), w: K, h: K, r: roi ? ((k * 13) % 9) - 4 : 0 }, V.khoiNam(k + 1, { mo: roi }), { m: `bh-kn${k + 1}`, z: 8, k: 0.45, alt: `Năm đóng thứ ${k + 1}` }); }).join("");
  const sau = o(n - 1), pb = lop("bh-phongbi", { x: sau.x + D + 8, y: sau.y - 30, w: 250, h: 163, r: -4 }, V.phongBi(), { m: "bh-phongbi", z: 9, k: 0.7, alt: "Phong bì lương hưu" });
  const nhan = b === 2 ? c1 : c0;
  return `${bia2()}${tieuDe(s, { w: 1400 })}${hoa({ x: 120, y: 360, w: 150 })}${khoi}${pb}
    ${chuGiai("bh-cg-khoi", 1340, 92, V.khoiNam(1), s.legend || "1 khối = 1 năm đóng BHXH", 480)}
    ${chu("bh-rn", X, Y - 92, 1300, `<b>${esc(String(n))} năm đóng</b> · ${esc(nhan.label || "")}`)}
    ${s.ref ? `${lop("bh-ref", { x: 110, y: 768, w: 1700, h: 150, r: -0.4 }, V.phieu(M.green, { dau: 10 }), { z: 5, alt: "Trích điều luật" })}${chu("bh-rh", 150, 790, 1600, esc(s.ref.head || ""))}${chu("bh-rt", 150, 830, 1620, f(s.ref.text || ""))}` : ""}
    ${s.source ? chu("bh-src", 110, 944, 1500, esc(s.source)) : ""}`; };

// QUỸ (hai bước) — bảng thu − chi từng năm + ghi chú bên phải bảng + bình quỹ: bước 1 mực xu năm đầu, bước 2 mực dâng tới năm cuối giai đoạn dư
S.bhquy = (s, deck, b) => { const rows = s.rows || [], k1 = rows.findIndex((x) => x.label === (s.den || "2022")), kk = b === 2 ? Math.max(0, k1) : 0, RH = 52, TY0 = 330;
  const bang = rows.map((x, k) => { const y = TY0 + k * RH, neg = String(x.display || "").startsWith("−") || x.value < 0, xa = k > k1;
    return `${chu("bh-qy", 150, y + 6, 110, esc(x.label), { color: xa ? "8f8a7c" : M.ink })}${chu("bh-qv", 290, y, 220, esc(x.display || ""), { align: "right", color: neg ? M.red : xa ? "8f8a7c" : M.ink })}`; }).join("");
  const ghi = rows.map((x, k) => ({ x, k })).filter(({ x, k }) => x.note && k <= k1).map(({ x, k }) => chu("bh-qn", 560, TY0 + k * RH + 4, 600, `<b>${esc(x.label)}</b> ${esc(x.note)}`)).join("")
    + (k1 >= 0 && k1 < rows.length - 1 ? `${lop("bh-qngoac", { x: 540, y: TY0 + (k1 + 1) * RH, w: 14, h: (rows.length - k1 - 1) * RH - 8 }, `<svg viewBox="0 0 14 100" width="100%" height="100%" preserveAspectRatio="none"><path d="M2 2 H12 V98 H2" stroke="#8f8a7c" stroke-width="3" fill="none"/></svg>`, { shadow: false, z: 6, alt: "Ngoặc" })}${chu("bh-qn", 570, TY0 + (k1 + 1) * RH + 6, 600, esc(s.ngoai || "Phạm vi khác — chưa so được với 2015–2022"), { color: "8f8a7c" })}` : "");
  const giay = lop("bh-qbang", { x: 110, y: 300, w: 1080, h: RH * rows.length + 52, r: -0.3 }, V.phieu(M.green, { dau: 10 }), { z: 4, alt: "Bảng thu − chi" });
  const moc = lop("bh-qmoc", { x: 122, y: TY0 - 4 + kk * RH, w: 410, h: RH - 4 }, `<svg viewBox="0 0 410 48" width="100%" height="100%" preserveAspectRatio="none"><rect width="410" height="48" rx="6" fill="#f2c230" fill-opacity=".45"/></svg>`, { m: "bh-qmoc", z: 6, shadow: false, alt: "Đánh dấu năm" });
  const BX = 1290, BY = 280, BW = 470, BH = 611, muc = b === 2 ? 0.8 : 0.2, IH = BH * 0.79, top = BY + BH * 0.18 + IH * (1 - muc);
  const binh = `${lop("bh-binh-sau", { x: BX, y: BY, w: BW, h: BH }, V.binhQuySau(), { m: "bh-binh-sau", z: 7, k: 1, alt: "Bình quỹ" })}
    ${lop("bh-xu-quy", { x: BX + BW * 0.085, y: top, w: BW * 0.83, h: BY + BH * 0.97 - top }, V.xuTrongBinh(), { m: "bh-xu-quy", z: 8, shadow: false, alt: "Xu trong quỹ" })}
    ${lop("bh-binh-truoc", { x: BX, y: BY, w: BW, h: BH }, V.binhQuyKinh(s.jar || "QUỸ BHXH"), { m: "bh-binh-truoc", z: 9, shadow: false, alt: "Bình quỹ" })}`;
  const cap = chu("bh-qc", BX - 30, BY + BH + 16, BW + 60, b === 2 ? esc(s.cap2 || "Năm nào thu cũng lớn hơn chi → quỹ dày thêm") : esc(s.cap1 || `Năm ${rows[0]?.label || ""}: thu lớn hơn chi`), { align: "center" });
  return `${bia2()}${chu("bh-k", 110, 92, 1300, esc(s.kicker || ""))}${chu("bh-h2", 110, 132, 1150, tx(s.title || ""), { size: 62 })}${chu("bh-qu", 1210, 236, 560, esc(s.unit ? `Đơn vị: ${s.unit}` : ""), { align: "right" })}${giay}${moc}${bang}${ghi}${binh}${cap}${s.note ? chu("bh-src", 110, 962, 1150, esc(s.note)) : ""}`; };

// MẤT (hai bước) — sổ của chị Hoa có các khối năm đã đóng; bước 2: khối năm rơi khỏi trang, dấu "Mất thời gian" đóng xuống, chị Hoa buồn
S.bhmat = (s, deck, b) => { const ca = s.cause || {}, rs = s.results || [], NK = s.years || 6, SX = 740, SY = 300;
  const trang = `${lop("bh-so-hoa", { x: SX, y: SY, w: 500, h: 640, r: -1.5 }, soTrang(), { m: "bh-so-hoa", z: 6, k: 1, alt: "Sổ BHXH của chị Hoa" })}${chu("bh-sh", SX + 44, SY + 64, 420, esc(s.book || "Sổ BHXH · chị Hoa"), { r: -1.5 })}`;
  const khoi = Array.from({ length: NK }, (_, k) => { const P = b === 2 ? { x: 1000 + k * 62, y: 930 + (k % 3) * 14, r: ((k * 41) % 50) - 25, s: 100 } : { x: SX + 52 + (k % 3) * 136, y: SY + 190 + Math.floor(k / 3) * 140, r: 0 };
    return lop(`bh-khoa${k + 1}`, { x: P.x, y: P.y, w: P.s || 116, h: P.s || 116, r: P.r }, V.khoiNam(k + 1, { mo: b === 2 }), { m: `bh-khoa${k + 1}`, z: 8, k: 0.45, alt: "Năm đã đóng" }); }).join("");
  const dau = b === 2 ? `${lop("bh-dau-mat", { x: SX + 60, y: SY + 236, w: 380, h: 220, r: -9 }, dauMuc(380, 220, M.red, { seed: 41 }), { shadow: false, z: 10, alt: "Dấu mất thời gian" })}${chu("bh-dm", SX + 80, SY + 262, 340, tx(s.stamp?.text || "Mất thời gian"), { align: "center", color: M.red, r: -9 })}${chu("bh-dms", SX + 80, SY + 398, 340, esc(s.stamp?.sub || ""), { align: "center", color: M.red, r: -9 })}` : "";
  const the = `${lop("bh-cause", { x: 110, y: 300, w: 560, h: 320, r: -1 }, V.phieu("8a6a3c", { dau: 12 }), { z: 5, alt: "Tình huống" })}${chu("bh-ct", 150, 338, 480, esc(ca.tag || "Tình huống"))}${chu("bh-cx", 150, 386, 490, tx(ca.text || ""))}`;
  const kq = b === 2 ? rs.slice(0, 2).map((x, k) => `${lop(`bh-kq${k}`, { x: 1300, y: 300 + k * 320, w: 520, h: 290, r: k ? 0.8 : -0.8 }, V.phieu(M.red, { dau: 10 }), { z: 5, alt: "Hệ quả" })}${chu("bh-kt", 1340, 336 + k * 320, 450, tx(x.text || ""))}${chu("bh-kr", 1340, 516 + k * 320, 450, esc(x.ref || ""))}`).join("") : "";
  return `${bia2()}${tieuDe(s, { w: 1500 })}${chuGiai("bh-cg-khoi", SX, 226, V.khoiNam(1), s.legend || "1 khối = 1 năm đã đóng", 500)}${the}${hoa({ x: 300, y: 640, w: 150 }, b === 2 ? { nhan: "buon" } : {})}${trang}${khoi}${dau}${kq}${s.source ? chu("bh-src", 110, 946, 820, esc(s.source)) : ""}`; };

// ================= 16 KIỂU CÒN LẠI CỦA BÀI (kịch bản: docs/specs/2026-11-13-bhxh-kich-ban-morph.md) =================
const TAP = [{ mau: "c9a36a", bieu: "sach" }, { mau: "9fb7c9", bieu: "" }, { mau: "c98a6a", bieu: "dau" }];
const tapLop = (k, R, o = {}) => lop(`bh-tap${k + 1}`, { x: R.x, y: R.y, w: R.w, h: R.w * 400 / 440, r: R.r || 0 }, V.tapHoSo(String(k + 1), TAP[k].mau, o.bieu ?? TAP[k].bieu), { m: `bh-tap${k + 1}`, z: 6, k: R.w / 500, go: o.go, alt: `Tập hồ sơ phần ${k + 1}` });
const POS3 = [0, 1, 2].map((k) => ({ x: 110 + k * 600, y: 330, w: 500 }));   // ba tập hồ sơ xếp hàng (slide 4 và slide 26 dùng chung chỗ)

// 4 · BA CÂU HỎI — ba tập hồ sơ; chồng 19 cuốn sổ gom lại, cất vào tập 2; bấm tập để mở phần đó
S.bhba = (s, deck) => { const it = (s.items || []).slice(0, 3), P2 = POS3[1];
  const so = Array.from({ length: 19 }, (_, k) => lop(`bh-ms${k + 1}`, { x: P2.x + 170 + (k % 5) * 3, y: P2.y + 150 - (k % 5) * 3, w: 120 * 0.76, h: 120 * 1.06 * 0.76 * 1.4 / 1.06 * 0.72, r: (k % 3) - 1 }, V.soNho(), { m: `bh-ms${k + 1}`, z: 8, k: 0.4, alt: "Sổ BHXH" })).join("");
  return `${tieuDe(s, { w: 1500 })}${it.map((x, k) => { const P = POS3[k]; return `${tapLop(k, P, { go: x.go })}${chu("bh-bso", P.x + 30, P.y + 120, 140, `0${k + 1}`, { go: x.go })}${chu("bh-bq", P.x + 40, P.y + 330, 420, esc(x.q), { go: x.go })}`; }).join("")}${so}
    ${chu("bh-hint", 110, 952, 1500, esc(s.hint || "Bấm vào một tập hồ sơ để mở phần đó"))}`; };

// 5 · 14 · 21 · CHƯƠNG — tập hồ sơ của phần phóng to bên phải; số phần + câu hỏi chương bên trái (phần 1: cuốn luật nằm trên bìa)
S.bhchuong = (s, deck) => { const k = (+s.num || 1) - 1, R = { x: 930, y: 190, w: 860 }, sachRieng = k === 0;
  return `${tapLop(k, R, { bieu: sachRieng ? "" : k === 1 ? "so" : undefined })}${sachRieng ? lop("bh-sach", { x: R.x + 290, y: R.y + 270, w: 240, h: 326, r: -4 }, V.sachLuatDong(), { m: "bh-sach", z: 9, k: 0.6, alt: "Luật BHXH 2024" }) : ""}
    ${chu("bh-k", 110, 200, 760, esc(`${s.partWord || "Phần"} ${s.num} · ${s.part || ""}`))}${chu("bh-cso", 100, 236, 600, String(s.num).padStart(2, "0"))}
    ${chu("bh-h2", 110, 590, 760, tx(s.title || ""), { size: 64 })}${s.sub ? chu("bh-sub2", 110, 820, 740, tx(s.sub)) : ""}`; };

// 6 · TRÍCH LUẬT — cuốn luật mở; bút dạ quang nằm ngay cuối cụm vừa tô; cây ô gấp nằm trên bàn (slide sau bung ra)
S.bhtrich = (s, deck) => { const B = { x: 110, y: 200, w: 1260, h: 840 };
  return `${lop("bh-sach", B, V.sachLuatMo(), { m: "bh-sach", z: 6, k: 2, alt: "Luật BHXH 2024 mở" })}
    ${chu("bh-k", 110, 92, 1300, esc(s.kicker || ""))}${chu("bh-qt", B.x + B.w * 0.535, B.y + 110, B.w * 0.42, f(s.quote || ""))}
    ${chu("bh-qby", B.x + B.w * 0.535, B.y + 620, B.w * 0.42, esc(s.by || ""))}${chu("bh-qro", B.x + B.w * 0.535, B.y + 660, B.w * 0.42, esc(s.role || ""))}
    ${lop("bh-bdq", { x: B.x + B.w * 0.62, y: B.y + 520, w: 300, h: 50, r: -18 }, V.butDaQuang(), { m: "bh-bdq", z: 10, k: 0.5, alt: "Bút dạ quang" })}
    ${s.note ? `${lop("bh-giayghi", { x: 1420, y: 300, w: 400, h: 300, r: 2 }, V.phieu(M.gold, { dau: 14 }), { z: 6, alt: "Giấy ghi" })}${chu("bh-gn", 1460, 350, 330, tx(s.note), { r: 2 })}` : ""}
    ${lop("bh-o", { x: 1500, y: 640, w: 96, h: 336, r: 62 }, V.o(false), { m: "bh-o", z: 7, k: 0.5, alt: "Cây ô gấp" })}`; };

// 7 · BA VAI TRÒ — ô bung che chị Hoa (thay thu nhập) · cân (đóng – hưởng) · giỏ hàng (giữ sức mua)
S.bhvaitro = (s, deck) => { const it = (s.items || []).slice(0, 3), C = [110, 710, 1310];
  const vat = [`${lop("bh-o", { x: C[0] + 20, y: 270, w: 460, h: 429 }, V.o(true), { m: "bh-o", z: 7, k: 0.9, alt: "Ô che" })}${hoa({ x: C[0] + 175, y: 420, w: 150 })}`,
    lop("bh-can", { x: C[1] + 60, y: 300, w: 380, h: 362 }, V.can(), { m: "bh-can", z: 7, k: 0.8, alt: "Cân hai đĩa" }),
    lop("bh-gio", { x: C[2] + 60, y: 340, w: 380, h: 326 }, V.gioHang(), { m: "bh-gio", z: 7, k: 0.8, alt: "Giỏ hàng" })];
  return `${tieuDe(s, { w: 1500 })}${it.map((x, k) => `${vat[k]}${chu("bh-vn", C[k], 730, 500, esc(x.name || ""))}${chu("bh-vw", C[k], 784, 500, esc(x.who || ""))}${chu("bh-vd", C[k], 826, 480, tx(x.desc || ""))}`).join("")}`; };

// 11 · CON ĐƯỜNG ĐỜI — 15 khối năm của slide trước nối thành đường; 5 điểm dừng; phong bì lương hưu ở điểm nghỉ hưu
const DUONG = (t) => ({ x: 230 + 1300 * t, y: 800 - 60 * t - 50 * Math.sin(Math.PI * 2 * t) });
const STOP = [{ k: 2, ic: "nhietKe" }, { k: 5, ic: "binhSua" }, { k: 9, ic: "hopCuuThuong" }, { k: 14, ic: "phongBi" }, { k: 17.4, ic: "hoaSen" }];
const ICON = { nhietKe: [V.nhietKe, 60, 180], binhSua: [V.binhSua, 80, 180], hopCuuThuong: [V.hopCuuThuong, 150, 120], phongBi: [V.phongBi, 170, 111], hoaSen: [V.hoaSen, 150, 141] };
const icLop = (k, ic, R) => (ic === "phongBi" ? lop("bh-phongbi", { x: R.x, y: R.y, w: R.w, h: R.w * 170 / 260, r: R.r || -4 }, V.phongBi(), { m: "bh-phongbi", z: 11, k: 0.6, alt: "Phong bì lương hưu" }) : lop(`bh-ic${k + 1}`, { x: R.x, y: R.y, w: R.w, h: R.h, r: R.r || 0 }, ICON[ic][0](), { m: `bh-ic${k + 1}`, z: 11, k: 0.5, alt: "Biểu tượng chế độ" }));
S.bhduong = (s, deck) => { const st = (s.stages || []).slice(0, 5);
  const khoi = Array.from({ length: 15 }, (_, k) => { const P = DUONG(k / 15); return lop(`bh-kn${k + 1}`, { x: P.x - 44, y: P.y - 44, w: 88, h: 88, r: ((k * 17) % 9) - 4 }, V.khoiNam(k + 1), { m: `bh-kn${k + 1}`, z: 8, k: 0.4, alt: `Năm đóng thứ ${k + 1}` }); }).join("");
  const dung = st.map((x, k) => { const S0 = STOP[k], P = DUONG(S0.k / 15), [, w, h] = ICON[S0.ic], cy = P.y - 70 - h;
    const ic = icLop(k, S0.ic, { x: P.x - w / 2, y: cy, w, h });
    const ty = Math.max(286, cy - 176);
    const lx = Math.min(P.x, 1660) - 140;
    return `${ic}${chu("bh-dw", lx, ty, 280, esc(x.when || ""), { align: "center", color: k === (s.focus ?? 3) ? M.gold : "efe3c4" })}${chu("bh-de", lx, ty + 44, 280, esc(x.event || ""), { align: "center" })}${chu("bh-dl2", lx, ty + 112, 280, esc(x.link || ""), { align: "center" })}`; }).join("");
  return `${chu("bh-k", 110, 92, 1300, esc(s.kicker || ""))}${chu("bh-h2", 110, 132, 1400, tx(s.title || ""), { size: 58 })}${hoa({ x: 64, y: 560, w: 130 })}${khoi}${dung}${s.note ? chu("bh-src", 110, 970, 1500, esc(s.note)) : ""}`; };

// 12 · NĂM PHIẾU CHẾ ĐỘ — biểu tượng ở điểm dừng bay lên thành dấu đầu phiếu; phiếu hưu trí là phiếu chính
S.bhphieu5 = (s, deck) => { const cols = (s.cols || []).slice(0, 5), rows = s.rows || [], W = 330, G = 18;
  return `${tieuDe(s, { w: 1500 })}${cols.map((c, k) => { const X = 110 + k * (W + G), Y = 290, chinh = k === s.focus, S0 = STOP[k], [, w, h] = ICON[S0.ic], sc = S0.ic === "phongBi" ? 0.7 : 0.55;
    return `${lop(`bh-phieu5-${k}`, { x: X, y: Y, w: W, h: 650, r: chinh ? 0 : [-0.8, 0.6, -0.4, 0, 0.7][k] }, V.phieu(chinh ? M.gold : M.green, { dau: chinh ? 18 : 12 }), { z: 5, alt: "Phiếu chế độ" })}
      ${icLop(k, S0.ic, { x: X + W / 2 - (w * sc) / 2, y: Y + 34, w: w * sc, h: h * sc })}
      ${chu("bh-fn", X + 24, Y + 170, W - 48, esc(c.name || ""), { align: "center" })}
      ${(c.cells || []).slice(0, 2).map((t, j) => `${chu("bh-fr", X + 24, Y + 240 + j * 200, W - 48, esc(rows[j]?.label || ""))}${chu("bh-fc", X + 24, Y + 276 + j * 200, W - 48, f(t))}`).join("")}`; }).join("")}`; };

// 13 · CÔNG THỨC (hai bước) — đồng hồ %: kim 45 % (nữ đóng 15 năm) → 65 % (nữ đóng 25 năm); phong bì dày lên
S.bhcongthuc = (s, deck, b) => { const t = s.terms || [], GX = 640, GY = 340, GW = 640, k = GW / 520, cx = GX + 260 * k, cy = GY + 260 * k, p = b === 2 ? 65 : 45, kk = (190 * k) / 218;
  const kim = lop("bh-kim", { x: cx - 20 * kk, y: cy - 230 * kk, w: 40 * kk, h: 460 * kk, r: 1.8 * p - 90 }, V.kimDongHo(), { m: "bh-kim", z: 9, k: 0.4, shadow: false, alt: "Kim chỉ tỷ lệ" });
  const pb = b === 2 ? { x: 1420, y: 330, w: 340 } : { x: 1450, y: 360, w: 280 };
  return `${tieuDe(s, { w: 1500 })}${lop("bh-dongho", { x: GX, y: GY, w: GW, h: 320 * k }, V.dongHo(), { m: "bh-dongho", z: 7, k: 1.1, alt: "Đồng hồ tỷ lệ hưởng" })}${kim}
    ${lop("bh-luong", { x: 130, y: 380, w: 380, h: 309 }, V.phieuLuong(), { m: "bh-luong", z: 7, k: 0.7, alt: "Xấp phiếu lương" })}
    ${lop("bh-phongbi", { x: pb.x, y: pb.y, w: pb.w, h: pb.w * 170 / 260, r: -4 }, V.phongBi(), { m: "bh-phongbi", z: 9, k: 0.7, alt: "Phong bì lương hưu" })}
    ${chu("bh-ftm", 130, 710, 400, `<b>BQ</b> ${esc(t[1]?.label || "")}`)}${chu("bh-ftn", 130, 760, 400, esc(t[1]?.note || ""))}
    ${chu("bh-ftm", 1420, 610, 400, `<b>${esc(s.result?.sym || "LH")}</b> ${esc(s.result?.label || "")}`)}
    ${chu("bh-ctp", GX, cy + 70, GW, `<b>${p}%</b> ${esc(b === 2 ? (s.buoc2 || "nữ đóng 25 năm") : (s.buoc1 || "nữ đóng 15 năm"))}`, { align: "center" })}
    ${chu("bh-cte", 130, 880, 1700, f(b === 2 ? (s.example || "") : (t[0]?.note || "")))}${s.note ? chu("bh-src", 130, 958, 1600, esc(s.note)) : ""}`; };

// 15 · 17 · BIỂU ĐỒ CỘT IN TRÊN TỜ RỜI (hai bước) — bước 1 cột ở mức 0, bước 2 cột mọc đúng số liệu; nguyên nhân đặt tại năm; thẻ kết luận kẹp mép
S.bhcot2 = (s, deck, b) => { const R = { x: 70, y: 60, w: 1440, h: 950 }, it = s.items || [], n = it.length, hi = Math.max(...it.map((x) => x.value)) * 1.12, X0 = R.x + 90, X1 = R.x + (s.insight ? 1270 : 1380), Y0 = R.y + 700, Y1 = R.y + 330;
  const cw = (X1 - X0) / n, bw = cw * 0.58, xs = (k) => X0 + cw * (k + 0.5), ys = (v) => Y0 - (Y0 - Y1) * v / hi;
  const mau = (x, k) => (x.focus ? M.gold2 : x.tone === "bad" || (k && x.value < it[k - 1].value) ? M.red : M.ink);
  const cot = it.map((x, k) => { const y = b === 2 ? ys(x.value) : Y0 - 6; return lop(`bh-cot${k + 1}`, { x: xs(k) - bw / 2, y, w: bw, h: Y0 - y }, `<svg viewBox="0 0 10 10" width="100%" height="100%" preserveAspectRatio="none"><rect width="10" height="10" fill="#${mau(x, k)}"/></svg>`, { m: `bh-cot${k + 1}`, z: 9, shadow: false, alt: `Cột ${x.label}` }); }).join("");
  const nhan = it.map((x, k) => `${chu("bh-cy", xs(k) - 50, Y0 + 14, 100, esc(x.label), { align: "center", color: x.focus ? M.ink : "5a5040" })}${b === 2 ? chu("bh-cv2", xs(k) - 70, ys(x.value) - 50, 140, esc(x.display || num(x.value)), { align: "center", color: mau(x, k) }) : ""}`).join("");
  const bands = (s.bands || []).map((bd) => { const a = it.findIndex((x) => x.label === bd.from), e = it.findIndex((x) => x.label === bd.to); if (a < 0 || e < 0) return ""; const x0 = xs(a) - cw / 2, x1 = xs(e) + cw / 2;
    return `${lop("bh-band", { x: x0, y: Y1 - 40, w: x1 - x0, h: Y0 - Y1 + 40 }, `<svg viewBox="0 0 100 100" width="100%" height="100%" preserveAspectRatio="none"><rect width="100" height="100" fill="#b8322a" fill-opacity=".08"/><path d="M0.5 0 V100 M99.5 0 V100" stroke="#b8322a" stroke-opacity=".5" stroke-width="1" stroke-dasharray="4 4" vector-effect="non-scaling-stroke"/></svg>`, { z: 8, shadow: false, alt: "Dải giai đoạn" })}${chu("bh-bl", x0, Y1 - 82, x1 - x0, esc(String(bd.label).toUpperCase()), { align: "center", color: M.red })}`; }).join("");
  const whys = it.map((x, k) => (x.why ? k : -1)).filter((k) => k >= 0).slice(0, 4);
  const so = b === 2 ? whys.map((k, j) => chu("bh-wn2", xs(k) + bw / 2 - 6, ys(it[k].value) - 90, 40, String(j + 1))).join("") : "";
  const why = b === 2 ? whys.map((k, j) => chu("bh-wt2", R.x + 90 + (j % 2) * 640, R.y + 764 + Math.floor(j / 2) * 70, 610, `<span class="bh-wnb">${j + 1}</span> <b>${esc(it[k].label)}</b> ${f(it[k].why)}`)).join("") : "";
  const ins = s.insight || {};
  const the = s.insight ? `${lop("bh-ins", { x: 1420, y: 300, w: 430, h: 520, r: 2 }, `<svg viewBox="0 0 430 520" width="100%" height="100%" preserveAspectRatio="none">${giayNen(uid("ip"), 430, 520, "fbf4e2")}<rect width="430" height="16" fill="#${M.gold}"/></svg>`, { m: "bh-ins", z: 10, alt: "Thẻ kết luận" })}${lop("bh-kep", { x: 1478, y: 258, w: 44, h: 110, r: 2 }, kep(), { z: 11, k: 0.7, alt: "Kẹp giấy" })}
    ${chu("bh-iv", 1456, 360, 370, f(ins.value || ""), { r: 2, size: String(ins.value || "").length > 5 ? 96 : 128 })}${chu("bh-iu", 1456, 490, 370, f(ins.unit || ""), { r: 2 })}${chu("bh-it", 1456, 590, 360, f(ins.text || ""), { r: 2 })}` : "";
  return `${lop("bh-roi", R, toRoi(""), { m: "bh-roi", z: 6, k: 2.2, alt: "Tờ rời" })}${chu("bh-ck", R.x + 60, R.y + 70, 900, esc(s.kicker || ""))}${chu("bh-ch", R.x + 60, R.y + 108, s.insight ? 1250 : 1340, tx(s.title || ""), { size: 50 })}${chu("bh-cu", R.x + 60, R.y + 236, 900, esc(s.unit ? `Đơn vị: ${s.unit}` : ""))}
    ${lop("bh-truc", { x: X0 - 20, y: Y0, w: X1 - X0 + 40, h: 4 }, `<svg viewBox="0 0 10 1" width="100%" height="100%" preserveAspectRatio="none"><rect width="10" height="1" fill="#276a58"/></svg>`, { z: 8, shadow: false, alt: "Trục" })}${bands}${cot}${nhan}${so}${why}${the}${s.note ? chu("bh-src", R.x + 60, R.y + 908, 1300, esc(s.note)) : ""}`; };

// 16 · ĐÃ PHỦ BAO NHIÊU — 50 người tí hon (1 người = 2 %): 21 dưới ô, 29 ngoài mưa
S.bhche = (s, deck) => { const c0 = (s.cols || [])[0] || {}, c1 = (s.cols || [])[1] || {}, n0 = c0.n || 21, n1 = c1.n || 29;
  const duoi = Array.from({ length: n0 }, (_, k) => lop(`bh-tn${k + 1}`, { x: 230 + (k % 7) * 76, y: 540 + Math.floor(k / 7) * 104, w: 52, h: 95 }, V.nguoiNho("4f86a8"), { m: `bh-tn${k + 1}`, z: 9, k: 0.25, alt: "Người có BHXH" })).join("");
  const ngoai = Array.from({ length: n1 }, (_, k) => lop(`bh-tn${n0 + k + 1}`, { x: 1010 + (k % 10) * 80, y: 540 + Math.floor(k / 10) * 104, w: 52, h: 95 }, V.nguoiNho("9aa3b2", true), { m: `bh-tn${n0 + k + 1}`, z: 9, k: 0.25, alt: "Người chưa có BHXH" })).join("");
  return `${tieuDe(s, { w: 1500 })}${lop("bh-o", { x: 150, y: 250, w: 690, h: 644 }, V.o(true), { m: "bh-o", z: 7, k: 1.2, alt: "Ô che BHXH" })}${duoi}
    ${lop("bh-mua", { x: 980, y: 300, w: 840, h: 560 }, V.mua(840, 560), { z: 8, shadow: false, alt: "Mưa" })}${ngoai}
    ${chu("bh-pc", 150, 856, 700, `<b>${esc(c0.value || "42")}%</b> ${esc(c0.label || "")}`)}${chu("bh-pc", 1010, 856, 820, `<b class="do">${esc(c1.value || "58")}%</b> ${esc(c1.label || "")}`)}
    ${chuGiai("bh-cg-nguoi", 1290, 92, V.nguoiNho(), s.legend || "Mỗi người = 2% lực lượng lao động", 560)}${nguon(s.source)}`; };

// 19 · RÚT MỘT LẦN (hai bước) — 8 chồng sổ (1 chồng = 100.000 người) cạnh bình quỹ → bước 2 đi ra cửa, nửa đã khuất
S.bhrut = (s, deck, b) => { const D = { x: 1540, y: 300, w: 300, h: 488 };
  const chong = Array.from({ length: 8 }, (_, k) => { const P = b === 2 ? (k < 4 ? { x: 1010 + k * 120, y: 600 + (k % 2) * 26, r: 4, s: 1 } : { x: 1600 + (k - 4) * 50, y: 560 - (k - 4) * 34, r: 2, s: 0.8 - (k - 4) * 0.13 }) : { x: 620 + (k % 4) * 140, y: 470 + Math.floor(k / 4) * 180, r: ((k * 23) % 9) - 4, s: 1 };
    return lop(`bh-cs${k + 1}`, { x: P.x, y: P.y, w: 120 * P.s, h: 150 * P.s, r: P.r }, V.chongSo(), { m: `bh-cs${k + 1}`, z: 9, k: 0.5, alt: "Chồng sổ BHXH (100.000 người)" }); }).join("");
  return `${chu("bh-k", 110, 92, 1300, esc(s.kicker || ""))}${chu("bh-h2", 110, 132, 1500, tx(s.title || ""), { size: 54 })}
    ${chu("bh-hero", 100, 300, 520, esc(s.num || ""))}${chu("bh-heu", 110, 640, 460, esc(s.unit || ""))}${s.sub ? chu("bh-sub2", 110, 760, 480, tx(s.sub)) : ""}
    ${lop("bh-binh-sau", { x: 600, y: 300, w: 140, h: 182 }, V.binhQuySau(), { m: "bh-binh-sau", z: 7, k: 0.4, alt: "Bình quỹ" })}${lop("bh-xu-quy", { x: 612, y: 390, w: 116, h: 86 }, V.xuTrongBinh(), { m: "bh-xu-quy", z: 8, shadow: false, alt: "Xu" })}${lop("bh-binh-truoc", { x: 600, y: 300, w: 140, h: 182 }, V.binhQuyKinh("QUỸ"), { m: "bh-binh-truoc", z: 9, shadow: false, alt: "Bình quỹ" })}
    ${lop("bh-cua", D, V.cua(), { m: "bh-cua", z: 6, k: 0.7, alt: "Cửa ra" })}${chong}
    ${chuGiai("bh-cg-chong", 760, 300, V.chongSo(), s.legend || "1 chồng sổ = 100.000 người", 540)}`; };

// 22 · ĐẠT ĐƯỢC (hai bước) — chồng giấy thủ tục 114 tờ xẹp còn 25, điện thoại sáng; ba thẻ kết quả bên phải
S.bhdat = (s, deck, b) => { const c = s.cells || [], hS = b === 2 ? 110 : 470;
  const the = [c[0], c[2], c[3]].filter(Boolean).map((x, k) => `${lop(`bh-dt${k}`, { x: 1180, y: 290 + k * 230, w: 640, h: 210, r: [-0.6, 0.5, -0.3][k] }, V.phieu(M.green, { dau: 10 }), { z: 5, alt: "Kết quả" })}${chu("bh-dh", 1214, 314 + k * 230, 570, esc(x.head || ""))}${chu("bh-dv2", 1214, 364 + k * 230, 200, esc(x.value || "✓"))}${chu("bh-dtx", 1430, 370 + k * 230, 360, f(x.text || ""))}`).join("");
  const c1 = c[1] || {};
  return `${tieuDe(s, { w: 1050 })}${lop("bh-giay", { x: 150, y: 900 - hS, w: 420, h: hS }, V.chongGiay(hS), { m: "bh-giay", z: 7, k: 0.8, alt: "Chồng giấy thủ tục" })}
    ${chu("bh-dsn", 150, 900 - hS - 120, 440, b === 2 ? esc(c1.value || "25") : "114", { align: "center", color: b === 2 ? M.gold : "b9c2cf" })}${chu("bh-dsl", 150, 916, 440, b === 2 ? esc(c1.head || "") : esc(s.truoc || "Thủ tục năm 2015"), { align: "center" })}
    ${lop("bh-dthoai", { x: 690, y: 330, w: 300, h: 575 }, V.dienThoai(b === 2), { m: "bh-dthoai", z: 8, k: 0.8, alt: "Điện thoại — sổ BHXH điện tử" })}${b === 2 ? chu("bh-dsl", 640, 916, 400, esc(c1.text || ""), { align: "center" }) : ""}${the}`; };

// 23 · 24 · HẠN CHẾ → KIẾN NGHỊ — ba vật quay lại từ phần thực trạng, mỗi vật một cột; slide kiến nghị đặt vật vá lên đúng vật đó
const VAT3 = (kn) => [
  `${lop("bh-cua", { x: 190, y: 290, w: 240, h: 390 }, V.cua(), { m: "bh-cua", z: 6, k: 0.6, alt: "Cửa ra" })}${lop("bh-cs1", { x: 360, y: 520, w: 100, h: 125, r: 6 }, V.chongSo(), { m: "bh-cs1", z: 9, k: 0.4, alt: "Chồng sổ" })}${kn ? lop("bh-khoa", { x: 330, y: 430, w: 130, h: 156, r: -6 }, V.oKhoa(), { m: "bh-khoa", z: 10, k: 0.5, alt: "Ổ khoá" }) : ""}`,
  `${lop("bh-binh-sau", { x: 800, y: 290, w: 300, h: 390 }, V.binhQuySau(), { m: "bh-binh-sau", z: 7, k: 0.6, alt: "Bình quỹ" })}${lop("bh-xu-quy", { x: 826, y: 470, w: 248, h: 200 }, V.xuTrongBinh(), { m: "bh-xu-quy", z: 8, shadow: false, alt: "Xu" })}${lop("bh-binh-truoc", { x: 800, y: 290, w: 300, h: 390 }, V.binhQuyKinh("QUỸ"), { m: "bh-binh-truoc", z: 9, shadow: false, alt: "Bình quỹ" })}${lop("bh-rao", { x: 790, y: 250, w: 320, h: 171 }, V.raoChan(), { m: "bh-rao", z: 10, k: 0.5, alt: "Rào chắn: xu không vào quỹ" })}${kn ? lop("bh-va", { x: 1010, y: 520, w: 120, h: 120, r: 10 }, V.miengVa(), { m: "bh-va", z: 11, k: 0.4, alt: "Miếng vá" }) : ""}`,
  `${lop("bh-o", { x: kn ? 1300 : 1350, y: kn ? 250 : 280, w: kn ? 500 : 360, h: kn ? 466 : 336 }, V.o(true), { m: "bh-o", z: 7, k: 0.8, alt: "Ô che" })}${Array.from({ length: 8 }, (_, k) => lop(`bh-tn${k + 1}`, { x: 1330 + (k % 4) * 110, y: (k < 4 ? 520 : 610) + (kn && k < 4 ? -40 : 0), w: 50, h: 92 }, V.nguoiNho(kn && k < 4 ? "4f86a8" : "9aa3b2", !(kn && k < 4)), { m: `bh-tn${k + 1}`, z: 9, k: 0.25, alt: "Người lao động" })).join("")}`];
const ba = (s, kn) => { const it = (s.items || []).slice(0, 3), C = [110, 710, 1310], lab = s.labels || [];
  return `${tieuDe(s, { w: 1600 })}${VAT3(kn).join("")}${it.map((x, k) => `${lop(`bh-hc${k}`, { x: C[k], y: 700, w: 520, h: 250, r: [-0.6, 0.4, -0.3][k] }, V.phieu(kn ? M.green : M.red, { dau: 10 }), { z: 5, alt: "Thẻ" })}
    ${chu("bh-hn", C[k] + 30, 726, 460, esc(x.name || ""))}${chu("bh-hw", C[k] + 30, 776, 460, `${lab[0] ? `<i>${esc(lab[0])}:</i> ` : ""}${esc(x.who || "")}`)}${chu("bh-hd", C[k] + 30, 818, 460, f(x.desc || ""))}${x.ref ? chu("bh-href", C[k] + 30, 1004, 460, esc(x.ref)) : ""}`).join("")}`; };
S.bhhanche = (s) => ba(s, false);
S.bhkiennghi = (s) => ba(s, true);

// 25 · TRẮC NGHIỆM — anh Nam + 15 khối năm; 4 phong bì là 4 đáp án (bấm); slide sai / đúng riêng
const NAM_VAI = { kieuToc: "ngan", ao: "6a8f4f", quan: "39465c", vat: "so", da: "e6b48d" };
S.bhhoi = (s, deck, b) => { const op = (s.options || []).slice(0, 4), id = s.id || "cau-hoi";
  const nam = (o) => lop("bh-nam", { x: 130, y: 380, w: 190, h: 371 }, V.nguoi({ ...NAM_VAI, ...o }), { m: "bh-nam", z: 9, k: 0.6, alt: "Anh Nam" });
  const khoi = Array.from({ length: 15 }, (_, k) => lop(`bh-nk${k + 1}`, { x: 360 + (k % 5) * 70, y: 600 + Math.floor(k / 5) * 70, w: 60, h: 60 }, V.khoiNam(k + 1), { m: `bh-nk${k + 1}`, z: 8, k: 0.3, alt: "Năm đóng" })).join("");
  if (b === "sai" || b === "dung") { const d = b === "dung" ? s.right || {} : s.wrong || {}, ok = op.findIndex((x) => x.ok);
    return `${nam(b === "sai" ? { nhan: "lo" } : {})}${khoi}${b === "dung" ? `${lop(`bh-pb-op${ok}`, { x: 1200, y: 300, w: 520, h: 340, r: -3 }, V.phongBi(op[ok]?.text?.toUpperCase().slice(0, 16) || "LƯƠNG HƯU"), { m: `bh-pb-op${ok}`, z: 9, k: 0.9, alt: "Phong bì đáp án đúng" })}` : ""}
      ${chu("bh-qd", 110, 150, 1400, esc(d.title || ""), { color: b === "dung" ? M.gold : "e46a5a" })}${chu("bh-qx", 760, b === "dung" ? 680 : 380, 1000, f(d.text || d.hint || ""))}
      ${chu("bh-nut", b === "dung" ? 1500 : 760, 920, 300, esc(d.button || (b === "dung" ? "Tiếp tục" : "Thử lại")), { go: b === "dung" ? (s.next || null) : id, align: "center" })}`; }
  return `${chu("bh-k", 110, 92, 1300, esc(s.kicker || ""))}${chu("bh-h2", 110, 132, 1500, tx(s.title || ""), { size: 62 })}${nam({})}${khoi}
    ${op.map((x, k) => { const X = 900 + (k % 2) * 470, Y = 320 + Math.floor(k / 2) * 300;
      return `${lop(`bh-pb-op${k}`, { x: X, y: Y, w: 420, h: 275, r: [-3, 2, 1, -2][k] }, V.phongBi(""), { m: `bh-pb-op${k}`, z: 9, k: 0.7, go: `${id}-${x.ok ? "dung" : "sai"}`, alt: `Phương án ${"ABCD"[k]}` })}${chu("bh-opl", X + 30, Y + 20, 60, "ABCD"[k], { go: `${id}-${x.ok ? "dung" : "sai"}`, r: [-3, 2, 1, -2][k] })}${chu("bh-opt", X + 40, Y + 190, 340, esc(x.text), { align: "center", go: `${id}-${x.ok ? "dung" : "sai"}`, r: [-3, 2, 1, -2][k] })}`; }).join("")}
    ${chu("bh-hint", 900, 952, 900, "Bấm vào một phong bì để chọn")}`; };

// 26 · KẾT LUẬN — ba tập hồ sơ về đúng hàng của slide 4, mỗi tập ghi câu trả lời; nhận định đóng dấu
S.bhtraloi = (s, deck) => { const an = (s.answers || []).slice(0, 3);
  return `${tieuDe(s, { w: 1500 })}${an.map((x, k) => { const P = { x: 110 + k * 590, y: 280, w: 560 }; return `${tapLop(k, P, { bieu: "" })}${chu("bh-bso", P.x + 34, P.y + 110, 140, `0${k + 1}`)}${chu("bh-aq", P.x + 40, P.y + 196, 470, esc(x.q || ""))}${chu("bh-aa", P.x + 40, P.y + 290, 470, f(x.a || ""))}`; }).join("")}
    ${s.verdict ? `${lop("bh-verdict", { x: 110, y: 820, w: 1700, h: 130, r: -0.6 }, dauMuc(1700, 130, M.red, { seed: 51 }), { shadow: false, z: 10, alt: "Nhận định" })}${chu("bh-vd2", 150, 856, 1620, `<b>Nhận định:</b> ${f(s.verdict)}`, { color: M.red, r: -0.6 })}` : ""}`; };

// 27 · GHI NHỚ — chị Hoa cầm phong bì lương hưu; ba thẻ số (bấm để quay lại slide chứng minh)
S.bhghinho = (s, deck) => { const ch = (s.chips || []).slice(0, 3);
  return `${hoa({ x: 1350, y: 300, w: 300 })}${lop("bh-phongbi", { x: 1500, y: 620, w: 300, h: 196, r: -8 }, V.phongBi(), { m: "bh-phongbi", z: 13, k: 0.7, alt: "Phong bì lương hưu" })}
    ${chu("bh-gh", 110, 150, 1180, tx((s.lines || []).join("\n")))}
    ${ch.map((x, k) => { const X = 110 + k * 400, Y = 620; return `${lop(`bh-chip${k}`, { x: X, y: Y, w: 370, h: 240, r: [-2, 1, -1][k] }, V.phieu(M.gold, { dau: 12 }), { z: 6, go: x.go, alt: "Thẻ ghi nhớ" })}${chu("bh-chn", X + 30, Y + 40, 320, esc(x.n), { go: x.go, r: [-2, 1, -1][k] })}${chu("bh-cht", X + 30, Y + 150, 320, esc(x.text), { go: x.go, r: [-2, 1, -1][k] })}`; }).join("")}
    ${s.basis ? chu("bh-src", 110, 940, 1200, esc(s.basis)) : ""}`; };

// KẾT — lùi máy quay: sổ gấp lại, tờ rời cất dưới sổ; lời cảm ơn trên mặt bàn, thẻ nhóm
S.bhket = (s, deck, c0) => { const c = cam(s.cam || { x: 1000, y: 560, z: 0.9 });
  const roi = lop("bh-roi", chieu(c, VAT.roi), toRoi(), { m: "bh-roi", z: 3, alt: "Tờ rời quá trình đóng bảo hiểm xã hội" });
  const team = (s.team || []).slice(0, 4).map((t) => esc(t.name)).join(" · ");
  return `${roi}${sach(c, false, { r: 3 })}${vatBan(c)}${hoa({ x: 905, y: 610, w: 150 })}${thuoc({ hop: { x: 760, y: 846, w: 150 }, day: { x: 770, y: 935, w: 30 } })}
    ${chu("bh-k", 110, 200, 900, esc(s.kicker || ""))}${chu("bh-h1", 110, 255, 860, tx(s.title || "Cảm ơn"), { size: s.titleSize || 92 })}
    ${s.message ? chu("bh-sub", 110, 600, 680, tx(s.message)) : ""}
    ${team ? `${lop("bh-the", { x: 96, y: 846, w: 640, h: 150, r: -2 }, theKraft(), { m: "bh-the", z: 6, alt: "Thẻ tên nhóm" })}${chu("bh-tn", 176, 884, 520, team, { r: -2 })}` : ""}`; };

// Tên Morph tự động cho phần tử chưa có: lớp ảnh lấy tên lớp (ổn định giữa hai slide), hộp chữ lấy tên theo NỘI DUNG
// → vật / chữ giống hệt ở hai slide kề nhau đứng yên (không mờ ra rồi mờ vào); chữ khác nội dung không bao giờ ghép (luật 3).
const bam = (t) => { let h = 5381; for (const c of t) h = ((h * 33) ^ c.codePointAt(0)) >>> 0; return h.toString(36); };
function tenMorph(html) { const dem = {};
  const mot = (ten) => { dem[ten] = (dem[ten] || 0) + 1; return dem[ten] > 1 ? `${ten}-${dem[ten]}` : ten; };
  html = html.replace(/<div class="bh-l" data-l="([^"]+)"(?! data-m)/g, (m0, l) => `<div class="bh-l" data-l="${l}" data-m="${mot(l)}" data-mt="0"`);
  return html.replace(/<div class="([^"]+)" data-t(?! data-m)( style="[^"]*">)([\s\S]*?)<\/div>/g, (m0, cls, st, inner) => `<div class="${cls}" data-t data-m="${mot(`t-${bam(cls + "|" + inner)}`)}"${st}${inner}</div>`); }

function render(s, deck, ctx, { i, n }) {
  kit.reset();
  const buoc = s.type === "bhhoi" ? [0, "sai", "dung"] : HAI_BUOC.has(s.type) ? [1, 2] : [0], id = s.id || `s${i + 1}`;
  if (s.type === "bhhoi" && !s.next) s = { ...s, next: (deck.slides[i + 1] || {}).id || `s${i + 2}` };
  return buoc.map((b) => { const html = tenMorph(S[s.type](s, deck, b));
    const sec = `<section class="s bh" data-type="${esc(s.type)}" data-title="${esc(String(s.title || "").replace(/[[\]]/g, ""))}"><div class="cv">${html}${chan(s, deck, i, n)}</div></section>`;
    return { id: b === 2 ? `${id}-b2` : typeof b === "string" ? `${id}-${b}` : id, html: sec, tu: false, trans: s.trans || "morph", dur: b === 2 ? (s.dur2 || 1300) : (s.dur || 1100), noclick: s.type === "bhhoi" && b !== "dung" }; });
}

// mặt bàn: da xanh đêm, vân sần + loang lớn, đèn ấm góc trên trái, tối dần ra mép; đường chỉ khâu viền tấm lót
const svgUri = (s) => `url("data:image/svg+xml;utf8,${encodeURIComponent(s)}")`;
const daBan = svgUri(`<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'><filter id='a' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3' seed='3'/><feColorMatrix values='0 0 0 0 .02 0 0 0 0 .04 0 0 0 0 .08 0 0 0 .55 -.1'/></filter><filter id='b' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='.006' numOctaves='3' seed='8'/><feColorMatrix values='0 0 0 0 .5 0 0 0 0 .6 0 0 0 0 .75 0 0 0 .12 -.02'/></filter><rect width='1920' height='1080' filter='url(#b)'/><rect width='1920' height='1080' filter='url(#a)'/></svg>`);
const chiKhau = svgUri(`<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'><rect x='30' y='30' width='1860' height='1020' rx='26' fill='none' stroke='#000' stroke-opacity='.35' stroke-width='6'/><rect x='34' y='34' width='1852' height='1012' rx='24' fill='none' stroke='#fff' stroke-opacity='.05' stroke-width='2'/><rect x='52' y='52' width='1816' height='976' rx='16' fill='none' stroke='#d9c08a' stroke-opacity='.5' stroke-width='3' stroke-dasharray='15 10' stroke-linecap='round'/></svg>`);
const css = `
.s.bh { background: ${chiKhau}, radial-gradient(ellipse 70% 75% at 24% 16%, rgba(255,214,150,.17), transparent 62%), radial-gradient(ellipse at 50% 50%, transparent 52%, rgba(0,0,0,.55) 100%), ${daBan}, #1a2433; color: #${M.ivory}; }
.s.bh .cv { position: absolute; inset: 0; }
.bh-l { position: absolute; } .bh-l > svg { display: block; overflow: visible; }
.s.bh [data-t] { position: absolute; }
.bh-k { font: 700 26px/1.2 var(--fb); letter-spacing: .16em; text-transform: uppercase; color: #${M.gold}; }
.bh-h1 { font: 800 96px/1.04 var(--fb); color: #${M.ivory}; text-shadow: 0 3px 18px rgba(0,0,0,.35); }
.bh-h1 em, .bh-ph em, .bh-ch em { font-style: normal; color: #${M.gold}; }
.bh-ph em, .bh-ch em { color: #${M.red}; }
.bh-sub { font: 500 31px/1.42 var(--fb); color: #b9c2cf; text-wrap: pretty; }
.bh-tn { font: 800 38px/1.15 var(--fb); color: #2a2012; } .bh-tns { font: 600 24px/1.3 var(--fb); color: #5a4626; }
.bh-pg { font: 400 30px/1 var(--fd); color: #${M.gold}; letter-spacing: .04em; } .bh-pg small { font-size: 22px; color: #8790a0; } .bh-pgl { margin-left: 22px; font: 600 19px/1 var(--fb); letter-spacing: .08em; color: #7d8696; }
.bh-fh { font: 800 24px/1.2 var(--fb); letter-spacing: .14em; text-transform: uppercase; color: #${M.green}; }
.bh-fl { font: 700 22px/1.2 var(--fb); letter-spacing: .1em; text-transform: uppercase; color: #8a7a58; } .bh-fv { font: 700 27px/1.25 var(--fb); color: #${M.ink}; }
.bh-pk { font: 700 21px/1.2 var(--fb); letter-spacing: .14em; text-transform: uppercase; color: #${M.green}; }
.bh-ph { font: 800 46px/1.1 var(--fb); color: #${M.ink}; }
.bh-my { font: 800 30px/1 var(--fb); } .bh-mv { font: 400 54px/1 var(--fd); } .bh-mt { font: 700 19px/1.2 var(--fb); }
.bh-ck { font: 700 22px/1.2 var(--fb); letter-spacing: .14em; text-transform: uppercase; color: #${M.green}; }
.bh-ch { font: 800 52px/1.08 var(--fb); color: #${M.ink}; }
.bh-cu { font: 600 26px/1.2 var(--fb); color: #7a6c4e; }
.bh-cv { font: 400 44px/1 var(--fd); }
.bh-wn { width: 34px; height: 34px; border-radius: 50%; background: #${M.red}; color: #fff; font: 800 20px/34px var(--fb); text-align: center; }
.bh-wt { font: 500 26px/1.3 var(--fb); color: #3d4658; } .bh-wt b { color: #${M.ink}; font-weight: 800; }
.bh-iv { font: 400 128px/1 var(--fd); color: #${M.gold2}; } .bh-iu { font: 800 34px/1.15 var(--fb); color: #${M.ink}; } .bh-it { font: 500 26px/1.38 var(--fb); color: #4a4232; }
.bh-dk { font: 400 52px/1 var(--fd); letter-spacing: .04em; }
.bh-h2 { font: 800 62px/1.08 var(--fb); color: #${M.ivory}; text-shadow: 0 3px 16px rgba(0,0,0,.35); } .bh-h2 em, .bh-q em, .bh-qb em { font-style: normal; color: #${M.gold}; }
.bh-sub2 { font: 500 30px/1.4 var(--fb); color: #b9c2cf; }
.bh-q { font: 800 92px/1.02 var(--fb); color: #${M.ivory}; } .bh-qb { font: 400 120px/1 var(--fd); color: #${M.gold}; letter-spacing: .01em; }
.bh-nam { font: 700 28px/1.25 var(--fb); color: #d8c08a; }
.bh-sv { font: 400 92px/1 var(--fd); } .bh-svl { font: 700 28px/1.2 var(--fb); color: #b9c2cf; }
.bh-d22 { font: 400 44px/1 var(--fd); } .bh-d22 small { display: block; margin-top: 6px; font: 800 26px/1.15 var(--fb); }
.bh-pn { font: 800 40px/1.1 var(--fb); color: #${M.ink}; } .bh-pw { font: 700 26px/1.2 var(--fb); color: #${M.green}; letter-spacing: .02em; } .bh-pd { font: 500 27px/1.36 var(--fb); color: #3d4658; }
.bh-mt2 { font: 700 26px/1.2 var(--fb); color: #e8dcc0; }
.bh-dv { font: 400 92px/1 var(--fd); } .bh-dl { font: 800 26px/1.2 var(--fb); }
.bh-src { font: 500 26px/1.3 var(--fb); color: #8f98a8; }
.bh-rn { font: 500 34px/1.2 var(--fb); color: #d8dee8; } .bh-rn b { font: 400 54px/1 var(--fd); color: #${M.gold}; margin-right: 8px; }
.bh-rh { font: 800 26px/1.2 var(--fb); letter-spacing: .1em; text-transform: uppercase; color: #${M.green}; } .bh-rt { font: 500 32px/1.38 var(--fb); color: #${M.ink}; } .bh-rt em { font-style: normal; background: rgba(242,194,48,.45); font-weight: 800; }
.bh-qy { font: 800 30px/1 var(--fb); } .bh-qv { font: 400 40px/1 var(--fd); } .bh-qn { font: 500 26px/1.2 var(--fb); color: #4a4232; } .bh-qn b { color: #${M.ink}; font-weight: 800; } .bh-qu { font: 600 26px/1.2 var(--fb); color: #b9c2cf; }
.bh-qc { font: 700 28px/1.3 var(--fb); color: #e8dcc0; }
.bh-ct { font: 800 26px/1 var(--fb); letter-spacing: .12em; text-transform: uppercase; color: #8a6a3c; } .bh-cx { font: 700 33px/1.3 var(--fb); color: #${M.ink}; }
.bh-dm { font: 400 62px/1 var(--fd); letter-spacing: .03em; } .bh-dms { font: 800 26px/1 var(--fb); }
.bh-sh { font: 800 26px/1.2 var(--fb); letter-spacing: .1em; text-transform: uppercase; color: #${M.green}; }
.bh-bso { font: 400 64px/1 var(--fd); color: #3b2a14; } .bh-bq { font: 800 32px/1.22 var(--fb); color: #2a1f10; } .bh-hint { font: 600 26px/1.2 var(--fb); color: #8f98a8; }
.bh-cso { font: 400 300px/1 var(--fd); color: #${M.gold}; opacity: .9; }
.bh-qt { font: 500 36px/1.42 var(--fb); color: #${M.ink}; } .bh-qt em { font-style: normal; font-weight: 800; background: linear-gradient(transparent 12%, rgba(242,211,58,.85) 12%, rgba(242,211,58,.85) 92%, transparent 92%); }
.bh-qby { font: 800 28px/1.2 var(--fb); color: #7a2230; } .bh-qro { font: 600 26px/1.3 var(--fb); color: #6b5e45; } .bh-gn { font: 800 32px/1.3 var(--fb); color: #${M.ink}; }
.bh-vn { font: 800 40px/1.1 var(--fb); color: #${M.ivory}; } .bh-vw { font: 800 26px/1.2 var(--fb); color: #8fc7ad; } .bh-vd { font: 500 28px/1.38 var(--fb); color: #c9d0db; }
.bh-dw { font: 400 38px/1 var(--fd); } .bh-de { font: 700 26px/1.25 var(--fb); color: #e8dcc0; } .bh-dl2 { font: 800 26px/1.2 var(--fb); color: #8fc7ad; }
.bh-fn { font: 800 32px/1.1 var(--fb); color: #${M.ink}; } .bh-fr { font: 800 26px/1.2 var(--fb); letter-spacing: .04em; color: #${M.green}; } .bh-fc { font: 600 28px/1.3 var(--fb); color: #3d4658; } .bh-fc em { font-style: normal; font-weight: 800; color: #${M.red}; }
.bh-ftm { font: 700 28px/1.2 var(--fb); color: #e8dcc0; } .bh-ftm b { font: 400 54px/1 var(--fd); color: #${M.gold}; margin-right: 10px; } .bh-ftn { font: 500 26px/1.35 var(--fb); color: #b9c2cf; }
.bh-ctp { font: 700 32px/1.2 var(--fb); color: #e8dcc0; } .bh-ctp b { font: 400 72px/1 var(--fd); color: #${M.gold}; margin-right: 12px; } .bh-cte { font: 600 32px/1.35 var(--fb); color: #e8dcc0; } .bh-cte em { font-style: normal; color: #${M.gold}; font-weight: 800; }
.bh-cy { font: 700 26px/1 var(--fb); } .bh-cv2 { font: 400 40px/1 var(--fd); } .bh-bl { font: 800 26px/1 var(--fb); letter-spacing: .1em; }
.bh-wn2 { width: 40px; height: 40px; border-radius: 50%; background: #${M.red}; color: #fff; font: 800 24px/40px var(--fb); text-align: center; }
.bh-wt2 { font: 500 26px/1.3 var(--fb); color: #3d4658; } .bh-wt2 b { color: #${M.ink}; font-weight: 800; } .bh-wnb { display: inline-block; width: 32px; height: 32px; border-radius: 50%; background: #${M.red}; color: #fff; font: 800 20px/32px var(--fb); text-align: center; }
.bh-pc { font: 700 30px/1.3 var(--fb); color: #e8dcc0; } .bh-pc b { font: 400 72px/1 var(--fd); color: #${M.gold}; margin-right: 12px; } .bh-pc b.do { color: #e46a5a; }
.bh-hero { font: 400 300px/1 var(--fd); color: #${M.gold}; } .bh-heu { font: 800 34px/1.2 var(--fb); color: #${M.ivory}; }
.bh-dsn { font: 400 110px/1 var(--fd); } .bh-dsl { font: 700 28px/1.25 var(--fb); color: #e8dcc0; }
.bh-dv2 { font: 400 72px/1 var(--fd); color: #${M.green}; } .bh-dh { font: 800 30px/1.15 var(--fb); color: #${M.ink}; } .bh-dtx { font: 500 26px/1.3 var(--fb); color: #4a4232; }
.bh-hn { font: 800 38px/1.1 var(--fb); color: #${M.ink}; } .bh-hw { font: 800 26px/1.2 var(--fb); color: #${M.red}; } .bh-hw i { font-style: normal; color: #6b5e45; font-weight: 600; } .bh-hd { font: 500 27px/1.3 var(--fb); color: #3d4658; } .bh-href { font: 700 26px/1 var(--fb); color: #8f98a8; }
.bh-qd { font: 800 110px/1 var(--fb); } .bh-qx { font: 600 36px/1.4 var(--fb); color: #e8dcc0; } .bh-qx em { font-style: normal; color: #${M.gold}; font-weight: 800; }
.bh-nut { font: 800 30px/1 var(--fb); color: #1a2433; background: #${M.gold}; padding: 18px 0; border-radius: 10px; }
.bh-opl { font: 400 56px/1 var(--fd); color: #6e5426; } .bh-opt { font: 800 32px/1.15 var(--fb); color: #3b2a14; }
.bh-aq { font: 800 28px/1.2 var(--fb); color: #2a1f10; } .bh-aa { font: 600 28px/1.3 var(--fb); color: #3b2a14; } .bh-aa em { font-style: normal; font-weight: 800; }
.bh-vd2 { font: 600 34px/1.25 var(--fb); } .bh-vd2 b { font-weight: 800; }
.bh-gh { font: 800 120px/1.02 var(--fb); color: #${M.ivory}; } .bh-gh em { font-style: normal; color: #${M.gold}; }
.bh-chn { font: 400 92px/1 var(--fd); color: #${M.gold2}; } .bh-cht { font: 700 28px/1.25 var(--fb); color: #${M.ink}; }
.bh-kt { font: 700 31px/1.3 var(--fb); color: #${M.ink}; } .bh-kr { font: 800 26px/1 var(--fb); color: #${M.red}; letter-spacing: .04em; }

.bh-cg { font: 800 26px/1.2 var(--fb); color: #3b2a14; }`;

module.exports = { TYPES, render, css, cam, chieu };
