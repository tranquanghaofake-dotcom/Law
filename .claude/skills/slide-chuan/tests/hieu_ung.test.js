// Xem trước hiệu ứng: trạng thái CSS theo tiến độ, lịch bắt đầu theo data-at / data-click; phủ màu ảnh đúng khung.
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), os = require("os"), path = require("path");
const { trangThai, lich } = require("../scripts/xem_hieu_ung");
const { phuMau } = require("../scripts/phu_mau");

test("trạng thái: chưa bắt đầu thì ẩn, xong thì hiện đủ; wipe mở dần từ trái", () => {
  assert.strictEqual(trangThai("rise", -0.5).opacity, 0); assert.strictEqual(trangThai("rise", 1).opacity, 1);
  assert.match(trangThai("rise", 0).transform, /translateY\(60/); assert.match(trangThai("wipe", 0).clipPath, /inset\(0 100/);
  assert.strictEqual(trangThai("appear", 0.01).opacity, 1);
});

test("lịch: data-at tính ms, data-click giả lập bấm; độ dài mặc định 500 ms", () => {
  const { pt, het } = lich([{ a: "fade", at: "300" }, { a: "pop", click: "2", dur: "400" }]);
  assert.strictEqual(pt[0].bd, 300); assert.strictEqual(pt[0].dur, 500); assert.strictEqual(pt[1].bd, 2400); assert.strictEqual(het, 2800);
});

test("phủ màu: ảnh ra đúng khung yêu cầu", { timeout: 60000 }, async () => {
  const sharp = require("sharp"), d = fs.mkdtempSync(path.join(os.tmpdir(), "pm-")), v = path.join(d, "v.jpg"), r = path.join(d, "r.jpg");
  await sharp({ create: { width: 800, height: 1200, channels: 3, background: "#88aa66" } }).jpeg().toFile(v);
  await phuMau(v, r, { rong: 960, cao: 540, tu: "trai" });
  const m = await sharp(r).metadata(); assert.strictEqual(m.width, 960); assert.strictEqual(m.height, 540);
});

test("phủ màu: khung vòm cho PNG trong suốt ở góc trên, hạt in không đổi khung", { timeout: 60000 }, async () => {
  const sharp = require("sharp"), d = fs.mkdtempSync(path.join(os.tmpdir(), "pm2-")), v = path.join(d, "v.jpg"), r = path.join(d, "r.png");
  await sharp({ create: { width: 900, height: 1200, channels: 3, background: "#336699" } }).jpeg().toFile(v);
  await phuMau(v, r, { rong: 400, cao: 600, khung: "vom", hat: 0.08 });
  const { data, info } = await sharp(r).raw().toBuffer({ resolveWithObject: true });
  assert.strictEqual(info.channels, 4); assert.strictEqual(data[3], 0);                       // góc trên trái trong suốt
  assert.ok(data[((590 * 400) + 200) * 4 + 3] > 250);                                         // đáy giữa đặc
});

