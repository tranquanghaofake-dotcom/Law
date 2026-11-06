// Tải asset vào assets/ (một lần, lưu về máy để in offline).
//   node assets.mjs icon gavel scale key-round        icon Lucide (ISC) — tra tên ở lucide.dev/icons
//   node assets.mjs avatar Vy Khang                    nhân vật DiceBear Notionists (CC0) theo seed
//   node assets.mjs avatar-sheet Mai Tuan Huong       tải nhiều seed + in ảnh xem trước để chọn đúng vai
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [kind, ...names] = process.argv.slice(2);
const LUCIDE = 'https://unpkg.com/lucide-static@0.460.0/icons/';
const DICEBEAR = 'https://api.dicebear.com/9.x/notionists/svg?backgroundColor=transparent&seed=';

async function get(url, out) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  writeFileSync(out, await r.text());
}

if (kind === 'icon') {
  for (const n of names) {
    const out = join(root, 'assets/icons', n + '.svg');
    if (existsSync(out)) { console.log('có rồi:', n); continue; }
    try { await get(LUCIDE + n + '.svg', out); console.log('tải:', n); } catch (e) { console.warn('không có icon:', n); }
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
  console.log('Dùng: node assets.mjs icon <tên…> | avatar <seed…> | avatar-sheet <seed…>');
}
