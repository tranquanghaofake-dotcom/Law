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
</section>`);
  const r = await dung(d, { ten: "sai", soat: false, nhap: true }), all = r.loi.join("\n");
  for (const re of [/không nằm trong \[data-t\]/, /chữ trong SVG/, /tràn khỏi hộp/, /không có tiêu đề/, /thiếu data-alt/]) assert.match(all, re);
  process.exitCode = 0;
});
