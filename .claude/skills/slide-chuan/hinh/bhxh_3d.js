// VẬT CHÍNH VẼ BẰNG CODE, KIỂU 3D BÓNG (cho bộ hình BHXH "Flashslide xanh"): ánh sáng từ trên trái, mặt sáng / mặt tối,
// viền phản quang, bóng đổ mềm. Chỉ vẽ VẬT ít chi tiết (sổ, khiên kính, chồng xu, biểu đồ kính) — người và vật nhỏ lấy từ Fluent 3D (hinh/f3d.js).
// Không mô phỏng quốc huy, logo cơ quan: biểu tượng trên sổ là khiên + dấu tích chung chung.
let U = 0; const id = (p) => `${p}3d${++U}`;

// SỔ BHXH đóng, đứng nghiêng (chiếu xiên): bìa xanh, viền nhũ vàng, gáy và mép giấy có độ dày
function soBHXH() { const g = id("so");
  return `<svg viewBox="0 0 560 640" width="100%" height="100%"><defs>
    <linearGradient id="${g}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a8bff"/><stop offset=".45" stop-color="#0f5ad8"/><stop offset="1" stop-color="#0a3a9a"/></linearGradient>
    <linearGradient id="${g}gay" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0a3486"/><stop offset=".6" stop-color="#0d48b8"/><stop offset="1" stop-color="#082d78"/></linearGradient>
    <linearGradient id="${g}gi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf6"/><stop offset="1" stop-color="#e8e1cf"/></linearGradient>
    <linearGradient id="${g}v" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2c4"/><stop offset=".5" stop-color="#e8b84a"/><stop offset="1" stop-color="#b9861f"/></linearGradient>
    <linearGradient id="${g}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="#fff" stop-opacity=".08"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <radialGradient id="${g}bo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#0a2a66" stop-opacity=".35"/><stop offset="1" stop-color="#0a2a66" stop-opacity="0"/></radialGradient>
    <clipPath id="${g}c"><path d="M120 40 L470 70 L450 560 L100 520 Z"/></clipPath></defs>
    <ellipse cx="300" cy="590" rx="250" ry="38" fill="url(#${g}bo)"/>
    <path d="M470 70 L500 92 L482 584 L450 560 Z" fill="url(#${g}gi)"/>${Array.from({ length: 9 }, (_, k) => `<path d="M${473 + k * 3} ${73 + k * 2.3} L${453 + k * 3} ${563 + k * 2.3}" stroke="#cfc6ae" stroke-width="1"/>`).join("")}
    <path d="M100 520 L450 560 L482 584 L128 546 Z" fill="#ddd5bf"/><path d="M100 520 L128 546 L132 70 L120 40 Z" fill="url(#${g}gay)"/>
    <path d="M120 40 L470 70 L450 560 L100 520 Z" fill="url(#${g}b)"/>
    <g clip-path="url(#${g}c)" opacity=".18" fill="none" stroke="#fff" stroke-width="1.2">${Array.from({ length: 22 }, (_, k) => `<ellipse cx="290" cy="250" rx="${40 + k * 9}" ry="${20 + k * 4.5}" transform="rotate(${k * 8} 290 250)"/>`).join("")}</g>
    <path d="M146 72 L444 98 L426 532 L126 498 Z" fill="none" stroke="url(#${g}v)" stroke-width="5"/><path d="M158 86 L432 110 L415 518 L138 486 Z" fill="none" stroke="url(#${g}v)" stroke-width="1.6" opacity=".8"/>
    <g transform="translate(286 236) rotate(4)"><path d="M0 -76 L62 -54 V4 C62 46 34 72 0 90 C-34 72 -62 46 -62 4 V-54 Z" fill="url(#${g}v)"/><path d="M0 -62 L50 -44 V4 C50 38 28 60 0 74 C-28 60 -50 38 -50 4 V-44 Z" fill="#0d4fc4"/>
      <path d="M-24 6 L-6 24 L28 -14" fill="none" stroke="url(#${g}v)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></g>
    <g transform="translate(282 410) rotate(4)" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800"><text font-size="54" letter-spacing="10" fill="#082f80" y="3">SỔ</text><text font-size="54" letter-spacing="10" fill="url(#${g}v)">SỔ</text>
      <text y="52" font-size="22" letter-spacing="2" fill="#082f80">BẢO HIỂM XÃ HỘI</text><text y="50" font-size="22" letter-spacing="2" fill="url(#${g}v)">BẢO HIỂM XÃ HỘI</text></g>
    <path d="M120 40 L470 70 L450 560 L100 520 Z" fill="url(#${g}s)"/></svg>`; }

// KHIÊN KÍNH xanh có dấu tích: thân trong suốt, viền phản quang, vệt sáng chéo
function khien() { const g = id("kh");
  const P = "M200 24 L356 78 V214 C356 318 286 392 200 436 C114 392 44 318 44 214 V78 Z";
  return `<svg viewBox="0 0 400 480" width="100%" height="100%"><defs>
    <linearGradient id="${g}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8cc4ff"/><stop offset=".5" stop-color="#2f7bff"/><stop offset="1" stop-color="#0a3fa8"/></linearGradient>
    <linearGradient id="${g}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#bfe0ff"/><stop offset="1" stop-color="#5aa0ff"/></linearGradient>
    <linearGradient id="${g}h" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".45" stop-color="#fff" stop-opacity=".1"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <radialGradient id="${g}bo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#0a2a66" stop-opacity=".3"/><stop offset="1" stop-color="#0a2a66" stop-opacity="0"/></radialGradient>
    <filter id="${g}f" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter></defs>
    <ellipse cx="200" cy="456" rx="140" ry="20" fill="url(#${g}bo)"/>
    <path d="${P}" fill="url(#${g}a)" opacity=".92"/><path d="${P}" fill="none" stroke="url(#${g}r)" stroke-width="10"/>
    <path d="M200 58 L326 102 V214 C326 300 270 362 200 400 C130 362 74 300 74 214 V102 Z" fill="#0b4fc0" opacity=".35"/>
    <path d="M136 226 L184 274 L276 172" fill="none" stroke="#04235f" stroke-opacity=".35" stroke-width="34" stroke-linecap="round" stroke-linejoin="round" filter="url(#${g}f)" transform="translate(6 10)"/>
    <path d="M136 226 L184 274 L276 172" fill="none" stroke="#ffffff" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M200 24 L356 78 V140 C270 120 150 170 44 230 V78 Z" fill="url(#${g}h)"/></svg>`; }

// CHỒNG XU VÀNG (n đồng), mặt trên dập nổi khiên — không dùng ký hiệu tiền tệ
function chongXu(n = 5, lech = 0) { const g = id("xu"), R = 120, ry = 40, H = 22, W = 300, top = 60;
  const mot = (k) => { const cx = 150 + Math.sin(k * 1.7) * lech, cy = top + (n - 1 - k) * H + ry;
    return `<path d="M${cx - R} ${cy} V${cy + H} A${R} ${ry} 0 0 0 ${cx + R} ${cy + H} V${cy} Z" fill="url(#${g}sd)"/>${Array.from({ length: 13 }, (_, j) => { const x = cx - R + (j + 0.5) * (2 * R / 13); return `<path d="M${x} ${cy + ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / R) ** 2)) - 2} v${H - 2}" stroke="#a0711a" stroke-opacity=".45" stroke-width="2"/>`; }).join("")}
      <ellipse cx="${cx}" cy="${cy}" rx="${R}" ry="${ry}" fill="url(#${g}t)"/><ellipse cx="${cx}" cy="${cy}" rx="${R - 14}" ry="${ry - 5}" fill="none" stroke="#b07d1c" stroke-opacity=".55" stroke-width="3"/>`; };
  const dinh = top + ry;
  return `<svg viewBox="0 0 ${W} ${top + n * H + ry * 2 + 30}" width="100%" height="100%"><defs>
    <linearGradient id="${g}t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3bf"/><stop offset=".45" stop-color="#ffcb45"/><stop offset="1" stop-color="#d99a1c"/></linearGradient>
    <linearGradient id="${g}sd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c8891a"/><stop offset=".3" stop-color="#ffd25a"/><stop offset=".7" stop-color="#e3a42a"/><stop offset="1" stop-color="#a86f12"/></linearGradient>
    <radialGradient id="${g}bo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#5a3a00" stop-opacity=".3"/><stop offset="1" stop-color="#5a3a00" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="150" cy="${top + n * H + ry + 18}" rx="140" ry="26" fill="url(#${g}bo)"/>${Array.from({ length: n }, (_, k) => mot(k)).join("")}
    <g transform="translate(150 ${dinh}) scale(1 .34)"><path d="M0 -62 L48 -44 V4 C48 36 26 58 0 70 C-26 58 -48 36 -48 4 V-44 Z" fill="#e0a12a"/><path d="M0 -50 L38 -36 V4 C38 30 20 48 0 58 C-20 48 -38 30 -38 4 V-36 Z" fill="#ffd968"/></g>
    <ellipse cx="${150 - 50}" cy="${dinh - 14}" rx="46" ry="9" fill="#fff" opacity=".45"/></svg>`; }

// BIỂU ĐỒ CỘT KÍNH (chiếu xiên): cột tăng dần, mặt trước / bên / trên khác sáng; đế kính
function bieuDoKinh(cao = [0.38, 0.55, 0.72, 1]) { const g = id("bd"), n = cao.length, bw = 70, gap = 34, dx = 30, dy = -18, H = 300, X0 = 40, Y0 = 380;
  const cot = cao.map((h, k) => { const x = X0 + k * (bw + gap), y = Y0 - h * H, last = k === n - 1;
    return `<path d="M${x + bw} ${y} l${dx} ${dy} V${Y0 + dy} l${-dx} ${-dy} Z" fill="url(#${g}${last ? "sv" : "s"})"/><path d="M${x} ${y} l${dx} ${dy} h${bw} l${-dx} ${-dy} Z" fill="url(#${g}${last ? "tv" : "t"})"/>
      <rect x="${x}" y="${y}" width="${bw}" height="${Y0 - y}" fill="url(#${g}${last ? "fv" : "f"})"/><rect x="${x + 8}" y="${y + 8}" width="12" height="${Y0 - y - 16}" rx="6" fill="#fff" opacity=".45"/>`; }).join("");
  return `<svg viewBox="0 0 520 470" width="100%" height="100%"><defs>
    <linearGradient id="${g}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb8ff" stop-opacity=".95"/><stop offset="1" stop-color="#1d63e0" stop-opacity=".9"/></linearGradient>
    <linearGradient id="${g}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f86f0"/><stop offset="1" stop-color="#0b3f9e"/></linearGradient>
    <linearGradient id="${g}t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d7ebff"/><stop offset="1" stop-color="#a8d0ff"/></linearGradient>
    <linearGradient id="${g}fv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd76a"/><stop offset="1" stop-color="#e59a12"/></linearGradient>
    <linearGradient id="${g}sv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8a51f"/><stop offset="1" stop-color="#a86a06"/></linearGradient>
    <linearGradient id="${g}tv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff1c2"/><stop offset="1" stop-color="#ffd76a"/></linearGradient>
    <radialGradient id="${g}bo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#0a2a66" stop-opacity=".28"/><stop offset="1" stop-color="#0a2a66" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="270" cy="428" rx="250" ry="30" fill="url(#${g}bo)"/>
    <path d="M14 392 l${dx + 10} ${dy - 6} h440 l${-dx - 10} ${-dy + 6} Z" fill="#e6f0ff"/><path d="M14 392 h440 v14 h-440 Z" fill="#b9d3f7"/><path d="M454 392 l${dx + 10} ${dy - 6} v14 l${-dx - 10} ${-dy + 6} Z" fill="#9dbfee"/>
    ${cot}
    <path d="M60 300 C150 250 230 210 300 150 S420 70 470 40" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" opacity=".9"/><path d="M446 30 L486 32 L470 68 Z" fill="#ffffff"/></svg>`; }

// BẢNG KIỂM KÍNH (kẹp hồ sơ trong suốt, ba dòng có dấu tích) — hình chính cho phần đánh giá, kiến nghị
function bangKiem() { const g = id("bk");
  const dongK = (y, mau) => `<circle cx="120" cy="${y}" r="26" fill="url(#${g}${mau})"/><path d="M107 ${y} l9 9 l17 -19" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="166" y="${y - 14}" width="190" height="12" rx="6" fill="#0b57d0" opacity=".55"/><rect x="166" y="${y + 6}" width="130" height="10" rx="5" fill="#0b57d0" opacity=".25"/>`;
  return `<svg viewBox="0 0 460 560" width="100%" height="100%"><defs>
    <linearGradient id="${g}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset="1" stop-color="#cfe2ff" stop-opacity=".95"/></linearGradient>
    <linearGradient id="${g}e" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7fb2f5"/><stop offset="1" stop-color="#3d7fe0"/></linearGradient>
    <linearGradient id="${g}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f7fb"/><stop offset=".5" stop-color="#aab6c8"/><stop offset="1" stop-color="#6d7b90"/></linearGradient>
    <linearGradient id="${g}x" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5fe0a5"/><stop offset="1" stop-color="#139a63"/></linearGradient>
    <linearGradient id="${g}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6fb0ff"/><stop offset="1" stop-color="#0b57d0"/></linearGradient>
    <linearGradient id="${g}h" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".8"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <radialGradient id="${g}bo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#0a2a66" stop-opacity=".3"/><stop offset="1" stop-color="#0a2a66" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="230" cy="532" rx="200" ry="24" fill="url(#${g}bo)"/>
    <rect x="58" y="74" width="352" height="440" rx="34" fill="url(#${g}e)"/><rect x="44" y="60" width="352" height="440" rx="34" fill="url(#${g}a)" stroke="#ffffff" stroke-width="4"/>
    <rect x="150" y="28" width="140" height="64" rx="18" fill="url(#${g}m)"/><rect x="186" y="16" width="68" height="34" rx="17" fill="none" stroke="url(#${g}m)" stroke-width="10"/>
    ${dongK(176, "x")}${dongK(276, "x")}${dongK(376, "b")}
    <path d="M44 94 a34 34 0 0 1 34 -34 H300 C220 120 140 160 44 260 Z" fill="url(#${g}h)"/></svg>`; }

module.exports = { soBHXH, khien, chongXu, bieuDoKinh, bangKiem };
