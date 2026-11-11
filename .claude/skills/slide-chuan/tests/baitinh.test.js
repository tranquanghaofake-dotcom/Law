// Test: 7 bố cục cho bài giảng có tính toán (formula, calc, exercise, funnel, changelog, journey, cheatsheet) + chart "step" + quiz "whyNot" + compare cao vừa chữ.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { ROOT, buildDeck, cover } = require("./helpers");

const EX = JSON.parse(fs.readFileSync(path.join(ROOT, "examples", "bai_tinh.json"), "utf8"));

test("examples/bai_tinh.json qua --strict ở cả 3 theme", () => {
  for (const th of ["teal", "kem", "son"]) {
    const r = buildDeck(EX, ["--strict", "--theme", th]);
    assert.strictEqual(r.code, 0, `theme ${th}:\n${r.all}`);
  }
});

const one = (sl) => buildDeck({ slides: [cover, sl] });
test("formula: < 2 biến, thiếu vế trái, focus sai bị chặn", () => {
  const r = one({ type: "formula", title: "Một biến", terms: [{ sym: "L", label: "Lương" }], focus: 3 });
  assert.notStrictEqual(r.code, 0);
  assert.ok(r.all.includes("Slide 2 (formula): terms") && r.all.includes("Slide 2 (formula): result") && r.all.includes("Slide 2 (formula): focus"), r.all);
});
test("calc: thiếu đáp số bị chặn; bước không có số thì cảnh báo", () => {
  const r = one({ type: "calc", title: "Giải", steps: [{ label: "Bước 1" }, { label: "Bước 2" }] });
  assert.notStrictEqual(r.code, 0);
  assert.ok(r.all.includes("Slide 2 (calc): answer"), r.all);
  const w = one({ type: "calc", title: "Giải", steps: [{ label: "Bước 1" }], answer: { value: "10" } });
  assert.ok(w.all.includes("không bước nào có \"value\""), w.all);
});
test("funnel: một nguồn hoặc thiếu pool bị chặn", () => {
  const r = one({ type: "funnel", title: "Quỹ", sources: [{ label: "A", value: 1 }] });
  assert.ok(r.all.includes("Slide 2 (funnel): sources") && r.all.includes("Slide 2 (funnel): pool"), r.all);
});
test("changelog: status lạ bị chặn; không còn đòi source (nguồn ghi ở bản Word), ghi source thì cảnh báo đã bỏ", () => {
  const r = one({ type: "changelog", title: "Đổi", rows: [{ topic: "A", new: "B", status: "lạ" }, { topic: "C", new: "D" }] });
  assert.notStrictEqual(r.code, 0);
  assert.ok(r.all.includes("rows[0].status"), r.all);
  const w = one({ type: "changelog", title: "Đổi", rows: [{ topic: "A", new: "B" }, { topic: "C", new: "D" }] });
  assert.ok(!w.all.includes("thiếu \"source\""), w.all);
  const s = one({ type: "changelog", title: "Đổi", rows: [{ topic: "A", new: "B" }, { topic: "C", new: "D" }], source: "Luật X" });
  assert.ok(s.all.includes('trường "source" đã bỏ'), s.all);
});
test("journey < 3 chặng, cheatsheet ô lệch số hàng bị chặn", () => {
  const j = one({ type: "journey", title: "Đời", stages: [{ event: "A" }, { event: "B" }] });
  assert.ok(j.all.includes("Slide 2 (journey): stages"), j.all);
  const c = one({ type: "cheatsheet", title: "Lưới", rows: [{ label: "Ai" }, { label: "Bao nhiêu" }],
    cols: [{ name: "A", cells: ["1", "2"] }, { name: "B", cells: ["1"] }, { name: "C", cells: ["1", "2"] }] });
  assert.ok(c.all.includes("Slide 2 (cheatsheet): cols[1].cells"), c.all);
});
test("chart step: nhận tới 20 mốc; base dùng cho kind khác thì cảnh báo", () => {
  const items = Array.from({ length: 16 }, (_, i) => ({ label: String(2020 + i), value: 60 + i / 8 }));
  const r = buildDeck({ slides: [cover, { type: "chart", kind: "step", title: "Bậc thang", base: 59, items, insight: { value: "62", text: "Tăng dần" } }] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
  const w = one({ type: "chart", kind: "column", title: "Cột", base: 5, items: [{ label: "2020", value: 1 }, { label: "2021", value: 2 }], insight: { value: "2", text: "x" } });
  assert.ok(w.all.includes("\"base\" chỉ dùng cho kind \"step\""), w.all);
});
test("quiz whyNot: ở slide hỏi hoặc trỏ vào phương án đúng thì cảnh báo", () => {
  const q = { type: "quiz", title: "Câu?", options: ["A", "B"], whyNot: ["sai vì…"] };
  assert.ok(one(q).all.includes("\"whyNot\" chỉ hiện ở slide đáp án"));
  const a = Object.assign({}, q, { reveal: true, answer: 0, why: "vì", whyNot: ["đúng mà", "sai"] });
  assert.ok(one(a).all.includes("whyNot[0] là phương án ĐÚNG"));
});
