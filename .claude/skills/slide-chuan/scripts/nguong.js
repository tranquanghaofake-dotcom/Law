// NGƯỠNG NỚI — thẻ phong cách (thiet-ke/phong-cach.json, khoá "nguong") được chỉnh ngưỡng máy kiểm; nới lỏng hơn mặc định của skill
// mà không ghi lý do ("lyDoNguong": { khoá: "vì sao" }) là lỗi. Lý do (Chương 3, 15/11/2026): lienHoToiDa nới 10 → 16 để qua máy,
// máy im lặng về 8 slide sáng liền nhau — tới vòng duyệt cuối người mới thấy. Có lý do thì chỉ in ghi chú để người duyệt đọc.
const CAO_LA_NOI = new Set(["deckToiThieu", "bangXetTiLe", "bangCungKieu"]);   // các khoá này: số càng lớn càng lỏng
const THAP_LA_NOI = new Set(["tuongPhanNho"]);                                  // số càng nhỏ càng lỏng
const huong = (k) => (CAO_LA_NOI.has(k) || /ToiDa/.test(k) ? 1 : THAP_LA_NOI.has(k) || /ToiThieu$/.test(k) ? -1 : 0);

function macDinh() {
  const { NGUONG } = require("./da_dang"), { NGUONG_DD } = require("./de_doc"), { NGUONG_PP } = require("./phong_phu");
  return { ...NGUONG, ...NGUONG_DD, ...NGUONG_PP };
}

function kiemNguong(the, mac = macDinh()) {
  const loi = [], ghiChu = [], ng = (the && the.nguong) || {}, ly = (the && the.lyDoNguong) || {};
  for (const [k, v] of Object.entries(ng)) {
    if (!(k in mac) || typeof v !== "number") continue; const h = huong(k), d = mac[k];
    if (!h || (h > 0 ? v <= d : v >= d)) continue;
    if (ly[k]) ghiChu.push(`${k} ${v} (mặc định ${d}): ${ly[k]}`);
    else loi.push(`⚠ ngưỡng nới: ${k} ${v} ${h > 0 ? ">" : "<"} mặc định ${d} — trả về mặc định, hoặc ghi lý do trong "lyDoNguong" của thiet-ke/phong-cach.json (người duyệt đọc)`);
  }
  return { loi, ghiChu };
}

module.exports = { kiemNguong, macDinh };
