#!/usr/bin/env node
// CHỮ TỪNG SLIDE — xuất toàn bộ hộp chữ [data-t] (theo thứ tự trong file) + lời nói (data-notes) của slides/*.html thành bản đọc
// cho người THẨM ĐỊNH HỌC THUẬT và BIÊN TẬP CÂU CHỮ (references/vai-tro.md). Đọc thẳng HTML, không cần trình duyệt.
// Lý do có bước này (Chương 3, 15/11/2026): kịch bản viết đúng "15 ngày khi không thoả thuận" nhưng lúc rút chữ đặt lên slide
// thành "15 ngày tối đa" — chỉ soát kịch bản là không đủ, phải soát chữ thật trên slide.
//   node scripts/chu_slide.js <thư mục bài> [ra.md]      (mặc định in ra màn hình; dung.js tự ghi <tên>_lop/chu.md)
const fs = require("fs"), path = require("path");

const THUC_THE = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const giaiMa = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : +e.slice(1)) : THUC_THE[e.toLowerCase()] ?? m);
const chuSach = (html) => giaiMa(html.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "")).replace(/[ \t\r\n]+/g, " ").trim();
const thuocTinh = (the, ten) => { const m = the.match(new RegExp(`\\b${ten}="([^"]*)"`)); return m ? giaiMa(m[1]) : null; };
const coThuocTinh = (the, ten) => new RegExp(`\\s${ten}(?=[\\s=>/])`).test(the);

// tìm thẻ đóng khớp với thẻ mở ở vị trí i (đếm lồng cùng tên thẻ)
function dongKhop(html, i, ten) {
  const re = new RegExp(`<(/?)${ten}\\b[^>]*?(/?)>`, "gi"); re.lastIndex = i; let sau = 0, m;
  while ((m = re.exec(html))) { if (m[2]) continue; if (!m[1]) sau++; else if (--sau === 0) return { trong: html.indexOf(">", i) + 1, het: m.index }; }
  return null;
}

function docSection(sec, so) {
  const mo = sec.match(/^<section\b[^>]*>/)[0], hop = [], re = /<([a-z][a-z0-9]*)\b[^>]*\sdata-t(?=[\s=>])[^>]*>/gi; let m, het = 0;
  while ((m = re.exec(sec))) {
    if (m.index < het) continue;                                  // hộp chữ lồng trong hộp chữ: đã lấy cùng hộp ngoài
    const k = dongKhop(sec, m.index, m[1]); if (!k) continue; het = k.het;
    const chu = chuSach(sec.slice(k.trong, k.het)); if (!chu) continue;
    hop.push({ lop: (thuocTinh(m[0], "class") || "").split(/\s+/)[0], tieuDe: coThuocTinh(m[0], "data-tieu-de"), trich: coThuocTinh(m[0], "data-trich"), chu });
  }
  return { slide: so, mau: thuocTinh(mo, "data-mau") || "", notes: (thuocTinh(mo, "data-notes") || "").trim(), hop };
}

function docChu(dir) {
  const sd = path.join(dir, "slides"), out = [];
  for (const f of fs.readdirSync(sd).filter((x) => x.endsWith(".html")).sort()) {
    const h = fs.readFileSync(path.join(sd, f), "utf8"), re = /<section\b[^>]*>/gi; let m;
    while ((m = re.exec(h))) { const k = dongKhop(h, m.index, "section"); if (!k) continue; out.push(docSection(h.slice(m.index, k.het + 10), out.length + 1)); re.lastIndex = k.het; }
  }
  return out;
}

function vietChu(ds) {
  const dong = ["# Chữ trên slide (xuất tự động — đọc để thẩm định nội dung và biên tập câu chữ)", "", "Nhãn: [tiêu đề] hộp tiêu đề · [trích] hộp khai trích nguyên văn (data-trich) — máy đã đối chiếu từng ký tự với noi-dung.md.", ""];
  for (const s of ds) {
    const td = s.hop.find((h) => h.tieuDe);
    dong.push(`## Slide ${s.slide} · ${s.mau || "?"} — ${td ? td.chu : "(không có tiêu đề)"}`);
    for (const h of s.hop) if (h !== td) dong.push(`- ${h.trich ? "[trích] " : ""}${h.chu}`);
    if (s.notes) dong.push(`> Lời nói: ${s.notes}`);
    dong.push("");
  }
  return dong.join("\n");
}

module.exports = { docChu, vietChu };

if (require.main === module) {
  const [dir, ra] = process.argv.slice(2);
  if (!dir) { console.error("Dùng: node scripts/chu_slide.js <thư mục bài> [ra.md]"); process.exit(2); }
  const md = vietChu(docChu(path.resolve(dir)));
  if (ra) { fs.writeFileSync(ra, md); console.log(`✓ ${ra}`); } else process.stdout.write(md);
}
