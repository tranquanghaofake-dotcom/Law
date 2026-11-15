// ĐO ĐỘ ĐA DẠNG CỦA DECK: hệ nền, asset lặp lại, kiểu bảng.
// thuThap() chạy trong trang (Playwright page.evaluate) → mảng { slide, nen, asset[], bang[] }; danhGia() thuần, kiểm được bằng node:test.
// Khai báo trong HTML (khuyên dùng, rõ hơn máy đoán):
//   <section data-nen="dam|sang|chia|anh|hoa-tiet|…">   loại nền của slide
//   <img data-l … data-lap>                             hình cố ý lặp (cùng vai: logo, nhân vật xuyên suốt) — không tính lỗi lặp
//   <div data-bang="tra|dau|so|ma-tran|the|…">          kiểu bảng / trình bày dữ liệu
// Không khai báo: nền = màu nền section + các khối ≥ 25 % diện tích (màu, ảnh chụp .jpg/.webp hoặc img data-nen-anh; lớp SVG trong suốt không tính); bảng = <table> hoặc phần tử có class "bang…".
const NGUONG = { loaiNenToiThieu: 3, deckToiThieu: 12, tiLeNenToiDa: 0.6, lienToiDa: 4, assetToiDa: 3, bangCungKieu: 3 };

function thuThap() {
  const out = [];
  document.querySelectorAll("section.s").forEach((s, i) => {
    const R = s.getBoundingClientRect(), A = R.width * R.height || 1, cs = getComputedStyle(s);
    let nen = s.dataset.nen;
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
      nen = [cs.backgroundColor.replace(/\s/g, "") + (cs.backgroundImage !== "none" ? "+hoa-tiet" : ""), ...[...new Set(khoi)].sort()].join("|");
    }
    const asset = [...s.querySelectorAll("img[data-l]")].map((im) => (im.getAttribute("src") || "").split("/").pop() + (im.hasAttribute("data-lap") ? " (lặp)" : ""));
    const bang = [...s.querySelectorAll("[data-bang], table, [class~='bang'], [class^='bang']")].filter((el) => !el.parentElement.closest("[data-bang], table, [class~='bang'], [class^='bang']"))
      .map((el) => el.dataset.bang || (el.tagName === "TABLE" ? "table" : el.className.trim()));
    out.push({ slide: i + 1, nen, asset: [...new Set(asset)], bang });
  });
  return out;
}

function danhGia(slides, ng = NGUONG) {
  const loi = [], n = slides.length, dem = {};
  for (const s of slides) dem[s.nen] = (dem[s.nen] || 0) + 1;
  const loai = Object.keys(dem).length, [nenNhieu, soNhieu] = Object.entries(dem).sort((a, b) => b[1] - a[1])[0] || ["", 0];
  if (n >= ng.deckToiThieu && loai < ng.loaiNenToiThieu) loi.push(`◇ nền: chỉ ${loai} loại nền cho ${n} slide (cần ≥ ${ng.loaiNenToiThieu}: sáng, đậm, chia mảng, ảnh/hoạ tiết — thiet-ke/he-thong.md mục Hệ nền)`);
  if (n >= ng.deckToiThieu && soNhieu / n > ng.tiLeNenToiDa) loi.push(`◇ nền: một loại nền chiếm ${Math.round((100 * soNhieu) / n)} % deck (tối đa ${100 * ng.tiLeNenToiDa} %)`);
  let lien = 1, batDau = 1;
  for (let k = 1; k <= n; k++) {
    if (k < n && slides[k].nen === slides[k - 1].nen) { lien++; continue; }
    if (lien > ng.lienToiDa) loi.push(`◇ nền: ${lien} slide liền cùng nền (slide ${batDau}–${batDau + lien - 1}; tối đa ${ng.lienToiDa}) — xen nền đậm / chia mảng / slide thở`);
    lien = 1; batDau = k + 1;
  }
  const noi = {};
  for (const s of slides) for (const a of s.asset) if (!a.endsWith("(lặp)")) (noi[a] = noi[a] || []).push(s.slide);
  const lap = Object.entries(noi).filter(([, ds]) => ds.length > ng.assetToiDa).sort((a, b) => b[1].length - a[1].length);
  for (const [a, ds] of lap) loi.push(`◇ asset: ${a} dùng trên ${ds.length} slide (${ds.join(", ")}; tối đa ${ng.assetToiDa}) — vẽ hình riêng cho từng ý, hoặc data-lap nếu cố ý cùng vai`);
  const kieuBang = {};
  for (const s of slides) for (const b of s.bang) kieuBang[b] = (kieuBang[b] || 0) + 1;
  const tongBang = Object.values(kieuBang).reduce((a, b) => a + b, 0);
  if (tongBang >= ng.bangCungKieu && Object.keys(kieuBang).length === 1) loi.push(`◇ bảng: ${tongBang} bảng cùng một kiểu “${Object.keys(kieuBang)[0]}” — chọn kiểu theo loại thông tin (references/trinh-bay-du-lieu.md)`);
  const thongKe = { slide: n, loaiNen: loai, nenNhieuNhat: nenNhieu, tiLeNenNhieuNhat: n ? soNhieu / n : 0, assetKhacNhau: Object.keys(noi).length, assetLap: lap.length, kieuBang: Object.keys(kieuBang).length, tongBang };
  const bang = [`Đa dạng: ${loai} loại nền · nền nhiều nhất ${Math.round(100 * thongKe.tiLeNenNhieuNhat)} % · ${thongKe.assetKhacNhau} asset khác nhau (${lap.length} lặp quá ${ng.assetToiDa} slide) · ${tongBang} bảng / ${thongKe.kieuBang} kiểu`,
    `  dải nền: ${slides.map((s) => String.fromCharCode(65 + Object.keys(dem).indexOf(s.nen))).join("")}  (${Object.keys(dem).map((k, i) => `${String.fromCharCode(65 + i)}=${k.length > 40 ? k.slice(0, 40) + "…" : k}`).join(" · ")})`].join("\n");
  return { loi, thongKe, bang };
}

module.exports = { thuThap, danhGia, NGUONG };
