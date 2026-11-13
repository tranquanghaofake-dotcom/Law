// ICON NÉT ĐỒNG NHẤT cho bộ hình: Phosphor Icons, kiểu duotone (giấy phép MIT — hinh/icons/LICENSE-phosphor.txt).
// Chỉ chép những icon cần dùng vào hinh/icons/<tên>.svg (lưới 256, nét + một lớp nền mờ). Thêm icon: chép file <tên>-duotone.svg
// từ gói @phosphor-icons/core (assets/duotone) vào đây, bỏ đuôi "-duotone".
//   icon("umbrella", { mau: "276a58", nen: "d8b35e", op: 0.3 }) → chuỗi <svg> co giãn theo khung chứa
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "icons"), cache = {};
const danhSach = () => fs.readdirSync(DIR).filter((f) => f.endsWith(".svg")).map((f) => f.slice(0, -4));
const coIcon = (ten) => fs.existsSync(path.join(DIR, `${ten}.svg`));
function icon(ten, { mau = "1d2b44", nen = null, op = 0.22 } = {}) {
  if (!coIcon(ten)) { const g = danhSach().filter((x) => x.includes(String(ten).slice(0, 4))).slice(0, 5);
    throw new Error(`Không có icon "${ten}" trong hinh/icons${g.length ? ` — gần giống: ${g.join(", ")}` : ""}`); }
  const s = cache[ten] || (cache[ten] = fs.readFileSync(path.join(DIR, `${ten}.svg`), "utf8"));
  return s.replace("<svg ", '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" ')
    .replace('fill="currentColor"', `fill="#${mau}"`)
    .replace(/opacity="0\.2"/g, nen ? `fill="#${nen}" opacity="${op}"` : `opacity="${op}"`);
}
module.exports = { icon, coIcon, danhSach };
