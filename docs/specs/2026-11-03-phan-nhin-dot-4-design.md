# Luyện Luật — Cải thiện phần nhìn (đợt nâng cấp 4): bớt trống, bớt trùng, tìm môn bằng bìa sách

Phiên bản 0.1 · 03/11/2026 · Trạng thái: **bản nháp, chờ Hào duyệt** (chưa code).
Kế thừa: spec layout (`2026-11-01-layout-redesign-design.md`), ngôn ngữ hình khối (`2026-11-01-ngon-ngu-hinh-khoi-design.md`), thăng chức (`2026-11-02-he-thong-thang-chuc-design.md`). Không đổi engine, FSRS, nội dung, bảng màu "Văn Miếu", 4 đích đến của shell.

---

## 0. Tóm tắt

Ba yêu cầu của Hào (03/11/2026): (1) layout còn trống, trùng lặp, logic sắp xếp rối; (2) tab Môn học khó tìm môn khi dữ liệu nhiều, muốn thay tranh kiến trúc bằng **bìa sách luật / giáo trình**; (3) tìm thêm chỗ cải thiện.

Chẩn đoán sau khi chụp 32 ảnh (4 bề rộng × 8 màn) và đọc code: **web đang hiển thị cùng một bộ số liệu (tên môn, % thuần thục, số chương/đợt/khái niệm) ở 5 nơi**, còn thứ thực sự giúp tìm môn (nhóm ngành, màu, hình riêng) thì không có: 20/23 môn dùng chung một tranh cổng tam quan. Phần "trống" không phải thiếu nội dung mà là **đầu trang quá cao** (≈ 250 px ở laptop, ≈ 430 px ở điện thoại) và **thẻ môn quá to** (≈ 335 px/thẻ, 2 cột → 12 hàng cuộn).

Đợt này làm 4 việc, theo thứ tự ưu tiên:

| # | Việc | Giải quyết yêu cầu | Ước lượng |
|---|---|---|---|
| A | **Tủ sách giáo trình** thay lưới thẻ ở Môn học: mỗi môn một bìa sách riêng (màu theo nhóm ngành, tên môn, huy hiệu), xếp theo kệ nhóm ngành, có ô tìm + sắp xếp | 2 | 2 phiên |
| B | **Mỗi số liệu một nhà**: Hôm nay bỏ danh sách 23 môn, đầu trang hạ xuống ≤ 120 px, trang môn bỏ dòng thống kê trùng | 1 | 1 phiên |
| C | **Lấp chỗ trống có ý**: sidebar giữa, rail phải Môn học/Hồ sơ, cột phải phiên học | 1, 3 | 1 phiên |
| D | **Chi tiết nhìn**: nhịp chữ, trạng thái rỗng, dark mode, skeleton khi tải, giảm SVG lặp | 3 | 1 phiên |

### Quyết định cần Hào chốt trước khi code

| # | Câu hỏi | Đề xuất (chọn sẵn nếu Hào không phản đối) |
|---|---|---|
| Q1 | Bìa sách là **giáo trình** (bìa mềm, chữ to, dải màu ngang — kiểu giáo trình ĐH Luật Hà Nội) hay **văn bản luật** (bìa cứng, nền vàng/xanh, ruy băng đỏ — kiểu sách luật NXB Sự thật)? | **Giáo trình** cho môn học (vì môn = học phần); kiểu "văn bản luật" giữ cho gáy sách thưởng theo chương (đã có `BookSpine`). Hai dòng sách khác nhau → người dùng phân biệt được "môn" và "phần thưởng". |
| Q2 | Màu bìa theo **nhóm ngành** (8 nhóm, mỗi nhóm một màu — tìm bằng màu) hay theo **từng môn** (23 màu)? | **Theo nhóm ngành**, trong nhóm phân biệt bằng số thứ tự (Dân sự 1, 2) và huy hiệu. 23 màu không nhớ nổi; 8 màu nhớ được. |
| Q3 | Nhóm ngành đặt ở đâu: thêm trường `field` vào `subjects/*.json` (schema content) hay bảng tra trong app (`lib/ui/fields.ts`)? | **Thêm trường `field` vào schema** (tuỳ chọn, mặc định `khac`), vì nhóm ngành là thuộc tính nội dung, sau này còn dùng cho đề thi và lộ trình. Cần cập nhật 23 file JSON + test schema. |
| Q4 | Trang Hôm nay khi **chưa học gì**: hiện 3 môn gợi ý (năm 1: Lý luận, Hiến pháp, Lịch sử) hay chỉ một nút "Chọn môn"? | **3 môn gợi ý theo đề cương năm 1** + nút "Xem tất cả 23 môn". |
| Q5 | Có bỏ tranh kiến trúc ở **đầu trang** Môn học/Luyện đề/Hồ sơ không (giữ ở Hôm nay và trang môn)? | **Thu nhỏ thành dải 96 px** chứ không bỏ: tranh vẫn là nét riêng của web, nhưng không được chiếm 1/3 màn hình đầu tiên. |

---

## 1. Chẩn đoán hiện trạng (ảnh chụp 03/11/2026, bản build từ `main`)

Ảnh chụp để trong `tools/shots/` khi chạy `npm run shots`; số đo lấy từ ảnh 1280×800 (laptop) và 390×844 (điện thoại).

### 1.1 Trùng lặp thông tin (yêu cầu 1)

| Thông tin | Hôm nay | Môn học | Trang môn | Sidebar | Hồ sơ | Nhận xét |
|---|---|---|---|---|---|---|
| Danh sách **tất cả** môn + % thuần thục | ✓ (23 hàng khi chưa học) | ✓ (23 thẻ) | — | ✓ (kệ 6 ô) | ✓ (tủ nhiều tầng) | **4 nơi**; Hôm nay và Môn học gần như trùng 100 % |
| Số chương · đợt · khái niệm của môn | — | ✓ | ✓ (dòng dưới h1) | — | — | Trang môn đã có mục lục chương + lưới bậc, dòng này thừa |
| Chuỗi ngày + chức danh | topbar (mobile) | — | — | ✓ đáy sidebar | ✓ thẻ lớn | Chấp nhận được (một chỗ nhỏ, một chỗ lớn) nhưng rail phải Hôm nay lặp lần 3 |
| Chú giải 7 bậc màu | — | — | ✓ (mỗi lần vào môn) | — | ✓ | Nên thu thành nút "?" sau lần đầu |
| Mô tả "6 bậc: gặp → nhận biết → …" | ✓ thẻ chính | ✓ mô tả đầu trang | — | — | — | Hai câu khác nhau nói cùng một điều |
| Nút "Danh mục khái niệm" / "Học đợt tiếp" | — | — | ✓ đầu trang **và** nút đợt trong lưới | — | — | Nút đợt tiếp trùng với ô đợt đầu tiên đang mở ngay dưới |
| Khái niệm khó (≤ 5) | ✓ `Home` | — | ✓ `SubjectRail` | — | — | Hai danh sách khác phạm vi (toàn kho / một môn) — giữ, nhưng Hôm nay chỉ nên hiện khi có |
| Chức danh + chức danh kế tiếp | — | — | — | ✓ đáy sidebar | ✓ `CareerPanel` | ✓ `HomeRail` ở ≥ 1440 → **3 lần trong một màn** |
| Quy tắc cấp sách (bậc 3/5/6) | — | — | — | — | ✓ `Profile` **và** `Bookshelf` cùng trang | Hai câu giải thích cùng một quy tắc trên một màn |

Nguồn: `routes/Home.svelte` (`rows` lọc `started.size === 0 || started.has(s.id)` → chưa học thì hiện **mọi** môn), `routes/Subjects.svelte`, `routes/Subject.svelte`, `ui/Shell.svelte`, `ui/Bookshelf.svelte`.

### 1.2 Chỗ trống (yêu cầu 1)

| Màn | Số đo | Hệ quả |
|---|---|---|
| Đầu trang `.page-head` (Môn học, Luyện đề, Hồ sơ) | laptop cao ≈ 250 px, chữ chỉ dùng 50 % bề ngang; điện thoại ≈ 430 px (tranh xếp trên chữ) | Ở 390 px người dùng **chưa thấy môn nào** khi mở tab Môn học |
| Thẻ môn `.subject-card` | tranh 200 px + chữ 110 px ≈ 335 px; 2 cột ở ≥ 768 | 23 môn = 12 hàng ≈ 4 000 px cuộn; 20 thẻ giống hệt nhau |
| Sidebar (≥ 1280) | 4 mục chiếm 250 px, trống ≈ 250 px, rồi kệ sách + chức danh | Khoảng trống không có vai trò |
| Trang môn `.subject-head` | ≈ 450 px laptop (h1 42 px, dòng thống kê, thanh, 2 nút, tranh) | Lưới bậc — thứ người dùng cần — bắt đầu ở px 500 |
| Phiên học (laptop) | cột phải "Đợt này" dừng ở ≈ 500 px, thẻ hết ở ≈ 515 px; 35 % màn hình trống | Chấp nhận được khi học (ít xao nhãng), nhưng khối chú thích "Bậc 0–6…" lặp mỗi phiên |
| Rail phải (≥ 1440) | chỉ Hôm nay và Luyện đề có; Môn học, Hồ sơ không có | Cột 280 px trống ở hai trang |

### 1.3 Khó tìm môn (yêu cầu 2)

- 20/23 môn dùng tranh mặc định `tam-quan` (`art/registry.ts` → `artFor`), 3 môn có tranh riêng. Mắt không phân biệt được thẻ.
- Sắp xếp A–Z theo `title` (từ `index.subjects`): "Luật An sinh xã hội" đứng đầu, "Lý luận chung về Nhà nước và Pháp luật" (môn năm 1 học đầu tiên) đứng thứ 14. Không có nhóm ngành, không có năm học, không có ô tìm.
- Hàng lọc ở Luyện đề: 19 nút nhóm xếp 5 hàng; sẽ thành 25+ khi đủ môn.
- Tên môn dài ("Luật Thương mại 1 (doanh nghiệp, hợp tác xã, phá sản)") xuống 3 dòng ở 390 px; `short` trong JSON đã có nhưng chưa dùng ở thẻ.

### 1.4 Chỗ khác thấy khi chụp (yêu cầu 3)

1. Kệ sách sidebar hiện "0/212 sách" khi mới vào — con số 212 đáng sợ hơn là động viên; nên hiện "Chưa có sách · học 1 chương để nhận" cho tới khi có cuốn đầu.
2. Thẻ chuyên cần ở rail Hôm nay (1440) tối đen trên nền kem — là ô tối nhất trang trong khi chưa có ý nghĩa gì (0 ngày).
3. Hồ sơ: tủ trưng bày ma-nơ-canh ≈ 430 px cao ở điện thoại đứng trước mọi số liệu; người mới chưa có gì để trưng.
4. Danh mục khái niệm: thẻ mở có 4 kiểu chữ (serif trích luật, sans giải thích, ví dụ, nguồn) — tốt; nhưng không có đường về đầu/đi tiếp chương, phải cuộn.
5. Không có trạng thái "đang tải" có hình (chỉ chữ "Đang tải…"), nên mỗi lần đổi trang bố cục nhảy.
6. Bản tối (dark) chưa chụp trong đợt này — cần chụp kèm khi đổi bìa sách vì bìa dùng màu cố định.
7. Câu mô tả "Mỗi môn chia thành chương → đợt 4–5 khái niệm" ở đầu trang Môn học **sai với dữ liệu**: 167/242 đợt có 1–3 hoặc 6–8 khái niệm. Bỏ câu này (việc B) thay vì sửa số.
8. Ngoài phạm vi phần nhìn nhưng thấy khi đọc: `Home.svelte` đếm "hẹn ôn ngày mai" không lọc khái niệm đã xoá (`known`) trong khi dòng đếm hôm nay có lọc; comment ở `HomeRail.svelte` ghi "dòng pháp lý" nhưng không render. Ghi lại, không sửa trong đợt này.

---

## 2. Nguyên tắc cho đợt này

1. **Mỗi số liệu một nhà.** Tiến độ môn hiện đầy đủ ở *trang môn*; nơi khác chỉ hiện dạng rút gọn (thanh nhỏ hoặc %), tối đa một lần mỗi màn. Hôm nay không lặp danh sách môn.
2. **Đầu trang ≤ 120 px ở laptop, ≤ 96 px ở điện thoại** cho các trang danh sách (Môn học, Luyện đề, Hồ sơ). Tranh thành dải nền bên phải, không đẩy nội dung xuống. Trang Hôm nay và trang môn giữ "sân khấu" vì ở đó tranh là nội dung.
3. **Nội dung đầu tiên xuất hiện trong 1 màn hình điện thoại** (≤ 700 px kể cả topbar): Môn học phải thấy ≥ 1 kệ sách, trang môn phải thấy mục lục chương.
4. **Tìm bằng mắt trước, tìm bằng chữ sau**: màu nhóm ngành + hình bìa + số thứ tự, rồi mới đến ô tìm không dấu (đã có `conceptSearch.ts`, dùng lại hàm bỏ dấu).
5. Giữ nguyên hash, route, engine, store, bảng màu token. Bìa sách dùng **màu cố định như vật thật** (giống `BookSpine`), không đổi theo dark mode; nền quanh bìa vẫn theo token.
6. Không thêm thư viện; SVG viết tay trong `lib/art/`; tranh `aria-hidden`, mọi chữ trên bìa có bản text thật ở DOM.

---

## 3. Việc A — Tủ sách giáo trình (trang Môn học)

### 3.1 Dữ liệu: nhóm ngành

Thêm trường tuỳ chọn `field` vào `Subject` (`packages/content/src/schema.ts`), enum 8 giá trị + mặc định `khac`. Gán cho 23 môn hiện có:

| `field` | Tên hiện | Màu bìa (cố định) | Môn |
|---|---|---|---|
| `ly-luan` | Lý luận – Lịch sử | nâu đất `#6B4A2B` | ly-luan-nn-pl, lich-su-nn-pl |
| `hien-phap-hanh-chinh` | Hiến pháp – Hành chính | son `#9E2A22` | hien-phap, hanh-chinh, xay-dung-vbpl |
| `dan-su` | Dân sự – Tố tụng | xanh dương `#1F4E9E` | dan-su, dan-su-2, to-tung-dan-su |
| `hinh-su` | Hình sự | xanh đêm `#1E2E5C` | hinh-su |
| `kinh-te` | Thương mại – Kinh tế | xanh lục đậm `#1F5F4A` | thuong-mai-1, thuong-mai, canh-tranh, dau-tu, chung-khoan, dat-dai |
| `tai-chinh` | Tài chính – Ngân hàng | vàng đất `#B8860B` | tai-chinh, ngan-hang, tai-chinh-doanh-nghiep |
| `lao-dong` | Lao động – An sinh | cam gạch `#C25E2A` | lao-dong, lao-dong-2, an-sinh-xa-hoi |
| `so-huu-tri-tue` | Sở hữu trí tuệ | tím than `#4B3B6B` | so-huu-tri-tue, tai-san-tri-tue |

Thứ tự nhóm = thứ tự bảng (theo trình tự học trong đề cương: lý luận → công pháp → tư pháp → kinh tế). Xếp Đất đai và Chứng khoán vào Kinh tế theo cách chia khoa của ĐH Luật Hà Nội (Khoa Pháp luật Kinh tế); Hào có thể đổi bằng cách sửa `field` trong JSON, app không cần sửa.

**Lưu ý tên môn**: id và tên đang lệch nhau — `thuong-mai` là "Luật Thương mại 2", `thuong-mai-1` là "Thương mại 1"; `dan-su` là "Dân sự 1", `dan-su-2` là "Dân sự 2". Bìa in **số học phần to** (1, 2) cạnh tên để hai cuốn cùng tên không lẫn; không đổi id (đổi id làm mất tiến độ đã lưu theo `subject`). Trong nhóm: theo `order` nếu có, không thì theo `title`. Màu cần kiểm tương phản AA với chữ trắng/kem trên bìa (tất cả 8 màu trên ≥ 4.5:1 với `#F7F0DE`; kiểm lại bằng script trong test).

Cũng thêm `cover.emblem` (tuỳ chọn, tên trong `EmblemName`) để bìa có huy hiệu riêng; môn chưa có thì dùng `sach`.

### 3.1b Căn cứ khảo cứu bìa (03/11/2026)

Khảo cứu bằng tìm kiếm web **không mở được ảnh bìa** nào (trang nhà sách chặn, thư viện chỉ có mục lục); chỉ xác thực được: giáo trình Luật Hiến pháp (ĐH Luật Hà Nội) do NXB Công an nhân dân in, giáo trình Luật Thương mại do NXB Tư pháp in. Quy ước bố cục dưới đây là **hiểu biết chung + quan sát của phiên trước khi vẽ `BookSpine`**, chưa đối chiếu ảnh thật: văn bản luật thường nền đỏ đô/vàng hoặc xanh đậm, tên luật in hoa căn giữa, 1–2 dải ngang; giáo trình thường tên trường nhỏ trên cùng, chữ "GIÁO TRÌNH" + tên môn rất lớn ở giữa, màu đơn theo bộ môn. **Trước khi chốt màu, Hào mở 4–6 ảnh bìa thật (Fahasa/Tiki) và sửa bảng màu §3.1 nếu thấy lệch.** Mã nguồn mở đã xem: `mawise/bookshelf` (MIT), `petargyurov/virtual-bookshelf` (Unlicense) — chỉ lấy ý tưởng kệ/gáy; bài 3D book CSS của S. Castiel là CC BY-NC-SA → **không dùng mã**, tự viết; Open edX catalog và AnkiDroid là AGPL/GPL → chỉ nhìn bố cục. Kết luận: không dựng 3D `preserve-3d`; bìa là SVG phẳng + bóng + nghiêng nhẹ khi hover.

### 3.2 Thành phần `BookCover.svelte` (`lib/art/`)

- Tỉ lệ **3:4** (viewBox 150×200), giống giáo trình khổ 16×24. Prop: `title`, `short`, `field`, `emblem`, `percent`, `size` (`sm` 96 px rộng, `md` 132 px, `lg` 180 px).
- Lớp từ dưới lên: (1) thân bìa màu nhóm, góc 2 px, bóng nhẹ bên phải giả gáy; (2) **dải ngang kem** ở 1/3 trên cao 26 % chứa tên môn (serif `Noto Serif Display` 700, 2–3 dòng, cắt theo `short` khi `size = sm`); (3) chữ nhỏ in hoa "GIÁO TRÌNH" phía trên dải, chữ nhỏ "LUYỆN LUẬT" ở đáy (thay chỗ tên NXB — không ghi NXB thật); (4) huy hiệu trong vành trống đồng nhỏ ở 2/3 dưới; (5) khung kép mảnh màu vàng cách mép 6 px (ngôn ngữ "khung kép" đã có); (6) **dải lụa đánh dấu** đỏ thò ra mép dưới khi môn đang học; (7) lớp phủ tiến độ: thanh mảnh ở đáy bìa hoặc "góc gập" khi 100 %.
- Tên môn đặt bằng `<text>` + `<tspan>` tự ngắt theo số ký tự (hàm thuần `wrapTitle(title, maxChars)` có test), không dùng `foreignObject` (Safari vẽ lỗi khi transform).
- Bìa là trang trí: `aria-hidden`; thẻ `<a>` bao ngoài có tên môn và % trong DOM thật (sr-only hoặc dòng chữ dưới bìa).
- Hover/focus: nhấc 6 px + nghiêng `rotateY(-6deg)` với `perspective`, tắt khi `prefers-reduced-motion` (tái dùng quy tắc hiện có).

### 3.3 Bố cục trang Môn học

```
[đầu trang 96–120 px: h1 "Môn học" · ô tìm · chọn sắp xếp]        [tranh nhỏ bên phải]
[Đang học — chỉ hiện khi có môn đã bắt đầu: ≤ 4 bìa `md` + dải lụa]
[Kệ 1  Lý luận – Lịch sử ──────────── thanh gỗ]
   bìa bìa
[Kệ 2  Hiến pháp – Hành chính ──────]
   bìa bìa bìa
...
```

- Lưới bìa: `grid-template-columns: repeat(auto-fill, minmax(132px, 1fr))` → 390 px: **2 cột** (bìa ≈ 160 px rộng), 768: 4, 1280 (nội dung 760): 5. 23 môn ≈ 8 kệ, tổng cao ≈ 1 600 px ở laptop (hiện ≈ 4 000).
- Mỗi kệ: tiêu đề nhóm (kicker + hình thoi như section hiện có) + thanh gỗ dưới hàng bìa (tái dùng CSS `.shelf` thanh gỗ đang có ở sidebar).
- Dưới mỗi bìa: tên ngắn (`short`) 1 dòng + "x/y" rất nhỏ; không còn "6 chương · 6 đợt · 12 khái niệm" (số này ở trang môn).
- **Ô tìm**: lọc tức thì theo tên không dấu bằng `fold()` có sẵn trong `ui/conceptSearch.ts` (đã xử lý `đ/Đ` — NFD không tách chữ này); khớp trên `title + short + id`; khi có chữ thì bỏ chia kệ, hiện một lưới kết quả. A–Z dùng `localeCompare('vi')`.
- **Sắp xếp**: `Theo kệ` (mặc định) · `Đang học trước` · `A–Z`. Lưu lựa chọn vào `settings` (store đã có).
- Mobile: đầu trang là một hàng (h1 nhỏ 24 px + nút tìm); ô tìm mở rộng khi chạm.

### 3.4 Dùng lại bìa ở nơi khác

- Hôm nay: thẻ "Môn đang học" dùng bìa `sm` thay tranh `row-art` (bỏ 20 thẻ cổng giống nhau).
- Trang môn: bìa `lg` thay tranh kiến trúc ở `subject-head` **cho môn chưa có tranh riêng**; 3 môn có tranh (Hiến pháp, Chứng khoán, Lịch sử) giữ tranh, bìa nhỏ đặt góc.
- Luyện đề: hàng lọc 19 nút → **chọn theo nhóm ngành** (8 nút màu, cùng màu bìa) + ô tìm; thẻ đề giữ tranh nhỏ.
- Kệ sidebar và Hồ sơ **giữ gáy sách thưởng** (`BookSpine`), vì đó là phần thưởng, khác dòng sách (Q1).

### 3.5 Tiêu chí "xong" cho A

- Mở `#/mon` ở 390 px: thấy ô tìm và ≥ 2 bìa trong màn đầu; cuộn hết trang ≤ 2 200 px.
- 23 môn có bìa khác nhau (màu nhóm + tên + huy hiệu); không môn nào dùng `tam-quan` ở thẻ.
- Gõ "ds" hoặc "dan su" → hiện Dân sự 1, Dân sự 2, Tố tụng dân sự.
- Test: `wrapTitle`, `fieldOf`, sắp xếp; schema chấp nhận `field` hợp lệ, từ chối giá trị lạ; e2e: `#/mon` có `[data-field]` 8 nhóm.
- Ảnh 390 + 1280 sáng và tối đính PR.

---

## 4. Việc B — Mỗi số liệu một nhà

### 4.1 Hôm nay
- "Môn đang học" chỉ hiện **môn có khái niệm bậc ≥ 1**, tối đa 4, sắp theo lần học gần nhất (cần `lastStudied` theo môn — tính từ `repo` theo `updatedAt` của tiến độ, không thêm bảng). Chưa học gì → mục **"Bắt đầu từ đâu?"** với 3 bìa gợi ý năm 1 (Q4) + liên kết "Tất cả môn →".
- Bỏ dòng "Mỗi khái niệm đi qua 6 bậc…" ở thẻ chính khi người dùng đã có ≥ 1 phiên (giữ cho người mới).
- Rail phải (1440): bỏ khối "Chức danh" (đã có ở đáy sidebar ngay cạnh), thay bằng **"Hẹn ôn 7 ngày tới"** (biểu đồ cột nhỏ 7 ngày, dữ liệu `repo.due` theo ngày) — thông tin chưa có ở đâu.

### 4.2 Trang môn
- Đầu trang gọn: h1 32 px + thanh tiến độ + một dòng `x/y khái niệm · đợt tiếp: …`; bỏ "12 chương · 22 đợt" (mục lục ngay dưới đã cho thấy). Hai nút gộp thành một nút chính "Học tiếp" + liên kết chữ "Danh mục".
- Chú giải 7 bậc: thu thành nút "?" mở popover; mặc định hiện lần đầu vào môn (cờ trong `settings`).
- Mục lục chương: giữ, thêm số khái niệm đã đạt mỗi chương dạng "3/8" nhỏ cạnh tên — đây là nơi đúng để hiện số liệu theo chương.

### 4.3 Đầu trang Môn học / Luyện đề / Hồ sơ
- `.page-head` cao cố định 112 px (laptop) / 88 px (mobile); tranh thu còn 40 % bề ngang, chạm mép phải, mờ 85 % để chữ đè được; h1 28 px; mô tả 1 dòng hoặc bỏ.
- Hồ sơ: tủ trưng bày xuống **dưới** bảng số liệu (chuỗi, chức danh, số sách) và thu còn 1/2 cột ở ≥ 768; người mới thấy "Bạn chưa có gì để trưng — học 1 chương để nhận sách đầu tiên" thay vì ma-nơ-canh trống.

### 4.4 Tiêu chí "xong" cho B
- Hôm nay khi IndexedDB trống: ≤ 1 100 px cao ở 1280 (hiện ≈ 3 050).
- Không số liệu nào của môn xuất hiện 2 lần trong cùng một màn (kiểm bằng mắt trên ảnh chụp + e2e đếm `.bar` trong `#/mon/hien-phap` ≤ 1 ngoài lưới).

---

## 5. Việc C — Lấp chỗ trống có ý

| Chỗ trống | Đề xuất | Dữ liệu |
|---|---|---|
| Sidebar giữa (≥ 1280) | **Đợt đang học** (tên môn + đợt + nút tiếp) — người dùng quay lại học từ mọi trang không qua Hôm nay | `pickHeroState` đã có |
| Rail phải Môn học (≥ 1440) | **Thống kê tủ**: số môn đã bắt đầu / tổng, môn gần đây nhất, môn có nhiều khái niệm cần ôn nhất | `repo.due` theo môn |
| Rail phải Hồ sơ | **Lịch sử 30 ngày**: lưới 30 ô (kiểu GitHub contributions) | `repo.reviewDays` mở rộng từ 7 lên 30 |
| Phiên học, cột phải | giữ danh sách đợt; chú thích "Bậc 0–6…" chỉ hiện ở phiên đầu tiên | cờ `settings` |
| Danh mục khái niệm | thanh nhỏ dính đầu khi cuộn: tên chương hiện tại + "Về đầu" + lọc ★ | DOM `IntersectionObserver` |

Không lấp bằng trang trí thuần tuý: mỗi khối phải trả lời một câu hỏi người học có.

---

## 6. Việc D — Chi tiết nhìn

1. **Nhịp chữ**: hiện h1 42 / h2 kicker 12 / thân 16 — thiếu nấc giữa. Đặt thang 12 · 14 · 16 · 20 · 24 · 32 (bỏ 42, chỉ giữ ở Hôm nay). Dòng mô tả dùng 15 px thay 16 để phân biệt với thân.
2. **Trạng thái rỗng** có hình nhỏ (sách mở trống, viết tay 160×100) cho: chưa học, chưa có sách, chưa có đề làm, tìm không ra.
3. **Skeleton** khi tải trang: khung xám 3 bìa / 3 hàng để bố cục không nhảy; dùng chung `Skeleton.svelte`.
4. **SVG lặp**: 23 bìa inline × ~60 phần tử là ổn, nhưng tranh kiến trúc `tam-quan` lặp 20 lần (~400 phần tử mỗi tranh) là nguyên nhân cuộn giật ở điện thoại — bỏ theo việc A. Tranh đầu trang dùng `<use href="#...">` khi cùng tranh xuất hiện 2 lần trong một màn.
5. **Dark mode**: chụp thêm bộ ảnh tối trong `npm run shots` (thêm `colorScheme: 'dark'` cho một lượt); kiểm bìa trên nền tối (bìa màu cố định, cần viền 1 px sáng hơn nền).
6. **Topbar điện thoại**: huy hiệu thẻ chuyên cần tối 40×26 px + "0" + "Công dân" chiếm 45 % hàng; thu thành một chip "0 ngày · Công dân" hoặc chỉ hiện khi chuỗi > 0.

---

## 7. Ngoài phạm vi (ghi để không quên)

- Vẽ tranh kiến trúc riêng cho 20 môn còn lại (đợt sau của spec hình khối §4.3) — bìa sách thay thế nhu cầu này ở thẻ, tranh chỉ cần cho `subject-head`.
- Đổi tên hiển thị bậc 6 ("Thuần thục"/"Tinh thông") — câu hỏi treo từ spec thăng chức, không thuộc đợt này.
- Nội dung JSON (định nghĩa, nguồn) không đụng, trừ thêm trường `field`/`cover`.

---

## 8. Thứ tự triển khai dự kiến (cho `writing-plans` sau khi duyệt)

| PR | Nhánh | Việc | Thời gian | Người dùng thấy gì |
|---|---|---|---|---|
| 1 | `feat/bia-sach-du-lieu` | schema `field`/`cover`, gán 23 môn, test; `BookCover.svelte` + `wrapTitle`; trang thử `#/mon` dùng bìa trong lưới cũ | ≤ 2 h | Bìa xuất hiện thay tranh cổng |
| 2 | `feat/tu-sach-mon-hoc` | kệ theo nhóm, ô tìm, sắp xếp, đầu trang gọn, Hôm nay dùng bìa `sm` | ≤ 2 h | Trang Môn học mới |
| 3 | `feat/mot-so-lieu-mot-nha` | Hôm nay ≤ 4 môn + gợi ý năm 1; trang môn gọn; đầu trang 112 px; Hồ sơ đảo thứ tự | ≤ 2 h | Bớt trùng, bớt trống |
| 4 | `feat/lap-cho-trong` | sidebar "Đợt đang học", rail Môn học/Hồ sơ, Luyện đề lọc theo nhóm | ≤ 2 h | Cột phải, sidebar có việc |
| 5 | `feat/chi-tiet-nhin` | thang chữ, trạng thái rỗng, skeleton, ảnh dark, topbar mobile | ≤ 2 h | Mượt, đều |

Mỗi PR: `npm run ci` xanh, ảnh 390 + 1280 (sáng + tối từ PR 1), e2e chỉ chạy ở PR 2 và 3 (đổi luồng UI).
