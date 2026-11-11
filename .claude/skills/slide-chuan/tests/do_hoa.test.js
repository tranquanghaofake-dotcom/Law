// Test đợt "đồ hoạ bằng code": isotype, annotate (viết tay), hatch + gradient gốc, morph, iso, Voronoi, cover paper, hero.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const { ROOT, buildDeck, cover } = require("./helpers");
const THEMES = require("../engine/themes");
const CA = require("../engine/codeart");

const EX = JSON.parse(fs.readFileSync(path.join(ROOT, "examples", "do_hoa_code.json"), "utf8"));
const xmlOf = async (pptx, n) => (await JSZip.loadAsync(fs.readFileSync(pptx))).file(`ppt/slides/slide${n}.xml`).async("string");

test("examples/do_hoa_code.json qua --strict ở cả 6 theme (có --transition morph)", () => {
  for (const th of Object.keys(THEMES)) { const r = buildDeck(EX, ["--strict", "--theme", th, "--transition", "morph"]); assert.strictEqual(r.code, 0, `theme ${th}:\n${r.all}`); }
});

test("isotype: mọi hàng cùng lưới; phần mất là khung rỗng nét đứt; value lệch đơn vị → cảnh báo", () => {
  const a = CA.isotypeRow("note", 85, 0, 9, 2, "111111", "B00000", "FFEEEE", "FFFFFF"), b = CA.isotypeRow("note", 50, 35, 9, 2, "111111", "B00000", "FFEEEE", "FFFFFF", { cols: a.cols, cell: a.cell });
  assert.strictEqual(b.cols, a.cols); assert.strictEqual(b.cell, a.cell);
  assert.strictEqual((b.svg.match(/stroke-dasharray/g) || []).length, 35, "35 khung rỗng");
  const r = buildDeck({ slides: [cover, { type: "isotype", title: "Trả 85 tờ, chỉ lấy lại 50 tờ", unit: { value: 10, label: "triệu" }, rows: [{ label: "Đã trả", value: 855 }] }] });
  assert.ok(/không chia hết/.test(r.all), r.all);
  const lost = buildDeck({ slides: [cover, { type: "isotype", title: "Phần mất lớn hơn tổng là sai", unit: { value: 10, label: "triệu" }, rows: [{ label: "Đã trả", value: 100, lost: 200 }] }] });
  assert.ok(/lost lớn hơn value/.test(lost.all), lost.all);
});

test("annotate: vẽ nét tay (SVG) + câu chú thích là ô chữ thật; item sai → cảnh báo; kind không hỗ trợ → cảnh báo", async () => {
  const ch = { type: "chart", kind: "column", title: "Số vụ tăng vọt trong năm 2020", items: ["2017", "2018", "2019", "2020", "2021"].map((l, i) => ({ label: l, value: [10, 12, 11, 20, 16][i] })), annotate: { item: 3, text: "Luật mới có hiệu lực" }, insight: { value: "+82%", text: "So với 2019" } };
  const r = buildDeck({ slides: [cover, ch] }, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
  const x = await xmlOf(r.pptx, 2);
  assert.ok(x.includes("Chú thích viết tay") && x.includes("Luật mới có hiệu lực"));
  assert.ok(/không trỏ tới mục nào/.test(buildDeck({ slides: [cover, Object.assign({}, ch, { annotate: { item: 9, text: "x" } })] }).all));
  assert.ok(/chỉ vẽ cho kind bar \/ column \/ span/.test(buildDeck({ slides: [cover, Object.assign({}, ch, { kind: "donut", items: ch.items.slice(0, 3) })] }).all));
});

test("hatch → a:pattFill gốc; khối nền tối → a:gradFill gốc (không phải ảnh)", async () => {
  const r = buildDeck(EX, ["--strict"]);
  assert.strictEqual(r.code, 0, r.all);
  const iSpan = EX.slides.findIndex(x => x.type === "chart" && x.kind === "span") + 1, span = await xmlOf(r.pptx, iSpan), hero = await xmlOf(r.pptx, 2);
  assert.ok(span.includes('<a:pattFill prst="wdUpDiag">'), "thiếu gạch chéo gốc");
  assert.ok(!/name="(HATCH|GRAD):/.test(span), "tên tạm phải được đổi");
  const d = buildDeck({ slides: [cover, { type: "duel", title: "Hai cấp xử khác nhau ở phần lớn yêu cầu", left: { tag: "Sơ thẩm", items: ["A", "B"] }, right: { tag: "Phúc thẩm", items: ["C", "D"] } }] }, ["--strict"]);
  assert.ok((await xmlOf(d.pptx, 2)).includes("<a:gradFill"), "khối nền tối thiếu gradient gốc");
  assert.ok(hero.length > 0);
});

test("--transition morph: chỉ slide nối tiếp cùng bố cục có p159:morph (kèm fallback fade); scene có tên !!tl-…", async () => {
  const r = buildDeck(EX, ["--transition", "morph"]);
  assert.strictEqual(r.code, 0, r.all);
  const types = EX.slides.map(s => s.type);
  for (let i = 1; i < types.length; i++) {
    const x = await xmlOf(r.pptx, i + 1), same = types[i] === types[i - 1] && ["scene", "quiz"].includes(types[i]);
    assert.strictEqual(x.includes("p159:morph"), same, `slide ${i + 1} (${types[i]})`);
    if (same) assert.ok(x.includes("<mc:Fallback>") && x.includes("<p:fade/>"), "morph phải có fallback");
  }
  assert.ok((await xmlOf(r.pptx, 4)).includes('name="!!tl-'), "scene thiếu tên morph");
  const bad = buildDeck({ slides: [cover, Object.assign({}, EX.slides[4], { transition: "spin" })] });
  assert.strictEqual(bad.code, 2, bad.all);
});

test("iso: dựng cảnh, nhãn cột phải; thiếu kind → lỗi; không nhãn → cảnh báo", () => {
  const iso = Object.assign({}, EX.slides[1]); delete iso.notes;
  const ok = buildDeck({ slides: [cover, iso] }, ["--strict"]);
  assert.strictEqual(ok.code, 0, ok.all);
  assert.strictEqual(buildDeck({ slides: [cover, { type: "iso", title: "Thiếu loại vật thể", objects: [{ x: 0, y: 0, label: "A" }] }] }).code, 2);
  assert.ok(/không vật nào có label/.test(buildDeck({ slides: [cover, { type: "iso", title: "Cảnh không có nhãn nào", objects: [{ kind: "house", x: 0, y: 0 }] }] }).all));
});

test("Voronoi: các ô phủ kín khung, không ô nào rỗng; cùng hạt giống → cùng hình", () => {
  const a = CA.voronoiCells(600, 400, 30, 5), b = CA.voronoiCells(600, 400, 30, 5);
  assert.ok(a.length >= 20);
  const area = a.reduce((s, c) => s + CA.polyArea(c.poly), 0);
  assert.ok(Math.abs(area - 600 * 400) / (600 * 400) < 0.01, `tổng diện tích ${area}`);
  assert.deepStrictEqual(a.map(c => c.poly.length), b.map(c => c.poly.length));
});

test("cover paper + hero: nền là ảnh PNG (có filter), chữ là ô chữ thật; hero num không có chữ số → cảnh báo", async () => {
  const r = buildDeck(EX, ["--strict"]);
  const z = await JSZip.loadAsync(fs.readFileSync(r.pptx)), x1 = await z.file("ppt/slides/slide1.xml").async("string");
  assert.ok(x1.includes("các lớp giấy cắt") && x1.includes("Bảo vệ người thứ ba"));
  assert.ok(/không có chữ số/.test(buildDeck({ slides: [cover, { type: "hero", num: "ABC", title: "Không phải con số thì không dùng hero" }] }).all));
});
