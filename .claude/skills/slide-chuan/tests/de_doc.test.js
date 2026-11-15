// Dễ đọc (Chương 3, 15/11/2026 — Hào: "đảm bảo chữ rõ ràng, dễ nhìn và hiểu"): slide quá nhiều chữ, nhiều chữ nhỏ,
// đoạn dài nhiều dòng, chữ xám nhạt trên nền sáng bị bắt; bố cục bảng / câu hỏi được nới ngưỡng số chữ.
const test = require("node:test"), assert = require("node:assert");
const { danhGiaDeDoc } = require("../scripts/de_doc");

const THE = { bangMau: ["#FBF7EF"] };
const hop = (chu, co = 32, dong = 1, tp = 9, lop = "") => ({ chu, tu: chu.split(/\s+/).filter(Boolean).length, co, dong, tp, lop });
const sl = (k, mau, ds) => ({ slide: k, mau, hop: ds });

test("slide nội dung quá nhiều chữ → báo; slide bảng cùng số chữ → không báo", () => {
  const dai = Array(60).fill("chữ").join(" ");
  const r = danhGiaDeDoc([sl(1, "noi-dung", [hop(dai)]), sl(2, "bang", [hop(dai)])], THE);
  const all = r.loi.join("\n");
  assert.match(all, /◇ dễ đọc: slide 1 .*60 chữ đọc liền/); assert.doesNotMatch(all, /slide 2 /);
});

test("nhiều chữ nhỏ dưới 28 px, đoạn dài 5 dòng, chữ xám tương phản thấp → báo từng loại", () => {
  const r = danhGiaDeDoc([sl(3, "noi-dung", [hop("một hai ba bốn năm sáu bảy tám chín mười", 24), hop("tiêu đề lớn", 72), hop("đoạn dài lắm", 30, 5), hop("chữ xám mờ", 28, 1, 5.2)])], THE);
  const all = r.loi.join("\n");
  assert.match(all, /chữ dưới 28 px/); assert.match(all, /đoạn 5 dòng/); assert.match(all, /tương phản 5\.2/);
});

test("số trang, dòng nguồn được miễn; không có thẻ phong cách → không kiểm", () => {
  const r = danhGiaDeDoc([sl(4, "noi-dung", [hop("Luật KDBH 08/2022/QH15 Điều 16 khoản 3 Điều 47 Điều 48 Điều 49", 24, 1, 6, "nguon"), hop("8 / 46", 24, 1, 6, "so-trang"), hop("Tiêu đề", 72)])], THE);
  assert.deepStrictEqual(r.loi, []);
  assert.deepStrictEqual(danhGiaDeDoc([sl(1, "noi-dung", [hop(Array(90).fill("a").join(" "), 20)])], null).loi, []);
});

test("nhãn ngắn không tính vào chữ đọc liền, nhưng quá nhiều nhãn thì báo", () => {
  const nhan = Array.from({ length: 14 }, (_, k) => hop(`Ô ${k}`));
  const r = danhGiaDeDoc([sl(5, "noi-dung", [hop("Tiêu đề ngắn gọn rõ ý", 72), ...nhan])], THE);
  const all = r.loi.join("\n"); assert.doesNotMatch(all, /chữ đọc liền/); assert.match(all, /14 nhãn ngắn/);
});

