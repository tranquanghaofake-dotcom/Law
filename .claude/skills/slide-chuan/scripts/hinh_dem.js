// BIỂU ĐỒ HÌNH ĐẾM (isotype — Otto Neurath) — lượt nghiên cứu công cụ 18/11/2026.
// Tỉ lệ khó hình dung ("giảm 43,8 %") → hàng biểu tượng: "cứ 10 hợp đồng mới chỉ còn 5,6". Biểu tượng phần lẻ được cắt đúng tỉ lệ.
//   hangHinh(svgIcon, { n: 10, giaTri: 5.62, x, y, co: 64, cach: 14, mauDay: "#5DA93F", mauRong: "#DADFE2", chinh: "#1E2326", id: "a" })
//     → { svg: chuỗi để đặt vào lớp hình, rong, cao }
// svgIcon: icon Phosphor duotone (scripts/icon_duo.js). Dùng cho 1 tỉ lệ / slide; n ≤ 20; ghi rõ "cứ 10 … thì …" bằng chữ cạnh hàng hình.
const { iconDuo } = require("./icon_duo");
function hangHinh(svgIcon, { n = 10, giaTri, x = 0, y = 0, co = 64, cach = 14, mauDay = "#5DA93F", mauRong = "#DADFE2", chinh = "#1E2326", id = "hd" } = {}) {
  let o = "";
  for (let i = 0; i < n; i++) {
    const cx = x + co / 2 + i * (co + cach), cy = y + co / 2, phan = Math.max(0, Math.min(1, giaTri - i));
    o += `<g opacity="0.55">${iconDuo(svgIcon, cx, cy, co, { chinh: mauRong, phu: mauRong })}</g>`;   // nền: biểu tượng rỗng (đã mất)
    if (phan > 0) {
      const cid = `${id}-${i}`;
      o += `<clipPath id="${cid}"><rect x="${(cx - co / 2).toFixed(1)}" y="${y}" width="${(co * phan).toFixed(1)}" height="${co}"/></clipPath><g clip-path="url(#${cid})">${iconDuo(svgIcon, cx, cy, co, { chinh, phu: mauDay })}</g>`;
    }
  }
  return { svg: o, rong: n * co + (n - 1) * cach, cao: co };
}
module.exports = { hangHinh };
