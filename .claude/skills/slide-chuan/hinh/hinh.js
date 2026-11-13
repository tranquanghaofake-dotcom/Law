// TẦNG HÌNH ẢNH — phần chạy trong trang deck (nhúng bằng <script src="…/hinh/hinh.js"></script> ở cuối <body>).
//
// hinhKhiSanSang(fn)   chạy fn SAU KHI 4 font đã nạp. Mọi việc đặt chỗ theo kích thước chữ (đặt kính lúp lên một dòng, kẻ nét bút
//                      dưới một cụm từ…) phải làm trong đây: lúc trang vừa tải, chữ còn ở font tạm nên vị trí đo được là sai.
//                      Bộ dựng (hinh/build.js) chờ window.hinhSanSang xong rồi mới chụp.
// hinhDatHinhDan(S)    hình dán trang trí (.emo[data-tu-dat], do dung.js gắn khi không ghi emojiPos) đè lên chữ thì dời sang chỗ trống gần nhất
//                      trong lưới ứng viên; chữ trang trí trong suốt (số chương viền rỗng, dấu "?" khổng lồ) không tính là chữ.
// hinhCuaSo(S, g, fx, fy)   dựng bản xem trước cho một cửa sổ soi [data-w]: nhân bản phần tử nguồn (data-of) vào trong cửa sổ, phóng data-z lần,
//                      đặt điểm (fx, fy) của nguồn vào giữa cửa sổ, và ghi fx, fy vào data-fx / data-fy cho bộ dựng.
(function () {
  const faces = ["400 20px Anton", "400 20px 'Be Vietnam Pro'", "600 20px 'Be Vietnam Pro'", "800 20px 'Be Vietnam Pro'"];
  const loaded = Promise.all(faces.map((f) => document.fonts.load(f, "Việt"))).then(() => document.fonts.ready);
  let chain = loaded;
  window.hinhSanSang = loaded;
  window.hinhKhiSanSang = (fn) => { chain = chain.then(fn); window.hinhSanSang = chain; return chain; };
  window.hinhDatHinhDan = (S) => {
    const em = [...S.querySelectorAll(".emo[data-tu-dat]")]; if (!em.length) return;
    const B = S.getBoundingClientRect(), W = S.offsetWidth, H = S.offsetHeight, k = W / B.width, chu = [], dat = [];
    const trongSuot = (c) => { const m = c.match(/[\d.]+/g); return m && m.length === 4 && +m[3] < 0.05; };
    const w = document.createTreeWalker(S, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode());) { const p = n.parentElement;
      if (!n.textContent.trim() || !p || p.closest(".emo, .bar, .prog") || getComputedStyle(p).visibility === "hidden" || trongSuot(getComputedStyle(p).color)) continue;
      const r = document.createRange(); r.selectNodeContents(n);
      for (const q of r.getClientRects()) if (q.width > 2) chu.push({ l: (q.left - B.left) * k - 24, t: (q.top - B.top) * k - 24, r: (q.right - B.left) * k + 24, b: (q.bottom - B.top) * k + 24 }); }
    for (const e of em) {
      const s = e.offsetWidth, l0 = parseFloat(e.style.left), t0 = parseFloat(e.style.top);
      const trung = (l, t) => [...chu, ...dat].some((q) => l < q.r && l + s > q.l && t < q.b && t + s > q.t);
      const thu = [[l0, t0]]; for (const t of [t0, 560, 420, 700, 280, 760]) for (const l of [l0, 1200, 1350, 1500, 1050, 900]) thu.push([l, t]);
      const ok = thu.find(([l, t]) => l >= 40 && t >= 110 && l + s <= W - 40 && t + s <= H - 40 && !trung(l, t));
      if (ok) { e.style.left = ok[0] + "px"; e.style.top = ok[1] + "px"; }
      const l = parseFloat(e.style.left), t = parseFloat(e.style.top); dat.push({ l, t, r: l + s, b: t + s });
    }
  };
  window.hinhCuaSo = (S, g, fx, fy) => {
    const Z = +g.dataset.z || 1, R = g.offsetWidth / 2, RH = g.offsetHeight / 2, cl = S.querySelector(g.dataset.of).cloneNode(true);
    // bản sao chỉ để nhìn: bỏ mọi thuộc tính data-* để bộ dựng không coi nó là nội dung
    [cl, ...cl.querySelectorAll("*")].forEach((n) => [...n.attributes].forEach((a) => { if (a.name.startsWith("data-")) n.removeAttribute(a.name); }));
    cl.style.cssText += ";position:absolute;visibility:visible;margin:0;left:" + (R - fx * Z) + "px;top:" + (RH - fy * Z) + "px;transform:scale(" + Z + ");transform-origin:0 0";
    g.dataset.fx = fx; g.dataset.fy = fy; g.appendChild(cl);
  };
})();
