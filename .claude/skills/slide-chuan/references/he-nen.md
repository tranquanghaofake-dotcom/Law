# Hệ nền — đa dạng trong một hệ thống

Nguồn: 54 mẫu tham chiếu (33 đợt 1 + 21 đợt 2, chủ yếu Slidesgo/SlidesCarnival, Duarte, Munich Re, Swiss Re), số đo ước lượng bằng mắt — spec `docs/specs/2026-11-14-slide-chuan-v2-quy-trinh.md` mục 11.

**Phát hiện chính**: mẫu chuyên nghiệp **không đổi nền liên tục**. 9/13 mẫu đếm được giữ **một họ nền sáng** cho 60–100 % slide nội dung và làm deck "sống" bằng **hoạ tiết đổi vị trí** (khối màu ở góc khác, cỡ khác, 1–3 mảng). Nền đổi hẳn chỉ dành cho mở chương, số lớn, trích dẫn, kết. Đơn điệu = một nền phẳng y hệt suốt deck, không hoạ tiết, không nhịp.

## 1. Sáu loại nền
| Mã | Nền | Dùng cho | Tỉ lệ trong deck |
|---|---|---|---|
| N1 | Sáng (trắng, ngà, kem) + **hoạ tiết góc** nhẹ, đổi vị trí từng slide | nội dung, bảng, sơ đồ | 60–80 % |
| N2 | Màu đậm đơn sắc (màu chủ của bài) | mở chương (kèm số chương to), số lớn, trích luật / câu chốt, kết | 10–20 % |
| N3 | Chia mảng: nửa đậm / nửa sáng, dải màu tiêu đề, khối màu sau hình | hai ý đối lập, slide có hình lớn, định nghĩa | 10–15 % |
| N4 | Ảnh phủ trọn + khối chữ phẳng (lớp phủ ≥ 60 % đục sau chữ) | một slide "ảnh nói" mỗi phần | ≤ 5 % (≈ 1 slide / 10–15) |
| N5 | Khung màu quanh thẻ sáng, màu khung đổi theo phần | báo hiệu phần thay N2 khi muốn nhẹ | thay N2 |
| N6 | Chất liệu (giấy kẻ, giấy cũ, lưới chấm) | deck có chủ đề vật liệu rõ | cả deck, vẫn đổi vật đặt trên |

## 2. Quy tắc
1. Chọn **N1 + N2 + ít nhất một trong N3/N4/N5** → ≥ 3 loại nền cho deck ≥ 12 slide.
2. **Hoạ tiết N1**: 1 bộ 2–4 hoạ tiết tự vẽ cùng phong cách bài (khối bo, lưới chấm, đường lượn, hình học gợi chủ đề — vd. bài bảo hiểm: mép giấy hợp đồng, ô lưới bảng tính; bài hình sự: vạch hồ sơ). Mỗi slide N1 đặt 1–2 hoạ tiết ở **góc khác slide trước**; hoạ tiết không đè vùng chữ, độ tương phản thấp (≤ 15 % đậm hơn nền), `data-alt="Hình trang trí"`.
3. **Không quá 6 slide liền cùng nền cùng vị trí hoạ tiết**; không quá 10 slide liền cùng họ nền — xen N2/N3.
4. **Một họ nền không quá 80 %** deck.
5. N2 dùng **đúng vai**: mở chương, số lớn, trích luật, câu chốt, kết — không đổi nền ngẫu nhiên giữa các slide nội dung.
6. Mọi nền trong **cùng bảng màu** 3–5 màu của bài; N2 là màu chủ, N3 dùng màu chủ hoặc màu nhạt của nó.
7. Chữ không đặt trực tiếp lên ảnh phức tạp (N4 phải có khối phẳng).

## 3. Trong kế hoạch
- `thiet-ke/he-thong.md` có mục **Hệ nền**: loại nền chọn, mã màu, bộ hoạ tiết (vẽ trong `asset/`, có bảng xem thử), slide nào dùng nền nào.
- `thiet-ke/nhip.md` có **dải nền** bên dưới dải kiểu slide (vd. `1 1 2 1 3 1 1 2 …`) — soát quy tắc 3–5 ngay trên giấy trước khi dựng.
- HTML: khai báo `<section data-nen="N1">` (máy đếm chính xác hơn đoán). Máy (`scripts/da_dang.js`) in dải nền thực tế và báo ◇ khi trượt quy tắc 1, 3, 4.
