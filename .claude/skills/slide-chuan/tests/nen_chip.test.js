// Hộp chữ có nền riêng (viên nhãn / chip) đặt trên một lớp ảnh [data-l] mà bản thân không có data-l: trong PPTX nền của nó được vẽ
// vào ảnh nền slide và bị lớp ảnh che mất → chữ trắng trên nền nhạt (Chương 3, vòng 4: chip "Câu hỏi tức thì"). Phải bị bắt.
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), os = require("os"), path = require("path");
const { chromium } = require("playwright");
const { kiemHtml } = require("../scripts/kiem_html");

const chay = async (body) => {
  const exe = process.env.PW_CHROMIUM || (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
  const b = await chromium.launch(exe ? { executablePath: exe } : {}), p = await (await b.newContext({ viewport: { width: 1920, height: 1080 } })).newPage();
  await p.setContent(`<style>section.s{position:relative;width:1920px;height:1080px} section.s > *{position:absolute}</style><section class="s" style="background:#FBF7EF">
    <h1 data-t data-tieu-de style="left:120px;top:100px;width:900px;font-size:60px">Tiêu đề</h1>
    <div data-l="panel" data-alt="Cột màu" style="left:0;top:300px;width:720px;height:700px;background:#DDECE7"></div>${body}</section>`);
  const r = await p.evaluate(kiemHtml); await b.close(); return r.join("\n");
};

test("chip có nền nằm trên lớp ảnh, thiếu data-l → báo", { timeout: 60000 }, async () => {
  assert.match(await chay(`<div data-t style="left:120px;top:600px;background:#0E4F49;color:#fff;padding:10px;font-size:28px">CÂU HỎI TỨC THÌ</div>`), /CÂU HỎI TỨC THÌ.*nền riêng.*lớp ảnh "panel"/);
});

test("chip có data-l + data-alt, hoặc chip không đè lớp ảnh nào → không báo", { timeout: 60000 }, async () => {
  const r = await chay(`<div data-t data-l="chip" data-alt="Nhãn" style="left:120px;top:600px;background:#0E4F49;color:#fff;padding:10px;font-size:28px">CÓ LỚP</div>
    <div data-t style="left:900px;top:600px;background:#0E4F49;color:#fff;padding:10px;font-size:28px">NGOÀI LỚP</div>`);
  assert.doesNotMatch(r, /nền riêng/);
});
