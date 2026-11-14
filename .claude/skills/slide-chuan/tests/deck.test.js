// Test: deck.json sai phải báo lỗi tiếng Việt rõ ràng (exit 2), không sập, không in "undefined".
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { ROOT, buildDeck, build, cover, tmpdir } = require("./helpers");

function loi(deck, mongDoi, extra = []) {
  const r = buildDeck(deck, extra);
  assert.strictEqual(r.code, 2, "exit phải là 2, nhưng là " + r.code + "\n" + r.all);
  assert.ok(!/undefined/i.test(r.all), "không được in 'undefined':\n" + r.all);
  assert.ok(!/\n\s+at /.test(r.all), "không được in stack trace:\n" + r.all);
  for (const m of [].concat(mongDoi)) assert.ok(r.all.includes(m), `thiếu "${m}" trong:\n${r.all}`);
  assert.ok(!fs.existsSync(r.pptx), "không được tạo file khi deck lỗi");
}

test("type lạ", () => loi({ slides: [cover, { type: "foo", title: "x" }] }, ['Slide 2', '"foo"']));
test("fork thiếu branches[].tag", () => loi({ slides: [cover, { type: "fork", title: "x", branches: [{ head: "a", text: "b" }] }] }, ["Slide 2", "branches[0].tag"]));
test("duel thiếu left.tag", () => loi({ slides: [cover, { type: "duel", title: "x", left: { items: ["a"] }, right: { tag: "r" } }] }, ["Slide 2", "left.tag"]));
test("panelrows thiếu rows[].head", () => loi({ slides: [cover, cover, { type: "panelrows", title: "x", rows: [{ text: "a" }] }] }, ["Slide 3", "rows[0].head"]));
test("icon sai tên", () => loi({ slides: [cover, { type: "cards", title: "x", items: [{ icon: "FaScale", name: "A" }] }] }, ["Slide 2", "FaScale", "icons.md"]));
test("icon chrome sai tên", () => loi({ meta: { chromeIcon: "FaNope" }, slides: [cover] }, ["FaNope"]));
test("thiếu slides", () => loi({ meta: {} }, ["slides"]));
test("JSON hỏng", () => loi("{ slides: [", ["JSON"]));
test("trường sai kiểu", () => loi({ slides: [{ type: "cover", title: ["a"] }] }, ["Slide 1", "title"]));
test("timeline ref không tồn tại", () => loi({ slides: [cover, { type: "scene", year: "2010", title: "x", timeline: { ref: "tl" } }] }, ["Slide 2", "timeline"]));
test("timeline 1 điểm", () => loi({ timelines: { tl: [["a", "b"]] }, slides: [cover, { type: "scene", year: "2010", title: "x", timeline: { ref: "tl" } }] }, ["Slide 2", "2 điểm"]));
test("gom nhiều lỗi một lần", () => {
  const r = buildDeck({ slides: [{ type: "foo" }, { type: "bar" }] });
  assert.ok(r.all.includes("Slide 1") && r.all.includes("Slide 2"), r.all);
});

test("logo tương đối tính theo thư mục deck.json, không theo cwd", () => {
  const dir = tmpdir();
  fs.copyFileSync(path.join(ROOT, "examples", "logo.jpeg"), path.join(dir, "lg.jpeg"));
  const deckPath = path.join(dir, "deck.json");
  fs.writeFileSync(deckPath, JSON.stringify({ meta: { logo: "lg.jpeg" }, slides: [cover] }));
  const r = build([deckPath, path.join(dir, "o.pptx"), "--strict"], { cwd: "/" });
  assert.strictEqual(r.code, 0, r.all);
});

test("cảnh báo mảng bị cắt im lặng", () => {
  const items = ["a", "b", "c", "d", "e"].map(x => "Mục " + x);
  const r = buildDeck({ slides: [cover, { type: "agenda", title: "x", items }] });
  assert.ok(r.all.includes("Slide 2") && r.all.includes("items") && /cắt|bỏ/.test(r.all), r.all);
});
test("cảnh báo cùng type quá 3 slide liền", () => {
  const sl = { type: "section", title: "Phần" };
  const r = buildDeck({ slides: [cover, sl, sl, sl, sl] });
  assert.ok(/liền/.test(r.all) && r.all.includes("section"), r.all);
});
test("cảnh báo ngoặc [ không đóng", () => {
  const r = buildDeck({ slides: [{ type: "cover", title: "Câu [chưa đóng" }] });
  assert.ok(r.all.includes("Slide 1") && r.all.includes("["), r.all);
});
test("số phần ghi chú khác số slide: cảnh báo", () => {
  const dir = tmpdir();
  fs.writeFileSync(path.join(dir, "n.md"), "Một\n---\nHai\n---\nBa\n");
  const r = buildDeck({ meta: { notesFile: "n.md" }, slides: [cover] }, [], dir);
  assert.ok(/ghi chú/i.test(r.all) && /3/.test(r.all), r.all);
});
