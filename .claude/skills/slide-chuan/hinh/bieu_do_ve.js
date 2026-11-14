// BIỂU ĐỒ CÁCH ĐIỆU (11/2026): số liệu mang hình của chính vật trong câu chuyện, vẽ ĐÚNG TỈ LỆ — không phải cột / tròn chung chung đặt cạnh tranh.
// Mỗi kiểu (d, P, w, h) → { svg (khung w×h), nhan: [{ x, y, t, b, cls }] } — nhãn là CHỮ THẬT (dung.js đặt thành hộp chữ sửa được trong PowerPoint).
// Phong cách như hinh/ve_bh.js: mảng phẳng + gradient (sáng trên trái), mặt tối bên phải, viền sáng, bóng mềm. Quy ước: references/dung-canh.md.
const VEBH = require("./ve_bh");
const mix = (a, b, t) => { const h = (x) => [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16)); const A = h(a), B = h(b); return A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
const f1 = (v) => (+v).toFixed(1);
const rnd = (seed) => () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
const bong = (cx, cy, rx) => `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(rx * 0.07)}" fill="#000" opacity=".16"/>`;
// đặt một vật tự vẽ (ve_bh.js) vào khung (x, y, cỡ)
const vat = (ten, P, x, y, s) => `<svg x="${f1(x)}" y="${f1(y)}" width="${f1(s)}" height="${f1(s)}" viewBox="0 0 240 240">${VEBH.veSvg(ten, P).replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")}</svg>`;
const DEFS = (P) => `<defs><linearGradient id="bdS" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>
<linearGradient id="bdL" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#${P.bad}"/><stop offset=".6" stop-color="#F07A2B"/><stop offset="1" stop-color="#FFC861"/></linearGradient>
<linearGradient id="bdN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#${mix(P.acc, "FFFFFF", 0.55)}"/><stop offset="1" stop-color="#${mix(P.acc, "FFFFFF", 0.2)}"/></linearGradient></defs>`;
const khungSvg = (w, h, P, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${DEFS(P)}${body}</svg>`;
const doc = (v) => Number(v).toLocaleString("vi-VN");

const KIEU = {
  // TÁN Ô = BIỂU ĐỒ TRÒN: góc của mỗi múi ∝ %, nan ô từ tâm, chóp, mép tán vòm; dưới mỗi múi là bên gánh phần đó (vat); mưa chỉ rơi ngoài tán
  "o-ty-le": (d, P, w, h) => {
    const ph = d.phan || [], tong = ph.reduce((a, x) => a + (+x.v || 0), 0) || 1, cx = w / 2, cy = h * 0.5, R = Math.min(w * 0.44, h * 0.46), M = [P.acc, P.gold, mix(P.acc, "FFFFFF", 0.4)];
    const R0 = rnd(5); let s = "", nhan = [], a0 = Math.PI;
    for (let i = 0; i < 26; i++) { const x = R0() * w, y = R0() * h * 0.62; if (Math.abs(x - cx) < R * 1.08 && y > cy - R * 1.05) continue; /* dưới và trong tán: không mưa */ s += `<path d="M${f1(x)} ${f1(y)} l-8 22" stroke="#${mix(P.acc, "FFFFFF", 0.45)}" stroke-width="5" stroke-linecap="round" opacity=".7"/>`; }
    s += bong(cx, h - 18, R * 0.85);
    const p = (a, r = R) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    ph.forEach((x, k) => { const a1 = a0 + Math.PI * (x.v / tong), mau = x.mau || M[k % M.length], [x0, y0] = p(a0), [x1, y1] = p(a1), lon = a1 - a0 > Math.PI ? 1 : 0, T = 900 + k * 700;
      s += `<!--L:grow:${T}--><path d="M${f1(cx)} ${f1(cy)} L${f1(x0)} ${f1(y0)} A${f1(R)} ${f1(R)} 0 ${lon} 1 ${f1(x1)} ${f1(y1)}Z" fill="#${mau}"/><path d="M${f1(cx)} ${f1(cy)} L${f1(x0)} ${f1(y0)} A${f1(R)} ${f1(R)} 0 ${lon} 1 ${f1(x1)} ${f1(y1)}Z" fill="url(#bdS)"/>`;
      const n = Math.max(2, Math.round(9 * (x.v / tong)));
      for (let j = 0; j < n; j++) { const b0 = a0 + ((a1 - a0) * j) / n, b1 = a0 + ((a1 - a0) * (j + 1)) / n, bm = (b0 + b1) / 2, [u0, v0] = p(b0), [u1, v1] = p(b1), [q0, q1] = p(bm, R * 0.86);
        s += `<path d="M${f1(u0)} ${f1(v0)} Q${f1(q0)} ${f1(q1)} ${f1(u1)} ${f1(v1)} Z" fill="#${mix(mau, "000000", 0.22)}"/>`;
        if (j) s += `<line x1="${f1(cx)}" y1="${f1(cy)}" x2="${f1(u0)}" y2="${f1(v0)}" stroke="#${mix(mau, "FFFFFF", 0.35)}" stroke-width="2.5" opacity=".7"/>`; }
      s += `<line x1="${f1(cx)}" y1="${f1(cy)}" x2="${f1(x1)}" y2="${f1(y1)}" stroke="#fff" stroke-width="6"/>`;
      const am = (a0 + a1) / 2; nhan.push({ x: cx + R * 0.56 * Math.cos(am), y: cy + R * 0.56 * Math.sin(am) - 38, t: `${x.v}%`, cls: "so-lon trang", at: T + 350 });
      // bên gánh phần này đứng dưới múi của mình
      const xv = cx + (k ? 1 : -1) * R * 0.5; if (x.ve) s += vat(x.ve, P, xv - 75, h - 190, 150);
      nhan.push({ x: xv, y: h - 30, t: x.t, b: x.b, cls: "ten", at: T + 350 });
      a0 = a1; });
    s += `<!--L:up:350--><path d="M${f1(cx - R)} ${f1(cy)} H${f1(cx + R)}" stroke="#${mix(P.ink, "FFFFFF", 0.2)}" stroke-width="3" opacity=".35"/>`
      + `<circle cx="${f1(cx)}" cy="${f1(cy - R - 10)}" r="9" fill="#${P.ink}"/><line x1="${f1(cx)}" y1="${f1(cy - R - 4)}" x2="${f1(cx)}" y2="${f1(cy - R + 6)}" stroke="#${P.ink}" stroke-width="10"/>`
      + `<path d="M${f1(cx)} ${f1(cy)} V${f1(h - 70)} Q${f1(cx)} ${f1(h - 40)} ${f1(cx - 30)} ${f1(h - 40)} Q${f1(cx - 54)} ${f1(h - 40)} ${f1(cx - 54)} ${f1(h - 64)}" fill="none" stroke="#${P.ink}" stroke-width="11" stroke-linecap="round"/>`;
    return { svg: khungSvg(w, h, P, s), nhan };
  },

  // THÁP XẾP TẦNG = BIỂU ĐỒ CHỒNG: mỗi tầng = một đơn vị ("lần" / line), nhóm tầng cùng màu; tầng của nhóm đầu (mức giữ lại) viền vàng nổi bật
  "thap-tang": (d, P, w, h) => {
    const nh = d.nhom || [], tong = nh.reduce((a, x) => a + (+x.n || 0), 0) || 1, day = h - 40, H = day - 70, t = H / tong, bw = Math.min(w * 0.34, 290), x0 = w * 0.1, R = rnd(11);
    const M = [mix(P.ink, "FFFFFF", 0.15), P.acc, P.gold, mix(P.acc, "FFFFFF", 0.4)];
    let y = day, s = bong(x0 + bw / 2, day + 10, bw * 0.8), nhan = [];
    nh.forEach((g, k) => { const mau = g.mau || M[k % M.length], y1 = y - g.n * t, T = 500 + k * 900; s += `<!--L:${k ? "wipe" : "up"}:${T}-->`;
      for (let j = 0; j < g.n; j++) { const yy = y - (j + 1) * t;
        s += `<rect x="${f1(x0)}" y="${f1(yy)}" width="${f1(bw)}" height="${f1(t - 2)}" fill="#${mix(mau, "FFFFFF", j % 2 ? 0.07 : 0)}"/><rect x="${f1(x0 + bw * 0.74)}" y="${f1(yy)}" width="${f1(bw * 0.26)}" height="${f1(t - 2)}" fill="#000" opacity=".16"/>`;
        if (t > 9) for (let c = 0; c < 5; c++) s += `<rect x="${f1(x0 + 12 + c * bw * 0.14)}" y="${f1(yy + t * 0.22)}" width="${f1(bw * 0.08)}" height="${f1(Math.max(2, t * 0.42))}" rx="1" fill="#${R() > 0.35 ? "FFE3A0" : mix(mau, "000000", 0.3)}"/>`; }
      if (k === 0) s += `<rect x="${f1(x0 - 4)}" y="${f1(y1 - 2)}" width="${f1(bw + 8)}" height="${f1(g.n * t + 2)}" fill="none" stroke="#${P.gold}" stroke-width="5"/>`;
      const xb = x0 + bw + 26; s += `<path d="M${f1(xb)} ${f1(y - 3)} h18 V${f1(y1 + 3)} h-18" fill="none" stroke="#${k === 0 ? P.gold : mau}" stroke-width="5"/>`;
      nhan.push({ x: xb + 40, y: (y + y1) / 2 - (g.b ? 34 : 18), t: g.t, b: g.b, cls: "trai", at: T + 450 });
      y = y1; });
    s += `<!--L:drop:${500 + nh.length * 900}--><rect x="${f1(x0 + bw * 0.1)}" y="${f1(y - 22)}" width="${f1(bw * 0.8)}" height="22" fill="#${mix(P.ink, "FFFFFF", 0.2)}"/><line x1="${f1(x0 + bw * 0.5)}" y1="${f1(y - 22)}" x2="${f1(x0 + bw * 0.5)}" y2="${f1(y - 70)}" stroke="#${P.ink}" stroke-width="5"/><circle cx="${f1(x0 + bw * 0.5)}" cy="${f1(y - 72)}" r="6" fill="#${P.bad}"/>`
      + `<rect x="${f1(x0 - 24)}" y="${f1(day)}" width="${f1(bw + 48)}" height="12" rx="6" fill="#${P.ink}"/>`;
    return { svg: khungSvg(w, h, P, s), nhan };
  },

  // NHÀ + KHIÊN = SO HAI ĐẠI LƯỢNG cùng thang: nhà cao = giá trị BH (GTBH), khiên cao = số tiền BH (STBH); nhiều khiên chồng = BH trùng
  "nha-khien": (d, P, w, h) => {
    const ca = d.ca || [], cw = w / ca.length, day = h - 74, tyMax = Math.max(1, ...ca.map((c) => +c.ty || 1)), gt = (day - 30) / tyMax; let s = "", nhan = [];
    const khien = (cx, y0, hh, mau) => { const ww = Math.min(hh * 0.8, cw * 0.36);
      const path = `M${f1(cx)} ${f1(y0)} L${f1(cx + ww / 2)} ${f1(y0 + hh * 0.1)} V${f1(y0 + hh * 0.5)} Q${f1(cx + ww / 2)} ${f1(y0 + hh * 0.85)} ${f1(cx)} ${f1(y0 + hh)} Q${f1(cx - ww / 2)} ${f1(y0 + hh * 0.85)} ${f1(cx - ww / 2)} ${f1(y0 + hh * 0.5)} V${f1(y0 + hh * 0.1)}Z`;
      const c0 = y0 + hh * 0.45, sc = Math.min(ww, hh) * 0.18;
      return `<path d="${path}" fill="#${mau}" stroke="#${P.gold}" stroke-width="5" stroke-linejoin="round"/><path d="M${f1(cx)} ${f1(y0)} L${f1(cx + ww / 2)} ${f1(y0 + hh * 0.1)} V${f1(y0 + hh * 0.5)} Q${f1(cx + ww / 2)} ${f1(y0 + hh * 0.85)} ${f1(cx)} ${f1(y0 + hh)}Z" fill="#000" opacity=".13"/>`
        + `<path d="M${f1(cx - sc)} ${f1(c0)} l${f1(sc * 0.75)} ${f1(sc * 0.75)} l${f1(sc * 1.4)} ${f1(-sc * 1.4)}" fill="none" stroke="#fff" stroke-width="${f1(Math.max(4, sc * 0.45))}" stroke-linecap="round" stroke-linejoin="round"/>`; };
    ca.forEach((c, k) => { const cx = cw * k + cw / 2, hn = gt, bw = Math.min(cw * 0.4, hn * 0.92), xL = cx - bw - 6, top = day - hn, T = 1100 + k * 650;
      s += `<!--L:up:${350 + k * 120}-->` + bong(cx, day + 6, cw * 0.42);
      s += `<rect x="${f1(xL + bw * 0.66)}" y="${f1(top - bw * 0.42)}" width="${f1(bw * 0.14)}" height="${f1(bw * 0.3)}" fill="#${mix("C8653A", "000000", 0.2)}"/>`
        + `<rect x="${f1(xL)}" y="${f1(top)}" width="${f1(bw)}" height="${f1(hn)}" fill="#FBF3E4"/><rect x="${f1(xL + bw * 0.7)}" y="${f1(top)}" width="${f1(bw * 0.3)}" height="${f1(hn)}" fill="#000" opacity=".07"/>`
        + `<path d="M${f1(xL - 12)} ${f1(top)} L${f1(xL + bw / 2)} ${f1(top - bw * 0.42)} L${f1(xL + bw + 12)} ${f1(top)}Z" fill="#C8653A"/><path d="M${f1(xL + bw / 2)} ${f1(top - bw * 0.42)} L${f1(xL + bw + 12)} ${f1(top)} H${f1(xL + bw / 2)}Z" fill="#000" opacity=".14"/>`
        + [0.22, 0.58].map((fx) => `<rect x="${f1(xL + bw * fx)}" y="${f1(top + hn * 0.16)}" width="${f1(bw * 0.2)}" height="${f1(hn * 0.18)}" fill="#${mix(P.gold, "FFFFFF", 0.3)}" stroke="#fff" stroke-width="3"/>`).join("")
        + `<rect x="${f1(xL + bw * 0.38)}" y="${f1(day - hn * 0.34)}" width="${f1(bw * 0.24)}" height="${f1(hn * 0.34)}" fill="#${P.acc}"/>`
        + `<line x1="${f1(cx - cw * 0.47)}" y1="${f1(top)}" x2="${f1(cx + cw * 0.47)}" y2="${f1(top)}" stroke="#${P.ink}" stroke-width="3" stroke-dasharray="10 8" opacity=".5"/>`;
      const sx = cx + cw * 0.17; s += `<!--L:up:${T}-->`;
      if (c.kieu === "trung") { const n = c.so || 3, hh = (gt * (c.ty || 2)) / n; for (let j = 0; j < n; j++) s += khien(sx, day - (j + 1) * hh, hh - 6, j % 2 ? mix(P.acc, "FFFFFF", 0.3) : P.acc); }
      else { const hh = gt * (c.ty || 1); s += khien(sx, day - hh, hh, (c.ty || 1) > 1 ? mix(P.gold, "000000", 0.05) : P.acc); }
      nhan.push({ x: cx, y: day + 16, t: c.t, b: c.b, cls: "ten", w: cw - 16, at: T + 300 }); });
    s += `<rect x="0" y="${f1(day)}" width="${w}" height="6" rx="3" fill="#${P.ink}" opacity=".25"/>`;
    return { svg: khungSvg(w, h, P, s), nhan };
  },

  // CON ĐƯỜNG + CỘT MỐC = DÒNG THỜI GIAN: tán ô chỉ che đoạn giữa hai mốc "bat" → "het" (thời hạn BH); trước đó chưa được che (mưa rơi xuống đường)
  "duong-moc": (d, P, w, h) => {
    const mc = d.moc || [], n = mc.length, y = h * 0.72, x0 = 60, x1 = w - 60, X = (k) => x0 + ((x1 - x0) * (mc[k].vt ?? k / Math.max(1, n - 1)));
    const nhan = [], ib = mc.findIndex((m) => m.bat), ie = mc.findIndex((m) => m.het), xa = ib >= 0 ? X(ib) : x0, xb = ie >= 0 ? X(ie) : x1, R0 = rnd(9);
    let s = `<ellipse cx="${w / 2}" cy="${f1(y + 60)}" rx="${w * 0.5}" ry="${f1(Math.max(40, h - y - 30))}" fill="url(#bdNR)"/><defs><radialGradient id="bdNR" cx=".5" cy=".35" r=".6"><stop offset="0" stop-color="#${mix(P.acc, "FFFFFF", 0.6)}"/><stop offset="1" stop-color="#${mix(P.acc, "FFFFFF", 0.6)}" stop-opacity="0"/></radialGradient></defs>`
      + `<rect x="${x0 - 30}" y="${f1(y - 16)}" width="${f1(x1 - x0 + 60)}" height="32" rx="16" fill="#${mix(P.ink, "FFFFFF", 0.3)}"/>`
      + `<line x1="${x0}" y1="${f1(y)}" x2="${x1}" y2="${f1(y)}" stroke="#FFE3B0" stroke-width="5" stroke-dasharray="26 18"/>`;
    // mưa: chỉ ngoài đoạn được che
    for (let i = 0; i < 40; i++) { const x = R0() * w, yy = 40 + R0() * (y - 120); if (x > xa - 20 && x < xb + 20 && yy > y - (xb - xa) * 0.42 - 30) continue; s += `<path d="M${f1(x)} ${f1(yy)} l-8 22" stroke="#${mix(P.acc, "FFFFFF", 0.4)}" stroke-width="5" stroke-linecap="round" opacity=".7"/>`; }
    // tán ô phủ đoạn thời hạn
    const cx = (xa + xb) / 2, rx = (xb - xa) / 2 + 30, ry = Math.min(rx * 0.55, y - 80), cyc = y - 70;
    let mep = `M${f1(cx - rx)} ${f1(cyc)}`; const nn = 10; for (let j = 0; j < nn; j++) mep += ` Q${f1(cx - rx + (j + 0.5) * (2 * rx) / nn)} ${f1(cyc - 26)} ${f1(cx - rx + (j + 1) * (2 * rx) / nn)} ${f1(cyc)}`;
    s += `<!--L:grow:${700 + n * 450}--><path d="M${f1(cx - rx)} ${f1(cyc)} A${f1(rx)} ${f1(ry)} 0 0 1 ${f1(cx + rx)} ${f1(cyc)} Z" fill="#${P.acc}"/>`
      + `<path d="M${f1(cx - rx)} ${f1(cyc)} A${f1(rx)} ${f1(ry)} 0 0 1 ${f1(cx + rx)} ${f1(cyc)}Z" fill="url(#bdS)"/>`
      + `<path d="${mep}" fill="none" stroke="#${P.gold}" stroke-width="7"/>`
      + `<rect x="${f1(cx - rx)}" y="${f1(cyc)}" width="${f1(2 * rx)}" height="${f1(y - 16 - cyc)}" fill="#${P.acc}" opacity=".1"/>`
      + `<line x1="${f1(cx)}" y1="${f1(cyc - ry - 18)}" x2="${f1(cx)}" y2="${f1(cyc - ry)}" stroke="#${P.ink}" stroke-width="10" stroke-linecap="round"/>`;
    mc.forEach((m, k) => { const x = X(k), mau = m.bat || m.het ? P.gold : mix(P.ink, "FFFFFF", 0.35), T = 500 + k * 450;
      s += `<!--L:drop:${T}--><line x1="${f1(x)}" y1="${f1(y - 16)}" x2="${f1(x)}" y2="${f1(y - 90)}" stroke="#${P.ink}" stroke-width="6"/><path d="M${f1(x)} ${f1(y - 120)} h46 l-12 15 l12 15 h-46Z" fill="#${mau}"/><circle cx="${f1(x)}" cy="${f1(y)}" r="16" fill="#${mau}" stroke="#fff" stroke-width="5"/>`;
      nhan.push({ x, y: y + 34, t: m.t, b: m.b, cls: "ten", at: T + 200 }); });
    if (d.nhanTan) nhan.push({ x: cx, y: cyc - ry * 0.55, t: d.nhanTan, cls: "trang", at: 700 + n * 450 + 400 });
    return { svg: khungSvg(w, h, P, s), nhan };
  },

  // TOÀ NHÀ CHÁY = BIỂU ĐỒ CỘT KÉP: chiều cao toà ∝ STBH, phần lửa ∝ thiệt hại (cùng thang); phí BH ghi trên đồng xu ở chân toà
  "toa-chay": (d, P, w, h) => {
    const ds = d.toa || [], n = ds.length, day = h - 120, max = Math.max(...ds.map((x) => +x.stbh || 0)) || 1, H = day - 70, cw = w / n, bw = Math.min(cw * 0.56, 170), R0 = rnd(3);
    const MAU = ["81B29A", "F2C14E", "6D8EAD", "D6A2AD", "3D8A87"];
    let s = `<rect x="0" y="${f1(day)}" width="${w}" height="8" rx="4" fill="#${P.ink}" opacity=".3"/>`, nhan = [];
    ds.forEach((x, k) => { const cx = cw * k + cw / 2, hh = (H * x.stbh) / max, ht = (H * (x.thiet || 0)) / max, xL = cx - bw / 2, top = day - hh, mau = x.mau || MAU[k % MAU.length], T = 450 + k * 300, TF = 450 + n * 300 + 300 + k * 300;
      s += `<!--L:up:${T}-->` + bong(cx, day + 4, bw * 0.75) + `<rect x="${f1(xL)}" y="${f1(top)}" width="${f1(bw)}" height="${f1(hh)}" fill="#${mau}"/><rect x="${f1(xL + bw * 0.72)}" y="${f1(top)}" width="${f1(bw * 0.28)}" height="${f1(hh)}" fill="#000" opacity=".14"/>`
        + `<rect x="${f1(xL - 6)}" y="${f1(top - 12)}" width="${f1(bw + 12)}" height="14" fill="#${mix(mau, "000000", 0.35)}"/>`;
      const rows = Math.max(1, Math.floor(hh / 34)); for (let r = 0; r < rows; r++) for (let c = 0; c < 3; c++) { const yy = top + 14 + r * 34; if (yy + 18 > day) continue; s += `<rect x="${f1(xL + 12 + c * bw * 0.24)}" y="${f1(yy)}" width="${f1(bw * 0.15)}" height="16" fill="#${R0() > 0.4 ? "FFE3A0" : mix(mau, "000000", 0.3)}"/>`; }
      if (ht > 0) { // lửa chiếm phần dưới của toà, cao ∝ thiệt hại; ngọn lửa trồi trên mép
        const fy = day - ht; s += `<!--L:up:${TF}--><rect x="${f1(xL)}" y="${f1(fy)}" width="${f1(bw)}" height="${f1(ht)}" fill="url(#bdL)" opacity=".9"/>`;
        for (let j = 0; j < 4; j++) { const fx = xL + (j + 0.5) * (bw / 4), fh = 18 + R0() * 22; s += `<path d="M${f1(fx - bw / 9)} ${f1(fy)} Q${f1(fx - bw / 14)} ${f1(fy - fh * 0.6)} ${f1(fx)} ${f1(fy - fh)} Q${f1(fx + bw / 14)} ${f1(fy - fh * 0.6)} ${f1(fx + bw / 9)} ${f1(fy)}Z" fill="#FFB347"/>`; }
        nhan.push({ x: cx, y: fy + Math.min(ht / 2, ht - 10) - 16, t: x.nhanThiet, cls: "nho trang", w: cw - 16, at: TF + 250 }); }
      nhan.push({ x: cx, y: top - 58, t: x.nhanStbh, cls: "nho", w: cw - 16, at: T + 250 }); s += `<!--L:up:${T}-->`;
      s += `<ellipse cx="${f1(cx)}" cy="${f1(day + 46)}" rx="34" ry="12" fill="#${mix(P.gold, "000000", 0.25)}"/><rect x="${f1(cx - 34)}" y="${f1(day + 34)}" width="68" height="12" fill="#${mix(P.gold, "000000", 0.25)}"/><ellipse cx="${f1(cx)}" cy="${f1(day + 34)}" rx="34" ry="12" fill="#${P.gold}"/>`;
      nhan.push({ x: cx, y: day + 62, t: x.t, b: x.nhanPhi, cls: "ten", w: cw - 16, at: T + 250 }); });
    return { svg: khungSvg(w, h, P, s), nhan };
  },

  // HŨ PHÍ + VẠCH NGƯỠNG (minh hoạ, không theo số liệu): hũ = phí BH; nước = bồi thường; vạch = tỷ lệ bồi thường giữ lại; phần trên vạch chảy sang DN nhận tái
  "hu-nguong": (d, P, w, h) => {
    const x0 = w * 0.08, jw = w * 0.36, top = 70, bot = h - 60, mucN = d.muc ?? 0.78, mucV = d.nguong ?? 0.55, yN = bot - (bot - top) * mucN, yV = bot - (bot - top) * mucV;
    let s = bong(x0 + jw / 2, bot + 12, jw * 0.7)
      + `<!--L:up:900--><rect x="${f1(x0 + 6)}" y="${f1(yV)}" width="${f1(jw - 12)}" height="${f1(bot - yV - 6)}" rx="20" fill="#${P.acc}" opacity=".85"/>`
      + `<!--L:up:1700--><rect x="${f1(x0 + 6)}" y="${f1(yN)}" width="${f1(jw - 12)}" height="${f1(yV - yN)}" fill="#${P.gold}" opacity=".9"/>`
      + `<!--L:fade:350--><path d="M${f1(x0)} ${f1(top)} H${f1(x0 + jw)} V${f1(bot - 30)} Q${f1(x0 + jw)} ${f1(bot)} ${f1(x0 + jw - 30)} ${f1(bot)} H${f1(x0 + 30)} Q${f1(x0)} ${f1(bot)} ${f1(x0)} ${f1(bot - 30)}Z" fill="#${mix(P.acc, "FFFFFF", 0.85)}" fill-opacity=".35" stroke="#${mix(P.acc, "FFFFFF", 0.3)}" stroke-width="6"/>`
      + `<rect x="${f1(x0 + 20)}" y="${f1(top - 24)}" width="${f1(jw - 40)}" height="26" rx="8" fill="#${P.ink}"/><path d="M${f1(x0 + 24)} ${f1(top + 30)} V${f1(bot - 50)}" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".6"/>`
      + `<!--L:wipe:1300--><line x1="${f1(x0 - 30)}" y1="${f1(yV)}" x2="${f1(x0 + jw + 30)}" y2="${f1(yV)}" stroke="#${P.bad}" stroke-width="6" stroke-dasharray="16 10"/>`;
    // dòng chảy phần vượt sang DN nhận tái (bên phải)
    const xr = x0 + jw, xd = w * 0.72; s += `<!--L:wipe:2300--><path d="M${f1(xr - 10)} ${f1(yN + 10)} C${f1(xr + 120)} ${f1(yN - 40)} ${f1(xd - 140)} ${f1(yN - 40)} ${f1(xd - 60)} ${f1(yN + 70)}" fill="none" stroke="#${P.gold}" stroke-width="22" stroke-linecap="round" opacity=".9"/>`
      + vat("toa-nhan-tai", P, xd - 70, yN + 40, Math.min(260, bot - yN - 20));
    const nhan = [{ x: x0 + jw / 2, y: bot + 26, t: d.tHu || "Phí bảo hiểm", cls: "ten", at: 500 }, { x: x0 + jw + 40, y: yV - 20, t: d.tNguong || "Tỷ lệ bồi thường giữ lại", cls: "trai nho", at: 1500 },
      { x: x0 + jw / 2, y: (yV + bot) / 2 - 30, t: d.tGiu || "Nhượng tái tự trả", cls: "trang nho", at: 1100 }, { x: x0 + jw / 2, y: (yN + yV) / 2 - 18, t: d.tVuot || "Phần vượt", cls: "nho", at: 1900 },
      { x: xd + 30, y: bot + 26, t: d.tNhan || "DN nhận tái trả phần vượt", cls: "ten", at: 2600 }];
    return { svg: khungSvg(w, h, P, s), nhan };
  },
};
// SÀN DIỄN: vầng sáng sau biểu đồ + mặt sàn gradient — biểu đồ đứng trong một không gian có ánh sáng, không "trôi" trên nền
const san = (w, h, P) => `<defs><radialGradient id="snG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#${mix(P.gold, "FFFFFF", 0.55)}" stop-opacity=".55"/><stop offset="1" stop-color="#${mix(P.gold, "FFFFFF", 0.55)}" stop-opacity="0"/></radialGradient>
<radialGradient id="snS" cx=".5" cy=".4" r=".55"><stop offset="0" stop-color="#${mix(P.acc, "FFFFFF", 0.72)}"/><stop offset="1" stop-color="#${mix(P.acc, "FFFFFF", 0.9)}" stop-opacity="0"/></radialGradient></defs>
<ellipse cx="${w / 2}" cy="${h * 0.52}" rx="${w * 0.46}" ry="${h * 0.46}" fill="url(#snG)"/><ellipse cx="${w / 2}" cy="${h - 34}" rx="${w * 0.47}" ry="50" fill="url(#snS)"/>`;
// hạt nhiễu mịn, MỜ DẦN về mép khung (mặt nạ hướng tâm) — không lộ đường viền chữ nhật của biểu đồ
const HAT = (w, h) => `<defs><filter id="bdHat" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .15  0 0 0 0 .2  0 0 0 .08 0"/></filter>
<radialGradient id="bdMG" cx=".5" cy=".55" r=".5"><stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient><mask id="bdM"><rect width="${w}" height="${h}" fill="url(#bdMG)"/></mask></defs><rect width="${w}" height="${h}" filter="url(#bdHat)" mask="url(#bdM)"/>`;
// tách SVG theo dấu <!--L:hiệu-ứng:ms--> thành các lớp (mỗi lớp một ảnh, hiện theo lập luận); lớp 0 = sàn diễn + phần trước dấu đầu tiên
function tachLop(kieu, r, P, w, h) {
  const body = r.svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, ""), defs = (body.match(/^<defs>[\s\S]*?<\/defs>/) || [""])[0], rest = body.slice(defs.length);
  const parts = rest.split(/<!--L:([a-z-]+):(\d+)-->/), lop = [{ svg: khungSvg(w, h, P, san(w, h, P) + parts[0]), a: "fade", at: 150 }];
  for (let i = 1; i < parts.length; i += 3) if (parts[i + 2] && parts[i + 2].trim()) lop.push({ svg: khungSvg(w, h, P, parts[i + 2]), a: parts[i], at: +parts[i + 1] });
  lop.push({ svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${HAT(w, h)}</svg>`, a: "fade", at: 150, tren: true });
  return { ...r, svg: khungSvg(w, h, P, san(w, h, P) + rest.replace(/<!--L:[^>]*-->/g, "") + HAT(w, h)), lop };
}
const coKieu = (k) => Object.prototype.hasOwnProperty.call(KIEU, k);
const KIEU_LOP = Object.fromEntries(Object.entries(KIEU).map(([k, f]) => [k, (d, P, w, h) => tachLop(k, f(d, P, w, h), P, w, h)]));
module.exports = { KIEU: KIEU_LOP, KIEU_GOC: KIEU, coKieu, doc };
