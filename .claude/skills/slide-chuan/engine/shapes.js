// BỘ DỰNG HÌNH — học CÁCH LÀM của người thiết kế slide, không chép kết quả:
//   "Chèn hình cơ bản (dấu ngoặc lớn, chữ nhật bo góc) → kéo nút vàng chỉnh độ cong → sao chép, xoay → Gộp hình dạng › Kết hợp"
//   (bài "Vẻ đẹp phương Đông", Powerpoint – Minh Phạm, TikTok 11/2026).
// Ở đây: mỗi hình cơ bản là một đa giác (đường cong được rải điểm), phép gộp dùng polygon-clipping (MIT, mfogel/polygon-clipping —
// thuật toán Martinez–Rueda quét mặt phẳng). Kết quả là đa giác → hình tự do (custGeom) của PowerPoint: mở ra vẫn kéo giãn, đổi màu,
// "Tô bằng ảnh" được như hình người dùng tự gộp.
// Đơn vị: inch. Một "hình" = MultiPolygon theo chuẩn GeoJSON: [ [ [ [x,y], ... ] /* vòng ngoài */, /* lỗ */ ... ], ... ].
const pc = require("polygon-clipping");

const N = 24; // số điểm rải trên mỗi đoạn cong — đủ mịn ở cỡ slide, file không phình
function cubic(p0, p1, p2, p3, n = N) { const out = [];
  for (let i = 1; i <= n; i++) { const t = i / n, u = 1 - t;
    out.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); }
  return out; }
function arc(cx, cy, rx, ry, a0, a1, n = N) { const out = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); } return out; }
const close = (ring) => { const a = ring[0], b = ring[ring.length - 1]; return a[0] === b[0] && a[1] === b[1] ? ring : [...ring, a]; };
const shape = (ring) => [[close(ring)]];

// ---------- hình cơ bản ----------
const rect = (x, y, w, h) => shape([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
// chữ nhật bo góc; r = bán kính góc (≤ nửa cạnh ngắn — bằng nửa cạnh ngắn thì thành hình viên thuốc)
function roundRect(x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); const P = Math.PI;
  return shape([...arc(x + w - r, y + r, r, r, -P / 2, 0), ...arc(x + w - r, y + h - r, r, r, 0, P / 2), ...arc(x + r, y + h - r, r, r, P / 2, P), ...arc(x + r, y + r, r, r, P, 1.5 * P)]); }
const ellipse = (x, y, w, h) => shape(arc(x + w / 2, y + h / 2, w / 2, h / 2, 0, 2 * Math.PI, 4 * N).slice(0, -1));
// vòm cửa: nửa trên là bán nguyệt
function arch(x, y, w, h) { const r = w / 2; return shape([[x, y + h], ...arc(x + r, y + r, r, Math.min(r, h), Math.PI, 2 * Math.PI), [x + w, y + h]]); }
// DẤU NGOẶC LỚN (như "}" của PowerPoint) — vùng giữa nét ngoặc và dây cung, mũi nhọn ở giữa hướng theo dir (up | down | left | right).
// k = độ cong (nút vàng): 0 = gần như tam giác, 1 = vai tròn đầy.
function brace(x, y, w, h, dir = "up", k = 0.6) {
  // dựng hướng "up" trong hộp đơn vị [0,1]×[0,1] (mũi ở (0.5, 0), hai chân ở đáy) rồi xoay vào hộp thật
  const half = cubic([0, 1], [0, 1 - 0.55 * k], [0.5 - 0.06, 0.38 + 0.25 * (1 - k)], [0.5, 0]);
  const right = half.slice(0, -1).reverse().map(([u, v]) => [1 - u, v]);
  const unit = [[0, 1], ...half, ...right];
  const map = { up: ([u, v]) => [x + u * w, y + v * h], down: ([u, v]) => [x + u * w, y + (1 - v) * h],
    left: ([u, v]) => [x + v * w, y + u * h], right: ([u, v]) => [x + (1 - v) * w, y + u * h] }[dir];
  return shape(unit.map(map)); }

// ---------- phép gộp (Gộp hình dạng của PowerPoint) ----------
const union = (...a) => pc.union(...a);          // Kết hợp
const subtract = (a, ...b) => pc.difference(a, ...b); // Trừ đi
const intersect = (...a) => pc.intersection(...a);    // Giao nhau
// "sao chép, phóng lớn nhẹ" — co giãn quanh tâm hộp bao
function bbox(sh) { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const poly of sh) for (const ring of poly) for (const [x, y] of ring) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }; }
function scale(sh, kx, ky = kx) { const b = bbox(sh), cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  return sh.map(poly => poly.map(ring => ring.map(([x, y]) => [cx + (x - cx) * kx, cy + (y - cy) * ky]))); }
// phóng sao cho mỗi phía rộng thêm đúng d inch (viền đều trên hình dẹt)
const grow = (sh, d) => { const b = bbox(sh); return scale(sh, (b.w + 2 * d) / b.w, (b.h + 2 * d) / b.h); };

// ---------- công thức khung: ghép từ hình cơ bản, đúng thứ tự thao tác trong bài ----------
// Mỗi công thức nhận hộp (x, y, w, h) và trả về MỘT hình đã gộp.
const FRAMES = {
  rect: (x, y, w, h) => roundRect(x, y, w, h, Math.min(w, h) * 0.06),
  arch,
  circle: ellipse,
  // cửa sổ hoa văn: 4 dấu ngoặc lớn xoay quanh 4 cạnh (mũi nhọn ở giữa cạnh) + 2 chữ nhật bo góc nằm ngang và 1 nằm dọc làm thân,
  // các đầu bo tròn của chữ nhật tạo thành "cánh" ở 4 góc → Kết hợp. Chỉ hợp chủ đề văn hoá, lịch sử, di sản phương Đông.
  ogee: (x, y, w, h) => { const bw = w * 0.5, bh = h * 0.5, dw = w * 0.17, dh = h * 0.17;
    return union(
      brace(x + (w - bw) / 2, y, bw, dh * 1.25, "up"), brace(x + (w - bw) / 2, y + h - dh * 1.25, bw, dh * 1.25, "down"),
      brace(x, y + (h - bh) / 2, dw * 1.25, bh, "left"), brace(x + w - dw * 1.25, y + (h - bh) / 2, dw * 1.25, bh, "right"),
      roundRect(x + dw * 0.9, y + dh * 1.05, w - 1.8 * dw, h - 2.1 * dh, Math.min(w, h) * 0.13),
      roundRect(x + dw * 1.05, y + dh * 0.9, w - 2.1 * dw, h - 1.8 * dh, Math.min(w, h) * 0.13)); },
};
const FRAME_NAMES = Object.keys(FRAMES);
const frame = (kind, x, y, w, h) => (FRAMES[kind] || FRAMES.rect)(x, y, w, h);

// ---------- xuất ----------
// → points của pptxgenjs (custGeom), toạ độ tương đối với góc hộp bao; nhiều vòng = moveTo (lỗ, mảnh rời)
function toPoints(sh) { const b = bbox(sh), pts = [];
  for (const poly of sh) for (const ring of poly) ring.slice(0, -1).forEach(([x, y], i) => pts.push(i === 0 ? { x: x - b.x, y: y - b.y, moveTo: true } : { x: x - b.x, y: y - b.y }));
  // pptxgenjs: điểm đầu tiên luôn là moveTo; đóng từng vòng
  const out = []; pts.forEach((p, i) => { if (p.moveTo && i) out.push({ close: true }); out.push(p.moveTo && !i ? { x: p.x, y: p.y } : p); }); out.push({ close: true });
  return { box: b, points: out }; }
// → đường SVG (để làm mặt nạ / xem trước), đơn vị inch nhân px
const toSvgPath = (sh, px = 1, ox = 0, oy = 0) => sh.map(poly => poly.map(ring => "M" + ring.slice(0, -1).map(([x, y]) => `${((x - ox) * px).toFixed(1)},${((y - oy) * px).toFixed(1)}`).join(" L") + " Z").join(" ")).join(" ");

module.exports = { rect, roundRect, ellipse, arch, brace, union, subtract, intersect, scale, grow, bbox, frame, FRAMES, FRAME_NAMES, toPoints, toSvgPath };
