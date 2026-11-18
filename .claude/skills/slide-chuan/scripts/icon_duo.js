// ICON HAI TÔNG (Phosphor duotone, MIT — https://phosphoricons.com) — lượt nghiên cứu công cụ 18/11/2026.
// Mỗi icon có hai lớp: nét chính (đậm) + mảng phụ (gốc opacity 0.2). Tô nét chính màu mực, mảng phụ màu nhấn của bài
// → icon có khối màu, đứng cùng giọng với minh hoạ phẳng Storyset; icon nét mảnh (Tabler) trông "chung chung" khi đặt cạnh minh hoạ.
//   iconDuo(svgText, cx, cy, co, { chinh: "#1E2326", phu: "#5DA93F", phuDuc: 1 }) → chuỗi <g> đặt vào SVG lớp hình
// Tải icon: https://unpkg.com/@phosphor-icons/core@2.1.1/assets/duotone/<tên>-duotone.svg (tên tra ở phosphoricons.com)
function iconDuo(svg, cx, cy, co, { chinh = "#1E2326", phu = "#5DA93F", phuDuc = 1 } = {}) {
  const than = svg.slice(svg.indexOf(">", svg.indexOf("<svg")) + 1, svg.lastIndexOf("</svg>"))
    .replace(/<rect width="256" height="256" fill="none"\/>/g, "")
    .replace(/opacity="0\.2"/g, `data-phu="1" fill="${phu}" opacity="${phuDuc}"`);
  const s = co / 256;
  return `<g transform="translate(${(cx - co / 2).toFixed(1)} ${(cy - co / 2).toFixed(1)}) scale(${s.toFixed(4)})" fill="${chinh}">${than}</g>`;
}
module.exports = { iconDuo };
