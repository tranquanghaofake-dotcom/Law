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
| **Chặn lỗi** | [faster-whisper](https://github.com/SYSTRAN/faster-whisper) small/medium + [Resemblyzer](https://github.com/resemble-ai/Resemblyzer) | nghe lại và so với câu gốc theo ÂM giọng Bắc (x = s, tr = ch, d = gi = r). **Số (điều, khoản, năm) phải đúng tuyệt đối**; câu dưới 6 từ phải đúng hết; câu dài cho phép ~1 lỗi/12 từ vì Whisper cũng nghe nhầm. Câu thường: bản đầu đạt là dùng, không đạt thì sinh lại tối đa 5 lần; câu ngắn (≤ 4 từ, VoxCPM2 dễ đọc trệch): sinh tới khi có 2 bản đạt (tối đa 5), chọn bản giống giọng + biểu cảm nhất. **Câu vẫn đọc sai số thì không vào manifest** — app đọc lời đó bằng giọng trình duyệt, lần chạy sau sinh lại |
| Hậu kỳ | [pedalboard](https://github.com/spotify/pedalboard) | ấm/dày (low shelf 160 Hz, bớt đục 350 Hz, nén nhẹ) → de-esser → −16 LUFS, đỉnh ≤ −1 dBFS |

Vì sao là bản này: hai vòng nghe mù ngày 12/11/2026 (xem `ab.py`) — VieNeu v3 Turbo với 5 cấu hình, rồi VoxCPM2 với 3 cách clone — Hào chọn "VoxCPM2 clone kèm lời mẫu".
Kiểu số: máy có AMX (`amx_bf16`) chạy bfloat16; máy khác (phần lớn máy GitHub) tự chuyển float32 — bfloat16 không có AMX chậm hàng chục lần.
Đổi bất kỳ tham số giọng nào (đầu `clone.py`) → đổi `STYLE` để lần chạy sau sinh lại toàn bộ.
Test phần thuần: `python3 -m unittest tools/tts/test_clone.py tools/tts/test_vi_norm.py tools/tts/test_ab.py`.

## Nghe thử trước khi đổi giọng (`ab.py`)

Đổi tham số là phải sinh lại ~13 800 câu, nên nghe thử trước: `ab.py` sinh **12 câu thật của app × các cấu hình trong `CONFIGS`** (cột đầu luôn là bản đang chạy), rồi viết một trang `index.html` tự chứa. Trang ẩn tên cấu hình và xáo thứ tự từng câu (nghe mù); chọn bản hay nhất ở mỗi câu rồi bấm "Xem kết quả" để thấy số phiếu kèm số đo của máy (lỗi chữ, độ giống giọng, độ lên xuống cao độ, tốc độ).

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

Sinh lại toàn bộ ~13 800 câu: mặc định chia 80 phần, chạy 20 máy cùng lúc (miễn phí với repo public). Mỗi bản tốn khoảng 4 giây máy cho 1 giây âm thanh trên máy có AMX, khoảng 9 giây trên máy không có (đo giả lập AVX2). Phần nào chưa xong sau 5 giờ 20 phút thì tự dừng, lần chạy sau làm tiếp; giọng cũ vẫn ở trên web cho tới khi bước gộp xong. Sau đó workflow tự chạy khi dữ liệu luật đổi và mỗi tuần một lần — chỉ sinh câu mới.

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
