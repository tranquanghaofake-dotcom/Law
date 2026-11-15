// Deck Chương 3 — hướng "BIÊN TẬP HỌC THUẬT" (skill slide-chuan, references/bo-cuc.md):
//   MỘT ngôn ngữ hình ảnh = ảnh tư liệu hai màu + sơ đồ nét / icon nét cùng độ dày + chữ Lora lớn + bảng kẻ ngang.
//   Không nhân vật hoạt hình, không đồ vật vẽ phẳng, không hoạ tiết, không bóng, không bo góc màu mè.
//   5 bố cục mẫu (bia, mo-phan, cau, noi-dung, hoi) — mỗi <section> khai data-mau; thẻ phong cách: thiet-ke/phong-cach.json.
// Nội dung: kich-ban.md + noi-dung.md (đã đối chiếu luật). Ghi chú người nói: notes-cu.json (đánh số theo slide cũ).
//   node deck.js && node ../../../.claude/skills/slide-chuan/scripts/dung.js . --ten=bao-hiem-thuong-mai
const fs = require("fs"), path = require("path");
const D = __dirname, N = require("./notes-cu.json");
const SUA = { 22: "Định nghĩa theo Điều 4 Luật 2022: khoản 24 bên mua bảo hiểm, khoản 25 người được bảo hiểm, khoản 26 người thụ hưởng. Bên mua và người được bảo hiểm có thể là hai người: bố mẹ (bên mua) mua bảo hiểm nhân thọ cho con (người được bảo hiểm). Tự mua cho mình thì một người giữ cả hai vai. Ví dụ do người soạn thêm.",
  26: "p = f + d theo bài giảng. Định nghĩa phí bảo hiểm theo khoản 28 Điều 4 Luật 2022.",
  37: "Con số 70 %, 85 %, phí 100 / bồi thường 80 chỉ minh hoạ (người soạn thêm). Thanh tính trên phí cả kỳ = 100 %; giới hạn trách nhiệm của DN nhận tái tới 85 %, phần trên 85 % trở lại DN nhượng. Bài giảng: công ty nhượng tái chịu bồi thường khi tỷ lệ bồi thường của toàn bộ nghiệp vụ nhỏ hơn hoặc bằng tỷ lệ nhất định; phần tỷ lệ thực tế vượt tỷ lệ giữ lại chuyển cho công ty nhận tái." };
const nc = (k) => SUA[k] || N[k] || "";
const ghi = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
fs.rmSync(path.join(D, "asset", "hinh"), { recursive: true, force: true });   // sơ đồ nét sinh lại mỗi lần dựng

// ---------- bảng màu (đúng thiet-ke/phong-cach.json) + một độ dày nét ----------
const M = { giay: "#F3EEE4", muc: "#1C2826", phu: "#5B6663", ke: "#CFC6B6", xanh: "#0E4F49", xanhNhat: "#DCE7E3", xanhMo: "#BFD3CE", vang: "#8E631A", vangSang: "#E6B85C", do: "#A3362B" };
const NET = 3;

// ---------- khối chữ ----------
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const em = (s) => esc(s).replace(/\[([^\]]+)\]/g, "<em>$1</em>").replace(/\{([^}]+)\}/g, '<em class="v">$1</em>');
const t = (cls, x, y, w, s, ex = "") => `<div class="${cls}" data-t ${ex} style="left:${x}px;top:${y}px;width:${w}px">${em(s)}</div>`;
const cap = (kt, km, x, y, w, a, b) => `<div class="cap" style="left:${x}px;top:${y}px;width:${w}px"><b data-t class="${kt}">${em(a)}</b><span data-t class="${km}">${em(b)}</span></div>`;
const vach = (x, y, w) => `<div class="vach" style="left:${x}px;top:${y}px;width:${w}px"></div>`;
const khoi = (cls, x, y, w, h, s = "") => `<div class="${cls}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px${s}"></div>`;

// ---------- hình nét: icon Tabler (asset/tabler, MIT) chỉnh nét bằng NET ở mọi cỡ; mỗi sơ đồ là MỘT file SVG đúng khung của nó ----------
const iconBody = (ten) => fs.readFileSync(path.join(D, "asset", "tabler", ten + ".svg"), "utf8").replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/<path stroke="none" d="M0 0h24v24H0z" fill="none"\s*\/>/, "");
const gIcon = (ten, cx, cy, co, mau, net = NET) => `<g transform="translate(${cx - co / 2} ${cy - co / 2}) scale(${co / 24})" fill="none" stroke="${mau}" stroke-width="${((net * 24) / co).toFixed(3)}" stroke-linecap="round" stroke-linejoin="round">${iconBody(ten)}</g>`;
let nH = 0;
const hinh = (body, x, y, w, h, alt, ex = "") => { const f = `h${String(++nH).padStart(2, "0")}.svg`;
  ghi(path.join(D, "asset", "hinh", f), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${body}</svg>`);
  return `<img data-l="hinh-${nH}" data-loai="net" data-alt="${esc(alt)}" ${ex} src="asset/hinh/${f}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`; };
const R1 = 130, R2 = 90; // nút sơ đồ chỉ hai cỡ: chính / phụ
const nut = (cx, cy, r, ten, { mau = M.xanh, nen = M.giay, co = r * 1.3 } = {}) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${nen}" stroke="${mau}" stroke-width="${NET}"/>${gIcon(ten, cx, cy, co, mau)}`;
const mui = (x1, y1, x2, y2, { mau = M.xanh, dut = false, dau = 18 } = {}) => { const g = Math.atan2(y2 - y1, x2 - x1), a = (s) => [x2 - dau * Math.cos(g + s), y2 - dau * Math.sin(g + s)], [p, q] = [a(0.5), a(-0.5)];
  return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${mau}" stroke-width="${NET}" fill="none" stroke-linecap="round" ${dut ? 'stroke-dasharray="14 10"' : ""}/><path d="M${p[0].toFixed(1)} ${p[1].toFixed(1)} L${x2} ${y2} L${q[0].toFixed(1)} ${q[1].toFixed(1)}" stroke="${mau}" stroke-width="${NET}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; };
const duong = (d, mau = M.ke, net = NET, dut = false) => `<path d="${d}" stroke="${mau}" stroke-width="${net}" fill="none" stroke-linecap="round" ${dut ? 'stroke-dasharray="10 9"' : ""}/>`;
const ic = (ten, x, y, co, mau = M.xanh) => hinh(gIcon(ten, x + co / 2, y + co / 2, co * 0.92, mau), x, y, co, co, `Biểu tượng ${ten}`, "data-lap");
// ảnh tư liệu hai màu (anh/*.jpg, scripts/hai_mau.js) + chú thích nguồn trên dải màu chủ
const anh = (f, x, y, w, h, alt, cap, ex = "") => `<img data-l="anh-${f}" data-loai="anh-hai-mau" data-nen-anh data-alt="${esc(alt)}" ${ex} src="anh/${f}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`
  + (cap ? `<div class="chu-anh" data-t style="left:${x + 40}px;bottom:${1080 - y - h + 40}px;max-width:${w - 80}px">${esc(cap)}</div>` : "");
const tb = (bt, cols, rows, x, y, w, ex = "", lopHang = []) => `<div class="tb ${bt}" data-bang="T2" ${ex} style="left:${x}px;top:${y}px;width:${w}px"><div class="tb-h">${cols.map((c) => `<b data-t>${esc(c)}</b>`).join("")}</div>${rows.map((rw, k) => `<div class="tb-r ${lopHang[k] || ""}">${rw.map((c) => { const [cls, txt] = Array.isArray(c) ? c : ["", c]; return `<b data-t class="${cls}">${esc(txt)}</b>`; }).join("")}</div>`).join("")}</div>`;

// =================== 5 BỐ CỤC MẪU ===================
const S = [];
const sec = (mau, nen, notes, inner, ex = "") => S.push(`<section class="s${nen === "dam" ? " dam" : ""}" data-mau="${mau}" data-nen="${nen}" ${ex} data-trans="fade" data-notes="${esc(notes)}">\n${inner}\n</section>`);
// bìa / kết: chữ nửa trái trên giấy, ảnh tư liệu nửa phải
const mBia = (kk, so, td, by, notes, lap = "") => sec("bia", "giay", notes, anh("bia-chay.jpg", 960, 0, 960, 1080, "Tranh Đại hoả hoạn London 1666", "Đại hoả hoạn London 1666 · tranh khoảng 1675 · phạm vi công cộng", lap)
  + t("kk", 120, 300, 760, kk) + (so ? t("bia-chuong", 120, 350, 760, so) : "") + `<h1 class="bia-td" data-t data-tieu-de style="left:118px;top:430px;width:780px">${em(td)}</h1>` + khoi("gach", 120, 730, 120, 6) + t("bia-by", 120, 900, 760, by));
// mở phần: nền màu chủ, số phần lớn, hình chính nửa phải
const mMoPhan = (so, ten, mo, notes, phai) => sec("mo-phan", "dam", notes, phai + t("mp-so", 112, 210, 700, so) + `<h1 class="mp-t" data-t data-tieu-de style="left:120px;top:470px;width:760px">${esc(ten)}</h1>` + t("mp-m", 120, 720, 720, mo));
// câu chốt: nền màu chủ, một câu chữ lớn; nửa phải là ảnh / số / danh sách
const mCau = (cau, phu, notes, phai = "", rong = 780, ex = "data-khong-hinh") => { const w = phai ? rong : 1560; return sec("cau", "dam", notes, phai + `<div class="cau-khoi" style="left:120px;top:96px;width:${w}px;height:888px"><h1 class="cau" data-t data-tieu-de>${em(cau)}</h1>${phu ? `<div class="cau-phu" data-t>${em(phu)}</div>` : ""}</div>`, phai.includes('data-loai="anh-hai-mau"') ? "" : ex); };
// nội dung: nhãn mục + tiêu đề ĐÚNG MỘT CHỖ; vùng nội dung y 360–1010
const mNoiDung = (kk, td, body, notes, { dan, khongHinh } = {}) => { if (!dan) throw new Error(`slide “${td}” thiếu dòng phụ đề (dan) — bố cục nội dung bắt buộc một câu chốt ý`); return sec("noi-dung", "giay", notes, t("kk", 120, 96, 1400, kk) + t("td", 120, 136, 1600, td, "data-tieu-de") + t("dan", 120, 232, 1600, dan) + "\n" + body, khongHinh ? "data-khong-hinh" : ""); };
// câu hỏi: cột màu chủ bên trái mang số câu, câu hỏi + 4 phương án kẻ ngang bên phải
const mHoi = (k, q, ds, notes, dan, dien) => sec("hoi", "giay", notes, khoi("panel-dam", 0, 0, 560, 1080) + t("hoi-kk", 120, 300, 380, dien ? q : "Câu hỏi tức thì") + t("hoi-so", 120, 360, 420, `${k}/5`, "data-dl")
  + `<h1 class="hoi-td${dien ? " dien" : ""}" data-t data-tieu-de style="left:680px;top:136px;width:1120px">${esc(dien || q)}</h1>` + (dan ? t("dan", 680, 232, 1120, dan) : "")
  + ds.map((d, j) => { const y = (dien ? 470 : 380) + j * 145; return `${vach(680, y, 1120)}${t("pa-chu", 680, y + 32, 80, "ABCD"[j])}${t("pa-t", 780, y + 42, 1020, d)}`; }).join(""));

// =================== HỆ THIẾT KẾ MỚI "TƯ VẤN PHÁP LÝ" (cổng thẩm mỹ: CONG=1 chỉ dựng 8 slide mẫu) ===================
// Ngôn ngữ hình: ảnh chụp thật (Unsplash, cắt chéo mép) cho bìa / mở phần / trích luật · minh hoạ unDraw tô lại theo bảng màu
//   + vật phẳng tự vẽ (minh-hoa.js) cho sơ đồ · nền sáng có mảng theo vai · khối thông tin tô đặc · tiêu đề Lora 72 px có từ khoá màu.
// Chuyển động (Hào chọn 15/11: có chuyển cảnh + hiệu ứng xuất hiện, KHÔNG Morph): mỗi slide fade / push; vật hiện theo nhịp đọc
//   (tiêu đề → phụ đề → hình chính → từng ý), tự chạy theo data-at. Xem thử: scripts/xem_hieu_ung.js.
if (process.env.CONG) {
  const mh = require("./minh-hoa.js"), P = mh.P, S2 = [], TONG = 46, PANEL = 720;
  let nL = 0;
  const A = (a, at, dur = 500) => `data-a="${a}" data-at="${at}" data-dur="${dur}"`;
  const lop = (body, x, y, w, h, alt, loai = "phang", ex = "") => { const f = `l${String(++nL).padStart(2, "0")}.svg`;
    ghi(path.join(D, "asset", "hinh", f), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${body}</svg>`);
    return `<img data-l="lop-${nL}" data-loai="${loai}" data-alt="${esc(alt)}" ${ex} src="asset/hinh/${f}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`; };
  const ud = (ten, x, y, w, alt, ex = "", doi = {}) => { const r = mh.unDraw(D, ten, x, y, w, doi); return lop(r.svg, x, y, w, Math.ceil(r.h), alt, "undraw", ex); };
  const udH = (ten, w) => mh.unDraw(D, ten, 0, 0, w).h;
  const chup = (f, x, y, w, h, alt, ex = "") => `<img data-l="anh-${f.replace(/\W/g, "")}" data-loai="anh-chup" data-alt="${esc(alt)}" ${ex} src="anh/unsplash/${f}" style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px">`;
  const nen = (body) => lop(body, 0, 0, 1920, 1080, "Hình trang trí", "nen");
  const T = (cls, x, y, w, s, ex = "") => `<div class="${cls}" data-t ${ex} style="left:${x}px;top:${y}px;width:${w}px">${em(s)}</div>`;
  const G = (cls, x, y, w, h, html, ex = "") => `<div class="${cls} giua" data-t ${ex} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px">${html}</div>`;
  const chip = (s, x = 120, y = 80, cls = "chip", ex = "") => `<div class="${cls}" data-t data-l="c${++nL}" data-alt="Nhãn ${esc(s)}" ${ex} style="left:${x}px;top:${y}px">${esc(s)}</div>`;   // data-t + data-l: nền là lớp ảnh, chữ là hộp chữ — không mất nền khi nằm trên ảnh
  const khoi = (x, y, w, h, cls, alt, ex = "", st = "") => `<div class="${cls}" data-l="k${++nL}" data-alt="${esc(alt)}" ${ex} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px${st}"></div>`;   // thẻ nền thành lớp riêng để hiện có hiệu ứng
  const dau = (kk, td, dan, so, x = 120, w = 1500) => chip(kk, x, 80, "chip", A("fade", 0, 400)) + `<h1 class="td" data-t data-tieu-de ${A("rise", 100, 600)} style="left:${x}px;top:132px;width:${w}px">${em(td)}</h1>` + (dan ? T("dan", x, 246, w + 60, dan, A("fade", 350, 500)) : "") + T("so-trang", 1600, 84, 200, `${so} / ${TONG}`);
  const sec2 = (mau, kieu, notes, inner, { ex = "", trans = "fade", dur = 600 } = {}) => S2.push(`<section class="s ${kieu}" data-mau="${mau}" data-nen="${kieu}" ${ex} data-trans="${trans}" data-dur="${dur}" data-notes="${esc(notes)}">\n${inner}\n</section>`);
  const NEN = {
    tron: () => `<circle cx="1920" cy="0" r="300" fill="${P.x4}"/>` + mh.cham(1660, 960, 6, 2, 26, 5, P.v2),
    goc: () => `<circle cx="0" cy="1080" r="110" fill="${P.x4}"/><circle cx="1920" cy="0" r="110" fill="${P.v4}"/>`,
    dat: (y0) => `<rect x="0" y="${y0}" width="1920" height="${1080 - y0}" fill="${P.x4}"/>` + mh.cham(1700, 150, 5, 3, 26, 5, P.v2),
  };

  // ---- 1 BÌA — ảnh thật cắt chéo + thẻ nổi ----
  const vom = (x, y, w, h) => `M${x} ${y + h} V${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V${y + h} Z`;
  sec2("bia", "sang", nc(1), nen(`<path d="${vom(1080, 160, 760, 900)}" fill="${P.x4}"/>` + mh.cham(120, 1000, 6, 2, 26, 5, P.v2) + mh.cham(1800, 90, 4, 4, 26, 5, P.v2) + mh.saoCum(940, 220, 28))
    + lop(`<path d="${vom(996, 86, 808, 948)}" fill="none" stroke="${P.v2}" stroke-width="6"/>`, 990, 80, 820, 960, "Viền vòm vàng bao quanh ảnh", "phang", A("fade", 500, 700))
    + chup("bia-vom.png", 1020, 110, 760, 900, "Ảnh: bàn tay nâng một ngôi nhà mô hình — bảo hiểm che chở tài sản", A("rise", 0, 900))
    + khoi(880, 850, 580, 150, "the-noi", "Thẻ nổi", A("rise", 1400, 600)) + lop(`<rect x="910" y="880" width="90" height="90" rx="18" fill="${P.x1}"/>` + mh.khien(955, 925, 62, { trai: P.v2, phai: P.v3, dau: P.x1 }), 910, 880, 90, 90, "Biểu tượng khiên", "phang", A("pop", 1600, 400))
    + T("noi-t", 1030, 880, 410, "Chuyển giao rủi ro", A("fade", 1700, 400)) + T("noi-m", 1030, 926, 410, "tài chính qua hợp đồng", A("fade", 1800, 400))
    + chip("BNK405 · Nghiệp vụ bảo hiểm", 120, 240, "chip", A("fade", 300, 400)) + T("bia-chuong", 120, 318, 700, "Chương 3", A("rise", 450, 500))
    + `<h1 class="bia-td" data-t data-tieu-de ${A("rise", 600, 700)} style="left:116px;top:388px;width:780px">${em("Bảo hiểm [thương mại]")}</h1>`
    + `<div class="gach" data-l="gach-bia" data-alt="Gạch vàng" ${A("wipe", 1000, 400)} style="left:120px;top:720px;width:150px;height:12px"></div>` + T("bia-mo", 120, 768, 720, "Khái niệm · Phân loại · Hợp đồng · Tái bảo hiểm", A("fade", 1100, 500)) + T("bia-by", 120, 930, 640, "GV Nguyễn Thị Thu Hằng · 120 phút", A("fade", 1200, 500)));

  // ---- 2 MỞ PHẦN 01 — ảnh ô vàng dưới mưa, cắt chéo ----
  sec2("mo-phan", "dam", nc(5), nen(mh.cham(120, 96, 5, 3, 26, 5, P.v2))
    + lop(`<circle cx="1480" cy="580" r="470" fill="${P.x2}"/>`, 1010, 110, 910, 940, "Mảng tròn sau ảnh", "phang", A("grow", 0, 700))
    + chup("mo-phan-tron.png", 1000, 110, 860, 860, "Ảnh: người cầm chiếc ô vàng dưới mưa — che chắn rủi ro", A("pop", 200, 800))
    + lop(`<circle cx="1430" cy="540" r="462" fill="none" stroke="${P.v2}" stroke-width="6" stroke-dasharray="2 0"/>` + mh.saoCum(990, 860, 26, P.v3), 960, 70, 940, 950, "Vòng vàng quanh ảnh", "phang", A("fade", 700, 600))
    + khoi(120, 190, 300, 240, "o-so", "Ô số phần", A("pop", 300, 500)) + T("mp-so", 120, 196, 300, "01", `data-dl ${A("pop", 400, 500)}`)
    + `<h1 class="mp-t" data-t data-tieu-de ${A("rise", 600, 600)} style="left:116px;top:500px;width:640px">Khái niệm và nguyên tắc</h1>` + T("mp-m", 120, 730, 600, "BHTM là gì — và năm nguyên tắc giữ cho nó vận hành.", A("fade", 850, 500))
    + [["Số đông", 120, 830], ["Rủi ro bảo hiểm", 300, 830], ["Quyền lợi bảo hiểm", 120, 900], ["Phân tán rủi ro", 486, 900], ["Trung thực tuyệt đối", 120, 970]].map(([s, x, y], k) => chip(s, x, y, "chip vang nt", A("rise", 1000 + k * 120, 400))).join(""), { trans: "push", dur: 700 });

  // ---- 3 SƠ ĐỒ — người mua ↔ hợp đồng ↔ DNBH, từng bước hiện ----
  { const G0 = 830, hn = udH("legal-counsel_kdnh", 380), hh = udH("handshake-deal_nwk6", 380);
    sec2("noi-dung", "sang", nc(8), nen(NEN.dat(G0))
      + dau("3.1 · Khái niệm", "BHTM: [chuyển rủi ro] qua hợp đồng", "Phí trả chắc chắn; bồi thường chỉ khi rủi ro xảy ra.", 8)
      + lop(mh.mayMua(440, 362, 180), 330, 296, 230, 160, "Minh hoạ: đám mây mưa có tia sét trên đầu người mua — rủi ro có thể xảy ra", "phang", `${A("drop", 450, 600)} data-em="teeter" data-emat="1300"`)
      + ud("legal-counsel_kdnh", 150, Math.round(G0 - hn), 380, "Minh hoạ: người mua bảo hiểm cầm giấy yêu cầu", A("slide", 600, 600))
      + ud("handshake-deal_nwk6", 770, Math.round(665 - hh / 2), 380, "Minh hoạ: cái bắt tay trên bản hợp đồng — giao kết hợp đồng bảo hiểm", A("pop", 1000, 500))
      + lop(`<rect x="1370" y="${G0 - 4}" width="340" height="14" rx="7" fill="${P.x3}"/>` + mh.toaVP(1540, G0, 290), 1360, 400, 360, 450, "Minh hoạ: toà văn phòng doanh nghiệp bảo hiểm có huy hiệu ô", "phang", A("slide-r", 1400, 600))
      + lop(mh.muiKhoi(620, 1340, 490, 30), 610, 450, 740, 80, "Mũi tên: phí bảo hiểm đi từ bên mua tới doanh nghiệp bảo hiểm", "phang", A("wipe", 1800, 600)) + chip("Phí · luôn trả", 880, 384, "chip", A("fade", 2100, 400))
      + lop(mh.muiKhoi(1340, 620, 890, 30, { vien: P.v1, dut: true, nen: P.v4 }) + `<circle cx="680" cy="975" r="40" fill="${P.d4}"/>` + mh.lua(680, 1004, 58), 610, 850, 740, 180, "Mũi tên đứt: bồi thường chỉ khi rủi ro đã thoả thuận xảy ra", "phang", A("wipe-r", 2500, 600))
      + T("nhan-vang", 740, 924, 560, "Bồi thường", A("fade", 2800, 400)) + T("dk-vang", 740, 972, 560, "khi rủi ro được bảo hiểm xảy ra", A("fade", 2900, 400))
      + `<div class="cap" style="left:180px;top:850px;width:360px"><b data-t class="la-t" ${A("fade", 900, 400)}>Bên mua bảo hiểm</b><span data-t class="la-m" ${A("fade", 1000, 400)}>trả phí</span></div>`
      + `<div class="cap" style="left:1360px;top:850px;width:360px"><b data-t class="la-t" ${A("fade", 1700, 400)}>Doanh nghiệp bảo hiểm</b><span data-t class="la-m" ${A("fade", 1800, 400)}>cam kết bồi thường</span></div>`, { ex: "data-khong-hinh" });
  }

  // ---- 4 SỐ LỚN — lịch 15 ô: ngày 1 nhận đủ hồ sơ → ngày 15 hạn trả tiền ----
  { const cw = 162, ch = 132, g = 12, x0 = 140, y0 = 452;
    const o = (k) => ({ x: x0 + (k % 5) * (cw + g), y: y0 + Math.floor(k / 5) * (ch + g) });
    sec2("so-lon", "sang", nc(23), nen(NEN.tron())
      + dau("3.3 · Nghĩa vụ của DNBH", "Giải thích rõ, [bồi thường đúng hạn]", "Đủ hồ sơ hợp lệ: DNBH trả trong 15 ngày, trừ khi thoả thuận khác.", 24)
      + khoi(136, 336, 900, 640, "bong", "Bóng tờ lịch", A("pop", 400, 500)) + khoi(120, 320, 900, 640, "the-trang lich", "Tờ lịch", A("pop", 400, 500)) + khoi(120, 320, 900, 110, "dau-xanh", "Đầu tờ lịch", A("pop", 400, 500))
      + `<div class="lich-so" data-t data-dl ${A("rise", 700, 500)} style="left:150px;top:326px;width:840px">15 ngày <span class="lich-m">tối đa</span></div>`
      + [0, 1, 2].map((hang) => lop([0, 1, 2, 3, 4].map((c) => { const k = hang * 5 + c, q = o(k), dau = k === 0, cuoi = k === 14;
          return `<rect x="${q.x}" y="${q.y}" width="${cw}" height="${ch}" rx="14" fill="${dau ? P.x1 : cuoi ? P.v2 : P.v4}"/>` + (dau ? mh.iconNet(D, "file-text", q.x + cw / 2, q.y + ch / 2 + 10, 56, P.nen, 3) : cuoi ? mh.iconNet(D, "coins", q.x + cw / 2, q.y + ch / 2 + 10, 56, P.x1, 3) : `<circle cx="${q.x + cw / 2}" cy="${q.y + ch / 2}" r="7" fill="${P.v2}"/>`); }).join(""),
          x0, y0 + hang * (ch + g), 5 * (cw + g), ch, `Hàng ${hang + 1} của 15 ô ngày`, "phang", A("wipe", 1100 + hang * 300, 500))).join("")
      + T("lich-o", o(0).x + 14, o(0).y + 8, 60, "1", A("fade", 1100, 300)) + T("lich-o toi", o(14).x + 14, o(14).y + 8, 80, "15", A("fade", 1700, 300))
      + T("lich-nhan", 140, 896, 420, "Ngày 1: đủ hồ sơ", A("fade", 2000, 400)) + T("lich-nhan vang", 590, 896, 420, "Ngày 15: hạn trả", A("fade", 2100, 400))
      + [["file-certificate", P.x1, "Khi giao kết", "giải thích loại trừ"], ["calendar", P.x1, "Khi xảy ra", "trả đúng hạn"], ["coins", P.v1, "Chậm trả", "trả thêm lãi"]].map(([i, m, a, b], k) => { const y = 360 + k * 190, t0 = 2300 + k * 300;
        return lop(`<rect x="1100" y="${y}" width="100" height="100" rx="18" fill="${m}"/>` + mh.iconNet(D, i, 1150, y + 50, 60, P.nen, 3), 1100, y, 100, 100, `Biểu tượng ${a}`, "phang", `data-lap ${A("pop", t0, 400)}`)
          + `<div class="cap" style="left:1230px;top:${y + 2}px;width:570px"><b data-t class="dong-t" ${A("fade", t0 + 100, 400)}>${esc(a)}</b><span data-t class="dong-m" ${A("fade", t0 + 200, 400)}>${esc(b)}</span></div>` + (k ? `<div class="vach" style="left:1100px;top:${y - 36}px;width:700px"></div>` : ""); }).join("")
      + T("nguon", 120, 1000, 1680, "Luật KDBH 08/2022/QH15: Điều 20 khoản 2 điểm b, đ (giải thích, trả đúng hạn); Điều 31 (thời hạn, lãi chậm trả)."));
  }

  // ---- 5 BẢNG — bốn trường hợp; mỗi hàng hiện lần lượt, thanh so sánh trong ô ----
  { const R = [["Đúng giá trị", P.x1, [340], "Theo thiệt hại thực tế"], ["Dưới giá trị", P.x1, [204], "Theo tỷ lệ STBH / giá trị"], ["Trên giá trị", P.x1, [440], "Tối đa bằng giá trị; hoàn phí vượt"], ["Bảo hiểm trùng", P.x1, [200, 230], "Chia theo tỷ lệ STBH"]];
    const y0 = 400, HR = [128, 200, 128, 128], X = 440, YS = HR.map((h, k) => y0 + HR.slice(0, k).reduce((a, v) => a + v, 0));
    sec2("bang", "sang", nc(25), nen(NEN.dat(760))
      + dau("3.3 · So STBH với giá trị", "Bốn trường hợp, [bốn cách bồi thường]", "Cùng ngôi nhà, khai STBH khác nhau thì bồi thường khác nhau.", 26)

      + khoi(120, 330, 1680, 62, "bh", "Đầu bảng", A("wipe", 500, 500))
      + [["Trường hợp", 140, 240], ["Giá trị và số tiền bảo hiểm (STBH)", 440, 580], ["Bồi thường", 1040, 600]].map(([s, x, w]) => G("bh-t", x, 330, w, 62, esc(s), A("fade", 700, 300))).join("")
      + R.map(([ten, m, st, bt], k) => { const y = YS[k], hr = HR[k], t0 = 900 + k * 450, yb = y + (k === 1 ? 30 : 34);
        let bars = `<rect x="${X}" y="${yb}" width="340" height="28" rx="5" fill="${P.x1}"/>`, x = X; st.forEach((v, j) => { bars += `<rect x="${x}" y="${yb + 38}" width="${v}" height="28" rx="5" fill="${j ? P.v3 : P.v2}"/>`; x += v + 4; });
        if (st[0] > 340 || st.length > 1) bars += `<path d="M${X + 340} ${yb - 10} V${yb + 72}" stroke="${P.d1}" stroke-width="3" stroke-dasharray="6 5"/>`;
        return khoi(120, y, 1680, hr - 8, `hang${k === 1 ? " nhan" : ""}`, `Hàng ${ten}`, A("rise", t0, 450)) + khoi(120, y, 260, hr - 8, "tab", `Nhãn ${ten}`, A("rise", t0, 450), `;background:${m}`)
          + G("tab-t", 140, y, 220, hr - 8, esc(ten), A("rise", t0, 450))
          + lop(bars, 430, y, 560, hr - 8, `Thanh so sánh: ${ten}`, "phang", A("wipe", t0 + 200, 500))
          + (k !== 1 ? T("tren-thanh", 790, yb - 2, 120, "giá trị", A("fade", t0 + 500, 300)) + T("tren-thanh vang", 900, yb + 36, 120, "STBH", A("fade", t0 + 550, 300)) : "")
          + (k === 1 ? T("tren-thanh", 790, yb - 2, 120, "1 tỷ", A("fade", t0 + 500, 300)) + T("tren-thanh vang", 654, yb + 36, 140, "600 tr", A("fade", t0 + 550, 300))
              + G("o-t", 1040, y + 6, 740, 80, esc(bt), A("fade", t0 + 300, 400)) + `<div class="vd-ct" data-t ${A("rise", t0 + 700, 500)} style="left:1040px;top:${y + 100}px;width:740px">Ví dụ: <b>600</b> / 1.000 × <span class="d">200</span> = <i>120 triệu</i></div>`
              : G("o-t", 1040, y, 740, hr - 8, esc(bt), A("fade", t0 + 300, 400))); }).join("")
      + T("nguon", 120, 1000, 1680, "Luật KDBH 08/2022/QH15: đúng giá trị — Điều 16 khoản 3 · dưới — Điều 48 · trên — Điều 47 · trùng — Điều 49."), { ex: "data-khong-hinh" });
  }

  // ---- 6 TRÍCH LUẬT — HERO: ảnh ký hợp đồng tràn mép, dải màu chủ phủ trái, câu trích chữ sáng ----
  sec2("trich", "anh", nc(20), chup("trich-full.jpg", 0, 0, 1920, 1080, "Ảnh: bàn tay ký vào bản hợp đồng, phủ dải màu chủ bên trái", A("fade", 0, 900))
    + chip("3.3 · Khái niệm", 120, 80, "chip vang", A("fade", 200, 400)) + `<h1 class="td sang" data-t data-tieu-de ${A("rise", 300, 600)} style="left:120px;top:132px;width:1100px">${em("Bên mua [đóng phí], DNBH {bồi thường} theo hợp đồng")}</h1>` + T("so-trang sang", 1600, 84, 200, `21 / ${TONG}`)
    + lop([0, 70].map((d) => `<circle cx="${138 + d}" cy="400" r="26" fill="${P.v2}"/><path d="M${112 + d} 400 Q${108 + d} 350 ${152 + d} 332 L${156 + d} 344 Q${130 + d} 358 ${136 + d} 390 Z" fill="${P.v2}"/>`).join(""), 100, 322, 160, 110, "Dấu ngoặc kép", "phang", `data-lap ${A("pop", 700, 400)}`)
    + `<div class="trich sang" data-t ${A("fade", 900, 900)} style="left:176px;top:450px;width:940px">Hợp đồng bảo hiểm là sự thỏa thuận giữa bên mua bảo hiểm và doanh nghiệp bảo hiểm, …, theo đó bên mua bảo hiểm phải <mark class="xanh">đóng phí bảo hiểm</mark>, doanh nghiệp bảo hiểm, … phải <mark>bồi thường, trả tiền bảo hiểm</mark> theo thỏa thuận trong hợp đồng.</div>`
    + chip("Khoản 16 Điều 4 · Luật KDBH 08/2022/QH15", 180, 880, "chip vien", A("rise", 1700, 400)) + T("dan sang", 178, 950, 940, "Hợp đồng phải lập thành văn bản (Điều 18).", A("fade", 1900, 400)), { ex: "data-hero" });

  // ---- 7 SO SÁNH — hai thẻ, đầu thẻ có minh hoạ unDraw ----
  { const H = [["Vì sao có", "Bảo vệ lợi ích công cộng", "Theo nhu cầu người mua"], ["Ví dụ", "Xe cơ giới, cháy nổ, xây dựng…", "Nhân thọ, sức khoẻ, vật chất xe…"], ["Lưu ý", "Không từ chối người đủ điều kiện", "Tự chọn sản phẩm và mức"]];
    sec2("so-sanh", "sang", nc(16), nen(NEN.dat(700))
      + dau("3.2 · Theo tính chất pháp lý", "Bắt buộc [do luật], tự nguyện [do nhu cầu]", "Bắt buộc chỉ gồm các loại luật liệt kê.", 17)
      + [[120, "dau-xanh", "Bảo hiểm bắt buộc", 1, "", "Minh hoạ: văn bản luật có dấu đỏ và búa — bảo hiểm do luật buộc", {}], [990, "dau-vang", "Bảo hiểm tự nguyện", 2, "choose_5kz4", "Minh hoạ: người đang chọn giữa các phương án — bảo hiểm do người mua tự chọn", { "#6c63ff": P.x1 }]].map(([x, cls, ten, c, u, alt, doi]) => { const t0 = c === 1 ? 500 : 900;
        return khoi(x + 14, 344, 810, 650, "bong", "Bóng thẻ", A("rise", t0, 500)) + khoi(x, 330, 810, 650, "the-trang", `Thẻ ${ten}`, A("rise", t0, 500)) + khoi(x, 330, 810, 190, cls, `Đầu thẻ ${ten}`, A("rise", t0, 500))
          + (u ? ud(u, x + 470, 336, 320, alt, A("pop", t0 + 300, 500), doi) : lop(`<g transform="rotate(-6 ${x + 600} 430)">${mh.hopDong(x + 540, 340, 130, { bar: false })}</g>` + mh.bua(x + 720, 450, 150, { dau: P.v3, soc: P.v2, vet: P.x3 }), x + 500, 330, 300, 190, alt, "phang", A("pop", t0 + 300, 500))) + T(`the-td${c === 2 ? " toi" : ""}`, x + 40, 392, 480, ten, A("fade", t0 + 200, 400))
          + H.map((h, k) => `${T("the-nhan", x + 40, 550 + k * 145, 730, h[0], A("fade", t0 + 500 + k * 200, 300))}${T("the-chu", x + 40, 586 + k * 145, 730, h[c], A("fade", t0 + 550 + k * 200, 400))}${k ? `<div class="vach" style="left:${x + 40}px;top:${536 + k * 145}px;width:730px"></div>` : ""}`).join(""); }).join("")
      + T("nguon", 120, 1012, 1680, "Luật KDBH 08/2022/QH15: Điều 8 khoản 1 (vì sao có), khoản 2 (danh mục), khoản 4 (không được từ chối)."));
  }

  // ---- 8 CÂU HỎI — panel bạc hà + minh hoạ unDraw; phương án hiện lần lượt ----
  { const hq = udH("questions_52ic", 560);
    sec2("hoi", "chia", nc(39), lop(`<rect x="0" y="0" width="${PANEL}" height="1080" fill="${P.x4}"/><path d="M0 990 L${PANEL} 800 V1080 H0 Z" fill="${P.x3}"/>` + mh.cham(520, 960, 6, 2, 26, 5, P.v2), 0, 0, PANEL, 1080, "Cột màu bạc hà", "phang", A("fade", 0, 500))
      + lop([[P.x2, 150], [P.v2, 340], [P.x1, 530]].map(([m, cx]) => `<path d="M${cx - 80} 470 L${cx - 100} 430 H${cx - 20} Z M${cx + 80} 470 L${cx + 100} 430 H${cx + 20} Z" fill="${m}"/><rect x="${cx - 80}" y="470" width="160" height="120" rx="10" fill="${m}"/><rect x="${cx - 50}" y="510" width="100" height="14" rx="7" fill="${P.nen}" opacity="0.7"/>`).join("")
          + [[150, 300, -14], [340, 250, 6], [530, 290, 16]].map(([cx, cy, g]) => `<g transform="rotate(${g} ${cx} ${cy})">${mh.hopDong(cx - 55, cy - 72, 110, { bar: false })}</g>`).join("")
          + `<path d="M210 220 q40 -60 100 -40 M400 170 q60 -40 110 0" fill="none" stroke="${P.x3}" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 14"/>` + mh.saoCum(560, 140, 22, P.v2),
          40, 100, 640, 520, "Minh hoạ: ba hợp đồng đang được xếp vào ba hộp — phân loại hợp đồng bảo hiểm", "phang", A("pop", 300, 600))
      + chip("Câu hỏi tức thì", 120, 660, "chip", A("fade", 600, 400)) + T("hoi-so", 120, 730, 520, "1/5", `data-dl ${A("pop", 700, 500)}`)
      + `<h1 class="hoi-td" data-t data-tieu-de ${A("rise", 500, 600)} style="left:820px;top:200px;width:980px">Luật KDBH phân loại HĐBH theo tiêu chí nào?</h1>` + T("so-trang", 1600, 84, 200, `40 / ${TONG}`)
      + ["Số tiền bảo hiểm", "Đối tượng bảo hiểm", "Thời hạn bảo hiểm", "Kỹ thuật bảo hiểm"].map((d, j) => { const y = 400 + j * 150, t0 = 1000 + j * 200;
        return khoi(820, y, 980, 120, "pa", `Phương án ${"ABCD"[j]}`, A("slide-r", t0, 450)) + khoi(820, y, 120, 120, "pa-o", "Ô chữ cái", A("slide-r", t0, 450)) + T("pa-chu", 820, y + 26, 120, "ABCD"[j], A("slide-r", t0, 450)) + T("pa-t", 980, y + 38, 800, d, A("slide-r", t0, 450)); }).join(""));
  }

  // ---- CSS ----
  ghi(path.join(D, "style.css"), `section.s{background:${P.nen};color:${P.muc}}section.s.dam{background:${P.x1};color:${P.nen}}
section.s > div, section.s > h1{position:absolute}
[data-t]{text-wrap:pretty}.td,.bia-td,.mp-t,.hoi-td{text-wrap:balance}
em{font-style:normal;color:${P.x2}}em.v{color:${P.v1}}.dam em,.anh em{color:${P.x3}}.anh em.v{color:${P.v3}}
section.s.anh{background:${P.x1}}.td.sang{color:${P.nen}}.so-trang.sang,.dan.sang{color:${P.x4}}.trich.sang{color:${P.nen}}.trich.sang mark.xanh{background:${P.x2};color:${P.nen}}.trich.sang mark{background:${P.v3};color:${P.muc}}
.giua{display:flex;align-items:center}
.chip{font:700 28px/1 'Be Vietnam Pro';letter-spacing:.08em;text-transform:uppercase;color:${P.nen};background:${P.x1};padding:11px 18px 10px;border-radius:6px;white-space:nowrap;width:auto !important}
.chip.vang{background:${P.v3};color:${P.muc}}.chip.cot{width:156px !important;text-align:center;padding:10px 0;letter-spacing:0;text-transform:none;font-size:26px}
.chip.nt{font-size:30px;letter-spacing:0;text-transform:none;padding:10px 16px 9px}
.chip.vien{background:${P.v4};color:${P.muc}}
.td{font:700 72px/1.1 'Lora';color:${P.muc}}.dan{font:400 34px/1.4 'Be Vietnam Pro';color:${P.phu}}
.so-trang{font:600 24px/1 'Be Vietnam Pro';color:${P.phu};text-align:right}
.nguon{font:400 26px/1.4 'Be Vietnam Pro';color:${P.phu}}
.the,.the-trang{background:${P.trang};border-radius:20px}.the-vang{background:${P.v4};border-radius:24px}.bong{background:${P.x4};border-radius:22px}
.the-noi{background:${P.trang};border-radius:20px;border:2px solid ${P.ke}}.noi-t{font:800 32px/1.2 'Be Vietnam Pro';color:${P.x1}}.noi-m{font:400 30px/1.3 'Be Vietnam Pro';color:${P.phu}}
.gach{background:${P.v2};border-radius:6px}.vach{height:2px;background:${P.ke}}
.bia-chuong{font:700 48px/1.2 'Lora';color:${P.v1}}.bia-td{position:absolute;font:700 132px/1.06 'Lora';color:${P.muc}}
.bia-mo{font:400 32px/1.45 'Be Vietnam Pro';color:${P.phu}}.bia-by{font:600 28px/1.4 'Be Vietnam Pro';color:${P.phu}}
.o-so{background:${P.v2};border-radius:24px}.mp-so{font:700 200px/1.15 'Lora';color:${P.x1};text-align:center}
.mp-t{position:absolute;font:700 88px/1.08 'Lora';color:${P.nen}}.mp-m{font:400 32px/1.45 'Be Vietnam Pro';color:${P.x4}}
.la-t{font:800 32px/1.25 'Be Vietnam Pro';color:${P.x1};text-align:center}.la-m{font:400 32px/1.35 'Be Vietnam Pro';color:${P.phu};text-align:center}
.cap > b,.cap > span{display:block}.cap > span{margin-top:8px}
.nhan-vang{font:800 36px/1.2 'Be Vietnam Pro';color:${P.v1}}.dk-vang{font:600 32px/1.3 'Be Vietnam Pro';color:${P.v1}}
.lich{border:3px solid ${P.x4}}.lich-so{font:700 80px/1.15 'Lora';color:${P.v3}}.lich-m{font:700 40px/1.3 'Be Vietnam Pro';color:${P.x4}}.lich-o{font:700 40px/1 'Lora';color:${P.nen}}.lich-o.toi{color:${P.x1}}.lich-nhan{font:800 32px/1.2 'Be Vietnam Pro';color:${P.x1}}.lich-nhan.vang{color:${P.v1}}
.tren-thanh{font:800 28px/1 'Be Vietnam Pro';color:${P.x1}}.tren-thanh.vang{color:${P.v1}}.vd-ct{font:600 32px/1.2 'Be Vietnam Pro';color:${P.muc}}.vd-ct b{color:${P.v1}}.vd-ct .d{color:${P.d0}}.vd-ct i{font-style:normal;font-weight:800;color:${P.x1}}
.nhan-do{font:800 36px/1.2 'Be Vietnam Pro';color:${P.d0}}.dk-do{font:600 32px/1.3 'Be Vietnam Pro';color:${P.d0}}
.so-to{font:700 330px/1 'Lora';color:${P.x1}}.don-vi{font:700 64px/1 'Lora';color:${P.v1}}
.dai{background:${P.x1};border-radius:0 0 24px 24px}.dai-t{font:600 30px/1.3 'Be Vietnam Pro';color:${P.nen}}
.dong-t{font:800 34px/1.25 'Be Vietnam Pro';color:${P.muc}}.dong-t.do{color:${P.d0}}.dong-m{font:400 32px/1.35 'Be Vietnam Pro';color:${P.phu}}
.bh{background:${P.x1};border-radius:14px 14px 0 0}.bh-t{font:600 30px/1.2 'Be Vietnam Pro';color:${P.nen}}
.hang{background:${P.trang};border-bottom:3px solid ${P.ke}}.hang.nhan{background:${P.v4}}
.tab-t{font:800 32px/1.15 'Be Vietnam Pro';color:${P.nen}}.o-t{font:400 34px/1.3 'Be Vietnam Pro';color:${P.muc}}.o-nhan{font:600 28px/1 'Be Vietnam Pro';color:${P.phu}}.o-mau{display:inline-block;width:34px;height:16px;border-radius:4px;margin:0 12px 0 22px}.o-mau.x{background:${P.x4};margin-left:0}.o-mau.v{background:${P.v2}}.o-mau.d{width:4px;height:30px;background:${P.d4}}.o-do{font:700 28px/1 'Be Vietnam Pro';color:${P.d0}}
.trich{font:700 42px/1.45 'Lora';color:${P.muc}}
.trich mark{background:${P.v4};color:${P.v1};padding:0 2px}.trich mark.xanh{background:${P.x4};color:${P.x1}}
.dau-xanh{background:${P.x1};border-radius:20px 20px 0 0}.dau-vang{background:${P.v2};border-radius:20px 20px 0 0}
.the-td{font:700 44px/1.15 'Lora';color:${P.nen}}.the-td.toi{color:${P.muc}}
.the-nhan{font:700 28px/1.2 'Be Vietnam Pro';letter-spacing:.06em;text-transform:uppercase;color:${P.x1}}.the-chu{font:400 34px/1.35 'Be Vietnam Pro';color:${P.muc}}
.hoi-so{font:700 160px/1 'Lora';color:${P.x1}}.hoi-td{position:absolute;font:700 60px/1.15 'Lora';color:${P.muc}}
.pa{background:${P.trang};border-radius:16px;border:2px solid ${P.ke}}.pa-o{border-radius:16px 0 0 16px;background:${P.x1}}
.vd{background:${P.x1};border-radius:30px}.vd-x{background:${P.x4};border-radius:12px}.vd-v{background:${P.v4};border-radius:12px}.vd-d{background:${P.d4};border-radius:12px}.vd-k{background:${P.v3};border-radius:12px}
.vd-t{font:700 26px/1 'Be Vietnam Pro';color:${P.nen};text-transform:uppercase;letter-spacing:.06em}.vd-x-t,.vd-v-t,.vd-k-t{font:800 32px/1 'Be Vietnam Pro';color:${P.muc}}.vd-d-t{font:800 32px/1 'Be Vietnam Pro';color:${P.d0}}
.pa-chu{font:700 60px/1.15 'Lora';color:${P.nen};text-align:center}.pa-t{font:600 36px/1.3 'Be Vietnam Pro';color:${P.muc}}
`);
  fs.rmSync(path.join(D, "slides"), { recursive: true, force: true });
  S2.forEach((h, k) => ghi(path.join(D, "slides", `${String(k + 1).padStart(2, "0")}.html`), h));
  console.log(`CỔNG: ${S2.length} slide mẫu, ${nL} lớp hình`);
  return;
}

// =================== 46 SLIDE ===================
// 1 bìa
mBia("BNK405 · Nghiệp vụ bảo hiểm", "Chương 3", "Bảo hiểm thương mại", "GV Nguyễn Thị Thu Hằng · 120 phút", nc(1));
// 2 câu chốt mở bài — ảnh tư liệu vụ cháy
mCau("Một vụ cháy có thể lấy đi [tài sản cả đời]", "Xác suất nhỏ, hậu quả lớn — nhiều người cùng chia thì gánh được.", nc(2),
  anh("cau-chay.jpg", 960, 0, 960, 1080, "Ảnh tư liệu: một đám cháy lớn, đám đông đứng xem", "Ảnh tư liệu một vụ cháy lớn · Wikimedia Commons, phạm vi công cộng"));
// 3 mục tiêu
const MT = [["Giải thích", "BHTM là chuyển giao rủi ro qua hợp đồng"], ["Trình bày, nhận diện", "các nguyên tắc của hoạt động BHTM"], ["Phân loại", "một sản phẩm theo pháp lý, kỹ thuật, đối tượng"], ["Phân biệt", "chủ thể, tài liệu, STBH – giá trị, phí, thời hạn"], ["Tính toán", "phần chia STBH, phí, bồi thường trong số thành và mức dôi"]];
mNoiDung("Mục tiêu chương", "Năm việc làm được sau buổi học", MT.map(([v, s], k) => { const y = 330 + k * 136; return `${vach(120, y, 1680)}${t("so-dong", 120, y + 30, 110, `0${k + 1}`)}${t("dong-t", 260, y + 38, 420, v)}${t("dong-m", 720, y + 40, 1080, s)}`; }).join(""), nc(3), { dan: "Từ hiểu khái niệm tới tự tính được hai bài tái bảo hiểm.", khongHinh: true });
// 4 kết cấu
const PH = [["01", "Khái niệm và nguyên tắc", "BHTM là gì; năm nguyên tắc; đối chiếu Điều 16 Luật", "17 phút"], ["02", "Phân loại", "Theo tính chất pháp lý, kỹ thuật, đối tượng", "7 phút"], ["03", "Hợp đồng bảo hiểm", "Chủ thể, tài liệu, STBH – giá trị, phí, thời hạn", "15 phút"], ["04", "Tái bảo hiểm", "Bốn loại tái bảo hiểm và Bài 11, Bài 12", "46 phút"]];
mNoiDung("Kết cấu chương 3", "Bốn phần của chương", PH.map(([so, ten, mo, tg], k) => { const y = 330 + k * 160; return `${vach(120, y, 1680)}${t("so-dong lon", 120, y + 28, 150, so)}${t("dong-t", 300, y + 32, 1000, ten)}${t("dong-m", 300, y + 84, 1100, mo)}${t("dong-gio", 1500, y + 36, 300, tg)}`; }).join("")
  + t("nguon", 120, 990, 1680, "Còn ≈ 35 phút: câu hỏi tức thì, đề tài nhóm, tổng kết, hỏi đáp."), nc(4), { dan: "Phần 4 dài nhất vì có hai bài tập tính tái bảo hiểm.", khongHinh: true });
// 5 mở phần 01
mMoPhan("01", "Khái niệm và nguyên tắc", "BHTM là gì, và năm nguyên tắc giữ cho nó vận hành được", nc(5),
  anh("mp01-bao.jpg", 960, 0, 960, 1080, "Tranh thuyền buôn gặp bão trên biển", "Ludolf Bakhuizen, Thuyền buôn Hà Lan gặp bão · phạm vi công cộng"));
// 6 lịch sử thế giới — 4 mốc + tranh quán cà phê Lloyd's
const LS = [["1347", "Genoa (Ý)", "hợp đồng bảo hiểm đầu tiên được biết"], ["1666", "Đại hoả hoạn London", "hơn 13.000 nhà cháy → 1680–81 văn phòng bảo hiểm hoả hoạn"], ["1688", "Quán cà phê Lloyd's", "chủ tàu, thương nhân mua bán bảo hiểm hàng hải"], ["1706", "Amicable Society", "công ty bảo hiểm nhân thọ đầu tiên"]];
mNoiDung("Sự ra đời · thế giới", "Bảo hiểm ra đời cùng thương mại châu Âu", LS.map(([y, a, b], k) => { const yy = 330 + k * 160; return `${vach(120, yy, 820)}${t("nam", 120, yy + 30, 200, y)}${cap("dong-t nho", "dong-m nho", 330, yy + 26, 610, a, b)}`; }).join("")
  + anh("lloyds.jpg", 1040, 330, 760, 569, "Tranh in quán cà phê Lloyd's, London") + t("nguon", 1040, 916, 760, "Quán cà phê Lloyd's, London · tranh in William Holland · phạm vi công cộng"), nc(6), { dan: "Bảo hiểm ra đời để chia rủi ro của buôn bán đường biển và hoả hoạn." });
// 7 lịch sử Việt Nam — trục 5 mốc
const VN = [["1964", "Công ty Bảo hiểm Việt Nam", "thành lập 17/12/1964, kinh doanh từ 15/01/1965"], ["1993", "Nghị định 100/CP", "ngày 18/12/1993 về kinh doanh bảo hiểm"], ["2001", "Luật KDBH 24/2000/QH10", "có hiệu lực 01/04/2001"], ["2023", "Luật KDBH 08/2022/QH15", "có hiệu lực 01/01/2023"], ["2026", "Luật 139/2025/QH15", "sửa đổi; hiệu lực 01/01/2026 (một số khoản 01/7/2026)"]];
mNoiDung("Sự ra đời · Việt Nam", "Từ công ty nhà nước tới thị trường có luật",
  hinh(duong("M120 600 H1800", M.xanh) + VN.map((_, k) => `<circle cx="${132 + k * 344}" cy="600" r="13" fill="${k >= 3 ? M.xanh : M.giay}" stroke="${M.xanh}" stroke-width="${NET}"/>`).join(""), 100, 570, 1720, 60, "Trục thời gian năm mốc, ba mốc cuối là luật hiện hành")
  + VN.map(([y, a, b], k) => { const x = 120 + k * 344; return `${t("nam", x, 470, 320, y)}${cap("dong-t nho", "dong-m nho", x, 645, 320, a, b)}`; }).join("") + t("nguon", 120, 960, 1680, "● chấm đặc: văn bản đang có hiệu lực"),
  nc(7), { dan: "Luật đang áp dụng: Luật KDBH 08/2022/QH15, sửa đổi, bổ sung bởi Luật 139/2025/QH15.", khongHinh: true });
// 8 khái niệm — sơ đồ hai bên, hai dòng tiền, điều kiện
mNoiDung("3.1 · Khái niệm", "BHTM: [chuyển rủi ro] qua hợp đồng",
  hinh(nut(420, 620, R1, "user") + nut(1500, 620, R1, "building-bank") + mui(585, 585, 1335, 585) + mui(1335, 690, 585, 690, { mau: M.do, dut: true })
    + duong("M960 812 V700", M.do, NET, true) + nut(960, 866, 54, "flame", { mau: M.do }), 260, 470, 1400, 470, "Bên mua trả phí cho doanh nghiệp bảo hiểm; doanh nghiệp bồi thường khi rủi ro đã thoả thuận xảy ra")
  + t("nhan-xanh", 660, 528, 600, "Phí bảo hiểm · luôn trả") + t("nhan-do", 600, 708, 330, "Bồi thường") + t("nhan-do", 610, 930, 700, "chỉ khi rủi ro đã thoả thuận xảy ra")
  + cap("la-t", "la-m", 220, 790, 400, "Bên mua bảo hiểm", "trả phí chắc chắn") + cap("la-t", "la-m", 1300, 790, 400, "Doanh nghiệp bảo hiểm", "cam kết bồi thường, trả tiền"),
  nc(8), { dan: "Bên mua trả phí chắc chắn; doanh nghiệp bảo hiểm cam kết bồi thường khi xảy ra rủi ro đã thoả thuận." });
// 9 số đông — lưới 10 × 10
{ let g = ""; for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) { const do_ = (r === 2 && c === 7) || (r === 7 && c === 3); g += `<circle cx="${166 + c * 54}" cy="${400 + r * 54}" r="17" fill="${do_ ? M.do : "none"}" stroke="${do_ ? M.do : M.xanh}" stroke-width="${NET}"/>`; }
  mNoiDung("3.1 · Nguyên tắc 1 · Số đông", "Số đông bù cho số ít", hinh(g, 130, 365, 560, 560, "Lưới 100 người cùng đóng phí; 2 người tô đỏ là người gặp rủi ro")
    + t("so-lon xanh", 780, 380, 420, "100") + t("chu", 780, 600, 420, "người cùng đóng phí vào quỹ") + t("so-lon do", 1254, 380, 300, "2") + t("chu", 1260, 600, 540, "người gặp rủi ro được bù từ quỹ")
    + vach(780, 730, 1020) + t("chu", 780, 760, 1020, "Ai cũng có thể là người gặp rủi ro, nên ai cũng góp phí."), nc(9), { dan: "Rủi ro của số ít được bù bằng tiền của rất nhiều người cùng đóng phí." }); }
// 10 rủi ro ngẫu nhiên — bảng kẻ ngang
mNoiDung("3.1 · Nguyên tắc 2 · Rủi ro bảo hiểm", "Chỉ bảo hiểm rủi ro ngẫu nhiên", tb("tb-ke", ["Sự kiện", "Nhận bảo hiểm?"], [["Nhà cháy do chập điện", ["co", "Có — bất ngờ"]], ["Chủ nhà cố ý đốt nhà", ["khong", "Không — cố ý"]], ["Xe bị đâm khi đang dừng đèn đỏ", ["co", "Có — ngoài ý muốn"]], ["Xe hao mòn theo thời gian", ["khong", "Không — chắc chắn xảy ra"]], ["Tàu gặp bão trên biển", ["co", "Có — bất ngờ"]], ["Kết luận", "Chỉ nhận rủi ro bất ngờ, không lường trước"]], 120, 330, 1680, "", ["", "", "", "", "", "ket"])
  + t("nguon", 120, 960, 1680, "Rủi ro phải bất ngờ, không lường trước được — khoản 5 Điều 16 Luật KDBH 2022."), nc(10), { dan: "Rủi ro xảy ra phải ngẫu nhiên, bất ngờ, ngoài ý muốn." });
// 11 quyền lợi — hai sơ đồ nhỏ đối chiếu
mNoiDung("3.1 · Nguyên tắc 3 · Quyền lợi bảo hiểm", "Phải có quyền lợi với đối tượng",
  hinh(nut(300, 570, R1, "user") + nut(700, 570, R1, "home") + mui(452, 570, 548, 570) + duong("M478 500 l14 14 l28 -28", M.xanh)
    + nut(1220, 570, R1, "user", { mau: M.phu }) + nut(1620, 570, R1, "home", { mau: M.phu }) + duong("M1372 570 H1468", M.do, NET, true) + duong("M1406 542 l28 28 M1434 542 l-28 28", M.do)
    + duong("M960 400 V940", M.ke, 2), 140, 390, 1640, 560, "Trái: chủ nhà có quyền lợi với nhà của mình. Phải: người lạ không có quyền lợi với nhà người khác")
  + cap("la-t", "la-m", 140, 740, 720, "Chủ nhà mua cho nhà của mình", "nhà cháy thì chính họ thiệt hại tài chính → được")
  + cap("la-t xam", "la-m", 1060, 740, 720, "Người lạ mua cho nhà người khác", "không có quyền lợi tài chính → không được"),
  nc(11), { dan: "Thiệt hại của đối tượng phải gây thiệt hại tài chính cho chính người mua." });
// 12 trung thực — trích luật + hai chiều nghĩa vụ
mNoiDung("3.1 · Nguyên tắc 4 · Trung thực tuyệt đối", "Trung thực: nghĩa vụ hai chiều",
  khoi("gach-doc", 120, 340, 8, 230) + t("trich", 164, 330, 1600, "“…các bên tham gia hợp đồng bảo hiểm phải cung cấp thông tin, thực hiện các quyền và nghĩa vụ một cách trung thực nhất, trên cơ sở tin tưởng tuyệt đối lẫn nhau…”") + t("nguon-xanh", 164, 588, 1400, "Khoản 1 Điều 16 Luật KDBH 08/2022/QH15")
  + ic("building-bank", 120, 680, 80) + cap("dong-t", "dong-m", 230, 682, 640, "Doanh nghiệp bảo hiểm", "soạn hợp đồng bảo đảm quyền lợi hai bên; giải thích điều kiện, điều khoản")
  + ic("user", 1000, 680, 80) + cap("dong-t", "dong-m", 1110, 682, 690, "Bên mua bảo hiểm", "khai đủ, trung thực về đối tượng, rủi ro, thiệt hại")
  + t("chu-do", 120, 930, 1680, "Cố ý khai sai hoặc giấu thông tin nhằm giao kết hợp đồng → bên kia có quyền huỷ bỏ (Điều 22 khoản 2, 3)."), nc(12), { dan: "Không chỉ người mua: DNBH cũng phải trung thực khi soạn và giải thích hợp đồng.", khongHinh: true });
// 13 phân tán — hai khu cùng thang
{ const nha = (x, y, chay) => `<path d="M${x} ${y + 16} L${x + 22} ${y} L${x + 44} ${y + 16} V${y + 42} H${x}Z" fill="none" stroke="${chay ? M.do : M.xanh}" stroke-width="${NET}" stroke-linejoin="round"/>`;
  let a = `<rect x="120" y="350" width="800" height="480" fill="none" stroke="${M.ke}" stroke-width="2"/><circle cx="520" cy="590" r="222" fill="none" stroke="${M.do}" stroke-width="${NET}" stroke-dasharray="12 9"/>`;
  let b = `<rect x="1000" y="350" width="800" height="480" fill="none" stroke="${M.ke}" stroke-width="2"/><circle cx="1170" cy="500" r="86" fill="none" stroke="${M.do}" stroke-width="${NET}" stroke-dasharray="12 9"/>`;
  for (let k = 0; k < 18; k++) a += nha(323 + (k % 6) * 70, 501 + Math.floor(k / 6) * 68, true);
  [[1110, 474, 1], [1178, 474, 1], [1380, 420], [1520, 400], [1660, 470], [1090, 640], [1250, 700], [1420, 600], [1560, 560], [1700, 640], [1330, 520], [1480, 720], [1620, 760], [1150, 760], [1300, 780], [1720, 400], [1060, 400], [1400, 760]].forEach(([x, y, c]) => { b += nha(x, y, c); });
  mNoiDung("3.1 · Nguyên tắc 5 · Phân tán rủi ro", "Phân tán để tổn thất không dồn", hinh(a + b, 110, 340, 1700, 500, "Mỗi ngôi nhà là một hợp đồng; vòng đỏ là một vụ cháy. Trái: dồn một khu, cháy trúng cả 18. Phải: rải nhiều nơi, cháy trúng 2")
    + t("so-vua do", 120, 856, 220, "18/18") + t("chu", 360, 874, 560, "Dồn một nơi: cháy trúng cả 18") + t("so-vua xanh", 1000, 856, 220, "2/18") + t("chu", 1240, 874, 560, "Rải nhiều nơi: chỉ cháy trúng 2")
    + t("nguon", 120, 980, 1680, "Mỗi ngôi nhà là một hợp đồng. Cách làm: mở rộng phạm vi, đa dạng hoá sản phẩm, tái bảo hiểm."), nc(13), { dan: "Rải hợp đồng ra nhiều nơi để một sự kiện không trúng tất cả." }); }
// 14 đối chiếu nghiệp vụ – luật
const NG = [["Số đông", ""], ["Rủi ro bảo hiểm", "Rủi ro ngẫu nhiên"], ["Quyền lợi bảo hiểm", "Quyền lợi có thể được bảo hiểm"], ["Trung thực tuyệt đối", "Trung thực tuyệt đối"], ["Phân tán rủi ro", ""], ["", "Bồi thường (không vượt thiệt hại thực tế)"], ["", "Thế quyền (chuyển quyền đòi bồi hoàn)"]];
mNoiDung("Đối chiếu · Luật KDBH 2022", "Nghiệp vụ và Luật: chỉ trùng ba",
  t("cot-dau", 120, 330, 760, "Nguyên tắc nghiệp vụ (giáo trình)") + t("cot-dau", 1040, 330, 760, "Điều 16 Luật: giao kết, thực hiện HĐ")
  + hinh(NG.map(([a, b], k) => a && b ? duong(`M880 ${430 + k * 82} H1040`, M.xanh) : "").join(""), 870, 400, 180, 600, "Đường nối ba nguyên tắc trùng nhau")
  + NG.map(([a, b], k) => { const y = 400 + k * 82, tr = a && b; return `${a ? `<div class="o ${tr ? "trung" : "mo"}" style="left:120px;top:${y}px;width:760px"><b data-t>${esc(a)}</b></div>` : ""}${b ? `<div class="o ${tr ? "trung" : "luat"}" style="left:1040px;top:${y}px;width:760px"><b data-t>${esc(b)}</b></div>` : ""}`; }).join("") + t("nhan-vang trai", 1040, 752, 760, "Luật có thêm"),
  nc(14), { dan: "Số đông, phân tán chỉ là nguyên tắc nghiệp vụ; Luật có thêm bồi thường và thế quyền.", khongHinh: true });
// 15 câu chốt — Điều 16
mCau("Thi luật: dùng [năm nguyên tắc của Điều 16]", "Năm nguyên tắc giáo trình là nguyên tắc nghiệp vụ — chỉ trùng ba nguyên tắc với Luật.", "Slide thở: chốt phân biệt nguyên tắc nghiệp vụ và nguyên tắc pháp lý (khoản 1–5 Điều 16 Luật KDBH 2022).", t("so-ma", 1100, 340, 700, "Đ16"), 900);
// 16 mở phần 02
mMoPhan("02", "Phân loại bảo hiểm thương mại", "Theo tính chất pháp lý, kỹ thuật bảo hiểm và đối tượng bảo hiểm", nc(15),
  anh("mp02-xe.jpg", 960, 0, 960, 1080, "Ảnh một chiếc ô tô đâm vào gốc cây", "Ảnh tai nạn xe · Wikimedia Commons, phạm vi công cộng"));
// 17 bắt buộc / tự nguyện
mNoiDung("3.2 · Theo tính chất pháp lý", "Bắt buộc do luật, tự nguyện do nhu cầu",
  tb("tb-ke tb-thoang", ["", "Bảo hiểm bắt buộc", "Bảo hiểm tự nguyện"], [["Vì sao có", "Bảo vệ lợi ích công cộng, môi trường, an toàn xã hội", "Tuỳ nhận thức và nhu cầu của người tham gia"], ["Gồm / ví dụ", "TNDS của chủ xe cơ giới · cháy, nổ · xây dựng · loại do luật khác quy định", "Nhân thọ, sức khoẻ, vật chất xe…"], ["Lưu ý", "DNBH được phép bán thì không được từ chối người mua đủ điều kiện", "—"]], 120, 340, 1680, 'data-cot="1-2-2"')
  + t("nguon", 120, 960, 1680, "Luật KDBH 08/2022/QH15: Điều 8 khoản 1 (vì sao có), khoản 2 (danh mục), khoản 4 (không được từ chối)."),
  nc(16), { dan: "Bắt buộc chỉ gồm các loại luật liệt kê; còn lại là tự nguyện." });
// 18 kỹ thuật
mNoiDung("3.2 · Theo kỹ thuật bảo hiểm", "Phân bổ chi ngay, dồn tích tích quỹ", tb("tb-ke", ["", "Kỹ thuật phân bổ", "Kỹ thuật dồn tích"], [["Thời hạn", "Ngắn", "Dài"], ["Loại rủi ro", "Tương đối độc lập với tuổi thọ", "Gắn liền tuổi thọ con người"], ["Dùng quỹ", "Có rủi ro thì chi trả luôn", "Tích tụ nhiều năm mới chi trả"], ["Ví dụ", "Bảo hiểm cháy nổ một năm", "Bảo hiểm nhân thọ 20 năm"]], 120, 340, 1680, 'data-cot="1-2-2"'), nc(17), { dan: "Khác nhau ở thời hạn và cách dùng quỹ phí: chi ngay hay tích luỹ nhiều năm." });
// 19 ba nhóm theo đối tượng
mNoiDung("3.2 · Theo đối tượng", "Bảo hiểm cái gì thì thuộc nhóm đó",
  hinh([["home", 390], ["heart", 960], ["scale", 1530]].map(([i, cx]) => nut(cx, 520, R1, i)).join(""), 210, 370, 1500, 300, "Ba biểu tượng: ngôi nhà (tài sản), trái tim (con người), cán cân (trách nhiệm dân sự)")
  + [["Bảo hiểm tài sản", "đối tượng là tài sản"], ["Bảo hiểm con người", "tuổi thọ, tính mạng, sức khoẻ, khả năng lao động"], ["Bảo hiểm TNDS", "trách nhiệm dân sự của người được BH với người thứ ba"]].map(([a, b], k) => `${cap("la-t", "la-m", 150 + k * 570, 700, 480, a, b)}`).join("")
  + t("nguon", 120, 940, 1680, "Luật hiện hành: 3 loại hình — nhân thọ, sức khoẻ, phi nhân thọ (Điều 7); 5 loại hợp đồng (Điều 15)."), nc(18), { dan: "Ba nhóm: tài sản, con người, trách nhiệm dân sự với người thứ ba." });
// 20 mở phần 03 — hình nét lớn
mMoPhan("03", "Hợp đồng bảo hiểm", "Khái niệm, tài liệu, chủ thể, các con số, phí và thời hạn", nc(19),
  anh("mp03-hop-dong.jpg", 960, 0, 960, 1080, "Mẫu hợp đồng bảo hiểm hoả hoạn của Philadelphia Fire and Life Insurance Co., khoảng 1840–1860", "Hợp đồng bảo hiểm hoả hoạn, Philadelphia, khoảng 1840–1860 · Thư viện Quốc hội Hoa Kỳ"));
// 21 định nghĩa — trích luật lớn
mNoiDung("3.3 · Khái niệm", "Hợp đồng bảo hiểm là gì",
  khoi("gach-doc", 120, 344, 8, 380) + `<div class="trich lon" data-t style="left:170px;top:330px;width:1460px">“Hợp đồng bảo hiểm là sự thoả thuận giữa bên mua bảo hiểm và doanh nghiệp bảo hiểm, …, theo đó bên mua bảo hiểm phải <u>đóng phí bảo hiểm</u>, doanh nghiệp bảo hiểm, … phải <u>bồi thường, trả tiền bảo hiểm</u> theo thỏa thuận trong hợp đồng.”</div>`
  + t("nguon-xanh", 170, 790, 1460, "Khoản 16 Điều 4 Luật KDBH 08/2022/QH15 · hợp đồng phải lập thành văn bản (Điều 18)"), nc(20), { dan: "Hai nghĩa vụ đối ứng: bên mua đóng phí — DNBH bồi thường, trả tiền.", khongHinh: true });
// 22 bảy tài liệu theo thời điểm dùng
const TL = [["file-description", "Trước khi ký", ["Bản mô tả quyền lợi BH", "Giấy yêu cầu BH"]], ["file-certificate", "Nội dung hợp đồng", ["Các điều kiện BH", "Điều kiện sửa đổi, bổ sung"]], ["receipt", "Chứng nhận và thu phí", ["Giấy chứng nhận BH tạm thời", "Giấy chứng nhận BH", "Thông báo thu phí, hoá đơn"]]];
{ let so = 0; mNoiDung("3.3 · Tài liệu liên quan", "Một hợp đồng gồm cả bộ bảy tài liệu",
  hinh(duong("M120 470 H1800", M.xanh) + TL.map((_, k) => `<circle cx="${148 + k * 580}" cy="470" r="13" fill="${M.giay}" stroke="${M.xanh}" stroke-width="${NET}"/>`).join(""), 100, 445, 1720, 50, "Trục ba giai đoạn dùng tài liệu")
  + TL.map(([i, nhom, ds], k) => { const x = 120 + k * 580; return `${ic(i, x, 340, 60)}${t("dong-t", x + 80, 350, 460, nhom)}` + ds.map((d, j) => { so++; return `${t("so-dong nho", x, 544 + j * 150, 80, `0${so}`)}${t("chu", x + 80, 550 + j * 150, 470, d)}`; }).join(""); }).join(""), nc(21), { dan: "Xếp theo lúc dùng: trước khi ký, nội dung hợp đồng, chứng nhận và thu phí.", khongHinh: true }); }
// 23 bốn chủ thể — sơ đồ quanh hợp đồng
mNoiDung("3.3 · Chủ thể", "Hai bên ký, bốn chủ thể liên quan",
  hinh(duong("M960 595 L600 430 M960 595 L1320 430 M960 595 L600 760 M960 595 L1320 760", M.phu, 2) + nut(960, 595, R1, "file-certificate") + nut(600, 430, R2, "building-bank") + nut(1320, 430, R2, "user") + nut(600, 760, R2, "user-check") + nut(1320, 760, R2, "gift"), 500, 335, 920, 520, "Hợp đồng ở giữa, nối với bốn chủ thể")
  + [["Doanh nghiệp bảo hiểm", "nhận phí; bồi thường, trả tiền", 0, 430], ["Bên mua bảo hiểm", "giao kết hợp đồng, đóng phí", 1, 430], ["Người được bảo hiểm", "có đối tượng được bảo hiểm", 0, 760], ["Người thụ hưởng", "được chỉ định nhận tiền bảo hiểm", 1, 760]].map(([a, b, p, y]) => `${t(p ? "la-t trai" : "la-t phai", p ? 1430 : 120, y - 62, 370, a)}${t(p ? "la-m trai" : "la-m phai", p ? 1430 : 120, y + 30, 370, b)}`).join("")
  + t("nguon", 120, 960, 1680, "Bên mua và người được BH có thể là hai người: bố mẹ (bên mua) mua BH nhân thọ cho con (người được BH)."), nc(22), { dan: "Bên mua ký với DNBH; người được bảo hiểm và người thụ hưởng có thể là người khác." });
// 24 nghĩa vụ DNBH — số lớn 15 ngày
mNoiDung("3.3 · Nghĩa vụ của DNBH", "Giải thích rõ, bồi thường đúng hạn",
  t("so-to", 104, 320, 560, "15") + t("don-vi", 120, 630, 560, "ngày") + t("chu-phu", 120, 730, 600, "Hạn bồi thường tối đa khi hợp đồng không thoả thuận khác, tính từ khi nhận đủ hồ sơ hợp lệ.")
  + [["file-certificate", "Khi giao kết", "giải thích rõ quyền lợi, điều khoản loại trừ, quyền và nghĩa vụ của bên mua (Điều 20 khoản 2 điểm b)"], ["calendar", "Khi xảy ra sự kiện bảo hiểm", "bồi thường, trả tiền đúng thời hạn thoả thuận (Điều 20 khoản 2 điểm đ; Điều 31 khoản 1)"], ["coins", "Chậm trả", "phải trả thêm lãi cho phần tiền chậm trả (Điều 31)"]].map(([i, a, b], k) => { const y = 340 + k * 200; return `${vach(820, y, 980)}${ic(i, 820, y + 30, 64)}${cap("dong-t xanh", "dong-m", 920, y + 30, 880, a, b)}`; }).join(""), nc(23), { dan: "Trả trong hạn thoả thuận, mặc định 15 ngày từ khi đủ hồ sơ; trả chậm phải chịu lãi.", khongHinh: true });
// 25 giá trị BH và số tiền BH — hai thanh cùng thang
mNoiDung("3.3 · Hai con số khác nhau", "Giá trị BH khác số tiền BH",
  hinh(nut(370, 630, 200, "home", { co: 230 }), 160, 420, 420, 420, "Ngôi nhà được bảo hiểm")
  + khoi("thanh", 720, 420, 1080, 64, `;background:${M.xanh}`) + cap("dong-t xanh", "dong-m", 720, 500, 1080, "Giá trị bảo hiểm · ví dụ 1 tỷ đồng", "giá trị của chính ngôi nhà (luật dùng: giá thị trường của tài sản)")
  + khoi("thanh", 720, 680, 648, 64, `;background:${M.vang}`) + cap("dong-t vang", "dong-m", 720, 760, 1080, "Số tiền bảo hiểm · ví dụ 600 triệu đồng", "ghi trong hợp đồng — mức tối đa DNBH phải trả"),
  nc(24), { dan: "Giá trị đo chính đối tượng; số tiền bảo hiểm đo giới hạn trách nhiệm của DNBH.", khongHinh: true });
// 26 bốn trường hợp
mNoiDung("3.3 · So STBH với giá trị", "Bốn trường hợp, bốn cách bồi thường", tb("tb-ke", ["Trường hợp", "Quan hệ STBH – giá trị", "Bồi thường"], [["Đúng giá trị", "STBH = giá trị", "theo thiệt hại thực tế (Đ16 k3)"], ["Dưới giá trị", "STBH < giá thị trường", "theo tỷ lệ STBH / giá thị trường (Đ48)"], ["Trên giá trị", "STBH > giá thị trường", "nếu vô ý: tối đa giá thị trường lúc xảy ra thiệt hại, hoàn phí phần vượt (Đ47)"], ["Bảo hiểm trùng", "≥ 2 HĐ cùng phạm vi, đối tượng, thời hạn, sự kiện; tổng STBH > giá thị trường", "chia theo tỷ lệ STBH từng HĐ, tổng ≤ thiệt hại (Đ49)"]], 120, 330, 1680, 'data-cot="1-2-2"', ["", "on"])
  + t("nguon", 120, 990, 1680, "Luật KDBH 08/2022/QH15, Điều 16, 47, 48, 49"), nc(25), { dan: "Ví dụ dưới giá trị: nhà 1 tỷ, STBH 600 triệu, thiệt hại 200 triệu → bồi thường 120 triệu." });
// 27 phí = công thức lớn
mNoiDung("3.3 · Phí bảo hiểm", "Phí gồm phí thuần và phụ phí",
  [["p", 470, "x"], ["=", 690, "v"], ["f", 910, "x"], ["+", 1130, "v"], ["d", 1350, "x"]].map(([c, x, k]) => t(`ct ${k}`, x, 330, 180, c)).join("")
  + [["phí bảo hiểm", "giá cả của sản phẩm bảo hiểm", 470], ["phí thuần", "chi trả, bồi thường tổn thất được bảo hiểm", 910], ["phụ phí", "chi phí hoạt động nghiệp vụ", 1350]].map(([a, b, x]) => `${cap("la-t", "la-m", x - 110, 640, 400, a, b)}`).join("")
  + vach(120, 860, 1680) + t("chu", 120, 890, 1680, "Luật (khoản 28 Điều 4): khoản tiền bên mua phải đóng, theo pháp luật hoặc theo thoả thuận."), nc(26), { dan: "Phí thuần để bồi thường; phụ phí để trang trải hoạt động nghiệp vụ.", khongHinh: true });
// 28 thời hạn — trục dày
mNoiDung("3.3 · Thời hạn bảo hiểm", "Thời hạn: từ hiệu lực tới hết trách nhiệm",
  hinh(duong("M140 600 H1780", M.phu, 2) + `<rect x="520" y="560" width="920" height="80" fill="${M.xanhNhat}" stroke="${M.xanh}" stroke-width="${NET}"/>` + [520, 1440].map((x) => `<circle cx="${x}" cy="600" r="15" fill="${M.xanh}"/>`).join("")
    + `<circle cx="800" cy="600" r="13" fill="${M.giay}" stroke="${M.xanh}" stroke-width="${NET}"/><circle cx="1650" cy="600" r="13" fill="${M.do}"/>` + duong("M800 545 V500", M.xanh, 2) + duong("M1650 585 V500", M.do, 2), 120, 470, 1680, 190, "Dải thời hạn từ hiệu lực tới kết thúc trách nhiệm; sự kiện trong dải được bồi thường, sau dải thì không")
  + t("nhan-xanh trai", 760, 430, 560, "Sự kiện trong thời hạn → bồi thường") + t("nhan-do trai", 1480, 430, 340, "Sau khi hết hạn → không") + t("bang-t", 960, 584, 460, "Thời hạn bảo hiểm")
  + cap("la-t", "la-m", 270, 680, 500, "Hiệu lực", "ký HĐ + DNBH chấp nhận + bên mua đã đóng phí") + t("la-t", 1190, 680, 500, "Kết thúc trách nhiệm")
  + t("nguon", 120, 920, 1680, "Định nghĩa của giáo trình. Luật chỉ yêu cầu hợp đồng ghi thời hạn và thời điểm có hiệu lực (Điều 17 khoản 1 điểm e)."), nc(27), { dan: "Chỉ sự kiện xảy ra trong thời hạn mới được bồi thường." });
// 30 mở phần 04 (bỏ slide thở trùng ý trước nó)
mMoPhan("04", "Tái bảo hiểm", "Doanh nghiệp bảo hiểm cũng chuyển bớt rủi ro — và hai bài tập tính", nc(28),
  anh("mp04-hartford.jpg", 960, 0, 960, 1080, "Tranh khắc trụ sở Hartford Fire Insurance Company", "Trụ sở Hartford Fire Insurance Company · tranh khắc · Thư viện Quốc hội Hoa Kỳ"));
// 31 tái bảo hiểm — chuỗi ba bên
mNoiDung("3.4 · Khái niệm", "Tái bảo hiểm: chuyển tiếp một phần rủi ro",
  hinh(nut(360, 600, R1, "user") + nut(960, 600, R1, "building-bank") + nut(1560, 600, R1, "building", { mau: M.vang }) + mui(505, 600, 815, 600) + mui(1105, 600, 1415, 600, { mau: M.vang }), 230, 460, 1460, 280, "Bên mua trả phí cho DNBH gốc; DNBH gốc chuyển một phần rủi ro và phí cho DN nhận tái")
  + t("nhan-xanh", 500, 540, 320, "Phí bảo hiểm") + t("nhan-vang", 1100, 520, 340, "Một phần rủi ro + phí")
  + t("la-t", 160, 750, 400, "Bên mua / người được BH") + t("la-t", 760, 750, 400, "DNBH gốc (nhượng tái)") + t("la-t vang", 1360, 750, 400, "DN nhận tái")
  + khoi("gach-doc", 120, 890, 8, 80) + t("dong-t xanh", 150, 900, 1650, "DNBH gốc vẫn chịu trách nhiệm duy nhất với bên mua, kể cả khi đã tái bảo hiểm (khoản 1 Điều 29)."),
  nc(29), { dan: "Một phần rủi ro đã nhận đối với đối tượng nhất định, kèm một phần phí đã nhận." });
// 32 ví dụ ba bước
mNoiDung("3.4 · Ví dụ", "DNBH A nhượng tái cho công ty B",
  hinh(nut(330, 610, R2, "user") + nut(960, 610, R2, "shield-check") + nut(1590, 610, R2, "arrows-split", { mau: M.vang }) + mui(440, 610, 850, 610) + mui(1070, 610, 1480, 610, { mau: M.vang }), 210, 490, 1500, 240, "Ba bước: anh X mua bảo hiểm, DNBH A nhận rủi ro, A nhượng một phần cho B")
  + [["01", "Anh X mua bảo hiểm tài sản", "đóng phí cho DNBH A"], ["02", "DNBH A nhận rủi ro", "cam kết bồi thường cho anh X"], ["03", "A nhượng một phần cho B", "kèm một phần phí; A vẫn chịu trách nhiệm với anh X"]].map(([so, a, b], k) => { const cx = 330 + k * 630; return `${t("so-dong giua", cx - 60, 430, 120, so)}${cap("la-t", "la-m", cx - 260, 730, 520, a, b)}`; }).join("") + t("nhan-xanh", 445, 560, 400, "đóng phí") + t("nhan-vang", 1075, 560, 400, "một phần rủi ro + phí"),
  nc(30), { dan: "A phân tán rủi ro, phòng khi sự kiện bảo hiểm xảy ra làm A khó khăn." });
// 33 cây phân loại
mNoiDung("3.4 · Các loại tái bảo hiểm", "Hai nhánh: tỷ lệ và phi tỷ lệ",
  hinh(duong("M960 440 V490 M540 490 H1380 M540 490 V540 M1380 490 V540 M540 640 V680 M330 680 H750 M330 680 V730 M750 680 V730 M1380 640 V680 M1170 680 H1590 M1170 680 V730 M1590 680 V730", M.phu, 2)
    + `<rect x="740" y="350" width="440" height="90" fill="${M.giay}" stroke="${M.xanh}" stroke-width="${NET}"/>` + duong("M400 630 H680 M1240 630 H1520", M.xanh), 300, 340, 1320, 400, "Cây: tái bảo hiểm chia hai nhánh tỷ lệ và phi tỷ lệ, mỗi nhánh hai loại")
  + t("cay-goc", 740, 372, 440, "Tái bảo hiểm") + t("cay-nhanh", 300, 562, 480, "Tái BH tỷ lệ") + t("cay-nhanh", 1140, 562, 480, "Tái BH phi tỷ lệ")
  + [["Số thành", "một tỷ lệ cố định cho STBH, phí, bồi thường", 330], ["Mức dôi", "nhận phần STBH vượt mức giữ lại, tính theo lần", 750], ["Vượt mức bồi thường", "trả phần tổn thất vượt ngưỡng tiền", 1170], ["Vượt mức tỷ lệ bồi thường", "trả khi tỷ lệ tổn thất cả kỳ vượt ngưỡng", 1590]].map(([a, b, cx]) => cap("la-t", "la-m", cx - 180, 750, 360, a, b)).join(""), nc(31), { dan: "Tỷ lệ chia theo số tiền bảo hiểm; phi tỷ lệ chia theo tổn thất." });
// 34 số thành — ba thanh cùng tỉ lệ
mNoiDung("3.4 · Tái bảo hiểm số thành", "Số thành: một tỷ lệ cho mọi thứ",
  t("nhan-xanh trai", 440, 350, 476, "DN nhượng giữ lại 35 %") + t("nhan-vang phai", 916, 350, 884, "DN nhận tái chịu 65 %")
  + ["STBH", "Phí bảo hiểm", "Bồi thường"].map((r, k) => { const y = 420 + k * 140; return `${t("dong-t", 120, y + 20, 300, r)}${khoi("thanh", 440, y, 476, 84, `;background:${M.xanh}`)}${khoi("thanh", 922, y, 878, 84, `;background:${M.vang}`)}`; }).join("")
  + t("nguon", 120, 880, 1680, "Tỷ lệ 35 / 65 là số liệu của Bài 11."), nc(32), { dan: "Tỷ lệ chốt ngay khi ký, áp như nhau cho STBH, phí và bồi thường.", khongHinh: true });
// 35 Bài 11
mNoiDung("Bài 11 · Tái bảo hiểm số thành", "Bài 11: chia theo tỷ lệ 35 / 65",
  t("cot-td", 120, 340, 560, "Đề bài") + t("chu", 120, 410, 560, "DNBH X tái bảo hiểm 5 nghiệp vụ hoả hoạn bằng một hợp đồng tái BH số thành: người nhượng giữ lại 35 %, người nhận tái chịu 65 %.") + t("chu-hoi", 120, 760, 560, "Hãy phân chia STBH, phí BH và trách nhiệm bồi thường?")
  + tb("tb-ke tb-so-phai", ["HĐ gốc", "Số tiền BH", "Phí BH", "Thiệt hại"], [["1", "10.000.000", "15.000", "8.000.000"], ["2", "8.000.000", "12.000", "4.000.000"], ["3", "7.000.000", "10.500", "3.200.000"], ["4", "4.000.000", "6.000", "2.500.000"], ["5", "1.700.000", "2.550", "500.000"]], 760, 340, 1040) + t("nguon", 760, 900, 1040, "Đơn vị: đồng"), nc(33), { dan: "Áp cùng tỷ lệ 35 / 65 cho STBH, phí và thiệt hại của từng hợp đồng.", khongHinh: true });
// 36 mức dôi — cột tỉ lệ
{ const day = 950, top = 360, H = day - top, st = 18000, y = (v) => day - (H * v) / st;
  mNoiDung("3.4 · Tái bảo hiểm mức dôi", "Mức dôi: tính theo “lần”",
    t("chu", 120, 340, 600, "Ví dụ: hợp đồng loại B, STBH 18.000, mức giữ lại 500 (nghìn USD) — số liệu lấy từ bài tập ở slide sau.") + t("cong", 120, 640, 600, "Mức tái = STBH − mức giữ lại")
    + hinh(`<rect x="820" y="${y(500)}" width="280" height="${day - y(500)}" fill="${M.xanh}"/><rect x="820" y="${y(8000)}" width="280" height="${y(500) - y(8000)}" fill="${M.vang}"/><rect x="820" y="${y(18000)}" width="280" height="${y(8000) - y(18000)}" fill="${M.xanhMo}"/>` + duong(`M780 ${day} H1140`, M.muc, 2) + [250, 4250, 13000].map((v) => duong(`M1100 ${y(v)} H1170`, M.phu, 2)).join(""), 770, 350, 410, 610, "Cột STBH 18.000: 500 giữ lại, 7.500 dôi thứ nhất, 10.000 dôi thứ hai")
    + t("so-cot", 820, y(13000) - 26, 280, "10.000") + t("so-cot sang", 820, y(4250) - 26, 280, "7.500")
    + t("dong-t xanh", 1190, y(250) - 22, 610, "Mức giữ lại: 1 lần = 500") + t("dong-t vang", 1190, y(4250) - 22, 610, "Dôi thứ nhất: tối đa 15 lần = 7.500") + t("dong-t", 1190, y(13000) - 22, 610, "Dôi thứ hai: tối đa 20 lần = 10.000"), nc(34), { dan: "Phần vượt mức giữ lại được tính bằng bội số (“lần”) của mức giữ lại.", khongHinh: true }); }
// 37 Bài 12
mNoiDung("Bài 12 · Tái bảo hiểm mức dôi", "Bài 12: sáu hợp đồng, ba loại rủi ro",
  t("cot-td", 120, 340, 560, "Đề bài") + t("chu", 120, 410, 560, "DNBH X tái BH 6 nghiệp vụ hoả hoạn bằng hợp đồng mức dôi. Mức giữ lại: A thông thường 1.000.000 USD · B công nghiệp 500.000 USD · C thương nghiệp 800.000 USD. Nhận tái: dôi thứ nhất 15 lần, dôi thứ hai 20 lần.") + t("chu-hoi", 120, 860, 560, "Hãy phân chia STBH, phí BH và trách nhiệm bồi thường?")
  + tb("tb-ke tb-so-phai", ["HĐ · loại", "STBH", "Phí BH", "Thiệt hại"], [["1 · A", "16.000", "16", "5.000"], ["2 · C", "10.000", "30", "8.000"], ["3 · A", "800", "0,8", "600"], ["4 · B", "18.000", "90", "13.000"], ["5 · C", "4.000", "12", "–"], ["6 · B", "7.000", "35", "2.000"]], 760, 340, 1040) + t("nguon", 760, 960, 1040, "Đơn vị: 1.000 USD"), nc(35), { dan: "Mỗi loại rủi ro có mức giữ lại riêng; dôi thứ nhất 15 lần, dôi thứ hai 20 lần.", khongHinh: true });
// 38 vượt mức bồi thường
mNoiDung("3.4 · Vượt mức bồi thường", "Vượt mức bồi thường: trả phần vượt",
  t("dong-t", 120, 420, 1680, "Một vụ tổn thất 6 triệu, hợp đồng “4 triệu vượt 1 triệu”:")
  + khoi("thanh", 120, 500, 276, 160, `;background:${M.xanh}`) + khoi("thanh", 402, 500, 1114, 160, `;background:${M.vang}`) + khoi("thanh", 1522, 500, 278, 160, `;background:${M.ke}`)
  + cap("dong-t xanh", "dong-m", 120, 700, 270, "1 triệu", "DN nhượng giữ lại") + cap("dong-t vang", "dong-m", 402, 700, 1000, "4 triệu (từ 1 tới 5 triệu)", "DN nhận tái trả") + cap("dong-t", "dong-m", 1522, 700, 278, "1 triệu vượt", "trở lại DN nhượng")
  + t("nguon", 120, 900, 1680, "Ngưỡng tính bằng số tiền, cho từng rủi ro hoặc từng sự kiện. Slide sau: ngưỡng là tỷ lệ tổn thất của cả kỳ."), nc(36), { dan: "DN nhận tái trả phần tổn thất vượt mức giữ lại, trong giới hạn đã thoả thuận.", khongHinh: true });
// 39 vượt mức tỷ lệ
mNoiDung("3.4 · Vượt mức tỷ lệ bồi thường", "Vượt mức tỷ lệ: tính theo cả kỳ",
  t("cong", 120, 340, 1680, "Tỷ lệ tổn thất = số tiền bồi thường / phí bảo hiểm × 100 %")
  + khoi("thanh", 120, 540, 1176, 140, `;background:${M.xanh}`) + khoi("thanh", 1302, 540, 246, 140, `;background:${M.vang}`) + khoi("thanh", 1554, 540, 246, 140, `;background:${M.ke}`)
  + hinh(duong("M1299 510 V710", M.muc) + duong("M1551 510 V710", M.muc), 1290, 505, 270, 210, "Vạch ngưỡng 70 % và 85 %")
  + t("nhan-den trai", 1180, 460, 240, "ngưỡng 70 %") + t("nhan-den trai", 1500, 460, 120, "85 %") + t("nhan-den phai", 1640, 460, 160, "100 %")
  + cap("dong-t xanh", "dong-m", 120, 730, 1100, "0 – 70 %", "DN nhượng tự bồi thường") + cap("dong-t vang", "dong-m", 1302, 730, 246, "70 – 85 %", "DN nhận tái trả") + cap("dong-t", "dong-m", 1554, 730, 246, "trên 85 %", "trở lại DN nhượng")
  + t("chu", 120, 920, 1680, "VD: phí cả kỳ 100, bồi thường 80 → tỷ lệ tổn thất 80 %: DN nhượng chịu 70, DN nhận tái trả [10]."), nc(37), { dan: "Ngưỡng tính trên tỷ lệ tổn thất của cả kỳ, không theo từng vụ.", khongHinh: true });
// 40 làm việc nhóm
mNoiDung("Làm việc nhóm", "Hai đề tài sau giờ học",
  hinh(nut(330, 520, R1, "file-text") + nut(1210, 520, R1, "chart-bar"), 170, 360, 1200, 320, "Hai biểu tượng: hồ sơ hợp đồng và biểu đồ thực trạng")
  + [["01", "Tìm một hợp đồng BHTM thực tế và nhận xét nội dung của hợp đồng", 120], ["02", "Thực trạng triển khai BHTM ở Việt Nam thời gian qua", 1000]].map(([so, a, x]) => `${t("so-dong lon", x, 720, 140, so)}${t("de-tai", x + 150, 714, 650, a)}`).join(""), nc(38), { dan: "Chọn một trong hai đề tài; nộp theo hướng dẫn của giảng viên." });
// 41–45 câu hỏi
const CH = [["Luật KDBH phân loại HĐBH theo tiêu chí nào?", ["Số tiền bảo hiểm", "Đối tượng bảo hiểm", "Thời hạn bảo hiểm", "Kỹ thuật bảo hiểm"]], ["DNBH có quyền nào?", ["Kiểm tra, giám sát việc thực hiện hợp đồng đại lý bảo hiểm", "Cho cán bộ, nhân viên làm đại lý cho chính DNBH đó", "Yêu cầu đại lý phải có hợp đồng bảo hiểm trước khi thành đại lý chính thức", "Cả A, B đều đúng"]], ["DNBH có nghĩa vụ gì?", ["Giải thích điều kiện, điều khoản BH; quyền, nghĩa vụ của bên mua", "Trả tiền BH kịp thời cho người thụ hưởng hoặc bồi thường cho người được BH", "Ứng tiền cho bên mua đóng phí hoặc giảm phí khi họ khó khăn tài chính", "Cả A và B đều đúng"]], ["Trung thực tuyệt đối áp cho ai?", ["Doanh nghiệp bảo hiểm", "Doanh nghiệp bảo hiểm và đại lý bảo hiểm", "Doanh nghiệp bảo hiểm và người tham gia bảo hiểm", "Doanh nghiệp bảo hiểm và người thụ hưởng"]], ["Điền vào chỗ trống", ["Công ty chứng khoán", "Công ty tài chính", "Doanh nghiệp bảo hiểm", "Ngân hàng thương mại"]]];
CH.forEach(([q, ds], k) => mHoi(k + 1, q, ds, nc(39 + k), k === 1 || k === 2 ? "Theo pháp luật hiện hành ở Việt Nam." : "", k === 4 ? "HĐBH là sự thoả thuận giữa bên mua BH và DNBH, theo đó bên mua BH phải đóng phí BH, ………… phải trả tiền BH cho người thụ hưởng hoặc bồi thường cho người được BH khi xảy ra sự kiện BH." : ""));
// 46 tổng kết
mCau("BHTM: [phí chắc chắn] đổi cam kết bồi thường", "Bốn phần đã đi qua, và hai bài tập tái bảo hiểm.", nc(44),
  [["bulb", "Khái niệm, năm nguyên tắc"], ["category", "Phân loại theo pháp lý, kỹ thuật, đối tượng"], ["file-certificate", "Hợp đồng: chủ thể, tài liệu, số tiền, phí, thời hạn"], ["arrows-split", "Tái bảo hiểm: số thành, mức dôi, vượt mức"]].map(([i, a], k) => { const y = 260 + k * 170; return `${t("tk-so", 1020, y, 100, `0${k + 1}`)}${ic(i, 1130, y + 2, 64, M.xanhMo)}${t("tk-dong", 1230, y + 10, 570, a)}`; }).join(""), 820);
// 47 kết — khép lại bằng chính hình bìa
mBia("Bảo hiểm thương mại · Chương 3", "", "Còn tiếp: Chương 4", "Hỏi đáp · đề tài nhóm nộp theo hướng dẫn của giảng viên", nc(45), "data-lap");

// =================== CSS — đúng bảng màu, một họ chữ có chân + một họ không chân ===================
ghi(path.join(D, "style.css"), `section.s{background:${M.giay};color:${M.muc};
  --tb-chu:${M.muc};--tb-nhan:${M.xanh};--tb-nhat:${M.xanhNhat};--tb-ke:${M.ke};--tb-nen:${M.giay};--tb-phu:${M.phu};--tb-co:${M.xanh};--tb-khong:${M.do}}
section.s.dam{background:${M.xanh};color:${M.giay}}
section.s > div, section.s > h1{position:absolute}
[data-t]{text-wrap:pretty}.td,.bia-td,.mp-t,.cau,.hoi-td{text-wrap:balance}
em{font-style:normal;color:${M.xanh}}.dam em{color:${M.vangSang}}
.kk{font:600 24px/1.3 'Be Vietnam Pro';letter-spacing:.14em;text-transform:uppercase;color:${M.xanh}}
.td{font:700 64px/1.12 'Lora'}
.dan{font:400 30px/1.45 'Be Vietnam Pro';color:${M.phu}}
.vach{height:2px;background:${M.ke}}.gach{background:${M.xanh}}.gach-doc{background:${M.vang}}
.bia-chuong{font:700 44px/1.2 'Lora';color:${M.vang}}.bia-td{position:absolute;font:700 120px/1.08 'Lora';color:${M.muc}}.bia-by{font:500 28px/1.4 'Be Vietnam Pro';color:${M.phu}}
.chu-anh{font:500 24px/1.35 'Be Vietnam Pro';color:${M.giay};background:${M.xanh};padding:6px 14px;width:auto !important}
.mp-so{font:700 220px/1 'Lora';color:${M.vangSang}}.mp-t{position:absolute;font:700 88px/1.1 'Lora';color:${M.giay}}.mp-m{font:400 32px/1.45 'Be Vietnam Pro';color:${M.xanhMo}}
.cau{position:absolute;font:700 80px/1.15 'Lora';color:${M.giay}}.cau-phu{font:400 32px/1.45 'Be Vietnam Pro';color:${M.xanhMo}}
.cau-khoi{display:flex;flex-direction:column;justify-content:center}.cau-khoi > .cau{position:static;margin:0}.cau-khoi > .cau-phu{margin-top:36px;max-width:1200px}
.so-ma{font:700 300px/1 'Lora';color:${M.vangSang};text-align:right}
.tk-so{font:700 48px/1 'Lora';color:${M.vangSang}}.tk-dong{font:600 32px/1.35 'Be Vietnam Pro';color:${M.giay}}
.so-dong{font:700 56px/1 'Lora';color:${M.vang}}.so-dong.lon{font-size:72px}.so-dong.nho{font-size:40px}.so-dong.giua{text-align:center}
.dong-t{font:600 34px/1.3 'Be Vietnam Pro';color:${M.muc}}.dong-t.nho{font-size:30px}.dong-t.xanh{color:${M.xanh}}.dong-t.vang{color:${M.vang}}
.dong-m{font:400 30px/1.45 'Be Vietnam Pro';color:${M.phu}}.dong-m.nho{font-size:28px}
.dong-gio{font:600 30px/1.3 'Be Vietnam Pro';color:${M.xanh};text-align:right}
.nam{font:700 64px/1 'Lora';color:${M.vang}}
.chu{font:400 32px/1.45 'Be Vietnam Pro';color:${M.muc}}.chu-phu{font:400 30px/1.45 'Be Vietnam Pro';color:${M.phu}}.chu-do{font:700 32px/1.4 'Be Vietnam Pro';color:${M.do}}.chu-hoi{font:700 32px/1.4 'Be Vietnam Pro';color:${M.xanh}}
.nguon{font:400 26px/1.4 'Be Vietnam Pro';color:${M.phu}}.nguon-xanh{font:600 26px/1.4 'Be Vietnam Pro';color:${M.xanh}}
.nhan-xanh,.nhan-do,.nhan-vang,.nhan-den{font:700 30px/1.3 'Be Vietnam Pro';text-align:center}.nhan-xanh{color:${M.xanh}}.nhan-do{color:${M.do}}.nhan-vang{color:${M.vang}}.nhan-den{color:${M.muc}}
.cap > b,.cap > span{display:block}.cap > span{margin-top:8px}
.trai{text-align:left !important}.phai{text-align:right !important}
.la-t{font:700 32px/1.3 'Be Vietnam Pro';color:${M.xanh};text-align:center}.la-t.xam{color:${M.phu}}.la-t.vang{color:${M.vang}}
.la-m{font:400 28px/1.4 'Be Vietnam Pro';color:${M.phu};text-align:center}
.so-lon{font:700 200px/1 'Lora'}.so-lon.xanh,.so-vua.xanh{color:${M.xanh}}.so-lon.do,.so-vua.do{color:${M.do}}.so-vua{font:700 72px/1 'Lora'}
.so-to{font:700 300px/0.9 'Lora';color:${M.xanh}}.don-vi{font:700 64px/1 'Lora';color:${M.vang}}
.trich{font:700 44px/1.45 'Lora';color:${M.muc}}.trich.lon{font-size:46px}.trich u{text-decoration:none;color:${M.xanh}}
.cot-dau{font:700 30px/1.3 'Be Vietnam Pro';color:${M.muc}}.cot-td{font:700 44px/1.2 'Lora';color:${M.xanh}}
.o{position:absolute;padding:14px 20px;border-bottom:2px solid ${M.ke}}.o b{font:600 30px/1.3 'Be Vietnam Pro'}.o.trung{background:${M.xanhNhat}}.o.trung b{color:${M.xanh};font-weight:700}.o.mo b{color:${M.phu};font-weight:400}.o.luat b{color:${M.vang};font-weight:700}
.de-tai{font:700 40px/1.25 'Lora';color:${M.muc}}
.cong{font:700 40px/1.3 'Lora';color:${M.xanh}}
.ct{font:700 240px/1 'Lora';text-align:center}.ct.x{color:${M.xanh}}.ct.v{color:${M.vang}}
.bang-t{font:700 30px/1.3 'Be Vietnam Pro';color:${M.xanh};text-align:center}
.cay-goc{font:700 40px/1.2 'Lora';color:${M.xanh};text-align:center}.cay-nhanh{font:700 40px/1.2 'Lora';color:${M.muc};text-align:center}
.so-cot{font:700 40px/1.2 'Lora';color:${M.muc};text-align:center}.so-cot.sang{color:${M.giay}}
.panel-dam{background:${M.xanh}}
.hoi-kk{font:600 24px/1.3 'Be Vietnam Pro';letter-spacing:.14em;text-transform:uppercase;color:${M.xanhMo}}.hoi-so{font:700 200px/1 'Lora';color:${M.vangSang}}
.hoi-td{position:absolute;font:700 56px/1.15 'Lora';color:${M.muc}}.hoi-td.dien{font-size:40px;line-height:1.4}
.pa-chu{font:700 56px/1 'Lora';color:${M.vang}}.pa-t{font:500 34px/1.35 'Be Vietnam Pro';color:${M.muc}}
section.s .tb{font-size:28px}section.s .tb .tb-h > b{font:700 30px/1.3 'Be Vietnam Pro';letter-spacing:0;color:${M.xanh}}
.tb-thoang{font-size:30px}.tb-thoang .tb-r > b{padding:30px 24px}
.tb .co{color:${M.xanh};font-weight:800}.tb .khong{color:${M.do};font-weight:800}.tb-r.ket > b{background:${M.xanhNhat};color:${M.xanh};font-weight:700}.tb-r.on > b{background:${M.xanhNhat} !important}
`);
fs.rmSync(path.join(D, "slides"), { recursive: true, force: true });
S.forEach((h, k) => ghi(path.join(D, "slides", `${String(k + 1).padStart(2, "0")}.html`), h));
console.log(`${S.length} slide, ${nH} hình nét`);
