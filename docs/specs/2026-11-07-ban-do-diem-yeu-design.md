# Bản đồ điểm yếu ở trang Hồ sơ — thiết kế

Ngày: 07/11/2026 · Nhánh: `feat/ban-do-diem-yeu` · Đã được Hào duyệt phạm vi (phiên 07/11).

## Mục tiêu
Người học thấy ngay **bài nào mình hay sai nhất** và bấm một nút để ôn đúng bài đó, thay vì tự đoán.

## Dữ liệu
- Nguồn: bảng `reviews` (IndexedDB) — mỗi lượt trả lời có `conceptId`, `rating` (1 = sai), `level` (bậc lúc trả lời), `at`.
- Khái niệm → môn: `concepts.subject` (bảng tiến độ). Khái niệm → bài: `chapters[].lessons[].concepts` trong `subjects/<môn>.json`.
- Cửa sổ: 90 ngày gần nhất (điểm yếu cũ đã sửa thì tự rơi khỏi bảng).

## Tính toán (`engine/weak.ts`, thuần, có test)
- `weakLessons(reviews, where, opts)`: gom lượt trả lời theo (môn, bài); chỉ giữ bài có **≥ 5 lượt**; tỷ lệ đúng = lượt không phải `rating 1` / tổng. Sắp tăng dần theo tỷ lệ, hoà thì bài nhiều lượt hơn đứng trước. Trả tối đa 3 bài.
- `accuracyByLevel(reviews)`: tỷ lệ đúng theo bậc (Gặp … Tinh thông) — "dạng bài" theo thang bậc sẵn có.

## Giao diện
- Phần đóng/mở mới **"Điểm yếu"** trong Tổng quan của Hồ sơ (cùng kiểu accordion).
- Mỗi dòng: tên môn ngắn · tên bài · `x/y đúng (z%)` · nút **Ôn bài này** → `#/hoc/<môn>/<bài>`.
- Dưới cùng: thanh tỷ lệ đúng theo bậc (chỉ bậc có ≥ 5 lượt).
- Chưa đủ dữ liệu: "Làm thêm ít nhất 5 câu trong một bài để xem điểm yếu."

## Ngoài phạm vi
Không đổi FSRS, không đổi cách lưu, không thêm thư viện.

## Kiểm tra
Test engine (`tests/engine/weak.test.ts`), test UI panel, `npm run ci`, ảnh 390/1280 px.
