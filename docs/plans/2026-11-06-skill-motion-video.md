# Skill `motion-video` — sổ việc và rút kinh nghiệm

06/11/2026 · Nhánh `feat/skill-motion-video` · Giao: `.claude/skills/motion-video/` + gói zip để tải lên claude.ai (Cài đặt → Skills).

## Phạm vi đã duyệt

Skill dựng motion video 60 fps Full HD từ con số 0:
- tự khảo sát nguồn, chọn câu chuyện, bố cục, phong cách;
- đo nhịp nhạc;
- lấy asset thật;
- dựng bằng template Remotion điều khiển bằng `storyboard.json`;
- tự kiểm.

Tiêu chí xong: dựng được video chủ đề khác video Luyện Luật (explainer ngang 16:9), ra MP4 60 fps không lỗi viền, cắt cảnh theo lưới nhịp.

## Rút kinh nghiệm từ phiên làm video giới thiệu Luyện Luật (05–06/11)

| Sai lầm | Hậu quả | Thành luật/công cụ trong skill |
|---|---|---|
| Đọc `rank.ts` cũ, đưa "Trạng nguyên" lên video | thông tin sai trên bản 1 | luật cứng 1: code đang chạy > spec mới nhất > README; `FACTS.md` có nguồn từng dòng |
| Đoán bài nhạc có intro im rồi drop | bản 2 lệch cấu trúc bài | `do_nhip.py` đo trên bản nghe thử chính thức; đối chiếu BPM với cơ sở dữ liệu |
| Tự sáng tác nhạc phonk bằng code làm nhạc nền | không ai nghe kiểm được | nhạc tổng hợp chỉ là "nhạc dò nhịp", ghi nhãn |
| `page.clock.install()` vẫn trôi giờ thật | bản quay animation trắng, tự đóng | `quay_web.mjs` dùng `pauseAt` |
| Sửa file khi harness Vite đang chạy | bản quay hỏng do tải lại trang | harness `hmr: false, watch: null`; không sửa file khi quay |
| Chụp component khi `body` còn nền | viền nền giấy ở góc bo | ép nền trong suốt + `omitBackground`, scale 3 |
| Truyền props khác cách sản phẩm truyền | tủ trưng bày sai trang phục | đọc component cha, truyền y hệt |
| Tách màu RGB bằng 3 bản sao cả khung + lọc SVG | render ước tính hơn 2 giờ | tách màu bằng `text-shadow` trên chữ; bảng hiệu năng |
| Dùng `@remotion/effects` (light leak WebGL) | lỗi "No supported implementation" khi không có GPU | hiệu ứng tự làm bằng CSS |
| Light leak trên nền giấy sáng | khung trắng loá | chỉ dùng trên nền tối |
| Glow, hạt bay, nền xanh đen trống, chip bo tròn | "chưa đủ wow": các dấu hiệu video máy tạo | danh sách CẤM (phỏng theo HyperFrames), `theme.decor` tắt mặc định |
| Ghi timesnap là MIT | sai giấy phép (thực tế BSD-3-Clause) | `NOTICE.md` ghi đúng; README/capture của `tools/video` cần sửa ở nhánh video |

## Chạy thử (thay cho kiểm thử bằng subagent)

Skill `writing-skills` khuyên kiểm thử bằng subagent, nhưng Hào yêu cầu không dùng subagent. Thay vào đó, mình tự dùng skill dựng một video mới, chủ đề "Đặt cọc", khổ 16:9, xem `examples/giai-thich-dat-coc-16x9/`. Những gì lần chạy thử bắt được và đã sửa:
- thẻ kiến thức dày gấp 2,7 lần thời gian đọc: script kiểm cảnh báo;
- chữ khổ ngang nhỏ, nhiều khoảng trống chết;
- vòng bìa 3D bị cắt;
- điện thoại tràn khung ngang;
- chữ tối trên nền tối;
- `do_nhip.py` nhận nhầm 2/3 tempo với nhạc có chùm ba; tính nhầm đoạn lắng cuối bài là "bass tắt".

Hạn chế còn lại: chưa có người khác (hoặc agent độc lập) thử skill từ con số 0. Lần dùng thật đầu tiên nên ghi lại chỗ vấp để sửa skill.
