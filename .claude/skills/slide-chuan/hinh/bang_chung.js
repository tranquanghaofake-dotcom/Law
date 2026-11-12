// TẦNG HÌNH ẢNH — BỘ HÌNH "BẢNG BẰNG CHỨNG" cho đề tài hình sự (vẽ bằng SVG/CSS, không dùng hình dán có sẵn).
// Ẩn dụ: bảng bần của kíp điều tra — tờ giấy ghim đinh, dây đỏ nối các điều luật, thẻ tang vật, con dấu, vân tay mờ ở nền.
// Gắn nhãn tay như hinh/canh.js: data-t (hộp chữ sửa được), data-l (lớp ảnh), data-a (hiệu ứng), data-pad (vùng chụp cả đinh và bóng đổ).
//
//   bcbia     bìa: tờ tiêu đề chính + ba tờ nhỏ (các điều luật) nối dây đỏ + thẻ người trình bày
//   bcso      so sánh hai điều / hai quy định: hai tờ giấy, dây đỏ giữa hai đinh, thẻ "ranh giới" treo giữa dây
//   bcchuong  chuyển chương: nhãn băng dính, tờ câu hỏi, thẻ tang vật mang số chương
//
// Mọi tên lớp CSS bắt đầu bằng "bc-" để không trùng stage.css / canh.js.
const { wrap, plain, kit } = require("../stage/templates");
const { esc, f } = kit;

const TYPES = ["bcbia", "bcso", "bcchuong"];
const tx = (s) => f(s).replace(/\n/g, "<br>");
const pad2 = (n) => String(n).padStart(2, "0");
const A = (a, at) => `data-a="${a}" data-at="${at}"`;

// tờ giấy ghim: trả về html và toạ độ đinh (cx, cy) để kéo dây
const giay = (name, x, y, w, h, rot, inner, o = {}) => ({
  cx: x + w / 2 + (o.dx || 0), cy: y + 10,
  html: `<div class="bc-pp ${o.cls || ""}" data-l="${name}" data-pad="${o.pad || 48}" ${A(o.a || "drop", o.at || 300)} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;rotate:${rot}deg">${o.pin === false ? "" : `<i class="bc-pin" style="left:calc(50% + ${o.dx || 0}px)"></i>`}${inner}</div>`,
});
// dây đỏ giữa hai đinh (đường cong võng xuống), có bóng đổ
const day = (name, p, q, sag, at) => {
  const L = Math.min(p.cx, q.cx) - 30, T = Math.min(p.cy, q.cy) - 30, W = Math.abs(q.cx - p.cx) + 60, H = Math.abs(q.cy - p.cy) + sag + 70;
  const d = `M${p.cx - L} ${p.cy - T} C${p.cx - L} ${p.cy - T + sag}, ${q.cx - L} ${q.cy - T + sag}, ${q.cx - L} ${q.cy - T}`;
  return `<svg class="bc-rope" data-l="${name}" data-pad="4" ${A("wipe", at)} style="left:${L}px;top:${T}px;width:${W}px;height:${H}px" viewBox="0 0 ${W} ${H}"><path d="${d}" transform="translate(7 12)" stroke="rgba(14,6,0,.4)" stroke-width="8" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#c8261e" stroke-width="8" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#ff7a6a" stroke-width="2" fill="none" stroke-linecap="round" opacity=".55" transform="translate(-1 -2)"/></svg>`;
};
// vân tay mờ (các vòng ê-líp đứt đoạn)
const vanTay = (name, x, y, w) => { let g = ""; for (let i = 1; i <= 24; i++) { const r = i * 12.5; g += `<ellipse cx="200" cy="235" rx="${(r * 0.8).toFixed(1)}" ry="${r}" stroke-dasharray="${38 + i * 6} ${8 + (i % 5) * 4} ${70 - i * 2} 11" stroke-dashoffset="${i * 23}"/>`; }
  return `<svg class="bc-fp" data-l="${name}" data-pad="4" viewBox="0 0 400 480" style="left:${x}px;top:${y}px;width:${w}px;height:${Math.round(w * 1.2)}px">${g}</svg>`; };
// thẻ tang vật (giấy manila có lỗ xỏ dây)
const the = (name, x, y, w, h, rot, inner, at = 500) => `<div class="bc-tag" data-l="${name}" data-pad="40" ${A("drop", at)} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;rotate:${rot}deg"><i class="bc-hole"></i>${inner}</div>`;
const nhan = (name, x, y, rot, text, at = 100) => `<div class="bc-lab" data-l="${name}" data-pad="14" ${A("rise", at)} style="left:${x}px;top:${y}px;rotate:${rot}deg"><span data-t>${esc(text)}</span></div>`;

const S1 = {};

S1.bcbia = (s) => {
  const main = giay("bc1-chinh", 110, 170, 1020, 640, -1.6,
    `<div class="bc-lb" data-t style="left:60px;top:54px">${esc(s.kicker || "")}</div>
     <div class="bc-t1" data-t style="left:60px;top:112px;width:900px;font-size:158px">${tx(s.title || "")}</div>
     ${s.subtitle ? `<div class="bc-tx" data-t style="left:60px;top:430px;width:700px;font-size:35px">${tx(s.subtitle)}</div>` : ""}
     <div class="bc-stp" style="right:44px;bottom:48px;rotate:7deg"><span data-t>${esc(s.stamp || "Phân biệt")}</span></div>`, { dx: 380, at: 250 });
  const C = (s.cites || []).slice(0, 3), pos = [[1290, 140, 3], [1380, 420, -3], [1240, 712, 2]], ps = [];
  const papers = C.map((c, i) => { const [x, y, r] = pos[i], p = giay(`bc1-d${i + 1}`, x, y, 440, 236, r,
    `<div class="bc-lb" data-t style="left:36px;top:38px;font-size:26px">ĐIỀU</div><div class="bc-t1" data-t style="left:36px;top:68px;font-size:118px">${esc(c.n)}</div><div class="bc-tx" data-t style="left:230px;top:104px;width:190px;font-size:31px;font-weight:700">${tx(c.t)}</div>`, { at: 700 + i * 220 }); ps.push(p); return p.html; });
  const ropes = ps.map((p, i) => day(`bc1-day${i + 1}`, main, p, [70, 110, 130][i], 1000 + i * 200));
  return { cls: "dark bc", bare: true, html: `<div class="cv" data-tay>${vanTay("bc1-vt", 1390, 560, 470)}${ropes.join("")}${main.html}${papers.join("")}
    ${the("bc1-the", 120, 850, 560, 190, -2.5, `<div class="bc-t1" data-t style="left:70px;top:80px;font-size:50px;color:#2a1c0a">${esc(s.author || "")}</div><div class="bc-tx" data-t style="left:70px;top:138px;font-size:27px;color:#4a3519">${esc([s.authorSub, s.date].filter(Boolean).join(" · "))}</div>`, 1500)}</div>` };
};

S1.bcso = (s) => {
  const side = (d) => `<div class="bc-t1" data-t style="left:54px;top:46px;width:660px;font-size:48px;white-space:nowrap">${tx(d.tag || d.title || "")}</div>
    <div class="bc-tx" data-t style="left:54px;top:118px;width:650px;font-size:30px;color:#5a4d36;font-weight:600">${tx(d.sub || "")}</div>
    ${(d.items || []).slice(0, 4).map((x, k) => `<div class="bc-it" style="left:54px;top:${214 + k * 118}px;width:650px"><b class="bc-no" data-t>${k + 1}</b><span class="bc-tx" data-t style="font-size:35px">${tx(typeof x === "string" ? x : x.text || x.head)}</span></div>`).join("")}`;
  const L = giay("bc2-trai", 110, 330, 760, 590, -1.1, side(s.left || {}), { dx: 300, at: 350 });
  const R = giay("bc2-phai", 1050, 312, 760, 610, 1, side(s.right || {}), { dx: -300, at: 600, cls: s.focus === "left" ? "" : "bc-on" });
  const m = s.mid || {};
  return { cls: "dark bc", html: `<div class="cv" data-tay>${giay("bc2-tieu", 110, 104, 1560, 170, -0.5, `<div class="bc-lb" data-t style="left:56px;top:22px">${esc(s.kicker || "So sánh")}</div><div class="bc-t2" data-t style="left:56px;top:62px;width:1460px;white-space:nowrap">${tx(s.title || "")}</div>`, { dx: 690, at: 100, a: "rise" }).html}
    ${day("bc2-day", L, R, 190, 1000)}${L.html}${R.html}
    ${the("bc2-the", 830, 500, 260, 220, -4, `<div class="bc-t1" data-t style="left:20px;top:70px;font-size:42px;color:#2a1c0a;width:220px;text-align:center">${esc(m.head || "Ranh giới")}</div><div class="bc-tx" data-t style="left:24px;top:128px;width:212px;font-size:23px;line-height:1.28;color:#4a3519;text-align:center">${tx(m.text || "")}</div>`, 1400)}</div>` };
};

S1.bcchuong = (s) => {
  const num = pad2(s.num ?? 1);
  const main = giay("bc3-chinh", 110, 230, 1070, 600, -1.1,
    `<div class="bc-t1" data-t style="left:62px;top:60px;width:950px;font-size:112px;line-height:1.1">${tx(s.title || "")}</div>
     ${s.sub ? `<div class="bc-tx" data-t style="left:62px;top:480px;width:900px;font-size:34px;color:#5a4d36;font-weight:600">${tx(s.sub)}</div>` : ""}`, { dx: 400, at: 250 });
  const tagC = { cx: 1530, cy: 190 };
  return { cls: "dark bc", html: `<div class="cv" data-tay>${vanTay("bc3-vt", 60, 520, 520)}
    ${day("bc3-day", main, tagC, 100, 900)}${main.html}
    ${the("bc3-the", 1290, 170, 470, 650, 4.5, `<div class="bc-lb" data-t style="left:0;top:96px;width:470px;text-align:center;font-size:34px">${esc(s.partWord || "Chương")}</div><div class="bc-t1" data-t style="left:0;top:150px;width:470px;text-align:center;font-size:370px;line-height:1;color:#2a1c0a">${num}</div><div class="bc-tx" data-t style="left:30px;top:548px;width:410px;text-align:center;font-size:30px;font-weight:700;color:#4a3519">${esc(s.part || "")}</div>`, 600)}
    ${nhan("bc3-nhan", 110, 130, -2, `${s.partWord || "Chương"} ${s.num ?? 1}`, 100)}</div>` };
};

function render(s, deck, ctx, { i, n }) {
  kit.reset();
  const o = S1[s.type](s, deck, ctx);
  return [{ id: s.id || `s${i + 1}`, html: wrap(o, s, deck, i, n), tu: true }];
}

const cork = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='640'><filter id='a' x='0' y='0' width='100%25' height='100%25'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 .11 0 0 0 0 .05 0 0 0 0 .02 0 0 0 1.9 -.78'/></filter><filter id='b' x='0' y='0' width='100%25' height='100%25'><feTurbulence type='fractalNoise' baseFrequency='.55' numOctaves='2' seed='11'/><feColorMatrix values='0 0 0 0 .97 0 0 0 0 .8 0 0 0 0 .55 0 0 0 1.7 -.82'/></filter><rect width='640' height='640' filter='url(%23a)'/><rect width='640' height='640' filter='url(%23b)' opacity='.8'/></svg>\")";

const css = `
/* ── bảng bằng chứng (hình sự) ── */
.s.bc { background-color: #79502f; background-image: radial-gradient(1500px 900px at 45% 38%, rgba(255,222,170,.28), transparent 68%), radial-gradient(2000px 1300px at 50% 50%, transparent 50%, rgba(18,8,2,.62) 100%), ${cork}; color: #f4ecd8; --fg: #f4ecd8; --mut: #ead9ba; --hl: #ffd27a; }
.s.bc::before { display: none; } .s.bc::after { opacity: .1; }
.s.bc .bar span, .s.bc .bar .cnt { color: #f4ecd8; text-shadow: 0 2px 6px rgba(0,0,0,.5); }
.s.bc .prog { background: #c8261e; }
.bc-hd { position: absolute; inset: 0; z-index: 3; } .bc-hd > * { position: absolute; }
.bc-pp { position: absolute; background: #f6eedb; color: #1b1713; --fg: #1b1713; --hl: #c8261e; --mut: #5a4d36; box-shadow: inset 0 1px 0 rgba(255,255,255,.7), 3px 4px 0 rgba(60,40,20,.14), 15px 22px 28px rgba(14,6,0,.5); }
.bc-pp::before { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.07), transparent 10%, transparent 90%, rgba(0,0,0,.06)); pointer-events: none; }
.bc-pp > * { position: absolute; }
.bc-pp.bc-on { background: #fbf4e2; box-shadow: inset 0 14px 0 #c8261e, 3px 4px 0 rgba(60,40,20,.14), 15px 22px 28px rgba(14,6,0,.55); }
.bc-pin { position: absolute; top: -13px; width: 46px; height: 46px; margin-left: -23px; border-radius: 50%; background: radial-gradient(circle at 34% 30%, #ffc9bf 0 8%, #e3382c 34%, #9d170f 76%, #5d0c07 100%); box-shadow: 7px 11px 9px rgba(10,4,0,.5), inset -3px -4px 6px rgba(0,0,0,.28); z-index: 6; }
.bc-rope, .bc-fp { position: absolute; overflow: visible; }
.bc-fp { fill: none; stroke: #2a170b; stroke-opacity: .17; stroke-width: 6; stroke-linecap: round; }
.bc-t1 { position: absolute; font: 400 100px/1.02 var(--fd); text-transform: uppercase; color: #1b1713; letter-spacing: .005em; } .bc-t1 em { color: #c8261e; }
.bc-t2 { position: absolute; font: 400 72px/1.08 var(--fd); color: #1b1713; } .bc-t2 em { color: #c8261e; }
.bc-tx { position: absolute; font: 500 34px/1.38 var(--fb); color: #1b1713; } .bc-tx em { color: #c8261e; font-weight: 800; }
.bc-lb { position: absolute; font: 800 28px/1 var(--fb); letter-spacing: .12em; text-transform: uppercase; color: #c8261e; }
.bc-lab { position: absolute; background: #c8261e; color: #fff; font: 400 56px/1 var(--fd); text-transform: uppercase; padding: 14px 34px; letter-spacing: .02em; clip-path: polygon(0 0, 100% 0, 98.5% 25%, 100% 50%, 98.5% 75%, 100% 100%, 0 100%, 1.5% 75%, 0 50%, 1.5% 25%); }
.bc-tag { position: absolute; background: #e8cf86; color: #2a1c0a; border-radius: 18px; box-shadow: inset 0 0 0 3px rgba(120,80,20,.25), 13px 19px 26px rgba(14,6,0,.5); } .bc-tag > * { position: absolute; }
.bc-hole { left: 50%; top: 22px; width: 36px; height: 36px; margin-left: -18px; border-radius: 50%; background: #5b3a1d; box-shadow: 0 0 0 11px #f4ecd8, 0 0 0 13px rgba(120,80,20,.35), inset 3px 4px 5px rgba(0,0,0,.6); }
.bc-stp { position: absolute; border: 7px double #b3241c; color: #b3241c; padding: 8px 26px; border-radius: 6px; font: 400 54px/1 var(--fd); text-transform: uppercase; letter-spacing: .05em; opacity: .9; }
.bc-it .bc-tx { position: static; }
.bc-it { position: absolute; display: flex; gap: 22px; align-items: flex-start; }
.bc-no { flex: none; width: 46px; height: 46px; background: #c8261e; color: #fff; font: 400 30px/46px var(--fd); text-align: center; margin-top: 4px; }
`;

module.exports = { TYPES, render, css };
