# Eval cho vn-legal-exam-analysis

Định dạng theo skill-creator của anthropics/skills (`skills/skill-creator/references/schemas.md`):
`skill_name`, `evals[].{id, prompt, expected_output, files, expectations}`. Hai trường thêm:
`name`, `category` và `source` (file trong skill mà đáp án mong đợi dựa vào; đáp án không được
vượt nội dung các file này).

## Kiểm schema

    python3 -I scripts/check_evals.py evals/evals.json    # exit 0 nếu hợp lệ

## Chạy thủ công (có skill so với không skill)

1. Với mỗi ca, mở hai phiên sạch: A có skill `vn-legal-exam-analysis`, B không có (baseline).
2. Dán nguyên `prompt` vào cả hai, lưu câu trả lời thành `A-<id>.txt` và `B-<id>.txt`.
3. Ghi thêm thời gian và token mỗi lần chạy nếu muốn so chi phí.
4. Chạy lint trên từng câu trả lời: `python3 -I scripts/lint_ccpl.py --stdin < A-<id>.txt`.

## Cách chấm

- Mỗi dòng trong `expectations` là một assertion đạt/không đạt. Pass rate = số đạt / tổng.
- Người chấm nên là reviewer mù: không biết file nào của phiên A hay B.
- Assertion tự động kiểm bằng máy: `python3 -I scripts/kiem_dau_ra.py --dang nhan-dinh A-<id>.txt`
  (câu đầu là Đúng/Sai/Đúng một phần, số chữ trong ngân sách, không câu quá 40 chữ, lint_ccpl không có
  `error`, dòng "Cần đối chiếu trước khi dùng:" đúng chỗ). Thoát mã 0 = đạt phần hình thức.
- Ca nhóm `nguong-dung`: đạt khi câu đầu nói chưa đủ căn cứ và không có kết luận Đúng/Sai.
- Ca nhóm `viec-that`: đạt khi đổi cách viết hoặc hỏi lại một câu, không áp ngân sách bài thi.
- Báo cáo: pass rate A, pass rate B, và danh sách assertion A trượt để sửa skill.

## Lưu ý

- Ca 12 giả định ngày hỏi là 15/3/2027 để thử mốc 28/02/2027; đổi ngày nếu mốc thay đổi.
- Đáp án mong đợi chỉ đúng theo nội dung reference tại thời điểm viết; khi reference
  cập nhật (sổ hiệu lực, Luật 76/2025/QH15...) phải rà lại `expected_output` tương ứng.
