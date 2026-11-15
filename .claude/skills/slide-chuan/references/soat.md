# Soát — từng slide và cả deck

## 1. Mười điều kiểm mỗi slide (nhìn bằng mắt trên `h-NN.jpg`)
1. **Glance test 3 giây**: nhìn 3 giây rồi quay đi, nói lại được ý chính (Duarte). Và **đọc riêng slide (không nghe lời giảng) vẫn nắm đủ ý** — thiếu ý cốt lõi trên slide là lỗi, kể cả khi ghi chú có.
2. **Một ý**; tiêu đề là câu khẳng định đầy đủ (chủ ngữ + vị ngữ + phạm vi), ≤ 2 dòng (Alley).
3. **Bằng chứng là hình** (sơ đồ, bảng, ảnh, hình vẽ đúng tỉ lệ) — không phải gạch đầu dòng.
4. **Không chi tiết thừa**: chỉ vào từng chấm, dải, vật, màu — nói được nó mang nghĩa gì; không nói được thì bỏ (Mayer: coherence).
5. **Không chép lời nói lên slide**: chữ trên slide là từ khoá, định nghĩa, số cần nhìn; giải thích để ở notes (Mayer: redundancy).
6. **Tối đa 1–2 điểm nhấn** (màu nhấn, mũi tên, đậm) đúng chỗ cần chú ý (Mayer: signaling).
7. **Nhãn sát hình**: tên đặt ngay cạnh vật nó gọi, không bắt tra chú giải xa (Mayer: contiguity).
8. **Thứ bậc**: tiêu đề > nội dung > chú thích; nheo mắt vẫn thấy điểm nhấn.
9. **Đọc được khi chiếu**: tương phản ≥ 4,5 : 1 (chữ lớn ≥ 3 : 1); chữ ≥ 12 pt, chữ thân ≥ 14 pt (máy kiểm, mắt kiểm lại trên nền ảnh).
10. **Đúng và có nguồn**: số, điều luật khớp `noi-dung.md`; luật có số hiệu, điều, hiệu lực; ảnh có nguồn trong `ghi-cong.md` và `data-alt`.

Thêm cho hình: **hình là chính sự vật** (không ẩn dụ phải giải thích); **tỉ lệ hình = tỉ lệ số liệu** khi hình chở số; **một phong cách** cho cả deck.

## 2. Rubric cả deck (người duyệt độc lập chấm 1–5, kèm lý do)
| Hạng | 5 | 3 | 1 |
|---|---|---|---|
| Nội dung | đúng, đủ mục tiêu, mọi nhận định có nguồn | vài chỗ thiếu nguồn / thiếu ý | sai luật, sai số |
| Thiết kế | thứ bậc rõ, khoảng thở, nhất quán, hình đúng sự vật | nhất quán nhưng dày / nhạt | rối, lệch phong cách, hình sai nghĩa |
| Mạch lạc | đọc liền tiêu đề thành lập luận | có chỗ nhảy ý | rời rạc |
| Dễ hiểu | sinh viên mới học hiểu từng slide trong 3 giây | phải nghe giảng mới hiểu | khó hiểu cả khi nghe |
| **Nhất quán** (chống hổ lốn, `bo-cuc.md`) | một ngôn ngữ hình ảnh, mọi slide đúng bố cục mẫu, cùng bảng màu, cùng nét | 2 giọng hình, vài slide lệch khung | ≥ 3 giọng hình (ảnh thật + hoạt hình + đồ hoạ phẳng…), mỗi slide một kiểu |
| **Phong phú** (chống quá đơn giản, `bo-cuc.md` mục 7) | đặt cạnh mẫu thương mại không thấy "trơn": nền có khối theo vai, hình chính là cảnh, khối tô đặc | nền trơn, hình nét nhỏ giữa khoảng trống, nhiều slide chỉ chữ |
| **Dễ đọc** (`bo-cuc.md` mục 8) | đọc được từ cuối lớp trên máy chiếu: thân bài ≥ 30 px, ≥ 7 : 1, ≤ 45 chữ / slide | chữ xám nhạt nhỏ, đoạn dài, slide đặc chữ |
| **Thẩm mỹ** (so với bảng tham chiếu) | đứng cạnh mẫu chuyên nghiệp không lạc tông: thứ bậc rõ, cân bằng, căn theo lưới, khoảng thở đều, có nhịp; **đa dạng trong hệ thống**: ≥ 3 loại nền đúng vai + hoạ tiết đổi vị trí, ≥ 6 kiểu trình bày dữ liệu, mỗi phần một hình chính riêng | sạch nhưng đơn điệu: một nền phẳng suốt deck, bảng một kiểu, cùng vài hình dán lại nhiều slide | lệch lưới, chật / trống bất thường, hình sai tỉ lệ, đổi nền / màu ngẫu nhiên không theo vai |
Giao khi mọi hạng ≥ 4 — kể cả Nhất quán và Thẩm mỹ (PPTEval dùng Nội dung / Thiết kế / Mạch lạc, thang 1–5 — arXiv 2501.03936).

## 3. Máy kiểm (`scripts/dung.js`) — đọc thông báo thế nào
| Thông báo | Sửa |
|---|---|
| chữ không nằm trong [data-t] | gắn `data-t` cho khối chữ (hoặc `data-prop` nếu cố ý làm ảnh: bìa sách, biển hiệu trong hình) |
| chữ trong SVG | xoá `<text>`, đặt chữ HTML `data-t` đè lên hình |
| tràn khỏi hộp | rút chữ, nới hộp, hoặc tách slide — không thu cỡ chữ dưới ngưỡng |
| ra ngoài vùng an toàn | dời vào trong lề 40 px ngang / 24 px dọc (`data-ngoai` nếu cố ý cho Morph) |
| bị lớp ảnh đè / hai hộp chữ đè nhau | dời hình hoặc chữ; đặt chữ ở lớp trên. Giới hạn: máy cần ≥ 15 % điểm mẫu bị che mới báo (khung ảnh gồm cả phần trong suốt) — một chữ cuối dòng bị hình che có thể lọt, phải nhìn ảnh |
| chữ < 12 pt / % chữ ≥ 14 pt thấp | tăng cỡ, rút chữ |
| ◐ tương phản | đậm chữ, làm yên nền sau chữ (lớp phủ, thẻ nền) |
| ¶ mồ côi | sửa câu hoặc bề rộng hộp |
| ↔ lệch 4–10 px | canh thẳng hàng |
| không có tiêu đề | `data-tieu-de` trên hộp chữ tiêu đề |
| thiếu data-alt | mô tả hình; trang trí → `data-alt="Hình trang trí"` |
| từ chỉ có trong ảnh | chữ bị chụp vào ảnh — tách ra thành `data-t` |
| ◇ nền: ít loại / một nền > 80 % / > 6 slide liền | thêm N2/N3 đúng vai, đổi góc hoạ tiết N1 (`he-nen.md`) |
| ◇ asset: hình dùng trên > 3 slide | vẽ hình chính riêng cho ý đó; motif cố ý cùng vai → `data-lap` |
| lớp ảnh tràn khỏi mép slide | dời / thu hình; cố ý tràn mép (ảnh nền, hoạ tiết) → `data-ngoai` |
| ◇ nhất quán: màu ngoài bảng / loại hình ngoài thẻ / không khai data-mau / tiêu đề lệch | dùng màu, loại hình, bố cục đã khai trong `phong-cach.json`; sửa ở bố cục mẫu (`bo-cuc.md`) |
| ◇ tiêu điểm: slide không có khối thị giác ≥ 25 % | phóng hình chính lên 30–45 % slide, đặt mảng màu hoặc số lớn; slide cố ý chỉ chữ → `data-khong-hinh` (`nguon-hinh.md` quy tắc 1) |
| ◇ phong cách: hình có gradient / bóng mờ / quá nhiều màu so với thẻ | vẽ lại theo `thiet-ke/phong-cach.json`; xem `<tên>_lop/asset.jpg` để thấy hình lệch |
| ◇ bảng: một kiểu / một kiểu > 40 % | chọn lại kiểu theo loại thông tin (`trinh-bay-du-lieu.md`) |
| ◇ phong phú: < 70 % slide có khối thị giác ≥ 25 % / > 30 % slide nền trơn | thêm khối hình học nền theo vai, thẻ tô đặc, cảnh minh hoạ lớn (`bo-cuc.md` mục 7); tối giản thật thì thẻ khai `"phongPhu": false` kèm lý do |
| ◇ dễ đọc: slide quá nhiều chữ / chữ < 28 px / đoạn > 3 dòng / chữ nhỏ tương phản < 7 : 1 | rút câu, bỏ phụ đề trùng hình, biến ví dụ số thành dải hình, gom nhãn lặp thành chú giải; chữ phụ đậm màu hơn (`bo-cuc.md` mục 8) |
| PPTX lệch HTML (tờ soát) | dùng thuộc tính CSS mà PowerPoint dựng lại được (`hop-dong-html.md`) |
