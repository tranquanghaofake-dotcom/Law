// MẢNG NỀN HỮU CƠ (blob) sau minh hoạ — lượt nghiên cứu công cụ 18/11/2026. Cách làm theo thư viện "blobs" (g-harel, MIT):
// n điểm quanh tâm, bán kính lệch ngẫu nhiên (hạt giống cố định → dựng lại ra đúng hình), nối bằng đường cong Catmull-Rom khép kín.
// Storyset / Slidesgo đặt một mảng màu nhạt sau nhân vật để tách hình khỏi nền trắng và tạo chiều sâu, không cần khung hay bóng đổ.
//   blob(cx, cy, rx, ry, { diem: 7, lech: 0.22, hat: 3 }) → chuỗi d của <path>
function ngauNhien(hat) { let a = hat >>> 0 || 1; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; }
function blob(cx, cy, rx, ry = rx, { diem = 7, lech = 0.22, hat = 3 } = {}) {
  const r = ngauNhien(hat), p = [];
  for (let i = 0; i < diem; i++) { const g = (i / diem) * 2 * Math.PI + (r() - 0.5) * 0.4, k = 1 - lech + r() * lech * 2; p.push([cx + Math.cos(g) * rx * k, cy + Math.sin(g) * ry * k]); }
  const f = (v) => v.toFixed(1); let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 0; i < diem; i++) { const [a, b, c, e] = [p[(i - 1 + diem) % diem], p[i], p[(i + 1) % diem], p[(i + 2) % diem]];
    d += ` C${f(b[0] + (c[0] - a[0]) / 6)} ${f(b[1] + (c[1] - a[1]) / 6)} ${f(c[0] - (e[0] - b[0]) / 6)} ${f(c[1] - (e[1] - b[1]) / 6)} ${f(c[0])} ${f(c[1])}`; }
  return d + "Z";
}
module.exports = { blob };
