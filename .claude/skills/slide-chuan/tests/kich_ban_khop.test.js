// Kịch bản là NGUỒN DUY NHẤT của chữ: tiêu đề trên slide phải khớp cột "khẳng định" của kich-ban.md.
// Chương 3: chữ sửa thẳng trong deck.js, kịch bản đứng yên ở bản "chờ duyệt B" — thẩm định trên kịch bản sẽ soát nhầm bản cũ.
const test = require("node:test"), assert = require("node:assert");
const { kiemKichBan } = require("../scripts/kich_ban_khop");

const KB = `# Kịch bản
| # | người nghe thắc mắc | khẳng định (= tiêu đề) | bằng chứng hình | nguồn | giây | lời nói |
|---|---|---|---|---|---|---|
| 1 | Bài gì? | Chương 3: **Bảo hiểm thương mại** | bìa | [G 1] | 30 | … |
| 2 | Vì sao? | Một vụ cháy có thể lấy đi tài sản cả đời | ảnh | [G 2] | 60 | … |
| 3 | Làm được gì? | Sau buổi học, bạn làm được năm việc | 5 mục | brief | 60 | … |`;
const sl = (td) => td.map((t, k) => ({ slide: k + 1, mau: "", notes: "", hop: [{ lop: "td", tieuDe: true, trich: false, chu: t }] }));

test("tiêu đề khớp (bỏ qua dấu câu, in đậm, chữ hoa) → không lỗi; có dòng tóm tắt", () => {
  const r = kiemKichBan(sl(["Chương 3 — Bảo hiểm thương mại", "Một vụ cháy có thể lấy đi tài sản cả đời", "Sau buổi học bạn làm được năm việc"]), KB);
  assert.deepStrictEqual(r.loi, []); assert.match(r.tom, /Kịch bản: 3\/3 tiêu đề khớp/);
});

test("tiêu đề đổi ý trên slide mà kịch bản không đổi → lỗi ◇ kịch bản chỉ đúng slide; lệch số slide → lỗi", () => {
  const r = kiemKichBan(sl(["Bảo hiểm thương mại", "Một vụ cháy có thể lấy đi tài sản cả đời", "Năm việc làm được"]), KB);
  assert.strictEqual(r.loi.length, 1); assert.match(r.loi[0], /◇ kịch bản: slide 3 tiêu đề “Năm việc làm được” khác kịch bản “Sau buổi học, bạn làm được năm việc”/);
  assert.match(kiemKichBan(sl(["a b", "c d"]), KB).loi.join("\n"), /kịch bản có 3 dòng slide, deck có 2 slide/);
});

test("không có kịch bản hoặc không có cột khẳng định → bỏ qua, không lỗi", () => {
  assert.deepStrictEqual(kiemKichBan(sl(["x"]), null).loi, []);
  assert.deepStrictEqual(kiemKichBan(sl(["x"]), "| # | a |\n|---|---|\n| 1 | b |").loi, []);
});
