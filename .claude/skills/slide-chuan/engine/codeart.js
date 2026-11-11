// Đồ hoạ vẽ bằng code (không ảnh, không AI): isotype, nét viết tay, Voronoi, isometric, giấy cắt lớp, nền gradient có hạt.
// Mọi hàm trả về CHUỖI SVG; build.js nhúng như vector (hoặc PNG khi SVG có <filter> — PowerPoint vẽ sai filter).
// Nguồn tham khảo: ISOTYPE (Otto Neurath; Haroz, Kosara & Franconeri, CHI 2015 — hình đếm MANG số liệu không làm chậm người xem),
// perfect-freehand (MIT, Stephen Ruiz) cho nét bút có độ dày thay đổi, Voronoi bằng cắt nửa mặt phẳng (thuật toán sách giáo khoa —
// không phụ thuộc thư viện), phép chiếu isometric 30° (cùng công thức của isomer, MIT — không dùng mã của isomer).
const { getStroke } = require("perfect-freehand");

const f1 = (v) => (Math.round(v * 10) / 10).toString();
function rng(seed) { let s = (Math.abs(seed | 0) % 2147483646) + 1; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
function hashStr(t) { let h = 7; for (const ch of String(t || "")) h = (h * 31 + ch.codePointAt(0)) % 2147483647; return h; }

// ---------- 1. ISOTYPE: một đơn vị = một hình; phần "mất / thiếu" = khung rỗng nét đứt ----------
// Mỗi hình vẽ trong ô 100 × 100·ratio (đơn vị SVG). Đặt hình rỗng = vẽ khung ngoài nét đứt, KHÔNG tô đặc màu đỏ
// (tô đặc đọc thành "có nhưng xấu" — sai nghĩa "không còn").
const ISO_RATIO = { note: 0.55, person: 1.25, house: 1, parcel: 0.8, day: 1 };
function isoGlyph(kind, x, y, w, col, bg) {
  const h = w * ISO_RATIO[kind], t = `translate(${f1(x)},${f1(y)}) scale(${f1(w / 100)})`;
  if (kind === "note") return `<g transform="${t}"><rect width="100" height="55" rx="6" fill="#${col}"/><rect x="8" y="8" width="84" height="39" rx="3" fill="none" stroke="#${bg}" stroke-opacity=".55" stroke-width="2.5"/><circle cx="50" cy="27.5" r="13" fill="none" stroke="#${bg}" stroke-width="4"/></g>`;
  if (kind === "person") return `<g transform="${t}"><circle cx="50" cy="24" r="22" fill="#${col}"/><path d="M8 125 V88 a42 38 0 0 1 84 0 V125 Z" fill="#${col}"/></g>`;
  if (kind === "house") return `<g transform="${t}"><path d="M50 4 L96 44 H84 V100 H16 V44 H4 Z" fill="#${col}"/><rect x="40" y="62" width="20" height="38" fill="#${bg}"/></g>`;
  if (kind === "parcel") return `<g transform="${t}"><path d="M6 10 L90 4 L96 74 L10 80 Z" fill="#${col}"/><path d="M48 7 L53 77" stroke="#${bg}" stroke-width="3" stroke-dasharray="7 5"/></g>`;
  // day: tờ lịch
  return `<g transform="${t}"><rect x="4" y="12" width="92" height="84" rx="8" fill="#${col}"/><rect x="4" y="12" width="92" height="22" rx="8" fill="#${bg}" fill-opacity=".35"/><rect x="24" y="2" width="9" height="20" rx="4" fill="#${col}"/><rect x="67" y="2" width="9" height="20" rx="4" fill="#${col}"/></g>`;
}
function isoGhost(kind, x, y, w, col, fill) {
  const h = w * ISO_RATIO[kind], sw = Math.max(1.5, w * 0.045);
  return `<rect x="${f1(x + sw / 2)}" y="${f1(y + sw / 2)}" width="${f1(w - sw)}" height="${f1(h - sw)}" rx="${f1(w * 0.07)}" fill="#${fill}" stroke="#${col}" stroke-width="${f1(sw)}" stroke-dasharray="${f1(sw * 2.6)} ${f1(sw * 1.7)}"/>`;
}
// Xếp n hình (k cuối là "mất") vào khung bw × bh (inch). Trả { svg, w, h (inch), cols, rows }.
function isotypeRow(kind, n, lost, bw, bh, col, ghostCol, ghostFill, bg, fix) { // fix = { cols, cell } để mọi hàng cùng lưới (so được độ dài)
  const r = ISO_RATIO[kind] || 1, gap = 0.22; // khoảng cách = 22% bề rộng hình
  let best = null;
  for (let cols = 1; cols <= Math.max(1, n); cols++) {
    const rows = Math.ceil(n / cols), w = Math.min(bw / (cols + (cols - 1) * gap), bh / (rows * r + (rows - 1) * gap * r));
    if (!best || w > best.w + 1e-9) best = { cols, rows, w };
  }
  if (fix) best = { cols: fix.cols, rows: Math.ceil(n / fix.cols), w: fix.cell };
  const { cols, rows } = best, cw = Math.min(best.w, 0.62), PX = 100, u = PX / cw; // tối đa 0.62 in mỗi hình — to hơn trông như icon trang trí
  const Wpx = (cols + (cols - 1) * gap) * cw * u, Hpx = (rows * r + (rows - 1) * gap * r) * cw * u;
  let g = "";
  for (let i = 0; i < n; i++) { const cx = (i % cols) * PX * (1 + gap), cy = Math.floor(i / cols) * PX * r * (1 + gap);
    g += i >= n - lost ? isoGhost(kind, cx, cy, PX, ghostCol, ghostFill) : isoGlyph(kind, cx, cy, PX, col, bg); }
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f1(Wpx)} ${f1(Hpx)}">${g}</svg>`, w: Wpx / u, h: Hpx / u, cols, rows, cell: cw };
}

// ---------- 2. Nét viết tay (perfect-freehand): vòng khoanh, mũi tên cong ----------
function strokePath(pts, size) {
  const o = getStroke(pts, { size, thinning: 0.55, smoothing: 0.6, streamline: 0.45, simulatePressure: true });
  return o.length ? "M" + o.map(p => f1(p[0]) + " " + f1(p[1])).join(" L") + "Z" : "";
}
// toạ độ inch × 100 trong SVG phủ cả slide (13.333 × 7.5 in)
function handMarks(marks, col, seed = 3) {
  const R = rng(seed); let g = "";
  for (const m of marks) {
    if (m.kind === "ring") { // vòng khoanh hơi méo, vòng quá điểm đầu một chút như tay vẽ thật
      const cx = m.x * 100, cy = m.y * 100, rx = m.rx * 100, ry = m.ry * 100, ph = R() * 6, pts = [];
      // siêu elip (|x/a|^6 + |y/b|^6 = 1): ôm trọn cả góc của khối dài, dẹt — elip thường sẽ cắt qua góc và nhãn bên cạnh
      const se = (v) => Math.sign(v) * Math.pow(Math.abs(v), 1 / 3);
      for (let t = 0; t <= Math.PI * 2.12; t += 0.05) { const a = t + ph; pts.push([cx + se(Math.cos(a)) * rx * (1 + 0.02 * Math.sin(3 * t + ph)), cy + se(Math.sin(a)) * ry * (1 + 0.04 * Math.cos(2 * t))]); }
      g += `<path d="${strokePath(pts, 5.5)}" fill="#${col}"/>`;
    } else if (m.kind === "arrow") { // đường cong bậc hai từ (x1,y1) tới (x2,y2), cong lên trên; đầu mũi tên 2 nét
      const [x1, y1, x2, y2] = [m.x1, m.y1, m.x2, m.y2].map(v => v * 100), mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - (m.bend == null ? 0.25 : m.bend) * Math.hypot(x2 - x1, y2 - y1), pts = [];
      for (let t = 0; t <= 1.0001; t += 0.04) pts.push([(1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t * t * x2, (1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t * t * y2]);
      g += `<path d="${strokePath(pts, 5.5)}" fill="#${col}"/>`;
      const a = Math.atan2(y2 - my, x2 - mx), L = 16;
      for (const s of [-0.5, 0.5]) g += `<path d="${strokePath([[x2, y2], [x2 - L * Math.cos(a + s), y2 - L * Math.sin(a + s)]], 5.5)}" fill="#${col}"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1333.3 750">${g}</svg>`;
}

// ---------- 3. Voronoi: thửa đất có hình dạng tự nhiên (cắt nửa mặt phẳng, O(n²) — n ≤ 80 là tức thì) ----------
function clipHalf(poly, ax, ay, bx, by) { // giữ phần gần a hơn b
  const mx = (ax + bx) / 2, my = (ay + by) / 2, nx = bx - ax, ny = by - ay, side = (p) => (p[0] - mx) * nx + (p[1] - my) * ny, out = [];
  for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length], sp = side(p), sq = side(q);
    if (sp <= 0) out.push(p);
    if ((sp < 0 && sq > 0) || (sp > 0 && sq < 0)) { const t = sp / (sp - sq); out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]); } }
  return out;
}
// điểm rải đều (Poisson đơn giản: thử nhiều điểm, bỏ điểm quá gần) → thửa cỡ gần nhau như bản đồ địa chính
function voronoiCells(w, h, n, seed) {
  const R = rng(seed), pts = [], dmin = Math.sqrt((w * h) / n) * 0.62;
  for (let k = 0; k < n * 40 && pts.length < n; k++) { const p = [R() * w, R() * h]; if (pts.every(q => Math.hypot(q[0] - p[0], q[1] - p[1]) > dmin)) pts.push(p); }
  return pts.map((p, i) => { let poly = [[0, 0], [w, 0], [w, h], [0, h]];
    for (let j = 0; j < pts.length && poly.length; j++) if (j !== i) poly = clipHalf(poly, p[0], p[1], pts[j][0], pts[j][1]);
    return { site: p, poly }; }).filter(c => c.poly.length >= 3);
}
const polyD = (poly) => "M" + poly.map(p => f1(p[0]) + "," + f1(p[1])).join(" L") + "Z";
const polyArea = (poly) => Math.abs(poly.reduce((a, p, i) => { const q = poly[(i + 1) % poly.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;

// ---------- 5. Isometric: phép chiếu 30° (x sang phải-xuống, y sang trái-xuống, z lên) ----------
const ISO = { cx: 0.8660254, sy: 0.5 };
const isoP = (x, y, z) => [(x - y) * ISO.cx, (x + y) * ISO.sy - z];
// Mỗi vật thể trả về danh sách mặt { pts:[[x,y,z]...], tone } + điểm đỉnh (để kéo đường dẫn nhãn) — tone: "top" | "left" | "right" | "roof" | "roof2" | "door" | "base"
function isoObject(o) {
  const x = +o.x || 0, y = +o.y || 0, w = +o.w || 2, d = +o.d || 2, F = [];
  const box = (x0, y0, z0, bw, bd, bh, top = "top") => {
    F.push({ pts: [[x0, y0 + bd, z0], [x0 + bw, y0 + bd, z0], [x0 + bw, y0 + bd, z0 + bh], [x0, y0 + bd, z0 + bh]], tone: "left" });
    F.push({ pts: [[x0 + bw, y0, z0], [x0 + bw, y0 + bd, z0], [x0 + bw, y0 + bd, z0 + bh], [x0 + bw, y0, z0 + bh]], tone: "right" });
    if (top) F.push({ pts: [[x0, y0, z0 + bh], [x0 + bw, y0, z0 + bh], [x0 + bw, y0 + bd, z0 + bh], [x0, y0 + bd, z0 + bh]], tone: top }); };
  // đầu hồi: tam giác tường dưới mái ở mặt phải (x = x+w) — mặt người xem nhìn thấy; thiếu nó mái sẽ hở
  const gable = (gx, y0, y1, h0, h1) => F.push({ pts: [[gx, y0, h0], [gx, y1, h0], [gx, (y0 + y1) / 2, h1]], tone: "right" });
  let peak = [x + w / 2, y + d / 2, 0];
  if (o.kind === "parcel") { F.push({ pts: [[x, y, 0], [x + w, y, 0], [x + w, y + d, 0], [x, y + d, 0]], tone: "base", dash: true }); peak = [x + w, y, 0]; } // góc phải của thửa: luôn nhìn thấy, không bị nhà trên thửa che
  else if (o.kind === "house") { const h = 0.9 * Math.min(w, d);
    box(x, y, 0, w, d, h, null);
    F.push({ pts: [[x, y, h], [x + w, y, h], [x + w, y + d / 2, h + 0.55 * d], [x, y + d / 2, h + 0.55 * d]], tone: "roof" });
    F.push({ pts: [[x, y + d / 2, h + 0.55 * d], [x + w, y + d / 2, h + 0.55 * d], [x + w, y + d, h], [x, y + d, h]], tone: "roof2" });
    gable(x + w, y, y + d, h, h + 0.55 * d);
    F.push({ pts: [[x + w * 0.38, y + d, 0], [x + w * 0.62, y + d, 0], [x + w * 0.62, y + d, h * 0.62], [x + w * 0.38, y + d, h * 0.62]], tone: "door" });
    peak = [x + w / 2, y + d / 2, h + 0.55 * d]; }
  else if (o.kind === "building" || o.kind === "bank") { const h = o.kind === "bank" ? 1.3 * Math.min(w, d) : 2.4 * Math.min(w, d);
    box(x, y, 0, w, d, h);
    const rows = o.kind === "bank" ? 1 : 4, cols = 3;
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) { // cửa sổ trên mặt trái (mặt y = y+d)
      const wx = x + w * (0.12 + k * 0.29), wz = h * (0.18 + r * (0.7 / rows)), ww = w * 0.18, wh = h * (0.5 / rows);
      F.push({ pts: [[wx, y + d, wz], [wx + ww, y + d, wz], [wx + ww, y + d, wz + wh], [wx, y + d, wz + wh]], tone: o.kind === "bank" ? "door" : "window" }); }
    if (o.kind === "bank") { F.push({ pts: [[x - 0.12, y - 0.12, h], [x + w + 0.12, y - 0.12, h], [x + w + 0.12, y + d / 2, h + 0.5], [x - 0.12, y + d / 2, h + 0.5]], tone: "roof" });
      F.push({ pts: [[x - 0.12, y + d / 2, h + 0.5], [x + w + 0.12, y + d / 2, h + 0.5], [x + w + 0.12, y + d + 0.12, h], [x - 0.12, y + d + 0.12, h]], tone: "roof2" });
      gable(x + w + 0.12, y - 0.12, y + d + 0.12, h, h + 0.5); peak = [x + w / 2, y + d / 2, h + 0.5]; }
    else peak = [x + w / 2, y + d / 2, h]; }
  else if (o.kind === "court") { const h = 1.1 * Math.min(w, d);
    box(x, y, 0, w, d, 0.18); box(x + 0.15, y + 0.15, 0.18, w - 0.3, d - 0.3, h, null);
    for (let k = 0; k < 4; k++) { const cx0 = x + 0.3 + k * (w - 0.6) / 3; F.push({ pts: [[cx0, y + d - 0.15, 0.18], [cx0 + 0.14, y + d - 0.15, 0.18], [cx0 + 0.14, y + d - 0.15, 0.18 + h], [cx0, y + d - 0.15, 0.18 + h]], tone: "door" }); }
    F.push({ pts: [[x, y, 0.18 + h], [x + w, y, 0.18 + h], [x + w, y + d / 2, h + 0.18 + 0.6], [x, y + d / 2, h + 0.18 + 0.6]], tone: "roof" });
    F.push({ pts: [[x, y + d / 2, h + 0.78], [x + w, y + d / 2, h + 0.78], [x + w, y + d, h + 0.18], [x, y + d, h + 0.18]], tone: "roof2" });
    gable(x + w, y, y + d, h + 0.18, h + 0.78);
    peak = [x + w / 2, y + d / 2, h + 0.78]; }
  else if (o.kind === "tree") { const r = 0.45 * Math.min(w, d) || 0.45;
    box(x + w / 2 - 0.08, y + d / 2 - 0.08, 0, 0.16, 0.16, 0.5, null);
    F.push({ circle: [x + w / 2, y + d / 2, 0.5 + r], r, tone: "leaf" }); peak = [x + w / 2, y + d / 2, 0.5 + 2 * r]; }
  else if (o.kind === "person") { box(x + w / 2 - 0.12, y + d / 2 - 0.08, 0, 0.24, 0.16, 0.55);
    F.push({ circle: [x + w / 2, y + d / 2, 0.75], r: 0.16, tone: "roof" }); peak = [x + w / 2, y + d / 2, 0.95]; }
  return { faces: F, peak, depth: x + y + (+o.w || 0) / 2 + (+o.d || 0) / 2 };
}
// Vẽ cả cảnh vào khung bw × bh (inch). colors: { base, baseLine, left, right, top, roof, roof2, door, window, leaf, focus, line, pin }
function isoScene(objects, bw, bh, col) {
  const parts = objects.map((o, i) => Object.assign({ i, o }, isoObject(o))).sort((a, b) => (a.o.kind === "parcel" ? -1 : 0) - (b.o.kind === "parcel" ? -1 : 0) || a.depth - b.depth);
  const all = []; for (const p of parts) for (const f of p.faces) { if (f.pts) f.pts.forEach(q => all.push(isoP(...q))); else { const c = isoP(...f.circle); all.push([c[0] - f.r, c[1] - f.r], [c[0] + f.r, c[1] + f.r]); } }
  for (const p of parts) if (p.o.pin) { const c = isoP(...p.peak); all.push([c[0], c[1] - 1.1]); }
  const x0 = Math.min(...all.map(p => p[0])), x1 = Math.max(...all.map(p => p[0])), y0 = Math.min(...all.map(p => p[1])), y1 = Math.max(...all.map(p => p[1]));
  const k = Math.min(bw / (x1 - x0 || 1), bh / (y1 - y0 || 1)), PX = 100; // inch mỗi đơn vị
  const ox = (bw - (x1 - x0) * k) / 2, oy = (bh - (y1 - y0) * k) / 2;
  const T = (q) => { const p = isoP(...q); return [(ox + (p[0] - x0) * k) * PX, (oy + (p[1] - y0) * k) * PX]; };
  let g = "";
  // vật có focus dùng bảng màu nhấn (col.f); vật khác dùng bảng màu trầm — mắt tìm ngay vật đang bàn
  for (const p of parts) { const foc = p.o.focus, P = foc && col.f ? Object.assign({}, col, col.f) : col, tc = (t) => P[t] || P.top;
    for (const f of p.faces) {
      if (f.circle) { const c = T(f.circle); g += `<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(f.r * k * PX)}" fill="#${tc(f.tone)}" stroke="#${P.line}" stroke-width="2"/>`; continue; }
      const pts = f.pts.map(T).map(q => f1(q[0]) + "," + f1(q[1])).join(" ");
      if (f.tone === "base") g += `<polygon points="${pts}" fill="#${P.base}" stroke="#${P.baseLine}" stroke-width="${foc ? 4 : 2.5}" stroke-dasharray="${f.dash ? "12 8" : "none"}" stroke-linejoin="round"/>`;
      else g += `<polygon points="${pts}" fill="#${tc(f.tone)}" stroke="#${P.line}" stroke-width="2" stroke-linejoin="round"/>`; }
  }
  for (const p of parts) { // ghim vẽ SAU CÙNG — không bị vật khác che
    if (p.o.pin) { const [px, py] = T(p.o.kind === "parcel" ? [+p.o.x + (+p.o.w || 2) / 2, +p.o.y + (+p.o.d || 2) / 2, 0] : p.peak), s = 0.42 * PX; g += `<path d="M${f1(px)},${f1(py)} c${f1(-s * 0.42)},${f1(-s * 0.62)} ${f1(-s * 0.42)},${f1(-s * 1.1)} 0,${f1(-s * 1.1)} c${f1(s * 0.42)},0 ${f1(s * 0.42)},${f1(s * 0.48)} 0,${f1(s * 1.1)}z" fill="#${col.pin}"/><circle cx="${f1(px)}" cy="${f1(py - s * 0.74)}" r="${f1(s * 0.15)}" fill="#fff"/>`; }
  }
  // điểm neo nhãn (inch, trong khung) theo thứ tự objects gốc
  const anchors = []; for (const p of parts) { const [ax, ay] = T(p.peak); anchors[p.i] = [ax / PX, ay / PX - (p.o.pin ? 0.5 : 0)]; }
  return { svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f1(bw * PX)} ${f1(bh * PX)}">${g}</svg>`, anchors };
}

// ---------- 7. Giấy cắt lớp: các dải sống lượn chồng nhau, bóng mềm (có <filter> → PNG) ----------
function paperLayers(seedText, tones, w = 1600, h = 900, top = 0.36) {
  const R = rng(hashStr(seedText)), n = tones.length; let g = "";
  tones.forEach((t, k) => { const base = h * (top + (1 - top) * 0.82 * k / n), amp = h * (0.035 + 0.03 * R()), f = 140 + R() * 120, ph = R() * 9; let d = `M0,${h} L0,${f1(base)}`;
    for (let x = 0; x <= w; x += 40) d += ` L${x},${f1(base + Math.sin(x / f + ph) * amp + Math.sin(x / (f * 0.37) + ph * 2) * amp * 0.35)}`;
    g += `<path d="${d} L${w},${h} Z" fill="#${t}" filter="url(#ps)"/>`; });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><filter id="ps" x="-5%" y="-30%" width="110%" height="160%"><feDropShadow dx="0" dy="-5" stdDeviation="7" flood-color="#000" flood-opacity=".22"/></filter></defs>${g}</svg>`;
}

// ---------- 8. Nền gradient chéo + hạt mịn (feTurbulence → PNG) ----------
function grainBg(c1, c2, w = 1600, h = 900, grain = 0.08) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${c1}"/><stop offset="1" stop-color="#${c2}"/></linearGradient>
<filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 ${grain} 0"/></filter></defs>
<rect width="${w}" height="${h}" fill="url(#g)"/><rect width="${w}" height="${h}" filter="url(#n)"/></svg>`;
}

// ---------- B2. So hai đoạn văn bản theo TỪ (jsdiff, BSD-3-Clause) — gộp thay đổi vụn cho dễ đọc ----------
// jsdiff tách "Trừ trường hợp" → "-Trừ +Trường = -trường =hợp": đúng nhưng vụn. Gộp: hai thay đổi chỉ cách nhau ≤ 1 từ ngắn
// thì thành MỘT cụm bỏ + MỘT cụm thêm (người đọc thấy "câu cũ" → "câu mới" thay vì từng mảnh chữ).
function wordDiff(a, b) {
  const parts = require("diff").diffWords(String(a || ""), String(b || "")), out = [];
  let del = "", ins = "";
  const flush = () => { if (del) out.push({ t: "del", v: del }); if (ins) out.push({ t: "ins", v: ins }); del = ins = ""; };
  parts.forEach((p, i) => {
    if (p.removed) { del += p.value; return; } if (p.added) { ins += p.value; return; }
    const nx = parts[i + 1], short = p.value.trim().split(/\s+/).filter(Boolean).length <= 1 && p.value.trim().length <= 6;
    if ((del || ins) && short && nx && (nx.added || nx.removed)) { del += p.value; ins += p.value; return; }
    flush(); out.push({ t: "eq", v: p.value });
  });
  flush();
  // khoảng trắng giữa cụm bỏ và cụm thêm: tách ra ngoài để gạch ngang không kéo dài qua dấu cách
  return out.flatMap(q => { if (q.t === "eq") return [q]; const m = q.v.match(/^(\s*)([\s\S]*?)(\s*)$/); return [m[1] && { t: "eq", v: m[1] }, m[2] && { t: q.t, v: m[2] }, m[3] && { t: "eq", v: m[3] }].filter(Boolean); });
}

module.exports = { wordDiff, rng, hashStr, ISO_RATIO, isotypeRow, isoGlyph, handMarks, strokePath, voronoiCells, polyD, polyArea, isoScene, paperLayers, grainBg };
