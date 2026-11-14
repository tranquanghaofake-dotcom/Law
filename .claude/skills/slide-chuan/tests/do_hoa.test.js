// Test đợt "đồ hoạ bằng code": isotype, annotate (viết tay), hatch + gradient gốc, morph, iso, Voronoi, cover paper, hero.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");
const { ROOT, buildDeck, cover } = require("./helpers");
const CA = require("../engine/codeart");

const EX = JSON.parse(fs.readFileSync(path.join(ROOT, "examples", "do_hoa_code.json"), "utf8"));
const xmlOf = async (pptx, n) => (await JSZip.loadAsync(fs.readFileSync(pptx))).file(`ppt/slides/slide${n}.xml`).async("string");

test("examples/do_hoa_code.json qua --strict", () => {
  const r = buildDeck(EX, ["--strict"]); assert.strictEqual(r.code, 0, r.all);
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
