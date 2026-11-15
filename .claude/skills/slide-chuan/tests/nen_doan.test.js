// Đoạn chữ tô nền bên trong một hộp chữ (<mark>, <span style="background">): PowerPoint chỉ giữ màu chữ của từng đoạn,
// không giữ nền tô → trong PPTX đoạn đó thành chữ tối trên nền tối (Chương 3, slide 21: “bồi thường, trả tiền bảo hiểm”). Phải bị bắt.
const test = require("node:test"), assert = require("node:assert"), fs = require("fs");
const { chromium } = require("playwright");
const { kiemHtml } = require("../scripts/kiem_html");

const chay = async (body) => {
  const exe = process.env.PW_CHROMIUM || (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
  const b = await chromium.launch(exe ? { executablePath: exe } : {}), p = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  await p.setContent(`<style>section.s{position:relative;width:1920px;height:1080px} section.s > *{position:absolute}</style><section class="s" style="background:#0E4F49">
    <h1 data-t data-tieu-de style="left:120px;top:100px;width:900px;font-size:60px;color:#fff">Tiêu đề</h1>${body}</section>`);
  const r = await p.evaluate(kiemHtml); await b.close(); return r.join("\n");
};

test("đoạn <mark> có nền tô trong hộp chữ → báo", { timeout: 60000 }, async () => {
  assert.match(await chay(`<div data-t style="left:120px;top:400px;width:900px;font-size:40px;color:#fff">bên mua phải <mark style="background:#F3D27E;color:#1B2A28">đóng phí</mark> theo hợp đồng</div>`),
    /slide 1: đoạn “đóng phí” .*nền tô.*PPTX/);
});

test("đoạn nhấn chỉ đổi màu chữ, hoặc hộp chữ tự có nền → không báo", { timeout: 60000 }, async () => {
  const r = await chay(`<div data-t style="left:120px;top:400px;width:900px;font-size:40px;color:#fff">bên mua phải <mark style="background:none;color:#F3D27E">đóng phí</mark> theo <em style="color:#8EC3B6">hợp đồng</em></div>
    <div data-t data-l="chip" data-alt="Nhãn" style="left:120px;top:700px;background:#F3D27E;padding:10px;font-size:28px"><span>CHIP</span></div>`);
  assert.doesNotMatch(r, /nền tô/);
});
