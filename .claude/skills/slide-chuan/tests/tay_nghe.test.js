// Tay nghề: bảng xem thử asset, kiểm thẻ phong cách (phong-cach.json), bộ thành phần bảng (hinh/bang.css), tờ so sánh với tham chiếu.
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), os = require("os"), path = require("path");
const { dung, ghepHtml } = require("../scripts/dung");
const { kiemPhongCach } = require("../scripts/kiem_phong_cach");
const { toSoSanh } = require("../scripts/to_so_sanh");

const SVG_PHANG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="#0F5C55"/></svg>`;
const SVG_GRAD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><defs><linearGradient id="g"><stop offset="0" stop-color="#fff"/></linearGradient><filter id="b"><feGaussianBlur stdDeviation="2"/></filter></defs><rect width="10" height="10" fill="url(#g)" filter="url(#b)"/></svg>`;

const baiMau = () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "sc-tn-")); for (const x of ["slides", "asset", "thiet-ke"]) fs.mkdirSync(path.join(d, x));
  fs.writeFileSync(path.join(d, "asset", "phang.svg"), SVG_PHANG); fs.writeFileSync(path.join(d, "asset", "grad.svg"), SVG_GRAD);
  fs.writeFileSync(path.join(d, "slides", "01.html"), `<section class="s" style="background:#F6F1E7">
  <h1 data-t data-tieu-de style="position:absolute;left:120px;top:100px;width:1200px;font-size:60px">Bảng và hình</h1>
  <img data-l="a" data-alt="Hình phẳng" src="asset/phang.svg" style="position:absolute;left:120px;top:300px;width:200px">
  <img data-l="b" data-alt="Hình có gradient" src="asset/grad.svg" style="position:absolute;left:400px;top:300px;width:200px">
  <div class="tb tb-ke" data-bang="T2" style="position:absolute;left:800px;top:300px;width:900px">
    <div class="tb-h"><b data-t>Cột một</b><b data-t>Cột hai</b></div><div class="tb-r"><b data-t>Ô một</b><b data-t>Ô hai</b></div></div>
</section>`);
  return d;
};

test("kiểm phong cách: phong-cach.json cấm gradient và bóng mờ → báo đúng hình", () => {
  const d = baiMau(); fs.writeFileSync(path.join(d, "thiet-ke", "phong-cach.json"), JSON.stringify({ ten: "phẳng 2 tông", gradient: false, bongMo: false, mauToiDa: 8 }));
  const loi = kiemPhongCach(d, ["asset/phang.svg", "asset/grad.svg"]).join("\n");
  assert.match(loi, /grad\.svg.*gradient/); assert.match(loi, /grad\.svg.*bóng mờ/); assert.doesNotMatch(loi, /phang\.svg/);
});

test("không có phong-cach.json → không kiểm, không lỗi", () => {
  assert.deepStrictEqual(kiemPhongCach(baiMau(), ["asset/grad.svg"]), []);
});

test("ghép HTML nạp bộ thành phần bảng hinh/bang.css", () => {
  assert.match(ghepHtml(baiMau()).html, /bang\.css/);
});

test("dựng: có bảng xem thử asset, báo lỗi phong cách, bảng thành phần dựng được", { timeout: 240000 }, async () => {
  const d = baiMau(); fs.writeFileSync(path.join(d, "thiet-ke", "phong-cach.json"), JSON.stringify({ gradient: false, bongMo: false }));
  const r = await dung(d, { ten: "tn", soat: false, nhap: true });
  assert.ok(r.bangAsset && fs.existsSync(r.bangAsset), "phải có ảnh bảng xem thử asset");
  assert.match(r.loi.join("\n"), /◇ phong cách: .*grad\.svg/);
  assert.ok(r.text >= 5, "các ô bảng thành phần là hộp chữ sửa được");
  process.exitCode = 0;
});

test("tờ so sánh: ghép slide cạnh mẫu tham chiếu theo danh sách cặp", { timeout: 60000 }, async () => {
  const sharp = require("sharp"), d = fs.mkdtempSync(path.join(os.tmpdir(), "sc-ss-"));
  for (const [f, c] of [["h-01.jpg", "#0F5C55"], ["ref-01.jpg", "#B0302A"]]) await sharp({ create: { width: 640, height: 360, channels: 3, background: c } }).jpeg().toFile(path.join(d, f));
  const out = await toSoSanh({ lop: d, thamChieu: d, cap: [[1, "ref-01.jpg"]], ra: path.join(d, "so-sanh.jpg") });
  const m = await sharp(out).metadata(); assert.ok(m.width >= 1280 && fs.existsSync(out));
});
