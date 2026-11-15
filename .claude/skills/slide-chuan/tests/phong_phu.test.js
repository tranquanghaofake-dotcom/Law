// Độ phong phú (chống "quá đơn giản"): slide nghèo khối thị giác, deck nhiều nền trơn bị bắt; thẻ tắt được.
const test = require("node:test"), assert = require("node:assert");
const { danhGiaPhongPhu } = require("../scripts/phong_phu");

const THE = { bangMau: ["#FBF7EF"] };
const sl = (k, phu, tron = false) => ({ slide: k, mau: "noi-dung", phu, tron });

test("deck tối giản: đa số slide phủ < 25 % và nền trơn → hai lỗi ◇ phong phú", () => {
  const r = danhGiaPhongPhu([sl(1, 0.1, true), sl(2, 0.12, true), sl(3, 0.4), sl(4, 0.05, true)], THE);
  const all = r.loi.join("\n");
  assert.match(all, /◇ phong phú: chỉ 25 % slide .*slide nghèo: 1 \(10 %\), 2 \(12 %\), 4 \(5 %\)/);
  assert.match(all, /◇ phong phú: 3\/4 slide nền trơn/);
});

test("deck giàu khối màu, có lớp nền → sạch, có dòng tóm tắt", () => {
  const r = danhGiaPhongPhu([sl(1, 0.4), sl(2, 0.55), sl(3, 0.3), sl(4, 0.2)], THE);
  assert.deepStrictEqual(r.loi, []);
  assert.match(r.tom, /Phong phú: 3\/4 slide phủ ≥ 25 % · 0 slide nền trơn/);
});

test("ngưỡng ghi đè được; thẻ khai phongPhu:false hoặc không có thẻ → không kiểm", () => {
  assert.deepStrictEqual(danhGiaPhongPhu([sl(1, 0.2), sl(2, 0.2)], THE, { phuToiThieu: 0.15 }).loi, []);
  assert.deepStrictEqual(danhGiaPhongPhu([sl(1, 0.01, true)], { ...THE, phongPhu: false }).loi, []);
  assert.deepStrictEqual(danhGiaPhongPhu([sl(1, 0.01, true)], null).loi, []);
});
