#!/usr/bin/env node
// DỰNG DECK TỪ CÁC SLIDE HTML THIẾT KẾ TỰ DO → PPTX sửa được + kiểm lỗi + ảnh tổng.
//   node scripts/dung.js <thư_mục_bài> [--ten=<tên file>] [--nhanh] [--khong-soat] [--nhap]
//   --nhanh: chỉ kiểm HTML + chữ (dưới 1 phút, không dựng PPTX / ảnh) — cho vòng sửa; dựng đủ trước khi duyệt
// Thư mục bài:
//   slides/*.html   mỗi file chứa ≥ 1 <section class="s" …>…</section> (thứ tự = tên file) — quy ước: references/hop-dong-html.md
//   style.css       CSS riêng của bài (tuỳ chọn)
//   asset/, anh/    hình tự vẽ, ảnh thật — đường dẫn trong HTML tính từ thư mục bài
// Đa dạng (nền, asset lặp, kiểu bảng): scripts/da_dang.js · thẻ phong cách asset (thiet-ke/phong-cach.json): scripts/kiem_phong_cach.js — lỗi ◇ cũng là lỗi.
// Bộ thành phần bảng T1–T13: hinh/bang.css (nạp sẵn). Bảng xem thử asset: <tên>_lop/asset.jpg.
// Ra: <tên>.pptx, <tên>_lop/ (deck.html, h-XX.jpg từng slide, tong-N.jpg ảnh tổng 3×3, soat-*.jpg so HTML với PPTX qua LibreOffice,
//   chu.md chữ từng slide + lời nói cho thẩm định học thuật / biên tập câu chữ). Hộp [data-trich] đối chiếu từng ký tự với noi-dung.md (scripts/trich_nguyen_van.js).
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

// kiểm trong trang (HTML đã nạp font): chữ không sửa được, tràn, đè, đa dạng, nhất quán, phong phú, dễ đọc
async function kiemTrang(page, the) {
  const { kiemHtml } = require("./kiem_html"), { kiemDeTrongTrang } = require(path.join(HINH, "kiem_de"));
  const { thuThap, danhGia, NGUONG } = require("./da_dang"), { thuThapNhatQuan, danhGiaNhatQuan } = require("./nhat_quan"), { thuThapPhongPhu, danhGiaPhongPhu } = require("./phong_phu"), { thuThapDeDoc, danhGiaDeDoc } = require("./de_doc");
  const ng = { ...NGUONG, ...((the && the.nguong) || {}) };   // thẻ phong cách được chỉnh ngưỡng (nới quá mặc định phải có lyDoNguong — scripts/nguong.js)
  const a = await page.evaluate(kiemHtml), b = await page.evaluate(kiemDeTrongTrang), dd = danhGia(await page.evaluate(thuThap), ng);
  const nq = danhGiaNhatQuan(await page.evaluate(thuThapNhatQuan), the), pp = danhGiaPhongPhu(await page.evaluate(thuThapPhongPhu), the, the && the.nguong), dc = danhGiaDeDoc(await page.evaluate(thuThapDeDoc), the, the && the.nguong);
  return { loi: [...a, ...b, ...dd.loi, ...nq.loi, ...pp.loi, ...dc.loi], dd, pp, dc };
}

// kiểm chữ (không cần trình duyệt): ghi <tên>_lop/chu.md (chữ, mô tả hình, lời nói, ước thời lượng — cho thẩm định / biên tập / diễn tập),
// trích nguyên văn đối chiếu noi-dung.md, tiêu đề khớp kich-ban.md, ngưỡng nới quá mặc định
function kiemChu(dir, work, the) {
  const { docChu, vietChu } = require("./chu_slide"), ds = docChu(dir), fChu = path.join(work, "chu.md"); fs.writeFileSync(fChu, vietChu(ds));
  const doc = (f) => (fs.existsSync(path.join(dir, f)) ? fs.readFileSync(path.join(dir, f), "utf8") : null);
  const tr = require("./trich_nguyen_van").kiemTrich(ds, doc("noi-dung.md")), kb = require("./kich_ban_khop").kiemKichBan(ds, doc("kich-ban.md")), ng = require("./nguong").kiemNguong(the);
  return { loi: [...tr.loi, ...kb.loi, ...ng.loi], tom: [tr.tom, kb.tom, ...ng.ghiChu.map((g) => `ℹ ngưỡng nới có lý do — ${g}`), `✓ Chữ từng slide (thẩm định, biên tập, ước thời lượng): ${fChu}`].filter(Boolean) };
}

const docThe = (dir) => { const f = path.join(dir, "thiet-ke", "phong-cach.json"); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null; };
const anhCuaDeck = (dir, html) => [...new Set([...html.matchAll(/<img\b[^>]*\bdata-l\b[^>]*>/g)].map((m) => (m[0].match(/\bsrc="([^"]+)"/) || [])[1]).filter(Boolean))]
  .filter((s) => !/^(data:|https?:)/.test(s) && fs.existsSync(path.join(dir, s.split("?")[0])));

// --nhanh: chỉ kiểm HTML + chữ (không dựng PPTX, không chụp ảnh, không tờ soát) — dùng cho vòng sửa; dựng đủ khi chốt
async function dungNhanh(dir, { ten, nhap = false } = {}) {
  dir = path.resolve(dir); ten = ten || path.basename(dir);
  const work = path.join(dir, ten + "_lop"); fs.mkdirSync(work, { recursive: true });
  const { files, html } = ghepHtml(dir), htmlPath = path.join(work, "deck.html"); fs.writeFileSync(htmlPath, html);
  const the = docThe(dir), { chromium } = require("playwright");
  const browser = await (process.env.PW_CHROMIUM ? chromium.launch({ executablePath: process.env.PW_CHROMIUM }) : chromium.launch().catch(() => chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })));
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(url(htmlPath), { waitUntil: "load" }); await page.evaluate(() => document.fonts.ready); await page.evaluate(() => window.hinhSanSang || null);
  const kt = await kiemTrang(page, the); await browser.close();
  const kc = kiemChu(dir, work, the), loi = [...kt.loi, ...require("./kiem_phong_cach").kiemPhongCach(dir, anhCuaDeck(dir, html)), ...kc.loi];
  console.log(`· --nhanh: ${files.length} file slide, chỉ kiểm HTML + chữ (không dựng PPTX — dựng đủ trước khi duyệt)`);
  for (const t of [kt.dd && kt.dd.bang, kt.pp && kt.pp.tom, kt.dc && kt.dc.tom, ...kc.tom]) if (t) console.log(t);
  if (loi.length) { console.log(`⚠ ${loi.length} lỗi:\n  ${loi.join("\n  ")}`); if (!nhap) process.exitCode = 1; }
  else console.log("✓ Không còn lỗi máy bắt được ở phần HTML + chữ — dựng đủ (bỏ --nhanh) để soát PPTX và ảnh");
  return { loi, htmlPath };
}

async function dung(dir, { ten, soat = true, nhap = false } = {}) {
  dir = path.resolve(dir); ten = ten || path.basename(dir);
  const outPath = path.join(dir, ten + ".pptx"), work = path.join(dir, ten + "_lop");
  fs.rmSync(work, { recursive: true, force: true }); fs.mkdirSync(work, { recursive: true });
  const { files, html } = ghepHtml(dir), htmlPath = path.join(work, "deck.html"); fs.writeFileSync(htmlPath, html);
  console.log(`· ${files.length} file slide → ${htmlPath}`);
  const loi = [], the = docThe(dir); let dd = null, pp = null, dc = null;
  const truoc = async (page) => { const kt = await kiemTrang(page, the); ({ dd, pp, dc } = kt); return kt.loi; };
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
  const kc = kiemChu(dir, work, the); loi.push(...kc.loi);
  if (ba.anh) console.log(`✓ Bảng xem thử asset (${ba.srcs.length} hình — soát cùng một phong cách): ${ba.anh}`);
  if (dd) console.log(dd.bang);
  if (pp && pp.tom) console.log(pp.tom);
  if (dc && dc.tom) console.log(dc.tom);
  for (const t of kc.tom) console.log(t);
  console.log(`✓ ${res.slides} slide → ${outPath} · ${res.text} hộp chữ · ${res.pics} lớp ảnh · ${res.fx} hiệu ứng · ${res.morph} Morph`);
  console.log(`✓ Ảnh tổng (xem bằng mắt trước khi giao): ${tong.join(", ")}`);
  if (soat) console.log(`✓ Tờ soát HTML ↔ PPTX: ${path.join(work, "soat-*.jpg")}`);
  if (loi.length) { console.log(`⚠ ${loi.length} lỗi:\n  ${loi.join("\n  ")}`); if (!nhap) process.exitCode = 1; }
  else console.log("✓ Không còn lỗi máy bắt được — còn phải soát bằng mắt và qua người duyệt độc lập (references/soat.md)");
  return { ...res, loi, outPath, work, htmlPath, tong, daDang: dd, bangAsset: ba.anh };
}

module.exports = { dung, dungNhanh, ghepHtml, kiemChu };
if (require.main === module) {
  const a = process.argv.slice(2), f = new Set(a.filter((x) => x.startsWith("--"))), pos = a.filter((x) => !x.startsWith("--"));
  if (!pos.length) { console.error("Dùng: node scripts/dung.js <thư_mục_bài> [--ten=<tên>] [--nhanh] [--khong-soat] [--nhap]"); process.exit(2); }
  const ten = (a.find((x) => x.startsWith("--ten=")) || "").slice(6) || undefined;
  (f.has("--nhanh") ? dungNhanh(pos[0], { ten, nhap: f.has("--nhap") }) : dung(pos[0], { ten, soat: !f.has("--khong-soat"), nhap: f.has("--nhap") })).catch((e) => { console.error("✗ " + (e.message || e)); process.exit(e.code || 2); });
}
