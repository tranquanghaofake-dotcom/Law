// Phong cách bìa / mở chương / slide cuối theo meta.style — vẽ bằng code, lấy chất liệu từ chính thế giới của bản án:
//   dossier   — hồ sơ vụ án: mặt bàn tối, bìa giấy kraft có tab, tờ giấy lộ ra, dây buộc, dấu mực đỏ. Mỗi chương = một TAB hồ sơ.
//   cadastral — bản đồ địa chính: lưới toạ độ, thửa Voronoi, đường, sông, thửa đang bàn gạch đỏ, mũi tên Bắc, thước tỉ lệ. Mỗi chương = một TỜ bản đồ.
//   portico   — kiến trúc toà án: trán tường, cột đá, bóng đổ dài. Mỗi chương = một CỘT (số La Mã), cột đang trình bày tô màu nhấn.
// Nguyên tắc: phần nền (chất liệu, bóng đổ, vân giấy, mực loang) là PNG vì PowerPoint vẽ sai SVG filter; MỌI CHỮ là ô chữ thật
// (đo tràn, đo tương phản — hint() khai báo màu nền thật dưới chữ cho bộ kiểm). Con dấu chỉ ghi chữ chung ("Bản án phúc thẩm",
// "Đã bình luận") — KHÔNG vẽ quốc huy, không mô phỏng dấu thật của cơ quan nhà nước.
const CA = require("./codeart");
const PX = 120; // 1 in = 120 đơn vị SVG (slide 1600 × 900)
const f1 = (v) => (Math.round(v * 10) / 10).toString();
const esc = (t) => String(t == null ? "" : t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const FONT = { "Calibri": "Carlito, Calibri, sans-serif", "Times New Roman": "Liberation Serif, Times New Roman, serif", "Arial": "Liberation Sans, Arial, sans-serif" };
const roman = (n) => ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] || String(n);
const svgWrap = (body, defs = "") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs>${defs}</defs>${body}</svg>`;
const plain = (t) => String(t || "").replace(/[[\]]/g, "");

function make(X) { // X = bộ công cụ của build.js (T, box, png, kicker, cap, num, rich, realH, measure, mix, isLight, TH, CUR, PARTS, W, H, M, pres, ASSETS, fs)
  const { W, H, M } = X;
  const hint = (x, y, w, h, color) => X.CUR.fills.push({ x, y, w, h, color, tr: 0, seq: X.CUR.seq++ });
  const bg = async (key, svg, alt) => { if (!X.ASSETS[key]) X.ASSETS[key] = await X.png(svg, 2000); X.s.addImage({ data: X.ASSETS[key], x: 0, y: 0, w: W, h: H, altText: alt }); };
  const titleRuns = (t, col, acc, bold) => X.rich(t, col, acc).map(r => (r.options.fontFace === X.TH.titleFont ? { text: r.text, options: Object.assign({}, r.options, { bold: bold != null ? bold : r.options.bold }) } : r));
  const fitTitle = (runs, w, sizes, maxLines) => { let fz = sizes[0], h = 1; for (fz of sizes) { const m = X.measure(runs, { fontFace: X.TH.titleFont, fontSize: fz }, w); h = m.ok ? m.height * 1.05 + 0.1 : 1.5; if (!m.ok || m.lines <= maxLines) break; } return { fz, h }; };
  const parts = () => Object.keys(X.PARTS).map(Number).sort((a, b) => a - b);

  // ======================= DOSSIER =======================
  const KR = { kraft: "C49A5C", kraftD: "A57E45", tab: ["D6B27A", "C9A163", "B88E51", "CFA96E", "BF9556", "D2AD73"], paper: "FFFDF9" };
  const dDefs = `<filter id="sh" x="-10%" y="-10%" width="130%" height="140%"><feDropShadow dx="0" dy="14" stdDeviation="16" flood-color="#000" flood-opacity=".42"/></filter>
<filter id="ink"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="5"/><feComposite operator="in" in2="SourceGraphic"/></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .3  0 0 0 0 .2  0 0 0 0 .08  0 0 0 .16 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="desk"><feTurbulence type="fractalNoise" baseFrequency=".012 .4" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .05 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>`;
  const desk = (col) => `<rect width="1600" height="900" fill="#${col}"/><rect width="1600" height="900" fill="#fff" filter="url(#desk)"/>`;
  // bìa hồ sơ (có tab) — toạ độ inch
  const folder = (x, y, w, h, tabX, tabW, col) => { const p = (v) => f1(v * PX), d = `M${p(x)},${p(y)} L${p(tabX)},${p(y)} L${p(tabX + 0.18)},${p(y - 0.4)} L${p(tabX + tabW - 0.18)},${p(y - 0.4)} L${p(tabX + tabW)},${p(y)} L${p(x + w)},${p(y)} L${p(x + w)},${p(y + h)} L${p(x)},${p(y + h)}Z`;
    return `<g filter="url(#sh)"><path d="${d}" fill="#${col}"/></g><path d="${d}" fill="#fff" filter="url(#grain)"/><path d="M${p(x + 0.25)},${p(y + h - 0.02)} L${p(x + w - 0.25)},${p(y + h - 0.02)}" stroke="#000" stroke-opacity=".12" stroke-width="3"/>`; };
  const stampSvg = (cx, cy, rot, l1, l2, red, s = 1) => `<g transform="translate(${f1(cx * PX)},${f1(cy * PX)}) rotate(${rot}) scale(${s})" filter="url(#ink)" opacity=".86">
  <rect x="-175" y="-60" width="350" height="120" rx="10" fill="none" stroke="#${red}" stroke-width="6"/><rect x="-162" y="-47" width="324" height="94" rx="6" fill="none" stroke="#${red}" stroke-width="2"/>
  <text x="0" y="-5" text-anchor="middle" font-family="${FONT.Arial}" font-weight="700" font-size="30" letter-spacing="2" fill="#${red}">${esc(l1)}</text>
  <text x="0" y="30" text-anchor="middle" font-family="${FONT.Arial}" font-size="20" fill="#${red}">${esc(l2)}</text></g>`;
  const twine = (cx, cy, red) => { const x = cx * PX, y = cy * PX; return `<circle cx="${x}" cy="${y}" r="20" fill="#${KR.kraftD}" stroke="#7d5a2b" stroke-width="3"/><circle cx="${x}" cy="${y + 70}" r="20" fill="#${KR.kraftD}" stroke="#7d5a2b" stroke-width="3"/>
  <path d="M${x},${y} C${x + 60},${y + 20} ${x - 50},${y + 50} ${x},${y + 70} C${x + 40},${y + 110} ${x + 70},${y + 170} ${x + 25},${y + 240}" fill="none" stroke="#${red}" stroke-width="5" stroke-linecap="round"/>`; };
  const typedLines = (x, y, w, n, seed, ink) => { const R = CA.rng(seed); let s = ""; for (let i = 0; i < n; i++) s += `<rect x="${f1(x * PX)}" y="${f1((y + i * 0.22) * PX)}" width="${f1(w * PX * (0.55 + R() * 0.45))}" height="7" rx="3" fill="#${ink}" opacity=".16"/>`; return s; };
  const paperSheet = (x, y, w, h, rot, ink, seed) => `<g transform="rotate(${rot} ${f1((x + w / 2) * PX)} ${f1((y + h / 2) * PX)})"><rect x="${f1(x * PX)}" y="${f1(y * PX)}" width="${f1(w * PX)}" height="${f1(h * PX)}" fill="#${KR.paper}" filter="url(#sh)"/>${typedLines(x + 0.5, y + 0.5, w - 1.2, Math.max(2, Math.floor((h - 0.8) / 0.22)), seed, ink)}</g>`;
  const clip = (x, y) => { const X0 = x * PX, Y0 = y * PX; return `<path d="M${X0},${Y0} l0,92 a20,20 0 0 0 40,0 l0,-72 a13,13 0 0 0 -26,0 l0,62" fill="none" stroke="#8b96a5" stroke-width="6" stroke-linecap="round"/>`; };

  async function dossierCover(s, c, d, meta) {
    const ink = X.TH.l.text, red = X.TH.l.bad, deskC = X.TH.d.bg, fx = 1.0, fy = 1.35, fw = 11.3, fh = 5.75, tabX = 1.35, tabW = 3.4;
    const caseNo = (String(d.subtitle || "") + " " + String(meta.short || "")).match(/\d{1,4}\/\d{4}\/[A-ZĐ-]+/i);
    await bg(`dos-cover:${deskC}:${red}:${ink}`, svgWrap(desk(deskC) + paperSheet(5.2, 0.55, 6.6, 3.6, -3, ink, 3) + folder(fx, fy, fw, fh, tabX, tabW, KR.kraft) + stampSvg(10.55, 6.2, -8, "BẢN ÁN PHÚC THẨM", d.date || "Bình luận", red) + twine(11.75, 2.6, red), dDefs), "Bìa hồ sơ vụ án bằng giấy kraft trên mặt bàn");
    hint(0, 0, W, H, deskC); hint(fx, fy - 0.4, fw, fh + 0.4, KR.kraft);
    X.T(s, caseNo ? "Hồ sơ " + caseNo[0] : (meta.short || "Hồ sơ vụ án"), { _label: "tab hồ sơ", x: tabX + 0.3, y: fy - 0.37, w: tabW - 0.5, h: 0.34, fontSize: 13, color: ink, valign: "middle" });
    // nhãn dán: thẻ giấy chứa tiêu đề
    const lx = 1.6, lw = 7.1, tw = lw - 0.9, runs = titleRuns(d.title, ink, red, X.TH.titleBold), ft = fitTitle(runs, tw, [44, 40, 36, 32], 3);
    const sh = d.subtitle ? X.realH(d.subtitle, { fontFace: X.TH.bodyFont, fontSize: 17 }, tw, 0.5) + 0.06 : 0, ah = d.author ? 0.62 : 0;
    const lh = 0.45 + (d.kicker ? 0.55 : 0) + ft.h + (sh ? 0.15 + sh : 0) + (ah ? 0.3 + ah : 0) + 0.35, ly = Math.max(fy + 0.55, fy + (fh - lh) / 2 - 0.15);
    X.box(s, lx, ly, lw, lh, KR.paper);
    let y = ly + 0.45;
    if (d.kicker) { X.T(s, plain(d.kicker), { _label: "kicker", x: lx + 0.45, y: y - 0.06, w: tw, h: 0.36, fontSize: 15, color: red }); s.addShape(X.pres.shapes.LINE, { x: lx + 0.45, y: y + 0.36, w: tw, h: 0, line: { color: red, width: 1.25 } }); y += 0.55; }
    X.T(s, runs, { _label: "title", x: lx + 0.45, y, w: tw, h: ft.h, fontSize: ft.fz, fontFace: X.TH.titleFont }); y += ft.h;
    if (d.subtitle) { y += 0.15; X.T(s, d.subtitle, { _label: "subtitle", x: lx + 0.45, y, w: tw, h: sh, fontSize: 17, color: X.TH.l.muted }); y += sh; }
    if (d.author) { y += 0.3; X.T(s, [{ text: d.author, options: { bold: true, color: ink, fontSize: 16, breakLine: !!(d.authorSub) } }, ...(d.authorSub ? [{ text: d.authorSub, options: { color: X.TH.l.muted, fontSize: 13 } }] : [])], { _label: "author", x: lx + 0.45, y, w: tw, h: ah }); }
  }
  async function dossierSection(s, c, d) {
    const ps = parts(), cur = +d.num, ink = X.TH.l.text, red = X.TH.l.bad, deskC = X.TH.d.bg, n = Math.max(1, ps.length);
    const fx = 0.75, fy = 1.45, fw = 11.85, fh = 5.7, tabW = Math.min(3.4, (fw - 0.5) / n - 0.12), tabX = (k) => fx + 0.3 + k * (tabW + 0.12), ci = Math.max(0, ps.indexOf(cur));
    // bìa phía sau mang các tab chương khác (cao hơn, sẫm hơn); bìa phía trước mang tab chương hiện tại
    let back = ""; ps.forEach((p, k) => { if (k !== ci) back += folder(fx + 0.12, fy - 0.42, fw - 0.24, fh, tabX(k), tabW, KR.tab[k % KR.tab.length]); });
    const big = String(d.num || "").padStart(1, "0");
    await bg(`dos-sec:${deskC}:${ink}:${n}:${ci}:${big}`, svgWrap(desk(deskC) + back + folder(fx, fy, fw, fh, tabX(ci), tabW, KR.tab[ci % KR.tab.length])
      + `<text x="${f1((fx + 0.35) * PX)}" y="${f1((fy + 3.3) * PX)}" font-family="${FONT[X.TH.numFont] || FONT["Times New Roman"]}" font-size="380" ${X.TH.numItalic ? 'font-style="italic"' : ""} fill="#${KR.kraftD}" opacity=".7">${esc(big)}</text>`
      , dDefs), "Các bìa hồ sơ xếp chồng, mỗi chương một tab");
    hint(0, 0, W, H, deskC); hint(fx, fy - 0.85, fw, fh + 0.85, KR.kraft);
    ps.forEach((p, k) => X.T(s, `${p}  ${X.PARTS[p] || ""}`, { _label: `tab chương ${p}`, x: tabX(k) + 0.25, y: (k === ci ? fy : fy - 0.42) - 0.37, w: tabW - 0.4, h: 0.34, fontSize: 12, bold: k === ci, color: ink, valign: "middle" }));
    const tx = fx + 2.75, tw = 5.7, runs = titleRuns(d.title, ink, ink, X.TH.titleBold), ft = fitTitle(runs, tw, [44, 40, 36], 3);
    let y = fy + 0.9;
    X.T(s, `Chương ${cur} trên ${n}`, { _label: "chương x / n", x: tx, y, w: tw, h: 0.4, fontSize: 16, color: ink }); y += 0.5;
    X.T(s, runs, { _label: "title", x: tx, y, w: tw, h: ft.h, fontSize: ft.fz, fontFace: X.TH.titleFont }); y += ft.h;
    if (d.sub) X.T(s, d.sub, { _label: "sub", x: tx, y: y + 0.15, w: tw, h: 0.8, fontSize: 17, color: ink });
    const inside = (Array.isArray(d.inside) ? d.inside : d._inside || []).slice(0, 4);
    if (inside.length) { const cx = 9.05, cw = 3.25, ih = inside.map(t => X.realH(t, { fontFace: X.TH.bodyFont, fontSize: 15 }, cw - 0.75, 0.3) + 0.14), ch = 0.95 + ih.reduce((a, b) => a + b, 0) + 0.25, cy = fy + 1.25;
      X.box(s, cx, cy, cw, ch, KR.paper);
      // ghim kẹp giấy vẽ SAU thẻ (đè lên mép trên thẻ, không che chữ)
      const kc = "dos-clip"; if (!X.ASSETS[kc]) X.ASSETS[kc] = await X.png(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 70 130"><path d="M0,0 l0,92 a20,20 0 0 0 40,0 l0,-72 a13,13 0 0 0 -26,0 l0,62" fill="none" stroke="#7f8a99" stroke-width="7" stroke-linecap="round"/><path d="M0,0 l0,92 a20,20 0 0 0 40,0 l0,-72 a13,13 0 0 0 -26,0 l0,62" fill="none" stroke="#c9d0d9" stroke-width="2.5" stroke-linecap="round"/></svg>`, 200);
      s.addImage({ data: X.ASSETS[kc], x: cx + cw - 0.75, y: cy - 0.32, w: 0.42, h: 0.78, altText: "Ghim kẹp giấy" });
      X.T(s, "Trong chương này", { _label: "trong chương này", x: cx + 0.35, y: cy + 0.42, w: cw - 0.6, h: 0.36, fontSize: 15, color: red });
      let yy = cy + 0.9; for (const [i, t] of inside.entries()) { X.T(s, t, { _label: `trong chương ${i + 1}`, x: cx + 0.35, y: yy, w: cw - 0.75, h: ih[i] - 0.06, fontSize: 15, color: ink, fontFace: X.TH.accentFont, italic: X.TH.accentItalic }); yy += ih[i]; } }
  }
  async function dossierEnd(s, c, d, meta) {
    const ink = X.TH.l.text, red = X.TH.l.bad, deskC = X.TH.d.bg, fx = 1.2, fy = 1.3, fw = 10.9, fh = 5.75, tabX = 1.55, tabW = 3.4;
    await bg(`dos-end:${deskC}:${red}`, svgWrap(desk(deskC) + folder(fx, fy, fw, fh, tabX, tabW, KR.kraft) + stampSvg(9.9, 5.95, 7, "ĐÃ BÌNH LUẬN", d.date || meta.date || "Hỏi đáp", red, 1.1) + twine(11.55, 2.3, red), dDefs), "Bìa hồ sơ đã đóng, đóng dấu đã bình luận");
    hint(0, 0, W, H, deskC); hint(fx, fy - 0.4, fw, fh + 0.4, KR.kraft);
    const caseNo = String(meta.short || "Hồ sơ vụ án");
    X.T(s, caseNo, { _label: "tab hồ sơ", x: tabX + 0.3, y: fy - 0.37, w: tabW - 0.5, h: 0.34, fontSize: 13, color: ink, valign: "middle" });
    const tx = fx + 0.75, tw = 6.9, msg = d.message != null ? d.message : d._message; let y = fy + 0.75;
    // trên nền kraft chỉ dùng màu mực đậm: đỏ dấu trên kraft chỉ đạt ~2.3:1 (bộ kiểm tương phản bắt được)
    if (msg) { X.T(s, "Điều cần nhớ", { _label: "điều cần nhớ", x: tx, y, w: tw, h: 0.36, fontSize: 16, bold: true, color: ink }); y += 0.5;
      const mr = titleRuns(msg, ink, ink, X.TH.titleBold), mf = fitTitle(mr, tw, [36, 32, 28], 2); X.T(s, mr, { _label: "message", x: tx, y, w: tw, h: mf.h, fontSize: mf.fz, fontFace: X.TH.titleFont }); y += mf.h + 0.35; }
    const tr = X.rich(d.title, ink, ink).map(r => ({ text: r.text, options: Object.assign({}, r.options, { fontFace: X.TH.accentFont, italic: X.TH.accentItalic }) })), th = X.realH(tr, { fontFace: X.TH.accentFont, fontSize: 30 }, tw, 0.6) + 0.08;
    X.T(s, tr, { _label: "title", x: tx, y, w: tw, h: th, fontSize: 30, color: ink }); y += th;
    if (d.sub) { X.T(s, d.sub, { _label: "sub", x: tx, y: y + 0.05, w: tw, h: 0.4, fontSize: 18, color: ink }); y += 0.5; }
    const team = (d.team || []).slice(0, 6);
    if (team.length) X.T(s, (d.teamTitle || "Nhóm thực hiện") + ": " + team.map(m => m.name).join(", "), { _label: "team", x: tx, y: Math.max(y + 0.35, fy + fh - 1.1), w: tw, h: 0.62, fontSize: 15, color: ink });
    if (d.contact) X.T(s, d.contact, { _label: "contact", x: tx, y: fy + fh - 0.5, w: tw, h: 0.36, fontSize: 14, color: ink });
  }

  // ======================= CADASTRAL =======================
  // màu nền bản đồ / bầu trời pha từ MÀU CHỮ ĐẬM của theme (không phải màu nhấn): theme nhấn đỏ (son, toa) không ra bản đồ hồng
  const tint = (t) => X.mix(X.TH.l.text, "FFFFFF", t);
  const mapPal = (c) => ({ paper: tint(0.94), line: tint(0.55), ink: X.TH.l.text, red: X.TH.l.bad, water: tint(0.84) });
  const mapDefs = (red) => `<pattern id="hh" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="#F6DBD6"/><line x1="0" y1="0" x2="0" y2="16" stroke="#${red}" stroke-width="5"/></pattern>`;
  // trả về { svg, parcel:[x,y](inch) } — thửa tô gạch nằm trong vùng phải-trên (không bị thẻ chữ che)
  function mapSvg(P, seed, zoom, frame, region) {
    const cells = CA.voronoiCells(1600 * 1.2, 900 * 1.2, Math.round(70 * zoom), seed).map(q => ({ site: [q.site[0] - 160, q.site[1] - 90], poly: q.poly.map(p => [p[0] - 160, p[1] - 90]) }));
    let b = `<rect width="1600" height="900" fill="#${P.paper}"/>`;
    b += `<path d="M-20,700 C300,630 520,850 900,740 S1400,600 1640,670 L1640,920 L-20,920Z" fill="#${P.water}"/>`;
    cells.forEach((q, i) => { b += `<path d="${CA.polyD(q.poly)}" fill="#${P.line}" fill-opacity="${(0.05 + (i % 4) * 0.03).toFixed(3)}" stroke="#${P.line}" stroke-width="1.6"/>`; });
    b += `<path d="M-20,380 C400,325 900,450 1640,360" fill="none" stroke="#fff" stroke-width="26"/><path d="M-20,380 C400,325 900,450 1640,360" fill="none" stroke="#${P.line}" stroke-width="2" stroke-dasharray="18 12"/>`;
    for (let x = 100; x < 1600; x += 200) b += `<line x1="${x}" y1="0" x2="${x}" y2="900" stroke="#${P.ink}" stroke-opacity=".07"/><text x="${x + 6}" y="${frame ? 78 : 22}" font-family="${FONT.Calibri}" font-size="15" fill="#${P.ink}" opacity=".45">${1875 + x / 100}00</text>`;
    for (let y = 100; y < 900; y += 200) b += `<line x1="0" y1="${y}" x2="1600" y2="${y}" stroke="#${P.ink}" stroke-opacity=".07"/><text x="${frame ? 66 : 8}" y="${y - 6}" font-family="${FONT.Calibri}" font-size="15" fill="#${P.ink}" opacity=".45">${1836 + y / 100}00</text>`;
    let parcel = null;
    if (region) { const [x0, y0, x1, y1] = region.map(v => v * PX), t = cells.filter(q => q.site[0] > x0 && q.site[0] < x1 && q.site[1] > y0 && q.site[1] < y1 && q.poly.every(p => p[1] < 330)).sort((a, b2) => CA.polyArea(b2.poly) - CA.polyArea(a.poly))[0];
      // dự phòng: không thửa nào nằm trọn trong vùng → lấy thửa (phía trên đường) gần tâm vùng nhất
      const tc = t || cells.filter(q => q.poly.every(p => p[1] < 340 && p[1] > 0 && p[0] > 0 && p[0] < 1600)).sort((a, b2) => Math.hypot(a.site[0] - (x0 + x1) / 2, a.site[1] - (y0 + y1) / 2) - Math.hypot(b2.site[0] - (x0 + x1) / 2, b2.site[1] - (y0 + y1) / 2))[0];
      if (tc) { const t = tc; b += `<path d="${CA.polyD(t.poly)}" fill="url(#hh)" stroke="#${P.red}" stroke-width="5"/>`; parcel = [t.site[0] / PX, t.site[1] / PX]; } }
    if (frame) b += `<rect x="40" y="40" width="1520" height="820" fill="none" stroke="#${P.ink}" stroke-width="3"/><rect x="52" y="52" width="1496" height="796" fill="none" stroke="#${P.ink}" stroke-width="1"/>`;
    b += `<g transform="translate(1535,${frame ? 720 : region ? 770 : 110})"><circle r="34" fill="#fff" stroke="#${P.ink}" stroke-width="2"/><path d="M0,-26 L10,8 L0,2 L-10,8Z" fill="#${P.ink}"/><text y="26" text-anchor="middle" font-family="${FONT.Calibri}" font-size="16" fill="#${P.ink}">B</text></g>`;
    b += `<g transform="translate(1250,${frame ? 800 : 840})"><rect width="80" height="10" fill="#${P.ink}"/><rect x="80" width="80" height="10" fill="#fff" stroke="#${P.ink}"/><rect x="160" width="80" height="10" fill="#${P.ink}"/><text y="30" font-family="${FONT.Calibri}" font-size="15" fill="#${P.ink}">0</text><text x="226" y="30" font-family="${FONT.Calibri}" font-size="15" fill="#${P.ink}">30 m</text></g>`;
    return { svg: svgWrap(b, mapDefs(P.red)), parcel };
  }
  async function mapBg(key, P, seed, zoom, frame, region, alt) {
    if (!X.ASSETS[key]) { const m = mapSvg(P, seed, zoom, frame, region); X.ASSETS[key] = await X.png(m.svg, 2000); X.ASSETS[key + ":p"] = m.parcel; }
    X.s.addImage({ data: X.ASSETS[key], x: 0, y: 0, w: W, h: H, altText: alt }); hint(0, 0, W, H, P.paper); return X.ASSETS[key + ":p"];
  }
  const mapCard = (x, y, w, h, P) => { X.box(X.s, x, y, w, h, "FFFFFF"); X.s.addShape(X.pres.shapes.RECTANGLE, { x, y, w: 0.1, h, fill: { color: P.ink }, line: { type: "none" } }); };
  const parcelLabel = (pc, text, P) => { if (!pc || !text) return; const w = X.fitW ? X.fitW(text, { fontFace: X.TH.bodyFont, fontSize: 16, bold: true }, 0.3, 0.12, 4.0) : 2.6, right = pc[0] + 1.3 + w <= W - 0.6, lx = right ? pc[0] + 1.3 : pc[0] - 1.3 - w, ly = Math.max(0.5, pc[1] - 0.85);
    X.s.addShape(X.pres.shapes.LINE, { x: right ? pc[0] : lx + w, y: ly + 0.22, w: right ? lx - pc[0] : pc[0] - lx - w, h: pc[1] - ly - 0.22, flipV: right, line: { color: P.red, width: 1.5 } });
    X.addT(X.s, text, { _label: "nhãn thửa", shape: X.pres.shapes.RECTANGLE, x: lx, y: ly, w, h: 0.44, fill: { color: "FFFFFF" }, line: { color: P.red, width: 1.5 }, color: P.red, fontFace: X.TH.bodyFont, fontSize: 16, bold: true, align: "center", valign: "middle", margin: 0 }); };
  async function cadastralCover(s, c, d, meta) {
    const P = mapPal(c), pc = await mapBg(`cad-cover:${P.paper}:${P.red}`, P, 9, 1, false, [8.8, 0.9, 12.2, 2.75], "Bản đồ địa chính, thửa đang tranh chấp gạch đỏ");
    parcelLabel(pc, meta.motifLabel || "Thửa đang tranh chấp", P);
    const cx = 0.85, cw = 7.4, tw = cw - 1.0, runs = titleRuns(d.title, P.ink, P.red, X.TH.titleBold), ft = fitTitle(runs, tw, [44, 40, 36, 32], 3);
    const sh = d.subtitle ? X.realH(d.subtitle, { fontFace: X.TH.bodyFont, fontSize: 17 }, tw, 0.5) + 0.06 : 0, ah = d.author ? 0.62 : 0;
    const ch = 0.45 + (d.kicker ? 0.5 : 0) + ft.h + (sh ? 0.15 + sh : 0) + (ah ? 0.3 + ah : 0) + 0.35, cy = Math.max(0.6, H - 0.6 - ch); // thẻ neo đáy: nửa trên bên phải để bản đồ + thửa tô gạch "thở"
    mapCard(cx, cy, cw, ch, P); let y = cy + 0.4;
    if (d.kicker) { X.T(s, plain(d.kicker), { _label: "kicker", x: cx + 0.55, y, w: tw, h: 0.36, fontSize: 15, color: P.red }); y += 0.5; }
    X.T(s, runs, { _label: "title", x: cx + 0.55, y, w: tw, h: ft.h, fontSize: ft.fz, fontFace: X.TH.titleFont }); y += ft.h;
    if (d.subtitle) { y += 0.15; X.T(s, d.subtitle, { _label: "subtitle", x: cx + 0.55, y, w: tw, h: sh, fontSize: 17, color: X.TH.l.muted }); y += sh; }
    if (d.author) { y += 0.3; X.T(s, [{ text: d.author, options: { bold: true, color: P.ink, fontSize: 16, breakLine: !!d.authorSub } }, ...(d.authorSub ? [{ text: d.authorSub, options: { color: X.TH.l.muted, fontSize: 13 } }] : [])], { _label: "author", x: cx + 0.55, y, w: tw, h: ah }); }
  }
  async function cadastralSection(s, c, d) {
    const P = mapPal(c), ps = parts(), cur = +d.num, n = Math.max(1, ps.length);
    await mapBg(`cad-sec:${P.paper}:${cur}`, P, 20 + cur * 7, 1.5, true, [4.6, 1.0, 8.4, 2.6], "Tờ bản đồ của chương " + cur);
    // sơ đồ chắp tờ (như ô chỉ dẫn tờ lân cận trên bản đồ địa chính): mọi chương, tờ hiện tại tô đậm
    { const ix = 0.75, iy = 0.75, iw = 3.9, rh = 0.36; X.box(s, ix, iy, iw, 0.4 + rh * n + 0.12, "FFFFFF");
      X.T(s, "Sơ đồ chắp tờ", { _label: "sơ đồ chắp tờ", x: ix + 0.2, y: iy + 0.08, w: iw - 0.4, h: 0.3, fontSize: 12, bold: true, color: P.ink });
      ps.forEach((p, k) => { const on = p === cur, yy = iy + 0.4 + k * rh;
        if (on) s.addShape(X.pres.shapes.RECTANGLE, { x: ix + 0.12, y: yy, w: iw - 0.24, h: rh - 0.04, fill: { color: P.ink }, line: { type: "none" } });
        X.T(s, `Tờ ${p}  ${X.PARTS[p] || ""}`, { _label: `tờ ${p}`, x: ix + 0.22, y: yy, w: iw - 0.44, h: rh - 0.04, fontSize: 12, bold: on, color: on ? "FFFFFF" : P.ink, valign: "middle" }); }); }
    X.T(s, String(cur).padStart(2, "0"), { _label: "num", x: W - 0.75 - 3.4, y: 0.6, w: 3.4, h: 2.65, fontSize: 150, fontFace: X.TH.numFont, italic: X.TH.numItalic, bold: X.TH.titleBold, color: P.ink, align: "right", valign: "top" });
    const inside = (Array.isArray(d.inside) ? d.inside : d._inside || []).slice(0, 3), cx = 0.8, cw = 8.1, tw = cw - 1.0, runs = titleRuns(d.title, P.ink, P.red, X.TH.titleBold), ft = fitTitle(runs, tw, [44, 40, 36], 2);
    const insT = inside.join("  ·  "), ih = insT ? X.realH(insT, { fontFace: X.TH.bodyFont, fontSize: 15 }, tw, 0.4) + 0.06 : 0, sh = d.sub ? X.realH(d.sub, { fontFace: X.TH.bodyFont, fontSize: 17 }, tw, 0.4) + 0.06 : 0;
    const ch = 0.4 + 0.5 + ft.h + (sh ? 0.1 + sh : 0) + (ih ? 0.25 + 0.34 + ih : 0) + 0.35, cy = H - 0.75 - ch;
    mapCard(cx, cy, cw, ch, P); let y = cy + 0.4;
    X.T(s, `Tờ ${cur} trên ${n}`, { _label: "tờ x / n", x: cx + 0.55, y, w: tw, h: 0.36, fontSize: 15, color: P.red }); y += 0.5;
    X.T(s, runs, { _label: "title", x: cx + 0.55, y, w: tw, h: ft.h, fontSize: ft.fz, fontFace: X.TH.titleFont }); y += ft.h;
    if (d.sub) { y += 0.1; X.T(s, d.sub, { _label: "sub", x: cx + 0.55, y, w: tw, h: sh, fontSize: 17, color: X.TH.l.muted }); y += sh; }
    if (ih) { y += 0.25; X.T(s, "Trong chương này", { _label: "trong chương này", x: cx + 0.55, y, w: tw, h: 0.3, fontSize: 13, bold: true, color: P.ink }); y += 0.34; X.T(s, insT, { _label: "trong chương", x: cx + 0.55, y, w: tw, h: ih, fontSize: 15, color: P.ink }); }
  }
  async function cadastralEnd(s, c, d, meta) {
    const P = mapPal(c), ps = parts();
    await mapBg(`cad-end:${P.paper}`, P, 5, 0.6, false, null, "Bản đồ địa chính thu nhỏ — lộ trình qua các chương");
    if (ps.length >= 2) { const pts = ps.map((p, i) => [1.8 + i * (W - 3.6) / (ps.length - 1), 2.0 + (i % 2 ? 0.55 : 0)]);
      for (let i = 1; i < pts.length; i++) s.addShape(X.pres.shapes.LINE, { x: Math.min(pts[i - 1][0], pts[i][0]), y: Math.min(pts[i - 1][1], pts[i][1]), w: Math.abs(pts[i][0] - pts[i - 1][0]), h: Math.abs(pts[i][1] - pts[i - 1][1]), flipV: pts[i][1] < pts[i - 1][1], line: { color: P.red, width: 2.5, dashType: "dash" } });
      pts.forEach((pt, i) => { X.num(s, ps[i], pt[0] - 0.24, pt[1] - 0.24, 0.48, P.red, "FFFFFF", 16); X.T(s, X.PARTS[ps[i]] || "", { _label: `chương ${ps[i]}`, x: pt[0] - 1.4, y: pt[1] + 0.3, w: 2.8, h: 0.5, fontSize: 13, bold: true, color: P.ink, align: "center" }); }); }
    const cx = 0.8, cw = W - 1.6, tw = cw - 1.1, msg = d.message != null ? d.message : d._message, team = (d.team || []).slice(0, 6);
    const mr = msg ? titleRuns(msg, P.ink, P.red, X.TH.titleBold) : null, mf = mr ? fitTitle(mr, tw, [36, 32, 28], 2) : { h: 0 };
    const ch = 0.4 + (msg ? 0.45 + mf.h + 0.2 : 0) + 0.55 + (team.length || d.contact ? 0.5 : 0) + 0.3, cy = H - 0.6 - ch;
    mapCard(cx, cy, cw, ch, P); let y = cy + 0.4;
    if (msg) { X.T(s, "Điều cần nhớ", { _label: "điều cần nhớ", x: cx + 0.55, y, w: tw, h: 0.36, fontSize: 15, color: P.red }); y += 0.45; X.T(s, mr, { _label: "message", x: cx + 0.55, y, w: tw, h: mf.h, fontSize: mf.fz, fontFace: X.TH.titleFont }); y += mf.h + 0.2; }
    X.T(s, X.rich(d.title + (d.sub ? " — " + d.sub : ""), P.ink, P.red).map(r => ({ text: r.text, options: Object.assign({}, r.options, { fontFace: X.TH.accentFont, italic: X.TH.accentItalic }) })), { _label: "title", x: cx + 0.55, y, w: tw, h: 0.5, fontSize: 24, color: P.ink }); y += 0.55;
    if (team.length || d.contact) X.T(s, [team.length ? (d.teamTitle || "Nhóm thực hiện") + ": " + team.map(m => m.name).join(", ") : "", d.contact || ""].filter(Boolean).join("  ·  "), { _label: "team", x: cx + 0.55, y, w: tw, h: 0.4, fontSize: 15, color: X.TH.l.muted });
  }

  // ======================= PORTICO =======================
  const ST = { stone: "F2EEE6", stoneS: "C9C1B2", stoneM: "E4DDD0" };
  const pDefs = (sky) => `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#${sky}"/><stop offset="1" stop-color="#FAFBFA"/></linearGradient>
<linearGradient id="col" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#${ST.stoneS}"/><stop offset=".35" stop-color="#${ST.stone}"/><stop offset=".7" stop-color="#${ST.stoneM}"/><stop offset="1" stop-color="#${ST.stoneS}"/></linearGradient>
<filter id="sh3" x="-10%" y="-10%" width="130%" height="130%"><feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000" flood-opacity=".18"/></filter>`;
  const column = (x, y, w, h, fill, shade) => { let f = ""; for (let k = 1; k < 5; k++) f += `<line x1="${f1(x + (w * k) / 5)}" y1="${y + 30}" x2="${f1(x + (w * k) / 5)}" y2="${y + h - 30}" stroke="#${fill ? "000" : ST.stoneS}" stroke-opacity="${fill ? 0.18 : 1}" stroke-width="2"/>`;
    return `<polygon points="${f1(x + w)},${y + h} ${f1(x + w + 240)},${y + h + 120} ${f1(x + w + 240 + w)},${y + h + 120} ${f1(x + 2 * w)},${y + h}" fill="#${shade}" opacity=".13"/>
  <rect x="${f1(x - 14)}" y="${y}" width="${f1(w + 28)}" height="26" fill="#${ST.stone}" stroke="#${ST.stoneS}"/><rect x="${f1(x)}" y="${y + 26}" width="${f1(w)}" height="${h - 52}" fill="${fill ? "#" + fill : "url(#col)"}"/>${f}<rect x="${f1(x - 14)}" y="${y + h - 26}" width="${f1(w + 28)}" height="26" fill="#${ST.stone}" stroke="#${ST.stoneS}"/>`; };
  // mặt tiền: n cột từ x0 rộng w0 (đơn vị SVG); hi = chỉ số cột tô màu nhấn; trả về toạ độ tâm từng cột (inch)
  function portico(x0, w0, n, yTop, hCol, hi, acc, shade) {
    let b = `<g filter="url(#sh3)"><polygon points="${x0 - 30},${yTop} ${x0 + w0 / 2},${yTop - 150} ${x0 + w0 + 30},${yTop}" fill="#${ST.stone}" stroke="#${ST.stoneS}" stroke-width="3"/></g><polygon points="${x0 + 22},${yTop - 14} ${x0 + w0 / 2},${yTop - 122} ${x0 + w0 - 22},${yTop - 14}" fill="none" stroke="#${ST.stoneS}" stroke-width="2"/>`;
    b += `<rect x="${x0 - 40}" y="${yTop}" width="${w0 + 80}" height="40" fill="#${ST.stone}" stroke="#${ST.stoneS}"/>`;
    const cw = Math.min(90, w0 / (n * 1.9)), gap = n > 1 ? (w0 - n * cw) / (n - 1) : 0, cs = [];
    for (let i = 0; i < n; i++) { const x = n > 1 ? x0 + i * (cw + gap) : x0 + (w0 - cw) / 2; b += column(x, yTop + 40, cw, hCol, i === hi ? acc : null, shade); cs.push([(x + cw / 2) / PX, cw / PX]); }
    b += `<rect x="${x0 - 70}" y="${yTop + 40 + hCol}" width="${w0 + 140}" height="22" fill="#${ST.stone}" stroke="#${ST.stoneS}"/><rect x="${x0 - 100}" y="${yTop + 62 + hCol}" width="${w0 + 200}" height="22" fill="#${ST.stone}" stroke="#${ST.stoneS}"/>`;
    return { b, cs };
  }
  const ground = (deep) => `<rect y="780" width="1600" height="120" fill="#${deep}"/>`;
  async function porticoCover(s, c, d, meta) {
    const sky = tint(0.86), deep = X.TH.d.bg, pt = portico(880, 560, 5, 250, 470, -1, c.acc, deep);
    await bg(`por-cover:${sky}:${deep}`, svgWrap(`<rect width="1600" height="900" fill="url(#sky)"/>` + pt.b + ground(deep), pDefs(sky)), "Mặt tiền toà án với năm cột đá");
    hint(0, 0, W, 6.5, sky); /* đo với màu ĐẬM nhất của dải trời (đỉnh gradient) — trường hợp xấu nhất */ hint(0, 6.5, W, 1.0, deep);
    const tx = M + 0.3, tw = 6.2, runs = titleRuns(d.title, X.TH.l.text, c.acc, X.TH.titleBold), ft = fitTitle(runs, tw, [46, 42, 38, 34], 4);
    let y = 1.2;
    if (d.kicker) { X.T(s, plain(d.kicker), { _label: "kicker", x: tx, y, w: tw, h: 0.4, fontSize: 17, bold: true, color: c.acc }); y += 0.55; }
    X.T(s, runs, { _label: "title", x: tx, y, w: tw, h: ft.h, fontSize: ft.fz, fontFace: X.TH.titleFont }); y += ft.h + 0.2;
    s.addShape(X.pres.shapes.LINE, { x: tx, y, w: 3.8, h: 0, line: { color: X.TH.l.text, width: 1.5 } }); y += 0.2;
    if (d.subtitle) { X.T(s, d.subtitle, { _label: "subtitle", x: tx, y, w: tw, h: 0.75, fontSize: 17, color: X.TH.l.text }); y += 0.8; }
    if (d.author) X.T(s, [d.author, d.authorSub].filter(Boolean).join(" · "), { _label: "author", x: tx, y, w: tw, h: 0.45, fontSize: 16, bold: true, color: X.TH.l.text });
    if (meta.short) X.T(s, meta.short, { _label: "meta.short", x: tx, y: 6.72, w: 9, h: 0.4, fontSize: 15, color: X.TH.d.text, valign: "middle" });
  }
  async function porticoSection(s, c, d) {
    const sky = tint(0.86), deep = X.TH.d.bg, ps = parts(), cur = +d.num, n = Math.max(1, ps.length), hi = Math.max(0, ps.indexOf(cur));
    const pt = portico(860, 600, n, 230, 490, hi, c.acc, deep);
    await bg(`por-sec:${sky}:${deep}:${n}:${hi}:${c.acc}`, svgWrap(`<rect width="1600" height="900" fill="url(#sky)"/>` + pt.b + ground(deep), pDefs(sky)), `Mặt tiền toà án ${n} cột, cột thứ ${hi + 1} là chương đang trình bày`);
    hint(0, 0, W, 6.5, sky); /* đo với màu ĐẬM nhất của dải trời (đỉnh gradient) — trường hợp xấu nhất */ hint(0, 6.5, W, 1.0, deep);
    const [ccx, ccw] = pt.cs[hi]; hint(ccx - ccw / 2, 2.4, ccw, 3.6, c.acc);
    X.T(s, roman(cur), { _label: "num", x: ccx - 0.9, y: 3.9, w: 1.8, h: 1.0, fontSize: ccw > 0.6 ? 44 : 34, fontFace: X.TH.numFont, bold: true, color: c.onAcc, align: "center", valign: "middle" });
    const tx = M + 0.3, tw = 6.2, runs = titleRuns(d.title, X.TH.l.text, c.acc, X.TH.titleBold), ft = fitTitle(runs, tw, [46, 42, 38], 3);
    let y = 1.25;
    X.T(s, `Trụ thứ ${cur} trên ${n}`, { _label: "trụ x / n", x: tx, y, w: tw, h: 0.4, fontSize: 17, bold: true, color: c.acc }); y += 0.55;
    X.T(s, runs, { _label: "title", x: tx, y, w: tw, h: ft.h, fontSize: ft.fz, fontFace: X.TH.titleFont }); y += ft.h + 0.15;
    if (d.sub) { X.T(s, d.sub, { _label: "sub", x: tx, y, w: tw, h: 0.7, fontSize: 17, color: X.TH.l.text }); y += 0.75; }
    const inside = (Array.isArray(d.inside) ? d.inside : d._inside || []).slice(0, 3);
    if (inside.length) { y += 0.2; X.T(s, "Trong chương này", { _label: "trong chương này", x: tx, y, w: tw, h: 0.36, fontSize: 15, bold: true, color: X.TH.l.text }); y += 0.42;
      for (const [i, t] of inside.entries()) { const h = X.realH(t, { fontFace: X.TH.accentFont, fontSize: 18 }, tw, 0.35) + 0.08; if (y + h > 6.3) break; X.T(s, t, { _label: `trong chương ${i + 1}`, x: tx, y, w: tw, h, fontSize: 18, fontFace: X.TH.accentFont, italic: X.TH.accentItalic, color: X.TH.l.text }); y += h + 0.06; } }
    X.T(s, ps.map(p => `${roman(p)}  ${X.PARTS[p] || ""}`).join("     "), { _label: "các trụ", x: tx, y: 6.72, w: W - 2 * M - 0.3, h: 0.4, fontSize: 14, color: X.TH.d.text, valign: "middle" });
  }
  async function porticoEnd(s, c, d, meta) {
    const sky = tint(0.86), deep = X.TH.d.bg;
    let b = `<rect width="1600" height="900" fill="url(#sky)"/><g filter="url(#sh3)"><polygon points="160,370 800,140 1440,370" fill="#${ST.stone}" stroke="#${ST.stoneS}" stroke-width="3"/></g><polygon points="215,356 800,162 1385,356" fill="none" stroke="#${ST.stoneS}" stroke-width="2"/>`;
    b += `<rect x="120" y="370" width="1360" height="120" fill="#${ST.stone}" stroke="#${ST.stoneS}"/><rect x="140" y="384" width="1320" height="92" fill="none" stroke="#${ST.stoneS}"/>`;
    for (let i = 0; i < 7; i++) b += column(190 + i * 193, 490, 58, 290, null, deep);
    await bg(`por-end:${sky}:${deep}`, svgWrap(b + ground(deep), pDefs(sky)), "Trán tường toà án khắc thông điệp chính");
    hint(0, 0, W, 6.5, sky); /* đo với màu ĐẬM nhất của dải trời (đỉnh gradient) — trường hợp xấu nhất */ hint(1.0, 3.08, 11.33, 1.0, ST.stone); hint(0, 6.5, W, 1.0, deep);
    const msg = d.message != null ? d.message : d._message;
    if (msg) { const t = plain(msg).toUpperCase(); let fz = 30; // dải trán tường chỉ cao một dòng: thu cỡ chữ tới khi vừa (tính cả giãn chữ ~12% và chữ đậm của theme)
      for (fz of [30, 27, 24, 21, 18]) { const m = X.measure(t, { fontFace: X.TH.titleFont, fontSize: fz, bold: !!X.TH.titleBold }, 10.63 * 0.86); if (m.ok && m.lines === 1) break; }
      X.T(s, t, { _label: "message", x: 1.35, y: 3.2, w: 10.63, h: 0.76, fontSize: fz, fontFace: X.TH.titleFont, bold: !!X.TH.titleBold, color: X.TH.l.text, align: "center", valign: "middle", charSpacing: 2 }); }
    const tr = X.rich(d.title, X.TH.l.text, c.acc).map(r => ({ text: r.text, options: Object.assign({}, r.options, { fontFace: X.TH.accentFont, italic: X.TH.accentItalic }) }));
    X.T(s, tr, { _label: "title", x: 3.4, y: 1.9, w: 6.53, h: 0.65, fontSize: 30, align: "center", valign: "middle" });
    const team = (d.team || []).slice(0, 6), foot = [team.length ? (d.teamTitle || "Nhóm thực hiện") + ": " + team.map(m => m.name).join(", ") : "", d.sub || "", d.contact || ""].filter(Boolean).join("  ·  ");
    if (foot) X.T(s, foot, { _label: "team", x: M, y: 6.72, w: W - 2 * M, h: 0.4, fontSize: 15, color: X.TH.d.text, align: "center", valign: "middle" });
  }

  const S = { dossier: { cover: dossierCover, section: dossierSection, end: dossierEnd }, cadastral: { cover: cadastralCover, section: cadastralSection, end: cadastralEnd }, portico: { cover: porticoCover, section: porticoSection, end: porticoEnd } };
  return { has: (st, kind) => !!(S[st] && S[st][kind]), run: async (st, kind, s, c, d, meta) => { X.s = s; X.CUR.noMotif = true; await S[st][kind](s, c, d, meta); } };
}
module.exports = { make, STYLES: ["dossier", "cadastral", "portico"] };
