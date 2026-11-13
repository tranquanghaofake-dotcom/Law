// Một con số hai cách ghi trên cùng slide ("800.000" ở tiêu đề, "0,8 triệu" ở số lớn) — người nghe phải đổi đơn vị trong đầu.
const test = require("node:test");
const assert = require("node:assert");
const { validate } = require("../engine/validate");
const cover = { type: "cover", title: "Tiêu đề thử" };
const canhBao = (sl) => validate({ meta: {}, slides: [cover, sl] }).warnings.filter((w) => /hai cách ghi/.test(w));

test("báo: '800.000' và '0,8 triệu' trên cùng slide", () => {
  const w = canhBao({ type: "bignum", title: "Năm 2023, hơn 800.000 người rút BHXH một lần", num: "0,8", unit: "triệu người" });
  assert.strictEqual(w.length, 1, w.join("\n")); assert.match(w[0], /800\.000/); assert.match(w[0], /0,8 triệu/);
});

test("không báo: cùng cách ghi, số khác nhau, năm, số điều luật", () => {
  assert.deepStrictEqual(canhBao({ type: "bignum", title: "Năm 2023, hơn 800.000 người rút BHXH một lần", num: "800.000", unit: "người" }), []);
  assert.deepStrictEqual(canhBao({ type: "bignum", title: "Từ 2015 đến 2025 tăng 6,8 triệu người", num: "18,91", unit: "triệu người" }), []);
  assert.deepStrictEqual(canhBao({ type: "statement", title: "Điều 2000 không có; năm 2000 là năm, 2.000 người là số" }), []);
});
