# Luyện Luật — ứng dụng web học khái niệm luật

Vite + Svelte 5 + TypeScript, build ra web tĩnh. Mỗi khái niệm đi qua **6 bậc ghi nhớ** (gặp → nhận biết → phân biệt → điền chỗ trống → tình huống → tự trả lời), lịch ôn theo **FSRS** (`ts-fsrs`), tiến độ lưu trong trình duyệt (IndexedDB). Thiết kế chi tiết: `../docs/superpowers/specs/2026-11-01-luyen-luat-web-design.md`.

## Chạy trên máy
```bash
cd web
npm install
npm run dev          # http://localhost:5173
```
```bash
npm test             # unit (Vitest)
npm run test:e2e     # Playwright; máy chưa có Chromium: npx playwright install chromium
npm run check        # svelte-check
npm run build        # kiểm tra nội dung rồi build ra dist/
```
Môi trường có Chromium cài sẵn ở đường dẫn riêng: `PW_CHROMIUM=/đường/dẫn/chromium npm run test:e2e`.

## Cấu trúc
```
src/lib/content/   kiểu dữ liệu, schema (zod), loader
src/lib/engine/    bậc ghi nhớ, FSRS, ghép phiên, chấm điểm, runner
src/lib/store/     Dexie (IndexedDB), kho tiến độ, stats, cài đặt
src/lib/game/      XP, bậc khoa cử, phẩm hàm, chuỗi ngày
src/lib/fx/        âm thanh (Kenney, CC0), confetti, nền lộ dần, TTS, rung
src/lib/ui/        thẻ bài tập (7 loại), phản hồi, cột đợt, màn kết thúc
src/routes/        Trang chủ, Phiên học, Ôn, Luyện đề 10 câu, Hồ sơ, Cài đặt
content/           subjects/, concepts/<môn>/, sets/ (bộ 10 câu), SOURCES.md
scripts/           build-content.ts — kiểm tra và sinh content/index.json
```

## Thêm nội dung
1. **Khái niệm**: tạo `content/concepts/<môn>/<id>.json` theo mẫu `content/concepts/hien-phap/hien-phap.json`. Bắt buộc: `definition` nguyên văn điều luật (hoặc sử liệu), `source`, `checked` (ngày đối chiếu), ít nhất 1 item bậc 1 (`mcq`), bậc 3 (`cloze`) và bậc 4 (`case`/`truefalse`); nên có `pair` (bậc 2) và `recall` (bậc 5).
2. **Đợt/chương**: thêm vào `content/subjects/<môn>.json`; mỗi đợt 4–5 khái niệm; `confusables` phải là id có thật.
3. **Bộ 10 câu**: `content/sets/<id>.json`, định dạng kế thừa v1 (`q, options×4, answer, explain, basis, url`), thêm `concept` nếu muốn cộng vào bộ nhớ.
4. Chạy `npm run content` — file lỗi sẽ bị liệt kê và **không lên web**. Ghi nguồn vào `content/SOURCES.md`.

Thẻ `pair`: `left`/`right` là **nhãn hiển thị** (tên khái niệm), không phải id.

## Triển khai (Cloudflare Pages)
Workers & Pages → Create → Pages → Connect to Git → repo này.
- Framework preset: **None** · Build command: `npm run build` · Build output directory: `dist` · **Root directory: `web`**.
- Mỗi lần push lên `main`, trang tự cập nhật. Ghi link `https://<tên>.pages.dev` vào README gốc.

## Giấy phép tài nguyên
- Âm thanh: Kenney *Interface Sounds* (CC0) — `static/sfx/LICENSE.txt`.
- Tranh nền, biểu tượng: tự vẽ (SVG) cho dự án.
- Văn bản pháp luật: không thuộc phạm vi bảo hộ quyền tác giả (Điều 15 Luật SHTT); xem `content/SOURCES.md`.
