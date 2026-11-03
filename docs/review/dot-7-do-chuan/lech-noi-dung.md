# Cờ "lệch nội dung" của công cụ dò (opus, 03/11/2026)

Cờ = câu hỏi + đáp án đúng ít trùng chữ với điều được trích (điểm < 0,2, xem `tools/citations/audit.ts`). Đã xử lý toàn bộ 31 cờ (đo sau khi gộp nhánh chính `8e40e95`): **5 sửa**, còn lại báo nhầm (có lý do). Sau khi sửa còn 26 cờ, tất cả là báo nhầm dưới đây.

## Sửa

| id | trước → sau | căn cứ |
|---|---|---|
| tai-san-tri-tue/tstt-gop-von-bang-quyen-shtt#1 | trích "Khoản 2 Điều 34 Luật Sở hữu trí tuệ" (điều về bản ghi âm, ghi hình) → "Khoản 2 Điều 34 Luật Doanh nghiệp 2020"; đáp án giữ (đúng nguyên văn) | `ldn-vbhn-2025.txt` khoản 2 Điều 34 |
| dat-dai/pham-vi-dieu-chinh-luat-dat-dai#0 | hiệu lực 01/8/2024 trích "Điều 1" (phạm vi điều chỉnh) → "Luật Đất đai 31/2024/QH15 (VBHN 44/2026, ghi chú hiệu lực)" | dòng đầu `ldd-vbhn-2026.txt`; VBHN không chép điều hiệu lực |
| hien-phap/bao-ve-moi-truong#6 | mẫu trả lời các khoản 1–3 không ghi điều (công cụ hiểu là Điều 43) → thêm "Điều 63:" | Điều 63 Hiến pháp 2013 (nguồn khái niệm) |
| hien-phap/nha-nuoc-phap-quyen-xhcn#1 | giải thích chỉ dẫn Điều 119 → thêm khoản 1 Điều 8 (Nhà nước tổ chức, hoạt động theo Hiến pháp và pháp luật) | `hien-phap-2013.txt` Điều 8, Điều 119 |
| to-tung-dan-su/thoi-hieu-khoi-kien-ttds#6 | "Thời hiệu theo BLDS (khoản 1 Điều 184)" → "(khoản 1 Điều 184 BLTTDS)" | `bltt-ds-vbhn-2026.txt` Điều 184 |

## Báo nhầm (đã đọc điều luật; đúng ý, chỉ khác chữ)

| id | lý do |
|---|---|
| chung-khoan/chuyen-quyen-so-huu-chung-khoan#5 | tình huống ngày khớp lệnh/ngày ghi sổ; khoản 2 Điều 64: hiệu lực từ ngày bút toán ghi sổ — đúng |
| chung-khoan/muc-phat-tien-chung-khoan#3 | "khoản 2, 3 Điều 12" chỉ hành vi bị cấm; mức phạt ở điều khác — câu chỉ dẫn đúng |
| sets/dat-coc#1, #2 | khoản 2 Điều 328 BLDS: bỏ cọc mất cọc; bên nhận cọc từ chối trả cọc + khoản tương đương — đúng |
| sets/dat-coc#7 | khoản 1 Điều 119 BLDS: giao dịch qua phương tiện điện tử là văn bản — đúng |
| sets/dat-coc#9, sets/chuyen-khoan-nham#4, #7, #9 | lời khuyên thực hành, điều luật chỉ là nền (Điều 328, 579 BLDS; Điều 176 BLHS) |
| hanh-chinh/cong-dan-nguoi-nuoc-ngoai-hanh-chinh#1 | Điều 27 Hiến pháp: quyền ứng cử là của công dân — suy ra người nước ngoài không có |
| hanh-chinh/to-chuc-xa-hoi#6 | khái niệm theo giáo trình; Điều 25 Hiến pháp (quyền lập hội) là nền |
| hien-phap/chu-quyen-nhan-dan#5, hieu-luc-phap-ly-toi-cao#5, nha-nuoc-phap-quyen-xhcn#5, truong-hop-khong-duoc-ung-cu#5, tu-do-kinh-doanh#1 | câu tình huống/diễn giải, điều được trích đúng (khoản 2 Điều 2, khoản 1 Điều 119, khoản 2 Điều 14 Hiến pháp; Điều 37 Luật Bầu cử; Điều 33 Hiến pháp) |
| sets/hinh-su-de-1#6, #7; sets/hinh-su-de-2#0; sets/pldc-vi-pham-phap-luat#3, #4 | tình huống áp dụng Điều 10, 11, 15, 17 BLHS — đúng |
| sets/pldc-vi-pham-phap-luat#9 | Điều 9 BLHS được nhắc để so sánh (phương án nhiễu), căn cứ là giáo trình |
| sets/lao-dong-de-1#4 | Điều 25 BLLĐ: thử việc tối đa 60 ngày với trình độ cao đẳng trở lên — đúng |
| lich-su-nn-pl/sac-lenh-13-toa-an#5 | Điều 103 Hiến pháp 2013 (Hội thẩm) dùng để so sánh lịch sử |
| thuong-mai-1/doanh-nghiep#1 | Điều 188 LDN: DNTN do một cá nhân làm chủ, chịu trách nhiệm vô hạn — đúng |
| sets/thuong-mai-de-1#7 | Điều 88 Luật Thương mại: khuyến mại — đúng |
