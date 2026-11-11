// Tải asset vào assets/ (một lần, lưu về máy để in offline).
//   node assets.mjs icon gavel scale key-round        icon Lucide (ISC) — tra tên ở lucide.dev/icons
//   node assets.mjs emoji coin house judge             hình dán màu Fluent Emoji (MIT) — tra tên ở icon-sets.iconify.design/fluent-emoji
//   node assets.mjs emoji --list | icon --list         in tên mọi hình dán / icon dùng được ngay (kho gộp assets/*.json + file lẻ)
//   node assets.mjs avatar Vy Khang                    nhân vật DiceBear Notionists (CC0) theo seed
//   node assets.mjs avatar-sheet Mai Tuan Huong       tải nhiều seed + in ảnh xem trước để chọn đúng vai
//   … --to <thư mục bài>                               lưu vào <thư mục bài>/assets/ thay vì thư viện của skill
//     (bắt buộc khi thư mục skill chỉ-đọc; icons.mjs tìm asset cạnh file HTML trước)
import { writeFileSync, readFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const argv = process.argv.slice(2);
const toAt = argv.indexOf('--to');
const to = toAt >= 0 ? argv.splice(toAt, 2)[1] : null;
const root = to ? resolve(to) : join(dirname(fileURLToPath(import.meta.url)), '..');
for (const d of ['assets/icons', 'assets/avatars', 'assets/emoji']) mkdirSync(join(root, d), { recursive: true });
const [kind, ...names] = argv;
// kho gộp của skill (assets/icons.json, assets/emoji.json): tên đã có trong kho thì không cần tải; `icon --list`, `emoji --list` in mọi tên dùng được
const khoDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');
const kho = (k) => (existsSync(join(khoDir, k + '.json')) ? JSON.parse(readFileSync(join(khoDir, k + '.json'), 'utf8')) : {});
if ((kind === 'icon' || kind === 'emoji') && names.includes('--list')) {
  const thu = kind === 'icon' ? 'icons' : 'emoji';
  const le = [khoDir, join(root, 'assets')].flatMap((d) => (existsSync(join(d, thu)) ? readdirSync(join(d, thu)).filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4)) : []));
  const ten = [...new Set([...Object.keys(kho(thu)), ...le])].sort();
  console.log(ten.join('  ') + `\n\n${ten.length} ${kind === 'icon' ? 'icon' : 'hình dán'} dùng được ngay.`);
  process.exit(0);
}
const LUCIDE = 'https://unpkg.com/lucide-static@0.460.0/icons/';
const EMOJI = 'https://api.iconify.design/fluent-emoji/';
const DICEBEAR = 'https://api.dicebear.com/9.x/notionists/svg?backgroundColor=transparent&seed=';

async function get(url, out) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  writeFileSync(out, await r.text());
}

if (kind === 'icon') {
  for (const n of names) {
    const out = join(root, 'assets/icons', n + '.svg');
    if (existsSync(out) || kho('icons')[n]) { console.log('có rồi:', n); continue; }
    try { await get(LUCIDE + n + '.svg', out); console.log('tải:', n); } catch (e) { console.warn('không có icon:', n); }
  }
} else if (kind === 'emoji') {
  for (const n of names) {
    const out = join(root, 'assets/emoji', n + '.svg');
    if (existsSync(out) || kho('emoji')[n]) { console.log('có rồi:', n); continue; }
    try { const r = await fetch(EMOJI + n + '.svg'); const s = r.ok ? await r.text() : ''; if (!s.includes('<svg')) throw new Error('không có'); writeFileSync(out, s); console.log('tải:', n); } catch (e) { console.warn('không có hình dán:', n); }
  }
} else if (kind === 'avatar' || kind === 'avatar-sheet') {
  for (const n of names) {
    const out = join(root, 'assets/avatars', `notionists-${n}.svg`);
    if (!existsSync(out)) await get(DICEBEAR + encodeURIComponent(n), out);
    console.log('nhân vật:', out);
  }
  if (kind === 'avatar-sheet') {
    const tmp = join(root, 'assets/avatars/_xem-truoc.html');
    writeFileSync(tmp, `<div style="display:flex;gap:10px;font:14px sans-serif">${names.map((n) => `<div style="text-align:center"><img src="notionists-${n}.svg" width="110"><br>${n}</div>`).join('')}</div>`);
    const { chromium } = createRequire(import.meta.url)('playwright');
    const b = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}).catch(() => chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }));
    const p = await b.newPage({ viewport: { width: Math.max(300, names.length * 122), height: 150 } });
    await p.goto(pathToFileURL(tmp).href);
    const png = join(root, 'assets/avatars/_xem-truoc.png');
    await p.screenshot({ path: png });
    await b.close();
    console.log('Xem trước:', png, '— xóa các seed không dùng.');
  }
} else {
  console.log('Dùng: node assets.mjs icon <tên…> | emoji <tên…> | avatar <seed…> | avatar-sheet <seed…>  [--to <thư mục bài>]');
}
