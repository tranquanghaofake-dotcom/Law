// KỊCH BẢN KHỚP DECK — kich-ban.md là nguồn duy nhất của chữ: tiêu đề slide phải khớp cột "khẳng định" (so theo tập từ, bỏ dấu câu,
// in đậm, chữ hoa; khớp khi trùng ≥ 60 % số từ). Sửa chữ thẳng trong deck mà không ghi ngược vào kịch bản → lỗi ◇ kịch bản.
// Lý do (Chương 3, 15/11/2026): kịch bản đứng yên ở bản "chờ duyệt B" trong khi deck đổi gần hết tiêu đề; thẩm định / biên tập
// đọc kịch bản sẽ soát nhầm bản cũ, và lời nói lấy từ file khác bị lệch số slide.
const NGUONG = 0.6;
const tu = (s) => new Set(s.normalize("NFC").toLowerCase().replace(/\*\*|__|[*_`\[\]{}]/g, "").replace(/[—–\-:;,.!?“”"'‘’()…·/|]/g, " ").split(/\s+/).filter(Boolean));
const giong = (a, b) => { const A = tu(a), B = tu(b); if (!A.size && !B.size) return 1; let c = 0; for (const w of A) if (B.has(w)) c++; return c / (A.size + B.size - c); };
const o = (dong) => dong.trim().replace(/^\||\|$/g, "").split("|").map((x) => x.trim());

function docKichBan(md) {
  const dong = md.split("\n"); let cot = -1; const ds = [];
  for (const d of dong) {
    if (!d.trim().startsWith("|")) continue; const c = o(d);
    if (cot < 0) { cot = c.findIndex((x) => /khẳng định/i.test(x)); continue; }
    if (/^\d+$/.test(c[0])) ds.push({ so: +c[0], td: c[cot] || "" });
  }
  return cot < 0 ? null : ds;
}

function kiemKichBan(ds, md) {
  const kb = md ? docKichBan(md) : null;
  if (!kb || !kb.length) return { loi: [], tom: md ? "Kịch bản: bỏ qua — không thấy bảng có cột “khẳng định”" : "" };
  const loi = []; let khop = 0;
  if (kb.length !== ds.length) loi.push(`◇ kịch bản: kịch bản có ${kb.length} dòng slide, deck có ${ds.length} slide — cập nhật kich-ban.md theo deck (nguồn duy nhất của chữ)`);
  for (const s of ds) {
    const td = (s.hop.find((h) => h.tieuDe) || {}).chu || "", k = kb.find((x) => x.so === s.slide); if (!k) continue;
    if (giong(td, k.td) >= NGUONG) { khop++; continue; }
    loi.push(`◇ kịch bản: slide ${s.slide} tiêu đề “${td}” khác kịch bản “${k.td.replace(/\*\*/g, "")}” — ghi ngược câu đã duyệt vào kich-ban.md (hoặc sửa slide theo kịch bản)`);
  }
  return { loi, tom: `Kịch bản: ${khop}/${ds.length} tiêu đề khớp kich-ban.md` };
}

module.exports = { kiemKichBan, docKichBan, giong };
