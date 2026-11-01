# Luyện Luật

Web học luật cho sinh viên: học từng khái niệm qua 6 bậc ghi nhớ (gặp → nhận biết → phân biệt → điền chỗ trống → tình huống → tự trả lời), ôn đúng lúc sắp quên (FSRS), có căn cứ điều luật gốc, bậc khoa cử và chuỗi ngày.

**👉 Vào làm bài:** ứng dụng nằm trong [`web/`](web/) (hướng dẫn chạy và triển khai trong [`web/README.md`](web/README.md)). Khi đã đưa lên Cloudflare Pages, link công khai sẽ được ghi tại đây.

Môn hiện có: **Luật Hiến pháp** (chương 1, 10 khái niệm) và 5 bộ luyện đề 10 câu (Pháp luật đại cương, Dân sự, Lao động, Hình sự).

## Trong repo
- [`web/`](web/) — ứng dụng Svelte 5 + Vite; nội dung học ở `web/content/` (khái niệm theo môn, bộ 10 câu, `SOURCES.md`).
- [`docs/`](docs/) — brief thương hiệu và **kế hoạch thiết kế web** (`docs/superpowers/specs/`).
- [`archive/`](archive/) — phần làm video TikTok (pipeline, kịch bản) đang **tạm dừng**, giữ lại để dùng sau.

## Chạy thử trên máy
```bash
cd web && npm install && npm run dev
```
Mở http://localhost:5173.

*Nội dung là thông tin pháp luật chung, không phải tư vấn pháp lý.*
