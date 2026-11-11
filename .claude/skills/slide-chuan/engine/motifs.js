// Hoạ tiết nền vẽ bằng code (SVG thuần, không chữ, không ảnh AI) — đặt vào VÙNG TRỐNG thật của slide sau khi xếp nội dung.
// Mỗi hàm nhận (màu chủ c, màu vàng g, màu nền b, bề rộng w px, cao h px) và trả về chuỗi SVG đúng tỉ lệ ô trống,
// nên hình không bao giờ bị cắt ngang bởi mép slide hay bị thẻ che dở dang (lỗi cũ: ảnh cỡ cả slide đặt lệch ra ngoài).
// Mép hình tan dần vào màu nền (feather) bằng lớp chuyển màu — không dùng <mask>/<filter> để PowerPoint vẽ đúng SVG.
//
// Kỹ thuật tham khảo (mã nguồn mở):
//  - đường đồng mức: thuật toán marching squares (như d3-contour, ISC) trên một trường độ cao tự sinh;
//  - lưới chấm / hoạ tiết lặp: ý tưởng Hero Patterns (CC BY 4.0) — ở đây tự vẽ, không chép SVG của họ;
//  - bản đồ địa chính: lưới thửa méo ngẫu nhiên có hạt giống cố định (cùng deck → cùng hình mỗi lần dựng).

const rng = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const f1 = (n) => (Math.round(n * 10) / 10).toString();

// lớp mép mờ: 4 dải chuyển màu nền (đặc ở mép → trong suốt vào trong)
function feather(w, h, b, k = 0.22, open = {}) {
  const fx = Math.round(w * k), fy = Math.round(h * k);
  return `<defs>
<linearGradient id="fl" x1="0" x2="1"><stop offset="0" stop-color="#${b}"/><stop offset="1" stop-color="#${b}" stop-opacity="0"/></linearGradient>
<linearGradient id="fr" x1="1" x2="0"><stop offset="0" stop-color="#${b}"/><stop offset="1" stop-color="#${b}" stop-opacity="0"/></linearGradient>
<linearGradient id="ft" y1="0" y2="1" x1="0" x2="0"><stop offset="0" stop-color="#${b}"/><stop offset="1" stop-color="#${b}" stop-opacity="0"/></linearGradient>
<linearGradient id="fb" y1="1" y2="0" x1="0" x2="0"><stop offset="0" stop-color="#${b}"/><stop offset="1" stop-color="#${b}" stop-opacity="0"/></linearGradient></defs>
${open.l ? "" : `<rect x="0" y="0" width="${fx}" height="${h}" fill="url(#fl)"/>`}${open.r ? "" : `<rect x="${w - fx}" y="0" width="${fx}" height="${h}" fill="url(#fr)"/>`}
${open.t ? "" : `<rect x="0" y="0" width="${w}" height="${fy}" fill="url(#ft)"/>`}${open.b ? "" : `<rect x="0" y="${h - fy}" width="${w}" height="${fy}" fill="url(#fb)"/>`}`;
}
// open.flip: lật ngang phần hình (không lật lớp mép mờ) — slide chẵn/lẻ nhìn khác nhau mà vẫn cùng một "họ" hình
const wrap = (w, h, body, b, k, open = {}) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" stroke-linejoin="round" stroke-linecap="round">${open.flip ? `<g transform="translate(${w} 0) scale(-1 1)">${body}</g>` : body}${feather(w, h, b, k, open)}</svg>`;

// 1) bản đồ địa chính: thửa đất méo + một con đường + MỘT thửa tô vàng (thửa tranh chấp)
function cadastral(c, g, b, w, h, open = {}, seed = 7) {
  // Thửa đất hình Voronoi (điểm rải đều kiểu Poisson rồi chia vùng gần nhất) — ranh giới lệch, nhiều cạnh như bản đồ địa chính thật,
  // không còn lưới tứ giác đều. Một con đường cắt ngang; thửa đang bàn tô màu nhấn sát mép đường.
  const CA = require("./codeart"), r = rng(seed), cell = Math.max(70, Math.min(110, Math.min(w, h) / 2.6)); // vùng nhỏ: ô to, ít ô — tránh trông như mảnh vụn
  // tính trên vùng rộng hơn khung (lề m) rồi dời lại: cạnh khung không thành nét vẽ thẳng (ô chỉ bị cắt ở NGOÀI tầm nhìn)
  const m = cell, n = Math.max(8, Math.round(((w + 2 * m) * (h + 2 * m)) / (cell * cell * 0.82)));
  const cells = CA.voronoiCells(w + 2 * m, h + 2 * m, n, seed * 7919 + 13).map(q => ({ site: [q.site[0] - m, q.site[1] - m], poly: q.poly.map(p => [p[0] - m, p[1] - m]) }));
  const roadY = h * (0.48 + (r() - 0.5) * 0.12), rh = cell * 0.32, wave = (x, k) => roadY + k * rh / 2 + Math.sin(x / (w * 0.45) + seed) * cell * 0.18;
  const tx = w * 0.6, ty = roadY - rh - cell * 0.35;
  let hi = null, best = 1e9;
  for (const q of cells) { const d = Math.hypot(q.site[0] - tx, q.site[1] - ty), inside = q.poly.every(p => p[1] < wave(p[0], -1) - 4 && p[0] > 0 && p[0] < w && p[1] > 0); // thửa tô nổi phải nằm TRỌN phía trên đường, trong khung
    if (inside && d < best) { best = d; hi = q; } }
  const out = cells.filter(q => q !== hi).map((q, i) => `<path d="${CA.polyD(q.poly)}" fill="#${c}" fill-opacity="${(0.03 + 0.05 * ((i * 7) % 4) / 3).toFixed(3)}" stroke="#${c}" stroke-width="2" stroke-opacity=".38" stroke-linejoin="round"/>`);
  const xs = Array.from({ length: 27 }, (_, i) => -m + (i / 26) * (w + 2 * m)); // đường chạy quá hai mép khung: không lộ nét đầu đường
  out.push(`<path d="M${xs.map(x => f1(x) + " " + f1(wave(x, -1))).join(" L")} L${xs.slice().reverse().map(x => f1(x) + " " + f1(wave(x, 1))).join(" L")} Z" fill="#${b}" stroke="#${c}" stroke-width="2" stroke-opacity=".45"/>`);
  out.push(`<path d="M${xs.map(x => f1(x) + " " + f1(wave(x, 0))).join(" L")}" fill="none" stroke="#${g}" stroke-opacity=".7" stroke-width="2.5" stroke-dasharray="14 10"/>`);
  if (hi) out.push(`<path d="${CA.polyD(hi.poly)}" fill="#${g}" fill-opacity=".32" stroke="#${c}" stroke-width="3.5" stroke-opacity=".75" stroke-linejoin="round"/>`);
  return wrap(w, h, out.join(""), b, 0.24, open);
}

// 2) đường đồng mức (bản đồ địa hình): marching squares trên trường độ cao = tổng vài "quả đồi" Gauss
function contour(c, g, b, w, h, open = {}, seed = 11) {
  const r = rng(seed), hills = Array.from({ length: 4 }, (_, i) => ({ x: (0.1 + 0.8 * r()) * w, y: (0.1 + 0.8 * r()) * h, s: (0.12 + 0.16 * r()) * Math.max(w, h), a: (i ? 0.5 : 0.9) + 0.5 * r() }));
  const fz = (x, y) => hills.reduce((a, q) => a + q.a * Math.exp(-((x - q.x) ** 2 + (y - q.y) ** 2) / (2 * q.s * q.s)), 0) + 0.04 * Math.sin(x / 37) * Math.cos(y / 29);
  const st = 12, nx = Math.ceil(w / st), ny = Math.ceil(h / st), Z = [];
  for (let j = 0; j <= ny; j++) { Z.push([]); for (let i = 0; i <= nx; i++) Z[j].push(fz(i * st, j * st)); }
  const lerp = (a, b2, t) => a + (b2 - a) * t, out = [];
  const levels = Array.from({ length: 11 }, (_, k) => 0.12 + k * 0.11);
  levels.forEach((lv, li) => {
    let d = "";
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const v = [Z[j][i], Z[j][i + 1], Z[j + 1][i + 1], Z[j + 1][i]], x = i * st, y = j * st;
      const idx = (v[0] > lv) | ((v[1] > lv) << 1) | ((v[2] > lv) << 2) | ((v[3] > lv) << 3);
      if (idx === 0 || idx === 15) continue;
      const e = [ // điểm cắt trên 4 cạnh: trên, phải, dưới, trái
        [lerp(x, x + st, (lv - v[0]) / (v[1] - v[0])), y], [x + st, lerp(y, y + st, (lv - v[1]) / (v[2] - v[1]))],
        [lerp(x, x + st, (lv - v[3]) / (v[2] - v[3])), y + st], [x, lerp(y, y + st, (lv - v[0]) / (v[3] - v[0]))]];
      const segs = { 1: [[3, 0]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]], 5: [[3, 0], [1, 2]], 6: [[0, 2]], 7: [[3, 2]], 8: [[2, 3]], 9: [[0, 2]], 10: [[0, 1], [2, 3]], 11: [[1, 2]], 12: [[1, 3]], 13: [[0, 1]], 14: [[0, 3]] }[idx];
      for (const [a, z] of segs) d += `M${f1(e[a][0])} ${f1(e[a][1])}L${f1(e[z][0])} ${f1(e[z][1])}`;
    }
    const major = li % 4 === 3; // đường cái (đậm hơn) mỗi 4 đường — đúng quy ước bản đồ địa hình
    if (d) out.push(`<path d="${d}" fill="none" stroke="#${major ? g : c}" stroke-opacity="${major ? 0.75 : 0.42}" stroke-width="${major ? 2.6 : 1.6}"/>`);
  });
  return wrap(w, h, out.join(""), b, 0.2, open);
}

// 3) lưới chấm (giấy kẻ chấm) — trung tính, cho bài phân tích / báo cáo; chấm to dần về một góc tạo hướng nhìn
function dots(c, g, b, w, h, open = {}, seed = 3) {
  // biến thể theo slide: lưới vuông hoặc so le (tổ ong), hướng to dần đổi theo hạt giống
  const st = 34, out = [], hex = seed % 2 === 1, dir = seed % 3;
  for (let y = st / 2, row = 0; y < h; y += st, row++) for (let x = st / 2 + (hex && row % 2 ? st / 2 : 0); x < w; x += st) {
    const t = dir === 0 ? (x / w + y / h) / 2 : dir === 1 ? x / w : 1 - Math.hypot(x - w, y - h) / Math.hypot(w, h);
    out.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(1.4 + 3.4 * Math.max(0, t))}"/>`);
  }
  return wrap(w, h, `<g fill="#${c}" fill-opacity=".45">${out.join("")}</g>`, b, 0.18, open);
}

// 4) núi nhiều lớp (phong cảnh) — chân núi chạm đáy ô trống
function ridges(c, g, b, w, h, open = {}, seed = 5) {
  const r = rng(seed), out = [];
  const cr = (pts) => { let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`; // Catmull-Rom → Bézier: sống núi mềm, không thành "bướu"
    for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ` C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`; } return d; };
  [[0.30, 0.14, g], [0.52, 0.26, null], [0.74, 0.42, g]].forEach(([base, op, line], k) => {
    const n = 9 + k * 2, pts = Array.from({ length: n + 1 }, (_, i) => [i * w / n, h * (base + (r() - 0.5) * (0.32 - k * 0.08))]);
    const d = cr(pts);
    out.push(`<path d="${d} L${w} ${h} L0 ${h} Z" fill="#${c}" fill-opacity="${op}"/>`);
    if (line) out.push(`<path d="${d}" fill="none" stroke="#${line}" stroke-opacity=".7" stroke-width="2"/>`);
  });
  return wrap(w, h, out.join(""), b, 0.32, open);
}

// 5) hoa văn guilloche (giấy chứng nhận, tiền giấy) — đường cong spirograph, vẽ trong ô vuông
function guilloche(c, g, b, w, h, open = {}, seed = 1) {
  // vòng guilloche kiểu tiền giấy: nhiều đường sóng cùng biên độ, lệch pha nhau → dải "đan lưới"
  const R = Math.min(w, h) / 2 - 6, cx = w / 2, cy = h / 2, out = [];
  const ring = (r0, amp, n, copies, col, op, sw) => { for (let k = 0; k < copies; k++) { let d = "";
    for (let t = 0; t <= 540; t++) { const u = t / 540 * Math.PI * 2, rr = r0 + amp * Math.sin(n * u + k * Math.PI * 2 / copies);
      d += (t ? "L" : "M") + f1(cx + rr * Math.cos(u)) + " " + f1(cy + rr * Math.sin(u)); }
    out.push(`<path d="${d}Z" fill="none" stroke="#${col}" stroke-opacity="${op}" stroke-width="${sw}"/>`); } };
  const k = seed % 3; // số "cánh" đổi theo slide
  ring(R * 0.78, R * 0.12, 20 + 4 * k, 10, c, 0.45, 1.1);
  ring(R * 0.52, R * 0.08, 12 + 4 * k, 8, g, 0.6, 1.1);
  out.push(`<circle cx="${cx}" cy="${cy}" r="${f1(R * 0.96)}" fill="none" stroke="#${c}" stroke-opacity=".5" stroke-width="1.5"/><circle cx="${cx}" cy="${cy}" r="${f1(R * 0.36)}" fill="none" stroke="#${c}" stroke-opacity=".5" stroke-width="1.2"/>`);
  return wrap(w, h, out.join(""), b, 0.04, open);
}

// 6) giấy kẻ dòng có lề (sổ tay, hồ sơ, biên bản) — dòng kẻ mảnh + đường lề màu vàng/đỏ; vài dòng "chữ viết" giả bằng nét
function lines(c, g, b, w, h, open = {}, seed = 9) {
  const r = rng(seed), lh = 30, mx = Math.round(w * (0.12 + 0.06 * (seed % 3))), out = [];
  for (let y = lh; y < h; y += lh) out.push(`<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="#${c}" stroke-opacity=".35" stroke-width="1.3"/>`);
  out.push(`<line x1="${mx}" y1="0" x2="${mx}" y2="${h}" stroke="#${g}" stroke-opacity=".85" stroke-width="2"/><line x1="${mx + 6}" y1="0" x2="${mx + 6}" y2="${h}" stroke="#${g}" stroke-opacity=".5" stroke-width="1"/>`);
  for (let y = lh * 2; y < h - lh; y += lh) if (r() < 0.55) { // nét "chữ viết tay" rất nhạt — gợi trang hồ sơ, không có chữ thật
    let x = mx + 18, d = ""; const end = mx + 18 + (w - mx - 40) * (0.35 + 0.6 * r());
    while (x < end) { const ww = 14 + 40 * r(); d += `M${f1(x)} ${y - 7} q${f1(ww / 4)} ${f1(-6 * r())} ${f1(ww / 2)} 0 t${f1(ww / 2)} 0 `; x += ww + 8; }
    out.push(`<path d="${d}" fill="none" stroke="#${c}" stroke-opacity=".28" stroke-width="1.6"/>`); }
  return wrap(w, h, out.join(""), b, 0.2, open);
}

// 7) sóng mảnh song song (dải lụa) — trung tính, hiện đại; hợp theme son / chủ đề kinh doanh, công nghệ
function waves(c, g, b, w, h, open = {}, seed = 4) {
  const r = rng(seed), n = 16, out = [], a1 = 0.12 + 0.1 * r(), a2 = 0.06 + 0.06 * r(), f1_ = 1 + r(), f2_ = 2 + 2 * r(), ph = r() * 6;
  for (let k = 0; k < n; k++) {
    const t = k / (n - 1), base = h * (0.25 + 0.55 * t); let d = "";
    for (let i = 0; i <= 60; i++) { const x = i / 60 * w, u = i / 60 * Math.PI * 2;
      const y = base + h * (a1 * Math.sin(u * f1_ + ph + t * 1.6) + a2 * Math.sin(u * f2_ + t * 3)); d += (i ? "L" : "M") + f1(x) + " " + f1(y); }
    out.push(`<path d="${d}" fill="none" stroke="#${k === Math.round(n * 0.6) ? g : c}" stroke-opacity="${(0.18 + 0.4 * Math.sin(t * Math.PI)).toFixed(2)}" stroke-width="${k === Math.round(n * 0.6) ? 2.4 : 1.4}"/>`);
  }
  return wrap(w, h, out.join(""), b, 0.18, open);
}

// 8) mảng màu loang (blob) — 2–3 hình hữu cơ chồng nhau, rất nhạt; tạo chiều sâu cho nền trơn mà không mang nghĩa cụ thể
function blobs(c, g, b, w, h, open = {}, seed = 6) {
  const r = rng(seed), out = [];
  const blob = (cx, cy, R, col, op) => { const n = 7, pts = Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2, rr = R * (0.75 + 0.45 * r()); return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)]; });
    let d = ""; for (let i = 0; i < n; i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      if (!i) d += `M${f1(p1[0])} ${f1(p1[1])}`; d += ` C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`; }
    return `<path d="${d}Z" fill="#${col}" fill-opacity="${op}"/>`; };
  const m = Math.min(w, h);
  out.push(blob(w * 0.62, h * 0.55, m * 0.42, c, 0.10), blob(w * 0.42, h * 0.62, m * 0.3, g, 0.16), blob(w * 0.72, h * 0.35, m * 0.2, c, 0.14));
  out.push(`<circle cx="${f1(w * 0.3)}" cy="${f1(h * 0.3)}" r="${f1(m * 0.05)}" fill="none" stroke="#${g}" stroke-opacity=".7" stroke-width="2"/>`);
  return wrap(w, h, out.join(""), b, 0.12, open);
}

// 9) giấy kẻ ô ly / bản vẽ kỹ thuật — lưới nhỏ + lưới chính + vài đường đo; hợp quy hoạch, xây dựng, số liệu
function grid(c, g, b, w, h, open = {}, seed = 8) {
  const r = rng(seed), s1 = 16, s5 = s1 * 5, out = [];
  let d1 = "", d5 = "";
  for (let x = 0; x <= w; x += s1) (x % s5 ? (d1 += `M${x} 0V${h}`) : (d5 += `M${x} 0V${h}`));
  for (let y = 0; y <= h; y += s1) (y % s5 ? (d1 += `M0 ${y}H${w}`) : (d5 += `M0 ${y}H${w}`));
  out.push(`<path d="${d1}" stroke="#${c}" stroke-opacity=".16" stroke-width="1"/><path d="${d5}" stroke="#${c}" stroke-opacity=".34" stroke-width="1.4"/>`);
  // một "mặt bằng" đơn giản: đa giác bám lưới chính + đường kích thước
  const gx = (k) => Math.round((w * k) / s5) * s5, gy = (k) => Math.round((h * k) / s5) * s5;
  const x0 = gx(0.35 + 0.1 * r()), y0 = gy(0.3), x1 = gx(0.8), y1 = gy(0.75), xm = gx(0.6);
  out.push(`<path d="M${x0} ${y0}H${x1}V${y1}H${xm}V${gy(0.55)}H${x0}Z" fill="#${g}" fill-opacity=".14" stroke="#${c}" stroke-opacity=".7" stroke-width="2.4"/>`);
  out.push(`<path d="M${x0} ${y0 - 22}H${x1}M${x0} ${y0 - 30}v16M${x1} ${y0 - 30}v16" stroke="#${g}" stroke-opacity=".9" stroke-width="1.6"/>`);
  return wrap(w, h, out.join(""), b, 0.18, open);
}

const MOTIFS = { cadastral, contour, dots, landscape: ridges, certificate: guilloche, lines, waves, blobs, grid };
// kích thước tối thiểu (in) để hoạ tiết còn đọc được là "hình", không thành vết bẩn
const MIN = { cadastral: [2.4, 1.5], contour: [2.2, 1.4], dots: [2.0, 1.2], landscape: [3.2, 1.2], certificate: [1.8, 1.8], lines: [2.4, 1.4], waves: [2.8, 1.2], blobs: [2.0, 1.6], grid: [2.2, 1.4] };
const MAX = { cadastral: [5.6, 3.4], contour: [5.6, 3.6], dots: [4.6, 3.0], landscape: [13.4, 2.4], certificate: [3.4, 3.4], lines: [5.0, 3.4], waves: [7.0, 2.8], blobs: [4.6, 3.6], grid: [5.2, 3.4] };

// Tìm hình chữ nhật trống lớn nhất trên lưới 0.1 in (thuật toán "largest rectangle in histogram").
// occ: [{x,y,w,h}] các vùng đã có nội dung (in). area: {x0,y0,x1,y1}. Trả về {x,y,w,h} hoặc null.
function largestFree(occ, area, pad = 0.25, stepIn = 0.1, edgeRight = false) { // edgeRight: chỉ nhận ô chạm mép phải vùng
  const cols = Math.floor((area.x1 - area.x0) / stepIn + 1e-9), rows = Math.floor((area.y1 - area.y0) / stepIn + 1e-9); // làm tròn XUỐNG: không lòi ra ngoài slide
  const g = Array.from({ length: rows }, () => new Uint8Array(cols));
  for (const o of occ) {
    const i0 = Math.max(0, Math.floor((o.x - pad - area.x0) / stepIn)), i1 = Math.min(cols, Math.ceil((o.x + o.w + pad - area.x0) / stepIn));
    const j0 = Math.max(0, Math.floor((o.y - pad - area.y0) / stepIn)), j1 = Math.min(rows, Math.ceil((o.y + o.h + pad - area.y0) / stepIn));
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) g[j][i] = 1;
  }
  const hgt = new Array(cols).fill(0); let best = null;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) hgt[i] = g[j][i] ? 0 : hgt[i] + 1;
    const stk = [];
    for (let i = 0; i <= cols; i++) {
      const hh = i < cols ? hgt[i] : 0;
      while (stk.length && hgt[stk[stk.length - 1]] >= hh) {
        const top = stk.pop(), H = hgt[top], L = stk.length ? stk[stk.length - 1] + 1 : 0, Wd = i - L;
        // ưu tiên diện tích, nhưng ô quá dẹt (thanh mảnh) ít giá trị: tính diện tích theo cạnh ngắn bị chặn
        const score = Math.min(Wd, H * 3) * Math.min(H, Wd * 3);
        if (H && Wd && (!edgeRight || i === cols) && (!best || score > best.score)) best = { score, x: area.x0 + L * stepIn, y: area.y0 + (j - H + 1) * stepIn, w: Wd * stepIn, h: H * stepIn };
      }
      stk.push(i);
    }
  }
  return best;
}

module.exports = { MOTIFS, MIN, MAX, largestFree };
