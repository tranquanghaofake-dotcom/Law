# Bảng tiêu chí audit giao diện — Luyện Luật

Chưng cất từ [`impeccable`](https://github.com/pbakaus/impeccable) (IMP-*, `.claude/skills/impeccable/`) và [`taste-skill`](https://github.com/leonxlnx/taste-skill) (TS-*, `skills/taste-skill/`), bản clone ngày 04/11/2026. Đối tượng: **app** (màn học, quiz, hồ sơ), mobile-first, PWA, Svelte 5, tiếng Việt có dấu, có game hoá. Mode impeccable = **Operate** (+ Read cho màn định nghĩa luật). Mỗi mục kiểm được bằng ảnh chụp (390 px + 1280 px) hoặc đọc code; cột cuối ghi cách kiểm: [A]=ảnh, [C]=code.
Cách trích: `IMP-B3`, `TS-T4`, `VN-2`. Mức nặng mặc định khi vi phạm: xem mục 1.3.

**Đã bỏ** (chỉ cho native/landing/marketing/công cụ chạy script): mode Persuade/Experience, iOS/Android, adapt cho email/print, live/generate/overdrive/bolder; taste: `draw.mjs`, hero blueprint, scroll scene, preloader/counter/cursor/Lenis, đếm ảnh thật ≥4, "live thing", logo/competitor test, Awwwards cap về ảnh/motion trang, quy tắc font `<link>` từ direction sheet, mọi lệnh `inspect/lint/detect` (không chạy được, thay bằng ảnh + đọc code).

---
## 1. Khung chấm impeccable AUDIT (kỹ thuật, web) — nguồn `reference/audit.md`

### 1.1 Năm chiều, mỗi chiều 0–4
| # | Chiều | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|---|
| IMP-A1 | Accessibility | Fail WCAG A | Thiếu nhiều ARIA/bàn phím | Có nỗ lực, còn lỗ hổng lớn | Đạt AA, lỗi nhỏ | AA đủ, gần AAA |
| IMP-A2 | Performance | Layout thrash, không tối ưu | Không lazy-load, animation nặng | Tối ưu một phần | Gần như tối ưu | Nhanh, gọn |
| IMP-A3 | Theming | Hard-code toàn bộ | Token tối thiểu, đa phần hard-code | Có token nhưng dùng không nhất quán | Token dùng tốt, vài hard-code | Token đầy đủ, dark mode hoàn chỉnh |
| IMP-A4 | Responsive | Chỉ desktop | Vài breakpoint, nhiều lỗi | Chạy được mobile, còn thô | Tốt, lỗi nhỏ về touch target/overflow | Fluid, đủ viewport, gesture chạy khi chạm |
| IMP-A5 | Implementation Integrity | Drift hệ thống | Lỗi lặp lại nghiêm trọng | Vài lỗi đã xác minh | Lỗi nhỏ, lẻ | Mạch lạc, có chủ đích, đặc thù sản phẩm |

**Việc kiểm theo chiều** (mỗi dòng là 1 tiêu chí con):
- A1: contrast chữ <4.5:1 (lớn <3:1; icon/viền control/focus ring <3:1) [A][C]; `prefers-reduced-motion` có phương án thay thế giữ được phản hồi trạng thái, KHÔNG tắt sạch bằng `0.01ms` [C]; ARIA/role/nhãn cho control không có chữ [C]; focus ring nhìn thấy + thứ tự tab hợp lý, không bẫy bàn phím [A][C]; HTML ngữ nghĩa (heading đúng cấp, landmark, `button` không phải `div`) [C]; alt ảnh [C]; input có label + lỗi nêu rõ + đánh dấu bắt buộc [A][C]; thông tin không chỉ bằng màu (đúng/sai quiz phải có icon/chữ) [A].
- A2: animate thuộc tính layout (width/height/top/left/margin) [C]; blur/filter/shadow không giới hạn [C]; ảnh không lazy-load/không tối ưu [C]; `will-change` bật tràn lan [C]; import/dependency thừa; re-render thừa (Svelte: `$effect` vòng, store lớn) [C].
- A3: màu hard-code ngoài token [C]; dark mode thiếu/contrast kém [A]; token dùng sai loại; giá trị không đổi khi đổi theme [A][C].
- A4: width cố định vỡ mobile [C]; touch target <44×44 (WCAG AA 2.5.8 tối thiểu 24×24 + giãn cách) [A][C]; gesture kéo/trượt hỏng khi chạm (thiếu `touch-action`, không dọn state khi cancel) — ghi rõ bằng chứng là emulator hay máy thật [C]; cuộn ngang ở viewport hẹp [A]; chữ phóng to (zoom/size) làm vỡ layout [A]; thiếu breakpoint.
- A5: lặp shortcut, drift design-system, nội dung giả/trang trí, cấu trúc hoán đổi được cho sản phẩm khác [A][C]. Báo riêng "phát hiện tự động" và "phán đoán thị giác"; nêu false positive.

### 1.2 Rating band (tổng /20)
18–20 Excellent (chỉnh nhẹ) · 14–17 Good (sửa chiều yếu) · 10–13 Acceptable (cần việc lớn) · 6–9 Poor (đại tu) · 0–5 Critical.

### 1.3 Thang mức nặng P0–P3 (dùng cho MỌI phát hiện, cả audit lẫn critique)
- **P0 Blocking**: chặn hoàn thành tác vụ → sửa ngay.
- **P1 Major**: khó dùng đáng kể hoặc vi phạm WCAG AA → sửa trước release.
- **P2 Minor**: phiền nhưng có cách vòng → lượt sau.
- **P3 Polish**: không ảnh hưởng người dùng thật → nếu còn thời gian; giữ ít (đuôi dài chôn việc quan trọng).
Mẹo phân loại: "người dùng có liên hệ hỗ trợ vì điều này không?" nếu có thì ≥P1.
Mỗi phát hiện ghi: tên, vị trí (file/dòng hoặc ảnh), chiều, tác động, chuẩn (WCAG…), cách sửa. Báo cáo gồm: Implementation Integrity verdict (đạt/không) trước, tóm tắt số lượng P0–P3, Positive findings, Patterns & Systemic issues (lỗi lặp ≥3 chỗ gộp thành 1 mục hệ thống).

---
## 2. Khung CRITIQUE impeccable (thiết kế/UX) — nguồn `reference/critique.md`, `craft-floor.md`, `operate.md`

### 2.1 Nielsen 10 heuristic, mỗi cái 0–4 (tổng /40; "4" chỉ khi thật xuất sắc; app thật thường 20–32)
| Mã | Heuristic | Kiểm trong app này |
|---|---|---|
| IMP-H1 | Visibility of System Status | Đang tải/đã lưu XP; tiến độ bài; vị trí hiện tại; lỗi form ngay tại chỗ [A] |
| IMP-H2 | Match System/Real World | Ngôn ngữ sinh viên luật, thuật ngữ có giải nghĩa inline, không jargon kỹ thuật [A] |
| IMP-H3 | User Control & Freedom | Thoát/Quay lại/Undo giữa quiz, không bị kẹt, Esc đóng overlay [A][C] |
| IMP-H4 | Consistency & Standards | Cùng nút/icon/spacing xuyên màn; thuật ngữ nhất quán (XP/chuỗi/cấp) [A] |
| IMP-H5 | Error Prevention | Xác nhận khi xoá tiến độ/reset; chặn nhập sai; mặc định thông minh [A][C] |
| IMP-H6 | Recognition vs Recall | Nav có nhãn chữ (không icon-only), lựa chọn hiển thị sẵn [A] |
| IMP-H7 | Flexibility & Efficiency | Phím tắt/điều hướng bàn phím, bỏ qua onboarding [C] |
| IMP-H8 | Aesthetic & Minimalist | Mỗi phần tử có việc; không rác trang trí [A] |
| IMP-H9 | Error Recovery | Lỗi nêu vấn đề + cách sửa + giữ dữ liệu người dùng [A][C] |
| IMP-H10 | Help & Documentation | Gợi ý ngữ cảnh, empty state có hướng dẫn [A] |
Thang mỗi cái: 0 không có · 1 hiếm · 2 một phần, thiếu lớn · 3 tốt, thiếu nhỏ · 4 xuất sắc. Heuristic không áp dụng → ghi `n/a` + lý do và chuẩn hoá tổng (vd 24/32). Band /40: 36–40 Excellent · 28–35 Good · 20–27 Acceptable · 12–19 Poor · 0–11 Critical. Khi có n/a dùng %: ≥90 Excellent, ≥70 Good, ≥50 Acceptable, ≥30 Poor.

### 2.2 Cognitive load (IMP-C1…C8; đếm số mục trượt: 0–1 thấp, 2–3 vừa, ≥4 nghiêm trọng)
C1 một tiêu điểm/màn · C2 chunk ≤4 mục/nhóm · C3 nhóm liên quan nhìn thấy gần nhau · C4 thứ bậc rõ cái quan trọng nhất · C5 một quyết định một lúc · C6 ≤4 lựa chọn hiển thị mỗi điểm quyết định (5–7 biên, ≥8 quá tải; nav ≤5 mục cấp cao) · C7 không bắt nhớ thông tin từ màn trước · C8 progressive disclosure. [A]

### 2.3 Persona (chọn 2–3, nêu red flag cụ thể, không mô tả chung)
Casey (mobile, một tay, hay bị ngắt: nút chính vùng ngón cái, tiến độ giữ khi thoát, target ≥44 px) · Jordan (người mới: việc đầu tiên rõ trong 5 giây, icon có nhãn, thuật ngữ) · Sam (a11y: bàn phím, focus, contrast, không chỉ dựa màu) · Riley (cạnh: rỗng, chuỗi dài, refresh giữa chừng, offline PWA) · Alex (người học lại: bỏ qua hướng dẫn, nhanh). [A][C]

### 2.4 Các điểm khác của critique
- IMP-S1 Design specificity: che tên sản phẩm, màn này có thể là app học khác không? (kết luận trước, đừng bị anchor bởi công cụ.) [A]
- IMP-S2 Emotional journey: peak-end, trấn an ở thời điểm rủi ro (sai câu, mất chuỗi). [A]
- Báo cáo: Overall impression, What's working (2–3), Priority issues (3–5, gắn P0–P3, "Why it matters" + "Fix" cụ thể), Minor, Questions. Nói thẳng, không "cân nhắc…".

### 2.5 "Floor" kiểm trên bản dựng (craft-floor "Verify", IMP-V*)
V1 contrast chữ thân ≥4.5, placeholder ≥4.5, chữ lớn ≥3; chữ trên nền màu tô theo hue nền, không xám · V2 bóng có offset + blur mềm; halo zero-offset là trang trí · V3 spacing: nhóm chặt, tách rộng, trên tiêu đề > dưới · V4 type: measure 65–75ch (45–75 chấp nhận), tracking ≥ -0.04em, heading `balance`, bước size/weight rõ; chạy nội dung thật mọi breakpoint · V5 motion: tối đa một khoảnh khắc có chủ đích; ease-out mũ; không cùng một entrance cho mọi khối · V6 states: hover, disabled, loading, error, empty + focus bàn phím + nội dung thật · V7 browser surfaces: `::selection`, caret, scrollbar, focus ring, `text-underline-offset`, `tabular-nums` được theme theo palette · V8 copy: nút nêu hành động, lỗi nêu vấn đề + cách sửa · V9 coverage: mọi yêu cầu của spec có mặt và tìm được trong vài giây.

### 2.6 "AI slop" / mặc định cần tránh (craft-floor "Refuse"; gốc: "defaults, not bans", chỉ B3 là cấm thật). IMP-B1…B16
Gốc `craft-floor.md` (dòng 20): đây là mặc định của category, không phải lệnh cấm; brief có thể "chuộc" lại từng mục. Dùng mã B* để trích, nhưng chỉ coi là vi phạm khi chọn theo phản xạ, không có quyết định thiết kế. Riêng B3 gốc ghi "This one is a ban, not a default".
- **B1** Thẻ cùng cỡ icon+tiêu đề+chữ làm cấu trúc trang; card lồng card luôn sai. [A]
- **B2** Hero-metric template: số lớn, nhãn nhỏ, stat phụ, accent. [A]
- **B3** Kicker/eyebrow phía trên heading. Đây là mục DUY NHẤT gốc ghi là cấm thật ("a ban, not a default": không brief nào chuộc lại). [A][C]
- **B4** Số section 01/02/03 trừ khi thứ tự mang thông tin. [A]
- **B5** Modal cho tác vụ không cần ngắt/khoá focus. [A]
- **B6** Gradient text; nhấn bằng weight/size. [A]
- **B7** Glass/blur làm trang trí. [A][C]
- **B8** Viền màu `border-left`/`border-right` >1px trên card/list/callout/alert. [A][C]
- **B9** Bóng đổ cứng offset (`4px 4px 0`) ngoài thế giới neobrutalist. [C]
- **B10** Sparkline, progress ring, rounded-rect bóng mềm thay cho nội dung. [A]
- **B11** Monospace làm "costume kỹ thuật", ngoài code/data/đo lường. [A][C]
- **B12** Font hệ thống (Impact, Arial Black, sans nền tảng) làm giọng display của trang có thế giới riêng. [C]
- **B13** Unicode/emoji thay icon system; icon phải vẽ, cùng một bộ, cùng stroke/weight. [A][C]
- **B14** Mặt nạ hình học (tròn, polygon) giả đường viền hữu cơ của ảnh. [A]
- **B15** Chọn sáng/tối theo category thay vì cảnh sử dụng. [A]
- **B16** Operate: trang trí động không truyền trạng thái; display font trong label/nút/data; phát minh lại affordance chuẩn (scrollbar, form control lạ); accent bão hoà ở trạng thái không hoạt động; modal là phản xạ đầu tiên (`operate.md`). [A][C]

### 2.7 Quy tắc theo lệnh (rút gọn, chỉ phần web/app)
- **Type (IMP-T)**: T1 chữ thân ≥16px/1rem sàn web; T2 prose 45–75ch, line-height tỉ lệ nghịch với measure; T3 Operate: một family tốt thường đủ, thang rem **cố định** (không clamp-fluid), tỉ số bước 1.125–1.2; T4 vai trò lặp giữ y hệt mọi màn; T5 chỉ nạp font/weight dùng, fallback metric tương thích, không chữ vô hình; T6 giữ zoom trình duyệt/cỡ chữ người dùng; T7 `text-wrap: balance` heading, `pretty` thân; T8 dark: tăng line-height, tracking, 1 bước weight; T9 không dùng cả khoảng cách đoạn lẫn thụt dòng đầu.
- **Layout (IMP-L)**: L1 squint test ra được chính–phụ–nhóm; L2 nhóm theo proximity trước khi thêm khung; L3 nhịp chặt/rộng có chủ đích, không một giá trị spacing lặp mãi; L4 thang spacing có tài liệu (nền 4); L5 cấu trúc khớp nội dung, không card framework mặc định; L6 mật độ hợp tần suất dùng; L7 thứ tự DOM/focus khớp thứ tự thị giác; L8 cực biên: chuỗi dài, rỗng, overlay, sticky, safe-area.
- **Colour (IMP-K)**: K1 màu có vai trò (canvas, surface, text, action, focus, border, semantic); K2 Operate: màu mã hoá action/selection/status/wayfinding, accent hiếm mới có lực; K3 dùng OKLCH khi tạo palette mới, giảm chroma gần trắng/đen; K4 contrast control/icon/focus ≥3:1 mọi trạng thái, cả hai theme; K5 dark mode thiết kế riêng, không đảo máy móc; K6 thông tin bằng màu cần thêm chữ/hình/vị trí; K7 semantic token remap theo theme.
- **Motion (IMP-M)**: M1 chỉ để giải thích trạng thái/quan hệ; M2 100–150ms phản hồi, 150–300ms đổi state, 300–500 overlay/view, 500–800 chỉ cho khoảnh khắc tác giả; M3 thoát nhanh hơn vào; M4 ease-out `cubic-bezier(0.16,1,0.3,1)`, không bounce/elastic phản xạ; M5 nội dung hiển thị mặc định (script lỗi không giấu trang); M6 Operate không dàn dựng page-load; M7 mỗi animation có nhánh `prefers-reduced-motion` giảm chuyển động nhưng giữ phản hồi.
- **Adapt (IMP-R)**: R1 mobile-first, `min-width` queries, breakpoint theo nội dung; R2 một cột, nav dưới, bottom sheet thay dropdown, vùng ngón cái; R3 target ≥44px; R4 không phụ thuộc hover (dùng `(hover:hover)`, `(pointer:coarse)`); R5 `viewport-fit=cover` + `env(safe-area-inset-*)`; R6 landscape và 320px không vỡ; R7 không giấu chức năng lõi trên mobile; R8 control tuỳ biến (slider/kéo): thử cả tap, kéo, và cuộn xuyên qua.
- **Components (operate.md)**: mỗi control có default/hover/focus/active/disabled/loading/error; skeleton thay spinner giữa nội dung; empty state dạy cách dùng; overlay thoát khỏi container `overflow:hidden`.

---
## 3. taste-skill (TS-*) — chỉ phần áp dụng cho app

### 3.1 Tells (`references/tells.md` + `SKILL.md` House rules; "banned" = trừ điểm nặng)
- TS-X1 Gradient tím/chàm trên nút/nền/glow. [A]
- TS-X2 Chữ gradient. [A]
- TS-X3 Nút "Bắt đầu" glow/gradient. [A]
- TS-X4 Bóng xám mềm dưới mọi card. [A][C]
- TS-X5 Ba thẻ giống nhau icon trong ô vuông bo. [A]
- TS-X6 Emoji làm icon/bullet. [A]
- TS-X7 Eyebrow: nhãn uppercase tracking nhỏ trên heading (app: tối đa 1 nhãn như thế/màn, ở bộ chuyển ngữ cảnh). [A]
- TS-X8 Pill badge phía trên heading ("Mới", "Beta"). [A]
- TS-X9 Một từ trong tiêu đề in nghiêng serif/đổi màu/gạch chân. [A]
- TS-X10 Nền near-black + một neon accent + glow. [A]
- TS-X11 Nav pill nổi có blur; glass panel (≥2 = cảnh báo). [A]
- TS-X12 Dashboard giả từ thanh xám/donut. [A]
- TS-X13 Chấm trạng thái trang trí (pulsing "live"). [A][C]
- TS-X14 Fade-and-rise ở mọi khối. [C]
- TS-X15 Nền kem vàng + terracotta/rust. Gốc `tells.md`: đi cặp = banned (inspect.mjs FAIL); terracotta riêng = banned; kem riêng = warned; `colour.md`: "either half alone is suspect". Giữ theo `tells.md`. Màu thuộc brand thì ghi [BRAND], xem X3. [A]
- TS-X16 Serif display/nghiêng lớn như đường tắt cho "cao cấp". [A]
- TS-X17 Broadsheet cosplay: hairline khắp nơi, bo 0, cột dày. [A]
- TS-X18 Mono micro-label; đánh số chỉ mục 01/02, "Bước 02" (chỉ cho phép khi là dữ liệu như hạng "1."). [A]
- TS-X19 Đường kẻ mảnh/ô viền 1px trang trí (app được viền 1px, xem 3.8 và mục 4). [A]
- TS-X20 Chrome công cụ thiết kế làm trang trí (crosshair, crop mark); meta kiểu agency (giờ địa phương, phiên bản). [A]
- TS-X21 Tiêu đề là cả câu cỡ display 3–4 dòng; mọi thứ căn giữa (>72%); một bán kính 12–16px cho mọi thứ; ≥9 cỡ chữ gần nhau. [A]
- TS-X22 Social proof bịa ("10.000+ sinh viên"). [A][C]
- TS-X23 Copy "đúng chất AI": unlock, supercharge, seamless, effortless, "không chỉ X mà còn Y", tricolon, "Bắt đầu"/"Tìm hiểu thêm" làm nhãn nút, quá nhiều em dash, lorem. [A][C]
- TS-X24 Motion tell: hover-lift mọi card, bounce, vòng lặp vô nghĩa, reveal lỗi để lại dải trống. [A][C]
- TS-X25 "Tránh hết mà không thay gì" cũng là tell (đồ án rỗng lịch sự): phải có thứ đặc thù sản phẩm lấp chỗ. [A]

### 3.2 Type (`type.md`, `app-screens.md` §9.1)
- TS-T1 Một grotesk/sans là chuẩn; face thứ hai chỉ có một việc; không bao giờ ba. [A][C]
- TS-T2 Tiêu đề trang app 18–32px (trung vị 24), số KPI 16–40px, không có chữ ≥48px; không chạm "landing title". [A]
- TS-T3 Thang app 4–9 cỡ (sạch nhất: 12/14/16/24); cỡ gần nhau thì làm bằng nhau. [C]
- TS-T4 Chữ thân 16px (app dày: 13–16 được); phụ ≥13px (meta ≥11–12px); không dưới 11px. [A][C]
- TS-T5 Trọng số: ~3/màn, 700 chỉ một việc. Chữ phụ cùng face màu nhạt hơn, không giảm weight. [C]
- TS-T6 `tabular-nums` cho mọi số cập nhật/bảng/KPI; kiểm face thật sự đổi bề rộng chữ số. [A][C]
- TS-T7 Sentence case, tracking 0 (âm chỉ ở chữ lớn ≈ -0.02em/32px); CAPS ≤3 từ. [A]
- TS-T8 Measure 45–75ch, line-height 1.45–1.6; không căn giữa đoạn >3 dòng; không justify. [A]
- TS-T9 Chữ sáng trên nền tối: giảm một bậc weight hoặc +0.01em, tăng leading. [A]
- TS-T10 Chi tiết sắp chữ: nháy cong, gạch/ellipsis thật, nbsp giữa số và đơn vị, `text-underline-offset`, `::selection`/`:focus-visible` theo palette, không đổi weight khi hover. [A][C]
- TS-T11 Khoảng trên heading ≥ 2× khoảng dưới; tiêu đề không mồ côi một từ/ngắt giữa cụm. [A]

### 3.3 Colour (`colour.md`, `app-screens.md` §9.2–9.3)
- TS-C1 Dùng token theo vai trò (bg, surface, ink, muted, accent, accent-ink); hex thô trong component = palette thứ hai; không thêm xám giữa các vai trò. [C]
- TS-C2 Tỉ lệ: nền 70–90%, accent <5% mỗi màn; app: ~3% pixel có màu, màu nằm trên **dữ liệu/trạng thái/hành động chính**. [A]
- TS-C3 Accent không dành cho heading, icon, bullet, viền, gạch chân (trừ khi spec nói); heading là ink. [A]
- TS-C4 Surface phân biệt bằng một bước tone (2–6 điểm lightness), không lồng panel trong panel. [A]
- TS-C5 Mỗi tầng chữ có từ (thân/phụ/placeholder) đạt 4.5:1 trên nền của nó (xám ≈#6b6b6b là nhạt nhất giữ được trên trắng); không giảm opacity để "làm mềm" mà không đo. [A]
- TS-C6 Dark: nền neutral thật (#000/#111/#171719), không navy/slate; sâu bằng bước sáng hơn, không glow; hai tầng xám đủ xa nhau. [A]
- TS-C7 Trạng thái dương/âm: chữ xanh lá đủ 4.5:1 (ví dụ #247b50); pill = nền nhạt + chữ đậm cùng hue; không dùng màu trạng thái trên giá trị 0. [A]
- TS-C8 Tối đa 4 hue/chart, một chủ thể một hue; không cầu vồng. [A]
- TS-C9 Một họ accent mỗi màn; nút chính một, thường near-black (xem mục 4 về palette dự án). [A]
- TS-C10 Hover/focus tăng contrast, không giảm. [A]

### 3.4 Layout (`layout.md`, `app-screens.md` §3–4)
- TS-L1 Hai lề trái/phải bằng nhau ở mọi width; lề 16–32px, ≥16px trên điện thoại; nav cùng lề với nội dung. [A]
- TS-L2 Một cạnh trái chung (2–3 vị trí x cho cả trang); khối nào cũng chạm mép canvas bên phải, không "thẻ dừng non", không ô mồ côi, không thẻ kéo dãn với dải trống. [A]
- TS-L3 Không có "lỗ": dải trống >nửa màn hoặc nửa chiều rộng để trơn; panel không có dải trống >40px. [A]
- TS-L4 Mỗi màn có tiêu đề danh từ nói rõ đây là gì (h1) và mỗi mục có heading. [A][C]
- TS-L5 Khoảng giữa section rõ ràng lớn hơn khoảng trong section; spacing nền 4px. [A]
- TS-L6 Radius chọn một lần (chặt 4–8 hoặc mềm 16–24), bán kính lồng giảm dần, ≤3 radius panel. [A][C]
- TS-L7 Số cột theo số mục (không lưới 4 cột đều mặc định); hàng thẻ giống nhau chỉ cho chỉ số/đối tượng ngang hàng 3–6 thẻ, không icon trên đầu. [A]
- TS-L8 Hierarchy: một thứ nổi trội mỗi màn; phần lớn nhất trả lời câu hỏi của màn. [A]

### 3.5 Motion (`motion.md` §9–10)
- TS-M1 Không preloader/gate/cursor tuỳ biến/cuộn bị chiếm. [A][C]
- TS-M2 Curve: ease-out cho <600ms, không overshoot; bấm 140ms, hover màu 180–200ms, menu 240ms; thoát = 60–70% thời gian vào. [C]
- TS-M3 Reveal chỉ dưới nếp gấp, một lần, ≤900ms; không thứ gì trong tầm nhìn bị ẩn >900ms; không dim dưới 40%. [A][C]
- TS-M4 Stagger tối đa 4 bước; không chuyển động băng qua chữ đang đọc. [A]
- TS-M5 Vòng lặp tạm dừng khi ngoài màn và dừng ở reduced-motion; "trang giảm chuyển động là trang hoàn chỉnh". [C]
- TS-M6 Một signature move + một ảnh động tối đa (app: một khoảnh khắc ăn mừng có chủ đích). [A]

### 3.6 Copy (`copy.md`)
- TS-W1 Tiêu đề ≤2 dòng ở mọi width; câu chuyên dụng (statement) ngắn ≤~25 từ. [A]
- TS-W2 Nút gọi tên hành động; tên mục đơn giản ("Hồ sơ", không "Hành trình của bạn"). [A]
- TS-W3 Không nhãn giả biên tập ("Field notes"), không furniture text, không câu thuyết minh thiết kế. [A]
- TS-W4 Không ba-song-song ở mọi nơi; dùng số lượng mà nội dung có. [A]
- TS-W5 Dữ liệu thật: không lorem/"User 1"/Acme; tổng cộng ra đúng, mỗi số tương đối nêu so với gì; không vanity. [A][C]

### 3.7 App screens (`app-screens.md` §2.7, 5–7, 10–14)
- TS-A1 Mỗi màn có "một câu hỏi"; khối lớn nhất trả lời nó và được đọc trước. [A]
- TS-A2 Không hero header, không lời chào kèm emoji, không banner minh hoạ chào mừng; tiêu đề danh từ 24px. [A]
- TS-A3 KPI là chữ, không phải ô: nhãn trên giá trị, cùng một container chia nhóm; không icon trong vòng/ô tô màu; không sparkline trên KPI; giá trị 24–30px, không in màu brand. [A]
- TS-A4 Delta nêu bằng lời kèm cửa sổ thời gian; số 0 màu xám, "+4 (mới)" từ 0; số không khớp tổng = lỗi. [A]
- TS-A5 Số căn phải, tabular; số 0 in là 0, thiếu là gạch xám (không "--" cỡ giá trị). [A]
- TS-A6 Biểu đồ: đường 2px thẳng, 3–5 gridline mờ, không legend cho 1 series, ring mảnh không nhãn lát; encode trong chart thay vì chú thích. [A]
- TS-A7 Bảng/danh sách: header 12px xám sentence case, không zebra, không header band; mỗi hàng không đủ checkbox+avatar+chip+kebab. [A]
- TS-A8 Nhãn đếm (badge) chỉ trên hàng đợi cần hành động; đếm tính theo view hiện tại. [A][C]
- TS-A9 Form: nhãn phía trên (không placeholder thay nhãn, không floating label); một chiều cao control mỗi ngữ cảnh; giới hạn nhập hiện sẵn cạnh field + `aria-describedby`; disabled vẫn đọc được và nói vì sao; huỷ/destructive để cuối với lời nêu hậu quả. [A][C]
- TS-A10 Một mô hình lưu mỗi view (tự lưu + "Đã lưu" hoặc một nút Lưu), không trộn. [A][C]
- TS-A11 Mỗi nút chính một mỗi màn; secondary trắng viền 1px; tertiary là chữ; các control cùng hàng cùng chiều cao. [A]
- TS-A12 Nav lùi về nền: mục active là pill xám trung tính/đổi màu chữ, không thanh trái màu; icon outline 14–20px một bộ, xám. [A]
- TS-A13 Sidebar không tối/bão hoà trên màn sáng. [A]

### 3.8 Trạng thái & điện thoại (`app-screens.md` §11–12)
- TS-S1 Zero thật in như số; thiếu = gạch xám; vùng rỗng giữ khung + header + một câu; chart rỗng vẽ đường 0, không minh hoạ. [A]
- TS-S2 Lần đầu: giữ khung + tiêu đề, đặt hành động đầu tiên đúng chỗ dữ liệu sẽ xuất hiện. [A]
- TS-S3 Loading: bố cục cuối với thanh xám đúng cỡ, không shimmer gradient, không nhảy layout. [A][C]
- TS-S4 Lỗi: trong khối hỏng, một câu nói gì hỏng + dữ liệu tốt lần cuối + nút Thử lại; màu âm chỉ ở icon/pill. [A]
- TS-S5 Dữ liệu cũ/tĩnh: tem "cập nhật lúc…"; giới hạn dùng: thanh đúng tỉ lệ có nhãn hai đầu ("12,7k / 20,0k"). [A]
- TS-S6 Đỏ là tín hiệu, không phải kết cấu: tối đa một dấu đỏ mỗi đối tượng. [A]
- TS-P1 Nav gập: thanh dưới 4–5 đích đến nhãn ngắn, hoặc top bar 48px; sidebar không chiếm >30% bề rộng điện thoại. [A]
- TS-P2 Lề 16–20px, target ≥44px, dữ liệu 14px, subline ≥12px. [A]
- TS-P3 Tiêu đề giữ, 20–24px; hành động header vào kebab trừ nút chính. [A]
- TS-P4 Hàng đầu danh sách bắt đầu trong 60% trên của màn; tối đa một hàng control phía trên chart/danh sách; tab cuộn ngang trong hàng của nó, không cuộn trang. [A]
- TS-P5 KPI → lưới 2 cột (số cột chẵn) hoặc danh sách nhãn-trái/giá-trị-phải; không bốn cột bóp. [A]
- TS-P6 Bảng → danh sách hàng hai dòng dưới ~640px (trường chuyển xuống dòng 2, không bỏ). [A]
- TS-P7 Nhiều panel (danh sách + chi tiết): một vùng mỗi lúc, quay lại giữ vị trí cuộn. [A]
- TS-P8 Khối mang hành động chuyển lên trên, không xuống dưới. [A]
- TS-P9 Điện thoại là bố cục riêng, không phải desktop bị bóp; không cuộn ngang. [A]

### 3.9 Pre-flight (SKILL.md "Gate/Look" + `app-screens.md` §2.7 + `critique.md`, rút gọn cho ảnh/code)
- TS-F1 Quy ước CỦA BẢN AUDIT NÀY (gốc taste-skill chỉ có FAIL/WARN của inspect.mjs, không có P0–P3): tell "banned" ở 3.1 = P1; "warned" không biện minh được bằng một câu = P2. Ngoại lệ đã chốt: eyebrow (X12) = P2 dù "banned".
- TS-F2 Bảy câu trả lời bằng văn bản cho app: (1) khối lớn nhất trả lời câu hỏi của màn? (2) khối nào cũng chạm mép, có dải chết/ô mồ côi/thẻ kéo dãn? (3) màu chỉ trên dữ liệu/trạng thái/nút chính, dữ liệu chính mang hue? (4) số có cộng đúng, thẳng hàng, mọi số lặp hai lần có khớp? (5) zero giống zero, thiếu giống thiếu, badge đúng chỗ? (6) legend khớp mark, nhãn không đè? (7) điện thoại: nav gập, mỗi khối vẫn trả lời câu hỏi?
- TS-F3 14 lượt nhìn (`critique.md`) áp dụng được: 1s/5s (nhìn là biết đây là gì), 2 squint, 4 cạnh trái, 5 không gian và khung, 6 type, 7 màu, 9 sameness (mỗi section bố cục khác?), 10 điện thoại, 12 substance (đủ thông tin), 13 collision (không gì đè tiêu đề/nút, không tràn mép). Bỏ lượt 3, 8, 11, 14 (cover-logo, ảnh, fullness kiểu poster, đối thủ).
- TS-F4 Điểm: design 40% · usability 30% · creativity 20% · content 10% (thang 1–10, trung bình dự án thật ≈7–8). Caps dùng được cho app: tiêu đề ≥3 dòng/eyebrow/mono/đánh số/gradient/hairline trang trí/bóng ở trạng thái nghỉ → tổng ≤6.5; lề không đều/dải trống >nửa màn → design ≤6.5; placeholder/lorem → content ≤5; không nút thật cho hành động chính ở màn đầu → usability ≤7; 5 giây không biết đây là gì → usability ≤6; đoạn văn chạy không có heading đặt tên → usability ≤7; thứ gì đè lên tiêu đề → usability ≤6; dải trắng do reveal lỗi/nội dung bị cắt → usability ≤5.
- TS-F5 Thứ tự sửa: ý tưởng → hierarchy → bố cục → type → màu → chi tiết (state, focus) → motion. Tối đa ba vòng; vòng ba vẫn <7.5 phải nói thẳng.

---
## 4. Mâu thuẫn giữa hai bộ và cách xử lý khi chấm

| # | Mâu thuẫn | Xử lý |
|---|---|---|
| X1 | Viền/đường 1px: TS house rule cấm; TS app-screens cho phép (1.1–1.3:1, hoặc bóng, không cả hai); impeccable chỉ cấm viền màu >1px | **App → dùng TS-A (app-screens).** Viền 1px trung tính chấp nhận; chỉ phạt hairline trang trí, viền màu `border-left` >1px (IMP-B8), viền+bóng cùng lúc. |
| X2 | Bóng: IMP-V2 "bóng có offset+blur mềm"; TS cấm bóng ở trạng thái nghỉ | Bóng chỉ cho thứ nổi (menu, popover, dialog); thẻ nghỉ ≤ blur nhỏ <8% đen; halo zero-offset và hard-offset đều phạt. |
| X3 | Màu: IMP-operate "chỉ xám + một accent là mặc định category, hãy có palette cam kết" ↔ TS "màu trên dữ liệu, không trên chrome, nút near-black" | Theo lệnh chủ dự án: CHẤM cả palette/brand ("Văn Miếu"). Phát hiện về brand (chọn hue, kem/đất nung, tỉ lệ accent, nút chính màu brand…) vẫn ghi đầy đủ nhưng gắn nhãn **[BRAND]**, gom vào mục [BRAND] riêng của README và KHÔNG trừ điểm từng màn (tránh phạt lặp một quyết định brand ở mọi màn). Phần cách dùng màu (một họ accent/màn TS-C9, accent không trên heading/icon trang trí TS-C3, contrast TS-C5/IMP-K4) vẫn chấm và trừ điểm bình thường theo từng màn. Gốc IMP "The brief wins" và TS `--keep palette` chỉ nói không ép đổi brand; không cấm nêu nhận xét. |
| X4 | Cỡ chữ thân: IMP-T1 ≥16px; TS-T4 app thân 13–16px, nhãn 11–12px | Nội dung đọc (định nghĩa luật, câu quiz, giải thích) **≥16px**; UI dày (nhãn, meta, bảng) ≥13px, tuyệt đối ≥12px; <11px = P1. **Ngoại lệ trong bản audit này:** chữ nhỏ ở sidebar/gáy sách hạ về P2 (HT7) vì cỡ chữ không phải tiêu chí WCAG và nội dung học vẫn ≥16px. |
| X5 | Thang cỡ: TS page "≤5 cỡ, cách xa" ↔ TS app "4–9 cỡ" ↔ IMP-Operate "tỉ số 1.125–1.2, nhiều bước hơn brand" | Dùng 4–9 cỡ, bước phân biệt được bằng mắt; hai cỡ gần như nhau thì gộp. |
| X6 | Display leading/tracking: TS-T "leading 0.85–1.05, tracking -0.035em" ↔ **tiếng Việt có dấu chồng** | **Ghi đè (VN-2):** tiêu đề leading ≥1.2, thân ≥1.45, không tracking dưới -0.02em; không dùng leading <1 vì dấu bị cắt/đè dòng trên. Tiêu đề app cỡ 18–32px nên đây không phải hy sinh lớn. |
| X7 | KPI/số lớn: IMP-B2 cấm hero-metric template; TS-A3 cho KPI là chữ 24–30px | XP/chuỗi/cấp **được** nếu: ≤40px, không kèm icon-trong-vòng, không stat phụ trang trí, nhãn rõ, là câu trả lời cho câu hỏi của màn (Hồ sơ) — nếu không thì P2 "hero-metric". |
| X8 | Progress ring/sparkline: IMP-B10 cấm khi "thay nội dung"; TS cấm sparkline KPI, cho ring mảnh | Tiến độ thăng chức/mục tiêu ngày = **thanh hoặc ring mảnh đúng tỉ lệ thật, có nhãn hai đầu** (TS-S5) thì đạt; sparkline/ring trang trí không mang số thật = P2. Xu hướng XP nên có chart riêng, không nhét trong KPI. |
| X9 | Emoji: cả hai cấm làm icon (IMP-B13, TS-X6, TS-A "emoji trong chào/nhãn/nav/empty") — nhưng game hoá hay dùng 🔥⭐ | Vẫn phạt: dùng bộ icon SVG một stroke. Ngoại lệ chỉ khi spec đã duyệt mascot/biểu tượng riêng; ghi P2 + ghi chú, không P0/P1. |
| X10 | Motion ăn mừng: TS-M "một signature move, không vòng lặp vô nghĩa, không bounce" ↔ IMP-M "một khoảnh khắc tác giả 500–800ms được" ↔ game hoá | Cho phép **một** khoảnh khắc ăn mừng khi đạt mốc thật (hoàn thành bài, thăng chức, giữ chuỗi), ease-out, không bounce/loop; chuyển động hằng ngày phải 150–250ms. Pulsing/flame vô hạn = TS-X13 P2. |
| X11 | Reduced motion: IMP "giảm chứ không tắt, giữ phản hồi" ↔ TS "trang giảm chuyển động là trang hoàn chỉnh, mọi trạng thái ẩn nằm trong `no-preference`" | Cả hai thoả được: nhánh reduced giữ đổi màu/opacity/trạng thái, bỏ dịch chuyển/loop. `*{animation:none}` hoặc `0.01ms` toàn cục = P1 (IMP-A1). **Ngoại lệ trong bản audit này:** HT4 hạ P2 vì có công tắc `motion-on` ở Cài đặt và đúng/sai vẫn báo bằng màu nền + chữ. |
| X12 | Eyebrow: cả hai cấm; TS-app cho "tối đa một nhãn uppercase tracking" cho bộ chuyển ngữ cảnh | Eyebrow trên heading = cấm (P2, IMP-B3 tuyệt đối); nhãn uppercase của switcher ≤1/màn tạm chấp nhận. Ghi chú: tiếng Việt viết hoa + dấu khó đọc hơn, ưu tiên sentence case. |
| X13 | Modal: IMP-B5 "modal là lười" ↔ TS cho dialog nổi | Chỉ chấp nhận khi cần ngắt/khoá focus (xác nhận huỷ, kết quả cuối bài). Modal cho điều có thể inline = P2. |
| X14 | Chấm điểm: IMP-critique /40 Nielsen ↔ TS Awwwards 1–10 | Dùng **IMP audit /20 + Nielsen /40 làm điểm chính**; TS-F4 chỉ làm điểm phụ cho thị giác (design 40/usability 30…), bỏ các cap về ảnh/motion trang/"live thing". Không cộng gộp hai thang. |
| X15 | Số "thẻ giống nhau": IMP-B1 cấm cấu trúc trang bằng thẻ icon+tiêu đề+chữ; TS cho hàng thẻ ngang hàng 3–6 cho chỉ số/đối tượng ngang hàng | Danh sách môn/bộ thẻ là đối tượng ngang hàng → được, nếu không icon-trong-ô, thẻ không lồng, cột theo số mục (TS-L7). |
| X16 | Công cụ: cả hai yêu cầu chạy detector/inspect (không có trong phiên này) | Thay bằng ảnh `npm run shots` (390 + 1280) + đọc code; ghi "không chạy detector" ở đầu báo cáo, tách "đã đo" khỏi "nhận xét mắt". |

---
## 5. Tiêu chí đặc thù dự án (không có trong hai bộ; thêm để chấm tiếng Việt)
- **VN-1** Font có subset `vietnamese` (cả `latin-ext`), kiểm render dấu ă â ê ô ơ ư đ và các dấu thanh trên chữ hoa (Ắ Ế Ộ Ử…), không rơi fallback lẫn kiểu chữ (so ảnh với từng weight đang dùng). [A][C]
- **VN-2** Leading đủ cho dấu chồng: tiêu đề ≥1.2, thân ≥1.45; không `overflow:hidden` + line-height thấp cắt dấu trên; chiều cao nút/chip không cắt dấu dưới. [A]
- **VN-3** Chuỗi tiếng Việt dài hơn tiếng Anh ~15–30%: nhãn nút/tab/nav không tràn, không vỡ ở 360px; không `text-transform: uppercase` cho nội dung dài. [A]
- **VN-4** Số/ngày theo định dạng Việt (dấu chấm nghìn, dấu phẩy thập phân, `dd/mm/yyyy`), `lang="vi"` trên `<html>`, `Intl` locale `vi-VN`. [C]
- **VN-5** Nội dung luật: `definition` hiển thị nguyên văn, hiện `source` + link, ngày `checked`; không bị cắt cụt (`line-clamp`) mà mất ý; có dòng "thông tin pháp luật chung, không phải tư vấn" ở nơi người dùng nhìn thấy. [A][C]
- **VN-6** Game hoá trung thực: XP/chuỗi/cấp tính ra số khớp nhau giữa các màn (TS-A4); không vanity, không đếm giả; mất chuỗi/sai câu có thông điệp trấn an, không trách (IMP-S2). [A]
- **VN-7** PWA/offline: trạng thái offline, cập nhật SW, không mất tiến độ khi thoát giữa quiz (IMP-H1/H9, persona Casey/Riley). [A][C]
