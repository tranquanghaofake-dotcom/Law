#!/usr/bin/env node
// CHỮ TỪNG SLIDE — xuất toàn bộ hộp chữ [data-t] (theo thứ tự trong file) + lời nói (data-notes) của slides/*.html thành bản đọc
// cho người THẨM ĐỊNH HỌC THUẬT và BIÊN TẬP CÂU CHỮ (references/vai-tro.md). Đọc thẳng HTML, không cần trình duyệt.
// Lý do có bước này (Chương 3, 15/11/2026): kịch bản viết đúng "15 ngày khi không thoả thuận" nhưng lúc rút chữ đặt lên slide
// thành "15 ngày tối đa" — chỉ soát kịch bản là không đủ, phải soát chữ thật trên slide.
//   node scripts/chu_slide.js <thư mục bài> [ra.md]      (mặc định in ra màn hình; dung.js tự ghi <tên>_lop/chu.md)
//   --kich-ban: bảng kịch bản dựng ngược từ deck (đồng bộ khi deck đã đổi xa) · --nhip: bản đồ nhịp dựng từ deck
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
  // mô tả hình: lớp ảnh <img data-l> có nghĩa (bỏ hình trang trí, nền toàn slide; khối <div data-l> là thẻ / nền, không phải hình)
  const hinh = [...sec.matchAll(/<img\b[^>]*\sdata-l(?=[\s=>])[^>]*>/gi)].map((x) => x[0]).filter((t) => thuocTinh(t, "data-loai") !== "nen")
    .map((t) => (thuocTinh(t, "data-alt") || "").trim()).filter((a) => a && a !== "Hình trang trí");
  const td = (hop.find((h) => h.tieuDe) || {}).chu || "";
  const nhap = Math.max(0, ...[...sec.matchAll(/\sdata-click="(\d+)"/g)].map((x) => +x[1]));
  return { slide: so, mau: thuocTinh(mo, "data-mau") || "", nen: thuocTinh(mo, "data-nen") || ((thuocTinh(mo, "class") || "").split(/\s+/).find((c) => c && c !== "s") || ""), notes: (thuocTinh(mo, "data-notes") || "").trim(), hop, hinh, nhap, bai: /^Bài\s*\d+/i.test(td) };
}

// ước thời lượng một slide: lời nói ~160 tiếng / phút (tối thiểu 10 giây để nhìn slide) + giây hoạt động: câu hỏi 60 s, bài tập 120 s
const uocGiay = (s) => { const tieng = (s.notes || "").split(/\s+/).filter(Boolean).length;
  return Math.max(10, Math.round((tieng / 160) * 60)) + (s.mau === "hoi" ? 60 : 0) + (s.bai ? 120 : 0); };

function docChu(dir) {
  const sd = path.join(dir, "slides"), out = [];
  for (const f of fs.readdirSync(sd).filter((x) => x.endsWith(".html")).sort()) {
    const h = fs.readFileSync(path.join(sd, f), "utf8"), re = /<section\b[^>]*>/gi; let m;
    while ((m = re.exec(h))) { const k = dongKhop(h, m.index, "section"); if (!k) continue; out.push(docSection(h.slice(m.index, k.het + 10), out.length + 1)); re.lastIndex = k.het; }
  }
  return out;
}

function vietChu(ds) {
  const tong = ds.reduce((a, s) => a + uocGiay(s), 0);
  const dong = ["# Chữ trên slide (xuất tự động — đọc để thẩm định nội dung và biên tập câu chữ)", "",
    "Nhãn: [trích] hộp khai trích nguyên văn (data-trich) — máy đã đối chiếu từng ký tự với noi-dung.md · [hình] mô tả lớp hình (data-alt) — soát hình nói đúng ý slide.",
    `Lời nói đọc liền ≈ ${Math.round(tong / 60)} phút — CẬN DƯỚI (đọc ghi chú ~160 tiếng/phút, tối thiểu 10 giây/slide; câu hỏi +60 s, bài tập +120 s; chưa gồm phần giảng thêm). So với cột giây của kich-ban.md và thời lượng trong brief.md.`, ""];
  for (const s of ds) {
    const td = s.hop.find((h) => h.tieuDe);
    dong.push(`## Slide ${s.slide} · ${s.mau || "?"} — ${td ? td.chu : "(không có tiêu đề)"} · ≈ ${uocGiay(s)} giây`);
    for (const h of s.hop) if (h !== td) dong.push(`- ${h.trich ? "[trích] " : ""}${h.chu}`);
    for (const a of s.hinh || []) dong.push(`- [hình] ${a}`);
    if (s.notes) dong.push(`> Lời nói: ${s.notes}`);
    dong.push("");
  }
  return dong.join("\n");
}

// DỰNG NGƯỢC TỪ DECK — khi deck đã đổi xa kịch bản / bản đồ nhịp (đổi hướng, nhiều vòng sửa): sinh lại bảng từ chữ thật trên slide.
// Ghép dòng kịch bản cũ với slide theo DÃY GIỮ THỨ TỰ (quy hoạch động, tối đa tổng độ giống tiêu đề — deck chỉ chèn / bớt slide, không đảo):
// giữ "thắc mắc", "nguồn", "giây" (kế hoạch giảng) của dòng ghép được (giống ≥ 15 %); không ghép được thì "—" / ước từ lời nói.
const o = (d) => d.trim().replace(/^\||\|$/g, "").split("|").map((x) => x.trim());
const ô = (x) => String(x || "—").replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ").trim() || "—";
function kichBanTuDeck(ds, cuMd = "") {
  const { giong } = require("./kich_ban_khop"), cu = []; let h = null;
  for (const d of (cuMd || "").split("\n")) { if (!d.trim().startsWith("|")) continue; const c = o(d);
    if (!h) { const k = c.findIndex((x) => /khẳng định/i.test(x)); if (k >= 0) h = { td: k, hoi: c.findIndex((x) => /thắc mắc/i.test(x)), nguon: c.findIndex((x) => /^nguồn/i.test(x)), giay: c.findIndex((x) => /^giây/i.test(x)) }; continue; }
    if (/^\d+$/.test(c[0]) && c[h.td]) cu.push({ td: c[h.td], hoi: h.hoi >= 0 ? c[h.hoi] : "", nguon: h.nguon >= 0 ? c[h.nguon] : "", giay: h.giay >= 0 ? c[h.giay] : "" }); }
  const tds = ds.map((s) => (s.hop.find((x) => x.tieuDe) || {}).chu || ""), n = ds.length, m = cu.length;
  const sim = tds.map((t) => cu.map((c) => giong(t, c.td))), F = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) F[i][j] = Math.max(F[i - 1][j], F[i][j - 1], F[i - 1][j - 1] + (sim[i - 1][j - 1] >= 0.15 ? sim[i - 1][j - 1] : -1));
  const ghep = new Array(n).fill(null);
  for (let i = n, j = m; i > 0 && j > 0;) { const g = sim[i - 1][j - 1];
    if (g >= 0.15 && F[i][j] === F[i - 1][j - 1] + g) { ghep[i - 1] = cu[j - 1]; i--; j--; } else if (F[i][j] === F[i - 1][j]) i--; else j--; }
  const dong = ["| # | Người nghe đang thắc mắc | Khẳng định (= tiêu đề) | Bằng chứng hình | Hiện theo | Nguồn | Giây | Lời nói |", "|---|---|---|---|---|---|---|---|"];
  for (const s of ds) {
    const k = s.slide - 1, td = tds[k], g = ghep[k], hinh = (s.hinh || []).slice(0, 2).join("; ");
    dong.push(`| ${s.slide} | ${ô(g && g.hoi)} | ${ô(td)} | ${ô(hinh.length > 160 ? hinh.slice(0, 157) + "…" : hinh)} | ${s.nhap ? `${s.nhap} nhấp` : "tự"} | ${ô(g && g.nguon)} | ${g && g.giay ? ô(g.giay) : uocGiay(s)} | ${ô(s.notes)} |`);
  }
  return dong.join("\n");
}
function nhipTuDeck(ds) {
  const dai = []; for (const s of ds) { const t = dai[dai.length - 1]; if (t && t.nen === s.nen) t.n++; else dai.push({ nen: s.nen || "?", n: 1 }); }
  return [`# Bản đồ nhịp — ${ds.length} slide (dựng từ deck; bố cục = data-mau, họ nền = data-nen)`, "", "| # | Bố cục | Họ nền | Hiện theo |", "|---|---|---|---|",
    ...ds.map((s) => `| ${s.slide} | ${s.mau || "?"} | ${s.nen || "?"} | ${s.nhap ? `${s.nhap} nhấp` : "tự"} |`), "", `Dải họ nền: ${dai.map((d) => `${d.nen} ×${d.n}`).join(" · ")}`].join("\n");
}

module.exports = { docChu, vietChu, uocGiay, kichBanTuDeck, nhipTuDeck };

if (require.main === module) {
  const a = process.argv.slice(2), co = new Set(a.filter((x) => x.startsWith("--"))), [dir, ra] = a.filter((x) => !x.startsWith("--"));
  if (!dir) { console.error("Dùng: node scripts/chu_slide.js <thư mục bài> [ra.md] [--kich-ban | --nhip]  (--kich-ban: bảng kịch bản dựng ngược từ deck; --nhip: bản đồ nhịp)"); process.exit(2); }
  const ds = docChu(path.resolve(dir)), kb = path.join(path.resolve(dir), "kich-ban.md");
  const md = co.has("--kich-ban") ? kichBanTuDeck(ds, fs.existsSync(kb) ? fs.readFileSync(kb, "utf8") : "") : co.has("--nhip") ? nhipTuDeck(ds) : vietChu(ds);
  if (ra) { fs.writeFileSync(ra, md); console.log(`✓ ${ra}`); } else process.stdout.write(md);
}
