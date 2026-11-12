// Kiểm "bản đồ hỗ trợ" của tầng hình ảnh: nói TRƯỚC điều deck.json đòi mà tầng này không vẽ, thay vì lặng lẽ bỏ qua
// (nguyên nhân gốc của deck "sơ sài": gantt ra vạch mảnh, art / style / world bị bỏ, deck toàn type thường không có hình).
const CANH = ["book", "bigq", "picks", "lawquote", "tiles", "strip", "cases", "chain", "quizgo", "recap", "toc"];
const CHART_OK = ["bar", "column", "line", "step", "span"];
const ANH_OK = ["cover", "photo", "split", "photostats", "frame", "headline", "lens", "collage", "beforeafter", "photostrip", "gallery", "mosaic", "panelrows"];
const META_BO_QUA = ["style", "kit", "art", "motif", "frame", "paper", "native"];
const DECO_TYPES = ["cover", "statement", "section", "end"];
const GOI_Y = "điều luật → book + lawquote · so mức / ngưỡng → tiles · tình huống → cases / chain · kiểm tra → quizgo · chốt → recap · hỏi đáp → toc";

function kiemTang(deck) {
  const out = [], S = deck.slides || [], meta = deck.meta || {};
  for (const k of META_BO_QUA) if (meta[k] != null && meta[k] !== false) out.push(`ℹ meta.${k} chỉ có tác dụng ở tầng lưới Office (node engine/build.js); tầng hình ảnh bỏ qua.`);
  S.forEach((s, i) => {
    const at = `slide ${i + 1}${s.id ? ` (${s.id})` : ""}`;
    if (s.type === "chart" && !CHART_OK.includes(s.kind || "bar")) out.push(`⚠ ${at}: chart "${s.kind}" chưa có hình riêng ở tầng hình ảnh — vẽ thành thanh ngang theo ${s.kind === "gantt" ? "`to`" : "`value`"}. Dùng ${CHART_OK.join(" / ")}, hoặc dựng bản lưới Office.`);
    if (s.art && s.art !== "none" && !CANH.includes(s.type)) out.push(`⚠ ${at}: \`art\` ("${s.art}") không được vẽ ở tầng hình ảnh. Với ${DECO_TYPES.join(" / ")} dùng \`emoji\` (+ \`emoji2\`, \`emojiPos\`); hoặc dùng cảnh.`);
    if (s.layout === "poster" || s.style === "poster") out.push(`⚠ ${at}: kiểu "poster" chưa có ở tầng hình ảnh — dùng ảnh ở bìa (cover + photo) hoặc cảnh \`book\`.`);
    if (s.photo && !ANH_OK.includes(s.type)) out.push(`⚠ ${at}: \`photo\` không hiển thị ở type "${s.type}" (tầng hình ảnh chỉ nhận ảnh ở: ${ANH_OK.join(", ")}).`);
    if (s.emoji && !DECO_TYPES.includes(s.type) && !CANH.includes(s.type)) out.push(`ℹ ${at}: \`emoji\` chỉ gắn được vào ${DECO_TYPES.join(" / ")} và các cảnh.`);
  });
  const canh = S.filter((s) => CANH.includes(s.type)).length;
  const hinh = S.filter((s) => CANH.includes(s.type) || s.emoji || s.photo || s.cutout).length;
  if (S.length >= 10 && canh < 4) out.push(`ℹ Deck chỉ có ${canh} cảnh (khuyến nghị 4–8). Gợi ý: ${GOI_Y}.`);
  if (S.length >= 8 && hinh / S.length < 1 / 3) out.push(`⚠ Chỉ ${hinh}/${S.length} slide có hình (cảnh, hình dán, ảnh) — deck sẽ trông nhiều chữ. Gợi ý: ${GOI_Y}.`);
  return out;
}
module.exports = { kiemTang, CANH, CHART_OK, DECO_TYPES };
