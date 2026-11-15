// DỄ ĐỌC — "nhìn slide là nắm ý" bắt đầu từ chữ đọc được ở cuối lớp (Chương 3, 15/11/2026). Đo trên trang, theo thẻ phong cách:
//   số chữ mỗi slide (trừ số trang, dòng nguồn) · tỉ lệ chữ dưới 28 px (14 pt) · đoạn quá nhiều dòng · chữ thân bài tương phản thấp
//   (< 7 : 1 cho chữ < 32 px — chuẩn AAA, vì máy chiếu lớp học làm bạc màu).
// Ngưỡng (ghi đè trong thẻ "nguong"): tuToiDa 45 (bố cục bang / hoi / so-sanh: 75) · nhoToiDa 0.15 · dongToiDa 3 · tuongPhanNho 7.
// Thẻ khai "deDoc": false để tắt (kèm lý do).

function thuThapDeDoc() {
  const rgb = (c) => (c.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
  const L = (c) => { const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const tp = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const nenCua = (el, s) => { for (let e = el; e && e !== s.parentElement; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (c && !/rgba\([^)]*,\s*0\)$/.test(c) && c !== "transparent") return rgb(c); } return null; };
  const out = [];
  document.querySelectorAll("section.s").forEach((s, i) => {
    const hop = [];
    for (const t of s.querySelectorAll("[data-t]")) {
      if (t.querySelector("[data-t]")) continue;
      const chu = (t.textContent || "").trim().replace(/\s+/g, " "); if (!chu) continue;
      const cs = getComputedStyle(t), co = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight) || co * 1.3;
      const r = document.createRange(); r.selectNodeContents(t); const q = [...r.getClientRects()].filter((x) => x.width > 1);
      const dong = new Set(q.map((x) => Math.round(x.top / (lh * 0.6)))).size || 1;
      // nền thật dưới chữ: phần tử đầu tiên bên dưới hộp chữ (thẻ, dải, ô bảng là anh em chứ không phải cha) có màu nền;
      // gặp ảnh trước thì không kết luận (soat_chi_tiet đo bằng điểm ảnh)
      // tìm theo hình học (lớp data-l có thể đang bị ẩn khi đo): phần tử đứng TRƯỚC hộp chữ trong DOM, chứa điểm giữa dòng đầu, có màu nền hoặc là ảnh
      const R = t.getBoundingClientRect(), px = R.left + Math.min(R.width, 160) / 2, py = R.top + Math.min(R.height, 60) / 2; let nen = null, anh = false;
      const ung = [...s.querySelectorAll("*")].filter((e) => e !== t && !t.contains(e) && !e.contains(t) && (t.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING)).filter((e) => { const q = e.getBoundingClientRect(); return px >= q.left && px <= q.right && py >= q.top && py <= q.bottom; })
        .filter((e) => e.tagName === "IMG" || (() => { const c = getComputedStyle(e).backgroundColor; return c && !/rgba\([^)]*,\s*0\)$/.test(c) && c !== "transparent"; })());
      const tren = ung[ung.length - 1], rieng = getComputedStyle(t).backgroundColor;
      if (rieng && rieng !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(rieng)) { nen = rgb(rieng); anh = false; } else
      if (tren) { if (tren.tagName === "IMG") anh = !/data-loai="nen"/.test(tren.outerHTML.slice(0, 200)) || false; else nen = rgb(getComputedStyle(tren).backgroundColor); }
      if (!nen && !anh) nen = nenCua(t, s);
      const tpv = nen && !anh ? Math.round(tp(rgb(cs.color), nen) * 10) / 10 : null;
      hop.push({ chu: chu.slice(0, 60), tu: chu.split(" ").filter((w) => /[\p{L}\p{N}]/u.test(w)).length, co, dong, tp: tpv, lop: t.className.split(" ")[0] });
    }
    out.push({ slide: i + 1, mau: s.dataset.mau || "", hop });
  });
  return out;
}

const NGUONG_DD = { tuToiDa: 45, tuToiDaRong: 75, tuToiDaTrich: 95, nhanToiDa: 12, nhoToiDa: 0.15, dongToiDa: 3, tuongPhanNho: 7 };
const RONG = new Set(["bang", "hoi", "so-sanh"]);   // bảng, câu hỏi, so sánh: nới số chữ; trích nguyên văn: nới hơn (không được cắt lời luật)
const MIEN = /^(nguon|so-trang|chu-anh)$/, NHAN = /^(chip)$/;   // nhãn chữ in hoa giãn cách: không tính vào tỉ lệ chữ nhỏ (vẫn phải ≥ 12 pt)

function danhGiaDeDoc(slides, the, nguong = {}) {
  const loi = [];
  if (!the || the.deDoc === false) return { loi, tom: "" };
  const ng = { ...NGUONG_DD, ...nguong }; let tong = 0, nhoTong = 0;
  for (const s of slides) {
    // chữ đọc liền = hộp từ 4 chữ trở lên (câu, đoạn); nhãn ngắn ≤ 3 chữ (số, tên ô, nhãn sơ đồ) mắt lướt qua — đếm riêng
    const ds = s.hop.filter((h) => !MIEN.test(h.lop)), tu = ds.filter((h) => h.tu >= 4).reduce((a, h) => a + h.tu, 0), soNhan = ds.filter((h) => h.tu < 4 && !h.lop.startsWith("td")).length, tatCa = ds.reduce((a, h) => a + h.tu, 0), nho = ds.filter((h) => h.co < 28 && !NHAN.test(h.lop)).reduce((a, h) => a + h.tu, 0);
    tong += tu; nhoTong += nho;
    const tran = s.mau === "trich" ? ng.tuToiDaTrich : RONG.has(s.mau) ? ng.tuToiDaRong : ng.tuToiDa;
    if (tu > tran) loi.push(`◇ dễ đọc: slide ${s.slide} có ${tu} chữ đọc liền (> ${tran}) — rút câu, tách slide, hoặc biến ý thành hình`);
    if (soNhan > ng.nhanToiDa && !RONG.has(s.mau)) loi.push(`◇ dễ đọc: slide ${s.slide} có ${soNhan} nhãn ngắn (> ${ng.nhanToiDa}) — gom nhãn lặp thành chú giải`);
    if (tatCa >= 12 && nho / tatCa > ng.nhoToiDa) loi.push(`◇ dễ đọc: slide ${s.slide} có ${Math.round((100 * nho) / tatCa)} % chữ dưới 28 px — nâng cỡ chữ thân bài ≥ 28 px (ghi chú nguồn được miễn)`);
    for (const h of ds) {
      if (h.co < 40 && h.dong > ng.dongToiDa) loi.push(`◇ dễ đọc: slide ${s.slide} có đoạn ${h.dong} dòng “${h.chu.slice(0, 40)}” — rút còn ≤ ${ng.dongToiDa} dòng`);
      if (h.tp != null && h.co < 32 && h.tp < ng.tuongPhanNho) loi.push(`◇ dễ đọc: slide ${s.slide} chữ “${h.chu.slice(0, 30)}” ${Math.round(h.co)} px tương phản ${h.tp} : 1 (< ${ng.tuongPhanNho} : 1 cho chữ nhỏ trên máy chiếu) — đậm màu chữ`);
    }
  }
  return { loi, tom: `Dễ đọc: trung bình ${slides.length ? Math.round(tong / slides.length) : 0} chữ / slide · ${tong ? Math.round((100 * nhoTong) / tong) : 0} % chữ dưới 28 px` };
}

module.exports = { thuThapDeDoc, danhGiaDeDoc, NGUONG_DD };
