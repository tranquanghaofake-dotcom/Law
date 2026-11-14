// BIỂU ĐỒ CÁCH ĐIỆU (11/2026): số liệu mang hình của chính vật trong câu chuyện, vẽ đúng tỉ lệ — không phải cột / tròn chung chung đặt cạnh tranh minh hoạ.
// Mỗi kiểu (d, P, w, h) → { svg (khung w×h), nhan: [{ x, y, t, cls }] } — nhãn số là CHỮ THẬT (dung.js đặt thành hộp chữ, sửa được trong PowerPoint).
// Phong cách như hinh/ve_bh.js: mảng phẳng + gradient nhẹ, mặt tối bên phải, bóng mềm. Quy ước dùng: references/dung-canh.md mục "Biểu đồ cách điệu".
const mix = (a, b, t) => { const h = (x) => [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16)); const A = h(a), B = h(b); return A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
const f1 = (v) => (+v).toFixed(1);
const MAU = (P) => [P.acc, P.gold, mix(P.acc, "FFFFFF", 0.4), "E07A5F", mix(P.ink, "FFFFFF", 0.35)];
const bong = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * 0.07}" fill="#000" opacity=".16"/>`;

const KIEU = {
  // TÁN Ô = BIỂU ĐỒ TRÒN: tán nửa vòng chia theo tỉ lệ (góc ∝ giá trị), mép tán răng cưa; nhãn % ở giữa từng múi, tên ở dưới
  "o-ty-le": (d, P, w, h) => {
    const ph = d.phan || [], tong = ph.reduce((a, x) => a + (+x.v || 0), 0) || 1, cx = w / 2, cy = h * 0.58, R = Math.min(w * 0.46, h * 0.52);
    let a0 = Math.PI, svg = "", nhan = []; const M = MAU(P);
    ph.forEach((x, k) => { const a1 = a0 + Math.PI * (x.v / tong), p = (a) => [cx + R * Math.cos(a), cy + R * Math.sin(a)];
      const [x0, y0] = p(a0), [x1, y1] = p(a1), am = (a0 + a1) / 2, mau = x.mau || M[k % M.length];
      svg += `<path d="M${f1(cx)} ${f1(cy)} L${f1(x0)} ${f1(y0)} A${f1(R)} ${f1(R)} 0 0 1 ${f1(x1)} ${f1(y1)}Z" fill="#${mau}"/><path d="M${f1(cx)} ${f1(cy)} L${f1(x0)} ${f1(y0)} A${f1(R)} ${f1(R)} 0 0 1 ${f1(x1)} ${f1(y1)}Z" fill="url(#oSang)"/>`;
      // mép tán: các vòm nhỏ giữa hai nan
      const n = Math.max(2, Math.round(10 * (x.v / tong))); for (let j = 0; j < n; j++) { const b0 = a0 + ((a1 - a0) * j) / n, b1 = a0 + ((a1 - a0) * (j + 1)) / n, [u0, v0] = p(b0), [u1, v1] = p(b1), bm = (b0 + b1) / 2;
        svg += `<path d="M${f1(u0)} ${f1(v0)} Q${f1(cx + R * 0.9 * Math.cos(bm))} ${f1(cy + R * 0.9 * Math.sin(bm))} ${f1(u1)} ${f1(v1)} L${f1(cx + R * 1.02 * Math.cos(bm))} ${f1(cy + R * 1.02 * Math.sin(bm))}Z" fill="#${mix(mau, "000000", 0.2)}"/>`; }
      svg += `<line x1="${f1(cx)}" y1="${f1(cy)}" x2="${f1(x1)}" y2="${f1(y1)}" stroke="#fff" stroke-width="5" stroke-opacity=".7"/>`;
      nhan.push({ x: cx + R * 0.58 * Math.cos(am), y: cy + R * 0.58 * Math.sin(am) - 30, t: `${x.v}%`, cls: "so-lon trang" });
      nhan.push({ x: cx + (k ? 1 : -1) * R * 0.55, y: cy + R * 0.18 + 40, t: x.t, cls: "ten" });
      a0 = a1; });
    svg = `<defs><radialGradient id="oSang" cx=".35" cy=".25" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></radialGradient></defs>`
      + bong(cx, h * 0.97, R * 0.7) + svg + `<line x1="${f1(cx)}" y1="${f1(cy - R - 26)}" x2="${f1(cx)}" y2="${f1(cy - R)}" stroke="#${P.ink}" stroke-width="12" stroke-linecap="round"/>`
      + `<path d="M${f1(cx)} ${f1(cy)} V${f1(h * 0.9)} Q${f1(cx)} ${f1(h * 0.97)} ${f1(cx - 34)} ${f1(h * 0.97)} Q${f1(cx - 60)} ${f1(h * 0.97)} ${f1(cx - 60)} ${f1(h * 0.92)}" fill="none" stroke="#${P.ink}" stroke-width="12" stroke-linecap="round"/>`;
    return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${svg}</svg>`, nhan };
  },

  // THÁP XẾP TẦNG = BIỂU ĐỒ CHỒNG: mỗi tầng một đơn vị ("lần" / line); nhóm tầng cùng màu; ngoặc + nhãn bên phải mỗi nhóm
  "thap-tang": (d, P, w, h) => {
    const nh = d.nhom || [], tong = nh.reduce((a, x) => a + (+x.n || 0), 0) || 1, day = h - 40, H = day - 30, t = H / tong, bw = Math.min(w * 0.36, 300), x0 = w * 0.08;
    let y = day, svg = bong(x0 + bw / 2, day + 8, bw * 0.75), nhan = []; const M = [P.ink, P.acc, P.gold, mix(P.acc, "FFFFFF", 0.4)];
    nh.forEach((g, k) => { const mau = g.mau || M[k % M.length], y1 = y - g.n * t;
      for (let j = 0; j < g.n; j++) { const yy = y - (j + 1) * t; svg += `<rect x="${x0}" y="${f1(yy)}" width="${bw}" height="${f1(t - 2)}" rx="2" fill="#${mix(mau, "FFFFFF", j % 2 ? 0.08 : 0)}"/><rect x="${x0 + bw * 0.76}" y="${f1(yy)}" width="${bw * 0.24}" height="${f1(t - 2)}" fill="#000" opacity=".14"/>`;
        if (t > 9) for (let c = 0; c < 4; c++) svg += `<rect x="${f1(x0 + 12 + c * bw * 0.17)}" y="${f1(yy + t * 0.25)}" width="${f1(bw * 0.1)}" height="${f1(Math.max(2, t * 0.4))}" fill="#FFE3A0" opacity=".85"/>`; }
      const xb = x0 + bw + 24; svg += `<path d="M${xb} ${f1(y - 3)} h18 V${f1(y1 + 3)} h-18" fill="none" stroke="#${mau}" stroke-width="5"/>`;
      nhan.push({ x: xb + 40, y: (y + y1) / 2 - 34, t: g.t, b: g.b, cls: "trai " + (k === 0 ? "nho" : "") });
      y = y1; });
    svg += `<path d="M${x0 - 10} ${f1(y)} L${x0 + bw / 2} ${f1(y - 34)} L${x0 + bw + 10} ${f1(y)}Z" fill="#${P.gold}"/><rect x="${x0 - 20}" y="${day}" width="${bw + 40}" height="12" rx="6" fill="#${P.ink}"/>`;
    return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${svg}</svg>`, nhan };
  },

  // NHÀ + KHIÊN = SO HAI ĐẠI LƯỢNG: chiều cao nhà = giá trị BH (GTBH), chiều cao khiên = số tiền BH (STBH); nhiều khiên chồng = BH trùng.
  // Thang chung cho mọi cặp: khiên cao nhất vừa khung → so được bằng mắt giữa các trường hợp
  "nha-khien": (d, P, w, h) => {
    const ca = d.ca || [], cw = w / ca.length, day = h - 70, tyMax = Math.max(1, ...ca.map((c) => +c.ty || 1)), gt = (day - 30) / tyMax; let svg = "", nhan = [];
    const khien = (cx, y0, hh, mau) => { const ww = Math.min(hh * 0.82, cw * 0.36);
      return `<path d="M${f1(cx)} ${f1(y0)} L${f1(cx + ww / 2)} ${f1(y0 + hh * 0.1)} V${f1(y0 + hh * 0.5)} Q${f1(cx + ww / 2)} ${f1(y0 + hh * 0.85)} ${f1(cx)} ${f1(y0 + hh)} Q${f1(cx - ww / 2)} ${f1(y0 + hh * 0.85)} ${f1(cx - ww / 2)} ${f1(y0 + hh * 0.5)} V${f1(y0 + hh * 0.1)}Z" fill="#${mau}" stroke="#fff" stroke-width="4"/>`
        + `<path d="M${f1(cx)} ${f1(y0)} L${f1(cx + ww / 2)} ${f1(y0 + hh * 0.1)} V${f1(y0 + hh * 0.5)} Q${f1(cx + ww / 2)} ${f1(y0 + hh * 0.85)} ${f1(cx)} ${f1(y0 + hh)}Z" fill="#000" opacity=".12"/>`; };
    ca.forEach((c, k) => { const cx = cw * k + cw / 2, hn = gt, bw = Math.min(cw * 0.4, hn * 0.9), xL = cx - bw - 6;
      svg += bong(cx, day + 6, cw * 0.4);
      svg += `<rect x="${f1(xL)}" y="${f1(day - hn)}" width="${f1(bw)}" height="${f1(hn)}" fill="#FBF3E4"/><rect x="${f1(xL + bw * 0.7)}" y="${f1(day - hn)}" width="${f1(bw * 0.3)}" height="${f1(hn)}" fill="#000" opacity=".07"/>`
        + `<path d="M${f1(xL - 10)} ${f1(day - hn)} L${f1(xL + bw / 2)} ${f1(day - hn - bw * 0.42)} L${f1(xL + bw + 10)} ${f1(day - hn)}Z" fill="#C8653A"/>`
        + `<rect x="${f1(xL + bw * 0.38)}" y="${f1(day - hn * 0.32)}" width="${f1(bw * 0.24)}" height="${f1(hn * 0.32)}" fill="#${P.acc}"/>`
        + `<line x1="${f1(cx - cw * 0.46)}" y1="${f1(day - hn)}" x2="${f1(cx + cw * 0.46)}" y2="${f1(day - hn)}" stroke="#${P.ink}" stroke-width="3" stroke-dasharray="10 8" opacity=".55"/>`;
      const sx = cx + cw * 0.17;
      if (c.kieu === "trung") { const n = c.so || 3, hh = (gt * (c.ty || 2)) / n; for (let j = 0; j < n; j++) svg += khien(sx, day - (j + 1) * hh, hh - 6, j % 2 ? mix(P.acc, "FFFFFF", 0.3) : P.acc); }
      else { const hh = gt * (c.ty || 1); svg += khien(sx, day - hh, hh, (c.ty || 1) > 1 ? P.gold : P.acc); }
      nhan.push({ x: cx, y: day + 14, t: c.t, b: c.b, cls: "ten" }); });
    if (d.chuGiai) nhan.push({ x: w - 10, y: 0, t: d.chuGiai, cls: "chu-giai" });
    return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${svg}</svg>`, nhan };
  },
};
const coKieu = (k) => Object.prototype.hasOwnProperty.call(KIEU, k);
module.exports = { KIEU, coKieu };
