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

const TYPES = ["bcbia", "bcso", "bcchuong", "bccauhoi", "bctrich", "bcbang", "bcnhanh", "bctinhhuong", "bcdoiung", "bccot", "bcsolieu", "bcdieukien", "bcnhanqua", "bchoi", "bcchot", "bccamon", "bcthang", "bcsan"];
const tx = (s) => f(s).replace(/\n/g, "<br>");
const pad2 = (n) => String(n).padStart(2, "0");
const A = (a, at) => (MODE === "C" ? "" : `data-a="${a}" data-at="${at}"`);   // chế độ C: không hiệu ứng vào nào

// tờ giấy ghim: trả về html và toạ độ đinh (cx, cy) để kéo dây
// MODE: "C" = GỌN (mặc định): không hiệu ứng vào, chỉ vài cặp Morph có nghĩa (tờ tiêu đề, thẻ chương, thẻ "ranh giới", thẻ đáp án), 900 ms.
//       "B" = thêm "nhân vật xuyên suốt" (ba tờ ở bìa → thẻ câu hỏi) + toàn bộ hiệu ứng vào. "A" = hiệu ứng vào phong phú, không Morph. (B, A bị chê rối / tệ — giữ để so sánh.)
let MODE = "C";
const pairM = (m) => (m && MODE !== "A" ? `data-m="${m}"` : "");
const khongVao = (o) => o.na || (o.a === false && MODE !== "A");   // đích Morph không có hiệu ứng vào
// tờ giấy ghim. Đinh là LỚP RIÊNG (nện xuống sau khi giấy rơi), đặt đúng chỗ kể cả khi giấy nghiêng; cx, cy = toạ độ đinh để kéo dây.
const giay = (name, x, y, w, h, rot, inner, o = {}) => {
  const th = rot * Math.PI / 180, dx = o.dx || 0, dy = 10 - h / 2, px = x + w / 2 + dx * Math.cos(th) - dy * Math.sin(th), py = y + h / 2 + dx * Math.sin(th) + dy * Math.cos(th);
  const at = o.at || 300, no = khongVao(o), kind = o.a === false ? (o.kA || "drop") : (o.a || "drop");
  const paper = `<div class="bc-pp ${o.cls || ""}" data-l="${name}" data-pad="${o.pad || 48}" ${no ? "" : A(kind, at)} ${o.em && MODE !== "C" ? `data-em="${o.em}"` : ""} ${pairM(o.m)} ${o.m === "tieu" || o.m === "ca-expl" ? 'data-mt="0"' : ""} ${o.go ? `data-go="${esc(o.go)}"` : ""} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;rotate:${rot}deg">${inner}</div>`;
  const pin = o.pin === false ? "" : `<i class="bc-pin" data-l="pin-${name}" data-pad="18" ${no ? "" : A("slam", at + 420)} ${pairM(o.m ? `${o.m}-pin` : "")} style="left:${(px - 23).toFixed(1)}px;top:${(py - 23).toFixed(1)}px;margin:0"></i>`;
  return { cx: px, cy: py, html: paper + pin };
};
// con dấu là lớp riêng: đóng xuống (xoay + thu từ to về đúng cỡ) sau khi giấy đã ghim
const stp = (name, pos, rot, text, at, cls = "", size = 0) => `<div class="bc-stp ${cls}" data-l="${name}" data-pad="24" ${A("stamp", at)} style="${pos};rotate:${rot}deg${size ? `;font-size:${size}px` : ""}"><span data-t>${esc(text)}</span></div>`;
// dây đỏ giữa hai đinh (đường cong võng xuống), có bóng đổ
let SL = 0;   // chỉ số slide đang dựng: dây đỏ, vân tay đặt tên riêng từng slide để PowerPoint không ghép nhầm rồi kéo giãn
const day = (name0, p, q, sag, at) => {
  const name = `s${SL}-${name0}`;
  const L = Math.min(p.cx, q.cx) - 30, T = Math.min(p.cy, q.cy) - 30, W = Math.abs(q.cx - p.cx) + 60, H = Math.abs(q.cy - p.cy) + sag + 70;
  const d = `M${p.cx - L} ${p.cy - T} C${p.cx - L} ${p.cy - T + sag}, ${q.cx - L} ${q.cy - T + sag}, ${q.cx - L} ${q.cy - T}`;
  return `<svg class="bc-rope" data-l="${name}" data-pad="4" ${A("wipe", at)} style="left:${L}px;top:${T}px;width:${W}px;height:${H}px" viewBox="0 0 ${W} ${H}"><path d="${d}" transform="translate(7 12)" stroke="rgba(14,6,0,.4)" stroke-width="8" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#c8261e" stroke-width="8" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#ff7a6a" stroke-width="2" fill="none" stroke-linecap="round" opacity=".55" transform="translate(-1 -2)"/></svg>`;
};
// vân tay mờ (các vòng ê-líp đứt đoạn)
const vanTay = (name, x, y, w) => { let g = ""; for (let i = 1; i <= 24; i++) { const r = i * 12.5; g += `<ellipse cx="200" cy="235" rx="${(r * 0.8).toFixed(1)}" ry="${r}" stroke-dasharray="${38 + i * 6} ${8 + (i % 5) * 4} ${70 - i * 2} 11" stroke-dashoffset="${i * 23}"/>`; }
  return `<svg class="bc-fp" data-l="${name}" data-pad="4" viewBox="0 0 400 480" style="left:${x}px;top:${y}px;width:${w}px;height:${Math.round(w * 1.2)}px">${g}</svg>`; };
// thẻ tang vật (giấy manila có lỗ xỏ dây)
const the = (name, x, y, w, h, rot, inner, at = 500, o = {}) => `<div class="bc-tag" data-l="${name}" data-pad="40" ${khongVao(o) ? "" : `${A("drop", at)} ${o.noem || MODE === "C" ? "" : 'data-em="teeter"'}`} ${pairM(o.m)} style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;rotate:${rot}deg"><i class="bc-hole"></i>${inner}</div>`;
const nhan = (name, x, y, rot, text, at = 100) => `<div class="bc-lab" data-l="${name}" data-pad="14" ${A("rise", at)} style="left:${x}px;top:${y}px;rotate:${rot}deg"><span data-t>${esc(text)}</span></div>`;

const S1 = {};

S1.bcbia = (s) => {
  const main = giay("bc1-chinh", 110, 170, 1020, 640, -1.6,
    `<div class="bc-lb" data-t style="left:60px;top:54px">${esc(s.kicker || "")}</div>
     <div class="bc-t1" data-t style="left:60px;top:112px;width:900px;font-size:158px">${tx(s.title || "")}</div>
     ${s.subtitle ? `<div class="bc-tx" data-t style="left:60px;top:430px;width:700px;font-size:35px">${tx(s.subtitle)}</div>` : ""}
     `, { dx: 380, m: "tieu", a: false });
  const C = (s.cites || []).slice(0, 3), pos = [[1290, 140, 3], [1380, 420, -3], [1240, 712, 2]], ps = [];
  const papers = C.map((c, i) => { const [x, y, r] = pos[i], p = giay(`bc1-d${i + 1}`, x, y, 440, 236, r,
    `<div class="bc-t1" data-t style="left:36px;top:68px;font-size:118px">${esc(c.n)}</div><div class="bc-tx" data-t style="left:230px;top:104px;width:190px;font-size:31px;font-weight:700">${tx(c.t)}</div><div class="bc-lb" data-t style="left:36px;top:38px;font-size:26px">ĐIỀU</div>`, { at: 700 + i * 220, m: MODE === "B" ? `q${i + 1}` : undefined, em: "teeter" }); ps.push(p); return p.html; });
  const ropes = ps.map((p, i) => day(`bc1-day${i + 1}`, main, p, [70, 110, 130][i], 1000 + i * 200));
  return { cls: "dark bc", bare: true, html: `<div class="cv" data-tay>${ropes.join("")}${main.html}${papers.join("")}${stp("bc1-dau", "right:834px;bottom:318px", 7, s.stamp || "Phân biệt", 1500)}
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
    ${the("bc2-the", 830, 500, 260, 220, -4, `<div class="bc-t1" data-t style="left:20px;top:70px;font-size:42px;color:#2a1c0a;width:220px;text-align:center">${esc(m.head || "Ranh giới")}</div><div class="bc-tx" data-t style="left:24px;top:128px;width:212px;font-size:23px;line-height:1.28;color:#4a3519;text-align:center">${tx(m.text || "")}</div>`, 1400, { m: "ranh" })}</div>` };
};

S1.bcchuong = (s) => {
  const num = pad2(s.num ?? 1);
  const main = giay("bc3-chinh", 110, 230, 1070, 600, -1.1,
    `<div class="bc-lb" data-t style="left:62px;top:40px;width:950px">${esc(`${s.partWord || "Chương"} ${s.num ?? 1} · ${s.part || ""}`)}</div><div class="bc-t1" data-t style="left:62px;top:96px;width:950px;font-size:108px;line-height:1.1">${tx(s.title || "")}</div>
     ${s.sub ? `<div class="bc-tx" data-t style="left:62px;top:480px;width:900px;font-size:34px;color:#5a4d36;font-weight:600">${tx(s.sub)}</div>` : ""}`, { dx: 400, m: "tieu", a: false });
  const tagC = { cx: 1530, cy: 190 };
  return { cls: "dark bc", html: `<div class="cv" data-tay>
    ${day("bc3-day", main, tagC, 100, 900)}${main.html}
    ${the("bc3-the", 1290, 170, 470, 650, 4.5, `<div class="bc-lb" data-t style="left:0;top:96px;width:470px;text-align:center;font-size:34px">${esc(s.partWord || "Chương")}</div><div class="bc-t1" data-t style="left:0;top:150px;width:470px;text-align:center;font-size:370px;line-height:1;color:#2a1c0a">${num}</div><div class="bc-tx" data-t style="left:30px;top:548px;width:410px;text-align:center;font-size:30px;font-weight:700;color:#4a3519">${esc(s.part || "")}</div>`, 600, { m: "chuong", a: false })}
    ${nhan("bc3-nhan", 110, 130, -2, `${s.partWord || "Chương"} ${s.num ?? 1}`, 100)}</div>` };
};


// ───────────── các kiểu còn lại: dùng chung tờ tiêu đề + dải chú thích ─────────────
const tieuDe = (s) => { const len = Math.max(8, plain(s.title || "").length), fs = Math.max(46, Math.min(72, Math.floor(1440 / (0.41 * len))));
  return giay("bc-tieu", 110, 104, 1560, 170, -0.5, `<div class="bc-lb" data-t style="left:56px;top:22px">${esc(s.kicker || "")}</div><div class="bc-t2" data-t style="left:56px;top:62px;width:1460px;font-size:${fs}px;white-space:nowrap">${tx(s.title || "")}</div>`, { dx: 690, m: "tieu", a: false, kA: "rise" }); };
const dai = (name, x, y, w, h, inner, at = 1200) => giay(name, x, y, w, h, 0.4, inner, { pin: false, at, cls: "bc-strip", pad: 40 });
const noi = (ps, sag, at0 = 900) => ps.slice(1).map((q, i) => day(`bc-day${i + 1}`, ps[i], q, sag, at0 + i * 200)).join("");
const trang = (inner) => ({ cls: "dark bc", html: `<div class="cv" data-tay>${inner}</div>` });
const chuNho = (txt, x, y, w, size = 27, name = "") => `<div class="bc-cap" data-t style="left:${x}px;top:${y}px;width:${w}px;font-size:${size}px">${tx(txt)}</div>`;

S1.bccauhoi = (s) => { const T = tieuDe(s), it = (s.items || []).slice(0, 3), xs = [110, 700, 1290], rot = [-1.4, 1, -1.1];
  const ps = it.map((x, i) => giay(`bc-q${i + 1}`, xs[i], 360 + (i === 1 ? 26 : 0), 520, 580, rot[i], `<div class="bc-t1" data-t style="left:44px;top:46px;font-size:160px;color:#c8261e">${pad2(i + 1)}</div><div class="bc-tx" data-t style="left:44px;top:250px;width:432px;font-size:44px;font-weight:700;line-height:1.3">${tx(x.q || x.text || "")}</div>`, { at: 400 + i * 220, go: x.go, m: MODE === "B" ? `q${i + 1}` : undefined, a: MODE === "B" ? false : undefined }));
  return trang(`${noi(ps, 60)}${T.html}${ps.map((p) => p.html).join("")}`); };

S1.bctrich = (s) => { const T = tieuDe(s);
  const q = giay("bc-trich", 110, 330, 1130, 580, -0.9, `<div class="bc-lb" data-t style="left:56px;top:48px;width:1000px">${esc(s.head || "")}</div><div class="bc-tx" data-t style="left:56px;top:120px;width:1020px;font-size:48px;line-height:1.42">${tx("“" + (s.quote || "") + "”")}</div>`, { dx: 420, at: 300 });
  const tg = the("bc-so", 1330, 300, 440, 560, 4, `<div class="bc-lb" data-t style="left:0;top:96px;width:440px;text-align:center;font-size:34px">${esc(s.artLabel || "Điều")}</div><div class="bc-t1" data-t style="left:0;top:160px;width:440px;text-align:center;font-size:${String(s.art || "").length > 2 ? 250 : 340}px;line-height:1;color:#2a1c0a">${esc(s.art || "")}</div>`, 700);
  return trang(`${day("bc-day", q, { cx: 1550, cy: 322 }, 80, 900)}${T.html}${q.html}${tg}${s.stamp ? stp("bc-khoan", "left:1390px;bottom:270px", -6, s.stamp, 1200) : ""}${dai("bc-nguon", 110, 950, 1700, 86, chuNho(s.source || "", 40, 22, 1620, 26), 1100).html}`); };

S1.bcbang = (s) => { const T = tieuDe(s), cols = s.cols || [], rows = (s.rows || []).slice(0, 5), cx = [48, 608, 1148], cw = [540, 520, 520], rh = 104, H = 76 + rows.length * rh + 130;
  const cell = (txt, j, y, o = "") => `<div class="bc-tx ${o}" data-t style="left:${cx[j] + 12}px;top:${y}px;width:${cw[j] - 24}px;font-size:35px;line-height:1.25">${tx(txt)}</div>`;
  const inner = `<div class="bc-hdr" style="left:36px;top:40px;width:1628px;height:76px"></div>${cols.map((c, j) => `<div class="bc-hc" data-t style="left:${cx[j] + 12}px;top:57px;width:${cw[j]}px">${esc(c.label || c)}</div>`).join("")}
    ${rows.map((r, i) => `${i === s.focus ? `<div class="bc-fo" style="left:30px;top:${116 + i * rh + 4}px;width:1640px;height:${rh - 8}px"></div>` : `<div class="bc-ru" style="left:48px;top:${116 + (i + 1) * rh - 1}px;width:1604px"></div>`}${r.map((c, j) => cell(c, j, 116 + i * rh + 24, j === 0 ? "bc-b" : "")).join("")}`).join("")}`;
  const B = giay("bc-bang", 110, 318, 1700, H, -0.3, inner, { dx: -700, at: 300 });
  return trang(`${T.html}${B.html}${s.note ? dai("bc-ghichu", 110, 318 + H + 30, 1700, 80, chuNho(s.note, 40, 20, 1620, 29), 1000).html : ""}`); };

S1.bcnhanh = (s) => { const T = tieuDe(s), r = s.root || {}, B = (s.branches || []).slice(0, 3), xs = [110, 700, 1290];
  const root = giay("bc-goc", 540, 300, 840, 190, -0.5, `<div class="bc-tx" data-t style="left:40px;top:34px;width:760px;font-size:38px;font-weight:700;line-height:1.3">${tx(r.q || "")}</div><div class="bc-lb" data-t style="left:40px;top:140px;width:760px;font-size:22px">${esc(r.src || "")}</div>`, { at: 300 });
  const br = B.map((b, i) => giay(`bc-nh${i + 1}`, xs[i], 590, 520, 400, [-1.2, 0.8, -0.6][i], `<div class="bc-lb" data-t style="left:40px;top:58px;width:440px;font-size:24px">${esc(b.when || "")}</div><div class="bc-t1" data-t style="left:40px;top:100px;width:440px;font-size:52px">${esc(b.head || "")}</div><div class="bc-tx" data-t style="left:40px;top:178px;width:440px;font-size:32px;line-height:1.32">${tx(b.text || "")}</div>`, { at: 600 + i * 250, cls: i === s.focus ? "bc-man" : (b.tone === "bad" ? "bc-on" : "") }));
  const ropes = br.map((p, i) => day(`bc-day${i + 1}`, root, p, 50 + i * 12, 1000 + i * 180)).join("");
  return trang(`${ropes}${T.html}${root.html}${br.map((p) => p.html).join("")}${s.note ? chuNho(s.note, 110, 1008, 1700, 26) : ""}`); };

S1.bctinhhuong = (s) => { const T = tieuDe(s), it = (s.items || []).slice(0, 4), xs = [110, 540, 970, 1400], rot = [-1.5, 1.1, -1, 1.4];
  const ps = it.map((x, i) => { const [a, b] = String(x.text || "").split("→").map((z) => z.trim()), dan = /dân sự/i.test(b || "");
    return giay(`bc-th${i + 1}`, xs[i], 340 + (i % 2) * 20, 400, 540, rot[i], `<div class="bc-t1" data-t style="left:38px;top:34px;font-size:130px;color:#c8261e">${esc(String(x.k || "abcd"[i]).toUpperCase())}</div><div class="bc-tx" data-t style="left:38px;top:190px;width:326px;font-size:35px;font-weight:600;line-height:1.3">${tx(a)}</div>`, { at: 400 + i * 200 }); });
  const dau = it.map((x, i) => { const b = String(x.text || "").split("→").map((z) => z.trim())[1] || ""; return stp(`bc-sd${i + 1}`, `left:${xs[i] + 30}px;bottom:${1080 - (340 + (i % 2) * 20 + 540 - 40)}px`, [-4, 3, -3, 4][i], b, 900 + i * 300, /dân sự/i.test(b) ? "bc-g" : "", 36); });
  return trang(`${noi(ps, 50)}${T.html}${ps.map((p) => p.html).join("")}${dau.join("")}${s.source ? chuNho(s.source, 110, 990, 1700, 26) : ""}`); };

S1.bcdoiung = (s) => { const T = tieuDe(s), P = (s.pairs || []).slice(0, 5), ps = [];
  const rows = P.map((p, i) => { const y = 350 + i * 150, L = giay(`bc-dl${i + 1}`, 110, y, 740, 128, -0.4, `<div class="bc-tx" data-t style="left:40px;top:24px;width:660px;font-size:34px;font-weight:600;line-height:1.28">${tx(p.left || "")}</div>`, { dx: 330, at: 300 + i * 150 }),
      R = giay(`bc-dr${i + 1}`, 1070, y, 740, 128, 0.4, `<div class="bc-tx" data-t style="left:40px;top:${p.note ? 14 : 30}px;width:660px;font-size:34px;font-weight:800;line-height:1.2">${tx(p.right || "")}</div>${p.note ? `<div class="bc-lb" data-t style="left:40px;top:96px;width:660px;font-size:20px;letter-spacing:.05em">${esc(p.note)}</div>` : ""}`, { dx: -330, at: 450 + i * 150, cls: i === s.focus ? "bc-man" : "" }); ps.push([L, R]); return L.html + R.html; });
  return trang(`${ps.map(([L, R], i) => day(`bc-d${i}`, L, R, 24, 900 + i * 120)).join("")}${T.html}${chuNho(s.colL || "", 130, 292, 600, 24)}${chuNho(s.colR || "", 1090, 292, 600, 24)}${rows.join("")}${s.note ? chuNho(s.note, 110, 1018, 1700, 27) : ""}`); };

S1.bccot = (s) => { const T = tieuDe(s), C = (s.cols || []).slice(0, 3), out = [];
  C.forEach((c, i) => { const n = +c.n || 0, rows = Math.ceil(n / 5), pit = rows >= 4 ? 80 : 94, x = 130 + i * 590, top = 880 - rows * pit;
    out.push(`<div class="bc-stack" data-l="bc-st${i}" data-pad="30" ${A("rise", 300 + i * 250)} style="left:${x}px;top:${top}px;width:480px;height:${rows * pit}px">${Array.from({ length: n }, (_, k) => `<i style="left:${(k % 5) * (pit + 2)}px;top:${Math.floor(k / 5) * pit}px;width:${pit - 10}px;height:${pit - 10}px"></i>`).join("")}</div>`);
    out.push(the(`bc-n${i}`, x + 90, top - 284, 300, 252, [-3, 2, -2][i], `<div class="bc-t1" data-t style="left:0;top:70px;width:300px;text-align:center;font-size:130px;line-height:1;color:#2a1c0a">${n}</div><div class="bc-lb" data-t style="left:0;top:206px;width:300px;text-align:center;font-size:26px">${esc(c.unit || "")}</div>`, 700 + i * 250));
    out.push(chuNho(c.label || "", x, 900, 520, 31)); });
  return trang(`${T.html}${s.legend ? chuNho(s.legend, 110, 296, 900, 27) : ""}${out.join("")}${s.source ? chuNho(s.source, 110, 1010, 1700, 25) : ""}`); };

S1.bcsolieu = (s) => { const T = tieuDe(s);
  const tg = the("bc-so", 150, 320, 520, 690, -3.5, `<div class="bc-t1" data-t style="left:0;top:120px;width:520px;text-align:center;font-size:${String(s.num || "").length > 2 ? 330 : 520}px;line-height:1;color:#2a1c0a">${esc(String(s.num ?? ""))}</div>`, 400);
  const pp = giay("bc-ct", 760, 360, 1050, 520, 0.8, `<div class="bc-t1" data-t style="left:56px;top:56px;width:940px;font-size:80px">${tx(s.unit || "")}</div><div class="bc-tx" data-t style="left:56px;top:230px;width:940px;font-size:40px;line-height:1.4">${tx(s.sub || "")}</div>`, { dx: -440, at: 700 });
  return trang(`${T.html}${tg}${pp.html}${s.note ? dai("bc-ghichu", 760, 920, 1050, 80, chuNho(s.note, 36, 20, 980, 27), 1100).html : ""}`); };

S1.bcdieukien = (s) => { const T = tieuDe(s), it = (s.items || []).slice(0, 5), ps = [];
  const rows = it.map((c, i) => { const p = giay(`bc-dk${i + 1}`, 110, 330 + i * 132, 1290, 112, i % 2 ? 0.35 : -0.35, `<div class="bc-ck"><svg viewBox="0 0 60 60" width="60" height="60"><polyline points="10,32 25,47 52,12" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="bc-tx" data-t style="left:112px;top:${c.text ? 14 : 30}px;width:900px;font-size:35px;font-weight:700;line-height:1.2">${tx(c.head || c.text || "")}</div>${c.text ? `<div class="bc-tx" data-t style="left:112px;top:62px;width:840px;font-size:26px;color:#5a4d36">${tx(c.text)}</div>` : ""}<div class="bc-chip" data-t style="right:30px;top:36px">${esc(c.src || "")}</div>`, { dx: 300, at: 300 + i * 170 }); ps.push(p); return p.html; });
  const v = s.verdict || {}, tg = the("bc-kl", 1470, 350, 340, 560, 3, `<div class="bc-lb" data-t style="left:0;top:96px;width:340px;text-align:center;font-size:30px">Kết luận</div><div class="bc-tx" data-t style="left:30px;top:160px;width:280px;font-size:36px;font-weight:800;line-height:1.28;text-align:center">${tx(v.text || "")}</div>`, 1200);
  return trang(`${noi(ps, 34)}${T.html}${rows.join("")}${tg}`); };

S1.bcnhanqua = (s) => { const T = tieuDe(s), c = s.cause || {}, st = s.stamp || {}, R = (s.results || []).slice(0, 3);
  const cause = giay("bc-nn", 110, 350, 540, 470, -1, `<div class="bc-lb" data-t style="left:44px;top:46px;width:450px">${esc(c.tag || "Tình huống")}</div><div class="bc-tx" data-t style="left:44px;top:100px;width:452px;font-size:42px;font-weight:700;line-height:1.32">${tx(c.text || "")}</div>`, { dx: 200, at: 300 });
  const rs = R.map((r, i) => giay(`bc-kq${i + 1}`, 1090, 330 + i * 230, 720, 196, [0.6, -0.5, 0.5][i], `<div class="bc-tx" data-t style="left:40px;top:42px;width:640px;font-size:38px;font-weight:800;line-height:1.25">${tx(r.text || "")}</div><div class="bc-lb" data-t style="left:40px;top:150px;width:640px;font-size:23px">${esc(r.ref || "")}</div>`, { dx: -320, at: 800 + i * 220 }));
  const ropes = rs.map((p, i) => day(`bc-day${i + 1}`, cause, p, 80 + i * 20, 1000 + i * 180)).join("");
  return trang(`${ropes}${T.html}${cause.html}${rs.map((p) => p.html).join("")}<div class="bc-stp bc-bg" data-l="bc-dau" data-pad="20" ${A("slam", 700)} style="left:720px;top:520px;rotate:-8deg;font-size:62px;text-align:center;padding:14px 30px"><span data-t>${tx(st.text || "")}</span><br><span data-t style="font-size:30px">${esc(st.sub || "")}</span></div>${s.source ? chuNho(s.source, 110, 1018, 1700, 25) : ""}`); };

S1.bchoi = (s) => { const T = tieuDe({ kicker: s.kicker, title: s.title }), O = (s.options || []).slice(0, 4), ans = s.answer ?? -1, W = s.whyNot || [];
  const stem = giay("bc-de", 110, 300, 1700, 150, -0.3, `<div class="bc-tx" data-t style="left:50px;top:26px;width:1600px;font-size:34px;line-height:1.38">${tx(s.stem || "")}</div>`, { pin: false, at: 300, m: "de", a: s.reveal ? false : undefined });
  const stamps = [];
  const ps = O.map((o, i) => { const dung = s.reveal && i === ans, sai = s.reveal && i !== ans, x = 110 + (i % 2) * 870, y = 490 + Math.floor(i / 2) * 230;
    if (dung) stamps.push(stp("bc-dung", `right:${1920 - (x + 830 - 26)}px;top:${y + 22}px`, 6, "Đúng", 600, "bc-g", 44));
    return giay(`bc-pa${i + 1}`, x, y, 830, 204, [-0.5, 0.5, 0.4, -0.4][i], `<div class="bc-no2" data-t>${"ABCD"[i]}</div><div class="bc-tx" data-t style="left:130px;top:${sai && W[i] ? 22 : 44}px;width:660px;font-size:37px;font-weight:700;line-height:1.2">${tx(o)}</div>${sai && W[i] ? `<div class="bc-tx" data-t style="left:130px;top:112px;width:660px;font-size:25px;color:#b3241c;font-weight:600;line-height:1.25">${tx(W[i])}</div>` : ""}`, { at: 400 + i * 140, dx: -330, cls: dung ? "bc-ok" : "", m: `pa${i + 1}`, a: s.reveal ? false : undefined }); });
  return trang(`${T.html}${stem.html}${ps.map((p) => p.html).join("")}${stamps.join("")}${s.reveal && s.why ? dai("bc-vi", 110, 952, 1700, 100, `<div class="bc-tx" data-t style="left:40px;top:18px;width:1620px;font-size:29px;line-height:1.3"><b>Vì sao:</b> ${tx(s.why)}</div>`, 1000).html : ""}`); };

S1.bcchot = (s) => { const T = tieuDe({ kicker: s.kicker || "Kết luận", title: s.title || "Ba ranh giới cần nhớ" }), ch = (s.chips || []).slice(0, 3), xs = [110, 700, 1290], rot = [-1.2, 1, -1];
  const ps = ch.map((c, i) => giay(`bc-ch${i + 1}`, xs[i], 330, 520, 440, rot[i], `<div class="bc-t1" data-t style="left:40px;top:40px;width:440px;font-size:96px;color:#c8261e;line-height:1.02">${esc(c.n || "")}</div><div class="bc-tx" data-t style="left:40px;top:170px;width:440px;font-size:35px;font-weight:600;line-height:1.32">${tx(c.text || "")}</div>`, { at: 400 + i * 220, go: c.go }));
  return trang(`${noi(ps, 60)}${T.html}${ps.map((p) => p.html).join("")}${dai("bc-cc", 110, 820, 1700, 200, `<div class="bc-lb" data-t style="left:44px;top:26px">Căn cứ</div><div class="bc-tx" data-t style="left:44px;top:66px;width:1610px;font-size:27px;line-height:1.36">${tx(s.basis || "")}</div>`, 1200).html}`); };

S1.bccamon = (s) => { const tm = (s.team || [])[0] || {};
  const main = giay("bc-chinh", 190, 230, 1080, 600, -1.2, `<div class="bc-t1" data-t style="left:64px;top:70px;width:960px;font-size:150px;line-height:1.02">${tx(s.title || "Cảm ơn và hỏi đáp")}</div><div class="bc-tx" data-t style="left:64px;top:380px;width:930px;font-size:40px;line-height:1.4">${tx(s.message || "")}</div>`, { dx: 400, at: 250 });
  return { cls: "dark bc", bare: true, html: `<div class="cv" data-tay>${main.html}
   ${the("bc-ten", 1330, 260, 460, 420, 4, `<div class="bc-t1" data-t style="left:30px;top:96px;width:400px;font-size:62px;text-align:center;color:#2a1c0a;line-height:1.1">${esc(tm.name || "")}</div><div class="bc-tx" data-t style="left:30px;top:250px;width:400px;font-size:30px;text-align:center;color:#4a3519;font-weight:600">${esc(tm.role || "")}</div>`, 600)}
   ${dai("bc-lh", 190, 900, 1080, 90, `<div class="bc-tx" data-t style="left:40px;top:22px;width:1000px;font-size:29px">${esc(s.contact || "")}</div>`, 900).html}</div>` }; };


// bcthang: THANG khung hình phạt — mỗi bậc (giá trị chiếm đoạt, khoản…) là một hàng, mỗi tội một thanh trải từ mức THẤP NHẤT đến CAO NHẤT trên trục.
// Khác bccot (chỉ có mức tối đa) và bcbang (chữ). rows[{label, sub, bars[{name,min,max,text,ct}]}] — ct: true = "hoặc chung thân". order: "up" (mặc định, bậc đầu ở dưới) | "down".
S1.bcthang = (s) => { const T = tieuDe(s), R = (s.rows || []).slice(0, 5), ax = s.axis || { max: 20, unit: "năm tù", ticks: [0, 5, 10, 15, 20] }, X0 = s.tag ? 500 : 560, W = s.tag ? 840 : 1050, PW = s.tag ? 1400 : 1700, sc = W / ax.max, RH = R.length >= 4 ? 112 : 130, up = s.order !== "down";
  const COL = ["#c8261e", "#1b1713", "#2e6b8a"], names = ((R[0] || {}).bars || []).map((b) => b.name).filter(Boolean), fmt = (v) => String(v).replace(".", ","), top0 = 96, H = top0 + R.length * RH + 74;
  const ticks = (ax.ticks || [0, 5, 10, 15, 20]).map((v) => `<div class="bc-gl" style="left:${X0 + v * sc}px;top:${top0}px;height:${R.length * RH + 6}px"></div><div class="bc-cap2" data-t style="left:${X0 + v * sc - 50}px;top:${top0 + R.length * RH + 18}px;width:100px;text-align:center">${v}</div>`).join("") + `<div class="bc-cap2" data-t style="left:${X0 - 230}px;top:${top0 + R.length * RH + 18}px;width:200px;text-align:right">${esc(ax.unit || "")}</div>`;
  const leg = names.length > 1 ? names.map((n, k) => `<i class="bc-sw" style="left:${X0 + k * 300}px;top:34px;background:${COL[k]}"></i><div class="bc-tx" data-t style="left:${X0 + k * 300 + 42}px;top:28px;width:250px;font-size:28px;font-weight:700">${esc(n)}</div>`).join("") : "";
  const rows = R.map((r, i) => { const y = top0 + (up ? R.length - 1 - i : i) * RH, B = (r.bars || []).slice(0, 3), nb = B.length, y0 = y + (RH - (nb * 46 - 10)) / 2;
    const bars = B.map((b, k) => { const x = X0 + b.min * sc, w = Math.max(24, (b.max - b.min) * sc), by = y0 + k * 46, txt = b.text || `${fmt(b.min)}–${fmt(b.max)} ${b.unit || "năm"}${b.ct ? " hoặc chung thân" : ""}`, inside = w >= (s.tag ? (b.ct ? 330 : 200) : (b.ct ? 400 : 300)), sm = s.tag && b.ct;
      return `<div class="bc-bar" style="left:${x}px;top:${by}px;width:${w}px;height:36px;background:${COL[k]}"></div><div class="bc-bl ${inside ? "in" : ""} ${sm ? "sm" : ""}" data-t style="left:${inside ? x + 14 : x + w + 14}px;top:${by}px;${inside ? `width:${w - 20}px` : ""}">${esc(txt)}</div>`; }).join("");
    return `${i === s.focus ? `<div class="bc-fo" style="left:30px;top:${y + 4}px;width:${PW - 60}px;height:${RH - 8}px"></div>` : `<div class="bc-ru" style="left:40px;top:${y + RH - 1}px;width:${PW - 80}px"></div>`}<div class="bc-tx bc-b" data-t style="left:44px;top:${y + 16}px;width:480px;font-size:${R.length >= 4 ? 31 : 33}px;line-height:1.2">${tx(r.label || "")}</div>${r.sub ? `<div class="bc-tx" data-t style="left:44px;top:${y + (R.length >= 4 ? 64 : 70)}px;width:480px;font-size:23px;line-height:1.25;color:#5a4d36">${tx(r.sub)}</div>` : ""}${bars}`; }).join("");
  const B = giay("bc-thang", 110, 318, PW, H, -0.3, `${leg}${ticks}${rows}`, { dx: s.tag ? -520 : -700, at: 300 });
  const fy = top0 + (up ? R.length - 1 - (s.focus ?? 0) : (s.focus ?? 0)) * RH, tg = s.tag ? the("bc2-the", 1565, 318 + fy + RH / 2 - 110, 260, 220, -4, `<div class="bc-t1" data-t style="left:20px;top:70px;font-size:42px;color:#2a1c0a;width:220px;text-align:center">${esc(s.tag.head || "Ranh giới")}</div><div class="bc-tx" data-t style="left:24px;top:128px;width:212px;font-size:23px;line-height:1.28;color:#4a3519;text-align:center">${tx(s.tag.text || "")}</div>`, 700, { m: "ranh", a: false }) : "";
  return trang(`${T.html}${B.html}${tg}${s.note ? dai("bc-ghichu", 110, 318 + H + 28, 1700, 80, chuNho(s.note, 40, 20, 1620, 29), 1000).html : ""}`); };

// thẻ chương nhỏ ở góc: cùng tên Morph "chuong" với thẻ số to của slide mở chương → thẻ thu nhỏ vào góc, sang chương mới thì lớn lên thành thẻ mới
const theNho = (s) => the("bc-chn", 1700, 98, 116, 186, 4, `<div class="bc-lb" data-t style="left:0;top:76px;width:116px;text-align:center;font-size:16px;letter-spacing:.06em">Chương</div><div class="bc-t1" data-t style="left:0;top:98px;width:116px;text-align:center;font-size:66px;line-height:1;color:#2a1c0a">${pad2(s.ch)}</div>`, 500, { m: "chuong", a: false, na: true, noem: true });

// ───────────── bcsan: SÂN KHẤU — dàn nhân vật xuyên suốt ─────────────
// Ý tưởng: không dựng từng slide tĩnh rồi gắn Morph; dựng MỘT dàn nhân vật cố định (mỗi nhân vật một "chìa" `ca-…` dùng chung mọi slide)
// rồi mỗi slide chỉ khai báo VỊ TRÍ MỚI của chính họ → Morph tự là "nhân vật dời chỗ". Minh hoạ vẽ bằng SVG (không dùng hình dán có sẵn).
//   cast: { A:{x,y,w,rot,cap,sub,deco}, B:{…}, tui:{x,y,w,rot,label}, yd:{x,y,w,rot,label} }   expl:{x,y,w,h,lb,q,n | cols[{h,t}]}
//   caps:[{t,x,y,w,size}]   bia:{kicker,title,subtitle,stamp,author,authorSub,date}  (bìa: tờ lớn là cặp Morph `tieu`)
const MAU = { A: { skin: "#f2c9a0", hair: "#2b2118", shirt: "#2f7d8c", bg: "#cfe6ea" }, B: { skin: "#e8b98f", hair: "#5a3a1e", shirt: "#d9822b", bg: "#f5dcc0" } };
const nguoi = (k, sz, deco, mood = "vui") => { const c = MAU[k] || MAU.A, st = (d, w = 4) => `<path d="${d}" stroke="#2b2118" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const hair = k === "B" ? `<path d="M58 90 C50 44 92 30 124 38 C150 46 148 76 144 92 C138 70 120 60 100 60 C78 60 64 72 58 90Z" fill="${c.hair}"/>` : `<path d="M60 84 C56 40 98 26 128 40 C146 50 146 70 142 84 C134 62 112 56 96 58 C80 58 66 66 60 84Z" fill="${c.hair}"/>`;
  let eyes = `<circle cx="86" cy="88" r="4.5" fill="#2b2118"/><circle cx="114" cy="88" r="4.5" fill="#2b2118"/>`, brows = "", extra = "", mouth = `<path d="M86 104 Q100 120 114 104" stroke="#8a4b3a" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  const mo = (d) => `<path d="${d}" stroke="#8a4b3a" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  if (mood === "gian") { brows = st("M72 72 L96 83 M128 72 L104 83", 5); mouth = mo("M86 115 Q100 102 114 115"); extra = `<ellipse cx="70" cy="100" rx="9" ry="6" fill="#e8574a" opacity=".5"/><ellipse cx="130" cy="100" rx="9" ry="6" fill="#e8574a" opacity=".5"/>`; }
  else if (mood === "buon") { brows = st("M76 81 L94 74 M124 81 L106 74", 4); mouth = mo("M90 113 Q100 104 110 113"); extra = `<path d="M126 96 q7 11 0 17 q-7 -6 0 -17z" fill="#6bb6e8" stroke="#3b86b8" stroke-width="2"/>`; }
  else if (mood === "xao") { eyes = st("M78 90 Q86 83 94 90 M106 90 Q114 83 122 90", 5); brows = st("M76 77 L96 81 M104 77 Q116 70 128 75", 4); mouth = mo("M86 106 Q104 116 120 99"); }
  else if (mood === "nghi") { mouth = mo("M90 108 L110 108"); brows = st("M78 78 L94 78 M106 76 L122 74", 4); }
  const glasses = k === "B" ? `<g fill="none" stroke="#2b2118" stroke-width="3"><circle cx="86" cy="88" r="12"/><circle cx="114" cy="88" r="12"/><path d="M98 88h4"/></g>` : "";
  const badge = deco === "badge" ? `<g><rect x="118" y="150" width="34" height="34" rx="6" fill="#f6b93b" stroke="#8a5a00" stroke-width="3"/><path d="M135 156l4 9 10 1-8 6 3 10-9-6-9 6 3-10-8-6 10-1z" fill="#8a5a00"/></g>` : "";
  return `<svg viewBox="0 0 200 200" width="${sz}" height="${sz}" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="${c.bg}"/><path d="M24 200 C24 150 62 134 100 134 C138 134 176 150 176 200Z" fill="${c.shirt}"/><path d="M82 134 L100 162 L118 134Z" fill="#fff" opacity=".9"/><rect x="87" y="104" width="26" height="34" rx="12" fill="${c.skin}"/><ellipse cx="100" cy="86" rx="38" ry="42" fill="${c.skin}"/>${hair}${extra}${eyes}${glasses}${brows}${mouth}${badge}</svg>`; };
const polaroid = (k, c) => { const w = c.w || 240, h = Math.round(w * 1.36), im = Math.round(w * 0.84), m = Math.round((w - im) / 2);
  return giay(`ca-${k}`, c.x, c.y, w, h, c.rot || 0, `<div class="bc-pi" style="left:${m}px;top:${m + 6}px;width:${im}px;height:${im}px">${nguoi(k, im, c.deco, c.mood)}</div><div class="bc-t1" data-t style="left:0;top:${m + im + 8}px;width:${w}px;text-align:center;font-size:${Math.round(w * 0.19)}px;color:#1b1713">${esc(c.cap || k)}</div><div class="bc-tx" data-t style="left:0;top:${m + im + 10 + Math.round(w * 0.22)}px;width:${w}px;text-align:center;font-size:${Math.round(w * 0.1)}px;color:#5a4d36;font-weight:600">${esc(c.sub || "")}</div>`, { m: `ca-${k}`, a: false, pad: 56 }); };
const tui = (c) => { const w = c.w || 260, h = Math.round(w * 0.77);
  return `<div class="bc-bag" data-l="ca-tui" data-pad="30" ${pairM("ca-tui")} style="left:${c.x}px;top:${c.y}px;width:${w}px;height:${h}px;rotate:${c.rot || 0}deg"><svg viewBox="0 0 260 200" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="26" width="232" height="164" rx="14" fill="#eef3f0" fill-opacity=".6" stroke="#4a5a52" stroke-width="5"/><rect x="14" y="26" width="232" height="28" rx="14" fill="#c8261e"/><rect x="26" y="72" width="150" height="78" rx="6" fill="#2e8b57" stroke="#1d5d3a" stroke-width="4" transform="rotate(-6 100 110)"/><rect x="48" y="80" width="150" height="78" rx="6" fill="#3aa56b" stroke="#1d5d3a" stroke-width="4" transform="rotate(3 120 120)"/><circle cx="122" cy="118" r="22" fill="#d9f2e2" stroke="#1d5d3a" stroke-width="4"/><path d="M122 104v28M114 111c0-6 16-6 16 0s-16 8-16 14 16 6 16 0" fill="none" stroke="#1d5d3a" stroke-width="4" stroke-linecap="round"/><rect x="150" y="62" width="26" height="100" fill="#f6eedb" stroke="#5a4d36" stroke-width="3" transform="rotate(3 163 112)"/><rect x="62" y="150" width="136" height="34" rx="4" fill="#fff" stroke="#8a9a92" stroke-width="2"/></svg><div class="bc-t1" data-t style="left:0;top:${Math.round(h * 0.755)}px;width:${w}px;text-align:center;font-size:${Math.round(w * 0.125)}px;line-height:1;color:#1b1713">${esc(c.label || "")}</div></div>`; };
const den = (c) => { const w = c.w || 160, on = c.on !== false, dome = on ? "#d3281f" : "#8f8f8f", edge = on ? "#7d130d" : "#555", hi = on ? "#ffb3a8" : "#d6d6d6";
  const glow = on ? `<circle cx="80" cy="74" r="62" fill="#ff5a3c" opacity=".28"/>` : "", rays = on ? `<g stroke="#ffcf5a" stroke-width="7" stroke-linecap="round"><line x1="80" y1="8" x2="80" y2="22"/><line x1="26" y1="30" x2="36" y2="40"/><line x1="134" y1="30" x2="124" y2="40"/><line x1="12" y1="68" x2="26" y2="72"/><line x1="148" y1="68" x2="134" y2="72"/></g>` : "";
  return `<div class="bc-den" data-l="ca-yd" data-pad="30" ${pairM("ca-yd")} style="left:${c.x}px;top:${c.y}px;width:${w}px;height:${Math.round(w * 1.22)}px;rotate:${c.rot || 0}deg"><svg viewBox="0 0 160 140" width="${w}" height="${Math.round(w * 0.875)}" xmlns="http://www.w3.org/2000/svg">${glow}<rect x="30" y="104" width="100" height="22" rx="6" fill="#2a2a2a"/><path d="M44 104 C44 58 66 34 80 34 C94 34 116 58 116 104Z" fill="${dome}" stroke="${edge}" stroke-width="5"/><path d="M58 98 C58 70 68 54 78 46" stroke="${hi}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".85"/>${rays}</svg><div class="bc-lb" data-t style="left:-40px;top:${Math.round(w * 0.9)}px;width:${w + 80}px;text-align:center;font-size:${Math.round(w * 0.15)}px;line-height:1.15;color:#f4ecd8;text-shadow:0 2px 6px rgba(0,0,0,.7);letter-spacing:.04em">${esc(c.label || "")}</div></div>`; };
// bong bóng thoại: who "A" (đuôi trỏ trái) hoặc "B" (đuôi trỏ phải); chữ đổi mỗi slide nên không ghép chữ (data-mt)
const thoai = (c) => { const w = c.w || 400, h = c.h || 160, left = c.who === "A", r = 28, tail = left ? `M0 ${h * 0.5} L-38 ${h * 0.66} L0 ${h * 0.76}` : `M${w} ${h * 0.5} L${w + 38} ${h * 0.66} L${w} ${h * 0.76}`;
  return `<div class="bc-noi" data-l="ca-noi-${c.who}" data-pad="50" data-mt="0" ${pairM(`ca-noi-${c.who}`)} style="left:${c.x}px;top:${c.y}px;width:${w}px;height:${h}px;rotate:${c.rot ?? (left ? -2 : 2)}deg"><svg viewBox="-44 -6 ${w + 88} ${h + 12}" width="${w + 88}" height="${h + 12}" style="left:-44px;top:-6px" xmlns="http://www.w3.org/2000/svg"><path d="M${r} 0 H${w - r} Q${w} 0 ${w} ${r} V${h - r} Q${w} ${h} ${w - r} ${h} H${r} Q0 ${h} 0 ${h - r} V${r} Q0 0 ${r} 0Z" fill="#fff" stroke="#1b1713" stroke-width="4"/><path d="${tail}" fill="#fff" stroke="#1b1713" stroke-width="4" stroke-linejoin="round"/><path d="M${left ? 2 : w - 2} ${h * 0.53} v${h * 0.2}" stroke="#fff" stroke-width="8"/></svg><div class="bc-tx" data-t style="left:22px;top:0;width:${w - 44}px;height:${h}px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:${c.size || 38}px;font-weight:700;line-height:1.2">${tx(c.t || "")}</div></div>`; };
// dây căng thẳng giữa hai ghim, là MỘT lớp có tên Morph `ca-day`: khi hai ghim dời chỗ, dây kéo dãn và xoay theo (không mờ chéo như dây cong riêng từng slide)
const soiThang = (p, q) => { const dx = q.cx - p.cx, dy = q.cy - p.cy, L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx) * 180 / Math.PI, h = 12;
  return `<div class="bc-soi" data-l="ca-day" data-pad="14" ${pairM("ca-day")} style="left:${((p.cx + q.cx) / 2 - L / 2).toFixed(1)}px;top:${((p.cy + q.cy) / 2 - h / 2).toFixed(1)}px;width:${L.toFixed(1)}px;height:${h}px;rotate:${ang.toFixed(2)}deg"></div>`; };
const giaiThich = (e) => { const inner = e.cols
    ? e.cols.map((c, i) => `<div class="bc-t1" data-t style="left:${40 + i * 556}px;top:40px;width:520px;font-size:46px;color:#c8261e">${esc(c.h)}</div><div class="bc-tx" data-t style="left:${40 + i * 556}px;top:112px;width:520px;font-size:33px;font-weight:600;line-height:1.3">${tx(c.t)}</div>`).join("")
    : `<div class="bc-lb" data-t style="left:44px;top:34px;width:1600px">${esc(e.lb || "")}</div>${e.q ? `<div class="bc-tx" data-t style="left:44px;top:84px;width:1610px;font-size:${e.qs || 42}px;line-height:1.32">${tx(e.q)}</div>` : ""}${e.n ? `<div class="bc-tx" data-t style="left:44px;top:${e.nt ?? (84 + Math.ceil(plain(e.q || "").length / Math.floor(1610 / ((e.qs || 42) * 0.5))) * Math.round((e.qs || 42) * 1.32) + 14)}px;width:1610px;font-size:31px;color:#5a4d36;font-weight:600;line-height:1.3">${tx(e.n)}</div>` : ""}`;
  return giay("ca-expl", e.x, e.y, e.w, e.h, e.rot ?? -0.3, inner, { m: "ca-expl", a: false, dx: e.dx ?? (e.w / 2 - 150) }); };
S1.bcsan = (s) => { const C = s.cast || {}, pins = {}, parts = [];
  let head;
  if (s.bia) { const b = s.bia, main = giay("bc1-chinh", 110, 170, 1020, 640, -1.6, `<div class="bc-lb" data-t style="left:60px;top:54px">${esc(b.kicker || "")}</div><div class="bc-t1" data-t style="left:60px;top:112px;width:900px;font-size:158px">${tx(b.title || "")}</div>${b.subtitle ? `<div class="bc-tx" data-t style="left:60px;top:430px;width:700px;font-size:35px">${tx(b.subtitle)}</div>` : ""}`, { dx: 380, m: "tieu", a: false });
    head = main.html + stp("bc1-dau", "left:830px;top:640px", 7, b.stamp || "Phân biệt", 0) + the("bc1-the", 120, 850, 560, 190, -2.5, `<div class="bc-t1" data-t style="left:70px;top:80px;font-size:50px;color:#2a1c0a">${esc(b.author || "")}</div><div class="bc-tx" data-t style="left:70px;top:138px;font-size:27px;color:#4a3519">${esc([b.authorSub, b.date].filter(Boolean).join(" · "))}</div>`, 0); }
  else head = tieuDe(s).html;
  ["A", "B"].forEach((k) => { if (C[k]) { pins[k] = polaroid(k, C[k]); parts.push(pins[k].html); } });
  const rope = pins.A && pins.B ? soiThang(pins.A, pins.B) : "";
  if (C.tui) parts.push(tui(C.tui)); if (C.yd) parts.push(den(C.yd)); (s.noi || []).forEach((c) => parts.push(thoai(c)));
  if (s.expl) parts.push(giaiThich(s.expl).html);
  // con dấu điểm nhấn (vd. "Điều 174"): tên riêng từng slide nên không ghép Morph, xuất hiện cùng lúc chuyển cảnh
  (s.stamps || []).forEach((c, i) => parts.push(stp(`s${SL}-dau${i}`, `left:${c.x}px;top:${c.y}px`, c.rot ?? -8, c.t, 0, `bc-bg${c.xanh ? " bc-g" : ""}`, c.size || 0)));
  (s.caps || []).forEach((c) => parts.push(chuNho(c.t, c.x, c.y, c.w || 500, c.size || 28)));
  return trang(`${rope}${head}${parts.join("")}`); };

function render(s, deck, ctx, { i, n }) {
  SL = i; MODE = (deck.meta && deck.meta.bc) || "C"; kit.reset();
  const o = S1[s.type](s, deck, ctx);
  let html = wrap(o, s, deck, i, n);
  if (s.ch && !["bcbia", "bcchuong", "bccamon"].includes(s.type)) html = html.replace(/<\/div><\/section>\s*$/, `${theNho(s)}</div></section>`);
  return [{ id: s.id || `s${i + 1}`, html, tu: true, dur: s.dur || (MODE === "A" ? 450 : MODE === "C" ? 900 : 1200) }];
}

const fpSvg = (() => { let g = ""; for (let i = 1; i <= 24; i++) { const r = i * 12.5; g += `<ellipse cx='200' cy='235' rx='${(r * 0.8).toFixed(1)}' ry='${r}' stroke-dasharray='${38 + i * 6} ${8 + (i % 5) * 4} ${70 - i * 2} 11' stroke-dashoffset='${i * 23}'/>`; }
  return `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 480' fill='none' stroke='%232a170b' stroke-opacity='.17' stroke-width='6' stroke-linecap='round'>${g}</svg>")`; })();
const cork = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='640'><filter id='a' x='0' y='0' width='100%25' height='100%25'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 .11 0 0 0 0 .05 0 0 0 0 .02 0 0 0 1.9 -.78'/></filter><filter id='b' x='0' y='0' width='100%25' height='100%25'><feTurbulence type='fractalNoise' baseFrequency='.55' numOctaves='2' seed='11'/><feColorMatrix values='0 0 0 0 .97 0 0 0 0 .8 0 0 0 0 .55 0 0 0 1.7 -.82'/></filter><rect width='640' height='640' filter='url(%23a)'/><rect width='640' height='640' filter='url(%23b)' opacity='.8'/></svg>\")";

const css = `
.bc-man { background: #ecd48e; }
.bc-strip .bc-cap { color: #1b1713; text-shadow: none; }
.bc-strip { background: #efe3c4; box-shadow: inset 0 1px 0 rgba(255,255,255,.6), 8px 12px 18px rgba(14,6,0,.45); }
.bc-cap { position: absolute; font: 700 27px/1.3 var(--fb); color: #f4ecd8; text-shadow: 0 2px 8px rgba(0,0,0,.6); }
.bc-stack { position: absolute; } .bc-stack i { position: absolute; width: 84px; height: 84px; background: radial-gradient(circle at 50% 15px, #d3281f 0 6px, transparent 7px), #f6eedb; box-shadow: 5px 7px 9px rgba(14,6,0,.5); }
.bc-hdr { position: absolute; background: #1b1713; } .bc-hc { position: absolute; font: 800 26px/1 var(--fb); letter-spacing: .06em; text-transform: uppercase; color: #f4ecd8; }
.bc-fo { position: absolute; background: #ffe08a; border: 5px solid #c8261e; border-radius: 14px; } .bc-ru { position: absolute; height: 2px; background: rgba(27,23,19,.28); } .bc-b { font-weight: 800 !important; }
.bc-ck { position: absolute; left: 22px; top: 26px; width: 60px; height: 60px; background: #2e8b57; box-shadow: 4px 5px 0 rgba(14,6,0,.3); border-radius: 8px; }
.bc-chip { position: absolute; font: 700 22px/1 var(--fb); color: #5a4d36; border: 3px solid #5a4d36; padding: 7px 12px; }
.bc-no2 { position: absolute; left: 30px; top: 50px; width: 82px; height: 82px; background: #1b1713; color: #f4ecd8; font: 400 58px/82px var(--fd); text-align: center; }
.bc-ok { background: #f3f8e6; box-shadow: inset 0 14px 0 #2e8b57, 3px 4px 0 rgba(60,40,20,.14), 15px 22px 28px rgba(14,6,0,.5); }
.bc-stp.bc-bg { background: #f6eedb; box-shadow: 8px 12px 16px rgba(14,6,0,.45); opacity: 1; }
.bc-stp.bc-g { color: #1f6b44; border-color: #1f6b44; }
.bc-dim { opacity: .9; }
.bc-pi { position: absolute; overflow: hidden; box-shadow: inset 0 0 0 2px rgba(0,0,0,.14); }
.bc-soi { position: absolute; border-radius: 7px; background: linear-gradient(180deg, #ee5646 0%, #c8261e 45%, #8f1a12 100%); box-shadow: 4px 9px 7px rgba(14,6,0,.42); }
.bc-noi { position: absolute; filter: drop-shadow(6px 9px 7px rgba(14,6,0,.4)); } .bc-noi > * { position: absolute; }
.bc-bag, .bc-den { position: absolute; } .bc-bag > *, .bc-den > * { position: absolute; }
.bc-bag { filter: drop-shadow(8px 12px 10px rgba(14,6,0,.45)); } .bc-den { filter: drop-shadow(6px 10px 8px rgba(14,6,0,.45)); }
.bc-bar { position: absolute; border-radius: 4px; box-shadow: 3px 4px 0 rgba(14,6,0,.28); }
.bc-bl { position: absolute; font: 700 27px/36px var(--fb); color: #1b1713; white-space: nowrap; } .bc-bl.in { color: #f4ecd8; overflow: hidden; } .bc-bl.sm { font-size: 23px; }
.bc-gl { position: absolute; width: 2px; background: rgba(27,23,19,.2); }
.bc-cap2 { position: absolute; font: 700 24px/1 var(--fb); color: #5a4d36; }
.bc-sw { position: absolute; width: 28px; height: 28px; }

/* ── bảng bằng chứng (hình sự) ── */
.s.bc { background-color: #79502f; background-image: radial-gradient(1500px 900px at 45% 38%, rgba(255,222,170,.28), transparent 68%), radial-gradient(2000px 1300px at 50% 50%, transparent 50%, rgba(18,8,2,.62) 100%), ${cork}; color: #f4ecd8; --fg: #f4ecd8; --mut: #ead9ba; --hl: #ffd27a; }
.s.bc::before { content: "" !important; display: block !important; position: absolute !important; left: auto !important; top: auto !important; right: -60px !important; bottom: -150px !important; width: 560px !important; height: 672px !important; background: ${fpSvg} no-repeat center / contain !important; border-radius: 0 !important; pointer-events: none; z-index: 1; } .s.bc::after { opacity: .1; }
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
