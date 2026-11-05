# Sổ việc — Thẻ dễ hiểu cho người đọc và người nghe: "Hiểu nhanh" + hình theo loại khái niệm (thí điểm Xây dựng VBPL)

Nhánh: `claude/confident-faraday-o7ibfn` (khởi động lại từ main f9ed629 sau khi #40 merge) · 05/11/2026. Tự làm, không agent con.
Hào duyệt: thí điểm 20 khái niệm môn xay-dung-vbpl trước, đạt thì mở rộng 690.
Kiểm tra: `npm run content` (luật viết mới) · `npm run ci` · ảnh 390/1280.

| Task | Việc | Trạng thái |
|---|---|---|
| 1 | Schema `memo.gist` (≤ 25 chữ) + `memo.kind` (ladder/checklist/steps/compare/tree) + luật viết: không viết tắt, không IN HOA, không "(…)" | xong |
| 2 | Giao diện: Hiểu nhanh đầu thẻ; 4 kiểu hình; thẻ khái niệm chỉ hiện Hiểu nhanh + hình + ví dụ, còn lại "Xem thêm", ghi chú luật thành nhãn "⚠ Luật đã thay đổi" | xong |
| 3 | Giọng đọc: thẻ khái niệm đọc tên + Hiểu nhanh + mẹo thay cho nguyên văn; danh sách câu sinh giọng cập nhật | xong |
| 4 | Soạn gist/kind/hook/tree lời thường cho 20 khái niệm xay-dung-vbpl | xong |

Kiểm tra: `npm run ci` xanh (165 + 703); e2e 29/29; ảnh thẻ khái niệm và thẻ đáp án 390/1280 đã xem.
Quyết định: ví dụ của khái niệm thí điểm được viết lại sang lời thường (bỏ HĐND, UBND, VBQPPL, số điều) — vì ví dụ là tình huống minh họa, không phải nguyên văn — sai thì tốn: câu hỏi dạng "đoán khái niệm từ ví dụ" đổi chữ theo.
Quyết định: khái niệm có Hiểu nhanh thì khối "Vì sao?" khi trả lời sai bỏ đoạn nguyên văn (chỉ giữ hai cột dễ nhầm nếu có); nguyên văn chuyển vào "Xem thêm".
Rút kinh nghiệm: (1) dòng trong danh sách flex phải bọc nội dung trong một span, không thì nhãn và dấu ":" tách cột trên điện thoại. (2) Luật viết "không 2 chữ hoa liền nhau" bắt được cả viết tắt lẫn IN HOA bằng một quy tắc. (3) Nhánh đã merge thì push thường là fast-forward, không cần force.

## Đợt 2 (Hào: "làm tất cả")
| Task | Việc | Trạng thái |
|---|---|---|
| 5 | Giọng đọc đọc cả hình (bậc thang, bước, điều kiện, hai cột) | chưa |
| 6 | Mẹo nhớ là so sánh/vần/chữ tắt; luật kiểm: mẹo không trùng quá nửa chữ với Hiểu nhanh | chưa |
| 7 | Ví dụ dạng hỏi – đáp (`memo.case`), bấm mới hiện đáp; luật kiểm | chưa |
| 8 | Câu phân biệt theo cặp hay nhầm (`memo.contrast`) thay hai cột cụm từ | chưa |
| 9 | Hình vẽ thật: kim tự tháp SVG cho bậc thang, mũi tên nối các bước, biểu tượng nhánh | chưa |
