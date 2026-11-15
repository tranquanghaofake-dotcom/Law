// Xuất chữ từng slide (kèm lời nói) để người thẩm định học thuật / biên tập đọc — đọc thẳng slides/*.html, không cần trình duyệt.
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), os = require("os"), path = require("path");
const { docChu, vietChu } = require("../scripts/chu_slide");

const bai = () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), "chu-")); fs.mkdirSync(path.join(d, "slides"));
  fs.writeFileSync(path.join(d, "slides", "01.html"), `<section class="s sang" data-mau="trich" data-notes="Nói: hai bên &quot;tin tưởng&quot; &amp; khai đúng.">
  <img data-l="lop-1" data-loai="undraw" data-alt="Minh hoạ: xe cứu hộ kéo xe gặp nạn" src="a.svg">
  <img data-l="nen" data-loai="nen" data-alt="Hình trang trí" src="n.svg"><div data-l="k1" data-alt="Bóng thẻ"></div>
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

test("mô tả hình (img data-l, trừ hình trang trí / nền / khối) vào chu.md để thẩm định soát hình đúng nghĩa", () => {
  const ds = docChu(bai());
  assert.deepStrictEqual(ds[0].hinh, ["Minh hoạ: xe cứu hộ kéo xe gặp nạn"]);
  assert.match(vietChu(ds), /- \[hình\] Minh hoạ: xe cứu hộ kéo xe gặp nạn/);
});

test("ước thời lượng: lời nói ~160 tiếng/phút (tối thiểu 10 giây/slide), cộng giây hoạt động theo loại slide; tổng ở đầu chu.md", () => {
  const { uocGiay } = require("../scripts/chu_slide");
  assert.strictEqual(uocGiay({ mau: "noi-dung", notes: Array(80).fill("tiếng").join(" ") }), 30);
  assert.strictEqual(uocGiay({ mau: "hoi", notes: "" }), 70);           // câu hỏi: + 60 s
  assert.strictEqual(uocGiay({ mau: "bang", notes: "Bài 11: tính", bai: true }), 130);   // bài tập: + 120 s
  assert.match(vietChu(docChu(bai())), /Lời nói đọc liền ≈ \d+ phút — CẬN DƯỚI/);
});

test("dựng ngược bảng kịch bản từ deck: tiêu đề, hình, hiện theo (số cú nhấp), giây, lời nói; giữ 'thắc mắc' + 'nguồn' của dòng cũ có tiêu đề gần giống", () => {
  const { kichBanTuDeck } = require("../scripts/chu_slide");
  const d = bai(); fs.writeFileSync(path.join(d, "slides", "02.html"), `<section class="s" data-mau="noi-dung" data-nen="sang" data-notes="Nói | có gạch"><h1 data-t data-tieu-de>Slide hai mới</h1><div data-t data-a="fade" data-click="1">a</div><div data-t data-click="2">b</div></section>`);
  const cu = "| # | Thắc mắc | Khẳng định (= tiêu đề) | Hình | Nguồn | Giây | Lời nói |\n|---|---|---|---|---|---|---|\n| 1 | Vì sao trung thực? | Trung thực: nghĩa vụ hai chiều | x | [L Đ 16 k1] | 60 | … |";
  const md = kichBanTuDeck(docChu(d), cu);
  assert.match(md, /^\| # \| Người nghe đang thắc mắc \| Khẳng định \(= tiêu đề\) \| Bằng chứng hình \| Hiện theo \| Nguồn \| Giây \| Lời nói \|/);
  assert.match(md, /\| 1 \| Vì sao trung thực\? \| Trung thực: nghĩa vụ hai chiều \| Minh hoạ: xe cứu hộ kéo xe gặp nạn \| tự \| \[L Đ 16 k1\] \| \d+ \|/);
  assert.match(md, /\| 2 \| — \| Slide hai mới \| — \| 2 nhấp \| — \| \d+ \| Nói \\\| có gạch \|/);
});

test("bản đồ nhịp dựng từ deck: bố cục, họ nền, hiện theo từng slide + dải họ nền", () => {
  const { nhipTuDeck } = require("../scripts/chu_slide");
  const md = nhipTuDeck(docChu(bai()));
  assert.match(md, /\| 1 \| trich \| sang \| tự \|/); assert.match(md, /Dải họ nền: /);
});
