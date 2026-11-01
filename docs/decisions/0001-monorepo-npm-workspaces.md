# ADR-0001 — Monorepo bằng npm workspaces, tách `packages/content` khỏi `apps/web`

Ngày: 01/11/2026 · Trạng thái: chấp nhận · Người quyết định: Trần Quang Hào (đề xuất: Claude)

## Bối cảnh
Repo có một app Svelte trong `web/` chứa luôn dữ liệu luật (`web/content/`), schema và script kiểm tra. Việc cập nhật nội dung (thường xuyên nhất) trộn diff với code app; test nội dung chạy chung jsdom chậm; `archive/` (video TikTok, web v1) chiếm phần lớn cây thư mục; 6 file cache `node_modules/` bị track.

## Quyết định
- `apps/web` (`@luyen-luat/web`) và `packages/content` (`@luyen-luat/content`) trong **npm workspaces** gốc; một `package-lock.json`.
- Nội dung: `packages/content/data/` → `npm run content` kiểm tra bằng zod và sinh `dist/` (không track); app phục vụ `dist/` tại `/content/` qua Vite plugin; `laws/` không ship.
- App import kiểu/schema qua `@luyen-luat/content/*`; hai file `apps/web/src/lib/content/{types,schema}.ts` chỉ re-export nên import `$lib/content/...` không đổi.
- `archive/` chuyển sang nhánh `archive`, xoá khỏi `main`.
- Không dùng Turborepo/pnpm/Nx: hai package, build 5 s, thêm công cụ không mua được gì.

## Hệ quả
+ Diff PR nội dung chỉ là JSON; test nội dung 0,4 s; có thể tái dùng dữ liệu cho app khác.
+ Cây thư mục gốc còn 5 mục; CI cache một lockfile.
− Thêm một bước `prebuild` (0,7 s); người mới cần biết chạy lệnh ở gốc repo.
