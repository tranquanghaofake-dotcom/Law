# FACTS — video giới thiệu Luyện Luật (bản 4)

Mọi chữ/số trên hình phải có dòng ở đây. Nguồn theo luật: code đang chạy > spec mới nhất > README.

- [NGUỒN] 23 môn, 690 khái niệm, 212 chương, 47 bộ đề — `scripts/stats.mjs` đếm `packages/content/data`
- [NGUỒN] Đặt cọc: 4 nhánh sơ đồ, mẹo nhớ "Ai bỏ cuộc thì người đó mất…", tình huống 20 triệu → 40 triệu — `packages/content/data/concepts/dan-su-2/dat-coc.json` (memo)
- [NGUỒN] Bộ đề Đặt cọc câu 3: chủ trọ nhận cọc 3 triệu rồi cho người khác thuê → bạn nhận 6 triệu (3 + 3), căn cứ Khoản 2 Điều 328 BLDS 2015 — bản quay `public/cap/quiz-6tr.mp4`
- [NGUỒN] Căn cứ: Điều 328 Bộ luật Dân sự 2015 (Luật số 91/2015/QH13, hiệu lực 01/01/2017, đang có hiệu lực); đáp án bộ đề ghi "Khoản 1 Điều 328 BLDS 2015" — bản quay `public/cap/quiz-dung.mp4`
- [NGUỒN] 6 bậc: gặp → nhận biết → phân biệt → điền → tình huống → tự trả lời — trang Hôm nay của web; bậc ≥ 4 phải qua giãn cách — commit `feat(engine)`
- [NGUỒN] Lịch ôn FSRS (ts-fsrs), Ôn hôm nay ưu tiên khái niệm sắp quên — `apps/web/README.md`, commit `feat(engine)`
- [NGUỒN] Thẻ chuyên cần: 30 ngày một chu kỳ, 27 ký hoạ, màu Đỏ → Xanh lam → Tím → Trắng – đen giao thoa — `apps/web/src/lib/game/card.ts`
- [NGUỒN] Tủ sách theo chương (212), thăng chức theo bộ máy nhà nước 4 nhánh, đỉnh Chủ tịch nước; "Chức danh mô phỏng trong trò chơi học tập, không phải chức vụ thật" — `apps/web/src/lib/game/career.ts`, spec 2026-11-02
- [NGƯỜI DÙNG 06/11/2026] "Miễn phí", "Không cần tài khoản" — Hào xác nhận đúng
- [NGUỒN-CŨ, BỎ] "Bậc khoa cử… Trạng nguyên" — `game/rank.ts`, đã thay
- [DỮ LIỆU DEMO] Màn thắp chuỗi 75 ngày, tủ trưng bày Chủ tịch nước — dựng bằng harness với tiến độ giả, không phải số liệu người dùng
