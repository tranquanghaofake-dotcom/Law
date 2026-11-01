# G1a — Khung web Luyện Luật mới: kế hoạch triển khai

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay web trắc nghiệm tĩnh hiện tại bằng ứng dụng Svelte học khái niệm theo 6 bậc ghi nhớ với lịch ôn FSRS, lưu tiến độ cục bộ, có phản hồi âm thanh/hiệu ứng, chạy được trên điện thoại và desktop, kèm 1 chương mẫu Luật Hiến pháp.

**Architecture:** Ứng dụng tĩnh (Vite + Svelte 5 + TypeScript) build ra `web/dist`, deploy Cloudflare Pages. Nội dung là JSON trong `web/content/` được kiểm tra bằng schema (zod) lúc build. Engine thuần TypeScript (bậc 0–6, FSRS, ghép phiên, chấm điểm) tách khỏi UI và được test bằng Vitest; tiến độ lưu IndexedDB qua Dexie; UI là các component thẻ độc lập phát sự kiện `answer`; lớp hiệu ứng (SFX, confetti, nền lộ dần, TTS) là module riêng, tắt được.

**Tech Stack:** Vite 7, Svelte 5 (runes), TypeScript 5, `ts-fsrs` **5.4.2** (Node ở môi trường là 22; v6 đòi Node ≥ 24), `dexie` 4, `zod` 4, `howler` 2, `canvas-confetti` 1.9, `vite-plugin-pwa` 2, Vitest 5 + `@testing-library/svelte` + `fake-indexeddb`, Playwright (đã cài sẵn trong môi trường; dùng `executablePath` mặc định).

**Spec:** `docs/superpowers/specs/2026-11-01-luyen-luat-web-design.md` (mục 2, 3.3, 4, 5, 6, 7.1–7.3).

## Global Constraints

- Node 22; `ts-fsrs@5.4.2`, không dùng v6.
- Mọi giấy phép phải là MIT/Apache-2.0/CC0/Lottie Simple; không AGPL.
- Mọi chữ hiển thị là tiếng Việt có dấu; thuật ngữ kỹ thuật giữ tiếng Anh.
- Không xóa file cũ: web v1 chuyển sang `archive/web-v1/`.
- Dữ liệu người học chỉ ở trình duyệt (IndexedDB), không gọi mạng ngoài nội dung tĩnh.
- Bậc ghi nhớ 0–6; đúng → +1 (tối đa 6), sai → −1 (tối thiểu 0). Rating FSRS: sai = Again; đúng và `elapsedMs > 12000` = Hard; đúng = Good; đúng, `elapsedMs < 4000` và bậc ≥ 3 = Easy. Retention mặc định 0,9.
- XP: 10/câu đúng; nhân 1,5 từ combo 5; nhân 2 từ combo 10; +20 hoàn thành phiên; +50 hoàn thành đợt lần đầu; sai không trừ.
- Bậc khoa cử (XP): Thí sinh 0, Tú tài 300, Cử nhân 1.000, Tiến sĩ 3.000, Hoàng giáp 7.000, Thám hoa 15.000, Bảng nhãn 30.000, Trạng nguyên 60.000; mỗi bậc 3 cấp III → II → I chia đều khoảng XP.
- Phẩm theo môn: tỉ lệ khái niệm ở bậc ≥ 5: Cửu phẩm 10%, Bát 20%, Thất 30%, Lục 40%, Ngũ 50%, Tứ 60%, Tam 70%, Nhị 80%, Nhất 90%.
- Chuỗi: tính theo ngày địa phương; đủ điều kiện khi hoàn thành ≥ 1 phiên (ôn hoặc học); bùa giữ chuỗi: +1 mỗi 7 ngày liên tiếp, tối đa 2, tự dùng khi lỡ 1 ngày.
- Phím tắt trong phiên: `1`–`4` chọn phương án, `Enter` tiếp, `Space` nghe, `Escape` thoát.
- Hiệu ứng < 600 ms; tôn trọng `prefers-reduced-motion` và cài đặt tắt âm.
- Breakpoint: < 640 px một cột; ≥ 1024 px hai cột (thẻ 720 px + cột đợt 320 px); ≥ 1440 px nội dung tối đa 1100 px.

## Review Focus

1. **Tải lại trang giữa phiên** → tiến độ của các câu đã trả lời phải còn (ghi IndexedDB sau *mỗi* câu, không chờ hết phiên). Test ở Task 10.
2. **IndexedDB bị chặn** (chế độ riêng tư Safari/Firefox) → ứng dụng vẫn chạy với bộ nhớ tạm và hiện cảnh báo "tiến độ không được lưu". Test ở Task 5.
3. **Gõ tiếng Việt từ bàn phím điện thoại** sinh ký tự NFD hoặc hoa/thường khác → cloze vẫn chấm đúng (chuẩn hóa NFC, lowercase, bỏ dấu câu). Test ở Task 4.
4. **Trình duyệt không có giọng vi-VN** → nút nghe bị ẩn, không lỗi. Test ở Task 9.
5. **Học qua nửa đêm** → chuỗi tính theo ngày địa phương, không theo UTC; phiên kết thúc lúc 00:05 tính cho ngày mới. Test ở Task 6.

---

## Cấu trúc file

```
web/
  package.json, vite.config.ts, svelte.config.js, tsconfig.json, vitest.config.ts, playwright.config.ts
  index.html
  src/
    main.ts, App.svelte, app.css (token màu/chữ, breakpoint)
    lib/router.ts                    hash router nhỏ, giữ #/bo/<id>
    lib/content/{types.ts, schema.ts, loader.ts}
    lib/engine/{progress.ts, fsrs.ts, session.ts, grading.ts}
    lib/store/{db.ts, progress-repo.ts, settings.ts}
    lib/game/{xp.ts, rank.ts, streak.ts}
    lib/fx/{sfx.ts, confetti.ts, reveal.ts, tts.ts, haptics.ts}
    lib/ui/cards/{CardIntro,CardMcq,CardPair,CardCloze,CardCase,CardRecall,CardTrueFalse}.svelte
    lib/ui/{Feedback.svelte, LessonPanel.svelte, SessionBar.svelte, RankBadge.svelte, StreakFlame.svelte}
    routes/{Home,Lesson,Review,Quiz10,Profile,Settings}.svelte
  content/
    subjects/hien-phap.json
    concepts/hien-phap/*.json
    sets/*.json                      5 bộ 10 câu cũ (chuyển từ web/data/sets)
    index.json                       sinh bởi scripts/build-content.ts, không sửa tay
  scripts/build-content.ts
  static/sfx/*.ogg, static/art/*.webp, static/icons/*
  tests/ (vitest) ; e2e/ (playwright)
archive/web-v1/                      index.html, assets/, build_catalog.py, README.md cũ
```

---

### Task 1: Scaffold dự án và di dời web v1

**Files:**
- Create: `web/package.json`, `web/vite.config.ts`, `web/svelte.config.js`, `web/tsconfig.json`, `web/vitest.config.ts`, `web/index.html`, `web/src/main.ts`, `web/src/App.svelte`, `web/src/app.css`, `web/.gitignore`
- Move: `web/index.html`, `web/assets/`, `web/build_catalog.py`, `web/README.md` → `archive/web-v1/`; `web/data/sets/*.json` → `web/content/sets/`; `web/data/catalog.json` → `archive/web-v1/data/catalog.json`
- Test: `web/tests/smoke.test.ts`

**Interfaces:**
- Produces: lệnh `npm run dev | build | test | test:e2e | content`; alias `$lib` → `src/lib`; CSS token trong `app.css`: `--ink --paper --card --muted --line --accent --ok --bad --seal` (son đỏ) và `--font-ui` (Be Vietnam Pro), `--font-quote` (Noto Serif) nạp từ Google Fonts như v1.

- [ ] **Step 1:** `git mv` các file v1 sang `archive/web-v1/` (giữ `web/content/sets/`), ghi 1 dòng vào `archive/README.md`.
- [ ] **Step 2:** Tạo dự án trong `web/`: `npm create vite@latest . -- --template svelte-ts` (hoặc viết tay các file config), thêm dependency: `svelte@^5.57 vite@^8 typescript ts-fsrs@5.4.2 dexie@^4.4 zod@^4 howler@^2.2 canvas-confetti@^1.9 vite-plugin-pwa@^2`; dev: `vitest@^5 @testing-library/svelte jsdom fake-indexeddb @types/howler @types/canvas-confetti tsx`.
- [ ] **Step 3:** Viết `tests/smoke.test.ts`: `expect(1 + 1).toBe(2)` và import `App.svelte` render ra chữ "Luyện Luật".
- [ ] **Step 4:** Chạy `npm test` → PASS; `npm run build` → có `web/dist/index.html`.
- [ ] **Step 5:** Commit: `feat(web): scaffold Vite + Svelte 5 + TS, di dời web v1 sang archive`.

---

### Task 2: Schema nội dung và script kiểm tra

**Files:**
- Create: `web/src/lib/content/types.ts`, `web/src/lib/content/schema.ts`, `web/src/lib/content/loader.ts`, `web/scripts/build-content.ts`
- Test: `web/tests/content/schema.test.ts`, `web/tests/content/build.test.ts`

**Interfaces:**
- Produces (`types.ts`):
  ```ts
  export type Source = { kind: 'statute' | 'textbook' | 'primary'; cite: string; url?: string };
  export type ItemMcq = { type: 'mcq' | 'case'; level: 1 | 4; q: string; options: string[]; answer: number; explain: string; source?: Source };
  export type ItemPair = { type: 'pair'; level: 2; left: string; right: string; cases: { text: string; answer: 'left' | 'right' }[]; explain: string };
  export type ItemCloze = { type: 'cloze'; level: 3; text: string; synonyms?: Record<string, string[]>; bank_extra?: string[]; source?: Source };
  export type ItemRecall = { type: 'recall'; level: 5; q: string; model: string; keywords: string[] };
  export type ItemTrueFalse = { type: 'truefalse'; level: 4; statement: string; answer: boolean; explain: string; source?: Source };
  export type Item = ItemMcq | ItemPair | ItemCloze | ItemRecall | ItemTrueFalse;
  export type Concept = { id: string; subject: string; chapter: string; term: string; definition: string; plain: string; example: string; source: Source; checked: string; confusables: string[]; keywords: string[]; items: Item[] };
  export type Lesson = { id: string; title: string; concepts: string[] };
  export type Chapter = { id: string; title: string; lessons: Lesson[] };
  export type Subject = { id: string; title: string; short: string; chapters: Chapter[] };
  export type QuizSet = { id: string; group: string; title: string; subtitle: string; updated: string; questions: (ItemMcq & { concept?: string })[] };
  export type ContentIndex = { subjects: Pick<Subject,'id'|'title'|'short'>[]; conceptCount: Record<string, number>; sets: Omit<QuizSet,'questions'>[] & { count: number }[] };
  ```
- Produces (`schema.ts`): `conceptSchema`, `subjectSchema`, `quizSetSchema` (zod) với quy tắc: `options` đúng 4 phần tử khác nhau, `answer` 0–3; cloze có ≥ 1 và ≤ 3 `{{...}}`; `pair.cases` ≥ 2; `recall.keywords` 3–5; `concept.items` phải có ít nhất 1 item mỗi level 1, 3 và (4 hoặc truefalse); `checked` dạng `YYYY-MM-DD`.
- Produces (`loader.ts`): `loadIndex(): Promise<ContentIndex>`, `loadSubject(id): Promise<Subject>`, `loadConcepts(subjectId, ids: string[]): Promise<Concept[]>`, `loadSet(id): Promise<QuizSet>`; fetch từ `/content/...` với `cache: 'no-cache'`.
- Produces (`scripts/build-content.ts`): chạy `npx tsx scripts/build-content.ts` → kiểm tra mọi JSON, in lỗi theo file (tiếng Việt), **exit 1 nếu có lỗi**, ghi `content/index.json`; kiểm tra thêm: mọi `lesson.concepts` phải tồn tại file, `confusables` phải là id có thật.

- [ ] **Step 1:** Viết test schema: concept hợp lệ pass; mcq 3 phương án fail với message chứa "4 phương án"; cloze không có `{{` fail; `checked: "31/10/2026"` fail.
- [ ] **Step 2:** Chạy → FAIL (chưa có module).
- [ ] **Step 3:** Viết `types.ts`, `schema.ts`.
- [ ] **Step 4:** Chạy → PASS.
- [ ] **Step 5:** Viết test build: thư mục tạm có 1 subject + 2 concept hợp lệ + 1 set cũ → `index.json` có `subjects.length === 1`, `sets.length === 1`; thêm concept lỗi → tiến trình trả 1.
- [ ] **Step 6:** Viết `build-content.ts` (hàm `buildContent(root: string): { errors: string[]; index: ContentIndex }` export để test, phần `main` chỉ gọi và `process.exit`). Thêm script `"content": "tsx scripts/build-content.ts"` và chạy nó trước `build` (`"prebuild"`).
- [ ] **Step 7:** Chạy test → PASS; chạy `npm run content` trên 5 bộ cũ → "5 bộ, 0 khái niệm".
- [ ] **Step 8:** Commit: `feat(content): schema zod, loader và script kiểm tra nội dung`.

---

### Task 3: Engine bậc ghi nhớ, FSRS và ghép phiên

**Files:**
- Create: `web/src/lib/engine/progress.ts`, `web/src/lib/engine/fsrs.ts`, `web/src/lib/engine/session.ts`
- Test: `web/tests/engine/progress.test.ts`, `web/tests/engine/fsrs.test.ts`, `web/tests/engine/session.test.ts`

**Interfaces:**
- Produces (`progress.ts`): `export type Level = 0|1|2|3|4|5|6; export function nextLevel(level: Level, correct: boolean): Level;`
- Produces (`fsrs.ts`): `export type MemoryCard = Card` (từ ts-fsrs); `export function newCard(now: Date): MemoryCard`; `export function ratingFor(correct: boolean, elapsedMs: number, level: Level): Rating`; `export function review(card: MemoryCard, rating: Rating, now: Date, retention = 0.9): { card: MemoryCard; log: ReviewLog }`; `export function isDue(card: MemoryCard, now: Date): boolean`.
- Produces (`session.ts`):
  ```ts
  export type Pass = 1 | 2 | 3;
  export type Step = { conceptId: string; item: Item | { type: 'intro' }; level: Level };
  export function passFor(levels: Record<string, Level>): Pass;          // min bậc trong đợt: 0 → 1; 1–2 → 2; ≥3 → 3
  export function buildLearnSession(concepts: Concept[], levels: Record<string, Level>, rng: () => number): Step[];
  export function buildReviewSession(concepts: Concept[], levels: Record<string, Level>, rng: () => number, max = 20): Step[];
  export function pickItem(concept: Concept, level: Level, rng: () => number): Item;  // bậc 6 → ngẫu nhiên 1–5; thiếu loại → bậc gần nhất thấp hơn
  ```
  Pass 1 = intro + bậc 1 cho mọi khái niệm, xen kẽ theo khối 2–3 khái niệm; pass 2 = bậc 2 rồi 3; pass 3 = bậc 4 rồi 5. Thứ tự khái niệm trong mỗi bậc được xáo bằng `rng`.

- [ ] **Step 1:** Test `nextLevel`: (0,true)=1, (6,true)=6, (0,false)=0, (3,false)=2.
- [ ] **Step 2:** Chạy → FAIL. Viết `progress.ts`. Chạy → PASS.
- [ ] **Step 3:** Test `ratingFor`: (false,*,*)=Again; (true,13000,1)=Hard; (true,3000,2)=Good; (true,3000,3)=Easy. Test `review`: sau Good từ thẻ mới, `card.due > now`; `isDue(card, now)` false, `isDue(card, now + 30 ngày)` true.
- [ ] **Step 4:** Chạy → FAIL. Viết `fsrs.ts` dùng `fsrs(generatorParameters({ request_retention: retention }))`. Chạy → PASS.
- [ ] **Step 5:** Test session với 5 khái niệm giả (mỗi khái niệm đủ item các bậc), `rng` cố định: pass 1 có đúng 5 intro + 5 bậc-1 và mỗi intro đứng trước bậc-1 của chính nó; pass 2 có 10 bước (5 bậc 2, 5 bậc 3), bậc 2 xong hết rồi mới tới bậc 3; `buildReviewSession` với 25 khái niệm trả về 20; `pickItem` ở bậc 6 trả về item có level 1–5.
- [ ] **Step 6:** Chạy → FAIL. Viết `session.ts`. Chạy → PASS.
- [ ] **Step 7:** Commit: `feat(engine): bậc ghi nhớ, FSRS wrapper, ghép phiên học/ôn`.

---

### Task 4: Chấm điểm cloze và câu mở

**Files:**
- Create: `web/src/lib/engine/grading.ts`
- Test: `web/tests/engine/grading.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export function normalize(s: string): string;   // NFC, toLowerCase, bỏ dấu câu, gộp khoảng trắng, trim
  export function parseCloze(text: string): { parts: string[]; blanks: string[] };  // "A {{b}} c" → parts ["A ", " c"], blanks ["b"]
  export function gradeCloze(blanks: string[], answers: string[], synonyms?: Record<string, string[]>): { correct: boolean; perBlank: boolean[] };
  export function buildBank(blanks: string[], extra: string[], rng: () => number): string[];   // xáo, không trùng
  export function gradeRecall(text: string, keywords: string[]): { hits: string[]; missing: string[]; score: number }; // score = hits/keywords
  ```

- [ ] **Step 1:** Test: `normalize("Tài  sản, ")` = `"tài sản"`; chuỗi NFD `"tài sản"` normalize bằng `"tài sản"`; `gradeCloze(["quyền tài sản"], ["Quyền tài sản."])` correct; synonyms `{ "tiền": ["tiền tệ"] }` chấp nhận "tiền tệ"; `gradeRecall("...quyền tài sản trị giá được bằng tiền...", ["quyền tài sản","trị giá được bằng tiền","Điều 115"]).missing` = `["Điều 115"]`; `parseCloze` với 2 chỗ trống.
- [ ] **Step 2:** Chạy → FAIL. Viết `grading.ts`. Chạy → PASS.
- [ ] **Step 3:** Commit: `feat(engine): chấm cloze và câu mở, chuẩn hóa tiếng Việt`.

---

### Task 5: Lưu trữ IndexedDB và cài đặt

**Files:**
- Create: `web/src/lib/store/db.ts`, `web/src/lib/store/progress-repo.ts`, `web/src/lib/store/settings.ts`
- Test: `web/tests/store/progress-repo.test.ts` (dùng `fake-indexeddb/auto`)

**Interfaces:**
- Produces (`db.ts`): Dexie `LuyenLuatDB` v1 với bảng `concepts` (`conceptId` PK; `subject`, `level: Level`, `card: MemoryCard`, `wrongStreak: number`, `updatedAt`), `reviews` (`++id`, `conceptId`, `rating`, `level`, `elapsedMs`, `at`), `stats` (key PK: `'xp' | 'streak' | 'lessons'`, `value: any`), `settings` (key PK).
- Produces (`progress-repo.ts`):
  ```ts
  export type ConceptProgress = { conceptId: string; subject: string; level: Level; card: MemoryCard; wrongStreak: number; updatedAt: number };
  export const repo: {
    get(id: string): Promise<ConceptProgress | undefined>;
    levels(ids: string[]): Promise<Record<string, Level>>;        // thiếu → 0
    record(p: { conceptId: string; subject: string; correct: boolean; elapsedMs: number; now: Date }): Promise<ConceptProgress>; // áp dụng nextLevel + fsrs.review, ghi review log, cập nhật wrongStreak
    due(now: Date, subject?: string): Promise<ConceptProgress[]>;
    difficult(): Promise<ConceptProgress[]>;                         // wrongStreak ≥ 3
    exportAll(): Promise<string>; importAll(json: string): Promise<void>;
    available: boolean;                                              // false khi IndexedDB mở thất bại → dùng Map trong bộ nhớ
  }
  ```
- Produces (`settings.ts`): `settings` là `$state` object `{ sound: true, tts: true, reducedMotion: 'auto' | 'on' | 'off', retention: 0.9, theme: 'auto' | 'light' | 'dark' }`, nạp/ghi bảng `settings`.

- [ ] **Step 1:** Test: `record` đúng trên khái niệm mới → `level 1`, `card.due > now`, bảng `reviews` có 1 dòng; `record` sai 3 lần → `difficult()` có khái niệm đó; `levels(['a','zzz'])` → `{a: n, zzz: 0}`; `exportAll` rồi xóa DB rồi `importAll` → `get` trả lại giống cũ; giả lập `indexedDB` = undefined → `repo.available === false` và `record` vẫn trả kết quả.
- [ ] **Step 2:** Chạy → FAIL. Viết `db.ts`, `progress-repo.ts`, `settings.ts`. Chạy → PASS.
- [ ] **Step 3:** Commit: `feat(store): Dexie, kho tiến độ, cài đặt, fallback bộ nhớ`.

---

### Task 6: XP, bậc khoa cử, phẩm hàm, chuỗi

**Files:**
- Create: `web/src/lib/game/xp.ts`, `web/src/lib/game/rank.ts`, `web/src/lib/game/streak.ts`
- Test: `web/tests/game/*.test.ts`

**Interfaces:**
- Produces (`xp.ts`): `xpForAnswer(correct: boolean, combo: number): number` (combo = số đúng liên tiếp *trước* câu này); `SESSION_BONUS = 20`, `LESSON_FIRST_BONUS = 50`.
- Produces (`rank.ts`): `export const RANKS: { name: string; xp: number; icon: string }[]` (8 bậc, giá trị ở Global Constraints); `rankFor(xp: number): { rank: string; tier: 'III'|'II'|'I'; progress: number /*0–1 tới bậc kế*/; nextXp: number | null }`; `gradeFor(masteredRatio: number): string | null` (Cửu phẩm … Nhất phẩm, `null` dưới 10%).
- Produces (`streak.ts`): `export type StreakState = { count: number; lastDay: string /*YYYY-MM-DD địa phương*/; freezes: number; longest: number }`; `localDay(d: Date): string`; `applySession(s: StreakState, now: Date): { state: StreakState; event: 'same-day' | 'extended' | 'froze' | 'reset' | 'started' }`.

- [ ] **Step 1:** Test: `xpForAnswer(true,0)=10`, `(true,5)=15`, `(true,10)=20`, `(false,7)=0`; `rankFor(0)` = Thí sinh III; `rankFor(299)` = Thí sinh I; `rankFor(300)` = Tú tài III; `rankFor(60000).nextXp === null`; `gradeFor(0.05) === null`, `gradeFor(0.9)` = "Nhất phẩm".
- [ ] **Step 2:** Test chuỗi: 2 phiên cùng ngày → `same-day`, count không đổi; hôm sau → `extended`; cách 2 ngày với `freezes 1` → `froze`, count giữ, freezes 0; cách 2 ngày không bùa → `reset`, count 1; 7 ngày liên tiếp → `freezes` tăng 1, tối đa 2; phiên lúc `2026-11-02T00:05` giờ địa phương sau phiên `2026-11-01T23:50` → `extended` (dùng `localDay`, test với `Date` tạo bằng tham số năm-tháng-ngày-giờ cục bộ).
- [ ] **Step 3:** Chạy → FAIL. Viết 3 file. Chạy → PASS.
- [ ] **Step 4:** Commit: `feat(game): XP, bậc khoa cử, phẩm hàm theo môn, chuỗi ngày và bùa`.

---

### Task 7: Khung giao diện, router, token thiết kế

**Files:**
- Create: `web/src/lib/router.ts`, `web/src/App.svelte` (sửa), `web/src/app.css` (sửa), `web/src/routes/{Home,Lesson,Review,Quiz10,Profile,Settings}.svelte` (khung rỗng có tiêu đề), `web/src/lib/ui/{RankBadge,StreakFlame,SessionBar}.svelte`
- Test: `web/tests/ui/router.test.ts`, `web/e2e/shell.spec.ts`

**Interfaces:**
- Produces (`router.ts`): `route` là `$state` `{ name: 'home'|'lesson'|'review'|'quiz'|'profile'|'settings'; params: Record<string,string> }` từ hash: `#/` home, `#/hoc/<subject>/<lesson>` lesson, `#/on` review, `#/bo/<id>` quiz (giữ link v1), `#/toi` profile, `#/cai-dat` settings; `go(name, params?)`.
- Produces (`app.css`): token sáng/tối theo mẫu v1 (`:root`, `prefers-color-scheme`, `[data-theme]`), lớp `.layout` grid: 1 cột; `@media (min-width: 1024px)` → `grid-template-columns: minmax(0, 720px) 320px`, gap 32 px, căn giữa; `@media (min-width: 1440px)` → max-width 1100 px; `.reduced-motion *` tắt transition.
- Produces: `RankBadge.svelte` (`props: xp`), `StreakFlame.svelte` (`props: count`), `SessionBar.svelte` (`props: done, total, onexit`).

- [ ] **Step 1:** Test router: hash `#/bo/dat-coc` → `{name:'quiz', params:{id:'dat-coc'}}`; `#/hoc/hien-phap/hp-1` → lesson với subject, lesson; hash lạ → home.
- [ ] **Step 2:** Chạy → FAIL. Viết `router.ts`. Chạy → PASS.
- [ ] **Step 3:** Viết `app.css`, `App.svelte` (header: thương hiệu "§ Luyện Luật", `StreakFlame`, `RankBadge`; `<main class="layout">` render route), 6 route khung, 3 component nhỏ.
- [ ] **Step 4:** Playwright `shell.spec.ts`: mở `/` thấy "Luyện Luật"; đổi hash `#/cai-dat` thấy tiêu đề "Cài đặt"; viewport 390 px: `.layout` 1 cột; 1280 px: 2 cột (đo `getComputedStyle(...).gridTemplateColumns` có 2 giá trị). Chạy `npm run test:e2e` → PASS.
- [ ] **Step 5:** Commit: `feat(ui): khung giao diện, router hash, token thiết kế, layout 3 kích cỡ`.

---

### Task 8: Bảy component thẻ và bảng phản hồi

**Files:**
- Create: `web/src/lib/ui/cards/{CardIntro,CardMcq,CardPair,CardCloze,CardCase,CardRecall,CardTrueFalse}.svelte`, `web/src/lib/ui/Feedback.svelte`, `web/src/lib/ui/cards/index.ts`
- Test: `web/tests/ui/CardMcq.test.ts`, `web/tests/ui/CardCloze.test.ts`, `web/tests/ui/CardRecall.test.ts`

**Interfaces:**
- Produces: mọi thẻ nhận `props: { concept: Concept; item: Item | {type:'intro'}; rng: () => number; onanswer: (r: AnswerResult) => void }` với
  `export type AnswerResult = { correct: boolean; elapsedMs: number; chosen?: string; selfGrade?: 'dung'|'gan'|'sai' }`.
  `index.ts`: `cardFor(item): Component`. Thẻ tự đo `elapsedMs` từ lúc mount. MCQ/Case xáo phương án bằng `rng` và khóa nút sau khi chọn; nhận phím `1`–`4`. Cloze: `mode: 'bank' | 'type'` (bank khi bậc 3 lần đầu, tức `levels[concept] === 3` và chưa có review ở bậc 3 → quyết định ở Task 10; prop `mode`), nút "Kiểm tra". Recall: textarea, nút "Xem đáp án" → hiện `model`, tô `hits` trong bài viết, 3 nút tự chấm → `correct = selfGrade !== 'sai'`. TrueFalse: 2 nút Đúng/Sai (phím 1/2). Intro: định nghĩa (font quote), `plain`, `example`, nguồn, nút "Đã hiểu" → `onanswer({correct:true, elapsedMs})`.
- Produces (`Feedback.svelte`): `props: { result: AnswerResult; item; concept; onnext; onspeak? }` hiển thị "Chính xác." / "Chưa đúng. Đáp án: …", `explain`, nguồn (link `url` nếu có), khái niệm dễ nhầm khi sai (`confusables` → term), nút "Câu tiếp →" (Enter).

- [ ] **Step 1:** Test CardMcq (testing-library): render 4 nút với nhãn A–D; bấm phương án đúng → `onanswer` nhận `correct: true`; sau khi bấm, các nút `disabled`; bấm phím `2` → chọn phương án B.
- [ ] **Step 2:** Test CardCloze mode `type`: gõ "quyền tài sản" → Kiểm tra → `correct: true`; mode `bank`: hiện đủ `blanks + bank_extra` nút.
- [ ] **Step 3:** Test CardRecall: gõ đoạn chứa 2/3 từ khóa → "Xem đáp án" → 2 `<mark>` → bấm "Gần đúng" → `correct: true`, `selfGrade: 'gan'`.
- [ ] **Step 4:** Chạy → FAIL. Viết 7 thẻ + Feedback + index. Chạy → PASS.
- [ ] **Step 5:** Commit: `feat(ui): 7 loại thẻ bài tập và bảng phản hồi`.

---

### Task 9: Lớp hiệu ứng: SFX, confetti, nền lộ dần, TTS, rung

**Files:**
- Create: `web/src/lib/fx/{sfx.ts,confetti.ts,reveal.ts,tts.ts,haptics.ts}`, `web/static/sfx/` (tải Kenney Interface Sounds + UI Audio, CC0, chỉ giữ ~8 file dùng: `confirmation_001.ogg` đúng, `error_004.ogg` sai, `bong_001.ogg` lên bậc, `glass_004.ogg` combo, `select_001.ogg` chọn, `maximize_006.ogg` thăng hạng, `question_003.ogg` intro, `drop_002.ogg` thoát), `web/static/art/van-mieu-01.webp` (tranh nền đầu tiên, tạo bằng Canva connector hoặc ảnh CC0, ≤ 200 KB), `web/src/lib/ui/Reveal.svelte`
- Test: `web/tests/fx/tts.test.ts`, `web/tests/fx/reveal.test.ts`

**Interfaces:**
- Produces (`sfx.ts`): `sfx.play(name: 'correct'|'wrong'|'levelup'|'combo'|'select'|'rankup'|'intro'|'exit', opts?: { combo?: number })` — `rate = 1 + min(combo,6) * 0.04`; không phát khi `settings.sound === false`; `sfx.preload()`.
- Produces (`confetti.ts`): `burst(kind: 'small'|'levelup'|'rankup')` dùng màu `--accent`, `--seal`, vàng; bỏ qua khi reduced motion.
- Produces (`reveal.ts`): `createReveal(total: number)` → `{ revealed: number; reveal(n = 1): void; tiles: boolean[] }` ($state); `Reveal.svelte` vẽ ảnh nền chia `total` ô (grid 5×4 hoặc 5×5), ô chưa lộ phủ `--paper` 100%, lộ → chuyển mờ 500 ms.
- Produces (`tts.ts`): `tts.available: boolean` (có voice `lang` bắt đầu `vi`), `tts.speak(text: string): void`, `tts.stop()`; chọn voice ưu tiên có "Vietnam"/"HoaiMy"/"Linh"; không ném lỗi khi `speechSynthesis` không tồn tại.
- Produces (`haptics.ts`): `buzz(pattern: 'ok'|'bad'|'milestone')` bọc `navigator.vibrate` nếu có.

- [ ] **Step 1:** Test tts: giả lập `window.speechSynthesis` không có voice `vi` → `available === false`; có voice `vi-VN` → `speak("x")` gọi `speak` với `utterance.lang === 'vi-VN'`; không có `speechSynthesis` → không ném lỗi.
- [ ] **Step 2:** Test reveal: `createReveal(20)`; `reveal()` ×3 → `revealed 3`, đúng 3 `tiles` true; `reveal(100)` → tối đa 20.
- [ ] **Step 3:** Chạy → FAIL. Viết 5 module + `Reveal.svelte`; tải SFX vào `static/sfx/` kèm `static/sfx/LICENSE.txt` (CC0 Kenney). Chạy → PASS.
- [ ] **Step 4:** Commit: `feat(fx): âm thanh Kenney, confetti, nền lộ dần, TTS vi-VN, rung`.

---

### Task 10: Luồng phiên học (Lesson) và màn kết thúc

**Files:**
- Modify: `web/src/routes/Lesson.svelte`
- Create: `web/src/lib/ui/LessonPanel.svelte`, `web/src/lib/ui/SessionEnd.svelte`, `web/src/lib/engine/runner.ts`
- Test: `web/tests/engine/runner.test.ts`, `web/e2e/lesson.spec.ts`

**Interfaces:**
- Produces (`runner.ts`): máy trạng thái thuần TS, không DOM:
  ```ts
  export type RunnerState = { steps: Step[]; i: number; combo: number; xp: number; results: { conceptId: string; correct: boolean; levelBefore: Level; levelAfter: Level }[]; done: boolean };
  export function createRunner(steps: Step[], levels: Record<string, Level>): RunnerState;
  export function answer(s: RunnerState, r: AnswerResult): { state: RunnerState; levelUp: boolean; sfx: 'correct'|'wrong'; xpGained: number };
  export function next(s: RunnerState): RunnerState;
  export function summary(s: RunnerState): { correct: number; total: number; xp: number; levelUps: { conceptId: string; to: Level }[] };
  ```
  Mỗi `answer` trong `Lesson.svelte`: gọi `repo.record` **ngay** (không chờ hết phiên), `sfx.play`, `reveal.reveal()`, `confetti` khi `levelUp`, cập nhật XP vào `stats`.
- Produces (`LessonPanel.svelte`): `props: { concepts: Concept[]; levels: Record<string,Level>; current: string }` — danh sách 4–5 khái niệm, vòng tròn 6 nấc, nấc tăng có transition; ẩn dưới 1024 px (thay bằng dải chấm nhỏ trên `SessionBar`).
- Produces (`SessionEnd.svelte`): `props: { summary; streakEvent; rankBefore; rankAfter; onhome; onagain }` — danh sách khái niệm lên bậc (hoạt ảnh triện son), XP, chuỗi, thăng hạng nếu `rankAfter.rank !== rankBefore.rank` (confetti `rankup`), "Hẹn ôn: N khái niệm ngày mai".

- [ ] **Step 1:** Test runner: 3 bước, trả lời đúng-sai-đúng → `xp 20`, `combo` về 0 sau sai, `summary().correct 2`, `levelUps` có khái niệm 1 và 3.
- [ ] **Step 2:** Chạy → FAIL. Viết `runner.ts`. Chạy → PASS.
- [ ] **Step 3:** Viết `Lesson.svelte` (nạp subject + concepts theo `route.params`, `repo.levels`, `buildLearnSession`, render `cardFor`, `Feedback`, `LessonPanel`, `SessionBar`, `Reveal`; khi `done` → ghi `SESSION_BONUS`, `LESSON_FIRST_BONUS` nếu `stats.lessons` chưa có id, `applySession` chuỗi, hiện `SessionEnd`), `LessonPanel.svelte`, `SessionEnd.svelte`. Dữ liệu dùng chương mẫu của Task 12 — nếu chưa có, tạo tạm 2 khái niệm fixture trong `e2e/fixtures/` được phục vụ qua `vite` `publicDir` trong test.
- [ ] **Step 4:** Playwright `lesson.spec.ts`: vào `#/hoc/hien-phap/hp-1`; thấy thẻ intro; bấm "Đã hiểu"; trả lời 1 câu MCQ bằng phím `1`–`4` theo nội dung đúng (đọc từ fixture); thấy `.feedback`; **reload trang**, vào lại cùng đợt → `repo` (qua `page.evaluate` mở Dexie) có `level ≥ 1` cho khái niệm đã trả lời; chạy hết phiên → thấy "XP" và nút "Về trang chủ"; viewport 1280: `LessonPanel` hiển thị; 390: ẩn.
- [ ] **Step 5:** Chạy e2e → PASS. Commit: `feat(lesson): luồng phiên học, cột đợt, màn kết thúc, ghi tiến độ từng câu`.

---

### Task 11: Trang chủ, Ôn hôm nay, Luyện đề 10 câu, Hồ sơ, Cài đặt

**Files:**
- Modify: `web/src/routes/{Home,Review,Quiz10,Profile,Settings}.svelte`
- Create: `web/src/lib/ui/SubjectPath.svelte`
- Test: `web/e2e/home-review-quiz.spec.ts`

**Interfaces:**
- Home: thẻ lớn "Ôn hôm nay · N" (`repo.due`) → `#/on`; nếu N = 0: "Chưa có gì cần ôn — học mới nào"; `SubjectPath` cho mỗi subject trong `index.json`: chương → nút tròn từng đợt với trạng thái `done` (mọi khái niệm bậc ≥ 3) / `current` (đợt đầu chưa done) / `locked` (sau current; vẫn bấm được, hiện xác nhận "Thi vượt?"); mục "Luyện đề 10 câu" liệt kê `sets` theo nhóm như v1 (hiện điểm cao nhất từ `stats`).
- Review: `buildReviewSession(due)`; không có gì → về Home; kết thúc dùng `SessionEnd`.
- Quiz10: giữ hành vi v1 (10 câu, xáo phương án, kết quả, "Chia sẻ" bằng `navigator.share`/clipboard, danh sách câu sai); điểm cao nhất ghi `stats['best:'+id]`; câu có `concept` → `repo.record` như thẻ bậc 1; nhập điểm cao nhất cũ từ `localStorage['best:<id>']` nếu có (một lần).
- Profile: `rankFor(xp)`, phẩm từng môn (`gradeFor` từ `repo`), chuỗi, số khái niệm theo bậc (7 cột), nút "Xuất dữ liệu" (tải JSON) / "Nhập dữ liệu".
- Settings: 5 cài đặt trong `settings.ts`; nút "Nghe thử" ẩn khi `!tts.available`; hiện cảnh báo nếu `!repo.available`.

- [ ] **Step 1:** Playwright: Home hiện "Ôn hôm nay" và ít nhất 1 môn; vào `#/bo/dat-coc` làm hết 10 câu (chọn luôn phương án đầu) → thấy điểm dạng `n/10`; về Home thấy "điểm cao nhất"; `localStorage.setItem('best:dat-coc', 9)` trước khi tải → Home hiện 9; Settings với `speechSynthesis.getVoices` trả `[]` (page.addInitScript) → không có nút "Nghe thử".
- [ ] **Step 2:** Viết 5 route + `SubjectPath`. Chạy e2e → PASS.
- [ ] **Step 3:** Commit: `feat(routes): trang chủ, ôn hôm nay, luyện đề 10 câu, hồ sơ, cài đặt`.

---

### Task 12: Chương mẫu Luật Hiến pháp (10 khái niệm)

**Files:**
- Create: `web/content/subjects/hien-phap.json`, `web/content/concepts/hien-phap/*.json` (10 file), `web/content/SOURCES.md`
- Test: `npm run content` → 0 lỗi; `web/tests/content/hien-phap.test.ts` (mọi concept có `source.kind === 'statute'` với `url` vbpl.vn, `checked` = ngày soạn).

**Nội dung (quyết định sẵn):** Chương 1 *Khái quát về Hiến pháp*, 2 đợt:
- Đợt `hp-1` "Hiến pháp là gì": `hien-phap` (khái niệm, Điều 119), `hieu-luc-phap-ly-toi-cao` (khoản 1 Điều 119), `chu-quyen-nhan-dan` (Điều 2), `nha-nuoc-phap-quyen-xhcn` (Điều 2), `quyen-luc-nha-nuoc-thong-nhat` (phân công, phối hợp, kiểm soát — Điều 2).
- Đợt `hp-2` "Sửa đổi và bảo vệ Hiến pháp": `sua-doi-hien-phap` (Điều 120: ai đề nghị, 2/3 Quốc hội), `trung-cau-y-dan-hien-phap` (khoản 4 Điều 120), `bao-ve-hien-phap` (khoản 2 Điều 119), `dang-cong-san-lanh-dao` (Điều 4), `quyen-con-nguoi-quyen-cong-dan` (Điều 14: được công nhận, tôn trọng, bảo vệ, bảo đảm; hạn chế chỉ bằng luật).
- Mỗi khái niệm: `definition` nguyên văn điều/khoản (đã đối chiếu bản hợp nhất **sau Nghị quyết 203/2025/QH15 sửa đổi Hiến pháp 2013** trên vbpl.vn), `plain` + `example` tự viết, 2 `mcq`, 1 `pair` (với `confusables` trong cùng đợt), 2 `cloze` (1–2 chỗ trống trên định nghĩa), 1 `case` hoặc 1 `truefalse`, 1 `recall` với 3–4 từ khóa.
- `SOURCES.md`: liệt kê văn bản, link vbpl.vn, ngày đối chiếu, ghi rõ "không phải tư vấn pháp lý".

- [ ] **Step 1:** Lấy toàn văn Hiến pháp (bản hợp nhất mới nhất) từ vbpl.vn (Firecrawl) hoặc dataset `th1nhng0/vietnamese-legal-documents`; lưu bản text vào `archive/legal-content-pipeline/data/laws/hien-phap-2013-hop-nhat.txt` theo định dạng `# LAW:` đã có (để tái dùng).
- [ ] **Step 2:** Viết 10 file concept + subject + SOURCES.md. Chạy `npm run content` → "1 môn, 10 khái niệm, 5 bộ, 0 lỗi".
- [ ] **Step 3:** Viết và chạy test `hien-phap.test.ts` → PASS. Chạy toàn bộ e2e với dữ liệu thật → PASS (bỏ fixture tạm ở Task 10 nếu có).
- [ ] **Step 4:** Commit: `content(hien-phap): chương 1 Khái quát về Hiến pháp, 10 khái niệm đã đối chiếu vbpl.vn`.

---

### Task 13: PWA, truy cập, triển khai, tài liệu

**Files:**
- Modify: `web/vite.config.ts` (vite-plugin-pwa: `registerType: 'autoUpdate'`, cache `content/**`, `sfx/**`, `art/**`), `web/index.html` (meta, theme-color, manifest), `web/README.md` (mới: cách chạy, thêm khái niệm, build content, deploy Cloudflare: build command `npm run build`, root `web`, output `dist`), `README.md` gốc (link), `archive/README.md`
- Create: `web/static/icons/icon-192.png`, `icon-512.png`, `web/static/manifest.webmanifest` (hoặc do plugin sinh)
- Test: `web/e2e/a11y-keyboard.spec.ts`

- [ ] **Step 1:** Playwright: trong phiên học, `Space` gọi `speechSynthesis.speak` (stub), `Escape` hiện hộp "Thoát, giữ tiến độ?"; `page.emulateMedia({ reducedMotion: 'reduce' })` → `document.documentElement` có class `reduced-motion`; mọi nút phương án có `aria-label` chứa chữ cái A–D; tab order đi qua 4 phương án rồi tới "Câu tiếp".
- [ ] **Step 2:** Viết cấu hình PWA, icon (SVG "§" trên nền son, xuất PNG bằng Playwright screenshot hoặc Canva), README. Chạy e2e → PASS; `npm run build` → `dist/manifest.webmanifest` và `sw.js` tồn tại.
- [ ] **Step 3:** Chạy skill `design:accessibility-review` trên 3 màn (Home, Lesson, SessionEnd); sửa lỗi tương phản/focus nếu có.
- [ ] **Step 4:** Commit: `feat(pwa): manifest, service worker, phím tắt, giảm chuyển động, README triển khai`.

---

## Self-review (đã chạy)

- **Spec coverage:** 2.1–2.4 → Task 2, 3, 10, 11; 3.3 → Task 2, 12; 4 → Task 1, 5, 13; 5.1–5.2 → Task 7, 8, 10, 11 (Bảng xếp hạng là G2, không nằm trong plan này); 6 → Task 9, 10; 7.1–7.3 → Task 6, 10, 11 (cược chuỗi, thông báo, huy hiệu, vật phẩm, ảnh chia sẻ là G1c/G2, cố ý để sau). Mục 2.2 biến thể lịch sử: loại thẻ `order`/`match` **không** trong G1a (môn mẫu là Hiến pháp); `truefalse` có.
- **Type consistency:** `Level`, `Step`, `AnswerResult`, `MemoryCard`, `ConceptProgress` định nghĩa một lần (Task 3, 5, 8) và dùng đúng tên ở Task 10–11.
- **Review Focus:** 5 mục đều có test gắn ở Task 4, 5, 6, 9, 10.
- **Proportion:** plan ~330 dòng cho spec ~380 dòng; code chỉ ở chữ ký và test.
