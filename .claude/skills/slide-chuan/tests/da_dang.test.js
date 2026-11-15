// Kiểm thống kê đa dạng: nền, asset lặp, kiểu bảng — đánh giá thuần (không cần trình duyệt) + bắt được trên deck thật.
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), os = require("os"), path = require("path");
const { danhGia } = require("../scripts/da_dang");

const deck = (n, f) => Array.from({ length: n }, (_, k) => ({ slide: k + 1, nen: "kem", asset: [], bang: [], ...f(k) }));

test("deck đa dạng: không lỗi, có bảng thống kê", () => {
  const nen = ["kem", "kem", "dam", "kem", "chia", "kem", "kem", "anh", "kem", "dam", "kem", "chia"];
  const r = danhGia(deck(12, (k) => ({ nen: nen[k], asset: [`h${k}.svg`], bang: k === 3 ? ["tra"] : k === 6 ? ["dau"] : k === 9 ? ["so"] : [] })));
  assert.deepStrictEqual(r.loi, []);
  assert.strictEqual(r.thongKe.loaiNen, 4);
  assert.match(r.bang, /nền/);
});

test("tiêu điểm: slide có hình cỡ icon (< 25 %) bị bắt; nền đậm và slide khai data-khong-hinh được miễn", () => {
  const r = danhGia(deck(4, (k) => ({ nen: ["kem", "dam", "chia", "anh"][k], tieuDiem: [0.12, 0.05, 0.4, 0.1][k], khongHinh: k === 1 || k === 3 })));
  const all = r.loi.join("\n"); assert.match(all, /◇ tiêu điểm: 1 slide .*slide 1 \(12 %\)/); assert.strictEqual(r.thongKe.tieuDiemDat, 1);
});

test("nền đơn điệu bị bắt: ít loại, một loại áp đảo, quá nhiều slide liền", () => {
  const r = danhGia(deck(14, (k) => ({ nen: k === 0 ? "dam" : "kem" })));
  const all = r.loi.join("\n");
  assert.match(all, /2 loại nền/); assert.match(all, /chiếm 93 %/); assert.match(all, /13 slide liền/);
  assert.strictEqual(danhGia(deck(14, (k) => ({ nen: k % 7 === 6 ? "dam" : k % 7 === 3 ? "chia" : "kem" }))).loi.length, 0, "họ nền sáng ≤ 80 %, ≤ 6 liền: không lỗi");
});

test("cùng họ nền nhưng đổi góc hoạ tiết: không tính đơn điệu theo slide liền, vẫn tính tỉ lệ họ", () => {
  const r = danhGia(deck(14, (k) => ({ ho: k % 7 === 6 ? "N2" : "N1", nen: k % 7 === 6 ? "N2" : `N1@${k % 2}` })));
  assert.match(r.loi.join("\n"), /một họ nền chiếm 86 %/); assert.doesNotMatch(r.loi.join("\n"), /slide liền cùng nền \(/);
  const r2 = danhGia(deck(13, (k) => ({ ho: k === 12 ? "N2" : k === 11 ? "N3" : "N1", nen: k > 10 ? "x" + k : `N1@${k % 2}` })));
  assert.match(r2.loi.join("\n"), /11 slide liền cùng họ nền/);
});

test("asset lặp quá 3 slide bị bắt, trừ khi khai báo cố ý (lặp)", () => {
  const r = danhGia(deck(6, (k) => ({ nen: ["kem", "dam", "chia"][k % 3], asset: ["nguoi.svg", ...(k < 5 ? ["logo.svg (lặp)"] : [])] })));
  const all = r.loi.join("\n");
  assert.match(all, /nguoi\.svg.*6 slide/); assert.doesNotMatch(all, /logo/);
});

test("một kiểu bảng chiếm > 40 % khi ≥ 5 bảng bị bắt", () => {
  const r = danhGia(deck(8, (k) => ({ nen: ["kem", "dam", "chia"][k % 3], bang: k < 6 ? ["tra"] : ["dau"] })));
  assert.match(r.loi.join("\n"), /“tra” chiếm 6\/8/);
});

test("bảng một kiểu bị bắt khi ≥ 3 bảng", () => {
  const r = danhGia(deck(6, (k) => ({ nen: ["kem", "dam", "chia"][k % 3], bang: k % 2 ? ["bang"] : [] })));
  assert.match(r.loi.join("\n"), /3 bảng cùng một kiểu/);
});

test("deck thật: thu thập nền, asset, bảng trong trình duyệt", { timeout: 240000 }, async () => {
  const { dung } = require("../scripts/dung");
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "sc-dd-")); fs.mkdirSync(path.join(d, "slides")); fs.mkdirSync(path.join(d, "asset"));
  fs.writeFileSync(path.join(d, "asset", "a.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="#369"/></svg>`);
  for (let k = 1; k <= 7; k++) fs.writeFileSync(path.join(d, "slides", `0${k}.html`), `<section class="s" style="background:#F6F1E7">
  <h1 data-t data-tieu-de style="position:absolute;left:120px;top:100px;width:1200px;font-size:60px">Slide số ${k}</h1>
  <img data-l="a" data-alt="Hình vuông" src="asset/a.svg" style="position:absolute;left:120px;top:400px;width:200px">
  <div class="bang" style="position:absolute;left:600px;top:400px;width:600px"><b data-t style="font-size:30px">Ô bảng ${k}</b></div>
</section>`);
  const r = await dung(d, { ten: "dd", soat: false, nhap: true }), all = r.loi.join("\n");
  assert.match(all, /7 slide liền cùng nền/); assert.match(all, /a\.svg.*7 slide/); assert.match(all, /7 bảng cùng một kiểu/);
  process.exitCode = 0;
});
