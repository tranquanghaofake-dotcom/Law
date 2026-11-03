# Duyệt phương án nhiễu — đợt 6

Dành cho Hào. Đợt 6 viết lại **phương án sai** của câu trắc nghiệm để hết lỗi "chọn phương án dài nhất là đúng" (trước đợt: 61 % câu). Câu hỏi, đáp án đúng (chữ và vị trí), `explain`, `source` **không đổi**.

## Ai làm gì
1. Haiku 1–3 viết lại theo môn (công cụ `apply.py` chặn mọi thay đổi đụng đáp án đúng).
2. Sonnet A/B/C kiểm chéo từng dòng: nhiễu có thể **đúng** về pháp lý, sai lộ liễu, lệch dạng, chính tả → bản sửa.
3. Opus thẩm định rồi mới áp bản sửa; cân độ dài, bớt từ tuyệt đối và chữ độn; khôi phục "Chỉ…" ở 36 chỗ bỏ đi làm nhiễu thành đúng một phần.
4. Người điều phối lấy mẫu kiểm tay. Mẫu 6 câu thấy 1 câu bị bỏ "Chỉ" thành đúng một phần (đã quét và sửa cả loại này). Vẫn còn câu chữ vụng (vd. "Đã thực hiện xong hành vi khách quan tội"): **máy kiểm được độ dài, không kiểm được nghĩa** — cần Hào đọc.

## Cách duyệt (gợi ý thứ tự)
1. Dòng có **⚠** trước (39 dòng, đứng đầu mỗi bảng): chỗ người kiểm thấy nhiễu có thể đúng hoặc phụ thuộc phiên bản luật.
2. Sau đó đọc lướt cả bảng các môn Hào dạy/thi gần nhất. Mỗi dòng: câu hỏi · đáp án đúng · nhiễu cũ → mới · ghi chú.
3. Thấy dòng sai: ghi vào bảng (thêm "❌ Hào: …" ở cột ghi chú) hoặc nhắn lại id khái niệm + chỉ số câu; phiên sau sẽ sửa và chạy lại test `packages/content/tests/distractors.test.ts`.

| Môn / đơn vị | Bảng | ⚠ |
|---|---|---|
| Chứng khoán | [chung-khoan.md](chung-khoan.md) | 6+ |
| Hình sự 1 | [hinh-su.md](hinh-su.md) | 5+ |
| Thương mại 1 | [thuong-mai-1.md](thuong-mai-1.md) | 4+ |
| Xây dựng VBPL | [xay-dung-vbpl.md](xay-dung-vbpl.md) | 3+ |
| Các môn còn lại | `<môn>.md` cùng thư mục (24 bảng) | 0–3 |

Số ⚠ chính xác theo đơn vị: mục "Kết quả nội dung" trong `docs/plans/2026-11-03-dot-6.md`.

## Điểm cần đối chiếu luật nhất
- Thời hiệu khởi kiện tranh chấp thương mại **2 năm** (Điều 319 Luật Thương mại 2005) — trong khi câu đặt cọc (`dat-coc`) dùng **3 năm** (Điều 429 BLDS 2015). Hai câu không sai, nhưng nên ghi rõ phạm vi để người học không nhầm.
- `chat-van#0` (Hiến pháp): danh sách đối tượng bị chất vấn — nhiễu cũ "Chủ tịch nước và Phó Chủ tịch nước" từng khiến câu có hai đáp án; đã sửa, nhờ Hào xác nhận theo Điều 80 Hiến pháp 2013.
- `xd-nghi-quyet-hdnd-tinh#1`: câu hỏi về quyết định của UBND tỉnh nằm trong khái niệm nghị quyết HĐND tỉnh; căn cứ "Khoản 2 Điều 21" cần đối chiếu Luật Ban hành VBQPPL bản hiện hành.
- BHTN, tuổi nghỉ hưu, BHXH người cao tuổi: phụ thuộc lộ trình/phiên bản luật — xem ⚠ ở `an-sinh-xa-hoi.md`, `lao-dong-2.md`.
- `quoc-trieu-thong-che#1` (Lịch sử NN&PL): tên hình phạt cần đối chiếu giáo trình.

Ghi chú: các căn cứ trên do agent nêu khi kiểm, **chưa được đối chiếu nguyên văn** trên vbpl.vn trong đợt này.
