// CỔNG DUYỆT — chặn việc dựng bản giao khi người dùng chưa duyệt đủ các điểm A / B / C.
// Bài học 20/11/2026 (deck HĐ bảo hiểm An Gia): người dùng trả lời "làm" sau điểm A+B, người dựng tự bỏ điểm C
// (chọn phong cách) và dùng lại phong cách đã duyệt của một bài khác. Máy giờ đòi bằng chứng duyệt trong <bài>/duyet.json:
//   { "A": { "ngay": "2026-11-20", "loi": "câu trả lời nguyên văn của người dùng" },
//     "B": { ... },
//     "C": { "ngay": "...", "loi": "...", "huong": "<đúng giá trị 'ten' trong thiet-ke/phong-cach.json>", "xem": ["thiet-ke/huong/so-sanh.jpg"] } }
// "xem" = các tệp hình người dùng đã nhìn khi chọn (tờ so sánh các hướng, slide mẫu) — phải tồn tại.
// Bài mới hoàn toàn (không tài liệu gốc) khai thêm "1", "4" theo SKILL.md. Dựng xem trước (--nhap) không bị chặn.
const fs = require("fs"), path = require("path");

function kiemCongDuyet(dir) {
  const f = path.join(dir, "duyet.json"), loi = [];
  if (!fs.existsSync(f)) return ["⛔ chưa có duyet.json — chưa có bằng chứng người dùng duyệt điểm A, B, C (SKILL.md: Điểm duyệt). Dựng xem trước thì thêm --nhap"];
  let d; try { d = JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) { return [`⛔ duyet.json không đọc được: ${e.message}`]; }
  for (const k of ["A", "B", "C"]) { const g = d[k];
    if (!g || !g.ngay || !g.loi) loi.push(`⛔ điểm duyệt ${k}: thiếu "ngay" hoặc "loi" (câu trả lời nguyên văn của người dùng) trong duyet.json`); }
  const c = d.C || {}, fThe = path.join(dir, "thiet-ke", "phong-cach.json");
  if (d.C) {
    if (!Array.isArray(c.xem) || !c.xem.length) loi.push("⛔ điểm duyệt C: thiếu \"xem\" — người dùng phải chọn phong cách bằng mắt (tờ so sánh các hướng + slide mẫu), không bằng mô tả");
    else for (const x of c.xem) if (!fs.existsSync(path.join(dir, x))) loi.push(`⛔ điểm duyệt C: tệp người dùng đã xem không tồn tại: ${x}`);
    const the = fs.existsSync(fThe) ? JSON.parse(fs.readFileSync(fThe, "utf8")) : null;
    if (!c.huong) loi.push("⛔ điểm duyệt C: thiếu \"huong\" (tên hướng phong cách người dùng chọn)");
    else if (!the) loi.push("⛔ thiếu thiet-ke/phong-cach.json — thẻ của hướng người dùng đã chọn ở điểm C");
    else if (the.ten !== c.huong) loi.push(`⛔ thẻ phong cách (thiet-ke/phong-cach.json, ten = "${the && the.ten}") khác hướng người dùng đã chọn ở điểm C ("${c.huong}") — không dùng phong cách chưa duyệt, kể cả phong cách đã duyệt của bài khác`);
  }
  return loi;
}
// VAI BẮT BUỘC theo thể loại (bài An Gia 20/11/2026: thiếu kết luận từng phần, kết luận chung, slide cảm ơn).
// thiet-ke/phong-cach.json: "vaiBatBuoc": ["bia", "lo-trinh", "ket-phan", "ket-chung", "cam-on"]; mỗi slide khai <section data-vai="…">.
// "ket-phan" phải có ít nhất bằng số slide mở phần (data-mau="mo-phan").
function kiemVaiBatBuoc(html, the) {
  const can = (the && the.vaiBatBuoc) || []; if (!can.length) return [];
  const vai = [...html.matchAll(/<section\b[^>]*\bdata-vai="([^"]+)"/g)].map((m) => m[1]), dem = (v) => vai.filter((x) => x === v).length;
  const soPhan = [...html.matchAll(/<section\b[^>]*\bdata-mau="mo-phan"/g)].length, loi = [];
  for (const v of can) if (!dem(v)) loi.push(`⛔ thiếu slide vai “${v}” (thẻ phong cách: vaiBatBuoc) — thể loại này cần ${v === "ket-phan" ? "kết luận cho từng phần" : v === "ket-chung" ? "slide kết luận chung" : v === "cam-on" ? "slide cảm ơn / hỏi đáp" : v}`);
  if (can.includes("ket-phan") && soPhan > 1 && dem("ket-phan") < soPhan) loi.push(`⛔ có ${soPhan} phần (mở phần) nhưng chỉ ${dem("ket-phan")} slide kết luận phần — mỗi phần cần một kết luận`);
  return loi;
}
module.exports = { kiemCongDuyet, kiemVaiBatBuoc };
if (require.main === module) { const l = kiemCongDuyet(process.argv[2] || "."); console.log(l.length ? l.join("\n") : "✓ đủ điểm duyệt A, B, C"); process.exitCode = l.length ? 1 : 0; }
