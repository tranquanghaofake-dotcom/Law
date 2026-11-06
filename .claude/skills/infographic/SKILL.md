---
name: infographic
description: Tạo infographic pháp luật tiếng Việt khổ A4 để in, từ con số 0 đến PDF — hoặc chấm/chữa một infographic có sẵn. Dùng khi người dùng muốn làm infographic, poster/áp phích phổ biến pháp luật, tờ rơi tuyên truyền, "một trang tóm tắt" bằng hình. Quy trình 7 bước: brief → kiểm chứng luật → chọn dạng hình → bố cục → dựng HTML/SVG với ý tưởng hình ảnh + icon + nhân vật → xuất PDF A4 → tự kiểm bằng script và checklist.
---

# Infographic pháp luật A4 — từ A đến Z

Infographic tốt = **một thông điệp** + **một hình chính chở thông điệp đó** + **nội dung đúng luật**.
Poster nhiều chữ chia ô màu **không phải** infographic. Lỗi nội dung không sửa được bằng màu đẹp — làm đúng thứ tự 7 bước.

File này là **nguồn duy nhất** của skill. Thư mục đi kèm:
```
styles/_base.css      khung A4 + CSS mọi khối (dùng chung)
styles/<ten>.css      MỘT STYLE = token màu, font, trang trí (dòng đầu = mô tả + chủ đề hợp)
blocks/<ten>.html     MỘT KHỐI BỐ CỤC = đoạn HTML mẫu (dòng đầu = mô tả + khi nào dùng)
scripts/new.mjs       ráp bài mới: style + danh sách khối → index.html, ke-hoach.md, nguon.md
scripts/assets.mjs    tải icon Lucide / nhân vật Notionists; avatar-sheet để chọn đúng vai
scripts/icons.mjs     chèn icon (data-icon) và minh họa tự vẽ (data-illus) vào HTML
scripts/render.mjs    xuất PNG + PDF A4, tự kiểm bố cục
scripts/contrast.mjs  đo tương phản WCAG
assets/icons|avatars|illustrations   asset đã tải/tự vẽ (+ LICENSES.md)
examples/<slug>/      bài đã làm (mỗi bài: index.html, ke-hoach.md, nguon.md, infographic.png/.pdf)
```

## Quy trình đầy đủ (8 pha) — dùng cho mọi chủ đề, mọi style

| Pha | Việc | Ra gì |
|---|---|---|
| 0. Kế hoạch | `node scripts/new.mjs --list` xem style/khối; chọn hoặc quyết định tạo mới; `new.mjs <slug> --style … --blocks …` | thư mục bài + `ke-hoach.md` |
| 1. Tìm hiểu | Đọc nguyên văn luật (Bước 2); tìm nhóm mặc định của người đọc và các ngách; liệt kê **thế giới hình ảnh** của chủ đề (đồ vật, giấy tờ, nơi chốn) | `ke-hoach.md` mục 2, `nguon.md` |
| 2. Chọn hình | Hình dạng nội dung → khối (Bước 3); chọn **một** khối làm hình chính; sắp thứ tự đọc | `ke-hoach.md` mục 3 |
| 3. Style | Dùng style có sẵn nếu hợp; nếu không → tạo style mới (mục "Thêm nhanh" dưới) từ thế giới hình ảnh ở pha 1 | `styles/<ten>.css` |
| 4. Asset | `assets.mjs icon …`; `assets.mjs avatar-sheet …` rồi chọn seed hợp vai; vẽ 1 minh họa SVG riêng cho chủ đề nếu cần (`assets/illustrations/`, dùng `currentColor`) | file trong `assets/` |
| 5. Dựng | Điền `index.html` từ khung đã ráp; chữ theo Bước 4–5; CSS riêng của bài giữ ngắn | `index.html` |
| 6. Kiểm | `icons.mjs` → `render.mjs` ("bố cục ổn") → `contrast.mjs` → soát mắt người (Bước 7) → phản biện độc lập nếu bài quan trọng | PNG, PDF |
| 7. Thu hoạch | Thứ gì dùng lại được (khối mới, style mới, quy tắc mới, lỗi mới) → đưa vào thư viện / checklist trong file này | thư viện lớn dần |

## Khi đề tài lạ, thư viện không có bản hợp — tự nghiên cứu và tạo mới

Chạy chen giữa pha 1 và pha 4. Ghi mọi quyết định vào `ke-hoach.md` (mục "Tạo mới").

**A. Kiểm độ hợp (5 phút) — quyết định dùng lại hay tạo mới**
- Style hợp khi **≥ 2/3 vật trang trí** của nó có thật trong thế giới đề tài (vd. `ban-ve` hợp thuê trọ: mặt bằng, kích thước, khung tên đều thuộc nhà ở). Dưới 2/3 → tạo style mới. Chỉ "màu hợp" không đủ.
- Khối hợp khi **hình dạng dữ liệu** khớp bảng Bước 3. Dữ liệu có hình dạng chưa có (bản đồ, sơ đồ quan hệ nhiều bên, lịch tháng, ma trận rủi ro…) → tạo khối mới.

**B. Nghiên cứu thế giới hình ảnh (15–20 phút)**
1. Liệt kê 10 thứ người đọc **thấy tận mắt** khi gặp vấn đề này: giấy tờ, đồ vật, nơi chốn, màn hình app, biển hiệu. (Thuế → tờ khai, hóa đơn, app eTax; giao thông → biển báo, vạch kẻ, giấy phép lái xe.)
2. Tra ảnh thật của 3–4 thứ tiêu biểu (web search) và ghi đặc điểm thị giác: màu chủ, chất liệu giấy, kiểu chữ, khung viền, ký hiệu lặp lại.
3. Chọn **1 vật chủ đạo** (thành khung trang + hình chính) và **2 vật phụ** (trang trí, ghi chú). Vật chủ đạo phải **chở được dữ liệu**: lịch chở ngày, hóa đơn chở tiền, biển báo chở cấm/được, bản đồ chở nơi chốn.
4. Không mô phỏng giấy tờ thật đến mức giả được: không quốc huy, không con dấu cơ quan, không logo thương hiệu, không số hiệu biểu mẫu thật.

**C. Dựng style từ vật chủ đạo**
- 4–6 màu lấy từ vật thật → gán vào token theo nghĩa (`--info --good --bad --accent`); chạy `contrast.mjs` sớm.
- Font có tiếng Việt, hợp chất liệu: Be Vietnam Pro (trung tính), Barlow / Barlow Condensed (kỹ thuật), Lexend (dễ đọc, thân thiện), Roboto Slab (giấy tờ, văn bản), Nunito (trẻ em), Patrick Hand / Pangolin (viết tay). Kiểm dấu tiếng Việt bằng ảnh render, không tin tên font.
- Trang trí: tối đa 2 chi tiết đặc trưng của vật chủ đạo (vd. hóa đơn: mép răng cưa + đường chấm cắt).

**D. Tạo khối mới nếu cần**
- Phác ASCII trong `ke-hoach.md` trước khi code; khối mới phải đọc đúng khi in đen trắng thu nhỏ.
- Code theo quy tắc "Thêm nhanh" dưới; thử bằng chính bài đang làm.

**E. Asset theo vật chủ đạo**
- Icon: lập danh sách theo từng khối rồi `assets.mjs icon …`.
- Nhân vật: chỉ khi đề tài có người; `assets.mjs avatar-sheet` rồi chọn đúng vai (tuổi, nghề).
- **1 minh họa SVG tự vẽ** của vật chủ đạo (`assets/illustrations/`, nét `currentColor`, ≤ 40 dòng) — làm cho trang có chất riêng mà không tốn ảnh có bản quyền.

**F. Kiểm "mới thật hay chỉ đổi màu"**
- Che chữ, chỉ nhìn hình: người lạ có đoán ra đề tài không?
- Đặt cạnh 3 bài cũ: nếu khác nhau chỉ ở màu → chưa đạt, quay lại B.
- Hình chính có phải là vật chủ đạo đang chở dữ liệu không, hay chỉ là trang trí?

**G. Thu hoạch**: style/khối/minh họa mới vào thư viện; thêm 1 dòng vào bảng "Ý tưởng hình ảnh" (Bước 5a) và mục "Thư viện hiện có".

## Thêm nhanh style, khối, chủ đề

- **Style mới** (≈ 15 phút): tạo `styles/<ten>.css`. Dòng 1: `/* ten: mô tả — vật liệu, trang trí. Hợp: chủ đề… */`. Bên trong chỉ: `@import` font (có tiếng Việt), ghi đè token `:root` (`--paper --ink --muted --line --soft --info --good --bad --accent --font --font-display --radius --pad-left`), nền `.sheet`, trang trí (`::before/::after`), cách vẽ `.secno`, `.head`. Không đụng bố cục khối. `new.mjs --list` tự thấy.
- **Khối mới**: tạo `blocks/<ten>.html` (dòng 1: `<!-- ten: mô tả | khi nào dùng -->`, dùng `<div class="secno" data-margin>`), thêm CSS của khối vào `styles/_base.css` với tiền tố riêng, dùng token chứ không dùng mã màu. **Không** đặt tên lớp trùng biến thể có sẵn (`.ok/.no/.yes/.maybe/.hot` là biến thể, không phải khối).
- **Chủ đề mới**: thêm 1 dòng vào bảng "Ý tưởng hình ảnh" (Bước 5a) và, nếu có lỗi luật mới gặp, 1 dòng vào checklist pháp lý (Bước 2).
- Thư viện hiện có — style: `vo-o-li` (học đường), `so-cham-cong` (lao động), `ban-ve` (nhà ở, thủ tục có thời hạn). Khối: `head, tiles, bars, meter, cases, says, flow, timeline, compare, tree, notes, sign`.

---

## Bước 1 — Brief (viết ra trước khi làm)

1. **Người đọc** là ai, bao nhiêu tuổi, đọc ở đâu?
2. **Một câu** đọc xong phải nhớ → tiêu đề.
3. **Một hành động** đọc xong phải làm → khối cuối (số điện thoại, bước làm).
4. **Khổ: luôn A4 dọc.** `.sheet` = 1080×1528 px = 210×297 mm (1 mm ≈ 5,14 px). Nội dung cách mép ≥ 52 px (~10 mm). Mặc định **in màu trên bìa cứng**; chỉ khi người dùng nói sẽ photo đen trắng mới áp quy tắc bản xám (Bước 7).
5. **Giọng** và có dùng nhân vật minh họa không.

Người dùng không trả lời → tự chọn mặc định hợp lý, ghi giả định ở đầu câu trả lời.

## Bước 2 — Kiểm chứng luật (bắt buộc)

- Mỗi khẳng định = **văn bản + số hiệu + điều/khoản/điểm + tình trạng hiệu lực**. Tra vbpl.vn, congbao.chinhphu.vn; ưu tiên **văn bản hợp nhất** mới nhất. Đọc **nguyên văn cả điều**, không chỉ khoản mình cần — ngoại lệ và tình tiết định khung thường nằm ở khoản bên cạnh.
- Ghi `nguon.md` cạnh HTML: khẳng định → căn cứ → link → ngày đối chiếu → giả định. **Không in** bảng này; trên trang chỉ giữ số điều cạnh khối liên quan.
- Không chắc → không đưa lên hình. Không bịa số hiệu.
- Soát **từng mục** của checklist dưới đây trước khi dựng hình.

### Checklist pháp lý (mỗi mục kèm lỗi thật đã gặp)

**A. Trích dẫn**
- [ ] Đúng loại văn bản: **Bộ luật** Dân sự / Hình sự / Lao động (lỗi đã gặp: "Luật Dân Sự 2015").
- [ ] Có số hiệu: BLDS 91/2015/QH13; BLHS 100/2015/QH13 (hợp nhất 135/VBHN-VPQH 2025); BLLĐ 45/2019/QH14 (hợp nhất 125/VBHN-VPQH 2025); Luật Trẻ em 102/2016/QH13.
- [ ] Mỗi ý gắn **đúng** điều của nó (lỗi đã gặp: mức phạt của Điều 155 đặt dưới căn cứ Điều 134).
- [ ] Nguyên văn thì ngoặc kép, chép đúng; tóm tắt thì không giả làm nguyên văn; không thu hẹp phạm vi ("người học" ≠ "học sinh").
- [ ] Phạm vi văn bản khớp đối tượng (lỗi đã gặp: Thông tư 38/2019/TT-BLĐTBXH — chỉ cho giáo dục nghề nghiệp — dẫn như quy định chung).
- [ ] Cơ quan ban hành còn tồn tại/đổi tên chưa (vd. Bộ LĐTBXH hợp nhất vào Bộ Nội vụ năm 2025).

**B. Mốc, ngưỡng số**
- [ ] Viết theo ngôn ngữ luật: "chưa đủ 15", "từ đủ 15 đến chưa đủ 18", "từ đủ 18"; không dùng `<15`, `15<X<18` (bỏ sót đúng mốc).
- [ ] Không trộn hai bộ mốc khác hệ (dân sự 15/18 — Điều 586 BLDS; hình sự 14/16 — Điều 12 BLHS); đặt chung thì tách 2 hàng.
- [ ] Phạm vi hẹp phải nói rõ: 14–dưới 16 tuổi chỉ chịu TNHS tội rất nghiêm trọng trở lên **trong 28 điều liệt kê**; từ đủ 16 "mọi tội phạm, trừ tội mà Bộ luật có quy định khác".
- [ ] **Tình tiết định khung đẩy khung lên**: ngưỡng không chỉ là con số. Điều 134: 31–60% + tình tiết khoản 1 (bị hại dưới 16 tuổi, hung khí, côn đồ…) → khoản 3 điểm c, tội rất nghiêm trọng. Trong trường học mốc thực tế là 31%, không phải 61% (lỗi đã gặp: thanh đo chỉ vạch 61%).
- [ ] Nhóm mặc định của người đọc: kiểm xem người đọc điển hình rơi vào nhóm nào của điều luật (vd. việc làm thêm của sinh viên thường là "công việc khác" → thử việc tối đa 6 ngày làm việc, không phải 30/60 ngày).
- [ ] Cách tính: tuổi tròn theo ngày sinh (không phải tuổi mụ); "ngày làm việc" khác "ngày".

**C. Chủ thể, cơ chế trách nhiệm**
- [ ] Phân biệt **liên đới / bổ sung phần còn thiếu / thay thế**; không viết "cùng chịu" khi luật chỉ cho bù phần thiếu (lỗi đã gặp ở Điều 586).
- [ ] Không đánh đồng cha mẹ với người giám hộ (khoản 3 Điều 586).
- [ ] Nêu ngoại lệ, miễn trừ (vd. khoản 3 Điều 599: trường không có lỗi thì không bồi thường).
- [ ] Điều kiện thủ tục đặc biệt (vd. khoản 1 Điều 155 BLHS chỉ khởi tố khi bị hại yêu cầu).
- [ ] Tuổi chủ thể của từng tội.

**D. Thuật ngữ**
- [ ] Tên hình phạt đúng Điều 32 BLHS (lỗi đã gặp: "cải tạo giam giữ" — không tồn tại).
- [ ] Liệt kê đủ lựa chọn trong khung (vd. khoản 1 Điều 155 có "cảnh cáo").
- [ ] Tên tội đúng nguyên văn.

**E. Bức tranh tổng thể**
- [ ] Không bỏ tầng phổ biến nhất (kỷ luật nội bộ, xử phạt hành chính); không trình bày thì ghi phạm vi.
- [ ] Nói rõ điều gì áp dụng cho chính người đọc; không dọa sai, không trấn an sai.
- [ ] Văn bản mới có thể đổi cách xử lý (vd. Luật Tư pháp người chưa thành niên 59/2024/QH15, hiệu lực 01/01/2026).
- [ ] Dòng miễn trừ: "thông tin pháp luật phổ thông, không thay thế tư vấn pháp lý".

## Bước 3 — Chọn dạng hình theo hình dạng của nội dung

Bố cục quyết định cấu trúc, phong cách chỉ là lớp áo (ý tưởng layout × style của baoyu-infographic). Mỗi trang có **đúng một hình chính** chiếm 35–50% diện tích.

| Nội dung có dạng… | Hình chính | Ví dụ |
|---|---|---|
| Ngưỡng, mốc (tuổi, tiền, ngày) | **Thước / trục mốc** | tuổi chịu trách nhiệm; thời hạn thử việc |
| Tỉ lệ so với ngưỡng | **Thanh đo** có vạch ngưỡng | tỉ lệ thương tật 31%/61%; lương 85% |
| Diễn biến thời gian | **Dòng thời gian / lịch** | tiến trình tố tụng |
| Các bước tuần tự | **Ô nối mũi tên** (≤ 5 bước) | gặp sự việc thì làm gì |
| Điều kiện "nếu… thì…" | **Cây quyết định** | có phải chịu TNHS không |
| 2–4 phương án | **So sánh / ma trận** | TNHH vs cổ phần |
| Thứ bậc | **Kim tự tháp** | hiệu lực văn bản QPPL |
| Khái niệm + yếu tố | **Hub–spoke** | 4 yếu tố cấu thành tội phạm |
| Liệt kê thuần | **Ô hình** (yếu nhất) | các dạng hành vi |

Gợi ý kết hợp: thước + 3 tình huống áp vào thước; cây quyết định + khối hành động.

## Bước 4 — Bố cục và "hình thay chữ"

Dàn ý theo thứ tự mắt đọc (trên → dưới, trái → phải); số thứ tự mục = thứ tự đọc:
```
[Nhãn tiêu đề + nhân vật]        ~14%
[Bài 1: khái niệm bằng ô hình]   ~12%
[Bài 2: HÌNH CHÍNH + 2 ghi chú]  ~38%
[Bài 3: 3 tình huống]            ~24%
[Bài 4: hành động]               ~10%
[Ký tên + miễn trừ 1 dòng]       ~2%
```
**Mỗi khối ≤ 25 từ.** Trước khi viết một câu, hỏi "vẽ được không?":
- Danh sách → ô hình (icon tròn + nhãn ≤ 6 từ).
- Mốc, ngưỡng → thước, thanh đo có vạch.
- Kết luận có/không → **con dấu** (CÓ THỂ / KHÔNG / TỰ TRẢ / SAI LUẬT) kèm icon.
- Quy trình → ô nối mũi tên; chuỗi sự việc → icon → icon → icon.
- Tình huống → nhân vật + nhãn tuổi/vai + hành động 1 dòng + con dấu + số điều nhỏ.
- Chữ còn lại chỉ cho: tiêu đề, nhãn, số điều, ghi chú "dễ nhầm".

## Bước 5 — Dựng HTML/CSS/SVG

Ráp khung bằng `scripts/new.mjs` (pha 0), rồi thay nội dung. `templates/base.html` và hai bài đầu (`bao-luc-hoc-duong`, `thu-viec`) là bản tự đứng, viết trước khi có thư viện — xem để học, không cần sao chép.

**5a. Ý tưởng hình ảnh lấy từ thế giới của chủ đề** (không lấy từ mẫu SaaS):

| Chủ đề | Ý tưởng | Vật trang trí |
|---|---|---|
| Học đường | Trang vở ô li | nhãn vở, lề đỏ, lỗ gáy, thước kẻ, bút đỏ, giấy nhớ |
| Lao động, việc làm | Bảng chấm công / phiếu lương | ô ngày, thẻ nhân viên, phong bì lương |
| Hợp đồng, doanh nghiệp | Hồ sơ giấy tờ | kẹp giấy, tab hồ sơ, chữ ký |
| Tố tụng, thời hạn | Lịch / đồng hồ | tờ lịch xé, ngày khoanh tròn |
| Đất đai | Bản đồ địa chính | lưới tọa độ, thửa đất, la bàn |
| Nhà ở, thuê trọ, xây dựng | Bản vẽ kỹ thuật (style `ban-ve`) | khung bản vẽ, khung tên, đường kích thước, mặt bằng phòng |
| Tiêu dùng, mua bán | Hóa đơn, biên lai | mép răng cưa, mã vạch, dòng tổng tiền |
| Giao thông | Biển báo, bản đồ đường | biển tròn/tam giác, vạch kẻ đường |

Quy tắc: (1) hình chính được **vật thể hóa** (thước tuổi = cây thước thật; thời hạn = tờ lịch); (2) mỗi khối 1 icon đúng nghĩa; (3) tình huống có nhân vật để người đọc tự đặt mình vào; (4) tối đa 2 vật "tay làm" (giấy nhớ, con dấu) đặt ở chỗ cần nhấn; (5) nền có kết cấu nhẹ nhưng chữ luôn trên nền trơn; (6) dồn sự táo bạo vào **một** chỗ — hình chính.

**5b. Chữ**
- 1 họ font hỗ trợ tiếng Việt chuẩn: **Be Vietnam Pro** (OFL); chữ viết tay cho ghi chú: **Patrick Hand** (OFL).
- Thứ bậc: tiêu đề 40–48 px; tiêu đề mục 24 px; nhãn 15–18 px; nhãn phụ ≥ 12,5 px (≈ 7 pt in). Tối đa 4 cỡ.
- Không `letter-spacing` dương với chữ có dấu; không đoạn VIẾT HOA dài (chỉ nhãn ≤ 3 từ như con dấu); không dấu cách trước `! ? : ;`; line-height thân ≥ 1.3.

**5c. Màu**
- Biến CSS trên `:root`; ≤ 3 màu chức năng, mỗi màu một nghĩa cố định (vd. đỏ = hình sự/sai luật, xanh = dân sự/quyền lợi, vàng = hành động).
- Tương phản chữ ≥ 4.5:1 (chữ ≥ 24 px hoặc ≥ 18,66 px đậm: ≥ 3:1). Không chữ vàng/hồng nhạt trên nền nhạt.
- Màu không là kênh duy nhất: mỗi nhóm có icon riêng (giúp cả người mù màu).
- Màu nền quá nhạt có thể mất khi in → chỉ dùng cho trang trí.

**5d. Tránh dáng "máy làm"**
- Không tô màu riêng một chữ trong tiêu đề; không nhãn VIẾT HOA giãn chữ trên mỗi mục; không chuỗi "A · B · C".
- Không bộ thẻ bo góc giống hệt nhau cho mọi thứ — thanh, con dấu, giấy nhớ, ô hình mỗi loại một hình dạng theo vai trò.
- Không gạch chân để nhấn (giống link); một kiểu nhấn mạnh duy nhất.
- Đánh số (Bài 1…) chỉ khi nội dung là trình tự đọc thật.

**5e. Asset** (tải bằng `scripts/assets.mjs`)
- Icon: viết `<span class="ico" data-icon="gavel"></span>` rồi chạy `scripts/icons.mjs` (sửa tại chỗ, chạy lại được). Tra tên ở lucide.dev/icons; tải thêm theo `assets/LICENSES.md`.
- Nhân vật: `assets/avatars/notionists-<seed>.svg`; tải seed mới từ DiceBear, lưu về máy (không nhúng link API).
- Không ảnh không rõ giấy phép, logo cơ quan, quốc huy, con dấu thật.

## Bước 6 — Xuất

```bash
node .claude/skills/infographic/scripts/icons.mjs  <index.html>
node .claude/skills/infographic/scripts/render.mjs <index.html>          # thêm --gray nếu sẽ photo đen trắng
node .claude/skills/infographic/scripts/contrast.mjs <index.html>
```
Ra `infographic.png` (xem) và `infographic.pdf` (**A4 đúng khổ, đem in**). Chromium: dùng `PW_CHROMIUM` nếu có, không thì tự thử `/opt/pw-browsers/chromium`.

## Bước 7 — Tự kiểm (không bỏ qua)

1. **Script**: `render.mjs` phải in "bố cục ổn" — nó bắt: tràn khổ A4, sai tỉ lệ, chữ cách mép < 52 px, chữ đè chữ, chữ tràn/chạm viền khung. Ngoại lệ có chủ đích: `data-margin` (nhãn ở lề, ngưỡng 26 px), `data-free` (nhãn cố ý nằm ngoài khung). `contrast.mjs` phải 0 FAIL.
2. **Mắt người** (script không bắt được): mở PNG, đọc như người lần đầu thấy:
   - [ ] 5 giây: nói lại được thông điệp chính.
   - [ ] Hình chính mang dữ liệu, chiếm 35–50%; thu nhỏ 25% vẫn nhận ra.
   - [ ] Thứ tự đọc khớp số mục; khoảng trắng giữa khối > trong khối.
   - [ ] Mỗi khối ≤ 25 từ; không chữ xuống dòng xấu (1 chữ mồ côi, nhãn bị bẻ đôi).
   - [ ] Mọi con số/ngưỡng có nhãn giải thích (không có "61%" trơ trọi).
   - [ ] Hình có tỉ lệ thì tỉ lệ phải đúng (dải 180 ngày không được dài bằng dải 60); hai đơn vị khác nhau ("ngày" và "ngày làm việc") phải ghi rõ, không ngầm so sánh.
   - [ ] Nhóm của người đọc đặt **đầu tiên** trong hình chính; màu nhấn của nhóm đó không trùng màu "sai luật".
   - [ ] Nhân vật hợp vai (sinh viên trẻ, chủ quán lớn tuổi hơn); không lặp một nhân vật nhiều lần vô ích.
   - [ ] Có khối hành động cụ thể; mọi dấu `*` có chú thích.
   - [ ] Không chữ đè vật trang trí (lề, lỗ gáy, nét kẻ).
3. **Phản biện độc lập** (khi được yêu cầu hoặc với bài quan trọng): giao 2 người/agent đọc **chỉ PNG + nguon.md**, không kèm kết luận của mình — một người soát luật (đối chiếu nguyên văn), một người soát thiết kế. Tìm "ngách": chỗ người đọc điển hình hiểu sai, ngoại lệ bị bỏ, nhóm mặc định sai.
4. **In thử 1 tờ** trước khi in số lượng: màu trên giấy tối và đục hơn màn hình.
5. Báo cáo: ảnh/PDF, các giả định, điểm còn "cần kiểm tra".

## Khi được nhờ chấm infographic có sẵn

Kết luận trước. Rồi: (1) lỗi pháp lý — bảng "bạn viết / đúng là / mức độ"; (2) lỗi thiết kế theo Bước 5 và 7; (3) đề xuất hình chính tốt hơn.

## Nguồn tham khảo của skill (đọc 06/11/2026)

- jimliu/baoyu-skills — `baoyu-infographic` (MIT): tách layout × style, danh mục bố cục.
- k-dense-ai/scientific-agent-skills — `infographics` (MIT): thứ bậc 3 tầng, vòng tự chấm.
- antvis/infographic (MIT): infographic khai báo dữ liệu → template → SVG.
- Skill `frontend-design`, `dataviz` (Anthropic): tránh bố cục rập khuôn, token màu.
- WCAG 2.1 SC 1.4.3, 1.4.11: ngưỡng tương phản. Tufte: mọi nét vẽ phải mang thông tin.
- Lucide (ISC), DiceBear Notionists của Zoish (CC0), Be Vietnam Pro và Patrick Hand (OFL).
