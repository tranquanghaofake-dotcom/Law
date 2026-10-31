# Luyện Luật — web trắc nghiệm

Web tĩnh (HTML/CSS/JS, không cần máy chủ hay cơ sở dữ liệu). Mỗi bộ 10 câu, chấm ngay, có giải thích và căn cứ điều luật; điểm cao nhất lưu trên trình duyệt người học.

```
index.html, assets/      giao diện
data/sets/<id>.json      mỗi file một bộ câu hỏi
data/catalog.json        danh sách bộ — sinh tự động, không sửa tay
build_catalog.py         kiểm tra dữ liệu + sinh catalog
```

## Xem thử trên máy
```bash
cd web && python -m http.server 8000
```
Mở http://localhost:8000. (Mở thẳng file `index.html` sẽ không tải được dữ liệu.)

## Thêm hoặc sửa bộ câu hỏi
1. Tạo `data/sets/<id>.json`, theo mẫu `dat-coc.json`:
   - `group`: `video` (theo video TikTok, kèm `"video": "01"`) hoặc `pldc` (Pháp luật đại cương).
   - Mỗi câu: `q`, đúng 4 `options`, `answer` (chỉ số 0–3), `explain`, `basis` (điểm/khoản/điều + văn bản), `url` (có thể để trống).
2. Chạy `python web/build_catalog.py`. Bộ nào sai định dạng sẽ bị loại kèm thông báo lỗi.
3. Commit và push; trang tự cập nhật nếu đã nối với Cloudflare Pages (bên dưới).

Bộ sinh từ kịch bản đã duyệt (`video-XXXX.json`) do `python run.py export-web` trong pipeline tạo ra. Thứ tự phương án được xáo mỗi lượt, nên khi soạn không cần lo đáp án luôn nằm ở A.

## Đưa lên mạng (miễn phí) — Cloudflare Pages
Repo đang **private**. GitHub Pages chỉ miễn phí với repo public, nên dùng Cloudflare Pages, vốn kết nối được repo private:
1. https://dash.cloudflare.com → Workers & Pages → Create → Pages → **Connect to Git** → chọn repo `law`.
2. Build settings: Framework preset **None**, Build command **để trống**, Build output directory **`web`**.
3. Deploy. Bạn nhận link dạng `https://<tên>.pages.dev`; đặt link này vào bio TikTok. Mỗi lần push lên `main`, trang tự cập nhật.

## Cấu hình
Đầu file `assets/app.js`: `SITE.author` (tên hiển thị) và `SITE.reportUrl` (link Google Form "báo lỗi câu hỏi"; để trống thì ẩn).

## Trước khi thêm câu hỏi mới
Mọi `basis` phải đối chiếu nguyên văn văn bản **còn hiệu lực** (ưu tiên văn bản hợp nhất mới nhất). Bộ hiện có được đối chiếu ngày 31/10/2026.
