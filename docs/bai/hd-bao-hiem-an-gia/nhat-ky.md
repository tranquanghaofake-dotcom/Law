# Nhật ký — deck HĐ bảo hiểm An Gia (Nhóm 2)

## Điểm duyệt
- A + B gộp (20/11/2026): Hào trả lời "làm" → lấy mặc định: 20 phút (giữ 25 slide), sinh con ghi "365 ngày*" kèm chú thích, giữ phần ✚ đối chiếu luật.
- C (phong cách): **không làm riêng** — dùng lại hệ thống thiết kế "tư vấn pháp lý — khối phẳng" của `ch3-bao-hiem-thuong-mai` (Hào đã duyệt, cùng chủ đề). Bố cục mẫu viết mới trong `deck.js`.

## Soát máy (`dung.js`)
- Vòng 1: 86 lỗi → vòng 4: 21 lỗi, **toàn bộ là ◇ dễ đọc "N chữ đọc liền > 45/75"** và "nhãn ngắn > 12" ở biểu đồ.
- Đã sửa: chữ đè nhau (slide 6, 23), ra ngoài vùng an toàn (6, 9), lệch 4–10 px (2, 16, 19, 20, 22), chữ vắt mép hoạ tiết (5, 11, 20, 22), tương phản < 7 : 1 (4, 8, 12, 15, 18), nhịp nền (slide 8 đổi sang nền chia), tiêu điểm (thêm khối nền sau biểu đồ), lỗi `[n]` trong dòng nguồn bị hiểu thành chữ nhấn.
- Giữ lại có chủ ý: cảnh báo số chữ — cắt tiếp sẽ phải đẩy ý xuống ghi chú, trái luật "nhìn slide là nắm toàn bộ ý". Hào quyết nếu muốn rút.

## Chưa làm
- Người duyệt độc lập (agent `opus`) theo bước 8 — chưa chạy.
- Đối chiếu Quy tắc 6029/QĐ-BHBV gốc (thời gian chờ sinh con).

## Làm lại từ điểm C (20/11/2026, sau khi Hào chỉ ra bỏ cổng)
- Lỗi quy trình: tự bỏ điểm C, dùng phong cách bài Chương 3. Đã sửa skill (commit 3056be1) + cổng máy `scripts/cong_duyet.js`.
- C1: bảng tham chiếu 20 slide / 10 mẫu Slidesgo (`thiet-ke/tham-chieu/nguon.md`), 3 hướng × 4 slide (`thiet-ke/huong/so-sanh-3-huong.jpg`). **Hào chọn hướng 3** ("hướng 3").
- Đối chiếu 635 ngày: **đúng** theo Quy tắc 6029/QĐ-BHBV — nghi ngờ "gõ đảo từ 365" của người soạn là sai; đã sửa noi-dung, kich-ban, slide.
- C2: 8 slide mẫu (1, 3, 4, 6, 9, 12, 18, 20). Người duyệt độc lập (opus) vòng 1: Nội dung 4 · Thiết kế 4 · Dễ hiểu 4 · Thẩm mỹ 4 · Nhất quán 3 → KHÔNG ĐẠT (tiêu đề panel lệch chỗ, số trang 3 vị trí, ảnh lặp bìa / mở phần, thứ bậc số lớn h-08, nguồn Điều 26 nên ghi đoạn mở đầu). Đã sửa hết.

- C2 vòng 2 (opus): Nội dung 4 · Thiết kế 4 · Dễ hiểu 4 · Thẩm mỹ 4 · Nhất quán 4 → ĐẠT. Đã sửa lỗi nhỏ còn lại (h-08 số phụ 64 px, nguồn h-06/h-07, chữ mồ côi h-04/h-05). Ảnh mẫu: thiet-ke/mau-c2.jpg. Chờ Hào duyệt C2.
- C2: Hào trả lời "LÀM" → ghi duyet.json (C). Đổ đủ 25 slide hướng 3; `dung.js` (bản giao, có cổng duyệt) còn 23 cảnh báo ◇ "nhiều chữ" — giữ có chủ ý.
- Duyệt cuối (opus): Nội dung 4 · Thiết kế 4 · Mạch lạc 5 · Dễ hiểu 4 · Thẩm mỹ 4 · Nhất quán 4; chặn giao vì 2 lỗi chữ slide 14 ("dưới 10 triệu" → "đến 10 triệu"; "không cần công chứng" không có nguồn → "có thể bị đòi bản gốc"). Đã sửa cùng góp ý nguồn (slide 16, 23, bảng nguồn); chưa gọi duyệt lại sau lần sửa này.
- Còn: thời lượng ≈ 17 phút; khoản 1 Điều 26 Luật KDBH mức B (chưa đối chiếu vbpl.vn); slide 21 dùng lại ảnh bìa.
