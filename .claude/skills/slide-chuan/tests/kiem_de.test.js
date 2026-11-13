// P2 (loi-da-biet-2026-11.md mục E, N5–N6): --soat phải bắt được lỗi chỉ thấy bằng mắt ở phiên 13/11/2026 —
// hình dán đè tiêu đề, nhãn xuống dòng đè tên, chữ đè dải lụa — và cảnh báo tràn phải nêu đúng khối con gây tràn.
const test = require("node:test"), assert = require("node:assert");
const { kiemDeTrongTrang } = require("../hinh/kiem_de");
const { kiemTran } = require("../hinh/dung");

const trang = (body) => `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; } body { width: 1920px; }
  section.s { position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #123; font: 400 40px/1.2 sans-serif; color: #fff; }
  section.s + section.s { margin-top: 24px; } .x { position: absolute; }
</style></head><body>${body}</body></html>`;

async function chay(html, fn) {
  const { chromium } = require("playwright");
  const browser = await (process.env.PW_CHROMIUM ? chromium.launch({ executablePath: process.env.PW_CHROMIUM }) : chromium.launch().catch(() => chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })));
  try { const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } }); await page.setContent(html); return await fn(page); } finally { await browser.close(); }
}

test("lớp ảnh vẽ SAU, đè lên chữ → ⚠ nêu tên lớp; lớp vẽ TRƯỚC (nằm dưới chữ) → im lặng", async () => {
  const chu = '<div class="x" data-t style="left:100px;top:300px;width:900px">Luật quốc tế khác luật trong nước ở đâu?</div>';
  const hinh = '<div class="x" data-l="deco-3-0" style="left:520px;top:280px;width:260px;height:260px;background:#e53"></div>';
  const de = await chay(trang(`<section class="s" data-title="Chương 1">${chu}${hinh}</section>`), (p) => p.evaluate(kiemDeTrongTrang));
  assert.equal(de.length, 1, de.join("\n")); assert.match(de[0], /slide 1 "Chương 1".*bị lớp ảnh "deco-3-0" đè/);
  const duoi = await chay(trang(`<section class="s">${hinh}${chu}</section>`), (p) => p.evaluate(kiemDeTrongTrang));
  assert.deepEqual(duoi, []);
});

test("chữ nằm trong chính lớp của nó (thẻ, tờ văn kiện) và lớp phủ cả slide (bàn họp, nền) không bị tính là đè", async () => {
  const html = trang(`<section class="s"><div class="x" data-l="the" style="left:100px;top:100px;width:800px;height:300px;background:#eee"><div class="x" data-t style="left:20px;top:20px;color:#000">Chữ trong thẻ</div></div>
    <div class="x" data-t style="left:100px;top:700px">Chữ trên bàn</div><svg class="x" data-l="ban" style="left:0;top:0;width:1920px;height:1080px"><rect x="0" y="650" width="1920" height="430" fill="#246"/></svg></section>`);
  assert.deepEqual(await chay(html, (p) => p.evaluate(kiemDeTrongTrang)), []);
});

test("hai hộp chữ đè nhau (nhãn xuống dòng đè tên) → ⚠; xếp sát nhưng không đè → im lặng", async () => {
  const nhan = (w) => `<div class="x" data-t style="left:100px;top:100px;width:${w}px;font:800 20px/1 sans-serif">ĐẤU TRANH GIÀNH ĐỘC LẬP</div>`;
  const ten = '<div class="x" data-t style="left:100px;top:118px;font:400 46px/1.04 sans-serif">DÂN TỘC TỰ QUYẾT</div>';
  const de = await chay(trang(`<section class="s" data-title="Chủ thể">${nhan(160)}${ten}</section>`), (p) => p.evaluate(kiemDeTrongTrang));
  assert.ok(de.some((m) => /hai hộp chữ đè nhau/.test(m) && /ĐẤU TRANH/.test(m)), de.join("\n"));
  const ok = await chay(trang(`<section class="s">${nhan(600)}${ten.replace("top:118px", "top:132px")}</section>`), (p) => p.evaluate(kiemDeTrongTrang));
  assert.deepEqual(ok, []);
});

test("cảnh báo tràn nêu khối con gây tràn (đã gặp: rút nhầm ô tình huống, thủ phạm là thẻ hệ quả 3 dòng)", async () => {
  const html = trang(`<section class="s" data-tu data-type="chain" data-title="Thắng kiện ở ICJ"><div class="body x" style="left:0;top:300px;width:1920px;height:640px">
    <div class="x cause" style="left:100px;top:0;height:300px;width:500px">Ô tình huống</div><div class="x card cq" style="left:1200px;top:420px;height:300px;width:600px">Hoa Kỳ, thành viên thường trực, phủ quyết dự thảo nghị quyết</div></div></section>`);
  const m = (await chay(html, (p) => kiemTran(p))).join("\n");
  assert.match(m, /tràn \d+ px ở \.body/); assert.match(m, /khối gây tràn: div\.card "Hoa Kỳ, thành viên/);
});
