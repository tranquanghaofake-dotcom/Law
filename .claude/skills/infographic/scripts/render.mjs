// Xuất infographic HTML (khổ A4 dọc, .sheet 1080×1528 px) → PNG + PDF A4 để in.
// Dùng: node render.mjs <index.html> [--gray]   (--gray: thêm bản xám khi định photo đen trắng)
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Không chết khi đầu ra bị cắt (vd. `| head`): vẫn ghi đủ PNG và PDF.
process.stdout.on('error', () => {});
process.stderr.on('error', () => {});
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
if (!file) {
  console.error('Thiếu đường dẫn file HTML.');
  process.exit(1);
}
const wantGray = args.includes('--gray');
const htmlPath = resolve(file);
const outDir = dirname(htmlPath);

// Chromium: PW_CHROMIUM nếu có; nếu bản Playwright không tìm thấy trình duyệt của nó thì thử /opt/pw-browsers/chromium.
async function launch() {
  if (process.env.PW_CHROMIUM) return chromium.launch({ executablePath: process.env.PW_CHROMIUM });
  try {
    return await chromium.launch();
  } catch (e) {
    const fallback = '/opt/pw-browsers/chromium';
    if (existsSync(fallback)) return chromium.launch({ executablePath: fallback });
    throw e;
  }
}

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1600 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const sheet = page.locator('.sheet');
const box = await sheet.boundingBox();
if (Math.abs(box.height / box.width - 297 / 210) > 0.01) {
  console.warn(`CẢNH BÁO: .sheet ${box.width}×${box.height} không đúng tỉ lệ A4 (1080×1528).`);
}
const overflow = await page.evaluate(() => {
  const s = document.querySelector('.sheet');
  return Math.max(0, s.scrollHeight - s.clientHeight);
});
if (overflow > 1) console.warn(`CẢNH BÁO: nội dung tràn ${overflow}px khỏi khổ A4.`);

// Tự kiểm bố cục: (1) chữ nằm ngoài vùng an toàn in, (2) chữ đè chữ, (3) chữ tràn khỏi khung.
// Phần tử cố ý ra sát mép gắn data-margin (ngưỡng 26 px ≈ 5 mm); nhãn cố ý nằm ngoài khung gắn data-free.
// Vật xoay nghiêng gắn data-tilt (hộp bao phình ra); chữ số cỡ áp phích gắn data-big (hộp chữ cao hơn nét chữ thật).
const issues = await page.evaluate(() => {
  const sheet = document.querySelector('.sheet').getBoundingClientRect();
  const out = [];
  const label = (el) => el.textContent.trim().replace(/\s+/g, ' ').slice(0, 40);
  // các đoạn chữ thật (theo dòng), không dùng hộp phần tử để tránh báo nhầm
  const runs = [];
  const walker = document.createTreeWalker(document.querySelector('.sheet'), NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const r = document.createRange();
    r.selectNodeContents(n);
    for (const b of r.getClientRects()) if (b.width > 1 && b.height > 1) runs.push({ el, b });
  }
  for (const { el, b } of runs) {
    const safe = el.closest('[data-margin]') ? 26 : 52;
    // chữ cỡ áp phích: hộp chữ của phông hiển thị (Anton…) cao hơn nét chữ thật → xét lề trên/dưới theo hộp của khối data-big
    const kh = el.closest('[data-big]'), kb = kh ? kh.getBoundingClientRect() : null;
    const tren = kb ? Math.max(b.top, kb.top) : b.top, duoi = kb ? Math.min(b.bottom, kb.bottom) : b.bottom;
    const d = Math.min(b.left - sheet.left, tren - sheet.top, sheet.right - b.right, sheet.bottom - duoi);
    if (d < safe) out.push(`Sát mép ${Math.round(d)}px (cần ≥${safe}): "${label(el)}"`);
  }
  const seen = new Set();
  for (let i = 0; i < runs.length; i++) {
    for (let j = i + 1; j < runs.length; j++) {
      const a = runs[i], c = runs[j];
      if (a.el === c.el || a.el.contains(c.el) || c.el.contains(a.el)) continue;
      const ta = a.el.closest('[data-tilt]'), tc = c.el.closest('[data-tilt]');
      if (ta && ta === tc) continue; // cùng một vật xoay nghiêng: hộp bao phình ra, không phải đè thật
      const w = Math.min(a.b.right, c.b.right) - Math.max(a.b.left, c.b.left);
      const h = Math.min(a.b.bottom, c.b.bottom) - Math.max(a.b.top, c.b.top);
      const big = a.el.closest('[data-big]') || c.el.closest('[data-big]');
      if (w > 2 && h > (big ? Math.max(a.b.height, c.b.height) * 0.22 : 3)) {
        const k = label(a.el) + '|' + label(c.el);
        if (!seen.has(k)) { seen.add(k); out.push(`Chữ đè chữ: "${label(a.el)}" ↔ "${label(c.el)}"`); }
      }
    }
  }
  // khung = tổ tiên gần nhất có nền hoặc viền nhìn thấy được (thẻ, thanh, con dấu…)
  const isBox = (x) => {
    const cs = getComputedStyle(x);
    const bg = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent';
    return bg || parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderLeftWidth) > 0;
  };
  const flagged = new Set();
  for (const { el, b } of runs) {
    if (el.closest('[data-free], [data-tilt]')) continue; // nhãn cố ý đặt ngoài khung (vd. số trên thanh đo), vật xoay nghiêng
    let box = el;
    while (box && !box.matches('.sheet') && !isBox(box)) box = box.parentElement;
    if (!box || box.matches('.sheet')) continue;
    const R = box.getBoundingClientRect();
    const bs = getComputedStyle(box);
    // so với mép trong của viền: chữ chạm/đè lên viền cũng tính là tràn
    const r = { left: R.left + parseFloat(bs.borderLeftWidth), right: R.right - parseFloat(bs.borderRightWidth), top: R.top + parseFloat(bs.borderTopWidth), bottom: R.bottom - parseFloat(bs.borderBottomWidth) };
    const over = Math.max(b.right - r.right, b.bottom - r.bottom, r.left - b.left, r.top - b.top);
    if (over > (el.closest('[data-big]') ? b.height * 0.22 : 1) && !flagged.has(el)) { flagged.add(el); out.push(`Chữ tràn khung ${Math.round(over)}px: "${label(el)}"`); }
  }
  return out;
});
if (issues.length) {
  console.warn(`TỰ KIỂM: ${issues.length} vấn đề bố cục`);
  for (const m of issues) console.warn('  - ' + m);
} else console.log('TỰ KIỂM: bố cục ổn (vùng an toàn, không đè chữ, không tràn khung).');

// Tự kiểm chữ: những lỗi mắt hay bỏ sót khi soát cả trang — mảnh mã lọt ra chữ, chỗ điền của khối mẫu chưa thay,
// chữ mồ côi, chữ quá nhỏ để in, viện dẫn viết tắt hoặc ngược trật tự, trang bỏ trống. Ngoại lệ có chủ đích: data-ok.
const textIssues = await page.evaluate(() => {
  const sheetEl = document.querySelector('.sheet');
  const sheet = sheetEl.getBoundingClientRect();
  const out = [];
  const tidy = (t) => t.replace(/\s+/g, ' ').trim();
  const short = (t) => tidy(t).slice(0, 44);
  const visible = (el) => { const cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > 0.05; };
  const nodes = [];
  const walker = document.createTreeWalker(sheetEl, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement;
    if (!tidy(n.textContent) || !visible(el) || el.closest('svg, style, script, [data-ok]')) continue;
    nodes.push({ n, el });
  }
  const all = nodes.map((x) => tidy(x.n.textContent)).join(' ');

  // 1. mảnh mã lọt ra chữ
  const debris = all.match(/\/[a-z][a-z0-9]*>|<\/?[a-z][a-z0-9]*|&[a-z]+;|\{\{|\}\}|\bundefined\b|\bNaN\b|\[object /);
  if (debris) out.push(`Mảnh mã lọt ra chữ "${debris[0]}" — sửa thẻ HTML ở: "${short(all.slice(Math.max(0, debris.index - 30), debris.index + 12))}"`);

  // 2. chỗ điền của khối mẫu chưa thay
  const PLACE = /^(…|\.\.\.|Tên|tuổi \/ vai|lý do( ngắn)?|quy tắc một dòng|căn cứ|việc cụ thể|Hành động một dòng|Tiêu đề bài|Câu hỏi người đọc quan tâm\?|Mốc \d|Nhãn( \d)?)$/i;
  const seenPlace = new Set();
  for (const { n } of nodes) {
    const t = tidy(n.textContent).replace(/^[·\-–]\s*/, '');
    if ((PLACE.test(t) || /(^|\s)Điều\s*(…|\.\.\.)$/.test(t) || /:\s*(…|\.\.\.)$/.test(t)) && !seenPlace.has(t)) { seenPlace.add(t); out.push(`Chỗ điền chưa thay: "${short(t)}"`); }
  }

  // 3. viện dẫn viết tắt hoặc ngược trật tự
  const cite = all.match(/(?:^|[\s(,;])(Đ\.?\s?\d+[a-z]?(\s*k\.?\s?\d+)?|k\.?\s?\d+\s+(?:Đ|Điều)\.?\s?\d+|Điều\s+\d+[a-z]?,?\s+khoản\s+\d+)/g);
  for (const c of [...new Set((cite || []).map((x) => tidy(x.replace(/^[\s(,;]/, ''))))].slice(0, 6)) out.push(`Viện dẫn sai quy cách "${c}" — viết đủ chữ "Điều", "khoản" và đi từ nhỏ đến lớn (dạng "khoản 2 Điều 328")`);

  // 4. chữ quá nhỏ để in (dưới 12,5 px ≈ 7 pt)
  const small = new Set();
  for (const { el } of nodes) {
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs < 12.4 && !small.has(el)) { small.add(el); if (small.size <= 5) out.push(`Chữ ${fs.toFixed(1)}px (cần ≥ 12,5): "${short(el.textContent)}"`); }
  }
  // chữ trong biểu đồ, sơ đồ chèn bằng data-illus (bieu-do.mjs): cỡ thật = cỡ khai báo × tỉ lệ co giãn của SVG trong khung
  for (const svg of sheetEl.querySelectorAll('.illus svg')) {
    if (svg.closest('[data-ok]')) continue;
    const vb = svg.viewBox && svg.viewBox.baseVal, k = vb && vb.width ? svg.getBoundingClientRect().width / vb.width : 1;
    const w2 = document.createTreeWalker(svg, NodeFilter.SHOW_TEXT);
    for (let n = w2.nextNode(); n; n = w2.nextNode()) {
      const el = n.parentElement; if (!tidy(n.textContent) || small.has(el)) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize) * k;
      if (fs < 12.4) { small.add(el); if (small.size <= 5) out.push(`Chữ trong hình ${fs.toFixed(1)}px (cần ≥ 12,5): "${short(el.textContent)}" — cho khung hình rộng hơn, hoặc vẽ lại bằng bieu-do.mjs với ít mục hơn`); }
    }
  }
  if (small.size > 5) out.push(`… và ${small.size - 5} chỗ chữ nhỏ khác`);

  // 5. chữ mồ côi: dòng cuối của một đoạn chỉ còn đúng một chữ ngắn
  const block = (el) => { let b = el; while (b !== sheetEl && getComputedStyle(b).display.startsWith('inline')) b = b.parentElement; return b; };
  const groups = new Map();
  for (const x of nodes) { const b = block(x.el); if (!groups.has(b)) groups.set(b, []); groups.get(b).push(x.n); }
  let bottom = sheet.top;
  for (const [b, list] of groups) {
    const words = [];
    for (const n of list) {
      const re = /\S+/g; let m;
      while ((m = re.exec(n.textContent))) {
        const r = document.createRange(); r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
        const rc = r.getBoundingClientRect();
        if (rc.width > 0) words.push({ w: m[0], y: rc.top + rc.height / 2, h: rc.height, bottom: rc.bottom });
      }
    }
    if (!words.length) continue;
    if (!b.matches('.sign') && !b.closest('.sign')) bottom = Math.max(bottom, ...words.map((w) => w.bottom));
    const last = words[words.length - 1];
    // cùng dòng = tâm chữ này nằm trong chiều cao chữ kia (chữ to nhỏ đặt cạnh nhau vẫn là một dòng)
    const same = (u, v) => Math.abs(u.y - v.y) < Math.max(u.h, v.h) * 0.5;
    const sameLine = words.filter((w) => same(w, last));
    let lines = 1; for (let i = 1; i < words.length; i++) if (!same(words[i], words[i - 1])) lines++;
    if (lines >= 2 && sameLine.length === 1 && last.w.length <= 10 && words.length >= 4) out.push(`Chữ mồ côi "${last.w}" một mình một dòng: "…${short(words.slice(-6).map((w) => w.w).join(' '))}"`);
  }

  // 6. trang bỏ trống phía dưới
  const gap = (sheet.bottom - 52 - bottom) / sheet.height;
  if (gap > 0.1) out.push(`Trang trống ${Math.round(gap * 100)}% phía dưới — thêm khối hành động, nới hình chính hoặc giãn khoảng cách giữa các khối`);
  return out;
});
if (textIssues.length) {
  console.warn(`TỰ KIỂM: ${textIssues.length} vấn đề chữ`);
  for (const m of textIssues) console.warn('  - ' + m);
} else console.log('TỰ KIỂM: chữ sạch (không mảnh mã, không chỗ điền sót, viện dẫn đúng quy cách, không chữ mồ côi, không chữ dưới 12,5 px, trang không bỏ trống).');

const png = join(outDir, 'infographic.png');
await sheet.screenshot({ path: png });
console.log('PNG:', png);

// PDF đúng khổ A4, không lề máy; thu phóng 1080 px → 210 mm.
const pdf = join(outDir, 'infographic.pdf');
await page.addStyleTag({ content: '@page{size:A4;margin:0} html,body{background:#fff!important} .sheet{margin:0!important}' });
await page.pdf({ path: pdf, format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, scale: 793.7 / box.width, pageRanges: '1' });
console.log('PDF:', pdf);

if (wantGray) {
  await page.addStyleTag({ content: '.sheet{filter:grayscale(1)}' });
  const gray = join(outDir, 'infographic-xam.png');
  await sheet.screenshot({ path: gray });
  console.log('Bản xám (thử photo đen trắng):', gray);
}
await browser.close();
