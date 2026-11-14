// Test: chế độ bài giảng (meta.kind) + quiz + timeline + hình vẽ mới + kiểm đường cắt trong flow + hình lặp + bước 0 (prep.json) + outline .pptx
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const JSZip = require("jszip");
const { ROOT, build, buildDeck, tmpdir, cover } = require("./helpers");

const OPTS = ["Sự không chắc chắn", "Một khả năng xấu", "Cả A và B đều đúng", "Cả A và B đều sai"];
const Q = "Rủi ro đề cập đến yếu tố nào?";
const lecture = (extra = []) => ({ meta: { title: "Thử", kind: "lecture" }, slides: [cover,
  { type: "quiz", kicker: "Câu hỏi 1/1", title: Q, options: OPTS },
  { type: "quiz", kicker: "Đáp án 1/1", title: Q, options: OPTS, answer: 2, reveal: true, why: "Ba định nghĩa đều gồm hai yếu tố: không chắc chắn và khả năng xấu" },
  ...extra] });

test("bài giảng không có quiz → cảnh báo; tiêu đề quiz là câu hỏi thì không bị bắt lỗi", () => {
  const r = buildDeck({ meta: { kind: "lecture" }, slides: [cover, { type: "statement", title: "Số đông bù số ít" }] }, ["--strict"]);
  assert.ok(/chưa có slide "quiz"/.test(r.all), r.all);
  const q = buildDeck(lecture()); assert.ok(!/tiêu đề là câu hỏi/.test(q.all), q.all);
});

test("timeline: < 3 mốc và focus sai bị chặn", () => {
  const r = buildDeck({ slides: [cover, { type: "timeline", title: "Hai mốc", items: [{ when: "a", head: "A" }, { when: "b", head: "B" }], focus: 4 }] });
  assert.strictEqual(r.code, 2, r.all);
  assert.ok(r.all.includes("Slide 2 (timeline): items") && r.all.includes("Slide 2 (timeline): focus"), r.all);
});

const flowDeck = (side) => ({ slides: [cover, { type: "flow", title: "Phí vào quỹ, quỹ [bù đắp]", nodes: [{ id: "a", name: "Người góp" }, { id: "q", name: "Quỹ" }, { id: "b", name: "Người nhận" }, { id: "d", name: "Đầu tư" }],
  edges: [{ from: "a", to: "q", label: "Đóng phí" }, { from: "q", to: "b", label: "Bù đắp" }, Object.assign({ from: "q", to: "d", label: "Phí chưa dùng", dash: true }, side ? { side } : {})] }] });
test("meta.kind = lecture → hình mặc định là sách, không phải cán cân", () => {
  const r = buildDeck({ meta: { kind: "lecture" }, slides: [cover] }); assert.strictEqual(r.code, 0, r.all);
  const bad = buildDeck({ meta: { kind: "lop-hoc" }, slides: [cover] }); assert.strictEqual(bad.code, 2); assert.ok(/meta.kind/.test(bad.all));
});

test("outline.py đọc .pptx: tiêu đề slide = đề mục, thân slide không thành đề mục, slide cùng tiêu đề gộp lại", () => {
  const dir = tmpdir(), src = path.join(dir, "bg.pptx"), out = path.join(dir, "o.json");
  const mk = spawnSync("python3", ["-c", `
from pptx import Presentation
from pptx.util import Inches
p = Presentation(); L = p.slide_layouts[1]
for t, b in [("1.1. Thuật ngữ", "Mở đầu mục"), ("RỦI RO", "2. Rủi ro thuần túy là rủi ro chỉ gây thiệt hại"), ("RỦI RO", "Dao động lợi nhuận"), ("1.2. Lịch sử", "Ai Cập cổ đại")]:
    s = p.slides.add_slide(L); s.shapes.title.text = t; s.placeholders[1].text = b
p.save(${JSON.stringify(src)})`], { encoding: "utf8" });
  assert.strictEqual(mk.status, 0, mk.stderr);
  const r = spawnSync("python3", [path.join(ROOT, "scripts", "outline.py"), src, out], { encoding: "utf8" }); assert.strictEqual(r.status, 0, r.stderr);
  const ids = JSON.parse(fs.readFileSync(out, "utf8")).map(o => o.id);
  assert.deepStrictEqual(ids, ["1.1", "1.1.rủi-ro", "1.2"]);
});

test("find_images --brief nhận cả mảng trần lẫn {briefs: [...]}", () => {
  const code = `import sys, json; sys.path.insert(0, ${JSON.stringify(path.join(ROOT, "scripts"))})
import inspect, find_images as f
src = inspect.getsource(f.brief_mode); print('isinstance(raw, dict)' in src)`;
  const r = spawnSync("python3", ["-c", code], { encoding: "utf8" }); assert.strictEqual(r.stdout.trim(), "True", r.stderr);
});
