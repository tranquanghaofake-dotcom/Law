# Giọng đọc dựng sẵn

App đọc lời theo 2 lớp (`apps/web/src/lib/fx/tts.svelte.ts`):

1. **mp3 neural dựng sẵn** — giọng `vi-VN-NamMinhNeural` (nam, trầm) qua [edge-tts](https://github.com/rany2/edge-tts), đọc chậm, hạ giọng cuối câu theo mẫu video "kiến thức xã hội". Chỉ phát khi mọi câu của lời đều có tệp (không trộn hai giọng).
2. **Giọng trình duyệt** (Web Speech) — tách cụm ý, mỗi cụm tốc độ/cao độ/khoảng nghỉ riêng (`lib/fx/prosody.ts`). Edge có giọng "Microsoft HoaiMy/NamMinh Online (Natural)" tự nhiên hơn Chrome.

## Sinh mp3

- **Trên GitHub**: Actions → **Giọng đọc** → Run workflow (lần đầu ~1 giờ, ~8 500 câu). Kết quả nằm trong cache Actions; workflow **Deploy** chạy sau đó tự chép vào trang. Workflow tự chạy lại hằng tuần để bổ sung câu mới và giữ cache (GitHub xoá cache không dùng sau 7 ngày).
- **Trên máy**: `pip install edge-tts` + có `ffmpeg`, rồi `python tools/tts/gen.py --out .tts-cache --limit 20` để nghe thử.

Không commit mp3 vào repo (~100 MB). Lưu ý: edge-tts dùng dịch vụ đọc to của Microsoft Edge, miễn phí nhưng không chính thức; Microsoft đổi/chặn thì app tự dùng giọng trình duyệt.

Phương án thay thế mã nguồn mở hoàn toàn (chạy offline, chất lượng thấp hơn): [Piper](https://github.com/rhasspy/piper) giọng `vi_VN-vais1000-medium`; giọng có cảm xúc/nhân bản giọng: [viXTTS](https://huggingface.co/capleaf/viXTTS) — cần GPU, chưa tích hợp.
