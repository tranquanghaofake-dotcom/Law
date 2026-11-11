// BỘ CHẤT LIỆU (meta.kit) — nguyên tắc rút từ nhiều mẫu slide (xem references/nguyen-tac-bo-cuc.md), KHÔNG chép mẫu nào:
//   1. Một thế giới, nhiều bố cục: nền, kiểu thẻ, kiểu nhãn, đồ vật giữ nguyên cả deck; bố cục đổi tự do.
//   2. Ba tầng chiều sâu: nền (vân / quầng màu) → nội dung (thẻ, chữ) → tiền cảnh (MỘT vật nhỏ tràn ra mép slide).
//   3. Vắt mép: vật đánh dấu thẻ chính nằm trên đường ranh giới thẻ (kẹp giấy, băng dính, viên kính).
//   4. Vật hoá thông tin: thẻ "là" một vật của thế giới (tờ giấy trong hồ sơ, mẩu giấy dán, tấm kính).
//   5. Siêu dữ liệu có hình riêng: ngày, điều luật, thời hạn, nguồn → nhãn mang hình của thế giới (tab hồ sơ, ruy băng, viên thuốc).
// Mỗi bộ chỉ KHAI BÁO; build.js áp vào các hàm chung box() / chip() / foot() nên mọi bố cục tự đổi theo.
// Thêm bộ mới: một khối { label, card, tag, mark, bg, props } — đồ vật lấy từ PROPS hoặc thêm hàm vẽ mới (SVG thuần, không ảnh).
const f1 = (v) => (Math.round(v * 10) / 10).toString();
const SHADOW = `<filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="6" dy="10" stdDeviation="9" flood-color="#000" flood-opacity=".22"/></filter>`;
const svg = (w, h, body, defs = "") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs>${SHADOW}${defs}</defs><g filter="url(#sh)">${body}</g></svg>`;

// ---------- ĐỒ VẬT (vẽ bằng code, phẳng + bóng đổ mềm). Mỗi hàm (P) → { svg, ratio (rộng/cao) }. P = bảng màu theme ----------
const PROPS = {
  // kẹp giấy: hai vòng lồng nhau
  clip: (P) => ({ ratio: 0.42, svg: svg(84, 200, `<path d="M20,30 L20,150 A22,22 0 0 0 64,150 L64,40 A14,14 0 0 0 36,40 L36,140" fill="none" stroke="#8C96A3" stroke-width="9" stroke-linecap="round"/><path d="M20,30 L20,150 A22,22 0 0 0 64,150 L64,40 A14,14 0 0 0 36,40 L36,140" fill="none" stroke="#D5DBE2" stroke-width="3" stroke-linecap="round"/>`) }),
  // băng dính giấy: dải mờ, hai đầu răng cưa
  tape: (P) => { let e1 = "", e2 = ""; for (let i = 0; i <= 6; i++) { e1 += `${i % 2 ? 6 : 0},${i * 10} `; e2 += `${i % 2 ? 214 : 220},${i * 10} `; }
    return { ratio: 220 / 60, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60"><polygon points="${e1}${e2.split(" ").filter(Boolean).reverse().join(" ")}" fill="#${P.tape}" fill-opacity=".78"/></svg>` }; },
  // đinh ghim: mũ tròn màu nhấn + bóng
  pin: (P) => ({ ratio: 1, svg: svg(120, 120, `<line x1="60" y1="60" x2="78" y2="104" stroke="#9AA3AD" stroke-width="5" stroke-linecap="round"/><circle cx="60" cy="52" r="26" fill="#${P.acc}"/><circle cx="51" cy="43" r="8" fill="#fff" fill-opacity=".45"/>`) }),
  // bút chì nằm chéo
  pencil: (P) => ({ ratio: 3.2, svg: svg(480, 150, `<g transform="rotate(-12 240 75)"><polygon points="40,60 360,60 360,96 40,96" fill="#${P.gold}"/><polygon points="40,60 360,60 360,72 40,72" fill="#fff" fill-opacity=".25"/><polygon points="360,60 420,78 360,96" fill="#E9D3B0"/><polygon points="404,73 420,78 404,83" fill="#333"/><rect x="18" y="60" width="26" height="36" fill="#B9BEC5"/><rect x="0" y="60" width="20" height="36" rx="6" fill="#E59A9A"/></g>`) }),
  // thước kẻ có vạch
  ruler: (P) => { let t = ""; for (let x = 24; x < 560; x += 16) t += `<line x1="${x}" y1="0" x2="${x}" y2="${(x / 16) % 5 === 0 ? 30 : 18}" stroke="#7A6A50" stroke-width="2"/>`;
    return { ratio: 600 / 150, svg: svg(600, 150, `<g transform="rotate(-8 300 75) translate(10 40)"><rect width="580" height="70" rx="6" fill="#E8D9B8"/>${t}</g>`) }; },
  // kính lúp
  lens: (P) => ({ ratio: 1, svg: svg(200, 200, `<line x1="128" y1="128" x2="186" y2="186" stroke="#3B3B3B" stroke-width="18" stroke-linecap="round"/><circle cx="84" cy="84" r="62" fill="#${P.acc}" fill-opacity=".08" stroke="#4A4A4A" stroke-width="12"/><path d="M50,62 A42,42 0 0 1 84,40" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".8"/>`) }),
  // bút máy
  pen: (P) => ({ ratio: 3.2, svg: svg(480, 150, `<g transform="rotate(14 240 75)"><rect x="40" y="60" width="250" height="34" rx="17" fill="#${P.ink}"/><rect x="250" y="62" width="70" height="30" fill="#C9A45C"/><polygon points="320,62 410,77 320,92" fill="#B8BEC6"/><line x1="330" y1="77" x2="400" y2="77" stroke="#555" stroke-width="2"/><rect x="70" y="52" width="120" height="8" rx="4" fill="#C9A45C"/></g>`) }),
  // viên kính tròn (quả cầu trong) — bộ "kính"
  orb: (P) => ({ ratio: 1, svg: svg(200, 200, `<circle cx="100" cy="100" r="78" fill="url(#og)"/><ellipse cx="74" cy="66" rx="30" ry="18" fill="#fff" fill-opacity=".55" transform="rotate(-30 74 66)"/>`,
    `<radialGradient id="og" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#${P.accLight}"/><stop offset="1" stop-color="#${P.acc}"/></radialGradient>`) }),
  // chồng xu (tài chính, quỹ) — 4 đồng lệch nhẹ, mặt trên có vạch sáng
  coins: (P) => ({ ratio: 1.3, svg: svg(260, 200, [0, 1, 2, 3].map(i => `<ellipse cx="${130 + (i % 2 ? 6 : -4)}" cy="${160 - i * 30}" rx="92" ry="28" fill="#${P.gold}" stroke="#${P.ink}" stroke-opacity=".25" stroke-width="3"/><rect x="${38 + (i % 2 ? 6 : -4)}" y="${160 - i * 30}" width="184" height="12" fill="#${P.gold}" opacity=".85"/>`).join("") + `<ellipse cx="124" cy="70" rx="56" ry="14" fill="#fff" fill-opacity=".35"/>`) }),
  // sổ gập (sổ BHXH / hồ sơ cá nhân) — bìa màu nhấn, nhãn trắng, dây đánh dấu
  booklet: (P) => ({ ratio: 0.82, svg: svg(200, 244, `<g transform="rotate(-8 100 122)"><rect x="30" y="20" width="140" height="200" rx="10" fill="#${P.acc}"/><rect x="30" y="20" width="18" height="200" rx="6" fill="#${P.ink}" fill-opacity=".25"/><rect x="66" y="64" width="84" height="40" rx="6" fill="#fff" fill-opacity=".85"/><circle cx="108" cy="150" r="22" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="5"/><rect x="138" y="200" width="12" height="40" fill="#${P.gold}"/></g>`) }),
  // ba cột kính (số liệu tăng) — gradient trong, đỉnh sáng
  bars: (P) => ({ ratio: 1.2, svg: svg(240, 200, [[30, 110], [100, 70], [170, 30]].map(([x, y]) => `<rect x="${x}" y="${y}" width="50" height="${190 - y}" rx="10" fill="url(#bg)"/><rect x="${x + 8}" y="${y + 8}" width="10" height="${170 - y}" rx="5" fill="#fff" fill-opacity=".5"/>`).join(""),
    `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#${P.accLight}"/><stop offset="1" stop-color="#${P.acc}"/></linearGradient>`) }),
  // ---- đồ vật của 4 world đợt 2 + bổ sung (11/2026) ----
  // máy tính bỏ túi: màn hình + lưới phím (hoá đơn, thuế, kế toán)
  calculator: (P) => ({ ratio: 0.72, svg: svg(180, 250, `<g transform="rotate(-8 90 125)"><rect x="20" y="16" width="140" height="218" rx="16" fill="#${P.ink}"/><rect x="36" y="34" width="108" height="46" rx="6" fill="#DDE7DA"/><rect x="96" y="50" width="38" height="16" rx="3" fill="#${P.ink}" fill-opacity=".55"/>`
    + [0, 1, 2, 3].flatMap(r => [0, 1, 2].map(q => `<rect x="${38 + q * 36}" y="${96 + r * 32}" width="28" height="24" rx="5" fill="${r === 3 && q === 2 ? "#" + P.gold : "#FFFFFF"}" fill-opacity="${r === 3 && q === 2 ? 1 : 0.85}"/>`)).join("") + `</g>`) }),
  // thẻ ngân hàng: chip + dải số (không số thật, không logo)
  bankcard: (P) => ({ ratio: 1.55, svg: svg(310, 200, `<g transform="rotate(-10 155 100)"><rect x="20" y="30" width="270" height="168" rx="18" fill="#${P.acc}"/><rect x="20" y="30" width="270" height="168" rx="18" fill="url(#cg)"/>`
    + `<rect x="46" y="78" width="46" height="36" rx="6" fill="#${P.gold}"/><line x1="46" y1="96" x2="92" y2="96" stroke="#${P.ink}" stroke-opacity=".35" stroke-width="2"/>`
    + [0, 1, 2, 3].map(i => `<rect x="${46 + i * 56}" y="140" width="44" height="10" rx="5" fill="#FFFFFF" fill-opacity=".75"/>`).join("") + `</g>`,
    `<linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`) }),
  // con dấu cầm tay: cán gỗ + đế (mặt dấu TRƠN — không chữ, không hình cơ quan)
  stamp: (P) => ({ ratio: 0.8, svg: svg(200, 250, `<ellipse cx="100" cy="222" rx="70" ry="16" fill="#${P.bad || P.acc}" fill-opacity=".35"/><rect x="40" y="160" width="120" height="50" rx="10" fill="#${P.ink}"/>`
    + `<rect x="54" y="150" width="92" height="16" rx="6" fill="#5A4636"/><path d="M78 150 L84 70 Q100 44 116 70 L122 150 Z" fill="#8A6A4A"/><circle cx="100" cy="50" r="30" fill="#8A6A4A"/><ellipse cx="92" cy="42" rx="10" ry="7" fill="#fff" fill-opacity=".3"/>`) }),
  // container nhỏ: thân gờ tôn + cửa có thanh khoá (bến cảng, vận tải)
  crate: (P) => ({ ratio: 2.1, svg: svg(420, 200, `<rect x="16" y="40" width="388" height="140" rx="6" fill="#${P.acc}"/>` + [...Array(21).keys()].map(i => `<rect x="${30 + i * 17}" y="52" width="7" height="116" fill="#000" fill-opacity=".12"/>`).join("")
    + `<rect x="16" y="40" width="388" height="12" fill="#000" fill-opacity=".25"/><rect x="16" y="168" width="388" height="12" fill="#000" fill-opacity=".25"/>` + [330, 360].map(x => `<rect x="${x}" y="60" width="6" height="100" rx="3" fill="#E9E2D8"/>`).join("")) }),
  // vòng kính (xuyến dẹt)
  ring: (P) => ({ ratio: 1.6, svg: svg(320, 200, `<ellipse cx="160" cy="100" rx="130" ry="62" fill="none" stroke="url(#rg)" stroke-width="34"/>`,
    `<linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#${P.accLight}"/><stop offset="1" stop-color="#${P.acc}"/></linearGradient>`) }),
};

// ---------- BỘ CHẤT LIỆU ----------
// card: radius (inch, null = theo theme), border (true = viền màu line), shadow (mức bóng), stack (tờ giấy lệch phía sau thẻ chính)
// mark: vật vắt mép thẻ chính (tên trong PROPS) + vị trí; tag: hình nhãn siêu dữ liệu (pptxgenjs shape) + kiểu tô
// page: màu trang (manila = giấy bìa hồ sơ ngả vàng | tint = sắc nhạt của màu nhấn); num: ô số thứ tự square (như dấu) | round
// bg: lớp nền trang trí cho slide nền sáng: grain (vân giấy) | ruled (giấy kẻ dòng + lề) | glow (quầng màu nhấn ở hai góc) | none
// props: đồ vật tiền cảnh (mỗi slide nội dung tối đa MỘT, xoay vòng theo số slide, chỉ đặt ở mép slide còn trống)
const KITS = {
  file: { label: "Hồ sơ (bài luật, bản án, vụ việc)", card: { radius: 0.03, border: true, shadow: 0.12, stack: true },
    mark: { prop: "clip", at: "top-right" }, tag: { shape: "ROUND_2_SAME_RECTANGLE", style: "solid" }, num: "square", page: "manila", bg: "grain", props: ["clip", "pen", "lens"] },
  paper: { label: "Giấy học thuật (bài giảng, tiểu luận)", card: { radius: 0, border: false, shadow: 0.14, stack: false },
    mark: { prop: "tape", at: "top-center" }, tag: { shape: "PENTAGON", style: "solid" }, num: "round", bg: "ruled", props: ["pencil", "ruler", "pin"] },
  glass: { label: "Kính (báo cáo, số liệu, công nghệ)", card: { radius: 0.2, border: true, shadow: 0.1, stack: false },
    mark: { prop: "orb", at: "top-right" }, tag: { shape: "ROUNDED_RECTANGLE", style: "soft" }, num: "round", page: "tint", bg: "glow", props: ["coins", "bars", "booklet", "ring"] },
};

// ---------- THẾ GIỚI THEO MÔN (11/2026) — mỗi world phủ CẢ deck: màu trang, font tiêu đề (chỉ font Office), nền, khung toàn slide,
// kiểu thẻ (dải màu mép), nhãn, ô số, đồ vật, hình mặc định. Dựng từ ẢNH THẬT của vật chủ đạo (xem references/the-gioi-hinh-anh.md);
// không mô phỏng giấy tờ đến mức giả được: không quốc huy, không biểu trưng cơ quan, không số hiệu biểu mẫu.
//   palette: ghi đè màu trang sáng (l) — acc / text / muted / line / deep / bad; page: màu trang (hex)
//   font: { title, titleBold } — CHỈ Calibri / Arial / Times New Roman (máy trình chiếu nào cũng có)
//   bg: sage | corrugated | blueprint | cells ; frame: double | hazard | dimension | daystrip (vẽ sát mép slide, ngoài vùng nội dung)
//   card.strip: top | left (dải màu nhấn trên mép thẻ) ; card.line: "acc" = viền thẻ màu nhấn ; tag.style: outline ; num: cell (ô bảng viền)
//   art: hình vẽ mặc định cho mục lục / kết / cảm ơn ; fits: từ khoá đề tài (build gợi ý khi đề tài không khớp)
//   motion: cách các ý hiện ra khi bật meta.motion — stamp (đóng dấu) | flip (lật lịch) | slide (trượt theo ray / quẹt thẻ) | wipe (vẽ nét) | unroll (giấy chạy ra) | pop (nút bật)
//   form: dáng dùng chung cho ô bước / đường nối / điểm mốc (stamp | day | container | dim | ticket | card | node | tab) — xem worldTile / worldLink / worldMarker
//   icons: bộ icon mặc định (thẻ không ghi icon, góc trên trái) — thay hình người chung chung ; progress: thanh tiến độ hình vật thật ở góc trên phải
//     stamps (ô dấu sổ) | days (ô ngày) | train (đoàn container) | ruler (thước) | tape (giấy hoá đơn) | balance (cột số dư) | nodes (nút sơ đồ) | folio ("Tờ 07/22")
Object.assign(KITS, {
  "so-bhxh": { motion: "stamp", form: "stamp", icons: ["PiBookOpenTextDuotone", "PiHeartbeatDuotone", "PiBabyDuotone", "PiCoinsDuotone", "PiFirstAidKitDuotone", "PiArmchairDuotone"], progress: "stamps", label: "Sổ BHXH (An sinh xã hội, BHXH, BHYT, BHTN, lương hưu)", fits: ["bảo hiểm", "bhxh", "bhyt", "bhtn", "an sinh", "lương hưu", "hưu trí", "thai sản", "ốm đau", "tử tuất", "trợ cấp"],
    palette: { acc: "2F6B3F", text: "1E2A22", muted: "4E5F53", line: "9CC29A", deep: "E3EFE0", bad: "9A3324", good: "2F6B3F" }, page: "F3F8F1",
    font: { title: "Times New Roman", titleBold: false }, bg: "sage", frame: "double",
    card: { radius: 0, border: true, line: "acc", shadow: 0.05, stack: false, strip: "top" , skin: "ledger" }, tag: { shape: "RECTANGLE", style: "outline" }, num: "cell",
    mark: { prop: "booklet", at: "top-right" }, props: ["booklet", "coins", "stamp"], hero: "sheet", art: "passbook" },
  "bang-cong": { motion: "flip", form: "day", icons: ["PiClockDuotone", "PiCalendarCheckDuotone", "PiIdentificationCardDuotone", "PiMoneyDuotone", "PiHardHatDuotone", "PiHandshakeDuotone"], progress: "days", label: "Bảng chấm công / phiếu lương (Luật Lao động, tiền lương, thời giờ làm việc)", fits: ["lao động", "tiền lương", "hợp đồng lao động", "sa thải", "kỷ luật lao động", "thời giờ", "tăng ca", "công đoàn", "đình công"],
    palette: { acc: "23407A", text: "16213A", muted: "4A5672", line: "BFCBE3", deep: "E6ECF7", bad: "B23A2B", good: "23407A" }, page: "F7F9FD",
    font: { title: "Arial", titleBold: true }, bg: "cells", frame: "daystrip",
    card: { radius: 0.04, border: true, shadow: 0.06, stack: false, strip: "top" , skin: "timecard" }, tag: { shape: "RECTANGLE", style: "solid" }, num: "cell",
    mark: { prop: "pin", at: "top-right" }, props: ["coins", "booklet", "calculator"], hero: "calendar", art: "idcard" },
  "cang-bien": { motion: "slide", form: "container", icons: ["PiShippingContainerDuotone", "PiBoatDuotone", "PiAnchorDuotone", "PiTruckDuotone", "PiPackageDuotone", "PiGlobeHemisphereWestDuotone"], progress: "train", label: "Bến cảng, container (Thương mại quốc tế, vận tải, hải quan, logistics)", fits: ["incoterms", "xuất khẩu", "nhập khẩu", "hải quan", "vận tải", "logistics", "container", "cảng", "thương mại quốc tế", "vận đơn"],
    palette: { acc: "A8401F", text: "1B2433", muted: "4D5566", line: "D9CFC4", deep: "F1E7DD", bad: "A8401F", good: "1F4E79" }, page: "F4F2EE",
    font: { title: "Arial", titleBold: true }, bg: "corrugated", frame: "hazard",
    card: { radius: 0, border: false, shadow: 0.1, stack: false, strip: "left" , skin: "container" }, tag: { shape: "RECTANGLE", style: "solid" }, num: "square",
    mark: { prop: "pin", at: "top-right" }, props: ["crate", "bars", "coins"], hero: "riskbar", art: "harbor" },
  "ban-ve": { motion: "wipe", form: "dim", icons: ["PiHouseLineDuotone", "PiRulerDuotone", "PiBlueprintDuotone", "PiMapTrifoldDuotone", "PiBuildingsDuotone", "PiCompassToolDuotone"], progress: "ruler", label: "Bản vẽ kỹ thuật (Đất đai, nhà ở, xây dựng, kinh doanh bất động sản)", fits: ["đất đai", "nhà ở", "xây dựng", "bất động sản", "thuê nhà", "thuê trọ", "quy hoạch", "chung cư", "giấy chứng nhận"],
    palette: { acc: "1F4E8C", text: "13233D", muted: "46597A", line: "B9CDE6", deep: "E7EFF9", bad: "9E3520", good: "1F4E8C" }, page: "F5F9FD",
    font: { title: "Arial", titleBold: true }, bg: "blueprint", frame: "dimension",
    card: { radius: 0, border: true, line: "acc", shadow: 0.0, stack: false , skin: "dimension" }, tag: { shape: "RECTANGLE", style: "outline" }, num: "cell",
    mark: { prop: "ruler", at: "top-center" }, props: ["ruler", "pencil"], hero: "plan", art: "house" },
  // đợt 2 (11/2026) — dựng từ vật thật: hoá đơn GTGT / biên lai (dòng hàng, cộng tiền hàng, thuế suất, tổng thanh toán), sao kê tài khoản (cột nợ / có / số dư, dòng xen màu,
  // hoa văn bảo an kiểu séc), sơ đồ cơ cấu sở hữu của hồ sơ doanh nghiệp, biên bản (trường kẻ chấm, chữ ký các bên, giấy niêm phong vắt mép)
  "hoa-don": { motion: "unroll", form: "ticket", icons: ["PiReceiptDuotone", "PiCalculatorDuotone", "PiPercentDuotone", "PiInvoiceDuotone", "PiBarcodeDuotone", "PiCoinsDuotone"], progress: "tape", label: "Hoá đơn / biên lai (Thuế, kế toán, phí – lệ phí)", fits: ["thuế", "hóa đơn", "hoá đơn", "gtgt", "vat", "kế toán", "thu nhập cá nhân", "tncn", "tndn", "quản lý thuế", "lệ phí", "ngân sách"],
    palette: { acc: "9B3D12", text: "2A1C14", muted: "5E4D42", line: "E2CDBE", deep: "F6E9DF", bad: "A3222E", good: "2E6B3A" }, page: "FBF8F3",
    font: { title: "Arial", titleBold: true }, bg: "dotrows", frame: "perforated",
    card: { radius: 0, border: false, shadow: 0.1, stack: false, skin: "receipt" }, tag: { shape: "RECTANGLE", style: "outline" }, num: "square",
    mark: { prop: "clip", at: "top-right" }, props: ["calculator", "coins", "clip"], hero: "receipt", art: "receipt" },
  "sao-ke": { motion: "slide", form: "card", icons: ["PiBankDuotone", "PiCreditCardDuotone", "PiArrowsLeftRightDuotone", "PiPiggyBankDuotone", "PiChartLineUpDuotone", "PiVaultDuotone"], progress: "balance", label: "Sao kê / sổ tiết kiệm (Ngân hàng, tín dụng, chứng khoán, thanh toán)", fits: ["ngân hàng", "tín dụng", "cho vay", "hợp đồng vay", "lãi suất", "tiền gửi", "thanh toán", "bảo lãnh", "chứng khoán", "sao kê", "rửa tiền"],
    palette: { acc: "0B5E73", text: "102A33", muted: "47606A", line: "BFD6DD", deep: "E3F0F3", bad: "A8332B", good: "1F6B45" }, page: "F5F9FA",
    font: { title: "Arial", titleBold: true }, bg: "guilloche", frame: "secure",
    card: { radius: 0.06, border: true, shadow: 0.06, stack: false, skin: "stub" }, tag: { shape: "ROUNDED_RECTANGLE", style: "solid" }, num: "round",
    mark: { prop: "pin", at: "top-right" }, props: ["bankcard", "coins", "bars"], hero: "account", art: "bankbook" },
  "co-cau": { motion: "pop", form: "node", icons: ["PiBuildingOfficeDuotone", "PiUsersThreeDuotone", "PiChartPieSliceDuotone", "PiTreeStructureDuotone", "PiHandshakeDuotone", "PiBriefcaseDuotone"], progress: "nodes", label: "Sơ đồ cơ cấu sở hữu (Luật Doanh nghiệp, cổ phần, M&A, quản trị công ty)", fits: ["doanh nghiệp", "công ty", "cổ phần", "cổ đông", "góp vốn", "thành viên góp vốn", "sáp nhập", "hợp nhất", "m&a", "quản trị công ty", "chuyển nhượng vốn"],
    palette: { acc: "3B3486", text: "1C1B33", muted: "52506E", line: "CBC8E6", deep: "ECEBF7", bad: "A3322B", good: "3B3486" }, page: "F7F7FB",
    font: { title: "Calibri", titleBold: true }, bg: "dots", frame: "corners",
    card: { radius: 0.08, border: true, line: "acc", shadow: 0.05, stack: false, skin: "node" }, tag: { shape: "ROUNDED_RECTANGLE", style: "outline" }, num: "round",
    mark: { prop: "pin", at: "top-right" }, props: ["bars", "pin", "bankcard"], hero: "captable", art: "orgchart" },
  "bien-ban": { motion: "stamp", form: "tab", icons: ["PiScalesDuotone", "PiGavelDuotone", "PiFingerprintDuotone", "PiFileTextDuotone", "PiMagnifyingGlassDuotone", "PiSignatureDuotone"], progress: "folio", label: "Biên bản / hồ sơ tố tụng (Hình sự, tố tụng, xử phạt vi phạm hành chính)", fits: ["hình sự", "tố tụng", "vi phạm hành chính", "xử phạt", "tang vật", "khám xét", "điều tra", "biên bản", "bắt giữ", "tạm giữ", "khởi tố"],
    palette: { acc: "7A1F1F", text: "1F1A17", muted: "5A504A", line: "D8CFC6", deep: "F3ECE4", bad: "A3261F", good: "2F5D3A" }, page: "FAF7F2",
    font: { title: "Times New Roman", titleBold: true }, bg: "lined", frame: "seal",
    card: { radius: 0, border: true, shadow: 0.08, stack: true, skin: "field" }, tag: { shape: "RECTANGLE", style: "solid" }, num: "square",
    mark: { prop: "clip", at: "top-right" }, props: ["stamp", "clip", "pen"], hero: "record", art: "sealed" },
});
const AUTO = { case: "file", lecture: "paper", report: "glass" }; // meta.kit "auto" (mặc định khi có meta.kind)
module.exports = { KITS, PROPS, AUTO, NAMES: Object.keys(KITS) };
