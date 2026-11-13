# Giọng đọc dựng sẵn

App đọc lời theo 2 lớp (`apps/web/src/lib/fx/tts.svelte.ts`):

1. **mp3 dựng sẵn** — giọng clone **vox2-1** (giọng kênh "kiến thức xã hội", đã được phép; web phi thương mại). Mỗi câu một tệp, đã cắt khoảng lặng và cùng độ lớn −16 LUFS. App tải song song mọi câu của một lời, ghép thành một đoạn liền, nghỉ đều 0,16 s giữa các câu. Chỉ phát khi MỌI câu của lời đều có tệp (không trộn hai giọng).
   Danh sách câu = dữ liệu luật + `npm run tts:texts -w @luyen-luat/web` (chạy chính code app để gom cả câu sinh tự động: giải thích, "Đáp án: …").
2. **Giọng trình duyệt** (Web Speech) — dự phòng khi thiếu tệp: tách cụm ý, mỗi cụm tốc độ/cao độ/khoảng nghỉ riêng (`lib/fx/prosody.ts`).

## Cách sinh một câu (`clone.py`)

| Bước | Công cụ (mã nguồn mở, PyPI) | Ghi chú |
|---|---|---|
| Chuẩn hoá cách đọc | `vi_norm.py` | số, ngày, số hiệu văn bản (51/2001/QH10), chữ viết tắt (BLDS, NĐ-CP…) → chữ. Tên tệp vẫn tính trên câu GỐC |
| Sinh giọng | [VoxCPM2](https://github.com/OpenBMB/VoxCPM) (Apache-2.0, 2 tỉ tham số, chạy CPU, ra thẳng 48 kHz) | clone **kèm lời mẫu**: nối tiếp từ `voice/ref.wav` (8 s, đã tách nhạc nền) + đúng lời của clip (`REF_TEXT`) nên giữ cả âm sắc lẫn lối đọc của mẫu. Câu dài hơn 300 ký tự cắt khúc ở dấu câu, mỗi khúc sinh riêng rồi ghép |
| **Chặn lỗi** | [faster-whisper](https://github.com/SYSTRAN/faster-whisper) chạy Whisper small + [PhoWhisper-medium](https://huggingface.co/vinai/PhoWhisper-medium) (VinAI, tinh chỉnh tiếng Việt, đổi sang CTranslate2 int8) + [Resemblyzer](https://github.com/resemble-ai/Resemblyzer) | nghe lại và so với câu gốc theo ÂM giọng Bắc (x = s, tr = ch, d = gi = r). Câu từ 8 từ: Whisper small trước, trượt thì PhoWhisper nghe lại; câu ngắn hơn: PhoWhisper luôn. **Số (điều, khoản, năm) phải đúng tuyệt đối**; câu dưới 6 từ phải đúng hết; câu dài cho phép ~1 lỗi/12 từ vì Whisper cũng nghe nhầm. Câu thường: bản đầu đạt là dùng; bản trượt được nghe lại bằng Whisper medium trước, vẫn trượt mới sinh lại (tối đa 5 lần); câu ngắn (≤ 4 từ, VoxCPM2 dễ đọc trệch): sinh tới khi có 2 bản đạt (tối đa 5), chọn bản giống giọng + biểu cảm nhất. **Câu vẫn đọc sai số thì không vào manifest** — app đọc lời đó bằng giọng trình duyệt, lần chạy sau sinh lại |
| Hậu kỳ | [pedalboard](https://github.com/spotify/pedalboard) | ấm/dày (low shelf 160 Hz, bớt đục 350 Hz, nén nhẹ) → de-esser → −16 LUFS, đỉnh ≤ −1 dBFS |

Vì sao là bản này: hai vòng nghe mù ngày 12/11/2026 (xem `ab.py`) — VieNeu v3 Turbo với 5 cấu hình, rồi VoxCPM2 với 3 cách clone — Hào chọn "VoxCPM2 clone kèm lời mẫu".
Kiểu số: máy có AMX (`amx_bf16`) chạy bfloat16; máy khác (phần lớn máy GitHub) tự chuyển float32 — bfloat16 không có AMX chậm hàng chục lần.
Đổi bất kỳ tham số giọng nào (đầu `clone.py`) → đổi `STYLE` để lần chạy sau sinh lại toàn bộ.
Test phần thuần: `python3 -m unittest tools/tts/test_clone.py tools/tts/test_vi_norm.py tools/tts/test_ab.py`.

## Nghe thử trước khi đổi giọng (`ab.py`)

Đổi tham số là phải sinh lại toàn bộ (~28 900 câu, hơn một ngày máy GitHub), nên nghe thử trước: `ab.py` sinh **12 câu thật của app × các cấu hình trong `CONFIGS`** (cột đầu luôn là bản đang chạy), rồi viết một trang `index.html` tự chứa. Trang ẩn tên cấu hình và xáo thứ tự từng câu (nghe mù); chọn bản hay nhất ở mỗi câu rồi bấm "Xem kết quả" để thấy số phiếu kèm số đo của máy (lỗi chữ, độ giống giọng, độ lên xuống cao độ, tốc độ).

```bash
python tools/tts/ab.py --out /tmp/ab     # chạy lại thì làm tiếp phần thiếu
```

`--only a,b` giới hạn cấu hình (cả lúc sinh lẫn cột trên trang). `--extra them.json` thêm cấu hình ngoài `CONFIGS`; engine khác VoxCPM2 thì sinh sẵn bản thô `<khoá câu>-<số>.wav` vào một thư mục và khai `{"id", "name", "note", "raw": "<thư mục>"}` — các bản đó đi qua đúng khâu chặn lỗi, chọn bản và hậu kỳ như giọng chính.

`vox_raw.py` sinh bản thô VoxCPM2 theo cách clone khác bản đang chạy (chỉ lấy âm sắc, thêm chỉ dẫn giọng trong ngoặc) để đưa vào `--extra`.

Script chỉ ghi đè tham số lúc chạy, không đụng cache hay manifest. Máy không nghe được hay dở: số đo chỉ để loại bản đọc sai, quyết định là của người nghe. Không commit mp3 hay trang kết quả vào repo.

## Chạy trên GitHub (cách dùng hằng ngày)

Actions → **Giọng đọc** → Run workflow:
- **plan**: gom câu, bỏ câu đã có tệp đúng kiểu, chia đều (theo độ dài) cho `shards` máy.
- **gen** (song song, tối đa 20 máy): mỗi máy sinh phần của mình, tự dừng an toàn trước giới hạn 6 giờ — phần còn lại để lần sau.
- **merge**: gộp vào cache Actions, dọn câu không còn dùng, viết `manifest.json` + báo cáo, rồi gọi **Deploy** (chỉ trên `main`).

**Chạy thử trước khi sinh toàn bộ**: Run workflow với `shards = 1`, `sample = 24`: 24 câu chia đều theo loại câu khó (số điều khoản, dãy số, số hiệu văn bản, viết tắt, ký hiệu, ngày tháng, câu hỏi, đáp án, định nghĩa dài, câu ngắn). Tải artifact `out-0` để nghe.

**Cách đọc đúng logic** (`vi_norm.py`, có test): dãy "Khoản 2, 3, 4" → "khoản hai, khoản ba, khoản bốn"; "VBHN 67/VBHN-VPQH 2025" → "văn bản hợp nhất số sáu mươi bảy năm hai nghìn không trăm hai mươi lăm"; ký hiệu (= ≥ · ×…), đơn vị (ha, cm3…), số La Mã, khoảng số "24.000–90.000" đọc ra chữ; bỏ khỏi lời đọc đường dẫn Drive, tên tệp, tên miền, mã học phần — nhưng GIỮ cảnh báo độ tin cậy ("chưa đối chiếu nguyên văn", "quan điểm học thuật"). Đã quét cả ~13 000 câu: không còn chữ số, ký hiệu hay chữ viết tắt chưa đọc được.

Sinh lại toàn bộ (~28 900 câu, ~29 giờ âm thanh): mặc định chia 200 phần, chạy 20 máy cùng lúc (miễn phí với repo public); ít việc thì tự gộp vào ít phần hơn (mỗi phần ít nhất ~3 000 ký tự) để không nạp model cho từng câu lẻ. Lần đầu thực tế mất 32 giờ + 98 phút cho lượt bổ sung. Đo thật trên máy GitHub ngày 12/11/2026 (CPU không có AMX, float32): mỗi câu tốn khoảng 40 giây cố định + 10 giây cho mỗi giây âm thanh, tức 600–800 giờ máy ≈ **1,5–2 ngày**. Máy có AMX (bfloat16) nhanh gấp đôi.

**Đổi kiểu giọng không làm web mất giọng**: bộ mới được gom trong thư mục chờ `.tts-cache/next`; web giữ bộ cũ cho tới khi bộ mới phủ 99,5% số câu rồi mới thay. Phần nào chưa xong sau 5 giờ 20 phút thì tự dừng; còn thiếu mà lần chạy có thêm tệp thì workflow tự chạy tiếp. Muốn dừng hẳn: huỷ lần chạy trong tab Actions — phần đã sinh vẫn nằm trong thư mục chờ. Sau đó workflow tự chạy khi dữ liệu luật đổi và mỗi tuần một lần, chỉ sinh câu mới (~1 phút máy mỗi câu).

**Làm lại câu bị gắn cờ**: Run workflow với `retry = true`. Bước chia việc lấy thêm các câu mà báo cáo ghi không đạt (kể cả câu đọc sai số đang phải đọc bằng giọng trình duyệt) kèm tệp cũ của chúng; mỗi câu được **chấm lại tệp cũ bằng máy nghe hiện tại** trước, không đạt mới sinh lại (tối đa 10 lần), và **chỉ ghi đè khi bản mới đạt** — không đạt thì giữ nguyên tệp và cờ cũ.

**Vì sao đổi máy nghe** (13/11/2026): lần sinh đầu của bộ `vox2-1` dùng Whisper medium đa ngữ cho câu ngắn và gắn cờ 668 / 28 852 câu (câu 1–4 từ: 23%). Sinh lại bằng 4 cách khác nhau, kể cả bằng engine cũ VieNeu, vẫn "hỏng" y hệt — dấu hiệu máy nghe nhầm chứ không phải giọng đọc sai. Cho ba máy nghe chấm 85 tệp bị cờ đang phát trên web: Whisper medium cho đạt 1, PhoWhisper cho đạt 64, wav2vec2 tiếng Việt (CTC, không có mô hình ngôn ngữ) cho đạt 50 — ví dụ "Công ty cổ phần." Whisper nghe ra "cổ phân", "6." ra "xấu", hai máy kia nghe đúng. Lỗi thật vẫn có (ví dụ "Vàng" đọc thành "vằng"), nên câu nào PhoWhisper vẫn cho trượt thì sinh lại.

**Báo cáo**: trang tóm tắt của lần chạy (và artifact `bao-cao-giong-doc`) liệt kê câu bị gắn cờ: câu gốc, chữ Whisper nghe được, số lỗi. Chỉ cần nghe các câu này; đọc sai thì sửa cách đọc trong `vi_norm.py` (chữ viết tắt mới, số hiệu lạ) rồi chạy lại.

Thử trên máy (cần ffmpeg):

```bash
pip install -r tools/tts/requirements-clone.txt        # Python 3.12; model ~4,7 GB tự tải lần đầu; cần ~14 GB RAM khi chạy float32
python tools/tts/clone.py run --text "Chính xác." --out /tmp/thu
```

## Cách cũ (không dùng nữa, giữ để tham khảo)

- `gen.py` — edge-tts (giọng Microsoft NamMinh, dịch vụ không chính thức). Vẫn là nơi định nghĩa `collect()`/`text_key()` dùng chung; không còn workflow nào gọi để sinh mp3.
- `clone_colab.ipynb` + workflow **Nhập giọng clone** — F5-TTS tiếng Việt trên Colab (CC BY-NC-SA, chậm trên CPU), thay bằng VieNeu.
- Bản **v5b** (đến 12/11/2026) — [VieNeu-TTS v3 Turbo](https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo) (ONNX/CPU, nhanh: ~5,6 giây máy cho mỗi giây âm thanh kể cả kiểm tra) → VoiceFixer → EQ cố định `voice/eq.json` → chuỗi phòng thu. Thay bằng VoxCPM2 vì nghe mù kém cuốn hút hơn; mã ở lịch sử git (`clone.py` trước PR đổi engine), `voice/eq.json` giữ lại để tham khảo.
