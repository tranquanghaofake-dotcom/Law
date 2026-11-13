#!/usr/bin/env node
// TẦNG HÌNH ẢNH — dựng deck.json thành FILE POWERPOINT THẬT: chữ sửa được, hình là lớp ảnh, hiệu ứng và Morph gốc của PowerPoint, font nhúng sẵn.
//
//   node hinh/dung.js <deck.json> [out.pptx] [--mau=son|luc|lam|nau] [--chuyen=morph|fade] [--soat] [--strict] [--khong-nhung-font] [--html]
//   node hinh/dung.js <deck.json> --titles     chỉ in mạch tiêu đề (đọc liền như một đoạn văn) — soát storyboard trước khi dựng
//
// Đường đi:  deck.json ──(bộ mẫu: stage/templates.js + hinh/canh.js)──► <tên>_lop/deck.html ──(hinh/build.js)──► <tên>.pptx
//   · 65 type của deck.json lấy ở bộ mẫu stage/templates.js; hinh/tu_gan.js tự biến từng khối thành hộp chữ / lớp ảnh có hiệu ứng.
//   · type là "cảnh" (mở sách, soi điều luật, cột ô lịch, dải ngày, trắc nghiệm bấm được, mục lục ảnh) lấy ở hinh/canh.js.
// Tuỳ chọn trong deck.json: meta.hinh = { "mau": "son", "chuyen": "morph", "nhip": 110 } (nhip = ms giữa hai khối vào kế tiếp).
// --soat  dựng lại qua LibreOffice, ghép tờ soát trái HTML · phải PPTX.   --html  chỉ sinh deck.html (không cần trình duyệt).
// Trước khi dựng: hinh/kiem_noi_dung.js — cấu trúc deck (lỗi → dừng mã 2), giới hạn chữ, ảnh / ghi công, ghi chú, thời lượng, dàn ý, Bước 0.
// --strict  dừng (mã 3) khi còn cảnh báo nội dung (⚠), hoặc deck dùng nền chung mà prep.json chưa ghi người dùng đồng ý (chapNhanNenChung — lỗi L10).
// Sau khi dựng: <tên>_ghi-cong.md cạnh .pptx (ảnh CC BY / BY-SA, icon Font Awesome) để dán vào bản Word.
const fs = require("fs"), path = require("path"), { pathToFileURL } = require("url");
const { render, plain, TYPES } = require("../stage/templates");
const { doiMau, doiMauBang } = require("./bang_mau");
const DA = require("./da");   // da theo môn: chất liệu của môn phủ mọi type thường (spec: một tầng hình ảnh, 11/2026)
const { kiemDeck } = require("./kiem");
const KND = require("./kiem_noi_dung");
let canh = { TYPES: [], render: null, css: "", script: "" };
const bc = require("./bang_chung");
const qt = require("./hoi_nghi");   // bộ hình "bàn hội nghị quốc tế" (Công pháp quốc tế)
const bh = require("./so_bhxh");    // bộ hình "bàn hồ sơ BHXH" (bảo hiểm xã hội) — máy quay trên mặt bàn
try { canh = require("./canh"); } catch (e) { if (e.code !== "MODULE_NOT_FOUND" || !/canh/.test(e.message)) throw e; }

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** deck (đối tượng) → { html, generic, notes, n }. deckDir để tìm ảnh; mau, chuyen ghi đè meta.hinh. */
// Hình dán: kho gộp hinh/emoji.json (tên → SVG; một file thay cho 90 file lẻ vì claude.ai chỉ nhận zip skill tối đa 200 file).
// Hình thêm của người dùng đặt lẻ ở hinh/emoji/<tên>.svg; trùng tên thì kho gộp thắng.
let _khoEmoji = null;
const khoEmoji = () => _khoEmoji || (_khoEmoji = fs.existsSync(path.join(__dirname, "emoji.json")) ? JSON.parse(fs.readFileSync(path.join(__dirname, "emoji.json"), "utf8")) : {});
// Hình dán cho bìa / mở bài / chuyển chương / cảm ơn (các type thường vốn không có hình): `emoji`, `emoji2`, tuỳ chọn `emojiPos` {s,l,t,r}.
const DECO = { cover: [{ s: 520, l: 1230, t: 190, r: 6 }, { s: 250, l: 1130, t: 640, r: -9 }], statement: [{ s: 300, l: 1500, t: 90, r: 7 }],
  section: [{ s: 300, l: 1050, t: 560, r: -8 }], end: [{ s: 360, l: 1440, t: 100, r: 8 }, { s: 230, l: 1130, t: 720, r: -8 }] };
// Tên Morph hd-<hình> như cảnh (hinh/canh.js): cùng hình ở slide kề (picks → section) thì bay sang, đích Morph không có hiệu ứng vào (prev / now).
// Không ghi emojiPos → data-tu-dat: hinh.js (hinhDatHinhDan) dời hình khỏi chữ sau khi font nạp (mục E, N7 — từng đè dấu hỏi của tiêu đề 2 dòng).
const decoGan = (s, ctx, i, html, prev = new Set(), now = new Set()) => { const P = DECO[s.type]; if (!P) return html;
  const g = [s.emoji, s.emoji2].map((n, k) => { const p = (k === 0 && s.emojiPos) || P[k]; if (!n || !p || !ctx.hasEmoji(n)) return "";
    const noi = prev.has(n); now.add(n);
    return `<div class="emo" data-l="deco-${i}-${k}" data-m="hd-${n}" data-pad="${Math.round(p.s * 0.1 + 14)}" data-alt="Hình minh hoạ" ${noi ? "" : `data-a="pop" data-at="${300 + k * 250}"`}${k === 0 && s.emojiPos ? "" : " data-tu-dat"} style="position:absolute;left:${p.l}px;top:${p.t}px;width:${p.s}px;height:${p.s}px;rotate:${p.r}deg"><img src="${ctx.emoji(n)}" alt=""></div>`; }).join("");
  return g ? html.replace(/<\/section>\s*$/, g + "</section>") : html; };
// THEO DÕI TRƯỜNG ĐƯỢC ĐỌC KHI DỰNG: mỗi slide bọc trong Proxy ghi lại đường dẫn khoá được đọc (mảng → "[]"). Trường có trong deck.json mà
// không mẫu nào đọc = gõ sai tên, hoặc type đó không vẽ trường đó — trước đây bị bỏ âm thầm (takeaway, pin, part… — loi-da-biet F3.1)
const KHONG_XET = new Set(["covers", "basis", "scopeOk", "activitySec", "photoCredit", "photoSource", "photoLicense", "license", "source", "credit", "notes", "check"]);
function theoDoi(slides) {
  const doc = slides.map(() => new Set()), kho = new WeakMap();
  const boc = (o, j, p) => { if (!o || typeof o !== "object") return o; let m = kho.get(o); if (!m) { m = new Map(); kho.set(o, m); } if (m.has(j + p)) return m.get(j + p);
    const pr = new Proxy(o, { get(t, k, r) { const v = Reflect.get(t, k, r); if (typeof k !== "string" || (Array.isArray(t) && !/^\d+$/.test(k))) return v;
      const q = p + (Array.isArray(t) ? "[]" : (p && !p.endsWith("[]") ? "." : p ? "." : "") + k); doc[j].add(q); return boc(v, j, q); } });
    m.set(j + p, pr); return pr; };
  const chuaDoc = (raw, j) => { const out = [], di = (o, p) => { if (Array.isArray(o)) { if (o.some((x) => x && typeof x === "object")) o.forEach((x) => di(x, p + "[]")); return; }
      if (!o || typeof o !== "object") return; for (const k of Object.keys(o)) { if (!p && (KHONG_XET.has(k) || /^[_$]/.test(k))) continue; const q = p + (p ? "." : "") + k;
        if (!doc[j].has(q)) { out.push(q); continue; } di(o[k], q); } };
    di(raw, ""); return [...new Set(out)]; };
  return { slides: slides.map((s, j) => boc(s, j, "")), chuaDoc };
}
// MÉP CẮT của ảnh tách nền (cutout): mép nào còn nhiều điểm ảnh đặc chạm biên = chủ thể bị cắt ở đó (cổ tay, thân người) →
// mẫu đặt mép đó trùng mép slide (nguyen-tac-bo-cuc: "chỗ ảnh bị cắt phải trùng mép slide"). Đo trước khi dựng (sharp là hàm async).
async function tinhMepCat(deck, deckDir) {
  const out = {}, ds = [...new Set((deck.slides || []).map((s) => s && s.cutout).filter((p) => typeof p === "string"))];
  let sharp; try { sharp = require("sharp"); } catch { return out; }
  for (const p of ds) { const abs = path.resolve(deckDir, p); if (!fs.existsSync(abs)) continue;
    try { const { data, info } = await sharp(abs).ensureAlpha().raw().toBuffer({ resolveWithObject: true }); const W = info.width, H = info.height, c = info.channels, a = (x, y) => data[(y * W + x) * c + 3] > 128;
      const m = { l: 0, r: 0, t: 0, b: 0 }; for (let y = 0; y < H; y++) { if (a(0, y)) m.l++; if (a(W - 1, y)) m.r++; } for (let x = 0; x < W; x++) { if (a(x, 0)) m.t++; if (a(x, H - 1)) m.b++; }
      const f = { l: m.l / H, r: m.r / H, t: m.t / W, b: m.b / W }, k = Object.keys(f).sort((x, y) => f[y] - f[x])[0]; out[p] = f[k] > 0.08 ? k : ""; } catch { /* ảnh hỏng: để mẫu đặt mặc định */ } }
  return out;
}
function dungHtml(deck, { deckDir = process.cwd(), mau, chuyen, mepCat = {} } = {}) {
  const goc = deck.slides || []; if (!goc.length) throw new Error("deck.json không có slide nào.");
  const td = theoDoi(goc); deck = { ...deck, slides: td.slides }; const src = deck.slides;
  const H = deck.meta?.hinh || {}; chuyen = chuyen || H.chuyen || "morph";
  // da: meta.da → bộ hình bc / qt → meta.kit / meta.style cũ → đề tài khớp → meta.kind. Có da thì màu của da thay bảng màu (--mau chỉ dùng khi da = none)
  const da = DA.chonDa(deck, { bcTypes: bc.TYPES, qtTypes: qt.TYPES }), daTen = da.ten;
  mau = mau || H.mau || deck.meta?.stage?.palette || "son";
  const tomau = daTen ? doiMauBang(DA.daMau(daTen)) : doiMau(mau), here = __dirname, url = (p) => pathToFileURL(p).href;
  // ghi chú thuyết trình: slide.notes, hoặc meta.notesFile (các phần cách nhau bằng dòng ---, dòng "# tên" đầu phần bị bỏ)
  let parts = [];
  if (deck.meta?.notesFile && fs.existsSync(path.resolve(deckDir, deck.meta.notesFile))) parts = fs.readFileSync(path.resolve(deckDir, deck.meta.notesFile), "utf8").split(/^\s*---\s*$/m).map((p) => p.replace(/^\s*#.*$/m, "").trim());
  const missing = [], ctx = { mepCat: (p) => mepCat[p] || "", img: (p) => { if (!p) return ""; const abs = path.resolve(deckDir, p); if (!fs.existsSync(abs)) { missing.push(p); return ""; } return url(abs); }, emoji: (n) => (n in khoEmoji() ? "data:image/svg+xml;base64," + Buffer.from(khoEmoji()[n], "utf8").toString("base64") : url(path.join(here, "emoji", n + ".svg"))), hasEmoji: (n) => n in khoEmoji() || fs.existsSync(path.join(here, "emoji", n + ".svg")) };
  // một slide của deck.json có thể nở thành nhiều slide PowerPoint (cảnh mở sách = 8 slide tự chạy)
  const out = [], generic = [], bo = [], n = src.length, st = { prev: new Set() };
  const toc = src.findIndex((s) => s.type === "toc"), tocId = toc < 0 ? null : src[toc].id || `s${toc + 1}`;
  let sauSach = -1;                                                        // vị trí slide đầu tiên sau cảnh mở sách (cuốn sách thu về góc thành nút Mục lục)
  src.forEach((s, i) => {
    const note = s.notes || parts[i] || "";
    if (bh.TYPES.includes(s.type)) { const secs = bh.render(s, deck, ctx, { i, n, st }); secs.forEach((sec) => out.push({ ...sec, notes: note, src: i })); st.prev = new Set(); return; }
    if (qt.TYPES.includes(s.type)) { const secs = qt.render(s, deck, ctx, { i, n, st }); secs.forEach((sec) => out.push({ ...sec, notes: note, src: i })); st.prev = new Set(); return; }
    if (bc.TYPES.includes(s.type)) { const secs = bc.render(s, deck, ctx, { i, n, st }); secs.forEach((sec) => out.push({ ...sec, notes: note, src: i })); st.prev = new Set(); return; }
    if (canh.TYPES.includes(s.type)) { const secs = canh.render(s, deck, ctx, { i, n, st }); secs.forEach((sec, k) => out.push({ ...sec, html: daTen ? DA.khungSlide(sec.html, daTen) : sec.html, notes: sec.notes ?? (k === 0 ? note : ""), src: i })); if (s.type === "book") sauSach = out.length; return; }
    const prev = st.prev || new Set(); st.prev = new Set();
    const r = render(s, deck, ctx, i, n); if (r.generic) generic.push(`#${i + 1} ${s.type}`);
    // mode d / l / a: mỗi mẫu tự chọn nền (statement nhận "a"); mode khác nền mẫu chọn → nói rõ, không im lặng bỏ qua
    if (s.mode) { const nen = (r.html.match(/^<section class="s ([^"]*)"/) || [])[1] || "", muon = { d: "dark", l: "light", a: "red" }[s.mode];
      if (muon && !nen.split(/\s+/).includes(muon)) bo.push(`slide ${i + 1} (${s.type}) mode "${s.mode}"`); }
    let h = decoGan(s, ctx, i, r.html, prev, st.prev);
    if (deck.meta?.motif && !ctx.img(s.photo)) h = DA.motifSlide(h, deck.meta.motif, daTen, s.type, i);
    if (daTen) h = DA.phuSlide(h, daTen, { type: s.type, i, chu: [s.kicker, s.title, s.sub].filter(Boolean).join(" ").replace(/[[\]]/g, ""), coHinhDan: !!((s.emoji && ctx.hasEmoji(s.emoji)) || s.cutout || (s.type === "cover" && s.layout === "typo")), coAnh: !!ctx.img(s.photo), art: s.art, artCaption: s.artCaption });
    // pin: MỘT câu chính trên tờ giấy ghim (validate.js kiểm ≤ 90 ký tự, có "by" khi là câu trích); hinh.js tự tìm chỗ trống, không có chỗ → kiemTran báo
    if (s.pin != null && !["cover", "section", "end"].includes(s.type)) { const pt = typeof s.pin === "string" ? s.pin : s.pin.text || "", by = typeof s.pin === "object" ? s.pin.by : "";
      h = h.replace(/^<section class="s /, `<section class="s co-ghim `).replace(/<\/section>\s*$/, `<div class="ghim-giay" data-ghim data-in="pop" style="--i:60"><p>${esc(pt).replace(/\[([^\]]+)\]/g, "<em>$1</em>")}</p>${by ? `<small>— ${esc(by)}</small>` : ""}</div></section>`); }
    out.push({ id: s.id || `s${i + 1}`, html: h, tu: true, notes: note, src: i, trans: s.trans, dur: s.dur });
  });
  // nút Mục lục ở thanh đầu slide (khi deck có slide toc): chữ "Mục lục" + cuốn sách thu nhỏ nếu deck mở bằng cảnh book
  if (tocId) out.forEach((o, k) => { if (o.src === toc || !/class="bar"/.test(o.html)) return;
    const sach = st.book && sauSach >= 0 && k >= sauSach ? canh.miniBook(st.book, k === sauSach, tocId) : "";
    o.html = o.html.replace(/<\/section>\s*$/, `<div class="zml" data-t data-dl data-go="${esc(tocId)}">Mục lục</div>${sach}</section>`); });
  const ids = new Set();
  const body = out.map((o, k) => { let id = o.id || `s${k + 1}`; while (ids.has(id)) id += "-"; ids.add(id);
    const tr = o.trans || (k === 0 ? "fade" : chuyen), at = [`data-id="${esc(id)}"`, `data-trans="${tr}"`, `data-dur="${o.dur || (tr === "morph" ? 700 : 500)}"`, o.auto != null ? `data-auto="${o.auto}"` : "", o.cam ? `data-cam="${esc(o.cam)}"` : "", o.noclick ? "data-noclick" : "", o.tu ? "data-tu" : "", o.notes ? `data-notes="${esc(o.notes)}"` : ""].filter(Boolean).join(" ");
    return o.html.replace(/^<section /, `<section ${at} `); }).join("\n");
  const css = fs.readFileSync(path.join(here, "..", "stage", "stage.css"), "utf8");
  const html = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><title>${esc(deck.meta?.title || "deck")}</title>
<link rel="stylesheet" href="${url(path.join(here, "hinh.css"))}">
<style>
${tomau(css)}
/* bản PowerPoint: bỏ lớp hạt in phủ toàn slide (lớp ảnh và nền phải cùng chất), bỏ chế độ trình chiếu trong trình duyệt */
.s::after { display: none !important; }
${tomau((canh.css || "") + (bc.css || "") + (qt.css || "") + (bh.css || ""))}
${daTen ? DA.daCss(daTen) : ""}
</style></head>
<body>
${tomau(body)}
<script src="${url(path.join(here, "hinh.js"))}"></script>
<script src="${url(path.join(here, "tu_gan.js"))}"></script>
<script>
${canh.script || ""}
hinhKhiSanSang(() => document.querySelectorAll("section.s").forEach((S) => hinhDatHinhDan(S)));
hinhKhiSanSang(() => document.querySelectorAll("section.s[data-tu]").forEach((S) => hinhDatGiayGhim(S)));
hinhKhiSanSang(() => document.querySelectorAll("section.s[data-tu]").forEach((S) => hinhDatVatDa(S)));
hinhKhiSanSang(() => document.querySelectorAll("section.s[data-tu]").forEach((S) => hinhTuGan(S, ${JSON.stringify({ nhip: +H.nhip || 110, fx: daTen ? DA.CHUYEN[DA.DA[daTen].chuyen] : null })})));
hinhKhiSanSang(() => hinhCanLeQuangHoc());
</script>
</body></html>`;
  const khongDoc = goc.map((sl, j) => ({ j, type: sl.type, k: td.chuaDoc(sl, j) })).filter((x) => x.k.length);
  return { html, generic, missing, n: out.length, mau: daTen ? `da ${daTen}` : mau, chuyen, da, boMode: bo, khongDoc };
}

// tự kiểm trong trang: chữ tràn khỏi slide, khối tràn đáy — báo để sửa deck.json (cắt chữ, tách slide), không âm thầm cắt
const kiemTranCu = (page) => page.evaluate(() => [...document.querySelectorAll("section.s[data-tu]")].map((s) => {
  const R = s.getBoundingClientRect(); let worst = 0, who = "", con = null;
  for (const el of s.querySelectorAll(".body, .h, .note, .an, .cl ul, .cover .mid")) {
    const r = el.getBoundingClientRect(); let inner = 0, ke = null;   // nội dung bên trong: đo hộp các khối con (không dùng scrollHeight — chữ Anton cỡ lớn có vùng nét cao hơn dòng)
    if (!el.classList.contains("h")) for (const c of el.querySelectorAll("*")) { if (c.closest("svg") || getComputedStyle(c).display === "inline") continue; const q = c.getBoundingClientRect(); const v = Math.max(q.bottom - r.bottom, r.top - q.top); if (q.height && v > inner) { inner = v; ke = c; } }
    const d = Math.max(r.bottom - (R.bottom - 30), r.right - (R.right - 40), inner);
    if (d > worst) { worst = d; who = el.className; con = d === inner ? ke : null; }
  }
  return worst > 6 ? `slide "${(s.dataset.title || s.dataset.type || "").slice(0, 50)}" (${s.dataset.type}) tràn ${Math.round(worst)} px ở .${who.split(" ")[0]}${con ? ` — khối gây tràn: ${con.tagName.toLowerCase()}${[...con.classList].filter((k) => k !== "x").slice(0, 1).map((k) => "." + k).join("")} "${(con.textContent || "").trim().replace(/\s+/g, " ").slice(0, 30)}"` : ""} — rút chữ hoặc tách slide trong deck.json` : null;
}).filter(Boolean));
// lawquote: nét bút vàng chỉ phủ được cụm nhấn nằm trọn một dòng; kiem_de: chữ bị lớp ảnh đè, hai hộp chữ đè nhau (mục E, N5)
const { kiemDeTrongTrang } = require("./kiem_de");
const kiemGhim = (page) => page.evaluate(() => [...document.querySelectorAll(".ghim-giay[data-khong-cho]")].map((g) => `slide "${((g.closest("section.s") || {}).dataset || {}).title || "?"}": tờ giấy ghim (pin) không có chỗ trống — đã ẩn; rút nội dung slide, rút câu pin, hoặc chuyển câu đó vào takeaway / notes`));
const kiemTran = async (page) => [...(await kiemTranCu(page)), ...(await kiemGhim(page)), ...(await page.evaluate(kiemDeTrongTrang)), ...(await page.evaluate(() => [...document.querySelectorAll(".paper .pq b")].filter((b) => b.getClientRects().length > 1).map((b) => `slide "${((b.closest("section.s") || {}).dataset || {}).title || "lawquote"}" (lawquote): cụm nhấn [ ] bị xuống dòng — nét bút chỉ phủ dòng đầu; rút ngắn cụm hoặc đặt ở cuối câu`)))];

async function dung({ deckPath, outPath, mau, chuyen, soat = false, nhungFont = true, htmlOnly = false, strict = false, titles = false }) {
  deckPath = path.resolve(deckPath); const deckDir = path.dirname(deckPath), name = path.basename(deckPath, ".json");
  outPath = path.resolve(outPath || path.join(deckDir, name + ".pptx"));
  let deck, metaDoc = new Set(); try { deck = JSON.parse(fs.readFileSync(deckPath, "utf8")); }
  catch (e) { const er = new Error(e.code === "ENOENT" ? `Không tìm thấy file deck: ${deckPath}` : `Không đọc được ${deckPath} (JSON sai cú pháp?): ${e.message}`); er.code = 2; throw er; }
  if (titles) { console.log(KND.machTieuDe(deck)); return { titles: true }; }
  const metaGoc = deck.meta && typeof deck.meta === "object" ? deck.meta : null;
  if (metaGoc) deck = { ...deck, meta: new Proxy(metaGoc, { get(t, k, r) { if (typeof k === "string") metaDoc.add(k); return Reflect.get(t, k, r); } }) };   // theo dõi khoá meta được đọc (kiểm + dựng)
  // kiểm nội dung (chuyển từ tầng Office cũ): lỗi cấu trúc / ảnh không có → dừng trước khi dựng
  const nd = await KND.kiemNoiDung(deck, { deckDir, extraTypes: [...canh.TYPES, ...bc.TYPES, ...qt.TYPES, ...bh.TYPES] });
  if (nd.errors.length) { const e = new Error(`deck.json có ${nd.errors.length} lỗi, chưa dựng:\n  - ${nd.errors.join("\n  - ")}`); e.code = 2; throw e; }
  const r = dungHtml(deck, { deckDir, mau, chuyen, mepCat: await tinhMepCat(deck, deckDir) });
  console.log(`✓ ${deck.slides.length} slide trong deck.json → ${r.n} slide PowerPoint · ${r.da.ten ? `da "${r.da.ten}" (${DA.DA[r.da.ten].mon}) — ${r.da.lyDo}` : `nền chung, bảng màu ${r.mau}`} · chuyển cảnh ${r.chuyen}`);
  if (r.da.loi) { const e = new Error(r.da.lyDo); e.code = 2; throw e; }
  if (r.da.goiY) console.log(`ℹ chưa ghi meta.da — tự chọn da "${r.da.ten}" theo đề tài; ghi "meta": { "da": "${r.da.ten}" } để cố định`);
  const kiem = [...kiemDeck(deck, { deckDir }), ...require("./kiem_tang").kiemTang(deck)]; for (const m of kiem) console.log(m);
  if (r.khongDoc.length) console.log(`ℹ Trường có trong deck.json nhưng không mẫu nào đọc khi dựng (gõ sai tên, hoặc type đó không vẽ trường này):\n  ${r.khongDoc.slice(0, 12).map((x) => `slide ${x.j + 1} (${x.type}): ${x.k.join(", ")}`).join("\n  ")}${r.khongDoc.length > 12 ? `\n  … và ${r.khongDoc.length - 12} slide nữa` : ""}`);
  if (r.boMode.length) console.log(`ℹ "mode" bị bỏ qua ở ${r.boMode.join(", ")} — ở tầng hình ảnh mỗi type tự chọn nền (chỉ statement nhận "a"); cần nền màu nhấn cho bước ngoặt thì dùng statement / hero / headline, hoặc bỏ "mode"`);
  if (nd.limits.length) console.warn("⚠ Vượt giới hạn ký tự (rút gọn để tránh tràn):\n  " + nd.limits.join("\n  "));
  if (nd.warnings.length) console.warn("⚠ Cảnh báo nội dung / cấu trúc:\n  " + nd.warnings.join("\n  "));
  if (nd.hints.length) console.log("ℹ Gợi ý nội dung (không chặn --strict):\n  " + nd.hints.join("\n  "));
  for (const m of nd.info) console.log(m);
  const tong = nd.limits.length + nd.warnings.length + kiem.filter((m) => m.startsWith("⚠") && !m.startsWith("⚠ Nền chung")).length, buoc0 = nd.warnings.filter((w) => /^Bước 0/.test(w)).length;
  if (buoc0 && tong > buoc0) console.log(`ℹ Ngoài Bước 0 (chờ người dùng duyệt), còn ${tong - buoc0} cảnh báo chặn --strict — sửa trước khi gửi duyệt`);
  else if (buoc0 && tong === buoc0) console.log("ℹ Ngoài Bước 0 (chờ người dùng duyệt), deck đã sạch — duyệt xong là qua --strict");
  // --strict: còn cảnh báo nội dung, hoặc deck nền chung chưa được người dùng đồng ý (lỗi L10 — references/loi-da-biet-2026-11.md mục E) → không dựng
  const chan = !strict ? null : kiem.find((m) => m.startsWith("⚠ Nền chung")) || (tong ? `${tong} cảnh báo nội dung (⚠ ở trên)` : null);
  if (chan) { const e = new Error(`--strict: ${chan} — không dựng`); e.code = 3; throw e; }
  const work = path.join(path.dirname(outPath), path.basename(outPath, ".pptx") + "_lop");
  fs.rmSync(work, { recursive: true, force: true }); fs.mkdirSync(work, { recursive: true });
  const htmlPath = path.join(work, "deck.html"); fs.writeFileSync(htmlPath, r.html);
  if (r.generic.length) console.log(`ℹ ${r.generic.length} slide dùng mẫu chung vì type chưa có mẫu riêng: ${r.generic.join(", ")}. Có mẫu: ${[...TYPES, ...canh.TYPES].join(", ")}.`);
  for (const p of new Set(r.missing)) console.warn(`⚠ không thấy ảnh ${p} — dựng không ảnh`);
  if (htmlOnly) { console.log(`✓ ${htmlPath}`); return { ...r, htmlPath }; }
  const { build } = require("./build");
  const res = await build({ htmlPath, outPath, soat, nhungFont, giuLop: true, truoc: kiemTran });
  const gc = KND.ghiFileGhiCong(outPath, nd.credits, nd.icons);
  if (gc) console.log(`ℹ Ghi công ảnh / icon (dán vào bản Word, slide không in nguồn): ${gc}`);
  // --soat tự dựng ảnh "nhìn mờ" (xoá chữ + làm mờ) — trước đây là bước tay, người làm chạy rồi bỏ qua (mục E, N3)
  if (soat) { const nm = require("child_process").spawnSync("python3", [path.join(__dirname, "..", "scripts", "nhin_mo.py"), outPath], { encoding: "utf8" });
    const anh = (nm.stdout || "").trim().split("\n").pop();
    console.log(nm.status === 0 && anh ? `✓ Nhìn mờ: ${anh} — mở xem: che chữ đi có đoán được đề tài không? Không → chưa giao` : `ℹ không dựng được ảnh nhìn mờ (scripts/nhin_mo.py): ${(nm.stderr || "").trim().split("\n").pop() || "?"}`);
    // soát chi tiết bằng máy (nguyên tắc "mỗi chi tiết một lý do"): chữ gần thẳng hàng mà không thẳng, chữ thiếu tương phản trên nền thật
    try { const kq = await require("../scripts/soat_chi_tiet").soat(htmlPath), dong = kq.flatMap((s) => [...s.lech.map((m) => `slide ${s.slide}: ↔ ${m}`), ...s.tuongPhan.map((m) => `slide ${s.slide}: ◐ ${m}`), ...(s.moCoi || []).map((m) => `slide ${s.slide}: ¶ ${m}`), ...(s.cat || []).map((m) => `slide ${s.slide}: ✂ ${m}`)]);
      if (!dong.length) console.log("✓ Soát chi tiết: chữ thẳng hàng (không lệch 4–10 px), tương phản đạt WCAG trên nền thật, không dòng mồ côi, không nét vẽ cắt qua chữ");
      else { console.log(`ℹ Soát chi tiết: ${dong.length} chỗ (scripts/soat_chi_tiet.js — ↔ lệch 4–10 px: canh lại cho thẳng; ◐ tương phản: đậm chữ hoặc làm yên nền sau chữ; ¶ dòng mồ côi: sửa câu hoặc bề rộng hộp; ✂ nét vẽ cắt qua chữ: dời chữ hoặc dời nét)`); for (const m of dong.slice(0, 15)) console.log(`  ${m}`); if (dong.length > 15) console.log(`  … và ${dong.length - 15} chỗ nữa`); } }
    catch (e) { console.log(`ℹ không chạy được soát chi tiết: ${String(e.message || e).split("\n")[0]}`); } }
  // khoá meta không bước nào đọc (kiểm, dựng, đóng gói PPTX): gõ sai tên hoặc tính năng không có ở tầng hình ảnh
  const metaBo = metaGoc ? Object.keys(metaGoc).filter((k) => !metaDoc.has(k) && !["author", "$schema", "comment", "ghiChu", "ghichu", "note"].includes(k) && !/^[_$]/.test(k)) : [];
  if (metaBo.length) console.log(`ℹ meta không bước nào đọc: ${metaBo.join(", ")} — gõ sai tên, hoặc tính năng không có ở tầng hình ảnh (references/layouts.md)`);
  return { ...r, ...res, htmlPath, outPath, metaBo };
}

module.exports = { dung, dungHtml, kiemTran, tinhMepCat };
if (require.main === module) {
  const args = process.argv.slice(2), flags = args.filter((a) => a.startsWith("--")), pos = args.filter((a) => !a.startsWith("--")), opt = (k) => (flags.find((x) => x.startsWith(`--${k}=`)) || "").slice(k.length + 3) || undefined;
  if (!pos[0]) { console.error("Dùng: node hinh/dung.js <deck.json> [out.pptx] [--mau=son|luc|lam|nau] [--chuyen=morph|fade] [--soat] [--strict] [--khong-nhung-font] [--html]\n      node hinh/dung.js <deck.json> --titles"); process.exit(2); }
  dung({ deckPath: pos[0], outPath: pos[1], mau: opt("mau"), chuyen: opt("chuyen"), soat: flags.includes("--soat"), nhungFont: !flags.includes("--khong-nhung-font"), htmlOnly: flags.includes("--html"), strict: flags.includes("--strict"), titles: flags.includes("--titles") })
    .then((r) => { if (r.warn && r.warn.some((w) => /tràn|đè/.test(w))) process.exitCode = 1; })
    .catch((e) => { console.error("✗ " + (e.code === 2 || e.code === 3 ? e.message : e.stack || e.message)); process.exit(e.code === 2 || e.code === 3 ? e.code : 1); });
}
