// Deck "Hợp đồng bảo hiểm Bảo Việt An Gia và thị trường" — Nhóm 2. Skill slide-chuan.
// Phong cách: Hào chọn mẫu tham chiếu 2 + 9 (bảng cặp bìa + nội dung, 18/11/2026) — lấy mẫu 2 (Insurance Agency Business Plan) làm gốc:
//   nền trắng, mây xanh nhạt, vạch xanh lá mép trên + vạch cam mép dưới; tiêu đề căn giữa đen đậm, từ nhấn xanh lá;
//   icon trắng trong tròn cam; số liệu trong ô cam bo tròn; mở phần: số trong tròn cam + dải thành phố xanh nhạt + cỏ xanh + một vật phẳng.
// Bản này: 4 slide mẫu cho Hào duyệt (bìa, mở phần, biểu đồ, ba cột) trước khi dàn cả deck.
//   node deck.js && node ../../../.claude/skills/slide-chuan/scripts/dung.js . --ten=hop-dong-bao-hiem-nhom2
const fs = require("fs"), path = require("path");
const D = __dirname, mh = require("./minh-hoa.js");
const ghi = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
fs.rmSync(path.join(D, "asset", "hinh"), { recursive: true, force: true });
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const em = (s) => esc(s).replace(/\[(\d+)\]/g, "&#91;$1&#93;").replace(/\[([^\]]+)\]/g, "<em>$1</em>");   // [12] = số tài liệu nguồn, giữ nguyên
const P = { nen: "#FFFFFF", muc: "#1E2326", phu: "#4A5257", xanh: "#5DA93F", xanhNhat: "#9ED48A", cam: "#F39A1E", camNhat: "#FDE3BC", troi: "#CDEBF5", toa: "#9FD3E6", toa2: "#6FBAD6", may: "#A9D8EA", nuoc: "#3DB5E0", ray: "#EAF3F7", co: "#8DC67B", pho: "#A9DCF2", pho2: "#8FCFEA", camDam: "#C46A0A" };
const TONG = 22, S2 = [];
let nL = 0;
const A = (a, at, dur = 500) => `data-a="${a}" data-at="${at}" data-dur="${dur}"`;
const lop = (body, x, y, w, h, alt, loai = "hoa-tiet", ex = "") => { const f = `l${String(++nL).padStart(2, "0")}.svg`;
  ghi(path.join(D, "asset", "hinh", f), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${body}</svg>`);
  return `<img data-l="lop-${nL}" data-loai="${loai}" data-alt="${esc(alt)}" ${ex} src="asset/hinh/${f}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`; };
const T = (cls, x, y, w, s, ex = "") => `<div class="${cls}" data-t ${ex} style="left:${x}px;top:${y}px;width:${w}px">${em(s)}</div>`;
const sec = (mau, notes, inner, { ex = "", trans = "fade" } = {}) => S2.push(`<section class="s" data-mau="${mau}" data-nen="N1" ${ex} data-trans="${trans}" data-dur="600" data-notes="${esc(notes)}">\n${inner}\n</section>`);

// ---------- vật phẳng của bài (cùng một nét: khối phẳng, không viền, 2–3 tông) ----------
const may = (x, y, s) => `<g fill="${P.may}"><ellipse cx="${x}" cy="${y}" rx="${46 * s}" ry="${22 * s}"/><ellipse cx="${x + 40 * s}" cy="${y - 14 * s}" rx="${40 * s}" ry="${28 * s}"/><ellipse cx="${x + 82 * s}" cy="${y}" rx="${44 * s}" ry="${20 * s}"/><rect x="${x - 40 * s}" y="${y}" width="${164 * s}" height="${18 * s}" rx="${9 * s}"/></g>`;
const toaNha = (x, w, h, mau, day) => { let o = `<rect x="${x}" y="${day - h}" width="${w}" height="${h}" fill="${mau}"/>`;
  for (let r = day - h + 18; r < day - 22; r += 26) for (let c = x + 12; c < x + w - 14; c += 22) o += `<rect x="${c}" y="${r}" width="10" height="14" fill="#FFFFFF" opacity=".55"/>`; return o; };
// dải thành phố + sông + cỏ ở đáy slide (motif của mẫu 2)
const thanhPho = (y0 = 860) => { const toas = [[0, 120, 190], [130, 90, 140], [230, 130, 230], [370, 100, 170], [480, 150, 260], [640, 110, 180], [760, 130, 220], [900, 90, 150], [1000, 140, 250], [1150, 110, 190], [1270, 130, 230], [1410, 100, 160], [1520, 150, 270], [1680, 110, 190], [1800, 120, 220]];
  return toas.map(([x, w, h], k) => toaNha(x, w, h, k % 3 === 1 ? P.toa2 : P.toa, y0)).join("")
    + `<rect x="0" y="${y0}" width="1920" height="26" fill="${P.nuoc}"/><rect x="0" y="${y0 + 26}" width="1920" height="${1080 - y0 - 26}" fill="${P.xanh}"/><rect x="0" y="${y0 + 26}" width="1920" height="14" fill="${P.xanhNhat}"/>`; };
const cay = (x, day, s = 1) => `<rect x="${x - 6 * s}" y="${day - 70 * s}" width="${12 * s}" height="${70 * s}" fill="#8A5A2B"/><circle cx="${x}" cy="${day - 100 * s}" r="${46 * s}" fill="${P.xanh}"/><circle cx="${x - 26 * s}" cy="${day - 78 * s}" r="${30 * s}" fill="${P.xanh}"/><circle cx="${x + 28 * s}" cy="${day - 80 * s}" r="${32 * s}" fill="#4E9334"/>`;
// nhà dân có khiên (bảo hiểm che chở) — vật chính của bìa
const nhaKhien = (cx, day, s = 1) => `<rect x="${cx - 150 * s}" y="${day - 190 * s}" width="${300 * s}" height="${190 * s}" fill="#FFFFFF"/><rect x="${cx - 150 * s}" y="${day - 190 * s}" width="${300 * s}" height="${190 * s}" fill="none" stroke="${P.toa2}" stroke-width="${4 * s}"/>`
  + `<path d="M${cx - 185 * s} ${day - 185 * s} L${cx} ${day - 320 * s} L${cx + 185 * s} ${day - 185 * s} Z" fill="${P.cam}"/><rect x="${cx - 32 * s}" y="${day - 110 * s}" width="${64 * s}" height="${110 * s}" fill="${P.toa2}"/>`
  + `<rect x="${cx - 120 * s}" y="${day - 150 * s}" width="${66 * s}" height="${56 * s}" fill="${P.troi}"/><rect x="${cx + 54 * s}" y="${day - 150 * s}" width="${66 * s}" height="${56 * s}" fill="${P.troi}"/>`;
// bệnh viện — vật chính của phần I (bảo hiểm sức khoẻ)
const benhVien = (cx, day, s = 1) => { let o = `<rect x="${cx - 190 * s}" y="${day - 300 * s}" width="${380 * s}" height="${300 * s}" fill="#FFFFFF" stroke="${P.toa2}" stroke-width="${4 * s}"/><rect x="${cx - 190 * s}" y="${day - 330 * s}" width="${380 * s}" height="${34 * s}" fill="${P.toa2}"/>`;
  o += `<rect x="${cx - 40 * s}" y="${day - 290 * s}" width="${80 * s}" height="${80 * s}" rx="${10 * s}" fill="${P.cam}"/><rect x="${cx - 10 * s}" y="${day - 280 * s}" width="${20 * s}" height="${60 * s}" fill="#FFFFFF"/><rect x="${cx - 30 * s}" y="${day - 260 * s}" width="${60 * s}" height="${20 * s}" fill="#FFFFFF"/>`;
  for (const dx of [-150, -95, 55, 110]) for (const dy of [-280, -200]) o += `<rect x="${cx + dx * s}" y="${day + dy * s}" width="${40 * s}" height="${44 * s}" fill="${P.troi}"/>`;
  o += `<rect x="${cx - 150 * s}" y="${day - 120 * s}" width="${300 * s}" height="${30 * s}" fill="${P.troi}"/><rect x="${cx - 45 * s}" y="${day - 80 * s}" width="${90 * s}" height="${80 * s}" fill="${P.toa2}"/>`; return o; };

// ---------- khung slide (mẫu 2): vạch xanh lá nhạt thụt vào ~5 %, vạch cam ~95 %, bo tròn; mây phẳng ở góc trống ----------
// thanh tiến độ ở đáy (thay vạch cam trang trí): phần đã qua tô cam, khe trắng chia phần I (slide 1–13) / phần II (14–22)
const tienDo = (n, X = 120, W = 1680, H = 12, Y = 1022) => { const ranh = X + Math.round((W * 13) / TONG), toi = X + Math.round((W * n) / TONG);
  return `<rect x="${X}" y="${Y}" width="${W}" height="${H}" rx="${H / 2}" fill="#DADFE2"/><rect x="${X}" y="${Y}" width="${toi - X}" height="${H}" rx="${H / 2}" fill="${P.cam}"/><rect x="${ranh - 4}" y="${Y - 4}" width="8" height="${H + 8}" fill="#FFFFFF"/>`; };
const vien = (k = 0, day = true) => lop(`<rect x="${k % 2 ? 120 : 760}" y="48" width="1040" height="13" rx="6.5" fill="${P.xanhNhat}"/>` + (day ? tienDo(S2.length + 1) : "")
  + may(k % 2 ? 1700 : 130, 140, 1.3) + may(k % 2 ? 90 : 1740, day ? 930 : 560, 1.1), 0, 0, 1920, 1080, "Hình trang trí", "hoa-tiet");
// dải đáy chữ ký của mẫu 2: phố xanh nhạt + sông + cỏ (bìa, mở phần)
const nenDay = () => { const toas = [[0, 110, 150], [120, 90, 110], [220, 120, 190], [350, 90, 130], [450, 140, 210], [600, 100, 150], [710, 120, 180], [840, 90, 120], [940, 130, 200], [1080, 100, 150], [1190, 120, 190], [1320, 90, 130], [1420, 140, 220], [1570, 100, 160], [1680, 120, 190], [1810, 110, 150]];
  return lop(toas.map(([x, w, h], k) => toaNha(x, w, h, k % 3 === 1 ? P.pho2 : P.pho, 936)).join("") + `<rect x="0" y="936" width="1920" height="18" fill="${P.nuoc}"/><rect x="0" y="954" width="1920" height="126" fill="${P.co}"/>`, 0, 700, 1920, 380, "Hình trang trí: dải phố, sông, cỏ", "hoa-tiet"); };
// minh hoạ Storyset (kiểu Rafiki, màu nhấn xanh lá) — anh/storyset/, ghi công ở slide cuối và ghi-cong.md
const minhHoa = (f, x, y, w, alt, t0 = 300) => `<img data-l="mh-${f}" data-loai="minh-hoa" data-alt="${esc(alt)}" ${A("fade", t0, 700)} src="anh/storyset/${f}.svg" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${w}px">`;
// cảnh / nhân vật ghép bằng scripts/ghep_canh.js (anh/canh/, nguồn Storyset) — đặt theo chiều cao, rộng tự theo viewBox
const canh = (f, x, y, h, alt, t0 = 300, hieu = "fade") => { const [, , vw, vh] = fs.readFileSync(path.join(D, "anh", "canh", f + ".svg"), "utf8").match(/viewBox="([^"]+)"/)[1].split(" ").map(Number), w = Math.round((h * vw) / vh);
  return `<img data-l="canh-${f}" data-loai="minh-hoa" data-alt="${esc(alt)}" ${A(hieu, t0, 600)} src="anh/canh/${f}.svg" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`; };
const canhGiua = (f, cx, y, h, alt, t0, hieu) => { const [, , vw, vh] = fs.readFileSync(path.join(D, "anh", "canh", f + ".svg"), "utf8").match(/viewBox="([^"]+)"/)[1].split(" ").map(Number); return canh(f, Math.round(cx - (h * vw) / vh / 2), y, h, alt, t0, hieu); };
// icon trong tròn cam, nét đậm màu mực (kiểu icon hai tông của mẫu 2)
const iconTron = (ic, cx, cy, r, alt, ex = "", nen = P.cam) => lop(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${nen}"/>` + mh.iconNet(D, ic, cx, cy, r * 1.05, P.muc, 3.2), cx - r, cy - r, 2 * r, 2 * r, alt, "net", ex);
const dau = (td, ketLuan, so) => `<h1 class="td" data-t data-tieu-de ${A("fade", 0, 500)} style="left:260px;top:76px;width:1400px">${em(td)}</h1>`
  + `<div class="ket" data-t ${A("fade", 300, 500)} style="left:260px;top:178px;width:1400px">${em(ketLuan)}</div>`
  + T("so-trang", 1720, 962, 120, `${so} / ${TONG}`);
const nguon = (s) => T("nguon", 120, 962, 1500, s);
// mũi tên thẳng có đầu tam giác (toạ độ tuyệt đối)
const muiTen = (x1, y1, x2, y2, mau = P.phu, net = 4, dash = "") => { const a = Math.atan2(y2 - y1, x2 - x1), h = 20, q = (d) => `${Math.round(x2 - h * Math.cos(a + d))},${Math.round(y2 - h * Math.sin(a + d))}`;
  return `<path d="M${x1} ${y1} L${Math.round(x2 - 12 * Math.cos(a))} ${Math.round(y2 - 12 * Math.sin(a))}" stroke="${mau}" stroke-width="${net}" ${dash ? `stroke-dasharray="${dash}"` : ""}/><polygon points="${x2},${y2} ${q(-0.45)} ${q(0.45)}" fill="${mau}"/>`; };
const lopMui = (x1, y1, x2, y2, alt, ex = "", mau, dash) => lop(muiTen(x1, y1, x2, y2, mau, 4, dash), Math.min(x1, x2) - 22, Math.min(y1, y2) - 22, Math.abs(x2 - x1) + 44, Math.abs(y2 - y1) + 44, alt, "net", ex);
// một dòng gạch: icon nhỏ trong tròn + chữ
const dong = (ic, x, y, w, s, t0, nen = "#DDEFD5", cls = "gach") => iconTron(ic, x + 26, y + 22, 26, "Biểu tượng " + s.replace(/\[|\]/g, ""), A("pop", t0, 300), nen) + T(cls, x + 68, y, w - 68, s, A("fade", t0 + 80, 300));

// ============ 1 BÌA ============
sec("bia", "Chào thầy cô và các bạn. Nhóm 2 trình bày hai phần: phân tích mẫu hợp đồng bảo hiểm sức khoẻ Bảo Việt An Gia, và thực trạng thị trường bảo hiểm Việt Nam từ 2018 đến 9 tháng năm 2026.",
  vien(0, false) + nenDay() + minhHoa("insurance-rafiki", 1080, 330, 720, "Minh hoạ: nhân viên bảo hiểm che ô cho khách hàng cầm trái tim có chữ thập — bảo hiểm sức khoẻ")
  + `<h1 class="bia-td" data-t data-tieu-de ${A("fade", 0, 600)} style="left:116px;top:200px;width:940px">Hợp đồng bảo hiểm<br><em>Bảo Việt An Gia</em></h1>`
  + T("bia-phu", 120, 420, 940, "và thị trường bảo hiểm Việt Nam, 2018 – 2026", A("fade", 300, 500))
  + `<div class="nut" data-t data-l="nut-bia" data-alt="Ô nhãn" ${A("fade", 500, 500)} style="left:120px;top:510px">Báo cáo nhóm 2</div>`,
  { ex: "data-hero" });

// ============ 2 HAI CÂU HỎI CỦA BÀI ============
{ const C = [["01", "Hợp đồng An Gia bảo vệ người mua [đến đâu]?", [["users", "Các bên và hạn mức từng gói"], ["clock", "Thời gian chờ, đồng chi trả"], ["cash", "Chấm dứt, chi trả, lời khuyên"]]],
    ["02", "Thị trường 2018 – 2026 [lên hay xuống]?", [["chart-bar", "Doanh thu phí 2018 – 2025"], ["trending-down", "Vì sao năm 2023 giảm mạnh"], ["gavel", "Luật mới và số liệu 9 tháng 2026"]]]];
  sec("noi-dung", "Bài trả lời hai câu hỏi. Phần I đọc một hợp đồng thật — Bảo Việt An Gia — để thấy người mua được bảo vệ đến đâu và phải chịu những ràng buộc gì. Phần II đặt hợp đồng đó vào thị trường: doanh thu phí đi lên hay đi xuống từ 2018 đến 9 tháng năm 2026, và vì sao.",
    vien(0) + dau("Bài trả lời [hai câu hỏi]", "Đọc một hợp đồng thật, rồi xem thị trường nơi hợp đồng đó được bán", 2)
    + lop(`<path d="M960 330 V880" stroke="${P.may}" stroke-width="4" stroke-linecap="round"/>`, 956, 330, 8, 550, "Vạch chia hai phần", "hoa-tiet")
    + C.map(([so, cau, ds], k) => { const cx = 520 + k * 880, t0 = 300 + k * 900;
      return lop(`<circle cx="${cx}" cy="370" r="64" fill="${P.cam}"/>`, cx - 64, 306, 128, 128, "Vòng tròn số phần", "hoa-tiet", A("pop", t0, 400))
        + T("so-tron", cx - 64, 340, 128, so, A("pop", t0, 400))
        + T("cau", cx - 340, 460, 680, cau, A("fade", t0 + 150, 400))
        + ds.map(([ic, s], j) => dong(ic, cx - 260, 640 + j * 84, 640, s, t0 + 350 + j * 150)).join(""); }).join("")
    + nguon("Phần I: mẫu hợp đồng Bảo Việt An Gia (13 điều, Phụ lục 1). Phần II: số liệu thị trường 2018 – 9 tháng 2026."));
}

// ============ 3 MỞ PHẦN I ============
sec("mo-phan", "Phần I. Mẫu hợp đồng Bảo Việt An Gia là hợp đồng bảo hiểm sức khoẻ của Tổng Công ty Bảo hiểm Bảo Việt: 13 điều và Phụ lục 1 bảng quyền lợi. Nhóm đọc sáu nhóm điều khoản.",
  vien(1, false) + nenDay() + minhHoa("hospital-patient-rafiki", 1040, 330, 740, "Minh hoạ: bệnh nhân điều trị trên giường bệnh — đối tượng của bảo hiểm sức khoẻ")
  + lop(`<circle cx="270" cy="250" r="110" fill="${P.cam}"/>`, 160, 140, 220, 220, "Vòng tròn số phần", "hoa-tiet", A("pop", 0, 500))
  + T("mp-so", 160, 196, 220, "01", A("pop", 100, 500))
  + `<h1 class="mp-t" data-t data-tieu-de ${A("fade", 200, 600)} style="left:416px;top:150px;width:680px">Hợp đồng<br><em>Bảo Việt An Gia</em></h1>`
  + `<div class="nut" data-t data-l="nut-mp1" data-alt="Ô nhãn" ${A("fade", 500, 500)} style="left:420px;top:380px">Bảo hiểm sức khoẻ · 13 điều · Phụ lục 1</div>`,
  { trans: "push" });

// ============ 4 THỨ TỰ ƯU TIÊN — bậc thang ============
{ const B = [["file-description", "Sửa đổi, bổ sung mới nhất", "thoả thuận riêng ký sau cùng", P.xanh, 360], ["files", "Hợp đồng và Phụ lục 1", "13 điều + bảng quyền lợi", "#86C46E", 250], ["file-text", "Quy tắc bảo hiểm", "điều khoản chung, soạn sẵn", P.xanhNhat, 140]];
  sec("noi-dung", "Điều 12 liệt kê các tài liệu tạo thành bộ hợp đồng: giấy yêu cầu bảo hiểm, hợp đồng, Phụ lục 1, các sửa đổi bổ sung và Quy tắc bảo hiểm. Khi chúng mâu thuẫn, áp dụng theo bậc: sửa đổi bổ sung mới nhất trước, rồi hợp đồng và phụ lục, sau cùng là Quy tắc. Nói gọn: điều hai bên đã thoả thuận riêng thắng điều khoản soạn sẵn.",
    vien(1) + dau("Giấy tờ mâu thuẫn, [theo cái nào]?", "Thoả thuận riêng mới nhất thắng; Quy tắc bảo hiểm áp dụng sau cùng", 4)
    + B.map(([ic, ten, mo, mau, h], k) => { const x = 260 + k * 500, top = 880 - h, t0 = 400 + k * 450;
      return lop(`<rect x="${x}" y="${top}" width="490" height="${h}" fill="${mau}"/>`, x, top, 490, h, `Bậc ${k + 1}: ${ten}`, "bieu-do", A("rise", t0, 500))
        + T("so-bac", x, top + 24, 490, String(k + 1), A("fade", t0 + 200, 300))
        + iconTron(ic, x + 245, top - 196, 36, `Biểu tượng ${ten}`, A("pop", t0 + 100, 300), "#DDEFD5")
        + T("buoc-ten", x, top - 146, 490, ten, A("fade", t0 + 150, 300)) + T("buoc-mo", x, top - 96, 490, mo, A("fade", t0 + 200, 300)); }).join("")
    + nguon("Hợp đồng Bảo Việt An Gia, Điều 12 (thứ tự ưu tiên áp dụng khi các tài liệu mâu thuẫn)."));
}

// ============ 5 NĂM TƯ CÁCH — một gia đình thật (nhân vật ghép từ Storyset, scripts/ghep_canh.js) ============
{ const N = [["bo", "Bên mua bảo hiểm", "ví dụ: [bố] · giao kết, đóng phí", 340, 250, 200], ["bao-viet", "Bảo Việt", "nhận phí, cam kết chi trả", 960, 250, 200], ["con", "Người được bảo hiểm", "ví dụ: [con] · được bảo vệ sức khoẻ", 1580, 250, 200],
    ["me", "Người chỉ định nhận tiền", "ví dụ: [mẹ] · nhận tiền bồi thường", 640, 600, 180], ["thu-huong", "Người thụ hưởng", "nhận tiền khi người được bảo hiểm tử vong", 1280, 600, 180]];
  sec("noi-dung", "Hợp đồng tách năm tư cách. Lấy ví dụ bố mua bảo hiểm cho con. Bố là bên mua: giao kết, đóng phí. Bảo Việt nhận phí và cam kết chi trả. Con là người được bảo hiểm: sức khoẻ, tính mạng của con được bảo vệ. Khi con điều trị, tiền bồi thường có thể trả cho mẹ là người được chỉ định nhận tiền. Còn người thụ hưởng chỉ nhận tiền khi người được bảo hiểm tử vong. Một hợp đồng có thể gồm nhiều người, mỗi người một chương trình — tiện cho gói gia đình.",
    vien(0) + dau("Ai đóng tiền, ai được [bảo vệ]?", "Một hợp đồng có năm tư cách — có thể là năm người khác nhau", 5)
    + N.map(([f, ten, mo, cx, y, h], k) => { const t0 = [200, 500, 1200, 1700, 2100][k], ty = y + h + 8;
      return canhGiua(f, cx, y, h, `Nhân vật: ${ten}`, t0, "rise")
        + T("buoc-ten", cx - 230, ty, 460, ten, A("fade", t0 + 80, 300)) + T("buoc-mo", cx - 230, ty + 44, 460, mo, A("fade", t0 + 120, 300)); }).join("")
    + lopMui(410, 380, 880, 380, "Mũi tên: bên mua đóng phí cho Bảo Việt", A("wipe", 900, 400), P.phu) + T("nhan-mui", 445, 326, 400, "đóng phí", A("fade", 1000, 300))
    + lopMui(1040, 380, 1490, 380, "Mũi tên: Bảo Việt bảo vệ người được bảo hiểm", A("wipe", 1300, 400), P.phu) + T("nhan-mui", 1065, 326, 400, "bảo vệ", A("fade", 1400, 300))
    + lopMui(930, 562, 700, 630, "Mũi tên: Bảo Việt chi trả cho người chỉ định nhận tiền", A("fade", 1800, 400), P.xanh) + T("nhan-mui phai", 560, 556, 240, "chi trả", A("fade", 1900, 300))
    + lopMui(990, 562, 1225, 630, "Mũi tên nét đứt: Bảo Việt trả cho người thụ hưởng khi tử vong", A("fade", 2200, 400), P.cam, "12 10") + T("nhan-mui trai", 1110, 556, 260, "khi tử vong", A("fade", 2300, 300))
    + nguon("Hợp đồng Bảo Việt An Gia, Điều 1, 2, 8 (các bên và người nhận tiền). Ví dụ gia đình là minh hoạ của nhóm."));
}

// ============ 6 NĂM GÓI — thanh đúng tỉ lệ ============
{ const G = [["Đồng", 94, "#DDEFD5"], ["Bạc", 138, P.xanhNhat], ["Vàng", 230, "#86C46E"], ["Bạch Kim", 342, P.xanh], ["Kim Cương", 454, "#3E8A2A"]], X = 470, K = 1060 / 454;
  sec("noi-dung", "Phụ lục 1 có năm chương trình, từ Đồng đến Kim Cương. Tổng hạn mức quyền lợi chính mỗi người mỗi năm: 94, 138, 230, 342 và 454 triệu đồng — các thanh vẽ đúng tỉ lệ, gói cao nhất gần gấp năm gói thấp nhất. Quyền lợi chính là điều trị nội trú do bệnh, tai nạn, biến chứng thai sản: nằm viện tối đa 60 ngày một năm, kèm khám trong 30 ngày trước khi nhập viện và tái khám 30 ngày sau khi ra viện. Mọi gói chỉ áp dụng điều trị tại Việt Nam.",
    vien(1) + dau("Mỗi gói [bảo vệ] tối đa bao nhiêu?", "Hạn mức quyền lợi chính từ 94 đến [454 triệu đồng] mỗi người mỗi năm", 6)
    + G.map(([ten, v, mau], k) => { const y = 286 + k * 82, w = Math.round(v * K), t0 = 300 + k * 200;
      return T("hang-ten", 120, y + 4, 320, ten, A("fade", t0, 300))
        + lop(`<rect x="${X}" y="${y}" width="${w}" height="56" fill="${mau}"/>`, X, y, w, 56, `Thanh gói ${ten}: ${v} triệu đồng`, "bieu-do", A("wipe", t0, 500))
        + T("so-thanh trai", X + w + 18, y + 8, 300, `${v} triệu`, A("fade", t0 + 300, 300)); }).join("")
    + lop(`<path d="M120 712 H1800" stroke="${P.may}" stroke-width="3"/>`, 120, 710, 1680, 4, "Vạch ngăn", "hoa-tiet")
    + T("vi-du", 120, 732, 1680, "Mọi gói đều gồm điều trị nội trú do bệnh, tai nạn, biến chứng thai sản:", A("fade", 1400, 300))
    + [["60 ngày", "nằm viện tối đa mỗi năm"], ["30 ngày", "khám trước khi nhập viện"], ["30 ngày", "tái khám sau khi ra viện"], ["Việt Nam", "phạm vi điều trị"]]
      .map(([so, nhan], k) => T("cl-so", 120 + k * 420, 790, 400, so, A("fade", 1600 + k * 150, 300)) + T("buoc-mo", 120 + k * 420, 850, 400, nhan, A("fade", 1650 + k * 150, 300))).join("")
    + nguon("Hợp đồng Bảo Việt An Gia, Phụ lục 1 (bảng quyền lợi). Thanh vẽ đúng tỉ lệ hạn mức."));
}

// ============ 7 CHẬM PHÍ — chuỗi ba bước + nguyên văn ============
{ const B = [["calendar-due", "Đến hạn đóng phí", "tiền mặt hoặc chuyển khoản", "#DDEFD5"], ["coins", "Không đóng đúng, đủ", "thiếu tiền hoặc trễ hạn", P.camNhat], ["file-x", "Hợp đồng tự động huỷ bỏ", "trừ khi có thoả thuận khác", P.cam]];
  sec("noi-dung", "Điều 4: phí phải được thanh toán đúng và đủ, bằng tiền mặt hoặc chuyển khoản. Câu trên màn hình là nguyên văn hợp đồng: nếu phí không được thanh toán đúng và đủ, hợp đồng tự động huỷ bỏ, trừ khi có thoả thuận khác. Điều khoản này bảo vệ doanh nghiệp trước trường hợp khách chậm phí mà vẫn phát sinh sự kiện bảo hiểm. Nhóm chưa đối chiếu điều khoản này với quy định về đóng phí trong Luật Kinh doanh bảo hiểm 2022 — đó là câu hỏi để thảo luận.",
    vien(0) + dau("Đóng phí [trễ] thì sao?", "Phí không đóng đúng, đủ → hợp đồng [tự động huỷ bỏ]", 7)
    + B.map(([ic, ten, mo, nen], k) => { const cx = 380 + k * 580, t0 = 300 + k * 500;
      return iconTron(ic, cx, 400, 64, `Biểu tượng ${ten}`, A("pop", t0, 300), nen)
        + T("buoc-ten", cx - 250, 484, 500, ten, A("fade", t0 + 100, 300)) + T("buoc-mo", cx - 250, 530, 500, mo, A("fade", t0 + 150, 300))
        + (k < 2 ? lopMui(cx + 90, 400, cx + 490, 400, "Mũi tên sang bước sau", A("wipe", t0 + 250, 300)) : ""); }).join("")
    + lop(`<rect x="200" y="640" width="10" height="170" fill="${P.cam}"/>`, 200, 640, 10, 170, "Vạch trích dẫn", "hoa-tiet")
    + T("trich-lora", 240, 640, 1460, "“Hợp đồng bảo hiểm sẽ tự động hủy bỏ trong trường hợp phí bảo hiểm không được thanh toán đúng và đủ theo như quy định trên trừ khi có thỏa thuận khác.”", A("fade", 1800, 500))
    + T("trich-nguon", 240, 822, 1460, "Nguyên văn Điều 4 hợp đồng · Câu hỏi thảo luận: điều khoản này có phù hợp quy định về đóng phí của Luật Kinh doanh bảo hiểm 2022?", A("fade", 2200, 400))
    + nguon("Hợp đồng Bảo Việt An Gia, Điều 4 (phí bảo hiểm và phương thức thanh toán)."));
}

// ============ 8 THỜI GIAN CHỜ — trục thời gian thật (tỉ lệ đúng): khoảng trống 365 → 635 tự nói "sinh con chờ rất lâu" ============
{ const X0 = 200, X1 = 1720, AY = 600, K = (X1 - X0) / 635, px = (d) => Math.round(X0 + d * K);
  // [icon, nhóm, ngày, phía (1 trên / -1 dưới), tâm hộp chú thích]
  const TG = [["car-crash", "Tai nạn", 0, -1, 260], ["dental", "Bệnh thường, răng", 30, 1, 330], ["woman", "Biến chứng thai sản", 90, -1, 590], ["lungs", "Hô hấp ở trẻ ≤ 6 tuổi", 180, 1, 690], ["first-aid-kit", "Bệnh có sẵn, bệnh đặc biệt", 365, -1, 1074], ["baby-carriage", "Sinh con, gần 21 tháng", 635, 1, 1600]];
  sec("noi-dung", "Thời gian chờ: quyền lợi chưa được chi trả ngay sau khi ký, để chặn việc mua bảo hiểm khi đã biết trước bệnh. Trục này vẽ đúng tỉ lệ ngày. Tai nạn được chi trả ngay; bệnh thông thường, răng chờ 30 ngày; biến chứng thai sản 90; bệnh hô hấp ở trẻ đến 6 tuổi 180; bệnh có sẵn, bệnh đặc biệt, dây chằng, sụn chêm 365. Riêng sinh con 635 ngày, gần 21 tháng — đoạn cam dài sau mốc một năm. Muốn dùng quyền lợi này phải mua trước khi có kế hoạch sinh con. Tái tục liên tục thì không phải chờ lại.",
    vien(1) + dau("Mua hôm nay, [bao giờ] được chi trả?", "Tai nạn: ngay. Sinh con: chờ [635 ngày] — phải mua trước khi định sinh con", 8)
    // trục: xám nhạt, phần đến 1 năm xanh, phần 1 năm → 635 cam
    + lop(`<rect x="${X0}" y="${AY - 9}" width="${X1 - X0}" height="18" rx="9" fill="${P.ray}"/><rect x="${X0}" y="${AY - 9}" width="${px(365) - X0}" height="18" rx="9" fill="${P.xanh}"/><rect x="${px(365)}" y="${AY - 9}" width="${X1 - px(365)}" height="18" rx="9" fill="${P.cam}"/>`, X0, AY - 9, X1 - X0, 18, "Trục thời gian từ ngày ký đến ngày 635", "bieu-do", A("wipe", 300, 1600))
    + T("moc", px(365) - 120, AY - 52, 240, "mốc 1 năm", A("fade", 1200, 300))
    + TG.map(([ic, ten, d, phia, cx], k) => { const x = px(d), t0 = 500 + k * 260, chinh = d === 635, iy = phia > 0 ? 330 : 730;
      const day = phia > 0 ? `M${x} ${AY - 12} L${cx} 520` : `M${x} ${AY + 12} L${cx} 680`;
      return lop(`<path d="${day}" stroke="${P.muc}" stroke-width="3"/><circle cx="${x}" cy="${AY}" r="16" fill="#FFFFFF" stroke="${P.muc}" stroke-width="5"/>`, Math.min(x, cx) - 18, phia > 0 ? 504 : AY - 18, Math.abs(x - cx) + 36, phia > 0 ? 114 : 98, `Điểm ${d} ngày trên trục`, "bieu-do", A("fade", t0, 300))
        + iconTron(ic, cx, iy, 36, `Biểu tượng ${ten}`, A("pop", t0, 300), chinh ? P.cam : d >= 365 ? P.camNhat : "#DDEFD5")
        + T(`cl-so${chinh ? " cam-dam" : ""}`, cx - 140, iy + 44, 280, d ? `${d} ngày` : "Ngay", A("fade", t0 + 100, 300))
        + T("cl-ten", cx - 190, iy + 100, 380, ten, A("fade", t0 + 150, 300)); }).join("")
    + T("moc", 1250, AY + 30, 440, "sinh con: thêm [270 ngày] nữa", A("fade", 2000, 300))
    + nguon("Hợp đồng Bảo Việt An Gia, Điều 5. Trục vẽ đúng tỉ lệ ngày. Tái tục liên tục: không chờ lại, trừ phần hạn mức nâng thêm."));
}

// ============ 9 ĐỒNG CHI TRẢ TRẺ NHỎ — ví dụ 10 triệu ============
{ const X = 520, W = 1200, W70 = 840;
  const hang = (y, ten, dk, t0) => T("hang-ten", 100, y - 4, 400, ten, A("fade", t0, 300)) + T("hang-dk", 100, y + 42, 400, dk, A("fade", t0, 300));
  sec("noi-dung", "Với trẻ từ 15 ngày tuổi đến 3 tuổi. Ví dụ giả định: một đợt điều trị hết 10 triệu đồng, trong hạn mức. Nếu chữa ở cơ sở y tế tư nhân, khoa quốc tế, hoặc điều trị tự nguyện theo yêu cầu ở bệnh viện công, Bảo Việt trả 70 % — 7 triệu, gia đình tự trả 3 triệu. Nếu khám, điều trị thông thường ở bệnh viện công lập thì không đồng chi trả: Bảo Việt trả cả 10 triệu trong hạn mức. Điều khoản vừa hạn chế dùng dịch vụ đắt tiền ở nhóm tuổi hay ốm, vừa giữ quyền lợi cho người dùng y tế công.",
    vien(1) + dau("Con nhỏ ốm, [gia đình trả] bao nhiêu?", "Trẻ 15 ngày – 3 tuổi chữa ở cơ sở tư: Bảo Việt trả [70%], gia đình 30%", 9)
    + T("vi-du", X, 262, 1200, "Ví dụ giả định: một đợt điều trị hết [10 triệu đồng], trong hạn mức", A("fade", 300, 300))
    + hang(386, "Cơ sở tư, khoa quốc tế", "hoặc tự nguyện ở viện công", 500)
    + lop(`<rect x="${X}" y="380" width="${W70}" height="72" fill="${P.xanh}"/><rect x="${X + W70}" y="380" width="${W - W70}" height="72" fill="${P.cam}"/>`, X, 380, W, 72, "Thanh cơ sở tư: Bảo Việt 70 %, gia đình 30 %", "bieu-do", A("wipe", 600, 600))
    + T("thanh-chu", X, 396, W70, "Bảo Việt trả 7 triệu", A("fade", 1000, 300)) + T("thanh-chu", X + W70, 396, W - W70, "gia đình trả 3 triệu", A("fade", 1100, 300))
    + hang(556, "Bệnh viện công", "điều trị thông thường", 1400)
    + lop(`<rect x="${X}" y="550" width="${W}" height="72" fill="${P.xanh}"/>`, X, 550, W, 72, "Thanh bệnh viện công: Bảo Việt trả đủ", "bieu-do", A("wipe", 1500, 600))
    + T("thanh-chu", X, 566, W, "Bảo Việt trả đủ 10 triệu — không đồng chi trả", A("fade", 1900, 300))
    + iconTron("baby-carriage", 146, 760, 34, "Biểu tượng trẻ nhỏ", A("pop", 2200, 300), P.camNhat)
    + T("gach", 200, 736, 1560, "Vì sao? Trẻ dưới 3 tuổi hay ốm; đồng chi trả 30 % hạn chế dùng dịch vụ đắt tiền, còn viện công vẫn được trả đủ.", A("fade", 2300, 400))
    + nguon("Hợp đồng Bảo Việt An Gia, Phụ lục 1 mục 2 (đồng chi trả). Ví dụ giả định do nhóm tính."));
}

// ============ 10 CHẤM DỨT — ví dụ bằng tiền: một năm phí, ai chấm dứt thì nhận lại bao nhiêu ============
{ const BX = 520, M = 100, Y0 = 360, used = 4, con = 12 - used, CX = BX + used * M, W = con * M, W70 = Math.round(W * 0.7);
  const hang = (y, ten, dk, t0) => T("hang-ten", 100, y - 4, 390, ten, A("fade", t0, 300)) + T("hang-dk", 100, y + 42, 390, dk, A("fade", t0, 300));
  sec("noi-dung", "Điều 6. Hai bên đều được chấm dứt, phải báo trước 30 ngày bằng văn bản. Ví dụ giả định: phí 12 triệu đồng một năm, chấm dứt sau 4 tháng, còn 8 tháng tương ứng 8 triệu (hợp đồng tính theo tỷ lệ ngày, ở đây làm tròn theo tháng cho dễ theo dõi). Bên mua tự chấm dứt: chỉ nhận lại 70 %, tức 5,6 triệu, mất 2,4 triệu — và chỉ khi chưa có khoản chi trả nào. Bảo Việt chấm dứt: phải hoàn đủ 8 triệu. Gian lận, trục lợi: không phải chấm dứt mà là huỷ bỏ, mất toàn bộ quyền lợi. Câu hỏi mở: mức hoàn 70 % có cân bằng quyền lợi hai bên không.",
    vien(1) + dau("Nghỉ giữa chừng, [nhận lại] bao nhiêu?", "Báo trước 30 ngày. Bên mua tự chấm dứt chỉ được hoàn [70%] phí còn lại", 10)
    + T("vi-du", BX, 262, 1200, "Ví dụ giả định: phí [12 triệu đồng/năm], chấm dứt sau 4 tháng", A("fade", 300, 300))
    // năm hợp đồng: 4 tháng đã dùng + 8 tháng còn lại
    + hang(Y0 + 6, "Một năm phí", "12 tháng = 12 triệu", 400)
    + lop(`<rect x="${BX}" y="${Y0}" width="${used * M}" height="72" fill="#DADFE2"/><rect x="${CX}" y="${Y0}" width="${W}" height="72" fill="${P.camNhat}"/>` + Array.from({ length: 11 }, (_, i) => `<rect x="${BX + (i + 1) * M - 1}" y="${Y0}" width="2" height="72" fill="#FFFFFF"/>`).join("") + `<path d="M${CX} ${Y0 + 72} V740" stroke="${P.phu}" stroke-width="2" stroke-dasharray="8 8"/>`, BX, Y0, 12 * M, 380, "Thanh 12 tháng: 4 tháng đã dùng, 8 tháng còn lại", "bieu-do", A("wipe", 500, 700))
    + T("thanh-chu", BX, Y0 + 16, used * M, "đã dùng 4 tháng", A("fade", 900, 300)) + T("thanh-chu", CX, Y0 + 16, W, "còn 8 tháng = [8 triệu]", A("fade", 1000, 300))
    // bên mua chấm dứt: 70 % nhận lại, 30 % mất
    + hang(526, "Bên mua chấm dứt", "khi chưa nhận chi trả nào", 1300)
    + lop(`<rect x="${CX}" y="520" width="${W70}" height="72" fill="${P.xanh}"/><rect x="${CX + W70}" y="520" width="${W - W70}" height="72" fill="${P.cam}"/>`, CX, 520, W, 72, "Thanh bên mua chấm dứt: 70 % nhận lại, 30 % mất", "bieu-do", A("wipe", 1400, 600))
    + T("thanh-chu", CX, 536, W70, "nhận lại 5,6 triệu", A("fade", 1800, 300)) + T("thanh-chu", CX + W70, 536, W - W70, "mất 2,4 triệu", A("fade", 1900, 300))
    // Bảo Việt chấm dứt: hoàn đủ
    + hang(666, "Bảo Việt chấm dứt", "dù đã có khiếu nại hay chưa", 2200)
    + lop(`<rect x="${CX}" y="660" width="${W}" height="72" fill="${P.xanh}"/>`, CX, 660, W, 72, "Thanh Bảo Việt chấm dứt: hoàn đủ 8 triệu", "bieu-do", A("wipe", 2300, 600))
    + T("thanh-chu", CX, 676, W, "nhận lại đủ 8 triệu", A("fade", 2700, 300))
    // gian lận: không phải chấm dứt mà huỷ bỏ
    + iconTron("alert-triangle", 132, 812, 32, "Biểu tượng cảnh báo", A("pop", 3000, 300), P.camNhat)
    + T("canh-bao-chu", 184, 790, 1500, "Gian lận, trục lợi thì khác: hợp đồng bị [huỷ ngay], mất toàn bộ quyền lợi", A("fade", 3000, 400))
    + nguon("Hợp đồng Bảo Việt An Gia, Điều 6 khoản 1, 2. Ví dụ giả định; hợp đồng tính phí còn lại theo tỷ lệ ngày."));
}

// ============ 11 CHI TRẢ — dòng thời gian hồ sơ + điều kiện nộp qua ứng dụng ============
{ const B = [["device-mobile", "Nộp hồ sơ", "qua ứng dụng hoặc bản giấy"], ["zoom-check", "Đủ hồ sơ hợp lệ", "bắt đầu tính ngày"], ["cash", "Nhận tiền", "chậm nhất 15 ngày làm việc"]];
  sec("noi-dung", "Điều 10: Bảo Việt chi trả trong 15 ngày làm việc kể từ khi nhận đủ hồ sơ hợp lệ — mốc tính là ngày đủ hồ sơ, không phải ngày nộp. Phụ lục 1 mục 3 cho nộp hồ sơ mềm qua ứng dụng BaoViet Direct khi khoản bồi thường từ 10 triệu đồng trở xuống và không phải di sản thừa kế: xác thực bằng mã xác thực một lần, dùng hoá đơn điện tử có đường dẫn tra cứu, chứng từ y tế chụp hoặc scan, không cần công chứng hay gửi bản cứng.",
    vien(0) + dau("Nộp hồ sơ xong, [bao lâu] có tiền?", "Chậm nhất [15 ngày làm việc] kể từ khi nhận đủ hồ sơ hợp lệ", 11)
    + lop(`<rect x="960" y="324" width="580" height="16" rx="8" fill="${P.cam}"/>`, 960, 324, 580, 16, "Đoạn 15 ngày làm việc", "bieu-do", A("wipe", 1400, 600))
    + T("moc giua", 960, 282, 580, "≤ 15 ngày làm việc", A("fade", 1600, 300))
    + B.map(([ic, ten, mo], k) => { const cx = 380 + k * 580, t0 = 300 + k * 450;
      return iconTron(ic, cx, 400, 56, `Biểu tượng ${ten}`, A("pop", t0, 300), k === 2 ? P.cam : "#DDEFD5")
        + T("buoc-ten", cx - 240, 470, 480, ten, A("fade", t0 + 80, 300)) + T("buoc-mo", cx - 240, 516, 480, mo, A("fade", t0 + 120, 300))
        + (k === 0 ? lopMui(cx + 76, 400, cx + 500, 400, "Mũi tên sang bước sau", A("wipe", t0 + 250, 300)) : ""); }).join("")
    + lop(`<path d="M120 610 H1800" stroke="${P.may}" stroke-width="3"/>`, 120, 608, 1680, 4, "Vạch ngăn", "hoa-tiet")
    + T("muc-dau", 140, 640, 760, "Nộp qua ứng dụng BaoViet Direct khi", A("fade", 2000, 300))
    + dong("circle-check", 140, 708, 760, "khoản bồi thường ≤ [10 triệu đồng]", 2100) + dong("circle-check", 140, 784, 760, "không phải di sản thừa kế", 2250)
    + T("muc-dau", 1000, 640, 800, "Chỉ cần", A("fade", 2400, 300))
    + dong("lock-access", 1000, 708, 800, "mã xác thực một lần gửi qua điện thoại", 2500) + dong("receipt", 1000, 784, 800, "hoá đơn điện tử, chứng từ chụp hoặc scan", 2650)
    + T("buoc-mo trai", 1068, 856, 740, "không cần công chứng, không gửi bản cứng", A("fade", 2800, 300))
    + nguon("Hợp đồng Bảo Việt An Gia, Điều 10 (thời hạn chi trả); Phụ lục 1 mục 3 (hồ sơ mềm)."));
}

// ============ 12 TỔNG KẾT PHẦN I — được gì / cần để ý gì ============
{ const L = [["Thứ tự ưu tiên giấy tờ rõ ràng", "Điều 12"], ["Năm gói, chọn theo ngân sách", "Phụ lục 1"], ["Chi trả ≤ 15 ngày, nộp qua ứng dụng", "Điều 10"], ["Trẻ ở viện công được trả đủ", "Phụ lục 1"]];
  const R = [["Sinh con phải chờ [635 ngày]", "Điều 5"], ["Trẻ dưới 3 tuổi ở cơ sở tư tự trả [30%]", "Phụ lục 1"], ["Đóng phí trễ là hợp đồng [tự huỷ]", "Điều 4"], ["Điểm loại trừ nằm ở [Quy tắc bảo hiểm]", "Điều 7"]];
  sec("bang", "Tổng kết Phần I. Bên trái là điều người mua được: cấu trúc minh bạch, thứ tự ưu tiên rõ; quyền lợi linh hoạt theo ngân sách; chi trả nhanh và số hoá hồ sơ; trẻ điều trị ở viện công không phải đồng chi trả. Bên phải là điều phải để ý: thời gian chờ dài; đồng chi trả 30 % cho trẻ dưới 3 tuổi ở cơ sở tư; chậm phí là huỷ; và Điều 7 dẫn toàn bộ điểm loại trừ sang Quy tắc bảo hiểm — người mua phải đọc thêm văn bản khác mới biết trường hợp nào không được trả.",
    vien(1) + dau("Người mua [được] gì, [phải để ý] gì?", "Minh bạch, chi trả nhanh — nhưng nhiều ràng buộc người mua phải tự đọc", 12)
    + iconTron("shield-check", 200, 320, 44, "Biểu tượng điểm mạnh", A("pop", 200, 300), P.xanh) + T("muc-dau", 264, 296, 600, "Điểm mạnh", A("fade", 250, 300))
    + iconTron("alert-triangle", 1040, 320, 44, "Biểu tượng cần để ý", A("pop", 1400, 300), P.cam) + T("muc-dau", 1104, 296, 600, "Cần để ý", A("fade", 1450, 300))
    + lop(`<path d="M960 300 V900" stroke="${P.may}" stroke-width="4" stroke-linecap="round"/>`, 956, 300, 8, 600, "Vạch chia hai cột", "hoa-tiet")
    + L.map(([s, d], k) => dong("check", 140, 420 + k * 116, 640, s, 400 + k * 200, "#DDEFD5", "gach lon") + T("dieu phai", 780, 428 + k * 116, 150, d, A("fade", 480 + k * 200, 300))).join("")
    + R.map(([s, d], k) => dong("alert-circle", 990, 420 + k * 116, 680, s, 1600 + k * 200, P.camNhat, "gach lon") + T("dieu phai", 1660, 428 + k * 116, 150, d, A("fade", 1680 + k * 200, 300))).join("")
    + nguon("Tổng hợp từ các điều khoản đã phân tích ở slide 4 – 11."));
}

// ============ 13 BA VIỆC TRƯỚC KHI KÝ ============
{ const V = [["Khai đúng, đủ tiền sử bệnh", "khai sai có thể bị huỷ hợp đồng, mất quyền lợi (Điều 6)"], ["Đọc Quy tắc bảo hiểm", "điểm loại trừ nằm ở Chương III Quy tắc (Điều 7)"], ["Mua sớm theo thời gian chờ", "nhất là mốc 365 và 635 ngày (Điều 5)"]];
  sec("noi-dung", "Ba khuyến nghị cho bên mua, rút từ chính các điều khoản. Một, kê khai đầy đủ, chính xác tiền sử bệnh trên giấy yêu cầu bảo hiểm — khai sai là rủi ro bị huỷ hợp đồng theo Điều 6. Hai, yêu cầu và đọc Quy tắc bảo hiểm Bảo Việt An Gia, vì Điều 7 dẫn toàn bộ điểm loại trừ sang Chương III của Quy tắc. Ba, lên kế hoạch theo thời gian chờ, nhất là mốc 365 và 635 ngày.",
    vien(0) + dau("Trước khi ký, [làm ba việc]", "Ba khuyến nghị cho bên mua, rút từ chính các điều khoản", 13)
    + V.map(([ten, mo], k) => { const y = 330 + k * 180, t0 = 300 + k * 500;
      return lop(`<circle cx="190" cy="${y + 50}" r="50" fill="${P.cam}"/>`, 140, y, 100, 100, "Vòng tròn số", "hoa-tiet", A("pop", t0, 300))
        + T("so-tron nho", 140, y + 22, 100, String(k + 1), A("pop", t0, 300))
        + T("muc-dau", 280, y + 4, 860, ten, A("fade", t0 + 100, 300)) + T("buoc-mo trai", 280, y + 56, 860, mo, A("fade", t0 + 150, 300)); }).join("")
    + minhHoa("signing-a-contract-rafiki", 1180, 290, 620, "Minh hoạ: người cầm bút lớn ký hợp đồng", 1800)
    + nguon("Khuyến nghị của nhóm, dựa trên Điều 5, 6, 7 hợp đồng Bảo Việt An Gia."));
}

// ============ 14 MỞ PHẦN II ============
sec("mo-phan", "Phần II. Nhóm chia thị trường thành các giai đoạn: tăng nóng 2018 – 2022, khủng hoảng niềm tin 2023, chững lại 2024, phục hồi nhẹ 2025, và cập nhật 9 tháng 2026.",
  vien(0, false) + nenDay() + minhHoa("investment-data-rafiki", 1040, 330, 740, "Minh hoạ: người ngồi trên cột biểu đồ cạnh chồng tiền — số liệu thị trường")
  + lop(`<circle cx="270" cy="250" r="110" fill="${P.cam}"/>`, 160, 140, 220, 220, "Vòng tròn số phần", "hoa-tiet", A("pop", 0, 500))
  + T("mp-so", 160, 196, 220, "02", A("pop", 100, 500))
  + `<h1 class="mp-t" data-t data-tieu-de ${A("fade", 200, 600)} style="left:416px;top:150px;width:800px">Thị trường<br><em>bảo hiểm Việt Nam</em></h1>`
  + `<div class="nut" data-t data-l="nut-mp2" data-alt="Ô nhãn" ${A("fade", 500, 500)} style="left:416px;top:380px">2018 – 9 tháng 2026 · doanh thu, luật mới</div>`,
  { trans: "push" });

// ============ 15 DOANH THU PHÍ 2018 – 2025 — cột ============
{ const D8 = [[2018, 133.7], [2019, 160.2], [2020, 184.7], [2021, 216.0], [2022, 251.3], [2023, 227.1, "−8,02 %"], [2024, 227.5, "−0,26 %"], [2025, 237.2, "+3,96 %"]], X0 = 250, DX = 196, CW = 128, Y = 840, KS = 1.6;
  const SK = { 2023: "thanh tra", 2024: "cấm bán kèm", 2025: "sửa luật" };
  const mau = (n) => (n === 2023 || n === 2024 ? P.cam : P.xanh);   // cam = năm giảm, xanh = năm tăng
  sec("noi-dung", "Giai đoạn 2019 – 2022 doanh thu phí tăng 15 – 20 % mỗi năm, từ 133,7 lên 251,3 nghìn tỷ đồng — gần gấp đôi — nhờ bùng nổ bán bảo hiểm qua ngân hàng. Năm 2023 doanh thu giảm 8,02 % — năm đầu tiên đi xuống trong cả giai đoạn. Năm 2024 đi ngang, năm 2025 tăng lại gần 4 %. Dòng dưới trục nối mỗi năm với sự kiện chính: 2023 thanh tra bán bảo hiểm qua ngân hàng, 2024 luật cấm bán kèm, 2025 Quốc hội sửa Luật Kinh doanh bảo hiểm — ba slide tiếp theo đi vào từng sự kiện. Lưu ý: tốc độ tăng giảm là số cơ quan quản lý công bố, so với số liệu đã điều chỉnh của năm trước, nên lệch nhẹ so với phép chia trực tiếp giữa các cột.",
    vien(1) + dau("Doanh thu phí [đi đâu] sau 2022?", "Gần gấp đôi trong 2018 – 2022, rồi 2023 [giảm 8 %], đi ngang 2024", 15)
    + lop(`<path d="M${X0} 352 V340 H${X0 + 4 * DX + CW} V352" stroke="${P.xanh}" stroke-width="4" fill="none"/>`, X0, 338, 4 * DX + CW, 16, "Ngoặc giai đoạn tăng nóng 2018 – 2022", "bieu-do", A("fade", 1500, 300))
    + T("moc xanh", X0, 290, 4 * DX + CW, "tăng nóng: +15 – 20 % mỗi năm", A("fade", 1500, 300))
    + D8.map(([n, v, tg], k) => { const x = X0 + k * DX, h = Math.round(v * KS), t0 = 300 + k * 160;
      return lop(`<rect x="${x}" y="${Y - h}" width="${CW}" height="${h}" fill="${mau(n)}"/>`, x, Y - h, CW, h, `Cột ${n}: ${String(v).replace(".", ",")} nghìn tỷ đồng`, "bieu-do", A("rise", t0, 400))
        + T("so-cot", x - 30, Y - h - 46, CW + 60, String(v.toFixed(1)).replace(".", ","), A("fade", t0 + 200, 300))
        + T("nam", x - 20, Y + 10, CW + 40, String(n), A("fade", t0, 300))
        + (tg ? T(`tang${tg[0] === "−" ? " am" : ""}`, x - 34, 290, CW + 68, tg, A("fade", t0 + 300, 300)) : "")
        + (SK[n] ? T("su-kien", x - 34, Y + 54, CW + 68, SK[n], A("fade", 2200 + k * 100, 300)) : ""); }).join("")
    + lop(`<path d="M${X0 - 20} ${Y} H${X0 + 7 * DX + CW + 20}" stroke="${P.phu}" stroke-width="3"/>`, X0 - 20, Y - 2, 7 * DX + CW + 40, 4, "Trục ngang", "bieu-do")
    + nguon("Nghìn tỷ đồng. 2018 – 2023: tài liệu nhóm [5] – [10]; 2024: Bộ Tài chính; 2025: Cục Quản lý, giám sát bảo hiểm."));
}

// ============ 16 VÌ SAO 2023 GIẢM — chuỗi nhân quả ============
{ const TY = [[2018, 20], [2021, 40], [2022, 45]];
  sec("noi-dung", "Gốc của khủng hoảng là kênh bán qua ngân hàng. Theo Công ty Chứng khoán Dầu khí, tỷ trọng bán qua ngân hàng trong phí khai thác mới nhân thọ từ khoảng 20 % năm 2018 lên 45 % năm 2022. Ngày 30/6/2023 Bộ Tài chính công bố kết luận thanh tra tại Prudential, MB Ageas, Sun Life và BIDV MetLife: sai phạm nhiều nhất ở khâu tư vấn. Khách hàng mất niềm tin: phí khai thác mới nhân thọ giảm 44,5 %, số hợp đồng mới giảm 43,8 %.",
    vien(0) + dau("Vì sao năm 2023 [giảm mạnh]?", "Bán qua ngân hàng tăng nóng → sai phạm bị phát hiện → khách quay lưng", 16)
    + [["1", "Bán qua ngân hàng tăng nóng"], ["2", "Thanh tra phát hiện sai phạm"], ["3", "Hợp đồng mới giảm gần nửa"]].map(([so, ten], k) => T("muc-dau giua", 120 + k * 600, 290, 480, `${so}. ${ten}`, A("fade", 300 + k * 1000, 300))).join("")
    // cột 1: tỷ trọng
    + TY.map(([n, v], k) => { const x = 190 + k * 130, h = v * 7, t0 = 500 + k * 200;
      return lop(`<rect x="${x}" y="${760 - h}" width="96" height="${h}" fill="${k === 2 ? P.cam : P.xanhNhat}"/>`, x, 760 - h, 96, h, `Cột ${n}: khoảng ${v} %`, "bieu-do", A("rise", t0, 400))
        + T("so-cot", x - 20, 760 - h - 46, 136, `${v} %`, A("fade", t0 + 200, 300)) + T("nam", x - 20, 770, 136, String(n), A("fade", t0, 300)); }).join("")
    + T("buoc-mo", 120, 820, 480, "tỷ trọng trong phí khai thác mới nhân thọ", A("fade", 1100, 300))
    + lopMui(620, 600, 700, 600, "Mũi tên dẫn sang bước 2", A("wipe", 1200, 300))
    // cột 2: thanh tra
    + iconTron("gavel", 960, 470, 70, "Biểu tượng búa thanh tra", A("pop", 1300, 300), P.camNhat)
    + T("buoc-ten", 720, 566, 480, "30/6/2023", A("fade", 1400, 300))
    + T("buoc-mo", 720, 616, 480, "Prudential · MB Ageas · Sun Life · BIDV MetLife", A("fade", 1500, 300))
    + T("gach giua", 720, 720, 480, "sai phạm nhiều nhất ở [khâu tư vấn]", A("fade", 1700, 300))
    + lopMui(1220, 600, 1300, 600, "Mũi tên dẫn sang bước 3", A("wipe", 1900, 300))
    // cột 3: số lớn
    + T("so-to cam", 1320, 380, 480, "−44,5 %", A("fade", 2100, 400)) + T("so-nhan", 1320, 490, 480, "phí khai thác mới nhân thọ", A("fade", 2150, 300))
    + T("so-to cam", 1320, 600, 480, "−43,8 %", A("fade", 2400, 400)) + T("so-nhan", 1320, 710, 480, "số hợp đồng nhân thọ mới", A("fade", 2450, 300))
    + nguon("Tài liệu nhóm: [12] Chứng khoán Dầu khí (tỷ trọng); [14] kết luận thanh tra; [15] Hiệp hội Bảo hiểm Việt Nam (năm 2023)."));
}

// ============ 17 LUẬT CẤM BÁN KÈM — trích nguyên văn ============
sec("trich", "Ngày 01/7/2024 Luật Các tổ chức tín dụng 2024 có hiệu lực. Điều 15 liệt kê các hành vi bị nghiêm cấm; khoản 5 cấm tổ chức tín dụng và nhân viên gắn việc bán bảo hiểm không bắt buộc với việc cung ứng sản phẩm, dịch vụ ngân hàng dưới mọi hình thức — tức là không được ép khách mua bảo hiểm thì mới cho vay. Đây là phản ứng trực tiếp với sai phạm năm 2023.",
  vien(1) + dau("Luật [cấm] gì từ 01/7/2024?", "Ngân hàng không được ép khách mua bảo hiểm mới cho vay, mở thẻ", 17)
  + lop(`<rect x="160" y="300" width="10" height="410" fill="${P.cam}"/>`, 160, 300, 10, 410, "Vạch trích dẫn", "hoa-tiet")
  + T("trich-nguon", 200, 300, 1040, "Nghiêm cấm tổ chức tín dụng, chi nhánh ngân hàng nước ngoài và người quản lý, điều hành, nhân viên của họ:", A("fade", 200, 400))
  + T("trich-lora lon", 200, 400, 1040, "“… [gắn việc bán sản phẩm bảo hiểm không bắt buộc] với việc cung ứng sản phẩm, dịch vụ ngân hàng [dưới mọi hình thức].”", A("fade", 400, 600))
  + T("trich-nguon", 200, 640, 1040, "Luật Các tổ chức tín dụng số 32/2024/QH15, khoản 5 Điều 15 (hành vi bị nghiêm cấm) — hiệu lực 01/7/2024", A("fade", 800, 400))
  + canh("ngan-hang", 1250, 290, 560, "Cảnh ghép: khách đứng trước quầy ngân hàng, nhân viên nói phải mua bảo hiểm mới duyệt vay", 1000)
  + T("bong-noi", 1250 + 316, 290 + 14, 268, "Mua bảo hiểm thì mới duyệt vay!", A("fade", 1500, 300))
  + iconTron("ban", 1250 + 300, 290 + 104, 36, "Biểu tượng cấm đè lên lời ép mua", A("pop", 2000, 400), P.cam)
  + T("gach giua", 1250, 866, 600, "Từ 01/7/2024: [bị cấm]", A("fade", 2200, 300))
  + nguon("Đối chiếu nguyên văn khoản 5 Điều 15 trong văn bản hợp nhất Luật Các tổ chức tín dụng số 158 của Văn phòng Quốc hội."));

// ============ 18 NHÂN THỌ / PHI NHÂN THỌ — thanh hai chiều ============
{ const Z = 760, K = 28, R = [["2023", -12.5, "−12,5 %", 2.87, "+2,87 %"], ["2024", -5, "≈ −5 %", 10.2, "+10,2 %"], ["2025", 0.5, "+0,5 %", 10.5, "≈ +10 – 11 %"]];
  sec("noi-dung", "Hai xu hướng ngược chiều. Nhân thọ — bảo hiểm tính mạng, tích luỹ, bán nhiều qua ngân hàng — chịu tác động trực tiếp: giảm 12,5 % năm 2023, khoảng 5 % năm 2024, gần như đi ngang năm 2025. Phi nhân thọ — sức khoẻ, tài sản, xe cộ, như chính hợp đồng An Gia — tăng đều: 2,87 %, 10,2 %, rồi khoảng 10 – 11 %, và giữ cho thị trường không giảm sâu hơn.",
    vien(0) + dau("Ai [giữ] thị trường không giảm sâu?", "Nhân thọ giảm hai năm liền; phi nhân thọ tăng đều mỗi năm", 18)
    + lop(`<rect x="300" y="286" width="36" height="28" fill="${P.cam}"/><rect x="620" y="286" width="36" height="28" fill="${P.xanh}"/>`, 300, 286, 356, 28, "Chú giải màu", "bieu-do")
    + T("gach", 346, 280, 260, "Nhân thọ", "") + T("gach", 666, 280, 300, "Phi nhân thọ", "")
    + lop(`<path d="M${Z} 350 V880" stroke="${P.muc}" stroke-width="3"/>`, Z - 2, 350, 4, 530, "Trục 0 %", "bieu-do")
    + R.map(([n, a, sa, b, sb], k) => { const y = 370 + k * 172, wa = Math.max(Math.round(Math.abs(a) * K), 8), wb = Math.round(b * K), t0 = 400 + k * 500, xa = a < 0 ? Z - wa : Z;
      return T("nam trai", 100, y + 40, 140, n, A("fade", t0, 300))
        + lop(`<rect x="${xa}" y="${y}" width="${wa}" height="56" fill="${P.cam}"/>`, xa, y, wa, 56, `Nhân thọ ${n}: ${sa}`, "bieu-do", A("wipe", t0, 400))
        + T(`so-thanh ${a < 0 ? "cam-dam phai" : "trai"}`, a < 0 ? xa - 216 : Z + wa + 14, y + 8, 200, sa, A("fade", t0 + 200, 300))
        + lop(`<rect x="${Z}" y="${y + 66}" width="${wb}" height="56" fill="${P.xanh}"/>`, Z, y + 66, wb, 56, `Phi nhân thọ ${n}: ${sb}`, "bieu-do", A("wipe", t0 + 200, 400))
        + T("so-thanh trai", Z + (wb > 250 ? 294 : wb) + 14, y + 74, 260, sb, A("fade", t0 + 400, 300)); }).join("")
    + iconTron("heart-plus", 1440, 380, 40, "Biểu tượng nhân thọ", A("pop", 2000, 300), P.camNhat) + T("muc-dau nho", 1496, 356, 330, "Nhân thọ", A("fade", 2000, 300))
    + T("buoc-mo trai", 1400, 430, 420, "tính mạng, tích luỹ — bán nhiều qua ngân hàng", A("fade", 2050, 300))
    + iconTron("shield-check", 1440, 610, 40, "Biểu tượng phi nhân thọ", A("pop", 2200, 300), "#DDEFD5") + T("muc-dau nho", 1496, 586, 330, "Phi nhân thọ", A("fade", 2200, 300))
    + T("buoc-mo trai", 1400, 660, 420, "sức khoẻ, tài sản, xe — như hợp đồng An Gia", A("fade", 2250, 300))
    + nguon("Tốc độ tăng doanh thu phí so với năm trước. Tài liệu nhóm, Hình 2 ([10], [11]); 2024 – 2025 là số ước tính."));
}

// ============ 19 BÃO YAGI — thanh đúng tỉ lệ: tạm ứng nhỏ xíu so với thiệt hại ============
{ const X = 520, K = 700 / 12811, R = [["Thiệt hại ước tính", "bão Yagi, 9/2024", 12811, "12.811 tỷ", P.cam], ["Đã tạm ứng", "giữa tháng 10/2024", 213, "213 tỷ", P.xanh], ["Đã tạm ứng", "đến 9/1/2025", 956.5, "956,5 tỷ", P.xanh]];
  sec("noi-dung", "Phi nhân thọ tăng, nhưng bão Yagi tháng 9/2024 cho thấy điểm yếu. Theo tài liệu nhóm, thiệt hại ước tính khoảng 12.811 tỷ đồng. Đến giữa tháng 10/2024 mới tạm ứng 213 tỷ; đến 9/1/2025, khoảng bốn tháng sau bão, lên 956,5 tỷ — chưa đến 8 % con số thiệt hại ước tính. Các thanh vẽ đúng tỉ lệ. Bồi thường thiên tai còn chậm.",
    vien(1) + dau("Bão Yagi: bồi thường [nhanh đến đâu]?", "Bốn tháng sau bão, tạm ứng mới bằng [chưa đến 8 %] thiệt hại ước tính", 19)
    + R.map(([ten, mo, v, sv, mau], k) => { const y = 330 + k * 170, w = Math.max(Math.round(v * K), 6), t0 = 300 + k * 600;
      return T("hang-ten", 100, y - 4, 400, ten, A("fade", t0, 300)) + T("hang-dk", 100, y + 42, 400, mo, A("fade", t0, 300))
        + lop(`<rect x="${X}" y="${y}" width="${w}" height="72" fill="${mau}"/>`, X, y, w, 72, `Thanh ${ten} ${mo}: ${sv}`, "bieu-do", A("wipe", t0, 500))
        + T(`so-thanh trai${k ? "" : " cam-dam"}`, X + w + 18, y + 14, 260, sv, A("fade", t0 + 300, 300)); }).join("")
    + minhHoa("flood-rafiki", 1380, 300, 460, "Minh hoạ: phố ngập nước, xe chìm sau mưa lớn — thiệt hại do bão lũ", 1800)
    + T("gach", 100, 840, 1260, "Phi nhân thọ đang tăng, nhưng [bồi thường thiên tai] vẫn là điểm yếu.", A("fade", 2000, 300))
    + nguon("Tài liệu nhóm [16] VCCI, [17] VietnamFinance (số liệu Cục Quản lý, giám sát bảo hiểm). Thanh vẽ đúng tỉ lệ."));
}

// ============ 20 BỐN MỐC PHÁP LÝ — trục thời gian đúng tỉ lệ tháng ============
{ const X0 = 300, X1 = 1660, AY = 600, M = 36, px = (m) => Math.round(X0 + (m / M) * (X1 - X0));
  // [icon, ngày, việc, chi tiết, tháng kể từ 01/2023, phía, tâm chú thích]
  const MC = [["file-certificate", "01/01/2023", "Luật Kinh doanh bảo hiểm 2022 có hiệu lực", "Luật 08/2022/QH15 và các văn bản hướng dẫn", 0, 1, 330],
    ["gavel", "30/6/2023", "Kết luận thanh tra bốn doanh nghiệp", "sai phạm ở khâu tư vấn bán qua ngân hàng", 6, -1, 560],
    ["ban", "01/7/2024", "Cấm bán kèm bảo hiểm qua ngân hàng", "Luật Các tổ chức tín dụng 32/2024/QH15", 18, 1, 980],
    ["file-text", "01/01/2026", "Luật sửa đổi 139/2025/QH15 có hiệu lực", "thông qua 10/12/2025", 36, -1, 1600]];
  sec("noi-dung", "Bốn mốc pháp lý, trục vẽ theo tỉ lệ thời gian. Luật Kinh doanh bảo hiểm 2022 có hiệu lực từ 01/01/2023, hướng dẫn bởi Nghị định 46/2023, Nghị định 67/2023 và Thông tư 67/2023 của Bộ Tài chính. Kết luận thanh tra 30/6/2023. Luật Các tổ chức tín dụng 2024 có hiệu lực 01/7/2024. Ngày 10/12/2025 Quốc hội thông qua Luật số 139/2025/QH15 sửa đổi Luật Kinh doanh bảo hiểm, hiệu lực 01/01/2026, một số khoản từ 01/7/2026, nhằm cắt giảm điều kiện kinh doanh và đơn giản hoá thủ tục.",
    vien(0) + dau("Luật đã thay đổi [ra sao]?", "Bốn mốc 2023 – 2026: luật mới, thanh tra, cấm bán kèm, sửa luật", 20)
    + lop(`<rect x="${X0}" y="${AY - 8}" width="${X1 - X0}" height="16" rx="8" fill="${P.xanh}"/>`, X0, AY - 8, X1 - X0, 16, "Trục thời gian 01/2023 – 01/2026", "bieu-do", A("wipe", 200, 1400))
    + MC.map(([ic, ngay, viec, ct, m, phia, cx], k) => { const x = px(m), t0 = 400 + k * 450, chinh = k === 2;
      const ty = phia > 0 ? 268 : 690, duong = phia > 0 ? `M${x} ${AY - 40} L${cx} ${ty + 232}` : `M${x} ${AY + 40} L${cx} ${ty - 10}`;
      return lop(`<path d="${duong}" stroke="${P.muc}" stroke-width="3"/>`, Math.min(x, cx) - 4, phia > 0 ? ty + 228 : AY + 36, Math.abs(x - cx) + 8, phia > 0 ? AY - 36 - (ty + 228) : ty - 6 - AY - 36, `Đường dẫn mốc ${ngay}`, "bieu-do", A("fade", t0, 300))
        + iconTron(ic, x, AY, 38, `Biểu tượng mốc ${ngay}`, A("pop", t0, 300), chinh ? P.cam : "#DDEFD5")
        + T(`cl-so${chinh ? " cam-dam" : ""}`, cx - 230, ty, 460, ngay, A("fade", t0 + 100, 300))
        + T("muc-dau giua nho", cx - 230, ty + 58, 460, viec, A("fade", t0 + 150, 300))
        ; }).join("")
    + minhHoa("lawyer-rafiki", 1290, 236, 330, "Minh hoạ: luật sư cầm hồ sơ trước bàn — các mốc pháp lý", 2400)
    + nguon("Luật 08/2022/QH15; Luật 32/2024/QH15; Luật 139/2025/QH15 (vanban.chinhphu.vn, vbpl.vn). Trục vẽ theo tỉ lệ tháng."));
}

// ============ 21 CHÍN THÁNG 2026 — thanh cơ cấu + ba số lớn ============
{ const X = 160, W = 1600, K = W / 175.8, wn = Math.round(101.7 * K);
  sec("so-lon", "Cập nhật 9 tháng năm 2026 theo báo cáo tình hình kinh tế – xã hội: tổng doanh thu phí ước 175,8 nghìn tỷ, tăng 2,4 %. Trong đó nhân thọ 101,7 nghìn tỷ, vẫn chiếm phần lớn, và phi nhân thọ 74,1 nghìn tỷ, tăng 15,1 %. Nguồn báo chí không nêu tốc độ của nhân thọ; nhóm tự suy từ hai số trên: cùng kỳ năm trước tổng khoảng 171,7 và phi nhân thọ khoảng 64,4 nghìn tỷ, vậy nhân thọ khoảng 107,3 xuống 101,7 — giảm khoảng 5 %. Đây là số nhóm tự tính, không phải số công bố. Chi trả quyền lợi 77,9 nghìn tỷ, tăng 13,1 %. Lưu ý: tài liệu nhóm trích nguồn 21, 22 nhưng chưa có trong danh mục — nhóm sẽ bổ sung.",
    vien(1) + dau("9 tháng 2026: thị trường [lớn nhờ ai]?", "Tổng phí chỉ tăng 2,4 %, còn phi nhân thọ tăng [15,1 %]", 21)
    + T("vi-du", X, 262, 1600, "Tổng doanh thu phí 9 tháng 2026: [175,8 nghìn tỷ đồng]", A("fade", 200, 300))
    + lop(`<rect x="${X}" y="350" width="${wn}" height="110" fill="${P.camNhat}"/><rect x="${X + wn}" y="350" width="${W - wn}" height="110" fill="${P.xanh}"/>`, X, 350, W, 110, "Thanh cơ cấu: nhân thọ 101,7, phi nhân thọ 74,1 nghìn tỷ", "bieu-do", A("wipe", 400, 800))
    + T("thanh-chu", X, 384, wn, "Nhân thọ 101,7 nghìn tỷ", A("fade", 900, 300)) + T("thanh-chu", X + wn, 384, W - wn, "Phi nhân thọ 74,1 nghìn tỷ", A("fade", 1000, 300))
    + [["+2,4 %", "tổng doanh thu phí", ""], ["+15,1 %", "phi nhân thọ", " xanh"], ["≈ −5 %", "nhân thọ (nhóm tự tính)", " cam"]]
      .map(([so, nhan, c], k) => T(`so-to${c} lon`, 160 + k * 540, 560, 520, so, A("fade", 1300 + k * 300, 400)) + T("so-nhan", 160 + k * 540, 712, 520, nhan, A("fade", 1350 + k * 300, 300))).join("")
    + T("buoc-mo", 160, 846, 1600, "Nhân thọ ≈ −5 %: suy từ tổng (+2,4 %) và phi nhân thọ (+15,1 %), cùng kỳ năm trước. Chi trả quyền lợi 77,9 nghìn tỷ (+13,1 %).", A("fade", 2300, 300))
    + nguon("Số ước tính 9 tháng 2026, báo cáo tình hình kinh tế – xã hội (dẫn theo anninhthudo.vn, baomoi.com)."));
}

// ============ 22 KẾT LUẬN — trả lời đúng hai câu hỏi ở slide 2 (khép vòng) ============
{ const C = [["01", "Hợp đồng An Gia bảo vệ người mua đến đâu?", "Rộng, minh bạch — nhưng nhiều ràng buộc", [["check", "5 gói 94 – 454 triệu; chi trả ≤ 15 ngày làm việc", "#DDEFD5"], ["alert-circle", "chờ đến [635 ngày], đồng chi trả 30 %, trễ phí là huỷ", P.camNhat]]],
    ["02", "Thị trường 2018 – 2026 lên hay xuống?", "Lên nhanh, gãy năm 2023, nay hồi lại", [["trending-down", "bán sai qua ngân hàng → 2023 giảm 8 %", P.camNhat], ["trending-up", "luật siết; phi nhân thọ [+15,1 %] (9 tháng 2026)", "#DDEFD5"]]]];
  sec("ket", "Quay lại hai câu hỏi ở đầu bài. Một: hợp đồng Bảo Việt An Gia bảo vệ người mua khá rộng và minh bạch — năm gói từ 94 đến 454 triệu, chi trả trong 15 ngày làm việc — nhưng có nhiều ràng buộc người mua phải tự đọc: thời gian chờ đến 635 ngày, đồng chi trả 30 % cho trẻ nhỏ ở cơ sở tư, chậm phí là hợp đồng tự huỷ. Hai: thị trường tăng nhanh đến 2022, gãy năm 2023 vì bán sai cách qua ngân hàng, rồi hồi lại khi luật siết việc bán hàng và phi nhân thọ dẫn dắt tăng trưởng. Nhóm cảm ơn thầy cô và các bạn đã lắng nghe.",
    vien(0) + dau("Trả lời [hai câu hỏi]", "Quay lại câu hỏi đặt ra ở đầu bài", 22)
    + lop(`<path d="M960 300 V760" stroke="${P.may}" stroke-width="4" stroke-linecap="round"/>`, 956, 300, 8, 460, "Vạch chia hai phần", "hoa-tiet")
    + C.map(([so, hoi, dap, ds], k) => { const cx = 520 + k * 880, t0 = 300 + k * 1200;
      return lop(`<circle cx="${cx}" cy="330" r="50" fill="${P.cam}"/>`, cx - 50, 280, 100, 100, "Vòng tròn số phần", "hoa-tiet", A("pop", t0, 300))
        + T("so-tron nho", cx - 50, 304, 100, so, A("pop", t0, 300))
        + T("buoc-mo", cx - 380, 400, 760, hoi, A("fade", t0 + 100, 300))
        + T("cau", cx - 380, 450, 760, dap, A("fade", t0 + 300, 400))
        + ds.map(([ic, s2, nen], j) => dong(ic, cx - 360, 590 + j * 84, 760, s2, t0 + 600 + j * 200, nen)).join(""); }).join("")
    + T("cam-on", 160, 820, 1600, "Cảm ơn thầy cô và các bạn đã lắng nghe", A("fade", 3000, 500))
    + nguon("Minh hoạ: Illustrations by Storyset (storyset.com) · Biểu tượng: Tabler Icons (giấy phép MIT)."));
}

// =================== CSS ===================
ghi(path.join(D, "style.css"), `section.s{background:${P.nen};color:${P.muc}}
section.s > div, section.s > h1{position:absolute}
[data-t]{text-wrap:pretty}
em{font-style:normal;color:#3E8A2A}
.nut{background:${P.cam};color:${P.muc};font:700 30px/1 'Be Vietnam Pro';padding:18px 32px;border-radius:40px;white-space:nowrap}
.bia-td{position:absolute;font:800 90px/1.1 'Encode Sans';color:${P.muc};text-wrap:balance}
.bia-phu{font:600 40px/1.3 'Be Vietnam Pro';color:${P.phu}}
.mp-so{font:800 110px/1 'Encode Sans';color:${P.muc};text-align:center}
.mp-t{position:absolute;font:800 74px/1.1 'Encode Sans';color:${P.muc};text-wrap:balance}
.td{font:800 72px/1.1 'Encode Sans';color:${P.muc};text-align:center}
.ket{font:600 36px/1.35 'Be Vietnam Pro';color:${P.phu};text-align:center}.ket em{color:#B5650A}
.so-trang{font:600 24px/1 'Be Vietnam Pro';color:${P.phu};text-align:right}
.nguon{font:400 24px/1.4 'Be Vietnam Pro';color:${P.phu}}
.moc{font:700 28px/1.2 'Be Vietnam Pro';color:#B5650A}.moc em{color:#B5650A}
.nhan-dong{font:600 32px/1.3 'Be Vietnam Pro';color:${P.muc};text-align:right}
.so-thanh{font:800 34px/1.2 'Encode Sans';color:${P.muc}}.so-thanh.cam-dam{color:${P.camDam}}.trai{text-align:left !important}
.lich-chu{font:600 28px/1.35 'Be Vietnam Pro';color:${P.muc};text-align:center}.lich-chu em{color:#9A5207}
.cot-ten{font:800 40px/1.2 'Encode Sans';color:${P.muc};text-align:center}
.so-lon{font:800 110px/1.1 'Encode Sans';color:#3E8A2A;text-align:center}.so-lon.cam{color:${P.camDam}}
.cot-mo{font:600 34px/1.3 'Be Vietnam Pro';color:${P.muc};text-align:center}.cot-dk{font:400 32px/1.3 'Be Vietnam Pro';color:${P.phu};text-align:center}
.cl-so{font:800 46px/1.1 'Encode Sans';color:${P.muc};text-align:center}.cl-so.cam-dam{color:${P.camDam}}
.cl-ten{font:600 28px/1.3 'Be Vietnam Pro';color:${P.phu};text-align:center}
.vi-du{font:600 32px/1.3 'Be Vietnam Pro';color:${P.muc}}.vi-du em{color:#B5650A}
.hang-ten{font:800 36px/1.2 'Encode Sans';color:${P.muc};text-align:right}.hang-dk{font:400 28px/1.3 'Be Vietnam Pro';color:${P.phu};text-align:right}
.thanh-chu{font:700 30px/1.3 'Be Vietnam Pro';color:${P.muc};text-align:center}.thanh-chu em{color:${P.camDam}}
.so-tron{font:800 64px/1 'Encode Sans';color:${P.muc};text-align:center}.so-tron.nho{font-size:52px}
.cau{font:800 44px/1.2 'Encode Sans';color:${P.muc};text-align:center}
.gach{font:600 30px/1.35 'Be Vietnam Pro';color:${P.muc}}.gach em{color:#9A5207}.gach.lon{font-size:32px}
.so-bac{font:800 96px/1 'Encode Sans';color:${P.muc};text-align:center}
.buoc-ten{font:800 34px/1.2 'Encode Sans';color:${P.muc};text-align:center}
.buoc-mo{font:400 30px/1.35 'Be Vietnam Pro';color:${P.phu};text-align:center}.buoc-mo em{color:#9A5207}
.nhan-mui{font:700 30px/1.2 'Be Vietnam Pro';color:${P.phu};text-align:center}
.muc-dau{font:800 36px/1.25 'Encode Sans';color:${P.muc}}.muc-dau.nho{font-size:32px}
.trich-lora{font:700 38px/1.5 'Lora';color:${P.muc}}.trich-lora em{color:#3E8A2A}.trich-lora.lon{font-size:46px}
.trich-nguon{font:600 28px/1.35 'Be Vietnam Pro';color:${P.phu}}
.so-cot{font:800 32px/1.1 'Encode Sans';color:${P.muc};text-align:center}
.nam{font:600 28px/1.2 'Be Vietnam Pro';color:${P.phu};text-align:center}.nam.trai{font:800 40px/1.2 'Encode Sans';color:${P.muc}}
.tang{font:800 30px/1.2 'Encode Sans';color:#3E8A2A;text-align:center}.tang.am{color:${P.camDam}}
.moc.xanh{color:#3E8A2A}
.su-kien{font:700 28px/1.2 'Be Vietnam Pro';color:#9A5207;text-align:center}.su-kien-nhan{font:600 28px/1.2 'Be Vietnam Pro';color:${P.phu};text-align:right}
.so-to{font:800 96px/1.1 'Encode Sans';color:${P.muc};text-align:center}.so-to.cam{color:${P.camDam}}.so-to.xanh{color:#3E8A2A}.so-to.lon{font-size:128px}
.so-nhan{font:600 30px/1.3 'Be Vietnam Pro';color:${P.phu};text-align:center}
.dieu{font:400 28px/1.3 'Be Vietnam Pro';color:${P.phu}}
.cam-on{font:800 52px/1.2 'Encode Sans';color:#3E8A2A;text-align:center}
.trai{text-align:left !important}.phai{text-align:right !important}.giua{text-align:center !important}
.bong-noi{font:700 28px/1.3 'Be Vietnam Pro';color:${P.muc};text-align:center}
.canh-bao-chu{font:600 32px/1.35 'Be Vietnam Pro';color:${P.muc}}.canh-bao-chu em{color:#B5650A}
`);
fs.rmSync(path.join(D, "slides"), { recursive: true, force: true });
S2.forEach((h, k) => ghi(path.join(D, "slides", `${String(k + 1).padStart(2, "0")}.html`), h));
console.log(`${S2.length} slide, ${nL} lớp hình`);
