// TẦNG HÌNH ẢNH — BỘ HÌNH BHXH "FLASHSLIDE XANH" cho đề tài bảo hiểm xã hội (11/2026).
// Lịch sử: bản "bàn hồ sơ" (vật tự vẽ phẳng, Morph kéo hàng chục vật) bị chê xấu, rối, chóng mặt; bản "báo cáo sáng" (icon phẳng,
// nền trắng trơn) bị chê xấu, đơn giản. Người dùng đưa mẫu tham chiếu: flashslide.com + kênh TikTok @flashslide.com. Rút ra:
//   · MỘT màu chủ đạo đậm (xanh BHXH) trên nền trắng pha xanh có chiều sâu (gradient, quầng sáng, chấm lưới mờ);
//   · tiêu đề CHỮ IN HOA ĐỨNG RẤT ĐẬM (Anton, đủ dấu tiếng Việt), nhãn hình viên thuốc, số lớn;
//   · CHẤT LIỆU 3D: vật chính vẽ bằng code kiểu 3D bóng (hinh/bhxh_3d.js: sổ BHXH, khiên kính, chồng xu, biểu đồ kính, bảng kiểm),
//     người và vật nhỏ từ Fluent Emoji 3D (MIT, hinh/f3d.js); vật mờ ở mép slide tạo chiều sâu; ảnh thật đóng khung ở bìa / kết;
//   · thẻ trắng bo tròn, dải màu đầu thẻ, bóng đổ xanh mềm, vòng tròn icon;
//   · chuyển cảnh: mờ nhẹ; Morph chỉ khi 1–3 VẬT LỚN trôi như máy quay lia (bìa → câu hỏi, mở phần → slide đầu của phần) và ở
//     slide hai bước (mốc hưu, thanh tỷ lệ, cột mọc) — không bao giờ hàng chục vật nhỏ cùng bay.
// Đo chữ bằng chính file font (fontkit) để biết tiêu đề mấy dòng; không ký hiệu ngoài font (✓ → hình, → → chữ).
const path = require("path"), fontkit = require("fontkit");
const { kit } = require("../stage/templates");
const { icon } = require("./icon");
const { f3d, coF3d } = require("./f3d");
const V = require("./bhxh_3d");
const { esc, f } = kit;

const TYPES = ["bhbia", "bhdo", "bhtang", "bhba", "bhchuong", "bhtrich", "bhvaitro", "bhnhom", "bhmorong", "bhrutngan", "bhduong", "bhphieu5", "bhcongthuc", "bhcot2", "bhche", "bhquy", "bhrut", "bhmat", "bhdat", "bhhanche", "bhkiennghi", "bhhoi", "bhtraloi", "bhghinho", "bhket"];
const HAI_BUOC = new Set(["bhrutngan", "bhcongthuc", "bhcot2"]);   // 1 slide deck.json → 2 slide PowerPoint; bước 2 vào bằng Morph. bhcot2 có "grow": false → một slide
let U = 0; const uid = (p) => `${p}${++U}`;
const tx = (s) => f(s).replace(/\n/g, "<br>");
const so = (v) => String(v).replace(".", ",");

// ---------- bảng màu ----------
const P = { navy: "0b2559", blue: "0b57d0", blue2: "2f7bff", blueD: "0a3a9a", sky: "e8f1ff", sky2: "cfe2ff", gold: "f2a91d", goldD: "9a5f00", goldT: "fff3d6",
  red: "e0453a", redD: "b3261e", redT: "fde8e6", ink: "13213f", ink2: "46526b", mute: "6c7891", line: "dbe6f7", faint: "b9c6dc" };

// ---------- đo chữ (số dòng thật, ngắt theo từ) ----------
const FD = path.join(__dirname, "fonts"), FONT = {};
const fontOf = (wt) => { const k = wt === "anton" ? "Anton-Regular.ttf" : wt >= 750 ? "BeVietnam-Nang.ttf" : wt >= 550 ? "BeVietnam-Dam.ttf" : "BeVietnamPro-Regular.ttf"; return FONT[k] || (FONT[k] = fontkit.openSync(path.join(FD, k))); };
const rong = (t, px, wt) => { const F = fontOf(wt); return (F.layout(String(t).normalize("NFC")).advanceWidth / F.unitsPerEm) * px; };
const dong = (t, w, px, wt = 800) => { let s = String(t || "").replace(/[[\]]/g, ""); if (wt === "anton") s = s.toLocaleUpperCase("vi");
  return s.split("\n").reduce((n, para) => { const sp = rong(" ", px, wt); let ln = 1, cur = 0;
    for (const wd of para.split(/\s+/).filter(Boolean)) { const ww = rong(wd, px, wt); if (cur && cur + sp + ww > w) { ln++; cur = ww; } else cur += (cur ? sp : 0) + ww; } return n + ln; }, 0) || 1; };

// ---------- khối dựng ----------
const BONG = "drop-shadow(0 3px 6px rgba(11,58,154,.08)) drop-shadow(0 16px 30px rgba(11,58,154,.14))";
const lop = (name, R, inner, o = {}) => `<div class="bh-l" data-l="${name}"${o.m ? ` data-m="${o.m}" data-mt="0"` : ""}${o.go ? ` data-go="${o.go}"` : ""} data-pad="${o.pad ?? (o.blur ? o.blur * 3 + 10 : o.shadow === false ? 6 : 44)}" data-alt="${esc(o.alt || "Hình minh hoạ")}" style="left:${Math.round(R.x)}px;top:${Math.round(R.y)}px;width:${Math.round(R.w)}px;height:${Math.round(R.h)}px;z-index:${o.z ?? 5};${R.r ? `rotate:${R.r}deg;` : ""}${o.blur ? `filter:blur(${o.blur}px);${o.op ? `opacity:${o.op};` : ""}` : o.shadow === false ? "" : `filter:${BONG};`}">${inner}</div>`;
const chu = (cls, x, y, w, html, o = {}) => `<div class="${cls}" data-t${o.m ? ` data-m="${o.m}"` : ""}${o.go ? ` data-go="${o.go}"` : ""} style="left:${Math.round(x)}px;top:${Math.round(y)}px;${w ? `width:${Math.round(w)}px;` : ""}${o.size ? `font-size:${o.size}px;` : ""}${o.color ? `color:#${o.color};` : ""}${o.align ? `text-align:${o.align};` : ""}z-index:${o.z ?? 30};">${html}</div>`;
const anh = (src) => `<img src="${src}" style="width:100%;height:100%;object-fit:contain;display:block">`;
// vật 3D Fluent (ảnh), có thể làm mờ (tiền cảnh / hậu cảnh)
const vat = (name, ten, R, o = {}) => (coF3d(ten) ? lop(name, { h: R.w, ...R }, anh(f3d(ten)), { shadow: o.blur ? undefined : false, ...o, alt: o.alt || `Hình 3D: ${ten}` }) : "");
// vật chính vẽ bằng code
const HERO = { so: [V.soBHXH, 560 / 640], khien: [V.khien, 400 / 480], xu: [V.chongXu, 300 / 310], cot: [V.bieuDoKinh, 520 / 470], kiem: [V.bangKiem, 460 / 560] };
const hero = (name, ten, R, o = {}) => { const [fn, k] = HERO[ten]; return lop(name, { h: R.w / k, ...R }, fn(), { shadow: false, alt: o.alt || "Hình minh hoạ 3D", ...o }); };
// thẻ: trắng bo tròn, dải màu đầu (dai: "xanh" | "vang" | "do" | mã màu) cao daiH
const GRAD = { nhat2: ["b9d3ff", "7fa9ea"], xanh: ["3a8bff", "0b57d0"], dam: ["1e6ff0", "0a3a9a"], vang: ["ffc94a", "e8930c"], do: ["ff6b5e", "c9301f"], nhat: ["f3f8ff", "dceaff"] };
const theSvg = (w, h, o = {}) => { const r = o.r ?? 28, g = uid("tg"), c = uid("tc"), d = GRAD[o.dai] || null, n = GRAD[o.nen] || null;
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none"><defs><clipPath id="${c}"><rect width="${w}" height="${h}" rx="${r}"/></clipPath>
    ${d ? `<linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${d[0]}"/><stop offset="1" stop-color="#${d[1]}"/></linearGradient>` : ""}${n ? `<linearGradient id="${g}n" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${n[0]}"/><stop offset="1" stop-color="#${n[1]}"/></linearGradient>` : ""}</defs>
    <rect width="${w}" height="${h}" rx="${r}" fill="${n ? `url(#${g}n)` : "#ffffff"}"/>${d ? `<rect width="${w}" height="${o.daiH || 14}" fill="url(#${g})" clip-path="url(#${c})"/>` : ""}
    ${n && o.bong !== false ? `<path d="M0 0 H${w} V${h * 0.42} C${w * 0.6} ${h * 0.3} ${w * 0.3} ${h * 0.55} 0 ${h * 0.5} Z" fill="#ffffff" opacity=".1" clip-path="url(#${c})"/>` : ""}
    ${n ? "" : `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${r - 1}" fill="none" stroke="#${o.vien || P.line}" stroke-width="${o.vienW || 2}"/>`}</svg>`; };
const the = (name, R, o = {}) => lop(name, R, theSvg(R.w, R.h, o), { go: o.go, alt: o.alt || "Thẻ", z: o.z || 4, shadow: o.shadow });
// vòng tròn (nền xanh nhạt / gradient) chứa vật 3D
const vong = (name, x, y, d, ten, o = {}) => { const g = uid("vg"), mau = o.mau === "xanh" ? ["3a8bff", "0b57d0"] : o.mau === "vang" ? ["fff3d6", "ffd98a"] : o.mau === "do" ? ["fff0ee", "ffd2cc"] : ["ffffff", "dceaff"];
  return `${lop(name, { x, y, w: d, h: d }, `<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${mau[0]}"/><stop offset="1" stop-color="#${mau[1]}"/></linearGradient></defs><circle cx="50" cy="50" r="49" fill="url(#${g})" stroke="#ffffff" stroke-width="2"/></svg>`, { go: o.go, alt: "Vòng nền", z: o.z || 5 })}${vat(`${name}v`, ten, { x: x + d * 0.14, y: y + d * 0.12, w: d * 0.72 }, { go: o.go, z: (o.z || 5) + 1 })}`; };
// nhãn viên thuốc: nền gradient, chữ in hoa
const vien = (name, x, y, text, o = {}) => { const px = o.px || 24, w = o.w || Math.round(rong(String(text).toLocaleUpperCase("vi"), px, 800) * 1.06 + text.length * px * 0.08 + 56), h = Math.round(px * 1.9), g = uid("vp"), m = GRAD[o.mau || "xanh"];
  return `${lop(name, { x, y, w, h }, `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${m[0]}"/><stop offset="1" stop-color="#${m[1]}"/></linearGradient></defs><rect width="${w}" height="${h}" rx="${h / 2}" fill="url(#${g})"/></svg>`, { shadow: false, go: o.go, alt: "Nhãn", z: o.z || 6 })}${chu("bh-vien", x, y + (h - px * 1.2) / 2, w, esc(text), { size: px, align: "center", color: o.chu || "ffffff", go: o.go })}`; };
const muiTen = () => { const g = uid("mt"); return `<svg viewBox="0 0 100 70" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9cc3ff"/><stop offset="1" stop-color="#0b57d0"/></linearGradient></defs><path d="M6 24 H58 V8 L94 35 L58 62 V46 H6 Z" fill="url(#${g})"/></svg>`; };
const thanh = (mau, r = 0.5) => { const g = uid("th"), m = GRAD[mau] || [mau, mau]; return `<svg viewBox="0 0 100 10" width="100%" height="100%" preserveAspectRatio="none"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#${m[0]}"/><stop offset="1" stop-color="#${m[1]}"/></linearGradient></defs><rect width="100" height="10" rx="${r}" fill="url(#${g})"/><rect x="1" y="1" width="98" height="3" rx="${r / 2}" fill="#fff" opacity=".28"/></svg>`; };
const tron = (mau) => `<svg viewBox="0 0 10 10" width="100%" height="100%" preserveAspectRatio="none"><rect width="10" height="10" fill="#${mau}"/></svg>`;

// ---------- dải tiêu đề, nguồn, chân trang ----------
const tieuDe = (s, o = {}) => { const w = o.w || 1340, px = o.px || 66, n = dong(s.title, w, px, "anton"), y = 126 + n * Math.round(px * 1.2);
  const subH = s.sub && !o.boSub ? 18 + dong(s.sub, o.subW || 1300, 30, 400) * 42 : 0;
  return { html: `${s.kicker ? vien("bh-kicker", 110, 60, s.kicker) : ""}${chu("bh-h", 110, 120, w, tx(s.title || ""), { size: px })}${s.sub && !o.boSub ? chu("bh-sub", 110, y + 18, o.subW || 1300, tx(s.sub)) : ""}`, day: y + subH }; };
const nguon = (t) => (t ? chu("bh-src", 110, String(t).length > 150 ? 930 : 958, 1700, esc(t)) : "");
const chan = (s, deck, i, n) => (["bhbia", "bhket"].includes(s.type) ? "" : `${chu("bh-ft", 110, 1022, 1000, esc(deck.meta?.short || ""))}${chu("bh-pg", 1610, 1018, 200, `${String(i + 1).padStart(2, "0")} / ${n}`, { align: "right" })}`);
const khung = (ctx, s, R, name = "bh-anh") => { const u = ctx && ctx.img(s.photo); if (!u) return "";
  return lop(name, R, `<div style="width:100%;height:100%;border-radius:30px;overflow:hidden;border:12px solid #fff;box-sizing:border-box;background:#fff"><img src="${u}" style="width:100%;height:100%;object-fit:cover;object-position:${s.photoPos || "center"};display:block"></div>`, { alt: s.photoAlt || "Ảnh minh hoạ", z: 3 }); };
// vật góc phải trên của slide nội dung (cùng tên Morph với hình chính của slide mở phần → "lùi máy quay")
const goc = (ten, name) => hero(name, ten, { x: 1560, y: 34, w: ten === "cot" ? 270 : 200, r: ten === "so" ? 6 : 0 });
const tenVat = (x, mac) => { const t = String(x || ""); return coF3d(t) ? t : mac; };

const S = {};

// 1 · BÌA — tiêu đề in hoa lớn bên trái; bên phải: ảnh thật đóng khung, sổ BHXH 3D, khiên kính, chồng xu; xu mờ tiền cảnh
S.bhbia = (s, deck, b, ctx) => { const px = s.titleSize || 92, n = dong(s.title, 960, px, "anton"), yS = 244 + n * Math.round(px * 1.18) + 30;
  return `${khung(ctx, s, { x: 1150, y: 70, w: 660, h: 440, r: 3 })}
    ${hero("bh-p-so", "so", { x: 1250, y: 330, w: 400, r: -6 })}${hero("bh-p-khien", "khien", { x: 1080, y: 600, w: 230 })}${hero("bh-p-xu", "xu", { x: 1600, y: 690, w: 250 })}
    ${vat("bh-mo1", "xu", { x: -60, y: 930, w: 230 }, { blur: 7, op: 0.85 })}${vat("bh-mo2", "can", { x: 960, y: 20, w: 150 }, { blur: 5, op: 0.7 })}
    ${vien("bh-kicker", 110, 180, s.kicker || "")}${chu("bh-h1", 110, 244, 960, tx(s.title || ""), { size: px })}
    ${s.subtitle ? chu("bh-sub", 110, yS, 900, tx(s.subtitle)) : ""}
    ${s.author ? `${vien("bh-au", 110, 860, `Trình bày: ${s.author}`, { mau: "xanh", px: 26 })}${chu("bh-aus", 110, 930, 900, esc([s.authorSub, s.date].filter(Boolean).join(" · ")))}` : ""}
    ${s.photoCredit ? chu("bh-cr", 1150, 1030, 700, esc(s.photoCredit)) : ""}`; };

// 2 · CÂU HỎI LỚN — câu hỏi khổng lồ; ba mặt sẽ đo (thẻ có vật 3D, nối bằng trục); sổ + khiên của bìa lùi về góc
S.bhdo = (s) => { const dims = s.dims || [{ icon: "can", t: "Về luật", d: "Ai phải đóng, đóng để được gì" }, { icon: "cong-nhan", t: "Về người tham gia", d: "Bao nhiêu người đóng mỗi năm" }, { icon: "xu", t: "Về quỹ", d: "Thu có đủ chi không" }];
  const L = (s.lines || []).length;
  return `${hero("bh-p-so", "so", { x: 1600, y: 26, w: 170, r: 8 })}${hero("bh-p-khien", "khien", { x: 1450, y: 96, w: 120 })}${vat("bh-mo1", "kinh-lup", { x: 560, y: 820, w: 190 }, { blur: 6, op: 0.75 })}
    ${vien("bh-kicker", 110, 220, s.kicker || "")}${chu("bh-q", 110, 280, 1000, tx((s.lines || []).join("\n")))}${chu("bh-qb", 110, 290 + L * 144, 1000, tx(s.box || ""))}
    ${lop("bh-truc", { x: 1146, y: 388, w: 6, h: 400 }, tron(P.sky2), { shadow: false, alt: "Trục nối" })}
    ${dims.slice(0, 3).map((x, k) => { const Y = 300 + k * 200; return `${the(`bh-dim${k}`, { x: 1180, y: Y, w: 630, h: 176 })}${lop(`bh-dot${k}`, { x: 1136, y: Y + 76, w: 26, h: 26 }, `<svg viewBox="0 0 26 26" width="100%" height="100%"><circle cx="13" cy="13" r="11" fill="#0b57d0" stroke="#fff" stroke-width="4"/></svg>`, { shadow: false, alt: "Điểm nối" })}
      ${vong(`bh-dimi${k}`, 1206, Y + 26, 124, tenVat(x.icon, "hoi"))}${chu("bh-ct", 1356, Y + 38, 430, esc(x.t))}${chu("bh-cd", 1356, Y + 94, 430, esc(x.d))}`; }).join("")}`; };

// 3 · KẾT LUẬN CHÍNH — hai thanh bóng 2015 / 2025 cùng thang; thẻ hệ số tăng (xanh đậm) + thẻ năm đi lùi (đỏ)
S.bhtang = (s) => { const H = tieuDe(s), st = s.stats || [], a = st[0] || {}, b = st[1] || {}, d = st[2] || {}, va = parseFloat(String(a.value).replace(",", ".")), vb = parseFloat(String(b.value).replace(",", "."));
  const top = Math.max(380, H.day + 60), k = 600 / vb, he = va ? so((vb / va).toFixed(2)) : "";
  const hang = (y, v, mau, nhan, nam, ten) => `${chu("bh-yr", 160, y + 22, 150, esc(nam))}${lop(ten, { x: 310, y, w: v * k, h: 104 }, thanh(mau, 1.4), { alt: `Thanh ${nam}` })}${chu("bh-bv", 330 + v * k, y + 12, 380, `${esc(String(nhan.value))}`, { color: mau === "nhat2" ? P.ink2 : P.blue })}${chu("bh-bu", 330 + v * k, y + 96, 380, "triệu người")}`;
  return `${H.html}${goc("cot", "bh-p-cot3")}${the("bh-pn", { x: 110, y: top, w: 1080, h: 470 })}
    ${hang(top + 60, va, "nhat2", a, String(a.label || "").split("·")[0].trim() || "2015", "bh-t15")}${hang(top + 230, vb, "xanh", b, String(b.label || "").split("·")[0].trim() || "2025", "bh-t25")}
    ${chu("bh-cd", 160, top + 392, 900, esc(`Số người ${a.desc || "đóng BHXH bắt buộc"}`))}
    ${the("bh-he", { x: 1230, y: top, w: 580, h: 220 }, { nen: "dam" })}${chu("bh-hev", 1270, top + 46, 320, he, { color: "ffffff" })}${chu("bh-hel", 1294 + rong(he, 120, "anton"), top + 78, 470 - rong(he, 120, "anton"), "lần sau mười năm", { color: "ffffff" })}
    ${d.value ? `${the("bh-lui", { x: 1230, y: top + 250, w: 580, h: 220 }, { nen: "do" })}${chu("bh-hev", 1270, top + 296, 320, esc(d.value), { color: "ffffff" })}${chu("bh-hel", 1294 + rong(String(d.value), 120, "anton"), top + 318, 470 - rong(String(d.value), 120, "anton"), esc(d.desc || ""), { color: "ffffff" })}` : ""}`; };

// 4 · BA CÂU HỎI — ba thẻ có dải xanh đầu thẻ, số phần, vật 3D; bấm để mở phần
const VAT_PHAN = ["can", "bieu-do-cot", "bang-kep"], HERO_PHAN = ["khien", "cot", "kiem"];
S.bhba = (s) => { const H = tieuDe(s), it = (s.items || []).slice(0, 3), top = Math.max(330, H.day + 60);
  return `${H.html}${vat("bh-mo1", "kinh-lup", { x: 1620, y: 40, w: 180 }, {})}${it.map((x, k) => { const X = 110 + k * 580;
    return `${the(`bh-ba${k}`, { x: X, y: top, w: 540, h: 470 }, { dai: "xanh", daiH: 120, go: x.go })}${chu("bh-bk", X + 40, top + 36, 300, `Phần ${k + 1}`, { go: x.go })}
      ${vong(`bh-bai${k}`, X + 370, top + 40, 140, VAT_PHAN[k], { go: x.go })}${chu("bh-bn", X + 40, top + 150, 200, `0${k + 1}`, { go: x.go })}${chu("bh-bq", X + 40, top + 270, 460, esc(x.q), { go: x.go })}`; }).join("")}
    ${chu("bh-hint", 110, top + 500, 1500, esc(s.hint || "Bấm vào một thẻ để mở phần đó"))}`; };

// 5 · 14 · 21 · MỞ PHẦN — số phần khổng lồ + câu hỏi của phần; bên phải hình chính 3D trên quầng sáng (slide sau thu nó về góc)
const VAT_QUANH = [["can", "sach-mo"], ["xu", "bieu-do-tang"], ["kinh-lup", "dau-tich"]];
S.bhchuong = (s) => { const k = Math.max(0, Math.min(2, (+s.num || 1) - 1)), n = dong(s.title, 960, 76, "anton"), H = HERO_PHAN[k];
  return `${lop("bh-quang", { x: 1080, y: 120, w: 820, h: 820 }, `<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><radialGradient id="${uid("q")}g" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#d9e8ff" stop-opacity=".9"/><stop offset="1" stop-color="#d9e8ff" stop-opacity="0"/></radialGradient></defs><circle cx="50" cy="50" r="50" fill="url(#${"q" + U}g)"/></svg>`, { shadow: false, alt: "Quầng sáng", z: 2 })}
    ${hero(`bh-p-hero${k + 1}`, H, H === "cot" ? { x: 1180, y: 300, w: 600 } : H === "kiem" ? { x: 1280, y: 220, w: 440 } : { x: 1290, y: 230, w: 430 })}
    ${vat("bh-q1", VAT_QUANH[k][0], { x: 1140, y: 700, w: 170 }, {})}${vat("bh-q2", VAT_QUANH[k][1], { x: 1680, y: 150, w: 150 }, { blur: 3, op: 0.9 })}${vat("bh-mo1", "xu", { x: 860, y: 860, w: 170 }, { blur: 7, op: 0.7 })}
    ${vien("bh-kicker", 110, 160, `${s.partWord || "Phần"} ${s.num} · ${s.part || ""}`)}${chu("bh-pnum", 96, 220, 700, String(s.num).padStart(2, "0"))}
    ${chu("bh-hc", 110, 560, 960, tx(s.title || ""))}${s.sub ? chu("bh-sub", 110, 560 + n * 91 + 26, 900, tx(s.sub)) : ""}`; };

// 6 · TRÍCH LUẬT — thẻ trích nguyên văn (dấu ngoặc khổng lồ, cụm nhấn tô vàng) + thẻ xanh đậm "ý then chốt"
S.bhtrich = (s) => { const H = tieuDe(s), top = Math.max(300, H.day + 44), nt = String(s.note || ""), [dauN, sauN] = nt.includes(":") ? [nt.slice(0, nt.indexOf(":")), nt.slice(nt.indexOf(":") + 1)] : ["Ý then chốt", nt];
  const y = sauN.split("·").map((t) => t.trim()).filter(Boolean).slice(0, 3), VY = ["toa-nha", "khoa", "dau-tich"], h = 620;
  return `${H.html}${goc("khien", "bh-p-hero1")}${the("bh-qc", { x: 110, y: top, w: 1150, h })}${chu("bh-qm", 150, top - 6, 200, "“")}
    ${chu("bh-qt", 170, top + 120, 1040, f(s.quote || ""))}${vien("bh-qby", 170, top + h - 150, s.by || "", { px: 24 })}${chu("bh-qro", 170, top + h - 82, 1040, esc(s.role || ""))}
    ${nt ? `${the("bh-yc", { x: 1300, y: top, w: 510, h }, { nen: "dam" })}${chu("bh-ych", 1340, top + 40, 430, esc(dauN.trim()), { color: "ffffff" })}
      ${y.map((t, k) => `${vong(`bh-yi${k}`, 1340, top + 130 + k * 210, 140, VY[k])}${chu("bh-yt", 1500, top + 172 + k * 210, 290, esc(t.charAt(0).toUpperCase() + t.slice(1)), { color: "ffffff" })}`).join("")}` : ""}`; };

// 7 · 8 · BA CỘT — ba thẻ cùng khuôn: vật 3D trong vòng tròn, tên, nhãn viên thuốc, giải thích
const baCot = (s, mac) => { const H = tieuDe(s, { w: 1600 }), it = (s.items || []).slice(0, 3), top = Math.max(330, H.day + 56), h = 380 + Math.max(...it.map((x) => dong(x.desc, 460, 28, 400))) * 40;
  return `${H.html}${vat("bh-mo1", "xu", { x: 1820, y: 210, w: 180 }, { blur: 7, op: 0.7 })}${it.map((x, k) => { const X = 110 + k * 580;
    return `${the(`bh-c${k}`, { x: X, y: top, w: 540, h }, { dai: "xanh" })}${vong(`bh-ci${k}`, X + 40, top + 44, 160, mac[k])}
      ${chu("bh-cn", X + 40, top + 228, 460, esc(x.name || ""))}${x.who ? vien(`bh-cw${k}`, X + 40, top + 288, x.who, { mau: "nhat", chu: P.blue, px: 22 }) : ""}${chu("bh-cx", X + 40, top + 356, 460, tx(x.desc || ""))}`; }).join("")}`; };
S.bhvaitro = (s) => baCot(s, ["o-mua", "can", "gio-hang"]);
S.bhnhom = (s) => baCot(s, ["cong-nhan", "dia-cau", "van-phong"]);

// 9 · NHÓM MỚI — năm thẻ vật 3D + dải số lớn xanh đậm
const VAT_NHOM = { l: "dong-ho", m: "cua-hang", n: "cap", e: "mu-quan", k: "nha" };
S.bhmorong = (s) => { const H = tieuDe(s), it = (s.items || []).slice(0, 5), top = Math.max(320, H.day + 56);
  return `${H.html}${vat("bh-mo1", "nhan-vien", { x: 1610, y: 40, w: 190 }, {})}${it.map((x, k) => { const X = 110 + k * 346;
    return `${the(`bh-m${k}`, { x: X, y: top, w: 316, h: 330 }, { dai: "xanh" })}${vong(`bh-mi${k}`, X + 88, top + 36, 140, VAT_NHOM[x.k] || "nguoi")}${chu("bh-mt", X + 20, top + 196, 276, esc(x.text), { align: "center" })}`; }).join("")}
    ${s.big ? `${the("bh-big", { x: 110, y: top + 370, w: 1700, h: 180 }, { nen: "dam" })}${chu("bh-bigv", 160, top + 392, 560, esc(s.big.value), { color: "ffffff" })}${chu("bh-bigl", 760, top + 436, 1010, esc(s.big.label || ""), { color: "ffffff" })}` : ""}
    ${nguon(s.source)}`; };

// 10 · MỐC HƯU (hai bước) — 20 ô năm bóng; bước 2: 5 ô cuối thành ô nét đứt, mốc phong bì lương hưu trượt về sau ô 15
S.bhrutngan = (s, deck, b) => { const c0 = (s.cols || [])[0] || { n: 20, label: "" }, c1 = (s.cols || [])[1] || { n: 15, label: "" }, N = c0.n, M = c1.n, n = b === 2 ? M : N, X = 110, Y = 560, Pp = 82, O = 70;
  const o = (from, to, kieu) => { const g = uid("o"); return `<svg viewBox="0 0 ${(to - from) * Pp - 12} ${O}" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#${kieu === "x" ? "3a8bff" : "7d8fb0"}"/><stop offset="1" stop-color="#${kieu === "x" ? "0b57d0" : "4a5a78"}"/></linearGradient></defs>${Array.from({ length: to - from }, (_, k) => kieu === "rong" ? `<rect x="${k * Pp + 2}" y="2" width="${O - 4}" height="${O - 4}" rx="16" fill="#ffffff" fill-opacity=".6" stroke="#${P.faint}" stroke-width="3" stroke-dasharray="8 6"/>` : `<rect x="${k * Pp}" y="0" width="${O}" height="${O}" rx="16" fill="url(#${g})"/><rect x="${k * Pp + 8}" y="6" width="${O - 16}" height="14" rx="7" fill="#fff" opacity=".3"/>`).join("")}</svg>`; };
  const ranh = X + n * Pp - 6, nhan = b === 2 ? c1 : c0;
  return `${tieuDe(s).html}${vat("bh-mo1", "lich", { x: 1630, y: 40, w: 170 }, {})}
    ${chu("bh-rn", 110, 290, 1500, `<b>${n} năm đóng</b> ${esc(nhan.label || "")}`)}
    ${lop("bh-o15", { x: X, y: Y, w: M * Pp - 12, h: O }, o(0, M, b === 2 ? "x" : "g"), { m: "bh-o15", alt: `${M} năm đóng đầu` })}
    ${lop("bh-o5", { x: X + M * Pp, y: Y, w: (N - M) * Pp - 12, h: O }, o(M, N, b === 2 ? "rong" : "g"), { m: "bh-o5", alt: `Năm ${M + 1}–${N}` })}
    ${[1, 5, 10, 15, 20].filter((t) => t <= N).map((t) => chu("bh-tick", X + (t - 1) * Pp - 18, Y + O + 14, O + 36, String(t), { align: "center" })).join("")}
    ${lop("bh-moc", { x: ranh - 64, y: Y - 196, w: 128, h: 186 }, `<svg viewBox="0 0 128 186" width="100%" height="100%"><path d="M64 128 V186" stroke="#e8930c" stroke-width="6"/><circle cx="64" cy="64" r="62" fill="#ffffff" stroke="#ffc94a" stroke-width="5"/><image href="${f3d("phong-bi")}" x="20" y="20" width="88" height="88"/></svg>`, { m: "bh-moc", alt: "Mốc lương hưu" })}
    ${vien("bh-mocl", ranh - 330, Y - 150, "Lương hưu", { mau: "vang", chu: "5a3800", w: 240 })}
    ${chu("bh-leg", 110, Y + O + 66, 900, esc(s.legend || "Mỗi ô là một năm đóng BHXH"))}
    ${s.ref ? `${the("bh-ref", { x: 110, y: 770, w: 1700, h: 150 }, { dai: "xanh", daiH: 12 })}${chu("bh-refh", 150, 800, 1600, esc(s.ref.head || ""))}${chu("bh-reft", 150, 842, 1620, f(s.ref.text || ""))}` : ""}
    ${nguon(s.source)}`; };

// 11 · NĂM CHẾ ĐỘ TRÊN ĐƯỜNG ĐỜI — người lao động 3D + trục thời gian 5 mốc (vòng trắng có vật 3D), mốc hưu viền vàng
S.bhduong = (s) => { const H = tieuDe(s), st = (s.stages || []).slice(0, 5), top = Math.max(300, H.day + 40), LY = top + 300, VD = ["nhiet-ke", "binh-sua", "bang-dan", "nguoi-gia", "hoa-sen"];
  return `${H.html}${vat("bh-nld", "cong-nhan-nu", { x: 90, y: LY - 150, w: 220 }, {})}${s.who ? `${chu("bh-whon", 70, LY + 84, 260, esc(s.who.name || ""), { align: "center" })}${chu("bh-whos", 50, LY + 130, 300, esc(s.who.sub || ""), { align: "center" })}` : ""}
    ${lop("bh-truc", { x: 340, y: LY - 5, w: 1460, h: 10 }, thanh("xanh", 5), { shadow: false, alt: "Trục thời gian" })}
    ${st.map((x, k) => { const cx = 470 + k * 330, chinh = k === (s.focus ?? -1);
      return `${lop(`bh-dv${k}`, { x: cx - 80, y: LY - 80, w: 160, h: 160 }, `<svg viewBox="0 0 160 160" width="100%" height="100%"><circle cx="80" cy="80" r="74" fill="#ffffff" stroke="#${chinh ? "ffc94a" : "9cc3ff"}" stroke-width="${chinh ? 10 : 6}"/></svg>`, { alt: "Mốc" })}
        ${vat(`bh-di${k}`, VD[k], { x: cx - 52, y: LY - 52, w: 104 }, { z: 7 })}
        ${chu("bh-dw", cx - 160, LY - 160, 320, esc(x.when || ""), { align: "center", color: chinh ? P.goldD : P.navy })}
        ${chu("bh-de", cx - 160, LY + 100, 320, esc(x.event || ""), { align: "center" })}${chu("bh-dl", cx - 160, LY + 196, 320, esc(x.link || ""), { align: "center", color: chinh ? P.goldD : P.blue })}`; }).join("")}
    ${nguon(s.note)}`; };

// 12 · NĂM THẺ CHẾ ĐỘ — dải xanh đầu thẻ có vật 3D; thẻ hưu trí dải vàng
S.bhphieu5 = (s) => { const H = tieuDe(s), cols = (s.cols || []).slice(0, 5), rows = s.rows || [], top = Math.max(300, H.day + 50), VD = ["nhiet-ke", "binh-sua", "bang-dan", "nguoi-gia", "hoa-sen"];
  return `${H.html}${cols.map((c, k) => { const X = 110 + k * 346, chinh = k === s.focus;
    return `${the(`bh-f${k}`, { x: X, y: top, w: 316, h: 640 }, { dai: chinh ? "vang" : "xanh", daiH: 110 })}${vong(`bh-fi${k}`, X + 98, top + 40, 120, VD[k])}
      ${chu("bh-fn", X + 16, top + 176, 284, esc(c.name || ""), { align: "center" })}
      ${(c.cells || []).slice(0, 2).map((t, j) => `${chu("bh-fr", X + 26, top + 248 + j * 196, 264, esc(rows[j]?.label || ""), { color: chinh ? P.goldD : P.blue })}${chu("bh-fc", X + 26, top + 286 + j * 196, 264, f(t))}`).join("")}`; }).join("")}`; };

// 13 · CÔNG THỨC (hai bước) — ba thẻ công thức có vật 3D; thanh tỷ lệ hưởng bóng 45 % → 65 % (kèm nhãn ở đầu thanh)
S.bhcongthuc = (s, deck, b) => { const t = s.terms || [], p = b === 2 ? 65 : 45, X = 110, W = 1700, k = W / 80, BY = 660;
  const hop = (x, ten, nhan, v) => `${the(`bh-h${ten}`, { x, y: 300, w: 480, h: 170 })}${vong(`bh-hi${ten}`, x + 26, 322, 126, v)}${chu("bh-hl", x + 170, 352, 290, esc(nhan))}`;
  return `${tieuDe(s, { w: 1600 }).html}
    ${hop(110, "lh", s.result?.label || "Lương hưu hằng tháng", "phong-bi")}${chu("bh-op", 590, 318, 120, "=", { align: "center" })}${hop(710, "tl", t[0]?.label || "Tỷ lệ hưởng", "bieu-do-tang")}${chu("bh-op", 1190, 318, 120, "×", { align: "center" })}${hop(1310, "bq", t[1]?.label || "Bình quân tiền lương", "trang-giay")}
    ${chu("bh-hnote", 1310, 486, 500, esc(t[1]?.note || ""))}
    ${lop("bh-ray", { x: X, y: BY, w: W, h: 64 }, thanh("nhat", 3.2), { shadow: false, alt: "Thang tỷ lệ hưởng" })}
    ${lop("bh-fill", { x: X, y: BY, w: p * k, h: 64 }, thanh("xanh", 3.2), { m: "bh-fill", alt: `Tỷ lệ hưởng ${p}%` })}
    ${[0, 45, 75].map((v) => `${lop(`bh-v${v}`, { x: X + v * k - 2, y: BY + 70, w: 4, h: 18 }, tron(P.mute), { shadow: false, alt: "Vạch" })}${chu("bh-tick", X + v * k - 120, BY + 96, 240, v === 75 ? "75% (tối đa)" : `${v}%`, { align: "center" })}`).join("")}
    ${chu("bh-ctp", X + p * k - 860, BY - 94, 860, `<b>${p}%</b> ${esc(b === 2 ? (s.buoc2 || "nữ đóng 25 năm") : (s.buoc1 || "nữ đóng 15 năm"))}`, { align: "right" })}
    ${the("bh-vd", { x: 110, y: 820, w: 1700, h: 100 }, { nen: "nhat", bong: false })}${chu("bh-cte", 150, 846, 1640, f(b === 2 ? (s.example || "") : (t[0]?.note || "")))}
    ${nguon(s.note)}`; };

// 15 · 17 · BIỂU ĐỒ CỘT (hai bước khi "grow" khác false) — cột bóng mọc từ trục; số chú thích tại năm; thẻ kết luận xanh đậm
S.bhcot2 = (s, deck, b) => { const H = tieuDe(s), hai = s.grow !== false, xong = !hai || b === 2, it = s.items || [], n = it.length, top = Math.max(290, H.day + 40);
  const CR = s.insight ? 1340 : 1810, X0 = 190, X1 = CR - 50, Y0 = top + 440, Y1 = top + 140, hi = Math.max(...it.map((x) => x.value)) * 1.08;
  const cw = (X1 - X0) / n, bw = cw * 0.58, xs = (k) => X0 + cw * (k + 0.5), ys = (v) => Y0 - (Y0 - Y1) * v / hi;
  const mau = (x, k) => (x.focus ? "vang" : x.tone === "bad" || (k && x.value < it[k - 1].value) ? "do" : "xanh");
  const bands = (s.bands || []).map((bd) => { const a = it.findIndex((x) => x.label === bd.from), e = it.findIndex((x) => x.label === bd.to); if (a < 0 || e < 0) return ""; const x0 = xs(a) - cw / 2, x1 = xs(e) + cw / 2;
    return `${lop("bh-band", { x: x0, y: Y1 - 44, w: x1 - x0, h: Y0 - Y1 + 44 }, tron(P.redT), { shadow: false, z: 5, alt: "Dải giai đoạn" })}${chu("bh-bl", x0, Y1 - 36, x1 - x0, esc(String(bd.label)), { align: "center" })}`; }).join("");
  const cot = it.map((x, k) => { const y = xong ? ys(x.value) : Y0 - 6; return lop(`bh-cot${k + 1}`, { x: xs(k) - bw / 2, y, w: bw, h: Y0 - y }, `<svg viewBox="0 0 10 100" width="100%" height="100%" preserveAspectRatio="none"><defs><linearGradient id="${uid("cg")}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#${GRAD[mau(x, k)][0]}"/><stop offset="1" stop-color="#${GRAD[mau(x, k)][1]}"/></linearGradient></defs><rect width="10" height="100" fill="url(#cg${U})"/><rect x="1" width="2" height="100" fill="#fff" opacity=".3"/></svg>`, { shadow: false, m: `bh-cot${k + 1}`, z: 7, alt: `Cột ${x.label}` }); }).join("");
  const nhan = it.map((x, k) => `${chu("bh-cy", xs(k) - 55, Y0 + 14, 110, esc(x.label), { align: "center" })}${xong ? chu("bh-cv", xs(k) - 75, ys(x.value) - 50, 150, esc(x.display || so(x.value)), { align: "center", color: mau(x, k) === "do" ? P.redD : mau(x, k) === "vang" ? P.goldD : P.navy }) : ""}`).join("");
  const whys = it.map((x, k) => (x.why ? k : -1)).filter((k) => k >= 0).slice(0, 4);
  const cham = (name, x, y, j, trong) => `${lop(name, { x, y, w: 42, h: 42 }, `<svg viewBox="0 0 42 42" width="100%" height="100%"><circle cx="21" cy="21" r="19" fill="#${trong ? "ffffff" : P.red}" stroke="#${trong ? P.red : "ffffff"}" stroke-width="3"/></svg>`, { shadow: false, z: 9, alt: "Số chú thích" })}${chu("bh-wn", x, y + 6, 42, String(j + 1), { align: "center", color: trong ? P.red : "ffffff" })}`;
  const so1 = xong ? whys.map((k, j) => { const y = ys(it[k].value), trong = Y0 - y > 70; return cham(`bh-wd${j}`, xs(k) - 21, trong ? y + 10 : y - 102, j, trong); }).join("") : "";
  const why = xong ? whys.map((k, j) => { const x = 150 + (j % 2) * ((CR - 150) / 2), y = Y0 + 70 + Math.floor(j / 2) * 70; return `${cham(`bh-wc${j}`, x, y, j)}${chu("bh-wt", x + 56, y + 4, (CR - 150) / 2 - 80, `<b>${esc(it[k].label)}</b> ${f(it[k].why)}`)}`; }).join("") : "";
  const ins = s.insight || {};
  const the2 = s.insight && xong ? `${the("bh-ins", { x: 1380, y: top, w: 430, h: 480 }, { nen: "dam" })}${chu("bh-iv", 1414, top + 44, 380, f(ins.value || ""), { size: String(ins.value || "").length > 5 ? 96 : 120, color: "ffffff" })}${chu("bh-iu", 1414, top + 200, 370, f(ins.unit || ""), { color: "ffffff" })}${chu("bh-it", 1414, top + 300, 370, f(ins.text || ""), { color: "dce9ff" })}` : "";
  return `${H.html}${goc("cot", "bh-p-hero2")}${the("bh-khung", { x: 110, y: top, w: CR - 110, h: 660 })}${chu("bh-cu", 150, top + 30, 700, esc(s.unit ? `Đơn vị: ${s.unit}` : ""))}
    ${lop("bh-truc", { x: X0 - 20, y: Y0, w: X1 - X0 + 40, h: 4 }, tron(P.ink2), { shadow: false, z: 8, alt: "Trục" })}${bands}${cot}${nhan}${so1}${why}${the2}${nguon(s.note)}`; };

// 16 · ĐÃ PHỦ BAO NHIÊU — 50 người 3D (1 người = 2 %): màu = có BHXH, mờ xám = chưa
S.bhche = (s) => { const H = tieuDe(s), c0 = (s.cols || [])[0] || {}, c1 = (s.cols || [])[1] || {}, n0 = c0.n || 21, N = n0 + (c1.n || 29), top = Math.max(320, H.day + 50), u = f3d("nguoi");
  const luoi = `<div style="position:relative;width:100%;height:100%">${Array.from({ length: N }, (_, k) => `<img src="${u}" style="position:absolute;left:${(k % 10) * 94}px;top:${Math.floor(k / 10) * 94}px;width:84px;height:84px;${k < n0 ? "" : "filter:grayscale(1);opacity:.38;"}">`).join("")}</div>`;
  return `${H.html}${the("bh-lk", { x: 110, y: top, w: 990, h: 560 })}${lop("bh-luoi", { x: 150, y: top + 40, w: 930, h: 460 }, luoi, { shadow: false, alt: `${N} người, ${n0} người có BHXH` })}
    ${chu("bh-leg", 150, top + 506, 900, esc(s.legend || "Mỗi người = 2% lực lượng lao động"))}
    ${the("bh-s0", { x: 1150, y: top, w: 660, h: 265 }, { nen: "dam" })}${chu("bh-pv", 1190, top + 34, 400, `${esc(c0.value || "42")}%`, { color: "ffffff" })}${chu("bh-pl", 1190, top + 178, 600, esc(c0.label || ""), { color: "ffffff" })}
    ${the("bh-s1", { x: 1150, y: top + 295, w: 660, h: 265 }, { nen: "do" })}${chu("bh-pv", 1190, top + 329, 400, `${esc(c1.value || "58")}%`, { color: "ffffff" })}${chu("bh-pl", 1190, top + 473, 600, esc(c1.label || ""), { color: "ffffff" })}
    ${nguon(s.source)}`; };

// 18 · QUỸ — thanh ngang bóng thu − chi từng năm; 2023–2025 nét đứt xám (khác phạm vi, không so); chồng xu 3D ở góc
S.bhquy = (s) => { const H = tieuDe(s), rows = s.rows || [], k1 = rows.findIndex((x) => x.label === (s.den || "2022")), RH = 50, top = Math.max(330, H.day + 80), Z = 420, KX = 620 / Math.max(...rows.map((x) => Math.abs(x.value)));
  const W = 960, g = uid("qg"), g2 = uid("qv");
  const bars = rows.map((x, k) => { const y = k * RH + 8, w = Math.abs(x.value) * KX, xa = k > k1, x0 = x.value < 0 ? Z - 110 - w : Z - 110;
    return xa ? `<rect x="${x0 + 1.5}" y="${y + 1.5}" width="${w - 3}" height="${RH - 19}" rx="8" fill="#ffffff" stroke="#${P.faint}" stroke-width="3" stroke-dasharray="7 5"/>` : `<rect x="${x0}" y="${y}" width="${w}" height="${RH - 16}" rx="8" fill="url(#${x.focus ? g2 : g})"/><rect x="${x0 + 4}" y="${y + 4}" width="${Math.max(0, w - 8)}" height="7" rx="3.5" fill="#fff" opacity=".3"/>`; }).join("");
  const svg = `<svg viewBox="0 0 ${W} ${rows.length * RH}" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a8bff"/><stop offset="1" stop-color="#0b57d0"/></linearGradient><linearGradient id="${g2}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc94a"/><stop offset="1" stop-color="#e8930c"/></linearGradient></defs>${bars}<path d="M${Z - 110} 0 V${rows.length * RH}" stroke="#${P.ink2}" stroke-width="3"/></svg>`;
  const chuBang = rows.map((x, k) => { const y = top + k * RH, xa = k > k1, w = Math.abs(x.value) * KX;
    return `${chu("bh-qy", 150, y + 6, 120, esc(x.label), { color: xa ? P.mute : P.navy })}${chu("bh-qv", x.value < 0 ? Z - w - 150 : Z + w + 16, y + 4, 130, esc(x.display || so(x.value)), { align: x.value < 0 ? "right" : "left", color: xa ? P.mute : x.focus ? P.goldD : P.navy })}`; }).join("");
  const ghi = rows.map((x, k) => ({ x, k })).filter(({ x, k }) => x.note && k <= k1).map(({ x, k }) => chu("bh-qn", 1290, top + k * RH + 6, 520, `<b>${esc(x.label)}</b> ${esc(x.note)}`)).join("");
  const ngoai = k1 >= 0 && k1 < rows.length - 1 ? `${lop("bh-qngoac", { x: 1260, y: top + (k1 + 1) * RH, w: 14, h: (rows.length - k1 - 1) * RH - 10 }, `<svg viewBox="0 0 14 100" width="100%" height="100%" preserveAspectRatio="none"><path d="M2 2 H12 V98 H2" stroke="#${P.faint}" stroke-width="3" fill="none"/></svg>`, { shadow: false, alt: "Ngoặc" })}${chu("bh-qn", 1290, top + (k1 + 1) * RH + 34, 520, esc(s.ngoai || "Phạm vi khác — chưa so được với 2015–2022"), { color: P.mute })}` : "";
  return `${H.html}${hero("bh-xu18", "xu", { x: 1590, y: 40, w: 210 })}${the("bh-qk", { x: 110, y: top - 70, w: 1180, h: rows.length * RH + 110 })}${chu("bh-cu", 150, top - 48, 900, esc(s.unit ? `Đơn vị: ${s.unit} · thu − chi` : ""))}
    ${lop("bh-quy", { x: 110, y: top, w: W, h: rows.length * RH }, svg, { shadow: false, alt: "Biểu đồ thu − chi" })}${chuBang}${ghi}${ngoai}${nguon(s.note)}`; };

// 19 · RÚT MỘT LẦN — số đỏ khổng lồ; ba thẻ ý có vật 3D
S.bhrut = (s) => { const H = tieuDe(s, { boSub: true }), top = Math.max(330, H.day + 50), fa = (s.facts || []).slice(0, 3), VD = ["dong-ho-cat", "cong-nhan", "xu"];
  return `${H.html}${vat("bh-cua", "cua", { x: 1640, y: 30, w: 170 }, {})}${vat("bh-ng", "nguoi-di", { x: 1500, y: 90, w: 150 }, {})}
    ${chu("bh-hero", 96, top - 50, 860, esc(s.num || ""))}${chu("bh-heu", 110, top + 330, 800, esc(s.unit || ""))}
    ${fa.map((x, k) => { const Y = top + k * 200; return `${the(`bh-r${k}`, { x: 980, y: Y, w: 830, h: 176 }, { dai: "do", daiH: 10 })}${vong(`bh-ri${k}`, 1010, Y + 30, 120, tenVat(x.icon === "hourglass" ? "dong-ho-cat" : x.icon === "users-three" ? "cong-nhan" : x.icon === "piggy-bank" ? "xu" : x.icon, VD[k]), { mau: "do" })}${chu("bh-rt", 1160, Y + 50, 620, esc(x.text || x))}`; }).join("")}`; };

// 20 · HỆ QUẢ RÚT MỘT LẦN — luồng: tình huống → thẻ đỏ "mất thời gian" → hai hệ quả
S.bhmat = (s) => { const H = tieuDe(s), ca = s.cause || {}, rs = (s.results || []).slice(0, 2), top = Math.max(310, H.day + 50), st = s.stamp || {};
  return `${H.html}${the("bh-ca", { x: 110, y: top, w: 500, h: 540 }, { dai: "xanh" })}${vong("bh-cai", 150, top + 44, 140, "nguoi-di")}${chu("bh-ctg", 150, top + 214, 420, esc(ca.tag || "Tình huống"))}${chu("bh-ctx", 150, top + 260, 420, tx(ca.text || ""))}
    ${lop("bh-mt1", { x: 628, y: top + 236, w: 92, h: 64 }, muiTen(), { shadow: false, alt: "Mũi tên" })}
    ${the("bh-dm", { x: 738, y: top, w: 460, h: 540 }, { nen: "do" })}${vong("bh-dmi", 893, top + 44, 150, "dong-ho-cat", { mau: "do" })}
    ${chu("bh-dmt", 768, top + 230, 400, esc(String(st.text || "Mất thời gian").replace(/\n/g, " ")), { align: "center" })}${chu("bh-dms", 768, top + 436, 400, esc(st.sub || ""), { align: "center" })}
    ${lop("bh-mt2", { x: 1216, y: top + 236, w: 92, h: 64 }, muiTen(), { shadow: false, alt: "Mũi tên" })}
    ${rs.map((x, k) => { const Y = top + k * 285; return `${the(`bh-kq${k}`, { x: 1326, y: Y, w: 484, h: 255 }, { dai: "do", daiH: 10 })}${chu("bh-kt", 1366, Y + 40, 416, esc(x.text || ""))}${vien(`bh-kr${k}`, 1366, Y + 178, x.ref || "", { mau: "do", px: 22 })}`; }).join("")}
    ${nguon(s.source)}`; };

// 22 · ĐẠT ĐƯỢC — bốn thẻ số liệu có vật 3D; bảng kiểm của slide mở phần 3 thu về góc
S.bhdat = (s) => { const H = tieuDe(s), c = (s.cells || []).slice(0, 4), top = Math.max(310, H.day + 50), VD = ["bieu-do-tang", "dien-thoai", "hop-ho-so", "can"];
  return `${H.html}${goc("kiem", "bh-p-hero3")}${c.map((x, k) => { const X = 110 + (k % 2) * 865, Y = top + Math.floor(k / 2) * 310;
    return `${the(`bh-d${k}`, { x: X, y: Y, w: 835, h: 280 }, { dai: "xanh", daiH: 10 })}${vong(`bh-di${k}`, X + 40, Y + 60, 150, VD[k])}
      ${x.value ? chu("bh-dv", X + 220, Y + 34, 580, esc(x.value)) : ""}${chu("bh-dh", X + 220, Y + (x.value ? 150 : 60), 580, esc(x.head || ""))}${chu("bh-dt", X + 220, Y + (x.value ? 200 : 114), 580, esc(x.text || ""))}`; }).join("")}`; };

// 23 · 24 · HẠN CHẾ / KIẾN NGHỊ — ba thẻ cùng chỗ ở hai slide: dải đỏ (hạn chế) → dải xanh (kiến nghị)
const ba = (s, kn) => { const H = tieuDe(s), it = (s.items || []).slice(0, 3), lab = s.labels || [], top = Math.max(330, H.day + 56), VD = kn ? ["khoa", "sua-chua", "cua-hang"] : ["cua", "canh-bao", "nguoi-chay"];
  return `${H.html}${it.map((x, k) => { const X = 110 + k * 580;
    return `${the(`bh-hc${k}`, { x: X, y: top, w: 540, h: 540 }, { dai: kn ? "xanh" : "do", daiH: 120 })}${chu("bh-hn", X + 36, top + (dong(x.name, 330, 44, "anton") > 1 ? 18 : 38), 330, esc(x.name || ""), { color: "ffffff", size: dong(x.name, 330, 44, "anton") > 1 ? 36 : 44 })}${vong(`bh-hi${k}`, X + 380, top + 26, 130, VD[k], { mau: kn ? "" : "do" })}
      ${chu("bh-hw", X + 36, top + 160, 470, `${lab[0] ? `<i>${esc(lab[0])}:</i> ` : ""}${esc(x.who || "")}`, { color: kn ? P.blue : P.redD })}
      ${chu("bh-hd", X + 36, top + 236, 470, tx(x.desc || ""))}${x.ref ? vien(`bh-href${k}`, X + 36, top + 460, x.ref, { mau: "nhat", chu: P.ink2, px: 20 }) : ""}`; }).join("")}`; };
S.bhhanche = (s) => ba(s, false);
S.bhkiennghi = (s) => ba(s, true);

// 25 · TRẮC NGHIỆM — bốn thẻ đáp án (vòng chữ cái gradient); slide sai / đúng có dấu 3D
S.bhhoi = (s, deck, b) => { const op = (s.options || []).slice(0, 4), id = s.id || "cau-hoi", ok = op.findIndex((x) => x.ok);
  const nut = (txt, go, x, y, mau) => vien("bh-nut", x, y, txt, { mau, px: 30, w: 360, go });
  if (b === "sai" || b === "dung") { const d = b === "dung" ? s.right || {} : s.wrong || {}, dung = b === "dung";
    return `${vien("bh-kicker", 110, 60, s.kicker || "")}${vat("bh-kq", dung ? "dau-tich" : "dau-x", { x: 110, y: 200, w: 180 }, {})}${chu("bh-qd", 330, 214, 1400, esc(d.title || ""), { color: dung ? "14a06a" : P.red })}
      ${dung && ok >= 0 ? `${the("bh-dung", { x: 110, y: 440, w: 835, h: 160 }, { dai: "xanh", daiH: 10 })}${chu("bh-opl2", 160, 474, 90, "ABCD"[ok], { color: P.blue })}${chu("bh-opt", 270, 488, 650, esc(op[ok].text))}` : ""}
      ${chu("bh-qx", 110, dung ? 650 : 440, 1500, f(d.text || d.hint || ""))}${nut(d.button || (dung ? "Tiếp tục" : "Thử lại"), dung ? (s.next || null) : id, 110, 860, dung ? "xanh" : "do")}
      ${vat("bh-mo1", "hoi", { x: 1600, y: 760, w: 220 }, { blur: 4, op: 0.8 })}`; }
  const H = tieuDe(s);
  return `${H.html}${vat("bh-hoi", "hoi", { x: 1640, y: 36, w: 170 }, {})}${op.map((x, k) => { const X = 110 + (k % 2) * 865, Y = 340 + Math.floor(k / 2) * 260, go = `${id}-${x.ok ? "dung" : "sai"}`;
    return `${the(`bh-op${k}`, { x: X, y: Y, w: 835, h: 220 }, { go })}${lop(`bh-opc${k}`, { x: X + 40, y: Y + 50, w: 120, h: 120 }, `<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><linearGradient id="${uid("og")}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a8bff"/><stop offset="1" stop-color="#0b57d0"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#og${U})"/></svg>`, { shadow: false, go, alt: "Vòng chữ cái" })}
      ${chu("bh-opl", X + 40, Y + 74, 120, "ABCD"[k], { align: "center", go })}${chu("bh-opt", X + 196, Y + 86, 600, esc(x.text), { go })}`; }).join("")}
    ${chu("bh-hint", 110, 880, 1500, "Bấm vào một thẻ để chọn")}`; };

// 26 · KẾT LUẬN — trả lời lại đúng ba câu hỏi đầu bài (cùng dải xanh, cùng số) + dải nhận định xanh đậm
S.bhtraloi = (s) => { const H = tieuDe(s), an = (s.answers || []).slice(0, 3), top = Math.max(310, H.day + 50);
  return `${H.html}${an.map((x, k) => { const X = 110 + k * 580;
    return `${the(`bh-a${k}`, { x: X, y: top, w: 540, h: 460 }, { dai: "xanh", daiH: 160 })}${chu("bh-an", X + 36, top + 30, 140, `0${k + 1}`, { color: "ffffff" })}
      ${chu("bh-aq", X + 170, top + 36, 334, esc(x.q || ""), { color: "ffffff" })}${chu("bh-aa", X + 36, top + 200, 470, f(x.a || ""))}`; }).join("")}
    ${s.verdict ? `${the("bh-ver", { x: 110, y: top + 490, w: 1700, h: 130 }, { nen: "dam" })}${chu("bh-vd", 150, top + 530, 1620, `<b>Nhận định:</b> ${f(s.verdict)}`, { color: "ffffff" })}` : ""}`; };

// 27 · GHI NHỚ — câu chốt khổng lồ + ba thẻ số xanh đậm (bấm để quay lại slide chứng minh); người cao tuổi + phong bì 3D
S.bhghinho = (s) => { const ch = (s.chips || []).slice(0, 3);
  return `${vat("bh-gg", "nguoi-gia", { x: 1540, y: 120, w: 250 }, {})}${vat("bh-gp", "phong-bi", { x: 1400, y: 300, w: 160 }, {})}
    ${vien("bh-kicker", 110, 100, s.kicker || "Ghi nhớ")}${chu("bh-gh", 110, 170, 1300, tx((s.lines || []).join("\n")))}
    ${ch.map((x, k) => { const X = 110 + k * 580, Y = 560; return `${the(`bh-g${k}`, { x: X, y: Y, w: 540, h: 300 }, { nen: "dam", go: x.go })}${chu("bh-gn", X + 40, Y + 36, 460, esc(x.n), { go: x.go, color: "ffffff" })}${chu("bh-gt", X + 40, Y + 196, 460, esc(x.text), { go: x.go, color: "ffffff" })}`; }).join("")}
    ${s.basis ? nguon(s.basis) : ""}`; };

// 28 · KẾT — "cảm ơn" khổng lồ; ảnh thật đóng khung + khiên + chồng xu (như bìa, khép bài)
S.bhket = (s, deck, b, ctx) => { const n = dong(s.title, 880, 80, "anton"), y = 290 + n * 96 + 30, team = (s.team || []).slice(0, 4).map((t) => t.name).join(" · ");
  return `${khung(ctx, s, { x: 1060, y: 150, w: 760, h: 560, r: -3 })}${hero("bh-p-khien", "khien", { x: 990, y: 600, w: 230 })}${hero("bh-p-xu", "xu", { x: 1620, y: 690, w: 240 })}
    ${vat("bh-mo1", "xu", { x: 900, y: 860, w: 170 }, { blur: 7, op: 0.7 })}
    ${vien("bh-kicker", 110, 220, s.kicker || "")}${chu("bh-h1", 110, 290, 880, tx(s.title || "Cảm ơn"), { size: 80 })}
    ${s.message ? chu("bh-sub", 110, y, 880, tx(s.message)) : ""}${s.sub ? vien("bh-ks", 110, y + 30 + dong(s.message, 880, 30, 400) * 42, s.sub, { mau: "nhat", chu: P.blue, px: 24 }) : ""}
    ${team ? chu("bh-au2", 110, 900, 880, esc(team)) : ""}${s.photoCredit ? chu("bh-cr", 1060, 1030, 760, esc(s.photoCredit)) : ""}`; };

// Tên Morph tự động: lớp ảnh lấy tên lớp (thêm tiền tố kiểu slide để hai kiểu khác nhau không ghép nhầm; vật "bh-p-…" giữ nguyên tên
// để trôi giữa hai slide), hộp chữ lấy tên theo NỘI DUNG → ở slide hai bước, cái gì giống hệt thì đứng yên.
const bam = (t) => { let h = 5381; for (const c of t) h = ((h * 33) ^ c.codePointAt(0)) >>> 0; return h.toString(36); };
function tenMorph(html, type) { const dem = {};
  const mot = (ten) => { dem[ten] = (dem[ten] || 0) + 1; return dem[ten] > 1 ? `${ten}-${dem[ten]}` : ten; };
  html = html.replace(/<div class="bh-l" data-l="([^"]+)"(?! data-m)/g, (m0, l) => { const ten = l.startsWith("bh-p-") ? l : `${type}-${l}`; return `<div class="bh-l" data-l="${l}" data-m="${mot(ten)}" data-mt="0"`; });
  return html.replace(/<div class="([^"]+)" data-t(?! data-m)( style="[^"]*">)([\s\S]*?)<\/div>/g, (m0, cls, st, inner) => `<div class="${cls}" data-t data-m="${mot(`t-${bam(type + "|" + cls + "|" + inner)}`)}"${st}${inner}</div>`); }

function render(s, deck, ctx, { i, n }) {
  kit.reset();
  const hai = HAI_BUOC.has(s.type) && s.grow !== false, truoc = (deck.slides[i - 1] || {}).type;
  const buoc = s.type === "bhhoi" ? [0, "sai", "dung"] : hai ? [1, 2] : [0], id = s.id || `s${i + 1}`;
  // Morph "máy quay": bìa → câu hỏi lớn (sổ, khiên lùi về góc); mở phần → slide đầu của phần (hình chính thu về góc)
  const lia = (s.type === "bhdo" && truoc === "bhbia") || truoc === "bhchuong";
  if (s.type === "bhhoi" && !s.next) s = { ...s, next: (deck.slides[i + 1] || {}).id || `s${i + 2}` };
  return buoc.map((b) => { const html = tenMorph(S[s.type](s, deck, b, ctx), s.type);
    const sec = `<section class="s bh" data-type="${esc(s.type)}" data-title="${esc(String(s.title || "").replace(/[[\]]/g, ""))}"><div class="cv">${html}${chan(s, deck, i, n)}</div></section>`;
    const morph = b === 2 || (lia && (b === 0 || b === 1));
    return { id: b === 2 ? `${id}-b2` : typeof b === "string" ? `${id}-${b}` : id, html: sec, tu: false, trans: morph ? "morph" : (s.trans || "fade"), dur: morph ? (s.dur2 || 1000) : (s.dur || 450), noclick: s.type === "bhhoi" && b !== "dung" }; });
}

// nền: trắng pha xanh, quầng sáng trên phải, quầng xanh dưới trái, lưới chấm rất mờ
const cham = `url("data:image/svg+xml;utf8,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='2' cy='2' r='1.6' fill='#0b57d0' fill-opacity='.07'/></svg>")}")`;
const css = `
.s.bh { background: radial-gradient(ellipse 55% 60% at 88% 8%, rgba(120,175,255,.38), transparent 62%), radial-gradient(ellipse 45% 55% at 0% 100%, rgba(47,123,255,.16), transparent 62%), ${cham}, linear-gradient(160deg, #ffffff 0%, #f1f6ff 50%, #dfeaff 100%); color: #${P.ink}; }
.s.bh .cv { position: absolute; inset: 0; }
.bh-l { position: absolute; } .bh-l > svg, .bh-l > img { display: block; width: 100%; height: 100%; }
.s.bh [data-t] { position: absolute; }
.s.bh em { font-style: normal; color: #${P.blue}; }
.bh-vien { font: 800 24px/1.2 var(--fb); letter-spacing: .08em; text-transform: uppercase; }
.bh-h { font: 400 66px/1.2 'Anton', sans-serif; text-transform: uppercase; color: #${P.navy}; }
.bh-h1 { font: 400 92px/1.18 'Anton', sans-serif; text-transform: uppercase; color: #${P.navy}; }
.bh-hc { font: 400 76px/1.2 'Anton', sans-serif; text-transform: uppercase; color: #${P.navy}; }
.bh-pnum { font: 400 300px/1 'Anton', sans-serif; color: #${P.blue}; }
.bh-sub { font: 400 30px/1.4 var(--fb); color: #${P.ink2}; }
.bh-aus { font: 400 24px/1.3 var(--fb); color: #${P.mute}; } .bh-au2 { font: 800 30px/1.2 var(--fb); color: #${P.navy}; }
.bh-cr, .bh-ft { font: 400 20px/1.2 var(--fb); color: #${P.mute}; } .bh-pg { font: 400 26px/1 'Anton', sans-serif; color: #${P.blue}; letter-spacing: .04em; }
.bh-src { font: 400 22px/1.35 var(--fb); color: #${P.mute}; }
.bh-q { font: 400 124px/1.16 'Anton', sans-serif; text-transform: uppercase; color: #${P.navy}; } .bh-qb { font: 400 170px/1 'Anton', sans-serif; text-transform: uppercase; color: #${P.blue}; }
.bh-ct { font: 800 34px/1.2 var(--fb); color: #${P.navy}; } .bh-cd { font: 400 27px/1.3 var(--fb); color: #${P.ink2}; }
.bh-yr { font: 400 54px/1 'Anton', sans-serif; color: #${P.navy}; } .bh-bv { font: 400 76px/1 'Anton', sans-serif; } .bh-bu { font: 700 24px/1 var(--fb); color: #${P.ink2}; }
.bh-hev { font: 400 120px/1 'Anton', sans-serif; } .bh-hel { font: 700 28px/1.3 var(--fb); }
.bh-bk { font: 400 40px/1 'Anton', sans-serif; text-transform: uppercase; color: #ffffff; letter-spacing: .04em; } .bh-bn { font: 400 96px/1 'Anton', sans-serif; color: #${P.sky2}; } .bh-bq { font: 800 34px/1.25 var(--fb); color: #${P.navy}; }
.bh-hint { font: 400 26px/1.2 var(--fb); color: #${P.mute}; }
.bh-qm { font: 400 260px/1 'Anton', sans-serif; color: #${P.sky2}; }
.bh-qt { font: 400 38px/1.5 var(--fb); color: #${P.ink}; } .bh-qt em { color: #${P.ink}; font-weight: 800; background: #ffe7a3; }
.bh-qro { font: 400 24px/1.3 var(--fb); color: #${P.mute}; }
.bh-ych { font: 400 46px/1.18 'Anton', sans-serif; text-transform: uppercase; } .bh-yt { font: 800 32px/1.25 var(--fb); }
.bh-cn { font: 400 46px/1.2 'Anton', sans-serif; text-transform: uppercase; color: #${P.navy}; } .bh-cx { font: 400 28px/1.42 var(--fb); color: #${P.ink2}; }
.bh-mt { font: 800 28px/1.25 var(--fb); color: #${P.navy}; }
.bh-bigv { font: 400 120px/1 'Anton', sans-serif; } .bh-bigl { font: 700 36px/1.25 var(--fb); }
.bh-rn { font: 400 32px/1.2 var(--fb); color: #${P.ink2}; } .bh-rn b { font: 400 96px/1 'Anton', sans-serif; text-transform: uppercase; color: #${P.navy}; margin-right: 18px; }
.bh-tick { font: 700 26px/1 var(--fb); color: #${P.mute}; } .bh-leg { font: 400 26px/1.3 var(--fb); color: #${P.mute}; }
.bh-refh { font: 800 24px/1.2 var(--fb); letter-spacing: .08em; text-transform: uppercase; color: #${P.blue}; } .bh-reft { font: 400 32px/1.4 var(--fb); color: #${P.ink}; } .bh-reft em { color: #${P.ink}; font-weight: 800; background: #ffe7a3; }
.bh-whon { font: 400 40px/1 'Anton', sans-serif; text-transform: uppercase; color: #${P.navy}; } .bh-whos { font: 400 24px/1.3 var(--fb); color: #${P.ink2}; }
.bh-dw { font: 400 50px/1 'Anton', sans-serif; text-transform: uppercase; } .bh-de { font: 400 26px/1.32 var(--fb); color: #${P.ink2}; } .bh-dl { font: 800 26px/1.2 var(--fb); }
.bh-fn { font: 400 40px/1.15 'Anton', sans-serif; text-transform: uppercase; color: #${P.navy}; } .bh-fr { font: 800 22px/1.2 var(--fb); letter-spacing: .08em; text-transform: uppercase; } .bh-fc { font: 400 27px/1.36 var(--fb); color: #${P.ink}; } .bh-fc em { color: #${P.goldD}; font-weight: 800; }
.bh-hl { font: 800 32px/1.2 var(--fb); color: #${P.navy}; } .bh-op { font: 400 110px/1 'Anton', sans-serif; color: #${P.blue}; } .bh-hnote { font: 400 24px/1.3 var(--fb); color: #${P.mute}; }
.bh-ctp { font: 700 32px/1.2 var(--fb); color: #${P.ink2}; } .bh-ctp b { font: 400 80px/1 'Anton', sans-serif; color: #${P.blue}; margin-right: 12px; }
.bh-cte { font: 400 32px/1.35 var(--fb); color: #${P.ink}; } .bh-cte em { color: #${P.blue}; font-weight: 800; }
.bh-cu { font: 700 26px/1.2 var(--fb); color: #${P.mute}; } .bh-cy { font: 700 26px/1 var(--fb); color: #${P.ink2}; } .bh-cv { font: 400 40px/1 'Anton', sans-serif; }
.bh-bl { font: 800 24px/1 var(--fb); letter-spacing: .1em; color: #${P.redD}; }
.bh-wn { font: 800 24px/1.25 var(--fb); } .bh-wt { font: 400 26px/1.3 var(--fb); color: #${P.ink2}; } .bh-wt b { font-weight: 800; color: #${P.navy}; }
.bh-iv { font: 400 120px/1 'Anton', sans-serif; } .bh-iu { font: 800 32px/1.2 var(--fb); } .bh-it { font: 400 27px/1.38 var(--fb); }
.bh-pv { font: 400 140px/1 'Anton', sans-serif; } .bh-pl { font: 700 30px/1.3 var(--fb); }
.bh-qy { font: 400 34px/1 'Anton', sans-serif; } .bh-qv { font: 400 34px/1.1 'Anton', sans-serif; } .bh-qn { font: 400 26px/1.3 var(--fb); color: #${P.ink2}; } .bh-qn b { font-weight: 800; color: #${P.navy}; }
.bh-hero { font: 400 330px/1 'Anton', sans-serif; color: #${P.red}; } .bh-heu { font: 800 40px/1.2 var(--fb); color: #${P.navy}; } .bh-rt { font: 700 30px/1.3 var(--fb); color: #${P.ink}; }
.bh-ctg { font: 800 24px/1.2 var(--fb); letter-spacing: .1em; text-transform: uppercase; color: #${P.blue}; } .bh-ctx { font: 800 34px/1.3 var(--fb); color: #${P.navy}; }
.bh-dmt { font: 400 74px/1.18 'Anton', sans-serif; text-transform: uppercase; color: #ffffff; } .bh-dms { font: 800 30px/1.2 var(--fb); color: #ffffff; }
.bh-kt { font: 700 30px/1.3 var(--fb); color: #${P.ink}; }
.bh-dv { font: 400 104px/1 'Anton', sans-serif; color: #${P.blue}; } .bh-dh { font: 800 32px/1.2 var(--fb); color: #${P.navy}; } .bh-dt { font: 400 27px/1.3 var(--fb); color: #${P.ink2}; }
.bh-hn { font: 400 44px/1.15 'Anton', sans-serif; text-transform: uppercase; } .bh-hw { font: 800 27px/1.25 var(--fb); } .bh-hw i { font-style: normal; color: #${P.mute}; font-weight: 400; } .bh-hd { font: 400 28px/1.4 var(--fb); color: #${P.ink2}; }
.bh-opl { font: 400 64px/1 'Anton', sans-serif; color: #ffffff; } .bh-opl2 { font: 400 72px/1 'Anton', sans-serif; } .bh-opt { font: 800 38px/1.2 var(--fb); color: #${P.navy}; }
.bh-qd { font: 400 130px/1 'Anton', sans-serif; text-transform: uppercase; } .bh-qx { font: 400 36px/1.45 var(--fb); color: #${P.ink}; } .bh-qx em { color: #${P.blue}; font-weight: 800; }
.bh-an { font: 400 96px/1 'Anton', sans-serif; } .bh-aq { font: 700 24px/1.25 var(--fb); } .bh-aa { font: 800 32px/1.32 var(--fb); color: #${P.navy}; } .bh-aa em { color: #${P.blue}; }
.bh-vd { font: 400 34px/1.3 var(--fb); } .bh-vd b { font: 400 40px/1 'Anton', sans-serif; text-transform: uppercase; color: #ffd76a; margin-right: 8px; }
.bh-gh { font: 400 140px/1.16 'Anton', sans-serif; text-transform: uppercase; color: #${P.navy}; } .bh-gh em { color: #${P.blue}; }
.bh-gn { font: 400 130px/1 'Anton', sans-serif; } .bh-gt { font: 700 30px/1.3 var(--fb); }`;

module.exports = { TYPES, render, css };
