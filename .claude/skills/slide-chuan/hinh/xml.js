// XML gốc PowerPoint mà pptxgenjs chưa có: chuyển cảnh Morph + tự sang slide, chuỗi hiệu ứng tự chạy / theo lần bấm (có cả hiệu ứng ra),
// và nhúng font vào file. Cấu trúc p:timing lấy từ engine/build.js (đã chạy trên PowerPoint thật); cách nhúng font theo dom-to-pptx (MIT).
const fs = require("fs");

const P14 = 'xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main"';
/** Chuyển cảnh VÀO slide này. auto (ms) = slide này tự sang slide sau sau ngần ấy thời gian (null = chờ bấm). */
function transition(kind, { dur = 1000, auto = null, noClick = false } = {}) {
  const adv = (noClick ? ' advClick="0"' : "") + (auto != null ? ` advTm="${Math.round(auto)}"` : "");
  const fade = `<p:transition spd="med"${adv}><p:fade/></p:transition>`;
  if (kind === "none") return adv ? `<p:transition${adv}/>` : "";
  // Morph: PowerPoint 2019 / 365. Bản không hiểu Morph (LibreOffice, Google Slides) dùng phần Fallback = fade. Ghép cặp theo tên "!!…".
  if (kind === "morph") return `<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"><mc:Choice xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main" Requires="p159"><p:transition spd="slow" ${P14} p14:dur="${Math.round(dur)}"${adv}><p159:morph option="byObject"/></p:transition></mc:Choice><mc:Fallback>${fade}</mc:Fallback></mc:AlternateContent>`;
  if (kind === "push") return `<p:transition spd="med"${adv}><p:push dir="l"/></p:transition>`;
  return fade;
}

/** Thân một hiệu ứng VÀO. o.dur = đổi độ dài (ms); o.lin = chạy đều (không hãm cuối) — dùng khi cần khớp nhịp với một chuyển động khác. Trả { preset, sub, body }. */
function fxIn(fx, sp, id, o = {}) {
  const D = (base) => Math.round(o.dur || base), ez = o.lin ? "" : ' decel="100000"';
  const tg = `<p:tgtEl><p:spTgt spid="${sp}"/></p:tgtEl>`;
  const vis = `<p:set><p:cBhvr><p:cTn id="${id()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>${tg}<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>`;
  const anim = (attr, from, to, dur) => `<p:anim calcmode="lin" valueType="num"><p:cBhvr additive="base"><p:cTn id="${id()}" dur="${dur}"${ez} fill="hold"/>${tg}<p:attrNameLst><p:attrName>${attr}</p:attrName></p:attrNameLst></p:cBhvr><p:tavLst><p:tav tm="0"><p:val><p:strVal val="${from}"/></p:val></p:tav><p:tav tm="100000"><p:val><p:strVal val="${to}"/></p:val></p:tav></p:tavLst></p:anim>`;
  const rot = (from, to, dur) => `<p:anim calcmode="lin" valueType="num"><p:cBhvr><p:cTn id="${id()}" dur="${dur}"${ez} fill="hold"/>${tg}<p:attrNameLst><p:attrName>style.rotation</p:attrName></p:attrNameLst></p:cBhvr><p:tavLst><p:tav tm="0"><p:val><p:fltVal val="${from}"/></p:val></p:tav><p:tav tm="100000"><p:val><p:fltVal val="${to}"/></p:val></p:tav></p:tavLst></p:anim>`;
  const eff = (filter, dur) => `<p:animEffect transition="in" filter="${filter}"><p:cBhvr><p:cTn id="${id()}" dur="${dur}"${ez}/>${tg}</p:cBhvr></p:animEffect>`;
  switch (fx) {
    case "appear": return { preset: 1, sub: 0, body: vis };                                   // hiện tức thì (dùng cho số đếm)
    case "fade": return { preset: 10, sub: 0, body: vis + eff("fade", D(450)) };
    case "wipe": return { preset: 22, sub: 8, body: vis + eff("wipe(left)", D(520)) };         // quét từ trái (chiều đọc)
    case "wipe-r": return { preset: 22, sub: 2, body: vis + eff("wipe(right)", D(520)) };
    case "up": return { preset: 22, sub: 4, body: vis + eff("wipe(down)", D(620)) };           // mọc từ dưới lên (cột biểu đồ)
    case "down": return { preset: 22, sub: 1, body: vis + eff("wipe(up)", D(600)) };           // chạy từ trên xuống (giấy, dòng kẻ)
    case "stamp": return { preset: 31, sub: 0, body: vis + anim("ppt_w", "#ppt_w*1.9", "#ppt_w", D(300)) + anim("ppt_h", "#ppt_h*1.9", "#ppt_h", D(300)) + rot(-14, 0, D(300)) + eff("fade", 160) }; // con dấu đóng xuống
    case "pop": return { preset: 53, sub: 16, body: vis + anim("ppt_w", "#ppt_w*0.4", "#ppt_w", D(380)) + anim("ppt_h", "#ppt_h*0.4", "#ppt_h", D(380)) + eff("fade", Math.min(220, D(380))) };  // bật ra từ tâm
    case "slam": return { preset: 53, sub: 16, body: vis + anim("ppt_w", "#ppt_w*1.5", "#ppt_w", D(420)) + anim("ppt_h", "#ppt_h*1.5", "#ppt_h", D(420)) + eff("fade", 260) };                 // nện xuống
    case "slide": return { preset: 2, sub: 8, body: vis + anim("ppt_x", "#ppt_x-0.16", "#ppt_x", D(620)) + eff("fade", 300) };                                                             // trượt từ trái
    case "slide-r": return { preset: 2, sub: 2, body: vis + anim("ppt_x", "#ppt_x+0.16", "#ppt_x", D(620)) + eff("fade", 300) };
    case "drop": return { preset: 2, sub: 1, body: vis + anim("ppt_y", "#ppt_y-0.22", "#ppt_y", D(560)) + rot(-8, 0, D(560)) + eff("fade", 240) };                                            // thẻ rơi xuống, xoay về đúng góc
    case "fall": return { preset: 2, sub: 1, body: vis + anim("ppt_y", "#ppt_y-0.9", "#ppt_y", D(900)) + rot(-140, 0, D(900)) + eff("fade", 200) };                                           // hoa giấy rơi từ trên cao, vừa rơi vừa xoay
    case "flip": return { preset: 10, sub: 0, body: vis + anim("ppt_h", "#ppt_h*0.06", "#ppt_h", D(420)) + eff("fade", 250) };                                                             // tờ lịch lật xuống
    case "grow": return { preset: 17, sub: 8, body: vis + anim("ppt_w", "#ppt_w*0.02", "#ppt_w", D(520)) + anim("ppt_x", "#ppt_x-#ppt_w/2", "#ppt_x", D(520)) };                              // dài ra từ mép trái (thanh, mũi tên)
    default: return { preset: 42, sub: 0, body: vis + eff("fade", D(520)) + anim("ppt_x", "#ppt_x", "#ppt_x", D(520)) + anim("ppt_y", "#ppt_y+.04", "#ppt_y", D(520)) };                       // rise: nổi lên quãng ngắn
  }
}
/** Hiệu ứng RA: biến mất tức thì (số đếm) hoặc mờ dần. */
function fxOut(fx, sp, id) {
  const tg = `<p:tgtEl><p:spTgt spid="${sp}"/></p:tgtEl>`;
  const hide = (d) => `<p:set><p:cBhvr><p:cTn id="${id()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="${d}"/></p:stCondLst></p:cTn>${tg}<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="hidden"/></p:to></p:set>`;
  if (fx === "fade") return { preset: 10, sub: 0, body: `<p:animEffect transition="out" filter="fade"><p:cBhvr><p:cTn id="${id()}" dur="300"/>${tg}</p:cBhvr></p:animEffect>` + hide(299) };
  return { preset: 1, sub: 0, body: hide(0) };
}
/** Nhấn sau khi đã vào: pulse = phóng 108 % rồi tự về; teeter = lắc qua lại (cấu trúc theo preset Teeter của PowerPoint). */
function emph(kind, sp, t, id) {
  const tg = `<p:tgtEl><p:spTgt spid="${sp}"/></p:tgtEl>`;
  if (kind === "teeter") {
    const seg = (by, d) => `<p:animRot by="${by}"><p:cBhvr><p:cTn id="${id()}" dur="90" fill="hold"><p:stCondLst><p:cond delay="${d}"/></p:stCondLst></p:cTn>${tg}<p:attrNameLst><p:attrName>r</p:attrName></p:attrNameLst></p:cBhvr></p:animRot>`;
    return `<p:par><p:cTn id="${id()}" presetID="32" presetClass="emph" presetSubtype="0" fill="hold" grpId="2" nodeType="withEffect"><p:stCondLst><p:cond delay="${t}"/></p:stCondLst><p:childTnLst>${seg(240000, 0) + seg(-480000, 90) + seg(480000, 180) + seg(-480000, 270) + seg(240000, 360)}</p:childTnLst></p:cTn></p:par>`;
  }
  return `<p:par><p:cTn id="${id()}" presetID="6" presetClass="emph" presetSubtype="0" fill="hold" grpId="2" nodeType="withEffect"><p:stCondLst><p:cond delay="${t}"/></p:stCondLst><p:childTnLst><p:animScale><p:cBhvr><p:cTn id="${id()}" dur="200" autoRev="1" fill="hold"/>${tg}</p:cBhvr><p:by x="108000" y="108000"/></p:animScale></p:childTnLst></p:cTn></p:par>`;
}
/** Đường chuyển động thẳng: đi thêm (dx, dy) — tính bằng phần của bề ngang / bề cao slide — trong dur ms, chạy đều. */
const motion = (sp, mv, id) => `<p:par><p:cTn id="${id()}" presetID="0" presetClass="path" presetSubtype="0" fill="hold" grpId="3" nodeType="withEffect"><p:stCondLst><p:cond delay="${Math.round(mv.at)}"/></p:stCondLst><p:childTnLst><p:animMotion origin="layout" path="M 0 0 L ${+mv.dx.toFixed(5)} ${+mv.dy.toFixed(5)}" pathEditMode="relative" rAng="0" ptsTypes="AA"><p:cBhvr><p:cTn id="${id()}" dur="${Math.round(mv.dur)}" fill="hold"/><p:tgtEl><p:spTgt spid="${sp}"/></p:tgtEl><p:attrNameLst><p:attrName>ppt_x</p:attrName><p:attrName>ppt_y</p:attrName></p:attrNameLst></p:cBhvr></p:animMotion></p:childTnLst></p:cTn></p:par>`;

/**
 * Chuỗi hiệu ứng của một slide.
 * effects: [{ sp, isText, fx, at (ms), dur, lin, out (ms, tuỳ chọn), outFx, click (0 = tự chạy khi vào slide; n = lần bấm thứ n),
 *             em ("pulse" | "teeter"), emAt (ms), mv ({ dx, dy, at, dur }) }]   — fx có thể vắng nếu chỉ có em / mv.
 */
function timing(effects) {
  if (!effects.length) return "";
  let n = 3; const id = () => n++;
  const groups = new Map();
  for (const e of effects) { const k = e.click || 0; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(e); }
  const bld = { 0: new Set(), 1: new Set(), 2: new Set(), 3: new Set() }; let pars = "";
  for (const k of [...groups.keys()].sort((a, b) => a - b)) {
    // mỗi mốc là một node: vào, ra, nhấn, đi — xếp theo thời điểm; node đầu mở nhóm (afterEffect / clickEffect), các node sau "cùng lúc + trễ"
    const nodes = [];
    for (const e of groups.get(k)) {
      if (e.fx) nodes.push({ t: e.at || 0, kind: "in", e });
      if (e.out != null) nodes.push({ t: e.out, kind: "out", e });
      if (e.em) nodes.push({ t: e.emAt != null ? e.emAt : (e.at || 0) + 560, kind: "em", e });
      if (e.mv) nodes.push({ t: e.mv.at, kind: "mv", e });
    }
    nodes.sort((a, b) => a.t - b.t || (a.kind === "out" ? -1 : 1));
    let inner = "";
    nodes.forEach((nd, i) => {
      const { e } = nd, first = i === 0 ? (k ? "clickEffect" : "afterEffect") : "withEffect";
      let x;
      if (nd.kind === "em") { x = emph(e.em, e.sp, Math.round(nd.t), id); if (e.isText) bld[2].add(e.sp); }
      else if (nd.kind === "mv") { x = motion(e.sp, e.mv, id); if (e.isText) bld[3].add(e.sp); }
      else { const a = id(), f = nd.kind === "in" ? fxIn(e.fx, e.sp, id, e) : fxOut(e.outFx, e.sp, id);
        x = `<p:par><p:cTn id="${a}" presetID="${f.preset}" presetClass="${nd.kind === "in" ? "entr" : "exit"}" presetSubtype="${f.sub}" fill="hold" grpId="${nd.kind === "in" ? 0 : 1}" nodeType="withEffect"><p:stCondLst><p:cond delay="${Math.round(nd.t)}"/></p:stCondLst><p:childTnLst>${f.body}</p:childTnLst></p:cTn></p:par>`;
        if (e.isText) bld[nd.kind === "in" ? 0 : 1].add(e.sp); }
      inner += i === 0 ? x.replace('nodeType="withEffect"', `nodeType="${first}"`) : x;
    });
    const o = id(), i2 = id();
    const start = k ? `<p:cond delay="indefinite"/>` : `<p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond>`;
    pars += `<p:par><p:cTn id="${o}" fill="hold"><p:stCondLst>${start}</p:stCondLst><p:childTnLst><p:par><p:cTn id="${i2}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>${inner}</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>`;
  }
  const bl = [0, 1, 2, 3].map((g) => [...bld[g]].map((sp) => `<p:bldP spid="${sp}" grpId="${g}" animBg="1"/>`).join("")).join("");
  return `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>${pars}</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq></p:childTnLst></p:cTn></p:par></p:tnLst>${bl ? `<p:bldLst>${bl}</p:bldLst>` : ""}</p:timing>`;
}

/** Tên đối tượng → { spid, isText } đọc từ XML của slide. */
function shapeIds(xml) {
  const map = {};
  for (const m of xml.matchAll(/<(p:sp|p:pic|p:cxnSp)>\s*<p:nv\w+Pr>\s*<p:cNvPr id="(\d+)" name="([^"]*)"/g)) map[m[3].replace(/&amp;/g, "&")] = { sp: m[2], isText: m[1] === "p:sp" };
  return map;
}

/**
 * Gói một file TTF thành EOT KHÔNG NÉN, giữ nguyên từng byte của font gốc (mọi bảng: GPOS, cvt, fpgm, prep…).
 * Không dùng bộ chuyển của fonteditor-core: nó ghi lại font và bỏ 8 bảng, trong đó có các bảng chỉ dẫn vẽ nét —
 * chữ còn đủ nhưng có máy vẽ sai ở vài cỡ. Cấu trúc đầu file theo đặc tả EOT phiên bản 0x00020001 (W3C Submission).
 */
function ttfToEot(ttf) {
  const fontkit = require("fontkit"), f = fontkit.create(ttf), os2 = f["OS/2"], head = f.head;
  const u16 = (s) => Buffer.from(String(s || ""), "utf16le");
  const names = [f.familyName, f.subfamilyName, f.version || f.getName("version"), f.fullName].map(u16);
  const namesLen = names.reduce((a, b) => a + 2 + b.length + 2, 0);       // [độ dài 2 byte][chuỗi][đệm 2 byte] × 4
  const headLen = 82 + namesLen + 2;                                          // 82 byte cố định tới hết Padding1 · 4 khối tên · RootStringSize
  const h = Buffer.alloc(headLen); let o = 0;
  const w32 = (v) => { h.writeUInt32LE(v >>> 0, o); o += 4; }, w16 = (v) => { h.writeUInt16LE(v & 0xffff, o); o += 2; }, w8 = (v) => { h.writeUInt8(v & 0xff, o); o += 1; };
  w32(headLen + ttf.length); w32(ttf.length); w32(0x00020001); w32(0);        // EOTSize, FontDataSize, Version, Flags (0 = không nén, không mã hoá)
  const pan = os2.panose || []; for (let i = 0; i < 10; i++) w8(pan[i] || 0);
  w8(1); w8(os2.fsSelection && (os2.fsSelection.italic || (typeof os2.fsSelection === "number" && os2.fsSelection & 1)) ? 1 : 0);
  w32(os2.usWeightClass || 400); w16(typeof os2.fsType === "number" ? os2.fsType : 0); w16(0x504c);
  const ur = os2.ulCharRange || [0, 0, 0, 0], cp = os2.codePageRange || [0, 0];
  for (let i = 0; i < 4; i++) w32(ur[i] || 0); for (let i = 0; i < 2; i++) w32(cp[i] || 0);
  w32(head.checkSumAdjustment || 0); w32(0); w32(0); w32(0); w32(0); w16(0);  // CheckSumAdjustment, Reserved1–4, Padding1
  names.forEach((n) => { w16(n.length); n.copy(h, o); o += n.length; w16(0); });      // tên họ, kiểu, phiên bản, tên đầy đủ — sau mỗi tên là 2 byte đệm
  w16(0);                                                                      // RootStringSize = 0 (không khoá font theo địa chỉ web)
  return Buffer.concat([h, ttf]);
}

/**
 * Nhúng font vào PPTX: mỗi file TTF là MỘT họ riêng ở ô "regular" — đúng kiểu đã thử chạy trên PowerPoint (Anton).
 * Không ghép kiểu đậm vào họ thường: lần thử ghép "Be Vietnam Pro" + ExtraBold bị PowerPoint bỏ qua cả họ.
 * fonts: [{ face: "tên họ đúng như name ID 1 của file", file: "/đường/dẫn.ttf" }]
 */
async function embedFonts(zip, fonts) {
  let ct = await zip.file("[Content_Types].xml").async("string");
  if (!ct.includes('Extension="fntdata"')) ct = ct.replace("<Default ", '<Default Extension="fntdata" ContentType="application/x-fontdata"/><Default ');
  zip.file("[Content_Types].xml", ct);
  let rels = await zip.file("ppt/_rels/presentation.xml.rels").async("string"), pres = await zip.file("ppt/presentation.xml").async("string");
  let lst = "", n = 0;
  for (const f of fonts) {
    const id = `rIdFont${++n}`;
    zip.file(`ppt/fonts/font${n}.fntdata`, ttfToEot(fs.readFileSync(f.file)));
    rels = rels.replace("</Relationships>", `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/font" Target="fonts/font${n}.fntdata"/></Relationships>`);
    lst += `<p:embeddedFont><p:font typeface="${f.face}"/><p:regular r:id="${id}"/></p:embeddedFont>`;
  }
  if (!n) return 0;
  const block = `<p:embeddedFontLst>${lst}</p:embeddedFontLst>`;
  pres = pres.includes("<p:defaultTextStyle") ? pres.replace("<p:defaultTextStyle", block + "<p:defaultTextStyle") : pres.replace("</p:presentation>", block + "</p:presentation>");
  zip.file("ppt/presentation.xml", pres); zip.file("ppt/_rels/presentation.xml.rels", rels);
  return n;
}

module.exports = { transition, timing, shapeIds, embedFonts, ttfToEot };
