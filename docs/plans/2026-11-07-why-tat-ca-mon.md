# Kế hoạch: giải thích từng phương án (`why`) cho tất cả môn + các việc kèm theo

07/11/2026 · Hào duyệt: làm theo đợt, 1–3 môn/phiên (≤ 2 giờ), mỗi đợt một nhánh/PR.

## Cách làm một đợt `why`
1. Đọc câu `mcq`/`case` của môn, đối chiếu điều luật trong `packages/content/data/laws/`.
2. Mỗi câu 4 lời giải thích theo thứ tự `options`: lời của đáp án mở đầu "Đúng:", nhiễu mở đầu "Sai:" và nói nhiễu đó thuộc quy định nào, sai ở đâu (có điều/khoản).
3. Thêm môn vào `WHY_DONE` trong `packages/content/tests/why.test.ts`; `npm run ci` xanh.

## Tiến độ (câu `mcq` + `case` chưa có `why`, đo 07/11/2026)
| Đợt | Môn | Số câu | Trạng thái |
|---|---|---|---|
| 1 | Hôn nhân và gia đình, Cạnh tranh | 50 + 32 | xong |
| 2 | Lao động 2, An sinh xã hội, Tố tụng dân sự | 24 + 24 + 32 | xong |
| 3 | Tài chính, Tài chính doanh nghiệp, Đầu tư | 36 + 36 + 38 | xong |
| 4 | Đất đai, Sở hữu trí tuệ, Quản trị tài sản trí tuệ | 38 + 46 + 40 | xong |
| 5 | Xây dựng VBPL, Ngân hàng, Thương mại 2 | 40 + 42 + 44 | xong |
| 6 | Dân sự, Thương mại 1, Lao động | 48 + 50 + 50 | xong |
| 7 | Dân sự 2, Hành chính | 52 + 60 | xong |
| 8 | Lý luận NN&PL, Hình sự | 60 + 68 | xong |
| 9–10 | Lịch sử NN&PL | 131 | xong |
| 11–12 | Hiến pháp | 221 | xong |
| 13–14 | Chứng khoán | 235 | xong |
| 15 | Bộ đề (470 câu) | schema + Quiz10 hỗ trợ `why`; 47/47 bộ có trong SETS_DONE | xong |

## Còn lại sau khi rà "lúc sai" (đo 11/11/2026) — nhánh `content/nhan-dinh-giai-thich`, chưa làm
44 câu nhận định có `explain` chỉ là số điều (ví dụ "Đúng. Khoản 2 Điều 39."), nên lúc trả lời sai người học không thấy lý do. Cần viết lại thành 1–2 câu nêu nội dung điều khoản, đối chiếu `packages/content/data/laws/` từng câu:

| Môn | Số câu | Môn | Số câu |
|---|---|---|---|
| Chứng khoán | 13 | Hình sự | 2 |
| Hiến pháp | 7 | Hôn nhân và gia đình | 2 |
| Tài chính | 4 | Lao động 2 | 2 |
| Đầu tư | 3 | Thương mại 1 | 2 |
| Quản trị tài sản trí tuệ | 3 | Lao động | 1 |
| An sinh xã hội | 2 | Xây dựng VBPL | 1 |
| Hành chính | 2 | | |

Cách đếm: câu `truefalse` mà `isCiteOnly(explain)` (trong `apps/web/src/lib/engine/why.ts`) trả `true`. Dạng "Phân biệt" (`pair`) có 528/690 câu cũng chỉ ghi số điều nhưng lúc sai đã có bảng so sánh hai khái niệm, không xếp vào việc này.

## Việc kèm theo (mỗi việc một nhánh `feat/`, cần spec trước)
- Nhận định chấm 3 phần (Đúng/Sai 0,25 · căn cứ 0,25 · lập luận 0,5).
- Bản đồ điểm yếu ở trang Hồ sơ (tỷ lệ đúng theo môn/chương/dạng bài, nút ôn phần yếu).
- Hai đề kiểm tra môn Hôn nhân và gia đình; môn Tố tụng hành chính từ tài liệu PMU trong Drive.
