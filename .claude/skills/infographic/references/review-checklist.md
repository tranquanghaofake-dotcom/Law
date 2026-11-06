# Checklist soát cuối (đọc trên ảnh PNG, không đọc trên code)

## Thông điệp
- [ ] Nhìn 5 giây: nói lại được thông điệp chính trong 1 câu.
- [ ] Có đúng một hình chính mang dữ liệu, chiếm 35–50% diện tích.
- [ ] Có CTA cụ thể (số điện thoại, bước làm), không chỉ khẩu hiệu.

## Thứ tự đọc
- [ ] Số thứ tự mục trùng hướng đọc (trên → dưới, trái → phải).
- [ ] ≤ 6 khối; khoảng trắng giữa khối > trong khối.
- [ ] Thu nhỏ 25%: tiêu đề + hình chính vẫn nhận ra.

## Chữ
- [ ] ≤ 4 cỡ chữ; tiêu đề ≈ 2,5–3× thân bài; nhãn chính ≥ 16 px, nhãn phụ ≥ 12,5 px (khổ 1080).
- [ ] Không giãn chữ có dấu; không đoạn HOA dài; không dấu cách trước `! ? : ;`.
- [ ] Mỗi khối ≤ 25 từ; chỗ nào vẽ được thì đã thay bằng hình (ô icon, thước, thanh đo, con dấu, mũi tên).

## Màu & nhấn mạnh
- [ ] `contrast.mjs` PASS toàn bộ.
- [ ] ≤ 3 màu chức năng, nghĩa nhất quán; có chú giải màu nếu màu mang nghĩa.
- [ ] Một kiểu nhấn mạnh duy nhất; không gạch chân.

## Nguồn & pháp lý
- [ ] `legal-checklist.md` đã soát hết.
- [ ] Số điều đặt cạnh khối liên quan; bảng nguồn đầy đủ nằm ở `nguon.md` (không in).
- [ ] Có 1 dòng ký tên + miễn trừ; mọi dấu `*` có chú thích.

## Hình ảnh
- [ ] Có ý tưởng hình ảnh lấy từ thế giới của chủ đề; hình chính được vật thể hóa.
- [ ] Mỗi khối có icon đúng nghĩa; tình huống có nhân vật.
- [ ] Không chữ nào đè lên vật trang trí (lề, lỗ gáy, nét kẻ) hay bị cắt mép.
- [ ] Mọi asset có giấy phép rõ (CC0/ISC không bắt buộc ghi công trên trang in; ghi trong `nguon.md`).

## Kỹ thuật
- [ ] PDF đúng khổ A4, không tràn; nội dung cách mép ≥ 10 mm.
- [ ] Đã in thử 1 tờ: màu, chữ nhỏ nhất, mép giấy ổn. (Chỉ khi photo đen trắng: kiểm `--gray`.)
- [ ] Font đã tải xong trước khi chụp (không rơi về font hệ thống làm vỡ dấu).
