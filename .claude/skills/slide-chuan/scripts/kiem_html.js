// KIỂM LỖI CHUNG cho slide thiết kế tự do (chạy trong trang bằng page.evaluate, sau khi font nạp).
// Hàm phải tự đủ — không dùng biến bên ngoài. Trả mảng chuỗi "slide N: …".
//   1. chữ hiện trên slide mà không nằm trong [data-t] (hoặc [data-prop]) → thành ảnh, không sửa được trong PowerPoint
//   2. <text> trong SVG → PowerPoint không sửa được, font dễ sai; viết chữ bằng HTML [data-t] đặt đè lên hình
//   3. dòng chữ của một [data-t] lòi ra ngoài hộp của chính nó (tràn) hoặc ra ngoài vùng an toàn của slide (lề 40 px)
//   4. slide không có hộp chữ [data-t][data-tieu-de] (thành placeholder tiêu đề: trình đọc màn hình, mục lục, bộ kiểm khả năng tiếp cận)
//   5. lớp ảnh [data-l] thiếu data-alt (hình trang trí: data-alt="Hình trang trí" → PowerPoint đánh dấu decorative)
function kiemHtml() {
  const out = [], txt = (s) => (s || "").replace(/\s+/g, " ").trim();
  [...document.querySelectorAll("section.s")].forEach((s, si) => {
    s.scrollIntoView({ block: "start" });
    const S = s.getBoundingClientRect(), n = si + 1, k = 1920 / (S.width || 1920);
    if (!s.querySelector("[data-t][data-tieu-de]")) out.push(`slide ${n}: không có tiêu đề — gắn data-tieu-de vào hộp chữ tiêu đề`);
    const hien = (el) => { for (let e = el; e && e !== s; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) return false; } return true; };
    // 1 + 2
    const tw = document.createTreeWalker(s, NodeFilter.SHOW_TEXT), mo = new Set();
    for (let t; (t = tw.nextNode());) { const v = txt(t.textContent), p = t.parentElement; if (!v || !p || p.closest("script,style,[data-t],[data-prop],[data-bo-kiem]")) continue;
      if (!hien(p)) continue;
      if (p.closest("svg")) { if (!mo.has("svg")) { mo.add("svg"); out.push(`slide ${n}: chữ trong SVG “${v.slice(0, 30)}” — PowerPoint không sửa được; viết bằng HTML [data-t] đặt lên hình`); } continue; }
      const r = document.createRange(); r.selectNodeContents(t); const q = r.getBoundingClientRect(); if (!q.width) continue;
      out.push(`slide ${n}: chữ “${v.slice(0, 30)}” không nằm trong [data-t] → thành ảnh, không sửa được`); }
    // 3
    for (const el of s.querySelectorAll("[data-t]")) { if (!hien(el) || !txt(el.textContent)) continue;
      const E = el.getBoundingClientRect(), r = document.createRange(); r.selectNodeContents(el);
      const Q = [...r.getClientRects()].filter((q) => q.width > 2 && q.height > 2); if (!Q.length) continue;
      const lo = (a, b) => Math.round((a - b) * k), ten = `“${txt(el.textContent).slice(0, 30)}”`;
      const fs = parseFloat(getComputedStyle(el).fontSize) || 30, du = Math.max(4, 0.3 * fs * k);   // vùng dấu tiếng Việt / nét chữ cỡ lớn cao hơn khoảng dòng: nới theo cỡ chữ
      const tran = Math.max(...Q.map((q) => Math.max(lo(q.right, E.right), lo(E.left, q.left), lo(q.bottom, E.bottom) - du)));
      if (tran > 3) out.push(`slide ${n}: ${ten} tràn khỏi hộp của nó ${tran} px — rút chữ, nới hộp hoặc tách slide`);
      const x0 = Math.min(...Q.map((q) => q.left)), x1 = Math.max(...Q.map((q) => q.right)), y0 = Math.min(...Q.map((q) => q.top)), y1 = Math.max(...Q.map((q) => q.bottom));
      const mep = Math.max(lo(S.left + 40 / k, x0), lo(x1, S.right - 40 / k), lo(S.top + 24 / k, y0), lo(y1, S.bottom - 24 / k));
      if (mep > 0 && !el.closest("[data-ngoai]")) out.push(`slide ${n}: ${ten} ra ngoài vùng an toàn ${mep} px (lề 40 px ngang, 24 px dọc)`); }
    // 5
    for (const el of s.querySelectorAll("[data-l]")) if (!el.dataset.alt && hien(el)) out.push(`slide ${n}: lớp ảnh "${el.dataset.l}" thiếu data-alt (mô tả; hình trang trí ghi data-alt="Hình trang trí")`);
  });
  return out;
}
module.exports = { kiemHtml };
