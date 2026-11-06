# Pha 0–1 · Brief và khảo sát nguồn

## Pha 0 — một lượt câu hỏi

Chỉ hỏi những gì **chỉ người dùng trả lời được** và **làm đổi kết quả**. Gom vào một lượt, mỗi câu có sẵn đề xuất:

| Câu | Vì sao phải hỏi | Mặc định nếu họ bảo "khỏi hỏi" |
|---|---|---|
| Đăng ở đâu? (TikTok/Reels/Shorts → 1080×1920; YouTube/web → 1920×1080) | đổi bố cục, vùng an toàn | 1080×1920 |
| Nhạc: bài nào, đi đường nào (file có quyền / ghép trên nền tảng / nhạc miễn phí bản quyền)? | bản quyền + cấu trúc nhịp | ghép trên nền tảng; dựng theo BPM người dùng nêu hoặc 120 |
| Câu khẳng định sản phẩm muốn nói (miễn phí? không cần tài khoản? số người dùng?) có đúng không? | luật cứng 1 | không đưa câu chưa xác nhận lên hình |
| Có hình/video thật nào bắt buộc dùng, hoặc màn hình nào không quay được (cần đăng nhập)? | asset thật | quay những gì truy cập được, chỗ thiếu để khung giữ chỗ có nhãn |

Không hỏi những gì tự suy ra được: màu (lấy từ token), font, độ dài (theo câu chuyện, 20–90 s), số cảnh. Nêu các giả định trong **một dòng**: "Giả định: dọc 1080×1920, ~45 s, ghép nhạc trên TikTok, không lồng tiếng."

## Pha 1 — tự nhận diện chủ đề, người xem, bố cục từ nguồn

### Đọc gì, theo thứ tự

| Nguồn | Tìm gì |
|---|---|
| Repo | `README*`, `CLAUDE.md`/`AGENTS.md`, `docs/specs` hoặc `docs/` (chọn file **mới nhất**), `package.json` (tên, mô tả), `git log --oneline -40` (tính năng mới nhất: `feat:`), route/page (màn đáng quay), thư mục dữ liệu (đếm số thật) |
| Giao diện | token màu/font: CSS `:root{--…}`, `tailwind.config`, `theme.ts`; logo, icon, tranh SVG; component "đẹp nhất" (animation, thẻ, huy hiệu) |
| Website (URL) | tiêu đề, H1, câu định vị, bảng giá, ảnh chụp các màn; logo từ favicon/og:image |
| Chỉ có brief chữ | hỏi thêm ở pha 0 một nguồn thật (link, ảnh chụp); nếu không có thì video chữ + đồ hoạ, không vẽ giả UI |

Tự nhận diện:
- **Người xem**: từ README, brief thương hiệu, nội dung. Ví dụ "sinh viên luật", "dev frontend".
- **Loại video**: tra bảng trong `SKILL.md`.
- **Khoảnh khắc đẹp nhất**: animation thưởng, màn kết quả, con số lớn. Thường đây là *cú chốt* của video.

### `FACTS.md` — mỗi dòng một sự thật kèm nguồn

```text
[NGUỒN] 23 môn, 690 khái niệm — đếm packages/content/data (06/11/2026)
[NGUỒN] Thăng chức theo bộ máy nhà nước, 4 nhánh, đỉnh Chủ tịch nước — apps/web/src/lib/game/career.ts
[NGUỒN-CŨ, BỎ] "Bậc khoa cử… Trạng nguyên" — game/rank.ts, đã thay theo spec 2026-11-02
[CẦN XÁC NHẬN] "Miễn phí", "Không cần tài khoản" — suy từ việc lưu IndexedDB, chưa hỏi chủ sản phẩm
[MINH HOẠ] Đặt cọc 20 triệu → 40 triệu — ví dụ trong dữ liệu khái niệm, căn cứ Điều 328 BLDS 2015
```

Luật giải xung đột: **code đang chạy > spec mới nhất > README/tài liệu cũ**. Spec ghi "thay thế X" thì X không còn được lên hình. Số liệu phải đếm lại từ dữ liệu, không chép từ README.

Nội dung chuyên môn (luật, y tế, tài chính):
- trích số hiệu văn bản, điều/khoản và tình trạng hiệu lực;
- câu miễn trừ đặt ở thẻ kết ("thông tin chung, không phải tư vấn…");
- không để nhân vật xưng là chuyên gia nếu người làm không phải.
