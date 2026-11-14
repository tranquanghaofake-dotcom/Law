// HÌNH MINH HOẠ VẼ BẰNG CODE (chuyển từ tầng lưới Office, 11/2026): mỗi hàm (c, s, b, v) → chuỗi SVG; c = màu nhấn, s = màu phụ (không có #).
// Chỉ là hình học — chữ luôn nằm trong hộp chữ của slide. Không quốc huy, không biểu trưng cơ quan.
// Hình vector hai tông (nét dày + mảng màu trong suốt), không dùng ảnh AI.
// c = màu nhấn, s = màu phụ (dấu/con dấu). Mỗi hình chỉ là hình học — chữ luôn để ở ô chữ của slide.
const ART = {
  courthouse: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" stroke="#${c}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
<polygon points="30,98 200,22 370,98" fill="#${c}" fill-opacity=".22"/><circle cx="200" cy="70" r="15" fill="#${s}" fill-opacity=".55" stroke="none"/>
<rect x="44" y="98" width="312" height="24" fill="#${c}" fill-opacity=".55"/>
${[78, 138, 198, 258, 318].map(x => `<rect x="${x - 11}" y="134" width="22" height="112" fill="#${c}" fill-opacity=".85" stroke="none"/>`).join("")}
<rect x="34" y="250" width="332" height="18" fill="#${c}" fill-opacity=".35"/><rect x="18" y="268" width="364" height="18" fill="#${c}" fill-opacity=".5"/><rect x="4" y="286" width="392" height="20" fill="#${c}" fill-opacity=".7"/></svg>`,
  scales: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 360" fill="none" stroke="#${c}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
<line x1="200" y1="50" x2="200" y2="300"/><circle cx="200" cy="38" r="14" fill="#${s}" fill-opacity=".6" stroke="none"/><line x1="62" y1="86" x2="338" y2="66"/>
<line x1="80" y1="85" x2="42" y2="196"/><line x1="80" y1="85" x2="118" y2="196"/><path d="M28 196 Q80 250 132 196 Z" fill="#${c}" fill-opacity=".35"/>
<line x1="320" y1="67" x2="282" y2="170"/><line x1="320" y1="67" x2="358" y2="170"/><path d="M268 170 Q320 224 372 170 Z" fill="#${c}" fill-opacity=".2"/>
<path d="M140 300 L260 300 L282 334 L118 334 Z" fill="#${c}" fill-opacity=".55"/></svg>`,
  document: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380" fill="none" stroke="#${c}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
<path d="M20 10 H215 L280 75 V370 H20 Z" fill="#${c}" fill-opacity=".12"/><path d="M215 10 V75 H280" fill="#${c}" fill-opacity=".4"/>
${[[70, 170], [110, 240], [145, 240], [180, 240], [215, 190], [250, 150]].map(([y, x2]) => `<line x1="55" y1="${y}" x2="${x2}" y2="${y}" stroke-opacity=".6"/>`).join("")}
<circle cx="212" cy="305" r="40" fill="#${s}" fill-opacity=".18" stroke="#${s}"/><circle cx="212" cy="305" r="24" stroke="#${s}" stroke-width="4"/></svg>`,
  house: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" stroke="#${c}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
<rect x="282" y="52" width="34" height="62" fill="#${c}" fill-opacity=".5"/><polygon points="36,152 200,30 364,152" fill="#${c}" fill-opacity=".38"/>
<rect x="70" y="152" width="260" height="146" fill="#${c}" fill-opacity=".12"/><rect x="170" y="204" width="60" height="94" fill="#${c}" fill-opacity=".75"/>
<rect x="96" y="182" width="50" height="44" fill="#${s}" fill-opacity=".3"/><rect x="254" y="182" width="50" height="44" fill="#${s}" fill-opacity=".3"/><line x1="20" y1="300" x2="380" y2="300"/></svg>`,
  gavel: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" stroke="#${c}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
<g transform="rotate(-35 190 120)"><rect x="110" y="70" width="160" height="70" rx="12" fill="#${c}" fill-opacity=".55"/><rect x="96" y="62" width="22" height="86" rx="6" fill="#${c}" fill-opacity=".85"/><rect x="262" y="62" width="22" height="86" rx="6" fill="#${c}" fill-opacity=".85"/>
<rect x="180" y="140" width="22" height="170" rx="8" fill="#${c}" fill-opacity=".3"/></g>
<rect x="210" y="250" width="170" height="30" rx="8" fill="#${s}" fill-opacity=".35"/><rect x="190" y="280" width="210" height="26" rx="8" fill="#${c}" fill-opacity=".55"/></svg>`,
  land: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" stroke="#${c}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
<polygon points="20,250 120,170 380,190 300,300 40,300" fill="#${c}" fill-opacity=".12"/><polygon points="120,170 230,178 210,262 100,250" fill="#${c}" fill-opacity=".45"/>
<line x1="230" y1="178" x2="300" y2="300" stroke-opacity=".5"/><line x1="100" y1="250" x2="40" y2="300" stroke-opacity=".5"/>
<path d="M165 150 C165 105 125 95 125 62 A40 40 0 0 1 205 62 C205 95 165 105 165 150 Z" fill="#${s}" fill-opacity=".55" stroke="#${s}"/><circle cx="165" cy="62" r="13" fill="#${c}" stroke="none"/></svg>`,
  // ---- hình gắn với BHXH (11/2026): đồ vật người học nhận ra ngay — không vẽ quốc huy / biểu trưng cơ quan ----
  // sổ BHXH mở: bìa xanh phía sau, hai trang có dòng kẻ + ô dấu tròn trơn
  passbook: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 320" stroke-linejoin="round" stroke-linecap="round">
<g transform="rotate(-6 210 160)"><rect x="40" y="40" width="340" height="236" rx="16" fill="#${c}" fill-opacity=".85"/>
<path d="M58 54 H206 V262 H58 Z" fill="#FFFFFF" stroke="#${c}" stroke-width="4"/><path d="M214 54 H362 V262 H214 Z" fill="#FFFFFF" stroke="#${c}" stroke-width="4"/>
<line x1="210" y1="50" x2="210" y2="268" stroke="#${c}" stroke-width="8"/>
<circle cx="132" cy="110" r="30" fill="#${s}" fill-opacity=".18" stroke="#${s}" stroke-width="5"/><circle cx="132" cy="110" r="14" fill="none" stroke="#${s}" stroke-width="4"/>
${[160, 186, 212, 238].map(y => `<line x1="80" y1="${y}" x2="186" y2="${y}" stroke="#${c}" stroke-width="5" stroke-opacity=".45"/>`).join("")}
${[86, 112, 138, 164, 190, 216, 242].map((y, i) => `<line x1="232" y1="${y}" x2="${i % 3 === 2 ? 300 : 344}" y2="${y}" stroke="#${c}" stroke-width="5" stroke-opacity="${i < 4 ? ".6" : ".25"}"/>`).join("")}
<rect x="300" y="214" width="48" height="34" rx="6" fill="#${s}" fill-opacity=".85"/></g></svg>`,
  // thẻ BHXH / thẻ định danh: ảnh chân dung tròn, dòng chữ, mã QR tối giản
  idcard: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 300" stroke-linejoin="round" stroke-linecap="round">
<rect x="70" y="60" width="320" height="200" rx="22" fill="#${c}" fill-opacity=".25" transform="rotate(8 230 160)"/>
<rect x="30" y="40" width="330" height="210" rx="22" fill="#FFFFFF" stroke="#${c}" stroke-width="6"/><rect x="30" y="40" width="330" height="54" rx="22" fill="#${c}"/><rect x="30" y="72" width="330" height="22" fill="#${c}"/>
<circle cx="100" cy="160" r="40" fill="#${c}" fill-opacity=".18" stroke="#${c}" stroke-width="5"/><circle cx="100" cy="148" r="14" fill="#${c}" fill-opacity=".7"/><path d="M74 186 Q100 160 126 186" fill="#${c}" fill-opacity=".7"/>
${[128, 154, 180].map((y, i) => `<line x1="160" y1="${y}" x2="${[300, 270, 240][i]}" y2="${y}" stroke="#${c}" stroke-width="7" stroke-opacity=".55"/>`).join("")}
${[0, 1, 2, 3].flatMap(r => [0, 1, 2, 3].map(q => ((r * 7 + q * 3) % 5 < 3 ? `<rect x="${282 + q * 14}" y="${198 + r * 11}" width="12" height="9" fill="#${s}"/>` : ""))).join("")}</svg>`,
  // ---- hình mặc định của 4 world đợt 2 (11/2026) ----
  // hoá đơn cuộn: mép dưới răng cưa, dòng hàng, gạch đôi + dòng tổng
  receipt: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 320" stroke-linejoin="round" stroke-linecap="round">
<g transform="rotate(5 210 160)"><path d="M120 20 H300 V290 ${[...Array(10).keys()].map(i => `L${291 - i * 18} 278 L${282 - i * 18} 290`).join(" ")} H120 Z" fill="#FFFFFF" stroke="#${c}" stroke-width="5"/>
${[60, 88, 116, 144, 172].map((y, i) => `<line x1="140" y1="${y}" x2="${[230, 210, 240, 200, 220][i]}" y2="${y}" stroke="#${c}" stroke-width="6" stroke-opacity=".45"/><line x1="250" y1="${y}" x2="282" y2="${y}" stroke="#${c}" stroke-width="6" stroke-opacity=".7"/>`).join("")}
<line x1="140" y1="200" x2="282" y2="200" stroke="#${c}" stroke-width="3"/><line x1="140" y1="208" x2="282" y2="208" stroke="#${c}" stroke-width="3"/>
<line x1="140" y1="236" x2="190" y2="236" stroke="#${c}" stroke-width="9"/><line x1="226" y1="236" x2="282" y2="236" stroke="#${s}" stroke-width="12"/></g></svg>`,
  // sổ tài khoản mở + thẻ: cột số dư, dòng xen màu
  bankbook: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 320" stroke-linejoin="round" stroke-linecap="round">
<rect x="40" y="50" width="300" height="210" rx="14" fill="#FFFFFF" stroke="#${c}" stroke-width="5"/><rect x="40" y="50" width="300" height="40" rx="14" fill="#${c}"/><rect x="40" y="76" width="300" height="14" fill="#${c}"/>
${[0, 1, 2, 3, 4].map(i => `<rect x="45" y="${98 + i * 30}" width="290" height="26" fill="#${c}" fill-opacity="${i % 2 ? ".1" : "0"}"/><line x1="60" y1="${111 + i * 30}" x2="${[150, 170, 140, 160, 150][i]}" y2="${111 + i * 30}" stroke="#${c}" stroke-width="6" stroke-opacity=".5"/><line x1="${i % 2 ? 210 : 230}" y1="${111 + i * 30}" x2="${i % 2 ? 250 : 270}" y2="${111 + i * 30}" stroke="#${i === 2 ? s : c}" stroke-width="6"/><line x1="290" y1="${111 + i * 30}" x2="322" y2="${111 + i * 30}" stroke="#${c}" stroke-width="6" stroke-opacity=".75"/>`).join("")}
<g transform="rotate(-12 330 240)"><rect x="260" y="196" width="140" height="88" rx="12" fill="#${s}" fill-opacity=".9"/><rect x="276" y="220" width="28" height="20" rx="4" fill="#FFFFFF" fill-opacity=".85"/><line x1="276" y1="262" x2="380" y2="262" stroke="#FFFFFF" stroke-width="6" stroke-opacity=".7"/></g></svg>`,
  // sơ đồ sở hữu: 3 nút trên nối về 1 khối dưới, đường dày theo tỉ lệ
  orgchart: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 320" stroke-linejoin="round" stroke-linecap="round">
${[[70, 14], [210, 8], [350, 4]].map(([x, w]) => `<line x1="${x}" y1="110" x2="210" y2="220" stroke="#${c}" stroke-width="${w}" stroke-opacity=".75"/>`).join("")}
${[70, 210, 350].map((x, i) => `<rect x="${x - 52}" y="56" width="104" height="58" rx="12" fill="${i ? "#FFFFFF" : "#" + c}" stroke="#${c}" stroke-width="5"/><circle cx="${x}" cy="85" r="12" fill="${i ? "#" + c : "#FFFFFF"}" fill-opacity=".7"/>`).join("")}
<rect x="130" y="214" width="160" height="66" rx="10" fill="#${s}"/><line x1="160" y1="247" x2="260" y2="247" stroke="#FFFFFF" stroke-width="8" stroke-opacity=".75"/></svg>`,
  // phong bì hồ sơ có băng niêm phong chéo (không chữ, không con dấu cơ quan)
  sealed: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 320" stroke-linejoin="round" stroke-linecap="round">
<rect x="60" y="60" width="300" height="210" rx="8" fill="#${c}" fill-opacity=".14" stroke="#${c}" stroke-width="5" transform="rotate(-4 210 165)"/>
<rect x="76" y="44" width="280" height="200" rx="6" fill="#FFFFFF" stroke="#${c}" stroke-width="5"/>
${[86, 112, 138, 164, 190].map((y, i) => `<line x1="100" y1="${y}" x2="${[300, 330, 280, 320, 250][i]}" y2="${y}" stroke="#${c}" stroke-width="6" stroke-opacity=".4" stroke-dasharray="${i > 2 ? "2 9" : "none"}"/>`).join("")}
<g transform="rotate(-28 216 150)"><rect x="40" y="132" width="352" height="38" fill="#${s}" fill-opacity=".92"/><line x1="40" y1="139" x2="392" y2="139" stroke="#FFFFFF" stroke-dasharray="10 8"/><line x1="40" y1="163" x2="392" y2="163" stroke="#FFFFFF" stroke-dasharray="10 8"/><path d="M180 152 c14 -16 24 12 38 -2 s20 8 30 -4" fill="none" stroke="#FFFFFF" stroke-width="4"/></g></svg>`,
  // bến cảng: tàu chở container nhiều màu + cần cẩu (world cang-bien)
  harbor: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 320" stroke-linejoin="round" stroke-linecap="round">
<path d="M300 40 V200 M300 40 H380 M300 40 L240 90 M380 40 V70" stroke="#${c}" stroke-width="8" fill="none"/><line x1="360" y1="70" x2="360" y2="120" stroke="#${c}" stroke-width="3"/><rect x="346" y="120" width="28" height="18" fill="#${s}"/>
${[[60, 150], [112, 150], [164, 150], [216, 150], [86, 116], [138, 116], [190, 116], [112, 82]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="50" height="32" rx="2" fill="#${i % 3 === 1 ? s : c}" fill-opacity="${i % 3 === 2 ? ".55" : ".9"}"/>${[12, 24, 36].map(k => `<line x1="${x + k}" y1="${y + 5}" x2="${x + k}" y2="${y + 27}" stroke="#fff" stroke-opacity=".45" stroke-width="2"/>`).join("")}`).join("")}
<path d="M30 184 H300 L272 236 H62 Z" fill="#${c}"/><rect x="250" y="160" width="40" height="24" fill="#${c}" fill-opacity=".75"/><path d="M20 250 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" stroke="#${c}" stroke-width="5" fill="none" stroke-opacity=".5"/></svg>`,
  // lương hưu: đồng hồ (thời gian đóng) + chồng xu (khoản hưởng hằng tháng)
  pension: (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 320" stroke-linejoin="round" stroke-linecap="round">
<circle cx="160" cy="150" r="118" fill="#${c}" fill-opacity=".12" stroke="#${c}" stroke-width="8"/>
${[...Array(12).keys()].map(i => { const a = i * Math.PI / 6, r1 = i % 3 ? 100 : 92; return `<line x1="${(160 + Math.sin(a) * r1).toFixed(1)}" y1="${(150 - Math.cos(a) * r1).toFixed(1)}" x2="${(160 + Math.sin(a) * 108).toFixed(1)}" y2="${(150 - Math.cos(a) * 108).toFixed(1)}" stroke="#${c}" stroke-width="${i % 3 ? 4 : 8}"/>`; }).join("")}
<line x1="160" y1="150" x2="160" y2="78" stroke="#${c}" stroke-width="10"/><line x1="160" y1="150" x2="214" y2="176" stroke="#${s}" stroke-width="8"/><circle cx="160" cy="150" r="12" fill="#${c}"/>
${[0, 1, 2, 3, 4].map(i => `<ellipse cx="330" cy="${282 - i * 26}" rx="62" ry="20" fill="#${s}" fill-opacity="${0.55 + i * 0.08}" stroke="#${s}" stroke-width="4"/>`).join("")}
<ellipse cx="330" cy="178" rx="62" ry="20" fill="#FFFFFF" fill-opacity=".35"/></svg>`,
};
// ---------- cảnh minh hoạ lớn & hoạ tiết nền (vẽ hoàn toàn bằng code) ----------
// justice: vòng tròn nền + chồng sách + búa toà + cán cân — "hero" cho bìa / chuyển phần / kết luận.
ART.justice = (c, s, b) => {
  const B = b || "FFFFFF";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 520" stroke-linejoin="round" stroke-linecap="round">
<circle cx="300" cy="250" r="232" fill="#${c}" fill-opacity=".14"/><circle cx="300" cy="250" r="232" fill="none" stroke="#${c}" stroke-opacity=".4" stroke-width="2" stroke-dasharray="2 9"/>
<g stroke="#${c}" stroke-width="7" fill="none">
  <line x1="440" y1="92" x2="440" y2="420"/><line x1="350" y1="128" x2="530" y2="112"/>
  <line x1="366" y1="127" x2="338" y2="226"/><line x1="366" y1="127" x2="394" y2="226"/>
  <line x1="514" y1="114" x2="486" y2="206"/><line x1="514" y1="114" x2="542" y2="206"/></g>
<circle cx="440" cy="80" r="14" fill="#${s}"/>
<path d="M324 226 Q366 272 408 226 Z" fill="#${c}" fill-opacity=".9"/><path d="M472 206 Q514 252 556 206 Z" fill="#${c}" fill-opacity=".45"/>
<path d="M396 420 L484 420 L504 448 L376 448 Z" fill="#${c}"/>
<rect x="70" y="402" width="270" height="46" rx="6" fill="#${c}"/><rect x="80" y="411" width="240" height="8" rx="3" fill="#${B}" fill-opacity=".5"/>
<rect x="92" y="356" width="232" height="46" rx="6" fill="#${s}" fill-opacity=".9"/><rect x="102" y="365" width="208" height="8" rx="3" fill="#${B}" fill-opacity=".45"/>
<rect x="80" y="316" width="214" height="40" rx="6" fill="#${c}" fill-opacity=".55"/><rect x="90" y="324" width="190" height="7" rx="3" fill="#${B}" fill-opacity=".5"/>
<g transform="rotate(-24 190 250)">
  <rect x="104" y="268" width="188" height="18" rx="9" fill="#${c}" fill-opacity=".85"/>
  <rect x="58" y="216" width="58" height="122" rx="14" fill="#${c}"/><rect x="50" y="206" width="74" height="18" rx="7" fill="#${s}"/><rect x="50" y="330" width="74" height="18" rx="7" fill="#${s}"/>
  <rect x="68" y="232" width="10" height="90" rx="4" fill="#${B}" fill-opacity=".4"/></g>
<line x1="40" y1="452" x2="560" y2="452" stroke="#${c}" stroke-width="5"/>
<g fill="#${s}"><circle cx="150" cy="120" r="6"/><circle cx="560" cy="300" r="4"/><circle cx="96" cy="200" r="3"/></g></svg>`;
};
// gcn: giấy chứng nhận — khung viền kép, quốc huy giản lược, dải hoa văn sóng, các dòng chữ, con dấu đỏ, chữ ký
ART.gcn = (c, s) => {
  let wave = ""; for (let k = 0; k < 5; k++) { let p = ""; for (let x = 40; x <= 260; x += 4) p += (x === 40 ? "M" : "L") + x + " " + (150 + 9 * Math.sin((x / 14) + k * 0.9)).toFixed(1); wave += `<path d="${p}" fill="none" stroke="#${c}" stroke-opacity=".55" stroke-width="1.4"/>`; }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380" stroke-linejoin="round" stroke-linecap="round">
<rect x="10" y="10" width="280" height="360" rx="6" fill="#${c}" fill-opacity=".12" stroke="#${c}" stroke-width="5"/>
<rect x="24" y="24" width="252" height="332" fill="none" stroke="#${c}" stroke-width="2"/><rect x="31" y="31" width="238" height="318" fill="none" stroke="#${c}" stroke-opacity=".6" stroke-width="1"/>
<circle cx="150" cy="70" r="20" fill="#${s}" fill-opacity=".85"/><polygon points="150,56 154,66 165,66 156,73 160,84 150,77 140,84 144,73 135,66 146,66" fill="#${c}"/>
<line x1="95" y1="108" x2="205" y2="108" stroke="#${c}" stroke-width="6"/><line x1="115" y1="124" x2="185" y2="124" stroke="#${c}" stroke-opacity=".6" stroke-width="4"/>
${wave}
${[200, 222, 244, 266].map((y, i) => `<line x1="52" y1="${y}" x2="${[248, 230, 248, 190][i]}" y2="${y}" stroke="#${c}" stroke-opacity=".55" stroke-width="4"/>`).join("")}
<circle cx="214" cy="306" r="30" fill="#${s}" fill-opacity=".15" stroke="#${s}" stroke-width="4"/><circle cx="214" cy="306" r="19" fill="none" stroke="#${s}" stroke-width="2.5"/>
<path d="M62 312 C78 292 86 324 100 304 S122 300 132 314" fill="none" stroke="#${c}" stroke-width="3"/></svg>`;
};
// ---------- hình cho bài giảng / tài chính – bảo hiểm (viewBox 400×360, cùng tỉ lệ với scales) ----------
// umbrella: ô che mưa — bảo hiểm, phòng ngừa rủi ro
ART.umbrella = (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 360" fill="none" stroke="#${c}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
<path d="M60 170 Q200 20 340 170 Q317 150 293 170 Q270 150 247 170 Q223 150 200 170 Q177 150 153 170 Q130 150 107 170 Q83 150 60 170 Z" fill="#${c}" fill-opacity=".35"/>
<path d="M200 60 Q160 110 153 170 M200 60 Q240 110 247 170" stroke-opacity=".6"/>
<line x1="200" y1="44" x2="200" y2="60"/><path d="M200 170 V300 Q200 330 228 330 Q252 330 252 306" />
${[[70, 40], [120, 18], [300, 26], [350, 52], [44, 92]].map(([x, y]) => `<path d="M${x} ${y} q-7 14 0 18 q7 -4 0 -18 Z" fill="#${s}" fill-opacity=".7" stroke="#${s}" stroke-width="3"/>`).join("")}
<line x1="40" y1="340" x2="360" y2="340" stroke-opacity=".5"/></svg>`;
// shield: khiên có dấu tích — được bảo vệ, phạm vi bảo hiểm, an toàn
ART.shield = (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 360" fill="none" stroke="#${c}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
<path d="M200 22 L320 66 V170 Q320 270 200 336 Q80 270 80 170 V66 Z" fill="#${c}" fill-opacity=".14"/>
<path d="M200 50 L295 85 V170 Q295 250 200 304 Z" fill="#${c}" fill-opacity=".35" stroke="none"/>
<path d="M140 178 L186 222 L268 132" stroke="#${s}" stroke-width="16"/>
<circle cx="56" cy="80" r="8" fill="#${s}" fill-opacity=".6" stroke="none"/><circle cx="350" cy="250" r="6" fill="#${s}" fill-opacity=".6" stroke="none"/></svg>`;
// fund: quỹ chung — nhiều dòng tiền nhỏ đổ vào một quỹ lớn (chồng xu)
ART.fund = (c, s) => {
  const coin = (x, y, n, op) => Array.from({ length: n }, (_, i) => `<ellipse cx="${x}" cy="${y - i * 22}" rx="46" ry="14" fill="#${c}" fill-opacity="${op}"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 360" stroke="#${c}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
<rect x="70" y="150" width="260" height="170" rx="22" fill="#${c}" fill-opacity=".12"/><rect x="150" y="136" width="100" height="22" rx="10" fill="#${c}" fill-opacity=".5"/>
${coin(140, 296, 4, 0.55)}${coin(200, 296, 6, 0.8)}${coin(260, 296, 3, 0.4)}
${[[70, 30], [200, 14], [330, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y + 14}" r="14" fill="#${s}" fill-opacity=".7" stroke="#${s}" stroke-width="3"/><path d="M${x} ${y + 36} Q${(x + 200) / 2} ${y + 70} 200 126" fill="none" stroke-opacity=".55" stroke-dasharray="4 12"/>`).join("")}
<line x1="40" y1="330" x2="360" y2="330" stroke-opacity=".5"/></svg>`;
};
// book: sách mở + dấu trang — bài giảng, giáo trình, khái niệm
ART.book = (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 360" fill="none" stroke="#${c}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
<path d="M200 96 Q140 60 40 74 V286 Q140 272 200 306 Z" fill="#${c}" fill-opacity=".14"/><path d="M200 96 Q260 60 360 74 V286 Q260 272 200 306 Z" fill="#${c}" fill-opacity=".32"/>
<line x1="200" y1="96" x2="200" y2="306"/>
${[120, 150, 180, 210, 240].map((y, i) => `<path d="M72 ${y} Q130 ${y - 10} 170 ${y + 4}" stroke-width="4" stroke-opacity=".5"/><path d="M230 ${y + 4} Q270 ${y - 10} ${i === 4 ? 300 : 328} ${y}" stroke-width="4" stroke-opacity=".5"/>`).join("")}
<path d="M300 66 V140 L316 126 L332 140 V62" fill="#${s}" fill-opacity=".8" stroke="#${s}" stroke-width="4"/>
<path d="M40 286 Q140 272 200 318 Q260 272 360 286" stroke-opacity=".6"/></svg>`;
// quiz: khung hỏi đáp — câu hỏi kiểm tra, thảo luận (dấu hỏi là HÌNH, không phải chữ)
ART.quiz = (c, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 360" fill="none" stroke="#${c}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
<path d="M40 40 H280 Q300 40 300 60 V190 Q300 210 280 210 H120 L70 256 V210 H60 Q40 210 40 190 V60 Q40 40 60 40 Z" fill="#${c}" fill-opacity=".14"/>
<path d="M140 100 Q140 66 172 66 Q204 66 204 96 Q204 118 176 128 V150" stroke-width="14"/><circle cx="176" cy="180" r="9" fill="#${c}" stroke="none"/>
<path d="M230 150 H340 Q360 150 360 170 V270 Q360 290 340 290 H330 V330 L290 290 H230 Q210 290 210 270 V170 Q210 150 230 150 Z" fill="#${s}" fill-opacity=".22" stroke="#${s}"/>
<path d="M252 222 L276 246 L322 196" stroke="#${s}" stroke-width="10"/></svg>`;
// guilloche: hoa văn giấy chứng nhận / tiền giấy (đường hypotrochoid chồng lớp) — nền trang trọng, không chứa chữ
ART.guilloche = (c) => {
  // vòng sin r(θ) = R + A·sin(nθ + φ), lệch pha dần → dải ren đan nhau
  const ring = (R, A, n, ph, op) => { let p = ""; for (let i = 0; i <= 720; i++) { const t = i / 720 * Math.PI * 2, r = R + A * Math.sin(n * t + ph);
    p += (i ? "L" : "M") + (400 + r * Math.cos(t)).toFixed(1) + " " + (400 + r * Math.sin(t)).toFixed(1); }
    return `<path d="${p}Z" fill="none" stroke="#${c}" stroke-opacity="${op}" stroke-width="1.3"/>`; };
  const out = [];
  for (let k = 0; k < 9; k++) out.push(ring(330, 30, 36, k * Math.PI * 2 / 9, 0.5));
  for (let k = 0; k < 7; k++) out.push(ring(235, 24, 24, k * Math.PI * 2 / 7, 0.42));
  for (let k = 0; k < 5; k++) out.push(ring(150, 18, 16, k * Math.PI * 2 / 5, 0.38));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">${out.join("")}<circle cx="400" cy="400" r="378" fill="none" stroke="#${c}" stroke-opacity=".5" stroke-width="2"/><circle cx="400" cy="400" r="388" fill="none" stroke="#${c}" stroke-opacity=".3" stroke-width="1"/><circle cx="400" cy="400" r="98" fill="none" stroke="#${c}" stroke-opacity=".45" stroke-width="1.5"/></svg>`;
};
// glow: quầng sáng mềm cho nền tối (tạo chiều sâu, kiểu slide hiện đại)
ART.glow = (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs>
<radialGradient id="a" cx="88%" cy="8%" r="62%"><stop offset="0" stop-color="#${c}" stop-opacity=".20"/><stop offset="1" stop-color="#${c}" stop-opacity="0"/></radialGradient>
<radialGradient id="b" cx="4%" cy="100%" r="45%"><stop offset="0" stop-color="#${c}" stop-opacity=".10"/><stop offset="1" stop-color="#${c}" stop-opacity="0"/></radialGradient></defs>
<rect width="1600" height="900" fill="url(#a)"/><rect width="1600" height="900" fill="url(#b)"/></svg>`;
const ART_INTERNAL = new Set(["guilloche", "glow"]); // không cho deck.json chọn trực tiếp
// landscape: núi nhiều lớp + sương + mây cuộn + mặt trời + sóng, viền vàng trên sống núi (cảm hứng tranh thuỷ mặc / cắt giấy).
// variant "hero": núi cao bên phải, chừa góc trên-trái cho chữ (bìa). "low": chỉ dải núi thấp + sóng ở đáy (chuyển phần, kết luận, nền trang).
// c = màu chủ (núi), g = vàng (viền, mặt trời), b = màu nền (sương, ruột mây). Toạ độ 1600x900 = cả slide.
const smooth = (pts) => { let d = `M${pts[0][0]} ${pts[0][1]}`; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
  d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0]} ${p2[1]}`; } return d; };
const ridge = (pts, fill, op, g, gw) => { const top = smooth(pts), last = pts[pts.length - 1], first = pts[0];
  return `<path d="${top} L${last[0]} 900 L${first[0]} 900 Z" fill="${fill}" fill-opacity="${op}"/>` + (g ? `<path d="${top}" fill="none" stroke="#${g}" stroke-width="${gw}" stroke-linecap="round"/>` : ""); };
const cloud = (x, y, s, g, b) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#${b}" stroke="#${g}" stroke-width="${3 / s}" stroke-linecap="round">
<path d="M0 40 C0 10 40 0 60 20 C70 -10 120 -10 130 20 C150 0 190 10 185 40 Z"/><path d="M60 22 C66 8 84 8 86 22 C88 32 74 36 70 28" fill="none"/><path d="M130 22 C136 10 152 12 152 24" fill="none"/></g>`;
ART.landscape = (c, g, b, v) => {
  const C = "#" + c, out = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs>
<linearGradient id="m1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C}" stop-opacity=".95"/><stop offset="1" stop-color="${C}" stop-opacity=".55"/></linearGradient>
<linearGradient id="m2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C}" stop-opacity=".55"/><stop offset="1" stop-color="${C}" stop-opacity=".12"/></linearGradient>
<linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#${b}" stop-opacity="0"/><stop offset="1" stop-color="#${b}" stop-opacity=".9"/></linearGradient></defs>`];
  if (v === "hero") {
    out.push(`<circle cx="1270" cy="250" r="105" fill="#${g}" fill-opacity=".35"/><circle cx="1270" cy="250" r="128" fill="none" stroke="#${g}" stroke-width="3" stroke-opacity=".7"/>`);
    out.push(ridge([[760, 900], [900, 560], [1010, 430], [1090, 470], [1200, 330], [1330, 410], [1440, 300], [1600, 380]], C, ".16", null));
    out.push(`<rect x="700" y="420" width="900" height="260" fill="url(#mist)"/>`);
    out.push(ridge([[640, 900], [820, 690], [960, 560], [1060, 610], [1180, 470], [1300, 560], [1420, 500], [1600, 470]], "url(#m2)", "1", g, 3));
    out.push(cloud(980, 170, 1.4, g, b), cloud(1420, 600, 1.0, g, b));
  }
  out.push(`<rect x="0" y="560" width="1600" height="340" fill="url(#mist)" opacity=".6"/>`);
  out.push(ridge([[0, 790], [180, 730], [380, 770], [560, 700], [760, 730], [980, 640], [1180, 690], [1380, 600], [1600, 640]], "url(#m2)", "1", g, 2.5));
  out.push(ridge([[0, 860], [220, 820], [430, 845], [640, 800], [860, 830], [1080, 770], [1300, 800], [1600, 740]], "url(#m1)", "1", g, 3));
  // sóng cuộn ở đáy
  let w = ""; for (let x = -40; x < 1640; x += 80) w += `<path d="M${x} 900 C${x + 10} 868 ${x + 46} 860 ${x + 58} 880 C${x + 66} 892 ${x + 50} 900 ${x + 40} 890" fill="none" stroke="#${b}" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>`;
  out.push(w, "</svg>");
  return out.join("");
};
ART_INTERNAL.add("landscape");
// cadastral: bản đồ địa chính — lưới thửa đất méo tự nhiên, một con đường, thửa tranh chấp tô nổi + đường tách thửa nét đứt + ghim.
// Hợp với chủ đề đất đai / nhà ở / bất động sản. Không chứa chữ: số thửa đặt bằng ô chữ thật (meta.motifLabel).
// v "hero": phủ nửa phải slide (bìa). Trang nội dung / chuyển phần / kết: dùng engine/motifs.js (đặt vào vùng trống thật).
const CAD_PIN = { x: 1190, y: 430 }; // toạ độ ghim (hệ 1600x900) để build.js đặt nhãn thửa
ART.cadastral = (c, g, b, v) => {
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const xs = [640, 800, 960, 1110, 1270, 1430, 1600], ys = [40, 200, 350, 520, 690, 900];
  const P = ys.map((y, j) => xs.map((x, i) => [x + (i && i < xs.length - 1 ? (rnd() - 0.5) * 70 : 0), y + (j && j < ys.length - 1 ? (rnd() - 0.5) * 60 : 0)]));
  const out = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" stroke-linejoin="round">`];
  const poly = (pts, fill, op, sw, so, dash) => `<polygon points="${pts.map(p => p.map(n => n.toFixed(1)).join(",")).join(" ")}" fill="${fill}" fill-opacity="${op}" stroke="#${c}" stroke-width="${sw}" stroke-opacity="${so}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
  for (let j = 0; j < ys.length - 1; j++) for (let i = 0; i < xs.length - 1; i++) {
    const q = [P[j][i], P[j][i + 1], P[j + 1][i + 1], P[j + 1][i]], fade = Math.min(1, (i + 0.6) / 2.2);
    if (j === 2) continue; // hàng này là đường giao thông
    out.push(poly(q, "#" + c, (0.05 + 0.07 * ((i * 3 + j * 5) % 4) / 3) * fade, 2.2, 0.55 * fade));
  }
  // đường giao thông (dải giữa hàng 2) + vạch tim đường
  const top = P[2], bot = P[3], mid = top.map((p, i) => [(p[0] + bot[i][0]) / 2, (p[1] + bot[i][1]) / 2]);
  out.push(`<path d="M${top.map(p => p.join(" ")).join(" L")} L${bot.slice().reverse().map(p => p.join(" ")).join(" L")} Z" fill="#${b}" stroke="#${c}" stroke-width="2.5" stroke-opacity=".6"/>`);
  out.push(`<path d="M${mid.map(p => p.join(" ")).join(" L")}" fill="none" stroke="#${g}" stroke-width="3" stroke-dasharray="18 14"/>`);
  if (v === "hero") {
    // thửa tranh chấp: ô (hàng 1, cột 3), tách đôi bằng nét đứt (tách thửa)
    const t = [P[1][3], P[1][4], P[2][4], P[2][3]];
    out.push(poly(t, "#" + g, 0.55, 5, 1));
    const a = [(t[0][0] + t[1][0]) / 2, (t[0][1] + t[1][1]) / 2], z = [(t[3][0] + t[2][0]) / 2, (t[3][1] + t[2][1]) / 2];
    out.push(`<line x1="${a[0]}" y1="${a[1]}" x2="${z[0]}" y2="${z[1]}" stroke="#${c}" stroke-width="3.5" stroke-dasharray="12 9"/>`);
    // nhà trên thửa
    const hx = (t[0][0] + t[2][0]) / 2 + 38, hy = (t[0][1] + t[2][1]) / 2 + 30;
    out.push(`<g fill="#${c}"><polygon points="${hx - 34},${hy} ${hx},${hy - 30} ${hx + 34},${hy}"/><rect x="${hx - 26}" y="${hy}" width="52" height="36"/><rect x="${hx - 8}" y="${hy + 14}" width="16" height="22" fill="#${b}"/></g>`);
    // ghim vị trí
    const { x, y } = CAD_PIN;
    out.push(`<path d="M${x} ${y} C${x} ${y - 40} ${x - 34} ${y - 52} ${x - 34} ${y - 84} A34 34 0 0 1 ${x + 34} ${y - 84} C${x + 34} ${y - 52} ${x} ${y - 40} ${x} ${y} Z" fill="#${c}"/><circle cx="${x}" cy="${y - 84}" r="13" fill="#${b}"/>`);
    // la bàn + khung toạ độ
    out.push(`<g transform="translate(1500 110)" stroke="#${c}" stroke-width="2.5"><circle r="44" fill="#${b}"/><polygon points="0,-38 9,0 0,38 -9,0" fill="#${c}"/><polygon points="0,-38 9,0 -9,0" fill="#${g}"/></g>`);
    for (let k = 0; k < 9; k++) out.push(`<line x1="${700 + k * 110}" y1="895" x2="${700 + k * 110}" y2="875" stroke="#${c}" stroke-width="2" stroke-opacity=".6"/>`);
  }
  // mép trái tan dần vào nền (không có đường cắt thẳng)
  out.push(`<defs><linearGradient id="fade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#${b}" stop-opacity="1"/><stop offset="1" stop-color="#${b}" stop-opacity="0"/></linearGradient></defs><rect x="600" y="0" width="${v === "hero" ? 420 : 300}" height="900" fill="url(#fade)"/><rect x="0" y="0" width="601" height="900" fill="#${b}" fill-opacity="0"/>`);
  out.push("</svg>");
  return out.join("");
};
ART_INTERNAL.add("cadastral");
module.exports = { ART, ART_INTERNAL, NAMES: Object.keys(ART).filter((k) => !ART_INTERNAL.has(k)) };
