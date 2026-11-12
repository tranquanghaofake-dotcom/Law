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

test("L3 engine: type chỉ có ở tầng hình ảnh được giải thích, kèm type gần nghĩa", () => {
  const r = validate({ meta: {}, slides: [{ type: "lawquote", title: "T", quote: "q" }] });
  const e = r.errors.join("\n");
  assert.match(e, /chỉ có ở tầng hình ảnh/);
  assert.match(e, /"quote"/);
  const lạ = validate({ meta: {}, slides: [{ type: "khong-co-that", title: "T" }] }).errors.join("\n");
  assert.match(lạ, /không tồn tại/);
});

test("L4 hinh/kiem: art bị bỏ qua, meta.kit, deck toàn chữ", () => {
  const slides = (extra = {}) => Array.from({ length: 7 }, (_, i) => Object.assign({ type: "statement", title: `Slide ${i}` }, i === 1 ? extra : {}));
  const msg = kiemDeck({ meta: { kit: "bien-ban" }, slides: slides({ art: "justice" }) }, { deckDir: tmpdir() }).join("\n");
  assert.match(msg, /"art" bị bỏ qua.*slide 2 \(statement\)/);
  assert.match(msg, /meta\.kit "bien-ban" không được tầng hình ảnh đọc/);
  assert.match(msg, /⚠ deck 7 slide nhưng không có ảnh, icon hay sticker/);
  // có sticker thì hết cảnh báo ⚠; art ở panelrows không bị coi là bỏ qua
  const ok = kiemDeck({ meta: {}, slides: slides({ emoji: "balance-scale" }).map((s, i) => (i < 3 ? { ...s, emoji: "judge" } : s)) }, { deckDir: tmpdir() }).join("\n");
  assert.doesNotMatch(ok, /⚠/);
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

test("L6 check_overflow.py: PPTX có font nhúng (tầng hình ảnh) được bỏ qua kèm lời giải thích, thoát 0", async () => {
  const dir = tmpdir(), f = path.join(dir, "hinh.pptx"), z = new JSZip();
  z.file("[Content_Types].xml", "<Types/>"); z.file("ppt/fonts/font1.fntdata", "x");
  fs.writeFileSync(f, await z.generateAsync({ type: "nodebuffer" }));
  const r = spawnSync("python3", [path.join(ROOT, "scripts", "check_overflow.py"), f], { encoding: "utf8" });
  // cần python-pptx + pdfplumber để vào tới main(); thiếu thì thoát 2 với thông báo thiếu thư viện — khi đó bỏ qua test này
  if (r.status === 2 && /Thiếu thư viện/.test(r.stdout)) return;
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /tầng hình ảnh/);
  assert.match(r.stdout, /--soat/);
});
