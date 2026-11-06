# Kế hoạch — Incoterms 2020: rủi ro sang người mua ở đâu?

## 1. Brief
- Đề tài gốc: "thương mại quốc tế" — quá rộng cho 1 trang A4 → thu hẹp vào Incoterms® 2020 (phần sinh viên Luật Kinh tế hay nhầm nhất, có dữ liệu "hình dạng" rõ).
- Người đọc: sinh viên Luật Kinh tế, người mới làm xuất nhập khẩu.
- Một câu phải nhớ: mỗi điều kiện có MỘT điểm rủi ro sang người mua; nhóm C có thêm điểm chi phí khác điểm rủi ro.
- Một hành động: ghi đúng "điều kiện + địa điểm + Incoterms® 2020" trong hợp đồng.
- Khổ: A4 dọc, in màu bìa cứng.

## 2. Tìm hiểu
- Nguồn: ICC (iccwbo.org, Incoterms 2020 checklist 2024); khoản 2 Điều 5 Luật Thương mại 2005.
- Ngách: nhóm C 2 điểm tới hạn; FOB/CFR/CIF chỉ cho đường biển — hàng container dùng FCA/CPT/CIP; CIF bảo hiểm C, CIP bảo hiểm A; EXW người mua làm thủ tục XK, DDP người bán làm thủ tục NK; Incoterms không nói về quyền sở hữu, thanh toán, vi phạm, luật áp dụng; Incoterms là tập quán, chỉ ràng buộc khi dẫn chiếu; phải ghi phiên bản.

## 3b. Tạo mới
- Kiểm độ hợp: vo-o-li 0/3, so-cham-cong 0/3, ban-ve 1/3 (đường kích thước) → **tạo style mới**. 12 khối không có ma trận "điều kiện × chặng" → **tạo khối mới**.
- 10 thứ người đọc thấy: container, cần cẩu, tàu, cảng, xe đầu kéo, kho, vận đơn (B/L), hóa đơn thương mại, tờ khai hải quan, kẹp chì niêm phong.
- Vật chủ đạo: **tuyến vận chuyển** (chở dữ liệu: điểm chuyển rủi ro, điểm chi phí). Vật phụ: **cửa container** (tiêu đề), **băng vạch cảnh báo** (chân trang).
- Màu từ vật thật: đỏ gỉ container (người bán), xanh thép (người mua), vàng nhãn hàng (bảo hiểm, ghi chú), đen than (điểm chuyển).
- Font: Big Shoulders Stencil (chữ stencil trên container — đã thử dấu tiếng Việt), Archivo (thân).
- Khối mới: `route` (ma trận), `anatomy` (mổ xẻ dòng ghi hợp đồng).
- Kiểm "mới thật": che chữ vẫn nhận ra logistics/cảng (cửa container, băng cảnh báo, icon tàu-xe-kho); bố cục khác hẳn 3 bài cũ.

## 3. Bố cục
1. head (cửa container) 2. route — HÌNH CHÍNH 3. notes 4. anatomy 5. tiles 6. sign

## 4. Asset
- Icon: warehouse, truck, container, ship, flag, package-open, badge-dollar-sign, scroll-text, scale, landmark
- Minh họa tự vẽ: `assets/illustrations/container.svg`
- Nhân vật: không (đề tài B2B, vật thể nói thay người)

## 5. Kiểm
- [x] render "bố cục ổn"  - [x] contrast 0 FAIL (đã sửa chữ header 4.36 → đạt)  - [x] soát mắt người
- [ ] phản biện độc lập   - [ ] in thử
