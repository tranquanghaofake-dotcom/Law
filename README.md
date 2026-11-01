# Luyện Luật

Web học luật cho sinh viên: luyện khái niệm theo từng chương, chấm ngay, có giải thích và căn cứ điều luật.

**👉 Vào làm bài:** mở thư mục [`web/`](web/) (hướng dẫn chạy trong [`web/README.md`](web/README.md)). Khi đã đưa lên Cloudflare Pages, link công khai sẽ được ghi tại đây.

## Trong repo
- [`web/`](web/) — mã nguồn web (HTML/CSS/JS tĩnh) và dữ liệu câu hỏi `web/data/sets/*.json`.
- [`docs/`](docs/) — brief thương hiệu và **kế hoạch thiết kế web** (`docs/superpowers/specs/`).
- [`archive/`](archive/) — phần làm video TikTok (pipeline, kịch bản) đang **tạm dừng**, giữ lại để dùng sau.

## Chạy thử trên máy
```bash
cd web && python -m http.server 8000
```
Mở http://localhost:8000.

*Nội dung là thông tin pháp luật chung, không phải tư vấn pháp lý.*
