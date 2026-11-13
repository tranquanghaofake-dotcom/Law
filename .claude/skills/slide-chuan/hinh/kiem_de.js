// TẦNG HÌNH ẢNH — KIỂM ĐÈ trong trang (chạy bằng page.evaluate sau khi font nạp, nhãn data-t / data-l đã gắn).
// Gốc: phiên 13/11/2026 (loi-da-biet-2026-11.md mục E, N5) — 6 lỗi chỉ thấy bằng mắt, --soat không báo: hình dán chương đè dấu hỏi
// của tiêu đề, nhãn xuống dòng đè tên chủ thể, tên người ký xuống dòng đè nhãn, chữ đè dải lụa…
//   (a) chữ bị lớp ảnh khác đè: lấy mẫu 5 điểm trên mỗi dòng chữ; đi từ trên xuống chồng phần tử tại điểm (elementsFromPoint — đúng thứ
//       tự vẽ), bỏ qua phần tử không vẽ gì ở đó (div nền trong suốt, gốc <svg>, <g>); gặp chữ trước → không che; gặp phần tử có vẽ thuộc
//       một lớp data-l khác → bị che. Bỏ qua lớp phủ ≥ 60 % slide (nền, bàn họp).
//   (b) hai hộp chữ đè nhau: so LÕI của từng dòng (50 % giữa khung Range.getClientRects — khung đủ của chữ Anton cỡ lớn gồm cả vùng dấu
//       tiếng Việt nên số lớn với đơn vị ngay dưới chạm khung mà không chạm nét) — giao nhau ≥ 25 % lõi thấp hơn.
// Hàm phải tự đủ (page.evaluate tuần tự hoá nó): không dùng biến bên ngoài.
function kiemDeTrongTrang() {
  const out = [], txt = (el) => (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 36);
  const dong = (el) => { const r = document.createRange(); r.selectNodeContents(el); return [...r.getClientRects()].filter((q) => q.width > 4 && q.height > 4); };
  const coVe = (el) => { const tag = el.tagName.toLowerCase();
    if (["img", "canvas", "video"].includes(tag)) return true;
    if (el instanceof SVGElement) return !["svg", "g", "defs", "clippath", "lineargradient", "radialgradient", "stop"].includes(tag);
    const cs = getComputedStyle(el), bg = cs.backgroundColor.match(/[\d.]+/g);
    return cs.backgroundImage !== "none" || (bg && (bg.length < 4 || +bg[3] > 0.05)); };
  [...document.querySelectorAll("section.s")].forEach((s, si) => {
    s.scrollIntoView({ block: "start" });
    const S = s.getBoundingClientRect(), A = S.width * S.height, ten = (s.dataset.title || s.dataset.type || "").slice(0, 40);
    const T = [...s.querySelectorAll("[data-t]")].filter((t) => !t.closest(".bar") && getComputedStyle(t).visibility !== "hidden" && txt(t)).map((t) => ({ t, q: dong(t) }));
    for (const { t, q } of T) {
      let trung = 0, tong = 0, lop = null;
      for (const r of q) for (const f of [0.1, 0.3, 0.5, 0.7, 0.9]) {
        const x = r.left + r.width * f, y = r.top + r.height * 0.5;
        if (x < S.left || x > S.right || y < S.top || y > S.bottom) continue;
        tong++;
        for (const el of document.elementsFromPoint(x, y)) {
          if (t.contains(el) || el.contains(t) || !s.contains(el)) break;          // tới chữ (hoặc ra ngoài slide) trước → không bị che
          if (!coVe(el)) continue;                                                  // trong suốt ở điểm này → xét lớp bên dưới
          const L = el.closest("[data-l]"); if (!L || L.contains(t)) break;
          const R = L.getBoundingClientRect(); if (R.width * R.height > 0.6 * A) break;
          trung++; lop = L; break;
        }
      }
      if (lop && trung >= 2 && trung / tong >= 0.15) out.push(`⚠ slide ${si + 1} "${ten}": chữ "${txt(t)}" bị lớp ảnh "${lop.dataset.l}" đè (${trung}/${tong} điểm) — dời hình (emojiPos…), rút chữ hoặc đổi chỗ khối`);
    }
    for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) {
      const a = T[i], b = T[j]; if (a.t.contains(b.t) || b.t.contains(a.t)) continue;
      const loi = (q) => ({ l: q.left, r: q.right, t: q.top + q.height * 0.25, b: q.bottom - q.height * 0.25 });
      let te = 0; for (const p0 of a.q) for (const r0 of b.q) { const p = loi(p0), r = loi(r0), w = Math.min(p.r, r.r) - Math.max(p.l, r.l), h = Math.min(p.b, r.b) - Math.max(p.t, r.t); if (w > 4 && h > 0) te = Math.max(te, h / Math.min(p.b - p.t, r.b - r.t)); }
      if (te >= 0.25) out.push(`⚠ slide ${si + 1} "${ten}": hai hộp chữ đè nhau — "${txt(a.t)}" và "${txt(b.t)}" — rút chữ, giữ một dòng (white-space: nowrap) hoặc dời khối`);
    }
  });
  window.scrollTo(0, 0);
  return out;
}

module.exports = { kiemDeTrongTrang };
