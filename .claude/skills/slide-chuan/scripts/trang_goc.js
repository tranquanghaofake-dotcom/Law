#!/usr/bin/env node
// TRANG GỐC — chụp đúng một trang (hoặc một vùng) của tài liệu gốc làm HÌNH CHÍNH (references/nguon-hinh.md, quy tắc 0).
// Vật thật của bài (trang hợp đồng, bảng quyền lợi, điều luật trên công báo, biểu đồ nhóm tự vẽ) nói đúng hơn mọi ảnh minh hoạ chung chung.
//   node scripts/trang_goc.js <tài_liệu.docx|.pdf> <ra.png> --trang=3 [--vung=x,y,w,h] [--rong=1600] [--dpi=200]
//   --vung: tỉ lệ 0–1 theo trang (vd. 0.08,0.42,0.84,0.30 = dải giữa trang). Không có --vung: cả trang.
//   --ds: in số trang và kích thước để chọn vùng. Đánh dấu chỗ đang nói (khung, gạch chân) vẽ bằng HTML đè lên ảnh, không vẽ vào ảnh.
const fs = require("fs"), path = require("path"), os = require("os"), { execFileSync } = require("child_process");

function sangPdf(f) {
  if (/\.pdf$/i.test(f)) return f;
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "tg-"));
  execFileSync("soffice", ["--headless", "--convert-to", "pdf", "--outdir", d, f], { stdio: "ignore" });
  return path.join(d, path.basename(f).replace(/\.[^.]+$/, ".pdf"));
}

async function trangGoc(vao, ra, { trang = 1, vung = null, rong = 1600, dpi = 200 } = {}) {
  const sharp = require("sharp"), pdf = sangPdf(path.resolve(vao)), d = fs.mkdtempSync(path.join(os.tmpdir(), "tg-"));
  execFileSync("pdftoppm", ["-r", String(dpi), "-f", String(trang), "-l", String(trang), "-png", pdf, path.join(d, "p")]);
  const png = fs.readdirSync(d).filter((f) => f.endsWith(".png")).map((f) => path.join(d, f))[0];
  if (!png) throw new Error(`không có trang ${trang}`);
  let im = sharp(png); const m = await im.metadata();
  if (vung) { const [x, y, w, h] = vung; im = sharp(png).extract({ left: Math.round(x * m.width), top: Math.round(y * m.height), width: Math.round(w * m.width), height: Math.round(h * m.height) }); }
  fs.mkdirSync(path.dirname(path.resolve(ra)), { recursive: true });
  await im.resize({ width: rong, withoutEnlargement: true }).png().toFile(ra);
  return ra;
}

if (require.main === module) {
  const a = process.argv.slice(2), f = Object.fromEntries(a.filter((x) => x.startsWith("--")).map((x) => { const [k, v] = x.slice(2).split("="); return [k, v ?? true]; })), pos = a.filter((x) => !x.startsWith("--"));
  if (!pos.length) { console.error("Dùng: node scripts/trang_goc.js <tài_liệu> <ra.png> --trang=N [--vung=x,y,w,h] [--rong=1600] | <tài_liệu> --ds"); process.exit(2); }
  if (f.ds) { const pdf = sangPdf(path.resolve(pos[0])); console.log(execFileSync("pdfinfo", [pdf]).toString().split("\n").filter((l) => /Pages|Page size/.test(l)).join("\n")); console.log(`PDF: ${pdf}`); process.exit(0); }
  trangGoc(pos[0], pos[1], { trang: +f.trang || 1, vung: f.vung ? f.vung.split(",").map(Number) : null, rong: +f.rong || 1600, dpi: +f.dpi || 200 })
    .then((r) => console.log(`✓ ${r}`)).catch((e) => { console.error("✗ " + e.message); process.exit(1); });
}
module.exports = { trangGoc };
