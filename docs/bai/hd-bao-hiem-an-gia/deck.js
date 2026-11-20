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
  + H(`td${toi ? " sang" : ""}`, 120, 116, 1500, td, A("rise", 100, 600)) + T(`dan${toi ? " sang" : ""}`, 120, 236, 1640, dan, A("fade", 300, 500))
  + K(120, 302, 96, 8, "vach-cam", "Vạch cam dưới tiêu đề", A("wipe", 400, 400));
// chia (panel navy trái 660 px): số lớn + tiêu đề trong panel; nội dung bên phải 780–1800
const panTrai = (k, kk, so, soM, td) => K(0, 0, 660, 1080, "pan-navy", "Panel màu chủ bên trái", A("fade", 0, 400))
  + T("kk sang", 120, 60, 500, kk, A("fade", 0, 400)) + H("td sang", 119, 116, 480, td, A("rise", 100, 600)) + T("so", 1500, 64, 300, `${k} / ${TONG}`)
  + K(120, 560, 96, 8, "vach-cam", "Vạch cam", A("wipe", 400, 400)) + T("so-lon-p", 120, 600, 520, so, A("pop", 500, 600)) + T("so-lon-m", 121, 760, 500, soM, A("fade", 700, 400));

// ===== 1 · BÌA =====
sec(1, "bia", "sang", nen(`<rect x="1100" y="0" width="820" height="1080" fill="${P.navy}"/>` + cham(120, 960, 10, 2, P.ke) + `<rect x="0" y="0" width="560" height="40" fill="${P.cam}"/>`)
  + anh("ky-hd-tron.png", 1180, 220, 640, 640, "Ảnh đen trắng trong khung tròn: bàn tay ký hợp đồng bảo hiểm", A("pop", 300, 800))
  + lop(`<circle cx="1500" cy="540" r="352" fill="none" stroke="${P.cam}" stroke-width="8"/>`, 1140, 180, 720, 720, "Vòng cam quanh ảnh", A("fade", 800, 500))
  + T("kk", 120, 140, 700, "Nhóm 2 · Thuyết trình", A("fade", 200, 400))
  + H("bia", 119, 210, 680, "Hợp đồng bảo hiểm thương mại", A("rise", 300, 700))
  + T("bia-m", 120, 700, 900, "và thực trạng thị trường bảo hiểm Việt Nam, 2018\u00a0–\u00a09\u00a0tháng\u00a02026", A("fade", 1000, 500))
  + T("bia-by", 120, 840, 900, "Hợp đồng mẫu: Bảo Việt An Gia · 13 điều + Phụ lục 1", A("fade", 1200, 500)));

// ===== 3 · MỞ PHẦN I =====
const HD_VE = `<rect x="1290" y="330" width="420" height="500" fill="${P.trang}"/><path d="M1630 330 L1710 410 L1630 410 Z" fill="${P.ke}"/>` + [0, 1, 2, 3, 4].map((i) => `<rect x="1340" y="${450 + i * 56}" width="${i === 0 ? 220 : 320}" height="14" fill="${i === 0 ? P.navy : P.ke}"/>`).join("") + `<rect x="1340" y="390" width="160" height="22" fill="${P.cam}"/><circle cx="1680" cy="790" r="70" fill="${P.cam}"/>` + icon("eye", 1680, 790, 80, P.trang, 4);
const moPhan = (k, so, ten, mo, chips, alt, ve = HD_VE) => sec(k, "mo-phan", "toi", nen(cham(120, 84, 10, 3, P.navy2) + `<circle cx="1500" cy="560" r="330" fill="${P.navy2}"/>`)
  + T("mp-so", 114, 170, 600, so, A("pop", 200, 700)) + H("mp-t", 119, 520, 900, ten, A("rise", 500, 600)) + T("mp-m", 120, 760, 860, mo, A("fade", 800, 500))
  + chips.map((c, i) => T("mp-chip", 120 + i * 240, 900, 220, c, A("rise", 1000 + i * 120, 400))).join("")
  + lop(ve, 1170, 230, 660, 660, alt, A("pop", 400, 800)));
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
  const V = [["Bên mua bảo hiểm", "giao kết, đóng phí", 170, 400, 180, P.navy], ["Người được bảo hiểm", "sức khỏe, tính mạng", 1570, 400, 180, P.navy], ["Người thụ hưởng", "nhận tiền khi NĐBH tử vong", 520, 700, 140, P.navy3], ["Người chỉ định nhận tiền", "nhận thay tiền bồi thường", 1260, 700, 140, P.navy3]];
  const mui = (x1, y1, x2, y2, m) => { const a = Math.atan2(y2 - y1, x2 - x1), L = 24, b = 0.45; return `<path d="M${x1} ${y1} L${x2 - Math.cos(a) * 16} ${y2 - Math.sin(a) * 16}" stroke="${m}" stroke-width="6" fill="none"/><path d="M${x2} ${y2} L${x2 - L * Math.cos(a - b)} ${y2 - L * Math.sin(a - b)} L${x2 - L * Math.cos(a + b)} ${y2 - L * Math.sin(a + b)} Z" fill="${m}"/>`; };
  sec(6, "noi-dung", "sang", dau(6, "Điều 1, 2, 8 · Chủ thể", "Một hợp đồng, năm vai", "Người đóng phí, người được bảo vệ, người nhận tiền có thể là ba người khác nhau.")
    + lop(mui(360, 490, 830, 490, P.navy) + mui(1090, 490, 1560, 490, P.navy) + mui(860, 660, 640, 692, P.navy3) + mui(1060, 660, 1300, 692, P.navy3), 340, 460, 1240, 270, "Sơ đồ: bên mua đóng phí cho Bảo Việt; Bảo Việt bảo vệ người được bảo hiểm và trả tiền cho người thụ hưởng hoặc người chỉ định", A("wipe", 1400, 800))
    + lop(`<rect x="840" y="380" width="240" height="220" fill="${P.navy}"/>` + icon("building", 960, 470, 110, P.trang, 3) + `<rect x="840" y="560" width="240" height="40" fill="${P.cam0}"/>`, 840, 380, 240, 220, "Khối Bảo Việt — doanh nghiệp bảo hiểm", A("pop", 400, 500))
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
  sec(9, "chia", "chia", panTrai(9, "Điều 5 · Thời gian chờ", "635", "ngày chờ sinh con (gần 21 tháng)", "Ký xong chưa được trả ngay")
    + CHO.map(([t, d], k) => { const y = y0 + k * hr, w = Math.max(d * sc, 10), sinh = k === 5;
      return T(`cho${sinh ? " cam" : ""}`, x0, y, 760, t, A("fade", 700 + k * 200, 300)) + T(`cho-so${sinh ? " cam" : ""}`, x0 + W - 260, y, 260, d ? `${d} ngày` : "không chờ", A("fade", 900 + k * 200, 300))
        + lop(`<rect x="${x0}" y="${y + 52}" width="${W}" height="40" fill="${P.nen}"/>${d ? `<rect x="${x0}" y="${y + 52}" width="${w}" height="40" fill="${sinh ? P.cam : P.navy}"/>` : ""}`, x0, y + 52, W, 40, `Thanh ${t}: ${d} ngày`, A("wipe", 700 + k * 200, 600)); }).join("")
    + T("ghi", 780, 940, 1020, "Tái tục liên tục: không chờ lại, trừ phần nâng thêm.", A("fade", 2200, 400))
    + `<div class="nguon" data-t style="left:780px;top:1004px;width:1020px">Điều 5 hợp đồng; Quy tắc An Gia (QĐ 6029/QĐ-BHBV), quyền lợi Thai sản.</div>`, "data-hero");
}

// ===== 12 · TRÍCH ĐIỀU 26 =====
{ const TRICH = "Doanh nghiệp bảo hiểm … hoặc bên mua bảo hiểm có quyền [đơn phương chấm dứt thực hiện] hợp đồng bảo hiểm … : Bên mua bảo hiểm không đóng phí bảo hiểm hoặc không đóng đủ phí bảo hiểm theo thời hạn thỏa thuận hoặc sau thời gian gia hạn đóng phí";
  sec(12, "trich", "chia", K(0, 0, 1000, 1080, "pan-navy", "Panel màu chủ bên trái", A("fade", 0, 400))
    + T("kk sang", 120, 60, 800, "Đối chiếu luật ✚", A("fade", 0, 400)) + T("so", 1500, 64, 300, `12 / ${TONG}`) + H("td sang", 119, 116, 820, "Luật gọi là đơn phương chấm dứt", A("rise", 100, 600))
    + lop([0, 64].map((d) => `<circle cx="${138 + d}" cy="440" r="24" fill="${P.cam}"/><path d="M${114 + d} 440 Q${110 + d} 394 ${150 + d} 376 L${154 + d} 388 Q${130 + d} 400 ${136 + d} 430 Z" fill="${P.cam}"/>`).join(""), 100, 366, 150, 100, "Dấu ngoặc kép", A("pop", 400, 400))
    + T("trich", 120, 500, 800, TRICH, A("fade", 600, 800)) + T("trich-cc", 120, 975, 800, "Điều 26 (mở đầu, khoản 1) · Luật KDBH 08/2022", A("fade", 1000, 400))
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
    + nguon("TLTK 5–11 của bài nhóm (số ước tính của cơ quan quản lý). % theo số công bố, so với số đã điều chỉnh của năm trước.", true), "data-hero");
}

// ===== 20 · 2023 SỐ LỚN (chia) =====
sec(20, "so-lon", "chia", panTrai(20, "2023", "−44,5 %", "phí khai thác mới bảo hiểm nhân thọ", "Phí mới nhân thọ giảm gần một nửa")
  + T("so-vua", 780, 150, 1000, "−43,8 %", A("pop", 700, 500)) + T("so-vua-m", 780, 236, 1000, "số hợp đồng nhân thọ khai thác mới", A("fade", 900, 400))
  + lop(`<path d="M800 440 V800" stroke="${P.ke}" stroke-width="4"/><rect x="788" y="452" width="24" height="24" fill="${P.cam}"/><rect x="788" y="652" width="24" height="24" fill="${P.cam}"/>`, 780, 430, 40, 380, "Trục hai mốc năm 2023", A("wipe", 1100, 600))
  + [["01/01/2023", "Luật KDBH 2022 có hiệu lực", 440], ["30/6/2023", "Kết luận thanh tra Prudential, MB Ageas, Sun Life, BIDV MetLife", 640]].map(([d, m, y], k) => `<div class="cap" style="left:850px;top:${y}px;width:950px"><b data-t class="moc-t" ${A("fade", 1300 + k * 300, 400)}>${esc(d)}</b><span data-t class="moc-m" ${A("fade", 1400 + k * 300, 400)}>${esc(m)}</span></div>`).join("")
  + K(780, 860, 1020, 100, "dai-cam", "Dải cam chi trả", A("rise", 2000, 400)) + G("dai-cam-t", 810, 860, 960, 100, "Cùng năm: chi trả quyền lợi +31,14 % (theo số công bố)", A("fade", 2100, 400))
  + `<div class="nguon" data-t style="left:780px;top:1004px;width:1020px">TLTK 1, 10, 14, 15 của bài nhóm.</div>`, "data-khong-hinh");

// ===================== CÁC SLIDE CÒN LẠI (đổ vào bố cục mẫu đã duyệt ở C2) =====================
const vuong = (x, y, c, m, ten, net = P.trang) => `<rect x="${x}" y="${y}" width="${c}" height="${c}" fill="${m}"/>` + icon(ten, x + c / 2, y + c / 2, c * 0.56, net, 3);
const muiN = (x1, y1, x2, y2, m, w = 6) => { const a = Math.atan2(y2 - y1, x2 - x1), L = 24, b = 0.45; return `<path d="M${x1} ${y1} L${x2 - Math.cos(a) * 16} ${y2 - Math.sin(a) * 16}" stroke="${m}" stroke-width="${w}" fill="none"/><path d="M${x2} ${y2} L${x2 - L * Math.cos(a - b)} ${y2 - L * Math.sin(a - b)} L${x2 - L * Math.cos(a + b)} ${y2 - L * Math.sin(a + b)} Z" fill="${m}"/>`; };

// ===== 2 · LỘ TRÌNH =====
sec(2, "noi-dung", "sang", dau(2, "Lộ trình", "Từ một hợp đồng đến cả thị trường", "Phần I đọc hợp đồng như người mua; phần II xem hậu quả khi khâu tư vấn hợp đồng làm sai.")
  + [["01", "Mổ xẻ một hợp đồng thật", "Bảo Việt An Gia: đủ chuẩn luật, nhưng 5 điều khoản cần soi kỹ", ["13 điều", "Phụ lục 1", "5 điều khoản"], true], ["02", "Thị trường 2018 – 9 tháng 2026", "Tăng nóng, khủng hoảng năm 2023, phục hồi nhờ phi nhân thọ", ["Tăng nóng", "2023", "Phục hồi"], false]].map(([so, t, m, ch, toi], k) => { const x = 120 + k * 880, t0 = 500 + k * 500;
    return K(x, 350, 800, 600, toi ? "pan-navy" : "the", `Khối phần ${so}`, A("rise", t0, 500)) + K(x, 350, 800, 12, "vach-cam", "Vạch cam", A("rise", t0, 500))
      + T(`khoi-so${toi ? "" : " navy"}`, x + 48, 400, 300, so, A("pop", t0 + 100, 400)) + T(`khoi-t${toi ? " sang" : ""}`, x + 48, 580, 700, t, A("fade", t0 + 200, 400)) + T(`khoi-m${toi ? " sang" : ""}`, x + 48, 680, 700, m, A("fade", t0 + 300, 400))
      + ch.map((c, j) => T(`khoi-chip${toi ? " sang" : ""}`, x + 48 + j * 230, 860, 210, c, A("rise", t0 + 400 + j * 100, 300))).join(""); }).join("")
  + lop(muiN(925, 650, 995, 650, P.cam, 8), 915, 620, 90, 60, "Mũi tên từ phần 01 sang phần 02", A("wipe", 1500, 400)), "data-khong-hinh");

// ===== 5 · BỘ HỢP ĐỒNG =====
{ const TL = ["Giấy yêu cầu bảo hiểm", "Hợp đồng bảo hiểm", "Phụ lục 1 · Bảng quyền lợi", "Sửa đổi bổ sung (nếu có)", "Quy tắc Bảo Việt An Gia"];
  const B = [["1", "Sửa đổi bổ sung mới nhất", 460, P.cam], ["2", "Hợp đồng + phụ lục", 340, P.navy], ["3", "Quy tắc bảo hiểm", 220, P.navy3]];
  sec(5, "noi-dung", "sang", dau(5, "Điều 12 · Bộ hợp đồng", "Năm tài liệu, mới nhất thắng", "Khi các tài liệu mâu thuẫn, sửa đổi bổ sung ký sau cùng được áp dụng trước, Quy tắc đứng cuối.")
    + TL.map((s, k) => { const y = 350 + k * 120, t0 = 400 + k * 150;
      return K(120, y, 760, 100, "the", `Tài liệu ${s}`, A("rise", t0, 400)) + lop(vuong(120, y, 100, k === 3 ? P.cam : P.navy, "file-certificate"), 120, y, 100, 100, "Biểu tượng tài liệu", `data-lap ${A("pop", t0, 300)}`) + G("tl-t", 250, y, 610, 100, esc(s), A("fade", t0 + 100, 300)); }).join("")
    + K(960, 330, 860, 660, "the", "Khối nền thứ tự ưu tiên", A("fade", 1100, 400)) + T("cot-nhan", 1000, 350, 800, "Khi mâu thuẫn, áp dụng theo thứ tự", A("fade", 1200, 400))
    + B.map(([so, ten, h, m], k) => { const x = 1000 + k * 280, yb = 900, t0 = 1400 + k * 300;
      return lop(`<rect x="${x}" y="${yb - h}" width="240" height="${h}" fill="${m}"/>`, x, yb - h, 240, h, `Bậc ${so}: ${ten}`, A("grow", t0, 500)) + T("bac-so", x, yb - h + 24, 240, so, A("fade", t0 + 200, 300)) + T("bac-t", x, yb + 16, 250, ten, A("fade", t0 + 250, 300)); }).join("")
    + nguon("Điều 12 hợp đồng An Gia (theo Quy tắc ban hành kèm Quyết định 6029/QĐ-BHBV ngày 27/6/2025)."));
}

// ===== 7 · NĂM GÓI =====
{ const Gi = [["Đồng", 94, "2"], ["Bạc", 138, "3"], ["Vàng", 230, "5"], ["Bạch kim", 342, "7,5"], ["Kim cương", 454, "10"]], x0 = 380, W = 1000;
  sec(7, "noi-dung", "sang", dau(7, "Phụ lục 1 · Quyền lợi", "Năm gói, 94 đến 454 triệu", "Hạn mức chính mỗi người mỗi năm chênh gần 5 lần; chỉ trong lãnh thổ Việt Nam.")
    + K(100, 330, 1720, 660, "the", "Khối nền biểu đồ", A("fade", 200, 400)) + T("cot-nhan", x0, 340, 900, "Hạn mức quyền lợi chính · triệu đồng/người/năm", A("fade", 300, 300)) + T("cot-nhan phai", 1500, 340, 300, "Nằm viện/ngày", A("fade", 300, 300))
    + Gi.map(([ten, v, nv], k) => { const y = 410 + k * 112, w = Math.round((v / 454) * W), t0 = 500 + k * 200, cuoi = k === 4;
      return G("goi-t", 120, y, 240, 80, esc(ten), A("rise", t0, 300)) + lop(`<rect x="${x0}" y="${y + 6}" width="${W}" height="68" fill="${P.trang}"/><rect x="${x0}" y="${y + 6}" width="${w}" height="68" fill="${cuoi ? P.cam : P.navy}"/>`, x0, y + 6, W, 68, `Thanh ${ten}: ${v} triệu`, A("wipe", t0, 600))
        + G("goi-so", x0 + w - 170, y + 6, 150, 68, `<span style="width:100%;text-align:right">${v}</span>`, A("fade", t0 + 400, 300)) + G("goi-nv", 1500, y, 300, 80, `<span style="width:100%;text-align:right">${esc(nv)} triệu</span>`, A("fade", t0 + 400, 300)); }).join("")
    + nguon("Phụ lục 1 hợp đồng An Gia. Nằm viện tối đa 60 ngày/năm; phẫu thuật 40 – 200 triệu/năm theo gói."));
}

// ===== 8 · CHÍNH vs BỔ SUNG =====
{ const CH = ["Nằm viện ≤ 60 ngày/năm", "Khám 30 ngày trước nhập viện", "Tái khám 30 ngày sau xuất viện", "Xe cứu thương", "Phẫu thuật", "Phục hồi chức năng", "Trợ cấp nằm viện công", "Mai táng phí 1 triệu/vụ"];
  const BS = [["stethoscope", "Ngoại trú"], ["alert-triangle", "Tai nạn cá nhân"], ["heart", "Sinh mạng cá nhân"], ["dental", "Nha khoa"], ["baby-carriage", "Thai sản · từ gói Bạc"]];
  sec(8, "so-sanh", "sang", dau(8, "Điều 2 · Phụ lục 1", "Gói chính chỉ trả khi nằm viện", "Khám ngoại trú, nha khoa, thai sản là quyền lợi bổ sung, phải chọn mua thêm.")
    + K(120, 340, 940, 640, "the", "Khối quyền lợi chính", A("rise", 400, 500)) + lop(vuong(160, 370, 90, P.navy, "bed"), 160, 370, 90, 90, "Biểu tượng giường bệnh", A("pop", 500, 300)) + T("khoi-t", 280, 384, 760, "Chính · nội trú", A("fade", 500, 400))
    + CH.map((s, k) => { const c = k % 2, r = Math.floor(k / 2), x = 160 + c * 450, y = 510 + r * 110, t0 = 700 + k * 90;
      return K(x, y + 14, 14, 14, "o-cam", "Ô đầu dòng", A("fade", t0, 300)) + T("ds-t", x + 34, y, 400, s, A("fade", t0, 300)); }).join("")
    + K(1120, 340, 680, 640, "pan-navy", "Khối quyền lợi bổ sung", A("rise", 1300, 500)) + T("kk sang", 1160, 370, 600, "Bổ sung · mua thêm", A("fade", 1400, 300))
    + BS.map(([i, s], k) => { const y = 430 + k * 106, t0 = 1500 + k * 150;
      return lop(vuong(1160, y, 76, k === 4 ? P.cam : P.navy2, i), 1160, y, 76, 76, `Biểu tượng ${s}`, A("slide-r", t0, 400)) + G("bs-t", 1260, y, 520, 76, esc(s), A("slide-r", t0, 400)); }).join("")
    + nguon("Điều 2, Phụ lục 1 hợp đồng An Gia. Gói Đồng: quyền lợi thai sản “Không”."));
}

// ===== 10 · ĐỒNG CHI TRẢ =====
{ const W = 1140, x0 = 660;
  sec(10, "noi-dung", "sang", dau(10, "Phụ lục 1 · mục 2", "Trẻ dưới 3 tuổi: trả 70 %", "Trẻ từ 15 ngày đến 3 tuổi điều trị ở cơ sở tư thì gia đình tự trả 30 % chi phí.")
    + K(100, 330, 1720, 560, "the", "Khối nền ví dụ", A("fade", 200, 400)) + T("kk", x0, 350, 900, "Ví dụ minh hoạ · hóa đơn 10 triệu đồng", A("fade", 300, 300))
    + [["Cơ sở tư, khoa quốc tế, dịch vụ theo yêu cầu", [[0.7, P.navy, "Bảo Việt 7 triệu", "sang"], [0.3, P.cam4, "Gia đình 3 triệu", "do"]], "building"], ["Bệnh viện công, khoa điều trị thường", [[1, P.navy3, "Không áp đồng chi trả", "sang"]], "building-bank"]].map(([ten, parts, ic], k) => { const y = 430 + k * 240, t0 = 500 + k * 900; let x = x0, o = "", tx = "";
      parts.forEach(([p, c, s, cls], j) => { const w = Math.round(p * W); o += `<rect x="${x + (j ? 6 : 0)}" y="${y}" width="${w - (j ? 6 : 0)}" height="140" fill="${c}"/>`; tx += G(`ct-o ${cls}`, x + 30, y, w - 60, 140, esc(s), A("fade", t0 + 500 + j * 200, 300)); x += w; });
      return lop(vuong(120, y + 20, 100, k ? P.navy3 : P.navy, ic), 120, y + 20, 100, 100, `Biểu tượng ${ten}`, A("pop", t0, 300)) + T("ct-ten", 250, y + 18, 380, ten, A("fade", t0, 300))
        + lop(o, x0, y, W, 140, `Thanh chia hóa đơn: ${ten}`, A("wipe", t0 + 200, 600)) + tx; }).join("")
    + nguon("Phụ lục 1 mục 2 hợp đồng An Gia. Hóa đơn 10 triệu là ví dụ minh hoạ của nhóm."));
}

// ===== 11 · CHẬM PHÍ =====
{ const B = [["Ký hợp đồng", "file-certificate", P.navy], ["Hạn thanh toán", "calendar-x", P.navy], ["Chưa đóng đủ phí", "coins", P.navy3], ["Tự động hủy bỏ", "ban", P.cam]];
  sec(11, "noi-dung", "sang", dau(11, "Điều 4 · Phí bảo hiểm", "Chậm phí là mất hợp đồng", "Không đóng đủ phí đúng hạn, hợp đồng tự hủy bỏ — trừ khi có thỏa thuận khác.")
    + lop(`<path d="M240 470 H1680" stroke="${P.ke}" stroke-width="6"/>` + [0, 1, 2].map((k) => muiN(320 + k * 480, 470, 660 + k * 480, 470, k === 2 ? P.cam : P.navy)).join(""), 230, 440, 1460, 60, "Trục thời gian từ ký hợp đồng đến hủy bỏ", A("wipe", 400, 900))
    + B.map(([s, i, m], k) => { const cx = 240 + k * 480, t0 = 500 + k * 350;
      return lop(vuong(cx - 70, 400, 140, m, i), cx - 70, 400, 140, 140, `Mốc ${s}`, A("pop", t0, 400)) + T(`moc-n${k === 3 ? " cam" : ""}`, cx - 170, 560, 340, s, A("fade", t0 + 100, 300)); }).join("")
    + K(120, 680, 1680, 200, "the", "Khung trích Điều 4", A("rise", 1900, 500)) + K(120, 680, 12, 200, "vach-doc", "Vạch trích", A("rise", 1900, 500))
    + T("trich-den", 170, 712, 1590, "“Hợp đồng bảo hiểm sẽ [tự động hủy bỏ] trong trường hợp phí bảo hiểm không được thanh toán đúng và đủ theo như quy định trên trừ khi có thỏa thuận khác.”", A("fade", 2100, 600))
    + nguon("Điều 4 hợp đồng An Gia (nguyên văn)."));
}

// ===== 13 · CHẤM DỨT, GIAN LẬN =====
sec(13, "so-lon", "sang", dau(13, "Điều 6 · Chấm dứt, gian lận", "Bên mua rút: hoàn 70 % phí còn lại", "Bảo Việt chủ động chấm dứt thì phải hoàn đủ 100 %; hai bên báo trước 30 ngày bằng văn bản.")
  + [["Bên mua chấm dứt", "70 %", "phí thời gian còn lại, nếu chưa có khoản bồi thường nào được chấp nhận", true], ["Bảo Việt chấm dứt", "100 %", "phí thời gian còn lại, dù đã có khiếu nại hay chưa", false]].map(([t, so, dk, cam], k) => { const x = 120 + k * 560, t0 = 400 + k * 500;
    return K(x, 340, 520, 450, "the", `Khối ${t}`, A("rise", t0, 500)) + K(x, 340, 520, 12, cam ? "vach-cam" : "vach-navy", "Vạch màu", A("rise", t0, 500))
      + T("khoi-t", x + 36, 376, 460, t, A("fade", t0 + 100, 300)) + T(`so-khoi${cam ? " cam" : ""}`, x + 34, 440, 470, so, A("pop", t0 + 300, 500)) + T("dk-m", x + 36, 620, 450, dk, A("fade", t0 + 400, 400)); }).join("")
  + K(1260, 340, 540, 450, "pan-navy", "Khối công thức", A("rise", 1400, 500))
  + T("kk sang", 1300, 376, 470, "Phí thời gian còn lại", A("fade", 1500, 300)) + T("ct-cong", 1300, 440, 470, "Phí × ngày còn lại", A("fade", 1600, 400)) + K(1300, 518, 440, 4, "vach-cam", "Gạch phân số", A("fade", 1600, 400)) + T("ct-cong", 1300, 530, 470, "tổng số ngày", A("fade", 1600, 400))
  + T("ct-ghi", 1300, 680, 470, "Báo trước 30 ngày bằng văn bản", A("fade", 1700, 300))
  + K(120, 830, 1680, 140, "dai-cam4", "Dải cảnh báo gian lận", A("rise", 2000, 500)) + lop(vuong(150, 850, 100, P.cam, "alert-triangle"), 150, 850, 100, 100, "Biểu tượng cảnh báo", A("pop", 2100, 300))
  + T("dai-do-t", 280, 856, 1490, "Gian lận, trục lợi, sai đối tượng → [hủy ngay, mất toàn bộ quyền lợi]; chỉ hoàn 70 % phí còn lại nếu chưa từng được bồi thường.", A("fade", 2200, 400))
  + nguon("Điều 6 hợp đồng An Gia."), "data-khong-hinh");

// ===== 14 · BỒI THƯỜNG =====
{ const B = [["device-mobile", "Giấy yêu cầu trên BaoViet Direct", "xác thực OTP"], ["file-invoice", "Hóa đơn điện tử", "có đường dẫn tra cứu"], ["camera", "Ảnh chụp chứng từ y tế", "có thể bị đòi bản gốc"], ["coins", "Nhận tiền", "trong 15 ngày làm việc"]];
  sec(14, "noi-dung", "sang", dau(14, "Điều 10 · Phụ lục 1 mục 3", "Đến 10 triệu: nộp hồ sơ qua app", "Khoản bồi thường đến 10 triệu, không phải di sản thừa kế, được nộp hồ sơ mềm qua ứng dụng.")
    + K(100, 330, 1720, 440, "the", "Khối nền quy trình", A("fade", 200, 400)) + lop([0, 1, 2].map((k) => muiN(440 + k * 420, 450, 640 + k * 420, 450, P.navy3)).join(""), 430, 420, 1200, 60, "Mũi tên nối các bước", A("fade", 400, 400))
    + B.map(([i, t, m], k) => { const cx = 330 + k * 420, t0 = 500 + k * 400, cuoi = k === 3;
      return lop(vuong(cx - 90, 360, 180, cuoi ? P.cam : P.navy, i), cx - 90, 360, 180, 180, `Bước ${k + 1}: ${t}`, A("pop", t0, 400))
        + `<div class="cap" style="left:${cx - 190}px;top:570px;width:380px"><b data-t class="vai-t" ${A("fade", t0 + 100, 300)}>${esc(t)}</b><span data-t class="vai-m" ${A("fade", t0 + 200, 300)}>${esc(m)}</span></div>`; }).join("")
    + K(120, 800, 1680, 170, "the", "Khung đối chiếu Điều 31", A("rise", 2300, 500)) + K(120, 800, 12, 170, "vach-doc", "Vạch", A("rise", 2300, 500))
    + T("kk", 170, 824, 800, "Đối chiếu luật ✚", A("fade", 2400, 300)) + T("dc-t", 170, 872, 1600, "Khoản 1 Điều 31 Luật KDBH: không thỏa thuận thì trả trong [15 ngày]. An Gia thỏa thuận [15 ngày làm việc] ≈ 3 tuần.", A("fade", 2500, 400))
    + nguon("Điều 10, Phụ lục 1 mục 3 hợp đồng An Gia; khoản 1 Điều 31 Luật KDBH 08/2022/QH15."));
}

// ===== 15 · ƯU / HẠN CHẾ =====
{ const C = [["Ưu điểm", P.navy, [["Thứ tự ưu tiên văn bản rõ", 5], ["Năm mức ngân sách", 7], ["Hồ sơ online đến 10 triệu", 14], ["Trẻ nhỏ ở viện công: không đồng chi trả", 10]]], ["Hạn chế", P.cam, [["Chờ dài: bệnh có sẵn 365, sinh con 635 ngày", 9], ["Đồng chi trả 30 % ở cơ sở tư", 10], ["Tự hủy khi chậm phí", 11], ["Loại trừ nằm ở Quy tắc, không ở hợp đồng", 16]]]];
  sec(15, "so-sanh", "sang", dau(15, "Tổng kết phần I", "Minh bạch, nhưng chặt ở bốn chỗ", "Mỗi ý trỏ về slide đã phân tích; số trong ô vuông là số slide.")
    + C.map(([t, m, ds], k) => { const x = 120 + k * 870, t0 = 400 + k * 600;
      return K(x, 340, 810, 640, "the", `Khối ${t}`, A("rise", t0, 500)) + K(x, 340, 810, 110, k ? "pan-cam" : "pan-navy", `Đầu khối ${t}`, A("rise", t0, 500))
        + lop(vuong(x + 28, 357, 76, k ? P.cam0 : P.navy2, k ? "alert-triangle" : "check"), x + 28, 357, 76, 76, `Biểu tượng ${t}`, A("pop", t0 + 100, 300)) + T("khoi-t sang", x + 130, 366, 600, t, A("fade", t0 + 150, 300))
        + ds.map(([s, so], j) => { const y = 486 + j * 118, t1 = t0 + 300 + j * 150;
          return (j ? K(x + 40, y - 20, 730, 2, "vach-ke", "Vạch kẻ", A("fade", t1, 300)) : "") + T("ds-t lon", x + 40, y, 620, s, A("fade", t1, 300)) + K(x + 700, y - 4, 70, 56, k ? "o-nen cam" : "o-nen", `Ô số slide ${so}`, A("pop", t1 + 100, 300)) + G("o-so", x + 700, y - 4, 70, 56, `<span style="width:100%;text-align:center">${so}</span>`, A("pop", t1 + 100, 300)); }).join(""); }).join("")
    + nguon("Mục 3.1 bài nhóm; Điều 7 hợp đồng dẫn chiếu Chương III Quy tắc Bảo Việt An Gia."), "data-khong-hinh");
}

// ===== 16 · KHUYẾN NGHỊ =====
{ const KN = [["01", "pencil-check", "Khai thật tiền sử bệnh", "Khai sai có thể bị hủy hợp đồng, mất toàn bộ quyền lợi.", "Điều 6 HĐ · khoản 1 Điều 22 Luật KDBH ✚"], ["02", "book", "Đòi và đọc Quy tắc", "Điểm loại trừ được dẫn chiếu sang Chương III Quy tắc.", "Điều 7 HĐ"], ["03", "hourglass", "Mua sớm theo mốc chờ", "Bệnh có sẵn chờ 365 ngày, sinh con 635 ngày: mua trước khi cần.", "Điều 5 HĐ"]];
  sec(16, "noi-dung", "sang", dau(16, "Khuyến nghị", "Trước khi ký: ba việc", "Ba thói quen giúp người mua không mất quyền lợi khi cần dùng đến bảo hiểm.")
    + KN.map(([so, i, t, m, cc], k) => { const x = 120 + k * 572, t0 = 400 + k * 400;
      return K(x, 340, 536, 640, "the", `Khối khuyến nghị ${so}`, A("rise", t0, 500)) + T("kn-so", x + 36, 366, 200, so, A("rise", t0 + 100, 400)) + lop(vuong(x + 400, 370, 100, k ? P.navy : P.cam, i), x + 400, 370, 100, 100, `Biểu tượng ${t}`, A("pop", t0 + 200, 300))
        + T("khoi-t", x + 36, 510, 470, t, A("fade", t0 + 250, 300)) + T("dk-m", x + 36, 640, 470, m, A("fade", t0 + 350, 400))
        + K(x, 870, 536, 110, "pan-navy", "Dải căn cứ", A("rise", t0 + 450, 300)) + G("cc-t", x + 36, 870, 470, 110, esc(cc), A("fade", t0 + 500, 300)); }).join("")
    + nguon("Mục 3.2 bài nhóm. ✚ Căn cứ Luật KDBH do nhóm bổ sung."));
}

// ===== 17 · MỞ PHẦN II =====
moPhan(17, "02", "Thực trạng thị trường bảo hiểm", "Từ tăng trưởng nóng đến khủng hoảng và phục hồi, 2018 – 9 tháng 2026.", ["Tăng nóng", "2023", "Siết luật", "Phục hồi"], "Minh hoạ: cột doanh thu tăng dần, đỉnh 2022 tô cam rồi giảm",
  [134, 160, 185, 216, 251, 227, 228, 237].map((v, k) => { const h = v * 1.5, x = 1260 + k * 62; return `<rect x="${x}" y="${780 - h}" width="46" height="${h}" fill="${k === 4 ? P.cam : P.trang}"/>`; }).join("") + `<rect x="1240" y="780" width="520" height="6" fill="${P.trang}"/>`);

// ===== 19 · BANCASSURANCE =====
{ const B = [["2018", 20], ["2021", 40], ["2022", 45]];
  sec(19, "chia", "chia", panTrai(19, "2018 – 2022", "45 %", "phí khai thác mới nhân thọ bán qua ngân hàng (2022)", "Tăng nhờ bán qua ngân hàng")
    + T("cot-nhan", 780, 160, 1000, "Tỷ trọng bancassurance trong phí khai thác mới nhân thọ", A("fade", 600, 300))
    + B.map(([n, v], k) => { const x = 800 + k * 200, h = 480, hv = (v / 100) * h, yb = 760, t0 = 700 + k * 300;
      return lop(`<rect x="${x}" y="${yb - h}" width="150" height="${h}" fill="${P.nen}"/><rect x="${x}" y="${yb - hv}" width="150" height="${hv}" fill="${k === 2 ? P.cam : P.navy}"/>`, x, yb - h, 150, h, `Cột ${n}: ${v} %`, A("grow", t0, 600))
        + G("ba-so", x, yb - hv, 150, 70, `<span style="width:100%;text-align:center">${v} %</span>`, A("fade", t0 + 400, 300)) + T("ba-nam", x - 20, yb + 12, 190, n, A("fade", t0, 300)); }).join("")
    + [["78", "doanh nghiệp bảo hiểm"], ["811.312", "tỷ đồng tổng tài sản"]].map(([so, m], k) => { const y = 260 + k * 230, t0 = 1600 + k * 300;
      return K(1440, y, 360, 200, "the", `Khối ${so}`, A("rise", t0, 400)) + T("so-the", 1470, y + 24, 320, so, A("pop", t0 + 100, 400)) + T("so-the-m", 1470, y + 116, 320, m + " (2022)", A("fade", t0 + 200, 300)); }).join("")
    + K(780, 850, 1020, 110, "dai-cam4", "Dải thanh tra 2022", A("rise", 2300, 400)) + G("dai-do-t", 810, 850, 960, 110, "2022: Bộ Tài chính thanh tra bán bảo hiểm qua ngân hàng tại 4 doanh nghiệp", A("fade", 2400, 400))
    + `<div class="nguon" data-t style="left:780px;top:1004px;width:1020px">TLTK 9, 12, 13 của bài nhóm (PSI tổng hợp, ước tính).</div>`, "data-khong-hinh");
}

// ===== 21 · TRÍCH LUẬT TCTD =====
sec(21, "trich", "chia", K(0, 0, 1100, 1080, "pan-navy", "Panel màu chủ bên trái", A("fade", 0, 400))
  + anh("ky-hd-xam.jpg", 1100, 0, 820, 1080, "Ảnh đen trắng: bàn tay ký hợp đồng", A("fade", 300, 900))
  + T("kk sang", 120, 60, 900, "2024 · Siết luật", A("fade", 0, 400)) + T("so sang", 760, 64, 300, `21 / ${TONG}`) + H("td sang", 119, 116, 900, "Ngân hàng bị cấm gắn bán bảo hiểm", A("rise", 100, 600))
  + lop([0, 64].map((d) => `<circle cx="${138 + d}" cy="440" r="24" fill="${P.cam}"/><path d="M${114 + d} 440 Q${110 + d} 394 ${150 + d} 376 L${154 + d} 388 Q${130 + d} 400 ${136 + d} 430 Z" fill="${P.cam}"/>`).join(""), 100, 366, 150, 100, "Dấu ngoặc kép", A("pop", 400, 400))
  + T("trich", 120, 500, 900, "Tổ chức tín dụng, chi nhánh ngân hàng nước ngoài, người quản lý, người điều hành, nhân viên … [gắn việc bán sản phẩm bảo hiểm không bắt buộc] với việc cung ứng sản phẩm, dịch vụ ngân hàng dưới mọi hình thức.", A("fade", 700, 800))
  + T("trich-cc", 120, 900, 900, "Khoản 5 Điều 15 (hành vi bị nghiêm cấm) · Luật Các TCTD 32/2024/QH15 · hiệu lực 01/7/2024", A("fade", 1200, 400)), "data-hero");

// ===== 22 · BÃO YAGI =====
{ const W = 1500, sc = W / 12811, R = [["Thiệt hại ước tính", 12811, "12.811 tỷ", P.cam4, "do"], ["Tạm ứng, giữa 10/2024", 213, "213 tỷ", P.navy3, ""], ["Tạm ứng, đến 9/1/2025", 956.5, "956,5 tỷ", P.navy, ""]];
  sec(22, "noi-dung", "sang", dau(22, "2024 · Bão Yagi", "Tạm ứng mới bằng 7,5 % thiệt hại", "Bốn tháng sau bão, số tiền tạm ứng bồi thường chưa tới một phần mười ba thiệt hại ước tính.")
    + K(100, 330, 1720, 480, "the", "Khối nền biểu đồ", A("fade", 200, 400)) + R.map(([t, v, s, m, cls], k) => { const y = 350 + k * 150, w = Math.max(Math.round(v * sc), 12), t0 = 500 + k * 500;
      return T("yagi-t", 120, y, 900, t, A("fade", t0, 300)) + lop(`<rect x="120" y="${y + 48}" width="${w}" height="72" fill="${m}"/>`, 120, y + 48, w, 72, `Thanh ${t}: ${s} đồng`, A("wipe", t0, 700))
        + T(`yagi-so ${cls}`, k === 0 ? 162 : Math.max(120 + w + 24, 200), y + 58, 400, s, A("fade", t0 + 500, 300)); }).join("")
    + K(120, 830, 1680, 140, "pan-navy", "Khối nhận xét", A("rise", 2200, 400)) + G("dai-trang-t", 160, 830, 1600, 140, "956,5 / 12.811 ≈ 7,5 % (nhóm tự tính) · phi nhân thọ 2024 vẫn tăng 10,2 %", A("fade", 2300, 400))
    + nguon("TLTK 16 (VCCI), 17 (VietnamFinance) — số liệu Cục QLGSBH; TLTK 11 (Tạp chí Kinh tế – Tài chính 27/10/2026)."));
}

// ===== 23 · NHÂN THỌ vs PHI NHÂN THỌ =====
{ const D2 = [["2023", -12.5, 2.87, "−12,5", "+2,87"], ["2024", -5, 10.2, "≈ −5", "+10,2"], ["2025", 0.5, 10.5, "+0,5", "+10–11"], ["9T/2026", -4, 15.1, "≈ −4", "+15,1"]];
  const y0 = 700, sc = 13, bw = 130, st = 420, x0 = 200;
  sec(23, "so-lon", "toi", dau(23, "2023 – 9 tháng 2026", "Phi nhân thọ kéo, nhân thọ chưa hồi", "Tăng / giảm doanh thu phí so với cùng kỳ năm trước, %.", true)
    + K(1300, 334, 30, 30, "o-navy3", "Chú giải nhân thọ", A("fade", 300, 300)) + T("chu-giai", 1344, 330, 200, "Nhân thọ", A("fade", 300, 300)) + K(1540, 334, 30, 30, "o-cam", "Chú giải phi nhân thọ", A("fade", 300, 300)) + T("chu-giai", 1584, 330, 240, "Phi nhân thọ", A("fade", 300, 300))
    + lop(`<path d="M150 ${y0} H1800" stroke="${P.trang}" stroke-width="3"/>`, 150, y0 - 2, 1650, 4, "Trục 0 %", A("wipe", 300, 500))
    + D2.map(([n, a, b, sa, sb], k) => { const x = x0 + k * st, t0 = 600 + k * 400, ha = Math.abs(a) * sc, hb = b * sc;
      const ra = a < 0 ? `<rect x="${x}" y="${y0}" width="${bw}" height="${ha}" fill="${P.navy3}"/>` : `<rect x="${x}" y="${y0 - Math.max(ha, 6)}" width="${bw}" height="${Math.max(ha, 6)}" fill="${P.navy3}"/>`;
      return lop(ra + `<rect x="${x + bw + 12}" y="${y0 - hb}" width="${bw}" height="${hb}" fill="${P.cam}"/>`, x, y0 - 15.1 * sc, 2 * bw + 12, (15.1 + 12.5) * sc, `Năm ${n}: nhân thọ ${sa} %, phi nhân thọ ${sb} %`, A("grow", t0, 600))
        + T("dv-so", x - 20, a < 0 ? y0 + ha + 8 : y0 - Math.max(ha, 6) - 52, bw + 40, sa, A("fade", t0 + 400, 300)) + T("dv-so cam", x + bw - 8, y0 - hb - 52, bw + 40, sb, A("fade", t0 + 400, 300))
        + T("dv-nam", x - 10, 935, 2 * bw + 32, n, A("fade", t0, 300)); }).join("")
    + nguon("TLTK 10, 11, 21, 22 của bài nhóm; 2025 phi nhân thọ “khoảng 10–11 %” (vẽ 10,5). Luật 139/2025/QH15 hiệu lực 01/01/2026.", true));
}

// ===== 24 · KẾT =====
{ const KL = [["01", "An Gia đủ chuẩn luật, nhưng thời gian chờ, đồng chi trả, chậm phí có thể làm người mua mất quyền lợi."], ["02", "Năm 2023 là cái giá của tư vấn sai khi bán bảo hiểm qua ngân hàng."], ["03", "Phi nhân thọ đang dẫn dắt; nhân thọ chưa phục hồi."]];
  sec(24, "ket", "toi", nen(cham(1696, 130, 5, 3, P.navy2)) + T("kk sang", 120, 60, 800, "Kết luận", A("fade", 0, 400)) + T("so sang", 1500, 64, 300, `24 / ${TONG}`)
    + H("td sang", 119, 116, 1600, "Đọc kỹ hợp đồng là việc của người mua", A("rise", 200, 700)) + K(120, 240, 96, 8, "vach-cam", "Vạch cam", A("wipe", 400, 400))
    + KL.map(([so, s], k) => { const y = 340 + k * 210, t0 = 900 + k * 500;
      return T("ket-so", 116, y, 220, so, A("pop", t0, 400)) + T("ket-m", 360, y + 16, 1440, s, A("fade", t0 + 150, 500)) + (k ? K(120, y - 30, 1680, 2, "vach-navy2", "Vạch kẻ", A("fade", t0, 300)) : ""); }).join(""), "data-khong-hinh");
}

// ===== 25 · TÀI LIỆU THAM KHẢO =====
{ const L = ["Luật KDBH 08/2022/QH15 (sửa đổi năm 2025)", "Luật Các TCTD 32/2024/QH15", "Bộ luật Dân sự 91/2015/QH13", "Quy tắc An Gia, QĐ 6029/QĐ-BHBV"];
  const S2 = ["Bộ Tài chính, Cục QLGSBH — số liệu 2018–2025", "Tạp chí Kinh tế – Tài chính (2023, 27/10/2026)", "PSI — Báo cáo ngành bảo hiểm (01/2025)", "VnEconomy, Thanh tra, VCCI, IAV…"];
  sec(25, "noi-dung", "sang", dau(25, "Nguồn", "Tài liệu tham khảo", "Đủ 22 nguồn trong bài viết của nhóm; đây là thông tin pháp luật chung, không phải tư vấn.")
    + [["Văn bản pháp luật", L, "scale", true], ["Nguồn số liệu", S2, "chart-bar", false]].map(([t, ds, i, toi], k) => { const x = 120 + k * 870, t0 = 400 + k * 400;
      return K(x, 340, 810, 480, "the", `Khối ${t}`, A("rise", t0, 400)) + K(x, 340, 810, 100, toi ? "pan-navy" : "pan-cam", `Đầu khối ${t}`, A("rise", t0, 400))
        + lop(vuong(x + 24, 352, 76, toi ? P.navy2 : P.cam0, i), x + 24, 352, 76, 76, `Biểu tượng ${t}`, A("pop", t0 + 100, 300)) + T("khoi-t sang", x + 124, 362, 640, t, A("fade", t0 + 100, 300))
        + ds.map((s, j) => T("tl-dong", x + 36, 470 + j * 84, 740, s, A("fade", t0 + 200 + j * 100, 300))).join(""); }).join("")
    + T("cam-on", 120, 870, 1680, "Cảm ơn thầy cô và các bạn — [mời đặt câu hỏi]", A("rise", 1600, 500)), "data-khong-hinh");
}

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
.so-vua{font:400 64px/1 'Anton';color:${P.navy}}.so-vua-m{font:600 34px/1.3 'Be Vietnam Pro';color:${P.phu}}
.moc-t{font:400 44px/1.1 'Anton';color:${P.cam}}.moc-m{font:500 32px/1.35 'Be Vietnam Pro';color:${P.navy}}
.dai-cam{background:${P.cam}}.dai-cam-t{font:800 34px/1.2 'Be Vietnam Pro';color:${P.trang}}
.khoi-so{font:400 140px/1 'Anton';color:${P.cam}}.khoi-so.navy{color:${P.navy}}.khoi-t{font:400 48px/1.1 'Anton';text-transform:uppercase;color:${P.navy}}.khoi-t.sang{color:${P.trang}}
.khoi-m{font:500 34px/1.4 'Be Vietnam Pro';color:${P.navy}}.khoi-m.sang{color:${P.ke}}.khoi-chip{font:700 30px/1 'Be Vietnam Pro';color:${P.navy};border-top:4px solid ${P.cam};padding-top:14px}.khoi-chip.sang{color:${P.trang}}
.tl-t{font:600 32px/1.25 'Be Vietnam Pro';color:${P.navy}}.cot-nhan{font:700 30px/1.2 'Be Vietnam Pro';color:${P.navy}}.cot-nhan.phai{text-align:right}
.bac-so{font:400 96px/1 'Anton';color:${P.trang};text-align:center}.bac-t{font:700 30px/1.25 'Be Vietnam Pro';color:${P.navy}}
.goi-t{font:400 44px/1 'Anton';text-transform:uppercase;color:${P.navy}}.goi-so{font:400 44px/1 'Anton';color:${P.trang}}.goi-nv{font:400 40px/1 'Anton';color:${P.cam0}}
.o-cam{background:${P.cam}}.o-navy3{background:${P.navy3}}.ds-t{font:500 32px/1.3 'Be Vietnam Pro';color:${P.navy}}.ds-t.lon{font-weight:600}.bs-t{font:700 32px/1.2 'Be Vietnam Pro';color:${P.trang}}
.ct-ten{font:700 32px/1.3 'Be Vietnam Pro';color:${P.navy}}.ct-o{font:800 36px/1.2 'Be Vietnam Pro'}.ct-o.sang{color:${P.trang}}.ct-o.do{color:${P.cam0}}
.moc-n{font:800 32px/1.25 'Be Vietnam Pro';color:${P.navy};text-align:center}.moc-n.cam{color:${P.cam0}}.trich-den{font:600 38px/1.45 'Be Vietnam Pro';color:${P.navy}}
.vach-navy{background:${P.navy}}.vach-ke{background:${P.ke}}.vach-navy2{background:${P.navy2}}
.so-khoi{font:400 160px/1 'Anton';color:${P.navy}}.so-khoi.cam{color:${P.cam}}.dk-m{font:400 32px/1.35 'Be Vietnam Pro';color:${P.phu}}
.ct-cong{font:400 52px/1.2 'Anton';color:${P.trang}}.ct-ghi{font:600 32px/1.3 'Be Vietnam Pro';color:${P.trang}}
.dai-cam4{background:${P.cam4}}.dai-do-t{font:700 32px/1.35 'Be Vietnam Pro';color:${P.cam0}}.dai-do-t em{color:${P.navy}}.dc-t{font:600 34px/1.35 'Be Vietnam Pro';color:${P.navy}}
.pan-cam{background:${P.cam}}.o-so{font:400 34px/1 'Anton';color:${P.trang}}.o-nen{background:${P.navy}}.o-nen.cam{background:${P.cam0}}
.kn-so{font:400 110px/1 'Anton';color:${P.cam}}.cc-t{font:700 28px/1.3 'Be Vietnam Pro';color:${P.trang}}
.ba-so{font:400 44px/1 'Anton';color:${P.trang}}.ba-nam{font:700 32px/1.2 'Be Vietnam Pro';color:${P.navy};text-align:center}
.so-the{font:400 76px/1.1 'Anton';color:${P.navy}}.so-the-m{font:600 30px/1.3 'Be Vietnam Pro';color:${P.phu}}
.yagi-t{font:700 32px/1.2 'Be Vietnam Pro';color:${P.navy}}.yagi-so{font:400 48px/1.2 'Anton';color:${P.navy}}.yagi-so.do{color:${P.cam0}}.dai-trang-t{font:700 36px/1.3 'Be Vietnam Pro';color:${P.trang}}
.chu-giai{font:700 32px/1.2 'Be Vietnam Pro';color:${P.trang}}.dv-so{font:400 44px/1.1 'Anton';color:${P.trang};text-align:center}.dv-so.cam{color:${P.cam}}.dv-nam{font:700 34px/1.2 'Be Vietnam Pro';color:${P.trang};text-align:center}
.ket-so{font:400 140px/1 'Anton';color:${P.cam}}.ket-m{font:600 42px/1.35 'Be Vietnam Pro';color:${P.trang}}
.tl-dong{font:500 32px/1.3 'Be Vietnam Pro';color:${P.navy}}.cam-on{font:400 64px/1.1 'Anton';text-transform:uppercase;color:${P.navy}}
`);
fs.rmSync(path.join(D, "slides"), { recursive: true, force: true });
S.sort((a, b) => a.k - b.k).forEach((s) => ghi(path.join(D, "slides", `${String(s.k).padStart(2, "0")}.html`), s.html));
fs.writeFileSync(path.join(D, "thiet-ke", "phong-cach.json"), JSON.stringify({ ten: "báo cáo đậm — navy, cam san hô, Anton", huong: "Hướng 3 (C1, 20/11/2026): navy #14294A + trắng, một màu nhấn cam san hô; tiêu đề Anton in hoa ngắn + câu dẫn Be Vietnam Pro; panel chia đôi; số lớn; ảnh tròn đen trắng; lưới chấm; khối vuông không bo, không bóng, không gradient.", gradient: false, bongMo: false,
  bangMau: Object.values(P), loaiHinh: ["phang", "nen", "anh-chup"], boCuc: ["bia", "mo-phan", "noi-dung", "chia", "so-lon", "bang", "trich", "so-sanh", "ket"], tieuDeCoDinh: ["noi-dung", "bang"],
  nguong: { loaiNenToiThieu: 2, tiLeNenToiDa: 0.85, lienToiDa: 6, lienHoToiDa: 6, assetToiDa: 4, bangXetTiLe: 99, tieuDiemToiThieu: 0.15 } }, null, 2));
console.log(`${S.length} slide: ${S.map((s) => s.k).join(", ")}`);
