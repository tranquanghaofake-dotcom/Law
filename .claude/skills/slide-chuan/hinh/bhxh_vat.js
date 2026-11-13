// THƯ VIỆN VẬT của bộ hình "bàn hồ sơ BHXH" (hinh/so_bhxh.js) — mỗi hàm trả một chuỗi <svg> vẽ bằng code, cùng một nét:
// đèn ở góc trên trái, vân giấy / kim loại / thuỷ tinh, không ảnh, không hình dán có sẵn.
// NGƯỜI là HÌNH CẮT GIẤY (nhìn chính diện, viền giấy trắng như vừa cắt bằng kéo) nằm trên mặt bàn — một hàm, nhiều vai.
// Mã màu tránh các mã gốc của bảng "son" (bộ đổi màu của da không được đụng tới).
let U = 0; const uid = (p) => `${p}v${++U}`;
const M = { ink: "1d2b44", green: "276a58", green2: "1b4e40", gold: "d8b35e", gold2: "9b7428", red: "b8322a", paper: "f6efdf", kraft: "c9a36a" };
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------- NGƯỜI CẮT GIẤY ----------
// o: { nu, da, toc, kieuToc: "ngan"|"dai"|"buoc"|"hoi", mu: "non"|"bao-ho"|"coi"|"luoi-trai", ao, quan, vay, taDe, vat: "thuoc-day"|"ho-chieu"|"cap"|"bien-kd"|"dong-ho"|"loa"|"so"|"phong-bi"|"con-dau", nhan: "vui"|"buon"|"lo" }
const DA = ["f1c7a1", "e6b48d", "d39b72", "c08560"];
function nguoi(o = {}) {
  const g = uid("ng"), da = o.da || DA[0], toc = o.toc || "2b2118", ao = o.ao || "3f7cac", quan = o.quan || "2f3b52", toi = (h, k = 0.78) => { const n = parseInt(h, 16); return [16, 8, 0].map((s) => Math.min(255, Math.round(((n >> s) & 255) * k)).toString(16).padStart(2, "0")).join(""); }, sang = (h, k = 0.35) => { const n = parseInt(h, 16); return [16, 8, 0].map((s) => { const v = (n >> s) & 255; return Math.round(v + (255 - v) * k).toString(16).padStart(2, "0"); }).join(""); };
  // các mảng hình: [kiểu, thuộc tính, màu] — vẽ hai lượt: lượt 1 viền giấy trắng dày (cả khối), lượt 2 tô màu
  const P = [];
  const tay = (x1, y1, x2, y2) => P.push(["line", `x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"`, ao, 26]);
  // tóc dài / buộc nằm sau đầu
  if (o.kieuToc === "dai") P.push(["path", `d="M58 78 Q56 150 70 168 L130 168 Q144 150 142 78 Z"`, toc]);
  if (o.kieuToc === "buoc") P.push(["circle", `cx="100" cy="34" r="17"`, toc]);
  // chân (quần hoặc váy)
  if (o.vay) { P.push(["path", `d="M58 246 L142 246 L154 334 L46 334 Z"`, quan]); P.push(["rect", `x="74" y="330" width="18" height="70" rx="8"`, da]); P.push(["rect", `x="108" y="330" width="18" height="70" rx="8"`, da]); }
  else { P.push(["rect", `x="66" y="240" width="31" height="160" rx="12"`, quan]); P.push(["rect", `x="103" y="240" width="31" height="160" rx="12"`, quan]); }
  P.push(["ellipse", `cx="80" cy="404" rx="22" ry="11"`, "24272e"]); P.push(["ellipse", `cx="120" cy="404" rx="22" ry="11"`, "24272e"]);
  // tay (sau thân một chút), thân áo, cổ, đầu
  tay(64, 140, 44, 238); tay(136, 140, 156, 238);
  P.push(["path", `d="M58 132 Q100 114 142 132 L150 252 Q100 264 50 252 Z"`, ao]);
  P.push(["circle", `cx="44" cy="246" r="13"`, da]); P.push(["circle", `cx="156" cy="246" r="13"`, da]);
  P.push(["rect", `x="89" y="104" width="22" height="22" rx="6"`, da]);
  P.push(["circle", `cx="64" cy="84" r="8"`, da]); P.push(["circle", `cx="136" cy="84" r="8"`, da]);
  P.push(["circle", `cx="100" cy="78" r="36"`, da]);
  const vien = P.map(([k, a, , w]) => (k === "line" ? `<line ${a} stroke-width="${w + 16}"/>` : `<${k} ${a}/>`)).join("");
  const to = P.map(([k, a, c, w]) => (k === "line" ? `<line ${a} stroke="#${c}" stroke-width="${w}" stroke-linecap="round"/>` : `<${k} ${a} fill="#${c}"/>`)).join("");
  // tóc trước, mũ, mặt, chi tiết áo
  const tocTruoc = { ngan: `<path d="M64 74 Q66 36 100 38 Q136 38 136 74 Q122 56 100 58 Q78 56 64 74 Z" fill="#${toc}"/>`, dai: `<path d="M63 82 Q60 38 100 38 Q140 38 137 82 Q128 54 100 56 Q74 56 63 82 Z" fill="#${toc}"/>`,
    buoc: `<path d="M64 76 Q64 38 100 40 Q136 38 136 76 Q124 56 100 57 Q76 56 64 76 Z" fill="#${toc}"/>`, hoi: `<path d="M66 64 Q72 40 100 40 Q128 40 134 64 Q118 52 100 54 Q82 52 66 64 Z" fill="#${toc}"/>` }[o.kieuToc || "ngan"] || "";
  const mu = { non: `<path d="M30 70 L100 12 L170 70 Q100 82 30 70 Z" fill="#e7cf8f"/><path d="M100 12 L58 70 M100 12 L82 72 M100 12 L118 72 M100 12 L142 70" stroke="#b89a52" stroke-width="2"/><path d="M30 70 Q100 82 170 70" stroke="#9f8240" stroke-width="3" fill="none"/>`,
    "bao-ho": `<path d="M58 70 Q60 30 100 30 Q140 30 142 70 Z" fill="#f2c230"/><rect x="50" y="66" width="100" height="10" rx="5" fill="#d9a816"/><path d="M100 30 V68" stroke="#d9a816" stroke-width="6"/>`,
    coi: `<path d="M60 68 Q62 28 100 28 Q138 28 140 68 Z" fill="#5f6f3d"/><ellipse cx="100" cy="68" rx="52" ry="9" fill="#4b5830"/><circle cx="100" cy="48" r="7" fill="#d8b35e"/>`,
    "luoi-trai": `<path d="M62 64 Q64 32 100 32 Q136 32 138 64 Z" fill="#${toi(ao, 0.9)}"/><path d="M118 62 Q150 60 162 70 L120 70 Z" fill="#${toi(ao, 0.7)}"/>` }[o.mu] || "";
  const mat = `<ellipse cx="100" cy="112" rx="18" ry="5" fill="#${toi(da, 0.8)}" opacity=".55"/>
    <ellipse cx="86" cy="82" rx="5.4" ry="4.4" fill="#fff"/><ellipse cx="114" cy="82" rx="5.4" ry="4.4" fill="#fff"/><circle cx="87" cy="82.5" r="3.4" fill="#2a2018"/><circle cx="115" cy="82.5" r="3.4" fill="#2a2018"/><circle cx="88.2" cy="81.2" r="1.1" fill="#fff"/><circle cx="116.2" cy="81.2" r="1.1" fill="#fff"/>
    <path d="M79 ${o.nhan === "buon" ? 72 : 73} Q86 ${o.nhan === "buon" ? 70 : 69} 93 ${o.nhan === "buon" ? 74 : 72} M107 ${o.nhan === "buon" ? 74 : 72} Q114 ${o.nhan === "buon" ? 70 : 69} 121 ${o.nhan === "buon" ? 72 : 73}" stroke="#${toc}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M100 86 Q97 93 101 95" stroke="#${toi(da, 0.72)}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="79" cy="95" r="5.5" fill="#e98f7a" opacity=".35"/><circle cx="121" cy="95" r="5.5" fill="#e98f7a" opacity=".35"/>
    ${o.nhan === "buon" ? `<path d="M91 101 Q100 95 109 101" stroke="#7a3d2c" stroke-width="3" fill="none" stroke-linecap="round"/>` : o.nhan === "lo" ? `<path d="M92 99 H108" stroke="#7a3d2c" stroke-width="3" stroke-linecap="round"/>` : `<path d="M90 96 Q100 104 110 96" stroke="#7a3d2c" stroke-width="3" fill="none" stroke-linecap="round"/>`}`;
  const chiTiet = `<path d="M142 132 L150 252 Q132 258 118 259 Q132 200 128 140 Z" fill="#000" opacity=".1"/>
    <path d="M70 206 Q100 214 130 206" stroke="#${toi(ao, 0.75)}" stroke-width="2" fill="none" opacity=".7"/><path d="M84 236 L90 222 M116 236 L110 222" stroke="#${toi(ao, 0.75)}" stroke-width="2" opacity=".6"/>
    ${o.taDe ? "" : `<rect x="70" y="150" width="22" height="18" rx="2" fill="none" stroke="#${toi(ao, 0.72)}" stroke-width="2"/><circle cx="100" cy="158" r="2.6" fill="#${toi(ao, 0.6)}"/><circle cx="100" cy="182" r="2.6" fill="#${toi(ao, 0.6)}"/><circle cx="100" cy="206" r="2.6" fill="#${toi(ao, 0.6)}"/>`}
    <path d="M36 226 L52 230 M164 226 L148 230" stroke="#${toi(ao, 0.7)}" stroke-width="4" stroke-linecap="round"/>
    ${o.vay ? `<path d="M100 250 L100 330" stroke="#${toi(quan, 0.75)}" stroke-width="2" opacity=".6"/>` : `<path d="M81 262 V392 M119 262 V392" stroke="#${toi(quan, 0.7)}" stroke-width="2" opacity=".7"/><path d="M97 244 V300" stroke="#${toi(quan, 0.6)}" stroke-width="2.5"/>`}
    <ellipse cx="74" cy="400" rx="9" ry="3.5" fill="#fff" opacity=".25"/><ellipse cx="114" cy="400" rx="9" ry="3.5" fill="#fff" opacity=".25"/>
    ${o.mu ? "" : `<path d="M74 60 Q90 46 108 48 M84 54 Q100 44 120 52 M96 46 Q116 44 128 60" stroke="#${sang(toc, 0.3)}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>`}`;
  const coAo = `<path d="M88 126 L100 140 L112 126" stroke="#${toi(ao, 0.7)}" stroke-width="4" fill="none" stroke-linejoin="round"/>${o.taDe ? `<path d="M74 170 H126 L132 250 Q100 258 68 250 Z" fill="#fbf4e2"/><path d="M80 168 L72 136 M120 168 L128 136" stroke="#fbf4e2" stroke-width="5"/>` : ""}`;
  // vật cầm tay (tay phải người trong hình = bên phải khung)
  const vat = { "thuoc-day": `<path d="M78 124 Q72 170 70 214" stroke="#f2c230" stroke-width="9" fill="none"/><path d="M122 124 Q128 170 130 214" stroke="#f2c230" stroke-width="9" fill="none"/>${[0, 1, 2, 3, 4, 5].map((k) => `<path d="M${71 - k * 0.2} ${138 + k * 14} h6 M${127 + k * 0.4} ${138 + k * 14} h-6" stroke="#2a2018" stroke-width="1.5"/>`).join("")}`,
    "ho-chieu": `<g transform="translate(150 214) rotate(-8)"><rect width="34" height="46" rx="3" fill="#7a2230"/><circle cx="17" cy="20" r="8" fill="none" stroke="#d8b35e" stroke-width="2"/><path d="M9 20 h16 M17 12 v16" stroke="#d8b35e" stroke-width="1.4"/></g>`,
    cap: `<g transform="translate(140 238)"><rect x="0" y="10" width="54" height="40" rx="5" fill="#5a3b22"/><path d="M18 10 V3 H36 V10" stroke="#3b2513" stroke-width="5" fill="none"/><rect x="0" y="24" width="54" height="4" fill="#3b2513"/></g>`,
    "bien-kd": `<g transform="translate(140 196)"><rect width="56" height="40" rx="4" fill="#fbf4e2" stroke="#b8322a" stroke-width="3"/><text x="28" y="18" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" font-size="11" fill="#b8322a">HỘ KD</text><path d="M10 28 h36" stroke="#1d2b44" stroke-width="2"/></g>`,
    "dong-ho": `<g transform="translate(160 228)"><circle r="20" fill="#fbf4e2" stroke="#1d2b44" stroke-width="4"/><path d="M0 0 V-12 M0 0 L9 5" stroke="#1d2b44" stroke-width="3" stroke-linecap="round"/></g>`,
    loa: `<g transform="translate(142 210)"><path d="M0 18 L34 4 V44 L0 30 Z" fill="#d84d34"/><rect x="-10" y="16" width="12" height="16" rx="2" fill="#b8322a"/><path d="M38 12 Q46 24 38 36" stroke="#fbf4e2" stroke-width="3" fill="none"/></g>`,
    so: `<g transform="translate(144 214) rotate(-6)"><rect width="38" height="52" rx="3" fill="#276a58"/><rect x="5" y="5" width="28" height="42" fill="none" stroke="#d8b35e" stroke-width="1.5"/></g>`,
    "phong-bi": `<g transform="translate(140 226) rotate(-6)"><rect width="56" height="38" rx="3" fill="#e9d6a8"/><path d="M0 2 L28 22 L56 2" stroke="#b39a62" stroke-width="2" fill="none"/><circle cx="28" cy="22" r="6" fill="#b8322a"/></g>`,
    "con-dau": `<g transform="translate(146 220)"><rect y="18" width="40" height="18" rx="3" fill="#3a2a1d"/><circle cx="20" cy="12" r="12" fill="#a8693a"/></g>` }[o.vat] || "";
  return `<svg viewBox="-10 0 220 430" width="100%" height="100%"><defs><linearGradient id="${g}l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient></defs>
    <g fill="#fbf8f1" stroke="#fbf8f1" stroke-width="16" stroke-linejoin="round" stroke-linecap="round">${vien}${o.mu === "non" ? `<path d="M30 70 L100 12 L170 70 Q100 82 30 70 Z"/>` : o.mu ? `<path d="M56 72 Q60 26 100 26 Q140 26 144 72 Z"/>` : ""}</g>${vat ? `<style>.${g}o *{stroke:#fbf8f1!important;stroke-width:12px!important;fill:#fbf8f1!important;stroke-linejoin:round}</style><g class="${g}o">${vat}</g>` : ""}
    <g stroke="#e3dccb" stroke-width="1.5" fill="none" opacity=".9">${vien.replace(/stroke-width="\d+"/g, "")}</g>
    ${to}${chiTiet}${tocTruoc}${mu}${mat}${coAo}${vat}</svg>`;
}

// ---------- SỔ BHXH NHỎ (nhìn từ trên, dùng cho chồng / hàng đếm được) ----------
function soNho() { const g = uid("sn");
  return `<svg viewBox="0 0 60 84" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f7a64"/><stop offset="1" stop-color="#${M.green2}"/></linearGradient></defs>
    <rect x="2" y="2" width="58" height="82" rx="3" fill="#ece2c6"/><rect width="57" height="81" rx="4" fill="url(#${g})"/><rect x="0" width="5" height="81" fill="#000" opacity=".2"/>
    <rect x="9" y="6" width="43" height="69" rx="1" fill="none" stroke="#${M.gold}" stroke-width="1.4"/><circle cx="30.5" cy="32" r="9" fill="none" stroke="#${M.gold}" stroke-width="1.6"/><circle cx="30.5" cy="32" r="4" fill="#${M.gold}"/>
    <rect x="16" y="50" width="29" height="3" rx="1.5" fill="#${M.gold}"/><rect x="20" y="57" width="21" height="2" rx="1" fill="#${M.gold}" opacity=".8"/></svg>`; }

// ---------- THƯỚC DÂY ----------
// hộp thước (nhìn từ trên): vỏ vàng, tâm crôm, đầu móc thò ra bên trái
function thuocHop() { const g = uid("th");
  return `<svg viewBox="0 0 200 180" width="100%" height="100%"><defs><radialGradient id="${g}v" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffe27a"/><stop offset=".6" stop-color="#f0b82a"/><stop offset="1" stop-color="#b9820f"/></radialGradient>
    <radialGradient id="${g}c" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#b7bec8"/><stop offset="1" stop-color="#6d7681"/></radialGradient></defs>
    <rect x="0" y="118" width="64" height="26" rx="3" fill="#f2c230"/><rect x="0" y="114" width="10" height="34" rx="2" fill="#8d96a3"/>
    <rect x="40" y="10" width="160" height="160" rx="46" fill="url(#${g}v)"/><rect x="40" y="10" width="160" height="160" rx="46" fill="none" stroke="#9c6e0c" stroke-width="3"/>
    <circle cx="120" cy="90" r="44" fill="url(#${g}c)"/><circle cx="120" cy="90" r="44" fill="none" stroke="#5c646f" stroke-width="2"/><circle cx="120" cy="90" r="9" fill="#5c646f"/>
    <rect x="150" y="20" width="36" height="18" rx="6" fill="#2a2a2a"/></svg>`; }
// dải thước duỗi: vạch nhỏ đều + các nhãn năm (labels) cách đều; vẽ đúng tỉ lệ ở cỡ cuối (w × 64)
function thuocDai(w, labels = []) { const g = uid("td"), n = Math.max(1, labels.length - 1), x0 = 30, x1 = Math.max(w - 30, 31), buoc = Math.max(4, (x1 - x0) / (n * 10));   // bước vạch ≥ 4 px (dải rất ngắn ở bìa: không lặp vô hạn)
  let v = ""; for (let x = x0; x <= x1; x += buoc) { const k = Math.round((x - x0) / buoc); v += `<path d="M${x.toFixed(1)} 0 V${k % 10 === 0 ? 30 : k % 5 === 0 ? 20 : 12}" stroke="#2a2018" stroke-width="${k % 10 === 0 ? 2.4 : 1.2}"/>`; }
  return `<svg viewBox="0 0 ${w} 64" width="100%" height="100%" preserveAspectRatio="none"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe17a"/><stop offset=".5" stop-color="#f2c230"/><stop offset="1" stop-color="#d9a816"/></linearGradient></defs>
    <rect width="${w}" height="64" rx="4" fill="url(#${g})"/>${v}${labels.map((t, k) => `<text x="${(x0 + (x1 - x0) * k / n).toFixed(1)}" y="54" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" font-size="24" fill="#2a2018">${esc(t)}</text>`).join("")}
    <rect width="${w}" height="64" rx="4" fill="none" stroke="#b58a12" stroke-width="2"/></svg>`; }

// ---------- KHỐI NĂM (ô tem đóng dấu trong sổ: một ô = một năm đóng) ----------
function khoiNam(k, o = {}) { const g = uid("kn"), mau = o.mau || M.green;
  return `<svg viewBox="0 0 80 80" width="100%" height="100%"><defs><pattern id="${g}" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="2.6" fill="#1a2433"/></pattern></defs>
    <rect width="80" height="80" fill="url(#${g})"/><rect x="3" y="3" width="74" height="74" rx="2" fill="#fbf5e6"/><rect x="9" y="9" width="62" height="62" rx="2" fill="none" stroke="#${mau}" stroke-width="2.4"/>
    <circle cx="40" cy="40" r="20" fill="none" stroke="#${mau}" stroke-width="3" stroke-dasharray="${o.mo ? "4 5" : "0"}" opacity="${o.mo ? 0.5 : 0.85}"/><text x="40" y="47" text-anchor="middle" font-family="Anton" font-size="22" fill="#${mau}" opacity="${o.mo ? 0.45 : 1}">${esc(k)}</text></svg>`; }

// ---------- PHONG BÌ LƯƠNG HƯU ----------
function phongBi(nhan = "LƯƠNG HƯU") { const g = uid("pb");
  return `<svg viewBox="0 0 260 170" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1e1b8"/><stop offset="1" stop-color="#d9c08c"/></linearGradient>
    <radialGradient id="${g}s" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#e4594a"/><stop offset=".6" stop-color="#b8322a"/><stop offset="1" stop-color="#7e1a14"/></radialGradient></defs>
    <rect width="260" height="170" rx="6" fill="url(#${g})"/><path d="M0 6 L130 96 L260 6" fill="#e6d3a2" stroke="#b39a62" stroke-width="2"/><path d="M0 170 L104 82 M260 170 L156 82" stroke="#c9b07a" stroke-width="2"/>
    <circle cx="130" cy="96" r="26" fill="url(#${g}s)"/><circle cx="130" cy="96" r="18" fill="none" stroke="#f3b2a6" stroke-width="2" opacity=".6"/>
    <text x="130" y="150" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" font-size="20" letter-spacing="4" fill="#6e5426">${esc(nhan)}</text></svg>`; }

// ---------- TẬP HỒ SƠ XẾP NGĂN (nhìn từ trên, mở: thấy các vách ngăn) — kéo giãn bề ngang được ----------
function tapNgan(nhan = "", w = 1000, h = 560) { const g = uid("tn"), tw = Math.min(w - 80, 640), ngan = Math.max(2, Math.round(w / 240));
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9b77c"/><stop offset="1" stop-color="#b78f55"/></linearGradient>
    <filter id="${g}n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .35 0 0 0 0 .24 0 0 0 0 .1 0 0 0 .22 0"/></filter></defs>
    <rect y="60" width="${w}" height="${h - 60}" rx="10" fill="url(#${g})"/><rect y="60" width="${w}" height="${h - 60}" rx="10" filter="url(#${g}n)"/>
    <path d="M40 60 q12 0 16 -12 l12 -36 q4 -12 16 -12 h${tw - 64} q12 0 16 12 l12 36 q4 12 16 12" fill="url(#${g})"/>
    ${Array.from({ length: ngan - 1 }, (_, k) => { const x = w * (k + 1) / ngan; return `<path d="M${x} 80 V${h - 20}" stroke="#8d6a36" stroke-width="3" opacity=".55"/><path d="M${x + 4} 80 V${h - 20}" stroke="#f0d9a8" stroke-width="2" opacity=".5"/>`; }).join("")}
    <rect x="16" y="76" width="${w - 32}" height="${h - 92}" rx="6" fill="none" stroke="#8d6a36" stroke-width="2" opacity=".5"/>
    <text x="${40 + tw / 2}" y="42" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" font-size="20" letter-spacing="3" fill="#5a4120">${esc(nhan)}</text></svg>`; }

// ---------- PHIẾU GIẤY (nền cho thẻ nội dung): giấy ngà, đầu phiếu màu, lỗ bấm ----------
function phieu(mau = M.green, o = {}) { const g = uid("ph");
  return `<svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="none"><defs><filter id="${g}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="13"/><feColorMatrix values="0 0 0 0 .45 0 0 0 0 .38 0 0 0 0 .25 0 0 0 .14 0"/></filter></defs>
    <rect width="400" height="300" rx="4" fill="#${M.paper}"/><rect width="400" height="300" rx="4" filter="url(#${g})"/><rect width="400" height="${o.dau ?? 12}" fill="#${mau}"/>
    ${o.lo ? `<circle cx="22" cy="40" r="6" fill="#1a2433" opacity=".85"/>` : ""}</svg>`; }

// ---------- BÌNH QUỸ (nhìn chính diện, là hình cắt giấy nằm trên bàn) ----------
// binhQuyKinh(): vỏ thuỷ tinh + nắp + nhãn (lớp TRÊN); xuTrongBinh(): khối xu bên trong (lớp DƯỚI, kéo giãn chiều cao được)
const BINH = "M70 100 Q30 120 30 170 V470 Q30 510 70 510 H330 Q370 510 370 470 V170 Q370 120 330 100 Z";
// lớp SAU: viền giấy cắt + mặt kính phía sau (hơi tối) — xu nằm trên lớp này
function binhQuySau() { return `<svg viewBox="0 0 400 520" width="100%" height="100%"><g fill="#fbf8f1" stroke="#fbf8f1" stroke-width="16" stroke-linejoin="round"><path d="M70 70 H330 V100 Q370 120 370 170 V470 Q370 510 330 510 H70 Q30 510 30 470 V170 Q30 120 70 100 Z"/></g>
    <path d="${BINH}" fill="#e3eef2"/><path d="${BINH}" fill="#9fc2d1" fill-opacity=".25"/></svg>`; }
// lớp TRƯỚC: thành kính trong suốt, vệt sáng, nắp vàng, nhãn — đè lên xu
function binhQuyKinh(nhan = "QUỸ BHXH") { const g = uid("bq");
  return `<svg viewBox="0 0 400 520" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".42"/><stop offset=".16" stop-color="#fff" stop-opacity=".04"/><stop offset=".84" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".28"/></linearGradient>
    <linearGradient id="${g}n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3dc95"/><stop offset=".5" stop-color="#d8b35e"/><stop offset="1" stop-color="#9b7428"/></linearGradient></defs>
    <path d="${BINH}" fill="url(#${g})" stroke="#c9dde6" stroke-width="5"/>
    <path d="M58 150 Q54 300 60 450" stroke="#fff" stroke-opacity=".75" stroke-width="10" stroke-linecap="round" fill="none"/><path d="M344 170 Q348 300 342 420" stroke="#fff" stroke-opacity=".35" stroke-width="6" stroke-linecap="round" fill="none"/>
    <rect x="62" y="58" width="276" height="46" rx="10" fill="url(#${g}n)"/><rect x="62" y="58" width="276" height="10" rx="5" fill="#fff" opacity=".35"/>
    <rect x="96" y="150" width="208" height="64" rx="6" fill="#fbf4e2" stroke="#${M.green}" stroke-width="3"/><text x="200" y="192" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" font-size="25" letter-spacing="3" fill="#${M.green}">${esc(nhan)}</text></svg>`; }
function xuTrongBinh() { const g = uid("xb"); let c = "";
  for (let r = 0; r < 26; r++) for (let k = 0; k < 9; k++) { const x = 18 + k * 38 + (r % 2) * 19, y = 10 + r * 18; c += `<ellipse cx="${x}" cy="${y}" rx="19" ry="7" fill="url(#${g})" stroke="#8a6420" stroke-width="1.2"/>`; }
  return `<svg viewBox="0 0 340 480" width="100%" height="100%" preserveAspectRatio="none"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1bd"/><stop offset=".5" stop-color="#dcb35a"/><stop offset="1" stop-color="#9c7326"/></linearGradient></defs>
    <rect width="340" height="480" rx="20" fill="#b48a35"/>${c}</svg>`; }

module.exports = { nguoi, soNho, thuocHop, thuocDai, khoiNam, phongBi, tapNgan, phieu, binhQuySau, binhQuyKinh, xuTrongBinh, DA };
