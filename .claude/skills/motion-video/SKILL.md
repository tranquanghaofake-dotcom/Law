---
name: motion-video
description: Use when someone wants a motion video, promo, intro, launch film, explainer, product/website/app showcase, or TikTok/Reels/Shorts/YouTube clip made from scratch — 60 fps, Full HD (1080×1920 or 1920×1080), cut to music or a named song or timed to a voice-over (on-screen text landing on the spoken keywords), built from a repo, a website, docs or only a brief — or wants an existing video made more eye-catching, better synced to the beat, or fixed (blurry assets, edge halos, wrong facts, slow renders). Also matches unaccented requests (lam video, video gioi thieu, motion, dung video, edit theo nhac, giong doc, long tieng).
---

# Motion video — từ con số 0 đến thành phẩm 60 fps Full HD

## Tổng quan

Skill đưa một yêu cầu, có khi chỉ là "làm video giới thiệu cái này", đến một file MP4 60 fps Full HD **cắt theo nhạc** hoặc **khớp theo giọng đọc** (video giải thích có lời). Quy trình có 7 pha, mỗi pha kết thúc bằng một **cổng kiểm**. Công cụ là Remotion (React → video), dùng bộ khung có sẵn trong `template/`.

Nguyên tắc lõi:
- **Câu chuyện trước hiệu ứng.** Video yếu thường là chuyển động đẹp bọc quanh một danh sách tính năng.
- **Sự thật lấy từ nguồn.**
- **Nhạc là đồng hồ, hoặc giọng đọc là đồng hồ.** Đo nhịp thật, không đoán. Có lời thì chữ hiện đúng lúc từ khoá được nói, lấy mốc từng từ từ giọng thật (`references/9-giong-doc.md`).
- **Dùng hình thật của sản phẩm**, không vẽ giả giao diện.
- **Mọi tính từ phải đổi thành con số.** Chỗ nào để tính từ thì chỗ đó rơi về mặc định trông như máy làm.

## Khi nào dùng / không dùng

Dùng khi cần:
- video giới thiệu web, app, sản phẩm hay khái niệm;
- clip mạng xã hội cắt theo nhạc;
- explainer có số liệu, video giải thích luật có giọng đọc (`"clock": "voice"`);
- làm lại một video "chưa đủ wow", lệch nhịp hoặc có ảnh lỗi.

Không dùng khi cần:
- slide tĩnh: dùng skill làm slide;
- infographic in A4;
- chỉ sửa phụ đề cho video có sẵn;
- dựng lại video quay người thật nói trước camera (talking-head). Ý tưởng neo chữ theo từ khoá vẫn dùng được, nhưng template này không có lớp người nói.

## Luật cứng (không có ngoại lệ)

1. **Không bịa.** Không con số, tính năng, giao diện, trích dẫn nào lên hình nếu chưa thấy trong nguồn.
   - Nguồn mâu thuẫn: tin **code đang chạy**, sau đó đến spec mới nhất, cuối cùng mới đến README. README hay lỗi thời.
   - Câu khẳng định về sản phẩm ("miễn phí", "không cần tài khoản"…) chưa được chủ sản phẩm xác nhận thì phải hỏi.
   - Nội dung pháp luật: ghi số hiệu, điều/khoản và tình trạng hiệu lực.
2. **Nhạc phải có quyền dùng.** Chỉ có 3 đường:
   - (a) file người dùng có quyền;
   - (b) ghép bài trong thư viện nhạc của nền tảng (TikTok/Reels) lúc đăng;
   - (c) nhạc miễn phí bản quyền có giấy phép rõ.

   **Không tải nhạc từ trang lậu.** Bản nghe thử chính thức (iTunes/Deezer preview) chỉ dùng để **đo nhịp**, không nhúng vào video, không commit. **Không tự sáng tác nhạc bằng code làm sản phẩm**, vì không ai nghe kiểm được. Nhạc tổng hợp chỉ được dùng làm "nhạc dò nhịp" và phải ghi nhãn rõ.
3. **Đo nhịp, không đoán.** Chạy `scripts/do_nhip.py` lấy BPM, phách đầu, độ dài cụm và chỗ bass tắt, rồi đối chiếu BPM với cơ sở dữ liệu công khai. Bản Sped Up/Slowed là bài khác tempo.
4. **60 fps, 1080×1920 (dọc) hoặc 1920×1080 (ngang).** Mọi mốc thời gian tính bằng chỉ số phách: `b(n)`, làm tròn từng mốc, không cộng dồn.
5. **Chỉ render bản cuối sau khi máy kiểm và mắt soát đều qua** (cổng pha 6: `kiem_tra_bo_cuc.mjs` XANH + khung tĩnh). Render 60 fps tốn từ vài chục phút đến hàng giờ. Video > 60 s: **dựng mẫu 20–30 s đầu** cho người dùng duyệt phong cách rồi mới làm cả bài.
6. **Báo cáo trung thực.** Âm thanh chỉ được *đo*, chưa ai *nghe*: luôn nói rõ điều đó. Bỏ hiệu ứng nào vì máy không chạy được thì nói. Kết quả kiểm tra ghi nguyên số.

## Quy trình 7 pha

| Pha | Việc | Cổng kiểm (xong mới sang pha sau) | Đọc |
|---|---|---|---|
| 0 Brief | Hỏi **một lượt** những gì chỉ người dùng trả lời được: nền tảng/khổ, nhạc (bài nào, đường nào), câu khẳng định cần xác nhận, độ dài nếu bắt buộc. Còn lại tự giả định và nêu thành một dòng | Có câu trả lời, hoặc giả định đã nêu | `references/1-brief-nguon.md` |
| 1 Nguồn | Tự khảo sát repo/web/tài liệu: chủ đề, người xem, tính năng, số liệu, token màu/font, asset có sẵn, route đáng quay → `FACTS.md`, mỗi dòng kèm nguồn | Không dòng nào thiếu nguồn; xung đột đã giải theo luật 1 | `references/1-brief-nguon.md` |
| 2 Câu chuyện | Viết "một điều cần nhớ", 3 mạch kể khác hẳn nhau → chọn 1 (hỏi người dùng nếu họ đang theo dõi) → nhịp kể map vào cụm nhạc | `STORYLINES.md`; mạch được chọn có hook 2 giây đầu | `references/2-cau-chuyen.md` |
| 3 Phong cách | `SPEC.md`: chất liệu, màu, font, chuyển động bằng số; danh sách CẤM; chọn loại cảnh theo bảng dưới | Không còn tính từ chưa đổi thành số | `references/3-phong-cach.md` |
| 4 Nhạc / Giọng | **Nhạc:** `do_nhip.py` → BPM, phách đầu, cụm, bass tắt → cấu trúc video = bội số cụm nhạc. **Giọng:** `kich_ban.json` → giọng đọc → `canh_giong.py` → mốc từng từ | Nhạc: tổng ô nhịp chia hết cụm; cú nện đúng đầu cụm. Giọng: mọi câu khớp ≥ 50 %, người dùng đã nghe thử | `references/4-am-nhac.md` · `references/9-giong-doc.md` |
| 5 Asset | Quay/chụp giao diện thật (`scripts/quay_web.mjs`), ảnh bằng chứng (văn bản luật trên vbpl.vn…) cắt sát, mount component (harness), nền trong suốt, độ phân giải 3× | Không ảnh nào lỗi viền/nhoè; chữ trong ảnh ≥ 16 px trên khung; không còn chữ nhạy cảm; sự kiện trong bản quay đã biết thời điểm | `references/5-asset.md` |
| 6 Dựng | `bash scripts/tao_du_an.sh <thư mục>` → viết `src/storyboard.json` → `kiem_tra_storyboard.py` → `kiem_tra_bo_cuc.mjs` → render 8–12 khung tĩnh rồi soát | Kiểm storyboard XANH; kiểm bố cục XANH; khung tĩnh qua câu hỏi soát ở pha 7 | `references/6-dung-remotion.md` |
| 7 Kiểm & giao | Render → `kiem_tra_video.py` → chấm lỗi cứng C1–C8 + dấu vân tay → sửa → từ v2 so cặp với bản trước (tối đa v3, bản cũ thắng thì giữ) → `REVIEW.md` → giao | Video đúng khổ/fps/thời lượng; C1–C8 ĐẠT; P0 = 0 | `references/7-kiem-tra.md` |

Ba trường hợp chạy rút gọn:
- **Sửa video có sẵn:** đi từ pha 3 hoặc pha 5 theo lỗi được báo.
- **Người dùng bảo "khỏi hỏi":** pha 0 chỉ còn dòng giả định; pha 2 tự chọn mạch đề xuất và kể tên hai mạch còn lại trong một dòng.
- **Clip dưới 15 giây, một ý:** bỏ phần 3 mạch kể.

## Bảng chọn bố cục theo loại video

| Loại (nhận diện từ brief/nguồn) | Hình dạng | Cảnh mẫu nên dùng | Độ dài |
|---|---|---|---|
| Giới thiệu sản phẩm/web/app | hook (nỗi đau) → tên → chứng minh bằng UI thật 3–6 động từ → cú chốt lớn nhất (60–80 %) → câu nhớ → thẻ kết | TitleSlam · LogoReveal · DeviceDemo · MediaHero · CardCycle/Ladder · EndCard | 30–90 s |
| Giải thích một khái niệm (luật, khoa học, tài chính) | câu hỏi đời thường → một ví dụ cụ thể đi xuyên suốt → sơ đồ → đáp án có nguồn | TitleSlam · KnowledgeCard · FeatureSteps · LineReveal · EndCard | 20–60 s |
| Số liệu/kết quả | một con số được "kiếm" bằng một cảnh, rồi hiện thân | StatCount · LineReveal · CardCycle | 15–40 s |
| Clip dọc mạng xã hội | khung 0 đã là hook; đổi nhịp 2–4 s; chữ ≥ 28 px trong dải an toàn | như trên, mỗi cảnh 1–2 ô nhịp | 15–60 s |

Mỗi video dùng 3–5 kiểu chuyển cảnh, và mỗi kiểu phải có nguyên nhân trên hình: cut-the-curve (mặc định), zoom-through ở đầu cụm, vật thành thế giới, mắt cắt bằng dấu thương hiệu, tràn màu, iris. **Mọi điểm cắt thường đi một hướng** (không ping-pong). **Dấu Z giữ nguyên qua điểm cắt.** Thông số đầy đủ ở `references/8-ky-thuat-edit.md`.

## Hiệu năng render (máy không GPU)

| Làm | Không làm |
|---|---|
| `filter` chỉ đặt khi giá trị khác 0 | `filter: blur(0px)` thường trực trên lớp toàn khung |
| Tách màu RGB bằng `text-shadow` trên chữ (biến `--rgb`) | Ba bản sao cả khung + lọc SVG `feColorMatrix`: chậm khoảng 7 lần |
| Light leak, tia sáng, hạt sáng bằng gradient CSS | `@remotion/effects` (WebGL/WebGPU): báo "No supported implementation" khi không có GPU |
| Bóng bằng `radial-gradient` | `box-shadow` lớn trên hàng chục phần tử chạy mỗi khung |
| Thử 60–120 khung (`--frames=a-b`) đo tốc độ trước khi render cả video | Render cả video rồi mới biết mất 2 giờ |

## Lỗi thường gặp

| Triệu chứng | Nguyên nhân → cách sửa |
|---|---|
| Bản quay animation trắng xoá hoặc chạy vượt rồi tự đóng | `page.clock.install()` mặc định **vẫn trôi theo giờ thật** → thêm `pauseAt` (đã có trong `quay_web.mjs`) |
| Bản quay hỏng "Execution context was destroyed" | Sửa file khi harness Vite đang chạy → nó tải lại trang. Đặt `hmr: false, watch: null`, không sửa file trong lúc quay |
| Ảnh bìa/thẻ có viền nền ở góc bo | Chụp phần tử khi `body` vẫn có nền → ép `html,body{background:transparent!important}` + `omitBackground` |
| Ảnh nhoè khi phóng | Chụp ở `deviceScaleFactor` 3 cho ảnh tĩnh, 2,5 cho bản quay dọc 1080 |
| Cú nện ở cảnh nền sáng loá trắng | Light leak hoà `screen` trên nền giấy → chỉ dùng trên nền tối; nền sáng chớp màu nhấn ≤ 25 % |
| Chữ tối trên nền tối | Màu chữ lấy từ bảng chung thay vì bảng của cảnh → dùng `useCol()`/`useT()` (cảnh `bg: "dark"` đảo ink↔ground) |
| Cắt cảnh lệch nhịp dần | Cộng dồn phách đã làm tròn → luôn `b(chỉ số phách)` |
| Video giả định có intro mà bài đủ trống từ đầu | Đoán cấu trúc bài → đo bằng `do_nhip.py` trên bản nghe thử chính thức |
| `--props='{"x":true}'` lỗi JSON khi chạy qua `npm run` | npm làm mất dấu nháy → truyền file JSON hoặc trộn tiếng bằng ffmpeg sau render |
| Ghép tiếng sau render bị hụt vài khung cuối | `ffmpeg … -c:v copy -shortest` cắt theo luồng ngắn hơn, mất khung cuối (đo được: 283 → 279 khung) → bỏ `-shortest`, cắt bằng `-t <thời lượng hình>`, rồi đếm khung bằng `ffprobe -count_frames` |
| ffmpeg báo `-vsync` lỗi/không còn | ffmpeg mới bỏ `-vsync` → dùng `-fps_mode cfr`; `-filter_complex_script` → `-/filter_complex <file>` |
| Dấu tiếng Việt dòng trên chạm/dính dấu dòng dưới (LỢI / ỨNG) | `lineHeight` tiêu đề quá thấp → template đặt `H1` 1,3; đo bằng ảnh: 1,04 dính, 1,25 gần chạm. Khối có `overflow: hidden` thì chữ thường cũng cần ≥ 1,35 |
| Chữ cuối cảnh dọc rơi dưới 1330 px | cảnh canh giữa cả khung thay vì canh trong dải an toàn → `SAFE_PAD` phải có `paddingBottom` (template đã sửa) |
| Chữ hiện lệch lời, nhất là ở tên riêng/số | nhận dạng nghe sai từ đó nên mốc là nội suy → neo vào từ tiếng Việt thường kề bên; câu khớp < 50 % thì hỏi lại người dùng |
| `faster-whisper` lỗi `open() got an unexpected keyword argument 'metadata_errors'` | lệch phiên bản thư viện `av` → `canh_giong.py` tự giải mã bằng ffmpeg rồi đưa mảng âm thanh, không đưa đường dẫn |
| Thông tin trên video đã lỗi thời | Đọc README/file cũ → kiểm code đang chạy và spec mới nhất (luật 1) |
| Khung 0 (ảnh bìa TikTok) trống | Chữ hook vào từ phách 0 nên khung 0 chưa có gì → dòng hook đặt `at` âm để đã đáp ở khung 0 |
| Phóng thiết bị che tiêu đề; nhãn/miễn trừ đè ảnh | Phóng quanh điểm giữa đẩy mép trên lên → soát khung sau mỗi thay đổi bố cục; ưu tiên chip chữ to thay vì phóng UI chữ nhỏ |
| Cú chốt bằng bản quay mà chữ số/chi tiết quá nhỏ | Đẩy máy vào tiêu điểm (`pushIn`) 2 phách trước cú nện rồi lùi ra; không phóng quá ~2,5× bản quay 2,5× (vỡ hạt) |
| Edit "xấu, đơn giản" dù nhiều hiệu ứng | Cảnh đổi hướng trái/phải luân phiên, Z lật dấu ở đầu cụm, lắc lư vô cớ, không có khoảnh khắc đứng hình/đẩy máy ở cú chốt → áp luật vector + impact freeze + vật thành thế giới (`8-ky-thuat-edit.md`) |
| "Chưa đủ wow" dù nhiều hiệu ứng | Mắc dấu hiệu video máy tạo (nền xanh đen trống, glow, hạt bay, ba thẻ một hàng, mọi thứ trượt lên) → đọc danh sách CẤM trong `references/3-phong-cach.md`, tăng câu chuyện và UI thật |

## Công cụ

- `bash scripts/tao_du_an.sh <thư mục>`: tạo dự án từ `template/` và cài phụ thuộc.
- `python3 scripts/do_nhip.py <nhạc> [--bpm N] [--json f]`: đo BPM, phách đầu, cụm, bass tắt.
- `node scripts/quay_web.mjs jobs.json`: quay/chụp UI thật theo thời gian ảo, ra `public/cap/`.
- `python3 scripts/canh_giong.py <dự án> <giọng> kich_ban.json`: khớp kịch bản vào giọng đọc → `src/giong.json` (mốc từng câu, từng từ) + `public/voice/voice.wav`.
- `python3 scripts/kiem_tra_storyboard.py src/storyboard.json`: kiểm nhịp hoặc mốc lời, thời gian đọc, nhãn dài, asset, từ sáo, dấu hiệu máy tạo.
- `node scripts/kiem_tra_bo_cuc.mjs <dự án>`: đo hộp chữ/ảnh thật từng khung lấy mẫu → đè chữ, tràn khung, khung trống, chữ nhỏ, ngoài vùng an toàn.
- `python3 scripts/kiem_tra_video.py <dự án> [video]`: kiểm khổ/fps/thời lượng/LUFS và dựng tờ xem nhanh (cảnh, điểm cắt, cỡ điện thoại).
- `python3 scripts/kiem_tra_skill.py`: kiểm cấu trúc chính skill này.
- `scripts/thoi_gian.py`: hàm dùng chung (vị trí cảnh theo nhạc hoặc theo giọng) cho các script kiểm, không chạy riêng.

Tài liệu tham chiếu:
- `references/1-brief-nguon.md`
- `references/2-cau-chuyen.md`
- `references/3-phong-cach.md`
- `references/4-am-nhac.md`
- `references/5-asset.md`
- `references/6-dung-remotion.md`
- `references/7-kiem-tra.md`
- `references/8-ky-thuat-edit.md` — luật vector, cut-the-curve, impact freeze, speed ramp, flash, vật thành thế giới, montage (thông số + chỗ có sẵn trong template)
- `references/9-giong-doc.md` — chế độ giọng đọc (voice-over): đo thời gian lời, chữ đáp đúng từ khoá

Ví dụ chạy trọn quy trình (FACTS → jobs → storyboard): `examples/giai-thich-dat-coc-16x9/`. Nguồn tham khảo và giấy phép: `NOTICE.md`.
