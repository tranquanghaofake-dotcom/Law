# Quy tắc thiết kế

## 1. Thứ bậc thị giác (3 tầng)

| Tầng | Gồm | Cỡ chữ (khổ 1080 px rộng) |
|---|---|---|
| 1 — thấy đầu tiên | Tiêu đề, hình chính, con số then chốt | Tiêu đề 56–72 px; số then chốt 40–64 px |
| 2 — thấy thứ hai | Tiêu đề mục, nhãn trên hình | 26–32 px |
| 3 — đọc khi cần | Nhãn trên hình, ghi chú, số điều | Nhãn 15–18 px; phụ ≥ 12,5 px (≈ 7 pt in) |

Tiêu đề lớn gấp 2,5–3 lần thân bài. Không quá 4 cỡ chữ trên một trang.

## 2. Lưới và khoảng trắng

- Lưới 12 cột, lề ngoài ≥ 56 px (khổ 1080), khoảng cách cột 24 px.
- Khoảng cách theo bội số 8 px (8/16/24/32/48/64).
- Khoảng trắng giữa các khối lớn hơn khoảng trắng trong khối → mắt tự nhóm.
- Thứ tự đánh số = thứ tự mắt đọc. Nếu có 2 cột, đánh số **theo hàng** (1|2, 3|4) hoặc chỉ dùng 1 cột cho phần có số.

## 3. Chữ tiếng Việt

- Font có thiết kế dấu tiếng Việt chuẩn: **Be Vietnam Pro** (Google Fonts, OFL). Dự phòng: Inter, Noto Sans.
- **Không** đặt `letter-spacing` dương cho chữ có dấu; không viết HOA toàn bộ đoạn dài (dấu chồng lên nhau, khó đọc). HOA chỉ cho nhãn ≤ 3 từ.
- Line-height thân bài 1.45–1.6 (dấu cần chỗ).
- Chuẩn chính tả: không có dấu cách trước `! ? : ;`; viết hoa tên văn bản đúng ("Bộ luật Dân sự", không "Luật Dân Sự").

## 4. Màu

- Tối đa **3 màu chức năng** + 1 dải trung tính (nền, chữ, đường kẻ). Mỗi màu = một nghĩa cố định, ví dụ: đỏ = hình sự, xanh = dân sự, vàng nghệ = hành động.
- Định nghĩa màu bằng biến CSS (`--ink`, `--paper`, `--crim`…), không gõ mã màu rải rác.
- Tương phản (WCAG 2.1): chữ thường ≥ **4.5:1**; chữ ≥ 24 px hoặc ≥ 19 px đậm ≥ **3:1**; đường/biểu tượng mang nghĩa ≥ 3:1.
- Không bao giờ: chữ vàng/hồng nhạt trên nền nhạt; chữ trắng trên vàng.
- Không dùng màu là kênh **duy nhất** để phân biệt (thêm nhãn chữ/biểu tượng) — người mù màu vẫn đọc được.

## 5. Nhấn mạnh

- Chọn **một** cách: in đậm **hoặc** nền tô nhạt (highlight). Dùng ≤ 1 lần mỗi câu.
- Không gạch chân (giống link). Không dùng đồng thời đậm + màu + gạch chân + hoa.
- Dấu "!" trong tiêu đề làm giảm độ tin cậy với nội dung pháp lý — tránh.

## 6. Hình & biểu tượng

- Hình chính phải **mang dữ liệu** (thước, cây, bảng), không chỉ trang trí.
- Minh họa người: tránh khắc họa nạn nhân theo khuôn mẫu; ưu tiên biểu tượng trung tính.
- SVG tự vẽ hoặc bộ icon mã nguồn mở (Lucide — ISC, Tabler — MIT). Ghi giấy phép trong phần nguồn nếu dùng.

## 6b. Tránh dáng "máy làm" (rút từ skill frontend-design)

- Nền kem + chữ serif + màu đất nung; nền đen + 1 màu neon; bộ thẻ bo góc giống hệt nhau đổ cùng một bóng — đều là mặc định, chỉ dùng khi chủ đề đòi.
- Không tô màu riêng **một chữ** trong tiêu đề; không nhãn VIẾT HOA giãn chữ trên mỗi mục; không chuỗi "A · B · C".
- Đánh số (Bài 1, Bài 2…) chỉ khi nội dung thật sự là trình tự đọc/làm.
- Dồn sự táo bạo vào **một** chỗ (thường là hình chính); phần còn lại yên tĩnh. Soi gương, bỏ bớt một món trang sức.

## 7. In và photo

- Luôn A4 dọc, `.sheet` 1080×1528 px; vùng an toàn ≥ 52 px mỗi cạnh. Trang trí (lề, lỗ gáy) được phép ra sát mép.
- Mặc định in màu 100% trên bìa cứng. Màu nền quá nhạt (dưới ~5% mực, vd. lưới ô li) có thể mất khi in — chỉ dùng cho trang trí, không cho thông tin.
- Màu không là kênh duy nhất: mỗi nhóm vẫn có icon riêng (cũng giúp người mù màu). Nếu sẽ photo đen trắng: thêm hoa văn/kiểu viền và kiểm bằng `render.mjs --gray`.
- In thử 1 tờ trước khi in số lượng: màu trên giấy thường tối và đục hơn màn hình.
- Chữ nhỏ nhất 12,5 px trên khổ 1080 (≈ 7 pt khi in) — chỉ cho nhãn phụ; thân bài ≥ 15 px.

## 8. Khối bắt buộc trên trang

- **Số điều cạnh khối liên quan** (vd. "Điều 586 Bộ luật Dân sự" cạnh hàng dân sự) — đủ để người đọc tra lại.
- **Một dòng ký tên + miễn trừ**: "<Tác giả> — thông tin pháp luật phổ thông, không thay thế tư vấn pháp lý".
- Không in khối nguồn đầy đủ, ngày đối chiếu hay con dấu "đã đối chiếu": để ở `nguon.md` (ngoài trang in).
- Dấu `*` nào cũng phải có chú thích tương ứng.
