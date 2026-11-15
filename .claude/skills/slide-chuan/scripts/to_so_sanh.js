#!/usr/bin/env node
// TỜ SO SÁNH: ghép slide của deck cạnh mẫu tham chiếu cùng loại để người duyệt chấm Thẩm mỹ bằng mắt, không theo cảm giác.
//   node scripts/to_so_sanh.js <tên>_lop <thư_mục_tham_chiếu> 10:ref-34.jpg 26:ref-26.jpg … [--ra=<file.jpg>]
// Mỗi hàng: trái = slide NN (h-NN.jpg), phải = mẫu tham chiếu (thu vừa khung 16:9, giữ tỉ lệ).
const fs = require("fs"), path = require("path");

async function toSoSanh({ lop, thamChieu, cap, ra }) {
  const sharp = require("sharp"), W = 960, H = 540, gap = 16, hang = [];
  for (const [n, ref] of cap) {
    const a = path.join(lop, `h-${String(n).padStart(2, "0")}.jpg`), b = path.join(thamChieu, ref);
    if (!fs.existsSync(a) || !fs.existsSync(b)) throw new Error(`thiếu ảnh: ${fs.existsSync(a) ? b : a}`);
    hang.push([await sharp(a).resize(W, H, { fit: "contain", background: "#2a2a2a" }).toBuffer(), await sharp(b).resize(W, H, { fit: "contain", background: "#2a2a2a" }).toBuffer()]);
  }
  const comp = hang.flatMap(([x, y], i) => [{ input: x, left: gap, top: gap + i * (H + gap) }, { input: y, left: 2 * gap + W, top: gap + i * (H + gap) }]);
  ra = ra || path.join(lop, "so-sanh.jpg");
  await sharp({ create: { width: 2 * W + 3 * gap, height: hang.length * (H + gap) + gap, channels: 3, background: "#2a2a2a" } }).composite(comp).jpeg({ quality: 85 }).toFile(ra);
  return ra;
}

module.exports = { toSoSanh };
if (require.main === module) {
  const a = process.argv.slice(2), pos = a.filter((x) => !x.startsWith("--")), ra = (a.find((x) => x.startsWith("--ra=")) || "").slice(5) || undefined;
  if (pos.length < 3) { console.error("Dùng: node scripts/to_so_sanh.js <tên>_lop <thư_mục_tham_chiếu> NN:ref.jpg … [--ra=file.jpg]"); process.exit(2); }
  const cap = pos.slice(2).map((x) => { const [n, r] = x.split(":"); return [+n, r]; });
  toSoSanh({ lop: pos[0], thamChieu: pos[1], cap, ra }).then((p) => console.log(`✓ Tờ so sánh: ${p}`)).catch((e) => { console.error("✗ " + e.message); process.exit(2); });
}
