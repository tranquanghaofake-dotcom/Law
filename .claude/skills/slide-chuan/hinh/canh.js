// TẦNG HÌNH ẢNH — CÁC "CẢNH": type của deck.json có dàn dựng riêng (vật thật, hình dán, Morph, số đếm, liên kết bấm được).
// Khác với 65 type của bộ mẫu (hinh/tu_gan.js tự gắn nhãn), cảnh được gắn nhãn tay: data-t (hộp chữ), data-l (lớp ảnh), data-a (hiệu ứng),
// data-m (tên Morph), data-go (nhảy slide). Cú pháp từng type: references/canh.md.
//
//   book      mở sách tìm điều luật: bìa trên bàn → sách mở → kính lúp soi dần tới điều cần tìm      (1 slide deck.json → 5–9 slide tự chạy)
//   bigq      câu hỏi lớn của bài + hình chủ đạo                                                     picks   2–3 thẻ câu hỏi, bấm để nhảy
//   lawquote  trích nguyên văn điều luật, nét bút đánh dấu, số điều lớn, dấu khoản                     tiles   cột xếp bằng ô đơn vị + số đếm
//   strip     dải N ngày có số, đánh dấu từng ngày, ba mốc                                            cases   thẻ trường hợp có hình dán + con số chốt
//   chain     tình huống → dấu kết luận → các hệ quả                                                 quizgo  trắc nghiệm bấm đáp án (3 slide: hỏi, sai, đúng)
//   recap     câu chốt + thẻ ghi nhớ bấm được + căn cứ                                               toc     mục lục bằng ảnh thu nhỏ, bấm để nhảy
//
// Vật đi xuyên slide (Morph tự ghép vì cùng tên): hình dán cùng tên ở hai slide kề nhau · tờ trích của lawquote → thẻ nhỏ của tiles ·
// ô của cột `morph` trong tiles → tờ lịch của strip · dòng đỏ ở book → ô đỏ của bigq · nhãn điều luật ở book → tên bài trên thanh đầu slide ·
// cuốn sách → nút Mục lục ở góc (khi deck có slide toc).
const { wrap, plain, kit } = require("../stage/templates");
const { esc, f, head, note, inn } = kit;

const TYPES = ["book", "bigq", "picks", "lawquote", "tiles", "strip", "cases", "chain", "quizgo", "recap", "toc"];
const pad2 = (n) => String(n).padStart(2, "0");
const tx = (s) => f(s).replace(/\n/g, "<br>");

// hình dán: lớp ảnh riêng. m = tên Morph (hình trùng tên ở slide trước sẽ bay tới chỗ mới thay vì bật ra)
const emo = (ctx, n, size, style = "", attr = "") => (ctx.hasEmoji(n) ? `<div class="emo" data-l="${n}" data-pad="${Math.round(size * 0.1 + 14)}" data-alt="Hình minh hoạ" style="width:${size}px;height:${size}px;${style}" ${attr}><img src="${ctx.emoji(n)}" alt=""></div>` : "");
const pic = (ctx, n, size, style = "") => (ctx.hasEmoji(n) ? `<img class="stk" src="${ctx.emoji(n)}" alt="" style="width:${size}px;height:${size}px;${style}">` : "");
// hình dán có thể "bay từ slide trước": trùng tên với hình của slide trước thì mang tên Morph, không có hiệu ứng vào
const fly = (ctx, n, size, style, fx, extra = "") => { ctx.now.add(n); return emo(ctx, n, size, style, (ctx.prev.has(n) ? `data-m="hd-${n}"` : `data-m="hd-${n}" ${fx}`) + " " + extra); };
// (hình vừa có tên Morph vừa có hiệu ứng vào chỉ khi slide trước KHÔNG có hình cùng tên — lúc đó tên Morph chỉ để slide sau ghép)

// ───────────────────────── book: cuốn sách ─────────────────────────
const PW = 690, PH = 810, BW = PW + 14, BH = PH + 28, OX = 960, OY = 495, MO = [OX - BW, OY - BH / 2];
function bookKit(s) {
  const lab = s.label || "Điều", L = s.left || {}, R = s.right || {}, all = [...(L.rows || []), ...(R.rows || [])], title = Object.fromEntries(all);
  const rows = (a, hit) => (a || []).map(([n, t]) => `<div class="row${n === hit ? " hit" : ""}" data-r="${esc(n)}"><b>${esc(lab)} ${esc(n)}.</b> ${esc(t)}</div>`).join("");
  const page = (p, side, hit) => `${p.head ? `<div class="hd0"${side === "r" ? ' style="text-align:right"' : ""}>${esc(p.head)}</div>` : ""}${p.chapter ? `<div class="zch">${esc(p.chapter)}</div>` : ""}${p.name ? `<div class="cht zan">${esc(p.name)}</div>` : ""}${p.section ? `<div class="muc"${p.chapter || p.name ? "" : ' style="margin-top:30px"'}>${esc(p.section)}</div>` : ""}${rows(p.rows, hit)}${p.page != null ? `<div class="pn">${esc(p.page)}</div>` : ""}${side === "r" ? '<div class="rib"></div>' : ""}`;
  const c = s.cover || {}, cover = `<div class="zbt zan">${esc(c.title || "").replace(/\n/g, "<br>")}</div>${c.year ? `<div class="zby zan">${esc(c.year)}</div>` : ""}${c.code ? `<div class="bs">${esc(c.code)}</div>` : ""}`;
  /** Các phần của sách, mỗi phần một lớp ảnh có tên Morph cố định: bia-sau · bia · trang-phai · trang-trai. */
  const parts = (state, { cx = OX, cy = OY, k = 1, rot = 0, wrapAt = null, flat = false, go = "", hit = null } = {}) => {
    const a = (rot * Math.PI) / 180, wx = wrapAt ? wrapAt[0] : 0, wy = wrapAt ? wrapAt[1] : 0;
    const at = (ox, oy, w, h, more = "") => { const X = cx + k * (ox * Math.cos(a) - oy * Math.sin(a)) - wx, Y = cy + k * (ox * Math.sin(a) + oy * Math.cos(a)) - wy;
      return `style="left:${(X - w / 2).toFixed(1)}px;top:${(Y - h / 2).toFixed(1)}px;${k !== 1 ? `scale:${k};` : ""}${rot ? `rotate:${rot}deg;` : ""}${more}"`; };
    const Lr = (n, pd) => (flat ? "" : `data-l="${n}" data-m="${n}" data-pad="${Math.max(2, Math.round(pd * k))}" data-prop${go ? ` data-go="${go}"` : ""}`);
    if (state === "closed") return `<div class="bd zr" ${Lr("bia-sau", 40)} ${at(0, 0, BW, BH)}></div><div class="zpg zr" ${Lr("trang-phai", 10)} ${at(-7, 0, PW, PH)}>${page(R, "r", hit)}</div><div class="cv0" ${Lr("bia", 40)} ${at(0, 0, BW, BH)}>${cover}</div>`;
    const back = `<div class="bd zr" ${Lr("bia-sau", 40)} ${at(BW / 2, 0, BW, BH)}></div>`, pr = `<div class="zpg zr" ${Lr("trang-phai", 10)} ${at(PW / 2, 0, PW, PH)}>${page(R, "r", hit)}</div>`;
    if (state === "fold") return back + pr + `<div class="zpg zl" ${Lr("trang-trai", 10)} ${at(-PW / 2, 0, PW, PH, "transform-origin:100% 50%;scale:.03 1;")}>${page(L, "l", hit)}</div><div class="cv0" ${Lr("bia", 40)} ${at(BW / 2, 0, BW, BH, "transform-origin:0 50%;scale:.035 1;")}>${cover}</div>`;
    return back + `<div class="bd zl" ${Lr("bia", 40)} ${at(-BW / 2, 0, BW, BH)}></div>` + pr + `<div class="zpg zl" ${Lr("trang-trai", 10)} ${at(-PW / 2, 0, PW, PH)}>${page(L, "l", hit)}</div>`;
  };
  return { lab, title, parts, has: (n) => n in title };
}
const MINI = { cx: 1566, cy: 58, k: 0.07 };                    // sách thu nhỏ ở thanh đầu slide = nút Mục lục
function miniBook(bk, split, go) {
  if (split) return bk.parts("open", { ...MINI, go });
  return `<div class="mo mini" data-l="sach-nho" data-m="sach-nho" data-prop data-go="${go}" data-alt="Về mục lục" style="left:${MINI.cx - BW}px;top:${MINI.cy - BH / 2}px;width:${2 * BW}px;height:${BH}px;scale:${MINI.k}">${bk.parts("open", { wrapAt: MO, flat: true })}</div>`;
}
const lensDesk = (x, y, k, rot) => `<div class="lens" style="left:${x}px;top:${y}px"><div class="nen ban" data-l="kinh-nen" data-m="kinh-nen" data-pad="6" style="scale:${k}"></div><div class="vanh" data-l="kinh-vanh" data-m="kinh-vanh" data-pad="8" data-alt="Kính lúp" style="scale:${k};rotate:${rot}deg"><div class="zring"></div><div class="zhdl"></div></div></div>`;
const lensPage = (row, hit) => `<div class="lens" data-row="${esc(row)}"><div class="nen" data-l="kinh-nen" data-m="kinh-nen" data-pad="22"></div>
  <div class="glass" data-w="kinh-mat" data-m="kinh-mat" data-of=".mo" data-z="1.7" data-alt="Phần trang sách được phóng to"></div>
  ${hit ? `<div class="glass" data-w="kinh-mat-do" data-of=".mo-do" data-z="1.7" data-a="fade" data-at="220" data-dur="380" data-alt="Dòng cần tìm được tô đỏ"></div>` : ""}
  <div class="vanh" data-l="kinh-vanh" data-m="kinh-vanh" data-pad="14" data-alt="Kính lúp" ${hit ? 'data-em="teeter" data-emat="760"' : ""}><div class="zring"></div><div class="zhdl"></div></div></div>`;

function book(s, deck, ctx) {
  const bk = bookKit(s), id = s.id || "mo-sach", P = (s.props && s.props.length ? s.props : ["hot-beverage", "memo"]).slice(0, 2);
  const stops = [...(s.stops || []).filter(bk.has), s.find].filter((x, i, a) => x != null && a.indexOf(x) === i);
  if (!bk.has(s.find)) throw new Error(`book: "find" = ${s.find} không có trong rows của left / right`);
  const props = (first) => (first
    ? emo(ctx, P[0], 190, "left:930px;top:770px;rotate:-6deg", 'data-m="vat-1"') + emo(ctx, P[1], 170, "left:1700px;top:824px;rotate:10deg", 'data-m="vat-2"') + lensDesk(640, 912, 0.42, -70)
    : emo(ctx, P[0], 180, "left:34px;top:762px;rotate:-6deg", 'data-m="vat-1"') + emo(ctx, P[1], 170, "left:1716px;top:776px;rotate:10deg", 'data-m="vat-2"'));
  const open = (o = {}) => `<div class="mo" style="left:${MO[0]}px;top:${MO[1]}px;width:${2 * BW}px;height:${BH}px">${bk.parts("open", { wrapAt: MO, ...o })}</div>`;
  const sec = (cls, inner) => `<section class="s dark desk zcn ${cls}" data-type="book" data-title="${esc(plain(s.title || ""))}">${inner}</section>`;
  const out = [];
  out.push({ id, trans: null, html: sec("", `${s.kicker ? `<div class="kick" data-t>${f(s.kicker)}</div>` : ""}
  <h1 class="bh zan" data-t>${tx(s.title || "")}</h1>${s.sub ? `<p class="lead" data-t style="left:110px;top:610px;width:800px">${f(s.sub)}</p>` : ""}
  <div class="hint" data-t data-a="rise" data-at="900" data-em="pulse" data-emat="1700" style="left:110px;top:800px">${f(s.hint || "Bấm để mở sách")}</div>
  ${bk.parts("closed", { cx: 1440, cy: 500, k: 0.74, rot: -7 })}${props(true)}`) });
  const desk = `<div class="mat"></div>${props(false)}`;
  out.push({ id: id + "-mo1", trans: "morph", dur: 900, auto: 0, notes: "Tự chạy: sách dời ra giữa bàn.", html: sec("", desk + lensDesk(124, 420, 0.36, -70) + bk.parts("closed", { cx: OX + BW / 2, cy: OY })) });
  out.push({ id: id + "-mo2", trans: "morph", dur: 420, auto: 0, notes: "Tự chạy: bìa gập về gáy sách.", html: sec("", desk + lensDesk(124, 420, 0.36, -70) + bk.parts("fold")) });
  out.push({ id: id + "-mo3", trans: "morph", dur: 480, auto: 250, notes: "Tự chạy: trang trái mở ra.", html: sec("", desk + lensDesk(124, 420, 0.36, -70) + bk.parts("open")) });
  stops.forEach((r, k) => { const hit = k === stops.length - 1;
    out.push({ id: `${id}-soi${k + 1}`, trans: "morph", dur: k === 0 ? 900 : hit ? 800 : 650, auto: hit ? null : 290, notes: hit ? `Kính lúp dừng ở ${bk.lab} ${r}. Bấm để vào bài.` : "Tự chạy: kính lúp soi dần xuống.",
      html: sec("soi", `${desk}${open()}${hit ? `<div class="mo mo-do" data-prop style="left:${MO[0]}px;top:${MO[1]}px;width:${2 * BW}px;height:${BH}px;visibility:hidden">${bk.parts("open", { wrapAt: MO, flat: true, hit: r })}</div><div class="row hit do-dong" data-l="dong-do" data-m="do" data-prop data-a="wipe" data-at="220" data-dur="420" data-alt="Dòng cần tìm được tô đỏ"></div>` : ""}
  ${lensPage(r, hit)}
  <div class="nhan${hit ? " hit" : ""}" data-l="nhan-nen" data-m="nhan-nen" data-pad="12"><span data-t data-m="ten-bai">${esc(bk.lab)} ${esc(r)} · ${esc(bk.title[r])}</span></div>
  ${hit ? emo(ctx, "sparkles", 120, "left:1326px;top:22px;rotate:8deg", 'data-a="pop" data-at="620"') + `<div class="hint" data-t data-a="rise" data-at="1100" style="left:0;right:0;text-align:center;top:1022px">${f(s.found || "Đây rồi. Bấm để vào bài.")}</div>` : ""}`) }); });
  return { sections: out, book: bk };
}

// ───────────────────────── các cảnh một slide ─────────────────────────
const S1 = {};
S1.bigq = (s, deck, ctx) => { const L = (s.lines || [s.title || ""]).slice(0, 2), len = Math.max(...L.map((x) => plain(x).length), plain(s.box || "").length), fs = len <= 15 ? 186 : len <= 19 ? 150 : 122, lh = Math.round(fs * 1.18);
  return { cls: "dark", html: `<div class="cv" data-tay>${L.map((x, i) => `<div class="t1 zan" data-t style="top:${200 + i * lh}px;font-size:${fs}px">${f(x)}</div>`).join("")}
  ${s.box ? `<div class="tbox" data-l="hop-do" data-m="do" data-pad="24" style="top:${200 + L.length * lh + 26}px"><div class="zan" data-t style="font-size:${fs}px">${f(s.box)}</div></div>` : ""}
  ${s.emoji ? fly(ctx, s.emoji, 500, "left:1300px;top:230px;rotate:7deg", 'data-a="pop" data-at="200"') : ""}${s.emoji2 ? emo(ctx, s.emoji2, 230, "left:1190px;top:716px;rotate:-10deg", 'data-a="pop" data-at="450"') : ""}
  ${s.by ? `<div class="by0" data-t>${f(s.by)}</div>` : ""}</div>` }; };

S1.picks = (s, deck, ctx) => { const it = (s.items || []).slice(0, 3);
  return { cls: "light", html: `${head(s)}<div class="body" data-tay><div class="pk" style="--n:${it.length}">${it.map((x, i) => `<div class="card qc" data-l="the-${i + 1}" data-pad="36" ${x.go ? `data-go="${esc(x.go)}"` : ""} style="rotate:${[-1.4, 1, -1][i]}deg"><div class="zn zan" data-t>${esc(x.n || pad2(i + 1))}</div><div class="zq" data-t>${f(x.q || x.text)}</div>${x.go ? `<div class="go" data-t>${f(s.hint || "Bấm vào thẻ để xem câu trả lời")}</div>` : ""}
    ${x.emoji ? fly(ctx, x.emoji, 180, `right:26px;top:22px;rotate:${[5, -4, 6][i]}deg`, `data-a="pop" data-at="${350 + i * 170}"`, x.go ? `data-go="${esc(x.go)}"` : "") : ""}</div>`).join("")}</div></div>` }; };

S1.lawquote = (s, deck, ctx) => { const art = String(s.art ?? ""), fs = art.length <= 2 ? 400 : art.length === 3 ? 300 : 220;
  return { cls: "light", html: `${head(s)}<div class="body" data-tay><div class="lq">
  <div class="paper" data-l="to-giay" data-m="to-giay" data-pad="34"><div class="hl" data-l="but-vang" data-a="wipe" data-at="900" data-dur="520" data-alt="Nét bút đánh dấu"></div><div class="zph" data-t>${f(s.head || "")}</div><div class="pq" data-t>${esc(s.quote || "").replace(/\[([^\]]+)\]/g, "<b>$1</b>")}</div></div>
  ${art ? `<div class="aa zan" data-t>${esc(s.artLabel || "Điều")}</div><div class="ab zan" data-t data-a="slam" data-at="450" style="font-size:${fs}px">${esc(art)}</div>` : ""}
  ${s.stamp ? `<div class="stamp0" data-l="dau" data-pad="30" data-a="stamp" data-at="1450"><div class="zan" data-t>${esc(s.stamp)}</div></div>` : ""}</div></div>${note(s.source || s.note)}` }; };

// cột xếp bằng ô đơn vị: 5 ô một hàng, tối đa 9 hàng (45 ô) mỗi cột
S1.tiles = (s, deck, ctx) => { const C = (s.cols || []).slice(0, 3), BASE = 520, P = 57; let t0 = 420;
  const col = (c, k) => { const x = k * 580, n = Math.max(0, Math.min(45, Math.round(+c.n || 0))), dt = n > 12 ? Math.max(14, 620 / n) : 170, T = (v) => Math.round(start + v * dt), start = t0;
    const vals = n <= 6 ? Array.from({ length: n }, (_, i) => i + 1) : Array.from({ length: 6 }, (_, i) => Math.round(((i + 1) * n) / 6)), last = vals[vals.length - 1] ?? 0;
    t0 += n * dt + 320;
    return `<div class="numcard" style="left:${x + 310}px;top:${BASE - 250}px"></div>
    ${Array.from({ length: n }, (_, i) => `<i class="o" data-l="o-don-vi" ${c.morph ? `data-m="o-${i + 1}"` : ""} data-pad="6" data-a="pop" data-dur="170" data-at="${T(i)}" style="left:${x + (i % 5) * P}px;top:${BASE - 50 - Math.floor(i / 5) * P}px"></i>`).join("")}
    ${vals.slice(0, -1).map((v, i) => `<div class="zfr zan" data-l="dem" data-prop data-a="appear" data-at="${T(v)}" data-out="${T(vals[i + 1])}" style="left:${x + 310}px;top:${BASE - 250}px">${v}</div>`).join("")}
    <div class="plate" data-l="mat-so" data-a="appear" data-at="${T(last)}" data-pulse style="left:${x + 310}px;top:${BASE - 250}px"><div class="num zan" data-t>${esc(c.value ?? n)}</div><div class="unit" data-t>${f(c.unit || "")}</div></div>
    ${c.emoji ? emo(ctx, c.emoji, 140, `left:${x + 350}px;top:${BASE - 250 - 128}px;rotate:8deg`, `data-a="pop" data-at="${T(n) + 120}"`) : ""}
    <div class="clab" data-t style="left:${x}px;top:${BASE + 24}px">${f(c.label || "")}</div>`; };
  const ref = s.ref ? `<div class="paper nho" data-l="to-giay-nho" data-m="to-giay" data-pad="16" data-prop data-alt="${esc(plain(s.ref.head || "Trích điều luật"))}"><div class="zph">${esc(s.ref.head || "")}</div><div class="pq">${esc(s.ref.text || "").replace(/\[([^\]]+)\]/g, "<b>$1</b>")}</div></div>` : "";
  return { cls: "dark", html: `${head(s)}<div class="body" data-tay>${s.legend ? `<div class="leg" data-t>${f(s.legend)}</div>` : ""}<div class="tl0">${ref}${C.map(col).join("")}</div></div>${note(s.source || s.note)}` }; };

// dải N ngày: N ≤ 16 một hàng, ≤ 32 hai hàng
S1.strip = (s, deck, ctx) => { const n = Math.max(1, Math.min(32, Math.round(+s.n || 30))), per = n <= 16 ? n : Math.ceil(n / 2), P = per > 1 ? Math.min(113.4, 1600 / (per - 1)) : 0, X = (k) => Math.round((k % per) * P), Y = (k) => Math.floor(k / per) * 132, rows = Math.ceil(n / per), M = (s.marks || []).slice(0, 3);
  const tk = 650, dt = Math.min(70, 1700 / n), end = Math.round(tk + (n - 1) * dt);
  return { cls: "light", html: `${head(s)}<div class="body" data-tay>${s.lead ? `<div class="leg" data-t>${f(s.lead)}</div>` : ""}<div class="st0" style="height:${rows * 132 + 28 + (M.length ? 236 : 0)}px">
  ${Array.from({ length: n }, (_, k) => `<i class="o zlg" data-l="to-lich" data-m="o-${k + 1}" data-pad="8" data-prop style="left:${X(k)}px;top:${Y(k)}px"><b>${k + 1}</b></i>`).join("")}
  ${Array.from({ length: n - 1 }, (_, k) => `<i class="xong" data-l="da-qua" data-pad="4" data-a="pop" data-dur="150" data-at="${Math.round(tk + k * dt)}" style="left:${X(k) + 62}px;top:${Y(k) + 62}px"></i>`).join("")}
  <i class="o zlg do" data-l="to-cuoi" data-pad="8" data-prop data-a="pop" data-at="${end + 150}" data-pulse data-alt="Ngày thứ ${n}" style="left:${X(n - 1)}px;top:${Y(n - 1)}px"><b>${n}</b></i>
  ${M.map((m, i) => `<div class="card moc" data-l="moc-${i + 1}" data-pad="18" data-a="rise" data-at="${[300, Math.round((tk + end) / 2), end + 400][i]}" style="left:${i * 580}px;top:${rows * 132 + 28}px">${pic(ctx, m.emoji, 120)}<b data-t${i === M.length - 1 && M.length > 1 ? ' class="hl1"' : ""}>${f(m.head)}</b><span data-t>${f(m.text || "")}</span></div>`).join("")}
  </div></div>${note(s.source || s.note)}` }; };

S1.cases = (s, deck, ctx) => { const it = (s.items || []).slice(0, s.big ? 7 : 8), R = [-1.2, 1, -0.8, 1.4, 1, -1.3, 0.9, -1];
  return { cls: "dark", html: `${head(s)}<div class="body" data-tay><div class="cz">${it.map((x, i) => `<div class="cs" data-l="the-${esc(x.k || i + 1)}" data-pad="26" data-a="drop" data-at="${350 + i * 130}" style="rotate:${R[i]}deg"><span class="kk zan" data-t>${esc(x.k || i + 1)}</span>${pic(ctx, x.emoji, 112, "position:absolute;right:20px;top:16px")}<p data-t>${f(x.text)}</p></div>`).join("")}
  ${s.big ? `<div class="bigz"><div class="z1 zan" data-t data-a="slam" data-at="${350 + it.length * 130 + 200}">${esc(s.big.value)}</div><div class="z2" data-t data-a="rise" data-at="${350 + it.length * 130 + 450}">${f(s.big.label || "")}</div></div>` : ""}</div></div>${note(s.source || s.note)}` }; };

S1.chain = (s, deck, ctx) => { const c = s.cause || {}, st = s.stamp || {}, R = (s.results || []).slice(0, 3), E = (s.emojis || []).slice(0, 2);
  return { cls: "light", html: `${head(s)}<div class="body" data-tay><div class="ch0">
  <div class="cause" data-l="nguyen-nhan" data-pad="24" data-a="rise" data-at="350"><div class="za" data-t>${f(c.tag || "Tình huống")}</div><div class="b" data-t>${f(c.text || "")}</div></div>
  ${E.map((e, i) => emo(ctx, e, i ? 160 : 180, `left:${50 + i * 200}px;top:${330 + i * 14}px;rotate:${i ? 5 : -4}deg`, `data-a="pop" data-at="${520 + i * 120}"`)).join("")}
  <div class="zarw" data-l="mui-ten-1" data-pad="26" data-a="grow" data-at="850" data-dur="300" style="left:496px;top:126px;width:58px"></div>
  <div class="vio" data-l="dau-ket-luan" data-pad="34" data-a="stamp" data-at="1150"><div class="v1 zan" data-t>${tx(st.text || "")}</div>${st.sub ? `<div class="v2" data-t>${f(st.sub)}</div>` : ""}</div>
  <div class="zarw" data-l="mui-ten-2" data-pad="26" data-a="grow" data-at="1550" data-dur="300" style="left:968px;top:126px;width:50px"></div>
  ${R.map((r, i) => `<div class="card cq" data-l="he-qua-${i + 1}" data-pad="24" data-a="slide-r" data-at="${1800 + i * 190}">${pic(ctx, r.emoji, 104)}<div class="zt" data-t>${f(r.text)}</div>${r.ref ? `<div class="k0" data-t>${f(r.ref)}</div>` : ""}</div>`).join("")}
  </div></div>${note(s.source || s.note)}` }; };

S1.recap = (s, deck, ctx) => { const L = (s.lines || [s.title || ""]).slice(0, 2), C = (s.chips || []).slice(0, 3), B = (s.buttons || []).slice(0, 3);
  return { cls: "dark", html: `<div class="body rc0" data-tay><div class="zrl">${L.map((x) => `<div class="zan" data-t>${f(x)}</div>`).join("")}</div>
  ${s.emoji ? fly(ctx, s.emoji, 270, "right:170px;top:30px;rotate:7deg", 'data-a="pop" data-at="250"') : ""}${s.emoji2 ? emo(ctx, s.emoji2, 140, "right:120px;top:200px;rotate:-8deg", 'data-a="stamp" data-at="750"') : ""}
  ${C.length ? `<div class="rcs" style="--n:${C.length}">${C.map((c, i) => `<div class="zrc" data-l="nho-${i + 1}" data-pad="16" ${c.go ? `data-go="${esc(c.go)}"` : ""} data-a="rise" data-at="${450 + i * 160}"><div class="zn zan" data-t>${esc(c.n)}</div><div class="zd" data-t>${f(c.text)}</div></div>`).join("")}</div>` : ""}
  ${s.basis ? `<div class="cc"><div class="za" data-t>${f(s.basisLabel || "Căn cứ")}</div><div class="b" data-t>${f(s.basis)}</div></div>` : ""}
  ${B.length ? `<div class="bts">${B.map((b, i) => `<div class="btn${i ? " b2" : ""}" data-t ${b.go ? `data-go="${esc(b.go)}"` : ""}>${f(b.text)}</div>`).join("")}</div>` : ""}</div>` }; };

S1.toc = (s, deck) => { const it = (s.items || deck.slides.filter((x) => x.toc).map((x) => ({ go: x.id, text: x.toc }))).slice(0, 10);
  return { cls: "dark", html: `${head(s)}<div class="body" data-tay><div class="tc">${it.map((x, i) => `<div class="tci"><div class="zth" data-l="anh-${esc(x.go)}" data-pad="16" data-go="${esc(x.go)}" data-alt="${esc(plain(x.text))}" data-a="rise" data-at="${350 + i * 70}"><img data-thumb="${esc(x.go)}" alt=""></div><div class="thc" data-t data-go="${esc(x.go)}">${pad2(i + 1)} · ${f(x.text)}</div></div>`).join("")}</div></div>` }; };

// trắc nghiệm bấm đáp án: 3 slide (hỏi · sai · đúng)
function quizgo(s, deck, ctx, { i, n, next }) {
  const id = s.id || `quiz-${i + 1}`, O = (s.options || []).slice(0, 4), W = s.wrong || {}, R = s.right || {}, L = "ABCD";
  const CONF = [[980, 150, "var(--amber)", 18, 0], [1130, 520, "#fff", -24, 1], [1240, 130, "var(--red)", 40, 0], [1300, 640, "var(--ink)", 12, 0], [1500, 600, "var(--amber)", -30, 1], [1690, 560, "#fff", 28, 0], [1800, 240, "var(--red)", -16, 1], [1760, 760, "var(--amber)", 50, 0], [1560, 820, "#fff", -40, 0], [1380, 880, "var(--ink)", 22, 1], [1180, 800, "var(--red)", -12, 0], [1830, 930, "#fff", 34, 1], [1060, 330, "var(--ink)", -36, 0], [1620, 90, "#fff", 10, 1]];
  kit.reset();
  const q = wrap({ cls: "dark", html: `${head({ kicker: s.kicker })}<h2 class="h ${plain(s.title || s.q || "").length > 54 ? "sm" : ""}" style="max-width:1340px" ${inn()}>${f(s.title || s.q)}</h2><div class="body" data-tay><div class="zqz">${O.map((o, k) => `<div class="zop" data-l="dap-an-${L[k]}" data-pad="20" data-go="${id}-${o.ok ? "dung" : "sai"}" data-a="rise" data-at="${450 + k * 120}"><div class="zl zan" data-t>${L[k]}</div><div class="zx" data-t>${f(o.text)}</div></div>`).join("")}</div>
  <div class="hint" data-t style="margin-top:34px">${f(s.hint || "Bấm vào một đáp án")}</div></div>${emo(ctx, "red-question-mark", 230, "position:absolute;right:120px;top:150px;rotate:10deg;z-index:3", 'data-a="pop" data-at="300" data-em="teeter" data-emat="1000"')}` }, s, deck, i, n);
  const fb = (cls, big, text, btn, go, extra) => `<section class="s ${cls} zcn" data-type="quizgo" data-title="${esc(big)}"><div class="zbig zan" data-t data-a="slam">${f(big)}</div>${extra}<div class="exp" data-t>${f(text || "")}</div><div class="btn" data-t data-go="${esc(go)}" style="left:110px;top:860px">${f(btn)}</div></section>`;
  return [
    { id, html: q, tu: true, noclick: true },
    { id: id + "-sai", html: fb("red", W.title || "Chưa đúng", W.hint || W.text, W.button || "Thử lại", id, emo(ctx, "thinking-face", 360, "left:1380px;top:230px;rotate:8deg", 'data-a="pop" data-at="250" data-em="teeter" data-emat="800"')), trans: "fade", noclick: true, notes: "Slide phản hồi khi chọn sai. Bấm nút để quay về câu hỏi." },
    { id: id + "-dung", html: fb("zok", R.title || "Chính xác!", R.text, R.button || "Tiếp tục", s.next || next || id, CONF.map(([x, y, c, r, t], k) => `<i class="cf${t ? " tr" : ""}" data-l="hoa-giay" data-pad="4" data-a="fall" data-at="${150 + k * 70}" data-dur="${780 + (k % 4) * 110}" style="left:${x}px;top:${y}px;background:${c};rotate:${r}deg"></i>`).join("") + emo(ctx, "party-popper", 380, "left:1360px;top:210px;rotate:-6deg", 'data-a="pop" data-at="200" data-pulse')), trans: "fade", notes: "Slide phản hồi khi chọn đúng." },
  ];
}

/**
 * Dựng một slide deck.json thuộc loại cảnh thành một hay nhiều slide PowerPoint.
 * st = trạng thái đi qua cả deck: { book, tocId, afterBook, prev (hình dán của slide trước) } — dung.js giữ và truyền lại.
 */
function render(s, deck, ctx, { i, n, st }) {
  const next = deck.slides[i + 1] ? deck.slides[i + 1].id || `s${i + 2}` : null;
  ctx.prev = st.prev || new Set(); ctx.now = new Set();
  let out;
  if (s.type === "book") { const r = book(s, deck, ctx); st.book = r.book; st.afterBook = true; out = r.sections; }
  else if (s.type === "quizgo") out = quizgo(s, deck, ctx, { i, n, next });
  else { kit.reset(); const o = S1[s.type](s, deck, ctx); out = [{ id: s.id || `s${i + 1}`, html: wrap(o, s, deck, i, n), tu: true }]; }
  st.prev = ctx.now;
  return out;
}

// CSS của các cảnh — mọi màu đi qua biến của stage.css nên bốn bảng màu (son, luc, lam, nau) áp được cho cả cảnh
const css = `
/* ── khung của cảnh ── */
.zan { font-family: var(--fd); font-weight: 400; text-transform: uppercase; letter-spacing: 0; }
.s.zcn { display: block; padding: 0; } .s.zcn > * { position: absolute; }
.s > .cv { position: absolute; inset: 0; z-index: 2; } .cv > * { position: absolute; }
.s.zok { background: var(--green); color: #fff; --fg: #fff; --hl: var(--amber); }
.emo { position: absolute; } .emo img, .stk { display: block; width: 100%; height: 100%; filter: drop-shadow(5px 0 0 #fff) drop-shadow(-5px 0 0 #fff) drop-shadow(0 5px 0 #fff) drop-shadow(0 -5px 0 #fff) drop-shadow(9px 11px 0 rgba(12,18,34,.42)); }
.leg { font: 600 24px/1.3 var(--fb); color: var(--mut); margin-bottom: 12px; }
.hint { font: 800 26px/1.3 var(--fb); color: var(--amber); }
.btn { display: inline-block; background: var(--ink); color: var(--paper); font: 800 34px/1.2 var(--fb); padding: 22px 44px; box-shadow: 10px 10px 0 rgba(0,0,0,.35); } .s.red .btn, .s.zok .btn { background: #fff; color: var(--ink); }
.zml { position: absolute; right: 440px; top: 48px; font: 800 20px/1 var(--fb); color: var(--fg); z-index: 46; }
/* ── book: bàn làm việc, sách, kính lúp ── */
.desk { background: radial-gradient(900px 620px at 22% -6%, rgba(246,185,59,.3), transparent 64%), linear-gradient(180deg, var(--ink-2), var(--ink) 70%); }
.desk .mat { left: 150px; top: 30px; width: 1620px; height: 950px; border-radius: 28px; background: rgba(255,255,255,.035); box-shadow: inset 0 0 0 3px rgba(246,185,59,.2), inset 0 0 0 14px rgba(255,255,255,.02); }
.kick { left: 110px; top: 150px; background: var(--red); color: #fff; font: 800 24px/1.3 var(--fb); padding: 10px 22px; }
.bh { left: 110px; top: 250px; font-size: 132px; line-height: 1.14; width: 1000px; } .lead { font: 500 38px/1.45 var(--fb); opacity: .9; }
.cv0, .bd, .zpg { position: absolute; }
.cv0 { width: ${BW}px; height: ${BH}px; border-radius: 6px 16px 16px 6px; background: linear-gradient(90deg, #6f160f 0 34px, var(--red-d) 34px 44px, var(--red) 44px); box-shadow: 14px 0 0 -4px #efe5cf, 18px 0 0 -4px #cdbf9f, 24px 30px 0 rgba(0,0,0,.42); }
.cv0::after { content: ""; position: absolute; inset: 44px 40px 44px 84px; border: 4px solid #f1c66a; outline: 2px solid rgba(241,198,106,.5); outline-offset: 9px; }
.cv0 > div { position: absolute; left: 110px; right: 66px; text-align: center; }
.cv0 .zbt { top: 150px; font-size: 118px; line-height: 1.14; color: #f6d27a; } .cv0 .zby { top: 470px; font-size: 190px; line-height: 1; color: rgba(246,210,122,.28); } .cv0 .bs { bottom: 126px; font: 800 30px/1.4 var(--fb); letter-spacing: .14em; color: #f1c66a; }
.bd { width: ${BW}px; height: ${BH}px; background: var(--red-d); box-shadow: inset 0 0 0 4px rgba(0,0,0,.34); } .bd.zr { border-radius: 0 12px 12px 0; box-shadow: inset 0 0 0 4px rgba(0,0,0,.34), 24px 34px 0 rgba(0,0,0,.4); } .bd.zl { border-radius: 12px 0 0 12px; box-shadow: inset 0 0 0 4px rgba(0,0,0,.34), 0 34px 0 rgba(0,0,0,.4); }
.zpg { text-wrap: wrap; width: ${PW}px; height: ${PH}px; padding: 34px 52px 40px; background: #f6efdd; color: #1a2330; }
.zpg.zl { background: linear-gradient(90deg, transparent 86%, rgba(26,35,48,.13)), #f6efdd; box-shadow: -4px 0 0 #e7dcc0, -8px 0 0 #d6c8a6; } .zpg.zr { background: linear-gradient(270deg, transparent 86%, rgba(26,35,48,.13)), #f6efdd; box-shadow: 4px 0 0 #e7dcc0, 8px 0 0 #d6c8a6; }
.zpg .hd0 { font: 500 15px/1 var(--fb); letter-spacing: .08em; text-transform: uppercase; color: #9a917d; margin-bottom: 26px; }
.zpg .zch { font: 800 19px/1.2 var(--fb); letter-spacing: .16em; text-transform: uppercase; color: var(--red-d); } .zpg .cht { font-size: 48px; line-height: 1.2; margin: 4px 0 20px; }
.zpg .muc { font: 800 24px/1.3 var(--fb); color: var(--red-d); border-bottom: 3px solid #1a2330; padding-bottom: 10px; margin-bottom: 12px; }
.row { font: 500 21px/1.36 var(--fb); padding: 8px 12px; margin: 0 -12px; border-radius: 4px; color: #1a2330; } .row b { font-weight: 800; } .row.hit { background: var(--red); color: #fff; } .do-dong { margin: 0; }
.zpg .pn { position: absolute; bottom: 22px; font: 800 16px/1 var(--fb); color: #8b8371; } .zpg.zl .pn { left: 52px; } .zpg.zr .pn { right: 52px; }
.zpg .rib { position: absolute; right: 86px; top: 0; width: 34px; height: 96px; background: var(--red); clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%); }
.mo { position: absolute; } .mo.mini { z-index: 46; }
.lens { width: 0; height: 0; } .lens > * { position: absolute; }
.lens .nen, .lens .glass { left: -180px; top: -180px; width: 360px; height: 360px; border-radius: 50%; }
.lens .nen { background: #f6efdd; box-shadow: 0 16px 0 rgba(0,0,0,.28); } .lens .nen.ban { background: rgba(170,210,245,.26); box-shadow: none; }
.lens .glass { overflow: hidden; background: #f6efdd; }
.lens .vanh { left: -320px; top: -320px; width: 640px; height: 640px; }
.lens .zring { position: absolute; left: 140px; top: 140px; width: 360px; height: 360px; border-radius: 50%; border: 16px solid var(--ink-2); box-shadow: inset 0 0 0 5px var(--amber), inset 18px 22px 44px rgba(255,255,255,.5), inset -10px -12px 26px rgba(12,18,34,.12); }
.lens .zhdl { position: absolute; left: 432px; top: 432px; width: 54px; height: 190px; border-radius: 27px; background: linear-gradient(90deg, var(--ink-2), var(--ink-3)); rotate: -45deg; transform-origin: 50% 0; box-shadow: 0 8px 0 rgba(0,0,0,.25); }
.nhan { left: 50%; top: 940px; translate: -50% 0; white-space: nowrap; } .nhan span { display: block; background: var(--paper); color: var(--ink); font: 800 30px/1.3 var(--fb); padding: 13px 30px; box-shadow: 8px 8px 0 rgba(0,0,0,.4); } .nhan.hit span { background: var(--red); color: #fff; }
/* ── bigq ── */
.t1 { left: 110px; line-height: 1.12; white-space: nowrap; } .t1 + .t1 { color: var(--amber); }
.tbox { left: 98px; background: var(--red); padding: 0 26px; rotate: -2deg; box-shadow: 14px 14px 0 rgba(0,0,0,.35); } .tbox div { line-height: 1.14; color: #fff; white-space: nowrap; }
.by0 { left: 110px; top: 950px; font: 500 28px/1.3 var(--fb); opacity: .85; }
/* ── picks ── */
.pk { display: grid; grid-template-columns: repeat(var(--n), 1fr); gap: 58px; padding: 26px 0 14px; }
.qc { position: relative; height: 540px; padding: 34px 38px; } .qc::before { content: ""; position: absolute; left: 50%; top: -26px; width: 150px; height: 44px; translate: -50% 0; background: rgba(246,185,59,.78); rotate: -3deg; }
.qc .zn { font-size: 110px; line-height: 1; color: var(--red); } .qc .zq { margin-top: 128px; font: 800 44px/1.25 var(--fb); } .qc .go { position: absolute; left: 38px; bottom: 28px; font: 800 22px/1.3 var(--fb); color: var(--red-d); }
/* ── lawquote ── */
.lq { position: relative; height: 556px; } .lq > * { position: absolute; }
.paper { text-wrap: wrap; left: 0; top: 14px; width: 1040px; background: #fffdf4; color: var(--ink); border: 5px solid var(--ink); box-shadow: 16px 16px 0 var(--ink); padding: 46px 56px 54px; rotate: -1.5deg; }
.paper .zph { position: relative; font: 800 22px/1.2 var(--fb); letter-spacing: .1em; color: #6c6452; border-bottom: 4px solid var(--ink); padding-bottom: 14px; margin-bottom: 28px; }
.paper .pq { position: relative; font: 600 48px/1.5 var(--fb); } .paper .pq b { font-weight: 800; }
.paper .hl { position: absolute; background: rgba(246,185,59,.88); border-radius: 4px; }
.aa { left: 1164px; top: -22px; font-size: 104px; line-height: 1.1; } .ab { left: 1150px; top: 74px; line-height: 1.05; color: var(--red); }
.stamp0 { left: 1390px; top: 438px; rotate: -9deg; border: 8px solid var(--red-d); background: rgba(255,253,244,.9); padding: 6px 26px; } .stamp0 div { font-size: 78px; line-height: 1.16; color: var(--red-d); white-space: nowrap; }
/* ── tiles ── */
.tl0 { position: relative; height: 600px; } .tl0 > * { position: absolute; }
.o { position: absolute; width: 50px; height: 50px; border-radius: 8px; background: linear-gradient(var(--red) 0 14px, #fff7e6 14px); box-shadow: 0 5px 0 rgba(0,0,0,.35); }
.numcard, .plate, .zfr { width: 220px; height: 250px; border-radius: 10px; } .numcard { background: var(--ink-2); border: 4px solid var(--ink-3); }
.plate { background: var(--ink-2); border: 4px solid var(--amber); text-align: center; } .zfr { text-align: center; font-size: 150px; line-height: 190px; color: rgba(246,185,59,.6); }
.plate .num { font-size: 150px; line-height: 190px; color: var(--amber); } .plate .unit { font: 800 25px/1.2 var(--fb); margin-top: -2px; color: var(--paper); }
.clab { width: 540px; font: 800 27px/1.3 var(--fb); border-top: 5px solid var(--amber); padding-top: 12px; }
.paper.nho { left: auto; right: 0; top: -6px; width: 520px; padding: 14px 22px 16px; border-width: 4px; box-shadow: 8px 8px 0 rgba(0,0,0,.45); rotate: 1.5deg; } .paper.nho .zph { font-size: 14px; border-bottom-width: 3px; padding-bottom: 7px; margin-bottom: 8px; } .paper.nho .pq { font: 600 21px/1.4 var(--fb); } .paper.nho .pq b { background: rgba(246,185,59,.88); padding: 0 5px; }
/* ── strip ── */
.st0 { position: relative; } .st0 > * { position: absolute; }
.o.zlg { width: 100px; height: 100px; border-radius: 12px; background: linear-gradient(var(--red) 0 27px, #fffaf0 27px); box-shadow: 0 7px 0 rgba(12,18,34,.3); text-align: center; }
.o.zlg::before, .o.zlg::after { content: ""; position: absolute; top: 8px; width: 11px; height: 11px; border-radius: 50%; background: #fff7e6; } .o.zlg::before { left: 22px; } .o.zlg::after { right: 22px; }
.o.zlg b { display: block; margin-top: 27px; font: 400 50px/70px var(--fd); color: var(--ink); } .o.zlg.do { background: linear-gradient(var(--ink) 0 27px, var(--red) 27px); } .o.zlg.do b { color: #fff; }
.xong { width: 46px; height: 46px; border-radius: 50%; background: var(--green); border: 4px solid #fff; box-shadow: 0 4px 0 rgba(12,18,34,.3); } .xong::after { content: ""; position: absolute; left: 13px; top: 6px; width: 11px; height: 20px; border: solid #fff; border-width: 0 5px 5px 0; rotate: 45deg; }
.moc { width: 540px; min-height: 220px; padding: 22px 26px 22px 164px; } .moc .stk { position: absolute; left: 22px; top: 24px; }
.moc b { display: block; font: 400 56px/1.15 var(--fd); text-transform: uppercase; } .moc b.hl1 { color: var(--red); } .moc span { display: block; font: 600 26px/1.35 var(--fb); margin-top: 6px; }
/* ── cases ── */
.cz { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px 33px; padding: 8px 0; }
.cs { position: relative; height: 272px; background: #fffaf0; color: var(--ink); border: 5px solid var(--ink); box-shadow: 12px 12px 0 rgba(0,0,0,.45); padding: 20px 24px; }
.cs .kk { display: inline-block; min-width: 64px; height: 64px; padding: 0 12px; background: var(--red); color: #fff; font-size: 42px; line-height: 64px; text-align: center; text-transform: none; } .cs p { position: absolute; left: 24px; right: 24px; bottom: 20px; font: 800 27px/1.3 var(--fb); }
.bigz { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; } .z1 { font-size: 250px; line-height: 1; color: var(--amber); } .z2 { font: 800 30px/1.3 var(--fb); }
/* ── chain ── */
.ch0 { position: relative; height: 540px; } .ch0 > * { position: absolute; }
.cause { left: 0; top: 10px; width: 470px; background: var(--ink); color: var(--paper); padding: 34px 36px 38px; box-shadow: 14px 14px 0 var(--red); } .cause .za { font: 800 20px/1.2 var(--fb); letter-spacing: .1em; color: var(--amber); } .cause .b { font: 800 40px/1.3 var(--fb); margin-top: 12px; }
.zarw { height: 14px; background: var(--ink); } .zarw::after { content: ""; position: absolute; right: -4px; top: -17px; border: 24px solid transparent; border-left: 34px solid var(--ink); border-right: 0; }
.vio { left: 610px; top: 10px; rotate: -6deg; border: 9px solid var(--red-d); background: rgba(255,253,244,.92); padding: 6px 24px 10px; text-align: center; } .vio .v1 { font-size: 74px; line-height: 1.14; color: var(--red-d); white-space: nowrap; } .vio .v2 { font: 800 22px/1.2 var(--fb); color: var(--red-d); }
.cq { left: 1050px; width: 650px; padding: 22px 28px 24px 146px; min-height: 150px; } .cq:nth-of-type(1) { top: 0; } .cq .zt { font: 800 30px/1.3 var(--fb); } .cq .k0 { font: 600 22px/1.3 var(--fb); color: var(--red-d); margin-top: 8px; } .cq .stk { position: absolute; left: 20px; top: 18px; }
/* ── quizgo ── */
.zqz { display: grid; grid-template-columns: 1fr 1fr; gap: 40px 48px; margin-top: 30px; }
.zop { position: relative; height: 164px; background: var(--ink-2); border: 5px solid var(--ink-3); box-shadow: 12px 12px 0 rgba(0,0,0,.45); } .zop .zl { position: absolute; left: 0; top: 0; width: 154px; height: 154px; background: var(--amber); color: var(--ink); font-size: 92px; line-height: 154px; text-align: center; } .zop .zx { position: absolute; left: 190px; right: 20px; top: 50px; font: 800 44px/1.2 var(--fb); }
.zbig { left: 110px; top: 250px; font-size: 230px; line-height: 1.1; white-space: nowrap; } .exp { left: 110px; top: 560px; width: 1080px; font: 600 40px/1.45 var(--fb); }
.cf { width: 26px; height: 44px; border-radius: 4px; } .cf.tr { width: 34px; height: 34px; border-radius: 50%; }
/* ── recap ── */
.rc0 { justify-content: flex-start; padding-top: 6px; } .rc0 .emo { z-index: 3; }
.zrl div { font-size: 150px; line-height: 1.16; white-space: nowrap; } .zrl div + div { color: var(--amber); }
.rcs { display: grid; grid-template-columns: repeat(var(--n), 1fr); gap: 46px; margin-top: 30px; }
.zrc { height: 196px; background: var(--ink-2); border: 4px solid var(--amber); box-shadow: 10px 10px 0 rgba(0,0,0,.45); padding: 14px 24px; } .zrc .zn { font-size: 84px; line-height: 1.1; color: var(--amber); white-space: nowrap; } .zrc .zd { font: 800 23px/1.3 var(--fb); margin-top: 6px; }
.cc { margin-top: 44px; width: 1250px; border-top: 5px solid var(--amber); padding-top: 14px; } .cc .za { font: 800 22px/1.2 var(--fb); letter-spacing: .1em; color: var(--amber); } .cc .b { font: 500 25px/1.45 var(--fb); margin-top: 8px; }
.bts { display: flex; gap: 22px; margin-top: 26px; } .bts .btn { font-size: 28px; padding: 16px 34px; background: var(--amber); color: var(--ink); } .bts .btn.b2 { background: var(--paper); }
/* ── toc ── */
.tc { display: grid; grid-template-columns: repeat(5, 1fr); gap: 44px 30px; }
.zth { width: 100%; aspect-ratio: 16 / 9; border: 4px solid var(--paper); box-shadow: 10px 10px 0 rgba(0,0,0,.45); overflow: hidden; background: var(--ink-2); } .zth img { width: 100%; height: 100%; display: block; object-fit: cover; }
.thc { margin-top: 22px; font: 800 22px/1.25 var(--fb); }
`;

// chạy trong trang sau khi font nạp xong: đặt kính lúp, dòng đỏ, nét bút; xếp các thẻ hệ quả
const script = `
hinhKhiSanSang(() => {
  document.querySelectorAll("section.soi").forEach((S) => {
    const mo = S.querySelector(".mo"), lens = S.querySelector(".lens"), row = mo.querySelector('[data-r="' + lens.dataset.row + '"]');
    const s0 = S.getBoundingClientRect(), a = mo.getBoundingClientRect(), r = row.getBoundingClientRect();
    const fx = Math.round(r.left - a.left + 118), fy = Math.round(r.top - a.top + Math.min(r.height / 2, 30));   // tâm kính ở đầu dòng; làm tròn để kính ở mọi slide là cùng một ảnh
    lens.style.left = (a.left - s0.left + fx) + "px"; lens.style.top = (a.top - s0.top + fy) + "px";
    const d = S.querySelector(".do-dong"); if (d) { d.innerHTML = row.innerHTML; d.style.left = (r.left - s0.left) + "px"; d.style.top = (r.top - s0.top) + "px"; d.style.width = r.width + "px"; }
    lens.querySelectorAll(".glass").forEach((g) => hinhCuaSo(S, g, fx, fy));
  });
  document.querySelectorAll(".paper .hl").forEach((h) => { const b = h.parentElement.querySelector(".pq b"), q = b && b.closest(".pq"); if (!b) { h.remove(); return; }
    h.style.left = (q.offsetLeft + b.offsetLeft - 8) + "px"; h.style.top = (q.offsetTop + b.offsetTop + 9) + "px"; h.style.width = (b.offsetWidth + 16) + "px"; h.style.height = (b.offsetHeight - 14) + "px"; });
  document.querySelectorAll(".ch0").forEach((c) => { let y = 0; c.querySelectorAll(".cq").forEach((q) => { q.style.top = y + "px"; y += q.offsetHeight + 34; }); });
});`;

module.exports = { TYPES, render, css, script, miniBook };
