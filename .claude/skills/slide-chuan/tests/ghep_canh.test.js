// Xưởng ghép cảnh (18/11/2026): tách nhóm có tên khỏi SVG Storyset, đặt lại vị trí / cỡ / lật, ghép thành cảnh mới.
const test = require("node:test"), assert = require("node:assert");
const { ghep, layNhom, bienDoi } = require("../scripts/ghep_canh");

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><g id="Shadow"><ellipse/></g><g id="character-1"><g id="tay"><path d="M1"/></g><g><path d="M2"/></g></g><g id="Desk"><rect/></g></svg>`;

test("lấy đúng nhóm có nhóm con lồng nhau, bỏ id, xoá được nhóm con", () => {
  const g = layNhom(SVG, "character-1");
  assert.match(g, /^<g><g><path d="M1"\/><\/g><g><path d="M2"\/><\/g><\/g>$/);
  assert.doesNotMatch(layNhom(SVG, "character-1", ["tay"]), /M1/);
  assert.throws(() => layNhom(SVG, "khong-co"), /không có nhóm/);
});

test("biến đổi: co theo chiều cao đích, lật ngang giữ nguyên chỗ đặt", () => {
  const k = { x: 100, y: 50, w: 100, h: 200 };
  assert.strictEqual(bienDoi(k, { x: 10, y: 20, cao: 400 }), "translate(10 20) scale(2.0000) translate(-100 -50)");
  assert.strictEqual(bienDoi(k, { x: 10, y: 20, cao: 400, lat: true }), "translate(210.0 20) scale(-2.0000 2.0000) translate(-100 -50)");
});

test("ghép: mảnh theo thứ tự, mảnh tự vẽ giữ nguyên, có bóng dưới chân khi yêu cầu", () => {
  const nguon = { "a.svg": { svg: SVG, khung: { "character-1": { x: 0, y: 0, w: 50, h: 100 }, Desk: { x: 0, y: 0, w: 80, h: 40 } } } };
  const r = ghep({ rong: 800, cao: 600, manh: [{ tu: "a.svg", nhom: "Desk", x: 0, y: 0, rong: 160 }, { svg: '<text>NGÂN HÀNG</text>' }, { tu: "a.svg", nhom: "character-1", x: 300, y: 100, cao: 300, bong: true }] }, nguon);
  assert.match(r, /viewBox="0 0 800 600"/);
  assert.ok(r.indexOf("<rect/>") < r.indexOf("NGÂN HÀNG") && r.indexOf("NGÂN HÀNG") < r.indexOf("M1"));
  assert.match(r, /<ellipse cx="375\.0" cy="400\.0"/);
});

test("không ghi kích thước cảnh → khung ôm sát mảnh (không cắt tay chân)", () => {
  const nguon = { "a.svg": { svg: SVG, khung: { Desk: { x: 0, y: 0, w: 80, h: 40 } } } };
  assert.match(ghep({ manh: [{ tu: "a.svg", nhom: "Desk", x: 0, y: 0, cao: 100 }] }, nguon), /viewBox="0 0 200 100"/);
});
