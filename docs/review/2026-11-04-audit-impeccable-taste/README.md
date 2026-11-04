# Audit giao diện toàn web theo impeccable + taste-skill — 04/11/2026

Đây là bản audit, chưa sửa code. Phạm vi gồm 12 màn: 11 route trong `apps/web/src/lib/router.svelte.ts`, cộng màn danh mục khái niệm. Biến thể `#/on/:subject` không chấm riêng.

Theo yêu cầu của Hào, bảng màu và brand cũng bị chấm thẳng, kết quả gom ở mục [BRAND] bên dưới.

## Nguồn tiêu chí

- [pbakaus/impeccable](https://github.com/pbakaus/impeccable): `reference/audit.md` chấm 5 chiều, mỗi chiều 0–4, tổng /20, xếp lỗi P0–P3; `reference/critique.md` chấm Nielsen /40, cognitive load, persona; `reference/craft-floor.md` liệt kê các mặc định cần tránh.
- [leonxlnx/taste-skill](https://github.com/leonxlnx/taste-skill): `skills/taste-skill/SKILL.md` và `references/` (tells, type, colour, layout, motion, copy, app-screens, critique).
- Bộ tiêu chí đã chưng cất, có mã để trích dẫn: [tieu-chi.md](tieu-chi.md).

## Cách đo và giới hạn

- **Không chạy được detector của impeccable** (`scripts/impeccable detect`). Môi trường chặn chạy binary tải từ ngoài, nên IMP-A5 được chấm bằng đọc code.
- Thay vào đó dùng script Playwright tự viết, nằm trong [do-dac/](do-dac/), chạy với Chromium 390/320/640/1280 px.
- Các phép đo gồm: contrast tính bằng màu đã render, kích thước vùng bấm, reflow, thứ tự Tab, `prefers-reduced-motion`, request mạng, đi trọn một phiên quiz và một phiên bài học.
- Chưa kiểm: máy thật hoặc cảm ứng thật, trình đọc màn hình, Safari/Firefox, offline, các trạng thái có dữ liệu ở Hôm nay, rail ≥ 1440 px, thẻ cloze/sort/match/pair/recall.
- Web không có dark mode (`app.css:3` `color-scheme: light`). Ảnh chụp ở chế độ dark chỉ dùng để xác nhận điều này nên không đưa vào repo.

## Chi tiết từng màn

- [nhom-a.md](nhom-a.md): Hôm nay, Môn học, Trang môn, Danh mục khái niệm, Khái niệm, Luyện đề, Shell/nav.
- [nhom-b.md](nhom-b.md): Quiz, Bài học, Ôn tập, Hồ sơ, Cài đặt, 404.
- Ảnh dẫn chứng nằm trong [anh/](anh/).

## Điểm từng màn

Thang impeccable audit tính trên /20. Nielsen tính trên /40; màn nào H5 không áp dụng được (n/a) thì quy về /36. Hai thang này không cộng với nhau.

| Màn | Route | impeccable /20 | Nielsen |
|---|---|---|---|
| Hôm nay | `#/` | 14 Good | 25/36 |
| Môn học | `#/mon` | 14 Good | 27/36 |
| Trang môn | `#/mon/:môn` | 14 Good | 28/40 |
| Danh mục khái niệm | `#/mon/:môn/khai-niem` | 13 Acceptable | 27/36 |
| Khái niệm | `#/mon/:môn/khai-niem/:id` | 12 Acceptable | 24/36 |
| Luyện đề | `#/luyen-de` | 14 Good | 26/36 |
| Quiz | `#/bo/:id` | 14 Good | 29/40 |
| Bài học | `#/hoc/:môn/:bài` | 13 Acceptable | 28/40 |
| Ôn tập | `#/on` | 14 Good | 28/40 |
| Hồ sơ | `#/toi` | 12 Acceptable | 23/36 |
| Cài đặt | `#/cai-dat` | 13 Acceptable | 28/40 |
| 404 | (route không có) | 15 Good | 29/36 |

**Điểm taste-skill (TS-F4):** cả 12 màn bị chặn trần ở 6,5/10, điểm thô là 7,1–7,6. Trần áp vì màn nào cũng có `.card` đổ bóng ở trạng thái nghỉ (`app.css:113`), và hầu hết có kicker/eyebrow.

**Implementation Integrity: ĐẠT một phần.** Hệ hình ảnh rất đặc thù sản phẩm và token nhất quán. Nhưng còn lỗi lặp có hệ thống HT1, HT2, HT3 (bàn phím, focus) và HT6, HT13 (mặc định generic).

**Số lỗi (không tính các mục [BRAND]):**
- Lỗi hệ thống: 3 P1, 9 P2, 2 P3.
- Lỗi riêng nhóm A: 4 P1, 24 P2, 12 P3.
- Lỗi riêng nhóm B: 1 P1, 14 P2, 10 P3.
- Không có lỗi P0 nào.

## Lỗi hệ thống (mỗi lỗi chỉ ghi ở đây một lần, kèm mức P thống nhất)

| Mã | Mức | Lỗi | Vị trí chính |
|---|---|---|---|
| HT1 | P1 | Enter/Space bị bắt toàn cục trong phiên học. Enter trên link Thoát hoặc "Xem nguyên văn" không chạy đúng mà lại trả lời thẻ hoặc chuyển câu. Enter trên nút phương án không chọn được. Space bị chiếm khi máy có TTS. Hộp Thoát mở bằng Esc thì focus nằm ở `body`. (WCAG 2.1.1/2.4.3) | `Quiz10.svelte`, `SessionView.svelte`, `CardIntro.svelte`, `Feedback.svelte`, `CardCloze.svelte:31` |
| HT2 | P1 | Đổi route không chuyển focus và không báo cho trình đọc màn hình. Sau khi trả lời quiz, focus rơi về `body` và nút "Câu tiếp" nằm dưới nếp gấp ở 390×844. (WCAG 2.4.3, 4.1.3) | `router.svelte.ts`, `Shell.svelte:46` |
| HT3 | P1 | Focus ring màu accent `#d97a1e` trên `--paper` chỉ đạt 2,83:1, dưới 3:1. `summary` dùng ring mặc định của trình duyệt. (WCAG 1.4.11) | `app.css:116` |
| HT4 | P2 | Bật `prefers-reduced-motion` thì mọi animation/transition bị tắt hẳn (`none !important`), mất phản hồi chuyển động (thông tin đúng/sai vẫn còn qua màu nền và chữ). Có công tắc "motion-on" làm lối thoát. | `app.css:106-110` |
| HT5 | P2 | Hôm nay chạy 6 vòng lặp trang trí vô hạn (mây, mặt trời, sóng…), không mang thông tin. | `app.css:816-821` (sunspin, drift, sway), `lib/art/kit/kit.css:26-28` (kit-sweep, kit-farcloud), `Clouds.svelte` |
| HT6 | P2 | Eyebrow/kicker IN HOA có ở khắp nơi. Đây là mục duy nhất craft-floor cấm thật sự. Tiếng Việt in hoa có dấu chồng nên khó đọc. | `app.css:235` `.kicker`, `app.css:126` `.section-title` |
| HT7 | P2 | Chữ dưới 12 px: sidebar 10,5 px, gáy sách 5,4–10,5 px, các nhãn 10 px. Thang cỡ chữ ở 1280 px có 9 giá trị. | `app.css:175,185`, `BookSpine.svelte` |
| HT8 | P2 | Hex hard-code ngoài token, tập trung ở tủ gỗ và sidebar. | `app.css:171, 826-834, 305` |
| HT9 | P2 | Ba họ font, nạp từ Google Fonts. Be Vietnam Pro chỉ nạp 400/500/600/800 (`index.html:13`), trong khi khoảng 100 chỗ khai báo 700 hoặc `<b>`/`<strong>`. Trình duyệt sẽ lấy mặt 800 thay cho 700, nên thang đậm nhạt thực tế khác với code. Chưa kiểm font khi offline. | `index.html:13`, `app.css` |
| HT10 | P2 | Lưu ý "thông tin pháp luật chung, không phải tư vấn" chỉ có ở Hồ sơ, không có ở các màn hiển thị nguyên văn luật. | `Profile.svelte:193`, `Concepts.svelte`, `Lesson.svelte` |
| HT11 | P2 | Rời quiz hoặc bài học thì sinh request `/content/sets/undefined.json` và `/content/subjects/undefined.json`, do `$effect` chạy khi `route.params` đã rỗng. Ngoài ra `/tts/manifest.json` 404 (vô hại). | `Quiz10.svelte:41`, `Lesson.svelte:37` |
| HT12 | P2 | Danh mục khái niệm tải 125 file JSON, mỗi khái niệm một file. Tổng request là 135–147 tuỳ cách đếm. | `packages/content` build, `Concepts.svelte` |
| HT13 | P3 | Viền trái màu dày (`.rv`, `.why`, `.quote`, `.note`) đúng là mặc định "AI slop" mà impeccable nêu. | `app.css` |
| HT14 | P3 | Ký tự Unicode (→, §, ✓…) dùng thay icon, mỗi chỗ một kiểu. | nhiều component |

## [BRAND] — palette và nhận diện, chấm thẳng theo yêu cầu

Nhóm này đi ngược mặc định của hai bộ skill nhưng là chủ đích nhận diện "Văn Miếu". Vì vậy chỉ chấm riêng ở đây, không trừ vào điểm từng màn.

- **Tủ gỗ-kính ở sidebar.** Nền tối, bão hoà, skeuomorphic, lặp trên mọi màn ≥ 1280 px. Vùng tối và đậm màu nhất mỗi trang lại là chrome, không phải nội dung (TS-A13, IMP-B7).
- **Serif display, vàng kim, nền giấy kem cùng cam đất nung.** Theo `tells.md` của taste-skill, cặp kem + đất nung bị cấm, đất nung đứng riêng cũng bị cấm, còn kem chỉ bị cảnh báo. `colour.md` thì nhẹ hơn, coi mỗi nửa đứng riêng là "suspect" (TS-X15). Accent cam `#d97a1e` trên nền giấy kem của web rơi đúng vào trường hợp này.
- **Tranh kiến trúc Việt Nam và bìa sách thật.** Cả hai nhóm đều coi đây là điểm mạnh: đặc thù sản phẩm, không generic (IMP-A5 đạt).
- **Kết luận brand:** giữ hệ hình ảnh. Nên làm dịu chrome sidebar (`/impeccable quieter`) và đổi accent cho focus ring (HT3) mà không phải bỏ palette.

## Trạng thái sửa (04/11/2026)

- **Đợt 1 — đã sửa:** HT1, HT2, HT3, HT11. Chi tiết ở `docs/plans/2026-11-04-audit-ui.md`.
- **Đợt 4 — đã sửa:** HT12. Trang Khái niệm giờ tải một gói `bundles/<môn>.json` thay cho từng file khái niệm. Nợ SMIL của `StreakCard` (ghi ở đợt 2) cũng đã xử lý.
- **Đợt 2 — đã sửa:** HT4, HT5, HT7, HT9, HT10. Còn ba món nợ kỹ thuật:
  - **HT7:** chữ tên môn trên gáy sách ở tủ sách Hồ sơ vẫn 7–11,5 px. Giới hạn nằm ở `lib/ui/bookcase.ts` (`spineFont`). Đây là nhãn nhìn thấy duy nhất của nút gáy sách; tên đầy đủ chỉ hiện trong sheet sau khi bấm. Muốn sửa phải rút gọn `short` hoặc làm gáy rộng hơn, tức là việc thiết kế, để sang đợt 3.
  - **HT5:** `lib/art/StreakCard.svelte` dùng SMIL `<animate repeatCount="indefinite">`. CSS giảm chuyển động không tắt được loại này, phải chặn bằng JS theo setting. Lỗi có từ trước đợt sửa.
  - **HT5:** các vòng lặp báo trạng thái được giữ nguyên có chủ ý: lửa chuỗi, các `cg-*` trên thẻ chuỗi, thanh lửa trong phiên, ComboMeter, ánh sáng câu vàng, chức kế tiếp (`orgnext`).

## Thứ tự sửa đề xuất (cần Hào duyệt từng đợt)

1. **Đợt `fix/`:** HT1, HT2, HT3, HT11. Đây là lỗi bàn phím, focus và request sai; ít rủi ro, sửa nhiều file nhưng nhỏ.
2. **Đợt `fix/`:** HT4, HT5, HT7, HT9, HT10.
3. **Đợt thiết kế (cần spec):** HT6, HT8, HT13, HT14 và [BRAND] sidebar.
4. **Đợt `chore(content)`:** HT12, gói JSON theo môn.
