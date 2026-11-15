// Hướng dẫn giao việc cho agent (duyệt, duyệt lại, thẩm định, biên tập) sinh từ MẪU CỐ ĐỊNH — không viết tay mỗi vòng.
// Chương 3: viết tay làm tiêu chí trôi (4 vòng cuối chấm 6 hạng tự đặt, bỏ mất hạng "Nội dung"). Báo cáo mỗi vòng tự lưu <bài>/duyet/.
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), os = require("os"), path = require("path");
const { taoBrief } = require("../scripts/brief");

const bai = () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), "brief-")); fs.writeFileSync(path.join(d, "brief.md"), "# Brief — BNK405 Nghiệp vụ bảo hiểm · Chương 3\n"); return d; };

test("duyệt: đủ 8 hạng, ba mức lỗi, đường dẫn ảnh + chu.md, báo cáo đánh số tự tăng trong duyet/", () => {
  const d = bai(), a = taoBrief(d, "duyet", { ten: "deck" });
  for (const h of ["Nội dung", "Thiết kế", "Mạch lạc", "Dễ hiểu", "Nhất quán", "Phong phú", "Dễ đọc", "Thẩm mỹ"]) assert.match(a.brief, new RegExp(h));
  assert.match(a.brief, /\[CHẶN\].*\n.*\[NÊN\].*\n.*\[GHI NHẬN\]/);
  assert.match(a.brief, /BNK405 Nghiệp vụ bảo hiểm/);
  assert.ok(a.brief.includes(path.join(d, "deck_lop", "chu.md")) && a.brief.includes(path.join(d, "deck_lop", "soat-*.jpg")));
  assert.strictEqual(a.baoCao, path.join(d, "duyet", "01-duyet.md"));
  assert.ok(!/\{\{/.test(a.brief), "không còn chỗ trống chưa điền");
  fs.writeFileSync(a.baoCao, "x");
  assert.strictEqual(taoBrief(d, "tham-dinh", { ten: "deck", lan: 2 }).baoCao, path.join(d, "duyet", "02-tham-dinh-2.md"));
});

test("thẩm định: lần 1 đọc kịch bản, lần 2 đọc chữ thật trên slide; có mục hình nói đúng nội dung", () => {
  const d = bai();
  assert.match(taoBrief(d, "tham-dinh", { ten: "deck", lan: 1 }).brief, /chữ cần thẩm định: .*kich-ban\.md/);
  const b = taoBrief(d, "tham-dinh", { ten: "deck", lan: 2, luat: "packages/content/data/laws/blds-2015.txt" }).brief;
  assert.match(b, /chữ cần thẩm định: .*deck_lop\/chu\.md/);
  assert.match(b, /Hình nói đúng nội dung/);
  assert.match(b, /blds-2015\.txt/);
});

test("duyệt lại: chép nguyên danh sách lỗi vòng trước, bắt tìm lỗi mới; thiếu danh sách hoặc vai lạ → báo lỗi", () => {
  const d = bai(), f = path.join(d, "loi.md"); fs.writeFileSync(f, "1. slide 24: 15 ngày tối đa");
  const b = taoBrief(d, "duyet-lai", { ten: "deck", loi: f, slide: "24,26" }).brief;
  assert.match(b, /slide 24: 15 ngày tối đa/); assert.match(b, /Lỗi mới \(vẫn phải tìm/); assert.match(b, /slide 24, 26/);
  assert.throws(() => taoBrief(d, "duyet-lai", { ten: "deck" }), /--loi/);
  assert.throws(() => taoBrief(d, "giam-khao", { ten: "deck" }), /vai/);
});
