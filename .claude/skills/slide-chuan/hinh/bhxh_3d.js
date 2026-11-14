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

// ================= VẬT CỦA THẾ GIỚI BHXH (người xem thấy tận mắt; vật chủ đạo chở dữ liệu) =================
const bong = (g, cx, cy, rx, ry, op = 0.3) => `<radialGradient id="${g}bo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#0a2a66" stop-opacity="${op}"/><stop offset="1" stop-color="#0a2a66" stop-opacity="0"/></radialGradient>`;
const bongVe = (g, cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${g}bo)"/>`;

// SÁCH LUẬT bìa cứng đỏ sẫm, chữ nhũ "LUẬT BẢO HIỂM XÃ HỘI 2024" (không quốc huy)
function sachLuat() { const g = id("sl");
  return `<svg viewBox="0 0 440 560" width="100%" height="100%"><defs>${bong(g)}
    <linearGradient id="${g}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c0392b"/><stop offset=".55" stop-color="#8e1b17"/><stop offset="1" stop-color="#5e0f0c"/></linearGradient>
    <linearGradient id="${g}gay" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a0b09"/><stop offset=".5" stop-color="#7a1612"/><stop offset="1" stop-color="#4a0b09"/></linearGradient>
    <linearGradient id="${g}v" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2c4"/><stop offset=".5" stop-color="#e8b84a"/><stop offset="1" stop-color="#b9861f"/></linearGradient>
    <linearGradient id="${g}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
    ${bongVe(g, 230, 530, 200, 24)}
    <path d="M360 40 L392 58 L392 520 L360 500 Z" fill="#efe6cf"/>${Array.from({ length: 8 }, (_, k) => `<path d="M${364 + k * 3.6} ${42 + k * 2} V${502 + k * 2}" stroke="#d2c6a6" stroke-width="1"/>`).join("")}
    <path d="M40 500 L360 500 L392 520 L72 520 Z" fill="#e3d9bd"/>
    <rect x="40" y="40" width="320" height="460" rx="10" fill="url(#${g}b)"/><rect x="40" y="40" width="34" height="460" rx="8" fill="url(#${g}gay)"/>
    <rect x="96" y="76" width="240" height="388" rx="4" fill="none" stroke="url(#${g}v)" stroke-width="3"/>
    <g text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" fill="url(#${g}v)"><text x="216" y="170" font-size="36" letter-spacing="4">LUẬT</text><text x="216" y="226" font-size="27" letter-spacing="1">BẢO HIỂM</text><text x="216" y="266" font-size="27" letter-spacing="1">XÃ HỘI</text>
      <rect x="156" y="330" width="120" height="2" fill="url(#${g}v)"/><text x="216" y="392" font-size="40" letter-spacing="3">2024</text></g>
    <rect x="40" y="40" width="320" height="460" rx="10" fill="url(#${g}s)"/></svg>`; }

// SỔ BHXH MỞ (trang "quá trình đóng"): hai trang giấy có lưới mờ; ô năm do slide đặt lên (hộp chữ / lớp ảnh riêng)
function soMo(w = 1100, h = 520) { const g = id("sm");
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none"><defs>${bong(g)}
    <linearGradient id="${g}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#f2f6fc"/></linearGradient>
    <linearGradient id="${g}gL" x1="0" y1="0" x2="1" y2="0"><stop offset=".86" stop-color="#0a2a66" stop-opacity="0"/><stop offset="1" stop-color="#0a2a66" stop-opacity=".16"/></linearGradient>
    <linearGradient id="${g}gR" x1="1" y1="0" x2="0" y2="0"><stop offset=".86" stop-color="#0a2a66" stop-opacity="0"/><stop offset="1" stop-color="#0a2a66" stop-opacity=".16"/></linearGradient>
    <linearGradient id="${g}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f7bff"/><stop offset="1" stop-color="#0a3a9a"/></linearGradient></defs>
    ${bongVe(g, w / 2, h - 10, w * 0.48, 22)}
    <rect x="0" y="6" width="${w}" height="${h - 26}" rx="22" fill="url(#${g}c)"/>
    <rect x="18" y="0" width="${w / 2 - 22}" height="${h - 34}" rx="10" fill="url(#${g}p)"/><rect x="${w / 2 + 4}" y="0" width="${w / 2 - 22}" height="${h - 34}" rx="10" fill="url(#${g}p)"/>
    <rect x="18" y="0" width="${w / 2 - 22}" height="${h - 34}" fill="url(#${g}gL)"/><rect x="${w / 2 + 4}" y="0" width="${w / 2 - 22}" height="${h - 34}" fill="url(#${g}gR)"/>
    ${Array.from({ length: 9 }, (_, k) => `<path d="M40 ${70 + k * 46} H${w / 2 - 24} M${w / 2 + 26} ${70 + k * 46} H${w - 40}" stroke="#dbe6f7" stroke-width="2"/>`).join("")}
</svg>`; }   // tiêu đề trang = hộp chữ của slide (vạch "đầu trang in sẵn" cũ đè lên nhãn — bỏ)

// PHIẾU LƯƠNG: tờ giấy mép răng cưa; dòng "trích đóng BHXH" tô vàng — chữ trên phiếu là đạo cụ (số liệu thật đặt bằng hộp chữ ở slide)
function phieuLuong() { const g = id("pl"), rang = Array.from({ length: 17 }, (_, k) => `L${370 - k * 20 - 10} 470 L${370 - (k + 1) * 20} 452`).join(" ");   // mép răng cưa đáy phiếu
  const dong = (y, t, nhan = false) => `${nhan ? `<rect x="54" y="${y - 26}" width="292" height="40" rx="8" fill="#ffe08a"/>` : ""}<text x="66" y="${y}" font-family="Be Vietnam Pro" font-weight="${nhan ? 800 : 600}" font-size="19" fill="#${nhan ? "6b4400" : "46526b"}">${t}</text><rect x="${nhan ? 260 : 270}" y="${y - 12}" width="${nhan ? 70 : 60}" height="10" rx="5" fill="#${nhan ? "9a5f00" : "b9c6dc"}"/>`;
  return `<svg viewBox="0 0 400 500" width="100%" height="100%"><defs>${bong(g)}
    <linearGradient id="${g}p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eef3fb"/></linearGradient></defs>
    ${bongVe(g, 200, 482, 170, 16)}
    <path d="M30 20 H370 V452 ${rang} Z" fill="url(#${g}p)" stroke="#d7e2f3" stroke-width="2"/>
    <rect x="30" y="20" width="340" height="70" fill="#0b57d0"/><text x="200" y="66" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" font-size="26" letter-spacing="4" fill="#ffffff">PHIẾU LƯƠNG</text>
    ${dong(150, "Lương hợp đồng")}${dong(204, "Phụ cấp")}${dong(270, "Trích đóng BHXH", true)}${dong(330, "Khấu trừ khác")}
    <path d="M54 368 H346" stroke="#0b2559" stroke-width="2" stroke-dasharray="6 6"/><text x="66" y="410" font-family="Be Vietnam Pro" font-weight="800" font-size="22" fill="#0b2559">Thực lĩnh</text><rect x="250" y="396" width="80" height="14" rx="7" fill="#0b2559"/></svg>`; }

// PHONG BÌ LƯƠNG HƯU: phong bì trắng xanh, nhãn "LƯƠNG HƯU", nắp dán con dấu tròn xanh
function phongBi() { const g = id("pb");
  return `<svg viewBox="0 0 440 320" width="100%" height="100%"><defs>${bong(g)}
    <linearGradient id="${g}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e3edfb"/></linearGradient>
    <linearGradient id="${g}n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7faff"/><stop offset="1" stop-color="#d6e4f8"/></linearGradient>
    <linearGradient id="${g}d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5aa0ff"/><stop offset="1" stop-color="#0b4fc0"/></linearGradient></defs>
    ${bongVe(g, 220, 300, 190, 16)}
    <rect x="20" y="30" width="400" height="250" rx="18" fill="url(#${g}a)" stroke="#d2def0" stroke-width="2"/>
    <path d="M20 48 L220 176 L420 48" fill="none" stroke="#c9d8ee" stroke-width="3"/><path d="M20 260 L170 150 M420 260 L270 150" stroke="#dbe6f7" stroke-width="3"/>
    <path d="M24 40 Q220 200 416 40 L416 36 Q416 30 410 30 H30 Q24 30 24 36 Z" fill="url(#${g}n)" stroke="#c9d8ee" stroke-width="2"/>
    <circle cx="220" cy="150" r="34" fill="url(#${g}d)"/><path d="M204 150 l11 11 l21 -23" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="128" y="206" width="184" height="46" rx="23" fill="#0b57d0"/><text x="220" y="237" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" font-size="21" letter-spacing="2" fill="#ffffff">LƯƠNG HƯU</text></svg>`; }

// ĐIỆN THOẠI tra cứu quá trình tham gia (không logo ứng dụng thật)
function dienThoai() { const g = id("dt");
  const hang = (y, xanh) => `<rect x="44" y="${y}" width="212" height="54" rx="12" fill="#ffffff"/><circle cx="72" cy="${y + 27}" r="13" fill="#${xanh ? "16a36b" : "0b57d0"}"/><path d="M65 ${y + 27} l5 5 l9 -10" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><rect x="96" y="${y + 16}" width="120" height="9" rx="4.5" fill="#0b2559" opacity=".7"/><rect x="96" y="${y + 32}" width="80" height="7" rx="3.5" fill="#6c7891" opacity=".5"/>`;
  return `<svg viewBox="0 0 300 560" width="100%" height="100%"><defs>${bong(g)}
    <linearGradient id="${g}f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a4256"/><stop offset="1" stop-color="#0f1422"/></linearGradient>
    <linearGradient id="${g}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eaf2ff"/><stop offset="1" stop-color="#d5e5ff"/></linearGradient>
    <linearGradient id="${g}h" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
    ${bongVe(g, 150, 544, 120, 14)}
    <rect x="16" y="10" width="268" height="520" rx="44" fill="url(#${g}f)"/><rect x="28" y="22" width="244" height="496" rx="34" fill="url(#${g}s)"/>
    <rect x="110" y="32" width="80" height="16" rx="8" fill="#0f1422"/>
    <rect x="28" y="60" width="244" height="80" fill="#0b57d0"/><rect x="44" y="84" width="150" height="12" rx="6" fill="#ffffff"/><rect x="44" y="106" width="100" height="9" rx="4.5" fill="#cfe2ff"/>
    ${hang(158, true)}${hang(224, true)}${hang(290, true)}${hang(356, false)}
    <rect x="44" y="436" width="212" height="52" rx="26" fill="#0b57d0"/><rect x="104" y="457" width="92" height="10" rx="5" fill="#ffffff"/>
    <rect x="16" y="10" width="268" height="520" rx="44" fill="url(#${g}h)"/></svg>`; }

// CHỒNG SỔ BHXH: n cuốn xếp chồng (đếm được — 1 cuốn = 1 triệu người); nhìn nghiêng thấy bìa xanh trên / dưới, mép giấy trắng ở giữa
function chongSo(n = 12) { const g = id("cs"), D = 24, W = 260, sx = 34, sy = 18, top = 40, H = top + sy + n * D + 50;
  const cuon = (k) => { const y = top + sy + (n - 1 - k) * D, l = ((k * 37) % 7) - 3, x = 10 + l;
    return `<path d="M${x} ${y} h${W} l${sx} ${-sy} v${D} l${-sx} ${sy} Z" fill="#e9eef7"/><path d="M${x + W} ${y} l${sx} ${-sy} v${D} l${-sx} ${sy} Z" fill="url(#${g}s)"/>
      <rect x="${x}" y="${y}" width="${W}" height="${D}" fill="url(#${g}p)"/><rect x="${x}" y="${y}" width="${W}" height="5" fill="url(#${g}c)"/><rect x="${x}" y="${y + D - 5}" width="${W}" height="5" fill="url(#${g}c)"/>
      ${[9, 13, 17].map((d) => `<path d="M${x + 6} ${y + d} H${x + W - 6}" stroke="#d9e2ef" stroke-width="1"/>`).join("")}<rect x="${x}" y="${y}" width="10" height="${D}" fill="url(#${g}c)"/>`; };
  const yt = top + sy, x0 = 10 + ((((n - 1) * 37) % 7) - 3);
  return `<svg viewBox="0 0 ${W + sx + 20} ${H}" width="100%" height="100%"><defs>${bong(g)}
    <linearGradient id="${g}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f7bff"/><stop offset="1" stop-color="#0a3a9a"/></linearGradient>
    <linearGradient id="${g}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eef2f8"/></linearGradient>
    <linearGradient id="${g}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d2dbea"/><stop offset="1" stop-color="#b9c6dc"/></linearGradient>
    <linearGradient id="${g}t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6fb0ff"/><stop offset="1" stop-color="#0b57d0"/></linearGradient>
    <linearGradient id="${g}v" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff2c4"/><stop offset="1" stop-color="#e8b84a"/></linearGradient></defs>
    ${bongVe(g, (W + sx) / 2 + 10, top + sy + n * D + 22, (W + sx) * 0.55, 18)}${Array.from({ length: n }, (_, k) => cuon(k)).join("")}
    <path d="M${x0} ${yt} h${W} l${sx} ${-sy} h${-W} Z" fill="url(#${g}t)"/><path d="M${x0 + W * 0.36} ${yt - sy * 0.55} h${W * 0.3}" stroke="url(#${g}v)" stroke-width="4" stroke-linecap="round"/></svg>`; }

// VẬT TRÊN MẶT BÀN (trôi theo máy quay giữa các slide): bút bi, thước kẻ trong, giấy nhớ vàng có ghim
function but() { const g = id("bt");
  return `<svg viewBox="0 0 520 60" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5aa0ff"/><stop offset=".5" stop-color="#0b57d0"/><stop offset="1" stop-color="#0a3a9a"/></linearGradient>
    <linearGradient id="${g}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f7fb"/><stop offset=".5" stop-color="#aab6c8"/><stop offset="1" stop-color="#6d7b90"/></linearGradient></defs>
    <ellipse cx="260" cy="50" rx="240" ry="6" fill="#0a2a66" opacity=".12"/><path d="M430 16 L512 30 L430 44 Z" fill="url(#${g}k)"/><path d="M496 27 L512 30 L496 33 Z" fill="#2a3346"/>
    <rect x="20" y="12" width="420" height="36" rx="18" fill="url(#${g})"/><rect x="60" y="6" width="160" height="10" rx="5" fill="url(#${g}k)"/><rect x="380" y="12" width="14" height="36" fill="url(#${g}k)"/><rect x="30" y="18" width="380" height="7" rx="3.5" fill="#fff" opacity=".3"/></svg>`; }
function thuoc() { const g = id("th");
  return `<svg viewBox="0 0 640 90" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset="1" stop-color="#cfe2ff" stop-opacity=".85"/></linearGradient></defs>
    <rect x="4" y="8" width="632" height="74" rx="10" fill="url(#${g})" stroke="#9cc3ff" stroke-width="2"/>${Array.from({ length: 61 }, (_, k) => `<path d="M${20 + k * 10} 10 V${k % 10 === 0 ? 40 : k % 5 === 0 ? 32 : 24}" stroke="#0b57d0" stroke-opacity=".6" stroke-width="2"/>`).join("")}
    <rect x="10" y="60" width="300" height="8" rx="4" fill="#fff" opacity=".7"/></svg>`; }
function giayNho() { const g = id("gn");
  return `<svg viewBox="0 0 240 230" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset="1" stop-color="#ffd76a"/></linearGradient></defs>
    <path d="M20 30 H220 V196 Q170 186 150 214 H20 Z" fill="url(#${g})"/><path d="M150 214 Q170 186 220 196 Q190 200 150 214 Z" fill="#e8b84a"/>
    ${[80, 112, 144].map((y) => `<rect x="44" y="${y}" width="${y === 144 ? 90 : 150}" height="9" rx="4.5" fill="#9a5f00" opacity=".35"/>`).join("")}
    <circle cx="120" cy="34" r="16" fill="#e0453a"/><circle cx="114" cy="28" r="5" fill="#fff" opacity=".6"/></svg>`; }

// Ô CHE (an sinh xã hội che chắn khi gặp rủi ro): tán 6 múi xanh căng tròn, mép lượn, cán móc, vài giọt mưa phía trên
function oChe() { const g = id("oc"), N = 6, L = 34, R = 606, Y = 300, AX = 320, AY = 52, xs = Array.from({ length: N + 1 }, (_, i) => L + (i * (R - L)) / N);
  const mui = (i) => { const a = xs[i], b = xs[i + 1], m = (a + b) / 2, ca = AX + (a - AX) * 1.06, cb = AX + (b - AX) * 1.06;
    return `<path d="M${AX} ${AY} Q${ca} 96 ${a} ${Y} Q${m} ${Y - 40} ${b} ${Y} Q${cb} 96 ${AX} ${AY} Z" fill="url(#${g}${i % 2 ? "b" : "a"})"/>`; };
  const giot = (x, y, s) => `<path d="M${x} ${y} q${-9 * s} ${14 * s} ${-9 * s} ${21 * s} a${9 * s} ${9 * s} 0 0 0 ${18 * s} 0 q0 ${-7 * s} ${-9 * s} ${-21 * s} Z" fill="url(#${g}g)"/>`;
  return `<svg viewBox="0 0 640 540" width="100%" height="100%"><defs>
    <linearGradient id="${g}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4b97ff"/><stop offset="1" stop-color="#0b57d0"/></linearGradient>
    <linearGradient id="${g}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a76f0"/><stop offset="1" stop-color="#0a3a9a"/></linearGradient>
    <linearGradient id="${g}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe2ff"/><stop offset="1" stop-color="#7fb1ff"/></linearGradient>
    <linearGradient id="${g}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="${g}v" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2c4"/><stop offset="1" stop-color="#d9a23a"/></linearGradient></defs>
    ${giot(70, 6, 1)}${giot(560, 20, 1.1)}${giot(150, 60, 0.8)}${giot(488, 70, 0.75)}${giot(30, 120, 0.7)}${giot(612, 140, 0.7)}
    <path d="M${AX} ${Y - 10} V470" stroke="#33415c" stroke-width="11" stroke-linecap="round"/>
    <path d="M${AX} 466 q0 46 -38 46 q-34 0 -34 -30" fill="none" stroke="#0a3a9a" stroke-width="14" stroke-linecap="round"/>
    ${Array.from({ length: N }, (_, i) => mui(i)).join("")}
    <path d="M${AX} ${AY} Q${AX - 320} 70 ${L} ${Y} L${AX} ${Y - 60} Z" fill="url(#${g}s)"/>
    ${xs.slice(0, -1).map((a, i) => `<path d="M${a} ${Y} Q${(a + xs[i + 1]) / 2} ${Y - 40} ${xs[i + 1]} ${Y}" fill="none" stroke="#08307f" stroke-width="3" opacity=".55"/>`).join("")}
    <circle cx="${AX}" cy="${AY - 6}" r="11" fill="url(#${g}v)"/></svg>`; }

// SÁCH LUẬT MỞ (bìa đỏ, giấy ngà, dải đánh dấu vàng): chữ trên trang do slide đặt bằng hộp chữ
function sachMo(w = 1500, h = 640) { const g = id("sm");
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none"><defs>${bong(g)}
    <linearGradient id="${g}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c0392b"/><stop offset="1" stop-color="#6e0f0b"/></linearGradient>
    <linearGradient id="${g}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffdf7"/><stop offset="1" stop-color="#f6efdf"/></linearGradient>
    <linearGradient id="${g}gL" x1="0" y1="0" x2="1" y2="0"><stop offset=".84" stop-color="#5a3a10" stop-opacity="0"/><stop offset="1" stop-color="#5a3a10" stop-opacity=".2"/></linearGradient>
    <linearGradient id="${g}gR" x1="1" y1="0" x2="0" y2="0"><stop offset=".84" stop-color="#5a3a10" stop-opacity="0"/><stop offset="1" stop-color="#5a3a10" stop-opacity=".2"/></linearGradient>
    <linearGradient id="${g}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd76a"/><stop offset="1" stop-color="#d9a23a"/></linearGradient></defs>
    ${bongVe(g, w / 2, h - 10, w * 0.48, 22)}
    <rect x="0" y="8" width="${w}" height="${h - 28}" rx="20" fill="url(#${g}c)"/><rect x="10" y="18" width="${w - 20}" height="${h - 48}" rx="14" fill="none" stroke="#e8b84a" stroke-width="2" opacity=".7"/>
    ${[0, 1, 2].map((k) => `<rect x="${22 + k * 3}" y="${4 + k * 3}" width="${w / 2 - 26 - k * 3}" height="${h - 40}" rx="10" fill="#efe5cc"/><rect x="${w / 2 + 4}" y="${4 + k * 3}" width="${w / 2 - 26 - k * 3}" height="${h - 40}" rx="10" fill="#efe5cc"/>`).join("")}
    <rect x="22" y="0" width="${w / 2 - 26}" height="${h - 46}" rx="10" fill="url(#${g}p)"/><rect x="${w / 2 + 4}" y="0" width="${w / 2 - 26}" height="${h - 46}" rx="10" fill="url(#${g}p)"/>
    <rect x="22" y="0" width="${w / 2 - 26}" height="${h - 46}" fill="url(#${g}gL)"/><rect x="${w / 2 + 4}" y="0" width="${w / 2 - 26}" height="${h - 46}" fill="url(#${g}gR)"/>
    <path d="M${w - 150} -6 h44 v130 l-22 -18 l-22 18 Z" fill="url(#${g}v)"/></svg>`; }

// DẤU ĐÓNG TRÊN GIẤY (mực đỏ / vàng / xanh): khung kép bo góc, nền giấy hơi trong — chữ của dấu đặt bằng hộp chữ
function dau(w, h, mau = "d63b2f") { return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%"><rect x="4" y="4" width="${w - 8}" height="${h - 8}" rx="14" fill="#ffffff" fill-opacity=".78" stroke="#${mau}" stroke-width="6"/><rect x="14" y="14" width="${w - 28}" height="${h - 28}" rx="8" fill="none" stroke="#${mau}" stroke-width="2"/></svg>`; }

module.exports = { soBHXH, khien, chongXu, bieuDoKinh, bangKiem, sachLuat, soMo, phieuLuong, phongBi, dienThoai, chongSo, but, thuoc, giayNho, oChe, sachMo, dau };
