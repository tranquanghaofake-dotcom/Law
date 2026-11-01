# @luyen-luat/web — ứng dụng web Luyện Luật

Vite + Svelte 5 + TypeScript, build ra web tĩnh (PWA). Mỗi khái niệm đi qua **6 bậc ghi nhớ**, lịch ôn theo **FSRS** (`ts-fsrs`), tiến độ lưu trong trình duyệt (IndexedDB). Thiết kế: `../../docs/specs/`.

Nội dung luật lấy từ workspace `@luyen-luat/content`: `predev`/`prebuild` tự chạy `npm run content`, Vite plugin phục vụ `packages/content/dist` tại `/content/`.

## Lệnh (chạy ở gốc repo, hoặc trong thư mục này bỏ `-w`)
```bash
npm run dev              # http://localhost:5173
```
```bash
npm run check            # svelte-check
```
```bash
npm test                 # unit (Vitest, jsdom, pool vmThreads)
```
```bash
BASE_PATH=/Law/ npm run build && npm run preview    # như trên Pages, mở http://localhost:4173/Law/
```
```bash
PW_CHROMIUM=/opt/pw-browsers/chromium npm run e2e   # Playwright; máy khác: npx playwright install chromium
```
`PW_BASE_URL=https://…/Law/ npm run e2e` chạy e2e vào bản đã deploy (CI dùng cách này sau mỗi lần deploy).

## Cấu trúc
```
src/lib/content/   loader + re-export kiểu/schema từ @luyen-luat/content (import $lib/content/… không đổi)
src/lib/engine/    bậc ghi nhớ, FSRS, ghép phiên, chấm điểm, runner
src/lib/store/     Dexie (IndexedDB), kho tiến độ, stats, cài đặt
src/lib/game/      XP, bậc khoa cử, phẩm hàm, chuỗi ngày
src/lib/fx/        âm thanh (Kenney, CC0), confetti, nền lộ dần, TTS, rung
src/lib/ui/        thẻ bài tập (7 loại), phản hồi, cột đợt, màn kết thúc
src/routes/        Trang chủ, Phiên học, Ôn, Luyện đề 10 câu, Hồ sơ, Cài đặt
static/            icon, âm thanh, tranh nền, redirect /web/ cũ
tests/ · e2e/      Vitest · Playwright
```

## Triển khai
`.github/workflows/deploy.yml` chạy khi `main` đổi `apps/web/**` hoặc `packages/content/**`: test → build với `BASE_PATH=/Law/` → GitHub Pages. Địa chỉ: **https://tranquanghaofake-dotcom.github.io/Law/**. Cài đặt một lần: Settings → Pages → Source = **GitHub Actions**.

## Giấy phép tài nguyên
- Âm thanh: Kenney *Interface Sounds* (CC0) — `static/sfx/LICENSE.txt`.
- Tranh nền, biểu tượng: tự vẽ (SVG) cho dự án.
