# Nhật ký — Chương 3 (quy trình slide-chuan v3)
- 14/11/2026 · Bước 0–2: brief.md, noi-dung.md. Tra Luật KDBH 08/2022/QH15 + Luật 139/2025/QH15 (luatvietnam.vn, mức B). Phát hiện 9 điểm (L1–L9), 3 khoảng trống (K1–K3). Thời lượng đúng là 120 phút (deck cũ ghi 40 — sai). Chờ điểm duyệt A.
- 14/11/2026 · Duyệt A (Hào: "làm" = theo khuyến nghị). Bước 3: kich-ban.md 45 slide; nghiên cứu K1, K2, câu 2. Chờ điểm duyệt B.
- 14/11/2026 · Duyệt B. Bước 4: 3 hướng (A bán tả thực, B biên tập nét mảnh, C isometric) × 2 slide, sạch lỗi máy. Sửa bộ kiểm tràn (báo nhầm ở chữ lớn). Chờ điểm duyệt C.
- 14/11/2026 · Duyệt C: chọn A. Bước 6–7: deck.js (45 slide), asset trong asset/. Máy: 44 lỗi → 0 (ngắt dòng cân đối, data-t cho số, tương phản, lề thị giác). Mắt: 5 lỗi thẻ (tiêu đề xuống dòng đè mô tả) → khối chảy dọc. Lỗ hổng công cụ: kiem_de không bắt hai hộp chữ đè nhau trong cùng một thẻ.
- Người duyệt độc lập vòng 1 (opus): Nội dung 4 · Thiết kế 3 · Mạch lạc 4 · Dễ hiểu 3. Sửa: S25 thêm "do lỗi vô ý" (Đ47 k2) + căn cứ Đ16 k3 + ví dụ số; S6 bỏ "hàng hải" cho 1347; S7 ghi nguồn thứ cấp + mốc 01/7/2026; S4 thời lượng theo kịch bản; S8 mũi tên bồi thường quay về bên mua, nhà cháy = kích hoạt; S9 hai người đỏ; S11 phân biệt chủ nhà / người lạ (giấy chứng nhận, hàng rào, biển); S13 ô vuông → nhà + vùng cháy; S18 xe va người thứ ba; S24 hai thanh tiền cùng thang; S26 hai chồng xu bằng nhau; S34, S37 nhãn; S20 nhấn trong câu trích; S22 dải ví dụ; S35 câu dẫn; chuyển siêu chú thích xuống ghi chú; bỏ số chương lớn bị hình đè.
- Vòng 2 (opus): Nội dung 4 · Thiết kế 4 · Mạch lạc 5 · Dễ hiểu 4; chặn giao vì căn cứ chưa đối chiếu bản chính thức. Đã đối chiếu 28/28 với cổng Chính phủ (mức A), trừ sửa đổi Đ8 của Luật 139/2025 (PDF scan, mức B). Sửa: S4 dòng 35 phút còn lại, S16 "(sửa đổi 2025)", S17 "Loại rủi ro", S20 trả nguyên văn "thoả … thỏa", S26 xu dưới f và d, S30 ghi chú anh X / DNBH X, S37 viết đủ công thức + ví dụ số. Bản giao: dung.js sạch lỗi (không --nhap).
- Bài học công cụ (sửa skill sau): kiểm đè chữ không bắt (1) hai hộp chữ trong cùng một thẻ khi tiêu đề xuống dòng, (2) dòng danh sách đặt toạ độ cố định bị xuống dòng đè dòng dưới — 3 lần phải bắt bằng mắt.
- Bài học bài: đặt chữ theo dòng chảy (khối tiêu đề + mô tả) thay toạ độ cố định cho mọi thẻ; hình phải chứng minh ý (người duyệt bắt 6 slide hình nói khác chữ).
- 15/11/2026 · Skill bổ sung bước thẩm mỹ (commit 93f7c70). Bước 4 mới: tham chiếu 17 mẫu (thiet-ke/tham-chieu/, chất lượng trung bình — chỉ 5 slide thật), he-thong.md (lưới 12 cột, 4 cỡ chữ, màu theo bên, 11 kiểu slide), nhip.md. Bước 5: mau2/ — bìa, slide 8 × 3 phương án, slide 25, slide 34; sạch lỗi máy; bắt bằng mắt thêm 1 lỗi chữ đè (bìa). Chờ điểm duyệt C.
- 15/11/2026 · Tham chiếu bổ sung 16 mẫu bán slide (Slidesgo, SlidesCarnival; Envato/Creative Market chặn). Hệ thống: tiêu đề ≤ 8 từ, mở chương số lớn nền đảo, mục lục 2×2, kẻ mảnh thay thẻ. Mẫu: 8 slide sạch lỗi máy. Chờ điểm duyệt C.

## 15/11/2026 — dựng lại 47 slide theo hệ thống thiết kế
- deck.js viết lại theo thiet-ke/he-thong.md + nhip.md; ghi chú lấy từ notes-cu.json (sửa S23, S27, S39).
- Máy: dung.js sạch (mã 0). Duyệt độc lập opus vòng 1: ND 4 · TK 3 · ML 4 · DH 4 · TM 3 → sửa 20 lỗi (S6 tiêu đề vượt nguồn, S23 ví dụ ngược ý + màu + thước, S28 gộp mốc, S39 thêm mốc, S19 hình TNDS hai xe, S36 màu…).
- Vòng 2: ND 4 · TK 4 · ML 4 · DH 4 · TM 4 → sửa: S24 thêm Đ31 k1, S12 "nhằm giao kết hợp đồng", S26 "lúc xảy ra thiệt hại", S39 ví dụ 80/10 + nhãn trên 85 %, S28 sự kiện ngoài thời hạn, S38 hạ khối, notes S17 lỗi dấu ".
- Đã đối chiếu thêm với toàn văn trên cổng Chính phủ: Đ16 k2, k4; Đ22 k2–3; Đ8 k1–4; Đ47 k2.
- Còn mức B: S17 "xây dựng" (Luật 139/2025 sửa Đ8 k2 c) — chưa đọc được bản chính thức. Câu hỏi 2 cần GV chốt đáp án.
- Bài học: margin âm cho tiêu đề phụ thuộc chữ cái đầu → chỉ dùng -2 px; hộp chữ đè thẻ (S17) máy không bắt khi thẻ không có data-t ở mép — phải nhìn.

## 15/11/2026 (tiếp) — ảnh tư liệu cho slide mở phần, phóng hình trong thẻ
- Slide 2, 5, 16: ảnh phạm vi công cộng tô hai màu tràn nửa slide; slide 46 tổng kết 4 phần có icon; slide 9, 13 phóng hình; slide 41–45 thêm nhân vật suy nghĩ, thu khối đáp án.
- Mở phần 03, 04 và slide 47 chưa có ảnh: Wikimedia trả 429 (giới hạn theo IP) cho 3 ảnh đã chọn — hợp đồng bảo hiểm hoả hoạn Bern 1889, tranh Raden Saleh tàu gặp bão 1836, tranh quán cà phê Lloyd's (William Holland).
- Lỗ hổng công cụ phát hiện bằng mắt (cần sửa trong skill): kiểm đè không bắt lớp ảnh đè lên chữ khi `top` thiếu đơn vị; lớp ảnh tràn khỏi mép slide không bị báo.

## 19/11/2026 — thẩm định học thuật lần 2 + duyệt lại (quy trình mới: brief.js, mức lỗi, luật dừng)
- Văn bản luật: đối chiếu văn bản hợp nhất 31/VBHN-VPQH (vbpl.vn) → `nguon/luat-kdbh-trich.md`; xác nhận điểm c khoản 2 Điều 8 "trong hoạt động xây dựng" (Luật 139/2025).
- Thẩm định lần 2 (`duyet/01-tham-dinh-2.md`): 11 lỗi CHẶN, đều thiếu ý pháp lý (điều kiện, ngoại lệ bị rơi khi rút gọn) — đã sửa hết; 0 lỗi sai số điều.
- Duyệt lại có phạm vi (`duyet/02-duyet-lai.md`): **QUA**, 0 lỗi CHẶN. Hết số vòng theo luật dừng — không mở vòng mới.
- Quyết định: giữ trần số chữ bằng cách bỏ dòng dẫn trùng ý (slide 6, 8, 12, 26, 31, 45), không cắt điều kiện pháp lý (đúng > đủ > dễ đọc).
- NÊN sửa luôn sau duyệt lại (rẻ): slide 24 "giải thích quyền lợi, loại trừ" (Điều 20 k2 b); slide 14 chân luật có "sửa đổi 2025"; slide 17 phụ đề có chủ ngữ; slide 38 ghi mức trần 85 % là người soạn thêm; lời nói 17, 21 cập nhật lần đối chiếu.
- NÊN để lại có chủ ý (lý do):
  - slide 1, 3, 5 hình ô che / khiên (ẩn dụ) — Hào đã duyệt bằng mắt; đổi ảnh mở phần là việc riêng.
  - slide 7 mốc 1993, 2001 — nguồn thứ cấp; cần tra vbpl.vn Nghị định 100/CP, Luật 24/2000/QH10.
  - slide 11 chưa nêu người không phải chủ sở hữu (người thuê) có quyền lợi có thể được bảo hiểm — chưa có câu luật đối chiếu (Điều 44 chưa trích).
  - slide 35 ví dụ trùng số liệu HĐ 4 Bài 12 (lộ một phần lời giải) — đổi số phải vẽ lại cột; hỏi giảng viên có muốn đổi.
  - slide 40 hình "ba hộp" trong khi luật có 5 loại hợp đồng (Điều 15).
  - slide 8 mũi tên bồi thường chỉ về bên mua; lời nói đã nói rõ người nhận là người được bảo hiểm / người thụ hưởng.
  - slide 12, 21 chip trích chỉ ghi Luật 08/2022 — câu trích là chữ của luật gốc, văn bản hợp nhất không sửa khoản đó.
  - slide 17 "sức khoẻ" (bảo hiểm sức khỏe thương mại) có thể lẫn với bảo hiểm y tế (Luật KDBH không áp dụng — khoản 2 Điều 1).
- GHI NHẬN: slide 44 đề gốc viết sẵn "DNBH" ở vế đầu nên lộ đáp án C; slide 42 hình hợp đồng → chồng xu gợi ý phương án B.
- Hỏi giảng viên: đáp án câu 1, câu 2 (A hay D); vượt mức tỷ lệ có mức trần không; Bài 11 có tính hoa hồng tái bảo hiểm không; có đổi số liệu ví dụ slide 35 không.

