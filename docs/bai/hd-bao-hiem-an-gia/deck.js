// Deck "HĐ bảo hiểm Bảo Việt An Gia & thực trạng thị trường" (Nhóm 2) — skill slide-chuan.
// Hướng 3 · BÁO CÁO ĐẬM (Hào chọn ở điểm duyệt C1, 20/11/2026): navy + trắng, MỘT màu nhấn cam san hô,
// tiêu đề Anton in hoa NGẮN (≤ 30 ký tự) + câu dẫn đầy đủ bằng Be Vietnam Pro, panel chia đôi, số lớn, ảnh tròn đen trắng, lưới chấm.
// Điểm C2: dựng 8 slide mẫu phủ các bố cục chính; sau khi Hào duyệt mới đổ đủ 25 slide (bản cũ 25 slide hướng 1: lịch sử git, commit 4785dc1).
//   node deck.js && PW_CHROMIUM=/opt/pw-browsers/chromium node ../../../.claude/skills/slide-chuan/scripts/dung.js . --ten=hd-bao-hiem-an-gia --nhap
const fs = require("fs"), path = require("path");
const D = __dirname, NOTES = require("./notes.json"), TONG = 27;
const ghi = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
fs.rmSync(path.join(D, "asset", "hinh"), { recursive: true, force: true });
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const em = (s) => esc(s).replace(/\[([^\]]+)\]/g, "<em>$1</em>");
const P = { navy: "#253A6B", navy2: "#3E63A8", navy3: "#7FB3E8", trang: "#FFFFFF", nen: "#F2F7FD", phu: "#3D4A63", ke: "#DCE7F5", cam: "#2F6FE4", cam4: "#E3EFFD", cam0: "#1E4FC2", troi: "#8FD3F7" };
const DOC = ["#BFE3FB", "#9FCFF5", "#7FB3E8", "#5B8FD6", "#3E63A8", "#2F4F8F", "#253A6B"];   // dải chuyển màu nhạt → đậm cho cột biểu đồ (theo mẫu Hào gửi)
let nL = 0;
const S = [];
const A = (a, at, dur = 500) => `data-a="${a}" data-at="${at}" data-dur="${dur}"`;
const lop = (body, x, y, w, h, alt, ex = "", loai = "phang") => { const f = `l${String(++nL).padStart(3, "0")}.svg`;
  ghi(path.join(D, "asset", "hinh", f), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${body}</svg>`);
  return `<img data-l="l${nL}" data-loai="${loai}" data-alt="${esc(alt)}" ${ex} src="asset/hinh/${f}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`; };
const nen = (body) => lop(body, 0, 0, 1920, 1080, "Hình trang trí", "", "nen");
const KHOI_GOC = (toi = false, v = 0) => { const a = toi ? P.navy2 : P.troi, b = toi ? P.navy3 : P.navy;
  return [
    `<rect x="1700" y="-120" width="420" height="300" rx="120" fill="${a}" opacity="0.9"/><rect x="1810" y="-60" width="260" height="330" rx="110" fill="${b}" opacity="0.85"/><rect x="-140" y="840" width="230" height="300" rx="100" fill="${a}" opacity="0.9"/><rect x="-120" y="900" width="210" height="260" rx="90" fill="${b}" opacity="0.85"/>`,
    `<rect x="1800" y="-90" width="260" height="230" rx="100" fill="${b}" opacity="0.85"/><rect x="1846" y="250" width="200" height="460" rx="100" fill="${a}" opacity="0.9"/><circle cx="1890" cy="760" r="34" fill="${b}"/>`,
    `<rect x="1760" y="-150" width="320" height="250" rx="110" fill="${a}" opacity="0.9"/><circle cx="1990" cy="1110" r="260" fill="${a}" opacity="0.9"/><circle cx="1930" cy="1170" r="180" fill="${b}" opacity="0.85"/>`,
    `<circle cx="1880" cy="40" r="95" fill="${b}" opacity="0.85"/><circle cx="1790" cy="-20" r="70" fill="${a}" opacity="0.9"/><rect x="-230" y="640" width="300" height="480" rx="140" fill="${a}" opacity="0.9"/><rect x="-200" y="880" width="270" height="300" rx="120" fill="${b}" opacity="0.85"/>`][v % 4]; };
const anh = (f, x, y, w, h, alt, ex = "") => `<img data-l="a${++nL}" data-loai="anh-chup" data-alt="${esc(alt)}" ${ex} src="anh/${f}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`;
const T = (cls, x, y, w, s, ex = "") => `<div class="${cls}" data-t ${ex} style="left:${x}px;top:${y}px;width:${w}px">${em(s)}</div>`;
const G = (cls, x, y, w, h, html, ex = "") => `<div class="${cls} giua" data-t ${ex} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${html}</div>`;
const H = (cls, x, y, w, s, ex = "") => `<h1 class="${cls}" data-t data-tieu-de ${ex} style="left:${x}px;top:${y}px;width:${w}px">${em(s)}</h1>`;
const K = (x, y, w, h, cls, alt, ex = "") => `<div class="${cls}" data-l="k${++nL}" data-alt="${esc(alt)}" ${ex} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"></div>`;
const nguon = (s, sang = false) => `<div class="nguon${sang ? " sang" : ""}" data-t style="left:120px;top:1004px;width:1560px">${esc(s)}</div>`;
const cham = (x, y, c, r, m) => { let s = ""; for (let i = 0; i < c; i++) for (let j = 0; j < r; j++) s += `<circle cx="${x + i * 26}" cy="${y + j * 26}" r="5" fill="${m}"/>`; return s; };
const icon = (ten, cx, cy, co, mau, net = 3) => { const t = fs.readFileSync(path.join(D, "asset", "tabler", ten + ".svg"), "utf8").replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/<path stroke="none" d="M0 0h24v24H0z" fill="none"\s*\/>/, "");
  return `<g transform="translate(${cx - co / 2} ${cy - co / 2}) scale(${co / 24})" fill="none" stroke="${mau}" stroke-width="${((net * 24) / co).toFixed(3)}" stroke-linecap="round" stroke-linejoin="round">${t}</g>`; };
const EXV = { 26: " data-nguon" };
const DAM = new Set([3, 17, 25, 27]);
const VAI = { 1: "bia", 2: "lo-trinh", 15: "ket-phan", 24: "ket-phan", 25: "ket-chung", 27: "cam-on" };
const sec = (k, mau, nenLoai, inner, ex = "") => S.push({ k, html: `<section class="s ${nenLoai}${DAM.has(k) ? " dam" : ""}" data-mau="${mau}"${VAI[k] ? ` data-vai="${VAI[k]}"` : ""}${EXV[k] || ""} data-nen="${DAM.has(k) ? "N2" : { sang: "N1", toi: "N1", chia: "N3", anh: "N4", xanh: "N3" }[nenLoai]}" ${ex} data-trans="push" data-dur="600" data-notes="${esc(NOTES[k] || "")}">\n${inner}\n</section>` });

// ---------- BỐ CỤC MẪU ----------
// nội dung (nền trắng): nhãn cam · tiêu đề Anton NGẮN · câu dẫn · vạch cam · vùng nội dung 330–980 · nguồn 1004
const dau = (k, kk, td, dan, toi = false) => nen(KHOI_GOC(toi, k))
  + T(`kk${toi ? " sang" : ""}`, 120, 60, 1200, kk, A("fade", 0, 400)) + T(`so${toi ? " sang" : ""}`, 1360, 64, 300, `${k} / ${TONG}`)
  + H(`td${toi ? " sang" : ""}`, 120, 116, 1540, td, A("rise", 100, 600)) + T(`dan${toi ? " sang" : ""}`, 120, 236, 1640, dan, A("fade", 300, 500))
  + K(120, 302, 96, 8, "vach-cam", "Vạch cam dưới tiêu đề", A("wipe", 400, 400));
// chia (panel navy trái 660 px): số lớn + tiêu đề trong panel; nội dung bên phải 780–1800
const panTrai = (k, kk, so, soM, td) => K(0, 0, 660, 1080, "pan-navy pan-full", "Panel màu chủ bên trái", A("fade", 0, 400))
  + T("kk sang", 120, 60, 500, kk, A("fade", 0, 400)) + H("td sang", 120, 116, 480, td, A("rise", 100, 600)) + T("so", 1360, 64, 300, `${k} / ${TONG}`)
  + K(120, 560, 96, 8, "vach-cam", "Vạch cam", A("wipe", 400, 400)) + T(`so-lon-p${so.startsWith("−") ? " am" : ""}`, 120, 600, 520, so, A("pop", 500, 600)) + T("so-lon-m", 120, 760, 500, soM, A("fade", 700, 400));

// ===== BỐ CỤC THOÁNG + BẮT MẮT (Hào 20/11/2026: "quá rối" → "chưa đủ bắt mắt") =====
// mỗi slide: nhãn nhỏ + tiêu đề có từ nhấn màu + MỘT hình lớn đặt trên "sân khấu" (khối nền mềm chuyển màu) + ≤ 3 nhãn ngắn;
// hình tô chuyển màu (gradient), có quầng sáng; minh hoạ unDraw tô lại theo bảng màu.
const goc1 = (v) => [`<circle cx="1890" cy="30" r="150" fill="${P.troi}" opacity="0.9"/><circle cx="1960" cy="150" r="110" fill="${P.navy}" opacity="0.85"/>`,
  `<circle cx="1940" cy="1060" r="170" fill="${P.troi}" opacity="0.9"/><circle cx="1830" cy="1110" r="90" fill="${P.navy}" opacity="0.85"/>`][v % 2];
const GRAD = `<defs><linearGradient id="gCam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${DOC[3]}"/><stop offset="1" stop-color="${P.cam0}"/></linearGradient>`
  + `<linearGradient id="gNavy" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.navy2}"/><stop offset="1" stop-color="${P.navy}"/></linearGradient>`
  + `<linearGradient id="gTroi" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.troi}"/><stop offset="1" stop-color="${P.navy3}"/></linearGradient>`
  + `<linearGradient id="gCot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.navy3}"/><stop offset="1" stop-color="${DOC[1]}"/></linearGradient>`
  + `<linearGradient id="gSan" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.cam4}"/><stop offset="1" stop-color="${P.nen}" stop-opacity="0.4"/></linearGradient>`
  + `<radialGradient id="gQuang"><stop offset="0.55" stop-color="${P.troi}" stop-opacity="0.55"/><stop offset="1" stop-color="${P.troi}" stop-opacity="0"/></radialGradient></defs>`;
const dauGon = (k, kk, td, xanh = false) => nen(GRAD + (xanh ? `<rect x="0" y="0" width="1920" height="1080" fill="${P.cam4}"/><circle cx="300" cy="1000" r="420" fill="${P.ke}" opacity="0.6"/>` : "") + goc1(k)) + T("kk", 120, 72, 1200, kk, A("fade", 0, 400)) + H("td-gon", 120, 116, 1500, td, A("rise", 100, 600));
const san = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(h / 2, 200)}" fill="url(#gSan)"/>`;
const MAU_UD = { "#6c63ff": P.cam, "#090814": P.navy, "#2f2e41": P.navy, "#2f2e43": P.navy, "#3f3d56": P.navy, "#e6e6e6": P.ke, "#f2f2f2": P.nen, "#f0f0f0": P.nen,
  "#d6d6e3": P.navy3, "#b6b3c5": P.navy3, "#ffb6b6": "#F2B8A0", "#ed9da0": "#F2B8A0", "#fafafa": P.trang };
const unDraw = (ten, x, y, w) => { let s = fs.readFileSync(path.join(D, "asset", "undraw", ten + ".svg"), "utf8");
  const vb = s.match(/viewBox="([^"]+)"/)[1].split(/[\s,]+/).map(Number), h = (w * vb[3]) / vb[2];
  s = s.replace(/#[0-9a-fA-F]{6}\b/g, (c) => MAU_UD[c.toLowerCase()] || c).replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  return { svg: `<svg x="${x}" y="${y}" width="${w}" height="${h.toFixed(1)}" viewBox="${vb.join(" ")}">${s}</svg>`, h }; };
const donut = (cx, cy, r, w, p, mau) => { const C = 2 * Math.PI * r; return `<circle cx="${cx}" cy="${cy}" r="${r + w}" fill="url(#gQuang)"/><circle cx="${cx}" cy="${cy}" r="${r - w / 2 - 6}" fill="${P.trang}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${P.cam4}" stroke-width="${w}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${mau}" stroke-width="${w}" stroke-linecap="${p < 1 ? "round" : "butt"}" stroke-dasharray="${(p * C).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>`; };

// ===================== TẤT CẢ SLIDE · BỐ CỤC THOÁNG (Hào 20/11/2026) =====================
// khuôn: nhãn nhỏ + tiêu đề một dòng (từ khoá tô xanh) + MỘT hình lớn trên khối nền mềm + ≤ 3 nhãn ngắn; giải thích dài để ở ghi chú người nói.
const huy = (cx, cy, r, fill, ic, icM = P.trang, quang = true) => (quang ? `<circle cx="${cx}" cy="${cy}" r="${(r * 1.32).toFixed(0)}" fill="url(#gQuang)"/>` : "") + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>` + (ic ? icon(ic, cx, cy, r * 0.95, icM, 3) : "");
const udDay = (ten, x, day, w) => { const h = unDraw(ten, x, 0, w).h; return unDraw(ten, x, day - h, w).svg; };
const muiG = (x1, y1, x2, y2, m = P.navy3) => { const a = Math.atan2(y2 - y1, x2 - x1), L = 30, b = 0.45; return `<path d="M${x1} ${y1} L${x2 - Math.cos(a) * 20} ${y2 - Math.sin(a) * 20}" stroke="${m}" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M${x2} ${y2} L${x2 - L * Math.cos(a - b)} ${y2 - L * Math.sin(a - b)} L${x2 - L * Math.cos(a + b)} ${y2 - L * Math.sin(a + b)} Z" fill="${m}"/>`; };
const SAN = (x = 100, y = 280, w = 1720, h = 700) => GRAD + san(x, y, w, h);
const SANT = (x = 100, y = 280, w = 1720, h = 700) => GRAD + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="200" fill="${P.trang}"/>`;
const giua = (s) => `<span style="width:100%;text-align:center">${em(s)}</span>`;

// ===== 1 · BÌA =====
sec(1, "bia", "sang", nen(GRAD + `<rect x="1060" y="-120" width="1000" height="1320" rx="420" fill="url(#gSan)"/><rect x="1640" y="-120" width="420" height="320" rx="130" fill="${P.troi}" opacity="0.9"/><rect x="1780" y="-60" width="260" height="360" rx="110" fill="${P.navy}" opacity="0.85"/>` + cham(120, 960, 10, 2, P.ke) + `<rect x="0" y="0" width="560" height="40" fill="${P.cam}"/>`)
  + lop(GRAD + `<circle cx="1500" cy="540" r="420" fill="url(#gQuang)"/>`, 1080, 120, 840, 840, "Quầng sáng sau ảnh", A("fade", 200, 800))
  + anh("ky-hd-tron.png", 1180, 220, 640, 640, "Ảnh đen trắng trong khung tròn: bàn tay ký hợp đồng bảo hiểm", A("pop", 300, 800))
  + lop(`<circle cx="1500" cy="540" r="352" fill="none" stroke="${P.cam}" stroke-width="8"/>`, 1140, 180, 720, 720, "Vòng xanh quanh ảnh", A("fade", 800, 500))
  + T("kk", 120, 140, 700, "Nhóm 2 · Thuyết trình", A("fade", 200, 400))
  + H("bia", 119, 200, 720, "Hợp đồng bảo hiểm thương mại", A("rise", 300, 700))
  + T("bia-m", 120, 720, 900, "và thực trạng thị trường bảo hiểm Việt Nam, 2018 – 9 tháng 2026", A("fade", 1000, 500))
  + T("bia-by", 120, 860, 900, "Hợp đồng mẫu: Bảo Việt An Gia (bảo hiểm sức khỏe) · 13 điều", A("fade", 1200, 500)));

// ===== 2 · LỘ TRÌNH =====
sec(2, "noi-dung", "sang", dauGon(2, "Lộ trình", "Từ [một hợp đồng] đến [cả thị trường]")
  + lop(SAN() + udDay("contract-signed", 430, 700, 290) + udDay("growth-chart", 1150, 700, 560) + muiG(880, 520, 1060, 520, P.navy2), 100, 280, 1720, 700, "Minh hoạ: tờ hợp đồng đã ký (phần 01) và màn hình biểu đồ tăng trưởng (phần 02)", A("fade", 200, 700), "undraw")
  + T("kk-giua", 275, 740, 600, "Phần 01", A("fade", 600, 300)) + T("nhan-giua", 275, 790, 600, "Một hợp đồng thật", A("fade", 700, 300)) + T("phu-giua", 275, 846, 600, "Bảo Việt An Gia · 13 điều", A("fade", 800, 300))
  + T("kk-giua", 1130, 740, 600, "Phần 02", A("fade", 1100, 300)) + T("nhan-giua", 1130, 790, 600, "Cả thị trường", A("fade", 1200, 300)) + T("phu-giua", 1130, 846, 600, "2018 – 9 tháng 2026", A("fade", 1300, 300)), "data-hero");

// ===== 3 · MỞ PHẦN I =====
const HD_VE = `<rect x="1290" y="330" width="420" height="500" fill="${P.trang}"/>`;
const moPhan = (k, so, ten, mo, alt, ve = HD_VE, anhT = "") => sec(k, "mo-phan", "toi", nen(GRAD + KHOI_GOC(true) + `<circle cx="1500" cy="560" r="420" fill="url(#gQuang)" opacity="0.5"/><circle cx="1500" cy="560" r="330" fill="url(#gNavy)"/>`)
  + T("mp-so", 114, 170, 600, so, A("pop", 200, 700)) + H("mp-t", 119, 520, 900, ten, A("rise", 500, 600)) + T("mp-m", 120, 780, 860, mo, A("fade", 800, 500))
  + (anhT ? anh(anhT, 1220, 280, 560, 560, alt, A("pop", 400, 800)) + lop(`<circle cx="1500" cy="560" r="306" fill="none" stroke="${P.troi}" stroke-width="8"/>`, 1186, 246, 628, 628, "Vòng sáng quanh ảnh", A("fade", 900, 500)) : lop(ve, 1170, 230, 660, 660, alt, A("pop", 400, 800))));
moPhan(3, "01", "Hợp đồng Bảo Việt An Gia", "Điều khoản nói gì, có lợi cho ai, khớp luật đến đâu.", "Ảnh đen trắng: giường bệnh viện — bảo hiểm sức khỏe trả khi nằm viện", HD_VE, "benh-vien-tron.png");

// ===== 4 · ĐIỀU 17: 9/9 =====
{ const R = [["a", "Các bên"], ["b", "Đối tượng"], ["c", "Số tiền tối đa"], ["d", "Quyền lợi"], ["đ", "Quyền, nghĩa vụ *"], ["e", "Thời hạn"], ["g", "Phí"], ["h", "Bồi thường"], ["i", "Tranh chấp"]];
  const ox = (k) => 800 + (k % 3) * 340, oy = (k) => 360 + Math.floor(k / 3) * 160;
  sec(4, "bang", "sang", dauGon(4, "✚ Đối chiếu khoản 1 Điều 17 Luật Kinh doanh bảo hiểm", "Hợp đồng có đủ [9/9] nội dung bắt buộc")
    + lop(SAN() + `<circle cx="430" cy="600" r="290" fill="url(#gQuang)"/><circle cx="430" cy="600" r="220" fill="url(#gCam)"/>`, 100, 280, 1720, 700, "Vòng tròn lớn 9/9", A("pop", 200, 600))
    + G("so-tr-lon", 230, 520, 400, 160, giua("9/9"), A("pop", 500, 500)) + T("phu-giua", 180, 850, 500, "nội dung luật bắt buộc", A("fade", 700, 300))
    + lop(GRAD + R.map(([d], k) => `<circle cx="${ox(k) + 36}" cy="${oy(k) + 36}" r="36" fill="${d === "đ" ? "url(#gCam)" : "url(#gNavy)"}"/>`).join(""), 790, 350, 1000, 420, "Chín vòng tròn đánh dấu điểm a đến i", A("fade", 800, 600))
    + R.map(([d, l], k) => G("chu-o", ox(k), oy(k), 72, 72, giua(d), A("pop", 900 + k * 80, 300)) + G("gt-nho", ox(k) + 84, oy(k), 250, 72, esc(l), A("fade", 950 + k * 80, 300))).join("")
    + T("phu-trai", 800, 860, 980, "* Hợp đồng chỉ ghi “theo pháp luật”: phải đọc thêm Quy tắc.", A("fade", 1800, 400))
    + nguon("Khoản 1 Điều 17 Luật KDBH 08/2022/QH15 (Luật đã sửa đổi năm 2025; Điều 17 giữ nguyên). ✚ Nhóm bổ sung."), "data-hero");
}

// ===== 5 · BỘ HỢP ĐỒNG: THỨ TỰ ƯU TIÊN =====
{ const B = [["1", "Sửa đổi bổ sung mới nhất", 420, "url(#gCam)", "trang"], ["2", "Hợp đồng + phụ lục", 300, "url(#gNavy)", "trang"], ["3", "Quy tắc bảo hiểm", 190, "url(#gTroi)", ""]], yb = 900;
  sec(5, "noi-dung", "sang", dauGon(5, "Điều 12 · Bộ hợp đồng", "Mâu thuẫn? Văn bản [ký sau] được ưu tiên")
    + lop(SAN() + udDay("contract-signed", 230, 900, 330) + B.map(([, , h, m], k) => `<rect x="${760 + k * 340}" y="${yb - h}" width="300" height="${h}" rx="28" fill="${m}"/>`).join("") + `<path d="M720 ${yb} H1800" stroke="${P.navy3}" stroke-width="3"/>`,
      100, 280, 1720, 700, "Minh hoạ tờ hợp đồng; ba bậc ưu tiên: 1 sửa đổi bổ sung mới nhất (cao nhất), 2 hợp đồng và phụ lục, 3 quy tắc bảo hiểm", A("fade", 200, 700), "undraw")
    + B.map(([so, ten, h, , cls], k) => G(`so-giua${cls ? " trang" : ""}`, 760 + k * 340, yb - h + 20, 300, 100, giua(so), A("pop", 800 + k * 300, 400)) + T("nhan-giua", 760 + k * 340 - 10, yb - h - 104, 320, ten, A("fade", 900 + k * 300, 300))).join("")
    + nguon("Điều 12 hợp đồng An Gia (theo Quy tắc ban hành kèm Quyết định 6029/QĐ-BHBV ngày 27/6/2025)."), "data-hero");
}

// ===== 7 · NĂM GÓI =====
{ const Gi = [["Đồng", 94], ["Bạc", 138], ["Vàng", 230], ["Bạch kim", 342], ["Kim cương", 454]], x0 = 440, W = 1140;
  sec(7, "noi-dung", "sang", dauGon(7, "Phụ lục 1 · Quyền lợi nằm viện", "Gói càng đắt, [trả càng nhiều]")
    + lop(SAN() + Gi.map(([, v], k) => { const y = 380 + k * 116, w = Math.round((v / 454) * W); return `<rect x="${x0}" y="${y}" width="${W}" height="76" rx="38" fill="${P.trang}"/><rect x="${x0}" y="${y}" width="${w}" height="76" rx="38" fill="${k === 4 ? "url(#gCam)" : DOC[k + 1]}"/>`; }).join(""),
      100, 280, 1720, 700, "Năm thanh ngang: Đồng 94, Bạc 138, Vàng 230, Bạch kim 342, Kim cương 454 triệu", A("wipe", 400, 1200))
    + T("phu-trai", 160, 300, 1200, "Số tiền tối đa Bảo Việt trả · triệu đồng/người/năm", A("fade", 200, 300))
    + Gi.map(([ten, v], k) => { const y = 380 + k * 116, w = Math.round((v / 454) * W);
      return G("nhan-trai", 160, y, 260, 76, esc(ten), A("fade", 300 + k * 100, 300)) + G(`gt${k === 4 ? " cam" : ""}`, x0 + w + 20, y, 170, 76, `<span style="width:100%;text-align:left">${v}</span>`, A("fade", 1200 + k * 100, 300)); }).join("")
    + nguon("Phụ lục 1 hợp đồng An Gia. Nằm viện tối đa 60 ngày/năm."), "data-hero");
}

// ===== 8 · CHÍNH vs BỔ SUNG =====
{ const BS = [["stethoscope", "Ngoại trú", 1090, 480], ["alert-triangle", "Tai nạn", 1350, 480], ["heart", "Sinh mạng", 1610, 480], ["dental", "Nha khoa", 1220, 740], ["baby-carriage", "Thai sản", 1480, 740]];
  sec(8, "so-sanh", "sang", dauGon(8, "Điều 2 · Phụ lục 1", "Gói chính chỉ trả khi [phải nằm viện]")
    + lop(SAN() + huy(540, 580, 200, "url(#gNavy)", "bed") + BS.map(([i, , cx, cy], k) => huy(cx, cy, 70, k === 4 ? "url(#gCam)" : "url(#gTroi)", i, k === 4 ? P.trang : P.navy, false)).join("")
      + `<path d="M870 560 h80 M910 520 v80" stroke="${P.navy2}" stroke-width="14" stroke-linecap="round"/>`, 100, 280, 1720, 700, "Vòng lớn: gói chính (giường bệnh); dấu cộng; năm vòng nhỏ: ngoại trú, tai nạn, sinh mạng, nha khoa, thai sản", A("fade", 200, 700))
    + T("nhan-giua", 290, 810, 500, "Gói chính · nằm viện", A("fade", 500, 300)) + T("phu-giua", 240, 864, 600, "nằm viện, phẫu thuật, xe cứu thương", A("fade", 600, 300))
    + T("kk-giua", 1060, 320, 680, "Mua thêm mới được trả", A("fade", 900, 300))
    + BS.map(([, t, cx, cy], k) => T(`gt-giua${k === 4 ? " cam" : ""}`, cx - 130, cy + 84, 260, t, A("fade", 1000 + k * 120, 300))).join("")
    + nguon("Điều 2, Phụ lục 1 hợp đồng An Gia. Thai sản chỉ có từ gói Bạc."), "data-hero");
}

// ===== 9 · THỜI GIAN CHỜ =====
{ const CHO = [["Tai nạn", 0], ["Bệnh thông thường", 30], ["Biến chứng thai sản", 90], ["Bệnh có sẵn", 365], ["Sinh con", 635]], x0 = 600, W = 1000;
  sec(9, "so-lon", "xanh", dauGon(9, "Điều 5 · Thời gian chờ", "Ký xong, [chưa được trả ngay]", true)
    + lop(SANT() + CHO.map(([, d], k) => { const y = 340 + k * 116, w = Math.max((d / 635) * W, 0); return `<rect x="${x0}" y="${y + 12}" width="${W}" height="52" rx="26" fill="${P.trang}"/>` + (d ? `<rect x="${x0}" y="${y + 12}" width="${w}" height="52" rx="26" fill="${k === 4 ? "url(#gCam)" : "url(#gNavy)"}"/>` : ""); }).join(""),
      100, 280, 1720, 700, "Thanh thời gian chờ: tai nạn 0, bệnh thông thường 30, biến chứng thai sản 90, bệnh có sẵn 365, sinh con 635 ngày", A("wipe", 400, 1400))
    + CHO.map(([t, d], k) => { const y = 340 + k * 116;
      return G(`nhan-trai${k === 4 ? " cam" : ""}`, 160, y, 420, 76, esc(t), A("fade", 300 + k * 100, 300)) + G(`gt${k === 4 ? " cam" : ""}`, 1620, y, 190, 76, d ? `${d} ngày` : "không chờ", A("fade", 1200 + k * 150, 300)); }).join("")
    + T("phu-trai", 160, 912, 1500, "Bệnh có sẵn = bệnh có trước khi mua. Tái tục (gia hạn) liên tục: không chờ lại.", A("fade", 2200, 400))
    + nguon("Điều 5 hợp đồng; Quy tắc An Gia (QĐ 6029/QĐ-BHBV), quyền lợi Thai sản."), "data-hero");
}

// ===== 10 · ĐỒNG CHI TRẢ 70/30 =====
{ const cx = 1040, cy = 600, r = 200, w = 70, C = 2 * Math.PI * r;
  sec(10, "so-lon", "sang", dauGon(10, "Phụ lục 1 · Đồng chi trả", "Trẻ dưới 3 tuổi: gia đình [tự trả 30 %]")
    + lop(SAN() + udDay("family", 170, 930, 430) + `<circle cx="${cx}" cy="${cy}" r="${r + w}" fill="url(#gQuang)"/><circle cx="${cx}" cy="${cy}" r="${r - w / 2 - 6}" fill="${P.trang}"/>`
      + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#gNavy)" stroke-width="${w}" stroke-dasharray="${(0.7 * C - 6).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>`
      + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="url(#gCam)" stroke-width="${w}" stroke-dasharray="${(0.3 * C - 6).toFixed(1)} ${C.toFixed(1)}" transform="rotate(${-90 + 252} ${cx} ${cy})"/>`
      + `<circle cx="1420" cy="478" r="18" fill="${P.navy}"/><circle cx="1420" cy="598" r="18" fill="${P.cam}"/>`, 100, 280, 1720, 700, "Minh hoạ gia đình; vòng tròn hóa đơn 10 triệu chia 70 % Bảo Việt trả, 30 % gia đình trả", A("fade", 200, 800), "undraw")
    + G("so-giua", cx - 170, cy - 70, 340, 90, giua("10 triệu"), A("pop", 800, 400)) + T("phu-giua", cx - 150, cy + 26, 300, "hóa đơn ví dụ", A("fade", 900, 300))
    + G("gt", 1456, 448, 360, 60, "Bảo Việt 7 triệu", A("fade", 1100, 300)) + G("gt cam", 1456, 568, 360, 60, "Gia đình 3 triệu", A("fade", 1300, 300))
    + T("phu-trai", 1400, 690, 400, "Chỉ áp ở cơ sở tư, khoa dịch vụ; trẻ 15 ngày – 3 tuổi.", A("fade", 1500, 400))
    + nguon("Phụ lục 1 mục 2 hợp đồng An Gia. Hóa đơn 10 triệu là ví dụ minh hoạ của nhóm."), "data-hero");
}

// ===== 11 · CHẬM PHÍ =====
{ const B = [["calendar-x", "Đến hạn đóng phí", "url(#gTroi)", P.navy], ["coins", "Chưa đóng đủ", "url(#gNavy)", P.trang], ["ban", "Hợp đồng tự hủy bỏ", "url(#gCam)", P.trang]];
  sec(11, "noi-dung", "sang", dauGon(11, "Điều 4 · Phí bảo hiểm", "Chậm phí là [mất hợp đồng]")
    + lop(SAN() + B.map(([i, , f, m], k) => huy(420 + k * 540, 570, 140, f, i, m)).join("") + muiG(600, 570, 780, 570) + muiG(1140, 570, 1320, 570), 100, 280, 1720, 700, "Ba bước: đến hạn đóng phí, chưa đóng đủ, hợp đồng tự hủy bỏ", A("fade", 200, 700))
    + B.map(([, t], k) => T(`nhan-giua${k === 2 ? " cam" : ""}`, 420 + k * 540 - 230, 770, 460, t, A("fade", 600 + k * 400, 300))).join("")
    + T("phu-giua", 260, 880, 1400, "“… sẽ tự động hủy bỏ … trừ khi có thỏa thuận khác.”", A("fade", 2000, 400))
    + nguon("Điều 4 hợp đồng An Gia (trích nguyên văn, lược)."), "data-hero");
}

// ===== 12 · HỦY BỎ ≠ ĐƠN PHƯƠNG CHẤM DỨT =====
{ const C2 = [["Hợp đồng (Điều 4)", "file-certificate", "url(#gCam)", "Hủy bỏ", "coi như chưa từng ký; hai bên hoàn trả", "khoản 1 Điều 427 Bộ luật Dân sự 2015"], ["Luật (Điều 26)", "scale", "url(#gNavy)", "Đơn phương chấm dứt", "chỉ dừng từ khi bên kia nhận thông báo", "khoản 3 Điều 428 Bộ luật Dân sự 2015"]];
  sec(12, "so-sanh", "sang", dauGon(12, "✚ Đối chiếu luật", "“Hủy bỏ” hay [“đơn phương chấm dứt”]?")
    + lop(SAN() + C2.map(([, i, f], k) => huy(560 + k * 800, 540, 140, f, i)).join(""), 100, 280, 1720, 700, "Hai vòng tròn: hợp đồng dùng chữ hủy bỏ, luật dùng chữ đơn phương chấm dứt", A("fade", 200, 700))
    + G("so-giua", 860, 480, 200, 120, giua("≠"), A("pop", 1200, 400))
    + C2.map(([tag, , , t, m, cc], k) => { const x = 560 + k * 800 - 340, t0 = 500 + k * 600;
      return T("kk-giua", x, 312, 680, tag, A("fade", t0, 300)) + T("nhan-giua", x, 714, 680, t, A("fade", t0 + 100, 300)) + T("phu-giua", x, 774, 680, m, A("fade", t0 + 200, 300)) + T("cc-giua", x, 880, 680, cc, A("fade", t0 + 300, 300)); }).join("")
    + nguon("Điều 4 hợp đồng An Gia; Điều 26 Luật Kinh doanh bảo hiểm 2022; Điều 427, 428 Bộ luật Dân sự 2015. ✚ Nhóm bổ sung."), "data-hero");
}

// ===== 14 · BỒI THƯỜNG QUA APP =====
{ const B = [["device-mobile", "Giấy yêu cầu + mã OTP"], ["file-invoice", "Hóa đơn điện tử"], ["camera", "Ảnh chứng từ y tế"]];
  sec(14, "noi-dung", "sang", dauGon(14, "Điều 10 · Bồi thường", "Đến 10 triệu: [nộp hồ sơ qua app]")
    + lop(SAN() + `<rect x="230" y="300" width="440" height="660" rx="60" fill="url(#gNavy)"/><rect x="256" y="350" width="388" height="580" rx="26" fill="${P.trang}"/><rect x="400" y="318" width="100" height="12" rx="6" fill="${P.navy3}"/>`
      + B.map(([i], k) => huy(330, 500 + k * 150, 48, k === 2 ? "url(#gCam)" : "url(#gTroi)", i, k === 2 ? P.trang : P.navy, false)).join("")
      + muiG(760, 620, 900, 620, P.navy2) + huy(1250, 600, 230, "url(#gCam)", ""), 100, 280, 1720, 700, "Điện thoại mở app với ba bước hồ sơ; mũi tên sang vòng tròn 15 ngày làm việc", A("fade", 200, 800))
    + T("app-t", 270, 388, 360, "BaoViet Direct", A("fade", 400, 300))
    + B.map(([, t], k) => G("gt-nho", 392, 500 + k * 150 - 40, 240, 80, esc(t), A("fade", 600 + k * 250, 300))).join("")
    + G("so-tr-lon", 1050, 470, 400, 180, giua("15"), A("pop", 1500, 500)) + T("chu-vong", 1050, 660, 400, "ngày làm việc để trả tiền", A("fade", 1600, 300))
    + T("phu-giua", 1000, 880, 500, "Luật: 15 ngày, nếu không thỏa thuận khác ✚", A("fade", 1900, 400))
    + nguon("Điều 10, Phụ lục 1 mục 3 hợp đồng An Gia; khoản 1 Điều 31 Luật KDBH 08/2022/QH15."), "data-hero");
}

// ===== 15 · KẾT LUẬN PHẦN I =====
{ const C = [["Có lợi", "check", "url(#gNavy)", ["Thứ tự ưu tiên văn bản rõ", "Năm mức giá để chọn", "Hồ sơ đến 10 triệu nộp qua app"]], ["Dễ mất quyền lợi", "alert-triangle", "url(#gCam)", ["Chờ lâu: sinh con 635 ngày", "Trẻ nhỏ ở cơ sở tư: tự trả 30 %", "Chậm phí là tự hủy", "Điều không trả nằm ở Quy tắc"]]];
  sec(15, "so-sanh", "xanh", dauGon(15, "Kết luận phần I", "Minh bạch, nhưng có [4 bất lợi]", true)
    + lop(SANT() + `<path d="M960 340 V920" stroke="${P.navy3}" stroke-width="3" stroke-dasharray="4 14" stroke-linecap="round"/>` + C.map(([, i, f, ds], k) => huy(230 + k * 860, 380, 52, f, i, P.trang, false) + ds.map((_, j) => `<circle cx="${236 + k * 860}" cy="${506 + j * 110}" r="10" fill="${k ? P.cam : P.navy}"/>`).join("")).join(""),
      100, 280, 1720, 700, "Hai cột: có lợi (dấu tích), dễ mất quyền lợi (dấu cảnh báo)", A("fade", 200, 600))
    + C.map(([t, , , ds], k) => G(`nhan-trai${k ? " cam" : ""}`, 310 + k * 860, 340, 560, 80, esc(t), A("fade", 400 + k * 600, 300))
      + ds.map((s, j) => G("gt-ds", 270 + k * 860, 476 + j * 110, 640, 60, esc(s), A("fade", 600 + k * 600 + j * 150, 300))).join("")).join("")
    + nguon("Mục 3.1 bài nhóm; Điều 7 hợp đồng dẫn chiếu Chương III Quy tắc Bảo Việt An Gia."), "data-hero");
}

// ===== 16 · KHUYẾN NGHỊ =====
{ const KN = [["pencil-check", "Khai thật tiền sử bệnh", "khai sai có thể mất toàn bộ quyền lợi"], ["book", "Đòi và đọc Quy tắc", "điều không trả nằm ở Chương III"], ["hourglass", "Mua sớm, trước khi cần", "bệnh có sẵn chờ 365 ngày"]];
  sec(16, "noi-dung", "sang", dauGon(16, "Kết luận phần I · Khuyến nghị", "Trước khi ký, người mua làm [ba việc]")
    + lop(SAN() + udDay("financial-advisor", 260, 960, 300) + KN.map(([i], k) => huy(820, 400 + k * 200, 66, k ? "url(#gNavy)" : "url(#gCam)", i, P.trang, false)).join(""), 100, 280, 1720, 700, "Minh hoạ người tư vấn trên điện thoại; ba biểu tượng: khai thật, đọc quy tắc, mua sớm", A("fade", 200, 700), "undraw")
    + KN.map(([, t, m], k) => T("nhan-trai", 930, 400 + k * 200 - 52, 860, t, A("fade", 550 + k * 300, 300)) + T("phu-trai", 930, 400 + k * 200 + 4, 860, m, A("fade", 650 + k * 300, 300))).join("")
    + nguon("Mục 3.2 bài nhóm; Điều 5, 6, 7 hợp đồng; khoản 1 Điều 22 Luật KDBH ✚."), "data-hero");
}

// ===== 17 · MỞ PHẦN II =====
moPhan(17, "02", "Thực trạng thị trường bảo hiểm", "Năm 2023, tư vấn sai khi bán qua ngân hàng khiến thị trường sụt giảm.", "Minh hoạ: cột doanh thu tăng dần, đỉnh 2022 rồi giảm",
  GRAD + [134, 160, 185, 216, 251, 227, 228, 237].map((v, k) => { const h = v * 1.5, x = 1260 + k * 62; return `<rect x="${x}" y="${780 - h}" width="46" height="${h}" rx="12" fill="${k === 4 ? P.troi : DOC[Math.min(k + 1, 6)]}"/>`; }).join("") + `<rect x="1240" y="780" width="520" height="6" rx="3" fill="${P.troi}"/>`);

// ===== 19 · BANCASSURANCE =====
{ const B = [["2018", 0.2, "20 %"], ["2021", 0.4, "40 %"], ["2022", 0.45, "45 %"]];
  sec(19, "so-lon", "sang", dauGon(19, "Bancassurance · ngân hàng bán bảo hiểm", "Ngân hàng bán [gần nửa] nhân thọ mới")
    + lop(SAN() + B.map(([, p], k) => donut(460 + k * 500, 570, 150, 46, p, k === 2 ? "url(#gCam)" : "url(#gNavy)")).join("") + muiG(680, 570, 740, 570) + muiG(1180, 570, 1240, 570),
      100, 280, 1720, 700, "Ba vòng tròn: 2018 20 %, 2021 40 %, 2022 45 %", A("fade", 200, 800))
    + B.map(([n, , s], k) => G(`so-giua${k === 2 ? " cam" : ""}`, 460 + k * 500 - 120, 520, 240, 100, giua(s), A("pop", 600 + k * 300, 400)) + T("nhan-giua", 460 + k * 500 - 150, 780, 300, n, A("fade", 600 + k * 300, 300))).join("")
    + T("phu-giua", 260, 870, 1400, "Tỷ lệ tiền phí nhân thọ ký mới đến từ ngân hàng. 2022: Bộ Tài chính thanh tra 4 doanh nghiệp.", A("fade", 1700, 400))
    + nguon("TLTK 9, 12, 13 của bài nhóm (Công ty chứng khoán PSI tổng hợp, ước tính)."), "data-hero");
}

// ===== 20 · 2023 GIẢM GẦN NỬA =====
{ const N = [["−44,5 %", "tiền phí ký mới", "url(#gCam)"], ["−43,8 %", "số hợp đồng ký mới", "url(#gNavy)"]];
  sec(20, "so-lon", "sang", dauGon(20, "Năm 2023 · so với 2022", "Hợp đồng nhân thọ mới [giảm gần nửa]")
    + lop(SAN() + N.map(([, , f], k) => huy(620 + k * 680, 550, 190, f, "")).join(""), 100, 280, 1720, 700, "Hai vòng tròn: tiền phí ký mới giảm 44,5 %, số hợp đồng ký mới giảm 43,8 %", A("fade", 200, 700))
    + N.map(([s, m], k) => G("so-tr-vua", 620 + k * 680 - 180, 490, 360, 120, giua(s), A("pop", 500 + k * 400, 400)) + T("nhan-giua", 620 + k * 680 - 250, 784, 500, m, A("fade", 600 + k * 400, 300))).join("")
    + T("phu-giua", 260, 870, 1400, "Nguyên nhân: thanh tra (30/6/2023) kết luận ngân hàng tư vấn sai khi bán bảo hiểm.", A("fade", 1600, 400))
    + nguon("TLTK 1, 10, 14, 15 của bài nhóm. Cùng năm, tiền bảo hiểm trả cho khách tăng 31,14 %."), "data-hero");
}

// ===== 22 · BÃO YAGI =====
sec(22, "so-lon", "sang", dauGon(22, "2024 · Bão Yagi", "Bão Yagi: mới tạm ứng [7,5 %] thiệt hại")
  + lop(SAN() + donut(440, 600, 190, 60, 0.075, "url(#gCam)"), 100, 280, 1720, 700, "Vòng tròn: tạm ứng 7,5 % so với thiệt hại", A("fade", 200, 800))
  + G("so-giua cam", 290, 550, 300, 100, giua("7,5 %"), A("pop", 800, 400))
  + T("so-trai cam", 760, 400, 440, "956,5 tỷ", A("fade", 1000, 300)) + T("phu-trai", 760, 486, 440, "đã tạm ứng (đến 9/1/2025)", A("fade", 1100, 300))
  + T("so-trai", 760, 620, 440, "12.811 tỷ", A("fade", 1300, 300)) + T("phu-trai", 760, 706, 440, "thiệt hại ước tính", A("fade", 1400, 300))
  + anh("lu-xam.jpg", 1240, 320, 540, 540, "Ảnh minh hoạ: phố ngập lũ ở Hội An, người dân đi thuyền", A("fade", 300, 700))
  + T("phu-giua", 1240, 880, 540, "Ảnh minh hoạ: lũ Hội An, không phải Yagi", A("fade", 600, 300))
  + nguon("TLTK 16 (VCCI), 17 (VietnamFinance) — số liệu Cục QLGSBH; tỷ lệ 7,5 % do nhóm tự tính."), "data-hero");

// ===== 23 · NHÂN THỌ vs PHI NHÂN THỌ =====
{ const D2 = [["2023", -12.5, 2.87, "−12,5", "+2,87"], ["2024", -5, 10.2, "≈ −5", "+10,2"], ["2025", 0.5, 10.5, "+0,5", "+10–11"], ["9 th. 2026", -4, 15.1, "≈ −4", "+15,1"]];
  const y0 = 700, sc = 13, bw = 130, st = 420, x0 = 200;
  sec(23, "so-lon", "sang", dauGon(23, "2023 – 9 tháng 2026 · tăng, giảm so với năm trước (%)", "Phi nhân thọ tăng, [nhân thọ vẫn giảm]")
    + lop(SAN() + `<circle cx="790" cy="349" r="15" fill="${P.navy3}"/><circle cx="1320" cy="349" r="15" fill="${P.cam}"/><path d="M150 ${y0} H1800" stroke="${P.navy}" stroke-width="3"/>`
      + D2.map(([, a, b], k) => { const x = x0 + k * st, ha = Math.abs(a) * sc, hb = b * sc;
        return (a < 0 ? `<rect x="${x}" y="${y0}" width="${bw}" height="${ha}" rx="14" fill="url(#gTroi)"/>` : `<rect x="${x}" y="${y0 - Math.max(ha, 8)}" width="${bw}" height="${Math.max(ha, 8)}" rx="4" fill="url(#gTroi)"/>`) + `<rect x="${x + bw + 12}" y="${y0 - hb}" width="${bw}" height="${hb}" rx="14" fill="url(#gCam)"/>`; }).join(""),
      100, 280, 1720, 700, "Biểu đồ cột: nhân thọ (xanh nhạt) và phi nhân thọ (xanh đậm) 2023 – 9 tháng 2026", A("wipe", 400, 1400))
    + T("chu-giai", 820, 330, 460, "Nhân thọ", A("fade", 300, 300)) + T("chu-giai", 1350, 330, 480, "Phi nhân thọ", A("fade", 300, 300))
    + D2.map(([n, a, b, sa, sb], k) => { const x = x0 + k * st, t0 = 600 + k * 400, ha = Math.abs(a) * sc, hb = b * sc;
      return T("dv-so", x - 20, a < 0 ? y0 + ha + 8 : y0 - Math.max(ha, 8) - 52, bw + 40, sa, A("fade", t0 + 400, 300)) + T("dv-so cam", x + bw - 8, y0 - hb - 52, bw + 40, sb, A("fade", t0 + 400, 300))
        + T("dv-nam", x - 10, 920, 2 * bw + 32, n, A("fade", t0, 300)); }).join("")
    + nguon("TLTK 10, 11, 21, 22 của bài nhóm; 2025 phi nhân thọ “khoảng 10–11 %” (vẽ 10,5)."), "data-hero");
}

// ===== 24 · KẾT LUẬN PHẦN II =====
{ const GD = [["2018 – 2022", "Tăng nóng", "phí gần gấp đôi nhờ bán qua ngân hàng", 440, 340], ["2023 – 2024", "Khủng hoảng", "tư vấn sai, nhân thọ mới giảm gần nửa", 1000, 520], ["2025 – 9 tháng 2026", "Hồi chậm", "phi nhân thọ kéo, nhân thọ chưa hồi", 1560, 400]];
  const duong = "M160 620 C 330 600, 330 340, 440 340 S 880 520, 1000 520 S 1400 410, 1560 400 S 1700 380, 1760 372";
  sec(24, "noi-dung", "sang", dauGon(24, "Kết luận phần II", "Tăng nóng, [khủng hoảng], hồi chậm")
    + lop(SAN() + `<path d="${duong} L1720 660 L160 660 Z" fill="url(#gTroi)" opacity="0.45"/><path d="${duong}" fill="none" stroke="url(#gNavy)" stroke-width="10" stroke-linecap="round"/>`
      + GD.map(([, , , x, y], k) => `<circle cx="${x}" cy="${y}" r="20" fill="${P.trang}" stroke="${k === 1 ? P.cam : P.navy}" stroke-width="9"/>`).join(""), 100, 280, 1720, 700, "Đường xu hướng: tăng đến đỉnh 2022, giảm 2023 – 2024, rồi nhích lên", A("wipe", 300, 1400))
    + GD.map(([nam, t, m], k) => { const x = 160 + k * 560, t0 = 800 + k * 400; // cột canh giữa dưới các điểm 440 / 1000 / 1560
      return T("kk-giua", x, 710, 560, nam, A("fade", t0, 300)) + T(`nhan-giua${k === 1 ? " cam" : ""}`, x, 756, 560, t, A("fade", t0 + 100, 300)) + T("phu-giua", x + 30, 812, 500, m, A("fade", t0 + 200, 300)); }).join("")
    + nguon("Tổng hợp slide 18–23 (Bảng 1, Hình 1–2 và mục 2 của bài nhóm)."), "data-hero");
}

// ===== 25 · KẾT LUẬN CHUNG =====
{ const KL = [["file-certificate", "url(#gCam)", "Hợp đồng An Gia", "Đủ 9 nội dung bắt buộc, minh bạch; nhưng chờ lâu, đồng chi trả 30 %, chậm phí là tự hủy."], ["chart-bar", "url(#gTroi)", "Thị trường bảo hiểm", "Lớn nhờ ngân hàng, khủng hoảng 2023 vì tư vấn sai, nay hồi chậm nhờ phi nhân thọ."]];
  sec(25, "ket", "toi", nen(GRAD + KHOI_GOC(true)) + T("kk sang", 120, 72, 800, "Phần kết", A("fade", 0, 400))
    + H("td-gon trang", 120, 116, 1500, "Kết luận chung", A("rise", 200, 700))
    + lop(GRAD + KL.map(([i, f], k) => huy(560 + k * 800, 420, 110, f, i, k ? P.navy : P.trang)).join(""), 300, 260, 1520, 320, "Hai vòng tròn: hợp đồng, thị trường", A("pop", 400, 600))
    + KL.map(([, , t, m], k) => T("t-trang", 560 + k * 800 - 360, 590, 720, t, A("fade", 600 + k * 400, 300)) + T("m-trang", 560 + k * 800 - 360, 656, 720, m, A("fade", 700 + k * 400, 300))).join("")
    + T("bh-trang", 200, 900, 1520, "Bài học: hợp đồng chỉ bảo vệ người mua khi được [tư vấn đúng] và [tự đọc kỹ].", A("fade", 1800, 500)), "data-hero");
}

// ===== 26 · TÀI LIỆU THAM KHẢO =====
{ const L = ["Luật KDBH 08/2022/QH15 (sửa đổi năm 2025)", "Luật Các TCTD 32/2024/QH15", "Bộ luật Dân sự 91/2015/QH13", "Quy tắc An Gia, QĐ 6029/QĐ-BHBV"];
  const S2 = ["Bộ Tài chính, Cục QLGSBH — số liệu 2018–2025", "Tạp chí Kinh tế – Tài chính (2023, 27/10/2026)", "PSI — Báo cáo ngành bảo hiểm (01/2025)", "VnEconomy, Thanh tra, VCCI, IAV…"];
  sec(26, "noi-dung", "sang", dauGon(26, "Nguồn", "Tài liệu [tham khảo]")
    + lop(SAN() + `<path d="M960 340 V920" stroke="${P.navy3}" stroke-width="3" stroke-dasharray="4 14" stroke-linecap="round"/>` + [["scale", "url(#gNavy)"], ["chart-bar", "url(#gCam)"]].map(([i, f], k) => huy(230 + k * 860, 380, 52, f, i, P.trang, false)).join(""), 100, 280, 1720, 700, "Hai biểu tượng: văn bản pháp luật, nguồn số liệu", A("fade", 200, 600))
    + [["Văn bản pháp luật", L], ["Nguồn số liệu", S2]].map(([t, ds], k) => G("nhan-trai", 310 + k * 860, 340, 560, 80, esc(t), A("fade", 400 + k * 400, 300))
      + ds.map((s, j) => T("gt-ds", 180 + k * 860, 480 + j * 100, 740, s, A("fade", 500 + k * 400 + j * 100, 300))).join("")).join("")
    + nguon("Đủ 22 nguồn trong bài viết của nhóm. Đây là thông tin pháp luật chung, không phải tư vấn."), "data-hero");
}

// ===== 27 · CẢM ƠN =====
sec(27, "ket", "toi", nen(GRAD + KHOI_GOC(true) + `<circle cx="1500" cy="540" r="470" fill="url(#gQuang)" opacity="0.6"/><circle cx="1500" cy="540" r="390" fill="url(#gNavy)"/><rect x="0" y="1020" width="700" height="60" fill="${P.cam}"/>`)
  + anh("ky-hd-tron-lon.png", 1150, 190, 700, 700, "Ảnh đen trắng: bàn tay ký hợp đồng", A("pop", 300, 900)) + lop(`<circle cx="1500" cy="540" r="372" fill="none" stroke="${P.troi}" stroke-width="8"/>`, 1120, 160, 760, 760, "Vòng sáng quanh ảnh", A("fade", 900, 500))
  + T("kk sang", 120, 200, 800, "Nhóm 2 · Hết phần trình bày", A("fade", 0, 400))
  + H("cam-on-t", 118, 260, 980, "Cảm ơn thầy cô và các bạn", A("rise", 200, 800))
  + K(120, 640, 96, 8, "vach-cam", "Vạch xanh", A("wipe", 900, 400))
  + T("cam-on-m", 120, 680, 900, "Rất mong nhận được câu hỏi và góp ý.", A("fade", 1100, 500)), "data-hero");

// ===== 6 · NĂM VAI (thoáng) =====
{ const nguoi = (cx, by, s, ao) => `<circle cx="${cx}" cy="${by - s * 0.78}" r="${s * 0.2}" fill="${P.trang}"/><path d="M${cx - s * 0.36} ${by} Q${cx - s * 0.36} ${by - s * 0.5} ${cx} ${by - s * 0.52} Q${cx + s * 0.36} ${by - s * 0.5} ${cx + s * 0.36} ${by} Z" fill="${ao}"/>`;
  const mui = (x1, y1, x2, y2, m) => { const a = Math.atan2(y2 - y1, x2 - x1), L = 30, b = 0.45; return `<path d="M${x1} ${y1} L${x2 - Math.cos(a) * 20} ${y2 - Math.sin(a) * 20}" stroke="${m}" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M${x2} ${y2} L${x2 - L * Math.cos(a - b)} ${y2 - L * Math.sin(a - b)} L${x2 - L * Math.cos(a + b)} ${y2 - L * Math.sin(a + b)} Z" fill="${m}"/>`; };
  const V = [["Bên mua", 360, 500, "url(#gNavy)", P.troi], ["Người được bảo hiểm", 1560, 500, "url(#gNavy)", P.troi], ["Người thụ hưởng", 700, 830, "url(#gTroi)", P.trang], ["Người nhận thay", 1220, 830, "url(#gTroi)", P.trang]];
  sec(6, "noi-dung", "sang", dauGon(6, "Điều 1, 2, 8 · Các bên", "Một hợp đồng, [năm vai]")
    + lop(GRAD + san(140, 300, 1640, 700) + `<circle cx="960" cy="500" r="230" fill="none" stroke="${P.navy3}" stroke-width="3" stroke-dasharray="4 14" stroke-linecap="round"/>`
      + mui(490, 500, 780, 500, P.navy2) + mui(1140, 500, 1430, 500, P.navy2) + mui(860, 640, 770, 730, P.navy3) + mui(1060, 640, 1150, 730, P.navy3), 140, 300, 1640, 700,
      "Mũi tên: bên mua đóng phí cho Bảo Việt; Bảo Việt bảo vệ người được bảo hiểm và trả tiền cho người thụ hưởng hoặc người nhận thay", A("wipe", 1200, 800))
    + lop(GRAD + `<circle cx="960" cy="500" r="200" fill="url(#gQuang)"/><circle cx="960" cy="500" r="140" fill="url(#gCam)"/>` + icon("building", 960, 462, 96, P.trang, 3), 760, 300, 400, 400, "Bảo Việt", A("pop", 300, 500))
    + T("vai-ten-tr", 760, 535, 400, "Bảo Việt", A("fade", 400, 300))
    + V.map(([ten, cx, cy, m, ao], k) => { const r = k < 2 ? 120 : 92, t0 = 600 + k * 250;
      return lop(GRAD + `<circle cx="${cx}" cy="${cy}" r="${r + 26}" fill="url(#gQuang)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${m}"/>` + nguoi(cx, cy + r * 0.7, r * 1.15, ao), cx - r - 26, cy - r - 26, 2 * r + 52, 2 * r + 52, `Hình người: ${ten}`, `data-lap ${A("pop", t0, 400)}`)
        + T("vai-ten", cx - 220, cy + r + 18, 440, ten, A("fade", t0 + 100, 300)); }).join("")
    + T("nhan-mui-gon", 500, 440, 280, "đóng phí", A("fade", 1700, 300)) + T("nhan-mui-gon", 1150, 440, 280, "bảo vệ", A("fade", 1800, 300)), "data-hero");
}

// ===== 13 · CHẤM DỨT (thoáng) =====
{ const ud = unDraw("online-payments", 130, 330, 660);
sec(13, "so-lon", "sang", dauGon(13, "Điều 6 · Chấm dứt hợp đồng", "Ai chấm dứt, người mua [lấy lại bao nhiêu]?")
  + lop(GRAD + san(100, 290, 1720, 650) + ud.svg, 100, 290, 1720, 650, "Minh hoạ người cầm thẻ thanh toán nhận lại tiền phí", A("fade", 200, 600), "undraw")
  + [["Bên mua tự rút", 0.7, "70 %", "url(#gCam)", "nếu chưa từng được bồi thường"], ["Bảo Việt chấm dứt", 1, "100 %", "url(#gNavy)", "luôn hoàn đủ"]].map(([t, p, so, m, dk], k) => { const cx = 1020 + k * 520, cy = 560, t0 = 500 + k * 600;
    return lop(GRAD + donut(cx, cy, 170, 52, p, m), cx - 250, cy - 250, 500, 500, `Vòng tròn ${so}: ${t}`, A("wipe", t0, 900))
      + G(`donut-so${k ? "" : " cam"}`, cx - 170, cy - 60, 340, 120, `<span style="width:100%;text-align:center">${so}</span>`, A("pop", t0 + 400, 500))
      + T("donut-t", cx - 250, 790, 500, t, A("fade", t0 + 500, 400)) + T("donut-m", cx - 250, 846, 500, dk, A("fade", t0 + 600, 400)); }).join("")
  + T("chu-thich", 120, 980, 1500, "Phần trả lại tính trên phí của thời gian còn lại. Gian lận: mất toàn bộ quyền lợi.", A("fade", 1800, 400)), "data-khong-hinh");
}

// ===== 18 · TỔNG PHÍ (thoáng) =====
{ const PHI = [["2018", 133.7], ["2019", 160.2], ["2020", 184.7], ["2021", 216.0], ["2022", 251.3], ["2023", 227.1], ["2024", 227.5], ["2025", 237.2]];
  const yb = 930, sc = 470 / 251.3, x0 = 200, st = 200, w = 140, cx = (k) => x0 + k * st + w / 2, yt = (v) => yb - v * sc;
  const duong = PHI.map(([, v], k) => `${k ? "L" : "M"}${cx(k)} ${yt(v).toFixed(1)}`).join(" ");
  sec(18, "so-lon", "sang", dauGon(18, "Doanh thu phí bảo hiểm · nghìn tỷ đồng", "Tăng nóng đến 2022, rồi [chưa hồi lại đỉnh]")
    + lop(GRAD + san(100, 260, 1720, 740)
      + PHI.map(([nm, v], k) => `<rect x="${x0 + k * st}" y="${yt(v)}" width="${w}" height="${v * sc}" rx="18" fill="${k === 4 ? "url(#gCam)" : k > 4 ? "url(#gCot)" : DOC[k + 2]}"/>`).join("")
      + `<path d="${duong}" fill="none" stroke="${P.navy}" stroke-width="5" stroke-linejoin="round" stroke-dasharray="2 12" stroke-linecap="round"/>`
      + PHI.map(([, v], k) => `<circle cx="${cx(k)}" cy="${yt(v)}" r="13" fill="${P.trang}" stroke="${k === 4 ? P.cam : P.navy}" stroke-width="6"/>`).join("")
      + `<rect x="${cx(4) - 110}" y="270" width="220" height="64" rx="32" fill="${P.cam}"/><rect x="${cx(5) + 70}" y="296" width="380" height="64" rx="32" fill="${P.navy}"/>` + `<path d="M150 ${yb} H1770" stroke="${P.navy3}" stroke-width="3"/>`
      + `<path d="M${cx(5) + 40} 350 q 60 40 50 120" fill="none" stroke="${P.navy}" stroke-width="5" stroke-linecap="round"/><path d="M${cx(5) + 76} 456 l14 26 l12 -28 z" fill="${P.navy}"/>`,
      100, 260, 1720, 740, "Biểu đồ cột doanh thu phí 2018–2025 có đường nối đỉnh cột; 2022 là đỉnh, 2023 giảm", A("wipe", 400, 1200))
    + PHI.map(([nm, v], k) => T(`cot-so-gon${k === 4 ? " cam" : ""}`, x0 + k * st - 30, yt(v) - 70, w + 60, String(v).replace(".", ","), A("fade", 1000 + k * 100, 300)) + T("cot-nam-gon", x0 + k * st - 30, yb + 16, w + 60, nm, A("fade", 500, 300))).join("")
    + G("nhan-dinh", cx(4) - 110, 270, 220, 64, `<span style="width:100%;text-align:center">Đỉnh 2022</span>`, A("pop", 1800, 400))
    + G("nhan-giam", cx(5) + 70, 296, 380, 64, `<span style="width:100%;text-align:center">2023 giảm lần đầu</span>`, A("pop", 2100, 400))
    + T("chu-thich", 120, 1000, 1500, "Nguồn: Bộ Tài chính, Cục Quản lý, giám sát bảo hiểm (số ước tính), theo bài nhóm.", A("fade", 1800, 400)), "data-hero");
}

// ===== 21 · TRÍCH LUẬT TCTD =====
sec(21, "trich", "chia", K(0, 0, 1100, 1080, "pan-navy pan-full", "Panel màu chủ bên trái", A("fade", 0, 400))
  + anh("ky-hd-xam.jpg", 1100, 0, 820, 1080, "Ảnh đen trắng: bàn tay ký hợp đồng", A("fade", 300, 900))
  + T("kk sang", 120, 60, 900, "2024 · Siết luật", A("fade", 0, 400)) + T("so sang", 760, 64, 300, `21 / ${TONG}`) + H("td sang", 119, 116, 900, "Ngân hàng bị cấm gắn bán bảo hiểm", A("rise", 100, 600))
  + lop([0, 64].map((d) => `<circle cx="${138 + d}" cy="440" r="24" fill="${P.cam}"/><path d="M${114 + d} 440 Q${110 + d} 394 ${150 + d} 376 L${154 + d} 388 Q${130 + d} 400 ${136 + d} 430 Z" fill="${P.cam}"/>`).join(""), 100, 366, 150, 100, "Dấu ngoặc kép", A("pop", 400, 400))
  + T("trich", 120, 500, 900, "Tổ chức tín dụng … [gắn việc bán sản phẩm bảo hiểm không bắt buộc] với việc cung ứng sản phẩm, dịch vụ ngân hàng dưới mọi hình thức.", A("fade", 700, 800))
  + T("vd-sang", 120, 800, 900, "Ví dụ: ngân hàng không được buộc khách mua bảo hiểm mới cho vay.", A("fade", 1100, 400))
  + T("trich-cc", 120, 900, 900, "Khoản 5 Điều 15 (hành vi bị nghiêm cấm) · Luật Các tổ chức tín dụng 2024 · hiệu lực 01/7/2024", A("fade", 1200, 400)), "data-hero");


// ============ STYLE ============
ghi(path.join(D, "style.css"), `section.s{background:${P.trang};color:${P.navy}}section.s.toi{background:${P.navy}}section.s > div,section.s > h1{position:absolute}[data-t]{text-wrap:pretty}h1{text-wrap:balance}
em{font-style:normal;color:${P.cam}}.giua{display:flex;align-items:center}
.kk{font:700 32px/1 'Be Vietnam Pro';letter-spacing:.06em;text-transform:uppercase;color:${P.cam0}}.kk.sang{color:${P.cam4}}
.so{font:600 24px/1 'Be Vietnam Pro';color:${P.phu};text-align:right}.so.sang{color:${P.ke}}
.td{font:800 64px/1.25 'Be Vietnam Pro';color:${P.navy}}.td.sang{color:${P.trang}}
.dan{font:400 34px/1.4 'Be Vietnam Pro';color:${P.phu}}.dan.sang{color:${P.ke}}.vach-cam{background:${P.cam}}
.nguon{font:400 26px/1.35 'Be Vietnam Pro';color:${P.phu}}.nguon.sang{color:${P.ke}}
.bia{font:800 122px/1.2 'Be Vietnam Pro';text-transform:uppercase;color:${P.navy}}.bia-m{font:500 36px/1.4 'Be Vietnam Pro';color:${P.phu}}.bia-by{font:600 30px/1.4 'Be Vietnam Pro';color:${P.navy}}
.mp-so{font:800 320px/1 'Be Vietnam Pro';color:${P.cam}}.mp-t{font:800 88px/1.2 'Be Vietnam Pro';text-transform:uppercase;color:${P.trang}}.mp-m{font:400 34px/1.45 'Be Vietnam Pro';color:${P.ke}}
.mp-chip{font:700 30px/1 'Be Vietnam Pro';color:${P.trang};border-top:4px solid ${P.cam};padding-top:14px}
.so-lon-p{font:800 124px/1.1 'Be Vietnam Pro';color:${P.cam};white-space:nowrap}.so-lon-m{font:600 32px/1.3 'Be Vietnam Pro';color:${P.trang}}
.bh{background:${P.navy}}.bh-t{font:700 30px/1.2 'Be Vietnam Pro';color:${P.trang}}
.hang{background:${P.trang};border-bottom:2px solid ${P.ke}}.hang.le{background:${P.nen}}.hang.nhan{background:${P.cam4}}
.o-dau{font:800 36px/1 'Be Vietnam Pro';color:${P.navy}}.o-chu{font:500 30px/1.2 'Be Vietnam Pro';color:${P.navy}}.o-chu.dam{font-weight:800;color:${P.navy}}
.cap > b,.cap > span{display:block}.cap > span{margin-top:6px}
.vai-t{font:800 32px/1.25 'Be Vietnam Pro';color:${P.navy};text-align:center}.vai-m{font:400 30px/1.3 'Be Vietnam Pro';color:${P.phu};text-align:center}
.vai-bv{font:800 30px/1 'Be Vietnam Pro';letter-spacing:.06em;color:${P.trang}}.nhan-mui{font:800 30px/1 'Be Vietnam Pro';color:${P.navy};text-align:center}
.cho{font:600 32px/1.3 'Be Vietnam Pro';color:${P.navy}}.cho.cam{color:${P.cam0};font-weight:800}.cho-so{font:800 40px/1.1 'Be Vietnam Pro';color:${P.navy};text-align:right}.cho-so.cam{color:${P.cam}}
.ghi{font:600 30px/1.35 'Be Vietnam Pro';color:${P.navy}}
.trich{font:500 36px/1.5 'Be Vietnam Pro';color:${P.trang}}.trich em{color:${P.cam};font-weight:800}.trich-cc{font:700 28px/1.3 'Be Vietnam Pro';color:${P.ke}}
.the{background:${P.nen}}.vach-doc{background:${P.cam}}.vach-doc.navy{background:${P.navy}}
.the-so{font:800 96px/1 'Be Vietnam Pro';color:${P.navy}}.the-so.cam{color:${P.cam}}.the-t{font:800 50px/1.2 'Be Vietnam Pro';text-transform:uppercase;color:${P.navy}}.the-ai{font:600 28px/1.2 'Be Vietnam Pro';color:${P.phu}}
.the-m{font:700 38px/1.3 'Be Vietnam Pro';color:${P.navy}}.the-cc{font:600 28px/1.2 'Be Vietnam Pro';color:${P.phu}}
.cot-so{font:800 42px/1 'Be Vietnam Pro'}.cot-so.trang{color:${P.trang}}.cot-so.toi{color:${P.navy}}.cot-nam{font:700 32px/1.2 'Be Vietnam Pro';color:${P.trang};text-align:center}
.cot-g{font:700 32px/1.2 'Be Vietnam Pro';color:${P.ke};text-align:center}.cot-g.cam{color:${P.cam4}}.dinh{font:700 32px/1 'Be Vietnam Pro';color:${P.cam4};text-align:right}.pan-navy{background:${P.navy}}
.so-vua{font:800 64px/1 'Be Vietnam Pro';color:${P.navy}}.so-vua-m{font:600 34px/1.3 'Be Vietnam Pro';color:${P.phu}}
.moc-t{font:800 44px/1.1 'Be Vietnam Pro';color:${P.cam}}.moc-m{font:500 32px/1.35 'Be Vietnam Pro';color:${P.navy}}
.dai-cam{background:${P.cam}}.dai-cam-t{font:800 34px/1.2 'Be Vietnam Pro';color:${P.trang}}
.khoi-so{font:800 140px/1 'Be Vietnam Pro';color:${P.cam}}.khoi-so.navy{color:${P.navy}}.khoi-t{font:800 48px/1.25 'Be Vietnam Pro';text-transform:uppercase;color:${P.navy}}.khoi-t.sang{color:${P.trang}}
.khoi-m{font:500 34px/1.4 'Be Vietnam Pro';color:${P.navy}}.khoi-m.sang{color:${P.ke}}.khoi-chip{font:700 30px/1 'Be Vietnam Pro';color:${P.navy};border-top:4px solid ${P.cam};padding-top:14px}.khoi-chip.sang{color:${P.trang}}
.tl-t{font:600 32px/1.25 'Be Vietnam Pro';color:${P.navy}}.cot-nhan{font:700 30px/1.2 'Be Vietnam Pro';color:${P.navy}}.cot-nhan.phai{text-align:right}
.bac-so{font:800 96px/1 'Be Vietnam Pro';color:${P.trang};text-align:center}.bac-t{font:700 30px/1.25 'Be Vietnam Pro';color:${P.navy}}
.goi-t{font:800 34px/1.2 'Be Vietnam Pro';text-transform:uppercase;color:${P.navy}}.goi-so{font:800 44px/1 'Be Vietnam Pro';color:${P.trang}}.goi-nv{font:800 40px/1 'Be Vietnam Pro';color:${P.cam0}}
.o-cam{background:${P.cam}}.o-navy3{background:${P.navy3}}.ds-t{font:500 32px/1.3 'Be Vietnam Pro';color:${P.navy}}.ds-t.lon{font-weight:600}.bs-t{font:700 32px/1.2 'Be Vietnam Pro';color:${P.trang}}
.ct-ten{font:700 32px/1.3 'Be Vietnam Pro';color:${P.navy}}.ct-o{font:800 36px/1.2 'Be Vietnam Pro'}.ct-o.sang{color:${P.trang}}.ct-o.do{color:${P.cam0}}
.moc-n{font:800 32px/1.25 'Be Vietnam Pro';color:${P.navy};text-align:center}.moc-n.cam{color:${P.cam0}}.trich-den{font:600 38px/1.45 'Be Vietnam Pro';color:${P.navy}}
.vach-navy{background:${P.navy}}.vach-ke{background:${P.ke}}.vach-navy2{background:${P.navy2}}
.so-khoi{font:800 160px/1 'Be Vietnam Pro';color:${P.navy}}.so-khoi.cam{color:${P.cam}}.dk-m{font:400 32px/1.35 'Be Vietnam Pro';color:${P.phu}}
.ct-cong{font:800 52px/1.2 'Be Vietnam Pro';color:${P.trang}}.ct-ghi{font:600 32px/1.3 'Be Vietnam Pro';color:${P.trang}}
.dai-cam4{background:${P.cam4}}.dai-do-t{font:700 32px/1.35 'Be Vietnam Pro';color:${P.cam0}}.dai-do-t em{color:${P.navy}}.dc-t{font:600 34px/1.35 'Be Vietnam Pro';color:${P.navy}}
.pan-cam{background:${P.cam}}.o-so{font:800 34px/1 'Be Vietnam Pro';color:${P.trang}}.o-nen{background:${P.navy}}.o-nen.cam{background:${P.cam0}}
.kn-so{font:800 110px/1 'Be Vietnam Pro';color:${P.cam}}.cc-t{font:700 28px/1.3 'Be Vietnam Pro';color:${P.trang}}
.ba-so{font:800 44px/1 'Be Vietnam Pro';color:${P.trang}}.ba-nam{font:700 32px/1.2 'Be Vietnam Pro';color:${P.navy};text-align:center}
.so-the{font:800 76px/1.1 'Be Vietnam Pro';color:${P.navy}}.so-the-m{font:600 30px/1.3 'Be Vietnam Pro';color:${P.phu}}
.yagi-t{font:700 32px/1.2 'Be Vietnam Pro';color:${P.navy}}.yagi-so{font:800 48px/1.2 'Be Vietnam Pro';color:${P.navy}}.yagi-so.do{color:${P.cam0}}.dai-trang-t{font:700 36px/1.3 'Be Vietnam Pro';color:${P.trang}}
.chu-giai{font:700 32px/1.2 'Be Vietnam Pro';color:${P.trang}}.dv-so{font:800 44px/1.1 'Be Vietnam Pro';color:${P.trang};text-align:center}.dv-so.cam{color:${P.cam}}.dv-nam{font:700 34px/1.2 'Be Vietnam Pro';color:${P.trang};text-align:center}
.ket-so{font:800 140px/1 'Be Vietnam Pro';color:${P.cam4}}.ket-m{font:500 34px/1.4 'Be Vietnam Pro';color:${P.trang}}
.tl-dong{font:500 32px/1.3 'Be Vietnam Pro';color:${P.navy}}.cam-on{font:800 64px/1.1 'Be Vietnam Pro';text-transform:uppercase;color:${P.navy}}
.hd-nhan{font:700 30px/1.2 'Be Vietnam Pro';letter-spacing:.06em;text-transform:uppercase;color:${P.ke}}.hd-so{font:800 96px/1.1 'Be Vietnam Pro';color:${P.trang}}
.hd-phan{font:800 38px/1.2 'Be Vietnam Pro';color:${P.cam0}}.hd-phan.sang{color:${P.trang}}.khoi-t.cam{color:${P.cam0}}
.buoc-t{font:800 36px/1.25 'Be Vietnam Pro';color:${P.navy}}.buoc-t.cam{color:${P.cam0}}
.dau-huy{font:800 88px/1.6 'Be Vietnam Pro';letter-spacing:.04em;color:${P.cam0};text-align:center}.trich-ngan{font:600 36px/1.4 'Be Vietnam Pro';color:${P.navy}}.trich-ngan em{color:${P.cam0}}
.app-t{font:800 34px/1.2 'Be Vietnam Pro';color:${P.navy}}.app-buoc{font:700 28px/1.25 'Be Vietnam Pro';color:${P.navy}}
.so-15{font:800 220px/1.1 'Be Vietnam Pro';color:${P.trang}}.so-15-m{font:700 36px/1.3 'Be Vietnam Pro';color:${P.trang}}.dc-t.nho{font-size:32px}
.pan-navy2{background:${P.navy2}}
.gd-nam{font:800 44px/1.4 'Be Vietnam Pro';color:${P.trang}}.gd-m{font:500 32px/1.4 'Be Vietnam Pro';color:${P.navy}}
.y-chinh{font:700 32px/1.2 'Be Vietnam Pro';color:${P.navy}}.bai-hoc{font:700 36px/1.3 'Be Vietnam Pro';color:${P.trang}}.dinh-nghia{font:600 30px/1.3 'Be Vietnam Pro';color:${P.navy}}
.tl-m{font:400 28px/1.2 'Be Vietnam Pro';color:${P.phu}}.vd-sang{font:600 32px/1.35 'Be Vietnam Pro';color:${P.cam4}}.chu-anh{font:600 28px/1.2 'Be Vietnam Pro';color:${P.trang}}
.cam-on-t{font:800 120px/1.15 'Be Vietnam Pro';text-transform:uppercase;color:${P.trang}}.cam-on-m{font:600 40px/1.35 'Be Vietnam Pro';color:${P.trang}}.cam-on-m.nho{font-size:34px;font-weight:400;color:${P.ke}}
/* phong cách theo mẫu Hào gửi 20/11/2026: thẻ xanh nhạt bo góc lớn, viền mảnh */
.the{background:${P.nen};border:2px solid ${P.ke};border-radius:24px}.pan-navy{border-radius:24px}.pan-navy.pan-full{border-radius:0}.pan-navy2{border-radius:24px}.pan-cam{border-radius:24px}.dai-cam4{border-radius:20px}.bh{border-radius:16px 16px 0 0}
.vach-doc{border-radius:6px}.o-nen{border-radius:10px}.hang.nhan{background:${P.cam4}}
/* chuyển sang nền sáng theo mẫu: panel / khối tối thành thẻ xanh nhạt, chữ trên đó màu navy */
section.s.toi{background:${P.trang}}
.pan-navy,.pan-navy2{background:${P.nen};border:2px solid ${P.ke}}.pan-navy.pan-full{background:${P.cam4};border:0}
.td.sang,.mp-t,.cam-on-t,.khoi-t.sang,.bs-t,.ct-cong,.dai-trang-t,.cc-t,.chu-giai,.dv-nam,.cot-nam,.ket-m,.cam-on-m,.dong-m.sang,.trich,.so-lon-m,.ct-ghi{color:${P.navy}}
.dan.sang,.so.sang,.nguon.sang,.mp-m,.khoi-m.sang,.trich-cc,.cam-on-m.nho{color:${P.phu}}
.kk.sang{color:${P.cam0}}.mp-chip,.khoi-chip.sang{color:${P.navy}}.vd-sang{color:${P.cam0}}.dv-so{color:${P.navy}}
.so-lon-p,.mp-so,.khoi-so,.ket-so,.kn-so,.so-khoi.cam,.so-the{color:${P.cam}}.trich em{color:${P.cam0}}
.cot-so.toi,.goi-so.toi{color:${P.navy}}
.bia{font:900 104px/1.15 'Be Vietnam Pro';text-transform:uppercase;color:${P.navy}}.mp-t{font-weight:900;font-size:76px}.cam-on-t{font-size:96px}
.khoi-t.nho{font-size:34px}.so-khoi{font-size:120px}.ket-so{font-size:110px}.the-t{font-size:40px}.the-so{font-size:80px}
.dinh{color:${P.cam0}}.chu-anh{color:${P.navy}}
.so-lon-p{font-size:104px;margin-left:-4px}.mp-so{margin-left:-5px}.so-khoi,.kn-so,.ket-so,.khoi-so{margin-left:-1px}.so-15{margin-left:-5px}.bia{margin-left:-4px}.td{margin-left:-1px}.mp-t{margin-left:-1px}.cam-on-t{margin-left:2px}.so-vua{margin-left:-4px}
.the-t{font-size:34px}
.so-lon-p.am{margin-left:-10px}
/* nhịp nền (Hào: "nền quá trùng lặp, chưa bắt mắt"): slide đậm navy cho mở phần / kết luận chung / cảm ơn; panel trái của slide chia đôi navy */
section.s.dam{background:${P.navy}}
.dam .td,.dam .mp-t,.dam .cam-on-t,.dam .khoi-t,.dam .ket-m,.dam .cam-on-m,.dam .mp-chip{color:${P.trang}}
.dam .dan,.dam .mp-m,.dam .so,.dam .cam-on-m.nho,.dam .nguon{color:#C9D9F2}
.dam .kk,.dam .mp-so,.dam .ket-so,.dam em{color:${P.troi}}.dam .mp-chip{border-top-color:${P.troi}}
.dam .pan-navy2{background:#2E4B86;border:0}
.chia .pan-full{background:${P.navy}}
.chia .td.sang,.chia .trich,.chia .so-lon-m{color:${P.trang}}.chia .kk.sang,.chia .so-lon-p,.chia .trich em,.chia .vd-sang{color:${P.troi}}.chia .trich-cc{color:#C9D9F2}
.chia .so.sang{color:#C9D9F2}
.td-gon{font:800 68px/1.2 'Be Vietnam Pro';color:${P.navy}}.vai-ten-tr{font:800 32px/1.2 'Be Vietnam Pro';color:${P.trang};text-align:center}
.nhan-dinh,.nhan-giam{font:800 30px/1.2 'Be Vietnam Pro';color:${P.trang}}.chu-thich{font:400 28px/1.35 'Be Vietnam Pro';color:${P.phu}}
.donut-so{font:800 96px/1.2 'Be Vietnam Pro';color:${P.navy}}.donut-so.cam{color:${P.cam}}.donut-t{font:800 40px/1.2 'Be Vietnam Pro';color:${P.navy};text-align:center}.donut-m{font:400 32px/1.3 'Be Vietnam Pro';color:${P.phu};text-align:center}
.cot-so-gon{font:800 40px/1.2 'Be Vietnam Pro';color:${P.navy};text-align:center}.cot-so-gon.cam{color:${P.cam}}.cot-nam-gon{font:600 32px/1.2 'Be Vietnam Pro';color:${P.phu};text-align:center}
.vai-ten{font:800 34px/1.2 'Be Vietnam Pro';color:${P.navy};text-align:center}.nhan-mui-gon{font:600 30px/1.2 'Be Vietnam Pro';color:${P.navy2};text-align:center}
.kk-giua{font:700 30px/1.2 'Be Vietnam Pro';letter-spacing:.06em;text-transform:uppercase;color:${P.cam0};text-align:center}
.nhan-trai{font:800 38px/1.25 'Be Vietnam Pro';color:${P.navy}}.nhan-trai.cam,.nhan-giua.cam{color:${P.cam}}.nhan-giua{font:800 38px/1.25 'Be Vietnam Pro';color:${P.navy};text-align:center}
.phu-giua{font:400 30px/1.4 'Be Vietnam Pro';color:${P.phu};text-align:center}.phu-trai{font:400 30px/1.4 'Be Vietnam Pro';color:${P.phu}}.cc-giua{font:600 28px/1.35 'Be Vietnam Pro';color:${P.navy2};text-align:center}
.so-giua{font:800 72px/1.2 'Be Vietnam Pro';color:${P.navy}}.so-giua.trang{color:${P.trang}}.so-giua.cam{color:${P.cam}}.so-trai{font:800 64px/1.2 'Be Vietnam Pro';color:${P.navy}}.so-trai.cam{color:${P.cam}}
.so-tr-lon{font:800 150px/1.1 'Be Vietnam Pro';color:${P.trang}}.so-tr-vua{font:800 84px/1.2 'Be Vietnam Pro';color:${P.trang}}.chu-vong{font:700 32px/1.3 'Be Vietnam Pro';color:${P.trang};text-align:center}
.chu-o{font:800 34px/1 'Be Vietnam Pro';color:${P.trang}}.gt{font:800 36px/1.2 'Be Vietnam Pro';color:${P.navy}}.gt.cam{color:${P.cam}}.gt.trang{color:${P.trang}}.gt-nho{font:700 30px/1.25 'Be Vietnam Pro';color:${P.navy}}
.gt-giua{font:800 34px/1.2 'Be Vietnam Pro';color:${P.navy};text-align:center}.gt-giua.cam{color:${P.cam}}.gt-ds{font:600 32px/1.3 'Be Vietnam Pro';color:${P.navy}}
.td-gon.trang{color:${P.trang}}.t-trang{font:800 44px/1.2 'Be Vietnam Pro';color:${P.trang};text-align:center}.m-trang{font:400 30px/1.45 'Be Vietnam Pro';color:#DCE7F5;text-align:center}
.bh-trang{font:600 34px/1.4 'Be Vietnam Pro';color:${P.trang};text-align:center}.bh-trang em{color:${P.troi}}.app-t{font:800 30px/1.2 'Be Vietnam Pro';color:${P.navy};text-align:center}
`);
fs.rmSync(path.join(D, "slides"), { recursive: true, force: true });
S.sort((a, b) => a.k - b.k).forEach((s) => ghi(path.join(D, "slides", `${String(s.k).padStart(2, "0")}.html`), s.html));
fs.writeFileSync(path.join(D, "thiet-ke", "phong-cach.json"), JSON.stringify({ ten: "nền sáng xanh — theo mẫu Hào gửi", huong: "Hào gửi 5 ảnh mẫu (20/11/2026, thiet-ke/tham-chieu/nguoi-dung/): nền trắng, khối bo tròn xanh trời + navy ở góc, thẻ xanh rất nhạt bo góc 24 px viền mảnh, số lớn xanh dương, cột biểu đồ chuyển màu nhạt → đậm, chữ Be Vietnam Pro đậm (tiêu đề chữ thường, mở phần in hoa). Giữ bố cục, nội dung đã duyệt; không dùng hình người AI của mẫu. 20/11/2026 (Hào: \"quá rối\" → \"chưa đủ bắt mắt\"): bố cục thoáng một ý một hình lớn, hình đặt trên khối nền mềm, tô chuyển màu theo bảng màu (như cột, vùng biểu đồ trong mẫu), người minh hoạ unDraw tô lại màu thay cho người AI của mẫu.", gradient: true, bongMo: false,
  bangMau: [...Object.values(P), ...DOC, "#F2B8A0"], loaiHinh: ["phang", "nen", "anh-chup", "undraw"], boCuc: ["bia", "mo-phan", "noi-dung", "chia", "so-lon", "bang", "trich", "so-sanh", "ket"], tieuDeCoDinh: ["noi-dung", "bang"], vaiBatBuoc: ["bia", "lo-trinh", "ket-phan", "ket-chung", "cam-on"],
  nguong: { loaiNenToiThieu: 2, tiLeNenToiDa: 0.85, lienToiDa: 6, lienHoToiDa: 6, assetToiDa: 4, bangXetTiLe: 99, tieuDiemToiThieu: 0.15 } }, null, 2));
console.log(`${S.length} slide: ${S.map((s) => s.k).join(", ")}`);
