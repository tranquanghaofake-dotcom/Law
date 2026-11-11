#!/usr/bin/env node
// TẦNG HÌNH ẢNH — dựng deck.json thành FILE POWERPOINT THẬT: chữ sửa được, hình là lớp ảnh, hiệu ứng và Morph gốc của PowerPoint, font nhúng sẵn.
//
//   node hinh/dung.js <deck.json> [out.pptx] [--mau=son|luc|lam|nau] [--chuyen=morph|fade] [--soat] [--khong-nhung-font] [--html]
//
// Đường đi:  deck.json ──(bộ mẫu: stage/templates.js + hinh/canh.js)──► <tên>_lop/deck.html ──(hinh/build.js)──► <tên>.pptx
//   · 65 type của deck.json lấy ở bộ mẫu stage/templates.js; hinh/tu_gan.js tự biến từng khối thành hộp chữ / lớp ảnh có hiệu ứng.
//   · type là "cảnh" (mở sách, soi điều luật, cột ô lịch, dải ngày, trắc nghiệm bấm được, mục lục ảnh) lấy ở hinh/canh.js.
// Tuỳ chọn trong deck.json: meta.hinh = { "mau": "son", "chuyen": "morph", "nhip": 110 } (nhip = ms giữa hai khối vào kế tiếp).
// --soat  dựng lại qua LibreOffice, ghép tờ soát trái HTML · phải PPTX.   --html  chỉ sinh deck.html (không cần trình duyệt).
const fs = require("fs"), path = require("path"), { pathToFileURL } = require("url");
const { render, plain, TYPES } = require("../stage/templates");
const { doiMau } = require("./bang_mau");
let canh = { TYPES: [], render: null, css: "", script: "" };
try { canh = require("./canh"); } catch (e) { if (e.code !== "MODULE_NOT_FOUND" || !/canh/.test(e.message)) throw e; }

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** deck (đối tượng) → { html, generic, notes, n }. deckDir để tìm ảnh; mau, chuyen ghi đè meta.hinh. */
// Hình dán: kho gộp hinh/emoji.json (tên → SVG; một file thay cho 90 file lẻ vì claude.ai chỉ nhận zip skill tối đa 200 file).
// Hình thêm của người dùng đặt lẻ ở hinh/emoji/<tên>.svg; trùng tên thì kho gộp thắng.
let _khoEmoji = null;
const khoEmoji = () => _khoEmoji || (_khoEmoji = fs.existsSync(path.join(__dirname, "emoji.json")) ? JSON.parse(fs.readFileSync(path.join(__dirname, "emoji.json"), "utf8")) : {});
function dungHtml(deck, { deckDir = process.cwd(), mau, chuyen } = {}) {
  const src = deck.slides || []; if (!src.length) throw new Error("deck.json không có slide nào.");
  const H = deck.meta?.hinh || {}; mau = mau || H.mau || deck.meta?.stage?.palette || "son"; chuyen = chuyen || H.chuyen || "morph";
  const tomau = doiMau(mau), here = __dirname, url = (p) => pathToFileURL(p).href;
  // ghi chú thuyết trình: slide.notes, hoặc meta.notesFile (các phần cách nhau bằng dòng ---, dòng "# tên" đầu phần bị bỏ)
  let parts = [];
  if (deck.meta?.notesFile && fs.existsSync(path.resolve(deckDir, deck.meta.notesFile))) parts = fs.readFileSync(path.resolve(deckDir, deck.meta.notesFile), "utf8").split(/^\s*---\s*$/m).map((p) => p.replace(/^\s*#.*$/m, "").trim());
  const missing = [], ctx = { img: (p) => { if (!p) return ""; const abs = path.resolve(deckDir, p); if (!fs.existsSync(abs)) { missing.push(p); return ""; } return url(abs); }, emoji: (n) => (n in khoEmoji() ? "data:image/svg+xml;base64," + Buffer.from(khoEmoji()[n], "utf8").toString("base64") : url(path.join(here, "emoji", n + ".svg"))), hasEmoji: (n) => n in khoEmoji() || fs.existsSync(path.join(here, "emoji", n + ".svg")) };
  // một slide của deck.json có thể nở thành nhiều slide PowerPoint (cảnh mở sách = 8 slide tự chạy)
  const out = [], generic = [], n = src.length, st = { prev: new Set() };
  const toc = src.findIndex((s) => s.type === "toc"), tocId = toc < 0 ? null : src[toc].id || `s${toc + 1}`;
  let sauSach = -1;                                                        // vị trí slide đầu tiên sau cảnh mở sách (cuốn sách thu về góc thành nút Mục lục)
  src.forEach((s, i) => {
    const note = s.notes || parts[i] || "";
    if (canh.TYPES.includes(s.type)) { const secs = canh.render(s, deck, ctx, { i, n, st }); secs.forEach((sec, k) => out.push({ ...sec, notes: sec.notes ?? (k === 0 ? note : ""), src: i })); if (s.type === "book") sauSach = out.length; return; }
    st.prev = new Set();
    const r = render(s, deck, ctx, i, n); if (r.generic) generic.push(`#${i + 1} ${s.type}`);
    out.push({ id: s.id || `s${i + 1}`, html: r.html, tu: true, notes: note, src: i, trans: s.trans, dur: s.dur });
  });
  // nút Mục lục ở thanh đầu slide (khi deck có slide toc): chữ "Mục lục" + cuốn sách thu nhỏ nếu deck mở bằng cảnh book
  if (tocId) out.forEach((o, k) => { if (o.src === toc || !/class="bar"/.test(o.html)) return;
    const sach = st.book && sauSach >= 0 && k >= sauSach ? canh.miniBook(st.book, k === sauSach, tocId) : "";
    o.html = o.html.replace(/<\/section>\s*$/, `<div class="zml" data-t data-go="${esc(tocId)}">Mục lục</div>${sach}</section>`); });
  const ids = new Set();
  const body = out.map((o, k) => { let id = o.id || `s${k + 1}`; while (ids.has(id)) id += "-"; ids.add(id);
    const tr = o.trans || (k === 0 ? "fade" : chuyen), at = [`data-id="${esc(id)}"`, `data-trans="${tr}"`, `data-dur="${o.dur || (tr === "morph" ? 700 : 500)}"`, o.auto != null ? `data-auto="${o.auto}"` : "", o.noclick ? "data-noclick" : "", o.tu ? "data-tu" : "", o.notes ? `data-notes="${esc(o.notes)}"` : ""].filter(Boolean).join(" ");
    return o.html.replace(/^<section /, `<section ${at} `); }).join("\n");
  const css = fs.readFileSync(path.join(here, "..", "stage", "stage.css"), "utf8");
  const html = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><title>${esc(deck.meta?.title || "deck")}</title>
<link rel="stylesheet" href="${url(path.join(here, "hinh.css"))}">
<style>
${tomau(css)}
/* bản PowerPoint: bỏ lớp hạt in phủ toàn slide (lớp ảnh và nền phải cùng chất), bỏ chế độ trình chiếu trong trình duyệt */
.s::after { display: none !important; }
${tomau(canh.css || "")}
</style></head>
<body>
${tomau(body)}
<script src="${url(path.join(here, "hinh.js"))}"></script>
<script src="${url(path.join(here, "tu_gan.js"))}"></script>
<script>
${canh.script || ""}
hinhKhiSanSang(() => document.querySelectorAll("section.s[data-tu]").forEach((S) => hinhTuGan(S, ${JSON.stringify({ nhip: +H.nhip || 110 })})));
</script>
</body></html>`;
  return { html, generic, missing, n: out.length, mau, chuyen };
}

// tự kiểm trong trang: chữ tràn khỏi slide, khối tràn đáy — báo để sửa deck.json (cắt chữ, tách slide), không âm thầm cắt
const kiemTran = (page) => page.evaluate(() => [...document.querySelectorAll("section.s[data-tu]")].map((s) => {
  const R = s.getBoundingClientRect(); let worst = 0, who = "";
  for (const el of s.querySelectorAll(".body, .h, .note, .an, .cl ul, .cover .mid")) {
    const r = el.getBoundingClientRect(); let inner = 0;   // nội dung bên trong: đo hộp các khối con (không dùng scrollHeight — chữ Anton cỡ lớn có vùng nét cao hơn dòng)
    if (!el.classList.contains("h")) for (const c of el.querySelectorAll("*")) { if (c.closest("svg") || getComputedStyle(c).display === "inline") continue; const q = c.getBoundingClientRect(); if (q.height) inner = Math.max(inner, q.bottom - r.bottom, r.top - q.top); }
    const d = Math.max(r.bottom - (R.bottom - 30), r.right - (R.right - 40), inner);
    if (d > worst) { worst = d; who = el.className; }
  }
  return worst > 6 ? `slide "${(s.dataset.title || s.dataset.type || "").slice(0, 50)}" (${s.dataset.type}) tràn ${Math.round(worst)} px ở .${who.split(" ")[0]} — rút chữ hoặc tách slide trong deck.json` : null;
}).filter(Boolean));

async function dung({ deckPath, outPath, mau, chuyen, soat = false, nhungFont = true, htmlOnly = false }) {
  deckPath = path.resolve(deckPath); const deckDir = path.dirname(deckPath), name = path.basename(deckPath, ".json");
  outPath = path.resolve(outPath || path.join(deckDir, name + ".pptx"));
  const deck = JSON.parse(fs.readFileSync(deckPath, "utf8"));
  const r = dungHtml(deck, { deckDir, mau, chuyen });
  const work = path.join(path.dirname(outPath), path.basename(outPath, ".pptx") + "_lop");
  fs.rmSync(work, { recursive: true, force: true }); fs.mkdirSync(work, { recursive: true });
  const htmlPath = path.join(work, "deck.html"); fs.writeFileSync(htmlPath, r.html);
  console.log(`✓ ${deck.slides.length} slide trong deck.json → ${r.n} slide PowerPoint · bảng màu ${r.mau} · chuyển cảnh ${r.chuyen}`);
  if (r.generic.length) console.log(`ℹ ${r.generic.length} slide dùng mẫu chung vì type chưa có mẫu riêng: ${r.generic.join(", ")}. Có mẫu: ${[...TYPES, ...canh.TYPES].join(", ")}.`);
  for (const p of new Set(r.missing)) console.warn(`⚠ không thấy ảnh ${p} — dựng không ảnh`);
  if (htmlOnly) { console.log(`✓ ${htmlPath}`); return { ...r, htmlPath }; }
  const { build } = require("./build");
  const res = await build({ htmlPath, outPath, soat, nhungFont, giuLop: true, truoc: kiemTran });
  return { ...r, ...res, htmlPath, outPath };
}

module.exports = { dung, dungHtml };
if (require.main === module) {
  const args = process.argv.slice(2), flags = args.filter((a) => a.startsWith("--")), pos = args.filter((a) => !a.startsWith("--")), opt = (k) => (flags.find((x) => x.startsWith(`--${k}=`)) || "").slice(k.length + 3) || undefined;
  if (!pos[0]) { console.error("Dùng: node hinh/dung.js <deck.json> [out.pptx] [--mau=son|luc|lam|nau] [--chuyen=morph|fade] [--soat] [--khong-nhung-font] [--html]"); process.exit(2); }
  dung({ deckPath: pos[0], outPath: pos[1], mau: opt("mau"), chuyen: opt("chuyen"), soat: flags.includes("--soat"), nhungFont: !flags.includes("--khong-nhung-font"), htmlOnly: flags.includes("--html") })
    .then((r) => { if (r.warn && r.warn.some((w) => /tràn/.test(w))) process.exitCode = 1; })
    .catch((e) => { console.error("✗ " + (e.stack || e.message)); process.exit(1); });
}
