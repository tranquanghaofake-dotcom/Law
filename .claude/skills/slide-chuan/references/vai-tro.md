# Vai trò — AI đóng cả đội, người dùng là người quyết

| Vai | Bước | Việc |
|---|---|---|
| Điều phối | mọi bước | Giữ tiến độ, điểm duyệt; mỗi bước kết thúc bằng một file; `nhat-ky.md` chỉ ghi **quyết định** (báo cáo các vòng tự lưu ở `duyet/`) |
| Chiến lược + thiết kế bài giảng | 0–1 | Brief, khán giả, mục tiêu Bloom, ý lớn |
| Nghiên cứu + chuyên gia + kiểm chứng | 2 | Nội dung đủ, nguồn, hiệu lực luật, lỗi tài liệu gốc |
| Biên kịch | 3 | Kịch bản: khẳng định, bằng chứng hình, hiện theo, lời nói, giây — **nguồn duy nhất của chữ** |
| **Biên tập câu chữ** | 3b | Agent riêng (`sonnet`): câu trên slide ngắn, rõ, thuật ngữ nhất quán — không đổi nghĩa, không đụng câu trích |
| **Thẩm định học thuật** | 3b, 8 | Agent riêng (`opus`), vai giảng viên chuyên ngành: từng câu đúng, đủ ý, trích nguyên văn, không vượt nguồn, hình nói đúng nội dung — trên kịch bản (3b) và trên chữ thật của slide (8) |
| Chỉ đạo hình ảnh | 4 | 2–3 hướng phong cách + slide mẫu |
| Hoạ sĩ + tìm ảnh | 6 | Asset SVG riêng của bài; ảnh thật có nguồn, đã soi dấu nước / giấy phép |
| Thiết kế slide + chuyển động | 5, 7 | Slide HTML tự do → PPTX |
| Soát máy | 7–8 | `scripts/dung.js` (vòng sửa: `--nhanh`) |
| **Người duyệt độc lập** | 5, 8 | Agent riêng (`opus`), không thấy lập luận của người dựng |
| **Cố vấn** | điểm duyệt | Bản ghi lựa chọn |
| Huấn luyện thuyết trình | 9 | Lời nói, đo giờ (`chu.md` ước thời lượng), slide có thể cắt |
| Biên tập + lưu trữ | 10 | Chính tả, bàn giao, rút kinh nghiệm |

## Giao việc cho agent — luôn bằng `scripts/brief.js`, không viết tay
```
node scripts/brief.js <bài> duyet       [--ten=<deck>]                        # người duyệt độc lập, vòng đầy đủ
node scripts/brief.js <bài> duyet-lai   [--ten=<deck>] --loi=<file> --slide=…  # soát lại sau vòng sửa
node scripts/brief.js <bài> tham-dinh   --lan=1|2 [--luat=<file,…>] [--goc=<tài liệu gốc>]
node scripts/brief.js <bài> bien-tap
```
Lệnh in hướng dẫn từ mẫu cố định `references/brief/<vai>.md` (đủ 8 hạng rubric, ba mức lỗi, đường dẫn đúng của bài). **Dán nguyên văn** vào prompt của Agent tool: agent mới, không fork, `model` theo bảng trên. Không thêm lập luận của người dựng; vòng duyệt lại chỉ gửi danh sách lỗi (bằng `--loi`). Báo cáo agent tự ghi `<bài>/duyet/NN-<vai>.md` — đó là nhật ký các vòng. Muốn đổi tiêu chí: sửa mẫu trong skill, không sửa tay trong prompt.

## Mức lỗi và luật dừng (chung cho duyệt và thẩm định — `soat.md` mục 4)
- **[CHẶN]**: sai luật / nội dung · thiếu ý pháp lý (điều kiện, ngoại lệ, chủ thể, thời hạn) · hình sai nghĩa · chữ hoặc nền mất ở PPTX · chữ không đọc được · ảnh có dấu nước / không rõ giấy phép.
- **[NÊN]**: căn chỉnh, nhịp, khoảng thở, ngắt dòng xấu, nhất quán chưa trọn. **[GHI NHẬN]**: gu, ý nâng thêm.
- **Giao** khi 0 lỗi CHẶN (cả thẩm định lẫn duyệt) và mọi hạng rubric ≥ 4. Lỗi NÊN sửa trong cùng vòng nếu rẻ; GHI NHẬN chép vào `nhat-ky.md`, không mở vòng mới vì nó.
- **Số vòng**: tối đa 2 vòng đầy đủ (`duyet` + `tham-dinh --lan=2`) + 1 vòng `duyet-lai` có phạm vi. Còn lỗi CHẶN sau đó → dừng, báo người dùng danh sách và lựa chọn — không mở vòng thứ tư tự ý.
- **Một vòng = một lần sửa**: thẩm định (chữ) và duyệt (hình) chạy song song trên CÙNG một bản dựng → gộp hai danh sách → sửa một lần → dựng một lần. Xung đột (thẩm định thêm điều kiện, dễ đọc đòi bớt chữ): ưu tiên **đúng > đủ > dễ đọc > đẹp** — không cắt điều kiện pháp lý để qua giới hạn chữ; tách slide hoặc cho hình chở bớt.
- **Lỗi người bắt được mà máy không bắt** → bước 10: thêm máy kiểm + test (vd. `kiem_html` mục 6–8, `trich_nguyen_van.js`), hoặc thêm dòng vào mẫu brief.

## Thẩm định học thuật
Vai đóng bằng agent: **không thay được chuyên gia thật** — giá trị là một lượt soát độc lập, có văn bản gốc trong tay và bảng đối chiếu từng câu. Câu cần chuyên môn thật (đáp án gây tranh cãi, quan điểm học thuật) → ghi "Điều chưa chắc" trong `noi-dung.md`, hỏi người dùng / giảng viên; không đoán.
Chạy **hai lần**: (1) bước 3b, trên `kich-ban.md` đã qua biên tập; (2) bước 8, trên `<tên>_lop/chu.md` — chữ thật trên slide + mô tả hình + lời nói, `dung.js` ghi ra mỗi lần dựng. Lần 2 không bỏ được: lỗi hay sinh ra lúc rút gọn chữ để đặt lên slide (Chương 3: kịch bản ghi "15 ngày khi không thoả thuận", slide thành "15 ngày tối đa"). Sửa theo đề xuất phải đối chiếu lại nguồn, không chép mù; sửa xong chạy lại chỉ cho câu đã sửa.

## Biên tập câu chữ
Chạy ở bước 3b, **trước** thẩm định (thẩm định soát câu sau cùng). Người dựng áp câu mới vào `kich-ban.md` (bảng đối chiếu nằm trong `duyet/`), rồi mới gọi thẩm định.

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
