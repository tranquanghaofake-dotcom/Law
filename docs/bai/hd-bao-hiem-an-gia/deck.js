// Deck "HĐ bảo hiểm Bảo Việt An Gia & thực trạng thị trường" (Nhóm 2) — skill slide-chuan.
// Hướng 3 · BÁO CÁO ĐẬM (Hào chọn ở điểm duyệt C1, 20/11/2026): navy + trắng, MỘT màu nhấn cam san hô,
// tiêu đề Anton in hoa NGẮN (≤ 30 ký tự) + câu dẫn đầy đủ bằng Be Vietnam Pro, panel chia đôi, số lớn, ảnh tròn đen trắng, lưới chấm.
// Điểm C2: dựng 8 slide mẫu phủ các bố cục chính; sau khi Hào duyệt mới đổ đủ 25 slide (bản cũ 25 slide hướng 1: lịch sử git, commit 4785dc1).
//   node deck.js && PW_CHROMIUM=/opt/pw-browsers/chromium node ../../../.claude/skills/slide-chuan/scripts/dung.js . --ten=hd-bao-hiem-an-gia --nhap
const fs = require("fs"), path = require("path");
const D = __dirname, NOTES = require("./notes.json"), TONG = 25;
const ghi = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
fs.rmSync(path.join(D, "asset", "hinh"), { recursive: true, force: true });
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const em = (s) => esc(s).replace(/\[([^\]]+)\]/g, "<em>$1</em>");
const P = { navy: "#14294A", navy2: "#22406E", navy3: "#4D6A96", trang: "#FFFFFF", nen: "#F3F5F8", phu: "#43506A", ke: "#D5DBE5", cam: "#E8553A", cam4: "#FBE1DA", cam0: "#B8361F" };
let nL = 0;
const S = [];
const A = (a, at, dur = 500) => `data-a="${a}" data-at="${at}" data-dur="${dur}"`;
const lop = (body, x, y, w, h, alt, ex = "", loai = "phang") => { const f = `l${String(++nL).padStart(3, "0")}.svg`;
  ghi(path.join(D, "asset", "hinh", f), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${body}</svg>`);
  return `<img data-l="l${nL}" data-loai="${loai}" data-alt="${esc(alt)}" ${ex} src="asset/hinh/${f}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`; };
const nen = (body) => lop(body, 0, 0, 1920, 1080, "Hình trang trí", "", "nen");
const anh = (f, x, y, w, h, alt, ex = "") => `<img data-l="a${++nL}" data-loai="anh-chup" data-alt="${esc(alt)}" ${ex} src="anh/${f}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`;
const T = (cls, x, y, w, s, ex = "") => `<div class="${cls}" data-t ${ex} style="left:${x}px;top:${y}px;width:${w}px">${em(s)}</div>`;
const G = (cls, x, y, w, h, html, ex = "") => `<div class="${cls} giua" data-t ${ex} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${html}</div>`;
const H = (cls, x, y, w, s, ex = "") => `<h1 class="${cls}" data-t data-tieu-de ${ex} style="left:${x}px;top:${y}px;width:${w}px">${em(s)}</h1>`;
const K = (x, y, w, h, cls, alt, ex = "") => `<div class="${cls}" data-l="k${++nL}" data-alt="${esc(alt)}" ${ex} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"></div>`;
const nguon = (s, sang = false) => `<div class="nguon${sang ? " sang" : ""}" data-t style="left:120px;top:1004px;width:1680px">${esc(s)}</div>`;
const cham = (x, y, c, r, m) => { let s = ""; for (let i = 0; i < c; i++) for (let j = 0; j < r; j++) s += `<circle cx="${x + i * 26}" cy="${y + j * 26}" r="5" fill="${m}"/>`; return s; };
const icon = (ten, cx, cy, co, mau, net = 3) => { const t = fs.readFileSync(path.join(D, "asset", "tabler", ten + ".svg"), "utf8").replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/<path stroke="none" d="M0 0h24v24H0z" fill="none"\s*\/>/, "");
  return `<g transform="translate(${cx - co / 2} ${cy - co / 2}) scale(${co / 24})" fill="none" stroke="${mau}" stroke-width="${((net * 24) / co).toFixed(3)}" stroke-linecap="round" stroke-linejoin="round">${t}</g>`; };
const sec = (k, mau, nenLoai, inner, ex = "") => S.push({ k, html: `<section class="s ${nenLoai}" data-mau="${mau}" data-nen="${{ sang: "N1", toi: "N2", chia: "N3", anh: "N4" }[nenLoai]}" ${ex} data-trans="push" data-dur="600" data-notes="${esc(NOTES[k] || "")}">\n${inner}\n</section>` });

// ---------- BỐ CỤC MẪU ----------
// nội dung (nền trắng): nhãn cam · tiêu đề Anton NGẮN · câu dẫn · vạch cam · vùng nội dung 330–980 · nguồn 1004
const dau = (k, kk, td, dan, toi = false) => nen(cham(1696, 130, 5, 3, toi ? P.navy2 : P.ke))
  + T(`kk${toi ? " sang" : ""}`, 120, 60, 1200, kk, A("fade", 0, 400)) + T(`so${toi ? " sang" : ""}`, 1500, 64, 300, `${k} / ${TONG}`)
  + H(`td${toi ? " sang" : ""}`, 116, 116, 1500, td, A("rise", 100, 600)) + T(`dan${toi ? " sang" : ""}`, 120, 236, 1640, dan, A("fade", 300, 500))
  + K(120, 302, 96, 8, "vach-cam", "Vạch cam dưới tiêu đề", A("wipe", 400, 400));
// chia (panel navy trái 660 px): số lớn + tiêu đề trong panel; nội dung bên phải 780–1800
const panTrai = (k, kk, so, soM, td) => K(0, 0, 660, 1080, "pan-navy", "Panel màu chủ bên trái", A("fade", 0, 400))
  + T("kk sang", 120, 60, 500, kk, A("fade", 0, 400)) + H("td sang", 116, 116, 480, td, A("rise", 100, 600)) + T("so", 1500, 64, 300, `${k} / ${TONG}`)
  + K(120, 560, 96, 8, "vach-cam", "Vạch cam", A("wipe", 400, 400)) + T("so-lon-p", 116, 600, 520, so, A("pop", 500, 600)) + T("so-lon-m", 124, 760, 480, soM, A("fade", 700, 400));

// ===== 1 · BÌA =====
sec(1, "bia", "sang", nen(`<rect x="1100" y="0" width="820" height="1080" fill="${P.navy}"/>` + cham(120, 960, 10, 2, P.ke) + `<rect x="0" y="0" width="560" height="40" fill="${P.cam}"/>`)
  + anh("ky-hd-tron.png", 1180, 220, 640, 640, "Ảnh đen trắng trong khung tròn: bàn tay ký hợp đồng bảo hiểm", A("pop", 300, 800))
  + lop(`<circle cx="1500" cy="540" r="352" fill="none" stroke="${P.cam}" stroke-width="8"/>`, 1140, 180, 720, 720, "Vòng cam quanh ảnh", A("fade", 800, 500))
  + T("kk", 120, 140, 700, "Nhóm 2 · Thuyết trình", A("fade", 200, 400))
  + H("bia", 116, 210, 680, "Hợp đồng bảo hiểm thương mại", A("rise", 300, 700))
  + T("bia-m", 120, 700, 900, "và thực trạng thị trường bảo hiểm Việt Nam, 2018\u00a0–\u00a09\u00a0tháng\u00a02026", A("fade", 1000, 500))
  + T("bia-by", 120, 840, 900, "Hợp đồng mẫu: Bảo Việt An Gia · 13 điều + Phụ lục 1", A("fade", 1200, 500)));

// ===== 3 · MỞ PHẦN I =====
const moPhan = (k, so, ten, mo, chips, alt) => sec(k, "mo-phan", "toi", nen(cham(120, 84, 10, 3, P.navy2) + `<circle cx="1500" cy="560" r="330" fill="${P.navy2}"/>`)
  + T("mp-so", 110, 170, 600, so, A("pop", 200, 700)) + H("mp-t", 116, 520, 900, ten, A("rise", 500, 600)) + T("mp-m", 120, 760, 860, mo, A("fade", 800, 500))
  + chips.map((c, i) => T("mp-chip", 120 + i * 240, 900, 220, c, A("rise", 1000 + i * 120, 400))).join("")
  + lop(`<rect x="1290" y="330" width="420" height="500" fill="${P.trang}"/><path d="M1630 330 L1710 410 L1630 410 Z" fill="${P.ke}"/>` + [0, 1, 2, 3, 4].map((i) => `<rect x="1340" y="${450 + i * 56}" width="${i === 0 ? 220 : 320}" height="14" fill="${i === 0 ? P.navy : P.ke}"/>`).join("") + `<rect x="1340" y="390" width="160" height="22" fill="${P.cam}"/><circle cx="1680" cy="790" r="70" fill="${P.cam}"/>` + icon("eye", 1680, 790, 80, P.trang, 4), 1280, 320, 480, 560, alt, A("pop", 400, 800)));
moPhan(3, "01", "Hợp đồng Bảo Việt An Gia", "Đọc như người mua: điều khoản nói gì, có lợi cho ai, khớp luật đến đâu.", ["Chủ thể", "Quyền lợi", "Thời gian chờ", "Bồi thường"], "Minh hoạ: tờ hợp đồng và con mắt — đọc kỹ hợp đồng");

// ===== 4 · BẢNG ĐIỀU 17 =====
{ const R = [["a", "Các bên của hợp đồng", "Điều 1, 2, 8", 1], ["b", "Đối tượng bảo hiểm", "Điều 2 (danh sách NĐBH)", 1], ["c", "Giới hạn trách nhiệm", "Phụ lục 1", 1], ["d", "Quyền lợi, quy tắc, điều khoản", "Điều 2, 7, Phụ lục 1", 1], ["đ", "Quyền, nghĩa vụ các bên", "Điều 9: chỉ dẫn chiếu pháp luật", 0], ["e", "Thời hạn, thời điểm hiệu lực", "Điều 3, 5", 1], ["g", "Mức phí, cách đóng phí", "Điều 4", 1], ["h", "Cách bồi thường, trả tiền", "Điều 10", 1], ["i", "Giải quyết tranh chấp", "Điều 13", 1]];
  const y0 = 340, hh = 62, hr = 64, cx = [120, 260, 980, 1640], cw = [140, 720, 660, 160];
  sec(4, "bang", "sang", dau(4, "Đối chiếu luật ✚ · khoản 1 Điều 17 Luật KDBH", "Đủ 9 nội dung luật đòi hỏi", "Hợp đồng An Gia khớp cả 9 điểm a–i; riêng quyền, nghĩa vụ chỉ dẫn chiếu sang pháp luật.")
    + K(120, y0, 1680, hh, "bh", "Đầu bảng", A("wipe", 400, 400))
    + [["Điểm", 0], ["Luật yêu cầu", 1], ["Hợp đồng An Gia", 2], ["Đạt", 3]].map(([s, j]) => G("bh-t", cx[j] + 20, y0, cw[j] - 40, hh, `<span style="width:100%;text-align:${j === 0 || j === 3 ? "center" : "left"}">${esc(s)}</span>`, A("fade", 500, 300))).join("")
    + R.map(([d, l, h, ok], i) => { const y = y0 + hh + i * hr, t0 = 700 + i * 90;
      return K(120, y, 1680, hr - 4, `hang${ok ? (i % 2 ? " le" : "") : " nhan"}`, `Hàng điểm ${d}`, A("rise", t0, 300))
        + G("o-dau", cx[0] + 20, y, cw[0] - 40, hr - 4, `<span style="width:100%;text-align:center">${esc(d)}</span>`, A("rise", t0, 300))
        + G("o-chu", cx[1] + 20, y, cw[1] - 40, hr - 4, esc(l), A("rise", t0, 300)) + G(`o-chu${ok ? "" : " dam"}`, cx[2] + 20, y, cw[2] - 40, hr - 4, esc(h), A("rise", t0, 300))
        + lop(ok ? `<rect x="${cx[3] + 58}" y="${y + 8}" width="44" height="44" fill="${P.navy}"/>` + icon("check", cx[3] + 80, y + 30, 30, P.trang, 4) : `<rect x="${cx[3] + 58}" y="${y + 8}" width="44" height="44" fill="${P.cam}"/>` + icon("alert-triangle", cx[3] + 80, y + 29, 28, P.trang, 3), cx[3] + 58, y + 8, 44, 44, ok ? `Đạt điểm ${d}` : `Điểm ${d}: chỉ dẫn chiếu`, `data-lap ${A("pop", t0 + 100, 300)}`); }).join("")
    + nguon("Khoản 1 Điều 17 Luật KDBH 08/2022/QH15 (Luật đã sửa đổi năm 2025; Điều 17 giữ nguyên). ✚ Nhóm bổ sung phần đối chiếu."), "data-khong-hinh");
}

// ===== 6 · NĂM VAI (sơ đồ) =====
{ const nguoi = (cx, by, s, ao) => `<circle cx="${cx}" cy="${by - s * 0.78}" r="${s * 0.2}" fill="${P.trang}"/><path d="M${cx - s * 0.36} ${by} Q${cx - s * 0.36} ${by - s * 0.5} ${cx} ${by - s * 0.52} Q${cx + s * 0.36} ${by - s * 0.5} ${cx + s * 0.36} ${by} Z" fill="${ao}"/>`;
  const V = [["Bên mua bảo hiểm", "giao kết, đóng phí", 170, 400, 180, P.navy], ["Người được bảo hiểm", "sức khỏe, tính mạng được bảo vệ", 1570, 400, 180, P.navy], ["Người thụ hưởng", "nhận tiền khi NĐBH tử vong", 520, 700, 140, P.navy3], ["Người chỉ định nhận tiền", "nhận thay tiền bồi thường", 1260, 700, 140, P.navy3]];
  const mui = (x1, y1, x2, y2, m) => { const a = Math.atan2(y2 - y1, x2 - x1), L = 24, b = 0.45; return `<path d="M${x1} ${y1} L${x2 - Math.cos(a) * 16} ${y2 - Math.sin(a) * 16}" stroke="${m}" stroke-width="6" fill="none"/><path d="M${x2} ${y2} L${x2 - L * Math.cos(a - b)} ${y2 - L * Math.sin(a - b)} L${x2 - L * Math.cos(a + b)} ${y2 - L * Math.sin(a + b)} Z" fill="${m}"/>`; };
  sec(6, "noi-dung", "sang", dau(6, "Điều 1, 2, 8 · Chủ thể", "Một hợp đồng, năm vai", "Người đóng phí, người được bảo vệ, người nhận tiền có thể là ba người khác nhau.")
    + lop(mui(360, 490, 830, 490, P.navy) + mui(1090, 490, 1560, 490, P.navy) + mui(860, 660, 640, 692, P.navy3) + mui(1060, 660, 1300, 692, P.navy3), 340, 460, 1240, 270, "Sơ đồ: bên mua đóng phí cho Bảo Việt; Bảo Việt bảo vệ người được bảo hiểm và trả tiền cho người thụ hưởng hoặc người chỉ định", A("wipe", 1400, 800))
    + lop(`<rect x="840" y="380" width="240" height="220" fill="${P.navy}"/>` + icon("building", 960, 470, 110, P.trang, 3) + `<rect x="840" y="560" width="240" height="40" fill="${P.cam}"/>`, 840, 380, 240, 220, "Khối Bảo Việt — doanh nghiệp bảo hiểm", A("pop", 400, 500))
    + G("vai-bv", 840, 560, 240, 40, `<span style="width:100%;text-align:center">BẢO VIỆT</span>`, A("pop", 400, 500)) + T("vai-m", 760, 610, 400, "công ty bảo hiểm", A("fade", 600, 400))
    + V.map(([ten, vai, x, y, c, m], k) => { const t0 = 700 + k * 250;
      return lop(`<rect x="${x}" y="${y}" width="${c}" height="${c}" fill="${m}"/>` + nguoi(x + c / 2, y + c - 10, c * 0.7, P.cam), x, y, c, c, `Hình người: ${ten}`, `data-lap ${A("pop", t0, 400)}`)
        + `<div class="cap" style="left:${x + c / 2 - 220}px;top:${y + c + 14}px;width:440px"><b data-t class="vai-t" ${A("fade", t0 + 100, 400)}>${esc(ten)}</b><span data-t class="vai-m" ${A("fade", t0 + 200, 400)}>${esc(vai)}</span></div>`; }).join("")
    + T("nhan-mui", 480, 440, 300, "đóng phí", A("fade", 1700, 300)) + T("nhan-mui", 1200, 440, 300, "bảo vệ", A("fade", 1800, 300))
    + nguon("Điều 1, 2, 8 hợp đồng An Gia."), "data-hero");
}

// ===== 9 · THỜI GIAN CHỜ (panel chia đôi) =====
{ const CHO = [["Tai nạn", 0], ["Bệnh thông thường, điều trị răng", 30], ["Biến chứng thai sản", 90], ["Viêm phổi, phế quản ở trẻ ≤ 6 tuổi", 180], ["Bệnh có sẵn, đặc biệt, dây chằng, sụn chêm", 365], ["Sinh con (Bảo hiểm Thai sản)", 635]];
  const x0 = 780, W = 1020, sc = W / 640, y0 = 160, hr = 128;
  sec(9, "chia", "chia", panTrai(9, "Điều 5 · Thời gian chờ", "635", "ngày chờ sinh con — gần 21 tháng", "Ký xong chưa được trả ngay")
    + CHO.map(([t, d], k) => { const y = y0 + k * hr, w = Math.max(d * sc, 10), sinh = k === 5;
      return T(`cho${sinh ? " cam" : ""}`, x0, y, 760, t, A("fade", 700 + k * 200, 300)) + T(`cho-so${sinh ? " cam" : ""}`, x0 + W - 260, y, 260, d ? `${d} ngày` : "không chờ", A("fade", 900 + k * 200, 300))
        + lop(`<rect x="${x0}" y="${y + 52}" width="${W}" height="40" fill="${P.nen}"/>${d ? `<rect x="${x0}" y="${y + 52}" width="${w}" height="40" fill="${sinh ? P.cam : P.navy}"/>` : ""}`, x0, y + 52, W, 40, `Thanh ${t}: ${d} ngày`, A("wipe", 700 + k * 200, 600)); }).join("")
    + T("ghi", 780, 940, 1020, "Tái tục liên tục: không chờ lại, trừ phần nâng thêm.", A("fade", 2200, 400))
    + `<div class="nguon" data-t style="left:780px;top:1004px;width:1020px">Điều 5 hợp đồng; Quy tắc An Gia (QĐ 6029/QĐ-BHBV), quyền lợi Thai sản.</div>`, "data-hero");
}

// ===== 12 · TRÍCH ĐIỀU 26 =====
{ const TRICH = "Doanh nghiệp bảo hiểm … hoặc bên mua bảo hiểm có quyền [đơn phương chấm dứt thực hiện] hợp đồng bảo hiểm … : Bên mua bảo hiểm không đóng phí bảo hiểm hoặc không đóng đủ phí bảo hiểm theo thời hạn thỏa thuận hoặc sau thời gian gia hạn đóng phí";
  sec(12, "trich", "chia", K(0, 0, 1000, 1080, "pan-navy", "Panel màu chủ bên trái", A("fade", 0, 400))
    + T("kk sang", 120, 60, 800, "Đối chiếu luật ✚", A("fade", 0, 400)) + T("so", 1500, 64, 300, `12 / ${TONG}`) + H("td sang", 116, 116, 820, "Luật gọi là đơn phương chấm dứt", A("rise", 100, 600))
    + lop([0, 64].map((d) => `<circle cx="${138 + d}" cy="440" r="24" fill="${P.cam}"/><path d="M${114 + d} 440 Q${110 + d} 394 ${150 + d} 376 L${154 + d} 388 Q${130 + d} 400 ${136 + d} 430 Z" fill="${P.cam}"/>`).join(""), 100, 366, 150, 100, "Dấu ngoặc kép", A("pop", 400, 400))
    + T("trich", 120, 500, 800, TRICH, A("fade", 600, 800)) + T("trich-cc", 120, 975, 800, "Điều 26 (đoạn mở đầu, khoản 1) · Luật KDBH 08/2022/QH15", A("fade", 1000, 400))
    + [["01", "Hủy bỏ", "chữ của hợp đồng (Điều 4)", "Mất hiệu lực từ lúc giao kết", "khoản 1 Điều 427 BLDS 2015"], ["02", "Đơn phương chấm dứt", "chữ của Luật KDBH", "Chấm dứt từ khi bên kia nhận thông báo", "khoản 3 Điều 428 BLDS 2015"]].map(([so, a, b, c, d], k) => { const y = 150 + k * 450, t0 = 1300 + k * 400;
      return K(1080, y, 720, 390, "the", `Thẻ ${a}`, A("rise", t0, 500)) + K(1080, y, 12, 390, k ? "vach-doc navy" : "vach-doc", "Vạch màu", A("rise", t0, 500))
        + T(`the-so${k ? "" : " cam"}`, 1130, y + 30, 200, so, A("fade", t0 + 100, 300)) + T("the-t", 1260, y + 44, 520, a, A("fade", t0 + 100, 300)) + T("the-ai", 1260, y + 112, 520, b, A("fade", t0 + 150, 300))
        + T("the-m", 1130, y + 190, 640, c, A("fade", t0 + 200, 400)) + T("the-cc", 1130, y + 320, 640, d, A("fade", t0 + 250, 300)); }).join(""), "data-khong-hinh");
}

// ===== 18 · TỔNG PHÍ (nền tối) =====
{ const PHI = [["2018", 133.7, "+24,0"], ["2019", 160.2, "+21,0"], ["2020", 184.7, "+15,0"], ["2021", 216.0, "+16,1"], ["2022", 251.3, "+15,1"], ["2023", 227.1, "−8,0"], ["2024", 227.5, "−0,3"], ["2025", 237.2, "+4,0"]];
  const yb = 860, sc = 440 / 251.3, x0 = 170, st = 205, w = 150;
  sec(18, "so-lon", "toi", dau(18, "Bảng 1 · Hình 1", "2025 vẫn dưới đỉnh 2022", "Tổng doanh thu phí bảo hiểm, nghìn tỷ đồng — tăng nóng, giảm lần đầu năm 2023, phục hồi chậm.", true)
    + lop(`<path d="M140 ${yb - 251.3 * sc} H1800" stroke="${P.cam}" stroke-width="3" stroke-dasharray="12 8"/>` + PHI.map(([nm, v], k) => `<rect x="${x0 + k * st}" y="${yb - v * sc}" width="${w}" height="${v * sc}" fill="${k === 4 ? P.cam : P.navy3}"/>`).join("") + `<path d="M140 ${yb} H1800" stroke="${P.trang}" stroke-width="3"/>`, 130, 380, 1680, 490, "Biểu đồ cột tổng phí 2018–2025; cột 2022 cam là đỉnh, vạch đứt mức đỉnh", A("wipe", 500, 1200))
    + PHI.map(([nm, v, g], k) => G("cot-so trang", x0 + k * st, yb - v * sc + 6, w, 60, `<span style="width:100%;text-align:center">${String(v).replace(".", ",")}</span>`, A("fade", 1200 + k * 100, 300))
      + T("cot-nam", x0 + k * st - 25, yb + 14, w + 50, nm, A("fade", 600, 300)) + T(`cot-g${g.startsWith("−") ? " cam" : ""}`, x0 + k * st - 25, yb + 60, w + 50, `${g} %`, A("fade", 1200 + k * 100, 300))).join("")
    + T("dinh", 1500, 330, 300, "đỉnh 2022", A("fade", 2200, 300))
    + nguon("Bộ Tài chính / Cục QLGSBH, số ước tính (TLTK 5–11 của bài nhóm). % theo số công bố, so với số đã điều chỉnh của năm trước.", true), "data-hero");
}

// ===== 20 · 2023 SỐ LỚN (chia) =====
sec(20, "so-lon", "chia", panTrai(20, "2023", "−44,5 %", "phí khai thác mới bảo hiểm nhân thọ", "Phí mới nhân thọ giảm gần một nửa")
  + T("so-vua", 780, 150, 1000, "−43,8 %", A("pop", 700, 500)) + T("so-vua-m", 784, 270, 1000, "số hợp đồng nhân thọ khai thác mới", A("fade", 900, 400))
  + lop(`<path d="M800 440 V800" stroke="${P.ke}" stroke-width="4"/><rect x="788" y="452" width="24" height="24" fill="${P.cam}"/><rect x="788" y="652" width="24" height="24" fill="${P.cam}"/>`, 780, 430, 40, 380, "Trục hai mốc năm 2023", A("wipe", 1100, 600))
  + [["01/01/2023", "Luật KDBH 2022 có hiệu lực", 440], ["30/6/2023", "Kết luận thanh tra Prudential, MB Ageas, Sun Life, BIDV MetLife", 640]].map(([d, m, y], k) => `<div class="cap" style="left:850px;top:${y}px;width:950px"><b data-t class="moc-t" ${A("fade", 1300 + k * 300, 400)}>${esc(d)}</b><span data-t class="moc-m" ${A("fade", 1400 + k * 300, 400)}>${esc(m)}</span></div>`).join("")
  + K(780, 860, 1020, 100, "dai-cam", "Dải cam chi trả", A("rise", 2000, 400)) + G("dai-cam-t", 810, 860, 960, 100, "Cùng năm: chi trả quyền lợi +31,14 % (theo số công bố)", A("fade", 2100, 400))
  + `<div class="nguon" data-t style="left:780px;top:1004px;width:1020px">TLTK 1, 10, 14, 15 của bài nhóm.</div>`, "data-khong-hinh");

// ============ STYLE ============
ghi(path.join(D, "style.css"), `section.s{background:${P.trang};color:${P.navy}}section.s.toi{background:${P.navy}}section.s > div,section.s > h1{position:absolute}[data-t]{text-wrap:pretty}h1{text-wrap:balance}
em{font-style:normal;color:${P.cam}}.giua{display:flex;align-items:center}
.kk{font:700 32px/1 'Be Vietnam Pro';letter-spacing:.1em;text-transform:uppercase;color:${P.cam0}}.kk.sang{color:${P.cam4}}
.so{font:600 24px/1 'Be Vietnam Pro';color:${P.phu};text-align:right}.so.sang{color:${P.ke}}
.td{font:400 80px/1.12 'Anton';text-transform:uppercase;color:${P.navy}}.td.sang{color:${P.trang}}
.dan{font:400 34px/1.4 'Be Vietnam Pro';color:${P.phu}}.dan.sang{color:${P.ke}}.vach-cam{background:${P.cam}}
.nguon{font:400 26px/1.35 'Be Vietnam Pro';color:${P.phu}}.nguon.sang{color:${P.ke}}
.bia{font:400 132px/1.04 'Anton';text-transform:uppercase;color:${P.navy}}.bia-m{font:500 36px/1.4 'Be Vietnam Pro';color:${P.phu}}.bia-by{font:600 30px/1.4 'Be Vietnam Pro';color:${P.navy}}
.mp-so{font:400 320px/1 'Anton';color:${P.cam}}.mp-t{font:400 96px/1.08 'Anton';text-transform:uppercase;color:${P.trang}}.mp-m{font:400 34px/1.45 'Be Vietnam Pro';color:${P.ke}}
.mp-chip{font:700 30px/1 'Be Vietnam Pro';color:${P.trang};border-top:4px solid ${P.cam};padding-top:14px}
.so-lon-p{font:400 124px/1.1 'Anton';color:${P.cam};white-space:nowrap}.so-lon-m{font:600 32px/1.3 'Be Vietnam Pro';color:${P.trang}}
.bh{background:${P.navy}}.bh-t{font:700 30px/1.2 'Be Vietnam Pro';color:${P.trang}}
.hang{background:${P.trang};border-bottom:2px solid ${P.ke}}.hang.le{background:${P.nen}}.hang.nhan{background:${P.cam4}}
.o-dau{font:400 36px/1 'Anton';color:${P.navy}}.o-chu{font:500 30px/1.2 'Be Vietnam Pro';color:${P.navy}}.o-chu.dam{font-weight:800;color:${P.navy}}
.cap > b,.cap > span{display:block}.cap > span{margin-top:6px}
.vai-t{font:800 32px/1.25 'Be Vietnam Pro';color:${P.navy};text-align:center}.vai-m{font:400 30px/1.3 'Be Vietnam Pro';color:${P.phu};text-align:center}
.vai-bv{font:400 30px/1 'Anton';letter-spacing:.06em;color:${P.trang}}.nhan-mui{font:800 30px/1 'Be Vietnam Pro';color:${P.navy};text-align:center}
.cho{font:600 32px/1.3 'Be Vietnam Pro';color:${P.navy}}.cho.cam{color:${P.cam0};font-weight:800}.cho-so{font:400 40px/1.1 'Anton';color:${P.navy};text-align:right}.cho-so.cam{color:${P.cam}}
.ghi{font:600 30px/1.35 'Be Vietnam Pro';color:${P.navy}}
.trich{font:500 36px/1.5 'Be Vietnam Pro';color:${P.trang}}.trich em{color:${P.cam};font-weight:800}.trich-cc{font:700 28px/1.3 'Be Vietnam Pro';color:${P.ke}}
.the{background:${P.nen}}.vach-doc{background:${P.cam}}.vach-doc.navy{background:${P.navy}}
.the-so{font:400 96px/1 'Anton';color:${P.navy}}.the-so.cam{color:${P.cam}}.the-t{font:400 52px/1.05 'Anton';text-transform:uppercase;color:${P.navy}}.the-ai{font:600 28px/1.2 'Be Vietnam Pro';color:${P.phu}}
.the-m{font:700 38px/1.3 'Be Vietnam Pro';color:${P.navy}}.the-cc{font:600 28px/1.2 'Be Vietnam Pro';color:${P.phu}}
.cot-so{font:400 42px/1 'Anton'}.cot-so.trang{color:${P.trang}}.cot-so.toi{color:${P.navy}}.cot-nam{font:700 32px/1.2 'Be Vietnam Pro';color:${P.trang};text-align:center}
.cot-g{font:700 32px/1.2 'Be Vietnam Pro';color:${P.ke};text-align:center}.cot-g.cam{color:${P.cam4}}.dinh{font:700 32px/1 'Be Vietnam Pro';color:${P.cam4};text-align:right}.pan-navy{background:${P.navy}}
.so-vua{font:400 96px/1 'Anton';color:${P.navy}}.so-vua-m{font:600 34px/1.3 'Be Vietnam Pro';color:${P.phu}}
.moc-t{font:400 44px/1.1 'Anton';color:${P.cam}}.moc-m{font:500 32px/1.35 'Be Vietnam Pro';color:${P.navy}}
.dai-cam{background:${P.cam}}.dai-cam-t{font:800 34px/1.2 'Be Vietnam Pro';color:${P.trang}}
`);
fs.rmSync(path.join(D, "slides"), { recursive: true, force: true });
S.sort((a, b) => a.k - b.k).forEach((s) => ghi(path.join(D, "slides", `${String(s.k).padStart(2, "0")}.html`), s.html));
fs.writeFileSync(path.join(D, "thiet-ke", "phong-cach.json"), JSON.stringify({ ten: "báo cáo đậm — navy, cam san hô, Anton", huong: "Hướng 3 (C1, 20/11/2026): navy #14294A + trắng, một màu nhấn cam san hô; tiêu đề Anton in hoa ngắn + câu dẫn Be Vietnam Pro; panel chia đôi; số lớn; ảnh tròn đen trắng; lưới chấm; khối vuông không bo, không bóng, không gradient.", gradient: false, bongMo: false,
  bangMau: Object.values(P), loaiHinh: ["phang", "nen", "anh-chup"], boCuc: ["bia", "mo-phan", "noi-dung", "chia", "so-lon", "bang", "trich", "so-sanh", "ket"], tieuDeCoDinh: ["noi-dung", "bang"],
  nguong: { loaiNenToiThieu: 2, tiLeNenToiDa: 0.85, lienToiDa: 6, lienHoToiDa: 6, assetToiDa: 4, bangXetTiLe: 99, tieuDiemToiThieu: 0.15 } }, null, 2));
console.log(`${S.length} slide mẫu (C2): ${S.map((s) => s.k).join(", ")}`);
