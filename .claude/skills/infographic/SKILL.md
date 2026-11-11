---
name: infographic
description: "Use when the user wants an A4 legal infographic in Vietnamese made from scratch to a print-ready PDF — infographic pháp luật, poster/áp phích phổ biến pháp luật, tờ rơi tuyên truyền, bảng tóm tắt một trang bằng hình cho một quy định, thủ tục, mốc tuổi, thời hạn, mức phạt — or wants an existing infographic reviewed, graded or fixed (sai luật, nhiều chữ, bố cục rối, tràn khổ, tương phản kém). Also matches unaccented requests (lam infographic, ap phich phap luat, to roi tuyen truyen, tom tat mot trang). Not for slide decks (use slide-chuan), motion video (use motion-video), or data dashboards."
---

# Infographic pháp luật A4 — từ A đến Z

Infographic tốt = **một thông điệp** + **một hình chính chở thông điệp đó** + **nội dung đúng luật**.
Poster nhiều chữ chia ô màu **không phải** infographic. Lỗi nội dung không sửa được bằng màu đẹp — làm đúng thứ tự 7 bước.

File này là xương sống của skill; `references/tao-moi.md` chỉ mở khi phải tạo style hoặc khối mới; `references/san-khau.md` mở trước khi dựng áp phích (style mặc định); `references/do-hoa.md` mở khi cần hình dán, hình đếm, biểu đồ hoặc một ngôn ngữ áp phích khác. Thư mục đi kèm:
```
styles/_base.css      khung A4 + CSS mọi khối (dùng chung)
styles/<ten>.css      MỘT STYLE = token màu, font, trang trí (dòng đầu = mô tả + chủ đề hợp)
blocks/<ten>.html     MỘT KHỐI BỐ CỤC = đoạn HTML mẫu (dòng đầu = mô tả + khi nào dùng)
scripts/new.mjs       ráp bài mới: style + danh sách khối → index.html, ke-hoach.md, nguon.md (--out: ra thư mục làm việc)
scripts/assets.mjs    tải icon Lucide / hình dán Fluent Emoji / nhân vật Notionists; avatar-sheet để chọn đúng vai
scripts/icons.mjs     chèn icon (data-icon), minh họa (data-illus), hình dán (data-emo), hình đếm (data-dem) vào HTML
scripts/bieu-do.mjs   sinh biểu đồ, sơ đồ SVG từ dữ liệu (ECharts, AntV) vào assets/illustrations/
scripts/render.mjs    xuất PNG + PDF A4, tự kiểm bố cục
scripts/contrast.mjs  đo tương phản WCAG
assets/icons.json, emoji.json   kho gộp 84 icon, 199 hình dán (tên → SVG); assets/avatars|illustrations: file lẻ (+ LICENSES.md)
examples/<slug>/      bài mẫu của thư viện (mỗi bài: index.html, ke-hoach.md, nguon.md, infographic.png; PDF sinh lại bằng render.mjs)
references/tao-moi.md tạo style, khối mới khi thư viện không hợp đề tài
references/san-khau.md công thức áp phích mặc định: năm dải cảnh, ngân sách chữ, bảng màu, khối sk-*
references/do-hoa.md  bảng chọn đồ hoạ, hình dán, khối vật thật, biểu đồ, các ngôn ngữ áp phích khác
scripts/kiem_tra_skill.py  kiểm cấu trúc chính skill này sau khi sửa
scripts/dong_goi.py   đóng zip tải lên claude.ai (gộp icon, hình dán; dừng nếu quá 200 file)
```

## Môi trường chạy

- Cần: Node 18+, gói `playwright` có Chromium (script tự thử `PW_CHROMIUM`, rồi `/opt/pw-browsers/chromium`), mạng tới Google Fonts. Tải asset mới cần mạng tới unpkg.com, api.iconify.design và api.dicebear.com; asset đã có trong `assets/` dùng offline.
- Thiếu Playwright (vd. môi trường chat không cài được): vẫn làm đủ pha 0–5 và tự kiểm bằng mắt; giao file `index.html` (đã chạy `icons.mjs` hoặc chèn SVG tay) để người dùng mở bằng Chrome → In → khổ A4, lề "Không", bật "Đồ họa nền" → Lưu PDF. Nói rõ bước tự kiểm bằng script chưa chạy.
- `scripts/…` trong các lệnh dưới đây tính từ thư mục chứa file này (gọi là `<skill>`); chạy từ nơi khác thì viết đủ `node <skill>/scripts/…`.
- **Bài của người dùng luôn tạo bằng `new.mjs … --out <thư mục làm việc>`**: bài tự đứng (kèm `styles/`, `assets/`), không ghi gì vào thư mục skill. Thư mục skill có thể chỉ-đọc hoặc bị xoá sau phiên (claude.ai, skill đồng bộ từ tài khoản); icon, nhân vật mới tải bằng `assets.mjs … --to <thư mục bài>`. Không `--out` chỉ dùng khi thêm bài mẫu vào `examples/` của chính skill.

## Hai tầng đầu ra — chọn trước khi dựng

| Tầng | Style | Dùng khi |
|---|---|---|
| **Áp phích** (mặc định) | **`san-khau`**; kiểu phụ `co-dong`, `giay-cat`, `thuy-si`, `so-tay`, `tuyen-duong` | dán tường, đăng mạng, phổ biến pháp luật, mọi bài cần người lạ dừng lại đọc; người dùng không nói gì thì chọn tầng này, style `san-khau` |
| Tờ hướng dẫn | `vo-o-li`, `so-cham-cong`, `ban-ve`, `container` | tờ phát kèm bài giảng, bảng tra dán sổ, nội dung dày cần đọc chậm |

**Áp phích dựng bằng `san-khau`**: nền đêm, chữ Anton trắng và vàng, vật chủ đạo ≥ 250 px, dữ liệu thành ô đếm được, cả trang ≤ 170 chữ, bốn bảng màu `son, luc, lam, nau`. Ráp: `node scripts/new.mjs <slug> --style san-khau --mau <bảng màu> --blocks sk-mo,…,sk-ket --out <thư mục>`. Công thức năm dải cảnh, bảng chọn khối `sk-*`, luật và lỗi đã gặp: `references/san-khau.md` — đọc trước khi dựng. Bài mẫu: năm thư mục `examples/*-san-khau/`.

Luật chung của mọi ngôn ngữ áp phích: một khối đầu trang chiếm 25–30%; một vật chủ đạo mang dữ liệu thật; số cỡ áp phích cho mọi dữ liệu; một ngôn ngữ nét duy nhất; vật xoay gắn `data-tilt`, chữ số cỡ lớn gắn `data-big`. Kiểu phụ chỉ dùng khi người dùng yêu cầu hoặc `san-khau` không hợp (bảng chọn: `references/do-hoa.md` mục 5).

## Quy trình đầy đủ (8 pha) — dùng cho mọi chủ đề, mọi style

| Pha | Việc | Ra gì |
|---|---|---|
| 0. Kế hoạch | Brief (Bước 1); `node scripts/new.mjs --list` xem style/khối; chọn hoặc quyết định tạo mới; `node scripts/new.mjs <slug> --style … --blocks … --out <thư mục làm việc>` | thư mục bài + `ke-hoach.md` |
| 1. Tìm hiểu | Đọc nguyên văn luật (Bước 2); tìm nhóm mặc định của người đọc và các ngách; liệt kê **thế giới hình ảnh** của chủ đề (đồ vật, giấy tờ, nơi chốn) | `ke-hoach.md` mục 2, `nguon.md` |
| 2. Chọn hình | Hình dạng nội dung → khối (Bước 3); chọn **một** khối làm hình chính; sắp thứ tự đọc | `ke-hoach.md` mục 3 |
| 3. Style | Dùng style có sẵn nếu hợp; nếu không → tạo style mới theo `references/tao-moi.md` từ thế giới hình ảnh ở pha 1 | `styles/<ten>.css` |
| 4. Asset | `assets.mjs icon …` hoặc `emoji …`; `assets.mjs avatar-sheet …` rồi chọn seed hợp vai; vẽ 1 minh họa SVG riêng cho chủ đề nếu cần (`assets/illustrations/`, dùng `currentColor`), hoặc sinh biểu đồ bằng `bieu-do.mjs` | file trong `assets/` |
| 5. Dựng | Điền `index.html` từ khung đã ráp; chữ theo Bước 4–5; CSS riêng của bài giữ ngắn | `index.html` |
| 6. Kiểm | `icons.mjs` → `render.mjs` ("bố cục ổn") → `contrast.mjs` → soát mắt người (Bước 7) → phản biện độc lập nếu bài quan trọng | PNG, PDF |
| 7. Thu hoạch | Thứ gì dùng lại được (khối mới, style mới, quy tắc mới, lỗi mới) → đưa vào thư viện / checklist của skill; thư mục skill chỉ-đọc thì để trong thư mục bài và báo người dùng những file cần thêm vào skill | thư viện lớn dần |

Bảng trên là thứ tự làm; cách làm từng việc nằm ở các mục Bước 1–7 bên dưới: pha 0 ↔ Bước 1 · pha 1 ↔ Bước 2 · pha 2 ↔ Bước 3–4 · pha 3–5 ↔ Bước 5 · pha 6 ↔ Bước 6–7.

## Khi thư viện không có style hoặc khối hợp đề tài

Kiểm độ hợp trước (5 phút): style hợp khi **≥ 2/3 vật trang trí** của nó có thật trong thế giới đề tài (vd. `ban-ve` hợp thuê trọ: mặt bằng, kích thước, khung tên đều thuộc nhà ở); khối hợp khi **hình dạng dữ liệu** khớp bảng Bước 3. Chỉ "màu hợp" không đủ.

Không đạt → đọc `references/tao-moi.md` rồi làm chen giữa pha 1 và pha 4: nghiên cứu thế giới hình ảnh, dựng style từ vật chủ đạo, tạo khối mới, kiểm "mới thật hay chỉ đổi màu", danh sách lỗi đã gặp, cách thêm vào thư viện. Ghi mọi quyết định vào `ke-hoach.md` (mục "Tạo mới").

Thư viện hiện có (`node scripts/new.mjs --list` in bản mới nhất) — style tờ hướng dẫn: `vo-o-li`, `so-cham-cong`, `ban-ve`, `container`. Khối: `head, tiles, bars, meter, cases, says, flow, timeline, compare, tree, notes, route, anatomy, sign`; tầng áp phích: 13 khối `sk-*` của `san-khau`; `hero, so-lon, y-list, dai` của `co-dong`; năm khối vật thật `dem, chong, vong, tuyen, nhan-vat`.

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
- [ ] Viện dẫn viết đủ chữ và đi từ nhỏ đến lớn: "khoản 2 Điều 328 BLDS", không "Đ328 k2", không "Điều 328 khoản 2" (lỗi đã gặp ở 3 bài mẫu; `render.mjs` bắt). Tên luật viết tắt (BLDS, BLLĐ) chỉ dùng khi dòng "Căn cứ" đầu trang đã ghi tên đầy đủ.
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
- [ ] Văn bản mới có thể đổi cách xử lý (vd. Luật Tư pháp người chưa thành niên 59/2024/QH15, hiệu lực 01/01/2026). Con số gộp từ nhiều văn bản phải tra tin mới trước khi chốt (lỗi suýt gặp: khoản 1 Điều 112 BLLĐ ghi 11 ngày lễ, tết; ngày 24/11 nằm ở Nghị quyết 28/2026/QH16).
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

Hình chính cần vật thật hoặc biểu đồ (hình đếm, chồng vật cao đúng tỉ lệ, bản đồ ô, sankey, bậc thang, cây, bản đồ tuyến): bảng chọn và cách làm ở `references/do-hoa.md`.

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

Ráp khung bằng `scripts/new.mjs … --out <thư mục làm việc>` (pha 0), rồi thay nội dung. `templates/base.html` và hai bài đầu (`bao-luc-hoc-duong`, `thu-viec`) là bản tự đứng, viết trước khi có thư viện — xem để học, không cần sao chép.

**5a. Ý tưởng hình ảnh lấy từ thế giới của chủ đề** (không lấy từ mẫu SaaS):

| Chủ đề | Ý tưởng | Vật trang trí |
|---|---|---|
| Học đường | Trang vở ô li | nhãn vở, lề đỏ, lỗ gáy, thước kẻ, bút đỏ, giấy nhớ |
| Lao động, việc làm | Bảng chấm công / phiếu lương; tầng áp phích: tranh cổ động (style `co-dong`) | ô ngày, thẻ nhân viên, phong bì lương; tờ lịch xé, tia nắng, dấu mộc |
| Hợp đồng, doanh nghiệp | Hồ sơ giấy tờ | kẹp giấy, tab hồ sơ, chữ ký |
| Tố tụng, thời hạn | Lịch / đồng hồ | tờ lịch xé, ngày khoanh tròn |
| Đất đai | Bản đồ địa chính | lưới tọa độ, thửa đất, la bàn |
| Nhà ở, thuê trọ, xây dựng | Bản vẽ kỹ thuật (style `ban-ve`) | khung bản vẽ, khung tên, đường kích thước, mặt bằng phòng |
| Thương mại quốc tế, logistics | Bến cảng, container (style `container`) | cửa container tôn gợn, chữ stencil, mã container, băng vạch cảnh báo, tuyến kho–xe–tàu |
| Tiêu dùng, mua bán | Hóa đơn, biên lai | mép răng cưa, mã vạch, dòng tổng tiền |
| Giao thông | Biển báo, bản đồ đường | biển tròn/tam giác, vạch kẻ đường |

Quy tắc: (1) hình chính được **vật thể hóa** (thước tuổi = cây thước thật; thời hạn = tờ lịch); (2) mỗi khối 1 icon đúng nghĩa; (3) tình huống có nhân vật để người đọc tự đặt mình vào; (4) tối đa 2 vật "tay làm" (giấy nhớ, con dấu) đặt ở chỗ cần nhấn; (5) nền có kết cấu nhẹ nhưng chữ luôn trên nền trơn; (6) dồn sự táo bạo vào **một** chỗ — hình chính.

**5b. Chữ**
- 1 họ font hỗ trợ tiếng Việt chuẩn: **Be Vietnam Pro** (OFL); chữ viết tay cho ghi chú: **Patrick Hand** (OFL).
- Thứ bậc: tiêu đề 40–48 px; tiêu đề mục 24 px; nhãn 15–18 px; nhãn phụ ≥ 12,5 px (≈ 7 pt in). Tối đa 4 cỡ.
- `styles/_base.css` đặt `text-wrap: balance` cho cả trang để dòng cuối không còn một chữ mồ côi; style mới và CSS riêng của bài không ghi đè nó.
- Không `letter-spacing` dương với chữ có dấu; không đoạn VIẾT HOA dài (chỉ nhãn ≤ 3 từ như con dấu); không dấu cách trước `! ? : ;`; line-height thân ≥ 1.3.
- Chữ VIẾT HOA có thể xuống dòng (con dấu, nhãn hẹp, tiêu đề in hoa) → `line-height ≥ 1.3`: dấu trên của dòng dưới (Ứ, Ử, Ễ) chạm dấu nặng/chân chữ dòng trên ở 1.13 (đo bằng ảnh Be Vietnam Pro 800, 40 px). Tiêu đề chữ thường giữ 1.12–1.13 được.

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
- Icon: viết `<span class="ico" data-icon="gavel"></span>` rồi chạy `scripts/icons.mjs` (sửa tại chỗ, chạy lại được). Tra tên ở lucide.dev/icons; icon chưa có thì `node scripts/assets.mjs icon <tên…> --to <thư mục bài>` (giấy phép: `assets/LICENSES.md`).
- Nhân vật: `assets/avatars/notionists-<seed>.svg` cạnh `index.html`; seed mới: `node scripts/assets.mjs avatar-sheet <seed…> --to <thư mục bài>`, lưu về máy (không nhúng link API).
- Hình dán màu: `<span class="emo" data-emo="coin"></span>` rồi chạy `icons.mjs`; 199 hình có sẵn (xem tên: `assets.mjs emoji --list`), thêm bằng `assets.mjs emoji <tên…>`.
- Biểu đồ, sơ đồ từ dữ liệu: `node scripts/bieu-do.mjs echarts|antv …` (cần cài `echarts`, `@antv/infographic` ở thư mục bài; xem `references/do-hoa.md` mục 4).
- Không ảnh không rõ giấy phép, logo cơ quan, quốc huy, con dấu thật.

## Bước 6 — Xuất

```bash
node scripts/icons.mjs    <index.html>
node scripts/render.mjs   <index.html>          # thêm --gray nếu sẽ photo đen trắng
node scripts/contrast.mjs <index.html>
```
Ra `infographic.png` (xem) và `infographic.pdf` (**A4 đúng khổ, đem in**). Chromium: dùng `PW_CHROMIUM` nếu có, không thì tự thử `/opt/pw-browsers/chromium`.

## Bước 7 — Tự kiểm (không bỏ qua)

1. **Script**: `render.mjs` phải in đủ **hai dòng đạt**, còn dòng nào báo vấn đề thì sửa rồi render lại:
   - "bố cục ổn" — bắt: tràn khổ A4, sai tỉ lệ, chữ cách mép < 52 px, chữ đè chữ, chữ tràn/chạm viền khung. Ngoại lệ có chủ đích: `data-margin` (nhãn ở lề, ngưỡng 26 px), `data-free` (nhãn cố ý nằm ngoài khung).
   - "chữ sạch" — bắt: mảnh mã lọt ra chữ (`/p>`, `&nbsp;`), chỗ điền của khối mẫu chưa thay ("Điều …", "Tên", "lý do"), viện dẫn viết tắt hoặc ngược trật tự ("Đ28 k3"), chữ dưới 12,5 px (chữ trong hình `.illus` tính theo cỡ sau khi co giãn), chữ mồ côi một mình một dòng, trang trống quá 10% phía dưới. Ngoại lệ có chủ đích: `data-ok`.
   - `contrast.mjs` phải 0 FAIL.
2. **Mắt người** (script không bắt được): mở PNG, đọc như người lần đầu thấy:
   - [ ] 5 giây: nói lại được thông điệp chính.
   - [ ] Hình chính mang dữ liệu, chiếm 35–50%; thu nhỏ 25% vẫn nhận ra.
   - [ ] Thứ tự đọc khớp số mục; khoảng trắng giữa khối > trong khối.
   - [ ] Mỗi khối ≤ 25 từ; nhãn không bị bẻ đôi giữa một cụm nghĩa (chữ mồ côi script đã bắt).
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
- antvis/infographic (MIT) và Apache ECharts (Apache-2.0): dữ liệu → mẫu → SVG; gọi qua `scripts/bieu-do.mjs`, không đi kèm skill.
- Skill `frontend-design`, `dataviz` (Anthropic): tránh bố cục rập khuôn, token màu.
- WCAG 2.1 SC 1.4.3, 1.4.11: ngưỡng tương phản. Tufte: mọi nét vẽ phải mang thông tin.
- Lucide (ISC), Fluent Emoji của Microsoft (MIT), DiceBear Notionists của Zoish (CC0); phông Be Vietnam Pro, Patrick Hand, Baloo 2, Archivo, Mali, Barlow (OFL, nạp từ Google Fonts).
