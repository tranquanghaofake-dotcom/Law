// Ráp bài mới từ thư viện style + khối.
//   node new.mjs --list                                   xem style và khối hiện có (đọc dòng mô tả đầu file)
//   node new.mjs <slug> --style ban-ve --blocks head,timeline,compare,tiles,sign [--title "…"] [--out <thư mục>]
//   node new.mjs <slug> --style san-khau --mau lam --blocks sk-mo,sk-o-ngay,sk-the,sk-do,sk-ket --out <thư mục>     (áp phích mặc định; --mau: luc | lam | nau)
// Có --out: tạo <thư mục>/<slug>/{index.html, ke-hoach.md, nguon.md, styles/} — bài tự đứng, chép kèm CSS, không ghi gì vào thư mục skill.
//   Dùng --out cho mọi bài của người dùng, và bắt buộc khi thư mục skill chỉ-đọc (claude.ai, skill đồng bộ từ tài khoản).
// Không --out: tạo examples/<slug>/ ngay trong skill (bài mẫu của thư viện). Không ghi đè nếu thư mục đã có index.html.
// Thêm style mới = thả 1 file styles/<ten>.css (dòng đầu: /* ten: mô tả. Hợp: … */).
// Thêm khối mới = thả 1 file blocks/<ten>.html (dòng đầu: <!-- ten: mô tả | hợp với … -->) + CSS của khối vào styles/_base.css.
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
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

const out = opt('--out');
const mau = opt('--mau');   // bảng màu của style san-khau: luc | lam | nau (bỏ trống = son)
const slug = args.find((a) => !a.startsWith('--') && a !== opt('--style') && a !== opt('--blocks') && a !== opt('--title') && a !== out && a !== mau);
const style = opt('--style');
const blocks = (opt('--blocks') || 'head,tiles,flow,sign').split(',').map((s) => s.trim());
const title = opt('--title') || 'Tiêu đề bài';
if (!slug || !style) { console.error('Cần <slug> và --style. Xem: node new.mjs --list'); process.exit(1); }
if (!existsSync(join(root, 'styles', style + '.css'))) { console.error('Không có style ' + style); process.exit(1); }
for (const b of blocks) if (!existsSync(join(root, 'blocks', b + '.html'))) { console.error('Không có khối ' + b); process.exit(1); }

const dir = out ? join(resolve(out), slug) : join(root, 'examples', slug);
const css = out ? 'styles/' : '../../styles/';
if (existsSync(join(dir, 'index.html'))) { console.error('Đã có ' + dir + '/index.html — không ghi đè.'); process.exit(1); }
mkdirSync(dir, { recursive: true });
if (out) {
  mkdirSync(join(dir, 'styles'), { recursive: true });
  for (const f of ['_base.css', style + '.css']) copyFileSync(join(root, 'styles', f), join(dir, 'styles', f));
}

let body = blocks.map((b) => readFileSync(join(root, 'blocks', b + '.html'), 'utf8').split('\n').slice(1).join('\n').trim()).join('\n\n  ');
if (out) {
  // bài tự đứng: nhân vật mẫu của khối được chép theo, đường dẫn đổi về assets/ cạnh index.html
  mkdirSync(join(dir, 'assets', 'avatars'), { recursive: true });
  body = body.replace(/\.\.\/\.\.\/assets\/avatars\/([\w-]+\.svg)/g, (_m, f) => {
    const src = join(root, 'assets', 'avatars', f);
    if (existsSync(src)) copyFileSync(src, join(dir, 'assets', 'avatars', f));
    return 'assets/avatars/' + f;
  });
}
const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="${css}_base.css">
<link rel="stylesheet" href="${css}${style}.css">
<style>
  /* chỉnh riêng cho bài này (giữ ngắn; thứ gì dùng lại được thì chuyển vào styles/) */
</style>
</head>
<body>
<main class="sheet${mau ? ' ' + mau : ''}">
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

## 3b. Tạo mới (chỉ khi thư viện không hợp — references/tao-moi.md)
- Kiểm độ hợp: style có ≥ 2/3 vật trang trí thuộc thế giới đề tài? khối có khớp hình dạng dữ liệu?
- 10 thứ người đọc thấy tận mắt:
- Vật chủ đạo (chở dữ liệu gì):        Vật phụ:
- Màu lấy từ vật thật:                 Font:
- Khối mới (phác ASCII):
- Kiểm "mới thật": che chữ có đoán ra đề tài không?

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
