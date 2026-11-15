// Khối trang trí có nền (vạch kẻ, ô màu) KHÔNG phải lớp ảnh và không phải hộp chữ: build vẽ nó vào ảnh nền slide; một lớp ảnh
// (thẻ trắng, panel) đứng trước nó trong DOM mà chồng lên sẽ che mất trong PPTX (Chương 3, slide 17–18: vạch kẻ giữa các dòng trong thẻ). Phải bị bắt.
const test = require("node:test"), assert = require("node:assert"), fs = require("fs");
const { chromium } = require("playwright");
const { kiemHtml } = require("../scripts/kiem_html");

const chay = async (body) => {
  const exe = process.env.PW_CHROMIUM || (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
  const b = await chromium.launch(exe ? { executablePath: exe } : {}), p = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  await p.setContent(`<style>section.s{position:relative;width:1920px;height:1080px} section.s > *{position:absolute}</style><section class="s" style="background:#FBF7EF">
    <h1 data-t data-tieu-de style="left:120px;top:100px;width:900px;font-size:60px">Tiêu đề</h1>
    <div data-l="the" data-alt="Thẻ trắng" style="left:120px;top:300px;width:800px;height:600px;background:#fff"></div>${body}</section>`);
  const r = await p.evaluate(kiemHtml); await b.close(); return r.join("\n");
};

test("vạch kẻ có nền nằm trên thẻ là lớp ảnh, thiếu data-l → báo", { timeout: 60000 }, async () => {
  assert.match(await chay(`<div class="vach" style="left:160px;top:500px;width:700px;height:2px;background:#DCD3C4"></div>`), /slide 1: khối "vach" có nền nằm trên lớp ảnh "the".*PPTX/);
});

test("vạch có data-l, vạch ngoài thẻ, hoặc khối không nền → không báo", { timeout: 60000 }, async () => {
  const r = await chay(`<div class="vach" data-l="v" data-alt="Vạch" style="left:160px;top:500px;width:700px;height:2px;background:#DCD3C4"></div>
    <div class="vach" style="left:1000px;top:500px;width:700px;height:2px;background:#DCD3C4"></div><div class="cap" style="left:160px;top:600px;width:300px;height:80px"></div>`);
  assert.doesNotMatch(r, /có nền nằm trên lớp ảnh/);
});
