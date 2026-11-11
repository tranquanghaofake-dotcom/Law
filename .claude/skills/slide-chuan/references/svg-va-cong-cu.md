# Hình vẽ bằng code (SVG) và công cụ mã nguồn mở cho slide

Đọc file này khi: muốn thêm loại hình mới cho engine, chọn hoạ tiết nền, hoặc cân nhắc công cụ khác ngoài skill.
Giấy phép ghi theo trang chính thức / file LICENSE trên GitHub (kiểm 11/2026). Dòng ghi **chưa xác minh** = chưa đọc được nguồn gốc, phải tự kiểm trước khi dùng.

## 1. SVG là gì, vì sao dùng

SVG = hình mô tả bằng toạ độ và nét (vector), không phải lưới điểm ảnh. Hệ quả thực tế:
- Phóng to bao nhiêu cũng nét (máy chiếu 4K, in A3).
- Đổi màu theo theme bằng cách thay mã màu trong chuỗi — engine làm vậy cho icon, hình minh hoạ, hoạ tiết.
- **Nhúng SVG thật vào PPTX (mặc định từ bản này)**: PowerPoint 365 / 2019+ hiển thị vector; chuột phải → *Convert to Shape* để sửa từng nét. Office cũ / trình xem không đọc SVG thấy ảnh PNG dự phòng (engine tự vẽ bằng `sharp`, vì pptxgenjs chạy trên Node chỉ để ảnh hỏng — gitbrent/PptxGenJS#401). Cờ `--raster` tắt SVG.
- Giới hạn: PowerPoint vẽ sai `<mask>`, `<filter>` (đổ bóng mờ, blur) → engine tự giữ PNG cho SVG có các thẻ này. Hoạ tiết mới phải làm mờ mép bằng dải chuyển màu (gradient) thay vì mask.

## 2. Những loại hình vẽ được bằng code và đẹp

| Loại | Dùng khi | Engine đã có | Cách làm / thư viện (giấy phép) |
|---|---|---|---|
| Icon | đánh dấu bên, loại giấy tờ | ✓ (Phosphor Duotone, Font Awesome qua `react-icons`, MIT) | Thêm: Lucide (ISC), Tabler Icons (MIT) |
| Sơ đồ quan hệ / dòng tiền | ai chuyển gì cho ai | ✓ `flow`, `ledger` | Mermaid CLI `mmdc` (MIT) xuất SVG cho sơ đồ cây/khối phức tạp |
| Biểu đồ số liệu | so độ lớn, tỉ trọng | ✓ `chart` (bar/donut/span/slope), `share` | Apache ECharts có chế độ render SVG phía server (Apache-2.0); Vega-Lite (BSD-3) |
| Bản đồ | địa bàn, nhóm tỉnh | ✓ `map` (Natural Earth, phạm vi công cộng) | mapshaper (MPL-2.0) để đơn giản hoá ranh giới |
| Nét vẽ tay | khoanh con số chính | ✓ Rough.js (MIT) | — |
| **Đường đồng mức** (bản đồ địa hình) | đất đai, quy hoạch, môi trường, địa lý | ✓ mới: `meta.motif: "contour"` | thuật toán marching squares (như d3-contour, ISC) — engine tự cài, không phụ thuộc |
| **Lưới chấm** | báo cáo, phân tích, chủ đề trung tính | ✓ mới: `meta.motif: "dots"` | tự vẽ; ý tưởng hoạ tiết lặp kiểu Hero Patterns (**chưa xác minh** giấy phép — không chép SVG của họ) |
| **Giấy kẻ dòng** (`lines`) | hồ sơ, biên bản, bình luận bản án | ✓ mới | tự vẽ: dòng kẻ + lề kép + nét "chữ viết" giả |
| **Giấy kẻ ô ly** (`grid`) | xây dựng, quy hoạch, cấp phép | ✓ mới | tự vẽ: lưới nhỏ/lưới chính + mặt bằng |
| **Sóng mảnh** (`waves`) | kinh doanh, tài chính, công nghệ | ✓ mới | tự vẽ: 16 đường sin lệch pha |
| **Mảng màu loang** (`blobs`) | chủ đề nhẹ, kỹ năng | ✓ mới | tự vẽ: đường cong Catmull-Rom khép kín |
| Thửa đất / địa chính | nhà đất, thế chấp QSDĐ | ✓ `cadastral` (vẽ lại: thửa nhỏ, nằm gọn vùng trống) | — |
| Guilloche (hoa văn tiền giấy) | hợp đồng, giấy tờ có giá, ngân hàng | ✓ `certificate` (vẽ lại: nhiều sóng lệch pha đan nhau) | — |
| Núi nhiều lớp | du lịch, môi trường, văn hoá | ✓ `landscape` (sống núi Catmull-Rom, mềm) | — |
| Lưới tam giác (low-poly) | bìa sự kiện, startup | không (không hợp chủ đề pháp lý) | Trianglify — **chưa xác minh** giấy phép (theo trí nhớ là GPL-3.0: nhúng mã vào skill thì cả skill phải GPL) |

Nguyên tắc chọn (giữ như `SKILL.md`): hình phải trả lời "nó cho người xem thấy điều gì mà chữ không cho thấy?". Hoạ tiết nền không trả lời được → `none`.

## 2b. Công cụ SVG — đã tích hợp và nên biết
| Công cụ | Giấy phép | Trong skill | Làm gì |
|---|---|---|---|
| sharp (libvips/librsvg) | Apache-2.0 | ✓ | Vẽ SVG ra PNG dự phòng, nhuộm/cắt ảnh |
| svgo | MIT | ✓ | Nén SVG trước khi nhúng (bỏ thừa, gộp đường) |
| Rough.js | MIT | ✓ | Nét vẽ tay khoanh con số |
| react-icons | MIT (icon theo bộ) | ✓ | Phosphor, Lucide, Tabler, Font Awesome |
| d3 (d3-shape, d3-contour…) | ISC | chưa | Vẽ biểu đồ phức tạp ra chuỗi SVG trong Node (không cần trình duyệt) |
| Vega-Lite | BSD-3 | chưa | Biểu đồ khai báo bằng JSON → SVG |
| Mermaid CLI (`mmdc`) | MIT | chưa | Sơ đồ khối/cây từ văn bản (cần Chromium) |
| Graphviz (`dot`) | EPL | chưa | Sơ đồ quan hệ nhiều nút, tự xếp vị trí |
| resvg | MPL-2.0 / Apache-2.0 | chưa | Vẽ SVG → PNG chính xác hơn librsvg (khi gặp gradient phức tạp) |
| Inkscape CLI | GPL-2.0 | chưa | SVG → EMF: PowerPoint cũ (2016 trở về trước) sửa được từng nét; GPL nên chỉ gọi như chương trình ngoài, không nhúng mã |

## 3. Tranh minh hoạ người / cảnh (vector có sẵn)

| Bộ | Giấy phép | Lưu ý thực hành |
|---|---|---|
| Open Peeps, Open Doodles, Humaaans (Pablo Stanley) | CC0 — dùng, sửa, thương mại, không cần ghi nguồn | Phong cách hoạt hình: hợp bài thuyết trình nhẹ, không hợp bình luận bản án nghiêm túc |
| unDraw | Giấy phép riêng: dùng miễn phí, kể cả thương mại, không cần ghi nguồn; **cấm** gom thành bộ để phân phối lại, **cấm** dùng huấn luyện AI | Vì vậy KHÔNG đóng gói unDraw vào skill; người dùng tự tải từng hình khi cần |
| Storyset, Freepik | yêu cầu ghi nguồn / gói trả phí | Không dùng mặc định |

Skill không tự tải các bộ này (đúng nguyên tắc "không tranh minh hoạ chung chung"). Nếu người dùng muốn: tải SVG, đặt vào thư mục deck, dùng như ảnh (`photo`) và ghi nguồn khi giấy phép yêu cầu.

## 4. Công cụ làm slide mã nguồn mở — học được gì, có nên chuyển sang không

| Công cụ | Giấy phép | Ra PPTX sửa được? | Học được gì cho skill này |
|---|---|---|---|
| PptxGenJS (engine đang dùng) | MIT | ✓ (đối tượng gốc) | Có sẵn nhúng SVG + ảnh dự phòng — đã bật |
| python-pptx | MIT | ✓ | Đọc/sửa PPTX có sẵn (mẫu của trường) |
| Slidev | MIT | `pptx` = mỗi slide một ảnh; `pptx-editable` dựng lại hình gốc nhưng SVG, gradient, filter vẫn thành ảnh | Bố cục từ Markdown; lưới và khoảng cách đều nhờ CSS |
| Marp CLI | MIT | mặc định là ảnh; `--pptx-editable` còn thử nghiệm, cần LibreOffice, mất ghi chú thuyết trình | Theme bằng CSS; một nguồn ra cả PDF/HTML/PPTX |
| reveal.js | MIT | không | Chuyển cảnh, slide HTML trên web |
| Presenton | Apache-2.0 | ✓ | Mỗi bố cục khai báo ảnh cần tìm (đã áp dụng) |
| Mermaid CLI | MIT | ảnh SVG | Sơ đồ từ văn bản |

Kết luận thực hành: **giữ PptxGenJS** vì người dùng cần file PowerPoint sửa được, có ghi chú thuyết trình, đúng font Office. Slidev/Marp đẹp khi chiếu bằng trình duyệt nhưng bản PPTX của chúng chủ yếu là ảnh chụp slide — thầy cô/đồng đội không sửa được chữ.

## 5. Nguyên tắc khoảng trắng đã cài vào engine (lớp kiểm thứ 3)

Rút từ các hướng dẫn thiết kế phổ biến (lưới 8pt của Material Design, "khoảng trắng phải có chủ đích"):
- **Bố cục co giãn theo nội dung**: `flow`, `agenda`, `bignum`, `stats`, `scorecard`, ô `insight` của `chart` tự giãn/căn giữa theo chiều dọc; ít mục → hàng cao hơn, chữ to hơn (trong thang 15–22pt).
- **Gợi ý dư khoảng trống** (`ℹ`, không chặn `--strict`): phần thân trống > ~1.15 in, hoặc nhóm thẻ trống > 28% chiều cao. Cách sửa là gộp slide / đổi type — **không nhồi thêm chữ**.
- **Lỗi chặn `--strict`**: hai khối có nền cách nhau 0 < d < 0.15 in (sát nhưng không chạm — trông như lỗi căn chỉnh); chữ đè chữ (đo bằng font thật).
- **Đa dạng mà không rối**: mỗi slide một biến thể (hạt giống theo số slide, lật ngang slide chẵn); deck phối tối đa 2 hoạ tiết (`"motif": ["cadastral", "lines"]`). Xem trước cả 9 hoạ tiết × 3 theme: `examples/motifs.png`.
- **Hoạ tiết nền**: đặt SAU khi xếp nội dung, vào hình chữ nhật trống lớn nhất CHẠM MÉP PHẢI slide (cách nội dung ≥ 0.25 in, thuật toán "largest rectangle in histogram"); mép tan vào nền, cạnh chạm mép slide thì tràn ra mép; không đủ chỗ (tối thiểu ~2.2 × 1.4 in) thì không vẽ. Luôn ở lớp dưới cùng.

## 6. Nghiên cứu bổ sung (11/2026): loại bố cục, đồ hoạ và nguồn tham khảo

### Bố cục mới đã đưa vào engine (shape gốc PowerPoint — sửa được)
| type | Nhóm SmartArt tương ứng | Câu hỏi người nghe | Kỹ thuật |
|---|---|---|---|
| `pyramid` | Pyramid | Cái nào trên cái nào? | `custGeom` (đa giác tự do của pptxgenjs) — mỗi tầng một hình thang |
| `steps` | Process | Làm gì trước, bao lâu? | `homePlate` + `chevron` có số; chip thời hạn |
| `matrix` | Matrix | Kết quả theo hai tiêu chí? | 4 thẻ + 2 trục mũi tên; ô cao vừa chữ |
| `venn` | Relationship | Chung gì, riêng gì? | 2 elip trong suốt, phần giao tự đậm |
| `tree` | Hierarchy (cây quyết định) | Nếu … thì …? | đường nối gấp khúc + chip điều kiện |
| `quote` | — | Văn bản nói nguyên văn gì? | chữ có chân nghiêng tự co 32 → 24pt |
| `frame` | Picture | Ảnh chứng minh điều gì, ở chỗ nào? | ảnh trong khung trắng + điểm đánh số |
| `beforeafter` | Picture | Đã thay đổi gì? | 2 ảnh + tab nhãn; ảnh trước đen trắng |

### Chưa làm (cân nhắc sau) — và vì sao
| Đồ hoạ | Lý do chưa làm |
|---|---|
| Cycle (vòng lặp) | Ít gặp trong bài luật; quy trình có điểm kết thúc → `steps` |
| Org chart nhiều tầng | Cần tự xếp vị trí nút: elkjs (EPL-2.0) hoặc Graphviz `dot` (EPL) làm được, nhưng nhúng mã EPL vào skill phải giữ giấy phép EPL cho phần đó — nên gọi như chương trình ngoài |
| Sankey, waterfall, bump chart | Có trong FT Visual Vocabulary; cần số liệu thật nhiều chiều — hiếm trong bài luật sinh viên. `ledger` đã thay waterfall cho được–mất |
| Treemap | Tỉ trọng nhiều nhóm; `chart` donut/bar đủ cho ≤ 6 nhóm |

### Nguồn đã đọc (kiểm 04/11/2026)
| Nguồn | Loại | Rút ra |
|---|---|---|
| Microsoft Support — "Choose a SmartArt graphic", "Learn more about SmartArt graphics" | Hướng dẫn | Phân loại theo MỤC ĐÍCH (List/Process/Cycle/Hierarchy/Relationship/Matrix/Pyramid/Picture); "chỉ đưa ý chính vào hình, phần giải thích để chỗ khác" |
| ft-interactive/visual-vocabulary (MIT — chỉ mã; nội dung, thương hiệu FT có bản quyền) | Mã nguồn mở | Chọn biểu đồ theo quan hệ dữ liệu: deviation, correlation, ranking, distribution, change over time, part-to-whole, magnitude, spatial, flow |
| Alley & Neeley (2005), "Rethinking the Design of Presentation Slides: A Case for Sentence Headlines and Visual Evidence", *Technical Communication* 52(4) | Bài báo | Tiêu đề câu khẳng định ≤ 2 dòng + bằng chứng hình ảnh; danh sách ≤ 3–4 mục |
| The Data Visualisation Catalogue (Severino Ribecca) | Danh mục | Tra loại biểu đồ theo chức năng |
| pptxgenjs 3.12 `custGeom` (đọc mã nguồn `gen-xml`) | Mã nguồn | Đa giác tự do thành shape gốc (moveTo/lnTo/close), không phải ảnh |

## 7. Đồ hoạ bằng code đợt 11/2026 — làm đẹp mà không dùng ảnh AI

Mã ở `engine/codeart.js` (hàm thuần trả chuỗi SVG) + bố cục trong `engine/build.js`. Ví dụ đủ các mục: `examples/do_hoa_code.json`.

| Hướng | Trong engine | Người xem thấy gì | PowerPoint | Nguồn / giấy phép |
|---|---|---|---|---|
| Isotype — đếm bằng hình | type `isotype` | Đếm được số tiền / người / hộ; phần mất là khung rỗng | Vector (SVG) | Otto Neurath (ISOTYPE). Haroz, Kosara & Franconeri (2015), CHI, tr. 1191–1200: hình MANG số liệu không làm chậm hay giảm trí nhớ, hình thừa thì gây xao nhãng |
| Chú thích viết tay | `chart.annotate` | Đúng cột người nói đang chỉ | Vector; chữ là ô chữ thật | perfect-freehand (MIT, đã đọc LICENSE) |
| Gạch chéo / gradient gốc | `items[].hatch`, khối nền tối | Vùng "chưa chắc / tranh chấp"; chiều sâu cho khối tối | Shape gốc, sửa được | `a:pattFill` / `a:gradFill` thêm ở bước hậu xử lý (pptxgenjs 3.12 chưa có — gitbrent/PptxGenJS#102) |
| Morph | `--transition morph`, `transition` | Mốc trượt dọc dòng thời gian, thẻ quiz lật sang đáp án | PowerPoint 2019 / 365; nơi khác tự về fade | Microsoft Support "Morph transition: Tips and tricks" (tên `!!…`); XML theo scanny/python-pptx#942 |
| Isometric | type `iso` | Ai ở đâu, trên thửa nào | Vector | Phép chiếu 30° tự viết (cùng công thức với isomer — MIT — nhưng không dùng mã của nó) |
| Thửa Voronoi | motif `cadastral` (trang nội dung) | Bản đồ địa chính trông thật | Vector | Tự viết (cắt nửa mặt phẳng, rải điểm kiểu Poisson) — không phụ thuộc thư viện |
| Giấy cắt lớp | `cover.layout: "paper"` | Bìa có chiều sâu, mỗi đề tài một hình (hạt giống = tên đề tài) | **PNG** (bóng mờ) | Tự viết |
| Số khổng lồ, nền có hạt | type `hero` | Khoảnh khắc bước ngoặt | Nền **PNG** (hạt nhiễu); số là ô chữ thật | Tự viết (feTurbulence) |

Căn cứ thêm: Borkin et al. (2013), "What Makes a Visualization Memorable?", IEEE TVCG — màu và vật thể nhận ra được (ngôi nhà, tờ tiền) làm hình dễ nhớ hơn; Bateman et al. (2010), "Useful Junk?", CHI — biểu đồ có minh hoạ nhớ tốt hơn mà không giảm hiểu (thử với biểu đồ ít điểm dữ liệu, không giới hạn thời gian xem).

Đã cân nhắc, KHÔNG đưa vào engine:
- DiceBear (mã MIT, nhưng mỗi kiểu avatar một giấy phép riêng — có kiểu CC BY phải ghi nguồn, có kiểu điều khoản riêng); kiểu Lorelei / Open Peeps là tranh người vẽ tay — không phải AI nhưng cũng không phải đồ hoạ bằng code, nét hoạt hình không hợp bình luận bản án.
- Adobe Leonardo (Apache-2.0) — sinh bảng màu theo tương phản: hữu ích khi THÊM theme mới, không cần chạy lúc dựng deck.

### Đợt 3 (11/2026)
| Hướng | Trong engine | Căn cứ / công cụ |
|---|---|---|
| Hiện từng ý khi bấm | `build`, `--build` | Chèn `p:timing` (Fade, presetID 10) ở bước hậu xử lý; Mayer & Chandler (2001) — nguyên tắc phân đoạn. Đã kiểm: LibreOffice đọc ra đủ hiệu ứng `ooo-entrance-fade-in` |
| Lộ dần tự chạy (nhịp video) | `motion`, `--motion` | Một chuỗi `p:timing` tự chạy (evt onBegin): Float In (42), Wipe từ trái (22/8), Fade (10), phóng-về-cỡ (53, ppt_w/ppt_h ×1.35 → 1); `decel` = vào giảm tốc. Nhịp lấy từ skill `motion-video` mục 8 (chữ cách 60–120 ms, một hướng, khoảng lặng trước cú chốt, không "cảnh vào trống"). Đã kiểm: LibreOffice đọc ra `ooo-entrance-ascend` / `wipe from-left` / `fade-in-and-zoom`, node after-previous |
| So chữ điều luật | type `redline` | jsdiff (BSD-3-Clause, đã đọc LICENSE); gộp thay đổi vụn bằng luật "cách nhau ≤ 1 từ ngắn" |
| Lịch thời hạn | type `deadline` | Tự vẽ; KHÔNG tự tính hạn (Điều 147–148 BLDS 2015 có ngoại lệ) |
| Kiểm mù màu | gợi ý lúc build, `engine/cvd.js` | Machado, Oliveira & Fernandes (2009), IEEE TVCG 15(6) — ma trận mức nặng 1.0; ΔE CIE76 < 15 = khó phân biệt |

### Bộ dựng hình (11/2026): `engine/shapes.js` — học CÁCH LÀM, không chép kết quả
Học từ bài hướng dẫn "Vẻ đẹp phương Đông" (TikTok, Powerpoint – Minh Phạm). Năm thao tác trong bài → công cụ của engine:
| Thao tác trong PowerPoint | Công cụ | Ghi chú |
|---|---|---|
| Nền ảnh giấy có vân, phủ kín slide | `meta.paper` → `paperGrain()` | feTurbulence hạt mịn, alpha 7% — chỉ nền sáng |
| Chồng lớp: hình to hơn đặt dưới tạo chiều sâu | đã có: `stack()`, mảng màu lệch của bìa `band` | không viết lại |
| Hình cơ bản (dấu ngoặc lớn, chữ nhật bo góc), kéo nút vàng chỉnh độ cong | `SH.brace(x,y,w,h,dir,k)`, `roundRect`, `ellipse`, `arch`, `rect` | đường cong rải 24 điểm/đoạn; `k` = nút vàng |
| Gộp hình dạng › Kết hợp / Trừ đi / Giao nhau | `SH.union`, `subtract`, `intersect` | polygon-clipping (MIT, thuật toán Martinez–Rueda); kết quả → `custGeom` (`drawShape`) |
| Sao chép, phóng lớn nhẹ đặt dưới làm viền; Tô bằng ảnh | `SH.grow(sh, d)` + `drawShape(..., { picture })` | pptxgenjs chưa có tô ảnh cho hình → hậu xử lý `nativePictures()` thay `solidFill` bằng `blipFill`, nhúng ảnh vào `ppt/media`, thêm quan hệ `rIdPf*` |
Khung chỉ dùng ở bìa / `agenda` / `section` / `end` có ảnh (bố cục riêng `coverFrame` / `agendaFrame` / `framedSection` / `framedEnd`; viền lấy cùng màu nhấn với chữ của slide: khung đứng trọn bên phải, chữ trên nền bên trái). Đã thử đặt khung vào `split` / `photostats` — thẻ chữ của hai bố cục đó đè lên khung, trông như lỗi → không áp.
Thêm khung mới: viết một công thức trong `SH.FRAMES` ghép từ hình cơ bản + phép gộp (xem `ogee`), thêm tên vào enum `frame` của `engine/validate.js`. Test: `tests/khung_anh.test.js` (diện tích phép gộp, khung là một mảnh liền, XML có `blipFill` + ảnh nhúng đủ).

### Đợt 5 (11/2026): phong cách mở – chương – kết (`meta.style`, `engine/styles.js`)
| Phong cách | Chất liệu | Chương được biểu diễn bằng | Ghi chú kỹ thuật |
|---|---|---|---|
| `dossier` | Bàn tối có vân, bìa giấy kraft có vân hạt, tờ giấy lộ ra, dây buộc, dấu mực đỏ loang (feTurbulence + feDisplacementMap) | Tab hồ sơ; chương hiện tại thuộc bìa phía trước | Trên giấy kraft chỉ dùng màu mực đậm — đỏ dấu chỉ đạt ~2.3:1 |
| `cadastral` | Bản đồ Voronoi, đường, sông, lưới toạ độ, mũi tên Bắc, thước tỉ lệ; màu pha từ màu chữ của theme (không ra bản đồ hồng ở theme nhấn đỏ) | Tờ bản đồ có khung + sơ đồ chắp tờ | Thửa tô gạch có phương án dự phòng khi vùng mong muốn không có thửa nào |
| `portico` | Bầu trời gradient, cột đá có rãnh, trán tường, bóng đổ dài | Số cột = số chương, cột hiện tại tô màu nhấn + số La Mã | Dòng khắc trán tường tự thu cỡ chữ để vừa một dòng |
Nguyên tắc chung: nền PNG (vì SVG filter), chữ là ô chữ thật; màu nền dưới chữ được khai báo cho bộ kiểm tương phản (trường hợp xấu nhất — đỉnh gradient). Không mô phỏng quốc huy hay dấu cơ quan nhà nước.
