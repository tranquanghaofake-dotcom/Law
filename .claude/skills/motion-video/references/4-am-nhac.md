# Pha 4 · Nhạc: quyền dùng, đo nhịp, dựng theo cấu trúc bài

## Quyền dùng — chọn một đường, ghi vào SPEC.md

| Đường | Khi nào | Giao gì |
|---|---|---|
| A. File người dùng có quyền (mua, tự làm, giấy phép) | muốn nhạc nằm trong video | video đã trộn nhạc |
| B. Ghép bài trong thư viện nhạc nền tảng (TikTok/Reels/Shorts) lúc đăng | bài thương mại đang hot | **bản đăng không nhạc** (chỉ hiệu ứng âm thanh) + hướng dẫn canh nhạc + bản nháp có nhạc dò nhịp |
| C. Nhạc miễn phí bản quyền có giấy phép rõ (ghi nguồn, điều kiện) | dùng cho YouTube/web | video đã trộn nhạc + ghi công |

Không tải từ trang mp3 lậu hoặc YouTube converter. Bài của nghệ sĩ có label là tác phẩm có chủ quyền. Bản nghe thử chính thức (`itunes.apple.com/search?…&entity=song`, Deezer API) **chỉ dùng để đo**: lưu ở thư mục tạm, không đưa vào video, không commit.

## Đo nhịp

```bash
python3 scripts/do_nhip.py preview.m4a --json nhip.json          # tự đoán BPM
python3 scripts/do_nhip.py preview.m4a --bpm 111 --json nhip.json # đã biết BPM (Tunebat/songbpm)
```

Đọc kết quả:
- **BPM:** đối chiếu với cơ sở dữ liệu công khai. Máy hay nhầm nửa/gấp đôi và 2/3–3/2 khi nhạc có chùm ba hoặc 808 lệch phách. Bản Sped Up/Slowed/Remix là tempo khác: phải chốt đúng bản người dùng sẽ ghép.
- **Bass tắt → cụm:** khoảng tắt lặp lại sau mỗi N ô nhịp nghĩa là cụm dài N ô (thường 8). Phách ngay sau khoảng tắt là **phách đầu cụm**, chỗ nện mạnh nhất.
- **Bài có intro im hay không:** năng lượng đều từ giây đầu nghĩa là đủ trống từ đầu. Khi đó hook phải nện ngay, không dựng "intro im rồi drop".

## Dựng theo cấu trúc bài

- Đặt trong `storyboard.json`:
  - `music.bpm`, `music.phraseBars` (độ dài cụm), `music.gapBeats` (số phách bass tắt);
  - `music.offsetSec`: thường 0, tức là người đăng kéo nhạc để phách đầu cụm rơi vào 0:00.
- **Tổng số ô nhịp = bội số độ dài cụm.** `kiem_tra_storyboard.py` sẽ cảnh báo nếu lệch.
- **Chương mới bắt đầu ở đầu cụm.** Template tự đặt cú nện ở mọi đầu cụm và tự "hút vào" trong khoảng bass tắt của cảnh kết thúc cụm.
- **Sự kiện trong bản quay rơi đúng phách** (click, số đổi, cánh tủ mở): biết thời điểm sự kiện trong bản quay (`syncSec`) thì đặt `syncBeat`/`hitBeat`, template tự lùi điểm bắt đầu video. Ví dụ: màn thắp chuỗi đổi số ở 3,865 s thì `syncSec: 3.865, hitBeat: 8`.

## Bản nháp có nhạc dò nhịp (đường B)

Để người dùng duyệt nhịp khi chưa ghép bài thật:
- tạo một track click hoặc beat **cùng BPM, cùng độ dài cụm, cùng chỗ bass tắt**;
- trộn vào bản đăng bằng ffmpeg (`amix`), **không render lại**;
- ghi nhãn rõ: "nhạc dò nhịp, không phải bài thật".

Đây là công cụ duyệt, không phải sản phẩm.

## Hướng dẫn canh nhạc gửi kèm (đường B)

```text
1. Chọn đúng bản gốc của bài (không Sped Up/Slowed).
2. Kéo đoạn nhạc để video bắt đầu ngay chỗ bass vừa trở lại sau khoảng lặng ngắn.
3. Kiểm: các cú nện ở 0:17,3 · 0:34,6 · 0:51,9 phải trùng lúc bass trở lại.
4. Âm lượng: âm gốc (hiệu ứng) 30–40 %, nhạc 100 %.
```

Mốc giây tính bằng `b(phraseBars × 4 × k) / fps`.

## Hiệu ứng âm thanh

- Ít mà đúng. Mỗi tiếng có nguyên nhân trên hình:
  - click khi có cú bấm thật;
  - whoosh khi cắt cảnh hoặc thẻ bay nhanh;
  - pop khi huy hiệu/số đáp xuống;
  - riser → impact chỉ một lần, cho cú chốt.
- **Thời điểm:** đỉnh của tiếng rơi sau hình 1 khung.
- **Đổi bản thu:** cùng một tiếng lặp lại thì xoay vòng 2–3 bản thu.
- **Độ to:** hiệu ứng cao hơn nhạc nền 3–6 dB. Mix cho mạng xã hội khoảng −16 đến −14 LUFS, đỉnh ≤ −1 dBTP. Bản đăng đường B để hiệu ứng nhẹ, vì nhạc nền tảng sẽ đè lên.
- **Nguồn tiếng:** template kèm 5 tiếng Kenney Interface Sounds (CC0). Thêm tiếng: chỉ dùng CC0 hoặc tiếng của chính sản phẩm.
