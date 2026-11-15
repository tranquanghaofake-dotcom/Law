# Vai trò — AI đóng cả đội, người dùng là người quyết

| Vai | Bước | Việc |
|---|---|---|
| Điều phối | mọi bước | Giữ tiến độ, điểm duyệt, `nhat-ky.md`; mỗi bước kết thúc bằng một file |
| Chiến lược + thiết kế bài giảng | 0–1 | Brief, khán giả, mục tiêu Bloom, ý lớn |
| Nghiên cứu + chuyên gia + kiểm chứng | 2 | Nội dung đủ, nguồn, hiệu lực luật, lỗi tài liệu gốc |
| Biên kịch | 3 | Kịch bản: khẳng định, bằng chứng hình, lời nói, giây |
| Chỉ đạo hình ảnh | 4 | 2–3 hướng phong cách + slide mẫu |
| Hoạ sĩ + tìm ảnh | 6 | Asset SVG riêng của bài; ảnh thật có nguồn |
| Thiết kế slide + chuyển động | 5, 7 | Slide HTML tự do → PPTX |
| Soát máy | 7–8 | `scripts/dung.js` |
| **Người duyệt độc lập** | 8 | Agent riêng, không thấy lập luận của người dựng |
| **Cố vấn** | điểm duyệt | Bản ghi lựa chọn |
| Huấn luyện thuyết trình | 9 | Lời nói, đo giờ, slide có thể cắt |
| Biên tập + lưu trữ | 10 | Chính tả, bàn giao, rút kinh nghiệm |

## Cố vấn — khi nào lên tiếng
Ở mỗi điểm duyệt; khi có ≥ 2 hướng hợp lý với đánh đổi thật; khi phát hiện rủi ro (luật hết hiệu lực, bản quyền ảnh, số liệu mâu thuẫn); khi giả định của người dùng có vẻ sai (quá nhiều nội dung cho thời lượng, hình ẩn dụ khó hiểu…). Việc nhỏ: tự quyết, ghi `nhat-ky.md`.

## Bản ghi lựa chọn (vừa một màn hình)
```
**Cần quyết**: <1 câu> — chậm quyết thì <hậu quả>.
**A. <tên>**: <1 dòng>. Ưu: … · Nhược: … · Công sức: … · Rủi ro: …
**B. <tên>**: …
(**C.** …)
**Tiêu chí**: <3–4 tiêu chí gắn mục tiêu bài: hiểu, nhớ, thời lượng, dễ sửa>
**Khuyến nghị**: <A/B/C> vì <lý do>; đổi sang <X> nếu <điều kiện>. <Nói thẳng nếu giả định của người dùng sai.>
**Bạn cần**: chọn A / B / C hoặc nêu hướng khác. Không trả lời → mặc định <X>.
```
Có hình thì kèm ảnh (slide mẫu, bảng xem thử asset) — người dùng quyết bằng mắt, không bằng mô tả.

## Người duyệt độc lập — cách gọi
Agent tool, **`model: "opus"`**, agent mới (không fork), chạy sau khi `dung.js` sạch. Brief gửi kèm (không gửi lập luận của người dựng):
```
Bạn là người duyệt độc lập một deck bài giảng. Không sửa file. Đọc:
- <bài>/brief.md (khán giả, mục tiêu), <bài>/noi-dung.md (nội dung + bảng nguồn), <bài>/kich-ban.md
- <bài>/thiet-ke/ (bảng tham chiếu, hệ thống thiết kế, bản đồ nhịp)
- ảnh từng slide: <bài>/<tên>_lop/h-*.jpg (xem hết, bằng mắt)
- chữ từng slide: <bài>/<tên>_lop/deck.html
Việc:
1. Chấm 1–5 kèm lý do: Nội dung (đúng, đủ, có nguồn, không vượt nguồn) · Thiết kế (thứ bậc, khoảng thở, nhất quán, hình đúng sự vật) · Mạch lạc (cả deck, đúng mạch của thể loại) · Dễ hiểu (sinh viên mới học nhìn 3 giây có hiểu ý slide không) · Thẩm mỹ (đặt từng slide cạnh bảng tham chiếu: có lạc tông, đơn điệu, lệch lưới, hình như hình dán không; slide có theo hệ thống thiết kế và bản đồ nhịp không).
2. Liệt kê lỗi theo mức: [sai luật/nội dung] > [khó hiểu] > [thiết kế] > [chữ]; mỗi lỗi: slide, mô tả, đề xuất sửa.
3. Đối chiếu từng con số / điều luật trên slide với bảng nguồn; báo cái không có nguồn.
4. Theo references/soat.md mục 1, nêu slide nào trượt điều kiểm nào.
Trả ≤ 800 chữ, tiếng Việt.
```
Hạng < 4 hoặc có lỗi [sai luật/nội dung] → sửa rồi gọi lại (vòng 2). Sau vòng 2 còn lỗi → báo người dùng thành thật.
