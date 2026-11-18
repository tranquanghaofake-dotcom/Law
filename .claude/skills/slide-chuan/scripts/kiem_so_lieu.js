// KIỂM SỐ LIỆU — mọi con số "nặng" trên slide phải truy được về noi-dung.md (bảng nội dung đã kiểm chứng của bài).
// Bài Nhóm 2 (18/11/2026): máy kiểm bố cục không bắt lỗi nghĩa; "15 – 20 %" (phép chia tay) thay cho số công bố "15 – 24 %",
// số tự tính lẫn với số công bố — chỉ phản biện nội dung mới thấy. Quy tắc: số có phần thập phân / dấu nghìn / %, ngày tháng,
// số hiệu văn bản xuất hiện trên slide mà không có trong noi-dung.md → LỖI CHẶN. Số tự tính, ví dụ giả định: ghi vào noi-dung.md
// (mục "Số tự tính / ví dụ" kèm cách tính) — vừa qua máy kiểm, vừa để người duyệt soát phép tính.
// Số nguyên trơn (năm, thứ tự, số trang, "13 điều") không xét — quá nhiều, ít rủi ro.
//   node scripts/kiem_so_lieu.js <thư_mục_bài>     (dung.js tự gọi khi bài có noi-dung.md)
const fs = require("fs"), path = require("path");

const chuanSo = (s) => s.replace(/[−–]/g, "-").replace(/\u00a0/g, " ").replace(/^[+≈~±\s-]+/, "").replace(/\s*%$/, "%").trim();   // giữ dấu % để số nguyên phần trăm (30 %) vẫn được xét
// các con số "nặng" trong một đoạn chữ
function laySo(chu) {
  const ra = new Set(), t = chu.replace(/[−–]/g, "-");
  for (const m of t.matchAll(/\d+\/\d{4}\/[A-ZĐ0-9-]+/g)) ra.add(m[0]);                       // số hiệu văn bản: 32/2024/QH15
  const bo = t.replace(/\d+\/\d{4}\/[A-ZĐ0-9-]+/g, " ");
  for (const m of bo.matchAll(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g)) ra.add(m[0]);                    // ngày đủ: 01/7/2024
  const bo2 = bo.replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, " ");
  for (const m of bo2.matchAll(/\d+(?:[.,]\d+)+(?:\s?%)?|\d+\s?%/g)) ra.add(chuanSo(m[0]));      // 12.811 · 956,5 · 8,02 % · 30 %
  return [...ra];
}
function chuChieu(html) {   // chữ người xem thấy: bỏ thuộc tính (data-notes, alt…), thẻ, ký tự thoát
  return html.replace(/<(style|script)[\s\S]*?<\/\1>/g, " ").replace(/<[^>]+>/g, " ").replace(/&#91;/g, "[").replace(/&#93;/g, "]").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/\s+/g, " ");
}
function kiemSoLieu(dir) {
  const fND = path.join(dir, "noi-dung.md"); if (!fs.existsSync(fND)) return [];
  const goc = fs.readFileSync(fND, "utf8").replace(/[−–]/g, "-");
  const thoat = (x) => x.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  const co = (so) => new RegExp(`(?<![\\d.,])${thoat(so)}(?![\\d]|[.,]\\d)`).test(goc);   // khớp nguyên con số: "20" không khớp trong "2023"
  const sd = path.join(dir, "slides"); if (!fs.existsSync(sd)) return [];
  const loi = [];
  for (const f of fs.readdirSync(sd).filter((x) => x.endsWith(".html")).sort()) {
    const n = +f.replace(/\D/g, ""), thieu = laySo(chuChieu(fs.readFileSync(path.join(sd, f), "utf8"))).filter((s) => !/^\d+$/.test(s) && !co(s.replace(/%$/, "")));
    if (thieu.length) loi.push(`# số liệu: slide ${n} có ${thieu.map((s) => `“${s}”`).join(", ")} không có trong noi-dung.md — ghi nguồn vào bảng, hoặc khai ở mục "Số tự tính / ví dụ" kèm cách tính`);
  }
  return loi;
}
if (require.main === module) { const l = kiemSoLieu(path.resolve(process.argv[2] || ".")); console.log(l.length ? l.join("\n") : "✓ mọi con số trên slide đều có trong noi-dung.md"); process.exitCode = l.length ? 1 : 0; }
module.exports = { kiemSoLieu, laySo, chuChieu };
