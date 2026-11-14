// Bảng màu của tầng hình ảnh.
// Mỗi bảng là phép đổi các màu gốc của bảng "son" → màu mới, áp cho cả CSS lẫn HTML của slide (đổi một chỗ, mọi slide theo).
//   son  mực đêm + son (mặc định; pháp lý, bản án)        luc  xanh rừng + cam đất (đất đai, môi trường, nông nghiệp)
//   lam  chàm + vàng (thương mại, tài chính, công nghệ)   nau  nâu gỗ + son trầm (lịch sử, hành chính, tư liệu)
const PAL = {
  son: null,
  luc: { "0c1222": "0e2a22", "172038": "17392f", "2a3654": "25513f", "3a4664": "3a6a56", "2a3350": "24503f", "141c33": "12322a", "55607e": "5d8272", "05070d": "04100c", "a7b0c6": "a9c4b6", "c3cadb": "c6d9cf", "e2402a": "d94f1f", "b62c1a": "a93a12", "ff8672": "ff9a6b", "f6b93b": "f4c542" },
  lam: { "0c1222": "121a4b", "172038": "1c2768", "2a3654": "2e3c8a", "3a4664": "47549c", "2a3350": "2a3780", "141c33": "172058", "55607e": "6470ad", "05070d": "060920", "a7b0c6": "b2b9e0", "c3cadb": "cdd2ec", "f4eddc": "f3f0e6", "e9dfc8": "e6e2d3", "d6c9aa": "cfc9b4", "e2402a": "e63946", "b62c1a": "b3202d", "ff8672": "ff8a94", "ffe0d6": "ffe0e3", "f6b93b": "ffd23f" },
  nau: { "0c1222": "241812", "172038": "34241b", "2a3654": "4f382a", "3a4664": "6a4e3c", "2a3350": "4a3628", "141c33": "2c1e16", "55607e": "8a6f5c", "05070d": "0d0806", "a7b0c6": "cdb9a6", "c3cadb": "dccdbd", "f4eddc": "f5ead3", "e9dfc8": "eadcbf", "d6c9aa": "d8c59f", "e2402a": "c8371f", "b62c1a": "9a2713", "f6b93b": "e9a83b" },
};
const rgb = (h) => [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(",");
/** Trả hàm đổi màu cho một bảng: nhận chuỗi CSS / HTML, trả chuỗi đã đổi mọi mã #rrggbb và rgba(r, g, b…) thuộc bảng gốc. */
function doiMau(mau) {
  if (!(mau in PAL)) throw new Error(`Không có bảng màu "${mau}". Chọn: ${Object.keys(PAL).join(", ")}.`);
  const P = PAL[mau]; if (!P) return (t) => t;
  const RGB = Object.fromEntries(Object.entries(P).map(([a, c]) => [rgb(a), rgb(c)]));
  return (t) => t.replace(/#([0-9a-fA-F]{6})\b/g, (m0, h) => (P[h.toLowerCase()] ? "#" + P[h.toLowerCase()] : m0)).replace(/rgba?\((\d+), ?(\d+), ?(\d+)/g, (m0, r, g, c) => (RGB[`${r},${g},${c}`] ? m0.replace(`${r}, ${g}, ${c}`, RGB[`${r},${g},${c}`]).replace(`${r},${g},${c}`, RGB[`${r},${g},${c}`]) : m0));
}
/** Như doiMau nhưng nhận thẳng phép đổi { "rrggbb gốc": "rrggbb mới" } — da theo môn (hinh/da.js → daMau) dùng cách này. */
function doiMauBang(P) {
  const RGB = Object.fromEntries(Object.entries(P).map(([a, c]) => [rgb(a), rgb(c)]));
  return (t) => t.replace(/#([0-9a-fA-F]{6})\b/g, (m0, h) => (P[h.toLowerCase()] ? "#" + P[h.toLowerCase()] : m0)).replace(/rgba?\((\d+), ?(\d+), ?(\d+)/g, (m0, r, g, c) => (RGB[`${r},${g},${c}`] ? m0.replace(`${r}, ${g}, ${c}`, RGB[`${r},${g},${c}`]).replace(`${r},${g},${c}`, RGB[`${r},${g},${c}`]) : m0));
}
module.exports = { PAL, doiMau, doiMauBang };
