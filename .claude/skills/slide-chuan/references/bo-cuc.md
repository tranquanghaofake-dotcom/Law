# Một ngôn ngữ hình ảnh + bộ bố cục mẫu — chống "hổ lốn"

Bài học Chương 3 (15/11/2026, Hào: "vẫn là một mớ hổ lốn"): sau 6 vòng sửa, deck chứa cùng lúc ảnh tư liệu, nhân vật hoạt hình, nhà khối phẳng, icon nét, hoạ tiết góc, dải màu, thẻ bo góc có bóng, khung tròn — mỗi thứ được thêm để vá một lời chê hoặc một con số đo ("đa dạng", "tiêu điểm"). Từng slide sạch lỗi máy, nhưng cả deck là năm ngôn ngữ hình ảnh đánh nhau. **Đẹp chuyên nghiệp = ít loại thứ, dùng lặp lại có kỷ luật** — không phải nhiều thứ.

## 1. Chọn MỘT hướng (art direction) — ghi vào `thiet-ke/phong-cach.json`
| Hướng | Loại hình được dùng | Không trộn với |
|---|---|---|
| **Biên tập học thuật** (luật, kinh tế, báo cáo) | ảnh / tranh tư liệu hai màu · sơ đồ nét + icon nét cùng độ dày · chữ lớn (Lora) · bảng kẻ ngang | nhân vật hoạt hình, đồ vật vẽ phẳng, hoạ tiết trang trí |
| **Minh hoạ** (phổ biến, thiếu nhi, truyền thông) | nhân vật CC0 (Open Peeps…) + đồ vật vẽ cùng nét viền · icon cùng nét | ảnh tư liệu |
| **Dữ liệu** (báo cáo số) | biểu đồ, số lớn, bảng · icon nét | minh hoạ, ảnh |
| **Tư vấn pháp lý — khối phẳng** (bài giảng luật cho sinh viên, mặc định khi chủ bài muốn "chuyên nghiệp như mẫu") | nền sáng + dải chéo / mảng màu theo vai · cảnh minh hoạ phẳng vẽ bằng code (vật pháp lý: ô, nhà, hợp đồng có dấu, búa, mặt tiền cột, đồng hồ cát, người bán thân) · khối thông tin tô đặc (ô số, thẻ có dải đầu, huy hiệu icon) · chữ Lora lớn | ảnh chụp ngoài vai "ảnh nói"; icon nét mảnh làm hình chính |

`phong-cach.json` khai: `bangMau` (≤ 10 màu, kể cả màu chữ phụ, màu kẻ), `loaiHinh` (vd. `["anh-hai-mau","net"]`), `boCuc` (danh sách bố cục mẫu), `tieuDeCoDinh`, `nguong` (chỉnh ngưỡng đa dạng nếu hướng tối giản cần nhiều slide cùng nền giấy). Máy (`scripts/nhat_quan.js`) bắt: màu ngoài bảng (chữ, nền, viền HTML và màu trong SVG), hình không khai / sai `data-loai`, slide không khai `data-mau` hoặc bố cục ngoài danh sách, tiêu đề lệch chỗ.

## 2. Bộ bố cục mẫu (8–12 bố cục) — dựng trước, đổ nội dung sau
Như một mẫu bán slide: thiết kế bố cục một lần, mọi slide là một **thể hiện** của bố cục. Viết thành hàm trong `deck.js` của bài (vd. `mBia`, `mMoPhan`, `mCau`, `mNoiDung`, `mSo`, `mTrich`, `mBang`, `mTruc`, `mHoi`, `mKet`), mỗi `<section>` khai `data-mau`.
- **Khung cố định**: lề, vị trí nhãn mục và tiêu đề, vùng nội dung, chỗ chú thích nguồn — giống hệt nhau giữa các slide cùng bố cục.
- **Biến thể nằm trong vùng nội dung**, không phá khung (hình trái / phải, 1–3 cột).
- Bố cục mở phần / câu chốt / câu hỏi đổi nền (màu chủ đậm); bố cục nội dung giữ nền giấy — **cùng nền nhiều slide liền là bình thường** khi khung chữ và hình thay đổi đủ.
- Không thêm thứ trang trí ngoài hệ thống để "đỡ đơn điệu": nhịp đến từ đổi bố cục (sơ đồ → số lớn → bảng → trích luật), không từ hoạ tiết.

## 3. Ngôn ngữ nét (hướng biên tập)
- Một độ dày nét cho sơ đồ và icon (vd. 3 px khi chiếu 1920): icon Tabler chỉnh `stroke-width` theo cỡ hiển thị để nét thật bằng nét sơ đồ.
- Nút sơ đồ = vòng tròn nét + icon; quan hệ = mũi tên nét mảnh có nhãn đặt sát; nhấn = một màu nhấn duy nhất (hoặc đỏ cho rủi ro / "không").
- Không bóng đổ, không bo góc lớn, không gradient; mảng màu phẳng chỉ dùng cho khối nhấn (một hàng bảng, một ô kết luận).

## 4. Cổng thẩm mỹ trước khi dàn ra cả deck
Làm 6–8 slide mẫu phủ các bố cục chính (bìa, mở phần, sơ đồ, số lớn, bảng, trích luật, câu hỏi) → tờ so sánh với mẫu tham chiếu → người duyệt độc lập chấm **Thẩm mỹ ≥ 4 và Nhất quán ≥ 4** → mới dàn 40+ slide. Không đạt: sửa bố cục mẫu, không vá từng slide.

## 5. Dấu hiệu hổ lốn (soát bằng mắt)
- Đặt 9 slide cạnh nhau (ảnh tổng): thấy > 2 "giọng" hình (ảnh thật + hoạt hình + đồ hoạ phẳng…) → hổ lốn.
- Mỗi slide một kiểu thẻ / bo góc / bóng khác nhau; tiêu đề nhảy chỗ; màu mới xuất hiện ở một slide.
- Có thứ chỉ để "lấp chỗ trống" (hoạ tiết, nhân vật đứng không chở ý, thẻ trống).

## 6. Ngữ pháp hình — chi tiết làm nên điểm Thẩm mỹ 4 (vòng duyệt Ch3, 15/11/2026)
Viết thành hằng số / hàm trong `deck.js`, không để từng slide tự chọn:
- **Bố cục nội dung**: nhãn mục → tiêu đề → **dòng phụ đề một câu chốt ý luôn có** (hàm bố cục báo lỗi khi thiếu) → vùng nội dung → dòng nguồn ở đáy. Thiếu phụ đề thì khoảng trống dưới tiêu đề dao động giữa các slide, mắt thấy "lệch".
- **Tiêu đề là câu khẳng định**, không là nhãn: "Hai bên ký, bốn chủ thể liên quan" thay cho "Bốn chủ thể của hợp đồng"; "Phí gồm phí thuần và phụ phí" thay cho "Phí bảo hiểm".
- **Nút sơ đồ đúng hai cỡ** (vd. `R1 = 130`, `R2 = 90`): nút chính / nút phụ. Vòng tròn đủ cỡ 180–420 px là lỗi nhất quán.
- **Hai loại đường**: quan hệ (dòng tiền, chuyển giao) = mũi tên màu chủ, nét chuẩn, **có nhãn sát**; cấu trúc (cây, nối chủ thể, trục) = màu chữ phụ, 2 px, không đầu mũi tên. Màu kẻ nhạt chỉ để kẻ bảng và khung.
- **Câu chốt**: phụ đề đặt ngay dưới câu (≈ 36 px), cả cụm căn giữa theo chiều dọc (flex) — không đặt hai khối ở hai toạ độ cố định cách nhau 200+ px.
- **Bảng**: đầu cột đậm màu chủ, cỡ ≥ thân; thân chữ thường, chỉ cột đầu đậm; ô ≤ 2 dòng — căn cứ "(Điều… khoản…)" dời xuống dòng nguồn dưới bảng.
- **Nghĩa màu cố định**: đỏ chỉ cho rủi ro / "không"; câu hỏi bài tập dùng màu chủ. Chấm tô đặc, màu nhấn phải có nghĩa và có chú giải ("● đang có hiệu lực") — không thì bỏ tô.
- **Nhãn đoạn trên thanh / cột**: đặt ở tâm đoạn, cùng màu đoạn, vạch dẫn ngắn — không đặt ở ranh giới hai đoạn.
- **Cột đều**: các cột lá / bước chia đều theo tâm (vd. 330 / 750 / 1170 / 1590), hộp mô tả hẹp hơn khoảng cách tâm ≥ 40 px.
- **Ảnh quét**: cắt sát tranh, bỏ viền giấy và viền máy quét trước khi tô hai màu; chú thích ảnh neo theo đáy (`bottom`), không theo `top`, để chú thích hai dòng không tràn.
- **Icon**: chọn icon trọn hình ở cỡ lớn (car-crash bị cắt nửa trông như hỏng → `scale` cho trách nhiệm); không có icon tô đặc duy nhất giữa bộ icon nét.

## 7. Giàu có hệ thống — chống "quá đơn giản" (Chương 3, 15/11/2026)
Sau khi chữa hổ lốn bằng cắt bớt, deck thành sạch nhưng nghèo (Hào: "vẫn còn quá đơn giản từ nền, layout, tiêu đề"). Hai lỗi là hai đầu của một trục: **hổ lốn = nhiều loại thứ; nghèo = ít thứ và dùng rụt rè**. Đích: **ít loại thứ, dùng mạnh tay** — như mẫu thương mại (ref-42, 43, 48):
- **Nền có vai**: mỗi slide sáng có một khối hình học lớn màu nhạt (dải chéo, cung tròn, mảng góc) đổi vị trí theo bố cục; mở phần / câu chốt nền đậm có dải sáng hơn; chia đôi bằng panel màu chủ cùng một bề rộng cho cả deck. Hoạ tiết (chấm, lấp lánh) **không nằm dưới chữ**.
- **Hình chính là cảnh, không là hình dán**: 2–5 vật minh hoạ phẳng ghép thành cảnh có lớp (vật trước / sau, mặt đất, mưa xiên, cụm lấp lánh 1 lớn + 2 nhỏ), đặt **trên** dải màu, có thể tràn mép. Không dùng "icon trong vòng tròn" làm mặc định cho mọi slide. Mỗi slide nội dung có một khối hình ≥ 30 % diện tích (bảng, thẻ tô màu cũng tính).
- **Một vật = một nghĩa, dùng lặp**: toà nhà có huy hiệu = DNBH ở mọi slide; mặt tiền 5 cột chỉ cho "năm nguyên tắc". Không để một hình mang hai nghĩa.
- **Khối thông tin tô đặc**: ô số, chip nhãn, thẻ có dải đầu màu + bóng phẳng lệch, huy hiệu vuông bo chứa icon trắng, bảng có đầu cột tô và tab màu đầu hàng, thanh so sánh ngay trong ô.
- **Tiêu đề**: Lora 72 px, luôn có một cụm từ khoá tô màu chủ; tiêu đề là câu khẳng định.
- **Nghĩa màu giữ nguyên**: đỏ chỉ rủi ro / "không"; ô lựa chọn câu hỏi một màu (màu khác dành cho đáp án đúng).
- **Máy đo**: `scripts/phong_phu.js` báo ◇ khi < 70 % slide có khối thị giác ≥ 25 % diện tích hoặc > 30 % slide nền trơn. Vật minh hoạ của bài viết trong `minh-hoa.js` **ở thư mục bài** (không lưu vào skill); tờ thử vật (`thu-mh`) soát phong cách trước khi ghép.
- **Cổng**: 8 slide mẫu (bìa, mở phần, sơ đồ, số lớn, bảng, trích luật, so sánh, câu hỏi) → người duyệt chấm thêm hạng **Phong phú ≥ 4** khi đặt cạnh mẫu.

## 8. Chữ dễ đọc + hình cách điệu (Chương 3, vòng 4 — Hào: "chữ rõ ràng, dễ nhìn và hiểu; hình phong phú, sáng tạo, có thể cách điệu")
**Chữ** — chiếu trên máy chiếu lớp học, người ngồi cuối lớp phải đọc được:
- Thân bài ≥ 30 px (nhãn ≥ 28 px; dòng nguồn ≥ 26 px); chữ phụ màu đủ đậm để đạt **≥ 7 : 1** khi chữ < 32 px (máy chiếu làm bạc màu — xám #55… không đủ, dùng #3F4B48); chữ trên ô màu đậm thì ≥ 32 px đậm.
- **≤ 45 chữ / slide nội dung** (bảng, câu hỏi, so sánh ≤ 75; trích nguyên văn ≤ 95), không đoạn nào quá 3 dòng. Phụ đề trùng ý với hình thì bỏ — hình chính đã nói.
- **Ví dụ số → hình**: "nhà 1 tỷ, STBH 600 triệu, thiệt hại 200 triệu → bồi thường 120 triệu" thành dải ô màu nối mũi tên (mỗi ô một màu theo nghĩa: tài sản bạc hà, STBH vàng, thiệt hại đỏ nhạt, kết quả vàng sáng). Nhãn lặp lại ở mọi hàng → gom thành một chú giải trên đầu bảng.
- Máy: `scripts/de_doc.js` báo ◇ dễ đọc (số chữ, chữ < 28 px, đoạn dài, tương phản < 7 : 1 cho chữ nhỏ — nền dưới chữ tìm theo hình học vì thẻ là lớp ảnh).
**Hình cách điệu** — một thủ pháp cho mỗi vai, lặp lại có chủ ý:
- Ảnh trong khung **vòm** (bìa), **tròn** (mở phần), panel chia đôi (trích luật); kèm một mảng màu lệch phía sau và một viền vàng lệch phía trước — chiều sâu không cần bóng mờ. `scripts/phu_mau.js --khung=vom|tron|bo --hat=0.05` (hạt in nhẹ cho cảm giác ảnh in).
- Thẻ nổi đè lên mép ảnh (bìa: "Chuyển giao rủi ro tài chính qua hợp đồng") — phá khung, nối chữ với ảnh.
- Lấp lánh 1 lớn + 2 nhỏ, lưới chấm: chỉ ở góc trống, không dưới chữ.

## 9. Mỗi phần một slide HERO (Chương 3, vòng 6)
Người duyệt: "qua cổng nhưng chưa wow như mẫu" — mẫu thương mại luôn có vài slide **dừng mắt**. Luật: từ một slide mở phần tới trước slide mở phần kế tiếp (phần ≥ 3 slide) phải có **≥ 1 slide hero** — ảnh tràn mép phủ dải màu chủ với chữ sáng (vd. trích định nghĩa trên ảnh ký hợp đồng), hoặc một cảnh / hình chính ≥ 50 % slide. Chọn slide mang **ý đắt nhất** của phần (định nghĩa, câu chốt, con số then chốt), không chọn slide nhiều chữ. Cảnh nên **kể chuyện bằng vật**: đám mây mưa có tia sét đỏ trên đầu người mua = rủi ro; hợp đồng ở giữa; doanh nghiệp bên kia — nhìn là hiểu "chuyển rủi ro qua hợp đồng".
Máy: `scripts/phong_phu.js` báo ◇ khi một phần thiếu hero; slide hero tự nhận (ảnh tràn mép / hình ≥ 50 %) hoặc khai `data-hero` trên `<section>`.

