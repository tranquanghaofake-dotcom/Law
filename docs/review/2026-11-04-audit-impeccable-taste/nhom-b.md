# Audit giao diện nhóm B — quiz · lesson · review · profile · settings · notfound

Người chấm: S4. Ngày: 2026-11-04. Mode impeccable: Operate (+ Read cho thẻ định nghĩa luật). Bộ tiêu chí: `audit/criteria.md`.

## 0. Phương pháp và giới hạn (đọc trước)
- **Detector impeccable KHÔNG chạy được** (bị chặn). Chiều IMP-A5 (Implementation Integrity) chấm bằng đọc code + ảnh; ghi rõ "phát hiện tự động" (số đo) tách khỏi "phán đoán thị giác".
- Đã tương tác thật bằng Playwright (script mới trong `audit/`: `s4-flow.cjs`, `s4-lesson.cjs`, `s4-verify.cjs`, `s4-verify2.cjs`; ảnh trong `audit/s4/`). Thiết bị là **emulator** Chromium (390×844, 320×640, 1280×800), không phải máy thật. Chưa thử Safari/Firefox, chưa thử gesture cảm ứng thật.
- Đã làm: trả lời đúng/sai quiz bằng phím 1–4 và Enter, đi hết 10 câu tới màn kết quả; đi hết một đợt học (hp-1) tới SessionEnd; seed IndexedDB để `due` rồi mở `#/on` có phiên ôn; Esc mở hộp thoát; Tab-order; reduced-motion; 320 px; đo contrast có tính chuỗi opacity + nền bán trong suốt.
- **Probe cũ (`probe.json`) có dương tính giả**, đã loại: (a) "1.00/1.31/3.50/1.57" ở Hồ sơ/lesson do đo nền sai (gradient, `color(srgb …)` của `color-mix`, nút chọn nhánh chữ trắng trên nền xanh — thực tế ≥5:1) — chỉ giữ số đã đo lại ở mục tương ứng; (b) chip "tóm tắt" ratio 1.00 là lỗi parse `color-mix`, nhìn ảnh thì chữ đỏ nâu trên nền hồng đọc rõ.
- **Bí ẩn 404 đã giải** (đã xác minh bằng listener `response` trên Playwright, 3 URL, không phải 1):
  1. `/tts/manifest.json` — `lib/fx/tts.svelte.ts:127` fetch manifest; `apps/web/static/` không có thư mục `tts/` ⇒ 404 mỗi lần tải lần đầu (đã được xử lý `if (!r.ok) return []`, vô hại nhưng rác console). Tái hiện ở lesson (đã xác minh), probe gán nhầm cho quiz/lesson/review.
  2. `/content/sets/undefined.json` — khi rời `#/bo/:id` sang route khác, `router.svelte.ts:44-49` đặt `route.params = {}` trước khi Quiz10 huỷ; `$effect` ở `routes/Quiz10.svelte:41` chạy lại với `route.params.id === undefined` ⇒ `loadSet(undefined)`. Đã xác minh khi đi quiz → lesson.
  3. `/content/subjects/undefined.json` — cùng cơ chế ở `routes/Lesson.svelte:37` (`void route.params.subject; … load()`), xác minh khi đi lesson → review.
  Hậu quả: 2 request rác + `error` state đặt trên component sắp huỷ (không thấy trên UI). Không phải lỗi chức năng. Sửa: guard `if (!route.params.id) return;` trong effect.

## 1. Phần hệ thống

### 1.1 Token (`apps/web/src/app.css` dòng 1–42 đã đọc)
- **Làm tốt**: 38 token có vai trò rõ — `--ink/--paper/--card/--muted/--line/--accent/--seal/--ok/--bad` (dòng 3–14), thang khoảng cách nền 4 `--sp-1..7` (dòng 16), `--r-sm/md/lg` (dòng 21), `--ctl-h` 40→44 trên điện thoại (dòng 23, 42), `--sec-gap`. `--accent-text` dành riêng cho chữ cam trên giấy (dòng 31) — đúng ý "token theo vai trò" (TS-C1, IMP-K1).
- **Hard-code lọt ngoài token** (phát hiện tự động bằng grep, đã mở dòng): `#fff` ở `.rank .seal` (dòng ~134), `#f2c14e`/`#8a5a00` ở mốc câu vàng thanh phiên (dòng ~205), `#2a1f17 #17110c #e2b23c #f3d98a #fbefcb` ở biển tên sidebar (dòng ~166–185, thuộc Shell, chỉ ghi chú), `#f2c14e` trong `lib/fx/confetti.ts:88`. Palette thứ hai "vàng kim" chưa có token (TS-C1). Mức P3.
- **Thang chữ**: `--fs-xs..3xl` = 12/14/16/18/22/28/36 (dòng 17) — 7 bước, đúng khung TS-T3 (4–9 cỡ) và IMP-T3 (bước ≈1.125–1.3). Tuy nhiên **số cỡ thực đo được rộng hơn thang**: Hồ sơ có 18 cỡ phân biệt (5,4 · 7 · 7,3 · 7,9 · 8,7 · 9,4 · 9,5 · 10 · 10,5 · 11 · 12 · 14 · 16 · 18 · 22 · 28 · 44 · 54 px) (đo bằng `getComputedStyle`, `s4-verify.cjs`). Phần lớn nằm trong nghệ thuật (gáy sách, huy hiệu chuỗi) nhưng 10 px còn xuất hiện ở chữ UI (số bậc trong `LessonStrip`, đếm `0/2` ở OrgChart). Vi phạm sàn "≥12 px, <11 px = P1" của X4 — xem F-P1-xx.
- **Typography**: hai họ + serif display (`--font-ui` Be Vietnam Pro, `--font-display` Noto Serif Display ở dòng 778–779 cho mọi `h1`, `--font-quote` Noto Serif). Ba họ cùng lúc — chạm **TS-T1 "không bao giờ ba"** (display dùng cho h1/tên chức/số chuỗi, quote dùng cho điều luật nguyên văn: hai face thứ hai/thứ ba đều có việc riêng, nên chỉ ghi P3 [BRAND]). Nạp từ Google Fonts (`index.html:11-13`) `Be Vietnam Pro 400;500;600;800` — **thiếu 700**, trong khi CSS dùng `font-weight:700` ở rất nhiều chỗ (vd `.verdict`, `.chip` 600/700, `.org-name` 700) ⇒ trình duyệt rơi về 800 (không tạo weight mới), nghĩa là hệ thống thực tế chỉ có 4 weight, 700 ≡ 800 (TS-T5: nên 3/màn). Italic Be Vietnam Pro không nạp ⇒ chip "tóm tắt" (`font-style: italic`) là **italic tổng hợp** (faux) — thấy ở ảnh lesson 1280. Subset `vietnamese` do Google CSS API tự trả, ảnh cho thấy dấu ă â ê ô ơ ư và chữ hoa có dấu (Ắ, Ế, Ộ) render đúng ở mọi weight đang dùng (VN-1 đạt bằng ảnh; chưa xác minh offline PWA: font tải từ CDN ngoài, chưa kiểm cache SW).
- **Leading**: `--lh-tight 1.2 / snug 1.35 / body 1.55` (dòng 18) — đáp ứng VN-2 (tiêu đề ≥1.2). `.kicker`: uppercase + tracking .08em (dòng 235): chữ HOA tiếng Việt có dấu chồng (ví dụ "KHÁI NIỆM MỚI", "CHỨC KẾ TIẾP · CƠ SỞ") ở 12 px — khó đọc hơn (X12) và là eyebrow (IMP-B3).
- **Theming**: duy nhất một bảng màu sáng, `color-scheme: light` (dòng 2), có chủ đích theo yêu cầu của chủ dự án — **không chấm dark mode** (X3), nhưng ghi nhận điểm IMP-A3 trần là 3. Ảnh dark chỉ xác nhận giống ảnh light.

### 1.2 Motion
- `.reduced-motion` và `@media (prefers-reduced-motion: reduce)` (dòng 105–110) đều dùng `animation: none !important; transition: none !important` trên **mọi** phần tử (đã xác minh bằng `getComputedStyle` ở `s4-verify.cjs`: `animationName: none, transitionDuration: 0s` cho thanh tiến độ, vòng bậc, hộp gợi ý). Theo X11 / IMP-A1 đây là **P1**: không có nhánh "giảm mà giữ phản hồi" (không còn đổi nền mượt, không có chuyển cảnh mở accordion). Giảm nhẹ: trạng thái đúng/sai vẫn giữ nhờ đổi nền + chữ ("Chưa đúng. Đáp án: B"), chuỗi lửa tắt, confetti/sparks/float XP bị gỡ bằng `reducedMotion()` (`lib/fx/confetti.ts:80-84`) — tức đây là "tắt sạch" nhưng không mất thông tin. Có công tắc "Giảm chuyển động: Theo hệ thống/Bật/Tắt" ở Cài đặt (tốt, người dùng ghi đè được; `App.svelte:33-34`).
- Easing: hầu hết `ease`/`ease-in-out`; `shake` (±6 px, `app.css:253`) và `pop` scale 1.03 trên đáp án đúng/sai (`app.css:248-249`) = phản xạ bounce nhẹ (M4); `cgborn` dùng `cubic-bezier(.2,.9,.3,1.2)` có overshoot (dòng 983). Một khoảnh khắc ăn mừng có chủ đích (dấu mộc combo, confetti thăng chức) là ổn (X10). Vấn đề là **mật độ**: ngoài khoảnh khắc đó còn nhiều vòng lặp vô hạn — `bar-shimmer` 1,9 s và `head-flick` .9 s kèm `will-change` trên thanh tiến độ phiên (dòng 212, 217), `firepulse` 2,8 s ở viền lửa (dòng 138), cả họ `cg*` ở thẻ chuỗi (dòng 957–970: flick, ignite, flames, aura, ember, bolts…), `sunspin/drift/sway` ở art (dòng 816–818) ⇒ TS-X13 (chấm/lửa trang trí động) P2. Các vòng lặp này dừng khi reduced-motion (đạt TS-M5) nhưng **không dừng khi ngoài màn** (chưa xác minh, không thấy IntersectionObserver ngoài OrgChart).
- `OrgChart`: nút hiện dần bằng `filter: blur(5px) saturate(.2)` đến khi IntersectionObserver kích hoạt (`app.css:1329`, `OrgChart.svelte` dòng ~33–40). Ảnh full-page chụp thấy cả nửa cây chức vụ bị mờ vì chưa cuộn tới (artefact của ảnh, nhưng cho thấy rủi ro "reveal để lại vùng mờ" — TS-M3/TS-F4; người dùng in trang / zoom lớn / cuộn bằng phím tắt nhảy cóc sẽ gặp).

### 1.3 Lib/fx, lib/art
- `lib/fx/confetti.ts`: dùng `canvas-confetti`, tôn trọng `reducedMotion()`, màu lấy từ token (`--accent`, `--seal`) + một hex vàng. Đạt. `sparks.ts`, `comboSfx.ts`, `haptics.ts` chỉ đọc lướt qua `wc -l`, chưa mở — chưa xác minh.
- `lib/art`: 40 file SVG thủ công (Emblem, Scenes, StreakCard 256 dòng…). Có hệ biểu tượng riêng ("ấn đỏ §", sách, cổng Ngọ Môn ở NotFound) ⇒ **đặc thù sản phẩm mạnh**, đạt IMP-S1 ("che tên vẫn biết là app luật Việt Nam"). Điểm trừ: UI chrome lại dùng ký tự Unicode làm icon — `←` (nút thoát), `★` (câu vàng, kỷ lục), `§` (ấn), `⚠` (Cài đặt), `✓` (đã qua), `→` trong nút — trộn với bộ SVG outline đã có (`Glyph`, accordion icon 22 px): IMP-B13/X9 P2.

## 2. Tổng quan điểm

| Màn | Impeccable audit /20 | Nielsen /40 | Ghi chú |
|---|---|---|---|
| 7 quiz | 15 (Good) | 30 (Good) | Tốt hơn lesson vì ít nhồi; lỗi Enter, thoát, dim-opacity |
| 8 lesson | 13 (Acceptable) | 28 (Good, sát đáy) | Màn nhồi nhất: hint + strip + panel + bar + combo + XP |
| 9 review | 14 (Good) | 29 (Good) | Dùng chung SessionView; trạng thái rỗng sơ sài |
| 10 profile | 12 (Acceptable) | 26 (Acceptable) | Eyebrow-h1, tủ sách chữ 5–10 px, chữ khoá 3,5:1 |
| 11 settings | 14 (Good, sát đáy) | 28 (Good) | Nhập dữ liệu không xác nhận, slider không đồng bộ |
| 12 notfound | 17 (Good) | 29/36 = 81% (Good; H5 n/a) | Sạch; thiếu nhãn tab, `h1` OK |

Implementation Integrity verdict toàn nhóm: **KHÔNG đạt** (còn lỗi lặp: Enter chiếm phím ở 3 thẻ, kicker/eyebrow ở 9 chỗ, viền trái >1px ở 5 chỗ, `prefers-reduced-motion` tắt sạch).

Tổng: P0 = 0 · P1 = 5 · P2 = 14 · P3 = 8.

---
## 3. Màn 7 — Quiz `#/bo/dat-coc`
Files: `routes/Quiz10.svelte`; ảnh `[shots/390-light-quiz](anh/shots-390-light-quiz.webp)`, `[shots/1280-light-quiz](anh/shots-1280-light-quiz.webp)`, `[s4/quiz-fb-390](anh/s4-quiz-fb-390.webp)`, `[s4/quiz-fb-1280](anh/s4-quiz-fb-1280.webp)`, `[s4/quiz-end-390](anh/s4-quiz-end-390.webp)`.
(Lưu ý: `lib/ui/cards/*`, `SessionView`, `SessionBar`, `SessionEnd`, `Feedback` thuộc luồng lesson/review; quiz dùng markup riêng trong `Quiz10.svelte` — đây là **một triển khai thứ hai** của thẻ trắc nghiệm, xem F-quiz-P3.)

### 3.1 Bảng impeccable audit
| Chiều | Điểm | Bằng chứng |
|---|---|---|
| A1 Accessibility | 3 | Có `role="progressbar"` + `aria-valuetext` (`Quiz10.svelte:141`), `role="group"` phương án (149), `role="status"` cho phản hồi (156), đúng/sai có chữ "Chính xác."/"Chưa đúng. Đáp án: B" ngoài màu (157) — đạt "không chỉ bằng màu". Lỗi: Enter chiếm link thoát, mất focus sau trả lời, `dim` 2,78:1. |
| A2 Performance | 3 | Không ảnh nặng ở quiz; confetti không dùng; animation `pop/shake` là transform. |
| A3 Theming | 3 | Dùng `--ok-bg/--bad-bg/--shelf`; `--shelf` inline từ `shelfFor` (màu theo kệ — đa hue, xem F-quiz-P3). |
| A4 Responsive | 3 | Đã đo: 390 và 320 px không cuộn ngang; phương án rộng 324×(54–76); nút thoát 44×44; "Câu tiếp" 324×44. Nút "Câu tiếp" nằm dưới nếp gấp (xem F-quiz-P2-1). |
| A5 Integrity | 3 | Cấu trúc đặc thù (vé đề "ĐỀ 07", kệ, căn cứ điều luật); nhược: kicker eyebrow, bản sao thẻ MCQ. |
| **Tổng** | **15/20** | Good |

### 3.2 Nielsen
H1 3 · H2 3 · H3 2 · H4 3 · H5 3 · H6 4 · H7 3 · H8 3 · H9 3 · H10 3 = **30/40**. H3 thấp vì: nút `←` thoát tức thì không có hộp xác nhận (khác lesson), **tiến độ quiz không lưu giữa chừng** (`Quiz10.svelte:46-59` chỉ ghi `repo.record` từng câu; vị trí `i`, `score` chỉ trong `$state`) ⇒ F5 hoặc rời đi rồi quay lại là làm lại từ câu 1 với thứ tự đáp án xáo lại (`load()` dòng 37). VN-7/persona Casey. 
Cognitive load: C1–C8 trượt 0 → thấp. Persona: Casey (nút "Câu tiếp" dưới nếp gấp, 1 tay); Sam (Enter bị chiếm); Riley (refresh giữa chừng mất phiên).
Taste tells chạm: TS-X7/IMP-B3 kicker "CÂU 1" (`Quiz10.svelte:147` `.qno`, kiểu eyebrow nhưng đồng thời là dữ liệu — hạng "Câu n" được phép theo TS-X18; chấp nhận); SessionEnd quiz: `kicker` "ĐỀ 07 · LUẬT DÂN SỰ" trên `h1` (dòng 108) — IMP-B3; TS-X24 hover-lift `translateY(-1px)` trên mọi `.opt` (`app.css:246`); TS-A3 không áp dụng.
TS-F4 (phụ): design 7,5 · usability 7 · creativity 8 · content 8.5.

### 3.3 Phát hiện
**[P1] Enter bị chiếm toàn cục: phím Enter trên link "Về Luyện đề" không hoạt động** — `routes/Quiz10.svelte:79-85` (`onkey` gắn `<svelte:window>` dòng 96, `e.preventDefault()` ở dòng 83 với mọi Enter). Đã xác minh bằng Playwright (`s4-verify.cjs`): focus `.qexit`, nhấn Enter ⇒ hash giữ `#/bo/dat-coc` (không điều hướng). `isTypingTarget` (`lib/ui/cards/types.ts:19-22`) chỉ loại `INPUT/TEXTAREA/contenteditable`, không loại `a`, `button`, `summary`. Mã tiêu chí: IMP-A1 (bàn phím), WCAG 2.1.1; IMP-H7; persona Sam. Tác động: người dùng bàn phím/trình đọc màn hình không rời được quiz bằng Enter; trên màn kết quả `finished` thì handler thoát sớm (dòng 80) nên lỗi chỉ ở giữa phiên. Sửa: trong handler, `if (e.target instanceof HTMLElement && e.target.closest('a,button,summary,select')) return;` cho Enter (giữ phím tắt khi focus ở body), hoặc chỉ bắt Enter khi `chosen !== null` và target là body. Lệnh: `/impeccable harden`. Đã xác minh bằng Playwright.

**[P2] Phương án "dim" sau khi trả lời không đạt tương phản** — `app.css:250` `.opt.dim { opacity: .45 }`. Đo (`s4-verify.cjs`, tính chuỗi opacity): chữ phương án 16 px = **2,78:1**, ký tự A–D 1,91:1. Ảnh `[s4/quiz-fb-1280](anh/s4-quiz-fb-1280.webp)`. Mã: IMP-V1/IMP-A1 (1.4.3), TS-C5. Tác động: đúng lúc người học cần đọc lại các phương án sai để hiểu bẫy (giải thích bên dưới nhắc tới chúng), chữ mờ khó đọc, nhất là ngoài sáng/mắt yếu. Sửa: bỏ `opacity`, đổi bằng viền nhạt + chữ `--muted` (5,6:1) hoặc giữ chữ `--ink`, chỉ hạ nền. Lệnh `/impeccable polish`. Đã xác minh bằng số đo.

**[P2] Sau khi trả lời, nút "Câu tiếp" nằm dưới nếp gấp và focus mất** — `Quiz10.svelte:155-161`. Đo: ở 390×844, `scrollY` giữ 0, đáy nút ở y=867 > 844; `document.activeElement` = `BODY` (nút đáp án vừa bấm bị `disabled` ⇒ focus rơi). Ảnh `[s4/quiz-after-click-390](anh/s4-quiz-after-click-390.webp)`, `[s4/quiz-fb-390](anh/s4-quiz-fb-390.webp)` (feedback cao 302 px). Mã: IMP-R2 (vùng ngón cái), IMP-H1; Casey. Khác lesson (có `focusOnMount` cho nút Câu tiếp ở `Feedback.svelte:26,47`, nhưng với `preventScroll: true` nên cũng không cuộn tới). Sửa: sau `pick()`, `await tick(); nextBtn.scrollIntoView({block:'nearest', behavior: reduced?'auto':'smooth'}); nextBtn.focus({preventScroll:true})`; hoặc làm thanh hành động dính đáy ở điện thoại. Lệnh `/impeccable adapt`. Đã xác minh bằng Playwright.

**[P2] Thoát quiz không xác nhận và tiến độ phiên không lưu** — `Quiz10.svelte:140` (link `←` điều hướng thẳng), `:46-59`. Mã: IMP-H3, IMP-H5, VN-7. Tác động: một cú chạm nhầm ở góc trên trái (vùng khó với ngón cái nhưng gần thanh trạng thái) làm mất cả đề 10 câu; so với lesson có hộp "Thoát, giữ tiến độ?". Sửa: lưu `{i, score, results, order}` vào `sessionStorage` và khôi phục; hoặc dùng cùng `confirmExit` của SessionView. Chưa xác minh bằng thao tác thật (suy ra từ code).

**[P2] Reduced-motion tắt sạch** — xem mục 1.2; ở quiz làm mất `pop/shake` (đúng sai vẫn rõ nhờ nền + chữ). Mã: IMP-A1, IMP-M7, X11. Lệnh `/impeccable animate` (viết lại nhánh reduced giữ chuyển màu 120 ms).

**[P2] Kicker/eyebrow trên `h1`** — `Quiz10.svelte:108` ("ĐỀ 07 · LUẬT DÂN SỰ" trên kết quả); `.kicker` `app.css:235`. Mã IMP-B3 (cấm tuyệt đối), TS-X7, X12; chữ HOA có dấu 12 px. Đề xuất: bỏ hoặc nhập vào dòng phụ sentence case dưới tiêu đề ("Đề 07 · Luật dân sự"). Ảnh `[s4/quiz-end-390](anh/s4-quiz-end-390.webp)`. Lệnh `/impeccable typeset`.

**[P2] Khối "Câu cần xem lại" dùng `border-left: 4px` đỏ trên thẻ** — `app.css:604` (`.rv { border-left: 4px solid var(--bad) }`), dùng ở `Quiz10.svelte:127`. IMP-B8; đồng thời mỗi thẻ lặp `Câu n` (kicker đỏ) + đoạn "Bạn chọn / Đáp án đúng". Ảnh `[s4/quiz-end-390](anh/s4-quiz-end-390.webp)`. Sửa: bỏ viền màu, chỉ dùng icon/nhãn "Sai" + nền nhạt toàn thẻ.

**[P3] Ba nút xếp dọc trên điện thoại cùng cỡ ở kết quả: "Làm lại", "Đề tiếp theo", "Về Luyện đề", "Chia sẻ"** (`Quiz10.svelte:116-121`) — 4 hành động hàng dọc 44 px (đã đo `Làm lại 44, Đề tiếp 44, Về Luyện đề 44, Chia sẻ 44`), chỉ một `primary` (tốt, TS-A11) nhưng "Chia sẻ" xếp ngang hàng với điều hướng; vòng điểm 3/10 + kỷ lục + dots + 4 nút trước khi tới nội dung hữu ích "Câu cần xem lại" (IMP-C6, TS-P8: khối hành động đã ở trên — tốt). Chỉ ghi nhận.

**[P3] Quiz có bản triển khai thẻ MCQ riêng khác `CardMcq`** — `Quiz10.svelte:146-154` vs `lib/ui/cards/CardMcq.svelte:36-48`: cùng `.opt/.options` nhưng phím tắt, `aria-label` phương án (`CardMcq` có `aria-label="{KEYS[k]}. {o}"` ở dòng 41, Quiz10 không) và xử lý focus khác nhau. Mã IMP-A5 (drift). Lệnh `/impeccable extract`.

**[P3] `border-top` màu theo kệ (`--shelf`) làm mỗi đề một hue** — ảnh `390-light-quiz.png` thanh trên thẻ xanh cobalt, `1280` cũng xanh; phản hồi lại đỏ/xanh lá. TS-C9 (một họ accent/màn): thanh trên + cam kicker + xanh/đỏ trạng thái = 3 hue. [BRAND]: ghi nhận, không trừ điểm.

---
## 4. Màn 8 — Lesson `#/hoc/hien-phap/hp-1`
Files: `routes/Lesson.svelte` (nhỏ, bọc `SessionView`), `lib/ui/SessionView.svelte`, `SessionBar`, `Feedback`, `cards/Card*`, `LessonStrip`, `LessonPanel`, `WhyPanel`, `CompareTable`, `OrgChart` (OrgChart không xuất hiện ở lesson, chỉ ở Hồ sơ). Ảnh: `shots/390|1280-light-lesson.png`, `[s4/lesson-start-390](anh/s4-lesson-start-390.webp)`, `lesson-card-4-390.png` (màn câu chốt), `lesson-fb-3-390.png` (phản hồi sai, câu vàng), `lesson-end-390.png`, `lesson-confirm-390.png`.
Đã đi hết 27 bước tới SessionEnd (2/5 đúng, +95 XP, chuỗi 1 ngày).

### 4.1 Bảng
| Chiều | Điểm | Bằng chứng |
|---|---|---|
| A1 | 2 | Enter chiếm phím trên toggle "Xem nguyên văn" (đã tái hiện); hộp thoát `role="dialog"` không nhận focus, không `aria-modal`; `dim` 2,78:1; số bậc 10 px; reduced-motion tắt sạch. Tốt: `Feedback` focus vào nút tiếp, `role="status" aria-live="polite"` (`Feedback.svelte:35`), `LessonStrip` cuộn ngang có `tabindex=0` + `aria-label` (`LessonStrip.svelte:6-8`), `h1.sr-only` (`SessionView.svelte:218`). |
| A2 | 3 | `will-change` + animation vô hạn ở thanh tiến độ (`app.css:212,217`), `canvas-confetti`, `sparks`; không layout-thrash. `transition: width .25s` trên thanh tiến độ (`app.css` khối `.session-bar .progress span`, dòng ~203) là animate `width` (IMP-A2, lỗi nhỏ). |
| A3 | 3 | Token tốt; hard-code vàng câu vàng. |
| A4 | 3 | Không tràn ngang 390/320; `LessonStrip` 358×36 (<44 nhưng là vùng cuộn, chip tự thân 28–32 px không tương tác); nút "Đã hiểu" nằm dưới nếp gấp khi có hộp gợi ý. |
| A5 | 2 | Kicker lặp ở lesson (`CardIntro.svelte:25` "KHÁI NIỆM MỚI", `LessonPanel.svelte:8` "ĐỢT NÀY", `SessionView.svelte:226` "LẦN ĐẦU HỌC Ở ĐÂY", `.step-badge`), border-left 3px ở `.why` (`app.css:1576`), `.quote` (121), `.note` (459); thẻ hiển thị kết quả kiểu hero-metric. |
| **Tổng** | **13/20** (2+3+3+3+2) Acceptable | |


### 4.2 Nielsen
H1 3 · H2 3 · H3 3 · H4 3 · H5 3 · H6 3 · H7 2 · H8 2 · H9 3 · H10 3 = **28/40**. H7=2 vì Enter hijack. H8=2 vì thanh phiên cùng lúc có: nút thoát, tiêu đề, thanh tiến độ + mốc, combo lửa, bộ đếm XP, bộ đếm bước; trên đó là dải khái niệm, hộp gợi ý, huy hiệu "CÂU VÀNG · ĐÚNG ĐƯỢC ×2 XP"; ở 390 px, câu hỏi bắt đầu ở y≈310 và "Đã hiểu" ở y≈980 (ảnh `390-light-lesson.png`).
Cognitive load: trượt C1 (nhiều tiêu điểm), C3, C4 (không rõ cái quan trọng nhất — thẻ hay thanh trạng thái), C8 (không progressive disclosure cho combo) ⇒ 4 mục = **nghiêm trọng** khi mới học; Jordan (người mới): hộp gợi ý "Lần đầu học ở đây" giải thích lửa/dấu mộc/XP nhưng chiếm cả màn đầu.
Taste tells chạm: TS-X7/IMP-B3 (6 kicker uppercase trên màn); TS-X13 (lửa/ember vô hạn); TS-X24 (hover-lift `.opt`; confetti ở boss intro làm nền trang trí); TS-X6 `★`; TS-X14 (`rise` entrance). Ngoại lệ ghi nhận: confetti ở "Câu chốt" là khoảnh khắc ăn mừng có chủ đích (X10) nhưng xuất hiện **trước** khi người dùng trả lời câu chốt — tức thưởng trước, không gắn với thành tích (`BossIntro.svelte`, ảnh `lesson-card-4-390.png`).
TS-F4: design 7 · usability 6,5 · creativity 8,5 · content 8.

### 4.3 Phát hiện
**[P1] Enter chiếm phím trên mọi nút/toggle focus trong thẻ intro: "Xem nguyên văn điều luật" không bao giờ mở bằng Enter, thay vào đó bấm "Đã hiểu"** — `lib/ui/cards/CardIntro.svelte:18` (`if (e.key==='Enter') { e.preventDefault(); ok(); }` gắn `<svelte:window>`), cùng mẫu ở `Feedback.svelte:27-31` và `SessionView` (Esc, dòng 209-211). Đã xác minh (`s4-lesson.cjs`): focus `.intro-toggle`, Enter ⇒ `#intro-verbatim` KHÔNG mở và thẻ tự sang bước kế. Đây là **nội dung cốt lõi** (VN-5: nguyên văn điều luật); với bàn phím/screen reader, đường duy nhất tới nguyên văn là Space. Mã: IMP-A1, WCAG 2.1.1 & 3.2.2 (thay đổi ngữ cảnh bất ngờ), IMP-H7. Sửa: như F quiz P1 (loại target là `button/a/summary/[role=button]`), hoặc đổi Enter chỉ kích hoạt "tiếp" khi target = body. Lệnh `/impeccable harden`. Đã xác minh bằng Playwright.

**[P1] `prefers-reduced-motion` tắt mọi animation/transition (kể cả chuyển màu thanh tiến độ, vòng bậc)** — `app.css:106-109`. Xem 1.2. Mã IMP-A1/X11. Lệnh `/impeccable animate`.

**[P2] Hộp "Thoát phiên" không giữ focus, không `aria-modal`, không đóng bằng Esc đúng cách cho focus** — `SessionView.svelte:231-236`; `:209-211` (`onkey` Esc đảo `confirmExit` nhưng `document.activeElement` = `BODY` — đã đo `s4-lesson.cjs`: "esc dialog … focus=BODY"). Hộp hiện **inline** ở y≈323 (không phải overlay) giữa các thẻ, ảnh `[s4/lesson-confirm-390](anh/s4-lesson-confirm-390.webp)`. Mã IMP-H3, IMP-B5 (không modal là đúng, nhưng thiếu focus), WAI-ARIA. Tác động: người dùng bàn phím bấm Esc rồi phải Tab lại từ đầu trang để tìm "Thoát/Ở lại". Sửa: focus nút "Ở lại" khi mở; trả focus về nút `←` khi đóng; `role="alertdialog"` hoặc `role="group"` (không giả dialog khi không chặn focus). Lệnh `/impeccable harden`.

**[P2] Phương án "dim" (opacity .45) khó đọc** — cùng F-quiz; ảnh `[s4/lesson-fb-3-390](anh/s4-lesson-fb-3-390.webp)` (phương án B và D gần như biến mất; đây là chữ luật dài 2 dòng). Sửa như trên.

**[P2] Hiệu ứng "sheen" quét qua thẻ câu vàng làm chữ câu hỏi nhạt cục bộ** — `app.css:309-310` (`.step-wrap.golden .question-card::after` gradient trắng 55% quét ngang, `sheen`). Ảnh `[s4/lesson-fb-3-390](anh/s4-lesson-fb-3-390.webp)` cho thấy các từ ("vụ Quốc hội", "nhất", "hội có quyền") nhạt đi giữa chừng câu hỏi dài 8 dòng. Mã IMP-M1/TS-M4 ("không chuyển động băng qua chữ đang đọc"), TS-X24. Đã xác minh bằng ảnh (chụp lúc animation đang chạy; chưa đo ratio tức thời). Sửa: chỉ sheen viền hoặc tắt sau 600 ms; không phủ lên văn bản.

**[P2] Boss intro dựng một màn riêng gần 1,6 s + confetti trước khi có thành tích** — `lib/ui/session/BossIntro.svelte` (toàn file: `setTimeout(finish, 1600)`, nút "Vào câu chốt") + `SessionView.svelte:237-238`. Ảnh `[s4/lesson-card-4-390](anh/s4-lesson-card-4-390.webp)`: thẻ gần trống 840 px chiều cao, confetti rơi. IMP-M6 (Operate không dàn dựng), IMP-H7 (Alex: người học lại phải chờ/bấm). Có Enter/nút để bỏ qua (tốt) nhưng thêm một bước. Sửa: gộp vào huy hiệu `step-badge` "Câu chốt" trên chính thẻ; dành confetti cho khi đúng câu chốt. Lệnh `/impeccable quieter`.

**[P2] Hộp gợi ý "Lần đầu học ở đây" chen giữa thanh khái niệm và thẻ đầu tiên, đẩy nội dung và nút xuống dưới nếp gấp** — `SessionView.svelte:224-230`, ảnh `390-light-lesson.png` (thẻ bắt đầu y≈325, "Đã hiểu" y≈980/844). Mã IMP-C1, IMP-H10, persona Jordan/Casey. Sửa: gợi ý một dòng dưới thanh phiên (hoặc coach-mark gắn vào ngọn lửa khi lửa xuất hiện lần đầu), không phải thẻ cam lớn + nút "Ẩn gợi ý".

**[P2] Kicker/eyebrow nhiều lớp + thẻ lồng thẻ**: `CardIntro.svelte:25`, `LessonPanel.svelte:8`, `SessionView.svelte:226`, `Feedback` (WhyPanel `.why-title`), `SessionEnd.svelte:34`. Mã IMP-B3, TS-X7 (tối đa 1/màn). Ảnh `1280-light-lesson.png` có 3 nhãn HOA tracking cùng lúc ("LẦN ĐẦU HỌC Ở ĐÂY", "KHÁI NIỆM MỚI", "ĐỢT NÀY"). Lệnh `/impeccable typeset`.

**[P2] Viền trái màu >1 px**: `.quote` 3px seal (`app.css:121`, thẻ intro nguyên văn), `.note` 3px (`app.css:459`), `.why` 3px accent (`app.css:1576`, hộp "Vì sao?" ảnh `lesson-fb-3-390.png`), `.sort-list li` 3px (298-299), `.rv` 4px (604). Mã IMP-B8 (5 chỗ ⇒ hệ thống). Sửa: nền nhạt + tiêu đề, hoặc viền 1px toàn khung. `.quote` là trích dẫn luật (chấp nhận 1 vạch nếu 1 px). Lệnh `/impeccable distill`.

**[P2] Màn kết quả (`SessionEnd`) dùng hero-metric + thẻ chỉ số xếp chồng** — `SessionEnd.svelte:34 (kicker "XONG PHIÊN"), 41 (`+95 XP` cam lớn), 42-48 (dl 4 ô: Combo/Sửa được/Tỉ lệ đúng…)`; ở 390 px các ô nhỏ xếp 1 cột dọc, mỗi ô có nền riêng (ảnh `[s4/lesson-end-390](anh/s4-lesson-end-390.webp)`: ba ô giữa màn). Mã IMP-B2, X7, TS-A3 (KPI là chữ, không phải ô), TS-L3 (ô hẹp để trống hai bên). Câu trả lời cho "tôi đã làm tốt không?" bị chia bốn: vòng 2/5, +95 XP, 40%, "Sửa được 1/3". Con số trùng: "2/5 đúng" và "Tỉ lệ đúng 40%" (cùng dữ kiện, TS-F2(4)). Sửa: một dòng văn "2/5 câu đúng · +95 XP" + danh sách nhãn-trái/giá-trị-phải; bỏ ô.

**[P2] Số liệu XP nguồn dùng thanh cam đầy cho mọi hàng gần như bằng nhau** — `SessionEnd.svelte:75-79`(thanh `i > span` `width: s.xp/maxSrc`). Chỉ là chú ý: thanh "Bài học lần đầu" 100% còn lại 40–10% — tỉ lệ đúng nhưng **không có nhãn hai đầu** (TS-S5) và là 4 thanh cam trang trí cạnh số (TS-X12 nhẹ). Đề xuất: bỏ thanh, giữ danh sách.

**[P3] Số bậc trong vòng `.ring` 10 px** — `LessonStrip.svelte:31` `ring mini` (`<b>{lv}</b>`), đo `fs=10` (`s4-verify.cjs`) — dưới 11 px (X4: <11 = P1 nếu là nội dung đọc). Số này lặp `aria-hidden`+`sr-only "bậc n"` nên chỉ là trang trí trực quan ⇒ hạ P3.

**[P3] Phím tắt 1–4 và `↵` hiển thị trên thiết bị cảm ứng** — `Feedback.svelte:47`, `CardIntro.svelte:49` (`<kbd>↵</kbd>`), `app.css:268`: nhãn phím hiện cả ở điện thoại (ảnh `390-light-lesson.png` "Đã hiểu ↵") — noise, không dùng được. IMP-R4: ẩn bằng `@media (hover: none)`.

**[P3] Chip tóm tắt cao không đều**: ảnh `1280-light-lesson.png` chữ nằm sát đỉnh chip 1–2 và dư khoảng trắng đáy (chip co dãn theo hàng flex). VN-2 không cắt dấu, chỉ canh dọc.

**Positive**: phản hồi sai đưa đủ: đáp án đúng, giải thích, hộp "Vì sao?" với dấu hiệu quyết định và "Dễ nhầm với «…»", nguồn có link (ảnh `lesson-fb-3-390.png`) — đạt IMP-H9, VN-5; "Chữ nghiêng: dấu hiệu tóm tắt, không phải nguyên văn điều luật" tách nguyên văn khỏi tóm tắt (trung thực, TS-W5); hộp thoát nói rõ "Những câu đã trả lời đã được lưu" (trấn an IMP-S2, `SessionView.svelte:233`); thông điệp sai không trách ("Sai thì chuỗi về 0, không mất điểm đã có").

---
## 5. Màn 9 — Review `#/on`
Files: `routes/Review.svelte` + SessionView. Ảnh: `[shots/390-light-review](anh/shots-390-light-review.webp)` (trạng thái rỗng), `[s4/review-390](anh/s4-review-390.webp)`, `[s4/review-1280](anh/s4-review-1280.webp)` (phiên ôn có thật sau khi seed IndexedDB: câu vàng trắc nghiệm).
| Chiều | Điểm | Ghi chú |
|---|---|---|
| A1 | 2 | Cùng lỗi Enter/reduced-motion; trạng thái rỗng có `h1` + nút thật. |
| A2 | 3 | |
| A3 | 3 | |
| A4 | 3 | Phương án dài 5 dòng ở 390 px, đáp án D cắt dưới nếp gấp (ảnh `review-390.png`). |
| A5 | 3 | |
| **Tổng** | **14/20** | |
Nielsen: H1 3 · H2 3 · H3 3 · H4 3 · H5 3 · H6 3 · H7 2 · H8 3 · H9 3 · H10 3 = **29/40** (trừ H10: trạng thái rỗng).

**[P2] Trạng thái rỗng không nói khi nào có bài ôn và không có đường vào học** — `routes/Review.svelte:50` (dòng `<section class="card"><h1>Ôn hôm nay</h1><p>Chưa có gì cần ôn…`). Chỉ có một nút "Về Hôm nay"; không có "Hẹn ôn: 5 khái niệm vào ngày mai" (dữ liệu có sẵn — `SessionEnd` đã tính `dueTomorrow`), không nút tới môn/đợt. Ảnh `390-light-review.png`: card ở đỉnh, 78% màn trống, **không có thanh tab** ở route này (đã nhìn ảnh: chỉ có nút), nên người dùng mới (Jordan) cụt đường. Mã TS-S2, IMP-H10, IMP-V6. Sửa: "Chưa có khái niệm nào đến hạn. Lần ôn gần nhất: ngày mai (5 khái niệm)" + nút chính "Học đợt tiếp theo". Lệnh `/impeccable onboard`.

**[P3] `Review.svelte:55` (lỗi tải) gộp 3 lỗi mạng/dữ liệu thành "Không tải được dữ liệu: {message}"** — hiện message kỹ thuật thô (IMP-H9, IMP-H2: jargon). Chưa xác minh bằng cách ép lỗi.

**[P3] Tiêu đề h1 "Ôn hôm nay" dùng Noto Serif Display 28 px trong trạng thái rỗng nhưng trong phiên là `h1.sr-only`** (`SessionView.svelte:218`) — ở phiên không có tiêu đề thấy được (thanh `SessionBar` có `title` span `SessionBar.svelte:19` nhưng chỉ hiện nếu đủ rộng; ở 390 px đã ẩn, ảnh `review-390.png`). Người dùng không biết đang ôn gì/bao nhiêu câu; chỉ có đếm 0/5. H1 hơi thấp.

---
## 6. Màn 10 — Profile `#/toi`
Files: `routes/Profile.svelte`, `lib/ui/StreakPanel`, `career/CareerSection`, `OrgChart`, `MasteryGrid`(không có ở Hồ sơ; ở màn môn), `RankBadge`, `StreakFlame`, `WeekDots`, `LevelLegend`. Ảnh `shots/390|1280-light-profile.png`, `[s4/profile-after-390](anh/s4-profile-after-390.webp)`.
| Chiều | Điểm | Bằng chứng |
|---|---|---|
| A1 | 2 | `h1` 12 px kiểu eyebrow; tab dùng `role="tab"` trên `<a>` không có `aria-controls`/phím mũi tên (`Profile.svelte:151-154`); chữ khoá `Chưa mở` 3,5:1; tủ sách chữ 5–10 px (có `sr-only` tên đầy đủ). Tốt: accordion đúng mẫu (`aria-expanded`, `aria-controls`, `role=region`, `inert` khi đóng — `Profile.svelte:163-189`). |
| A2 | 2 | Nhiều SVG art + animation vô hạn trong thẻ chuỗi (dòng 957–970); khối OrgChart blur filter reveal (1329). Trang dài ~3365 px ở 390. |
| A3 | 3 | |
| A4 | 3 | Đã đo: không tràn ngang 390/320; ở 1280, ô "0 ngày / Chưa có chuỗi · 0 XP" bị bóp xuống 4 dòng chữ (ảnh `1280-light-profile.png`, y≈70–105 của ảnh rút gọn). |
| A5 | 2 | Eyebrow (`idc-eyebrow`), kicker ở 4 chỗ, số chuỗi lặp 3 lần, tủ sách trang trí lớn trước thông tin. |
| **Tổng** | **12/20** | Acceptable |
Nielsen: H1 3 · H2 3 · H3 3 · H4 2 · H5 n/a→3 · H6 3 · H7 2 · H8 2 · H9 3 · H10 2 = **26/40**.
Persona Jordan: 5 giây đầu thấy "Công dân / Khởi đầu · Hành pháp & chính quyền địa phương" — không giải nghĩa "chức danh mô phỏng" lên thẻ (có dòng nhỏ ở nơi khác); tủ sách 212 cuốn chưa có sách nào ⇒ vùng sách mờ trống chiếm màn đầu (TS-L3 "lỗ"/TS-S2 "lần đầu: đặt hành động đầu tiên đúng chỗ" — hành động đầu tiên "Xem điều kiện →" nhỏ, ở thẻ căn cước).
Taste tells chạm: TS-X7/IMP-B3 (6 kicker: "CHỨC KẾ TIẾP · CƠ SỞ", "CHỨC HIỆN TẠI", "7 NGÀY GẦN NHẤT", "KHÁI NIỆM THEO BẬC GHI NHỚ", h1 eyebrow); TS-X17 (khung gỗ + viền kép: hairline/`4px double` ở `app.css:773,880,886` — phong cách tủ gỗ, [BRAND]); TS-X13 (lửa vô hạn); TS-A3/IMP-B2 (số chuỗi lớn + lưới 4 ô `sp-stats`); TS-X5 không; TS-X21 (18 cỡ chữ, một số 44/54 px).

**[P1] Tên trang `h1` "Hồ sơ" bị tạo kiểu eyebrow 12 px HOA, tiêu đề thấy được là một `<p>`** — `Profile.svelte:122` (`<h1 id="idc-h1" class="idc-eyebrow">Hồ sơ</h1>`) và `:123` (`<p class="idc-title">{t.title}</p>`); đo: `H1 .idc-eyebrow 12px` (`s4-verify.cjs`), "Công dân" là `p` 22–28 px. Mã IMP-B3 (eyebrow trên heading — ở đây chính h1 là eyebrow), TS-T2 (tiêu đề trang 18–32 px), TS-L4, IMP-A1 (cấp heading: người dùng screen-reader nghe "Hồ sơ" rồi "Cài đặt" h2). Ở tab Cài đặt cùng thẻ vẫn nói h1 "Hồ sơ" rồi h2 "Cài đặt" (`Settings.svelte:34`), đúng ngữ nghĩa nhưng thị giác ngược: tiêu đề lớn nhất là chức danh "Công dân". Sửa: h1 = chức danh (hoặc "Hồ sơ" 24 px) và dòng phụ sentence case. Mức P1 vì lặp ở 2 màn + là mã cấm tuyệt đối. Lệnh `/impeccable typeset`. Đã xác minh bằng đo + ảnh.

**[P2] Chữ ở trạng thái "Chưa mở" của cây chức vụ chỉ 3,5:1** — `OrgChart.svelte` (class `.org-name`, `.org-meta` dòng nhãn) đo `3.50` cho `Chủ tịch nước`, `Thủ tướng Chính phủ`… 14 px/600 và `Chưa mở` 12 px (đo `s4-verify2.cjs`; tính chuỗi opacity — thay vì probe cũ). Mã IMP-A1 (1.4.3), TS-C5. Tên chức là thông tin (người học cần biết "chức tiếp theo là gì"). Làm mờ để biểu thị khoá là hợp lý nhưng nên dùng icon khoá + chữ `--ink` 7:1 hoặc `--muted` 5,6:1. [Nhận xét: đã loại các số 1,31/1,07 của "Hành pháp, Lập pháp…" vì là chữ trắng trên nền gradient/xanh — dương tính giả.] Đã xác minh bằng số đo.

**[P2] Chữ dưới 11 px trong tủ sách và cây chức vụ** — gáy sách `bk-label` 5,4 px, `bk-name` 8,7–10,5 px (`s4-verify.cjs`, class `bk-*`), đếm `0/2`,`0/3` 10 px ở OrgChart. Mã X4 (<11 = P1) nhưng gáy sách là artwork và có `sr-only` tên sách đầy đủ (vd "Thương mại 2: Luật Thương mại …") ⇒ hạ **P2** cho gáy sách, **P2** cho số đếm 10 px của OrgChart (chữ UI thật). Sửa: số đếm ≥12 px; gáy sách chấp nhận nhưng tối thiểu 10,5 px và tăng tương phản (chưa đo được vì nền là ảnh).

**[P2] Ba chỗ nói cùng một số chuỗi ngày** — `Profile.svelte:131` (`<b>{streak.count} ngày</b>… {xp} XP`), `StreakPanel.svelte:23` (`sp-big <b>{streak.count}</b> ngày liên tiếp`), `StreakPanel.svelte:13` (`stats[0] 'Chuỗi hiện tại'`) + `StreakFlame`/topbar/sidebar (Shell). TS-F2(4) (số lặp phải khớp — khớp, nhưng redundancy), TS-A3, IMP-B2. Ở 1280 px phần chuỗi bị nhồi: chữ "Chưa có chuỗi · 0 XP" ngắt thành 3 dòng trong ô hẹp. Sửa: chỉ giữ ở thẻ căn cước; accordion "Chuyên cần & tiến độ" nói 7 ngày + bậc.

**[P2] Eyebrow/kicker 5 chỗ ở Hồ sơ** — `Profile.svelte:140` (`<span class="kicker">Chức kế tiếp · …`), `StreakPanel.svelte:27,32` (`kicker sp-k`), `CareerSection` (Chức hiện tại), `h1.idc-eyebrow`. IMP-B3/TS-X7. Lệnh `/impeccable typeset`.

**[P2] Trang đầu của người mới là tủ sách 212 cuốn trống, hành động đầu tiên không rõ** — ảnh `390-light-profile.png`: khối kính-gỗ (≈50% chiều cao 390 px đầu tiên) không có sách nào "sáng"; dòng chú thích nhỏ "Chưa có sách chương nào · học hết 1 chương để nhận cuốn đầu tiên." ở đáy tủ. TS-S2, TS-L8 (khối lớn nhất không trả lời câu hỏi của màn: "tôi đang ở đâu, tiếp theo làm gì?"), TS-X25. Sửa: đưa "Chức kế tiếp + nút hành động" lên đầu (đã có nhưng nhỏ), thu tủ gập lại ở lần đầu.

**[P2] Hai tab `role="tab"` trên thẻ `<a>`, không có `aria-controls`/phím mũi tên** — `Profile.svelte:151-154`; `tabpanel` không `aria-labelledby` (dòng 160, 162). Mã IMP-A1 (ARIA). Hoặc bỏ role tablist (hai link điều hướng thường + `aria-current="page"`), hoặc triển khai đủ roving tabindex. Lệnh `/impeccable harden`.

**[P3] Ảnh full-page để lộ vùng OrgChart mờ do reveal-on-scroll chưa kích hoạt** — `app.css:1329`; tại viewport thật nút hiện dần khi cuộn tới (không xác minh bằng cuộn thật). TS-M3. Sửa: đừng dùng blur khi hiện; hiện ngay cho `IntersectionObserver` chưa sẵn sàng; đã có nhánh reduced.

**[P3] Ba họ font + cỡ 44/54 px (số chuỗi trong `StreakCard`)** — TS-T2 (không chữ ≥48); [BRAND]/art nên giữ.

**[P3] Chú thích pháp lý đặt cuối trang** — `Profile.svelte:193-195` ("Thông tin pháp luật chung, không phải tư vấn pháp lý…"): đạt VN-5, nhưng chỉ có ở Hồ sơ; ở quiz/lesson không có dòng này ở nơi người dùng nhìn thấy (nội dung luật xuất hiện ở lesson/quiz, nơi cần nhất) — chưa xác minh Shell/footer có hiển thị trên các màn này (ảnh lesson không thấy).

**Positive**: accordion đúng chuẩn; trạng thái rỗng "Chưa học khái niệm nào · Học đợt đầu tiên →" (`StreakPanel.svelte:34`) đúng TS-S1; `sr-only` tên sách; `localStorage` bọc try/catch (`Profile.svelte:73-80`, đúng quy ước); cây chức vụ dùng icon + chữ, không chỉ màu; tên "chức danh mô phỏng" nói rõ không phải chức thật (trung thực, VN-6).

---
## 7. Màn 11 — Settings `#/cai-dat`
Files: `routes/Settings.svelte` (render bên trong `Profile` tab). Ảnh `[shots/390-light-settings](anh/shots-390-light-settings.webp)`, `s4/*` không có ảnh riêng.
| Chiều | Điểm | Bằng chứng |
|---|---|---|
| A1 | 3 | Nhãn bọc `<label class="setting">` cho mọi control; ô chọn/slider có tên; chú thích `muted small`. Thiếu `aria-describedby` giữa slider và câu giải thích (dòng 41–42), tab ARIA như Hồ sơ. |
| A2 | 4 | |
| A3 | 3 | `accent-color` của checkbox là cam (đã đo `rgb(217,122,30)`), slider/`select` để `auto` ⇒ **xanh mặc định của trình duyệt** (ảnh `390-light-settings.png` thanh trượt xanh) — drift. |
| A4 | 2 | Slider 129×16 (thumb ~16 px) — mục tiêu cảm ứng nhỏ; checkbox 22×22 dù hàng nhãn cao ≥50; ô nhập file ẩn `sr-only` 1×1 bọc bởi `label.btn` 44 px (tốt). |
| A5 | 2 | `<h2 style="margin-top:0">` inline (dòng 34); `⚠` emoji (35); 2 mô hình lưu trộn: checkbox/select lưu ngay không "Đã lưu" (TS-A10), `pref` riêng trình duyệt (không vào file xuất). |
| **Tổng** | **14/20** | (3+4+3+2+2) Good thấp |
Nielsen: H1 2 (không "Đã lưu") · H2 3 · H3 3 · H4 3 · H5 1 (nhập dữ liệu không xác nhận) · H6 3 · H7 3 · H8 4 · H9 3 · H10 3 = **28/40**.

**[P1] "Nhập dữ liệu" ghi đè tiến độ không xác nhận, không báo số bản ghi, không sao lưu tự động** — `Settings.svelte:21-30` (`importData`), `lib/store/progress-repo.ts:123-129` (Dexie `bulkPut` ghi đè từng `conceptId`, `stats`, `settings` trùng khoá; nhánh in-memory dòng 86-90 thay hẳn Map). Người chọn nhầm file cũ ⇒ **hạ cấp bậc/lịch FSRS/chuỗi/XP**; không có undo. Thông điệp sau nhập chỉ "Đã nhập dữ liệu." (dòng 28); lỗi chỉ "File không hợp lệ." (không nói vì sao/sửa thế nào — IMP-H9). Mã IMP-H5, TS-A9 (destructive cần nêu hậu quả), IMP-H9; persona Riley. Chưa xác minh bằng thao tác thật (suy ra từ code đã đọc). Sửa: preview "File này có N khái niệm, mới nhất ngày …; hiện bạn có M. Thay thế hay gộp (giữ bản mới hơn)?" + tự tải xuống bản sao trước khi ghi. Lệnh `/impeccable harden`.

**[P2] Không có chỉ báo "Đã lưu" cho tuỳ chọn lưu ngay** — `Settings.svelte:36-45` (`saveSetting` trên `onchange`). TS-A10, IMP-H1. Ngoài ra `Cách học` "Đoán trước…" lưu riêng ở `localStorage` (`setPref`) "không nằm trong file xuất" (dòng 55 nhắc) — khác nơi lưu với phần còn lại, người dùng không phân biệt được (IMP-A5).

**[P2] Slider "Mục tiêu nhớ" xanh mặc định, thumb 16 px, giá trị trong nhãn bị cắt ngắt dòng** — `Settings.svelte:44-45`, đo `accent-color: auto`, `INPUT 129×16`. Ảnh `390-light-settings.png`: "Mục tiêu nhớ (retention) 90%" xuống hai dòng, thanh ở bên phải. IMP-R3/R8, TS-C9. Sửa: `accent-color: var(--accent)`, `min-height:44px` vùng chạm, bỏ jargon "retention" tiếng Anh khỏi nhãn chính ("Mục tiêu nhớ 90%" + chú thích). Lệnh `/impeccable polish`.

**[P2] Nhãn "Tự đọc phản hồi…" dài 3 dòng chứa chi tiết kỹ thuật** — `Settings.svelte:36` ("giọng neural dựng sẵn nếu có, không thì giọng vi-VN của trình duyệt"): IMP-H2 (jargon), VN-3. Sửa: "Tự đọc phản hồi" + dòng phụ. Đồng thời lần tải đầu `/tts/manifest.json` 404 (xem mục 0).

**[P3] Emoji `⚠`** — `Settings.svelte:35` ("⚠ Trình duyệt đang chặn lưu trữ…"): IMP-B13; nên dùng `Glyph` SVG + `role="alert"`.

**[P3] Không có "Xoá dữ liệu"** — không phải lỗi (H5: không có hành động huỷ nguy hiểm trong màn); ghi nhận để khi thêm phải có xác nhận.

**Positive**: bố cục đơn giản đúng một cột, hàng cách nhau, nút "Xuất/Nhập dữ liệu" `ghost` cùng cỡ 156×44 (TS-A11); chú thích "Cao hơn = ôn dày hơn nhưng nhớ chắc hơn. Mặc định 90%." (giải thích hậu quả, TS-A9); trạng thái "Trình duyệt này không có giọng tiếng Việt; nút nghe sẽ được ẩn" (nói vì sao).

---
## 8. Màn 12 — NotFound `#/khong-co`
Files: `routes/NotFound.svelte` (đọc đủ; dòng 9–20 là markup). Ảnh `shots/390|1280-light-notfound.png`.
| Chiều | Điểm | Ghi chú |
|---|---|---|
| A1 | 4 | `h1` rõ, hai link dạng `.btn`, tiêu đề tài liệu cập nhật (`document.title`, dòng 5), tương phản đạt (đã đo: không dòng LOW). Chưa tự focus tiêu đề khi route đổi (chưa xác minh trong `App.svelte`). |
| A2 | 3 | Hình Ngọ Môn raster/SVG lớn (`PAGE_ART.notfound`); không lazy-load đo được. |
| A3 | 3 | |
| A4 | 4 | Đã đo 390/320: không tràn. |
| A5 | 3 | Nút thật; hai nút đặt trong `<p>` (`NotFound.svelte:16-19`) — khoảng cách chỉ nhờ khoảng trắng, không `gap`; ảnh cho thấy hai nút sát nhau (~4 px). |
| **Tổng** | **17/20** | Good |
Nielsen: H1 3 · H2 4 · H3 3 · H4 3 · H5 n/a · H6 4 · H7 3 · H8 3 · H9 3 (nêu "Địa chỉ này không tồn tại hoặc đã đổi" + 2 đường ra) · H10 3 → 29/36 = 81% (Good). 
Taste tells: TS-X25 nhẹ không (có hình đặc thù); TS-A2 "banner minh hoạ chào mừng" — hình Ngọ Môn cao 190 px trong thẻ lỗi: đặc thù văn hoá, chấp nhận [BRAND]; IMP-S1 đạt.

**[P3] Hai nút nằm trong `<p>`, khoảng cách tới nhau 4 px, không `gap`** — `NotFound.svelte:16-19`. Ảnh `390-light-notfound.png`. Sửa: bọc `div.row` có `gap: var(--sp-3)` (lớp `.row` đã có ở SessionEnd). Lệnh `/impeccable layout`.

**[P3] Không gợi ý trang gần đúng/không có tìm kiếm; ở 390 px thanh tab ẩn dưới thẻ?** — thanh tab hiển thị đúng (ảnh). Chỉ ghi nhận.

**Positive**: văn bản nói rõ vấn đề + cách ra; tiêu đề danh từ; dùng chung `.card`/`.btn`.

---
## 9. Patterns & Systemic issues (lỗi ≥3 chỗ)
1. **Phím tắt Enter toàn cục nuốt kích hoạt của control đang focus** — `Quiz10.svelte:83`, `CardIntro.svelte:18`, `Feedback.svelte:27-31` (và bản `Esc` ở `SessionView.svelte:210`). Gốc: `isTypingTarget` (`cards/types.ts:19-22`) quá hẹp. Một hàm `isInteractiveTarget` dùng chung sửa cả ba. **P1**, `/impeccable harden`.
2. **Eyebrow/kicker HOA tracking 12 px** — `app.css:235` + ≥9 chỗ trên 6 màn (`Quiz10:108`, `CardIntro:25`, `LessonPanel:8`, `SessionView:226`, `SessionEnd:34,84`, `Profile:122,140`, `StreakPanel:27,32`). IMP-B3 cấm tuyệt đối, TS-X7. **P2 hệ thống**; một `.kicker` → sentence case 14 px `--muted` sửa toàn bộ.
3. **Viền trái màu >1 px** — `app.css:121, 298, 459, 604, 1576`. IMP-B8. P2.
4. **Reduced-motion tắt sạch** — `app.css:106-109`. P1 hệ thống.
5. **Ký tự Unicode làm icon** (`← ★ § ⚠ ✓ →`) lẫn với bộ SVG. IMP-B13. P2.
6. **Giảm độ trong suốt làm chữ nhạt** — `opacity .45` (`app.css:250`), `.org-node` khoá 3,5:1. TS-C5. P2.
7. **Hardcode màu ngoài token** (vàng `#f2c14e`, `#fff`, nâu biển tên). P3.
8. **Vòng lặp vô hạn trang trí** (`app.css:138,212,217,816–818,957–970`). TS-X13. P2.

## 10. Positive findings tổng
- Hệ token spacing/size/radius có tài liệu ngay trong CSS (`app.css:16-25`), `--ctl-h` 44 trên điện thoại ⇒ tất cả control đo được ≥44 px (nút thoát 44×44, "Câu tiếp" 324×44, nút kết quả 44).
- Không cuộn ngang ở 390 và 320 px ở cả 5 màn đo; `env(safe-area-inset-bottom)` trong tabbar.
- Phản hồi đúng/sai dùng **màu + chữ + vị trí**, không chỉ màu (IMP-K6).
- Trấn an cảm xúc: "Điểm thấp lúc đầu là bình thường", "Sai thì chuỗi về 0, không mất điểm đã có", "Đoán sai không sao" — phù hợp IMP-S2 và VN-6.
- Nội dung luật: nguyên văn tách khỏi tóm tắt, nguồn + link "Xem điều luật" ở cả quiz và lesson, chú thích "không phải tư vấn" ở Hồ sơ.
- Đặc thù thị giác mạnh (Ngọ Môn, ấn đỏ §, tủ sách gỗ, mây nền) — không thể nhầm với app khác (IMP-S1 đạt).
- `localStorage` luôn bọc try/catch; accordion/aria tốt; `Feedback` focus vào nút tiếp theo.

## 11. Thứ tự sửa đề xuất (theo TS-F5)
1. Helper `isInteractiveTarget` cho Enter/Esc (3 file) — 15 phút, hết 2 lỗi P1.
2. Quiz: cuộn+focus nút "Câu tiếp"; sessionStorage cho phiên quiz; xác nhận thoát.
3. Hồ sơ: đổi h1; bỏ eyebrow toàn hệ thống; sửa tương phản "Chưa mở"/dim.
4. Cài đặt: xác nhận nhập dữ liệu + sao lưu tự động.
5. Reduced-motion có nhánh "giảm" thay "tắt".
6. Guard `route.params` trong effect (2 request 404 rác) và thêm `tts/manifest.json` rỗng hoặc bỏ fetch khi không có giọng neural.

## 12. Những gì chưa xác minh
- Máy thật/touch gesture, Safari/Firefox, TalkBack/VoiceOver; font tải offline (SW) — chưa kiểm.
- `sparks.ts`, `comboSfx.ts`, `haptics.ts`, `CompareTable`, `CareerSection`, `ComboMeter`, `XpCounter` chưa mở; chưa chấm riêng.
- Các dạng thẻ khác ngoài intro + trắc nghiệm + định nghĩa→thuật ngữ (cloze, sort, match, pair, recall) chưa được script đi tới (script bấm tự động nhưng chỉ ghi 3 loại thẻ).
- Chưa đo tương phản tức thời của sheen câu vàng; chưa xác minh lỗi "mất tiến độ quiz khi F5" bằng thao tác thật.
