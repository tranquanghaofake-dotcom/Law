// Nguồn hình theo vai: ảnh hai màu, icon Tabler (MIT), nhân vật Open Peeps (CC0). Hai test sau cần bộ nhớ đệm (lần đầu tải từ npm).
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), os = require("os"), path = require("path");
const { haiMau } = require("../scripts/hai_mau");

test("ảnh hai màu: điểm tối → màu tối, điểm sáng → màu sáng, đúng kích thước", async () => {
  const sharp = require("sharp"), d = fs.mkdtempSync(path.join(os.tmpdir(), "sc-hm-")), vao = path.join(d, "vao.png");
  const px = Buffer.alloc(200 * 100 * 3); for (let x = 0; x < 200; x++) for (let y = 0; y < 100; y++) px.fill(x < 100 ? 0 : 255, (y * 200 + x) * 3, (y * 200 + x) * 3 + 3);
  await sharp(px, { raw: { width: 200, height: 100, channels: 3 } }).png().toFile(vao);
  const r = await haiMau(vao, path.join(d, "ra.jpg"), { toi: "#0B4540", sang: "#F6F1E7" });
  const { data, info } = await sharp(r.ra).raw().toBuffer({ resolveWithObject: true }), at = (x) => [...data.slice((50 * info.width + x) * 3, (50 * info.width + x) * 3 + 3)];
  assert.strictEqual(info.width, 200); const [t, s] = [at(20), at(180)];
  assert.ok(Math.abs(t[0] - 11) < 12 && Math.abs(t[1] - 69) < 12, `tối: ${t}`); assert.ok(Math.abs(s[0] - 246) < 12 && Math.abs(s[2] - 231) < 12, `sáng: ${s}`);
});

test("icon Tabler: chép, tô màu nét, đổi độ dày", { timeout: 300000 }, () => {
  const { layIcon } = require("../scripts/icon"), d = fs.mkdtempSync(path.join(os.tmpdir(), "sc-ic-"));
  const [p] = layIcon(d, ["calendar"], { mau: "#0F5C55", net: 1.5 }), s = fs.readFileSync(p, "utf8");
  assert.match(s, /stroke="#0F5C55"/); assert.match(s, /stroke-width="1.5"/); assert.doesNotMatch(s, /currentColor/);
  assert.throws(() => layIcon(d, ["khong-co-icon-nay"]), /không có icon/);
});

test("nhân vật Open Peeps: ghép dáng + tóc + mặt, tô màu, đầu nằm trên cổ", { timeout: 300000 }, async () => {
  const { nhanVat } = require("../scripts/nhan_vat"), d = fs.mkdtempSync(path.join(os.tmpdir(), "sc-nv-"));
  const r = await nhanVat(path.join(d, "a.svg"), { dang: "BlazerColorPants", toc: "ShortTwo", mat: "Smile", ao: "#2E6DA4" }), s = fs.readFileSync(r.ra, "utf8");
  assert.match(s, /^<svg/); assert.match(s, /#2E6DA4/i);
  assert.ok(Math.abs(r.dau.tx - 141) < 60 && Math.abs(r.dau.ty + 620) < 80, `vị trí đầu ${JSON.stringify(r.dau)}`);
  await assert.rejects(nhanVat(path.join(d, "b.svg"), { dang: "KhongCo" }), /không có dáng/);
});

test("chữ có chân Lora: dựng ra PPTX có nhúng họ “Lora Dam”", { timeout: 240000 }, async () => {
  const { dung } = require("../scripts/dung"), JSZip = require("jszip"), d = fs.mkdtempSync(path.join(os.tmpdir(), "sc-lora-")); fs.mkdirSync(path.join(d, "slides"));
  fs.writeFileSync(path.join(d, "slides", "01.html"), `<section class="s" style="background:#F6F1E7"><h1 data-t data-tieu-de style="position:absolute;left:120px;top:200px;width:1400px;font:700 72px/1.2 'Lora'">Hợp đồng bảo hiểm là sự thoả thuận</h1></section>`);
  const r = await dung(d, { ten: "lora", soat: false, nhap: true }), z = await JSZip.loadAsync(fs.readFileSync(r.outPath));
  const xml = (await Promise.all(Object.keys(z.files).filter((f) => /slide1\.xml$|presentation\.xml$/.test(f)).map((f) => z.file(f).async("string")))).join("");
  assert.match(xml, /Lora Dam/); process.exitCode = 0;
});
