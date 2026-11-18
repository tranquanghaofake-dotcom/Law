# Một ngôn ngữ hình ảnh + bộ bố cục mẫu — chống "hổ lốn"

Bài học Chương 3 (15/11/2026, Hào: "vẫn là một mớ hổ lốn"): sau 6 vòng sửa, deck chứa cùng lúc ảnh tư liệu, nhân vật hoạt hình, nhà khối phẳng, icon nét, hoạ tiết góc, dải màu, thẻ bo góc có bóng, khung tròn — mỗi thứ được thêm để vá một lời chê hoặc một con số đo ("đa dạng", "tiêu điểm"). Từng slide sạch lỗi máy, nhưng cả deck là năm ngôn ngữ hình ảnh đánh nhau. **Đẹp chuyên nghiệp = ít loại thứ, dùng lặp lại có kỷ luật** — không phải nhiều thứ.

## 1. Chọn MỘT hướng (art direction) — ghi vào `thiet-ke/phong-cach.json`
| Hướng | Loại hình được dùng | Không trộn với |
|---|---|---|
| **Biên tập học thuật** (luật, kinh tế, báo cáo — **mặc định** cho bài luật, báo cáo nhóm, Hào chọn 18/11/2026) | **chính tài liệu của bài** (trang văn bản, bảng gốc chụp / cắt — `scripts/trang_goc.js`) · ảnh tư liệu đúng sự vật · sơ đồ nét · biểu đồ · chữ lớn (Lora) · bảng kẻ ngang · nền trắng | nhân vật hoạt hình, đồ vật vẽ phẳng, hoạ tiết trang trí |
| **Minh hoạ** (phổ biến, thiếu nhi, truyền thông) | nhân vật CC0 (Open Peeps…) + đồ vật vẽ cùng nét viền · icon cùng nét | ảnh tư liệu |
| **Dữ liệu** (báo cáo số) | biểu đồ, số lớn, bảng · icon nét | minh hoạ, ảnh |
| **Tư vấn pháp lý — khối phẳng** (bài giảng phổ thông; KHÔNG mặc định — dễ thành vẻ "AI", xem mục 7) | nền sáng + dải chéo / mảng màu theo vai · cảnh minh hoạ phẳng vẽ bằng code (vật pháp lý: ô, nhà, hợp đồng có dấu, búa, mặt tiền cột, đồng hồ cát, người bán thân) · khối thông tin tô đặc (ô số, thẻ có dải đầu, huy hiệu icon) · chữ Lora lớn | ảnh chụp ngoài vai "ảnh nói"; icon nét mảnh làm hình chính |

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
- **Tiêu đề là kết luận cụ thể, nói thẳng**: câu đủ chủ ngữ + vị ngữ, có đối tượng thật (ai, điều khoản nào, con số nào) — người chỉ đọc tiêu đề vẫn biết slide chứng minh điều gì. "Phí gồm phí thuần và phụ phí" ✓; "Doanh thu phí giảm 8 % năm 2023 vì bán bảo hiểm qua ngân hàng sai phạm" ✓; "Bốn năm, bốn trạng thái" ✗ (chơi chữ, không có thông tin); "Bảo hiểm thương mại" ✗ (nhãn). Không ép ≤ 8 từ — tiêu đề dài 2 dòng rõ nghĩa hơn tiêu đề 1 dòng đố mẹo.
- **Nút sơ đồ đúng hai cỡ** (vd. `R1 = 130`, `R2 = 90`): nút chính / nút phụ. Vòng tròn đủ cỡ 180–420 px là lỗi nhất quán.
- **Hai loại đường**: quan hệ (dòng tiền, chuyển giao) = mũi tên màu chủ, nét chuẩn, **có nhãn sát**; cấu trúc (cây, nối chủ thể, trục) = màu chữ phụ, 2 px, không đầu mũi tên. Màu kẻ nhạt chỉ để kẻ bảng và khung.
- **Câu chốt**: phụ đề đặt ngay dưới câu (≈ 36 px), cả cụm căn giữa theo chiều dọc (flex) — không đặt hai khối ở hai toạ độ cố định cách nhau 200+ px.
- **Bảng**: đầu cột đậm màu chủ, cỡ ≥ thân; thân chữ thường, chỉ cột đầu đậm; ô ≤ 2 dòng — căn cứ "(Điều… khoản…)" dời xuống dòng nguồn dưới bảng.
- **Nghĩa màu cố định**: đỏ chỉ cho rủi ro / "không"; câu hỏi bài tập dùng màu chủ. Chấm tô đặc, màu nhấn phải có nghĩa và có chú giải ("● đang có hiệu lực") — không thì bỏ tô.
- **Phụ đề không lặp tiêu đề và không đố**: phụ đề nói phạm vi / căn cứ / đơn vị ("Điều 5 hợp đồng; tính từ ngày hợp đồng có hiệu lực"), không phải một câu khẩu hiệu thứ hai.
- **Nhãn đoạn trên thanh / cột**: đặt ở tâm đoạn, cùng màu đoạn, vạch dẫn ngắn — không đặt ở ranh giới hai đoạn.
- **Cột đều**: các cột lá / bước chia đều theo tâm (vd. 330 / 750 / 1170 / 1590), hộp mô tả hẹp hơn khoảng cách tâm ≥ 40 px.
- **Ảnh quét**: cắt sát tranh, bỏ viền giấy và viền máy quét trước khi tô hai màu; chú thích ảnh neo theo đáy (`bottom`), không theo `top`, để chú thích hai dòng không tràn.
- **Icon**: chọn icon trọn hình ở cỡ lớn (car-crash bị cắt nửa trông như hỏng → `scale` cho trách nhiệm); không có icon tô đặc duy nhất giữa bộ icon nét.

## 7. Chống vẻ "AI" — thay cho mục "Giàu có hệ thống" cũ (bài Nhóm 2, 18/11/2026)
Hào: "bảng, textbox, đồ thị còn AI, xấu, bị ẩn đi với môi trường". Mục 7 cũ **bắt** dùng chip nhãn, thẻ có dải đầu màu + bóng lệch, huy hiệu vuông bo chứa icon, panel nền màu nhạt, lấp lánh, lưới chấm — đó chính là chữ ký của slide mẫu do AI dựng, và các panel nhạt trên nền kem (≈ 1,1 : 1) làm mọi ranh giới tan vào nền. Bỏ hết. Đích mới: **trông như trang báo cáo / tạp chí chuyên ngành**, không như giao diện app.
- **Không khối nếu không cần**: chữ và số đứng thẳng trên nền; nhóm thông tin bằng khoảng trắng + một đường kẻ ngang 2 px màu mực, không bằng thẻ. Khối màu chỉ dùng khi chính màu mang nghĩa (hàng nhấn của bảng, ô kết luận) và phải **tách nền ≥ 3 : 1** (nền đậm hẳn, hoặc viền ≥ 2 px đậm). Máy: `scripts/chong_ai.js` báo ◐ khối chìm.
- **Góc vuông hoặc bo ≤ 8 px; không bóng đổ** (kể cả "bóng phẳng lệch"). Máy báo ◇ vẻ AI.
- **Nhãn in hoa giãn chữ ≤ 2 mỗi slide** (nhãn mục ở góc + tối đa một nhãn nhấn). Tên bên, tên cột, chú thích viết chữ thường.
- **Icon không phải hình chính và không đóng hộp**: icon chỉ đứng cạnh chữ khi nó giúp nhận ra vật nhanh hơn; không xếp "huy hiệu icon" đầu mỗi dòng cho có.
- **Bảng**: nền trắng hoặc nền slide, kẻ ngang (đầu bảng kẻ 3 px mực, hàng kẻ 1 px xám đủ thấy ≥ 3 : 1 với nền), số canh phải cùng phông số, một hàng nhấn bằng nền màu đậm vừa — không zebra nhạt, không thẻ cho từng hàng.
- **Biểu đồ**: có trục 0, có đơn vị ở tên trục hoặc tiêu đề phụ, nhãn số đặt ngay đầu cột / thanh cho **mọi** giá trị người nghe cần đọc, không lưới nền; màu theo nghĩa có chú giải (hoặc gán nhãn trực tiếp lên dãy). Nguồn ghi dưới biểu đồ.
- **Không hoạ tiết lấp chỗ**: chấm, lấp lánh, vòng tròn góc, mảng tròn sau ảnh — bỏ. Khoảng trống là chủ ý, không phải lỗi.
- Ngưỡng đếm của `phong_phu.js` / `da_dang.js` (độ phủ khối, đa dạng nền, đa dạng bảng, hero) giờ chỉ là **cảnh báo** — không thêm khối để "đủ phủ".

## 8. Chữ dễ đọc **và tự hiểu được** (sửa 18/11/2026)
Lỗi bài Nhóm 2: ép "≤ 45 chữ / slide" là lỗi chặn giao → cắt chữ đến cụt ("theo uỷ quyền", "khi NĐBH tử vong", "Nhân thọ chịu đòn nặng nhất") — gọn mà vô nghĩa. Thứ tự ưu tiên mới: **hiểu được > đọc được > ít chữ**.
- Cỡ và tương phản giữ nguyên: thân bài ≥ 30 px, nhãn ≥ 28 px, chữ < 32 px tương phản ≥ 7 : 1.
- **Mỗi cụm chữ tự đứng được**: đọc riêng cụm đó (không nhìn hình, không nghe giảng) vẫn hiểu nó nói gì về ai. "Người thụ hưởng — nhận tiền bảo hiểm khi người được bảo hiểm tử vong" ✓; "khi NĐBH tử vong" ✗.
- **Không viết tắt** trừ khi đã ghi đủ ở lần đầu trên slide ("người được bảo hiểm (NĐBH)") hoặc là từ mọi người nghe đều biết (khai trong thẻ `"vietTat"`). Máy: ◇ khó hiểu: viết tắt chưa định nghĩa.
- Số chữ (45 / 75 / 95) chỉ là **cảnh báo**. Nhiều chữ quá thì **tách slide** hoặc cho hình chở (nhãn trên hình) — không cắt thành cụm cụt.
- Ẩn dụ, chơi chữ, câu đối xứng ("Bốn năm, bốn trạng thái", "Hai bên ký, năm tư cách") là lỗi khó hiểu — xem tiêu đề ở mục 6.

## 9. Slide hero — tuỳ chọn
Một phần có thể có slide "dừng mắt" (ảnh / hình chính ≥ 50 %), nhưng chỉ khi hình đó **là chính sự vật của ý đắt nhất** (trang hợp đồng có khoanh điều khoản, biểu đồ then chốt, văn bản luật). Không dựng hero bằng ảnh tâm trạng chung chung (toà nhà, bàn tay ký, người cầm ô). Máy chỉ cảnh báo khi thiếu.
