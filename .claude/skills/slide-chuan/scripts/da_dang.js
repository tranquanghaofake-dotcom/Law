// ĐO ĐỘ ĐA DẠNG CỦA DECK: hệ nền, asset lặp lại, kiểu bảng.
// thuThap() chạy trong trang (Playwright page.evaluate) → mảng { slide, nen, asset[], bang[] }; danhGia() thuần, kiểm được bằng node:test.
// Khai báo trong HTML (khuyên dùng, rõ hơn máy đoán):
//   <section data-nen="dam|sang|chia|anh|hoa-tiet|…">   loại nền của slide
//   <img data-l … data-lap>                             hình cố ý lặp (cùng vai: logo, nhân vật xuyên suốt) — không tính lỗi lặp
//   <div data-bang="tra|dau|so|ma-tran|the|…">          kiểu bảng / trình bày dữ liệu
// Không khai báo: nền = màu nền section + các khối ≥ 25 % diện tích (màu, ảnh chụp .jpg/.webp hoặc img data-nen-anh; lớp SVG trong suốt không tính); bảng = <table> hoặc phần tử có class "bang…".
// Ngưỡng rút từ 54 mẫu tham chiếu (spec 2026-11-14 mục 11): một họ nền sáng 60–80 % deck, hoạ tiết đổi vị trí;
// ≤ 6 slide liền cùng nền CÙNG vị trí hoạ tiết; mỗi hình lặp ≤ 3 slide trừ motif có vai; ≥ 6 kiểu bảng/45 slide, một kiểu ≤ 40 % số bảng.
const NGUONG = { loaiNenToiThieu: 3, deckToiThieu: 12, tiLeNenToiDa: 0.8, lienToiDa: 6, assetToiDa: 3, bangCungKieu: 3, bangXetTiLe: 5, tiLeBangToiDa: 0.4, lienHoToiDa: 10, tieuDiemToiThieu: 0.25 };

function thuThap() {
  const out = [];
  document.querySelectorAll("section.s").forEach((s, i) => {
    const R = s.getBoundingClientRect(), A = R.width * R.height || 1, cs = getComputedStyle(s);
    let nen = s.dataset.nen, ho = nen ? nen.split(/[·@|]/)[0] : null;
    if (!nen) {
      const khoi = [];
      for (const el of s.querySelectorAll("*")) {
        if (el.closest("[data-t]") && !el.hasAttribute("data-l")) continue;
        const r = el.getBoundingClientRect(), dt = Math.max(0, Math.min(r.right, R.right) - Math.max(r.left, R.left)) * Math.max(0, Math.min(r.bottom, R.bottom) - Math.max(r.top, R.top));
        if (dt / A < 0.25) continue;
        const c = getComputedStyle(el);
        if (el.tagName === "IMG") { if (/\.(jpe?g|webp)(\?|$)/i.test(el.getAttribute("src") || "") || el.hasAttribute("data-nen-anh")) khoi.push("anh"); }
        else if (c.backgroundImage !== "none") khoi.push("hoa-tiet");
        else if (c.backgroundColor && !/rgba\(\d+, \d+, \d+, 0\)|transparent/.test(c.backgroundColor)) khoi.push(c.backgroundColor.replace(/\s/g, ""));
      }
      // hoạ tiết trang trí (data-alt="Hình trang trí"): tên hình + góc đặt → cùng họ nền nhưng đổi vị trí hoạ tiết là nền khác
      const goc = [...s.querySelectorAll('img[data-l][data-alt="Hình trang trí"]')].map((im) => { const r = im.getBoundingClientRect(), cx = (r.left + r.width / 2 - R.left) / R.width, cy = (r.top + r.height / 2 - R.top) / R.height;
        return "tt:" + (im.getAttribute("src") || "").split("/").pop() + "@" + (cy < 0.5 ? "tren-" : "duoi-") + (cx < 0.5 ? "trai" : "phai"); });
      ho = [cs.backgroundColor.replace(/\s/g, "") + (cs.backgroundImage !== "none" ? "+hoa-tiet" : ""), ...[...new Set(khoi)].sort()].join("|");
      nen = [ho, ...[...new Set(goc)].sort()].join("|");
    }
    const asset = [...s.querySelectorAll('img[data-l]:not([data-alt="Hình trang trí"])')].map((im) => (im.getAttribute("src") || "").split("/").pop() + (im.hasAttribute("data-lap") ? " (lặp)" : ""));
    const bang = [...s.querySelectorAll("[data-bang], table, [class~='bang'], [class^='bang'], [class~='tb']")].filter((el) => !el.parentElement.closest("[data-bang], table, [class~='bang'], [class^='bang'], [class~='tb']"))
      .map((el) => el.dataset.bang || (el.tagName === "TABLE" ? "table" : el.className.trim()));
    // TIÊU ĐIỂM: khối thị giác lớn nhất (hình không trang trí, bảng, chữ ≥ 120 px, mảng màu không phủ kín) / diện tích slide.
    // Mẫu chuyên nghiệp: hình chính 30–45 %; dưới 25 % là "hình cỡ icon lọt thỏm giữa nền" (nguon-hinh.md quy tắc 1). Slide cố ý chỉ có chữ: data-khong-hinh.
    const dt = (el) => { const r = el.getBoundingClientRect(); return (Math.max(0, Math.min(r.right, R.right) - Math.max(r.left, R.left)) * Math.max(0, Math.min(r.bottom, R.bottom) - Math.max(r.top, R.top))) / A; };
    let tieuDiem = 0;
    for (const el of s.querySelectorAll('img[data-l]:not([data-alt="Hình trang trí"]), [data-bang], table, [class~="tb"], [data-t]')) { if (el.matches("[data-t]") && parseFloat(getComputedStyle(el).fontSize) < 120) continue;
      const a = dt(el); if (el.tagName === "IMG" && a >= 0.95 && !/\.(jpe?g|webp)(\?|$)/i.test(el.getAttribute("src") || "")) continue;   // lớp SVG trong suốt phủ cả slide (mũi tên, lưới): khung ≠ phần có nét
      tieuDiem = Math.max(tieuDiem, a); }
    for (const el of s.querySelectorAll("div")) { const c = getComputedStyle(el).backgroundColor, a = dt(el); if (!/rgba\(\d+, \d+, \d+, 0\)|transparent/.test(c) && a < 0.9 && !el.closest("[data-t]")) tieuDiem = Math.max(tieuDiem, a); }
    out.push({ slide: i + 1, nen, ho, asset: [...new Set(asset)], bang, tieuDiem: +tieuDiem.toFixed(3), khongHinh: s.hasAttribute("data-khong-hinh") || nen.startsWith("N2") });
  });
  return out;
}

function danhGia(slides, ng = NGUONG) {
  const loi = [], n = slides.length, dem = {}, hoCua = (s) => s.ho || s.nen;
  for (const s of slides) dem[hoCua(s)] = (dem[hoCua(s)] || 0) + 1;
  const loai = Object.keys(dem).length, [nenNhieu, soNhieu] = Object.entries(dem).sort((a, b) => b[1] - a[1])[0] || ["", 0];
  if (n >= ng.deckToiThieu && loai < ng.loaiNenToiThieu) loi.push(`◇ nền: chỉ ${loai} loại nền cho ${n} slide (cần ≥ ${ng.loaiNenToiThieu}: N1 sáng, N2 đậm, N3 chia mảng, N4 ảnh… — references/he-nen.md)`);
  if (n >= ng.deckToiThieu && soNhieu / n > ng.tiLeNenToiDa) loi.push(`◇ nền: một họ nền chiếm ${Math.round((100 * soNhieu) / n)} % deck (tối đa ${100 * ng.tiLeNenToiDa} %)`);
  let lien = 1, batDau = 1;
  for (let k = 1; k <= n; k++) {
    if (k < n && slides[k].nen === slides[k - 1].nen) { lien++; continue; }
    if (lien > ng.lienToiDa) loi.push(`◇ nền: ${lien} slide liền cùng nền (slide ${batDau}–${batDau + lien - 1}; tối đa ${ng.lienToiDa}) — đổi vị trí hoạ tiết, hoặc xen N2 / N3 (references/he-nen.md)`);
    lien = 1; batDau = k + 1;
  }
  lien = 1; batDau = 1;
  for (let k = 1; k <= n; k++) {
    if (k < n && hoCua(slides[k]) === hoCua(slides[k - 1])) { lien++; continue; }
    if (lien > ng.lienHoToiDa) loi.push(`◇ nền: ${lien} slide liền cùng họ nền (slide ${batDau}–${batDau + lien - 1}; tối đa ${ng.lienHoToiDa}) — xen N2 / N3`);
    lien = 1; batDau = k + 1;
  }
  const noi = {};
  for (const s of slides) for (const a of s.asset) if (!a.endsWith("(lặp)")) (noi[a] = noi[a] || []).push(s.slide);
  const lap = Object.entries(noi).filter(([, ds]) => ds.length > ng.assetToiDa).sort((a, b) => b[1].length - a[1].length);
  for (const [a, ds] of lap) loi.push(`◇ asset: ${a} dùng trên ${ds.length} slide (${ds.join(", ")}; tối đa ${ng.assetToiDa}) — vẽ hình riêng cho từng ý, hoặc data-lap nếu cố ý cùng vai`);
  const kieuBang = {};
  for (const s of slides) for (const b of s.bang) kieuBang[b] = (kieuBang[b] || 0) + 1;
  const tongBang = Object.values(kieuBang).reduce((a, b) => a + b, 0);
  const [kieuNhieu, soKieuNhieu] = Object.entries(kieuBang).sort((a, b) => b[1] - a[1])[0] || ["", 0];
  if (tongBang >= ng.bangXetTiLe && Object.keys(kieuBang).length > 1 && soKieuNhieu / tongBang > ng.tiLeBangToiDa) loi.push(`◇ bảng: kiểu “${kieuNhieu}” chiếm ${soKieuNhieu}/${tongBang} bảng (tối đa ${100 * ng.tiLeBangToiDa} %) — references/trinh-bay-du-lieu.md`);
  if (tongBang >= ng.bangCungKieu && Object.keys(kieuBang).length === 1) loi.push(`◇ bảng: ${tongBang} bảng cùng một kiểu “${Object.keys(kieuBang)[0]}” — chọn kiểu theo loại thông tin (references/trinh-bay-du-lieu.md)`);
  const nho = slides.filter((x) => x.tieuDiem != null && !x.khongHinh && x.tieuDiem < ng.tieuDiemToiThieu);
  if (nho.length) loi.push(`◇ tiêu điểm: ${nho.length} slide không có khối thị giác ≥ ${100 * ng.tieuDiemToiThieu} % (slide ${nho.map((x) => `${x.slide} (${Math.round(100 * x.tieuDiem)} %)`).join(", ")}) — phóng hình chính lên 30–45 % slide hoặc đặt mảng màu / số lớn; slide cố ý chỉ chữ: data-khong-hinh`);
  const thongKe = { slide: n, tieuDiemDat: slides.filter((x) => (x.tieuDiem || 0) >= 0.3).length, loaiNen: loai, bienTheNen: new Set(slides.map((s) => s.nen)).size, nenNhieuNhat: nenNhieu, tiLeNenNhieuNhat: n ? soNhieu / n : 0, assetKhacNhau: Object.keys(noi).length, assetLap: lap.length, kieuBang: Object.keys(kieuBang).length, tongBang };
  const bang = [`Đa dạng: ${thongKe.tieuDiemDat}/${n} slide có tiêu điểm ≥ 30 % · ${loai} họ nền (${thongKe.bienTheNen} biến thể có vị trí hoạ tiết) · nền nhiều nhất ${Math.round(100 * thongKe.tiLeNenNhieuNhat)} % · ${thongKe.assetKhacNhau} asset khác nhau (${lap.length} lặp quá ${ng.assetToiDa} slide) · ${tongBang} bảng / ${thongKe.kieuBang} kiểu`,
    `  dải họ nền: ${slides.map((s) => String.fromCharCode(65 + Object.keys(dem).indexOf(hoCua(s)))).join("")}  (${Object.keys(dem).map((k, i) => `${String.fromCharCode(65 + i)}=${k.length > 40 ? k.slice(0, 40) + "…" : k}`).join(" · ")})`].join("\n");
  return { loi, thongKe, bang };
}

module.exports = { thuThap, danhGia, NGUONG };
