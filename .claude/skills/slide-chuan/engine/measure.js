// Đo chữ bằng file font thật (fontkit) để tính số dòng sau khi ngắt dòng và chiều cao cần có.
// Font Office -> file thay thế cùng độ rộng (có đủ dấu tiếng Việt), xem ghi chú trong themes.js.
const fs = require("fs");
const path = require("path");
const fontkit = require("fontkit");

const FAMILY = {
  "calibri": ["Carlito", "Calibri"],
  "arial": ["LiberationSans", "Arial"],
  "times new roman": ["LiberationSerif", "TimesNewRoman", "Times New Roman", "Times"],
};
const DIRS = ["/usr/share/fonts", "/usr/local/share/fonts", path.join(process.env.HOME || "", ".fonts"),
  path.join(process.env.HOME || "", ".local/share/fonts"), "/Library/Fonts", "/System/Library/Fonts/Supplemental",
  "C:\\Windows\\Fonts"];
const STYLE = (b, i) => (b && i ? "BoldItalic" : b ? "Bold" : i ? "Italic" : "Regular");

let index = null;
function buildIndex() {
  index = new Map();
  const walk = (dir, depth) => {
    let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const e of ents) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (depth < 5) walk(p, depth + 1); }
      else if (/\.(ttf|otf)$/i.test(e.name)) index.set(e.name.toLowerCase(), p);
    }
  };
  for (const d of DIRS) walk(d, 0);
}
function fontFile(face, bold, italic) {
  if (!index) buildIndex();
  const fams = FAMILY[String(face || "calibri").toLowerCase()] || FAMILY.calibri;
  for (const f of fams) {
    const base = f.replace(/\s/g, "");
    const cand = [`${base}-${STYLE(bold, italic)}.ttf`, `${base}-${STYLE(bold, italic)}.otf`];
    if (STYLE(bold, italic) === "Regular") cand.push(`${base}.ttf`, `${base}-Regular.ttf`);
    for (const c of cand) if (index.has(c.toLowerCase())) return index.get(c.toLowerCase());
    // Windows/macOS: arial.ttf, arialbd.ttf, arialbi.ttf, ariali.ttf, times.ttf, timesbd.ttf, calibri.ttf, calibrib.ttf...
    const win = { arial: "arial", "times new roman": "times", calibri: "calibri" }[String(face || "calibri").toLowerCase()];
    if (win && (f === "Arial" || f === "Times" || f === "Calibri")) {
      const suf = (bold && italic) ? ["bi", "z"] : bold ? ["bd", "b"] : italic ? ["i"] : [""];
      for (const x of suf) if (index.has(`${win}${x}.ttf`)) return index.get(`${win}${x}.ttf`);
    }
  }
  return null;
}

const cache = new Map(), widthCache = new Map();
function loadFont(file) {
  if (!cache.has(file)) { let f = fontkit.openSync(file); if (f.fonts) f = f.fonts[0]; cache.set(file, f); }
  return cache.get(file);
}
function textWidth(font, file, str) { // đơn vị em
  const k = file + "\u0000" + str;
  if (!widthCache.has(k)) widthCache.set(k, font.layout(str.normalize("NFC")).advanceWidth / font.unitsPerEm);
  return widthCache.get(k);
}
const lineEm = (font) => (font.ascent - font.descent + font.lineGap) / font.unitsPerEm; // descent âm

// Tách thành các đoạn: mỗi đoạn là mảng run { text, face, size, bold, italic }.
function paragraphs(text, o) {
  const base = { face: o.fontFace, size: o.fontSize || 16, bold: !!o.bold, italic: !!o.italic, charSpacing: o.charSpacing || 0 };
  const runs = Array.isArray(text) ? text : [{ text, options: {} }];
  const paras = [[]];
  let bullet = false;
  for (const r of runs) {
    const ro = r.options || {};
    const run = { face: ro.fontFace || base.face, size: ro.fontSize || base.size, bold: ro.bold != null ? !!ro.bold : base.bold,
      italic: ro.italic != null ? !!ro.italic : base.italic, charSpacing: ro.charSpacing != null ? ro.charSpacing : base.charSpacing };
    if (ro.bullet) bullet = true;
    const parts = String(r.text == null ? "" : r.text).split("\n");
    parts.forEach((p, i) => {
      if (i > 0) paras.push([]);
      if (p) paras[paras.length - 1].push(Object.assign({ text: p }, run));
    });
    if (ro.breakLine) paras.push([]);
  }
  while (paras.length > 1 && !paras[paras.length - 1].length) paras.pop();
  return { paras, bullet };
}

// Trả về { ok, lines, height, lineH, ... }. ok=false nếu không có font để đo.
function measure(text, o, widthIn, safety = 0.97) {
  const { paras, bullet } = paragraphs(text, o);
  const W = (widthIn - (bullet ? 27 / 72 : 0)) * safety;
  let totalH = 0, totalLines = 0, maxLines = 0;
  const spaceAfter = (o.paraSpaceAfter || 0) / 72;
  for (const para of paras) {
    let lh = 0;
    const words = []; let cur = null;
    for (const r of para) {
      const file = fontFile(r.face, r.bold, r.italic);
      if (!file) return { ok: false, face: r.face };
      const font = loadFont(file);
      lh = Math.max(lh, lineEm(font) * r.size / 72);
      const w = (s) => (textWidth(font, file, s) * r.size + r.charSpacing * [...s].length) / 72;
      for (const seg of r.text.split(/( )/)) {
        if (seg === " ") { if (cur) words.push({ w: cur, sp: w(" ") }), cur = 0; else words.push({ w: 0, sp: w(" ") }), cur = 0; continue; }
        if (!seg) continue;
        cur = (cur || 0) + w(seg);
      }
    }
    if (cur) words.push({ w: cur, sp: 0 });
    if (!para.length) { lh = lh || (o.fontSize || 16) * 1.2 / 72; }
    let lines = 1, x = 0;
    for (const t of words) {
      if (t.w > W) { if (x > 0) lines++; lines += Math.ceil(t.w / W) - 1; x = t.w - (Math.ceil(t.w / W) - 1) * W + t.sp; continue; }
      if (x > 0 && x + t.w > W) { lines++; x = 0; }
      x += t.w + t.sp;
    }
    totalH += lines * lh; totalLines += lines; maxLines = Math.max(maxLines, lines);
    para.lh = lh; para.lines = lines;
  }
  totalH += spaceAfter * (paras.length - 1);
  return { ok: true, lines: totalLines, height: totalH, lineH: paras[0].lh || 0, paras: paras.length };
}

// Bề rộng (inch) của chữ trên MỘT dòng, đo bằng font thật — dùng để co nhãn/chip vừa khít chữ.
// Trả null nếu không có font (khi đó nơi gọi dùng ước lượng theo số ký tự).
function textW(text, o) {
  const { paras } = paragraphs(String(text), o); let best = 0;
  for (const para of paras) {
    let x = 0;
    for (const r of para) {
      const file = fontFile(r.face, r.bold, r.italic); if (!file) return null;
      const font = loadFont(file);
      x += (textWidth(font, file, r.text) * r.size + r.charSpacing * [...r.text].length) / 72;
    }
    best = Math.max(best, x);
  }
  return best;
}

module.exports = { measure, fontFile, textW };
