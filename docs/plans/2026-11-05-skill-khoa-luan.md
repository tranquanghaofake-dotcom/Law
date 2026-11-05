# Sổ việc — Skill làm tiểu luận / khoá luận / NCKH luật (chuẩn dự giải)

Yêu cầu: xây 1 skill đưa một đề tài luật từ 0 → hoàn thành (thẩm định đề tài, tổng quan, khung lý thuyết, đề cương, viết chương, phản biện, hoàn thiện). 4–5 vòng nghiên cứu.
Nhánh: claude/academic-thesis-writing-skill-m46l56 · Ngân sách: ~2 giờ, 0 subagent.

Quyết định: tự làm, không fan-out — vì CLAUDE.md cấm fan-out cho việc < 1 ngày — sai thì tốn thêm ~1 giờ.
Quyết định: đối tượng (c) khoá luận + NCKH dự giải, tiểu luận là bản rút gọn; chuẩn trình bày chung (chưa có quy định trường) — vì Hào chọn mặc định.
Quyết định: kiểm thử skill bằng chạy thử trên 1 đề tài mẫu do agent chính tự làm, không dùng subagent pressure-test — vì Hào không cho dùng subagent.

## Task
| # | Việc | File | Kiểm tra | Trạng thái |
|---|---|---|---|---|
| 1 | 5 vòng nghiên cứu, ghi link | sổ việc này | có ≥ 5 mục vòng | |
| 2 | Viết SKILL.md + references/ + script kiểm tra | .claude/skills/khoa-luan-luat/** | python3 .claude/skills/khoa-luan-luat/scripts/kiem_tra_skill.py xanh | |
| 3 | Chạy thử trên đề tài mẫu → đề cương | scratchpad | file đề cương đủ mục theo checklist | |
| 4 | Đóng gói .zip, commit, push | dist zip | unzip -l | |

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
