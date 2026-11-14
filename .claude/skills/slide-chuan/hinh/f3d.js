// VẬT / NGƯỜI 3D: Fluent Emoji bản 3D của Microsoft (giấy phép MIT — hinh/f3d/LICENSE-fluentui-emoji.txt), ảnh PNG 256 × 256 có nền trong.
// Dùng sắc nét ở cỡ ≤ 260 px; to hơn thì làm mờ (vật tiền cảnh / hậu cảnh tạo chiều sâu, kiểu Flashslide).
// Thêm vật: tải assets/<Tên>/3D/<ten>_3d.png (người: assets/<Tên>/Medium-Light/3D/…) từ github.com/microsoft/fluentui-emoji vào hinh/f3d/<tên>.png.
// Tránh: vật có chữ nước ngoài hoặc ký hiệu $ (hoa-trang, ngan-hang, tien-bay) — lạc bối cảnh bài luật Việt Nam.
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "f3d"), cache = {};
const coF3d = (ten) => fs.existsSync(path.join(DIR, `${ten}.png`));
const danhSachF3d = () => fs.readdirSync(DIR).filter((f) => f.endsWith(".png")).map((f) => f.slice(0, -4));
function f3d(ten) {
  if (!coF3d(ten)) { const g = danhSachF3d().filter((x) => x.includes(String(ten).slice(0, 3))).slice(0, 5); throw new Error(`Không có vật 3D "${ten}" trong hinh/f3d${g.length ? ` — gần giống: ${g.join(", ")}` : ""}`); }
  return cache[ten] || (cache[ten] = `data:image/png;base64,${fs.readFileSync(path.join(DIR, `${ten}.png`)).toString("base64")}`);
}
module.exports = { f3d, coF3d, danhSachF3d };
