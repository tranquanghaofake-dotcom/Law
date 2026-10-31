# BRIEF — THƯƠNG HIỆU CÁ NHÂN TRẦN QUANG HÀO
Phiên bản 1 · 31/10/2026 · Trạng thái: tuần 1 (tiến trình 0)

## 1. Định vị

**Một câu:** *Sinh viên Luật Kinh tế giải thích chuyện tiền – hợp đồng – công việc cho người trẻ, bằng câu hỏi thật trên mạng và căn cứ điều luật thật.*

**Không phải:** kênh reup, kênh "mọi thứ về luật", kênh tư vấn pháp lý.

**Hệ thống hai mục tiêu:**
```
Câu hỏi thật trên MXH → Video giải đáp (TikTok) → Link bio → Web học Luật
        ↑                                                    │
        └──── câu hỏi khán giả gửi về ◄──── người dùng tự luyện ┘
```
TikTok = kênh phân phối + bằng chứng năng lực. Web = tài sản (traffic, tài khoản, sau này gói trả phí).

## 2. Trụ nội dung (bộ lọc, không phải nguồn)

Khán giả mục tiêu: **người 18–30 đang đi học/đi làm, thuê trọ, vay mượn, mua bán online.**

| Trụ | Phạm vi | Ngành luật liên quan |
|---|---|---|
| T1 — Tiền & hợp đồng đời thường | đặt cọc, vay mượn bạn bè, chuyển khoản nhầm, mua hàng online, thuê trọ | Dân sự, Thương mại, Hình sự (lừa đảo, chiếm giữ) |
| T2 — Đi làm | thử việc, nghỉ việc, giữ lương, giữ bằng, hợp đồng CTV, tăng ca, BHXH | Lao động, BHXH |
| T3 — "Có bị đi tù không?" | ranh giới dân sự ↔ hình sự trong các tình huống đời thường | Hình sự, Hành chính |

**Quy tắc 80/20:** 80% video thuộc T1–T3; 20% wildcard (câu hỏi quá hay + trả lời chắc).

**Điểm chọn (bảng curation):** 3 cột *Viral* / *Đúng khán giả* / *Trả lời chắc*, mỗi cột 0–1. Chọn khi tổng ≥ 2. Cột 3 = 0 thì không làm dù hai cột kia = 1.

## 3. Quy tắc trích dẫn & an toàn pháp lý (bắt buộc, không ngoại lệ)

Căn cứ: Điều 25 Luật SHTT (trích dẫn hợp lý để bình luận, minh họa; nêu tên tác giả, nguồn; không làm sai ý; không ảnh hưởng khai thác bình thường của tác phẩm); Điều 36 Nghị định 147/2024/NĐ-CP (người dùng chịu trách nhiệm về nội dung mình đăng).

1. **Chỉ trích một phần** câu hỏi (≤ 2 câu hoặc ≤ 40 từ), không đọc lại cả bài. Phần còn lại tóm tắt bằng lời mình.
2. **Ghi nguồn trên màn hình**: nền tảng + tên tài khoản (hoặc "ẩn danh theo yêu cầu"). Không ghi nguồn giả.
3. **Che tên, avatar, ảnh người hỏi và người thứ ba**; không đọc tên thật, tên công ty, địa chỉ.
4. Phần của mình (căn cứ + kết luận) phải chiếm **≥ 70% thời lượng**. Đây là "bình luận" theo Điều 25 và là tín hiệu "original" với TikTok.
5. **Không dùng video/ảnh của người khác làm nền**; nền là footage stock có giấy phép, screen-record của mình, hoặc quay thật.
6. Mỗi video có **disclaimer** (chữ trên màn + lời): *"Mình là sinh viên Luật, đây là thông tin chung, không phải tư vấn pháp lý cho trường hợp cụ thể."* Không tự xưng/gợi ý mình là luật sư (Luật Luật sư 2006 sđ 2012).
7. Mọi căn cứ phải ghi **số điều + tên văn bản + năm**. Không chắc thì không nói; kiểm tra văn bản còn hiệu lực trước khi quay.
8. Không bình luận vụ việc đang được điều tra/xét xử có tên thật; không phán "người này có tội".
9. Chủ bài gốc yêu cầu gỡ → gỡ trong 24h, không tranh cãi.

## 4. Format video chuẩn (60–75 giây)

| Giây | Khối | Ghi chú |
|---|---|---|
| 0–3 | Hook | Câu kết luận gây ngạc nhiên hoặc câu hỏi phản xạ |
| 3–12 | Trích câu hỏi | Screenshot đã che danh tính + đọc ≤ 2 câu |
| 12–50 | Căn cứ | 1–2 điều luật, nói bằng ngôn ngữ đời thường, chữ điều luật hiện trên màn |
| 50–68 | Kết luận + việc cần làm | 2–3 bước hành động cụ thể |
| 68–75 | CTA + disclaimer | "Luyện 10 câu về điều luật này ở link bio" |

Lý do > 60 giây: tương thích mọi chương trình kiếm tiền và thuật toán ưu tiên watch-time.

## 5. Pipeline sản xuất

- Curation: 15 phút/ngày, thủ công, lưu vào `TikTok-Phap-Ly_Curation_v1.csv`. Không scrape tự động (vi phạm ToS Meta/Reddit; không cần thiết ở quy mô 1 video/ngày).
- Kịch bản: template ở mục 4, mỗi tuần viết 7, duyệt căn cứ 1 lần/tuần.
- Dựng: MoneyPrinterTurbo (MIT) hoặc reddit-tiktok-gen (MIT) làm khung; TTS giai đoạn 1 dùng Edge TTS vi-VN (miễn phí, được dùng thương mại); **không dùng** VietTTS/F5-TTS-Vietnamese (model CC BY-NC). Giai đoạn 2 chuyển sang giọng thật + mặt thật.
- Tần suất: 1 video/ngày, 6 tuần liên tục trước khi đánh giá.

## 6. Web học Luật — phạm vi MVP

- Môn đầu tiên: **Pháp luật đại cương** (mọi sinh viên không chuyên đều học → thị trường lớn nhất).
- 300 thẻ, 4 loại: (1) cloze nguyên văn điều luật; (2) phân rã dấu hiệu khái niệm; (3) cặp phân biệt A/B (interleaving); (4) MCQ mini-tình huống 1–2 câu có giải thích + căn cứ.
- Lịch ôn: FSRS (ts-fsrs). Fork từ kar-dots (nhẹ, PWA) hoặc Nibomo (đầy đủ hơn).
- Stack: Astro/Next.js + Supabase + Cloudflare Pages/Vercel (miễn phí).
- Khác biệt so với các web trắc nghiệm hiện có: họ cho *đề*, mình cho *hệ thống nhớ* + liên kết thẻ ↔ điều luật gốc ↔ video TikTok.
- Pháp lý: văn bản QPPL không được bảo hộ quyền tác giả (Điều 15 Luật SHTT) → dùng nguyên văn thoải mái; câu hỏi trong giáo trình/bộ đề của người khác thì **tự soạn lại**, không copy.

## 7. Lộ trình & KPI

| Giai đoạn | Việc | Chỉ số đạt |
|---|---|---|
| Tuần 1–2 | Brief, bảng curation, 30 kịch bản, chạy thử pipeline | 30 kịch bản đã duyệt căn cứ |
| Tuần 3–6 | Đăng 1 video/ngày | 42 video; biết hook nào thắng (xem hết, lưu, bình luận) |
| Tuần 4–8 | Web MVP | 300 thẻ PLĐC, đăng nhập Google, link bio hoạt động |
| Tháng 3–6 | Vòng lặp CTA ↔ web, mở rộng môn (LLNN&PL → Dân sự → Doanh nghiệp) | 5.000 follower; 500 tài khoản web ôn ≥ 7 ngày liên tiếp |

Chỉ sau khi đạt KPI tháng 6 mới cân nhắc gói trả phí.

## 8. Việc tuần này (checklist)

- [ ] Duyệt lại trụ T1–T3 và quy tắc mục 3
- [ ] Nhập 20 câu hỏi thật đầu tiên vào bảng curation, chấm điểm
- [ ] Duyệt căn cứ 10 kịch bản trong `TikTok-Phap-Ly_Script_v1.md`, thay câu hỏi mẫu bằng câu hỏi thật đã chọn
- [ ] Clone MoneyPrinterTurbo, render 1 video thử với Edge TTS vi-VN
- [ ] Clone kar-dots, chạy local, nạp 20 thẻ PLĐC thử
