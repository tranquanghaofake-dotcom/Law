# Tầng hình ảnh: các "cảnh" và cách bộ dựng làm ra PPTX thật

Đọc file này khi: (1) viết `deck.json` có dùng type cảnh, (2) cần hiểu vì sao một khối không sửa được / không có hiệu ứng, (3) muốn thêm cảnh mới.

Lệnh: `node hinh/dung.js <deck.json> [out.pptx] [--mau=son|luc|lam|nau] [--chuyen=morph|fade] [--soat]`

## 1. Hai loại type

| | 65 type của bộ mẫu (`cover`, `flow`, `chart`, `table`, `quiz`…) | 11 type cảnh (bảng dưới) |
|---|---|---|
| Cú pháp | Như engine: `references/layouts.md` | Mục 2 của file này |
| Ai gắn hộp chữ / lớp ảnh / hiệu ứng | Tự động (`hinh/tu_gan.js`): mỗi khối vào lần lượt, chữ thành hộp chữ | Viết sẵn trong `hinh/canh.js`: có vật thật, hình dán, Morph, số đếm, liên kết |
| Dùng khi | Phần lớn slide của mọi deck | Mở bài, chốt ý, số liệu đếm được, kiểm tra nhanh — **mỗi deck 4–8 cảnh là đủ**, đừng biến cả deck thành cảnh |

Trộn tự do hai loại trong cùng `deck.json`. Mọi slide nên có `"id"` (chữ thường, gạch nối) để liên kết `go` trỏ tới; slide muốn có trong mục lục thì thêm `"toc": "Tên ngắn"`.

## 2. Cú pháp 11 cảnh

Chữ trong `[ngoặc vuông]` là cụm nhấn (đổi màu), như các type khác. `emoji` là tên hình trong kho `hinh/emoji.json` — xem mục 4.

### `book` — mở sách tìm điều luật (1 slide deck.json → 5–9 slide tự chạy)
Bìa sách trên bàn → bấm → sách dời ra giữa, bìa gập, trang mở → kính lúp bay lên soi lần lượt các điều ở `stops` rồi dừng, tô đỏ điều ở `find`. Slide ngay sau `book` nên là `bigq`: dòng đỏ biến thành ô đỏ của câu hỏi.
```json
{ "type": "book", "id": "bia", "toc": "Mở sách",
  "kicker": "Luật lao động", "title": "Mở bộ luật,\n[tìm câu trả lời]", "sub": "Một câu dẫn.",
  "hint": "Bấm để mở sách", "found": "Đây rồi. Bấm để vào bài.",
  "cover": { "title": "Bộ luật\nLao động", "year": "2019", "code": "Số 45/2019/QH14" },
  "label": "Điều",
  "left":  { "head": "Bộ luật Lao động 2019", "chapter": "Chương III", "name": "Hợp đồng lao động", "section": "Mục 2. …", "page": 26, "rows": [[28, "Tên điều 28"], [29, "…"]] },
  "right": { "head": "Chương III · …", "section": "Mục 3. …", "page": 27, "rows": [[34, "…"], [35, "…"]] },
  "stops": [28, 31, 33], "find": 35, "props": ["hot-beverage", "memo"] }
```
- `rows` là **tên điều đúng nguyên văn mục lục của văn bản** (lấy từ văn bản gốc, không tự đặt). Mỗi trang 6–8 dòng; dài hơn sẽ tràn trang sách.
- `find` phải có trong `rows`; `stops` là 2–3 điểm dừng trước đó (đi từ trên xuống, trái sang phải).
- Nhãn điều luật dưới sách sẽ Morph thành tên bài trên thanh đầu slide → đặt `meta.short` = "Điều 35 · Bộ luật Lao động 2019" để phép biến hình có nghĩa.
- Sách dùng cho luật, bộ luật, nghị định, giáo trình. Bài không xoay quanh một điều khoản cụ thể thì đừng dùng — mở bằng `cover`.

### `bigq` — câu hỏi lớn của bài
```json
{ "type": "bigq", "id": "cau-hoi", "lines": ["Nghỉ việc", "phải báo trước"], "box": "bao lâu?", "emoji": "tear-off-calendar", "emoji2": "hourglass-not-done", "by": "Người trình bày: …" }
```
Mỗi dòng ≤ 15 ký tự giữ cỡ chữ lớn nhất (dài hơn tự hạ cỡ). `box` là cụm chốt, 6–12 ký tự.

### `picks` — 2–3 thẻ câu hỏi, bấm để nhảy
```json
{ "type": "picks", "kicker": "Mở đầu", "title": "Ba câu hỏi [trước khi nộp đơn]",
  "items": [ { "q": "Phải báo trước bao nhiêu ngày?", "emoji": "tear-off-calendar", "go": "ba-muc" }, { "q": "…", "emoji": "door", "go": "ngoai-le" } ] }
```
Hình dán trùng tên với hình của slide trước sẽ **bay** từ chỗ cũ tới thẻ (không bật ra) — dùng để nối `bigq` → `picks`.

### `lawquote` — trích nguyên văn
```json
{ "type": "lawquote", "kicker": "Căn cứ", "title": "Luật nói [nguyên văn] thế này",
  "head": "Bộ luật Lao động 2019 · Điều 35 · Khoản 1", "quote": "Người lao động có quyền … nhưng [phải báo trước] cho …",
  "art": "35", "artLabel": "Điều", "stamp": "Khoản 1", "source": "Nguồn: …, hiệu lực từ …" }
```
`quote` là **nguyên văn** (không tóm tắt), ≤ 170 ký tự; cụm trong `[ ]` được nét bút vàng chạy qua — chỉ một cụm, nằm trọn trên một dòng. `source` ghi số hiệu văn bản và tình trạng hiệu lực.

### `tiles` — cột xếp bằng ô đơn vị + số đếm
```json
{ "type": "tiles", "kicker": "Khoản 1", "title": "Ba mức [báo trước]", "legend": "Mỗi ô là một ngày",
  "ref": { "head": "… Điều 35 · Khoản 1", "text": "… nhưng [phải báo trước] … như sau:" },
  "cols": [ { "n": 45, "unit": "ngày", "label": "Hợp đồng không xác định thời hạn", "emoji": "briefcase" },
            { "n": 30, "unit": "ngày", "label": "…", "emoji": "page-facing-up", "morph": true },
            { "n": 3, "unit": "ngày làm việc", "label": "…", "emoji": "stopwatch" } ], "source": "…" }
```
- 2–3 cột, mỗi cột `n` ≤ 45 ô (5 ô một hàng). Số lớn hơn: đổi đơn vị của ô (`legend`: "Mỗi ô là 10 ngày") và ghi số thật ở `value`.
- `ref` (tuỳ chọn): thẻ trích nhỏ; nếu slide trước là `lawquote` thì tờ trích thu lại thành thẻ này.
- `"morph": true` ở **một** cột: các ô của cột đó bay sang slide `strip` kế tiếp (số ô phải bằng `n` của `strip`).
- Tiêu đề ≤ 34 ký tự (một dòng).

### `strip` — dải N ngày có số
```json
{ "type": "strip", "kicker": "Ví dụ", "title": "Hợp đồng 24 tháng: [30 ngày]", "lead": "Mỗi tờ là một ngày của thời hạn báo trước.", "n": 30,
  "marks": [ { "emoji": "envelope", "head": "Ngày báo", "text": "…" }, { "emoji": "office-worker", "head": "30 ngày", "text": "…" }, { "emoji": "waving-hand", "head": "Nghỉ việc", "text": "…" } ], "source": "…" }
```
`n` ≤ 32 (≤ 16 một hàng, nhiều hơn chia hai hàng). Từng tờ được đánh dấu tích lần lượt, tờ cuối đỏ. Slide này **chỉ minh hoạ độ dài**; cách tính ngày đầu / ngày cuối của thời hạn phải ghi rõ ở `source` nếu chưa trình bày.

### `cases` — thẻ trường hợp + con số chốt
```json
{ "type": "cases", "kicker": "Khoản 2", "title": "Bảy trường hợp [nghỉ ngay]",
  "items": [ { "k": "a", "emoji": "office-building", "text": "…" } ], "big": { "value": "0", "label": "ngày báo trước" }, "source": "…" }
```
Tối đa 8 thẻ (7 nếu có `big`), mỗi thẻ ≤ 70 ký tự. Rút gọn điều luật thì `source` phải nói rõ là rút gọn và điểm nào còn điều kiện kèm theo.

### `chain` — tình huống → dấu kết luận → hệ quả
```json
{ "type": "chain", "kicker": "Hậu quả", "title": "Nghỉ ngang thì [mất gì?]",
  "cause": { "tag": "Tình huống", "text": "…" }, "emojis": ["person-walking", "door"],
  "stamp": { "text": "Trái\npháp luật", "sub": "Điều 39" },
  "results": [ { "emoji": "prohibited", "text": "…", "ref": "Khoản 1 Điều 40" } ], "source": "…" }
```
Tối đa 3 hệ quả; mỗi hệ quả kèm `ref` = điều khoản là căn cứ.

### `quizgo` — trắc nghiệm bấm đáp án (1 slide deck.json → 3 slide: hỏi, sai, đúng)
```json
{ "type": "quizgo", "id": "cau-hoi", "kicker": "Câu hỏi nhanh", "title": "Hợp đồng 24 tháng. Muốn nghỉ, báo trước [ít nhất] bao lâu?",
  "options": [ { "text": "3 ngày làm việc" }, { "text": "30 ngày", "ok": true }, { "text": "45 ngày" }, { "text": "Không cần báo trước" } ],
  "wrong": { "hint": "Gợi ý: …" }, "right": { "text": "… — điểm b khoản 1 Điều 35." }, "next": "ket" }
```
2–4 đáp án, đúng một `"ok": true`. Bấm sai → slide gợi ý có nút "Thử lại"; bấm đúng → slide giải thích, nút "Tiếp tục" tới `next` (không ghi thì tới slide kế). Slide hỏi **không sang slide khi bấm ra ngoài đáp án** — nói điều này với người trình bày. Khác `quiz` của bộ mẫu (hỏi rồi lật đáp án, không bấm chọn).

### `recap` — câu chốt + thẻ ghi nhớ + căn cứ
```json
{ "type": "recap", "id": "ket", "lines": ["Báo đủ ngày", "rồi hãy nghỉ"], "emoji": "tear-off-calendar", "emoji2": "check-mark-button",
  "chips": [ { "n": "45 · 30 · 3", "text": "…", "go": "ba-muc" } ], "basis": "Điều 35, 39, 40 Bộ luật Lao động số 45/2019/QH14, có hiệu lực từ 01/01/2021. …",
  "buttons": [ { "text": "Mục lục", "go": "muc-luc" } ] }
```
`basis` ghi đủ số hiệu văn bản, điều khoản, tình trạng hiệu lực, và câu "thông tin pháp luật chung, không phải tư vấn" khi deck nói về pháp luật.

### `toc` — mục lục bằng ảnh thu nhỏ
```json
{ "type": "toc", "id": "muc-luc", "title": "Mục lục — [bấm để nhảy tới]" }
```
Tự lấy mọi slide có `"toc"` (tối đa 10); hoặc ghi tay `"items": [{ "go": "id", "text": "…" }]`. Deck có `toc` thì mọi slide có nút "Mục lục" ở thanh đầu; deck mở bằng `book` thì cuốn sách thu về thành nút đó.

## 3. Vật đi xuyên slide (Morph)

Chuyển cảnh mặc định là Morph. PowerPoint ghép hai vật **cùng tên** ở hai slide kề nhau và cho nó dời / xoay / đổi cỡ; vật không có cặp thì mờ dần. Bộ dựng đặt tên sẵn cho:

| Vật | Từ | Tới |
|---|---|---|
| Thanh tiến độ, tên bài, số trang | mọi slide | slide kế |
| Cuốn sách, kính lúp, đồ trên bàn | các slide của `book` | — |
| Dòng điều luật tô đỏ | slide cuối của `book` | ô đỏ của `bigq` |
| Nhãn điều luật | slide cuối của `book` | tên bài trên thanh đầu slide |
| Hình dán trùng tên | `bigq`, `picks`, `recap` | slide kế có cùng hình |
| Tờ trích | `lawquote` | thẻ nhỏ của `tiles` |
| Các ô của cột `morph` | `tiles` | các tờ của `strip` |

Xếp thứ tự slide theo các cặp này thì Morph có nghĩa; đặt cách quãng thì chỉ còn mờ dần. Không muốn Morph: `--chuyen=fade` hoặc `"meta": { "hinh": { "chuyen": "fade" } }`.

## 4. Hình dán

Kho `hinh/emoji.json` có 90 hình Fluent Emoji (Microsoft, giấy phép MIT). Các tên hay dùng cho deck luật: `balance-scale`, `judge`, `classical-building`, `scroll`, `memo`, `clipboard`, `page-facing-up`, `briefcase`, `office-worker`, `handshake`, `money-bag`, `dollar-banknote`, `money-with-wings`, `receipt`, `bank`, `factory`, `office-building`, `key`, `locked`, `door`, `tear-off-calendar`, `spiral-calendar`, `hourglass-not-done`, `stopwatch`, `alarm-clock`, `warning`, `prohibited`, `no-entry`, `stop-sign`, `check-mark-button`, `cross-mark`, `light-bulb`, `books`, `graduation-cap`, `trophy`, `megaphone`, `magnifying-glass-tilted-left`, `sparkles`, `party-popper`, `thinking-face`, `waving-hand`. Xem đủ: `node -e "console.log(Object.keys(require('./hinh/emoji.json')).join(' '))"`.

Thêm hình: tải SVG từ bộ Fluent Emoji vào `hinh/emoji/<tên>.svg` (không dùng emoji của hãng khác — khác nét, khác giấy phép). Tên không có file thì hình bị bỏ qua, slide vẫn dựng.

## 5. Cái gì sửa được trong PowerPoint

| Thành phần | Trong file .pptx là | Sửa trong PowerPoint |
|---|---|---|
| Mọi chữ nội dung | Hộp chữ, đúng font, đúng chỗ xuống dòng | Gõ lại, đổi màu, đổi cỡ |
| Thẻ, hình dán, biểu đồ, giấy tờ, ô lịch | Ảnh rời (mỗi khối một ảnh) | Dời, xoay, đổi cỡ, xoá, đổi hiệu ứng — không sửa nét bên trong |
| Nền slide | Ảnh nền | Thay nền |
| Chữ trong biểu đồ SVG, số trên tờ lịch, chữ trong trang sách | Nằm trong ảnh (bộ dựng in danh sách `ℹ Chữ nằm trong ảnh`) | Không — sửa `deck.json` rồi dựng lại |
| Hiệu ứng, Morph, liên kết | Tính năng gốc | Sửa ở tab Animations / Transitions |

Giới hạn cần nói với người dùng:
- **Morph cần PowerPoint 2019 hoặc Microsoft 365.** Bản cũ hơn, LibreOffice, Google Slides: chuyển cảnh thành mờ dần; LibreOffice và Google Slides cũng không đọc font nhúng.
- **Mở file tải về phải bấm Enable Editing** trước khi đánh giá phông chữ.
- Chữ trong hộp chữ đã ngắt dòng sẵn: gõ thêm nhiều chữ thì tự chỉnh lại chỗ xuống dòng.

## 6. Tự kiểm (bắt buộc trước khi giao)

Chạy với `--soat`, đọc từng dòng in ra:

| Dòng | Nghĩa | Việc phải làm |
|---|---|---|
| `⚠ slide "…" tràn N px` | Chữ nhiều hơn chỗ; `— khối gây tràn: …` nêu đúng khối con (thẻ, ô) cần rút | Rút chữ ở đúng khối được nêu, hoặc tách slide trong `deck.json` — không thu cỡ chữ |
| `⚠ slide N "…": chữ "…" bị lớp ảnh "…" đè` | Hình dán, ảnh, dấu, dải lụa… vẽ đè lên chữ (`hinh/kiem_de.js`, đo theo thứ tự vẽ thật) | Dời hình (`emojiPos`), rút chữ hoặc đổi chỗ khối |
| `⚠ slide N "…": hai hộp chữ đè nhau` | Một dòng chữ xuống dòng đè lên khối bên dưới (nhãn đè tên, tên người ký đè nhãn) | Rút chữ, giữ một dòng, hoặc dời khối |
| `⚠ Nền chung: …` | Deck không dùng bộ hình theo môn nào (`bc*`, `qt*`) mà `prep.json` chưa ghi người dùng đồng ý | Xem SKILL.md Bước 0 "Bộ hình theo môn"; `--strict` dừng ở dòng này |
| `⚠ slide N: bản PPTX lệch bản HTML x %` | Có khối đặt sai chỗ, thiếu hoặc thừa | Mở `<tên>_lop/soat-*.jpg` (trái HTML · phải PPTX), tìm khối lệch |
| `⚠ font “…” không có ký tự: …` | Ký tự lạ, PowerPoint sẽ lấy font khác | Đổi ký tự trong `deck.json` |
| `⚠ … data-go="…" không trỏ tới slide nào` | Sai `id` | Sửa `go` |
| `ℹ slide dùng mẫu chung` | Gõ sai `type` | Sửa `type` |
| `ℹ Chữ nằm trong ảnh` | Các chữ này không gõ lại được | Bình thường với biểu đồ, bản đồ; báo cho người dùng nếu họ cần sửa |
| `ℹ Ký hiệu … đặt bằng font Segoe UI Symbol` | Mũi tên, dấu tích dùng font ký hiệu của Windows | Không cần làm gì |

Sau đó **mở từng tờ `soat-*.jpg` xem bằng mắt**. Bộ dựng không mở được PowerPoint: Morph, hiệu ứng và font nhúng chỉ kiểm được cấu trúc — lần đầu giao cho một người, nhờ họ xác nhận ba thứ đó chạy đúng trên máy họ.

## 7. Bên trong (để sửa hoặc thêm cảnh)

```
deck.json ─ hinh/dung.js ─► <tên>_lop/deck.html ─ hinh/build.js ─► <tên>.pptx
             │  stage/templates.js   65 type → HTML (khối vào theo thứ tự: data-in)
             │  hinh/canh.js         11 cảnh → HTML đã gắn nhãn tay
             │  hinh/tu_gan.js       (trong trang) tự gắn nhãn cho 65 type
             └  hinh/bang_mau.js     bốn bảng màu
```
`hinh/build.js` đọc trang đã dàn xong bằng Chromium: đo từng dòng chữ → hộp chữ; chụp từng lớp ảnh (dời về một chỗ chuẩn để ảnh giống nhau trùng khít và chỉ lưu một lần); chụp nền; lắp bằng pptxgenjs; rồi viết thêm XML gốc cho Morph, chuỗi hiệu ứng, liên kết và font nhúng (`hinh/xml.js`).

Nhãn trên phần tử HTML (đầy đủ ở đầu file `hinh/build.js`):
`data-t` hộp chữ · `data-l="tên"` lớp ảnh · `data-w` cửa sổ soi (ảnh phóng to cắt theo khung, dùng cho kính lúp) · `data-a` hiệu ứng vào (`fade rise wipe up down pop slam stamp slide drop fall flip grow appear`) · `data-at` thời điểm (ms) · `data-out` thời điểm biến mất · `data-em` nhấn (`pulse`, `teeter`) · `data-mv` đi thẳng · `data-m` tên Morph · `data-go` nhảy slide · `data-prop` chữ cố ý để làm ảnh · trên `<section>`: `data-trans`, `data-dur`, `data-auto`, `data-noclick`, `data-notes`.

Quy tắc khi viết cảnh mới trong `hinh/canh.js`:
1. Tên lớp CSS không được trùng `stage/stage.css` (test `tests/hinh.test.js` kiểm) — hai bên sẽ phá bố cục của nhau.
2. Màu lấy qua biến của `stage.css` (`--ink`, `--paper`, `--red`, `--amber`…) để bốn bảng màu áp được.
3. Xoay nghiêng dùng thuộc tính `rotate`, không dùng `transform: rotate()`.
4. Một vật vừa có `data-m` vừa có `data-a` chỉ được khi slide trước **không** có vật cùng tên (bộ dựng cảnh báo trường hợp ngược lại).
5. Đặt chỗ theo kích thước chữ (kính lúp, nét bút) phải làm trong `hinhKhiSanSang(...)` — lúc trang vừa tải, chữ còn ở font tạm.
6. Thêm type vào `TYPES`, viết ví dụ vào `examples/`, chạy `node --test tests/hinh.test.js` và dựng `--soat`.

## 8. Bộ hình riêng theo môn: "bảng bằng chứng" (hình sự) — `hinh/bang_chung.js`

Vì sao có: hình dán Fluent Emoji và nền của bảng màu chỉ là chất liệu chung, không nói gì về môn học; người dùng đã chê đúng điểm đó (phiên 12/11/2026). Bộ này **vẽ mới bằng SVG/CSS** theo một ẩn dụ — bảng bần của kíp điều tra: giấy ghim đinh đỏ, dây đỏ nối các điều luật, thẻ tang vật có lỗ xỏ dây, con dấu, vân tay mờ. Chữ vẫn là hộp chữ sửa được; hình là lớp ảnh rời. Viết cho môn khác: sao chép file, đổi ẩn dụ (vd. dân sự: hợp đồng + dấu giáp lai; lao động: bảng chấm công), giữ nguyên cách gắn nhãn (`data-t`, `data-l`, `data-pad`, `data-a`).

| type | Dùng cho | Trường chính (dùng lại trường của type thường tương ứng) |
|---|---|---|
| `bcbia` | Bìa | `kicker` `title` `subtitle` `stamp` `author` `authorSub` `date` `cites[{n,t}]` (≤ 3 điều luật nối dây đỏ) |
| `bccauhoi` | Mục lục / 3 câu hỏi (bấm nhảy) | `kicker` `title` `items[{q,go}]` |
| `bcchuong` | Mở chương | `num` `part` `title` `sub` (`partWord`) |
| `bctrich` | Trích nguyên văn điều luật | `head` `quote` (`[cụm nhấn]`) `art` `artLabel` `stamp` `source` |
| `bcso` | So hai điều / hai quy định | `left` `right` {`tag` `sub` `items[≤4]`} `focus` `mid{head,text}` |
| `bcbang` | Bảng tra cứu | `cols[{label}]` `rows[≤5][3 ô]` `focus` `note` |
| `bcnhanh` | Cây điều kiện | `root{q,src}` `branches[3]{when,head,text,tone}` `focus` `note` |
| `bctinhhuong` | Tình huống giả định (4 thẻ) | `items[{text: "tình huống → kết luận"}]` `source` |
| `bcdoiung` | Dấu hiệu ↔ tội danh | `pairs[≤5]{left,right,note}` `colL` `colR` `focus` `note` |
| `bccot` | Cột ô đếm (mỗi ô một đơn vị) | `cols[≤3]{n,unit,label}` `legend` `source` |
| `bcsolieu` | Một con số bước ngoặt | `num` `unit` `sub` `note` |
| `bcthang` | **Thang khung hình phạt**: mỗi bậc (giá trị, khoản) một hàng, mỗi tội một thanh từ mức thấp nhất đến cao nhất trên trục | `axis{max,unit,ticks}` `rows[≤5]{label,sub,bars[≤3]{name,min,max,text,ct}}` `focus` `order` ("up" mặc định: bậc đầu ở dưới) `note`; `ct: true` = "hoặc chung thân" |
| `bcdieukien` | Điều kiện cần (✓) + kết luận | `items[≤5]{head,src}` `verdict{text}` |
| `bcnhanqua` | Tình huống → con dấu → hệ quả | `cause{tag,text}` `stamp{text,sub}` `results[3]{text,ref}` `source` |
| `bchoi` | Trắc nghiệm: slide hỏi, rồi slide đáp án (`reveal: true`) | `title` `stem` `options[4]` `answer` `why` `whyNot[]` |
| `bcchot` | Chốt ý, trả lời lại các câu hỏi đầu giờ | `chips[≤3]{n,text,go}` `basis` |
| `bccamon` | Cảm ơn / hỏi đáp (không có thanh đầu) | `title` `message` `team[{name,role}]` `contact` |

- Mọi kiểu `bc*` dùng chung **tờ tiêu đề** (kicker + title một dòng, cỡ chữ tự co theo độ dài) và **dải chú thích** ở đáy cho `note` / `source`.
- Lề an toàn: nội dung trong vùng y 300–1040, x 110–1810. Tiêu đề ≤ ~54 ký tự (một dòng). Khối tự vẽ **không được máy đo tràn của `--soat` kiểm** — phải mở `soat-*.jpg` / `p-*.png` xem từng slide.
- Màu chữ trên nền bần là kem; chữ trên giấy là mực. Chữ kem đặt trên dải giấy (`.bc-strip`) đã có luật riêng — lỗi cũ: chú thích biến mất.

### Morph có chủ ý trong bộ `bc*` (và cách kiểm)
Lỗi đã gặp: Morph chỉ là "vân tay bay qua bay về". Nguyên nhân: PowerPoint chỉ ghép **chắc chắn** các hình có tên `!!tên` trùng ở hai slide liền nhau (bộ dựng đặt tên từ `data-m`); hình không có tên `!!` mà **trùng ảnh** thì PowerPoint tự đoán ghép — vân tay là cùng một ảnh ở vị trí khác nhau nên bay. Quy tắc:
1. Vật trang trí lặp (vân tay) đưa vào **nền** slide, không làm lớp ảnh. Dây đỏ đặt tên riêng từng slide (`s<i>-…`) rồi vào bằng hiệu ứng `wipe`, không để Morph kéo giãn.
2. Chuyển động có nghĩa dùng `data-m`: `tieu` — tờ lớn của bìa / chương thu nhỏ thành tờ tiêu đề của slide nội dung (và ngược lại); `chuong` — thẻ số to của slide mở chương thu thành thẻ nhỏ ở góc các slide trong chương, sang chương mới lớn lên thành thẻ kế tiếp (trường `ch` của slide nội dung); `pa1…pa4`, `de` — thẻ đáp án và đề giữ nguyên chỗ khi từ slide hỏi sang slide đáp án.
3. Phần tử là đích Morph **không** có `data-a` (hiệu ứng vào): lúc chuyển cảnh nó đang ẩn nên Morph không có gì để bay tới (bộ dựng báo `⚠`).
4. Chữ trong lớp có `data-m` tự ghép theo thứ tự (`tên-chu1`, `tên-chu2`…): giữ cùng thứ tự các hộp chữ ở hai slide (kicker rồi tiêu đề) thì chữ trượt từ chỗ này sang chỗ kia.
5. Kiểm khi không có PowerPoint: `python3 scripts/morph_cap.py file.pptx` in cặp Morph có chủ ý giữa mọi cặp slide kề nhau. Slide nào ghi "— (chỉ mờ dần …)" là chưa có chuyển động nào được thiết kế.

### Hai chế độ chuyển động của bộ `bc*` (`meta.bc`)
- **`"C"` (mặc định, khuyên dùng)** — **gọn**: không hiệu ứng vào nào; chỉ vài cặp Morph có nghĩa (`tieu`, `chuong`, `ranh`, `pa1`–`pa4`/`de`), 900 ms. Người dùng chê A "rất tệ" và B "rối mắt, gượng ép": nhiều thứ cùng động (rơi, nện, đóng dấu, lắc) + cặp ghép vô nghĩa. Quy tắc rút ra: hiệu ứng vào chỉ đáng giữ khi người xem thấy cần; cặp Morph phải có **nghĩa** (cùng một vật), không ghép hai vật khác nghĩa chỉ để có chuyển động.
- **`"A"`** — hiệu ứng vào phong phú, **không Morph** (đặt cùng `meta.hinh.chuyen: "fade"`): giấy rơi (xoay nhẹ) rồi **đinh nện xuống** (lớp riêng, hiệu ứng `slam`), dây đỏ chạy nối (`wipe`), **con dấu đóng** (lớp riêng, `stamp`), thẻ lắc sau khi rơi (`teeter`). Tờ tiêu đề vào nhẹ (`rise`). Chuyển giữa slide 450 ms.
- **`"B"`** (mặc định) — **nhân vật xuyên suốt** bằng Morph (`meta.hinh.chuyen: "morph"`, 1200 ms): ba tờ điều luật ở bìa lớn lên thành ba thẻ câu hỏi (`q1`–`q3`, kèm đinh `q1-pin`…); tờ bìa / chương ↔ tờ tiêu đề (`tieu`); thẻ số chương to ↔ thẻ nhỏ ở góc (`chuong`); thẻ "ranh giới" từ slide so sánh sang slide thang (`ranh`); thẻ đáp án giữ chỗ (`pa1`–`pa4`, `de`). Đích Morph không có hiệu ứng vào.
- Đinh và con dấu là **lớp ảnh riêng** (không nằm trong ảnh tờ giấy) để có hiệu ứng riêng; đinh được tính vị trí theo góc nghiêng của giấy, nên dây đỏ cũng bám đúng đinh.
- So sánh hai chế độ: dựng hai bản từ cùng `deck.json` chỉ khác `meta.bc` và `meta.hinh.chuyen`.

### Dàn nhân vật xuyên suốt — `bcsan` (cách dựng deck Morph đúng từ đầu)
Bài học (12/11/2026): dựng từng slide tĩnh rồi gắn Morph sau thì Morph chỉ nối được vài vật ngẫu nhiên và bị chê "đơn giản, xấu, rối, gượng ép". **Dựng dàn trước, bố cục sau.**
1. Chọn một câu chuyện và 3–5 nhân vật cố định (hình sự: A người cho vay, B người vay, túi tiền, đèn "ý định chiếm đoạt", tờ giải thích). Mỗi nhân vật có một "chìa" (`ca-A`, `ca-B`, `ca-tui`, `ca-yd`, `ca-expl`) dùng chung ở mọi slide.
2. Mỗi slide khai báo VỊ TRÍ MỚI của chính họ (`cast`, `expl`); nhân vật nào vắng thì mờ đi. Morph là "nhân vật dời chỗ" — luôn có nghĩa, không có cặp ghép vật khác nghĩa.
3. Nghĩa nằm ở vị trí: trục A — B là thời gian (trái = trước khi nhận tiền, phải = sau); đèn "ý định" trượt qua túi tiền từ trái sang phải = khác biệt giữa Điều 174 và 175.
4. Không hiệu ứng vào (chế độ `"C"`). Minh hoạ nhân vật vẽ bằng SVG trong code (`nguoi`, `tui`, `den`), không dùng hình dán có sẵn.
Trường: `cast{A,B:{x,y,w,rot,cap,sub,deco:"badge",mood}, tui:{x,y,w,rot,label}, yd:{x,y,w,rot,label,on}}` · `expl{x,y,w,h, lb,q,qs,n,nt | cols[{h,t}]}` · `noi[{who:"A"|"B",x,y,w,h,t,size}]` (bong bóng thoại) · `stamps[{x,y,t,rot,size,xanh}]` · `caps[{t,x,y,w,size}]` · `bia{…}` (bìa) · `ch` · `sag` · `dur` (ms, riêng từng lần chuyển).
- `mood` đổi nét mặt: `vui` · `gian` · `buon` · `xao` (xảo quyệt) · `nghi`. `yd.on:false` = đèn tắt (xám), mặc định sáng (đỏ, có tia).
- `noi` kể chuyện bằng lời thoại: tên Morph `ca-noi-A/B` (bóng dời chỗ/biến mất), chữ trong bóng không ghép từng chữ. Mỗi bước chỉ MỘT thay đổi lớn (túi sang phải, đèn sáng, nhân vật chạy khỏi khung) để mắt biết nhìn đâu; `dur` 1000–1300 ms cho bước lớn, ~700 ms cho bước nhỏ.
- `stamps` là con dấu điểm nhấn (vd. "Điều 174"): tên riêng từng slide nên xuất hiện cùng lúc chuyển cảnh, không ghép Morph.
- Cỡ chữ tối thiểu cho slide chiếu: câu giải thích ≥ 50 px nếu một dòng, ≥ 34 px với trích luật; bong bóng ≥ 40 px. Khung giải thích một dòng quá trống thì tăng cỡ chữ, đừng thu nhỏ khung giữa các slide (khung phải dời chỗ có nghĩa).

## 9. Bộ hình riêng theo môn: "bàn hội nghị quốc tế" (Công pháp quốc tế) — `hinh/hoi_nghi.js`

Vì sao có: bài "Tổng quan Công pháp quốc tế" (13/11/2026) dựng bằng type thường + hình dán bị chê "phông nền không liên quan gì đến luật quốc tế" — lỗi L10 lặp lần ba (xem `loi-da-biet-2026-11.md` mục E). Ẩn dụ: **phòng hội nghị đa phương** — luật do các bên tự thoả thuận và tự ký, chủ thể là ai được ngồi vào bàn, thi hành dựa vào cam kết.

| Lớp | Vật |
|---|---|
| Nền (mọi slide `qt*`) | Xanh đêm + **bản đồ thế giới bằng chấm** (`hinh/the_gioi_cham.json`, Natural Earth 1:110m, phạm vi công cộng, có Hoàng Sa, Trường Sa; dựng lại: `scripts/build_the_gioi_cham.py`) + lưới kinh–vĩ tuyến |
| Giấy | Văn kiện điều ước: giấy ngà, viền kép nhũ vàng; tờ tiêu đề slide nội dung là dải văn kiện có **dấu xi + dải lụa** ở đầu phải |
| Vật | Dấu xi đỏ (ngôi sao nổi hoặc số La Mã), hàng cờ trừu tượng, bàn họp, bảng tên phái đoàn, micro cổ ngỗng, cờ để bàn |

| type | Dùng cho | Trường |
|---|---|---|
| `qtbia` | Bìa: văn kiện + khối "Các bên ký tên" (người trình bày · lớp · ngày) + dấu xi + hàng cờ | `kicker` `title` (`[cụm nhấn]`) `subtitle` `author` `authorSub` `date` |
| `qtchuong` | Mở chương: trang văn kiện "Phần N" + dấu xi lớn mang số La Mã (giấy cao vừa chữ, căn giữa dọc) | `num` `part` `title` `sub` (`partWord`, mặc định "Phần") |
| `qtban` | 3–4 chủ thể / bên / yếu tố ngang hàng: bảng tên phái đoàn trên bàn họp | `kicker` `title` `items[≤4]{name(≤16), who(≤24, một dòng), desc(≤80)}` `focus` (bảng có vạch vàng) `note` |

- **Morph**: tờ văn kiện mang tên `tieu` ở cả ba kiểu (bìa → chương → nội dung trượt và co lại); dấu xi chương mang tên `chuong`. Không hiệu ứng vào (chế độ gọn, như `bc*` chế độ C).
- **Cấm**: biểu tượng Liên hợp quốc (bị hạn chế sử dụng — Nghị quyết 92(I) Đại hội đồng LHQ), quốc huy, cờ thật, chữ ký thật. Cờ chỉ dùng hình học trừu tượng: chéo góc, tam giác cán, ô góc cán — **không** hình tròn giữa nền trơn (đã ra lá giống cờ Nhật Bản), **không** sọc ngang / dọc 2–3 màu. Bản đồ có Việt Nam phải có Hoàng Sa, Trường Sa, kể cả bản đồ trang trí.
- **Còn thiếu** (deck dùng type thường cho các slide này, nên nền và khung chưa đồng bộ): so sánh hai bên, trích điều luật, thứ bậc, cây điều kiện, chuỗi hệ quả, danh sách nguyên tắc, trắc nghiệm, chốt ý, cảm ơn. Hướng sửa gốc: "da theo môn" — mục E3-P3 của `loi-da-biet-2026-11.md`.
- Ví dụ: `examples/hoi-nghi-qt/deck.json` (3 slide). Dựng: `node hinh/dung.js examples/hoi-nghi-qt/deck.json /tmp/qt.pptx --soat`.
