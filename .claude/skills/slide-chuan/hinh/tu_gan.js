// TẦNG HÌNH ẢNH — TỰ GẮN NHÃN cho slide sinh từ bộ mẫu (stage/templates.js), chạy trong trang trước khi dựng PPTX.
// Bộ mẫu chỉ biết "khối nào vào trước, khối nào vào sau" (data-in + --i). Hàm này đọc slide đã dàn xong và quyết định:
//   · khối chữ nào thành HỘP CHỮ sửa được (data-t);
//   · khối nào có hình (nền, viền, bóng, icon, ảnh, chấm đầu dòng) thành LỚP ẢNH có hiệu ứng vào (data-l + data-a + data-at);
//   · chữ trang trí (mờ dưới 30 %, viết dọc, nằm trong khối bị co / kéo) để lại làm ảnh (data-prop);
//   · thanh tiến độ, tên bài, số trang mang tên Morph cố định để chạy liền mạch qua các slide.
// Slide viết tay (cảnh riêng: mở sách, kính lúp…) không có thuộc tính data-tu nên không bị đụng tới.
(function () {
  const mtx = (t) => { const m = t && t.match(/^matrix\(([^)]+)\)/); if (!m) return null; const [a, b, c, d, tx, ty] = m[1].split(",").map(Number); return { a, b, c, d, tx, ty }; };
  const px = (s) => (String(s).match(/-?\d*\.?\d+(?=px)/g) || []).map(Number);
  // bóng đổ chìa ra ngoài hộp bao nhiêu px (box-shadow, filter: drop-shadow)
  const shadow = (cs) => { let p = 0; for (const part of [cs.boxShadow, cs.filter]) { if (!part || part === "none") continue;
    for (const seg of part.split(/,(?![^(]*\))/)) { if (/inset/.test(seg)) continue; const v = px(seg); if (v.length >= 2) p = Math.max(p, Math.max(Math.abs(v[0]), Math.abs(v[1])) + (v[2] || 0) + (v[3] || 0)); } } return p; };
  const clear = (c) => !c || c === "transparent" || /,\s*0\)$/.test(c);
  const painted = (cs) => !clear(cs.backgroundColor) || cs.backgroundImage !== "none" || cs.boxShadow !== "none"
    || ["Top", "Right", "Bottom", "Left"].some((k) => parseFloat(cs["border" + k + "Width"]) > 0 && cs["border" + k + "Style"] !== "none" && !clear(cs["border" + k + "Color"]));
  const pseudo = (el) => ["::before", "::after"].some((p) => { const cs = getComputedStyle(el, p); return cs.content && cs.content !== "none" && cs.content !== "normal" && cs.display !== "none" && (painted(cs) || /[^"\s]/.test(cs.content)); });
  const GFX = "img, svg, canvas, video";

  window.hinhTuGan = function (S, opt) {
    opt = Object.assign({ nhip: 110, tre: 160 }, opt || {});
    // 1) transform chỉ gồm phép xoay → chuyển sang thuộc tính `rotate` (bộ dựng tắt `rotate` để đo chữ rồi tự xoay hộp chữ, lớp ảnh)
    S.querySelectorAll("*").forEach((el) => { if (el.closest("svg")) return; const m = mtx(getComputedStyle(el).transform); if (!m) return;
      const rotOnly = Math.abs(m.tx) < 0.01 && Math.abs(m.ty) < 0.01 && Math.abs(m.a - m.d) < 1e-3 && Math.abs(m.b + m.c) < 1e-3 && Math.abs(m.a * m.a + m.b * m.b - 1) < 1e-3;
      if (!rotOnly || (Math.abs(m.b) < 1e-4 && m.a > 0)) return;
      const cur = getComputedStyle(el).rotate; el.style.transform = "none"; el.style.rotate = ((cur && cur !== "none" ? parseFloat(cur) : 0) + Math.atan2(m.b, m.a) * 180 / Math.PI).toFixed(3) + "deg"; });

    // 2) khối chữ → data-t (khối gần nhất không phải inline chứa chữ đó)
    const blocks = new Set(), tw = document.createTreeWalker(S, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
      if (!/\S/.test(n.textContent)) continue;
      let el = n.parentElement; if (!el || el.closest("svg, script, style, [data-prop], [data-w]")) continue;
      const c0 = getComputedStyle(el); if (c0.display === "none" || c0.visibility === "hidden") continue;
      while (el !== S && getComputedStyle(el).display === "inline") el = el.parentElement;
      if (el === S || blocks.has(el)) continue;
      let op = 1, bad = false;
      for (let a = el; a && a !== S; a = a.parentElement) { const c = getComputedStyle(a), m = mtx(c.transform); op *= parseFloat(c.opacity);
        if (c.writingMode !== "horizontal-tb" || (c.scale && c.scale !== "none")) bad = true;
        if (m && (Math.abs(m.a - 1) > 1e-3 || Math.abs(m.d - 1) > 1e-3 || Math.abs(m.b) > 1e-3 || Math.abs(m.c) > 1e-3)) bad = true; }   // còn co / kéo / xoay lẫn dời: không đo chữ chính xác được
      // chữ rỗng ruột (chỉ có nét viền) hoặc trong suốt: là hình trang trí, PowerPoint không dựng lại được bằng hộp chữ
      const c1 = getComputedStyle(el); if (parseFloat(c1.webkitTextStrokeWidth) > 0 || clear(c1.webkitTextFillColor) || clear(c1.color)) bad = true;
      if (bad || op < 0.3) { el.setAttribute("data-prop", ""); continue; }
      blocks.add(el); el.setAttribute("data-t", "");
    }

    // 3) khối vào theo thứ tự (data-in): có hình → lớp ảnh có hiệu ứng; chỉ có chữ → hiệu ứng gắn thẳng lên từng hộp chữ
    const mine = (el, c) => c.closest("[data-in]") === el;                   // c thuộc khối này, không thuộc khối con vào riêng
    S.querySelectorAll("[data-in]").forEach((el) => {
      const i = +el.style.getPropertyValue("--i") || 0, at = Math.round(opt.tre + i * opt.nhip), fx = el.getAttribute("data-in") === "pop" ? "pop" : "rise", fxL = opt.fx && fx === "rise" ? opt.fx : fx;   // fxL: kiểu hiện thẻ của da (đóng dấu, lật lịch, trượt…)
      const cs = getComputedStyle(el), R = el.getBoundingClientRect(); let vis = el.matches(GFX) || painted(cs) || pseudo(el), pad = shadow(cs);
      for (const c of el.querySelectorAll("*")) { if (!mine(el, c)) continue; if (c.matches(GFX)) vis = true; if (c.closest("svg") && !c.matches("svg")) continue;
        const k = getComputedStyle(c); if (k.display === "none" || k.visibility === "hidden") continue; const pv = painted(k) || pseudo(c) || c.matches(GFX); if (pv) vis = true;
        const q = c.getBoundingClientRect(); if (!q.width && !q.height) continue;
        if (pv) pad = Math.max(pad, Math.max(0, R.left - q.left, q.right - R.right, R.top - q.top, q.bottom - R.bottom) + shadow(k)); }
      if (vis) { el.setAttribute("data-l", "khoi-" + (i + 1)); el.setAttribute("data-a", fxL); el.setAttribute("data-at", at); el.setAttribute("data-pad", Math.min(260, Math.ceil(pad) + 3));
        // chữ thay thế cho lớp ảnh trong PowerPoint: lấy từ aria-label / alt của ảnh trong khối (photoAlt, items[].alt) — trước đây mọi ảnh đều "Hình minh hoạ"
        if (!el.hasAttribute("data-alt")) { const a = [el, ...el.querySelectorAll("[aria-label], img[alt]")].filter((c) => c === el || mine(el, c)).map((c) => c.getAttribute("aria-label") || c.getAttribute("alt") || "").find((t) => t.trim()); if (a) el.setAttribute("data-alt", a.trim().slice(0, 250)); } }
      else el.setAttribute("data-chu", fx + "," + at);
    });
    blocks.forEach((tb) => { const host = tb.closest("[data-in]"); if (!host || host.hasAttribute("data-l") || tb.hasAttribute("data-a")) return;
      const [fx, at] = host.getAttribute("data-chu").split(","); tb.setAttribute("data-a", fx); tb.setAttribute("data-at", at); });

    // 4) khung chung: thanh tiến độ, tên bài, số trang — cùng tên Morph ở mọi slide
    const prog = S.querySelector(":scope > .prog"); if (prog) { prog.setAttribute("data-l", "tien-do"); prog.setAttribute("data-m", "td"); prog.setAttribute("data-alt", "Tiến độ bài"); }
    const bar = S.querySelector(":scope > .bar"); if (bar) { const sp = bar.querySelector("span:not(.cnt)"), cnt = bar.querySelector(".cnt"); if (sp && sp.hasAttribute("data-t")) sp.setAttribute("data-m", "ten-bai"); if (cnt && cnt.hasAttribute("data-t")) cnt.setAttribute("data-m", "so-trang"); }
  };
})();
