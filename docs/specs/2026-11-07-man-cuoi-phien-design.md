# Màn cuối phiên — thấy mình tiến bộ, biết làm gì tiếp (phần 1/3 của "logic ra đề dễ học, dễ nhìn, muốn học tiếp")

Ngày 07/11/2026 · trạng thái: **chờ Hào duyệt** · nhánh `claude/serene-pascal-sffnov` · ước lượng ≤ 2 giờ, 1 PR.

## 0. Bối cảnh và mục tiêu

Hào yêu cầu: logic ra đề vừa dễ vào đầu, vừa dễ nhìn/ít khó chịu, vừa tạo hứng thú học tiếp. Chọn "Cuối phiên" làm chỗ ưu tiên (và nói cả bốn chỗ — đầu bài, giữa bài, lúc sai, cuối phiên — đều vướng). Chia 3 phần, mỗi phần một spec/PR:

1. **Cuối phiên (spec này).**
2. Lúc sai (kiểm vòng sửa sai và giải thích đã đủ chưa) — spec riêng.
3. Đầu bài và giữa bài (câu khởi động, nhịp độ khó thích ứng) — spec riêng, sau khi có dữ liệu.

Đã có từ đợt trước (bài này không làm lại): câu sinh nhiễu cùng dạng, đề bài ít che chữ, trang Ôn gợi ý bài yếu khi hết bài đến hạn (commit `213fcbe`, `1794069`).

**Mục tiêu đo được** (màn 390 × 844):
- Nút hành động chính nằm trong màn hình đầu tiên, không cần cuộn, khi phiên có ≤ 3 khái niệm lên bậc và ≤ 5 câu sai.
- Lý do quay lại (ôn lúc nào, bao nhiêu khái niệm) hiện ở ngay cạnh nút chính, không còn là một dòng mờ ở cuối.
- Không thêm hiệu ứng, âm thanh, màu hay phần thưởng mới.

## 1. Hiện trạng (đọc `SessionEnd.svelte`, `SessionView.svelte:205-228`)

Thứ tự hiện tại: kicker → dòng "nhớ chắc hơn" → ghi chú giữ bậc → vòng điểm + XP + 4 chỉ số (combo, câu vàng, sửa được, đoán trước) → kỷ lục → bảng XP theo nguồn → thăng chức → chuỗi → danh sách lên bậc → **"Hẹn ôn ngày mai: N khái niệm" (chữ mờ)** → nút → ghi chú cổng → (section riêng bên dưới) câu sai.

Vấn đề:
1. Khi không có khái niệm lên bậc, dòng đầu là "Chưa khái niệm nào lên bậc phiên này" — mở màn bằng câu tiêu cực, không giải thích vì sao bình thường.
2. Chỉ số trò chơi (combo, câu vàng, bảng XP theo nguồn) chiếm chỗ ngang hàng với thông tin học (sửa được x/y, lên bậc).
3. Lý do quay lại bị chôn: chỉ là "ngày mai: N". Không nói giờ/ngày thật của lần ôn tới, cũng không nói đang còn bài đến hạn ngay.
4. Nút chính luôn là "Về Hôm nay" (kể cả khi còn bài đến hạn hoặc còn đợt kế) — người học phải tự đoán việc tiếp theo.
5. Câu sai nằm dưới cùng, sau mọi thứ.

## 2. Thiết kế

### 2.1 Thứ tự mới (trong thẻ `.session-end`)

1. Kicker "Xong phiên" + **dòng kết quả học** (2.2).
2. Vòng điểm + `+XP` (giữ) và hai chỉ số học: **Sửa được x/y**, **Đoán trước đúng** (giữ nguyên điều kiện hiện).
3. Kỷ lục mới (giữ, đây là khoảnh khắc ăn mừng 1 dòng) · thăng chức (giữ).
4. **Nút "Xem N câu sai ↓"** nếu có câu sai: cuộn tới mục "Xem lại câu sai" bên dưới (mục đó giữ nguyên nội dung).
5. **Khối "Tiếp theo"** (2.3): lý do quay lại + nút chính + nút phụ.
6. Chuỗi (giữ 1 dòng) · danh sách khái niệm lên bậc (giữ).
7. `<details>` **"Chi tiết điểm"** đóng sẵn: combo dài nhất, câu vàng, bảng XP theo nguồn.
8. Ghi chú cổng đợt (giữ, đặt ngay dưới khối "Tiếp theo" khi có).

### 2.2 Dòng kết quả học (đổi lời, không đổi logic tính)

- Có khái niệm lên bậc: giữ "**N khái niệm nhớ chắc hơn** (lên bậc)".
- Không có: "Chưa khái niệm nào lên bậc phiên này. Lên bậc cần nhớ lại qua nhiều lần ôn, không chỉ một phiên." (giữ tiền tố cũ để test hiện có vẫn đúng; thêm lời giải thích trung tính, không khen giả).
- Ghi chú `held` (giữ bậc vì chưa qua ngày khác) giữ nguyên.

### 2.3 Khối "Tiếp theo" — hàm thuần `lib/ui/endAction.ts` (có test, TDD)

Đầu vào: `{ kind: 'lesson' | 'review', gate, hasNext, hasAgain, dueNow, next }`; đầu ra: `{ primary, secondary[], hint }`.

Thứ tự ưu tiên của nút chính:

| # | Điều kiện | Nút chính | Ghi chú |
|---|---|---|---|
| 1 | phiên đợt, `gate` chưa xong, có `onagain` | "Học lượt tiếp đợt này →" | như hiện tại |
| 2 | phiên ôn, còn `dueNow` > 0 | "Ôn tiếp (còn N) →" tới `#/on` | một phiên ôn tối đa 20 bước nên có thể còn |
| 3 | phiên đợt đã xong cổng, có `onnext` | "Học đợt tiếp →" | nếu còn `dueNow` > 0 thì thêm nút phụ "Ôn N khái niệm đến hạn" |
| 4 | có `onagain` | "Học lại đợt này" | |
| 5 | còn lại | "Về Hôm nay" | |

"Về Hôm nay" **luôn có** (nút phụ khi không phải nút chính) để thoát ổn định. Tên nút `Về Hôm nay`, `Học đợt tiếp`, `Học lượt tiếp đợt này`, `Học vượt sang đợt sau` giữ nguyên để test/e2e hiện có không vỡ.

`hint` (một dòng, chữ thường, ngay trên nút chính; thay dòng "Hẹn ôn ngày mai"):
- `dueNow` > 0: "Còn N khái niệm đến hạn ôn ngay."
- không, có `next`: `inDays` = 0 → "Ôn lại lúc HH:MM hôm nay · N khái niệm."; = 1 → "Ôn lại ngày mai · N khái niệm."; > 1 → "Ôn lại ngày dd/mm/yyyy · N khái niệm." (dùng lại `nextReview()` của `dueByDay.ts`, cùng lời với trang Ôn rỗng).
- không có gì: không hiện hint.

### 2.4 Dữ liệu thêm ở `SessionView.endSession`

Hai truy vấn đã có trong `repo`: `dueNow = (await repo.due(new Date())).length` và `next = nextReview((await repo.all()).map((c) => c.card.due))`. Truyền thêm `dueNow`, `next`, `kind` (= `lessonConcepts ? 'lesson' : 'review'`) vào `SessionEnd`. Prop `dueTomorrow` giữ (không bỏ, tránh vỡ chỗ gọi khác) nhưng không còn hiển thị riêng.

## 3. Ngoài phạm vi

- Màn kết quả **Luyện đề** (`Quiz10.svelte`): khác luồng, làm ở phần sau nếu cần.
- Không đổi cách tính XP, bậc, FSRS, chuỗi; không đổi nội dung mục "Xem lại câu sai".
- Không thêm hiệu ứng/âm thanh/màu mới; giữ bảng màu "Văn Miếu".
- Luyện đề vẫn **không** ghi lịch ôn (quyết định 01/11/2026).

## 4. Kiểm thử và tiêu chí xong

- `tests/ui/endAction.test.ts` mới (viết trước): đủ 5 hàng bảng 2.3, các nhánh `hint`, `dueNow` + `onnext` cùng lúc.
- Cập nhật `tests/ui/SessionEnd.test.ts` và `CardsDot6.test.ts`: giữ mọi assertion hiện có về tên nút, `.memory-line`, `.xp-sources`, `.record-msg`, `.mistakes`; thêm: nút "Xem N câu sai" chỉ hiện khi có câu sai; `<details>` chứa combo/câu vàng/XP nguồn; hint đúng ba trường hợp. (Chú ý: jsdom không có `scrollIntoView` — gọi có kiểm tra tồn tại.)
- `npm run ci` xanh; chạy `e2e/a11y-keyboard.spec.ts` vì đổi nội dung link/nút (rút kinh nghiệm axe, `docs/plans/2026-11-04-ux-lon.md`).
- Ảnh chụp màn cuối phiên 390 px và 1280 px trước/sau, kèm số đo vị trí y của nút chính (mục tiêu ≤ 844 ở 390 px).

## 5. Quyết định cần Hào chốt

1. **Phạm vi "Ôn tiếp":** nút dẫn tới `#/on` (mọi môn), kể cả khi vừa ôn theo một môn (`#/on/<môn>`) — vì `SessionView` không biết môn. Chấp nhận, hay muốn truyền môn vào?
2. **Gập "Chi tiết điểm":** combo, câu vàng, bảng XP theo nguồn nằm trong mục gập (đóng sẵn). Kỷ lục và thăng chức vẫn hiện. Đúng ý Hào, hay muốn gập cả kỷ lục?
3. **Lời không có lên bậc** (2.2): dùng câu giải thích trung tính như trên, hay chỉ bỏ dòng đó khi không có gì lên bậc?

Nếu không trả lời: mặc định như đã ghi (1: `#/on` mọi môn; 2: kỷ lục hiện; 3: câu giải thích trung tính).

## 6. Rủi ro

- Đổi thứ tự DOM có thể vỡ test kiểu `querySelector` theo vị trí → đã liệt kê test cần cập nhật ở mục 4.
- Hai truy vấn thêm lúc kết thúc phiên (IndexedDB, cục bộ) — nhẹ; lỗi truy vấn phải rơi về `dueNow = 0`, `next = null`, không chặn màn kết thúc.
- Nút chính đổi theo ngữ cảnh: phải có test cho mọi hàng bảng 2.3 để tránh nút chính sai hướng.

## 7. Kết quả triển khai (07/11/2026)

Đo trên phiên thật `#/hoc/hien-phap/hp-1` (tài khoản mới, chọn phương án đầu mỗi câu), trước = commit `213fcbe`, sau = bản này:

| | 390 × 844 | 1280 × 800 |
|---|---|---|
| Vị trí nút chính (trước → sau) | y 947 → **464** (trước phải cuộn) | y 576 → **331** |
| Chiều cao trang (trước → sau) | 2322 → 2335 px* | 1814 → 1745 px |

\* Chiều cao trang gồm cả mục "Xem lại câu sai" nên dao động theo số câu sai mỗi lần chạy (3–4 câu); đại lượng đo mục tiêu là vị trí nút chính.

- `npm run ci` xanh (788 test web). `e2e/a11y-keyboard.spec.ts`: axe và manifest xanh; test "Space đọc…" chập chờn ~1/16 lần (trên bản gốc `30bae2a` cũng chập chờn 1/24) — có sẵn từ trước, không do thay đổi này, chưa sửa.
- Ghi nhận, chưa sửa: ô chỉ số "Sửa được" bị kéo rộng hết dòng ở 1280 px khi chỉ còn một chỉ số (lưới `auto-fit` có sẵn).
- Quyết định 5.1–5.3 dùng mặc định.
