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

// kính lúp soi tờ khai: khai báo trung thực / giám định — tờ giấy có ô khai, kính lúp phóng to một dòng có dấu chọn
VE["kinh-lup"] = (P) => khung(P, (S) => `
<rect x="40" y="26" width="120" height="164" rx="6" fill="${S("w")}" stroke="#D5DEE1" stroke-width="2"/>
${[50, 74, 98, 122, 146].map((y, i) => `<rect x="54" y="${y}" width="14" height="14" rx="3" fill="none" stroke="#${mix(P.ink, "FFFFFF", 0.45)}" stroke-width="2"/><rect x="76" y="${y + 4}" width="${[66, 54, 70, 48, 62][i]}" height="6" rx="3" fill="#C5D0D4"/>`).join("")}
<path d="M56 79 l4 4 l7 -9" fill="none" stroke="#${P.acc}" stroke-width="3" stroke-linecap="round"/>
<line x1="168" y1="162" x2="210" y2="204" stroke="${INK(P)}" stroke-width="18" stroke-linecap="round"/><line x1="168" y1="162" x2="180" y2="174" stroke="${S("g")}" stroke-width="18"/>
<circle cx="138" cy="130" r="50" fill="#${mix(P.acc, "FFFFFF", 0.82)}" fill-opacity=".85" stroke="${S("a")}" stroke-width="12"/>
<rect x="104" y="118" width="16" height="16" rx="3" fill="none" stroke="${INK(P)}" stroke-width="3"/><path d="M107 125 l5 5 l9 -11" fill="none" stroke="#${P.acc}" stroke-width="4" stroke-linecap="round"/><rect x="126" y="122" width="40" height="8" rx="4" fill="#9AA8AD"/>
<path d="M108 100 Q120 90 136 90" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-opacity=".8"/>`);

// đại lý bảo hiểm: người mặc vest màu nhấn, thẻ tên vàng trên ngực, cặp hồ sơ
VE["dai-ly"] = (P) => khung(P, (S) => `
<path d="M48 212 Q48 148 120 144 Q192 148 192 212Z" fill="${INK(P)}"/><path d="M96 148 L120 200 L144 148 Q132 144 120 144 Q108 144 96 148Z" fill="#fff"/>
<path d="M114 150 L120 160 L126 150 L124 188 L120 196 L116 188Z" fill="#${P.acc}"/>
<path d="M48 212 Q48 150 98 146 L118 212Z" fill="${S("a")}"/><path d="M192 212 Q192 150 142 146 L122 212Z" fill="${S("a")}"/>
<rect x="146" y="166" width="30" height="18" rx="3" fill="${S("g")}"/><rect x="150" y="171" width="18" height="3" rx="1.5" fill="#fff"/>
<rect x="108" y="118" width="24" height="28" rx="8" fill="#${mix(DA_NGUOI, "000000", 0.08)}"/><ellipse cx="120" cy="94" rx="34" ry="38" fill="#${DA_NGUOI}"/>
<path d="M86 92 Q84 56 120 56 Q158 56 154 92 Q146 72 120 72 Q96 72 86 92Z" fill="${INK(P)}"/>
<circle cx="107" cy="98" r="3.5" fill="${INK(P)}"/><circle cx="133" cy="98" r="3.5" fill="${INK(P)}"/><path d="M111 113 Q120 119 129 113" fill="none" stroke="${INK(P)}" stroke-width="3" stroke-linecap="round"/>
<rect x="20" y="168" width="56" height="42" rx="6" fill="#${NAU}"/><rect x="38" y="160" width="20" height="10" rx="3" fill="none" stroke="#${NAU}" stroke-width="4"/><rect x="20" y="182" width="56" height="4" fill="#000" fill-opacity=".18"/>`, { rx: 90 });

// hũ quỹ: nhiều đồng xu (nhiều người đóng) rơi vào một hũ thuỷ tinh — quỹ bảo hiểm / số đông / dồn tích
VE["hu-quy"] = (P) => khung(P, (S) => `
${[[70, 26], [112, 10], [154, 30], [92, 50], [136, 56]].map(([x, y], i) => `<ellipse cx="${x}" cy="${y + 8}" rx="15" ry="${i % 2 ? 6 : 15}" fill="${S("g")}" stroke="#${mix(P.gold, "000000", 0.25)}" stroke-width="2"/>`).join("")}
<rect x="76" y="70" width="88" height="16" rx="6" fill="${S("a")}"/>
<path d="M64 98 Q64 86 80 86 H160 Q176 86 176 98 V188 Q176 210 152 210 H88 Q64 210 64 188Z" fill="#${mix(P.acc, "FFFFFF", 0.82)}" fill-opacity=".9" stroke="#${mix(P.acc, "FFFFFF", 0.4)}" stroke-width="3"/>
${[0, 1, 2, 3, 4, 5].map((k) => `<ellipse cx="${120 + (k % 2 ? 10 : -8)}" cy="${196 - k * 14}" rx="${44 - (k % 3) * 4}" ry="9" fill="${S("g")}" stroke="#${mix(P.gold, "000000", 0.25)}" stroke-width="2"/>`).join("")}
<path d="M76 104 V180" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-opacity=".7"/>`);

// đồng hồ cát: thời gian / thời hạn dài / tích quỹ nhiều năm
VE["dong-ho-cat"] = (P) => khung(P, (S) => `
<rect x="56" y="22" width="128" height="18" rx="6" fill="#${NAU}"/><rect x="56" y="196" width="128" height="18" rx="6" fill="#${NAU}"/>
<rect x="66" y="40" width="8" height="156" fill="#${mix(NAU, "000000", 0.2)}"/><rect x="166" y="40" width="8" height="156" fill="#${mix(NAU, "000000", 0.2)}"/>
<path d="M82 40 H158 Q158 92 126 116 V120 Q158 144 158 196 H82 Q82 144 114 120 V116 Q82 92 82 40Z" fill="#${mix(P.acc, "FFFFFF", 0.82)}" stroke="#${mix(P.acc, "FFFFFF", 0.4)}" stroke-width="3"/>
<path d="M98 72 H142 Q136 96 120 108 Q104 96 98 72Z" fill="${S("g")}"/><path d="M90 194 Q96 156 120 150 Q144 156 150 194Z" fill="${S("g")}"/><path d="M120 110 V150" stroke="#${P.gold}" stroke-width="3" stroke-dasharray="3 4"/>
<path d="M92 50 Q90 80 104 98" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-opacity=".8"/>`, { rx: 70 });

// toà nhà doanh nghiệp bảo hiểm: khối văn phòng màu nhấn, cửa kính, huy hiệu khiên trên mặt tiền (không chữ, không biểu trưng thật)
VE["toa-dnbh"] = (P) => khung(P, (S) => `
<rect x="56" y="40" width="128" height="170" rx="6" fill="${S("a")}"/><rect x="120" y="40" width="64" height="170" fill="#000" fill-opacity=".1"/>
${[0, 1, 2, 3, 4].map((r) => [0, 1, 2].map((c) => `<rect x="${70 + c * 36}" y="${92 + r * 20}" width="26" height="12" rx="2" fill="#${mix(P.acc, "FFFFFF", 0.7)}" fill-opacity="${(r + c) % 3 ? 0.9 : 0.55}"/>`).join("")).join("")}
<path d="M120 50 L142 58 V72 Q142 84 120 90 Q98 84 98 72 V58Z" fill="${S("g")}"/><path d="M110 70 l7 7 l13 -13" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
<rect x="104" y="184" width="32" height="26" fill="${INK(P)}"/><rect x="44" y="206" width="152" height="8" rx="4" fill="${INK(P)}"/>`, { rx: 80 });

// ---------- CẢNH LỚN (khổ 1600 × 1000) — dùng làm "ảnh" cho bố cục split / cover / section: hình minh hoạ là nhân vật chính của slide ----------
const dat = (ten, P, x, y, w) => `<svg x="${x}" y="${y}" width="${w}" height="${w}" viewBox="0 0 240 240">${VE[ten](P).replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")}</svg>`;
const nenCanh = (P, nen) => `<defs><linearGradient id="trg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#${mix(P.acc, "FFFFFF", 0.86)}"/><stop offset="1" stop-color="#${nen}"/></linearGradient></defs>
<rect width="1600" height="1000" fill="url(#trg)"/><circle cx="1260" cy="210" r="90" fill="#${mix(P.gold, "FFFFFF", 0.55)}"/>
<path d="M0 760 Q300 650 640 720 T1300 690 T1600 720 V1000 H0Z" fill="#${mix(P.acc, "FFFFFF", 0.72)}"/><path d="M0 830 Q420 760 820 810 T1600 790 V1000 H0Z" fill="#${mix(P.acc, "FFFFFF", 0.55)}"/>`;
// mưa: bỏ giọt rơi trong vòm (cx, cy, rx, ry) — trong vòm là vùng được che
const mua = (P, n, x0, x1, y0, y1, v) => { let b = ""; for (let i = 0; i < n * 2; i++) { const x = x0 + ((i * 97) % (x1 - x0)), y = y0 + ((i * 53) % (y1 - y0));
    if (v && ((x - v[0]) / v[2]) ** 2 + ((y - v[1]) / v[3]) ** 2 < 1.15) continue; b += `<path d="M${x} ${y} l-10 26" stroke="#${mix(P.acc, "FFFFFF", 0.35)}" stroke-width="7" stroke-linecap="round" opacity=".75"/>`; } return b; };
const vom = (P, cx, cy, rx, ry, a = 0.16) => `<path d="M${cx - rx} ${cy} A${rx} ${ry} 0 0 1 ${cx + rx} ${cy}Z" fill="#${P.acc}" fill-opacity="${a}"/><path d="M${cx - rx} ${cy} A${rx} ${ry} 0 0 1 ${cx + rx} ${cy}" fill="none" stroke="#${P.acc}" stroke-width="10" stroke-opacity=".55"/>`
  + `<path d="M${cx - rx} ${cy} ${[...Array(8).keys()].map((k) => `Q${cx - rx + (k + 0.5) * rx / 4} ${cy - 30} ${cx - rx + (k + 1) * rx / 4} ${cy}`).join(" ")}" fill="none" stroke="#${P.gold}" stroke-width="8"/>`;
const mui = (x1, y1, x2, y2, P, nhan = "") => `<path d="M${x1} ${y1} Q${(x1 + x2) / 2} ${Math.min(y1, y2) - 90} ${x2} ${y2}" fill="none" stroke="#${P.gold}" stroke-width="9" stroke-dasharray="20 14" stroke-linecap="round"/><path d="M${x2} ${y2} l-30 -26 M${x2} ${y2} l-36 8" stroke="#${P.gold}" stroke-width="9" stroke-linecap="round"/>`;
const CANH = {
  // bìa: phố nhỏ dưới vòm ô che — nhà, xe, người (ba đối tượng BH) được che, mưa rơi ngoài vòm
  bia: (P) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">${nenCanh(P, "F7F3EA")}${mua(P, 40, 30, 1570, 30, 760, [800, 860, 640, 600])}
${vom(P, 800, 860, 640, 600)}<line x1="800" y1="260" x2="800" y2="200" stroke="#${P.ink}" stroke-width="12" stroke-linecap="round"/>${dat("nha", P, 280, 520, 380)}${dat("nguoi", P, 680, 560, 330)}${dat("o-to", P, 980, 600, 360)}</svg>`,
  // chuyển giao rủi ro: bên mua đóng phí → DNBH → khi rủi ro xảy ra (nhà cháy), DNBH bồi thường
  "chuyen-giao": (P) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">${nenCanh(P, "F7F3EA")}
${dat("nguoi", P, 80, 500, 330)}${dat("xu", P, 340, 610, 190)}${mui(400, 560, 600, 520, P)}${dat("toa-dnbh", P, 560, 260, 520)}
${mui(1040, 480, 1200, 560, P)}${dat("nha", P, 1130, 480, 400)}${dat("lua", P, 1330, 420, 200)}${dat("khien", P, 1120, 330, 170)}</svg>`,
  // số đông: nhiều người góp xu vào một hũ quỹ; một người gặp rủi ro được chi trả từ hũ
  "so-dong": (P) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">${nenCanh(P, "F7F3EA")}
${dat("dam-dong", P, 40, 420, 520)}${mui(470, 560, 640, 560, P)}${dat("hu-quy", P, 560, 330, 480)}${mui(1010, 560, 1180, 600, P)}${dat("nha", P, 1130, 540, 330)}${dat("may-giong", P, 1150, 300, 280)}</svg>`,
  // tái bảo hiểm: vòm lớn (DN nhận tái) phủ vòm nhỏ (DNBH gốc) phủ tàu + nhà máy — rủi ro lớn chia cho nhiều tầng
  "tai-bh": (P) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000">${nenCanh(P, "F7F3EA")}${mua(P, 40, 30, 1570, 30, 800, [800, 880, 720, 640])}
${vom(P, 800, 880, 720, 640, 0.1)}${vom({ ...P, acc: mix(P.acc, "FFFFFF", 0.25) }, 800, 880, 460, 400, 0.16)}${dat("tau", P, 360, 560, 420)}${dat("nha-may", P, 820, 520, 400)}${dat("lua", P, 1180, 640, 200)}</svg>`,
};

// ---------- CẢNH KHỔ ĐỨNG 800 × 1080 (ô ảnh của split / photostats / cover frame): câu chuyện đọc từ trên xuống ----------
const nenDoc = (P) => `<defs><linearGradient id="trd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#${mix(P.acc, "FFFFFF", 0.86)}"/><stop offset="1" stop-color="#F7F3EA"/></linearGradient></defs>
<rect width="800" height="1080" fill="url(#trd)"/><circle cx="640" cy="150" r="70" fill="#${mix(P.gold, "FFFFFF", 0.55)}"/>
<path d="M0 900 Q200 840 420 880 T800 860 V1080 H0Z" fill="#${mix(P.acc, "FFFFFF", 0.72)}"/><path d="M0 960 Q300 910 560 950 T800 940 V1080 H0Z" fill="#${mix(P.acc, "FFFFFF", 0.55)}"/>`;
const doc = (x1, y1, x2, y2, P) => `<path d="M${x1} ${y1} Q${Math.max(x1, x2) + 120} ${(y1 + y2) / 2} ${x2} ${y2}" fill="none" stroke="#${P.gold}" stroke-width="9" stroke-dasharray="20 14" stroke-linecap="round"/><path d="M${x2} ${y2} l12 -38 M${x2} ${y2} l38 -10" stroke="#${P.gold}" stroke-width="9" stroke-linecap="round"/>`;
// nhãn trong cảnh: chỉ viên trống (chữ thật đặt ở hộp chữ của slide — SVG làm ảnh không dùng được font của trang)
const nhanCanh = () => "";
const _nhanCu = (x, y, t, P) => `<g><rect x="${x}" y="${y}" width="${t.length * 17 + 40}" height="46" rx="23" fill="#fff" stroke="#${mix(P.acc, "FFFFFF", 0.6)}" stroke-width="2"/><text x="${x + 20}" y="${y + 31}" font-family="Be Vietnam Pro" font-weight="700" font-size="24" fill="#${P.ink}">${t}</text></g>`;
Object.assign(CANH, {
  "bia-doc": (P) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1080">${nenDoc(P)}${mua(P, 30, 20, 780, 20, 980, [400, 960, 380, 560])}
${vom(P, 400, 960, 380, 560)}<line x1="400" y1="400" x2="400" y2="350" stroke="#${P.ink}" stroke-width="12" stroke-linecap="round"/>${dat("nha", P, 60, 680, 290)}${dat("nguoi", P, 290, 700, 250)}${dat("o-to", P, 480, 730, 270)}</svg>`,
  "chuyen-giao-doc": (P) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1080">${nenDoc(P)}
${dat("nguoi", P, 70, 70, 250)}${dat("xu", P, 280, 150, 170)}${nhanCanh(80, 330, "Đóng phí", P)}${doc(330, 330, 380, 450, P)}
${dat("toa-dnbh", P, 300, 380, 330)}${nhanCanh(560, 560, "DNBH", P)}${doc(470, 720, 300, 800, P)}
${dat("nha", P, 120, 720, 290)}${dat("lua", P, 300, 690, 140)}${dat("khien", P, 430, 780, 170)}${nhanCanh(470, 960, "Bồi thường", P)}</svg>`,
  "so-dong-doc": (P) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1080">${nenDoc(P)}
${dat("dam-dong", P, 140, 10, 420)}${nhanCanh(60, 370, "Số đông đóng phí", P)}${doc(470, 380, 420, 470, P)}
${dat("hu-quy", P, 250, 420, 300)}${nhanCanh(520, 600, "Quỹ chung", P)}${doc(420, 730, 330, 820, P)}
${dat("may-giong", P, 470, 690, 200)}${dat("nha", P, 120, 760, 260)}${nhanCanh(420, 960, "Số ít bị tổn thất", P)}</svg>`,
  "tai-bh-doc": (P) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1080">${nenDoc(P)}${mua(P, 40, 20, 780, 20, 980, [400, 980, 390, 760])}
${vom(P, 400, 980, 390, 760, 0.1)}${vom({ ...P, acc: mix(P.acc, "FFFFFF", 0.25) }, 400, 980, 260, 460, 0.16)}
${nhanCanh(250, 250, "DN nhận tái", P)}${nhanCanh(270, 560, "DNBH gốc", P)}${dat("tau", P, 150, 740, 250)}${dat("nha-may", P, 380, 720, 250)}</svg>`,
});

// ---------- DIỄN VIÊN TOÀN THÂN (cảnh phim): anh X (người mua BH) và nhân viên DNBH ----------
const nguoiDung = (ao, quan, P, tay = "xuoi", ca = "") => (Q) => khung(Q, (S) => `
<rect x="98" y="150" width="20" height="56" rx="8" fill="#${quan}"/><rect x="122" y="150" width="20" height="56" rx="8" fill="#${mix(quan, "000000", 0.15)}"/>
<ellipse cx="106" cy="208" rx="16" ry="7" fill="${INK(Q)}"/><ellipse cx="134" cy="208" rx="16" ry="7" fill="${INK(Q)}"/>
<path d="M90 160 Q88 100 120 96 Q152 100 150 160Z" fill="#${ao}"/><path d="M120 96 Q152 100 150 160 H128Z" fill="#000" fill-opacity=".1"/>
<path d="M108 97 L120 112 L132 97 L126 95 L120 104 L114 95Z" fill="#fff" fill-opacity=".85"/><line x1="120" y1="112" x2="120" y2="158" stroke="#000" stroke-opacity=".15" stroke-width="2"/>
${[124, 138].map((y) => `<circle cx="123" cy="${y}" r="2.4" fill="#fff" fill-opacity=".8"/>`).join("")}<rect x="91" y="150" width="58" height="6" fill="#000" fill-opacity=".22"/><rect x="117" y="149" width="8" height="8" rx="1.5" fill="#${P.gold}"/>
<path d="M96 113 Q99 128 97 146" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="3" stroke-linecap="round"/>
${tay === "gio" ? `<path d="M148 112 Q170 92 176 64" fill="none" stroke="#${ao}" stroke-width="16" stroke-linecap="round"/><circle cx="177" cy="58" r="9" fill="#${DA_NGUOI}"/>` : `<path d="M150 110 Q160 134 156 158" fill="none" stroke="#${ao}" stroke-width="15" stroke-linecap="round"/><circle cx="156" cy="162" r="8" fill="#${DA_NGUOI}"/>`}
<path d="M90 110 Q80 134 84 158" fill="none" stroke="#${mix(ao, "000000", 0.12)}" stroke-width="15" stroke-linecap="round"/><circle cx="84" cy="162" r="8" fill="#${DA_NGUOI}"/>
${ca}<rect x="112" y="80" width="16" height="18" rx="6" fill="#${mix(DA_NGUOI, "000000", 0.08)}"/>
<ellipse cx="96" cy="64" rx="4.5" ry="6.5" fill="#${mix(DA_NGUOI, "000000", 0.1)}"/><ellipse cx="144" cy="64" rx="4.5" ry="6.5" fill="#${mix(DA_NGUOI, "000000", 0.14)}"/>
<ellipse cx="120" cy="62" rx="24" ry="27" fill="#${DA_NGUOI}"/><path d="M134 44 Q146 58 140 80 Q132 88 120 89 Q136 80 136 60Z" fill="#000" fill-opacity=".07"/><path d="M96 60 Q94 32 120 32 Q148 32 145 60 Q138 44 120 44 Q102 44 96 60Z" fill="${INK(Q)}"/>
<path d="M104 40 Q114 34 126 36" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="3" stroke-linecap="round"/>
<path d="M106 56 Q111 53 116 56 M124 56 Q129 53 134 56" fill="none" stroke="${INK(Q)}" stroke-width="2.2" stroke-linecap="round"/>
<circle cx="111" cy="64" r="2.8" fill="${INK(Q)}"/><circle cx="129" cy="64" r="2.8" fill="${INK(Q)}"/><circle cx="111.9" cy="63.1" r=".9" fill="#fff"/><circle cx="129.9" cy="63.1" r=".9" fill="#fff"/>
<ellipse cx="106" cy="72" rx="4.5" ry="2.6" fill="#E9967A" fill-opacity=".45"/><ellipse cx="134" cy="72" rx="4.5" ry="2.6" fill="#E9967A" fill-opacity=".45"/><path d="M120 66 Q122 70 119 71" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="1.6" stroke-linecap="round"/>
<path d="M113 75 Q120 80 127 75" fill="none" stroke="${INK(Q)}" stroke-width="2.5" stroke-linecap="round"/>`, { rx: 48 });
VE["anh-x"] = (P) => nguoiDung(P.acc, "3E4F5C", P)(P);
VE["anh-x-gio"] = (P) => nguoiDung(P.acc, "3E4F5C", P, "gio")(P);
// thêm hai người khác màu áo để phân biệt các chủ thể trong cùng một cảnh (người được BH, người thụ hưởng)
VE["nguoi-vang"] = (P) => nguoiDung(P.gold, "4A3F55", P)(P);
VE["nguoi-cam"] = (P) => nguoiDung("E07A5F", "3E4F5C", P, "gio")(P);
VE["nhan-vien"] = (P) => nguoiDung("F4F1EA", P.ink, P, "xuoi", `<path d="M114 100 L120 140 L126 100Z" fill="#${P.gold}"/>`)(P);
// toà DN nhận tái bảo hiểm: khối thấp rộng, mái vàng — khác toà DNBH gốc để người xem phân biệt hai doanh nghiệp
VE["toa-nhan-tai"] = (P) => khung(P, (S) => `
<path d="M30 92 L120 50 L210 92Z" fill="${S("g")}"/><rect x="40" y="92" width="160" height="118" rx="4" fill="#${mix(P.acc, "FFFFFF", 0.25)}"/><rect x="120" y="92" width="80" height="118" fill="#000" fill-opacity=".08"/>
${[0, 1, 2, 3, 4].map((c) => `<rect x="${52 + c * 30}" y="104" width="14" height="76" rx="3" fill="#F4F1EA"/>`).join("")}<rect x="100" y="182" width="40" height="28" fill="${INK(P)}"/><rect x="28" y="206" width="184" height="8" rx="4" fill="${INK(P)}"/>`, { rx: 100 });

// ---------- PHÔNG NỀN THEO GIỜ (2400 × 1080, rộng hơn slide 480 px để máy quay lia) ----------
// lớp xa → gần: trời · mặt trời · mây · đồi xa (nhạt, phối cảnh không khí) · phố xa · biển + cần cẩu (bên phải) · đất gần
const GIO = { sang: ["FDE9D3", "DCEFEC"], trua: ["CFEAEA", "F3F7F2"], chieu: ["FFE2B8", "F7F0E3"], giong: ["7C8D96", "C4CDCF"], "hoang-hon": ["F6B27A", "F7DCC4"] };
function phong(P, gio = "sang") {
  const [t1, t2] = GIO[gio] || GIO.sang, toi = gio === "giong", xa = (k) => mix(P.acc, toi ? "9AA6AB" : "FFFFFF", k);
  const may = (x, y, s, o) => `<g opacity="${o}" fill="#fff"><ellipse cx="${x}" cy="${y}" rx="${90 * s}" ry="${34 * s}"/><ellipse cx="${x + 60 * s}" cy="${y - 20 * s}" rx="${70 * s}" ry="${40 * s}"/><ellipse cx="${x + 130 * s}" cy="${y}" rx="${80 * s}" ry="${30 * s}"/></g>`;
  let pho = ""; for (let i = 0; i < 16; i++) { const x = 80 + i * 92, h = 60 + ((i * 37) % 90); pho += `<rect x="${x}" y="${640 - h}" width="70" height="${h}" fill="#${xa(0.68)}"/>`; }
  let cau = ""; for (const x of [1980, 2180]) cau += `<path d="M${x} 640 V420 H${x + 150} M${x} 440 L${x + 120} 420 M${x + 110} 420 V470" fill="none" stroke="#${xa(0.5)}" stroke-width="10"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 1080"><defs><linearGradient id="ph-t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#${t1}"/><stop offset="1" stop-color="#${t2}"/></linearGradient>
<radialGradient id="ph-m"><stop offset="0" stop-color="#FFF6D8"/><stop offset="1" stop-color="#FFF6D8" stop-opacity="0"/></radialGradient>
<linearGradient id="ph-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#${t2}" stop-opacity="0"/><stop offset=".6" stop-color="#${t2}" stop-opacity=".7"/><stop offset="1" stop-color="#${t2}" stop-opacity="0"/></linearGradient>
<filter id="ph-h" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="6"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .15  0 0 0 0 .2  0 0 0 .07 0"/></filter></defs>
<rect width="2400" height="1080" fill="url(#ph-t)"/>${toi ? may(300, 150, 2.2, 0.35) + may(1300, 120, 2.6, 0.3) + may(2000, 170, 2, 0.35) : `<circle cx="${gio === "hoang-hon" ? 1700 : 1900}" cy="${gio === "hoang-hon" ? 560 : 210}" r="260" fill="url(#ph-m)"/><circle cx="${gio === "hoang-hon" ? 1700 : 1900}" cy="${gio === "hoang-hon" ? 560 : 210}" r="78" fill="#${gio === "hoang-hon" ? "F7A35C" : mix(P.gold, "FFFFFF", 0.45)}"/>` + may(420, 200, 1, 0.8) + may(1250, 140, 0.8, 0.7)}
<path d="M0 620 Q300 520 620 590 T1260 560 T1900 600 V700 H0Z" fill="#${xa(0.78)}"/>${pho}${cau}
<rect x="1880" y="640" width="520" height="90" fill="#${xa(0.55)}"/><path d="M1880 660 Q1960 650 2040 660 T2200 660 T2400 660" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="5"/>
<rect x="0" y="560" width="2400" height="160" fill="url(#ph-s)"/>${(() => { let g = ""; for (let i = 0; i < 22; i++) { const x = 30 + i * 84, hh = 40 + ((i * 53) % 70); g += `<rect x="${x}" y="${690 - hh}" width="64" height="${hh}" fill="#${xa(0.55)}"/>`; for (let r = 0; r < Math.floor(hh / 22); r++) g += `<rect x="${x + 10}" y="${690 - hh + 8 + r * 22}" width="12" height="8" fill="#${toi ? "FFD98A" : xa(0.75)}" opacity="${toi ? 0.9 : 0.8}"/><rect x="${x + 40}" y="${690 - hh + 8 + r * 22}" width="12" height="8" fill="#${toi ? "FFD98A" : xa(0.75)}" opacity="${(i + r) % 3 ? 0.8 : 0.3}"/>`; } return g; })()}
<path d="M0 700 Q480 650 980 690 T1880 680 V1080 H0Z" fill="#${xa(0.6)}"/><path d="M0 820 Q600 760 1200 800 T2400 790 V1080 H0Z" fill="#${xa(0.45)}"/>
${toi ? [...Array(60).keys()].map((i) => `<path d="M${(i * 131) % 2400} ${(i * 71) % 760} l-12 30" stroke="#E6ECEE" stroke-width="5" stroke-linecap="round" opacity=".55"/>`).join("") : ""}<rect width="2400" height="1080" filter="url(#ph-h)"/></svg>`;
}

// ================= BẢN CHI TIẾT (11/2026, lượt "chau chuốt"): ghi đè các vật dùng chung xuất hiện trong nhiều cảnh =================
// toà DNBH: tường kính có khung, phản chiếu trời, dải sàn, sảnh có mái che + cửa xoay, biển khiên phát sáng trên đỉnh, máy lạnh trên mái
VE["toa-dnbh"] = (P) => khung(P, (S) => { const A = P.acc, sang = mix(A, "FFFFFF", 0.78), toi = mix(A, "000000", 0.25); let w = "";
  for (let r = 0; r < 8; r++) for (let c = 0; c < 4; c++) { const x = 66 + c * 26, y = 74 + r * 15; w += `<rect x="${x}" y="${y}" width="22" height="11" fill="${(r + c) % 5 ? "url(#kt)" : "#FFE3A0"}"/>`; }
  return `<defs><linearGradient id="kt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${sang}"/><stop offset=".55" stop-color="#${mix(A, "FFFFFF", 0.45)}"/><stop offset="1" stop-color="#${mix(A, "FFFFFF", 0.3)}"/></linearGradient></defs>
<rect x="54" y="40" width="132" height="168" fill="${S("a")}"/><rect x="164" y="40" width="22" height="168" fill="#${toi}"/>${w}
<path d="M66 74 L170 194" stroke="#fff" stroke-width="10" opacity=".12"/><path d="M90 74 L170 166" stroke="#fff" stroke-width="5" opacity=".1"/>
${[0, 1, 2, 3, 4, 5, 6, 7].map((r) => `<rect x="54" y="${86 + r * 15}" width="132" height="2" fill="#${toi}" opacity=".5"/>`).join("")}
<rect x="48" y="34" width="144" height="10" fill="#${toi}"/><rect x="72" y="24" width="20" height="12" rx="2" fill="#${mix(P.ink, "FFFFFF", 0.6)}"/><line x1="160" y1="34" x2="160" y2="10" stroke="#${P.ink}" stroke-width="3"/><circle cx="160" cy="9" r="3.5" fill="#${P.bad}"/>
<circle cx="120" cy="56" r="18" fill="#FFE7A6" opacity=".35"/><path d="M120 44 L134 49 V58 Q134 66 120 71 Q106 66 106 58 V49Z" fill="${S("g")}" stroke="#fff" stroke-width="2"/><path d="M114 57 l4 4 l8 -8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
<rect x="74" y="186" width="92" height="6" fill="#${P.gold}"/><rect x="92" y="192" width="56" height="18" fill="url(#kt)"/><line x1="120" y1="192" x2="120" y2="210" stroke="#${toi}" stroke-width="2"/>
<rect x="40" y="208" width="160" height="8" rx="4" fill="${INK(P)}"/>`; }, { rx: 82 });

// toà DN nhận tái: kiến trúc cổ điển (ngân hàng / tái BH lâu đời) — bậc thềm, cột có rãnh + đầu cột, trán tường, cờ trên mái
VE["toa-nhan-tai"] = (P) => khung(P, (S) => { const G = P.gold, cot = mix("F4F1EA", "000000", 0.04);
  return `<path d="M24 92 L120 46 L216 92Z" fill="${S("g")}"/><path d="M120 46 L216 92 H120Z" fill="#000" opacity=".1"/><path d="M52 86 L120 56 L188 86Z" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/>
<line x1="120" y1="46" x2="120" y2="16" stroke="${INK(P)}" stroke-width="3"/><path d="M121 17 h26 l-6 7 l6 7 h-26Z" fill="#${P.acc}"/>
<rect x="30" y="92" width="180" height="12" fill="#${mix(G, "000000", 0.2)}"/>
${[0, 1, 2, 3, 4].map((k) => { const x = 44 + k * 34; return `<rect x="${x}" y="104" width="20" height="82" fill="#${cot}"/><rect x="${x + 4}" y="104" width="2" height="82" fill="#000" opacity=".08"/><rect x="${x + 10}" y="104" width="2" height="82" fill="#000" opacity=".08"/><rect x="${x + 15}" y="104" width="5" height="82" fill="#000" opacity=".1"/><rect x="${x - 3}" y="102" width="26" height="6" fill="#${mix(G, "FFFFFF", 0.2)}"/><rect x="${x - 3}" y="184" width="26" height="5" fill="#${mix(G, "FFFFFF", 0.2)}"/>`; }).join("")}
<rect x="36" y="104" width="168" height="84" fill="#${P.acc}" opacity=".18"/><rect x="108" y="140" width="24" height="46" fill="${INK(P)}"/>
<rect x="26" y="189" width="188" height="8" fill="#${mix("E8E0D0", "000000", 0.05)}"/><rect x="18" y="197" width="204" height="8" fill="#${mix("E8E0D0", "000000", 0.12)}"/><rect x="10" y="205" width="220" height="8" fill="#${mix("E8E0D0", "000000", 0.2)}"/>`; }, { rx: 104 });

// nhà: tường kem có gradient, mái ngói xếp hàng, ống khói gạch, cửa sổ ô kính + rèm + bậu, cửa có tay nắm + bậc, bụi cây, hàng rào
VE.nha = (P) => khung(P, (S) => { const NG = "C8653A", ngd = mix(NG, "000000", 0.22);
  return `<defs><linearGradient id="tuong" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF8EC"/><stop offset="1" stop-color="#F1E6D2"/></linearGradient></defs>
<rect x="148" y="58" width="20" height="40" fill="#${ngd}"/>${[0, 1, 2].map((r) => `<line x1="148" y1="${66 + r * 10}" x2="168" y2="${66 + r * 10}" stroke="#${mix(NG, "000000", 0.4)}" stroke-width="1.5"/>`).join("")}
<path d="M48 206 V112 L120 62 L192 112 V206Z" fill="url(#tuong)"/><path d="M120 62 L192 112 V206 H150 V118Z" fill="#000" fill-opacity=".05"/>
<path d="M30 118 L120 50 L210 118 L198 128 L120 70 L42 128Z" fill="#${NG}"/>${[1, 2, 3, 4].map((k) => `<path d="M${30 + k * 11} ${118 - k * 8.3} L${210 - k * 11} ${118 - k * 8.3}" stroke="#${ngd}" stroke-width="2" opacity=".55"/>`).join("")}
<path d="M120 50 L210 118 L198 128 L120 70Z" fill="#000" fill-opacity=".14"/>
${[62, 152].map((x) => `<rect x="${x}" y="132" width="28" height="28" fill="#FFE7A8" stroke="#fff" stroke-width="4"/><path d="M${x} 132 q8 12 0 28 M${x + 28} 132 q-8 12 0 28" fill="#${mix(P.bad, "FFFFFF", 0.55)}" opacity=".85"/><line x1="${x + 14}" y1="132" x2="${x + 14}" y2="160" stroke="#fff" stroke-width="2.5"/><rect x="${x - 4}" y="160" width="36" height="5" fill="#${ngd}"/>`).join("")}
<rect x="100" y="150" width="40" height="56" rx="3" fill="${S("a")}"/><rect x="106" y="156" width="28" height="18" rx="2" fill="#fff" opacity=".18"/><circle cx="131" cy="182" r="3" fill="#${P.gold}"/><rect x="94" y="204" width="52" height="6" fill="#C9BFAE"/>
<circle cx="42" cy="196" r="14" fill="#3F7F5E"/><circle cx="58" cy="200" r="10" fill="#4C8F6A"/><circle cx="198" cy="198" r="12" fill="#3F7F5E"/>
<rect x="36" y="206" width="168" height="7" rx="3.5" fill="#${mix(P.acc, "FFFFFF", 0.2)}"/>`; });

// tàu container: thân hai màu + vạch nước, ô cửa tròn, container có gân + 4 màu, cabin có cửa kính, ống khói, bọt sóng đuôi
VE.tau = (P) => khung(P, (S) => { const mau = [P.acc, P.gold, "C8653A", mix(P.acc, "FFFFFF", 0.35)]; let ct = "";
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { if (r === 2 && c > 2) continue; const x = 40 + c * 30, y = 120 - r * 20; ct += `<rect x="${x}" y="${y}" width="29" height="19" fill="#${mau[(r * 3 + c) % 4]}"/>` + [5, 10, 15, 20, 25].map((g) => `<line x1="${x + g}" y1="${y + 2}" x2="${x + g}" y2="${y + 17}" stroke="#000" stroke-opacity=".14" stroke-width="1.5"/>`).join(""); }
  return `${ct}<rect x="164" y="80" width="40" height="60" fill="#F4F7F8"/><rect x="164" y="80" width="40" height="6" fill="#${P.acc}"/>${[0, 1, 2].map((c) => `<rect x="${168 + c * 12}" y="92" width="9" height="7" fill="#${mix(P.acc, "FFFFFF", 0.45)}"/>`).join("")}<rect x="182" y="58" width="12" height="22" fill="#${P.bad}"/><rect x="182" y="58" width="12" height="5" fill="${INK(P)}"/>
<path d="M12 140 H226 L206 186 H38Z" fill="${INK(P)}"/><path d="M28 172 H214 L206 186 H38Z" fill="#${P.bad}" opacity=".8"/><path d="M18 152 H222" stroke="#${P.gold}" stroke-width="4"/>${[60, 90, 120, 150, 180].map((x) => `<circle cx="${x}" cy="162" r="3.5" fill="#FFE3A0"/>`).join("")}
<path d="M2 194 Q22 184 42 194 T82 194 T122 194 T162 194 T202 194 T242 194" fill="none" stroke="${S("a")}" stroke-width="7" stroke-linecap="round"/><path d="M200 188 q18 -8 34 2" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"/>`; }, { rx: 104 });

// nhà máy: mái răng cưa có cửa kính mái, tường gạch có lưới cửa sổ, ống dẫn, hai ống khói sọc + khói nhiều lớp
VE["nha-may"] = (P) => khung(P, (S) => `
${[[64, 26, 16], [80, 14, 20], [100, 6, 16], [150, 40, 13], [164, 30, 16]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#${mix("C9D3D6", "FFFFFF", 0.3)}" opacity=".9"/>`).join("")}
<rect x="56" y="44" width="20" height="90" fill="#${mix(P.ink, "FFFFFF", 0.3)}"/><rect x="56" y="58" width="20" height="7" fill="#${P.bad}"/><rect x="56" y="74" width="20" height="7" fill="#${P.bad}"/>
<rect x="142" y="60" width="18" height="74" fill="#${mix(P.ink, "FFFFFF", 0.3)}"/><rect x="142" y="72" width="18" height="7" fill="#${P.bad}"/>
<path d="M24 210 V130 L70 104 V130 L116 104 V130 L162 104 V130 L216 104 V210Z" fill="${S("a")}"/>${[0, 1, 2, 3].map((k) => `<path d="M${24 + k * 46} 130 L${70 + k * 46} 104 V${k === 3 ? 104 : 130}" fill="none"/><path d="M${54 + k * 46} 112 L${70 + k * 46} 104 V124 L${54 + k * 46} 130Z" fill="#${mix(P.acc, "FFFFFF", 0.6)}" opacity=".8"/>`).join("")}
<path d="M162 104 V130 L216 104 V210 H170Z" fill="#000" fill-opacity=".1"/>
${[0, 1, 2, 3, 4].map((c) => [0, 1].map((r) => `<rect x="${34 + c * 34}" y="${146 + r * 22}" width="22" height="15" fill="${(c + r) % 3 ? "url(#bdKg)" : "#FFE3A0"}" stroke="#${mix(P.acc, "000000", 0.2)}" stroke-width="2"/>`).join("")).join("")}
<defs><linearGradient id="bdKg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCEDF0"/><stop offset="1" stop-color="#8FB2BC"/></linearGradient></defs>
<path d="M210 150 H226 V208" fill="none" stroke="#${P.gold}" stroke-width="6"/><rect x="96" y="186" width="44" height="24" fill="${INK(P)}"/>`);

const coVe = (ten) => Object.prototype.hasOwnProperty.call(VE, ten);
const veSvg = (ten, P) => (coVe(ten) ? VE[ten](P) : "");
const veUri = (ten, P) => `data:image/svg+xml;base64,${Buffer.from(veSvg(ten, P), "utf8").toString("base64")}`;
module.exports = { phong, GIO, CANH, VE, coVe, veSvg, veUri, NAMES: Object.keys(VE) };
