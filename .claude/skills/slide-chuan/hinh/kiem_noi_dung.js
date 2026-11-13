// Kiểm NỘI DUNG deck.json trước khi dựng — chuyển từ engine/build.js của tầng Office cũ (spec: một tầng hình ảnh, 11/2026).
//   lỗi    (✗, dừng mã 2): sai cấu trúc / kiểu / trường bắt buộc (engine/validate.js), ảnh không tìm thấy
//   cảnh báo (⚠, --strict dừng): giới hạn ký tự (engine/limits.js), ảnh nhỏ, thiếu ghi công, nhiều ảnh cùng một bài nguồn,
//            ghi chú thiếu, dàn ý chưa phủ (meta.outline), số slide / ghi chú lệch thời lượng (meta.minutes), Bước 0 (prep.json)
//   gợi ý  (ℹ, không chặn)
// Kiểm GIAO DIỆN (tràn, đè, lệch PPTX so với HTML) nằm ở hinh/dung.js (kiemTran) và hinh/build.js — không ở đây.
const fs = require("fs"), path = require("path");
const { validate } = require("../engine/validate");
const LIMITS = require("../engine/limits");

const bo = (t) => String(t ?? "").replace(/[\[\]]/g, "");

/** lớp 1: giới hạn ký tự từng trường (không tính dấu [ ]) — số = độ dài tối đa, đối tượng = luật cho phần tử con. */
function kiemGioiHan(slides) {
  const warn = [], len = (v) => bo(v).length;
  slides.forEach((sl, i) => {
    const lim = LIMITS[sl && sl.type]; if (!lim) return;
    const walk = (obj, rule, p) => { for (const [k, v] of Object.entries(rule)) {
      const val = obj && obj[k]; if (val == null) continue;
      if (typeof v === "number") { if (Array.isArray(val)) val.forEach((x, j) => (Array.isArray(x) ? x : [x]).forEach((y, q) => typeof y === "string" && len(y) > v && warn.push(`Slide ${i + 1} ${p}${k}[${j}]${Array.isArray(x) ? `[${q}]` : ""}: ${len(y)}/${v} ký tự`)));
        else if (len(val) > v) warn.push(`Slide ${i + 1} ${p}${k}: ${len(val)}/${v} ký tự`); }
      else if (Array.isArray(val)) val.forEach((x, j) => walk(x, v, `${p}${k}[${j}].`));
      else walk(val, v, `${p}${k}.`); } };
    walk(sl, lim, "");
  });
  return warn;
}

/** ghi chú từng slide: slide.notes, hoặc phần thứ i của meta.notesFile (cách nhau bằng dòng ---, dòng "# tên" đầu phần bị bỏ) — cùng cách đọc với dungHtml. */
function docGhiChu(deck, deckDir) {
  const f = deck.meta?.notesFile && path.resolve(deckDir, deck.meta.notesFile);
  const parts = f && fs.existsSync(f) ? fs.readFileSync(f, "utf8").split(/^\s*---\s*$/m).map((p) => p.replace(/^\s*#.*$/m, "").trim()) : [];
  if (parts.length > 1 && !parts[parts.length - 1]) parts.pop();
  return { parts, notes: (deck.slides || []).map((s, i) => String((s && s.notes) || parts[i] || "").trim()), file: f, coFile: !!(f && fs.existsSync(f)) };
}

/** mọi ảnh của một slide: { photo, photoCredit, photoSource, _cut } */
const anhCua = (sl) => [sl.cutout ? { photo: sl.cutout, photoCredit: sl.photoCredit, photoSource: sl.photoSource, _cut: true } : null, sl.photo ? sl : null,
  ...(Array.isArray(sl.photos) ? sl.photos : []), ...(Array.isArray(sl.items) ? sl.items.filter((x) => x && x.photo) : []),
  sl.type === "beforeafter" ? sl.before : null, sl.type === "beforeafter" ? sl.after : null].filter((x) => x && x.photo);

/** thông tin ghi công (bắt buộc với CC BY / BY-SA): tác giả · giấy phép · nguồn — không in lên slide, ghi ra *_ghi-cong.md để dán vào bản Word. */
function ghiCongAnh(ph, PHOTOS) {
  if (ph.photoCredit) return ph.photoCredit;
  if (ph.photoSource) { let host = String(ph.photoSource); try { host = new URL(ph.photoSource).hostname.replace(/^www\./, ""); } catch { /* không phải URL */ } return `Nguồn ảnh: ${host}`; }
  const m = PHOTOS[path.basename(String(ph.photo))]; if (!m) return null;
  return `Ảnh: ${String(m.creator).slice(0, 40)} · ${m.license}${m.license_version && !/\d/.test(m.license) ? " " + m.license_version : ""} · ${m.via}${m.edited ? " · đã tách nền" : ""}`;
}

// ảnh tối thiểu (px chiều ngang) theo cách ảnh chiếm slide: tràn viền có chữ lớn đè lên thì ảnh nhỏ vỡ hạt khi chiếu
const rongToiThieu = (sl, ph) => (ph._cut ? 600 : sl.type === "cards" ? 700
  : ["gallery", "frame", "beforeafter", "mosaic", "photostats", "photostrip", "lens", "collage", "picks", "cases", "bhdo", "bhnhom", "bhvaitro", "bhrut", "bhhoi", "bhche", "bhdat"].includes(sl.type) ? 1000
  : ["bhbia", "bhket", "bhchuong"].includes(sl.type) ? 1200   // bộ BHXH: ảnh nền 1360 px nằm sau lớp phủ xanh đậm (chữ trên phần phủ)
  : (sl.type === "headline" || sl.type === "hero" || (sl.type === "cover" && sl.layout === "poster") || (sl.type === "end" && sl.style === "poster") || (sl.type === "section" && sl.photoLayout === "backdrop")) ? 2000 : 1600);

/**
 * deck → { errors, warnings, hints, info, credits, icons }. Không ném lỗi; dung.js quyết định dừng hay dựng.
 * extraTypes: kiểu của bộ cảnh / bộ hình (không có trong engine/validate.js SCHEMA).
 */
async function kiemNoiDung(deck, { deckDir = process.cwd(), extraTypes = [] } = {}) {
  const v = validate(deck, { extraTypes });
  const errors = [...v.errors], warnings = [...v.warnings], hints = [...(v.hints || [])], info = [], credits = [];
  if (errors.length) return { errors, warnings, hints, info, credits, icons: [], limits: [] };
  const meta = deck.meta || {}, slides = deck.slides;

  // ẢNH: có thật, đủ rộng, có ghi công; nhiều ảnh của CÙNG một bài nguồn → deck trông như minh hoạ một sự kiện (mỗi bài nguồn tối đa 1 ảnh)
  let PHOTOS = {}; const pj = path.join(deckDir, "images", "images.json");
  if (fs.existsSync(pj)) { try { PHOTOS = JSON.parse(fs.readFileSync(pj, "utf8")); } catch (e) { warnings.push("images/images.json hỏng: " + e.message); } }
  const POLICY = meta.imagePolicy || "classroom";   // mặc định: chỉ chiếu trên lớp (chủ dự án chọn 11/2026); đăng công khai thì "open"
  let sharp = null; try { sharp = require("sharp"); } catch { /* không có sharp: bỏ kiểm cỡ ảnh */ }
  const bySrc = {};
  for (const [i, sl] of slides.entries()) for (const ph of anhCua(sl)) {
    const f = path.resolve(deckDir, ph.photo);
    if (!fs.existsSync(f)) { errors.push(`Slide ${i + 1} (${sl.type}): photo — không tìm thấy "${ph.photo}" (đường dẫn tính từ thư mục chứa deck.json)`); continue; }
    if (sharp) { const md = await sharp(f).metadata().catch(() => ({})), minW = rongToiThieu(sl, ph);
      if ((md.width || 0) < minW) warnings.push(`Slide ${i + 1}: ảnh "${ph.photo}" chỉ rộng ${md.width || "?"}px — dưới ${minW}px sẽ vỡ hạt khi chiếu; tìm ảnh lớn hơn (scripts/find_images.py lọc ≥ 1600px)`); }
    const cr = ghiCongAnh(ph, PHOTOS), src = ph.photoSource || (PHOTOS[path.basename(String(ph.photo))] || {}).source || "";
    if (ph.photoSource && POLICY !== "classroom") warnings.push(`Slide ${i + 1}: ảnh "${ph.photo}" lấy từ web (${ph.photoSource}) không rõ giấy phép — chỉ hợp khi chiếu trên lớp (meta.imagePolicy = "classroom"); đăng công khai thì thay bằng ảnh giấy phép mở (references/image-sources.md)`);
    else if (!cr) warnings.push(`Slide ${i + 1}: ảnh "${ph.photo}" thiếu thông tin ghi công (để đưa vào bản Word) — thêm "photoSource" (trang gốc), "photoCredit", hoặc tải bằng scripts/find_images.py / fetch_image.py (tự ghi images.json)`);
    if (cr) credits.push({ slide: i + 1, text: cr, source: src });
    if (/^https?:/.test(src) && !ph._cut) (bySrc[src] = bySrc[src] || new Set()).add(i + 1);
  }
  for (const [src, ss] of Object.entries(bySrc)) if (ss.size > 1) warnings.push(`${ss.size} ảnh lấy từ CÙNG một trang nguồn (slide ${[...ss].join(", ")}: ${src.slice(0, 80)}) — mỗi bài nguồn tối đa 1 ảnh; tìm ảnh khác đúng brief của từng slide`);
  if (POLICY === "classroom" && credits.some((c) => /^Nguồn ảnh:/.test(c.text))) info.push('ℹ imagePolicy "classroom": deck có ảnh web không rõ giấy phép — CHỈ chiếu trên lớp (ngoại lệ sử dụng hợp lý cho giảng dạy), KHÔNG đăng công khai.');
  // icon Font Awesome Free (CC BY 4.0) phải ghi công; Phosphor / Lucide / Tabler thì không
  const icons = new Set(); const quet = (o) => { if (Array.isArray(o)) o.forEach(quet); else if (o && typeof o === "object") for (const [k, x] of Object.entries(o)) { if (k === "icon" && typeof x === "string" && /^Fa/.test(x)) icons.add(x); else quet(x); } };
  quet(slides);
  if (icons.size) info.push(`ℹ Icon Font Awesome Free (CC BY 4.0) đang dùng: ${[...icons].join(", ")} — ghi công ở bản Word (file *_ghi-cong.md), hoặc đổi sang Phosphor (Pi…) / Lucide (Lu…) / Tabler (Tb…) để khỏi phải ghi`);

  // GHI CHÚ THUYẾT TRÌNH và THỜI LƯỢNG (~160 tiếng/phút khi nói tiếng Việt; hoạt động trên lớp cộng riêng: activitySec, mặc định exercise 120 s, quiz 60 s)
  const gc = docGhiChu(deck, deckDir);
  if (meta.notesFile && !gc.coFile) warnings.push(`meta.notesFile: không tìm thấy file "${gc.file}" — bỏ qua ghi chú`);
  if (gc.coFile && gc.parts.length !== slides.length) warnings.push(`Ghi chú: "${meta.notesFile}" có ${gc.parts.length} phần (cách nhau bằng dòng ---) nhưng deck có ${slides.length} slide`);
  const coGhi = gc.notes.filter(Boolean).length;
  if (coGhi && coGhi < slides.length) warnings.push(`Ghi chú thuyết trình thiếu ở slide ${gc.notes.map((t, i) => (t ? null : i + 1)).filter(Boolean).join(", ")}`);
  const syl = gc.notes.reduce((a, t) => a + (t ? t.split(/\s+/).filter(Boolean).length : 0), 0);
  const actSec = slides.reduce((a, sl) => a + (!sl ? 0 : sl.activitySec != null ? +sl.activitySec || 0 : ["exercise", "bctinhhuong"].includes(sl.type) ? 120 : ["quiz", "quizgo", "bccauhoi"].includes(sl.type) && sl.reveal !== true ? 60 : 0), 0);
  const talkMin = syl / 160 + actSec / 60;
  if (meta.minutes) {   // ~40–65 giây / slide; làm tròn VÀO TRONG khoảng (13 phút: 12–19)
    const m = +meta.minutes, n = slides.length, lo = Math.ceil(m * 0.9), hi = Math.floor(m * 1.5);
    if (n < lo || n > hi) warnings.push(`meta.minutes = ${m} phút → nên có ${lo}–${hi} slide (40–65 giây/slide), deck đang có ${n} — ${n < lo ? "thiếu: nội dung bị nén, người nghe không theo kịp; tách các slide dày" : "thừa: gộp các slide cùng ý"}`);
    if (syl && Math.abs(talkMin - m) / m > 0.25) warnings.push(`Ghi chú thuyết trình + hoạt động ~${Math.round(talkMin)} phút nhưng meta.minutes = ${m} — viết lại ghi chú cho khớp thời lượng (±25%)`);
  }
  if (syl) info.push(`ℹ Thời lượng ước tính: ~${Math.max(1, Math.round(talkMin))} phút (nói ${syl} tiếng ≈ ${Math.round(syl / 160)} phút, ~160 tiếng/phút${actSec ? ` + hoạt động trên lớp ${Math.round(actSec / 60)} phút` : ""})`);

  // ĐỐI CHIẾU DÀN Ý: mỗi đề mục lá của tài liệu (scripts/outline.py) phải có slide trình bày ("covers") hoặc lý do bỏ (meta.skip)
  if (meta.outline) {
    let ol = meta.outline;
    if (typeof ol === "string") { const f = path.resolve(deckDir, ol); try { ol = JSON.parse(fs.readFileSync(f, "utf8")); } catch { warnings.push(`meta.outline: không đọc được "${f}" — chạy: python3 scripts/outline.py <tài liệu> ${meta.outline}`); ol = []; } }
    if (!Array.isArray(ol)) ol = [];
    const ids = new Set(ol.map((o) => String(o.id))), skip = meta.skip || {}, cov = new Map();
    slides.forEach((sl, i) => (Array.isArray(sl.covers) ? sl.covers : []).forEach((id) => { id = String(id);
      if (!ids.has(id)) warnings.push(`Slide ${i + 1}: covers "${id}" không có trong dàn ý (xem outline.json)`); (cov.get(id) || cov.set(id, []).get(id)).push(i + 1); }));
    const isChild = (a, b) => a.startsWith(b + ".") || (b.startsWith("P") && a.split(".")[0] === b.slice(1));
    const leaves = ol.filter((o) => o.words > 0 && !ol.some((p) => p !== o && isChild(String(p.id), String(o.id)) && p.words > 0));
    const covered = (id) => [...cov.keys()].some((k) => k === id || isChild(id, k)) || Object.keys(skip).some((k) => k === id || isChild(id, k));
    const miss = leaves.filter((o) => !covered(String(o.id)));
    const tot = leaves.reduce((a, o) => a + o.words, 0) || 1, missW = miss.reduce((a, o) => a + o.words, 0);
    info.push(`ℹ Đối chiếu dàn ý: ${leaves.length - miss.length}/${leaves.length} mục có slide hoặc lý do bỏ (${Math.round(100 * (1 - missW / tot))}% nội dung tài liệu)` + (Object.keys(skip).length ? `; bỏ có chủ đích: ${Object.entries(skip).map(([k, x]) => k + " (" + x + ")").join("; ")}` : ""));
    for (const o of miss) warnings.push(`Dàn ý: mục ${o.id} "${String(o.title).slice(0, 50)}" (${o.words} chữ, ${Math.round(100 * o.words / tot)}% tài liệu) chưa có slide nào — thêm "covers": ["${o.id}"] vào slide trình bày nó, hoặc ghi lý do vào meta.skip`);
    for (const o of leaves) { const k = (cov.get(String(o.id)) || []).length; if (k && o.words / tot > 0.12 && k < 2) hints.push(`Dàn ý: mục ${o.id} chiếm ${Math.round(100 * o.words / tot)}% tài liệu nhưng chỉ có 1 slide — cân nhắc tách 2 slide`); }
  }

  // BƯỚC 0 — GÓI CHUẨN BỊ (prep.json, scripts/prep.py): thiếu hoặc chưa được NGƯỜI DÙNG duyệt → cảnh báo (--strict dừng). SLIDE_CHUAN_NO_PREP=1 chỉ cho bộ test.
  if (process.env.SLIDE_CHUAN_NO_PREP !== "1") {
    const pf = path.resolve(deckDir, meta.prep || "prep.json"), K = "python3 scripts/prep.py";
    if (!fs.existsSync(pf)) warnings.push(`Bước 0: chưa có gói chuẩn bị "${path.basename(pf)}" — chạy: ${K} init <thư_mục_deck> --kind lecture|case|report, điền rồi gửi người dùng duyệt (SKILL.md bước 0)`);
    else { let pr = null; try { pr = JSON.parse(fs.readFileSync(pf, "utf8")); } catch (e) { warnings.push(`Bước 0: ${pf} hỏng (${e.message})`); }
      if (pr) {
        if (pr.approved !== true) warnings.push(`Bước 0: gói chuẩn bị chưa được người dùng duyệt — gửi bản tóm tắt (${K} summary <thư_mục_deck>), chỉ chạy "${K} approve" sau khi người dùng đồng ý`);
        if (pr.kind && meta.kind && pr.kind !== meta.kind) warnings.push(`Bước 0: prep.kind = "${pr.kind}" nhưng meta.kind = "${meta.kind}" — thống nhất loại bài`);
        if (pr.da && meta.da && pr.da !== meta.da) warnings.push(`Bước 0: prep.da = "${pr.da}" nhưng meta.da = "${meta.da}" — người dùng duyệt da theo prep.json; sửa cho khớp`);
        if (pr.minutes && meta.minutes && +pr.minutes !== +meta.minutes) warnings.push(`Bước 0: thời lượng lệch — prep.json ${pr.minutes} phút, meta.minutes ${meta.minutes} phút; sửa cho khớp (người dùng duyệt theo prep.json)`);
        (pr.sources || []).forEach((x, j) => { if (x && x.legal && !x.status) warnings.push(`Bước 0: sources[${j}] "${String(x.title || "").slice(0, 50)}" là văn bản pháp luật nhưng chưa ghi "status" (hiện hành / hết hiệu lực / dự thảo / chưa kiểm)`); });
        const thieu = ((pr.assets || {}).missing || []).filter(Boolean);
        if (thieu.length) hints.push(`Bước 0: hình chưa có (${thieu.join("; ")}) — deck này dùng cách thể hiện khác; ghi lại để bổ sung skill sau, không sửa skill giữa lúc làm deck`);
        const plan = Array.isArray(pr.plan) ? pr.plan : [];
        if (plan.length && Math.abs(plan.length - slides.length) / plan.length > 0.25) warnings.push(`Bước 0: kế hoạch duyệt ${plan.length} slide nhưng deck có ${slides.length} — lệch > 25%: cập nhật prep.json và báo người dùng`);
        if (plan.length) { const TD = Object.assign({}, ...["so_bhxh", "bang_chung", "hoi_nghi"].map((m) => { try { return require(`./${m}`).TUONG_DUONG || {}; } catch { return {}; } }));
          const khac = (q, sl) => sl.type !== q.type && !(TD[sl.type] || []).includes(q.type);   // bhbia thay cover: cùng ý định, không kể là đổi
          const diff = plan.map((q, i) => (q && q.type && slides[i] && khac(q, slides[i]) ? `${i + 1}: ${q.type}→${slides[i].type}` : null)).filter(Boolean);
          if (diff.length) hints.push(`Bước 0: ${diff.length} slide đổi type so với kế hoạch (${diff.slice(0, 6).join(", ")}${diff.length > 6 ? "…" : ""}) — nêu lý do khi báo người dùng`); }
      } }
  }
  // CĂN CỨ PHÁP LÝ: luật chính = nguồn legal đầu tiên còn hiệu lực trong prep.json (hoặc meta.law)
  let luatChinh = meta.law || ""; try { const pf = path.resolve(deckDir, meta.prep || "prep.json");
    if (!luatChinh && fs.existsSync(pf)) { const ng = (JSON.parse(fs.readFileSync(pf, "utf8")).sources || []).find((x) => x && x.legal && /^hiện hành/i.test(String(x.status || "")));
      if (ng) luatChinh = String(ng.title || "").replace(/\s*\(.*$/, "").trim(); } } catch { /* prep hỏng: đã báo ở Bước 0 */ }
  const biDanh = {}, demNam = {}; let nguonLuat = [];
  try { const pf = path.resolve(deckDir, meta.prep || "prep.json"); if (fs.existsSync(pf)) nguonLuat = (JSON.parse(fs.readFileSync(pf, "utf8")).sources || []).filter((x) => x && x.legal && /^hiện hành/i.test(String(x.status || ""))); } catch { /* đã báo */ }   // văn bản hết hiệu lực: không dịch "Luật 2014" (kho không có, chỉ sinh nhiễu "dẫn bản cũ")
  for (const t of [luatChinh, ...nguonLuat.map((x) => String(x.title || "").replace(/\s*\(.*$/, "").trim())]) { const y = (t.match(/\b\d+\/(\d{4})\/QH\d+/) || [])[1], loai = (t.match(/^(Bộ luật|Luật)/) || [])[1];
    if (y && loai) { const k = `${loai} ${y}`; if (!(k in biDanh)) { biDanh[k] = t; demNam[k] = 1; } else if (biDanh[k] !== t) demNam[k]++; } }
  for (const k of Object.keys(biDanh)) if (demNam[k] > 1) delete biDanh[k];   // hai văn bản cùng năm → viết tắt không rõ là cái nào
  const cc = kiemCanCu(deck, { luatChinh, ghiChu: gc.notes, biDanh }); warnings.push(...cc.warnings); hints.push(...cc.hints); info.push(...cc.info);
  // VỆ SINH PHÁP LÝ (quy tắc của chủ dự án: trích luật phải có số hiệu, điều / khoản, tình trạng hiệu lực; nói rõ là thông tin chung)
  { const tatCa = slides.map((sl, i) => `${JSON.stringify(sl || {})} ${gc.notes[i] || ""}`).join(" ").replace(/\\u00a0/g, " ");
    const soDieu = (tatCa.match(/Điều\s+\d+/g) || []).length;
    if (soDieu) {
      if (!/\b\d+\/\d{4}\/(?:QH|NĐ|TT|NQ|PL|UBTVQH|QĐ)[\wĐ-]*/u.test(tatCa)) warnings.push(`Deck dẫn ${soDieu} chỗ "Điều N" nhưng không chỗ nào ghi số hiệu văn bản (vd. "Luật Bảo hiểm xã hội số 41/2024/QH15") — ghi ở dòng nguồn / basis / note của slide dẫn luật đầu tiên`);
      if (!/hiệu lực|hết hiệu lực|dự thảo|đã bãi bỏ|còn áp dụng/i.test(tatCa)) hints.push("Deck dẫn luật nhưng không nói tình trạng hiệu lực ở đâu — ghi \"hiệu lực từ …\" / \"hết hiệu lực\" / \"dự thảo\" cạnh số hiệu văn bản");
      if (!/không phải (là )?tư vấn/i.test(tatCa)) hints.push("Deck dẫn luật mà chưa có câu \"thông tin pháp luật chung, không phải tư vấn\" — thêm ở basis của recap / closing, hoặc ghi chú slide cuối");
    } }
  return { errors, warnings, hints, info, credits, icons: [...icons], limits: kiemGioiHan(slides) };
}

/** CĂN CỨ PHÁP LÝ — đối chiếu mọi "điểm / khoản / Điều N <văn bản>" trên slide và trong ghi chú với kho luật
 *  (packages/content/data/laws), bằng bộ đối chiếu của skill vn-legal-exam-analysis (scripts/kiem_can_cu.py).
 *  Mỗi slide là một mục riêng; đầu mục ghi luật chính của deck (prep.json: nguồn legal đầu tiên còn hiệu lực) để "Điều 66" trần
 *  được hiểu là điều của luật đó. Dẫn ĐÍCH DANH mà điều / khoản / điểm không có → cảnh báo (--strict dừng); suy theo ngữ cảnh,
 *  nguyên văn lệch, khác bản → gợi ý. Không có bộ đối chiếu hoặc kho → chỉ ℹ. */
const CAN_CU = path.join(__dirname, "..", "..", "vn-legal-exam-analysis", "scripts", "kiem_can_cu.py");
const KHONG_CHU_CC = new Set(["photo", "photoAlt", "photoCredit", "photoSource", "photoStyle", "photoLayout", "id", "go", "next", "type", "icon", "emoji", "emoji2", "emojis", "art", "tone", "covers", "cutout", "cutoutAlt", "url", "route", "mode", "kind", "layout", "trans", "dur", "notes"]);
function kiemCanCu(deck, { luatChinh = "", ghiChu = [], biDanh = {} } = {}) {
  // biDanh: "Luật 2024" → "Luật Bảo hiểm xã hội số 41/2024/QH15" (lấy từ số hiệu các nguồn pháp luật trong prep.json) — cách viết tắt hay gặp
  // trên slide mà bộ đối chiếu không tự nhận ra, làm mọi "Điều N" theo sau bị xếp "ngoài kho"
  const reBD = Object.keys(biDanh).length ? new RegExp(`(?<![\\p{L}\\p{N}])(?:${Object.keys(biDanh).map((k) => k.replace(/\s+/g, "\\s+")).join("|")})(?![\\p{L}\\p{N}/])`, "giu") : null;
  const doiBD = (t) => (reBD ? t.replace(reBD, (m) => biDanh[m.replace(/\s+/g, " ").replace(/^l/, "L")] || m) : t);
  const warnings = [], hints = [], info = [];
  if (!fs.existsSync(CAN_CU)) { info.push("ℹ Căn cứ pháp lý: không thấy bộ đối chiếu (skill vn-legal-exam-analysis) — tự đối chiếu số điều với kho luật / vbpl.vn"); return { warnings, hints, info }; }
  const dong = [], cuaSlide = [];   // dòng thứ k của văn bản gửi đi ↔ slide nào
  const them = (t, i) => { for (const x of doiBD(String(t)).split("\n")) { dong.push(x); cuaSlide.push(i); } };
  const chu = (v, k) => (KHONG_CHU_CC.has(k) ? [] : typeof v === "string" ? [v.replace(/[\[\]]/g, "")] : Array.isArray(v) ? v.flatMap((x) => chu(x)) : v && typeof v === "object" ? Object.entries(v).flatMap(([a, b]) => chu(b, a)) : []);
  (deck.slides || []).forEach((sl, i) => {
    them(`## Slide ${i + 1}`, i); them("", i);
    // mỗi trường chữ là một đoạn, luật chính đứng ngay trước: "Luật 2014 …" ở trường này không kéo "Điều 64" ở trường khác về luật cũ
    const g = ghiChu[i] || (sl && sl.notes);
    for (const doan of [...chu(sl).filter((x) => x.trim()), ...(g ? [String(g).replace(/\s*\n\s*/g, " ")] : [])]) {
      if (luatChinh) { them(`${luatChinh}.`, i); them("", i); }
      them(doan.replace(/\s*\n\s*/g, " "), i); them("", i); }
  });
  const r = require("child_process").spawnSync("python3", ["-I", CAN_CU, "--stdin"], { input: dong.join("\n"), encoding: "utf8", timeout: 60000 });
  if (r.status !== 0 && r.status !== 1) { info.push(`ℹ Căn cứ pháp lý: bộ đối chiếu không chạy được (${(r.stderr || r.error || "").toString().trim().split("\n").pop().slice(0, 120)})`); return { warnings, hints, info }; }
  for (const l of (r.stdout || "").split("\n")) {
    const m = l.match(/^(✗|⚠) <stdin>:(\d+)\s+(.*)$/); if (m) { const sl = (cuaSlide[+m[2] - 1] ?? -1) + 1, noi = m[3].trim();
      const dongBao = `Slide ${sl}: ${m[1] === "✗" ? "căn cứ sai" : "căn cứ cần soát"} — ${noi.replace(/^([Kk])hoản/, "khoản").replace(/^([Đđ])iểm/, "điểm")}`, ds = m[1] === "✗" ? warnings : hints;
      if (!ds.includes(dongBao)) ds.push(dongBao); continue; }   // một căn cứ ở cả slide lẫn ghi chú → báo một lần
    const k = l.match(/^Kho: .*?\((\d+) văn bản\)\. (.*)$/); if (k) info.push(`ℹ Căn cứ pháp lý (kho ${k[1]} văn bản${luatChinh ? `, điều trần hiểu là của ${luatChinh}` : ""}): ${k[2]} — "khớp kho" là đúng với bản chữ trong kho, chưa phải vbpl.vn; "ngoài kho" phải tự đối chiếu`);
  }
  // "dẫn bản cũ hơn kho" lặp ở từng viện dẫn (bản án áp dụng BLDS 2005: 8 dòng) → gộp một dòng cho mỗi văn bản + năm
  const cu = {}, conLai = [];
  for (const h of hints) { const m = h.match(/^Slide (\d+): căn cứ cần soát — (?:(?:điểm|khoản|Điều)\s+[\w\s,]+?\s)?(?:Điều\s+\d+[a-zđ]?\s+)?(.+?) — dẫn bản năm (\d{4}), kho có bản (\d{4}) \(([^)]+)\)/);
    if (!m) { conLai.push(h); continue; } const k = `${m[2]}|${m[3]}|${m[4]}|${m[5]}`; (cu[k] = cu[k] || { s: new Set(), n: 0 }).s.add(+m[1]); cu[k].n++; }
  for (const [k, v] of Object.entries(cu)) { const [vb, nam, namKho, so] = k.split("|");
    conLai.push(`Slide ${[...v.s].sort((x, y) => x - y).join(", ")}: căn cứ cần soát — dẫn ${vb} bản ${nam} ở ${v.n} chỗ, kho có bản ${namKho} (${so}): đúng nếu vụ việc / bản án áp dụng luật cũ (ghi rõ trên slide), nếu không thì đổi sang bản hiện hành`); }
  return { warnings, hints: conLai, info };
}

/** --titles: "deck ma" — chỉ đọc kicker + tiêu đề từ đầu đến cuối. Đọc liền mà không thành một lập luận thì sửa storyboard trước khi tốn công dựng. */
function machTieuDe(deck) {
  const sl = deck.slides || [], out = [], warn = [], seen = {}, CHUONG = new Set(["section", "bcchuong", "qtchuong", "bhchuong"]);
  sl.forEach((d, i) => {
    const noTitle = LIMITS[d.type] && !("title" in LIMITS[d.type]), n = String(i + 1).padStart(2, "0"), k = bo(d.kicker || d.year).trim();
    const q = bo(d.quote).trim(), t = noTitle || (!d.title && q) ? (q.length > 70 ? "“" + q.slice(0, 68) + "…”" : q && "“" + q + "”") : bo(d.title || d.q || d.question || (Array.isArray(d.lines) ? d.lines.join(" ") : "")).trim();   // recap: lines là câu chốt
    if (CHUONG.has(d.type)) { out.push(`\n${n}  ── ${(d.partWord || "Phần").toUpperCase()} ${d.num ?? ""}: ${t.toUpperCase()} ──`); return; }
    out.push(`${n}  ${k ? k + " — " : ""}${t || "(không tiêu đề)"}   [${d.type}]`);
    if (!["cover", "end", "section", "quiz", "quizgo", "agenda", "toc", "picks", "book", "bigq", "bcbia", "bccamon", "bccauhoi", "qtbia", "bhbia", "bhdo", "bhba", "bhhoi", "bhghinho", "bhket"].includes(d.type) && !noTitle && !(!d.title && q)) {
      if (!t) warn.push(`Slide ${i + 1}: không có tiêu đề`);
      else if (/\?$/.test(t)) warn.push(`Slide ${i + 1}: tiêu đề là câu hỏi — viết câu trả lời, câu hỏi để ở kicker`);
      else if (t.split(/\s+/).length <= 3) warn.push(`Slide ${i + 1}: "${t}" giống nhãn hơn là câu kết luận (≤ 3 tiếng)`);
    }
    if (t && !["quiz", "quizgo"].includes(d.type)) { const key = t.toLowerCase(); if (seen[key]) warn.push(`Slide ${seen[key]} và ${i + 1}: trùng tiêu đề "${t}"`); else seen[key] = i + 1; }
  });
  return "Mạch tiêu đề (đọc liền như một đoạn văn — mỗi dòng phải nối được với dòng trước):\n" + out.join("\n")
    + (warn.length ? "\n\n⚠ Kiểm mạch:\n  " + warn.join("\n  ") : "\n\n✓ Không thấy tiêu đề dạng nhãn / câu hỏi / trùng lặp. Còn lại: tự đọc xem lập luận có liền không.");
}

/** GHI CÔNG: slide không in nguồn; CC BY / BY-SA (ảnh) và CC BY 4.0 (icon Font Awesome) vẫn bắt buộc ghi → <tên>_ghi-cong.md cạnh .pptx để dán vào bản Word. */
function ghiFileGhiCong(outPath, credits, icons) {
  if (!credits.length && !icons.length) return null;
  const L = ["# Ghi công ảnh và icon", "", "Dán vào phần tài liệu tham khảo / ghi công của bản Word đi kèm bài thuyết trình.", ""];
  if (credits.length) { L.push("## Ảnh", ""); for (const c of credits) L.push(`- Slide ${c.slide}: ${c.text}${c.source ? " — " + c.source : ""}`); L.push(""); }
  if (icons.length) L.push("## Icon", "", `- Font Awesome Free (CC BY 4.0 — https://fontawesome.com/license/free): ${icons.join(", ")}`, "");
  const f = outPath.replace(/\.pptx$/i, "") + "_ghi-cong.md"; fs.writeFileSync(f, L.join("\n")); return f;
}

module.exports = { kiemNoiDung, kiemCanCu, kiemGioiHan, machTieuDe, ghiFileGhiCong, docGhiChu, ghiCongAnh };
