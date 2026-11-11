// TẦNG HÌNH ẢNH — phần chạy trong trang deck (nhúng bằng <script src="…/hinh/hinh.js"></script> ở cuối <body>).
//
// hinhKhiSanSang(fn)   chạy fn SAU KHI 4 font đã nạp. Mọi việc đặt chỗ theo kích thước chữ (đặt kính lúp lên một dòng, kẻ nét bút
//                      dưới một cụm từ…) phải làm trong đây: lúc trang vừa tải, chữ còn ở font tạm nên vị trí đo được là sai.
//                      Bộ dựng (hinh/build.js) chờ window.hinhSanSang xong rồi mới chụp.
// hinhCuaSo(S, g, fx, fy)   dựng bản xem trước cho một cửa sổ soi [data-w]: nhân bản phần tử nguồn (data-of) vào trong cửa sổ, phóng data-z lần,
//                      đặt điểm (fx, fy) của nguồn vào giữa cửa sổ, và ghi fx, fy vào data-fx / data-fy cho bộ dựng.
(function () {
  const faces = ["400 20px Anton", "400 20px 'Be Vietnam Pro'", "600 20px 'Be Vietnam Pro'", "800 20px 'Be Vietnam Pro'"];
  const loaded = Promise.all(faces.map((f) => document.fonts.load(f, "Việt"))).then(() => document.fonts.ready);
  let chain = loaded;
  window.hinhSanSang = loaded;
  window.hinhKhiSanSang = (fn) => { chain = chain.then(fn); window.hinhSanSang = chain; return chain; };
  window.hinhCuaSo = (S, g, fx, fy) => {
    const Z = +g.dataset.z || 1, R = g.offsetWidth / 2, RH = g.offsetHeight / 2, cl = S.querySelector(g.dataset.of).cloneNode(true);
    // bản sao chỉ để nhìn: bỏ mọi thuộc tính data-* để bộ dựng không coi nó là nội dung
    [cl, ...cl.querySelectorAll("*")].forEach((n) => [...n.attributes].forEach((a) => { if (a.name.startsWith("data-")) n.removeAttribute(a.name); }));
    cl.style.cssText += ";position:absolute;visibility:visible;margin:0;left:" + (R - fx * Z) + "px;top:" + (RH - fy * Z) + "px;transform:scale(" + Z + ");transform-origin:0 0";
    g.dataset.fx = fx; g.dataset.fy = fy; g.appendChild(cl);
  };
})();
