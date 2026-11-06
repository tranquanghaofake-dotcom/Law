# Giọng đọc là đồng hồ (chế độ `"clock": "voice"`)

Dùng cho video **giải thích có lời** (luật, khái niệm, hướng dẫn): thời gian do câu nói quyết định, không do nhạc. Chữ trên hình phải hiện **đúng lúc từ khoá được nói**. Hiện trước lời thì người xem đọc trước rồi nghe lại; hiện sau lời quá 0,5 s thì trông như lệch tiếng.

Ý tưởng học từ SeeCut và các bản phái sinh (neo phần tử vào thời điểm bắt đầu của từ khoá, khớp kịch bản vào giọng có sẵn). Mã ở đây tự viết, không chép; xem `NOTICE.md`.

## 1. Kịch bản → `kich_ban.json`

```json
[["a1", "Bạn đặt cọc mua nhà, rồi bên bán đổi ý."],
 ["a2", "Tiền cọc có lấy lại được không?"],
 ["b1", "Theo Điều 328 Bộ luật Dân sự năm 2015, bên nhận cọc phải trả lại và chịu phạt một khoản tương đương."]]
```

- id = `<chữ cái cảnh><số>`. Đổi chữ cái tức là sang cảnh mới; mỗi mục đúng một câu.
- Viết **y như sẽ đọc**. Đọc "ba trăm hai mươi tám" mà viết "328" thì vẫn khớp được (nội suy), nhưng mốc của chính từ đó kém chính xác hơn.
- Một câu ≤ ~15 từ. Khoảng 150 từ/phút: video 60 s ≈ 150 từ.
- Nội dung pháp luật: số hiệu văn bản, điều/khoản, tình trạng hiệu lực ghi trong `FACTS.md` **trước** khi viết lời (luật 1 trong `SKILL.md`).

## 2. Giọng đọc

Ưu tiên: (a) người dùng tự thu hoặc gửi file; (b) dịch vụ TTS có giấy phép thương mại rõ (người dùng chọn và trả phí); (c) TTS mở chỉ để **dựng nháp**. Giọng Piper `vi_VN-vais1000` chưa xác minh giấy phép thương mại, nên chỉ dùng làm giọng tạm và phải nói rõ với người dùng.

**Chưa ai nghe được giọng.** Máy chỉ đo được độ dài, độ to, tỉ lệ khớp, không nghe được giọng hay hay dở, đọc sai dấu hay không. Luôn nhờ người dùng nghe thử 10 giây đầu trước khi dựng cả bài.

## 3. Khớp → `src/giong.json`

```bash
pip install faster-whisper            # một lần; mô hình "small" (~460 MB) tải từ huggingface.co lần đầu
python3 <skill>/scripts/canh_giong.py . voice.mp3 kich_ban.json            # → public/voice/voice.wav + src/giong.json
python3 <skill>/scripts/canh_giong.py . voice.mp3 kich_ban.json --model medium   # tên riêng/thuật ngữ khớp kém
```

Đọc bảng in ra:
- **Mỗi câu ≥ 50 % khớp.** Thấp hơn nghĩa là giọng đọc khác kịch bản (đọc thêm/bớt câu, đổi từ): hỏi người dùng, đừng tự sửa cho khớp.
- Tên riêng, số, từ tiếng Anh hay bị nghe sai. Mốc của các từ đó được nội suy từ từ lân cận, lệch tối đa ~0,3 s. Đừng neo cú chốt vào chúng; neo vào từ tiếng Việt thường ngay trước hoặc sau.
- Không cài được nhận dạng (máy chặn mạng, RAM < 2 GB): script tự chuyển sang **ước lượng** theo khoảng lặng và số ký tự. Bản này chỉ để dựng nháp; `kiem_tra_storyboard.py` sẽ cảnh báo.
- Đã đo trên giọng mẫu 10 s, CPU 4 nhân: mô hình `small` mất ~5 s, khớp 90–100 %.

## 4. Storyboard

```jsonc
{
  "clock": "voice",
  "voice": { "file": "voice/voice.wav", "tailSec": 1.5, "leadSec": 0 },
  "music": { "bpm": 120, "offsetSec": 0, "phraseBars": 8, "gapBeats": 1, "file": null, "volume": 0.12 },
  "scenes": [
    { "id": "hook", "type": "TitleSlam", "say": ["a1", "a2"], "bg": "dark", "props": { "lines": [
      { "text": "Đặt cọc mua nhà", "at": { "say": "đặt cọc" } },
      { "text": "LẤY LẠI ĐƯỢC?", "at": { "say": "a2:lấy lại" }, "size": "hero", "color": "accent" } ] } },
    { "id": "luat", "type": "KnowledgeCard", "say": ["b1"], "props": { "…": "…", "hits": [{ "say": "phạt" }] } }
  ],
  "cues": [{ "sfx": "select_001", "at": { "say": "b1:phạt" } }]
}
```

- `say`: các câu cảnh này nói. Cảnh bắt đầu ở đầu câu đầu tiên và kéo tới cảnh sau; cảnh cuối giữ thêm `tailSec`.
- **Mốc lời** `{ "say": "…", "add": phách }` dùng được ở **mọi chỗ cần mốc**: `at`, `start`, `hits`, `cues.at`. Có 3 dạng:
  - `"a2"`: đầu câu a2;
  - `"a2:lấy lại"`: lúc cụm từ đó bắt đầu được nói trong câu a2;
  - `"lấy lại"`: tìm trong các câu của cảnh trước, rồi mới tìm cả bài.

  Cụm từ phải có thật trong kịch bản: so khớp nguyên từ, không phân biệt hoa thường, bỏ dấu câu. Từ ngắn như "có", "là" xuất hiện nhiều lần thì phải ghi kèm id câu.
- Mốc số vẫn dùng được, tính bằng phách trong cảnh. Ở chế độ voice, 1 phách = 60/bpm giây (bpm 120 → 0,5 s); con số này chỉ là đơn vị đo cho hiệu ứng.
- Chế độ voice **tắt** lớp đập theo nhạc và cú nện đầu cụm. Muốn nện thì đặt `hits` vào từ khoá. Nhạc nền nếu có thì để thấp (`volume` 0,08–0,15), lời phải nghe rõ.
- `enter: "auto"` ở chế độ voice: cảnh đầu cắt thẳng, các cảnh sau whip.

## 5. Luật neo (rút từ thực chiến dựng video nói-trước-camera)

- Neo phần tử vào **từ khoá**, không vào đầu câu. Một cụm chữ nhiều tầng thì tầng đầu neo vào từ đầu tiên làm nó xuất hiện, các tầng sau neo vào từ của chính tầng đó.
- Liệt kê: mỗi mục bật **đúng lúc từ của nó được nói**, không bật cả danh sách một lần.
- Không để quãng không có gì trên hình giữa hai câu: phần tử cảnh trước giữ tới đầu câu kế. `kiem_tra_bo_cuc.mjs` báo TRỐNG > 0,8 s.
- Nhãn: IN HOA, 1–3 từ rút từ lời ("CĂN CỨ", "HẬU QUẢ"), không chép nguyên cụm lời.
