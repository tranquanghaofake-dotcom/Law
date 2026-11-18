#!/usr/bin/env node
// XƯỞNG GHÉP CẢNH — tách nhân vật / đồ vật khỏi minh hoạ Storyset rồi ghép thành cảnh riêng cho đúng ý slide (Hào duyệt 18/11/2026).
// Storyset vẽ mỗi cảnh trong khung 500 × 500, chia nhóm có tên (character-1, character-2, Desk, Stroller, Plant…), không transform,
// không <defs> → một nhóm bê sang cảnh khác vẫn nguyên nét, cùng giọng hình (cùng kiểu Rafiki, cùng màu nhấn đã tô lại).
//
//   node scripts/ghep_canh.js ds <minh_hoa.svg>                 → liệt kê nhóm + khung bao (x, y, rộng, cao trong hệ 500 × 500)
//   node scripts/ghep_canh.js dung <canh.json> <ra.svg> [--xem]  → ghép; --xem chụp <ra>.png để soát bằng mắt
//
// canh.json (đường dẫn tương đối theo thư mục chứa canh.json):
//   { "rong": 900, "cao": 600, "bong": "#EBEBEB",
//     "manh": [ { "tu": "anh/storyset/family-rafiki.svg", "nhom": "character-1", "x": 60, "y": 40, "cao": 520, "lat": false, "bo": ["Stroller"] },
//               { "tu": "…", "nhom": "Desk", "x": …, "y": …, "rong": 400 },                  // rong hoặc cao (giữ tỉ lệ)
//               { "svg": "<rect …/>", "x": 0, "y": 0 } ] }                                   // mảnh tự vẽ (biển hiệu, nhãn…), toạ độ của cảnh
//   Bỏ "rong"/"cao" của cảnh → khung tự ôm sát các mảnh (tiện tách một nhân vật làm hình riêng).
//   "lat": true = lật ngang (nhân vật quay mặt về phía kia). "bo": xoá nhóm con theo id bên trong mảnh. "bong": vệt bóng elip dưới chân mảnh.
// Thứ tự trong "manh" = thứ tự vẽ (sau đè trước). Ghi công Storyset như minh hoạ gốc (ghi-cong.md + slide cuối).
const fs = require("fs"), path = require("path");

const NS = "http://www.w3.org/2000/svg";
const moTrinhDuyet = () => { const exe = process.env.PW_CHROMIUM || (fs.existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
  return require("playwright").chromium.launch(exe ? { executablePath: exe } : {}); };
function layNhom(svg, id, bo = []) {
  let g = layTho(svg, id);
  for (const b of bo) g = g.replace(layTho(g, b), "");
  return g.replace(/\sid="[^"]*"/g, "");   // bỏ id trùng giữa các mảnh
}
function layTho(svg, id) {
  // lấy nguyên văn phần tử <g id="id">…</g> (cân bằng thẻ g lồng nhau)
  const mo = svg.search(new RegExp(`<g[^>]*\\sid="${id.replace(/[-]/g, "\\-")}"`));
  if (mo < 0) throw new Error(`không có nhóm "${id}"`);
  let i = mo, sau = 0;
  const re = /<g\b[^>]*?(\/?)>|<\/g>/g; re.lastIndex = mo;
  for (let m; (m = re.exec(svg)); ) {
    if (m[0] === "</g>") sau--; else if (!m[1]) sau++;
    if (sau === 0) { i = re.lastIndex; break; }
  }
  return svg.slice(mo, i);
}

// biến đổi: đưa khung bao {x,y,w,h} của mảnh về (x, y) với chiều cao/rộng đích, có thể lật ngang
function bienDoi(k, m) {
  const s = m.cao ? m.cao / k.h : m.rong ? m.rong / k.w : 1, w = k.w * s;
  return m.lat ? `translate(${(m.x + w).toFixed(1)} ${m.y}) scale(${(-s).toFixed(4)} ${s.toFixed(4)}) translate(${-k.x} ${-k.y})`
    : `translate(${m.x} ${m.y}) scale(${s.toFixed(4)}) translate(${-k.x} ${-k.y})`;
}

function ghep(spec, nguon) {   // nguon: { "<tu>": { svg, khung: { nhom: {x,y,w,h} } } }
  let o = "", mx = 0, my = 0;
  for (const m of spec.manh) {
    if (m.svg) { o += m.svg; continue; }
    const n = nguon[m.tu], k = n.khung[m.nhom];
    if (!k) throw new Error(`${m.tu}: không có khung nhóm "${m.nhom}"`);
    const s = m.cao ? m.cao / k.h : m.rong ? m.rong / k.w : 1;
    if (m.bong && spec.bong !== false) o += `<ellipse cx="${(m.x + (k.w * s) / 2).toFixed(1)}" cy="${(m.y + k.h * s).toFixed(1)}" rx="${((k.w * s) / 2).toFixed(1)}" ry="${(k.h * s * 0.025 + 6).toFixed(1)}" fill="${spec.bong || "#EBEBEB"}"/>`;
    o += `<g transform="${bienDoi(k, m)}">${layNhom(n.svg, m.nhom, m.bo || [])}</g>`;
    mx = Math.max(mx, m.x + k.w * s); my = Math.max(my, m.y + k.h * s);
  }
  const W = spec.rong || Math.ceil(mx), H = spec.cao || Math.ceil(my);   // không ghi kích thước cảnh → khung ôm sát các mảnh
  return `<svg xmlns="${NS}" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${o}</svg>`;
}

async function khungNhom(files) {   // đo getBBox từng nhóm có id trong Chromium
  const b = await moTrinhDuyet(), p = await b.newPage(), ra = {};
  for (const f of files) {
    await p.setContent(`<body style="margin:0">${fs.readFileSync(f, "utf8")}</body>`);
    ra[f] = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll("svg g[id]")].map((g) => { const r = g.getBBox(); return [g.id, { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }]; })));
  }
  await b.close(); return ra;
}

async function chup(svgFile, png) {
  const b = await moTrinhDuyet(), p = await b.newPage({ viewport: { width: 1000, height: 800 } });
  await p.setContent(`<body style="margin:0;background:#fff">${fs.readFileSync(svgFile, "utf8")}</body>`);
  await p.locator("svg").first().screenshot({ path: png }); await b.close();
}

if (require.main === module) {
  const [lenh, a, b2] = process.argv.slice(2);
  (async () => {
    if (lenh === "ds" && a) { const k = (await khungNhom([a]))[a]; for (const [id, v] of Object.entries(k)) console.log(`${id.padEnd(28)} x ${v.x} y ${v.y} rộng ${v.w} cao ${v.h}`); return; }
    if (lenh === "dung" && a && b2) {
      const spec = JSON.parse(fs.readFileSync(a, "utf8")), goc = path.dirname(path.resolve(a));
      const tu = [...new Set(spec.manh.filter((m) => m.tu).map((m) => path.resolve(goc, m.tu)))], kh = await khungNhom(tu), nguon = {};
      for (const m of spec.manh) if (m.tu) { const f = path.resolve(goc, m.tu); nguon[m.tu] = { svg: fs.readFileSync(f, "utf8"), khung: kh[f] }; }
      fs.mkdirSync(path.dirname(path.resolve(b2)), { recursive: true }); fs.writeFileSync(b2, ghep(spec, nguon));
      console.log(`✓ ${b2} (${spec.manh.length} mảnh)`);
      if (process.argv.includes("--xem")) { await chup(b2, b2.replace(/\.svg$/, ".png")); console.log(`  xem: ${b2.replace(/\.svg$/, ".png")}`); }
      return;
    }
    console.error("Dùng: ghep_canh.js ds <svg> | dung <canh.json> <ra.svg> [--xem]"); process.exit(2);
  })().catch((e) => { console.error("✗ " + e.message); process.exit(1); });
}
module.exports = { ghep, layNhom, bienDoi };
