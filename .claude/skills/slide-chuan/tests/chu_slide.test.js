// Xuất chữ từng slide (kèm lời nói) để người thẩm định học thuật / biên tập đọc — đọc thẳng slides/*.html, không cần trình duyệt.
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), os = require("os"), path = require("path");
const { docChu, vietChu } = require("../scripts/chu_slide");

const bai = () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), "chu-")); fs.mkdirSync(path.join(d, "slides"));
  fs.writeFileSync(path.join(d, "slides", "01.html"), `<section class="s sang" data-mau="trich" data-notes="Nói: hai bên &quot;tin tưởng&quot; &amp; khai đúng.">
  <img data-l="lop-1" data-alt="Hình" src="a.svg">
  <h1 class="td" data-t data-tieu-de style="left:1px">Trung thực: <em>nghĩa vụ hai chiều</em></h1>
  <div class="trich" data-t data-trich>“…các bên <mark>phải</mark> cung cấp thông tin…”</div>
  <div class="giua" data-t><div><span>Ô lồng</span> nhau</div> vẫn đủ</div>
  <div class="cap"><b data-t class="la-t">Bên mua</b><span data-t class="la-m">đóng phí &lt;luôn&gt;</span></div>
</section>`);
  fs.writeFileSync(path.join(d, "slides", "02.html"), `<section class="s" data-mau="noi-dung"><h1 data-t data-tieu-de>Slide hai</h1></section>`);
  return d; };

test("đọc đủ hộp chữ theo thứ tự, gỡ thẻ lồng và thực thể, đánh dấu tiêu đề / trích, lấy lời nói", () => {
  const ds = docChu(bai());
  assert.strictEqual(ds.length, 2);
  assert.strictEqual(ds[0].mau, "trich");
  assert.strictEqual(ds[0].notes, "Nói: hai bên \"tin tưởng\" & khai đúng.");
  assert.deepStrictEqual(ds[0].hop.map((h) => h.chu), ["Trung thực: nghĩa vụ hai chiều", "“…các bên phải cung cấp thông tin…”", "Ô lồng nhau vẫn đủ", "Bên mua", "đóng phí <luôn>"]);
  assert.ok(ds[0].hop[0].tieuDe && ds[0].hop[1].trich && !ds[0].hop[2].trich);
  assert.strictEqual(ds[1].slide, 2);
});

test("bản markdown có tiêu đề slide, nhãn trích và lời nói", () => {
  const md = vietChu(docChu(bai()));
  assert.match(md, /## Slide 1 · trich — Trung thực: nghĩa vụ hai chiều/);
  assert.match(md, /- \[trích\] “…các bên phải cung cấp thông tin…”/);
  assert.match(md, /> Lời nói: Nói: hai bên "tin tưởng" & khai đúng\./);
  assert.match(md, /## Slide 2 · noi-dung — Slide hai/);
});
