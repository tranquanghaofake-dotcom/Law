# Tìm kiếm toàn cục — thiết kế

Ngày: 11/11/2026 · Nhánh: `claude/tender-goodall-vgv6mf` · Hào duyệt phạm vi trong phiên 11/11 (gói "Tìm kiếm toàn cục"); thiết kế chi tiết dưới đây do Claude đề xuất và làm ngay trong cùng phiên.

## Vì sao
Hiện chỉ tìm được khái niệm **bên trong một môn** (`#/mon/<môn>/khai-niem`). Người học có sẵn thuật ngữ ("đặt cọc", "thừa kế thế vị") nhưng không nhớ nó thuộc môn nào thì phải mở từng môn. Kho đã có 25 môn, 740 khái niệm, 50 bộ đề.

## Mục tiêu đo được
- Từ bất kỳ màn nào có khung điều hướng: **≤ 2 thao tác** (mở ô tìm, gõ) là thấy khái niệm; bấm kết quả mở đúng mục trong danh mục.
- Gõ không dấu vẫn ra ("chu quyen" → "Chủ quyền nhân dân").
- Không thêm thư viện, không đổi bảng màu, không hiện trong phiên học (màn học vẫn "một màn một việc").

## Dữ liệu (không thêm file mới)
- Tên khái niệm: `loadTermIndex()` (bảng tên `dist/terms/*.json`, đã precache).
- Môn và bộ đề: `loadIndex()`.
- Tải khi mở ô tìm lần đầu; lỗi tải thì báo "Không tải được danh sách để tìm" kèm nút thử lại.

## Tính toán (`lib/ui/globalSearch.ts`, thuần, có test)
- `matchRank(text, q)`: 0 = trùng hẳn · 1 = bắt đầu bằng truy vấn · 2 = mọi từ khớp **đầu một từ** · 3 = mọi từ có mặt · −1 = không khớp. So sau khi bỏ dấu (`fold`).
- `searchAll(query, nguồn)`: truy vấn < 2 ký tự → rỗng. Trả 3 nhóm: **khái niệm** (theo tên, tối đa 8), **môn học** (tên + tên ngắn, tối đa 3), **bộ đề** (tên, rồi mô tả, tối đa 4). Sắp theo hạng khớp, rồi tên ngắn hơn trước. Kèm tổng số khái niệm khớp để ghi "và N khái niệm khác".

## Giao diện
- **Nút mở**: điện thoại — nút kính lúp 44 × 44 trên thanh trên, trước ngọn lửa chuỗi ngày. Từ 768 px — mục "Tìm" ngay dưới logo ở thanh bên (rail: biểu tượng + chữ nhỏ; từ 1280 px: ô giả "Tìm kiếm" + phím `/`).
- **Phím tắt**: `/` (khi không đang gõ trong ô nhập) và `Ctrl/⌘ + K`.
- **Hộp tìm**: `<dialog>` modal gốc của trình duyệt (giữ focus, Esc đóng, chạm nền đóng). Neo **phía trên** màn hình để bàn phím ảo không che kết quả; điện thoại rộng hết màn, từ 768 px rộng 560 px.
- **Kết quả**: 3 nhóm có tiêu đề; mỗi dòng là một link (khái niệm kèm tên ngắn của môn; bộ đề kèm nhóm). `↓`/`↑` chuyển giữa các dòng, `Enter` trong ô nhập mở kết quả đầu tiên. Dòng trạng thái `role="status"` đọc số kết quả.
- **Trạng thái rỗng**: chưa gõ → gợi ý ví dụ; không thấy → "Không thấy kết quả cho “…”" + gợi ý gõ ít từ hơn.
- Chọn kết quả hoặc đổi trang thì hộp tự đóng.

## Kiểm tra
- Unit: `tests/ui/globalSearch.test.ts`.
- e2e: mở bằng nút, gõ "chu quyen", bấm kết quả → mở đúng khái niệm; phím `/` mở hộp.
- Ảnh 390 px và 1280 px (hộp mở, có kết quả); axe 0 lỗi trên hộp đang mở.

## Ngoài phạm vi
Tìm trong nội dung định nghĩa/điều luật (cần tải 3,6 MB khái niệm), lịch sử tìm kiếm, tô sáng chữ khớp.

## Kết quả (11/11/2026)
- Đo trên bản build ở 320, 390, 820, 1280 px: không cuộn ngang, axe 0 lỗi trên hộp đang mở; "quyen so huu" ra 20 khái niệm (hiện 8) và 1 bộ đề.
- Phát sinh khi làm: thêm nút tìm khiến tên "Luyện Luật" rớt 2 dòng ở màn ≤ 360 px → tên một dòng, chữ 18 px dưới 400 px, dưới 360 px chỉ còn dấu § (có test e2e).
- Lưu ý dùng: ô nhập kiểu `search` — đang có chữ thì Esc lần đầu xoá chữ, lần hai mới đóng hộp (hành vi gốc của trình duyệt).
- Unit 8 test, e2e 2 test mới; toàn bộ 31 e2e local xanh.
