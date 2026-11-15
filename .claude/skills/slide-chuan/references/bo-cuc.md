# Một ngôn ngữ hình ảnh + bộ bố cục mẫu — chống "hổ lốn"

Bài học Chương 3 (15/11/2026, Hào: "vẫn là một mớ hổ lốn"): sau 6 vòng sửa, deck chứa cùng lúc ảnh tư liệu, nhân vật hoạt hình, nhà khối phẳng, icon nét, hoạ tiết góc, dải màu, thẻ bo góc có bóng, khung tròn — mỗi thứ được thêm để vá một lời chê hoặc một con số đo ("đa dạng", "tiêu điểm"). Từng slide sạch lỗi máy, nhưng cả deck là năm ngôn ngữ hình ảnh đánh nhau. **Đẹp chuyên nghiệp = ít loại thứ, dùng lặp lại có kỷ luật** — không phải nhiều thứ.

## 1. Chọn MỘT hướng (art direction) — ghi vào `thiet-ke/phong-cach.json`
| Hướng | Loại hình được dùng | Không trộn với |
|---|---|---|
| **Biên tập học thuật** (luật, kinh tế, báo cáo) | ảnh / tranh tư liệu hai màu · sơ đồ nét + icon nét cùng độ dày · chữ lớn (Lora) · bảng kẻ ngang | nhân vật hoạt hình, đồ vật vẽ phẳng, hoạ tiết trang trí |
| **Minh hoạ** (phổ biến, thiếu nhi, truyền thông) | nhân vật CC0 (Open Peeps…) + đồ vật vẽ cùng nét viền · icon cùng nét | ảnh tư liệu |
| **Dữ liệu** (báo cáo số) | biểu đồ, số lớn, bảng · icon nét | minh hoạ, ảnh |

`phong-cach.json` khai: `bangMau` (≤ 10 màu, kể cả màu chữ phụ, màu kẻ), `loaiHinh` (vd. `["anh-hai-mau","net"]`), `boCuc` (danh sách bố cục mẫu), `tieuDeCoDinh`, `nguong` (chỉnh ngưỡng đa dạng nếu hướng tối giản cần nhiều slide cùng nền giấy). Máy (`scripts/nhat_quan.js`) bắt: màu ngoài bảng (chữ, nền, viền HTML và màu trong SVG), hình không khai / sai `data-loai`, slide không khai `data-mau` hoặc bố cục ngoài danh sách, tiêu đề lệch chỗ.

## 2. Bộ bố cục mẫu (8–12 bố cục) — dựng trước, đổ nội dung sau
Như một mẫu bán slide: thiết kế bố cục một lần, mọi slide là một **thể hiện** của bố cục. Viết thành hàm trong `deck.js` của bài (vd. `mBia`, `mMoPhan`, `mCau`, `mNoiDung`, `mSo`, `mTrich`, `mBang`, `mTruc`, `mHoi`, `mKet`), mỗi `<section>` khai `data-mau`.
- **Khung cố định**: lề, vị trí nhãn mục và tiêu đề, vùng nội dung, chỗ chú thích nguồn — giống hệt nhau giữa các slide cùng bố cục.
- **Biến thể nằm trong vùng nội dung**, không phá khung (hình trái / phải, 1–3 cột).
- Bố cục mở phần / câu chốt / câu hỏi đổi nền (màu chủ đậm); bố cục nội dung giữ nền giấy — **cùng nền nhiều slide liền là bình thường** khi khung chữ và hình thay đổi đủ.
- Không thêm thứ trang trí ngoài hệ thống để "đỡ đơn điệu": nhịp đến từ đổi bố cục (sơ đồ → số lớn → bảng → trích luật), không từ hoạ tiết.

## 3. Ngôn ngữ nét (hướng biên tập)
- Một độ dày nét cho sơ đồ và icon (vd. 3 px khi chiếu 1920): icon Tabler chỉnh `stroke-width` theo cỡ hiển thị để nét thật bằng nét sơ đồ.
- Nút sơ đồ = vòng tròn nét + icon; quan hệ = mũi tên nét mảnh có nhãn đặt sát; nhấn = một màu nhấn duy nhất (hoặc đỏ cho rủi ro / "không").
- Không bóng đổ, không bo góc lớn, không gradient; mảng màu phẳng chỉ dùng cho khối nhấn (một hàng bảng, một ô kết luận).

## 4. Cổng thẩm mỹ trước khi dàn ra cả deck
Làm 6–8 slide mẫu phủ các bố cục chính (bìa, mở phần, sơ đồ, số lớn, bảng, trích luật, câu hỏi) → tờ so sánh với mẫu tham chiếu → người duyệt độc lập chấm **Thẩm mỹ ≥ 4 và Nhất quán ≥ 4** → mới dàn 40+ slide. Không đạt: sửa bố cục mẫu, không vá từng slide.

## 5. Dấu hiệu hổ lốn (soát bằng mắt)
- Đặt 9 slide cạnh nhau (ảnh tổng): thấy > 2 "giọng" hình (ảnh thật + hoạt hình + đồ hoạ phẳng…) → hổ lốn.
- Mỗi slide một kiểu thẻ / bo góc / bóng khác nhau; tiêu đề nhảy chỗ; màu mới xuất hiện ở một slide.
- Có thứ chỉ để "lấp chỗ trống" (hoạ tiết, nhân vật đứng không chở ý, thẻ trống).
