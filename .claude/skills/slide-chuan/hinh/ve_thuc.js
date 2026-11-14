"use strict";
// BỘ HÌNH BÁN TẢ THỰC (11/2026) — tự vẽ bằng SVG: tỉ lệ người lớn, một nguồn sáng từ trên-trái,
// khối có mặt sáng / mặt tối, chất liệu bằng gradient + nhiễu mịn, bóng đổ mềm (blur). Không có chữ trong SVG.
// Mỗi vật: viewBox 0 0 240 240 (vật đứng trên đáy y≈232) để thay được vật cũ trong `dien`.

const mix = (a, b, t) => { const h = (x) => [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16)); const A = h(a), B = h(b); return A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
const svg = (body, vb = "0 0 240 240") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
const lg = (id, stops, x2 = 0, y2 = 1, x1 = 0, y1 = 0) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="#${c}" stop-opacity="${a}"/>`).join("")}</linearGradient>`;
const rg = (id, stops, cx = 0.5, cy = 0.5, r = 0.5) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="#${c}" stop-opacity="${a}"/>`).join("")}</radialGradient>`;
const BLUR = (id, d) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${d}"/></filter>`;
const NHIEU = (id, a = 0.06) => `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="3" result="n"/><feColorMatrix in="n" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${a} 0" result="m"/><feComposite in="m" in2="SourceGraphic" operator="in"/></filter>`;
const bongDat = (cx, cy, rx, a = 0.35) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${(rx * 0.16).toFixed(1)}" fill="#1a1a1a" opacity="${a}" filter="url(#bd)"/>`;
const DA = { sang: "F3CDB0", giua: "E2AE8C", toi: "B97F5E" };

// ---------- NGƯỜI (tỉ lệ ~7,5 đầu) ----------
// ao: màu áo vest; quan: màu quần; tay: "dua" (đưa tay ra trước, cầm phong bì phí) | "xuoi" | "cam" (cầm hồ sơ trước ngực)
function nguoi(P, { ao = "2E4A62", quan = "3A3F48", toc = "2A211C", tay = "xuoi", lat = false, nu = false } = {}) {
  const aoS = mix(ao, "FFFFFF", 0.22), aoT = mix(ao, "000000", 0.35), qT = mix(quan, "000000", 0.35);
  const defs = `<defs>${lg("ao", [[0, aoS], [0.55, ao], [1, aoT]], 1, 0.3)}${lg("quan", [[0, mix(quan, "FFFFFF", 0.15)], [1, qT]], 1, 0.2)}${lg("da", [[0, DA.sang], [0.6, DA.giua], [1, DA.toi]], 1, 0.4)}
${lg("toc", [[0, mix(toc, "FFFFFF", 0.25)], [1, toc]], 0.8, 1)}${lg("giay", [[0, "4A3A30"], [1, "1A1410"]], 0, 1)}${BLUR("bd", 2.2)}${BLUR("mo", 1.2)}${NHIEU("vai", 0.09)}</defs>`;
  const cx = 120;
  let s = bongDat(cx + 4, 232, 34);
  // chân + giày (chân sau tối hơn)
  s += `<path d="M${cx - 15} 128 L${cx - 18} 222 L${cx - 5} 222 L${cx - 1} 140 Z" fill="#${qT}"/>`
    + `<path d="M${cx + 1} 128 L${cx + 2} 140 L${cx + 6} 222 L${cx + 19} 222 L${cx + 16} 128 Z" fill="url(#quan)"/>`
    + `<path d="M${cx - 2} 132 L${cx + 2} 222" stroke="#000" stroke-opacity=".12" stroke-width="1.2"/>`
    + `<path d="M${cx - 21} 222 Q${cx - 22} 230 ${cx - 12} 231 L${cx - 2} 231 Q${cx - 1} 225 ${cx - 5} 221Z" fill="url(#giay)"/>`
    + `<path d="M${cx + 4} 221 Q${cx + 3} 231 ${cx + 12} 231 L${cx + 25} 231 Q${cx + 26} 225 ${cx + 19} 221Z" fill="url(#giay)"/><path d="M${cx + 10} 224 q6 -2 12 0" stroke="#fff" stroke-opacity=".35" stroke-width="1.4" fill="none"/>`;
  // tay sau (bên trái người xem) — xuôi
  s += `<path d="M${cx - 26} 60 Q${cx - 36} 80 ${cx - 34} 118 L${cx - 25} 119 Q${cx - 25} 88 ${cx - 18} 70Z" fill="#${aoT}"/>`
    + `<ellipse cx="${cx - 30}" cy="${123}" rx="5.5" ry="7" fill="#${DA.giua}"/>`;
  // thân áo vest: vai, eo, vạt
  s += `<path d="M${cx - 27} 58 Q${cx - 20} 52 ${cx - 8} 51 L${cx + 8} 51 Q${cx + 21} 52 ${cx + 28} 59 L${cx + 24} 100 Q${cx + 22} 118 ${cx + 19} 132 L${cx - 19} 132 Q${cx - 22} 116 ${cx - 23} 100 Z" fill="url(#ao)"/>`
    + `<path d="M${cx - 27} 58 Q${cx - 20} 52 ${cx - 8} 51 L${cx + 8} 51 Q${cx + 21} 52 ${cx + 28} 59 L${cx + 24} 100 Q${cx + 22} 118 ${cx + 19} 132 L${cx - 19} 132 Q${cx - 22} 116 ${cx - 23} 100 Z" fill="#000" filter="url(#vai)"/>`
    // áo sơ mi + cà vạt / cổ áo nữ
    + `<path d="M${cx - 8} 51 L${cx} 74 L${cx + 8} 51 Z" fill="#F4F2EE"/><path d="M${cx - 8} 51 L${cx} 74 L${cx - 2} 51Z" fill="#D9D6D0"/>`
    + (nu ? "" : `<path d="M${cx - 2.5} 56 L${cx + 2.5} 56 L${cx + 4} 84 L${cx} 89 L${cx - 4} 84Z" fill="#${mix(P.acc || "0F5C55", "000000", 0.1)}"/><path d="M${cx - 2.5} 56 L${cx + 2.5} 56 L${cx} 61Z" fill="#000" opacity=".25"/>`)
    // ve áo
    + `<path d="M${cx - 9} 52 L${cx - 1} 80 L${cx - 6} 96 L${cx - 14} 64Z" fill="#${aoT}" opacity=".55"/><path d="M${cx + 9} 52 L${cx + 1} 80 L${cx + 6} 96 L${cx + 14} 64Z" fill="#${aoS}" opacity=".5"/>`
    // nút + nếp gấp + túi
    + `<circle cx="${cx + 2}" cy="102" r="1.8" fill="#${aoT}"/><circle cx="${cx + 2}" cy="114" r="1.8" fill="#${aoT}"/>`
    + `<path d="M${cx - 18} 108 q8 3 14 0 M${cx + 8} 108 q7 3 13 0" stroke="#000" stroke-opacity=".22" stroke-width="1.3" fill="none"/>`
    + `<path d="M${cx - 21} 92 q6 10 4 30" stroke="#000" stroke-opacity=".12" stroke-width="2" fill="none"/><path d="M${cx + 13} 66 l9 -2" stroke="#fff" stroke-opacity=".7" stroke-width="2.4"/>`;
  // tay trước
  if (tay === "dua") {
    s += `<path d="M${cx + 24} 60 Q${cx + 36} 70 ${cx + 38} 92 L${cx + 58} 98 L${cx + 56} 108 L${cx + 30} 104 Q${cx + 22} 88 ${cx + 18} 72Z" fill="url(#ao)"/>`
      + `<path d="M${cx + 54} 97 L${cx + 60} 96 L${cx + 60} 109 L${cx + 54} 109Z" fill="#F4F2EE"/>`
      + `<path d="M${cx + 59} 96 Q${cx + 70} 95 ${cx + 72} 101 Q${cx + 71} 108 ${cx + 60} 109Z" fill="url(#da)"/>`
      // phong bì phí (màu vàng nâu, có nắp)
      + `<g transform="rotate(-8 ${cx + 78} 96)"><rect x="${cx + 62}" y="82" width="34" height="22" rx="2" fill="#${mix(P.gold || "EFA23F", "FFFFFF", 0.35)}"/><path d="M${cx + 62} 82 L${cx + 79} 95 L${cx + 96} 82" fill="none" stroke="#${mix(P.gold || "EFA23F", "000000", 0.3)}" stroke-width="1.6"/><rect x="${cx + 62}" y="82" width="34" height="22" rx="2" fill="none" stroke="#000" stroke-opacity=".15"/></g>`
      + `<path d="M${cx + 64} 98 q4 -3 8 0" stroke="#${DA.toi}" stroke-width="1.6" fill="none"/>`;
  } else if (tay === "cam") {
    s += `<path d="M${cx + 24} 60 Q${cx + 34} 76 ${cx + 30} 96 L${cx + 4} 100 L${cx + 4} 90 L${cx + 20} 88 Q${cx + 22} 76 ${cx + 18} 70Z" fill="url(#ao)"/>`
      + `<rect x="${cx - 14}" y="78" width="26" height="34" rx="2" fill="#FBFAF6" stroke="#000" stroke-opacity=".18" transform="rotate(-6 ${cx} 95)"/><path d="M${cx - 9} 86 h16 M${cx - 9} 92 h16 M${cx - 9} 98 h10" stroke="#9AA" stroke-width="1.5" transform="rotate(-6 ${cx} 95)"/>`
      + `<ellipse cx="${cx + 4}" cy="95" rx="6" ry="5" fill="url(#da)"/>`;
  } else {
    s += `<path d="M${cx + 24} 59 Q${cx + 35} 80 ${cx + 33} 118 L${cx + 24} 119 Q${cx + 24} 88 ${cx + 18} 70Z" fill="url(#ao)"/><ellipse cx="${cx + 29}" cy="123" rx="5.5" ry="7" fill="url(#da)"/>`;
  }
  // cổ + đầu
  s += `<path d="M${cx - 6} 40 L${cx - 6} 52 Q${cx} 56 ${cx + 6} 52 L${cx + 6} 40Z" fill="#${DA.toi}"/>`
    + `<ellipse cx="${cx}" cy="29" rx="12.5" ry="15.5" fill="url(#da)"/>`
    + `<ellipse cx="${cx - 12}" cy="31" rx="2.6" ry="4" fill="#${DA.giua}"/><ellipse cx="${cx + 12.3}" cy="31" rx="2.6" ry="4" fill="#${DA.toi}"/>`
    // tóc
    + (nu ? `<path d="M${cx - 14} 30 Q${cx - 16} 10 ${cx} 11 Q${cx + 17} 11 ${cx + 15} 32 Q${cx + 17} 48 ${cx + 12} 56 L${cx + 9} 40 Q${cx + 11} 24 ${cx + 2} 19 Q${cx - 8} 23 ${cx - 12} 34 L${cx - 13} 52 Q${cx - 18} 44 ${cx - 14} 30Z" fill="url(#toc)"/>`
      : `<path d="M${cx - 13} 28 Q${cx - 15} 11 ${cx} 11 Q${cx + 15} 11 ${cx + 13.5} 27 Q${cx + 9} 18 ${cx - 1} 19 Q${cx - 8} 19 ${cx - 13} 28Z" fill="url(#toc)"/>`)
    + `<path d="M${cx - 6} 14 Q${cx + 1} 12 ${cx + 7} 15" stroke="#fff" stroke-opacity=".3" stroke-width="1.5" fill="none"/>`
    // mặt: mày, mắt, sống mũi, miệng, má tối phía phải
    + `<path d="M${cx - 8} 25.5 q3.5 -1.6 6 -.3 M${cx + 2.5} 25.2 q3 -1.3 6 .3" stroke="#${mix(toc, "FFFFFF", 0.1)}" stroke-width="1.4" fill="none" stroke-linecap="round"/>`
    + `<ellipse cx="${cx - 4.8}" cy="29.5" rx="1.5" ry="1.2" fill="#2a2420"/><ellipse cx="${cx + 5.2}" cy="29.5" rx="1.5" ry="1.2" fill="#2a2420"/>`
    + `<path d="M${cx + 0.5} 30 L${cx + 2} 36 L${cx - 0.5} 36.6" stroke="#${DA.toi}" stroke-width="1.1" fill="none"/>`
    + `<path d="M${cx - 3.5} 40.5 Q${cx} 42.3 ${cx + 3.8} 40.5" stroke="#9A5A48" stroke-width="1.3" fill="none" stroke-linecap="round"/>`
    + `<path d="M${cx + 6} 22 Q${cx + 13} 30 ${cx + 9} 41 Q${cx + 5} 44 ${cx + 2} 44.5 Q${cx + 10} 36 ${cx + 6} 22Z" fill="#000" opacity=".08"/>`;
  const body = lat ? `<g transform="translate(240 0) scale(-1 1)">${s}</g>` : s;
  return svg(defs + body);
}

// ---------- TOÀ DOANH NGHIỆP BẢO HIỂM: tháp kính góc 3/4, mặt trước sáng, mặt bên tối, phản chiếu trời ----------
function toaDnbh(P) {
  const acc = P.acc || "0F5C55", gold = P.gold || "EFA23F";
  const defs = `<defs>${lg("kinhT", [[0, "CFE3EA"], [0.45, "8FB4C2"], [1, "4E7383"]], 0.25, 1)}${lg("kinhB", [[0, "7E9FAE"], [1, "35505C"]], 0, 1)}
${lg("phan", [[0, "FFFFFF", 0], [0.5, "FFFFFF", 0.45], [1, "FFFFFF", 0]], 1, 0.6, 0, 0.4)}${lg("vien", [[0, mix(acc, "FFFFFF", 0.25)], [1, mix(acc, "000000", 0.25)]], 1, 0)}
${lg("sanh", [[0, "F7E7C4"], [1, "D6B27A"]], 0, 1)}${BLUR("bd", 2.5)}${BLUR("mo", 1.5)}</defs>`;
  const X0 = 74, X1 = 148, X2 = 176, T = 24, Ts = 32, B = 214;
  let s = bongDat(128, 230, 74, 0.3);
  // mặt bên (phối cảnh: đỉnh hạ xuống)
  s += `<path d="M${X1} ${T} L${X2} ${Ts} L${X2} ${B} L${X1} ${B}Z" fill="url(#kinhB)"/>`;
  for (let y = Ts + 10; y < B - 30; y += 12) s += `<path d="M${X1} ${y - 3} L${X2} ${y + 1}" stroke="#1E323B" stroke-opacity=".5" stroke-width="1"/>`;
  // mặt trước: kính phản chiếu trời + lưới đố + vài ô sáng đèn
  s += `<rect x="${X0}" y="${T}" width="${X1 - X0}" height="${B - T}" fill="url(#kinhT)"/>`;
  for (let x = X0 + 12; x < X1; x += 12.3) s += `<line x1="${x}" y1="${T}" x2="${x}" y2="${B - 30}" stroke="#2C4652" stroke-opacity=".45" stroke-width="1"/>`;
  for (let y = T + 12; y < B - 30; y += 12) s += `<line x1="${X0}" y1="${y}" x2="${X1}" y2="${y}" stroke="#2C4652" stroke-opacity=".55" stroke-width="1.2"/>`;
  [[1, 3], [4, 5], [2, 9], [5, 10], [0, 12], [3, 13]].forEach(([c, r]) => { s += `<rect x="${X0 + 1 + c * 12.3}" y="${T + 1 + r * 12}" width="11" height="10.5" fill="#FFE0A3" opacity=".85"/>`; });
  s += `<path d="M${X0} ${T + 40} L${X0 + 30} ${T} L${X0 + 52} ${T} L${X0} ${T + 76}Z" fill="url(#phan)"/><path d="M${X0 + 20} ${B - 30} L${X1} ${T + 70} L${X1} ${T + 92} L${X0 + 44} ${B - 30}Z" fill="url(#phan)" opacity=".6"/>`;
  // khung viền + đỉnh + biểu tượng khiên
  s += `<rect x="${X0 - 3}" y="${T - 8}" width="${X1 - X0 + 6}" height="10" fill="url(#vien)"/><path d="M${X1 + 3} ${T - 8} L${X2 + 2} ${Ts - 6} L${X2 + 2} ${Ts + 2} L${X1 + 3} ${T + 2}Z" fill="#${mix(acc, "000000", 0.45)}"/>`
    + `<rect x="${X0 + 22}" y="${T - 22}" width="30" height="14" fill="#${mix(acc, "000000", 0.2)}"/><line x1="${X0 + 60}" y1="${T - 8}" x2="${X0 + 60}" y2="${T - 34}" stroke="#555" stroke-width="2"/><circle cx="${X0 + 60}" cy="${T - 35}" r="2.2" fill="#E04B3A"/>`
    + `<path d="M${(X0 + X1) / 2} ${T + 8} l12 4 v9 q0 10 -12 15 q-12 -5 -12 -15 v-9Z" fill="#${gold}" stroke="#fff" stroke-width="1.6"/><path d="M${(X0 + X1) / 2 - 5} ${T + 21} l4 4 l7 -8" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
  // sảnh: kính sáng ấm, mái hiên, cửa, bậc, cây
  s += `<rect x="${X0}" y="${B - 30}" width="${X1 - X0}" height="30" fill="url(#sanh)"/><path d="M${X1} ${B - 30} L${X2} ${B - 28} L${X2} ${B} L${X1} ${B}Z" fill="#8C7550"/>`
    + `<rect x="${X0 - 6}" y="${B - 34}" width="${X1 - X0 + 12}" height="6" fill="url(#vien)"/>`
    + `<rect x="${(X0 + X1) / 2 - 12}" y="${B - 25}" width="24" height="25" fill="#3D5560"/><line x1="${(X0 + X1) / 2}" y1="${B - 25}" x2="${(X0 + X1) / 2}" y2="${B}" stroke="#AFC6CE" stroke-width="1"/>`
    + [X0 + 8, X0 + 50].map((x) => `<line x1="${x}" y1="${B - 28}" x2="${x}" y2="${B}" stroke="#A88A5A" stroke-width="1"/>`).join("")
    + `<rect x="${X0 - 10}" y="${B}" width="${X2 - X0 + 22}" height="5" fill="#B9B3A8"/><rect x="${X0 - 14}" y="${B + 5}" width="${X2 - X0 + 30}" height="5" fill="#A29C91"/>`
    + [X0 - 8, X1 + 18].map((x) => `<rect x="${x - 6}" y="${B - 6}" width="12" height="10" fill="#7A6A58"/><circle cx="${x}" cy="${B - 14}" r="10" fill="#4F7A52"/><circle cx="${x - 3}" cy="${B - 18}" r="5" fill="#7FA77A"/>`).join("");
  return svg(defs + s);
}

// ---------- NHÀ ĐANG CHÁY (góc 3/4): ngói, tường vữa, kính, lửa có quầng sáng, khói ----------
function nhaChay(P, chay = true) {
  const defs = `<defs>${lg("tuongT", [[0, "F5EBDD"], [1, "E3D2BC"]], 0, 1)}${lg("tuongB", [[0, "D8C3A6"], [1, "B79F80"]], 0, 1)}${lg("ngoi", [[0, "C2603A"], [1, "8E3B22"]], 0.3, 1)}
${lg("ngoiB", [[0, "A54A2C"], [1, "6E2C18"]], 0, 1)}${lg("kinh", [[0, "D9EEF2"], [1, "7FA1AC"]], 0.4, 1)}${lg("lua1", [[0, "FFF3B0"], [0.35, "FFC43D"], [0.75, "F2711C"], [1, "C2341A", 0.9]], 0, 0, 0, 1)}
${rg("quang", [[0, "FFB347", 0.75], [1, "FF7A1A", 0]])}${rg("khoi", [[0, "5E5A56", 0.9], [1, "5E5A56", 0]])}${BLUR("bd", 2.5)}${BLUR("lua", 1.1)}${BLUR("q", 9)}${BLUR("k", 6)}${NHIEU("vua", 0.07)}</defs>`;
  let s = bongDat(118, 228, 96, 0.3);
  if (chay) s += `<ellipse cx="164" cy="86" rx="66" ry="60" fill="url(#quang)" filter="url(#q)"/>`;
  // tường bên (phải, tối) + tường trước (đầu hồi)
  s += `<path d="M118 120 L206 104 L206 202 L118 214Z" fill="url(#tuongB)"/><path d="M118 120 L206 104 L206 202 L118 214Z" fill="#000" filter="url(#vua)"/>`
    + `<path d="M34 120 L76 74 L118 120 L118 214 L34 214Z" fill="url(#tuongT)"/><path d="M34 120 L76 74 L118 120 L118 214 L34 214Z" fill="#000" filter="url(#vua)"/>`;
  // mái: mặt nghiêng về phía người xem (ngói) + gờ đầu hồi
  s += `<path d="M76 70 L164 56 L212 106 L120 122Z" fill="url(#ngoi)"/>`;
  for (let k = 1; k < 7; k++) { const t = k / 7; s += `<path d="M${76 + 44 * t} ${70 + 52 * t} L${164 + 48 * t} ${56 + 50 * t}" stroke="#6E2C18" stroke-opacity=".55" stroke-width="1.4"/>`; }
  for (let k = 1; k < 10; k++) { const t = k / 10; s += `<path d="M${76 + 88 * t} ${70 - 14 * t} L${120 + 92 * t} ${122 - 16 * t}" stroke="#E0896A" stroke-opacity=".25" stroke-width="1"/>`; }
  s += `<path d="M30 122 L76 70 L122 124" fill="none" stroke="#5C2414" stroke-width="7" stroke-linejoin="round"/><path d="M30 122 L76 70 L122 124" fill="none" stroke="#B4553A" stroke-width="3" stroke-linejoin="round"/>`
    + `<rect x="170" y="44" width="16" height="40" fill="#9C5A44"/><rect x="168" y="40" width="20" height="6" fill="#6B3A2A"/>`;
  // cửa sổ tường trước + cửa đi + bậc; cửa sổ tường bên
  const cuaSo = (x, y, w, h) => `<rect x="${x - 3}" y="${y - 3}" width="${w + 6}" height="${h + 6}" fill="#F7F2EA"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#kinh)"/><line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" stroke="#F7F2EA" stroke-width="2"/><line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" stroke="#F7F2EA" stroke-width="2"/><path d="M${x + 2} ${y + h - 4} L${x + w * 0.6} ${y + 2}" stroke="#fff" stroke-opacity=".5" stroke-width="3"/><rect x="${x - 5}" y="${y + h + 3}" width="${w + 10}" height="4" fill="#C9B79C"/>`;
  s += cuaSo(48, 136, 24, 26) + `<rect x="84" y="150" width="24" height="64" fill="#3E5A4F"/><rect x="86" y="152" width="20" height="28" fill="#4E6E62"/><circle cx="102" cy="184" r="2" fill="#E6C27A"/><rect x="80" y="212" width="32" height="5" fill="#B5AA98"/>`;
  s += `<path d="M140 134 L168 129 L168 160 L140 165Z" fill="${chay ? "#FFB347" : "url(#kinh)"}"/><path d="M178 127 L198 123 L198 154 L178 158Z" fill="url(#kinh)" opacity=".8"/>`;
  // cây bụi
  s += `<circle cx="38" cy="208" r="12" fill="#4C7550"/><circle cx="48" cy="212" r="9" fill="#6E9A6A"/><circle cx="196" cy="204" r="11" fill="#4C7550"/>`;
  if (chay) {
    // lửa trùm góc mái + lửa trong cửa sổ bên + tường ám khói + khói bốc
    s += `<path d="M140 134 L168 129 L168 110 Q160 118 150 122 Q144 126 140 134Z" fill="#3B2A22" opacity=".45" filter="url(#lua)"/>`
      + `<g transform="translate(-62 -2) scale(1.32)">` + `<circle cx="190" cy="46" r="22" fill="url(#khoi)" filter="url(#k)"/><circle cx="170" cy="36" r="18" fill="url(#khoi)" filter="url(#k)"/><circle cx="200" cy="30" r="14" fill="url(#khoi)" filter="url(#k)"/>`
      + `<path d="M150 96 Q146 70 160 58 Q158 74 170 68 Q166 50 182 38 Q182 58 194 62 Q200 52 198 44 Q214 62 206 98 Q190 108 172 104 Q160 104 150 96Z" fill="url(#lua1)" filter="url(#lua)"/>`
      + `<path d="M164 96 Q162 80 172 74 Q172 86 180 84 Q180 70 190 62 Q196 82 192 98Z" fill="#FFF0A0" opacity=".9" filter="url(#lua)"/>`
      + `</g><path d="M142 160 Q140 146 148 140 Q148 150 154 148 Q154 138 162 132 Q168 148 164 162Z" fill="url(#lua1)" filter="url(#lua)"/>`;
  }
  return svg(defs + s);
}

// ---------- CHỒNG XU: kim loại vàng, mép khía, phản quang ----------
function chongXu(P, n = 5) {
  const defs = `<defs>${lg("mat", [[0, "FFE69A"], [0.5, "F2B544"], [1, "C98A1E"]], 1, 1)}${lg("mep", [[0, "D99A2B"], [0.5, "F7C95E"], [1, "A86F14"]], 1, 0)}${BLUR("bd", 2.2)}</defs>`;
  let s = bongDat(120, 214, 64, 0.35);
  for (let k = 0; k < n; k++) { const y = 200 - k * 16, dx = (k % 2 ? 3 : -2);
    s += `<path d="M${64 + dx} ${y} v12 a56 18 0 0 0 112 0 v-12Z" fill="url(#mep)"/>` + Array.from({ length: 22 }, (_, i) => `<line x1="${68 + dx + i * 4.9}" y1="${y + 4 + Math.sin((i / 21) * Math.PI) * 14}" x2="${68 + dx + i * 4.9}" y2="${y + 12 + Math.sin((i / 21) * Math.PI) * 14}" stroke="#8A5A10" stroke-opacity=".35" stroke-width="1"/>`).join("")
      + `<ellipse cx="${120 + dx}" cy="${y}" rx="56" ry="18" fill="url(#mat)"/><ellipse cx="${120 + dx}" cy="${y}" rx="42" ry="12.5" fill="none" stroke="#C98A1E" stroke-width="2"/><path d="M${84 + dx} ${y - 8} Q${110 + dx} ${y - 16} ${140 + dx} ${y - 13}" stroke="#fff" stroke-opacity=".7" stroke-width="3" fill="none" stroke-linecap="round"/>`; }
  return svg(defs + s);
}

// ---------- PHÔNG THÀNH PHỐ BÁN TẢ THỰC (2400 × 1080) ----------
// trời gradient + mặt trời + mây mềm · 3 lớp phố xa→gần (càng xa càng nhạt, lẫn sương) · hàng cây · vỉa hè + lòng đường phối cảnh
function phong(P, gio = "sang") {
  const W = 2400, H = 1080, R = ((seed) => () => ((seed = (seed * 9301 + 49297) % 233280) / 233280))(17);
  const TROI = { sang: ["A9CFE2", "E6F0EC", "FBEBD3"], chieu: ["9FC1D8", "F3DFC4", "FAD3A8"] }[gio] || ["A9CFE2", "E6F0EC", "FBEBD3"];
  const defs = `<defs>${lg("troi", [[0, TROI[0]], [0.62, TROI[1]], [1, TROI[2]]])}${rg("mt", [[0, "FFF6DC", 0.95], [0.3, "FFE7B0", 0.5], [1, "FFE7B0", 0]])}
${lg("suong", [[0, "F4EEE3", 0], [1, "F4EEE3", 0.85]])}${lg("duong", [[0, "8C918F"], [1, "5F6563"]])}${lg("he", [[0, "D8D2C6"], [1, "BDB6A8"]])}${lg("co", [[0, "8DB07C"], [1, "5E8A55"]])}
${BLUR("may", 14)}${BLUR("xa", 1.5)}${BLUR("bd", 3)}${NHIEU("hat", 0.05)}</defs>`;
  let s = `<rect width="${W}" height="${H}" fill="url(#troi)"/><circle cx="1880" cy="250" r="260" fill="url(#mt)"/>`;
  // mây mềm
  [[300, 160, 1], [820, 110, 0.8], [1450, 200, 1.1], [2100, 130, 0.9]].forEach(([x, y, k]) => { s += `<g filter="url(#may)" opacity=".85">` + [[-80, 10, 90], [0, -10, 110], [90, 12, 85], [30, 25, 120]].map(([dx, dy, r]) => `<ellipse cx="${x + dx * k}" cy="${y + dy * k}" rx="${r * k}" ry="${r * 0.42 * k}" fill="#FFFFFF"/>`).join("") + `</g>`; });
  // 3 lớp nhà: xa (nhạt, mờ) → gần (đậm, có cửa sổ, có mặt bên)
  const lop = (y0, hMin, hMax, wMin, wMax, mau, chiTiet, mo) => { let x = -40, g = ""; while (x < W) { const w = wMin + R() * (wMax - wMin), h = hMin + R() * (hMax - hMin), top = y0 - h, c = mix(mau, "FFFFFF", R() * 0.12);
      g += `<rect x="${x.toFixed(0)}" y="${top.toFixed(0)}" width="${w.toFixed(0)}" height="${(h + 4).toFixed(0)}" fill="#${c}"/>`;
      if (chiTiet) { g += `<rect x="${(x + w - w * 0.18).toFixed(0)}" y="${top.toFixed(0)}" width="${(w * 0.18).toFixed(0)}" height="${h.toFixed(0)}" fill="#000" opacity=".12"/><rect x="${x.toFixed(0)}" y="${(top - 6).toFixed(0)}" width="${w.toFixed(0)}" height="6" fill="#${mix(c, "000000", 0.15)}"/>`;
        for (let yy = top + 16; yy < y0 - 14; yy += 22) for (let xx = x + 10; xx < x + w * 0.8 - 12; xx += 20) g += `<rect x="${xx.toFixed(0)}" y="${yy.toFixed(0)}" width="11" height="13" fill="#${R() < 0.12 ? "FFE2A6" : mix(c, "28404A", 0.35)}" opacity=".85"/>`; }
      x += w + (chiTiet ? 6 + R() * 18 : 0); }
    return `<g ${mo ? `filter="url(#xa)"` : ""}>${g}</g>`; };
  s += lop(720, 120, 300, 70, 150, mix("9DB3BE", TROI[1], 0.35), false, true) + `<rect y="380" width="${W}" height="360" fill="url(#suong)" opacity=".55"/>`;
  s += lop(745, 90, 230, 90, 170, "A9B8BB", true, false) + `<rect y="560" width="${W}" height="200" fill="url(#suong)" opacity=".45"/>`;
  // hàng cây + cột đèn ở mép vỉa hè
  for (let x = 40; x < W; x += 210 + R() * 60) { const r = 46 + R() * 22;
    s += `<rect x="${x - 5}" y="${(770 - r * 0.4).toFixed(0)}" width="10" height="${(r * 0.4 + 30).toFixed(0)}" fill="#6B5644"/><circle cx="${x}" cy="${(752 - r).toFixed(0)}" r="${r.toFixed(0)}" fill="#5D8656"/><circle cx="${(x - r * 0.3).toFixed(0)}" cy="${(744 - r * 1.25).toFixed(0)}" r="${(r * 0.55).toFixed(0)}" fill="#7EA670"/><circle cx="${(x + r * 0.35).toFixed(0)}" cy="${(760 - r * 0.8).toFixed(0)}" r="${(r * 0.5).toFixed(0)}" fill="#4A7246"/>`; }
  // vỉa hè + lòng đường (phối cảnh: vạch kẻ hội tụ)
  s += `<rect y="780" width="${W}" height="70" fill="url(#he)"/><rect y="778" width="${W}" height="6" fill="#ECE6DA"/>` + Array.from({ length: 30 }, (_, i) => `<line x1="${i * 84}" y1="784" x2="${i * 84 - 14}" y2="850" stroke="#A89F90" stroke-width="2"/>`).join("")
    + `<rect y="850" width="${W}" height="${H - 850}" fill="url(#duong)"/><rect y="850" width="${W}" height="8" fill="#4C514F"/>`
    + Array.from({ length: 16 }, (_, i) => `<rect x="${i * 160 + 30}" y="960" width="90" height="10" rx="3" fill="#E8E2D2" opacity=".75"/>`).join("");
  s += `<rect width="${W}" height="${H}" fill="#000" filter="url(#hat)"/>`;
  return svg(defs + s, `0 0 ${W} ${H}`);
}

const VE = {
  "thuc-nguoi-mua": (P) => nguoi(P, { tay: "dua", ao: "2E4A62" }),
  "thuc-nguoi": (P) => nguoi(P, { ao: "2E4A62" }),
  "thuc-nguoi-nu": (P) => nguoi(P, { ao: "7A3B3B", nu: true, toc: "3A2418" }),
  "thuc-nhan-vien": (P) => nguoi(P, { tay: "cam", ao: mix(P.acc || "0F5C55", "000000", 0.1), quan: "2C3034" }),
  "thuc-toa-dnbh": toaDnbh,
  "thuc-nha-chay": (P) => nhaChay(P, true),
  "thuc-nha": (P) => nhaChay(P, false),
  "thuc-xu": chongXu,
};
module.exports = { VE, phong };
