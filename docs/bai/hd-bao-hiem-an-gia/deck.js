// Deck "HĐ bảo hiểm Bảo Việt An Gia & thực trạng thị trường" (Nhóm 2) — skill slide-chuan.
// Hướng hình: "tư vấn pháp lý — khối phẳng", dùng lại hệ thống thiết kế đã duyệt của docs/bai/ch3-bao-hiem-thuong-mai
// (cùng chủ đề bảo hiểm): nền giấy sáng + nền xanh đậm theo vai, khối tô đặc, tiêu đề Lora có từ khoá màu, biểu đồ đúng tỉ lệ, vật phẳng (minh-hoa.js).
// Nội dung: kich-ban.md + noi-dung.md. Dựng:
//   node deck.js && PW_CHROMIUM=/opt/pw-browsers/chromium node ../../../.claude/skills/slide-chuan/scripts/dung.js . --ten=hd-bao-hiem-an-gia
const fs = require("fs"), path = require("path");
const D = __dirname, mh = require("./minh-hoa.js"), P = mh.P;
const ghi = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
fs.rmSync(path.join(D, "asset", "hinh"), { recursive: true, force: true });
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const em = (s) => esc(s).replace(/\[([^\]]+)\]/g, "<em>$1</em>").replace(/\{([^}]+)\}/g, '<em class="v">$1</em>').replace(/\(\(([^)]+)\)\)/g, '<em class="r">$1</em>');
const TONG = 25, S = [];
let nL = 0;
const A = (a, at, dur = 500) => `data-a="${a}" data-at="${at}" data-dur="${dur}"`;
const lop = (body, x, y, w, h, alt, loai = "phang", ex = "") => { const f = `l${String(++nL).padStart(2, "0")}.svg`;
  ghi(path.join(D, "asset", "hinh", f), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${body}</svg>`);
  return `<img data-l="lop-${nL}" data-loai="${loai}" data-alt="${esc(alt)}" ${ex} src="asset/hinh/${f}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`; };
const anh = (f, x, y, w, h, alt, ex = "") => `<img data-l="anh-${f.replace(/\W/g, "")}" data-loai="anh-chup" data-alt="${esc(alt)}" ${ex} src="anh/${f}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`;
const nen = (body) => lop(body, 0, 0, 1920, 1080, "Hình trang trí", "nen");
const T = (cls, x, y, w, s, ex = "") => `<div class="${cls}" data-t ${ex} style="left:${x}px;top:${y}px;width:${w}px">${em(s)}</div>`;
const G = (cls, x, y, w, h, html, ex = "") => `<div class="${cls} giua" data-t ${ex} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${html}</div>`;
const chip = (s, x, y, cls = "chip", ex = "") => `<div class="${cls}" data-t data-l="c${++nL}" data-alt="Nhãn ${esc(s)}" ${ex} style="left:${x}px;top:${y}px">${esc(s)}</div>`;
const khoi = (x, y, w, h, cls, alt, ex = "", st = "") => `<div class="${cls}" data-l="k${++nL}" data-alt="${esc(alt)}" ${ex} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px${st}"></div>`;
const dau = (kk, td, dan, so, sang = false) => chip(kk, 120, 80, sang ? "chip vang" : "chip", A("fade", 0, 400))
  + `<h1 class="td${sang ? " sang" : ""}" data-t data-tieu-de ${A("rise", 100, 600)} style="left:120px;top:132px;width:1560px">${em(td)}</h1>`
  + T(`dan${sang ? " sang" : ""}`, 120, 246, 1620, dan, A("fade", 350, 500)) + T(`so-trang${sang ? " sang" : ""}`, 1600, 84, 200, `${so} / ${TONG}`);
const sec = (mau, kieu, notes, inner, { ex = "", trans = "fade", dur = 600 } = {}) => S.push(`<section class="s ${kieu}" data-mau="${mau}" data-nen="${kieu}" ${ex} data-trans="${trans}" data-dur="${dur}" data-notes="${esc(notes)}">\n${inner}\n</section>`);
const icon = (ten, cx, cy, co, mau, net = 3) => mh.iconNet(D, ten, cx, cy, co, mau, net);
const huy = (x, y, co, ten, mau = P.x1, net = P.nen, ex = "", alt = "") => lop(`<rect x="${x}" y="${y}" width="${co}" height="${co}" rx="${co * 0.18}" fill="${mau}"/>` + icon(ten, x + co / 2, y + co / 2, co * 0.58, net, 3), x, y, co, co, alt || `Biểu tượng ${ten}`, "phang", ex);
const muiTen = (x1, y1, x2, y2, mau = P.x1, w = 5) => { const a = Math.atan2(y2 - y1, x2 - x1), L = 22, b = 0.45;
  return `<path d="M${x1} ${y1} L${x2 - Math.cos(a) * 14} ${y2 - Math.sin(a) * 14}" stroke="${mau}" stroke-width="${w}" stroke-linecap="round" fill="none"/><path d="M${x2} ${y2} L${x2 - L * Math.cos(a - b)} ${y2 - L * Math.sin(a - b)} L${x2 - L * Math.cos(a + b)} ${y2 - L * Math.sin(a + b)} Z" fill="${mau}"/>`; };
const NEN = {
  tron: () => `<circle cx="1920" cy="0" r="300" fill="${P.x4}"/>` + mh.cham(1660, 960, 6, 2, 26, 5, P.v2),
  goc: () => `<circle cx="0" cy="1080" r="120" fill="${P.x4}"/><circle cx="1920" cy="0" r="120" fill="${P.v4}"/>`,
  dat: (y0) => `<rect x="0" y="${y0}" width="1920" height="${1080 - y0}" fill="${P.x4}"/>` + mh.cham(1700, 150, 5, 3, 26, 5, P.v2),
  cheo: () => `<circle cx="1920" cy="1080" r="250" fill="${P.x4}"/>` + mh.cham(1700, 140, 5, 3, 26, 5, P.v2),
};
const nguon = (s, sang = false) => `<div class="nguon${sang ? " sang" : ""}" data-t style="left:120px;top:1004px;width:1680px">${esc(s)}</div>`;
const panel = (x, y, w, h, t0 = 200, cls = "panel-nen") => khoi(x, y, w, h, cls, "Khối nền", A("fade", t0, 500));
const chipW = (s, nho) => Math.round(s.length * (nho ? 15.5 : 17.5) + 56);
const N = {}; // ghi chú người nói

// ============ 1 BÌA ============
sec("bia", "sang", "Chào thầy cô và các bạn. Nhóm 2 trình bày đề tài hợp đồng bảo hiểm thương mại và thực trạng thị trường bảo hiểm Việt Nam. Nhóm chọn một hợp đồng thật — Bảo Việt An Gia — để đọc như một người mua, rồi nhìn rộng ra cả thị trường.",
  nen(`<path d="M1080 1080 V540 A380 380 0 0 1 1840 540 V1080 Z" fill="${P.x4}" transform="translate(-40 -60)"/>` + mh.cham(120, 1000, 6, 2, 26, 5, P.v2) + mh.cham(1800, 90, 4, 4, 26, 5, P.v2) + mh.saoCum(930, 230, 28))
  + lop(`<path d="M996 1040 V466 A404 404 0 0 1 1804 466 V1040" fill="none" stroke="${P.v2}" stroke-width="6"/>`, 990, 56, 820, 990, "Viền vòm vàng bao quanh ảnh", "phang", A("fade", 500, 700))
  + anh("bia-vom.png", 1020, 110, 760, 900, "Ảnh: hai bàn tay cầm bản hợp đồng đã ký — giao kết hợp đồng bảo hiểm", A("rise", 0, 900))
  + khoi(860, 836, 600, 160, "the-noi", "Thẻ nổi", A("rise", 1400, 600))
  + huy(890, 866, 100, "file-certificate", P.x1, P.nen, A("pop", 1600, 400), "Biểu tượng hợp đồng")
  + T("noi-t", 1012, 868, 430, "Bảo Việt An Gia", A("fade", 1700, 400)) + T("noi-m", 1012, 914, 430, "13 điều + Phụ lục quyền lợi", A("fade", 1800, 400))
  + chip("Nhóm 2 · Thuyết trình", 120, 210, "chip", A("fade", 300, 400))
  + `<h1 class="bia-td" data-t data-tieu-de ${A("rise", 600, 700)} style="left:116px;top:300px;width:820px">${em("Hợp đồng [bảo hiểm thương mại]")}</h1>`
  + `<div class="gach" data-l="gach-bia" data-alt="Gạch vàng" ${A("wipe", 1000, 400)} style="left:120px;top:742px;width:150px;height:12px"></div>`
  + T("bia-mo", 120, 786, 700, "và thực trạng thị trường bảo hiểm Việt Nam, 2018 – 9 tháng 2026", A("fade", 1100, 500)));

// ============ 2 LỘ TRÌNH ============
{ const C = [["I", "Mổ xẻ một hợp đồng thật", "Bảo Việt An Gia: đủ chuẩn luật, nhưng 5 điều khoản cần soi kỹ", ["13 điều", "Phụ lục 1", "5 điều khoản"], "dau-xanh"], ["II", "Thị trường 2018 – 9T/2026", "Tăng nóng, khủng hoảng năm 2023, phục hồi nhờ phi nhân thọ", ["Tăng nóng", "2023", "Phục hồi"], "dau-vang"]];
  sec("noi-dung", "sang", "Bài có hai phần. Phần một đọc hợp đồng như người mua: điều khoản nói gì, có lợi cho ai. Phần hai xem hậu quả khi khâu tư vấn, bán hợp đồng làm sai — cả thị trường đã trả giá năm 2023.",
    nen(NEN.dat(780)) + dau("Lộ trình", "Từ [một hợp đồng] đến {cả thị trường}", "Phần I đọc hợp đồng như người mua; phần II xem hậu quả khi khâu tư vấn hợp đồng làm sai.", 2)
    + C.map(([so, td, mo, ch, cls], k) => { const x = 120 + k * 900, t0 = 500 + k * 500;
      return khoi(x + 14, 344, 780, 600, "bong", "Bóng thẻ", A("rise", t0, 500)) + khoi(x, 330, 780, 600, "the-trang", `Thẻ phần ${so}`, A("rise", t0, 500)) + khoi(x, 330, 780, 170, cls, `Đầu thẻ phần ${so}`, A("rise", t0, 500))
        + T(`kc-so${k ? " toi" : ""}`, x + 34, 344, 200, so, A("rise", t0, 500)) + T(`the-td${k ? " toi" : ""}`, x + 200, 380, 560, td, A("fade", t0 + 150, 400))
        + T("the-chu", x + 40, 540, 700, mo, A("fade", t0 + 250, 400))
        + ch.map((c, j) => chip(c, x + 40 + ch.slice(0, j).reduce((a, q) => a + chipW(q) + 18, 0), 820, k ? "chip vang nt" : "chip nt", A("rise", t0 + 400 + j * 120, 400))).join(""); }).join("")
    + lop(muiTen(905, 630, 1015, 630, P.v1, 8), 890, 600, 140, 60, "Mũi tên nối phần I sang phần II", "phang", A("wipe", 1600, 500)));
}

// ============ MỞ PHẦN ============
const moPhan = (so, ten, mo, chips, ve, alt, notes) => sec("mo-phan", "dam", notes, nen(mh.cham(120, 96, 5, 3, 26, 5, P.v2))
  + lop(`<circle cx="1440" cy="560" r="420" fill="${P.x2}"/>` + ve + mh.saoCum(1020, 860, 26, P.v3), 1000, 120, 900, 900, alt, "phang", A("pop", 200, 800))
  + khoi(120, 190, 300, 240, "o-so", "Ô số phần", A("pop", 300, 500)) + T("mp-so", 120, 200, 300, so, A("pop", 400, 500))
  + `<h1 class="mp-t" data-t data-tieu-de ${A("rise", 600, 600)} style="left:116px;top:490px;width:820px">${esc(ten)}</h1>` + T("mp-m", 118, 720, 780, mo, A("fade", 850, 500))
  + chips.map((c, k) => chip(c, 120 + chips.slice(0, k).reduce((a, s) => a + chipW(s) + 18, 0), 870, "chip vang nt", A("rise", 1000 + k * 120, 400))).join(""), { trans: "push", dur: 700 });

moPhan("I", "Hợp đồng Bảo Việt An Gia", "Đọc như người mua: điều khoản nói gì, có lợi cho ai, khớp luật đến đâu.", ["Chủ thể", "Quyền lợi", "Thời gian chờ", "Bồi thường"],
  `<g transform="rotate(-6 1440 560)">${mh.hopDong(1250, 300, 380)}</g>` + `<circle cx="1640" cy="760" r="92" fill="${P.v2}"/>` + icon("eye", 1640, 760, 110, P.x1, 4),
  "Minh hoạ: bản hợp đồng bảo hiểm và biểu tượng con mắt — đọc kỹ hợp đồng", "Phần một: hợp đồng Bảo Việt An Gia, theo Quy tắc ban hành kèm Quyết định 6029/QĐ-BHBV ngày 27/6/2025. Nhóm đi qua chủ thể, quyền lợi, thời gian chờ, chấm dứt và bồi thường.");

// ============ 4 ĐIỀU 17 — BẢNG TRA ============
{ const R = [["a", "Các bên của hợp đồng", "Điều 1, 2, 8", 1], ["b", "Đối tượng bảo hiểm", "Điều 2 (danh sách NĐBH)", 1], ["c", "Giới hạn trách nhiệm", "Phụ lục 1", 1], ["d", "Quyền lợi, quy tắc, điều khoản", "Điều 2, 7, Phụ lục 1", 1], ["đ", "Quyền, nghĩa vụ các bên", "Điều 9: chỉ dẫn chiếu pháp luật", 0], ["e", "Thời hạn, thời điểm hiệu lực", "Điều 3, 5", 1], ["g", "Mức phí, cách đóng phí", "Điều 4", 1], ["h", "Cách bồi thường, trả tiền", "Điều 10", 1], ["i", "Giải quyết tranh chấp", "Điều 13", 1]];
  const y0 = 330, hh = 60, hr = 66, cx = [120, 260, 980, 1640], cw = [140, 720, 660, 160];
  sec("bang", "sang", "Khoản 1 Điều 17 Luật Kinh doanh bảo hiểm 2022 liệt kê 9 nội dung chủ yếu của hợp đồng bảo hiểm. Nhóm đối chiếu từng điểm: hợp đồng An Gia có đủ cả 9. Chỗ yếu là điểm đ — Điều 9 chỉ ghi các bên thực hiện quyền, nghĩa vụ theo pháp luật, muốn biết cụ thể phải đọc Quy tắc. Phần đối chiếu này do nhóm bổ sung.",
    nen(NEN.goc()) + dau("Đối chiếu luật ✚", "Đủ [9 nội dung] luật đòi hỏi", "Hợp đồng khớp cả 9 điểm của khoản 1 Điều 17 Luật KDBH; riêng quyền, nghĩa vụ chỉ dẫn chiếu.", 4)
    + khoi(120, y0, 1680, hh, "bh", "Đầu bảng", A("wipe", 400, 400))
    + [["Điểm", 0], ["Luật yêu cầu", 1], ["Hợp đồng An Gia", 2], ["Đạt", 3]].map(([s, j]) => G(`bh-t${j === 3 ? " can" : ""}`, cx[j] + 20, y0, cw[j] - 40, hh, j === 3 ? `<span style="width:100%;text-align:center">${esc(s)}</span>` : esc(s), A("fade", 500, 300))).join("")
    + R.map(([d, l, h, ok], i) => { const y = y0 + hh + i * hr, t0 = 700 + i * 90;
      return khoi(120, y, 1680, hr - 4, `hang${ok ? (i % 2 ? " le" : "") : " nhan"}`, `Hàng điểm ${d}`, A("rise", t0, 300))
        + G("so-o dau can", cx[0] + 20, y, cw[0] - 40, hr - 4, `<span style="width:100%;text-align:center">${esc(d)}</span>`, A("rise", t0, 300))
        + G("o-chu", cx[1] + 20, y, cw[1] - 40, hr - 4, esc(l), A("rise", t0, 300)) + G(`o-chu${ok ? "" : " vang"}`, cx[2] + 20, y, cw[2] - 40, hr - 4, esc(h), A("rise", t0, 300))
        + lop(ok ? `<circle cx="${cx[3] + 80}" cy="${y + 31}" r="22" fill="${P.x1}"/>` + icon("check", cx[3] + 80, y + 31, 30, P.nen, 4) : `<circle cx="${cx[3] + 80}" cy="${y + 31}" r="22" fill="${P.v2}"/>` + icon("alert-triangle", cx[3] + 80, y + 30, 28, P.muc, 3), cx[3] + 50, y + 3, 60, 58, ok ? `Đáp ứng điểm ${d}` : `Điểm ${d}: đáp ứng nhưng chỉ dẫn chiếu`, "phang", `data-lap ${A("pop", t0 + 100, 300)}`); }).join("")
    + nguon("Khoản 1 Điều 17 Luật KDBH 08/2022/QH15 (sửa đổi, bổ sung bởi Luật 139/2025/QH15). ✚ Nhóm bổ sung phần đối chiếu."), { ex: "data-khong-hinh" });
}

// ============ 5 BỘ HỢP ĐỒNG + THỨ TỰ ƯU TIÊN ============
{ const TL = ["Giấy yêu cầu bảo hiểm", "Hợp đồng bảo hiểm", "Phụ lục 1 · Bảng quyền lợi", "Sửa đổi bổ sung (nếu có)", "Quy tắc Bảo Việt An Gia"];
  const B = [["1", "Sửa đổi bổ sung mới nhất", 470, P.x1], ["2", "Hợp đồng + phụ lục", 350, P.x2], ["3", "Quy tắc bảo hiểm", 230, P.x3]];
  sec("noi-dung", "sang", "Điều 12: bộ hợp đồng gồm năm tài liệu. Khi các tài liệu mâu thuẫn, Bảo Việt áp dụng theo thứ tự: sửa đổi bổ sung ký mới nhất, rồi hợp đồng và phụ lục, cuối cùng là Quy tắc. Quy tắc là văn bản chung cho mọi khách hàng nên đứng dưới cùng; thỏa thuận riêng, mới hơn đứng trên.",
    nen(NEN.cheo()) + dau("Điều 12 · Bộ hợp đồng", "Năm tài liệu, [mới nhất thắng]", "Khi các tài liệu mâu thuẫn, sửa đổi bổ sung ký sau cùng được áp dụng trước.", 5)
    + TL.map((s, k) => { const y = 350 + k * 122, t0 = 400 + k * 160;
      return khoi(134, y + 12, 720, 100, "giay-bong", "Bóng tờ giấy", A("rise", t0, 400)) + khoi(120, y, 720, 100, "giay", `Tờ ${s}`, A("rise", t0, 400))
        + lop(`<rect x="146" y="${y + 22}" width="56" height="56" rx="10" fill="${k === 3 ? P.v2 : P.x1}"/>` + icon("file-certificate", 174, y + 50, 34, k === 3 ? P.muc : P.nen, 3), 146, y + 22, 56, 56, "Biểu tượng tài liệu", "phang", `data-lap ${A("pop", t0 + 100, 300)}`)
        + G("tl-t", 226, y, 600, 100, esc(s), A("fade", t0 + 100, 300)); }).join("")
    + panel(960, 330, 860, 660, 1200) + T("cot-nhan", 1000, 350, 800, "Khi mâu thuẫn, áp dụng theo thứ tự", A("fade", 1300, 400))
    + B.map(([so, ten, h, m], k) => { const x = 1000 + k * 280, yb = 900, t0 = 1500 + k * 300;
      return lop(`<rect x="${x}" y="${yb - h}" width="240" height="${h}" rx="14" fill="${m}"/>`, x, yb - h, 240, h, `Bậc ${so}: ${ten}`, "phang", A("grow", t0, 500))
        + T(`bac-so${k === 2 ? " toi" : ""}`, x, yb - h + 20, 240, so, A("fade", t0 + 200, 300)) + T("bac-t", x, yb + 20, 260, ten, A("fade", t0 + 250, 300)); }).join("")
    + nguon("Điều 12 hợp đồng Bảo Việt An Gia (theo Quy tắc ban hành kèm Quyết định 6029/QĐ-BHBV ngày 27/6/2025)."));
}

// ============ 6 NĂM VAI ============
{ const V = [["Bên mua bảo hiểm", "giao kết, đóng phí", 150, 380, P.x2, P.x1], ["Người được bảo hiểm", "sức khỏe, tính mạng được bảo vệ", 1570, 380, P.v2, P.v1], ["Người thụ hưởng", "nhận tiền khi NĐBH tử vong", 500, 700, P.x3, P.x2], ["Người chỉ định nhận tiền", "nhận thay tiền bồi thường", 1290, 700, P.x3, P.x2]];
  const co = 170;
  sec("noi-dung", "sang", "Một hợp đồng gắn năm vai. Bên mua ký và đóng phí; người được bảo hiểm là người có sức khỏe, tính mạng được bảo vệ; người thụ hưởng chỉ nhận tiền khi người được bảo hiểm tử vong; người chỉ định nhận thay tiền bồi thường thông thường. Một hợp đồng có thể có nhiều người được bảo hiểm — ví dụ trong mẫu, ông A gói Vàng tham gia mới, ông B gói Kim cương tái tục.",
    nen(NEN.goc()) + dau("Điều 1, 2, 8 · Chủ thể", "Một hợp đồng, [năm vai]", "Người đóng phí, người được bảo vệ, người nhận tiền có thể là ba người khác nhau.", 6)
    + lop(muiTen(330, 480, 800, 480) + muiTen(1080, 480, 1555, 480) + muiTen(850, 520, 650, 740, P.x2) + muiTen(1030, 520, 1280, 740, P.x2), 300, 440, 1300, 340, "Sơ đồ: bên mua đóng phí cho Bảo Việt; Bảo Việt bảo vệ người được bảo hiểm và trả tiền cho người thụ hưởng hoặc người chỉ định", "phang", A("wipe", 1400, 800))
    + lop(`<rect x="840" y="360" width="200" height="200" rx="36" fill="${P.x1}"/>` + mh.toaVP(940, 540, 120), 840, 360, 200, 200, "Toà nhà Bảo Việt — doanh nghiệp bảo hiểm", "phang", A("pop", 400, 500))
    + `<div class="cap" style="left:780px;top:574px;width:320px"><b data-t class="la-t" ${A("fade", 500, 400)}>Bảo Việt</b><span data-t class="la-m" ${A("fade", 600, 400)}>doanh nghiệp bảo hiểm</span></div>`
    + V.map(([ten, vai, x, y, ao, ao2], k) => { const c = k < 2 ? co : 130, t0 = 700 + k * 250;
      return lop(`<rect x="${x}" y="${y}" width="${c}" height="${c}" rx="${c * 0.18}" fill="${k < 2 ? P.x4 : P.v4}"/>` + mh.nguoi(x + c / 2, y + c * 0.94, c * 0.72, { ao, ao2 }), x, y, c, c, `Hình người: ${ten}`, "phang", `data-lap ${A("pop", t0, 400)}`)
        + `<div class="cap" style="left:${x + c / 2 - 220}px;top:${y + c + 12}px;width:440px"><b data-t class="la-t" ${A("fade", t0 + 100, 400)}>${esc(ten)}</b><span data-t class="la-m" ${A("fade", t0 + 200, 400)}>${esc(vai)}</span></div>`; }).join("")
    + chip("đóng phí", 470, 420, "chip nt", A("fade", 1700, 300)) + chip("bảo vệ", 1220, 420, "chip nt", A("fade", 1800, 300))
    + nguon("Điều 1, 2, 8 hợp đồng An Gia."), { ex: "data-hero" });
}

// ============ 7 NĂM GÓI ============
{ const Gi = [["Đồng", 94, "2"], ["Bạc", 138, "3"], ["Vàng", 230, "5"], ["Bạch kim", 342, "7,5"], ["Kim cương", 454, "10"]];
  const x0 = 360, W = 1000;
  sec("noi-dung", "sang", "Phụ lục 1 có năm gói, từ Đồng đến Kim cương. Tổng hạn mức quyền lợi chính đi từ 94 triệu đến 454 triệu đồng một người một năm — chênh gần năm lần. Chi phí nằm viện mỗi ngày từ 2 đến 10 triệu, tối đa 60 ngày một năm. Mọi gói chỉ bảo hiểm trong lãnh thổ Việt Nam.",
    nen(NEN.tron()) + dau("Phụ lục 1 · Quyền lợi", "Năm gói, [94 → 454 triệu]", "Hạn mức quyền lợi chính mỗi người mỗi năm chênh gần 5 lần; mọi gói chỉ trong lãnh thổ Việt Nam.", 7)
    + panel(100, 316, 1720, 670) + T("cot-nhan", x0, 330, 900, "Hạn mức quyền lợi chính (triệu đồng/người/năm)", A("fade", 300, 300)) + T("cot-nhan phai", 1500, 330, 300, "Nằm viện/ngày", A("fade", 300, 300))
    + Gi.map(([ten, v, nv], k) => { const y = 400 + k * 118, w = Math.round((v / 454) * W), t0 = 500 + k * 220, cuoi = k === 4;
      return G("goi-t", 120, y, 220, 80, esc(ten), A("rise", t0, 300))
        + lop(`<rect x="${x0}" y="${y + 8}" width="${W}" height="64" rx="12" fill="${P.trang}"/><rect x="${x0}" y="${y + 8}" width="${w}" height="64" rx="12" fill="${cuoi ? P.v2 : [P.x3, P.x3, P.x2, P.x2][k]}"/>`, x0, y + 8, W, 64, `Thanh ${ten}: ${v} triệu`, "phang", A("wipe", t0, 600))
        + T(`goi-so${k >= 2 && !cuoi ? " sang" : ""}`, x0 + w - 150, y + 12, 130, String(v), A("fade", t0 + 400, 300))
        + G("goi-nv", 1500, y, 300, 80, `<span style="width:100%;text-align:right">${esc(nv)} triệu</span>`, A("fade", t0 + 400, 300)); }).join("")
    + nguon("Phụ lục 1 hợp đồng An Gia. Nằm viện tối đa 60 ngày/năm; phẫu thuật 40 – 200 triệu/năm theo gói."));
}

// ============ 8 CHÍNH vs BỔ SUNG ============
{ const CH = ["Nằm viện (≤ 60 ngày/năm)", "Khám 30 ngày trước nhập viện", "Tái khám 30 ngày sau xuất viện", "Xe cứu thương", "Phẫu thuật", "Phục hồi chức năng", "Trợ cấp nằm viện công", "Mai táng phí 1 triệu/vụ"];
  const BS = [["stethoscope", "Ngoại trú", ""], ["alert-triangle", "Tai nạn cá nhân", ""], ["heart", "Sinh mạng cá nhân", ""], ["dental", "Nha khoa", ""], ["baby-carriage", "Thai sản", "từ gói Bạc"]];
  sec("so-sanh", "chia", "Quyền lợi chính chỉ trả khi điều trị nội trú — nằm viện do bệnh, tai nạn, biến chứng thai sản, kèm khám trước và tái khám sau 30 ngày. Khám ngoại trú, nha khoa, thai sản là quyền lợi bổ sung, phải mua thêm. Người mua hay tưởng mua gói là được khám ngoại trú — không phải. Thai sản chỉ mở từ gói Bạc.",
    nen(mh.cham(1700, 140, 5, 3, 26, 5, P.v2)) + khoi(1150, 300, 770, 780, "panel-toi-vuong", "Mảng màu chủ sau quyền lợi bổ sung", A("fade", 1400, 500)) + dau("Điều 2 · Phụ lục 1", "Gói chính chỉ trả [khi nằm viện]", "Khám ngoại trú, nha khoa, thai sản là quyền lợi bổ sung, phải chọn mua thêm.", 8)
    + khoi(134, 344, 1000, 630, "bong", "Bóng thẻ", A("rise", 400, 500)) + khoi(120, 330, 1000, 630, "the-trang", "Thẻ quyền lợi chính", A("rise", 400, 500)) + khoi(120, 330, 1000, 130, "dau-xanh", "Đầu thẻ quyền lợi chính", A("rise", 400, 500))
    + huy(150, 352, 86, "bed", P.v2, P.x1, A("pop", 600, 300), "Biểu tượng giường bệnh") + T("the-td", 260, 362, 820, "Chính · điều trị nội trú", A("fade", 600, 400))
    + CH.map((s, k) => { const c = k % 2, r = Math.floor(k / 2), x = 160 + c * 480, y = 500 + r * 108, t0 = 800 + k * 100;
      return lop(`<circle cx="${x + 16}" cy="${y + 26}" r="10" fill="${P.x2}"/>`, x + 6, y + 16, 20, 20, "Chấm đầu dòng", "phang", `data-lap ${A("fade", t0, 300)}`) + T("ds-t", x + 44, y, 420, s, A("fade", t0, 300)); }).join("")
    + T("cot-nhan sang", 1180, 330, 620, "Bổ sung · mua thêm", A("fade", 1500, 300))
    + BS.map(([i, s, c], k) => { const y = 400 + k * 116, t0 = 1600 + k * 160;
      return khoi(1180, y, 620, 100, `bs-the${k === 4 ? " vang" : ""}`, `Thẻ ${s}`, A("slide-r", t0, 400)) + lop(`<rect x="1196" y="${y + 14}" width="72" height="72" rx="13" fill="${k === 4 ? P.v2 : P.x1}"/>` + icon(i, 1232, y + 50, 42, k === 4 ? P.muc : P.nen, 3), 1196, y + 14, 72, 72, `Biểu tượng ${s}`, "phang", A("slide-r", t0, 400))
        + G("bs-t", 1290, y, 330, 100, esc(s), A("slide-r", t0, 400)) + (c ? chip(c, 1600, y + 30, "chip vang nho", A("pop", t0 + 300, 300)) : ""); }).join("")
    + nguon("Điều 2, Phụ lục 1 hợp đồng An Gia. Gói Đồng: thai sản “Không”."));
}

// ============ 9 THỜI GIAN CHỜ (hero phần I) ============
{ const R = [["Tai nạn", 0, "ngay"], ["Bệnh thông thường, điều trị răng", 30], ["Biến chứng thai sản", 90], ["Viêm phổi, phế quản ở trẻ ≤ 6 tuổi", 180], ["Bệnh có sẵn, bệnh đặc biệt, dây chằng", 365], ["Sinh con (Bảo hiểm Thai sản)", 365, "sinh"]];
  const x0 = 760, W = 960, sc = W / 400, y0 = 340, hr = 92;
  const ticks = [0, 30, 90, 180, 365].map((d) => `<path d="M${x0 + d * sc} ${y0 - 10} V${y0 + R.length * hr}" stroke="${P.ke}" stroke-width="2" stroke-dasharray="6 6"/>`).join("");
  sec("noi-dung", "sang", "Ký xong chưa được trả ngay. Tai nạn được bảo hiểm ngay; bệnh thông thường và răng chờ 30 ngày; biến chứng thai sản 90 ngày; viêm phổi, phế quản ở trẻ đến 6 tuổi 180 ngày; bệnh có sẵn, bệnh đặc biệt, tổn thương dây chằng 365 ngày. Riêng sinh con, bài nhóm ghi 635 ngày — nhóm đang kiểm lại, nhiều khả năng là 365. Thời gian chờ chặn việc có bệnh rồi mới mua. Tái tục liên tục thì không phải chờ lại, trừ phần quyền lợi mới hoặc hạn mức nâng thêm.",
    nen(NEN.goc()) + dau("Điều 5 · Thời gian chờ", "Ký xong [chưa được trả ngay]", "Mỗi loại rủi ro có thời gian chờ riêng, từ 0 đến 365 ngày kể từ ngày hiệu lực.", 9)
    + lop(ticks, x0 - 4, y0 - 12, W + 8, R.length * hr + 14, "Vạch chia ngày 0, 30, 90, 180, 365", "phang", A("fade", 300, 400))
    + R.map(([ten, d, k2], k) => { const y = y0 + k * hr, t0 = 500 + k * 250, w = Math.max(d * sc, 0), sinh = k2 === "sinh";
      return G(`cho-t${sinh ? " vang" : ""}`, 120, y, 620, hr - 14, esc(ten), A("rise", t0, 300))
        + (d ? lop(`<rect x="${x0}" y="${y + 14}" width="${w}" height="50" rx="10" fill="${sinh ? P.v2 : [P.x3, P.x3, P.x2, P.x1, P.x1][k]}"/>` + (sinh ? `<rect x="${x0 + w - 6}" y="${y + 6}" width="12" height="66" rx="4" fill="${P.v1}"/>` : ""), x0, y + 6, w + 8, 66, `Thanh ${ten}: ${d} ngày`, "phang", A("wipe", t0, 600))
          : lop(`<circle cx="${x0 + 18}" cy="${y + 39}" r="18" fill="${P.x2}"/>`, x0, y + 21, 36, 36, "Chấm: tai nạn không có thời gian chờ", "phang", A("pop", t0, 300)))
        + T(`cho-so${sinh ? " vang" : ""}`, x0 + w + (d ? 24 : 52), y + 12, 260, d ? `${d} ngày${sinh ? "*" : ""}` : "không chờ", A("fade", t0 + 400, 300)); }).join("")
    + khoi(120, 900, 1680, 80, "dai-xanh-nhat", "Dải ghi chú tái tục", A("rise", 2200, 400))
    + T("dai-ghi", 150, 916, 1640, "[Tái tục liên tục]: không chờ lại — trừ phần quyền lợi mới hoặc hạn mức nâng thêm.", A("fade", 2300, 400))
    + nguon("* Bài nhóm ghi 635 ngày — nghi gõ đảo từ 365; cần đối chiếu Quy tắc 6029/QĐ-BHBV."), { ex: "data-hero" });
}

// ============ 10 ĐỒNG CHI TRẢ ============
{ const W = 1180, x0 = 620;
  sec("noi-dung", "sang", "Với trẻ từ 15 ngày tuổi đến 3 tuổi, nếu điều trị ở cơ sở y tế tư hoặc khoa quốc tế, dịch vụ theo yêu cầu của bệnh viện công, Bảo Việt trả 70 phần trăm, gia đình tự trả 30. Ví dụ hóa đơn 10 triệu: Bảo Việt 7, gia đình 3. Điều trị thường ở bệnh viện công thì không áp đồng chi trả. Con số 10 triệu chỉ là ví dụ minh hoạ của nhóm.",
    nen(NEN.dat(860)) + dau("Phụ lục 1 · mục 2", "Trẻ dưới 3 tuổi: [Bảo Việt trả 70 %]", "Trẻ từ 15 ngày đến 3 tuổi điều trị ở cơ sở tư thì gia đình tự trả 30 % chi phí.", 10)
    + panel(100, 410, 1720, 440) + chip("Ví dụ: hóa đơn 10 triệu đồng", x0, 340, "chip vang nt", A("fade", 300, 300))
    + [["Cơ sở y tế tư, khoa quốc tế, dịch vụ theo yêu cầu", [[0.7, P.x1, "Bảo Việt 7 triệu"], [0.3, P.d4, "Gia đình 3 triệu"]], "building", P.x1], ["Bệnh viện công, khoa điều trị thường", [[1, P.x2, "Không áp đồng chi trả"]], "building-bank", P.x2]].map(([ten, parts, ic, m], k) => { const y = 440 + k * 220, t0 = 600 + k * 900;
      let x = x0, o = "", tx = "";
      parts.forEach(([p, c, s], j) => { const w = Math.round(p * W); o += `<rect x="${x + (j ? 6 : 0)}" y="${y}" width="${w - (j ? 6 : 0)}" height="120" rx="16" fill="${c}"/>`; tx += G(`ct-o${c === P.d4 ? " do" : ""}`, x + 30, y, w - 60, 120, esc(s), A("fade", t0 + 500 + j * 200, 300)); x += w; });
      return huy(120, y + 10, 100, ic, m, P.nen, A("pop", t0, 300), `Biểu tượng ${ten}`) + T("ct-ten", 240, y + 14, 360, ten, A("fade", t0, 300))
        + lop(o, x0, y, W, 120, `Thanh chia hóa đơn: ${ten}`, "phang", A("wipe", t0 + 200, 600)) + tx; }).join("")
    + T("dai-ghi", 120, 900, 1680, "70 / 30 = tỷ lệ đồng chi trả: Bảo Việt trả 70 %, người được bảo hiểm tự trả 30 %.", A("fade", 2400, 400))
    + nguon("Phụ lục 1 mục 2 hợp đồng An Gia. Hóa đơn 10 triệu là ví dụ minh hoạ của nhóm."));
}

// ============ 11 CHẬM PHÍ ============
{ const B = [["Ký hợp đồng", "file-certificate", P.x1], ["Hạn thanh toán", "calendar-x", P.x1], ["Chưa đóng đủ phí", "coins", P.v1], ["Tự động hủy bỏ", "ban", P.d1]];
  sec("noi-dung", "sang", "Điều 4: phí đóng một lần, trước hoặc trong ngày hạn thanh toán. Không đóng đúng và đủ thì hợp đồng tự động hủy bỏ, trừ khi có thỏa thuận khác. Hợp đồng không ghi cụm 'không cần thông báo trước' — đó là cách diễn đạt của nhóm trong bài viết, nhóm đã bỏ khi lên slide.",
    nen(NEN.cheo()) + dau("Điều 4 · Phí bảo hiểm", "Chậm phí là [mất hợp đồng]", "Không đóng đủ phí đúng hạn, hợp đồng tự hủy bỏ — trừ khi có thỏa thuận khác.", 11)
    + lop(`<path d="M240 470 H1680" stroke="${P.x3}" stroke-width="6"/>` + [0, 1, 2].map((k) => muiTen(300 + k * 480, 470, 690 + k * 480, 470, k === 2 ? P.d1 : P.x2, 6)).join(""), 230, 440, 1460, 60, "Trục thời gian từ ký hợp đồng đến hủy bỏ", "phang", A("wipe", 400, 900))
    + B.map(([s, i, m], k) => { const cx = 240 + k * 480, t0 = 500 + k * 350;
      return lop(`<circle cx="${cx}" cy="470" r="70" fill="${m}"/>` + icon(i, cx, 470, 64, P.nen, 3), cx - 70, 400, 140, 140, `Mốc ${s}`, "phang", A("pop", t0, 400)) + T(`moc-t${k === 3 ? " do" : ""}`, cx - 160, 560, 320, s, A("fade", t0 + 100, 300)); }).join("")
    + khoi(120, 680, 1680, 200, "the-vang", "Khung trích Điều 4", A("rise", 1900, 500)) + khoi(120, 680, 14, 200, "gach-doc", "Vạch trích", A("rise", 1900, 500))
    + T("trich-vua", 180, 712, 1580, "“Hợp đồng bảo hiểm sẽ [tự động hủy bỏ] trong trường hợp phí bảo hiểm không được thanh toán đúng và đủ theo như quy định trên trừ khi có thỏa thuận khác.”", A("fade", 2100, 600))
    + nguon("Điều 4 hợp đồng An Gia (nguyên văn)."));
}

// ============ 12 TRÍCH LUẬT ĐIỀU 26 ✚ ============
sec("trich", "chia", "Đây là nhận xét nhóm bổ sung. Luật Kinh doanh bảo hiểm không dùng chữ hủy bỏ cho trường hợp này. Khoản 1 Điều 26 cho doanh nghiệp quyền đơn phương chấm dứt thực hiện hợp đồng khi bên mua không đóng hoặc không đóng đủ phí. Theo Bộ luật Dân sự 2015, hủy bỏ làm hợp đồng mất hiệu lực từ lúc giao kết (Điều 427), còn đơn phương chấm dứt chỉ chấm dứt từ khi bên kia nhận thông báo (Điều 428). Chữ 'tự động hủy bỏ' vừa lệch thuật ngữ luật vừa bất lợi cho người mua — tranh chấp sẽ xoay quanh chỗ này.",
  lop(`<rect x="0" y="0" width="960" height="1080" fill="${P.x1}"/>` + mh.cham(80, 990, 6, 2, 26, 5, P.x2), 0, 0, 960, 1080, "Panel màu chủ bên trái", "phang", A("fade", 0, 500))
  + chip("Đối chiếu luật ✚", 120, 80, "chip vang", A("fade", 100, 400)) + T("so-trang", 1600, 84, 200, `12 / ${TONG}`)
  + `<h1 class="td sang" data-t data-tieu-de ${A("rise", 200, 600)} style="left:120px;top:132px;width:780px">${em("Luật gọi là [đơn phương chấm dứt]")}</h1>`
  + lop([0, 64].map((d) => `<circle cx="${138 + d}" cy="420" r="24" fill="${P.v2}"/><path d="M${114 + d} 420 Q${110 + d} 374 ${150 + d} 356 L${154 + d} 368 Q${130 + d} 380 ${136 + d} 410 Z" fill="${P.v2}"/>`).join(""), 100, 346, 150, 100, "Dấu ngoặc kép", "phang", A("pop", 600, 400))
  + T("trich sang", 120, 470, 760, "Doanh nghiệp bảo hiểm … hoặc bên mua bảo hiểm có quyền [đơn phương chấm dứt thực hiện] hợp đồng bảo hiểm … : Bên mua bảo hiểm không đóng phí bảo hiểm hoặc không đóng đủ phí bảo hiểm theo thời hạn thỏa thuận hoặc sau thời gian gia hạn đóng phí", A("fade", 800, 800))
  + chip("Khoản 1 Điều 26 · Luật KDBH 08/2022/QH15", 120, 930, "chip vien", A("rise", 1500, 400))
  + [["Hủy bỏ", "chữ của hợp đồng", "Mất hiệu lực từ lúc giao kết", "Điều 427 BLDS 2015", "dau-do", P.d4], ["Đơn phương chấm dứt", "chữ của Luật KDBH", "Chấm dứt từ khi bên kia nhận thông báo", "Điều 428 BLDS 2015", "dau-xanh", P.x4]].map(([t, ai, hq, cc, cls], k) => { const y = 150 + k * 440, t0 = 1700 + k * 500;
    return khoi(1074, y + 14, 740, 380, "bong", "Bóng thẻ", A("rise", t0, 500)) + khoi(1060, y, 740, 380, "the-trang", `Thẻ ${t}`, A("rise", t0, 500)) + khoi(1060, y, 740, 120, cls, `Đầu thẻ ${t}`, A("rise", t0, 500))
      + T(`hq-t${k ? " sang" : ""}`, 1100, y + 18, 660, t, A("fade", t0 + 150, 300)) + T(`hq-ai${k ? " sang" : ""}`, 1100, y + 72, 660, ai, A("fade", t0 + 200, 300))
      + T("hq-m", 1100, y + 160, 660, hq, A("fade", t0 + 300, 400)) + T("hq-cc", 1100, y + 300, 660, cc, A("fade", t0 + 350, 300)); }).join(""), { ex: "data-khong-hinh" });

// ============ 13 CHẤM DỨT, GIAN LẬN ============
sec("so-lon", "sang", "Điều 6: muốn chấm dứt, bên nào cũng phải báo trước 30 ngày bằng văn bản. Nếu bên mua chấm dứt, chỉ được hoàn 70 phần trăm phí của thời gian còn lại, và chỉ khi chưa có khoản bồi thường nào được chấp nhận. Nếu Bảo Việt chấm dứt, phải hoàn đủ 100 phần trăm dù đã có khiếu nại hay chưa. Gian lận, trục lợi hoặc tham gia sai đối tượng: hợp đồng bị hủy ngay, mất toàn bộ quyền lợi. Theo cách hiểu của nhóm, 30 phần trăm bị giữ lại là chi phí quản lý, khai thác — hợp đồng không ghi lý do.",
  nen(NEN.tron()) + dau("Điều 6 · Chấm dứt, gian lận", "Bên mua rút: [hoàn 70 %] phí còn lại", "Bảo Việt chủ động chấm dứt thì phải hoàn đủ 100 %; cả hai bên báo trước 30 ngày bằng văn bản.", 13)
  + [["Bên mua chấm dứt", "70 %", "phí thời gian còn lại, nếu chưa có khoản bồi thường nào được chấp nhận", "dau-vang", "toi"], ["Bảo Việt chấm dứt", "100 %", "phí thời gian còn lại, dù đã có khiếu nại hay chưa", "dau-xanh", ""]].map(([t, so, dk, cls, c2], k) => { const x = 120 + k * 560, t0 = 400 + k * 500;
    return khoi(x + 14, 344, 520, 440, "bong", "Bóng thẻ", A("rise", t0, 500)) + khoi(x, 330, 520, 440, "the-trang", `Thẻ ${t}`, A("rise", t0, 500)) + khoi(x, 330, 520, 100, cls, `Đầu thẻ ${t}`, A("rise", t0, 500))
      + T(`the-td nho${c2 ? " toi" : ""}`, x + 36, 354, 460, t, A("fade", t0 + 100, 300)) + T(`so-vua${k ? "" : " vang"}`, x + 36, 452, 460, so, A("pop", t0 + 300, 500)) + T("dk-m", x + 36, 610, 450, dk, A("fade", t0 + 400, 400)); }).join("")
  + khoi(1260, 330, 540, 440, "the-xanh-nhat", "Thẻ công thức", A("rise", 1400, 500))
  + T("ct-nhan", 1300, 360, 470, "Phí thời gian còn lại", A("fade", 1500, 300))
  + T("ct-cong", 1300, 420, 470, "Phí × [ngày còn lại]", A("fade", 1600, 400)) + khoi(1300, 494, 440, 4, "gach", "Gạch phân số", A("fade", 1600, 400)) + T("ct-cong", 1300, 506, 470, "tổng số ngày", A("fade", 1600, 400))
  + T("ct-nhan nho", 1300, 640, 470, "Báo trước 30 ngày bằng văn bản", A("fade", 1700, 300))
  + khoi(120, 820, 1680, 140, "dai-do", "Dải cảnh báo gian lận", A("rise", 2000, 500))
  + huy(150, 840, 100, "alert-triangle", P.d1, P.nen, A("pop", 2100, 300), "Biểu tượng cảnh báo")
  + T("dai-do-t", 280, 846, 1490, "Gian lận, trục lợi, sai đối tượng → [hủy ngay, mất toàn bộ quyền lợi]; chỉ hoàn 70 % phí còn lại nếu chưa từng được bồi thường.", A("fade", 2200, 400))
  + nguon("Điều 6 hợp đồng An Gia."), { ex: "data-khong-hinh" });

// ============ 14 BỒI THƯỜNG ============
{ const B = [["device-mobile", "Giấy yêu cầu trên BaoViet Direct", "xác thực OTP"], ["file-invoice", "Hóa đơn điện tử", "có đường dẫn tra cứu"], ["camera", "Ảnh chụp chứng từ y tế", "không cần công chứng"], ["coins", "Nhận tiền", "trong 15 ngày làm việc"]];
  sec("noi-dung", "sang", "Điều 10 và Phụ lục 1 mục 3: khoản bồi thường đến 10 triệu và không phải di sản thừa kế được nộp hồ sơ mềm qua ứng dụng BaoViet Direct — giấy yêu cầu tạo trên app có xác thực OTP, hóa đơn điện tử có đường dẫn tra cứu, ảnh chụp chứng từ y tế. Bảo Việt trả trong 15 ngày làm việc kể từ khi nhận đủ hồ sơ hợp lệ, và vẫn có quyền đòi bản gốc khi cần. Lưu ý: khoản 1 Điều 31 Luật Kinh doanh bảo hiểm cho mức mặc định 15 ngày khi các bên không thỏa thuận; 15 ngày làm việc là khoảng 3 tuần — hợp pháp vì đã thỏa thuận, nhưng không nên gọi là nhanh.",
    nen(NEN.dat(780)) + dau("Điều 10 · Phụ lục 1 mục 3", "Dưới 10 triệu: [nộp hồ sơ qua điện thoại]", "Khoản bồi thường đến 10 triệu, không phải di sản thừa kế, được nộp hồ sơ mềm qua ứng dụng.", 14)
    + panel(100, 340, 1720, 420) + lop([0, 1, 2].map((k) => muiTen(420 + k * 420, 470, 540 + k * 420, 470, P.x2, 6)).join(""), 410, 440, 1150, 60, "Mũi tên nối các bước", "phang", A("fade", 400, 400))
    + B.map(([i, t, m], k) => { const cx = 330 + k * 420, t0 = 500 + k * 400, cuoi = k === 3;
      return lop(`<circle cx="${cx}" cy="470" r="96" fill="${cuoi ? P.v2 : P.x1}"/>` + icon(i, cx, 470, 92, cuoi ? P.muc : P.nen, 3), cx - 96, 374, 192, 192, `Bước ${k + 1}: ${t}`, "phang", A("pop", t0, 400))
        + `<div class="cap" style="left:${cx - 190}px;top:590px;width:380px"><b data-t class="la-t" ${A("fade", t0 + 100, 300)}>${esc(t)}</b><span data-t class="la-m" ${A("fade", t0 + 200, 300)}>${esc(m)}</span></div>`; }).join("")
    + khoi(120, 810, 1680, 150, "the-trang vien", "Khung đối chiếu Điều 31", A("rise", 2300, 500))
    + chip("Đối chiếu luật ✚", 150, 836, "chip vang nho", A("fade", 2400, 300))
    + T("dc-t", 440, 830, 1330, "Khoản 1 Điều 31 Luật KDBH: không thỏa thuận thì trả trong [15 ngày]. An Gia thỏa thuận {15 ngày làm việc} ≈ 3 tuần.", A("fade", 2500, 400))
    + nguon("Điều 10, Phụ lục 1 mục 3 hợp đồng An Gia; khoản 1 Điều 31 Luật KDBH 08/2022/QH15. Bảo Việt bảo lưu quyền yêu cầu bản gốc."));
}

// ============ 15 ƯU / HẠN CHẾ ============
{ const C = [["Ưu điểm", "dau-xanh", "", [["Thứ tự ưu tiên văn bản rõ", 5], ["Năm mức ngân sách", 7], ["Hồ sơ online đến 10 triệu", 14], ["Trẻ nhỏ ở viện công: không đồng chi trả", 10]]], ["Hạn chế", "dau-do", "do", [["Chờ dài: bệnh có sẵn, sinh con", 9], ["Đồng chi trả 30 % ở cơ sở tư", 10], ["Tự hủy khi chậm phí", 11], ["Loại trừ nằm ở Quy tắc, không ở hợp đồng", 16]]]];
  sec("so-sanh", "sang", "Tổng kết: An Gia minh bạch về cấu trúc — thứ tự ưu tiên văn bản rõ, năm mức ngân sách, hồ sơ online tiện lợi, trẻ nhỏ ở viện công không bị đồng chi trả. Nhưng chặt ở thời gian chờ, đồng chi trả 30 phần trăm ở cơ sở tư, tự hủy khi chậm phí, và danh mục loại trừ nằm hết trong Quy tắc — Điều 7 chỉ dẫn chiếu sang Chương III Quy tắc.",
    nen(NEN.dat(700)) + dau("Tổng kết phần I", "Minh bạch, nhưng [chặt ở bốn chỗ]", "Mỗi ý trỏ về slide đã phân tích; con số trong ô là số slide.", 15)
    + C.map(([t, cls, c2, ds], k) => { const x = 120 + k * 870, t0 = 400 + k * 600;
      return khoi(x + 14, 344, 810, 630, "bong", "Bóng thẻ", A("rise", t0, 500)) + khoi(x, 330, 810, 630, "the-trang", `Thẻ ${t}`, A("rise", t0, 500)) + khoi(x, 330, 810, 120, cls, `Đầu thẻ ${t}`, A("rise", t0, 500))
        + huy(x + 30, 346, 88, k ? "alert-triangle" : "check", k ? P.d4 : P.v2, k ? P.d1 : P.x1, A("pop", t0 + 100, 300), `Biểu tượng ${t}`) + T("the-td sang", x + 140, 358, 600, t, A("fade", t0 + 150, 300))
        + ds.map(([s, so], j) => { const y = 480 + j * 118, t1 = t0 + 300 + j * 150;
          return (j ? khoi(x + 40, y - 18, 730, 2, "vach", "Vạch kẻ", A("fade", t1, 300)) : "") + T("ds-t lon", x + 40, y, 600, s, A("fade", t1, 300)) + chip(String(so), x + 690, y, `chip so${c2 ? " do" : ""}`, A("pop", t1 + 100, 300)); }).join(""); }).join("")
    + nguon("Mục 3.1 bài nhóm; Điều 7 hợp đồng dẫn chiếu Chương III Quy tắc Bảo Việt An Gia."));
}

// ============ 16 KHUYẾN NGHỊ ============
{ const K = [["01", "pencil-check", "Khai thật tiền sử bệnh", "Khai sai có thể bị hủy hợp đồng, mất toàn bộ quyền lợi.", "Điều 6 HĐ · khoản 1 Điều 22 Luật KDBH ✚"], ["02", "book", "Đòi và đọc Quy tắc", "Toàn bộ điểm loại trừ nằm ở Chương III Quy tắc, không ở hợp đồng.", "Điều 7 HĐ"], ["03", "hourglass", "Mua sớm theo mốc chờ", "Bệnh có sẵn, thai sản chờ đến 365 ngày: mua trước khi cần.", "Điều 5 HĐ"]];
  sec("noi-dung", "sang", "Ba khuyến nghị cho người mua. Một, khai thật tiền sử bệnh trên giấy yêu cầu — khai sai là rủi ro lớn nhất, có thể bị hủy hợp đồng và mất toàn bộ quyền lợi; khoản 1 Điều 22 Luật Kinh doanh bảo hiểm cũng quy định hậu quả của vi phạm nghĩa vụ cung cấp thông tin. Hai, đòi và đọc Quy tắc trước khi ký vì toàn bộ điểm loại trừ nằm ở đó. Ba, mua sớm theo các mốc thời gian chờ.",
    nen(NEN.goc()) + dau("Khuyến nghị", "Trước khi ký: [ba việc] của người mua", "Ba thói quen giúp người mua không mất quyền lợi khi cần dùng đến bảo hiểm.", 16)
    + K.map(([so, i, t, m, cc], k) => { const x = 120 + k * 572, t0 = 400 + k * 400;
      return khoi(x + 14, 344, 536, 630, "bong", "Bóng thẻ", A("rise", t0, 500)) + khoi(x, 330, 536, 630, "the-trang", `Thẻ khuyến nghị ${so}`, A("rise", t0, 500))
        + T("kn-so", x + 36, 350, 200, so, A("rise", t0 + 100, 400)) + huy(x + 400, 360, 100, i, k === 0 ? P.v2 : P.x1, k === 0 ? P.muc : P.nen, A("pop", t0 + 200, 300), `Biểu tượng ${t}`)
        + T("kn-t", x + 36, 490, 470, t, A("fade", t0 + 250, 300)) + T("kn-m", x + 36, 640, 470, m, A("fade", t0 + 350, 400))
        + khoi(x, 860, 536, 100, "dai-vang", "Dải căn cứ", A("rise", t0 + 450, 300)) + G("dai-vang-t", x + 36, 860, 470, 100, esc(cc), A("fade", t0 + 500, 300)); }).join("")
    + nguon("Mục 3.2 bài nhóm. ✚ Căn cứ Luật KDBH do nhóm bổ sung."));
}

// ============ 17 MỞ PHẦN II ============
moPhan("II", "Thực trạng thị trường bảo hiểm", "Từ tăng trưởng nóng đến khủng hoảng và phục hồi, 2018 – 9 tháng 2026.", ["Tăng nóng", "2023", "Siết luật", "Phục hồi"],
  [134, 160, 185, 216, 251, 227, 228, 237].map((v, k) => { const h = v * 1.25, x = 1180 + k * 66; return `<rect x="${x}" y="${790 - h}" width="50" height="${h}" rx="8" fill="${k === 4 ? P.v2 : k > 4 ? P.x4 : P.x3}"/>`; }).join("") + `<rect x="1150" y="790" width="580" height="8" rx="4" fill="${P.x4}"/>`,
  "Minh hoạ: cột doanh thu tăng dần, đỉnh năm 2022 tô vàng, sau đó giảm", "Phần hai: thực trạng thị trường bảo hiểm Việt Nam, từ năm 2018 đến 9 tháng năm 2026.");

// ============ 18 TỔNG PHÍ 2018–2025 (hero phần II) ============
{ const Y = [["2018", 133.7, "+24,0"], ["2019", 160.2, "+21,0"], ["2020", 184.7, "+15,0"], ["2021", 216.0, "+16,1"], ["2022", 251.3, "+15,1"], ["2023", 227.1, "−8,0"], ["2024", 227.5, "−0,3"], ["2025", 237.2, "+4,0"]];
  const yb = 860, sc = 470 / 251.3, x0 = 170, st = 205, w = 140;
  sec("so-lon", "sang", "Kết luận trước: sau năm năm tăng nóng, từ 133,7 lên 251,3 nghìn tỷ đồng, thị trường giảm lần đầu năm 2023 còn 227,1, năm 2024 đi ngang, năm 2025 tăng lên 237,2 — vẫn dưới đỉnh năm 2022. Tốc độ tăng giảm lấy theo số cơ quan quản lý công bố, so với số đã điều chỉnh của năm trước, nên có thể lệch nhẹ so với phép chia trực tiếp.",
    nen(NEN.goc()) + dau("Bảng 1 · Hình 1", "2025 vẫn [dưới đỉnh 2022]", "Tổng doanh thu phí bảo hiểm (nghìn tỷ đồng): tăng nóng, giảm lần đầu năm 2023, phục hồi chậm.", 18)
    + panel(100, 316, 1720, 680) + lop(`<path d="M${x0 - 30} ${yb - 251.3 * sc} H${x0 + 7 * st + w + 30}" stroke="${P.v1}" stroke-width="3" stroke-dasharray="12 8"/>`, x0 - 30, yb - 251.3 * sc - 4, 7 * st + w + 60, 8, "Vạch mức đỉnh năm 2022", "phang", A("wipe", 2200, 600))
    + T("dinh-t", x0 - 30, yb - 251.3 * sc - 48, 330, "mức đỉnh 2022", A("fade", 2400, 300))
    + Y.map(([n, v, g], k) => { const x = x0 + k * st, h = v * sc, t0 = 400 + k * 180, giam = g.startsWith("−");
      return lop(`<rect x="${x}" y="${yb - h}" width="${w}" height="${h}" rx="10" fill="${k === 4 ? P.v2 : k > 4 ? P.x1 : P.x3}"/>`, x, yb - h, w, h, `Cột ${n}: ${v} nghìn tỷ`, "phang", A("grow", t0, 500))
        + T(`cot-so${k === 4 ? "" : k > 4 ? " sang" : ""}`, x - 30, yb - h + 14, w + 60, String(v).replace(".", ","), A("fade", t0 + 300, 300))
        + T("cot-nam", x - 30, yb + 14, w + 60, n, A("fade", t0, 300)) + T(`cot-g${giam ? " do" : ""}`, x - 30, yb + 62, w + 60, `${g} %`, A("fade", t0 + 300, 300)); }).join("")
    + nguon("Bộ Tài chính / Cục QLGSBH, số ước tính [5]–[11] của bài nhóm. % theo số công bố, so với số đã điều chỉnh của năm trước."), { ex: "data-hero" });
}

// ============ 19 BANCASSURANCE ============
{ const B = [["2018", 20], ["2021", 40], ["2022", 45]];
  sec("noi-dung", "sang", "Giai đoạn 2018 đến 2022 tăng trên 15 phần trăm mỗi năm. Động lực chính là bảo hiểm nhân thọ bán qua ngân hàng: theo tổng hợp của PSI, tỷ trọng bancassurance trong phí khai thác mới nhân thọ tăng từ khoảng 20 phần trăm năm 2018 lên 40 năm 2021 và 45 năm 2022. Năm 2022 thị trường có 78 doanh nghiệp, tổng tài sản 811.312 tỷ đồng; cũng năm đó Bộ Tài chính thanh tra chuyên đề bán bảo hiểm qua ngân hàng tại 4 doanh nghiệp. Tăng nhanh nhưng phụ thuộc một kênh — rủi ro tích tụ ngay lúc tăng.",
    nen(NEN.cheo()) + dau("2018 – 2022", "Tăng nhờ [bán qua ngân hàng]", "Tỷ trọng bancassurance trong phí khai thác mới bảo hiểm nhân thọ (ước tính, PSI tổng hợp).", 19)
    + panel(100, 330, 900, 650) + B.map(([n, v], k) => { const x = 160 + k * 270, h = 480, hv = (v / 100) * h, yb = 860, t0 = 400 + k * 300;
      return lop(`<rect x="${x}" y="${yb - h}" width="180" height="${h}" rx="14" fill="${P.trang}"/><rect x="${x}" y="${yb - hv}" width="180" height="${hv}" rx="14" fill="${k === 2 ? P.v2 : P.x2}"/>`, x, yb - h, 180, h, `Cột ${n}: ${v} %`, "phang", A("grow", t0, 600))
        + T(`ba-so${k === 2 ? " toi" : " sang"}`, x, yb - hv + 16, 180, `${v} %`, A("fade", t0 + 400, 300)) + T("cot-nam", x - 20, yb + 14, 220, n, A("fade", t0, 300)); }).join("")
    + [["78", "doanh nghiệp bảo hiểm (2022)"], ["811.312", "tỷ đồng tổng tài sản (2022)"]].map(([so, m], k) => { const y = 340 + k * 220, t0 = 1500 + k * 300;
      return khoi(1060, y, 740, 190, "the-xanh-nhat", `Thẻ ${so}`, A("rise", t0, 400)) + T("so-the", 1100, y + 22, 680, so, A("pop", t0 + 100, 400)) + T("so-the-m", 1100, y + 118, 680, m, A("fade", t0 + 200, 300)); }).join("")
    + khoi(1060, 790, 740, 150, "dai-do", "Dải thanh tra 2022", A("rise", 2200, 400)) + T("dai-do-t", 1100, 806, 680, "2022: Bộ Tài chính thanh tra bán bảo hiểm qua ngân hàng tại 4 doanh nghiệp", A("fade", 2300, 400))
    + nguon("[9] Cục QLGSBH 2023; [12] PSI 01/2025; [13] VnBusiness 2023 — theo bài nhóm."));
}

// ============ 20 2023 (nền đậm, số lớn) ============
sec("so-lon", "dam", "Năm 2023: Luật Kinh doanh bảo hiểm 2022 có hiệu lực từ 1/1/2023. Ngày 30/6/2023, Bộ Tài chính công bố kết luận thanh tra tại Prudential, MB Ageas, Sun Life và BIDV MetLife — sai phạm nhiều nhất ở khâu tư vấn. Hệ quả: phí khai thác mới nhân thọ giảm 44,5 phần trăm, số hợp đồng mới giảm 43,8. Tổng phí giảm lần đầu sau khoảng 10 năm, trong khi chi trả quyền lợi tăng 31,14 phần trăm. Sai phạm nằm đúng ở khâu tư vấn — những điều khoản ta vừa đọc ở phần một.",
  nen(mh.cham(1700, 120, 5, 3, 26, 5, P.x2)) + dau("2023 · Khủng hoảng niềm tin", "Phí mới nhân thọ [giảm gần một nửa]", "Kết luận thanh tra bán bảo hiểm qua ngân hàng làm thị trường nhân thọ sụt mạnh.", 20, true)
  + T("so-khung", 111, 330, 900, "−44,5 %", A("pop", 400, 600)) + T("so-khung-m", 118, 560, 860, "phí khai thác mới bảo hiểm nhân thọ", A("fade", 700, 400))
  + T("so-khung nho", 114, 660, 900, "−43,8 %", A("pop", 1000, 500)) + T("so-khung-m", 118, 820, 860, "số hợp đồng nhân thọ khai thác mới", A("fade", 1200, 400))
  + lop(`<path d="M1160 380 V820" stroke="${P.x3}" stroke-width="4"/><circle cx="1160" cy="400" r="16" fill="${P.v2}"/><circle cx="1160" cy="620" r="16" fill="${P.v2}"/>`, 1140, 370, 40, 460, "Trục hai mốc năm 2023", "phang", A("wipe", 1500, 600))
  + [["01/01/2023", "Luật KDBH 2022 có hiệu lực", 380], ["30/6/2023", "Kết luận thanh tra Prudential, MB Ageas, Sun Life, BIDV MetLife", 600]].map(([d, m, y], k) => `<div class="cap" style="left:1210px;top:${y}px;width:600px"><b data-t class="dong-t v3" ${A("fade", 1700 + k * 300, 400)}>${esc(d)}</b><span data-t class="dong-m sang" ${A("fade", 1800 + k * 300, 400)}>${esc(m)}</span></div>`).join("")
  + chip("Cùng năm: chi trả quyền lợi +31,14 %", 1210, 860, "chip vang nt", A("rise", 2400, 400))
  + nguon("[1] Luật KDBH 08/2022/QH15; [10] VnEconomy; [14] Báo Thanh tra 01/7/2023; [15] IAV qua VnEconomy.", true), { ex: "data-khong-hinh" });

// ============ 21 TRÍCH LUẬT TCTD (ảnh) ============
sec("trich", "anh", "Phản ứng chính sách: từ 1/7/2024, khoản 5 Điều 15 Luật Các tổ chức tín dụng 2024 cấm tổ chức tín dụng và nhân viên gắn việc bán bảo hiểm không bắt buộc với việc cung ứng sản phẩm, dịch vụ ngân hàng dưới mọi hình thức. Ví dụ thực tế: ngân hàng không được buộc khách mua bảo hiểm mới cho vay.",
  anh("trich-full.jpg", 0, 0, 1920, 1080, "Ảnh: bàn tay cầm bản hợp đồng đã ký, phủ dải màu chủ bên trái", A("fade", 0, 900))
  + chip("2024 · Siết luật", 120, 80, "chip vang", A("fade", 200, 400)) + `<h1 class="td sang" data-t data-tieu-de ${A("rise", 300, 600)} style="left:120px;top:132px;width:1100px">${em("Ngân hàng [bị cấm gắn bán] bảo hiểm")}</h1>` + chip(`21 / ${TONG}`, 1690, 80, "chip")
  + lop([0, 70].map((d) => `<circle cx="${138 + d}" cy="400" r="26" fill="${P.v2}"/><path d="M${112 + d} 400 Q${108 + d} 350 ${152 + d} 332 L${156 + d} 344 Q${130 + d} 358 ${136 + d} 390 Z" fill="${P.v2}"/>`).join(""), 100, 322, 160, 110, "Dấu ngoặc kép", "phang", A("pop", 700, 400))
  + T("trich sang", 176, 450, 960, "Nghiêm cấm: Tổ chức tín dụng, chi nhánh ngân hàng nước ngoài, người quản lý, người điều hành, nhân viên … [gắn việc bán sản phẩm bảo hiểm không bắt buộc] với việc cung ứng sản phẩm, dịch vụ ngân hàng dưới mọi hình thức.", A("fade", 900, 900))
  + chip("Khoản 5 Điều 15 · Luật Các TCTD 32/2024/QH15 · hiệu lực 01/7/2024", 180, 900, "chip vien", A("rise", 1700, 400)), { ex: "data-hero" });

// ============ 22 BÃO YAGI ============
{ const W = 1500, sc = W / 12811, R = [["Thiệt hại ước tính", 12811, "12.811 tỷ", P.d4], ["Tạm ứng, giữa 10/2024", 213, "213 tỷ", P.x2], ["Tạm ứng, đến 9/1/2025", 956.5, "956,5 tỷ", P.x1]];
  sec("noi-dung", "sang", "Năm 2024 phi nhân thọ tăng 10,2 phần trăm nhưng bão Yagi là phép thử lớn. Theo Cục Quản lý, giám sát bảo hiểm, thiệt hại ước tính khoảng 12.811 tỷ đồng; đến giữa tháng 10/2024 mới tạm ứng 213 tỷ; đến 9/1/2025 đạt 956,5 tỷ — khoảng 7,5 phần trăm thiệt hại ước tính. Con số 7,5 phần trăm do nhóm tự tính. Quy định mới giúp thị trường minh bạch hơn, nhưng tốc độ giải quyết bồi thường khi có thiên tai lớn còn chậm.",
    nen(NEN.dat(820)) + dau("2024 · Bão Yagi", "Tạm ứng mới bằng [≈ 7,5 %] thiệt hại", "Bốn tháng sau bão, số tiền tạm ứng bồi thường vẫn chưa tới một phần mười ba thiệt hại ước tính.", 22)
    + panel(100, 340, 1720, 470) + R.map(([t, v, s, m], k) => { const y = 360 + k * 150, w = Math.max(Math.round(v * sc), 10), t0 = 500 + k * 500;
      return T("yagi-t", 120, y, 900, t, A("fade", t0, 300)) + lop(`<rect x="120" y="${y + 50}" width="${w}" height="64" rx="10" fill="${m}"/>`, 120, y + 50, w, 64, `Thanh ${t}: ${s} đồng`, "phang", A("wipe", t0, 700))
        + T(`yagi-so${k === 0 ? " do" : ""}`, k === 0 ? 160 : Math.max(120 + w + 24, 200), y + 56, 300, s, A("fade", t0 + 500, 300)); }).join("")
    + khoi(120, 840, 1680, 120, "the-trang", "Khung nhận xét", A("rise", 2200, 400))
    + T("dai-ghi", 160, 866, 1600, "956,5 / 12.811 ≈ [7,5 %] (nhóm tự tính). Phi nhân thọ 2024 vẫn tăng 10,2 %.", A("fade", 2300, 400))
    + nguon("[16] VCCI, [17] VietnamFinance — số liệu Cục QLGSBH; [11] Tạp chí Kinh tế – Tài chính 27/10/2026."));
}

// ============ 23 NT vs PNT ============
{ const D2 = [["2023", -12.5, 2.87, "−12,5", "+2,87"], ["2024", -5, 10.2, "−5", "+10,2"], ["2025", 0.5, 10.5, "+0,5", "+10–11"], ["9T/2026", -4, 15.1, "≈ −4", "+15,1"]];
  const y0 = 680, sc = 16, bw = 130, st = 420, x0 = 200;
  sec("so-lon", "sang", "Hai xu hướng ngược chiều. Nhân thọ giảm 12,5 phần trăm năm 2023, khoảng 5 phần trăm năm 2024, gần đi ngang năm 2025 và 9 tháng 2026 vẫn giảm khoảng 4 phần trăm. Phi nhân thọ tăng 2,87 phần trăm năm 2023, 10,2 năm 2024, khoảng 10 đến 11 năm 2025 và 15,1 phần trăm trong 9 tháng 2026. Phi nhân thọ giữ cho thị trường không giảm sâu hơn. Luật số 139/2025 sửa đổi Luật Kinh doanh bảo hiểm có hiệu lực từ 1/1/2026, cắt giảm điều kiện kinh doanh.",
    nen(NEN.goc()) + dau("2023 – 9 tháng 2026", "[Phi nhân thọ] kéo, nhân thọ chưa hồi", "Tăng / giảm doanh thu phí so với cùng kỳ năm trước (%).", 23)
    + panel(100, 310, 1720, 690) + chip("Nhân thọ", 120, 330, "chip nt", A("fade", 300, 300)) + chip("Phi nhân thọ", 290, 330, "chip vang nt", A("fade", 300, 300))
    + lop(`<path d="M150 ${y0} H1800" stroke="${P.phu}" stroke-width="3"/>`, 150, y0 - 2, 1650, 4, "Trục 0 %", "phang", A("wipe", 300, 500))
    + D2.map(([n, a, b, sa, sb], k) => { const x = x0 + k * st, t0 = 600 + k * 400, ha = Math.abs(a) * sc, hb = b * sc;
      const ra = a < 0 ? `<rect x="${x}" y="${y0}" width="${bw}" height="${ha}" rx="8" fill="${P.x1}"/>` : `<rect x="${x}" y="${y0 - Math.max(ha, 6)}" width="${bw}" height="${Math.max(ha, 6)}" rx="4" fill="${P.x1}"/>`;
      return lop(ra + `<rect x="${x + bw + 12}" y="${y0 - hb}" width="${bw}" height="${hb}" rx="8" fill="${P.v2}"/>`, x, y0 - 15.1 * sc, 2 * bw + 12, (15.1 + 12.5) * sc, `Năm ${n}: nhân thọ ${sa} %, phi nhân thọ ${sb} %`, "phang", A("grow", t0, 600))
        + T("dv-so", x - 20, a < 0 ? y0 + ha + 8 : y0 - Math.max(ha, 6) - 50, bw + 40, sa, A("fade", t0 + 400, 300)) + T("dv-so vang", x + bw - 8, y0 - hb - 50, bw + 40, sb, A("fade", t0 + 400, 300))
        + T("cot-nam", x - 10, 960, 2 * bw + 32, n, A("fade", t0, 300)); }).join("")
    + nguon("[10], [11], [21], [22] theo bài nhóm; 2025 phi nhân thọ “khoảng 10–11 %” (vẽ 10,5). Luật 139/2025/QH15 hiệu lực 01/01/2026."));
}

// ============ 24 KẾT ============
{ const K = [["1", "An Gia đủ chuẩn luật, nhưng thời gian chờ, đồng chi trả, chậm phí có thể làm người mua mất quyền lợi."], ["2", "Năm 2023 là cái giá của tư vấn sai khi bán bảo hiểm qua ngân hàng."], ["3", "Phi nhân thọ đang dẫn dắt; nhân thọ chưa phục hồi."]];
  sec("ket", "dam", "Ba điều nhóm muốn các bạn mang về. Một, hợp đồng An Gia đủ chuẩn luật nhưng vẫn có những điều khoản làm người mua mất quyền lợi nếu không đọc kỹ. Hai, năm 2023 là cái giá của tư vấn sai. Ba, phi nhân thọ đang dẫn dắt, nhân thọ chưa phục hồi. Cảm ơn thầy cô và các bạn đã lắng nghe; nhóm xin nhận câu hỏi.",
    nen(mh.cham(120, 96, 5, 3, 26, 5, P.v2) + `<circle cx="1920" cy="1080" r="420" fill="${P.x2}"/>`)
    + chip("Kết luận", 120, 80, "chip vang", A("fade", 0, 400)) + T("so-trang sang", 1600, 84, 200, `24 / ${TONG}`)
    + `<h1 class="ket-td" data-t data-tieu-de ${A("rise", 200, 700)} style="left:120px;top:150px;width:1560px">${em("Đọc kỹ hợp đồng là [việc của người mua]")}</h1>`
    + K.map(([so, s], k) => { const y = 430 + k * 170, t0 = 900 + k * 500;
      return khoi(120, y, 120, 120, "o-so nho", `Ô số ${so}`, A("pop", t0, 400)) + T("ket-so", 120, y + 6, 120, so, A("pop", t0, 400)) + T("ket-m", 280, y + 4, 1480, s, A("fade", t0 + 150, 500)); }).join(""), { ex: "data-khong-hinh", trans: "push", dur: 700 });
}

// ============ 25 TÀI LIỆU THAM KHẢO ============
{ const L = ["Luật KDBH 08/2022/QH15 (sửa đổi năm 2025)", "Luật Các TCTD 32/2024/QH15 (khoản 5 Điều 15)", "Bộ luật Dân sự 91/2015/QH13 (Điều 427, 428)", "Quy tắc An Gia, QĐ 6029/QĐ-BHBV (2025)"];
  const S2 = ["Bộ Tài chính, Cục QLGSBH — số liệu 2018–2025", "Tạp chí Kinh tế – Tài chính (2023, 27/10/2026)", "PSI — Báo cáo ngành bảo hiểm (01/2025)", "VnEconomy, Thanh tra, VCCI, IAV…"];
  sec("noi-dung", "sang", "Danh sách đầy đủ 22 tài liệu tham khảo có trong bài viết của nhóm. Đây là thông tin pháp luật chung phục vụ học tập. Nhóm xin cảm ơn và mời thầy cô, các bạn đặt câu hỏi.",
    nen(NEN.dat(800)) + dau("Nguồn", "Tài liệu [tham khảo]", "Đủ 22 nguồn trong bài viết của nhóm; đây là thông tin pháp luật chung.", 25)
    + [["Văn bản pháp luật", L, "dau-xanh", "scale"], ["Nguồn số liệu", S2, "dau-vang", "chart-bar"]].map(([t, ds, cls, i], k) => { const x = 120 + k * 870, t0 = 400 + k * 400;
      return khoi(x, 330, 810, 480, "the-trang", `Thẻ ${t}`, A("rise", t0, 400)) + khoi(x, 330, 810, 100, cls, `Đầu thẻ ${t}`, A("rise", t0, 400))
        + huy(x + 24, 344, 72, i, k ? P.x1 : P.v2, k ? P.nen : P.x1, A("pop", t0 + 100, 300), `Biểu tượng ${t}`) + T(`the-td nho${k ? " toi" : " sang"}`, x + 120, 352, 640, t, A("fade", t0 + 100, 300))
        + ds.map((s, j) => T("tl-dong", x + 36, 460 + j * 82, 740, s, A("fade", t0 + 200 + j * 100, 300))).join(""); }).join("")
    + T("cam-on", 120, 850, 1680, "Cảm ơn thầy cô và các bạn — [mời đặt câu hỏi]", A("rise", 1600, 500)), { ex: "data-khong-hinh" });
}

// ============ STYLE ============
ghi(path.join(D, "style.css"), `section.s{background:${P.nen};color:${P.muc}}section.s.dam{background:${P.x1};color:${P.nen}}section.s.chia{background:${P.nen}}section.s.anh{background:${P.x1}}
section.s > div, section.s > h1{position:absolute}
[data-t]{text-wrap:pretty}.td,.bia-td,.mp-t,.ket-td{text-wrap:balance}
em{font-style:normal;color:${P.x2}}em.v{color:${P.v1}}em.r{color:${P.d0}}.dam em,.anh em,.chia .sang em{color:${P.v3}}
.giua{display:flex;align-items:center}.can{text-align:center}.phai{text-align:right}
.chip{font:700 28px/1 'Be Vietnam Pro';letter-spacing:.06em;text-transform:uppercase;color:${P.nen};background:${P.x1};padding:11px 18px 10px;border-radius:6px;white-space:nowrap;width:auto !important}
.chip.vang{background:${P.v3};color:${P.muc}}.chip.vien{background:${P.v4};color:${P.muc};text-transform:none;letter-spacing:0;font-size:28px}
.chip.nt{font-size:30px;letter-spacing:0;text-transform:none;padding:10px 16px 9px}.chip.nho{font-size:26px;letter-spacing:0;text-transform:none;padding:9px 14px 8px}
.chip.so{font-size:30px;letter-spacing:0;padding:9px 16px;background:${P.trang};color:${P.x1};border:2px solid ${P.x3}}.chip.so.do{background:${P.trang};color:${P.d0};border-color:${P.d4}}
.td{font:700 72px/1.1 'Lora';color:${P.muc}}.td.sang{color:${P.nen}}.dan{font:400 34px/1.4 'Be Vietnam Pro';color:${P.phu}}.dan.sang{color:${P.x4}}
.so-trang{font:600 24px/1 'Be Vietnam Pro';color:${P.phu};text-align:right}.so-trang.sang{color:${P.x4}}
.nguon{font:400 26px/1.35 'Be Vietnam Pro';color:${P.phu}}.nguon.sang{color:${P.x4}}
.the-trang{background:${P.trang};border-radius:20px}.the-trang.vien{border:3px solid ${P.x4}}.bong{background:${P.x3};border-radius:22px}
.the-noi{background:${P.trang};border-radius:20px;border:2px solid ${P.ke}}.noi-t{font:800 34px/1.2 'Be Vietnam Pro';color:${P.x1}}.noi-m{font:400 30px/1.3 'Be Vietnam Pro';color:${P.phu}}
.dau-xanh{background:${P.x1};border-radius:20px 20px 0 0}.dau-vang{background:${P.v2};border-radius:20px 20px 0 0}.dau-do{background:${P.d1};border-radius:20px 20px 0 0}
.gach{background:${P.v2};border-radius:6px}.vach{height:2px;background:${P.ke}}.gach-doc{background:${P.v2};border-radius:6px 0 0 6px}
.bia-td{position:absolute;font:700 120px/1.06 'Lora';color:${P.muc}}.bia-mo{font:400 34px/1.45 'Be Vietnam Pro';color:${P.phu}}
.o-so{background:${P.v2};border-radius:24px}.o-so.nho{border-radius:20px}.mp-so{font:700 200px/1.15 'Lora';color:${P.x1};text-align:center}
.mp-t{position:absolute;font:700 88px/1.08 'Lora';color:${P.nen}}.mp-m{font:400 34px/1.45 'Be Vietnam Pro';color:${P.x4}}
.cap > b,.cap > span{display:block}.cap > span{margin-top:6px}
.la-t{font:800 32px/1.25 'Be Vietnam Pro';color:${P.x1};text-align:center}.la-m{font:400 30px/1.3 'Be Vietnam Pro';color:${P.phu};text-align:center}
.kc-so{font:700 120px/1.2 'Lora';color:${P.nen}}.kc-so.toi{color:${P.muc}}.the-td{font:700 44px/1.15 'Lora';color:${P.nen}}.the-td.toi{color:${P.muc}}.the-td.nho{font-size:40px}.the-td.sang{color:${P.nen}}
.the-chu{font:400 36px/1.4 'Be Vietnam Pro';color:${P.muc}}
.bh{background:${P.x1};border-radius:14px 14px 0 0}.bh-t{font:700 30px/1.2 'Be Vietnam Pro';color:${P.nen}}
.hang{background:${P.trang};border-bottom:2px solid ${P.ke}}.hang.le{background:${P.x4}}.hang.nhan{background:${P.v4}}
.so-o{font:800 32px/1 'Lora';color:${P.x1}}.o-chu{font:500 30px/1.2 'Be Vietnam Pro';color:${P.muc}}.o-chu.vang{font-weight:800;color:${P.muc}}
.giay{background:${P.trang};border-radius:14px;border:2px solid ${P.ke}}.giay-bong{background:${P.x4};border-radius:14px}.tl-t{font:600 32px/1.25 'Be Vietnam Pro';color:${P.muc}}
.cot-nhan{font:700 30px/1.2 'Be Vietnam Pro';color:${P.x1}}.cot-nhan.phai{text-align:right}
.bac-so{font:700 96px/1 'Lora';color:${P.nen};text-align:center}.bac-so.toi{color:${P.x1}}.bac-t{font:700 30px/1.25 'Be Vietnam Pro';color:${P.muc}}
.goi-t{font:700 36px/1 'Lora';color:${P.muc}}.goi-so{font:800 40px/1.4 'Be Vietnam Pro';color:${P.x1};text-align:right}.goi-so.sang{color:${P.nen}}.goi-nv{font:700 34px/1 'Be Vietnam Pro';color:${P.v1}}
.ds-t{font:500 30px/1.3 'Be Vietnam Pro';color:${P.muc}}.ds-t.lon{font-size:32px;font-weight:600}
.bs-the{background:${P.trang};border-radius:16px;border:2px solid ${P.x4}}.bs-the.vang{background:${P.v4};border-color:${P.v3}}.bs-t{font:700 32px/1.2 'Be Vietnam Pro';color:${P.muc}}
.cho-t{font:600 32px/1.2 'Be Vietnam Pro';color:${P.muc}}.cho-t.vang{color:${P.v1};font-weight:800}.cho-so{font:800 34px/1.6 'Be Vietnam Pro';color:${P.x1}}.cho-so.vang{color:${P.v1}}
.dai-xanh-nhat{background:${P.x4};border-radius:16px}.dai-ghi{font:600 32px/1.4 'Be Vietnam Pro';color:${P.muc}}
.ct-ten{font:700 32px/1.3 'Be Vietnam Pro';color:${P.muc}}.ct-o{font:800 34px/1.2 'Be Vietnam Pro';color:${P.nen}}.ct-o.do{color:${P.d0}}
.moc-t{font:800 32px/1.25 'Be Vietnam Pro';color:${P.x1};text-align:center}.moc-t.do{color:${P.d0}}
.the-vang{background:${P.v4};border-radius:0 20px 20px 0}.trich-vua{font:700 38px/1.45 'Lora';color:${P.muc}}
.trich{font:700 40px/1.45 'Lora'}.trich.sang{color:${P.nen}}
.hq-t{font:700 44px/1.1 'Lora';color:${P.nen}}.hq-ai{font:600 32px/1.2 'Be Vietnam Pro';color:${P.nen}}.hq-ai.sang{color:${P.x4}}.hq-m{font:700 38px/1.3 'Be Vietnam Pro';color:${P.muc}}.hq-cc{font:600 28px/1.2 'Be Vietnam Pro';color:${P.phu}}
.so-vua{font:700 140px/1.1 'Lora';color:${P.x1}}.so-vua.vang{color:${P.v1}}.dk-m{font:400 30px/1.35 'Be Vietnam Pro';color:${P.phu}}
.the-xanh-nhat{background:${P.x4};border-radius:20px}.ct-nhan{font:800 32px/1.25 'Be Vietnam Pro';color:${P.x1}}.ct-nhan.nho{font-size:30px;color:${P.muc}}.ct-cong{font:700 44px/1.3 'Lora';color:${P.muc}}
.dai-do{background:${P.d4};border-radius:16px}.dai-do-t{font:700 32px/1.35 'Be Vietnam Pro';color:${P.d0}}
.dc-t{font:600 32px/1.35 'Be Vietnam Pro';color:${P.muc}}
.kn-so{font:700 96px/1 'Lora';color:${P.v1}}.kn-t{font:700 44px/1.15 'Lora';color:${P.muc}}.kn-m{font:400 32px/1.35 'Be Vietnam Pro';color:${P.phu}}
.dai-vang{background:${P.v4};border-radius:0 0 20px 20px}.dai-vang-t{font:700 28px/1.3 'Be Vietnam Pro';color:${P.muc}}
.dinh-t{font:800 32px/1 'Be Vietnam Pro';color:${P.v1}}.cot-so{font:800 36px/1.2 'Be Vietnam Pro';color:${P.muc};text-align:center}.cot-so.vang{color:${P.v1}}
.cot-nam{font:700 32px/1.2 'Lora';color:${P.muc};text-align:center}.cot-g{font:800 32px/1.2 'Be Vietnam Pro';color:${P.x1};text-align:center}.cot-g.do{color:${P.d0}}
.ba-so{font:800 40px/1 'Be Vietnam Pro';text-align:center}.ba-so.sang{color:${P.nen}}.ba-so.toi{color:${P.muc}}
.so-the{font:700 80px/1.1 'Lora';color:${P.x1}}.so-the-m{font:500 32px/1.3 'Be Vietnam Pro';color:${P.phu}}
.so-khung{font:700 220px/1 'Lora';color:${P.v3}}.so-khung.nho{font-size:150px;color:${P.x3}}.so-khung-m{font:600 34px/1.3 'Be Vietnam Pro';color:${P.x4}}
.dong-t{font:800 34px/1.25 'Be Vietnam Pro';color:${P.muc}}.dong-t.v3{color:${P.v3}}.dong-m{font:400 32px/1.35 'Be Vietnam Pro';color:${P.phu}}.dong-m.sang{color:${P.nen}}
.yagi-t{font:700 32px/1.2 'Be Vietnam Pro';color:${P.muc}}.yagi-so{font:800 40px/1.3 'Be Vietnam Pro';color:${P.x1}}.yagi-so.do{color:${P.d0}}
.dv-so{font:800 34px/1.2 'Be Vietnam Pro';color:${P.x1};text-align:center}.dv-so.vang{color:${P.v1}}
.ket-td{position:absolute;font:700 84px/1.1 'Lora';color:${P.nen}}.ket-so{font:700 80px/1.4 'Lora';color:${P.x1};text-align:center}.ket-m{font:600 38px/1.35 'Be Vietnam Pro';color:${P.nen}}
.panel-nen{background:${P.x4};border-radius:28px}.cot-so.sang{color:${P.nen}}.cot-nhan.sang{color:${P.v3};font-size:32px}
.panel-toi-vuong{background:${P.x1};border-radius:28px 0 0 0}
.tl-dong{font:500 30px/1.3 'Be Vietnam Pro';color:${P.muc}}.cam-on{font:700 52px/1.2 'Lora';color:${P.x1}}
`);
fs.rmSync(path.join(D, "slides"), { recursive: true, force: true });
S.forEach((h, k) => ghi(path.join(D, "slides", `${String(k + 1).padStart(2, "0")}.html`), h));
console.log(`${S.length} slide, ${nL} lớp hình`);
