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

// ---------- HÌNH CẮT GIẤY CHUNG: viền giấy trắng quanh khối (silhouette) rồi tô nội dung ----------
const catGiay = (vb, khoi, noiDung, w = 14) => `<svg viewBox="${vb}" width="100%" height="100%"><g fill="#fbf8f1" stroke="#fbf8f1" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round">${khoi}</g>${noiDung}</svg>`;

// TẬP HỒ SƠ ĐÓNG (nhìn từ trên) có tab số; `bieu` = hình in trên bìa (sach | so | dau)
function tapHoSo(so = "1", mau = "c9a36a", bieu = "") { const g = uid("th");
  const hinh = { sach: `<g transform="translate(150 140)"><rect width="120" height="160" rx="6" fill="#7a2230"/><rect x="10" y="10" width="100" height="140" fill="none" stroke="#d8b35e" stroke-width="2"/><text x="60" y="70" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" font-size="16" fill="#d8b35e">LUẬT</text><text x="60" y="92" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" font-size="16" fill="#d8b35e">BHXH</text></g>`,
    so: `<g transform="translate(130 140)">${[0, 1, 2].map((k) => `<g transform="translate(${k * 52} ${k % 2 ? 14 : 0}) rotate(${k * 4 - 4})"><rect width="58" height="82" rx="4" fill="#276a58"/><rect x="7" y="7" width="44" height="68" fill="none" stroke="#d8b35e" stroke-width="1.5"/></g>`).join("")}</g>`,
    dau: `<g transform="translate(150 150) rotate(-12 70 70)" opacity=".92"><circle cx="70" cy="70" r="64" fill="none" stroke="#b8322a" stroke-width="8"/><circle cx="70" cy="70" r="49" fill="none" stroke="#b8322a" stroke-width="3"/><path d="M70.0 40.0 L77.1 60.3 L98.5 60.7 L81.4 73.7 L87.6 94.3 L70.0 82.0 L52.4 94.3 L58.6 73.7 L41.5 60.7 L62.9 60.3Z" fill="#b8322a"/></g>` }[bieu] || "";   // dấu đỏ tròn (đánh giá, kết luận)
  return `<svg viewBox="0 0 440 400" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${sangHex(mau, 0.15)}"/><stop offset="1" stop-color="#${toiHex(mau, 0.82)}"/></linearGradient>
    <filter id="${g}n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="6"/><feColorMatrix values="0 0 0 0 .3 0 0 0 0 .2 0 0 0 0 .1 0 0 0 .2 0"/></filter></defs>
    <rect x="14" y="56" width="420" height="340" rx="10" fill="#${toiHex(mau, 0.7)}"/><path d="M20 56 v-26 q0 -12 12 -12 h120 q10 0 14 10 l10 28 Z" fill="url(#${g})"/>
    <rect x="6" y="48" width="420" height="340" rx="10" fill="url(#${g})"/><rect x="6" y="48" width="420" height="340" rx="10" filter="url(#${g}n)"/>
    <rect x="24" y="66" width="384" height="304" rx="6" fill="none" stroke="#${toiHex(mau, 0.6)}" stroke-width="2" opacity=".5"/>
    <text x="90" y="44" text-anchor="middle" font-family="Anton" font-size="34" fill="#${toiHex(mau, 0.45)}">${esc(so)}</text>${hinh}</svg>`; }
function sangHex(h, k) { const n = parseInt(h, 16); return [16, 8, 0].map((s) => { const v = (n >> s) & 255; return Math.round(v + (255 - v) * k).toString(16).padStart(2, "0"); }).join(""); }
function toiHex(h, k) { const n = parseInt(h, 16); return [16, 8, 0].map((s) => Math.round(((n >> s) & 255) * k).toString(16).padStart(2, "0")).join(""); }

// SÁCH LUẬT MỞ (nhìn từ trên): hai trang, gáy giữa, đầu trang in tên luật; dòng chữ mờ ở trang trái (chữ thật đè lên trang phải)
function sachLuatMo(ten = "LUẬT BẢO HIỂM XÃ HỘI") { const g = uid("sl");
  const dong = (x, y0, n) => Array.from({ length: n }, (_, k) => `<rect x="${x}" y="${y0 + k * 26}" width="${300 - (k % 4) * 30}" height="7" rx="3" fill="#cdbf9e"/>`).join("");
  return `<svg viewBox="0 0 900 600" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset=".44" stop-color="#3b2a10" stop-opacity="0"/><stop offset=".5" stop-color="#3b2a10" stop-opacity=".3"/><stop offset=".56" stop-color="#3b2a10" stop-opacity="0"/></linearGradient></defs>
    <rect x="0" y="10" width="900" height="590" rx="10" fill="#6e1d28"/><rect x="14" y="0" width="436" height="580" rx="4" fill="#f6efdf"/><rect x="450" y="0" width="436" height="580" rx="4" fill="#f6efdf"/>
    <rect x="14" y="0" width="872" height="580" fill="url(#${g})"/>
    <text x="232" y="44" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" font-size="15" letter-spacing="3" fill="#7a2230">${esc(ten)}</text><text x="668" y="44" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" font-size="15" letter-spacing="3" fill="#7a2230">CHƯƠNG I · NHỮNG QUY ĐỊNH CHUNG</text>
    <path d="M60 58 H404 M496 58 H840" stroke="#7a2230" stroke-width="1.5"/>${dong(70, 90, 17)}<text x="668" y="560" text-anchor="middle" font-family="Be Vietnam Pro" font-size="14" fill="#8a7a58">3</text></svg>`; }

// BÚT DẠ QUANG (nhìn từ trên)
const butDaQuang = () => `<svg viewBox="0 0 420 70" width="100%" height="100%"><rect x="10" y="12" width="300" height="46" rx="14" fill="#f2d33a"/><rect x="10" y="14" width="300" height="10" rx="5" fill="#fff" opacity=".35"/><rect x="290" y="16" width="70" height="38" rx="6" fill="#2a2a2a"/><path d="M360 22 L404 30 L404 40 L360 48 Z" fill="#f7e463"/><rect x="20" y="22" width="120" height="26" rx="4" fill="#e3bd1c"/><text x="80" y="41" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" font-size="16" fill="#5a4a08">MARK</text></svg>`;

// Ô (nhìn chính diện, cắt giấy): mo = true bung rộng, false gấp lại
function o(mo = true, mau = "c0504d") { const g = uid("o");
  if (!mo) return catGiay("0 0 120 420", `<path d="M60 20 L80 300 L40 300 Z"/><path d="M60 300 V380 Q60 404 38 404"/>`, `<path d="M60 20 L80 300 L40 300 Z" fill="#${mau}"/><path d="M60 20 L68 300" stroke="#${toiHex(mau, 0.7)}" stroke-width="3"/><path d="M60 300 V380 Q60 404 38 404" stroke="#5a3b22" stroke-width="10" fill="none" stroke-linecap="round"/><rect x="50" y="160" width="20" height="10" rx="3" fill="#d8b35e"/>`);
  const nan = [0, 1, 2, 3, 4].map((k) => { const x0 = 20 + k * 112, x1 = x0 + 112; return `<path d="M${x0} 250 Q${(x0 + x1) / 2} ${k % 2 ? 222 : 230} ${x1} 250 L300 40 Z" fill="#${k % 2 ? toiHex(mau, 0.85) : mau}"/>`; }).join("");
  return catGiay("0 0 600 560", `<path d="M20 250 Q20 40 300 30 Q580 40 580 250 Z"/><path d="M300 250 V500 Q300 540 260 540"/>`, `<defs><radialGradient id="${g}" cx=".4" cy=".2" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
    <path d="M300 250 V500 Q300 540 260 540" stroke="#5a3b22" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M20 250 Q20 40 300 30 Q580 40 580 250 Z" fill="#${mau}"/>${nan}<path d="M20 250 Q20 40 300 30 Q580 40 580 250 Z" fill="url(#${g})"/><circle cx="300" cy="28" r="10" fill="#d8b35e"/>`); }

// CÂN HAI ĐĨA (chính diện, cắt giấy)
const can = () => catGiay("0 0 420 400", `<rect x="196" y="40" width="28" height="320"/><rect x="40" y="70" width="340" height="16"/><path d="M20 210 Q100 260 180 210 Z M240 190 Q320 240 400 190 Z"/><rect x="120" y="350" width="180" height="30"/>`,
  `<rect x="196" y="40" width="28" height="320" rx="6" fill="#b48a35"/><rect x="40" y="70" width="340" height="16" rx="8" fill="#9b7428" transform="rotate(-4 210 78)"/><path d="M60 82 L40 210 M140 82 L180 210 M300 72 L240 190 M380 66 L400 190" stroke="#7d5a1c" stroke-width="3"/>
   <path d="M20 210 Q100 262 180 210 Z" fill="#d8b35e"/><path d="M240 190 Q320 242 400 190 Z" fill="#d8b35e"/><rect x="120" y="350" width="180" height="30" rx="8" fill="#7d5a1c"/><circle cx="210" cy="40" r="14" fill="#d8b35e"/>
   <g transform="translate(66 178)"><rect width="34" height="34" rx="4" fill="#276a58"/></g><g transform="translate(300 160)"><circle cx="18" cy="16" r="16" fill="#e2b84e" stroke="#8a6420" stroke-width="2"/></g>`);

// GIỎ HÀNG (chính diện): giữ sức mua
const gioHang = () => catGiay("0 0 420 360", `<path d="M40 140 H380 L340 330 H80 Z"/><path d="M110 140 Q210 20 310 140" fill="none"/>`,
  `<path d="M110 140 Q210 20 310 140" stroke="#8a5a2b" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="160" cy="118" r="34" fill="#d84d34"/><circle cx="230" cy="106" r="30" fill="#f2c230"/><rect x="250" y="70" width="40" height="80" rx="8" fill="#5f8f4a"/>
   <path d="M40 140 H380 L340 330 H80 Z" fill="#c9a36a"/>${[0, 1, 2, 3].map((k) => `<path d="M${60 + k * 4} ${180 + k * 40} H${360 - k * 8}" stroke="#8a6a3c" stroke-width="5"/>`).join("")}${[0, 1, 2, 3, 4].map((k) => `<path d="M${110 + k * 50} 140 L${120 + k * 45} 330" stroke="#8a6a3c" stroke-width="5"/>`).join("")}`);

// VẬT Ở ĐIỂM DỪNG CỦA CON ĐƯỜNG ĐỜI (cắt giấy)
const nhietKe = () => catGiay("0 0 120 360", `<rect x="40" y="20" width="40" height="260" rx="20"/><circle cx="60" cy="300" r="40"/>`, `<rect x="40" y="20" width="40" height="260" rx="20" fill="#eef3f6" stroke="#9fb3bf" stroke-width="3"/><rect x="52" y="120" width="16" height="170" fill="#d8392b"/><circle cx="60" cy="300" r="40" fill="#d8392b"/><circle cx="48" cy="288" r="10" fill="#fff" opacity=".4"/>${[0, 1, 2, 3, 4, 5].map((k) => `<path d="M82 ${60 + k * 34} h14" stroke="#5a6773" stroke-width="3"/>`).join("")}`);
const binhSua = () => catGiay("0 0 160 360", `<path d="M60 20 Q80 0 100 20 L104 70 H56 Z"/><rect x="30" y="70" width="100" height="270" rx="30"/>`, `<path d="M60 20 Q80 0 100 20 L104 70 H56 Z" fill="#f2c9a0"/><rect x="40" y="62" width="80" height="24" rx="6" fill="#4f9fd8"/><rect x="30" y="80" width="100" height="260" rx="30" fill="#e8f3fa" stroke="#9fc2d8" stroke-width="4"/><rect x="34" y="190" width="92" height="146" rx="26" fill="#fbf5e6"/>${[0, 1, 2, 3].map((k) => `<path d="M30 ${130 + k * 46} h24" stroke="#4f9fd8" stroke-width="4"/>`).join("")}`);
const hopCuuThuong = () => catGiay("0 0 300 240", `<rect x="10" y="40" width="280" height="190" rx="22"/><rect x="110" y="10" width="80" height="40" rx="10"/>`, `<rect x="110" y="10" width="80" height="40" rx="10" fill="none" stroke="#a52a20" stroke-width="10"/><rect x="10" y="40" width="280" height="190" rx="22" fill="#d8392b"/><rect x="10" y="40" width="280" height="40" rx="22" fill="#fff" opacity=".18"/><rect x="128" y="86" width="44" height="120" rx="6" fill="#fff"/><rect x="90" y="124" width="120" height="44" rx="6" fill="#fff"/>`);
const hoaSen = () => catGiay("0 0 320 300", `<path d="M160 30 Q210 120 160 220 Q110 120 160 30 Z M60 110 Q140 140 160 220 Q80 200 60 110 Z M260 110 Q180 140 160 220 Q240 200 260 110 Z"/><ellipse cx="160" cy="240" rx="120" ry="34"/>`,
  `<ellipse cx="160" cy="244" rx="120" ry="30" fill="#4f8a5b"/><path d="M60 236 Q160 270 260 236" stroke="#3b6b46" stroke-width="4" fill="none"/>
   <path d="M60 110 Q140 140 160 220 Q80 200 60 110 Z" fill="#f4e9ee"/><path d="M260 110 Q180 140 160 220 Q240 200 260 110 Z" fill="#f4e9ee"/><path d="M160 30 Q210 120 160 220 Q110 120 160 30 Z" fill="#fbf6f8"/><path d="M160 60 V200" stroke="#e7d3dc" stroke-width="3"/><circle cx="160" cy="214" r="12" fill="#f2c230"/>`);

// ĐỒNG HỒ % (mặt số 0–100, cung 40–75 tô vàng) — KIM là lớp riêng (kimDongHo) để Morph xoay
function dongHo() { const g = uid("dh"), R = 230, cx = 260, cy = 260, A = (p) => Math.PI * (1 - p / 100), P = (p, r) => [cx + r * Math.cos(A(p)), cy - r * Math.sin(A(p))];
  const cung = (p0, p1, r) => { const [x0, y0] = P(p0, r), [x1, y1] = P(p1, r); return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`; };
  const vach = Array.from({ length: 21 }, (_, k) => { const p = k * 5, [x0, y0] = P(p, R - 10), [x1, y1] = P(p, R - (k % 2 ? 26 : 40)); return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="#1d2b44" stroke-width="${k % 2 ? 2 : 4}"/>`; }).join("");
  const so = [0, 20, 45, 60, 75, 100].map((p) => { const [x, y] = P(p, R - 76); return `<text x="${x.toFixed(1)}" y="${(y + 9).toFixed(1)}" text-anchor="middle" font-family="Anton" font-size="${[45, 75].includes(p) ? 30 : 24}" fill="#${[45, 75].includes(p) ? "b8322a" : "1d2b44"}">${p}</text>`; }).join("");
  return `<svg viewBox="0 0 520 320" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf5e6"/><stop offset="1" stop-color="#ece2c9"/></linearGradient></defs>
    <path d="M${cx - R - 20} ${cy} A${R + 20} ${R + 20} 0 0 1 ${cx + R + 20} ${cy} L${cx + R + 20} ${cy + 40} H${cx - R - 20} Z" fill="#b48a35"/><path d="M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy} Z" fill="url(#${g})"/>
    <path d="${cung(40, 75, R - 26)}" stroke="#f2c230" stroke-width="30" fill="none"/>${vach}${so}<text x="${cx}" y="${cy + 30}" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" font-size="20" letter-spacing="3" fill="#fbf5e6">TỶ LỆ HƯỞNG %</text></svg>`; }
// kim: hình chữ nhật dài, tâm xoay ở ĐÁY GIỮA (đặt lớp sao cho tâm lớp = tâm mặt số; xoay bằng rotate)
const kimDongHo = () => `<svg viewBox="0 0 40 460" width="100%" height="100%"><path d="M20 12 L30 230 L10 230 Z" fill="#b8322a"/><circle cx="20" cy="230" r="18" fill="#1d2b44"/><circle cx="20" cy="230" r="7" fill="#d8b35e"/></svg>`;

// XẤP PHIẾU LƯƠNG (bình quân tiền lương)
const phieuLuong = () => { const g = uid("pl"); return `<svg viewBox="0 0 320 260" width="100%" height="100%">${[3, 2, 1, 0].map((k) => `<g transform="translate(${k * 10} ${k * 12}) rotate(${(k - 1.5) * 2} 150 120)"><rect width="280" height="200" rx="4" fill="#${k ? "efe6cf" : "fbf5e6"}" stroke="#d6c9a8" stroke-width="1.5"/>${k ? "" : `<text x="20" y="34" font-family="Be Vietnam Pro" font-weight="800" font-size="18" letter-spacing="2" fill="#276a58">PHIẾU LƯƠNG</text>${[0, 1, 2, 3].map((j) => `<rect x="20" y="${56 + j * 30}" width="${170 - j * 20}" height="8" rx="4" fill="#cdbf9e"/><rect x="220" y="${56 + j * 30}" width="40" height="8" rx="4" fill="#9b7428"/>`).join("")}`}</g>`).join("")}</svg>`; };

// NGƯỜI TÍ HON (lưới đếm 1 người = 2 %): thân tròn đơn giản, cắt giấy
const nguoiNho = (mau = "4f86a8", buon = false) => catGiay("0 0 60 110", `<circle cx="30" cy="22" r="16"/><path d="M8 104 V64 Q8 40 30 40 Q52 40 52 64 V104 Z"/>`, `<path d="M8 104 V64 Q8 40 30 40 Q52 40 52 64 V104 Z" fill="#${mau}"/><circle cx="30" cy="22" r="16" fill="#e6b48d"/><path d="M15 18 Q16 6 30 6 Q44 6 45 18 Q38 11 30 12 Q22 11 15 18 Z" fill="#2b2118"/><circle cx="25" cy="24" r="2" fill="#2a2018"/><circle cx="35" cy="24" r="2" fill="#2a2018"/><path d="${buon ? "M25 33 Q30 29 35 33" : "M25 30 Q30 34 35 30"}" stroke="#7a3d2c" stroke-width="1.8" fill="none" stroke-linecap="round"/>`, 8);

// CỬA RA (chính diện, cắt giấy): khung gỗ, cánh mở hé, ánh sáng lọt ra
const cua = () => catGiay("0 0 320 520", `<rect x="20" y="20" width="280" height="490"/>`, `<rect x="20" y="20" width="280" height="490" rx="6" fill="#5a3b22"/><rect x="44" y="44" width="232" height="466" fill="#fdf3d6"/><rect x="44" y="44" width="232" height="466" fill="#f2c230" opacity=".35"/>
  <path d="M44 44 L170 70 V500 L44 510 Z" fill="#8a5a2b"/><path d="M60 80 L156 96 V250 L60 240 Z M60 270 L156 280 V470 L60 480 Z" fill="none" stroke="#6e4522" stroke-width="5"/><circle cx="150" cy="290" r="8" fill="#d8b35e"/>
  <text x="222" y="120" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" font-size="22" fill="#5a3b22" letter-spacing="2">LỐI RA</text>`);

// CHỒNG GIẤY (nhìn nghiêng): cao h px trong khung 360 × h — mỗi tờ một vạch
function chongGiay(h = 400) { const n = Math.max(3, Math.round(h / 7)); let v = "";
  for (let k = 0; k < n; k++) { const y = h - 10 - k * ((h - 30) / n), dx = ((k * 37) % 9) - 4; v += `<rect x="${20 + dx}" y="${y.toFixed(1)}" width="320" height="${((h - 30) / n + 1).toFixed(1)}" fill="#${k % 2 ? "f6efdf" : "ece2c9"}" stroke="#cdbf9e" stroke-width=".8"/>`; }
  return `<svg viewBox="0 0 360 ${h}" width="100%" height="100%" preserveAspectRatio="none">${v}<rect x="14" y="10" width="332" height="16" rx="3" fill="#fbf5e6" stroke="#cdbf9e"/></svg>`; }

// ĐIỆN THOẠI (màn hình ứng dụng sổ BHXH điện tử — vẽ chung chung, KHÔNG chép giao diện / logo của ứng dụng thật)
const dienThoai = (sang = true) => `<svg viewBox="0 0 240 460" width="100%" height="100%"><rect width="240" height="460" rx="34" fill="#1b1f27"/><rect x="12" y="14" width="216" height="432" rx="24" fill="#${sang ? "eaf4ef" : "2a3240"}"/>
  ${sang ? `<rect x="12" y="14" width="216" height="80" rx="24" fill="#276a58"/><text x="120" y="62" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" font-size="18" fill="#fff">SỔ BHXH ĐIỆN TỬ</text>${[0, 1, 2, 3].map((k) => `<rect x="30" y="${116 + k * 74}" width="180" height="56" rx="10" fill="#fff" stroke="#bcd8c9"/><circle cx="56" cy="${144 + k * 74}" r="14" fill="#${["276a58", "d8b35e", "4f86a8", "c0504d"][k]}"/><rect x="80" y="${136 + k * 74}" width="${100 - k * 10}" height="8" rx="4" fill="#9fb7aa"/><rect x="80" y="${150 + k * 74}" width="70" height="6" rx="3" fill="#cfe0d6"/>`).join("")}` : ""}
  <rect x="96" y="22" width="48" height="10" rx="5" fill="#1b1f27"/></svg>`;

// Ổ KHOÁ (có thẻ chữ) và MIẾNG VÁ
const oKhoa = () => catGiay("0 0 200 240", `<path d="M50 110 V70 Q50 20 100 20 Q150 20 150 70 V110"/><rect x="30" y="100" width="140" height="120" rx="16"/>`, `<path d="M50 110 V70 Q50 20 100 20 Q150 20 150 70 V110" stroke="#9aa4b2" stroke-width="18" fill="none"/><rect x="30" y="100" width="140" height="120" rx="16" fill="#d8b35e"/><rect x="30" y="100" width="140" height="22" rx="10" fill="#fff" opacity=".3"/><circle cx="100" cy="150" r="14" fill="#5a4120"/><rect x="94" y="156" width="12" height="34" rx="4" fill="#5a4120"/>`);
const miengVa = () => catGiay("0 0 200 200", `<rect x="20" y="20" width="160" height="160" rx="14"/>`, `<rect x="20" y="20" width="160" height="160" rx="14" fill="#c9a36a" transform="rotate(8 100 100)"/>${[0, 1, 2, 3].map((k) => `<path d="M${40 + k * 40} 30 V170" stroke="#8a6a3c" stroke-width="3" stroke-dasharray="8 8" transform="rotate(8 100 100)"/>`).join("")}`);
// RÀO CHẮN (xu bị chặn ở miệng quỹ = nợ, trốn đóng)
const raoChan = () => catGiay("0 0 300 160", `<rect x="10" y="40" width="280" height="60"/><rect x="30" y="100" width="20" height="50"/><rect x="250" y="100" width="20" height="50"/>`, `<rect x="30" y="100" width="20" height="50" fill="#5a6773"/><rect x="250" y="100" width="20" height="50" fill="#5a6773"/><rect x="10" y="40" width="280" height="60" rx="8" fill="#fbf5e6"/>${[0, 1, 2, 3, 4].map((k) => `<path d="M${10 + k * 60} 100 L${60 + k * 60} 40" stroke="#b8322a" stroke-width="22"/>`).join("")}<rect x="10" y="40" width="280" height="60" rx="8" fill="none" stroke="#7a1d16" stroke-width="3"/>`);

const sachLuatDong = () => `<svg viewBox="0 0 140 190" width="100%" height="100%"><rect x="6" y="6" width="134" height="184" rx="6" fill="#efe5cb"/><rect width="130" height="180" rx="6" fill="#7a2230"/><rect x="0" width="10" height="180" fill="#000" opacity=".2"/><rect x="16" y="12" width="104" height="156" fill="none" stroke="#d8b35e" stroke-width="2"/><text x="68" y="76" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" font-size="18" fill="#d8b35e">LUẬT</text><text x="68" y="100" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="800" font-size="18" fill="#d8b35e">BHXH</text><text x="68" y="146" text-anchor="middle" font-family="Be Vietnam Pro" font-weight="700" font-size="12" fill="#d8b35e">2024</text></svg>`;
const chongSo = () => `<svg viewBox="0 0 120 150" width="100%" height="100%">${[0, 1, 2].map((k) => `<g transform="translate(${12 - k * 6} ${40 - k * 18}) rotate(${(k - 1) * 4} 50 60)"><rect x="3" y="3" width="76" height="104" rx="4" fill="#ece2c6"/><rect width="74" height="102" rx="4" fill="#276a58"/><rect x="9" y="8" width="56" height="86" fill="none" stroke="#d8b35e" stroke-width="1.6"/><circle cx="37" cy="40" r="10" fill="none" stroke="#d8b35e" stroke-width="1.8"/></g>`).join("")}</svg>`;
const mua = (w, h) => { let v = ""; for (let k = 0; k < Math.round(w * h / 9000); k++) { const x = (k * 97) % w, y = (k * 53) % h; v += `<path d="M${x} ${y} l-10 26" stroke="#bcd3e6" stroke-opacity=".45" stroke-width="2.4" stroke-linecap="round"/>`; } return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%">${v}</svg>`; };
module.exports = { nguoi, soNho, thuocHop, thuocDai, khoiNam, phongBi, tapNgan, phieu, binhQuySau, binhQuyKinh, xuTrongBinh, DA, tapHoSo, sachLuatMo, butDaQuang, o, can, gioHang, nhietKe, binhSua, hopCuuThuong, hoaSen, dongHo, kimDongHo, phieuLuong, nguoiNho, cua, chongGiay, dienThoai, oKhoa, miengVa, raoChan, sachLuatDong, chongSo, mua };
