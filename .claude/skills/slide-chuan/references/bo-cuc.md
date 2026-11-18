# Một ngôn ngữ hình ảnh + bộ bố cục mẫu — chống "hổ lốn"

Bài học Chương 3 (15/11/2026, Hào: "vẫn là một mớ hổ lốn"): sau 6 vòng sửa, deck chứa cùng lúc ảnh tư liệu, nhân vật hoạt hình, nhà khối phẳng, icon nét, hoạ tiết góc, dải màu, thẻ bo góc có bóng, khung tròn — mỗi thứ được thêm để vá một lời chê hoặc một con số đo ("đa dạng", "tiêu điểm"). Từng slide sạch lỗi máy, nhưng cả deck là năm ngôn ngữ hình ảnh đánh nhau. **Đẹp chuyên nghiệp = ít loại thứ, dùng lặp lại có kỷ luật** — không phải nhiều thứ.

## 1. Chọn MỘT hướng (art direction) — ghi vào `thiet-ke/phong-cach.json`
| Hướng | Loại hình được dùng | Không trộn với |
|---|---|---|
| **Biên tập học thuật** (luật, kinh tế, báo cáo — chỉ khi người dùng chọn từ bảng tham chiếu; bản thử Nhóm 2 18/11/2026 bị chê "quá xấu" vì quá khô) | **chính tài liệu của bài** (trang văn bản, bảng gốc chụp / cắt — `scripts/trang_goc.js`) · ảnh tư liệu đúng sự vật · sơ đồ nét · biểu đồ · chữ lớn (Lora) · bảng kẻ ngang · nền trắng | nhân vật hoạt hình, đồ vật vẽ phẳng, hoạ tiết trang trí |
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
- **Tiêu đề ngắn một dòng + dòng kết luận nổi bật** (mục 7): tiêu đề gọi tên chủ đề cụ thể ("Thời gian chờ", "Chấm dứt hợp đồng"), không chơi chữ ("Bốn năm, bốn trạng thái" ✗); kết luận cụ thể có đối tượng thật nằm ở dòng nổi bật ("Sinh con phải chờ 635 ngày").
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

## 7. Học từ mẫu người dùng chọn — đẹp = hệ thống lặp có kỷ luật (bài Nhóm 2, 18/11/2026)
Hai lần sai liền: bản "khối phẳng" bị chê **"AI, xấu, hoà vào nền"**; bản sửa sang "biên tập tối giản" (bỏ hết khối, hoạ tiết, hình; tiêu đề câu dài) bị chê **"quá xấu"** — trông như trang Word. Hào không mô tả được cái đẹp nhưng **chọn được bằng mắt**: mẫu Slidesgo số 12, 14, 20 (bảng tham chiếu đánh số). Quy tắc rút từ slide bên trong của ba mẫu đó:
- **Chọn phong cách theo chủ đề, bằng bảng tham chiếu** — không có hướng mặc định. Bước 4: dựng bảng 16–20 bìa mẫu chuyên nghiệp cùng chủ đề, đánh số (`scripts/tham_chieu.py`), người dùng chọn 2–3 số → tải slide bên trong của mẫu được chọn → rút quy tắc đo được → thẻ phong cách. Mẫu chỉ để học, không chép hình / bố cục.
- **Tiêu đề ngắn, một dòng** (≤ 7 chữ, chữ trưng bày to: in hoa đậm hoặc có chân), cùng một chỗ mọi slide. **Kết luận** của slide là một **dòng nổi bật** riêng trong thân (số lớn, câu nhấn có thanh màu) — Hào chọn 18/11/2026. Không viết tiêu đề là câu hai dòng.
- **Một họ hoạ tiết lặp ở mọi slide** (mẫu 14: dải vàng chéo ở góc; mẫu 12: mảng tròn xám ở góc; mẫu 20: bánh răng mờ + chấm cam) — đổi góc / cỡ theo bố cục. Đây là thứ nối deck thành một, **không** phải "hoạ tiết lấp chỗ". Hoạ tiết không nằm dưới chữ.
- **Một họ hình xuyên suốt**: ảnh thật cùng cách cắt khung + viền nhấn (14), hoặc minh hoạ cùng một bộ, cùng màu (12, 20). Lặp lại cùng một vật ở nhiều slide là bình thường khi cùng vai.
- **Bảng màu hẹp**: nền (1) + chữ (1) + màu nhấn (1–2). Mẫu 14: navy đậm, vàng đồng, trắng.
- **Ít chữ, nhiều khoảng trống**: 2–4 cột ngắn, mỗi cột đầu là icon nhỏ cùng bộ cùng màu nhấn, tên cột đậm, 1–2 dòng mô tả. Số lớn đi với thanh nhãn màu ngay dưới.
- **Ranh giới rõ**: khối, bảng, khung phải tách nền ≥ 3 : 1 (máy: ◐ khối chìm) — lỗi "hoà vào nền" của bản khối phẳng là panel bạc hà trên nền kem, không phải do có khối.
- Vẫn tránh: thẻ bo góc lớn + bóng mờ, chip in hoa rải khắp, huy hiệu icon đặt đầu mỗi dòng cho có, hình chung chung không liên quan nội dung (máy: ◇ vẻ AI).

## 8. Chữ dễ đọc **và tự hiểu được** (sửa 18/11/2026)
Lỗi bài Nhóm 2: ép "≤ 45 chữ / slide" là lỗi chặn giao → cắt chữ đến cụt ("theo uỷ quyền", "khi NĐBH tử vong", "Nhân thọ chịu đòn nặng nhất") — gọn mà vô nghĩa. Thứ tự ưu tiên mới: **hiểu được > đọc được > ít chữ**.
- Cỡ và tương phản giữ nguyên: thân bài ≥ 30 px, nhãn ≥ 28 px, chữ < 32 px tương phản ≥ 7 : 1.
- **Mỗi cụm chữ tự đứng được**: đọc riêng cụm đó (không nhìn hình, không nghe giảng) vẫn hiểu nó nói gì về ai. "Người thụ hưởng — nhận tiền bảo hiểm khi người được bảo hiểm tử vong" ✓; "khi NĐBH tử vong" ✗.
- **Không viết tắt** trừ khi đã ghi đủ ở lần đầu trên slide ("người được bảo hiểm (NĐBH)") hoặc là từ mọi người nghe đều biết (khai trong thẻ `"vietTat"`). Máy: ◇ khó hiểu: viết tắt chưa định nghĩa.
- Số chữ (45 / 75 / 95) chỉ là **cảnh báo**. Nhiều chữ quá thì **tách slide** hoặc cho hình chở (nhãn trên hình) — không cắt thành cụm cụt.
- Ẩn dụ, chơi chữ, câu đối xứng ("Bốn năm, bốn trạng thái", "Hai bên ký, năm tư cách") là lỗi khó hiểu — xem tiêu đề ở mục 6.

## 9. Slide hero — tuỳ chọn
Một phần có thể có slide "dừng mắt" (ảnh / hình chính ≥ 50 %), nhưng chỉ khi hình đó **là chính sự vật của ý đắt nhất** (trang hợp đồng có khoanh điều khoản, biểu đồ then chốt, văn bản luật). Không dựng hero bằng ảnh tâm trạng chung chung (toà nhà, bàn tay ký, người cầm ô). Máy chỉ cảnh báo khi thiếu.
