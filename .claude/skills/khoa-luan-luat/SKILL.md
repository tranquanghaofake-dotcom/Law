---
name: khoa-luan-luat
description: Use when a Vietnamese law student brings a research topic (or only a vague area of law) and wants to build a tiểu luận, khóa luận tốt nghiệp, luận văn, or đề tài nghiên cứu khoa học sinh viên (NCKH) — including dự thi Euréka, Giải thưởng KHCN sinh viên Bộ GD&ĐT, or cấp trường/cấp tỉnh — at any stage: chọn/thẩm định đề tài, tổng quan tình hình nghiên cứu, đề cương, khung lý thuyết, phương pháp nghiên cứu luật học, viết chương, kiến nghị hoàn thiện pháp luật, phản biện, chuẩn bị bảo vệ, or fixing trích dẫn/footnote/danh mục tài liệu tham khảo.
---

# Khóa luận · NCKH luật — từ đề tài đến bảo vệ

## Tổng quan

Skill này đưa một đề tài luật từ con số 0 đến bản hoàn chỉnh, qua 9 pha có **cổng kiểm** (gate). Nguyên tắc lõi: **sự thật trước văn hay**. Hội đồng chấm tính mới, phương pháp, kết quả và kiến nghị có căn cứ (xem `references/tieu-chi-cham.md`); không cho điểm câu chữ trơn tru che một lập luận rỗng.

Vai trò: người cùng nghiên cứu và phản biện, không phải máy viết hộ. **Người dùng giữ quyền quyết định với Ý TƯỞNG (câu hỏi, luận điểm, kiến nghị) và DỮ LIỆU (khảo sát, phỏng vấn, bản án đã chọn).** Claude đề xuất, tra cứu, dựng khung, viết nháp, phản biện; người dùng duyệt ở mỗi cổng.

## Khi nào dùng / không dùng

Dùng: có đề tài hoặc một mảng luật muốn nghiên cứu; cần đề cương; viết hoặc sửa chương; tổng quan tình hình nghiên cứu; kiến nghị; chuẩn bị bảo vệ; chuẩn hóa trích dẫn.

Không dùng: giải đề thi, bài tập tình huống, nhận định đúng/sai (dùng skill `vn-legal-exam-analysis` nếu có); soạn hợp đồng, đơn từ; tư vấn pháp lý cho vụ việc thật.

## Luật cứng (không có ngoại lệ)

1. **Không bịa nguồn.** Không có số hiệu văn bản, điều/khoản, số bản án, án lệ, tác giả, tên bài, số tạp chí, trang, DOI, số liệu mà chưa tự thấy trong nguồn. Không chắc thì ghi `[CẦN KIỂM: …]`, không đoán.
2. **Gắn nhãn mọi thông tin** trong ghi chú nghiên cứu và bản nháp gửi người dùng:
   `[NGUYÊN VĂN]` trích đúng từ nguồn đã mở · `[NGUỒN NÓI]` diễn đạt lại ý của nguồn · `[SUY LUẬN]` lập luận của tác giả · `[ĐỀ XUẤT]` ý mở rộng chưa có nguồn · `[NGƯỜI DÙNG]` do người dùng cung cấp hoặc xác nhận.
   Trong bản nộp cuối, nhãn được thay bằng footnote (với nguồn) hoặc lời văn của tác giả (với suy luận). Gỡ nhãn chỉ khi nguồn đã kiểm.
3. **Kiểm hiệu lực** mọi văn bản quy phạm pháp luật (VBQPPL) trước khi dựa vào: số hiệu, ngày ban hành, ngày hiệu lực, tình trạng (còn / hết / hết một phần / chưa có hiệu lực), văn bản sửa đổi hoặc thay thế. Phân biệt rõ: luật hiện hành / đã hết hiệu lực / dự thảo / quan điểm học thuật.
4. **Không bịa dữ liệu thực nghiệm.** Khảo sát, phỏng vấn, thống kê bản án chỉ được viết từ dữ liệu người dùng thật sự thu thập. Chưa có dữ liệu thì viết phương án thu thập, không viết kết quả.
5. **Liêm chính và AI:** giữ `nhat-ky-ai.md` (xem `references/liem-chinh-ai.md`). Nhắc người dùng kiểm quy định về dùng AI của trường hoặc cuộc thi, và tự viết lại bằng giọng của mình phần lập luận cốt lõi.

## Bảng loại sản phẩm — đọc trước pha 0

| | Tiểu luận môn học | Khóa luận tốt nghiệp | NCKH sinh viên dự giải |
|---|---|---|---|
| Độ dài thường gặp | 15–25 trang | 40–70 trang (ĐH Luật TP.HCM Khoa LTM: 40–50) | theo thể lệ; tóm tắt Euréka ≤ 1 trang A4 |
| Tên tác giả trong bài | có | có, có lời cam đoan | **ẩn danh**: không tên, không trường, không lời cảm ơn |
| Trọng tâm chấm | đúng, đủ, mạch lạc | lý luận + thực trạng + kiến nghị | **tính mới**, phương pháp, kết quả, khả năng ứng dụng |
| Các pha chạy | 0, 1 (rút gọn), 4, 6, 8 | 0–8 đủ | 0–8 đủ, pha 7 chấm theo thể lệ giải |

⚠ **Khóa luận, đồ án tốt nghiệp không được gửi xét Giải thưởng KHCN sinh viên của Bộ GD&ĐT** (TT 45/2020/TT-BGDĐT, Điều 4, khoản 2, điểm đ). Muốn dự giải Bộ thì làm thành đề tài NCKH riêng. Xem chi tiết ở `references/tieu-chi-cham.md`.

## Thư mục dự án

Tạo `khoa-luan/<slug-de-tai>/` trong thư mục làm việc (hoặc nơi người dùng chỉ định). Ghi file theo từng pha; không giữ toàn bộ trong chat.

```
00-ho-so.md        loại sản phẩm, trường, hạn, GVHD, quy định trình bày, NHẬT KÝ PHIÊN (cuối file)
01-tham-dinh.md    3 phương án tên đề tài + bảng chấm + quyết định của người dùng
02-tong-quan.md    chiến lược tìm + ma trận tài liệu + khoảng trống nghiên cứu
03-khung.md        câu hỏi, giả thuyết, khung lý thuyết, phương pháp ↔ câu hỏi
04-de-cuong.md     đề cương chi tiết + phân bổ trang
05-nguon/          so-nguon.md (sổ nguồn), van-ban.md (bảng hiệu lực), ban-an.md
06-chuong-*.md     bản nháp từng chương
07-phan-bien.md    phiếu chấm giả lập + danh sách sửa
08-hoan-thien.md   checklist nộp + câu hỏi bảo vệ
nhat-ky-ai.md
```

Mở lại phiên: đọc `00-ho-so.md` (phần NHẬT KÝ PHIÊN) trước, làm tiếp từ pha chưa qua cổng.

## Quy trình 9 pha

Mỗi pha có: **Làm** → **Sản phẩm** → **Cổng** (điều kiện cụ thể để qua). Không qua cổng thì không sang pha sau. Mọi cổng đều cần người dùng duyệt, trừ khi người dùng đã nói rõ "tự chạy hết".

### Pha 0 — Tiếp nhận
Làm: hỏi gom **một lượt**: loại sản phẩm; trường, khoa (có file quy định trình bày không); hạn nộp; GVHD và định hướng của GVHD; cuộc thi và năm (thể lệ đổi theo năm); người dùng đã có gì (đọc gì, dữ liệu, nghề định hướng). Thiếu thông tin thì dùng mặc định trong `references/trinh-bay-trich-dan.md` và ghi rõ là mặc định.
Cổng: `00-ho-so.md` có đủ 6 mục trên (mục chưa biết ghi "mặc định: …").

### Pha 1 — Thẩm định và mài đề tài
Làm: từ đề tài thô, đưa ra **3 phương án** (hẹp / vừa / tham vọng). Chấm mỗi phương án 1–5 theo: tính cấp thiết (văn bản mới, bất cập có bằng chứng, vụ việc nổi bật); **tính mới** (đã tìm các công trình gần nhất chưa? khác ở đâu?); khả thi về nguồn (có bản án, số liệu, tài liệu nước ngoài đọc được không?); vừa độ dài; hợp với định hướng nghề.
Tên đề tài phải nêu đối tượng + phạm vi + góc tiếp cận. Ví dụ khuôn: "Pháp luật về X — thực trạng và kiến nghị hoàn thiện"; "X theo pháp luật [nước A] và kinh nghiệm cho Việt Nam"; "Thực tiễn áp dụng X tại Tòa án…".
Sai lầm cần chặn: đề tài rộng như giáo trình ("Pháp luật về hợp đồng"); trùng hoàn toàn khóa luận hoặc luận văn trước; văn bản nền sắp bị thay thế mà không xử lý.
Cổng: người dùng chọn 1 phương án; đã ghi ≥ 3 công trình gần nhất (đã kiểm có thật) và 1 câu "đề tài này khác các công trình đó ở …".

### Pha 2 — Tổng quan tình hình nghiên cứu
Làm: lập chiến lược tìm (từ khóa Việt và Anh, nguồn: `references/nguon-tra-cuu.md`). Đọc 3 lượt (lướt → đọc lập luận → đọc phê phán). Ghi **ma trận tài liệu**: tác giả, năm, loại, câu hỏi, phương pháp, kết luận, hạn chế, liên quan tới mục nào của đề cương.
Viết tổng quan **theo chủ đề**, không theo danh sách tác giả: nhóm A đã làm rõ…, nhóm B tranh luận…, **chưa ai** làm… → khoảng trống mà đề tài lấp.
Cổng: ma trận ≥ 15 nguồn cho khóa luận hoặc NCKH (≥ 8 cho tiểu luận), có cả trong và ngoài nước nếu đề tài có so sánh; khoảng trống nghiên cứu nêu được trong 2–3 câu; mọi nguồn trong ma trận đều đã mở được hoặc ghi rõ "chỉ có tóm tắt".

### Pha 3 — Câu hỏi, khung lý thuyết, phương pháp
Làm: 1 câu hỏi chính + 2–4 câu hỏi phụ (mỗi câu ứng với ≥ 1 mục đề cương). Giả thuyết nghiên cứu nếu có. Khung lý thuyết: học thuyết hoặc nguyên tắc làm thước đo đánh giá (ví dụ: tự do hợp đồng, bảo vệ bên yếu thế, tương xứng, chi phí giao dịch). Phương pháp chọn theo `references/phuong-phap-luat-hoc.md`, **mỗi phương pháp gắn với câu hỏi và chương cụ thể**; cấm viết chung chung "phân tích, tổng hợp, so sánh…" mà không nói dùng ở đâu, để làm gì.
Cổng: có bảng "câu hỏi → phương pháp → nguồn dữ liệu → chương".

### Pha 4 — Đề cương chi tiết
Làm: theo `references/de-cuong-mau.md`. Phần mở đầu đủ 6 mục; ≥ 2 chương, mỗi chương ≥ 2 mục, có "Kết luận chương"; phân bổ số trang. Khung phổ biến: Chương 1 lý luận; Chương 2 thực trạng pháp luật và thực tiễn áp dụng; Chương 3 kiến nghị. Đề tài so sánh có thể theo khung: lý luận → pháp luật nước ngoài → Việt Nam và kiến nghị.
Cổng: mỗi mục có 1 dòng "mục này trả lời câu hỏi nào, dùng nguồn nào"; người dùng (hoặc GVHD) duyệt đề cương.

### Pha 5 — Thu thập và kiểm nguồn
Làm: `05-nguon/van-ban.md` là bảng hiệu lực (số hiệu, tên, ngày ban hành, ngày hiệu lực, tình trạng, link vbpl.vn, ngày kiểm). `ban-an.md`: số bản án, tòa, ngày, tóm tắt tình tiết, vấn đề pháp lý, link nguồn. Trích nguyên văn điều luật ngay khi đọc, kèm điều/khoản/điểm. Tài liệu nước ngoài: ghi bản gốc, tự dịch thì ghi "người viết dịch".
Cổng: mọi VBQPPL được nhắc trong đề cương có dòng trong bảng hiệu lực; mỗi bất cập dự định nêu có ≥ 1 bằng chứng (điều luật mâu thuẫn, bản án, số liệu, bài phân tích).

### Pha 6 — Viết từng chương
Làm: viết **một chương một lần**, theo đề cương; sau mỗi chương dừng cho người dùng xem. Mỗi luận điểm theo chuỗi:
**Vấn đề → Quy định hiện hành (nguyên văn, điều/khoản) → Quan điểm khoa học (đồng thuận và tranh luận) → Thực tiễn (bản án, số liệu) → Đánh giá của tác giả theo khung lý thuyết → (nếu có) Kiến nghị.**
Chương lý luận: định nghĩa có nguồn, so sánh các định nghĩa rồi đưa định nghĩa của tác giả; đặc điểm; phân loại; nội dung điều chỉnh. Không chép giáo trình. Chương thực trạng: chia **ưu điểm / hạn chế / nguyên nhân** (nguyên nhân từ pháp luật, từ thực thi, từ nhận thức); hội đồng hay bắt lỗi thiếu phân tích nguyên nhân cốt lõi. Chương kiến nghị: mỗi kiến nghị phải **(a) gắn với 1 hạn chế đã chứng minh, (b) nói sửa điều/khoản nào của văn bản nào, (c) đề xuất câu chữ cụ thể nếu được, (d) lường tác động hoặc phản biện**. Kiến nghị chung chung ("tăng cường tuyên truyền") chỉ đặt cuối, không làm trọng tâm.
Cổng mỗi chương: chạy `python3 scripts/kiem_tra_ban_thao.py <file>`, không còn lỗi chặn; người dùng duyệt.

### Pha 7 — Phản biện giả lập hội đồng
Làm: đóng 3 vai **độc lập**, mỗi vai đọc toàn bài: (1) phản biện khắt khe về học thuật; (2) người làm thực tiễn (thẩm phán, luật sư, pháp chế); (3) thư ký chấm theo phiếu điểm đúng cuộc thi hoặc trường (`references/tieu-chi-cham.md`). Dùng checklist `references/phan-bien-hoi-dong.md`. Kết quả: điểm từng tiêu chí kèm lý do, danh sách sửa xếp theo mức tác động lên điểm.
Cổng: mọi lỗi mức "chặn" đã sửa; điểm giả lập ở mỗi tiêu chí ≥ 70% điểm tối đa; bài dự giải Bộ GD&ĐT có tổng giả lập **≥ 85** (ngưỡng vào chung khảo, TT 45/2020, Điều 13, khoản 3). Không đạt thì người dùng phải xác nhận chấp nhận rủi ro bằng văn bản.

### Pha 8 — Hoàn thiện, nộp, bảo vệ
Làm: chuẩn hóa footnote và danh mục tài liệu tham khảo (`references/trinh-bay-trich-dan.md`); kiểm hình thức theo quy định trường hoặc thể lệ (ẩn danh nếu dự giải); viết tóm tắt (và tóm tắt tiếng Anh nếu yêu cầu); 15–20 câu hỏi bảo vệ dự kiến kèm ý trả lời; khung slide 10–12 trang (nếu có skill `slide-chuan` thì dùng).
Cổng: `kiem_tra_ban_thao.py` chạy trên bản cuối báo 0 lỗi; checklist nộp trong `08-hoan-thien.md` tick đủ; `nhat-ky-ai.md` cập nhật.

## Tra nhanh

| Cần | Đọc |
|---|---|
| Thang điểm Euréka, Bộ GD&ĐT, cấp trường; ẩn danh | `references/tieu-chi-cham.md` |
| Chọn và viết phương pháp nghiên cứu luật học | `references/phuong-phap-luat-hoc.md` |
| Tìm văn bản, bản án, án lệ, tạp chí, tài liệu nước ngoài | `references/nguon-tra-cuu.md` |
| Khung phần mở đầu, đề cương, ma trận tài liệu | `references/de-cuong-mau.md` |
| Footnote, "tlđd", danh mục VBQPPL, hình thức trang | `references/trinh-bay-trich-dan.md` |
| Lỗi hội đồng hay bắt, câu hỏi bảo vệ | `references/phan-bien-hoi-dong.md` |
| Nhật ký AI, quy tắc diễn đạt lại, đạo văn | `references/liem-chinh-ai.md` |
| Kiểm bản nháp tự động | `python3 scripts/kiem_tra_ban_thao.py <file.md>` |
| Ví dụ pha 0–4 đã chạy (cổng pha 2 chưa qua — xem đúng cách để mở `[CẦN KIỂM]`) | `vi-du/giao-dich-nguoi-co-lien-quan/` |

## Công cụ, nếu phiên có

- Tìm web (WebSearch, Parallel/Firecrawl search): tìm công trình gần nhất và văn bản. Ưu tiên vbpl.vn, cổng toaan.gov.vn, tạp chí có ISSN.
- `Legal_Data_Hunter` MCP: luật và án nước ngoài cho phần so sánh (EU, Mỹ, Pháp, Singapore…).
- Firecrawl research, Google Scholar, SSRN: bài báo tiếng Anh.
- Skill `docx`: xuất file Word đúng định dạng ở pha 8.

Không có công cụ tìm kiếm thì nói rõ: mọi nguồn ở pha 2 và pha 5 là `[CẦN KIỂM]`, người dùng phải tự tra.

## Lỗi thường gặp → cách chặn

| Lỗi | Chặn bằng |
|---|---|
| Viết luôn chương 1 khi chưa có khoảng trống nghiên cứu | Cổng pha 2 |
| Dẫn văn bản đã hết hiệu lực như luật hiện hành | Bảng hiệu lực pha 5 + script |
| Tổng quan là danh sách "A (2019) nghiên cứu…, B (2020) nghiên cứu…" | Viết theo chủ đề, kết bằng khoảng trống |
| Phương pháp liệt kê chung chung | Bảng câu hỏi → phương pháp → chương |
| Kiến nghị không gắn hạn chế, không chỉ ra điều khoản | Mẫu 4 điểm (a)–(d) ở pha 6 |
| Bài dự thi lộ tên trường hoặc tác giả | Checklist ẩn danh pha 8 |
| Câu chữ trơn tru nhưng lập luận rỗng | Pha 7 vai (1) chấm lập luận, bỏ qua văn phong |
| Footnote không có trang, danh mục lẫn VBQPPL với sách | `trinh-bay-trich-dan.md` |
