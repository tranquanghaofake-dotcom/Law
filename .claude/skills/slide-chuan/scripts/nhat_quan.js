// NHẤT QUÁN — CHỐNG "HỔ LỐN" (references/bo-cuc.md). Đo trên trang theo thẻ phong cách của bài (thiet-ke/phong-cach.json):
//   "bangMau":      ["#hex", …]   mọi màu chữ / nền / viền của phần tử HTML phải gần một màu trong bảng (ảnh chụp không tính)
//   "loaiHinh":     ["anh-hai-mau", "net", …]   mọi lớp hình (img[data-l], trừ trang trí) phải khai data-loai thuộc danh sách
//   "boCuc":        ["bia", "mo-phan", "noi-dung", …]   mọi <section> phải khai data-mau thuộc danh sách (bố cục mẫu)
//   "tieuDeCoDinh": ["noi-dung", …]   các bố cục này: tiêu đề ([data-tieu-de]) phải đứng cùng một chỗ (lệch ≤ 4 px)
// Vì sao: một deck đẹp là MỘT ngôn ngữ hình ảnh + một bộ bố cục cố định; mỗi lần "thêm một thứ cho đỡ đơn điệu" (nhân vật hoạt hình,
// hoạ tiết, dải màu, thẻ bo góc màu mới…) là một bước tới hổ lốn — máy bắt ngay khi nó xuất hiện.

function thuThapNhatQuan() {
  const hex = (c) => { const m = (c || "").match(/[\d.]+/g); if (!m || (m.length > 3 && +m[3] < 0.5)) return null; return "#" + m.slice(0, 3).map((v) => (+v | 0).toString(16).padStart(2, "0")).join("").toUpperCase(); };
  const out = [];
  document.querySelectorAll("section.s").forEach((s, i) => {
    const mauSac = [], add = (c, vai) => { const h = hex(c); if (h) mauSac.push([h, vai]); };
    add(getComputedStyle(s).backgroundColor, "nền slide");
    for (const el of s.querySelectorAll("*")) {
      if (el.closest("svg") || el.tagName === "IMG") continue;
      const cs = getComputedStyle(el); if (cs.display === "none" || cs.visibility === "hidden") continue;
      if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) add(cs.color, "chữ");
      add(cs.backgroundColor, "nền");
      for (const k of ["Top", "Right", "Bottom", "Left"]) if (parseFloat(cs["border" + k + "Width"]) > 0 && cs["border" + k + "Style"] !== "none") add(cs["border" + k + "Color"], "viền");
    }
    const hinh = [...s.querySelectorAll('img[data-l]:not([data-alt="Hình trang trí"])')].map((im) => [im.dataset.loai || "", (im.getAttribute("src") || "").split("/").pop()]);
    const td = s.querySelector("[data-tieu-de]"), r = td && td.getBoundingClientRect(), R = s.getBoundingClientRect();
    out.push({ slide: i + 1, mau: s.dataset.mau || "", mauSac, hinh, tieuDe: r ? { x: Math.round(r.left - R.left), y: Math.round(r.top - R.top) } : null });
  });
  return out;
}

const rgb = (h) => { const s = h.replace("#", ""); return [0, 2, 4].map((k) => parseInt(s.slice(k, k + 2), 16)); };
const xa = (a, b) => { const [p, q] = [rgb(a), rgb(b)]; return Math.sqrt(p.reduce((t, v, k) => t + (v - q[k]) ** 2, 0)); };
const gan = (h, bang, nguong = 18) => bang.some((b) => xa(h, b) <= nguong);

function danhGiaNhatQuan(slides, the) {
  const loi = [];
  if (!the) return { loi };
  if (the.bangMau && the.bangMau.length) {
    const la = new Map();
    for (const s of slides) for (const [h, vai] of s.mauSac) if (!gan(h, the.bangMau)) { const e = la.get(h) || { vai: new Set(), slide: new Set() }; e.vai.add(vai); e.slide.add(s.slide); la.set(h, e); }
    if (la.size) loi.push(`◇ nhất quán: ${la.size} màu ngoài bảng màu — ${[...la].slice(0, 8).map(([h, e]) => `${h} (${[...e.vai].join("/")}, slide ${[...e.slide].slice(0, 6).join(", ")})`).join("; ")} — dùng màu của thiet-ke/phong-cach.json, không thêm màu mới`);
  }
  if (the.loaiHinh && the.loaiHinh.length) {
    const sai = new Map(), chuaKhai = [];
    for (const s of slides) for (const [loai, f] of s.hinh) { if (!loai) chuaKhai.push(`${f} (slide ${s.slide})`); else if (!the.loaiHinh.includes(loai)) { const e = sai.get(loai) || []; e.push(s.slide); sai.set(loai, e); } }
    for (const [loai, ds] of sai) loi.push(`◇ nhất quán: loại hình “${loai}” không có trong thẻ phong cách (${the.loaiHinh.join(", ")}) — slide ${ds.join(", ")}; trộn loại hình là gốc của hổ lốn`);
    if (chuaKhai.length) loi.push(`◇ nhất quán: ${chuaKhai.length} hình chưa khai data-loai — ${chuaKhai.slice(0, 6).join(", ")}`);
  }
  if (the.boCuc && the.boCuc.length) {
    const khong = slides.filter((s) => !s.mau).map((s) => s.slide), ngoai = new Map();
    for (const s of slides) if (s.mau && !the.boCuc.includes(s.mau)) ngoai.set(s.mau, [...(ngoai.get(s.mau) || []), s.slide]);
    if (khong.length) loi.push(`◇ nhất quán: slide ${khong.join(", ")} không khai data-mau (bố cục mẫu) — mỗi slide phải dựng từ một bố cục đã duyệt`);
    for (const [m, ds] of ngoai) loi.push(`◇ nhất quán: bố cục “${m}” không có trong danh sách bố cục mẫu — slide ${ds.join(", ")}`);
  }
  for (const m of the.tieuDeCoDinh || []) {
    const ds = slides.filter((s) => s.mau === m && s.tieuDe); if (ds.length < 3) continue;
    const mode = (k) => { const c = {}; for (const s of ds) c[s.tieuDe[k]] = (c[s.tieuDe[k]] || 0) + 1; return +Object.entries(c).sort((a, b) => b[1] - a[1])[0][0]; };
    const [mx, my] = [mode("x"), mode("y")], lech = ds.filter((s) => Math.abs(s.tieuDe.x - mx) > 4 || Math.abs(s.tieuDe.y - my) > 4);
    if (lech.length) loi.push(`◇ nhất quán: tiêu đề lệch chỗ trong bố cục “${m}” (chuẩn x ${mx}, y ${my}) — slide ${lech.map((s) => `${s.slide} (${s.tieuDe.x}, ${s.tieuDe.y})`).join(", ")}`);
  }
  return { loi };
}

module.exports = { thuThapNhatQuan, danhGiaNhatQuan, gan };
