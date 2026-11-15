// Mép hoạ tiết dưới chữ: chữ vắt qua mép dải chéo / cung tròn của lớp nền (hai mảng màu phẳng sau dòng chữ) phải bị bắt;
// chữ nằm trọn trên một mảng, hoặc trên đoạn tô nhấn (mark) của chính nó, không bị báo. (Chương 3, cổng thẩm mỹ vòng 2.)
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), os = require("os"), path = require("path");
const { ghepHtml } = require("../scripts/dung");
const { soat } = require("../scripts/soat_chi_tiet");

const lam = (body) => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "sc-mep-")); fs.mkdirSync(path.join(d, "slides"));
  fs.writeFileSync(path.join(d, "nen.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080"><path d="M1920 250 V1080 H1000 Z" fill="#DDECE7"/></svg>`);
  fs.writeFileSync(path.join(d, "slides", "01.html"), `<section class="s" style="background:#FBF7EF;color:#1B2A28">
  <img data-l="nen" data-loai="nen" data-alt="Hình trang trí" src="nen.svg" style="position:absolute;left:0;top:0;width:1920px;height:1080px">
  <h1 data-t data-tieu-de style="position:absolute;left:120px;top:100px;width:1200px;font-size:60px">Tiêu đề trên nền sáng</h1>
  ${body}
</section>`);
  const p = path.join(d, "deck.html"); fs.writeFileSync(p, ghepHtml(d).html); return p;
};

test("dòng chữ vắt qua mép dải chéo → báo mép hoạ tiết", { timeout: 120000 }, async () => {
  const kq = await soat(lam(`<div data-t style="position:absolute;left:700px;top:900px;width:900px;font-size:32px">Dòng nguồn dài chạy ngang qua mép dải chéo màu nhạt</div>`));
  assert.match((kq[0].mep || []).join("\n"), /Dòng nguồn dài/);
});

test("chữ nằm trọn trong dải, hoặc có đoạn tô nhấn của chính nó → không báo", { timeout: 120000 }, async () => {
  const kq = await soat(lam(`<div data-t style="position:absolute;left:1500px;top:900px;width:380px;font-size:32px">Nhãn trong dải</div>
    <div data-t style="position:absolute;left:120px;top:400px;width:800px;font-size:32px">Câu có <mark style="background:#F8ECCD;color:#946512">đoạn tô nhấn dài một chút</mark> ở giữa</div>`));
  assert.deepStrictEqual(kq[0].mep || [], []);
});
