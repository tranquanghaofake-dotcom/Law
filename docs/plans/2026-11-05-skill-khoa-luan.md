# Sổ việc — Skill làm tiểu luận / khoá luận / NCKH luật (chuẩn dự giải)

Yêu cầu: xây 1 skill đưa một đề tài luật từ 0 → hoàn thành (thẩm định đề tài, tổng quan, khung lý thuyết, đề cương, viết chương, phản biện, hoàn thiện). 4–5 vòng nghiên cứu.
Nhánh: claude/academic-thesis-writing-skill-m46l56 · Ngân sách: ~2 giờ, 0 subagent.

Quyết định: tự làm, không fan-out — vì CLAUDE.md cấm fan-out cho việc < 1 ngày — sai thì tốn thêm ~1 giờ.
Quyết định: đối tượng (c) khoá luận + NCKH dự giải, tiểu luận là bản rút gọn; chuẩn trình bày chung (chưa có quy định trường) — vì Hào chọn mặc định.
Quyết định: kiểm thử skill bằng chạy thử trên 1 đề tài mẫu do agent chính tự làm, không dùng subagent pressure-test — vì Hào không cho dùng subagent.

## Task
| # | Việc | File | Kiểm tra | Trạng thái |
|---|---|---|---|---|
| 1 | 5 vòng nghiên cứu, ghi link | sổ việc này | có ≥ 5 mục vòng | xong |
| 2 | Viết SKILL.md + references/ + script kiểm tra | .claude/skills/khoa-luan-luat/** | python3 .claude/skills/khoa-luan-luat/scripts/kiem_tra_skill.py xanh | |
| 3 | Chạy thử trên đề tài mẫu → đề cương | scratchpad | file đề cương đủ mục theo checklist | xong |
| 4 | Đóng gói .zip, commit, push | dist zip | unzip -l | xong (zip ngoài repo) |

Task 1: bắt đầu — base 911ed8c

## Nhật ký nghiên cứu

### Vòng 1 — skill/repo mã nguồn mở (học cấu trúc, không chép)
- github.com/Imbad0202/academic-research-skills — pipeline research → write → integrity → review → revise; reviewer "devil's advocate"; xác minh 100% tài liệu tham khảo.
- github.com/kgraph57/paper-writer-skill — "Not a manuscript factory": người dùng giữ quyền với Ý TƯỞNG và DỮ LIỆU; pha Discovery (kiểm tính mới) trước khi viết; stage-gate.
- github.com/xcl2005/academic-paper-writing-skill — luận điểm chính phải gắn bằng chứng, kiểm trước rồi viết; tách "đã kiểm / ý của nguồn / suy luận".
- github.com/Hua-TFSU/260802codex-claude-academic-skills — 4 nhãn thông tin: nguyên văn / người dùng xác nhận / suy luận / đề xuất mở rộng; không bịa DOI, số liệu.
- github.com/YANZHANLIN/literature-review-skill — ma trận tổng hợp tài liệu (Torraco, Webster & Watson), đọc 3 lượt (Keshav).
- github.com/AlessandroCaforio/Academic-Writing — "Session Log" ở cuối file dự án để phiên sau biết đang ở đâu.
### Vòng 2 — quy định & tiêu chí chấm
- TT 26/2021/TT-BGDĐT (hoạt động NCKH sinh viên) — vbpl.vn ghi "Còn hiệu lực", hiệu lực 02/11/2021, thay TT 19/2012.
- TT 45/2020/TT-BGDĐT (Giải thưởng KHCN cho giảng viên trẻ và sinh viên) — các trường vẫn căn cứ năm 2026 (hcmus.edu.vn, Công văn 1140/BGDĐT-KHCNTT 2026). Đ4 k2: khoá luận, đồ án tốt nghiệp KHÔNG được gửi xét giải; ≤ 5 SV, ≤ 2 GVHD; ẩn danh trong báo cáo.
- Thang điểm đề tài SV 100 điểm (tổng quan 10, nội dung 20, PP 15, kết quả 40, hình thức 5, công bố 10) — lấy qua quy định HCMUE, ĐH CMC (2026) dẫn TT45; chưa đọc được nguyên văn Điều 10 TT45 → ghi "cần đối chiếu".
- TT 18/2016/TT-BGDĐT — hết hiệu lực (lawplayer.com), chỉ dùng tham khảo lịch sử.
- Thể lệ Euréka 2024 (eureka.khoahoctre.com.vn): mục đích 15; nội dung + PP + trình bày 30; tính mới 30; ứng dụng/kiến nghị 15; trích dẫn 10. Ẩn danh toàn bộ, không lời cảm ơn, tóm tắt ≤ 1 trang A4, TNR 13. (2021: 30/50/20 — thể lệ đổi theo năm.)
### Vòng 3 — đề tài đạt giải / danh mục đề tài
- pnckh.hcmulaw.edu.vn (danh mục đề tài SV 2022), luatthuongmai.hcmulaw.edu.vn (danh mục khoá luận K45): khuôn tên đề tài phổ biến "Pháp luật về X theo pháp luật một số quốc gia và kinh nghiệm cho Việt Nam", "Thực tiễn áp dụng…". Không tìm được toàn văn bài đạt giải công khai → skill KHÔNG giả lập "bài đạt giải", chỉ dùng tiêu chí chấm.
- hcmulaw.edu.vn hội thảo 09/2026: lỗi phổ biến — không phân tích nguyên nhân cốt lõi của bất cập, xác định phương pháp chưa chính xác.
### Vòng 4 — phương pháp luật học
- Lê Huỳnh Tấn Duy, "Nhận thức chung về phương pháp nghiên cứu khoa học pháp lý", Tạp chí Khoa học pháp lý Việt Nam số 03(199)/2026, tr. 32–44 (phân biệt loại hình / phương pháp luận / phương pháp / kỹ thuật).
- Đoàn Đức Lương, Đào Mộng Điệp, "Quy trình, kỹ thuật sử dụng phương pháp phân tích luật viết…", Tạp chí Pháp luật và Thực tiễn số 57/2023.
- Kỷ yếu "Phương pháp luận, phương pháp nghiên cứu luật học" (ĐH Cần Thơ): so sánh 4 cấp độ (quy phạm, chế định, ngành luật, hệ thống).
- Hutchinson & Duncan (2012) doctrinal research; Van Hoecke (2015) comparative methodology; P. Ishwara Bhat (2020, OUP).
### Vòng 5 — trình bày & trích dẫn
- ĐH Luật TP.HCM, Khoa Luật Thương mại — "Quy định về trình bày khoá luận tốt nghiệp cử nhân luật": mở đầu 6 mục; ≥ 2 chương, mỗi chương ≥ 2 mục, có "Kết luận chương"; TNR 13, dòng 1.3, lề 2/2.5/3.5/2; 40–50 trang; footnote liên tục, "tlđd"; danh mục tách A. VBQPPL / B. Tài liệu tham khảo.
- ĐH Cần Thơ, Khoa Luật — hướng dẫn 10/2025: VBQPPL xếp theo hiệu lực pháp lý cao → thấp; văn bản hết hiệu lực ghi rõ; danh mục án lệ, bản án riêng; footnote cỡ 10.

Task 1: xong — (chỉ sổ việc)
Task 2: bắt đầu — base 0f50223
Task 2: xong — 2331e72 (kiem_tra_skill.py XANH, 11 unit test OK)
Task 3: bắt đầu — base 2331e72
Task 3: xong — 6593cdf (vi-du/giao-dich-nguoi-co-lien-quan: pha 0–4; script bắt đủ [CẦN KIỂM] còn mở)
Task 4: xong — zip ở scratchpad (21 mục), không commit file nhị phân; `npm run ci` exit 0

Quyết định: không chạy pressure-test bằng subagent theo superpowers:writing-skills — vì Hào cấm subagent — sai thì tốn: lỗi diễn giải skill chỉ lộ khi dùng thật.
Quyết định: không đưa "bài mẫu đạt giải" vào skill — vì không tìm được toàn văn công khai; chỉ dùng tiêu chí chấm có nguồn — sai thì tốn: thiếu ví dụ văn phong.

Rút kinh nghiệm: chạy thử phát hiện trang thứ cấp (mylaw.vn) ghi sai ngày hiệu lực Luật 76/2025/QH15 → đã bổ sung quy tắc "ngày hiệu lực lấy từ chính văn bản" và "kiểm văn bản hợp nhất" vào references/nguon-tra-cuu.md. Không có task phải làm lại.
Rút kinh nghiệm: nguyên văn Điều 10 TT 45/2020 chưa đọc được (thuvienphapluat link 404) → thang điểm Bộ đang ghi "theo bản dẫn của các trường", lần sau thử vbpl.vn hoặc moet.gov.vn PDF.

## Phiên tiếp (Hào: "làm")
Task 5: bắt đầu — base 371af63
- Đối chiếu nguyên văn TT 45/2020 (thuvienphapluat.vn …-458259.aspx): thang điểm đề tài SV ở **Điều 13 khoản 2** (không phải Điều 10 — Điều 10 là tính hợp lệ hồ sơ). Khung xét giải Điều 13 k3 (≥ 85 vào chung khảo). Điều 4 k2 điểm b: "ít nhất 01 năm" + các hình thức công bố (baochinhphu.vn 20/02/2025).
- Cờ: thuvienphapluat liệt kê "văn bản liên quan" ban hành 12/08/2026, chưa xem được → ghi cảnh báo trong tieu-chi-cham.md.
Rút kinh nghiệm: vòng 2 lần trước gán nhầm thang điểm cho "Điều 10" vì dựa câu chữ Công văn ("đáp ứng quy định tại Điều 10") — phải đọc mục lục văn bản gốc trước khi gán số điều.
Task 5: xong — 5f8d625

## Phiên lặp tự chấm (Hào: "làm tất cả, thử 1 đề tự chấm, tìm ngách, cải thiện, lặp 2–3 lần")
Task 6: bắt đầu — base e693567
- Vòng 1 (b95fdf5): chạy pha 2–7 trên đề tài mẫu → phát hiện ngách "chấp thuận theo hạn mức" qua hỏi đáp Bộ Tài chính, kết luận thanh tra UBCKNN, tài liệu ĐHĐCĐ. Tự chấm 55/100. Lỗi: sai khoản (k4↔k5 Điều 167, từ vòng 0), bỏ sót trả lời chính thức, phụ lục không tồn tại, nhầm giá trị pháp lý của hỏi đáp.
- Sửa skill 1 (4def75b): references/tim-ngach.md (7 nguồn tín hiệu, phép thử 4 điều kiện, quay lại pha 1); kiểm phản chứng bắt buộc ở pha 6; nguyen-van.md; bảng giá trị pháp lý nguồn; script bắt "Phụ lục N" hỏng.
- Vòng 2 + sửa skill 2 (413f82f): 67/100. Lỗi: suýt nhận tính mới cho kiến nghị đã có (Huyền 2025); gán lời người hỏi thành lời Bộ; dịch "circular" thành "thông tư"; chọn Delaware theo thói quen → skill thêm cột "Kiến nghị đã đưa ra" + kiểm trùng, quy tắc hỏi đáp, chọn hệ thống so sánh theo câu hỏi, quy tắc dịch.
- Vòng 3 + sửa skill 3: 71/100. Lỗi: trích vế nguồn bị cắt; tự sửa chữ trong ngoặc kép → script --nguyen-van (trích dẫn phải có trong file nguyên văn), 22 unit test.
Nguồn mới đã kiểm: Luật 76/2025/QH15 (không sửa Điều 167, k23 Điều 4); NĐ 245/2025/NĐ-CP (k84 Điều 1 sửa k3–5 Điều 293); VBHN 67/VBHN-VPQH; SGX Rule 920; HKEX 14A.53; Directive 2017/828 Điều 9c(4)(5)(8) (EUR-Lex).
Quyết định: dừng ở vòng 3 — vì điểm còn thiếu (dữ liệu N ≥ 20, công bố) không cải thiện được bằng viết; vòng 4 sẽ phải bịa dữ liệu — sai thì tốn: không.
Rút kinh nghiệm: tự chấm có thiên lệch (người viết tự chấm); vòng 1 đáng lẽ phát hiện được trả lời của Bộ nếu đọc hết trang nguồn đã dẫn ngay từ đầu → skill nay bắt đọc phần "Trả lời" trước khi dẫn.
Task 6: xong — 87b5e5a

## Phiên đề thứ hai (Hào: "tiếp tục làm thêm đề, kiểm, tìm ngách rồi cải thiện")
Task 7: bắt đầu — base 16c5980 — đề mẫu 2: bảo vệ dữ liệu cá nhân của người lao động (ngành luật lao động + dữ liệu, kiểm skill ngoài luật doanh nghiệp)
- Đề 2 "bảo vệ dữ liệu cá nhân của người lao động": pha 0–7, 2 vòng, tự chấm 58 → 71. Ngách N1' (chuẩn "biết rõ" khi giám sát bằng công nghệ, sau NĐ 330/2026). Nguồn đã kiểm: Luật 91/2025/QH15 (26/6/2025, hiệu lực 01/01/2026); NĐ 356/2025/NĐ-CP (thay NĐ 13/2023 từ 01/01/2026); NĐ 330/2026/NĐ-CP (19/8/2026); dự thảo Luật 2024 Điều 26 k6 ("biết rõ và đồng ý" → bị bỏ); WP29 Opinion 2/2017; Bărbulescu [GC] 2017.
- Sửa skill (bài học 12–18): tim-ngach.md lên 9 nguồn tín hiệu (bất đối xứng câu chữ; dự thảo so với bản thông qua) + khoảng trống thời gian; phép thử tính mới tính cả bài thực hành; cổng pha 2 cần ≥ 5 nguồn học thuật + cột ngày đăng; kiểm phản chứng gồm dự thảo; không chép dẫn chiếu sai của nguồn; script lỗi `ghi-chu-ngoac-vuong` (24 test).
Rút kinh nghiệm: ở đề 2 chính tôi bỏ bước kiểm phản chứng dù skill đã bắt buộc → luật viết ra chưa đủ, cần cổng có thứ kiểm được. Lần sau nên cân nhắc thêm vào script: hạn chế chưa có nguồn "phản chứng" thì báo.
Task 7: xong — (commit tiếp theo)

## Phiên đề 3 (Hào: "làm")
Task 8: bắt đầu — base a48c2ba — (1) script kiểm phản chứng ở mục 'hạn chế'; (2) đề mẫu 3 mảng hình sự, thử phân tích bản án
