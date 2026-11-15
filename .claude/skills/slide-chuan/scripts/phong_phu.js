// ĐỘ PHONG PHÚ — CHỐNG "QUÁ ĐƠN GIẢN" (references/bo-cuc.md mục 7). Mặt trái của chống hổ lốn:
// deck sạch nhưng nghèo — nền giấy trơn, hình nét mảnh nhỏ giữa khoảng trống, slide chỉ có chữ (Chương 3, 15/11/2026:
// "vẫn còn quá đơn giản từ nền, layout, tiêu đề"). Đo trên trang, theo thẻ phong cách của bài (thiet-ke/phong-cach.json):
//   khối thị giác = lớp hình (img[data-l], trừ lớp nền data-loai="nen" và lớp phủ ≥ 95 % slide)
//                 + khối HTML có nền màu khác nền slide (thẻ, dải, ô số, đầu cột bảng…) — chữ trần không tính
//   độ phủ        = diện tích hợp các khối thị giác / diện tích slide (lưới 48 × 27 ô)
//   nền trơn      = slide nền sáng không có lớp nền (khối hình học, dải, ảnh phủ)
// Ngưỡng (ghi đè trong thẻ: "nguong": {...}): phuToiThieu 0,25 · tiLePhuToiThieu 0,7 (≥ 70 % slide đạt độ phủ) · tronToiDa 0,3.
// Thẻ khai "phongPhu": false (kèm lý do trong "ghiChuNguong") để tắt — chỉ khi chủ bài muốn tối giản thật.

function thuThapPhongPhu() {
  const lum = (c) => { const m = (c || "").match(/[\d.]+/g); if (!m) return 1; const [r, g, b] = m.slice(0, 3).map((v) => +v / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const trong = (c) => !c || c === "transparent" || /rgba\([^)]*,\s*0\)$/.test(c);
  const out = [];
  document.querySelectorAll("section.s").forEach((s, i) => {
    const R = s.getBoundingClientRect(), bg = getComputedStyle(s).backgroundColor, GX = 48, GY = 27, o = new Uint8Array(GX * GY);
    const phu = (r) => { const x0 = Math.max(0, Math.floor(((r.left - R.left) / R.width) * GX)), x1 = Math.min(GX, Math.ceil(((r.right - R.left) / R.width) * GX)),
      y0 = Math.max(0, Math.floor(((r.top - R.top) / R.height) * GY)), y1 = Math.min(GY, Math.ceil(((r.bottom - R.top) / R.height) * GY));
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) o[y * GX + x] = 1; };
    let coNen = false, lon = 0, anhPhu = false; const S = R.width * R.height;
    for (const im of s.querySelectorAll("img[data-l]")) { const r = im.getBoundingClientRect();
      if (im.dataset.loai !== "nen" && r.width * r.height >= 0.95 * S) anhPhu = true;   // ảnh / cảnh tràn mép = slide hero
      if (im.dataset.loai === "nen" || r.width * r.height >= 0.95 * S) { coNen = true; continue; } phu(r); lon = Math.max(lon, (r.width * r.height) / S); }
    for (const el of s.querySelectorAll("div, b, span, h1, mark")) { const c = getComputedStyle(el).backgroundColor;
      if (trong(c) || c === bg) continue; const r = el.getBoundingClientRect(); if (r.width * r.height < 0.003 * S) continue; phu(r); lon = Math.max(lon, (r.width * r.height) / S); }
    // nền trơn: nền sáng, không lớp nền, không mảng lớn nào (≥ 20 % slide — panel chia đôi, ảnh nửa slide) làm nền thay
    out.push({ slide: i + 1, mau: s.dataset.mau || "", phu: o.reduce((a, b) => a + b, 0) / o.length, tron: !coNen && lum(bg) > 0.5 && lon < 0.2, hero: anhPhu || lon >= (+s.dataset.heroNguong || 0.5) || s.hasAttribute("data-hero") });
  });
  return out;
}

const NGUONG_PP = { phuToiThieu: 0.25, tiLePhuToiThieu: 0.7, tronToiDa: 0.3 };

function danhGiaPhongPhu(slides, the, nguong = {}) {
  const loi = [];
  if (!the || the.phongPhu === false || !slides.length) return { loi, tom: "" };
  const ng = { ...NGUONG_PP, ...nguong }, n = slides.length;
  const thua = slides.filter((s) => s.phu < ng.phuToiThieu), tron = slides.filter((s) => s.tron);
  const tiDat = (n - thua.length) / n, tiTron = tron.length / n;
  if (tiDat < ng.tiLePhuToiThieu) loi.push(`◇ phong phú: chỉ ${Math.round(tiDat * 100)} % slide có khối thị giác ≥ ${Math.round(ng.phuToiThieu * 100)} % diện tích (cần ≥ ${Math.round(ng.tiLePhuToiThieu * 100)} %) — slide nghèo: ${thua.slice(0, 12).map((s) => `${s.slide} (${Math.round(s.phu * 100)} %)`).join(", ")} — thêm khối màu, thẻ tô đặc, minh hoạ lớn hoặc ảnh (bo-cuc.md mục 7)`);
  if (tiTron > ng.tronToiDa) loi.push(`◇ phong phú: ${tron.length}/${n} slide nền trơn (> ${Math.round(ng.tronToiDa * 100)} %) — slide ${tron.slice(0, 12).map((s) => s.slide).join(", ")} — đặt lớp nền có khối hình học / dải màu theo vai (he-nen.md)`);
  // slide HERO mỗi phần (bo-cuc.md mục 9): từ một slide mở phần tới trước slide mở phần kế tiếp phải có ≥ 1 slide nội dung mà một hình / ảnh
  // chiếm ≥ 50 % slide hoặc tràn mép — chỗ "wow" của phần; slide mở phần tự nó không tính.
  if (slides.some((s) => "hero" in s)) { const mp = slides.map((s, i) => (s.mau === "mo-phan" ? i : -1)).filter((i) => i >= 0);
    mp.forEach((i, k) => { const doan = slides.slice(i + 1, k + 1 < mp.length ? mp[k + 1] : slides.length).filter((s) => !/^(hoi|ket|bia)$/.test(s.mau));
      if (doan.length >= 3 && !doan.some((s) => s.hero)) loi.push(`◇ phong phú: phần mở ở slide ${slides[i].slide} (${doan.length} slide) không có slide hero — dựng một slide có cảnh / ảnh tràn mép hoặc hình chính ≥ 50 % (bo-cuc.md mục 9)`); }); }
  const tom = `Phong phú: ${n - thua.length}/${n} slide phủ ≥ ${Math.round(ng.phuToiThieu * 100)} % · ${tron.length} slide nền trơn · độ phủ trung bình ${Math.round((100 * slides.reduce((a, s) => a + s.phu, 0)) / n)} %`;
  return { loi, tom };
}

module.exports = { thuThapPhongPhu, danhGiaPhongPhu, NGUONG_PP };
