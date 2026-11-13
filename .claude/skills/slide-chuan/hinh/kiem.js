// Tự kiểm deck.json TRƯỚC khi dựng bằng tầng hình ảnh: báo những thứ tầng này bỏ qua âm thầm, hoặc deck toàn chữ.
// Gốc: phiên 11/2026 dựng bài hình sự — deck đúng luật, 0 lỗi tràn, nhưng không có ảnh / icon / sticker nào và `art`, `meta.kit`
// bị bỏ qua không một lời cảnh báo; che chữ đi thì không đoán được đề tài (tiêu chí "nhìn mờ", scripts/nhin_mo.py).
const fs = require("fs"), path = require("path");

// type có mẫu thật sự đọc trường `art` ở tầng hình ảnh (stage/templates.js: panelrows; hinh/canh.js: lawquote dùng `art` làm số điều)
const ART_TYPES = new Set(["panelrows", "lawquote", "bctrich"]);   // bctrich (hinh/bang_chung.js) dùng `art` làm số điều lớn
// trường làm ra hình thật trong tầng hình ảnh
const VISUAL_KEYS = new Set(["photo", "cutout", "emoji", "emoji2", "icon"]);
// type tự mang hình, không cần trường riêng (mở sách luôn có vật trên bàn)
const BO_HINH_TYPES = new Set([...require("./bang_chung").TYPES, ...require("./hoi_nghi").TYPES]);   // bộ hình riêng theo môn (references/canh.md mục 8–9)
const INTRINSIC = new Set(["book", ...BO_HINH_TYPES]);   // book: vật trên bàn; bc*: bộ hình "bảng bằng chứng" (hinh/bang_chung.js)

function coHinh(o) {
  if (Array.isArray(o)) return o.some(coHinh);
  if (o && typeof o === "object") return Object.keys(o).some((k) => (VISUAL_KEYS.has(k) && o[k]) || coHinh(o[k]));
  return false;
}

/** deck (đối tượng) → mảng dòng cảnh báo / gợi ý, tiền tố ⚠ hoặc ℹ. Không ném lỗi, không chặn dựng. */
function kiemDeck(deck, { deckDir = process.cwd() } = {}) {
  const out = [], slides = deck.slides || [], n = slides.length;

  // 1. `art` ở type mà tầng hình ảnh không vẽ
  const mat = slides.map((s, i) => [s, i + 1]).filter(([s]) => s.art && !ART_TYPES.has(s.type));
  if (mat.length) out.push(`ℹ trường "art" bị bỏ qua ở tầng hình ảnh: ${mat.map(([s, i]) => `slide ${i} (${s.type})`).join(", ")} — chỉ ${[...ART_TYPES].join(", ")} đọc "art". Dùng "emoji" / "icon" / "cutout" / "photo", hoặc dựng bằng engine/build.js.`);

  // 2. world (meta.kit) chỉ chạy ở engine/build.js
  if (deck.meta?.kit && deck.meta.kit !== "none") out.push(`ℹ meta.kit "${deck.meta.kit}" không được tầng hình ảnh đọc (đồ vật / khung của world chỉ chạy ở engine/build.js): deck này sẽ không mang dấu hiệu của world. Muốn che chữ vẫn đoán được đề tài: thêm ảnh / icon / sticker đúng chủ đề.`);

  // 3. deck toàn chữ
  if (n >= 6) {
    const vis = slides.filter((s) => INTRINSIC.has(s.type) || coHinh(s)).length;
    if (vis === 0) out.push(`⚠ deck ${n} slide nhưng không có ảnh, icon hay sticker nào (photo / cutout / emoji / icon): che chữ đi người nghe không đoán được đề tài. Thêm hình đúng chủ đề rồi kiểm bằng python3 scripts/nhin_mo.py <file.pptx> (xem SKILL.md, tiêu chí "che chữ").`);
    else if (vis / n < 1 / 3) out.push(`ℹ chỉ ${vis}/${n} slide có ảnh / icon / sticker — kiểm bằng python3 scripts/nhin_mo.py <file.pptx>: slide nào che chữ mà không gợi được đề tài thì thêm hình.`);
  }

  // 4. Bước 0 (bỏ qua khi SLIDE_CHUAN_NO_PREP=1, như tests/helpers.js)
  if (process.env.SLIDE_CHUAN_NO_PREP !== "1") {
    const p = path.resolve(deckDir, deck.meta?.prep || "prep.json");
    if (!fs.existsSync(p)) out.push(`ℹ Bước 0: chưa có prep.json cạnh deck.json (python3 scripts/prep.py init <thư_mục_deck> --kind lecture|case|report). Bản này chỉ là nháp.`);
    else { let pr = null; try { pr = JSON.parse(fs.readFileSync(p, "utf8")); } catch { /* prep.py check sẽ báo */ }
      if (pr && pr.approved !== true) out.push(`ℹ Bước 0: prep.json chưa được người dùng duyệt (scripts/prep.py approve chỉ chạy khi người dùng nói duyệt). Bản này chỉ là nháp.`); }
  }
  // 5. Nền chung: deck không dùng bộ hình theo môn nào — lỗi L10 lặp ở 3 bài (loi-da-biet-2026-11.md mục E). Im lặng khi prep.json
  //    ghi người dùng đã đồng ý (chapNhanNenChung) hoặc dựng tầng lưới Office (tang: "luoi"). dung.js --strict dừng ở dòng này.
  if (n >= 6 && !slides.some((s) => BO_HINH_TYPES.has(s.type))) {
    let pr = {}; try { pr = JSON.parse(fs.readFileSync(path.resolve(deckDir, deck.meta?.prep || "prep.json"), "utf8")) || {}; } catch { /* không có prep.json */ }
    if (!pr.chapNhanNenChung && pr.tang !== "luoi") out.push(`⚠ Nền chung: deck ${n} slide không dùng bộ hình theo môn nào (bc* hình sự, qt* Công pháp quốc tế) — nền, khung, hình dán là chất liệu chung, che chữ đi không đoán được đề tài (lỗi L10). Dùng bộ có sẵn, làm bộ mới (references/canh.md mục 8–9), hoặc ghi người dùng đã đồng ý: prep.json → chapNhanNenChung: true.`);
  }
  return out;
}

module.exports = { kiemDeck, ART_TYPES, VISUAL_KEYS };
