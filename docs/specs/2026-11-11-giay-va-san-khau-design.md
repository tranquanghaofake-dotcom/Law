# Hướng nghệ thuật "Giấy và Sân khấu" — thiết kế

Ngày 11/11/2026 · nhánh `claude/tender-goodall-vgv6mf` · kế hoạch gốc: `docs/plans/2026-11-11-dot-pha-do-hoa-ux.md`.

**Hào đã quyết trong phiên 11/11:** (1) chọn hướng B; (2) cho vẽ lại khung Hồ sơ; (4) font Anton: "đẹp mắt là được", Claude chọn dùng cho giọng sân khấu. Câu (3) "web phục vụ ai trước" chưa có trả lời, giữ mặc định sinh viên luật theo CLAUDE.md.

Spec này thay bảng màu "Văn Miếu" ở đúng một điểm: bỏ cam đất nung. Giấy, mực, son và tranh kiến trúc giữ nguyên.

## 1. Hai giọng

- **Giấy** (học): nền ngà, nét mực, chữ to, mỗi màn một việc. Bài học, ôn tập, làm đề, tra khái niệm.
- **Sân khấu** (khoảnh khắc): nền mực đêm, quầng son, số cỡ áp phích, dấu mộc. Chỉ cho cuối phiên, thắp chuỗi, lên bậc, thăng chức, màn chào. Không phải chế độ tối: người dùng không bật tắt, màn học không bao giờ tối.

## 2. Token màu (`apps/web/src/app.css`, khối `:root` đầu file)

| Token | Giá trị | Vai | Tương phản |
|---|---|---|---|
| `--ink` | `#0c1222` | chữ, nét, viền focus | |
| `--paper` | `#f2eee4` | nền trang | |
| `--card` | `#fffdf6` | mặt thẻ; nền cả màn trong phiên học | |
| `--line` | `#e2dac8` | nét nhạt | |
| `--accent` | `#f6b93b` | **chỉ làm nền**: nút chính, thanh tiến độ, vệt dạ quang | 1,7:1 trên giấy, nên cấm dùng cho chữ và nét mảnh |
| `--accent-line` | `#b8791a` | viền và nét mang nghĩa trạng thái (đang chọn, đang học) | 3,5:1 trên giấy ngà |
| `--accent-text` | `#8a5a00` | chữ màu nhấn | 5,7:1 trên giấy ngà, 5,1:1 trên nền trang |
| `--seal`, `--bad`, `--ok` | giữ như cũ | dấu, sai, đúng | đã đạt từ trước, không đổi để khỏi phát sinh lỗi |

Khác với áp phích ở hai chỗ, có chủ ý: nền trang nhạt và ít vàng hơn `#f4eddc` của áp phích (bản thử đầu dùng đúng màu đó thì cả trang ngả vàng một màu, vệt hổ phách chìm mất); quầng sau tranh đầu trang pha từ son (`--glow`) thay cho vàng, đúng "quầng son" của sân khấu.

**Luật dùng màu nhấn.** Viết `var(--accent)` chỉ trong `background`, gradient, `box-shadow` lớn. Viền, nét, `stroke` dùng `--accent-line`. Chữ dùng `--accent-text`. Lần đổi này đã chuyển 40 chỗ viền và 5 chỗ chữ.

## 3. Vai chữ

- Be Vietnam Pro: giao diện, lời giải thích và **mọi tiêu đề** (`--font-display` trỏ về `--font-ui`).
- Noto Serif: chỉ cho nguyên văn điều luật (`--font-quote`), để phân biệt "lời của luật" với "lời diễn giải".
- Anton: để dành cho giọng sân khấu, cỡ từ 32 px, tối đa 9 chữ. **Chưa nạp** vì chưa màn nào dùng; thêm cùng đợt làm khoảnh khắc sân khấu.
- Noto Serif Display: đã bỏ (xoá file font và `@font-face`).

## 4. Hai chi tiết nhận diện

- **Nút chính** là miếng dán vàng viền mực có bóng cứng 3 px, nhấn thì lún xuống.
- **Mỗi trang một vật chủ đạo** được viền mực 2 px và bóng cứng 5 px. Hiện áp cho thẻ đầu trang Hôm nay (`.stage.hero-card`). Thẻ khác giữ nét nhạt.

## 5. Màn học là một trang giấy (đợt 1, phần đầu — đã làm)

- Trong phiên học cả màn hình là giấy ngà, tắt hoạ tiết mây.
- Thẻ câu hỏi và thẻ giới thiệu không còn khung: câu hỏi nằm thẳng trên trang. Riêng câu vàng vẫn có khung vàng.
- Dải khái niệm của đợt và dòng mẹo **dời xuống dưới** câu hỏi và phản hồi (đổi trong `SessionView.svelte`, thứ tự Tab đi theo). Dải khái niệm thành chữ lặng không khung, mục đang học gạch chân bằng vệt hổ phách.
- Chữ câu hỏi: 19–22 px theo bề rộng điện thoại, 26 px từ 1024 px; đáp án 18 px và cao tối thiểu 60 px ở máy tính.

| Số đo (đo bằng Chromium, phiên Hiến pháp bài 1) | Trước | Sau |
|---|---|---|
| Câu hỏi bắt đầu, 390 × 844 | y = 264 (31% màn) | **y = 102 (12%)** |
| Câu hỏi bắt đầu, 1280 × 800 | y = 220 (28%) | **y = 98 (12%)**; riêng câu vàng y = 156 (20%) vì còn nhãn và khung |
| Khung có viền ở màn đầu, 390 px | 10 | **5** (4 đáp án và 1) |
| Khung có viền ở màn đầu, 1280 px | 11 | 9 (cột "Đợt này" còn 5 khung) |
| Cỡ chữ câu hỏi | 18 px cả hai | **20 px** điện thoại, **26 px** máy tính |

Ảnh sau khi sửa (390 px): [2026-11-11-vong-hoc-390-sau.png](2026-11-11-vong-hoc-390-sau.png); ảnh trước: `docs/plans/2026-11-11-hien-trang-vong-hoc-390.png`.

Mục tiêu "≤ 4 khung" của kế hoạch chưa đạt ở cả hai cỡ; phần còn lại nằm ở cột "Đợt này" và thanh trên, làm ở phần sau.

## 6. Kiểm tra đã chạy

`npm run ci` xanh (269 và 827 test); e2e local 31/31; axe 0 lỗi và không tràn ngang trên 11 màn ở 390 và 1280 px. Bộ e2e axe đã bắt được một lỗi tương phản của nhãn chip sau khi đổi màu, đã sửa.

Chưa kiểm: Safari trên iPhone thật; các dạng thẻ chỉ xuất hiện ở bậc cao (điền chỗ trống, ghép cặp, xếp cột, tự trả lời) mới được chạy qua test, chưa soi bằng mắt.

## 7. Việc tiếp theo, theo thứ tự

1. Đợt 1 phần sau: phản hồi thành tấm trượt từ đáy; màn làm đề (`Quiz10`) dùng cùng trang giấy; cột "Đợt này" ở máy tính bớt khung.
2. Đợt 2: sơ đồ thật từ dữ liệu `memo`.
3. Đợt 3: trang môn thành mục lục.
4. Đợt 4: khoảnh khắc sân khấu, nạp Anton.
5. Đợt 5: dọn mũi tên, dấu chấm giữa, nhãn nhỏ.
6. Đợt 6: vẽ lại khung Hồ sơ (đã được Hào cho phép).

## 8. Ghi chú cho người sửa sau

- Thứ tự làm khác kế hoạch: nền móng màu và chữ được làm **trước** đợt 1, vì token dùng chung toàn web; làm màn học theo màu mới trong khi phần còn lại vẫn cam thì web sẽ hai màu.
- Dòng "không đổi bảng màu Văn Miếu nếu spec không yêu cầu" trong CLAUDE.md vẫn đúng tinh thần; tên bảng màu nay là "Giấy và Sân khấu". Chưa sửa CLAUDE.md, chờ Hào.
