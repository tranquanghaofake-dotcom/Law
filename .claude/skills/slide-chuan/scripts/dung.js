#!/usr/bin/env node
// DỰNG DECK TỪ CÁC SLIDE HTML THIẾT KẾ TỰ DO → PPTX sửa được + kiểm lỗi + ảnh tổng.
//   node scripts/dung.js <thư_mục_bài> [--ten=<tên file>] [--khong-soat] [--nhap]
// Thư mục bài:
//   slides/*.html   mỗi file chứa ≥ 1 <section class="s" …>…</section> (thứ tự = tên file) — quy ước: references/hop-dong-html.md
//   style.css       CSS riêng của bài (tuỳ chọn)
//   asset/, anh/    hình tự vẽ, ảnh thật — đường dẫn trong HTML tính từ thư mục bài
// Đa dạng (nền, asset lặp, kiểu bảng): scripts/da_dang.js · thẻ phong cách asset (thiet-ke/phong-cach.json): scripts/kiem_phong_cach.js — lỗi ◇ cũng là lỗi.
// Bộ thành phần bảng T1–T13: hinh/bang.css (nạp sẵn). Bảng xem thử asset: <tên>_lop/asset.jpg.
// Ra: <tên>.pptx, <tên>_lop/ (deck.html, h-XX.jpg từng slide, tong-N.jpg ảnh tổng 3×3, soat-*.jpg so HTML với PPTX qua LibreOffice)
// Cổng duyệt: không có --nhap thì đòi <bài>/duyet.json ghi người dùng đã duyệt A, B, C và hướng phong cách khớp thẻ (scripts/cong_duyet.js).
// Mã thoát: 0 sạch · 1 còn lỗi (mọi ⚠ đều là lỗi — mục tiêu "càng ít lỗi càng tốt"; --nhap để dựng xem trước dù còn lỗi) · 2 không dựng được.
const fs = require("fs"), path = require("path");
const HINH = path.join(__dirname, "..", "hinh");
const url = (p) => "file://" + path.resolve(p).split(path.sep).map(encodeURIComponent).join("/").replace(/^file:\/\/%3A/, "file://");

function ghepHtml(dir) {
  const sd = path.join(dir, "slides");
  if (!fs.existsSync(sd)) throw Object.assign(new Error(`Không có thư mục ${sd}`), { code: 2 });
  const files = fs.readdirSync(sd).filter((f) => f.endsWith(".html")).sort();
  if (!files.length) throw Object.assign(new Error(`${sd} chưa có slide .html nào`), { code: 2 });
  const loi = [], parts = files.map((f) => { const h = fs.readFileSync(path.join(sd, f), "utf8");
    if (!/<section\b[^>]*class="[^"]*\bs\b/.test(h)) loi.push(`${f}: không có <section class="s">`); return `<!-- ${f} -->\n${h}`; });
  if (loi.length) throw Object.assign(new Error(loi.join("\n")), { code: 2 });
  const css = fs.existsSync(path.join(dir, "style.css")) ? `<link rel="stylesheet" href="${url(path.join(dir, "style.css"))}">` : "";
  return { files, html: `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><base href="${url(dir)}/">
<link rel="stylesheet" href="${url(path.join(HINH, "hinh.css"))}"><link rel="stylesheet" href="${url(path.join(HINH, "bang.css"))}">${css}
</head><body>
${parts.join("\n")}
</body></html>` };
}

// BẢNG XEM THỬ ASSET: mọi hình (data-l) của deck trên một tờ, kèm tên file — soát phong cách lệch bằng mắt (nét, màu, gradient, góc nhìn).
async function bangAsset(dir, html, work) {
  const sharp = require("sharp"), srcs = [...new Set([...html.matchAll(/<img\b[^>]*\bdata-l\b[^>]*>/g)].map((m) => (m[0].match(/\bsrc="([^"]+)"/) || [])[1]).filter(Boolean))]
    .filter((s) => !/^(data:|https?:)/.test(s) && fs.existsSync(path.join(dir, s.split("?")[0])));
  if (!srcs.length) return { srcs, anh: null };
  const T = 300, cot = 6, gap = 14, cap = 34, tiles = [];
  for (const [i, s] of srcs.entries()) {
    let buf; try { buf = await sharp(path.join(dir, s.split("?")[0]), { density: 144 }).resize(T, T, { fit: "contain", background: "#F6F1E7" }).flatten({ background: "#F6F1E7" }).toBuffer(); } catch { continue; }
    const ten = path.basename(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").slice(0, 34);
    const nhan = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${T}" height="${cap}"><rect width="100%" height="100%" fill="#2a2a2a"/><text x="8" y="23" font-family="sans-serif" font-size="18" fill="#eee">${ten}</text></svg>`);
    const x = gap + (i % cot) * (T + gap), y = gap + Math.floor(i / cot) * (T + cap + gap);
    tiles.push({ input: buf, left: x, top: y }, { input: await sharp(nhan).png().toBuffer(), left: x, top: y + T });
  }
  const p = path.join(work, "asset.jpg"), hang = Math.ceil(srcs.length / cot);
  await sharp({ create: { width: cot * (T + gap) + gap, height: hang * (T + cap + gap) + gap, channels: 3, background: "#1c1c1c" } }).composite(tiles).jpeg({ quality: 85 }).toFile(p);
  return { srcs, anh: p };
}

function anhTong(work) {
  const sharp = require("sharp"), hs = fs.readdirSync(work).filter((f) => /^h-\d+\.jpg$/.test(f)).sort(), out = [];
  return (async () => { for (let g = 0; g < hs.length; g += 9) { const part = hs.slice(g, g + 9), W = 640, H = 360, gap = 12;
    const comp = await Promise.all(part.map(async (f, k) => ({ input: await sharp(path.join(work, f)).resize(W, H).toBuffer(), left: gap + (k % 3) * (W + gap), top: gap + Math.floor(k / 3) * (H + gap) })));
    const p = path.join(work, `tong-${g / 9 + 1}.jpg`);
    await sharp({ create: { width: 3 * W + 4 * gap, height: Math.ceil(part.length / 3) * (H + gap) + gap, channels: 3, background: "#2a2a2a" } }).composite(comp).jpeg({ quality: 85 }).toFile(p); out.push(p); }
    return out; })();
}

async function dung(dir, { ten, soat = true, nhap = false } = {}) {
  dir = path.resolve(dir); ten = ten || path.basename(dir);
  const outPath = path.join(dir, ten + ".pptx"), work = path.join(dir, ten + "_lop");
  fs.rmSync(work, { recursive: true, force: true }); fs.mkdirSync(work, { recursive: true });
  const { files, html } = ghepHtml(dir), htmlPath = path.join(work, "deck.html"); fs.writeFileSync(htmlPath, html);
  console.log(`· ${files.length} file slide → ${htmlPath}`);
  const { kiemHtml } = require("./kiem_html"), { kiemDeTrongTrang } = require(path.join(HINH, "kiem_de"));
  const loi = nhap ? [] : require("./cong_duyet").kiemCongDuyet(dir);   // bản giao phải có bằng chứng người dùng duyệt A, B, C (duyet.json)
  if (loi.length) console.log(loi.join("\n"));
  const { thuThap, danhGia, NGUONG } = require("./da_dang"), { thuThapNhatQuan, danhGiaNhatQuan } = require("./nhat_quan"), { thuThapPhongPhu, danhGiaPhongPhu } = require("./phong_phu"), { thuThapDeDoc, danhGiaDeDoc } = require("./de_doc"); let dd = null, pp = null, dc = null;
  const fThe = path.join(dir, "thiet-ke", "phong-cach.json"), the = fs.existsSync(fThe) ? JSON.parse(fs.readFileSync(fThe, "utf8")) : null;
  const ng = { ...NGUONG, ...((the && the.nguong) || {}) };
  loi.push(...require("./cong_duyet").kiemVaiBatBuoc(html, the));   // slide bắt buộc theo thể loại (kết luận phần, kết luận chung, cảm ơn…)   // thẻ phong cách được chỉnh ngưỡng đa dạng (vd. deck biên tập tối giản: cùng nền giấy nhiều slide liền là chủ ý)
  const truoc = async (page) => { const a = await page.evaluate(kiemHtml), b = await page.evaluate(kiemDeTrongTrang); dd = danhGia(await page.evaluate(thuThap), ng);
    const nq = danhGiaNhatQuan(await page.evaluate(thuThapNhatQuan), the); pp = danhGiaPhongPhu(await page.evaluate(thuThapPhongPhu), the, the && the.nguong); dc = danhGiaDeDoc(await page.evaluate(thuThapDeDoc), the, the && the.nguong);
    return [...a, ...b, ...dd.loi, ...nq.loi, ...pp.loi, ...dc.loi]; };
  const { build } = require(path.join(HINH, "build"));
  const res = await build({ htmlPath, outPath, soat, giuLop: true, truoc });
  loi.push(...(res.warn || []), ...(res.lost || []));
  if (soat) {
    try { const kq = await require("./soat_chi_tiet").soat(htmlPath);
      for (const s of kq) for (const [k, ds] of [["↔ lệch", s.lech], ["◐ tương phản", s.tuongPhan], ["¶ mồ côi", s.moCoi], ["✂ nét cắt chữ", s.cat], ["⟋ mép hoạ tiết", s.mep]]) for (const m of ds || []) loi.push(`slide ${s.slide}: ${k} ${m}`); }
    catch (e) { console.log(`ℹ không chạy được soát chi tiết: ${String(e.message || e).split("\n")[0]}`); }
    try { const cc = await require("./co_chu").coChu(htmlPath);
      for (const x of cc.nho) loi.push(`slide ${x.slide}: chữ ${x.pt} pt < 12 pt “${x.chu}”`);
      if (cc.than < 0.7) loi.push(`chỉ ${(100 * cc.than).toFixed(0)} % chữ thường ≥ 14 pt (cần ≥ 70 % khi chiếu trên lớp)`); }
    catch (e) { console.log(`ℹ không đo được cỡ chữ: ${String(e.message || e).split("\n")[0]}`); }
  }
  const tong = await anhTong(work);
  const ba = await bangAsset(dir, html, work);
  loi.push(...require("./kiem_phong_cach").kiemPhongCach(dir, ba.srcs));
  if (ba.anh) console.log(`✓ Bảng xem thử asset (${ba.srcs.length} hình — soát cùng một phong cách): ${ba.anh}`);
  if (dd) console.log(dd.bang);
  if (pp && pp.tom) console.log(pp.tom);
  if (dc && dc.tom) console.log(dc.tom);
  console.log(`✓ ${res.slides} slide → ${outPath} · ${res.text} hộp chữ · ${res.pics} lớp ảnh · ${res.fx} hiệu ứng · ${res.morph} Morph`);
  console.log(`✓ Ảnh tổng (xem bằng mắt trước khi giao): ${tong.join(", ")}`);
  if (soat) console.log(`✓ Tờ soát HTML ↔ PPTX: ${path.join(work, "soat-*.jpg")}`);
  if (loi.length) { console.log(`⚠ ${loi.length} lỗi:\n  ${loi.join("\n  ")}`); if (!nhap) process.exitCode = 1; }
  else console.log("✓ Không còn lỗi máy bắt được — còn phải soát bằng mắt và qua người duyệt độc lập (references/soat.md)");
  return { ...res, loi, outPath, work, htmlPath, tong, daDang: dd, bangAsset: ba.anh };
}

module.exports = { dung, ghepHtml };
if (require.main === module) {
  const a = process.argv.slice(2), f = new Set(a.filter((x) => x.startsWith("--"))), pos = a.filter((x) => !x.startsWith("--"));
  if (!pos.length) { console.error("Dùng: node scripts/dung.js <thư_mục_bài> [--ten=<tên>] [--khong-soat] [--nhap]"); process.exit(2); }
  const ten = (a.find((x) => x.startsWith("--ten=")) || "").slice(6) || undefined;
  dung(pos[0], { ten, soat: !f.has("--khong-soat"), nhap: f.has("--nhap") }).catch((e) => { console.error("✗ " + (e.message || e)); process.exit(e.code || 2); });
}
