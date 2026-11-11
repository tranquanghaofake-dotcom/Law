// Vẽ biểu đồ / sơ đồ bằng hai thư viện mã nguồn mở rồi lưu thành SVG trong assets/illustrations/ — chèn vào bài bằng data-illus như mọi minh hoạ.
//   node bieu-do.mjs echarts <option.json|.mjs> --ten <tên> [--rong 968] [--cao 420]     Apache ECharts: treemap, sankey, sunburst, radar, phễu, lịch nhiệt…
//   node bieu-do.mjs antv <mô-tả.txt> --ten <tên> [--rong 968] [--giu-vien]              AntV Infographic: 276 mẫu sơ đồ (bậc thang, kim tự tháp, cây, vòng…)
//   node bieu-do.mjs antv --list [chữ lọc]                                               in tên các mẫu AntV
//   chung: --style <tên style> (lấy màu, phông; mặc định đọc từ index.html trong --to)   --to <thư mục bài>   --ssr (ECharts không dùng trình duyệt)
// --rong = bề rộng (px) của khung sẽ chứa hình trên trang: script dùng nó để báo cỡ chữ thật sau khi co giãn.
// Màu viết bằng tên biến của style: "$ink", "$accent", "$bad"… (mọi biến trong :root của styles/<tên>.css) — đổi style thì hình đổi màu theo.
// Hai thư viện KHÔNG đi kèm skill (hơn 100 MB): cài một lần ở thư mục bài —  npm install --prefix <thư mục bài> echarts @antv/infographic
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const argv = process.argv.slice(2);
const co = (k) => { const i = argv.indexOf('--' + k); if (i < 0) return null; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const bat = (k) => { const i = argv.indexOf('--' + k); if (i < 0) return false; argv.splice(i, 1); return true; };
const skill = join(dirname(fileURLToPath(import.meta.url)), '..');
const to = co('to'), goc = to ? resolve(to) : skill, ten = co('ten'), ssr = bat('ssr'), liet = bat('list'), giuVien = bat('giu-vien');
const rong = +(co('rong') || 968), cao = +(co('cao') || 420);
let style = co('style');
const [may, nguon] = argv;
const dung = (m) => { console.error(m); process.exit(2); };
if (!['echarts', 'antv'].includes(may)) dung('Dùng: node bieu-do.mjs echarts <option.json> --ten <tên>   |   node bieu-do.mjs antv <mô-tả.txt> --ten <tên>   |   node bieu-do.mjs antv --list');
if (!liet && (!ten || !/^[a-z0-9-]+$/.test(ten))) dung('Thiếu --ten <tên> (chữ thường không dấu, số, gạch nối) — tên file SVG và cũng là giá trị data-illus.');

// ── tìm thư viện: thư mục bài → thư mục đang đứng → thư mục skill → nơi cài chung (NODE_PATH) ──
const chung = (process.env.NODE_PATH || '').split(':').filter(Boolean);
function goi(tenGoi) {
  for (const n of [goc, process.cwd(), skill]) for (let d = n; ; d = dirname(d)) { const p = join(d, 'node_modules', tenGoi); if (existsSync(join(p, 'package.json'))) return p; if (d === dirname(d)) break; }
  for (const n of chung) if (existsSync(join(n, tenGoi, 'package.json'))) return join(n, tenGoi);
  dung(`Chưa cài ${tenGoi}. Cài một lần ở thư mục bài rồi chạy lại lệnh này:\n  npm install --prefix ${to || '<thư mục bài>'} ${tenGoi}\n(gói không đi kèm skill vì nặng)`);
}
const require = createRequire(import.meta.url);
async function moTrinhDuyet() {
  let chromium; try { ({ chromium } = require('playwright')); } catch { return null; }
  return (process.env.PW_CHROMIUM ? chromium.launch({ executablePath: process.env.PW_CHROMIUM }) : chromium.launch().catch(() => chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }))).catch(() => null);
}

// ── màu và phông của style: đọc :root trong styles/<tên>.css, gỡ var(--x) lồng nhau ──
if (!style && existsSync(join(goc, 'index.html'))) style = (readFileSync(join(goc, 'index.html'), 'utf8').match(/styles\/(?!_base)([\w-]+)\.css/) || [])[1];
const tepStyle = style && [join(goc, 'styles', style + '.css'), join(skill, 'styles', style + '.css')].find(existsSync);
const cssStyle = tepStyle ? readFileSync(tepStyle, 'utf8') : '', bien = {};
for (const m of (cssStyle.match(/:root\s*\{([^}]*)\}/) || [, ''])[1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) bien[m[1]] = m[2].trim();
const go = (v, n = 0) => (n > 8 ? v : v.replace(/var\(--([\w-]+)(?:,[^)]*)?\)/g, (_, k) => go(bien[k] ?? '', n + 1)));
for (const k in bien) bien[k] = go(bien[k]);
const font = (bien.font || 'Be Vietnam Pro').split(',')[0].replace(/['"]/g, '').trim();
const nhapPhong = (cssStyle.match(/@import[^;]+;/g) || []).join('\n');
const mau = (s) => String(s).replace(/\$([a-z][\w-]*)/g, (m, k) => bien[k] ?? m);
const thayMau = (o) => (typeof o === 'string' ? mau(o) : Array.isArray(o) ? o.map(thayMau) : o && typeof o === 'object' && o.constructor === Object ? Object.fromEntries(Object.entries(o).map(([k, v]) => [k, thayMau(v)])) : o);
const bang = [...new Set(['info', 'bad', 'good', 'accent', 'muted'].map((k) => bien[k]).filter((v) => /^#[0-9a-f]{3,8}$/i.test(v || '')))];

function luu(svg, ghi) {
  const dir = join(goc, 'assets', 'illustrations'); mkdirSync(dir, { recursive: true });
  const out = join(dir, ten + '.svg'); writeFileSync(out, svg);
  const coChu = [...svg.matchAll(/font-size:\s*([\d.]+)px|font:\s*[^;"]*?([\d.]+)px/g)].map((m) => +(m[1] || m[2])).filter(Boolean);
  const vb = (svg.match(/viewBox="([^"]+)"/) || [, `0 0 ${rong} ${cao}`])[1].split(/\s+/).map(Number), tl = rong / vb[2], nho = coChu.length ? Math.min(...coChu) * tl : null;
  console.log(`✓ ${out}\n  ${ghi} · khung ${Math.round(vb[2])}×${Math.round(vb[3])} → đặt rộng ${rong}px thì cao ${Math.round(vb[3] * tl)}px` + (nho ? ` · chữ nhỏ nhất ${nho.toFixed(1)}px` : ''));
  if (nho && nho < 12.5) console.warn(`  ⚠ chữ nhỏ nhất ${nho.toFixed(1)}px < 12,5px khi đặt rộng ${rong}px: cho hình rộng hơn, giảm số mục, hoặc đổi mẫu.`);
  console.log(`  chèn: <div class="illus" data-illus="${ten}"></div> rồi chạy icons.mjs` + (style ? '' : '  (chưa biết style: thêm --style <tên> để lấy đúng màu, phông)'));
}

if (may === 'antv') {
  const dirA = goi('@antv/infographic');
  if (liet) {
    const { getTemplates } = await import(pathToFileURL(join(dirA, 'esm/index.js')).href);
    const ds = getTemplates().filter((t) => !nguon || t.includes(nguon)).sort(), nhom = {};
    for (const t of ds) (nhom[t.split('-')[0]] ||= []).push(t);
    for (const k in nhom) console.log(`\n${k} (${nhom[k].length})\n  ` + nhom[k].join('\n  '));
    console.log(`\n${ds.length} mẫu. Khoá dữ liệu: sequence-* → sequences · list-* → lists · compare-* → compares · hierarchy-* → root · chart-* → values · relation-dagre-flow-* → nodes + relations (xem references/do-hoa.md mục 4).`);
    process.exit(0);
  }
  if (!nguon || !existsSync(nguon)) dung('Thiếu file mô tả AntV (dòng đầu: infographic <tên mẫu>; rồi data / theme).');
  let moTa = mau(readFileSync(nguon, 'utf8')).trim();
  if (!/^theme\b/m.test(moTa) && bang.length) moTa += `\ntheme\n  palette ${bang.join(' ')}`;
  const { renderToString } = await import(pathToFileURL(join(dirA, 'esm/ssr/index.js')).href);
  let svg = await renderToString(moTa);
  if (!svg || svg.length < 500) dung('AntV không vẽ được: kiểm tên mẫu (node bieu-do.mjs antv --list) và khoá dữ liệu (lists / sequences / items).');
  svg = svg.replace(/<\?xml[^>]*\?>\s*/g, '').replace(/<\?xml-stylesheet[^>]*\?>\s*/g, '')               // bỏ lời gọi phông Alibaba từ máy chủ ngoài
    .replace(/font-family="[^"]*"/g, `font-family="${font}"`).replace(/font-family:[^;"]+/g, `font-family:'${font}'`)
    .replace(/<svg ([^>]*?)>/, (m, a) => `<svg ${a.replace(/\s(?:height|width)="[^"]*"/g, '').replace(/\sstyle=""/, '')} role="img">`);
  let ghi = '';
  const b = giuVien ? null : await moTrinhDuyet();
  if (b) {
    // mẫu AntV chừa lề và chỗ cho tiêu đề: cắt khung về sát nét vẽ và chữ thật (đo bằng phông của style) để hình không ôm khoảng trống
    const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
    await p.setContent(`<style>${nhapPhong}\nbody{margin:0;font-family:'${font}'}svg{display:block}</style><div id="c">${svg}</div>`, { waitUntil: 'networkidle' }).catch(() => {});
    const vb = await p.evaluate(async () => {
      await document.fonts.ready;
      const s = document.querySelector('#c svg'), v = s.viewBox.baseVal; s.style.width = v.width + 'px'; s.style.height = v.height + 'px';
      const r0 = s.getBoundingClientRect(); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      const them = (r) => { if (r.width < 0.5 && r.height < 0.5) return; x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); };
      for (const el of s.querySelectorAll('path,rect,circle,ellipse,polygon,polyline,line,image,text,use')) {
        if (el.closest('defs,clipPath,mask,pattern,symbol')) continue;
        const cs = getComputedStyle(el), r = el.getBoundingClientRect();
        if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
        const rong0 = (c) => !c || c === 'none' || c === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(c);
        if (rong0(cs.fill) && rong0(cs.stroke)) continue;                                   // khung đo vô hình
        if (r.width > r0.width * 0.97 && r.height > r0.height * 0.97) continue;             // tấm nền phủ kín
        them(r);
      }
      const w = document.createTreeWalker(s, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) { if (!n.textContent.trim()) continue; const g = document.createRange(); g.selectNodeContents(n); for (const r of g.getClientRects()) them(r); }
      if (x1 < x0) return null; const le = 6;
      return [x0 - r0.left + v.x - le, y0 - r0.top + v.y - le, x1 - x0 + 2 * le, y1 - y0 + 2 * le].map((n) => +n.toFixed(1));
    });
    await b.close();
    if (vb) { svg = svg.replace(/viewBox="[^"]*"/, `viewBox="${vb.join(' ')}"`); ghi = ' · đã cắt sát hình'; }
  }
  luu(svg, `AntV Infographic · mẫu ${(moTa.match(/^infographic\s+(\S+)/) || [, '?'])[1]}${ghi}`);
  // mẫu có thể lặng lẽ bỏ mục (vd. kim tự tháp xếp tam giác chỉ nhận 3, 6, 10 mục) hoặc không vẽ trường desc: so chữ trong mô tả với chữ trong hình
  const trongHinh = svg.replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  const mat = [...moTa.matchAll(/^\s*(?:-\s*)?(?:label|desc|title)\s+(.+)$/gm)].map((m) => m[1].trim()).filter((t) => !trongHinh.includes(t));
  if (mat.length) console.warn(`  ⚠ ${mat.length} dòng chữ trong mô tả KHÔNG có trong hình (mẫu này bỏ bớt mục hoặc không vẽ trường đó): ${mat.slice(0, 4).map((t) => `"${t}"`).join(', ')}${mat.length > 4 ? '…' : ''}\n    → đổi mẫu, hoặc đổi số mục; đừng dùng hình thiếu nội dung.`);
} else {
  if (!nguon || !existsSync(nguon)) dung('Thiếu file option của ECharts (.json, hoặc .mjs export default — dùng khi cần hàm formatter).');
  const dirE = goi('echarts');
  let opt = extname(nguon) === '.json' ? JSON.parse(readFileSync(nguon, 'utf8')) : (await import(pathToFileURL(resolve(nguon)).href)).default;
  if (typeof opt === 'function') opt = opt({ bien, font, rong, cao });
  opt = thayMau(opt);
  const nen = { animation: false, animationDuration: 0, animationDurationUpdate: 0, backgroundColor: 'transparent', textStyle: { fontFamily: font, color: bien.ink || '#111', fontSize: 16 }, ...(bang.length ? { color: bang } : {}) };
  opt = { ...nen, ...opt, textStyle: { ...nen.textStyle, ...(opt.textStyle || {}) } };
  // hàm (formatter) không qua được ranh giới trình duyệt: option .mjs có hàm thì vẽ kiểu --ssr
  const coHam = JSON.stringify(opt, (k, v) => (typeof v === 'function' ? '__ham__' : v)).includes('__ham__');
  let svg, cach;
  const b = ssr || coHam ? null : await moTrinhDuyet();
  if (b) {
    // đo chữ bằng chính phông của style trong trình duyệt: nhãn không bị cắt, không lệch
    const p = await b.newPage({ viewport: { width: rong + 40, height: cao + 40 } });
    await p.setContent(`<style>${nhapPhong}\nbody{margin:0;font-family:'${font}'}</style><div id="c" style="width:${rong}px;height:${cao}px"></div>`, { waitUntil: 'networkidle' }).catch(() => {});
    await p.addScriptTag({ path: join(dirE, 'dist/echarts.min.js') });
    // nạp trước mọi phông và độ đậm có trong option: ECharts nhớ bề rộng chữ ngay lần đo đầu, phông về muộn là nhãn lệch
    const ho = new Set([font]), dam = new Set(['400', '700']);
    JSON.stringify(opt, (k, v) => { if (k === 'fontFamily' && typeof v === 'string') ho.add(v.split(',')[0].replace(/['"]/g, '').trim()); if (k === 'fontWeight') dam.add(String(v === 'bold' ? 700 : v === 'normal' ? 400 : v)); return v; });
    svg = await p.evaluate(async ({ opt, ho, dam }) => {
      await Promise.all(ho.flatMap((h) => dam.map((d) => document.fonts.load(`${d} 16px "${h}"`, 'Điều khoản ữ 0123').catch(() => {}))));
      const c = echarts.init(document.getElementById('c'), null, { renderer: 'svg' }); c.setOption(opt);
      await new Promise((r) => setTimeout(r, 500));   // chờ hết nhịp hiện nhãn (một số loại hình vẫn mờ dần dù đã tắt animation)
      return c.renderToSVGString();
    }, { opt, ho: [...ho], dam: [...dam] });
    await b.close(); cach = 'đo chữ bằng trình duyệt';
  }
  if (!svg) {
    const echarts = require(join(dirE, 'dist/echarts.js'));
    // không có canvas: ước lượng bề rộng chữ theo chữ cái gốc (bỏ dấu) để nhãn tiếng Việt không bị coi là rộng gấp đôi
    const hep = 'iljtfrI1.,:;!|\'()[] ', rongChu = 'mwMW@%';
    echarts.setPlatformAPI({ measureText(t, f) { const c = +((f || '').match(/([\d.]+)px/) || [, 12])[1], k = /\b(bold|[6-9]00)\b/.test(f || '') ? 1.06 : 1; let w = 0; for (const ch of String(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '')) w += hep.includes(ch) ? 0.3 : rongChu.includes(ch) ? 0.88 : /[A-ZĐ]/.test(ch) ? 0.68 : /\d/.test(ch) ? 0.6 : 0.55; return { width: w * c * k }; } });
    const c = echarts.init(null, null, { renderer: 'svg', ssr: true, width: rong, height: cao }); c.setOption(opt); svg = c.renderToSVGString(); c.dispose(); cach = 'ước lượng bề rộng chữ (không trình duyệt)';
  }
  svg = svg.replace(/<svg ([^>]*?)>/, (m, a) => `<svg ${a.replace(/\s(?:height|width)="[^"]*"/g, '').replace(/\sstyle="[^"]*"/, '')} role="img">`);
  luu(svg, `Apache ECharts · ${[...new Set([].concat(opt.series || []).map((s) => s.type))].join(', ') || '?'} · ${cach}`);
}
