# Audit giao diện nhóm B — quiz · lesson · review · profile · settings · notfound

Người chấm: S4 (đã sửa lần 1 sau review). Ngày: 2026-11-04. Mode impeccable: Operate (+ Read cho thẻ định nghĩa luật). Bộ tiêu chí: [tieu-chi.md](tieu-chi.md). Lỗi hệ thống dùng mã HT1–HT14 và mức P theo [README.md](README.md); file này chỉ giữ chi tiết riêng của từng màn. Mục [BRAND] xem README, không trừ điểm màn.

## 0. Phương pháp và giới hạn
- **Detector impeccable không chạy được** (bị chặn). IMP-A5 chấm bằng đọc code + ảnh; "số đo" tách khỏi "phán đoán thị giác".
- Playwright trên emulator Chromium (390×844, 320×640, 1280×800), không phải máy thật. Script nằm trong [do-dac/](do-dac/): `s4-flow.cjs`, `s4-lesson.cjs`, `s4-verify.cjs`, `s4-verify2.cjs`, `s3-verify.cjs`. Riêng `s4-org.cjs` (đo lại tương phản cây chức vụ ở lần sửa này) chưa được đưa vào `do-dac/`, đang nằm trong thư mục làm việc `audit/` của phiên. Cách dùng: `PW_CHROMIUM=/opt/pw-browsers/chromium node <script>`.
- Đã làm: quiz 10 câu bằng phím 1–4/Enter tới màn kết quả; một đợt học (hp-1) tới SessionEnd; seed IndexedDB để `#/on` có phiên ôn; Esc mở hộp thoát; Tab-order; reduced-motion; 320 px; đo contrast tính cả chuỗi opacity và nền bán trong suốt.
- **Dương tính giả của `probe.json` đã loại**: ratio "1.00 / 1.31 / 1.57 / 3.50" ở Hồ sơ và lesson là do đo nền sai (gradient, chuỗi `color(srgb …)` của `color-mix` bị parse thành 0–1). Kiểm lại bằng `s4-org.cjs` (đổi `color(srgb)` ×255, cộng nền bán trong suốt): chữ tên chức "Chưa mở" thực tế **5,33:1** (xem 6.3).
- Về 404 trong console: xem **HT11** (`/tts/manifest.json`, `/content/sets/undefined.json`, `/content/subjects/undefined.json`); mỗi URL đã xác minh bằng listener `response`. Sửa gợi ý: guard `if (!route.params.id) return;` ở `Quiz10.svelte:41` và `Lesson.svelte:37`.

## 1. Phần hệ thống
Token, thang chữ, motion, theming: phần lớn đã gom ở README. Chỉ ghi điểm riêng của nhóm B.
- **Làm tốt**: token có vai trò rõ (`app.css:3-14` màu, `:16` khoảng cách nền 4, `:21` bo góc, `:23,42` `--ctl-h` 40→44 trên điện thoại, `:31` `--accent-text`). Thang chữ 12/14/16/18/22/28/36 (`:17`) khớp TS-T3. Leading `1.2/1.35/1.55` (`:18`) đạt VN-2.
- **Theming**: một bảng màu sáng (`app.css:2` `color-scheme: light`), chủ đích; không chấm dark mode, trần IMP-A3 là 3.
- **Chữ**: hex ngoài token → **HT8**; ba họ font và weight 700 thiếu → **HT9**; chữ <12 px (gáy sách, số đếm 10 px, số bậc 10 px) → **HT7**; eyebrow `.kicker` (`app.css:235`) → **HT6**. Riêng nhóm B: hồ sơ đo được 18 cỡ phân biệt (5,4 → 54 px, `s4-verify.cjs`); phần lớn nằm trong artwork (gáy sách, huy hiệu chuỗi).
- **Motion**: reduced-motion tắt sạch → **HT4**. Vòng lặp vô hạn trang trí → **HT5**; ở nhóm B xuất hiện ở thanh phiên (`app.css:212` `bar-shimmer`, `:217` `head-flick`, kèm `will-change`), viền lửa (`:138`), thẻ chuỗi Hồ sơ (`:957-970`), nút "chức kế tiếp" (`:1321`). Chúng dừng khi reduced-motion; chưa xác minh có dừng khi ngoài màn.
- **Easing**: `shake` ±6 px (`app.css:253`), `pop` scale 1,03 (`:252`), `cgborn` có overshoot `cubic-bezier(.2,.9,.3,1.2)` (`:983`); hover-lift `translateY(-1px)` trên `.opt` (`:246`) và `-2px` trên `.org-node` (`:1310`) — TS-X24. Khoảnh khắc ăn mừng có chủ đích (dấu mộc combo, confetti lên bậc/thăng chức) chấp nhận theo X10.
- **lib/fx**: `confetti.ts` tôn trọng `reducedMotion()` và lấy màu từ token (kèm một hex vàng, `confetti.ts:88`). `sparks.ts`, `comboSfx.ts`, `haptics.ts` chưa mở, chưa xác minh.
- **lib/art**: đặc thù sản phẩm mạnh (Ngọ Môn, ấn đỏ, tủ sách) → IMP-S1 đạt. Phần chrome dùng Unicode làm icon → **HT14**.

## 2. Tổng quan điểm
| Màn | Impeccable /20 | Nielsen | Ghi chú |
|---|---|---|---|
| 7 quiz | 14 (Good) | 29/40 | Ít nhồi hơn lesson; dính HT1, HT2, HT3 |
| 8 lesson | 13 (Acceptable) | 28/40 | Màn nhồi nhất: gợi ý + dải + panel + thanh phiên |
| 9 review | 14 (Good) | 28/40 | Dùng chung SessionView; trạng thái rỗng sơ sài |
| 10 profile | 12 (Acceptable) | 23/36 = 64% (Acceptable; H5 n/a) | h1 kiểu eyebrow, tủ sách trống chiếm màn đầu |
| 11 settings | 13 (Acceptable) | 28/40 | Nhập dữ liệu ghi đè không xác nhận |
| 12 notfound | 15 (Good) | 29/36 = 81% (Good; H5 n/a) | Sạch; vẫn dính HT2, HT3 |

Implementation Integrity: **không đạt** — còn lỗi lặp HT1, HT2, HT3, HT6, HT13.

**Đếm lỗi cục bộ nhóm B** (chỉ các mục có tiêu đề riêng ở mục 3–8): P0 = 0 · P1 = 1 · P2 = 14 · P3 = 10.
**Lỗi hệ thống mà nhóm B dính** (đếm ở README, không cộng lại): P1: HT1, HT2, HT3 · P2: HT4, HT5, HT6, HT7, HT8, HT9, HT10, HT11 · P3: HT13, HT14.
(Bản trước ghi P2 = 14, P3 = 8 nhưng gộp lẫn lỗi hệ thống và bỏ sót vài mục; số reviewer đếm 25/15 là cộng cả các lỗi hệ thống lặp ở từng màn.)

**Điểm phụ TS-F4** (design 40% · usability 30% · creativity 20% · content 10%): áp cap trong tieu-chi.md — màn có eyebrow hoặc bóng ở trạng thái nghỉ thì tổng ≤ 6,5. Cả 6 màn đều có `.card` với `box-shadow: var(--shadow)` (`app.css:113`) và 5/6 có eyebrow, nên cap áp cho tất cả.
| Màn | design · usability · creativity · content | Thô | Sau cap |
|---|---|---|---|
| quiz | 7,5 · 7 · 8 · 8,5 | 7,55 | **6,5** |
| lesson | 7 · 6,5 · 8,5 · 8 | 7,25 | **6,5** |
| review | 7 · 6,5 · 7 · 7,5 | 6,90 | **6,5** |
| profile | 6,5 · 6 · 8,5 · 8 | 6,90 | **6,5** |
| settings | 7 · 7 · 6 · 7,5 | 6,85 | **6,5** |
| notfound | 8 · 8 · 8 · 8 | 8,00 | **6,5** (chỉ vì bóng thẻ; không có eyebrow) |

---
## 3. Màn 7 — Quiz `#/bo/dat-coc`
`routes/Quiz10.svelte`. Ảnh: [390 px](anh/shots-390-light-quiz.webp) · [1280 px](anh/shots-1280-light-quiz.webp) · [phản hồi 390](anh/s4-quiz-fb-390.webp) · [phản hồi 1280 (đáp án sai)](anh/s4-quiz-fb-1280.webp) · [sau khi chọn, nút Câu tiếp dưới nếp gấp](anh/s4-quiz-after-click-390.webp) · [kết quả 3/10](anh/s4-quiz-end-390.webp).
Quiz dùng markup thẻ trắc nghiệm riêng (`Quiz10.svelte:146-154`), không dùng `SessionView` của lesson/review.

### 3.1 Impeccable audit
| Chiều | Điểm | Bằng chứng |
|---|---|---|
| A1 Accessibility | 2 | Tốt: `role="progressbar"` + `aria-valuetext` (`:141`), `role="group"` (`:149`), `role="status"` (`:156`), đúng/sai có chữ "Chính xác." / "Chưa đúng. Đáp án: B" (`:157`) nên không chỉ dựa màu. Hạ vì **HT1, HT2, HT3** (P1 cả ba). |
| A2 Performance | 3 | Không ảnh nặng; `pop/shake` là transform. |
| A3 Theming | 3 | Dùng `--ok-bg/--bad-bg`; `--shelf` inline theo kệ (BRAND, xem README). |
| A4 Responsive | 3 | 390 và 320 px không cuộn ngang; phương án 324×(54–76); nút thoát 44×44; "Câu tiếp" 324×44. |
| A5 Integrity | 3 | Cấu trúc đặc thù (vé đề, căn cứ điều luật); trừ vì kicker (HT6) và bản sao thẻ MCQ. |
| **Tổng** | **14/20** | Good |

### 3.2 Nielsen
H1 3 · H2 3 · H3 2 · H4 3 · H5 3 · H6 4 · H7 2 · H8 3 · H9 3 · H10 3 = **29/40**. H3=2: nút `←` thoát tức thì, tiến độ quiz không lưu giữa chừng (`Quiz10.svelte:46-59`; `i`, `score` chỉ trong `$state`). H7=2: phím tắt có nhưng Enter/Space xử lý sai (HT1).
Cognitive load: 0 mục trượt (thấp). Persona: Casey (nút tiếp theo dưới nếp gấp, HT2), Sam (HT1), Riley (F5 mất phiên, chưa tái hiện).
Taste tells: kicker "ĐỀ 07 · LUẬT DÂN SỰ" trên h1 kết quả (`:108`) → HT6; "CÂU 1" (`:147`, `.qno`) là dữ liệu (TS-X18 cho phép); TS-X24 hover-lift `.opt`.

### 3.3 Phát hiện cục bộ
**Dính hệ thống (xem README):** HT1 — ở quiz đã xác minh: Enter trên link "Về Luyện đề" không điều hướng (hash giữ `#/bo/dat-coc`); Enter trên nút phương án **không chọn được, chỉ Space chọn được**; Enter trên link "Xem điều luật" trong phản hồi nhảy sang câu sau (1/10 → 2/10) (`Quiz10.svelte:79-85`, `preventDefault` ở `:83`, `isTypingTarget` quá hẹp ở `cards/types.ts:19-22`). Đã xác minh bằng `s3-verify.cjs` và `s4-verify.cjs`. HT2 — sau khi trả lời, `activeElement` = `BODY`, đáy "Câu tiếp" y=867 > 844, `scrollY` giữ 0 (`:155-161`); đã xác minh. HT3 — focus ring cam. HT4 — mất `pop/shake`, đúng/sai vẫn rõ nhờ nền + chữ. HT6 — kicker `:108`. HT13 — `.rv` viền trái 4 px (`app.css:604`, dùng ở `Quiz10.svelte:127`).

**[P2] Phương án "dim" sau khi trả lời nhạt, khó đọc lại** — `app.css:250` `.opt.dim { opacity: .45 }`. Đo (có chuỗi opacity): chữ 16 px 2,78:1, ký tự A–D 1,91:1; ảnh [phản hồi 1280](anh/s4-quiz-fb-1280.webp). Các nút lúc này đều `disabled` (đã xác minh `quiz_dim.disabled: true`) nên **WCAG 1.4.3 được miễn**; vấn đề là dùng được: người học cần đọc lại phương án sai để hiểu bẫy mà phần giải thích bên dưới nhắc tới. Mã IMP-V1, TS-C5. Sửa: bỏ `opacity`, dùng chữ `--muted` (5,6:1) trên nền phẳng. `/impeccable polish`. Đã xác minh bằng số đo.

**[P2] Thoát quiz không xác nhận, tiến độ phiên không lưu** — `Quiz10.svelte:140` (link `←` đi thẳng), `:46-59`, `:37`. Chạm nhầm làm mất đề 10 câu, thứ tự đáp án bị xáo lại; lesson có hộp "Thoát, giữ tiến độ?" còn quiz không. Mã IMP-H3, IMP-H5, VN-7. Sửa: lưu `{i, score, results, order}` vào `sessionStorage` hoặc dùng cùng `confirmExit`. `/impeccable harden`. Suy từ code, chưa tái hiện bằng F5.

**[P3] Kết quả: 4 nút dọc cùng cỡ** — `Quiz10.svelte:116-121` ("Làm lại", "Đề tiếp theo", "Về Luyện đề", "Chia sẻ", mỗi nút 44 px, đã đo); chỉ một `primary` (tốt, TS-A11) nhưng "Chia sẻ" ngang hàng điều hướng. Ảnh [kết quả](anh/s4-quiz-end-390.webp).

**[P3] Bản triển khai thẻ MCQ thứ hai** — `Quiz10.svelte:146-154` vs `lib/ui/cards/CardMcq.svelte:36-48`: `CardMcq` có `aria-label="{KEYS[k]}. {o}"` (`CardMcq.svelte:41`), Quiz10 không; phím tắt và focus khác nhau. IMP-A5 drift. `/impeccable extract`.

**Positive**: phản hồi sai nêu đáp án đúng + giải thích + căn cứ điều luật có link; thông điệp kết quả thấp trấn an ("Điểm thấp lúc đầu là bình thường"); đúng/sai có chữ, không chỉ màu.

---
## 4. Màn 8 — Lesson `#/hoc/hien-phap/hp-1`
`routes/Lesson.svelte` bọc `lib/ui/SessionView.svelte`, `SessionBar`, `Feedback`, `cards/Card*`, `LessonStrip`, `LessonPanel`, `WhyPanel`. Ảnh: [390 px](anh/shots-390-light-lesson.webp) · [1280 px](anh/shots-1280-light-lesson.webp) · [lúc bắt đầu](anh/s4-lesson-start-390.webp) · [hộp thoát bằng Esc](anh/s4-lesson-confirm-390.webp) · [màn câu chốt](anh/s4-lesson-card-4-390.webp) · [phản hồi sai, câu vàng](anh/s4-lesson-fb-3-390.webp) · [kết quả phiên](anh/s4-lesson-end-390.webp).
Đã đi hết 27 bước tới SessionEnd (2/5 đúng, +95 XP, chuỗi 1 ngày).

### 4.1 Impeccable audit
| Chiều | Điểm | Bằng chứng |
|---|---|---|
| A1 | 2 | Dính HT1, HT2, HT3. Tốt: `Feedback` có `role="status" aria-live="polite"` (`Feedback.svelte:35`) và focus nút tiếp (`:26`, `:47`); `LessonStrip` cuộn ngang có `tabindex=0` + `aria-label` (`LessonStrip.svelte:6-8`); `h1.sr-only` (`SessionView.svelte:218`). |
| A2 | 3 | `transition: width .25s` ở thanh tiến độ (`app.css:191`) animate `width` (IMP-A2, lỗi nhỏ); vòng lặp vô hạn → HT5. |
| A3 | 3 | Token tốt; hex vàng câu vàng → HT8 (`app.css:196, 305, 308`). |
| A4 | 3 | Không tràn ngang; "Đã hiểu" nằm dưới nếp gấp khi có hộp gợi ý. |
| A5 | 2 | Kicker lặp (HT6), viền trái (HT13), SessionEnd kiểu hero-metric. |
| **Tổng** | **13/20** | Acceptable |

### 4.2 Nielsen
H1 3 · H2 3 · H3 3 · H4 3 · H5 3 · H6 3 · H7 2 · H8 2 · H9 3 · H10 3 = **28/40**. H8=2: thanh phiên cùng lúc có nút thoát, tiêu đề, tiến độ + mốc, combo, XP, bộ đếm; bên dưới còn dải khái niệm, hộp gợi ý, huy hiệu câu vàng; ở 390 px thẻ bắt đầu ở y≈325 và "Đã hiểu" ở y≈980 (ảnh [390 px](anh/shots-390-light-lesson.webp)).
Cognitive load: trượt C1, C3, C4, C8 ⇒ nghiêm trọng với người mới. Persona: Jordan (hộp gợi ý chiếm màn đầu), Casey, Sam.
Taste tells: 6 eyebrow trên màn (HT6); TS-X13 (HT5); TS-X24; `★` (HT14).

### 4.3 Phát hiện cục bộ
**Dính hệ thống:** HT1 — đã xác minh: Enter trên "Xem nguyên văn điều luật" không mở `#intro-verbatim` mà sang thẻ kế (`CardIntro.svelte:18`, `Feedback.svelte:27`); nhánh Space bắt khi có TTS (`CardIntro.svelte:19`, `Feedback.svelte:30`) **chưa chạy** vì môi trường không có giọng vi-VN, suy từ code; `CardCloze.svelte:31` cũng bắt Enter (đọc code, chưa chạy); Enter trên nút "Thoát" của hộp xác nhận có thể trả lời thẻ ở dưới (suy từ code, chưa chạy); mở hộp bằng Esc thì focus ở `BODY` (đã xác minh: `lesson_esc.active = BODY`; hộp `role="dialog"` ở `SessionView.svelte:232`, Esc ở `:210`). HT2, HT3, HT4, HT6 (`CardIntro.svelte:25`, `LessonPanel.svelte:8`, `SessionView.svelte:226`, `SessionEnd.svelte:34`), HT7 (số bậc 10 px, `LessonStrip.svelte:31`), HT13 (`app.css:121, 298-299, 459, 1576`), HT5.

**[P2] "Sheen" quét qua thẻ câu vàng làm chữ câu hỏi nhạt cục bộ** — `app.css:309-310` (`.step-wrap.golden .question-card::after`, gradient trắng 55%). Ảnh [phản hồi sai](anh/s4-lesson-fb-3-390.webp): một số từ ("vụ Quốc hội", "nhất") nhạt giữa câu 8 dòng. IMP-M1, TS-M4 (không chuyển động băng qua chữ đang đọc). Xác minh bằng ảnh; chưa đo ratio tức thời. Sửa: sheen chỉ ở viền, hoặc dừng sau 600 ms.

**[P2] Câu chốt dựng thêm một bước 1,6 s trước câu hỏi** — `lib/ui/session/BossIntro.svelte` (`setTimeout(finish, 1600)`, nút "Vào câu chốt"), `SessionView.svelte:237-238`. Thẻ chỉ cao ≈230 px, nội dung lặp "Câu chốt" 3 lần (kicker, tiêu đề, `step-badge`) rồi lại có thẻ câu hỏi; người học lại (Alex) phải bấm hoặc chờ. IMP-M6, IMP-H7. Sửa: gộp vào `step-badge` trên chính thẻ câu hỏi. Ghi chú: ảnh [màn câu chốt](anh/s4-lesson-card-4-390.webp) có confetti rơi nhưng **không do BossIntro** (file không gọi confetti); nó đến từ lần lên bậc ở câu trước (`SessionView.svelte:144`, `burst`), đúng ý khoảnh khắc ăn mừng X10 — bản trước ghi sai chỗ này.

**[P2] Hộp "Lần đầu học ở đây" đẩy thẻ và nút xuống dưới nếp gấp** — `SessionView.svelte:224-230`; ảnh [390 px](anh/shots-390-light-lesson.webp). IMP-C1, IMP-H10; Jordan/Casey. Sửa: gợi ý một dòng hoặc coach-mark gắn vào ngọn lửa lần đầu.

**[P2] Màn kết quả kiểu hero-metric + ô chỉ số xếp chồng** — `SessionEnd.svelte:41` (`+95 XP` cam lớn), `:42-48` (dl bốn ô), vòng điểm; ở 390 px các ô xếp một cột, mỗi ô nền riêng (ảnh [kết quả](anh/s4-lesson-end-390.webp)). "2/5 đúng" và "Tỉ lệ đúng 40%" trùng dữ kiện. IMP-B2, X7, TS-A3. Sửa: một dòng "2/5 câu đúng · +95 XP" + danh sách nhãn-trái/giá-trị-phải.

**[P3] Thanh XP theo nguồn không nhãn hai đầu** — `SessionEnd.svelte:53-55` (`width: s.xp/maxSrc`), 4 thanh cam trang trí cạnh số; TS-S5, TS-X12 nhẹ. Bỏ thanh, giữ danh sách.

**[P3] Nhãn phím `↵` hiện cả trên cảm ứng** — `Feedback.svelte:47`, `CardIntro.svelte:49`, `app.css:268`. IMP-R4: ẩn bằng `@media (hover: none)`.

**[P3] Chip "tóm tắt" canh dọc không đều** — ảnh [1280 px](anh/shots-1280-light-lesson.webp): chữ sát đỉnh chip, dư khoảng trắng đáy (chip co dãn theo hàng flex); không cắt dấu (VN-2 đạt).

**Positive**: phản hồi sai đủ đáp án + giải thích + hộp "Vì sao?" + "Dễ nhầm với «…»" + nguồn có link (IMP-H9, VN-5); câu "Chữ nghiêng: dấu hiệu tóm tắt, không phải nguyên văn điều luật" tách nguyên văn khỏi tóm tắt; hộp thoát nói "Những câu đã trả lời đã được lưu" (IMP-S2, `SessionView.svelte:233`); "Sai thì chuỗi về 0, không mất điểm đã có".

---
## 5. Màn 9 — Review `#/on`
`routes/Review.svelte` + SessionView. Ảnh: [trạng thái rỗng 390](anh/shots-390-light-review.webp) · [rỗng 1280](anh/shots-1280-light-review.webp) · [phiên ôn có thật 390](anh/s4-review-390.webp) · [phiên ôn 1280](anh/s4-review-1280.webp) (sau khi seed IndexedDB).
| Chiều | Điểm | Ghi chú |
|---|---|---|
| A1 | 2 | HT1, HT2, HT3 (phiên). Trạng thái rỗng có `h1` + nút thật. |
| A2 | 3 | |
| A3 | 3 | |
| A4 | 3 | Phương án dài 5 dòng ở 390 px, đáp án D cắt dưới nếp gấp ([ảnh](anh/s4-review-390.webp)). |
| A5 | 3 | |
| **Tổng** | **14/20** | |
Nielsen: H1 3 · H2 3 · H3 3 · H4 3 · H5 3 · H6 3 · H7 2 · H8 3 · H9 3 · H10 2 = **28/40** (H10=2: trạng thái rỗng thiếu hướng dẫn tiếp theo; bản trước ghi 29, sửa cho khớp lập luận "trừ H10").

**[P2] Trạng thái rỗng không nói khi nào có bài ôn và không dẫn vào học** — `routes/Review.svelte:50`. Chỉ một nút "Về Hôm nay"; không có "Hẹn ôn ngày mai: N khái niệm" dù `SessionEnd` đã tính `dueTomorrow`. Ảnh [rỗng 390](anh/shots-390-light-review.webp): thẻ ở đỉnh, phần còn lại của màn trống. TS-S2, IMP-H10. `/impeccable onboard`.

**[P3] Lỗi tải hiện message kỹ thuật thô** — `Review.svelte:48` ("Không tải được dữ liệu: {error}"). IMP-H9/H2. Chưa ép lỗi để xác minh.

**[P3] Phiên ôn không có tiêu đề nhìn thấy** — `SessionView.svelte:218` (`h1.sr-only`); `SessionBar.svelte:19` có `title` nhưng ở 390 px không thấy trong ảnh [phiên ôn](anh/s4-review-390.webp). Người học chỉ thấy đếm 0/5.

---
## 6. Màn 10 — Profile `#/toi`
`routes/Profile.svelte`, `StreakPanel`, `CareerSection`, `OrgChart`, `RankBadge`, `StreakFlame`, `WeekDots`, `LevelLegend`. Ảnh: [390 px](anh/shots-390-light-profile.webp) · [1280 px](anh/shots-1280-light-profile.webp) · [sau khi có tiến độ 390](anh/s4-profile-after-390.webp).

### 6.1 Impeccable audit
| Chiều | Điểm | Bằng chứng |
|---|---|---|
| A1 | 2 | HT2, HT3; tab `role="tab"` trên `<a>` thiếu `aria-controls`/phím mũi tên (`Profile.svelte:152-153`). Tốt: accordion đúng mẫu (`aria-expanded`, `aria-controls`, `role=region`, `inert` — `Profile.svelte:163-189`). |
| A2 | 2 | Nhiều SVG art + vòng lặp (HT5); OrgChart reveal bằng blur (`app.css:1329`); trang cao ~3365 px ở 390. |
| A3 | 3 | |
| A4 | 3 | 390/320 không tràn; ở 1280, ô "0 ngày / Chưa có chuỗi · 0 XP" bị bóp thành 4 dòng ([ảnh](anh/shots-1280-light-profile.webp)). |
| A5 | 2 | Eyebrow (HT6), chuỗi ngày lặp 3 chỗ, tủ sách trang trí lớn trước thông tin. |
| **Tổng** | **12/20** | Acceptable |

### 6.2 Nielsen (chuẩn hoá /36, H5 n/a vì màn không có hành động phá huỷ)
H1 3 · H2 3 · H3 3 · H4 2 · H6 3 · H7 2 · H8 2 · H9 3 · H10 2 = **23/36 = 64%** (Acceptable).
Persona Jordan: 5 giây đầu thấy "Công dân / Khởi đầu · Hành pháp & chính quyền địa phương"; tủ 212 cuốn chưa có sách nào chiếm màn đầu. Taste tells: HT6 (5 kicker), TS-X17 viền kép/hairline (`app.css:773, 880, 886`, BRAND), IMP-B2 (số chuỗi lớn + lưới 4 ô).

### 6.3 Phát hiện cục bộ
**Dính hệ thống:** HT6 (`Profile.svelte:140`, `StreakPanel.svelte:27, 32`), HT7 (gáy sách 5,4–10,5 px, số đếm `0/2`, `0/3` 10 px ở OrgChart; gáy sách là artwork có `sr-only` tên đầy đủ), HT9 (serif display), HT10 (chú thích pháp lý chỉ ở `Profile.svelte:193-195`), HT14 (`§`).

**[P2] `h1` "Hồ sơ" tạo kiểu eyebrow 12 px HOA, tiêu đề thấy được là `<p>`** — `Profile.svelte:122-123` (`<h1 class="idc-eyebrow">Hồ sơ</h1>` rồi `<p class="idc-title">`); đo `H1 12px`. Ngữ nghĩa vẫn đúng (h1 "Hồ sơ", h2 "Cài đặt"/"Sự nghiệp"), nên đây là vấn đề thị giác, **P2** (bản trước ghi P1). IMP-B3, TS-T2. Sửa: h1 24–28 px, dòng phụ sentence case. `/impeccable typeset`. Đã xác minh bằng đo + ảnh.

**[P2] Chuỗi ngày lặp ở 3 chỗ** — `Profile.svelte:131`, `StreakPanel.svelte:23` (`sp-big`), `StreakPanel.svelte:13` (`stats[0] "Chuỗi hiện tại"`), cộng topbar/sidebar (Shell). Số khớp nhau nhưng thừa (TS-F2 mục 4, IMP-B2); ở 1280 ô chuỗi bị bóp. Sửa: giữ ở thẻ căn cước, accordion nói 7 ngày + bậc.

**[P2] Người mới thấy tủ 212 cuốn trống, hành động đầu tiên nhỏ** — ảnh [390 px](anh/shots-390-light-profile.webp): khối kính-gỗ ≈ nửa màn đầu không có sách "sáng"; "Xem điều kiện →" nhỏ ở thẻ căn cước. TS-S2, TS-L8, TS-X25. Sửa: đưa "Chức kế tiếp + hành động" lên đầu, thu tủ khi chưa có sách.

**[P2] Hai tab `role="tab"` trên `<a>`** — `Profile.svelte:152-153`; `role="tabpanel"` không `aria-labelledby` (`:160`, `:162`). IMP-A1. Bỏ role tablist (hai link + `aria-current="page"`) hoặc làm đủ roving tabindex. `/impeccable harden`.

**[P3] Cây chức vụ mờ khi chưa cuộn tới** — `app.css:1329` (`filter: blur(5px) saturate(.2)` tới khi IntersectionObserver kích hoạt). Ảnh full-page [1280 px](anh/shots-1280-light-profile.webp) thấy nửa cây mờ; đã cuộn thật (`s4-org.cjs`) thì `data-appear="in"`, `filter: none`. Rủi ro nhỏ với in/zoom lớn. TS-M3.

**[P3] Ô chuỗi bóp 4 dòng ở 1280 px** — [ảnh](anh/shots-1280-light-profile.webp), khối "0 ngày / Chưa có / chuỗi · 0 / XP". Đã nhìn ảnh, chưa đo độ rộng ô.

**Đã loại sau khi đo lại — chữ "Chưa mở" của cây chức vụ**: bản trước ghi 3,5:1 (P2, viện dẫn 1.4.3) theo `probe`; đo lại bằng `s4-org.cjs` ra **5,33:1** cho `.org-name` (rgb(91,100,117) trên nền `color-mix(line 38%, card)`), ≥ 4,5:1 nên không phải lỗi AA. `.org-meta` "Chưa mở" bị clip 1×1 px (`app.css:1317`), không hiển thị. Cỡ chữ tên chức 12 px ở 1280 px thuộc HT7.

**Positive**: trạng thái rỗng "Chưa học khái niệm nào · Học đợt đầu tiên →" (`StreakPanel.svelte:34`); `sr-only` tên sách; `localStorage` bọc try/catch (`Profile.svelte:73-80`); cây chức dùng icon + chữ; nói rõ "chức danh mô phỏng" (VN-6).

---
## 7. Màn 11 — Settings `#/cai-dat`
`routes/Settings.svelte` (hiển thị trong tab của `Profile`). Ảnh: [390 px](anh/shots-390-light-settings.webp) · [1280 px](anh/shots-1280-light-settings.webp).
| Chiều | Điểm | Bằng chứng |
|---|---|---|
| A1 | 2 | HT2, HT3; tab ARIA như Hồ sơ. Tốt: mọi control bọc `<label class="setting">`. Thiếu `aria-describedby` giữa slider và câu giải thích (`Settings.svelte:44-47`). |
| A2 | 4 | |
| A3 | 3 | `accent-color` checkbox cam (đo `rgb(217,122,30)`), slider/`select` để `auto` ⇒ xanh mặc định (ảnh [390 px](anh/shots-390-light-settings.webp)). |
| A4 | 2 | Slider 129×16; checkbox 22×22 (hàng nhãn cao ≥50). |
| A5 | 2 | `<h2 style="margin-top:0">` inline (`:34`); `⚠` (`:35`, HT14); lưu ngay trộn với `localStorage` riêng. |
| **Tổng** | **13/20** | Acceptable |
Nielsen: H1 2 · H2 3 · H3 3 · H4 3 · H5 1 · H6 3 · H7 3 · H8 4 · H9 3 · H10 3 = **28/40**.

**[P1] "Nhập dữ liệu" ghi đè tiến độ không xác nhận, không báo số bản ghi, không sao lưu** — `Settings.svelte:21-30` (`importData`), `lib/store/progress-repo.ts:123-129` (Dexie `bulkPut` ghi đè `concepts`, `stats`, `settings` trùng khoá), `:86-90` (nhánh in-memory thay hẳn `Map`). Nhầm file cũ ⇒ hạ bậc/lịch FSRS/chuỗi/XP, không undo. Thông báo chỉ "Đã nhập dữ liệu." (`:28`) / "File không hợp lệ." (không nói vì sao, IMP-H9). IMP-H5, TS-A9; Riley. Suy từ code, chưa thao tác thật. Sửa: preview "File có N khái niệm, mới nhất ngày …; hiện có M" + chọn gộp/thay thế + tự tải bản sao trước. `/impeccable harden`.

**[P2] Không có "Đã lưu" cho tuỳ chọn lưu ngay** — `Settings.svelte:36-46` (`saveSetting` ở `onchange`); "Đoán trước" lưu riêng `localStorage` (`:48`, `setPref`) và không vào file xuất. TS-A10, IMP-H1.

**[P2] Slider "Mục tiêu nhớ": xanh mặc định, thumb 16 px, nhãn ngắt dòng** — `Settings.svelte:44-46`; đo `accent-color: auto`, `INPUT 129×16`. IMP-R3/R8, TS-C9. Sửa: `accent-color: var(--accent)`, vùng chạm 44 px, bỏ "retention" khỏi nhãn chính.

**[P2] Nhãn TTS dài 3 dòng, chứa chi tiết kỹ thuật** — `Settings.svelte:37` ("giọng neural dựng sẵn nếu có, không thì giọng vi-VN của trình duyệt"). IMP-H2, VN-3. Sửa: "Tự đọc phản hồi" + dòng phụ.

**Positive**: một cột, nút "Xuất/Nhập dữ liệu" `ghost` cùng cỡ 156×44; chú thích hậu quả ("Cao hơn = ôn dày hơn nhưng nhớ chắc hơn. Mặc định 90%."); nói rõ khi không có giọng tiếng Việt. Không có hành động xoá dữ liệu nên không có lỗi ở đây.

---
## 8. Màn 12 — NotFound `#/khong-co`
`routes/NotFound.svelte`. Ảnh: [390 px](anh/shots-390-light-notfound.webp) · [1280 px](anh/shots-1280-light-notfound.webp).
| Chiều | Điểm | Ghi chú |
|---|---|---|
| A1 | 2 | Có `h1` rõ, `document.title` cập nhật (`NotFound.svelte:6`), tương phản đạt (đo không dòng LOW). Nhưng **HT2** (đổi route không chuyển focus, không báo trình đọc màn hình) áp cho mọi màn, kể cả 404, và **HT3** (focus ring 2,83:1). Bản trước chấm 4 là sai. |
| A2 | 3 | Hình Ngọ Môn lớn; không đo được lazy-load. |
| A3 | 3 | |
| A4 | 4 | 390/320 không tràn. |
| A5 | 3 | Hai nút trong `<p>` không có `gap` (xem dưới). |
| **Tổng** | **15/20** | Good |
Nielsen (H5 n/a, chuẩn hoá /36): H1 3 · H2 4 · H3 3 · H4 3 · H6 4 · H7 3 · H8 3 · H9 3 · H10 3 = **29/36 = 81%**. H9: nói "Địa chỉ này không tồn tại hoặc đã đổi" + 2 đường ra.
Taste tells: hình minh hoạ 190 px trong thẻ lỗi là đặc thù văn hoá (BRAND), IMP-S1 đạt.

**[P3] Hai nút nằm trong `<p>`, cách nhau ~4 px** — `NotFound.svelte:13-16`; ảnh [390 px](anh/shots-390-light-notfound.webp). Sửa: `div.row` với `gap: var(--sp-3)`. `/impeccable layout`.

**Positive**: nêu vấn đề + cách ra; tiêu đề danh từ; dùng chung `.card/.btn`.

---
## 9. Positive findings tổng
- Token spacing/size/radius có chú thích ngay trong CSS; `--ctl-h` 44 trên điện thoại ⇒ control đo được đều ≥44 px (nút thoát 44×44, "Câu tiếp" 324×44, nút kết quả 44).
- Không cuộn ngang ở 390 và 320 px cho 5 màn đo; `env(safe-area-inset-bottom)` ở tabbar.
- Phản hồi đúng/sai dùng màu + chữ + vị trí (IMP-K6).
- Trấn an cảm xúc ("Điểm thấp lúc đầu là bình thường", "Đoán sai không sao") phù hợp IMP-S2, VN-6.
- Nội dung luật: nguyên văn tách khỏi tóm tắt; nguồn + link ở quiz và lesson.
- Đặc thù thị giác mạnh (Ngọ Môn, ấn đỏ, tủ sách) — IMP-S1 đạt.

## 10. Thứ tự sửa cho nhóm B (theo TS-F5; mã HT xem README)
1. HT1, HT2, HT3, HT11 trước (đợt `fix/` bàn phím/focus).
2. Settings: xác nhận nhập dữ liệu (P1 cục bộ duy nhất).
3. Quiz: lưu/xác nhận thoát; bỏ opacity ở `.opt.dim`.
4. Lesson/Review: gỡ sheen khỏi chữ, gộp BossIntro vào badge, gọn hộp gợi ý, trạng thái rỗng của Review.
5. Hồ sơ: đổi h1, bỏ lặp chuỗi, sửa tab ARIA.
6. HT4–HT10, HT13, HT14 theo đợt của README.

## 11. Chưa xác minh
- Máy thật/cảm ứng, Safari/Firefox, trình đọc màn hình; font offline (SW).
- Space bị chiếm khi có TTS (`CardIntro.svelte:19`, `Feedback.svelte:30`), `CardCloze.svelte:31` bắt Enter, Enter trên nút "Thoát" của hộp xác nhận: chỉ suy từ code.
- `sparks.ts`, `comboSfx.ts`, `haptics.ts`, `CompareTable`, `CareerSection`, `ComboMeter`, `XpCounter` chưa mở.
- Thẻ cloze/sort/match/pair/recall chưa được script đi tới.
- Ratio tức thời của sheen câu vàng; F5 mất tiến độ quiz; lỗi nhập dữ liệu ghi đè (suy từ code).
