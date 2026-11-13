// TẦNG HÌNH ẢNH — BỘ HÌNH BHXH bản gộp "SẠCH · NHẬN RA ĐỀ TÀI · SINH ĐỘNG" (11/2026).
// Lịch sử: "bàn hồ sơ" (tối, vật phẳng, Morph hàng chục vật — rối, chóng mặt) → "báo cáo sáng" (sạch nhưng nhạt) →
// "Flashslide xanh" (bóng bẩy nhưng hình chung chung, che chữ không nhận ra BHXH). Người dùng yêu cầu gộp ba điều:
//   1) SẠCH như bản lưới Office: khung viền đôi + dải đầu (tên phần, số trang, thanh tiến độ) GIỐNG HỆT trên mọi slide;
//      tiêu đề chữ thường (Be Vietnam Pro 800), Anton chỉ cho số lớn; một màu xanh BHXH + đỏ cảnh báo + vàng nhấn; nhiều khoảng trắng.
//   2) CHE CHỮ VẪN NHẬN RA BHXH (luật của skill infographic): mỗi slide một VẬT CỦA THẾ GIỚI BHXH chở dữ liệu, vẽ bằng code
//      (hinh/bhxh_3d.js): chồng sổ đếm được (1 cuốn = 1 triệu người), trang "quá trình đóng" của sổ (ô năm), phiếu lương có dòng
//      trích đóng BHXH, phong bì lương hưu, điện thoại tra cứu, sách Luật BHXH 2024.
//   3) SINH ĐỘNG như Flashslide: mặt bàn có bút + thước trôi theo "máy quay" giữa các slide (Morph 0,6 s, cùng một hướng);
//      trong slide nội dung hiện LẦN LƯỢT tự chạy (trồi lên 0,4 s, cách nhau 0,15 s — người trình bày chỉ bấm để sang slide);
//      slide hai bước: một vật đổi (mốc lương hưu trượt, thanh tỷ lệ dài ra, cột mọc). Không vật nhỏ nào bay lung tung.
// Đo chữ bằng chính file font (fontkit); không ký hiệu ngoài font.
const path = require("path"), fontkit = require("fontkit");
const { kit } = require("../stage/templates");
const { f3d, coF3d } = require("./f3d");
const V = require("./bhxh_3d");
const { esc, f } = kit;

const TYPES = ["bhbia", "bhdo", "bhtang", "bhba", "bhchuong", "bhtrich", "bhvaitro", "bhnhom", "bhmorong", "bhrutngan", "bhduong", "bhphieu5", "bhcongthuc", "bhcot2", "bhche", "bhquy", "bhrut", "bhmat", "bhdat", "bhhanche", "bhkiennghi", "bhhoi", "bhtraloi", "bhghinho", "bhket"];
const HAI_BUOC = new Set(["bhrutngan", "bhcongthuc", "bhcot2"]);
let U = 0; const uid = (p) => `${p}${++U}`;
const tx = (s) => f(s).replace(/\n/g, "<br>");
const so = (v) => String(v).replace(".", ",");

const P = { navy: "0b2559", blue: "0b57d0", sky: "e8f1ff", sky2: "cfe2ff", gold: "f2a91d", goldD: "8a5400", goldT: "fff1cc",
  red: "d63b2f", redD: "b3261e", redT: "fde8e6", ink: "13213f", ink2: "46526b", mute: "6c7891", line: "d6e2f3", faint: "b9c6dc" };

// ---------- đo chữ ----------
const FD = path.join(__dirname, "fonts"), FONT = {};
const fontOf = (wt) => { const k = wt === "anton" ? "Anton-Regular.ttf" : wt >= 750 ? "BeVietnam-Nang.ttf" : wt >= 550 ? "BeVietnam-Dam.ttf" : "BeVietnamPro-Regular.ttf"; return FONT[k] || (FONT[k] = fontkit.openSync(path.join(FD, k))); };
const rong = (t, px, wt) => { const F = fontOf(wt); return (F.layout(String(t).normalize("NFC")).advanceWidth / F.unitsPerEm) * px; };
const dong = (t, w, px, wt = 800) => { let s = String(t || "").replace(/[[\]]/g, ""); if (wt === "anton") s = s.toLocaleUpperCase("vi");
  return s.split("\n").reduce((n, para) => { const sp = rong(" ", px, wt); let ln = 1, cur = 0;
    for (const wd of para.split(/\s+/).filter(Boolean)) { const ww = rong(wd, px, wt); if (cur && cur + sp + ww > w) { ln++; cur = ww; } else cur += (cur ? sp : 0) + ww; } return n + ln; }, 0) || 1; };

// ---------- HIỆU ỨNG VÀO (tự chạy, không cần bấm) ----------
let HV = true;   // tắt ở bước 2 của slide hai bước: mọi thứ đã có, chỉ Morph
const vao = (k, kieu = "rise") => (HV ? { a: kieu, at: 160 + k * 150, dur: 420 } : {});
const fxa = (o) => (o.a ? ` data-a="${o.a}" data-at="${Math.round(o.at || 0)}"${o.dur ? ` data-dur="${o.dur}"` : ""}` : "");

// ---------- khối dựng ----------
const BONG = "drop-shadow(0 3px 6px rgba(11,58,154,.07)) drop-shadow(0 14px 26px rgba(11,58,154,.12))";
const lop = (name, R, inner, o = {}) => `<div class="bh-l" data-l="${name}"${o.m ? ` data-m="${o.m}" data-mt="0"` : ""}${o.go ? ` data-go="${o.go}"` : ""}${fxa(o)} data-pad="${o.pad ?? (o.shadow === false ? 6 : 44)}" data-alt="${esc(o.alt || "Hình minh hoạ")}" style="left:${Math.round(R.x)}px;top:${Math.round(R.y)}px;width:${Math.round(R.w)}px;height:${Math.round(R.h)}px;z-index:${o.z ?? 5};${R.r ? `rotate:${R.r}deg;` : ""}${o.shadow === false ? "" : `filter:${BONG};`}">${inner}</div>`;
const chu = (cls, x, y, w, html, o = {}) => `<div class="${cls}" data-t${o.m ? ` data-m="${o.m}"` : ""}${o.go ? ` data-go="${o.go}"` : ""}${fxa(o)} style="left:${Math.round(x)}px;top:${Math.round(y)}px;${w ? `width:${Math.round(w)}px;` : ""}${o.size ? `font-size:${o.size}px;` : ""}${o.color ? `color:#${o.color};` : ""}${o.align ? `text-align:${o.align};` : ""}z-index:${o.z ?? 30};">${html}</div>`;
const anh = (src) => `<img src="${src}" style="width:100%;height:100%;object-fit:contain;display:block">`;
const vat = (name, ten, R, o = {}) => (coF3d(ten) ? lop(name, { h: R.w, ...R }, anh(f3d(ten)), { shadow: false, ...o, alt: o.alt || `Hình 3D: ${ten}` }) : "");
// vật vẽ bằng code: [hàm, tỉ lệ rộng / cao]
const HERO = { so: [V.soBHXH, 560 / 640], sach: [V.sachLuat, 440 / 560], phieu: [V.phieuLuong, 400 / 500], phongbi: [V.phongBi, 440 / 320], dt: [V.dienThoai, 300 / 560], kiem: [V.bangKiem, 460 / 560], xu: [V.chongXu, 300 / 310] };
const hero = (name, ten, R, o = {}) => { const [fn, k] = HERO[ten]; return lop(name, { h: R.w / k, ...R }, fn(), { shadow: false, alt: o.alt || "Hình minh hoạ", ...o }); };
const chongSo = (name, n, R, o = {}) => lop(name, { h: R.w * (40 + 18 + n * 24 + 50) / 314, ...R }, V.chongSo(n), { shadow: false, alt: `Chồng ${n} cuốn sổ BHXH`, ...o });
const GRAD = { xanh: ["3a8bff", "0b57d0"], dam: ["1e6ff0", "0a3a9a"], vang: ["ffc94a", "e8930c"], do: ["ff6b5e", "c9301f"], nhat: ["f3f8ff", "dceaff"], nhat2: ["b9d3ff", "7fa9ea"] };
const theSvg = (w, h, o = {}) => { const r = o.r ?? 22, g = uid("tg"), c = uid("tc"), d = GRAD[o.dai] || null, n = GRAD[o.nen] || null;
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none"><defs><clipPath id="${c}"><rect width="${w}" height="${h}" rx="${r}"/></clipPath>
    ${d ? `<linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${d[0]}"/><stop offset="1" stop-color="#${d[1]}"/></linearGradient>` : ""}${n ? `<linearGradient id="${g}n" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${n[0]}"/><stop offset="1" stop-color="#${n[1]}"/></linearGradient>` : ""}</defs>
    <rect width="${w}" height="${h}" rx="${r}" fill="${n ? `url(#${g}n)` : "#ffffff"}"/>${d ? `<rect width="${w}" height="${o.daiH || 10}" fill="url(#${g})" clip-path="url(#${c})"/>` : ""}${o.trai ? `<rect width="${o.traiW || 10}" height="${h}" fill="#${o.trai}" clip-path="url(#${c})"/>` : ""}
    ${n ? "" : `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${r - 1}" fill="none" stroke="#${o.vien || P.line}" stroke-width="${o.vienW || 2}"/>`}</svg>`; };
const the = (name, R, o = {}) => lop(name, R, theSvg(R.w, R.h, o), { go: o.go, alt: o.alt || "Thẻ", z: o.z || 4, shadow: o.shadow, a: o.a, at: o.at, dur: o.dur });
const vong = (name, x, y, d, ten, o = {}) => { const g = uid("vg"), mau = o.mau === "do" ? ["fff0ee", "ffd2cc"] : o.mau === "vang" ? ["fff6dc", "ffe2a0"] : ["ffffff", "dceaff"];
  return `${lop(name, { x, y, w: d, h: d }, `<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${mau[0]}"/><stop offset="1" stop-color="#${mau[1]}"/></linearGradient></defs><circle cx="50" cy="50" r="49" fill="url(#${g})" stroke="#ffffff" stroke-width="2"/></svg>`, { go: o.go, alt: "Vòng nền", z: o.z || 5, a: o.a, at: o.at, dur: o.dur })}${vat(`${name}v`, ten, { x: x + d * 0.14, y: y + d * 0.12, w: d * 0.72 }, { go: o.go, z: (o.z || 5) + 1, a: o.a, at: o.at, dur: o.dur })}`; };
// nhãn khung viền (kiểu bản Office) hoặc nhãn đặc (viên thuốc)
const nhan = (name, x, y, text, o = {}) => { const px = o.px || 20, w = o.w || Math.round(rong(String(text).toLocaleUpperCase("vi"), px, 800) * 1.06 + text.length * px * 0.1 + 40), h = Math.round(px * 1.9), dac = o.dac;
  const g = uid("nh"), m = GRAD[o.mau || "xanh"];
  return `${lop(name, { x, y, w, h }, `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%">${dac ? `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${m[0]}"/><stop offset="1" stop-color="#${m[1]}"/></linearGradient></defs><rect width="${w}" height="${h}" rx="${h / 2}" fill="url(#${g})"/>` : `<rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="6" fill="#ffffff" stroke="#${o.vien || P.blue}" stroke-width="2.5"/>`}</svg>`, { shadow: false, go: o.go, alt: "Nhãn", z: o.z || 6, a: o.a, at: o.at, dur: o.dur })}${chu("bh-nhan", x, y + (h - px * 1.2) / 2, w, esc(text), { size: px, align: "center", color: o.chu || (dac ? "ffffff" : P.blue), go: o.go, a: o.a, at: o.at, dur: o.dur })}`; };
const muiTen = () => { const g = uid("mt"); return `<svg viewBox="0 0 100 70" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9cc3ff"/><stop offset="1" stop-color="#0b57d0"/></linearGradient></defs><path d="M6 24 H58 V8 L94 35 L58 62 V46 H6 Z" fill="url(#${g})"/></svg>`; };
const thanh = (mau, r = 0.5) => { const g = uid("th"), m = GRAD[mau] || [mau, mau]; return `<svg viewBox="0 0 100 10" width="100%" height="100%" preserveAspectRatio="none"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#${m[0]}"/><stop offset="1" stop-color="#${m[1]}"/></linearGradient></defs><rect width="100" height="10" rx="${r}" fill="url(#${g})"/><rect x="1" y="1" width="98" height="3" rx="${r / 2}" fill="#fff" opacity=".28"/></svg>`; };
const tron = (mau) => `<svg viewBox="0 0 10 10" width="100%" height="100%" preserveAspectRatio="none"><rect width="10" height="10" fill="#${mau}"/></svg>`;
const conDau = (w, h, mau = P.red) => `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%"><rect x="4" y="4" width="${w - 8}" height="${h - 8}" rx="14" fill="#ffffff" fill-opacity=".72" stroke="#${mau}" stroke-width="6"/><rect x="14" y="14" width="${w - 28}" height="${h - 28}" rx="8" fill="none" stroke="#${mau}" stroke-width="2"/></svg>`;

// ---------- KHUNG + DẢI ĐẦU (giống hệt mọi slide) ----------
const tenPhan = (deck, i) => { const s = deck.slides[i]; if (["bhhoi", "bhtraloi", "bhghinho", "bhket"].includes(s.type)) return "Kết luận";
  for (let k = i; k >= 0; k--) { const c = deck.slides[k]; if (c.type === "bhchuong") return `${c.partWord || "Phần"} ${c.num} · ${c.part || ""}`; } return "Mở đầu"; };
const viTriTrongPhan = (deck, i) => { let k = 0; for (let j = i; j > 0 && deck.slides[j - 1].type !== "bhchuong"; j--) k++; return k; };
const KHUNG = `<svg viewBox="0 0 1920 1080" width="100%" height="100%"><rect x="26" y="26" width="1868" height="1028" rx="22" fill="none" stroke="#c6d6ee" stroke-width="2"/><rect x="34" y="34" width="1852" height="1012" rx="16" fill="none" stroke="#e1eaf7" stroke-width="1.5"/></svg>`;
const tienDo = (i, n) => { const W = 360, g = 3, w = (W - (n - 1) * g) / n; return `<svg viewBox="0 0 ${W} 14" width="100%" height="100%">${Array.from({ length: n }, (_, k) => `<rect x="${(k * (w + g)).toFixed(2)}" y="0" width="${w.toFixed(2)}" height="14" rx="2" fill="#${k < i ? "7fa9ea" : k === i ? P.blue : "dbe6f7"}"/>`).join("")}</svg>`; };
const khung = (s, deck, i, n, dau = true) => `${lop("bh-khung", { x: 0, y: 0, w: 1920, h: 1080 }, KHUNG, { shadow: false, m: "bh-khung", z: 1, pad: 2, alt: "Khung slide" })}
  ${dau ? `${chu("bh-hdp", 110, 52, 1000, esc(tenPhan(deck, i)), { m: "bh-hd-phan" })}${chu("bh-hdn", 1300, 48, 110, `${String(i + 1).padStart(2, "0")} / ${n}`, { align: "right", m: "bh-hd-so" })}
    ${lop("bh-tiendo", { x: 1450, y: 54, w: 360, h: 14 }, tienDo(i, n), { shadow: false, m: "bh-hd-tiendo", pad: 2, alt: "Thanh tiến độ" })}` : ""}`;
// mặt bàn: bút + thước trôi sang trái theo "máy quay" mỗi slide trong một phần (slide mở phần: không có)
const ban = (deck, i) => { const k = viTriTrongPhan(deck, i);
  return `${lop("bh-p-thuoc", { x: -330 - 40 * k, y: 1016, w: 620, h: 87, r: -3 }, V.thuoc(), { shadow: false, m: "bh-p-thuoc", z: 2, alt: "Thước kẻ" })}${lop("bh-p-but", { x: 1480 - 46 * k, y: 1026, w: 420, h: 48, r: -9 }, V.but(), { shadow: false, m: "bh-p-but", z: 2, alt: "Bút" })}`; };
// dải tiêu đề: nhãn câu hỏi (khung viền) + tiêu đề chữ thường
const tieuDe = (s, o = {}) => { const w = o.w || 1500, px = o.px || 52, n = dong(s.title, w, px, 800), y = 154 + n * Math.round(px * 1.18);
  const subH = s.sub && !o.boSub ? 14 + dong(s.sub, o.subW || 1400, 28, 400) * 40 : 0;
  return { html: `${s.kicker ? nhan("bh-kicker", 110, 98, s.kicker) : ""}${chu("bh-h", 110, 150, w, tx(s.title || ""), { size: px })}${s.sub && !o.boSub ? chu("bh-sub", 110, y + 14, o.subW || 1400, tx(s.sub)) : ""}`, day: y + subH }; };
const nguon = (t) => (t ? chu("bh-src", 110, String(t).length > 150 ? 940 : 966, 1700, esc(t)) : "");
const khungAnh = (ctx, s, R, name = "bh-anh", o = {}) => { const u = ctx && ctx.img(s.photo); if (!u) return "";
  return lop(name, R, `<div style="width:100%;height:100%;border-radius:26px;overflow:hidden;border:12px solid #fff;box-sizing:border-box;background:#fff"><img src="${u}" style="width:100%;height:100%;object-fit:cover;object-position:${s.photoPos || "center"};display:block"></div>`, { alt: s.photoAlt || "Ảnh minh hoạ", z: 3, ...o }); };
const tenVat = (x, mac) => { const t = String(x || ""); return coF3d(t) ? t : mac; };
// hình chính của slide mở phần thu nhỏ ở góc phải slide kế (cùng tên Morph → "lùi máy quay")
const HERO_PHAN = ["sach", "so", "kiem"];
const goc = (k, R) => (HERO_PHAN[k] === "so" ? chongSo("bh-p-hero2", 10, { x: 1640, y: 96, w: 150, ...R }) : hero(`bh-p-hero${k + 1}`, HERO_PHAN[k], { x: 1650, y: 92, w: 140, ...R }));

const S = {};

// 1 · BÌA — chữ bên trái; mặt bàn bên phải: ảnh công nhân đóng khung, sổ BHXH, phiếu lương, phong bì lương hưu (hiện lần lượt)
S.bhbia = (s, deck, b, ctx) => { const px = s.titleSize || 76, n = dong(s.title, 900, px, 800), yS = 280 + n * Math.round(px * 1.16) + 26;
  return `${khungAnh(ctx, s, { x: 1120, y: 96, w: 690, h: 450, r: 3 }, "bh-anh", vao(0, "fade"))}
    ${hero("bh-p-so", "so", { x: 1170, y: 440, w: 330, r: -8 }, vao(1))}${hero("bh-phieu", "phieu", { x: 1540, y: 470, w: 270, r: 6 }, vao(2))}${hero("bh-p-phongbi", "phongbi", { x: 1240, y: 800, w: 300, r: -3 }, vao(3))}
    ${lop("bh-p-thuoc", { x: -120, y: 1010, w: 620, h: 87, r: -3 }, V.thuoc(), { shadow: false, m: "bh-p-thuoc", z: 2, alt: "Thước kẻ" })}${lop("bh-p-but", { x: 1500, y: 1000, w: 420, h: 48, r: -12 }, V.but(), { shadow: false, m: "bh-p-but", z: 2, alt: "Bút" })}
    ${nhan("bh-kicker", 110, 220, s.kicker || "")}${chu("bh-h1", 110, 280, 900, tx(s.title || ""), { size: px })}
    ${s.subtitle ? chu("bh-sub", 110, yS, 880, tx(s.subtitle)) : ""}
    ${s.author ? `${chu("bh-au", 110, 840, 900, esc(s.author))}${chu("bh-aus", 110, 890, 900, esc([s.authorSub, s.date].filter(Boolean).join(" · ")))}` : ""}
    ${s.photoCredit ? chu("bh-cr", 110, 962, 900, esc(s.photoCredit)) : ""}`; };

// 2 · CÂU HỎI LỚN — câu hỏi lớn bên trái; ba mặt sẽ đo, mỗi mặt một vật của thế giới BHXH; sổ của bìa thu về góc
S.bhdo = (s) => { const dims = s.dims || [{ t: "Về luật", d: "Ai phải đóng, đóng để được gì" }, { t: "Về người tham gia", d: "Bao nhiêu người đóng mỗi năm" }, { t: "Về quỹ", d: "Thu có đủ chi không" }];
  const L = (s.lines || []).length, ve = [(R, o) => hero(`bh-dimv0`, "sach", R, o), (R, o) => chongSo("bh-dimv1", 6, R, o), (R, o) => hero("bh-dimv2", "xu", R, o)];
  return `${hero("bh-p-so", "so", { x: 1660, y: 92, w: 130, r: 8 })}
    ${nhan("bh-kicker", 110, 230, s.kicker || "")}${chu("bh-q", 110, 290, 950, tx((s.lines || []).join("\n")))}${chu("bh-qb", 110, 300 + L * 112, 950, tx(s.box || ""))}
    ${dims.slice(0, 3).map((x, k) => { const Y = 290 + k * 210; return `${the(`bh-dim${k}`, { x: 1120, y: Y, w: 690, h: 186 }, { dai: "xanh", daiH: 8, ...vao(k) })}${ve[k]({ x: 1150, y: Y + 26, w: k === 1 ? 110 : 120 }, vao(k))}
      ${chu("bh-ct", 1310, Y + 44, 470, esc(x.t), vao(k))}${chu("bh-cd", 1310, Y + 100, 470, esc(x.d), vao(k))}`; }).join("")}`; };

// 3 · KẾT LUẬN CHÍNH — hình chính: hai chồng sổ đếm được (12 cuốn → 19 cuốn); thẻ hệ số tăng + thẻ năm đi lùi
S.bhtang = (s) => { const H = tieuDe(s), st = s.stats || [], a = st[0] || {}, b = st[1] || {}, d = st[2] || {}, va = parseFloat(String(a.value).replace(",", ".")), vb = parseFloat(String(b.value).replace(",", "."));
  const na = Math.round(va), nb = Math.round(vb), day = 900, W = 240, h = (n) => W * (40 + 18 + n * 24 + 50) / 314, he = va ? so((vb / va).toFixed(2)) : "";
  const cot = (x, n, gt, nam, k) => `${chongSo(`bh-cs${k}`, n, { x, y: day - h(n), w: W }, vao(k, "rise"))}${chu("bh-bv", x - 20, day - h(n) - 96, W + 40, esc(String(gt)), { align: "center", color: k ? P.blue : P.ink2, ...vao(k) })}${chu("bh-yr", x - 20, day + 8, W + 40, esc(nam), { align: "center", ...vao(k) })}`;
  return `${H.html}${cot(170, na, a.value, String(a.label || "").split("·")[0].trim() || "2015", 0)}${cot(520, nb, b.value, String(b.label || "").split("·")[0].trim() || "2025", 1)}
    ${chu("bh-leg", 110, 964, 900, esc(s.legend || "1 cuốn sổ = 1 triệu người đóng BHXH bắt buộc (làm tròn)"))}
    ${the("bh-he", { x: 920, y: Math.max(380, H.day + 50), w: 890, h: 230 }, { nen: "dam", ...vao(2) })}${chu("bh-hev", 970, Math.max(380, H.day + 50) + 44, 300, he, { color: "ffffff", ...vao(2) })}${chu("bh-hel", 994 + rong(he, 130, "anton"), Math.max(380, H.day + 50) + 80, 700 - rong(he, 130, "anton"), "lần sau mười năm", { color: "ffffff", ...vao(2) })}
    ${d.value ? `${the("bh-lui", { x: 920, y: Math.max(380, H.day + 50) + 260, w: 890, h: 230 }, { nen: "do", ...vao(3) })}${chu("bh-hev", 970, Math.max(380, H.day + 50) + 304, 300, esc(d.value), { color: "ffffff", ...vao(3) })}${chu("bh-hel", 994 + rong(String(d.value), 130, "anton"), Math.max(380, H.day + 50) + 328, 700 - rong(String(d.value), 130, "anton"), `Năm duy nhất đi lùi: ${esc(d.desc || "")}`, { color: "ffffff", ...vao(3) })}` : ""}`; };

// 4 · BA CÂU HỎI — ba thẻ, mỗi thẻ một vật BHXH (sách luật · chồng sổ · bảng kiểm); bấm để mở phần
S.bhba = (s) => { const H = tieuDe(s), it = (s.items || []).slice(0, 3), top = Math.max(320, H.day + 50);
  const ve = [(R, o) => hero("bh-bav0", "sach", R, o), (R, o) => chongSo("bh-bav1", 7, R, o), (R, o) => hero("bh-bav2", "kiem", R, o)];
  return `${H.html}${it.map((x, k) => { const X = 110 + k * 580;
    return `${the(`bh-ba${k}`, { x: X, y: top, w: 540, h: 480 }, { dai: "xanh", daiH: 10, go: x.go, ...vao(k) })}${ve[k]({ x: X + 380, y: top + 40, w: k === 1 ? 120 : 120 }, { go: x.go, ...vao(k) })}
      ${chu("bh-bn", X + 40, top + 40, 200, `0${k + 1}`, { go: x.go, ...vao(k) })}${chu("bh-bk", X + 40, top + 168, 300, `Phần ${k + 1}`, { go: x.go, ...vao(k) })}${chu("bh-bq", X + 40, top + 214, 460, esc(x.q), { go: x.go, ...vao(k) })}`; }).join("")}
    ${chu("bh-hint", 110, top + 510, 1500, esc(s.hint || "Bấm vào một thẻ để mở phần đó"))}`; };

// 5 · 14 · 21 · MỞ PHẦN — số phần lớn + câu hỏi; bên phải hình chính của phần trên quầng sáng (slide sau thu về góc)
S.bhchuong = (s) => { const k = Math.max(0, Math.min(2, (+s.num || 1) - 1)), n = dong(s.title, 900, 64, 800), q = uid("q");
  const H = k === 0 ? hero("bh-p-hero1", "sach", { x: 1270, y: 230, w: 400, r: -4 }, vao(0)) : k === 1 ? `${chongSo("bh-p-hero2", 16, { x: 1240, y: 240, w: 330 }, vao(0))}${hero("bh-xu", "xu", { x: 1560, y: 600, w: 230 }, vao(1))}` : `${hero("bh-p-hero3", "kiem", { x: 1290, y: 240, w: 400 }, vao(0))}${hero("bh-pb", "phongbi", { x: 1160, y: 700, w: 260, r: -6 }, vao(1))}`;
  return `${lop("bh-quang", { x: 1060, y: 120, w: 860, h: 860 }, `<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><radialGradient id="${q}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#dbe9ff" stop-opacity=".9"/><stop offset="1" stop-color="#dbe9ff" stop-opacity="0"/></radialGradient></defs><circle cx="50" cy="50" r="50" fill="url(#${q})"/></svg>`, { shadow: false, alt: "Quầng sáng", z: 2 })}${H}
    ${nhan("bh-kicker", 110, 230, `${s.partWord || "Phần"} ${String(s.num).padStart(2, "0")} / 03`)}${chu("bh-pnum", 100, 290, 600, String(s.num).padStart(2, "0"))}
    ${chu("bh-hc", 110, 560, 900, tx(s.title || ""))}${s.sub ? chu("bh-sub", 110, 560 + n * 76 + 26, 880, tx(s.sub)) : ""}`; };

// 6 · TRÍCH LUẬT — thẻ trích nguyên văn (cụm nhấn tô vàng) + thẻ "ý then chốt"; sách luật của slide mở phần thu về góc
S.bhtrich = (s) => { const H = tieuDe(s, { w: 1460 }), top = Math.max(310, H.day + 40), nt = String(s.note || ""), [dauN, sauN] = nt.includes(":") ? [nt.slice(0, nt.indexOf(":")), nt.slice(nt.indexOf(":") + 1)] : ["Ý then chốt", nt];
  const y = sauN.split("·").map((t) => t.trim()).filter(Boolean).slice(0, 3), VY = ["toa-nha", "khoa", "dau-tich"], h = 600;
  return `${H.html}${goc(0)}${the("bh-qc", { x: 110, y: top, w: 1150, h }, { trai: P.blue, ...vao(0) })}
    ${lop("bh-qm", { x: 160, y: top + 30, w: 90, h: 76 }, `<svg viewBox="0 0 130 110" width="100%" height="100%"><path d="M8 104 V62 C8 30 22 10 54 4 L58 22 C42 28 36 40 36 56 H58 V104 Z M72 104 V62 C72 30 86 10 118 4 L122 22 C106 28 100 40 100 56 H122 V104 Z" fill="#${P.sky2}"/></svg>`, { shadow: false, alt: "Dấu trích dẫn", ...vao(0) })}
    ${chu("bh-qt", 170, top + 130, 1040, f(s.quote || ""), vao(0))}${chu("bh-qby", 170, top + h - 140, 1040, esc(s.by || ""), vao(0))}${chu("bh-qro", 170, top + h - 90, 1040, esc(s.role || ""), vao(0))}
    ${nt ? `${the("bh-yc", { x: 1300, y: top, w: 510, h }, { dai: "xanh", ...vao(1) })}${chu("bh-ych", 1340, top + 40, 430, esc(dauN.trim()), vao(1))}
      ${y.map((t, k) => `${vong(`bh-yi${k}`, 1340, top + 120 + k * 200, 130, VY[k], vao(1 + k))}${chu("bh-yt", 1490, top + 160 + k * 200, 300, esc(t.charAt(0).toUpperCase() + t.slice(1)), vao(1 + k))}`).join("")}` : ""}`; };

// 7 · 8 · BA CỘT — ba thẻ cùng khuôn (vật 3D, tên, dòng nhấn, giải thích), hiện lần lượt
const baCot = (s, mac) => { const H = tieuDe(s), it = (s.items || []).slice(0, 3), top = Math.max(330, H.day + 56), h = 360 + Math.max(...it.map((x) => dong(x.desc, 460, 28, 400))) * 40;
  return `${H.html}${it.map((x, k) => { const X = 110 + k * 580, o = vao(k);
    return `${the(`bh-c${k}`, { x: X, y: top, w: 540, h }, { dai: "xanh", daiH: 8, ...o })}${vong(`bh-ci${k}`, X + 40, top + 40, 140, mac[k], o)}
      ${chu("bh-cn", X + 40, top + 206, 460, esc(x.name || ""), o)}${chu("bh-cw", X + 40, top + 260, 460, esc(x.who || ""), o)}${chu("bh-cx", X + 40, top + 312, 460, tx(x.desc || ""), o)}`; }).join("")}`; };
S.bhvaitro = (s) => baCot(s, ["o-mua", "can", "gio-hang"]);
S.bhnhom = (s) => baCot(s, ["cong-nhan", "dia-cau", "van-phong"]);

// 9 · NHÓM MỚI — năm thẻ nhỏ + dải số người đã tham gia
const VAT_NHOM = { l: "dong-ho", m: "cua-hang", n: "cap", e: "mu-quan", k: "nha" };
S.bhmorong = (s) => { const H = tieuDe(s), it = (s.items || []).slice(0, 5), top = Math.max(320, H.day + 56);
  return `${H.html}${it.map((x, k) => { const X = 110 + k * 346, o = vao(k);
    return `${the(`bh-m${k}`, { x: X, y: top, w: 316, h: 320 }, { dai: "xanh", daiH: 8, ...o })}${vong(`bh-mi${k}`, X + 93, top + 34, 130, VAT_NHOM[x.k] || "nguoi", o)}${chu("bh-mt", X + 20, top + 184, 276, esc(x.text), { align: "center", ...o })}`; }).join("")}
    ${s.big ? `${the("bh-big", { x: 110, y: top + 350, w: 1700, h: 170 }, { nen: "dam", ...vao(5) })}${chu("bh-bigv", 160, top + 372, 560, esc(s.big.value), { color: "ffffff", ...vao(5) })}${chu("bh-bigl", 740, top + 414, 1030, esc(s.big.label || ""), { color: "ffffff", ...vao(5) })}` : ""}
    ${nguon(s.source)}`; };

// 10 · MỐC HƯU (hai bước) — hình chính: trang "quá trình đóng" của sổ BHXH, mỗi ô một năm; bước 2: 5 ô cuối thành nét đứt,
// phong bì lương hưu trượt từ sau ô 20 về sau ô 15 (vật duy nhất chuyển động)
S.bhrutngan = (s, deck, b) => { const c0 = (s.cols || [])[0] || { n: 20, label: "" }, c1 = (s.cols || [])[1] || { n: 15, label: "" }, N = c0.n, M = c1.n, n = b === 2 ? M : N;
  const BX = 110, BY = 330, BW = 1240, BH = 450, PW = BW / 2 - 22, CW = 92, G = 18, gx = (PW - (5 * CW + 4 * G)) / 2;
  const o = (k) => { const trang = k < 10 ? 0 : 1, j = k % 10; return { x: BX + 18 + trang * (BW / 2 + 4 - 18) + gx + (j % 5) * (CW + G), y: BY + 110 + Math.floor(j / 5) * (CW + 34) }; };
  const o1 = (k, rong) => { const g = uid("oc"); return rong ? `<svg viewBox="0 0 100 100" width="100%" height="100%"><rect x="3" y="3" width="94" height="94" rx="18" fill="#ffffff" stroke="#${P.faint}" stroke-width="4" stroke-dasharray="10 8"/></svg>` : `<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#${b === 2 ? "3a8bff" : "7d8fb0"}"/><stop offset="1" stop-color="#${b === 2 ? "0b57d0" : "4a5a78"}"/></linearGradient></defs><rect width="100" height="100" rx="18" fill="url(#${g})"/><rect x="10" y="8" width="80" height="16" rx="8" fill="#fff" opacity=".3"/></svg>`; };
  const cuoi = o(n - 1), nh = b === 2 ? c1 : c0;
  return `${tieuDe(s).html}${s.ref ? `${the("bh-ref", { x: 1390, y: 330, w: 420, h: 450 }, { dai: "xanh", ...vao(1) })}${chu("bh-refh", 1420, 362, 360, esc(s.ref.head || ""), vao(1))}${chu("bh-reft", 1420, 446, 360, f(s.ref.text || ""), vao(1))}` : ""}
    ${lop("bh-somo", { x: BX, y: BY, w: BW, h: BH }, V.soMo(BW, BH), { shadow: false, alt: "Sổ BHXH mở trang quá trình đóng", ...vao(0, "fade") })}
    ${chu("bh-sot", BX + 50, BY + 30, 520, "Quá trình đóng BHXH", vao(0, "fade"))}${chu("bh-sot2", BX + BW / 2 + 30, BY + 30, 520, esc(s.legend || "Mỗi ô là một năm đóng BHXH"), vao(0, "fade"))}
    ${Array.from({ length: N }, (_, k) => { const p = o(k); return `${lop(`bh-o${k + 1}`, { x: p.x, y: p.y, w: CW, h: CW }, o1(k, b === 2 && k >= M), { shadow: false, m: `bh-o${k + 1}`, alt: `Năm đóng ${k + 1}`, ...vao(0, "fade") })}${chu("bh-oso", p.x, p.y + 26, CW, String(k + 1), { align: "center", color: b === 2 && k >= M ? P.faint : "ffffff", m: `bh-os${k + 1}`, ...vao(0, "fade") })}`; }).join("")}
    ${lop("bh-moc", { x: cuoi.x + CW - 40, y: cuoi.y - 74, w: 150, h: 109 }, V.phongBi(), { shadow: false, m: "bh-moc", alt: "Phong bì lương hưu — mốc được hưởng", ...vao(2, "pop") })}
    ${chu("bh-rn", 110, 830, 1700, `<b>${n} năm đóng</b> ${esc(nh.label || "")}`, { m: "bh-rn" })}
    ${nguon(s.source)}`; };

// 11 · NĂM CHẾ ĐỘ TRÊN ĐƯỜNG ĐỜI — người lao động 3D + trục thời gian 5 mốc (hiện lần lượt), mốc hưu viền vàng
S.bhduong = (s) => { const H = tieuDe(s), st = (s.stages || []).slice(0, 5), top = Math.max(300, H.day + 40), LY = top + 300, VD = ["nhiet-ke", "binh-sua", "bang-dan", "nguoi-gia", "hoa-sen"];
  return `${H.html}${vat("bh-nld", "cong-nhan-nu", { x: 100, y: LY - 150, w: 210 }, vao(0))}${s.who ? `${chu("bh-whon", 60, LY + 80, 280, esc(s.who.name || ""), { align: "center", ...vao(0) })}${chu("bh-whos", 50, LY + 124, 300, esc(s.who.sub || ""), { align: "center", ...vao(0) })}` : ""}
    ${lop("bh-truc", { x: 340, y: LY - 5, w: 1420, h: 10 }, thanh("xanh", 5), { shadow: false, alt: "Trục thời gian", ...vao(0, "wipe") })}
    ${st.map((x, k) => { const cx = 450 + k * 316, chinh = k === (s.focus ?? -1), o = vao(1 + k, "pop");
      return `${lop(`bh-dv${k}`, { x: cx - 80, y: LY - 80, w: 160, h: 160 }, `<svg viewBox="0 0 160 160" width="100%" height="100%"><circle cx="80" cy="80" r="74" fill="#ffffff" stroke="#${chinh ? "f2a91d" : "9cc3ff"}" stroke-width="${chinh ? 10 : 6}"/></svg>`, { alt: "Mốc", ...o })}
        ${vat(`bh-di${k}`, VD[k], { x: cx - 52, y: LY - 52, w: 104 }, { z: 7, ...o })}
        ${chu("bh-dw", cx - 140, LY - 150, 280, esc(x.when || ""), { align: "center", color: chinh ? P.goldD : P.navy, ...o })}
        ${chu("bh-de", cx - 140, LY + 100, 280, esc(x.event || ""), { align: "center", ...o })}${chu("bh-dl", cx - 140, LY + 196, 280, esc(x.link || ""), { align: "center", color: chinh ? P.goldD : P.blue, ...o })}`; }).join("")}
    ${nguon(s.note)}`; };

// 12 · NĂM THẺ CHẾ ĐỘ — thẻ hưu trí dải vàng; hiện lần lượt
S.bhphieu5 = (s) => { const H = tieuDe(s), cols = (s.cols || []).slice(0, 5), rows = s.rows || [], top = Math.max(300, H.day + 50), VD = ["nhiet-ke", "binh-sua", "bang-dan", "nguoi-gia", "hoa-sen"];
  return `${H.html}${cols.map((c, k) => { const X = 110 + k * 346, chinh = k === s.focus, o = vao(k);
    return `${the(`bh-f${k}`, { x: X, y: top, w: 316, h: 640 }, { dai: chinh ? "vang" : "xanh", daiH: 104, ...o })}${vong(`bh-fi${k}`, X + 98, top + 36, 120, VD[k], o)}
      ${chu("bh-fn", X + 16, top + 172, 284, esc(c.name || ""), { align: "center", ...o })}
      ${(c.cells || []).slice(0, 2).map((t, j) => `${chu("bh-fr", X + 26, top + 244 + j * 196, 264, esc(rows[j]?.label || ""), { color: chinh ? P.goldD : P.blue, ...o })}${chu("bh-fc", X + 26, top + 282 + j * 196, 264, f(t), o)}`).join("")}`; }).join("")}`; };

// 13 · CÔNG THỨC (hai bước) — phiếu lương → thanh tỷ lệ hưởng (45 % → 65 %) → phong bì lương hưu
S.bhcongthuc = (s, deck, b) => { const t = s.terms || [], p = b === 2 ? 65 : 45, X = 520, W = 900, k = W / 80, BY = 600, top = 300;
  return `${tieuDe(s).html}${hero("bh-phieu", "phieu", { x: 110, y: top, w: 330, r: -3 }, vao(0))}${hero("bh-pbct", "phongbi", { x: 1480, y: top + 120, w: 330, r: 3 }, vao(2))}
    ${chu("bh-ftt", X, top + 6, 960, `<b>${esc(s.result?.label || "Lương hưu hằng tháng")}</b> = ${esc(t[0]?.label || "Tỷ lệ hưởng")} × ${esc(t[1]?.label || "Bình quân tiền lương")}`, vao(1))}
    ${chu("bh-hnote", X, top + 110, 900, esc(t[1]?.note || ""), vao(1))}
    ${lop("bh-mt1", { x: 440, y: BY + 2, w: 70, h: 49 }, muiTen(), { shadow: false, alt: "Mũi tên", ...vao(1) })}${lop("bh-mt2", { x: 1420 + 10, y: BY + 2, w: 60, h: 42 }, muiTen(), { shadow: false, alt: "Mũi tên", ...vao(2) })}
    ${lop("bh-ray", { x: X, y: BY, w: W, h: 56 }, thanh("nhat", 2.8), { shadow: false, alt: "Thang tỷ lệ hưởng", ...vao(1, "fade") })}
    ${lop("bh-fill", { x: X, y: BY, w: p * k, h: 56 }, thanh("xanh", 2.8), { m: "bh-fill", alt: `Tỷ lệ hưởng ${p}%`, ...vao(1, "wipe") })}
    ${[0, 45, 75].map((v) => `${lop(`bh-v${v}`, { x: X + v * k - 2, y: BY + 62, w: 4, h: 18 }, tron(P.mute), { shadow: false, alt: "Vạch", ...vao(1, "fade") })}${chu("bh-tick", X + v * k - 110, BY + 88, 220, v === 75 ? "75% (tối đa)" : `${v}%`, { align: "center", ...vao(1, "fade") })}`).join("")}
    ${chu("bh-ctp", X + p * k - 700, BY - 86, 700, `<b>${p}%</b> ${esc(b === 2 ? (s.buoc2 || "nữ đóng 25 năm") : (s.buoc1 || "nữ đóng 15 năm"))}`, { align: "right", m: "bh-ctp" })}
    ${the("bh-vd", { x: 110, y: 800, w: 1700, h: 110 }, { nen: "nhat", ...vao(3) })}${chu("bh-cte", 150, 832, 1640, f(b === 2 ? (s.example || "") : (t[0]?.note || "")), { m: "bh-cte", ...vao(3) })}
    ${nguon(s.note)}`; };

// 15 · 17 · BIỂU ĐỒ CỘT (hai bước khi "grow" khác false) — cột bóng mọc; số chú thích tại năm; thẻ kết luận; chồng sổ ở góc
S.bhcot2 = (s, deck, b) => { const H = tieuDe(s, { w: 1460 }), hai = s.grow !== false, xong = !hai || b === 2, it = s.items || [], n = it.length, top = Math.max(290, H.day + 40);
  const CR = s.insight ? 1340 : 1810, X0 = 190, X1 = CR - 50, Y0 = top + 440, Y1 = top + 140, hi = Math.max(...it.map((x) => x.value)) * 1.08;
  const cw = (X1 - X0) / n, bw = cw * 0.58, xs = (k) => X0 + cw * (k + 0.5), ys = (v) => Y0 - (Y0 - Y1) * v / hi;
  const mau = (x, k) => (x.focus ? "vang" : x.tone === "bad" || (k && x.value < it[k - 1].value) ? "do" : "xanh");
  const sau = (ms) => (b === 2 ? { a: "fade", at: ms, dur: 400 } : hai ? {} : vao(Math.round(ms / 300), "fade"));
  const bands = (s.bands || []).map((bd) => { const a = it.findIndex((x) => x.label === bd.from), e = it.findIndex((x) => x.label === bd.to); if (a < 0 || e < 0) return ""; const x0 = xs(a) - cw / 2, x1 = xs(e) + cw / 2;
    return `${lop("bh-band", { x: x0, y: Y1 - 44, w: x1 - x0, h: Y0 - Y1 + 44 }, tron(P.redT), { shadow: false, z: 5, alt: "Dải giai đoạn" })}${chu("bh-bl", x0, Y1 - 36, x1 - x0, esc(String(bd.label)), { align: "center" })}`; }).join("");
  const cot = it.map((x, k) => { const y = xong ? ys(x.value) : Y0 - 6, g = uid("cg"); return lop(`bh-cot${k + 1}`, { x: xs(k) - bw / 2, y, w: bw, h: Y0 - y }, `<svg viewBox="0 0 10 100" width="100%" height="100%" preserveAspectRatio="none"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#${GRAD[mau(x, k)][0]}"/><stop offset="1" stop-color="#${GRAD[mau(x, k)][1]}"/></linearGradient></defs><rect width="10" height="100" fill="url(#${g})"/><rect x="1" width="2" height="100" fill="#fff" opacity=".3"/></svg>`, { shadow: false, m: `bh-cot${k + 1}`, z: 7, alt: `Cột ${x.label}`, ...(hai ? {} : vao(1 + Math.floor(k / 4), "rise")) }); }).join("");
  const nhanC = it.map((x, k) => `${chu("bh-cy", xs(k) - 55, Y0 + 14, 110, esc(x.label), { align: "center" })}${xong ? chu("bh-cv", xs(k) - 75, ys(x.value) - 50, 150, esc(x.display || so(x.value)), { align: "center", color: mau(x, k) === "do" ? P.redD : mau(x, k) === "vang" ? P.goldD : P.navy, ...sau(1000) }) : ""}`).join("");
  const whys = it.map((x, k) => (x.why ? k : -1)).filter((k) => k >= 0).slice(0, 4);
  const cham = (name, x, y, j, trong, o = {}) => `${lop(name, { x, y, w: 42, h: 42 }, `<svg viewBox="0 0 42 42" width="100%" height="100%"><circle cx="21" cy="21" r="19" fill="#${trong ? "ffffff" : P.red}" stroke="#${trong ? P.red : "ffffff"}" stroke-width="3"/></svg>`, { shadow: false, z: 9, alt: "Số chú thích", ...o })}${chu("bh-wn", x, y + 6, 42, String(j + 1), { align: "center", color: trong ? P.red : "ffffff", ...o })}`;
  const so1 = xong ? whys.map((k, j) => { const y = ys(it[k].value), trong = Y0 - y > 70; return cham(`bh-wd${j}`, xs(k) - 21, trong ? y + 10 : y - 102, j, trong, sau(1300)); }).join("") : "";
  const why = xong ? whys.map((k, j) => { const x = 150 + (j % 2) * ((CR - 150) / 2), y = Y0 + 70 + Math.floor(j / 2) * 70; return `${cham(`bh-wc${j}`, x, y, j, false, sau(1500))}${chu("bh-wt", x + 56, y + 4, (CR - 150) / 2 - 80, `<b>${esc(it[k].label)}</b> ${f(it[k].why)}`, sau(1500))}`; }).join("") : "";
  const ins = s.insight || {};
  const the2 = s.insight && xong ? `${the("bh-ins", { x: 1380, y: top, w: 430, h: 480 }, { nen: "dam", ...sau(1700) })}${chu("bh-iv", 1414, top + 44, 380, f(ins.value || ""), { size: String(ins.value || "").length > 5 ? 96 : 120, color: "ffffff", ...sau(1700) })}${chu("bh-iu", 1414, top + 200, 370, f(ins.unit || ""), { color: "ffffff", ...sau(1700) })}${chu("bh-it", 1414, top + 300, 370, f(ins.text || ""), { color: "dce9ff", ...sau(1700) })}` : "";
  return `${H.html}${goc(1)}${the("bh-khung2", { x: 110, y: top, w: CR - 110, h: 660 }, hai ? {} : vao(0, "fade"))}${chu("bh-cu", 150, top + 30, 700, esc(s.unit ? `Đơn vị: ${s.unit}` : ""))}
    ${lop("bh-truc", { x: X0 - 20, y: Y0, w: X1 - X0 + 40, h: 4 }, tron(P.ink2), { shadow: false, z: 8, alt: "Trục" })}${bands}${cot}${nhanC}${so1}${why}${the2}${nguon(s.note)}`; };

// 16 · ĐÃ PHỦ BAO NHIÊU — 50 người 3D (1 người = 2 %): màu = có BHXH, xám = chưa; hai thẻ phần trăm
S.bhche = (s) => { const H = tieuDe(s), c0 = (s.cols || [])[0] || {}, c1 = (s.cols || [])[1] || {}, n0 = c0.n || 21, N = n0 + (c1.n || 29), top = Math.max(320, H.day + 50), u = f3d("nguoi");
  const luoi = `<div style="position:relative;width:100%;height:100%">${Array.from({ length: N }, (_, k) => `<img src="${u}" style="position:absolute;left:${(k % 10) * 94}px;top:${Math.floor(k / 10) * 94}px;width:84px;height:84px;${k < n0 ? "" : "filter:grayscale(1);opacity:.38;"}">`).join("")}</div>`;
  return `${H.html}${the("bh-lk", { x: 110, y: top, w: 990, h: 560 }, vao(0, "fade"))}${lop("bh-luoi", { x: 150, y: top + 40, w: 930, h: 460 }, luoi, { shadow: false, alt: `${N} người, ${n0} người có BHXH`, ...vao(0, "fade") })}
    ${chu("bh-leg", 150, top + 506, 900, esc(s.legend || "Mỗi người = 2% lực lượng lao động"), vao(0, "fade"))}
    ${the("bh-s0", { x: 1150, y: top, w: 660, h: 265 }, { nen: "dam", ...vao(1) })}${chu("bh-pv", 1190, top + 34, 400, `${esc(c0.value || "42")}%`, { color: "ffffff", ...vao(1) })}${chu("bh-pl", 1190, top + 178, 600, esc(c0.label || ""), { color: "ffffff", ...vao(1) })}
    ${the("bh-s1", { x: 1150, y: top + 295, w: 660, h: 265 }, { nen: "do", ...vao(2) })}${chu("bh-pv", 1190, top + 329, 400, `${esc(c1.value || "58")}%`, { color: "ffffff", ...vao(2) })}${chu("bh-pl", 1190, top + 473, 600, esc(c1.label || ""), { color: "ffffff", ...vao(2) })}
    ${nguon(s.source)}`; };

// 18 · QUỸ — thanh ngang thu − chi từng năm; 2023–2025 nét đứt xám (khác phạm vi); chồng xu ở góc
S.bhquy = (s) => { const H = tieuDe(s, { w: 1460 }), rows = s.rows || [], k1 = rows.findIndex((x) => x.label === (s.den || "2022")), RH = 50, top = Math.max(340, H.day + 80), Z = 420, KX = 620 / Math.max(...rows.map((x) => Math.abs(x.value)));
  const W = 960, g = uid("qg"), g2 = uid("qv");
  const bars = rows.map((x, k) => { const y = k * RH + 8, w = Math.abs(x.value) * KX, xa = k > k1, x0 = x.value < 0 ? Z - 110 - w : Z - 110;
    return xa ? `<rect x="${x0 + 1.5}" y="${y + 1.5}" width="${w - 3}" height="${RH - 19}" rx="8" fill="#ffffff" stroke="#${P.faint}" stroke-width="3" stroke-dasharray="7 5"/>` : `<rect x="${x0}" y="${y}" width="${w}" height="${RH - 16}" rx="8" fill="url(#${x.focus ? g2 : g})"/><rect x="${x0 + 4}" y="${y + 4}" width="${Math.max(0, w - 8)}" height="7" rx="3.5" fill="#fff" opacity=".3"/>`; }).join("");
  const svg = `<svg viewBox="0 0 ${W} ${rows.length * RH}" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a8bff"/><stop offset="1" stop-color="#0b57d0"/></linearGradient><linearGradient id="${g2}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc94a"/><stop offset="1" stop-color="#e8930c"/></linearGradient></defs>${bars}<path d="M${Z - 110} 0 V${rows.length * RH}" stroke="#${P.ink2}" stroke-width="3"/></svg>`;
  const chuBang = rows.map((x, k) => { const y = top + k * RH, xa = k > k1, w = Math.abs(x.value) * KX;
    return `${chu("bh-qy", 150, y + 6, 120, esc(x.label), { color: xa ? P.mute : P.navy, ...vao(1, "fade") })}${chu("bh-qv", x.value < 0 ? Z - w - 150 : Z + w + 16, y + 4, 130, esc(x.display || so(x.value)), { align: x.value < 0 ? "right" : "left", color: xa ? P.mute : x.focus ? P.goldD : P.navy, ...vao(1, "fade") })}`; }).join("");
  const ghi = rows.map((x, k) => ({ x, k })).filter(({ x, k }) => x.note && k <= k1).map(({ x, k }) => chu("bh-qn", 1290, top + k * RH + 6, 520, `<b>${esc(x.label)}</b> ${esc(x.note)}`, vao(2, "fade"))).join("");
  const ngoai = k1 >= 0 && k1 < rows.length - 1 ? `${lop("bh-qngoac", { x: 1260, y: top + (k1 + 1) * RH, w: 14, h: (rows.length - k1 - 1) * RH - 10 }, `<svg viewBox="0 0 14 100" width="100%" height="100%" preserveAspectRatio="none"><path d="M2 2 H12 V98 H2" stroke="#${P.faint}" stroke-width="3" fill="none"/></svg>`, { shadow: false, alt: "Ngoặc", ...vao(3, "fade") })}${chu("bh-qn", 1290, top + (k1 + 1) * RH + 34, 520, esc(s.ngoai || "Phạm vi khác — chưa so được với 2015–2022"), { color: P.mute, ...vao(3, "fade") })}` : "";
  return `${H.html}${hero("bh-xu18", "xu", { x: 1610, y: 96, w: 190 })}${the("bh-qk", { x: 110, y: top - 70, w: 1180, h: rows.length * RH + 110 }, vao(0, "fade"))}${chu("bh-cu", 150, top - 48, 900, esc(s.unit ? `Đơn vị: ${s.unit} · thu − chi` : ""), vao(0, "fade"))}
    ${lop("bh-quy", { x: 110, y: top, w: W, h: rows.length * RH }, svg, { shadow: false, alt: "Biểu đồ thu − chi", ...vao(1, "wipe") })}${chuBang}${ghi}${ngoai}${nguon(s.note)}`; };

// 19 · RÚT MỘT LẦN — số đỏ lớn; sổ BHXH bị đóng dấu "đã rút một lần"; ba thẻ ý
S.bhrut = (s) => { const H = tieuDe(s, { boSub: true }), top = Math.max(330, H.day + 50), fa = (s.facts || []).slice(0, 3), VD = ["dong-ho-cat", "cong-nhan", "xu"];
  const ic = (x, k) => tenVat(x.icon === "hourglass" ? "dong-ho-cat" : x.icon === "users-three" ? "cong-nhan" : x.icon === "piggy-bank" ? "xu" : x.icon, VD[k]);
  return `${H.html}${chu("bh-hero", 96, top - 40, 560, esc(s.num || ""), vao(0, "pop"))}${chu("bh-heu", 110, top + 300, 520, esc(s.unit || ""), vao(0))}
    ${hero("bh-sorut", "so", { x: 660, y: top, w: 300, r: -6 }, vao(1))}${lop("bh-daurut", { x: 640, y: top + 150, w: 340, h: 120, r: -12 }, conDau(340, 120), { shadow: false, alt: "Dấu đã rút một lần", ...vao(2, "pop") })}${chu("bh-daut", 650, top + 192, 320, "Đã rút một lần", { align: "center", ...vao(2, "pop") })}
    ${fa.map((x, k) => { const Y = top + k * 196, o = vao(3 + k); return `${the(`bh-r${k}`, { x: 1040, y: Y, w: 770, h: 172 }, { dai: "do", daiH: 8, ...o })}${vong(`bh-ri${k}`, 1068, Y + 26, 120, ic(x, k), { mau: "do", ...o })}${chu("bh-rt", 1216, Y + 46, 570, esc(x.text || x), o)}`; }).join("")}`; };

// 20 · HỆ QUẢ RÚT MỘT LẦN — sổ BHXH mở: các ô năm đã đóng bị gạch, dấu đỏ "mất thời gian"; hai hệ quả bên phải
S.bhmat = (s) => { const H = tieuDe(s), ca = s.cause || {}, rs = (s.results || []).slice(0, 2), top = Math.max(300, H.day + 40), st = s.stamp || {}, NK = s.years || 6;
  const BX = 110, BY = top + 130, BW = 1000, BH = 420, CW = 96, G = 22;
  return `${H.html}${the("bh-ca", { x: 110, y: top, w: 1000, h: 112 }, { trai: P.blue, ...vao(0) })}${chu("bh-ctg", 150, top + 40, 170, esc(ca.tag || "Tình huống"), vao(0))}${chu("bh-ctx", 330, top + 20, 750, esc(ca.text || ""), { size: 28, ...vao(0) })}
    ${lop("bh-somo", { x: BX, y: BY, w: BW, h: BH }, V.soMo(BW, BH), { shadow: false, alt: "Sổ BHXH mở trang quá trình đóng", ...vao(1, "fade") })}${chu("bh-sot", BX + 50, BY + 30, 420, "Quá trình đóng BHXH", vao(1, "fade"))}
    ${Array.from({ length: NK }, (_, k) => { const x = BX + 70 + (k % 3) * (CW + G), y = BY + 110 + Math.floor(k / 3) * (CW + 30);
      return `${lop(`bh-mk${k}`, { x, y, w: CW, h: CW }, `<svg viewBox="0 0 100 100" width="100%" height="100%"><rect x="3" y="3" width="94" height="94" rx="18" fill="#eef2f8" stroke="#${P.faint}" stroke-width="4" stroke-dasharray="10 8"/><path d="M24 24 L76 76 M76 24 L24 76" stroke="#${P.red}" stroke-width="8" stroke-linecap="round" opacity=".75"/></svg>`, { shadow: false, alt: "Năm đã đóng bị mất", ...vao(2, "fade") })}${chu("bh-mkn", x, y + CW + 4, CW, `Năm ${k + 1}`, { align: "center", ...vao(2, "fade") })}`; }).join("")}
    ${lop("bh-daumat", { x: BX + 520, y: BY + 150, w: 420, h: 170, r: -8 }, conDau(420, 170), { shadow: false, alt: "Dấu mất thời gian", ...vao(3, "pop") })}${chu("bh-dmt", BX + 534, BY + 178, 392, esc(String(st.text || "Mất thời gian").replace(/\n/g, " ")), { align: "center", ...vao(3, "pop") })}${chu("bh-dms", BX + 534, BY + 262, 392, esc(st.sub || ""), { align: "center", ...vao(3, "pop") })}
    ${rs.map((x, k) => { const Y = top + k * 275, o = vao(4 + k); return `${the(`bh-kq${k}`, { x: 1170, y: Y, w: 640, h: 245 }, { dai: "do", daiH: 8, ...o })}${chu("bh-kt", 1210, Y + 40, 570, esc(x.text || ""), o)}${nhan(`bh-kr${k}`, 1210, Y + 170, x.ref || "", { dac: true, mau: "do", px: 20, ...o })}`; }).join("")}
    ${nguon(s.source)}`; };

// 22 · ĐẠT ĐƯỢC — điện thoại tra cứu quá trình đóng (thủ tục trực tuyến) + bốn thẻ số liệu; bảng kiểm của slide mở phần thu về góc
S.bhdat = (s) => { const H = tieuDe(s, { w: 1460 }), c = (s.cells || []).slice(0, 4), top = Math.max(310, H.day + 50), VD = ["bieu-do-tang", "dien-thoai", "hop-ho-so", "can"];
  return `${H.html}${goc(2)}${hero("bh-dt", "dt", { x: 120, y: top, w: 290 }, vao(0))}${c.map((x, k) => { const X = 470 + (k % 2) * 680, Y = top + Math.floor(k / 2) * 300, o = vao(1 + k);
    return `${the(`bh-d${k}`, { x: X, y: Y, w: 660, h: 280 }, { dai: "xanh", daiH: 8, ...o })}${vong(`bh-di${k}`, X + 32, Y + 40, 120, VD[k], o)}
      ${x.value ? chu("bh-dv", X + 176, Y + 34, 460, esc(x.value), o) : ""}${chu("bh-dh", X + 176, Y + (x.value ? 146 : 50), 460, esc(x.head || ""), o)}${chu("bh-dt", X + 176, Y + (x.value ? 192 : 100) + (dong(x.head, 460, 30, 800) - 1) * 36, 460, esc(x.text || ""), o)}`; }).join("")}`; };

// 23 · 24 · HẠN CHẾ / KIẾN NGHỊ — ba thẻ cùng chỗ ở hai slide: dải đỏ (hạn chế) → dải xanh (kiến nghị)
const ba = (s, kn) => { const H = tieuDe(s), it = (s.items || []).slice(0, 3), lab = s.labels || [], top = Math.max(330, H.day + 56), VD = kn ? ["khoa", "sua-chua", "cua-hang"] : ["cua", "canh-bao", "nguoi-chay"];
  return `${H.html}${it.map((x, k) => { const X = 110 + k * 580, o = vao(k), nl = dong(x.name, 320, 40, 800) > 1;
    return `${the(`bh-hc${k}`, { x: X, y: top, w: 540, h: 540 }, { dai: kn ? "xanh" : "do", daiH: 120, ...o })}${chu("bh-hn", X + 36, top + (nl ? 18 : 38), 320, esc(x.name || ""), { color: "ffffff", size: nl ? 34 : 40, ...o })}${vong(`bh-hi${k}`, X + 380, top + 26, 130, VD[k], { mau: kn ? "" : "do", ...o })}
      ${chu("bh-hw", X + 36, top + 160, 470, `${lab[0] ? `<i>${esc(lab[0])}:</i> ` : ""}${esc(x.who || "")}`, { color: kn ? P.blue : P.redD, ...o })}
      ${chu("bh-hd", X + 36, top + 236, 470, tx(x.desc || ""), o)}${x.ref ? nhan(`bh-href${k}`, X + 36, top + 460, x.ref, { px: 18, ...o }) : ""}`; }).join("")}`; };
S.bhhanche = (s) => ba(s, false);
S.bhkiennghi = (s) => ba(s, true);

// 25 · TRẮC NGHIỆM — bốn thẻ đáp án; phong bì lương hưu ở góc; slide sai / đúng
S.bhhoi = (s, deck, b) => { const op = (s.options || []).slice(0, 4), id = s.id || "cau-hoi", ok = op.findIndex((x) => x.ok);
  const nut = (txt, go, x, y, mau) => nhan("bh-nut", x, y, txt, { dac: true, mau, px: 28, w: 340, go });
  if (b === "sai" || b === "dung") { const d = b === "dung" ? s.right || {} : s.wrong || {}, dung = b === "dung";
    return `${nhan("bh-kicker", 110, 98, s.kicker || "")}${vat("bh-kq", dung ? "dau-tich" : "dau-x", { x: 110, y: 190, w: 150 }, vao(0, "pop"))}${chu("bh-qd", 300, 214, 1400, esc(d.title || ""), { color: dung ? "14a06a" : P.red, ...vao(0) })}
      ${dung && ok >= 0 ? `${the("bh-dung", { x: 110, y: 410, w: 835, h: 150 }, { trai: "14a06a", ...vao(1) })}${chu("bh-opl2", 160, 444, 90, "ABCD"[ok], { color: P.blue, ...vao(1) })}${chu("bh-opt", 260, 456, 650, esc(op[ok].text), vao(1))}` : ""}
      ${chu("bh-qx", 110, dung ? 610 : 410, 1500, f(d.text || d.hint || ""), vao(2))}${nut(d.button || (dung ? "Tiếp tục" : "Thử lại"), dung ? (s.next || null) : id, 110, 860, dung ? "xanh" : "do")}
      ${hero("bh-pbq", "phongbi", { x: 1460, y: 700, w: 330, r: 4 }, vao(1))}`; }
  const H = tieuDe(s);
  return `${H.html}${hero("bh-pbq", "phongbi", { x: 1580, y: 860, w: 230, r: -4 })}${op.map((x, k) => { const X = 110 + (k % 2) * 865, Y = 330 + Math.floor(k / 2) * 250, go = `${id}-${x.ok ? "dung" : "sai"}`, o = vao(k);
    return `${the(`bh-op${k}`, { x: X, y: Y, w: 835, h: 210 }, { go, ...o })}${lop(`bh-opc${k}`, { x: X + 40, y: Y + 45, w: 120, h: 120 }, `<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><linearGradient id="og${k}${U}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a8bff"/><stop offset="1" stop-color="#0b57d0"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#og${k}${U})"/></svg>`, { shadow: false, go, alt: "Vòng chữ cái", ...o })}
      ${chu("bh-opl", X + 40, Y + 70, 120, "ABCD"[k], { align: "center", go, ...o })}${chu("bh-opt", X + 196, Y + 80, 600, esc(x.text), { go, ...o })}`; }).join("")}
    ${chu("bh-hint", 110, 860, 1300, "Bấm vào một thẻ để chọn")}`; };

// 26 · KẾT LUẬN — trả lời lại đúng ba câu hỏi đầu bài + nhận định
S.bhtraloi = (s) => { const H = tieuDe(s), an = (s.answers || []).slice(0, 3), top = Math.max(310, H.day + 50);
  const ve = [(R, o) => hero("bh-tlv0", "sach", R, o), (R, o) => chongSo("bh-tlv1", 6, R, o), (R, o) => hero("bh-tlv2", "kiem", R, o)];
  return `${H.html}${an.map((x, k) => { const X = 110 + k * 580, o = vao(k);
    return `${the(`bh-a${k}`, { x: X, y: top, w: 540, h: 460 }, { dai: "xanh", daiH: 10, ...o })}${ve[k]({ x: X + 410, y: top + 30, w: 90 }, o)}${chu("bh-an", X + 36, top + 30, 140, `0${k + 1}`, o)}
      ${chu("bh-aq", X + 36, top + 140, 470, esc(x.q || ""), o)}${chu("bh-aa", X + 36, top + 250, 470, f(x.a || ""), o)}`; }).join("")}
    ${s.verdict ? `${the("bh-ver", { x: 110, y: top + 490, w: 1700, h: 120 }, { nen: "dam", ...vao(3) })}${chu("bh-vd", 150, top + 526, 1620, `<b>Nhận định:</b> ${f(s.verdict)}`, { color: "ffffff", ...vao(3) })}` : ""}`; };

// 27 · GHI NHỚ — câu chốt lớn + ba thẻ số (bấm để quay lại slide chứng minh); người cao tuổi nhận phong bì lương hưu
S.bhghinho = (s) => { const ch = (s.chips || []).slice(0, 3);
  return `${vat("bh-gg", "nguoi-gia", { x: 1500, y: 150, w: 260 }, vao(0))}${hero("bh-gp", "phongbi", { x: 1330, y: 330, w: 260, r: -6 }, vao(1))}
    ${nhan("bh-kicker", 110, 98, s.kicker || "Ghi nhớ")}${chu("bh-gh", 110, 160, 1200, tx((s.lines || []).join("\n")))}
    ${ch.map((x, k) => { const X = 110 + k * 580, Y = 560, o = vao(2 + k); return `${the(`bh-g${k}`, { x: X, y: Y, w: 540, h: 300 }, { nen: "dam", go: x.go, ...o })}${chu("bh-gn", X + 40, Y + 36, 460, esc(x.n), { go: x.go, color: "ffffff", ...o })}${chu("bh-gt", X + 40, Y + 196, 460, esc(x.text), { go: x.go, color: "ffffff", ...o })}`; }).join("")}
    ${s.basis ? nguon(s.basis) : ""}`; };

// 28 · KẾT — lời cảm ơn; mặt bàn khép bài: ảnh người nhận lương hưu đóng khung, sổ BHXH, phong bì lương hưu
S.bhket = (s, deck, b, ctx) => { const n = dong(s.title, 880, 72, 800), y = 280 + n * 84 + 30, team = (s.team || []).slice(0, 4).map((t) => t.name).join(" · ");
  return `${khungAnh(ctx, s, { x: 1080, y: 130, w: 730, h: 540, r: -3 }, "bh-anh", vao(0, "fade"))}${hero("bh-p-so", "so", { x: 1010, y: 560, w: 280, r: -10 }, vao(1))}${hero("bh-p-phongbi", "phongbi", { x: 1520, y: 690, w: 300, r: 4 }, vao(2))}
    ${lop("bh-p-thuoc", { x: -120, y: 1010, w: 620, h: 87, r: -3 }, V.thuoc(), { shadow: false, m: "bh-p-thuoc", z: 2, alt: "Thước kẻ" })}${lop("bh-p-but", { x: 1460, y: 1000, w: 420, h: 48, r: -12 }, V.but(), { shadow: false, m: "bh-p-but", z: 2, alt: "Bút" })}
    ${nhan("bh-kicker", 110, 220, s.kicker || "")}${chu("bh-h1", 110, 280, 880, tx(s.title || "Cảm ơn"), { size: 72 })}
    ${s.message ? chu("bh-sub", 110, y, 860, tx(s.message)) : ""}${s.sub ? chu("bh-ks", 110, y + 20 + dong(s.message, 860, 30, 400) * 42, 860, esc(s.sub)) : ""}
    ${team ? chu("bh-au", 110, 880, 880, esc(team)) : ""}${s.photoCredit ? chu("bh-cr", 110, 962, 900, esc(s.photoCredit)) : ""}`; };

// Tên Morph tự động: lớp ảnh lấy tên lớp (thêm tiền tố kiểu slide; vật "bh-p-…" và phần khung "bh-hd-…" giữ tên để trôi / đứng yên giữa các slide);
// hộp chữ lấy tên theo NỘI DUNG (kèm kiểu slide) → ở slide hai bước, cái gì giống hệt thì đứng yên.
const bam = (t) => { let h = 5381; for (const c of t) h = ((h * 33) ^ c.codePointAt(0)) >>> 0; return h.toString(36); };
function tenMorph(html, type) { const dem = {};
  const mot = (ten) => { dem[ten] = (dem[ten] || 0) + 1; return dem[ten] > 1 ? `${ten}-${dem[ten]}` : ten; };
  html = html.replace(/<div class="bh-l" data-l="([^"]+)"(?! data-m)/g, (m0, l) => `<div class="bh-l" data-l="${l}" data-m="${mot(l.startsWith("bh-p-") ? l : `${type}-${l}`)}" data-mt="0"`);
  return html.replace(/<div class="([^"]+)" data-t(?! data-m)([^>]*>)([\s\S]*?)<\/div>/g, (m0, cls, st, inner) => `<div class="${cls}" data-t data-m="${mot(`t-${bam(type + "|" + cls + "|" + inner)}`)}"${st}${inner}</div>`); }

function render(s, deck, ctx, { i, n }) {
  kit.reset();
  const hai = HAI_BUOC.has(s.type) && s.grow !== false;
  const buoc = s.type === "bhhoi" ? [0, "sai", "dung"] : hai ? [1, 2] : [0], id = s.id || `s${i + 1}`;
  if (s.type === "bhhoi" && !s.next) s = { ...s, next: (deck.slides[i + 1] || {}).id || `s${i + 2}` };
  return buoc.map((b) => { HV = b !== 2;
    const coBan = !["bhbia", "bhket", "bhchuong"].includes(s.type);
    const html = tenMorph(`${khung(s, deck, i, n, s.type !== "bhbia" && s.type !== "bhket")}${coBan ? ban(deck, i) : ""}${S[s.type](s, deck, b, ctx)}`, s.type);
    HV = true;
    const sec = `<section class="s bh" data-type="${esc(s.type)}" data-title="${esc(String(s.title || "").replace(/[[\]]/g, ""))}"><div class="cv">${html}</div></section>`;
    // chuyển cảnh: Morph "máy quay" giữa mọi slide (khung đứng yên, bút + thước trôi, vật chung trôi); trắc nghiệm sai / đúng: mờ
    const quiz = typeof b === "string";
    return { id: b === 2 ? `${id}-b2` : quiz ? `${id}-${b}` : id, html: sec, tu: false, trans: quiz ? "fade" : "morph", dur: b === 2 ? 900 : quiz ? 400 : 650, noclick: s.type === "bhhoi" && b !== "dung" }; });
}

const cham = `url("data:image/svg+xml;utf8,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='2' cy='2' r='1.6' fill='#0b57d0' fill-opacity='.06'/></svg>")}")`;
const css = `
.s.bh { background: radial-gradient(ellipse 55% 60% at 90% 6%, rgba(130,180,255,.28), transparent 62%), radial-gradient(ellipse 45% 55% at 0% 100%, rgba(47,123,255,.10), transparent 62%), ${cham}, linear-gradient(165deg, #ffffff 0%, #f4f8ff 55%, #e8f0fc 100%); color: #${P.ink}; }
.s.bh .cv { position: absolute; inset: 0; }
.bh-l { position: absolute; } .bh-l > svg, .bh-l > img { display: block; width: 100%; height: 100%; }
.s.bh [data-t] { position: absolute; }
.s.bh em { font-style: normal; color: #${P.blue}; }
.bh-nhan { font: 800 20px/1.2 var(--fb); letter-spacing: .08em; text-transform: uppercase; }
.bh-hdp { font: 800 18px/1.2 var(--fb); letter-spacing: .1em; text-transform: uppercase; color: #6f8bb8; } .bh-hdn { font: 800 20px/1 var(--fb); color: #${P.blue}; }
.bh-h { font: 800 52px/1.18 var(--fb); color: #${P.navy}; }
.bh-h1 { font: 800 76px/1.16 var(--fb); color: #${P.navy}; }
.bh-hc { font: 800 64px/1.18 var(--fb); color: #${P.navy}; }
.bh-pnum { font: 400 250px/1 'Anton', sans-serif; color: #${P.blue}; }
.bh-sub { font: 400 30px/1.4 var(--fb); color: #${P.ink2}; }
.bh-au { font: 800 32px/1.2 var(--fb); color: #${P.navy}; } .bh-aus { font: 400 24px/1.3 var(--fb); color: #${P.mute}; } .bh-ks { font: 800 28px/1.3 var(--fb); color: #${P.blue}; }
.bh-cr { font: 400 20px/1.2 var(--fb); color: #${P.mute}; }
.bh-src { font: 400 22px/1.35 var(--fb); color: #${P.mute}; }
.bh-q { font: 800 96px/1.14 var(--fb); color: #${P.navy}; } .bh-qb { font: 800 112px/1.1 var(--fb); color: #${P.blue}; }
.bh-ct { font: 800 34px/1.2 var(--fb); color: #${P.navy}; } .bh-cd { font: 400 27px/1.3 var(--fb); color: #${P.ink2}; }
.bh-yr { font: 400 50px/1 'Anton', sans-serif; color: #${P.navy}; } .bh-bv { font: 400 80px/1 'Anton', sans-serif; } .bh-leg { font: 400 24px/1.3 var(--fb); color: #${P.mute}; }
.bh-hev { font: 400 130px/1 'Anton', sans-serif; } .bh-hel { font: 700 28px/1.3 var(--fb); }
.bh-bn { font: 400 96px/1 'Anton', sans-serif; color: #${P.sky2}; } .bh-bk { font: 800 22px/1.2 var(--fb); letter-spacing: .1em; text-transform: uppercase; color: #${P.blue}; } .bh-bq { font: 800 34px/1.25 var(--fb); color: #${P.navy}; }
.bh-hint { font: 400 26px/1.2 var(--fb); color: #${P.mute}; }
.bh-qt { font: 400 38px/1.5 var(--fb); color: #${P.ink}; } .bh-qt em { color: #${P.ink}; font-weight: 800; background: #ffe7a3; }
.bh-qby { font: 800 28px/1.2 var(--fb); color: #${P.blue}; } .bh-qro { font: 400 24px/1.3 var(--fb); color: #${P.mute}; }
.bh-ych { font: 800 32px/1.2 var(--fb); color: #${P.navy}; } .bh-yt { font: 800 32px/1.25 var(--fb); color: #${P.navy}; }
.bh-cn { font: 800 38px/1.2 var(--fb); color: #${P.navy}; } .bh-cw { font: 800 26px/1.2 var(--fb); color: #${P.blue}; } .bh-cx { font: 400 28px/1.42 var(--fb); color: #${P.ink2}; }
.bh-mt { font: 800 28px/1.25 var(--fb); color: #${P.navy}; }
.bh-bigv { font: 400 116px/1 'Anton', sans-serif; } .bh-bigl { font: 700 36px/1.25 var(--fb); }
.bh-sot { font: 800 22px/1.2 var(--fb); letter-spacing: .1em; text-transform: uppercase; color: #${P.blue}; } .bh-sot2 { font: 700 24px/1.2 var(--fb); color: #${P.mute}; }
.bh-oso { font: 400 40px/1 'Anton', sans-serif; }
.bh-rn { font: 400 32px/1.2 var(--fb); color: #${P.ink2}; } .bh-rn b { font: 800 56px/1 var(--fb); color: #${P.navy}; margin-right: 18px; }
.bh-tick { font: 700 26px/1 var(--fb); color: #${P.mute}; }
.bh-refh { font: 800 22px/1.25 var(--fb); letter-spacing: .06em; text-transform: uppercase; color: #${P.blue}; } .bh-reft { font: 400 28px/1.45 var(--fb); color: #${P.ink}; } .bh-reft em { color: #${P.ink}; font-weight: 800; background: #ffe7a3; }
.bh-whon { font: 800 34px/1.1 var(--fb); color: #${P.navy}; } .bh-whos { font: 400 24px/1.3 var(--fb); color: #${P.ink2}; }
.bh-dw { font: 800 40px/1 var(--fb); } .bh-de { font: 400 26px/1.32 var(--fb); color: #${P.ink2}; } .bh-dl { font: 800 26px/1.2 var(--fb); }
.bh-fn { font: 800 34px/1.15 var(--fb); color: #${P.navy}; } .bh-fr { font: 800 22px/1.2 var(--fb); letter-spacing: .08em; text-transform: uppercase; } .bh-fc { font: 400 27px/1.36 var(--fb); color: #${P.ink}; } .bh-fc em { color: #${P.goldD}; font-weight: 800; }
.bh-ftt { font: 400 34px/1.3 var(--fb); color: #${P.ink2}; } .bh-ftt b { font-weight: 800; color: #${P.navy}; } .bh-hnote { font: 400 24px/1.3 var(--fb); color: #${P.mute}; }
.bh-ctp { font: 700 32px/1.2 var(--fb); color: #${P.ink2}; } .bh-ctp b { font: 400 80px/1 'Anton', sans-serif; color: #${P.blue}; margin-right: 12px; }
.bh-cte { font: 400 32px/1.35 var(--fb); color: #${P.ink}; } .bh-cte em { color: #${P.blue}; font-weight: 800; }
.bh-cu { font: 700 26px/1.2 var(--fb); color: #${P.mute}; } .bh-cy { font: 700 26px/1 var(--fb); color: #${P.ink2}; } .bh-cv { font: 400 40px/1 'Anton', sans-serif; }
.bh-bl { font: 800 24px/1 var(--fb); letter-spacing: .1em; color: #${P.redD}; }
.bh-wn { font: 800 24px/1.25 var(--fb); } .bh-wt { font: 400 26px/1.3 var(--fb); color: #${P.ink2}; } .bh-wt b { font-weight: 800; color: #${P.navy}; }
.bh-iv { font: 400 120px/1 'Anton', sans-serif; } .bh-iu { font: 800 32px/1.2 var(--fb); } .bh-it { font: 400 27px/1.38 var(--fb); }
.bh-pv { font: 400 140px/1 'Anton', sans-serif; } .bh-pl { font: 700 30px/1.3 var(--fb); }
.bh-qy { font: 400 34px/1 'Anton', sans-serif; } .bh-qv { font: 400 34px/1.1 'Anton', sans-serif; } .bh-qn { font: 400 26px/1.3 var(--fb); color: #${P.ink2}; } .bh-qn b { font-weight: 800; color: #${P.navy}; }
.bh-hero { font: 400 300px/1 'Anton', sans-serif; color: #${P.red}; } .bh-heu { font: 800 36px/1.25 var(--fb); color: #${P.navy}; } .bh-rt { font: 700 30px/1.3 var(--fb); color: #${P.ink}; }
.bh-daut { font: 800 28px/1.2 var(--fb); color: #${P.red}; text-transform: uppercase; }
.bh-ctg { font: 800 22px/1.2 var(--fb); letter-spacing: .1em; text-transform: uppercase; color: #${P.blue}; } .bh-ctx { font: 800 30px/1.3 var(--fb); color: #${P.navy}; }
.bh-mkn { font: 700 22px/1.2 var(--fb); color: #${P.mute}; }
.bh-dmt { font: 800 48px/1.15 var(--fb); color: #${P.red}; text-transform: uppercase; } .bh-dms { font: 800 26px/1.2 var(--fb); color: #${P.red}; }
.bh-kt { font: 700 30px/1.3 var(--fb); color: #${P.ink}; }
.bh-dv { font: 400 104px/1 'Anton', sans-serif; color: #${P.blue}; } .bh-dh { font: 800 30px/1.2 var(--fb); color: #${P.navy}; } .bh-dt { font: 400 26px/1.3 var(--fb); color: #${P.ink2}; }
.bh-hn { font: 800 40px/1.15 var(--fb); } .bh-hw { font: 800 27px/1.25 var(--fb); } .bh-hw i { font-style: normal; color: #${P.mute}; font-weight: 400; } .bh-hd { font: 400 28px/1.4 var(--fb); color: #${P.ink2}; }
.bh-opl { font: 400 64px/1 'Anton', sans-serif; color: #ffffff; } .bh-opl2 { font: 400 72px/1 'Anton', sans-serif; } .bh-opt { font: 800 38px/1.2 var(--fb); color: #${P.navy}; }
.bh-qd { font: 800 104px/1.05 var(--fb); } .bh-qx { font: 400 36px/1.45 var(--fb); color: #${P.ink}; } .bh-qx em { color: #${P.blue}; font-weight: 800; }
.bh-an { font: 400 96px/1 'Anton', sans-serif; color: #${P.sky2}; } .bh-aq { font: 700 26px/1.3 var(--fb); color: #${P.mute}; } .bh-aa { font: 800 32px/1.32 var(--fb); color: #${P.navy}; } .bh-aa em { color: #${P.blue}; }
.bh-vd { font: 400 34px/1.3 var(--fb); } .bh-vd b { font-weight: 800; color: #ffd76a; margin-right: 8px; }
.bh-gh { font: 800 120px/1.12 var(--fb); color: #${P.navy}; } .bh-gh em { color: #${P.blue}; }
.bh-gn { font: 400 130px/1 'Anton', sans-serif; } .bh-gt { font: 700 30px/1.3 var(--fb); }`;

module.exports = { TYPES, render, css };
