// Chèn icon SVG từ assets/icons vào HTML (sửa tại chỗ, chạy lại bao nhiêu lần cũng được).
// Trong HTML viết: <span class="ico" data-icon="gavel"></span>  → nội dung span được thay bằng SVG.
// Dùng: node icons.mjs <index.html>   (chèn cả icon data-icon lẫn minh họa data-illus)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const file = process.argv[2];
if (!file) {
  console.error('Thiếu đường dẫn file HTML.');
  process.exit(1);
}
const iconDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'icons');
const illusDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'illustrations');
const htmlPath = resolve(file);
let html = readFileSync(htmlPath, 'utf8');
const missing = new Set();

html = html.replace(
  /(<(span|i)\b[^>]*\bdata-icon="([a-z0-9-]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g,
  (_m, open, _tag, name, _inner, close) => {
    const p = join(iconDir, `${name}.svg`);
    if (!existsSync(p)) {
      missing.add(name);
      return open + close;
    }
    const svg = readFileSync(p, 'utf8')
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
    const p = join(illusDir, `${name}.svg`);
    if (!existsSync(p)) { missing.add('illus:' + name); return open + close; }
    return open + readFileSync(p, 'utf8').replace(/<!--[\s\S]*?-->/g, '').trim() + close;
  },
);
writeFileSync(htmlPath, html);
if (missing.size) {
  console.warn('Thiếu icon:', [...missing].join(', '), '— tải từ https://unpkg.com/lucide-static@0.460.0/icons/<tên>.svg vào assets/icons/');
  process.exit(1);
}
console.log('Đã chèn icon vào', htmlPath);
