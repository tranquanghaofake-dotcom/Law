# Nguồn tham khảo và giấy phép

Skill này tự viết. Các nguồn dưới đây được **tham khảo ý tưởng**; không chép nguyên văn mã.

| Nguồn | Giấy phép | Học gì |
|---|---|---|
| HeyGen HyperFrames — `skills/hyperframes` (story.md, spec.md, motion.md, review.md, sound.md, types/*) · github.com/heygen-com/hyperframes | Apache-2.0 | quy trình câu chuyện → spec bằng số → soát; danh sách dấu hiệu video do máy tạo; easing theo vai trò, chuyển cảnh có nguyên nhân; vùng an toàn dọc; mức âm thanh. Các đoạn phỏng theo có ghi rõ ở đầu file tham chiếu tương ứng; lời văn viết lại bằng tiếng Việt, rút gọn và điều chỉnh. |
| HeyGen HyperFrames — `.claude/skills/motion-doctrine`, `cut-the-curve`, `seam-craft`; registry `beat-freeze-cut`, `editorial-flash-overlay` | Apache-2.0 | luật vector, cut-the-curve (thông số), dấu Z, cấm rung lắc vô cớ, impact freeze, flash ấm — viết lại trong `references/8-ky-thuat-edit.md` và `template/src/core/fx.tsx` |
| Bài hướng dẫn speed ramp/velocity edit (DJordanMedia 2026, CapCut guide 2026, ClipCreator 2026) | bài viết công khai | chỉ đọc thông số (tỉ lệ tốc độ, số khung) |
| Yanndotai/brutalist-video-editing-skill (README) | chưa rõ giấy phép | chỉ tham khảo khái niệm phổ biến (flash frame, posterize, stutter), không chép mã |
| tungs/timesnap · github.com/tungs/timesnap | BSD-3-Clause | quay trang web theo thời gian ảo. `scripts/quay_web.mjs` tự viết lại bằng Playwright clock, bổ sung phần dừng CSS/Web Animations và SMIL. |
| SeeCut · github.com/YeJe-cpu/SeeCut và bản phái sinh tiếng Việt seecut/luancut/papercut/motioncut (bộ skill người dùng gửi, 11/2026) | PolyForm Noncommercial 1.0.0 (SeeCut); motioncut/papercut không ghi rõ giấy phép | **chỉ ý tưởng, không chép mã**: neo chữ vào thời điểm từ khoá; khớp kịch bản vào giọng có sẵn; kiểm hình học bằng hộp phần tử (đè, trống, phủ ≥ X %), lỗi phải kéo dài mới tính; danh sách lỗi cứng có mã + "dấu vân tay" + so cặp đổi chỗ A/B, tối đa v3, bản cũ thắng thì giữ; luật ảnh bằng chứng (cắt sát, bỏ chữ nhạy cảm, không vượt CAPTCHA); lỗi ffmpeg `-shortest`/`-vsync`. `canh_giong.py`, `kiem_tra_bo_cuc.mjs`, `core/probe.tsx` viết mới. |
| faster-whisper · github.com/SYSTRAN/faster-whisper; mô hình Whisper (OpenAI) | MIT | `canh_giong.py` gọi thư viện nếu máy đã cài; không đóng gói thư viện hay mô hình. |
| Remotion · remotion.dev | Remotion License (miễn phí cho cá nhân và nhóm ≤ 3 người) | khung dựng video bằng React; template dùng `remotion`, `@remotion/media`, `@remotion/google-fonts`. |
| Kenney — Interface Sounds · kenney.nl | CC0 | 5 tiếng hiệu ứng trong `template/public/sfx/` (xem LICENSE.txt). |
| Bộ icon `template/src/icons.json` | tự vẽ cho dự án Luyện Luật (chủ sở hữu skill) | lưới 24, nét mảnh. |
| Font qua Google Fonts (Be Vietnam Pro, Noto Serif Display, Inter, Montserrat, Lexend, Playfair Display) | SIL OFL 1.1 | font có bộ chữ tiếng Việt. |

Trích một phần Apache-2.0 §4: khi phân phối lại tác phẩm phái sinh, giữ thông báo bản quyền và ghi rõ đã sửa đổi. Skill này dùng ý tưởng, không phân phối lại tệp của HyperFrames.
