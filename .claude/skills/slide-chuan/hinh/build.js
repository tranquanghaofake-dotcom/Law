#!/usr/bin/env node
// TẦNG HÌNH ẢNH → PPTX THẬT.
// Dựng một deck HTML (mỗi slide là <section class="s"> 1920×1080) thành file .pptx mà:
//   · mọi phần tử [data-t] là HỘP CHỮ THẬT (gõ lại được, đúng font, đúng chỗ, đúng chỗ xuống dòng);
//   · mọi phần tử [data-l] là một LỚP ẢNH riêng (di chuyển, xoay, đổi, gắn hiệu ứng được);
//   · mọi phần tử [data-w] là một CỬA SỔ SOI: ảnh của phần tử khác được phóng to và cắt theo khung cửa sổ (kính lúp, khung ngắm);
//   · phần còn lại (nền, mảng màu, hoạ tiết) là ảnh nền của slide;
//   · hiệu ứng động, Morph, tự sang slide, liên kết giữa các slide là tính năng GỐC của PowerPoint.
//
//   node hinh/build.js <deck.html> <out.pptx> [--soat] [--khong-nhung-font]
//
// Thuộc tính trên phần tử:
//   data-t            hộp chữ sửa được                     data-l="tên"      lớp ảnh
//   data-w="tên" data-of="bộ chọn CSS" data-z="1.7" data-fx data-fy
//                     cửa sổ soi: lấy ảnh của phần tử `data-of` (trong cùng slide), phóng `data-z` lần, đặt điểm (fx, fy) của phần tử đó
//                     (px, tính từ góc trên trái của nó) vào giữa cửa sổ. Cửa sổ bo tròn (border-radius 50 %) thành ảnh hình elip.
//                     Hai slide kề nhau có cửa sổ cùng tên Morph → PowerPoint chạy cả vị trí lẫn vùng cắt: nội dung trôi trong kính.
//   data-a="fx"       hiệu ứng vào: fade, rise, wipe, wipe-r, up, down, pop, slam, stamp, slide, slide-r, drop, fall, flip, grow, appear
//   data-at="ms"      thời điểm vào (tính từ lúc vào slide hoặc từ lần bấm)      data-dur="ms"   đổi độ dài hiệu ứng     data-lin   chạy đều
//   data-out="ms"     thời điểm biến mất (số đếm)                               data-click="n"  vào ở lần bấm thứ n (không ghi = tự chạy)
//   data-em="pulse|teeter" data-emat="ms"   nhấn sau khi vào (data-pulse = data-em="pulse")
//   data-mv="dx,dy,at,dur"  đi thẳng thêm (dx, dy) px, bắt đầu ở `at` ms, trong `dur` ms (đường chuyển động)
//   data-m="tên"      ghép cặp Morph với phần tử cùng tên ở slide kề            data-go="id"    bấm vào thì nhảy tới slide có data-id đó
//   data-pad="px"     nới khung chụp lớp ảnh (bóng đổ)
// Thuộc tính trên <section class="s">: data-id, data-trans="morph|fade|push|none", data-dur="ms", data-auto="ms" (tự sang slide sau), data-notes,
//   data-cam="pan:dx,dy" | "zoom:k,x,y" (máy quay khi Morph vào slide này — hinh/may_quay.js; vật mang data-sau="hệ số" để có thị sai, "0" = đứng ngoài),
//   data-noclick (bấm chuột không sang slide — chỉ đi bằng nút liên kết; dùng cho slide trắc nghiệm).
// data-prop trên một khối: chữ bên trong là đạo cụ (bìa sách, trang sách…), cố ý để làm ảnh.
// Quy ước CSS: xoay nghiêng chỉ dùng thuộc tính `rotate:` (không dùng transform: rotate). Lớp ảnh tự xoay (rotate đặt ngay trên phần tử data-l)
//   được chụp ở tư thế thẳng rồi XOAY THẬT trong PowerPoint — Morph quay nó mượt, người dùng chỉnh góc được.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const { spawnSync } = require("child_process");
const PptxGenJS = require("pptxgenjs"), JSZip = require("jszip"), fontkit = require("fontkit");
const X = require("./xml");
const MQ = require("./may_quay");

const md5 = (b) => crypto.createHash("md5").update(b).digest("hex").slice(0, 16);

const SW = 1920, SH = 1080, IN = 13.333 / SW, PT = 0.5;  // 1920 px ↔ 13,333 in ↔ 960 pt
const HOME = 200;                                           // chỗ chuẩn trên trang để chụp lớp (px): cùng nội dung chụp ở cùng chỗ thì ra cùng điểm ảnh
const EDGE = 560;                                           // lề quanh slide lúc chụp lớp: phần lớp thò ra ngoài slide tới ngần này vẫn giữ được
const FD = path.join(__dirname, "fonts");
// Mỗi độ đậm là MỘT HỌ ĐỘC LẬP trong PowerPoint (không dùng nút B) — xem hinh/tao_font.js. Trong CSS vẫn viết 'Be Vietnam Pro' + font-weight.
const FACES = [
  { face: "Anton", file: "Anton-Regular.ttf" },
  { face: "Be Vietnam Pro", file: "BeVietnamPro-Regular.ttf" },   // font-weight < 550
  { face: "Be Vietnam Dam", file: "BeVietnam-Dam.ttf" },          // 550 – 749
  { face: "Be Vietnam Nang", file: "BeVietnam-Nang.ttf" },        // ≥ 750
];
for (const f of FACES) { f.path = path.join(FD, f.file); f.font = fontkit.openSync(f.path); const U = f.font.unitsPerEm; f.asc = f.font.hhea.ascent / U; f.desc = -f.font.hhea.descent / U; }
const faceOf = (family, weight) => (/anton/i.test(family) ? FACES[0] : weight >= 750 ? FACES[3] : weight >= 550 ? FACES[2] : FACES[1]);
const SYM = "Segoe UI Symbol";                                // font ký hiệu có sẵn trên Windows: nhận các mũi tên, dấu tích, ô vuông mà font chữ không có
const hex = (c) => { const m = String(c).match(/[\d.]+/g) || [0, 0, 0]; return m.slice(0, 3).map((v) => Math.round(+v).toString(16).padStart(2, "0")).join("").toUpperCase(); };

// ── chạy trong trình duyệt: gom mọi thứ cần cho một slide ──
function collectInPage() {
  const num = (v, d = 0) => (v == null || v === "" ? d : parseFloat(v));
  const inherit = (el, k) => { const h = el.closest(`[data-${k}]`); return h ? h.getAttribute(`data-${k}`) : null; };
  const rotOf = (n) => { const ro = getComputedStyle(n).rotate; return ro && ro !== "none" ? parseFloat(ro) : 0; };
  const out = [];
  document.querySelectorAll("section.s").forEach((S, si) => {
    const R = S.getBoundingClientRect(), items = [], perLayer = new Map();
    S.querySelectorAll("[data-t], [data-l], [data-w]").forEach((el, i) => {
      const isT = el.hasAttribute("data-t"), isW = el.hasAttribute("data-w");
      if (!isW && el.closest("[data-w]")) return;                         // bản xem trước nằm trong cửa sổ soi: không phải nội dung
      const isL = el.hasAttribute("data-l");                              // vừa data-t vừa data-l: nền của nó là lớp ảnh, chữ là hộp chữ nằm trên
      const r = el.getBoundingClientRect(), lay = isT ? el.closest("[data-l]") : null;
      const own = (k) => el.getAttribute(`data-${k}`), inh = (k) => own(k) ?? (lay ? lay.getAttribute(`data-${k}`) : null);
      const mvRaw = inh("mv"), mv = mvRaw ? mvRaw.split(",").map(Number) : null;
      const an = { a: inh("a"), at: num(inh("at")), dur: inh("dur") == null ? null : num(inh("dur")), lin: own("lin") != null || (lay && lay.hasAttribute("data-lin")), out: inh("out"), click: num(inh("click")),
        em: own("em") || (el.hasAttribute("data-pulse") ? "pulse" : null), emAt: own("emat") == null ? null : num(own("emat")), mv: mv ? { dx: mv[0] / 1920, dy: mv[1] / 1080, at: mv[2] || 0, dur: mv[3] || 1000 } : null };
      let m = own("m");
      if (!m && lay && lay.getAttribute("data-m") && lay.getAttribute("data-mt") !== "0") { const k = (perLayer.get(lay) || 0) + 1; perLayer.set(lay, k); m = `${lay.getAttribute("data-m")}-chu${k}`; } // chữ trong lớp có Morph đi theo lớp
      const sauRaw = inherit(el, "sau");
      const base = { i, m, n: own("n"), go: own("go") || inherit(el, "go"), goOwn: el.hasAttribute("data-go"), an, alt: own("alt") || "", sau: sauRaw == null ? 1 : num(sauRaw, 1) };
      if (isW) {
        const src = S.querySelector(own("of")); if (!src) { console.warn("data-of không tìm thấy:", own("of")); return; }
        const q = src.getBoundingClientRect(), cs = getComputedStyle(el), key = `${si}-${i}`;
        src.setAttribute("data-wsrc", key); el.setAttribute("data-wi", key);
        items.push({ ...base, kind: "win", key, name: own("w"), x: r.left - R.left, y: r.top - R.top, w: r.width, h: r.height, sx: q.left - R.left, sy: q.top - R.top, sw: q.width, sh: q.height,
          z: num(own("z"), 1), fx: num(own("fx"), q.width / 2), fy: num(own("fy"), q.height / 2), round: /%$/.test(cs.borderTopLeftRadius) ? parseFloat(cs.borderTopLeftRadius) >= 45 : parseFloat(cs.borderTopLeftRadius) >= Math.min(r.width, r.height) * 0.45, bg: cs.backgroundColor });
        return;
      }
      if (!isT || isL) {
        const pad = num(own("pad")), key = `${si}-${i}`; el.setAttribute("data-li", key);
        // lớp tự xoay (và không nằm trong khối xoay nào): đo thêm khung ở tư thế thẳng để chụp thẳng rồi xoay thật trong PowerPoint
        let anc = 0; for (let n = el.parentElement; n && n !== S; n = n.parentElement) anc += rotOf(n);
        const rot = rotOf(el); let u = null;
        if (rot && !anc) { const keep = el.style.rotate; el.style.setProperty("rotate", "0deg", "important"); const q = el.getBoundingClientRect(); el.style.rotate = keep; if (!keep) el.style.removeProperty("rotate");
          u = { x: q.left - R.left - pad, y: q.top - R.top - pad, w: q.width + 2 * pad, h: q.height + 2 * pad, cx: r.left + r.width / 2 - R.left, cy: r.top + r.height / 2 - R.top }; }
        items.push({ ...base, m: isT ? (m ? m + "-nen" : null) : m, kind: "layer", key, x: r.left - R.left - pad, y: r.top - R.top - pad, w: r.width + 2 * pad, h: r.height + 2 * pad, rot, u, name: own("l") });
        if (!isT) return;
      }
      // góc xoay tích luỹ (chỉ tính thuộc tính `rotate`) và tâm thật của phần tử trên slide
      let ang = 0; for (let n = el; n && n !== S; n = n.parentElement) ang += rotOf(n);
      items.push({ ...base, kind: "text", cx: r.left + r.width / 2 - R.left, cy: r.top + r.height / 2 - R.top, ang, el: `${si}-${i}` });
      el.setAttribute("data-ti", `${si}-${i}`);
    });
    out.push({ id: S.getAttribute("data-id") || `s${si + 1}`, cam: S.getAttribute("data-cam"), trans: S.getAttribute("data-trans") || "fade", dur: num(S.getAttribute("data-dur"), 1000), auto: S.hasAttribute("data-auto") ? num(S.getAttribute("data-auto")) : null, noClick: S.hasAttribute("data-noclick"), notes: S.getAttribute("data-notes") || "", items, words: (() => { let w = ""; const tw = document.createTreeWalker(S, NodeFilter.SHOW_TEXT); for (let n = tw.nextNode(); n; n = tw.nextNode()) { const pe = n.parentElement; if (!pe || pe.closest("[data-prop], [data-w], script, style")) continue; const cs = getComputedStyle(pe); if (cs.display === "none" || cs.visibility === "hidden") continue; w += " " + (cs.textTransform === "uppercase" ? n.textContent.toLocaleUpperCase("vi") : n.textContent); } return w.replace(/\s+/g, " ").trim(); })() });
  });
  return out;
}
// đo chữ khi đã TẮT xoay: từng dòng, từng đoạn cùng kiểu; trả hình học của khối chữ so với phần tử
function measureTextInPage() {
  const res = {};
  document.querySelectorAll("[data-ti]").forEach((el) => {
    const E = el.getBoundingClientRect(), lines = []; let cur = null, trail = false;
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      const pe = n.parentElement; if (!pe || pe.closest("[data-t]") !== el) continue;
      const cs = getComputedStyle(pe); if (cs.display === "none" || cs.visibility === "hidden") continue;
      const st = { c: cs.color, f: cs.fontFamily, w: +cs.fontWeight || 400, s: parseFloat(cs.fontSize), i: cs.fontStyle === "italic", u: cs.textDecorationLine.includes("underline"), k: cs.textDecorationLine.includes("line-through"), ls: cs.letterSpacing === "normal" ? 0 : parseFloat(cs.letterSpacing) };
      const up = cs.textTransform === "uppercase", txt = n.textContent, re = /\S+/g; let m, first = true;
      while ((m = re.exec(txt))) {
        const rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
        const rc = rg.getClientRects()[0]; if (!rc || rc.width < 0.3) continue;
        const sp = first ? (/^\s/.test(txt) || trail) : true; first = false;
        if (!cur || rc.top > cur.bot - Math.min(rc.height, cur.bot - cur.top) * 0.4) { cur = { top: rc.top, bot: rc.bottom, left: rc.left, right: rc.right, toks: [] }; lines.push(cur); }
        cur.top = Math.min(cur.top, rc.top); cur.bot = Math.max(cur.bot, rc.bottom); cur.left = Math.min(cur.left, rc.left); cur.right = Math.max(cur.right, rc.right);
        cur.toks.push({ t: (up ? m[0].toLocaleUpperCase("vi") : m[0]).normalize("NFC"), sp: sp && cur.toks.length > 0, st, top: rc.top }); // NFC: chữ có dấu luôn là một ký tự dựng sẵn
      }
      trail = /\s$/.test(txt) || (!/\S/.test(txt) && (trail || txt.length > 0));
    }
    const cs = getComputedStyle(el);
    res[el.getAttribute("data-ti")] = { lines, ex: E.left, ey: E.top, ew: E.width, eh: E.height, align: cs.textAlign, lh: cs.lineHeight === "normal" ? null : parseFloat(cs.lineHeight), pl: parseFloat(cs.paddingLeft) || 0, pr: parseFloat(cs.paddingRight) || 0 };
  });
  return res;
}

// Máy quay: hai slide kề nhau, slide sau có data-cam. Vật ở slide trước không có cặp ở slide sau → thêm bản nhân (cùng tên !!…) ở slide sau,
// đặt ngoài khung theo hướng máy quay: Morph đẩy nó ra. Vật mới ở slide sau → bản nhân ở slide trước: Morph kéo nó vào. Vật cùng tên giữ đường riêng.
// Vật đến bằng máy quay bỏ hiệu ứng vào (đang ẩn lúc chuyển cảnh thì Morph không có gì để kéo); data-sau="0" = đứng ngoài máy quay.
function mayQuay(slides, ops, plan) {
  let uid = 0; const res = { n: 0, ghost: 0, bo: 0 };
  const nm = (op) => op.o.objectName, rect = (op) => ({ x: op.o.x / IN, y: op.o.y / IN, w: op.o.w / IN, h: op.o.h / IN });
  const rename = (si, op) => { const old = nm(op); if (old.startsWith("!!")) return; const nw = `!!mq${si + 1}-${++uid}`; op.o.objectName = nw;
    for (const e of plan[si].effects) if (e.name === old) e.name = nw; for (const l of plan[si].s.tlinks || []) if (l.name === old) l.name = nw; };
  const ghost = (op, r) => { const k = r.k || 1, o = { ...op.o, x: r.x * IN, y: r.y * IN, w: r.w * IN, h: r.h * IN }; delete o.hyperlink; res.ghost++;
    if (op.t === "text") { if (o.lineSpacing) o.lineSpacing = Math.max(1, +(o.lineSpacing * k).toFixed(2));
      return { t: "text", g: true, o, runs: op.runs.map((u) => ({ text: u.text, options: { ...u.options, fontSize: Math.max(1, +(u.options.fontSize * k).toFixed(1)), ...(u.options.charSpacing ? { charSpacing: +(u.options.charSpacing * k).toFixed(2) } : {}) } })) }; }
    if (o.sizing) o.sizing = { ...o.sizing, x: o.sizing.x * k, y: o.sizing.y * k, w: o.sizing.w * k, h: o.sizing.h * k };
    return { t: "img", g: true, o }; };
  for (let si = 1; si < slides.length; si++) {
    const cam = MQ.camOf(slides[si].cam); if (!cam || slides[si].trans !== "morph") continue;
    const A = ops[si - 1], B = ops[si], can = (op) => op.t !== "shape" && !op.g && op.it && op.it.sau !== 0;
    const nA = new Set(A.map(nm)), nB = new Set(B.map(nm));
    const di = A.filter((op) => can(op) && !nB.has(nm(op))), den = B.filter((op) => can(op) && !nA.has(nm(op)));
    di.forEach((op) => rename(si - 1, op)); den.forEach((op) => rename(si, op));
    for (const op of di) B.push(ghost(op, MQ.ra(rect(op), cam, op.it.sau)));
    const vao = den.map((op) => ghost(op, MQ.vao(rect(op), cam, op.it.sau)));
    if (cam.kind === "zoom") A.unshift(...vao); else A.push(...vao);      // phóng: vật mới mọc ra từ điểm phóng, nằm sau mọi vật của slide trước
    const tenDen = new Set(den.map(nm));
    plan[si].effects = plan[si].effects.filter((e) => { if (!tenDen.has(e.name) || !e.fx) return true; res.bo++; if (e.em || e.mv) { e.fx = null; return true; } return false; });
    res.n++;
  }
  return res;
}

/**
 * Dựng deck HTML thành PPTX. Trả { slides, text, pics, fx, morph, fonts, warn, lost, work }.
 *   soat      dựng lại qua LibreOffice và ghép tờ soát (trái HTML · phải PPTX)
 *   nhungFont nhúng font vào file (mặc định có)
 *   truoc     async (page) => string[]  — chạy trong trang sau khi font nạp xong, trước khi chụp; trả các cảnh báo (vd. kiểm tràn khung)
 *   giuLop    giữ thư mục <tên>_lop có sẵn (không xoá) — dùng khi deck HTML nằm trong đó
 */
async function build({ htmlPath, outPath, soat = false, nhungFont = true, truoc = null, giuLop = false }) {
  htmlPath = path.resolve(htmlPath); outPath = path.resolve(outPath);
  const name = path.basename(outPath, ".pptx"), work = path.join(path.dirname(outPath), name + "_lop");
  if (!giuLop) fs.rmSync(work, { recursive: true, force: true }); fs.mkdirSync(work, { recursive: true });
  for (const f of FACES) f.miss = new Set();
  const { chromium } = require("playwright");
  if (process.env.PW_CHROMIUM && !require("fs").existsSync(process.env.PW_CHROMIUM)) { console.warn(`⚠ PW_CHROMIUM=${process.env.PW_CHROMIUM} không phải file chạy được — bỏ qua và tự dò (ví dụ đúng: /opt/pw-browsers/chromium).`); delete process.env.PW_CHROMIUM; }
  const browser = await (process.env.PW_CHROMIUM ? chromium.launch({ executablePath: process.env.PW_CHROMIUM }) : chromium.launch().catch(() => chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })));
  const page = await browser.newPage({ viewport: { width: SW, height: SH }, deviceScaleFactor: 2 });
  page.on("console", (m) => { if (m.type() === "warning" || m.type() === "error") console.warn("⚠ trang:", m.text()); });
  await page.goto("file://" + htmlPath, { waitUntil: "load" });
  await page.addStyleTag({ content: `
    html, body { margin: 0 !important; background: transparent !important; }
    /* chỉ xoá NÉT CHỮ (text-fill), không đổi color — viền / gạch dùng currentColor của hộp chữ vẫn còn trong ảnh nền */
    body.notext [data-t], body.notext [data-t] * { -webkit-text-fill-color: transparent !important; text-shadow: none !important; -webkit-text-stroke: 0 transparent !important; }
    body.notext [data-t]::before, body.notext [data-t]::after, body.notext [data-t] *::before, body.notext [data-t] *::after { -webkit-text-fill-color: currentcolor !important; }
    body.nolayer [data-l], body.nolayer [data-w] { visibility: hidden !important; }
    body.solo section.s, body.solo section.s * { visibility: hidden !important; }
    body.solo section.s { background: none !important; }
    body.solo section.s .solo-on, body.solo section.s .solo-on * { visibility: visible !important; }
    /* lớp lồng trong lớp, cửa sổ soi trong lớp: là đối tượng riêng, không in vào ảnh của lớp cha */
    body.solo section.s .solo-on [data-l], body.solo section.s .solo-on [data-l] *, body.solo section.s .solo-on [data-w], body.solo section.s .solo-on [data-w] * { visibility: hidden !important; }
    body.solo section.s .solo-all, body.solo section.s .solo-all * { visibility: visible !important; }
    body.solo section.s .solo-all [data-w], body.solo section.s .solo-all [data-w] * { visibility: hidden !important; }
    body.flat * { rotate: none !important; }
    /* lúc chụp lớp: chỉ một slide hiện, luôn nằm ở (${EDGE}, ${EDGE}) của trang — cùng nội dung thì ra cùng điểm ảnh; lề ${EDGE} px để chụp cả phần thò ra ngoài slide */
    body.one { padding: ${EDGE}px !important; width: ${SW + 2 * EDGE}px !important; } body.one section.s { margin: 0 !important; } body.one section.s:not(.cur) { display: none !important; }
    body.one.solo section.s { overflow: visible !important; }` });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.hinhSanSang || null);                  // deck tự sắp đặt (đặt kính lúp, nét bút…) sau khi font đã nạp: xem hinh/hinh.js
  const secs = await page.$$("section.s");
  if (!secs.length) { await browser.close(); throw new Error('Không thấy <section class="s"> nào trong deck.'); }
  const them = truoc ? (await truoc(page)) || [] : [];

  // 1) ảnh từng slide nguyên vẹn (để soát và làm ảnh thu nhỏ cho slide mục lục)
  const full = [];
  // chờ Chromium vẽ xong slide (bộ lọc SVG nặng như vân giấy vẽ chậm — chụp sớm thì mất từng ô hình chữ nhật, tờ soát báo lệch giả)
  const choVe = (i) => page.evaluate((i) => new Promise((ok) => { document.querySelectorAll("section.s")[i].scrollIntoView(); requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(ok, 250))); }), i);
  for (let i = 0; i < secs.length; i++) { const p = path.join(work, `h-${String(i + 1).padStart(2, "0")}.jpg`); await choVe(i); await secs[i].screenshot({ path: p, type: "jpeg", quality: 82 }); full.push(p); }
  const ids = await page.$$eval("section.s", (ss) => ss.map((s, i) => s.getAttribute("data-id") || `s${i + 1}`));
  await page.evaluate(({ ids, full }) => { document.querySelectorAll("img[data-thumb]").forEach((im) => { const k = ids.indexOf(im.getAttribute("data-thumb")); if (k >= 0) im.src = "file://" + full[k]; }); return Promise.all([...document.images].map((im) => im.decode().catch(() => 0))); }, { ids, full });

  // slide có ảnh thu nhỏ (mục lục): chụp lại sau khi ảnh đã vào, để tờ soát so đúng thứ sẽ có trong PPTX
  const coAnh = await page.$$eval("section.s", (ss) => ss.map((s) => !!s.querySelector("img[data-thumb]")));
  for (let i = 0; i < secs.length; i++) if (coAnh[i]) await secs[i].screenshot({ path: full[i], type: "jpeg", quality: 82 });

  // 2) gom phần tử; đo chữ khi đã tắt xoay
  const slides = await page.evaluate(collectInPage);
  await page.evaluate(() => document.body.classList.add("flat"));
  const measured = await page.evaluate(measureTextInPage);
  await page.evaluate(() => document.body.classList.remove("flat"));

  // 3) ảnh: lớp riêng (nền trong suốt), nguồn của cửa sổ soi, nền slide (đã ẩn chữ, ẩn lớp). Ảnh trùng nội dung dùng chung một file.
  const sharp = require("sharp");
  // Ảnh giống nhau ở nhiều slide (hình dán, trang sách, ô lịch, nền) chỉ lưu MỘT lần: file nhẹ hơn, và PowerPoint thấy đúng một ảnh ở hai slide
  // nên Morph chỉ dời / xoay / cắt chứ không mờ chéo. Chỉ gộp khi TRÙNG KHÍT (mọi điểm ảnh lệch không quá 2 mức): mỗi lớp được dời về cùng một
  // chỗ chuẩn trên trang trước khi chụp, nên cùng nội dung thì ra cùng điểm ảnh. Không dùng dung sai rộng — hai nền chỉ khác một hoạ tiết mờ
  // sẽ bị gộp nhầm.
  const pool = new Map();
  const sameImage = (a, b) => { for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; if (d > 2 || d < -2) return false; } return true; };
  const canon = async (buf, ext, enc) => {
    const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true }), key = `${ext}${info.width}x${info.height}x${info.channels}`;
    const list = pool.get(key) || []; pool.set(key, list);
    for (const c of list) if (sameImage(data, c.data)) return c.file;
    const out = enc ? await enc(buf) : buf, file = path.join(work, `${ext === "jpg" ? "w" : "l"}-${md5(out)}.${ext}`);
    fs.writeFileSync(file, out); list.push({ data, file }); return file;
  };
  const shot = async (si, box) => { await page.evaluate(() => window.scrollTo(0, 0)); const sr = await secs[si].boundingBox(); // boundingBox tính theo khung nhìn: về đầu trang để trùng toạ độ cả trang
    return page.screenshot({ clip: { x: sr.x + box.x, y: sr.y + box.y, width: box.w, height: box.h }, omitBackground: true, fullPage: true }); };
  const inside = (b) => b.x >= -EDGE && b.y >= -EDGE && b.x + b.w <= SW + EDGE && b.y + b.h <= SH + EDGE;
  await page.evaluate(() => document.body.classList.add("notext", "one"));
  for (const [si, s] of slides.entries()) {
    await page.evaluate((k) => document.querySelectorAll("section.s").forEach((S, i) => S.classList.toggle("cur", i === k)), si);
    for (const it of s.items.filter((x) => x.kind === "layer")) {
      const flat = !!(it.u && inside(it.u));                             // xoay thật chỉ khi khung thẳng nằm trọn trong slide
      if (flat) Object.assign(it, it.u); else it.rot = 0;
      const x0 = Math.max(-EDGE, it.x), y0 = Math.max(-EDGE, it.y), x1 = Math.min(SW + EDGE, it.x + it.w), y1 = Math.min(SH + EDGE, it.y + it.h);
      if (x1 - x0 < 2 || y1 - y0 < 2 || x1 < 2 || y1 < 2 || x0 > SW - 2 || y0 > SH - 2) { it.skip = true; continue; }   // nằm hẳn ngoài slide: bỏ
      Object.assign(it, { x: x0, y: y0, w: x1 - x0, h: y1 - y0 });       // lớp được thò ra ngoài slide tới EDGE px (PowerPoint tự cắt khi trình chiếu)
      // Dời lớp về chỗ chuẩn (góc trên trái khung chụp ở đúng (HOME, HOME) của trang) bằng thuộc tính translate — chỉ khi không tổ tiên nào cắt xén hay biến dạng nó.
      const moved = await page.evaluate(({ k, flat, bx, by, HOME }) => { const el = document.querySelector(`[data-li="${k}"]`), S = el.closest("section.s"); document.body.classList.add("solo"); el.classList.add("solo-on");
        if (flat) { el.dataset.keepRot = el.style.rotate || ""; el.style.setProperty("rotate", "0deg", "important"); }
        for (let a = el.parentElement; a && a !== S; a = a.parentElement) { const c = getComputedStyle(a); if (c.overflowX !== "visible" || c.overflowY !== "visible" || c.transform !== "none" || (c.rotate && c.rotate !== "none") || (c.scale && c.scale !== "none") || c.clipPath !== "none") return null; }
        window.scrollTo(0, 0); const R = S.getBoundingClientRect(), r0 = el.getBoundingClientRect(), dx = HOME - (R.left + bx), dy = HOME - (R.top + by), cur = getComputedStyle(el).translate, p = cur && cur !== "none" ? cur.split(" ") : ["0px", "0px"];
        el.dataset.keepTr = el.style.translate || ""; el.style.setProperty("translate", `calc(${p[0]} + ${dx}px) calc(${p[1] || "0px"} + ${dy}px)`, "important");
        const r1 = el.getBoundingClientRect(); if (Math.abs(r1.left - r0.left - dx) > 0.02 || Math.abs(r1.top - r0.top - dy) > 0.02) { el.style.removeProperty("translate"); if (el.dataset.keepTr) el.style.translate = el.dataset.keepTr; delete el.dataset.keepTr; return null; }
        return { x: HOME - R.left, y: HOME - R.top }; }, { k: it.key, flat, bx: it.x, by: it.y, HOME });
      let buf; try { buf = await shot(si, moved ? { x: moved.x, y: moved.y, w: it.w, h: it.h } : it); } catch (e) { throw new Error(`chụp lớp "${it.name}" (slide ${si + 1}) lỗi: ${e.message.split("\n")[0]}`); }
      await page.evaluate(({ k, flat }) => { const el = document.querySelector(`[data-li="${k}"]`); document.body.classList.remove("solo"); el.classList.remove("solo-on");
        if (flat) { el.style.removeProperty("rotate"); if (el.dataset.keepRot) el.style.rotate = el.dataset.keepRot; delete el.dataset.keepRot; }
        if (el.dataset.keepTr != null) { el.style.removeProperty("translate"); if (el.dataset.keepTr) el.style.translate = el.dataset.keepTr; delete el.dataset.keepTr; } }, { k: it.key, flat });
      it.file = await canon(buf, "png", async (b) => (b.length > 600e3 ? (async () => { const w = (await sharp(b).metadata()).width || 0; /* lớp lớn có vân giấy, nhiễu hạt: hạ về ~1,4× cỡ trên slide (đủ nét khi chiếu) + nén bảng màu */ return sharp(b).resize(w > 2000 ? { width: Math.round(w * 0.7) } : undefined).png({ palette: true, quality: 92, effort: 8, dither: 0.6 }).toBuffer(); })() : b.length > 60e3 ? sharp(b).png({ compressionLevel: 9, effort: 8 }).toBuffer() : b));
      if (flat && it.cx != null) { it.x = it.cx - it.w / 2; it.y = it.cy - it.h / 2; }   // PowerPoint xoay quanh tâm ảnh: đặt ảnh thẳng sao cho tâm trùng tâm khung nghiêng
    }
    // nguồn của cửa sổ soi: chụp nguyên phần tử nguồn (có cả chữ), làm phẳng trên màu nền của cửa sổ, lưu JPEG
    const wins = s.items.filter((x) => x.kind === "win");
    if (wins.length) {
      await page.evaluate(() => document.body.classList.remove("notext"));
      for (const it of wins) {
        const b = { x: Math.max(-EDGE, it.sx), y: Math.max(-EDGE, it.sy) }; b.w = Math.min(SW + EDGE, it.sx + it.sw) - b.x; b.h = Math.min(SH + EDGE, it.sy + it.sh) - b.y;
        it.fx -= b.x - it.sx; it.fy -= b.y - it.sy; Object.assign(it, { sw: b.w, sh: b.h });
        await page.evaluate((k) => { document.body.classList.add("solo"); document.querySelector(`[data-wsrc="${k}"]`).classList.add("solo-all"); }, it.key);
        const raw = await shot(si, b);
        await page.evaluate((k) => { document.body.classList.remove("solo"); document.querySelector(`[data-wsrc="${k}"]`).classList.remove("solo-all"); }, it.key);
        const bg = "#" + hex(it.bg);
        it.file = await canon(await sharp(raw).flatten({ background: bg }).png().toBuffer(), "jpg", (b) => sharp(b).jpeg({ quality: 86, chromaSubsampling: "4:4:4" }).toBuffer());
      }
      await page.evaluate(() => document.body.classList.add("notext"));
    }
    await page.evaluate(() => document.body.classList.add("nolayer"));
    const raw = await shot(si, { x: 0, y: 0, w: SW, h: SH });
    await page.evaluate(() => document.body.classList.remove("nolayer"));
    s.bg = await canon(await sharp(raw).resize({ width: 2880 }).png().toBuffer(), "jpg", (b) => sharp(b).jpeg({ quality: 88, chromaSubsampling: "4:4:4" }).toBuffer());
  }
  await browser.close();

  // 4) lắp PPTX
  const pp = new PptxGenJS(); pp.defineLayout({ name: "W", width: 13.333, height: 7.5 }); pp.layout = "W";
  pp.title = name; const idNo = Object.fromEntries(slides.map((s, i) => [s.id, i + 1]));
  const used = new Set(), symUsed = new Set(), plan = [], lost = [], warn = [...them];
  const deg = (a) => Math.round((((a % 360) + 360) % 360) * 100) / 100;
  // 4a) mỗi slide thành một danh sách vẽ (chưa ghi vào pptxgenjs) — bước máy quay còn thêm bản nhân ngoài khung
  const ops = [];
  slides.forEach((s, si) => {
    const ve = [], sl = { addImage: (o) => ve.push({ t: "img", o, it: cur }), addShape: (st, o) => ve.push({ t: "shape", st, o }), addText: (runs, o) => ve.push({ t: "text", runs, o, it: cur }) };
    let cur = null; ops.push(ve);
    const effects = []; let auto = 0;
    const nameOf = (it, pre) => (it.m ? `!!${it.m}` : it.n || `${pre}${si + 1}-${++auto}`);
    const link = (it) => { const to = it.go && idNo[it.go]; if (it.go && !to) warn.push(`slide ${si + 1}: data-go="${it.go}" không trỏ tới slide nào`); return to ? { slide: to } : null; };
    const fx = (it, nm) => { const a = it.an; if (!a.a && !a.em && !a.mv) return;
      effects.push({ name: nm, fx: a.a, at: a.at, dur: a.dur, lin: a.lin, out: a.out == null ? null : +a.out, click: a.click, em: a.em, emAt: a.emAt, mv: a.mv });
      // đối tượng vừa là đích Morph vừa có hiệu ứng vào: lúc chuyển cảnh nó đang ẩn nên Morph không có gì để bay tới
      if (a.a && it.m && s.trans === "morph" && si > 0 && slides[si - 1].items.some((p) => p.m === it.m)) warn.push(`slide ${si + 1}: “${it.m}” vừa ghép Morph với slide trước vừa có data-a="${a.a}" — bỏ một trong hai`); };
    for (const it of s.items) {
      cur = it;
      if (it.kind === "layer") {
        if (it.skip) continue;
        const nm = nameOf(it, "hinh"), hl = link(it);
        sl.addImage(Object.assign({ path: it.file, x: it.x * IN, y: it.y * IN, w: it.w * IN, h: it.h * IN, objectName: nm, altText: it.alt || it.name || "Hình minh hoạ" }, it.rot ? { rotate: deg(it.rot) } : {}, hl ? { hyperlink: hl } : {}));
        fx(it, nm); continue;
      }
      if (it.kind === "win") {
        const nm = nameOf(it, "soi"), Z = it.z;
        sl.addImage({ path: it.file, x: it.x * IN, y: it.y * IN, w: it.sw * Z * IN, h: it.sh * Z * IN, sizing: { type: "crop", x: (it.fx * Z - it.w / 2) * IN, y: (it.fy * Z - it.h / 2) * IN, w: it.w * IN, h: it.h * IN }, rounding: it.round, objectName: nm, altText: it.alt || "Phần phóng to" });
        fx(it, nm); continue;
      }
      const M = measured[it.el]; if (!M || !M.lines.length) continue;
      // hình học khối chữ (trạng thái không xoay): baseline dòng đầu, bước dòng, mép trái / phải
      const big = (ln) => ln.toks.reduce((a, t) => (t.st.s > a.st.s ? t : a), ln.toks[0]);
      const base = (ln) => { const t = big(ln), f = faceOf(t.st.f, t.st.w); return t.top + f.asc * t.st.s; };
      const b0 = base(M.lines[0]), n = M.lines.length, t0 = big(M.lines[0]);
      const L = n > 1 ? (base(M.lines[n - 1]) - b0) / (n - 1) : (M.lh || t0.st.s * 1.2);
      // giãn dòng "chính xác" (spcPts): baseline nằm ở 80 % bước dòng tính từ mép trên, không phụ thuộc font
      // (đo trên LibreOffice: Anton 150 px lệch 15 px nếu tính theo chân chữ của font; đúng nếu tính 80 %)
      const top = b0 - 0.8 * L, hgt = n * L + t0.st.s * 0.12;
      const lx = Math.min(...M.lines.map((l) => l.left)), rx = Math.max(...M.lines.map((l) => l.right));
      const al = /center/.test(M.align) ? "center" : /right|end/.test(M.align) ? "right" : "left";
      // nới bề ngang để PowerPoint không tự xuống dòng (chênh kerning): trái → nới sang phải; phải → nới sang trái; giữa → nới hai bên theo khung phần tử
      let bx, bw; const slack = Math.max(24, (rx - lx) * 0.06);
      if (al === "center") { const c = M.ex + M.ew / 2, half = Math.max(M.ew / 2, (rx - lx) / 2 + slack); bx = c - half; bw = half * 2; }
      else if (al === "right") { bx = lx - slack; bw = rx - lx + slack; }
      else { bx = lx; bw = rx - lx + slack; }
      // đưa về toạ độ slide: tâm khối chữ = tâm phần tử (thật, đã xoay) + R(góc)·(độ lệch đo lúc không xoay)
      const dx = bx + bw / 2 - (M.ex + M.ew / 2), dy = top + hgt / 2 - (M.ey + M.eh / 2), a = (it.ang * Math.PI) / 180;
      const cx = it.cx + dx * Math.cos(a) - dy * Math.sin(a), cy = it.cy + dx * Math.sin(a) + dy * Math.cos(a);
      const runs = [];
      M.lines.forEach((ln, li) => {
        let buf = null;
        const flush = (last) => { if (!buf) return; const f = faceOf(buf.st.f, buf.st.w); used.add(f.face);
          // ký tự font không có: ký hiệu (mũi tên, dấu tích, ô vuông…) giao hẳn cho font ký hiệu của máy; ký tự khác thì báo để đổi
          const lack = (ch) => ch > " " && !f.font.hasGlyphForCodePoint(ch.codePointAt(0)), sym = (ch) => { const c = ch.codePointAt(0); return (c >= 0x2190 && c <= 0x21ff) || (c >= 0x25a0 && c <= 0x25ff) || (c >= 0x2600 && c <= 0x27bf); };
          const segs = []; for (const ch of buf.t) { const k = lack(ch) && sym(ch) ? 1 : 0; if (lack(ch)) (k ? symUsed : f.miss).add(ch); if (segs.length && segs[segs.length - 1].k === k) segs[segs.length - 1].t += ch; else segs.push({ k, t: ch }); }
          segs.forEach((g, gi) => runs.push({ text: g.t, options: Object.assign({ fontFace: g.k ? SYM : f.face, fontSize: +(buf.st.s * PT).toFixed(1), color: hex(buf.st.c), italic: buf.st.i, breakLine: !!last && gi === segs.length - 1 }, buf.st.u ? { underline: { style: "sng" } } : {}, buf.st.k ? { strike: "sngStrike" } : {}, buf.st.ls ? { charSpacing: +(buf.st.ls * PT).toFixed(2) } : {}) })); buf = null; };
        ln.toks.forEach((t, ti) => { const same = buf && JSON.stringify(buf.st) === JSON.stringify(t.st); if (!same) flush(false); if (!buf) buf = { t: (ti && t.sp ? " " : "") + t.t, st: t.st }; else buf.t += (t.sp ? " " : "") + t.t; });
        flush(li < n - 1);
      });
      const nm = nameOf(it, "chu"), hl = link(it);
      // nút đứng riêng (chữ tự mang data-go): đặt một ô trong suốt có liên kết NẰM DƯỚI chữ để cả mặt nút bấm được, chữ vẫn chọn sửa được
      if (hl && it.goOwn) sl.addShape(pp.ShapeType.rect, { x: (it.cx - M.ew / 2) * IN, y: (it.cy - M.eh / 2) * IN, w: M.ew * IN, h: M.eh * IN, fill: { color: "FFFFFF", transparency: 100 }, line: { type: "none" }, hyperlink: hl, objectName: `nut${si + 1}-${++auto}` });
      if (hl) (s.tlinks = s.tlinks || []).push({ name: nm, to: hl.slide }); // liên kết ở cấp HỘP CHỮ, gắn bằng XML ở bước 5 (để pptxgenjs gắn thì chữ bị gạch chân, đổi màu)
      sl.addText(runs, { x: (cx - bw / 2) * IN, y: (cy - hgt / 2) * IN, w: bw * IN, h: hgt * IN, margin: 0, valign: "top", align: al, lineSpacing: +(L * PT).toFixed(2), paraSpaceBefore: 0, paraSpaceAfter: 0, rotate: deg(it.ang), objectName: nm, fit: "none", wrap: n > 1 && t0.st.s < 44, isTextBox: true });   // một dòng, hoặc chữ cỡ tiêu đề (≥ 44 px): không tự xuống dòng — dòng đã ngắt sẵn theo bản HTML; máy đo chữ hơi khác (thiếu font, LibreOffice) thì chữ rộng ra chứ không gãy thêm dòng đè lên khối dưới. Chữ thường nhiều dòng vẫn tự xuống dòng để sửa chữ
      fx(it, nm);
    }
    plan.push({ effects, s });
  });
  // 4b) máy quay giữa hai slide (data-cam): vật không có cặp Morph được nhân một bản đặt ngoài khung slide kia — xem hinh/may_quay.js
  const mq = mayQuay(slides, ops, plan); if (mq.n) console.log(`✓ Máy quay: ${mq.n} lần chuyển cảnh, ${mq.ghost} bản nhân ngoài khung, ${mq.bo} hiệu ứng vào được thay bằng máy quay`);
  slides.forEach((s, si) => { const sl = pp.addSlide(); sl.background = { path: s.bg }; if (s.notes) sl.addNotes(s.notes);
    for (const op of ops[si]) { if (op.t === "img") sl.addImage(op.o); else if (op.t === "shape") sl.addShape(op.st, op.o); else sl.addText(op.runs, op.o); } });
  const buf = await pp.write({ outputType: "nodebuffer" });

  // 5) XML gốc: chuyển cảnh, chuỗi hiệu ứng, liên kết, font nhúng; gộp các ảnh trùng nhau
  const zip = await JSZip.loadAsync(buf);
  for (const [i, { effects, s }] of plan.entries()) {
    const f = `ppt/slides/slide${i + 1}.xml`; let t = await zip.file(f).async("string");
    t = t.replace(/<a:stretch\/>/g, "<a:stretch><a:fillRect/></a:stretch>");
    const tr = X.transition(i === 0 && s.trans === "morph" ? "fade" : s.trans, { dur: s.dur, auto: s.auto, noClick: s.noClick });
    if (tr) t = t.replace("</p:clrMapOvr>", "</p:clrMapOvr>" + tr);
    if (s.tlinks) { // liên kết nhảy slide trên hộp chữ: thêm quan hệ tới slide đích rồi đặt a:hlinkClick vào p:cNvPr của hộp chữ
      const rf = `ppt/slides/_rels/slide${i + 1}.xml.rels`; let rels = await zip.file(rf).async("string");
      for (const l of s.tlinks) { const rid = `rIdNhay${l.to}`;
        if (!rels.includes(`Id="${rid}"`)) rels = rels.replace("</Relationships>", `<Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slide${l.to}.xml"/></Relationships>`);
        const esc = l.name.replace(/&/g, "&amp;"), a = `name="${esc}"></p:cNvPr>`;
        if (t.includes(a)) t = t.replace(a, `name="${esc}"><a:hlinkClick r:id="${rid}" action="ppaction://hlinksldjump"/></p:cNvPr>`); else warn.push(`slide ${i + 1}: không gắn được liên kết cho hộp chữ "${l.name}"`); }
      zip.file(rf, rels); }
    // lớp thuần trang trí (nền viên nhãn, nền thẻ, vòng nền, thanh tiến độ, lớp phủ, vạch…): đánh dấu "decorative" (Office 2019+, Mark as decorative)
    // để trình đọc màn hình bỏ qua — chữ của chúng là hộp chữ riêng; ảnh có nội dung giữ alt
    t = t.replace(/(<p:cNvPr [^>]*descr="(?:Nhãn|Thẻ|Vòng nền|Thanh tiến độ|Tiến độ bài|Lớp phủ màu|Vạch|Trục|Dải đánh dấu|Hình trang trí|Số chú thích|Khung của: [^"]*)"[^>]*>)\s*<\/p:cNvPr>/g,
      '$1<a:extLst><a:ext uri="{C183D7F6-B498-43B3-948B-1728B52AA6E4}"><adec:decorative xmlns:adec="http://schemas.microsoft.com/office/drawing/2017/decorative" val="1"/></a:ext></a:extLst></p:cNvPr>');
    const map = X.shapeIds(t), fx = effects.map((e) => (map[e.name] ? { ...e, sp: map[e.name].sp, isText: map[e.name].isText } : null)).filter(Boolean);
    if (fx.length !== effects.length) warn.push(`slide ${i + 1}: ${effects.length - fx.length} hiệu ứng không tìm thấy đối tượng`);
    const tm = X.timing(fx); if (tm) t = t.replace("</p:sld>", tm + "</p:sld>");
    zip.file(f, t);
  }
  // ảnh trùng nội dung giữa các slide (hình dán, trang sách, ô lịch…): giữ một bản, các slide cùng trỏ về nó
  const seen = new Map(), remap = new Map();
  for (const f of Object.keys(zip.files).filter((k) => k.startsWith("ppt/media/") && !zip.files[k].dir).sort()) { const h = md5(await zip.file(f).async("nodebuffer")); if (seen.has(h)) { remap.set(path.basename(f), seen.get(h)); zip.remove(f); } else seen.set(h, path.basename(f)); }
  if (remap.size) for (const rf of Object.keys(zip.files).filter((k) => /^ppt\/slides\/_rels\/.*\.rels$/.test(k))) { const r0 = await zip.file(rf).async("string"), r1 = r0.replace(/Target="\.\.\/media\/([^"]+)"/g, (m, b) => (remap.has(b) ? `Target="../media/${remap.get(b)}"` : m)); if (r1 !== r0) zip.file(rf, r1); }
  const nFont = !nhungFont ? 0 : await X.embedFonts(zip, FACES.filter((f) => used.has(f.face)).map((f) => ({ face: f.face, file: f.path })));
  fs.writeFileSync(outPath, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));

  // 6) tự kiểm: chữ nào trên trang mà không vào hộp chữ thật (nằm trong ảnh); ký tự nào font không có
  const z2 = await JSZip.loadAsync(fs.readFileSync(outPath)); let nText = 0, nPic = 0, nFx = 0, nMorph = 0;
  for (const [i, { s, effects }] of plan.entries()) {
    const t = await z2.file(`ppt/slides/slide${i + 1}.xml`).async("string");
    const inBox = [...t.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map((m) => m[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'")).join(" ");
    const norm = (x) => x.toLocaleLowerCase("vi").replace(/[^\p{L}\p{N}]+/gu, " ").trim().split(" ").filter(Boolean);
    const have = new Map(); for (const w of norm(inBox)) have.set(w, (have.get(w) || 0) + 1);
    const miss = []; for (const w of norm(s.words)) { if (have.get(w)) have.set(w, have.get(w) - 1); else miss.push(w); }
    if (miss.length) lost.push(`slide ${i + 1} (${s.id}): ${miss.length} từ chỉ có trong ảnh — “${miss.slice(0, 12).join(" ")}${miss.length > 12 ? " …" : ""}”`);
    nText += (t.match(/<p:txBody>/g) || []).length; nPic += (t.match(/<p:pic>/g) || []).length; nFx += effects.length; nMorph += s.trans === "morph" && i > 0 ? 1 : 0;
  }
  console.log(`✓ ${plan.length} slide → ${outPath} (${(fs.statSync(outPath).size / 1e6).toFixed(1)} MB) · ${nText} hộp chữ · ${nPic} lớp ảnh · ${nFx} hiệu ứng · ${nMorph} chuyển cảnh Morph · ${nFont} font nhúng · gộp ${remap.size} ảnh trùng`);
  for (const f of FACES) if (f.miss.size) warn.push(`font “${f.face}” không có ${f.miss.size} ký tự: ${[...f.miss].join(" ")} — PowerPoint sẽ lấy font khác cho các ký tự này (đổi ký tự hoặc đổi font)`);
  warn.forEach((w) => console.log("⚠ " + w));
  if (symUsed.size) console.log(`ℹ Ký hiệu ${[...symUsed].join(" ")} đặt bằng font “${SYM}” của máy (font chữ của deck không có các ký hiệu này).`);
  if (lost.length) { console.log(`ℹ Chữ nằm trong ảnh (không gõ lại được trong PowerPoint):`); lost.forEach((l) => console.log("  " + l)); }

  // 7) --soat: LibreOffice dựng lại PPTX thành ảnh, ghép cạnh bản HTML để so bố cục (không soát được Morph / hiệu ứng / font nhúng)
  const res = { slides: plan.length, text: nText, pics: nPic, fx: nFx, morph: nMorph, fonts: nFont, warn, lost, work, full };
  if (soat) {
    // cho LibreOffice thấy font của tầng hình ảnh mà không phải cài vào máy (chỉ có tác dụng trên hệ dùng fontconfig)
    const fc = path.join(work, "fonts.conf");
    fs.writeFileSync(fc, `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><include ignore_missing="yes">/etc/fonts/fonts.conf</include><dir>${FD}</dir><cachedir>${path.join(work, "fc")}</cachedir></fontconfig>`);
    const r = spawnSync("soffice", ["--headless", "--convert-to", "pdf", "--outdir", work, outPath], { encoding: "utf8", env: { ...process.env, FONTCONFIG_FILE: fc } });
    const pdf = path.join(work, name + ".pdf");
    if (r.status !== 0 || !fs.existsSync(pdf)) { console.log("ℹ Không có LibreOffice để soát bố cục — mở file bằng PowerPoint để kiểm."); return res; }
    spawnSync("pdftoppm", ["-r", "48", "-png", pdf, path.join(work, "p")]);
    const ps = fs.readdirSync(work).filter((f) => /^p-\d+\.png$/.test(f)).sort((a, b) => parseInt(a.slice(2)) - parseInt(b.slice(2))), tw = 640, th = 360, g = 8, tiles = [];
    for (let i = 0; i < Math.min(ps.length, full.length); i++) { const y = g + i * (th + g);
      tiles.push({ input: await sharp(full[i]).resize(tw, th).toBuffer(), left: g, top: y }, { input: await sharp(path.join(work, ps[i])).resize(tw, th).toBuffer(), left: g * 2 + tw, top: y }); }
    // đo lệch: ảnh xám 320×180, phần diện tích lệch mạnh (> 60 mức). Trên 1,5 % là có khối đặt sai chỗ / thiếu / thừa — phải mở tờ soát xem.
    const grey = (f) => sharp(f).resize(320, 180, { fit: "fill" }).greyscale().blur(1.2).raw().toBuffer(); res.lech = [];
    for (let i = 0; i < Math.min(ps.length, full.length); i++) { const [a, b] = await Promise.all([grey(full[i]), grey(path.join(work, ps[i]))]); let big = 0; for (let k = 0; k < a.length; k++) if (Math.abs(a[k] - b[k]) > 60) big++;
      const pc = (big / a.length) * 100; res.lech.push(+pc.toFixed(2)); if (pc > 1.5) console.log(`⚠ slide ${i + 1} (${slides[i].id}): bản PPTX lệch bản HTML ${pc.toFixed(1)} % diện tích — xem tờ soát`); }
    console.log(`✓ Soát bố cục: ${res.lech.filter((x) => x > 1.5).length} / ${res.lech.length} slide lệch quá 1,5 % (lệch nhiều nhất ${Math.max(0, ...res.lech).toFixed(2)} %)`);
    const per = 6; // mỗi tờ 6 slide
    for (let k = 0; k * per < full.length; k++) { const part = tiles.slice(k * per * 2, (k + 1) * per * 2), rows = part.length / 2;
      const sheet = path.join(work, `soat-${k + 1}.jpg`);
      await sharp({ create: { width: g * 3 + tw * 2, height: g + rows * (th + g), channels: 3, background: "#101010" } }).composite(part.map((t) => ({ ...t, top: t.top - k * per * (th + g) }))).jpeg({ quality: 84 }).toFile(sheet); }
    console.log(`✓ Tờ soát (trái: HTML · phải: PPTX qua LibreOffice): ${path.join(work, "soat-*.jpg")}`);
  }
  return res;
}

module.exports = { build, FACES, faceOf };
if (require.main === module) {
  const args = process.argv.slice(2), flags = new Set(args.filter((a) => a.startsWith("--"))), pos = args.filter((a) => !a.startsWith("--"));
  if (pos.length < 2) { console.error("Dùng: node hinh/build.js <deck.html> <out.pptx> [--soat] [--khong-nhung-font]"); process.exit(2); }
  build({ htmlPath: pos[0], outPath: pos[1], soat: flags.has("--soat"), nhungFont: !flags.has("--khong-nhung-font") }).catch((e) => { console.error("✗ " + (e.stack || e.message)); process.exit(1); });
}
