# Kế hoạch đột phá đồ hoạ và UX — Luyện Luật

Ngày 11/11/2026 · trạng thái: **Hào đã duyệt hướng B ngày 11/11** (cho vẽ lại Hồ sơ; font Anton do Claude chọn; câu 3 ở mục 7 chưa trả lời). Đã làm: nền móng màu và chữ, phần đầu đợt 1 — xem `docs/specs/2026-11-11-giay-va-san-khau-design.md`. Đợt 0 (ảnh thử A/B) bỏ vì hướng đã được chọn.
Cách làm: chụp và đo bản build thật (32 ảnh, 390 và 1280 px, đi hết 5 phiên học), đọc lại các quyết định thiết kế đã chốt, đọc nguồn tham khảo bên ngoài và repo mã nguồn mở.

## 0. Kết luận trước

1. **Web không thiếu tranh. Tranh đang nằm sai chỗ.** Phần đồ hoạ công phu nhất (tủ sách gỗ, tủ sự nghiệp, cảnh Văn Miếu) ở trang điều hướng và Hồ sơ. Màn học, nơi người dùng ở lâu nhất, là một biểu mẫu nhiều khung viền.
2. **Chất liệu cho bước nhảy lớn nhất đã có sẵn và chưa tốn thêm nội dung nào:** cả 740 khái niệm đều có dữ liệu sơ đồ (`memo`) với loại hình, 2.334 nhánh, mỗi nhánh một biểu tượng. Hiện chúng chỉ hiện thành vài dòng chữ cạnh một hình cỡ 65 px.
3. **Web và kênh nội dung của Hào đang là hai thương hiệu khác nhau.** Áp phích, slide, video dùng ngôn ngữ "sân khấu" (mực đêm, son, vàng, chữ Anton, vật thật cỡ lớn, dấu mộc). Web dùng kem, cam đất nung, chữ serif. Người từ TikTok bấm link sang web không nhận ra cùng một người làm.
4. Đề xuất 7 đợt, mỗi đợt một PR, mỗi đợt có số đo trước và sau. **Đợt 0 chỉ làm ảnh thử để Hào chọn hướng**, không đụng code ứng dụng.

## 1. Hiện trạng đo được (bản build `21fd9ce`)

| Chỉ số | Hiện tại | Ghi chú |
|---|---|---|
| Câu hỏi bắt đầu ở đâu trên điện thoại 390 × 844 | y = 264, tức **31% màn hình** đã hết trước khi tới câu hỏi | phía trên có 5 lớp: thanh tiến độ, dải khái niệm, dòng mẹo, nhãn câu vàng, nhãn bậc |
| Khung có viền trong màn đầu của phiên học | **10** (390 px), 11 (1280 px) | hộp lồng hộp: thẻ, đáp án, chip, mẹo |
| Cỡ chữ câu hỏi | **18 px ở cả điện thoại lẫn máy tính** | ở 1280 px câu hỏi trông nhỏ, màn hình trống hơn một nửa |
| Sơ đồ ghi nhớ | hình khoảng 65 px trên thẻ rộng 358 px | dữ liệu: 418 cây nhánh, 146 so sánh, 92 danh sách điều kiện, 43 bậc thang, 41 các bước |
| Dấu `→` trong mã giao diện | 212 chỗ | đếm trong mã nguồn, không phải số lần hiện |
| Chuỗi nối bằng dấu chấm giữa | 120 chỗ | |
| Nhãn nhỏ phía trên tiêu đề (`kicker`) | 39 chỗ | audit 04/11 đã nêu (HT6) |
| Khai báo `border: 1px solid` và `box-shadow` trong `app.css` | 70 và 95 | |
| Điểm thẩm mỹ (taste-skill, 04/11) | bị chặn trần **6,5/10** ở cả 12 màn | các đợt sửa sau đó nâng sàn (bàn phím, tương phản), chưa nâng trần |
| Lỗi axe, tràn ngang | 0 | nền kỹ thuật tốt, giữ nguyên |

Ảnh dẫn chứng vòng học trên điện thoại: [2026-11-11-hien-trang-vong-hoc-390.png](2026-11-11-hien-trang-vong-hoc-390.png).

## 2. Bốn chẩn đoán

**D1. Đồ hoạ nằm sai chỗ.** Audit 04/11 đã viết về thanh bên: "vùng tối và đậm màu nhất mỗi trang lại là chrome, không phải nội dung". Điều đó đúng cho cả web: 39 file tranh trong `lib/art` phục vụ đầu trang, bìa sách, Hồ sơ; màn học không có hình nào ngoài biểu tượng nhỏ.

**D2. Bốn ngôn ngữ hình ảnh trong một web.** Cảnh nét phẳng (Văn Miếu), đồ gỗ-kính tả thực (tủ sách, tủ sự nghiệp), bìa giáo trình giả thật, và thẻ viền mảnh kiểu ứng dụng chung chung. Thêm ngôn ngữ thứ năm ở ngoài web là "sân khấu" của áp phích và video.

**D3. Nhiều dấu hiệu "mẫu chung".** Nền kem cùng cam đất nung và chữ serif là cụm mà taste-skill cấm (04/11) và cũng là cụm mặc định phổ biến nhất của giao diện do AI dựng. Kèm theo là mũi tên sau mọi nút, chuỗi nối dấu chấm giữa, nhãn nhỏ trên mọi tiêu đề, thẻ bo góc giống nhau ở mọi cấp.

**D4. Hình trang trí nhiều, hình giải thích ít.** Nghiên cứu về học qua đa phương tiện cho kết quả ngược với trực giác: hình đẹp nhưng không liên quan nội dung làm giảm kết quả học (mục 3). Hướng đúng là hình chở cấu trúc của điều luật: bậc thang hiệu lực, danh sách điều kiện, các bước thủ tục, bảng đối chiếu.

## 3. Tham khảo đã đọc và điều rút ra

| Nguồn | Điều rút ra | Dùng vào đâu |
|---|---|---|
| Duolingo, "Shape language: Duolingo's art style" (blog.duolingo.com/shape-language-duolingos-art-style) | Phong cách được chọn để **làm nhanh, đọc rõ**: ít chi tiết nhất đủ nhận ra, hình có khoảng trắng bao quanh; chuyển động đặt ở màn có giá trị cao để dẫn mắt | Luật cho mọi hình mới ở đợt 2; lý do không vẽ thêm cảnh chi tiết |
| Duolingo, "Introducing the new Duolingo learning path" (blog.duolingo.com/new-duolingo-home-screen-design) | Thay danh sách kỹ năng bằng **một lối đi từng bước** để người học luôn biết bước kế tiếp | Đợt 3: trang môn |
| Duolingo, "How Duolingo animates its world characters" (blog.duolingo.com/world-character-visemes) | Nhân vật hoạt hình cần công cụ Rive và người dựng chuyên | Lý do **không** làm nhân vật hoạt hình (mục 6) |
| Stanford Legal Design Lab, "Visual Legal Help Guides" (justiceinnovation.law.stanford.edu/projects/visual-guides) | Hình pháp lý hữu ích có bốn dạng: **lưu đồ, truyện tranh từng bước, bảng so sánh, dòng thời gian** | Đợt 2: năm loại `memo` khớp gần trọn bốn dạng này |
| Sundararajan và Adesope (2020), "Keep it coherent: A meta-analysis of the seductive details effect", Educational Psychology Review 32(3), 707–734; Rey (2012), Educational Research Review 7(3), 216–237 | Chi tiết hấp dẫn nhưng không liên quan **làm giảm** kết quả học | Nguyên tắc 1 ở mục 4 |
| Sung và Mayer (2012), "When graphics improve liking but not learning from online lessons", Computers in Human Behavior 28(5), 1618–1625 | Hình trang trí làm người học **thích hơn nhưng không học tốt hơn** | Phân biệt "đẹp" với "giúp nhớ" khi nghiệm thu |
| Um, Plass, Hayward và Homer (2012), "Emotional design in multimedia learning", Journal of Educational Psychology 104(2), 485–498 | Màu ấm và hình thân thiện có ích khi áp vào **chính nội dung học** | Cho phép sơ đồ có màu và dáng, miễn là chở nội dung |
| Skill `infographic` của Hào trên `main` (style `san-khau`) | Mỗi trang một vật chủ đạo; dữ liệu thành vật đếm được; ngân sách chữ; số cỡ áp phích; dấu mộc; nhân vật cho tình huống | Hướng nghệ thuật ở mục 4; đợt 4 |
| Audit 04/11 (`docs/review/2026-11-04-audit-impeccable-taste/`) | Tranh kiến trúc và bìa sách là điểm mạnh; cặp kem với đất nung và tủ gỗ tối ở thanh bên là điểm trừ | Giữ gì, đổi gì |
| web.dev, "New to the web platform in October" (2026) | Hoạt hình theo cuộn trang đã có ở Chrome, Safari 26, Firefox 159 | Được dùng dạng tăng cường, không cần thư viện |

Repo mã nguồn mở đã xem (số sao và giấy phép tra ngày 11/11/2026):

| Repo | Sao · giấy phép | Kết luận |
|---|---|---|
| rough-stuff/rough-notation | 9,7 nghìn · MIT · cập nhật cuối 03/2024 | Ý tưởng hay: khoanh, gạch chân kiểu tay vẽ lên **từ khoá trong định nghĩa**. Học cách làm, tự viết bằng SVG, không thêm thư viện |
| barvian/number-flow | 7,8 nghìn · MIT · có bản Svelte | Web đã tự có hoạt hình tăng số; không cần |
| formkit/auto-animate | 14 nghìn · MIT | Không cần: View Transitions đang dùng đã đủ |
| motiondivision/motion, humanspeak/svelte-motion | 35 nghìn, 106 · MIT | Không thêm: CLAUDE.md cấm thư viện giao diện, CSS hiện tại làm được |
| rive-app/rive-wasm, LottieFiles/dotlottie-web | 1,0 nghìn, 0,9 nghìn · MIT | Không dùng: cần runtime riêng và người dựng hoạt hình |
| sanidhyy/duolingo-clone, bryanjenningz/react-duolingo | 708, 474 · MIT | Đọc để tham khảo bố cục màn bài học và lối đi; khác stack nên không chép mã |
| mathigon/textbooks | 398 | Tham khảo cách hình tương tác đi kèm từng đoạn nội dung |
| pbakaus/impeccable, Leonxlnx/taste-skill | 108 nghìn, 113 nghìn | Đã dùng 04/11; dùng lại làm thước chấm sau mỗi đợt |

## 4. Hướng nghệ thuật đề xuất: "Giấy và Sân khấu"

Một web, hai giọng, cùng bộ màu với áp phích và video.

- **Giấy** là giọng của việc học: nền ngà, nét mực rõ, chữ to, mỗi màn một việc. Dùng cho bài học, ôn tập, làm đề, tra khái niệm.
- **Sân khấu** là giọng của khoảnh khắc: nền mực đêm có quầng son, số cỡ áp phích, dấu mộc. Chỉ dùng cho cuối phiên, thắp chuỗi, lên bậc, thăng chức và màn chào người mới. Đây **không phải chế độ tối**: người dùng không bật tắt, màn học không bao giờ tối, quyết định bỏ chế độ tối ngày 03/11 giữ nguyên.

**Màu (6 tên).** Giữ giấy, mực, son của Văn Miếu; bỏ màu duy nhất mà cả hai lần chấm đều trừ điểm là cam đất nung.

| Tên | Giá trị | Vai |
|---|---|---|
| Mực đêm | `#0c1222` | chữ, nét, nền sân khấu (hiện `--ink` là `#14213d`) |
| Giấy ngà | `#fffaf0` trên nền `#f4eddc` | mặt thẻ và nền trang |
| Vàng hổ phách | `#f6b93b` | màu nhấn và nút chính, **chỉ làm nền, không làm chữ trên giấy**; gần với `--gold-400` web đang có |
| Son | `#e2402a` | dấu mộc và điểm nhấn sân khấu, không dùng cho nút |
| Lục | `#1f7a54` | đúng |
| Gạch | `#b62c1a` | sai, luôn kèm biểu tượng và chữ |

**Chữ (3 họ, đổi vai chứ không thêm cho vui).** Be Vietnam Pro cho mọi lời giải thích và giao diện. Noto Serif **chỉ cho nguyên văn điều luật**, để mắt phân biệt ngay "lời của luật" với "lời diễn giải". Anton chỉ cho số và tiêu đề ở sân khấu, cỡ từ 32 px, tối đa 9 chữ theo đúng luật áp phích của Hào. Noto Serif Display thôi làm tiêu đề trang.

**Bố cục màn học trên điện thoại.**

```
HIỆN TẠI (câu hỏi ở 31% màn)        ĐỀ XUẤT (câu hỏi ở ≤ 18% màn)
┌────────────────────────────┐      ┌────────────────────────────┐
│ ←  ▬▬▬▬▬▬│   0 XP    3/10  │      │ ✕  ▬▬▬▬▬▬▬░░░░░░░    3/10  │
│ [0 Hiến pháp][0 Hiệu lực…] │      │                            │
│ Mẹo: trả lời đúng liên…  ✕ │      │ Theo khoản 1 Điều 119      │
│ ★ CÂU VÀNG · ĐƯỢC ×2 XP    │      │ Hiến pháp 2013, hành vi    │
│ ┌────────────────────────┐ │      │ vi phạm Hiến pháp bị xử    │
│ │ Nhận biết · Hiệu lực…  │ │      │ lý thế nào?        (22 px) │
│ │ Theo khoản 1 Điều 119… │ │      │                            │
│ │ ┌ A ─────────────────┐ │ │      │ A  Mọi hành vi vi phạm…    │
│ │ └────────────────────┘ │ │      │ ────────────────────────── │
│ │ ┌ B ─────────────────┐ │ │      │ B  Chỉ bị xử lý nếu…       │
│ │ └────────────────────┘ │ │      │ ────────────────────────── │
│ │ ┌ C … D ─────────────┐ │ │      │ C …   D …                  │
│ └────────────────────────┘ │      │                            │
└────────────────────────────┘      │ Hiệu lực cao nhất · bậc 1  │
                                    └────────────────────────────┘
                                      phản hồi trượt lên từ đáy
```

XP, chuỗi đúng, câu vàng và danh sách khái niệm của đợt **không bị bỏ**: chúng dời xuống một dòng trạng thái ở đáy và mở ra khi chạm. Ở máy tính, câu hỏi lên 26–28 px và sơ đồ ghi nhớ chiếm cột phải thay cho danh sách "Đợt này".

**Năm nguyên tắc nghiệm thu.**
1. Hình ở màn học phải trả lời được câu "hình này giúp nhớ điều gì của điều luật?". Không trả lời được thì không đưa vào.
2. Mỗi màn một việc và một vật chủ đạo.
3. Hai giọng chữ: serif là nguyên văn luật, sans là diễn giải.
4. Có ngân sách: số khung viền mỗi màn, số chữ mỗi thẻ, số nhãn nhỏ.
5. Chuyển động chỉ để trả lời một hành động (đóng dấu khi đúng, sơ đồ dựng lên khi mở), không tự chạy vòng lặp.

**Tự rà xem có rơi vào lối mòn không.** Lối mòn của "web học tập" là kiểu tròn, xanh lá, linh vật; lối mòn của "web luật" là kem, serif, đất nung như hiện tại. Hướng này tránh cả hai và lấy chất liệu từ chính thế giới văn bản pháp luật: giấy, mực, dấu son, điều khoản. Rủi ro còn lại: thẻ viền mực đậm có thể giống trào lưu "neo-brutalism". Vì vậy mới cần đợt 0.

## 5. Lộ trình

| Đợt | Việc | Tiêu chí "xong" đo được | Ước lượng |
|---|---|---|---|
| **0** | **Ảnh thử hai hướng**, dựng bằng HTML rời, không đụng `apps/web`: (A) giữ Văn Miếu, chỉ dọn khung; (B) Giấy và Sân khấu. Mỗi hướng 2 màn ở 390 px: câu trắc nghiệm, màn cuối phiên | 4 ảnh cùng dữ liệu thật + bảng token; Hào chọn A, B hoặc pha trộn | ≤ 1 giờ |
| **1** | **Màn học là một trang giấy** (bài học, ôn tập, làm đề) | Câu hỏi bắt đầu ở ≤ 18% màn (đang 31%); ≤ 4 khung viền ở màn đầu (đang 10); chữ câu hỏi 22 px điện thoại, 26–28 px máy tính; phản hồi là tấm trượt từ đáy; e2e và axe xanh | 2 phiên |
| **2** | **Sơ đồ thật từ dữ liệu `memo`**: 5 loại thành 5 hình vẽ (bậc thang, phiếu điều kiện có ô đóng dấu, tuyến các bước, hai cột đối chiếu, cây nhánh), hiện ở thẻ giới thiệu, lúc trả lời sai, trang khái niệm | 740/740 khái niệm ra hình không lỗi (test chạy trên dữ liệu thật); hình rộng ≥ 40% thẻ; từ khoá trong định nghĩa được khoanh kiểu tay vẽ; không thêm nội dung, không thêm thư viện | 2 phiên |
| **3** | **Trang môn là mục lục của cuốn giáo trình**: số chương lớn, mỗi bài một dòng có vạch tiến độ, tên khái niệm chỉ hiện khi mở bài; một nút "bước kế tiếp" duy nhất | Màn đầu ở 390 px thấy được ≥ 2 chương (đang thấy 1); số khung viền giảm ≥ 60%; đường tới bài kế tiếp vẫn 1 lần bấm | 1 phiên |
| **4** | **Khoảnh khắc sân khấu**: cuối phiên, thắp chuỗi, lên bậc, thăng chức dùng chung một ngôn ngữ; con dấu ĐÚNG thành hoạt cảnh đóng dấu | Mỗi khoảnh khắc ≤ 40 chữ; một con số cỡ ≥ 64 px; nút chính vẫn trong màn đầu như spec 07/11; tôn trọng giảm chuyển động | 1 phiên |
| **5** | **Dọn dấu hiệu mẫu chung** trên toàn web: mũi tên, dấu chấm giữa, nhãn nhỏ, bóng đổ, đổi token màu và vai chữ theo hướng đã chọn | `→` chỉ còn ở nút "đi tiếp"; nhãn nhỏ ≤ 10 chỗ; chấm lại taste-skill, mục tiêu vượt trần 6,5 | 1–2 phiên |
| **6** (tuỳ chọn) | **Hồ sơ**: vẽ lại khung tủ sách và tủ sự nghiệp từ gỗ tả thực sang nét mực, giữ nguyên nội dung và cơ chế | Một ngôn ngữ nét trên toàn web | 2–3 phiên, cần Hào đồng ý trước (mục 7, câu 2) |
| **7** (tuỳ chọn) | **Lần đầu vào web**: màn chào theo giọng sân khấu, hỏi một câu để chọn điểm bắt đầu | Phụ thuộc câu 3 ở mục 7 | 1 phiên |

Thứ tự này đặt việc ít rủi ro, nhiều tác dụng lên trước: đợt 1 và 2 chạm đúng nơi người học ở lâu nhất và dùng dữ liệu sẵn có. Mỗi đợt lùi lại được bằng cách hoàn tác một PR.

**Nhân vật cho câu tình huống** (bộ Notionists, CC0, đang dùng ở áp phích) để ngoài lộ trình: dữ liệu chưa có trường ghi ai là ai, và chỉ 21/117 câu tình huống cùng 77/740 ví dụ có nhân vật được gọi tên rõ. Muốn làm phải thêm trường nội dung và thí điểm một môn. Ghi lại để bàn sau.

## 6. Không làm, và vì sao

- **Chế độ tối.** Đã bỏ ngày 03/11. Sân khấu chỉ là khoảnh khắc.
- **Linh vật, nhân vật hoạt hình kiểu Duolingo.** Cần hoạ sĩ, công cụ Rive và runtime riêng; một người làm không duy trì nổi.
- **Vẽ thêm cảnh trang trí cho từng môn.** Tốn công mà theo nghiên cứu ở mục 3 thì không giúp nhớ.
- **Thêm thư viện giao diện hoặc chuyển động, đổi stack.** CLAUDE.md cấm và không cần: CSS, SVG, View Transitions đủ dùng.
- **Sửa nội dung luật.** Kế hoạch này không đụng `packages/content/data`.

## 7. Bốn điều cần Hào quyết

1. **Hướng màu và chữ:** A (giữ Văn Miếu, chỉ dọn khung và dời đồ hoạ) hay B (Giấy và Sân khấu, đồng bộ với áp phích và video)? Tôi nghiêng về B, nhưng đề nghị **xem ảnh thử ở đợt 0 rồi mới chọn**. B là đổi bảng màu, CLAUDE.md yêu cầu phải có spec được duyệt.
2. **Hồ sơ:** cho vẽ lại khung tủ gỗ theo nét mực (đợt 6), hay giữ nguyên làm một "phòng truyền thống" riêng? Đây là phần Hào đã đầu tư nhiều đợt nên tôi không tự quyết.
3. **Web phục vụ ai trước?** CLAUDE.md ghi "sinh viên luật"; brief thương hiệu ghi "người 18–30 đi học, đi làm, thuê trọ". Người mới hiện gặp ngay bài "Nguồn gốc, bản chất và dấu hiệu của nhà nước". Câu trả lời quyết định màn đầu tiên (đợt 7).
4. **Thêm font Anton** (tự host, một file) cho giọng sân khấu: đồng ý hay dùng Be Vietnam Pro đậm?

## 8. Cách kiểm tra chung cho mọi đợt

- Đo trước và sau bằng cùng một script (vị trí câu hỏi, số khung viền, cỡ chữ) ở 390 và 1280 px; script sẽ được đưa vào `tools/` ở đợt 1.
- `npm run ci` xanh; e2e chạy local vì các đợt đều đổi luồng giao diện; axe 0 lỗi; ảnh 390 và 1280 px đính vào PR.
- Kiểm cả khi bật giảm chuyển động.
- Sau đợt 5 chấm lại bằng taste-skill và impeccable để so với mốc 6,5/10.

## 9. Rủi ro

- **Khẩu vị.** Hướng B có thể không hợp mắt Hào khi lên màn thật. Đợt 0 tồn tại để phát hiện điều đó với chi phí 1 giờ.
- **Đảo quyết định cũ.** Đợt 1 dời dải khái niệm, dòng mẹo, nhãn câu vàng, là những thứ đã có spec và test e2e. Spec đợt 1 phải ghi rõ từng thứ dời đi đâu.
- **Phình việc.** Mỗi đợt một nhánh, không gộp; đợt 6 và 7 chỉ bắt đầu khi có trả lời ở mục 7.
- **Chưa đo trên máy thật.** Mọi số ở trên đo bằng Chromium giả lập; chưa thử Safari trên iPhone.
