// BIỂU ĐỒ của tầng hình ảnh — vẽ SVG cho `chart` (chuyển đủ tính năng của tầng Office cũ, 11/2026):
//   kind: column (năm trên trục ngang; value2 + series = chuỗi thứ hai chồng / đứng cạnh; bands = dải giai đoạn; số âm đi xuống)
//         bar (so độ lớn giữa các nhóm) · line (1–2 chuỗi) · step (giữ nguyên rồi nhảy nấc) · waterfall (cộng / trừ ra số cuối, total = cột tổng)
//         gantt (from / to là số ngày / tháng từ một mốc) · progress (0–100, target = vạch mục tiêu) · donut (≤ 4 lát) · slope (trước → sau) · span (giai đoạn theo ngày)
//   items[].why — nguyên nhân NGAY TẠI năm đó (chỉ column, tối đa 4): số tròn trên cột + hàng thẻ lý do (hộp chữ thật) dưới biểu đồ
//   items[].hatch — gạch chéo = số chưa chắc / khác phạm vi / ước tính (ghi nghĩa ở note) · focus · tone: bad
//   annotate { item, text } — vòng khoanh + mũi tên cong viết tay chỉ vào MỘT cột / thanh (perfect-freehand, MIT)
// Màu chỉ dùng bảng gốc (#0c1222 mực, #e2402a xấu, #f6b93b nhấn, #2c9566 tốt, #5b5443 chữ phụ) để bảng màu / da đổi được ở một chỗ.
const { handMarks } = require("../engine/codeart");
const INK = "#0c1222", BAD = "#e2402a", HL = "#f6b93b", GOOD = "#2c9566", MUT = "#5b5443", PAPER = "#f4eddc";
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const plain = (s) => String(s ?? "").replace(/[[\]]/g, "");
const num = (v) => (typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/\./g, "").replace(",", ".")));
const fmt = (v) => { const r = Math.round(v * 100) / 100; return String(r).replace(".", ","); };
const dmy = (d) => { const m = String(d).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/); return m ? +m[3] + (+m[2] - 1) / 12 + (+m[1] - 1) / 365 : parseFloat(String(d).match(/\d{4}/)?.[0] ?? NaN); };
const HATCH = `<defs><pattern id="gc" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="${PAPER}"/><line x1="0" y1="0" x2="0" y2="16" stroke="${INK}" stroke-width="6" stroke-opacity=".55"/></pattern><pattern id="gcb" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="${PAPER}"/><line x1="0" y1="0" x2="0" y2="16" stroke="${BAD}" stroke-width="6" stroke-opacity=".7"/></pattern></defs>`;
const fillOf = (it, v) => (it.hatch ? `url(#${it.tone === "bad" || v < 0 ? "gcb" : "gc"})` : it.tone === "bad" || v < 0 ? BAD : it.focus ? HL : it.tone === "good" ? GOOD : INK);
const dash = (it) => (it.hatch ? ` stroke-dasharray="14 9"` : "");
const T = (x, y, t, o = {}) => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${o.a || "middle"}" font-size="${o.fs || 26}" font-weight="${o.fw || 700}" fill="${o.c || INK}"${o.it ? ' font-style="italic"' : ""}>${esc(plain(t))}</text>`;

// vòng khoanh + mũi tên + câu viết tay; box = {x,y,w,h} của cột / thanh, đặt câu ở phía còn trống
function chuThich(box, text, W, H, ngang) {
  if (!box || !text) return "";
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2, rx = box.w / 2 + 22, ry = Math.max(box.h / 2 + 18, 34);
  // thanh ngang: câu đặt DƯỚI thanh (phía phải đã có số); cột: câu đặt phía trên, lệch sang bên còn trống
  const left = ngang ? false : cx > W * 0.55, tx = ngang ? Math.min(W - 340, Math.max(40, box.x + 20)) : left ? Math.max(40, cx - rx - 330) : Math.min(W - 330, cx + rx + 40), ty = ngang ? Math.min(H - 10, box.y + box.h + ry + 40) : Math.max(30, box.y - 70);
  const g = handMarks([{ kind: "ring", x: cx / 100, y: cy / 100, rx: rx / 100, ry: ry / 100 }, { kind: "arrow", x1: (left ? tx + 300 : tx + 10) / 100, y1: (ty + 12) / 100, x2: (left ? cx - rx + 6 : cx + rx - 6) / 100, y2: (cy - ry * 0.6) / 100, bend: 0.3 }], BAD.slice(1), 5);
  return `<g>${g}</g>${T(left ? tx + 300 : tx, ty, text, { a: left ? "end" : "start", fs: 30, fw: 700, c: BAD, it: true })}`;
}

function cot(s, W, H) {
  const it = s.items || [], two = it.some((x) => x.value2 != null), stack = s.stack !== false, base = s.base != null ? +s.base : 0;
  const tops = it.map((x) => (two && stack ? num(x.value) + (num(x.value2) || 0) : Math.max(num(x.value), num(x.value2) || -Infinity)));
  const lo = Math.min(base, ...it.map((x) => num(x.value))), hi = Math.max(base, ...tops), top = 64, bot = H - 64, Y = (v) => bot - (v - lo) / ((hi - lo) || 1) * (bot - top), bw = (W - 40) / it.length;
  let g = "", box = [];
  for (const b of s.bands || []) { const i0 = it.findIndex((x) => String(x.label) === String(b.from)), i1 = it.findIndex((x) => String(x.label) === String(b.to)); if (i0 < 0 || i1 < 0) continue;
    g += `<rect x="${20 + i0 * bw}" y="${top - 46}" width="${(i1 - i0 + 1) * bw}" height="${bot - top + 46}" fill="${INK}" fill-opacity=".07"/>${T(20 + (i0 + i1 + 1) / 2 * bw, top - 18, b.label, { fs: 24, fw: 800, c: BAD })}`; }
  const y0 = Y(Math.max(lo, Math.min(hi, base < 0 ? 0 : base)));
  let whyN = 0;
  it.forEach((x, i) => { const v = num(x.value), cx = 20 + i * bw, w2 = two && !stack ? bw * 0.34 : bw * 0.62, x1 = cx + (bw - (two && !stack ? w2 * 2 + 6 : w2)) / 2;
    const ya = Y(Math.max(v, 0 > lo ? 0 : lo)), yb = Y(Math.min(v, 0 > lo ? 0 : lo)), yz = v >= 0 ? Y(v) : Y(Math.max(0, lo)), h = Math.abs(Y(v) - Y(Math.max(lo, Math.min(0, hi)) > lo ? Math.max(lo, 0) : lo));
    const r1 = { x: x1, y: Math.min(Y(v), Y(Math.max(lo, 0))), w: w2, h: Math.max(4, Math.abs(Y(v) - Y(Math.max(lo, 0)))) };
    g += `<rect x="${r1.x}" y="${r1.y}" width="${r1.w}" height="${r1.h}" fill="${fillOf(x, v)}" stroke="${x.hatch ? (v < 0 || x.tone === "bad" ? BAD : INK) : "none"}" stroke-width="3"${dash(x)}/>`;
    let topY = r1.y;
    if (two) { const v2 = num(x.value2) || 0, r2 = stack ? { x: x1, y: Y(v + v2), w: w2, h: Math.max(0, Y(v) - Y(v + v2)) } : { x: x1 + w2 + 6, y: Math.min(Y(v2), Y(Math.max(lo, 0))), w: w2, h: Math.abs(Y(v2) - Y(Math.max(lo, 0))) };
      g += `<rect x="${r2.x}" y="${r2.y}" width="${r2.w}" height="${r2.h}" fill="${GOOD}" fill-opacity=".85"/>`; topY = Math.min(topY, r2.y);
      if (x.display2 && !stack) g += T(r2.x + r2.w / 2, r2.y - 12, x.display2, { fs: it.length > 8 ? 20 : 24 }); }
    const lab = x.display ?? fmt(v), fs = it.length > 8 ? 24 : 32;
    g += v < 0 ? T(cx + bw / 2, r1.y + r1.h + fs + 6, lab, { fs, fw: 800, c: BAD }) : T(cx + bw / 2, topY - 14, lab, { fs, fw: 800, c: x.tone === "bad" ? BAD : INK });
    if (x.why && whyN < 4) { whyN++; const ny = (v < 0 ? r1.y + r1.h + fs + 20 : topY - fs - 38); g += `<rect x="${cx + bw / 2 - 19}" y="${ny - 19}" width="38" height="38" fill="${INK}"/>${T(cx + bw / 2, ny + 10, String(whyN), { fs: 26, fw: 800, c: PAPER })}`; }
    g += T(cx + bw / 2, H - 22, x.label, { fs: it.length > 8 ? 22 : 26, fw: x.focus ? 800 : 600, c: x.focus ? INK : MUT });
    box[i] = r1; });
  g = `<line x1="10" x2="${W - 10}" y1="${Y(Math.max(lo, 0))}" y2="${Y(Math.max(lo, 0))}" stroke="${INK}" stroke-width="5"/>` + g;
  if (base) g += T(14, bot + 8, `${fmt(base)}`, { a: "start", fs: 20, fw: 600, c: MUT });
  return { svg: g, box };
}

function duong(s, W, H, step) {
  const it = s.items || [], two = it.some((x) => x.value2 != null), vals = it.flatMap((x) => [num(x.value), two ? num(x.value2) : NaN]).filter((v) => !isNaN(v));
  const base = s.base != null ? +s.base : Math.min(0, ...vals), hi = Math.max(...vals), top = 70, bot = H - 64, L = 30, R = W - 30, X = (i) => L + (i + 0.5) * (R - L) / it.length, Y = (v) => bot - (v - base) / ((hi - base) || 1) * (bot - top);
  let g = `<line x1="10" x2="${W - 10}" y1="${bot}" y2="${bot}" stroke="${INK}" stroke-width="5"/>`, box = [];
  const path = (k, col, w) => { let d = ""; it.forEach((x, i) => { const v = num(k ? x.value2 : x.value); if (isNaN(v)) return; const px = X(i), py = Y(v);
    if (!d) d = `M${px} ${py}`; else if (step) { const pv = num(k ? it[i - 1].value2 : it[i - 1].value); d += ` L${px - (R - L) / it.length / 2} ${Y(pv)} L${px - (R - L) / it.length / 2} ${py} L${px} ${py}`; } else d += ` L${px} ${py}`; });
    return `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linejoin="round"/>`; };
  if (two) g += path(1, GOOD, 6);
  g += path(0, INK, 8);
  it.forEach((x, i) => { const v = num(x.value), px = X(i), py = Y(v), r = x.focus ? 16 : 11;
    g += `<circle cx="${px}" cy="${py}" r="${r}" fill="${x.focus ? HL : x.tone === "bad" ? BAD : INK}" stroke="${PAPER}" stroke-width="4"/>`;
    if (x.focus || i === 0 || i === it.length - 1 || it.length <= 8) g += T(px, py - 26, x.display ?? fmt(v), { fs: it.length > 10 ? 22 : 28, fw: 800 });
    if (two && x.display2) g += T(px, Y(num(x.value2)) + 40, x.display2, { fs: 22, c: GOOD });
    g += T(px, H - 22, x.label, { fs: it.length > 10 ? 20 : 24, fw: x.focus ? 800 : 600, c: x.focus ? INK : MUT });
    box[i] = { x: px - 20, y: py - 20, w: 40, h: 40 }; });
  if (s.base != null) g += T(14, bot - 10, fmt(base), { a: "start", fs: 20, fw: 600, c: MUT });
  return { svg: g, box };
}

function thanh(s, W, H) {   // bar ngang: so độ lớn giữa các nhóm
  const it = s.items || [], max = Math.max(1, ...it.map((x) => Math.abs(num(x.value ?? x.to) || 0))), rh = Math.min(96, H / Math.max(1, it.length)), L = Math.min(560, Math.max(260, 30 + 15.5 * Math.max(...it.map((x) => plain(x.label).length))));
  let g = "", box = [];
  it.forEach((x, i) => { const v = num(x.value ?? x.to) || 0, w = Math.abs(v) / max * (W - L - 200), y = i * rh + 8;
    g += T(0, y + rh * 0.55, x.label, { a: "start", fs: 28, fw: 800 }) + `<rect x="${L}" y="${y}" width="${Math.max(6, w)}" height="${rh - 26}" fill="${fillOf(x, v)}" stroke="${x.hatch ? INK : "none"}" stroke-width="3"${dash(x)}/>` + T(L + w + 16, y + rh * 0.55, x.display ?? fmt(v), { a: "start", fs: 32, fw: 800, c: x.tone === "bad" || v < 0 ? BAD : INK });
    box[i] = { x: L, y, w: Math.max(6, w), h: rh - 26 }; });
  return { svg: g, box };
}

function thacNuoc(s, W, H) {   // waterfall
  const it = s.items || []; let run = 0; const seg = it.map((x) => { const v = num(x.value); if (x.total) { const r = { a: 0, b: x.value != null && !isNaN(v) ? v : run, x }; run = r.b; return r; } const r = { a: run, b: run + v, x }; run += v; return r; });
  const lo = Math.min(0, ...seg.flatMap((r) => [r.a, r.b])), hi = Math.max(...seg.flatMap((r) => [r.a, r.b])), top = 60, bot = H - 64, Y = (v) => bot - (v - lo) / ((hi - lo) || 1) * (bot - top), bw = (W - 40) / it.length;
  let g = `<line x1="10" x2="${W - 10}" y1="${Y(0)}" y2="${Y(0)}" stroke="${INK}" stroke-width="5"/>`, box = [];
  seg.forEach((r, i) => { const x = 20 + i * bw + bw * 0.18, w = bw * 0.64, y = Math.min(Y(r.a), Y(r.b)), h = Math.max(4, Math.abs(Y(r.a) - Y(r.b))), neg = !r.x.total && r.b < r.a;
    g += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${r.x.total ? (r.x.focus ? HL : INK) : neg ? BAD : GOOD}"/>`;
    if (i < seg.length - 1) g += `<line x1="${x + w}" x2="${x + bw}" y1="${Y(r.b)}" y2="${Y(r.b)}" stroke="${INK}" stroke-width="2" stroke-dasharray="6 6"/>`;
    g += T(x + w / 2, y - 12, r.x.display ?? (r.x.total ? fmt(r.b) : (neg ? "−" : "+") + fmt(Math.abs(r.b - r.a))), { fs: 28, fw: 800, c: neg ? BAD : INK }) + T(x + w / 2, H - 22, r.x.label, { fs: 22, fw: 600, c: MUT });
    box[i] = { x, y, w, h }; });
  return { svg: g, box };
}

function gantt(s, W, H) {
  const it = s.items || [], hi = Math.max(1, ...it.map((x) => num(x.to) || 0)), L = 330, X = (v) => L + v / hi * (W - L - 170), rh = Math.min(100, (H - 60) / Math.max(1, it.length));
  let g = "", box = []; const st = Math.max(1, Math.ceil(hi / 6));
  for (let v = 0; v <= hi; v += st) { const x = X(v); g += `<line x1="${x}" x2="${x}" y1="0" y2="${H - 50}" stroke="${INK}" stroke-opacity=".14" stroke-width="3"/>${T(x, H - 16, fmt(v), { fs: 22, fw: 600, c: MUT })}`; }
  if (s.unit) g += T(X(hi) + 10, H - 16, s.unit, { a: "start", fs: 22, fw: 600, c: MUT });
  it.forEach((x, i) => { const a = num(x.from) || 0, b = num(x.to) || 0, y = 10 + i * rh;
    g += T(0, y + rh * 0.5, x.label, { a: "start", fs: 26, fw: 800 }) + `<rect x="${X(a)}" y="${y}" width="${Math.max(8, X(b) - X(a))}" height="${rh - 34}" fill="${fillOf(x, 1)}"/>` + T(X(b) + 14, y + rh * 0.45, x.display ?? `${fmt(b - a)}${s.unit ? " " + s.unit : ""}`, { a: "start", fs: 24, fw: 800 });
    box[i] = { x: X(a), y, w: X(b) - X(a), h: rh - 34 }; });
  return { svg: g, box };
}

function tienDo(s, W, H) {   // progress 0–100
  const it = s.items || [], L = Math.min(560, Math.max(260, 30 + 14.5 * Math.max(...it.map((x) => plain(x.label).length)))), X = (v) => L + Math.max(0, Math.min(100, v)) / 100 * (W - L - 160), rh = Math.min(100, H / Math.max(1, it.length));
  let g = "", box = [];
  it.forEach((x, i) => { const v = num(x.value) || 0, y = i * rh + 10, h = rh - 40;
    g += T(0, y + h * 0.75, x.label, { a: "start", fs: 26, fw: 800 }) + `<rect x="${L}" y="${y}" width="${X(100) - L}" height="${h}" fill="${INK}" fill-opacity=".1"/><rect x="${L}" y="${y}" width="${X(v) - L}" height="${h}" fill="${fillOf(x, v)}"/>` + T(X(100) + 16, y + h * 0.75, x.display ?? `${fmt(v)}%`, { a: "start", fs: 30, fw: 800, c: x.tone === "bad" ? BAD : INK });
    if (x.target != null) g += `<line x1="${X(num(x.target))}" x2="${X(num(x.target))}" y1="${y - 10}" y2="${y + h + 10}" stroke="${BAD}" stroke-width="5"/>${T(X(num(x.target)), y - 16, `mục tiêu ${fmt(num(x.target))}%`, { fs: 20, c: BAD })}`;
    box[i] = { x: L, y, w: X(v) - L, h }; });
  return { svg: g, box };
}

function tron(s, W, H) {   // donut ≤ 4 lát + chú giải
  const it = (s.items || []).slice(0, 4), tot = it.reduce((a, x) => a + Math.abs(num(x.value) || 0), 0) || 1, cx = H / 2 + 20, cy = H / 2, R = H / 2 - 20, r = R * 0.58, COL = [INK, HL, BAD, GOOD];
  let a0 = -Math.PI / 2, g = "";
  it.forEach((x, i) => { const a1 = a0 + Math.abs(num(x.value)) / tot * Math.PI * 2, big = a1 - a0 > Math.PI ? 1 : 0, p = (a, rr) => `${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
    g += `<path d="M${p(a0, R)} A${R} ${R} 0 ${big} 1 ${p(a1, R)} L${p(a1, r)} A${r} ${r} 0 ${big} 0 ${p(a0, r)} Z" fill="${x.focus ? HL : COL[i]}" stroke="${PAPER}" stroke-width="5"/>`;
    const ly = 60 + i * 92; g += `<rect x="${H + 90}" y="${ly}" width="40" height="40" fill="${x.focus ? HL : COL[i]}"/>` + T(H + 150, ly + 32, x.label, { a: "start", fs: 30, fw: 800 }) + T(W - 10, ly + 32, x.display ?? `${Math.round(Math.abs(num(x.value)) / tot * 100)}%`, { a: "end", fs: 34, fw: 800 });
    a0 = a1; });
  if (s.center) g += T(cx, cy + 16, s.center, { fs: 44, fw: 800 });
  return { svg: g, box: [] };
}

function doc(s, W, H) {   // slope: trước → sau
  const it = s.items || [], vals = it.flatMap((x) => [num(x.value), num(x.after)]), hi = Math.max(1, ...vals), top = 60, bot = H - 40, Y = (v) => bot - v / hi * (bot - top), xa = 300, xb = W - 300;
  let g = `<line x1="${xa}" x2="${xa}" y1="${top - 20}" y2="${bot}" stroke="${INK}" stroke-width="4"/><line x1="${xb}" x2="${xb}" y1="${top - 20}" y2="${bot}" stroke="${INK}" stroke-width="4"/>`
    + T(xa, top - 32, (s.ends || [])[0] || "Trước", { fs: 26, fw: 800 }) + T(xb, top - 32, (s.ends || [])[1] || "Sau", { fs: 26, fw: 800 });
  it.forEach((x) => { const a = num(x.value), b = num(x.after), col = x.focus ? HL : x.tone === "bad" || b < a ? BAD : INK;
    g += `<line x1="${xa}" x2="${xb}" y1="${Y(a)}" y2="${Y(b)}" stroke="${col}" stroke-width="${x.focus ? 9 : 6}"/><circle cx="${xa}" cy="${Y(a)}" r="11" fill="${col}"/><circle cx="${xb}" cy="${Y(b)}" r="11" fill="${col}"/>`
      + T(xa - 22, Y(a) + 9, `${x.label} ${x.display ?? fmt(a)}`, { a: "end", fs: 24, fw: 700 }) + T(xb + 22, Y(b) + 9, x.display2 ?? fmt(b), { a: "start", fs: 26, fw: 800, c: col }); });
  return { svg: g, box: [] };
}

function giaiDoan(s, W, H) {   // span theo ngày dd/mm/yyyy + mốc luật đổi
  const it = s.items || [], a = it.flatMap((x) => [dmy(x.from), dmy(x.to)]).concat((s.markers || []).map((m) => dmy(m.date))).filter((v) => !isNaN(v)), lo = Math.floor(Math.min(...a)), hi = Math.ceil(Math.max(...a)), L = 250, X = (v) => L + (v - lo) / ((hi - lo) || 1) * (W - L - 20), rh = Math.min(120, (H - 110) / Math.max(1, it.length));
  let g = "", box = [];
  for (let y = lo; y <= hi; y++) g += `<line x1="${X(y)}" x2="${X(y)}" y1="40" y2="${H - 56}" stroke="${INK}" stroke-opacity=".14" stroke-width="3"/>${T(X(y), H - 18, y, { fs: 24, fw: 700, c: MUT })}`;
  it.forEach((x, i) => { const y = 56 + i * rh, x1 = X(dmy(x.from)), x2 = X(dmy(x.to)), mo = Math.round((dmy(x.to) - dmy(x.from)) * 12);
    g += T(0, y + 44, x.label, { a: "start", fs: 30, fw: 800 }) + `<rect x="${x1}" y="${y}" width="${Math.max(8, x2 - x1)}" height="${rh - 46}" fill="${x.focus ? BAD : INK}" stroke="${INK}" stroke-width="5"/>` + (x2 - x1 > 150 ? T(x1 + 16, y + (rh - 46) / 2 + 10, `≈ ${mo} tháng`, { a: "start", fs: 26, fw: 800, c: PAPER }) : "");
    box[i] = { x: x1, y, w: Math.max(8, x2 - x1), h: rh - 46 }; });
  (s.markers || []).forEach((m) => { const x = X(dmy(m.date)); g += `<line x1="${x}" x2="${x}" y1="6" y2="${H - 56}" stroke="${BAD}" stroke-width="6" stroke-dasharray="14 10"/><rect x="${x - 190}" y="-14" width="380" height="44" fill="${HL}" stroke="${INK}" stroke-width="4"/>${T(x, 17, m.label, { fs: 24, fw: 800 })}`; });
  return { svg: g, box };
}

const VE = { column: cot, line: (s, W, H) => duong(s, W, H, false), step: (s, W, H) => duong(s, W, H, true), bar: thanh, waterfall: thacNuoc, gantt, progress: tienDo, donut: tron, slope: doc, span: giaiDoan };
/** chart → { svg, why: [{label, text}] }; W, H: khung vẽ (px của slide). */
function veBieuDo(s, W, H) {
  const kind = VE[s.kind] ? s.kind : "bar", r = VE[kind](s, W, H);
  const why = kind === "column" ? (s.items || []).filter((x) => x.why).slice(0, 4).map((x) => ({ label: x.label, text: x.why })) : [];
  const legend = (s.series || []).length && kind !== "donut" ? (s.series || []).slice(0, 2).map((n, k) => `<rect x="${W - 520 + k * 260}" y="-14" width="26" height="26" fill="${k ? GOOD : INK}"/>${T(W - 484 + k * 260, 8, n, { a: "start", fs: 22, fw: 700 })}`).join("") : "";
  const an = s.annotate && r.box ? chuThich(r.box[s.annotate.item], s.annotate.text, W, H, ["bar", "span", "gantt", "progress"].includes(kind)) : "";
  return { svg: `<svg viewBox="0 -24 ${W} ${H + 24}" font-family="Be Vietnam Pro, sans-serif">${HATCH}${r.svg}${legend}${an}</svg>`, why };
}
module.exports = { veBieuDo, KINDS: Object.keys(VE) };
