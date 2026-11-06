// Ráp bài mới từ thư viện style + khối.
//   node new.mjs --list                                   xem style và khối hiện có (đọc dòng mô tả đầu file)
//   node new.mjs <slug> --style ban-ve --blocks head,timeline,compare,tiles,sign [--title "…"]
// Tạo examples/<slug>/{index.html, ke-hoach.md, nguon.md}. Không ghi đè nếu thư mục đã có index.html.
// Thêm style mới = thả 1 file styles/<ten>.css (dòng đầu: /* ten: mô tả. Hợp: … */).
// Thêm khối mới = thả 1 file blocks/<ten>.html (dòng đầu: <!-- ten: mô tả | hợp với … -->) + CSS của khối vào styles/_base.css.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const firstLine = (p) => readFileSync(p, 'utf8').split('\n')[0].replace(/^\/\*|\*\/$|^<!--|-->$/g, '').trim();
const list = (dir, ext) => readdirSync(join(root, dir)).filter((f) => f.endsWith(ext) && !f.startsWith('_')).sort();

if (args.includes('--list') || !args.length) {
  console.log('STYLE (styles/):');
  for (const f of list('styles', '.css')) console.log('  ' + firstLine(join(root, 'styles', f)));
  console.log('\nKHỐI (blocks/):');
  for (const f of list('blocks', '.html')) console.log('  ' + firstLine(join(root, 'blocks', f)));
  process.exit(0);
}

const slug = args.find((a) => !a.startsWith('--') && a !== opt('--style') && a !== opt('--blocks') && a !== opt('--title'));
const style = opt('--style');
const blocks = (opt('--blocks') || 'head,tiles,flow,sign').split(',').map((s) => s.trim());
const title = opt('--title') || 'Tiêu đề bài';
if (!slug || !style) { console.error('Cần <slug> và --style. Xem: node new.mjs --list'); process.exit(1); }
if (!existsSync(join(root, 'styles', style + '.css'))) { console.error('Không có style ' + style); process.exit(1); }
for (const b of blocks) if (!existsSync(join(root, 'blocks', b + '.html'))) { console.error('Không có khối ' + b); process.exit(1); }

const dir = join(root, 'examples', slug);
if (existsSync(join(dir, 'index.html'))) { console.error('Đã có ' + dir + '/index.html — không ghi đè.'); process.exit(1); }
mkdirSync(dir, { recursive: true });

const body = blocks.map((b) => readFileSync(join(root, 'blocks', b + '.html'), 'utf8').split('\n').slice(1).join('\n').trim()).join('\n\n  ');
const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="../../styles/_base.css">
<link rel="stylesheet" href="../../styles/${style}.css">
<style>
  /* chỉnh riêng cho bài này (giữ ngắn; thứ gì dùng lại được thì chuyển vào styles/) */
</style>
</head>
<body>
<main class="sheet">
  ${body.replace('Câu hỏi người đọc quan tâm?', title)}
</main>
</body>
</html>
`;
writeFileSync(join(dir, 'index.html'), html);

writeFileSync(join(dir, 'ke-hoach.md'), `# Kế hoạch — ${title}

## 1. Brief
- Người đọc:
- Một câu phải nhớ:
- Một hành động phải làm:
- Khổ: A4 dọc, in màu bìa cứng
- Style: ${style} — vì sao hợp chủ đề:

## 2. Tìm hiểu
- Văn bản, điều khoản cần đọc nguyên văn (kèm hiệu lực):
- Người đọc điển hình thuộc nhóm nào của điều luật:
- Ngách (chỗ dễ hiểu sai, ngoại lệ, tình tiết đẩy khung, đơn vị tính):
- Thế giới hình ảnh của chủ đề (đồ vật, giấy tờ, nơi chốn):

## 3. Bố cục (thứ tự đọc)
${blocks.map((b, i) => `${i + 1}. ${b}: `).join('\n')}

## 4. Asset cần
- Icon (Lucide):
- Nhân vật:
- Minh họa tự vẽ (SVG):

## 5. Kiểm
- [ ] render.mjs "bố cục ổn"   - [ ] contrast.mjs 0 FAIL   - [ ] soát mắt người (SKILL.md Bước 7)
- [ ] phản biện (nếu cần)       - [ ] in thử 1 tờ
`);
writeFileSync(join(dir, 'nguon.md'), `# Bảng nguồn — ${title}\n\nĐối chiếu ngày …. Không in.\n\n| Khẳng định trên hình | Căn cứ | Hiệu lực | Link | Ghi chú |\n|---|---|---|---|---|\n`);
console.log('Đã tạo', dir, '\nTiếp: điền ke-hoach.md → nguon.md → sửa index.html → icons.mjs → render.mjs');
