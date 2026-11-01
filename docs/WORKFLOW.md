# Quy trình làm việc — Luyện Luật

Phiên bản 1.0 · 01/11/2026. Áp dụng cho người (Hào) và cho phiên Claude. Mục tiêu: **mỗi thay đổi lên web trong vòng vài phút, mỗi phiên làm việc có giới hạn thời gian rõ**, không lặp lại tình trạng một phiên kéo dài hàng giờ.

## 1. Bản đồ repo

```
apps/web/            @luyen-luat/web      ứng dụng Svelte 5 + Vite (PWA), deploy lên GitHub Pages
packages/content/    @luyen-luat/content  dữ liệu luật (data/), schema zod, script kiểm tra → dist/
tools/               script hỗ trợ (chụp ảnh màn hình 4 kích cỡ)
docs/specs/          thiết kế đã duyệt (nguồn sự thật về "làm gì, vì sao")
docs/plans/          kế hoạch triển khai từng đợt
docs/decisions/      ADR — quyết định kiến trúc, mỗi file một quyết định
docs/brand/          brief thương hiệu cá nhân
.github/             CI, deploy, e2e, template PR/issue, dependabot
CLAUDE.md            luật cho phiên Claude (đọc trước mọi việc)
```
Phần video TikTok và web v1 nằm ở nhánh [`archive`](https://github.com/tranquanghaofake-dotcom/Law/tree/archive/archive), không còn trên `main`.

## 2. Lệnh chuẩn (chạy ở gốc repo)

| Lệnh | Việc | Thời gian tham chiếu |
|---|---|---|
| `npm install` | cài một lần cho cả workspace | ~30 s |
| `npm run dev` | build nội dung rồi mở http://localhost:5173 | 2 s |
| `npm run content` | kiểm tra JSON luật, sinh `packages/content/dist` | < 1 s |
| `npm run check` | `tsc` (content) + `svelte-check` (web) | ~6 s |
| `npm test` | unit test cả hai package | ~4 s |
| `npm run build` | build web (tự chạy content trước) | ~5 s |
| `npm run ci` | đúng chuỗi CI chạy: content → check → test → build | ~20 s |
| `npm run e2e` | Playwright vào bản build local (`PW_CHROMIUM=…` nếu Chromium ở chỗ riêng) | ~1 phút |
| `npm run shots` | chụp Hôm nay/Phiên học/Quiz/Hồ sơ ở 390·820·1280·1440 → `tools/shots/` | ~15 s |

Build cho Pages: `BASE_PATH=/Law/ npm run build`.

## 3. Nhánh, PR, merge (trunk-based)

1. **Một việc = một nhánh ngắn** từ `main`: `feat/<việc>`, `fix/<việc>`, `content/<môn-hoặc-chủ-đề>`, `docs/<việc>`, `chore/<việc>`. Nhánh sống ≤ 2 ngày; việc lớn chia nhỏ theo `docs/plans/`.
2. Commit nhỏ, thông điệp tiếng Việt có dấu, dạng `loại(phạm vi): việc` — ví dụ `content(hien-phap): thêm 5 khái niệm chương 2`.
3. Push → **mở PR** theo template. CI (`ci.yml`) chạy: content → check → test → build, mục tiêu **< 2 phút**.
4. CI xanh + tự xem lại diff → **merge** (merge commit, tiêu đề = tiêu đề PR; đây là changelog). Không rebase/force-push nhánh của người khác.
5. Merge vào `main` → `deploy.yml` tự chạy khi `apps/web/**` hoặc `packages/content/**` đổi (**< 1 phút**) → web mới tại https://tranquanghaofake-dotcom.github.io/Law/.
6. Sau deploy, `e2e.yml` chạy Playwright vào bản live. Đỏ = mở issue và sửa bằng PR mới, không rollback thủ công (trừ khi web không mở được: revert merge commit).

**Bật bảo vệ nhánh một lần** (GitHub → Settings → Branches → Add rule cho `main`): ☑ Require a pull request before merging (0 approvals là đủ khi làm một mình) · ☑ Require status checks to pass → chọn `Nội dung · kiểu · test · build` · ☑ Do not allow bypassing (tuỳ chọn). Sau đó không ai push thẳng `main`, kể cả Claude.

## 4. Cập nhật nội dung luật

1. Nhánh `content/<môn>`. Sửa/thêm JSON trong `packages/content/data/` (mẫu: `concepts/hien-phap/hien-phap.json`). Bắt buộc: `definition` nguyên văn, `source` + link vbpl.vn, `checked` = ngày đối chiếu, ≥ 1 item bậc 1/3/4.
2. `npm run content` — lỗi được liệt kê bằng tiếng Việt, **file lỗi không lên web**. Ghi nguồn vào `data/SOURCES.md`.
3. Test nguyên văn (`packages/content/tests/`) so khớp với `data/laws/*.txt`; môn mới thêm file luật + test tương ứng.
4. PR → CI → merge → live. Không cần đụng `apps/web`.

## 5. Thay đổi giao diện / logic

1. Có spec trong `docs/specs/` (từ brainstorming) trước khi code; việc > 1 ngày phải có `docs/plans/`.
2. TDD cho engine/store/content; UI test bằng Testing Library cho thẻ bài tập; layout kiểm bằng `npm run shots` + e2e.
3. Trước khi push: `npm run ci` xanh; đổi layout thì đính ảnh 390 px và 1280 px vào PR.
4. Accessibility: focus ring, tương phản AA, `prefers-reduced-motion` — kiểm bằng skill `design:accessibility-review` trước khi phát hành đợt lớn.

## 6. Ngân sách thời gian cho phiên Claude (chống "mất hàng giờ")

| Quy tắc | Lý do |
|---|---|
| **1 phiên = 1 issue/1 nhánh**, phạm vi ghi ở đầu phiên | tránh phình việc |
| Đọc `CLAUDE.md` + spec liên quan thay vì khảo sát lại toàn repo | tiết kiệm 10–20 phút đầu |
| Đang sửa: chỉ chạy test liên quan (`npx vitest run <file>` hoặc `vitest related`) | full suite chỉ ~4 s nhưng thói quen đúng khi suite lớn |
| Full `npm run ci` **một lần** trước push | đủ để CI xanh |
| **Không chạy e2e local** trừ khi sửa luồng UI hoặc cấu hình Playwright | tiết kiệm ~1 phút/lần, CI đã chạy sau deploy |
| Không fan-out nhiều agent cho việc < 1 ngày | tốn token, khó theo dõi |
| Commit checkpoint ≤ 45 phút/lần, push sớm | mất container không mất việc |
| **Quá 2 giờ: dừng, báo cáo đã làm gì / vướng gì / đề xuất**, không tự kéo dài | người quyết định tiếp |
| Việc tốn > 3 phút máy (cài đặt, build lớn) chạy nền và làm việc khác | không ngồi chờ |

## 7. Phát hành & phiên bản

Không tag, không changelog riêng: `main` luôn là bản live; lịch sử merge commit là changelog. `version` trong `package.json` tăng số giữa (2.1 → 2.2) khi có đợt tính năng lớn, ghi trong tiêu đề merge.

## 8. Phụ thuộc

Dependabot mở **một PR gộp mỗi tháng** (minor/patch) cho npm và GitHub Actions. Merge khi CI xanh; major xem riêng.
