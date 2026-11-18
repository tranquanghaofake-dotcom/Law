// KIỂM THẺ PHONG CÁCH ASSET: mọi hình SVG của deck phải theo thẻ phong cách đã duyệt (thiet-ke/phong-cach.json của bài).
//   { "ten": "phẳng 2 tông", "gradient": false, "bongMo": false, "mauToiDa": 8 }
// gradient=false → cấm <linearGradient>/<radialGradient>; bongMo=false → cấm feGaussianBlur / feDropShadow (bóng nền phẳng một màu vẫn được);
// mienBangMau → thư mục minh hoạ thư viện được miễn kiểm bảng màu (vd. ["anh/storyset/"]); mauToiDa → số màu khác nhau tối đa trong một hình (đếm fill/stroke/stop-color dạng #hex); bangMau → mọi màu #hex 6 chữ số trong SVG phải gần bảng màu. Không có file thẻ → không kiểm.
// Hình trộn phong cách (nửa bán 3D, nửa phẳng) là lỗi Thẩm mỹ hay gặp nhất mà mắt dễ bỏ qua khi xem từng slide.
const fs = require("fs"), path = require("path");

function kiemPhongCach(dir, srcs) {
  const f = path.join(dir, "thiet-ke", "phong-cach.json");
  if (!fs.existsSync(f)) return [];
  const the = JSON.parse(fs.readFileSync(f, "utf8")), loi = [], ten = the.ten ? ` (thẻ “${the.ten}”)` : "";
  for (const src of [...new Set(srcs)]) {
    const p = path.join(dir, src.split("?")[0]);
    if (!/\.svg$/i.test(p) || !fs.existsSync(p)) continue;
    const s = fs.readFileSync(p, "utf8"), sai = [];
    if (the.gradient === false && /<(linear|radial)Gradient\b/.test(s)) sai.push("có gradient");
    if (the.bongMo === false && /<fe(GaussianBlur|DropShadow)\b/.test(s)) sai.push("có bóng mờ / làm nhoè");
    // minh hoạ thư viện của hoạ sĩ (Storyset…) giữ màu trung tính / màu da gốc — chỉ màu nhấn được tô lại (scripts/storyset.py); khai "mienBangMau": ["anh/storyset/"]
    const mien = (the.mienBangMau || []).some((d) => src.split("?")[0].startsWith(d));
    if (the.bangMau && the.bangMau.length && !mien) { const { gan } = require("./nhat_quan"), la = [...new Set((s.match(/(?:fill|stroke|stop-color)\s*[=:]\s*"?#([0-9a-f]{6})\b/gi) || []).map((m) => "#" + m.replace(/.*#/, "").toUpperCase()))].filter((h) => !gan(h, the.bangMau));
      if (la.length) sai.push(`màu ngoài bảng màu ${la.slice(0, 4).join(", ")}`); }
    if (the.mauToiDa) { const mau = new Set((s.match(/(?:fill|stroke|stop-color)\s*[=:]\s*"?#([0-9a-f]{3,8})/gi) || []).map((m) => m.replace(/.*#/, "").toLowerCase()));
      if (mau.size > the.mauToiDa) sai.push(`${mau.size} màu (tối đa ${the.mauToiDa})`); }
    if (sai.length) loi.push(`◇ phong cách: ${src} ${sai.join(", ")}${ten} — vẽ lại theo thiet-ke/phong-cach.json`);
  }
  return loi;
}

module.exports = { kiemPhongCach };
