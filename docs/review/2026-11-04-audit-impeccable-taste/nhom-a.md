# Audit giao diện Luyện Luật — nhóm A (6 màn + phần chung)

Người chấm: S1. Phạm vi: `#/`, `#/mon`, `#/mon/hien-phap`, `#/mon/hien-phap/khai-niem`, `#/mon/hien-phap/khai-niem/chu-quyen-nhan-dan`, `#/luyen-de` + Shell/nav/token. Bộ tiêu chí: `criteria.md` (impeccable + taste-skill). Chấm thẳng, không miễn trừ "Văn Miếu"; phát hiện đụng palette/brand gắn **[BRAND]**.

## 0. Cách đo và giới hạn (đọc trước)

- **Detector impeccable KHÔNG chạy được** (bị chặn). IMP-A5 chấm bằng đọc code + ảnh. Không chạy script nào trong `ext/`.
- Ảnh: `shots/<390|1280>-light-<màn>.png`; ảnh dark chỉ xác nhận **web không có dark mode** (`app.css:3` `color-scheme: light`, chủ dự án chủ động bỏ). Vì vậy IMP-A3 chấm theo mức dùng token, không trừ vì thiếu dark.
- **Probe cũ (`probe.json`) cho dương tính giả**: contrast "1.00 / 1.31" xuất hiện ở `.chip`, `.lbl`, `.next-tag`, `.tk-st`, `.cmp-a`… là do Chromium trả màu dạng `color(srgb …)` (kết quả `color-mix`) mà regex `rgba()` đọc sai. **Đã xác minh lại** bằng script mới `verify-a.cjs` (chuẩn hoá màu qua canvas, trộn alpha qua chuỗi tổ tiên, nền gradient lấy mẫu pixel thật): **0 lỗi contrast chữ** trên 6 màn × 2 viewport (thấp nhất 4,86:1 ở chip "Mới"). Bằng chứng: `verify-a.json`.
- Đã xác minh bằng Playwright/Chromium: contrast, kích thước target, thứ tự Tab + kiểu focus ring, reflow ở 320 px và 640 px (≈ zoom 200 % của 1280), số request mạng (`net-a.cjs`), emulate `prefers-reduced-motion`, danh sách animation chạy, font nạp (`document.fonts`).
- **Chưa xác minh / không phủ**: (1) mọi trạng thái **có dữ liệu** (hero `due/continue/next/done`, danh sách "Khái niệm khó", chip "Đang học", tem điểm trên phiếu đề, `.note` Cập nhật luật) — ảnh chỉ có first-run rỗng; (2) rail phải ≥ 1440 px (`HomeRail/SubjectRail/QuizRail`) chưa chụp, chỉ đọc code; (3) máy thật/cảm ứng thật, trình đọc màn hình thật, offline/SW; (4) hover/pressed.
- Dòng số trong báo cáo là dòng tôi đã mở xem.

---

## 1. Phần chung (Shell / nav / token) — để các màn khỏi lặp lại

**Implementation Integrity verdict: ĐẠT (có điều kiện).** Hệ thống mạch lạc và rất đặc thù sản phẩm (tranh kiến trúc VN, bìa sách thật, vé đề thi, thang token 4/8/12 và cỡ chữ). Không có drift giữa token và component. Điều kiện: 4 lỗi hệ thống P1 bên dưới.

Điểm tham chiếu cho phần chung: A1 3 · A2 3 · A3 3 · A4 3 · A5 3 = **15/20 (Good)**.

### Phát hiện dùng chung

**C1 — P1 — Giảm chuyển động tắt sạch mọi animation/transition.** `app.css:106-110` (`:root:not(.motion-on) * { animation:none !important; transition:none !important }`). Đã xác minh: emulate `reduce` → `.ticket` `transition-duration: 0s`; ngược lại ở chế độ thường trang Hôm nay chạy 6 animation vô hạn trang trí (`kit-farcloud, sunspin, drift, sway×2, kit-sweep`) không truyền trạng thái. Mã: IMP-A1, IMP-M7, X11; TS-X13/M5. Tác động: người bật reduce mất cả phản hồi đổi màu/độ mờ; người không bật phải xem 6 vòng lặp mây/mặt trời. Giảm nhẹ: có công tắc `motion-on` ở Cài đặt (`App.svelte:32-35`). Sửa: nhánh reduce chỉ bỏ `transform`/vòng lặp, giữ `opacity/color/border` ≤150 ms; vòng lặp tranh trang trí tạm dừng khi ngoài màn hình. Lệnh: `/impeccable animate` + `/impeccable harden`.

**C2 — P1 — Đổi route không quản lý focus/thông báo.** `lib/router.svelte.ts` (handler `hashchange`) chỉ `window.scrollTo(0,0)`; `Shell.svelte:46` có `<main id="main" tabindex="-1">` nhưng không ai focus nó; grep `\.focus\(` trong `src/` = 0 kết quả; `.loading` không có `role="status"` (`Home.svelte:91`, `Subjects.svelte:72`…). Mã: IMP-A1, WCAG 2.4.3/4.1.3. Tác động: người dùng bàn phím mất focus (liên kết vừa bấm biến mất → focus về `body`), người dùng đọc màn hình không được báo đã sang trang. Đã xác minh bằng đọc code + grep (chưa thử bằng trình đọc màn hình). Sửa: sau khi trang render, focus `h1` (thêm `tabindex="-1"`) hoặc cập nhật vùng `aria-live` với `document.title`. Lệnh: `/impeccable harden`.

**C3 — P2 — Focus ring màu accent < 3:1.** `app.css:116` `outline: 3px solid var(--accent)`; accent `#d97a1e` trên `--paper` = **2,83:1**, trên thẻ trắng 3,11:1 (đo bằng màu tính toán). Mã: IMP-K4, IMP-A1 (WCAG 1.4.11). Ring 3 px + offset 2 px nên vẫn thấy, nhưng dưới ngưỡng trên nền giấy (nền của đa số trang). Ngoại lệ tốt: `a.sug-t` ring qua `::after` (`app.css:519-521`). `summary` không được phủ bởi selector ring (xác minh: `outline: auto 1px #101010`, trình duyệt mặc định) — lệch kiểu. Sửa: ring `--ink` 2 px + offset (14,5:1), thêm `summary:focus-visible`. Lệnh: `/impeccable polish`.

**C4 — P1 — Chữ < 11 px ở sidebar ≥ 1280 trên mọi màn.** `app.css:175` `.me-sub` 10,5 px (“0 sách · 0 cấp 3”); `app.css:185` `.me-next-t` 11,5 px; đo thực tế DOM: 10,5 và 11,5 xuất hiện ở cả 6 màn 1280 (`verify-a.json`, `fsSet`). Mã: X4 (<11 = P1), TS-T4. Contrast của chúng đạt (8,1:1 trên nền tối), nhưng cỡ nhỏ. Cũng đẩy số cỡ chữ ở 1280 lên 9 giá trị (10,5/11,5/12/13/14/16/18/22/28, trong đó 4 giá trị sát nhau) so với 5 giá trị ở 390 → TS-X21/TS-T3. Sửa: sàn 12 px, gộp 13 → 12/14. Lệnh: `/impeccable typeset`.

**C5 — P2 — Tủ gỗ-kính ở sidebar: tối, bão hoà, skeuomorphic, lặp mọi màn.** `Shell.svelte:43`, `SideProfile.svelte`, `app.css:171` (nền gradient `#2a1f17→#17110c`, viền vàng kép), `app.css:826-834` (gỗ `#4b2e18…`, ô kính phản quang `.side-glass::after`). Ảnh: `[shots/1280-light-home](anh/shots-1280-light-home.webp)` (khối ~270 px cuối sidebar). Mã: TS-A13 (sidebar không tối/bão hoà trên màn sáng), TS-X4, IMP-B7 (glass trang trí), IMP-H8, TS-F3#7. Tác động: điểm tối/bão hoà nhất của mọi trang ≥ 1280 là chrome chứ không phải nội dung học; kéo thêm ~15 hex thô. Đây là chữ ký game hoá nên **[BRAND]**. Sửa: ở sidebar chỉ một thẻ phẳng tông giấy (chức danh + thanh tiến độ), giữ gỗ-kính riêng ở Hồ sơ. Lệnh: `/impeccable quieter`.

**C6 — P2 — Thuật ngữ game hoá chưa giải nghĩa cho người mới.** `SideProfile.svelte:24,34`: “CÔNG DÂN · 0 sách · 0 cấp 3”, “0/2 sách · kế tiếp: Công chức cấp xã”; mobile `Shell.svelte:28` + `RankBadge.svelte:11-14` chỉ còn ấn đỏ “§” (nhãn bị ẩn ở ≤ 479 px, `app.css:1548`), chỉ `title`/`aria-label` mô tả. Ảnh: `[shots/390-light-home](anh/shots-390-light-home.webp)` (góc phải trên: ngọn lửa xám “0” + ấn “§”). Mã: IMP-H2, H6, H10; VN-6. Tác động: Jordan không biết “sách”, “cấp 3”, “chức danh mô phỏng” là gì và “§” là nút gì. Sửa: nhãn chữ hoặc tooltip bấm được; một dòng onboarding ở lần đầu. Lệnh: `/impeccable clarify`.

**C7 — P2 — Không có skip-link; 7 điểm Tab trước nội dung.** Đã xác minh thứ tự Tab ở 1280 trên Hôm nay: `a.brand → 4 × a.item → a.me → a.me-next → a.btn (nội dung)`. Landmark `main` có nên WCAG 2.4.1 vẫn qua bằng landmark, nhưng bàn phím tốn 7 lần Tab mỗi lần tải trang. Mã: IMP-H7, persona Sam/Alex. Sửa: skip-link tới `#main` (lưu ý hash router: dùng nút JS focus `main` thay vì `href="#main"`). Lệnh: `/impeccable harden`.

**C8 — P2 — Kicker/eyebrow và tiêu đề IN HOA gắn khắp nơi.** `app.css:235` `.kicker` uppercase, tracking .08em; dùng ở `HeroCard.svelte:16,21,26,31,36` (5 biến thể hero), `Shell.svelte:40` (“Đang học”), `SubjectRail.svelte:12,17,24`, `HomeRail.svelte:29,44`, `QuizRail.svelte:7`, `MasteryGrid.svelte:18,25`, `Concepts.svelte:90`, `Quizzes.svelte:66,75,84` (`.sug-k`, `app.css:516`). Thêm `.section-title` IN HOA tracking .06em (`app.css:126`). Mã: IMP-B3 (cấm tuyệt đối), TS-X7, TS-T7 (CAPS ≤ 3 từ), X12. Tiếng Việt in hoa + dấu chồng khó đọc hơn (xem “NGÀNH LUẬT HIẾN PHÁP: ĐỐI TƯỢNG, PHƯƠNG PHÁP, NGUỒN, QUAN HỆ PHÁP LUẬT” 70 ký tự, `[shots/1280-light-concepts-list](anh/shots-1280-light-concepts-list.webp)`). Lặp ≥ 3 chỗ → mục hệ thống. Sửa: sentence case, bỏ kicker khi đã có heading. Lệnh: `/impeccable typeset` + `/impeccable distill`.

**C9 — P2 — Viền màu `border-left` > 1 px lặp ≥ 3 chỗ.** `.sug` 4 px (`app.css:513`), `.quote` 3 px đỏ ấn (`:121`), `.note` 3 px (`:459`), `.hard-list a` 3 px (`:487`), `.why` 3 px (`:1576`), `.rv` 4 px (`:604`, ngoài 6 màn). Mã: IMP-B8. Sửa: nền tông nhạt + icon/nhãn, hoặc viền đầy đủ 1 px. Lệnh: `/impeccable polish`.

**C10 — P2 — Icon trộn SVG với ký tự Unicode.** Bộ nav SVG nét là tốt (`Icon.svelte`, `Glyph.svelte`), nhưng nơi khác dùng ký tự: ★ ☆ ▸ ▾ (`Concepts.svelte:82,101,103`), → ← › (`Shell.svelte:50`, `HeroCard.svelte:19-34`, `Home.svelte:97`), ⚠ (`Shell.svelte:48`), ✓ (`MasteryGrid.svelte:25`), ★ (`Quizzes.svelte:58,128`). Mã: IMP-B13, TS-X6 (X9 ngoại lệ không áp: chưa có spec mascot). Tác động: nét/độ đậm/baseline không đồng bộ theo font, chevron không xoay. Sửa: thêm ≤ 6 glyph SVG (star, star-fill, chevron, arrow, check, alert) vào `Glyph.svelte`. Lệnh: `/impeccable extract`.

**C11 — P2 — Hairline/viền kép trang trí.** `.btn` inset kép (`app.css:757`), `.filter[aria-pressed=true]` (`:906`), `.section-title` hình thoi + đường kép (`:764-765`), `.stage::after` hai vạch “mặt đất” (`:789-792`), tabbar `3px double` (`:772`), sidenav `4px double` (`:773`). Mã: TS-X17, TS-X19, IMP-V2. **[BRAND]** (ngôn ngữ “viền kép” là chủ đích của spec hình khối). Sửa: giữ một chỗ (khung hero), bỏ ở nút/chip/tiêu đề mục.

**C12 — P2 — Bóng + viền mọi thẻ, hover-lift mọi thẻ, overshoot.** `--shadow` (`app.css:38`) dưới `.card`, `.subject-row`, `.set`, `.ticket`, `.qz-stats`, `.stage` (`:113,412,431,499,536,786`) cùng viền 1 px (X1 cấm viền + bóng cùng lúc). Hover-lift `translateY(-1…-4px)` ở `.subject-row, .set, .sug, .ticket, .btn, .opt, .cover-link` (`:413,432,514,537,758,1500`) **không** bọc `(hover:hover)` → hover dính khi chạm. Đường cong có overshoot `cubic-bezier(.2,.9,.3,1.3)` ở `.book a` (`:848`) và `.cover-link .book-cover` (`:1499`). Mã: TS-X4, TS-X24, TS-M2, IMP-M4, IMP-R4. Sửa: một trong hai (viền hoặc bóng), hover trong `@media (hover:hover)`, ease-out không overshoot. Lệnh: `/impeccable quieter` + `/impeccable animate`.

**C13 — P2 — Kiểu chữ: 3 họ font, cỡ px cố định, nhiều chữ 12 px.** `index.html:13` nạp Be Vietnam Pro + Noto Serif + Noto Serif Display (`app.css:39-40,778`) → vi phạm TS-T1 (không bao giờ ba; Noto Serif và Display là hai họ nạp riêng). Thang chữ khai báo bằng px (`app.css:20`) nên không theo cỡ chữ mặc định của người dùng (IMP-T6; xác minh bằng đọc code, chưa thử đổi cỡ chữ trình duyệt). Số nút chữ 12 px: 153 nút DOM trên Quizzes 390 (đo `fsSet`). Không có `::selection`/`caret-color` theo palette (IMP-V7); chỉ `h1` có `text-wrap: balance` (`app.css:917`), không có `pretty` cho thân. Đạt: có subset `vietnamese` (xem Positive). Lệnh: `/impeccable typeset`.

**C14 — P3 — Palette thứ hai trong component.** 157 mã hex và 85 `rgba()` ngoài khối token (đếm `grep` trên `app.css`): gỗ/vàng sidebar, `#f2c14e`, `#8e1f19`, `.f-ksu`… Mã: IMP-A3, TS-C1. Phần lớn nằm trong minh hoạ/tủ gỗ nên P3.

**C15 — P3 — Dùng accent rải khắp (kem + cam).** Accent `#d97a1e` xuất hiện ở CTA, kicker, link “Tất cả…”, ring focus, ô bậc 1–5, tab active, chip, thanh tiến độ, diamond tiêu đề mục (`app.css:122,399,410,457,764,…`). TS-C2/C3/C9: accent nên < 5 % pixel, không dành cho heading/icon/bullet. Cặp nền kem + cam là TS-X15; **[BRAND]** (X3 cho là ngoại lệ do brief, tôi ghi lại theo yêu cầu chấm thẳng). Serif display ở mọi `h1` (`app.css:779`, TS-X16) cũng **[BRAND]**. Contrast của bảng màu đều đạt (xem Positive).

**C16 — P1 — Màn hiển thị nguyên văn luật không có lưu ý “thông tin pháp luật chung, không phải tư vấn”.** Chỉ có ở `Profile.svelte:193`; `app.css:939` ghi chú “chỉ ở trang Hồ sơ”; `Shell.svelte` không có footer (CSS `.shell > .foot` còn nhưng Shell không render). Cả 6 màn của nhóm này không có (đã xác minh bằng grep `không phải tư vấn` chỉ ra duy nhất `Profile.svelte`). Mã: VN-5; CLAUDE.md (“Nội dung luật… không phải tư vấn”). Ảnh: `[crops/a-1280-c-2](anh/crops-a-1280-c-2.webp)` (định nghĩa + nguồn, không có lưu ý). Sửa: một dòng 12–14 px dưới dòng `Nguồn` ở mỗi mục mở của `Concepts`, hoặc footer Shell. Lệnh: `/impeccable clarify`.

### Khác (shell)
- Cấu trúc 4 đích đến, nhãn chữ, `aria-current`, `aria-label` — đạt; tabbar 4 mục, vùng chạm ≥ 44 px (xem Positive). Mobile trang con tốn chrome dọc: topbar 64 px + “← Quay lại” 44 px + breadcrumb 15 px (xem SJ-5).
- Hai `nav` cùng nhãn “Điều hướng chính” (sidenav + tabbar) nhưng chỉ một cái hiển thị tại mỗi breakpoint → không gây lỗi.

---

## 2. Màn 1 — Hôm nay `#/` (`routes/Home.svelte`, `HeroCard.svelte`)

| Chiều impeccable | Điểm | Ghi chú |
|---|---|---|
| A1 Accessibility | 3 | contrast đạt, h1/h2 đúng, target ≥ 44; trừ C1–C3 |
| A2 Performance | 3 | tải 24 JSON (cả 23 môn) cho ≤ 4 hàng (xem H-6); 6 animation trang trí |
| A3 Theming | 3 | token tốt; hex thô ở tủ sidebar |
| A4 Responsive | 3 | 320/390/640/1280 không cuộn ngang; tranh hero đè chữ (H-2) |
| A5 Impl. Integrity | 3 | mạch lạc; lặp CTA, kicker |
| **Tổng** | **15/20 (Good)** | |

Nielsen (H5 n/a: không có hành động phá huỷ): H1 3 · H2 2 · H3 3 · H4 3 · H6 3 · H7 3 · H8 2 · H9 2 · H10 3 = **24/36 (67 %, Acceptable sát Good)**.
Cognitive load trượt: C4 (thứ bậc: hero + danh sách + thẻ quiz cùng nặng), C5 (hai CTA cùng đích) → 2 (vừa). Persona: **Jordan** (5 giây: nhận ra “Bắt đầu” + nút cam, nhưng “bậc/đợt/sách/chức danh” lạ); **Casey** (CTA hero ở y≈545/844 trên 390, ngón cái với tới được, thanh tab dưới đạt).
IMP-S1: đặc thù (cổng Văn Miếu, bìa sách thật) → đạt. TS-F4 phụ (không cộng với thang chính): design 7,5 · usability 7,5 · creativity 8 · content 7,5.
Taste tells chạm: TS-X7/IMP-B3 (kicker “BẮT ĐẦU”), TS-W1/X21 (tiêu đề hero 4 dòng), TS-X8 (chip trên h3), TS-X4/X24 (bóng + hover-lift), TS-X15 [BRAND], TS-X16 [BRAND], TS-A2 (hero minh hoạ ở màn công cụ), TS-F3#13 (art chạm chữ).

**H-1 — P2 — Tiêu đề hero 4 dòng, ghép “Môn › Đợt”.** `HeroCard.svelte:22,27,32` (`{state.subject.title} › {state.lesson.title}`), `app.css:797` (serif 22–28 px). Ảnh: `[shots/390-light-home](anh/shots-390-light-home.webp)`, `[shots/1280-light-home](anh/shots-1280-light-home.webp)` (cả hai 4 dòng: “Lý luận chung về Nhà nước và Pháp luật › Nguồn gốc, bản chất và dấu hiệu của nhà nước”). Mã: TS-W1 (≤ 2 dòng), TS-X21, IMP-C4. Tác động: người học phải đọc cả câu để biết “làm gì tiếp”; “›” là dấu điều hướng, không phải chữ. Sửa: tiêu đề = tên đợt (≤ 2 dòng), tên môn thành dòng phụ 14 px. Đã xác minh bằng ảnh. Lệnh: `/impeccable typeset`.

**H-2 — P2 — Tranh hero chạm/đè chữ.** Ở 1280 nét gió của tranh chạm chữ “c” cuối “nước” (`[crops/a-1280-home-collide](anh/crops-a-1280-home-collide.webp)`); `app.css:810` tranh rộng 56 % trong khi `.hero-body` max 50 % (`:811`), tranh ở `z-index:-1`. Mã: TS-F3#13, IMP-V3. Ở 390 tranh nằm trên chữ và đẩy CTA xuống y≈545. Đã xác minh bằng ảnh. Sửa: để chừa lề phải cho tranh hoặc cắt tranh theo `object-position`. Lệnh: `/impeccable layout`.

**H-3 — P2 — Hai CTA cho cùng một đích ở lần đầu.** `Home.svelte:94` (hero “Học đợt đầu tiên →”) và `Home.svelte:99-107` (hàng đầu “Lý luận chung về Nhà nước và Pháp luật”, cùng môn). Mã: IMP-C5, IMP-H8, TS-A1. Ảnh: cùng hai ảnh trên. Tác động: giảm tín hiệu “một việc”. Sửa: ở trạng thái `start` chỉ hiện hero + “Chọn môn khác”. Lệnh: `/impeccable distill`.

**H-4 — P3 — `h1` ẩn, vùng hero đặt tên bằng kicker.** `Home.svelte:93` `<h1 class="sr-only">Hôm nay</h1>`; `HeroCard.svelte:12` `aria-labelledby="hero-kicker"` → vùng tên là “BẮT ĐẦU”. Mã: TS-L4, IMP-A1. Heading trong `.section-title` còn chứa cả liên kết “Tất cả 23 môn →” (`Home.svelte:97`) nên tên heading dài/nhiễu. Sửa: `aria-labelledby` trỏ vào tiêu đề thật; tách link khỏi heading.

**H-5 — P2 — Lỗi tải hiện lời nhắc cho dev, không có Thử lại.** `Home.svelte:89` “Nếu mở file trực tiếp, hãy chạy `npm run dev` ở gốc repo.”; không có nút thử lại. Mã: IMP-H9, TS-S4. **Chưa xác minh bằng ảnh** (không kích hoạt được lỗi). Sửa: câu cho người dùng + nút “Tải lại”; lời nhắc dev đưa vào console.

**H-6 — P3 — Chờ tải là chữ giữa khoảng trống; tải thừa dữ liệu.** `Home.svelte:91` + `app.css:52` (`min-height:60vh`, chữ “Đang tải…”), không skeleton (TS-S3). `Home.svelte:44` `loadSubject` cho cả 23 môn để chọn ≤ 4 hàng; đo thực tế Hôm nay ở 390: 31 request, 24 JSON, 360 KB (`net-a.cjs`). Mã: IMP-A2, TS-S3. Lệnh: `/impeccable optimize`.

**H-7 — P3 — Chip trên tiêu đề; số lớn màu accent.** `Home.svelte:123` chip “Pháp luật đại cương” nằm trên h3 (TS-X8); `HeroCard.svelte:17`/`app.css:401` số `.big` 36 px màu accent ở trạng thái `due` (TS-A3 “không in màu brand”). **Trạng thái `due` chưa chụp → chưa xác minh bằng ảnh**.

---

## 3. Màn 2 — Môn học `#/mon` (`routes/Subjects.svelte`)

| Chiều | Điểm | Ghi chú |
|---|---|---|
| A1 | 3 | target ≥ 44 ở mọi chip/thẻ (đã đo); heading đúng (h1, h2 theo kệ) |
| A2 | 3 | 1347 node, 38 SVG, 24 JSON; ổn |
| A3 | 3 | |
| A4 | 3 | không tràn ngang 320; chip cuộn ngang bị cắt ở 1280 (S-1) |
| A5 | 3 | |
| **Tổng** | **15/20 (Good)** | |

Nielsen (H5 n/a): H1 3 · H2 3 · H3 3 · H4 3 · H6 3 · H7 3 (tìm không dấu, viết tắt “ds”) · H8 2 · H9 3 · H10 3 = **26/36 (72 %, Good)**.
Cognitive load trượt: C6 (8 chip lọc = quá tải), C3 → 2. Persona **Alex** hưởng lợi từ tìm viết tắt; **Casey**: lưới 4 cột 358 px, chạm 44 px ok.
IMP-S1 đạt (kệ sách + bìa thật). TS-F4 phụ: 7,5 · 7,5 · 8 · 7,5.
Taste tells: TS-C8 (cầu vồng 8 hue bìa) **[BRAND]**, TS-X17/X19 (ván gỗ, đường kép), TS-A2 (banner `head-stack`), TS-L3 (hố trống).

**S-1 — P2 — 8 chip lọc, hàng cuộn ngang bị cắt, desktop vẫn cuộn.** `Subjects.svelte:74-79`, `app.css:1488-1489` (`overflow-x:auto; flex:none`). Ảnh: `[shots/1280-light-subjects](anh/shots-1280-light-subjects.webp)` (chip cuối “Hìn…” cụt tại mép phải). Mã: IMP-C6 (≥ 8 lựa chọn), TS-P4. Tác động: người dùng không biết còn chip; trên 1280 còn nhiều chỗ để xuống dòng. Sửa: `flex-wrap:wrap` từ 768 px, hoặc `<select>`. Cũng có ở `Quizzes.svelte:98-103`. Lệnh: `/impeccable adapt`.

**S-2 — P2 — Tên môn bị cắt “…” trên bìa, hai môn trùng đầu tên.** `app.css:1502` (`-webkit-line-clamp:2`), `Subjects.svelte:51`. Ảnh: `[shots/1280-light-subjects](anh/shots-1280-light-subjects.webp)` (“Lý luận chung về Nhà nước…” và “Lịch sử Nhà nước và Phá…”); phần còn lại chỉ có trong `sr-only`. Mã: IMP-H6, VN-3. Tác động: người nhìn không phân biệt được các môn dài. Sửa: tên rút gọn riêng (`coverTitle`) hoặc 3 dòng; dùng `title`/tooltip không đủ trên mobile.

**S-3 — P2 — Lưới 2 cột kệ để lại hố trống.** `app.css:1568-1571` (`.shelves` 2 cột ≥ 1024). Ảnh: `[shots/1280-light-subjects](anh/shots-1280-light-subjects.webp)`: dưới “Tài chính – Ngân hàng” trống ≈ 240 px cạnh khối “Thương mại” 2 hàng; “Hình sự 1 môn” đứng lẻ cạnh “Dân sự”. Mã: TS-L2, TS-L3. Sửa: CSS columns/masonry hoặc gộp kệ ít môn. Lệnh: `/impeccable layout`.

**S-4 — P3 — Banner chồng 3 bìa lặp lại chính lưới bên dưới; ván gỗ.** `Subjects.svelte:59-61`, `app.css:1476-1483` (bìa thứ hai che chữ bìa thứ nhất), ván `.plank` (`:861`, `:1503-1507`). Mã: TS-A2, IMP-H8, TS-C8. **[BRAND]**. Ảnh: `[shots/1280-light-subjects](anh/shots-1280-light-subjects.webp)` (đầu trang).

**S-5 — P2 — Tiêu đề kệ IN HOA kèm số đếm nhỏ.** `Subjects.svelte:89` (“HIẾN PHÁP – HÀNH CHÍNH 3 MÔN”), `app.css:126,764-765`. Mã: TS-T7, X12 (xem C8). Sửa: sentence case.

**S-6 — P3 — Ô tìm chỉ có placeholder trực quan.** `Subjects.svelte:65-66` nhãn `sr-only`, placeholder “Tìm môn, vd. ds” (mặc định 4,61:1 trên trắng, đo bằng màu #757575 giả định mặc định của Chrome). TS-A9: nhãn nên hiện. Nhẹ vì ô tìm tự nói rõ.

**S-7 — P3 — Mục “Đang học” lặp môn đã có ở kệ.** `Subjects.svelte:80-85` vs `:87-95`. **Chưa xác minh bằng ảnh** (first-run không có tiến độ).

---

## 4. Màn 3 — Trang môn `#/mon/hien-phap` (`routes/Subject.svelte`, `MasteryGrid`, `LevelLegend`)

| Chiều | Điểm | Ghi chú |
|---|---|---|
| A1 | 2 | chỉ h1 (SJ-1); bậc chỉ bằng màu (SJ-2); target 15–25 px (SJ-5/7) |
| A2 | 3 | 1541 node, 37 SVG |
| A3 | 3 | |
| A4 | 3 | không tràn ngang; hero đè chữ (SJ-4) |
| A5 | 3 | |
| **Tổng** | **14/20 (Good thấp)** | |

Nielsen: H1 3 · H2 3 · H3 3 · H4 3 · H5 3 (có `confirm` đợt khoá) · H6 2 · H7 3 · H8 2 · H9 3 (lỗi có link về Môn học) · H10 3 = **28/40 (70 %, Good)**.
Cognitive load trượt: C1 (nhiều tiêu điểm: hero, 12 chip chương, chú giải, đợt), C6 (12 chip), C8 → 3 (vừa). Persona: **Sam** (không heading, bậc theo màu); **Casey** (hint “Ngành luật Hiến pháp: đối t…” cụt).
TS-F4 phụ: 7 · 7 · 7,5 · 7,5. IMP-S2: “Học tiếp” rõ; chưa thấy thông điệp trấn an khi tụt bậc (chưa có dữ liệu).

**SJ-1 — P1 — Không có cấu trúc heading dưới h1.** `MasteryGrid.svelte:18` `<p class="kicker chapter">` (tên chương), đợt là `<a>` trong `<li>` (`:24`); probe DOM: headings = chỉ `H1:Luật Hiến pháp` (`probe.json`). Mã: IMP-A1 (WCAG 1.3.1/2.4.6), TS-L4. Tác động: trang 8338 px (390) có 12 chương/nhiều đợt mà người dùng đọc màn hình không nhảy được. Sửa: `h2` cho chương, `h3` cho đợt (giữ style hiện tại). Lệnh: `/impeccable harden`.

**SJ-2 — P1 — Bậc ghi nhớ chỉ truyền bằng màu, 5 bậc cùng một hue, cách nhau 1,17:1.** `app.css:35` (`--lv1…lv5` = accent trộn 25→85 % với giấy), `:444-446`; `MasteryGrid.svelte:30` và `Concepts.svelte:98` đặt `aria-hidden` cho ô và để số bậc trong `title`/`aria-label`. Đo: lv1→lv2→lv3→lv4→lv5 chỉ cách nhau 1,17–1,18:1, lv0/thẻ 1,35:1, lv5/thẻ 2,65:1. Chú giải (`LevelLegend`) liệt kê 0–6 nhưng người nhìn phải so 7 ô cam gần giống nhau; trên điện thoại `title` không hiện. Mã: IMP-K6, IMP-A1 (WCAG 1.4.1, 1.4.11), TS-C8. Ảnh: `[shots/390-light-subject](anh/shots-390-light-subject.webp)`, `[shots/1280-light-subject](anh/shots-1280-light-subject.webp)` (ô xám gần như nhau “0 Chưa học”). Đã xác minh (đo màu + đọc code); **chưa chụp trạng thái nhiều ô đã có bậc**. Lặp ở `Concepts` → mục hệ thống. Sửa: hiện số bậc/ký hiệu trong ô, hoặc dùng 3–4 bậc rõ hơn, bậc 6 xanh lá giữ. Lệnh: `/impeccable colorize` + `/impeccable harden`.

**SJ-3 — P2 — 12 chip chương lặp lại chính các tiêu đề ngay bên dưới.** `Subject.svelte:79-83`, `app.css:471-474,936`. Ảnh: `[shots/1280-light-subject](anh/shots-1280-light-subject.webp)` (3 hàng chip đẩy đợt đầu tiên tới y≈640/800). Mã: IMP-C6, C3, IMP-H8. Tác động: người học phải vượt qua 3 hàng điều hướng để thấy bài tiếp theo (dù hero đã có “Học tiếp”). Sửa: một `<select>`/sheet “Nhảy tới chương” hoặc chỉ hiển thị khi cuộn. Lệnh: `/impeccable distill`.

**SJ-4 — P2 — Tranh hero nằm đè chữ ở 390; gợi ý bài tiếp bị cắt.** `app.css:803` (tranh tuyệt đối `opacity:.5`, `z-index:-1` phía sau tiêu đề), `app.css:1529` (`.next-hint` một dòng `ellipsis`), `Subject.svelte:74`. Ảnh: `[shots/390-light-subject](anh/shots-390-light-subject.webp)` (đầu trang): “Luật Hiến pháp” và “Thuần thục 0 %” chồng lên cột trụ; “Ngành luật Hiến pháp: đối t…” bị cụt. Mã: TS-F3#13, IMP-V3. Sửa: ẩn tranh ở < 600 (đã làm cho `.head-art` của `.page-head`), hint tối đa 2 dòng.

**SJ-5 — P2 — Hai cách quay lại chồng nhau, liên kết breadcrumb 15 px.** `Shell.svelte:50` (“← Quay lại” 44 px) + `Subject.svelte:63` breadcrumb 12 px (`crumbs`). Đo 390: link “Môn học” 50×15 (inline). Cùng lặp ở Concepts. Mã: IMP-H4/H8, IMP-R3; WCAG 2.5.8 miễn trừ link nội dòng nhưng dưới 44. Tác động: 100+ px chrome dọc trước nội dung (topbar 64 + back 44 + crumb 15). Sửa: mobile chỉ Back, desktop chỉ breadcrumb. Lệnh: `/impeccable adapt`.

**SJ-6 — P2 — Đợt khoá chỉ khác màu; mở bằng `confirm()` gốc.** `MasteryGrid.svelte:12` (`confirm('Đợt này nằm sau đợt đang học. Thi vượt?')`), `app.css:453` (`.locked` chỉ xám) và `:896-898`. Ảnh: `[shots/390-light-subject](anh/shots-390-light-subject.webp)` (Chương 2 xám). Mã: IMP-K6, IMP-B5/X13, IMP-H2 (“Thi vượt” là thuật ngữ lạ). Tác động: không biết đợt nào bị khoá nếu không phân biệt xám; hộp thoại hệ điều hành lệch giọng app. Sửa: nhãn “Chưa mở” + sheet xác nhận trong app (đã có `Sheet.svelte`).

**SJ-7 — P2 — Liên kết đợt cao 25 px.** Đo 390: `a` “Lịch sử lập hiến Việt Nam” 200×25 và 5 link tương tự (`MasteryGrid.svelte:24`, `app.css:455`). Đạt 2.5.8 (≥ 24) nhưng thấp hơn 44 (IMP-R3, Casey). Sửa: cả hàng đầu đợt là vùng bấm `min-height:44px`.

**SJ-8 — P2 — Chip khái niệm cắt “…” ở 390.** `app.css:465` (`.cell-term` ellipsis). Ảnh: `[shots/390-light-subject](anh/shots-390-light-subject.webp)` (“Đối tượng điều chỉnh của ngành luật…”). Tên đầy đủ chỉ trong `title`. Mã: IMP-H6. Sửa: cho xuống dòng (min-height thay chiều cao cố định).

**SJ-9 — P3 — `TIẾP THEO CHO BẠN` IN HOA + “✓ đã qua” ký tự.** `MasteryGrid.svelte:25`, `app.css:457` (xem C8, C10).

**SJ-10 — P3 — Chú giải 7 mục 12 px không có heading.** `LevelLegend.svelte:5-6`, `app.css:447-449`. Gộp vào SJ-2.

---

## 5. Màn 4 — Danh mục khái niệm `#/mon/hien-phap/khai-niem` (`routes/Concepts.svelte`)

| Chiều | Điểm | Ghi chú |
|---|---|---|
| A1 | 2 | chỉ h1, nhóm bằng `<p class="kicker">`; bậc theo màu |
| A2 | 2 | 101 request/khái niệm; 101 `<li>` |
| A3 | 3 | |
| A4 | 3 | |
| A5 | 3 | |
| **Tổng** | **13/20 (Acceptable)** | |

Nielsen (H5 n/a): H1 3 · H2 3 · H3 3 · H4 3 · H6 3 · H7 3 · H8 3 · H9 3 · H10 3 = **27/36 (75 %, Good)**.
Cognitive load trượt: C8 (không progressive disclosure theo nhóm), C3 → 2. Persona **Riley** (101 mục; chuỗi dài gói được vì wrap), **Sam**.
TS-F4 phụ: 7 · 7,5 · 7 · 8.

**CL-1 — P1 — Không có heading cho 12 nhóm và 101 mục.** `Concepts.svelte:90` (`<p class="kicker">`), tên khái niệm nằm trong `<button>` (`:97-102`). Probe: chỉ `H1:Khái niệm · Hiến pháp`. Mã: IMP-A1 (WCAG 1.3.1/2.4.6), TS-L4. Sửa: `h2` cho nhóm, `h3` bao nút tên khái niệm (mẫu accordion chuẩn). Cùng loại với SJ-1.

**CL-2 — P2 — Mỗi khái niệm một request; render cả 101 mục.** `Concepts.svelte:43` `ids.map((id) => loadConcepts(s.id, [id]))`. Đo (390, tải nguội): **135 request, 125 JSON, 527 KB** (`net-a.cjs`) so với 31 request ở Hôm nay; DOM 1196 node; trang cao 9050 px (390) / 7327 px (1280). Mã: IMP-A2. Tác động: màn danh mục đọc nhanh chậm hơn và nặng pin; SW cache giảm lần sau. Sửa: bảng `terms` đã có (`loadTerms`) cho danh sách, chỉ tải thân khi mở mục, hoặc một gói JSON theo môn (thay đổi pipeline `packages/content` → việc riêng). Lệnh: `/impeccable optimize`.

**CL-3 — P2 — Danh sách dài không có mốc nhảy; tìm kiếm không báo số kết quả.** `Concepts.svelte:77-87` (không có `role="status"` đếm như `Quizzes.svelte:111`). Mã: IMP-H1, IMP-C8. Sửa: dòng “Hiện n/101” `role="status"`, nhóm có thể thu gọn.

**CL-4 — P2 — Banner minh hoạ 200 px trước ô tìm ở trang công cụ.** `Concepts.svelte:72`, `app.css:806-812`. Ảnh: `[shots/1280-light-concepts-list](anh/shots-1280-light-concepts-list.webp)`. Mã: TS-A2, IMP-B1/H8 (trang danh mục tra cứu, câu hỏi của màn là “tìm khái niệm”). **[BRAND]** (tranh là chữ ký hình khối). Sửa: thu nhỏ còn dải 64 px hoặc bỏ ở màn công cụ.

**CL-5 — P3 — H1 “Khái niệm · Hiến pháp” để mồ côi dấu “·”.** `Concepts.svelte:73`, ảnh `[shots/1280-light-concepts-list](anh/shots-1280-light-concepts-list.webp)` (dòng 1 “Khái niệm ·”, dòng 2 “Hiến pháp”; `text-wrap:balance` ở `app.css:917` không cứu vì `.page-head > :not(.head-art){max-width:50%}` `:811`). Mã: TS-T11. Sửa: “Khái niệm Hiến pháp” hoặc ngắt có chủ đích.

**CL-6 — P2 — (hệ thống) bậc chỉ bằng màu; ký tự ★ ☆ ▸ ▾.** Xem SJ-2, C10. `Concepts.svelte:98,101,103`; chevron đổi bằng ký tự `▾/▸` (không animate).

---

## 6. Màn 5 — Khái niệm `#/mon/hien-phap/khai-niem/chu-quyen-nhan-dan` (cùng `routes/Concepts.svelte`)

Lưu ý cấu trúc: route này **không phải trang riêng**; là danh sách 101 mục có một mục tự mở và cuộn tới (`Concepts.svelte:51-56`, `scrollIntoView`). Ảnh toàn trang chụp không cuộn nên mục nằm giữa trang (`[shots/1280-light-concept](anh/shots-1280-light-concept.webp)` y≈1430; `[crops/a-1280-c-2](anh/crops-a-1280-c-2.webp)`).

| Chiều | Điểm | Ghi chú |
|---|---|---|
| A1 | 2 | không focus vào mục mở; heading; nguồn 12 px |
| A2 | 2 | như CL-2 |
| A3 | 3 | |
| A4 | 3 | |
| A5 | 2 | deep-link vào giữa danh sách, h1 không nêu tên khái niệm |
| **Tổng** | **12/20 (Acceptable)** | |

Nielsen (H5 n/a): H1 2 · H2 3 · H3 3 · H4 3 · H6 3 · H7 2 · H8 3 · H9 3 · H10 2 = **24/36 (67 %, Acceptable)**.
Cognitive load trượt: C1 (định nghĩa, giải thích, ví dụ, dễ nhầm, 2 so sánh, nguồn cùng nặng), C4 → 2. Persona: **Sam** (focus), **Jordan** (không giải thích “Nguồn/đối chiếu”).
**IMP-S1 + Read mode**: nội dung luật hiển thị nguyên văn kèm nguồn — làm đúng VN-5 về mặt dữ liệu. TS-F4 phụ: 7 · 7 · 7 · 8.

**CN-1 — P1 — Deep-link không đưa focus tới mục vừa mở, trang không nêu tên khái niệm.** `Concepts.svelte:52-56` (`open=[target]`, `scrollIntoView`, không `.focus()`); `h1` giữ “Khái niệm · Hiến pháp” (`:73`) dù `document.title` đổi (`:50`). Mã: IMP-A1, IMP-H1, IMP-A5. Tác động: người dùng bàn phím/đọc màn hình từ liên kết “Dễ nhầm với…” đứng yên ở đầu trang, không biết nội dung ở đâu; mọi người nhìn thấy khái niệm mở nằm giữa 100 mục khác. Sửa: sau `tick()` focus nút `entry-toggle` của mục mở, thông báo qua `aria-live`; hoặc làm trang chi tiết thật. Đã xác minh bằng đọc code + ảnh.

**CN-2 — P2 — Nguồn pháp lý là phần yếu nhất của khối.** `Concepts.svelte:119` dòng `Nguồn: … · Xem văn bản · đối chiếu {c.checked}` dùng `class="source muted small"` = 12 px xám, nằm **dưới** hai accordion “So sánh” (`[crops/a-1280-c-2](anh/crops-a-1280-c-2.webp)`); ngày hiển thị dạng ISO “2026-11-01” (VN-4: nên `01/11/2026`); link “Xem văn bản” cao 15 px, `target="_blank"` không báo mở tab mới. Mã: VN-5, VN-4, IMP-T1, IMP-R3. Tác động: người học luật cần căn cứ ngay cạnh trích dẫn. Sửa: đặt `Nguồn` ngay dưới blockquote, 14 px, `<cite>`, ngày `dd/mm/yyyy`, “(mở tab mới)”. Lệnh: `/impeccable clarify`.

**CN-3 — P2 — Thân mục: thứ bậc phẳng, “Dễ nhầm với” 12 px, vùng chạm nhỏ.** `Concepts.svelte:107-118`: định nghĩa (serif 16 px), giải thích (16 px), “Ví dụ” (16 px xám) rồi “Dễ nhầm với” (12 px). Đo 390: link “Nhà nước pháp quyền xã hội chủ nghĩa” 224×15, link thứ hai 300×34 (hai dòng). Ảnh: `[crops/a-390-c-2](anh/crops-a-390-c-2.webp)`. Mã: IMP-T1/X4 (nội dung đọc ≥ 16 px), IMP-R3, IMP-L1. Sửa: “Dễ nhầm với” thành chip/danh sách cao 44 px, 14–16 px.

**CN-4 — P2 — Lưu ý “Cập nhật luật” là callout 12 px viền trái.** `Concepts.svelte:110` (`.note small`), `app.css:459`. Thông tin “luật đã đổi” là cảnh báo quan trọng nhưng nhỏ nhất. **Chưa xác minh bằng ảnh** (khái niệm mẫu không có `note`). Mã: IMP-H1, IMP-B8.

**CN-5 — P3 — Ring focus của `summary` khác phần còn lại.** Xem C3; `Concepts.svelte:117` (“So sánh với «…»”), cao 30 px.

(Thiếu lưu ý “không phải tư vấn” → C16.)

---

## 7. Màn 6 — Luyện đề `#/luyen-de` (`routes/Quizzes.svelte`, `QuizRail`)

| Chiều | Điểm | Ghi chú |
|---|---|---|
| A1 | 3 | 47 phiếu là `<a>` với h3, `aria-live` + `role=status`; ring ở thẻ gợi ý tốt |
| A2 | 3 | 1918 node, 61 SVG, 47 vignette, không phân trang |
| A3 | 3 | |
| A4 | 3 | chip/ sắp xếp cao 44 ở mobile; carousel gợi ý cuộn ngang |
| A5 | 3 | |
| **Tổng** | **15/20 (Good)** | |

Nielsen (H5 n/a): H1 3 · H2 3 · H3 3 · H4 3 · H6 3 · H7 3 · H8 2 · H9 3 · H10 3 = **26/36 (72 %, Good)**.
Cognitive load trượt: C1 (stats + 3 gợi ý + 2 hàng điều khiển + 47 phiếu), C2/C6 (8 chip + 3 sắp xếp + 3 thẻ gợi ý), C8 → 3 (vừa). Persona **Casey**: phiếu đầu tiên bắt đầu ở y=665/844 trên 390 (79 %); **Alex**: sắp xếp + “Xáo đề khác” hữu ích.
IMP-S1 đạt (vé đề thi, vignette luật). TS-F4 phụ: 7 · 7 · 7,5 · 7,5.
Taste tells: IMP-B3/TS-X7 (kicker trên thẻ gợi ý), IMP-B8 (`border-left 4px`), TS-X24 (hover-lift), TS-L2 (3 thẻ chiều cao lệch), TS-A8 (nhãn “Mới” ×47 không mang thông tin), TS-A7/F3#9 (47 phiếu cùng khuôn).

**Q-1 — P2 — Hai hàng điều khiển + dòng đếm trước phiếu đầu tiên.** `Quizzes.svelte:96-111` (chip kệ 8 + sắp xếp 3 + đếm), `app.css:526-532`. Ảnh: `[shots/390-light-quizzes](anh/shots-390-light-quizzes.webp)` (phiếu “ĐỀ 01” ở y≈665; chip sắp xếp xuống 2 hàng ở 390). Mã: TS-P4 (≤ 60 %, tối đa một hàng điều khiển), IMP-C6. Sửa: sắp xếp thành một `<select>`/menu, chip kệ chung hàng; chiều cao điều khiển trên `.qz-sort .filter` 32 px ở desktop (`app.css:530`) trong khi chip kệ 40 px (không nhất quán).

**Q-2 — P2 — Ba thẻ gợi ý: viền trái màu, kicker, chiều cao lệch, một thẻ là trạng thái rỗng.** `Quizzes.svelte:64-93`, `app.css:513` (`border-left:4px`), `:516` (`.sug-k` IN HOA), `:512,515`. Ảnh: `[shots/1280-light-quizzes](anh/shots-1280-light-quizzes.webp)` (ba thẻ cao ≈ 120/140/200 px lệch đáy; thẻ giữa “Chưa có đề nào cần làm lại” chiếm 1/3 hàng); ở 390 cuộn ngang snap, thẻ 2–3 bị giấu. Mã: IMP-B3, IMP-B8, TS-L2, TS-S2. Tác động: lần đầu, 1/3 chỗ ưu tiên trang là câu “Làm vài đề, mình sẽ gợi ý…”. Sửa: một gợi ý chính (“Làm đề 01”), “Xáo đề khác” thành nút chữ; chỉ hiện thẻ “làm lại” khi có. Lệnh: `/impeccable distill`.

**Q-3 — P2 — 47 phiếu cùng khuôn, mỗi phiếu đều “Mới” và “10 câu · ~5 phút”.** `Quizzes.svelte:127-128`, `app.css:552-557`. Ảnh: `[shots/1280-light-quizzes](anh/shots-1280-light-quizzes.webp)`, `[shots/390-light-quizzes](anh/shots-390-light-quizzes.webp)` (cao 10957 px). Mã: TS-A8, IMP-H8, TS-F3#9 (sameness). Sắp xếp “Theo kệ” chỉ có dải màu phân nhóm, không có heading mỗi kệ (khác `Subjects`). Tác động: nhãn mặc định không thông tin; người cuộn khó biết đang ở nhóm nào. Sửa: chỉ gắn nhãn khi “Đã làm/Tối đa”; heading + đếm mỗi kệ, thu gọn/“Xem thêm”; metadata trùng đưa lên đầu trang một lần. Lệnh: `/impeccable distill` + `/impeccable layout`.

**Q-4 — P3 — Phụ đề phiếu cắt 2 dòng; tên đề không đồng nhất.** `app.css:547` (line-clamp 2): “…tuổi chịu trách nhiệm hình sự và hành…”; tiêu đề lẫn “Đặt cọc”, “Chuyển khoản nhầm” với “Đề kiểm tra Dân sự 2 – Nghĩa vụ, bảo đảm, hợp đồng” (nội dung dữ liệu). Mã: IMP-H4, VN-3.

**Q-5 — P3 — Trang trí phiếu lặp ×47.** Khuyết xé (`app.css:540-541`), chân kẻ đứt (`:552`), tem xoay −12° (`:550`), dải đầu in hoa 12 px màu kệ (`:542`), khung tranh nền kem (`:549`). Contrast chữ trắng trên 8 màu dải đều đạt (đã đo). Mã: TS-X17/X19. **[BRAND]** (ý tưởng “vé thi” đặc thù, nhưng nặng khi nhân 47).

**Q-6 — P3 — Dải số liệu ở đầu trang nằm trước câu trả lời cho “làm đề nào”.** `Quizzes.svelte:53-60`; ring `app.css:506-510` vẽ vòng rỗng ở 0 %. Mã: TS-A1, TS-A3, X7 (đạt điều kiện ≤ 40 px, không icon trong vòng; “–” cho điểm trung bình đúng TS-S1). Sửa: đưa xuống dưới gợi ý hoặc gộp vào dòng phụ.

**Q-7 — P3 — H1 và khung đầu trang khác các màn còn lại.** `app.css:497` `.qz-head h1 {clamp(26px,4vw,34px)}` vs `h1` 28/36 (`:123-124`); Quizzes không dùng `.page-head` có tranh như Subjects/Concepts. Mã: IMP-T4, IMP-H4. Gộp với quyết định bỏ banner (CL-4).

**Q-8 — chưa xác minh.** Tem điểm cao (`.tk-stamp`, `app.css:550-551`), trạng thái `perfect/done`, “Làm lại đề chưa đạt” có dữ liệu, `QuizRail` ≥ 1440.

---

## 8. Mẫu lặp và lỗi hệ thống (gộp ≥ 3 chỗ)

1. **Không có heading cấp 2–3 cho nội dung dài** (SJ-1, CL-1, CN-1): 2 màn + `MasteryGrid`. Sửa một lần ở `MasteryGrid` và `Concepts`.
2. **Thông tin chỉ bằng màu** (SJ-2, SJ-6, CL-6): bậc và đợt khoá.
3. **Kicker/IN HOA, viền trái, ký tự Unicode làm icon** (C8, C9, C10): lặp trên mọi màn.
4. **Bóng + viền + hover-lift + overshoot** (C12), **hairline kép** (C11) **[BRAND]**.
5. **Văn bản bị cắt “…”** (S-2, SJ-4, SJ-8, Q-4): mô hình `line-clamp`/`ellipsis` dùng cho tên môn, tên đợt, khái niệm, phụ đề; sự thật chỉ ở `title`/`sr-only`.
6. **Hai điều hướng quay lại + banner minh hoạ ở màn công cụ** (SJ-5, S-4, CL-4).

---

## 9. Positive findings (giữ nguyên)

- **Contrast chữ đạt toàn bộ** sau khi đo thật: thấp nhất 4,86:1 (chip “Mới”), `--muted` 5,43:1 trên giấy, `--accent-text` 5,33:1; CSS ghi rõ đã tính (`app.css:32-33`). Đã xác minh: `verify-a.json`.
- **Không cuộn ngang ở 320 px, 390 px, 640 px và 1280 px** trên cả 6 màn (đo `scrollWidth`). Hệ breakpoint theo shell rõ (tabbar < 768, rail 72, sidebar 232, rail phải 280).
- **Target cảm ứng ≥ 44 px** cho chip, nút, sao, thẻ ở 390; liên kết nhỏ “Tất cả… →” mở rộng vùng bấm bằng `::after` (`app.css:407-410`). Tabbar có `env(safe-area-inset-bottom)`, `viewport-fit=cover` (`index.html:5`).
- **Tiếng Việt:** `<html lang="vi">`; Be Vietnam Pro nạp đủ subset (xác minh `document.fonts`: ba face latin/latin-ext/vietnamese cho 400/600/800 `loaded`); leading h1 1,2 và thân 1,55 (`app.css:21`); font Google được SW `CacheFirst` (`vite.config.ts`).
- **Ngữ nghĩa tốt ở Luyện đề/Môn học:** h1/h2/h3, `aria-pressed` cho chip, `aria-live` cho đề ngẫu nhiên, `role="status"` cho số đề, `aria-current` cho nav, tên truy cập đầy đủ cho bìa sách (phần cắt nằm trong `sr-only`).
- **Tìm kiếm không dấu/viết tắt** (“ds”), câu rỗng có hướng dẫn thử lại (`Subjects.svelte:94`).
- **Nội dung luật đúng chuẩn:** định nghĩa nguyên văn, nguồn “Khoản 2 Điều 2 Hiến pháp 2013” + link + ngày đối chiếu hiện ra cho mỗi khái niệm (CN-2 chỉ nói về trình bày).
- **Phản hồi trạng thái:** thanh tiến độ có số (`0/30 thuần thục`), nhãn “Đang học/xong”, banner chặn lưu trữ có `role="alert"` (`Shell.svelte:47-49`), công tắc giảm chuyển động ở Cài đặt.
- **Độ đặc thù cao:** không phải template (cổng Văn Miếu, bìa giáo trình, phiếu đề); không có gradient tím, glow nút, số liệu bịa, copy “AI”; nhãn nút gọi tên hành động (“Học đợt đầu tiên”, “Xáo đề khác”).

---

## 10. Tổng hợp

- Điểm impeccable /20: Home 15 · Subjects 15 · Subject 14 · Concepts-list 13 · Concept 12 · Quizzes 15 (trung bình 14,0, Good). Nielsen: 24 · 26 · 28/40 · 27 · 24 · 26 (/36 trừ H5 n/a).
- Số phát hiện (đếm theo ID): **P0 = 0 · P1 = 8 (C1, C2, C4, C16, SJ-1, SJ-2, CL-1, CN-1) · P2 = 34 · P3 = 16**.
- Ưu tiên sửa trước release: C2 (focus route), C1 (reduced-motion), SJ-1/CL-1 (heading), SJ-2 (bậc không chỉ màu), C16 (lưu ý pháp lý), C4 (chữ < 11 px).
- Việc ngoài phạm vi, ghi lại để làm riêng: gói JSON theo môn cho Concepts (CL-2); chụp/kiểm trạng thái có dữ liệu + rail ≥ 1440; kiểm bằng trình đọc màn hình và thiết bị thật.
