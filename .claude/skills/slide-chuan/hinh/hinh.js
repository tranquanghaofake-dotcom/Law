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
  // CĂN LỀ QUANG HỌC: chữ trưng bày (≥ 48 px, canh trái) có khoảng trống trước nét của chữ đầu (Anton "N" ~7 px ở 120 px) → nét chữ
  // thụt vào so với dòng chữ nhỏ cùng lề. Dịch hộp chữ sang trái đúng khoảng đó (đo bằng canvas measureText) để NÉT chữ thẳng lề.
  // Chạy đầu tiên trong chuỗi sau khi font nạp — trước mọi việc đặt chỗ theo vị trí chữ (kính lúp, nét bút).
  // vẽ ký tự lên canvas rồi quét cột có nét đầu tiên (measureText().actualBoundingBoxLeft lệch với nét thật ở vài chữ Anton)
  const netDau = (ch, font, px) => { const pad = Math.ceil(px * 0.3), W = Math.ceil(px * 1.6), H = Math.ceil(px * 1.6), c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d"); g.font = font; g.textBaseline = "alphabetic"; g.fillStyle = "#000"; g.fillText(ch, pad, Math.round(px * 1.15));
    const d = g.getImageData(0, 0, W, H).data; for (let x = 0; x < W; x++) for (let y = 0; y < H; y++) if (d[(y * W + x) * 4 + 3] > 96) return x - pad; return 0; };
  // chỉ tính XOAY thật (thuộc tính rotate, hoặc ma trận transform có thành phần xoay) — scale / dịch của hiệu ứng vào (pop, rise) không tính
  const coXoay = (c) => { const m = (c.transform.match(/matrix\(([^)]+)\)/) || [])[1]; return (c.rotate && c.rotate !== "none" && c.rotate !== "0deg") || (m && Math.abs(+m.split(",")[1]) > 0.01); };
  const canLeQuangHoc = () => {
    for (const el of document.querySelectorAll("section.s [data-t]")) try { const cs = getComputedStyle(el), px = parseFloat(cs.fontSize);
      if (!(px >= 48) || !["left", "start"].includes(cs.textAlign) || el.dataset.quangHoc) continue;
      let a = el, xoay = false; while (a && !a.matches("section.s")) { if (coXoay(getComputedStyle(a))) { xoay = true; break; } a = a.parentElement; }
      if (xoay) continue;
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n, ch = "";
      while (!ch && (n = w.nextNode())) ch = (n.textContent.match(/\S/u) || [""])[0];   // nút chữ đầu tiên có ký tự thấy được (đo đúng font của chính nút đó)
      if (!ch) continue; const pc = getComputedStyle(n.parentElement || el);
      if (pc.textTransform === "uppercase") ch = ch.toLocaleUpperCase("vi");
      const lech = netDau(ch, `${pc.fontStyle} ${pc.fontWeight} ${parseFloat(pc.fontSize)}px ${pc.fontFamily}`, parseFloat(pc.fontSize));   // > 0: nét chữ bắt đầu sau điểm gốc
      if (lech > 0.75 && lech < px * 0.2) { el.style.marginLeft = `${(parseFloat(cs.marginLeft) || 0) - lech}px`; el.dataset.quangHoc = lech.toFixed(1); } } catch (e) { el.dataset.quangHocLoi = String(e && e.message || e).slice(0, 80); } };   // một phần tử lỗi không chặn cả trang
  window.hinhCanLeQuangHoc = canLeQuangHoc;   // dung.js gọi lại sau hinhTuGan: slide từ bộ mẫu chỉ có data-t sau bước tự gắn nhãn (phần tử đã dịch thì bỏ qua)
  // GIỮ LIỀN TỪ GHÉP (mọi cỡ chữ; trước 11/2026 chỉ chữ ≥ 40 px — chữ thân vẫn tách "trợ / cấp"): trình duyệt không biết "hệ thống" là một từ → từng ngắt "rời hệ / thống".
  // Thay dấu cách giữa hai âm tiết của từ ghép thường gặp bằng dấu cách không ngắt (U+00A0); build.js chép đúng dòng sang PPTX.
  const TU_GHEP = ("hệ thống|lao động|bảo hiểm|xã hội|an sinh|y tế|thất nghiệp|hưu trí|tử tuất|ốm đau|thai sản|lương hưu|tiền lương|thu nhập|trợ cấp|một lần|"
    + "doanh nghiệp|hợp đồng|pháp luật|quy định|điều kiện|nghĩa vụ|quyền lợi|giao dịch|vô hiệu|tài sản|nhà nước|cơ quan|toà án|tòa án|bản án|thế chấp|"
    + "đất đai|chứng nhận|công ty|cổ đông|cổ phần|biểu quyết|nghị quyết|nghị định|thông tư|hiệu lực|thực trạng|kiến nghị|giải pháp|chế độ|bình quân|"
    + "thời gian|thời hạn|người dân|việc làm|làm việc|đi lùi|chính sách|quỹ bảo|tham gia|bắt buộc|tự nguyện|phạm vi|đối tượng|hình sự|dân sự|hành chính|"
    + "trách nhiệm|bồi thường|thiệt hại|vi phạm|xử phạt|tố tụng|khởi kiện|ngân hàng|tín dụng|hoá đơn|hóa đơn|thuế suất|quốc tế|điều ước|lãnh thổ|"
    + "thông qua|giao kết|chấm dứt|sử dụng|ngay tình|chứng cứ|xét xử|sơ thẩm|phúc thẩm|giám đốc|thi hành|án lệ|thời hiệu|khởi tố|điều tra|truy tố|bị cáo|bị hại|"
    + "kinh doanh|doanh thu|lợi nhuận|phụ cấp|ngân sách|quốc hội|chính phủ|viện kiểm sát|người mua|người bán|đăng ký|giấy phép|công chứng|chứng thực").split("|");
  const reGhep = new RegExp(`(?<![\\p{L}\\p{M}])(?:${TU_GHEP.map((t) => t.replace(" ", "\\s+")).join("|")})(?![\\p{L}\\p{M}])`, "giu");
  // mọi cỡ chữ: số hiệu pháp lý ("Điều 2", "khoản 1", "điểm m" — từng tách "điểm / m") và số + đơn vị ("15 năm", "75 %", "800.000 người")
  const reLuat = /(?<![\p{L}\p{M}])(Điều|điều|Khoản|khoản|Điểm|điểm|Chương|chương|Mục|mục|Đ\.)\s+(\d+[a-zđ]?|[a-zđ])(?![\p{L}\p{M}\d])/gu;
  const reSo = /(\d[\d.,]*)\s+(%|triệu|tỷ|tỉ|nghìn|ngàn|năm|tháng|ngày|tuổi|người|đồng|đ)(?![\p{L}\p{M}])/gu;
  // mốc thời gian: "từ 01/7/2025", "đến 2030", "tháng 9/2025", "năm 2024" — từng tách "từ / 01/7/2025" ở cuối dòng
  const reNgay = /(?<![\p{L}\p{M}])(từ|Từ|đến|tới|ngày|trước|sau|tháng|năm|Năm)\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{1,2}\/\d{4}|\d{4})(?![\p{L}\p{M}\d\/])/gu;
  const giuTuGhep = () => {
    for (const S of document.querySelectorAll("section.s")) { const w = document.createTreeWalker(S, NodeFilter.SHOW_TEXT);
      for (let n; (n = w.nextNode());) { const p = n.parentElement; if (!p || !/\s/.test(n.textContent) || p.closest("svg, script, style")) continue;
        const moi = n.textContent.normalize("NFC").replace(reGhep, (m) => m.replace(/\s+/g, "\u00a0")).replace(reLuat, "$1\u00a0$2").replace(reSo, "$1\u00a0$2").replace(reNgay, "$1\u00a0$2");
        if (moi !== n.textContent) n.textContent = moi; } } };
  window.hinhKhiSanSang(giuTuGhep);   // trước căn lề quang học và mọi việc đặt chỗ theo vị trí chữ
  window.hinhKhiSanSang(canLeQuangHoc);
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
  // tờ giấy ghim (pin trong deck.json): tìm chỗ trống không chạm chữ / thẻ / hình, ưu tiên bên phải rồi từ trên xuống; không có → ẩn + data-khong-cho (dung.js báo)
  const vungChiem = (S, bo, le) => { const B = S.getBoundingClientRect(), k = S.offsetWidth / B.width, v = [];
    for (const el of S.querySelectorAll(".h, .k, .sub, .note, .card, table, .stat, .body svg, .body img, [data-in], .emo, .da-art, .bar, .zml")) {
      if (bo(el)) continue; let q = el.getBoundingClientRect(); if (!q.width || !q.height) continue;
      if (el.matches(".h, .k, .sub, .note")) { const r = document.createRange(); r.selectNodeContents(el); const c = r.getBoundingClientRect(); if (c.width) q = { left: Math.min(c.left, q.left), top: q.top, right: c.right, bottom: q.bottom }; }   // khối chữ: hộp rộng hết dòng, chỉ tính tới nét chữ cuối
      v.push({ l: (q.left - B.left) * k - le, t: (q.top - B.top) * k - le, r: (q.right - B.left) * k + le, b: (q.bottom - B.top) * k + le }); }
    return v; };
  window.hinhDatGiayGhim = (S) => {
    const g = S.querySelector(".ghim-giay[data-ghim]"); if (!g) return;
    const vat = vungChiem(S, (el) => el.closest(".ghim-giay, .da-vat"), 22), w = g.offsetWidth, h = g.offsetHeight, H = S.offsetHeight;
    const trung = (l, t) => vat.some((q) => l < q.r && l + w > q.l && t < q.b && t + h > q.t);
    // ưu tiên CHỖ CỐ ĐỊNH: góc dưới phải (mép phải thẳng lề nội dung) — tờ ghim là câu chốt, người xem quen nhìn một chỗ; rồi góc trên phải cạnh tiêu đề; rồi tìm dần
    const R0 = 1920 - 110 - w, day = H - 44 - h;
    for (const [l, t] of [[R0, day], [R0, 96]]) if (!trung(l, t)) { g.style.left = l + "px"; g.style.top = t + "px"; return; }
    for (const l of [R0, R0 - 160, 1100, 820, 540, 110]) for (let t = day; t >= 96; t -= 12) if (!trung(l, t)) { g.style.left = l + "px"; g.style.top = t + "px"; return; }
    g.dataset.khongCho = "1"; g.style.display = "none";
  };
  // đồ vật tiền cảnh của da (.da-vat[data-da-vat], hinh/da.js): đặt vào góc trống đầu tiên không chạm chữ / thẻ / hình; không còn chỗ thì bỏ
  window.hinhDatVatDa = (S) => {
    const v = S.querySelector(".da-vat[data-da-vat]"); if (!v) return;
    const B = S.getBoundingClientRect(), k = S.offsetWidth / B.width, s = v.offsetWidth, vat = [];
    for (const el of S.querySelectorAll(".h, .k, .sub, .note, .card, table, .stat, .body svg, .body img, [data-in], .emo, .da-art, .ghim-giay")) {
      if (el.closest(".da-vat") || el.matches(".ghim-giay[data-khong-cho]")) continue; const q = el.getBoundingClientRect(); if (!q.width || !q.height) continue;
      vat.push({ l: (q.left - B.left) * k - 30, t: (q.top - B.top) * k - 30, r: (q.right - B.left) * k + 30, b: (q.bottom - B.top) * k + 30 }); }
    const trung = (l, t) => vat.some((q) => l < q.r && l + s > q.l && t < q.b && t + s > q.t);
    const thu = [[1660, 830], [1660, 110], [1480, 830], [70, 840], [1660, 470], [1300, 840]];
    const ok = thu.find(([l, t]) => !trung(l, t));
    if (!ok) { v.remove(); return; }
    v.style.left = ok[0] + "px"; v.style.top = ok[1] + "px"; v.style.rotate = (ok[0] > 900 ? -8 : 7) + "deg";
  };
  window.hinhCuaSo = (S, g, fx, fy) => {
    const Z = +g.dataset.z || 1, R = g.offsetWidth / 2, RH = g.offsetHeight / 2, cl = S.querySelector(g.dataset.of).cloneNode(true);
    // bản sao chỉ để nhìn: bỏ mọi thuộc tính data-* để bộ dựng không coi nó là nội dung
    [cl, ...cl.querySelectorAll("*")].forEach((n) => [...n.attributes].forEach((a) => { if (a.name.startsWith("data-")) n.removeAttribute(a.name); }));
    cl.style.cssText += ";position:absolute;visibility:visible;margin:0;left:" + (R - fx * Z) + "px;top:" + (RH - fy * Z) + "px;transform:scale(" + Z + ");transform-origin:0 0";
    g.dataset.fx = fx; g.dataset.fy = fy; g.appendChild(cl);
  };
})();
