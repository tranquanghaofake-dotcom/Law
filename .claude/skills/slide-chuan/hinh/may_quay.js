// "MÁY QUAY" GIỮA HAI SLIDE (dùng chung cho hinh/build.js và scripts/xem_morph.js).
// Morph thường chỉ dời những vật CÙNG TÊN ở hai slide kề nhau; vật không có cặp thì mờ đi / mờ ra. Máy quay làm cả cảnh cùng chuyển động
// theo một hướng — như Flashslide: vật của slide trước trôi ra khỏi khung, vật của slide sau trôi vào, vật cùng tên (phần đầu trang, hình chính)
// đi đúng đường của nó. Cách làm (kỹ thuật Morph quen dùng): mỗi vật được nhân một bản đặt NGOÀI slide kia, cùng tên `!!…`.
//
//   <section data-cam="pan:1,0">        máy quay dời sang phải một khung (nội dung trôi sang trái); "pan:0,1" đi xuống; "pan:-1,0" lùi
//   <section data-cam="zoom:3,1500,520"> máy quay phóng 3 lần vào điểm (1500, 520) của slide trước: vật cũ nở ra rồi bay khỏi khung,
//                                        vật mới mọc ra từ điểm đó
//   data-sau="1.6" trên vật               thị sai: vật ở gần (> 1) trôi nhanh hơn, vật ở xa (< 1) chậm hơn; data-sau="0" = không theo máy quay
//                                        (vật giữ hiệu ứng vào riêng của nó, hiện ra sau khi máy quay dừng)
(function (g) {
  const SW = 1920, SH = 1080, LE = 480, NHO = 0.05;
  const camOf = (c) => {
    if (!c) return null; const [k, v = ""] = String(c).split(":"), a = v.split(",").map(Number);
    if (k === "pan") return { kind: "pan", dx: a[0] || 0, dy: a[1] || 0 };
    if (k === "zoom") return { kind: "zoom", k: a[0] > 1 ? a[0] : 2.5, cx: Number.isFinite(a[1]) ? a[1] : SW / 2, cy: Number.isFinite(a[2]) ? a[2] : SH / 2 };
    return null;
  };
  const trong = (r) => r.x < SW && r.x + r.w > 0 && r.y < SH && r.y + r.h > 0;
  // đẩy hộp theo hướng (ux, uy) tới khi nằm hẳn ngoài slide (cộng thêm 40 px cho bóng đổ)
  const dayRa = (r, ux, uy) => {
    if (!trong(r)) return r; const n = Math.hypot(ux, uy) || 1; ux /= n; uy /= n; const t = [];
    if (ux > 0) t.push((SW + 40 - r.x) / ux); if (ux < 0) t.push((r.x + r.w + 40) / -ux);
    if (uy > 0) t.push((SH + 40 - r.y) / uy); if (uy < 0) t.push((r.y + r.h + 40) / -uy);
    const s = Math.min(...t.filter((x) => x >= 0)); return { ...r, x: r.x + ux * s, y: r.y + uy * s };
  };
  // vật của slide TRƯỚC, nhìn từ khung của slide SAU (chỗ đặt bản nhân ở slide sau)
  const ra = (r, cam, sau = 1) => {
    if (cam.kind === "pan") { const dx = cam.dx * (SW + LE) * sau, dy = cam.dy * (SH + LE) * sau; return { ...dayRa({ ...r, x: r.x - dx, y: r.y - dy }, -cam.dx, -cam.dy), k: 1 }; }
    const k = cam.k, q = { x: SW / 2 + k * (r.x - cam.cx), y: SH / 2 + k * (r.y - cam.cy), w: r.w * k, h: r.h * k };
    let ux = q.x + q.w / 2 - SW / 2, uy = q.y + q.h / 2 - SH / 2; if (Math.hypot(ux, uy) < 1) { ux = 0; uy = -1; }
    return { ...dayRa(q, ux, uy), k };
  };
  // vật của slide SAU, nhìn từ khung của slide TRƯỚC (chỗ đặt bản nhân ở slide trước)
  const vao = (r, cam, sau = 1) => {
    if (cam.kind === "pan") { const dx = cam.dx * (SW + LE) * sau, dy = cam.dy * (SH + LE) * sau; return { ...dayRa({ ...r, x: r.x + dx, y: r.y + dy }, cam.dx, cam.dy), k: 1 }; }
    return { x: cam.cx + NHO * (r.x - SW / 2), y: cam.cy + NHO * (r.y - SH / 2), w: r.w * NHO, h: r.h * NHO, k: NHO };   // mọc ra từ điểm phóng (rất nhỏ, nằm sau mọi vật)
  };
  const MQ = { camOf, ra, vao, trong, SW, SH };
  if (typeof module !== "undefined" && module.exports) module.exports = MQ; else g.MQ = MQ;
})(typeof window !== "undefined" ? window : globalThis);
