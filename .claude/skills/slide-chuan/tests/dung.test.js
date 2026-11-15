// Kiểm công cụ dựng: ví dụ mẫu sạch lỗi; deck cố tình sai bị bắt đủ lỗi; ghép HTML đúng thứ tự file.
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), os = require("os"), path = require("path");
const { dung, ghepHtml } = require("../scripts/dung");
const MAU = path.join(__dirname, "..", "examples", "mau");

test("ghép slide theo thứ tự tên file, có base href và CSS của bài", () => {
  const { files, html } = ghepHtml(MAU);
  assert.deepStrictEqual(files, ["01-bia.html", "02-hai-the.html"]);
  assert.ok(html.indexOf("01-bia.html") < html.indexOf("02-hai-the.html"));
  assert.match(html, /<base href="file:\/\/.*\/mau\/">/);
  assert.match(html, /style\.css/);
});

test("thiếu thư mục slides hoặc section → mã 2", () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "sc-"));
  assert.throws(() => ghepHtml(d), (e) => e.code === 2);
  fs.mkdirSync(path.join(d, "slides")); fs.writeFileSync(path.join(d, "slides", "01.html"), "<div>không có section</div>");
  assert.throws(() => ghepHtml(d), (e) => e.code === 2 && /section/.test(e.message));
});

test("ví dụ mẫu dựng ra PPTX, không lỗi", { timeout: 240000 }, async () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "sc-mau-")); fs.cpSync(MAU, out, { recursive: true });
  const r = await dung(out, { ten: "mau", soat: false });
  assert.strictEqual(r.slides, 2); assert.ok(fs.existsSync(r.outPath)); assert.deepStrictEqual(r.loi, []);
  assert.ok(r.tong.length === 1 && fs.existsSync(r.tong[0]));
  process.exitCode = 0;
});

test("deck sai bị bắt: chữ không data-t, chữ trong SVG, tràn hộp, thiếu tiêu đề, thiếu data-alt", { timeout: 240000 }, async () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "sc-sai-")); fs.mkdirSync(path.join(d, "slides"));
  fs.writeFileSync(path.join(d, "slides", "01.html"), `<section class="s">
  <p style="position:absolute;left:100px;top:100px;font-size:40px">Chữ quên gắn data-t</p>
  <svg style="position:absolute;left:100px;top:300px;width:300px;height:100px"><text x="0" y="50">chữ SVG</text></svg>
  <div data-t style="position:absolute;left:100px;top:500px;width:200px;height:40px;font-size:40px;line-height:40px">Câu này quá dài nên tràn khỏi hộp nhỏ</div>
  <div data-l="hinh" style="position:absolute;left:1200px;top:300px;width:200px;height:200px;background:#c33"></div>
  <div data-l="tran" data-alt="Hình tràn mép dưới" style="position:absolute;left:600px;top:900px;width:200px;height:300px;background:#36c"></div>
</section>`);
  const r = await dung(d, { ten: "sai", soat: false, nhap: true }), all = r.loi.join("\n");
  for (const re of [/không nằm trong \[data-t\]/, /chữ trong SVG/, /tràn khỏi hộp/, /không có tiêu đề/, /thiếu data-alt/, /tràn khỏi mép slide/]) assert.match(all, re);
  process.exitCode = 0;
});

// Gốc: deck Chương 3 (bài giảng bảo hiểm) — 3 chỗ chữ đè chữ mà máy báo "Không còn lỗi" (lõi 50 % khung dòng chỉ bắt khi hai dòng cách < ~0,6 em).
test("hai hộp chữ đè nhau bị bắt, kể cả cùng cha; số lớn + đơn vị sát dưới không báo nhầm", { timeout: 240000 }, async () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "sc-de-")); fs.mkdirSync(path.join(d, "slides"));
  const td = (x) => `<div data-t data-tieu-de style="position:absolute;left:120px;top:60px;width:1500px;font:800 60px/1.1 'Be Vietnam Pro'">${x}</div>`;
  fs.writeFileSync(path.join(d, "slides", "01-the.html"), `<section class="s" data-title="the">${td("Thẻ")}
  <div class="the" style="position:absolute;left:120px;top:300px;width:520px;height:340px;background:#fff">
    <div data-t style="position:absolute;left:40px;top:30px;width:440px;font:800 44px/1.2 'Be Vietnam Pro'">Nguyên tắc trung thực tuyệt đối</div>
    <div data-t style="position:absolute;left:40px;top:100px;width:440px;font:400 30px/1.4 'Be Vietnam Pro'">Bên mua phải kê khai đầy đủ.</div>
  </div></section>`);
  fs.writeFileSync(path.join(d, "slides", "02-ds.html"), `<section class="s" data-title="ds">${td("Danh sách")}
  ${["Dòng một ngắn", "Dòng hai rất dài nên phải xuống thêm một dòng nữa và đè", "Dòng ba bị đè"].map((x, i) =>
    `<div data-t style="position:absolute;left:120px;top:${300 + 70 * i}px;width:700px;font:400 32px/1.4 'Be Vietnam Pro'">${x}</div>`).join("\n  ")}
  </section>`);
  fs.writeFileSync(path.join(d, "slides", "03-so.html"), `<section class="s" data-title="so">${td("Số lớn")}
  <div data-t style="position:absolute;left:120px;top:300px;font:400 200px/1 'Anton'">850</div>
  <div data-t style="position:absolute;left:120px;top:500px;font:400 34px/1.2 'Be Vietnam Pro'">triệu đồng mỗi vụ</div>
  </section>`);
  const r = await dung(d, { ten: "de", soat: false, nhap: true }), de = r.loi.filter((x) => /hai hộp chữ đè nhau/.test(x));
  assert.ok(de.some((x) => /slide 1 .*Nguyên tắc trung thực.*Bên mua/.test(x)), "tiêu đề 2 dòng đè mô tả trong thẻ:\n" + r.loi.join("\n"));
  assert.ok(de.some((x) => /slide 2 .*Dòng hai rất dài.*Dòng ba/.test(x)), "dòng dài xuống dòng đè dòng dưới:\n" + r.loi.join("\n"));
  assert.ok(!de.some((x) => /Dòng một/.test(x)), "hai dòng cách đủ không được báo:\n" + de.join("\n"));
  assert.ok(!de.some((x) => /slide 3/.test(x)), "số lớn + đơn vị sát dưới (không chạm nét) không được báo:\n" + de.join("\n"));
  process.exitCode = 0;
});
