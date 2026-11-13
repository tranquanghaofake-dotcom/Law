// TẦNG HÌNH ẢNH — BỘ HÌNH BHXH "BÁO CÁO SÁNG" cho đề tài bảo hiểm xã hội (hướng B, 11/2026).
// Vì sao làm lại: bản "bàn hồ sơ" (người cắt giấy, sổ, bình quỹ vẽ bằng code, Morph kéo 20–50 vật mỗi lần bấm) bị chê
// xấu, rối, khó hiểu, chóng mặt. Hướng mới:
//   · nền sáng, MỘT lưới (lề 110 px, tiêu đề cố định ở dải trên, nội dung từ y ≈ 320, nguồn ở y ≈ 950, chân trang ở y 1012);
//   · minh hoạ bằng bộ icon Phosphor duotone (MIT, hinh/icon.js) — nét đồng nhất, không tự vẽ người / vật;
//   · mỗi slide MỘT hình chính đọc được ngay (biểu đồ, số lớn, trích luật, thẻ) — không ẩn dụ phải giải mã;
//   · chuyển cảnh mờ nhẹ; Morph chỉ ở slide hai bước, mỗi lần đúng MỘT vật đổi (mốc hưu trượt về 15, thanh tỷ lệ dài ra, cột mọc);
//   · một họ chữ Be Vietnam Pro (400 / 600 / 800), không Anton, không ký hiệu ngoài font (✓ → icon, → → chữ).
// Mọi tên lớp CSS bắt đầu bằng "bh-". Kịch bản nội dung: docs/specs/2026-11-13-bhxh-kich-ban-morph.md (phần Morph đã thay bằng luật trên).
const path = require("path"), fontkit = require("fontkit");
const { kit } = require("../stage/templates");
const { icon, coIcon } = require("./icon");
const { esc, f } = kit;

const TYPES = ["bhbia", "bhdo", "bhtang", "bhba", "bhchuong", "bhtrich", "bhvaitro", "bhnhom", "bhmorong", "bhrutngan", "bhduong", "bhphieu5", "bhcongthuc", "bhcot2", "bhche", "bhquy", "bhrut", "bhmat", "bhdat", "bhhanche", "bhkiennghi", "bhhoi", "bhtraloi", "bhghinho", "bhket"];
const HAI_BUOC = new Set(["bhrutngan", "bhcongthuc", "bhcot2"]);   // 1 slide deck.json → 2 slide PowerPoint; bước 2 vào bằng Morph (một vật đổi). bhcot2 có "grow": false → một slide
let U = 0; const uid = (p) => `${p}${++U}`;
const tx = (s) => f(s).replace(/\n/g, "<br>");

// ---------- bảng màu (nền sáng) ----------
const C = { bg: "f5f3ee", card: "ffffff", line: "e2ddd1", ink: "14233b", ink2: "3f4a5c", mute: "6e7787", faint: "b8bec8",
  green: "1f6b57", greenT: "e3efe9", amber: "b7791f", amberD: "8a5a12", amberT: "f7ebd5", red: "b23a30", redT: "f6e2de" };

// ---------- khối dựng ----------
// lớp ảnh (data-l): khung màn hình R, SVG / ảnh bên trong; bóng đổ rất nhẹ (nền sáng)
const lop = (name, R, inner, o = {}) => `<div class="bh-l" data-l="${name}"${o.m ? ` data-m="${o.m}" data-mt="0"` : ""}${o.go ? ` data-go="${o.go}"` : ""} data-pad="${o.pad ?? (o.shadow === false ? 6 : 34)}" data-alt="${esc(o.alt || "Hình minh hoạ")}" style="left:${Math.round(R.x)}px;top:${Math.round(R.y)}px;width:${Math.round(R.w)}px;height:${Math.round(R.h)}px;z-index:${o.z ?? 5};${o.shadow === false ? "" : "filter:drop-shadow(0 2px 3px rgba(20,35,59,.06)) drop-shadow(0 12px 24px rgba(20,35,59,.08));"}">${inner}</div>`;
// hộp chữ sửa được
const chu = (cls, x, y, w, html, o = {}) => `<div class="${cls}" data-t${o.m ? ` data-m="${o.m}"` : ""}${o.go ? ` data-go="${o.go}"` : ""} style="left:${Math.round(x)}px;top:${Math.round(y)}px;${w ? `width:${Math.round(w)}px;` : ""}${o.size ? `font-size:${o.size}px;` : ""}${o.color ? `color:#${o.color};` : ""}${o.align ? `text-align:${o.align};` : ""}z-index:${o.z ?? 30};">${html}</div>`;

// thẻ: nền trắng, viền mảnh, bo 20; dải màu trên (dai) hoặc trái (trai)
const theSvg = (w, h, o = {}) => { const r = o.r ?? 20, id = uid("cl");
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none"><defs><clipPath id="${id}"><rect width="${w}" height="${h}" rx="${r}"/></clipPath></defs>
    <rect width="${w}" height="${h}" rx="${r}" fill="#${o.nen || C.card}"/>${o.dai ? `<rect width="${w}" height="${o.daiH || 10}" fill="#${o.dai}" clip-path="url(#${id})"/>` : ""}${o.trai ? `<rect width="${o.traiW || 10}" height="${h}" fill="#${o.trai}" clip-path="url(#${id})"/>` : ""}
    <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${r - 1}" fill="none" stroke="#${o.vien || C.line}" stroke-width="${o.vienW || 2}"/></svg>`; };
const the = (name, R, o = {}) => lop(name, R, theSvg(R.w, R.h, o), { shadow: o.shadow, go: o.go, alt: o.alt || "Thẻ", z: o.z || 4 });
// icon trong vòng tròn màu nhạt
const huySvg = (ten, mau = C.green, nen = C.greenT, ty = 0.56) => { const p = (1 - ty) / 2 * 100;
  return `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="50" r="50" fill="#${nen}"/>${icon(ten, { mau, nen: mau, op: 0.2 }).replace('width="100%" height="100%"', `x="${p}" y="${p}" width="${ty * 100}" height="${ty * 100}"`)}</svg>`; };
const huy = (name, x, y, d, ten, o = {}) => lop(name, { x, y, w: d, h: d }, huySvg(ten, o.mau, o.nen, o.ty), { shadow: false, go: o.go, alt: o.alt || "Biểu tượng", z: o.z || 6 });
const hinhChuNhat = (mau, r = 0) => `<svg viewBox="0 0 10 10" width="100%" height="100%" preserveAspectRatio="none"><rect width="10" height="10" rx="${r}" fill="#${mau}"/></svg>`;
const muiTen = (mau = C.faint) => `<svg viewBox="0 0 90 60" width="100%" height="100%"><path d="M6 30 H70 M52 12 L76 30 L52 48" fill="none" stroke="#${mau}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
// "PiChartLineUpDuotone" (tên cũ trong deck.json) → "chart-line-up"; không có thì dùng icon mặc định
const tenIcon = (x, macDinh) => { const s = String(x || ""), m = s.match(/^Pi(.+?)Duotone$/), t = m ? m[1].replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase() : s; return t && coIcon(t) ? t : macDinh; };
const so = (v) => String(v).replace(".", ",");

// ---------- đo chữ: số dòng thật khi ngắt theo từ, đo bằng chính file font của bài ----------
const FD = path.join(__dirname, "fonts"), FONT = {};
const fontOf = (wt) => { const k = wt >= 750 ? "BeVietnam-Nang.ttf" : wt >= 550 ? "BeVietnam-Dam.ttf" : "BeVietnamPro-Regular.ttf"; return FONT[k] || (FONT[k] = fontkit.openSync(path.join(FD, k))); };
const rong = (t, px, wt) => { const F = fontOf(wt); return (F.layout(String(t).normalize("NFC")).advanceWidth / F.unitsPerEm) * px; };
const dong = (t, w, px, wt = 800) => String(t || "").replace(/[[\]]/g, "").split("\n").reduce((n, para) => { const sp = rong(" ", px, wt); let ln = 1, cur = 0;
  for (const wd of para.split(/\s+/).filter(Boolean)) { const ww = rong(wd, px, wt); if (cur && cur + sp + ww > w) { ln++; cur = ww; } else cur += (cur ? sp : 0) + ww; } return n + ln; }, 0) || 1;
// ---------- dải tiêu đề, nguồn, chân trang (giống nhau trên mọi slide nội dung) ----------
const dau = (s, o = {}) => { const w = o.w || 1600, px = o.px || 54, y = 118 + dong(s.title, w, px) * Math.round(px * 1.14);
  const subH = s.sub && !o.boSub ? 14 + dong(s.sub, o.subW || 1400, 30, 400) * 42 : 0;
  return { html: `${chu("bh-k", 110, 76, 1500, esc(s.kicker || ""))}${chu("bh-h", 110, 116, w, tx(s.title || ""), { size: px })}${s.sub && !o.boSub ? chu("bh-sub", 110, y + 14, o.subW || 1400, tx(s.sub)) : ""}`, day: y + subH }; };
const nguon = (t) => (t ? chu("bh-src", 110, String(t).length > 150 ? 924 : 952, 1700, esc(t)) : "");
const chan = (s, deck, i, n) => (["bhbia", "bhket"].includes(s.type) ? "" : `${s.type === "bhchuong" ? "" : chu("bh-ft", 110, 1014, 1000, esc(deck.meta?.short || ""))}${chu("bh-pg", 1610, 1014, 200, `${i + 1} / ${n}`, { align: "right" })}`);
const anhLop = (ctx, s, R) => { const u = ctx && ctx.img(s.photo); if (!u) return "";
  return lop("bh-anh", R, `<img src="${u}" style="width:100%;height:100%;object-fit:cover;object-position:${s.photoPos || "center"}">`, { shadow: false, alt: s.photoAlt || "Ảnh minh hoạ", z: 2 }); };

const S = {};

// 1 · BÌA — chữ bên trái, ảnh thật nửa phải
S.bhbia = (s, deck, b, ctx) => { const n = dong(s.title, 840, 76), yS = 326 + n * 85 + 34;
  return `${anhLop(ctx, s, { x: 1010, y: 0, w: 910, h: 1080 })}${lop("bh-vach", { x: 110, y: 246, w: 96, h: 10 }, hinhChuNhat(C.green, 2), { shadow: false, alt: "Vạch màu" })}
    ${chu("bh-k", 110, 280, 840, esc(s.kicker || ""))}${chu("bh-h1", 110, 326, 840, tx(s.title || ""))}
    ${s.subtitle ? chu("bh-sub", 110, yS, 840, tx(s.subtitle)) : ""}
    ${s.author ? `${chu("bh-au", 110, 850, 840, esc(s.author))}${chu("bh-aus", 110, 900, 840, esc([s.authorSub, s.date].filter(Boolean).join(" · ")))}` : ""}
    ${s.photoCredit ? chu("bh-cr", 110, 1014, 860, esc(s.photoCredit)) : ""}`; };

// 2 · CÂU HỎI LỚN — câu hỏi bên trái; ba mặt sẽ đo (luật · người tham gia · quỹ) bên phải
S.bhdo = (s) => { const dims = s.dims || [{ icon: "gavel", t: "Về luật", d: "Ai phải đóng, đóng để được gì" }, { icon: "users-three", t: "Về người tham gia", d: "Bao nhiêu người đóng mỗi năm" }, { icon: "piggy-bank", t: "Về quỹ", d: "Thu có đủ chi không" }];
  return `${chu("bh-k", 110, 76, 1500, esc(s.kicker || ""))}${chu("bh-q", 110, 300, 960, tx((s.lines || []).join("\n")))}${chu("bh-qb", 110, 300 + (s.lines || []).length * 110, 960, tx(s.box || ""))}
    ${dims.slice(0, 3).map((x, k) => { const Y = 300 + k * 200; return `${the(`bh-dim${k}`, { x: 1120, y: Y, w: 690, h: 170 })}${huy(`bh-dimi${k}`, 1150, Y + 35, 100, tenIcon(x.icon, "question"))}${chu("bh-ct", 1280, Y + 38, 500, esc(x.t))}${chu("bh-cd", 1280, Y + 92, 500, esc(x.d))}`; }).join("")}
    ${s.by ? chu("bh-src", 110, 952, 900, esc(s.by)) : ""}`; };

// 3 · KẾT LUẬN CHÍNH — hai thanh 2015 / 2025 cùng thang; bên phải: hệ số tăng + năm đi lùi
S.bhtang = (s) => { const H = dau(s), st = s.stats || [], a = st[0] || {}, b = st[1] || {}, d = st[2] || {}, va = parseFloat(String(a.value).replace(",", ".")), vb = parseFloat(String(b.value).replace(",", "."));
  const top = Math.max(380, H.day + 80), k = 640 / vb, he = va ? so((vb / va).toFixed(2)) : "";
  const thanh = (y, v, mau, nhan, nam, ten) => `${chu("bh-yr", 110, y + 34, 150, esc(nam))}${lop(ten, { x: 270, y, w: v * k, h: 116 }, hinhChuNhat(mau, 0.6), { shadow: false, alt: `Thanh ${nam}` })}${chu("bh-bv", 296 + v * k, y + 24, 520, `${esc(String(nhan.value))}<span> triệu người</span>`, { color: mau === C.faint ? C.ink2 : mau })}`;
  return `${H.html}${thanh(top, va, C.faint, a, String(a.label || "").split("·")[0].trim() || "2015", "bh-t15")}${thanh(top + 170, vb, C.green, b, String(b.label || "").split("·")[0].trim() || "2025", "bh-t25")}
    ${chu("bh-cd", 270, top + 316, 800, esc(`Số người ${a.desc || "đóng BHXH bắt buộc"}`))}
    ${the("bh-he", { x: 1300, y: top, w: 510, h: 230 }, { dai: C.green })}${chu("bh-hev", 1340, top + 34, 440, he, { color: C.green })}${chu("bh-hel", 1340, top + 160, 440, "lần sau mười năm")}
    ${d.value ? `${the("bh-lui", { x: 1300, y: top + 260, w: 510, h: 250 }, { dai: C.red })}${chu("bh-hev", 1340, top + 294, 440, esc(d.value), { color: C.red })}${chu("bh-hel", 1340, top + 410, 440, esc(d.desc || ""))}` : ""}`; };

// 4 · BA CÂU HỎI — ba thẻ bấm được (mỗi thẻ mở một phần)
const ICON_PHAN = ["book-open", "chart-line-up", "list-checks"];
S.bhba = (s) => { const H = dau(s), it = (s.items || []).slice(0, 3);
  return `${H.html}${it.map((x, k) => { const X = 110 + k * 580, Y = 330;
    return `${the(`bh-ba${k}`, { x: X, y: Y, w: 540, h: 440 }, { dai: C.green, go: x.go })}${huy(`bh-bai${k}`, X + 40, Y + 52, 110, ICON_PHAN[k], { go: x.go })}${chu("bh-bn", X + 380, Y + 60, 120, `0${k + 1}`, { align: "right", go: x.go })}
      ${chu("bh-bk", X + 40, Y + 210, 460, `Phần ${k + 1}`, { go: x.go })}${chu("bh-bq", X + 40, Y + 256, 460, esc(x.q), { go: x.go })}`; }).join("")}
    ${chu("bh-hint", 110, 810, 1500, esc(s.hint || "Bấm vào một thẻ để mở phần đó"))}`; };

// 5 · 14 · 21 · MỞ PHẦN — dải màu bên trái (icon + số phần), câu hỏi của phần bên phải
S.bhchuong = (s) => { const k = Math.max(0, Math.min(2, (+s.num || 1) - 1)), n = dong(s.title, 1000, 66);
  return `${lop("bh-panel", { x: 0, y: 0, w: 700, h: 1080 }, hinhChuNhat(C.green), { shadow: false, alt: "Dải màu phần" })}
    ${lop("bh-pi", { x: 110, y: 170, w: 220, h: 220 }, icon(ICON_PHAN[k], { mau: "ffffff", nen: "ffffff", op: 0.25 }), { shadow: false, alt: "Biểu tượng phần" })}
    ${chu("bh-pn", 100, 560, 560, String(s.num).padStart(2, "0"))}
    ${chu("bh-k", 800, 360, 1000, esc(`${s.partWord || "Phần"} ${s.num} · ${s.part || ""}`))}${chu("bh-hc", 800, 410, 1000, tx(s.title || ""))}
    ${s.sub ? chu("bh-sub", 800, 410 + n * 77 + 30, 980, tx(s.sub)) : ""}`; };

// 6 · TRÍCH LUẬT — thẻ trích nguyên văn (cụm nhấn tô vàng) + thẻ "ý then chốt"
S.bhtrich = (s) => { const nt = String(s.note || ""), [dauNote, sauNote] = nt.includes(":") ? [nt.slice(0, nt.indexOf(":")), nt.slice(nt.indexOf(":") + 1)] : ["Ý then chốt", nt];
  const y = sauNote.split("·").map((t) => t.trim()).filter(Boolean).slice(0, 3), IC = ["bank", "lock-key", "seal-check"];
  return `${chu("bh-k", 110, 76, 1500, esc(s.kicker || ""))}${chu("bh-h", 110, 116, 1600, tx(s.title || "Định nghĩa trong luật"), { size: 54 })}
    ${the("bh-qc", { x: 110, y: 270, w: 1150, h: 660 }, { trai: C.green })}${lop("bh-qi", { x: 160, y: 310, w: 80, h: 80 }, icon("quotes", { mau: C.green, nen: C.green, op: 0.2 }), { shadow: false, alt: "Dấu trích dẫn" })}
    ${chu("bh-qt", 170, 410, 1040, f(s.quote || ""))}${chu("bh-qby", 170, 800, 1040, esc(s.by || ""))}${chu("bh-qro", 170, 846, 1040, esc(s.role || ""))}
    ${nt ? `${the("bh-yc", { x: 1310, y: 270, w: 500, h: 660 })}${chu("bh-ych", 1350, 310, 420, esc(dauNote.trim()))}${y.map((t, k) => `${huy(`bh-yi${k}`, 1350, 400 + k * 190, 100, IC[k])}${chu("bh-yt", 1470, 420 + k * 190, 320, esc(t.charAt(0).toUpperCase() + t.slice(1)))}`).join("")}` : ""}`; };

// 7 · 8 · BA CỘT — ba thẻ cùng khuôn: icon, tên, dòng nhấn, giải thích
const baCot = (s, macDinh) => { const H = dau(s), it = (s.items || []).slice(0, 3), top = Math.max(340, H.day + 60), h = 340 + Math.max(...it.map((x) => dong(x.desc, 460, 28, 400))) * 40;
  return `${H.html}${it.map((x, k) => { const X = 110 + k * 580;
    return `${the(`bh-c${k}`, { x: X, y: top, w: 540, h })}${huy(`bh-ci${k}`, X + 40, top + 44, 120, tenIcon(x.icon, macDinh[k]))}
      ${chu("bh-cn", X + 40, top + 196, 460, esc(x.name || ""))}${chu("bh-cw", X + 40, top + 256, 460, esc(x.who || ""))}${chu("bh-cx", X + 40, top + 316, 460, tx(x.desc || ""))}`; }).join("")}`; };
S.bhvaitro = (s) => baCot(s, ["umbrella", "scales", "chart-line-up"]);
S.bhnhom = (s) => baCot(s, ["user", "globe", "buildings"]);

// 9 · NHÓM MỚI — năm thẻ nhỏ cùng hàng + dải số người đã tham gia
const ICON_NHOM = { l: "clock", m: "storefront", n: "briefcase", e: "shield", k: "house-line" };
S.bhmorong = (s) => { const H = dau(s), it = (s.items || []).slice(0, 5), top = Math.max(320, H.day + 50);
  return `${H.html}${it.map((x, k) => { const X = 110 + k * 346;
    return `${the(`bh-m${k}`, { x: X, y: top, w: 316, h: 330 }, { dai: C.green })}${huy(`bh-mi${k}`, X + 108, top + 44, 100, ICON_NHOM[x.k] || "user-plus")}${chu("bh-mt", X + 20, top + 172, 276, esc(x.text), { align: "center" })}`; }).join("")}
    ${s.big ? `${the("bh-big", { x: 110, y: top + 370, w: 1700, h: 170 }, { trai: C.green })}${chu("bh-bigv", 160, top + 396, 560, esc(s.big.value), { color: C.green })}${chu("bh-bigl", 740, top + 428, 1030, esc(s.big.label || ""))}` : ""}
    ${nguon(s.source)}`; };

// 10 · MỐC HƯU (hai bước) — dải 20 ô năm; bước 2: 5 ô cuối thành ô nét đứt, mốc "lương hưu" trượt về sau ô 15 (vật duy nhất chuyển động)
S.bhrutngan = (s, deck, b) => { const c0 = (s.cols || [])[0] || { n: 20, label: "" }, c1 = (s.cols || [])[1] || { n: 15, label: "" }, N = c0.n, M = c1.n, n = b === 2 ? M : N, X = 110, Y = 540, P = 82, O = 70;
  const o = (from, to, kieu) => `<svg viewBox="0 0 ${(to - from) * P - 10} ${O}" width="100%" height="100%">${Array.from({ length: to - from }, (_, k) => kieu === "rong" ? `<rect x="${k * P + 2}" y="2" width="${O - 4}" height="${O - 4}" rx="10" fill="none" stroke="#${C.faint}" stroke-width="3" stroke-dasharray="8 6"/>` : `<rect x="${k * P}" y="0" width="${O}" height="${O}" rx="10" fill="#${kieu}"/>`).join("")}</svg>`;
  const ranh = X + n * P - 5;
  const tick = [1, 5, 10, 15, 20].filter((t) => t <= N).map((t) => chu("bh-tick", X + (t - 1) * P - 18, Y + O + 14, O + 36, String(t), { align: "center" })).join("");
  const nhan = b === 2 ? c1 : c0;
  return `${chu("bh-k", 110, 76, 1500, esc(s.kicker || ""))}${chu("bh-h", 110, 116, 1600, tx(s.title || ""), { size: 54 })}
    ${chu("bh-rn", 110, 300, 1300, `<b>${n} năm đóng</b> · ${esc(nhan.label || "")}`)}
    ${lop("bh-o15", { x: X, y: Y, w: M * P - 10, h: O }, o(0, M, b === 2 ? C.green : C.ink2), { shadow: false, m: "bh-o15", alt: `${M} năm đóng đầu` })}
    ${lop("bh-o5", { x: X + M * P, y: Y, w: (N - M) * P - 10, h: O }, o(M, N, b === 2 ? "rong" : C.ink2), { shadow: false, m: "bh-o5", alt: `Năm ${M + 1}–${N}` })}${tick}
    ${lop("bh-moc", { x: ranh - 52, y: Y - 150, w: 104, h: 134 }, `<svg viewBox="0 0 104 134" width="100%" height="100%"><circle cx="52" cy="52" r="52" fill="#${C.amberT}"/>${icon("envelope-simple", { mau: C.amberD, nen: C.amber, op: 0.3 }).replace('width="100%" height="100%"', 'x="22" y="22" width="60" height="60"')}<path d="M52 104 V134" stroke="#${C.amber}" stroke-width="6"/></svg>`, { shadow: false, m: "bh-moc", alt: "Mốc lương hưu" })}
    ${chu("bh-mocl", ranh - 372, Y - 118, 300, "Lương hưu", { m: "bh-mocl", align: "right" })}
    ${chu("bh-leg", 110, Y + O + 64, 900, esc(s.legend || "Mỗi ô là một năm đóng BHXH"))}
    ${s.ref ? `${the("bh-ref", { x: 110, y: 760, w: 1700, h: 150 }, { trai: C.green })}${chu("bh-refh", 160, 786, 1600, esc(s.ref.head || ""))}${chu("bh-reft", 160, 830, 1620, f(s.ref.text || ""))}` : ""}
    ${nguon(s.source)}`; };

// 11 · NĂM CHẾ ĐỘ TRÊN ĐƯỜNG ĐỜI — trục thời gian 5 mốc, mốc trọng tâm màu hổ phách
S.bhduong = (s) => { const H = dau(s), st = (s.stages || []).slice(0, 5), top = Math.max(300, H.day + 30), LY = top + 330, IC = ["thermometer", "baby", "first-aid-kit", "armchair", "flower-lotus"];
  const who = s.who ? `${huy("bh-who", 110, top, 64, "user", { ty: 0.6 })}${chu("bh-who", 194, top + 14, 1500, `<b>${esc(s.who.name || "")}</b> — ${esc(s.who.sub || "")}`)}` : "";
  return `${H.html}${who}${lop("bh-truc", { x: 170, y: LY - 4, w: 1580, h: 8 }, hinhChuNhat(C.line, 4), { shadow: false, alt: "Trục thời gian" })}
    ${st.map((x, k) => { const cx = 230 + k * 365, chinh = k === (s.focus ?? -1);
      return `${huy(`bh-di${k}`, cx - 65, LY - 65, 130, tenIcon(x.icon, IC[k]), chinh ? { mau: C.amberD, nen: C.amberT } : {})}
        ${chu("bh-dw", cx - 170, LY - 150, 340, esc(x.when || ""), { align: "center", color: chinh ? C.amberD : C.ink })}
        ${chu("bh-de", cx - 170, LY + 90, 340, esc(x.event || ""), { align: "center" })}${chu("bh-dl", cx - 170, LY + 190, 340, esc(x.link || ""), { align: "center", color: chinh ? C.amberD : C.green })}`; }).join("")}
    ${nguon(s.note)}`; };

// 12 · NĂM PHIẾU CHẾ ĐỘ — năm thẻ cột, hai dòng (điều kiện · mức hưởng); thẻ trọng tâm viền hổ phách
S.bhphieu5 = (s) => { const H = dau(s), cols = (s.cols || []).slice(0, 5), rows = s.rows || [], top = Math.max(290, H.day + 40), IC = ["thermometer", "baby", "first-aid-kit", "armchair", "flower-lotus"];
  return `${H.html}${cols.map((c, k) => { const X = 110 + k * 346, chinh = k === s.focus;
    return `${the(`bh-f${k}`, { x: X, y: top, w: 316, h: 650 }, chinh ? { dai: C.amber, vien: C.amber, vienW: 3 } : { dai: C.green })}${huy(`bh-fi${k}`, X + 108, top + 36, 100, tenIcon(c.icon, IC[k]), chinh ? { mau: C.amberD, nen: C.amberT } : {})}
      ${chu("bh-fn", X + 16, top + 152, 284, esc(c.name || ""), { align: "center" })}
      ${(c.cells || []).slice(0, 2).map((t, j) => `${chu("bh-fr", X + 26, top + 230 + j * 210, 264, esc(rows[j]?.label || ""))}${chu("bh-fc", X + 26, top + 268 + j * 210, 264, f(t))}`).join("")}`; }).join("")}`; };

// 13 · CÔNG THỨC (hai bước) — ba hộp công thức; thanh tỷ lệ hưởng 45 % → 65 % (vật duy nhất chuyển động)
S.bhcongthuc = (s, deck, b) => { const t = s.terms || [], p = b === 2 ? 65 : 45, X = 110, W = 1700, k = W / 80, BY = 640;
  const hop = (x, ten, nhan, ic) => `${the(`bh-h${ten}`, { x, y: 300, w: 470, h: 150 }, { trai: C.green })}${huy(`bh-hi${ten}`, x + 34, 325, 100, ic)}${chu("bh-hl", x + 154, 350, 300, esc(nhan))}`;
  return `${chu("bh-k", 110, 76, 1500, esc(s.kicker || ""))}${chu("bh-h", 110, 116, 1600, tx(s.title || ""), { size: 54 })}
    ${hop(110, "lh", s.result?.label || "Lương hưu hằng tháng", "wallet")}${chu("bh-op", 590, 318, 100, "=", { align: "center" })}${hop(700, "tl", t[0]?.label || "Tỷ lệ hưởng", "percent")}${chu("bh-op", 1180, 318, 100, "×", { align: "center" })}${hop(1290, "bq", t[1]?.label || "Bình quân tiền lương", "receipt")}
    ${chu("bh-hnote", 1290, 466, 520, esc(t[1]?.note || ""))}
    ${lop("bh-ray", { x: X, y: BY, w: W, h: 56 }, hinhChuNhat(C.line, 2.8), { shadow: false, alt: "Thang tỷ lệ hưởng" })}
    ${lop("bh-fill", { x: X, y: BY, w: p * k, h: 56 }, hinhChuNhat(C.green, 2.8), { shadow: false, m: "bh-fill", alt: `Tỷ lệ hưởng ${p}%` })}
    ${[0, 45, 75].map((v) => `${lop(`bh-v${v}`, { x: X + v * k - 2, y: BY + 62, w: 4, h: 20 }, hinhChuNhat(C.mute), { shadow: false, alt: "Vạch" })}${chu("bh-tick", X + v * k - 120, BY + 90, 240, v === 75 ? "75% (tối đa)" : `${v}%`, { align: "center" })}`).join("")}
    ${chu("bh-ctp", X + p * k - 760, BY - 74, 760, `<b>${p}%</b> · ${esc(b === 2 ? (s.buoc2 || "nữ đóng 25 năm") : (s.buoc1 || "nữ đóng 15 năm"))}`, { align: "right" })}
    ${the("bh-vd", { x: 110, y: 790, w: 1700, h: 120 }, { nen: C.amberT, vien: C.amberT, shadow: false })}${chu("bh-cte", 150, 820, 1640, f(b === 2 ? (s.example || "") : (t[0]?.note || "")))}
    ${nguon(s.note)}`; };

// 15 · 17 · BIỂU ĐỒ CỘT (hai bước khi "grow" khác false) — bước 1 cột nằm sát trục, bước 2 cột mọc + số + nguyên nhân tại năm; thẻ kết luận bên phải
S.bhcot2 = (s, deck, b) => { const H = dau(s), hai = s.grow !== false, xong = !hai || b === 2, it = s.items || [], n = it.length, top = Math.max(280, H.day + 30);
  const CR = s.insight ? 1350 : 1810, X0 = 190, X1 = CR - 50, Y0 = top + 430, Y1 = top + 130, hi = Math.max(...it.map((x) => x.value)) * 1.08;
  const cw = (X1 - X0) / n, bw = cw * 0.56, xs = (k) => X0 + cw * (k + 0.5), ys = (v) => Y0 - (Y0 - Y1) * v / hi;
  const mau = (x, k) => (x.focus ? C.amber : x.tone === "bad" || (k && x.value < it[k - 1].value) ? C.red : C.green);
  const bands = (s.bands || []).map((bd) => { const a = it.findIndex((x) => x.label === bd.from), e = it.findIndex((x) => x.label === bd.to); if (a < 0 || e < 0) return ""; const x0 = xs(a) - cw / 2, x1 = xs(e) + cw / 2;
    return `${lop("bh-band", { x: x0, y: Y1 - 40, w: x1 - x0, h: Y0 - Y1 + 40 }, hinhChuNhat(C.redT), { shadow: false, z: 5, alt: "Dải giai đoạn" })}${chu("bh-bl", x0, Y1 - 34, x1 - x0, esc(String(bd.label)), { align: "center" })}`; }).join("");
  const cot = it.map((x, k) => { const y = xong ? ys(x.value) : Y0 - 6; return lop(`bh-cot${k + 1}`, { x: xs(k) - bw / 2, y, w: bw, h: Y0 - y }, hinhChuNhat(mau(x, k), 0.4), { shadow: false, m: `bh-cot${k + 1}`, z: 7, alt: `Cột ${x.label}` }); }).join("");
  const nhan = it.map((x, k) => `${chu("bh-cy", xs(k) - 55, Y0 + 12, 110, esc(x.label), { align: "center" })}${xong ? chu("bh-cv", xs(k) - 75, ys(x.value) - 46, 150, esc(x.display || so(x.value)), { align: "center", color: mau(x, k) === C.green ? C.ink : mau(x, k) }) : ""}`).join("");
  const whys = it.map((x, k) => (x.why ? k : -1)).filter((k) => k >= 0).slice(0, 4);
  const cham = (name, x, y, j, trang) => `${lop(name, { x, y, w: 40, h: 40 }, `<svg viewBox="0 0 40 40" width="100%" height="100%"><circle cx="20" cy="20" r="${trang ? 18 : 20}" fill="#${trang ? "ffffff" : C.red}"${trang ? ` stroke="#${C.red}" stroke-width="3"` : ""}/></svg>`, { shadow: false, z: 9, alt: "Số chú thích" })}${chu("bh-wn", x, y + 5, 40, String(j + 1), { align: "center", color: trang ? C.red : "ffffff" })}`;
  const so1 = xong ? whys.map((k, j) => { const y = ys(it[k].value), trong = Y0 - y > 70; return cham(`bh-wd${j}`, xs(k) - 20, trong ? y + 10 : y - 100, j, trong); }).join("") : "";   // cột đủ cao: số nằm trong đầu cột; cột thấp: số nằm trên nhãn giá trị
  const why = xong ? whys.map((k, j) => { const x = 150 + (j % 2) * ((CR - 150) / 2), y = Y0 + 70 + Math.floor(j / 2) * 70; return `${cham(`bh-wc${j}`, x, y, j)}${chu("bh-wt", x + 54, y + 4, (CR - 150) / 2 - 80, `<b>${esc(it[k].label)}</b> ${f(it[k].why)}`)}`; }).join("") : "";
  const ins = s.insight || {};
  const the2 = s.insight && xong ? `${the("bh-ins", { x: 1390, y: top, w: 420, h: 470 }, { dai: C.amber })}${chu("bh-iv", 1420, top + 50, 370, f(ins.value || ""), { size: String(ins.value || "").length > 5 ? 84 : 104 })}${chu("bh-iu", 1420, top + 190, 370, f(ins.unit || ""))}${chu("bh-it", 1420, top + 290, 360, f(ins.text || ""))}` : "";
  return `${H.html}${the("bh-khung", { x: 110, y: top, w: CR - 110, h: 660 }, { shadow: false })}${chu("bh-cu", 150, top + 30, 700, esc(s.unit ? `Đơn vị: ${s.unit}` : ""))}
    ${lop("bh-truc", { x: X0 - 20, y: Y0, w: X1 - X0 + 40, h: 3 }, hinhChuNhat(C.ink2), { shadow: false, z: 8, alt: "Trục" })}${bands}${cot}${nhan}${so1}${why}${the2}${nguon(s.note)}`; };

// 16 · ĐÃ PHỦ BAO NHIÊU — lưới 50 hình người (1 người = 2 %): xanh = có BHXH, xám = chưa
S.bhche = (s) => { const H = dau(s), c0 = (s.cols || [])[0] || {}, c1 = (s.cols || [])[1] || {}, n0 = c0.n || 21, N = n0 + (c1.n || 29), top = Math.max(320, H.day + 50);
  const nguoi = (mau) => icon("person", { mau, nen: mau, op: 0.35 });
  const luoi = `<svg viewBox="0 0 900 450" width="100%" height="100%">${Array.from({ length: N }, (_, k) => nguoi(k < n0 ? C.green : C.faint).replace('width="100%" height="100%"', `x="${(k % 10) * 90}" y="${Math.floor(k / 10) * 90}" width="80" height="80"`)).join("")}</svg>`;
  return `${H.html}${lop("bh-luoi", { x: 110, y: top, w: 900, h: 450 }, luoi, { shadow: false, alt: `${N} hình người, ${n0} người có BHXH` })}
    ${chu("bh-leg", 110, top + 470, 900, esc(s.legend || "Mỗi hình người = 2% lực lượng lao động"))}
    ${the("bh-s0", { x: 1110, y: top, w: 700, h: 220 }, { trai: C.green })}${chu("bh-pv", 1160, top + 30, 300, `${esc(c0.value || "42")}%`, { color: C.green })}${chu("bh-pl", 1160, top + 150, 620, esc(c0.label || ""))}
    ${the("bh-s1", { x: 1110, y: top + 250, w: 700, h: 220 }, { trai: C.red })}${chu("bh-pv", 1160, top + 280, 300, `${esc(c1.value || "58")}%`, { color: C.red })}${chu("bh-pl", 1160, top + 400, 620, esc(c1.label || ""))}
    ${nguon(s.source)}`; };

// 18 · QUỸ — biểu đồ thanh ngang thu − chi từng năm; 2023–2025 nét đứt màu xám (khác phạm vi, không so)
S.bhquy = (s) => { const H = dau(s), rows = s.rows || [], k1 = rows.findIndex((x) => x.label === (s.den || "2022")), RH = 50, top = Math.max(320, H.day + 70), Z = 420, KX = 620 / Math.max(...rows.map((x) => Math.abs(x.value)));
  const bars = rows.map((x, k) => { const y = k * RH + 8, w = Math.abs(x.value) * KX, xa = k > k1, mau = x.focus ? C.amber : xa ? C.faint : C.green, x0 = x.value < 0 ? Z - 110 - w : Z - 110;
    return xa ? `<rect x="${x0 + 1.5}" y="${y + 1.5}" width="${w - 3}" height="${RH - 19}" rx="4" fill="none" stroke="#${mau}" stroke-width="3" stroke-dasharray="7 5"/>` : `<rect x="${x0}" y="${y}" width="${w}" height="${RH - 16}" rx="4" fill="#${mau}"/>`; }).join("");
  const W = 960, svg = `<svg viewBox="0 0 ${W} ${rows.length * RH}" width="100%" height="100%">${bars}<path d="M${Z - 110} 0 V${rows.length * RH}" stroke="#${C.ink2}" stroke-width="3"/></svg>`;
  const chuBang = rows.map((x, k) => { const y = top + k * RH, xa = k > k1, w = Math.abs(x.value) * KX;
    return `${chu("bh-qy", 110, y + 6, 150, esc(x.label), { color: xa ? C.mute : C.ink })}${chu("bh-qv", x.value < 0 ? Z - w - 150 : Z + w + 16, y + 4, 130, esc(x.display || so(x.value)), { align: x.value < 0 ? "right" : "left", color: xa ? C.mute : x.focus ? C.amberD : C.ink })}`; }).join("");
  const ghi = rows.map((x, k) => ({ x, k })).filter(({ x, k }) => x.note && k <= k1).map(({ x, k }) => chu("bh-qn", 1250, top + k * RH + 6, 560, `<b>${esc(x.label)}</b> ${esc(x.note)}`)).join("");
  const ngoai = k1 >= 0 && k1 < rows.length - 1 ? `${lop("bh-qngoac", { x: 1220, y: top + (k1 + 1) * RH, w: 14, h: (rows.length - k1 - 1) * RH - 10 }, `<svg viewBox="0 0 14 100" width="100%" height="100%" preserveAspectRatio="none"><path d="M2 2 H12 V98 H2" stroke="#${C.faint}" stroke-width="3" fill="none"/></svg>`, { shadow: false, alt: "Ngoặc" })}${chu("bh-qn", 1250, top + (k1 + 1) * RH + 34, 560, esc(s.ngoai || "Phạm vi khác — chưa so được với 2015–2022"), { color: C.mute })}` : "";
  return `${H.html}${chu("bh-cu", 110, top - 52, 900, esc(s.unit ? `Đơn vị: ${s.unit} · thu − chi` : ""))}${lop("bh-quy", { x: 110, y: top, w: W, h: rows.length * RH }, svg, { shadow: false, alt: "Biểu đồ thu − chi" })}${chuBang}${ghi}${ngoai}${nguon(s.note)}`; };

// 19 · RÚT MỘT LẦN — số lớn bên trái, ba thẻ ý bên phải
S.bhrut = (s) => { const H = dau(s, { boSub: true }), top = Math.max(320, H.day + 50), fa = (s.facts || []).slice(0, 3), IC = ["hourglass", "users-three", "piggy-bank"];
  return `${H.html}${chu("bh-hero", 100, top - 20, 800, esc(s.num || ""), { color: C.red })}${chu("bh-heu", 110, top + 230, 780, esc(s.unit || ""))}${s.sub ? chu("bh-sub", 110, top + 350, 780, tx(s.sub)) : ""}
    ${fa.map((x, k) => { const Y = top + k * 200; return `${the(`bh-r${k}`, { x: 980, y: Y, w: 830, h: 170 }, { trai: C.red })}${huy(`bh-ri${k}`, 1020, Y + 35, 100, tenIcon(x.icon, IC[k]), { mau: C.red, nen: C.redT })}${chu("bh-rt", 1150, Y + 40, 630, esc(x.text || x))}`; }).join("")}`; };

// 20 · HỆ QUẢ RÚT MỘT LẦN — luồng ba cột: tình huống → mất thời gian (k3 Đ5) → hai hệ quả
S.bhmat = (s) => { const H = dau(s), ca = s.cause || {}, rs = (s.results || []).slice(0, 2), top = Math.max(300, H.day + 50), st = s.stamp || {};
  return `${H.html}${the("bh-ca", { x: 110, y: top, w: 500, h: 540 })}${huy("bh-cai", 150, top + 44, 110, "sign-out")}${chu("bh-ctg", 150, top + 190, 420, esc(ca.tag || "Tình huống"))}${chu("bh-ctx", 150, top + 236, 420, tx(ca.text || ""))}
    ${lop("bh-mt1", { x: 628, y: top + 240, w: 90, h: 60 }, muiTen(), { shadow: false, alt: "Mũi tên" })}
    ${the("bh-dm", { x: 736, y: top, w: 460, h: 540 }, { nen: C.redT, vien: C.red, vienW: 3, shadow: false })}${huy("bh-dmi", 911, top + 44, 110, "hourglass", { mau: C.red, nen: "ffffff" })}
    ${chu("bh-dmt", 766, top + 200, 400, esc(String(st.text || "Mất thời gian").replace(/\n/g, " ")), { align: "center" })}${chu("bh-dms", 766, top + 400, 400, esc(st.sub || ""), { align: "center" })}
    ${lop("bh-mt2", { x: 1214, y: top + 240, w: 90, h: 60 }, muiTen(), { shadow: false, alt: "Mũi tên" })}
    ${rs.map((x, k) => { const Y = top + k * 285; return `${the(`bh-kq${k}`, { x: 1322, y: Y, w: 488, h: 255 }, { trai: C.red })}${chu("bh-kt", 1362, Y + 34, 420, esc(x.text || ""))}${chu("bh-kr", 1362, Y + 186, 420, esc(x.ref || ""))}`; }).join("")}
    ${nguon(s.source)}`; };

// 22 · ĐẠT ĐƯỢC — bốn thẻ số liệu 2 × 2
S.bhdat = (s) => { const H = dau(s), c = (s.cells || []).slice(0, 4), top = Math.max(300, H.day + 50), IC = ["users-three", "device-mobile", "database", "scales"];
  return `${H.html}${c.map((x, k) => { const X = 110 + (k % 2) * 865, Y = top + Math.floor(k / 2) * 310;
    return `${the(`bh-d${k}`, { x: X, y: Y, w: 835, h: 280 }, { trai: C.green })}${huy(`bh-di${k}`, X + 44, Y + 44, 110, tenIcon(x.icon, IC[k]))}
      ${x.value ? chu("bh-dv", X + 190, Y + 30, 600, esc(x.value)) : ""}${chu("bh-dh", X + 190, Y + (x.value ? 146 : 50), 610, esc(x.head || ""))}${chu("bh-dt", X + 190, Y + (x.value ? 194 : 104), 610, esc(x.text || ""))}`; }).join("")}`; };

// 23 · 24 · HẠN CHẾ / KIẾN NGHỊ — ba thẻ cùng vị trí ở hai slide (hạn chế đỏ → kiến nghị xanh), người xem nối được từng cặp
const ba = (s, kn) => { const H = dau(s), it = (s.items || []).slice(0, 3), lab = s.labels || [], top = Math.max(340, H.day + 60), mau = kn ? C.green : C.red, nen = kn ? C.greenT : C.redT, IC = ["door-open", "warning", kn ? "storefront" : "user-minus"];
  return `${H.html}${it.map((x, k) => { const X = 110 + k * 580;
    return `${the(`bh-hc${k}`, { x: X, y: top, w: 540, h: 520 }, { dai: mau })}${huy(`bh-hi${k}`, X + 40, top + 48, 100, tenIcon(x.icon, IC[k]), { mau, nen })}
      ${chu("bh-hn", X + 40, top + 176, 460, esc(x.name || ""))}${chu("bh-hw", X + 40, top + 232, 460, `${lab[0] ? `<i>${esc(lab[0])}:</i> ` : ""}${esc(x.who || "")}`, { color: mau })}
      ${chu("bh-hd", X + 40, top + 300, 460, tx(x.desc || ""))}${x.ref ? chu("bh-href", X + 40, top + 462, 460, esc(x.ref)) : ""}`; }).join("")}`; };
S.bhhanche = (s) => ba(s, false);
S.bhkiennghi = (s) => ba(s, true);

// 25 · TRẮC NGHIỆM — bốn thẻ đáp án (bấm); slide sai / đúng riêng
S.bhhoi = (s, deck, b) => { const op = (s.options || []).slice(0, 4), id = s.id || "cau-hoi", ok = op.findIndex((x) => x.ok);
  const nut = (txt, go, x, y, mau) => `${lop("bh-nut", { x, y, w: 340, h: 92 }, hinhChuNhat(mau, 1.2), { shadow: false, go, alt: "Nút" })}${chu("bh-nutt", x, y + 26, 340, esc(txt), { align: "center", go })}`;
  if (b === "sai" || b === "dung") { const d = b === "dung" ? s.right || {} : s.wrong || {}, mau = b === "dung" ? C.green : C.red;
    return `${chu("bh-k", 110, 76, 1500, esc(s.kicker || ""))}${huy("bh-kqi", 110, 260, 140, b === "dung" ? "check-circle" : "x-circle", { mau, nen: b === "dung" ? C.greenT : C.redT })}${chu("bh-qd", 290, 272, 1400, esc(d.title || ""), { color: mau })}
      ${b === "dung" && ok >= 0 ? `${the("bh-dung", { x: 110, y: 460, w: 835, h: 150 }, { trai: C.green })}${chu("bh-opl2", 160, 498, 80, "ABCD"[ok], { color: C.green })}${chu("bh-opt", 250, 504, 660, esc(op[ok].text))}` : ""}
      ${chu("bh-qx", 110, b === "dung" ? 650 : 460, 1500, f(d.text || d.hint || ""))}
      ${nut(d.button || (b === "dung" ? "Tiếp tục" : "Thử lại"), b === "dung" ? (s.next || null) : id, 110, 860, mau)}`; }
  const H = dau(s);
  return `${H.html}${op.map((x, k) => { const X = 110 + (k % 2) * 865, Y = 330 + Math.floor(k / 2) * 250, go = `${id}-${x.ok ? "dung" : "sai"}`;
    return `${the(`bh-op${k}`, { x: X, y: Y, w: 835, h: 220 }, { go })}${lop(`bh-opc${k}`, { x: X + 40, y: Y + 60, w: 100, h: 100 }, `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" cy="50" r="50" fill="#${C.greenT}"/></svg>`, { shadow: false, go, alt: "Ô chữ cái" })}
      ${chu("bh-opl", X + 40, Y + 80, 100, "ABCD"[k], { align: "center", go })}${chu("bh-opt", X + 180, Y + 82, 620, esc(x.text), { go })}`; }).join("")}
    ${chu("bh-hint", 110, 860, 1500, "Bấm vào một thẻ để chọn")}`; };

// 26 · KẾT LUẬN — trả lời lại đúng ba câu hỏi đầu bài (cùng thứ tự, cùng số) + nhận định
S.bhtraloi = (s) => { const H = dau(s), an = (s.answers || []).slice(0, 3), top = Math.max(300, H.day + 50);
  return `${H.html}${an.map((x, k) => { const X = 110 + k * 580;
    return `${the(`bh-a${k}`, { x: X, y: top, w: 540, h: 470 }, { dai: C.green })}${huy(`bh-ai${k}`, X + 40, top + 44, 90, ICON_PHAN[k])}${chu("bh-an", X + 380, top + 50, 120, `0${k + 1}`, { align: "right" })}
      ${chu("bh-aq", X + 40, top + 160, 460, esc(x.q || ""))}${chu("bh-aa", X + 40, top + 270, 460, f(x.a || ""))}`; }).join("")}
    ${s.verdict ? `${the("bh-ver", { x: 110, y: top + 500, w: 1700, h: 120 }, { nen: C.amberT, vien: C.amber, shadow: false })}${chu("bh-vd", 150, top + 532, 1620, `<b>Nhận định:</b> ${f(s.verdict)}`)}` : ""}`; };

// 27 · GHI NHỚ — câu chốt lớn + ba thẻ số (bấm để quay lại slide chứng minh)
S.bhghinho = (s) => { const ch = (s.chips || []).slice(0, 3);
  return `${chu("bh-k", 110, 76, 1500, esc(s.kicker || "Ghi nhớ"))}${chu("bh-gh", 110, 150, 1700, tx((s.lines || []).join("\n")))}
    ${ch.map((x, k) => { const X = 110 + k * 580, Y = 520; return `${the(`bh-g${k}`, { x: X, y: Y, w: 540, h: 320 }, { dai: C.green, go: x.go })}${chu("bh-gn", X + 40, Y + 46, 460, esc(x.n), { go: x.go })}${chu("bh-gt", X + 40, Y + 200, 460, esc(x.text), { go: x.go })}`; }).join("")}
    ${s.basis ? nguon(s.basis) : ""}`; };

// 28 · KẾT — lời cảm ơn bên trái, ảnh thật nửa phải
S.bhket = (s, deck, b, ctx) => { const n = dong(s.title, 840, 72), y = 326 + n * 81 + 34, team = (s.team || []).slice(0, 4).map((t) => esc(t.name)).join(" · ");
  return `${anhLop(ctx, s, { x: 1010, y: 0, w: 910, h: 1080 })}${lop("bh-vach", { x: 110, y: 246, w: 96, h: 10 }, hinhChuNhat(C.green, 2), { shadow: false, alt: "Vạch màu" })}
    ${chu("bh-k", 110, 280, 840, esc(s.kicker || ""))}${chu("bh-h1", 110, 326, 840, tx(s.title || "Cảm ơn"), { size: 72 })}
    ${s.message ? chu("bh-sub", 110, y, 840, tx(s.message)) : ""}${s.sub ? chu("bh-ks", 110, y + 20 + dong(s.message, 840, 30, 400) * 42, 840, esc(s.sub)) : ""}
    ${team ? chu("bh-au", 110, 880, 840, team) : ""}${s.photoCredit ? chu("bh-cr", 110, 1014, 860, esc(s.photoCredit)) : ""}`; };

// Tên Morph tự động cho phần tử chưa có: lớp ảnh lấy tên lớp, hộp chữ lấy tên theo NỘI DUNG → ở slide hai bước, cái gì giống hệt thì đứng yên.
const bam = (t) => { let h = 5381; for (const c of t) h = ((h * 33) ^ c.codePointAt(0)) >>> 0; return h.toString(36); };
function tenMorph(html) { const dem = {};
  const mot = (ten) => { dem[ten] = (dem[ten] || 0) + 1; return dem[ten] > 1 ? `${ten}-${dem[ten]}` : ten; };
  html = html.replace(/<div class="bh-l" data-l="([^"]+)"(?! data-m)/g, (m0, l) => `<div class="bh-l" data-l="${l}" data-m="${mot(l)}" data-mt="0"`);
  return html.replace(/<div class="([^"]+)" data-t(?! data-m)( style="[^"]*">)([\s\S]*?)<\/div>/g, (m0, cls, st, inner) => `<div class="${cls}" data-t data-m="${mot(`t-${bam(cls + "|" + inner)}`)}"${st}${inner}</div>`); }

function render(s, deck, ctx, { i, n }) {
  kit.reset();
  const hai = HAI_BUOC.has(s.type) && s.grow !== false;
  const buoc = s.type === "bhhoi" ? [0, "sai", "dung"] : hai ? [1, 2] : [0], id = s.id || `s${i + 1}`;
  if (s.type === "bhhoi" && !s.next) s = { ...s, next: (deck.slides[i + 1] || {}).id || `s${i + 2}` };
  return buoc.map((b) => { const html = tenMorph(S[s.type](s, deck, b, ctx));
    const sec = `<section class="s bh" data-type="${esc(s.type)}" data-title="${esc(String(s.title || "").replace(/[[\]]/g, ""))}"><div class="cv">${html}${chan(s, deck, i, n)}</div></section>`;
    // chuyển cảnh: mờ nhẹ; chỉ bước 2 của slide hai bước dùng Morph (một vật đổi trong cùng khung)
    return { id: b === 2 ? `${id}-b2` : typeof b === "string" ? `${id}-${b}` : id, html: sec, tu: false, trans: b === 2 ? "morph" : (s.trans || "fade"), dur: b === 2 ? (s.dur2 || 1000) : (s.dur || 450), noclick: s.type === "bhhoi" && b !== "dung" }; });
}

const css = `
.s.bh { background: #${C.bg}; color: #${C.ink}; }
.s.bh .cv { position: absolute; inset: 0; }
.bh-l { position: absolute; } .bh-l > svg, .bh-l > img { display: block; width: 100%; height: 100%; }
.s.bh [data-t] { position: absolute; }
.s.bh em { font-style: normal; color: #${C.green}; }
.bh-k { font: 700 26px/1.2 var(--fb); letter-spacing: .12em; text-transform: uppercase; color: #${C.green}; }
.bh-h { font: 800 54px/1.14 var(--fb); color: #${C.ink}; }
.bh-h1 { font: 800 76px/1.12 var(--fb); color: #${C.ink}; }
.bh-hc { font: 800 66px/1.16 var(--fb); color: #${C.ink}; }
.bh-sub { font: 400 30px/1.4 var(--fb); color: #${C.ink2}; }
.bh-au { font: 800 32px/1.2 var(--fb); color: #${C.ink}; } .bh-aus { font: 400 26px/1.3 var(--fb); color: #${C.mute}; } .bh-ks { font: 700 30px/1.3 var(--fb); color: #${C.green}; }
.bh-cr, .bh-ft, .bh-pg { font: 400 22px/1.2 var(--fb); color: #${C.mute}; } .bh-pg { font-weight: 700; }
.bh-src { font: 400 22px/1.35 var(--fb); color: #${C.mute}; }
.bh-q { font: 800 96px/1.08 var(--fb); color: #${C.ink}; } .bh-qb { font: 800 96px/1.08 var(--fb); color: #${C.green}; }
.bh-ct { font: 800 34px/1.2 var(--fb); color: #${C.ink}; } .bh-cd { font: 400 28px/1.3 var(--fb); color: #${C.ink2}; }
.bh-yr { font: 800 40px/1 var(--fb); color: #${C.ink}; } .bh-bv { font: 800 64px/1 var(--fb); } .bh-bv span { font: 600 28px/1 var(--fb); color: #${C.ink2}; }
.bh-hev { font: 800 104px/1 var(--fb); } .bh-hel { font: 700 28px/1.3 var(--fb); color: #${C.ink2}; }
.bh-bn { font: 800 64px/1 var(--fb); color: #${C.green}; } .bh-bk { font: 700 26px/1.2 var(--fb); letter-spacing: .1em; text-transform: uppercase; color: #${C.mute}; } .bh-bq { font: 800 36px/1.25 var(--fb); color: #${C.ink}; }
.bh-hint { font: 400 26px/1.2 var(--fb); color: #${C.mute}; }
.bh-pn { font: 800 230px/1 var(--fb); color: #ffffff; letter-spacing: -.02em; }
.bh-qt { font: 400 38px/1.5 var(--fb); color: #${C.ink}; } .bh-qt em { color: #${C.ink}; font-weight: 800; background: #${C.amberT}; }
.bh-qby { font: 800 30px/1.2 var(--fb); color: #${C.green}; } .bh-qro { font: 400 26px/1.3 var(--fb); color: #${C.mute}; }
.bh-ych { font: 800 32px/1.2 var(--fb); color: #${C.ink}; } .bh-yt { font: 800 34px/1.25 var(--fb); color: #${C.ink}; }
.bh-cn { font: 800 40px/1.15 var(--fb); color: #${C.ink}; } .bh-cw { font: 700 28px/1.2 var(--fb); color: #${C.green}; } .bh-cx { font: 400 28px/1.42 var(--fb); color: #${C.ink2}; }
.bh-mt { font: 800 30px/1.25 var(--fb); color: #${C.ink}; }
.bh-bigv { font: 800 96px/1 var(--fb); } .bh-bigl { font: 700 34px/1.25 var(--fb); color: #${C.ink}; }
.bh-rn { font: 400 32px/1.2 var(--fb); color: #${C.ink2}; } .bh-rn b { font: 800 64px/1 var(--fb); color: #${C.ink}; margin-right: 10px; }
.bh-tick { font: 700 26px/1 var(--fb); color: #${C.mute}; } .bh-mocl { font: 800 30px/1 var(--fb); color: #${C.amberD}; } .bh-leg { font: 400 26px/1.3 var(--fb); color: #${C.mute}; }
.bh-refh { font: 700 26px/1.2 var(--fb); letter-spacing: .08em; text-transform: uppercase; color: #${C.green}; } .bh-reft { font: 400 32px/1.4 var(--fb); color: #${C.ink}; } .bh-reft em { color: #${C.ink}; font-weight: 800; background: #${C.amberT}; }
.bh-who { font: 400 28px/1.2 var(--fb); color: #${C.ink2}; } .bh-who b { font-weight: 800; color: #${C.ink}; }
.bh-dw { font: 800 38px/1 var(--fb); } .bh-de { font: 400 26px/1.32 var(--fb); color: #${C.ink2}; } .bh-dl { font: 700 26px/1.2 var(--fb); }
.bh-fn { font: 800 32px/1.15 var(--fb); color: #${C.ink}; } .bh-fr { font: 700 24px/1.2 var(--fb); letter-spacing: .08em; text-transform: uppercase; color: #${C.mute}; } .bh-fc { font: 400 27px/1.36 var(--fb); color: #${C.ink}; } .bh-fc em { color: #${C.amberD}; font-weight: 800; }
.bh-hl { font: 800 32px/1.2 var(--fb); color: #${C.ink}; } .bh-op { font: 800 80px/1 var(--fb); color: #${C.mute}; } .bh-hnote { font: 400 26px/1.3 var(--fb); color: #${C.mute}; }
.bh-ctp { font: 700 32px/1.2 var(--fb); color: #${C.ink2}; } .bh-ctp b { font: 800 64px/1 var(--fb); color: #${C.green}; margin-right: 8px; }
.bh-cte { font: 400 32px/1.35 var(--fb); color: #${C.ink}; } .bh-cte em { color: #${C.amberD}; font-weight: 800; }
.bh-cu { font: 700 26px/1.2 var(--fb); color: #${C.mute}; } .bh-cy { font: 700 26px/1 var(--fb); color: #${C.ink2}; } .bh-cv { font: 800 30px/1 var(--fb); }
.bh-bl { font: 800 24px/1 var(--fb); letter-spacing: .1em; color: #${C.red}; }
.bh-wn { font: 800 24px/1.25 var(--fb); color: #ffffff; } .bh-wt { font: 400 26px/1.3 var(--fb); color: #${C.ink2}; } .bh-wt b { font-weight: 800; color: #${C.ink}; }
.bh-iv { font: 800 104px/1 var(--fb); color: #${C.amberD}; } .bh-iu { font: 800 32px/1.2 var(--fb); color: #${C.ink}; } .bh-it { font: 400 27px/1.38 var(--fb); color: #${C.ink2}; }
.bh-pv { font: 800 110px/1 var(--fb); } .bh-pl { font: 700 30px/1.3 var(--fb); color: #${C.ink}; }
.bh-qy { font: 800 28px/1 var(--fb); } .bh-qv { font: 800 28px/1.2 var(--fb); } .bh-qn { font: 400 26px/1.3 var(--fb); color: #${C.ink2}; } .bh-qn b { font-weight: 800; color: #${C.ink}; }
.bh-hero { font: 800 250px/1 var(--fb); letter-spacing: -.02em; } .bh-heu { font: 800 40px/1.2 var(--fb); color: #${C.ink}; } .bh-rt { font: 700 30px/1.3 var(--fb); color: #${C.ink}; }
.bh-ctg { font: 700 26px/1.2 var(--fb); letter-spacing: .1em; text-transform: uppercase; color: #${C.mute}; } .bh-ctx { font: 800 34px/1.3 var(--fb); color: #${C.ink}; }
.bh-dmt { font: 800 52px/1.15 var(--fb); color: #${C.red}; } .bh-dms { font: 700 30px/1.2 var(--fb); color: #${C.red}; }
.bh-kt { font: 700 30px/1.3 var(--fb); color: #${C.ink}; } .bh-kr { font: 800 26px/1 var(--fb); color: #${C.red}; }
.bh-dv { font: 800 96px/1 var(--fb); color: #${C.green}; } .bh-dh { font: 800 32px/1.2 var(--fb); color: #${C.ink}; } .bh-dt { font: 400 27px/1.3 var(--fb); color: #${C.ink2}; }
.bh-hn { font: 800 38px/1.15 var(--fb); color: #${C.ink}; } .bh-hw { font: 700 27px/1.25 var(--fb); } .bh-hw i { font-style: normal; color: #${C.mute}; font-weight: 400; } .bh-hd { font: 400 28px/1.4 var(--fb); color: #${C.ink2}; } .bh-href { font: 700 24px/1 var(--fb); color: #${C.mute}; }
.bh-opl { font: 800 52px/1 var(--fb); color: #${C.green}; } .bh-opl2 { font: 800 60px/1 var(--fb); } .bh-opt { font: 800 38px/1.2 var(--fb); color: #${C.ink}; }
.bh-qd { font: 800 96px/1 var(--fb); } .bh-qx { font: 400 36px/1.45 var(--fb); color: #${C.ink}; } .bh-qx em { color: #${C.green}; font-weight: 800; }
.bh-nutt { font: 800 32px/1.25 var(--fb); color: #ffffff; }
.bh-an { font: 800 64px/1 var(--fb); color: #${C.green}; } .bh-aq { font: 600 28px/1.3 var(--fb); color: #${C.mute}; } .bh-aa { font: 800 32px/1.32 var(--fb); color: #${C.ink}; } .bh-aa em { color: #${C.green}; }
.bh-vd { font: 400 32px/1.3 var(--fb); color: #${C.ink}; } .bh-vd b { font-weight: 800; color: #${C.amberD}; }
.bh-gh { font: 800 104px/1.06 var(--fb); color: #${C.ink}; } .bh-gn { font: 800 110px/1 var(--fb); color: #${C.green}; } .bh-gt { font: 700 30px/1.3 var(--fb); color: #${C.ink}; }`;

module.exports = { TYPES, render, css };
