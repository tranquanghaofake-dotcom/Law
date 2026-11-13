// Kiểm "bản đồ hỗ trợ" của tầng hình ảnh — phần BỔ SUNG cho hinh/kiem.js (kiem.js lo: `art`, `meta.kit`, deck toàn chữ, Bước 0).
// Ở đây: chart kind không có hình riêng, meta ngoài kit bị bỏ qua, kiểu poster, `photo` sai type, `emoji` sai type, deck ít cảnh.
const CANH = [...require("./bang_chung").TYPES, ...require("./hoi_nghi").TYPES, "book", "bigq", "picks", "lawquote", "tiles", "strip", "cases", "chain", "quizgo", "recap", "toc"];
const CHART_OK = ["bar", "column", "line", "step", "span"];
const ANH_OK = ["cover", "photo", "split", "photostats", "frame", "headline", "lens", "collage", "beforeafter", "photostrip", "gallery", "mosaic", "panelrows"];
const META_BO_QUA = ["style", "art", "motif", "frame", "paper", "native"];   // meta.kit do kiem.js báo
const DECO_TYPES = ["cover", "statement", "section", "end"];
const GOI_Y = "điều luật → book + lawquote · so mức / ngưỡng → tiles · tình huống → cases / chain · kiểm tra → quizgo · chốt → recap · hỏi đáp → toc · riêng hình sự: kiểu bc* (hinh/bang_chung.js) · Công pháp quốc tế: kiểu qt* (hinh/hoi_nghi.js)";

function kiemTang(deck) {
  const out = [], S = deck.slides || [], meta = deck.meta || {};
  for (const k of META_BO_QUA) if (meta[k] != null && meta[k] !== false) out.push(`ℹ meta.${k} chỉ có tác dụng ở tầng lưới Office (node engine/build.js); tầng hình ảnh bỏ qua.`);
  S.forEach((s, i) => {
    const at = `slide ${i + 1}${s.id ? ` (${s.id})` : ""}`;
    if (s.type === "chart" && !CHART_OK.includes(s.kind || "bar")) out.push(`⚠ ${at}: chart "${s.kind}" chưa có hình riêng ở tầng hình ảnh — vẽ thành thanh ngang theo ${s.kind === "gantt" ? "`to`" : "`value`"}. Dùng ${CHART_OK.join(" / ")}, hoặc dựng bản lưới Office.`);
    if (s.layout === "poster" || s.style === "poster") out.push(`⚠ ${at}: kiểu "poster" chưa có ở tầng hình ảnh — dùng ảnh ở bìa (cover + photo) hoặc cảnh \`book\`.`);
    if (s.photo && !ANH_OK.includes(s.type)) out.push(`⚠ ${at}: \`photo\` không hiển thị ở type "${s.type}" (tầng hình ảnh chỉ nhận ảnh ở: ${ANH_OK.join(", ")}).`);
    if (s.emoji && !DECO_TYPES.includes(s.type) && !CANH.includes(s.type)) out.push(`ℹ ${at}: \`emoji\` chỉ gắn được vào ${DECO_TYPES.join(" / ")} và các cảnh.`);
  });
  const canh = S.filter((x) => CANH.includes(x.type)).length;
  if (S.length >= 10 && canh < 4) out.push(`ℹ Deck chỉ có ${canh} cảnh (khuyến nghị 4–8). Gợi ý: ${GOI_Y}.`);
  return out;
}
module.exports = { kiemTang, CANH, CHART_OK, DECO_TYPES };
