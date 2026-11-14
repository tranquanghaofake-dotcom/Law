// VẬT / NGƯỜI 3D: Fluent Emoji bản 3D của Microsoft (giấy phép MIT — hinh/f3d/LICENSE-fluentui-emoji.txt), ảnh PNG 256 × 256 có nền trong.
// Dùng sắc nét ở cỡ ≤ 260 px; to hơn thì làm mờ (vật tiền cảnh / hậu cảnh tạo chiều sâu, kiểu Flashslide).
// Thêm vật: tải assets/<Tên>/3D/<ten>_3d.png (người: assets/<Tên>/Medium-Light/3D/…) từ github.com/microsoft/fluentui-emoji vào hinh/f3d/<tên>.png.
// Tránh: vật có chữ nước ngoài hoặc ký hiệu $ (hoa-trang, ngan-hang, tien-bay) — lạc bối cảnh bài luật Việt Nam.
// Bản zip tải lên claude.ai (scripts/dong_goi.py) mang kho gộp hinh/f3d.json (tên → PNG base64) thay cho file lẻ — claude.ai nhận tối đa 200 file.
// Đọc cả hai; trùng tên thì file lẻ thắng.
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "f3d"), KHO = path.join(__dirname, "f3d.json"), cache = {};
let _kho; const kho = () => _kho || (_kho = fs.existsSync(KHO) ? JSON.parse(fs.readFileSync(KHO, "utf8")) : {});
const coLe = (ten) => fs.existsSync(path.join(DIR, `${ten}.png`));
const coF3d = (ten) => coLe(ten) || Object.prototype.hasOwnProperty.call(kho(), ten);
const danhSachF3d = () => [...new Set([...(fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith(".png")).map((f) => f.slice(0, -4)) : []), ...Object.keys(kho())])].sort();
function f3d(ten) {
  if (!coF3d(ten)) { const g = danhSachF3d().filter((x) => x.includes(String(ten).slice(0, 3))).slice(0, 5); throw new Error(`Không có vật 3D "${ten}" trong hinh/f3d${g.length ? ` — gần giống: ${g.join(", ")}` : ""}`); }
  return cache[ten] || (cache[ten] = `data:image/png;base64,${coLe(ten) ? fs.readFileSync(path.join(DIR, `${ten}.png`)).toString("base64") : kho()[ten]}`);
}
module.exports = { f3d, coF3d, danhSachF3d };
