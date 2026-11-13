// TẦNG HÌNH ẢNH — BỘ HÌNH "BÀN HỘI NGHỊ QUỐC TẾ" cho đề tài Công pháp quốc tế (vẽ bằng SVG/CSS, không ảnh AI).
// Ẩn dụ: phòng hội nghị đa phương.
//   nền    xanh đêm + bản đồ thế giới bằng chấm (Natural Earth 1:110m, phạm vi công cộng; có Hoàng Sa, Trường Sa) + lưới kinh–vĩ tuyến
//   giấy   văn kiện điều ước: giấy ngà, viền kép nhũ vàng, dải lụa và dấu xi đỏ
//   vật    bảng tên phái đoàn trên bàn họp, micro cổ ngỗng, hàng cờ trừu tượng (KHÔNG phải cờ nước nào)
// Không vẽ biểu tượng Liên hợp quốc, quốc huy, cờ thật, chữ ký thật.
// Gắn nhãn như hinh/bang_chung.js: data-t (hộp chữ sửa được), data-l (lớp ảnh), data-m (tên Morph), data-pad (vùng chụp gồm bóng đổ).
//
//   qtbia     bìa: văn kiện điều ước + khối chữ ký (người trình bày · lớp · ngày) + dấu xi + hàng cờ
//   qtchuong  mở chương: trang văn kiện "Phần N" + dấu xi lớn mang số La Mã
//   qtban     3–4 chủ thể / bên / yếu tố: bảng tên phái đoàn trên bàn họp (items[]{name, who, desc}, focus)
//
// Mọi lớp CSS bắt đầu bằng "qt-" để không trùng stage.css / canh.js / bang_chung.js.
const fs = require("fs"), path = require("path");
const { wrap, plain, kit } = require("../stage/templates");
const { esc, f } = kit;

const TYPES = ["qtbia", "qtchuong", "qtban"];
const tx = (s) => f(s).replace(/\n/g, "<br>");
const LA_MA = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const n1 = (v) => Math.round(v * 10) / 10;
let SL = 0;   // chỉ số slide đang dựng — lớp trang trí đặt tên riêng từng slide để PowerPoint không ghép nhầm

// ───────────── vật dựng chung ─────────────
// văn kiện (giấy ngà viền kép); o.m = tên Morph; o.hau = tờ lót phía sau (bản sao)
const vk = (name, x, y, w, h, rot, inner, o = {}) =>
  `<div class="qt-vk ${o.cls || ""}" data-l="${name}" data-pad="${o.pad || 44}" ${o.m ? `data-m="${o.m}"` : ""} ${o.go ? `data-go="${esc(o.go)}"` : ""} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;rotate:${rot}deg">${inner}</div>`;

// hai đuôi dải lụa toả ra từ tâm dấu xi (vẽ trước dấu xi để nằm dưới)
const lua = (name, cx, cy, r, goc = [112, 68]) => {
  const L = r * 2.4, w = r * 0.6, B = L + r * 0.4;
  const duoi = (deg) => { const t = deg * Math.PI / 180, ux = Math.cos(t), uy = Math.sin(t), px = -uy, py = ux;
    const P = (k, m) => `${n1(B + ux * k + px * m)} ${n1(B + uy * k + py * m)}`;
    return `<path d="M${P(0, w / 2)}L${P(L, w / 2)}L${P(L - w * 0.55, 0)}L${P(L, -w / 2)}L${P(0, -w / 2)}Z" fill="url(#qtl${name})"/>`
      + `<path d="M${P(0, 0)}L${P(L - w * 0.62, 0)}" stroke="#8e1d18" stroke-width="${n1(w * 0.14)}"/>`
      + `<path d="M${P(0, w / 2 - 3)}L${P(L - 2, w / 2 - 3)}" stroke="#fff3c9" stroke-opacity=".55" stroke-width="2"/>`; };
  return `<svg class="qt-lua" data-l="${name}" data-pad="18" viewBox="0 0 ${n1(B * 2)} ${n1(B * 2)}" style="left:${n1(cx - B)}px;top:${n1(cy - B)}px;width:${n1(B * 2)}px;height:${n1(B * 2)}px"><defs><linearGradient id="qtl${name}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1d58a"/><stop offset=".5" stop-color="#c9a24a"/><stop offset="1" stop-color="#8a6a24"/></linearGradient></defs>${goc.map(duoi).join("")}</svg>`;
};

// dấu xi: mép sáp gợn, vòng nổi, vòng hạt; giữa là ngôi sao nổi hoặc chữ (o.chu → hộp chữ sửa được)
const xi = (name, cx, cy, r, o = {}) => {
  const S = r + 16, N = 72; let d = "";
  for (let i = 0; i < N; i++) { const a = i / N * 2 * Math.PI, rr = r * (1 + 0.045 * Math.sin(a * 7 + 1.3) + 0.022 * Math.sin(a * 13 + 0.4));
    d += `${i ? "L" : "M"}${n1(S + rr * Math.cos(a))} ${n1(S + rr * Math.sin(a))}`; }
  let hat = ""; for (let i = 0; i < 20; i++) { const a = i / 20 * 2 * Math.PI; hat += `<circle cx="${n1(S + r * 0.84 * Math.cos(a))}" cy="${n1(S + r * 0.84 * Math.sin(a))}" r="${n1(r * 0.035)}" fill="#6e0f0b" opacity=".55"/>`; }
  let sao = ""; if (!o.chu) { let p = ""; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.17 : r * 0.42; p += `${i ? "L" : "M"}${n1(S + rr * Math.cos(a))} ${n1(S + rr * Math.sin(a))}`; }
    sao = `<path d="${p}Z" fill="#7a120d" opacity=".55" transform="translate(2 3)"/><path d="${p}Z" fill="#d64a3c" opacity=".9"/>`; }
  const vong = `<circle cx="${S}" cy="${S}" r="${n1(r * 0.68)}" fill="none" stroke="#6e0f0b" stroke-width="${n1(r * 0.06)}" opacity=".6"/><circle cx="${S - 2}" cy="${S - 2}" r="${n1(r * 0.68)}" fill="none" stroke="#ff9d88" stroke-width="${n1(Math.max(2, r * 0.022))}" opacity=".5"/>`;
  return `<div class="qt-xi" data-l="${name}" data-pad="26" ${o.m ? `data-m="${o.m}"` : ""} style="left:${n1(cx - S)}px;top:${n1(cy - S)}px;width:${2 * S}px;height:${2 * S}px"><svg viewBox="0 0 ${2 * S} ${2 * S}"><defs><radialGradient id="qtx${name}" cx="36%" cy="30%" r="78%"><stop offset="0" stop-color="#e5493c"/><stop offset=".55" stop-color="#a81f18"/><stop offset="1" stop-color="#5a0c08"/></radialGradient></defs><path d="${d}Z" fill="url(#qtx${name})"/>${vong}${hat}${sao}</svg>${o.chu ? `<div class="qt-xn" data-t style="font-size:${Math.round(r * (String(o.chu).length > 2 ? 0.62 : 0.9))}px">${esc(o.chu)}</div>` : ""}</div>`;
};

// hàng cờ trừu tượng (màu và hình học tự đặt, không trùng cờ quốc gia nào), cờ bay nhẹ
const COLORS = [["#c9a24a", "#13233d"], ["#2e7d6b", "#f2ead6"], ["#f2ead6", "#b3261e"], ["#4a78b8", "#f2ead6"], ["#e8d8a8", "#7a4a8c"], ["#7a4a8c", "#f2ead6"]];
const hangCo = (name, x0, y0, n = 5, gap = 112, cao = 720, o = {}) => {
  const W = gap * (n - 1) + (o.fw || 124) + 50, H = cao + 40; let g = "";
  for (let i = 0; i < n; i++) { const x = 20 + i * gap, top = 20 + (i % 2) * 34, [a, b] = COLORS[(i + (o.k || 0)) % COLORS.length], fw = o.fw || 124, fh = o.fh || 82, sw = 10 + (i % 3) * 4;
    const co = `M${x} ${top}C${x + fw * 0.35} ${top - sw},${x + fw * 0.65} ${top + sw},${x + fw} ${top}L${x + fw} ${top + fh}C${x + fw * 0.65} ${top + fh + sw},${x + fw * 0.35} ${top + fh - sw},${x} ${top + fh}Z`;
    const kk = (i + (o.k || 0)) % 3, kieu = kk === 0 ? `<path d="M${x} ${top}L${x + fw} ${top + fh}L${x} ${top + fh}Z" fill="${b}" opacity=".95"/>`
      : kk === 1 ? `<path d="M${x} ${top}L${x + fw * 0.42} ${top + fh / 2}L${x} ${top + fh}Z" fill="${b}"/>`
        : `<rect x="${x}" y="${top - 20}" width="${fw * 0.4}" height="${fh * 0.55 + 20}" fill="${b}"/>`;
    g += `<rect x="${x - 7}" y="${top - 18}" width="7" height="${cao - top + 10}" rx="3" fill="url(#qtcot${name})"/><circle cx="${x - 3.5}" cy="${top - 20}" r="7" fill="#e6c877"/>`
      + `<g><clipPath id="qtc${name}${i}"><path d="${co}"/></clipPath><path d="${co}" fill="${a}"/><g clip-path="url(#qtc${name}${i})">${kieu}<path d="M${x} ${top + fh * 0.5}C${x + fw * 0.35} ${top + fh * 0.5 - sw},${x + fw * 0.65} ${top + fh * 0.5 + sw},${x + fw} ${top + fh * 0.5}L${x + fw} ${top + fh + 20}L${x} ${top + fh + 20}Z" fill="#000" opacity=".12"/></g></g>`; }
  return `<svg class="qt-co" data-l="${name}" data-pad="20" viewBox="0 0 ${W} ${H}" style="left:${x0}px;top:${y0}px;width:${W}px;height:${H}px"><defs><linearGradient id="qtcot${name}" x1="0" x2="1"><stop offset="0" stop-color="#d9dde4"/><stop offset=".5" stop-color="#9aa3b1"/><stop offset="1" stop-color="#5f6877"/></linearGradient></defs>${g}</svg>`;
};

// tờ tiêu đề của slide nội dung: dải văn kiện + dấu xi ở đầu phải
const tieuDe = (s) => { const len = Math.max(8, plain(s.title || "").length), fs = Math.max(46, Math.min(72, Math.floor(1440 / (0.41 * len))));
  return lua(`s${SL}-tieu-lua`, 1690, 196, 50, [100, 64]) + vk("qt-tieu", 110, 104, 1580, 172, -0.4,
    `<div class="qt-lb" data-t style="left:58px;top:26px;width:1300px">${esc(s.kicker || "")}</div><div class="qt-t2" data-t style="left:58px;top:66px;width:1400px;font-size:${fs}px;white-space:nowrap">${tx(s.title || "")}</div>`, { m: "tieu" })
    + xi(`s${SL}-tieu-xi`, 1690, 196, 50); };

const S1 = {};

// ───────────── bìa ─────────────
S1.qtbia = (s) => {
  const len = plain(s.title || "").length, fs = len > 56 ? 76 : len > 40 ? 90 : 110;
  const ky = [["Người trình bày", s.author], ["Lớp", s.authorSub], ["Ngày", s.date]].map(([lb, v], k) => {
    const x = 70 + k * 330; return `<div class="qt-tx" data-t style="left:${x}px;top:656px;width:310px;font-size:28px;font-weight:700;white-space:nowrap">${esc(v || "")}</div><div class="qt-ky" style="left:${x}px;top:700px;width:290px"></div><div class="qt-lb" data-t style="left:${x}px;top:716px;width:300px;font-size:20px;color:#6a5733">${esc(lb)}</div>`; }).join("");
  const giay = vk("qt-bia", 110, 132, 1100, 830, -1, `
    <div class="qt-lb" data-t style="left:70px;top:66px;width:960px">${esc(s.kicker || "")}</div><div class="qt-rule" style="left:70px;top:110px;width:960px"></div>
    <div class="qt-t1" data-t style="left:70px;top:146px;width:960px;font-size:${fs}px">${tx(s.title || "")}</div>
    ${s.subtitle ? `<div class="qt-tx" data-t style="left:70px;top:${146 + Math.ceil(len / (960 / (0.44 * fs))) * fs * 1.04 + 34}px;width:900px;font-size:31px;color:#46536b">${tx(s.subtitle)}</div>` : ""}
    <div class="qt-lb" data-t style="left:70px;top:598px;width:600px;font-size:20px;color:#6a5733">Các bên ký tên</div>${ky}`, { m: "tieu" });
  return { cls: "dark qt", bare: true, html: `<div class="cv" data-tay>
    ${hangCo("qt-hangco", 1310, 150, 5, 112, 860)}
    ${vk("qt-bia-lot", 136, 152, 1100, 830, 1.6, "", { pad: 40, cls: "qt-lot" })}${giay}
    ${lua("qt-bia-lua", 1120, 880, 84, [104, 62])}${xi("qt-bia-xi", 1120, 880, 84)}</div>` };
};

// ───────────── mở chương ─────────────
S1.qtchuong = (s) => {
  const so = s.num ?? 1, chu = LA_MA[so] || String(so), word = s.partWord || "Phần";
  const dong = Math.max(1, Math.ceil(plain(s.title || "").length / 22)), subTop = 140 + Math.round(dong * 106) + 40, H = subTop + (s.sub ? 150 : 40), Y = Math.round(540 - H / 2);
  const giay = vk("qt-chuong", 110, Y, 1140, H, -0.8, `
    <div class="qt-lb" data-t style="left:66px;top:62px;width:1000px">${esc(`${word} ${chu} · ${s.part || ""}`)}</div><div class="qt-rule" style="left:66px;top:104px;width:1000px"></div>
    <div class="qt-t1" data-t style="left:66px;top:140px;width:1000px;font-size:100px;line-height:1.06">${tx(s.title || "")}</div>
    ${s.sub ? `<div class="qt-tx" data-t style="left:66px;top:${subTop}px;width:960px;font-size:33px;color:#46536b">${tx(s.sub)}</div>` : ""}`, { m: "tieu" });
  return { cls: "dark qt", html: `<div class="cv" data-tay>${giay}
    ${lua(`s${SL}-chuong-lua`, 1540, 520, 200, [108, 70])}${xi("qt-chuong-xi", 1540, 520, 200, { chu, m: "chuong" })}</div>` };
};

// ───────────── bàn họp: bảng tên phái đoàn ─────────────
S1.qtban = (s) => {
  const it = (s.items || []).slice(0, 4), n = it.length || 1, w = n === 4 ? 392 : 470, gap = n === 4 ? 30 : 60, x0 = Math.round((1920 - (n * w + (n - 1) * gap)) / 2), top = 640, h = 262;
  let ban = `<path d="M70 742L1850 742L1990 1004L-70 1004Z" fill="url(#qtban${SL})"/><path d="M70 742L1850 742" stroke="#7fa6d6" stroke-opacity=".5" stroke-width="3"/><path d="M-70 1004L1990 1004L1990 1090L-70 1090Z" fill="#0a1c34"/><path d="M-70 1006L1990 1006" stroke="#c9a24a" stroke-width="4"/>`;
  it.forEach((_, i) => { const x = x0 + i * (w + gap), mx = x + w - 70;   // ghế phía sau + micro cổ ngỗng
    ban += `<ellipse cx="${mx}" cy="762" rx="30" ry="9" fill="#1b1f27"/><path d="M${mx} 760C${mx} 700,${mx - 10} 640,${mx - 60} 600" stroke="#2b3240" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="${mx - 96}" y="584" width="44" height="22" rx="11" fill="#1b1f27" transform="rotate(-24 ${mx - 74} 595)"/><circle cx="${mx - 92}" cy="604" r="4" fill="#e5493c"/>`; });
  const co = it.map((_, i) => hangCo(`s${SL}-co${i + 1}`, x0 + i * (w + gap) + 26, 470, 1, 0, 300, { fw: 96, fh: 62, k: i + 1 })).join("");
  const banSvg = `<svg class="qt-ban" data-l="s${SL}-ban" data-pad="0" viewBox="0 0 1920 1080" style="left:0;top:0;width:1920px;height:1080px"><defs><linearGradient id="qtban${SL}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#24527f"/><stop offset="1" stop-color="#143559"/></linearGradient></defs>${ban}</svg>`;
  const plates = it.map((x, i) => `<div class="qt-np ${i === (s.focus ?? 0) ? "on" : ""}" data-l="qt-np${i + 1}" data-pad="46" style="left:${x0 + i * (w + gap)}px;top:${top}px;width:${w}px;height:${h}px">
      <div class="qt-lb" data-t style="left:28px;top:30px;width:${w - 56}px;font-size:18px;letter-spacing:.07em;white-space:nowrap;color:#b3261e">${esc(x.who || "")}</div>
      <div class="qt-t1" data-t style="left:28px;top:62px;width:${w - 56}px;font-size:46px;white-space:nowrap">${esc(x.name || x.head || "")}</div>
      <div class="qt-tx" data-t style="left:28px;top:124px;width:${w - 56}px;font-size:25px;line-height:1.32">${tx(x.desc || x.text || "")}</div></div>`).join("");
  return { cls: "dark qt", html: `<div class="cv" data-tay>${co}${banSvg}${tieuDe(s)}${plates}${s.note ? `<div class="qt-cap" data-t style="left:110px;top:1024px;width:1700px;font-size:24px">${tx(s.note)}</div>` : ""}</div>` };
};

function render(s, deck, ctx, { i, n }) {
  SL = i; kit.reset();
  const o = S1[s.type](s, deck, ctx);
  return [{ id: s.id || `s${i + 1}`, html: wrap(o, s, deck, i, n), tu: true, dur: s.dur || 900 }];
}

// ───────────── nền: bản đồ chấm + lưới kinh–vĩ tuyến ─────────────
const MAP = JSON.parse(fs.readFileSync(path.join(__dirname, "the_gioi_cham.json"), "utf8"));
const b64 = (svg) => `url("data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}")`;
const cham = b64(`<svg xmlns="http://www.w3.org/2000/svg" width="${MAP.w}" height="${MAP.h}" viewBox="0 0 ${MAP.w} ${MAP.h}"><path d="${MAP.d}" stroke="#9cc3f0" stroke-opacity=".3" stroke-width="5.4" stroke-linecap="round" fill="none"/></svg>`);
const luoi = (() => { const y0 = 250, yl = (lat) => n1(y0 + (84 - lat) / 142 * MAP.h); let g = "";
  for (let lon = -150; lon <= 150; lon += 30) { const x = n1((lon + 180) / 360 * 1920); g += `<path d="M${x} 0V1080" stroke-dasharray="3 12"/>`; }
  for (const lat of [60, 30, -30]) g += `<path d="M0 ${yl(lat)}H1920" stroke-dasharray="3 12"/>`;
  g += `<path d="M0 ${yl(0)}H1920" stroke-opacity=".2"/>`;
  return b64(`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" fill="none" stroke="#a6c6ee" stroke-opacity=".11" stroke-width="2">${g}</svg>`); })();

const css = `
/* ── bàn hội nghị quốc tế (Công pháp quốc tế) ── */
.s.qt { background-color: #0b2140; background-image: radial-gradient(1300px 760px at 40% 36%, rgba(64,118,186,.36), transparent 70%), radial-gradient(2300px 1300px at 50% 50%, transparent 52%, rgba(2,8,22,.72) 100%), ${cham}, ${luoi}; background-repeat: no-repeat; background-position: 0 0, 0 0, 0 250px, 0 0; background-size: auto, auto, ${MAP.w}px ${MAP.h}px, 1920px 1080px; color: #eef2f8; --fg: #eef2f8; --mut: #c7d3e6; --hl: #e9c46a; }
.s.qt::after { opacity: .08; }
.s.qt .bar span, .s.qt .bar .cnt { color: #eef2f8; text-shadow: 0 2px 6px rgba(0,0,0,.5); }
.s.qt .prog { background: #c9a24a; }
.qt-vk { position: absolute; background: linear-gradient(170deg, #fbf7ec 0%, #f4ecd9 60%, #efe4cb 100%); color: #13233d; --fg: #13233d; --hl: #b3261e; --mut: #46536b;
  box-shadow: inset 0 0 0 16px transparent, inset 0 0 0 18px #c9a24a, inset 0 0 0 23px transparent, inset 0 0 0 24px rgba(201,162,74,.7), 3px 4px 0 rgba(10,20,40,.18), 18px 26px 34px rgba(2,8,22,.55); }
.qt-vk > * { position: absolute; }
.qt-vk.qt-lot { background: #e9dec4; }
.qt-lua, .qt-co, .qt-ban { position: absolute; overflow: visible; }
.qt-lua { filter: drop-shadow(6px 9px 7px rgba(2,8,22,.45)); }
.qt-xi { position: absolute; filter: drop-shadow(8px 12px 10px rgba(2,8,22,.5)); } .qt-xi > svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.qt-xn { position: absolute; left: 0; right: 0; top: 50%; transform: translateY(-50%); text-align: center; font: 400 160px/1 var(--fd); color: #f6d4c2; text-shadow: -2px -2px 0 rgba(255,190,170,.35), 3px 4px 0 rgba(70,8,5,.6); }
.qt-co { filter: drop-shadow(6px 10px 8px rgba(2,8,22,.45)); }
.qt-np { position: absolute; background: linear-gradient(180deg, #fbf8ef, #efe6cf); color: #13233d; box-shadow: inset 0 0 0 2px rgba(201,162,74,.55), 0 4px 0 #cdbf9f, 0 24px 26px rgba(2,8,22,.55); }
.qt-np::before { content: ""; position: absolute; left: 0; right: 0; top: -26px; height: 26px; background: linear-gradient(180deg, #d9cfb4, #f3ecda); clip-path: polygon(3% 0, 97% 0, 100% 100%, 0 100%); }
.qt-np.on { box-shadow: inset 0 12px 0 #c9a24a, inset 0 0 0 2px rgba(201,162,74,.8), 0 4px 0 #cdbf9f, 0 24px 26px rgba(2,8,22,.55); }
.qt-np > * { position: absolute; }
.qt-t1 { position: absolute; font: 400 100px/1.04 var(--fd); text-transform: uppercase; color: #13233d; } .qt-t1 em { color: #b3261e; }
.qt-t2 { position: absolute; font: 400 72px/1.08 var(--fd); color: #13233d; } .qt-t2 em { color: #b3261e; }
.qt-tx { position: absolute; font: 500 32px/1.38 var(--fb); color: #13233d; } .qt-tx em { color: #b3261e; font-weight: 800; }
.qt-lb { position: absolute; font: 800 26px/1 var(--fb); letter-spacing: .14em; text-transform: uppercase; color: #84621c; }   /* vàng đồng đậm hơn một bậc: nhãn 20 px ở bìa đạt 4,5 : 1 */
.qt-rule { position: absolute; height: 3px; background: linear-gradient(90deg, #c9a24a 0 75%, transparent); }
.qt-ky { position: absolute; height: 0; border-top: 2px solid #6b5a3a; }
.qt-cap { position: absolute; font: 700 30px/1.3 var(--fb); color: #eef2f8; text-shadow: 0 2px 8px rgba(0,0,0,.6); }
`;

// type thường tương đương (Bước 0 so với kế hoạch prep.json)
const TUONG_DUONG = { qtbia: ["cover"], qtchuong: ["section"], qtban: ["cards"] };
module.exports = { TYPES, render, css, TUONG_DUONG };
