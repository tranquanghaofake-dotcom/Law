# Viết chương, kiểm nguồn, kiến nghị (pha 5–6) và bảng mã lỗi script

## 1. Nguồn (pha 5)

**`05-nguon/nguyen-van.md`** — chép nguyên văn **mọi đoạn sẽ trích** (điều, khoản, điểm; đoạn bản án; câu trả lời của cơ quan; câu trong tài liệu doanh nghiệp) **và mọi sự kiện sẽ nêu** (số liệu, ngày, kết quả bản án, nội dung phụ lục). Chép đúng chữ, kể cả lỗi chính tả của nguồn. Vế nào chưa đọc trọn thì để `[CẦN KIỂM]` và không trích vế đó. Khuôn mỗi mục:
```
# <Văn bản> (<nơi đọc>, đọc <ngày>; bản chính thức / trang thứ cấp)
Đ<điều> k<khoản> <điểm>: "<nguyên văn>"
(sự kiện) <ngày, số liệu, kết quả> — nguồn: <…>
```
Chạy thử: phản biện độc lập bắt được 4 sự kiện không có trong file này (trần theo % tổng tài sản, "khắc phục trong 30 ngày", "sửa án sơ thẩm"), mà script không thấy vì chúng không nằm trong ngoặc kép.

**Bản dịch**: chỉ đặt trong ngoặc kép bản gốc hoặc bản dịch **chính thức**. Tự dịch hay dịch máy thì ghi "người viết dịch" hoặc "dịch máy, chưa đối chiếu" và không đặt bản dịch trong ngoặc kép như lời trích. Không đọc được ngôn ngữ gốc thì nói rõ là dẫn qua tài liệu thứ cấp.

**Footnote chỉ ghi nguồn đã đọc thật**: đọc qua trang thứ cấp thì ghi trang đó; không ghi "theo VBHN …" khi chưa mở VBHN.

**Kết quả của công cụ tìm kiếm** (đoạn trích, tóm tắt do công cụ tạo) chỉ là manh mối. Số hiệu, ngày, điều khoản thấy trong đó giữ `[CẦN KIỂM]` cho tới khi mở văn bản.

**Dữ liệu bảo mật hoặc ít công bố** (trọng tài, hòa giải, nội bộ doanh nghiệp): không đề xuất đề tài cần tài liệu không tiếp cận được (ví dụ thống kê phán quyết trọng tài). Thay bằng quyết định của tòa án về hủy hoặc công nhận phán quyết, quy tắc tố tụng của trung tâm, điều khoản mẫu, phỏng vấn ẩn danh (người dùng tự làm, ghi rõ thiên lệch mẫu). Không tìm được bản án đúng vấn đề: đổi sang nguồn thực tiễn khác và ghi giới hạn; không khái quát từ bản án gần giống.

## 2. Viết (pha 6)

**Diễn đạt lại đúng phạm vi.** Giữ đúng chủ thể và đối tượng như nguyên văn. Chạy thử: viết "tác phẩm có quyền tác giả" trong khi luật ghi "văn bản và dữ liệu là đối tượng được bảo hộ quyền tác giả và quyền liên quan", tức bỏ mất quyền liên quan. Dẫn chiếu chung ("pháp luật về …") không được viết thành dẫn chiếu tới một điều cụ thể.

**Hiệu lực lệch.** Hai văn bản liên quan có ngày hiệu lực khác nhau thì xét riêng khoảng lệch (chạy thử: điều cấm có hiệu lực 01/3/2026, ngoại lệ 01/4/2026).

**Hạn chế.** Đánh số (i), (ii)… **liên tục trong cả chương**, mỗi ý một dòng bắt đầu bằng "(i)", dưới tiêu đề có chữ "hạn chế" (script dựa vào định dạng này). Mỗi hạn chế nêu cách đọc người viết chọn, nguyên nhân hoặc hệ quả; không dừng ở "chưa xác định".

**Kiểm phản chứng** (trước khi chốt mỗi hạn chế): tìm câu trả lời chính thức cho đúng câu hỏi pháp lý đó (hỏi đáp, công văn, án lệ, giải đáp của TANDTC, học giả trái chiều, bản dự thảo của chính điều luật). Tìm thuật ngữ then chốt trong **toàn văn** luật nền và văn bản hướng dẫn: mọi chỗ khác dùng cùng thuật ngữ là phản chứng tiềm năng (chạy thử: khoản 2 Điều 9 Luật 91/2025 định nghĩa "biết rõ", cả 3 vai phản biện bỏ sót). Trước khi viết "chưa có hướng dẫn", đọc mọi văn bản quy định chi tiết đã có trong `van-ban.md`. Không thấy gì thì ghi "chưa tìm thấy … (tìm ngày …)". Có thì viết vào bài, đánh giá giá trị pháp lý, rồi mới kết luận.

**Kiến nghị — 6 yêu cầu (a)–(f):** (a) gắn 1 hạn chế đã chứng minh; (b) sửa điều, khoản nào của văn bản nào; (c) câu chữ cụ thể nếu được; (d) tác động và phản biện; (e) **thẩm quyền**: luật ủy quyền cho văn bản đó quy định gì (tìm câu "… quy định chi tiết …"); nghị định không được định nghĩa lại, thu hẹp hay mở ngoại lệ cho điều kiện của luật; (f) **điều kiện thi hành**: ai làm, quy trình nào, rủi ro, phương án dự phòng. Phải **đọc toàn văn văn bản định sửa** trước (chạy thử: kiến nghị bổ sung điều đã có sẵn ở khoản 1 Điều 43 NĐ 152/2026). Không kiến nghị lặp nghĩa vụ đã có trong luật. Kiến nghị trùng hướng công trình trước thì nói rõ khác ở đâu. Lập bảng phủ (`de-cuong-mau.md` mục C2); hạn chế nào không có kiến nghị thì ghi "Hạn chế (x) chưa có kiến nghị vì …".

**Câu chữ đề xuất.** Bản nháp: đặt trong ngoặc kép trên cùng dòng với `[ĐỀ XUẤT]`. Bản nộp: đổi thành dòng `> Đề xuất: "…"`. Cả hai dạng đều được script bỏ qua khi đối chiếu nguyên văn; dạng thứ hai không còn nhãn nên qua được `--nop`.

## 3. Bảng mã lỗi của `scripts/kiem_tra_ban_thao.py`

| Mã | Mức | Nghĩa → cách sửa |
|---|---|---|
| `nhan-con-sot` | NHẸ / NẶNG (CẦN KIỂM, TODO) / CHẶN khi `--nop` | còn nhãn nghiên cứu → kiểm xong rồi gỡ |
| `ghi-chu-ngoac-vuong` | NẶNG / CHẶN khi `--nop` | ghi chú tự đặt "[…]" → dùng nhãn chuẩn (`[CẦN KIỂM: …]`) hoặc xóa |
| `footnote-thieu` / `footnote-thua` | CHẶN / NẶNG | dùng `[^n]` mà không định nghĩa, hoặc ngược lại |
| `thieu-so-hieu` | NẶNG | "Nghị định…", "Thông tư…" không kèm số hiệu trong câu |
| `lo-danh-tinh` | CHẶN | với `--an-danh`: tên người, trường xuất hiện ngoài danh mục tài liệu tham khảo; có Lời cảm ơn |
| `tham-chieu-hong` | NẶNG | nhắc "Phụ lục N" mà không có tiêu đề tương ứng → truyền cả file phụ lục |
| `han-che-chua-phan-chung` | NẶNG | hạn chế không có footnote, "(xem x.y)", hoặc "chưa tìm thấy …" |
| `han-che-chi-chan-doan` | NHẸ | hạn chế chỉ nói "chưa xác định/chưa rõ" |
| `kien-nghi-thieu-han-che` | NẶNG | file kiến nghị không nhắc "hạn chế (x)" cho một hạn chế ở file khác |
| `khang-dinh-so-sanh-khong-nguon` | NẶNG | "lần đầu", "duy nhất", "chưa từng", "là … đầu tiên" không có footnote |
| `trich-ngoai-nguyen-van` | NẶNG | đoạn trong ngoặc kép ≥ 25 ký tự không có trong `nguyen-van.md` |
| `van-ban-chua-kiem-hieu-luc` | NẶNG | số hiệu N/YYYY/… không có dòng trong `van-ban.md` (bỏ qua số bản án, văn bản nội bộ doanh nghiệp) |
| `van-sao-rong` / `van-phong-ai` | NHẸ | cụm sáo; mở đoạn bằng câu sáo, kết đoạn lặp ý, câu dài đều nhau |
| `ngan-sach-trang` | NHẸ | với `--trang N`: lệch quá 20% so với đề cương |

Mã thoát: **1 khi còn CHẶN hoặc NẶNG**, 0 khi chỉ còn NHẸ. Lỗi NHẸ không bắt buộc sửa, nhưng mỗi lỗi giữ lại phải có lý do.
