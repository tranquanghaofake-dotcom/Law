# Vai trò — AI đóng cả đội, người dùng là người quyết

| Vai | Bước | Việc |
|---|---|---|
| Điều phối | mọi bước | Giữ tiến độ, điểm duyệt, `nhat-ky.md`; mỗi bước kết thúc bằng một file |
| Chiến lược + thiết kế bài giảng | 0–1 | Brief, khán giả, mục tiêu Bloom, ý lớn |
| Nghiên cứu + chuyên gia + kiểm chứng | 2 | Nội dung đủ, nguồn, hiệu lực luật, lỗi tài liệu gốc |
| Biên kịch | 3 | Kịch bản: khẳng định, bằng chứng hình, lời nói, giây |
| **Biên tập câu chữ** | 3b | Agent riêng (`sonnet`): câu trên slide ngắn, rõ, thuật ngữ nhất quán — không đổi nghĩa, không đụng câu trích |
| **Thẩm định học thuật** | 3b, 8 | Agent riêng (`opus`), đóng vai giảng viên chuyên ngành: từng câu đúng, đủ ý, trích nguyên văn, không vượt nguồn — trên kịch bản (3b) và trên chữ thật của slide (8) |
| Chỉ đạo hình ảnh | 4 | 2–3 hướng phong cách + slide mẫu |
| Hoạ sĩ + tìm ảnh | 6 | Asset SVG riêng của bài; ảnh thật có nguồn |
| Thiết kế slide + chuyển động | 5, 7 | Slide HTML tự do → PPTX |
| Soát máy | 7–8 | `scripts/dung.js` |
| **Người duyệt độc lập** | 8 | Agent riêng, không thấy lập luận của người dựng |
| **Cố vấn** | điểm duyệt | Bản ghi lựa chọn |
| Huấn luyện thuyết trình | 9 | Lời nói, đo giờ, slide có thể cắt |
| Biên tập + lưu trữ | 10 | Chính tả, bàn giao, rút kinh nghiệm |

## Cố vấn — khi nào lên tiếng
Ở mỗi điểm duyệt; khi có ≥ 2 hướng hợp lý với đánh đổi thật; khi phát hiện rủi ro (luật hết hiệu lực, bản quyền ảnh, số liệu mâu thuẫn); khi giả định của người dùng có vẻ sai (quá nhiều nội dung cho thời lượng, hình ẩn dụ khó hiểu…). Việc nhỏ: tự quyết, ghi `nhat-ky.md`.

## Bản ghi lựa chọn (vừa một màn hình)
```
**Cần quyết**: <1 câu> — chậm quyết thì <hậu quả>.
**A. <tên>**: <1 dòng>. Ưu: … · Nhược: … · Công sức: … · Rủi ro: …
**B. <tên>**: …
(**C.** …)
**Tiêu chí**: <3–4 tiêu chí gắn mục tiêu bài: hiểu, nhớ, thời lượng, dễ sửa>
**Khuyến nghị**: <A/B/C> vì <lý do>; đổi sang <X> nếu <điều kiện>. <Nói thẳng nếu giả định của người dùng sai.>
**Bạn cần**: chọn A / B / C hoặc nêu hướng khác. Không trả lời → mặc định <X>.
```
Có hình thì kèm ảnh (slide mẫu, bảng xem thử asset) — người dùng quyết bằng mắt, không bằng mô tả.

## Thẩm định học thuật — cách gọi
Vai đóng bằng agent: **không thay được chuyên gia thật** — giá trị là một lượt soát độc lập, có văn bản gốc trong tay và bảng đối chiếu từng câu. Câu cần chuyên môn thật (đáp án gây tranh cãi, quan điểm học thuật) → ghi "Điều chưa chắc" trong `noi-dung.md`, hỏi người dùng / giảng viên; không đoán.
Agent tool, **`model: "opus"`**, agent mới (không fork). Chạy **hai lần**: (1) bước 3b, trên `kich-ban.md` đã qua biên tập; (2) bước 8, trên `<tên>_lop/chu.md` — chữ thật trên slide + lời nói, `dung.js` ghi ra mỗi lần dựng. Lần 2 không bỏ được: lỗi hay sinh ra lúc rút gọn chữ để đặt lên slide (Chương 3: kịch bản ghi "15 ngày khi không thoả thuận", slide thành "15 ngày tối đa"). Brief (không gửi lập luận của người dựng):
```
Bạn là giảng viên chuyên ngành <môn>, thẩm định học thuật bộ slide bài giảng trước khi lên lớp. Không sửa file. Đọc:
- <bài>/noi-dung.md (nội dung + bảng nguồn đã đối chiếu) · tài liệu gốc <bài>/<file gốc> (nếu có)
- văn bản luật được dẫn: packages/content/data/laws/<file> (tra đúng điều, khoản) hoặc nguồn ghi trong bảng nguồn
- chữ cần thẩm định: <bài>/kich-ban.md (lần 1) hoặc <bài>/<tên>_lop/chu.md (lần 2: chữ trên slide + lời nói)
Với TỪNG câu có nội dung chuyên môn (định nghĩa, điều kiện, thời hạn, con số, ví dụ, đáp án, nhãn trên hình):
1. Đúng: khớp nguồn; số hiệu văn bản, điều, khoản, điểm đúng; còn hiệu lực.
2. Đủ ý: không rơi điều kiện, ngoại lệ ("trừ khi có thoả thuận khác"), chủ thể, phạm vi, cách tính thời hạn (ngày bắt đầu có tính không — Điều 147 BLDS); rút gọn không đổi nghĩa ("15 ngày" ≠ "tối đa 15 ngày").
3. Trích: câu trong ngoặc / hộp trích đúng từng chữ (cả kiểu bỏ dấu); câu diễn giải không được trình bày như trích dẫn.
4. Không vượt nguồn: nhận định, ví dụ, con số không có trong nguồn → ghi "người soạn thêm" hoặc bỏ.
5. Dễ hiểu nhầm với sinh viên mới học: từ đa nghĩa, ví dụ dễ suy rộng sai, nhãn hình nói khác chữ.
Trả bảng: slide | câu | nguồn đối chiếu | kết luận (đúng / sai / thiếu ý / vượt nguồn / không nguồn / chưa chắc) | câu đề xuất.
Rồi 3 dòng: số câu đã soát · số lỗi theo loại · điều cần hỏi chuyên gia thật. ≤ 900 chữ, tiếng Việt.
```
Kết luận **sai / thiếu ý** là lỗi chặn (như `[sai luật/nội dung]`): sửa theo đề xuất (đối chiếu lại nguồn, không chép mù), rồi gọi lại chỉ cho các câu đã sửa. Lưu bảng vào `tham-dinh.md` của bài.

## Biên tập câu chữ — cách gọi
Agent tool, **`model: "sonnet"`**, agent mới. Chạy ở bước 3b, **trước** thẩm định học thuật (thẩm định soát câu sau cùng). Thứ tự ưu tiên khi xung đột: **đúng > đủ > dễ hiểu > hay** — câu "hay" mà mất điều kiện pháp lý thì giữ câu đúng. Brief:
```
Bạn là biên tập viên giáo trình <ngành> cho sinh viên mới học. Không sửa file. Đọc <bài>/brief.md (khán giả), <bài>/noi-dung.md (thuật ngữ đúng), <bài>/kich-ban.md (khẳng định, chữ trên slide, lời nói).
Viết lại từng câu trên slide cho: ngắn (tiêu đề ≤ 12 chữ, câu ≤ 20 chữ) · một ý một câu · chủ ngữ rõ, động từ mạnh · thuật ngữ đúng và nhất quán cả deck (một khái niệm một tên; chữ viết tắt giải nghĩa ở lần đầu) · không ẩn dụ khó hiểu · đọc to nghe tự nhiên.
Không được: đổi nghĩa; bỏ điều kiện, ngoại lệ, chủ thể, mốc thời gian; sửa câu trích nguyên văn (trong ngoặc kép / đánh dấu trích); thêm nội dung ngoài nguồn.
Trả bảng: slide | câu cũ | câu mới | lý do (≤ 8 chữ). Câu đã tốt ghi "giữ". Cuối bảng: danh sách thuật ngữ thống nhất. ≤ 700 chữ.
```
Người dựng áp câu mới vào `kich-ban.md` (ghi `bien-tap.md`), rồi mới gọi thẩm định.

## Người duyệt độc lập — cách gọi
Agent tool, **`model: "opus"`**, agent mới (không fork), chạy sau khi `dung.js` sạch. Brief gửi kèm (không gửi lập luận của người dựng):
```
Bạn là người duyệt độc lập một deck bài giảng. Không sửa file. Đọc:
- <bài>/brief.md (khán giả, mục tiêu), <bài>/noi-dung.md (nội dung + bảng nguồn), <bài>/kich-ban.md
- <bài>/thiet-ke/ (bảng tham chiếu, hệ thống thiết kế, bản đồ nhịp)
- ảnh từng slide: <bài>/<tên>_lop/h-*.jpg (xem hết, bằng mắt) · bảng xem thử asset: <bài>/<tên>_lop/asset.jpg · tờ so sánh với mẫu: <bài>/<tên>_lop/so-sanh.jpg
- chữ từng slide: <bài>/<tên>_lop/deck.html
Việc:
1. Chấm 1–5 kèm lý do: Nội dung (đúng, đủ, có nguồn, không vượt nguồn) · Thiết kế (thứ bậc, khoảng thở, nhất quán, hình đúng sự vật) · Mạch lạc (cả deck, đúng mạch của thể loại) · Dễ hiểu (sinh viên mới học nhìn 3 giây có hiểu ý slide không) · Thẩm mỹ (đặt từng slide cạnh bảng tham chiếu: có lạc tông, đơn điệu, lệch lưới, hình như hình dán không; slide có theo hệ thống thiết kế và bản đồ nhịp không).
2. Liệt kê lỗi theo mức: [sai luật/nội dung] > [khó hiểu] > [thiết kế] > [chữ]; mỗi lỗi: slide, mô tả, đề xuất sửa.
3. Đối chiếu từng con số / điều luật trên slide với bảng nguồn; báo cái không có nguồn.
4. Theo references/soat.md mục 1, nêu slide nào trượt điều kiểm nào.
Trả ≤ 800 chữ, tiếng Việt.
```
Hạng < 4 hoặc có lỗi [sai luật/nội dung] → sửa rồi gọi lại (vòng 2). Sau vòng 2 còn lỗi → báo người dùng thành thật.
