# Vai trò — AI đóng cả đội, người dùng là người quyết

| Vai | Bước | Việc |
|---|---|---|
| Điều phối | mọi bước | Giữ tiến độ, điểm duyệt, `nhat-ky.md`; mỗi bước kết thúc bằng một file |
| Chiến lược + thiết kế bài giảng | 0–1 | Brief, khán giả, mục tiêu Bloom, ý lớn |
| Nghiên cứu + chuyên gia + kiểm chứng | 2 | Nội dung đủ, nguồn, hiệu lực luật, lỗi tài liệu gốc |
| Biên kịch | 3 | Kịch bản: khẳng định, bằng chứng hình, lời nói, giây |
| Chỉ đạo hình ảnh | 4 | 2–3 hướng phong cách + slide mẫu |
| Hoạ sĩ + tìm ảnh | 6 | Asset SVG riêng của bài; ảnh thật có nguồn |
| Thiết kế slide + chuyển động | 5, 7 | Slide HTML tự do → PPTX |
| Soát máy | 7–8 | `scripts/dung.js` |
| **Phản biện kép** | 8 | Hai agent riêng (nội dung / hình), không thấy lập luận của người dựng |
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

## Đọc lạnh và phản biện kép — cách gọi
**Lượt 1: ĐỌC LẠNH** (bắt buộc, trước lượt chấm — 18/11/2026). Agent mới, `model: "opus"`, **chỉ** được xem ảnh `h-*.jpg`, không đọc `kich-ban.md`, `noi-dung.md`, `brief.md` hay lời nói — đúng vị trí người xem không nghe giảng. Brief:
```
Bạn là sinh viên luật năm 3 xem bộ slide này mà không nghe thuyết trình. Không sửa file. Chỉ xem ảnh <bài>/<tên>_lop/h-*.jpg (xem hết, bằng mắt).
Với mỗi slide, ghi một dòng: "N | slide này muốn tôi hiểu điều gì (1 câu của bạn) | chữ / hình nào tôi không hiểu hoặc phải đoán | khối, bảng, đường kẻ nào khó thấy".
Cuối cùng: 3 slide khó hiểu nhất, 3 chỗ trông "như AI làm" nhất (thẻ bo, chip, icon trang trí, hình chung chung), và hình nào đổi sang bài khác vẫn dùng được.
```
Người dựng so cột "slide muốn tôi hiểu" với cột khẳng định trong `kich-ban.md`: lệch ý = lỗi [khó hiểu], sửa slide (không sửa kịch bản cho khớp). Đếm tỉ lệ tóm đúng → hạng **Tự hiểu**.

**Lượt 2: PHẢN BIỆN KÉP** (bài Nhóm 2, 18/11/2026 — một người duyệt chấm mọi thứ đã bỏ sót 10 lỗi nội dung). Sau khi `dung.js` sạch và đã sửa theo đọc lạnh, gọi **hai** agent mới `model: "opus"` **song song**, mỗi người một góc, không gửi lập luận của người dựng:
- **A — Nội dung** (vai giảng viên khó tính): đọc ảnh `h-*.jpg`, lời nói (`data-notes` trong deck), `noi-dung.md` **và tài liệu gốc**. Đối chiếu từng con số, điều khoản, số hiệu, ngày hiệu lực; tìm chỗ **diễn giải vượt văn bản** (áp quy định cho phạm vi rộng hơn, quan hệ nhân quả không nguồn), số tự tính / ví dụ chưa ghi rõ, nhãn dễ hiểu sai. Chấm Đúng · Dễ hiểu · Lập luận 1–5.
- **B — Hình** (vai art director): ảnh `h-*.jpg`, tờ soát `soat-*.jpg` (HTML ↔ PPTX), bảng "Bộ công cụ hình" (`nguon-hinh.md`). Chấm Thẩm mỹ · Nhất quán ngôn ngữ hình · Trình bày dữ liệu · Dễ theo dõi · Bản PPTX 1–5; chỉ slide yếu nhất, công cụ dùng sai chỗ / chưa dùng. **Không chấm theo độ giống mẫu.**
Mỗi người trả ≤ 450 chữ: điểm + ≤ 10 vấn đề xếp theo mức nặng (slide — vấn đề — bằng chứng — cách sửa).

**Người dựng kiểm từng góp ý trước khi sửa** (đối chiếu nguồn, xem ảnh): người duyệt cũng sai — bài Nhóm 2 sửa "15 – 24 %" thành "15 – 20 %" theo góp ý chưa kiểm, phản biện sau bắt lại. Góp ý trái `CLAUDE.md` hoặc lựa chọn người dùng đã chốt → không làm, ghi lý do. Ghi điểm, lỗi, cách xử lý vào `nhat-ky.md`. Còn hạng < 4 hoặc lỗi nội dung → sửa, gọi lại (tối đa 2 vòng), rồi báo người dùng thành thật.
