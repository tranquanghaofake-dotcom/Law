# Nguồn hình theo vai — đạt độ hoàn thiện của mẫu chuyên nghiệp mà không dùng AI

Vì sao (nghiên cứu 15/11/2026, spec mục 13): mẫu bán slide đẹp nhờ (1) **một hình chính lớn** (30–45 % slide, 2–4 phần tử), (2) **hình do hoạ sĩ vẽ** hoặc ảnh thật, (3) **chữ tương phản** (chữ có chân lớn + chữ không chân), (4) mảng màu lớn. SVG ghép khối bằng code chỉ đạt hình khối đơn giản — không dùng làm hình chính nữa.

**Chọn một họ hình chính cho cả deck** (`bo-cuc.md` mục 1): ảnh tư liệu + nét, **hoặc** minh hoạ CC0 + nét — không trộn ảnh tư liệu với nhân vật hoạt hình trong cùng deck.

| Vai của hình | Nguồn | Công cụ | Ghi công |
|---|---|---|---|
| Lịch sử, bối cảnh, ví dụ thực tế (nhà cháy, tai nạn, toà án, văn bản cổ) | ảnh / tranh tư liệu **phạm vi công cộng** (Wikimedia Commons), ảnh CC0 / Unsplash / Pexels | `scripts/find_images.py`, `fetch_image.py` → `scripts/hai_mau.js` (tô hai màu theo bảng màu) | TASL trong `ghi-cong.md`, chú thích nhỏ trên slide nếu là tư liệu |
| Con người, các bên, tình huống | **Open Peeps** (Pablo Stanley, CC0): 23 dáng đứng, 11 dáng ngồi, 53 tóc, 33 nét mặt | `node scripts/nhan_vat.js <ra.svg> --dang= --toc= --mat= --da= --ao= --quan=` (`--ds` để xem danh sách) | không bắt buộc; nên ghi "Open Peeps — CC0" |
| Danh sách, bước, thuộc tính, mục lục | **Tabler Icons** (MIT), một độ dày nét cho cả deck | `node scripts/icon.js <bài> tên… --mau= --net=1.5` (`--tim=từ`) | "Tabler Icons, MIT" |
| Số liệu, tỉ lệ, quan hệ, quy trình | dựng bằng code (SVG / `hinh/bang.css`) — phải đúng tỉ lệ thật | — | — |
| Câu chốt, định nghĩa, trích luật | **chữ là hình**: chữ có chân `Lora` cỡ 56–80 px, số lớn 200–340 px | CSS `font-family: Lora` | — |

## Quy tắc
1. **Mỗi slide một tiêu điểm**: hình chính hoặc số lớn chiếm 30–45 % diện tích; 2–4 phần tử thị giác; tỉ lệ phần tử lớn nhất / nhỏ nhất ≥ 8 lần. Không rải 8–12 vật nhỏ đều khắp slide.
   Giới hạn của máy đo (`◇ tiêu điểm`): một tấm nền / thẻ lớn cũng được tính là khối thị giác, kể cả khi vật bên trong nhỏ — tấm nền **gom** bố cục chứ **không thay** hình chính; phải nhìn ảnh để chắc hình chính đủ lớn.
2. **Nhìn slide là nắm toàn bộ ý**: nhãn đặt lên hình (tên bên, tên dòng tiền), ý cốt lõi viết thành cụm ngắn cạnh hình — hình chở nội dung, không thay nội dung.
3. **Đồng bộ**: nhân vật Open Peeps cùng màu viền (màu mực của bài), quần áo theo màu vai trò; ảnh cùng một cặp màu hai tông; icon cùng một độ dày, một màu.
4. **Không trộn** nhân vật Open Peeps với hình người kiểu khác trong cùng deck; icon Tabler không trộn bộ icon khác.
5. Ảnh: chỉ ảnh có giấy phép rõ; chữ không đặt lên phần ảnh rối (đặt cạnh hoặc trên mảng màu phẳng).
6. Tài nguyên tải về bộ nhớ đệm (`~/.cache/slide-chuan`, lần đầu cần mạng npm) — không chép vào skill.

## Ảnh chụp hiện đại (Unsplash) và minh hoạ unDraw — hướng "tư vấn pháp lý", Chương 3 (15/11/2026)
Hai nguồn này nâng trần chất lượng rõ nhất ("wow"): ảnh chụp thật sắc nét cho bìa / mở phần / trích luật; minh hoạ do hoạ sĩ vẽ cho người và tình huống. Cả hai **không phải ảnh AI**, giấy phép cho dùng tự do, không bắt ghi công — vẫn ghi đủ trong `ghi-cong.md`. Phải được chủ bài duyệt (CLAUDE.md).
- **Unsplash**: `unsplash.com` có lớp chặn máy và API cần khoá. Cách làm: Firecrawl `firecrawl_scrape` trang `https://unsplash.com/s/photos/<từ-khoá>?license=free` (formats `links`) → chọn ảnh; scrape trang ảnh (formats `images`) → lấy `images.unsplash.com/photo-<số>-<mã>` từ `og:image` → `curl "https://images.unsplash.com/photo-…?fm=jpg&q=85&w=2400"`. Chỉ dùng ảnh trang ghi "Free Photo" (không Unsplash+).
- **Xử lý ảnh**: `node scripts/phu_mau.js <vào> <ra> --rong= --cao= --tieu=x,y [--tu=trai|phai|duoi|tren --dac= --den=] [--cheo=0.2]` — cắt theo điểm nhìn, phủ dải màu chủ để đặt chữ lên ảnh, hoặc cắt chéo mép trái (PNG trong suốt) cho bố cục tạp chí; dải màu nhấn chạy theo mép chéo.
- **unDraw**: tìm `curl "https://undraw.co/api/search?q=<từ>"` → dùng trường `media` (đường dẫn `cdn.undraw.co/illustration/…` hoặc `…/illustrations/…`; dựng lại đường dẫn từ `newSlug` có thể ra trang lỗi 27 KB). Lưu vào `asset/undraw/` của bài; tô lại theo bảng màu bằng bảng ánh xạ màu (màu nhấn #6c63ff → màu chủ, xám đậm → mực, xám nhạt → kẻ / màu nhạt, da → da) — xem `minh-hoa.js` của bài Chương 3 (`unDraw()`), lồng vào lớp hình bằng `<svg>` con, khai `data-loai="undraw"`.
- **Phân vai trong một deck**: ảnh chụp cho bìa, mở phần, trích luật, câu chốt (cảm xúc, bối cảnh); unDraw cho người và tình huống (bên mua, giao kết, câu hỏi); vật phẳng tự vẽ + khối tô đặc cho sơ đồ, số liệu. Cùng bảng màu → không hổ lốn.

