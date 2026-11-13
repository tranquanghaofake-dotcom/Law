// Kiểm "bản đồ hỗ trợ" của tầng hình ảnh — phần BỔ SUNG cho hinh/kiem.js (kiem.js lo: `art`, `meta.kit`, deck toàn chữ, Bước 0).
// Ở đây: chart kind lạ, meta không còn tác dụng, `photo` sai type, `emoji` sai type, deck ít cảnh.
const CANH = [...require("./bang_chung").TYPES, ...require("./hoi_nghi").TYPES, ...require("./so_bhxh").TYPES, "book", "bigq", "picks", "lawquote", "tiles", "strip", "cases", "chain", "quizgo", "recap", "toc"];
const CHART_OK = require("../stage/bieu_do").KINDS;   // đủ 10 kind (stage/bieu_do.js)
const ANH_OK = ["cover", "agenda", "section", "hero", "closing", "end", "photo", "split", "photostats", "frame", "headline", "lens", "collage", "beforeafter", "photostrip", "gallery", "mosaic", "panelrows"];
// meta không còn tác dụng (của tầng Office cũ, đã bỏ 11/2026); meta.kit / meta.style do kiem.js báo (đọc thành da)
const META_BO_QUA = { art: "hình lớn lấy theo da (hinh/da.js); đổi ở từng slide bìa / chương / kết bằng \"art\"", paper: "nền giấy do da quyết định (da \"giay\")", native: "biểu đồ là hình vẽ; sửa số trong deck.json rồi dựng lại (không còn Edit Data)" };
const DECO_TYPES = ["cover", "statement", "section", "end"];
const GOI_Y = "điều luật → book + lawquote · so mức / ngưỡng → tiles · tình huống → cases / chain · kiểm tra → quizgo · chốt → recap · hỏi đáp → toc · riêng hình sự: kiểu bc* (hinh/bang_chung.js) · Công pháp quốc tế: kiểu qt* (hinh/hoi_nghi.js)";

function kiemTang(deck) {
  const out = [], S = deck.slides || [], meta = deck.meta || {};
  for (const [k, vi] of Object.entries(META_BO_QUA)) if (meta[k] != null && meta[k] !== false) out.push(`ℹ meta.${k} không còn tác dụng — ${vi}.`);
  S.forEach((s, i) => {
    const at = `slide ${i + 1}${s.id ? ` (${s.id})` : ""}`;
    if (s.type === "chart" && !CHART_OK.includes(s.kind || "bar")) out.push(`⚠ ${at}: chart "${s.kind}" không có — dùng ${CHART_OK.join(" / ")}.`);
    if (s.photo && !ANH_OK.includes(s.type) && !CANH.includes(s.type)) out.push(`⚠ ${at}: \`photo\` không hiển thị ở type "${s.type}" (chỉ nhận ảnh ở: ${ANH_OK.join(", ")} và các cảnh).`);
    if (s.emoji && !DECO_TYPES.includes(s.type) && !CANH.includes(s.type)) out.push(`ℹ ${at}: \`emoji\` chỉ gắn được vào ${DECO_TYPES.join(" / ")} và các cảnh.`);
  });
  const canh = S.filter((x) => CANH.includes(x.type)).length;
  if (S.length >= 10 && canh < 4) out.push(`ℹ Deck chỉ có ${canh} cảnh (khuyến nghị 4–8). Gợi ý: ${GOI_Y}.`);
  return out;
}
module.exports = { kiemTang, CANH, CHART_OK, DECO_TYPES };
