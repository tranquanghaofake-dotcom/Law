// VẬT TỰ VẼ CHO BẢO HIỂM (11/2026) — SVG viết tay, một phong cách: mảng phẳng + gradient nhẹ (sáng góc trên trái),
// mặt tối bên phải, vệt sáng mảnh, bóng đổ mềm dưới chân. Màu lấy từ da (acc, gold, ink, bad) + vài màu trung tính cố định.
// Người dùng chê kho hình có sẵn (Fluent) "quá xấu" → mọi vật ở đây vẽ tay, phóng to bao nhiêu cũng nét.
// Mỗi vật: (P) → chuỗi SVG viewBox 0 0 240 240, mặt đất y ≈ 214. Dùng: "ve:<tên>" ở emoji / emojis / vat; "ve:a,b,c" ở art (ghép cảnh).
const mix = (a, b, t) => { const h = (x) => [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16)); const A = h(a), B = h(b);
  return A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
let uid = 0;
// khung chung: defs gradient của bảng màu + bóng sàn
function khung(P, body, { bong = true, rx = 70 } = {}) {
  const id = `v${++uid}`, A = P.acc, G = P.gold;
  const defs = `<defs>
<linearGradient id="${id}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${mix(A, "FFFFFF", 0.28)}"/><stop offset="1" stop-color="#${mix(A, "000000", 0.18)}"/></linearGradient>
<linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${mix(G, "FFFFFF", 0.35)}"/><stop offset="1" stop-color="#${mix(G, "000000", 0.12)}"/></linearGradient>
<linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E9EEF0"/></linearGradient>
<linearGradient id="${id}f" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#${P.bad}"/><stop offset=".55" stop-color="#F07A2B"/><stop offset="1" stop-color="#${mix(G, "FFFFFF", 0.3)}"/></linearGradient>
<radialGradient id="${id}s"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>`;
  const S = (k) => `url(#${id}${k})`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">${defs}${bong ? `<ellipse cx="120" cy="216" rx="${rx}" ry="11" fill="${S("s")}"/>` : ""}${body(S)}</svg>`;
}
const INK = (P) => `#${P.ink}`, DA_NGUOI = "F2C29B", NAU = "8A5A3B", NGOI = "C8653A";

const VE = {
  // ô che mưa: tán 5 múi (múi xen sáng / tối), viền vàng, cán cong, giọt mưa rơi ngoài tán
  "o-mua": (P) => khung(P, (S) => `
${[[34, 30], [62, 12], [178, 14], [206, 34], [18, 70], [222, 74]].map(([x, y]) => `<path d="M${x} ${y} q-5 10 0 14 q5 -4 0 -14z" fill="#${mix(P.acc, "FFFFFF", 0.45)}"/>`).join("")}
<path d="M24 118 Q32 46 120 38 Q208 46 216 118 Q197 104 178 118 Q159 104 140 118 Q120 104 100 118 Q81 104 62 118 Q43 104 24 118Z" fill="${S("a")}"/>
<path d="M120 38 Q86 64 62 118 Q81 104 100 118 Q104 70 120 38Z" fill="#fff" fill-opacity=".18"/><path d="M120 38 Q154 64 178 118 Q159 104 140 118 Q136 70 120 38Z" fill="#000" fill-opacity=".12"/>
<path d="M24 118 Q43 104 62 118 Q81 104 100 118 Q120 104 140 118 Q159 104 178 118 Q197 104 216 118" fill="none" stroke="${S("g")}" stroke-width="5" stroke-linejoin="round"/>
<rect x="117" y="24" width="6" height="16" rx="3" fill="${INK(P)}"/>
<path d="M120 118 V186 Q120 204 104 204 Q90 204 90 190" fill="none" stroke="${INK(P)}" stroke-width="8" stroke-linecap="round"/>`, { rx: 60 }),

  // nhà: tường kem, mái ngói nâu cam (không dùng đỏ — đỏ dành cho điều tiêu cực), cửa xanh, cửa sổ vàng sáng
  nha: (P) => khung(P, (S) => `
<path d="M48 206 V112 L120 62 L192 112 V206Z" fill="#FBF3E4"/>
<path d="M120 62 L192 112 V206 H150 V118Z" fill="#000" fill-opacity=".06"/>
<path d="M30 118 L120 50 L210 118 L198 128 L120 70 L42 128Z" fill="#${NGOI}"/><path d="M120 50 L210 118 L198 128 L120 70Z" fill="#000" fill-opacity=".14"/>
<rect x="150" y="62" width="18" height="34" fill="#${mix(NGOI, "000000", 0.2)}"/>
<rect x="100" y="150" width="40" height="56" rx="4" fill="${S("a")}"/><circle cx="131" cy="180" r="3" fill="#${P.gold}"/>
<rect x="62" y="132" width="28" height="26" rx="3" fill="${S("g")}"/><path d="M76 132 V158 M62 145 H90" stroke="#fff" stroke-width="3"/>
<rect x="152" y="132" width="28" height="26" rx="3" fill="${S("g")}"/><path d="M166 132 V158 M152 145 H180" stroke="#fff" stroke-width="3"/>
<rect x="36" y="204" width="168" height="8" rx="4" fill="#${mix(P.acc, "FFFFFF", 0.2)}"/>`),

  // người: tượng bán thân, tóc mực, áo màu nhấn có cổ vàng — đại diện "con người" (BHCN), không phải chân dung ai
  nguoi: (P) => khung(P, (S) => `
<path d="M52 212 Q52 150 120 146 Q188 150 188 212Z" fill="${S("a")}"/><path d="M120 146 Q188 150 188 212 H140Z" fill="#000" fill-opacity=".1"/>
<path d="M104 148 L120 176 L136 148Z" fill="${S("g")}"/>
<rect x="108" y="122" width="24" height="28" rx="8" fill="#${mix(DA_NGUOI, "000000", 0.08)}"/>
<ellipse cx="120" cy="96" rx="36" ry="40" fill="#${DA_NGUOI}"/><path d="M120 56 Q160 58 156 104 Q150 80 120 76 Q92 78 84 100 Q78 60 120 56Z" fill="${INK(P)}"/>
<circle cx="106" cy="100" r="3.5" fill="${INK(P)}"/><circle cx="134" cy="100" r="3.5" fill="${INK(P)}"/><path d="M110 116 Q120 123 130 116" fill="none" stroke="${INK(P)}" stroke-width="3" stroke-linecap="round"/>`, { rx: 64 }),

  // ô tô con nhìn ngang: thân vàng, kính xanh nhạt, bánh mực có mâm
  "o-to": (P) => khung(P, (S) => `
<path d="M22 176 Q22 150 46 146 L74 112 Q82 102 96 102 H150 Q164 102 174 114 L196 144 Q218 148 218 170 V184 H22Z" fill="${S("g")}"/>
<path d="M22 172 H218 V184 H22Z" fill="#000" fill-opacity=".12"/>
<path d="M82 116 Q88 110 98 110 H118 V144 H58Z" fill="#${mix(P.acc, "FFFFFF", 0.62)}"/><path d="M126 110 H150 Q160 110 166 118 L184 144 H126Z" fill="#${mix(P.acc, "FFFFFF", 0.5)}"/>
<rect x="198" y="152" width="18" height="9" rx="3" fill="#FFF4C9"/><rect x="22" y="156" width="12" height="9" rx="3" fill="#${P.bad}"/>
${[70, 172].map((x) => `<circle cx="${x}" cy="186" r="22" fill="${INK(P)}"/><circle cx="${x}" cy="186" r="10" fill="#C9D3D6"/>`).join("")}`, { rx: 92 }),

  // tàu container: thân mực, sọc vàng, chồng container ba màu, cabin trắng, sóng
  tau: (P) => khung(P, (S) => {
    const mau = [P.acc, P.gold, NGOI, mix(P.acc, "FFFFFF", 0.35)];
    let ct = ""; for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { const x = 46 + c * 30, y = 118 - r * 22; ct += `<rect x="${x}" y="${y}" width="28" height="20" fill="#${mau[(r + c) % 4]}"/><path d="M${x + 7} ${y + 3} V${y + 17} M${x + 14} ${y + 3} V${y + 17} M${x + 21} ${y + 3} V${y + 17}" stroke="#000" stroke-opacity=".15" stroke-width="2"/>`; }
    return `${ct}<rect x="170" y="88" width="30" height="52" rx="3" fill="#F4F7F8"/><rect x="176" y="96" width="18" height="8" fill="#${mix(P.acc, "FFFFFF", 0.4)}"/><rect x="182" y="70" width="8" height="18" fill="${INK(P)}"/>
<path d="M18 140 H222 L204 186 H40Z" fill="${INK(P)}"/><path d="M24 154 H216" stroke="#${P.gold}" stroke-width="5"/>
<path d="M8 196 Q28 186 48 196 T88 196 T128 196 T168 196 T208 196 T248 196" fill="none" stroke="${S("a")}" stroke-width="7" stroke-linecap="round"/>`; }, { rx: 100 }),

  // nhà máy: mái răng cưa, hai ống khói có khói, cửa sổ vàng
  "nha-may": (P) => khung(P, (S) => `
<circle cx="66" cy="34" r="14" fill="#C9D3D6"/><circle cx="84" cy="22" r="18" fill="#DCE3E5"/><circle cx="150" cy="44" r="12" fill="#DCE3E5"/>
<rect x="56" y="48" width="20" height="86" fill="#${mix(P.ink, "FFFFFF", 0.25)}"/><rect x="56" y="62" width="20" height="8" fill="#${P.bad}"/>
<rect x="140" y="66" width="18" height="68" fill="#${mix(P.ink, "FFFFFF", 0.25)}"/><rect x="140" y="78" width="18" height="8" fill="#${P.bad}"/>
<path d="M24 210 V130 L70 104 V130 L116 104 V130 L162 104 V130 L216 104 V210Z" fill="${S("a")}"/><path d="M162 104 V130 L216 104 V210 H170Z" fill="#000" fill-opacity=".1"/>
${[0, 1, 2, 3, 4].map((i) => `<rect x="${38 + i * 34}" y="150" width="20" height="18" rx="2" fill="${S("g")}"/>`).join("")}
<rect x="96" y="178" width="44" height="32" fill="${INK(P)}"/>`),

  // ngọn lửa ba lớp — rủi ro hoả hoạn (đỏ được dùng: tổn thất là điều tiêu cực thật)
  lua: (P) => khung(P, (S) => `
<path d="M120 22 Q170 78 172 132 Q174 196 120 204 Q66 196 68 136 Q70 100 96 76 Q96 108 112 116 Q102 64 120 22Z" fill="${S("f")}"/>
<path d="M124 82 Q156 120 152 158 Q148 194 120 196 Q92 192 92 162 Q94 140 108 128 Q112 150 124 152 Q116 116 124 82Z" fill="#F7A23B"/>
<path d="M122 132 Q140 156 136 176 Q132 192 120 192 Q106 190 106 176 Q108 160 122 132Z" fill="#FFE08A"/>`, { rx: 56 }),

  // hợp đồng: tờ giấy có dòng kẻ, chữ ký, con dấu tròn TRƠN (không chữ, không biểu trưng) + bút máy nằm chéo
  "hop-dong": (P) => khung(P, (S) => `
<g transform="rotate(-6 120 120)"><rect x="52" y="22" width="132" height="176" rx="6" fill="${S("w")}" stroke="#D5DEE1" stroke-width="2"/>
<rect x="68" y="40" width="70" height="10" rx="5" fill="#${P.acc}"/>${[64, 80, 96, 112, 128].map((y, i) => `<rect x="68" y="${y}" width="${[98, 86, 98, 70, 90][i]}" height="6" rx="3" fill="#C5D0D4"/>`).join("")}
<path d="M70 168 q10 -16 18 -2 t18 -4 t16 2" fill="none" stroke="${INK(P)}" stroke-width="3" stroke-linecap="round"/>
<circle cx="152" cy="166" r="18" fill="none" stroke="#${P.bad}" stroke-width="4" stroke-opacity=".75"/><circle cx="152" cy="166" r="11" fill="none" stroke="#${P.bad}" stroke-width="2" stroke-opacity=".75"/></g>
<g transform="rotate(38 170 150)"><rect x="150" y="70" width="22" height="104" rx="11" fill="${INK(P)}"/><rect x="150" y="128" width="22" height="12" fill="${S("g")}"/><path d="M150 174 H172 L161 206Z" fill="${S("g")}"/><rect x="167" y="78" width="3" height="40" rx="1.5" fill="#fff" fill-opacity=".35"/></g>`),

  // hoá đơn thu phí: giấy mép răng cưa, dòng tiền, tổng đậm + đồng xu
  "hoa-don": (P) => khung(P, (S) => `
<path d="M62 20 H178 V200 ${[...Array(8).keys()].map((i) => `L${170 - i * 14.5} 190 L${163 - i * 14.5} 200`).join(" ")} H62Z" fill="${S("w")}" stroke="#D5DEE1" stroke-width="2"/>
<rect x="78" y="36" width="60" height="10" rx="5" fill="#${P.acc}"/>
${[62, 80, 98, 116].map((y) => `<rect x="78" y="${y}" width="46" height="6" rx="3" fill="#C5D0D4"/><rect x="134" y="${y}" width="28" height="6" rx="3" fill="#9AA8AD"/>`).join("")}
<path d="M78 138 H162" stroke="${INK(P)}" stroke-width="2" stroke-dasharray="4 4"/><rect x="78" y="148" width="34" height="9" rx="4" fill="${INK(P)}"/><rect x="124" y="146" width="38" height="13" rx="4" fill="#${P.acc}"/>
<ellipse cx="176" cy="196" rx="30" ry="10" fill="#${mix(P.gold, "000000", 0.25)}"/><rect x="146" y="180" width="60" height="16" fill="#${mix(P.gold, "000000", 0.25)}"/><ellipse cx="176" cy="180" rx="30" ry="10" fill="${S("g")}"/>`),

  // khiên: màu nhấn, viền vàng, dấu chọn trắng — "trong phạm vi bảo hiểm"
  khien: (P) => khung(P, (S) => `
<path d="M120 20 L196 46 V112 Q196 178 120 208 Q44 178 44 112 V46Z" fill="${S("a")}"/><path d="M120 20 L196 46 V112 Q196 178 120 208Z" fill="#000" fill-opacity=".12"/>
<path d="M120 38 L180 58 V112 Q180 164 120 190 Q60 164 60 112 V58Z" fill="none" stroke="${S("g")}" stroke-width="7"/>
<path d="M88 112 L112 136 L156 90" fill="none" stroke="#fff" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>`, { rx: 56 }),

  // đám đông: 3 hàng người cách điệu nhiều màu — "số đông" góp quỹ
  "dam-dong": (P) => khung(P, () => {
    const mau = [P.acc, P.gold, mix(P.acc, "FFFFFF", 0.35), NGOI, mix(P.ink, "FFFFFF", 0.3)]; let b = "";
    const ng = (x, y, s, m) => `<path d="M${x - 20 * s} ${y + 34 * s} Q${x - 20 * s} ${y + 6 * s} ${x} ${y + 4 * s} Q${x + 20 * s} ${y + 6 * s} ${x + 20 * s} ${y + 34 * s}Z" fill="#${m}"/><circle cx="${x}" cy="${y - 10 * s}" r="${12 * s}" fill="#${DA_NGUOI}"/><path d="M${x - 12 * s} ${y - 12 * s} Q${x} ${y - 30 * s} ${x + 12 * s} ${y - 12 * s}Z" fill="${INK(P)}"/>`;
    [[40, 70, 100, 140, 180, 200], [56, 96, 136, 176], [76, 120, 164]].forEach((row, r) => row.forEach((x, k) => { if (r === 0 && k === 5) return; b += ng(r === 0 ? x + 10 : x, 80 + r * 46, 0.8 + r * 0.25, mau[(k + r * 2) % 5]); }));
    return b; }, { rx: 96 }),

  // cán cân: vàng, đĩa cân lệch nhẹ
  "can-can": (P) => khung(P, (S) => `
<rect x="114" y="40" width="12" height="150" rx="4" fill="${S("g")}"/><path d="M80 206 Q80 186 120 184 Q160 186 160 206Z" fill="${INK(P)}"/>
<path d="M44 64 L196 56" stroke="${S("g")}" stroke-width="9" stroke-linecap="round"/><circle cx="120" cy="58" r="12" fill="${S("g")}"/>
<path d="M44 64 L22 130 M44 64 L66 130 M196 56 L174 122 M196 56 L218 122" stroke="${INK(P)}" stroke-width="2.5"/>
<path d="M16 130 H72 Q68 152 44 152 Q20 152 16 130Z" fill="${S("a")}"/><path d="M168 122 H224 Q220 144 196 144 Q172 144 168 122Z" fill="${S("a")}"/>`),

  // chồng xu: 5 đồng vàng, mặt trên có vòng nổi
  xu: (P) => khung(P, (S) => [0, 1, 2, 3, 4].map((i) => { const y = 188 - i * 24, x = 120 + (i % 2 ? 5 : -4);
    return `<path d="M${x - 62} ${y} V${y + 14} A62 18 0 0 0 ${x + 62} ${y + 14} V${y}Z" fill="#${mix(P.gold, "000000", 0.22)}"/><ellipse cx="${x}" cy="${y}" rx="62" ry="18" fill="${S("g")}"/><ellipse cx="${x}" cy="${y}" rx="44" ry="11" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>`; }).join("")),

  // mây giông: mây xám xanh, tia sét vàng, mưa — "rủi ro ngẫu nhiên, bất ngờ"
  "may-giong": (P) => khung(P, () => `
${[[70, 150], [104, 170], [138, 150], [172, 170]].map(([x, y]) => `<path d="M${x} ${y} l-8 18" stroke="#${mix(P.acc, "FFFFFF", 0.35)}" stroke-width="6" stroke-linecap="round"/>`).join("")}
<path d="M48 130 Q22 128 26 104 Q30 82 56 86 Q60 50 98 50 Q124 30 150 54 Q186 50 190 84 Q218 88 214 112 Q210 132 186 130Z" fill="#${mix(P.ink, "FFFFFF", 0.42)}"/>
<path d="M48 130 Q30 126 32 110 Q70 122 120 112 Q170 122 210 106 Q212 128 186 130Z" fill="#000" fill-opacity=".14"/>
<path d="M124 118 L104 160 H122 L110 200 L150 146 H130 L142 118Z" fill="#${P.gold}" stroke="#${mix(P.gold, "000000", 0.2)}" stroke-width="2" stroke-linejoin="round"/>`, { rx: 80 }),

  // tủ hồ sơ phân loại: ba bìa hồ sơ có tab khác màu — "phân loại"
  "ho-so": (P) => khung(P, (S) => [[P.gold, 0], [mix(P.acc, "FFFFFF", 0.35), 1], [P.acc, 2]].map(([m, i]) => `
<path d="M${40 + i * 10} ${70 + i * 34} H${88 + i * 10} L${98 + i * 10} ${58 + i * 34} H${150 + i * 10} L${160 + i * 10} ${70 + i * 34} H${200 - i * 0} V${206} H${40 + i * 10}Z" fill="#${m}"/>
<path d="M${40 + i * 10} ${70 + i * 34} H200 V${82 + i * 34} H${40 + i * 10}Z" fill="#fff" fill-opacity=".25"/>`).join("") + `<rect x="34" y="198" width="172" height="10" rx="5" fill="${INK(P)}"/>`),

  // lịch có khoảng ngày tô màu — "thời hạn bảo hiểm"
  lich: (P) => khung(P, (S) => { let o = ""; for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const k = r * 6 + c, on = k >= 3 && k <= 19; o += `<rect x="${50 + c * 24}" y="${96 + r * 24}" width="18" height="18" rx="4" fill="${on ? (k === 3 || k === 19 ? "#" + P.gold : "#" + mix(P.acc, "FFFFFF", 0.55)) : "#E3E9EB"}"/>`; }
    return `<rect x="36" y="44" width="168" height="160" rx="14" fill="${S("w")}" stroke="#D5DEE1" stroke-width="2"/><path d="M36 58 Q36 44 50 44 H190 Q204 44 204 58 V84 H36Z" fill="${S("a")}"/>
<rect x="70" y="32" width="10" height="26" rx="5" fill="${INK(P)}"/><rect x="160" y="32" width="10" height="26" rx="5" fill="${INK(P)}"/>${o}`; }),
};
// ghép cảnh: tái bảo hiểm = ô lớn (DN nhận tái) che ô nhỏ (DNBH gốc, nhạt hơn) che ngôi nhà (đối tượng BH) — ba tầng, một bóng sàn
const trong = (s) => s.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "").replace(/<ellipse cx="120" cy="216"[^>]*\/>/, "");
VE["tai-bh"] = (P) => { const lon = VE["o-mua"](P), nho = VE["o-mua"]({ ...P, acc: mix(P.acc, "FFFFFF", 0.32) }), nha = VE.nha(P);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><radialGradient id="tbs"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>`
    + `<ellipse cx="120" cy="222" rx="70" ry="10" fill="url(#tbs)"/><svg x="0" y="-18" width="240" height="160" viewBox="0 0 240 150">${trong(lon)}</svg>`
    + `<svg x="58" y="74" width="124" height="80" viewBox="0 0 240 150">${trong(nho)}</svg><svg x="76" y="128" width="88" height="96" viewBox="0 40 240 180">${trong(nha)}</svg></svg>`; };


// cặp cột so STBH với GTBH: cột trái = GTBH (giá trị đối tượng, xám mực có hình nhà nhỏ), cột phải = STBH (màu nhấn); vạch ngang đứt = mức GTBH
const cot = (kieu) => (P) => khung(P, (S) => { const day = 196, g = 120, h = { bang: 120, duoi: 70, tren: 160, trung: 0 }[kieu];
  const cotG = `<rect x="44" y="${day - g}" width="64" height="${g}" rx="6" fill="#${mix(P.ink, "FFFFFF", 0.35)}"/><rect x="52" y="${day - g + 8}" width="10" height="${g - 16}" rx="5" fill="#fff" fill-opacity=".18"/>`;
  const cotS = kieu === "trung" ? [0, 1, 2].map((k) => `<rect x="132" y="${day - 64 * (k + 1)}" width="64" height="60" rx="6" fill="${k % 2 ? `#${mix(P.acc, "FFFFFF", 0.3)}` : S("a")}"/>`).join("")
    : `<rect x="132" y="${day - h}" width="64" height="${h}" rx="6" fill="${S("a")}"/><rect x="140" y="${day - h + 8}" width="10" height="${h - 16}" rx="5" fill="#fff" fill-opacity=".22"/>`;
  return `${cotG}${cotS}<path d="M30 ${day - g} H210" stroke="#${P.gold}" stroke-width="4" stroke-dasharray="10 7"/><rect x="28" y="${day}" width="184" height="8" rx="4" fill="${INK(P)}"/>`; }, { rx: 96 });
VE["cot-bang"] = cot("bang"); VE["cot-duoi"] = cot("duoi"); VE["cot-tren"] = cot("tren"); VE["cot-trung"] = cot("trung");
// phân tán rủi ro: một quỹ (khiên giữa) chia rủi ro ra nhiều nơi — ba ô che nhỏ ở ba hướng, nối bằng nét đứt
VE["phan-tan"] = (P) => { const o = (x, y, w) => `<svg x="${x}" y="${y}" width="${w}" height="${w}" viewBox="0 0 240 240">${trong(VE["o-mua"](P))}</svg>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><path d="M120 128 L46 70 M120 128 L194 70 M120 128 L120 200" stroke="#${P.gold}" stroke-width="4" stroke-dasharray="6 6"/>`
    + `${o(0, 6, 92)}${o(148, 6, 92)}${o(74, 150, 92)}<svg x="84" y="88" width="72" height="72" viewBox="0 0 240 240">${trong(VE.khien(P))}</svg></svg>`; };

const coVe = (ten) => Object.prototype.hasOwnProperty.call(VE, ten);
const veSvg = (ten, P) => (coVe(ten) ? VE[ten](P) : "");
const veUri = (ten, P) => `data:image/svg+xml;base64,${Buffer.from(veSvg(ten, P), "utf8").toString("base64")}`;
module.exports = { VE, coVe, veSvg, veUri, NAMES: Object.keys(VE) };
