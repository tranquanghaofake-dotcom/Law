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
const vien = (k = 0, day = true) => lop(`<rect x="${k % 2 ? 120 : 760}" y="48" width="1040" height="13" rx="6.5" fill="${P.xanhNhat}"/>` + (day ? `<rect x="${k % 2 ? 760 : 120}" y="1020" width="1040" height="13" rx="6.5" fill="${P.cam}"/>` : "")
  + may(k % 2 ? 1700 : 130, 140, 1.3) + may(k % 2 ? 90 : 1740, day ? 930 : 560, 1.1), 0, 0, 1920, 1080, "Hình trang trí", "hoa-tiet");
// dải đáy chữ ký của mẫu 2: phố xanh nhạt + sông + cỏ (bìa, mở phần)
const nenDay = () => { const toas = [[0, 110, 150], [120, 90, 110], [220, 120, 190], [350, 90, 130], [450, 140, 210], [600, 100, 150], [710, 120, 180], [840, 90, 120], [940, 130, 200], [1080, 100, 150], [1190, 120, 190], [1320, 90, 130], [1420, 140, 220], [1570, 100, 160], [1680, 120, 190], [1810, 110, 150]];
  return lop(toas.map(([x, w, h], k) => toaNha(x, w, h, k % 3 === 1 ? P.pho2 : P.pho, 936)).join("") + `<rect x="0" y="936" width="1920" height="18" fill="${P.nuoc}"/><rect x="0" y="954" width="1920" height="126" fill="${P.co}"/>`, 0, 700, 1920, 380, "Hình trang trí: dải phố, sông, cỏ", "hoa-tiet"); };
// minh hoạ Storyset (kiểu Rafiki, màu nhấn xanh lá) — anh/storyset/, ghi công ở slide cuối và ghi-cong.md
const minhHoa = (f, x, y, w, alt, t0 = 300) => `<img data-l="mh-${f}" data-loai="minh-hoa" data-alt="${esc(alt)}" ${A("fade", t0, 700)} src="anh/storyset/${f}.svg" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${w}px">`;
// icon trong tròn cam, nét đậm màu mực (kiểu icon hai tông của mẫu 2)
const iconTron = (ic, cx, cy, r, alt, ex = "", nen = P.cam) => lop(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${nen}"/>` + mh.iconNet(D, ic, cx, cy, r * 1.05, P.muc, 3.2), cx - r, cy - r, 2 * r, 2 * r, alt, "net", ex);
const dau = (td, ketLuan, so) => `<h1 class="td" data-t data-tieu-de ${A("fade", 0, 500)} style="left:260px;top:76px;width:1400px">${em(td)}</h1>`
  + `<div class="ket" data-t ${A("fade", 300, 500)} style="left:260px;top:178px;width:1400px">${em(ketLuan)}</div>`
  + T("so-trang", 1720, 962, 120, `${so} / ${TONG}`);
const nguon = (s) => T("nguon", 120, 962, 1500, s);

// ============ 1 BÌA ============
sec("bia", "Chào thầy cô và các bạn. Nhóm 2 trình bày hai phần: phân tích mẫu hợp đồng bảo hiểm sức khoẻ Bảo Việt An Gia, và thực trạng thị trường bảo hiểm Việt Nam từ 2018 đến 9 tháng năm 2026.",
  vien(0, false) + nenDay() + minhHoa("insurance-rafiki", 1080, 330, 720, "Minh hoạ: nhân viên bảo hiểm che ô cho khách hàng cầm trái tim có chữ thập — bảo hiểm sức khoẻ")
  + `<h1 class="bia-td" data-t data-tieu-de ${A("fade", 0, 600)} style="left:116px;top:200px;width:940px">Hợp đồng bảo hiểm<br><em>Bảo Việt An Gia</em></h1>`
  + T("bia-phu", 120, 420, 940, "và thị trường bảo hiểm Việt Nam, 2018 – 2026", A("fade", 300, 500))
  + `<div class="nut" data-t data-l="nut-bia" data-alt="Ô nhãn" ${A("fade", 500, 500)} style="left:120px;top:510px">Báo cáo nhóm 2</div>`,
  { ex: "data-hero" });

// ============ 3 MỞ PHẦN I ============
sec("mo-phan", "Phần I. Mẫu hợp đồng Bảo Việt An Gia là hợp đồng bảo hiểm sức khoẻ của Tổng Công ty Bảo hiểm Bảo Việt: 13 điều và Phụ lục 1 bảng quyền lợi. Nhóm đọc sáu nhóm điều khoản.",
  vien(1, false) + nenDay() + minhHoa("hospital-patient-rafiki", 1040, 330, 740, "Minh hoạ: bệnh nhân điều trị trên giường bệnh — đối tượng của bảo hiểm sức khoẻ")
  + lop(`<circle cx="270" cy="250" r="110" fill="${P.cam}"/>`, 160, 140, 220, 220, "Vòng tròn số phần", "hoa-tiet", A("pop", 0, 500))
  + T("mp-so", 160, 196, 220, "01", A("pop", 100, 500))
  + `<h1 class="mp-t" data-t data-tieu-de ${A("fade", 200, 600)} style="left:416px;top:150px;width:680px">Hợp đồng<br><em>Bảo Việt An Gia</em></h1>`
  + `<div class="nut" data-t data-l="nut-mp1" data-alt="Ô nhãn" ${A("fade", 500, 500)} style="left:420px;top:380px">Bảo hiểm sức khoẻ · 13 điều · Phụ lục 1</div>`,
  { trans: "push" });

// ============ 8 THỜI GIAN CHỜ — icon từng nhóm, biểu đồ kể chuyện, minh hoạ góc, lịch 21 tháng ============
{ const TG = [["car-crash", "Tai nạn", 0], ["dental", "Bệnh thường, điều trị răng", 30], ["woman", "Biến chứng thai sản", 90], ["lungs", "Hô hấp, trẻ đến 6 tuổi", 180], ["first-aid-kit", "Bệnh có sẵn, đặc biệt", 365], ["baby-carriage", "Sinh con (thai sản)", 635]], X = 620, BW = 520, K = BW / 635;
  sec("noi-dung", "Thời gian chờ là khoảng quyền lợi chưa phát sinh hiệu lực chi trả, để chặn việc mua bảo hiểm khi đã biết trước bệnh. Tai nạn được bảo hiểm ngay; bệnh thông thường chờ 30 ngày; biến chứng thai sản 90; bệnh hô hấp ở trẻ đến 6 tuổi 180; bệnh có sẵn, bệnh đặc biệt, tổn thương dây chằng hay sụn chêm 365. Dài nhất là quyền lợi sinh con: 635 ngày, gần 21 tháng — muốn dùng phải mua trước khi có kế hoạch sinh con. Tái tục liên tục thì không phải chờ lại.",
    vien(1) + dau("Thời gian [chờ]", "Tai nạn được chi trả ngay; sinh con phải chờ [635 ngày]", 8)
    + lop(`<path d="M${X + 365 * K} 290 V900" stroke="${P.cam}" stroke-width="3" stroke-dasharray="10 8"/>`, X + Math.round(365 * K) - 3, 290, 6, 610, "Vạch mốc 1 năm", "bieu-do", A("fade", 400, 300))
    + T("moc", X + 365 * K - 90, 280, 180, "mốc 1 năm", A("fade", 500, 300), ) 
    + TG.map(([ic, ten, d], k) => { const y = 330 + k * 96, w = Math.round(d * K), t0 = 600 + k * 220, dai = d >= 365, chinh = d === 635;
      return iconTron(ic, 150, y + 34, 32, `Biểu tượng ${ten}`, A("pop", t0, 300), dai ? P.camNhat : "#DDEFD5")
        + T("nhan-dong trai", 196, y + 10, 410, ten, A("fade", t0, 300))
        + lop(`<rect x="${X}" y="${y + 10}" width="${BW}" height="48" rx="24" fill="${P.ray}"/>` + (d ? `<rect x="${X}" y="${y + 10}" width="${Math.max(w, 48)}" height="48" rx="24" fill="${chinh ? P.cam : dai ? "#F7C27A" : P.xanh}"/>` : `<circle cx="${X + 24}" cy="${y + 34}" r="18" fill="${P.xanh}"/>`), X, y + 10, BW, 48, `Thanh ${ten}: ${d} ngày`, "bieu-do", A("wipe", t0, 500))
        + T(`so-thanh${chinh ? " cam-dam" : ""}`, X + BW + 18, y + 12, 200, d ? `${d} ngày` : "0 ngày", A("fade", t0 + 300, 300)); }).join("")
    + minhHoa("waiting-rafiki", 1440, 250, 380, "Minh hoạ: người xem đồng hồ đứng chờ trước cửa — thời gian chờ", 1800)
    // 635 ngày ≈ 21 tháng: 21 ô tháng, 12 ô đầu = 1 năm
    + lop(Array.from({ length: 21 }, (_, i) => `<rect x="${1460 + (i % 7) * 50}" y="${650 + Math.floor(i / 7) * 50}" width="40" height="40" rx="8" fill="${i < 12 ? "#F7C27A" : P.cam}"/>`).join(""), 1460, 650, 340, 140, "Lịch 21 ô tháng: 635 ngày gần bằng 21 tháng", "bieu-do", A("fade", 2200, 600))
    + T("lich-chu", 1400, 810, 460, "635 ngày ≈ [21 tháng] — phải mua trước khi có kế hoạch sinh con", A("fade", 2400, 400))
    + nguon("Hợp đồng Bảo Việt An Gia, Điều 5. Tái tục liên tục: không phải chờ lại, trừ phần hạn mức nâng thêm."));
}

// ============ 10 CHẤM DỨT — hai cột đối xứng + dải cảnh báo ============
{ const C = [["user", "Bên mua chấm dứt", "70%", "phí của thời gian còn lại", "chỉ khi chưa có khoản chi trả nào"], ["building", "Bảo Việt chấm dứt", "100%", "phí của thời gian còn lại", "dù đã có khiếu nại hay chưa"]];
  sec("noi-dung", "Điều 6. Hai bên đều được chấm dứt, nhưng phải báo trước 30 ngày bằng văn bản. Bên mua chấm dứt thì chỉ được hoàn 70 % phí của thời gian còn lại, và chỉ khi chưa có khoản chi trả nào. Bảo Việt chấm dứt thì phải hoàn đủ 100 %. Riêng trường hợp gian lận, trục lợi thì không phải chấm dứt mà là huỷ bỏ: hợp đồng bị huỷ ngay, mất toàn bộ quyền lợi. Câu hỏi mở: mức hoàn 70 % có cân bằng quyền lợi hai bên không.",
    vien(1) + dau("Chấm dứt [hợp đồng]", "Tự chấm dứt hợp đồng, bên mua mất [30%] phí của thời gian còn lại", 10)
    + C.map(([ic, ten, so, mo, dk], k) => { const cx = 600 + k * 720, t0 = 500 + k * 300;
      return iconTron(ic, cx, 360, 64, `Biểu tượng ${ten}`, A("pop", t0, 400))
        + T("cot-ten", cx - 300, 448, 600, ten, A("fade", t0 + 100, 400))
        + T(`so-lon${k ? "" : " cam"}`, cx - 300, 500, 600, so, `data-dl ${A("fade", t0 + 200, 400)}`)
        + T("cot-mo", cx - 300, 632, 600, mo, A("fade", t0 + 300, 400)) + T("cot-dk", cx - 300, 680, 600, dk, A("fade", t0 + 350, 400)); }).join("")
    + lop(`<path d="M960 340 V720" stroke="${P.may}" stroke-width="4" stroke-linecap="round"/>`, 956, 340, 8, 380, "Vạch chia hai cột", "hoa-tiet")
    + `<div class="canh-bao" data-l="canh-bao" data-alt="Dải cảnh báo" ${A("rise", 1300, 500)} style="left:260px;top:780px;width:1400px;height:120px"></div>`
    + iconTron("alert-triangle", 340, 840, 40, "Biểu tượng cảnh báo", A("pop", 1400, 400), "#FFFFFF")
    + T("canh-bao-chu", 410, 802, 1220, "Gian lận, trục lợi: hợp đồng bị [huỷ ngay], mất toàn bộ quyền lợi — chỉ hoàn 70% phí nếu chưa có bồi thường", A("fade", 1500, 400))
    + nguon("Hợp đồng Bảo Việt An Gia, Điều 6 khoản 1 (chấm dứt) và khoản 2 (huỷ bỏ do gian lận, trục lợi)."));
}

// =================== CSS ===================
ghi(path.join(D, "style.css"), `section.s{background:${P.nen};color:${P.muc}}
section.s > div, section.s > h1{position:absolute}
[data-t]{text-wrap:pretty}
em{font-style:normal;color:#3E8A2A}
.nut{background:${P.cam};color:${P.muc};font:700 30px/1 'Be Vietnam Pro';padding:18px 32px;border-radius:40px;white-space:nowrap}
.bia-td{position:absolute;font:800 90px/1.1 'Be Vietnam Pro';color:${P.muc};text-wrap:balance}
.bia-phu{font:600 40px/1.3 'Be Vietnam Pro';color:${P.phu}}
.mp-so{font:800 110px/1 'Be Vietnam Pro';color:${P.muc};text-align:center}
.mp-t{position:absolute;font:800 74px/1.1 'Be Vietnam Pro';color:${P.muc};text-wrap:balance}
.td{font:800 72px/1.1 'Be Vietnam Pro';color:${P.muc};text-align:center}
.ket{font:600 36px/1.35 'Be Vietnam Pro';color:${P.phu};text-align:center}.ket em{color:#B5650A}
.so-trang{font:600 24px/1 'Be Vietnam Pro';color:${P.phu};text-align:right}
.nguon{font:400 24px/1.4 'Be Vietnam Pro';color:${P.phu}}
.moc{font:700 28px/1.2 'Be Vietnam Pro';color:#B5650A}
.nhan-dong{font:600 32px/1.3 'Be Vietnam Pro';color:${P.muc};text-align:right}
.so-thanh{font:800 34px/1.2 'Be Vietnam Pro';color:${P.muc}}.so-thanh.cam-dam{color:${P.camDam}}.trai{text-align:left !important}
.lich-chu{font:600 28px/1.35 'Be Vietnam Pro';color:${P.muc};text-align:center}.lich-chu em{color:#9A5207}
.cot-ten{font:800 40px/1.2 'Be Vietnam Pro';color:${P.muc};text-align:center}
.so-lon{font:800 110px/1.1 'Be Vietnam Pro';color:#3E8A2A;text-align:center}.so-lon.cam{color:${P.camDam}}
.cot-mo{font:600 34px/1.3 'Be Vietnam Pro';color:${P.muc};text-align:center}.cot-dk{font:400 32px/1.3 'Be Vietnam Pro';color:${P.phu};text-align:center}
.canh-bao{background:${P.camNhat};border:3px solid ${P.cam};border-radius:60px}
.canh-bao-chu{font:600 32px/1.35 'Be Vietnam Pro';color:${P.muc}}.canh-bao-chu em{color:#B5650A}
`);
fs.rmSync(path.join(D, "slides"), { recursive: true, force: true });
S2.forEach((h, k) => ghi(path.join(D, "slides", `${String(k + 1).padStart(2, "0")}.html`), h));
console.log(`${S2.length} slide, ${nL} lớp hình`);
