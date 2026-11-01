# Kế hoạch triển khai — Thiết kế lại layout & điều hướng

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa web từ "một cột, không điều hướng" sang app shell 4 đích đến, trang Hôm nay theo state router, trang Môn có lưới bậc, Luyện đề tách riêng, Hồ sơ gộp Cài đặt — theo spec đã duyệt.

**Architecture:** `Shell.svelte` bọc mọi route ngoài phiên học, đổi hình thái bằng CSS theo 4 breakpoint (768 / 1024 / 1280 / 1440). Logic chọn trạng thái trang chủ và trạng thái đợt tách thành hàm thuần trong `lib/ui/*.ts` để test không cần DOM. Router thêm 4 route, giữ nguyên mọi hash cũ.

**Tech Stack:** Svelte 5 (runes), Vite 8, Vitest 5 (jsdom, Testing Library), Playwright; không thêm thư viện.

**Spec:** `docs/specs/2026-11-01-layout-redesign-design.md` (viết tắt *spec*). Đọc spec trước; plan chỉ ghi quyết định, không lặp lý do.

## Chia PR (mỗi PR < 2 giờ, tự lên web khi merge)

| PR | Nhánh | Task | Người dùng thấy gì |
|---|---|---|---|
| 1 | `feat/layout-shell` | 1–4 | Sidebar/tab bar, trang Hôm nay mới, trang Môn + Luyện đề tạm (danh sách) |
| 2 | `feat/layout-subject` | 5–7 | Trang Môn lưới bậc, Luyện đề đầy đủ, ôn theo môn |
| 3 | `feat/layout-profile-session` | 8–10 | Hồ sơ 2 tab, phiên học chỉnh nhỏ, ảnh chụp + a11y |

## Global Constraints

- Tiếng Việt có dấu trong mọi chuỗi UI, test, commit. Không thêm thư viện UI/icon; icon là ký tự (spec §2.1).
- Mọi hash cũ phải parse như cũ: `#/bo/:id`, `#/hoc/:s/:l`, `#/on`, `#/toi`, `#/cai-dat` (spec §2.1).
- Import trong app giữ `$lib/content/...`; không đổi engine, store, thẻ bài tập, bảng màu (spec §0, §9).
- Breakpoint duy nhất được dùng: 768, 1024, 1280, 1440; cột nội dung có shell tối đa 760 px; phiên học giữ 720 + 320 ở ≥ 1024 (spec §2.2, §7).
- Mỗi task: `npm run ci` xanh trước commit; UI đổi thì `npm run shots` 390 + 1280 (WORKFLOW §5).
- Tối đa 4 mục trong `NAV`; mục đang chọn có `aria-current="page"` (spec §2.1).

## Review Focus

1. Người dùng cũ có tiến độ ở IndexedDB nhưng đợt đang học đã bị xoá khỏi `subjects/*.json` → `pickHeroState` không được throw, rơi về `next`/`start` (test ở Task 3).
2. Hash cũ `#/on` (không môn) sau khi thêm `#/on/:subject` vẫn phải ôn toàn bộ (test ở Task 1 và Task 7).
3. Mobile 390 px: tab bar đáy không che nút "Đã hiểu"/"Tiếp" của phiên học — vì shell ẩn trong phiên, test e2e Task 10 kiểm `main` không có `padding-bottom` tab bar khi ở `#/hoc/...`.
4. Due = 0 nhưng mọi đợt đã xong (môn học hết) → trạng thái `next` không có đợt kế → phải thành `done` ("Bạn đã học hết môn, chờ lịch ôn") chứ không trắng (Task 3).
5. Trang Môn với môn có đợt > 8 khái niệm trên 390 px: hàng ô phải cuộn ngang, không tràn trang (test e2e Task 10 đo `scrollWidth <= clientWidth` của `main`).

---

### Task 1: Router — 4 route mới, giữ route cũ

**Files:**
- Modify: `apps/web/src/lib/router.svelte.ts`
- Modify: `apps/web/tests/ui/router.test.ts`

**Interfaces:**
- Produces: `RouteName = 'home' | 'subjects' | 'subject' | 'quizzes' | 'lesson' | 'review' | 'quiz' | 'profile' | 'settings'`; `parseHash`/`hashFor` thêm `#/mon` → `subjects`, `#/mon/:subject` → `subject {subject}`, `#/luyen-de` → `quizzes`, `#/on/:subject` → `review {subject}`; `#/on` → `review {}`.

- [ ] **Bước 1: Thêm test** vào `router.test.ts`:
```ts
it('#/mon, #/mon/<id>, #/luyen-de', () => {
  expect(parseHash('#/mon')).toEqual({ name: 'subjects', params: {} });
  expect(parseHash('#/mon/hien-phap')).toEqual({ name: 'subject', params: { subject: 'hien-phap' } });
  expect(parseHash('#/luyen-de')).toEqual({ name: 'quizzes', params: {} });
});
it('#/on/<subject> → review theo môn; #/on vẫn ôn tất cả', () => {
  expect(parseHash('#/on/hien-phap')).toEqual({ name: 'review', params: { subject: 'hien-phap' } });
  expect(parseHash('#/on')).toEqual({ name: 'review', params: {} });
});
it('hashFor đảo ngược parseHash cho route mới', () => {
  for (const h of ['#/mon', '#/mon/hien-phap', '#/luyen-de', '#/on/hien-phap']) { const r = parseHash(h); expect(hashFor(r.name, r.params)).toBe(h); }
});
```
- [ ] **Bước 2:** `npx vitest run tests/ui/router.test.ts` → FAIL (3 test mới).
- [ ] **Bước 3:** Sửa `RouteName`, `parseHash` (nhánh `mon`, `luyen-de`, `on` + `b`), `hashFor` (case `subjects`, `subject`, `quizzes`; `review` có `params.subject` → `#/on/<e(subject)>`).
- [ ] **Bước 4:** `npx vitest run tests/ui/router.test.ts` → PASS tất cả.
- [ ] **Bước 5:** Commit `feat(router): thêm #/mon, #/mon/:subject, #/luyen-de, #/on/:subject; giữ nguyên hash cũ`.

### Task 2: `nav.ts` + `Shell.svelte` + CSS shell; `App.svelte` dùng Shell

**Files:**
- Create: `apps/web/src/lib/ui/nav.ts`, `apps/web/src/lib/ui/Shell.svelte`
- Modify: `apps/web/src/App.svelte`, `apps/web/src/app.css` (thêm section `/* ---- Shell ---- */`, token §7)
- Test: `apps/web/tests/ui/nav.test.ts`, `apps/web/tests/ui/Shell.test.ts`

**Interfaces:**
- Produces: `export type NavItem = { name: 'home'|'subjects'|'quizzes'|'profile'; label: string; href: string; icon: string; matches: RouteName[] }`; `export const NAV: readonly NavItem[]` (4 mục: Hôm nay `#/` ☀ matches `['home']`; Môn học `#/mon` 📖 `['subjects','subject']`; Luyện đề `#/luyen-de` ✎ `['quizzes']`; Hồ sơ `#/toi` 👤 `['profile','settings']`); `export function activeNav(route: RouteName): NavItem['name'] | null`.
- `Shell.svelte` props: `{ active: RouteName; children: Snippet; rail?: Snippet }` — render `<nav class="sidenav">`, `<nav class="tabbar">`, `<main class="layout" id="main">`, `<aside class="rail">` (chỉ khi `rail` có). Đọc `header` (xp/streak) để vẽ khối đáy sidebar và top bar mobile.
- `App.svelte`: `inSession` (lesson/review/quiz) → render `<main class="layout" class:with-aside>` như hiện tại; ngược lại `<Shell active={route.name}>{View}</Shell>`. Header `<header class="top">` cũ **xoá**; banner lưu trữ chuyển vào trong Shell phía trên children.

- [ ] **Bước 1: Test `nav.test.ts`**:
```ts
it('đúng 4 mục, matches phủ hết RouteName ngoài phiên', () => {
  expect(NAV).toHaveLength(4);
  const covered = NAV.flatMap((n) => n.matches);
  for (const r of ['home','subjects','subject','quizzes','profile','settings']) expect(covered).toContain(r);
});
it('activeNav: subject → Môn học, settings → Hồ sơ, lesson → null', () => {
  expect(activeNav('subject')).toBe('subjects'); expect(activeNav('settings')).toBe('profile'); expect(activeNav('lesson')).toBeNull();
});
```
Test `Shell.test.ts` (Testing Library): render `Shell` với `active: 'subject'` → `getByRole('link', { name: /Môn học/ })` có `aria-current="page"` **trong `.sidenav`** và **trong `.tabbar`** (2 phần tử); link `Hôm nay` không có `aria-current`.
- [ ] **Bước 2:** chạy 2 file → FAIL.
- [ ] **Bước 3:** Viết `nav.ts`, `Shell.svelte`. CSS theo spec §2.2: `.sidenav` ẩn < 768; 768–1279 rộng `--rail-w: 72px` (icon trên, nhãn 11 px dưới); ≥ 1280 rộng `--nav-w: 232px` (icon + chữ 15 px) và có khối đáy `.sidenav .me` (🔥 `header.streak`, triện `RankBadge`); `.tabbar` chỉ < 768, `position: fixed; bottom: 0; height: var(--tabbar-h)`, `padding-bottom: env(safe-area-inset-bottom)`; `.topbar` chỉ < 768 (logo, StreakFlame, RankBadge). Lưới ≥ 768: `grid-template-columns: var(--rail-w|--nav-w) minmax(0, var(--content-max))`, ≥ 1440 thêm `var(--aside-w)` và hiện `.rail`; `justify-content: center`. Mục active: `aria-current="page"`, class `.on` nền `color-mix(in srgb, var(--accent) 14%, transparent)`. Token mới vào `:root` (spec §7). `.layout` của phiên học giữ nguyên quy tắc hiện có.
- [ ] **Bước 4:** `npx vitest run tests/ui/nav.test.ts tests/ui/Shell.test.ts` → PASS; `npm run check` 0 lỗi.
- [ ] **Bước 5:** `BASE_PATH=/Law/ npm run build && npm run shots` → xem `tools/shots/mobile-home.png` (tab bar đáy), `laptop-home.png` (sidebar chữ), `desktop-lesson.png` (không shell, vẫn 2 cột).
- [ ] **Bước 6:** Commit `feat(shell): sidebar/rail/tab bar 4 mục, ẩn trong phiên học`.

### Task 3: `lessonState.ts`, `today.ts` — logic thuần cho trang Hôm nay

**Files:**
- Create: `apps/web/src/lib/ui/lessonState.ts`, `apps/web/src/lib/ui/today.ts`
- Modify: `apps/web/src/lib/ui/SubjectPath.svelte` (dùng `lessonStates` thay logic nội bộ — giữ file đến Task 5)
- Test: `apps/web/tests/ui/lessonState.test.ts`, `apps/web/tests/ui/today.test.ts`

**Interfaces:**
- `lessonState.ts`: `export type LessonSt = 'done' | 'current' | 'locked'`; `export function lessonStates(subject: Subject, levels: Record<string, Level>): Record<string /*lessonId*/, LessonSt>` (quy tắc hiện có: done = mọi khái niệm ≥ 3; đợt chưa done đầu tiên = current; còn lại locked); `export function currentLesson(subject: Subject, levels): Lesson | null`; `export function inProgressLesson(subject, levels): Lesson | null` (có ≥ 1 khái niệm bậc 1–2 và chưa done).
- `today.ts`: `export type HeroState = { kind: 'due'; count: number; terms: string[]; minutes: number } | { kind: 'continue'; subject: Subject; lesson: Lesson; done: number; total: number } | { kind: 'next'; subject: Subject; lesson: Lesson; minutes: number } | { kind: 'start'; subject: Subject; lesson: Lesson } | { kind: 'done' }`; `export function pickHeroState(input: { due: { conceptId: string; term?: string }[]; subjects: Subject[]; levels: Record<string, Level>; dueSteps?: number }): HeroState`; `export const minutesFor = (steps: number) => Math.max(1, Math.round((steps * 25) / 60))`.

- [ ] **Bước 1: Test** — `lessonState.test.ts`: môn 2 đợt (a,b | c,d): levels `{a:3,b:3}` → `{hp-1:'done', hp-2:'current'}`; `{a:1}` → `inProgressLesson` = hp-1; `{}` → `inProgressLesson` null, `currentLesson` = hp-1. `today.test.ts` 6 case: due 12 → `{kind:'due', count:12, minutes:…}`; due 0 + `{a:2}` → `continue` với `done: 0, total: 2` (done = số khái niệm ≥ 3); due 0 + `{a:3,b:3}` → `next` lesson hp-2; không tiến độ → `start` hp-1; mọi khái niệm ≥ 3 → `done`; levels có id không còn trong môn (`{zzz:4}`) → `start`, không throw.
- [ ] **Bước 2:** chạy → FAIL.
- [ ] **Bước 3:** Viết hai file; `SubjectPath.svelte` thay `states` bằng `lessonStates(subject, levels)`.
- [ ] **Bước 4:** `npx vitest run tests/ui/lessonState.test.ts tests/ui/today.test.ts tests/ui/home-groups.test.ts` → PASS.
- [ ] **Bước 5:** Commit `feat(home): logic trạng thái đợt và thẻ Hôm nay tách thành hàm thuần`.

### Task 4: Trang Hôm nay mới + trang Môn/Luyện đề tạm; migrate điểm v1

**Files:**
- Modify: `apps/web/src/routes/Home.svelte` (viết lại), `apps/web/src/lib/store/stats.ts` (+`migrateV1Best`), `apps/web/src/App.svelte` (views thêm `subjects`, `subject`, `quizzes`)
- Create: `apps/web/src/routes/Subjects.svelte`, `apps/web/src/routes/Subject.svelte` (tạm: `<SubjectPath>`), `apps/web/src/routes/Quizzes.svelte` (tạm: lưới `.set` hiện có, nhóm theo `GROUPS`), `apps/web/src/lib/ui/HeroCard.svelte`
- Modify: `apps/web/src/app.css` (section Trang chủ: `.hero-card`, `.subject-row`), `apps/web/e2e/home-review-quiz.spec.ts` (điểm cao nhất giờ hiện ở `#/luyen-de`)
- Test: `apps/web/tests/ui/HeroCard.test.ts`

**Interfaces:**
- `HeroCard.svelte` props `{ state: HeroState }` → render theo bảng spec §3.1: kicker đúng chữ `ÔN HÔM NAY` / `TIẾP TỤC` / `ĐỢT MỚI` / `BẮT ĐẦU`; nút duy nhất class `btn primary` với nhãn `Ôn ngay →` / `Học tiếp →` / `Bắt đầu →` / `Học đợt đầu tiên →`; `kind: 'done'` → kicker `ĐÃ HỌC HẾT`, không nút primary, link "Xem môn".
- `stats.migrateV1Best(index: ContentIndex): Promise<void>` — chuyển `localStorage['best:<id>']` → `stats.setBest` một lần (logic hiện nằm trong `Home.svelte`).
- `Home.svelte`: `HeroCard` + section "Môn đang học" (hàng `.subject-row`: tên, chip `gradeFor`, thanh % bậc ≥ 5, link `hashFor('subject', {subject})`) + section "Kiểm tra nhanh" (1 thẻ `.set` + link `#/luyen-de`). Rail (≥ 1440) qua snippet `rail` của Shell: 🔥 + 7 ô tuần (ngày có `db.reviews` theo `localDay`), triện + thanh XP, "Hẹn ôn ngày mai: N" (`repo.due(ngày mai 00:00)`), dòng pháp lý. **Bỏ** `.hero` khẩu hiệu.

- [ ] **Bước 1: Test `HeroCard.test.ts`**: 5 state → đúng kicker và đúng nhãn nút; `due` hiện số `12` và tối đa 3 chip; `continue` hiện `2/5`.
- [ ] **Bước 2:** FAIL.
- [ ] **Bước 3:** Viết `HeroCard`, `Home`, 3 route tạm, `migrateV1Best`, CSS. `App.svelte` thêm 3 view. `Review.svelte`, `Lesson.svelte`, `Quiz10.svelte` chưa đổi.
- [ ] **Bước 4:** `npm run ci` xanh; cập nhật e2e `home-review-quiz.spec.ts` (điểm cao nhất kiểm ở `#/luyen-de`) rồi `PW_CHROMIUM=/opt/pw-browsers/chromium npm run e2e` → 13/13.
- [ ] **Bước 5:** `npm run shots`; đính `mobile-home.png`, `laptop-home.png`, `desktop-home.png` vào PR.
- [ ] **Bước 6:** Commit `feat(home): trang Hôm nay theo trạng thái, môn đang học, một thẻ kiểm tra nhanh`; mở **PR 1** `feat/layout-shell` theo template.

### Task 5: `MasteryGrid` + `LevelLegend` + `levels.ts`

**Files:**
- Create: `apps/web/src/lib/game/levels.ts`, `apps/web/src/lib/ui/MasteryGrid.svelte`, `apps/web/src/lib/ui/LevelLegend.svelte`
- Modify: `apps/web/src/routes/Profile.svelte`, `apps/web/src/lib/ui/LessonPanel.svelte` (dùng `LEVEL_NAMES`), `apps/web/src/app.css` (section `/* ---- Mastery grid ---- */`, 7 biến `--lv0`…`--lv6`)
- Test: `apps/web/tests/ui/MasteryGrid.test.ts`

**Interfaces:**
- `levels.ts`: `export const LEVEL_NAMES: readonly string[]` 7 phần tử `['Chưa học','Gặp','Nhận biết','Phân biệt','Điền','Tình huống','Thuần thục']`; `export const MASTERED: Level = 5`.
- `MasteryGrid.svelte` props `{ subject: Subject; levels: Record<string, Level>; terms: Record<string, string>; states: Record<string, LessonSt> }` → mỗi chương một `.chapter` kicker; mỗi đợt `<li class="lesson-row {state}">` có link tên đợt tới `hashFor('lesson')`, nhãn `TIẾP THEO CHO BẠN` khi `current`, và `<span class="cell lv{n}" title="{term} · bậc {n} · {LEVEL_NAMES[n]}" aria-label=…>` cho từng khái niệm.
- `LevelLegend.svelte` không props: 7 ô + tên.

- [ ] **Bước 1: Test**: môn 2 đợt → có 4 `.cell`; `levels {a:6}` → ô của a có class `lv6`; state `{hp-1:'current'}` → đúng 1 phần tử chứa `TIẾP THEO CHO BẠN` nằm trong hàng hp-1; `title` của ô a chứa `Thuần thục`.
- [ ] **Bước 2:** FAIL. **Bước 3:** Viết; CSS ô 22 px (18 px < 768, hàng `overflow-x: auto`), màu `--lv0 = var(--line)`, `--lv1..5` = `color-mix(in srgb, var(--accent) 25/40/55/70/85%, var(--paper))`, `--lv6 = var(--ok)`; `.lesson-row.current` nền `color-mix(accent 10%)`. **Bước 4:** PASS + `npm run check`. **Bước 5:** Commit `feat(subject): lưới ô theo bậc và chú giải 7 mức`.

### Task 6: Trang Môn đầy đủ + danh sách môn; bỏ `SubjectPath`

**Files:**
- Modify: `apps/web/src/routes/Subject.svelte`, `apps/web/src/routes/Subjects.svelte`, `apps/web/src/app.css`
- Delete: `apps/web/src/lib/ui/SubjectPath.svelte`
- Test: cập nhật `apps/web/tests/ui/home-groups.test.ts` nếu còn tham chiếu; e2e `apps/web/e2e/shell.spec.ts` thêm `'#/mon/hien-phap hiện lưới 10 ô'`.

**Interfaces:**
- `Subject.svelte`: đầu trang (tên, chip `gradeFor`, `Thuần thục N%` = bậc ≥ `MASTERED` / tổng, thanh), nút `Ôn N khái niệm của môn` → `hashFor('review', {subject})` chỉ khi `repo.due(now, subject).length > 0`, nút `Học đợt tiếp →` → `currentLesson`; `LevelLegend`; `MasteryGrid`; cột trái `.local-nav` (≥ 1280, sticky) liệt kê chương → đợt, `href="#…"` cuộn tới `id="lesson-<id>"`; rail (≥ 1440): "Ôn của môn này: N", phẩm hàm kế tiếp cần thêm bao nhiêu khái niệm (từ `GRADES`), 5 khái niệm khó (`repo.difficult()` lọc `subject`). Đợt `locked` giữ `confirm('Đợt này nằm sau đợt đang học. Thi vượt?')`.
- `Subjects.svelte`: thẻ mỗi môn trong `index.subjects` **có** `conceptCount > 0`: tên, `short`, số chương/đợt/khái niệm, thanh %, chip phẩm hàm, nút `Vào môn`; 2 cột ≥ 768.

- [ ] **Bước 1:** Thêm e2e: `#/mon/hien-phap` có `10` phần tử `.cell` và 1 nhãn `TIẾP THEO CHO BẠN`. **Bước 2:** Viết hai route, xoá `SubjectPath`, grep không còn import. **Bước 3:** `npm run ci`, e2e, `npm run shots` (thêm màn `subject` `#/mon/hien-phap` vào `SCREENS` trong `tools/screenshots.cjs`). **Bước 4:** Commit `feat(subject): trang môn với lưới bậc, local nav, ôn theo môn; danh sách môn`.

### Task 7: Luyện đề đầy đủ; Review lọc theo môn; nút cuối Quiz10

**Files:**
- Modify: `apps/web/src/routes/Quizzes.svelte`, `apps/web/src/routes/Review.svelte`, `apps/web/src/routes/Quiz10.svelte`
- Test: `apps/web/tests/ui/quizzes-filter.test.ts`; e2e `home-review-quiz.spec.ts` thêm `'#/on/hien-phap khi chưa có gì → báo rỗng và link về môn'`.

**Interfaces:**
- `Quizzes.svelte`: đoạn 2 câu đúng chữ spec §5.1; chip lọc `Tất cả` + `GROUPS` (state `group: string | null`); lưới `.set` 2 cột ≥ 768; rail: số đề đã làm / đạt điểm tối đa, "đề nên làm lại" (best thấp nhất). Hàm thuần `export function filterSets(sets, group: string | null)` trong `apps/web/src/lib/ui/groups.ts` để test.
- `Review.svelte`: `const subject = route.params.subject` → `repo.due(new Date(), subject)`; màn rỗng: có môn → link `hashFor('subject',{subject})` "Về môn", không → "Về Hôm nay".
- `Quiz10.svelte` màn kết quả: nút chính `Về Luyện đề` (`#/luyen-de`), nút phụ `Hôm nay` (`#/`).

- [ ] **Bước 1:** Test `filterSets(null)` trả tất cả, `filterSets('dan-su')` chỉ nhóm đó. **Bước 2:** Viết. **Bước 3:** `npm run ci`, e2e, shots (`quizzes` `#/luyen-de` vào `SCREENS`). **Bước 4:** Commit `feat(quizzes): trang Luyện đề có lọc nhóm; ôn theo môn; nút cuối quiz`; mở **PR 2** `feat/layout-subject`.

### Task 8: Hồ sơ hai tab (Tổng quan · Cài đặt), lưới 2 cột, trạng thái rỗng

**Files:**
- Modify: `apps/web/src/routes/Profile.svelte` (bọc tab; nội dung `Settings.svelte` render khi `route.name === 'settings'`), `apps/web/src/App.svelte` (`settings` → `Profile`), `apps/web/src/app.css`
- Create: `apps/web/src/lib/ui/WeekDots.svelte` (7 ô tuần, dùng chung với rail Hôm nay — chuyển từ Task 4 nếu đã viết inline)
- Test: `apps/web/tests/ui/Profile.test.ts`

**Interfaces:**
- Tab: `<div role="tablist">` 2 `<a role="tab" aria-selected>` tới `#/toi`, `#/cai-dat`. Tổng quan: lưới `.profile-grid` 2 cột ≥ 768 — trái: bậc khoa cử + `WeekDots`; phải: phẩm hàm theo môn (hàng có thanh, link `hashFor('subject')`) + biểu đồ bậc; khi tổng khái niệm đã học = 0 → thay biểu đồ bằng `<p class="empty">Chưa học khái niệm nào · <a href="#/">Học đợt đầu tiên →</a></p>`. Dữ liệu xuất/nhập cuối, full width.
- `WeekDots.svelte` props `{ days: boolean[] /* 7, cũ → mới */ }`.

- [ ] **Bước 1:** Test: render Profile với repo trống → có `Chưa học khái niệm nào`; tab `Cài đặt` có `aria-selected="false"` khi route `profile`. **Bước 2–4:** Viết, `npm run ci`, shots `profile`. **Bước 5:** Commit `feat(profile): hai tab Tổng quan/Cài đặt, lưới 2 cột, trạng thái rỗng`.

### Task 9: Phiên học — tên ngữ cảnh, dải chip mobile, nút kết thúc

**Files:**
- Modify: `apps/web/src/lib/ui/SessionBar.svelte` (+prop `title?: string`), `apps/web/src/lib/ui/LessonPanel.svelte` (+ `.lesson-strip` cho < 1024), `apps/web/src/lib/ui/SessionView.svelte` (truyền `title`; `onhome` → `go('home')`; nút phụ `Học đợt tiếp` khi có `onnext`), `apps/web/src/lib/ui/SessionEnd.svelte` (+prop `onnext?: () => void`), `apps/web/src/routes/Lesson.svelte` (tính đợt kế bằng `lessonStates` → truyền `onnext`), `apps/web/src/routes/Review.svelte`, `apps/web/src/routes/Quiz10.svelte` (truyền `title`), `apps/web/src/app.css`
- Test: `apps/web/tests/ui/SessionBar.test.ts`; sửa e2e `lesson.spec.ts` test "cột đợt ẩn trên điện thoại" → "cột đợt thành dải chip trên điện thoại" (`.lesson-strip` visible, `.aside` hidden ở 390; ngược lại ở 1280).

- [ ] **Bước 1:** Test SessionBar: `title: 'Hiến pháp là gì'` hiện trong `.session-bar .title`; không title → không có phần tử. **Bước 2–4:** Viết; `.title` ẩn < 480 px; `.lesson-strip` cuộn ngang, `aria-hidden` ≥ 1024; `npm run ci`; e2e. **Bước 5:** Commit `feat(session): tên ngữ cảnh, dải đợt trên điện thoại, nút Học đợt tiếp`.

### Task 10: Ảnh chụp, a11y, README; mở PR 3

**Files:**
- Modify: `tools/screenshots.cjs` (SCREENS đủ: home, subjects `#/mon`, subject, quizzes, profile, lesson, quiz), `apps/web/README.md` (routes mới), `docs/specs/2026-11-01-layout-redesign-design.md` (trạng thái → "đã triển khai"), `apps/web/e2e/shell.spec.ts`

- [ ] **Bước 1:** e2e thêm: ở 390 px `#/hoc/hien-phap/hp-1` không có `.tabbar` hiển thị và `main` `paddingBottom` nhỏ hơn `--tabbar-h` 56 px (`.layout` vốn có 32 px) (Review Focus 3); `#/mon/hien-phap` ở 390 px `document.documentElement.scrollWidth <= clientWidth` (Review Focus 5); mọi route trong `NAV` có đúng 1 `[aria-current="page"]` trong `.sidenav` ở 1280 px.
- [ ] **Bước 2:** Chạy skill `design:accessibility-review` trên 4 ảnh 1280 px + 390 px; sửa tương phản/focus nếu có.
- [ ] **Bước 3:** `npm run ci`, e2e, shots; đính ảnh 7 màn × 390/1280 vào PR.
- [ ] **Bước 4:** Commit `docs: cập nhật README/spec sau khi triển khai layout`; mở **PR 3** `feat/layout-profile-session`.

## Kết quả triển khai (01/11/2026)

Đã xong cả 10 task qua PR #9, #10 và PR 3. Sai khác so với plan (đã chấp nhận):
- Rail phải nhận nội dung qua store `rail.svelte.ts` (`setRail`) thay vì prop snippet.
- Sidebar `position: fixed` mép trái thay vì cột grid, để không nhảy vị trí giữa trang có/không rail.
- Local nav chương ở trang Môn là hàng chip (chỉ hiện khi ≥ 2 chương), không phải cột trái sticky.
- Dải đợt trên điện thoại là component riêng `LessonStrip` đặt dưới thanh phiên (chỉ trong phiên học đợt).
- Bước a11y thay bằng e2e `axe-core` (serious/critical = 0) ở 6 trang × 390/1280 px; thêm token `--accent-text` cho chữ màu son đạt AA.
- CI chỉ chạy trên pull request; dependabot gộp major, không tự bump `ts-fsrs`.
Còn hoãn: đợt `{3,0}` hiện "ĐỢT MỚI" thay vì "TIẾP TỤC" (cần sửa spec §3.1); phút ước lượng chưa trần 20 bước; thẻ kiểm tra nhanh khi mọi đề 10/10.
