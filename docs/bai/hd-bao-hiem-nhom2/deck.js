// Deck "Hợp đồng bảo hiểm Bảo Việt An Gia và thị trường" — Nhóm 2. Skill slide-chuan.
// Phong cách: Hào chọn mẫu tham chiếu số 14 (navy + vàng đồng, ảnh thật cắt chéo viền vàng, tiêu đề in hoa đậm) — 18/11/2026.
// Quy tắc (bo-cuc.md mục 7): tiêu đề ngắn một dòng + dòng kết luận nổi bật; hoạ tiết dải vàng chéo lặp ở góc mọi slide; bảng màu hẹp.
// Bản này: 4 slide mẫu cho Hào duyệt (bìa, mở phần, biểu đồ, so sánh ba cột) trước khi dàn cả deck.
//   node deck.js && node ../../../.claude/skills/slide-chuan/scripts/dung.js . --ten=hop-dong-bao-hiem-nhom2
const fs = require("fs"), path = require("path");
const D = __dirname, mh = require("./minh-hoa.js");
const ghi = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
fs.rmSync(path.join(D, "asset", "hinh"), { recursive: true, force: true });
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const em = (s) => esc(s).replace(/\[([^\]]+)\]/g, "<em>$1</em>");
const P = { nen: "#0B2233", sau: "#061826", vua: "#123247", vang: "#C9A04A", vangSang: "#EAD08A", trang: "#FFFFFF", phu: "#B9C6CE", ke: "#3C5566", do: "#E8907F" };
const TONG = 22, S2 = [];
let nL = 0;
const A = (a, at, dur = 500) => `data-a="${a}" data-at="${at}" data-dur="${dur}"`;
const lop = (body, x, y, w, h, alt, loai = "hoa-tiet", ex = "") => { const f = `l${String(++nL).padStart(2, "0")}.svg`;
  ghi(path.join(D, "asset", "hinh", f), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${body}</svg>`);
  return `<img data-l="lop-${nL}" data-loai="${loai}" data-alt="${esc(alt)}" ${ex} src="asset/hinh/${f}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`; };
const T = (cls, x, y, w, s, ex = "") => `<div class="${cls}" data-t ${ex} style="left:${x}px;top:${y}px;width:${w}px">${em(s)}</div>`;
const sec = (mau, notes, inner, { ex = "", trans = "fade" } = {}) => S2.push(`<section class="s" data-mau="${mau}" data-nen="N2" ${ex} data-trans="${trans}" data-dur="600" data-notes="${esc(notes)}">\n${inner}\n</section>`);
// ảnh thật cắt chéo một mép + viền vàng dọc mép cắt (ngôn ngữ hình của mẫu 14)
const anhCheo = (f, x, y, w, h, cheo, mep, alt, t0 = 0) => {   // mep: "trai" (mép chéo bên trái) | "phai"
  const poly = mep === "trai" ? `polygon(${cheo}px 0, 100% 0, 100% 100%, 0 100%)` : `polygon(0 0, 100% 0, ${w - cheo}px 100%, 0 100%)`;
  const ln = mep === "trai" ? `<path d="M${x + cheo + 6} ${y} L${x + 6} ${y + h}" stroke="${P.vang}" stroke-width="8"/><path d="M${x + cheo + 34} ${y} L${x + 34} ${y + h}" stroke="${P.vang}" stroke-width="2" opacity=".7"/>`
    : `<path d="M${x + w - 6} ${y} L${x + w - cheo - 6} ${y + h}" stroke="${P.vang}" stroke-width="8"/><path d="M${x + w - 34} ${y} L${x + w - cheo - 34} ${y + h}" stroke="${P.vang}" stroke-width="2" opacity=".7"/>`;
  return `<img data-l="anh-${f}" data-loai="anh-chup" data-alt="${esc(alt)}" ${A("fade", t0, 800)} src="anh/unsplash/${f}.jpg" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;object-fit:cover;clip-path:${poly}">`
    + lop(ln, Math.max(x - 40, 0), y, Math.min(w + 80, 1920 - Math.max(x - 40, 0)), h, "Viền vàng dọc mép cắt chéo của ảnh", "hoa-tiet", A("wipe", t0 + 500, 600)); };
// hoạ tiết: dải vàng chéo ở góc — lặp mọi slide, đổi góc theo bố cục
const DAI = {
  traiTren: () => lop(`<path d="M0 230 L230 0 H300 L0 300 Z" fill="${P.vang}"/><path d="M0 330 L330 0" stroke="${P.vangSang}" stroke-width="3"/><path d="M0 372 L372 0" stroke="${P.vang}" stroke-width="2" opacity=".6"/>`, 0, 0, 380, 380, "Hình trang trí", "hoa-tiet"),
  phaiTren: () => lop(`<path d="M1920 230 L1690 0 H1620 L1920 300 Z" fill="${P.vang}"/><path d="M1920 330 L1590 0" stroke="${P.vangSang}" stroke-width="3"/><path d="M1920 372 L1548 0" stroke="${P.vang}" stroke-width="2" opacity=".6"/>`, 1540, 0, 380, 380, "Hình trang trí", "hoa-tiet"),
  traiDuoi: () => lop(`<path d="M0 850 L230 1080 H300 L0 780 Z" fill="${P.vang}"/><path d="M0 750 L330 1080" stroke="${P.vangSang}" stroke-width="3"/><path d="M0 708 L372 1080" stroke="${P.vang}" stroke-width="2" opacity=".6"/>`, 0, 700, 380, 380, "Hình trang trí", "hoa-tiet"),
};
// đầu slide nội dung: tiêu đề in hoa căn giữa + dòng kết luận nổi bật (Lora, vàng sáng)
const dau = (td, ketLuan, so) => `<h1 class="td" data-t data-tieu-de ${A("fade", 0, 500)} style="left:260px;top:96px;width:1400px">${esc(td)}</h1>`
  + `<div class="ket" data-t ${A("fade", 300, 500)} style="left:260px;top:196px;width:1400px">${em(ketLuan)}</div>`
  + T("so-trang", 1720, 1000, 120, `${so} / ${TONG}`);
const nguon = (s) => T("nguon", 120, 1004, 1500, s);

// ============ 1 BÌA ============
sec("bia", "Chào thầy cô và các bạn. Nhóm 2 trình bày hai phần: phân tích mẫu hợp đồng bảo hiểm sức khoẻ Bảo Việt An Gia, và thực trạng thị trường bảo hiểm Việt Nam từ 2018 đến 9 tháng năm 2026.",
  anhCheo("bia", 820, 0, 1100, 1080, 260, "trai", "Ảnh: bàn tay ký vào hợp đồng trên bàn gỗ — giao kết hợp đồng bảo hiểm")
  + DAI.traiDuoi()
  + T("nhan", 120, 250, 660, "Báo cáo nhóm 2", A("fade", 200, 400))
  + `<h1 class="bia-td" data-t data-tieu-de ${A("rise", 300, 700)} style="left:120px;top:310px;width:760px">Hợp đồng bảo hiểm Bảo Việt An Gia <span class="vang">và thị trường Việt Nam</span></h1>`
  + `<div class="gach" data-l="gach-bia" data-alt="Gạch vàng" style="left:120px;top:700px;width:180px;height:4px"></div>`
  + T("bia-m", 120, 736, 640, "Đọc một hợp đồng bảo hiểm sức khoẻ thật · Số liệu thị trường 2018 – 9 tháng 2026", A("fade", 900, 500)),
  { ex: "data-hero" });

// ============ 3 MỞ PHẦN I ============
sec("mo-phan", "Phần I. Mẫu hợp đồng Bảo Việt An Gia là hợp đồng bảo hiểm sức khoẻ của Tổng Công ty Bảo hiểm Bảo Việt: 13 điều và Phụ lục 1 bảng quyền lợi. Nhóm đọc sáu nhóm điều khoản.",
  anhCheo("benh-vien", 0, 0, 860, 1080, 220, "phai", "Ảnh: thiết bị y tế cạnh giường bệnh — đối tượng của bảo hiểm sức khoẻ")
  + DAI.phaiTren()
  + T("mp-so", 952, 170, 400, "01", A("fade", 300, 500))
  + `<h1 class="mp-t" data-t data-tieu-de ${A("rise", 400, 600)} style="left:960px;top:420px;width:840px">Hợp đồng Bảo Việt An Gia</h1>`
  + T("mp-m", 962, 610, 820, "Hợp đồng bảo hiểm sức khoẻ: 13 điều và Phụ lục 1 (bảng quyền lợi).", A("fade", 700, 500))
  + [["Cấu trúc", "Điều 12"], ["Các bên", "Điều 1, 2, 8"], ["Quyền lợi", "Phụ lục 1"], ["Thời gian chờ", "Điều 5"], ["Chấm dứt", "Điều 6"], ["Chi trả", "Điều 10"]].map(([a, b], k) => { const x = 962 + (k % 2) * 420, y = 760 + Math.floor(k / 2) * 92, t0 = 900 + k * 120;
    return `<div class="muc" data-t ${A("fade", t0, 300)} style="left:${x}px;top:${y}px;width:400px"><b>${esc(a)}</b> <span>${esc(b)}</span></div>`; }).join(""),
  { trans: "push" });

// ============ 8 THỜI GIAN CHỜ ============
{ const TG = [["Tai nạn", 0], ["Bệnh thông thường, điều trị răng", 30], ["Biến chứng thai sản", 90], ["Bệnh hô hấp, trẻ đến 6 tuổi", 180], ["Bệnh có sẵn, đặc biệt; dây chằng", 365], ["Sinh con (quyền lợi thai sản)", 635]], X = 860, K = 760 / 635;
  sec("noi-dung", "Thời gian chờ là khoảng quyền lợi chưa phát sinh hiệu lực chi trả, để chặn việc mua bảo hiểm khi đã biết trước bệnh. Tai nạn được bảo hiểm ngay; bệnh thông thường chờ 30 ngày; biến chứng thai sản 90; bệnh hô hấp ở trẻ đến 6 tuổi 180; bệnh có sẵn, bệnh đặc biệt, tổn thương dây chằng hay sụn chêm 365. Dài nhất là quyền lợi sinh con: 635 ngày, gần 21 tháng. Tái tục liên tục thì không phải chờ lại.",
    DAI.traiTren() + dau("Thời gian chờ", "Tai nạn được chi trả ngay; [sinh con phải chờ 635 ngày] — gần 21 tháng", 8)
    + lop(`<path d="M${X} 330 V930" stroke="${P.phu}" stroke-width="2"/><path d="M${X + 365 * K} 330 V930" stroke="${P.vangSang}" stroke-width="2" stroke-dasharray="10 8"/>`, X - 2, 330, Math.round(365 * K) + 6, 600, "Trục 0 ngày và vạch mốc 1 năm", "bieu-do", A("fade", 400, 300))
    + T("moc", X + 365 * K + 14, 326, 160, "1 năm", A("fade", 500, 300))
    + TG.map(([ten, d], k) => { const y = 370 + k * 92, w = Math.round(d * K), t0 = 600 + k * 220, dai = d >= 365;
      return T("nhan-dong", 260, y + 8, 580, ten, A("fade", t0, 300))
        + lop(d ? `<rect x="${X}" y="${y + 10}" width="${w}" height="48" fill="${dai ? P.vang : P.ke}"/>` : `<circle cx="${X + 24}" cy="${y + 34}" r="16" fill="${P.vangSang}"/>`, X, y + 10, Math.max(w, 48), 48, `Thanh ${ten}: ${d} ngày`, "bieu-do", A("wipe", t0, 500))
        + T(`so-thanh${dai ? " vang" : ""}`, X + Math.max(w, 48) + 18, y + 12, 360, d ? `${d} ngày` : "0 ngày — chi trả ngay", A("fade", t0 + 300, 300)); }).join("")
    + nguon("Hợp đồng Bảo Việt An Gia, Điều 5. Tái tục liên tục: không phải chờ lại, trừ phần hạn mức nâng thêm."));
}

// ============ 10 CHẤM DỨT ============
{ const C = [["user", "Bên mua chấm dứt", "70%", "phí của thời gian còn lại — chỉ khi chưa có khoản chi trả nào"], ["building", "Bảo Việt chấm dứt", "100%", "phí của thời gian còn lại — dù đã có khiếu nại hay chưa"], ["alert-triangle", "Gian lận, trục lợi", "0 – 70%", "huỷ ngay, mất toàn bộ quyền lợi; hoàn 70% chỉ khi chưa bồi thường"]];
  sec("noi-dung", "Điều 6. Hai bên đều được chấm dứt, nhưng phải báo trước 30 ngày bằng văn bản. Bên mua chấm dứt thì chỉ được hoàn 70 % phí của thời gian còn lại, và chỉ khi chưa có khoản chi trả nào. Bảo Việt chấm dứt thì phải hoàn đủ 100 %. Nếu gian lận, trục lợi, hợp đồng bị huỷ ngay, mất toàn bộ quyền lợi; chỉ hoàn 70 % khi chưa có bồi thường. Câu hỏi mở: mức hoàn 70 % có cân bằng quyền lợi hai bên không.",
    DAI.phaiTren() + dau("Chấm dứt hợp đồng", "Bên mua tự chấm dứt chỉ được hoàn [70% phí còn lại]; Bảo Việt phải hoàn đủ", 10)
    + C.map(([ic, ten, so, mo], k) => { const cx = 400 + k * 560, t0 = 500 + k * 300;
      return lop(mh.iconNet(D, ic, cx, 400, 84, P.vang, 3), cx - 50, 350, 100, 100, `Biểu tượng ${ten}`, "net", A("fade", t0, 400))
        + T("cot-ten", cx - 240, 470, 480, ten, A("fade", t0 + 100, 400)) + T("cot-so", cx - 240, 530, 480, so, `data-dl ${A("rise", t0 + 200, 400)}`)
        + `<div class="gach" data-l="g${k}" data-alt="Gạch vàng" style="left:${cx - 40}px;top:676px;width:80px;height:3px"></div>`
        + T("cot-mo", cx - 220, 706, 440, mo, A("fade", t0 + 300, 400)); }).join("")
    + T("chu-thich", 260, 900, 1400, "Cả hai bên phải báo trước 30 ngày bằng văn bản. Phí còn lại tính theo tỷ lệ số ngày còn lại.", A("fade", 1600, 400))
    + nguon("Hợp đồng Bảo Việt An Gia, Điều 6 khoản 1 và khoản 2."));
}

// =================== CSS ===================
ghi(path.join(D, "style.css"), `section.s{background:${P.nen};color:${P.trang}}
section.s > div, section.s > h1{position:absolute}
[data-t]{text-wrap:pretty}
em{font-style:normal;color:${P.vangSang}}
.gach{background:${P.vang}}
.nhan{font:700 28px/1.2 'Be Vietnam Pro';color:${P.vangSang};letter-spacing:.12em;text-transform:uppercase}
.bia-td{position:absolute;font:800 76px/1.08 'Be Vietnam Pro';color:${P.trang};text-transform:uppercase;text-wrap:balance}.bia-td .vang{color:${P.vangSang}}
.bia-m{font:400 32px/1.45 'Lora';color:${P.phu}}
.mp-so{font:700 220px/1 'Lora';color:${P.vang}}
.mp-t{position:absolute;font:800 64px/1.1 'Be Vietnam Pro';color:${P.trang};text-transform:uppercase}
.mp-m{font:400 32px/1.45 'Lora';color:${P.phu}}
.muc{font:400 30px/1.3 'Be Vietnam Pro';color:${P.trang};border-left:4px solid ${P.vang};padding-left:18px}.muc span{color:${P.phu}}
.td{font:800 56px/1.1 'Be Vietnam Pro';color:${P.trang};text-transform:uppercase;text-align:center;letter-spacing:.02em}
.ket{font:400 38px/1.35 'Lora';color:${P.phu};text-align:center}
.so-trang{font:600 24px/1 'Be Vietnam Pro';color:${P.phu};text-align:right}
.nguon{font:400 24px/1.4 'Be Vietnam Pro';color:${P.phu}}
.moc{font:600 28px/1.2 'Be Vietnam Pro';color:${P.vangSang}}
.nhan-dong{font:500 32px/1.3 'Be Vietnam Pro';color:${P.trang};text-align:right}
.so-thanh{font:700 34px/1.2 'Lora';color:${P.trang}}.so-thanh.vang{color:${P.vangSang}}
.cot-ten{font:800 32px/1.2 'Be Vietnam Pro';color:${P.trang};text-transform:uppercase;text-align:center;letter-spacing:.04em}
.cot-so{font:700 110px/1.1 'Lora';color:${P.vangSang};text-align:center}
.cot-mo{font:400 30px/1.4 'Be Vietnam Pro';color:${P.phu};text-align:center}
.chu-thich{font:400 30px/1.4 'Lora';color:${P.phu};text-align:center;font-style:italic}
`);
fs.rmSync(path.join(D, "slides"), { recursive: true, force: true });
S2.forEach((h, k) => ghi(path.join(D, "slides", `${String(k + 1).padStart(2, "0")}.html`), h));
console.log(`${S2.length} slide, ${nL} lớp hình`);
