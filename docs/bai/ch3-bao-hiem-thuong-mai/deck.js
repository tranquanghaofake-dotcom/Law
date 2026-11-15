// Deck Chương 3 — dựng theo thiet-ke/he-thong.md (lưới 12 cột, 4 cỡ chữ, màu theo bên, 11 kiểu slide) và thiet-ke/nhip.md (47 slide).
// Nội dung: kich-ban.md + noi-dung.md (đã đối chiếu luật). Ghi chú người nói lấy từ bản trước (notes-cu.json, đã duyệt).
//   node deck.js && node <skill>/scripts/dung.js . --ten=bao-hiem-thuong-mai
const fs = require("fs"), path = require("path");
const T = require("./asset/ve_thuc.js");
const D = __dirname, N = require("./notes-cu.json");
const SUA = { 22: "Định nghĩa theo Điều 4 Luật 2022: khoản 24 bên mua bảo hiểm, khoản 25 người được bảo hiểm, khoản 26 người thụ hưởng. Bên mua và người được bảo hiểm có thể là hai người: bố mẹ (bên mua) mua bảo hiểm nhân thọ cho con (người được bảo hiểm). Tự mua cho mình thì một người giữ cả hai vai. Ví dụ do người soạn thêm.",
  26: "p = f + d theo bài giảng. Định nghĩa phí bảo hiểm theo khoản 28 Điều 4 Luật 2022.",
  37: "Con số 70 %, 85 %, phí 100 / bồi thường 80 chỉ minh hoạ (người soạn thêm). Thanh tính trên phí cả kỳ = 100 %; giới hạn trách nhiệm của DN nhận tái tới 85 %, phần trên 85 % trở lại DN nhượng. Bài giảng: công ty nhượng tái chịu bồi thường khi tỷ lệ bồi thường của toàn bộ nghiệp vụ nhỏ hơn hoặc bằng tỷ lệ nhất định; phần tỷ lệ thực tế vượt tỷ lệ giữ lại chuyển cho công ty nhận tái.",
};
const nc = (k) => SUA[k] || N[k] || "";
const ghi = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
const C = { mua: "2E6DA4", dn: "0F5C55", nhan: "8A5A2B", do: "B0302A", vang: "E8A33D", vangDam: "9A6410", muc: "1D2B2A", phu: "4A5856", xam: "D9D2C5" };
const P = { ink: C.muc, acc: C.dn, gold: C.vang, bad: C.do };

// ---------- asset (vẽ một lần, dùng theo vai) ----------
// phong cách B "phẳng 2 tông" (Hào chọn 15/11/2026) — asset/ve_phang.js, thẻ thiet-ke/phong-cach.json
const VP = require("./asset/ve_phang.js").VE;
const AS = { toa: VP.toa(), toaNhan: VP.toaNhan(), nha: VP.nha(), nhaChay: VP.nhaChay() };
for (const [k, v] of Object.entries(AS)) ghi(path.join(D, "asset", k + ".svg"), v);
let nVe = 0; const ve = (b, vb = "0 0 1920 1080") => { const f = `ve-${++nVe}.svg`; ghi(path.join(D, "asset", f), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${b}</svg>`); return `asset/${f}`; };

// ---------- khối HTML ----------
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const em = (s) => esc(s).replace(/\[([^\]]+)\]/g, "<em>$1</em>");
const t = (cls, x, y, w, s, ex = "") => `<div class="${cls}" data-t ${ex} style="left:${x}px;top:${y}px;width:${w}px">${em(s)}</div>`;
// nhân vật Open Peeps (asset/nv-*.svg, scripts/nhan_vat.js của skill): khung cao gấp đôi bề ngang → quy đổi để cao bằng hình người cũ cùng chỗ
const NV = { nguoi: "nv-ban-mua", nguoiDung: "nv-chu-nha", nu: "nv-nguoi-la" };
const img = (f, alt, x, y, w) => { if (NV[f]) f = NV[f]; if (f.startsWith("nv-")) { const w2 = Math.round(w * 0.45); x += Math.round((w - w2) / 2); w = w2; }
  return `<img data-l="${f}-${x}-${y}" data-alt="${esc(alt)}" src="asset/${f}.svg" style="position:absolute;left:${x}px;top:${y}px;width:${w}px">`; };
const lop = (src, alt) => `<img data-l="${path.basename(src, ".svg")}" data-alt="${esc(alt)}" src="${src}" style="position:absolute;left:0;top:0;width:1920px">`;
const khoi = (x, y, w, a, b, cls = "") => `<div class="khoi ${cls}" style="left:${x}px;top:${y}px;width:${w}px"><b data-t>${em(a)}</b>${b ? `<span data-t>${em(b)}</span>` : ""}</div>`;
const chip = (x, y, w, c, a, b) => `<div class="chip" style="left:${x}px;top:${y}px;width:${w}px;border-color:#${c}"><b data-t style="color:#${c}">${em(a)}</b>${b ? `<span data-t>${em(b)}</span>` : ""}</div>`;
const vach = (x, y, w) => `<div class="vach" style="left:${x}px;top:${y}px;width:${w}px"></div>`;
const muiTen = (x1, y1, x2, y2, c, dut) => { const g = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI; return `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#${c}" stroke-width="6" stroke-linecap="round" ${dut ? 'stroke-dasharray="18 12"' : ""}/><path d="M0 0 l-24 -12 l0 24Z" fill="#${c}" transform="translate(${x2} ${y2}) rotate(${g.toFixed(1)})"/>`; };
const S = [];
const sl = (kk, td, body, notes, { dan, cls = "", rong = 1680 } = {}) => S.push(`<section class="s ${cls}" data-trans="fade" data-notes="${esc(notes)}">${t("kk", 120, 96, 1200, kk)}${t("td", 120, 136, rong, td, "data-tieu-de")}${dan ? t("dan", 120, 228, 1500, dan) : ""}\n${body}</section>`);
const tho = (cau, phu, notes, hinh = "") => S.push(`<section class="s" data-trans="fade" data-notes="${esc(notes)}"><h1 class="tho" data-t data-tieu-de style="left:120px;top:330px;width:${hinh ? 1060 : 1500}px">${em(cau)}</h1>${phu ? t("tho-phu", 120, 620, 1000, phu) : ""}${hinh}</section>`);
const chuong = (so, ten, mo, notes) => S.push(`<section class="s nen-dao" data-trans="fade" data-notes="${esc(notes)}">${t("ch-so", 120, 260, 600, so)}<h1 class="ch-t" data-t data-tieu-de style="left:120px;top:520px;width:1500px">${esc(ten)}</h1>${t("ch-m", 120, 660, 1200, mo)}</section>`);
const truc = (y, x0 = 120, w = 1680) => `<div class="truc" style="left:${x0}px;top:${y}px;width:${w}px"></div>`;
const moc = (x, y, dam) => `<div class="moc ${dam ? "dam" : ""}" style="left:${x - 15}px;top:${y - 12}px"></div>`;
const bang = (cols, rows, x, y, w, cls = "", on = -1, kieu = "T3") => `<div class="bang ${cls}" data-bang="${kieu}" style="left:${x}px;top:${y}px;width:${w}px"><div class="h">${cols.map((c) => `<b data-t>${esc(c)}</b>`).join("")}</div>${rows.map((r, k) => `<div class="r ${k === on ? "on" : ""}">${r.map((c, j) => `<b data-t class="${j ? (c === "Có" ? "co" : c === "Không" ? "khong" : "") : "dau"}">${esc(c)}</b>`).join("")}</div>`).join("")}</div>`;
// bảng bằng bộ thành phần hinh/bang.css của skill: tb(biến thể, mã kiểu, cột, hàng, x, y, w, thêm thuộc tính, lớp từng hàng)
const tb = (bt, kieu, cols, rows, x, y, w, ex = "", lopHang = []) => `<div class="tb ${bt}" data-bang="${kieu}" ${ex} style="left:${x}px;top:${y}px;width:${w}px"><div class="tb-h">${cols.map((c) => `<b data-t>${esc(c)}</b>`).join("")}</div>${rows.map((rw, k) => `<div class="tb-r ${lopHang[k] || ""}">${rw.map((c) => { const [cls, txt] = Array.isArray(c) ? c : ["", c]; return `<b data-t class="${cls}">${esc(txt)}</b>`; }).join("")}</div>`).join("")}</div>`;
const nguoiNho = (x, y, c) => `<circle cx="${x}" cy="${y - 22}" r="9" fill="#${c}"/><path d="M${x - 13} ${y + 8} Q${x - 13} ${y - 10} ${x} ${y - 10} Q${x + 13} ${y - 10} ${x + 13} ${y + 8}Z" fill="#${c}"/>`;
const ck = (ok) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">${ok ? `<circle cx="30" cy="30" r="28" fill="#${C.dn}"/><path d="M17 31 l9 9 l17 -19" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/>` : `<circle cx="30" cy="30" r="28" fill="#${C.do}"/><path d="M20 20 l20 20 M40 20 l-20 20" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`}</svg>`;
ghi(path.join(D, "asset", "co.svg"), ck(true)); ghi(path.join(D, "asset", "khong.svg"), ck(false));
const dau = (ok, x, y, k) => `<img data-l="dau-${x}-${y}-${k}" data-alt="${ok ? "Được" : "Không được"}" src="asset/${ok ? "co" : "khong"}.svg" style="position:absolute;left:${x}px;top:${y}px;width:48px">`;
const hopDong = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFDF8"/><stop offset="1" stop-color="#EDE5D6"/></linearGradient><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter></defs>
<ellipse cx="124" cy="222" rx="92" ry="10" fill="#000" opacity=".22" filter="url(#b)"/><g transform="rotate(-6 120 120)"><rect x="52" y="22" width="140" height="190" rx="4" fill="#E2D8C6"/><rect x="46" y="16" width="140" height="190" rx="4" fill="url(#g)" stroke="#CFC3AE"/>
<rect x="62" y="34" width="70" height="8" rx="3" fill="#0F5C55"/>${[0, 1, 2, 3, 4, 5, 6].map((k) => `<rect x="62" y="${56 + k * 14}" width="${100 - (k % 3) * 14}" height="5" rx="2.5" fill="#B9B2A4"/>`).join("")}
<circle cx="150" cy="168" r="17" fill="none" stroke="#B0302A" stroke-width="3" opacity=".8"/><path d="M64 176 q10 -14 18 -2 q8 12 16 -4 q6 -10 14 2" fill="none" stroke="#1E3A5F" stroke-width="2.4" stroke-linecap="round"/></g>
<g transform="rotate(32 190 150)"><rect x="184" y="80" width="12" height="96" rx="5" fill="#1D2B2A"/><path d="M184 176 L190 196 L196 176Z" fill="#E8A33D"/></g></svg>`;
ghi(path.join(D, "asset", "hopDong.svg"), VP.hopDong());
// ---- hoạ tiết nền N1 (references/he-nen.md): 4 hoạ tiết nhạt, đổi góc mỗi slide ----
const TT = {
  "tt-giay": `<g transform="rotate(-8 200 150)"><rect x="60" y="30" width="300" height="240" rx="6" fill="#E9DFCB"/><rect x="60" y="30" width="300" height="34" rx="6" fill="#D9CBB0"/>${[0, 1, 2, 3, 4, 5].map((k) => `<rect x="84" y="${90 + k * 26}" width="${220 - (k % 3) * 40}" height="7" rx="3.5" fill="#D6C8AD"/>`).join("")}</g>`,
  "tt-cham": [0, 1, 2, 3, 4, 5, 6].map((c) => [0, 1, 2, 3, 4].map((h) => `<circle cx="${50 + c * 50}" cy="${50 + h * 50}" r="7" fill="#CFC0A3"/>`).join("")).join(""),
  "tt-khoi": `<rect x="70" y="40" width="250" height="170" rx="40" fill="#E6DAC4"/><rect x="170" y="120" width="190" height="150" rx="36" fill="#0F5C55" opacity=".16"/>`,
  "tt-luon": [0, 1, 2, 3].map((k) => `<path d="M20 ${90 + k * 40} C120 ${40 + k * 40} 220 ${150 + k * 40} 380 ${80 + k * 40}" stroke="#CDBE9F" stroke-width="7" fill="none" stroke-linecap="round"/>`).join(""),
};
for (const [k, v] of Object.entries(TT)) ghi(path.join(D, "asset", k + ".svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">${v}</svg>`);
// ---- bộ biểu tượng phần 4 (cùng nét, cùng cỡ) ----
const BT = {
  "bt-mua": `<circle cx="100" cy="100" r="92" fill="#E3ECF5"/><circle cx="82" cy="72" r="22" fill="#2E6DA4"/><path d="M44 150 Q44 104 82 104 Q120 104 120 150Z" fill="#2E6DA4"/><rect x="112" y="84" width="48" height="62" rx="5" fill="#fff" stroke="#2E6DA4" stroke-width="5"/><path d="M122 102 h28 M122 116 h28 M122 130 h18" stroke="#2E6DA4" stroke-width="5" stroke-linecap="round"/>`,
  "bt-nhan": `<circle cx="100" cy="100" r="92" fill="#DDEBE8"/><path d="M100 36 L152 56 V100 Q152 142 100 166 Q48 142 48 100 V56Z" fill="#0F5C55"/><path d="M76 100 l16 16 l32 -34" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  "bt-chia": `<circle cx="100" cy="100" r="92" fill="#F1E7DA"/><path d="M40 100 H92" stroke="#0F5C55" stroke-width="14" stroke-linecap="round"/><path d="M92 100 C116 100 120 64 146 64" stroke="#0F5C55" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M92 100 C116 100 120 136 146 136" stroke="#8A5A2B" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M140 48 l24 16 l-24 16Z" fill="#0F5C55"/><path d="M140 120 l24 16 l-24 16Z" fill="#8A5A2B"/>`,
};
for (const [k, v] of Object.entries(BT)) ghi(path.join(D, "asset", k + ".svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${v}</svg>`);
const xe = (v1, v2, tx, flip) => `<g transform="translate(${tx} 0)${flip ? " translate(240 0) scale(-1 1)" : ""}"><ellipse cx="120" cy="140" rx="100" ry="12" fill="#000" opacity=".2" filter="url(#bd)"/><path d="M24 112 Q22 86 46 82 L78 80 L104 52 Q112 44 128 44 L168 44 Q182 44 190 56 L206 80 Q226 84 226 104 L226 116 Q226 122 218 122 L30 122 Q24 122 24 112Z" fill="${v1}"/><path d="M110 58 Q114 52 124 52 L144 52 L144 80 L92 80Z" fill="#BFD9E1"/><path d="M152 52 L168 52 Q176 52 182 60 L196 80 L152 80Z" fill="#BFD9E1"/><path d="M40 92 L220 92" stroke="#fff" stroke-opacity=".35" stroke-width="3"/>${[66, 182].map((x) => `<circle cx="${x}" cy="122" r="22" fill="#1E2224"/><circle cx="${x}" cy="122" r="11" fill="#9AA3A8"/>`).join("")}<path d="M24 104 L30 98" stroke="${v2}" stroke-width="4"/></g>`;
ghi(path.join(D, "asset", "vaCham.svg"), VP.vaCham());

// =================== 47 SLIDE ===================
// 1 bìa
S.push(`<section class="s" data-trans="fade" data-notes="${esc(nc(1))}"><div class="khoi-xanh"></div>${t("bia-kk", 120, 300, 560, "BNK405 · Nghiệp vụ bảo hiểm")}${t("bia-so", 120, 360, 560, "Chương 3")}
<h1 class="bia-td" data-t data-tieu-de style="left:116px;top:470px;width:600px">Bảo hiểm thương mại</h1>${t("bia-by", 120, 900, 560, "GV Nguyễn Thị Thu Hằng · 120 phút")}${img("hopDong", "Tờ hợp đồng bảo hiểm có chữ ký, con dấu", 960, 170, 780)}</section>`);
// 2 thở — đặt vấn đề
tho("Một vụ cháy có thể lấy đi [tài sản cả đời]", "Xác suất nhỏ, hậu quả lớn — nhiều người cùng chia thì gánh được.", nc(2), img("nhaChay", "Ngôi nhà đang cháy", 1220, 300, 600));
// 3 mục tiêu — 5 dòng đánh số, kẻ mảnh
const MT = [["Giải thích", "BHTM là chuyển giao rủi ro qua hợp đồng"], ["Trình bày, nhận diện", "các nguyên tắc của hoạt động BHTM"], ["Phân loại", "một sản phẩm theo pháp lý, kỹ thuật, đối tượng"], ["Phân biệt", "chủ thể, tài liệu, STBH – giá trị, phí, thời hạn"], ["Tính toán", "phần chia STBH, phí, bồi thường trong số thành và mức dôi"]];
sl("Mục tiêu chương", "Năm việc làm được sau buổi học", MT.map(([v, s], k) => { const y = 330 + k * 136; return `${vach(120, y, 1680)}${t("so-nho", 120, y + 34, 100, `0${k + 1}`)}${t("mt-v", 240, y + 30, 460, v)}${t("mt-s", 720, y + 34, 1080, s)}`; }).join(""), nc(3));
// 4 mục lục 2×2
const PH = [["01", "Khái niệm và nguyên tắc", "BHTM là gì; năm nguyên tắc; đối chiếu Điều 16 Luật", "17 phút"], ["02", "Phân loại", "Theo tính chất pháp lý, kỹ thuật, đối tượng", "7 phút"], ["03", "Hợp đồng bảo hiểm", "Chủ thể, tài liệu, STBH – giá trị, phí, thời hạn", "15 phút"], ["04", "Tái bảo hiểm", "Bốn loại tái bảo hiểm và Bài 11, Bài 12", "46 phút"]];
sl("Kết cấu chương 3", "Bốn phần của chương", PH.map(([so, ten, mo, tg], k) => { const x = 120 + (k % 2) * 860, y = 330 + Math.floor(k / 2) * 330;
  return `${vach(x, y, 820)}${t("ml-so", x, y + 28, 160, so)}${t("ml-t", x + 180, y + 40, 640, ten)}${t("ml-m", x + 180, y + 110, 640, mo)}${t("ml-g", x + 180, y + 232, 640, tg)}`; }).join("") + t("chu", 120, 990, 1680, "Còn ≈ 35 phút: câu hỏi tức thì, đề tài nhóm, tổng kết, hỏi đáp."), nc(4));
// 5 chương 01
chuong("01", "Khái niệm và nguyên tắc", "BHTM là gì, và năm nguyên tắc giữ cho nó vận hành được", nc(5));
// 6 trục thời gian thế giới
const LS = [["1347", "Genoa (Ý)", "hợp đồng bảo hiểm đầu tiên được biết"], ["1666", "Đại hoả hoạn London", "hơn 13.000 nhà cháy → 1680–81 văn phòng bảo hiểm hoả hoạn"], ["1688", "Quán cà phê Lloyd's", "chủ tàu, thương nhân mua bán bảo hiểm hàng hải"], ["1706", "Amicable Society", "công ty bảo hiểm nhân thọ đầu tiên"]];
sl("Sự ra đời · thế giới", "Bảo hiểm ra đời cùng thương mại châu Âu", `<img data-l="anh-fire" data-alt="Tranh Đại hoả hoạn London 1666, khoảng 1675, khuyết danh" src="anh/fire-duotone.jpg" style="position:absolute;left:1100px;top:0;width:820px;height:1080px">${t("chu-anh", 1140, 990, 740, "Đại hoả hoạn London 1666 · tranh khoảng 1675 · Wikimedia Commons, phạm vi công cộng")}` + LS.map(([y, a, b], k) => { const yy = 330 + k * 165; return `${vach(120, yy, 900)}${t("nam-nho", 120, yy + 26, 210, y)}${t("moc-t", 350, yy + 24, 670, a)}${t("moc-s", 350, yy + 70, 670, b)}`; }).join(""), nc(6), { rong: 900 });
// 7 trục thời gian Việt Nam
const VN = [["1964", "Công ty Bảo hiểm Việt Nam", "thành lập 17/12/1964, kinh doanh từ 15/01/1965"], ["1993", "Nghị định 100/CP", "ngày 18/12/1993 về kinh doanh bảo hiểm"], ["2001", "Luật KDBH 24/2000/QH10", "có hiệu lực 01/04/2001"], ["2023", "Luật KDBH 08/2022/QH15", "có hiệu lực 01/01/2023"], ["2026", "Luật 139/2025/QH15", "sửa đổi; hiệu lực 01/01/2026 (một số khoản 01/7/2026)"]];
sl("Sự ra đời · Việt Nam", "Từ công ty nhà nước tới thị trường có luật", truc(560) + VN.map(([y, a, b], k) => { const x = 120 + k * 344; return `${moc(x + 15, 560, k >= 3)}${t("nam", x, 400, 330, y)}${t("moc-t", x, 600, 320, a)}${t("moc-s", x, 690, 320, b)}`; }).join(""), nc(7), { dan: "Luật đang áp dụng: Luật KDBH 08/2022/QH15, sửa đổi, bổ sung bởi Luật 139/2025/QH15." });
// 8 khái niệm — K3 sơ đồ các bên (phương án A đã duyệt)
sl("3.1 · Khái niệm", "BHTM: [chuyển rủi ro] qua hợp đồng", `<img data-l="nv8" data-alt="Bên mua bảo hiểm" src="asset/nv-ban-mua.svg" style="position:absolute;left:170px;top:400px;width:250px">
<img data-l="toa8" data-alt="Doanh nghiệp bảo hiểm" src="asset/toa.svg" style="position:absolute;left:1110px;top:240px;width:740px">
${lop(ve(muiTen(470, 560, 1190, 560, C.dn) + muiTen(1190, 720, 470, 720, C.do, true)), "Mũi tên phí (liền, trên) và bồi thường (đứt, dưới)")}
${t("nhan-mt", 560, 496, 560, "Phí bảo hiểm — luôn trả")}${t("nhan-mt do", 520, 740, 640, "Bồi thường — chỉ khi rủi ro xảy ra")}
${img("nhaChay", "Rủi ro đã thoả thuận xảy ra: nhà cháy", 740, 790, 200)}${t("nhan-nho", 640, 990, 400, "điều kiện: rủi ro đã thoả thuận")}
${chip(110, 940, 400, C.mua, "Bên mua bảo hiểm", "chấp nhận trả phí")}${chip(1290, 940, 420, C.dn, "Doanh nghiệp bảo hiểm", "cam kết bồi thường, trả tiền")}`, nc(8), { dan: "Bên mua trả phí chắc chắn; doanh nghiệp bảo hiểm cam kết bồi thường khi xảy ra rủi ro đã thoả thuận." });
// 9 số đông — K7 + đếm
{ let d = ""; for (let r = 0; r < 5; r++) for (let c = 0; c < 20; c++) d += nguoiNho(150 + c * 38, 470 + r * 70, (r === 2 && c === 7) || (r === 4 && c === 15) ? C.do : "6F8A86");
  sl("3.1 · Nguyên tắc 1 · Số đông", "Số đông bù cho số ít", `${lop(ve(d), "100 người đóng phí, 2 người (đỏ) gặp rủi ro")}${t("so-lon", 1020, 400, 360, "100")}${t("so-nhan", 1020, 530, 360, "người cùng đóng phí vào quỹ")}${t("so-lon do", 1440, 400, 360, "2")}${t("so-nhan", 1440, 530, 360, "người gặp rủi ro được bù đắp từ quỹ")}${vach(1020, 690, 780)}${t("chu", 1020, 720, 780, "Ai cũng có thể là người gặp rủi ro, nên ai cũng góp phí.")}`, nc(9), { dan: "Rủi ro của số ít được bù bằng tiền của rất nhiều người cùng đóng phí." }); }
// 10 rủi ro BH — K4
const cot = (x, ok, tieu, ds) => `${t("cot-t", x, 340, 780, tieu)}${vach(x, 400, 780)}` + ds.map((s, k) => `${dau(ok, x, 450 + k * 130, k)}${t("li", x + 70, 456 + k * 130, 700, s)}`).join("");
sl("3.1 · Nguyên tắc 2 · Rủi ro bảo hiểm", "Chỉ bảo hiểm rủi ro ngẫu nhiên", tb("tb-co", "T4", ["Sự kiện", "Nhận bảo hiểm?"], [["Nhà cháy do chập điện", ["co", "Có — bất ngờ"]], ["Chủ nhà cố ý đốt nhà", ["khong", "Không — cố ý"]], ["Xe bị đâm khi đang dừng đèn đỏ", ["co", "Có — ngoài ý muốn"]], ["Xe hao mòn theo thời gian", ["khong", "Không — chắc chắn xảy ra"]], ["Tàu gặp bão trên biển", ["co", "Có — bất ngờ"]], ["Kết luận", "Chỉ nhận rủi ro bất ngờ, không lường trước"]], 120, 320, 1680, "", ["", "", "", "", "", "ket"]) + t("chu", 120, 940, 1680, "Rủi ro phải bất ngờ, không lường trước được — khoản 5 Điều 16 Luật KDBH 2022."), nc(10), { dan: "Rủi ro xảy ra phải ngẫu nhiên, bất ngờ, ngoài ý muốn." });
// 11 quyền lợi — K3
sl("3.1 · Nguyên tắc 3 · Quyền lợi bảo hiểm", "Phải có quyền lợi với đối tượng", `${img("nguoiDung", "Chủ nhà", 150, 300, 420)}${img("nha", "Nhà của mình", 480, 380, 360)}${lop(ve(muiTen(450, 600, 560, 600, C.mua)), "Quyền lợi tài chính")}
${img("nu", "Người lạ", 1030, 300, 420)}${img("nha", "Nhà của người khác", 1400, 380, 360)}${lop(ve(`<path d="M1330 600 L1430 600" stroke="#${C.phu}" stroke-width="5" stroke-dasharray="10 10"/><path d="M1365 575 l30 50 M1395 575 l-30 50" stroke="#${C.do}" stroke-width="7" stroke-linecap="round"/>`), "Không có quyền lợi")}
${khoi(160, 760, 700, "Chủ nhà mua cho nhà của mình", "nhà cháy thì chính họ thiệt hại tài chính")}${khoi(1040, 760, 760, "Người lạ mua cho nhà người khác", "không có quyền lợi tài chính → không được")}`, nc(11), { dan: "Thiệt hại của đối tượng phải gây thiệt hại tài chính cho chính người mua." });
// 12 trung thực — K8
sl("3.1 · Nguyên tắc 4 · Trung thực tuyệt đối", "Trung thực: nghĩa vụ hai chiều", `<div class="trich" style="left:120px;top:330px;width:1680px"><b data-t>“…các bên tham gia hợp đồng bảo hiểm phải cung cấp thông tin, thực hiện các quyền và nghĩa vụ một cách trung thực nhất, trên cơ sở tin tưởng tuyệt đối lẫn nhau…”</b><span data-t>Khoản 1 Điều 16 Luật KDBH 08/2022/QH15</span></div>
${khoi(120, 640, 800, "Doanh nghiệp bảo hiểm", "soạn hợp đồng bảo đảm quyền lợi hai bên; giải thích điều kiện, điều khoản", "mau-dn")}${khoi(1000, 640, 800, "Bên mua bảo hiểm", "khai đủ, trung thực về đối tượng, rủi ro, thiệt hại", "mau-mua")}
${t("chu do", 120, 900, 1680, "Cố ý khai sai hoặc giấu thông tin nhằm giao kết hợp đồng → bên kia có quyền huỷ bỏ (Điều 22 khoản 2, 3).")}`, nc(12));
// 13 phân tán — K6 hai bản đồ cùng thang
{ const nhaN = (x, y, c) => `<path d="M${x} ${y + 14} L${x + 17} ${y} L${x + 34} ${y + 14} V${y + 36} H${x}Z" fill="#${c}"/>`;
  let a = `<rect x="120" y="340" width="800" height="560" rx="20" fill="none" stroke="#${C.xam}" stroke-width="3"/><circle cx="420" cy="620" r="190" fill="#F2711C" opacity=".2"/>`, b = `<rect x="1000" y="340" width="800" height="560" rx="20" fill="none" stroke="#${C.xam}" stroke-width="3"/><circle cx="1180" cy="520" r="80" fill="#F2711C" opacity=".2"/>`;
  for (let k = 0; k < 18; k++) a += nhaN(280 + (k % 6) * 48, 550 + Math.floor(k / 6) * 52, C.do);
  [[1150, 500], [1196, 500], [1400, 430], [1446, 430], [1640, 520], [1686, 520], [1120, 720], [1166, 720], [1420, 650], [1466, 650], [1300, 800], [1346, 800], [1620, 780], [1666, 780], [1520, 560], [1566, 560], [1700, 680], [1210, 610]].forEach(([x, y], k) => { b += nhaN(x, y, k < 2 ? C.do : C.dn); });
  sl("3.1 · Nguyên tắc 5 · Phân tán rủi ro", "Phân tán để tổn thất không dồn", `${lop(ve(a + b), "Mỗi ngôi nhà là một hợp đồng; vùng cam là một vụ cháy. Trái: dồn một khu, cháy trúng cả 18; phải: rải nhiều nơi, cháy trúng 2")}
${t("cot-t", 160, 370, 720, "Dồn một nơi: cháy trúng [18/18]")}${t("cot-t", 1040, 370, 720, "Rải nhiều nơi: cháy trúng [2/18]")}${t("chu", 120, 930, 1680, "Mỗi ngôi nhà là một hợp đồng. Cách làm: mở rộng phạm vi, đa dạng hoá sản phẩm, tái bảo hiểm.")}`, nc(13)); }
// 14 đối chiếu — K4
const NG = [["Số đông", ""], ["Rủi ro bảo hiểm", "Rủi ro ngẫu nhiên"], ["Quyền lợi bảo hiểm", "Quyền lợi có thể được bảo hiểm"], ["Trung thực tuyệt đối", "Trung thực tuyệt đối"], ["Phân tán rủi ro", ""], ["", "Bồi thường (không vượt thiệt hại thực tế)"], ["", "Thế quyền (chuyển quyền đòi bồi hoàn)"]];
sl("Đối chiếu · Luật KDBH 2022", "Nghiệp vụ và Luật: chỉ trùng ba", `${t("cot-t", 120, 320, 760, "Nguyên tắc nghiệp vụ (giáo trình)")}${t("cot-t", 1040, 320, 760, "Điều 16 Luật: giao kết, thực hiện HĐ")}` + NG.map(([a, b], k) => { const y = 390 + k * 84, tr = a && b;
  return `${a ? `<div class="o ${tr ? "trung" : ""}" style="left:120px;top:${y}px;width:760px"><b data-t>${esc(a)}</b></div>` : ""}${b ? `<div class="o ${tr ? "trung" : "moi"}" style="left:1040px;top:${y}px;width:760px"><b data-t>${esc(b)}</b></div>` : ""}${tr ? `<div class="noi" style="top:${y + 34}px"></div>` : ""}`; }).join(""), nc(14));
// 15 thở
tho("Thi luật: dùng [năm nguyên tắc của Điều 16]", "Năm nguyên tắc giáo trình là nguyên tắc nghiệp vụ — chỉ trùng ba nguyên tắc với Luật.", "Slide thở: chốt phân biệt nguyên tắc nghiệp vụ và nguyên tắc pháp lý (khoản 1–5 Điều 16 Luật KDBH 2022).", t("so-ma", 1180, 380, 620, "Đ16"));
// 16 chương 02
chuong("02", "Phân loại bảo hiểm thương mại", "Theo tính chất pháp lý, kỹ thuật bảo hiểm và đối tượng bảo hiểm", nc(15));
// 17 bắt buộc / tự nguyện — K4
sl("3.2 · Theo tính chất pháp lý", "Bắt buộc do luật, tự nguyện do nhu cầu", `${t("cot-t", 120, 330, 960, "Bảo hiểm bắt buộc")}${vach(120, 390, 960)}${t("li", 120, 420, 960, "Bảo vệ lợi ích công cộng, môi trường, an toàn xã hội (Điều 8 khoản 1, 2). Gồm:")}
${[["TNDS của chủ xe cơ giới", 120, 550], ["Cháy, nổ bắt buộc", 620, 550], ["Xây dựng", 120, 660], ["Theo luật khác", 620, 660]].map(([a, x, y]) => `<div class="o" style="left:${x}px;top:${y}px;width:470px"><b data-t>${a}</b></div>`).join("")}${t("chu", 120, 830, 960, "DNBH được phép bán bảo hiểm bắt buộc thì không được từ chối người mua đủ điều kiện (Điều 8 khoản 4).")}
${t("cot-t", 1180, 330, 620, "Bảo hiểm tự nguyện")}${vach(1180, 390, 620)}${t("li", 1180, 420, 620, "Tham gia tuỳ nhận thức và nhu cầu của người tham gia.")}${t("li dam", 1180, 540, 620, "Ví dụ: nhân thọ, sức khoẻ, vật chất xe.")}`, nc(16) + " Danh mục theo khoản 2 Điều 8 Luật 2022 . Bản 2022 ghi “đầu tư xây dựng”; theo nguồn thứ cấp, Luật 139/2025/QH15 sửa điểm c thành “xây dựng” — chưa đọc được bản chính thức (PDF scan), cần kiểm trước khi dạy.");
// 18 kỹ thuật — K5
sl("3.2 · Theo kỹ thuật bảo hiểm", "Phân bổ chi ngay, dồn tích tích quỹ", `<div data-bang="T5" style="position:absolute;left:120px;top:320px;width:1680px;height:620px">` + [["Kỹ thuật phân bổ", C.dn, [["Thời hạn", "Ngắn"], ["Loại rủi ro", "Tương đối độc lập với tuổi thọ"], ["Dùng quỹ", "Có rủi ro thì chi trả luôn"], ["Ví dụ", "Bảo hiểm cháy nổ một năm"]]], ["Kỹ thuật dồn tích", C.muc, [["Thời hạn", "Dài"], ["Loại rủi ro", "Gắn liền tuổi thọ con người"], ["Dùng quỹ", "Tích tụ nhiều năm mới chi trả"], ["Ví dụ", "Bảo hiểm nhân thọ 20 năm"]]]].map(([ten, c, ds], k) => `<div class="the" style="left:${k * 880}px;top:0;width:800px"><b class="the-t" data-t style="background:#${c}">${ten}</b>${ds.map(([a, b]) => `<div class="the-h"><i data-t>${a}</i><b data-t>${b}</b></div>`).join("")}</div>`).join("") + `</div>`, nc(17));
// 19 ba nhóm — K3
sl("3.2 · Theo đối tượng", "Ba nhóm theo đối tượng", [["nha", "Bảo hiểm tài sản", "đối tượng là tài sản"], ["nv-hoc", "Bảo hiểm con người", "tuổi thọ, tính mạng, sức khoẻ, khả năng lao động"], ["vaCham", "Bảo hiểm TNDS", "trách nhiệm dân sự của người được BH với người thứ ba"]].map(([h, a, b], k) => { const x = 120 + k * 580;
  return `${img(h, h === "vaCham" ? "Xe của người được bảo hiểm đâm vào xe của người thứ ba" : a, h === "vaCham" ? x + 20 : x + 60, h === "vaCham" ? 450 : 270, h === "vaCham" ? 500 : 420)}${vach(x, 680, 540)}${khoi(x, 700, 540, a, b)}`; }).join("") + t("chu", 120, 940, 1680, "Luật hiện hành: 3 loại hình — nhân thọ, sức khoẻ, phi nhân thọ (Điều 7); 5 loại hợp đồng (Điều 15)."), nc(18));
// 20 chương 03
chuong("03", "Hợp đồng bảo hiểm", "Khái niệm, tài liệu, chủ thể, các con số, phí và thời hạn", nc(19));
// 21 định nghĩa HĐBH — K2
S.push(`<section class="s" data-trans="fade" data-notes="${esc(nc(20))}">${t("kk", 120, 96, 900, "3.3 · Khái niệm")}${t("td", 120, 136, 900, "Hợp đồng bảo hiểm là gì", "data-tieu-de")}
<div class="dinh-nghia" style="left:120px;top:330px;width:880px"><b data-t>“Hợp đồng bảo hiểm là sự thoả thuận giữa bên mua bảo hiểm và doanh nghiệp bảo hiểm, …, theo đó bên mua bảo hiểm phải <u>đóng phí bảo hiểm</u>, doanh nghiệp bảo hiểm, … phải <u>bồi thường, trả tiền bảo hiểm</u> theo thỏa thuận trong hợp đồng.”</b></div>
${t("nguon", 120, 900, 880, "Khoản 16 Điều 4 Luật KDBH 08/2022/QH15 · phải lập thành văn bản (Điều 18)")}<div class="khoi-nhat" style="left:1080px;top:96px;width:720px;height:888px"></div>${img("hopDong", "Tờ hợp đồng bảo hiểm", 1160, 280, 560)}</section>`);
// 22 bảy tài liệu — K6 trục theo thời điểm dùng
const TL = [["Trước khi ký", ["Bản mô tả quyền lợi BH", "Giấy yêu cầu BH"]], ["Nội dung hợp đồng", ["Các điều kiện BH", "Điều kiện sửa đổi, bổ sung"]], ["Chứng nhận và thu phí", ["Giấy chứng nhận BH tạm thời", "Giấy chứng nhận BH", "Thông báo thu phí, hoá đơn"]]];
{ let so = 0; sl("3.3 · Tài liệu liên quan", "Bảy tài liệu theo thời điểm dùng", truc(470) + TL.map(([nhom, ds], k) => { const x = 120 + k * 580;
  return `${img(["icon-file-description", "icon-file-certificate", "icon-receipt"][k], nhom, x, 310, 64)}${moc(x + 15, 470, k === 2)}${t("cot-t", x + 90, 316, 450, nhom)}` + ds.map((d, j) => { so++; return `${t("so-nho", x, 530 + j * 140, 80, `0${so}`)}${t("li", x + 90, 530 + j * 140, 450, d)}`; }).join(""); }).join(""), nc(21)); }
// 23 bốn chủ thể — K3
sl("3.3 · Chủ thể", "Bốn chủ thể của hợp đồng", `${img("hopDong", "Hợp đồng bảo hiểm ở giữa", 850, 420, 280)}` +
  [["toa", C.dn, "Doanh nghiệp bảo hiểm", "nhận phí; bồi thường, trả tiền", 90, 260, 320], ["nguoi", C.mua, "Bên mua bảo hiểm", "giao kết hợp đồng, đóng phí", 1060, 260, 360], ["nv-duoc-bh", C.mua, "Người được bảo hiểm", "có đối tượng được bảo hiểm", 120, 590, 360], ["nv-thu-huong", C.phu, "Người thụ hưởng", "được chỉ định nhận tiền bảo hiểm", 1060, 590, 360]].map(([h, c, a, b, x, y, w]) =>
  `${img(h, a, x, y, w)}${chip(x < 900 ? 400 : 1370, y + (h === "toa" ? 120 : 50), 400, c, a, b)}`).join("") + t("chu", 120, 940, 1680, "Bên mua và người được BH có thể là hai người: bố mẹ (bên mua) mua BH nhân thọ cho con (người được BH)."), nc(22));
// 24 nghĩa vụ DNBH — K6 trục 15 ngày
sl("3.3 · Nghĩa vụ của DNBH", "Giải thích rõ, bồi thường đúng hạn", `${t("so-to", 108, 300, 620, "15")}${t("don-vi", 120, 610, 500, "ngày")}${t("th-sang", 120, 720, 660, "Hạn bồi thường tối đa khi hợp đồng không thoả thuận khác, tính từ khi nhận đủ hồ sơ hợp lệ.")}
<div class="the-sang" style="left:900px;top:300px;width:900px;height:640px"></div>` + [["icon-file-certificate", "Khi giao kết", "giải thích rõ quyền lợi, điều khoản loại trừ, quyền và nghĩa vụ của bên mua (Điều 20 khoản 2 điểm b)"], ["icon-calendar", "Khi xảy ra sự kiện bảo hiểm", "bồi thường, trả tiền đúng thời hạn thoả thuận (Điều 20 khoản 2 điểm đ; Điều 31 khoản 1)"], ["icon-coins", "Chậm trả", "phải trả thêm lãi cho phần tiền chậm trả (Điều 31)"]].map(([ic, a, b], k) => `${img(ic, a, 950, 340 + k * 200, 96)}${khoi(1080, 344 + k * 200, 680, a, b, "toi")}`).join(""), nc(23), { cls: "nen-dao" });
// 25 GTBH – STBH — K6 hai thanh cùng thang
sl("3.3 · Hai con số khác nhau", "Giá trị BH và số tiền BH", `${img("nha", "Ngôi nhà được bảo hiểm", 60, 330, 560)}<div class="thanh-don" style="left:680px;top:400px;width:1120px;background:#${C.dn}"></div><div class="thanh-don" style="left:680px;top:640px;width:672px;background:#${C.mua}"></div>
${khoi(680, 490, 1120, "Giá trị bảo hiểm · ví dụ 1 tỷ đồng", "giá trị của chính ngôi nhà (luật dùng: giá thị trường của tài sản)")}${khoi(680, 730, 1120, "Số tiền bảo hiểm · ví dụ 600 triệu đồng", "ghi trong hợp đồng — mức tối đa DNBH phải trả")}`, nc(24), { dan: "Giá trị đo chính đối tượng; số tiền bảo hiểm đo giới hạn trách nhiệm của DNBH." });
// 26 bốn trường hợp — K5
sl("3.3 · So STBH với giá trị", "Bốn trường hợp, bốn cách bồi thường", bang(["Trường hợp", "Quan hệ STBH – giá trị", "Bồi thường"], [["Đúng giá trị", "STBH = giá trị", "theo thiệt hại thực tế (Đ16 k3)"], ["Dưới giá trị", "STBH < giá thị trường", "theo tỷ lệ STBH / giá thị trường (Đ48)"], ["Trên giá trị", "STBH > giá thị trường", "nếu vô ý: tối đa giá thị trường lúc xảy ra thiệt hại, hoàn phí phần vượt (Đ47)"], ["Bảo hiểm trùng", "≥ 2 HĐ cùng phạm vi, đối tượng, thời hạn, sự kiện; tổng STBH > giá thị trường", "chia theo tỷ lệ STBH từng HĐ, tổng ≤ thiệt hại (Đ49)"]], 120, 330, 1680, "c3b ke", 1, "T2") + t("nguon", 120, 990, 1680, "Luật KDBH 08/2022/QH15, Điều 16, 47, 48, 49"), nc(25), { dan: "Ví dụ dưới giá trị: nhà 1 tỷ, STBH 600 triệu, thiệt hại 200 triệu → bồi thường 120 triệu." });
// 27 phí — K7
sl("3.3 · Phí bảo hiểm", "Phí bảo hiểm là giá cả", `${[["p", 120], ["=", 300], ["f", 480], ["+", 660], ["d", 840]].map(([c, x]) => t("cong-lon", x, 340, 140, c)).join("")}
${khoi(420, 560, 260, "f · phí thuần", "chi trả, bồi thường tổn thất được bảo hiểm")}${khoi(780, 560, 260, "d · phụ phí", "chi phí hoạt động nghiệp vụ")}
${vach(1180, 340, 620)}${khoi(1180, 370, 620, "Theo Luật", "khoản tiền bên mua phải đóng theo quy định của pháp luật hoặc do các bên thoả thuận (khoản 28 Điều 4)")}`, nc(26), { dan: "Phí bảo hiểm là giá cả của sản phẩm bảo hiểm." });
// 28 thời hạn — K6
sl("3.3 · Thời hạn bảo hiểm", "Thời hạn: từ hiệu lực tới hết trách nhiệm", `<div class="dai" style="left:520px;top:550px;width:1080px"></div>${truc(560, 160, 1600)}${moc(520, 560, true)}${moc(1600, 560, true)}
${t("moc-t giua-chu", 200, 600, 640, "Ký hợp đồng + có bằng chứng DNBH chấp nhận + bên mua đã đóng phí")}${t("moc-t", 1440, 600, 360, "Kết thúc trách nhiệm")}<div class="moc" style="left:1725px;top:548px;border-color:#B0302A;background:#B0302A"></div>${t("nguong do", 1120, 440, 680, "Sự kiện sau khi hết hạn: không bồi thường")}${t("dai-t", 700, 480, 400, "Thời hạn bảo hiểm")}
${t("chu", 120, 860, 1680, "Định nghĩa của giáo trình. Luật chỉ yêu cầu hợp đồng ghi thời hạn và thời điểm có hiệu lực (Điều 17 khoản 1 điểm e).")}`, nc(27));
// 29 thở
tho("Phí chắc chắn đổi lấy [bồi thường khi có rủi ro]", "Phần 4: chính doanh nghiệp bảo hiểm cũng chuyển bớt rủi ro — tái bảo hiểm.", "Slide thở trước phần tái bảo hiểm.", img("bt-chia", "Biểu tượng chia rủi ro: một phần đi tiếp sang doanh nghiệp nhận tái", 1300, 300, 440));
// 30 chương 04
chuong("04", "Tái bảo hiểm", "Doanh nghiệp bảo hiểm cũng chuyển bớt rủi ro — và hai bài tập tính", nc(28));
// 31 tái BH — K3
sl("3.4 · Khái niệm", "Tái bảo hiểm: chuyển tiếp một phần rủi ro", `${img("nguoi", "Bên mua bảo hiểm", 150, 330, 360)}${img("toa", "DNBH gốc", 780, 330, 380)}${img("toaNhan", "DN nhận tái", 1420, 360, 340)}
${lop(ve(muiTen(520, 600, 740, 600, C.mua) + muiTen(1180, 600, 1400, 600, C.nhan)), "Mũi tên: rủi ro và phí đi từ bên mua tới DNBH gốc, rồi một phần sang DN nhận tái")}
${chip(120, 780, 380, C.mua, "Bên mua / người được BH", "")}${chip(760, 780, 420, C.dn, "DNBH gốc (nhượng tái)", "")}${chip(1400, 780, 400, C.nhan, "DN nhận tái", "")}${t("nhan-mt nau", 1160, 520, 260, "Một phần rủi ro + phí")}${t("nhan-mt", 500, 540, 260, "Phí BH")}
${t("chu", 120, 930, 1680, "DNBH gốc vẫn chịu trách nhiệm duy nhất với bên mua, kể cả khi đã tái bảo hiểm (khoản 1 Điều 29).")}`, nc(29), { dan: "Một phần rủi ro đã nhận đối với đối tượng nhất định, kèm một phần phí đã nhận." });
// 32 ví dụ — K3
sl("3.4 · Ví dụ", "DNBH A nhượng tái cho công ty B", [["bt-mua", "Anh X mua bảo hiểm tài sản", "đóng phí cho DNBH A", C.mua], ["bt-nhan", "DNBH A nhận rủi ro", "cam kết bồi thường cho anh X", C.dn], ["bt-chia", "A nhượng một phần cho B", "kèm một phần phí; A vẫn chịu trách nhiệm với anh X", C.nhan]].map(([h, a, b, c], k) => { const x = 120 + k * 580;
  return `<div class="buoc" style="left:${x}px;top:330px;width:540px;border-top-color:#${c}"></div>${t("so-nho", x, 360, 80, `0${k + 1}`)}${img(h, a, x + 110, 380, 320)}${khoi(x, 740, 540, a, b, "giua")}`; }).join("") + lop(ve(muiTen(640, 540, 690, 540, C.phu) + muiTen(1220, 540, 1270, 540, C.phu)), "Mũi tên nối ba bước"), nc(30), { dan: "A phân tán rủi ro, phòng khi sự kiện bảo hiểm xảy ra làm A khó khăn." });
// 33 cây phân loại — K3
sl("3.4 · Các loại tái bảo hiểm", "Tỷ lệ và phi tỷ lệ", `${lop(ve(`<path d="M960 420 V470 M480 470 H1440 M480 470 V520 M1440 470 V520 M480 610 V660 M300 660 H660 M300 660 V700 M660 660 V700 M1440 610 V660 M1260 660 H1620 M1260 660 V700 M1620 660 V700" stroke="#9AA8A4" stroke-width="4" fill="none"/>`), "Sơ đồ cây phân loại")}
<div class="o trung" style="left:760px;top:330px;width:400px"><b data-t>Tái bảo hiểm</b></div><div class="o nut-dn" style="left:280px;top:520px;width:400px"><b data-t>Tái BH tỷ lệ</b></div><div class="o nut-nau" style="left:1240px;top:520px;width:400px"><b data-t>Tái BH phi tỷ lệ</b></div>
${[["Số thành", 140, "la-dn"], ["Mức dôi", 500, "la-dn"], ["Vượt mức bồi thường", 1100, "la-nau"], ["Vượt mức tỷ lệ bồi thường", 1460, "la-nau"]].map(([a, x, c]) => khoi(x, 720, 340, a, "", "giua " + c)).join("")}`, nc(31));
// 34 số thành — K6
sl("3.4 · Tái bảo hiểm số thành", "Số thành: một tỷ lệ cho mọi thứ", ["STBH", "Phí bảo hiểm", "Bồi thường"].map((r, k) => `${t("hang-t", 120, 420 + k * 140, 300, r)}<div class="thanh" style="left:440px;top:${410 + k * 140}px;width:1360px"><i style="width:35%;background:#${C.dn}"></i><i style="width:65%;background:#${C.nhan}"></i></div>`).join("")
  + t("thanh-a", 440, 350, 476, "DN nhượng giữ lại 35 %") + t("thanh-b", 940, 350, 860, "DN nhận tái chịu 65 %") + t("chu", 120, 860, 1680, "Tỷ lệ xác định ngay khi ký, áp dụng như nhau cho STBH, phí và bồi thường. Tỷ lệ 35 / 65 là của Bài 11."), nc(32));
// 35 Bài 11 — K9
sl("Bài 11 · Tái bảo hiểm số thành", "Bài 11: chia theo tỷ lệ 35 / 65", `${khoi(120, 330, 560, "Đề bài", "DNBH X tái bảo hiểm 5 nghiệp vụ hoả hoạn bằng một hợp đồng tái BH số thành: người nhượng giữ lại 35 %, người nhận tái chịu 65 %.")}${t("hoi-do", 120, 760, 560, "Hãy phân chia STBH, phí BH và trách nhiệm bồi thường?")}
${tb("tb-ke tb-so-phai", "T2", ["HĐ gốc", "Số tiền BH", "Phí BH", "Thiệt hại"], [["1", "10.000.000", "15.000", "8.000.000"], ["2", "8.000.000", "12.000", "4.000.000"], ["3", "7.000.000", "10.500", "3.200.000"], ["4", "4.000.000", "6.000", "2.500.000"], ["5", "1.700.000", "2.550", "500.000"]], 760, 330, 1040)}${t("nguon", 760, 900, 1040, "Đơn vị: đồng")}`, nc(33));
// 36 mức dôi — K6 cột tỉ lệ
{ const day = 940, top = 360, H = day - top, st = 18000, y = (v) => day - H * v / st;
  const cotS = `<rect x="760" y="${y(500)}" width="260" height="${day - y(500)}" fill="#${C.dn}"/><rect x="760" y="${y(8000)}" width="260" height="${y(500) - y(8000)}" fill="#C49A6C"/><rect x="760" y="${y(18000)}" width="260" height="${y(8000) - y(18000)}" fill="#${C.nhan}"/><path d="M700 ${day} H1080" stroke="#${C.muc}" stroke-width="3"/>${[500, 8000, 18000].map((v) => `<path d="M740 ${y(v)} H1100" stroke="#${C.muc}" stroke-width="2" stroke-dasharray="10 8"/>`).join("")}`;
  S.push(`<section class="s" data-trans="fade" data-notes="${esc(nc(34))}">${t("kk", 120, 96, 1200, "3.4 · Tái bảo hiểm mức dôi")}${t("td", 120, 136, 1680, "Mức dôi: tính theo “lần”", "data-tieu-de")}${t("dan", 120, 330, 560, "Phần vượt mức giữ lại tính bằng bội số của mức giữ lại. Ví dụ HĐ 4 của Bài 12: loại B, STBH 18.000, giữ lại 500 (nghìn USD).")}${t("cong", 120, 640, 600, "Mức tái = STBH − mức giữ lại")}
${lop(ve(cotS), "Cột STBH 18.000: 500 giữ lại, 7.500 dôi thứ nhất, 10.000 dôi thứ hai")}${t("so-tren trang", 760, y(13000) - 20, 260, "10.000")}${t("so-tren", 760, y(4250) - 20, 260, "7.500")}
${t("nguong", 1120, y(500) - 40, 680, "Mức giữ lại: 1 lần = 500")}${t("nguong", 1120, y(8000) - 20, 680, "Dôi thứ nhất: tối đa 15 lần = 7.500")}${t("nguong", 1120, y(18000) - 4, 680, "Dôi thứ hai: tối đa 20 lần = 10.000")}</section>`); }
// 37 Bài 12 — K9
sl("Bài 12 · Tái bảo hiểm mức dôi", "Bài 12: sáu hợp đồng, ba loại rủi ro", `${khoi(120, 330, 560, "Đề bài", "DNBH X tái BH 6 nghiệp vụ hoả hoạn bằng hợp đồng mức dôi. Mức giữ lại: A thông thường 1.000.000 USD · B công nghiệp 500.000 USD · C thương nghiệp 800.000 USD. Nhận tái: dôi thứ nhất 15 lần, dôi thứ hai 20 lần.")}${t("hoi-do", 120, 830, 560, "Hãy phân chia STBH, phí BH và trách nhiệm bồi thường?")}
${tb("tb-dau tb-so-phai", "T1", ["HĐ · loại", "STBH", "Phí BH", "Thiệt hại"], [["1 · A", "16.000", "16", "5.000"], ["2 · C", "10.000", "30", "8.000"], ["3 · A", "800", "0,8", "600"], ["4 · B", "18.000", "90", "13.000"], ["5 · C", "4.000", "12", "–"], ["6 · B", "7.000", "35", "2.000"]], 760, 330, 1040)}${t("nguon", 760, 960, 1040, "Đơn vị: 1.000 USD")}`, nc(35));
// 38 XL — K6
sl("3.4 · Vượt mức bồi thường", "Vượt mức bồi thường: trả phần vượt", `${t("hang-t", 120, 420, 1680, "Một vụ tổn thất 6 triệu, hợp đồng “4 triệu vượt 1 triệu”:")}
<div class="thanh" style="left:120px;top:500px;width:1680px;height:110px"><i style="width:16.67%;background:#${C.dn}"></i><i style="width:66.66%;background:#${C.nhan}"></i><i style="width:16.67%;background:#${C.xam}"></i></div>
${khoi(120, 650, 280, "1 triệu", "DN nhượng giữ lại")}${khoi(420, 650, 900, "4 triệu (từ 1 tới 5 triệu)", "DN nhận tái trả")}${khoi(1420, 650, 380, "1 triệu vượt giới hạn", "trở lại DN nhượng")}
${t("chu", 120, 900, 1680, "Ngưỡng tính bằng số tiền, cho từng rủi ro hoặc từng sự kiện. Slide sau: ngưỡng là tỷ lệ tổn thất của cả kỳ.")}`, nc(36), { dan: "DN nhận tái trả phần tổn thất vượt mức giữ lại, trong giới hạn đã thoả thuận." });
// 39 stop loss — K6
sl("3.4 · Vượt mức tỷ lệ bồi thường", "Vượt mức tỷ lệ: tính theo cả kỳ", `${t("cong", 120, 330, 1680, "Tỷ lệ tổn thất = số tiền bồi thường / phí bảo hiểm × 100 %")}
<div class="thanh" style="left:120px;top:480px;width:1680px"><i style="width:70%;background:#${C.dn}"></i><i style="width:15%;background:#${C.nhan}"></i><i style="width:15%;background:#${C.xam}"></i></div><div class="vach-dung" style="left:1296px;top:450px"></div><div class="vach-dung" style="left:1548px;top:450px;background:#1D2B2A"></div>${t("nguong do", 1150, 400, 300, "ngưỡng 70 %")}${t("nguong", 1470, 400, 200, "85 %")}${t("nguong", 1700, 400, 120, "100 %")}
${khoi(120, 600, 980, "0 – 70 %", "DN nhượng tự bồi thường")}${khoi(1150, 600, 380, "70 – 85 %", "DN nhận tái trả (giới hạn trách nhiệm)")}${khoi(1560, 600, 240, "trên 85 %", "trở lại DN nhượng")}
${t("chu", 120, 840, 1680, "Ví dụ: phí cả kỳ 100, bồi thường cả kỳ 80 → tỷ lệ tổn thất 80 %. DN nhượng chịu 70, DN nhận tái trả [10].")}`, nc(37));
// 40 nhóm — K4
sl("Làm việc nhóm", "Hai đề tài sau giờ học", [["01", "Hợp đồng BHTM thực tế", "và nhận xét về nội dung của hợp đồng"], ["02", "Thực trạng triển khai BHTM", "ở Việt Nam thời gian qua"]].map(([so, a, b], k) => { const x = 120 + k * 860; return `${vach(x, 460, 820)}${t("ml-so", x, 490, 160, so)}${khoi(x + 180, 500, 640, a, b)}`; }).join(""), nc(38));
// 41–45 câu hỏi — K10
const CH = [["Luật KDBH phân loại HĐBH theo tiêu chí nào?", ["Số tiền bảo hiểm", "Đối tượng bảo hiểm", "Thời hạn bảo hiểm", "Kỹ thuật bảo hiểm"]], ["DNBH có quyền nào?", ["Kiểm tra, giám sát việc thực hiện hợp đồng đại lý bảo hiểm", "Cho cán bộ, nhân viên làm đại lý cho chính DNBH đó", "Yêu cầu đại lý phải có hợp đồng bảo hiểm trước khi thành đại lý chính thức", "Cả A, B đều đúng"]], ["DNBH có nghĩa vụ gì?", ["Giải thích điều kiện, điều khoản BH; quyền, nghĩa vụ của bên mua", "Trả tiền BH kịp thời cho người thụ hưởng hoặc bồi thường cho người được BH", "Ứng tiền cho bên mua đóng phí hoặc giảm phí khi họ khó khăn tài chính", "Cả A và B đều đúng"]], ["Trung thực tuyệt đối áp cho ai?", ["Doanh nghiệp bảo hiểm", "Doanh nghiệp bảo hiểm và đại lý bảo hiểm", "Doanh nghiệp bảo hiểm và người tham gia bảo hiểm", "Doanh nghiệp bảo hiểm và người thụ hưởng"]], ["Điền vào chỗ trống", ["Công ty chứng khoán", "Công ty tài chính", "Doanh nghiệp bảo hiểm", "Ngân hàng thương mại"]]];
CH.forEach(([q, ds], k) => sl(`Câu hỏi tức thì · ${k + 1}/5`, q, `${k === 4 ? t("dan", 120, 260, 1680, "HĐBH là sự thoả thuận giữa bên mua BH và DNBH, theo đó bên mua BH phải đóng phí BH, …………… phải trả tiền BH cho người thụ hưởng hoặc bồi thường cho người được BH khi xảy ra sự kiện BH.") : k === 1 || k === 2 ? t("dan", 120, 228, 1500, "Theo pháp luật hiện hành ở Việt Nam.") : ""}` +
  ds.map((d, j) => `<div class="pa" style="left:${120 + (j % 2) * 860}px;top:${(k === 4 ? 470 : 380) + Math.floor(j / 2) * (k === 4 ? 260 : 290)}px;width:820px"><i data-t>${"ABCD"[j]}</i><b data-t>${esc(d)}</b></div>`).join(""), nc(39 + k)));
// 46 tổng kết — thở
tho("BHTM: [phí chắc chắn] đổi cam kết bồi thường", "Đã đi qua: khái niệm · năm nguyên tắc · phân loại · hợp đồng · tái bảo hiểm và hai bài tập.", nc(44));
// 47 kết
S.push(`<section class="s nen-dao" data-trans="fade" data-notes="${esc(nc(45))}">${t("ch-m", 120, 420, 900, "Bảo hiểm thương mại · Chương 3")}<h1 class="ch-t" data-t data-tieu-de style="left:120px;top:490px;width:1300px">Còn tiếp: Chương 4</h1></section>`);

// =================== HỆ NỀN (thiet-ke/he-thong.md mục Hệ nền) ===================
// N2 đậm: mở chương, kết, câu thở, trích luật, số lớn · N3: bìa, định nghĩa (khối nhạt), dải tiêu đề cho slide số liệu / trục · N1: kem + hoạ tiết đổi góc
const N2 = new Set([2, 12, 15, 27, 29, 46]), N3_DAI = new Set([7, 22, 28, 34, 38, 39]), GOC = [["tren-phai", 1540, -90], ["duoi-phai", 1560, 840]];
// MẢNG MÀU / THẺ GOM (luật "một tiêu điểm 30–45 %", references/nguon-hinh.md): đặt dưới mọi nội dung của slide
const mg = (x, y, w, h, k = "trang") => `<div class="mang-${k}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"></div>`;
const MANG = { 3: mg(90, 300, 1740, 720), 4: mg(90, 300, 1740, 660), 9: mg(0, 380, 1920, 560, "nhat"), 11: mg(110, 290, 850, 720) + mg(990, 290, 850, 720),
  13: mg(100, 320, 1720, 600), 14: mg(90, 300, 1740, 720), 17: mg(90, 310, 1010, 680, "nhat") + mg(1150, 310, 680, 680), 19: mg(0, 250, 1920, 430, "nhat"),
  23: mg(600, 220, 780, 680, "tron"), 25: mg(0, 0, 660, 1080, "be"), 31: mg(0, 300, 1920, 580, "nhat"), 32: mg(0, 320, 1920, 610, "nhat"), 33: mg(90, 300, 1740, 640),
  35: mg(0, 0, 720, 1080, "be"), 36: mg(700, 330, 1180, 660), 40: mg(110, 380, 840, 640) + mg(970, 380, 840, 640),
  41: mg(90, 350, 1740, 600, "nhat"), 42: mg(90, 350, 1740, 600, "nhat"), 43: mg(90, 350, 1740, 600, "nhat"), 44: mg(90, 350, 1740, 600, "nhat"), 45: mg(90, 440, 1740, 560, "nhat") };
let dem1 = 0;
S.forEach((h, k) => { const n = k + 1; let nen, cls = "", them = "";
  if (/class="s nen-dao/.test(h.slice(0, 60))) nen = "N2";
  else if (N2.has(n)) { nen = "N2"; cls = " nen-dao"; }
  else if (n === 6) nen = "N4";
  else if (n === 1 || n === 21) nen = "N3";
  else if (N3_DAI.has(n)) { nen = "N3·dai"; them = '<div class="dai-td"></div>'; }
  else { const i = dem1++, m = Object.keys(TT)[i % 4], [g, x, y] = GOC[0]; nen = `N1·${m}@${g}`;
    them = `<img data-l="${m}-${n}" data-alt="Hình trang trí" data-ngoai src="asset/${m}.svg" style="position:absolute;left:${x}px;top:${y}px;width:440px">`; }
  S[k] = h.replace(/<section class="s([^"]*)"/, `<section class="s$1${cls}" data-nen="${nen}"`).replace(/(<section[^>]*>)/, `$1${them}${MANG[n] || ""}`); });

// =================== CSS (theo he-thong.md) ===================
ghi(path.join(D, "style.css"), `section.s{background:#F6F1E7;color:#1D2B2A}
section.s > div, section.s > h1{position:absolute}
[data-t],.khoi b,.khoi span,.chip b,.chip span,.o b,.pa b,.bang b{text-wrap:pretty}.td,.tho,.ch-t,.bia-td,.moc-t,.khoi b{text-wrap:balance}
em{font-style:normal;color:#0F5C55}
.kk{font:600 26px/1.3 'Be Vietnam Pro';color:#0F5C55;letter-spacing:.03em}
.td{font:700 58px/1.15 'Lora'}.dan{font:400 32px/1.45 'Be Vietnam Pro';color:#4A5856}
.tho{position:absolute;font:700 80px/1.15 'Lora';margin-left:-1px}.tho-phu{font:400 34px/1.45 'Be Vietnam Pro';color:#4A5856}
.khoi-xanh{left:0;top:0;width:760px;height:1080px;background:#0F5C55}
.bia-kk{font:600 28px/1.3 'Be Vietnam Pro';color:#BFE0D9}.bia-so{font:800 44px/1.2 'Be Vietnam Pro';color:#E8A33D}.bia-td{position:absolute;font:800 96px/1.1 'Be Vietnam Pro';color:#fff}.bia-by{font:500 30px/1.4 'Be Vietnam Pro';color:#DCEDE9}
section.s.nen-dao{background:#0F5C55;color:#fff}.ch-so{font:800 200px/1 'Be Vietnam Pro';color:#E8A33D;margin-left:-5px}.ch-t{position:absolute;font:700 96px/1.1 'Lora';color:#fff;margin-left:-2px}.ch-m{font:400 34px/1.4 'Be Vietnam Pro';color:#CFE5E0}
.vach{height:2px;background:#1D2B2A;opacity:.85}
.so-nho{font:800 32px/1.2 'Be Vietnam Pro';color:#9A6410}.mt-v{font:800 38px/1.25 'Be Vietnam Pro';color:#0F5C55}.mt-s{font:400 34px/1.35 'Be Vietnam Pro'}
.ml-so{font:800 64px/1 'Be Vietnam Pro';color:#9A6410}.ml-t{font:800 40px/1.2 'Be Vietnam Pro'}.ml-m{font:400 30px/1.4 'Be Vietnam Pro';color:#4A5856}.ml-g{font:600 26px/1.3 'Be Vietnam Pro';color:#0F5C55}
.chu{font:500 30px/1.45 'Be Vietnam Pro';color:#3A4846}.chu.do{color:#B0302A;font-weight:700}
.truc{position:absolute;height:4px;background:#C9BCA6}.moc{position:absolute;width:30px;height:30px;border-radius:50%;background:#F6F1E7;border:6px solid #0F5C55}.moc.dam{background:#0F5C55}
.nam{font:800 72px/1 'Be Vietnam Pro';color:#9A6410}.moc-t{font:800 30px/1.3 'Be Vietnam Pro'}.moc-s{font:400 28px/1.4 'Be Vietnam Pro';color:#4A5856}
.nhan-mt{font:700 30px/1.3 'Be Vietnam Pro';color:#0F5C55;text-align:center}.nhan-mt.do{color:#B0302A}.nhan-mt.nau{color:#8A5A2B}.nhan-nho{font:500 26px/1.35 'Be Vietnam Pro';color:#4A5856;text-align:center}
.chip{position:absolute;background:#fff;border:4px solid;border-radius:20px;padding:16px 20px;text-align:center}.chip b{display:block;font:800 30px/1.25 'Be Vietnam Pro'}.chip span{display:block;font:400 26px/1.35 'Be Vietnam Pro';color:#4A5856}
.khoi b{display:block;font:800 34px/1.25 'Be Vietnam Pro'}.khoi span{display:block;margin-top:12px;font:400 30px/1.45 'Be Vietnam Pro';color:#3A4846}.khoi.giua{text-align:center}.khoi.mau-dn b{color:#0F5C55}.khoi.mau-mua b{color:#2E6DA4}
.so-lon{font:800 120px/1 'Be Vietnam Pro';color:#0F5C55}.so-lon.do{color:#B0302A;margin-left:-4px}.so-nhan{font:500 30px/1.4 'Be Vietnam Pro';color:#4A5856}
.cot-t{font:800 34px/1.3 'Be Vietnam Pro'}.li{font:400 32px/1.4 'Be Vietnam Pro'}.li.dam{font-weight:600}
.trich{position:absolute;border-left:10px solid #0F5C55;padding:8px 0 8px 40px}.trich b{display:block;font:700 38px/1.45 'Lora'}.trich span{display:block;margin-top:18px;font:700 26px/1.3 'Be Vietnam Pro';color:#0F5C55}
.o{position:absolute;background:#fff;border-radius:14px;padding:14px 22px;border:3px solid #E4DACB}.o b{font:700 30px/1.3 'Be Vietnam Pro'}.o.trung{border-color:#0F5C55;background:#E3EFEC}.o.moi{border-color:#E8A33D;background:#FDF1DC}
.noi{position:absolute;left:880px;width:160px;height:4px;background:#0F5C55}
.bang{display:flex;flex-direction:column;gap:6px}.bang .h,.bang .r{display:grid;gap:6px;grid-template-columns:.8fr 1.6fr 1.6fr}.bang.c3b .h,.bang.c3b .r{grid-template-columns:.8fr 1.7fr 1.9fr}.bang.so .h,.bang.so .r{grid-template-columns:.9fr 1.4fr 1fr 1.4fr}
.bang .h b{background:#1D2B2A;color:#fff;font:700 28px/1.3 'Be Vietnam Pro';padding:14px 22px;border-radius:10px}.bang .r b{background:#fff;font:400 30px/1.35 'Be Vietnam Pro';padding:18px 22px;border-radius:10px}.bang .r b.dau{font-weight:800}.bang .r.on b{background:#FCE9C6}.bang.so .r b{text-align:right}.bang.so .r b.dau{text-align:left}
.dinh-nghia b{font:700 40px/1.45 'Lora'}.dinh-nghia u{text-decoration:none;color:#0F5C55;font-weight:800}.nguon{font:600 26px/1.3 'Be Vietnam Pro';color:#4A5856}.khoi-nhat{background:#ECE3D3;border-radius:32px}
.thanh-don{position:absolute;height:70px;border-radius:12px}
.cong-lon{font:800 140px/1.1 'Be Vietnam Pro';color:#0F5C55;text-align:center}.cong{font:800 40px/1.3 'Be Vietnam Pro';color:#0F5C55}
.dai{position:absolute;height:24px;border-radius:12px;background:#0F5C55;opacity:.25}.dai-t{font:800 32px/1.3 'Be Vietnam Pro';color:#0F5C55;text-align:center}
.hang-t{font:700 32px/1.3 'Be Vietnam Pro'}.thanh{position:absolute;height:84px;border-radius:14px;overflow:hidden;display:flex}.thanh i{display:block;height:100%;border-right:4px solid #F6F1E7}
.thanh-a{font:800 30px/1.3 'Be Vietnam Pro';color:#0F5C55}.thanh-b{font:800 30px/1.3 'Be Vietnam Pro';color:#8A5A2B;text-align:right}
.so-tren{font:800 40px/1.2 'Be Vietnam Pro';text-align:center}.so-tren.trang{color:#fff}.nguong{font:700 30px/1.3 'Be Vietnam Pro';color:#1D2B2A}.nguong.do{color:#B0302A}.vach-dung{position:absolute;width:6px;height:150px;background:#B0302A}
.hoi-do{font:800 32px/1.35 'Be Vietnam Pro';color:#B0302A}
.pa{position:absolute;display:flex;align-items:center;gap:24px;background:#fff;border-radius:20px;padding:26px 30px;min-height:230px;box-shadow:0 10px 26px rgba(29,43,42,.07)}
.nam-nho{font:800 64px/1 'Be Vietnam Pro';color:#9A6410}.chu-anh{font:500 24px/1.4 'Be Vietnam Pro';color:#F6F1E7}
.so-to{font:800 340px/0.85 'Be Vietnam Pro';color:#F6F1E7;letter-spacing:-.05em}.don-vi{font:800 64px/1 'Be Vietnam Pro';color:#E8A33D}.th-sang{font:400 32px/1.45 'Be Vietnam Pro';color:#CFE5E0}
.the-sang{position:absolute;background:#F6F1E7;border-radius:24px}.nen-dao .khoi.toi b{color:#0F5C55}.nen-dao .khoi.toi span{color:#3A4846}
.mang-trang,.mang-nhat,.mang-tron,.mang-be{position:absolute}.mang-trang{background:#FFFFFF;border-radius:28px;box-shadow:0 14px 34px rgba(29,43,42,.07)}.mang-nhat{background:#E4EFEC;border-radius:28px}.mang-tron{background:#E4EFEC;border-radius:50%}.mang-be{background:#EBE2D0}
.dai-td{position:absolute;left:0;top:0;width:1920px;height:300px;background:#D7E7E3}
.nen-dao em{color:#E8A33D}.nen-dao .tho{color:#fff}.nen-dao .tho-phu,.nen-dao .dan{color:#CFE5E0}.nen-dao .kk{color:#F5CD8C}.nen-dao .td{color:#fff}
.nen-dao .trich{border-left-color:#E8A33D}.nen-dao .trich b{color:#fff}.nen-dao .trich span{color:#E8A33D}.nen-dao .khoi b{color:#fff}.nen-dao .khoi span{color:#DCEDE9}
.nen-dao .khoi.mau-dn b{color:#8FDCCB}.nen-dao .khoi.mau-mua b{color:#A9CCF0}.nen-dao .chu.do{color:#F2C27A}.nen-dao .vach{background:#CFE5E0}.nen-dao .cong-lon{color:#E8A33D}
.bang.t4 .h,.bang.t4 .r{grid-template-columns:2fr 1fr 1fr}.bang.t4 .r:nth-child(odd) b{background:#FBF8F2}.bang .r b.co{background:#DDEEE9 !important;color:#0F5C55;font-weight:800;text-align:center}.bang .r b.khong{background:#F8E1DD !important;color:#B0302A;font-weight:800;text-align:center}.bang.t4 .h b:not(:first-child){text-align:center}
.bang.ke{gap:0}.bang.ke .h,.bang.ke .r{gap:0}.bang.ke .h b{background:none;color:#1D2B2A;border-bottom:4px solid #1D2B2A;border-radius:0}.bang.ke .r b{background:none;border-bottom:2px solid #D8CDB9;border-radius:0}.bang.ke .r.on b{background:#FCE9C6}
.bang.t3 .h b{background:#0F5C55}.bang.t3 .r b{background:#fff}.bang.t3 .r b:nth-child(4),.bang.t3 .h b:nth-child(4){background:#DDEEE9;color:#0F5C55;font-weight:800}.bang.t3 .h b:nth-child(4){background:#0B4A44;color:#fff}
.bang.t1 .h b{color:#1D2B2A}.bang.t1 .h b:nth-child(1){background:#D9E8E5}.bang.t1 .h b:nth-child(2){background:#DCE7F2}.bang.t1 .h b:nth-child(3){background:#F1E4D2}.bang.t1 .h b:nth-child(4){background:#F4DCD8}.bang.t1 .r b{border:2px solid #E6DDCD}
.the{position:absolute;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 12px 30px rgba(29,43,42,.08)}.the-t{display:block;color:#fff;font:800 38px/1.2 'Be Vietnam Pro';padding:28px 36px}
.the-h{display:grid;grid-template-columns:230px 1fr;align-items:baseline;padding:24px 36px;border-top:2px solid #EEE6D8}.the-h i{font:600 28px/1.3 'Be Vietnam Pro';font-style:normal;color:#4A5856}.the-h b{font:500 32px/1.35 'Be Vietnam Pro'}
.buoc{position:absolute;height:0;border-top:8px solid}
.o.nut-dn{background:#0F5C55;border-color:#0F5C55}.o.nut-dn b,.o.nut-nau b{color:#fff}.o.nut-nau{background:#8A5A2B;border-color:#8A5A2B}.o.trung b{font-size:34px}.khoi.la-dn b{color:#0F5C55}.khoi.la-nau b{color:#8A5A2B}
.nen-dao .pa{box-shadow:none}.nen-dao .pa b{color:#1D2B2A}.so-ma{font:800 220px/1 'Be Vietnam Pro';color:#E8A33D;text-align:right}
.giua-chu{text-align:center}
.pa i{flex:none;width:80px;height:80px;border-radius:16px;background:#0F5C55;color:#fff;font:800 40px/80px 'Be Vietnam Pro';font-style:normal;text-align:center}.pa b{font:600 36px/1.35 'Be Vietnam Pro'}
`);
fs.rmSync(path.join(D, "slides"), { recursive: true, force: true });
S.forEach((h, k) => ghi(path.join(D, "slides", `${String(k + 1).padStart(2, "0")}.html`), h));
console.log(`${S.length} slide, ${nVe} hình vẽ riêng`);
