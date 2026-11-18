// Deck "Hợp đồng bảo hiểm và thực trạng" — Nhóm 2. Skill slide-chuan; hệ thống thiết kế dùng lại từ bài Ch3 ("tư vấn pháp lý — khối phẳng").
// Nội dung + nguồn: noi-dung.md. Kịch bản (sinh tự động từ file này): kich-ban.md.
//   node deck.js && node ../../../.claude/skills/slide-chuan/scripts/dung.js . --ten=hop-dong-bao-hiem-nhom2
const fs = require("fs"), path = require("path");
const D = __dirname, mh = require("./minh-hoa.js"), P = mh.P;
const ghi = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
fs.rmSync(path.join(D, "asset", "hinh"), { recursive: true, force: true });
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const em = (s) => esc(s).replace(/\[([^\]]+)\]/g, "<em>$1</em>").replace(/\{([^}]+)\}/g, '<em class="v">$1</em>');
const TONG = 22, S2 = [], KB = [];
let nL = 0;

// =================== HÀM DỰNG (cùng ngữ pháp với bài Ch3) ===================
const A = (a, at, dur = 500) => `data-a="${a}" data-at="${at}" data-dur="${dur}"`;
const lop = (body, x, y, w, h, alt, loai = "phang", ex = "") => { const f = `l${String(++nL).padStart(2, "0")}.svg`;
  ghi(path.join(D, "asset", "hinh", f), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${body}</svg>`);
  return `<img data-l="lop-${nL}" data-loai="${loai}" data-alt="${esc(alt)}" ${ex} src="asset/hinh/${f}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`; };
const chup = (f, x, y, w, h, alt, ex = "") => `<img data-l="anh-${f.replace(/\W/g, "")}" data-loai="anh-chup" data-alt="${esc(alt)}" ${ex} src="anh/unsplash/${f}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`;
const nen = (body) => lop(body, 0, 0, 1920, 1080, "Hình trang trí", "nen");
const T = (cls, x, y, w, s, ex = "") => `<div class="${cls}" data-t ${ex} style="left:${x}px;top:${y}px;width:${w}px">${em(s)}</div>`;
const G = (cls, x, y, w, h, html, ex = "") => `<div class="${cls} giua" data-t ${ex} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${html}</div>`;
const chip = (s, x = 120, y = 80, cls = "chip", ex = "") => `<div class="${cls}" data-t data-l="c${++nL}" data-alt="Nhãn ${esc(s)}" ${ex} style="left:${x}px;top:${y}px">${esc(s)}</div>`;
const khoi = (x, y, w, h, cls, alt, ex = "", st = "") => `<div class="${cls}" data-l="k${++nL}" data-alt="${esc(alt)}" ${ex} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px${st}"></div>`;
const cap = (x, y, w, a, b, ka = "la-t", kb = "la-m", t0 = 0) => `<div class="cap" style="left:${x}px;top:${y}px;width:${w}px"><b data-t class="${ka}" ${A("fade", t0, 400)}>${em(a)}</b><span data-t class="${kb}" ${A("fade", t0 + 100, 400)}>${em(b)}</span></div>`;
const dau = (kk, td, dan, so, x = 120, w = 1500) => chip(kk, x, 80, "chip", A("fade", 0, 400)) + `<h1 class="td" data-t data-tieu-de ${A("rise", 100, 600)} style="left:${x}px;top:132px;width:${w}px">${em(td)}</h1>` + (dan ? T("dan", x, 246, w + 60, dan, A("fade", 350, 500)) : "") + T("so-trang", 1600, 84, 200, `${so} / ${TONG}`);
const dauToi = (kk, td, dan, so, x = 120, w = 1500) => chip(kk, x, 80, "chip vang", A("fade", 0, 400)) + `<h1 class="td sang" data-t data-tieu-de ${A("rise", 100, 600)} style="left:${x}px;top:132px;width:${w}px">${em(td)}</h1>` + (dan ? T("dan sang", x, 246, w + 60, dan, A("fade", 350, 500)) : "") + T("so-trang sang", 1600, 84, 200, `${so} / ${TONG}`);
const sec2 = (mau, kieu, notes, inner, { ex = "", trans = "fade", dur = 600 } = {}) => {
  const td = (inner.match(/data-tieu-de[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || "";
  KB.push([S2.length + 1, mau, td.replace(/<[^>]+>/g, ""), notes]);
  S2.push(`<section class="s ${kieu}" data-mau="${mau}" data-nen="${kieu}" ${ex} data-trans="${trans}" data-dur="${dur}" data-notes="${esc(notes)}">\n${inner}\n</section>`); };
const NEN = {
  tron: () => `<circle cx="1920" cy="0" r="300" fill="${P.x4}"/>` + mh.cham(1660, 960, 6, 2, 26, 5, P.v2),
  goc: () => `<circle cx="0" cy="1080" r="110" fill="${P.x4}"/><circle cx="1920" cy="0" r="110" fill="${P.v4}"/>`,
  dat: (y0) => `<rect x="0" y="${y0}" width="1920" height="${1080 - y0}" fill="${P.x4}"/>` + mh.cham(1700, 150, 5, 3, 26, 5, P.v2),
};
const hopBadge = (x, y, ten, mau = P.x1, co = 100, ex = "") => lop(`<rect x="${x}" y="${y}" width="${co}" height="${co}" rx="${co * 0.18}" fill="${mau}"/>` + mh.iconNet(D, ten, x + co / 2, y + co / 2, co * 0.6, P.nen, 3), x, y, co, co, `Biểu tượng ${ten}`, "phang", `data-lap ${ex}`);
const badgeNguoi = (x, y, co, mau, ao, ao2, ten, ex = "") => lop(`<rect x="${x}" y="${y}" width="${co}" height="${co}" rx="${co * 0.18}" fill="${mau}"/>` + mh.nguoi(x + co / 2, y + co * 0.94, co * 0.72, { ao, ao2 }), x, y, co, co, `Hình người: ${ten}`, "phang", `data-lap ${ex}`);
const badgeToa = (x, y, co, mau, ex = "") => lop(`<rect x="${x}" y="${y}" width="${co}" height="${co}" rx="${co * 0.18}" fill="${mau}"/>` + mh.toaVP(x + co / 2, y + co * 0.9, co * 0.56), x, y, co, co, "Toà nhà doanh nghiệp bảo hiểm", "phang", `data-lap ${ex}`);
const panel = (x, y, w, h, t0 = 200) => khoi(x, y, w, h, "panel-nen", "Khối nền", A("fade", t0, 500));
const vom = (x, y, w, h) => `M${x} ${y + h} V${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V${y + h} Z`;
const chipsRow = (ds, y0 = 830, x0 = 120, xMax = 900, t0 = 1000) => { let x = x0, y = y0, o = "";
  ds.forEach((s, k) => { const w = Math.round(s.length * 16 + 36); if (x + w > xMax) { x = x0; y += 68; } o += chip(s, x, y, "chip vang nt", A("rise", t0 + k * 120, 400)); x += w + 16; }); return o; };
const mMoPhan = (so, ten, mo, hinh, alt, chips, notes) => sec2("mo-phan", "dam", notes, nen(mh.cham(120, 96, 5, 3, 26, 5, P.v2))
  + lop(`<circle cx="1480" cy="580" r="470" fill="${P.x2}"/>`, 1010, 110, 910, 940, "Mảng tròn sau ảnh", "phang", A("grow", 0, 700))
  + lop(`<circle cx="1430" cy="540" r="430" fill="${P.x4}"/>` + hinh, 1000, 110, 860, 860, alt, "phang", A("pop", 200, 800))
  + lop(`<circle cx="1430" cy="540" r="462" fill="none" stroke="${P.v2}" stroke-width="6"/>` + mh.saoCum(990, 860, 26, P.v3), 960, 70, 940, 950, "Vòng vàng quanh ảnh", "phang", `data-lap ${A("fade", 700, 600)}`)
  + khoi(120, 190, 300, 240, "o-so", "Ô số phần", A("pop", 300, 500)) + T("mp-so", 120, 196, 300, so, `data-dl ${A("pop", 400, 500)}`)
  + `<h1 class="mp-t" data-t data-tieu-de ${A("rise", 600, 600)} style="left:116px;top:480px;width:780px">${esc(ten)}</h1>` + T("mp-m", 118, 720, 720, mo, A("fade", 850, 500))
  + chipsRow(chips), { trans: "push", dur: 700 });
const mCauAnh = (anh, alt, cau, phu, notes) => sec2("cau", "anh", notes, chup(anh, 0, 0, 1920, 1080, alt, A("fade", 0, 900))
  + `<h1 class="cau-anh" data-t data-tieu-de ${A("rise", 500, 700)} style="left:120px;top:560px;width:1500px">${em(cau)}</h1>` + khoi(90, 830, 1520, 150, "tk-the", "Khối nền sau chữ", A("fade", 1100, 500)) + T("cau-anh-phu", 122, 852, 1440, phu, A("fade", 1200, 600)), { ex: "data-hero" });

// =================== 22 SLIDE ===================
// 1 BÌA
sec2("bia", "sang", "Chào thầy cô và các bạn. Nhóm 2 trình bày hai phần: phân tích một mẫu hợp đồng bảo hiểm sức khoẻ thực tế của Bảo Việt, và thực trạng thị trường bảo hiểm thương mại Việt Nam từ 2018 đến 9 tháng năm 2026.",
  nen(`<path d="${vom(1080, 160, 760, 900)}" fill="${P.x4}"/>` + mh.cham(120, 1000, 6, 2, 26, 5, P.v2) + mh.cham(1800, 90, 4, 4, 26, 5, P.v2) + mh.saoCum(940, 220, 28))
  + lop(`<path d="${vom(996, 86, 808, 948)}" fill="none" stroke="${P.v2}" stroke-width="6"/>`, 990, 80, 820, 960, "Viền vòm vàng bao quanh ảnh", "phang", A("fade", 500, 700))
  + chup("bia-vom.png", 1020, 110, 760, 900, "Ảnh: bàn tay nâng một ngôi nhà mô hình — bảo hiểm che chở", A("rise", 0, 900))
  + khoi(840, 850, 620, 150, "the-noi", "Thẻ nổi", A("rise", 1400, 600)) + lop(`<rect x="870" y="880" width="90" height="90" rx="18" fill="${P.x1}"/>` + mh.khien(915, 925, 62, { trai: P.v2, phai: P.v3, dau: P.x1 }), 870, 880, 90, 90, "Biểu tượng khiên", "phang", A("pop", 1600, 400))
  + T("noi-t", 990, 880, 450, "Bảo Việt An Gia", A("fade", 1700, 400)) + T("noi-m", 990, 926, 450, "bảo hiểm sức khoẻ", A("fade", 1800, 400))
  + chip("Báo cáo nhóm 2", 120, 200, "chip", A("fade", 300, 400))
  + `<h1 class="bia-td" data-t data-tieu-de ${A("rise", 600, 700)} style="left:116px;top:290px;width:820px;font-size:112px">${em("Hợp đồng bảo hiểm [và thực trạng]")}</h1>`
  + `<div class="gach" data-l="gach-bia" data-alt="Gạch vàng" ${A("wipe", 1000, 400)} style="left:120px;top:720px;width:150px;height:12px"></div>`
  + T("bia-mo", 120, 768, 680, "Một mẫu hợp đồng thực tế · Thị trường Việt Nam 2018 – 2026", A("fade", 1100, 500)) + T("bia-by", 120, 930, 640, "Nhóm 2", A("fade", 1200, 500)));

// 2 KẾT CẤU
{ const PH = [["I", "Hợp đồng Bảo Việt An Gia", "Tám nhóm điều khoản trọng yếu", "file-certificate", "dau-xanh"], ["II", "Thực trạng thị trường", "Tăng nóng → khủng hoảng 2023 → phục hồi", "chart-bar", "dau-vang"]];
  sec2("noi-dung", "sang", "Bài có hai chương. Chương I đọc kỹ một hợp đồng thật để thấy quyền và nghĩa vụ cụ thể. Chương II đặt hợp đồng đó vào bức tranh thị trường: vì sao doanh thu giảm năm 2023 và phục hồi ra sao.",
    nen(NEN.dat(700)) + dau("Kết cấu", "Hai chương: [một hợp đồng], một thị trường", "Từ điều khoản đến số liệu toàn ngành.", 2)
    + PH.map(([so, ten, mo, ic, cls], k) => { const x = 120 + k * 860, t0 = 500 + k * 400;
      return khoi(x + 14, 354, 820, 600, "bong", "Bóng thẻ", A("rise", t0, 450)) + khoi(x, 340, 820, 600, "the-trang", `Thẻ chương ${so}`, A("rise", t0, 450)) + khoi(x, 340, 820, 180, cls, `Đầu thẻ chương ${so}`, A("rise", t0, 450))
        + T(`kc-so${k ? " toi" : ""}`, x + 36, 360, 200, so, A("rise", t0, 450)) + hopBadge(x + 660, 380, ic, k ? P.x1 : P.v2, 110, A("pop", t0 + 200, 400))
        + T("n2-kc-t", x + 40, 570, 740, ten, A("fade", t0 + 150, 400)) + T("n2-kc-m", x + 40, 660, 740, mo, A("fade", t0 + 250, 400)) + chip(k ? "2018 – 2026" : "13 điều, Phụ lục 1", x + 40, 840, k ? "chip vang" : "chip", A("rise", t0 + 350, 400))
        ; }).join(""));
}

// 3 MỞ PHẦN I
mMoPhan("01", "Hợp đồng Bảo Việt An Gia", "Một hợp đồng bảo hiểm sức khoẻ thật — đọc từ cấu trúc đến từng điều khoản.", `<g transform="rotate(-6 1380 540)">${mh.hopDong(1210, 250, 340)}</g><circle cx="1600" cy="720" r="120" fill="${P.x1}"/>` + mh.iconNet(D, "stethoscope", 1600, 720, 140, P.nen, 4) + mh.saoCum(1180, 330, 26, P.v2), "Minh hoạ: bản hợp đồng và ống nghe y tế — hợp đồng bảo hiểm sức khoẻ",
  ["Cấu trúc", "Chủ thể", "Quyền lợi", "Phí", "Thời gian chờ", "Đồng chi trả", "Chấm dứt", "Bồi thường"],
  "Chương I. Mẫu hợp đồng Bảo Việt An Gia là hợp đồng bảo hiểm sức khoẻ của Tổng Công ty Bảo hiểm Bảo Việt. Nhóm đọc 8 nhóm điều khoản theo thứ tự trên màn hình.");

// 4 CẤU TRÚC — thứ tự ưu tiên (Điều 12)
{ const BAC = [["1", "Sửa đổi bổ sung mới nhất", P.x1, "n2-bac sang"], ["2", "Hợp đồng và các phụ lục", P.x2, "n2-bac sang"], ["3", "Quy tắc bảo hiểm", P.x3, "n2-bac"]];
  const TL = [["file-description", "Giấy yêu cầu"], ["file-certificate", "Hợp đồng — 13 điều"], ["list-check", "Phụ lục 1"], ["file-text", "Sửa đổi bổ sung"], ["files", "Quy tắc bảo hiểm"]];
  sec2("noi-dung", "sang", "Hợp đồng gồm 13 điều và Phụ lục 1, đủ các nội dung cốt lõi: chủ thể, đối tượng, quyền lợi, thời hạn, phí, thời gian chờ, loại trừ, chấm dứt, tranh chấp. Điểm hay là Điều 12: nếu các tài liệu mâu thuẫn thì áp dụng sửa đổi bổ sung mới nhất trước, rồi đến hợp đồng và phụ lục, sau cùng là Quy tắc. Ngoài ra Điều 11 có điều khoản bảo vệ dữ liệu cá nhân, Điều 10 cho phép giải quyết bồi thường điện tử.",
    nen(NEN.goc()) + dau("I · Cấu trúc", "Năm tài liệu, [ba bậc ưu tiên]", "Mâu thuẫn thì bậc trên thắng.", 4)
    + BAC.map(([so, ten, m, cls], k) => { const x = 120 + k * 70, y = 350 + k * 180, t0 = 500 + k * 300;
      return lop(`<rect x="${x}" y="${y}" width="640" height="150" rx="18" fill="${m}"/><circle cx="${x + 75}" cy="${y + 75}" r="44" fill="${P.nen}"/>`, x, y, 640, 150, `Bậc ${so}: ${ten}`, "phang", A("rise", t0, 450))
        + G("n2-bac-so", x + 31, y + 31, 88, 88, `<span style="width:100%;text-align:center">${so}</span>`, A("rise", t0, 450)) + G(cls, x + 150, y, 470, 150, esc(ten), A("rise", t0, 450)); }).join("")
    + lop(`<path d="M960 370 V860" stroke="${P.phu}" stroke-width="4"/><path d="M944 838 L960 868 L976 838" fill="none" stroke="${P.phu}" stroke-width="4" stroke-linejoin="round"/>`, 930, 360, 60, 520, "Mũi tên: mức ưu tiên giảm dần từ bậc 1 xuống bậc 3", "phang", A("wipe", 1400, 600))
    + panel(1040, 340, 760, 620, 300)
    + TL.map(([ic, ten], k) => { const y = 380 + k * 112, t0 = 700 + k * 200; return hopBadge(1080, y, ic, P.x1, 76, A("pop", t0, 300)) + G("n2-tl", 1180, y, 600, 76, esc(ten), A("fade", t0 + 100, 400)); }).join("")
    + T("nguon", 120, 1000, 1680, "Điều 12 hợp đồng Bảo Việt An Gia."));
}

// 5 CHỦ THỂ
{ const D3 = [["Người được bảo hiểm", "được bảo vệ", P.v4, P.v2, P.v1], ["Người thụ hưởng", "khi NĐBH tử vong", P.x4, P.x3, P.x2], ["Người chỉ định nhận tiền", "theo uỷ quyền", P.x4, P.x2, P.x1]];
  sec2("noi-dung", "sang", "Hợp đồng tách bạch năm tư cách. Bên mua bảo hiểm là người giao kết và đóng phí; Bảo Việt cam kết chi trả. Người được bảo hiểm là người có sức khoẻ, tính mạng được bảo vệ — có thể khác người mua. Người thụ hưởng nhận tiền khi người được bảo hiểm tử vong; người chỉ định nhận tiền nhận bồi thường thông thường theo uỷ quyền. Một hợp đồng có thể gồm nhiều người, mỗi người một chương trình, mới hoặc tái tục — tiện cho gói gia đình.",
    nen(NEN.dat(700)) + dau("I · Chủ thể", "Hai bên ký, [năm tư cách] liên quan", "Ai đóng phí, ai được bảo vệ, ai nhận tiền.", 5)
    + badgeNguoi(300, 340, 190, P.x4, P.x2, P.x1, "bên mua bảo hiểm", A("pop", 500, 400)) + cap(220, 548, 360, "Bên mua bảo hiểm", "đóng phí", "la-t", "la-m", 600)
    + lop(`<g transform="rotate(-5 960 440)">${mh.hopDong(880, 330, 160)}</g>`, 850, 320, 230, 260, "Minh hoạ: bản hợp đồng bảo hiểm ở giữa hai bên", "phang", A("pop", 800, 500))
    + badgeToa(1430, 340, 190, P.x1, A("pop", 1000, 400)) + cap(1340, 548, 380, "Bảo Việt", "chi trả", "la-t", "la-m", 1100)
    + lop(`<path d="M500 435 H850 M1080 435 H1420" stroke="${P.phu}" stroke-width="3"/>`, 500, 430, 920, 10, "Đường nối hai bên với hợp đồng", "phang", A("fade", 1200, 500)) + lop(`<path d="M960 640 V670 M410 670 H1510 M410 670 V700 M960 670 V700 M1510 670 V700" fill="none" stroke="${P.phu}" stroke-width="3"/>`, 400, 638, 1120, 64, "Đường nối hợp đồng với ba người liên quan", "phang", A("fade", 1300, 500))
    + D3.map(([a, b, nenT, ao, ao2], k) => { const x = 120 + k * 590, t0 = 1400 + k * 250;
      return (k ? khoi(x - 16, 730, 2, 190, "vach-doc", "Vạch ngăn", A("fade", t0, 300)) : khoi(120, 700, 1680, 250, "the-trang", "Khối ba người liên quan", A("rise", t0, 450))) + badgeNguoi(x + 30, 735, 130, nenT, ao, ao2, a, A("pop", t0 + 100, 400)) + cap(x + 185, 740, 350, a, b, "la-t", "n2-la-m", t0 + 200); }).join("")
    + T("nguon", 120, 990, 1680, "Điều 1, 2, 8 · NĐBH: người được bảo hiểm."));
}

// 6 QUYỀN LỢI — 5 chương trình (T13 thanh tỉ lệ)
{ const CT = [["Đồng", 94], ["Bạc", 138], ["Vàng", 230], ["Bạch Kim", 342], ["Kim Cương", 454]], X = 360, K = 600 / 454;
  const QL = [["bed", "Nội trú ≤ 60 ngày/năm", "khám trước, sau 30 ngày"], ["list-check", "5 quyền lợi bổ sung", "ngoại trú, tai nạn, sinh mạng, nha khoa, thai sản"], ["home", "Chỉ điều trị tại Việt Nam", "mọi gói"]];
  sec2("noi-dung", "sang", "Phụ lục 1 có 5 chương trình từ Đồng đến Kim Cương; tổng hạn mức quyền lợi chính từ 94 đến 454 triệu đồng mỗi người mỗi năm — thanh dài đúng tỷ lệ. Quyền lợi chính là điều trị nội trú do bệnh, tai nạn, biến chứng thai sản, tối đa 60 ngày nằm viện một năm. Người mua chọn thêm 5 quyền lợi bổ sung. Mọi gói chỉ áp dụng điều trị tại Việt Nam.",
    nen(NEN.tron()) + dau("I · Quyền lợi", "Năm mức, hạn mức [94 → 454 triệu]", "Tổng hạn mức quyền lợi chính mỗi năm.", 6)
    + panel(100, 330, 1060, 640)
    + CT.map(([ten, v], k) => { const y = 370 + k * 118, w = Math.round(v * K), t0 = 500 + k * 200, cuoi = k === 4;
      return G("n2-ct", 120, y, 230, 80, esc(ten), A("fade", t0, 400)) + lop(`<rect x="${X}" y="${y + 10}" width="${w}" height="60" rx="10" fill="${cuoi ? P.v2 : k === 0 ? P.x3 : P.x2}"/>`, X, y + 10, w, 60, `Thanh ${ten}: ${v} triệu đồng`, "phang", A("wipe", t0 + 100, 500))
        + T(`n2-ct-so${cuoi ? " vang" : ""}`, X + w + 16, y + 18, 200, `${v}`, A("fade", t0 + 400, 300)); }).join("")
    + QL.map(([ic, a, b], k) => { const y = 350 + k * 210, t0 = 1600 + k * 250;
      return hopBadge(1220, y, ic, P.x1, 96, A("pop", t0, 300)) + cap(1340, y, 460, a, b, "dong-t", "dong-m", t0 + 100) + (k ? `<div class="vach" style="left:1220px;top:${y - 30}px;width:580px"></div>` : ""); }).join("")
    + T("nguon", 120, 1000, 1680, "Phụ lục 1; triệu đồng/người/năm."));
}

// 7 PHÍ — câu chốt nền đậm (Điều 4)
sec2("cau", "dam", "Điều 4: nếu phí không được thanh toán đầy đủ và đúng hạn, bằng tiền mặt hoặc chuyển khoản, hợp đồng tự động huỷ bỏ, không cần thông báo trước, trừ khi có thoả thuận khác. Điều khoản bảo vệ doanh nghiệp trước trường hợp khách chậm phí mà vẫn phát sinh sự kiện bảo hiểm. Nhóm chưa đối chiếu điều khoản này với quy định về đóng phí trong Luật Kinh doanh bảo hiểm 2022 — nếu thầy cô hỏi, đó là hướng phân tích tiếp.",
  nen(`<circle cx="1500" cy="560" r="420" fill="${P.x2}"/>` + mh.cham(120, 980, 6, 2, 26, 5, P.v2))
  + chip("I · Phí bảo hiểm · Điều 4", 120, 80, "chip vang", A("fade", 0, 400)) + T("so-trang sang", 1600, 84, 200, `7 / ${TONG}`)
  + `<h1 class="cau-dam" data-t data-tieu-de ${A("rise", 200, 700)} style="left:120px;top:300px;width:1000px">${em("Chậm đóng phí, hợp đồng [tự động huỷ bỏ]")}</h1>`
  + T("cau-dam-phu", 118, 640, 900, "Không cần thông báo trước, trừ khi hai bên có thoả thuận khác.", A("fade", 900, 500))
  + T("cau-dam-phu", 118, 790, 900, "Mục đích: không để khách chậm phí mà vẫn đòi chi trả.", A("fade", 1200, 500))
  + lop(`<g transform="rotate(6 1500 560)">${mh.hopDong(1330, 330, 340)}</g><circle cx="1620" cy="720" r="120" fill="${P.d4}" stroke="${P.d1}" stroke-width="14"/><path d="M1550 650 L1690 790" stroke="${P.d1}" stroke-width="16" stroke-linecap="round"/>` + `<rect x="1230" y="650" width="150" height="150" rx="26" fill="${P.v2}"/>` + mh.iconNet(D, "calendar", 1305, 725, 92, P.x1, 3),
    1220, 300, 560, 580, "Minh hoạ: lịch hạn đóng phí và bản hợp đồng bị gạch bằng dấu cấm đỏ — hợp đồng bị huỷ", "phang", A("pop", 600, 600)), { ex: "data-hero" });

// 8 THỜI GIAN CHỜ — HERO thanh thời gian
{ const TG = [["Tai nạn", 0], ["Bệnh thường, răng", 30], ["Biến chứng thai sản", 90], ["Hô hấp, trẻ ≤ 6 tuổi", 180], ["Có sẵn, đặc biệt, dây chằng", 365], ["Sinh con", 635]], X = 660, K = 960 / 635;
  sec2("bang", "sang", "Thời gian chờ là khoảng quyền lợi chưa phát sinh hiệu lực chi trả, để chặn việc mua bảo hiểm khi đã biết trước bệnh. Tai nạn được bảo hiểm ngay. Bệnh thông thường chờ 30 ngày, biến chứng thai sản 90, bệnh hô hấp ở trẻ đến 6 tuổi 180, bệnh có sẵn, bệnh đặc biệt, tổn thương dây chằng hay sụn chêm 365. Dài nhất là quyền lợi sinh con: 635 ngày, gần 21 tháng — muốn dùng phải mua trước khi có kế hoạch sinh con. Bảo hiểm sinh mạng do bệnh: 90 ngày với bệnh thường, 365 ngày với bệnh có sẵn hoặc đặc biệt. Tái tục liên tục thì không phải chờ lại.",
    nen(NEN.goc()) + dau("I · Thời gian chờ · Điều 5", "Chờ từ [0 đến 635 ngày]", "Nhóm rủi ro càng dễ bị trục lợi, thời gian chờ càng dài.", 8)
    + lop(`<path d="M${X + 365 * K} 330 V960" stroke="${P.v1}" stroke-width="3" stroke-dasharray="10 8"/>`, X + 365 * K - 4, 330, 8, 630, "Vạch mốc 1 năm", "phang", A("fade", 300, 400))
    + T("n2-moc", X + 365 * K + 18, 330, 180, "1 năm", A("fade", 400, 400))
    + TG.map(([ten, d], k) => { const y = 380 + k * 100, w = Math.max(Math.round(d * K), 0), t0 = 600 + k * 220, nhan = d >= 365;
      return G("n2-tg", 120, y, 520, 76, esc(ten), A("fade", t0, 400))
        + lop(d ? `<rect x="${X}" y="${y + 12}" width="${w}" height="52" rx="10" fill="${nhan ? P.v2 : P.x2}"/>` : `<circle cx="${X + 26}" cy="${y + 38}" r="24" fill="${P.x1}"/>`, X, y + 12, Math.max(w, 52), 52, `Thanh ${ten}: ${d} ngày`, "phang", A("wipe", t0 + 100, 500))
        + T(`n2-tg-so${nhan ? " vang" : ""}`, X + Math.max(w, 52) + 18, y + 18, 420, d ? `${d} ngày` : "0 — hiệu lực ngay", A("fade", t0 + 400, 300)); }).join("")
    + T("nguon", 120, 1000, 1680, "Điều 5 hợp đồng. Tái tục liên tục thì không phải chờ lại."), { ex: "data-hero data-khong-hinh" });
}

// 9 ĐỒNG CHI TRẢ 70/30 (T13)
{ const X = 700, W = 1100;
  sec2("so-sanh", "sang", "Với trẻ từ 15 ngày tuổi đến 3 tuổi, nếu điều trị ở cơ sở tư nhân, khoa quốc tế hoặc theo yêu cầu tự nguyện ở bệnh viện công, Bảo Việt trả 70 %, gia đình tự trả 30 %. Nếu khám, điều trị thông thường ở bệnh viện công lập thì không áp dụng đồng chi trả. Vừa hạn chế dùng dịch vụ đắt tiền ở nhóm tuổi hay ốm, vừa giữ quyền lợi cho người dùng y tế công.",
    nen(NEN.dat(820)) + dau("I · Đồng chi trả · Phụ lục 1", "Trẻ dưới 3 tuổi: [đồng chi trả 70/30]", "Áp dụng cho trẻ từ 15 ngày tuổi đến 3 tuổi, tuỳ nơi điều trị.", 9)
    + hopBadge(120, 370, "building", P.v2, 110, A("pop", 500, 300)) + cap(260, 370, 410, "Tư nhân, khoa quốc tế", "hoặc tự nguyện ở viện công", "dong-t", "dong-m", 600)
    + lop(`<rect x="${X}" y="370" width="${W * 0.7 - 6}" height="110" rx="14" fill="${P.x1}"/><rect x="${X + W * 0.7}" y="370" width="${W * 0.3}" height="110" rx="14" fill="${P.v2}"/>`, X, 370, W, 110, "Thanh tỷ lệ: Bảo Việt trả 70 %, gia đình trả 30 %", "phang", A("wipe", 900, 700))
    + G("n2-thanh sang", X + 30, 370, 700, 110, "Bảo Việt 70 %", A("fade", 1400, 400)) + G("n2-thanh", X + W * 0.7 + 24, 370, 300, 110, "Gia đình 30 %", A("fade", 1500, 400))
    + hopBadge(120, 600, "building-bank", P.x1, 110, A("pop", 1800, 300)) + cap(260, 600, 410, "Bệnh viện công", "khám, điều trị thông thường", "dong-t", "dong-m", 1900)
    + lop(`<rect x="${X}" y="600" width="${W}" height="110" rx="14" fill="${P.x1}"/>`, X, 600, W, 110, "Thanh: không áp dụng đồng chi trả, trong hạn mức", "phang", A("wipe", 2100, 700))
    + G("n2-thanh sang", X + 30, 600, 900, 110, "Không đồng chi trả (trong hạn mức)", A("fade", 2600, 400))
    + T("chot", 120, 860, 1680, "Hạn chế lạm dụng dịch vụ đắt tiền, nhưng giữ trọn quyền lợi khi dùng y tế công.", A("fade", 2900, 500))
    + T("nguon", 120, 1000, 1680, "Phụ lục 1, mục 2 hợp đồng Bảo Việt An Gia (quy định đồng chi trả đối với trẻ em từ 15 ngày tuổi đến 3 tuổi)."), { ex: "data-khong-hinh" });
}

// 10 CHẤM DỨT — ba thẻ
{ const C = [["Bên mua chấm dứt", "dau-xanh", "70 %", "xanh", "phí thời gian còn lại, nếu chưa có chi trả"], ["Bảo Việt chấm dứt", "dau-vang", "100 %", "xanh", "phí còn lại, dù đã có khiếu nại"], ["Gian lận, trục lợi", "n2-dau-do", "Huỷ ngay", "do", "mất toàn bộ quyền lợi; hoàn 70 % phí nếu chưa bồi thường"]];
  sec2("so-sanh", "sang", "Điều 6. Hai bên đều được chấm dứt, nhưng phải báo trước 30 ngày bằng văn bản. Bên mua chấm dứt thì chỉ được hoàn 70 % phí của thời gian còn lại, và chỉ khi chưa có khoản chi trả nào — 30 % giữ lại là chi phí quản lý, khai thác. Bảo Việt chấm dứt thì phải hoàn đủ 100 %. Nếu người được bảo hiểm không đúng đối tượng hoặc gian lận, trục lợi, hợp đồng bị huỷ ngay, mất toàn bộ quyền lợi. Phí còn lại tính theo tỷ lệ số ngày còn lại. Câu hỏi mở: mức hoàn 70 % khi bên mua chấm dứt có cân bằng không.",
    nen(NEN.dat(760)) + dau("I · Chấm dứt · Điều 6", "Ai chấm dứt, [hoàn phí khác nhau]", "Báo trước 30 ngày bằng văn bản; phí còn lại tính theo số ngày.", 10)
    + C.map(([ten, cls, so, ms, mo], k) => { const x = 120 + k * 580, t0 = 500 + k * 350;
      return khoi(x + 12, 352, 540, 600, "bong", "Bóng thẻ", A("rise", t0, 450)) + khoi(x, 340, 540, 600, "the-trang", `Thẻ ${ten}`, A("rise", t0, 450)) + khoi(x, 340, 540, 140, cls, `Đầu thẻ ${ten}`, A("rise", t0, 450))
        + G(`the-td${k === 1 ? " toi" : ""}`, x + 40, 340, 470, 140, esc(ten), A("fade", t0 + 150, 400))
        + T(`so-vua ${ms}`, x + 40, 530, 470, so, A("pop", t0 + 300, 400)) + T("the-chu", x + 40, 660, 460, mo, A("fade", t0 + 400, 400)); }).join("")
    + T("nguon", 120, 990, 1680, "Điều 6 hợp đồng Bảo Việt An Gia."));
}

// 11 BỒI THƯỜNG — 15 ngày + hồ sơ mềm
{ const B = [["device-mobile", "Nộp qua BaoViet Direct", "xác thực OTP"], ["file-invoice", "Hoá đơn điện tử", "tra cứu được"], ["files", "Chứng từ chụp, scan", "không công chứng"]];
  sec2("so-lon", "sang", "Điều 10: Bảo Việt chi trả trong 15 ngày làm việc kể từ khi nhận đủ hồ sơ hợp lệ. Phụ lục 1 mục 3 cho nộp hồ sơ mềm qua ứng dụng BaoViet Direct nếu khoản bồi thường từ 10 triệu đồng trở xuống và không phải di sản thừa kế: xác thực OTP, dùng hoá đơn điện tử có đường dẫn tra cứu, chứng từ y tế chụp hoặc scan, không cần công chứng hay gửi bản cứng.",
    nen(NEN.tron()) + dau("I · Bồi thường · Điều 10", "Chi trả trong [15 ngày làm việc]", "Từ khi nhận đủ hồ sơ hợp lệ.", 11)
    + khoi(120, 340, 620, 620, "tk-the", "Khối số lớn", A("pop", 400, 500))
    + T("n2-so15", 120, 360, 620, "15", `data-dl ${A("pop", 600, 500)}`) + T("n2-so15-m", 160, 700, 540, "ngày làm việc", A("fade", 900, 400))
    + chip("Hồ sơ mềm: ≤ 10 triệu, không phải di sản", 820, 350, "chip vang nt", A("rise", 1100, 400))
    + B.map(([ic, a, b], k) => { const y = 470 + k * 170, t0 = 1300 + k * 250;
      return hopBadge(820, y, ic, P.x1, 110, A("pop", t0, 300)) + cap(960, y + 4, 840, a, b, "dong-t", "dong-m", t0 + 100) + (k ? `<div class="vach" style="left:820px;top:${y - 30}px;width:980px"></div>` : ""); }).join("")
    + T("nguon", 120, 1000, 1680, "Điều 10; Phụ lục 1."));
}

// 12 ƯU ĐIỂM / HẠN CHẾ — nền chia
{ const UU = ["Ưu tiên tài liệu rõ (Điều 12)", "5 mức: 94 – 454 triệu", "Chi trả 15 ngày; nộp online", "Bệnh viện công: không đồng chi trả"], HC = ["Chờ 365 / 635 ngày", "Trẻ < 3 tuổi ở tư nhân: tự trả 30 %", "Chậm phí: tự động huỷ", "Loại trừ nằm ở Quy tắc"];
  sec2("so-sanh", "sang", "Tổng kết Chương I. Ưu điểm: cấu trúc minh bạch, thứ tự ưu tiên rõ; quyền lợi linh hoạt theo ngân sách; chi trả nhanh và số hoá hồ sơ; miễn đồng chi trả cho trẻ ở bệnh viện công. Điểm cần lưu ý: thời gian chờ dài; đồng chi trả 30 % cho trẻ dưới 3 tuổi ở cơ sở tư nhân; chậm phí là huỷ; và Điều 7 dẫn chiếu toàn bộ điểm loại trừ sang Quy tắc — người mua phải đọc thêm văn bản khác mới biết trường hợp nào không được trả.",
    nen(NEN.goc()) + panel(100, 330, 860, 640, 200)
    + dau("I · Đánh giá", "Linh hoạt, nhanh — nhưng [ràng buộc chặt]", "Bốn ưu điểm đi kèm bốn điều người mua phải tự để ý.", 12)
    + khoi(120, 350, 300, 68, "pill-co", "Nhãn ưu điểm", A("pop", 400, 300), ";background:#FFFFFF") + G("pill-co-t", 120, 350, 300, 68, `<span style="width:100%;text-align:center">Ưu điểm</span>`, A("pop", 400, 300))
    + khoi(1040, 350, 300, 68, "pill-khong", "Nhãn cần lưu ý", A("pop", 800, 300)) + G("pill-khong-t", 1040, 350, 300, 68, `<span style="width:100%;text-align:center">Cần lưu ý</span>`, A("pop", 800, 300))
    + [[UU, 120, "shield-check", P.x1, 600], [HC, 1040, "alert-triangle", P.d1, 1000]].map(([ds, x, ic, m, t]) => ds.map((s, k) => { const y = 470 + k * 128, t0 = t + 400 + k * 200;
      return lop(`<circle cx="${x + 32}" cy="${y + 40}" r="32" fill="${m}"/>` + mh.iconNet(D, ic, x + 32, y + 40, 38, P.nen, 3), x, y + 8, 64, 64, `Biểu tượng ${ic}`, "phang", `data-lap ${A("pop", t0, 300)}`) + G("n2-muc", x + 90, y, 670, 80, esc(s), A("fade", t0 + 100, 400)); }).join("")).join("")
    + T("nguon", 120, 1000, 1680, "Điều 4 – 12, Phụ lục 1 hợp đồng."));
}

// 13 KHUYẾN NGHỊ — hàng có ô số
{ const KN = [["user-check", "Khai trung thực tiền sử bệnh", "tránh bị huỷ, từ chối chi trả (Điều 6)"], ["files", "Đọc Quy tắc bảo hiểm trước khi ký", "loại trừ nằm ở Chương III Quy tắc (Điều 7)"], ["hourglass", "Mua sớm theo thời gian chờ", "365 ngày bệnh có sẵn, 635 ngày sinh con"]];
  sec2("bang", "sang", "Ba khuyến nghị cho bên mua. Một, kê khai đầy đủ, chính xác tiền sử bệnh trên Giấy yêu cầu bảo hiểm — khai sai là rủi ro bị huỷ hợp đồng theo Điều 6. Hai, yêu cầu và đọc Quy tắc bảo hiểm Bảo Việt An Gia, vì Điều 7 dẫn toàn bộ điểm loại trừ sang Chương III của Quy tắc. Ba, lên kế hoạch theo thời gian chờ, nhất là mốc 365 và 635 ngày.",
    nen(NEN.dat(820)) + dau("I · Khuyến nghị", "Ba việc bên mua [làm trước khi ký]", "Mỗi việc gắn một điều khoản.", 13) + panel(100, 330, 1720, 640)
    + KN.map(([ic, v, m], k) => { const y = 360 + k * 200, t0 = 500 + k * 300;
      return khoi(120, y, 1680, 176, `hang-mt${k % 2 ? " le" : ""}`, `Khuyến nghị ${k + 1}`, A("rise", t0, 400)) + T("mt-so", 150, y + 52, 90, `0${k + 1}`, A("rise", t0, 400)) + hopBadge(260, y + 34, ic, P.x1, 108, A("pop", t0 + 100, 300))
        + cap(410, y + 34, 1360, v, m, "mt-v", "mt-m", t0 + 150); }).join(""));
}

// 14 MỞ PHẦN II
mMoPhan("02", "Thực trạng thị trường bảo hiểm", "Từ tăng trưởng nóng, qua khủng hoảng niềm tin, đến phục hồi.", `<path d="M1150 800 H1720" stroke="${P.phu}" stroke-width="5"/>` + [[134, P.x2], [160, P.x2], [185, P.x2], [216, P.x2], [251, P.x1], [227, P.d1], [227, P.x3], [237, P.v2]].map(([v, m], k) => `<rect x="${1170 + k * 68}" y="${800 - v * 1.6}" width="50" height="${v * 1.6}" rx="6" fill="${m}"/>`).join(""), "Minh hoạ: tám cột doanh thu 2018–2025 — tăng, đỉnh 2022, giảm 2023, phục hồi 2025",
  ["2018 – 2022 tăng nóng", "2023 khủng hoảng", "2024 chững lại", "2025 phục hồi", "9 tháng 2026"],
  "Chương II. Nhóm chia thị trường thành các giai đoạn: tăng nóng 2018–2022, khủng hoảng niềm tin 2023, chững lại 2024, phục hồi nhẹ 2025, và cập nhật 9 tháng 2026.");

// 15 DOANH THU 2018–2025 — HERO biểu đồ cột
{ const DT = [[2018, 133.7, "+24,0 %"], [2019, 160.2, "+21,0 %"], [2020, 184.7, "+15,0 %"], [2021, 216.0, "+16,1 %"], [2022, 251.3, "+15,09 %"], [2023, 227.1, "−8,02 %"], [2024, 227.5, "−0,26 %"], [2025, 237.2, "+3,96 %"]];
  const B0 = 790, K = 1.5, CW = 130, ST = 200, X0 = 230, mau = (n) => (n === 2023 ? P.d1 : n === 2024 ? P.x3 : n === 2025 ? P.v2 : P.x2);
  sec2("so-lon", "sang", "Giai đoạn 2018–2022 doanh thu phí tăng 15–24 % mỗi năm, quy mô gần gấp đôi, từ 133,7 lên hơn 251 nghìn tỷ đồng, nhờ bùng nổ bán bảo hiểm qua ngân hàng. Năm 2023 doanh thu giảm lần đầu sau khoảng 10 năm, năm 2024 đi ngang, năm 2025 mới tăng lại. Lưu ý: tốc độ tăng giảm là số cơ quan quản lý công bố, so với số liệu đã điều chỉnh của năm trước, nên lệch nhẹ so với phép chia trực tiếp giữa các cột.",
    nen(NEN.goc()) + dau("II · Toàn thị trường", "Gần gấp đôi, rồi [giảm lần đầu]", "Tổng phí, nghìn tỷ đồng; 2023 giảm lần đầu sau khoảng 10 năm.", 15)
    + lop(`<path d="M150 ${B0} H1800" stroke="${P.phu}" stroke-width="3"/>`, 150, B0 - 2, 1650, 4, "Trục ngang biểu đồ", "phang", A("fade", 300, 300))
    + DT.map(([n, v, g], k) => { const x = X0 + k * ST, h = Math.round(v * K), t0 = 500 + k * 180, giam = g.startsWith("−");
      return lop(`<rect x="${x}" y="${B0 - h}" width="${CW}" height="${h}" rx="8" fill="${mau(n)}"/>`, x, B0 - h, CW, h, `Cột năm ${n}: ${String(v).replace(".", ",")} nghìn tỷ đồng`, "phang", A("rise", t0, 500))
        
        + `<div class="n2-cot-nam" data-t ${A("fade", t0, 300)} style="left:${x - 35}px;top:${B0 + 12}px;width:${CW + 70}px">${n}<br><span class="n2-cot-v">${String(v.toFixed(1)).replace(".", ",")}</span><br><span class="n2-cot-g${giam ? " do" : ""}">${g}</span></div>`; }).join("")
    + khoi(230, 330, 580, 150, "the-xanh-nhat", "Ô chú thích giai đoạn 2018–2022", A("fade", 2200, 400)) + cap(260, 350, 530, "2018 – 2022: +15 – 24 %/năm", "nhờ bán bảo hiểm qua ngân hàng", "dong-t", "dong-m", 2300)
    + T("nguon", 120, 1000, 1680, "Theo tài liệu nhóm (số ước tính của Bộ Tài chính); 2024–2025 đối chiếu mof.gov.vn, Cục QLGSBH."), { ex: "data-hero data-khong-hinh" });
}

// 16 BẢNG 2022–2025
{ const R = [["2022", "Đỉnh tăng trưởng", "251.306", "Bancassurance tăng nóng; thanh tra 4 doanh nghiệp nhân thọ"], ["2023", "Khủng hoảng niềm tin", "227.134", "Luật KDBH 2022 có hiệu lực; kết luận thanh tra 30/6"], ["2024", "Chững lại", "227.495", "Luật Các TCTD 2024 cấm bán kèm; bão Yagi"], ["2025", "Phục hồi nhẹ", "237.211", "Thông qua Luật 139/2025/QH15 ngày 10/12/2025"]];
  const CO = [[120, 170, "Năm"], [290, 380, "Trạng thái"], [670, 290, "Tỷ đồng"], [960, 840, "Sự kiện chính"]], y0 = 400, HR = 132;
  sec2("bang", "sang", "Bốn năm gần nhất, bốn trạng thái. 2022 là đỉnh: 78 doanh nghiệp, tổng tài sản hơn 811 nghìn tỷ, tỷ trọng bancassurance trong phí khai thác mới nhân thọ lên khoảng 45 %. 2023 khủng hoảng niềm tin. 2024 chững lại khi luật cấm bán kèm qua ngân hàng và bão Yagi thử thách phi nhân thọ. 2025 phục hồi nhẹ, Quốc hội thông qua luật sửa đổi Luật Kinh doanh bảo hiểm.",
    nen(NEN.dat(900)) + dau("II · Từng năm", "Bốn năm, [bốn trạng thái]", "Mỗi năm một cú hích chính sách hoặc sự kiện.", 16)
    + khoi(120, 330, 1680, 62, "bh", "Đầu bảng", A("wipe", 400, 500))
    + CO.map(([x, w, s], j) => G(`bh-t${j === 2 ? " phai" : ""}`, x + 20, 330, w - 40, 62, j === 2 ? `<span style="width:100%;text-align:right">${esc(s)}</span>` : esc(s), A("fade", 600, 300))).join("")
    + R.map(([n, tt, so, sk], k) => { const y = y0 + k * HR, t0 = 800 + k * 300, nh = k === 1;
      return khoi(120, y, 1680, HR - 8, `hang${nh ? " nhan" : ""}`, `Hàng năm ${n}`, A("rise", t0, 400)) + khoi(120, y, 170, HR - 8, "tab", `Nhãn năm ${n}`, A("rise", t0, 400), `;background:${nh ? P.d1 : P.x1}`)
        + G("tab-t", 140, y, 130, HR - 8, esc(n), A("rise", t0, 400)) + G(`n2-o-dam${nh ? " do" : ""}`, 310, y, 340, HR - 8, esc(tt), A("rise", t0, 400))
        + G("n2-o-so", 690, y, 250, HR - 8, `<span style="width:100%;text-align:right">${so}</span>`, A("rise", t0, 400)) + G("o-t", 980, y, 800, HR - 8, esc(sk), A("rise", t0, 400)); }).join("")
    + T("nguon", 120, 1000, 1680, "Tài liệu nhóm, Bảng 1; mof.gov.vn. Hàng tô: năm giảm sâu nhất."), { ex: "data-khong-hinh" });
}

// 17 KHỦNG HOẢNG 2023 — số lớn
{ const SO = [["≈ 45 %", "xanh", "nhân thọ mới qua ngân hàng, 2022"], ["−44,5 %", "do", "phí khai thác mới nhân thọ 2023"], ["−43,8 %", "do", "hợp đồng nhân thọ mới 2023"]];
  sec2("so-lon", "sang", "Gốc của khủng hoảng là kênh bán qua ngân hàng. Theo PSI, tỷ trọng bancassurance trong phí khai thác mới nhân thọ từ khoảng 20 % năm 2018 lên 45 % năm 2022. Ngày 30/6/2023 Bộ Tài chính công bố kết luận thanh tra tại Prudential, MB Ageas, Sun Life và BIDV MetLife: sai phạm nhiều nhất ở khâu tư vấn. Hệ quả: phí khai thác mới nhân thọ giảm 44,5 %, số hợp đồng mới giảm 43,8 %. Tổng doanh thu giảm chủ yếu do nhân thọ giảm 12,5 %, trong khi phi nhân thọ vẫn tăng.",
    nen(NEN.tron()) + dau("II · Năm 2023", "Bán qua ngân hàng [mất niềm tin]", "Nhân thọ chịu đòn nặng nhất.", 17)
    + SO.map(([so, m, mo], k) => { const x = 120 + k * 580, t0 = 500 + k * 350;
      return khoi(x + 12, 352, 540, 330, "bong", "Bóng thẻ", A("rise", t0, 450)) + khoi(x, 340, 540, 330, "the-trang", `Thẻ số ${so}`, A("rise", t0, 450))
        + T(`n2-so-the ${m}`, x + 40, 372, 470, so, `data-dl ${A("pop", t0 + 200, 400)}`) + T("the-chu", x + 40, 500, 460, mo, A("fade", t0 + 300, 400)); }).join("")
    + khoi(120, 730, 1680, 230, "dai-do", "Dải kết luận thanh tra", A("rise", 1700, 500)) + hopBadge(150, 770, "zoom-check", P.d1, 100, A("pop", 1800, 300))
    + cap(280, 760, 1480, "Kết luận thanh tra 30/6/2023", "sai phạm ở khâu tư vấn", "dai-do-t", "n2-do-m", 1900)
    + ["Prudential", "MB Ageas", "Sun Life", "BIDV MetLife"].map((s, k) => chip(s, 280 + k * 290, 880, "chip do", A("rise", 2200 + k * 120, 300))).join("")
    + T("nguon", 120, 1000, 1680, "Nguồn nhóm: 12, 14, 15."));
}

// 18 TRÍCH LUẬT — HERO ảnh ký hợp đồng
sec2("trich", "anh", "Ngày 01/7/2024 Luật Các tổ chức tín dụng 2024 có hiệu lực. Điều 15 liệt kê các hành vi bị nghiêm cấm; khoản 5 cấm tổ chức tín dụng và nhân viên gắn việc bán bảo hiểm không bắt buộc với việc cung ứng sản phẩm, dịch vụ ngân hàng dưới mọi hình thức — tức là không được ép mua bảo hiểm mới cho vay. Đây là phản ứng trực tiếp với sai phạm năm 2023.",
  chup("trich-full.jpg", 0, 0, 1920, 1080, "Ảnh: bàn tay ký vào bản hợp đồng, phủ dải màu chủ bên trái", A("fade", 0, 900))
  + chip("II · Năm 2024 · Luật siết bán kèm", 120, 80, "chip vang", A("fade", 200, 400)) + `<h1 class="td sang" data-t data-tieu-de ${A("rise", 300, 600)} style="left:120px;top:132px;width:1100px">${em("Cấm {gắn bán bảo hiểm} với dịch vụ ngân hàng")}</h1>` + chip(`18 / ${TONG}`, 1690, 80, "chip")
  + lop([0, 70].map((d) => `<circle cx="${138 + d}" cy="420" r="26" fill="${P.v2}"/><path d="M${112 + d} 420 Q${108 + d} 370 ${152 + d} 352 L${156 + d} 364 Q${130 + d} 378 ${136 + d} 410 Z" fill="${P.v2}"/>`).join(""), 100, 342, 160, 110, "Dấu ngoặc kép", "phang", `data-lap ${A("pop", 700, 400)}`)
  + `<div class="trich sang" data-t ${A("fade", 900, 900)} style="left:176px;top:470px;width:960px">Tổ chức tín dụng, chi nhánh ngân hàng nước ngoài, người quản lý, người điều hành, nhân viên … <mark>gắn việc bán sản phẩm bảo hiểm không bắt buộc</mark> với việc cung ứng sản phẩm, dịch vụ ngân hàng <mark>dưới mọi hình thức</mark>.</div>`
  + chip("Khoản 5 Điều 15 · Luật Các TCTD 32/2024/QH15", 176, 880, "chip vien", A("rise", 1700, 400)) + T("dan sang", 174, 950, 960, "Hành vi bị nghiêm cấm · hiệu lực từ 01/7/2024.", A("fade", 1900, 400)), { ex: "data-hero" });

// 19 NHÂN THỌ / PHI NHÂN THỌ + bão Yagi
{ const NT = [[2023, -12.5, "−12,5 %", 2.87, "+2,87 %"], [2024, -5, "≈ −5 %", 10.2, "+10,2 %"], [2025, 0.5, "+0,5 %", 10.5, "+10–11 %"]], Z = 620, K = 18, BW = 120;
  sec2("noi-dung", "sang", "Hai xu hướng ngược chiều. Nhân thọ chịu tác động trực tiếp: giảm 12,5 % năm 2023, khoảng 5 % năm 2024, gần như đi ngang năm 2025. Phi nhân thọ tăng đều — 2,87 %, 10,2 %, rồi khoảng 10–11 % — và giữ cho thị trường không giảm sâu hơn. Nhưng bão Yagi cho thấy điểm yếu: thiệt hại ước tính khoảng 12.811 tỷ, đến giữa tháng 10/2024 mới tạm ứng 213 tỷ, đến 9/1/2025 lên 956,5 tỷ — bồi thường thiên tai còn chậm.",
    nen(NEN.goc()) + dau("II · 2023 – 2025", "Nhân thọ giảm, [phi nhân thọ] giữ thị trường", "Tăng / giảm doanh thu phí so với năm trước.", 19)
    + lop(`<rect x="130" y="342" width="34" height="22" rx="4" fill="${P.x1}"/><rect x="430" y="342" width="34" height="22" rx="4" fill="${P.v2}"/>`, 130, 342, 340, 22, "Chú giải màu: xanh nhân thọ, vàng phi nhân thọ", "phang", A("fade", 300, 300))
    + T("n2-cg", 176, 334, 240, "Nhân thọ", A("fade", 300, 300)) + T("n2-cg", 476, 334, 300, "Phi nhân thọ", A("fade", 300, 300))
    + lop(`<path d="M130 ${Z} H1100" stroke="${P.phu}" stroke-width="3"/>`, 130, Z - 2, 970, 4, "Trục 0 %", "phang", A("fade", 400, 300)) 
    + NT.map(([n, a, la, b, lb], k) => { const cx = 300 + k * 320, t0 = 600 + k * 400, ha = Math.abs(a) * K, hb = b * K, ya = a < 0 ? Z : Z - ha;
      return lop(`<rect x="${cx - BW - 6}" y="${ya}" width="${BW}" height="${Math.max(ha, 6)}" rx="6" fill="${P.x1}"/><rect x="${cx + 6}" y="${Z - hb}" width="${BW}" height="${hb}" rx="6" fill="${P.v2}"/>`, cx - BW - 6, Math.min(ya, Z - hb), 2 * BW + 12, Math.max(Z + (a < 0 ? ha : 6), Z) - Math.min(ya, Z - hb), `Năm ${n}: nhân thọ ${la}, phi nhân thọ ${lb}`, "phang", A("wipe", t0, 500))
        + T(`n2-bar-so${a < 0 ? " do" : ""}`, cx - BW - 36, a < 0 ? Z + ha + 8 : ya - 46, BW + 60, la, A("fade", t0 + 300, 300)) + T("n2-bar-so vang", cx - 24, Z - hb - 46, BW + 60, lb, A("fade", t0 + 350, 300))
        + T("n2-cot-nam", cx - 100, 930, 200, String(n), A("fade", t0, 300)); }).join("")
    + khoi(1200, 330, 600, 640, "the-xanh-nhat", "Thẻ bão Yagi", A("rise", 1900, 500)) + hopBadge(1240, 360, "alert-triangle", P.d1, 90, A("pop", 2000, 300)) + T("dong-t", 1350, 368, 420, "Bão Yagi 9/2024: bồi thường chậm", A("fade", 2100, 300))
    + [["12.811 tỷ", "thiệt hại ước tính", "do"], ["213 tỷ", "đã tạm ứng, giữa 10/2024", ""], ["956,5 tỷ", "đã tạm ứng, đến 9/1/2025", ""]].map(([s, m, c], k) => { const y = 500 + k * 150, t0 = 2200 + k * 250; return `<div class="dong-m" data-t ${A("rise", t0, 400)} style="left:1240px;top:${y}px;width:520px"><span class="n2-yagi${c ? " do" : ""}">${esc(s)}</span><br>${esc(m)}</div>`; }).join("")
    + T("nguon", 120, 1000, 1680, "Tài liệu nhóm, Hình 2 ([10], [11]); bão Yagi: [16] VCCI, [17] VietnamFinance (số liệu Cục QLGSBH)."));
}

// 20 MỐC PHÁP LÝ — trục ngang
{ const VN = [["01/01/2023", "Luật KDBH 08/2022/QH15", "có hiệu lực, 3 văn bản hướng dẫn", 1], ["30/6/2023", "Kết luận thanh tra", "bancassurance, 4 doanh nghiệp", 0], ["01/7/2024", "Luật Các TCTD 2024", "khoản 5 Điều 15: cấm bán kèm", 1], ["01/01/2026", "Luật 139/2025/QH15", "thông qua 10/12/2025; cắt giảm điều kiện, thủ tục", 1]];
  sec2("bang", "sang", "Bốn mốc pháp lý. Luật Kinh doanh bảo hiểm 2022 có hiệu lực từ 01/01/2023, hướng dẫn bởi Nghị định 46/2023, Nghị định 67/2023 và Thông tư 67/2023 của Bộ Tài chính. Kết luận thanh tra 30/6/2023. Luật Các tổ chức tín dụng 2024 có hiệu lực 01/7/2024. Ngày 10/12/2025 Quốc hội thông qua Luật số 139/2025/QH15 sửa đổi Luật Kinh doanh bảo hiểm, hiệu lực 01/01/2026, một số khoản từ 01/7/2026, nhằm cắt giảm điều kiện kinh doanh và đơn giản hoá thủ tục.",
    nen(NEN.dat(720)) + dau("II · Khung pháp lý", "Bốn mốc [định hình lại] thị trường", "Thẻ đậm: văn bản đang có hiệu lực.", 20) + panel(100, 540, 1720, 400)
    + lop(`<path d="M120 500 H1800" stroke="${P.x3}" stroke-width="4"/>` + VN.map((v, k) => `<circle cx="${290 + k * 420}" cy="500" r="15" fill="${v[3] ? P.x1 : P.nen}" stroke="${P.x1}" stroke-width="4"/>`).join(""), 110, 480, 1700, 40, "Trục thời gian năm mốc", "phang", A("wipe", 400, 900))
    + VN.map(([y, a, b, dac], k) => { const x = 120 + k * 420, t0 = 600 + k * 250;
      return T(`n2-moc-nam${dac ? "" : " nhat"}`, x, 400, 390, y, A("rise", t0, 400)) + khoi(x, 560, 390, 360, dac ? "vn-the dac" : "vn-the", `Thẻ mốc ${y}`, A("rise", t0, 450))
        + `<div class="cap" style="left:${x + 24}px;top:586px;width:342px"><b data-t class="vn-t${dac ? " sang" : ""}" ${A("fade", t0 + 100, 400)}>${esc(a)}</b><span data-t class="vn-m${dac ? " sang" : ""}" ${A("fade", t0 + 200, 400)}>${esc(b)}</span></div>`; }).join("")
    + T("nguon", 120, 1000, 1680, "vbpl.vn; vanban.chinhphu.vn; 158/VBHN-VPQH. Tra cứu 18/11/2026."));
}

// 21 9 THÁNG 2026 — nền đậm, số lớn
{ const SO = [["175,8", "nghìn tỷ đồng — tổng phí", "+2,4 %"], ["74,1", "nghìn tỷ — phi nhân thọ", "+15,1 %"], ["77,9", "nghìn tỷ — chi trả quyền lợi", "+13,1 %"]];
  sec2("so-lon", "dam", "Cập nhật 9 tháng năm 2026 theo báo cáo tình hình kinh tế – xã hội: tổng doanh thu phí ước 175,8 nghìn tỷ, tăng 2,4 %; phi nhân thọ 74,1 nghìn tỷ, tăng 15,1 %; chi trả quyền lợi 77,9 nghìn tỷ, tăng 13,1 %. Nhân thọ ước 101,7 nghìn tỷ, vẫn chưa phục hồi. Xu hướng năm 2025 tiếp diễn: phi nhân thọ dẫn dắt. Lưu ý: tài liệu nhóm trích nguồn [21], [22] nhưng chưa có trong danh mục — nhóm sẽ bổ sung.",
    nen(`<circle cx="1920" cy="1080" r="380" fill="${P.x2}"/>` + mh.cham(1660, 300, 6, 2, 26, 5, P.v2)) + dauToi("II · 9 tháng 2026", "Phi nhân thọ [dẫn dắt tăng trưởng]", "Nhân thọ ước 101,7 nghìn tỷ, vẫn chiếm phần lớn doanh thu.", 21)
    + SO.map(([so, mo, g], k) => { const x = 120 + k * 580, t0 = 500 + k * 350;
      return khoi(x, 360, 540, 520, "the-toi", `Thẻ ${so}`, A("rise", t0, 450)) + T("n2-so-toi", x + 40, 400, 470, so, `data-dl ${A("pop", t0 + 200, 400)}`)
        + T("n2-so-toi-m", x + 40, 560, 460, mo, A("fade", t0 + 300, 400)) + chip(g, x + 40, 770, "chip vang", A("rise", t0 + 400, 300)); }).join("")
    + T("nguon sang", 120, 1000, 1680, "Báo cáo tình hình KT-XH quý III và 9 tháng 2026, dẫn theo anninhthudo.vn, baomoi.com — số ước tính."), { ex: "data-khong-hinh" });
}

// 22 KẾT — câu chốt trên ảnh
mCauAnh("toa-full.jpg", "Ảnh: toà cao tầng nhìn từ dưới lên", "Hợp đồng chặt, thị trường [đang hồi phục]", "Người mua cần đọc kỹ thời gian chờ và Quy tắc; thị trường cần bán hàng minh bạch. Nhóm 2 cảm ơn thầy cô đã lắng nghe.",
  "Kết luận. Hợp đồng Bảo Việt An Gia chặt chẽ về hình thức, quyền lợi linh hoạt, chi trả nhanh, nhưng có nhiều ràng buộc người mua phải tự đọc. Thị trường đi từ tăng nóng, qua khủng hoảng niềm tin 2023, nay phục hồi nhờ phi nhân thọ và khung pháp lý siết việc bán hàng. Nhóm cảm ơn thầy cô và các bạn đã lắng nghe.");

// =================== CSS ===================
ghi(path.join(D, "style.css"), require("./kieu.js")(P) + `
.n2-kc-t{font:700 52px/1.15 'Lora';color:${P.muc}}.n2-kc-m{font:400 34px/1.4 'Be Vietnam Pro';color:${P.phu}}
.n2-bac{font:800 34px/1.2 'Be Vietnam Pro';color:${P.muc}}.n2-bac.sang{color:${P.nen}}.n2-bac-so{font:700 48px/1 'Lora';color:${P.x1}}
.n2-mui{font:600 28px/1.2 'Be Vietnam Pro';color:${P.phu};text-align:center}.n2-tl{font:600 32px/1.25 'Be Vietnam Pro';color:${P.muc}}
.n2-la-m{font:400 30px/1.35 'Be Vietnam Pro';color:${P.phu}}
.n2-ct{font:800 34px/1.2 'Be Vietnam Pro';color:${P.muc}}.n2-ct-so{font:700 40px/1 'Lora';color:${P.x1}}.n2-ct-so.vang{color:${P.v1}}
.n2-moc{font:700 30px/1 'Be Vietnam Pro';color:${P.x1}}.n2-tg{font:700 34px/1.2 'Be Vietnam Pro';color:${P.muc}}.n2-tg-so{font:700 36px/1 'Lora';color:${P.x1}}.n2-tg-so.vang{color:${P.v1}}
.n2-thanh{font:800 38px/1.2 'Be Vietnam Pro';color:${P.muc}}.n2-thanh.sang{color:${P.nen}}
.n2-dau-do{background:${P.d1};border-radius:20px 20px 0 0}
.so-vua.xanh{color:${P.x1}}.so-vua.do{color:${P.d1}}
.n2-so15{font:700 300px/1.1 'Lora';color:${P.v3};text-align:center}.n2-so15-m{font:700 38px/1.3 'Be Vietnam Pro';color:${P.nen};text-align:center}
.vach-doc{background:${P.ke}}.n2-muc{font:600 34px/1.25 'Be Vietnam Pro';color:${P.muc}}
.n2-cot-so{font:700 36px/1 'Lora';color:${P.muc};text-align:center}.n2-cot-nam{font:700 32px/1.3 'Be Vietnam Pro';color:${P.muc};text-align:center}.n2-cot-v{font:700 34px/1.3 'Lora';color:${P.muc}}.n2-cot-g{font:600 28px/1.3 'Be Vietnam Pro';color:${P.x1};text-align:center}.n2-cot-g.do{color:${P.d0}}
.n2-o-dam{font:800 34px/1.2 'Be Vietnam Pro';color:${P.x1}}.n2-o-dam.do{color:${P.d0}}.n2-o-so{font:700 36px/1 'Lora';color:${P.muc};font-variant-numeric:tabular-nums}
.n2-so-the{font:700 96px/1.1 'Lora'}.n2-so-the.xanh{color:${P.x1}}.n2-so-the.do{color:${P.d1}}.n2-do-m{font:400 32px/1.35 'Be Vietnam Pro';color:${P.d0}}
.n2-cg{font:600 28px/1.4 'Be Vietnam Pro';color:${P.phu}}.n2-bar-so{font:700 32px/1 'Lora';color:${P.x1};text-align:center}.n2-bar-so.do{color:${P.d1}}.n2-bar-so.vang{color:${P.v1}}
.n2-yagi{font:700 56px/1.1 'Lora';color:${P.x1}}.n2-yagi.do{color:${P.d1}}
.n2-moc-nam{font:700 44px/1.1 'Lora';color:${P.x1}}.n2-moc-nam.nhat{color:${P.phu}}
.n2-so-toi{font:700 150px/1.05 'Lora';color:${P.v3}}.n2-so-toi-m{font:600 36px/1.3 'Be Vietnam Pro';color:${P.nen}}
`);

fs.rmSync(path.join(D, "slides"), { recursive: true, force: true });
S2.forEach((h, k) => ghi(path.join(D, "slides", `${String(k + 1).padStart(2, "0")}.html`), h));
ghi(path.join(D, "kich-ban.md"), `# Kịch bản — sinh từ deck.js (sửa ở deck.js, chạy lại \`node deck.js\`)\n\nƯớc lượng: ${S2.length} slide × ≈ 45 giây ≈ ${Math.round(S2.length * 45 / 60)} phút.\n\n| # | Bố cục | Tiêu đề | Lời nói |\n|---|---|---|---|\n` + KB.map(([n, m, t, l]) => `| ${n} | ${m} | ${t} | ${l.replace(/\|/g, "/")} |`).join("\n") + "\n");
console.log(`${S2.length} slide, ${nL} lớp hình`);
