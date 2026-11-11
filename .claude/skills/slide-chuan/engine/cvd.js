// Giả lập mù màu (thiếu sắc giác đỏ–lục) — Machado, Oliveira & Fernandes (2009), "A Physiologically-based Model for Simulation
// of Color Vision Deficiency", IEEE TVCG 15(6). Ma trận mức nặng 1.0, áp lên RGB tuyến tính. Khoảng cách màu: CIE76 ΔE trong Lab.
// Khoảng 8% nam giới thiếu sắc giác đỏ–lục — trên lớp 60 người thường có vài người.
const MAT = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
};
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const rgb = (h) => [0, 2, 4].map(i => lin(parseInt(h.slice(i, i + 2), 16)));
function lab([r, g, b]) {
  const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047, Y = 0.2126 * r + 0.7152 * g + 0.0722 * b, Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}
const sim = (h, k) => { const c = rgb(h); if (!k) return c; return MAT[k].map(row => Math.min(1, Math.max(0, row[0] * c[0] + row[1] * c[1] + row[2] * c[2]))); };
const dE = (a, b, k) => { const p = lab(sim(a, k)), q = lab(sim(b, k)); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); };
// khoảng cách NHỎ NHẤT giữa hai màu với người nhìn thường / mù đỏ / mù lục
const minDE = (a, b) => Math.min(dE(a, b, "protan"), dE(a, b, "deutan"));
module.exports = { dE, minDE, sim };
