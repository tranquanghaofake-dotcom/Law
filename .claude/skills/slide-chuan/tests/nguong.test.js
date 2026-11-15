// Ngưỡng máy kiểm bị nới quá mặc định trong phong-cach.json phải có lý do — Chương 3 nới lienHoToiDa 10 → 16 để qua máy,
// máy im lặng về lỗi nhịp đến tận người duyệt. Nới không ghi lý do → lỗi; có lý do → chỉ in để người duyệt đọc.
const test = require("node:test"), assert = require("node:assert");
const { kiemNguong } = require("../scripts/nguong");
const MAC = { lienHoToiDa: 10, tieuDiemToiThieu: 0.25, tuToiDa: 45 };

test("nới ngưỡng tối đa lên / ngưỡng tối thiểu xuống mà không có lý do → lỗi ⚠ ngưỡng nới", () => {
  const r = kiemNguong({ nguong: { lienHoToiDa: 16, tieuDiemToiThieu: 0.15, tuToiDa: 40 } }, MAC);
  assert.strictEqual(r.loi.length, 2);
  assert.match(r.loi.join("\n"), /⚠ ngưỡng nới: lienHoToiDa 16 > mặc định 10/);
  assert.match(r.loi.join("\n"), /⚠ ngưỡng nới: tieuDiemToiThieu 0.15 < mặc định 0.25/);
});

test("có lyDoNguong cho khoá đó → không lỗi, in ra dòng ghi chú; không thẻ / không nguong → sạch", () => {
  const r = kiemNguong({ nguong: { lienHoToiDa: 16 }, lyDoNguong: { lienHoToiDa: "deck biên tập: nền giấy liền là chủ ý" } }, MAC);
  assert.deepStrictEqual(r.loi, []); assert.match(r.ghiChu.join(), /lienHoToiDa 16 \(mặc định 10\): deck biên tập/);
  assert.deepStrictEqual(kiemNguong(null, MAC).loi, []); assert.deepStrictEqual(kiemNguong({}, MAC).loi, []);
});
