---
name: khoa-luan-luat
description: Use when a Vietnamese law student brings a research topic (or only a vague area of law) and wants to build a tiểu luận, khóa luận tốt nghiệp, chuyên đề tốt nghiệp, or đề tài nghiên cứu khoa học sinh viên (NCKH, báo cáo tổng kết đề tài) — including dự thi Euréka, Giải thưởng KHCN sinh viên Bộ GD&ĐT, or cấp trường/cấp tỉnh — at any stage: chọn/thẩm định đề tài, tổng quan tình hình nghiên cứu, đề cương, phương pháp nghiên cứu luật học, viết khóa luận, kiến nghị hoàn thiện pháp luật, phản biện, bảo vệ, slide bảo vệ, or fixing trích dẫn/footnote/tài liệu tham khảo/đạo văn. Also matches unaccented requests (khoa luan, tieu luan, nckh, de cuong).
---

# Khóa luận · NCKH luật — từ đề tài đến bảo vệ

## Tổng quan

Skill này đưa một đề tài luật từ con số 0 đến bản hoàn chỉnh, qua 9 pha có **cổng kiểm** (gate). Nguyên tắc lõi: **sự thật trước văn hay**. Hội đồng chấm tính mới, phương pháp, kết quả và kiến nghị có căn cứ (xem `references/tieu-chi-cham.md`); không cho điểm câu chữ trơn tru che một lập luận rỗng.

Vai trò: người cùng nghiên cứu và phản biện, không phải máy viết hộ. **Người dùng giữ quyền quyết định với Ý TƯỞNG (câu hỏi, luận điểm, kiến nghị) và DỮ LIỆU (khảo sát, phỏng vấn, bản án đã chọn).** Claude đề xuất, tra cứu, dựng khung, viết nháp, phản biện; người dùng duyệt ở mỗi cổng.

## Khi nào dùng / không dùng

Dùng: có đề tài hoặc một mảng luật muốn nghiên cứu; cần đề cương; viết hoặc sửa chương; tổng quan tình hình nghiên cứu; kiến nghị; chuẩn bị bảo vệ; chuẩn hóa trích dẫn.

Không dùng: giải đề thi, bài tập tình huống, nhận định đúng/sai (dùng skill `vn-legal-exam-analysis` nếu có); soạn hợp đồng, đơn từ; tư vấn pháp lý cho vụ việc thật.

## Luật cứng (không có ngoại lệ)

1. **Không bịa nguồn.** Không có số hiệu văn bản, điều/khoản, số bản án, án lệ, tác giả, tên bài, số tạp chí, trang, DOI, số liệu mà chưa tự thấy trong nguồn. Không chắc thì ghi `[CẦN KIỂM: …]`, không đoán. Đoạn trích, tóm tắt do công cụ tìm kiếm tạo ra chỉ là manh mối, chưa phải "đã thấy trong nguồn".
2. **Gắn nhãn mọi thông tin** trong ghi chú nghiên cứu và bản nháp gửi người dùng:
   `[NGUYÊN VĂN]` trích đúng từ nguồn đã mở · `[NGUỒN NÓI]` diễn đạt lại ý của nguồn · `[SUY LUẬN]` lập luận của tác giả · `[ĐỀ XUẤT]` ý mở rộng, câu chữ kiến nghị · `[NGƯỜI DÙNG]` do người dùng cung cấp hoặc xác nhận · `[CẦN KIỂM: …]` chưa xác minh (kể cả ý dựa vào kinh nghiệm thực tiễn).
   Trong bản nộp cuối, nhãn được thay bằng footnote (với nguồn) hoặc lời văn của tác giả (với suy luận). Gỡ nhãn chỉ khi nguồn đã kiểm.
3. **Kiểm hiệu lực** mọi văn bản quy phạm pháp luật (VBQPPL) trước khi dựa vào: số hiệu, ngày ban hành, ngày hiệu lực, tình trạng (còn / hết / hết một phần / chưa có hiệu lực), văn bản sửa đổi hoặc thay thế. Phân biệt rõ: luật hiện hành / đã hết hiệu lực / dự thảo / quan điểm học thuật.
4. **Không bịa dữ liệu thực nghiệm.** Khảo sát, phỏng vấn, thống kê bản án chỉ được viết từ dữ liệu người dùng thật sự thu thập. Chưa có dữ liệu thì viết phương án thu thập, không viết kết quả.
5. **Liêm chính và AI:** giữ `nhat-ky-ai.md` (xem `references/liem-chinh-ai.md`). Nhắc người dùng kiểm quy định về dùng AI của trường hoặc cuộc thi, và tự viết lại bằng giọng của mình phần lập luận cốt lõi.

## Bảng loại sản phẩm — đọc trước pha 0

| | Tiểu luận môn học | Khóa luận tốt nghiệp | NCKH sinh viên dự giải |
|---|---|---|---|
| Độ dài thường gặp | 15–25 trang | 40–70 trang (ĐH Luật TP.HCM Khoa LTM: 40–50) | theo thể lệ; tóm tắt Euréka ≤ 1 trang A4 |
| Tên tác giả trong bài | có | có, có lời cam đoan | **ẩn danh**: không tên, không trường, không lời cảm ơn |
| Trọng tâm chấm | đúng, đủ, mạch lạc | lý luận + thực trạng + kiến nghị | Bộ GD&ĐT: tổng quan 10 · nội dung 20 · phương pháp 15 · kết quả 40 · hình thức 5 · công bố 10; Euréka: theo thể lệ năm (`tieu-chi-cham.md`) |
| Các pha chạy | 0, 1, 2–3 rút gọn (8 nguồn, 1 câu hỏi), 4, 5 tối thiểu, 6, 8; pha 7 một vai | 0–8 đủ | 0–8 đủ, pha 7 chấm theo thể lệ giải |

Luận văn thạc sĩ: dùng quy trình của khóa luận, ngưỡng theo quy định của trường. Đề tài nhóm: ghi phân vai từng thành viên trong `00-ho-so.md`.

⚠ **Khóa luận, đồ án tốt nghiệp không được gửi xét Giải thưởng KHCN sinh viên của Bộ GD&ĐT** (TT 45/2020/TT-BGDĐT, Điều 4, khoản 2, điểm đ). Muốn dự giải Bộ thì làm thành đề tài NCKH riêng. Xem chi tiết ở `references/tieu-chi-cham.md`.

## Thư mục dự án

Tạo `khoa-luan/<slug-de-tai>/` trong thư mục làm việc (hoặc nơi người dùng chỉ định). Ghi file theo từng pha; không giữ toàn bộ trong chat.

```
00-ho-so.md        loại sản phẩm, trường, hạn, GVHD, quy định trình bày, NHẬT KÝ PHIÊN (cuối file)
01-tham-dinh.md    3 phương án tên đề tài + bảng chấm + quyết định của người dùng
02-tong-quan.md    chiến lược tìm + ma trận tài liệu + khoảng trống nghiên cứu
03-khung.md        câu hỏi, giả thuyết, khung lý thuyết, phương pháp ↔ câu hỏi
04-de-cuong.md     đề cương chi tiết + phân bổ trang
05-nguon/          so-nguon.md (sổ nguồn), van-ban.md (bảng hiệu lực), nguyen-van.md (trích nguyên văn), ban-an.md
06-chuong-*.md     bản nháp từng chương
07-phan-bien.md    phiếu tự chấm + danh sách sửa; 07-phan-bien-doc-lap.md nếu chạy subagent
08-hoan-thien.md   checklist nộp + câu hỏi bảo vệ
09-giai-trinh.md   bảng giải trình góp ý GVHD, phản biện, hội đồng
phu-luc-N.md       phụ lục (bảng hỏi, bảng mã hóa, dữ liệu)
nhat-ky-ai.md
```

Mở lại phiên: đọc `00-ho-so.md` (phần NHẬT KÝ PHIÊN) trước, làm tiếp từ pha chưa qua cổng.

## Người dùng đã có bản nháp
Chỉ cần sửa trích dẫn, footnote, danh mục: đọc `references/trinh-bay-trich-dan.md`, chạy script, sửa; không dựng lại hồ sơ. Còn lại:
Không viết lại ngay. (1) Đọc toàn bộ (file .docx thì đọc bằng skill docx nếu có, giữ nguyên bản gốc). (2) Dựng lại `00-ho-so.md`, `05-nguon/van-ban.md`, `05-nguon/nguyen-van.md` từ chính bản nháp. (3) Chạy `kiem_tra_ban_thao.py` và lập **bảng luận điểm → bằng chứng** (pha 7). (4) Xác định bản nháp đã qua cổng pha nào, cổng nào còn hở; báo người dùng theo thứ tự ảnh hưởng lên điểm. (5) Người dùng chọn phạm vi sửa rồi mới sửa, sửa tại chỗ.

## Quy trình 9 pha

Mỗi pha: **Làm** → **Cổng** (điều kiện cụ thể để qua). Không qua cổng thì không sang pha sau. Mọi cổng cần người dùng duyệt, trừ khi người dùng nói rõ "tự chạy hết".

### Pha 0 — Tiếp nhận
Lượt đầu **chỉ hỏi**, gom một lần, đánh số 7 mục: (1) loại sản phẩm; (2) trường, khoa, file quy định trình bày; (3) hạn nộp; (4) GVHD và định hướng; (5) cuộc thi và năm (tìm thể lệ đúng năm; chưa có thì dùng bản gần nhất, ghi "mặc định: thể lệ năm …"); (6) đã có gì (đọc gì, dữ liệu, nghề định hướng; có định dùng chung đề tài cho khóa luận không, xem `references/liem-chinh-ai.md`); (7) quy định của trường hoặc cuộc thi về dùng AI. Có câu trả lời rồi mới tạo `00-ho-so.md`; mục chưa biết ghi "mặc định: …" (`references/trinh-bay-trich-dan.md`).
Mốc thời gian: giải Bộ GD&ĐT tính ngược từ hạn 30/6, phải công bố hoặc ứng dụng **≥ 01 năm** trước ngày nộp; Euréka theo thể lệ năm đó (`references/tieu-chi-cham.md`).
Cổng: `00-ho-so.md` đủ 7 mục, có mục **ĐANG CHẶN** (khuôn `de-cuong-mau.md` mục F) giữ suốt dự án.

### Pha 1 — Thẩm định và mài đề tài
Làm: 3 phương án (hẹp / vừa / tham vọng), chấm 1–5 mỗi tiêu chí: cấp thiết; tính mới; khả thi nguồn (bản án, số liệu, tài liệu đọc được; **không dựa vào tài liệu bảo mật**); vừa độ dài; hợp nghề; thêm "bền trước thay đổi luật" nếu có dự thảo. Phương án có tiêu chí nào dưới 3 thì nói rõ rủi ro. Tên đề tài nêu đối tượng + phạm vi + góc tiếp cận.
**Kiểm đường ống lập pháp**: văn bản nền đang ở giai đoạn nào: *đề xuất xây dựng* / *có trong chương trình* / *đã trình Quốc hội* (nguồn tra: `references/nguon-tra-cuu.md`). Ghi giai đoạn, ngày kiểm; hai nguồn nói khác nhau thì ghi cả hai. **Chỉ chặn cứng khi đã trình**: khi đó không viết phân tích quy định trước kết quả biểu quyết, viết sẵn kế hoạch A (thông qua) / B (không), ưu tiên câu hỏi bền như chuyển tiếp, hồi tố. Giai đoạn đề xuất hoặc có trong chương trình: chỉ ghi rủi ro. Dự thảo luôn ghi "dự thảo ngày …". Tra một lần không thấy chưa phải "không có".
**Tìm ngách**: theo `references/tim-ngach.md`; ưu tiên 4 nguồn tín hiệu hợp với mảng luật, các nguồn còn lại để pha 2; áp phép thử 4 điều kiện cho **phương án người dùng chọn**. Mức tra ở pha 1: tên bài, nơi đăng, tóm tắt là đủ; toàn văn để pha 2. Pha 2 hoặc pha 5 lộ ngách tốt hơn thì quay lại pha 1.
Cổng: người dùng chọn 1 phương án; ≥ 3 công trình gần nhất có tên, nơi đăng (đã thấy, không chỉ qua tóm tắt của công cụ) và 1 câu "đề tài khác các công trình đó ở …".

### Pha 2 — Tổng quan tình hình nghiên cứu
Làm: chiến lược tìm (từ khóa Việt, Anh; `references/nguon-tra-cuu.md`); đọc 3 lượt; ma trận tài liệu theo khuôn `de-cuong-mau.md` mục C (có cột kiến nghị đã đưa ra, đã được luật hóa chưa, ngày nhận/ngày đăng). Viết tổng quan **theo chủ đề**, kết bằng khoảng trống.
Cổng: ≥ 15 nguồn, trong đó ≥ 5 học thuật (tiểu luận: ≥ 8 và ≥ 3); bài chỉ thấy tiêu đề hoặc tóm tắt không tính là học thuật; khoảng trống nêu trong 2–3 câu, đã kiểm trùng kiến nghị và kiểm luật hóa theo ngày nhận bài. Thiếu vì cần thư viện hoặc đăng nhập thì **báo người dùng ngay** danh sách bài cần lấy.

### Pha 3 — Câu hỏi, khung lý thuyết, phương pháp
Làm: 1 câu hỏi chính + 2–4 câu hỏi phụ (tiểu luận: 1 câu hỏi); khung lý thuyết làm thước đo; phương pháp theo `references/phuong-phap-luat-hoc.md`, mỗi phương pháp gắn câu hỏi và chương.
Cổng: bảng "câu hỏi → phương pháp → nguồn dữ liệu → chương".

### Pha 4 — Đề cương chi tiết
Làm: theo `references/de-cuong-mau.md`; mở đầu đủ 6 mục; ≥ 2 chương, mỗi chương ≥ 2 mục, có kết luận chương; phân bổ trang.
Cổng: mỗi mục có 1 dòng "trả lời câu hỏi nào, dùng nguồn nào"; người dùng hoặc GVHD duyệt.

### Pha 5 — Thu thập và kiểm nguồn
Làm: `05-nguon/van-ban.md` (bảng hiệu lực), `05-nguon/nguyen-van.md` (nguyên văn mọi đoạn sẽ trích và mọi sự kiện sẽ nêu), `ban-an.md`; mỗi nguồn ghi giá trị pháp lý (`references/nguon-tra-cuu.md`). Quy tắc chi tiết (bản dịch, trang thứ cấp, dữ liệu bảo mật, kết quả công cụ tìm kiếm): `references/viet-chuong.md` mục 1.
Cổng: mọi VBQPPL trong đề cương có dòng trong bảng hiệu lực; mỗi bất cập dự định nêu có ≥ 1 bằng chứng.

### Pha 6 — Viết từng chương
Làm: một chương một lần, 2 bước: (a) **dàn ý luận điểm**, mỗi câu ghi bằng chứng sẽ dùng, người dùng duyệt ("tiếp tục" ở bước này chỉ là duyệt dàn ý); (b) viết văn. Chuỗi mỗi luận điểm: **Vấn đề → Quy định (nguyên văn) → Quan điểm khoa học → Thực tiễn → Đánh giá theo khung lý thuyết → (nếu có) Kiến nghị.** Chương thực trạng chia ưu điểm / hạn chế / nguyên nhân. Bắt buộc theo `references/viet-chuong.md` mục 2: diễn đạt đúng phạm vi, xét hiệu lực lệch, định dạng hạn chế, **kiểm phản chứng**, kiến nghị đủ 6 yêu cầu (a)–(f) kèm bảng phủ, cách ghi câu chữ đề xuất.
Cổng mỗi chương: `python3 scripts/kiem_tra_ban_thao.py <chương> <phụ lục> <chương thực trạng nếu đang viết kiến nghị> --nguyen-van 05-nguon/nguyen-van.md --van-ban 05-nguon/van-ban.md [--trang N]` thoát mã 0 (không còn CHẶN, NẶNG; bảng mã lỗi ở `viet-chuong.md` mục 3); người dùng duyệt.

### Pha 7 — Phản biện giả lập hội đồng
Làm: 3 vai đọc toàn bài: (1) phản biện học thuật; (2) người làm thực tiễn; (3) thư ký chấm theo **đúng khung** của cuộc thi hoặc trường (`references/tieu-chi-cham.md`). Trước khi chấm, lập bảng luận điểm → bằng chứng; mỗi góp ý đủ 5 phần và tiêu chí đóng (`references/phan-bien-hoi-dong.md`). Người dùng cho phép thì chạy mỗi vai bằng một subagent cách ly theo khuôn brief trong file đó; không thì tự chấm, phần chưa viết chấm 0 và ghi "trần nếu hoàn thành". Tự chấm thường cao hơn điểm độc lập 15–30 điểm (`vi-du/README.md`).
Cổng: mọi lỗi CHẶN đã sửa; mỗi tiêu chí ≥ 70% điểm tối đa, **trừ tiêu chí công bố** (chấm riêng theo tiến độ công bố); dự giải Bộ: tổng **≥ 85 theo điểm độc lập** (TT 45/2020, Điều 13, khoản 3); khóa luận: theo phiếu của trường. Không đạt thì người dùng xác nhận chấp nhận rủi ro.

### Pha 8 — Hoàn thiện, nộp, bảo vệ
Làm: chuẩn hóa footnote, danh mục (`references/trinh-bay-trich-dan.md`); câu chữ đề xuất đổi sang dạng `> Đề xuất: "…"`; kiểm hình thức, ẩn danh; tóm tắt; 15–20 câu hỏi bảo vệ; khung slide (skill `slide-chuan` nếu có). Xuất Word bằng skill docx nếu có, mở lại kiểm footnote, mục lục, số trang. Góp ý của GVHD, phản biện, hội đồng: bảng giải trình `09-giai-trinh.md` (khuôn trong `phan-bien-hoi-dong.md`), không bỏ góp ý nào.
Cổng: `kiem_tra_ban_thao.py <mọi file> --nop [--an-danh "<tên>,<trường>"] --nguyen-van … --van-ban …` thoát mã 0, mỗi lỗi NHẸ còn lại có lý do; checklist nộp trong `08-hoan-thien.md` đủ; `nhat-ky-ai.md` cập nhật.

## Tra nhanh

| Cần | Đọc |
|---|---|
| Thang điểm Euréka, Bộ GD&ĐT, cấp trường; ẩn danh | `references/tieu-chi-cham.md` |
| Tìm ngách: 11 nguồn tín hiệu, khoảng trống thời gian, phép thử 4 điều kiện | `references/tim-ngach.md` |
| Chọn và viết phương pháp nghiên cứu luật học | `references/phuong-phap-luat-hoc.md` |
| Tìm văn bản, bản án, án lệ, tạp chí, tài liệu nước ngoài | `references/nguon-tra-cuu.md` |
| Khung phần mở đầu, đề cương, ma trận tài liệu | `references/de-cuong-mau.md` |
| Footnote, "tlđd", danh mục VBQPPL, hình thức trang | `references/trinh-bay-trich-dan.md` |
| Lỗi hội đồng hay bắt, câu hỏi bảo vệ | `references/phan-bien-hoi-dong.md` |
| Nhật ký AI, quy tắc diễn đạt lại, đạo văn | `references/liem-chinh-ai.md` |
| Viết chương, kiểm nguồn, kiến nghị (a)–(f), bảng mã lỗi script | `references/viet-chuong.md` |
| Kiểm bản nháp tự động | `python3 scripts/kiem_tra_ban_thao.py --help` |
| Ví dụ đã chạy (6 đề, điểm tự chấm và độc lập, bài học) | `vi-du/README.md` |

## Công cụ, nếu phiên có

- Tìm web (WebSearch, Parallel/Firecrawl search): tìm công trình gần nhất và văn bản. Ưu tiên vbpl.vn, cổng toaan.gov.vn, tạp chí có ISSN.
- `Legal_Data_Hunter` MCP: luật và án nước ngoài cho phần so sánh (EU, Mỹ, Pháp, Singapore…).
- Firecrawl research, Google Scholar, SSRN: bài báo tiếng Anh.
- Skill `docx`: xuất file Word đúng định dạng ở pha 8.

Không có công cụ tìm kiếm thì nói rõ: mọi nguồn ở pha 2 và pha 5 là `[CẦN KIỂM]`, người dùng phải tự tra.

## Lỗi thường gặp chưa có cổng chặn

| Lỗi | Chặn bằng |
|---|---|
| Tổng quan là danh sách "A (2019) nghiên cứu…, B (2020)…" | viết theo chủ đề, kết bằng khoảng trống |
| Câu chữ trơn tru nhưng lập luận rỗng | vai (1) pha 7 chấm lập luận, bỏ qua văn phong |
| Coi hỏi đáp, công văn như luật; gán lời người hỏi thành lời cơ quan | cột giá trị pháp lý trong sổ nguồn (`nguon-tra-cuu.md`) |
| Chép lại dẫn chiếu sai của nguồn khác | tự mở văn bản được dẫn rồi mới dùng |
| So sánh với nước "quen" chứ không phải nước có cơ chế tương đương | chọn hệ thống theo câu hỏi (`phuong-phap-luat-hoc.md`) |
| Bù điểm thiếu dữ liệu hoặc chưa công bố bằng văn | ghi rõ phần chỉ người làm đề tài làm được |
