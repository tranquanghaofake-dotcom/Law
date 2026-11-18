// CHỐNG VẺ "AI" — bài Nhóm 2 (18/11/2026), Hào: "bảng, textbox, đồ thị còn AI, xấu, bị ẩn đi với môi trường"; "nội dung khó hiểu".
// Đo trên trang theo thẻ phong cách (thiet-ke/phong-cach.json), lỗi chặn giao:
//   1. KHỐI CHÌM: khối có nền riêng (thẻ, bảng, panel, ô) ≥ 1,5 % slide mà ranh giới với thứ nằm dưới < 3 : 1 — cả nền khối lẫn viền
//      (WCAG 1.4.11 cho thành phần không phải chữ). Thẻ trắng trên nền kem, panel bạc hà trên nền kem (≈ 1,1 : 1) là "hoà lẫn".
//      Sửa: viền ≥ 2 px đậm, hoặc nền khối đậm hẳn, hoặc bỏ khối (chữ đứng thẳng trên nền + kẻ ngang).
//   2. VẺ AI (tắt bằng "chongAI": false): bo góc > boGocToiDa (mặc định 8 px) ở khối lớn · bóng đổ · > 2 nhãn chữ in hoa giãn cách
//      trên một slide ("chip" khắp nơi). Ba thứ này là chữ ký của slide mẫu do AI dựng.
//   3. VIẾT TẮT CHƯA ĐỊNH NGHĨA: chữ in hoa 2–6 ký tự (NĐBH, TCTD, QLGSBH…) xuất hiện trên slide mà trong deck không có
//      "(NĐBH)" / "NĐBH:" / "NĐBH là" và không có trong thẻ "vietTat": {"OTP": "mã xác thực một lần"}. Số hiệu văn bản
//      (46/2023/NĐ-CP, 08/2022/QH15) và số La Mã được bỏ qua.

function thuThapChongAI() {
  const rgb = (c) => (c.match(/[\d.]+/g) || []).slice(0, 4).map(Number);
  const L = (c) => { const [r, g, b] = c.slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const tp = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100; };
  const coNen = (c) => c && c !== "transparent" && !/rgba\([^)]*,\s*0\)$/.test(c) && (rgb(c)[3] === undefined || rgb(c)[3] > 0.5);
  const out = [];
  document.querySelectorAll("section.s").forEach((s, i) => {
    const R = s.getBoundingClientRect(), S = R.width * R.height, ds = [...s.querySelectorAll("*")], khoi = [];
    const nenSlide = rgb(getComputedStyle(s).backgroundColor);
    ds.forEach((el, j) => {
      if (el.closest("svg") || el.tagName === "IMG") return;
      const cs = getComputedStyle(el), r = el.getBoundingClientRect(), dt = (r.width * r.height) / S;
      if (!coNen(cs.backgroundColor) || dt < 0.015 || dt > 0.95) return;
      // thứ nằm dưới: phần tử có nền đứng trước trong DOM, chứa tâm khối; không có thì nền slide; gặp ảnh thì không kết luận
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const duoi = ds.slice(0, j).filter((e) => !e.contains(el) || e === el.parentElement).filter((e) => { const q = e.getBoundingClientRect(); return cx >= q.left && cx <= q.right && cy >= q.top && cy <= q.bottom && (q.width * q.height) / S > dt; })
        .filter((e) => e.tagName === "IMG" || coNen(getComputedStyle(e).backgroundColor)).pop();
      if (duoi && duoi.tagName === "IMG") return;
      const nd = duoi ? rgb(getComputedStyle(duoi).backgroundColor) : nenSlide, nk = rgb(cs.backgroundColor);
      const vien = Math.min(...["Top", "Right", "Bottom", "Left"].map((k) => (cs["border" + k + "Style"] === "none" ? 0 : parseFloat(cs["border" + k + "Width"]) || 0)));
      const vienMax = Math.max(...["Top", "Bottom"].map((k) => (cs["border" + k + "Style"] === "none" ? 0 : parseFloat(cs["border" + k + "Width"]) || 0)));
      khoi.push({ ten: (el.className && String(el.className).split(" ")[0]) || el.tagName.toLowerCase(), dt: Math.round(dt * 1000) / 1000, tpNen: tp(nk, nd),
        vien: Math.max(vien, vienMax), tpVien: vienMax ? tp(rgb(cs.borderTopColor || cs.borderBottomColor), nd) : 0,
        bo: Math.round(parseFloat(cs.borderTopLeftRadius) || 0), bong: cs.boxShadow && cs.boxShadow !== "none", trangTri: el.dataset.alt === "Hình trang trí" });
    });
    let chipInHoa = 0; const chu = [];
    for (const t of s.querySelectorAll("[data-t]")) { if (t.querySelector("[data-t]")) continue; const c = (t.textContent || "").trim().replace(/\s+/g, " "); if (!c) continue; chu.push(c);
      const cs = getComputedStyle(t); if (cs.textTransform === "uppercase" && parseFloat(cs.letterSpacing) > 0.5 && c.split(" ").length <= 6) chipInHoa++; }
    out.push({ slide: i + 1, khoi, chipInHoa, chu });
  });
  return out;
}

const LA_MA = /^(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)$/;
function vietTatChuaDinhNghia(chu, vietTat = {}) {
  const tat = chu.join(" \n ").replace(/\d+\/\d{2,4}\/[A-ZĐ0-9-]+/g, " ");   // bỏ số hiệu văn bản: 46/2023/NĐ-CP, 08/2022/QH15
  const tim = new Set((tat.match(/(?<![\p{L}\d])[A-ZĐ]{2,6}(?![\p{L}\d])/gu) || []).filter((w) => !LA_MA.test(w)));
  const daCo = (w) => vietTat[w] || new RegExp(`\\(${w}\\)|${w}\\s*[:=]|${w}\\s+là\\b`, "u").test(tat);
  return [...tim].filter((w) => !daCo(w));
}

function danhGiaChongAI(slides, the) {
  const loi = [];
  if (!the) return { loi };
  const boMax = the.boGocToiDa ?? 8, ai = the.chongAI !== false;
  for (const s of slides) {
    for (const k of s.khoi) {
      if (k.trangTri || k.dt < 0.015) continue;
      if (k.tpNen < 3 && !(k.vien >= 2 && k.tpVien >= 3)) loi.push(`◐ khối chìm: slide ${s.slide} khối “${k.ten}” (${Math.round(k.dt * 100)} % slide) tách nền chỉ ${k.tpNen} : 1 — thêm viền ≥ 2 px đậm, tô nền đậm hẳn, hoặc bỏ khối (chữ thẳng trên nền + kẻ ngang)`);
      if (ai && k.bo > boMax) loi.push(`◇ vẻ AI: slide ${s.slide} khối “${k.ten}” bo góc ${k.bo} px (> ${boMax}) — góc vuông hoặc bo nhẹ`);
      if (ai && k.bong) loi.push(`◇ vẻ AI: slide ${s.slide} khối “${k.ten}” có bóng đổ — bỏ bóng, tách nền bằng viền / kẻ`);
    }
    if (ai && s.chipInHoa > 2) loi.push(`◇ vẻ AI: slide ${s.slide} có ${s.chipInHoa} nhãn in hoa giãn chữ — tối đa 2 (nhãn mục + một nhãn nhấn); còn lại viết chữ thường`);
  }
  const vt = vietTatChuaDinhNghia(slides.flatMap((s) => s.chu), the.vietTat || {});
  for (const w of vt) loi.push(`◇ khó hiểu: viết tắt “${w}” chưa được định nghĩa trên slide nào (slide ${slides.filter((s) => s.chu.some((c) => new RegExp(`(?<![\\p{L}\\d])${w}(?![\\p{L}\\d])`, "u").test(c))).map((s) => s.slide).join(", ")}) — viết đủ, hoặc ghi “(${w})” ở lần đầu, hoặc khai trong thẻ "vietTat"`);
  return { loi };
}

module.exports = { thuThapChongAI, danhGiaChongAI, vietTatChuaDinhNghia };
