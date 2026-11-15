// TẦNG HÌNH ẢNH — KIỂM ĐÈ trong trang (chạy bằng page.evaluate sau khi font nạp, nhãn data-t / data-l đã gắn).
// Gốc: phiên 13/11/2026 (loi-da-biet-2026-11.md mục E, N5) — 6 lỗi chỉ thấy bằng mắt, --soat không báo: hình dán chương đè dấu hỏi
// của tiêu đề, nhãn xuống dòng đè tên chủ thể, tên người ký xuống dòng đè nhãn, chữ đè dải lụa…
//   (a) chữ bị lớp ảnh khác đè: lấy mẫu 5 điểm trên mỗi dòng chữ; đi từ trên xuống chồng phần tử tại điểm (elementsFromPoint — đúng thứ
//       tự vẽ), bỏ qua phần tử không vẽ gì ở đó (div nền trong suốt, gốc <svg>, <g>); gặp chữ trước → không che; gặp phần tử có vẽ thuộc
//       một lớp data-l khác → bị che. Bỏ qua lớp phủ ≥ 60 % slide (nền, bàn họp).
//   (b) hai hộp chữ đè nhau (kể cả cùng cha — tiêu đề xuống 2 dòng đè mô tả trong thẻ, danh sách toạ độ cố định có dòng dài xuống dòng):
//       so VÙNG MỰC của từng dòng. Khung Range.getClientRects là vùng nội dung font (gồm cả chỗ dành cho dấu và đuôi chữ dù chữ không có),
//       nên không so khung: đường đáy = top + ascent font (canvas fontBoundingBoxAscent); mực = [đáy − cao thật, đáy + đuôi thật] đo bằng
//       measureText trên chính đoạn chữ (dấu tiếng Việt, đuôi g/y/p — "850" không đuôi thì không tính). Báo khi hai vùng mực giao nhau
//       ≥ max(3 px, 10 % cỡ chữ nhỏ hơn) và ngang chồng > 4 px. Bản cũ so lõi 50 % khung → chỉ bắt khi hai dòng cách < ~0,6 em (sót 3 ca Ch.3).
// Hàm phải tự đủ (page.evaluate tuần tự hoá nó): không dùng biến bên ngoài.
function kiemDeTrongTrang() {
  const out = [], txt = (el) => (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 36);
  const dong = (el) => { const r = document.createRange(); r.selectNodeContents(el); return [...r.getClientRects()].filter((q) => q.width > 4 && q.height > 4); };
  const cv = document.createElement("canvas").getContext("2d"), doMuc = new Map();
  const muc = (el) => { const out = [], tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);   // vùng mực từng mảnh dòng (theo nút chữ: mỗi nút một font)
    for (let n; (n = tw.nextNode());) { const p = n.parentElement, v = (n.textContent || "").replace(/\s+/g, " ").trim(); if (!p || !v) continue;
      const cs = getComputedStyle(p), fs = parseFloat(cs.fontSize) || 16, chu = cs.textTransform === "uppercase" ? v.toUpperCase() : v;
      const f = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`, khoa = f + "\u0000" + chu;
      let m = doMuc.get(khoa); if (!m) { cv.font = f; const a = cv.measureText(chu); m = { asc: a.fontBoundingBoxAscent, len: a.actualBoundingBoxAscent, xuong: Math.max(0, a.actualBoundingBoxDescent) }; doMuc.set(khoa, m); }
      const r = document.createRange(); r.selectNodeContents(n);
      for (const q of r.getClientRects()) { if (q.width <= 4 || q.height <= 4) continue; const day = q.top + m.asc; out.push({ l: q.left, r: q.right, t: day - m.len, b: day + m.xuong, fs }); } }
    return out; };
  const coVe = (el) => { const tag = el.tagName.toLowerCase();
    if (["img", "canvas", "video"].includes(tag)) return true;
    if (el instanceof SVGElement) return !["svg", "g", "defs", "clippath", "lineargradient", "radialgradient", "stop"].includes(tag);
    const cs = getComputedStyle(el), bg = cs.backgroundColor.match(/[\d.]+/g);
    return cs.backgroundImage !== "none" || (bg && (bg.length < 4 || +bg[3] > 0.05)); };
  [...document.querySelectorAll("section.s")].forEach((s, si) => {
    s.scrollIntoView({ block: "start" });
    const S = s.getBoundingClientRect(), A = S.width * S.height, ten = (s.dataset.title || s.dataset.type || "").slice(0, 40);
    const T = [...s.querySelectorAll("[data-t]")].filter((t) => !t.closest(".bar") && getComputedStyle(t).visibility !== "hidden" && txt(t)).map((t) => ({ t, q: dong(t), m: muc(t) }));
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
      let de = false; for (const p of a.m) { for (const r of b.m) { const w = Math.min(p.r, r.r) - Math.max(p.l, r.l), h = Math.min(p.b, r.b) - Math.max(p.t, r.t);
        if (w > 4 && h >= Math.max(3, 0.1 * Math.min(p.fs, r.fs))) { de = true; break; } } if (de) break; }
      if (de) out.push(`⚠ slide ${si + 1} "${ten}": hai hộp chữ đè nhau — "${txt(a.t)}" và "${txt(b.t)}" — rút chữ, giữ một dòng (white-space: nowrap) hoặc dời khối`);
    }
  });
  window.scrollTo(0, 0);
  return out;
}

module.exports = { kiemDeTrongTrang };
