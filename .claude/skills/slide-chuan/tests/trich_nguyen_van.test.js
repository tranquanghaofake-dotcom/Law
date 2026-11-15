// Trích nguyên văn: chữ trong hộp [data-trich] phải khớp TỪNG KÝ TỰ với nguồn (noi-dung.md); phần lược bỏ ghi "…".
// Chương 3 slide 21: slide ghi "sự thỏa thuận", bản chính thức ghi "sự thoả thuận" — người duyệt mới bắt được ở vòng 7. Máy phải bắt.
const test = require("node:test"), assert = require("node:assert");
const { kiemTrich } = require("../scripts/trich_nguyen_van");

const NGUON = `- Luật hiện hành [L Đ 4 k16]: "Hợp đồng bảo hiểm là sự thoả thuận giữa bên mua bảo hiểm và doanh nghiệp bảo hiểm, chi nhánh doanh nghiệp bảo hiểm phi nhân thọ nước ngoài, theo đó bên mua bảo hiểm phải đóng phí bảo hiểm, doanh nghiệp bảo hiểm, … phải bồi thường, trả tiền bảo hiểm theo thỏa thuận trong hợp đồng."`;
const sl = (slide, chu) => ({ slide, mau: "trich", notes: "", hop: [{ lop: "trich", tieuDe: false, trich: true, chu }] });

test("trích đúng từng chữ, có lược bỏ bằng … → không lỗi; có dòng tóm tắt", () => {
  const r = kiemTrich([sl(21, "Hợp đồng bảo hiểm là sự thoả thuận giữa bên mua bảo hiểm và doanh nghiệp bảo hiểm, …, theo đó bên mua bảo hiểm phải đóng phí bảo hiểm, doanh nghiệp bảo hiểm, … phải bồi thường, trả tiền bảo hiểm theo thỏa thuận trong hợp đồng.")], NGUON);
  assert.deepStrictEqual(r.loi, []);
  assert.match(r.tom, /Trích nguyên văn: 1 hộp · 3\/3 đoạn khớp nguồn/);
});

test("khác kiểu bỏ dấu (thỏa / thoả) → lỗi chỉ đúng chữ lệch", () => {
  const r = kiemTrich([sl(21, "“Hợp đồng bảo hiểm là sự thỏa thuận giữa bên mua bảo hiểm và doanh nghiệp bảo hiểm…”")], NGUON);
  assert.strictEqual(r.loi.length, 1);
  assert.match(r.loi[0], /◇ trích: slide 21 .*không khớp nguyên văn.*khác dấu: “thỏa” → nguồn ghi “thoả”/);
});

test("đổi chữ (đóng → nộp) → lỗi không khớp; hộp không khai data-trich thì không kiểm; không có nguồn thì bỏ qua", () => {
  assert.match(kiemTrich([sl(21, "theo đó bên mua bảo hiểm phải nộp phí bảo hiểm")], NGUON).loi.join(), /◇ trích: slide 21 .*không có trong nguồn/);
  assert.deepStrictEqual(kiemTrich([{ slide: 3, mau: "noi-dung", notes: "", hop: [{ lop: "dan", trich: false, chu: "câu tự viết không có trong nguồn" }] }], NGUON).loi, []);
  const r = kiemTrich([sl(21, "bất kỳ")], null); assert.deepStrictEqual(r.loi, []); assert.match(r.tom, /bỏ qua/);
});
