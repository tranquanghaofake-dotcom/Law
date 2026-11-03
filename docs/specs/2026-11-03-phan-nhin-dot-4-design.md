# Luyện Luật — Cải thiện phần nhìn (đợt nâng cấp 4): bớt trống, bớt trùng, tìm môn bằng bìa sách

Phiên bản 0.2 · 03/11/2026 · Trạng thái: **bản nháp, chờ Hào duyệt** (chưa code).
Kế thừa: spec layout (`2026-11-01-layout-redesign-design.md`), ngôn ngữ hình khối (`2026-11-01-ngon-ngu-hinh-khoi-design.md`), thăng chức (`2026-11-02-he-thong-thang-chuc-design.md`). Không đổi engine, FSRS, nội dung luật, bảng màu token "Văn Miếu", 4 đích đến của shell, schema nội dung.

Cách soạn: Claude (Fable) chụp 32 ảnh hiện trạng và đọc code; haiku kiểm kê trùng lặp; sonnet khảo cứu bìa sách và mã nguồn mở; opus phản biện bản 0.1 — những chỗ bản 0.1 sai đã sửa và ghi ở §9.

---

## 0. Tóm tắt

Ba yêu cầu của Hào (03/11/2026): (1) layout nhiều chỗ trống, thông tin trùng lặp, sắp xếp rối mắt; (2) tab Môn học khó tìm môn khi dữ liệu nhiều, muốn thay tranh kiến trúc bằng **bìa sách luật / giáo trình**; (3) tìm thêm chỗ cải thiện.

Chẩn đoán:

1. **Thứ tự môn đang là thứ tự tên file** (`packages/content/src/build.ts` sắp `readdirSync().sort()`), không phải thứ tự học. Hệ quả nặng hơn "rối mắt": thẻ "Bắt đầu" ở Hôm nay bảo người mới học **Luật An sinh xã hội** (môn đầu bảng chữ cái), "Dân sự 2" đứng trước "Dân sự 1", và e2e trên bản live đang **đỏ** vì test vẫn chờ `hien-phap/hp-1`. Đây là lỗi phải sửa trước mọi việc trang trí.
2. **Trùng lặp thật sự chỉ một chỗ lớn**: Hôm nay liệt kê cả 23 môn khi chưa học gì (`Home.svelte` lọc `started.size === 0 || started.has(s.id)`), trùng 100 % với tab Môn học. Các chỗ khác (chức danh 2 lần/màn, chú giải bậc, dòng thống kê môn) là trùng nhỏ.
3. **Chỗ trống là do đầu trang quá cao** (≈ 250 px laptop, ≈ 430 px điện thoại) và thẻ môn quá to (≈ 335 px, 2 cột): ở 390 px mở tab Môn học **chưa thấy môn nào**; trang môn phải cuộn 660 px mới tới mục lục chương.
4. **Khó tìm môn vì 20/23 môn dùng cùng tranh cổng tam quan** và không có nhóm ngành, không có ô tìm.

Đợt này làm theo thứ tự:

| PR | Việc | Giải quyết | Ước lượng |
|---|---|---|---|
| 0 | **Vá nhanh CSS** (ẩn tranh đầu trang < 600 px, bỏ `min-height: 248px`, xoá câu mô tả sai) | 1 | 30 phút |
| 1 | **Thứ tự môn theo chương trình học** + Hôm nay hết liệt kê 23 môn + e2e live xanh lại | 1 | 1,5 giờ |
| 2 | **Bìa sách giáo trình** `BookCover` + lưới môn 3 cột, nhóm ngành, ô tìm, đầu trang gọn | 2 | 2 giờ |
| 3 | **Trang môn, Luyện đề, Hồ sơ gọn**: nút "Học tiếp", mục lục chương cuộn ngang, lọc đề theo 8 nhóm, Hồ sơ đảo thứ tự | 1, 3 | 2 giờ |
| 4 | (sau) Lấp chỗ trống có ý + tải tên khái niệm theo lô + ảnh dark | 3 | 2 phiên |

### Quyết định cần Hào chốt trước khi code

| # | Câu hỏi | Đề xuất (áp dụng nếu Hào không phản đối) |
|---|---|---|
| Q1 | Bìa môn là **giáo trình** (bìa mềm, "GIÁO TRÌNH" + tên môn rất lớn, màu đơn theo bộ môn) hay **văn bản luật** (bìa cứng, ruy băng đỏ "LUẬT")? | **Giáo trình**, vì môn = học phần. Gáy sách thưởng theo chương (`BookSpine`) giữ kiểu "văn bản luật". Hai dòng phân biệt bằng **hình dạng** (bìa trước vs gáy), **dùng chung một màu cho mỗi nhóm ngành** (sửa so với bản 0.1 — xem §3.1). |
| Q2 | Màu theo **nhóm ngành** (8 màu) hay từng môn (23 màu)? | **Theo nhóm**; trong nhóm phân biệt bằng **chữ lồng to** trên bìa ("DS 1", "TTDS", "HP") và tên đầy đủ dưới bìa. 8 màu hơi gần nhau (xanh đêm – tím than 1,5:1) nên màu **không** là dấu hiệu duy nhất. |
| Q3 | Nhóm ngành đặt ở đâu? | **Bảng tra trong app** `lib/ui/shelves.ts` (nhóm + thứ tự 23 môn), không sửa schema nội dung, không đụng 23 file JSON (tránh xung đột với nhánh `content/` Hào đang làm). Tên bảng là `SHELVES`, **không** gọi `field` vì `game/fields.ts` đã dùng tên đó cho lĩnh vực thăng chức. Chuyển vào schema khi lộ trình/đề thi cần. |
| Q4 | Hôm nay khi chưa học gì gợi ý môn nào? | Hiện **3 môn đầu theo thứ tự chương trình** (Lý luận chung → Lịch sử → Hiến pháp). **Hào cho biết đang học kỳ mấy** để đặt thứ tự `SHELVES` đúng với bản thân; thứ tự này đồng thời quyết định thẻ "Bắt đầu". |
| Q5 | Giữ tranh kiến trúc ở đầu trang Môn học/Luyện đề/Hồ sơ? | **Giữ ở ≥ 600 px nhưng thu còn dải 112 px**; ẩn ở điện thoại. Hôm nay và trang môn giữ "sân khấu". |
| Q6 | Gáy sách thưởng đổi màu theo nhóm (Hiến pháp hiện vàng, Chứng khoán xanh, Lịch sử xanh đêm "theo bìa thật")? | **Đổi theo nhóm** để một môn một màu ở mọi nơi. Mất quy ước "theo bìa thật" của 3 môn; không mất dữ liệu người dùng. Nếu Hào muốn giữ bìa thật thì bìa môn cũng dùng 3 màu đó cho 3 môn này. |

---

## 1. Chẩn đoán hiện trạng (ảnh chụp 03/11/2026, bản build từ `main`)

Ảnh: `npm run shots` → `tools/shots/` (không commit). Số đo từ ảnh 1280×800 và 390×844.

### 1.1 Trùng lặp thông tin (yêu cầu 1)

| Thông tin | Hôm nay | Môn học | Trang môn | Sidebar | Hồ sơ | Rail phải (≥ 1440) | Nhận xét |
|---|---|---|---|---|---|---|---|
| Danh sách **tất cả** môn + tiến độ | ✓ 23 hàng khi chưa học | ✓ 23 thẻ | — | — (6 gáy *chương*) | — (tủ theo *chương*) | — | **Trùng lớn duy nhất**, chỉ khi chưa có dữ liệu |
| Chương · đợt · khái niệm của môn | — | ✓ | ✓ dòng dưới h1 | — | — | — | Trang môn đã có mục lục + lưới, dòng này thừa |
| Chuỗi ngày | topbar (mobile) | — | — | ✓ đáy sidebar | ✓ thẻ lớn | ✓ `HomeRail` | 2 lần/màn ở ≥ 1440 — chấp nhận (một nhỏ, một lớn) |
| Chức danh + kế tiếp | — | — | — | ✓ đáy sidebar | ✓ `CareerPanel` | ✓ `HomeRail` | 2 lần cùng cột trái–phải ở Hôm nay 1440 |
| Chú giải 7 bậc | — | — | ✓ mỗi lần vào | — | ✓ | — | Giữ một hàng nhỏ (không popover — xem §9) |
| "6 bậc: gặp → nhận biết → …" | ✓ thẻ chính | ✓ mô tả đầu trang | — | — | — | — | Hai câu nói cùng một điều; câu ở Môn học còn **sai số** (§1.4) |
| Nút "Học đợt tiếp" | — | — | ✓ đầu trang **và** ô đợt đang mở ngay dưới | — | — | — | Nút dài 3 dòng (laptop-subject.png) |
| Khái niệm khó (≤ 5) | ✓ | — | ✓ `SubjectRail` | — | — | — | Khác phạm vi (toàn kho / một môn) — giữ |
| Quy tắc cấp sách (bậc 3/5/6) | — | — | — | — | ✓ `Profile` **và** `Bookshelf` | — | Cùng một trang, hai câu |

### 1.2 Chỗ trống (yêu cầu 1)

| Màn | Số đo | Hệ quả |
|---|---|---|
| `.page-head` (Môn học, Luyện đề, Hồ sơ) | laptop ≈ 250 px (`min-height: 248px` từ 768), chữ chiếm 50 % bề ngang; điện thoại ≈ 430 px (tranh trên chữ) | 390 px: nội dung đầu tiên ở y ≈ 470 (mobile-subjects.png) |
| `.subject-head` (trang môn) | laptop ≈ 450 px; điện thoại y ≈ 660 mới tới mục lục chương (mobile-subject.png) | Lưới bậc — thứ cần — ở dưới màn đầu |
| `.subject-card` | tranh ≈ 200 px + chữ ≈ 110 px; 2 cột ≥ 768 | 23 môn ≈ 12 hàng ≈ 4 000 px |
| Sidebar (≥ 1280) | 4 mục ≈ 250 px, trống ≈ 250 px, rồi kệ + chức danh | Khoảng trống không có vai trò |
| Phiên học (laptop) | cột phải dừng ≈ 500 px, 35 % màn trống | Chấp nhận (ít xao nhãng); chú thích "Bậc 0–6…" lặp mỗi phiên |
| Rail phải (≥ 1440) | chỉ Hôm nay, Luyện đề có | Môn học, Hồ sơ trống cột 280 px |

### 1.3 Khó tìm môn (yêu cầu 2)

- 20/23 môn → tranh mặc định `tam-quan` (`art/registry.ts`); 3 môn có tranh riêng (Hiến pháp, Chứng khoán, Lịch sử).
- Thứ tự = tên file: An sinh xã hội, Cạnh tranh, Chứng khoán, **Dân sự 2, Dân sự 1**, … Lý luận chung (môn học đầu tiên) đứng thứ 14. Không nhóm ngành, không ô tìm.
- `pickHeroState` (`ui/today.ts`) duyệt `subjects` theo đúng thứ tự này → "Bắt đầu: Luật An sinh xã hội"; khi không có đợt dở, thẻ `next` cũng nhảy về An sinh dù người dùng đang học Hiến pháp. Sidebar "Đợt đang học" (§5) nếu làm trước khi sửa sẽ chép lỗi này.
- Luyện đề: 19 nút lọc xếp 5 hàng trước đề đầu tiên; nhãn "Luật Thương mại" không nói là TM 1 hay TM 2.
- Tên môn dài ("Luật Thương mại 1 (doanh nghiệp, hợp tác xã, phá sản)") 3 dòng ở 390 px. `short` có nhưng gồm viết tắt khó hiểu với người mới ("TTDS", "SHTT", "LSNN&PL", "XD VBPL") — không dùng làm nhãn chính.
- id và tên lệch: `thuong-mai` = "Luật Thương mại 2", `thuong-mai-1` = "Thương mại 1"; `dan-su` = "Dân sự 1". **Không đổi id** (mất tiến độ lưu theo `subject`); bìa in số học phần to.

### 1.4 Chỗ khác thấy khi chụp và đọc code (yêu cầu 3)

1. Câu "Mỗi môn chia thành chương → đợt 4–5 khái niệm" ở đầu Môn học **sai với dữ liệu**: 167/242 đợt có 1–3 hoặc 6–8 khái niệm; 55 đợt chỉ 1 khái niệm. Bỏ câu (PR 0). Việc gộp đợt vụn là việc **content**, ghi issue riêng, không xử lý bằng UI.
2. Kệ sidebar hiện "0/212 sách" khi mới vào — con số doạ hơn là động viên; đổi thành "Chưa có sách · học hết 1 chương để nhận" tới khi có cuốn đầu.
3. Thẻ chuyên cần ở rail Hôm nay 1440 là ô tối nhất trang khi chưa có ý nghĩa (0 ngày).
4. Hồ sơ: tủ trưng bày ma-nơ-canh ≈ 430 px ở điện thoại đứng trước mọi số liệu; người mới chưa có gì để trưng.
5. Danh mục khái niệm: không có cách về đầu / nhảy chương, phải cuộn.
6. Trang môn gọi `loadConcepts` **từng khái niệm** chỉ để lấy tên (`Subject.svelte`): Hiến pháp = 101 fetch. Hôm nay và Môn học tải cả 23 file môn. Tủ Hồ sơ vẽ 212 SVG có gradient. Đây là chỗ nặng thật; tranh `tam-quan` chỉ ≈ 35 phần tử (path gộp), bản 0.1 đoán sai.
7. axe trong e2e báo `label-content-name-mismatch` ở `a[aria-label="Chuỗi 0 ngày"]` (chữ hiển thị chỉ là "0"). Sửa trong PR 1.
8. Ngoài phần nhìn, thấy khi đọc: `Home.svelte` đếm "hẹn ôn ngày mai" không lọc khái niệm đã xoá (`known`) trong khi dòng hôm nay có lọc; comment `HomeRail.svelte` ghi "dòng pháp lý" nhưng không render. Ghi lại, không sửa đợt này.
9. Bản tối chưa chụp; `npm run shots` chưa có lượt `colorScheme: 'dark'`. Thêm ở PR 2 vì bìa dùng màu cố định.

---

## 2. Nguyên tắc cho đợt này

1. **Thứ tự môn = thứ tự chương trình học**, khai báo một nơi (`SHELVES`), dùng cho Môn học, Hôm nay, hero, Luyện đề.
2. **Mỗi số liệu một nhà.** Tiến độ môn đầy đủ ở trang môn; nơi khác chỉ dạng rút gọn, tối đa một lần mỗi màn. Hôm nay không lặp danh sách môn.
3. **Nội dung đầu tiên trong màn đầu điện thoại** (y ≤ 300 px): Môn học thấy ≥ 1 hàng bìa, trang môn thấy mục lục chương.
4. **Tìm bằng mắt trước (màu nhóm + chữ lồng + vị trí), bằng chữ sau** (ô tìm không dấu, có cả chữ cái đầu).
5. Giữ hash, route, engine, store (**không thêm key `settings`** trong đợt này), schema, token màu. Bìa dùng màu cố định như vật thật; nền quanh bìa theo token.
6. Không thêm thư viện; SVG viết tay trong `lib/art/`; tranh `aria-hidden`, mọi chữ trên bìa có bản text thật trong DOM; `aria-label` không khác chữ hiển thị (lỗi axe §1.4.7).
7. Chuyển động: chỉ `translateY` khi hover/focus; không `rotateY`/`perspective` (23 lớp compositing trên điện thoại không có hover). Tôn trọng `prefers-reduced-motion`.

---

## 3. PR 2 — Bìa sách giáo trình và lưới môn

### 3.1 Bảng tra `lib/ui/shelves.ts` (có test)

```ts
export const SHELVES = [
  { id: 'ly-luan',  name: 'Lý luận – Lịch sử',          color: '#6B4A2B', subjects: ['ly-luan-nn-pl', 'lich-su-nn-pl'] },
  { id: 'cong-phap', name: 'Hiến pháp – Hành chính',    color: '#9E2A22', subjects: ['hien-phap', 'hanh-chinh', 'xay-dung-vbpl'] },
  { id: 'dan-su',   name: 'Dân sự – Tố tụng',           color: '#1F4E9E', subjects: ['dan-su', 'dan-su-2', 'to-tung-dan-su'] },
  { id: 'hinh-su',  name: 'Hình sự',                    color: '#1E2E5C', subjects: ['hinh-su'] },
  { id: 'kinh-te',  name: 'Thương mại – Kinh tế',       color: '#1F5F4A', subjects: ['thuong-mai-1', 'thuong-mai', 'canh-tranh', 'dau-tu', 'dat-dai', 'chung-khoan'] },
  { id: 'tai-chinh', name: 'Tài chính – Ngân hàng',     color: '#7A5A08', subjects: ['tai-chinh', 'ngan-hang', 'tai-chinh-doanh-nghiep'] },
  { id: 'lao-dong', name: 'Lao động – An sinh',         color: '#9C4418', subjects: ['lao-dong', 'lao-dong-2', 'an-sinh-xa-hoi'] },
  { id: 'so-huu-tri-tue', name: 'Sở hữu trí tuệ',       color: '#5E3A7A', subjects: ['so-huu-tri-tue', 'tai-san-tri-tue'] },
] as const;
```

- Thứ tự kệ và thứ tự trong kệ = thứ tự học (Hào chỉnh theo kỳ đang học, Q4). Môn không có trong bảng → kệ "Khác" cuối, thứ tự tên file (để môn mới thêm không biến mất).
- `orderedSubjects(index.subjects)` dùng ở Môn học, Hôm nay, `pickHeroState` (PR 1), Luyện đề.
- Màu: 8 màu trên đều **≥ 5,6:1 với kem `#F7F0DE`** và ≥ 4,4:1 với vàng `#F6D35B` (đã tính; bản 0.1 có 2 màu rớt AA: vàng đất `#B8860B` 2,9:1 và cam gạch `#C25E2A` 3,8:1 — đã thay). Trên nền tối `#0f1626` bìa xanh đêm/tím than chỉ 1,4–2:1 → **mọi bìa có mép giấy kem 3 px bên phải và dưới** (giả ruột sách) + viền 1 px `--line`, nên bìa luôn tách khỏi nền ở cả hai chế độ. Test: hàm `contrast()` nhỏ trong `tests/ui/shelves.test.ts` khẳng định ≥ 4,5 với kem cho mọi kệ.
- Đất đai, Chứng khoán xếp Kinh tế theo cách chia khoa của ĐH Luật Hà Nội; đổi chỉ cần sửa bảng.
- `shelf.ts`: `schemeFor(id)` → màu kệ của môn (Q6); bỏ `FIXED`/`CYCLE`; `BookSpine` nhận `color` thay `scheme` (gáy giữ bố cục cũ: đai vàng, ruy băng "LUẬT"). Cập nhật `tests/ui/shelf.test.ts`, `emblem.test.ts`.

### 3.2 `BookCover.svelte` (`lib/art/`)

- viewBox **120×160 (3:4)** — thấp hơn khổ thật 2:3 để 3 cột ở 390 px không quá cao; prop `title`, `monogram`, `color`, `emblem`, `percent`, `state: 'new' | 'learning' | 'done'`, `w` (mặc định 108).
- Lớp từ dưới lên: (1) mép giấy kem phải + dưới 3 px, viền `--line`; (2) thân bìa **màu phẳng** (không gradient → không id trùng; `BookSpine` hiện dùng id chung `bs-…`, nếu bản đầu nằm trong khối `display:none` thì Chrome không vẽ gradient cho bản sau — tránh); (3) chữ nhỏ in hoa "GIÁO TRÌNH" trên cùng, chữ "LUYỆN LUẬT" dưới cùng (chỗ của tên NXB — không ghi NXB thật); (4) **dải kem ngang** 1/3 trên, cao 30 %, chứa **chữ lồng to** (`monogram`, serif 800, 34 px đơn vị viewBox: "HP", "DS 1", "TTDS", "TM 2") — đây là thứ phân biệt 23 môn ở cỡ nhỏ; (5) tên môn 2 dòng, 9 px đơn vị, dưới dải, `<text>` + `<tspan>` qua `wrapTitle(title, 14)` (hàm thuần, test); không `foreignObject`; (6) huy hiệu `Emblem` 22 px trong vành trống đồng ở góc dưới; (7) khung kép mảnh vàng cách mép 5 px; (8) trạng thái: `learning` → dải lụa đỏ thò mép dưới + thanh tiến độ 2 px ở đáy; `done` → dấu son góc trên phải; `new` → không gì. Không chỉ dựa màu để báo trạng thái (có hình + chữ "x/y" dưới bìa).
- `aria-hidden` toàn SVG; thẻ `<a>` bao ngoài có tên môn **hiển thị thật** dưới bìa (2 dòng, 13 px, cắt `…`) + "x/y" nhỏ; không đặt `aria-label` khác chữ hiển thị.
- Hover/focus: `translateY(-4px)` + bóng; `focus-visible` viền accent.

### 3.3 Trang Môn học

```
[đầu trang 112 px (≥ 600) / 72 px (< 600): h1 "Môn học" 28 px · ô tìm · 8 chip nhóm cuộn ngang]   [tranh mờ bên phải, ≥ 600]
[Đang học — chỉ khi có môn bậc ≥ 1: ≤ 4 bìa, sắp theo lần học gần nhất]
[—— Lý luận – Lịch sử ——]                      ← < 768: vạch nhóm mỏng trong một lưới liền
  bìa bìa
[—— Hiến pháp – Hành chính ——]
  bìa bìa bìa
...                                             ← ≥ 768: mỗi nhóm một kệ có thanh gỗ (CSS `.shelf` có sẵn)
```

- Lưới: `repeat(auto-fill, minmax(100px, 1fr))`, gap 12 → 390 px (nội dung 358): **3 cột**, bìa ≈ 108×144 + nhãn ≈ 40 → hàng ≈ 190 px; 23 môn trong **một lưới liền** với vạch nhóm (không kệ riêng ở điện thoại, vì kệ 1–2 cuốn để trống 1–2/3 hàng — tái tạo đúng "chỗ trống"). Ước tính ≈ 9 hàng + 8 vạch ≈ 1 900 px (hiện ≈ 4 000).
- ≥ 768 (nội dung 712 px): 6 cột; kệ gỗ theo nhóm, kệ ≤ 6 cuốn vừa một hàng → 8 kệ × ≈ 230 px ≈ 1 850 px (hiện ≈ 4 000).
- Ô tìm: `fold()` của `ui/conceptSearch.ts` trên `title + short + id` **và chỉ mục chữ cái đầu** (`initials("Luật Dân sự 1") = "lds1"`, bỏ "luật" → `"ds1"`), để "ds" ra Dân sự 1, Dân sự 2, Tố tụng dân sự. Gõ → bỏ vạch/kệ, một lưới kết quả; rỗng → trạng thái "Không có môn nào khớp".
- Chip nhóm (8, màu kệ): lọc một nhóm; cuộn ngang ở điện thoại. **Không có** chọn sắp xếp, không lưu lựa chọn (tránh đụng `settings`; A–Z không cần khi đã có tìm).
- Dưới bìa: tên đầy đủ 2 dòng + "x/y". Bỏ "6 chương · 6 đợt · 12 khái niệm".

### 3.4 Dùng bìa ở nơi khác

- Hôm nay: thẻ "Môn đang học"/"Bắt đầu từ đâu" dùng bìa `w=72` thay `row-art`.
- Trang môn: bìa `w=120` góc phải đầu trang cho môn **không có tranh riêng**; 3 môn có tranh giữ tranh.
- Luyện đề (PR 3): 19 chip → 8 chip nhóm cùng màu kệ + nhãn đề ghi rõ "Thương mại 1/2".
- Kệ sidebar, tủ Hồ sơ: giữ gáy thưởng (`BookSpine`), đổi màu theo kệ (Q6).

### 3.5 Tiêu chí "xong" PR 2

- `#/mon` ở 390 px: ô tìm và ≥ 3 bìa trong màn đầu (y ≤ 300); tổng cao ≤ 2 200 px; ở 1280 ≤ 2 000 px.
- 23 môn: bìa khác nhau bằng màu nhóm + chữ lồng; không thẻ nào còn `tam-quan`.
- Gõ "ds" → Dân sự 1, Dân sự 2, Tố tụng dân sự; gõ "thuong mai" → TM 1, TM 2.
- Test: `wrapTitle`, `initials`, `orderedSubjects`, `contrast ≥ 4.5`, `schemeFor`; e2e `shell.spec.ts` sửa selector (link "Luật Hiến pháp" vẫn tồn tại vì tên đầy đủ hiển thị dưới bìa).
- Ảnh 390 + 1280, **sáng + tối** (thêm lượt dark vào `tools/screenshots.cjs`).

---

## 4. PR 1 — Thứ tự môn và Hôm nay (làm trước PR 2)

- `SHELVES` + `orderedSubjects()` (phần dữ liệu của §3.1, không có bìa) — `index.subjects` giữ nguyên, app sắp lại khi dùng.
- `pickHeroState` nhận `subjects` đã sắp; `continue`/`next` ưu tiên **môn học gần nhất** (`updatedAt` có sẵn trong `ConceptProgress`), rồi mới tới thứ tự chương trình. Test: có tiến độ Hiến pháp → hero là Hiến pháp dù An sinh đứng trước trong file.
- Hôm nay: "Môn đang học" = môn có khái niệm bậc ≥ 1, **≤ 4**, theo lần học gần nhất; chưa học → mục "Bắt đầu từ đâu?" với 3 môn đầu `SHELVES` + liên kết "Tất cả 23 môn →". Bỏ câu "Mỗi khái niệm đi qua 6 bậc…" khi đã có ≥ 1 phiên.
- Sửa `aria-label` chuỗi ngày thành chữ hiển thị ("0 ngày") → hết lỗi axe.
- e2e `home-review-quiz.spec.ts`: chờ `#/hoc/ly-luan-nn-pl/<đợt đầu>` (hoặc môn Hào chọn ở Q4); chạy `npm run e2e` local vì đổi luồng UI.
- Tiêu chí: Hôm nay khi IndexedDB trống ≤ 1 100 px cao ở 1280 (hiện ≈ 3 050); e2e live xanh.

---

## 5. PR 3 — Trang môn, Luyện đề, Hồ sơ gọn

- Trang môn: h1 32 px; dòng dưới h1 chỉ "x/y khái niệm" + thanh; **bỏ "12 chương · 22 đợt"**; nút chính "Học tiếp" + tên đợt ở dòng phụ nhỏ (hết nút 3 dòng); "Danh mục" là liên kết chữ. Mục lục chương: **dải cuộn ngang** ở < 768 (hiện 12 chip 4 hàng), thêm "3/8" nhỏ cạnh tên chương (số liệu theo chương ở đúng chỗ). Chú giải 7 bậc giữ một hàng nhỏ (e2e `shell.spec.ts` đang chờ nó hiển thị).
- Luyện đề: 8 chip nhóm thay 19; nhãn đề "Luật Thương mại 1/2"; mô tả đầu trang 1 dòng.
- Hồ sơ: thứ tự Tổng quan = số liệu (chuỗi, chức danh, số sách) → tủ trưng bày (≤ 1/2 cột ở ≥ 768); chưa có gì → "Bạn chưa có gì để trưng — học hết 1 chương để nhận sách đầu tiên" thay ma-nơ-canh trống. Gộp hai câu quy tắc cấp sách thành một.
- Sidebar: "0/212 sách" → "Chưa có sách" khi 0.
- Tiêu chí: 390 px mở `#/mon/hien-phap` thấy mục lục chương ở y ≤ 300; không số liệu môn nào xuất hiện 2 lần trong một màn.

---

## 6. PR 4 (sau, khi 0–3 đã lên web) — Lấp chỗ trống có ý, hiệu năng, dark

| Chỗ | Đề xuất | Điều kiện |
|---|---|---|
| Sidebar giữa (≥ 1280) | "Đợt đang học": môn + đợt + nút tiếp | **chỉ sau khi** `pickHeroState` đã ưu tiên môn gần nhất (PR 1) |
| Rail phải Hôm nay | thay khối "Chức danh" (đã có ở sidebar cạnh đó) bằng một dòng "Mai 12 · 7 ngày 40" | rẻ, không biểu đồ |
| Rail phải Môn học / Hồ sơ (≥ 1440) | thống kê tủ / lịch 30 ngày | ít người dùng ở 1440 → sau cùng |
| Danh mục khái niệm | thanh dính: chương hiện tại + "Về đầu" + lọc ★ | `IntersectionObserver` |
| Phiên học | chú thích "Bậc 0–6…" chỉ phiên đầu | cần cờ store → để sau |
| **Tải tên khái niệm theo lô** | content build sinh `terms` (id → tên) trong file môn hoặc `terms.json`; trang môn 1 fetch thay 101 | `packages/content/src/build.ts`, test |
| Bố cục nhảy khi tải | đặt `min-height` cho vùng nội dung thay vì skeleton | rẻ hơn |
| Thang chữ | 12 · 14 · 16 · 20 · 24 · 32 (42 chỉ ở Hôm nay) | |
| Topbar điện thoại | chip chuỗi + chức danh chiếm 45 % hàng → thu thành một chip | |

Không lấp bằng trang trí thuần tuý: mỗi khối phải trả lời một câu hỏi người học có.

---

## 7. PR 0 — Vá nhanh (30 phút, làm ngay sau khi Hào duyệt phần này)

Chỉ `app.css` và một dòng `Subjects.svelte`:
1. `@media (max-width: 599px) { .page-head .head-art, .subject-head .head-art { display: none; } }`.
2. Bỏ `min-height: 248px` của `.page-head` ở ≥ 768 (giữ cho `.stage` Hôm nay và `.subject-head`).
3. Xoá câu "Mỗi môn chia thành chương → đợt 4–5 khái niệm…".
Kết quả: 390 px thấy môn đầu tiên ngay màn đầu; laptop đầu trang ≈ 130 px. Chụp 390 + 1280 đính PR.

---

## 8. Ngoài phạm vi (ghi để không quên)

- Vẽ tranh kiến trúc riêng cho 20 môn (spec hình khối §4.3): bìa đã thay nhu cầu này ở thẻ.
- Đổi tên hiển thị bậc 6 ("Thuần thục"/"Tinh thông"): câu hỏi treo từ spec thăng chức.
- Gộp đợt 1–2 khái niệm (131/242 đợt): issue `content/`.
- Lọc `known` ở "hẹn ôn ngày mai"; comment lỗi ở `HomeRail.svelte`: issue `fix/` nhỏ.
- Đưa nhóm ngành vào schema nội dung: khi lộ trình/đề thi cần.

---

## 9. Sai khác so với bản 0.1 (sau phản biện)

| Bản 0.1 nói | Thực tế | Sửa |
|---|---|---|
| Môn sắp A–Z theo `title` | theo **tên file** (`build.ts`), kéo theo hero sai và e2e live đỏ | thêm PR 1, ưu tiên cao nhất |
| Thêm trường `field` vào schema, test `fieldOf` | `game/fields.ts` đã có `Field`/`fieldOf`; sửa 23 JSON dễ xung đột | bảng `SHELVES` trong app, không đụng schema |
| 8 màu "đều ≥ 4,5:1" | 2 màu rớt (2,9 và 3,8); bìa tối chìm vào nền tối | đổi 2 màu, thêm mép giấy + viền |
| Bìa màu khác gáy để "phân biệt hai dòng sách" | cùng môn hai màu ở hai nơi; `BookSpine` dùng đúng mã màu bìa Dân sự/Hình sự | một màu/nhóm cho cả bìa lẫn gáy; phân biệt bằng hình dạng |
| 2 cột ở 390, ≤ 2 200 px | 2 cột `minmax(132)` ≈ 4 000 px; kệ 1 cuốn tạo chỗ trống | 3 cột, lưới liền có vạch nhóm ở < 768 |
| Nhãn dưới bìa dùng `short` | "TTDS", "LSNN&PL" khó hiểu | tên đầy đủ 2 dòng; `short` chỉ gợi chữ lồng |
| Tìm "ds" ra Dân sự | `fold()` chỉ so chuỗi con | thêm chỉ mục chữ cái đầu |
| "Danh sách môn ở 4 nơi" | sidebar/Hồ sơ là sách theo *chương* | ma trận §1.1 sửa lại |
| `tam-quan` ~400 phần tử gây giật | ≈ 35; nặng thật là 101 fetch tên khái niệm | mục hiệu năng ở PR 4 |
| `rotateY` + `perspective` khi hover | 23 lớp compositing, điện thoại không hover | chỉ `translateY` |
| Lưu sắp xếp, cờ chú giải, cờ phiên đầu vào `settings` | là thay đổi store, vỡ e2e chú giải | bỏ khỏi đợt này |
| 3:4 "giống 16×24" | 16×24 là 2:3 | giữ 3:4 vì đỡ cao, sửa lý do |
