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
test("theme sai", () => loi({ slides: [cover] }, ['"xyz"', "teal"], ["--theme", "xyz"]));
test("trường sai kiểu", () => loi({ slides: [{ type: "cover", title: ["a"] }] }, ["Slide 1", "title"]));
test("timeline ref không tồn tại", () => loi({ slides: [cover, { type: "scene", year: "2010", title: "x", timeline: { ref: "tl" } }] }, ["Slide 2", "timeline"]));
test("timeline 1 điểm", () => loi({ timelines: { tl: [["a", "b"]] }, slides: [cover, { type: "scene", year: "2010", title: "x", timeline: { ref: "tl" } }] }, ["Slide 2", "2 điểm"]));
test("gom nhiều lỗi một lần", () => {
  const r = buildDeck({ slides: [{ type: "foo" }, { type: "bar" }] });
  assert.ok(r.all.includes("Slide 1") && r.all.includes("Slide 2"), r.all);
});

test("cờ --theme đứng trước đường dẫn deck", () => {
  const dir = tmpdir(), d = path.join(dir, "d.json"), o = path.join(dir, "o.pptx");
  fs.writeFileSync(d, JSON.stringify({ slides: [cover] }));
  const r = build(["--theme", "kem", d, o, "--strict"]);
  assert.strictEqual(r.code, 0, r.all);
  assert.ok(fs.existsSync(o));
});

test("logo sai đường dẫn: cảnh báo, vẫn dựng", () => {
  const r = buildDeck({ meta: { logo: "khong-co.png" }, slides: [cover] });
  assert.strictEqual(r.code, 0, r.all);
  assert.ok(/logo/i.test(r.all) && r.all.includes("khong-co.png"), r.all);
});
test("logo sai + --strict => exit 1", () => {
  const r = buildDeck({ meta: { logo: "khong-co.png" }, slides: [cover] }, ["--strict"]);
  assert.strictEqual(r.code, 1, r.all);
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
test("cảnh báo tiêu đề quá 2 dòng", () => {
  const r = buildDeck({ slides: [cover, { type: "stats", title: "Một tiêu đề rất rất dài dòng văn tự để chắc chắn phải xuống tới ba dòng khi dựng ở cỡ chữ ba mươi bốn điểm trong khung hẹp", items: [{ label: "a", value: "1" }] }] });
  assert.ok(/tiêu đề/i.test(r.all) && r.all.includes("Slide 2"), r.all);
});

test("ghi chú CRLF được tách đúng theo slide", async () => {
  const JSZip = require("jszip");
  const dir = tmpdir();
  fs.writeFileSync(path.join(dir, "n.md"), "# S1\r\nGhi chú một\r\n---\r\n# S2\r\nGhi chú hai\r\n");
  const r = buildDeck({ meta: { notesFile: "n.md" }, slides: [cover, { type: "section", title: "Hai" }] }, [], dir);
  assert.strictEqual(r.code, 0, r.all);
  const z = await JSZip.loadAsync(fs.readFileSync(r.pptx));
  const n1 = await z.file("ppt/notesSlides/notesSlide1.xml").async("string");
  const n2 = await z.file("ppt/notesSlides/notesSlide2.xml").async("string");
  assert.ok(n1.includes("Ghi chú một") && !n1.includes("Ghi chú hai"));
  assert.ok(n2.includes("Ghi chú hai"));
});
test("số phần ghi chú khác số slide: cảnh báo", () => {
  const dir = tmpdir();
  fs.writeFileSync(path.join(dir, "n.md"), "Một\n---\nHai\n---\nBa\n");
  const r = buildDeck({ meta: { notesFile: "n.md" }, slides: [cover] }, [], dir);
  assert.ok(/ghi chú/i.test(r.all) && /3/.test(r.all), r.all);
});

test("PPTX: lang vi-VN, không normAutofit, tên ô duy nhất", async () => {
  const JSZip = require("jszip");
  const deck = JSON.parse(fs.readFileSync(path.join(ROOT, "examples", "banan142.json"), "utf8"));
  const dir = tmpdir();
  fs.copyFileSync(path.join(ROOT, "examples", "logo.jpeg"), path.join(dir, "logo.jpeg"));
  fs.cpSync(path.join(ROOT, "examples", "images"), path.join(dir, "images"), { recursive: true }); // deck mẫu có ảnh thật
  deck.meta.logo = "logo.jpeg"; delete deck.meta.notesFile;
  const r = buildDeck(deck, [], dir);
  assert.strictEqual(r.code, 0, r.all);
  const z = await JSZip.loadAsync(fs.readFileSync(r.pptx));
  for (const f of Object.keys(z.files).filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f))) {
    const x = await z.file(f).async("string");
    assert.ok(!x.includes("normAutofit"), f + " còn normAutofit");
    assert.ok(!x.includes('lang="en-US"'), f + " còn lang en-US");
    assert.ok(x.includes('lang="vi-VN"'), f + " thiếu vi-VN");
    const names = [...x.matchAll(/<p:cNvPr id="\d+" name="(S\d+[^"]*)"/g)].map(m => m[1]);
    assert.ok(names.length > 0, f + " không có ô chữ được đặt tên");
    assert.strictEqual(new Set(names).size, names.length, f + " trùng tên ô");
  }
});

test("tiêu đề có [từ khoá] xuống 3 dòng vẫn bị báo là title", () => {
  const r = buildDeck({ slides: [cover, { type: "stats", title: "Một tiêu đề rất rất dài dòng văn tự để chắc chắn phải xuống tới [ba dòng] khi dựng ở cỡ chữ ba mươi bốn điểm trong khung hẹp", items: [{ label: "a", value: "1" }] }] });
  assert.ok(/Slide 2 \(stats\) title: tiêu đề xuống 3 dòng/.test(r.all), r.all);
  assert.ok(/Slide 2 \(stats\) title: "/.test(r.all), "nhãn phải là title, không phải 'ô chữ':\n" + r.all);
});
test("banan142: mọi ô chữ có tên theo trường, không còn dạng S*|*|t<n>", async () => {
  const JSZip = require("jszip");
  const dir = tmpdir();
  const deck = JSON.parse(fs.readFileSync(path.join(ROOT, "examples", "banan142.json"), "utf8"));
  delete deck.meta.logo; delete deck.meta.notesFile;
  fs.cpSync(path.join(ROOT, "examples", "images"), path.join(dir, "images"), { recursive: true }); // deck mẫu có ảnh thật
  const r = buildDeck(deck, [], dir);
  const z = await JSZip.loadAsync(fs.readFileSync(r.pptx));
  const bad = [];
  for (const f of Object.keys(z.files).filter(f => /^ppt\/slides\/slide\d+\.xml$/.test(f)))
    for (const m of (await z.file(f).async("string")).matchAll(/name="(S\d+\|[^|"]*\|t\d+(?:#\d+)?)"/g)) bad.push(m[1]);
  assert.deepStrictEqual(bad, []);
});
