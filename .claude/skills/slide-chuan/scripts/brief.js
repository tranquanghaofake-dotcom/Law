#!/usr/bin/env node
// HƯỚNG DẪN GIAO VIỆC CHO AGENT — sinh từ MẪU CỐ ĐỊNH (references/brief/*.md), không viết tay mỗi vòng.
// Lý do (Chương 3, 15/11/2026): hướng dẫn viết tay làm tiêu chí trôi giữa các vòng — 4 vòng cuối chấm 6 hạng tự đặt, bỏ mất hạng
// "Nội dung", nên vòng chấm QUA vẫn sót ~20 điểm nội dung. Mẫu cố định giữ đủ 8 hạng rubric + ba mức lỗi + nơi lưu báo cáo.
//   node scripts/brief.js <bài> duyet|duyet-lai|tham-dinh|bien-tap [--ten=<tên deck>] [--mon="…"] [--lan=1|2]
//        [--luat=<file luật, cách nhau dấu phẩy>] [--goc=<tài liệu gốc>] [--loi=<file lỗi vòng trước>] [--slide=1,2,…]
// In hướng dẫn ra màn hình: dán NGUYÊN VĂN vào prompt của Agent (model theo references/vai-tro.md). Báo cáo agent tự ghi vào
// <bài>/duyet/NN-<vai>.md (đánh số tự tăng) — nhật ký các vòng có sẵn, không phải chép tay.
const fs = require("fs"), path = require("path");
const SKILL = path.join(__dirname, ".."), VAI = ["duyet", "duyet-lai", "tham-dinh", "bien-tap"];

function monHoc(dir) {
  const f = path.join(dir, "brief.md"); if (!fs.existsSync(f)) return null;
  const m = fs.readFileSync(f, "utf8").match(/^#\s*Brief\s*[—–-]\s*(.+?)(?:\s*·|$)/m); return m ? m[1].trim() : null;
}

function taoBrief(dir, vai, { ten, mon, lan = 2, luat, goc, loi, slide } = {}) {
  if (!VAI.includes(vai)) throw new Error(`vai "${vai}" không có — chọn: ${VAI.join(", ")}`);
  dir = path.resolve(dir); ten = ten || path.basename(dir);
  const lop = path.join(dir, `${ten}_lop`), thu = path.join(dir, "duyet"); fs.mkdirSync(thu, { recursive: true });
  const so = fs.readdirSync(thu).filter((f) => /^\d+-.*\.md$/.test(f)).length + 1;
  const baoCao = path.join(thu, `${String(so).padStart(2, "0")}-${vai}${vai === "tham-dinh" ? `-${lan}` : ""}.md`);
  let dsLoi = "";
  if (vai === "duyet-lai") { if (!loi || !fs.existsSync(loi)) throw new Error("duyet-lai cần --loi=<file lỗi vòng trước> (thường là báo cáo vòng trước trong duyet/)"); dsLoi = fs.readFileSync(loi, "utf8").trim(); }
  const soSanh = path.join(lop, "so-sanh.jpg");
  const dien = {
    MON: mon || monHoc(dir) || "<môn — ghi --mon>", BAI: dir, LOP: lop, SKILL, BAO_CAO: baoCao, LAN: String(lan), LOI: dsLoi,
    SO_SANH: fs.existsSync(soSanh) ? ` · tờ so sánh với mẫu tham chiếu: ${soSanh}` : "",
    PHAM_VI: slide ? ` (slide ${String(slide).split(",").map((s) => s.trim()).join(", ")})` : "",
    CHU: +lan === 1 ? path.join(dir, "kich-ban.md") : path.join(lop, "chu.md"),
    LUAT: luat ? String(luat).split(",").map((s) => (fs.existsSync(s.trim()) ? path.resolve(s.trim()) : s.trim())).join(" · ") : "nguồn ghi trong bảng nguồn của noi-dung.md",
    GOC: goc ? ` · tài liệu gốc ${fs.existsSync(goc) ? path.resolve(goc) : goc}` : "",
  };
  const brief = fs.readFileSync(path.join(SKILL, "references", "brief", `${vai}.md`), "utf8").replace(/\{\{(\w+)\}\}/g, (m, k) => (k in dien ? dien[k] : m)).trim();
  return { brief, baoCao };
}

module.exports = { taoBrief, VAI };

if (require.main === module) {
  const a = process.argv.slice(2), pos = a.filter((x) => !x.startsWith("--")), o = {};
  for (const x of a.filter((x) => x.startsWith("--"))) { const [k, ...v] = x.slice(2).split("="); o[k] = v.join("=") || true; }
  if (pos.length < 2) { console.error(`Dùng: node scripts/brief.js <bài> ${VAI.join("|")} [--ten=] [--mon=] [--lan=1|2] [--luat=] [--goc=] [--loi=] [--slide=]`); process.exit(2); }
  try { const r = taoBrief(pos[0], pos[1], o); console.log(r.brief); console.error(`\n→ báo cáo sẽ lưu: ${r.baoCao}`); }
  catch (e) { console.error("✗ " + e.message); process.exit(2); }
}
