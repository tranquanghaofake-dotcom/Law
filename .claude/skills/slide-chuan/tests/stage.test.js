// Test bộ mẫu slide (stage/templates.js): đủ mẫu cho mọi type, deck mẫu không rơi về mẫu chung, bản đồ và so chữ. Dựng PPTX thật: tests/hinh.test.js.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { render, TYPES } = require("../stage/templates");
const ROOT = path.join(__dirname, "..");
const ctx = { img: () => "" };
const decks = () => fs.readdirSync(path.join(ROOT, "examples")).filter((f) => f.endsWith(".json")).map((f) => [f, JSON.parse(fs.readFileSync(path.join(ROOT, "examples", f), "utf8"))]).filter(([, d]) => Array.isArray(d.slides));

test("mọi type của engine PPTX đều có mẫu riêng ở tầng hình ảnh", () => {
  const all = Object.keys(require("../references/layouts_index.json").types);
  assert.deepStrictEqual(all.filter((t) => !TYPES.includes(t)), []);
});

test("mọi deck mẫu: không slide nào rơi về mẫu chung, không lộ object / undefined / NaN ra slide", () => {
  for (const [name, d] of decks()) d.slides.forEach((s, i) => {
    const r = render(s, d, ctx, i, d.slides.length);
    assert.ok(!r.generic, `${name} #${i + 1}: type "${s.type}" chưa có mẫu`);
    assert.ok(!/\[object Object\]|undefined|NaN/.test(r.html), `${name} #${i + 1} (${s.type}): lộ giá trị rỗng`);
    assert.ok(r.html.startsWith('<section class="s '), `${name} #${i + 1}: thiếu khung slide`);
  });
});

test("map luôn vẽ Hoàng Sa, Trường Sa; redline gộp cụm bỏ / cụm thêm; checklist nhận kết luận dạng object", () => {
  const one = (s) => render(s, { slides: [s] }, ctx, 0, 1).html;
  const m = one({ type: "map", title: "Địa bàn", places: [{ name: "Quảng Trị", label: "Quảng Trị" }], admin: 63 });
  assert.ok(m.includes("QĐ. Hoàng Sa") && m.includes("QĐ. Trường Sa"));
  const g = one({ type: "map", title: "Sắp xếp", groups: [{ label: "Hợp nhất", preset: "merged" }, { label: "Giữ nguyên", preset: "kept", tone: "muted" }] });
  assert.ok(g.includes("QĐ. Hoàng Sa") && /<b>23<\/b>/.test(g) && /<b>11<\/b>/.test(g), "số tỉnh đếm từ bản đồ");
  const r = one({ type: "redline", title: "So chữ", old: { text: "Trừ trường hợp quy định tại Điều 139, giao dịch vô hiệu" }, new: { text: "Giao dịch vô hiệu" } });
  assert.strictEqual((r.match(/<del>/g) || []).length, 1);
  assert.strictEqual((r.match(/<ins>/g) || []).length, 1);
  const c = one({ type: "checklist", title: "Điều kiện", items: [{ ok: "yes", head: "Có công chứng" }], verdict: { ok: "no", text: "Chưa đủ" } });
  assert.ok(c.includes("Chưa đủ") && c.includes('class="vdb '));
});
