// Nhất quán (chống "hổ lốn"): màu ngoài bảng màu, loại hình ngoài thẻ phong cách, slide không theo bố cục mẫu, tiêu đề lệch chỗ.
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), os = require("os"), path = require("path");
const { danhGiaNhatQuan, gan } = require("../scripts/nhat_quan");

const THE = { bangMau: ["#F3EEE4", "#1C2826", "#0E4F49"], loaiHinh: ["anh-hai-mau", "net"], boCuc: ["noi-dung", "mo-phan"], tieuDeCoDinh: ["noi-dung"] };
const sl = (k, o = {}) => ({ slide: k, mau: "noi-dung", mauSac: [["#1C2826", "chữ"]], hinh: [], tieuDe: { x: 120, y: 138 }, ...o });

test("màu gần bảng màu: chấp nhận; màu lạ: bắt", () => {
  assert.ok(gan("#1D2927", THE.bangMau)); assert.ok(!gan("#E8A33D", THE.bangMau));
  const r = danhGiaNhatQuan([sl(1), sl(2, { mauSac: [["#E8A33D", "nền"], ["#B0302A", "chữ"]] })], THE);
  assert.match(r.loi.join("\n"), /◇ nhất quán: 2 màu ngoài bảng màu .*#E8A33D.*slide 2/);
});

test("loại hình ngoài thẻ phong cách (vd. nhân vật hoạt hình cạnh ảnh tư liệu) bị bắt; hình chưa khai loại cũng bị bắt", () => {
  const r = danhGiaNhatQuan([sl(1, { hinh: [["anh-hai-mau", "a.jpg"]] }), sl(2, { hinh: [["hoat-hinh", "nv.svg"], ["", "x.svg"]] })], THE);
  const all = r.loi.join("\n"); assert.match(all, /loại hình “hoat-hinh”.*slide 2/); assert.match(all, /chưa khai data-loai.*x\.svg/);
});

test("slide không khai bố cục mẫu / bố cục ngoài danh sách bị bắt", () => {
  const r = danhGiaNhatQuan([sl(1, { mau: "" }), sl(2, { mau: "tu-do" }), sl(3)], THE);
  const all = r.loi.join("\n"); assert.match(all, /slide 1 .*không khai data-mau/); assert.match(all, /“tu-do”.*slide 2/);
});

test("tiêu đề lệch chỗ so với các slide cùng bố cục bị bắt", () => {
  const r = danhGiaNhatQuan([sl(1), sl(2), sl(3, { tieuDe: { x: 160, y: 200 } }), sl(4, { mau: "mo-phan", tieuDe: { x: 120, y: 520 } })], THE);
  const all = r.loi.join("\n"); assert.match(all, /tiêu đề lệch .*slide 3/); assert.doesNotMatch(all, /slide 4/);
});

test("không có thẻ phong cách → không kiểm", () => {
  assert.deepStrictEqual(danhGiaNhatQuan([sl(1, { mau: "" })], null).loi, []);
});
