// Tự kiểm deck.json TRƯỚC khi dựng bằng tầng hình ảnh: báo những thứ tầng này bỏ qua âm thầm, hoặc deck toàn chữ.
// Gốc: phiên 11/2026 dựng bài hình sự — deck đúng luật, 0 lỗi tràn, nhưng không có ảnh / icon / sticker nào và `art`, `meta.kit`
// bị bỏ qua không một lời cảnh báo; che chữ đi thì không đoán được đề tài (tiêu chí "nhìn mờ", scripts/nhin_mo.py).
const fs = require("fs"), path = require("path");
const DA = require("./da");

// type có mẫu thật sự đọc trường `art` ở tầng hình ảnh (stage/templates.js: panelrows; hinh/canh.js: lawquote dùng `art` làm số điều)
const ART_TYPES = new Set(["panelrows", "lawquote", "bctrich", "cover", "section", "end", "statement"]);   // bctrich dùng `art` làm số điều lớn; cover / section / end / statement: hình lớn của da (hinh/da.js)
// trường làm ra hình thật trong tầng hình ảnh
const VISUAL_KEYS = new Set(["photo", "cutout", "emoji", "emoji2", "icon"]);
// type tự mang hình, không cần trường riêng (mở sách luôn có vật trên bàn)
const BO_HINH_TYPES = new Set([...require("./bang_chung").TYPES, ...require("./hoi_nghi").TYPES, ...require("./so_bhxh").TYPES]);   // bộ hình riêng theo môn (references/canh.md mục 8–9)
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
  if (mat.length) out.push(`ℹ trường "art" bị bỏ qua : ${mat.map(([s, i]) => `slide ${i} (${s.type})`).join(", ")} — chỉ ${[...ART_TYPES].join(", ")} đọc "art". Dùng "emoji" / "icon" / "cutout" / "photo".`);

  // 1b. trường chuyển cảnh / hiệu ứng của tầng Office cũ: tầng hình ảnh không đọc (chuyển cảnh = trans, dur; hiệu ứng vào = theo da)
  for (const k of ["transition", "build", "motion"]) { const c = slides.map((s, i) => [s, i + 1]).filter(([s]) => s && s[k] != null);
    if (c.length) out.push(`ℹ trường "${k}" bị bỏ qua: ${c.map(([s, i]) => `slide ${i} (${s.type})`).join(", ")} — tên của tầng Office cũ; chuyển cảnh ghi "trans" / "dur" (hoặc meta.hinh.chuyen), hiệu ứng vào do da quyết định.`); }

  // 2. tên cũ của tầng Office: meta.kit / meta.style nay đổi thành da (hinh/da.js) — vẫn đọc, nhắc đổi tên
  if (deck.meta?.kit && !deck.meta.da) out.push(`ℹ meta.kit "${deck.meta.kit}" là tên cũ — nay đọc thành da${DA.ALIAS[deck.meta.kit] ? ` "${DA.ALIAS[deck.meta.kit]}"` : ""}; ghi "meta": { "da": "${DA.ALIAS[deck.meta.kit] || deck.meta.kit}" }.`);
  if (deck.meta?.style && !deck.meta.da) out.push(`ℹ meta.style "${deck.meta.style}" (phong cách bìa – chương – kết của tầng Office cũ) không còn vẽ riêng${DA.ALIAS[deck.meta.style] ? ` — dùng da "${DA.ALIAS[deck.meta.style]}"` : ""}.`);

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
  // 5. Nền chung: chỉ còn khi deck ghi "da": "none" (mọi deck khác nhận da theo môn / theo loại bài — hinh/da.js). Lỗi L10 lặp ở 4 bài trước khi có da.
  //    Im lặng khi prep.json ghi người dùng đã đồng ý (chapNhanNenChung). dung.js --strict dừng ở dòng này.
  const da = DA.chonDa(deck, { bcTypes: [...require("./bang_chung").TYPES], qtTypes: [...require("./hoi_nghi").TYPES] });
  if (!da.ten && !da.loi && n >= 6) {
    let pr = {}; try { pr = JSON.parse(fs.readFileSync(path.resolve(deckDir, deck.meta?.prep || "prep.json"), "utf8")) || {}; } catch { /* không có prep.json */ }
    if (!pr.chapNhanNenChung) out.push(`⚠ Nền chung: deck ghi "da": "none" — nền, khung, thẻ là chất liệu chung, che chữ đi không đoán được đề tài (lỗi L10). Chọn da theo môn (${DA.NAMES.join(", ")}) hoặc ghi người dùng đã đồng ý: prep.json → chapNhanNenChung: true.`);
  }
  if (da.ten && ["ho-so", "giay", "kinh"].includes(da.ten) && n >= 6) out.push(`ℹ da "${da.ten}" là bộ chung theo loại bài — nếu môn có da riêng (${DA.NAMES.filter((x) => !["ho-so", "giay", "kinh"].includes(x)).join(", ")}) thì ghi "meta": { "da": "…" }; môn chưa có da thì thêm một khối vào hinh/da.js.`);
  return out;
}

module.exports = { kiemDeck, ART_TYPES, VISUAL_KEYS };
