# Luyện Luật

Web học luật cho sinh viên: học từng khái niệm qua 6 bậc ghi nhớ (gặp → nhận biết → phân biệt → điền chỗ trống → tình huống → tự trả lời), ôn đúng lúc sắp quên (FSRS), có căn cứ điều luật gốc, bậc khoa cử và chuỗi ngày.

**👉 Vào làm bài: https://tranquanghaofake-dotcom.github.io/Law/** — tự deploy mỗi lần merge vào `main`.

Môn hiện có: **Luật Hiến pháp** (chương 1, 10 khái niệm) và 5 bộ luyện đề 10 câu (Pháp luật đại cương, Dân sự, Lao động, Hình sự).

## Cấu trúc
| Thư mục | Là gì |
|---|---|
| [`apps/web/`](apps/web/) | Ứng dụng Svelte 5 + Vite (PWA) — `@luyen-luat/web` |
| [`packages/content/`](packages/content/) | Dữ liệu luật (môn, khái niệm, bộ đề, toàn văn), schema zod, script kiểm tra — `@luyen-luat/content` |
| [`docs/`](docs/) | [`WORKFLOW.md`](docs/WORKFLOW.md) quy trình · `specs/` thiết kế · `plans/` kế hoạch · `decisions/` ADR · `brand/` |
| [`tools/`](tools/) | Chụp ảnh màn hình 4 kích cỡ |
| [`.github/`](.github/) | CI (PR), Deploy (main → Pages), E2E (sau deploy), template PR/issue |

Phần video TikTok và web v1 được giữ ở nhánh [`archive`](https://github.com/tranquanghaofake-dotcom/Law/tree/archive/archive).

## Chạy trên máy
```bash
npm install
```
```bash
npm run dev
```
Mở http://localhost:5173. Các lệnh khác: `npm run ci` (content → check → test → build, ~20 s), `npm run e2e`, `npm run shots` — xem [`docs/WORKFLOW.md`](docs/WORKFLOW.md).

## Đóng góp nội dung luật
Sửa JSON trong `packages/content/data/`, chạy `npm run content`, mở PR — hướng dẫn chi tiết ở [`packages/content/README.md`](packages/content/README.md).

*Nội dung là thông tin pháp luật chung, không phải tư vấn pháp lý.*
