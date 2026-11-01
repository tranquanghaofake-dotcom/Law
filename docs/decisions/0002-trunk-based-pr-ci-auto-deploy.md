# ADR-0002 — Trunk-based: nhánh ngắn → PR → CI → merge → auto deploy; e2e sau deploy

Ngày: 01/11/2026 · Trạng thái: chấp nhận · Người quyết định: Trần Quang Hào (đề xuất: Claude)

## Bối cảnh
Một người (+ Claude) phát triển; web tĩnh trên GitHub Pages (`github.io/Law`, giữ nguyên, chưa domain riêng); CI deploy hiện ~40 s. Kinh nghiệm dự án trước (Linggango wiki): quy trình không có giới hạn khiến một phiên kéo dài hàng giờ.

## Quyết định
- `main` luôn là bản live. Mọi thay đổi qua nhánh ngắn + PR; bật branch protection yêu cầu check `CI` xanh.
- `ci.yml` (PR/mọi nhánh): content → check → test → build, một job, cache npm, **mục tiêu < 2 phút**, `cancel-in-progress`.
- `deploy.yml` (push `main`, lọc path app/content): test + build + Pages, **mục tiêu < 1 phút**.
- `e2e.yml`: Playwright chạy **vào bản đã deploy** sau `Deploy` thành công (hoặc bấm tay); không chặn PR để PR không phải cài trình duyệt (~1 phút).
- Không staging, không tag/release, không changelog riêng; tiêu đề merge commit là changelog.
- Không ESLint/Prettier: `svelte-check` + `.editorconfig` đủ cho một người, tránh +20 s CI và diff ồn.
- Ngân sách thời gian cho phiên Claude ghi trong `docs/WORKFLOW.md` §6 và `CLAUDE.md`.

## Hệ quả
+ Thay đổi nhỏ lên web trong ~3 phút kể cả CI; lỗi e2e không làm chậm deploy.
− Lỗi chỉ e2e bắt được sẽ lên live trước khi phát hiện (chấp nhận vì unit test + build đã chặn phần lớn; revert merge commit là đủ).
