// Lớp PNG trong suốt: điểm ảnh alpha = 0 mang màu đen (0,0,0,0). Trình xem không nhân trước alpha (LibreOffice, Keynote, Google Slides)
// pha màu đen đó vào mép khi thu nhỏ → đường kẻ xám 1 px ở mép dải nền (Chương 3, vòng duyệt 6). loangMep tô vùng trong suốt sát mép
// bằng màu điểm kề bên, giữ nguyên alpha → hình hiện y hệt, mép hết viền xám.
const test = require("node:test"), assert = require("node:assert");
const sharp = require("sharp");
const { loangMep } = require("../hinh/build");

test("điểm trong suốt sát mép mang màu của dải bên cạnh, alpha vẫn 0; điểm đục không đổi", async () => {
  const W = 6, H = 6, raw = Buffer.alloc(W * H * 4);   // nửa trên trong suốt (0,0,0,0), nửa dưới bạc hà đục
  for (let y = 3; y < H; y++) for (let x = 0; x < W; x++) raw.set([221, 236, 231, 255], (y * W + x) * 4);
  const png = await sharp(raw, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
  const { data } = await sharp(await loangMep(png)).raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => [...data.slice((y * W + x) * 4, (y * W + x) * 4 + 4)];
  assert.deepStrictEqual(px(2, 2), [221, 236, 231, 0]);   // sát mép: đã loang màu, vẫn trong suốt
  assert.deepStrictEqual(px(2, 4), [221, 236, 231, 255]); // vùng đục giữ nguyên
  assert.strictEqual(px(2, 0)[3], 0);
});
