// NÉT VẼ TAY (khoanh, gạch chân) — lượt nghiên cứu công cụ 18/11/2026, cách làm theo Rough.js (Preet Shihn, MIT):
// hai nét hơi lệch nhau, bán kính dao động nhẹ, điểm cuối vượt quá điểm đầu một chút → giống bút dạ khoanh trên giấy.
// Dùng tiết chế: tối đa MỘT nét khoanh mỗi slide, vào sau cùng (sau khi người nói đã nêu con số) — chỗ mắt cần dừng.
// Đặt lớp nét vẽ TRƯỚC hộp chữ trong DOM (nằm dưới chữ), vòng khoanh rộng hơn chữ ≥ 14 px nên không cắt nét chữ.
//   khoanh(cx, cy, rx, ry, { hat, net }) → chuỗi <path> · gachChan(x1, x2, y, { hat, net }) → chuỗi <path>
function ngauNhien(hat) { let a = hat >>> 0 || 1; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; }
const f = (v) => v.toFixed(1);
function khoanh(cx, cy, rx, ry, { hat = 1, net = 5, mau = "#F39A1E" } = {}) {
  const r = ngauNhien(hat); let o = "";
  for (let lan = 0; lan < 2; lan++) {
    const bd = -2.2 + (r() - 0.5) * 0.5, kt = bd + 2 * Math.PI + 0.35 + r() * 0.25, n = 26, p = [];
    for (let i = 0; i <= n; i++) { const g = bd + ((kt - bd) * i) / n, k = 1 + (r() - 0.5) * 0.06 + lan * 0.035; p.push([cx + Math.cos(g) * rx * k, cy + Math.sin(g) * ry * k]); }
    let d = `M${f(p[0][0])} ${f(p[0][1])}`;
    for (let i = 1; i < p.length - 1; i++) d += ` Q${f(p[i][0])} ${f(p[i][1])} ${f((p[i][0] + p[i + 1][0]) / 2)} ${f((p[i][1] + p[i + 1][1]) / 2)}`;
    o += `<path d="${d}" fill="none" stroke="${mau}" stroke-width="${lan ? net * 0.6 : net}" stroke-linecap="round" opacity="${lan ? 0.7 : 1}"/>`;
  }
  return o;
}
function gachChan(x1, x2, y, { hat = 1, net = 6, mau = "#F39A1E" } = {}) {
  const r = ngauNhien(hat), c = (a) => y + (r() - 0.5) * a;
  return `<path d="M${f(x1)} ${f(c(4))} Q${f((x1 + x2) / 2)} ${f(c(10))} ${f(x2)} ${f(c(4))}" fill="none" stroke="${mau}" stroke-width="${net}" stroke-linecap="round"/>`
    + `<path d="M${f(x1 + 14)} ${f(c(4) + 9)} Q${f((x1 + x2) / 2)} ${f(c(10) + 7)} ${f(x2 - 20)} ${f(c(4) + 8)}" fill="none" stroke="${mau}" stroke-width="${net * 0.55}" stroke-linecap="round" opacity="0.7"/>`;
}
module.exports = { khoanh, gachChan };
