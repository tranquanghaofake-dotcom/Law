// scripts/soat_chi_tiet.js — soát chi tiết bằng máy: chữ gần thẳng hàng mà không thẳng, chữ thiếu tương phản trên nền thật.
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { tp } = require("../scripts/soat_chi_tiet");
let hasPw = true; try { require.resolve("playwright"); } catch { hasPw = false; }

test("tỷ lệ tương phản theo WCAG: đen / trắng = 21, cùng màu = 1", () => {
  assert.strictEqual(tp([0, 0, 0], [255, 255, 255]).toFixed(1), "21.0");
  assert.strictEqual(tp([120, 120, 120], [120, 120, 120]).toFixed(1), "1.0");
});

test("bắt chữ lệch 6 px và chữ xám nhạt trên nền trắng; bỏ qua chữ thẳng hàng, đủ tương phản và nhãn số liệu", { skip: !hasPw && "không có Playwright", timeout: 120000 }, async () => {
  const { soat } = require("../scripts/soat_chi_tiet");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "soat-ct-")), f = path.join(dir, "deck.html");
  const o = (x, y, chu, mau = "#13213f", them = "") => `<div data-t ${them} style="position:absolute;left:${x}px;top:${y}px;width:600px;font:700 30px/1.2 sans-serif;color:${mau}">${chu}</div>`;
  fs.writeFileSync(f, `<!doctype html><html><body style="margin:0"><section class="s" data-type="thu" data-title="Thử" style="position:relative;width:1920px;height:1080px;background:#fff">
    ${o(110, 100, "Tiêu đề canh lề")}${o(110, 200, "Dòng cùng lề")}${o(116, 300, "Dòng lệch sáu điểm ảnh")}${o(110, 400, "Chữ quá nhạt", "#c9d2e4")}${o(400, 500, "+62,9", "#13213f", "data-dl")}${o(405, 560, "+60,8", "#13213f", "data-dl")}
  </section></body></html>`);
  const [s] = await soat(f);
  assert.strictEqual(s.lech.length, 3, s.lech.join(" | "));   // dòng lệch với ba dòng canh lề 110 (nhãn số liệu data-dl không tính)
  assert.ok(s.lech.every((m) => m.includes("Dòng lệch")));
  assert.strictEqual(s.tuongPhan.length, 1, s.tuongPhan.join(" | "));
  assert.match(s.tuongPhan[0], /Chữ quá nhạt/);
});

test("bắt dòng mồ côi một chữ; không bắt đoạn một dòng hay dòng cuối đủ dài", { skip: !hasPw && "không có Playwright", timeout: 120000 }, async () => {
  const { soat } = require("../scripts/soat_chi_tiet");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "soat-mc-")), f = path.join(dir, "deck.html");
  const o = (y, html) => `<div data-t style="position:absolute;left:110px;top:${y}px;width:900px;font:400 30px/1.3 sans-serif;color:#13213f">${html}</div>`;
  fs.writeFileSync(f, `<!doctype html><html><body style="margin:0"><section class="s" data-type="thu" data-title="Thử" style="position:relative;width:1920px;height:1080px;background:#fff">
    ${o(100, "Thời gian đã rút không còn được tính để hưởng lương hưu sau<br>này")}${o(300, "Một dòng thôi")}${o(500, "Dòng đầu của đoạn hai dòng<br>dòng cuối đủ dài nhiều chữ")}
  </section></body></html>`);
  const [s] = await soat(f);
  assert.strictEqual(s.moCoi.length, 1, s.moCoi.join(" | ")); assert.match(s.moCoi[0], /“này”/);
});

test("bắt nét vẽ dọc (đường ngưỡng nét đứt) cắt qua chữ; không bắt chữ trên nền yên hay chữ trên ảnh", { skip: !hasPw && "không có Playwright", timeout: 120000 }, async () => {
  const { soat } = require("../scripts/soat_chi_tiet");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "soat-cat-")), f = path.join(dir, "deck.html");
  const o = (x, y, chu) => `<div data-t style="position:absolute;left:${x}px;top:${y}px;font:800 28px/1.2 sans-serif;color:#7a1a10;white-space:nowrap">${chu}</div>`;
  const soc = Array.from({ length: 60 }, (_, i) => `<i style="position:absolute;left:${i * 10}px;top:0;width:5px;height:200px;background:hsl(${i * 37} 70% 50%)"></i>`).join("");
  fs.writeFileSync(f, `<!doctype html><html><body style="margin:0"><section class="s" data-type="thu" data-title="Thử" style="position:relative;width:1920px;height:1080px;background:#fff">
    <div style="position:absolute;left:300px;top:80px;height:300px;border-left:6px dashed #7a1a10"></div>${o(200, 120, "Trên 50%: nghị quyết thường")}
    ${o(200, 500, "Nhãn trên nền trắng yên")}
    <div style="position:absolute;left:900px;top:700px;width:600px;height:200px">${soc}</div>${o(950, 780, "Chữ trên ảnh sọc màu")}
  </section></body></html>`);
  const [s] = await soat(f);
  assert.strictEqual(s.cat.length, 1, s.cat.join(" | ")); assert.match(s.cat[0], /Trên 50%/);
});
