# Kế hoạch — ngay-nghi-bieu-do

## 1. Brief
- **Người đọc:** Người lao động làm việc theo hợp đồng; dán bảng tin, đăng mạng nội bộ.
- **Một câu phải nhớ:** Mỗi năm ít nhất 24 ngày nghỉ hưởng nguyên lương: 12 ngày lễ, tết và 12 ngày làm việc nghỉ hằng năm.
- **Một hành động:** Đếm lại ngày nghỉ của mình; nghỉ việc thì đòi tiền những ngày phép chưa nghỉ.
- **Khổ:** A4 dọc, in màu. **Style:** `thuy-si` (tầng áp phích).

## 2. Hình chính
Bản đồ ô 365 ngày (treemap của Apache ECharts): diện tích mỗi ô đúng tỉ lệ số ngày, hai ô đỏ là 24 ngày nghỉ nguyên lương.

## 3. Thứ tự đọc
hàng nhãn → tiêu đề → bản đồ ô → 12 ngày lễ, tết (7 cột có ô đếm) → bậc thang thâm niên (AntV) → ba điều dễ sót.

## 4. Ghi chú thiết kế
Bài chứng minh `scripts/bieu-do.mjs`: cùng style `thuy-si` với bài phạt vi phạm nhưng hình chính là biểu đồ sinh từ dữ liệu, màu lấy từ biến của style (`$ink`, `$do`, `$soft`).

Căn cứ từng khẳng định: xem `nguon.md` cùng thư mục.
