// CẢNH MINH HOẠ DỰNG THEO LỐI CHUYÊN NGHIỆP (11/2026) — học từ khung hình kiểu Kurzgesagt và minh hoạ bảo hiểm doanh nghiệp:
//  1) MỘT nguồn sáng nhuộm mọi vật (color script): mọi màu vật đi qua `den()` — pha về màu ánh sáng của cảnh
//  2) 3–4 tầng độ sáng: hậu cảnh bóng phẳng nhạt · trung cảnh chi tiết · tiền cảnh khối tối đóng khung hai góc dưới
//  3) tỉ lệ thật: người tí hon so với nhà / phố → cảnh rộng
//  4) góc máy ¾ từ trên cao, con phố chéo là đường dẫn mắt về tiêu điểm (toà DNBH có khiên phát sáng)
//  5) chồng lấn + mật độ chi tiết nhỏ (cửa sổ sáng đèn, đèn đường, người, xe, chim)
//  6) câu chuyện: giông (rủi ro) kéo tới góc trên phải, vầng sáng của khiên che thị trấn
const mixc = (a, b, t) => { const h = (x) => [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16)); const A = h(a), B = h(b); return A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
const rnd = (seed) => () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

// hai khung giờ cùng bố cục (bìa = hoàng hôn, kết = đêm): đổi nguồn sáng, trời, nước, sương — vật giữ nguyên chỗ để hai cảnh là một cặp mở–đóng
const GIO_CANH = {
  "hoang-hon": { sang: "F6A877", bong: "4B3F6B", tr: ["E9876F", "F7B98C", "FCE0B8"], may: "FFE9D2", nuoc: ["F2A783", "C98A8E", "3F6F86"], suong: "FCE0B8", nen: "C9B79C", pho: "E9876F" },
  dem: { sang: "6F7FB8", bong: "141B33", tr: ["0F1630", "26315A", "4A4F7E"], may: "3A456E", nuoc: ["4A4F7E", "2C3560", "121A35"], suong: "4A4F7E", nen: "5B5E7E", pho: "26315A" },
};
function bia(P, gio = "hoang-hon") {
  const T = GIO_CANH[gio] || GIO_CANH["hoang-hon"], R = rnd(7), SANG = T.sang, BONG = T.bong;
  const den = (c, k = 0.28) => mixc(c, SANG, k), toi = (c, k = 0.35) => mixc(c, BONG, k);
  const W = 1920, H = 1080, VX = 1390, VY = 600;                  // điểm tụ: chân toà DNBH
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><defs>
<linearGradient id="tr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#${T.tr[0]}"/><stop offset=".55" stop-color="#${T.tr[1]}"/><stop offset="1" stop-color="#${T.tr[2]}"/></linearGradient>
<radialGradient id="khienSang" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFE7A6" stop-opacity=".95"/><stop offset=".45" stop-color="#FFD27A" stop-opacity=".35"/><stop offset="1" stop-color="#FFD27A" stop-opacity="0"/></radialGradient>
<linearGradient id="duong" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#${toi("6B6F86", 0.2)}"/><stop offset="1" stop-color="#${den("8C8AA0", 0.35)}"/></linearGradient>
<linearGradient id="giong" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5E4E79"/><stop offset="1" stop-color="#8B6F8E"/></linearGradient>
<linearGradient id="nuoc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#${T.nuoc[0]}"/><stop offset=".35" stop-color="#${T.nuoc[1]}"/><stop offset="1" stop-color="#${T.nuoc[2]}"/></linearGradient>
<linearGradient id="suong" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#${T.suong}" stop-opacity="0"/><stop offset=".6" stop-color="#${T.suong}" stop-opacity=".55"/><stop offset="1" stop-color="#${T.suong}" stop-opacity="0"/></linearGradient>
<linearGradient id="mat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
<linearGradient id="bongDai" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B2F55" stop-opacity=".32"/><stop offset="1" stop-color="#3B2F55" stop-opacity="0"/></linearGradient>
<filter id="hat" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .15  0 0 0 0 .25  0 0 0 .09 0"/></filter></defs>
<rect width="${W}" height="${H}" fill="url(#tr)"/>`;
  if (gio === "dem") { for (let i = 0; i < 90; i++) s += `<circle cx="${(R() * W).toFixed(0)}" cy="${(R() * 460).toFixed(0)}" r="${(1 + R() * 2.2).toFixed(1)}" fill="#FFF6D8" opacity="${(0.4 + R() * 0.6).toFixed(2)}"/>`;
    s += `<circle cx="420" cy="200" r="120" fill="#FFF1C2" opacity=".12"/><circle cx="420" cy="200" r="56" fill="#FFF3CF"/><circle cx="444" cy="186" r="50" fill="#${T.tr[0]}" opacity=".9"/>`; }
  // mây xa (dải ngang bo tròn — ngôn ngữ hình của mây kiểu Kurzgesagt)
  for (const [x, y, w] of [[120, 120, 380], [420, 210, 300], [980, 150, 420], [60, 300, 260]]) s += `<rect x="${x}" y="${y}" width="${w}" height="44" rx="22" fill="#${T.may}" opacity=".75"/><rect x="${x + w * 0.25}" y="${y - 30}" width="${w * 0.45}" height="40" rx="20" fill="#${T.may}" opacity=".75"/>`;
  // GIÔNG kéo tới (góc trên phải): khối mây tím, mưa xiên — dừng ở vầng sáng của khiên
  s += `<g>${[[1560, 40, 420], [1700, 110, 300], [1500, 120, 260]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="90" rx="45" fill="url(#giong)"/><rect x="${x + w * 0.2}" y="${y - 50}" width="${w * 0.5}" height="80" rx="40" fill="url(#giong)"/>`).join("")}</g>`;
  for (let i = 0; i < 70; i++) { const x = 1500 + R() * 440, y = 200 + R() * 260; const dx = x - VX, dy = y - 330; if (dx * dx / (330 * 330) + dy * dy / (230 * 230) < 1) continue; s += `<path d="M${x.toFixed(0)} ${y.toFixed(0)} l-14 34" stroke="#7E6C97" stroke-width="4" stroke-linecap="round" opacity=".7"/>`; }
  // hậu cảnh: phố xa một tầng độ sáng (bóng phẳng nhuộm màu trời)
  let px = 0; s += `<path d="M0 ${VY}`; while (px < W) { const w = 40 + R() * 70, h = 40 + R() * 110; s += ` V${VY - h} H${px + w}`; px += w; } s += ` V${VY + 40} H0Z" fill="#${mixc(T.pho, BONG, 0.18)}" opacity=".55"/>`;
  s += `<path d="M0 ${VY + 10} Q500 ${VY - 40} 1000 ${VY + 6} T${W} ${VY - 10} V${VY + 80} H0Z" fill="#${mixc("D98A7E", BONG, 0.25)}"/>`;
  s += `<rect x="0" y="${VY - 140}" width="${W}" height="220" fill="url(#suong)"/>`;   // sương chân trời: chỉ phủ hậu cảnh (phối cảnh không khí)
  // vầng sáng của khiên (tiêu điểm) — sau toà nhà
  s += `<circle cx="${VX}" cy="330" r="360" fill="url(#khienSang)"/>`;
  // TOÀ DNBH (tiêu điểm): mặt sáng / mặt tối, cửa sổ sáng đèn, khiên vàng phát sáng trên đỉnh
  const tx = VX - 70; s += `<rect x="${tx}" y="300" width="140" height="${VY - 300 + 20}" fill="#${den(P.acc, 0.22)}"/><rect x="${tx + 90}" y="300" width="50" height="${VY - 300 + 20}" fill="#${toi(P.acc, 0.4)}"/>`;
  for (let r = 0; r < 11; r++) for (let c = 0; c < 3; c++) s += `<rect x="${tx + 14 + c * 26}" y="${330 + r * 24}" width="16" height="12" fill="#${R() > 0.3 ? "FFD98A" : den("2E5D63", 0.2)}"/>`;
  s += `<rect x="${tx - 8}" y="292" width="156" height="12" fill="#${toi(P.acc, 0.5)}"/><rect x="${tx + 40}" y="${VY - 40}" width="60" height="60" fill="#FFE3A0" opacity=".9"/><rect x="${tx}" y="300" width="140" height="${VY - 280}" fill="url(#mat)"/>`;
  s += `<path d="M${VX} 220 L${VX + 44} 236 V262 Q${VX + 44} 290 ${VX} 304 Q${VX - 44} 290 ${VX - 44} 262 V236Z" fill="#F7C04A" stroke="#FFF1C2" stroke-width="4"/><path d="M${VX - 16} 262 l12 12 l22 -24" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>`;
  // con phố chéo (đường dẫn mắt): từ góc dưới trái về điểm tụ
  // nền đất phía trước (vỉa hè) + MẶT NƯỚC CẢNG bên phải: phản chiếu ánh trời, vệt sáng lấp lánh, một con tàu
  s += `<path d="M0 700 L${VX - 30} ${VY + 30} L${W} ${VY + 30} V${H} H0Z" fill="#${den(T.nen, 0.35)}"/>`;
  s += `<path d="M1000 ${H} L${VX + 60} ${VY + 40} L${W} ${VY + 40} V${H}Z" fill="url(#nuoc)"/>`;
  s += `<rect x="${VX - 70}" y="${VY + 44}" width="140" height="190" fill="#2C4E5E" opacity=".22"/><rect x="${VX - 20}" y="${VY + 44}" width="40" height="260" fill="#FFD98A" opacity=".18"/>`;
  for (let i = 0; i < 46; i++) { const y = VY + 60 + R() * (H - VY - 80), xmin = 1000 + (VX + 60 - 1000) * ((H - y) / (H - VY - 40)), x = xmin + 40 + R() * (W - xmin - 40), w = 20 + R() * 60; s += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="6" rx="3" fill="#${R() > 0.5 ? "FFD9A0" : "F7A87A"}" opacity=".8"/>`; }
  s += `<g transform="translate(1640 ${VY + 150}) scale(.9)"><path d="M-150 0 H150 L120 46 H-120Z" fill="#2B3A4F"/><rect x="-150" y="-6" width="300" height="10" fill="#F2C14E"/>${[0, 1, 2, 3, 4, 5].map((k) => `<rect x="${-130 + k * 38}" y="-40" width="34" height="32" fill="#${den(["3D8A87", "E07A5F", "F2C14E", "6D8EAD"][k % 4], 0.2)}"/>`).join("")}<rect x="90" y="-80" width="40" height="74" fill="#${den("F4F1DE", 0.2)}"/><rect x="104" y="-104" width="10" height="24" fill="#2B3A4F"/></g>`;
  s += `<path d="M-40 ${H} L600 ${H} L${VX + 40} ${VY + 34} L${VX - 30} ${VY + 30} L0 700 Z" fill="url(#duong)"/>`;
  for (let k = 0; k < 9; k++) { const t0 = k / 9, t1 = t0 + 0.05; const p = (t) => [260 + (VX + 5 - 260) * t, H + (VY + 30 - H) * t]; const [a, b] = p(t0), [c2, d2] = p(t1); s += `<line x1="${a}" y1="${b}" x2="${c2}" y2="${d2}" stroke="#FFE3B0" stroke-width="${10 * (1 - t0) + 2}" stroke-linecap="round" opacity=".8"/>`; }
  // dãy nhà dọc phố (phía sau đường): thu nhỏ dần về điểm tụ, mái dốc, mặt tối bên phải, cửa sổ sáng đèn
  const MAU = ["F2C14E", "E07A5F", "81B29A", "F4F1DE", "3D8A87", "D6A2AD", "6D8EAD"];
  const nha = [];
  for (let t = 0.02; t < 0.92; ) { const sc = 1 - t * 0.86, w = 190 * sc, h = (150 + R() * 120) * sc; const x = -60 + (VX - 120 + 60) * t, y = H - 380 + (VY + 30 - (H - 380)) * t; nha.push({ x, y, w, h, sc, m: MAU[Math.floor(R() * MAU.length)] }); t += (w * 0.92) / (VX - 60); }
  nha.reverse().forEach(({ x, y, w, h, sc, m }) => {
    const mai = 0.42 * w, sang = den(m, 0.3), tdo = toi(m, 0.42);
    s += `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="#${sang}"/><rect x="${x + w * 0.72}" y="${y - h}" width="${w * 0.28}" height="${h}" fill="#${tdo}"/>`;
    s += `<path d="M${x - 6 * sc} ${y - h} L${x + w / 2} ${y - h - mai} L${x + w + 6 * sc} ${y - h}Z" fill="#${toi(R() > 0.5 ? "B5523B" : "5B4B6E", 0.15)}"/><path d="M${x + w / 2} ${y - h - mai} L${x + w + 6 * sc} ${y - h} H${x + w / 2}Z" fill="#000" opacity=".12"/>`;
    const n = Math.max(2, Math.round(3 * sc + 1)); for (let r = 0; r < 2; r++) for (let c = 0; c < n; c++) s += `<rect x="${x + w * 0.12 + c * (w * 0.6 / n)}" y="${y - h + h * 0.18 + r * h * 0.36}" width="${w * 0.12}" height="${h * 0.16}" fill="#${R() > 0.35 ? "FFD98A" : toi(m, 0.5)}"/>`;
    s += `<rect x="${x + w * 0.42}" y="${y - h * 0.3}" width="${w * 0.16}" height="${h * 0.3}" fill="#${toi(m, 0.6)}"/><rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="url(#mat)"/>`;
    s += `<path d="M${x} ${y} L${x + w} ${y} L${x + w - 40 * sc} ${y + 90 * sc} L${x - 60 * sc} ${y + 90 * sc}Z" fill="url(#bongDai)"/>`;   // ánh sáng từ phía sau → bóng đổ về phía người xem
    if (R() > 0.45) { const tx2 = x + w + 4 * sc, r = 34 * sc; s += `<rect x="${tx2 - 3 * sc}" y="${y - 40 * sc}" width="${6 * sc}" height="${40 * sc}" fill="#4A3B45"/><rect x="${tx2 - r}" y="${y - 40 * sc - 2 * r}" width="${2 * r}" height="${2 * r}" rx="${r * 0.9}" fill="#${toi("2F6B5E", 0.25)}"/><path d="M${tx2 - r * 0.7} ${y - 40 * sc - 1.6 * r} q${r * 0.5} ${-r * 0.5} ${r * 1.2} 0" fill="none" stroke="#${den("6FB39B", 0.35)}" stroke-width="${4 * sc + 1}" stroke-linecap="round"/>`; }
  });
  s += `<path d="M0 700 L${VX - 30} ${VY + 30} L${VX - 30} ${VY + 36} L0 718Z" fill="#${den("E8D9BE", 0.3)}"/>`;
  // đèn đường dọc phố (đường dẫn mắt thứ hai), bóng đèn phát sáng
  for (let k = 0; k < 6; k++) { const t = 0.08 + k * 0.15, sc = 1 - t * 0.86, x = 470 + (VX + 60 - 470) * t, y = H - 40 + (VY + 40 - (H - 40)) * t; s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - 170 * sc}" stroke="#${toi("3B3550", 0.1)}" stroke-width="${7 * sc + 1}"/><circle cx="${x}" cy="${y - 170 * sc}" r="${34 * sc}" fill="#FFE3A0" opacity=".35"/><circle cx="${x}" cy="${y - 170 * sc}" r="${11 * sc + 2}" fill="#FFE9B5"/>`; }
  // DÒNG NGƯỜI trên vỉa hè dọc chân nhà (khung "số đông" cắt từ đây): nhiều người tí hon, màu áo khác nhau, thưa dần về xa
  const AO = ["3D8A87", "E07A5F", "F2C14E", "6D8EAD", "81B29A", "D6A2AD", "F4F1DE"];
  for (let k = 0; k < 46; k++) { const t = 0.02 + Math.pow(R(), 1.4) * 0.62, sc = 1 - t * 0.86, x = -40 + (VX - 30 + 40) * t + R() * 30 * sc, y = 712 + (VY + 34 - 712) * t + R() * 26 * sc, c = AO[Math.floor(R() * AO.length)];
    s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(10 * sc).toFixed(1)}" ry="${(3 * sc).toFixed(1)}" fill="#000" opacity=".18"/><rect x="${(x - 6 * sc).toFixed(1)}" y="${(y - 34 * sc).toFixed(1)}" width="${(12 * sc).toFixed(1)}" height="${(26 * sc).toFixed(1)}" rx="${(5 * sc).toFixed(1)}" fill="#${toi(c, 0.2)}"/><circle cx="${x.toFixed(1)}" cy="${(y - 41 * sc).toFixed(1)}" r="${(7 * sc).toFixed(1)}" fill="#${den("F2C29B", 0.25)}"/>`; }
  // người tí hon + một chiếc xe trên phố (tỉ lệ)
  for (const [t, c] of [[0.18, "3D8A87"], [0.33, "E07A5F"], [0.5, "F2C14E"], [0.64, "6D8EAD"]]) { const sc = 1 - t * 0.86, x = 330 + (VX - 330) * t, y = H - 60 + (VY + 32 - (H - 60)) * t; s += `<ellipse cx="${x}" cy="${y}" rx="${12 * sc}" ry="${3 * sc}" fill="#000" opacity=".2"/><rect x="${x - 7 * sc}" y="${y - 40 * sc}" width="${14 * sc}" height="${30 * sc}" rx="${6 * sc}" fill="#${toi(c, 0.15)}"/><circle cx="${x}" cy="${y - 48 * sc}" r="${8 * sc}" fill="#${den("F2C29B", 0.2)}"/>`; }
  { const t = 0.42, sc = 1 - t * 0.86, x = 520 + (VX - 520) * t, y = H - 20 + (VY + 30 - (H - 20)) * t; s += `<g transform="translate(${x} ${y}) scale(${sc})"><rect x="-70" y="-46" width="140" height="34" rx="12" fill="#${den("2F6F8F", 0.2)}"/><path d="M-44 -46 L-28 -72 H30 L46 -46Z" fill="#${den("2F6F8F", 0.1)}"/><path d="M-34 -48 L-22 -66 H0 V-48Z M6 -48 V-66 H26 L38 -48Z" fill="#FFE3B0" opacity=".85"/><circle cx="-40" cy="-12" r="14" fill="#2B2438"/><circle cx="40" cy="-12" r="14" fill="#2B2438"/><rect x="58" y="-38" width="12" height="8" fill="#FFF1C2"/></g>`; }
  // chim (sự sống) ở khoảng trời giữa
  for (const [x, y] of [[860, 300], [900, 280], [930, 310], [1010, 260]]) s += `<path d="M${x} ${y} q8 -8 16 0 q8 -8 16 0" fill="none" stroke="#6E4E6E" stroke-width="3" stroke-linecap="round"/>`;
  // TIỀN CẢNH: khối cây tối đóng khung hai góc dưới (tầng độ sáng tối nhất), viền sáng phía nguồn sáng
  // bụi cây = nhiều khối bo tròn chồng nhau (ngôn ngữ hình tròn mềm), viền sáng phía trên
  const bui = (cx, cy, r) => [[0, 0, 1], [-0.75, 0.25, 0.7], [0.7, 0.3, 0.75], [0.1, -0.55, 0.62]].map(([dx, dy, k]) => { const x = cx + dx * r, y = cy + dy * r, rr = r * k;
    return `<rect x="${x - rr}" y="${y - rr}" width="${2 * rr}" height="${2 * rr}" rx="${rr * 0.85}" fill="#1E3A43"/><path d="M${x - rr * 0.6} ${y - rr * 0.78} Q${x} ${y - rr * 1.02} ${x + rr * 0.6} ${y - rr * 0.78}" fill="none" stroke="#${den("3D8A87", 0.15)}" stroke-width="7" stroke-linecap="round"/>`; }).join("");
  s += [[-40, 1040, 190], [130, 1100, 170], [1820, 1030, 200], [1660, 1110, 160], [1950, 900, 150]].map(([a, b, r]) => bui(a, b, r)).join("");
  s += `<rect x="1760" y="560" width="22" height="520" fill="#1F3B44"/><circle cx="1771" cy="560" r="30" fill="#FFE3A0" opacity=".35"/><circle cx="1771" cy="560" r="14" fill="#FFE9B5"/>`;
  s += `<rect width="${W}" height="${H}" filter="url(#hat)"/>`;   // hạt nhiễu mịn: bề mặt "in" thay vì phẳng lì
  return s + `</svg>`;
}
// cắt một khung từ cảnh gốc (cùng thế giới, khác góc máy): đổi viewBox, giữ nguyên nội dung
const cat = (svg, x, y, w, h) => svg.replace(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" viewBox="[^"]*"/, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="xMidYMid slice"`);
module.exports = { bia, cat, GIO_CANH };
