// Chèn icon SVG từ assets/icons vào HTML (sửa tại chỗ, chạy lại bao nhiêu lần cũng được).
// Trong HTML viết: <span class="ico" data-icon="gavel"></span>  → nội dung span được thay bằng SVG.
// Hình dán màu:   <span class="emo" data-emo="coin"></span>              → <img> trỏ tới assets/emoji/coin.svg (không nhúng thẳng: mỗi hình có bộ lọc riêng)
// Hình đếm:       <div class="dem" data-dem="100" data-on="8" data-emo="coin"></div>   → 100 đơn vị, 8 cái đầu đậm (class on), còn lại mờ (class off);
//                 bỏ data-emo thì đơn vị là ô trống để CSS tô (class o = chấm tròn, vuong = ô vuông).
// Dùng: node icons.mjs <index.html>   (chèn cả icon data-icon, minh họa data-illus, hình dán data-emo, hình đếm data-dem)
// Thứ tự tìm: assets/ cạnh file HTML (asset riêng của bài, tải bằng assets.mjs --to) rồi mới đến assets/ của skill.
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { resolve, dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const file = process.argv[2];
if (!file) {
  console.error('Thiếu đường dẫn file HTML.');
  process.exit(1);
}
const htmlPath = resolve(file);
const skillAssets = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
const localAssets = join(dirname(htmlPath), 'assets');
const find = (kind, name) => [join(localAssets, kind, `${name}.svg`), join(skillAssets, kind, `${name}.svg`)].find((p) => existsSync(p));
// kho gộp của skill: assets/icons.json, assets/emoji.json (tên → SVG) — một file thay cho hàng trăm file lẻ, vì claude.ai chỉ nhận zip skill tối đa 200 file
const khoCache = {};
const kho = (kind) => khoCache[kind] || (khoCache[kind] = existsSync(join(skillAssets, kind + '.json')) ? JSON.parse(readFileSync(join(skillAssets, kind + '.json'), 'utf8')) : {});
// nội dung SVG theo thứ tự: file lẻ cạnh bài → kho gộp → file lẻ của skill
const noiDung = (kind, name) => { const l = join(localAssets, kind, `${name}.svg`); if (existsSync(l)) return readFileSync(l, 'utf8'); if (kho(kind)[name]) return kho(kind)[name]; const k = join(skillAssets, kind, `${name}.svg`); return existsSync(k) ? readFileSync(k, 'utf8') : null; };
let html = readFileSync(htmlPath, 'utf8');
const missing = new Set();

html = html.replace(
  /(<(span|i)\b[^>]*\bdata-icon="([a-z0-9-]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g,
  (_m, open, _tag, name, _inner, close) => {
    const goc = noiDung('icons', name);
    if (!goc) {
      missing.add(name);
      return open + close;
    }
    const svg = goc
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s*class="[^"]*"/, '')
      .replace(/\s*width="24"\s*height="24"/, ' aria-hidden="true"')
      .replace(/\n\s*/g, ' ')
      .trim();
    return open + svg + close;
  },
);
// minh họa tự vẽ: <div class="illus" data-illus="ten"></div> → SVG trong assets/illustrations/ten.svg (màu theo currentColor)
html = html.replace(
  /(<(div|span)\b[^>]*\bdata-illus="([a-z0-9-]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g,
  (_m, open, _tag, name, _inner, close) => {
    const p = find('illustrations', name);
    if (!p) { missing.add('illus:' + name); return open + close; }
    return open + readFileSync(p, 'utf8').replace(/<!--[\s\S]*?-->/g, '').trim() + close;
  },
);
const emoSrc = (name) => {
  // hình dán luôn được chép vào assets/emoji/ cạnh file HTML: bài tự đứng, không trỏ ngược vào thư mục skill
  const to = join(localAssets, 'emoji', name + '.svg');
  if (!existsSync(to)) { const nd = noiDung('emoji', name); if (!nd) { missing.add('emoji:' + name); return null; } mkdirSync(join(localAssets, 'emoji'), { recursive: true }); writeFileSync(to, nd); }
  return relative(dirname(htmlPath), to).split(sep).join('/');
};
// hình đếm (làm trước data-emo vì cùng mang data-emo)
html = html.replace(/(<(div|span)\b[^>]*\bdata-dem="(\d+)"[^>]*>)([\s\S]*?)(<\/\2>)/g, (_m, open, _tag, n, _inner, close) => {
  const on = +((open.match(/\bdata-on="(\d+)"/) || [])[1] ?? n), emo = (open.match(/\bdata-emo="([a-z0-9-]+)"/) || [])[1], src = emo ? emoSrc(emo) : null;
  if (emo && !src) return open + close;
  return open + Array.from({ length: +n }, (_x, i) => `<i class="${i < on ? 'on' : 'off'}">${src ? `<img src="${src}" alt="">` : ''}</i>`).join('') + close;
});
html = html.replace(/(<(span|i|div|figure)\b(?![^>]*\bdata-dem=)[^>]*\bdata-emo="([a-z0-9-]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g, (_m, open, _tag, name, _inner, close) => {
  const src = emoSrc(name); return open + (src ? `<img src="${src}" alt="">` : '') + close;
});
writeFileSync(htmlPath, html);
if (missing.size) {
  console.warn('Thiếu:', [...missing].join(', '), '— tải bằng: node assets.mjs icon <tên…> | emoji <tên…> [--to <thư mục bài>]');
  process.exit(1);
}
console.log('Đã chèn icon vào', htmlPath);
