# legal-content-pipeline

Tự động hóa 90% quy trình: **thu thập câu hỏi pháp lý thật → chấm điểm theo trụ → soạn kịch bản có căn cứ (RAG trên văn bản luật) → BẠN DUYỆT 10 phút/ngày → render video → hàng đợi đăng → sinh thẻ cho web học Luật.**

Chỉ dùng API chính thức hoặc nguồn công khai được phép. Không dùng cookie tài khoản cá nhân, không cào Facebook.

```
collect ──► score (LLM) ──► write (LLM + RAG) ──► [REVIEW: bạn] ──► render (MoneyPrinterTurbo) ──► publish
   │                                                   │
 Threads API · Reddit API · YouTube API · RSS · Form     └──► thẻ cloze/MCQ cho web (out/*.cards.json)
```

---

## 0. Yêu cầu
- Python 3.10+ (đã thử trên 3.13), Git.
- Một API key LLM OpenAI-compatible (OpenAI / Gemini / DeepSeek / Ollama local). Không có key vẫn chạy được **chế độ demo**.
- (Tùy chọn) Docker để chạy MoneyPrinterTurbo render video.

## 1. Cài đặt (5 phút)
```bash
git clone https://github.com/tranquanghaofake-dotcom/law.git   # hoặc giải nén zip
cd law/legal-content-pipeline
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Windows: copy .env.example .env
```

## 2. Chạy thử ngay (chế độ demo, không cần key)
```bash
export PIPELINE_DEMO=1          # Windows PowerShell: $env:PIPELINE_DEMO="1"
python run.py init              # tạo DB + index luật (đang dùng file mẫu)
python run.py collect --demo    # nạp 5 câu hỏi mẫu từ data/inbound/demo_questions.csv
python run.py score             # chấm điểm (demo: theo từ khóa)
python run.py write             # soạn kịch bản (demo: khung)
python run.py review            # mở http://127.0.0.1:8765  (user bất kỳ, mật khẩu = REVIEW_PASSWORD trong .env)
```
Bạn sẽ thấy 4 kịch bản chờ duyệt, 1 item bị loại (không phải câu hỏi). Đó là toàn bộ vòng đời.

## 3. Bật LLM thật
Trong `.env`:
```
LLM_API_KEY=sk-...
LLM_BASE_URL=https://api.openai.com/v1      # hoặc Gemini/DeepSeek/Ollama (xem .env.example)
```
Trong `config.yaml` → `llm.model`. Gợi ý rẻ-đủ-tốt: `gpt-4o-mini`, `gemini-2.0-flash`, `deepseek-chat`; chạy local: Ollama + `qwen2.5:14b` (tiếng Việt ổn).
Bỏ `PIPELINE_DEMO` đi (hoặc đặt `=0`).

## 4. Nạp văn bản luật cho RAG (bắt buộc trước khi dùng thật)
Scriptwriter **chỉ được phép** dùng điều luật có trong kho — đây là chốt chống bịa căn cứ. Kho rỗng → mọi kịch bản bị đánh dấu `thieu_can_cu`.

1. Vào https://vbpl.vn → tìm văn bản → "Toàn văn" → copy.
2. Tạo `data/laws/bo-luat-dan-su-2015.txt`, dòng đầu:
   ```
   # LAW: Bộ luật Dân sự 2015 | SOURCE: https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=...
   ```
   rồi dán nguyên văn bên dưới. Pipeline tự cắt theo `Điều N.`.
3. Làm tương tự cho BLLĐ 2019, BLHS (bản hợp nhất), BLTTHS 2015, NĐ 21/2021, NĐ 12/2022. Danh sách trong `data/laws/README.md`.
4. **Xóa** `data/laws/_mau.txt`, chạy `python run.py init`.

Văn bản QPPL không được bảo hộ quyền tác giả (Điều 15 Luật SHTT), dùng nguyên văn là hợp pháp.

## 5. Bật từng nguồn thu thập

Sửa `config.yaml` → `sources.<tên>.enabled: true` và điền key vào `.env`.

### 5.1 Inbound (Google Form) — bật sẵn, nguồn tốt nhất về dài hạn
1. Tạo Google Form 1 câu hỏi dài "Gửi câu hỏi pháp lý ẩn danh" (không thu email). Gắn link vào bio TikTok.
2. Responses → Link to Sheets → đổi tên cột câu hỏi thành `cau_hoi` → File → Download → CSV → bỏ vào `data/inbound/`.
3. (Tự động) Sheets: Extensions → Apps Script → viết hàm xuất CSV lên Drive, hoặc dùng n8n node Google Sheets → ghi file.

### 5.2 RSS — bật sẵn, không cần key
`config.yaml → sources.rss.feeds`: thêm RSS của báo pháp luật / diễn đàn công khai. **Kiểm tra `robots.txt` và điều khoản sử dụng của trang trước khi thêm.** Chỉ lấy tiêu đề + mô tả làm nguyên liệu; không sao chép bài.

### 5.3 Threads API (chính thống, miễn phí)
1. https://developers.facebook.com → Create App → use case **Threads API**.
2. App Dashboard → Threads → thêm tài khoản Threads của bạn làm **Threads Tester**; vào Threads app → Settings → Website permissions → chấp nhận.
3. Lấy access token (User Token Generator trong dashboard) → `.env`: `THREADS_ACCESS_TOKEN`, `THREADS_USER_ID`. Token dài hạn 60 ngày — phải refresh (xem docs `/refresh_access_token`).
4. Quyền `threads_keyword_search` cần **App Review** (nộp screencast + privacy policy + ToS URL). Trước khi được duyệt, chỉ đọc được bài của tài khoản tester → vẫn dùng được để đọc **reply dưới bài của chính bạn** (sửa `threads_api.py` nếu muốn).
5. `sources.threads.keywords`: từ khóa tìm; mỗi từ khóa 1 request/6h là đủ, dưới hạn mức.

### 5.4 Reddit API
1. https://www.reddit.com/prefs/apps → create app → type **script** → lấy client_id (dưới tên app) và secret.
2. `.env`: `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USER_AGENT`.
3. **Lưu ý ToS**: free tier dành cho mục đích phi thương mại. Kênh có mục đích thương hiệu/kiếm tiền nằm ở vùng xám — đọc Reddit Data API Terms và tự quyết; mình để `enabled: false` mặc định.

### 5.5 YouTube Data API (chính thống, miễn phí, 10.000 unit/ngày)
1. https://console.cloud.google.com → New project → APIs & Services → Enable **YouTube Data API v3** → Credentials → API key.
2. `.env`: `YOUTUBE_API_KEY`.
3. `config.yaml → sources.youtube.channel_ids`: ID kênh (dạng `UC...`) của các kênh luật lớn; lấy bằng cách mở kênh → About → Share → Copy channel ID. Comment dưới video của họ là câu hỏi thật, ít ai khai thác.

## 6. Vận hành hằng ngày

```bash
python run.py daily     # collect → score → write (3–10 phút tùy LLM)
python run.py review    # bạn duyệt 10 phút: đối chiếu căn cứ, sửa lời, bấm Duyệt/Loại
python run.py render    # gửi kịch bản đã duyệt sang MoneyPrinterTurbo (xem mục 7)
python run.py publish   # xuất out/publish_queue.csv (caption + hashtag + đường dẫn video)
python run.py mark-published <id>   # sau khi đăng tay
```

**Tự động bằng cron (Linux/macOS):**
```
0 6,18 * * *  cd /path/legal-content-pipeline && .venv/bin/python run.py daily >> out/cron.log 2>&1
```
Windows: Task Scheduler → chạy `.venv\Scripts\python.exe run.py daily` 2 lần/ngày.
Hoặc n8n (self-host): Schedule → Execute Command `python run.py daily` → Telegram node báo "có N kịch bản chờ duyệt".

**Checklist duyệt (hiện ngay trong giao diện):** mở từng điều luật, đối chiếu số điều/văn bản/năm/con số; còn hiệu lực?; trích đoạn ≤ 40 từ, không tên riêng; 2–3 bước hành động; không phán "có tội". Đây là 10% không tự động — và là thứ giữ uy tín kênh.

## 7. Render video — MoneyPrinterTurbo
```bash
git clone https://github.com/harry0703/MoneyPrinterTurbo.git
cd MoneyPrinterTurbo && cp config.example.toml config.toml
# config.toml: điền pexels_api_keys (miễn phí tại pexels.com/api) — footage stock có giấy phép
docker compose up -d        # WebUI :8501, API :8080
```
`config.yaml → render`: `voice_name: vi-VN-HoaiMyNeural` (nữ) hoặc `vi-VN-NamMinhNeural` (nam) — Edge TTS miễn phí, dùng thương mại được. Pipeline gửi **kịch bản đã duyệt** làm `video_script`, không để MPT tự sinh script.

Nếu API MPT đổi tên trường theo phiên bản → mở http://localhost:8080/docs và chỉnh `_payload()` trong `pipeline/render.py`. Khi MPT không chạy, pipeline vẫn xuất `out/script_XXXX.txt` để bạn đọc/quay tay.

**Giai đoạn 2 (khuyến nghị sau 6 tuần):** thay TTS bằng giọng thật + mặt thật của bạn. Thương hiệu cá nhân cần điều đó, và TikTok xem là tín hiệu "original" mạnh nhất.

## 8. Đăng
- `publish.mode: queue` (mặc định): mở `out/publish_queue.csv`, đăng/lên lịch trong TikTok Studio, rồi `mark-published`.
- `publish.mode: tiktok`: TikTok Content Posting API (Direct Post). Cần: đăng ký app tại developers.tiktok.com → scope `video.publish` → **app audit** (trước audit chỉ đăng được private). Code hiện có bước `init`; bước upload chunk làm theo docs. Thực tế: queue + lên lịch trong TikTok Studio là đủ cho 1 video/ngày.

## 9. Thẻ cho web học Luật
Mỗi kịch bản sinh kèm thẻ (`cloze` nguyên văn điều luật, `mcq` mini-tình huống) → `out/script_XXXX.cards.json` sau khi render, hoặc đọc trực tiếp bảng `scripts.cards` trong `data/pipeline.db`. Import vào web (kar-dots/Nibomo) bằng script chuyển đổi — mỗi thẻ đã có `citation` để liên kết ngược về điều luật và video.

## 10. Nâng cấp khi cần
| Khi nào | Làm gì |
|---|---|
| >2.000 điều luật, BM25 bắt đầu lệch | Embedding `bge-m3` + pgvector (Supabase) thay `rag/retriever.py` |
| Muốn dùng chung DB với web | SQLite → Supabase Postgres (đổi `db.py`, schema giữ nguyên) |
| Muốn thông báo/duyệt trên điện thoại | n8n: sau `daily` gửi Telegram kèm link review; review UI mở qua Cloudflare Tunnel |
| Đo hiệu quả hook | Cron kéo số liệu từ TikTok API (scope `video.list`) → cột `scripts.metrics` → đưa vào prompt scorer |

## 11. Quy tắc pháp lý gắn trong code
- Trích đoạn ≤ 40 từ, không tên riêng (scorer ép; reviewer kiểm).
- Căn cứ chỉ từ kho văn bản thật (scriptwriter ép `insufficient` khi thiếu).
- Disclaimer sinh viên Luật nối vào mọi kịch bản (`scriptwriter.DISCLAIMER`).
- Cờ rủi ro `ten_that`, `vu_dang_xet_xu`, `nhay_cam` → tự loại.
- Không có collector nào dùng tài khoản/cookie cá nhân; Facebook không có collector vì không có đường chính thống.

## Cấu trúc
```
run.py                 CLI
config.yaml            trụ, ngưỡng, nguồn, LLM, render
pipeline/
  settings.py db.py llm.py dedupe.py
  collectors/  threads_api.py reddit_api.py youtube_api.py rss_forum.py inbound.py
  rag/         ingest.py (cắt theo Điều) retriever.py (BM25)
  scorer.py    chấm 3 cột + cờ rủi ro
  scriptwriter.py  5 khối + citations + cards
  render.py    MoneyPrinterTurbo API
  publish.py   queue / TikTok API
review/app.py  FastAPI, cổng duyệt
data/laws/     văn bản luật (.txt)   data/inbound/  CSV câu hỏi gửi về
out/           kịch bản, thẻ, hàng đợi đăng
```
