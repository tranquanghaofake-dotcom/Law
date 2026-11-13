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

const TYPES = ["bhbia", "bhmo", "bhcot", "bhket"];
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
  return `<div class="bh-l" data-l="${name}"${o.m ? ` data-m="${o.m}" data-mt="0"` : ""} data-pad="${Math.round(o.pad ?? 40 * k + 16)}" data-alt="${esc(o.alt || "Hình minh hoạ")}" style="left:${R.x.toFixed(1)}px;top:${R.y.toFixed(1)}px;width:${R.w.toFixed(1)}px;height:${R.h.toFixed(1)}px;${R.r ? `rotate:${R.r}deg;` : ""}${o.z ? `z-index:${o.z};` : ""}${sh}">${inner}</div>`; };
// hộp chữ sửa được, toạ độ màn hình
const chu = (cls, x, y, w, html, o = {}) => `<div class="${cls}" data-t${o.m ? ` data-m="${o.m}"` : ""} style="left:${Math.round(x)}px;top:${Math.round(y)}px;${w ? `width:${Math.round(w)}px;` : ""}${o.size ? `font-size:${o.size}px;` : ""}${o.color ? `color:#${o.color};` : ""}${o.align ? `text-align:${o.align};` : ""}z-index:${o.z ?? 30};${o.r ? `rotate:${o.r}deg;` : ""}">${html}</div>`;

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
  xu: { x: 1640, y: 850, w: 250, h: 184, r: 0 },
  dau: { x: 1000, y: 880, w: 150, h: 150, r: 12 },
  roi: { x: 1010, y: 560, w: 860, h: 550, r: 7 },     // tờ rời nằm dưới sổ, thò ra phía trái dưới
};
const sach = (c, mo, o = {}) => {   // cuốn sổ: bìa (đóng ở trên trang / mở sang trái) + trang
  const bia = mo ? { x: BOOK.x - BOOK.w, y: BOOK.y, w: BOOK.w, h: BOOK.h, r: 0 } : { ...BOOK, r: o.r ?? -2.5 }, trang = { ...BOOK, r: mo ? 0 : (o.r ?? -2.5) };
  const T = chieu(c, trang), B = chieu(c, bia);
  return `${lop("bh-trang", T, soTrang(), { m: "bh-trang", z: 4, alt: "Trang sổ bảo hiểm xã hội" })}${lop("bh-bia", B, mo ? soTrongBia() : soBia(), { m: "bh-bia", z: mo ? 4 : 5, alt: "Sổ bảo hiểm xã hội" })}`; };
const vatBan = (c, bo = []) => [["but", but, "Bút máy", 7], ["xu", xu, "Chồng xu", 6], ["dau", conDau, "Con dấu", 6]].filter(([k]) => !bo.includes(k)).map(([k, fn, alt, z]) => lop(`bh-${k}`, chieu(c, VAT[k]), fn(), { m: `bh-${k}`, z, alt })).join("");
const chan = (s, deck, i, n) => (s.type === "bhcot" ? "" : `${chu("bh-pg", 80, 1004, 1000, `${String(i + 1).padStart(2, "0")} <small>/ ${n}</small><span class="bh-pgl">${esc(deck.meta?.short || "")}</span>`)}`);

const S = {};

// BÌA — tiêu đề trên mặt bàn (chữ ngà, cụm nhấn vàng), sổ đóng bên phải, tờ rời thò ra dưới sổ
S.bhbia = (s, deck, c0) => { const c = cam(s.cam || c0);
  const roi = lop("bh-roi", chieu(c, VAT.roi), toRoi(), { m: "bh-roi", z: 3, alt: "Tờ rời quá trình đóng bảo hiểm xã hội" });
  return `${roi}${sach(c, false)}${vatBan(c)}
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

// KẾT — lùi máy quay: sổ gấp lại, tờ rời cất dưới sổ; lời cảm ơn trên mặt bàn, thẻ nhóm
S.bhket = (s, deck, c0) => { const c = cam(s.cam || { x: 1000, y: 560, z: 0.9 });
  const roi = lop("bh-roi", chieu(c, VAT.roi), toRoi(), { m: "bh-roi", z: 3, alt: "Tờ rời quá trình đóng bảo hiểm xã hội" });
  const team = (s.team || []).slice(0, 4).map((t) => esc(t.name)).join(" · ");
  return `${roi}${sach(c, false, { r: 3 })}${vatBan(c)}
    ${chu("bh-k", 110, 200, 900, esc(s.kicker || ""))}${chu("bh-h1", 110, 255, 860, tx(s.title || "Cảm ơn"), { size: s.titleSize || 92 })}
    ${s.message ? chu("bh-sub", 110, 600, 680, tx(s.message)) : ""}
    ${team ? `${lop("bh-the", { x: 96, y: 846, w: 640, h: 150, r: -2 }, theKraft(), { m: "bh-the", z: 6, alt: "Thẻ tên nhóm" })}${chu("bh-tn", 176, 884, 520, team, { r: -2 })}` : ""}`; };

function render(s, deck, ctx, { i, n }) {
  kit.reset();
  const html = S[s.type](s, deck);
  const sec = `<section class="s bh" data-type="${esc(s.type)}" data-title="${esc(String(s.title || "").replace(/[[\]]/g, ""))}"><div class="cv">${html}${chan(s, deck, i, n)}</div></section>`;
  return [{ id: s.id || `s${i + 1}`, html: sec, tu: false, trans: s.trans || "morph", dur: s.dur || 1100 }];
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
.bh-k { font: 700 24px/1.2 var(--fb); letter-spacing: .16em; text-transform: uppercase; color: #${M.gold}; }
.bh-h1 { font: 800 96px/1.04 var(--fb); color: #${M.ivory}; text-shadow: 0 3px 18px rgba(0,0,0,.35); }
.bh-h1 em, .bh-ph em, .bh-ch em { font-style: normal; color: #${M.gold}; }
.bh-ph em, .bh-ch em { color: #${M.red}; }
.bh-sub { font: 500 31px/1.42 var(--fb); color: #b9c2cf; text-wrap: pretty; }
.bh-tn { font: 800 38px/1.15 var(--fb); color: #2a2012; } .bh-tns { font: 600 24px/1.3 var(--fb); color: #5a4626; }
.bh-pg { font: 400 26px/1 var(--fd); color: #${M.gold}; letter-spacing: .04em; } .bh-pg small { font-size: 18px; color: #8790a0; } .bh-pgl { margin-left: 22px; font: 600 19px/1 var(--fb); letter-spacing: .08em; color: #7d8696; }
.bh-fh { font: 800 24px/1.2 var(--fb); letter-spacing: .14em; text-transform: uppercase; color: #${M.green}; }
.bh-fl { font: 700 20px/1.2 var(--fb); letter-spacing: .1em; text-transform: uppercase; color: #8a7a58; } .bh-fv { font: 700 27px/1.25 var(--fb); color: #${M.ink}; }
.bh-pk { font: 700 21px/1.2 var(--fb); letter-spacing: .14em; text-transform: uppercase; color: #${M.green}; }
.bh-ph { font: 800 46px/1.1 var(--fb); color: #${M.ink}; }
.bh-my { font: 800 30px/1 var(--fb); } .bh-mv { font: 400 54px/1 var(--fd); } .bh-mt { font: 700 19px/1.2 var(--fb); }
.bh-ck { font: 700 22px/1.2 var(--fb); letter-spacing: .14em; text-transform: uppercase; color: #${M.green}; }
.bh-ch { font: 800 52px/1.08 var(--fb); color: #${M.ink}; }
.bh-cu { font: 600 22px/1.2 var(--fb); color: #7a6c4e; }
.bh-cv { font: 400 44px/1 var(--fd); }
.bh-wn { width: 34px; height: 34px; border-radius: 50%; background: #${M.red}; color: #fff; font: 800 20px/34px var(--fb); text-align: center; }
.bh-wt { font: 500 23px/1.3 var(--fb); color: #3d4658; } .bh-wt b { color: #${M.ink}; font-weight: 800; }
.bh-iv { font: 400 128px/1 var(--fd); color: #${M.gold2}; } .bh-iu { font: 800 34px/1.15 var(--fb); color: #${M.ink}; } .bh-it { font: 500 24px/1.38 var(--fb); color: #4a4232; }
.bh-dk { font: 400 52px/1 var(--fd); letter-spacing: .04em; }
`;

module.exports = { TYPES, render, css, cam, chieu };
