// Test đợt 2: checklist, bento, chart line/waterfall/gantt/progress, 3 theme mới, --native, layouts_index.json + chon_layout.py.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const JSZip = require("jszip");
const { ROOT, buildDeck, cover } = require("./helpers");
const LIMITS = require("../engine/limits");
const THEMES = require("../engine/themes");

const EX = JSON.parse(fs.readFileSync(path.join(ROOT, "examples", "bo_cuc_them.json"), "utf8"));

test("examples/bo_cuc_them.json qua --strict ở cả 6 theme", () => {
  for (const th of Object.keys(THEMES)) {
    const r = buildDeck(EX, ["--strict", "--theme", th]);
    assert.strictEqual(r.code, 0, `theme ${th}:\n${r.all}`);
  }
});
test("theme mới cũng qua deck bài tính (bai_tinh.json)", () => {
  const ex = JSON.parse(fs.readFileSync(path.join(ROOT, "examples", "bai_tinh.json"), "utf8"));
  for (const th of ["toa", "xanh", "muc"]) { const r = buildDeck(ex, ["--strict", "--theme", th]); assert.strictEqual(r.code, 0, `theme ${th}:\n${r.all}`); }
});
test("--native: biểu đồ line thành chart gốc, table thành a:tbl", async () => {
  const r = buildDeck(EX, ["--strict", "--native"]);
  assert.strictEqual(r.code, 0, r.all);
  const z = await JSZip.loadAsync(fs.readFileSync(r.pptx));
  assert.ok(Object.keys(z.files).some(f => /^ppt\/charts\/chart\d+\.xml$/.test(f)), "không có ppt/charts/chart*.xml");
  const xs = await Promise.all(Object.keys(z.files).filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f)).map(f => z.file(f).async("string")));
  assert.ok(xs.some(x => x.includes("<a:tbl>")), "không có bảng gốc <a:tbl>");
});
const one = (sl) => buildDeck({ slides: [cover, sl] });
test("checklist: < 2 điều kiện bị chặn; verdict mâu thuẫn thì cảnh báo", () => {
  assert.ok(one({ type: "checklist", title: "Một", items: [{ ok: "yes", head: "A" }] }).all.includes("Slide 2 (checklist): items"));
  const w = one({ type: "checklist", title: "Hai", items: [{ ok: "no", head: "A" }, { ok: "yes", head: "B" }], verdict: { ok: "yes", text: "Đủ" } });
  assert.ok(w.all.includes("kết luận mâu thuẫn"), w.all);
});
test("bento: < 3 thẻ hoặc thẻ rỗng bị chặn", () => {
  const r = one({ type: "bento", title: "B", cells: [{ head: "A" }, { text: "không có head" }] });
  assert.ok(r.all.includes("Slide 2 (bento): cells") && r.all.includes("cells[1]"), r.all);
});
test("chart gantt/progress/waterfall: kiểm dữ liệu", () => {
  assert.ok(one({ type: "chart", kind: "gantt", title: "G", items: [{ label: "A", from: "01/01/2020", to: 3 }] }).all.includes("gantt cần \"from\", \"to\" là SỐ"));
  assert.ok(one({ type: "chart", kind: "progress", title: "P", items: [{ label: "A", value: 140 }] }).all.includes("progress cần tỉ lệ 0–100"));
  assert.ok(one({ type: "chart", kind: "waterfall", title: "W", items: [{ label: "A", value: 5 }, { label: "B", value: -2 }], insight: { value: "3", text: "x" } }).all.includes("không có cột \"total\""));
});
test("layouts_index.json phủ đủ mọi type, alt trỏ tới type/kind có thật", () => {
  const I = JSON.parse(fs.readFileSync(path.join(ROOT, "references", "layouts_index.json"), "utf8"));
  assert.deepStrictEqual(Object.keys(LIMITS).filter(k => !I.types[k]), []);
  assert.deepStrictEqual(Object.keys(I.types).filter(k => !LIMITS[k]), []);
  const bad = [];
  for (const [t, e] of Object.entries(I.types)) for (const a of e.alt) if (!I.types[a]) bad.push(`${t} → ${a}`);
  for (const [t, e] of Object.entries(I.charts)) for (const a of e.alt) if (!I.charts[a] && !I.types[a]) bad.push(`chart ${t} → ${a}`);
  assert.deepStrictEqual(bad, []);
  assert.deepStrictEqual(Object.keys(I.themes).sort(), Object.keys(THEMES).sort());
});
test("chon_layout.py gợi ý waterfall cho bài tính cộng trừ", () => {
  const r = spawnSync("python3", [path.join(ROOT, "scripts", "chon_layout.py"), "tính thuế cộng trừ từng khoản ra số cuối"], { encoding: "utf8" });
  assert.strictEqual(r.status, 0, r.stderr);
  assert.ok(r.stdout.split("\n")[0].includes("waterfall"), r.stdout);
});
