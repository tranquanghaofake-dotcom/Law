// DA THEO MÔN — chất liệu của một môn phủ lên MỌI type thường của tầng hình ảnh (65 type ở stage/templates.js).
// Spec: docs/specs/2026-11-13-slide-chuan-da-theo-mon-design.md (repo Law). Chuyển từ "world" và "bộ chất liệu" của tầng lưới Office cũ
// (engine/kits.js, engine/build.js: worldBg, worldFrame, box) sang HTML/CSS: thẻ là lớp ảnh nên vỏ thẻ chỉ cần CSS.
//
// Một da = màu (mực, nhấn, trang, viền, xấu, tốt, vàng) + nền trang + khung slide + vỏ thẻ + nhãn + ô số + thanh tiến độ
//          + đồ vật tiền cảnh (PROPS) + hình minh hoạ lớn cho bìa / chương / kết (hinh/art.js) + kiểu hiện ý (hiệu ứng vào).
// Deck chọn bằng "meta": { "da": "so-bhxh" }. Không ghi → theo bộ hình đang dùng (bc*, qt*), theo meta.kit / meta.style cũ, rồi theo meta.kind
// (case → ho-so, lecture → giay, report → kinh). "da": "none" = nền chung (chỉ khi người dùng đồng ý — prep.json chapNhanNenChung).
// Không mô phỏng giấy tờ đến mức giả được: không quốc huy, không biểu trưng cơ quan, không số hiệu biểu mẫu.
const { PROPS } = require("./do_vat");
const { ART } = require("./art");

// ---------- màu ----------
const hx = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (a) => a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => { const A = hx(a), B = hx(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
const rgba = (h, o) => `rgba(${hx(h).join(",")},${o})`;
const b64 = (svg) => `url("data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}")`;

// ---------- 13 da ----------
// ink: chữ trên trang sáng; acc: màu nhấn (dải thẻ, nhãn, khung); page: màu trang; line: viền mảnh; bad / good: nghĩa cố định (đỏ = xấu)
// gold: điểm nhấn trên nền tối (số lớn, cụm nhấn); nen: nền trang; khung: khung toàn slide; the: vỏ thẻ; nhan: kiểu nhãn kicker;
// so: ô số (cell | square | round); tienDo: thanh tiến độ; vat: đồ vật tiền cảnh; chuyen: kiểu hiện thẻ; art: hình lớn bìa / chương / kết
const DA = {
  "so-bhxh": { mon: "Sổ BHXH (An sinh xã hội, BHXH, BHYT, BHTN, lương hưu)", fits: ["bảo hiểm", "bhxh", "bhyt", "bhtn", "an sinh", "lương hưu", "hưu trí", "thai sản", "ốm đau", "tử tuất", "trợ cấp"],
    ink: "1E2A22", acc: "2F6B3F", page: "F3F8F1", muted: "4E5F53", line: "9CC29A", bad: "9A3324", good: "2F6B3F", gold: "D9AE3A",
    nen: "sage", khung: "double", the: "ledger", nhan: "outline", so: "cell", tienDo: "stamps", vat: ["booklet", "coins", "stamp"], chuyen: "stamp", art: "passbook" },
  "bang-cong": { mon: "Bảng chấm công / phiếu lương (Lao động, tiền lương, thời giờ làm việc)", fits: ["lao động", "tiền lương", "hợp đồng lao động", "sa thải", "kỷ luật lao động", "thời giờ", "tăng ca", "công đoàn", "đình công"],
    ink: "16213A", acc: "23407A", page: "F7F9FD", muted: "4A5672", line: "BFCBE3", bad: "B23A2B", good: "23407A", gold: "E0A526",
    nen: "cells", khung: "daystrip", the: "timecard", nhan: "solid", so: "cell", tienDo: "days", vat: ["coins", "booklet", "calculator"], chuyen: "flip", art: "idcard" },
  "cang-bien": { mon: "Bến cảng, container (Thương mại quốc tế, vận tải, hải quan, logistics)", fits: ["incoterms", "xuất khẩu", "nhập khẩu", "hải quan", "vận tải", "logistics", "container", "cảng", "thương mại quốc tế", "vận đơn"],
    ink: "1B2433", acc: "A8401F", page: "F4F2EE", muted: "4D5566", line: "D9CFC4", bad: "A8401F", good: "1F4E79", gold: "F2B705",
    nen: "corrugated", khung: "hazard", the: "container", nhan: "solid", so: "square", tienDo: "train", vat: ["crate", "bars", "coins"], chuyen: "slide", art: "harbor" },
  "ban-ve": { mon: "Bản vẽ kỹ thuật (Đất đai, nhà ở, xây dựng, bất động sản)", fits: ["đất đai", "nhà ở", "xây dựng", "bất động sản", "thuê nhà", "thuê trọ", "quy hoạch", "chung cư", "giấy chứng nhận", "thửa đất"],
    ink: "13233D", acc: "1F4E8C", page: "F5F9FD", muted: "46597A", line: "B9CDE6", bad: "9E3520", good: "1F4E8C", gold: "E8B04A",
    nen: "blueprint", khung: "dimension", the: "dimension", nhan: "outline", so: "cell", tienDo: "ruler", vat: ["ruler", "pencil"], chuyen: "wipe", art: "house" },
  "hoa-don": { mon: "Hoá đơn / biên lai (Thuế, kế toán, phí – lệ phí)", fits: ["thuế", "hóa đơn", "hoá đơn", "gtgt", "vat", "kế toán", "thu nhập cá nhân", "tncn", "tndn", "quản lý thuế", "lệ phí", "ngân sách"],
    ink: "2A1C14", acc: "9B3D12", page: "FBF8F3", muted: "5E4D42", line: "E2CDBE", bad: "A3222E", good: "2E6B3A", gold: "D9A13B",
    nen: "dotrows", khung: "perforated", the: "receipt", nhan: "outline", so: "square", tienDo: "tape", vat: ["calculator", "coins", "clip"], chuyen: "drop", art: "receipt" },
  "sao-ke": { mon: "Sao kê / sổ tiết kiệm (Ngân hàng, tín dụng, chứng khoán, thanh toán)", fits: ["ngân hàng", "tín dụng", "cho vay", "hợp đồng vay", "lãi suất", "tiền gửi", "thanh toán", "bảo lãnh", "chứng khoán", "sao kê", "rửa tiền"],
    ink: "102A33", acc: "0B5E73", page: "F5F9FA", muted: "47606A", line: "BFD6DD", bad: "A8332B", good: "1F6B45", gold: "C9A227",
    nen: "guilloche", khung: "secure", the: "stub", nhan: "solid", so: "round", tienDo: "balance", vat: ["bankcard", "coins", "bars"], chuyen: "slide", art: "bankbook" },
  "co-cau": { mon: "Sơ đồ cơ cấu sở hữu (Doanh nghiệp, cổ phần, M&A, quản trị công ty)", fits: ["doanh nghiệp", "công ty", "cổ phần", "cổ đông", "góp vốn", "thành viên góp vốn", "sáp nhập", "hợp nhất", "m&a", "quản trị công ty", "chuyển nhượng vốn"],
    ink: "1C1B33", acc: "3B3486", page: "F7F7FB", muted: "52506E", line: "CBC8E6", bad: "A3322B", good: "3B3486", gold: "E0B33C",
    nen: "dots", khung: "corners", the: "node", nhan: "outline", so: "round", tienDo: "nodes", vat: ["bars", "pin", "bankcard"], chuyen: "pop", art: "orgchart" },
  "bien-ban": { mon: "Biên bản / hồ sơ tố tụng (Hình sự, tố tụng, xử phạt vi phạm hành chính)", fits: ["tố tụng", "vi phạm hành chính", "xử phạt", "tang vật", "khám xét", "điều tra", "biên bản", "bắt giữ", "tạm giữ", "khởi tố"],
    ink: "1F1A17", acc: "7A1F1F", page: "FAF7F2", muted: "5A504A", line: "D8CFC6", bad: "A3261F", good: "2F5D3A", gold: "D6A23A",
    nen: "lined", khung: "seal", the: "field", nhan: "solid", so: "square", tienDo: "folio", vat: ["stamp", "clip", "pen"], chuyen: "stamp", art: "sealed" },
  // ba bộ chung (bộ chất liệu cũ file / paper / glass) — mặc định theo meta.kind khi đề tài chưa có da riêng
  "ho-so": { mon: "Hồ sơ vụ việc (bình luận bản án, dân sự, hợp đồng)", fits: ["bản án", "vụ án", "hợp đồng", "dân sự", "tranh chấp", "toà án", "tòa án", "thừa kế"],
    ink: "2A2118", acc: "8A3B1F", page: "F1E7D0", muted: "5E5040", line: "D4C3A0", bad: "A3261F", good: "2F5D3A", gold: "D9A441",
    nen: "grain", khung: "tabs", the: "file", nhan: "tab", so: "square", tienDo: "folio", vat: ["clip", "pen", "lens"], chuyen: "drop", art: "justice" },
  giay: { mon: "Giấy học thuật (bài giảng, tiểu luận, kỹ năng)", fits: ["bài giảng", "khái niệm", "nhập môn", "ôn tập", "tiểu luận"],
    ink: "1B2433", acc: "1F4E8C", page: "FBFAF6", muted: "4D5566", line: "C9D3E3", bad: "B23A2B", good: "2F6B3F", gold: "E2B13C",
    nen: "ruled", khung: "margin", the: "tape", nhan: "solid", so: "round", tienDo: "ruler", vat: ["pencil", "ruler", "pin"], chuyen: "rise", art: "book" },
  kinh: { mon: "Kính (báo cáo, số liệu, công nghệ)", fits: ["báo cáo", "số liệu", "thống kê", "công nghệ", "dữ liệu"],
    ink: "14213D", acc: "3557A6", page: "EEF3FA", muted: "4A5672", line: "C3D0EA", bad: "B23A2B", good: "2E7D5B", gold: "F0C04A",
    nen: "glow", khung: "none", the: "glass", nhan: "pill", so: "round", tienDo: "nodes", vat: ["orb", "bars", "coins"], chuyen: "rise", art: "document" },
  // hai bộ hình riêng (hinh/bang_chung.js, hinh/hoi_nghi.js): slide type thường thành TỜ GIẤY trên nền của bộ (bảng bần / bản đồ thế giới bằng chấm)
  bc: { mon: "Bảng bằng chứng (Hình sự)", fits: ["hình sự", "tội phạm", "trách nhiệm hình sự", "khởi tố", "điều tra", "bị can", "bị cáo"],
    ink: "1B1713", acc: "C8261E", page: "F6EEDB", muted: "5A4D36", line: "D8C7A4", bad: "C8261E", good: "2E8B57", gold: "FFD27A",
    nen: "bc", khung: "none", the: "pinned", nhan: "solid", so: "square", tienDo: "plain", vat: [], chuyen: "drop", art: "justice", to: "bc" },
  qt: { mon: "Bàn hội nghị quốc tế (Công pháp quốc tế)", fits: ["công pháp quốc tế", "điều ước", "liên hợp quốc", "chủ quyền", "quốc tế", "ngoại giao"],
    ink: "0B2140", acc: "8A6A1E", page: "F7F1E1", muted: "4A5568", line: "D9C9A0", bad: "A3261F", good: "1F6B45", gold: "E9C46A",
    nen: "qt", khung: "none", the: "treaty", nhan: "outline", so: "round", tienDo: "plain", vat: [], chuyen: "rise", art: "scales", to: "qt" },
};
const NAMES = Object.keys(DA);
const ALIAS = { file: "ho-so", paper: "giay", glass: "kinh", dossier: "ho-so", cadastral: "ban-ve" };
const AUTO = { case: "ho-so", lecture: "giay", report: "kinh" };

/** Chọn da cho deck → { ten, ly_do } (ten = null: nền chung). */
function chonDa(deck, { bcTypes = [], qtTypes = [] } = {}) {
  const m = deck.meta || {}, sl = deck.slides || [];
  if (m.da === "none") return { ten: null, lyDo: "meta.da = none" };
  if (m.da) return DA[m.da] ? { ten: m.da, lyDo: "meta.da" } : { ten: null, lyDo: `meta.da "${m.da}" không có (chọn: ${NAMES.join(", ")})`, loi: true };
  if (sl.some((s) => bcTypes.includes(s.type))) return { ten: "bc", lyDo: "deck dùng kiểu bc*" };
  if (sl.some((s) => qtTypes.includes(s.type))) return { ten: "qt", lyDo: "deck dùng kiểu qt*" };
  const cu = ALIAS[m.kit] || (DA[m.kit] ? m.kit : null) || ALIAS[m.style];
  if (cu) return { ten: cu, lyDo: m.kit ? `meta.kit "${m.kit}" (tên cũ)` : `meta.style "${m.style}" (tên cũ)` };
  const topic = [m.title, m.short, ...sl.filter((s) => ["cover", "section"].includes(s.type)).map((s) => s.title)].join(" ").toLowerCase();
  const hop = NAMES.filter((n) => !["ho-so", "giay", "kinh"].includes(n)).find((n) => DA[n].fits.some((f) => topic.includes(f)));
  if (hop) return { ten: hop, lyDo: `đề tài khớp "${DA[hop].mon}"`, goiY: true };
  return { ten: AUTO[m.kind] || "ho-so", lyDo: `mặc định theo meta.kind "${m.kind || "case"}"` };
}

// ---------- nền trang (SVG 1600×900, phủ cả slide) ----------
function nenSvg(kind, c, toi) {
  const A = toi ? "FFFFFF" : c.acc, T = toi ? "FFFFFF" : c.ink, o = toi ? 0.55 : 1;
  let b = "";
  if (kind === "corrugated") for (let x = 0; x < 1600; x += 22) b += `<rect x="${x}" y="0" width="11" height="900" fill="#${T}" fill-opacity="${0.045 * o}"/>`;
  else if (kind === "blueprint") { for (let x = 0; x <= 1600; x += 20) b += `<line x1="${x}" y1="0" x2="${x}" y2="900" stroke="#${A}" stroke-opacity="${(x % 100 ? 0.07 : 0.15) * o}"/>`;
    for (let y = 0; y <= 900; y += 20) b += `<line x1="0" y1="${y}" x2="1600" y2="${y}" stroke="#${A}" stroke-opacity="${(y % 100 ? 0.07 : 0.15) * o}"/>`; }
  else if (kind === "cells") { for (let x = 0; x <= 1600; x += 40) b += `<line x1="${x}" y1="0" x2="${x}" y2="900" stroke="#${A}" stroke-opacity="${0.09 * o}"/>`; for (let y = 0; y <= 900; y += 28) b += `<line x1="0" y1="${y}" x2="1600" y2="${y}" stroke="#${A}" stroke-opacity="${0.09 * o}"/>`; }
  else if (kind === "dotrows") for (let y = 30; y < 900; y += 30) b += `<line x1="0" y1="${y}" x2="1600" y2="${y}" stroke="#${T}" stroke-opacity="${0.13 * o}" stroke-dasharray="2 7"/>`;
  else if (kind === "guilloche") for (let k = 0; k < 7; k++) { let d0 = `M0 ${120 + k * 110}`; for (let x = 0; x <= 1600; x += 20) d0 += ` L${x} ${(120 + k * 110 + 26 * Math.sin(x / 70 + k) * Math.cos(x / 230)).toFixed(1)}`; b += `<path d="${d0}" fill="none" stroke="#${A}" stroke-opacity="${0.13 * o}" stroke-width="1.4"/>`; }
  else if (kind === "dots") { for (let x = 20; x < 1600; x += 40) for (let y = 20; y < 900; y += 40) b += `<circle cx="${x}" cy="${y}" r="1.9" fill="#${A}" fill-opacity="${0.25 * o}"/>`; }
  else if (kind === "lined") for (let y = 36; y < 900; y += 36) b += `<line x1="0" y1="${y}" x2="1600" y2="${y}" stroke="#${toi ? "FFFFFF" : c.muted}" stroke-opacity="${0.15 * o}" stroke-dasharray="1 5"/>`;
  else if (kind === "ruled") { for (let y = 64; y < 900; y += 32) b += `<line x1="0" y1="${y}" x2="1600" y2="${y}" stroke="#${A}" stroke-opacity="${0.1 * o}"/>`; b += `<line x1="96" y1="0" x2="96" y2="900" stroke="#${c.bad}" stroke-opacity="${0.35 * o}" stroke-width="2"/>`; }
  else if (kind === "sage") b = `<rect x="0" y="0" width="1600" height="900" fill="url(#g)"/>` + Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${100 * i + 50}" x2="1600" y2="${100 * i + 50}" stroke="#${A}" stroke-opacity="${0.035 * o}"/>`).join("");
  else if (kind === "grain") b = `<rect width="1600" height="900" filter="url(#n)" opacity="${toi ? 0.18 : 0.32}"/>`;
  else if (kind === "glow") b = `<circle cx="1420" cy="80" r="560" fill="url(#q)"/><circle cx="120" cy="860" r="460" fill="url(#q)"/>`;
  else return "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="none"><defs><radialGradient id="g" cx=".2" cy=".1" r="1.1"><stop offset="0" stop-color="#FFFFFF" stop-opacity="${toi ? 0 : 0.55}"/><stop offset="1" stop-color="#${A}" stop-opacity="${0.14 * o}"/></radialGradient>`
    + `<radialGradient id="q"><stop offset="0" stop-color="#${A}" stop-opacity="${toi ? 0.22 : 0.18}"/><stop offset="1" stop-color="#${A}" stop-opacity="0"/></radialGradient>`
    + `<filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 ${hx(c.ink).map((v) => (v / 255).toFixed(2)).join(" 0 0 0 0 ")} 0 0 0 0 .09 0"/></filter></defs>${b}</svg>`;
}

// ---------- khung toàn slide (SVG 1600×900, nằm sát mép, ngoài lề nội dung) ----------
function khungSvg(kind, c, toi) {
  const A = toi ? c.gold : c.acc, B = c.bad, P = 120; // 120 đơn vị / inch (1600 / 13,333)
  let b = "";
  if (kind === "double") b = `<rect x="${0.16 * P}" y="${0.16 * P}" width="${1600 - 0.32 * P}" height="${900 - 0.32 * P}" fill="none" stroke="#${A}" stroke-width="3" stroke-opacity="${toi ? 0.7 : 1}"/><rect x="${0.22 * P}" y="${0.22 * P}" width="${1600 - 0.44 * P}" height="${900 - 0.44 * P}" fill="none" stroke="#${A}" stroke-width="1.2" stroke-opacity="${toi ? 0.7 : 1}"/>`
    + `<g transform="translate(800 ${900 - 0.19 * P})"><line x1="-60" y1="0" x2="-12" y2="0" stroke="#${A}" stroke-width="2"/><line x1="12" y1="0" x2="60" y2="0" stroke="#${A}" stroke-width="2"/><rect x="-6" y="-6" width="12" height="12" transform="rotate(45)" fill="#${A}"/></g>`;
  else if (kind === "hazard") { let st = ""; for (let x = -40; x < 1640; x += 36) st += `<polygon points="${x},900 ${x + 18},900 ${x + 38},${900 - 0.15 * P} ${x + 20},${900 - 0.15 * P}" fill="#1B2433"/>`; b = `<rect x="0" y="${900 - 0.15 * P}" width="1600" height="${0.15 * P}" fill="#F2B705"/>${st}`; }
  else if (kind === "dimension") { const y = 0.12 * P; let t = ""; for (let x = 0.4 * P; x <= 1600 - 0.4 * P; x += 0.5 * P) t += `<line x1="${x}" y1="${y - 6}" x2="${x}" y2="${y + 6}" stroke="#${A}" stroke-width="1.5"/>`;
    b = `<line x1="${0.4 * P}" y1="${y}" x2="${1600 - 0.4 * P}" y2="${y}" stroke="#${A}" stroke-width="1.5"/>${t}<polygon points="${0.4 * P},${y} ${0.4 * P + 14},${y - 6} ${0.4 * P + 14},${y + 6}" fill="#${A}"/><polygon points="${1600 - 0.4 * P},${y} ${1600 - 0.4 * P - 14},${y - 6} ${1600 - 0.4 * P - 14},${y + 6}" fill="#${A}"/><rect x="${0.08 * P}" y="${0.22 * P}" width="${1600 - 0.16 * P}" height="${900 - 0.3 * P}" fill="none" stroke="#${A}" stroke-opacity=".5" stroke-width="1.2"/>`; }
  else if (kind === "perforated") { const t = 0.09 * P; for (let x = 0; x < 1600; x += 24) b += `<polygon points="${x},0 ${x + 12},${t} ${x + 24},0" fill="#${A}" fill-opacity=".25"/><polygon points="${x},900 ${x + 12},${900 - t} ${x + 24},900" fill="#${A}" fill-opacity=".25"/>`; }
  else if (kind === "secure") { const y = 900 - 0.17 * P; b = `<rect x="0" y="${y}" width="1600" height="${0.17 * P}" fill="#${A}" fill-opacity=".1"/><line x1="0" y1="${0.06 * P}" x2="1600" y2="${0.06 * P}" stroke="#${A}" stroke-width="2"/>`;
    for (let k = 0; k < 3; k++) { let d0 = `M0 ${y + 8 + k * 8}`; for (let x = 0; x <= 1600; x += 8) d0 += ` L${x} ${(y + 8 + k * 8 + 4 * Math.sin(x / 9 + k * 2)).toFixed(1)}`; b += `<path d="${d0}" fill="none" stroke="#${A}" stroke-opacity=".45" stroke-width="1"/>`; } }
  else if (kind === "corners") { const a = 0.32 * P, m = 0.1 * P; for (const [x, y, sx, sy] of [[m, m, 1, 1], [1600 - m, m, -1, 1], [m, 900 - m, 1, -1], [1600 - m, 900 - m, -1, -1]]) b += `<path d="M${x} ${y + sy * a} L${x} ${y} L${x + sx * a} ${y}" fill="none" stroke="#${A}" stroke-width="3"/><circle cx="${x + sx * 14}" cy="${y + sy * 14}" r="4" fill="#${A}"/>`; }
  else if (kind === "seal") b = `<g transform="translate(${1600 - 0.55 * P} ${900 - 0.2 * P}) rotate(-35)"><rect x="-150" y="-13" width="300" height="26" fill="#${B}" fill-opacity=".8"/><line x1="-150" y1="-9" x2="150" y2="-9" stroke="#fff" stroke-dasharray="6 5" stroke-opacity=".8"/><line x1="-150" y1="9" x2="150" y2="9" stroke="#fff" stroke-dasharray="6 5" stroke-opacity=".8"/></g><line x1="${0.14 * P}" y1="0" x2="${0.14 * P}" y2="900" stroke="#${B}" stroke-opacity=".35" stroke-width="2"/>`;
  else if (kind === "daystrip") { const x0 = 0.6 * P, cw = (1600 - 1.2 * P) / 31, y = 0.04 * P, h = 0.11 * P; for (let i = 0; i < 31; i++) b += `<rect x="${x0 + i * cw + 1}" y="${y}" width="${cw - 2}" height="${h}" fill="#${i % 7 === 6 ? B : A}" fill-opacity="${i % 7 === 6 ? 0.55 : 0.18}"/>`; }
  else if (kind === "tabs") { const y = 900 - 0.13 * P; for (let i = 0; i < 4; i++) b += `<path d="M${1100 + i * 115} 900 L${1106 + i * 115} ${y} L${1196 + i * 115} ${y} L${1202 + i * 115} 900 Z" fill="#${i === 0 ? A : c.line}" fill-opacity="${i === 0 ? 0.85 : 0.9}"/>`; }
  else if (kind === "margin") b = `<line x1="${0.5 * P}" y1="0" x2="${0.5 * P}" y2="900" stroke="#${B}" stroke-opacity=".45" stroke-width="2"/><line x1="${0.5 * P + 6}" y1="0" x2="${0.5 * P + 6}" y2="900" stroke="#${B}" stroke-opacity=".3" stroke-width="1"/>`;
  else return "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="none">${b}</svg>`;
}

// ---------- vỏ thẻ (CSS cho .card trên trang sáng) ----------
const pad = (s) => s.replace(/\n\s*/g, " ");
function theCss(kind, c, S) {
  const A = c.acc, L = c.line, B = c.bad, W = "#fff", sh = "0 10px 22px rgba(0,0,0,.09)";
  const base = `${S} .card { position: relative; background: ${W}; border: 2px solid #${L}; box-shadow: ${sh}; }`;
  const K = {
    ledger: `${S} .card { border-color: #${A}; box-shadow: inset 0 16px 0 #${A}, ${sh}; }
      ${S} .card::after { content: ""; position: absolute; inset: 24px 8px 8px 8px; border: 1.5px solid ${rgba(A, 0.4)}; pointer-events: none; }
      ${S} .card:nth-child(even) { box-shadow: inset 16px 0 0 #${A}, ${sh}; }
      ${S} .card:nth-child(even)::before { content: ""; position: absolute; left: 6px; top: 14px; bottom: 14px; width: 3px; background: repeating-linear-gradient(#fff 0 12px, transparent 12px 26px); }
      ${S} .card:nth-child(even)::after { inset: auto -18px -18px auto; width: 58px; height: 58px; border-radius: 50%; border: 3px solid ${rgba(B, 0.45)}; background: ${rgba(B, 0.06)}; }`,
    timecard: `${S} .card { border-color: #${L}; box-shadow: inset 0 20px 0 #${A}, ${sh}; }
      ${S} .card::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 20px; background: linear-gradient(90deg, transparent 85.7%, #${B} 85.7%), repeating-linear-gradient(90deg, transparent 0 calc(14.2857% - 2px), rgba(255,255,255,.9) calc(14.2857% - 2px) 14.2857%); }
      ${S} .card::after { content: ""; position: absolute; left: calc(50% - 11px); top: 30px; width: 22px; height: 22px; border-radius: 50%; background: #${c.page}; box-shadow: inset 0 0 0 2px ${rgba(A, 0.5)}; }`,
    container: `${S} .card { border: none; background: #fff repeating-linear-gradient(90deg, ${rgba(c.ink, 0.035)} 0 10px, transparent 10px 20px); box-shadow: inset 18px 0 0 #${A}, ${sh}; }
      ${S} .card::before, ${S} .card::after { content: ""; position: absolute; width: 22px; height: 22px; background: #${c.ink}; }
      ${S} .card::before { right: 0; top: 0; } ${S} .card::after { right: 0; bottom: 0; }`,
    dimension: `${S} .card { border: 2px solid #${A}; box-shadow: none; }
      ${S} .card::before, ${S} .card::after { content: ""; position: absolute; width: 26px; height: 26px; border: 0 solid #${A}; }
      ${S} .card::before { left: -14px; top: -14px; border-left-width: 2px; border-top-width: 2px; } ${S} .card::after { right: -14px; bottom: -14px; border-right-width: 2px; border-bottom-width: 2px; }`,
    receipt: `${S} .card { border: none; box-shadow: inset 0 8px 0 #${A}, ${sh}; margin-bottom: 14px; }
      ${S} .card::after { content: ""; position: absolute; left: 0; right: 0; bottom: -14px; height: 14px; background: linear-gradient(-45deg, transparent 10px, #fff 0) 0 0 / 20px 14px repeat-x, linear-gradient(45deg, transparent 10px, #fff 0) 0 0 / 20px 14px repeat-x; }
      ${S} .card::before { content: ""; position: absolute; left: 16px; right: 16px; bottom: 10px; height: 6px; border-top: 1.5px solid ${rgba(A, 0.6)}; border-bottom: 1.5px solid ${rgba(A, 0.6)}; }`,
    stub: `${S} .card { border: 2px solid #${A}; border-radius: 14px; box-shadow: inset 0 -14px 0 ${rgba(A, 0.9)}, ${sh}; }
      ${S} .card::before { content: ""; position: absolute; left: 18px; top: 12px; bottom: 22px; border-left: 2px dotted ${rgba(A, 0.6)}; }
      ${S} .card::after { content: ""; position: absolute; right: 18px; top: 16px; width: 46px; height: 34px; border-radius: 6px; background: linear-gradient(135deg, #${c.gold}, ${"#" + mix(c.gold, "000000", 0.25)}); }`,
    node: `${S} .card { border: 2.5px solid #${A}; border-radius: 18px; box-shadow: 0 8px 18px ${rgba(A, 0.14)}; }
      ${S} .card::before { content: ""; position: absolute; left: calc(50% - 2px); top: -24px; width: 4px; height: 22px; background: #${A}; }
      ${S} .card::after { content: ""; position: absolute; left: calc(50% - 9px); top: -32px; width: 18px; height: 18px; border-radius: 50%; background: #${A}; }`,
    field: `${S} .card { border: 1.5px solid #${L}; box-shadow: 8px 10px 0 #${mix(c.page, c.ink, 0.07)}, ${sh}; }
      ${S} .card::before { content: ""; position: absolute; left: 14px; top: 0; bottom: 0; width: 2px; background: ${rgba(B, 0.4)}; }
      ${S} .card::after { content: ""; position: absolute; left: 30px; right: 18px; bottom: 12px; border-bottom: 2px dotted ${rgba(c.muted, 0.45)}; }`,
    file: `${S} .card { background: #FFFDF7; border: 1.5px solid #${L}; box-shadow: 10px 10px 0 #${mix(c.page, c.ink, 0.06)}, 10px 10px 0 1.5px #${L}, ${sh}; }
      ${S} .card::after { content: ""; position: absolute; right: 26px; top: -22px; width: 26px; height: 70px; border: 5px solid #8C96A3; border-radius: 13px; border-bottom-color: transparent; }`,
    tape: `${S} .card { border: none; box-shadow: 0 12px 26px rgba(0,0,0,.1); }
      ${S} .card::before { content: ""; position: absolute; left: calc(50% - 70px); top: -16px; width: 140px; height: 34px; background: ${rgba(c.gold, 0.55)}; rotate: -3deg; }`,
    glass: `${S} .card { background: rgba(255,255,255,.74); border: 2px solid ${rgba(A, 0.22)}; border-radius: 24px; box-shadow: 0 18px 36px ${rgba(A, 0.16)}, inset 0 1px 0 #fff; }`,
    pinned: `${S} .card { background: #FBF4E2; border: none; box-shadow: 3px 4px 0 rgba(60,40,20,.14), 12px 18px 26px rgba(14,6,0,.35); }
      ${S} .card::after { content: ""; position: absolute; left: calc(50% - 20px); top: -14px; width: 40px; height: 40px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #ffc9bf 0 8%, #e3382c 34%, #9d170f 76%, #5d0c07 100%); box-shadow: 5px 8px 7px rgba(10,4,0,.45); }`,
    treaty: `${S} .card { background: #FFFBF0; border: 2px solid #${c.gold}; box-shadow: inset 0 0 0 5px #FFFBF0, inset 0 0 0 6.5px ${rgba(c.gold, 0.7)}, 0 12px 24px rgba(2,8,22,.25); }`,
  };
  return pad(base + (K[kind] || ""));
}

// ---------- nhãn (kicker), ô số, thanh tiến độ ----------
function nhanCss(kind, S) {
  if (kind === "outline") return `${S} .k { border: 2px solid currentColor; padding: 7px 16px 6px; } ${S} .k::before { display: none; }`;
  if (kind === "solid") return `${S}.light .k { background: var(--hl); color: #fff; padding: 7px 16px 6px; } ${S}.light .k::before { display: none; } ${S}.light .k em { color: #fff; }`;
  if (kind === "tab") return `${S} .k { border: 2px solid currentColor; border-bottom: none; border-radius: 10px 10px 0 0; padding: 7px 18px 8px; box-shadow: 0 2px 0 currentColor; } ${S} .k::before { display: none; }`;
  if (kind === "pill") return `${S} .k { background: ${"var(--da-tint)"}; border-radius: 999px; padding: 7px 18px 6px; } ${S} .k::before { width: 14px; height: 14px; border-radius: 50%; }`;
  return "";
}
function soCss(kind, c, S) {
  const A = c.acc;
  if (kind === "cell") return `${S} .ag-no { color: #${A}; border: 3px solid #${A}; box-shadow: inset 0 0 0 5px #fff, inset 0 0 0 6.5px ${rgba(A, 0.5)}; }`;
  if (kind === "round") return `${S} .ag-no { border-radius: 50%; }`;
  return "";
}
function tienDoCss(kind, c, S) {
  const A = c.acc, B = c.bad;
  const P = {
    stamps: `height: 16px; background: repeating-linear-gradient(90deg, #${A} 0 30px, transparent 30px 38px);`,
    days: `height: 16px; background: repeating-linear-gradient(90deg, #${A} 0 22px, transparent 22px 26px, #${A} 26px 48px, transparent 48px 52px, #${A} 52px 74px, transparent 74px 78px, #${A} 78px 100px, transparent 100px 104px, #${A} 104px 126px, transparent 126px 130px, #${A} 130px 152px, transparent 152px 156px, #${B} 156px 178px, transparent 178px 182px);`,
    train: `height: 18px; background: repeating-linear-gradient(90deg, #${A} 0 64px, #${c.ink} 64px 70px, transparent 70px 76px);`,
    ruler: `height: 16px; background: repeating-linear-gradient(90deg, #${A} 0 3px, transparent 3px 24px) bottom / 100% 16px no-repeat, linear-gradient(#${A}, #${A}) bottom / 100% 4px no-repeat;`,
    tape: `height: 14px; background: #${A}; clip-path: polygon(0 0, 100% 0, calc(100% - 10px) 50%, 100% 100%, 0 100%);`,
    balance: `height: 18px; background: repeating-linear-gradient(90deg, #${A} 0 18px, transparent 18px 26px); clip-path: polygon(0 70%, 100% 0, 100% 100%, 0 100%);`,
    nodes: `height: 14px; background: radial-gradient(circle at 7px 7px, #${A} 6px, transparent 7px) 0 0 / 34px 14px repeat-x, linear-gradient(#${A}, #${A}) 0 6px / 100% 2px no-repeat;`,
    folio: `height: 12px; background: repeating-linear-gradient(90deg, #${A} 0 40px, ${rgba(A, 0.45)} 40px 44px);`,
    plain: "",
  };
  return P[kind] ? `${S} .prog { ${P[kind]} }` : "";
}

/** CSS của da cho deck (đã thay màu của bảng gốc "son" bằng màu của da qua bang_mau). S = bộ chọn slide. */
function daCss(ten) {
  const c = DA[ten], S = `.s.da-${ten}`, T = `${S}[data-tu]`, A = c.acc;
  const dark = mix(A, "000000", 0.6), dark2 = mix(A, "000000", 0.45);
  const nenL = nenSvg(c.nen, c, false), nenD = nenSvg(c.nen, c, true);
  let css = `${S} { --da-tint: ${rgba(A, 0.1)}; }
    ${S}.light { ${c.to ? "" : `background-color: #${c.page}; ${nenL ? `background-image: ${b64(nenL)}; background-size: 100% 100%;` : ""}`} --fg: #${c.ink}; --mut: #${c.muted}; --hl: #${A}; --card: #fff; --rule: #${c.line}; --edge: #${A}; --bad: #${c.bad}; --good: #${c.good}; --shadow: ${rgba(c.ink, 0.25)}; color: #${c.ink}; }
    ${S}.dark { ${c.to ? "" : `background-color: #${dark}; ${nenD ? `background-image: ${b64(nenD)}; background-size: 100% 100%;` : ""}`} --hl: #${c.gold}; --card: #${dark2}; --rule: ${rgba("FFFFFF", 0.28)}; }
    ${S}.dark::before { background: radial-gradient(closest-side, ${rgba(mix(A, "FFFFFF", 0.35), 0.35)}, transparent 72%); }
    ${S}.red { ${c.to ? "" : `background-color: #${A}; ${nenD ? `background-image: ${b64(nenD)}; background-size: 100% 100%;` : ""}`} --hl: #${c.gold}; --card: #${dark2}; --bad: #${mix(c.bad, "FFFFFF", 0.55)}; --good: #fff; }
    ${S} .prog { background: var(--hl); }
    ${S} .k { align-self: flex-start; }
    ${T}.light .stat, ${T}.light table { background: #fff; }
    .da-khung, .da-art, .da-vat, .da-to { position: absolute; pointer-events: none; }
    .da-khung { inset: 0; z-index: 1; } .da-khung svg, .da-art svg, .da-vat svg { width: 100%; height: 100%; display: block; }
    .da-art { z-index: 1; } .da-vat { z-index: 3; }
    ${S}.sec .big { opacity: .45; }
    `;
  css += theCss(c.the, c, T + ".light") + nhanCss(c.nhan, S) + soCss(c.so, c, S) + tienDoCss(c.tienDo, c, S);
  if (c.to === "bc") css += `${T}.light .da-to { left: 64px; right: 64px; top: 96px; bottom: 40px; z-index: 0; background: #F6EEDB; box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 3px 4px 0 rgba(60,40,20,.14), 15px 22px 28px rgba(14,6,0,.5); }
    ${T}.light .da-to::before, ${T}.light .da-to::after { content: ""; position: absolute; top: -14px; width: 44px; height: 44px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #ffc9bf 0 8%, #e3382c 34%, #9d170f 76%, #5d0c07 100%); box-shadow: 6px 10px 8px rgba(10,4,0,.5); }
    ${T}.light .da-to::before { left: 60px; } ${T}.light .da-to::after { right: 60px; }
    ${T}.light .bar span, ${T}.light .bar .cnt { color: #f4ecd8; text-shadow: 0 2px 6px rgba(0,0,0,.5); }`;
  if (c.to === "qt") css += `${T}.light .da-to { left: 64px; right: 64px; top: 96px; bottom: 40px; z-index: 0; background: #F7F1E1; box-shadow: inset 0 0 0 10px #F7F1E1, inset 0 0 0 13px #C9A24A, inset 0 0 0 18px #F7F1E1, inset 0 0 0 19.5px #C9A24A, 0 24px 40px rgba(2,8,22,.55); }
    ${T}.light .da-to::after { content: ""; position: absolute; right: 70px; top: -26px; width: 64px; height: 64px; border-radius: 50%; background: radial-gradient(circle at 38% 34%, #e35b4c, #a3261f 60%, #6d140f); box-shadow: 4px 8px 8px rgba(0,0,0,.4); }
    ${T}.light .bar span, ${T}.light .bar .cnt { color: #eef2f8; text-shadow: 0 2px 6px rgba(0,0,0,.5); }`;
  return pad(css);
}

/** Màu của da dưới dạng phép đổi màu cho bang_mau.doiMauBang: màu gốc "son" → màu của da (mọi màu cứng trong SVG biểu đồ, cảnh cũng theo). */
function daMau(ten) {
  const c = DA[ten], A = c.acc, ink = c.to ? c.ink : mix(A, "000000", 0.6);
  return {
    "0c1222": ink, "172038": mix(A, "000000", 0.45), "2a3654": mix(A, "000000", 0.3), "3a4664": mix(A, "000000", 0.15), "2a3350": mix(A, "000000", 0.32), "141c33": mix(A, "000000", 0.52),
    "55607e": mix(A, "888888", 0.5), "05070d": mix(A, "000000", 0.85), "a7b0c6": mix(A, "FFFFFF", 0.62), "c3cadb": mix(A, "FFFFFF", 0.75),
    "f4eddc": c.page, "e9dfc8": mix(c.page, A, 0.08), "d6c9aa": mix(c.page, A, 0.2), "fffaf0": "ffffff",
    "e2402a": c.bad, "b62c1a": mix(c.bad, "000000", 0.2), "ff8672": mix(c.bad, "FFFFFF", 0.45), "ffe0d6": mix(A, "FFFFFF", 0.82),
    "f6b93b": c.gold, "2c9566": c.good, "62d6a0": mix(c.good, "FFFFFF", 0.45), "5b5443": c.muted, "8f866f": mix(c.muted, "FFFFFF", 0.3),
  };
}

// đồ vật / hình lớn → SVG (màu của da)
const vatSvg = (ten, c) => { const f = PROPS[ten]; return f ? f({ acc: c.acc, gold: c.gold, ink: c.ink, tape: c.gold, accLight: mix(c.acc, "FFFFFF", 0.5), bad: c.bad }).svg : ""; };
const artSvg = (ten, c, nen) => { const f = ART[ten]; return f ? f(c.acc, c.bad, nen || "FFFFFF") : ""; };

const LOAI_SANG = new Set(["light"]);
/** Thêm chất liệu vào một <section> của type thường: lớp da-<tên>, khung, tờ giấy (bc / qt), hình lớn (bìa / chương / kết), đồ vật tiền cảnh. */
function phuSlide(html, ten, { type, i, coHinhDan, coAnh, art }) {
  const c = DA[ten]; if (!c) return html;
  const m = html.match(/^<section class="s ([^"]*)"/); if (!m) return html;
  const cls = m[1].split(/\s+/), sang = cls.includes("light"), toi = cls.includes("dark") || cls.includes("red");
  let them = "";
  if (c.to && sang) them += `<div class="da-to"></div>`;
  const kh = khungSvg(c.khung, c, toi && !sang); if (kh && !c.to) them += `<div class="da-khung">${kh}</div>`;
  if (c.to) html = html.replace(/^<section class="s /, `<section class="s ${c.to} `);   // nền của bộ (bảng bần / bản đồ chấm) cho mọi slide; slide sáng có thêm tờ giấy
  // hình lớn: chương / kết / bìa không ảnh / mở bài — chỉ khi slide chưa có hình dán hay ảnh
  const hinh = art || c.art, nenArt = toi ? mix(c.acc, "000000", 0.45) : c.page;
  if (!coHinhDan && !coAnh && hinh) {
    const P = { section: "left:1250px;top:300px;width:560px;height:430px", end: "left:1270px;top:170px;width:520px;height:400px", cover: "left:1180px;top:250px;width:620px;height:480px", statement: "left:1520px;top:110px;width:300px;height:230px" }[type];
    if (P) them += `<div class="da-art" style="${P}">${artSvg(hinh, toi ? { ...c, acc: c.gold, bad: mix(c.bad, "FFFFFF", 0.4) } : c, nenArt)}</div>`;
  }
  // đồ vật tiền cảnh: chỉ slide nội dung sáng; hinh.js (hinhDatVatDa) tìm góc trống, không có thì bỏ
  if (sang && !["cover", "section", "end", "closing"].includes(type) && c.vat.length) them += `<div class="da-vat" data-da-vat style="width:190px;height:190px">${vatSvg(c.vat[i % c.vat.length], c)}</div>`;
  return html.replace(/^<section class="s /, `<section class="s da da-${ten} `).replace(/<\/section>\s*$/, them + "</section>");
}

/** Slide cảnh (hinh/canh.js) và bộ hình riêng: chỉ thêm khung toàn slide của da (cảnh tự vẽ vật thật, không phủ thẻ). */
function khungSlide(html, ten) {
  const c = DA[ten]; if (!c || c.to) return html;
  const m = html.match(/^<section class="s ([^"]*)"/); if (!m) return html;
  const toi = !/\blight\b/.test(m[1]), kh = khungSvg(c.khung, c, toi); if (!kh) return html;
  return html.replace(/<\/section>\s*$/, `<div class="da-khung">${kh}</div></section>`);
}

const CHUYEN = { stamp: "stamp", flip: "flip", slide: "slide", wipe: "wipe", drop: "drop", pop: "pop", rise: "rise" };
module.exports = { DA, NAMES, ALIAS, AUTO, chonDa, daCss, daMau, phuSlide, khungSlide, khungSvg, nenSvg, vatSvg, artSvg, CHUYEN, mix };
