// TẦNG HÌNH ẢNH — BỘ HÌNH BHXH bản gộp "SẠCH · NHẬN RA ĐỀ TÀI · SINH ĐỘNG" (11/2026).
// Lịch sử: "bàn hồ sơ" (tối, vật phẳng, Morph hàng chục vật — rối, chóng mặt) → "báo cáo sáng" (sạch nhưng nhạt) →
// "Flashslide xanh" (bóng bẩy nhưng hình chung chung, che chữ không nhận ra BHXH). Người dùng yêu cầu gộp ba điều:
//   1) SẠCH như bản lưới Office: khung viền đôi + dải đầu (tên phần, số trang, thanh tiến độ) GIỐNG HỆT trên mọi slide;
//      tiêu đề chữ thường (Be Vietnam Pro 800), Anton chỉ cho số lớn; một màu xanh BHXH + đỏ cảnh báo + vàng nhấn; nhiều khoảng trắng.
//   2) CHE CHỮ VẪN NHẬN RA BHXH (luật của skill infographic): mỗi slide một VẬT CỦA THẾ GIỚI BHXH chở dữ liệu, vẽ bằng code
//      (hinh/bhxh_3d.js): chồng sổ đếm được (1 cuốn = 1 triệu người), trang "quá trình đóng" của sổ (ô năm), phiếu lương có dòng
//      trích đóng BHXH, phong bì lương hưu, điện thoại tra cứu, sách Luật BHXH 2024.
//   3) SINH ĐỘNG như Flashslide: MÁY QUAY giữa các slide (hinh/may_quay.js) — khung + dải đầu đứng yên, cả cảnh trôi sang trái
//      theo mạch bài (hình chính trôi nhanh hơn chữ: thị sai), vào phần mới máy quay đi xuống, slide sau slide mở phần thì phóng vào
//      hình chính (cuốn luật, chồng sổ, bảng kiểm); máy quay dừng thì các hàng danh sách hiện LẦN LƯỢT (đứng ngoài máy quay, data-sau=0);
//      slide hai bước: một vật đổi (mốc lương hưu trượt, thanh tỷ lệ dài ra, cột mọc).
// Bản 11/2026 lần 5: bỏ bút + thước, bỏ ô nhãn; danh sách = "một vật BHXH lớn bên trái + hàng gọn bên phải" (sổ có dải đánh dấu,
//   sách luật mở chứa câu trích, ô che, ba sổ xoè, chồng sổ có dấu MỚI).
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
  red: "d63b2f", redD: "b3261e", redT: "fde8e6", navyL: "24407a", ink: "13213f", ink2: "46526b", mute: "56627c", line: "d6e2f3", faint: "b9c6dc" };

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
const fxa = (o) => (o.a ? ` data-a="${o.a}" data-at="${Math.round(o.at || 0)}"${o.dur ? ` data-dur="${o.dur}"` : ""}${o.out != null ? ` data-out="${Math.round(o.out)}"` : ""}${o.em ? ` data-em="${o.em}" data-emat="${Math.round(o.emat || 0)}"` : ""}` : "");

// ---------- khối dựng ----------
const BONG = "drop-shadow(0 3px 6px rgba(11,58,154,.07)) drop-shadow(0 14px 26px rgba(11,58,154,.12))";
const lop = (name, R, inner, o = {}) => `<div class="bh-l" data-l="${name}"${o.prop ? " data-prop" : ""}${o.m ? ` data-m="${o.m}" data-mt="0"` : ""}${o.go ? ` data-go="${o.go}"` : ""}${o.sau != null ? ` data-sau="${o.sau}"` : ""}${fxa(o)} data-pad="${o.pad ?? (o.shadow === false ? 6 : 44)}" data-alt="${esc(o.alt || "Hình minh hoạ")}" style="left:${Math.round(R.x)}px;top:${Math.round(R.y)}px;width:${Math.round(R.w)}px;height:${Math.round(R.h)}px;z-index:${o.z ?? 5};${R.r ? `rotate:${R.r}deg;` : ""}${o.css ? o.css : o.shadow === false ? "" : `filter:${BONG};`}">${inner}</div>`;
const chu = (cls, x, y, w, html, o = {}) => `<div class="${cls}" data-t${o.dl ? " data-dl" : ""}${o.m ? ` data-m="${o.m}"` : ""}${o.go ? ` data-go="${o.go}"` : ""}${o.sau != null ? ` data-sau="${o.sau}"` : ""}${fxa(o)} style="left:${Math.round(x)}px;top:${Math.round(y)}px;${w ? `width:${Math.round(w)}px;` : ""}${o.size ? `font-size:${o.size}px;` : ""}${o.color ? `color:#${o.color};` : ""}${o.align ? `text-align:${o.align};` : ""}z-index:${o.z ?? 30};">${html}</div>`;
const anh = (src) => `<img src="${src}" style="width:100%;height:100%;object-fit:contain;display:block">`;
const vat = (name, ten, R, o = {}) => (coF3d(ten) ? lop(name, { h: R.w, ...R }, anh(f3d(ten)), { shadow: false, ...o, alt: o.alt || `Hình 3D: ${ten}` }) : "");
// vật vẽ bằng code: [hàm, tỉ lệ rộng / cao]
const HERO = { so: [V.soBHXH, 560 / 640], sach: [V.sachLuat, 440 / 560], phieu: [V.phieuLuong, 400 / 500], phongbi: [V.phongBi, 440 / 320], dt: [V.dienThoai, 300 / 560], kiem: [V.bangKiem, 460 / 560], xu: [V.chongXu, 300 / 310] };
const hero = (name, ten, R, o = {}) => { const [fn, k] = HERO[ten]; return lop(name, { h: R.w / k, ...R }, fn(), { shadow: false, alt: o.alt || "Hình minh hoạ", ...o }); };
// vật có dải đánh dấu: chọn bề rộng để chiều cao phủ từ dải đầu tới dải cuối (+ lề), canh giữa theo nhóm dải
// lề trong của hình vẽ (phần của khung): bìa từ t tới b theo chiều cao; mép trang ở r, gáy ở l theo chiều rộng (hinh/bhxh_3d.js)
const LE_VAT = { so: { t: 40 / 640, b: 560 / 640, r: 500 / 560, l: 100 / 560 }, sach: { t: 40 / 560, b: 520 / 560, r: 392 / 440, l: 40 / 440 } };
// chọn cỡ để phần bìa phủ từ dải đầu tới dải cuối (+ nửa bề dày dải + lề 14 px), canh giữa nhóm hàng; mép trang cách thẻ lo px (phần dải lộ ra; dải có nhãn điều luật cần dài hơn)
const giuaDai = (ten, c0, c1, theX, dayDai = 60, wMax = 640, lo = 80) => { const k = HERO[ten][1], L = LE_VAT[ten], hb = (c1 - c0) + dayDai + 28;
  let w = Math.min(wMax, (hb / (L.b - L.t)) * k); w = Math.min(w, (theX - lo - 110) / (L.r - L.l)); const h = w / k, x = theX - lo - L.r * w;
  return { x, y: (c0 + c1) / 2 - ((L.t + L.b) / 2) * h, w, mep: x + L.r * w }; };
const dai = (name, R, Y, dayDai, theX, g, o = {}) => lop(name, { x: R.mep - 60, y: Y - dayDai / 2, w: theX + 20 - (R.mep - 60), h: dayDai }, thanh(g, 3), { alt: "Dải đánh dấu", z: 4, ...o });
const chongSo = (name, n, R, o = {}) => lop(name, { h: R.w * (40 + 18 + n * 24 + 50) / 314, ...R }, V.chongSo(n), { shadow: false, alt: `Chồng ${n} cuốn sổ BHXH`, ...o });
const GRAD = { xanh: ["3a8bff", "0b57d0"], dam: ["1e6ff0", "0a3a9a"], navy: ["24407a", "0b2559"], vang: ["ffc94a", "e8930c"], do: ["ff6b5e", "c9301f"], nhat: ["f3f8ff", "dceaff"], nhat2: ["b9d3ff", "7fa9ea"] };
const theSvg = (w, h, o = {}) => { const r = o.r ?? 22, g = uid("tg"), c = uid("tc"), d = GRAD[o.dai] || null, n = GRAD[o.nen] || null;
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none"><defs><clipPath id="${c}"><rect width="${w}" height="${h}" rx="${r}"/></clipPath>
    ${d ? `<linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${d[0]}"/><stop offset="1" stop-color="#${d[1]}"/></linearGradient>` : ""}${n ? `<linearGradient id="${g}n" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${n[0]}"/><stop offset="1" stop-color="#${n[1]}"/></linearGradient>` : ""}</defs>
    <rect width="${w}" height="${h}" rx="${r}" fill="${n ? `url(#${g}n)` : "#ffffff"}"/>${d ? `<rect width="${w}" height="${o.daiH || 10}" fill="url(#${g})" clip-path="url(#${c})"/>` : ""}${o.trai ? `<rect width="${o.traiW || 10}" height="${h}" fill="#${o.trai}" clip-path="url(#${c})"/>` : ""}
    ${n ? "" : `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${r - 1}" fill="none" stroke="#${o.vien || P.line}" stroke-width="${o.vienW || 2}"/>`}</svg>`; };
const the = (name, R, o = {}) => lop(name, R, theSvg(R.w, R.h, o), { go: o.go, alt: o.alt || "Thẻ", z: o.z || 4, shadow: o.shadow, a: o.a, at: o.at, dur: o.dur, sau: o.sau });
const vong = (name, x, y, d, ten, o = {}) => { const g = uid("vg"), mau = o.mau === "do" ? ["fff0ee", "ffd2cc"] : o.mau === "vang" ? ["fff6dc", "ffe2a0"] : ["ffffff", "dceaff"];
  return `${lop(name, { x, y, w: d, h: d }, `<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${mau[0]}"/><stop offset="1" stop-color="#${mau[1]}"/></linearGradient></defs><circle cx="50" cy="50" r="49" fill="url(#${g})" stroke="#ffffff" stroke-width="2"/></svg>`, { go: o.go, alt: "Vòng nền", z: o.z || 5, a: o.a, at: o.at, dur: o.dur, sau: o.sau })}${vat(`${name}v`, ten, { x: x + d * 0.14, y: y + d * 0.12, w: d * 0.72 }, { go: o.go, z: (o.z || 5) + 1, a: o.a, at: o.at, dur: o.dur, sau: o.sau })}`; };
// nhãn khung viền (kiểu bản Office) hoặc nhãn đặc (viên thuốc)
const nhan = (name, x, y, text, o = {}) => { const px = o.px || 20, w = o.w || Math.round(rong(String(text).toLocaleUpperCase("vi"), px, 800) * 1.06 + text.length * px * 0.1 + 40), h = Math.round(px * 1.9), dac = o.dac;
  const g = uid("nh"), m = { xanh: ["2f6fe0", "0b57d0"], do: ["d63b2f", "a8231b"] }[o.mau || "xanh"] || GRAD[o.mau];
  return `${lop(name, { x, y, w, h }, `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%">${dac ? `<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#${m[0]}"/><stop offset="1" stop-color="#${m[1]}"/></linearGradient></defs><rect width="${w}" height="${h}" rx="${h / 2}" fill="url(#${g})"/>` : `<rect x="1.5" y="1.5" width="${w - 3}" height="${h - 3}" rx="6" fill="#ffffff" stroke="#${o.vien || P.blue}" stroke-width="2.5"/>`}</svg>`, { shadow: false, go: o.go, alt: "Nhãn", z: o.z || 6, a: o.a, at: o.at, dur: o.dur })}${chu("bh-nhan", x, y + (h - px * 1.2) / 2, w, esc(text), { size: px, align: "center", color: o.chu || (dac ? "ffffff" : P.blue), go: o.go, a: o.a, at: o.at, dur: o.dur })}`; };
const muiTen = () => { const g = uid("mt"); return `<svg viewBox="0 0 100 70" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9cc3ff"/><stop offset="1" stop-color="#0b57d0"/></linearGradient></defs><path d="M6 24 H58 V8 L94 35 L58 62 V46 H6 Z" fill="url(#${g})"/></svg>`; };
const thanh = (mau, r = 0.5) => { const g = uid("th"), m = GRAD[mau] || [mau, mau]; return `<svg viewBox="0 0 100 10" width="100%" height="100%" preserveAspectRatio="none"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#${m[0]}"/><stop offset="1" stop-color="#${m[1]}"/></linearGradient></defs><rect width="100" height="10" rx="${r}" fill="url(#${g})"/><rect x="1" y="1" width="98" height="3" rx="${r / 2}" fill="#fff" opacity=".28"/></svg>`; };
const tron = (mau) => `<svg viewBox="0 0 10 10" width="100%" height="100%" preserveAspectRatio="none"><rect width="10" height="10" fill="#${mau}"/></svg>`;
const conDau = (w, h, mau = P.red) => `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%"><rect x="4" y="4" width="${w - 8}" height="${h - 8}" rx="14" fill="#ffffff" fill-opacity=".9" stroke="#${mau}" stroke-width="6"/><rect x="14" y="14" width="${w - 28}" height="${h - 28}" rx="8" fill="none" stroke="#${mau}" stroke-width="2"/></svg>`;

// ---------- KHUNG + DẢI ĐẦU (giống hệt mọi slide) ----------
const tenPhan = (deck, i) => { const s = deck.slides[i]; if (["bhhoi", "bhtraloi", "bhghinho", "bhket"].includes(s.type)) return "Kết luận";
  for (let k = i; k >= 0; k--) { const c = deck.slides[k]; if (c.type === "bhchuong") return `${c.partWord || "Phần"} ${c.num} · ${c.part || ""}`; } return "Mở đầu"; };
const viTriTrongPhan = (deck, i) => { let k = 0; for (let j = i; j > 0 && deck.slides[j - 1].type !== "bhchuong"; j--) k++; return k; };
const KHUNG = `<svg viewBox="0 0 1920 1080" width="100%" height="100%"><rect x="26" y="26" width="1868" height="1028" rx="22" fill="none" stroke="#c6d6ee" stroke-width="2"/><rect x="34" y="34" width="1852" height="1012" rx="16" fill="none" stroke="#e1eaf7" stroke-width="1.5"/></svg>`;
// màu của phần: Phần 1 (luật) xanh BHXH · Phần 2 (người đóng, quỹ = tiền) vàng · Phần 3 (đánh giá, kiến nghị) xanh đậm.
// Đỏ để dành cho điều tiêu cực thật (giảm, mất, nợ) — không gán cho cả một phần.
const MAU_PHAN = [{ dac: P.blue, nhat: "cfe0fb", qua: "7fa9ea", g: "xanh", so: P.blue }, { dac: P.gold, nhat: "fbe6b8", qua: "f5c86a", g: "vang", so: P.goldD }, { dac: P.navy, nhat: "c9d2e4", qua: "7d8fb0", g: "navy", so: P.navy }];
const nhomCua = (deck, i) => { const t = tenPhan(deck, i), m = t.match(/(\d+)\s*·/); return m ? `p${m[1]}` : t; };
const mauNhom = (k) => (k && k[0] === "p" ? MAU_PHAN[Math.max(0, Math.min(2, +k.slice(1) - 1))] : { dac: P.mute, nhat: "dbe3f0", qua: "a9b6cc" });
// thanh tiến độ: một ô một slide; khe rộng ngăn các phần (đọc được cấu trúc bài); đã qua nhạt, đang ở đậm, chưa tới rất nhạt
const tienDo = (deck, i) => { const n = deck.slides.length, nh = deck.slides.map((_, k) => nhomCua(deck, k)), cat = nh.filter((x, k) => k && x !== nh[k - 1]).length;
  const W = 360, g = 3, G = 10, w = (W - (n - 1 - cat) * g - cat * G) / n; let x = 0;
  return `<svg viewBox="0 0 ${W} 14" width="100%" height="100%">${nh.map((k, j) => { if (j && k !== nh[j - 1]) x += G - g; const m = mauNhom(k), r = `<rect x="${x.toFixed(2)}" y="0" width="${w.toFixed(2)}" height="14" rx="2" fill="#${j < i ? m.qua : j === i ? m.dac : m.nhat}"/>`; x += w + g; return r; }).join("")}</svg>`; };
const khung = (s, deck, i, n, dau = true, phai = true) => `
  ${dau ? `${chu("bh-hdp", 110, 42, 1000, esc(tenPhan(deck, i)), { m: "bh-hd-phan" })}${phai ? `${chu("bh-hdn", 1300, 38, 110, `${String(i + 1).padStart(2, "0")} / ${n}`, { align: "right", m: "bh-hd-so" })}` : ""}
    ${phai ? lop("bh-tiendo", { x: 1450, y: 44, w: 360, h: 14 }, tienDo(deck, i), { shadow: false, m: "bh-hd-tiendo", pad: 2, alt: "Thanh tiến độ" }) : ""}` : ""}`;
// mặt bàn: bút + thước trôi sang trái theo "máy quay" mỗi slide trong một phần (slide mở phần: không có)
const ban = () => "";   // bản gộp có bút + thước trôi ở chân slide — bị bỏ: vật không mang nghĩa làm rối (chuyển động giờ do máy quay lo)
// dải tiêu đề: nhãn câu hỏi (khung viền) + tiêu đề chữ thường
const docSo = (t) => { const m = String(t).match(/^([^\d]*)(\d[\d.,]*)(.*)$/); if (!m) return null; const [, pre, n, post] = m;
  const dec = n.includes(",") ? n.split(",")[1].length : 0, nghin = /\.\d{3}(?!\d)/.test(n.split(",")[0]), v = parseFloat(n.replace(/\./g, "").replace(",", "."));
  return { pre, post, v, fmt: (x) => { let s = x.toFixed(dec).replace(".", ","); if (nghin) s = s.replace(/^(\d+)/, (a) => a.replace(/\B(?=(\d{3})+(?!\d))/g, ".")); return pre + s + post; } }; };
// SỐ LỚN: bật ra (pop) rồi nhấp một nhịp (pulse) khi máy quay đã dừng — đứng ngoài máy quay (sau: 0).
// (Đã thử "số chạy" bằng chuỗi khung hiện / tắt: trong khung soạn thảo PowerPoint các khung chồng lên nhau, rối khi sửa chữ — bỏ.)
const soChay = (cls, x, y, w, h, giaTri, o = {}) => { const t0 = o.at ?? 250, { a, at, dur, ...r } = o;
  return chu(cls, x, y, w, esc(String(giaTri)), HV ? { ...r, a: "pop", at: t0, dur: 420, em: "pulse", emat: t0 + 700, sau: 0 } : r); };
// viên thuốc (nhãn đặc bo tròn) — kiểu Flashslide: chữ đậm in hoa trên nền màu
const vien = (name, x, y, text, o = {}) => { const px = o.px || 22, T = String(text).toLocaleUpperCase("vi"), w = Math.round(rong(T, px, 800) + T.length * px * 0.07 + px * 2.4), h = Math.round(px * 2), g = uid("vi"), m = o.mau === "vang" ? ["ffc94a", "e8930c"] : o.mau === "trang" ? ["ffffff", "ffffff"] : ["0f3f9c", "072a6b"];
  return `${lop(name, { x, y, w, h }, `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#${m[0]}"/><stop offset="1" stop-color="#${m[1]}"/></linearGradient></defs><rect width="${w}" height="${h}" rx="${h / 2}" fill="url(#${g})"/></svg>`, { shadow: o.mau === "trang" ? undefined : false, pad: 30, alt: "Nhãn", z: o.z || 9, sau: o.sau, ...(o.fx || {}) })}${chu(o.cls || "bh-kk", x, y + (h - px * 1.2) / 2, w, esc(text), { align: "center", color: o.chu || (o.mau === "vang" ? "3a2400" : o.mau === "trang" ? "072a6b" : "ffd76a"), size: px, z: (o.z || 9) + 22, sau: o.sau, ...(o.fx || {}) })}`; };
const kick = (t, x = 110, y = 92, o = {}) => (t ? vien("bh-kick", x, y, t, o) : "");
const boPhan = (t) => String(t || "").replace(/^(Phần|Chương)\s*\d+\s*·\s*/i, "");
// tiêu đề chữ đứng (Anton) in hoa: 72 px, dài quá hai dòng thì 60 px
const tieuDe = (s, o = {}) => { const w = o.w || 1680; let px = o.px || 72, n = dong(s.title, w, px, "anton"); if (n > 2 && !o.px) { px = 60; n = dong(s.title, w, px, "anton"); }
  const y = 150 + n * Math.round(px * 1.1), subH = s.sub && !o.boSub ? 14 + dong(s.sub, o.subW || 1400, 28, 400) * 40 : 0;
  return { html: `${kick(boPhan(s.kicker))}${chu("bh-h", 110, 150, w, tx(s.title || ""), { size: px })}${s.sub && !o.boSub ? chu("bh-sub", 110, y + 12, o.subW || 1400, tx(s.sub)) : ""}`, day: y + subH }; };
// ẢNH THẬT (ảnh báo — chỉ chiếu trên lớp, ghi công ở chân slide và trong _ghi-cong.md)
const anhU = (ctx, s) => (ctx && s.photo ? ctx.img(s.photo) : null);
const imgTag = (u, s) => `<img src="${u}" style="width:100%;height:100%;object-fit:cover;object-position:${s.photoPos || "center"};display:block">`;
const ghiAnh = (s, toi) => (s.photoCredit ? chu("bh-cr", 110, 1030, 1200, esc(s.photoCredit), { color: toi ? "b9c9e8" : P.mute, sau: 0 }) : "");
// khung ảnh bo góc + bóng đổ (+ nhãn trắng ở góc dưới)
const anhKhung = (ctx, s, R, o = {}) => { const u = anhU(ctx, s); if (!u) return "";
  return `${lop(o.name || "bh-anh", R, `<div style="width:100%;height:100%;border-radius:30px;overflow:hidden">${imgTag(u, s)}</div>`, { alt: s.photoAlt || "Ảnh", z: 3, pad: 50, sau: o.sau ?? 1.15, ...(o.fx || {}) })}
    ${s.photoTag ? vien("bh-anhtag", R.x + 30, R.y + R.h - 76, s.photoTag, { mau: "trang", px: 20, sau: o.sau ?? 1.15, fx: o.fx }) : ""}${ghiAnh(s)}`; };
// ảnh tràn mép phải, dải mờ dần vào nền bên trái
const anhBen = (ctx, s, x0, o = {}) => { const u = anhU(ctx, s); if (!u) return ""; const g = uid("mo");
  return `${lop("bh-anhben", { x: x0, y: 0, w: 1920 - x0, h: 1080 }, imgTag(u, s), { shadow: false, alt: s.photoAlt || "Ảnh", z: 2, pad: 0, sau: 1.15, ...(o.fx || {}) })}
    ${lop("bh-anhmo", { x: x0 - 2, y: 0, w: 380, h: 1080 }, `<svg viewBox="0 0 10 10" width="100%" height="100%" preserveAspectRatio="none"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#eef4ff"/><stop offset=".55" stop-color="#eef4ff" stop-opacity=".55"/><stop offset="1" stop-color="#eef4ff" stop-opacity="0"/></linearGradient></defs><rect width="10" height="10" fill="url(#${g})"/></svg>`, { shadow: false, alt: "Dải mờ", z: 3, pad: 0, sau: 1.15, ...(o.fx || {}) })}${ghiAnh(s)}`; };
// ảnh tràn cả slide, phủ xanh BHXH đậm bên trái (bìa, mở phần, kết)
const anhTran = (ctx, s, o = {}) => { const u = anhU(ctx, s); if (!u) return ""; const g = uid("ph"), x0 = o.x0 ?? 560;
  return `${lop("bh-anhtran", { x: x0, y: 0, w: 1920 - x0, h: 1080 }, imgTag(u, s), { shadow: false, alt: s.photoAlt || "Ảnh", z: 1, pad: 0, sau: 0.8 })}
    ${lop("bh-phu", { x: 0, y: 0, w: 1920, h: 1080 }, `<svg viewBox="0 0 1920 1080" width="100%" height="100%" preserveAspectRatio="none"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#062463"/><stop offset=".3" stop-color="#072a6b"/><stop offset=".52" stop-color="#083082" stop-opacity=".8"/><stop offset="1" stop-color="#0b57d0" stop-opacity=".12"/></linearGradient><radialGradient id="${g}q" cx=".05" cy="1" r=".45"><stop offset="0" stop-color="#2f7bff" stop-opacity=".5"/><stop offset="1" stop-color="#2f7bff" stop-opacity="0"/></radialGradient><linearGradient id="${g}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#062463" stop-opacity=".9"/><stop offset=".45" stop-color="#062463" stop-opacity=".55"/><stop offset="1" stop-color="#062463" stop-opacity="0"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#${g})"/><rect width="1920" height="1080" fill="url(#${g}q)"/><rect width="1920" height="190" fill="url(#${g}t)"/></svg>`, { shadow: false, alt: "Lớp phủ màu", z: 2, pad: 0, sau: 0.8 })}${ghiAnh(s, true)}`; };
// vật vẽ bằng code làm mờ ở tiền cảnh (chiều sâu kiểu Flashslide)
const tienCanh = (name, ten, R, o = {}) => hero(name, ten, R, { css: `filter:blur(${o.mo ?? 5}px) drop-shadow(0 30px 40px rgba(0,0,0,.35));`, z: 40, sau: 1.7, alt: "Vật tiền cảnh", ...o });
// HÀNG (danh sách kiểu bản Office): thẻ trắng có vạch màu trái · vòng vật 3D · tên · một dòng giải thích · căn cứ nhỏ
const hangH = (x, W) => 26 + 48 + (x.desc ? dong(x.desc, W - 192, 27, 400) * 37 : 0) + (x.ref ? 40 : 0) + 24;
const hang = (name, X, Y, W, x, o = {}) => { const H = o.h || hangH(x, W), tw = W - 192, nd = x.desc ? dong(x.desc, tw, 27, 400) : 0, mau = o.mau || P.blue, fx = o.fx || {}, ty = Y + Math.max(26, (H - hangH(x, W)) / 2 + 26);
  return `${the(name, { x: X, y: Y, w: W, h: H }, { trai: mau, traiW: 10, go: x.go, ...fx })}${x.icon ? vong(`${name}i`, X + 34, Y + (H - 104) / 2, 104, x.icon, { mau: o.vmau, go: x.go, ...fx }) : ""}
    ${chu("bh-rn1", X + 162, ty, tw, esc(x.name || ""), { go: x.go, ...fx })}${x.desc ? chu("bh-rd", X + 162, ty + 50, tw, tx(x.desc), { go: x.go, ...fx }) : ""}${x.ref ? chu("bh-rr", X + 162, ty + 58 + nd * 37, tw, esc(x.ref), { color: mau, go: x.go, ...fx }) : ""}`; };
const cot3 = (rows, X, top, W, bot, o = {}) => { const hs = rows.map((x) => hangH(x, W)), gap = Math.max(18, Math.min(34, (bot - top - hs.reduce((a, b) => a + b, 0)) / Math.max(1, rows.length - 1)));
  let y = top; return rows.map((x, k) => { const h = hang(`${o.ten || "bh-row"}${k}`, X, y, W, x, { mau: (o.mau || [])[k], vmau: (o.vmau || [])[k], fx: { ...vao(o.tre ?? 1 + k), sau: 0 } }); y += hs[k] + gap; return h; }).join(""); };
const nguon = (t) => (t ? chu("bh-src", 110, String(t).length > 150 ? 940 : 966, 1700, esc(t)) : "");
const khungAnh = (ctx, s, R, name = "bh-anh", o = {}) => { const u = ctx && ctx.img(s.photo); if (!u) return "";
  return lop(name, R, `<div style="width:100%;height:100%;border-radius:26px;overflow:hidden;border:12px solid #fff;box-sizing:border-box;background:#fff"><img src="${u}" style="width:100%;height:100%;object-fit:cover;object-position:${s.photoPos || "center"};display:block"></div>`, { alt: s.photoAlt || "Ảnh minh hoạ", z: 3, ...o }); };
const tenVat = (x, mac) => { const t = String(x || ""); return coF3d(t) ? t : mac; };
// hình chính của slide mở phần thu nhỏ ở góc phải slide kế (cùng tên Morph → "lùi máy quay")
const HERO_PHAN = ["sach", "so", "kiem"];
const goc = (k, R) => (HERO_PHAN[k] === "so" ? chongSo("bh-p-hero2", 10, { x: 1640, y: 96, w: 150, ...R }) : hero(`bh-p-hero${k + 1}`, HERO_PHAN[k], { x: 1650, y: 92, w: 140, ...R }));

const S = {};

// 1 · BÌA — có ảnh: ảnh thật tràn viền phủ xanh BHXH, tiêu đề chữ đứng in hoa trắng (cụm nhấn vàng), sổ BHXH mờ ở tiền cảnh.
//            không ảnh: mặt bàn sổ · phiếu lương · phong bì (bản cũ)
S.bhbia = (s, deck, b, ctx) => { if (anhU(ctx, s)) { const px = 104, n = dong(s.title, 1100, px, "anton"), y0 = 300, yS = y0 + n * Math.round(px * 1.06) + 30;
    return `${anhTran(ctx, s)}${tienCanh("bh-p-so", "so", { x: 1480, y: 640, w: 400, r: -14 }, vao(2))}
      ${kick(s.kicker, 110, 220, { mau: "vang", fx: vao(0) })}${chu("bh-h1", 110, y0, 1150, tx(s.title || ""), { size: px, ...vao(0) })}
      ${s.subtitle ? chu("bh-sub", 110, yS, 900, tx(s.subtitle), vao(1)) : ""}
      ${s.author ? `${chu("bh-au", 110, 880, 900, esc(s.author), vao(1))}${chu("bh-aus", 110, 930, 900, esc([s.authorSub, s.date].filter(Boolean).join(" · ")), vao(1))}` : ""}`; }
  const px = s.titleSize || 76, n = dong(s.title, 900, px, 800), yS = 280 + n * Math.round(px * 1.16) + 26;
  return `${khungAnh(ctx, s, { x: 1120, y: 96, w: 690, h: 450, r: 3 }, "bh-anh", vao(0, "fade"))}
    ${hero("bh-p-so", "so", { x: 1170, y: 440, w: 330, r: -8 }, vao(1))}${hero("bh-phieu", "phieu", { x: 1540, y: 470, w: 270, r: 6 }, vao(2))}${hero("bh-p-phongbi", "phongbi", { x: 1240, y: 800, w: 300, r: -3 }, vao(3))}
    ${kick(s.kicker, 110, 210)}${chu("bh-h1", 110, 280, 900, tx(s.title || ""), { size: Math.min(px, 84) })}
    ${s.subtitle ? chu("bh-sub", 110, yS, 880, tx(s.subtitle)) : ""}
    ${s.author ? `${chu("bh-au", 110, 840, 900, esc(s.author))}${chu("bh-aus", 110, 890, 900, esc([s.authorSub, s.date].filter(Boolean).join(" · ")))}` : ""}
    ${s.photoCredit ? chu("bh-cr", 110, 1030, 900, esc(s.photoCredit)) : ""}`; };

// 2 · CÂU HỎI LỚN — câu hỏi lớn bên trái; bên phải ba vật lớn đứng như tĩnh vật (sách luật · chồng sổ · chồng xu) = ba mặt sẽ đo, nhãn dưới chân
S.bhdo = (s, deck, b, ctx) => { if (anhU(ctx, s)) { const L = (s.lines || []).length;
    const anh = s.photoLayout === "khung" ? anhKhung(ctx, s, { x: 1000, y: 250, w: 820, h: 560 }, { fx: vao(0, "fade") }) : anhBen(ctx, s, 1000);
    return `${anh}${kick(s.kicker, 110, 300)}${chu("bh-q", 110, 380, 860, tx((s.lines || []).join("\n")))}${chu("bh-qb", 110, 390 + L * 128, 860, tx(s.box || ""))}
`; }
  const dims = s.dims || [{ t: "Về luật", d: "Ai phải đóng, được gì" }, { t: "Người tham gia", d: "Bao nhiêu người đóng" }, { t: "Về quỹ", d: "Thu có đủ chi không" }];
  const L = (s.lines || []).length, day = 800, cx = [1080, 1400, 1700];
  const ve = [(o) => hero("bh-dimv0", "sach", { x: cx[0] - 150, y: day - 390, w: 300, r: -4 }, o), (o) => chongSo("bh-dimv1", 12, { x: cx[1] - 150, y: day - 300 * (40 + 18 + 12 * 24 + 50) / 314 + 14, w: 300 }, o), (o) => hero("bh-dimv2", "xu", { x: cx[2] - 140, y: day - 280, w: 280 }, o)];
  return `${lop("bh-san", { x: 900, y: day - 12, w: 940, h: 8 }, tron(P.line), { shadow: false, pad: 2, alt: "Mặt kệ", ...vao(0, "wipe") })}
    ${kick(s.kicker, 110, 330)}${chu("bh-q", 110, 390, 800, tx((s.lines || []).join("\n")))}${chu("bh-qb", 110, 400 + L * 112, 800, tx(s.box || ""))}
    ${dims.slice(0, 3).map((x, k) => `${ve[k]({ sau: 1.35, ...vao(k) })}${chu("bh-ct", cx[k] - 150, day + 26, 300, esc(x.t), { align: "center", ...vao(k) })}${chu("bh-cd", cx[k] - 150, day + 78, 300, esc(x.d), { align: "center", ...vao(k) })}`).join("")}`; };

// 3 · KẾT LUẬN CHÍNH — hình chính: hai chồng sổ đếm được (12 cuốn → 19 cuốn); thẻ hệ số tăng + thẻ năm đi lùi
S.bhtang = (s) => { const H = tieuDe(s), st = s.stats || [], a = st[0] || {}, b = st[1] || {}, d = st[2] || {}, va = parseFloat(String(a.value).replace(",", ".")), vb = parseFloat(String(b.value).replace(",", "."));
  const na = Math.round(va), nb = Math.round(vb), day = 900, W = 240, h = (n) => W * (40 + 18 + n * 24 + 50) / 314, he = va ? so((vb / va).toFixed(2)) : "";
  const cot = (x, n, gt, nam, k) => `${chongSo(`bh-cs${k}`, n, { x, y: day - h(n), w: W }, vao(k, "rise"))}${chu("bh-bv", x - 20, day - h(n) - 96, W + 40, esc(String(gt)), { align: "center", color: k ? P.blue : P.ink2, ...vao(k) })}${chu("bh-yr", x - 20, day + 8, W + 40, esc(nam), { align: "center", ...vao(k) })}`;
  return `${H.html}${cot(170, na, a.value, String(a.label || "").split("·")[0].trim() || "2015", 0)}${cot(520, nb, b.value, String(b.label || "").split("·")[0].trim() || "2025", 1)}
    ${chu("bh-leg", 110, 964, 900, esc(s.legend || "1 cuốn sổ = 1 triệu người đóng BHXH bắt buộc (làm tròn)"))}
    ${the("bh-he", { x: 920, y: Math.max(380, H.day + 50), w: 890, h: 230 }, { nen: "dam", ...vao(2) })}${soChay("bh-hev", 970, Math.max(380, H.day + 50) + 44, 300, 140, he, { color: "ffffff", at: 700 })}${chu("bh-hel", 994 + rong(he, 130, "anton"), Math.max(380, H.day + 50) + 80, 700 - rong(he, 130, "anton"), "lần sau mười năm", { color: "ffffff", ...vao(2) })}
    ${d.value ? `${the("bh-lui", { x: 920, y: Math.max(380, H.day + 50) + 260, w: 890, h: 230 }, { nen: "do", ...vao(3) })}${chu("bh-hev", 970, Math.max(380, H.day + 50) + 304, 300, esc(d.value), { color: "ffffff", ...vao(3) })}${chu("bh-hel", 994 + rong(String(d.value), 130, "anton"), Math.max(380, H.day + 50) + 328, 700 - rong(String(d.value), 130, "anton"), `Năm duy nhất đi lùi: ${esc(d.desc || "")}`, { color: "ffffff", ...vao(3) })}` : ""}`; };

// 4 · BA CÂU HỎI — sổ BHXH lớn bên trái; ba dải đánh dấu (xanh · vàng · đỏ) kéo ra từ gáy sổ thành ba hàng câu hỏi; bấm để mở phần
const TAB = MAU_PHAN.map((m) => m.so), TABG = MAU_PHAN.map((m) => m.g);   // dải của Phần 1 · 2 · 3 = màu của phần
S.bhba = (s) => { const H = tieuDe(s), it = (s.items || []).slice(0, 3), top = Math.max(320, H.day + 60), RH = 184, G = 40, c0 = top + 20 + RH / 2, c1 = c0 + (it.length - 1) * (RH + G);
  const R = giuaDai("so", c0, c1, 640);
  return `${H.html}${hero("bh-baso", "so", { ...R, r: -4 }, { sau: 1.35, ...vao(0) })}
    ${it.map((x, k) => { const Y = top + 20 + k * (RH + G), o = { ...vao(1 + k), sau: 0 };
      return `${dai(`bh-tab${k}`, R, Y + RH / 2, 60, 640, TABG[k], { go: x.go, ...o })}
        ${the(`bh-ba${k}`, { x: 640, y: Y, w: 1170, h: RH }, { trai: MAU_PHAN[k].dac, traiW: 12, go: x.go, ...o })}${chu("bh-bn", 690, Y + 34, 160, `0${k + 1}`, { go: x.go, color: TAB[k], ...o })}
        ${chu("bh-bk", 850, Y + 30, 900, `Phần ${k + 1}`, { go: x.go, color: TAB[k], ...o })}${chu("bh-bq", 850, Y + 70, 920, esc(x.q), { go: x.go, ...o })}`; }).join("")}
    ${chu("bh-hint", 640, top + 20 + 3 * (RH + G) - 10, 1100, esc(s.hint || "Bấm vào một hàng để mở phần đó"))}`; };

// 5 · 14 · 21 · MỞ PHẦN — số phần lớn + câu hỏi; bên phải hình chính của phần trên quầng sáng (slide sau thu về góc)
S.bhchuong = (s, deck, b, ctx) => { const k = Math.max(0, Math.min(2, (+s.num || 1) - 1));
  if (anhU(ctx, s)) { const px = 100, n = dong(s.title, 1000, px, "anton"), ten = ["sach", "so", "kiem"][k];
    return `${anhTran(ctx, s)}${lop("bh-sonen", { x: 40, y: 60, w: 1000, h: 760 }, `<div class="bh-pnumbg">${String(s.num).padStart(2, "0")}</div>`, { shadow: false, prop: true, alt: `Số phần ${s.num}`, z: 3, sau: 0.55, ...vao(0, "fade") })}${tienCanh(`bh-p-hero${k + 1}`, ten, { x: 1500, y: 560, w: 360, r: k === 1 ? 10 : -10 }, vao(2))}
      ${kick(`${s.partWord || "Phần"} ${String(s.num).padStart(2, "0")} / 03`, 110, 250, { mau: "vang", px: 26, fx: vao(0) })}${chu("bh-hc", 110, 340, 1050, tx(s.title || ""), { size: px, ...vao(0) })}
      ${s.sub ? chu("bh-sub", 110, 350 + n * Math.round(px * 1.06) + 30, 900, tx(s.sub), vao(1)) : ""}`; }
  const n = dong(s.title, 900, 64, 800), q = uid("q");
  const H = k === 0 ? hero("bh-p-hero1", "sach", { x: 1230, y: 200, w: 470, r: -4 }, { sau: 1.3, ...vao(0) }) : k === 1 ? `${chongSo("bh-p-hero2", 19, { x: 1240, y: 200, w: 330 }, { sau: 1.3, alt: "Chồng 19 cuốn sổ: 18,91 triệu người đóng BHXH bắt buộc năm 2025", ...vao(0) })}${hero("bh-xu", "xu", { x: 1570, y: 600, w: 240 }, { sau: 1.5, ...vao(1) })}` : `${hero("bh-p-hero3", "kiem", { x: 1250, y: 210, w: 470 }, { sau: 1.3, ...vao(0) })}${hero("bh-pbl", "sach", { x: 1130, y: 600, w: 230, r: -8 }, { sau: 1.5, alt: "Sách Luật BHXH 2024: kiến nghị sửa luật", ...vao(1) })}`;
  return `${lop("bh-quang", { x: 1060, y: 120, w: 860, h: 860 }, `<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><radialGradient id="${q}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#dbe9ff" stop-opacity=".9"/><stop offset="1" stop-color="#dbe9ff" stop-opacity="0"/></radialGradient></defs><circle cx="50" cy="50" r="50" fill="url(#${q})"/></svg>`, { shadow: false, alt: "Quầng sáng", z: 2, sau: 0.6 })}${H}
    ${kick(`${s.partWord || "Phần"} ${String(s.num).padStart(2, "0")} / 03`, 110, 230)}${chu("bh-pnum", 110, 290, 600, String(s.num).padStart(2, "0"))}
    ${chu("bh-hc", 110, 560, 900, tx(s.title || ""))}${s.sub ? chu("bh-sub", 110, 560 + n * 76 + 26, 880, tx(s.sub)) : ""}`; };

// 6 · TRÍCH LUẬT — sách Luật BHXH 2024 mở ngay trên slide: trang trái là câu trích nguyên văn (cụm nhấn tô vàng), trang phải là hai ý then chốt
S.bhtrich = (s) => { const H = tieuDe(s, { w: 1500 }), top = Math.max(300, H.day + 36), nt = String(s.note || ""), [dauN, sauN] = nt.includes(":") ? [nt.slice(0, nt.indexOf(":")), nt.slice(nt.indexOf(":") + 1)] : ["Ý then chốt", nt];
  const y = sauN.split("·").map((t) => t.trim()).filter(Boolean).slice(0, 3), VY = ["toa-nha", "khoa", "dau-tich"], BW = 1700, BH = Math.min(660, 1000 - top), PX = 110 + 22, PW = BW / 2 - 26, RX = 110 + BW / 2 + 4;
  return `${H.html}${lop("bh-sachmo", { x: 110, y: top, w: BW, h: BH }, V.sachMo(BW, BH), { shadow: false, alt: "Sách Luật BHXH 2024 mở", sau: 1.15, ...vao(0, "fade") })}
    ${chu("bh-sh", PX + 50, top + 34, PW - 100, esc(s.by || ""), vao(0, "fade"))}${chu("bh-qt", PX + 50, top + 92, PW - 100, f(s.quote || ""), vao(1))}${chu("bh-qro", PX + 50, top + BH - 110, PW - 100, esc(s.role || ""), vao(1))}
    ${nt ? `${chu("bh-sh", RX + 50, top + 34, PW - 160, esc(dauN.trim()), vao(2))}
      ${y.map((t, k) => `${vong(`bh-yi${k}`, RX + 60, top + 120 + k * 190, 130, VY[k], vao(2 + k))}${chu("bh-yt", RX + 220, top + 160 + k * 190, PW - 280, esc(t.charAt(0).toUpperCase() + t.slice(1)), vao(2 + k))}`).join("")}` : ""}`; };

// 7 · VAI TRÒ — ô che BHXH che cả gia đình và cuốn sổ (hình chính bên trái); ba vai trò thành ba hàng bên phải
const hangTu = (x, icon) => ({ name: x.name, desc: x.desc, ref: x.who, icon });
S.bhvaitro = (s, deck, b, ctx) => { const VD = ["o-mua", "can", "gio-hang"], it = (s.items || []).slice(0, 3);
  if (anhU(ctx, s)) { const H = tieuDe(s, { w: 900 }), top = Math.max(300, H.day + 40); return `${anhBen(ctx, s, 1040)}${H.html}${cot3(it.map((x, k) => hangTu(x, VD[k])), 110, top, 920, 1000)}`; }
  const H = tieuDe(s), top = Math.max(300, H.day + 44);
  return `${H.html}${lop("bh-oche", { x: 100, y: top, w: 640, h: 540 }, V.oChe(), { shadow: false, alt: "Ô che: BHXH che chắn người lao động", sau: 1.35, ...vao(0) })}
    ${vat("bh-nguoi1", "cong-nhan-nu", { x: 150, y: top + 440, w: 200 }, { sau: 1.35, ...vao(0) })}${vat("bh-nguoi2", "nguoi-gia", { x: 330, y: top + 470, w: 170 }, { sau: 1.35, ...vao(0) })}${hero("bh-vtso", "so", { x: 520, y: top + 450, w: 180, r: 8 }, { sau: 1.35, ...vao(0) })}
    ${cot3(it.map((x, k) => hangTu(x, VD[k])), 830, top, 980, 990)}`; };
// 8 · BA NHÓM — ba cuốn sổ BHXH xoè như quạt, mỗi cuốn mang hình của một nhóm; ba hàng bên phải
S.bhnhom = (s, deck, b, ctx) => { const VD = ["cong-nhan", "dia-cau", "van-phong"], it = (s.items || []).slice(0, 3);
  if (anhU(ctx, s)) { const kh = s.photoLayout === "khung", H = tieuDe(s, { w: kh ? 1680 : 900 }), top = Math.max(300, H.day + 40);
    return `${kh ? anhKhung(ctx, s, { x: 1090, y: top, w: 720, h: 470 }, { fx: vao(0, "fade") }) : anhBen(ctx, s, 1040)}${H.html}${cot3(it.map((x, k) => hangTu(x, VD[k])), 110, top, 920, 1000)}`; }
  const H = tieuDe(s), top = Math.max(300, H.day + 44);
  const so3 = [{ x: 90, y: top + 90, r: -14 }, { x: 260, y: top + 30, r: 0 }, { x: 430, y: top + 90, r: 14 }].map((p, k) => `${hero(`bh-nso${k}`, "so", { x: p.x, y: p.y, w: 300, r: p.r }, { sau: 1.35, ...vao(k) })}${vong(`bh-nsi${k}`, p.x + 96, p.y + 380, 118, VD[k], { z: 8, ...vao(k) })}`).join("");
  return `${H.html}${so3}${cot3(it.map((x, k) => hangTu(x, VD[k])), 830, top, 980, 990)}`; };

// 9 · NHÓM MỚI — bên trái: chồng năm cuốn sổ mới, dấu vàng "MỚI", số người nhóm mới đã tham gia; bên phải: năm hàng gọn
const VAT_NHOM = { l: "dong-ho", m: "cua-hang", n: "cap", e: "mu-quan", k: "nha" };
S.bhmorong = (s) => { const H = tieuDe(s), it = (s.items || []).slice(0, 5), top = Math.max(290, H.day + 40), RH = 110, G = Math.min(22, (930 - top - 5 * RH) / 4);
  return `${H.html}${chongSo("bh-mso", 5, { x: 120, y: top, w: 420 }, { sau: 1.35, ...vao(0) })}
    ${lop("bh-mdau", { x: 350, y: top + 70, w: 250, h: 110, r: -10 }, V.dau(250, 110, "e8930c"), { shadow: false, alt: "Dấu MỚI", z: 8, ...vao(1, "pop") })}${chu("bh-mdt", 360, top + 92, 230, "Mới", { align: "center", z: 31, ...vao(1, "pop") })}
    ${s.big ? `${soChay("bh-bigv", 110, top + 400, 680, 140, s.big.value, { at: 900 })}${chu("bh-bigl", 110, top + 530, 640, esc(s.big.label || ""), vao(2))}` : ""}
    ${it.map((x, k) => { const Y = top + k * (RH + G), o = { ...vao(1 + k), sau: 0 };
      return `${the(`bh-m${k}`, { x: 830, y: Y, w: 980, h: RH }, { trai: P.blue, traiW: 10, ...o })}${vong(`bh-mi${k}`, 862, Y + 13, 84, VAT_NHOM[x.k] || "nguoi", o)}${chu("bh-mt", 976, Y + (RH - 40) / 2, 800, esc(x.text), o)}`; }).join("")}
    ${nguon(s.source)}`; };

// 10 · MỐC HƯU (hai bước) — hình chính: trang "quá trình đóng" của sổ BHXH, mỗi ô một năm; bước 2: 5 ô cuối thành nét đứt,
// phong bì lương hưu trượt từ sau ô 20 về sau ô 15 (vật duy nhất chuyển động)
S.bhrutngan = (s, deck, b) => { const c0 = (s.cols || [])[0] || { n: 20, label: "" }, c1 = (s.cols || [])[1] || { n: 15, label: "" }, N = c0.n, M = c1.n, n = b === 2 ? M : N;
  const BX = 110, BY = 330, BW = 1240, BH = 450, PW = BW / 2 - 22, CW = 92, G = 18, gx = (PW - (5 * CW + 4 * G)) / 2;
  const o = (k) => { const trang = k < 10 ? 0 : 1, j = k % 10; return { x: BX + 18 + trang * (BW / 2 + 4 - 18) + gx + (j % 5) * (CW + G), y: BY + 110 + Math.floor(j / 5) * (CW + 34) }; };
  const o1 = (k, rong) => { const g = uid("oc"); return rong ? `<svg viewBox="0 0 100 100" width="100%" height="100%"><rect x="3" y="3" width="94" height="94" rx="18" fill="#ffffff" stroke="#${P.faint}" stroke-width="4" stroke-dasharray="10 8"/></svg>` : `<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#${b === 2 ? "3a8bff" : "7d8fb0"}"/><stop offset="1" stop-color="#${b === 2 ? "0b57d0" : "4a5a78"}"/></linearGradient></defs><rect width="100" height="100" rx="18" fill="url(#${g})"/><rect x="10" y="8" width="80" height="16" rx="8" fill="#fff" opacity=".3"/></svg>`; };
  const cuoi = o(n - 1), nh = b === 2 ? c1 : c0;
  return `${tieuDe(s).html}${s.ref && b === 2 ? `${the("bh-ref", { x: 1390, y: 330, w: 420, h: 450 }, { dai: "xanh", ...vao(1) })}${chu("bh-refh", 1420, 362, 360, esc(s.ref.head || ""), vao(1))}${chu("bh-reft", 1420, 446, 360, f(s.ref.text || ""), vao(1))}` : ""}
    ${lop("bh-somo", { x: BX, y: BY, w: BW, h: BH }, V.soMo(BW, BH), { shadow: false, alt: "Sổ BHXH mở trang quá trình đóng", ...vao(0, "fade") })}
    ${chu("bh-sot", BX + 40, BY + 26, 520, "Quá trình đóng BHXH", vao(0, "fade"))}${chu("bh-sot2", BX + BW / 2 + 26, BY + 26, 520, esc(s.legend || "Mỗi ô là một năm đóng BHXH"), vao(0, "fade"))}
    ${Array.from({ length: N }, (_, k) => { const p = o(k); return `${lop(`bh-o${k + 1}`, { x: p.x, y: p.y, w: CW, h: CW }, o1(k, b === 2 && k >= M), { shadow: false, m: `bh-o${k + 1}`, alt: `Năm đóng ${k + 1}`, ...vao(0, "fade") })}${chu("bh-oso", p.x, p.y + 26, CW, String(k + 1), { align: "center", color: b === 2 && k >= M ? "7f8ca6" : "ffffff", m: `bh-os${k + 1}`, ...vao(0, "fade") })}`; }).join("")}
    ${lop("bh-moc", { x: cuoi.x + CW - 40, y: cuoi.y - 74, w: 150, h: 109 }, V.phongBi(), { shadow: false, m: "bh-moc", alt: "Phong bì lương hưu — mốc được hưởng", ...vao(2, "pop") })}
    ${chu("bh-rn", 110, 830, 1700, `<b>${n} năm đóng</b> ${esc(nh.label || "")}`, { m: "bh-rn" })}
    ${nguon(s.source)}`; };

// 11 · NĂM CHẾ ĐỘ TRÊN ĐƯỜNG ĐỜI — người lao động 3D + trục thời gian 5 mốc (hiện lần lượt), mốc hưu viền vàng
const trangSo = (w, h) => { const g = uid("ts");
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#f3f7fd"/></linearGradient><linearGradient id="${g}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f7bff"/><stop offset="1" stop-color="#0a3a9a"/></linearGradient></defs>
    <rect x="0" y="8" width="${w}" height="${h - 8}" rx="24" fill="url(#${g}b)"/><rect x="26" y="0" width="${w - 34}" height="${h - 16}" rx="16" fill="url(#${g})"/>
    ${Array.from({ length: Math.floor((h - 120) / 44) }, (_, k) => `<path d="M80 ${110 + k * 44} H${w - 40}" stroke="#e3ebf7" stroke-width="2"/>`).join("")}
    ${Array.from({ length: Math.floor(h / 40) }, (_, k) => `<circle cx="40" cy="${30 + k * 40}" r="4" fill="#c9d8ee"/>`).join("")}</svg>`; };
S.bhduong = (s) => { const H = tieuDe(s), st = (s.stages || []).slice(0, 5), top = Math.max(300, H.day + 40), LY = top + 300, VD = ["nhiet-ke", "binh-sua", "bang-dan", "nguoi-gia", "hoa-sen"];
  return `${H.html}${lop("bh-trang", { x: 30, y: top + 40, w: 1860, h: 560 }, trangSo(1860, 560), { shadow: false, alt: "Trang quá trình tham gia của sổ BHXH", z: 2, sau: 1.1, ...vao(0, "fade") })}${chu("bh-sot", 110, top + 66, 700, "Quá trình tham gia BHXH", vao(0, "fade"))}${vat("bh-nld", "cong-nhan-nu", { x: 100, y: LY - 150, w: 210 }, vao(0))}${s.who ? `${chu("bh-whon", 60, LY + 80, 280, esc(s.who.name || ""), { align: "center", ...vao(0) })}${chu("bh-whos", 50, LY + 124, 300, esc(s.who.sub || ""), { align: "center", ...vao(0) })}` : ""}
    ${lop("bh-truc", { x: 340, y: LY - 5, w: 1420, h: 10 }, thanh("xanh", 5), { shadow: false, alt: "Trục thời gian", ...vao(0, "wipe") })}
    ${st.map((x, k) => { const cx = 450 + k * 316, chinh = k === (s.focus ?? -1), o = vao(1 + k, "pop");
      return `${lop(`bh-dv${k}`, { x: cx - 80, y: LY - 80, w: 160, h: 160 }, `<svg viewBox="0 0 160 160" width="100%" height="100%"><circle cx="80" cy="80" r="74" fill="#ffffff" stroke="#${chinh ? "f2a91d" : "9cc3ff"}" stroke-width="${chinh ? 10 : 6}"/></svg>`, { alt: "Mốc", ...o })}
        ${vat(`bh-di${k}`, VD[k], { x: cx - 52, y: LY - 52, w: 104 }, { z: 7, ...o })}
        ${chu("bh-dw", cx - 140, LY - 150, 280, esc(x.when || ""), { align: "center", color: chinh ? P.goldD : P.navy, ...o })}
        ${chu("bh-de", cx - 140, LY + 100, 280, esc(x.event || ""), { align: "center", ...o })}${chu("bh-dl", cx - 140, LY + 196, 280, esc(x.link || ""), { align: "center", color: chinh ? P.goldD : P.blue, ...o })}`; }).join("")}
    ${nguon(s.note)}`; };

// 12 · NĂM THẺ CHẾ ĐỘ — thẻ hưu trí dải vàng; hiện lần lượt
S.bhphieu5 = (s) => { const H = tieuDe(s), cols = (s.cols || []).slice(0, 5), rows = s.rows || [], top = Math.max(300, H.day + 40), VD = ["nhiet-ke", "binh-sua", "bang-dan", "nguoi-gia", "hoa-sen"];
  const HY = top, RY = top + 56, RH = 116, G = 12, X = 640, C1 = 770, C2 = 1040, C3 = 1440;
  const R = giuaDai("so", RY + RH / 2, RY + (cols.length - 1) * (RH + G) + RH / 2, X, 44, 600);
  return `${H.html}${hero("bh-5so", "so", { ...R, r: -4 }, { sau: 1.35, ...vao(0) })}
    ${chu("bh-th", C1, HY + 12, 250, "Chế độ", vao(0))}${chu("bh-th", C2, HY + 12, 380, esc(rows[0]?.label || "Điều kiện chính"), vao(0))}${chu("bh-th", C3, HY + 12, 360, esc(rows[1]?.label || "Mức hưởng"), vao(0))}
    ${cols.map((c, k) => { const Y = RY + k * (RH + G), chinh = k === s.focus, mau = chinh ? P.gold : P.blue, o = { ...vao(1 + k), sau: 0 };
      return `${dai(`bh-5tab${k}`, R, Y + RH / 2, 44, X, chinh ? "vang" : "xanh", o)}
        ${the(`bh-5r${k}`, { x: X, y: Y, w: 1170, h: RH }, { trai: mau, traiW: 12, ...o })}${vong(`bh-5i${k}`, X + 30, Y + (RH - 84) / 2, 84, VD[k], { mau: chinh ? "vang" : "", ...o })}
        ${chu("bh-5n", C1, Y + (RH - 40) / 2, 250, esc(c.name || ""), { color: chinh ? P.goldD : P.navy, ...o })}
        ${(c.cells || []).slice(0, 2).map((t, q) => { const W = q ? 350 : 380, n = dong(String(t).replace(/[[\]]/g, ""), W, 26, 400); return chu("bh-5c", q ? C3 : C2, Y + (RH - n * 35) / 2, W, f(t), o); }).join("")}`; }).join("")}`; };

// 13 · CÔNG THỨC (hai bước) — phiếu lương → thanh tỷ lệ hưởng (45 % → 65 %) → phong bì lương hưu
S.bhcongthuc = (s, deck, b) => { const t = s.terms || [], p = b === 2 ? 65 : 45, X = 520, W = 900, k = W / 80, BY = 600, top = 300;
  return `${tieuDe(s).html}${hero("bh-phieu", "phieu", { x: 110, y: top, w: 330, r: -3 }, vao(0))}${hero("bh-pbct", "phongbi", { x: 1480, y: top + 120, w: 330, r: 3 }, vao(2))}
    ${chu("bh-ftt", X, top + 6, 960, `<b>${esc(s.result?.label || "Lương hưu hằng tháng")}</b><br>= ${esc(t[0]?.label || "Tỷ lệ hưởng")} × ${esc(t[1]?.label || "Bình quân tiền lương")}`, vao(1))}
    ${chu("bh-hnote", X, top + 110, 900, esc(t[1]?.note || ""), vao(1))}
    ${lop("bh-mt1", { x: 440, y: BY + 2, w: 70, h: 49 }, muiTen(), { shadow: false, alt: "Mũi tên", ...vao(1) })}${lop("bh-mt2", { x: 1420 + 10, y: BY + 2, w: 60, h: 42 }, muiTen(), { shadow: false, alt: "Mũi tên", ...vao(2) })}
    ${lop("bh-ray", { x: X, y: BY, w: W, h: 56 }, thanh("nhat", 2.8), { shadow: false, alt: "Thang tỷ lệ hưởng", ...vao(1, "fade") })}
    ${lop("bh-fill", { x: X, y: BY, w: p * k, h: 56 }, thanh("xanh", 2.8), { m: "bh-fill", alt: `Tỷ lệ hưởng ${p}%`, ...vao(1, "wipe") })}
    ${[0, 45, 75].map((v) => `${lop(`bh-v${v}`, { x: X + v * k - 2, y: BY + 62, w: 4, h: 18 }, tron(P.mute), { shadow: false, alt: "Vạch", ...vao(1, "fade") })}${chu("bh-tick", X + v * k - 110, BY + 88, 220, v === 75 ? "75% (tối đa)" : `${v}%`, { align: "center", ...vao(1, "fade") })}`).join("")}
    ${chu("bh-ctp", X + p * k - 700, BY - 86, 700, `<b>${p}%</b> ${esc(b === 2 ? (s.buoc2 || "nữ đóng 25 năm") : (s.buoc1 || "nữ đóng 15 năm"))}`, { align: "right", m: "bh-ctp" })}
    ${the("bh-vd", { x: 110, y: 800, w: 1700, h: 110 }, { nen: "nhat", ...vao(3) })}${chu("bh-cte", 150, 832, 1640, f(b === 2 ? (s.example || "") : (t[0]?.note || "")), { m: "bh-cte", ...vao(3) })}
    ${nguon(s.note)}`; };

// 15 · 17 · BIỂU ĐỒ CỘT (hai bước khi "grow" khác false) — cột bóng mọc; số chú thích tại năm; thẻ kết luận; chồng sổ ở góc
S.bhcot2 = (s, deck, b, ctx) => { const H = tieuDe(s, { w: 1460, px: 60 }), hai = s.grow !== false && !(/người/.test(s.unit || "") && s.iso !== false), xong = !hai || b === 2, it = s.items || [], n = it.length, top = Math.max(290, H.day + 40);
  const CR = s.insight ? 1340 : 1810, X0 = 190, X1 = CR - 50, Y0 = top + 410, Y1 = top + 130, hi = Math.max(...it.map((x) => x.value)) * 1.08;
  const cw = (X1 - X0) / n, bw = cw * 0.58, xs = (k) => X0 + cw * (k + 0.5), ys = (v) => Y0 - (Y0 - Y1) * v / hi;
  // isotype: đơn vị là người → cột = chồng sổ; chọn số người mỗi cuốn để cột cao nhất có 10–22 cuốn
  const iso = /người/.test(s.unit || "") && s.iso !== false, vmax = Math.max(...it.map((x) => x.value)), mot = [0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10].find((u) => vmax / u <= 22) || 10, day = mot * (Y0 - Y1) / hi;
  const soDon = (u) => (u >= 1 ? `${so(u)} ${String(s.unit).replace(/^triệu\s*/, "triệu ")}` : `${so(Math.round(u * 1000)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}.000 người`);
  const mau = (x, k) => (x.focus ? "vang" : x.tone === "bad" || (k && x.value < it[k - 1].value) ? "do" : "xanh");
  const sau = (ms) => (iso ? { a: "fade", at: ms + 500, dur: 400 } : b === 2 ? { a: "fade", at: ms, dur: 400 } : hai ? {} : vao(Math.round(ms / 300), "fade"));
  const bands = (s.bands || []).map((bd) => { const a = it.findIndex((x) => x.label === bd.from), e = it.findIndex((x) => x.label === bd.to); if (a < 0 || e < 0) return ""; const x0 = xs(a) - cw / 2, x1 = xs(e) + cw / 2;
    return `${lop("bh-band", { x: x0, y: Y1 - 44, w: x1 - x0, h: Y0 - Y1 + 44 }, tron(P.redT), { shadow: false, z: 5, alt: "Dải giai đoạn" })}${chu("bh-bl", x0, Y1 - 36, x1 - x0, esc(String(bd.label)), { align: "center" })}`; }).join("");
  const chong = (x, k, h) => { const g = uid("cs"), m = GRAD[mau(x, k)], N = Math.ceil(h / day) + 1, w = bw;
    return `<svg viewBox="0 0 ${w.toFixed(1)} ${h.toFixed(1)}" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#${m[0]}"/><stop offset="1" stop-color="#${m[1]}"/></linearGradient></defs>
      ${Array.from({ length: N }, (_, i) => { const y = h - (i + 1) * day, l = ((i * 37) % 7) - 3, c = Math.max(1.4, day * 0.2);
        return `<g transform="translate(${l * 0.8} ${y.toFixed(2)})"><rect x="3" y="0" width="${w - 6}" height="${day.toFixed(2)}" rx="1.5" fill="#fbfcff"/><rect x="3" y="0" width="${w - 6}" height="${c.toFixed(2)}" fill="url(#${g})"/><rect x="3" y="${(day - c).toFixed(2)}" width="${w - 6}" height="${c.toFixed(2)}" fill="url(#${g})"/><rect x="3" y="0" width="7" height="${day.toFixed(2)}" fill="url(#${g})"/><path d="M12 ${(day / 2).toFixed(2)} H${w - 8}" stroke="#d9e2ef" stroke-width="1"/></g>`; }).join("")}</svg>`; };
  const cot = it.map((x, k) => { if (iso) { if (hai && !xong) return ""; const y = ys(x.value);
      return lop(`bh-cot${k + 1}`, { x: xs(k) - bw / 2, y, w: bw, h: Y0 - y }, chong(x, k, Y0 - y), { shadow: false, z: 7, alt: `Cột ${x.label}: chồng sổ BHXH`, a: "up", at: 120 + k * 90, dur: 520 }); }
    const y = xong ? ys(x.value) : Y0 - 6, g = uid("cg"); return lop(`bh-cot${k + 1}`, { x: xs(k) - bw / 2, y, w: bw, h: Y0 - y }, `<svg viewBox="0 0 10 100" width="100%" height="100%" preserveAspectRatio="none"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#${GRAD[mau(x, k)][0]}"/><stop offset="1" stop-color="#${GRAD[mau(x, k)][1]}"/></linearGradient></defs><rect width="10" height="100" fill="url(#${g})"/><rect x="1" width="2" height="100" fill="#fff" opacity=".3"/></svg>`, { shadow: false, m: `bh-cot${k + 1}`, z: 7, alt: `Cột ${x.label}`, ...(hai ? {} : vao(1 + Math.floor(k / 4), "rise")) }); }).join("");
  const nhanC = it.map((x, k) => `${chu("bh-cy", xs(k) - 55, Y0 + 14, 110, esc(x.label), { align: "center" })}${xong ? chu("bh-cv", xs(k) - 75, ys(x.value) - 50, 150, esc(x.display || so(x.value)), { align: "center", color: mau(x, k) === "do" ? P.redD : mau(x, k) === "vang" ? P.goldD : P.navy, ...sau(1000) }) : ""}`).join("");
  const whys = it.map((x, k) => (x.why ? k : -1)).filter((k) => k >= 0).slice(0, 4);
  // chấm chú thích: màu theo chiều thay đổi của năm được chú thích (giảm → đỏ, tăng → xanh) — đỏ chỉ cho điều tiêu cực
  const mauCham = (k) => (mau(it[k], k) === "do" ? P.red : P.blue);
  const cham = (name, x, y, j, trong, m, o = {}) => `${lop(name, { x, y, w: 42, h: 42 }, `<svg viewBox="0 0 42 42" width="100%" height="100%"><circle cx="21" cy="21" r="19" fill="#${trong ? "ffffff" : m}" stroke="#${trong ? m : "ffffff"}" stroke-width="3"/></svg>`, { shadow: false, z: 9, alt: "Số chú thích", ...o })}${chu("bh-wn", x, y + 6, 42, String(j + 1), { align: "center", color: trong ? m : "ffffff", ...o })}`;
  const so1 = xong ? whys.map((k, j) => { const y = ys(it[k].value), trong = Y0 - y > 70; return cham(`bh-wd${j}`, xs(k) - 21, trong ? y + 10 : y - 102, j, trong, mauCham(k), sau(1300)); }).join("") : "";
  const why = xong ? whys.map((k, j) => { const x = 150 + (j % 2) * ((CR - 150) / 2), y = Y0 + 70 + Math.floor(j / 2) * 70; return `${cham(`bh-wc${j}`, x, y, j, false, mauCham(k), sau(1500))}${chu("bh-wt", x + 56, y + 4, (CR - 150) / 2 - 80, `<b>${esc(it[k].label)}</b> ${f(it[k].why)}`, sau(1500))}`; }).join("") : "";
  const ins = s.insight || {};
  const pa = s.insightPhoto || null, ua = pa && ctx && ctx.img(pa), gi = uid("di");
  const dai = ua && xong ? `${lop("bh-insanh", { x: 1380, y: top + 450, w: 430, h: 180 }, `<div style="position:relative;width:100%;height:100%;border-radius:0 0 22px 22px;overflow:hidden"><img src="${ua}" style="width:100%;height:100%;object-fit:cover;display:block"><svg viewBox="0 0 10 10" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%"><defs><linearGradient id="${gi}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a3a9a"/><stop offset=".55" stop-color="#0a3a9a" stop-opacity=".25"/><stop offset="1" stop-color="#0a3a9a" stop-opacity="0"/></linearGradient></defs><rect width="10" height="10" fill="url(#${gi})"/></svg></div>`, { shadow: false, alt: "Dải ảnh", z: 5, pad: 0, ...sau(1700) })}` : "";
  const the2 = s.insight && xong ? `${the("bh-ins", { x: 1380, y: top, w: 430, h: ua ? 630 : 480 }, { nen: "dam", ...sau(1700) })}${dai}${soChay("bh-iv", 1414, top + 44, 380, 130, ins.value || "", { size: String(ins.value || "").length > 5 ? 96 : 120, color: "ffffff", at: (sau(1700).at || 1700) + 200 })}${chu("bh-iu", 1414, top + 200, 370, f(ins.unit || ""), { color: "ffffff", ...sau(1700) })}${chu("bh-it", 1414, top + 300, 370, f(ins.text || ""), { color: "dce9ff", ...sau(1700) })}` : "";
  return `${H.html}${the("bh-khung2", { x: 110, y: top, w: CR - 110, h: 630 }, hai ? {} : vao(0, "fade"))}${chu("bh-cu", 150, top + 30, 1100, esc(iso ? `Đơn vị: ${s.unit} · mỗi cuốn sổ = ${soDon(mot)}` : s.unit ? `Đơn vị: ${s.unit}` : ""))}
    ${lop("bh-truc", { x: X0 - 20, y: Y0, w: X1 - X0 + 40, h: 4 }, tron(P.ink2), { shadow: false, z: 8, alt: "Trục" })}${bands}${cot}${nhanC}${so1}${why}${the2}${nguon(s.note)}`; };

// 16 · ĐÃ PHỦ BAO NHIÊU — 50 người 3D (1 người = 2 %): màu = có BHXH, xám = chưa; hai thẻ phần trăm
S.bhche = (s, deck, b, ctx) => { const H = tieuDe(s), c0 = (s.cols || [])[0] || {}, c1 = (s.cols || [])[1] || {}, n0 = c0.n || 21, N = n0 + (c1.n || 29), top = Math.max(320, H.day + 50), u = f3d("nguoi");
  const coAnh = !!anhU(ctx, s);
  const luoi = `<div style="position:relative;width:100%;height:100%">${Array.from({ length: N }, (_, k) => `<img src="${u}" style="position:absolute;left:${(k % 10) * 94}px;top:${Math.floor(k / 10) * 94}px;width:84px;height:84px;${k < n0 ? "" : "filter:grayscale(1);opacity:.38;"}">`).join("")}</div>`;
  return `${H.html}${coAnh ? anhKhung(ctx, s, { x: 110, y: top, w: 990, h: 560 }, { fx: vao(0, "fade") }) : `${the("bh-lk", { x: 110, y: top, w: 990, h: 560 }, vao(0, "fade"))}${lop("bh-luoi", { x: 150, y: top + 40, w: 930, h: 460 }, luoi, { shadow: false, alt: `${N} người, ${n0} người có BHXH`, ...vao(0, "fade") })}
    ${chu("bh-leg", 150, top + 506, 900, esc(s.legend || "Mỗi người = 2% lực lượng lao động"), vao(0, "fade"))}`}
    ${(() => { const v = parseFloat(String(c0.value || "42").replace(",", ".")) / 100, D = 370, R = 150, C = 2 * Math.PI * R, X = 1170, g = uid("dn"), cx = 1480;
      const vong = `<svg viewBox="0 0 ${D} ${D}" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4b97ff"/><stop offset="1" stop-color="#0b57d0"/></linearGradient></defs>
        <circle cx="${D / 2}" cy="${D / 2}" r="${R}" fill="none" stroke="#ffd2cc" stroke-width="40"/><circle cx="${D / 2}" cy="${D / 2}" r="${R}" fill="none" stroke="url(#${g})" stroke-width="44" stroke-dasharray="${(C * v).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 ${D / 2} ${D / 2})"/></svg>`;
      return `${the("bh-vtk", { x: 1150, y: top, w: 660, h: 560 }, vao(1))}${lop("bh-vong", { x: cx - D / 2, y: top + 20, w: D, h: D }, vong, { shadow: false, z: 6, alt: `Vòng phần trăm: ${c0.value}% có BHXH`, ...vao(1, "grow") })}
        ${soChay("bh-dv0", cx - 120, top + 20 + D / 2 - 56, 240, 100, `${c0.value || "42"}%`, { align: "center", size: 88, at: 700 })}${chu("bh-dvl", cx - 110, top + 20 + D / 2 + 36, 220, "có BHXH", { align: "center", ...vao(1) })}
        ${lop("bh-dot0", { x: 1190, y: top + 410, w: 26, h: 26 }, tron("1e6ff0"), { shadow: false, alt: "Chấm xanh", ...vao(2) })}${chu("bh-dl", 1232, top + 402, 560, `<b>${esc(c0.value || "42")}%</b> ${esc(c0.label || "")}`, vao(2))}
        ${lop("bh-dot1", { x: 1190, y: top + 470, w: 26, h: 26 }, tron("f2958a"), { shadow: false, alt: "Chấm đỏ", ...vao(3) })}${chu("bh-dl", 1232, top + 462, 560, `<b class="do">${esc(c1.value || "58")}%</b> ${esc(c1.label || "")}`, vao(3))}`; })()}
    ${nguon(s.source)}`; };

// 18 · QUỸ — thanh ngang thu − chi từng năm; 2023–2025 nét đứt xám (khác phạm vi); chồng xu ở góc
S.bhquy = (s) => { const H = tieuDe(s, { w: 1460 }), rows = s.rows || [], k1 = rows.findIndex((x) => x.label === (s.den || "2022")), RH = 50, top = Math.max(340, H.day + 80), Z = 420, KX = 620 / Math.max(...rows.map((x) => Math.abs(x.value)));
  const W = 960, g = uid("qg"), g2 = uid("qv");
  const bars = rows.map((x, k) => { const y = k * RH + 8, w = Math.abs(x.value) * KX, xa = k > k1, x0 = x.value < 0 ? Z - 110 - w : Z - 110;
    const xu = (n) => Array.from({ length: n }, (_, c) => `<rect x="${(x0 + c * 11).toFixed(1)}" y="${y}" width="10" height="${RH - 16}" rx="4" fill="url(#${x.focus ? g2 : g})" stroke="#${x.focus ? "b5520a" : "9a6a10"}" stroke-width="1.2"/><rect x="${(x0 + c * 11 + 2).toFixed(1)}" y="${y + 3}" width="2.4" height="${RH - 22}" rx="1.2" fill="#fff" opacity=".45"/>`).join("");
    return xa ? `<rect x="${x0 + 1.5}" y="${y + 1.5}" width="${w - 3}" height="${RH - 19}" rx="8" fill="#ffffff" stroke="#${P.faint}" stroke-width="3" stroke-dasharray="7 5"/>` : xu(Math.max(1, Math.round(w / 11))); }).join("");
  const svg = `<svg viewBox="0 0 ${W} ${rows.length * RH}" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a3"/><stop offset=".45" stop-color="#f2b53a"/><stop offset="1" stop-color="#b9861f"/></linearGradient><linearGradient id="${g2}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd2a0"/><stop offset=".45" stop-color="#f08a24"/><stop offset="1" stop-color="#b5520a"/></linearGradient></defs>${bars}<path d="M${Z - 110} 0 V${rows.length * RH}" stroke="#${P.ink2}" stroke-width="3"/></svg>`;
  const chuBang = rows.map((x, k) => { const y = top + k * RH, xa = k > k1, w = Math.abs(x.value) * KX;
    return `${chu("bh-qy", 150, y + 6, 120, esc(x.label), { color: xa ? P.mute : P.navy, ...vao(1, "fade") })}${chu("bh-qv", x.value < 0 ? Z - w - 150 : Z + w + 16, y + 4, 130, esc(x.display || so(x.value)), { dl: true, align: x.value < 0 ? "right" : "left", color: xa ? P.mute : x.focus ? P.goldD : P.navy, ...vao(1, "fade") })}`; }).join("");
  const ghi = rows.map((x, k) => ({ x, k })).filter(({ x, k }) => x.note && k <= k1).map(({ x, k }) => chu("bh-qn", 1350, top + k * RH + 6, 430, `<b>${esc(x.label)}</b> ${esc(x.note)}`, vao(2, "fade"))).join("");
  const ngoai = k1 >= 0 && k1 < rows.length - 1 ? `${lop("bh-qngoac", { x: 1260, y: top + (k1 + 1) * RH, w: 14, h: (rows.length - k1 - 1) * RH - 10 }, `<svg viewBox="0 0 14 100" width="100%" height="100%" preserveAspectRatio="none"><path d="M2 2 H12 V98 H2" stroke="#${P.faint}" stroke-width="3" fill="none"/></svg>`, { shadow: false, alt: "Ngoặc", ...vao(3, "fade") })}${chu("bh-qn", 1350, top + (k1 + 1) * RH + 34, 430, esc(s.ngoai || "Phạm vi khác — chưa so được với 2015–2022"), { color: P.mute, ...vao(3, "fade") })}` : "";
  return `${H.html}${hero("bh-xu18", "xu", { x: 1610, y: 96, w: 190 })}${the("bh-qk", { x: 110, y: top - 70, w: 1180, h: rows.length * RH + 110 }, vao(0, "fade"))}${chu("bh-cu", 150, top - 48, 900, esc(s.unit ? `Đơn vị: ${s.unit} · thu − chi` : ""), vao(0, "fade"))}
    ${the("bh-qghi", { x: 1320, y: top - 70, w: 490, h: rows.length * RH + 110 }, vao(2, "fade"))}${lop("bh-quy", { x: 110, y: top, w: W, h: rows.length * RH }, svg, { shadow: false, alt: "Biểu đồ thu − chi", ...vao(1, "wipe") })}${chuBang}${ghi}${ngoai}${nguon(s.note)}`; };

// 19 · RÚT MỘT LẦN — số đỏ lớn; sổ BHXH bị đóng dấu "đã rút một lần"; ba thẻ ý
S.bhrut = (s, deck, b, ctx) => { const H = tieuDe(s, { boSub: true }), top = Math.max(330, H.day + 50), fa = (s.facts || []).slice(0, 3), VD = ["dong-ho-cat", "cong-nhan", "xu"];
  const ic = (x, k) => tenVat(x.icon === "hourglass" ? "dong-ho-cat" : x.icon === "users-three" ? "cong-nhan" : x.icon === "piggy-bank" ? "xu" : x.icon, VD[k]);
  if (anhU(ctx, s)) { const R = { x: 110, y: top, w: 880, h: 1000 - top };
    return `${H.html}${anhKhung(ctx, s, R, { fx: vao(0, "fade") })}
      ${lop("bh-daurut", { x: R.x + R.w - 330, y: R.y + 30, w: 340, h: 120, r: -10 }, conDau(340, 120), { shadow: false, alt: "Dấu đã rút một lần", z: 12, ...vao(1, "pop") })}${chu("bh-daut", R.x + R.w - 320, R.y + 72, 320, "Đã rút một lần", { align: "center", z: 40, ...vao(1, "pop") })}
      ${(() => { // số lớn cùng đơn vị với tiêu đề ("800.000", không "0,8" triệu): số dài → đơn vị xuống dưới số, ba thẻ ý dịch xuống và gọn lại
        const ns = String(s.num || ""), w220 = rong(ns, 220, "anton"), dai = w220 > 480, pxN = dai ? Math.min(200, Math.floor(740 * 220 / w220)) : 220;
        const donVi = dai ? chu("bh-heu", 1050, top - 40 + pxN + 8, 740, esc(s.unit || ""), { size: 30, ...vao(2) }) : chu("bh-heu", 1050 + w220 + 24, top + 20, 740 - w220, esc(s.unit || ""), { size: 30, ...vao(2) });
        // đáy thẻ cuối trùng đáy ảnh (1000); trên cùng chừa chỗ cho dòng đơn vị
        const HR = dai ? 116 : 128, DY = dai ? 132 : 150, dayDV = dai ? top - 40 + pxN + 8 + dong(s.unit || "", 740, 30, 800) * 38 : top + 200, Y0 = Math.max(dayDV + 18, 1000 - (2 * DY + HR));
        return `${soChay("bh-hero", 1040, top - 40, dai ? 770 : 420, 240, ns, { size: pxN, at: 600 })}${donVi}
        ${fa.map((x, k) => { const Y = Y0 + k * DY, o = { ...vao(3 + k), sau: 0 }; return `${the(`bh-r${k}`, { x: 1040, y: Y, w: 770, h: HR }, { trai: P.red, traiW: 10, ...o })}${chu("bh-rnum", 1076, Y + (HR - 54) / 2, 90, `0${k + 1}`, { color: P.red, ...o })}${chu("bh-rt", 1170, Y + (dong(x.text || x, 600, 30, 700) > 1 ? (HR - 78) / 2 : (HR - 39) / 2), 610, esc(x.text || x), o)}`; }).join("")}`; })()}`; }
  const pxH = Math.min(300, Math.floor(540 * 300 / Math.max(1, rong(String(s.num || ""), 300, "anton"))));
  return `${H.html}${chu("bh-hero", 110, top - 40 + (300 - pxH), 560, esc(s.num || ""), { size: pxH, ...vao(0, "pop") })}${chu("bh-heu", 110, top + 300, 520, esc(s.unit || ""), vao(0))}
    ${hero("bh-sorut", "so", { x: 660, y: top, w: 300, r: -6 }, vao(1))}${lop("bh-daurut", { x: 640, y: top + 150, w: 340, h: 120, r: -12 }, conDau(340, 120), { shadow: false, alt: "Dấu đã rút một lần", ...vao(2, "pop") })}${chu("bh-daut", 650, top + 192, 320, "Đã rút một lần", { align: "center", ...vao(2, "pop") })}
    ${fa.map((x, k) => { const Y = top + k * 196, o = vao(3 + k); return `${the(`bh-r${k}`, { x: 1040, y: Y, w: 770, h: 172 }, { dai: "do", daiH: 8, ...o })}${vong(`bh-ri${k}`, 1068, Y + 26, 120, ic(x, k), { mau: "do", ...o })}${chu("bh-rt", 1216, Y + 46, 570, esc(x.text || x), o)}`; }).join("")}`; };

// 20 · HỆ QUẢ RÚT MỘT LẦN — sổ BHXH mở: các ô năm đã đóng bị gạch, dấu đỏ "mất thời gian"; hai hệ quả bên phải
S.bhmat = (s) => { const H = tieuDe(s), ca = s.cause || {}, rs = (s.results || []).slice(0, 2), top = Math.max(300, H.day + 40), st = s.stamp || {}, NK = s.years || 6;
  const BX = 110, BY = top + 130, BW = 1000, BH = 420, CW = 96, G = 22;
  return `${H.html}${the("bh-ca", { x: 110, y: top, w: 1000, h: 112 }, { trai: P.blue, ...vao(0) })}${chu("bh-ctg", 150, top + 40, 170, esc(ca.tag || "Tình huống"), vao(0))}${chu("bh-ctx", 330, top + 20, 750, esc(ca.text || ""), { size: 28, ...vao(0) })}
    ${lop("bh-somo", { x: BX, y: BY, w: BW, h: BH }, V.soMo(BW, BH), { shadow: false, alt: "Sổ BHXH mở trang quá trình đóng", ...vao(1, "fade") })}${chu("bh-sot", BX + 40, BY + 26, 420, "Quá trình đóng BHXH", vao(1, "fade"))}
    ${Array.from({ length: NK }, (_, k) => { const x = BX + 70 + (k % 3) * (CW + G), y = BY + 110 + Math.floor(k / 3) * (CW + 30);
      return `${lop(`bh-mk${k}`, { x, y, w: CW, h: CW }, `<svg viewBox="0 0 100 100" width="100%" height="100%"><rect x="3" y="3" width="94" height="94" rx="18" fill="#eef2f8" stroke="#${P.faint}" stroke-width="4" stroke-dasharray="10 8"/><path d="M24 24 L76 76 M76 24 L24 76" stroke="#${P.red}" stroke-width="8" stroke-linecap="round" opacity=".75"/></svg>`, { shadow: false, alt: "Năm đã đóng bị mất", ...vao(2, "fade") })}${chu("bh-mkn", x, y + CW + 4, CW, `Năm ${k + 1}`, { align: "center", ...vao(2, "fade") })}`; }).join("")}
    ${lop("bh-daumat", { x: BX + 520, y: BY + 150, w: 420, h: 170, r: -8 }, conDau(420, 170), { shadow: false, alt: "Dấu mất thời gian", ...vao(3, "pop") })}${chu("bh-dmt", BX + 534, BY + 178, 392, esc(String(st.text || "Mất thời gian").replace(/\n/g, " ")), { align: "center", ...vao(3, "pop") })}${chu("bh-dms", BX + 534, BY + 262, 392, esc(st.sub || ""), { align: "center", ...vao(3, "pop") })}
    ${rs.map((x, k) => { const Y = top + k * 275, o = vao(4 + k); return `${the(`bh-kq${k}`, { x: 1170, y: Y, w: 640, h: 245 }, { dai: "do", daiH: 8, ...o })}${chu("bh-kt", 1210, Y + 40, 570, esc(x.text || ""), o)}${nhan(`bh-kr${k}`, 1210, Y + 170, x.ref || "", { dac: true, mau: "do", px: 20, ...o })}`; }).join("")}
    ${nguon(s.source)}`; };

// 22 · ĐẠT ĐƯỢC — điện thoại tra cứu quá trình đóng (thủ tục trực tuyến) + bốn thẻ số liệu; bảng kiểm của slide mở phần thu về góc
S.bhdat = (s, deck, b, ctx) => { const H = tieuDe(s, { w: 1460 }), c = (s.cells || []).slice(0, 4), top = Math.max(310, H.day + 50), VD = ["bieu-do-tang", "dien-thoai", "hop-ho-so", "can"], coAnh = !!anhU(ctx, s);
  const X0 = coAnh ? 640 : 470, CW = coAnh ? 575 : 660, G = coAnh ? 20 : 20, TW = CW - 200;
  return `${H.html}${coAnh ? anhKhung(ctx, s, { x: 110, y: top, w: 500, h: 580 }, { fx: vao(0, "fade") }) : hero("bh-dt", "dt", { x: 120, y: top, w: 290 }, vao(0))}${c.map((x, k) => { const X = X0 + (k % 2) * (CW + G), Y = top + Math.floor(k / 2) * 300, o = { ...vao(1 + k), sau: 0 };
    return `${the(`bh-d${k}`, { x: X, y: Y, w: CW, h: 280 }, { dai: "xanh", daiH: 8, ...o })}${vong(`bh-di${k}`, X + 28, Y + 40, coAnh ? 108 : 120, VD[k], o)}
      ${x.value ? soChay("bh-dv", X + 166, Y + 34, TW, 112, x.value, { at: 500 + k * 250 }) : ""}${chu("bh-dh", X + 166, Y + (x.value ? 146 : 50), TW, esc(x.head || ""), o)}${chu("bh-dt", X + 166, Y + (x.value ? 192 : 100) + (dong(x.head, TW, 30, 800) - 1) * 36, TW, esc(x.text || ""), o)}`; }).join("")}`; };

// 23 · 24 · HẠN CHẾ / KIẾN NGHỊ — ba thẻ cùng chỗ ở hai slide: dải đỏ (hạn chế) → dải xanh (kiến nghị)
const ba = (s, kn) => { const H = tieuDe(s), it = (s.items || []).slice(0, 3), lab = s.labels || [], top = Math.max(330, H.day + 56), VD = kn ? ["khoa", "sua-chua", "cua-hang"] : ["cua", "canh-bao", "nguoi-chay"];
  return `${H.html}${it.map((x, k) => { const X = 110 + k * 580, o = vao(k), nl = dong(x.name, 320, 40, 800) > 1;
    return `${the(`bh-hc${k}`, { x: X, y: top, w: 540, h: 540 }, { dai: kn ? "xanh" : "do", daiH: 120, ...o })}${chu("bh-hn", X + 36, top + (nl ? 18 : 38), 320, esc(x.name || ""), { color: "ffffff", size: nl ? 34 : 40, ...o })}${vong(`bh-hi${k}`, X + 380, top + 26, 130, VD[k], { mau: kn ? "" : "do", ...o })}
      ${chu("bh-hw", X + 36, top + 160, 470, `${lab[0] ? `<i>${esc(lab[0])}:</i> ` : ""}${esc(x.who || "")}`, { color: kn ? P.blue : P.redD, ...o })}
      ${chu("bh-hd", X + 36, top + 236, 470, tx(x.desc || ""), o)}${x.ref ? nhan(`bh-href${k}`, X + 36, top + 460, x.ref, { px: 18, ...o }) : ""}`; }).join("")}`; };
const baTab = (s, kn) => { const H = tieuDe(s), it = (s.items || []).slice(0, 3), lab = s.labels || [], top = Math.max(320, H.day + 50), VD = kn ? ["khoa", "sua-chua", "cua-hang"] : ["cua", "canh-bao", "nguoi-chay"];
  const MAU = kn ? [P.navy, P.navy, P.navy] : [P.red, P.red, P.red], TG = kn ? ["navy", "navy", "navy"] : ["do", "do", "do"];
  const rows = it.map((x, k) => ({ name: x.name, desc: x.desc, ref: `${lab[0] ? `${lab[0]}: ` : ""}${x.who || ""}`, icon: VD[k] }));
  const W = 1150, X = 660, hs = rows.map((x) => hangH(x, W)), gap = Math.max(20, Math.min(36, (990 - top - hs.reduce((a, b) => a + b, 0)) / 2));
  let y = top;
  const tam = rows.map((x, k) => top + hs.slice(0, k).reduce((a, b) => a + b + gap, 0) + hs[k] / 2);
  const RV = giuaDai(kn ? "sach" : "so", tam[0], tam[tam.length - 1], X, 60, 640, kn ? 120 : 80), mep = RV.mep;   // mép trang của sổ / sách: dải mọc ra từ đây
  const vat = hero(kn ? "bh-knsach" : "bh-hcso", kn ? "sach" : "so", { ...RV, r: -4 }, { sau: 1.35, ...vao(0) });
  const hang3 = rows.map((x, k) => { const Y = y, h = hs[k], o = { ...vao(1 + k), sau: 0 }; y += h + gap; const sd = kn ? ((it[k].who || "").match(/Điều\s*\d+/g) || []).map((d) => d.replace(/Điều\s*/, "")) : [], nhanTab = sd.length ? `Đ.${sd.join(", ")}` : "";   // dải = trang đánh dấu trong sách luật: ghi đúng số điều
    return `${dai(`bh-tab${k}`, RV, Y + h / 2, 60, X, TG[k], o)}${nhanTab ? chu("bh-tabt", mep, Y + h / 2 - 16, X - mep, esc(nhanTab), { align: "center", color: "ffffff", ...o }) : ""}
      ${hang(`bh-hc${k}`, X, Y, W, x, { mau: MAU[k], vmau: kn ? "" : "do", h, fx: o })}`; }).join("");
  return `${H.html}${vat}${hang3}`; };
S.bhhanche = (s) => baTab(s, false);
S.bhkiennghi = (s) => baTab(s, true);

// 25 · TRẮC NGHIỆM — bốn thẻ đáp án; phong bì lương hưu ở góc; slide sai / đúng
S.bhhoi = (s, deck, b, ctx) => { const op = (s.options || []).slice(0, 4), id = s.id || "cau-hoi", ok = op.findIndex((x) => x.ok);
  const nut = (txt, go, x, y, mau) => nhan("bh-nut", x, y, txt, { dac: true, mau, px: 28, w: 340, go });
  if (b === "sai" || b === "dung") { const d = b === "dung" ? s.right || {} : s.wrong || {}, dung = b === "dung";
    return `${kick(s.kicker)}${vat("bh-kq", dung ? "dau-tich" : "dau-x", { x: 110, y: 190, w: 150 }, vao(0, "pop"))}${chu("bh-qd", 300, 214, 1400, esc(d.title || ""), { color: dung ? "0f8a5a" : P.red, ...vao(0) })}
      ${dung && ok >= 0 ? `${the("bh-dung", { x: 110, y: 410, w: 835, h: 150 }, { trai: "14a06a", ...vao(1) })}${chu("bh-opl2", 160, 444, 90, "ABCD"[ok], { color: P.blue, ...vao(1) })}${chu("bh-opt", 260, 456, 650, esc(op[ok].text), vao(1))}` : ""}
      ${chu("bh-qx", 110, dung ? 610 : 410, 1080, f(d.text || d.hint || ""), vao(2))}${nut(d.button || (dung ? "Tiếp tục" : "Thử lại"), dung ? (s.next || null) : id, 110, 860, dung ? "xanh" : "do")}
      ${(() => { // phong bì lương hưu chở đáp án: nhãn dán ở góc — đúng → mức hưởng của đáp án ("40%"), sai → "?" (điều chưa giải quyết); nhãn "LƯƠNG HƯU" in trên phong bì giữ nguyên → đọc thành "lương hưu 40%"
        const PB = { x: 1290, y: 380, w: 500 }, pbH = PB.w / HERO.phongbi[1], nhanPb = dung ? ((op[ok] && String(op[ok].text).match(/\d+(?:[.,]\d+)?\s*%/)) || ["ABCD"[ok] || "?"])[0].replace(/\s+/g, "") : "?", pxP = 46;
        const wP = Math.round(rong(nhanPb, pxP, 800) + nhanPb.length * pxP * 0.07 + pxP * 2.4);
        return `${hero("bh-pbq", "phongbi", { ...PB, r: 4 }, vao(1))}${vien("bh-pbqn", PB.x + PB.w - wP * 0.75, PB.y + pbH * 0.02, nhanPb, { px: pxP, mau: dung ? "vang" : undefined, z: 12, fx: vao(2, "pop") })}`; })()}`; }
  if (anhU(ctx, s)) { const H = tieuDe(s, { w: 1040 }), top = Math.max(330, H.day + 50);
    return `${anhBen(ctx, s, 1240)}${H.html}${op.map((x, k) => { const X = 110 + (k % 2) * 530, Y = top + Math.floor(k / 2) * 250, go = `${id}-${x.ok ? "dung" : "sai"}`, o = { ...vao(k), sau: 0 };
      return `${the(`bh-op${k}`, { x: X, y: Y, w: 500, h: 220 }, { go, ...o })}${lop(`bh-opc${k}`, { x: X + 30, y: Y + 30, w: 96, h: 96 }, `<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><linearGradient id="og${k}${U}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a8bff"/><stop offset="1" stop-color="#0b57d0"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#og${k}${U})"/></svg>`, { shadow: false, go, alt: "Vòng chữ cái", ...o })}
        ${chu("bh-opl", X + 30, Y + 48, 96, "ABCD"[k], { align: "center", go, size: 56, ...o })}${chu("bh-opt", X + 30, Y + 146, 440, esc(x.text), { go, size: 32, ...o })}`; }).join("")}
      ${chu("bh-hint", 110, top + 510, 1000, "Bấm vào một thẻ để chọn")}`; }
  const H = tieuDe(s), top = Math.max(330, H.day + 60);
  return `${H.html}${hero("bh-pbq", "phongbi", { x: 100, y: top + 60, w: 560, r: -5 }, { sau: 1.35, ...vao(0) })}${chu("bh-hint", 130, top + 520, 520, "Bấm vào một thẻ để chọn")}${op.map((x, k) => { const X = 720 + (k % 2) * 555, Y = top + Math.floor(k / 2) * 290, go = `${id}-${x.ok ? "dung" : "sai"}`, o = { ...vao(1 + k), sau: 0 };
    return `${the(`bh-op${k}`, { x: X, y: Y, w: 535, h: 260 }, { go, ...o })}${lop(`bh-opc${k}`, { x: X + 36, y: Y + 36, w: 104, h: 104 }, `<svg viewBox="0 0 100 100" width="100%" height="100%"><defs><linearGradient id="og${k}${U}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a8bff"/><stop offset="1" stop-color="#0b57d0"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#og${k}${U})"/></svg>`, { shadow: false, go, alt: "Vòng chữ cái", ...o })}
      ${chu("bh-opl", X + 36, Y + 58, 104, "ABCD"[k], { align: "center", go, size: 60, ...o })}${chu("bh-opt", X + 36, Y + 168, 470, esc(x.text), { go, size: 34, ...o })}`; }).join("")}`; };

// 26 · KẾT LUẬN — trả lời lại đúng ba câu hỏi đầu bài + nhận định
S.bhtraloi = (s) => { const H = tieuDe(s), an = (s.answers || []).slice(0, 3), top = Math.max(310, H.day + 44), RH = 156, G = 22, c0 = top + RH / 2, c1 = c0 + (an.length - 1) * (RH + G);
  const R = giuaDai("so", c0, c1, 640);
  return `${H.html}${hero("bh-baso", "so", { ...R, r: -4 }, { sau: 1.35, ...vao(0) })}
    ${an.map((x, k) => { const Y = top + k * (RH + G), o = { ...vao(1 + k), sau: 0 };
      return `${dai(`bh-tab${k}`, R, Y + RH / 2, 60, 640, TABG[k], o)}
        ${the(`bh-a${k}`, { x: 640, y: Y, w: 1170, h: RH }, { trai: MAU_PHAN[k].dac, traiW: 12, ...o })}${chu("bh-bn", 690, Y + 30, 140, `0${k + 1}`, { color: TAB[k], ...o })}
        ${chu("bh-aq", 830, Y + 24, 950, esc(x.q || ""), o)}${chu("bh-aa", 830, Y + 62, 950, f(x.a || ""), o)}`; }).join("")}
    ${s.verdict ? (() => { const Y = top + 3 * (RH + G) + 6, n = dong(`Nhận định: ${s.verdict}`, 1080, 30, 400), h = 44 + n * 40;
      return `${the("bh-ver", { x: 640, y: Y, w: 1170, h }, { nen: "dam", ...vao(4) })}${chu("bh-vd", 690, Y + 22, 1080, `<b>Nhận định:</b> ${f(s.verdict)}`, { color: "ffffff", size: 30, ...vao(4) })}`; })() : ""}`; };
// 27 · GHI NHỚ — câu chốt lớn + ba thẻ số (bấm để quay lại slide chứng minh); người cao tuổi nhận phong bì lương hưu
const vongVang = () => { const g = uid("vv");
  return `<svg viewBox="0 0 900 900" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2c4" stop-opacity="0"/><stop offset=".45" stop-color="#ffd76a"/><stop offset=".7" stop-color="#e8b84a"/><stop offset="1" stop-color="#e8b84a" stop-opacity="0"/></linearGradient>
    <radialGradient id="${g}q" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#2f7bff" stop-opacity=".55"/><stop offset="1" stop-color="#2f7bff" stop-opacity="0"/></radialGradient></defs>
    <circle cx="450" cy="450" r="430" fill="url(#${g}q)"/>
    ${[[0, 300, 110, 4], [-14, 350, 130, 2.5], [18, 260, 84, 2]].map(([r, rx, ry, w]) => `<ellipse cx="450" cy="470" rx="${rx}" ry="${ry}" fill="none" stroke="url(#${g})" stroke-width="${w}" transform="rotate(${r} 450 470)"/>`).join("")}
</svg>`; };
S.bhghinho = (s) => { const ch = (s.chips || []).slice(0, 3);
  return `${lop("bh-gvong", { x: 1120, y: 30, w: 760, h: 760 }, vongVang(), { shadow: false, alt: "Vòng sáng", z: 2, sau: 0.7, ...vao(0, "fade") })}${lop("bh-gkhien", { x: 1330, y: 170, w: 340, h: 408 }, V.khien(), { shadow: false, alt: "Khiên an sinh", z: 4, sau: 1.3, ...vao(0, "pop") })}
    ${hero("bh-p-phongbi", "phongbi", { x: 1580, y: 400, w: 240, r: 8 }, { sau: 1.5, ...vao(1) })}
    ${kick(s.kicker || "Ghi nhớ", 110, 150, { mau: "vang" })}${chu("bh-gh", 110, 220, 1100, tx((s.lines || []).join("\n")))}
    ${ch.map((x, k) => { const X = 110 + k * 580, Y = 600, o = { ...vao(2 + k), sau: 0 }, g = uid("gk");
      return `${lop(`bh-g${k}`, { x: X, y: Y, w: 540, h: 290 }, `<svg viewBox="0 0 540 290" width="100%" height="100%"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffd76a"/><stop offset="1" stop-color="#e8930c"/></linearGradient></defs><rect x="1" y="1" width="538" height="288" rx="26" fill="#ffffff" fill-opacity=".09" stroke="#ffffff" stroke-opacity=".28" stroke-width="2"/><rect x="40" y="1" width="120" height="6" rx="3" fill="url(#${g})"/></svg>`, { shadow: false, go: x.go, alt: "Thẻ kính", z: 5, ...o })}
        ${chu("bh-gn", X + 40, Y + 40, 460, esc(x.n), { go: x.go, color: "ffc94a", ...o })}${chu("bh-gt", X + 40, Y + 190, 460, esc(x.text), { go: x.go, color: "ffffff", ...o })}`; }).join("")}
    ${s.basis ? chu("bh-src", 110, 960, 1700, esc(s.basis), { color: "9fb3d9" }) : ""}`; };

// 28 · KẾT — lời cảm ơn; mặt bàn khép bài: ảnh người nhận lương hưu đóng khung, sổ BHXH, phong bì lương hưu
S.bhket = (s, deck, b, ctx) => { if (anhU(ctx, s)) { const px = 96, n = dong(s.title, 1050, px, "anton"), y0 = 300, y = y0 + n * Math.round(px * 1.06) + 30, team = (s.team || []).slice(0, 4).map((t) => t.name).join(" · ");
    return `${anhTran(ctx, s)}${tienCanh("bh-p-phongbi", "phongbi", { x: 1460, y: 760, w: 420, r: 8 })}
      ${kick(s.kicker, 110, 220, { mau: "vang", fx: vao(0) })}${chu("bh-h1", 110, y0, 1100, tx(s.title || "Cảm ơn"), { size: px, ...vao(0) })}
      ${s.message ? chu("bh-sub", 110, y, 900, tx(s.message), vao(1)) : ""}${s.sub ? chu("bh-ks", 110, y + 20 + dong(s.message, 900, 30, 400) * 42, 900, esc(s.sub), vao(1)) : ""}
      ${team ? chu("bh-au", 110, 900, 900, esc(team), vao(1)) : ""}`; }
  const n = dong(s.title, 880, 72, 800), y = 280 + n * 84 + 30, team = (s.team || []).slice(0, 4).map((t) => t.name).join(" · ");
  // không ảnh: câu chốt thành một câu bằng hình — chồng 15 cuốn sổ ("15 năm đóng", mốc Điều 64 Luật 2024) → mũi tên → phong bì lương hưu
  const nKet = 15, wK = 300, hK = wK * (40 + 18 + nKet * 24 + 50) / 314, dayK = 880;
  return `${chongSo("bh-ketso", nKet, { x: 1080, y: dayK - hK, w: wK }, { alt: "Chồng 15 cuốn sổ BHXH: 15 năm đóng", ...vao(0, "rise") })}${chu("bh-ct", 1060, dayK + 16, wK + 40, "15 năm đóng", { align: "center", ...vao(0) })}
    ${lop("bh-ketmt", { x: 1425, y: dayK - 150, w: 120, h: 84 }, muiTen(), { shadow: false, alt: "Mũi tên: đóng → hưởng", ...vao(1, "wipe") })}
    ${hero("bh-p-phongbi", "phongbi", { x: 1570, y: dayK - 200, w: 260, r: 4 })}${chu("bh-ct", 1560, dayK + 16, 280, "Lương hưu", { align: "center", ...vao(1) })}
    ${kick(s.kicker, 110, 220, { m: false })}${chu("bh-h1", 110, 280, 880, tx(s.title || "Cảm ơn"), { size: 72 })}
    ${s.message ? chu("bh-sub", 110, y, 860, tx(s.message)) : ""}${s.sub ? chu("bh-ks", 110, y + 20 + dong(s.message, 860, 30, 400) * 42, 860, esc(s.sub)) : ""}
    ${team ? chu("bh-au", 110, 880, 880, esc(team)) : ""}${s.photoCredit ? chu("bh-cr", 110, 962, 900, esc(s.photoCredit)) : ""}`; };

// Tên Morph tự động: lớp ảnh lấy tên lớp (thêm tiền tố kiểu slide; vật "bh-p-…" và phần khung "bh-hd-…" giữ tên để trôi / đứng yên giữa các slide);
// hộp chữ lấy tên theo NỘI DUNG (kèm kiểu slide) → ở slide hai bước, cái gì giống hệt thì đứng yên.
const bam = (t) => { let h = 5381; for (const c of t) h = ((h * 33) ^ c.codePointAt(0)) >>> 0; return h.toString(36); };
function tenMorph(html, type) { const dem = {};
  const mot = (ten) => { dem[ten] = (dem[ten] || 0) + 1; return dem[ten] > 1 ? `${ten}-${dem[ten]}` : ten; };
  html = html.replace(/<div class="bh-l" data-l="([^"]+)"(?! data-m)/g, (m0, l) => `<div class="bh-l" data-l="${l}" data-m="${mot(l.startsWith("bh-p-") ? l : `${type}-${l}`)}" data-mt="0"`);
  return html.replace(/<div class="([^"]+)" data-t(?! data-m)([^>]*>)([\s\S]*?)<\/div>/g, (m0, cls, st, inner) => `<div class="${cls}" data-t data-m="${mot(`t-${bam(type + "|" + cls + "|" + inner)}`)}"${st}${inner}</div>`); }

const KET_LUAN = new Set(["bhhoi", "bhtraloi", "bhghinho"]);
const anhPhan = (deck, i) => { const s = deck.slides[i]; if (["bhbia", "bhket", "bhchuong", "bhghinho"].includes(s.type) || (deck.meta && deck.meta.hinh && deck.meta.hinh.nenAnh === false)) return null;
  if (s.nenAnh) return s.nenAnh;
  if (KET_LUAN.has(s.type)) { const k = deck.slides.find((x) => x.type === "bhket"); return (k && k.photo) || null; }
  for (let k = i; k >= 0; k--) { const c = deck.slides[k]; if (c.type === "bhchuong" || c.type === "bhbia") return c.photo || null; } return null; };
const nenAnh = (u) => `<div class="bh-nenanh" style="background-image:url('${u}')"></div><div class="bh-nenphu"></div>`;
function render(s, deck, ctx, { i, n }) {
  kit.reset();
  const isoCot = s.type === "bhcot2" && /người/.test(s.unit || "") && s.iso !== false;
  const hai = HAI_BUOC.has(s.type) && s.grow !== false && !isoCot;
  const buoc = s.type === "bhhoi" ? [0, "sai", "dung"] : hai ? [1, 2] : [0], id = s.id || `s${i + 1}`;
  if (s.type === "bhhoi" && !s.next) s = { ...s, next: (deck.slides[i + 1] || {}).id || `s${i + 2}` };
  return buoc.map((b) => { HV = b !== 2;
    const coBan = !["bhbia", "bhket", "bhchuong"].includes(s.type);
    const than = S[s.type](s, deck, b, ctx), phai = !than.includes('data-l="bh-anhben"');   // ảnh tràn mép phải: bỏ số trang + thanh tiến độ (đè lên ảnh)
    const pa = phai && anhPhan(deck, i), ua = pa && ctx && ctx.img(pa);
    const html = tenMorph(`${ua ? nenAnh(ua) : ""}${khung(s, deck, i, n, s.type !== "bhbia" && s.type !== "bhket", phai)}${coBan ? ban(deck, i) : ""}${than}`, s.type);
    HV = true;
    const toi = s.type === "bhghinho" || (["bhbia", "bhket", "bhchuong"].includes(s.type) && !!(ctx && s.photo && ctx.img(s.photo)));
    const sec = `<section class="s bh${toi ? " toi" : ""}" data-type="${esc(s.type)}" data-title="${esc(String(s.title || "").replace(/[[\]]/g, ""))}"><div class="cv">${html}</div></section>`;
    // chuyển cảnh: MÁY QUAY (hinh/may_quay.js) — khung + dải đầu đứng yên, cả cảnh trôi sang trái theo mạch bài; vào phần mới máy quay đi xuống;
    // slide ngay sau slide mở phần: máy quay phóng vào hình chính của phần. Bước 2 của slide hai bước: Morph thường (một vật đổi). Trắc nghiệm sai / đúng: mờ.
    const quiz = typeof b === "string", prev = deck.slides[i - 1];
    const cam = quiz || b === 2 || i === 0 ? null : s.type === "bhchuong" ? "pan:0,1" : prev && prev.type === "bhchuong" ? (prev.photo ? "zoom:2.4,700,520" : "zoom:2.6,1460,500") : "pan:1,0";
    return { id: b === 2 ? `${id}-b2` : quiz ? `${id}-${b}` : id, html: sec, tu: false, trans: quiz ? "fade" : "morph", cam, dur: b === 2 ? 900 : quiz ? 400 : cam && cam.startsWith("zoom") ? 1000 : 850, noclick: s.type === "bhhoi" && b !== "dung" }; });
}

// vân bảo an: đúng hoa văn hoa thị trên bìa sổ BHXH (hinh/bhxh_3d.js soBHXH) — in mờ ở mép phải (dưới dải đầu, không cắt thanh tiến độ) và góc dưới trái
const hoaThi = (cx, cy, k0, op) => Array.from({ length: 22 }, (_, k) => `<ellipse cx='${cx}' cy='${cy}' rx='${(40 + k * 9) * k0}' ry='${(20 + k * 4.5) * k0}' transform='rotate(${k * 8} ${cx} ${cy})'/>`).join("");
const VAN = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'><g fill='none' stroke='#0b57d0' stroke-width='1.3' stroke-opacity='0.12'>${hoaThi(1850, 320, 1.0, 1)}</g><g fill='none' stroke='#0b57d0' stroke-width='1.2' stroke-opacity='0.09'>${hoaThi(30, 1010, 0.9, 1)}</g></svg>`);
const cham = `url("data:image/svg+xml;utf8,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><circle cx='2' cy='2' r='1.6' fill='#0b57d0' fill-opacity='.06'/></svg>")}")`;
const css = `
.s.bh { background: radial-gradient(ellipse 45% 55% at 97% 0%, rgba(30,123,255,.24), transparent 66%), radial-gradient(ellipse 40% 50% at 0% 100%, rgba(30,123,255,.12), transparent 66%), linear-gradient(160deg, #ffffff 0%, #eaf2ff 62%, #d9e8ff 100%); color: #${P.ink}; }
.s.bh.toi { background: #072a6b; }
.bh-pnumbg { font: 400 700px/0.95 'Anton', sans-serif; color: rgba(255,255,255,.075); letter-spacing: -.02em; }
.s.bh.toi[data-type="bhghinho"] { background: radial-gradient(ellipse 60% 70% at 78% 40%, #1450b8 0%, #0a3486 45%, #061f57 100%); }
.s.bh.toi .bh-gh { color: #ffffff; } .s.bh.toi .bh-gh em { color: #ffc94a; }
.bh-dv0 { font: 400 104px/1 'Anton', sans-serif; color: #072a6b; } .bh-dvl { font: 800 24px/1.2 var(--fb); letter-spacing: .06em; text-transform: uppercase; color: #${P.mute}; }
.bh-dl { font: 400 26px/1.3 var(--fb); color: #${P.ink2}; } .bh-dl b { font: 400 40px/1 'Anton', sans-serif; color: #0b57d0; margin-right: 10px; } .bh-dl b.do { color: #${P.red}; }
.bh-nenanh { position: absolute; inset: -40px; background-size: cover; background-position: center; filter: blur(10px) saturate(1.3); opacity: .9; }
.bh-nenphu { position: absolute; inset: 0; background: url("data:image/svg+xml;utf8,${VAN}") center / 100% 100% no-repeat, linear-gradient(180deg, rgba(246,249,255,.9) 0%, rgba(246,249,255,0) 30%), linear-gradient(0deg, rgba(246,249,255,.9) 0%, rgba(246,249,255,0) 15%), linear-gradient(100deg, rgba(246,249,255,.94) 0%, rgba(240,246,255,.88) 42%, rgba(232,241,255,.8) 75%, rgba(224,236,255,.74) 100%); }
.s.bh.toi .bh-hdp { color: rgba(255,255,255,.72); } .s.bh.toi .bh-hdn { color: #ffc94a; }
.s.bh.toi .bh-h1, .s.bh.toi .bh-hc { color: #ffffff; } .s.bh.toi .bh-h1 em, .s.bh.toi .bh-hc em { color: #ffc94a; }
.s.bh.toi .bh-sub { color: rgba(255,255,255,.88); } .s.bh.toi .bh-au { color: #ffffff; } .s.bh.toi .bh-aus { color: rgba(255,255,255,.7); } .s.bh.toi .bh-ks { color: #ffc94a; }
.s.bh .cv { position: absolute; inset: 0; }
.bh-l { position: absolute; } .bh-l > svg, .bh-l > img { display: block; width: 100%; height: 100%; }
.s.bh [data-t] { position: absolute; }
.s.bh em { font-style: normal; color: #${P.blue}; }
.bh-nhan { font: 800 20px/1.2 var(--fb); letter-spacing: .08em; text-transform: uppercase; }
.bh-hdp { font: 800 18px/1.2 var(--fb); letter-spacing: .1em; text-transform: uppercase; color: #4f6a98; } .bh-hdn { font: 800 20px/1 var(--fb); color: #${P.blue}; }
.bh-h { font: 400 72px/1.1 'Anton', sans-serif; text-transform: uppercase; color: #072a6b; }
.bh-kk { font: 800 22px/1.2 var(--fb); letter-spacing: .06em; text-transform: uppercase; color: #ffffff; }
.bh-rn1 { font: 800 34px/1.2 var(--fb); color: #${P.navy}; } .bh-rd { font: 400 27px/1.37 var(--fb); color: #${P.ink2}; } .bh-rr { font: 800 20px/1.2 var(--fb); letter-spacing: .08em; text-transform: uppercase; }
.bh-sh { font: 800 22px/1.25 var(--fb); letter-spacing: .08em; text-transform: uppercase; color: #9a2a20; } .bh-mdt { font: 800 52px/1 var(--fb); letter-spacing: .12em; text-transform: uppercase; color: #c77a06; }
.bh-h1 { font: 400 84px/1.06 'Anton', sans-serif; text-transform: uppercase; color: #072a6b; }
.bh-hc { font: 400 72px/1.06 'Anton', sans-serif; text-transform: uppercase; color: #072a6b; }
.bh-pnum { font: 400 250px/1 'Anton', sans-serif; color: #${P.blue}; }
.bh-sub { font: 400 30px/1.4 var(--fb); color: #${P.ink2}; }
.bh-au { font: 800 32px/1.2 var(--fb); color: #${P.navy}; } .bh-aus { font: 400 24px/1.3 var(--fb); color: #${P.mute}; } .bh-ks { font: 800 28px/1.3 var(--fb); color: #${P.blue}; }
.bh-cr { font: 400 20px/1.2 var(--fb); color: #${P.mute}; }
.bh-src { font: 400 22px/1.35 var(--fb); color: #${P.mute}; }
.bh-q { font: 400 112px/1.08 'Anton', sans-serif; text-transform: uppercase; color: #072a6b; } .bh-qb { font: 400 128px/1.05 'Anton', sans-serif; text-transform: uppercase; color: #${P.blue}; }
.bh-ct { font: 800 34px/1.2 var(--fb); color: #${P.navy}; } .bh-cd { font: 400 26px/1.3 var(--fb); color: #${P.ink2}; }
.bh-yr { font: 400 50px/1 'Anton', sans-serif; color: #${P.navy}; } .bh-bv { font: 400 80px/1 'Anton', sans-serif; } .bh-leg { font: 400 24px/1.3 var(--fb); color: #${P.mute}; }
.bh-hev { font: 400 130px/1 'Anton', sans-serif; } .bh-hel { font: 700 28px/1.3 var(--fb); }
.bh-bn { font: 400 96px/1 'Anton', sans-serif; } .bh-bk { font: 800 22px/1.2 var(--fb); letter-spacing: .1em; text-transform: uppercase; } .bh-bq { font: 800 38px/1.25 var(--fb); color: #${P.navy}; }
.bh-hint { font: 400 26px/1.2 var(--fb); color: #${P.mute}; }
.bh-qt { font: 400 36px/1.5 var(--fb); color: #3a2a12; } .bh-qt em { color: #${P.ink}; font-weight: 800; background: #ffe7a3; }
.bh-qby { font: 800 28px/1.2 var(--fb); color: #${P.blue}; } .bh-qro { font: 400 24px/1.3 var(--fb); color: #${P.mute}; }
.bh-ych { font: 800 32px/1.2 var(--fb); color: #${P.navy}; } .bh-yt { font: 800 36px/1.25 var(--fb); color: #${P.navy}; }
.bh-cn { font: 800 38px/1.2 var(--fb); color: #${P.navy}; } .bh-cw { font: 800 26px/1.2 var(--fb); color: #${P.blue}; } .bh-cx { font: 400 28px/1.42 var(--fb); color: #${P.ink2}; }
.bh-mt { font: 800 32px/1.25 var(--fb); color: #${P.navy}; }
.bh-bigv { font: 400 128px/1 'Anton', sans-serif; color: #${P.blue}; } .bh-bigl { font: 700 32px/1.3 var(--fb); color: #${P.ink2}; }
.bh-sot { font: 800 22px/1.2 var(--fb); letter-spacing: .1em; text-transform: uppercase; color: #${P.blue}; } .bh-sot2 { font: 700 24px/1.2 var(--fb); color: #${P.mute}; }
.bh-oso { font: 400 40px/1 'Anton', sans-serif; }
.bh-rn { font: 400 32px/1.2 var(--fb); color: #${P.ink2}; } .bh-rn b { font: 800 56px/1 var(--fb); color: #${P.navy}; margin-right: 18px; }
.bh-tick { font: 700 26px/1 var(--fb); color: #${P.mute}; }
.bh-refh { font: 800 22px/1.25 var(--fb); letter-spacing: .06em; text-transform: uppercase; color: #${P.blue}; } .bh-reft { font: 400 28px/1.45 var(--fb); color: #${P.ink}; } .bh-reft em { color: #${P.ink}; font-weight: 800; background: #ffe7a3; }
.bh-whon { font: 800 34px/1.1 var(--fb); color: #${P.navy}; } .bh-whos { font: 400 24px/1.3 var(--fb); color: #${P.ink2}; }
.bh-dw { font: 800 40px/1 var(--fb); } .bh-de { font: 400 26px/1.32 var(--fb); color: #${P.ink2}; } .bh-dl { font: 800 26px/1.2 var(--fb); }
.bh-fn { font: 800 34px/1.15 var(--fb); color: #${P.navy}; } .bh-fr { font: 800 22px/1.2 var(--fb); letter-spacing: .08em; text-transform: uppercase; } .bh-fc { font: 400 27px/1.36 var(--fb); color: #${P.ink}; } .bh-fc em { color: #${P.goldD}; font-weight: 800; }
.bh-ftt { font: 400 34px/1.3 var(--fb); color: #${P.ink2}; } .bh-ftt b { font-weight: 800; color: #${P.navy}; } .bh-hnote { font: 400 24px/1.3 var(--fb); color: #${P.ink2}; }
.bh-ctp { font: 700 32px/1.2 var(--fb); color: #${P.ink2}; } .bh-ctp b { font: 400 80px/1 'Anton', sans-serif; color: #${P.blue}; margin-right: 12px; }
.bh-cte { font: 400 32px/1.35 var(--fb); color: #${P.ink}; } .bh-cte em { color: #${P.blue}; font-weight: 800; }
.bh-cu { font: 700 26px/1.2 var(--fb); color: #${P.mute}; } .bh-cy { font: 700 26px/1 var(--fb); color: #${P.ink2}; } .bh-cv { font: 400 40px/1 'Anton', sans-serif; }
.bh-bl { font: 800 24px/1 var(--fb); letter-spacing: .1em; color: #${P.redD}; }
.bh-wn { font: 800 24px/1.25 var(--fb); } .bh-wt { font: 400 26px/1.3 var(--fb); color: #${P.ink2}; } .bh-wt b { font-weight: 800; color: #${P.navy}; }
.bh-iv { font: 400 120px/1 'Anton', sans-serif; } .bh-iu { font: 800 32px/1.2 var(--fb); } .bh-it { font: 400 27px/1.38 var(--fb); }
.bh-pv { font: 400 140px/1 'Anton', sans-serif; } .bh-pl { font: 700 30px/1.3 var(--fb); }
.bh-qy { font: 400 34px/1 'Anton', sans-serif; } .bh-qv { font: 400 34px/1.1 'Anton', sans-serif; } .bh-qn { font: 400 26px/1.3 var(--fb); color: #${P.ink2}; } .bh-qn b { font-weight: 800; color: #${P.navy}; }
.bh-hero { font: 400 300px/1 'Anton', sans-serif; color: #${P.red}; } .bh-heu { font: 800 36px/1.25 var(--fb); color: #${P.navy}; } .bh-rt { font: 700 30px/1.3 var(--fb); color: #${P.ink}; } .bh-rnum { font: 400 54px/1 'Anton', sans-serif; }
.bh-daut { font: 800 28px/1.2 var(--fb); color: #${P.red}; text-transform: uppercase; }
.bh-ctg { font: 800 22px/1.2 var(--fb); letter-spacing: .1em; text-transform: uppercase; color: #${P.blue}; } .bh-ctx { font: 800 30px/1.3 var(--fb); color: #${P.navy}; }
.bh-mkn { font: 700 22px/1.2 var(--fb); color: #${P.mute}; }
.bh-dmt { font: 800 48px/1.15 var(--fb); color: #${P.red}; text-transform: uppercase; } .bh-dms { font: 800 26px/1.2 var(--fb); color: #${P.red}; }
.bh-kt { font: 700 30px/1.3 var(--fb); color: #${P.ink}; }
.bh-dv { font: 400 104px/1 'Anton', sans-serif; color: #${P.blue}; } .bh-dh { font: 800 30px/1.2 var(--fb); color: #${P.navy}; } .bh-dt { font: 400 26px/1.3 var(--fb); color: #${P.ink2}; }
.bh-hn { font: 800 40px/1.15 var(--fb); } .bh-hw { font: 800 27px/1.25 var(--fb); } .bh-hw i { font-style: normal; color: #${P.mute}; font-weight: 400; } .bh-hd { font: 400 28px/1.4 var(--fb); color: #${P.ink2}; }
.bh-opl { font: 400 64px/1 'Anton', sans-serif; color: #ffffff; } .bh-opl2 { font: 400 72px/1 'Anton', sans-serif; } .bh-opt { font: 800 38px/1.2 var(--fb); color: #${P.navy}; }
.bh-th { font: 800 20px/1.2 var(--fb); letter-spacing: .1em; text-transform: uppercase; color: #${P.ink2}; }
.bh-5n { font: 800 32px/1.25 var(--fb); } .bh-5c { font: 400 26px/1.35 var(--fb); color: #${P.ink}; } .bh-5c em { font-weight: 800; color: #${P.goldD}; }
.bh-tabt { font: 800 22px/1.2 var(--fb); letter-spacing: .02em; }
.bh-qd { font: 400 112px/1.05 'Anton', sans-serif; text-transform: uppercase; } .bh-qx { font: 400 36px/1.45 var(--fb); color: #${P.ink}; } .bh-qx em { color: #${P.blue}; font-weight: 800; }
.bh-an { font: 400 96px/1 'Anton', sans-serif; color: #${P.sky2}; } .bh-aq { font: 700 26px/1.3 var(--fb); color: #${P.mute}; } .bh-aa { font: 800 32px/1.32 var(--fb); color: #${P.navy}; } .bh-aa em { color: #${P.blue}; }
.bh-vd { font: 400 34px/1.3 var(--fb); } .bh-vd b { font-weight: 800; color: #ffd76a; margin-right: 8px; }
.bh-gh { font: 400 128px/1.06 'Anton', sans-serif; text-transform: uppercase; color: #072a6b; } .bh-gh em { color: #${P.blue}; }
.bh-gn { font: 400 130px/1 'Anton', sans-serif; } .bh-gt { font: 700 30px/1.3 var(--fb); }`;

module.exports = { TYPES, render, css };
