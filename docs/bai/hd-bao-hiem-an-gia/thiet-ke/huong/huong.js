// Điểm duyệt C1 — dựng hướng 2 (biên tập học thuật) và hướng 3 (báo cáo đậm), mỗi hướng 4 slide của chính bài:
// bìa · thời gian chờ (Điều 5) · tổng phí 2018–2025 · trích khoản 1 Điều 26 + hủy bỏ / đơn phương chấm dứt.
// Hướng 1 (khối phẳng xanh ngọc) lấy ảnh slide 1, 9, 18, 12 của bản dựng hiện tại.
//   node thiet-ke/huong/huong.js  →  thiet-ke/huong/h2/, h3/ (rồi dung.js --nhap từng thư mục)
const fs = require("fs"), path = require("path");
const BAI = path.resolve(__dirname, "../..");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const em = (s) => esc(s).replace(/\[([^\]]+)\]/g, "<em>$1</em>");
const ghi = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };

const CHO = [["Tai nạn", 0], ["Bệnh thông thường, điều trị răng", 30], ["Biến chứng thai sản", 90], ["Viêm phổi, phế quản ở trẻ ≤ 6 tuổi", 180], ["Bệnh có sẵn, bệnh đặc biệt, dây chằng", 365], ["Sinh con (Bảo hiểm Thai sản)", 365]];
const PHI = [["2018", 133.7], ["2019", 160.2], ["2020", 184.7], ["2021", 216.0], ["2022", 251.3], ["2023", 227.1], ["2024", 227.5], ["2025", 237.2]];
const TRICH = "Doanh nghiệp bảo hiểm … hoặc bên mua bảo hiểm có quyền [đơn phương chấm dứt thực hiện] hợp đồng bảo hiểm … : Bên mua bảo hiểm không đóng phí bảo hiểm hoặc không đóng đủ phí bảo hiểm theo thời hạn thỏa thuận hoặc sau thời gian gia hạn đóng phí";

function deck(ten, P, ve) {
  const dir = path.join(__dirname, ten); let n = 0;
  const A = (a, at, dur = 500) => `data-a="${a}" data-at="${at}" data-dur="${dur}"`;
  const lop = (body, x, y, w, h, alt, ex = "") => { const f = `l${++n}.svg`; ghi(path.join(dir, "asset", f), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${body}</svg>`);
    return `<img data-l="l${n}" data-loai="phang" data-alt="${esc(alt)}" ${ex} src="asset/${f}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`; };
  const anh = (f, x, y, w, h, alt, ex = "") => { const dst = path.join(dir, "anh", f); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(path.join(BAI, "anh", f), dst);
    return `<img data-l="a${++n}" data-loai="anh-chup" data-alt="${esc(alt)}" ${ex} src="anh/${f}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`; };
  const T = (cls, x, y, w, s, ex = "") => `<div class="${cls}" data-t ${ex} style="left:${x}px;top:${y}px;width:${w}px">${em(s)}</div>`;
  const H = (cls, x, y, w, s, ex = "") => `<h1 class="${cls}" data-t data-tieu-de ${ex} style="left:${x}px;top:${y}px;width:${w}px">${em(s)}</h1>`;
  const K = (x, y, w, h, cls, alt, ex = "") => `<div class="${cls}" data-l="k${++n}" data-alt="${esc(alt)}" ${ex} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"></div>`;
  const S = ve({ A, lop, anh, T, H, K, P });
  fs.rmSync(path.join(dir, "slides"), { recursive: true, force: true });
  S.slides.forEach((s, k) => ghi(path.join(dir, "slides", `${String(k + 1).padStart(2, "0")}.html`), s));
  ghi(path.join(dir, "style.css"), S.css);
}

// ================= HƯỚNG 2 · BIÊN TẬP HỌC THUẬT =================
// nền ngà, mực đen, MỘT màu nhấn đỏ son; Lora lớn; đường kẻ mảnh 2 px; không khối tô, không bóng; ảnh đen trắng.
deck("h2", { nen: "#F5F1EA", muc: "#1C1B19", phu: "#4A4640", ke: "#CFC6B8", nhan: "#A8322A", nhat: "#E9E1D4" }, ({ A, lop, anh, T, H, K, P }) => {
  const khung = lop(`<rect x="40" y="40" width="1840" height="1000" fill="none" stroke="${P.ke}" stroke-width="2"/>`, 0, 0, 1920, 1080, "Hình trang trí");
  const dau = (kk, td, dan, so) => khung + T("kk", 120, 96, 900, kk, A("fade", 0, 400)) + T("so", 1600, 96, 200, so) + H("td", 120, 140, 1500, td, A("rise", 100, 600)) + T("dan", 120, 262, 1600, dan, A("fade", 300, 500)) + lop(`<path d="M120 330 H1800" stroke="${P.muc}" stroke-width="2"/>`, 110, 326, 1700, 8, "Đường kẻ dưới tiêu đề", A("wipe", 400, 600));
  const sec = (mau, inner) => `<section class="s" data-mau="${mau}" data-nen="N1" data-trans="fade">\n${inner}\n</section>`;
  const slides = [];
  slides.push(sec("bia", khung + anh("ky-hd-xam.jpg", 1180, 40, 700, 1000, "Ảnh đen trắng: bàn tay ký hợp đồng", A("fade", 0, 900))
    + T("kk", 120, 150, 900, "Nhóm 2 · Thuyết trình", A("fade", 200, 400))
    + H("bia", 116, 240, 1000, "Hợp đồng bảo hiểm [thương mại]", A("rise", 300, 700))
    + lop(`<path d="M120 690 H520" stroke="${P.nhan}" stroke-width="4"/>`, 110, 684, 420, 12, "Gạch đỏ son", A("wipe", 900, 500))
    + T("bia-m", 120, 730, 900, "và thực trạng thị trường bảo hiểm Việt Nam, 2018 – 9 tháng 2026", A("fade", 1000, 500))
    + T("bia-by", 120, 930, 900, "Hợp đồng mẫu: Bảo Việt An Gia · 13 điều + Phụ lục 1", A("fade", 1200, 500))));
  { const x0 = 820, W = 940, sc = W / 400, y0 = 380, hr = 96;
    slides.push(sec("noi-dung", dau("Điều 5 · Thời gian chờ", "Ký xong [chưa được trả ngay]", "Mỗi loại rủi ro có thời gian chờ riêng, tính từ ngày hợp đồng có hiệu lực.", "9 / 25")
      + CHO.map(([t, d], k) => { const y = y0 + k * hr, w = d * sc, sinh = k === 5;
        return T(`cho${sinh ? " do" : ""}`, 120, y, 680, t, A("fade", 500 + k * 200, 300)) + lop(`<path d="M${x0} ${y + 24} H${x0 + W}" stroke="${P.nhat}" stroke-width="2"/>` + (d ? `<path d="M${x0} ${y + 24} H${x0 + w}" stroke="${sinh ? P.nhan : P.muc}" stroke-width="10"/>` : "") + `<circle cx="${x0 + w}" cy="${y + 24}" r="12" fill="${sinh ? P.nhan : P.muc}"/>`, x0 - 14, y + 8, W + 28, 32, `Thời gian chờ ${t}: ${d} ngày`, A("wipe", 500 + k * 200, 600))
          + T(`cho-so${sinh ? " do" : ""}`, x0 + w + 28, y - 12, 260, d ? `${d}${sinh ? "*" : ""}` : "0", A("fade", 800 + k * 200, 300)); }).join("")
      + T("nguon", 120, 980, 1680, "* Bài nhóm ghi 635 ngày — nghi gõ đảo từ 365. Đơn vị: ngày. Nguồn: Điều 5 hợp đồng An Gia.")));
  }
  { const yb = 900, sc = 480 / 251.3, x0 = 180, st = 205, w = 92;
    slides.push(sec("so-lon", dau("Bảng 1 · Hình 1", "2025 vẫn [dưới đỉnh 2022]", "Tổng doanh thu phí bảo hiểm, nghìn tỷ đồng.", "18 / 25")
      + lop(`<path d="M140 ${yb} H1800" stroke="${P.muc}" stroke-width="2"/><path d="M140 ${yb - 251.3 * sc} H1800" stroke="${P.nhan}" stroke-width="2" stroke-dasharray="8 8"/>` + PHI.map(([nm, v], k) => `<rect x="${x0 + k * st}" y="${yb - v * sc}" width="${w}" height="${v * sc}" fill="${k === 4 ? P.nhan : k > 4 ? P.muc : P.ke}"/>`).join(""), 130, 380, 1680, 530, "Biểu đồ cột tổng phí 2018–2025, cột 2022 đỏ son", A("wipe", 500, 1200))
      + PHI.map(([nm, v], k) => T(`cot-so${k === 4 ? " do" : ""}`, x0 + k * st - 50, yb - v * sc - 58, w + 100, String(v).replace(".", ","), A("fade", 1200 + k * 100, 300)) + T("cot-nam", x0 + k * st - 50, yb + 14, w + 100, nm, A("fade", 600, 300))).join("")
      + T("chu-thich", 1450, 360, 350, "— — đỉnh 2022", A("fade", 2000, 300))
      + T("nguon", 120, 980, 1680, "Nguồn: Bộ Tài chính / Cục QLGSBH, số ước tính — theo bài nhóm.")));
  }
  slides.push(sec("trich", khung + T("kk", 120, 96, 900, "Đối chiếu luật ✚", A("fade", 0, 400)) + T("so", 1600, 96, 200, "12 / 25") + H("td", 120, 140, 1600, "Luật gọi là [đơn phương chấm dứt], không phải hủy bỏ", A("rise", 100, 600))
    + T("trich", 220, 360, 1480, `“${TRICH}”`, A("fade", 500, 800)) + T("trich-cc", 220, 630, 1480, "— khoản 1 Điều 26 Luật Kinh doanh bảo hiểm 08/2022/QH15", A("fade", 900, 400))
    + lop(`<path d="M120 710 H1800" stroke="${P.muc}" stroke-width="2"/><path d="M960 740 V960" stroke="${P.ke}" stroke-width="2"/>`, 110, 706, 1700, 260, "Đường kẻ chia hai cột", A("fade", 1200, 400))
    + [["Hủy bỏ", "chữ của hợp đồng", "Mất hiệu lực từ lúc giao kết", "Điều 427 BLDS 2015"], ["Đơn phương chấm dứt", "chữ của Luật KDBH", "Chấm dứt từ khi bên kia nhận thông báo", "Điều 428 BLDS 2015"]].map(([a, b, c, d], k) => { const x = 120 + k * 900, t0 = 1400 + k * 400;
      return T(`hq-t${k ? "" : " do"}`, x, 740, 760, a, A("fade", t0, 400)) + T("hq-ai", x, 808, 760, b, A("fade", t0, 400)) + T("hq-m", x, 856, 760, c, A("fade", t0 + 100, 400)) + T("hq-cc", x, 920, 760, d, A("fade", t0 + 200, 400)); }).join("")));
  const css = `section.s{background:${P.nen};color:${P.muc}}section.s > div,section.s > h1{position:absolute}[data-t]{text-wrap:pretty}h1{text-wrap:balance}
em{font-style:normal;color:${P.nhan}}
.kk{font:600 28px/1 'Be Vietnam Pro';letter-spacing:.14em;text-transform:uppercase;color:${P.nhan}}.so{font:500 26px/1 'Be Vietnam Pro';color:${P.phu};text-align:right}
.td{font:700 76px/1.1 'Lora';color:${P.muc}}.dan{font:400 34px/1.4 'Be Vietnam Pro';color:${P.phu}}
.bia{font:700 128px/1.04 'Lora';color:${P.muc}}.bia-m{font:400 38px/1.4 'Lora';color:${P.phu}}.bia-by{font:500 30px/1.4 'Be Vietnam Pro';color:${P.phu}}
.cho{font:500 34px/1.4 'Be Vietnam Pro';color:${P.muc}}.cho.do{color:${P.nhan};font-weight:700}.cho-so{font:700 48px/1.2 'Lora';color:${P.muc}}.cho-so.do{color:${P.nhan}}
.cot-so{font:700 38px/1.2 'Lora';color:${P.muc};text-align:center}.cot-so.do{color:${P.nhan}}.cot-nam{font:500 30px/1.2 'Be Vietnam Pro';color:${P.phu};text-align:center}.chu-thich{font:600 28px/1 'Be Vietnam Pro';color:${P.nhan};text-align:right}
.nguon{font:400 26px/1.35 'Be Vietnam Pro';color:${P.phu}}
.trich{font:500 40px/1.5 'Lora';font-style:italic;color:${P.muc}}.trich em{font-style:italic;font-weight:700}.trich-cc{font:600 30px/1.3 'Be Vietnam Pro';color:${P.phu}}
.hq-t{font:700 52px/1.1 'Lora';color:${P.muc}}.hq-t.do{color:${P.nhan}}.hq-ai{font:500 30px/1.2 'Be Vietnam Pro';color:${P.phu}}.hq-m{font:600 36px/1.3 'Be Vietnam Pro';color:${P.muc}}.hq-cc{font:500 28px/1.2 'Be Vietnam Pro';color:${P.phu}}
`;
  return { slides, css };
});

// ================= HƯỚNG 3 · BÁO CÁO ĐẬM =================
// navy đậm + trắng, một màu nhấn cam san hô; tiêu đề Anton in hoa; panel chia đôi; số lớn; ảnh tròn đen trắng; lưới chấm.
deck("h3", { navy: "#14294A", navy2: "#22406E", trang: "#FFFFFF", nen: "#F3F5F8", muc: "#14294A", phu: "#43506A", cam: "#E8553A", cam4: "#FBE1DA", ke: "#D5DBE5" }, ({ A, lop, anh, T, H, K, P }) => {
  const cham = (x, y, c, r, m) => { let s = ""; for (let i = 0; i < c; i++) for (let j = 0; j < r; j++) s += `<circle cx="${x + i * 26}" cy="${y + j * 26}" r="5" fill="${m}"/>`; return s; };
  const sec = (mau, nen, inner) => `<section class="s ${nen}" data-mau="${mau}" data-nen="${nen === "toi" ? "N2" : "N1"}" data-trans="push">\n${inner}\n</section>`;
  const slides = [];
  slides.push(sec("bia", "sang", lop(`<rect x="1100" y="0" width="820" height="1080" fill="${P.navy}"/>` + cham(120, 80, 10, 3, P.ke) + `<rect x="0" y="1020" width="560" height="60" fill="${P.cam}"/>`, 0, 0, 1920, 1080, "Hình trang trí")
    + anh("ky-hd-tron.png", 1180, 220, 640, 640, "Ảnh đen trắng trong khung tròn: bàn tay ký hợp đồng", A("pop", 300, 800))
    + lop(`<circle cx="1500" cy="540" r="352" fill="none" stroke="${P.cam}" stroke-width="8"/>`, 1140, 180, 720, 720, "Vòng cam quanh ảnh", A("fade", 800, 500))
    + T("chip", 120, 260, 600, "NHÓM 2 · THUYẾT TRÌNH", A("fade", 200, 400))
    + H("bia", 116, 330, 960, "HỢP ĐỒNG BẢO HIỂM THƯƠNG MẠI", A("rise", 300, 700))
    + T("bia-m", 120, 760, 900, "và thực trạng thị trường bảo hiểm Việt Nam, 2018 – 9 tháng 2026", A("fade", 1000, 500))));
  { const x0 = 780, W = 1020, sc = W / 400, y0 = 300, hr = 108;
    slides.push(sec("noi-dung", "sang", lop(`<rect x="0" y="0" width="660" height="1080" fill="${P.navy}"/>` + cham(120, 900, 6, 3, P.navy2), 0, 0, 660, 1080, "Panel màu chủ bên trái")
      + T("so-lon-p", 120, 110, 480, "365", A("pop", 200, 600)) + T("so-lon-m", 124, 300, 480, "ngày — thời gian chờ dài nhất", A("fade", 400, 400))
      + T("chip", 120, 470, 500, "ĐIỀU 5 · THỜI GIAN CHỜ", A("fade", 500, 400)) + H("td sang", 116, 530, 500, "KÝ XONG CHƯA ĐƯỢC TRẢ NGAY", A("rise", 600, 600))
      + CHO.map(([t, d], k) => { const y = y0 + k * hr, w = Math.max(d * sc, 8), sinh = k === 5;
        return T(`cho${sinh ? " cam" : ""}`, x0, y - 54, 900, t, A("fade", 700 + k * 200, 300)) + lop(`<rect x="${x0}" y="${y}" width="${W}" height="36" fill="${P.nen}"/><rect x="${x0}" y="${y}" width="${w}" height="36" fill="${sinh ? P.cam : P.navy}"/>`, x0, y, W, 36, `Thanh ${t}: ${d} ngày`, A("wipe", 700 + k * 200, 600))
          + T(`cho-so${sinh ? " cam" : ""}`, x0 + W - 300, y - 54, 300, d ? `${d} ngày${sinh ? "*" : ""}` : "không chờ", A("fade", 900 + k * 200, 300)); }).join("")
      + T("nguon", 780, 990, 1020, "* Bài nhóm ghi 635 ngày — nghi gõ đảo từ 365. Điều 5 hợp đồng An Gia.")));
  }
  { const yb = 880, sc = 470 / 251.3, x0 = 170, st = 205, w = 150;
    slides.push(sec("so-lon", "toi", lop(cham(1660, 90, 6, 3, P.navy2), 1640, 70, 180, 90, "Hình trang trí")
      + T("chip", 120, 90, 600, "BẢNG 1 · HÌNH 1", A("fade", 0, 400)) + H("td sang", 116, 150, 1500, "2025 VẪN DƯỚI ĐỈNH 2022", A("rise", 100, 600)) + T("dan sang", 120, 250, 1600, "Tổng doanh thu phí bảo hiểm, nghìn tỷ đồng.", A("fade", 300, 400))
      + lop(PHI.map(([nm, v], k) => `<rect x="${x0 + k * st}" y="${yb - v * sc}" width="${w}" height="${v * sc}" fill="${k === 4 ? P.cam : k > 4 ? P.trang : P.navy2}"/>`).join("") + `<path d="M140 ${yb} H1800" stroke="${P.trang}" stroke-width="3"/>`, 130, 390, 1680, 500, "Biểu đồ cột tổng phí 2018–2025, cột 2022 cam", A("wipe", 500, 1200))
      + PHI.map(([nm, v], k) => T(`cot-so${k === 4 ? " cam" : ""}`, x0 + k * st - 25, yb - v * sc - 60, w + 50, String(v).replace(".", ","), A("fade", 1200 + k * 100, 300)) + T("cot-nam", x0 + k * st - 25, yb + 16, w + 50, nm, A("fade", 600, 300))).join("")
      + T("nguon sang", 120, 990, 1680, "Nguồn: Bộ Tài chính / Cục QLGSBH, số ước tính — theo bài nhóm.")));
  }
  slides.push(sec("trich", "sang", lop(`<rect x="0" y="0" width="1000" height="1080" fill="${P.navy}"/>` + cham(120, 960, 8, 2, P.navy2), 0, 0, 1000, 1080, "Panel màu chủ bên trái")
    + T("chip", 120, 90, 600, "ĐỐI CHIẾU LUẬT ✚", A("fade", 0, 400)) + H("td sang", 116, 150, 820, "LUẬT GỌI LÀ ĐƠN PHƯƠNG CHẤM DỨT", A("rise", 100, 600))
    + lop([0, 64].map((d) => `<circle cx="${138 + d}" cy="440" r="24" fill="${P.cam}"/><path d="M${114 + d} 440 Q${110 + d} 394 ${150 + d} 376 L${154 + d} 388 Q${130 + d} 400 ${136 + d} 430 Z" fill="${P.cam}"/>`).join(""), 100, 366, 150, 100, "Dấu ngoặc kép", A("pop", 400, 400)) + T("trich", 120, 510, 800, TRICH, A("fade", 600, 800)) + T("trich-cc", 120, 975, 800, "Khoản 1 Điều 26 · Luật KDBH 08/2022/QH15", A("fade", 1000, 400))
    + [["01", "HỦY BỎ", "chữ của hợp đồng", "Mất hiệu lực từ lúc giao kết", "Điều 427 BLDS 2015"], ["02", "ĐƠN PHƯƠNG CHẤM DỨT", "chữ của Luật KDBH", "Chấm dứt từ khi bên kia nhận thông báo", "Điều 428 BLDS 2015"]].map(([so, a, b, c, d], k) => { const y = 150 + k * 450, t0 = 1300 + k * 400;
      return K(1080, y, 720, 390, "the", `Thẻ ${a}`, A("rise", t0, 500)) + K(1080, y, 12, 390, k ? "vach navy" : "vach", "Vạch màu", A("rise", t0, 500))
        + T(`the-so${k ? "" : " cam"}`, 1130, y + 30, 200, so, A("fade", t0 + 100, 300)) + T("the-t", 1260, y + 44, 520, a, A("fade", t0 + 100, 300)) + T("the-ai", 1260, y + 104, 520, b, A("fade", t0 + 150, 300))
        + T("the-m", 1130, y + 190, 640, c, A("fade", t0 + 200, 400)) + T("the-cc", 1130, y + 320, 640, d, A("fade", t0 + 250, 300)); }).join("")));
  const css = `section.s{background:${P.trang};color:${P.muc}}section.s.toi{background:${P.navy}}section.s > div,section.s > h1{position:absolute}[data-t]{text-wrap:pretty}h1{text-wrap:balance}
.chip{font:700 28px/1 'Be Vietnam Pro';letter-spacing:.12em;color:${P.cam}}
.bia{font:400 132px/1.0 'Anton';color:${P.navy}}.bia-m{font:500 36px/1.4 'Be Vietnam Pro';color:${P.phu}}
.td{font:400 80px/1.05 'Anton';color:${P.navy}}.td.sang{color:${P.trang}}.dan{font:400 34px/1.4 'Be Vietnam Pro';color:${P.phu}}.dan.sang{color:${P.ke}}
.so-lon-p{font:400 200px/1 'Anton';color:${P.cam}}.so-lon-m{font:600 32px/1.3 'Be Vietnam Pro';color:${P.trang}}
.cho{font:600 32px/1.3 'Be Vietnam Pro';color:${P.muc}}.cho.cam{color:${P.cam};font-weight:800}.cho-so{font:800 34px/1.3 'Be Vietnam Pro';color:${P.navy};text-align:right}.cho-so.cam{color:${P.cam}}
.cot-so{font:400 46px/1.2 'Anton';color:${P.trang};text-align:center}.cot-so.cam{color:${P.cam}}.cot-nam{font:700 30px/1.2 'Be Vietnam Pro';color:${P.ke};text-align:center}
.nguon{font:400 26px/1.35 'Be Vietnam Pro';color:${P.phu}}.nguon.sang{color:${P.ke}}
.ngoac{font:400 220px/.6 'Anton';color:${P.cam}}.trich{font:500 36px/1.5 'Be Vietnam Pro';color:${P.trang}}.trich em{font-style:normal;color:${P.cam};font-weight:800}.trich-cc{font:700 28px/1.3 'Be Vietnam Pro';color:${P.ke}}
.the{background:${P.nen}}.vach{background:${P.cam}}.vach.navy{background:${P.navy}}.the-so{font:400 96px/1 'Anton';color:${P.navy}}.the-so.cam{color:${P.cam}}.the-t{font:400 48px/1.05 'Anton';color:${P.navy}}.the-ai{font:600 28px/1.2 'Be Vietnam Pro';color:${P.phu}}.the-m{font:700 38px/1.3 'Be Vietnam Pro';color:${P.muc}}.the-cc{font:600 28px/1.2 'Be Vietnam Pro';color:${P.phu}}
`;
  return { slides, css };
});
console.log("đã sinh h2, h3");
