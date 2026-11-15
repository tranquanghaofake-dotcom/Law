// TRÍCH NGUYÊN VĂN — hộp chữ khai data-trich phải khớp TỪNG KÝ TỰ với nguồn (noi-dung.md của bài, nơi câu luật đã đối chiếu bản chính thức).
// Phần lược bỏ ghi "…" (hoặc "..."): mỗi đoạn giữa hai dấu lược phải có nguyên trong nguồn. Lệch chỉ do dấu (kiểu bỏ dấu cũ / mới:
// "thỏa" ↔ "thoả", hoặc sai dấu thanh) được chỉ đích danh từng chữ.
// Chương 3 (15/11/2026): slide 21 ghi "sự thỏa thuận" trong khi bản chính thức ghi "sự thoả thuận" — người duyệt mới bắt được ở vòng 7.
const LUOC = /…|\.\.\./;
const VIEN = /^[\s,;:.!?“”"'‘’«»()\[\]—–-]+|[\s,;:.!?“”"'‘’«»()\[\]—–-]+$/g;
const gon = (s) => s.normalize("NFC").replace(/\s+/g, " ").trim();
// bỏ dấu từng ký tự, GIỮ độ dài (mỗi chữ cái tiếng Việt NFC → đúng một chữ gốc) để ánh xạ vị trí về chuỗi gốc
const boDau = (s) => [...s].map((c) => (c === "đ" ? "d" : c === "Đ" ? "D" : c.normalize("NFD").replace(/[̀-ͯ]/g, "") || c)).join("");

function kiemTrich(ds, nguon) {
  const hop = ds.flatMap((s) => s.hop.filter((h) => h.trich).map((h) => ({ slide: s.slide, chu: h.chu })));
  if (!nguon) return { loi: [], tom: hop.length ? `Trích nguyên văn: bỏ qua ${hop.length} hộp — bài không có noi-dung.md để đối chiếu` : "" };
  const src = gon(nguon), srcS = boDau(src), loi = []; let doan = 0, khop = 0;
  for (const h of hop) for (const d0 of gon(h.chu).split(LUOC)) {
    const d = d0.replace(VIEN, ""); if (d.split(" ").length < 2) continue;   // mẩu một chữ (dấu phẩy sau dấu lược…) không đủ để đối chiếu
    doan++;
    if (src.includes(d)) { khop++; continue; }
    const i = srcS.indexOf(boDau(d)), ngan = d.length > 60 ? d.slice(0, 57) + "…" : d;
    if (i >= 0) {
      const goc = src.slice(i, i + d.length).split(" "), lech = d.split(" ").map((w, k) => (w !== goc[k] ? `“${w}” → nguồn ghi “${goc[k]}”` : null)).filter(Boolean);
      loi.push(`◇ trích: slide ${h.slide} đoạn “${ngan}” không khớp nguyên văn — khác dấu: ${lech.join("; ")} (sửa theo đúng nguồn, kể cả kiểu bỏ dấu)`);
    } else loi.push(`◇ trích: slide ${h.slide} đoạn “${ngan}” không có trong nguồn (noi-dung.md) — chép đúng câu trong nguồn, phần lược bỏ thay bằng “…”; câu tự diễn đạt thì bỏ data-trich`);
  }
  return { loi, tom: hop.length ? `Trích nguyên văn: ${hop.length} hộp · ${khop}/${doan} đoạn khớp nguồn` : "" };
}

module.exports = { kiemTrich };
