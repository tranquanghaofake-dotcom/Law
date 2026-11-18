const test = require("node:test"), assert = require("node:assert");
const { hangHinh } = require("../scripts/hinh_dem");
const IC = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><path d="M1" opacity="0.2"/><path d="M2"/></svg>';
test("hình đếm: 10 biểu tượng nền, 6 biểu tượng tô (5 đủ + 1 cắt 62 %), kích thước đúng", () => {
  const r = hangHinh(IC, { n: 10, giaTri: 5.62, co: 50, cach: 10 });
  assert.strictEqual((r.svg.match(/opacity="0\.55"/g) || []).length, 10);
  assert.strictEqual((r.svg.match(/<clipPath/g) || []).length, 6);
  assert.match(r.svg, /width="31\.0"/);   // 0,62 × 50
  assert.strictEqual(r.rong, 590); assert.strictEqual(r.cao, 50);
});
