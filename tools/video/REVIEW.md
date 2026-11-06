# REVIEW — video giới thiệu Luyện Luật, bản 4 (06/11/2026)

## Quyết định sáng tạo
- **Mạch A (Hào chọn):** một câu hỏi tiền bạc đời thường đi xuyên suốt. Đặt cọc 20 triệu → thẻ Hiểu nhanh → **20 đếm lên 40 triệu** → luyện **tình huống khác cùng luật** trên web thật (cọc 3 triệu → 6 triệu, Khoản 2 Điều 328) → 6 bậc + lịch ôn → cú chốt **thắp chuỗi 74 → 75** → 4 màu thẻ → thăng chức tới Chủ tịch nước → thẻ kết. Hai mạch không dựng (B "trước và sau", C "kết quả trước") nằm trong `STORYLINES.md`.
- **Chất liệu "Văn Miếu" của web:** mảng màu phẳng (cam, mực, giấy), Noto Serif Display + Be Vietnam Pro. **Bỏ light leak, glow, hạt bay, tia sáng.** Chuyển cảnh có chữ ký riêng là dấu § son phủ khung ở đầu mỗi cụm nhạc.
- **Độ dài:** 28 ô = 60,5 s. Hào chọn 1 phút. Video kết ở giữa cụm thứ 4, nhưng vẫn đúng đầu một ô nhịp.

## Phản biện độc lập (1 subagent, chỉ nhận SPEC + STORYLINES + ảnh)

| Lỗi subagent nêu | Xử lý |
|---|---|
| P0 khung 0 là mảng cam trống (ảnh bìa) | Sửa: "Đặt cọc / 20 TRIỆU" đã đáp từ trước khung 0. Mình cũng tự thấy lỗi này |
| P0 bokeh/glow trên nền xanh đen ở cú nện | Sửa: bỏ light leak; đầu cụm dùng mắt cắt § son |
| P0 số chuỗi chỉ cao ~50 px ở cú chốt | Sửa khác đề xuất: đẩy máy vào huy chương 2,3× trong 2 phách trước cú nện rồi lùi ra. Không phóng tới ≥ 360 px vì bản quay ở 2,5× sẽ vỡ hạt |
| P0 thẻ 25/50 hiện sau số 75 gây hiểu là tụt | Sửa: nhãn "Chuỗi 25 · Đỏ" … "Chuỗi 100 · Trắng – đen", kicker "Hết chu kỳ, thẻ đổi màu" |
| P0 nhận chức không có chữ "Chủ tịch nước" | Sửa: nện "CHỦ TỊCH NƯỚC" dưới tủ, thu tủ để không đè câu miễn trừ |
| P1 câu hỏi trong điện thoại lệch câu hỏi mở đầu | Sửa: quay lại câu 3 của bộ đề (chủ trọ cọc 3 triệu → 6 triệu), tiêu đề "Cùng luật, tình huống khác" |
| P1 chữ trong máy ~20 px không đọc được | Sửa khác đề xuất: thử phóng máy 1,3× nhưng máy che tiêu đề. Thay bằng chip chữ to "3 triệu + 3 triệu = 6 triệu" |
| P1 "FSRS" là thuật ngữ, đồ thị nhỏ, không trục | Sửa: kicker "Lịch ôn tự động", đồ thị cao 40 % khung, có trục "nhớ ↑ / ngày →" |
| P1 thẻ Hiểu nhanh và 6 bậc nhỏ, bỏ trống khung | Sửa: nhánh thành 4 hàng to, icon 2,4×; 6 bậc chữ 1,45×. Mình cũng tự thấy lỗi này |
| P1 nút "Tiếp tục" của app ngoài vùng an toàn | Sửa: cắt 600 px đáy bản quay thắp chuỗi |
| P1 tách màu RGB ở hook là dấu hiệu máy tạo | Sửa một phần: bỏ glitch ở hook; tách màu chữ chỉ còn ở cú nện, không đập theo mọi phách |
| P2 vòng sóng cam đè chữ ở cú chốt | Sửa: cảnh nền tối dùng vòng trắng; đầu cụm không còn vòng sóng |
| Ngách "con số tiền làm sợi chỉ" | Làm: 20 TRIỆU ở hook → đếm 20 → 40 triệu ở cảnh đáp án |
| Ngách "cận cảnh cú chốt" | Làm: đẩy máy vào huy chương (xem trên) |
| Ngách "dấu § làm mắt cắt" | Làm, và đưa vào skill thành `theme.cutMark` |

Sau khi sửa, tự soát lại phát hiện 2 lỗi do bản sửa gây ra (máy phóng che tiêu đề; chữ "CHỦ TỊCH NƯỚC" đè miễn trừ), đã sửa.

## Đã đo / chỉ nhìn / chưa ai kiểm
- **Đã đo:** khổ, fps, thời lượng (`kiem_tra_video.py`); BPM/cụm/bass tắt của bài trên bản nghe thử chính thức.
- **Chỉ nhìn:** khoảng 30 khung tĩnh và tờ điểm cắt.
- **Chưa ai nghe:** video ghép với *Aura Farming* thật. Bản nháp dùng nhạc dò nhịp tự tổng hợp, không phải bài thật.
- **Dữ liệu demo:** màn thắp chuỗi 75 ngày và tủ trưng bày dựng bằng tiến độ giả.

## Cảnh báo giữ lại có chủ đích
- `kiem_tra_storyboard`: video kết giữa cụm (độ dài 1 phút do Hào chọn); thẻ Hiểu nhanh 38 chữ / 8,6 s (đã giảm từ 116; giữ hệ quả 2 nhánh chính vì là lời giải câu hỏi); cảnh chức danh và thẻ kết dư chữ vì câu miễn trừ pháp lý bắt buộc.

## Cảnh yếu nhất
Cảnh 6 bậc vẫn là một danh sách, chưa có ví dụ "Đặt cọc" đi qua từng bậc. Nếu có thêm thời gian: quay 6 dạng bài thật của khái niệm Đặt cọc, mỗi bậc nửa phách.
