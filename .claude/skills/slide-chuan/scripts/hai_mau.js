#!/usr/bin/env node
// ẢNH HAI MÀU (duotone) — biến ảnh thật / tranh tư liệu thành hai màu của bảng màu bài: tối ↔ sáng theo độ sáng điểm ảnh.
// Ảnh khác nguồn, khác tông về chung một giọng; chữ đặt cạnh ảnh dễ đọc hơn ảnh màu gốc.
//   node scripts/hai_mau.js <vào> <ra.jpg> [--toi=#0B4540] [--sang=#F6F1E7] [--rong=1920] [--cao=1080] [--gamma=0.9]
// Ảnh dùng phải có giấy phép (phạm vi công cộng / CC0 / CC BY… — ghi TASL trong ghi-cong.md); không dùng ảnh AI.
const path = require("path");
const rgb = (h) => { const s = h.replace("#", ""); return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)); };

async function haiMau(vao, ra, { toi = "#0B4540", sang = "#F6F1E7", rong, cao, gamma = 0.9 } = {}) {
  const sharp = require("sharp"); let im = sharp(vao); if (rong || cao) im = im.resize(rong ? +rong : null, cao ? +cao : null, { fit: "cover" });
  const { data, info } = await im.grayscale().normalise().raw().toBuffer({ resolveWithObject: true });
  const a = rgb(toi), b = rgb(sang), out = Buffer.alloc(info.width * info.height * 3);
  for (let i = 0; i < info.width * info.height; i++) { const t = Math.pow(data[i * info.channels] / 255, +gamma); for (let c = 0; c < 3; c++) out[i * 3 + c] = Math.round(a[c] + (b[c] - a[c]) * t); }
  require("fs").mkdirSync(path.dirname(path.resolve(ra)), { recursive: true });
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 3 } }).jpeg({ quality: 90, chromaSubsampling: "4:4:4" }).toFile(ra);
  return { ra, rong: info.width, cao: info.height };
}

module.exports = { haiMau };
if (require.main === module) {
  const a = process.argv.slice(2), o = Object.fromEntries(a.filter((s) => s.startsWith("--")).map((s) => s.slice(2).split("="))), pos = a.filter((s) => !s.startsWith("--"));
  if (pos.length < 2) { console.error("Dùng: node scripts/hai_mau.js <vào> <ra.jpg> [--toi=#hex] [--sang=#hex] [--rong=] [--cao=] [--gamma=]"); process.exit(2); }
  haiMau(pos[0], pos[1], o).then((r) => console.log(`✓ ${path.resolve(r.ra)} (${r.rong}×${r.cao})`)).catch((e) => { console.error("✗ " + e.message); process.exit(1); });
}
