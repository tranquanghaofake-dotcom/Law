---
name: infographic
description: Tạo infographic từ con số 0 đến bản xuất PNG/PDF — đặc biệt infographic pháp luật tiếng Việt. Dùng khi người dùng muốn làm infographic, poster tuyên truyền, áp phích phổ biến pháp luật, "một trang tóm tắt" bằng hình, hoặc nhờ chấm/chữa một infographic có sẵn. Quy trình 7 bước: brief → kiểm chứng nội dung → chọn dạng hình → bố cục lưới → dựng HTML/SVG → xuất ảnh → tự soát bằng checklist và script đo tương phản.
---

# Infographic từ A đến Z

Infographic tốt = **một thông điệp** + **một hình chính chở thông điệp đó** + **nội dung đúng có nguồn**.
Poster nhiều chữ chia ô màu **không phải** infographic.

Làm theo đúng thứ tự 7 bước. Không nhảy sang dựng hình khi bước 1–2 chưa xong: lỗi nội dung không sửa được bằng màu đẹp.

## Bước 1 — Brief (5 câu, viết ra trước khi làm)

1. **Người đọc là ai, bao nhiêu tuổi, đọc ở đâu?** (học sinh THCS xem trên bảng tin; sinh viên lướt Facebook; in A4 phát tay…)
2. **Đọc xong họ phải nhớ đúng một câu gì?** → đây là tiêu đề hoặc câu dẫn.
3. **Đọc xong họ làm gì?** (gọi 111, báo giáo viên, tra điều luật…) → lời kêu gọi hành động (CTA).
4. **Khổ: luôn A4 dọc** (in và phát tay). `.sheet` = 1080×1528 px = 210×297 mm (1 mm ≈ 5,14 px). Nội dung cách mép ≥ 52 px (~10 mm) vì máy in không in sát mép. Mặc định **in màu trên bìa cứng**; chỉ khi người dùng nói sẽ photo đen trắng mới áp quy tắc bản xám.
5. **Giọng:** nghiêm túc/thân thiện; được phép dùng minh họa không.

Nếu người dùng không trả lời, tự chọn mặc định hợp lý và ghi rõ giả định ở đầu câu trả lời.

## Bước 2 — Kiểm chứng nội dung (bắt buộc với chủ đề pháp luật)

- Mỗi khẳng định pháp lý = **văn bản + số hiệu + điều/khoản/điểm + tình trạng hiệu lực**. Tra trên vbpl.vn hoặc congbao.chinhphu.vn; ưu tiên **văn bản hợp nhất** mới nhất.
- Ghi bảng nguồn `nguon.md` cạnh file HTML: khẳng định → căn cứ → link → ngày đối chiếu. **Bảng nguồn ở ngoài trang in**; trên hình chỉ giữ số điều cạnh khối liên quan (vd. "Điều 12 BLHS") — không in khối nguồn, con dấu đối chiếu.
- Đọc `references/legal-checklist.md` và soát **từng mục** trước khi dựng hình. File này gom các lỗi thật đã gặp (mốc tuổi, "cùng chịu", gán nhầm điều, thuật ngữ sai…).
- Không chắc → không đưa lên hình, hoặc ghi "cần kiểm tra". Không bịa số hiệu.

## Bước 3 — Chọn dạng hình theo **hình dạng của nội dung**

Đọc `references/layouts.md`. Hỏi: nội dung của tôi có hình gì?
- Có mốc số/ngưỡng (tuổi, mức phạt, thời hạn) → **thước/trục**.
- Có các bước → **quy trình**. Có 2–4 phương án → **so sánh/ma trận**.
- Có điều kiện "nếu… thì…" → **cây quyết định**.
- Chỉ là liệt kê khái niệm → **bento grid** (dạng yếu nhất, dùng khi không có gì tốt hơn).

Mỗi infographic có **đúng một hình chính** chiếm 35–50% diện tích; các khối khác phục vụ nó.

## Bước 4 — Phác bố cục (wireframe bằng chữ)

Viết dàn ý theo thứ tự mắt đọc (trên → dưới, trái → phải):
```
[Tiêu đề + câu dẫn]           ~12%
[Định nghĩa / bối cảnh]       ~12%
[HÌNH CHÍNH]                  ~40%
[Bảng phụ / ví dụ]            ~16%
[CTA: làm gì ngay]            ~12%
[Ký tên + miễn trừ 1 dòng]    ~2%
```
Quy tắc: số thứ tự mục **trùng với thứ tự mắt đọc**; tối đa 5–6 khối; **mỗi khối ≤ 25 từ**.

**Hình thay chữ** — trước khi viết một câu, hỏi "vẽ được không?":
- Danh sách khái niệm → ô hình (icon tròn + nhãn ≤ 6 từ).
- Ngưỡng/mốc → thước, thanh đo (vd. thanh tỉ lệ thương tật có vạch 61%).
- Kết luận có/không → **con dấu** (CÓ THỂ / KHÔNG / TỰ TRẢ) kèm icon.
- Quy trình → các ô nối bằng mũi tên. Chuỗi sự việc → icon → icon → icon.
- Tình huống → nhân vật + nhãn tuổi + hành động 1 dòng.
- Chữ còn lại chỉ để: tiêu đề, nhãn, số điều, ghi chú "dễ nhầm".

## Bước 5 — Dựng bằng HTML/CSS/SVG

- Sao chép `templates/base.html` → `examples/<slug>/index.html`. Template = bản "trang vở" A4 hoàn chỉnh (nhãn vở, ô hình, thước, con dấu, dòng hành động) — thay nội dung, giữ cấu trúc.
- Quy tắc thiết kế chi tiết: `references/design-rules.md`. Tóm tắt:
  - **1 font** hỗ trợ tiếng Việt tốt (Be Vietnam Pro), tối đa 2 độ đậm cho thân bài; **không giãn chữ** (letter-spacing) với chữ có dấu.
  - **3 màu chức năng** + màu trung tính; mỗi màu một nghĩa và giữ nghĩa đó toàn trang.
  - **1 cách nhấn mạnh** duy nhất (đậm hoặc nền nhạt). Không gạch chân (trông như link).
  - Tương phản chữ ≥ 4.5:1 (chữ lớn ≥ 3:1).
- Không dùng ảnh/biểu tượng có bản quyền; dùng SVG tự vẽ hoặc icon mã nguồn mở có ghi giấy phép.

### 5b. Lớp hình ảnh: ý tưởng → asset → trang trí

Infographic chỉ có chữ trong khung màu sẽ trông "thiếu". Trước khi code, chọn **một ý tưởng hình ảnh lấy từ chính thế giới của chủ đề** (không phải từ mẫu SaaS):

| Chủ đề | Ý tưởng hình ảnh | Vật thể trang trí |
|---|---|---|
| Học đường | Trang vở ô li | nhãn vở, lề đỏ, lỗ gáy, thước kẻ, bút đỏ cô giáo, giấy nhớ |
| Hợp đồng, doanh nghiệp | Hồ sơ giấy tờ | kẹp giấy, tab hồ sơ, chữ ký nháy, dấu "đã đối chiếu" |
| Tố tụng, thời hạn | Lịch / đồng hồ | tờ lịch xé, mốc ngày khoanh tròn |
| Đất đai | Bản đồ địa chính | lưới tọa độ, thửa đất, la bàn |
| Lao động | Bảng chấm công / phiếu lương | ô giờ, cột tiền |

Quy tắc: (1) **hình chính được "vật thể hóa"** — thước tuổi vẽ thành cây thước thật, quy trình vẽ thành con đường; (2) mỗi khối có **1 icon** đúng nghĩa (Lucide, `assets/icons/`); (3) tình huống có **nhân vật** (`assets/avatars/`, CC0) để người đọc tự đặt mình vào; (4) tối đa **2 vật trang trí "tay làm"** (giấy nhớ, con dấu, nét bút) — chỉ đặt nơi có thông tin cần nhấn; (5) nền có kết cấu nhẹ (ô li, lưới) nhưng chữ luôn nằm trên nền trơn.

Chèn icon: viết `<span class="ico" data-icon="gavel"></span>` rồi chạy
`node .claude/skills/infographic/scripts/icons.mjs <index.html>` (sửa tại chỗ, chạy lại được). Thiếu icon → tải theo `assets/LICENSES.md`.
Ví dụ đầy đủ: `examples/bao-luc-hoc-duong/` (ý tưởng "trang vở").

## Bước 6 — Xuất ảnh

```bash
node .claude/skills/infographic/scripts/icons.mjs  <index.html>   # chèn icon
node .claude/skills/infographic/scripts/render.mjs <index.html>   # xuất
```
Ra 2 file cạnh HTML: `infographic.png` (xem màn hình), `infographic.pdf` (**đúng khổ A4, đem in**). Thêm `--gray` để có `infographic-xam.png` khi định photo đen trắng. Script cảnh báo khi tràn khổ hoặc sai tỉ lệ A4.

## Bước 7 — Tự soát (không bỏ qua)

1. `render.mjs` tự kiểm và in danh sách: chữ sát mép (< 52 px), chữ đè chữ, chữ tràn khung (tính tới mép trong của viền). Sửa đến khi in ra "bố cục ổn". Ngoại lệ có chủ đích: gắn `data-margin` (nhãn ở lề vở, ngưỡng 26 px) hoặc `data-free` (nhãn cố ý nằm ngoài khung, vd. số trên thanh đo).
   `node .claude/skills/infographic/scripts/contrast.mjs <index.html>` → mọi phần tử chữ phải PASS.
   Script không thay mắt người: vẫn mở PNG xem — nó không bắt được chữ xuống dòng xấu, nhãn mơ hồ hay sai luật.
2. Mở PNG, đọc như người đọc lần đầu, đi qua `references/review-checklist.md`.
3. Thu nhỏ ảnh còn 25%: tiêu đề + hình chính vẫn nhận ra được không? Không → tăng tương phản/kích thước hình chính.
4. Nếu sẽ photo đen trắng: chạy `--gray`, kiểm tra các nhóm màu còn phân biệt được bằng icon, hoa văn, kiểu viền.
5. Báo cáo cho người dùng: ảnh, bảng nguồn, các giả định, điểm còn "cần kiểm tra".

## Khi được nhờ **chấm** infographic có sẵn

Trả lời theo thứ tự: (1) lỗi pháp lý — bảng "bạn viết / đúng là / mức độ"; (2) lỗi thiết kế theo `review-checklist.md`; (3) đề xuất dạng hình chính tốt hơn. Kết luận trước, chi tiết sau.

## Nguồn tham khảo của skill

Xem `references/SOURCES.md` (baoyu-infographic, k-dense scientific infographics, AntV Infographic, WCAG 2.1, Tufte).
