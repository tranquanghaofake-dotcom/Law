// Tương phản: chữ cùng màu với thẻ nền (chữ trắng kế thừa từ section nền đậm, đặt trong thẻ trắng) phải bị bắt —
// trước đây ảnh "ẩn chữ" và "hiện chữ" giống hệt nhau nên không tìm được nét chữ → bỏ qua im lặng.
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), os = require("os"), path = require("path");
const { ghepHtml } = require("../scripts/dung");
const { soat } = require("../scripts/soat_chi_tiet");

const lam = (body) => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "sc-tp-")); fs.mkdirSync(path.join(d, "slides"));
  fs.writeFileSync(path.join(d, "slides", "01.html"), `<section class="s" style="background:#0F5C55;color:#fff">
  <h1 data-t data-tieu-de style="position:absolute;left:120px;top:100px;width:1200px;font-size:60px">Câu hỏi trên nền đậm</h1>
  ${body}
</section>`);
  const p = path.join(d, "deck.html"); fs.writeFileSync(p, ghepHtml(d).html); return p;
};

test("chữ trắng kế thừa trong thẻ trắng → báo tương phản", { timeout: 120000 }, async () => {
  const kq = await soat(lam(`<div style="position:absolute;left:120px;top:400px;width:800px;height:200px;background:#fff;border-radius:20px">
    <b data-t style="position:absolute;left:30px;top:60px;width:700px;font-size:36px;font-weight:600">Phương án A bị mất chữ</b></div>`));
  assert.match(kq[0].tuongPhan.join("\n"), /Phương án A bị mất chữ/);
});

test("chữ tối trong thẻ trắng trên nền đậm → không báo", { timeout: 120000 }, async () => {
  const kq = await soat(lam(`<div style="position:absolute;left:120px;top:400px;width:800px;height:200px;background:#fff;border-radius:20px">
    <b data-t style="position:absolute;left:30px;top:60px;width:700px;font-size:36px;font-weight:600;color:#1D2B2A">Phương án A đọc rõ</b></div>`));
  assert.deepStrictEqual(kq[0].tuongPhan, []);
});
