// Test: đo chữ lúc dựng phải bắt được ca đè (cards tên chữ hoa 18 ký tự) mà giới hạn ký tự bỏ lọt.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { ROOT, build, buildDeck, cover } = require("./helpers");

const STRESS = path.join(__dirname, "stress.json");
const THEMES = ["teal", "kem", "son"];

test("stress.json: không vượt ký tự nhưng đo chữ bắt được cards.items[*].name", () => {
  const r = build([STRESS, path.join(require("os").tmpdir(), "stress-t.pptx")]);
  assert.strictEqual(r.code, 0, r.all);
  for (let i = 0; i < 4; i++) assert.ok(r.all.includes(`Slide 3`) && r.all.includes(`items[${i}].name`), `thiếu items[${i}].name\n${r.all}`);
});
test("stress.json --strict => exit 1", () => {
  const r = build([STRESS, path.join(require("os").tmpdir(), "stress-t.pptx"), "--strict"]);
  assert.strictEqual(r.code, 1, r.all);
});
test("cards: tên chữ hoa 18 ký tự bị báo, tên ngắn chữ thường thì không", () => {
  const mk = (name) => ({ slides: [cover, { type: "cards", title: "Tiêu đề", items: [1, 2, 3, 4].map(() => ({ icon: "FaUser", name, who: "ai đó", desc: "mô tả" })) }] });
  const bad = buildDeck(mk("NGƯỜI MUA ĐƯỢC BẢO"));
  assert.ok(/items\[0\]\.name/.test(bad.all), bad.all);
  const ok = buildDeck(mk("Người mua ngay"));
  assert.ok(!/items\[0\]\.name/.test(ok.all), ok.all);
});
test("banan142 --strict xanh ở cả 3 theme", () => {
  for (const t of THEMES) {
    const r = build([path.join(ROOT, "examples", "banan142.json"), path.join(require("os").tmpdir(), `b_${t}.pptx`), "--theme", t, "--strict"]);
    assert.strictEqual(r.code, 0, `${t}:\n${r.all}`);
    assert.ok(!/cần \d+ dòng/.test(r.all), `${t}:\n${r.all}`);
  }
});
test("không còn Cambria trong themes (không có chữ Việt đủ dấu trên Linux)", () => {
  const src = fs.readFileSync(path.join(ROOT, "engine", "themes.js"), "utf8");
  assert.ok(!/Cambria/.test(src.replace(/\/\/.*$/gm, "")), "còn Cambria");
});

test("textW: đo bề rộng một dòng bằng font thật (chip/nhãn co vừa chữ)", () => {
  const { textW } = require("../engine/measure");
  const o = { fontFace: "Calibri", fontSize: 10 };
  const a = textW("iiiiiiiiii", o), b = textW("MMMMMMMMMM", o);
  if (a == null) return; // máy không có font: engine dùng ước lượng theo ký tự
  assert.ok(b > a * 2, `chữ rộng phải đo rộng hơn hẳn chữ hẹp (${a} vs ${b})`);
  assert.ok(Math.abs(textW("abc", { ...o, fontSize: 20 }) - 2 * textW("abc", o)) < 1e-6);
});
