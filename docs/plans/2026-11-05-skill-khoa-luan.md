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
