# Luyện Luật — Kế hoạch thiết kế web học khái niệm luật

Phiên bản 1.1 · 01/11/2026 · Trạng thái: **đã duyệt** (5 quyết định mục 11 đã chốt ngày 01/11/2026)
Tác giả: Claude soạn theo yêu cầu của Trần Quang Hào. Ngôn ngữ: tiếng Việt, giữ thuật ngữ tiếng Anh.

---

## 0. Tóm tắt một trang

**Chuyển hướng:** tạm dừng phần video TikTok (đã cất vào `archive/`), tập trung làm web. Câu hỏi không còn lấy từ video mà sinh từ **văn bản luật nguyên văn + giáo trình/slide + đề công khai (tham khảo, không copy)**.

**Sản phẩm:** web học luật kiểu **Memrise** cho khái niệm pháp lý. Người học chọn chương (ví dụ *Tài sản* trong Luật Dân sự), học từng **đợt 4–5 khái niệm**; mỗi khái niệm đi qua **6 bậc ghi nhớ** (giới thiệu → nhận biết → phân biệt → điền chỗ trống → tình huống → tự trả lời), lịch ôn do **FSRS** quyết định. Mỗi câu đúng có âm thanh, hiệu ứng, thanh "sức nhớ" lớn dần, nền sáng dần lộ tranh. Tiến độ quy ra **bậc khoa cử** (Thí sinh → Tú tài → Cử nhân → Tiến sĩ → Hoàng giáp → Thám hoa → Bảng nhãn → Trạng nguyên) kèm chuỗi ngày, bảng xếp hạng tuần, huy hiệu, vật phẩm trang trí.

**Khác biệt so với 7 web trắc nghiệm luật hiện có đã khảo sát** (dethitracnghiem.vn, baitaptracnghiem.com, vietjack, vndoc, detracnghiem.com, tracnghiemcongchuc.com, aigiaoduc.thuvienphapluat.vn): họ bán **đề**; mình cho **hệ thống nhớ** theo khái niệm + liên kết thẳng tới điều luật gốc + cảm giác chơi game. Không web nào trong số đó có spaced repetition, bậc ghi nhớ, hay phản hồi đa giác quan.

**Kỹ thuật (đã chốt):** Vite + Svelte 5 + TypeScript, dữ liệu JSON trong repo, tiến độ lưu IndexedDB (local-first), deploy Cloudflare Pages như hiện tại. Giai đoạn 2 thêm Supabase (đăng nhập Google, bảng xếp hạng, đồng bộ chuỗi).

**Môn đầu (đã chốt):** **Luật Hiến pháp** và **Lịch sử nhà nước và pháp luật**. Hệ quả quan trọng: môn lịch sử không có "điều luật hiện hành" làm căn cứ, nên trường `basis` đổi thành `source` tổng quát (điều luật hiện hành *hoặc* sử liệu/giáo trình), và thẻ bậc 3–4 cho môn lịch sử dùng dạng *mốc thời gian*, *sắp thứ tự*, *ghép triều đại ↔ bộ luật* thay cho tình huống áp dụng (xem 2.2 và 3.3).

**Những giả định của bạn cần sửa lại (nêu thẳng theo yêu cầu):**
1. Brief cũ ghi "fork từ kar-dots" — **không tìm thấy repo này** trên GitHub. Bỏ.
2. Brief ghi "fork Nibomo" — Nibomo (MIT) có thật, nhưng là monorepo iOS/Android/web nặng, tối ưu cho flashcard tự tạo; fork để làm sản phẩm khác là gánh nợ kỹ thuật. **Tham khảo kiến trúc, không fork.**
3. LibreLingo (Duolingo mã nguồn mở, AGPL) **đã archive**, chỉ còn fork cộng đồng. Tham khảo loại bài tập, không dùng mã.
4. Bạn nói "UI/UX cho PC và Laptop". Nguồn người dùng ban đầu vẫn là link bio TikTok, tức **điện thoại**. Thiết kế phải *desktop-first về bố cục* nhưng *mobile vẫn phải hoàn hảo*; spec này làm cả ba.
5. "Hệ thống quân hàm hay cửu phẩm": đề xuất **khoa cử** (Tú tài → Trạng nguyên) thay cho quân hàm vì đúng chủ đề *thi cử* và rất Việt; cửu phẩm dùng làm **bậc phụ** (Cửu phẩm → Nhất phẩm) cho mỗi môn. Bạn quyết ở mục 11.
6. "Đọc ra đáp án" bằng TTS: các model TTS tiếng Việt mã nguồn mở tốt nhất (F5-TTS-Vietnamese, viVoice) đều **CC BY-NC-SA, cấm thương mại**; Piper `vi_VN-vais1000` dữ liệu CC BY 4.0 nhưng fine-tune từ giọng lessac (giấy phép Blizzard, không thương mại) nên **vùng xám**. Dùng **Web Speech API** của trình duyệt (miễn phí, có sẵn giọng vi-VN trên Chrome, Edge, Safari/iOS) làm mặc định.

---

## 1. Mục tiêu, đối tượng, tiêu chí thành công

| | |
|---|---|
| **Mục tiêu** | Sinh viên nhớ *chắc* khái niệm luật (định nghĩa, dấu hiệu, phân biệt, áp dụng) và quay lại hằng ngày. |
| **Đối tượng chính** | Sinh viên 18–24 học Pháp luật đại cương (mọi ngành) và sinh viên Luật năm 1–2. Gen Z, dùng điện thoại nhiều, quen Duolingo/Memrise/Quizlet. |
| **Đối tượng phụ** | Ôn thi công chức, người đi làm muốn hiểu luật đời thường. |
| **Thành công MVP (8 tuần)** | 1 môn đầy đủ (≥ 60 khái niệm, ≥ 300 thẻ các loại), 100 người dùng thật, ≥ 30% quay lại ngày 7, điểm hài lòng ≥ 4/5 từ 10 bạn cùng lớp. |
| **Thành công 6 tháng** | 3 môn, 500 tài khoản ôn ≥ 7 ngày liên tiếp, bảng xếp hạng có ≥ 50 người hoạt động/tuần. |
| **Không làm** | Tư vấn pháp lý, chatbot hỏi đáp luật, bán đề, app native. |

---

## 2. Mô hình học — "Memrise cho khái niệm luật"

### 2.1 Đơn vị nội dung
```
Môn (subject)  →  Chương (chapter)  →  Đợt (lesson, 4–5 khái niệm)  →  Khái niệm (concept)
                                                                       ↳ các thẻ bài tập (items) gắn với khái niệm
```
Ví dụ: Luật Dân sự → Chương *Tài sản* → Đợt 1: *Tài sản*, *Vật*, *Tiền*, *Giấy tờ có giá*, *Quyền tài sản* → Đợt 2: *Bất động sản / Động sản*, *Hoa lợi*, *Lợi tức*, *Vật chính / Vật phụ*…

### 2.2 Sáu bậc ghi nhớ của một khái niệm (memory level 0 → 6)
Mỗi bậc là một *loại bài tập* khó dần. Khái niệm chỉ lên bậc khi trả lời đúng ở bậc hiện tại; sai thì tụt một bậc (không về 0).

| Bậc | Tên | Bài tập | Cách chấm |
|---|---|---|---|
| 0 | **Gặp** | Thẻ giới thiệu: thuật ngữ, định nghĩa (ưu tiên nguyên văn điều luật), 1 ví dụ đời thường, căn cứ + link. Nút nghe (TTS). | Bấm "Đã hiểu". |
| 1 | **Nhận biết** | Trắc nghiệm 4 phương án: cho thuật ngữ chọn định nghĩa, hoặc ngược lại. Phương án nhiễu lấy từ *các khái niệm cùng đợt/chương* (gây nhầm thật). | Đúng/sai tức thì. |
| 2 | **Phân biệt** | Cặp A/B hay nhầm (*đặt cọc* vs *trả trước*, *vật chính* vs *vật phụ*): cho tình huống ngắn, chọn khái niệm đúng. 3–4 câu liên tiếp xen kẽ (interleaving). | Đúng/sai. |
| 3 | **Điền chỗ trống** | Cloze trên định nghĩa/điều luật. Lần đầu: chọn từ trong *ngân hàng từ*; lần sau: **gõ** (so khớp không phân biệt hoa thường, bỏ dấu câu, chấp nhận từ đồng nghĩa khai báo trước). | Khớp chuỗi. |
| 4 | **Tình huống** | Mini-case 2–3 câu, trắc nghiệm áp dụng (dạng đề thi thật). Giải thích theo mẫu *căn cứ → phân tích → kết luận*. | Đúng/sai. |
| 5 | **Tự trả lời** | Câu hỏi mở ("Phân biệt X và Y", "Khi nào Z không áp dụng?"). Người học gõ 1–3 câu → hiện đáp án mẫu + **3–5 từ khóa bắt buộc** được tô sáng trong bài của họ → tự chấm *Đúng / Gần đúng / Sai*. Giai đoạn 3: thêm nút "Nhờ AI chấm" (Claude API). | Từ khóa + tự chấm. |
| 6 | **Thuần thục** | Không có bài riêng; khái niệm vào vòng **ôn FSRS**, mỗi lần ôn chọn ngẫu nhiên bậc 1–5. | FSRS rating. |

**Biến thể cho môn Lịch sử nhà nước và pháp luật** (không có luật hiện hành để "áp dụng"):
- Bậc 2 *Phân biệt*: ghép đôi *triều đại ↔ bộ luật ↔ đặc điểm* (Lý – Hình thư; Lê sơ – Quốc triều hình luật; Nguyễn – Hoàng Việt luật lệ), hoặc *nhà nước phương Đông ↔ phương Tây cổ đại*.
- Bậc 3 *Điền chỗ trống*: điền năm, tên bộ luật, tên cơ quan; thêm dạng **sắp thứ tự** sự kiện/triều đại (kéo thả trên PC, bấm chọn thứ tự trên điện thoại).
- Bậc 4 *Tình huống* → *Nhận định đúng/sai có giải thích* và *so sánh* ("Điểm khác của Quốc triều hình luật so với luật nhà Đường là gì?"), đúng với dạng đề thi môn này.
- `source` ghi giáo trình + trang hoặc sử liệu gốc (Đại Việt sử ký toàn thư, văn bản Quốc triều hình luật bản dịch) thay cho điều luật.

**Nhịp học bạn mô tả được giữ nguyên:** lần học đầu = bậc 0 + 1 cho cả 4–5 khái niệm; lần 2 (hôm sau) = bậc 2 + 3; lần 3 = bậc 4 + 5. Sau đó chỉ còn ôn. Một phiên ≈ 5–8 phút, 15–25 lượt trả lời.

### 2.3 Lịch ôn — FSRS
- Thư viện **`ts-fsrs` v6** (MIT, 300k lượt tải/tuần, tác giả nhóm Open Spaced Repetition, chính là thuật toán Anki hiện dùng). Chạy hoàn toàn trên trình duyệt.
- Mỗi khái niệm là một *card* FSRS; mỗi lần trả lời ở bất kỳ bậc nào sinh *review log* với rating: sai = Again, đúng sau khi lưỡng lự (> 12 giây) = Hard, đúng = Good, đúng nhanh (< 4 giây) ở bậc ≥ 3 = Easy.
- Màn hình chính luôn hiển thị **"Hôm nay: N khái niệm cần ôn"** trước, "Học mới" sau (Memrise/Anki đều làm vậy; ôn trước mới học sau).
- Mục tiêu retention mặc định 0,9; cho chỉnh 0,8–0,95 trong cài đặt.
- Giai đoạn 2: tối ưu tham số FSRS theo từng người bằng `fsrs-browser` (WASM) khi có ≥ 400 review log.

### 2.4 Chế độ học
1. **Học theo lộ trình** (mặc định): chương → đợt, mở khóa tuần tự nhưng cho "thi vượt" để nhảy đợt.
2. **Ôn hôm nay**: hàng đợi FSRS trộn mọi môn.
3. **Luyện đề 10 câu** (giữ tính năng hiện có): chọn bộ → làm → kết quả. Dùng cho người chỉ muốn kiểm tra nhanh; mỗi câu vẫn gắn `concept_id` để cộng vào bộ nhớ.
4. **Khó nhớ**: khái niệm sai ≥ 3 lần gần nhất, luyện riêng (Memrise "Difficult words").
5. **Thi thử chương** (giai đoạn 2): 20 câu, có giờ, không gợi ý, điểm vào bảng xếp hạng.

### 2.5 Căn cứ khoa học (để bạn tự tin khi giới thiệu)
- Spaced repetition + active recall là hai kỹ thuật có bằng chứng mạnh nhất về ghi nhớ dài hạn (Dunlosky et al. 2013). FSRS được benchmark công khai tốt hơn SM-2 của Anki cũ.
- Interleaving (xen kẽ cặp dễ nhầm) tăng khả năng *phân biệt*, đúng với bản chất học luật (phân biệt chế định).
- Memrise cho hoa "nở" sau ~6 lần đúng; Duolingo đo được *Streak Wager* tăng retention ngày 7 **+14%**, *Weekend Amulet* (cho phép nghỉ) tăng quay lại **+4%**, trong khi *badge* lần đầu thử **không có tác dụng** và *hearts/energy* gây phản ứng tiêu cực (Class Central, 10/2025). → Thiết kế của mình: thưởng chuỗi mạnh, có "bùa giữ chuỗi", **không phạt** sai bằng mất mạng.

---

## 3. Nội dung và nguồn đề

### 3.1 Nguyên tắc pháp lý khi lấy nội dung
| Nguồn | Được làm gì | Căn cứ / lưu ý |
|---|---|---|
| Văn bản QPPL (luật, nghị định…) | Dùng **nguyên văn** không giới hạn | Điều 15 Luật SHTT: không thuộc phạm vi bảo hộ. Lấy từ **vbpl.vn** (Bộ Tư pháp) hoặc dataset `th1nhng0/vietnamese-legal-documents` (CC BY 4.0, 171k văn bản HTML toàn văn, nguồn vbpl.vn, có quan hệ sửa đổi/thay thế). |
| Giáo trình, slide của trường | Chỉ dùng để **lập dàn khái niệm** và **hiểu cách giảng**; định nghĩa, ví dụ phải **tự viết lại**; không chép đoạn văn | Giáo trình là tác phẩm được bảo hộ. Trích dẫn ngắn có nêu nguồn để bình luận thì được (Điều 25), nhưng không nên xây cả bộ thẻ trên trích dẫn. |
| Đề thi/trắc nghiệm công khai (dethitracnghiem.vn, vietjack…) | Dùng để biết **chủ đề nào hay ra thi, dạng câu nào phổ biến**; **không copy câu** | Phần lớn có DMCA/điều khoản cấm sao chép; khoahoc.vietjack bán VIP. |
| Dataset nghiên cứu (VLSP 2025 LegalSLM Public-Test — trắc nghiệm luật; VLegal-Bench 10.450 mẫu; ALQAC; Zalo AI legal retrieval MIT) | Dùng làm **bộ kiểm tra chất lượng** câu sinh ra và tham khảo định dạng; kiểm tra giấy phép từng bộ trước khi tái phân phối (VLegal-Bench chưa ghi license rõ, ALQAC cần ký form VLSP) | Nhiều bộ cào từ thuvienphapluat.vn — không dùng lại nội dung bình luận của họ. |
| Bạn (sinh viên Luật năm 4) | **Duyệt mọi thẻ** trước khi lên web | Đây là lợi thế cạnh tranh và là chốt an toàn. |

### 3.2 Quy trình sinh thẻ (content pipeline, chạy trên máy bạn hoặc trong phiên Claude)
```
(1) Dàn khái niệm            (2) Trích điều luật          (3) Sinh thẻ bằng Claude       (4) Kiểm tra máy        (5) Bạn duyệt       (6) Build
  từ mục lục giáo trình/      nguyên văn từ vbpl.vn /      prompt có ràng buộc:           schema, 4 phương án    sửa trực tiếp       JSON → web
  slide + đề thi (chủ đề)     dataset CC BY 4.0            chỉ dùng điều luật đã cho,     khác nhau, có căn cứ,   trong file hoặc     + catalog
                                                            trả JSON theo schema           không trùng, cloze có   bảng Notion/Sheets
                                                                                            đúng 1 chỗ trống…
```
- Bước (3) dùng Claude API (skill `claude-api` trong phiên này có tài liệu). Mỗi khái niệm sinh: 1 thẻ giới thiệu, 2 câu nhận biết, 1–2 cặp phân biệt, 2 cloze, 2 tình huống, 1 câu mở + từ khóa. Ước tính 60 khái niệm ≈ 600 thẻ ≈ vài USD token.
- Bước (4) là `build.py` mở rộng từ `web/build_catalog.py` hiện có: bộ nào lỗi thì bị loại, không lên web (giữ triết lý cũ).
- Skill sẵn có hỗ trợ: `anthropic-skills:vn-legal-exam-analysis` (phân tích đề luật VN), `anthropic-skills:study-kit`, `anthropic-skills:learn`, `anthropic-skills:data-pipeline` (cào vbpl.vn đúng luật, theo dõi văn bản mới). Connector: **Google Drive** (bạn bỏ slide/giáo trình vào một thư mục, Claude đọc để lập dàn), **Firecrawl** (cào vbpl.vn khi dataset thiếu văn bản mới), **Hugging Face** (tải dataset), **Notion** (nếu muốn bảng duyệt thẻ có trạng thái).

### 3.3 Schema dữ liệu (JSON, trong repo `web/content/`)
```jsonc
// content/subjects/dan-su.json
{ "id": "dan-su", "title": "Luật Dân sự", "chapters": [
  { "id": "tai-san", "title": "Tài sản", "lessons": [
    { "id": "tai-san-1", "title": "Tài sản là gì", "concepts": ["tai-san", "vat", "tien", "giay-to-co-gia", "quyen-tai-san"] } ] } ] }

// content/concepts/dan-su/tai-san.json
{ "id": "tai-san", "subject": "dan-su", "chapter": "tai-san",
  "term": "Tài sản",
  "definition": "Tài sản là vật, tiền, giấy tờ có giá và quyền tài sản.",   // nguyên văn khoản 1 Điều 105
  "plain": "Nói đơn giản: mọi thứ có giá trị mà pháp luật cho phép bạn sở hữu, kể cả quyền đòi nợ.",
  "example": "Chiếc xe máy, 5 triệu trong tài khoản, sổ tiết kiệm và quyền đòi bạn trả nợ đều là tài sản.",
  "source": { "kind": "statute", "cite": "Khoản 1 Điều 105 BLDS 2015", "url": "https://vbpl.vn/..." },
  // môn lịch sử: { "kind": "textbook", "cite": "Giáo trình LSNN&PL Việt Nam, ĐH Luật Hà Nội, tr. 215" } hoặc { "kind": "primary", "cite": "Quốc triều hình luật, Điều 1" }
  "checked": "2026-10-31",
  "confusables": ["quyen-tai-san", "vat"],
  "keywords": ["vật", "tiền", "giấy tờ có giá", "quyền tài sản"],
  "items": [
    { "type": "mcq", "level": 1, "q": "Theo BLDS 2015, tài sản gồm những gì?", "options": [...], "answer": 0, "explain": "...", "basis": "..." },
    { "type": "pair", "level": 2, "left": "tai-san", "right": "quyen-tai-san", "cases": [ { "text": "Quyền đòi 10 triệu bạn cho vay", "answer": "right" } ] },
    { "type": "cloze", "level": 3, "text": "Tài sản là {{vật}}, {{tiền}}, giấy tờ có giá và {{quyền tài sản}}.", "bank_extra": ["hoa lợi", "lợi tức"] },
    { "type": "case", "level": 4, "q": "A nợ B 20 triệu. B chết, để lại quyền đòi nợ này cho con. Quyền đòi nợ có phải tài sản thừa kế không?", "options": [...], "answer": 1, "explain": "..." },
    { "type": "recall", "level": 5, "q": "Vì sao quyền đòi nợ được coi là tài sản?", "model": "...", "keywords": ["quyền tài sản", "trị giá được bằng tiền", "Điều 115"] }
  ] }
```
Loại thẻ bổ sung cho môn lịch sử: `"type": "order"` (sắp thứ tự, `items` + `answer` là thứ tự đúng), `"type": "match"` (ghép đôi, `pairs`), `"type": "truefalse"` (nhận định đúng/sai + giải thích). Bộ 10 câu hiện có (`web/data/sets/*.json`) **giữ nguyên định dạng**, chỉ thêm `concept` cho từng câu khi có.

### 3.4 Lộ trình nội dung (đã chốt ngày 01/11/2026)
| Thứ tự | Môn | Ghi chú |
|---|---|---|
| 1 | **Luật Hiến pháp** (Hiến pháp 2013 và các luật tổ chức: Quốc hội, Chính phủ, Tòa án, Viện kiểm sát, Chính quyền địa phương; quyền con người, quyền công dân; chế độ bầu cử) | Có văn bản hiện hành trên vbpl.vn → mô hình "căn cứ điều luật" dùng được trọn vẹn. Lưu ý đối chiếu **Hiến pháp sửa đổi 2025** và Luật Tổ chức chính quyền địa phương mới (bỏ cấp huyện) — nhiều giáo trình cũ đã lạc hậu. |
| 2 | **Lịch sử nhà nước và pháp luật** (Việt Nam trước, Thế giới sau) | Không có luật hiện hành; dùng `source` kiểu giáo trình/sử liệu; thẻ dạng mốc thời gian, sắp thứ tự, ghép đôi (2.2). |
| 3 | Pháp luật đại cương | 2 bộ đã có; nhiều khái niệm trùng với Hiến pháp (nhà nước, pháp luật, quy phạm) → tái dùng thẻ. |
| 4 | Luật Dân sự 1, Lao động, Hình sự phần chung | 3 bộ đã có. |
| 5+ | Luật Doanh nghiệp, Thương mại | Đúng chuyên ngành Luật Kinh tế. |

**Kim chỉ nam nội dung:** mục lục và cách phân chương của giáo trình **ĐH Luật Hà Nội** và **ĐH Luật TP.HCM** làm khung; bạn gửi thêm giáo trình/slide/đề cương của trường bạn qua Google Drive; Claude so sánh ba nguồn, lập dàn khái niệm hợp nhất, bạn tinh chỉnh. Định nghĩa, ví dụ, câu hỏi **tự viết**, không chép giáo trình (3.1).

---

## 4. Kiến trúc kỹ thuật

### 4.1 Ba phương án
| | A. Giữ vanilla JS hiện tại, mở rộng | **B. Vite + Svelte 5 + TypeScript (đề xuất)** | C. Next.js + Supabase (như các Duolingo clone) |
|---|---|---|---|
| Ưu | Không thêm công cụ; file tĩnh | Nhẹ (bundle ~30 KB), **transition/animation tích hợp**, component rõ ràng, TypeScript bắt lỗi dữ liệu; vẫn build ra tĩnh cho Cloudflare Pages | Nhiều mã mẫu (sanidhyy/duolingo-clone MIT) |
| Nhược | 6 loại bài tập + state FSRS + hiệu ứng trong một file `app.js` sẽ không kiểm soát nổi | Phải học Svelte nếu bạn tự sửa (cú pháp gần HTML, dễ nhất trong các framework) | Cần server, Clerk/Neon/Stripe, nặng; không cần cho giai đoạn 1 |
| Kết luận | Không đủ | **Chọn** | Quá sớm |

### 4.2 Stack đề xuất (tất cả MIT/miễn phí)
| Lớp | Lựa chọn | Ghi chú |
|---|---|---|
| Build/UI | Vite 7, Svelte 5, TypeScript | `svelte/transition`, `svelte/motion` cho hoạt ảnh |
| Lịch ôn | `ts-fsrs` ^6 (MIT) | v6 yêu cầu Node ≥ 24 lúc build; nếu máy bạn Node 20 thì dùng v5 |
| Lưu cục bộ | IndexedDB qua `dexie` (Apache-2.0) | Tiến độ, review log, cài đặt; xuất/nhập JSON để không mất dữ liệu |
| Âm thanh | `howler.js` (MIT) + bộ SFX **Kenney Interface Sounds / UI Audio** (CC0, 150 file) | Tiền tải, bật/tắt trong cài đặt |
| Hiệu ứng | `canvas-confetti` (MIT), `motion` (MIT) khi cần spring vật lý, Lottie qua `@lottiefiles/dotlottie-web` cho hoạt ảnh thăng bậc (file tự làm hoặc Lottie Simple License, dùng thương mại không cần ghi công) | Giữ số thư viện tối thiểu |
| Đọc đáp án | **Web Speech API** `speechSynthesis` với voice `vi-VN` | Không chi phí, không máy chủ; fallback: ẩn nút nếu trình duyệt không có giọng vi |
| PWA | `vite-plugin-pwa` | Cài lên màn hình điện thoại, học offline |
| Deploy | Cloudflare Pages (đã dùng) | Build command `npm run build`, output `dist` |
| Giai đoạn 2 — tài khoản & xếp hạng | **Supabase** (Auth Google, Postgres, RLS) — free: 50.000 MAU, 500 MB, **tự tạm dừng sau 1 tuần không hoạt động** → cần GitHub Actions ping mỗi ngày | Phương án thay thế: Cloudflare D1 + Workers (cùng nhà với Pages; free 500 MB, giới hạn đọc/ghi theo ngày bắt đầu siết từ 09/2026). Chốt ở mục 11. |

### 4.3 Cấu trúc thư mục dự kiến
```
web/
  src/
    lib/engine/      fsrs.ts (bọc ts-fsrs), progress.ts (bậc 0–6), session.ts (ghép đợt), grading.ts (cloze/recall)
    lib/content/     loader.ts, schema.ts (zod), types.ts
    lib/ui/          Card*.svelte (6 loại), Feedback.svelte, Progress.svelte, Rank.svelte, Streak.svelte
    lib/fx/          sfx.ts, confetti.ts, reveal.ts (nền sáng dần), tts.ts
    routes/          Home, Subject, Lesson, Review, Quiz10, Profile, Leaderboard(G2)
  content/           subjects/*.json, concepts/<môn>/*.json, sets/*.json (bộ 10 câu cũ)
  scripts/           build-content.py (kiểm tra + gộp), gen-cards.py (gọi Claude, G1b)
  static/            sfx/, art/, icons/
```

---

## 5. UI/UX — layout cho PC, laptop, điện thoại

### 5.1 Hướng thiết kế (không "AI slop")
- **Ẩn dụ:** *Văn Miếu hiện đại* — giấy dó, mực tàu, son đỏ ấn triện; typography mạnh (Be Vietnam Pro đã dùng, thêm một serif như *Noto Serif* cho trích điều luật). Không gradient tím hồng, không icon stock, không card bo tròn trắng vô hồn.
- **Một màn một việc:** trong phiên học chỉ có thẻ, không sidebar, không banner. Mọi thứ khác (bậc, chuỗi, bảng xếp hạng) nằm ở màn chính.
- **Mật độ theo thiết bị:**
  - **Điện thoại (< 640 px):** một cột; thẻ chiếm 100% rộng; phương án là nút cao ≥ 48 px; thanh tiến độ phiên ở trên; nút chính dính đáy.
  - **Laptop (≥ 1024 px):** **hai cột**: trái (720 px, cố định giữa) là thẻ; phải (320 px) là *bảng đợt*: 4–5 khái niệm với vòng tròn 6 nấc "sức nhớ" tăng dần theo thời gian thực, căn cứ điều luật đang học, nút nghe. Người dùng PC nhìn thấy tiến độ ngay khi trả lời.
  - **Màn lớn (≥ 1440 px):** giữ bề ngang nội dung 1100 px, nền tranh lộ dần ở hai bên.
- **Bàn phím:** 1–4 chọn phương án, Enter tiếp, Space nghe, Esc thoát. Người PC học nhanh gấp đôi.
- **Accessibility:** tương phản AA, `prefers-reduced-motion` tắt hiệu ứng, focus ring rõ, đọc màn hình đọc được thẻ. Dùng skill `design:accessibility-review` trước khi phát hành.

### 5.2 Danh sách màn hình
| Màn | Nội dung chính |
|---|---|
| **Trang chủ** | Thẻ "Ôn hôm nay (N)" to nhất; chuỗi 🔥 + bậc khoa cử + XP tuần; lộ trình môn dạng *con đường* (nút tròn từng đợt, đã xong/đang/khóa); mục "Luyện đề 10 câu". |
| **Đợt học** | Thẻ giữa màn; thanh tiến độ phiên; cột phải (desktop) bảng 4–5 khái niệm; nút "thoát, giữ tiến độ". |
| **Phản hồi sau câu** | Khung dưới thẻ: Đúng/Sai, giải thích, căn cứ + link, nút nghe; ở sai: hiện cả khái niệm dễ nhầm. |
| **Kết thúc phiên** | Khái niệm nào lên bậc (hoạt ảnh cây/triện), XP, chuỗi +1, thăng bậc nếu có, "Hẹn ôn ngày mai: N". Nút chia sẻ ảnh (Canvas → PNG). |
| **Hồ sơ** | Bậc khoa cử + bậc phẩm từng môn, huy hiệu, lịch nhiệt (heatmap) ngày học, biểu đồ sức nhớ, xuất dữ liệu. |
| **Bảng xếp hạng (G2)** | Tuần, theo *giải*: top 10 lên giải; bạn bè; lớp (mã lớp). |
| **Cài đặt** | Âm thanh, giọng đọc, retention FSRS, giảm chuyển động, chủ đề sáng/tối. |

### 5.3 Công cụ thiết kế có sẵn trong phiên
- **Figma MCP** (đã kết nối): dựng mockup 3 màn chính ở 3 kích cỡ trước khi code; skill `figma-generate-design`.
- **Canva connector**: sinh tranh nền (bộ tranh "Văn Miếu" lộ dần), huy hiệu, khung avatar; có `generate-image` và `remove-background`.
- Skill `frontend-design:frontend-design` khi code UI; `design:design-critique`, `design:ux-copy` (microcopy tiếng Việt cho nút, lỗi, trạng thái trống).

---

## 6. Vòng phản hồi "dopamine" sau mỗi câu đúng

Nguyên tắc: **ngắn (< 600 ms), xếp lớp, có ý nghĩa**, và luôn tắt được.

| Lớp | Đúng | Sai | Thăng bậc / mốc |
|---|---|---|---|
| Âm | "ping" ngắn, cao dần theo **combo** (3 đúng liên tiếp lên nửa cung; như Duolingo) | tiếng "thud" trầm, êm, không chói | hợp âm vang + trống chầu nhỏ (chủ đề khoa cử) |
| Chuyển động | phương án đúng nảy (spring), dấu ✓ vẽ nét, thanh sức nhớ của khái niệm dâng 1 nấc | thẻ rung ngang 1 lần, phương án đúng sáng lên | thẻ khái niệm lật thành **ấn triện son**; confetti vàng; hoạt ảnh Lottie thăng bậc |
| Nền | **tranh nền lộ thêm 1 mảng** (mỗi phiên là một bức, 15–25 mảng; xong phiên = tranh hoàn chỉnh, lưu vào "bộ sưu tập") | không thay đổi | nền đổi sang tranh đặc biệt theo bậc |
| Chữ | microcopy ngẫu nhiên theo ngữ cảnh: "Chuẩn điều 105.", "Phân biệt được rồi đó." | nêu ngay khái niệm dễ nhầm | "Đỗ Tú tài!" |
| Rung | `navigator.vibrate(10)` trên điện thoại | 2 nhịp ngắn | 3 nhịp |
| Đọc | nút 🔊 đọc đáp án/định nghĩa (Web Speech API, vi-VN) | đọc đáp án đúng | — |

**Combo & XP:** 10 XP/câu đúng, ×1,5 từ combo 5, ×2 từ combo 10; hoàn thành phiên +20; hoàn thành đợt lần đầu +50. Không trừ XP khi sai.

---

## 7. Hệ thống giữ chân (retention) cho Gen Z

### 7.1 Bậc khoa cử (thang chính, theo tổng XP)
| Bậc | XP tích lũy | Biểu tượng |
|---|---|---|
| Thí sinh | 0 | bút lông |
| Tú tài | 300 | nghiên mực |
| Cử nhân | 1.000 | sách cuốn |
| Tiến sĩ | 3.000 | bia đá |
| Hoàng giáp | 7.000 | áo bào xanh |
| Thám hoa | 15.000 | áo bào đỏ |
| Bảng nhãn | 30.000 | kiệu |
| Trạng nguyên | 60.000 | lọng vàng |
Mỗi bậc chia 3 cấp (III → II → I) để thăng cấp thường hơn (Duolingo đo được "mốc nhỏ" giữ chân tốt hơn mốc xa).

### 7.2 Phẩm hàm theo môn (thang phụ, theo % khái niệm ở bậc ≥ 5)
Cửu phẩm (10%) → Bát phẩm (20%) → … → Nhất phẩm (90%) → *Thái sư* (100% + ôn đủ 30 ngày). Hiện cạnh tên môn.

### 7.3 Chuỗi ngày (streak)
- Tính khi hoàn thành ≥ 1 phiên ôn (không cần học mới). Mốc 3/7/14/30/100/365 có hoạt ảnh riêng + ảnh chia sẻ.
- **Bùa giữ chuỗi**: nhận 1 bùa mỗi 7 ngày liên tiếp, tối đa 2; mất ngày thì tự dùng. Có "Nghỉ phép cuối tuần" mua bằng XP (bằng chứng Duolingo +4%).
- **Cược chuỗi** (G2): đặt 100 XP, giữ 7 ngày nhận 300 XP (bằng chứng Duolingo +14% D7).
- Nhắc nhở: thông báo PWA (giai đoạn 2), mặc định tắt, chỉ 1 lần/ngày vào giờ người dùng chọn.

### 7.4 Bảng xếp hạng & giải (G2)
- Theo **tuần**, chia *giải* 30 người cùng mức (như Duolingo leagues) đặt tên theo trường thi: *Thi Hương → Thi Hội → Thi Đình*. Top 10 lên giải, 5 cuối xuống.
- Có **bảng lớp**: nhập mã lớp (6 ký tự) để thi đua với bạn cùng lớp, đây là kênh lan truyền tự nhiên nhất trong trường.
- Chống cày XP vô nghĩa (bài học Duolingo): XP ôn lại khái niệm đã thuần thục giảm 50%; XP học mới và tình huống đầy đủ.

### 7.5 Huy hiệu & vật phẩm
- **Huy hiệu** gắn hành vi có ích: "Phân biệt rõ" (20 cặp A/B đúng liên tiếp), "Đúng điều luật" (mở link điều luật 50 lần), "Dậy sớm", "Cú đêm", "Hoàn thành chương X".
- **Vật phẩm trang trí**: khung avatar, tranh nền đặc biệt, con dấu chữ ký. Nguồn: top 3 giải tuần, giữ chuỗi 30/100 ngày, hoàn thành môn. Không bán, chỉ kiếm được → tạo giá trị khoe.
- **Ảnh chia sẻ**: kết thúc phiên/mốc chuỗi sinh PNG 1080×1920 (Canvas API) có tên, bậc, chuỗi, QR → đăng story; đây là kênh thay thế video.

---

## 8. Kho công cụ đã khảo sát (mục tiêu 1)

### 8.1 Dùng trực tiếp
| Công cụ | License | Dùng để |
|---|---|---|
| `open-spaced-repetition/ts-fsrs` | MIT | Lịch ôn. Kèm `fsrs-browser` (WASM) để tối ưu tham số sau. |
| Svelte 5 + Vite | MIT | Khung UI. |
| `dexie` | Apache-2.0 | IndexedDB. |
| `howler.js`, `canvas-confetti`, `motion`, `@lottiefiles/dotlottie-web` | MIT | Âm, hiệu ứng. |
| Kenney *Interface Sounds* (100), *UI Audio* (50), *Impact Sounds* | CC0 | SFX. |
| LottieFiles (free, Lottie Simple License) | thương mại OK, không cần ghi công | Hoạt ảnh thăng bậc nếu không tự vẽ. |
| `vite-plugin-pwa` | MIT | PWA/offline. |
| Web Speech API | tích hợp trình duyệt | Đọc đáp án tiếng Việt. |
| `th1nhng0/vietnamese-legal-documents` | CC BY 4.0 | Toàn văn luật từ vbpl.vn + đồ thị sửa đổi/thay thế → kiểm tra hiệu lực. |
| `GreenNode/zalo-ai-legal-text-retrieval-vn` | MIT | 61k điều luật đã tách + 818 câu hỏi → kiểm tra truy hồi căn cứ. |
| Supabase (G2) | Apache-2.0 / free tier | Auth Google, bảng xếp hạng, đồng bộ. |

### 8.2 Tham khảo thiết kế/kiến trúc, không dùng mã
| Dự án | License | Học gì |
|---|---|---|
| `kirill-markin/flashcards-open-source-app` (Nibomo) | MIT | Kiến trúc FSRS đa nền tảng, docs về scheduling, MCP connector cho AI tạo thẻ. |
| `sanidhyy/duolingo-clone` (694★), `bryanjenningz/react-duolingo` (471★) | MIT | Vòng lặp bài học, hearts/XP/quests UI, màn kết thúc phiên, bảng xếp hạng. |
| `kantord/LibreLingo` (archived, AGPL) | AGPL | Loại bài tập (chọn từ, sắp chữ), định dạng khóa học YAML. |
| `Khan/perseus` | MIT | Widget bài tập, chấm điểm, a11y; quá nặng để nhúng. |
| `Dingding-leo/Denki`, `silicq/ordkort`, `zsh-eng/spaced`, `ishiko732/ts-fsrs-demo` | MIT/AGPL | Ví dụ tích hợp ts-fsrs gọn. |
| `ArtCC/freelingo` | AGPL | XP, streak, kiểm tra cuối cấp, AI tutor — ý tưởng cho giai đoạn 3. |
| H5P, Scholarsome | MIT / AGPL | Bỏ qua: PHP/Angular, không phù hợp web tĩnh. |

### 8.3 Dữ liệu luật & đề (xem 3.1)
`VLSP2025-LegalSML/Public-Test` (trắc nghiệm luật), `CMC-OPENAI/VLegal-Bench` (10.450 mẫu chuyên gia duyệt, 2026), `duyet/vietnamese-legal-instruct` (CC BY 4.0, 467k cặp hỏi–đáp sinh máy), ALQAC (qua form VLSP), `luanngo/Vietnamese-Legal-Chat-Dataset`. Dùng để **đối chiếu & kiểm tra**, không nhập thẳng.

### 8.4 TTS tiếng Việt — kết luận
| Phương án | Giấy phép | Kết luận |
|---|---|---|
| Web Speech API (Chrome: Google vi-VN; Edge: HoaiMy/NamMinh Neural; Safari/iOS: Linh) | tích hợp | **Dùng.** Chất lượng khác nhau theo máy nhưng đủ đọc 1–2 câu. |
| `edge-tts` (gọi dịch vụ Read Aloud của Edge) | Microsoft không có văn bản cho phép dùng ngoài trình duyệt | Vùng xám → chỉ dùng tạm cho bản thử, không cho sản phẩm. |
| Piper `vi_VN-vais1000-medium` | dữ liệu CC BY 4.0, nhưng fine-tune từ giọng lessac (Blizzard, phi thương mại) | Vùng xám; `25hours_single` license "Unknown"; `vivos` CC BY-NC-SA. Không dùng. |
| F5-TTS-Vietnamese, viVoice/viXTTS | CC BY-NC-SA 4.0 | Không dùng cho sản phẩm có mục tiêu thương mại. |
| `dinhthuan/index-tts-2-vietnamese`, `thangquang09/parler-tts-vietnamese` | Apache-2.0 | Ứng viên nếu sau này cần giọng cố định, chạy offline để pre-render MP3; cần nghe thử chất lượng. |

### 8.5 Skill, connector, plugin trong phiên Claude dùng cho dự án
| Việc | Công cụ |
|---|---|
| Lập dàn khái niệm từ slide/giáo trình | Google Drive connector + skill `anthropic-skills:vn-legal-exam-analysis`, `study-kit`, `learn` |
| Lấy & theo dõi văn bản luật | Hugging Face connector (dataset), Firecrawl (vbpl.vn), skill `anthropic-skills:data-pipeline`; **Legal Data Hunter** MCP có 230 quốc gia — cần kiểm tra độ phủ Việt Nam trước khi dựa vào |
| Sinh thẻ hàng loạt | Claude API (skill `claude-api`), ép JSON theo schema |
| Mockup & design system | Figma MCP (`figma-generate-design`, `figma-use`), Canva (tranh nền, huy hiệu) |
| Code UI chất lượng | `frontend-design`, `web-artifacts-builder`, `design:*` (critique, a11y, ux-copy), `dataviz` (heatmap, biểu đồ sức nhớ) |
| Kiểm thử | Playwright đã cài sẵn trong môi trường; `superpowers:test-driven-development` |
| Video (sau) | `remotion:*` — để trong archive, không dùng giai đoạn này |

---

## 9. Pháp lý & an toàn sản phẩm
1. **Bản quyền nội dung**: như 3.1. Thêm trang "Nguồn" liệt kê văn bản + ngày đối chiếu hiệu lực.
2. **Hiệu lực văn bản**: mỗi khái niệm có `checked` (ngày đối chiếu); script cảnh báo khi văn bản trong dataset có quan hệ "bị thay thế/sửa đổi" mới hơn `checked`.
3. **Không tư vấn pháp lý**: footer hiện tại giữ nguyên; thẻ tình huống luôn ghi "tình huống giả định".
4. **Dữ liệu cá nhân** (Luật Bảo vệ dữ liệu cá nhân 2025, Nghị định 13/2023): giai đoạn 1 không thu gì (tất cả trong trình duyệt). Giai đoạn 2 chỉ email Google + tên hiển thị; bảng xếp hạng dùng biệt danh; có nút xóa tài khoản; viết chính sách riêng tư ngắn.
5. **Luật Luật sư**: không xưng luật sư; không cung cấp "dịch vụ pháp lý".
6. **Giấy phép mã nguồn**: dự án dùng toàn MIT/Apache/CC0 → có thể giữ repo private và sau này thương mại hóa; tránh AGPL (LibreLingo, freelingo, ordkort) nếu không mở mã.

---

## 10. Lộ trình

| Giai đoạn | Tuần | Việc | Bàn giao |
|---|---|---|---|
| **G0 — Dọn & quyết định** | 0 | Ẩn video, README trỏ web (**đã làm trong commit này**); bạn duyệt spec này; chốt 5 câu hỏi mục 11 | Spec duyệt |
| **G1a — Khung web mới** | 1–2 | Vite+Svelte, router, nạp content JSON, 6 loại thẻ, engine bậc 0–6 + ts-fsrs, lưu IndexedDB, chuyển 5 bộ 10 câu sang cấu trúc mới, layout 3 kích cỡ, SFX + hiệu ứng cơ bản, TTS | Web chạy local với 1 chương PLĐC mẫu (10 khái niệm) |
| **G1b — Nội dung PLĐC** | 2–4 | Dàn 8 chương từ giáo trình/slide (bạn cung cấp qua Drive), trích điều luật, sinh thẻ bằng Claude, bạn duyệt theo lô 15–20 khái niệm | ≥ 60 khái niệm, ≥ 300 thẻ đã duyệt |
| **G1c — Game layer cục bộ** | 4–5 | XP, bậc khoa cử, phẩm hàm, chuỗi + bùa, huy hiệu, tranh nền lộ dần (bộ 5 tranh đầu), ảnh chia sẻ, PWA | MVP công khai trên Cloudflare Pages; test với 10 bạn cùng lớp |
| **G2 — Xã hội** | 6–8 | Supabase: đăng nhập Google, đồng bộ tiến độ, bảng xếp hạng tuần + giải, bảng lớp, cược chuỗi, thông báo | 100 người dùng; đo D7 |
| **G3 — Mở rộng** | 9–16 | Luật Dân sự 1, Lao động, Hình sự; chấm câu mở bằng Claude; tối ưu FSRS cá nhân; thi thử chương | 3 môn; 500 tài khoản ôn 7 ngày |

Mỗi giai đoạn theo quy trình: spec → `writing-plans` → TDD → review → deploy. Sau G1a sẽ có bản demo để bạn thử trước khi làm nội dung ồ ạt.

---

## 11. Năm quyết định (đã chốt 01/11/2026)

| # | Câu hỏi | Quyết định của Hào |
|---|---|---|
| 1 | Stack | **Vite + Svelte 5 + TypeScript** |
| 2 | Thang bậc | **Khoa cử** (Tú tài → Trạng nguyên) thang chính + **cửu phẩm** theo môn |
| 3 | Môn đầu | **Luật Hiến pháp** và **Lịch sử nhà nước và pháp luật** |
| 4 | Backend G2 | **Supabase** |
| 5 | Tài liệu nguồn | Claude tự lập dàn từ giáo trình **ĐH Luật Hà Nội + ĐH Luật TP.HCM**; Hào gửi thêm giáo trình/slide trường mình; so sánh và tinh chỉnh |

Bước tiếp theo: kế hoạch triển khai G1a tại `docs/superpowers/plans/`.

---

## Phụ lục A — Nguồn đã tra cứu (01/11/2026)
- ts-fsrs: github.com/open-spaced-repetition/ts-fsrs, npm ts-fsrs 6.0.0 (MIT).
- Nibomo: github.com/kirill-markin/flashcards-open-source-app (MIT).
- LibreLingo: github.com/kantord/LibreLingo (AGPL, archived); fork LibreLingoCommunity.
- Duolingo clones: github.com/sanidhyy/duolingo-clone, github.com/bryanjenningz/react-duolingo (MIT).
- Khan Perseus: github.com/Khan/perseus (MIT). H5P: h5p.org/MIT-licensed.
- Duolingo blog: "How streaks keep learners committed" (Streak Wager +14% D7, Weekend Amulet +4%), "Animating the Duolingo streak", "Habit research behind your streak". Class Central 10/2025 về Energy/Hearts. Memrise help: Learn New Words, 6 tests to bloom.
- Dataset: hf.co/datasets/th1nhng0/vietnamese-legal-documents (CC BY 4.0), hf.co/datasets/GreenNode/zalo-ai-legal-text-retrieval-vn (MIT), hf.co/datasets/duyet/vietnamese-legal-instruct (CC BY 4.0), vlsp.org.vn/vlsp2025/eval/legalSLM, arxiv.org/abs/2512.14554 (VLegal-Bench), aclanthology.org/2026.findings-acl.1801 (ViLegalLM).
- TTS: hf.co/rhasspy/piper-voices (MODEL_CARD vais1000: dataset CC BY 4.0, finetuned from lessac), hf.co/hynt/F5-TTS-Vietnamese-ViVoice (CC BY-NC-SA), github.com/rany2/edge-tts, Microsoft Q&A 06/2026 về thương mại hóa Read Aloud.
- SFX/hiệu ứng: kenney.nl/assets/interface-sounds, kenney.nl/assets/ui-audio (CC0); lottiefiles.com/page/license.
- Backend: supabase.com/pricing (Free: 50k MAU, 500 MB, pause sau 1 tuần); developers.cloudflare.com/d1/platform/limits; changelog D1 01/09/2026.
- Web trắc nghiệm luật VN: dethitracnghiem.vn, baitaptracnghiem.com (63 đề, 824k lượt), detracnghiem.com, khoahoc.vietjack.com (VIP), vndoc.com (PRO), tracnghiemcongchuc.com, aigiaoduc.thuvienphapluat.vn.
