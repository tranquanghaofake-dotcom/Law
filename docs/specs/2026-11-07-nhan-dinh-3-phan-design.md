# Nhận định chấm 3 phần — thiết kế

Ngày: 07/11/2026 · Nhánh: `feat/nhan-dinh-3-phan` · Hào đã duyệt phạm vi trong phiên 07/11. Thí điểm môn Dân sự.

## Vì sao
Đề thi luật thường yêu cầu trả lời nhận định theo 3 phần: **Đúng/Sai**, **căn cứ pháp lý**, **lập luận**. Thẻ Đúng/Sai hiện chỉ chấm phần đầu, nên người học đoán trúng vẫn được tính là đúng hoàn toàn.

## Dữ liệu
Câu `truefalse` có thêm trường tuỳ chọn `parts`:
```json
"parts": {
  "basis":  { "options": ["…", "…", "…", "…"], "answer": 2 },
  "reason": { "options": ["…", "…", "…", "…"], "answer": 0 }
}
```
- `basis`: 4 căn cứ dạng "Khoản x Điều y Bộ luật Dân sự 2015". Căn cứ đúng là điều luật trực tiếp quyết định nhận định; nhiễu là điều luật có thật nhưng không giải quyết vấn đề.
- `reason`: 4 câu lập luận ngắn. Câu đúng nêu đúng lý do pháp lý; nhiễu là lý do nghe hợp lý nhưng sai.
- Không có `parts` thì thẻ chạy như cũ, các môn khác không đổi.

## Chấm (`engine/grading.ts` → `scoreNhanDinh`)
- Đúng/Sai 0,25 · căn cứ 0,25 · lập luận 0,5.
- 1 điểm → tính là đúng · từ 0,5 đến dưới 1 điểm → "gần đúng" (giống tự chấm "Gần đúng": FSRS chấm Hard, giữ bậc) · dưới 0,5 → tính là sai.

## Thẻ
Bước 1 chọn Đúng/Sai → bước 2 chọn căn cứ → bước 3 chọn lập luận. Các bước sau vẫn chạy dù bước 1 sai, như khi chấm bài thi. Xong bước 3 thì thẻ hiện bảng điểm từng phần rồi mới báo kết quả. Phím 1–4 chọn phương án.

## Kiểm tra
Test schema, engine, thẻ; test nội dung (35/35 câu Đúng/Sai của môn Dân sự có `parts`, căn cứ đúng trỏ tới điều có thật trong `laws/blds-2015.txt`); `npm run ci`; ảnh 390/1280 px.
