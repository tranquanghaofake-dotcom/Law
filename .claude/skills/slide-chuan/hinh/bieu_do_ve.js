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
    for (let i = 0; i < 60; i++) { const x = R0() * w, y = R0() * h * 0.7; if (Math.abs(x - cx) < R * 1.08 && y > cy - R * 1.05) continue; /* dưới và trong tán: không mưa */ s += `<path d="M${f1(x)} ${f1(y)} l-9 28" stroke="#${mix(P.acc, "FFFFFF", 0.4)}" stroke-width="4" stroke-linecap="round" opacity=".75"/><circle cx="${f1(x - 10)}" cy="${f1(y + 31)}" r="3" fill="#${mix(P.acc, "FFFFFF", 0.4)}" opacity=".75"/>`; }
    s += `<ellipse cx="${f1(cx)}" cy="${f1(h - 22)}" rx="${f1(w * 0.48)}" ry="26" fill="#${mix(P.acc, "FFFFFF", 0.7)}" opacity=".7"/><ellipse cx="${f1(cx)}" cy="${f1(h - 22)}" rx="${f1(R * 1.02)}" ry="20" fill="#F7F1E4"/>` + bong(cx, h - 22, R * 0.85);
    for (let i = 0; i < 9; i++) { const x = (i % 2 ? cx + R * 1.12 + R0() * (w / 2 - R * 1.15) : R0() * (cx - R * 1.12)), yy = h - 30 + R0() * 14; s += `<ellipse cx="${f1(x)}" cy="${f1(yy)}" rx="${f1(10 + R0() * 8)}" ry="3.5" fill="none" stroke="#${mix(P.acc, "FFFFFF", 0.35)}" stroke-width="2" opacity=".8"/>`; }
    const p = (a, r = R) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    ph.forEach((x, k) => { const a1 = a0 + Math.PI * (x.v / tong), mau = x.mau || M[k % M.length], [x0, y0] = p(a0), [x1, y1] = p(a1), lon = a1 - a0 > Math.PI ? 1 : 0, T = 900 + k * 700;
      s += `<!--L:grow:${T}--><path d="M${f1(cx)} ${f1(cy)} L${f1(x0)} ${f1(y0)} A${f1(R)} ${f1(R)} 0 ${lon} 1 ${f1(x1)} ${f1(y1)}Z" fill="#${mau}"/><path d="M${f1(cx)} ${f1(cy)} L${f1(x0)} ${f1(y0)} A${f1(R)} ${f1(R)} 0 ${lon} 1 ${f1(x1)} ${f1(y1)}Z" fill="url(#bdS)"/>`;
      const n = Math.max(2, Math.round(9 * (x.v / tong)));
      for (let j = 0; j < n; j++) { const b0 = a0 + ((a1 - a0) * j) / n, b1 = a0 + ((a1 - a0) * (j + 1)) / n, bm = (b0 + b1) / 2, [u0, v0] = p(b0), [u1, v1] = p(b1), [q0, q1] = p(bm, R * 0.86);
        s += `<path d="M${f1(cx)} ${f1(cy)} L${f1(u0)} ${f1(v0)} A${f1(R)} ${f1(R)} 0 0 1 ${f1(u1)} ${f1(v1)}Z" fill="#${j % 2 ? mix(mau, "000000", 0.07) : mix(mau, "FFFFFF", 0.06)}"/>`
          + `<path d="M${f1(u0)} ${f1(v0)} Q${f1(q0)} ${f1(q1)} ${f1(u1)} ${f1(v1)} Z" fill="#${mix(mau, "000000", 0.3)}"/>`
          + `<path d="M${f1(u0)} ${f1(v0)} Q${f1(q0)} ${f1(q1)} ${f1(u1)} ${f1(v1)}" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="5 5" opacity=".55"/>`;
        if (j) s += `<line x1="${f1(cx)}" y1="${f1(cy)}" x2="${f1(u0)}" y2="${f1(v0)}" stroke="#${mix(mau, "FFFFFF", 0.4)}" stroke-width="2.5" opacity=".75"/><line x1="${f1(cx + (u0 - cx) * 0.05)}" y1="${f1(cy + (v0 - cy) * 0.05)}" x2="${f1(u0)}" y2="${f1(v0)}" stroke="#fff" stroke-width="1.2" stroke-dasharray="4 6" opacity=".6"/>`; }
      s += `<line x1="${f1(cx)}" y1="${f1(cy)}" x2="${f1(x1)}" y2="${f1(y1)}" stroke="#fff" stroke-width="6"/>`;
      const am = (a0 + a1) / 2; nhan.push({ x: cx + R * 0.56 * Math.cos(am), y: cy + R * 0.56 * Math.sin(am) - 38, t: `${x.v}%`, cls: mau === P.gold ? "so-lon" : "so-lon trang", at: T + 350 });   /* chữ trắng trên vàng chỉ 2,9 : 1 → chữ mực */
      // bên gánh phần này đứng dưới múi của mình
      const xv = cx + (k ? 1 : -1) * R * 0.5; if (x.ve) s += vat(x.ve, P, xv - 75, h - 190, 150);
      nhan.push({ x: xv, y: h - 30, t: x.t, b: x.b, cls: "ten", at: T + 350 });
      a0 = a1; });
    s += `<!--L:up:350--><path d="M${f1(cx - R)} ${f1(cy)} Q${f1(cx)} ${f1(cy + 22)} ${f1(cx + R)} ${f1(cy)}" fill="#${mix(P.ink, "FFFFFF", 0.15)}" opacity=".35"/>`
      + `<defs><linearGradient id="kl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8E9AA0"/><stop offset=".45" stop-color="#F2F5F6"/><stop offset="1" stop-color="#6D777C"/></linearGradient><linearGradient id="go" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5A3B26"/><stop offset=".5" stop-color="#9A6A43"/><stop offset="1" stop-color="#4E331F"/></linearGradient></defs>`
      + `<path d="M${f1(cx - 7)} ${f1(cy - R + 4)} L${f1(cx)} ${f1(cy - R - 34)} L${f1(cx + 7)} ${f1(cy - R + 4)}Z" fill="url(#kl)"/><circle cx="${f1(cx)}" cy="${f1(cy - R - 34)}" r="5" fill="url(#kl)"/>`
      + `<rect x="${f1(cx - 4.5)}" y="${f1(cy)}" width="9" height="${f1(h - 130 - cy)}" fill="url(#kl)"/>`
      + `<path d="M${f1(cx)} ${f1(h - 130)} V${f1(h - 70)} Q${f1(cx)} ${f1(h - 38)} ${f1(cx - 30)} ${f1(h - 38)} Q${f1(cx - 56)} ${f1(h - 38)} ${f1(cx - 56)} ${f1(h - 64)}" fill="none" stroke="url(#go)" stroke-width="16" stroke-linecap="round"/>`
      + [0, 1, 2].map((q) => `<line x1="${f1(cx - 4)}" y1="${f1(h - 125 + q * 18)}" x2="${f1(cx + 4)}" y2="${f1(h - 118 + q * 18)}" stroke="#3A2414" stroke-width="1.5" opacity=".6"/>`).join("") + `<rect x="${f1(cx - 9)}" y="${f1(h - 134)}" width="18" height="8" rx="3" fill="url(#kl)"/>`;
    return { svg: khungSvg(w, h, P, s), nhan };
  },

  // THÁP XẾP TẦNG = BIỂU ĐỒ CHỒNG: mỗi tầng = một đơn vị ("lần" / line), nhóm tầng cùng màu; tầng của nhóm đầu (mức giữ lại) viền vàng nổi bật
  "thap-tang": (d, P, w, h) => {
    const nh = d.nhom || [], tong = nh.reduce((a, x) => a + (+x.n || 0), 0) || 1, day = h - 40, H = day - 190, t = H / tong, bw = Math.min(w * 0.34, 290), x0 = w * 0.1, R = rnd(11);
    const M = [mix(P.ink, "FFFFFF", 0.15), P.acc, P.gold, mix(P.acc, "FFFFFF", 0.4)];
    let y = day, s = `<defs><linearGradient id="kinhT" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCEDF0"/><stop offset="1" stop-color="#7FA3AE"/></linearGradient></defs>` + bong(x0 + bw / 2, day + 10, bw * 0.8), nhan = [];
    // sảnh kính ở chân tháp (dưới mặt đất của biểu đồ, không tính là tầng) + người ra vào
    s += `<rect x="${f1(x0 - 14)}" y="${f1(day + 2)}" width="${f1(bw + 28)}" height="26" fill="#${mix(P.ink, "FFFFFF", 0.25)}"/><rect x="${f1(x0 + bw * 0.3)}" y="${f1(day + 5)}" width="${f1(bw * 0.4)}" height="20" fill="url(#kinhT)"/>`
      + [0.18, 0.82].map((fx) => `<rect x="${f1(x0 + bw * fx - 4)}" y="${f1(day + 8)}" width="8" height="16" rx="3" fill="#${fx < 0.5 ? P.gold : "E07A5F"}"/><circle cx="${f1(x0 + bw * fx)}" cy="${f1(day + 5)}" r="4" fill="#F2C29B"/>`).join("");
    nh.forEach((g, k) => { const mau = g.mau || M[k % M.length], y1 = y - g.n * t, T = 500 + k * 900; s += `<!--L:${k ? "wipe" : "up"}:${T}-->`;
      for (let j = 0; j < g.n; j++) { const yy = y - (j + 1) * t;
        s += `<rect x="${f1(x0)}" y="${f1(yy)}" width="${f1(bw)}" height="${f1(t - 2)}" fill="#${mix(mau, "FFFFFF", j % 2 ? 0.07 : 0)}"/><rect x="${f1(x0 + bw * 0.74)}" y="${f1(yy)}" width="${f1(bw * 0.26)}" height="${f1(t - 2)}" fill="#000" opacity=".16"/>`;
        if (t > 9) for (let c = 0; c < 5; c++) { const wx = x0 + 12 + c * bw * 0.14, wy = yy + t * 0.2, ww = bw * 0.09, wh = Math.max(3, t * 0.48), sang = R() > 0.4;
          s += `<rect x="${f1(wx - 1.5)}" y="${f1(wy - 1.5)}" width="${f1(ww + 3)}" height="${f1(wh + 3)}" fill="#${mix(mau, "FFFFFF", 0.55)}"/><rect x="${f1(wx)}" y="${f1(wy)}" width="${f1(ww)}" height="${f1(wh)}" fill="${sang ? "#FFE3A0" : "url(#kinhT)"}"/><line x1="${f1(wx + ww / 2)}" y1="${f1(wy)}" x2="${f1(wx + ww / 2)}" y2="${f1(wy + wh)}" stroke="#${mix(mau, "FFFFFF", 0.55)}" stroke-width="1"/>`; }
        s += `<line x1="${f1(x0)}" y1="${f1(yy + t - 2)}" x2="${f1(x0 + bw)}" y2="${f1(yy + t - 2)}" stroke="#${mix(mau, "000000", 0.3)}" stroke-width="1.5"/>`; }
      if (k === 0) s += `<rect x="${f1(x0 - 4)}" y="${f1(y1 - 2)}" width="${f1(bw + 8)}" height="${f1(g.n * t + 2)}" fill="none" stroke="#${P.gold}" stroke-width="5"/>`;
      const xb = x0 + bw + 26; s += `<path d="M${f1(xb)} ${f1(y - 3)} h18 V${f1(y1 + 3)} h-18" fill="none" stroke="#${k === 0 ? P.gold : mau}" stroke-width="5"/>`;
      nhan.push({ x: xb + 40, y: (y + y1) / 2 - (g.b ? 34 : 18), t: g.t, b: g.b, cls: "trai", at: T + 450 });
      y = y1; });
    const cy0 = y - 22, cxr = x0 + bw * 0.78, cang = Math.min(240, w - cxr - 20);
    s += `<!--L:drop:${500 + nh.length * 900}--><path d="M${f1(cxr)} ${f1(cy0)} V${f1(cy0 - 120)} M${f1(cxr - 40)} ${f1(cy0 - 112)} H${f1(cxr + cang)} M${f1(cxr)} ${f1(cy0 - 120)} L${f1(cxr + cang * 0.6)} ${f1(cy0 - 112)} M${f1(cxr)} ${f1(cy0 - 120)} L${f1(cxr - 40)} ${f1(cy0 - 112)}" fill="none" stroke="#${P.gold}" stroke-width="6" stroke-linejoin="round"/>`
      + [...Array(6).keys()].map((q) => `<path d="M${f1(cxr - 6)} ${f1(cy0 - q * 20)} l12 -20 M${f1(cxr + 6)} ${f1(cy0 - q * 20)} l-12 -20" stroke="#${P.gold}" stroke-width="2"/>`).join("")
      + `<rect x="${f1(cxr - 46)}" y="${f1(cy0 - 116)}" width="22" height="16" fill="#${P.ink}"/><line x1="${f1(cxr + cang * 0.75)}" y1="${f1(cy0 - 112)}" x2="${f1(cxr + cang * 0.75)}" y2="${f1(cy0 - 52)}" stroke="#${P.ink}" stroke-width="2"/>`
      + `<rect x="${f1(cxr + cang * 0.75 - 48)}" y="${f1(cy0 - 52)}" width="96" height="${f1(Math.max(8, t - 2))}" fill="#${P.gold}" stroke="#fff" stroke-width="2"/>`;
    s += `<rect x="${f1(x0 + bw * 0.1)}" y="${f1(y - 22)}" width="${f1(bw * 0.8)}" height="22" fill="#${mix(P.ink, "FFFFFF", 0.2)}"/><line x1="${f1(x0 + bw * 0.5)}" y1="${f1(y - 22)}" x2="${f1(x0 + bw * 0.5)}" y2="${f1(y - 70)}" stroke="#${P.ink}" stroke-width="5"/><circle cx="${f1(x0 + bw * 0.5)}" cy="${f1(y - 72)}" r="6" fill="#${P.bad}"/>`
      + `<rect x="${f1(x0 - 24)}" y="${f1(day)}" width="${f1(bw + 48)}" height="12" rx="6" fill="#${P.ink}"/>`;
    return { svg: khungSvg(w, h, P, s), nhan };
  },

  // NHÀ + KHIÊN = SO HAI ĐẠI LƯỢNG cùng thang: nhà cao = giá trị BH (GTBH), khiên cao = số tiền BH (STBH); nhiều khiên chồng = BH trùng
  "nha-khien": (d, P, w, h) => {
    const ca = d.ca || [], cw = w / ca.length, day = h - 74, tyMax = Math.max(1, ...ca.map((c) => +c.ty || 1)), gt = (day - 30) / tyMax; let s = "", nhan = [];
    const khien = (cx, y0, hh, mau) => { const ww = Math.min(hh * 0.8, cw * 0.36);
      const path = `M${f1(cx)} ${f1(y0)} L${f1(cx + ww / 2)} ${f1(y0 + hh * 0.1)} V${f1(y0 + hh * 0.5)} Q${f1(cx + ww / 2)} ${f1(y0 + hh * 0.85)} ${f1(cx)} ${f1(y0 + hh)} Q${f1(cx - ww / 2)} ${f1(y0 + hh * 0.85)} ${f1(cx - ww / 2)} ${f1(y0 + hh * 0.5)} V${f1(y0 + hh * 0.1)}Z`;
      const c0 = y0 + hh * 0.45, sc = Math.min(ww, hh) * 0.18;
      return `<path d="${path}" fill="#${mau}" stroke="#${P.gold}" stroke-width="5" stroke-linejoin="round"/><path d="M${f1(cx)} ${f1(y0 + 8)} L${f1(cx - ww / 2 + 8)} ${f1(y0 + hh * 0.13)} V${f1(y0 + hh * 0.45)}" fill="none" stroke="#fff" stroke-width="4" opacity=".45" stroke-linecap="round"/><path d="M${f1(cx)} ${f1(y0)} L${f1(cx + ww / 2)} ${f1(y0 + hh * 0.1)} V${f1(y0 + hh * 0.5)} Q${f1(cx + ww / 2)} ${f1(y0 + hh * 0.85)} ${f1(cx)} ${f1(y0 + hh)}Z" fill="#000" opacity=".13"/>`
        + `<path d="M${f1(cx - sc)} ${f1(c0)} l${f1(sc * 0.75)} ${f1(sc * 0.75)} l${f1(sc * 1.4)} ${f1(-sc * 1.4)}" fill="none" stroke="#fff" stroke-width="${f1(Math.max(4, sc * 0.45))}" stroke-linecap="round" stroke-linejoin="round"/>`; };
    ca.forEach((c, k) => { const cx = cw * k + cw / 2, hn = gt, bw = Math.min(cw * 0.4, hn * 0.92), xL = cx - bw - 6, top = day - hn, T = 1100 + k * 650;
      s += `<!--L:up:${350 + k * 120}-->` + bong(cx, day + 6, cw * 0.42);
      s += `<rect x="${f1(xL + bw * 0.66)}" y="${f1(top - bw * 0.42)}" width="${f1(bw * 0.14)}" height="${f1(bw * 0.3)}" fill="#${mix("C8653A", "000000", 0.2)}"/>`
        + `<rect x="${f1(xL)}" y="${f1(top)}" width="${f1(bw)}" height="${f1(hn)}" fill="#FBF3E4"/><rect x="${f1(xL + bw * 0.7)}" y="${f1(top)}" width="${f1(bw * 0.3)}" height="${f1(hn)}" fill="#000" opacity=".07"/>`
        + `<path d="M${f1(xL - 12)} ${f1(top)} L${f1(xL + bw / 2)} ${f1(top - bw * 0.42)} L${f1(xL + bw + 12)} ${f1(top)}Z" fill="#C8653A"/><path d="M${f1(xL + bw / 2)} ${f1(top - bw * 0.42)} L${f1(xL + bw + 12)} ${f1(top)} H${f1(xL + bw / 2)}Z" fill="#000" opacity=".14"/>`
        + [1, 2, 3].map((q) => `<path d="M${f1(xL - 12 + q * 10)} ${f1(top - q * bw * 0.1)} L${f1(xL + bw + 12 - q * 10)} ${f1(top - q * bw * 0.1)}" stroke="#${mix("C8653A", "000000", 0.25)}" stroke-width="2" opacity=".6"/>`).join("")
        + [0.2, 0.58].map((fx) => { const wx = xL + bw * fx, wy = top + hn * 0.15, ww = bw * 0.22, wh = hn * 0.2;
          return `<rect x="${f1(wx)}" y="${f1(wy)}" width="${f1(ww)}" height="${f1(wh)}" fill="#${mix(P.gold, "FFFFFF", 0.35)}" stroke="#fff" stroke-width="4"/><path d="M${f1(wx)} ${f1(wy)} q${f1(ww * 0.25)} ${f1(wh * 0.5)} 0 ${f1(wh)} M${f1(wx + ww)} ${f1(wy)} q${f1(-ww * 0.25)} ${f1(wh * 0.5)} 0 ${f1(wh)}" fill="#${mix(P.bad, "FFFFFF", 0.55)}" opacity=".8"/><line x1="${f1(wx + ww / 2)}" y1="${f1(wy)}" x2="${f1(wx + ww / 2)}" y2="${f1(wy + wh)}" stroke="#fff" stroke-width="2"/><rect x="${f1(wx - 4)}" y="${f1(wy + wh)}" width="${f1(ww + 8)}" height="5" fill="#${mix("C8653A", "000000", 0.2)}"/>`; }).join("")
        + `<rect x="${f1(xL + bw * 0.34)}" y="${f1(day - 6)}" width="${f1(bw * 0.32)}" height="6" fill="#B9AE9A"/>`
        + `<circle cx="${f1(xL - 2)}" cy="${f1(day - 12)}" r="14" fill="#3F7F5E"/><circle cx="${f1(xL + 14)}" cy="${f1(day - 8)}" r="10" fill="#4C8F6A"/>`
        + [...Array(5).keys()].map((q) => `<rect x="${f1(xL - 40 + q * 9)}" y="${f1(day - 22)}" width="5" height="22" fill="#fff" stroke="#D8CFC0"/>`).join("") + `<line x1="${f1(xL - 42)}" y1="${f1(day - 14)}" x2="${f1(xL - 2)}" y2="${f1(day - 14)}" stroke="#D8CFC0" stroke-width="3"/>`
        + `<rect x="${f1(xL + bw * 0.38)}" y="${f1(day - hn * 0.34)}" width="${f1(bw * 0.24)}" height="${f1(hn * 0.34 - 6)}" fill="#${P.acc}"/><circle cx="${f1(xL + bw * 0.57)}" cy="${f1(day - hn * 0.17)}" r="3" fill="#${P.gold}"/>`
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

  // TOÀ NHÀ CHÁY = BIỂU ĐỒ CỘT KÉP (v2, chi tiết): chiều cao toà ∝ STBH, vùng cháy ∝ thiệt hại (cùng thang); thước đo hai màu bên phải mỗi toà
  // để ĐỌC SỐ rõ ràng (xanh = STBH, cam = thiệt hại); chồng xu = phí BH (số đồng ∝ phí). Toà có mặt tiền thật: cửa sổ khung + kính phản chiếu,
  // bậu cửa, ban công, tầng trệt cửa hàng có mái hiên sọc, bồn nước trên mái; vùng cháy: cửa sổ rực lửa, tường ám khói, lửa liếm + khói bốc
  "toa-chay": (d, P, w, h) => {
    const ds = d.toa || [], n = ds.length, day = h - 150, max = Math.max(...ds.map((x) => +x.stbh || 0)) || 1, H = day - 90, cw = w / n, bw = Math.min(cw * 0.5, 160), R0 = rnd(3);
    const phiMax = Math.max(...ds.map((x) => +x.phi || 0)) || 1, MAU = ["7FA88F", "E9B949", "6B8CB0", "C995A5", "3F8A86"];
    let s = `<defs><linearGradient id="kinh" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCEDF0"/><stop offset=".5" stop-color="#A9C7CF"/><stop offset="1" stop-color="#7FA3AE"/></linearGradient>
<linearGradient id="kinhLua" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FF6A2B"/><stop offset=".6" stop-color="#FFB13B"/><stop offset="1" stop-color="#FFE38A"/></linearGradient>
<linearGradient id="am" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2A28" stop-opacity=".55"/><stop offset=".35" stop-color="#7A3A20" stop-opacity=".28"/><stop offset="1" stop-color="#C2501E" stop-opacity=".22"/></linearGradient>
<radialGradient id="khoi"><stop offset="0" stop-color="#6C6466" stop-opacity=".75"/><stop offset="1" stop-color="#6C6466" stop-opacity="0"/></radialGradient></defs>`;
    // nền đường phố: vỉa hè lát gạch + lòng đường
    s += `<rect x="0" y="${f1(day)}" width="${w}" height="26" fill="#${mix(P.ink, "FFFFFF", 0.78)}"/>` + [...Array(Math.ceil(w / 46)).keys()].map((k) => `<line x1="${k * 46}" y1="${f1(day)}" x2="${k * 46}" y2="${f1(day + 26)}" stroke="#fff" stroke-width="2" opacity=".6"/>`).join("")
      + `<rect x="0" y="${f1(day + 26)}" width="${w}" height="12" fill="#${mix(P.ink, "FFFFFF", 0.45)}"/>`;
    const nhan = [];
    ds.forEach((x, k) => {
      const cx = cw * k + cw / 2 - 18, hh = Math.max(34, (H * x.stbh) / max), ht = (H * (x.thiet || 0)) / max, xL = cx - bw / 2, top = day - hh, mau = x.mau || MAU[k % MAU.length], T = 450 + k * 300, TF = 450 + n * 300 + 300 + k * 320;
      const dam = mix(mau, "000000", 0.28), sang = mix(mau, "FFFFFF", 0.62), fy = day - ht;
      s += `<!--L:up:${T}-->` + bong(cx, day + 4, bw * 0.8);
      // cây xanh bên trái toà (không ở toà đầu)
      if (k) { const tx = cw * k - 10; s += `<rect x="${f1(tx - 3)}" y="${f1(day - 46)}" width="6" height="46" fill="#6B4F3A"/><circle cx="${f1(tx)}" cy="${f1(day - 62)}" r="26" fill="#3F7F5E"/><circle cx="${f1(tx - 14)}" cy="${f1(day - 50)}" r="18" fill="#356F52"/><path d="M${f1(tx - 18)} ${f1(day - 78)} q14 -12 30 -2" fill="none" stroke="#7DBA92" stroke-width="5" stroke-linecap="round"/>`; }
      // thân toà + mặt tối + gờ mái
      s += `<rect x="${f1(xL)}" y="${f1(top)}" width="${f1(bw)}" height="${f1(hh)}" fill="#${mau}"/><rect x="${f1(xL + bw * 0.76)}" y="${f1(top)}" width="${f1(bw * 0.24)}" height="${f1(hh)}" fill="#${dam}" opacity=".55"/>`
        + `<rect x="${f1(xL - 6)}" y="${f1(top - 10)}" width="${f1(bw + 12)}" height="12" fill="#${dam}"/><rect x="${f1(xL - 6)}" y="${f1(top - 10)}" width="${f1(bw + 12)}" height="3" fill="#fff" opacity=".35"/>`;
      if (hh > 160) s += `<rect x="${f1(xL + bw * 0.58)}" y="${f1(top - 40)}" width="30" height="30" rx="4" fill="#${mix(P.ink, "FFFFFF", 0.55)}"/><rect x="${f1(xL + bw * 0.58 + 4)}" y="${f1(top - 10)}" width="4" height="10" fill="#${P.ink}"/><rect x="${f1(xL + bw * 0.58 + 22)}" y="${f1(top - 10)}" width="4" height="10" fill="#${P.ink}"/>`
        + `<rect x="${f1(xL + 14)}" y="${f1(top - 24)}" width="26" height="14" fill="#${mix(P.ink, "FFFFFF", 0.7)}"/><circle cx="${f1(xL + 27)}" cy="${f1(top - 17)}" r="4" fill="#${P.ink}"/>`;
      // tầng: cửa sổ khung, kính phản chiếu, bậu; ban công mỗi 4 tầng
      const fh = 34, tret = 52, so = Math.max(0, Math.floor((hh - tret - 14) / fh)), cot = bw > 120 ? 3 : 2, ow = (bw * 0.7) / cot, gap = (bw * 0.7 - ow * 0.62 * cot) / (cot + 1);
      const chay = [];
      for (let r = 0; r < so; r++) { const yy = top + 12 + r * fh;
        for (let c = 0; c < cot; c++) { const wx = xL + bw * 0.06 + gap + c * (ow * 0.62 + gap), ww = ow * 0.62, wh = fh * 0.6, cua = yy + wh * 0.5 >= fy;
          s += `<rect x="${f1(wx - 3)}" y="${f1(yy - 3)}" width="${f1(ww + 6)}" height="${f1(wh + 6)}" fill="#${sang}"/><rect x="${f1(wx)}" y="${f1(yy)}" width="${f1(ww)}" height="${f1(wh)}" fill="url(#kinh)"/>`
            + `<path d="M${f1(wx + ww * 0.15)} ${f1(yy + wh)} L${f1(wx + ww * 0.55)} ${f1(yy)}" stroke="#fff" stroke-width="3" opacity=".55"/><line x1="${f1(wx + ww / 2)}" y1="${f1(yy)}" x2="${f1(wx + ww / 2)}" y2="${f1(yy + wh)}" stroke="#${sang}" stroke-width="2"/>`
            + `<rect x="${f1(wx - 5)}" y="${f1(yy + wh + 3)}" width="${f1(ww + 10)}" height="4" fill="#${dam}"/>`;
          if (cua) chay.push([wx, yy, ww, wh]); }
        if (r % 4 === 3 && r < so - 1) s += `<rect x="${f1(xL - 4)}" y="${f1(yy + fh - 6)}" width="${f1(bw * 0.78)}" height="5" fill="#${dam}"/>` + [...Array(6).keys()].map((q) => `<line x1="${f1(xL + q * bw * 0.13)}" y1="${f1(yy + fh - 18)}" x2="${f1(xL + q * bw * 0.13)}" y2="${f1(yy + fh - 6)}" stroke="#${dam}" stroke-width="2"/>`).join("") + `<line x1="${f1(xL - 4)}" y1="${f1(yy + fh - 18)}" x2="${f1(xL + bw * 0.74)}" y2="${f1(yy + fh - 18)}" stroke="#${dam}" stroke-width="2"/>`; }
      // tầng trệt: cửa hàng có mái hiên sọc + cửa kính
      const ty = day - tret; s += `<rect x="${f1(xL)}" y="${f1(ty)}" width="${f1(bw)}" height="${tret}" fill="#${mix(mau, "000000", 0.12)}"/>`
        + [...Array(8).keys()].map((q) => `<path d="M${f1(xL - 4 + q * (bw + 8) / 8)} ${f1(ty)} h${f1((bw + 8) / 8)} l-4 14 h${f1(-(bw + 8) / 8 + 8)}Z" fill="${q % 2 ? "#fff" : "#" + P.acc}"/>`).join("")
        + `<rect x="${f1(xL + bw * 0.12)}" y="${f1(ty + 20)}" width="${f1(bw * 0.4)}" height="${tret - 20}" fill="url(#kinh)"/><rect x="${f1(xL + bw * 0.6)}" y="${f1(ty + 18)}" width="${f1(bw * 0.2)}" height="${tret - 18}" fill="#${P.ink}"/>`;
      // thước STBH (xanh) cạnh phải: đất → mái
      const xr = xL + bw + 16; s += `<path d="M${f1(xr)} ${f1(day)} V${f1(top - 10)} M${f1(xr - 7)} ${f1(top - 10)} h14 M${f1(xr - 7)} ${f1(day)} h14" stroke="#${P.acc}" stroke-width="4"/>`;
      nhan.push({ x: cx, y: top - 92, t: x.nhanStbh, b: "STBH", cls: "the-xanh", w: cw - 10, at: T + 250 });
      // chồng xu = phí (số đồng ∝ phí)
      const dong = Math.max(1, Math.round((6 * (x.phi || 0)) / phiMax)), xc = cx + Math.min(cw / 2 - 14, 120);   // số đồng ∝ phí, tối đa 6
      for (let q = 0; q < dong; q++) { const yc = day + 70 - q * 9; s += `<ellipse cx="${f1(xc)}" cy="${f1(yc + 5)}" rx="20" ry="7" fill="#${mix(P.gold, "000000", 0.3)}"/><ellipse cx="${f1(xc)}" cy="${f1(yc)}" rx="20" ry="7" fill="#${P.gold}" stroke="#${mix(P.gold, "000000", 0.2)}" stroke-width="1.5"/><ellipse cx="${f1(xc)}" cy="${f1(yc)}" rx="12" ry="4" fill="none" stroke="#FFE7A8" stroke-width="1.5"/>`; }
      nhan.push({ x: cx, y: day + 44, t: x.t, b: x.nhanPhi, cls: "ten", w: cw - 10, at: T + 250 });
      // VÙNG CHÁY (lớp riêng, hiện sau): tường ám khói, cửa sổ rực lửa, lửa liếm ở tầng cháy cao nhất, khói bốc; thước thiệt hại (cam)
      if (ht > 0) { s += `<!--L:up:${TF}--><rect x="${f1(xL)}" y="${f1(fy)}" width="${f1(bw)}" height="${f1(ht - tret * 0.3)}" fill="url(#am)"/>`;
        chay.forEach(([wx, yy, ww, wh]) => { s += `<rect x="${f1(wx)}" y="${f1(yy)}" width="${f1(ww)}" height="${f1(wh)}" fill="url(#kinhLua)"/><path d="M${f1(wx + 2)} ${f1(yy + wh)} q${f1(ww * 0.2)} ${f1(-wh * 0.8)} ${f1(ww * 0.35)} ${f1(-wh * 0.2)} q${f1(ww * 0.1)} ${f1(-wh * 0.9)} ${f1(ww * 0.3)} ${f1(-wh * 0.3)} q${f1(ww * 0.1)} ${f1(-wh * 0.6)} ${f1(ww * 0.3)} ${f1(wh * 0.5)}Z" fill="#FFF0A8" opacity=".85"/>`; });
        const top3 = chay.length ? Math.min(...chay.map((c) => c[1])) : fy;
        for (let q = 0; q < 5; q++) { const fx = xL + 8 + q * (bw - 16) / 4, fhh = 26 + R0() * 30; s += `<path d="M${f1(fx - 14)} ${f1(top3 + 4)} Q${f1(fx - 12)} ${f1(top3 - fhh * 0.5)} ${f1(fx)} ${f1(top3 - fhh)} Q${f1(fx + 4)} ${f1(top3 - fhh * 0.45)} ${f1(fx + 14)} ${f1(top3 + 4)}Z" fill="#FF7A2E"/><path d="M${f1(fx - 7)} ${f1(top3 + 4)} Q${f1(fx - 5)} ${f1(top3 - fhh * 0.3)} ${f1(fx)} ${f1(top3 - fhh * 0.6)} Q${f1(fx + 3)} ${f1(top3 - fhh * 0.25)} ${f1(fx + 7)} ${f1(top3 + 4)}Z" fill="#FFD25E"/>`; }
        for (let q = 0; q < 4; q++) s += `<circle cx="${f1(cx - 20 + q * 16 + R0() * 10)}" cy="${f1(top3 - 50 - q * 26)}" r="${f1(22 + q * 7)}" fill="url(#khoi)"/>`;
        for (let q = 0; q < 6; q++) s += `<circle cx="${f1(xL + R0() * bw)}" cy="${f1(top3 - 20 - R0() * 60)}" r="2.2" fill="#FFB347"/>`;
        const xo = xr + 10; s += `<path d="M${f1(xo)} ${f1(day)} V${f1(fy)} M${f1(xo - 7)} ${f1(fy)} h14" stroke="#E5572B" stroke-width="5"/>`;
        nhan.push(hh < 115 ? { x: xr + 26, y: fy - 66, t: x.nhanThiet, b: "thiệt hại", cls: "trai the-cam", w: 220, at: TF + 250 } : { x: cx, y: Math.max(fy + 6, top + 30), t: x.nhanThiet, b: "thiệt hại", cls: "the-cam", w: cw - 10, at: TF + 250 }); }
      s += `<!--L:fade:${T}-->`;
    });
    // người tí hon đứng nhìn ở vỉa hè (câu chuyện: tổn thất xảy ra với người thật)
    for (let q = 0; q < 9; q++) { const px = 40 + R0() * (w - 80), pc = ["3D8A87", "E07A5F", "6D8EAD", "F2C14E"][q % 4]; s += `<rect x="${f1(px - 5)}" y="${f1(day - 4)}" width="10" height="20" rx="4" fill="#${pc}" transform="translate(0 ${f1(-12)})"/><circle cx="${f1(px)}" cy="${f1(day - 22)}" r="6" fill="#F2C29B"/>`; }
    return { svg: khungSvg(w, h, P, s), nhan };
  },


  // HAI QUỸ = HAI KỸ THUẬT: trái — xô nhận phí năm nay rồi chảy ra chi trả ngay (phân bổ); phải — hũ cao xếp lớp quỹ qua từng năm, chi trả về sau (dồn tích)
  "hai-quy": (d, P, w, h) => {
    const day = h - 130, nam = d.nam || 6, nhat = mix(P.ink, "FFFFFF", 0.3); let s = "", nhan = [];
    // mặt đất hai bên + vạch chia ở giữa: hai kỹ thuật là hai "sân" riêng, đọc trái → phải theo dòng tiền
    s += `<rect x="0" y="${day}" width="${f1(w * 0.47)}" height="8" rx="4" fill="#${P.ink}" opacity=".2"/><rect x="${f1(w * 0.53)}" y="${day}" width="${f1(w * 0.47)}" height="8" rx="4" fill="#${P.ink}" opacity=".2"/>`
      + `<line x1="${f1(w / 2)}" y1="40" x2="${f1(w / 2)}" y2="${day + 60}" stroke="#${P.ink}" stroke-opacity=".18" stroke-width="4" stroke-dasharray="14 12"/>`;
    // TRÁI — PHÂN BỔ: vòi phí → xô (quỹ năm nay) → ống → nhà đang cháy được chi trả luôn
    const L = w * 0.13, xn = w * 0.36;
    s += `<!--L:up:400-->` + bong(L, day + 4, 130) + `<rect x="${f1(L - 150)}" y="${f1(day - 360)}" width="150" height="24" rx="8" fill="#${nhat}"/><rect x="${f1(L - 14)}" y="${f1(day - 362)}" width="30" height="46" rx="8" fill="#${nhat}"/><circle cx="${f1(L - 120)}" cy="${f1(day - 372)}" r="12" fill="#${P.bad}"/>`
      + `<path d="M${f1(L - 110)} ${f1(day - 250)} L${f1(L - 88)} ${f1(day - 4)} H${f1(L + 88)} L${f1(L + 110)} ${f1(day - 250)}Z" fill="#${mix(P.ink, "FFFFFF", 0.86)}" stroke="#${mix(P.ink, "FFFFFF", 0.4)}" stroke-width="6"/>`
      + `<path d="M${f1(L - 110)} ${f1(day - 250)} Q${f1(L)} ${f1(day - 340)} ${f1(L + 110)} ${f1(day - 250)}" fill="none" stroke="#${mix(P.ink, "FFFFFF", 0.4)}" stroke-width="5"/>`;
    s += `<!--L:wipe:900--><path d="M${f1(L + 1)} ${f1(day - 316)} V${f1(day - 150)}" stroke="#${P.gold}" stroke-width="16" stroke-linecap="round"/>` + [0, 1, 2].map((q) => `<ellipse cx="${f1(L + 1)}" cy="${f1(day - 290 + q * 44)}" rx="13" ry="4" fill="#FFE7A8"/>`).join("")
      + `<path d="M${f1(L - 92)} ${f1(day - 150)} H${f1(L + 92)} L${f1(L + 86)} ${f1(day - 10)} H${f1(L - 86)}Z" fill="#${P.gold}" opacity=".85"/><path d="M${f1(L - 70)} ${f1(day - 136)} H${f1(L + 40)}" stroke="#fff" stroke-opacity=".5" stroke-width="6" stroke-linecap="round"/>`;
    s += `<!--L:pop:1400-->` + vat("nha", P, xn - 120, day - 230, 240) + vat("lua", P, xn + 20, day - 300, 120);
    s += `<!--L:wipe:1900--><path d="M${f1(L + 96)} ${f1(day - 60)} C${f1(L + 200)} ${f1(day - 60)} ${f1(xn - 220)} ${f1(day - 40)} ${f1(xn - 130)} ${f1(day - 40)}" fill="none" stroke="#${P.gold}" stroke-width="18" stroke-linecap="round"/><path d="M${f1(xn - 150)} ${f1(day - 62)} L${f1(xn - 112)} ${f1(day - 40)} L${f1(xn - 150)} ${f1(day - 18)}Z" fill="#${P.gold}"/>`;
    nhan.push({ x: L - 70, y: day - 430, t: "Phí năm nay", cls: "nho", w: 240, at: 900 },
      { x: L, y: day - 120, t: "Quỹ", cls: "nho", w: 140, at: 900 },
      { x: (L + xn) / 2 + 10, y: day - 140, t: "Chi trả luôn", cls: "the-cam", w: 240, at: 1900 },
      { x: xn, y: day - 360, t: "Rủi ro xảy ra", cls: "nho", w: 240, at: 1400 });
    nhan.push({ x: w * 0.235, y: day + 26, t: "Kỹ thuật phân bổ", b: "thời hạn ngắn · rủi ro tương đối độc lập với tuổi thọ", cls: "ten", w: w * 0.44, at: 400 });
    // PHẢI — DỒN TÍCH: mỗi năm thêm một lớp phí vào bể; nhiều năm sau mới chi trả cho người đã già
    const jw = 220, jh = day - 70, Rr = w * 0.66, jx = Rr - jw / 2, ly = (jh - 30) / nam, xg = w * 0.88;
    s += `<!--L:fade:400-->` + bong(Rr, day + 4, 160) + `<path d="M${f1(jx)} ${f1(day - jh)} H${f1(jx + jw)} V${f1(day - 24)} Q${f1(jx + jw)} ${f1(day)} ${f1(jx + jw - 24)} ${f1(day)} H${f1(jx + 24)} Q${f1(jx)} ${f1(day)} ${f1(jx)} ${f1(day - 24)}Z" fill="#${mix(P.acc, "FFFFFF", 0.88)}" stroke="#${mix(P.acc, "FFFFFF", 0.35)}" stroke-width="6"/><rect x="${f1(jx + 20)}" y="${f1(day - jh - 22)}" width="${jw - 40}" height="24" rx="8" fill="#${P.ink}"/>`;
    for (let k = 0; k < nam; k++) { const yy = day - 8 - (k + 1) * ly; s += `<!--L:up:${1100 + k * 260}--><rect x="${f1(jx + 8)}" y="${f1(yy)}" width="${jw - 16}" height="${f1(ly - 4)}" rx="${k ? 3 : 14}" fill="#${mix(P.acc, "FFFFFF", 0.1 + (k % 2) * 0.14)}"/><rect x="${f1(jx + 18)}" y="${f1(yy + 6)}" width="${jw * 0.35}" height="6" rx="3" fill="#fff" opacity=".3"/>`;
      nhan.push({ x: jx - 112, y: yy + ly / 2 - 16, t: `năm ${k + 1}`, cls: "trai nho", w: 100, at: 1100 + k * 260 }); }
    const Tc = 1100 + nam * 260 + 200;
    s += `<!--L:pop:${Tc}-->` + vat("nguoi-vang", P, xg - 110, day - 230, 220);
    s += `<!--L:wipe:${Tc + 300}--><path d="M${f1(jx + jw + 8)} ${f1(day - jh + 40)} C${f1(jx + jw + 120)} ${f1(day - jh + 40)} ${f1(xg - 40)} ${f1(day - jh + 80)} ${f1(xg - 10)} ${f1(day - 250)}" fill="none" stroke="#${P.gold}" stroke-width="18" stroke-linecap="round"/><path d="M${f1(xg - 34)} ${f1(day - 266)} L${f1(xg - 8)} ${f1(day - 232)} L${f1(xg + 14)} ${f1(day - 270)}Z" fill="#${P.gold}"/>`;
    nhan.push({ x: xg, y: day - jh - 10, t: "Nhiều năm sau mới chi trả", cls: "the-cam", w: 330, at: Tc + 300 });
    nhan.push({ x: w * 0.765, y: day + 26, t: "Kỹ thuật dồn tích", b: "thời hạn dài · rủi ro gắn liền tuổi thọ con người", cls: "ten", w: w * 0.44, at: 400 });
    return { svg: khungSvg(w, h, P, s), nhan };
  },

  // CHỒNG XU = p = f + d (MINH HOẠ thành phần, không theo tỉ lệ thật): xu dưới = phí thuần f → bồi thường; xu trên = phụ phí d → chi phí nghiệp vụ của DNBH
  "chong-xu": (d, P, w, h) => {
    const cx = w * 0.3, day = h - 70, nf = d.nf || 9, nd = d.nd || 3, cw = 230, ch = 40; let s = bong(cx, day + 6, cw * 0.9), nhan = [];
    const xu = (y, mau, vien) => `<ellipse cx="${f1(cx)}" cy="${f1(y + 9)}" rx="${cw / 2}" ry="${ch / 2}" fill="#${mix(mau, "000000", 0.3)}"/><rect x="${f1(cx - cw / 2)}" y="${f1(y - 4)}" width="${cw}" height="13" fill="#${mix(mau, "000000", 0.3)}"/><ellipse cx="${f1(cx)}" cy="${f1(y - 4)}" rx="${cw / 2}" ry="${ch / 2}" fill="#${mau}" stroke="#${vien}" stroke-width="2"/><ellipse cx="${f1(cx)}" cy="${f1(y - 4)}" rx="${cw * 0.34}" ry="${ch * 0.3}" fill="none" stroke="#fff" stroke-width="2" opacity=".55"/>`;
    for (let k = 0; k < nf; k++) s += `<!--L:drop:${400 + k * 110}-->` + xu(day - 14 - k * 24, mix(P.acc, "FFFFFF", 0.15), P.acc);
    const yf = day - 14 - (nf - 1) * 24; for (let k = 0; k < nd; k++) s += `<!--L:drop:${400 + nf * 110 + 300 + k * 140}-->` + xu(yf - 24 * (k + 1), P.gold, mix(P.gold, "000000", 0.2));
    const yd = yf - 24 * nd;
    // ngoặc + mũi tên tới nơi dùng
    const xb = cx + cw / 2 + 24; s += `<!--L:wipe:${400 + nf * 110 + 300 + nd * 140 + 200}--><path d="M${f1(xb)} ${f1(day + 4)} h16 V${f1(yf - 4)} h-16" fill="none" stroke="#${P.acc}" stroke-width="5"/><path d="M${f1(xb)} ${f1(yf - 10)} h16 V${f1(yd - 6)} h-16" fill="none" stroke="#${P.gold}" stroke-width="5"/>`
      + `<path d="M${f1(xb + 22)} ${f1((day + yf) / 2)} C${f1(xb + 140)} ${f1((day + yf) / 2)} ${f1(w * 0.62)} ${f1(day - 70)} ${f1(w * 0.72)} ${f1(day - 70)}" fill="none" stroke="#${P.acc}" stroke-width="7" stroke-dasharray="16 10"/>`
      + `<path d="M${f1(xb + 22)} ${f1((yf + yd) / 2)} C${f1(xb + 140)} ${f1((yf + yd) / 2)} ${f1(w * 0.62)} ${f1(yd - 100)} ${f1(w * 0.72)} ${f1(yd - 100)}" fill="none" stroke="#${P.gold}" stroke-width="7" stroke-dasharray="16 10"/>`
      + vat("khien", P, w * 0.72, day - 150, 150) + vat("toa-dnbh", P, w * 0.72, yd - 190, 170);
    const T = 400 + nf * 110 + 300 + nd * 140 + 400;
    nhan.push({ x: cx, y: day + 20, t: "p = f + d", b: "phí bảo hiểm", cls: "ten", at: 400 });
    nhan.push({ x: xb + 40, y: (day + yf) / 2 - 22, t: "f · phí thuần", cls: "trai the-xanh", w: 300, at: T });
    nhan.push({ x: xb + 40, y: (yf + yd) / 2 - 22, t: "d · phụ phí", cls: "trai the-cam", w: 300, at: T });
    nhan.push({ x: w * 0.72 + 170, y: day - 95, t: "Chi trả, bồi thường", b: "tổn thất được BH", cls: "trai", w: 300, at: T + 300 });
    nhan.push({ x: w * 0.72 + 170, y: yd - 125, t: "Chi phí hoạt động", b: "nghiệp vụ của DNBH", cls: "trai", w: 300, at: T + 300 });
    return { svg: khungSvg(w, h, P, s), nhan };
  },

  // CẦU THANG MỤC TIÊU: n bậc đi lên, mỗi bậc một mục tiêu + vật đúng chủ đề; anh X ở bậc đầu (bắt đầu hành trình của chương)
  "cau-thang": (d, P, w, h) => {
    const bc = d.bac || [], n = bc.length, bw = w / n, day = h - 10, bh = (h - 200) / n; let s = "", nhan = [];
    bc.forEach((b, k) => { const x = k * bw, top = day - (k + 1) * bh, T = 400 + k * 380, mau = [mix(P.acc, "FFFFFF", 0.62), mix(P.acc, "FFFFFF", 0.48), P.acc, mix(P.acc, "000000", 0.15), mix(P.acc, "000000", 0.3)][k % 5];   /* bậc 1–2 sáng: chữ mực; bậc 3–5 đậm: chữ trắng (≥ 4,5 : 1) */
      s += `<!--L:up:${T}--><rect x="${f1(x)}" y="${f1(top)}" width="${f1(bw + 2)}" height="${f1(day - top)}" fill="#${mau}"/><rect x="${f1(x)}" y="${f1(top)}" width="${f1(bw + 2)}" height="10" fill="#fff" opacity=".35"/><rect x="${f1(x + bw - 14)}" y="${f1(top)}" width="14" height="${f1(day - top)}" fill="#000" opacity=".08"/>`
        + (b.ve ? vat(b.ve, P, x + bw - 150, top - 132, 130) : "");
      nhan.push({ x: x + bw / 2, y: top + 18, t: `${k + 1}. ${b.t}`, b: b.b, cls: k > 1 ? "ten trang-nen" : "ten", w: bw - 16, at: T + 200 }); });
    s += vat("anh-x-gio", P, 6, day - bh - 165, 150).replace("<svg", "<!--L:pop:300--><svg");
    return { svg: khungSvg(w, h, P, s), nhan };
  },

  // LỘ TRÌNH CHƯƠNG: con đường uốn qua n trạm (mỗi trạm = một phần), cột biển có số, vật đúng chủ đề phần; anh X ở điểm xuất phát
  "lo-trinh": (d, P, w, h) => {
    const tr = d.tram || [], n = tr.length, y0 = h - 150; let s = "", nhan = [];
    const X = (k) => 120 + (k * (w - 240)) / Math.max(1, n - 1), Y = (k) => y0 - (k % 2 ? 70 : 0);
    let path = `M0 ${f1(y0 + 40)}`; for (let k = 0; k < n; k++) path += ` S${f1(X(k) - 80)} ${f1(Y(k))} ${f1(X(k))} ${f1(Y(k))}`; path += ` S${f1(w - 40)} ${f1(Y(n - 1) - 30)} ${w} ${f1(Y(n - 1) - 30)}`;
    s += `<!--L:wipe:300--><path d="${path}" fill="none" stroke="#${mix(P.ink, "FFFFFF", 0.3)}" stroke-width="46" stroke-linecap="round"/><path d="${path}" fill="none" stroke="#FFE3B0" stroke-width="4" stroke-dasharray="22 16"/>`;
    s += vat("anh-x-gio", P, 0, y0 - 150, 140).replace("<svg", "<!--L:pop:400--><svg");
    tr.forEach((t, k) => { const x = X(k), y = Y(k), T = 800 + k * 450, mau = [P.acc, mix(P.acc, "000000", 0.2), mix(P.gold, "000000", 0.38), mix(P.ink, "FFFFFF", 0.1)][k % 4];   /* vòng số đủ tối cho chữ trắng */
      s += `<!--L:drop:${T}--><line x1="${f1(x)}" y1="${f1(y)}" x2="${f1(x)}" y2="${f1(y - 120)}" stroke="#${P.ink}" stroke-width="7"/><circle cx="${f1(x)}" cy="${f1(y - 150)}" r="36" fill="#${mau}" stroke="#fff" stroke-width="6"/>`
        + `<circle cx="${f1(x)}" cy="${f1(y)}" r="14" fill="#${P.gold}" stroke="#fff" stroke-width="5"/>` + (t.ve ? vat(t.ve, P, x - 80, y - 360, 160) : "");
      nhan.push({ x, y: y - 182, t: String(k + 1), cls: "so-tram", w: 80, at: T + 100 });
      nhan.push({ x, y: y + 34, t: t.t, b: t.b, cls: "ten", w: Math.min(360, (w - 240) / Math.max(1, n - 1) + 40), at: T + 200 }); });
    return { svg: khungSvg(w, h, P, s), nhan };
  },

  // CỘT TRỤ: mái "BHTM" đặt trên n cột — mỗi cột một nguyên tắc chung; thiếu một cột thì mái nghiêng (nền móng của hoạt động bảo hiểm)
  "cot-tru": (d, P, w, h) => {
    const ct = d.cot || [], n = ct.length, mx = 60, top = 140, day = h - 220, cw = (w - 2 * mx) / n, colw = Math.min(110, cw * 0.42); let s = "", nhan = [];
    s += `<!--L:up:300--><rect x="${mx - 30}" y="${day}" width="${w - 2 * mx + 60}" height="22" fill="#${mix(P.ink, "FFFFFF", 0.5)}"/><rect x="${mx - 50}" y="${day + 22}" width="${w - 2 * mx + 100}" height="18" fill="#${mix(P.ink, "FFFFFF", 0.35)}"/>`;
    ct.forEach((c, k) => { const cx = mx + cw * k + cw / 2, T = 600 + k * 300, x = cx - colw / 2;
      s += `<!--L:up:${T}--><rect x="${f1(x)}" y="${top + 40}" width="${f1(colw)}" height="${f1(day - top - 40)}" fill="#F4F1EA"/>` + [0.2, 0.42, 0.64].map((fx) => `<rect x="${f1(x + colw * fx)}" y="${top + 40}" width="${f1(colw * 0.06)}" height="${f1(day - top - 40)}" fill="#000" opacity=".07"/>`).join("")
        + `<rect x="${f1(x + colw * 0.8)}" y="${top + 40}" width="${f1(colw * 0.2)}" height="${f1(day - top - 40)}" fill="#000" opacity=".09"/>`
        + `<rect x="${f1(x - 10)}" y="${top + 30}" width="${f1(colw + 20)}" height="16" fill="#${mix(P.gold, "FFFFFF", 0.2)}"/><rect x="${f1(x - 10)}" y="${f1(day - 14)}" width="${f1(colw + 20)}" height="14" fill="#${mix(P.gold, "FFFFFF", 0.2)}"/>`
        + `<circle cx="${f1(cx)}" cy="${f1(top + 100)}" r="30" fill="#${P.acc}"/>`
        + (c.ve ? `<circle cx="${f1(cx + 4)}" cy="${f1(top + 254)}" r="84" fill="#000" opacity=".1"/><circle cx="${f1(cx)}" cy="${f1(top + 250)}" r="84" fill="#FFFDF7" stroke="#${mix(P.gold, "FFFFFF", 0.2)}" stroke-width="8"/>` + vat(c.ve, P, cx - 70, top + 180, 140) : "");
      nhan.push({ x: cx, y: top + 78, t: String(k + 1), cls: "so-tram nho-tron", w: 70, at: T + 100 });
      nhan.push({ x: cx, y: day + 52, t: c.t, b: c.b, cls: "ten", w: cw - 4, at: T + 200 }); });
    s += `<!--L:drop:${600 + n * 300 + 200}--><path d="M${mx - 40} ${top + 32} L${w / 2} ${top - 70} L${w - mx + 40} ${top + 32}Z" fill="#${P.acc}"/><path d="M${w / 2} ${top - 70} L${w - mx + 40} ${top + 32} H${w / 2}Z" fill="#000" opacity=".12"/><rect x="${mx - 50}" y="${top + 26}" width="${w - 2 * mx + 100}" height="16" fill="#${mix(P.acc, "000000", 0.25)}"/>`;
    nhan.push({ x: w / 2, y: top - 22, t: d.mai || "Bảo hiểm thương mại", cls: "trang", w: 600, at: 600 + n * 300 + 400 });
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
  // CÂY PHÂN LOẠI: thân = khái niệm gốc (biển gỗ đóng trên thân), mỗi cành lớn = một nhóm (biển treo), mỗi quả = một loại; nhãn quả ghi slide giảng loại đó
  "cay-phan-loai": (d, P, w, h) => {
    const cn = d.canh || [], n = cn.length, day = h - 24, cx = w / 2, fy = h * 0.5, R = rnd(11); let s = "", nhan = [];
    const nau = "6B4A2E", nauT = "4E3420", la = [mix(P.acc, "FFFFFF", 0.28), mix(P.acc, "FFFFFF", 0.45), P.acc, mix(P.acc, "000000", 0.18)];
    // rễ + thân
    s += `<!--L:up:300-->` + bong(cx, day + 4, 260) + [-1, 1].map((k) => `<path d="M${f1(cx + k * 30)} ${day - 30} Q${f1(cx + k * 90)} ${day - 4} ${f1(cx + k * 170)} ${day + 2}" fill="none" stroke="#${nauT}" stroke-width="20" stroke-linecap="round"/>`).join("")
      + `<path d="M${f1(cx - 62)} ${day} C${f1(cx - 40)} ${f1(day - 120)} ${f1(cx - 46)} ${f1(fy + 60)} ${f1(cx - 30)} ${f1(fy)} L${f1(cx + 30)} ${f1(fy)} C${f1(cx + 46)} ${f1(fy + 60)} ${f1(cx + 40)} ${f1(day - 120)} ${f1(cx + 62)} ${day}Z" fill="#${nau}"/>`
      + `<path d="M${f1(cx + 8)} ${f1(fy + 10)} C${f1(cx + 26)} ${f1(fy + 90)} ${f1(cx + 22)} ${f1(day - 100)} ${f1(cx + 44)} ${day}" fill="none" stroke="#${nauT}" stroke-width="10" opacity=".6"/>`
      + `<rect x="${f1(cx - 175)}" y="${f1(day - 150)}" width="350" height="74" rx="10" fill="#${mix(nau, "FFFFFF", 0.12)}" stroke="#${nauT}" stroke-width="5"/><circle cx="${f1(cx - 155)}" cy="${f1(day - 113)}" r="6" fill="#${nauT}"/><circle cx="${f1(cx + 155)}" cy="${f1(day - 113)}" r="6" fill="#${nauT}"/>`;
    nhan.push({ x: cx, y: day - 133, t: d.goc || "Gốc", cls: "trang", w: 330, at: 500 });
    cn.forEach((c, k) => { const T = 900 + k * 1100, dir = n === 1 ? 0 : k / (n - 1) * 2 - 1, tx = cx + dir * w * 0.27, ty = h * 0.24, qua = c.qua || [];
      // cành
      let g = `<!--L:wipe:${T}--><path d="M${f1(cx + dir * 10)} ${f1(fy + 20)} C${f1(cx + dir * 60)} ${f1(fy - 60)} ${f1(tx - dir * 120)} ${f1(ty + 120)} ${f1(tx)} ${f1(ty + 40)}" fill="none" stroke="#${nau}" stroke-width="38" stroke-linecap="round"/>`;
      // tán lá: cụm tròn nhiều sắc, viền sáng phía nguồn sáng
      g += `<!--L:zoom:${T + 300}-->`; const R2 = rnd(7 + k * 13); for (let j = 0; j < 20; j++) { const a = R2() * Math.PI * 2, rr = 40 + R2() * 56, x = tx + Math.cos(a) * (40 + R2() * 170), y = ty + Math.sin(a) * (20 + R2() * 42), m = la[j % 4];
        g += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(rr)}" fill="#${m}"/><path d="M${f1(x - rr * 0.6)} ${f1(y - rr * 0.7)} Q${f1(x)} ${f1(y - rr * 1.02)} ${f1(x + rr * 0.6)} ${f1(y - rr * 0.7)}" fill="none" stroke="#fff" stroke-width="5" opacity=".28" stroke-linecap="round"/>`; }
      g += `<rect x="${f1(tx - 180)}" y="${f1(ty - 36)}" width="360" height="72" rx="36" fill="#${mix(P.acc, "000000", 0.3)}" stroke="#fff" stroke-width="5"/>`;
      s += g; nhan.push({ x: tx, y: ty - 20, t: c.t, cls: "trang", w: 340, at: T + 500 });
      if (c.b) nhan.push({ x: tx, y: ty + 52, t: c.b, cls: "nho trang-nen", w: 320, at: T + 500 });
      // quả: treo dưới tán, cuống + lá nhỏ + điểm sáng
      qua.forEach((q, j) => { const qx = tx + (qua.length === 1 ? 0 : (j / (qua.length - 1) * 2 - 1) * 175), qy = h * 0.47 + (j % 2) * 14, TT = T + 700 + j * 250, rq = 44;
        s += `<!--L:drop:${TT}--><path d="M${f1(qx)} ${f1(ty + 90)} Q${f1(qx + 10)} ${f1(qy - 60)} ${f1(qx)} ${f1(qy - rq)}" fill="none" stroke="#${nauT}" stroke-width="6"/><path d="M${f1(qx)} ${f1(qy - rq - 6)} q24 -26 48 -10 q-22 20 -48 10Z" fill="#${la[3]}"/>`
          + `<circle cx="${f1(qx)}" cy="${f1(qy)}" r="${rq}" fill="#${mix(P.gold, "000000", 0.34)}"/><circle cx="${f1(qx + 10)}" cy="${f1(qy + 10)}" r="${rq}" fill="#000" opacity=".1"/><circle cx="${f1(qx - 3)}" cy="${f1(qy - 3)}" r="${rq - 6}" fill="#${mix(P.gold, "000000", 0.3)}"/><ellipse cx="${f1(qx - 15)}" cy="${f1(qy - 16)}" rx="12" ry="8" fill="#fff" opacity=".55"/>`;
        nhan.push({ x: qx, y: qy - 20, t: String(q.so ?? ""), cls: "so-tram nho-tron", w: 70, at: TT + 100 });
        nhan.push({ x: qx, y: qy + rq + 14, t: q.t, b: q.b, cls: "ten", w: 330, at: TT + 150 }); }); });
    return { svg: khungSvg(w, h, P, s), nhan };
  },
  // BA TẬP HỒ SƠ: mỗi tập (tab màu = nhóm) chứa đúng số tờ của nhóm, tờ thò lên khỏi mép; danh sách đánh số liên tục 1..n trên mặt tập — đếm được đủ số tài liệu
  "ho-so": (d, P, w, h) => {
    const tp = d.tap || [], n = tp.length, gap = 46, fw = (w - gap * (n - 1)) / n, top = 64, mat = 250, day = h - 16, R = rnd(5); let s = "", nhan = [], so = 0;
    const MAU = [P.acc, mix(P.gold, "000000", 0.38), mix(P.ink, "FFFFFF", 0.12)];
    tp.forEach((t, k) => { const x = k * (fw + gap), T = 300 + k * 900, m = MAU[k % 3], gs = t.giay || [];
      s += `<!--L:up:${T}-->` + bong(x + fw / 2, day + 4, fw * 0.55)
        + `<path d="M${f1(x)} ${top + 50} H${f1(x + 26)} L${f1(x + 46)} ${top} H${f1(x + 336)} L${f1(x + 356)} ${top + 50} H${f1(x + fw)} V${f1(day)} H${f1(x)}Z" fill="#${m}"/>`
        + `<rect x="${f1(x)}" y="${top + 50}" width="${f1(fw)}" height="10" fill="#000" opacity=".12"/>`;
      nhan.push({ x: x + 191, y: top + 8, t: t.t, cls: "trang nho", w: 300, at: T + 100 });
      // các tờ giấy, lệch nhẹ như được xếp tay
      let g = `<!--L:drop:${T + 300}-->`; gs.forEach((ten, j) => { const px = x + 30 + j * 22, py = top + 82 + j * 26, pw = fw - 60 - (gs.length - 1) * 22, rot = (R() - 0.5) * 3;
        g += `<g transform="rotate(${rot.toFixed(2)} ${f1(px + pw / 2)} ${f1(py + 100)})"><rect x="${f1(px + 5)}" y="${f1(py + 5)}" width="${f1(pw)}" height="${mat}" fill="#000" opacity=".1"/><rect x="${f1(px)}" y="${f1(py)}" width="${f1(pw)}" height="${mat}" fill="#FFFDF7" stroke="#${mix(P.ink, "FFFFFF", 0.75)}" stroke-width="2"/>`
          + `<rect x="${f1(px + 22)}" y="${f1(py + 18)}" width="${f1(pw * 0.42)}" height="10" rx="5" fill="#${m}"/>` + [0, 1].map((r) => `<rect x="${f1(px + 22)}" y="${f1(py + 40 + r * 16)}" width="${f1(pw * (0.78 - r * 0.2))}" height="6" rx="3" fill="#${mix(P.ink, "FFFFFF", 0.7)}"/>`).join("")
          + (/chứng nhận/i.test(ten) ? `<circle cx="${f1(px + pw - 46)}" cy="${f1(py + 40)}" r="22" fill="none" stroke="#${P.bad}" stroke-width="4" opacity=".75"/><circle cx="${f1(px + pw - 46)}" cy="${f1(py + 40)}" r="13" fill="none" stroke="#${P.bad}" stroke-width="2" opacity=".75"/>` : "")
          + (/hoá đơn|thu phí/i.test(ten) ? `<text x="${f1(px + pw - 54)}" y="${f1(py + 52)}" font-family="Arial" font-weight="700" font-size="30" fill="#${P.gold}">₫</text>` : "") + `</g>`; });
      s += g;
      // mặt trước tập: danh sách đánh số
      const mt = top + 82 + gs.length * 26 + 70;
      s += `<!--L:up:${T + 600}--><path d="M${f1(x - 8)} ${f1(mt)} H${f1(x + fw + 8)} L${f1(x + fw)} ${f1(day)} H${f1(x)}Z" fill="#${mix(m, "FFFFFF", 0.86)}"/><rect x="${f1(x - 8)}" y="${f1(mt)}" width="${f1(fw + 16)}" height="8" fill="#${m}"/>`
        + `<rect x="${f1(x + fw - 70)}" y="${f1(mt - 30)}" width="16" height="70" rx="8" fill="none" stroke="#${mix(P.ink, "FFFFFF", 0.4)}" stroke-width="5"/>`;
      gs.forEach((ten, j) => { so++; const ly = mt + 34 + j * 66;
        s += `<circle cx="${f1(x + 46)}" cy="${f1(ly + 18)}" r="24" fill="#${m}"/>`;
        nhan.push({ x: x + 46, y: ly + 2, t: String(so), cls: "so-tram nho-tron", w: 60, at: T + 700 + j * 120 });
        nhan.push({ x: x + 84, y: ly + 2, t: ten, cls: "trai nho", w: fw - 96, at: T + 700 + j * 120 }); }); });
    return { svg: khungSvg(w, h, P, s), nhan };
  },
  // HAI NHÓM (BH bắt buộc / tự nguyện): trái — biển luật ghi điều luật định, MỌI người (kể cả DNBH) đều dưới ô; phải — chỉ người có nhu cầu mới cầm ô, người khác đang cân nhắc
  "hai-nhom": (d, P, w, h) => {
    const day = h - 110, half = w / 2; let s = "", nhan = [];
    const AO = ["anh-x", "nguoi-vang", "nguoi-cam", "anh-x", "nguoi-vang"];
    s += `<rect x="0" y="${day}" width="${f1(w * 0.47)}" height="8" rx="4" fill="#${P.ink}" opacity=".2"/><rect x="${f1(w * 0.53)}" y="${day}" width="${f1(w * 0.47)}" height="8" rx="4" fill="#${P.ink}" opacity=".2"/>`
      + `<line x1="${f1(half)}" y1="20" x2="${f1(half)}" y2="${day + 20}" stroke="#${P.ink}" stroke-opacity=".18" stroke-width="4" stroke-dasharray="14 12"/>`;
    const nguoi = (x, k, o, T, sz0) => { const sau = k % 2 === 1, sz = sau ? sz0 * 0.86 : sz0, yd = sau ? day - 26 : day;   /* hàng sau nhỏ hơn, đứng lùi: có chiều sâu, không xếp hàng đều */
      return `<!--L:up:${T}-->` + bong(x, yd + 2, sz * 0.32) + vat(AO[k % 5], P, x - sz / 2, yd - sz * 0.92, sz) + (o ? vat("o-mua", P, x - sz * 0.2, yd - sz * 1.2, sz * 0.7) : ""); };
    // TRÁI: biển luật + DNBH phía sau + 4 người đều có ô
    const bx = w * 0.02, bw = w * 0.18, by = 40, bh = 300;
    s += `<!--L:drop:300--><rect x="${f1(bx + bw / 2 - 8)}" y="${by + bh}" width="16" height="${f1(day - by - bh)}" fill="#${mix(P.ink, "FFFFFF", 0.35)}"/><rect x="${f1(bx)}" y="${by}" width="${f1(bw)}" height="${bh}" rx="16" fill="#${P.ink}"/><rect x="${f1(bx + 10)}" y="${by + 10}" width="${f1(bw - 20)}" height="${bh - 20}" rx="10" fill="none" stroke="#${P.gold}" stroke-width="3"/>`
      + vat("can-can", P, bx + bw / 2 - 40, by + 18, 80);
    const LUAT = d.luat || [];
    LUAT.forEach((t, j) => { s += `<rect x="${f1(bx + 28)}" y="${f1(by + 122 + j * 56)}" width="26" height="26" rx="6" fill="#${P.gold}"/><path d="M${f1(bx + 33)} ${f1(by + 135 + j * 56)} l6 6 l10 -12" fill="none" stroke="#${P.ink}" stroke-width="4" stroke-linecap="round"/>`;
      nhan.push({ x: bx + 66, y: by + 116 + j * 56, t: t, cls: "trai nho trang", w: bw - 76, at: 500 + j * 150 }); });
    s += `<!--L:pop:900-->` + bong(w * 0.39, day - 30, 110) + vat("toa-dnbh", P, w * 0.39 - 130, day - 300, 260);
    [0.25, 0.31, 0.44].forEach((fx, k) => { s += nguoi(w * fx, [0, 1, 2][k] * 2 % 5 === 2 ? 2 : k * 2, true, 1200 + k * 200, 190); });
    nhan.push({ x: w * 0.39, y: day - 340, t: "DNBH cũng có nghĩa vụ", cls: "nho", w: 300, at: 900 });
    // PHẢI: 5 người, chỉ 2 cầm ô; người còn lại có bong bóng suy nghĩ
    const xs = [0.59, 0.67, 0.75, 0.83, 0.91], co = [true, false, true, false, false];
    xs.forEach((fx, k) => { const x = w * fx, T = 1900 + k * 200; s += nguoi(x, k + 1, co[k], T, 190);
      if (!co[k]) s += `<circle cx="${f1(x + 38)}" cy="${f1(day - 228)}" r="9" fill="#fff" stroke="#${mix(P.ink, "FFFFFF", 0.5)}" stroke-width="3"/><circle cx="${f1(x + 54)}" cy="${f1(day - 256)}" r="13" fill="#fff" stroke="#${mix(P.ink, "FFFFFF", 0.5)}" stroke-width="3"/><circle cx="${f1(x + 40)}" cy="${f1(day - 318)}" r="44" fill="#fff" stroke="#${mix(P.ink, "FFFFFF", 0.5)}" stroke-width="3"/>` + vat("o-mua", P, x + 10, day - 350, 60); });
    nhan.push({ x: w * 0.235, y: day + 22, t: d.trai?.t || "", b: d.trai?.b, cls: "ten", w: w * 0.45, at: 300 });
    nhan.push({ x: w * 0.75, y: day + 22, t: d.phai?.t || "", b: d.phai?.b, cls: "ten", w: w * 0.45, at: 1900 });
    return { svg: khungSvg(w, h, P, s), nhan };
  },
  // HAI THƯỚC (GTBH / STBH, minh hoạ): thước xanh đo chính ngôi nhà = giá trị của đối tượng; thước cam = mức ghi trong hợp đồng = giới hạn trách nhiệm của DNBH
  "hai-thuoc": (d, P, w, h) => {
    const day = h - 40, cx = w * 0.45, hs = Math.min(500, day - 30), top = day - hs * 0.67, muc = d.muc ?? 0.62, yS = day - (day - top) * muc, xa = cx - hs / 2 - 70, xb = cx + hs / 2 + 70, CAM = "D9542A"; let s = "", nhan = [];
    s += `<rect x="0" y="${day}" width="${w}" height="8" rx="4" fill="#${P.ink}" opacity=".2"/>`;
    s += `<!--L:up:300-->` + bong(cx, day + 4, hs * 0.5) + vat("nha", P, cx - hs / 2, day - hs * 0.88, hs);
    const thuoc = (x, y1, y2, m) => `<line x1="${f1(x)}" y1="${f1(y1)}" x2="${f1(x)}" y2="${f1(y2)}" stroke="#${m}" stroke-width="8"/>` + [y1, y2].map((y) => `<line x1="${f1(x - 22)}" y1="${f1(y)}" x2="${f1(x + 22)}" y2="${f1(y)}" stroke="#${m}" stroke-width="8" stroke-linecap="round"/>`).join("")
      + Array.from({ length: 9 }, (_, i) => { const y = y2 + ((y1 - y2) * (i + 1)) / 10; return `<line x1="${f1(x - 10)}" y1="${f1(y)}" x2="${f1(x + 10)}" y2="${f1(y)}" stroke="#${m}" stroke-width="4"/>`; }).join("");
    s += `<!--L:wipe:900-->` + thuoc(xa, day, top, P.acc) + `<line x1="${f1(xa + 22)}" y1="${f1(top)}" x2="${f1(cx)}" y2="${f1(top)}" stroke="#${P.acc}" stroke-width="3" stroke-dasharray="10 8"/>`;
    s += `<!--L:wipe:1700-->` + thuoc(xb, day, yS, CAM) + `<line x1="${f1(cx - hs * 0.42)}" y1="${f1(yS)}" x2="${f1(xb - 22)}" y2="${f1(yS)}" stroke="#${CAM}" stroke-width="4" stroke-dasharray="14 10"/>`
      + vat("hop-dong", P, xb + 60, yS - 70, 150);
    nhan.push({ x: xa - 180, y: (day + top) / 2 - 60, t: "GTBH", b: d.tA || "giá trị của đối tượng được BH", cls: "the-xanh", w: 300, at: 1000 });
    nhan.push({ x: xb + 216, y: yS - 70, t: "STBH", b: "ghi trong HĐBH", cls: "the-cam trai", w: 300, at: 1800 });
    nhan.push({ x: xb + 216, y: yS + 40, t: d.tB || "giới hạn trách nhiệm của người BH", cls: "trai nho", w: 360, at: 1900 });
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
