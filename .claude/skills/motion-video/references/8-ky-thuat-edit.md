# Kỹ thuật edit động (TikTok/Reels) — luật, thông số, cách làm trong template

Nguồn:
- HeyGen HyperFrames `.claude/skills/motion-doctrine` và `cut-the-curve`, registry `beat-freeze-cut`, `editorial-flash-overlay` (Apache-2.0, viết lại);
- hướng dẫn speed ramp của DJordanMedia, CapCut velocity guide, ClipCreator "video editing effects 2026" (chỉ đọc);
- khái niệm flash frame / posterize / stutter trong Yanndotai/brutalist-video-editing-skill (README, chưa rõ giấy phép, không chép mã).

## 1. Luật vector — điều làm video "liền một hơi" thay vì xếp slide

| Luật | Nghĩa | Lỗi hay gặp |
|---|---|---|
| **Một hướng chủ đạo** | mọi điểm cắt thường đi cùng một hướng (template: sang trái) | đổi hướng trái/phải luân phiên ("ping-pong") — đọc như lỗi |
| **Cắt giữa chuyển động** | cảnh cũ còn đang tăng tốc ở khung cắt, cảnh mới vào giữa đường (≥ 50 % quãng) | cảnh cũ dừng hẳn rồi mới cắt; cảnh mới bắt đầu từ đứng yên |
| **Vận tốc khớp** | ra `power4.in`, vào `power4.out`, cùng quãng → vận tốc bằng nhau ở điểm cắt | ra chậm vào nhanh |
| **Dấu Z** | ra phóng to (lao tới) ⇒ vào cũng phóng to (0,8 → 1); ra thu nhỏ ⇒ vào thu nhỏ (1,25 → 1) | hút vào (phóng to) rồi cảnh mới thu từ 1,25 về 1 — lật dấu |
| **Hướng dành riêng** | lên = kết luận; Z tới = đào sâu; Z lùi = cú chốt đáp xuống | dùng hướng đặc biệt cho vui |

Template đã làm sẵn:
- **Điểm cắt thường:** `enter: "curve"` (mặc định). Cảnh ra di chuyển 12 % khung sang trái, `power4.in`, nhoè 0 → 18 px, giữ đậm tới sát điểm cắt. Cảnh vào bắt đầu ở +12 %, độ đậm 0,6, `power4.out`. Nền sân khấu là màu mực nên khe giao chỉ là một "dip" ≤ 1 khung.
- **Đầu cụm nhạc:** hút vào (phóng 1 → 1,2) → `enter: "zoom"` tiếp tục lao tới (0,8 → 1), mắt cắt `theme.cutMark` che khe.
- **Nhoè theo kích thước:** chữ tối đa ~10 px; cả khung 18–20 px.

## 2. Bảng kỹ thuật

| Kỹ thuật | Khi dùng | Thông số | Trong template |
|---|---|---|---|
| **Cut-the-curve** | ranh giới cảnh mặc định | quãng 12 %, 0,3–0,4 s, power4 đối xứng, nhoè 18 px | `enter: "curve"` (tự động) |
| **Zoom-through (Z tới)** | đầu chương, đào sâu | ra 1 → 1,2, vào 0,8 → 1, nhoè 18 px | `exit: push` + `enter: "zoom"` |
| **Vật thành thế giới** | từ một màn hình vào chi tiết bên trong | vật phóng 1 → 3,2 trong 0,75 phách `ease-in` cubic, cảnh sau vào `zoom` | `DeviceDemo.exitPush` + cảnh sau `enter: "zoom"` |
| **Impact freeze** | khoảnh khắc chạm: bấm đáp án, số đổi | đứng 14–24 khung (0,25–0,4 s) đúng lúc kết quả hiện; kèm flash + đẩy máy | `DeviceDemo.freeze{after,frames}`, `MediaHero.freezeFrames` |
| **Speed ramp** | đoạn lặp đi lặp lại → nhanh; khoảnh khắc chứng minh → chậm | chậm 30–35 % trong 12–15 khung, giữ 10–20 khung, ra cùng nhịp; *impact*: hãm 6–8 khung về 10–15 %, đứng 3–5 khung | `FreezeVideo` (mở rộng bảng tốc độ nếu cần) |
| **Flash frame ấm** | cú nện trong cảnh | loé 2 khung, tắt trong 6 khung; nền sáng ≤ 0,45 | `FlashFrame` (tự động ở `props.hits`) |
| **Đẩy máy vào tiêu điểm** | cú chốt bằng bản quay có chi tiết nhỏ | vào 2 phách trước cú nện, giữ 1,5 phách, lùi trong 1,5 phách; ≤ 2,5× độ phân giải bản quay | `MediaHero.pushIn` |
| **Mặt nạ lộ chữ** | kicker, nhãn — để các cảnh vào khác nhau | `clip-path: inset(0 X% 0 0)` 100 → 0 trong 12 khung, x lệch 40 px | `Kicker` |
| **Chữ từng từ nhoè → nét** | tiêu đề | 8–10 khung/từ, các từ cách 60–120 ms, không trượt | `Words` |
| **Nện chữ** | một chữ chốt | phóng 1,8 → 1 + nhoè 14 px trong 10 khung | `Words slam` |
| **Một con số đáp xuống** | số liệu quan trọng | số khổng lồ (~2,6× chữ chốt) đếm `from → value` trong 2 phách | `StatCount` một số |
| **Mắt cắt lao qua máy** | đầu cụm | đĩa dấu thương hiệu phóng 0 → phủ khung trong 8 khung (ease-in), rồi TIẾP TỤC phóng 1 → 1,7 và tan trong 10 khung — không thu về (thu về = lật dấu Z, để lại chấm thừa) | `theme.cutMark` |
| **Con trỏ lớn dẫn mắt** (HyperFrames `oversized-cursor`) | cảnh UI tĩnh cần nguyên nhân; kêu gọi bấm | cỡ ~13 % cạnh ngắn; luôn vào từ NGOÀI khung (dưới) trượt giảm tốc (power3.out); đầu mũi tên chạm mục tiêu; bấm = nén 0,84 trong 0,1 s, bật lại 0,22 s quanh đầu mũi tên; **cú bấm gây ra nhịp tiếp** (đứng hình, nút nảy); rời khung tăng tốc. Không bao giờ hiện/tắt bằng mờ dần tại chỗ | `props.cursor [{beat,x,y,click}]` (mọi cảnh) |
| **Chú thích vẽ tay** (Remotion text-highlights, rough-notation) | chỉ vào chi tiết nhỏ trên UI thật: đáp án đúng, con số | khoanh/gạch chân nét bút dạ 7 px, vẽ trong 14 khung, ngay sau kết quả hiện | `props.notes [{kind:"circle"\|"underline"\|"strike",x,y,w,h,beat,out,color}]`. **Chú thích nằm trên khung, không trên vật:** khi vật dưới nó di chuyển/phóng (vd. điện thoại lao tới) phải đặt `out` để tắt trước, nếu không vòng khoanh trôi sang chỗ sai |
| **Vật dẫn mắt trên đồ thị** | đồ thị trừu tượng cần gắn với ví dụ | nhãn ví dụ (vd. "Đặt cọc") chạy theo đầu nét đang vẽ, nảy ×1,35 ở mỗi mốc | `LineReveal.rider` — vị trí tính theo **độ dài cung** (khớp `pathLength` của nét), không theo chỉ số điểm, nếu không nhãn tụt khỏi đầu nét ở đoạn dốc |
| **Match cut theo hình** (Ben Marriott "This Animation Technique Works Every Time") | hai cảnh có vật cùng hình (chấm ↔ huy chương, khung ↔ thẻ) | trong 1–1,2 phách cuối cảnh trước, vật dẫn mắt trượt (power4 in-out) tới ĐÚNG toạ độ + cỡ của vật ở khung đầu cảnh sau, phần còn lại mờ còn 25 %; cảnh sau `enter:"cut"` (không nhoè, không trượt). Đo toạ độ vật ở khung đầu cảnh sau bằng `remotion still`, đừng đoán | `LineReveal.matchTo {x,y,r,color,beats}` |
| **Đáp án bay thành chip (FLIP)** | UI thật có kết quả cần giải thích (đáp án → phép tính) | ngay sau cú bấm, nhãn tách khỏi ô, bay theo cung Bézier bậc 2 (đỉnh lệch 160 px về hướng chính) với power4 in-out, phóng 0,7 → 1; đúng khung `at` thì thành chip đầy đủ, nảy nhẹ 0,92 → 1,08 → 1 (không pop từ 0 — nếu không chip "biến mất rồi hiện lại") | `DeviceDemo.chips[].from {x,y,beat,text}` |
| **Bút dạ tô từng dòng** | câu chốt nhiều dòng | `background-size` 0 → 100 % trên span inline + `box-decoration-break: clone` để mọi dòng đều được tô (một khối tuyệt đối chỉ tô được 1 dòng) | `KnowledgeCard.hook` |
| **Số cuộn odometer** | con số tiền/thống kê thay đổi (20 → 40) | mỗi hàng là cột 0–9–0 trượt dọc, khung `overflow:hidden` cao 1 em; hàng đơn vị cuộn liên tục, hàng trên chỉ nhích khi hàng dưới qua 9 → 0 (có nhớ); power4 in-out trong 2 phách. Hay hơn số nhảy 21, 22… vì mắt thấy CHUYỂN ĐỘNG chứ không thấy chữ đổi | `StatCount.roll` |
| **Echo viền chữ** (kinetic type, AE "Echo") | chữ nện chốt (số tiền, chức danh) | sau khi chữ đáp 6 khung: 3 bản viền rỗng 2 px nở ×1,18–1,38 và tắt trong 20 khung, lệch nhau 3 khung; không blur, không glow | `Words echo` (TitleSlam tự bật cho dòng `size:"hero"`) |
| **Thanh địa chỉ gõ URL** | thẻ kết có đường dẫn | cú bấm CTA gây ra: thanh nảy lên, URL gõ từng ký tự trong 1,2 phách, con trỏ nhấp nháy; con trỏ chuột rời khung sang NGANG, không lướt qua URL | `EndCard.typeAt` |
| **Chồng chiều sâu Z** | chuỗi thăng tiến | vật cũ lùi sau mỗi bậc ×0,9, lệch (90, −70) px, mờ dần, nhoè 1,5–6 px; vật mới lao lên 1,25 → 1 — lệch về phía KHÔNG có chữ | `Ladder` climb |
| **Montage thẻ thật** | nhiều dạng/màn của sản phẩm | 1,5–1,75 phách mỗi thẻ, một thẻ mỗi lúc, cut-the-curve sang trái, số thứ tự to + thanh tiến độ | `CardMontage` |
| **Khoảng lặng trước cú chốt** | trước kết quả lớn | 0,3–0,75 s gần như đứng yên | đặt `hitBeat` sau một nhịp giữ |

## 3. Cấm (bổ sung danh sách CẤM của `3-phong-cach.md`)

- **Rung lắc vô cớ:** thở, lơ lửng, lắc lư hình sin để lấp thời gian. Mỗi giây phải có một việc đang diễn ra: lộ dần thông tin, máy quay có ý đồ, UI tự chạy, vật diễn hành động.
- **Chớp trắng trên nền sáng** (giấy, trắng): khung loá bạc, mất tương phản. Trên nền sáng chỉ đứng hình (`DeviceDemo.flash:false`); flash chỉ dùng trên nền tối.
- **Hoà mờ giữa hai cảnh (crossfade):** không có vật dẫn mắt. Dùng cut-the-curve hoặc mắt cắt.
- **Đổi hướng không có nguyên nhân.**
- **Phản ứng đến sau nguyên nhân vài khung:** flash/âm thanh/rung phải đúng khung gây ra.
- **Flash ở mọi lần lật/đổi thẻ:** trên nền tối thành lớp sương xám phủ khung. Lật thẻ bằng `rotateY` 180 → 360° trong 12 khung, không flash.
- **Cảnh vào trống:** sau mắt cắt, vật chính phải có mặt ngay khung đầu (số đã hiện, nét đồ thị đang vẽ, thẻ đầu tiên đã ở đó), không để 0,4 s nền + kicker.
- **Flash trước nguyên nhân:** đặt cú nện đúng lúc kết quả hiện (vd. cửa tủ mở ~1,5 phách sau khi màn nhận chức bắt đầu), không phải lúc cảnh bắt đầu.
- **Bản quay không phủ khung:** dùng `baseScale` để phủ kín; giấu nút app bằng mặt nạ mờ đáy (`cutBottom`), không cắt cứng thành dải đen; bỏ đoạn đầu bản quay còn bạc màu bằng `skipFrames`.
- **Flash trên mọi phách:** "một đoạn ramp sạch không cần flash ở mỗi phách" (CapCut guide). Flash chỉ ở cú nện.

## 4. Soát riêng phần edit (thêm vào pha 7)

- Tờ `cat.png` (−0,2 / 0 / +0,2 s): khung trước cắt phải đang lệch trái và nhoè; khung sau phải bắt đầu lệch phải và nhoè. Không có khung nào toàn màu nền.
- Liệt kê hướng của từng điểm cắt: tất cả sang trái, trừ chỗ có lý do (mắt cắt, vật thành thế giới).
- Đầu mỗi cụm: khung ngay sau mắt cắt phải nhỏ hơn 1 và đang phóng lên (dấu Z giữ nguyên).
