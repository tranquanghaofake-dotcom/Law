# slide-chuan v2: quy trình thay một đội làm slide (đề xuất chờ duyệt)

Ngày: 14/11/2026 · Người yêu cầu: Hào · Trạng thái: **đã duyệt 14/11/2026** — Q1: B (tự do hoàn toàn, máy kiểm tối đa để ít lỗi) · Q2: theo khuyến nghị (3 điểm duyệt với bài có tài liệu gốc, 5 với bài mới) · Q3: A (người duyệt độc lập `opus`)

## 1. Vì sao viết lại
Skill hiện tại làm kiểu **chọn mẫu rồi điền chữ**: 65 mẫu bố cục (`stage/templates.js`), 14 "da" theo môn (`hinh/da.js`), kho hình vẽ sẵn (`hinh/ve_bh.js`, `bieu_do_ve.js`, `so_bhxh.js`, `f3d/`…), `SKILL.md` 252 dòng. Mỗi lần bị chê lại thêm một mẫu hoặc một luật, nên skill phình to mà bài mới vẫn rập khuôn. Hào muốn ngược lại: mỗi bài mới đều **nghiên cứu → kịch bản → vẽ asset riêng → tìm ảnh → ghép sáng tạo**, và skill chỉ giữ **quy trình** cùng **công cụ máy móc**.

## 2. Bằng chứng nghiên cứu (tóm tắt, nguồn ở mục 9)
- **Đội làm slide chuyên nghiệp** không bắt đầu từ thiết kế mà từ brief, khán giả và mục tiêu, rồi tới kịch bản. Họ duyệt phong cách và làm mẫu vài slide **trước** khi dựng hàng loạt, có người duyệt độc lập và có diễn tập [S1–S9].
- **Bài giảng**: mục tiêu theo Bloom; mỗi slide một khẳng định + bằng chứng hình (assertion–evidence, Alley); nguyên tắc Mayer (bỏ trang trí, không chép lời nói lên slide, nhấn đúng chỗ, nhãn sát hình) [S4, S7, S9].
- **Mã nguồn mở / bài báo**:
  - PPTAgent: tách dàn ý khỏi bố cục, mỗi slide ghi rõ đoạn nguồn nào; bỏ bước dàn ý thì điểm giảm (3,67 → 3,30) [R2].
  - AutoPresent, PreGenie: dựng bằng code rồi **render ảnh, nhìn và sửa**; vòng sửa đầu lợi nhất [R3, R5].
  - Skill `pptx` của Anthropic: render PPTX → ảnh, soát theo thứ tự tràn → chồng → khoảng cách → tương phản, sửa xong phải render lại [R1].
  - Rubric chấm: PPTEval gồm Nội dung / Thiết kế / Mạch lạc, thang 1–5 có lý do, tương quan với người chấm 0,71 [R2].
- **Không nghiên cứu nào so trực tiếp** "mẫu cố định" với "thiết kế tự do". Mẫu cố định ổn định nhưng rập khuôn; thiết kế tự do linh hoạt nhưng phải có vòng render–soát. Hướng lai là ý kiến, chưa có thí nghiệm xác nhận [R-tổng hợp].

## 3. Vai trò (AI đóng hết, trừ người quyết)
| Vai | Việc | Ghi chú |
|---|---|---|
| Điều phối (PM) | Giữ tiến độ, điểm duyệt, nhật ký thay đổi | Mỗi bước kết thúc bằng một sản phẩm có tên file |
| Chiến lược (strategist) | Brief: khán giả biết gì / chưa biết gì, bối cảnh phòng học, thời lượng | |
| Thiết kế bài giảng | Mục tiêu học tập (Bloom), một câu "ý lớn", câu hỏi kiểm tra khớp mục tiêu | |
| Nghiên cứu + chuyên gia + kiểm chứng | Đọc tài liệu gốc, tra nguồn ngoài, đối chiếu luật (skill `vn-legal-exam-analysis`, kho `packages/content/data/laws/`) | Bảng "nhận định → nguồn → hiệu lực"; ghi lỗi tìm thấy trong bài gốc |
| Biên kịch / storyboard | Dàn ý → bảng slide: khẳng định · bằng chứng hình · nguồn · thời lượng · lời nói | |
| Chỉ đạo hình ảnh (art director) | 2–3 hướng phong cách: màu, chữ, kiểu minh hoạ, lưới, mỗi hướng 1 slide mẫu | |
| Hoạ sĩ | Vẽ SVG riêng cho bài, **lưu trong thư mục bài, không lưu vào skill** | |
| Tìm ảnh | Tìm theo brief, chấm bằng mắt, ghi nguồn (TASL) | Không ảnh AI |
| Thiết kế slide + chuyển động | Dựng từng slide tự do theo kịch bản → HTML → PPTX | |
| Soát máy (QA) | Tràn, chồng, cỡ chữ, tương phản, chữ chỉ có trong ảnh, chính tả | Script có sẵn |
| **Người duyệt độc lập (red team)** | Agent mới (model `opus`), không thấy lập luận của người dựng, chấm rubric + soát luật | Theo `CLAUDE.md`: review dùng `opus` |
| **Cố vấn** | Ở mỗi điểm quyết định, viết **bản ghi lựa chọn** (mục 5) | Nói thẳng khi giả định của Hào sai |
| Huấn luyện thuyết trình | Lời nói từng slide, đo thời lượng, phương án cắt | |
| Biên tập + lưu trữ | Chính tả, bàn giao, rút kinh nghiệm | Kinh nghiệm ghi vào thư mục bài, chỉ lỗi công cụ mới sửa skill |

## 4. Quy trình 11 bước, 5 điểm duyệt
| # | Bước | Sản phẩm (trong thư mục bài) | Điểm duyệt | Kiểm tra |
|---|---|---|---|---|
| 0 | Brief + khán giả | `brief.md` (1 trang) | **D1** (gộp với bước 1) | Khán giả, thời lượng, máy chiếu, nơi dùng (lớp / công khai) |
| 1 | Mục tiêu + ý lớn | trong `brief.md`: 3–5 mục tiêu Bloom, 1 câu ý lớn | D1 | Mỗi mục tiêu có động từ đo được |
| 2 | Nghiên cứu, kiểm chứng | `noi-dung.md`: nội dung đầy đủ + bảng nguồn + lỗi của bài gốc + điều chưa chắc | **D2** | Mọi nhận định có nguồn; luật ghi số hiệu, điều, hiệu lực |
| 3 | Kịch bản | `kich-ban.md`: bảng slide (khẳng định, bằng chứng hình, nguồn, giây, lời nói) | **D3** | Đọc liền các tiêu đề thành mạch; mỗi mục tiêu có slide + câu kiểm tra; tổng giờ khớp |
| 4 | Chỉ đạo hình ảnh | `phong-cach/`: 2–3 hướng, mỗi hướng một slide mẫu + bản ghi lựa chọn | **D4** | Một phong cách minh hoạ; tương phản WCAG |
| 5 | Làm mẫu | 3–4 slide thật (bìa, khái niệm, sơ đồ, số liệu) dạng PPTX | **D5** | Glance test 3 giây; soát máy sạch |
| 6 | Asset + ảnh | `asset/*.svg`, `anh/` + `ghi-cong.md` | — | Cùng nét, cùng màu; ảnh có nguồn |
| 7 | Dựng toàn bộ | `slide/*.html` → `<tên>.pptx` | — | |
| 8 | Soát | máy → render ảnh → người duyệt độc lập chấm rubric → sửa (tối đa 2 vòng) | — (lên tiếng nếu cần đánh đổi) | Rubric mục 6 |
| 9 | Diễn tập | lời nói trong notes, bảng thời lượng, slide có thể cắt | — | Tổng ≤ thời lượng, chừa 10 % |
| 10 | Bàn giao + rút kinh nghiệm | PPTX, ảnh tổng, `ghi-cong.md`, `nhat-ky.md` | Nghiệm thu | Mở lại file, kiểm font |

Các bước thường bị bỏ trong chuỗi "nghiên cứu → kịch bản → vẽ → ảnh → ghép", đã thêm vào: phân tích khán giả · mục tiêu và câu kiểm tra khớp nhau · duyệt phong cách trước khi vẽ · làm mẫu trước khi nhân rộng · người duyệt độc lập · diễn tập và đo giờ · khả năng tiếp cận · ghi nguồn ảnh / luật · nhật ký phiên bản · rút kinh nghiệm.

## 5. Bản ghi lựa chọn của cố vấn (vừa một màn hình)
1. **Cần quyết gì**: 1 câu, kèm hậu quả nếu chậm quyết.
2. **Phương án A / B / (C)**: mô tả 1 dòng · ưu · nhược · công sức · rủi ro · ảnh nhỏ nếu có.
3. **Tiêu chí**: 3–4 tiêu chí gắn mục tiêu bài (hiểu, nhớ, thời lượng, dễ sửa).
4. **Khuyến nghị**: chọn một, nêu lý do và điều kiện để đổi ý. Giả định của Hào sai thì nói thẳng.
5. **Hào cần làm**: chọn A / B / C hoặc nêu hướng khác; ghi rõ mặc định nếu Hào không trả lời.

Chỉ lên tiếng ở D1–D5, khi có ≥ 2 hướng hợp lý thật sự, khi phát hiện rủi ro luật / bản quyền / hiệu lực, hoặc khi giả định của Hào có vẻ sai. Việc nhỏ thì tự quyết và ghi vào nhật ký.

## 6. Soát từng slide + rubric cả deck
**10 điều kiểm mỗi slide**:
1. Glance test 3 giây.
2. Một ý; tiêu đề là câu khẳng định.
3. Bằng chứng là hình, không phải gạch đầu dòng.
4. Không có chi tiết trang trí vô nghĩa.
5. Không chép lời nói lên slide.
6. Tối đa 1–2 điểm nhấn.
7. Nhãn đặt sát hình.
8. Thứ bậc rõ: tiêu đề > nội dung > chú thích.
9. Tương phản ≥ 4,5 : 1; chữ ≥ 12 pt (thân ≥ 14 pt).
10. Luật có số hiệu, điều, hiệu lực; ảnh có nguồn và chữ thay thế.

**Rubric** (người duyệt độc lập chấm 1–5, kèm lý do): Nội dung (đúng, đủ, nguồn) · Thiết kế (thứ bậc, khoảng thở, nhất quán) · Mạch lạc (cả deck) · Dễ hiểu (người mới học nhìn có hiểu không). Dưới 4 điểm ở hạng nào thì sửa.

## 7. Dọn skill (Hào đã chọn "Dọn")
**Giữ** (công cụ, không phải nội dung):
- `hinh/build.js` + `xml.js` + `may_quay.js`: HTML → PPTX; `data-t` thành chữ sửa được, `data-l` thành lớp ảnh; hiệu ứng, Morph.
- `hinh/tao_font.js` + `fonts/`.
- `scripts/soat_chi_tiet.js`, kiểm tràn / chồng / cỡ chữ.
- `find_images.py`, `img_quality.py`, `fetch_image.py`, `outline.py`, `ban_ghi_chu.py`.
- Bộ đối chiếu căn cứ pháp lý.
- Ảnh tổng (montage).

**Bỏ** khỏi skill (vẫn còn trong lịch sử git, khôi phục được):
- 65 mẫu: `stage/templates.js`, `stage.css`, `layouts.md`…
- Các da và hình vẽ sẵn: `da.js`, `art.js`, `do_vat.js`, `ve_*.js`, `bieu_do_ve.js`, `canh*.js`, `bang_chung.js`, `hoi_nghi.js`, `so_bhxh.js`, `bhxh_*.js`, `f3d/`, `emoji.json`.
- `examples/` và các test của những phần trên.
- Các tài liệu tham khảo gắn với mẫu.

**Thêm**:
- `SKILL.md` ≤ 80 dòng: quy trình mục 4 + điểm duyệt + vai trò.
- `references/quy-trinh.md`, `vai-tro.md` (gồm bản ghi lựa chọn).
- `references/soat.md`: mục 6.
- `references/hop-dong-html.md`: cách viết một slide HTML để `build.js` dựng thành PPTX, kèm vài khối dựng sẵn nhẹ (lưới, khung tiêu đề, khung hình).
- `scripts/dung.js` mới (mỏng): ghép `slide/*.html` → `build.js` → soát → ảnh tổng.
- Test cho phần giữ lại.

## 8. Lựa chọn Hào cần quyết (cố vấn)
**Q1. Cách dựng slide.**
- A. **Lai**: vài khối dựng sẵn nhẹ (lưới, khung) + vẽ tự do bên trong + vòng render–soát.
  - Ưu: giữ được độ ổn định tối thiểu mà vẫn sáng tạo.
  - Nhược: vẫn có khung chung.
- B. **Tự do hoàn toàn**.
  - Ưu: sáng tạo nhất.
  - Nhược: lỗi bố cục nhiều hơn, tốn thêm vòng sửa.

**Khuyến nghị A**: các khối dựng sẵn chỉ là thước kẻ, không phải mẫu.

**Q2. Số điểm duyệt.**
- A. **Đủ 5** như bảng mục 4: chắc nhất, nhưng Hào phải trả lời 5 lần.
- B. **Gọn 3**: (brief + mục tiêu + nội dung) · (kịch bản) · (phong cách + mẫu).

**Khuyến nghị B** cho bài giảng có sẵn tài liệu gốc; dùng A cho bài mới hoàn toàn.

**Q3. Người duyệt độc lập.**
- A. Agent `opus` riêng: khách quan hơn, tốn token hơn.
- B. Tự soát trong phiên: rẻ, nhưng dễ tự khen.

**Khuyến nghị A.**

## 9. Nguồn
- [S1] Duarte, Glance Test — https://www.duarte.com/resources/guides-tools/the-glance-test/
- [S2] Duarte, Sparkline — https://www.duarte.com/blog/ultimate-guide-to-contrast/
- [S3] MLC Presentations, quy trình chọn agency — https://www.mlcpresentations.com/en/how-to-choose-a-presentation-design-agency/
- [S4] Michael Alley, assertion–evidence — https://www.assertion-evidence.org/
- [S5] Garr Reynolds, Presentation Zen — https://www.garrreynolds.com/
- [S6] SAM / ADDIE — https://community.articulate.com/blog/articles/an-introduction-to-sam-for-instructional-designers/1124165
- [S7] Mayer, 12 nguyên tắc — https://www.hartford.edu/faculty-staff/faculty/fcld/_files/12%20Principles%20of%20Multimedia%20Learning.pdf
- [S8] Ethos3, storyboard — https://ethos3.com/creating-a-storyboard-for-your-presentation/
- [S9] Bloom sửa đổi — https://www.coloradocollege.edu/other/assessment/how-to-assess-learning/learning-outcomes/blooms-revised-taxonomy.html
- [S10] WCAG 1.4.3 — https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- [S11] Creative Commons, ghi nguồn TASL — https://wiki.creativecommons.org/wiki/Recommended_practices_for_attribution
- [R1] Anthropic `pptx` skill — https://github.com/anthropics/skills/blob/main/skills/pptx/SKILL.md
- [R2] PPTAgent / PPTEval — https://arxiv.org/abs/2501.03936 · https://github.com/icip-cas/PPTAgent
- [R3] AutoPresent / SlidesBench — https://arxiv.org/abs/2501.00912
- [R4] Presenton — https://github.com/presenton/presenton
- [R5] PreGenie (tóm tắt thứ cấp) — https://www.themoonlight.io/review/pregenie-an-agentic-framework-for-high-quality-visual-presentation-generation

**Chưa kiểm chứng**:
- Quy trình nội bộ của các agency (Duarte, Ethos3, 24Slides…): không có tài liệu công khai, phần vai trò và điểm duyệt là tổng hợp từ kinh nghiệm chung.
- SlideGen, Paper2Slides: mới đọc qua tóm tắt.
- Các mức cỡ chữ "≥ 24 pt": là khuyến nghị thông dụng, không phải chuẩn W3C.

## 10. Bổ sung 15/11/2026 — nâng phần thẩm mỹ (Hào duyệt: A, bỏ cốt truyện)
Lý do: deck Chương 3 đúng nội dung nhưng "chưa đẹp, đơn giản, trình bày xấu và vô lý" — một khuôn cho mọi slide, hình dán lặp lại, không lưới, không nhịp, không bước nào chịu trách nhiệm thẩm mỹ.
- Bước 3: **mạch theo thể loại** (bài giảng bám dàn ý gốc, không cốt truyện xuyên suốt; bản án; báo cáo; bảo vệ).
- Bước 4 thay bằng: **tham chiếu 15–20 mẫu chuyên nghiệp đúng thể loại → hệ thống thiết kế của bài (lưới, thang chữ, 8–10 kiểu slide) → bản đồ nhịp → hướng phong cách**; tất cả trong `thiet-ke/` của thư mục bài.
- Bước 5: slide then chốt làm 3 phương án rồi chọn. Bước 6: brief minh hoạ từng slide, ít hình, to, không dán vật lặp lại.
- Rubric thêm hạng **Thẩm mỹ** (so với bảng tham chiếu); giao khi mọi hạng ≥ 4.
- Giữ mục tiêu gốc: skill vẫn chỉ chứa quy trình + công cụ; tham chiếu, hệ thống thiết kế, asset là của từng bài.

## 11. Bổ sung 15/11/2026 — đa dạng trong hệ thống (nền, bảng biểu, asset)
**Vấn đề** (Hào nhận xét deck Chương 3): bảng một kiểu, asset lặp, nền một màu đơn điệu. Đo lại: nền kem 68 % deck, 10 slide liền cùng nền; 3 hình người / nhà / toà nhà mỗi hình 4 slide; 5 bảng cùng một khuôn.
**Căn cứ**: 21 mẫu Slidesgo đợt 2 (nhóm bảng biểu, hệ nền, bộ minh hoạ) + 33 mẫu đợt 1. Phát hiện: mẫu đẹp giữ **một họ nền sáng 60–80 %** và đổi **vị trí hoạ tiết** từng slide; nền đậm chỉ cho mở chương / số lớn / trích dẫn; 11–14 kiểu bảng trong một bộ nhưng cùng bảng màu; 4–6 hình chính cho 8–12 slide nội dung, hình lặp ≥ 3 lần luôn là motif có vai.
**Thay đổi skill**:
- `references/he-nen.md` (N1–N6, quy tắc tỉ lệ / chuyển nền / hoạ tiết) và `references/trinh-bay-du-lieu.md` (bảng chọn kiểu theo loại thông tin, 13 kiểu T1–T13).
- Quy trình bước 4b thêm hệ nền + bộ trình bày dữ liệu; 4c bản đồ nhịp ba dải (kiểu · nền · bảng/hình); bước 6 thêm kiểm kê asset (`thiet-ke/asset.md`).
- Máy: `scripts/da_dang.js` (gọi từ `dung.js`) in dải nền + thống kê, báo lỗi ◇: < 3 loại nền (deck ≥ 12 slide), một nền > 80 %, > 6 slide liền cùng nền cùng vị trí hoạ tiết, một hình > 3 slide (trừ `data-lap`), mọi bảng một kiểu hoặc một kiểu > 40 % (≥ 5 bảng). Có test.
- Rubric Thẩm mỹ thêm tiêu chí đa dạng trong hệ thống; "đổi nền / màu ngẫu nhiên không theo vai" là điểm 1.
**Giới hạn**: số đo ước lượng bằng mắt trên mẫu thương mại, chưa kiểm với sinh viên; ngưỡng có thể chỉnh sau khi dùng trên 2–3 bài.

## 12. Bổ sung 15/11/2026 — tay nghề: phong cách asset, bộ thành phần bảng, so sánh với mẫu (Hào duyệt, chọn phong cách B "phẳng 2 tông" cho Chương 3)
**Vấn đề**: người duyệt chấm Thẩm mỹ 3 — hình trộn phong cách (người bán 3D + biểu tượng phẳng), bảng chưa có điểm nhấn; quy trình mới đo số lượng (loại nền, kiểu bảng, hình lặp) chứ chưa đo tay nghề.
**Thay đổi**: thẻ phong cách `thiet-ke/phong-cach.json` + `scripts/kiem_phong_cach.js` (◇ gradient / bóng mờ / quá nhiều màu); bảng xem thử asset tự động `<tên>_lop/asset.jpg`; bộ thành phần bảng `hinh/bang.css` (T1–T13, màu qua biến — thành phần kỹ thuật, không phải mẫu bố cục); mỗi bảng và hình chính làm 2 phương án; `scripts/to_so_sanh.js` ghép slide cạnh mẫu tham chiếu cho người duyệt. Có test.
