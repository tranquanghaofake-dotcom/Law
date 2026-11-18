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
const em = (s) => esc(s).replace(/\[([^\]]+)\]/g, "<em>$1</em>");
const P = { nen: "#FFFFFF", muc: "#1E2326", phu: "#4A5257", xanh: "#5DA93F", xanhNhat: "#9ED48A", cam: "#F39A1E", camNhat: "#FDE3BC", troi: "#CDEBF5", toa: "#9FD3E6", toa2: "#6FBAD6", may: "#E3F3F9", nuoc: "#4FA6CF" };
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

// ---------- khung slide ----------
const vienNoiDung = () => lop(`<rect x="560" y="0" width="1360" height="10" fill="${P.xanh}"/><rect x="0" y="1070" width="1300" height="10" fill="${P.cam}"/>` + may(150, 130, 1) + may(1720, 110, .7), 0, 0, 1920, 1080, "Hình trang trí", "hoa-tiet");
const dau = (td, ketLuan, so) => `<h1 class="td" data-t data-tieu-de ${A("fade", 0, 500)} style="left:260px;top:70px;width:1400px">${em(td)}</h1>`
  + `<div class="ket" data-t data-l="ket-${so}" data-alt="Ô kết luận" ${A("rise", 300, 500)} style="left:460px;top:168px;width:1000px">${em(ketLuan)}</div>`
  + T("so-trang", 1720, 1004, 120, `${so} / ${TONG}`);
const nguon = (s) => T("nguon", 120, 1004, 1500, s);

// ============ 1 BÌA ============
sec("bia", "Chào thầy cô và các bạn. Nhóm 2 trình bày hai phần: phân tích mẫu hợp đồng bảo hiểm sức khoẻ Bảo Việt An Gia, và thực trạng thị trường bảo hiểm Việt Nam từ 2018 đến 9 tháng năm 2026.",
  lop(may(1300, 120, 1.1) + may(1650, 220, .8) + may(260, 90, .7) + thanhPho(860) + cay(1180, 900, 1.1) + cay(1740, 900, .9), 0, 0, 1920, 1080, "Hình trang trí: mây, dải thành phố xanh nhạt, cỏ", "hoa-tiet")
  + lop(nhaKhien(1470, 900, 1.3), 1180, 470, 580, 440, "Minh hoạ: ngôi nhà mái cam — tài sản, sức khoẻ của gia đình được bảo hiểm che chở", "minh-hoa", A("rise", 400, 700))
  + `<h1 class="bia-td" data-t data-tieu-de ${A("fade", 0, 600)} style="left:114px;top:110px;width:1000px">Hợp đồng bảo hiểm <em>Bảo Việt An Gia</em></h1>`
  + T("bia-phu", 122, 370, 1300, "và thị trường bảo hiểm Việt Nam 2018 – 2026", A("fade", 300, 500))
  + `<div class="nut" data-t data-l="nut-bia" data-alt="Ô nhãn" ${A("rise", 600, 500)} style="left:120px;top:460px">Báo cáo nhóm 2</div>`,
  { ex: "data-hero" });

// ============ 3 MỞ PHẦN I ============
sec("mo-phan", "Phần I. Mẫu hợp đồng Bảo Việt An Gia là hợp đồng bảo hiểm sức khoẻ của Tổng Công ty Bảo hiểm Bảo Việt: 13 điều và Phụ lục 1 bảng quyền lợi. Nhóm đọc sáu nhóm điều khoản.",
  lop(may(1500, 150, 1) + may(300, 260, .7) + thanhPho(860) + cay(380, 900, 1) + cay(1560, 900, 1.1), 0, 0, 1920, 1080, "Hình trang trí: mây, dải thành phố, cỏ", "hoa-tiet")
  + lop(benhVien(1000, 900, 1.15), 760, 500, 480, 400, "Minh hoạ: bệnh viện có dấu chữ thập — đối tượng của bảo hiểm sức khoẻ", "minh-hoa", A("rise", 400, 700))
  + lop(`<circle cx="260" cy="250" r="130" fill="${P.cam}"/>`, 130, 120, 260, 260, "Vòng tròn số phần", "hoa-tiet", A("pop", 0, 500))
  + T("mp-so", 130, 182, 260, "01", A("pop", 100, 500))
  + `<h1 class="mp-t" data-t data-tieu-de ${A("fade", 200, 600)} style="left:460px;top:150px;width:1300px">Hợp đồng <em>Bảo Việt An Gia</em></h1>`
  + `<div class="nut" data-t data-l="nut-mp1" data-alt="Ô nhãn" ${A("rise", 500, 500)} style="left:462px;top:270px">Bảo hiểm sức khoẻ · 13 điều · Phụ lục 1</div>`,
  { trans: "push" });

// ============ 8 THỜI GIAN CHỜ ============
{ const TG = [["Tai nạn", 0], ["Bệnh thông thường, điều trị răng", 30], ["Biến chứng thai sản", 90], ["Bệnh hô hấp, trẻ đến 6 tuổi", 180], ["Bệnh có sẵn, đặc biệt; dây chằng", 365], ["Sinh con (quyền lợi thai sản)", 635]], X = 860, K = 760 / 635;
  sec("noi-dung", "Thời gian chờ là khoảng quyền lợi chưa phát sinh hiệu lực chi trả, để chặn việc mua bảo hiểm khi đã biết trước bệnh. Tai nạn được bảo hiểm ngay; bệnh thông thường chờ 30 ngày; biến chứng thai sản 90; bệnh hô hấp ở trẻ đến 6 tuổi 180; bệnh có sẵn, bệnh đặc biệt, tổn thương dây chằng hay sụn chêm 365. Dài nhất là quyền lợi sinh con: 635 ngày, gần 21 tháng. Tái tục liên tục thì không phải chờ lại.",
    vienNoiDung() + dau("Thời gian [chờ]", "Sinh con phải chờ 635 ngày — gần 21 tháng", 8)
    + lop(`<path d="M${X} 300 V900" stroke="${P.phu}" stroke-width="2"/><path d="M${X + 365 * K} 300 V900" stroke="${P.cam}" stroke-width="3" stroke-dasharray="10 8"/>`, X - 2, 300, Math.round(365 * K) + 6, 600, "Trục 0 ngày và vạch mốc 1 năm", "bieu-do", A("fade", 400, 300))
    + T("moc", X + 365 * K + 14, 296, 160, "1 năm", A("fade", 500, 300))
    + TG.map(([ten, d], k) => { const y = 336 + k * 92, w = Math.round(d * K), t0 = 600 + k * 220, dai = d >= 365;
      return T("nhan-dong", 200, y + 8, 640, ten, A("fade", t0, 300))
        + lop(d ? `<rect x="${X}" y="${y + 8}" width="${w}" height="52" rx="26" fill="${dai ? P.cam : P.xanh}"/>` : `<circle cx="${X + 26}" cy="${y + 34}" r="20" fill="${P.xanh}"/>`, X, y + 8, Math.max(w, 52), 52, `Thanh ${ten}: ${d} ngày`, "bieu-do", A("wipe", t0, 500))
        + T(`so-thanh${dai ? " cam" : ""}`, X + Math.max(w, 52) + 18, y + 12, 520, d ? `${d} ngày` : "0 ngày — chi trả ngay", A("fade", t0 + 300, 300)); }).join("")
    + nguon("Hợp đồng Bảo Việt An Gia, Điều 5. Tái tục liên tục: không phải chờ lại, trừ phần hạn mức nâng thêm."));
}

// ============ 10 CHẤM DỨT ============
{ const C = [["user", "Bên mua chấm dứt", "70%", "phí của thời gian còn lại — chỉ khi chưa có khoản chi trả nào"], ["building", "Bảo Việt chấm dứt", "100%", "phí của thời gian còn lại — dù đã có khiếu nại hay chưa"], ["alert-triangle", "Gian lận, trục lợi", "0 – 70%", "huỷ ngay, mất toàn bộ quyền lợi; hoàn 70% chỉ khi chưa bồi thường"]];
  sec("noi-dung", "Điều 6. Hai bên đều được chấm dứt, nhưng phải báo trước 30 ngày bằng văn bản. Bên mua chấm dứt thì chỉ được hoàn 70 % phí của thời gian còn lại, và chỉ khi chưa có khoản chi trả nào. Bảo Việt chấm dứt thì phải hoàn đủ 100 %. Nếu gian lận, trục lợi, hợp đồng bị huỷ ngay, mất toàn bộ quyền lợi; chỉ hoàn 70 % khi chưa có bồi thường. Câu hỏi mở: mức hoàn 70 % có cân bằng quyền lợi hai bên không.",
    vienNoiDung() + dau("Chấm dứt [hợp đồng]", "Bên mua tự chấm dứt chỉ được hoàn 70% phí còn lại", 10)
    + C.map(([ic, ten, so, mo], k) => { const cx = 400 + k * 560, t0 = 500 + k * 300;
      return lop(`<circle cx="${cx}" cy="380" r="60" fill="${k === 2 ? P.cam : P.xanh}"/>` + mh.iconNet(D, ic, cx, 380, 64, "#FFFFFF", 3), cx - 60, 320, 120, 120, `Biểu tượng ${ten}`, "net", A("pop", t0, 400))
        + T("cot-ten", cx - 240, 466, 480, ten, A("fade", t0 + 100, 400))
        + `<div class="so-o" data-t data-l="so-${k}" data-alt="Ô số" ${A("rise", t0 + 200, 400)} style="left:${cx - 180}px;top:536px;width:360px">${esc(so)}</div>`
        + T("cot-mo", cx - 230, 680, 460, mo, A("fade", t0 + 300, 400)); }).join("")
    + T("chu-thich", 260, 890, 1400, "Cả hai bên phải báo trước 30 ngày bằng văn bản. Phí còn lại tính theo tỷ lệ số ngày còn lại.", A("fade", 1600, 400))
    + nguon("Hợp đồng Bảo Việt An Gia, Điều 6 khoản 1 và khoản 2."));
}

// =================== CSS ===================
ghi(path.join(D, "style.css"), `section.s{background:${P.nen};color:${P.muc}}
section.s > div, section.s > h1{position:absolute}
[data-t]{text-wrap:pretty}
em{font-style:normal;color:#3E8A2A}
.bia-td{position:absolute;font:800 96px/1.08 'Be Vietnam Pro';color:${P.muc};text-wrap:balance}
.bia-phu{font:700 44px/1.25 'Be Vietnam Pro';color:${P.phu}}
.nut{background:${P.cam};color:${P.muc};font:700 30px/1 'Be Vietnam Pro';padding:20px 34px;border-radius:40px;white-space:nowrap}
.mp-so{font:800 120px/1 'Be Vietnam Pro';color:${P.muc};text-align:center}
.mp-t{position:absolute;font:800 84px/1.1 'Be Vietnam Pro';color:${P.muc}}
.td{font:800 64px/1.1 'Be Vietnam Pro';color:${P.muc};text-align:center}
.ket{background:${P.camNhat};border:3px solid ${P.cam};border-radius:40px;padding:16px 30px;font:700 34px/1.3 'Be Vietnam Pro';color:${P.muc};text-align:center}
.so-trang{font:600 24px/1 'Be Vietnam Pro';color:${P.phu};text-align:right}
.nguon{font:400 24px/1.4 'Be Vietnam Pro';color:${P.phu}}
.moc{font:700 28px/1.2 'Be Vietnam Pro';color:#B5650A}
.nhan-dong{font:600 32px/1.3 'Be Vietnam Pro';color:${P.muc};text-align:right}
.so-thanh{font:800 34px/1.2 'Be Vietnam Pro';color:${P.muc}}.so-thanh.cam{color:#B5650A}
.cot-ten{font:800 36px/1.2 'Be Vietnam Pro';color:${P.muc};text-align:center}
.so-o{background:${P.cam};border-radius:60px;font:800 72px/1.6 'Be Vietnam Pro';color:${P.muc};text-align:center}
.cot-mo{font:400 30px/1.4 'Be Vietnam Pro';color:${P.phu};text-align:center}
.chu-thich{font:500 30px/1.4 'Be Vietnam Pro';color:${P.phu};text-align:center}
`);
fs.rmSync(path.join(D, "slides"), { recursive: true, force: true });
S2.forEach((h, k) => ghi(path.join(D, "slides", `${String(k + 1).padStart(2, "0")}.html`), h));
console.log(`${S2.length} slide, ${nL} lớp hình`);
