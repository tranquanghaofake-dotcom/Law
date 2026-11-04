# Giọng đọc dựng sẵn

App đọc lời theo 2 lớp (`apps/web/src/lib/fx/tts.svelte.ts`):

1. **mp3 dựng sẵn** — giọng clone **v5b** (giọng kênh "kiến thức xã hội", đã được phép; web phi thương mại). Mỗi câu một tệp, đã cắt khoảng lặng và cùng độ lớn −16 LUFS. App tải song song mọi câu của một lời, ghép thành một đoạn liền, nghỉ đều 0,16 s giữa các câu. Chỉ phát khi MỌI câu của lời đều có tệp (không trộn hai giọng).
   Danh sách câu = dữ liệu luật + `npm run tts:texts -w @luyen-luat/web` (chạy chính code app để gom cả câu sinh tự động: giải thích, "Đáp án: …").
2. **Giọng trình duyệt** (Web Speech) — dự phòng khi thiếu tệp: tách cụm ý, mỗi cụm tốc độ/cao độ/khoảng nghỉ riêng (`lib/fx/prosody.ts`).

## Cách sinh một câu (`clone.py`)

| Bước | Công cụ (mã nguồn mở, PyPI) | Ghi chú |
|---|---|---|
| Chuẩn hoá cách đọc | `vi_norm.py` | số, ngày, số hiệu văn bản (51/2001/QH10), chữ viết tắt (BLDS, NĐ-CP…) → chữ. Tên tệp vẫn tính trên câu GỐC |
| Sinh giọng | [VieNeu-TTS v3 Turbo](https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo) (Apache-2.0, ONNX/CPU) | clone từ `voice/ref.wav` (8 s, đã tách nhạc nền), phong cách "tin tức", nhiệt độ 0,5 |
| **Chặn lỗi** | [faster-whisper](https://github.com/SYSTRAN/faster-whisper) small/medium + [Resemblyzer](https://github.com/resemble-ai/Resemblyzer) | nghe lại và so với câu gốc theo ÂM giọng Bắc (x = s, tr = ch, d = gi = r). **Số (điều, khoản, năm) phải đúng tuyệt đối**; câu dưới 6 từ phải đúng hết; câu dài cho phép ~1 lỗi/12 từ vì Whisper cũng nghe nhầm. Sinh ít nhất 2 bản, tối đa 4 (câu ngắn hay gặp như "Chính xác.": luôn 5), chọn bản đạt + giống giọng + biểu cảm nhất |
| Hậu kỳ | [VoiceFixer](https://github.com/haoheliu/voicefixer) (MIT) → EQ cố định `voice/eq.json` → [pedalboard](https://github.com/spotify/pedalboard) | phục hồi + mở dải tần → âm sắc như bản v5b đã duyệt → ấm/dày (low shelf 160 Hz, bớt đục 350 Hz, nén nhẹ) → −16 LUFS, đỉnh ≤ −1 dBFS |

Đổi bất kỳ tham số giọng nào (đầu `clone.py`) → đổi `STYLE` để lần chạy sau sinh lại toàn bộ.
Test phần thuần: `python3 -m unittest tools/tts/test_clone.py tools/tts/test_vi_norm.py`.

## Chạy trên GitHub (cách dùng hằng ngày)

Actions → **Giọng đọc** → Run workflow:
- **plan**: gom câu, bỏ câu đã có tệp đúng kiểu, chia đều (theo độ dài) cho `shards` máy.
- **gen** (song song, tối đa 20 máy): mỗi máy sinh phần của mình, tự dừng an toàn trước giới hạn 6 giờ — phần còn lại để lần sau.
- **merge**: gộp vào cache Actions, dọn câu không còn dùng, viết `manifest.json` + báo cáo, rồi gọi **Deploy** (chỉ trên `main`).

Lần đầu ~13 800 câu ≈ 3–4 giờ với 20 máy (miễn phí với repo public). Sau đó workflow tự chạy khi dữ liệu luật đổi và mỗi tuần một lần — chỉ sinh câu mới, vài phút.

**Báo cáo**: trang tóm tắt của lần chạy (và artifact `bao-cao-giong-doc`) liệt kê câu bị gắn cờ: câu gốc, chữ Whisper nghe được, số lỗi. Chỉ cần nghe các câu này; đọc sai thì sửa cách đọc trong `vi_norm.py` (chữ viết tắt mới, số hiệu lạ) rồi chạy lại.

Thử trên máy (cần ffmpeg):

```bash
pip install -r tools/tts/requirements-clone.txt && pip install --no-deps voicefixer==0.1.3
python -c "from huggingface_hub import snapshot_download as d; d('pnnbao-ump/VieNeu-TTS-v3-Turbo', allow_patterns=['onnx_update/*'], local_dir='models/vieneu')"
python tools/tts/clone.py run --text "Chính xác." --onnx-dir models/vieneu/onnx_update --out /tmp/thu
```

## Cách cũ (không dùng nữa, giữ để tham khảo)

- `gen.py` — edge-tts (giọng Microsoft NamMinh, dịch vụ không chính thức). Vẫn là nơi định nghĩa `collect()`/`text_key()` dùng chung; không còn workflow nào gọi để sinh mp3.
- `clone_colab.ipynb` + workflow **Nhập giọng clone** — F5-TTS tiếng Việt trên Colab (CC BY-NC-SA, chậm trên CPU), thay bằng VieNeu.
