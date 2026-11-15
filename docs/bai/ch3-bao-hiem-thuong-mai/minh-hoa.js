// MINH HOẠ PHẲNG CỦA BÀI Chương 3 — vẽ bằng code (không ảnh AI), một phong cách:
//   khối tô phẳng, không viền, mặt sáng / mặt tối cùng họ màu, góc bo nhẹ; chỉ dùng màu trong P (= thiet-ke/phong-cach.json).
// Mỗi hàm trả về chuỗi SVG theo toạ độ tuyệt đối của slide 1920×1080, để ghép nhiều vật vào MỘT lớp hình.
const fs = require("fs"), path = require("path");

// Bảng màu: 3 họ (xanh chủ, vàng nhấn, đỏ rủi ro) × sắc đậm → nhạt + trung tính
const P = {
  nen: "#FBF7EF", trang: "#FFFFFF", muc: "#1B2A28", phu: "#3F4B48", ke: "#DCD3C4",
  x1: "#0E4F49", x2: "#2C7A6C", x3: "#8EC3B6", x4: "#DDECE7",
  v1: "#946512", v2: "#E2A52E", v3: "#F3D27E", v4: "#F8ECCD",
  d1: "#B13A2E", d0: "#8F2A21", d4: "#F6DDD7", da: "#E8B48F", da2: "#B97C5E",
};
const f1 = (n) => +n.toFixed(1);

// ---------- icon Tabler (MIT): nét (asset/tabler) và tô đặc (asset/tabler-dac) ----------
const than = (f) => fs.readFileSync(f, "utf8").replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/<path stroke="none" d="M0 0h24v24H0z" fill="none"\s*\/>/, "");
const iconNet = (D, ten, cx, cy, co, mau, net = 3) => `<g transform="translate(${f1(cx - co / 2)} ${f1(cy - co / 2)}) scale(${co / 24})" fill="none" stroke="${mau}" stroke-width="${((net * 24) / co).toFixed(3)}" stroke-linecap="round" stroke-linejoin="round">${than(path.join(D, "asset", "tabler", ten + ".svg"))}</g>`;
const iconDac = (D, ten, cx, cy, co, mau) => `<g transform="translate(${f1(cx - co / 2)} ${f1(cy - co / 2)}) scale(${co / 24})" fill="${mau}" stroke="none">${than(path.join(D, "asset", "tabler-dac", ten + ".svg")).replace(/currentColor/g, mau)}</g>`;

// ---------- hoạ tiết phụ ----------
const cham = (x, y, cot, hang, gap, r, mau) => { let s = ""; for (let i = 0; i < cot; i++) for (let j = 0; j < hang; j++) s += `<circle cx="${x + i * gap}" cy="${y + j * gap}" r="${r}" fill="${mau}"/>`; return s; };
const sao = (cx, cy, r, mau = P.v2) => `<path transform="translate(${cx} ${cy}) scale(${r})" d="M0 -1 Q0.12 -0.12 1 0 Q0.12 0.12 0 1 Q-0.12 0.12 -1 0 Q-0.12 -0.12 0 -1 Z" fill="${mau}"/>`;
const giot = (cx, cy, r, mau = P.x3, nghieng = 18) => `<path transform="translate(${cx} ${cy}) rotate(${nghieng}) scale(${r})" d="M0 -1.6 Q0.62 -0.5 0.62 0.12 A0.62 0.62 0 1 1 -0.62 0.12 Q-0.62 -0.5 0 -1.6 Z" fill="${mau}"/>`;

// ---------- vật ----------
// ô (dù) — biểu tượng "che chắn rủi ro"; cx, đỉnh, bề rộng tán
function o(cx, top, w, { m1 = P.x1, m2 = P.x2, can = 0 } = {}) {
  const h = w * 0.42, L = cx - w / 2, yb = top + h, n = 6, seg = w / n; let s = "";
  if (can) s += `<path d="M${cx} ${yb} V${yb + can} q0 ${w * 0.09} ${-w * 0.09} ${w * 0.09} q${-w * 0.07} 0 ${-w * 0.07} ${-w * 0.07}" fill="none" stroke="${P.muc}" stroke-width="${f1(w * 0.028)}" stroke-linecap="round"/>`;
  for (let i = 0; i < n; i++) {
    const a = L + i * seg, b = a + seg, m = (a + b) / 2, ca = i === 0 ? top : top + h * 0.16, cb = i === n - 1 ? top : top + h * 0.16;
    s += `<path d="M${cx} ${top} Q${f1(a)} ${f1(ca)} ${f1(a)} ${f1(yb)} Q${f1(m)} ${f1(yb - seg * 0.32)} ${f1(b)} ${f1(yb)} Q${f1(b)} ${f1(cb)} ${cx} ${top} Z" fill="${i % 2 ? m2 : m1}"/>`;
  }
  return s + `<rect x="${cx - 7}" y="${top - 30}" width="14" height="34" rx="7" fill="${P.muc}"/>`;
}

// ngôi nhà (x trái, y đỉnh mái, w rộng thân)
function nha(x, y, w, { mai = P.d1, than: t = P.v4, bong = P.v3 } = {}) {
  const hm = w * 0.42, yb = y + hm, hb = w * 0.62;
  return `<rect x="${f1(x + w * 0.7)}" y="${f1(y + hm * 0.18)}" width="${f1(w * 0.12)}" height="${f1(hm * 0.6)}" fill="${P.v1}"/>`
    + `<rect x="${x}" y="${f1(yb)}" width="${w}" height="${f1(hb)}" fill="${t}"/><rect x="${f1(x + w * 0.76)}" y="${f1(yb)}" width="${f1(w * 0.24)}" height="${f1(hb)}" fill="${bong}"/>`
    + `<path d="M${f1(x - w * 0.1)} ${f1(yb + 4)} L${f1(x + w / 2)} ${y} L${f1(x + w * 1.1)} ${f1(yb + 4)} Z" fill="${mai}" stroke="${mai}" stroke-width="10" stroke-linejoin="round"/>`
    + `<rect x="${f1(x + w * 0.4)}" y="${f1(yb + hb * 0.4)}" width="${f1(w * 0.2)}" height="${f1(hb * 0.6)}" rx="6" fill="${P.x1}"/><circle cx="${f1(x + w * 0.56)}" cy="${f1(yb + hb * 0.72)}" r="${f1(w * 0.016)}" fill="${P.v2}"/>`
    + [0.1, 0.7].map((k) => `<rect x="${f1(x + w * k)}" y="${f1(yb + hb * 0.2)}" width="${f1(w * 0.2)}" height="${f1(w * 0.18)}" rx="4" fill="${P.x3}"/><path d="M${f1(x + w * (k + 0.1))} ${f1(yb + hb * 0.2)} v${f1(w * 0.18)} M${f1(x + w * k)} ${f1(yb + hb * 0.2 + w * 0.09)} h${f1(w * 0.2)}" stroke="${P.nen}" stroke-width="5"/>`).join("");
}

// chồng xu (x trái, đáy, số đồng, bề rộng)
function xu(x, by, n, w) {
  const ry = w * 0.17, t = w * 0.15, cx = x + w / 2; let s = "";
  for (let i = 0; i < n; i++) { const y = by - (i + 1) * t; s += `<ellipse cx="${cx}" cy="${f1(y + t)}" rx="${w / 2}" ry="${f1(ry)}" fill="${P.v1}"/><rect x="${x}" y="${f1(y)}" width="${w}" height="${f1(t)}" fill="${P.v1}"/><path d="M${x} ${f1(y + t * 0.5)} A${w / 2} ${f1(ry)} 0 0 0 ${x + w} ${f1(y + t * 0.5)}" fill="none" stroke="${P.v2}" stroke-width="3"/><ellipse cx="${cx}" cy="${f1(y)}" rx="${w / 2}" ry="${f1(ry)}" fill="${P.v2}"/>`; }
  const yt = by - n * t;
  return s + `<ellipse cx="${cx}" cy="${f1(yt)}" rx="${f1(w * 0.33)}" ry="${f1(ry * 0.62)}" fill="none" stroke="${P.v3}" stroke-width="${f1(w * 0.04)}"/>`;
}

// khiên có dấu tích (tâm, cỡ)
function khien(cx, cy, s, { trai = P.x1, phai = P.x2, dau = P.trang } = {}) {
  const k = (a) => f1(a * s);
  return `<path d="M${cx} ${cy - k(0.5)} L${cx - k(0.42)} ${cy - k(0.36)} L${cx - k(0.42)} ${cy + k(0.02)} Q${cx - k(0.4)} ${cy + k(0.36)} ${cx} ${cy + k(0.52)} Z" fill="${trai}"/>`
    + `<path d="M${cx} ${cy - k(0.5)} L${cx + k(0.42)} ${cy - k(0.36)} L${cx + k(0.42)} ${cy + k(0.02)} Q${cx + k(0.4)} ${cy + k(0.36)} ${cx} ${cy + k(0.52)} Z" fill="${phai}"/>`
    + `<path d="M${cx - k(0.18)} ${cy + k(0.01)} L${cx - k(0.04)} ${cy + k(0.15)} L${cx + k(0.2)} ${cy - k(0.12)}" fill="none" stroke="${dau}" stroke-width="${k(0.08)}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// hợp đồng có dấu đỏ (x, y góc trái trên, w rộng)
function hopDong(x, y, w, { giay = P.trang, gap = P.ke, bar = true } = {}) {
  const h = w * 1.3, g = w * 0.2, k = (a) => f1(a);
  let s = `<path d="M${x} ${y} H${k(x + w - g)} L${x + w} ${k(y + g)} V${k(y + h)} H${x} Z" fill="${giay}"/><path d="M${k(x + w - g)} ${y} V${k(y + g)} H${x + w} Z" fill="${gap}"/>`
    + (bar ? `<rect x="${k(x + w * 0.14)}" y="${k(y + h * 0.11)}" width="${k(w * 0.48)}" height="${k(h * 0.05)}" rx="3" fill="${P.x1}"/>` : "");
  for (let i = 0; i < 5; i++) s += `<rect x="${k(x + w * 0.14)}" y="${k(y + h * (0.25 + i * 0.085))}" width="${k(w * (i % 2 ? 0.58 : 0.72))}" height="${k(h * 0.028)}" rx="2" fill="${gap}"/>`;
  const sx = x + w * 0.7, sy = y + h * 0.8, r = w * 0.15;
  s += `<path d="M${k(x + w * 0.14)} ${k(y + h * 0.84)} q${k(w * 0.06)} ${k(-w * 0.1)} ${k(w * 0.1)} 0 t${k(w * 0.1)} 0 t${k(w * 0.1)} 0" fill="none" stroke="${P.x2}" stroke-width="${k(w * 0.022)}" stroke-linecap="round"/>`
    + `<path d="M${k(sx - r * 0.6)} ${k(sy)} l${k(-r * 0.25)} ${k(r * 1.5)} l${k(r * 0.45)} ${k(-r * 0.3)} l${k(r * 0.25)} ${k(r * 0.42)} Z M${k(sx + r * 0.6)} ${k(sy)} l${k(r * 0.25)} ${k(r * 1.5)} l${k(-r * 0.45)} ${k(-r * 0.3)} l${k(-r * 0.25)} ${k(r * 0.42)} Z" fill="${P.d1}"/>`
    + `<circle cx="${k(sx)}" cy="${k(sy)}" r="${k(r)}" fill="${P.d1}"/><circle cx="${k(sx)}" cy="${k(sy)}" r="${k(r * 0.66)}" fill="none" stroke="${P.v3}" stroke-width="${k(r * 0.12)}"/>` + sao(k(sx), k(sy), k(r * 0.38), P.v3);
  return s;
}

// mặt tiền có cột (cx, đáy, w, số cột) — toà nhà DNBH (4 cột) hoặc "năm nguyên tắc" (5 cột)
function matTien(cx, by, w, n = 4, { mai = P.x1, mai2 = P.x2, cot = P.trang, bong = P.x4, bac = P.x3, cao = 0.5 } = {}) {
  const k = (a) => f1(a), st = w * 0.05, hc = w * cao, top = by - 3 * st - hc, cw = w * (n > 4 ? 0.09 : 0.11), L = cx - w * 0.42, R = cx + w * 0.42, gap = (R - L - n * cw) / (n - 1);
  let s = [0, 1, 2].map((i) => `<rect x="${k(cx - w / 2 + i * w * 0.03)}" y="${k(by - (i + 1) * st)}" width="${k(w - i * w * 0.06)}" height="${k(st + 1)}" fill="${i % 2 ? bong : bac}"/>`).join("");
  for (let i = 0; i < n; i++) { const x = L + i * (cw + gap);
    s += `<rect x="${k(x)}" y="${k(top)}" width="${k(cw)}" height="${k(hc)}" fill="${cot}"/><rect x="${k(x + cw * 0.62)}" y="${k(top)}" width="${k(cw * 0.38)}" height="${k(hc)}" fill="${bong}"/>`
      + `<rect x="${k(x - cw * 0.16)}" y="${k(top)}" width="${k(cw * 1.32)}" height="${k(st * 0.6)}" fill="${bac}"/><rect x="${k(x - cw * 0.16)}" y="${k(by - 3 * st - st * 0.6)}" width="${k(cw * 1.32)}" height="${k(st * 0.6)}" fill="${bac}"/>`; }
  const e = top - w * 0.07;
  return s + `<rect x="${k(cx - w * 0.47)}" y="${k(e)}" width="${k(w * 0.94)}" height="${k(w * 0.07)}" fill="${mai2}"/>`
    + `<path d="M${k(cx - w * 0.5)} ${k(e)} L${cx} ${k(e - w * 0.24)} L${k(cx + w * 0.5)} ${k(e)} Z" fill="${mai}" stroke="${mai}" stroke-width="8" stroke-linejoin="round"/>`
    + `<path d="M${k(cx - w * 0.32)} ${k(e - w * 0.035)} L${cx} ${k(e - w * 0.18)} L${k(cx + w * 0.32)} ${k(e - w * 0.035)} Z" fill="${mai2}"/>`;
}

// đồng hồ cát (tâm, cao)
function dongHo(cx, cy, h, { khung = P.x1, kinh = P.x4, cat = P.v2 } = {}) {
  const w = h * 0.62, t = h * 0.08, k = (a) => f1(a), y0 = cy - h / 2, y1 = cy + h / 2;
  return `<path d="M${k(cx - w * 0.4)} ${k(y0 + t)} H${k(cx + w * 0.4)} L${k(cx + w * 0.07)} ${cy} L${k(cx + w * 0.4)} ${k(y1 - t)} H${k(cx - w * 0.4)} L${k(cx - w * 0.07)} ${cy} Z" fill="${kinh}"/>`
    + `<path d="M${k(cx - w * 0.24)} ${k(cy - h * 0.15)} H${k(cx + w * 0.24)} L${cx} ${k(cy - h * 0.01)} Z" fill="${cat}"/><rect x="${k(cx - 2.5)}" y="${cy}" width="5" height="${k(h * 0.3)}" fill="${cat}"/>`
    + `<path d="M${k(cx - w * 0.37)} ${k(y1 - t)} Q${cx} ${k(cy + h * 0.1)} ${k(cx + w * 0.37)} ${k(y1 - t)} Z" fill="${cat}"/>`
    + `<rect x="${k(cx - w / 2 - 6)}" y="${k(y0 + t)}" width="${k(w * 0.07)}" height="${k(h - 2 * t)}" fill="${khung}"/><rect x="${k(cx + w / 2 + 6 - w * 0.07)}" y="${k(y0 + t)}" width="${k(w * 0.07)}" height="${k(h - 2 * t)}" fill="${khung}"/>`
    + `<rect x="${k(cx - w / 2 - 16)}" y="${k(y0)}" width="${k(w + 32)}" height="${k(t)}" rx="${k(t / 2)}" fill="${khung}"/><rect x="${k(cx - w / 2 - 16)}" y="${k(y1 - t)}" width="${k(w + 32)}" height="${k(t)}" rx="${k(t / 2)}" fill="${khung}"/>`;
}

// ngọn lửa (tâm đáy, cao)
function lua(cx, by, s) {
  const d = "M0 0 Q-0.46 0 -0.4 -0.42 Q-0.34 -0.64 -0.14 -0.78 Q-0.12 -0.56 0.02 -0.5 Q0.04 -0.82 0.14 -1 Q0.48 -0.72 0.42 -0.34 Q0.44 0 0 0 Z";
  return [[1, P.d1], [0.66, P.v2], [0.34, P.v3]].map(([k, m]) => `<path transform="translate(${cx} ${by}) scale(${f1(s * k)})" d="${d}" fill="${m}"/>`).join("");
}

// mũi tên khối (ngang): từ x1 tới x2 ở độ cao y, thân dày t
function muiKhoi(x1, x2, y, t, { mau = P.x1, vien = "", dut = false, nen = "" } = {}) {
  const dir = Math.sign(x2 - x1), hl = t * 1.6, hw = t * 2.3, xa = x2 - dir * hl;
  const d = `M${x1} ${f1(y - t / 2)} H${f1(xa)} V${f1(y - hw / 2)} L${x2} ${y} L${f1(xa)} ${f1(y + hw / 2)} V${f1(y + t / 2)} H${x1} Z`;
  return vien ? `<path d="${d}" fill="${nen || "none"}" stroke="${vien}" stroke-width="4" stroke-linejoin="round" ${dut ? 'stroke-dasharray="14 10"' : ""}/>` : `<path d="${d}" fill="${mau}"/>`;
}


// cụm lấp lánh: 1 lớn + 2 nhỏ
const saoCum = (x, y, r, mau = P.v2) => sao(x, y, r, mau) + sao(x + r * 1.7, y - r * 0.9, r * 0.5, mau) + sao(x + r * 1.25, y + r * 1.3, r * 0.36, mau);

// người (tượng bán thân phẳng): cx, đáy, cao s
function nguoi(cx, by, s, { ao = P.x2, ao2 = P.x1, toc = P.muc } = {}) {
  const k = (a) => f1(a * s);
  return `<path d="M${cx - k(0.42)} ${by} V${by - k(0.22)} Q${cx - k(0.42)} ${by - k(0.48)} ${cx - k(0.14)} ${by - k(0.5)} H${cx + k(0.14)} Q${cx + k(0.42)} ${by - k(0.48)} ${cx + k(0.42)} ${by - k(0.22)} V${by} Z" fill="${ao}"/>`
    + `<path d="M${cx + k(0.06)} ${by - k(0.5)} H${cx + k(0.14)} Q${cx + k(0.42)} ${by - k(0.48)} ${cx + k(0.42)} ${by - k(0.22)} V${by} H${cx + k(0.06)} Z" fill="${ao2}"/>`
    + `<rect x="${cx - k(0.07)}" y="${by - k(0.6)}" width="${k(0.14)}" height="${k(0.14)}" fill="${P.da}"/><path d="M${cx - k(0.12)} ${by - k(0.5)} L${cx} ${by - k(0.36)} L${cx + k(0.12)} ${by - k(0.5)} Z" fill="${P.nen}"/>`
    + `<circle cx="${cx}" cy="${by - k(0.76)}" r="${k(0.2)}" fill="${P.da}"/><path d="M${cx - k(0.21)} ${by - k(0.74)} Q${cx - k(0.24)} ${by - k(1.02)} ${cx + k(0.02)} ${by - k(1)} Q${cx + k(0.25)} ${by - k(0.98)} ${cx + k(0.21)} ${by - k(0.74)} Q${cx + k(0.1)} ${by - k(0.86)} ${cx - k(0.21)} ${by - k(0.74)} Z" fill="${toc}"/>`;
}

// búa toà án (tâm, cỡ) — "do luật buộc"; dau = màu đầu búa (đổi theo nền để không chìm)
function bua(cx, cy, s, { dau = P.x1, soc = P.v1, vet = P.v3 } = {}) {
  const k = (a) => f1(a * s);
  return `<rect x="${cx - k(0.42)}" y="${cy + k(0.3)}" width="${k(0.84)}" height="${k(0.16)}" rx="${k(0.04)}" fill="${P.v1}"/><rect x="${cx - k(0.32)}" y="${cy + k(0.2)}" width="${k(0.64)}" height="${k(0.12)}" rx="${k(0.04)}" fill="${P.v2}"/>`
    + `<g transform="rotate(-38 ${cx} ${cy})"><rect x="${cx - k(0.05)}" y="${cy - k(0.12)}" width="${k(0.1)}" height="${k(0.62)}" rx="${k(0.05)}" fill="${P.v1}"/>`
    + `<rect x="${cx - k(0.34)}" y="${cy - k(0.36)}" width="${k(0.68)}" height="${k(0.28)}" rx="${k(0.07)}" fill="${dau}"/><rect x="${cx - k(0.27)}" y="${cy - k(0.36)}" width="${k(0.06)}" height="${k(0.28)}" fill="${soc}"/><rect x="${cx + k(0.21)}" y="${cy - k(0.36)}" width="${k(0.06)}" height="${k(0.28)}" fill="${soc}"/>`
    + `<path d="M${cx - k(0.46)} ${cy - k(0.32)} v${k(0.2)} M${cx - k(0.54)} ${cy - k(0.28)} v${k(0.12)}" stroke="${vet}" stroke-width="${k(0.035)}" stroke-linecap="round"/></g>`;
}

// toà văn phòng doanh nghiệp bảo hiểm: thân màu chủ, cửa sổ lưới, huy hiệu ô, cửa có mái hiên (dùng lặp cả deck)
function toaVP(cx, by, w, { than = P.x1, bong = P.x2, kinh = P.x4, kinh2 = P.x3 } = {}) {
  const h = w * 1.25, x = cx - w / 2, top = by - h, k = (a) => f1(a);
  let s = `<rect x="${k(x + w * 0.05)}" y="${k(top - w * 0.06)}" width="${k(w * 0.9)}" height="${k(w * 0.08)}" rx="4" fill="${P.v2}"/>`
    + `<rect x="${k(x)}" y="${k(top)}" width="${w}" height="${k(h)}" fill="${than}"/><rect x="${k(x + w * 0.72)}" y="${k(top)}" width="${k(w * 0.28)}" height="${k(h)}" fill="${bong}"/>`;
  const ey = top + w * 0.17;
  s += `<circle cx="${cx}" cy="${k(ey)}" r="${k(w * 0.11)}" fill="${P.v2}"/>` + o(cx, k(ey - w * 0.04), k(w * 0.14), { m1: P.x1, m2: P.x2 }).replace(/<rect[^>]*fill="#1B2A28"\/>$/, "");
  const c0 = x + w * 0.1, gw = (w * 0.8) / 4, r0 = top + w * 0.36, gh = (h - w * 0.36 - w * 0.34) / 4;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) s += `<rect x="${k(c0 + i * gw + gw * 0.15)}" y="${k(r0 + j * gh + gh * 0.15)}" width="${k(gw * 0.7)}" height="${k(gh * 0.7)}" rx="3" fill="${i === 3 ? kinh2 : kinh}"/>`;
  return s + `<rect x="${k(cx - w * 0.14)}" y="${k(by - w * 0.24)}" width="${k(w * 0.28)}" height="${k(w * 0.24)}" fill="${P.v4}"/><rect x="${k(cx - w * 0.01)}" y="${k(by - w * 0.24)}" width="${k(w * 0.02)}" height="${k(w * 0.24)}" fill="${than}"/>`
    + `<rect x="${k(cx - w * 0.2)}" y="${k(by - w * 0.3)}" width="${k(w * 0.4)}" height="${k(w * 0.06)}" rx="4" fill="${P.v2}"/>`;
}

// phiếu tự chọn: tờ giấy có ba ô, hai ô đã tích (x, y góc trái trên, w)
function phieu(x, y, w) {
  const h = w * 1.25, k = (a) => f1(a);
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${k(h)}" rx="${k(w * 0.05)}" fill="${P.trang}"/><rect x="${k(x + w * 0.3)}" y="${k(y - w * 0.06)}" width="${k(w * 0.4)}" height="${k(w * 0.14)}" rx="${k(w * 0.04)}" fill="${P.v1}"/>`;
  [true, false, true].forEach((tich, i) => { const yy = y + h * (0.2 + i * 0.26);
    s += `<rect x="${k(x + w * 0.12)}" y="${k(yy)}" width="${k(w * 0.16)}" height="${k(w * 0.16)}" rx="${k(w * 0.03)}" fill="${tich ? P.v4 : P.nen}" stroke="${P.v1}" stroke-width="${k(w * 0.02)}"/>`
      + (tich ? `<path d="M${k(x + w * 0.15)} ${k(yy + w * 0.08)} l${k(w * 0.04)} ${k(w * 0.05)} l${k(w * 0.09)} ${k(-w * 0.11)}" fill="none" stroke="${P.x1}" stroke-width="${k(w * 0.035)}" stroke-linecap="round" stroke-linejoin="round"/>` : "")
      + `<rect x="${k(x + w * 0.36)}" y="${k(yy + w * 0.03)}" width="${k(w * (i === 1 ? 0.36 : 0.5))}" height="${k(w * 0.04)}" rx="2" fill="${P.ke}"/><rect x="${k(x + w * 0.36)}" y="${k(yy + w * 0.1)}" width="${k(w * 0.3)}" height="${k(w * 0.035)}" rx="2" fill="${P.ke}"/>`; });
  return s;
}

// toà nhà doanh nghiệp bảo hiểm: mặt tiền 4 cột + huy hiệu ô trên mái (dùng lặp cả deck)
const dnbh = (cx, by, w, o2 = {}) => { const st = w * 0.05, hc = w * (o2.cao || 0.5), top = by - 3 * st - hc, e = top - w * 0.07;
  return matTien(cx, by, w, 4, o2) + `<circle cx="${cx}" cy="${f1(e - w * 0.1)}" r="${f1(w * 0.075)}" fill="${P.v2}"/>` + o(cx, f1(e - w * 0.14), f1(w * 0.1), { m1: P.x1, m2: P.x2 }).replace(/<rect[^>]*fill="#1B2A28"\/>$/, ""); };

// bong bóng thoại có đuôi (x, y, w, h)
const bongThoai = (x, y, w, h, mau = P.v2) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${f1(h * 0.22)}" fill="${mau}"/><path d="M${f1(x + w * 0.22)} ${y + h - 2} l${f1(-w * 0.06)} ${f1(h * 0.28)} l${f1(w * 0.2)} ${f1(-h * 0.28)} Z" fill="${mau}"/>`;

// chồng giấy phía sau một tờ chính (nghiêng nhẹ)
const chongGiay = (x, y, w) => { const h = w * 1.3; return `<rect x="${x}" y="${y}" width="${w}" height="${f1(h)}" rx="6" fill="${P.x4}" transform="rotate(-8 ${f1(x + w / 2)} ${f1(y + h / 2)})"/><rect x="${x}" y="${y}" width="${w}" height="${f1(h)}" rx="6" fill="${P.x3}" transform="rotate(5 ${f1(x + w / 2)} ${f1(y + h / 2)})"/>`; };

// bút (đầu ở x,y; dài L; nghiêng)
const but = (x, y, L, goc = -40) => `<g transform="rotate(${goc} ${x} ${y})"><rect x="${x}" y="${f1(y - L * 0.05)}" width="${L}" height="${f1(L * 0.1)}" rx="${f1(L * 0.05)}" fill="${P.x1}"/><rect x="${f1(x + L * 0.62)}" y="${f1(y - L * 0.05)}" width="${f1(L * 0.08)}" height="${f1(L * 0.1)}" fill="${P.v2}"/><path d="M${x} ${f1(y - L * 0.05)} L${f1(x - L * 0.14)} ${y} L${x} ${f1(y + L * 0.05)} Z" fill="${P.v1}"/></g>`;

module.exports = { toaVP, saoCum, nguoi, bua, phieu, dnbh, bongThoai, chongGiay, but, P, iconNet, iconDac, cham, sao, giot, o, nha, xu, khien, hopDong, matTien, dongHo, lua, muiKhoi };

// ---------- minh hoạ unDraw (giấy phép unDraw: dùng tự do, không bắt ghi công — vẫn ghi trong ghi-cong.md) ----------
// Tô lại theo bảng màu bài: màu nhấn → xanh chủ, xám đậm → mực, xám nhạt → kẻ / bạc hà, da → da. Lồng vào lớp hình bằng <svg> con.
const MAU_UD = { "#6c63ff": P.x2, "#090814": P.muc, "#2f2e43": P.muc, "#2f2e41": P.muc, "#3f3d56": P.muc, "#3f3d58": P.muc, "#36393a": P.muc,
  "#e6e6e6": P.ke, "#e0e0e0": P.ke, "#d6d6e3": P.x3, "#d0cde1": P.x3, "#f2f2f2": P.x4, "#fafafa": P.trang, "#ffffff": P.trang, "#fff": P.trang,
  "#ed9da0": P.da, "#f8a8ab": P.da, "#ffb6b6": P.da, "#ffb8b8": P.da, "#9f616a": P.da2, "#a0616a": P.da2, "#ccc": P.ke, "#cccccc": P.ke };
function unDraw(D, ten, x, y, w, doi = {}) {
  let s = fs.readFileSync(path.join(D, "asset", "undraw", ten + ".svg"), "utf8");
  const vb = (s.match(/viewBox="([^"]+)"/) || [])[1].split(/[\s,]+/).map(Number), h = (w * vb[3]) / vb[2];
  const map = { ...MAU_UD, ...doi };
  s = s.replace(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g, (c) => map[c.toLowerCase()] || c);
  const body = s.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  return { svg: `<svg x="${x}" y="${y}" width="${w}" height="${f1(h)}" viewBox="${vb.join(" ")}">${body}</svg>`, h };
}
module.exports.unDraw = unDraw;

// đám mây mưa có tia sét — RỦI RO (đỏ = rủi ro): cx, cy tâm mây, s bề rộng
function mayMua(cx, cy, s, { may = P.ke, may2 = P.x3, mua = P.x2, set = P.d1 } = {}) {
  const k = (a) => f1(a * s);
  let o = `<ellipse cx="${cx}" cy="${cy + k(0.1)}" rx="${k(0.5)}" ry="${k(0.16)}" fill="${may2}"/>`
    + [[-0.24, 0.02, 0.2], [0.02, -0.08, 0.26], [0.26, 0.03, 0.19]].map(([dx, dy, r]) => `<circle cx="${cx + k(dx)}" cy="${cy + k(dy)}" r="${k(r)}" fill="${may}"/>`).join("")
    + `<rect x="${cx - k(0.44)}" y="${cy}" width="${k(0.88)}" height="${k(0.16)}" rx="${k(0.08)}" fill="${may}"/>`;
  for (let i = 0; i < 6; i++) { const x = cx - k(0.36) + i * k(0.14); o += `<path d="M${x} ${cy + k(0.24 + (i % 2) * 0.06)} l${k(-0.05)} ${k(0.16)}" stroke="${mua}" stroke-width="${k(0.025)}" stroke-linecap="round"/>`; }
  return o + `<path d="M${cx + k(0.06)} ${cy + k(0.14)} l${k(-0.1)} ${k(0.2)} h${k(0.08)} l${k(-0.07)} ${k(0.18)} l${k(0.17)} ${k(-0.24)} h${k(-0.08)} l${k(0.06)} ${k(-0.14)} Z" fill="${set}"/>`;
}
module.exports.mayMua = mayMua;
