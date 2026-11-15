#!/usr/bin/env node
// ICON NÉT TABLER (MIT) — chép icon vào asset/ của bài, tô một màu nét, chỉnh độ dày; cả deck dùng một bộ, một độ dày.
//   node scripts/icon.js <thư_mục_bài> calendar coins file-certificate … [--mau=#0F5C55] [--net=1.5] [--kieu=outline|filled] [--tim=từ]
// Tên icon: https://tabler.io/icons (hoặc --tim=shield để tìm trong bộ nhớ đệm). Giấy phép MIT — ghi "Tabler Icons, MIT" trong ghi-cong.md.
const fs = require("fs"), path = require("path"), { damBao } = require("./tai_nguyen");

function layIcon(dir, ten, { mau = "#0F5C55", net = 1.5, kieu = "outline" } = {}) {
  const goc = path.join(damBao(), "@tabler", "icons", "icons", kieu), ra = [];
  for (const t of ten) { const f = path.join(goc, t + ".svg"); if (!fs.existsSync(f)) throw new Error(`không có icon “${t}” (${kieu}) — thử --tim=`);
    let s = fs.readFileSync(f, "utf8").replace(/stroke="currentColor"/g, `stroke="${mau}"`).replace(/fill="currentColor"/g, `fill="${mau}"`).replace(/stroke-width="[\d.]+"/g, `stroke-width="${net}"`);
    const p = path.join(dir, "asset", `icon-${t}.svg`); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); ra.push(p); }
  return ra;
}
const timIcon = (tu, kieu = "outline") => fs.readdirSync(path.join(damBao(), "@tabler", "icons", "icons", kieu)).filter((f) => f.includes(tu)).map((f) => f.slice(0, -4));

module.exports = { layIcon, timIcon };
if (require.main === module) {
  const a = process.argv.slice(2), o = Object.fromEntries(a.filter((s) => s.startsWith("--")).map((s) => s.slice(2).split("="))), pos = a.filter((s) => !s.startsWith("--"));
  if (o.tim) { console.log(timIcon(o.tim, o.kieu).join(" ")); process.exit(0); }
  if (pos.length < 2) { console.error("Dùng: node scripts/icon.js <thư_mục_bài> tên1 tên2 … [--mau=#hex] [--net=1.5] [--kieu=outline|filled] | --tim=từ"); process.exit(2); }
  try { for (const p of layIcon(pos[0], pos.slice(1), { mau: o.mau, net: o.net, kieu: o.kieu })) console.log("✓ " + p); } catch (e) { console.error("✗ " + e.message); process.exit(1); }
}
