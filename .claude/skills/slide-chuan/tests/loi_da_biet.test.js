// Test cho các lỗi tìm ra khi dựng bài hình sự (11/2026): xem references/loi-da-biet-2026-11.md
const test = require("node:test"), assert = require("node:assert");
const fs = require("fs"), path = require("path");
const { spawnSync } = require("child_process");
const JSZip = require("jszip");
const { ROOT, tmpdir } = require("./helpers");
const { validate } = require("../engine/validate");
const { render } = require("../stage/templates");
const { kiemDeck } = require("../hinh/kiem");

const lv = (n) => Array.from({ length: n }, (_, i) => ({ head: `Tầng ${i + 1}`, text: "x" }));

test("L1 pyramid: 4 tầng dùng bản gọn (c5), 3 tầng giữ cỡ thường", () => {
  const four = render({ type: "pyramid", title: "Mức cao nhất quyết định loại tội phạm", levels: lv(4) }, { meta: {} }, {}, 0, 1);
  assert.match(four.html, /class="py c5"/);
  const three = render({ type: "pyramid", title: "Ba tầng", levels: lv(3) }, { meta: {} }, {}, 0, 1);
  assert.doesNotMatch(three.html, /py c5/);
});

test("L2 engine: trường id / toc của tầng hình ảnh không bị báo 'trường lạ'", () => {
  const r = validate({ meta: { kind: "lecture" }, slides: [{ type: "cover", title: "T", id: "bia", toc: "Bìa" }] });
  assert.ok(!r.warnings.join("\n").includes('trường lạ "id"'), r.warnings.join("\n"));
  assert.ok(!r.warnings.join("\n").includes('trường lạ "toc"'), r.warnings.join("\n"));
});

test("L3 validate: kiểu cảnh / bộ hình được nhận khi khai trong extraTypes; kiểu lạ báo kèm danh sách cả kiểu cảnh", () => {
  assert.deepStrictEqual(validate({ meta: {}, slides: [{ type: "lawquote", title: "T", quote: "q" }] }, { extraTypes: ["lawquote"] }).errors, []);
  const e = validate({ meta: {}, slides: [{ type: "lawquot", title: "T" }] }, { extraTypes: ["lawquote"] }).errors.join("\n");
  assert.match(e, /"lawquot" không tồn tại/); assert.match(e, /lawquote/);
  const lạ = validate({ meta: {}, slides: [{ type: "khong-co-that", title: "T" }] }).errors.join("\n");
  assert.match(lạ, /không tồn tại/);
});

test("L4 hinh/kiem: art bị bỏ qua, meta.kit, deck toàn chữ", () => {
  const slides = (extra = {}) => Array.from({ length: 7 }, (_, i) => Object.assign({ type: "statement", title: `Slide ${i}` }, i === 1 ? extra : {}));
  const msg = kiemDeck({ meta: { kit: "bien-ban" }, slides: slides({ type: "table", art: "justice" }) }, { deckDir: tmpdir() }).join("\n");
  assert.match(msg, /"art" bị bỏ qua.*slide 2 \(table\)/);
  assert.match(msg, /meta\.kit "bien-ban" là tên cũ — nay đọc thành da/);
  assert.match(msg, /⚠ deck 7 slide nhưng không có ảnh, icon hay sticker/);
  // có sticker thì hết cảnh báo "deck toàn chữ"; nhưng sticker KHÔNG thay được bộ hình theo môn (mục E, 13/11/2026) → deck ghi "da": "none" vẫn bị ⚠ Nền chung
  const ok = kiemDeck({ meta: { da: "none" }, slides: slides({ emoji: "balance-scale" }).map((s, i) => (i < 3 ? { ...s, emoji: "judge" } : s)) }, { deckDir: tmpdir() }).join("\n");
  assert.doesNotMatch(ok, /⚠ deck \d+ slide nhưng không có ảnh/);
  assert.match(ok, /⚠ Nền chung/);
  const pr = kiemDeck({ meta: {}, slides: [{ type: "panelrows", title: "x", art: "gcn" }] }, { deckDir: tmpdir() }).join("\n");
  assert.doesNotMatch(pr, /"art" bị bỏ qua/);
});

test("L4b hinh/kiem: nhắc Bước 0 khi thiếu / chưa duyệt prep.json (trừ khi SLIDE_CHUAN_NO_PREP=1)", () => {
  const dir = tmpdir(), old = process.env.SLIDE_CHUAN_NO_PREP;
  try {
    process.env.SLIDE_CHUAN_NO_PREP = "";
    assert.match(kiemDeck({ meta: {}, slides: [{ type: "cover", title: "T" }] }, { deckDir: dir }).join("\n"), /chưa có prep\.json/);
    fs.writeFileSync(path.join(dir, "prep.json"), JSON.stringify({ approved: false }));
    assert.match(kiemDeck({ meta: {}, slides: [{ type: "cover", title: "T" }] }, { deckDir: dir }).join("\n"), /chưa được người dùng duyệt/);
    fs.writeFileSync(path.join(dir, "prep.json"), JSON.stringify({ approved: true }));
    assert.doesNotMatch(kiemDeck({ meta: {}, slides: [{ type: "cover", title: "T" }] }, { deckDir: dir }).join("\n"), /Bước 0/);
    process.env.SLIDE_CHUAN_NO_PREP = "1";
    assert.doesNotMatch(kiemDeck({ meta: {}, slides: [{ type: "cover", title: "T" }] }, { deckDir: tmpdir() }).join("\n"), /Bước 0/);
  } finally { if (old === undefined) delete process.env.SLIDE_CHUAN_NO_PREP; else process.env.SLIDE_CHUAN_NO_PREP = old; }
});
