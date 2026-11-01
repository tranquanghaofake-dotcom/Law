# Luyện Luật — Thiết kế lại layout & điều hướng (đợt nâng cấp 1)

Phiên bản 1.0 · 01/11/2026 · Trạng thái: **đã triển khai** (PR #9, #10 và PR 3; sai khác ghi ở sổ kế hoạch `docs/plans/2026-11-01-layout-redesign.md`)
Tác giả: Claude soạn theo yêu cầu của Trần Quang Hào. Ngôn ngữ: tiếng Việt, giữ thuật ngữ tiếng Anh.
Kế thừa: `2026-11-01-luyen-luat-web-design.md` (spec gốc, mục 5 UI/UX). Spec này **thay thế mục 5.2** của spec gốc về cấu trúc màn hình; không đổi engine, nội dung, bảng màu.

---

## 0. Tóm tắt

Web hiện tại (G1a) chạy được nhưng "đơn giản và khó hiểu" vì **kiến trúc thông tin**, không phải trang trí. Hào xác nhận cả bốn triệu chứng: không biết bắt đầu từ đâu; không phân biệt "học khái niệm 6 bậc" với "luyện đề 10 câu"; không thấy tiến độ/cấu trúc môn; không có điều hướng nên không biết đang ở đâu.

Đợt này tái cấu trúc thành **app shell 4 đích đến** (Hôm nay · Môn học · Luyện đề · Hồ sơ) với sidebar trái ở desktop, rail thu gọn ở tablet, tab bar đáy ở điện thoại; trang chủ trở thành **state router** với một thẻ hành động duy nhất; thêm **trang Môn** hiển thị lưới bậc thuần thục kiểu Khan Academy; Luyện đề tách thành mục riêng cấp 2; phiên học giữ nguyên và ẩn shell.

Quyết định đã chốt với Hào (01/11/2026):
1. Vấn đề = cả 4 triệu chứng trên.
2. Luyện đề 10 câu → **mục riêng cấp 2**, không gộp vào môn, không ẩn.
3. Khung điều hướng = **phương án A** (sidebar trái + tab bar đáy) **+ 3 điều chỉnh** rút từ khảo sát: trang chủ theo state router; trang Môn mượn lưới mastery của Khan Academy; màn ≥ 1440 px có rail phải.
4. Phần 1 (shell) và Phần 2 (Hôm nay) đã duyệt từng phần; Hào yêu cầu "duyệt tất cả" phần còn lại trên file spec này.

## 1. Căn cứ khảo sát (01/11/2026)

| Nguồn | Điều rút ra, áp dụng ở đâu |
|---|---|
| NN/g — [Menu-Design Checklist](https://www.nngroup.com/articles/menu-design/) | *Applications → primary navigation bên trái*; luôn chỉ rõ vị trí hiện tại → §2 |
| NN/g — [Vertical navigation](https://www.nngroup.com/articles/vertical-nav/) | Sidebar trái hợp IA sẽ mở rộng; **không giấu sau hamburger, không chỉ icon**, không trùng menu → §2 |
| NN/g — [Mobile navigation patterns](https://www.nngroup.com/articles/mobile-navigation-patterns/) | Tab bar đáy khi ≤ 5 mục; hamburger kém khám phá nhất → §2.2 |
| Material 3 — [Navigation rail](https://m3.material.io/components/navigation-rail/overview) | Compact → nav bar; medium/expanded → rail; 3–7 đích; cùng vị trí mọi màn → §2 |
| Duolingo — [blog redesign 2022](https://blog.duolingo.com/new-duolingo-home-screen-design/) + ảnh web 2024 | 3 cột: cấu trúc khoá / một nút START / rail ngữ cảnh; ôn tập nằm trong lộ trình → §3, §6 |
| Quizlet (ảnh chính thức) | Sidebar trái cố định; khi học thu thành "Back + tiến độ" → §2.4 |
| Khan Academy — [mastery visualization](https://support.khanacademy.org/hc/en-us/articles/18735142028045) | `Course mastery %` + lưới ô theo mức + "Up next for you" → §4 |
| Brilliant / [ScreensDesign](https://screensdesign.com/articles/mobile-app-home-screen-design/) | Trang chủ là *state router*; thẻ Continue phải nêu tên đối tượng + tiến độ → §3 |
| Mochi / Anki ([Matuschak](https://notes.andymatuschak.org/zMxXQHmTuLN9mKA46RPpqJs)) | Tách "New" và "Due today" trong UI → §3 |

Không mượn: con đường zig-zag của Duolingo (tốn chiều dọc, không hợp tone "Văn Miếu"), nhân vật hoạt hình, hamburger, menu chỉ icon.

## 2. App shell & điều hướng (đã duyệt)

### 2.1 Bốn đích đến

| # | Nhãn | Route | Icon (ký tự, không thư viện) | Việc |
|---|---|---|---|---|
| 1 | **Hôm nay** | `#/` | ☀ | Ôn đến hạn / tiếp tục đợt dở |
| 2 | **Môn học** | `#/mon`, `#/mon/:subject` | 📖 | Danh sách môn → trang môn (lưới bậc) |
| 3 | **Luyện đề** | `#/luyen-de` | ✎ | 5 bộ 10 câu (kiểm tra nhanh) |
| 4 | **Hồ sơ** | `#/toi`, `#/cai-dat` | 👤 | Bậc, chuỗi, biểu đồ, dữ liệu; Cài đặt là tab con |

Thứ tự và vị trí **cố định ở mọi kích cỡ** (M3). Mục đang chọn có `aria-current="page"`, nền pill `color-mix(in srgb, var(--accent) 14%, transparent)` + chữ đậm; "Môn học" sáng cả khi ở `#/mon/:subject`; "Hồ sơ" sáng cả khi ở `#/cai-dat`.

Route cũ giữ nguyên để không gãy link đã chia sẻ: `#/bo/:id` (quiz), `#/hoc/:subject/:lesson` (lesson), `#/on` (review), `#/toi`, `#/cai-dat`. `/web/` redirect đã có, không đụng.

### 2.2 Ba hình thái theo bề rộng (một `Shell.svelte`, đổi bằng CSS, DOM không đổi)

```
< 768 px  (điện thoại)         768–1279 px (tablet/laptop nhỏ)    ≥ 1280 px (desktop)
┌─────────────────────┐        ┌────┬──────────────────────┐    ┌────────┬───────────────┬──────┐
│ § Luyện Luật   🔥3 §│ top    │ §  │                      │    │ §Luyện │               │ rail │
│                     │        │ ☀  │                      │    │ ☀ Hôm  │   nội dung    │ phải │
│      nội dung       │        │Hôm │      nội dung        │    │   nay  │   max 760     │ 280  │
│                     │        │nay │      max 760         │    │📖 Môn  │               │(chỉ  │
│                     │        │📖  │                      │    │  học   │               │≥1440)│
│                     │        │Môn │                      │    │ ✎ Luyện│               │      │
├────┬────┬────┬──────┤        │ ✎  │                      │    │👤 Hồ sơ│               │      │
│ ☀  │ 📖 │ ✎  │ 👤  │ tab    │ 👤 │                      │    │────────│               │      │
│Hôm │Môn │Luyện│Hồ sơ│ bar    │    │                      │    │🔥3 Tú  │               │      │
└────┴────┴────┴──────┘        └────┴──────────────────────┘    └────────┴───────────────┴──────┘
```

- **< 768 px**: top bar mỏng (logo + 🔥 + triện bậc, link tới Hồ sơ) + **tab bar đáy** 4 mục, mỗi mục icon trên / nhãn dưới, cao 56 px + `env(safe-area-inset-bottom)`, `position: fixed`. Nội dung có `padding-bottom` tương ứng. Footer pháp lý ở cuối trang.
- **768–1279 px**: **rail thu gọn 72 px** cố định bên trái (M3 collapsed rail): icon + nhãn ngắn xếp dọc, không bao giờ chỉ icon. Không có top bar; 🔥/bậc ở đáy rail dạng số nhỏ.
- **≥ 1280 px**: **sidebar 232 px** icon + chữ; đáy sidebar là khối 🔥 chuỗi + triện bậc + "còn N XP tới <bậc sau>". **Bỏ header trên cùng**.
- **≥ 1440 px**: thêm **rail phải 280 px** (`<aside class="rail">`), nội dung do từng trang quyết định (§3–§5). Lưới `232px minmax(0, 760px) 280px`, `justify-content: center`; nền tranh lộ dần vẫn ở `.reveal` phía sau.

Cột nội dung tối đa **760 px** ở mọi hình thái có shell (thay cho khung 1100 px hiện tại). Phiên học giữ `720 + 320` như hiện có.

### 2.3 Thành phần kỹ thuật

- `src/lib/ui/Shell.svelte` — sidebar/rail/tab bar + slot nội dung + slot rail phải. Nhận `active: RouteName`.
- `src/lib/ui/nav.ts` — mảng `NAV: {name, label, href, icon, matches: RouteName[]}` (4 phần tử) để Shell, test và `document.title` dùng chung.
- `App.svelte` — `inSession` → render `<SessionShell>` (chỉ `<main>`), ngược lại `<Shell>`. Banner lưu trữ bị chặn giữ nguyên, đặt trên nội dung trong Shell.
- `header.svelte.ts` giữ nguyên làm nguồn 🔥/XP cho sidebar, rail và top bar mobile.
- `router.svelte.ts` — `RouteName` thêm `'subjects' | 'subject' | 'quizzes'`; `parseHash` thêm `mon`, `mon/:subject`, `luyen-de`; `hashFor` tương ứng.

### 2.4 Phiên học (`lesson`, `review`, `quiz`)

Shell ẩn hoàn toàn (sidebar, tab bar, rail, top bar). Còn `SessionBar` (← thoát có xác nhận, thanh tiến độ, đếm) + thẻ + `LessonPanel` ở desktop — như hiện tại, đúng spec gốc 5.1 "một màn một việc" và cách Quizlet Learn thu sidebar thành Back + tiến độ. Nút thoát đưa về **trang xuất phát** (`history.back()` nếu có, mặc định `#/`). Phím: Esc thoát, 1–4 chọn, Enter tiếp, Space nghe — giữ nguyên.

## 3. Trang "Hôm nay" (`#/`) (đã duyệt)

Nguyên tắc: thẻ đầu tiên trả lời "tôi quay lại để làm gì"; mọi thứ khác nhỏ hơn và đứng sau. **Bỏ hero khẩu hiệu** ("Nhớ luật như nhớ tên bạn") khỏi trang chủ; câu đó về README/landing sau này.

### 3.1 Thẻ chính — đúng một trong bốn trạng thái, ưu tiên từ trên xuống

| Ưu tiên | Điều kiện | Nội dung thẻ | Nút |
|---|---|---|---|
| 1 | `due > 0` | kicker **ÔN HÔM NAY** · số to `12` · "khái niệm sắp quên · ~4 phút" · tối đa 3 chip tên khái niệm | **Ôn ngay →** (`#/on`) |
| 2 | có đợt dở: ≥ 1 khái niệm trong đợt đã học (bậc ≥ 1) và chưa phải mọi khái niệm ≥ 3 (sửa 01/11: trước ghi "bậc 1–2", khiến đợt {3, 0} hiện ĐỢT MỚI) | kicker **TIẾP TỤC** · "Luật Hiến pháp › Hiến pháp là gì" · thanh `2/5` | **Học tiếp →** (`#/hoc/...`) |
| 3 | đã học ≥ 1 khái niệm, không due, không dở | kicker **ĐỢT MỚI** · tên đợt kế tiếp (đợt `current` theo thuật toán `SubjectPath`) · "5 khái niệm · ~6 phút" | **Bắt đầu →** |
| 4 | chưa có tiến độ nào | kicker **BẮT ĐẦU** · một câu: "Mỗi khái niệm đi qua 6 bậc: gặp → nhận biết → phân biệt → điền → tình huống → tự trả lời." · tên môn + đợt đầu | **Học đợt đầu tiên →** |

Thẻ: viền `--accent`, số/tên 40 px, nút duy nhất có class `primary` trên trang. Ước lượng phút = `Math.max(1, Math.round(steps × 25 / 60))` với `steps` = số bước của phiên tương ứng (`buildReviewSession` / `buildLessonSession`). Không bao giờ hiện "0" to như hiện nay.

### 3.2 "Môn đang học"

Một hàng mỗi môn có tiến độ > 0 (người mới: tất cả môn):
`▸ Luật Hiến pháp · [chip phẩm hàm] · thanh % (bậc ≥ 5 / tổng) · "4/10 thuần thục" · →` link `#/mon/:id`. Không còn danh sách đợt ở trang chủ.

### 3.3 "Kiểm tra nhanh"

Tiêu đề section + **một** thẻ đề: đề gần nhất chưa đạt điểm tối đa (theo `stats.best`), nếu không có thì đề đầu tiên theo `sortGroups`. Link "Tất cả đề →" sang `#/luyen-de`.

### 3.4 Rail phải (≥ 1440)

Khối 1: 🔥 chuỗi + 7 ô tuần (ngày có phiên = tô `--accent`; dữ liệu từ `db.reviews` theo ngày địa phương). Khối 2: triện bậc + thanh XP tới bậc sau. Khối 3: "Hẹn ôn ngày mai: N" (`repo.due(ngày mai 00:00)`). Khối 4: dòng pháp lý (footer chuyển lên đây ở desktop).

### 3.5 Kỹ thuật

- `src/lib/ui/today.ts` — hàm thuần `pickHeroState(input) → HeroState` với `input = { due: string[], subjects: Subject[], levels: Record<string, Level> }`; trả `{kind: 'due'|'continue'|'next'|'start', ...}`. Test 4 nhánh + ranh giới (đợt vừa xong hết bậc 3 → `next`, không `continue`).
- `src/lib/ui/lessonState.ts` — tách thuật toán `done/current/locked` khỏi `SubjectPath.svelte` để `today.ts`, trang Môn và test dùng chung.
- `Home.svelte` viết lại; `SubjectPath.svelte` bỏ (thay bằng lưới §4).
- Nhập điểm cũ từ `localStorage` (`best:<id>`) chuyển sang `stats.ts` hàm `migrateV1Best(index)` gọi một lần lúc `loadIndex`, không nằm trong `Home`.

## 4. Trang Môn học (`#/mon`, `#/mon/:subject`)

### 4.1 Danh sách môn (`#/mon`)

Thẻ mỗi môn: tên · `short` · số chương/đợt/khái niệm · thanh % thuần thục · chip phẩm hàm · nút "Vào môn". Môn chưa có khái niệm (chưa tồn tại trong `content/subjects/`) **không hiện** — không tạo thẻ rỗng. Mobile 1 cột; ≥ 768 px 2 cột.

### 4.2 Trang môn (`#/mon/:subject`) — mượn Khan Academy

```
┌ cột trái 220 (≥1280) ┬──────────────── nội dung 760 ──────────────────┐
│ Chương 1 Khái quát    │ Luật Hiến pháp                 [Cử nhân]        │
│  • Hiến pháp là gì    │ Thuần thục 40% · 4/10 khái niệm  ████░░░░░░      │
│  • Sửa đổi và bảo vệ  │ [ Ôn 3 khái niệm của môn ]  [ Học đợt tiếp → ]   │
│ Chương 2 (khoá)       │                                                 │
│                       │ Chú giải: □0 ▪1 ▪2 ▪3 ▪4 ▪5 ■6   ★ thi thử      │
│                       │                                                 │
│                       │ CHƯƠNG 1 · KHÁI QUÁT VỀ HIẾN PHÁP               │
│                       │ Hiến pháp là gì     ■ ■ ▪ ▪ □   TIẾP THEO CHO BẠN│
│                       │ Sửa đổi & bảo vệ    □ □ □ □ □                   │
└───────────────────────┴─────────────────────────────────────────────────┘
```

- **Đầu trang**: tên môn, chip phẩm hàm (`gradeFor`), `Thuần thục N%` = khái niệm bậc ≥ 5 / tổng, thanh. Hai nút: "Ôn N khái niệm của môn" (chỉ hiện khi `repo.due(now, subject)` > 0; mở `#/on/<id>` → `Review.svelte` lọc theo môn) và "Học đợt tiếp →" (đợt `current`).
- **Chú giải 7 mức** bậc 0–6, tô theo thang `--line` → `--accent` (7 nấc `color-mix`), bậc 6 = `--ok`. Tên mức dùng `LEVEL_NAMES` trong `Profile.svelte` (chuyển ra `lib/game/levels.ts` dùng chung với `LessonPanel`).
- **Mỗi đợt một hàng**: tên đợt (link `#/hoc/:subject/:lesson`), **một ô vuông 22 px mỗi khái niệm**, tô theo bậc; hover/focus hiện tooltip `term · bậc N · <tên mức>`. Đợt `current` có nền nhạt + nhãn "TIẾP THEO CHO BẠN"; đợt `locked` vẫn bấm được (giữ confirm "Thi vượt?" hiện tại). Nhóm hàng theo chương với kicker chương.
- **Cột trái (≥ 1280)**: local nav chương → đợt, `position: sticky`; bấm cuộn tới hàng. Dưới 1280: ẩn, vì trang chỉ có vài chương ở G1.
- **Rail phải (≥ 1440)**: "Ôn của môn này: N", phẩm hàm kế tiếp cần bao nhiêu khái niệm, và danh sách tối đa 5 "khái niệm khó" (`repo.difficult()` lọc theo môn).
- **Mobile**: ô 18 px, hàng cuộn ngang nếu > 8 khái niệm; chú giải thu thành một dòng.

Kỹ thuật: `routes/Subjects.svelte`, `routes/Subject.svelte`, `lib/ui/MasteryGrid.svelte` (props `lessons`, `levels`, `states`), `lib/ui/LevelLegend.svelte`. `Review.svelte` đọc `route.params.subject` (từ `#/on/:subject`, thêm vào `parseHash`) để lọc `repo.due(now, subject)`. Test: `MasteryGrid.test.ts` (số ô = số khái niệm, class theo bậc, nhãn "tiếp theo" đúng hàng), `router.test.ts` thêm `#/on/hien-phap`.

## 5. Trang Luyện đề (`#/luyen-de`) và Hồ sơ (`#/toi`)

### 5.1 Luyện đề

- Đầu trang: một đoạn 2 câu phân biệt: "Luyện đề là kiểm tra nhanh 10 câu, không ghi vào lịch ôn. Muốn nhớ lâu, học khái niệm ở Môn học." — trả lời thẳng triệu chứng "không phân biệt 2 chế độ".
- Bộ lọc chip theo nhóm (`GROUPS`), mặc định "Tất cả". Lưới thẻ đề như `.set` hiện tại (giữ chip nhóm, điểm cao nhất, số câu). ≥ 768 px 2 cột, ≥ 1280 px 3 cột trong 760 px là chật → giữ 2 cột.
- Rail phải (≥ 1440): tổng số đề đã làm / đạt 10 điểm; "đề nên làm lại" (điểm thấp nhất).
- `Quiz10.svelte` không đổi; nút "Về trang chủ" trên màn kết quả đổi thành "Về Luyện đề" + "Hôm nay".

### 5.2 Hồ sơ (gộp Cài đặt)

- Hai tab trên cùng: **Tổng quan** (`#/toi`) · **Cài đặt** (`#/cai-dat`); cùng một route component `Profile.svelte` bọc hai tab, tab bar dùng `role="tablist"`.
- Tổng quan sắp lại thành lưới 2 cột ở ≥ 768 px: trái = thẻ bậc khoa cử (triện lớn, XP, thanh) + chuỗi (7 ô tuần như rail); phải = phẩm hàm theo môn (mỗi môn 1 hàng có thanh, link sang trang môn) + biểu đồ "khái niệm theo bậc" (giữ cột hiện tại, bỏ chiều cao cứng 120 px khi mọi cột = 0 → hiện trạng thái rỗng "Chưa học khái niệm nào · Học đợt đầu tiên →"). Dữ liệu (xuất/nhập) xuống cuối, full width.
- Cài đặt giữ nguyên nội dung `Settings.svelte`, chỉ đổi vỏ.

## 6. Phiên học — chỉnh nhỏ

- Shell ẩn (§2.4). `SessionBar` thêm **tên ngữ cảnh** bên trái thanh tiến độ: "Hiến pháp là gì" (lesson) / "Ôn hôm nay" (review) / tên bộ đề (quiz), 13 px `--muted`, ẩn ở < 480 px.
- `LessonPanel` ở mobile: thay vì ẩn hẳn, hiện **dải chip ngang** dưới `SessionBar` (mỗi khái niệm = chip `term` + vòng bậc 18 px), cuộn ngang, `aria-hidden` khi màn ≥ 1024 (vì đã có cột phải). Người dùng điện thoại hiện không thấy đợt gồm gì — đây là lỗ hổng so với desktop.
- Màn kết thúc: nút chính "Về Hôm nay", nút phụ "Học đợt tiếp" (nếu có đợt kế) — thay cho "Về trang chủ" chung chung.
- Không đổi thẻ bài tập, phản hồi, âm thanh, reveal.

## 7. Token & CSS

- Thêm token: `--nav-w: 232px`, `--rail-w: 72px`, `--aside-w: 280px`, `--content-max: 760px`, `--tabbar-h: 56px`, 7 biến bậc `--lv0`…`--lv6`.
- Breakpoint chuẩn hoá: `768` (rail), `1024` (phiên học 2 cột, giữ), `1280` (sidebar đầy đủ), `1440` (rail phải). Thay ngưỡng `1024` của `.sets` bằng `768`.
- `app.css` chia theo section như hiện nay; thêm `/* ---- Shell ---- */`, `/* ---- Mastery grid ---- */`. Không thêm thư viện.
- Giữ `prefers-reduced-motion`, focus ring, tương phản AA (kiểm bằng `design:accessibility-review` trước khi phát hành).

## 8. Kiểm thử & nghiệm thu

- Unit (vitest): `router.test.ts` (route mới + cũ), `today.test.ts` (4 trạng thái + ranh giới), `lessonState.test.ts`, `MasteryGrid.test.ts`, `nav.test.ts` (4 mục, `matches` phủ hết `RouteName`).
- Ảnh chụp Playwright ở 390 / 820 / 1280 / 1440 cho Hôm nay, Môn, Luyện đề, Hồ sơ, Phiên học — bằng `npm run shots` (→ `tools/shots/`, không track) để đối chiếu trước/sau.
- Nghiệm thu với Hào theo 4 triệu chứng: mở trang chủ biết bấm gì trong 3 giây; nói được Luyện đề khác Môn học; nhìn trang môn nói được còn bao nhiêu khái niệm chưa thuần thục; ở bất kỳ trang nào chỉ được mục đang sáng.

## 9. Ngoài phạm vi

Bảng xếp hạng/đăng nhập (G2), tranh nền mới, nội dung môn mới, đổi bảng màu, landing page công khai, thay đổi engine FSRS. Khi G2 thêm "Bảng xếp hạng" chỉ cần thêm một phần tử vào `NAV` (tối đa 5 ở tab bar).

## 10. Thứ tự triển khai dự kiến (cho `writing-plans`)

1. Router + `nav.ts` + `Shell.svelte` + CSS shell (3 hình thái), `App.svelte` chuyển sang Shell/SessionShell.
2. `lessonState.ts`, `today.ts`, `Home.svelte` mới.
3. `Subjects.svelte`, `Subject.svelte`, `MasteryGrid`, `LevelLegend`, `Review` lọc theo môn.
4. `Quizzes.svelte`, chỉnh `Quiz10` nút cuối.
5. `Profile.svelte` hai tab, bọc `Settings`.
6. Chỉnh `SessionBar`, `LessonPanel` mobile, `SessionEnd`.
7. Ảnh chụp 4 kích cỡ, accessibility review, cập nhật `web/README.md` và `README.md`.
