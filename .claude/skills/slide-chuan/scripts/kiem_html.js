// KIỂM LỖI CHUNG cho slide thiết kế tự do (chạy trong trang bằng page.evaluate, sau khi font nạp).
// Hàm phải tự đủ — không dùng biến bên ngoài. Trả mảng chuỗi "slide N: …".
//   1. chữ hiện trên slide mà không nằm trong [data-t] (hoặc [data-prop]) → thành ảnh, không sửa được trong PowerPoint
//   2. <text> trong SVG → PowerPoint không sửa được, font dễ sai; viết chữ bằng HTML [data-t] đặt đè lên hình
//   3. dòng chữ của một [data-t] lòi ra ngoài hộp của chính nó (tràn) hoặc ra ngoài vùng an toàn của slide (lề 40 px)
//   4. slide không có hộp chữ [data-t][data-tieu-de] (thành placeholder tiêu đề: trình đọc màn hình, mục lục, bộ kiểm khả năng tiếp cận)
//   5. lớp ảnh [data-l] thiếu data-alt (hình trang trí: data-alt="Hình trang trí" → PowerPoint đánh dấu decorative)
//   6. hộp chữ có nền riêng đè lên lớp ảnh mà thiếu data-l → mất nền trong PPTX
//   7. đoạn chữ tô nền bên trong hộp chữ (<mark>, <span style="background">) → PPTX chỉ giữ màu chữ, mất nền tô
//   9. chữ IN HOA nhiều dòng giãn dòng < 1,15 → dấu (hỏi, sắc, mũ) dòng dưới đè dấu nặng / móc dòng trên (máy đo tràn hộp không bắt)
//   8. khối có nền (vạch kẻ, ô màu) không là lớp ảnh, không là hộp chữ, nằm trên một lớp ảnh đứng trước nó → bị vẽ vào nền slide, lớp ảnh che mất trong PPTX
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
      { const cs = getComputedStyle(el), lh = parseFloat(cs.lineHeight) / fs, dong = Q.map((q) => q.top).sort((a, b) => a - b).reduce((d, t, i, m) => d + (i && t - m[i - 1] > 0.5 * fs / k ? 1 : 0), 1), hoa = cs.textTransform === "uppercase" || (txt(el.textContent).replace(/[^A-Za-zÀ-ỹ]/g, "").length > 3 && txt(el.textContent) === txt(el.textContent).toUpperCase());
        if (dong > 1 && hoa && lh < 1.15) out.push(`slide ${n}: ${ten} chữ in hoa ${dong} dòng, giãn dòng ${lh.toFixed(2)} < 1,15 — dấu tiếng Việt dòng dưới đè dấu dòng trên; đặt line-height ≥ 1,2`); }   // 9. bài An Gia 20/11/2026
      const x0 = Math.min(...Q.map((q) => q.left)), x1 = Math.max(...Q.map((q) => q.right)), y0 = Math.min(...Q.map((q) => q.top)), y1 = Math.max(...Q.map((q) => q.bottom));
      const mep = Math.max(lo(S.left + 40 / k, x0), lo(x1, S.right - 40 / k), lo(S.top + 24 / k, y0), lo(y1, S.bottom - 24 / k));
      if (mep > 0 && !el.closest("[data-ngoai]")) out.push(`slide ${n}: ${ten} ra ngoài vùng an toàn ${mep} px (lề 40 px ngang, 24 px dọc)`); }
    // 4b. lớp ảnh tràn khỏi mép slide (bị cắt khi chiếu: chân nhân vật, góc hình) — trừ hoạ tiết trang trí và lớp khai data-ngoai
    for (const el of s.querySelectorAll("[data-l]")) { if (!hien(el) || el.closest("[data-ngoai]") || el.dataset.alt === "Hình trang trí") continue;
      const R = el.getBoundingClientRect(); if (!R.width || !R.height) continue;
      const ra = Math.max(Math.round((S.left - R.left) * k), Math.round((R.right - S.right) * k), Math.round((S.top - R.top) * k), Math.round((R.bottom - S.bottom) * k));
      if (ra > 4) out.push(`slide ${n}: lớp ảnh "${el.dataset.l}" tràn khỏi mép slide ${ra} px — bị cắt khi chiếu; dời / thu hình (cố ý tràn mép thì gắn data-ngoai)`); }
    // 6. hộp chữ có NỀN RIÊNG (viên nhãn, chip, ô) đè lên một lớp ảnh đứng trước nó mà bản thân không có data-l: build vẽ nền đó vào ảnh nền slide,
    //    lớp ảnh nằm trên che mất → trong PPTX chỉ còn chữ (thường là chữ sáng trên nền sáng). Gắn data-l + data-alt cho chính hộp chữ.
    const coNen = (el) => { const c = getComputedStyle(el).backgroundColor; return c && c !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(c); };
    for (const el of s.querySelectorAll("[data-t]:not([data-l])")) { if (!hien(el) || !coNen(el)) continue; const R = el.getBoundingClientRect();
      const lay = [...s.querySelectorAll("[data-l]")].find((L) => L !== el && !L.contains(el) && !el.contains(L) && (el.compareDocumentPosition(L) & Node.DOCUMENT_POSITION_PRECEDING) && (() => { const Q = L.getBoundingClientRect(); return Q.left < R.right && Q.right > R.left && Q.top < R.bottom && Q.bottom > R.top; })());
      if (lay) out.push(`slide ${n}: hộp chữ “${txt(el.textContent).slice(0, 30)}” có nền riêng nằm trên lớp ảnh "${lay.dataset.l}" — trong PPTX nền bị lớp ảnh che mất; gắn thêm data-l + data-alt cho chính hộp chữ`); }
    // 7. đoạn chữ có NỀN TÔ bên trong một hộp chữ (mark, span highlight): PowerPoint giữ màu chữ của từng đoạn nhưng không giữ nền tô,
    //    nên đoạn được "tô dạ quang" trên trang HTML thành chữ thường (thường là chữ tối trên nền tối). Nhấn bằng màu chữ, hoặc tách hộp riêng có data-l.
    for (const el of s.querySelectorAll("[data-t]")) { if (!hien(el)) continue;
      for (const d of el.querySelectorAll("*")) { if (d.closest("[data-t]") !== el || !coNen(d) || !txt(d.textContent)) continue;
        out.push(`slide ${n}: đoạn “${txt(d.textContent).slice(0, 30)}” trong hộp chữ “${txt(el.textContent).slice(0, 24)}” có nền tô riêng (<${d.tagName.toLowerCase()}>) — PPTX không giữ nền tô của một đoạn chữ; nhấn bằng màu chữ, hoặc tách thành hộp riêng có data-l`); } }
    // 8. khối trang trí có NỀN (vạch kẻ giữa các dòng, ô màu) mà không phải lớp ảnh [data-l] cũng không phải hộp chữ [data-t]: build vẽ nó vào ảnh nền slide,
    //    nên lớp ảnh (thẻ, panel) đứng trước nó trong DOM mà chồng lên sẽ che mất trong PPTX (HTML vẫn thấy). Gắn data-l + data-alt cho khối đó.
    //    Bỏ qua lớp hình nền toàn slide (data-loai="nen") — phần đục của nó không đo được ở đây.
    for (const el of s.querySelectorAll("*")) { if (el.closest("[data-l],[data-t],svg") || el.querySelector("[data-t],[data-l]") || !hien(el) || !coNen(el)) continue;
      const R = el.getBoundingClientRect(); if (R.width < 1 || R.height < 1) continue;
      const lay = [...s.querySelectorAll("[data-l]")].find((L) => L.dataset.loai !== "nen" && !L.contains(el) && (el.compareDocumentPosition(L) & Node.DOCUMENT_POSITION_PRECEDING) && (() => { const Q = L.getBoundingClientRect(); return Q.left < R.right && Q.right > R.left && Q.top < R.bottom && Q.bottom > R.top; })());
      if (lay) out.push(`slide ${n}: khối "${(el.className && el.className.baseVal == null ? el.className : el.tagName.toLowerCase()).toString().split(" ")[0]}" có nền nằm trên lớp ảnh "${lay.dataset.l}" — trong PPTX bị vẽ vào nền slide và bị lớp ảnh che mất; gắn data-l + data-alt cho khối đó`); }
    // 5
    for (const el of s.querySelectorAll("[data-l]")) if (!el.dataset.alt && hien(el)) out.push(`slide ${n}: lớp ảnh "${el.dataset.l}" thiếu data-alt (mô tả; hình trang trí ghi data-alt="Hình trang trí")`);
  });
  return out;
}
module.exports = { kiemHtml };
