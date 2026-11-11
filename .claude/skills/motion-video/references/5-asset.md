# Pha 5 · Asset: hình thật, chụp sạch, quay đúng nhịp

## Thứ tự ưu tiên nguồn hình

1. Bản quay hoặc ảnh chụp người dùng đưa.
2. **Tự quay sản phẩm đang chạy**: bản build hoặc dev server, dùng `scripts/quay_web.mjs`.
3. **Mount thẳng component** của sản phẩm vào một trang harness. Cách này lấy được trạng thái đẹp nhất mà người dùng thật khó đạt: chuỗi 100 ngày, tủ sách đầy, chức vụ cao nhất.
4. Tranh, icon, logo SVG có sẵn trong repo.
5. Thiếu thì để khung giữ chỗ có nhãn ("Ảnh: màn Cài đặt"), nói rõ trong phần trả lời. **Không bao giờ vẽ giả một giao diện.**

## Ảnh bằng chứng từ trang web (văn bản luật, trang chính thức)

Khi lời nhắc một sản phẩm, trang web, văn bản hay dữ liệu thật, thì trên hình phải có **ảnh chụp thật** của nó. Với video luật: chụp đúng điều luật trên vbpl.vn (hoặc congbao.chinhphu.vn), kèm số hiệu văn bản.

1. Chụp: `quay_web.mjs` với `"element"` trỏ vào khối nội dung (vd. đoạn Điều 328), `scale` 3. Trang tiếng Việt: thêm `"locale": "vi-VN"` nếu job hỗ trợ, URL Google thêm `?hl=vi`.
2. **Cắt sát nội dung chính** (tiêu đề + đoạn được nhắc), không thu nguyên trang. Ảnh 1280 px thu vào thẻ 470 px thì chữ không đọc được. Kiểm bằng con số: chữ trong ảnh **cao ≥ 16 px trên khung 1080/1920** sau khi đặt vào cảnh. Cắt bằng `ffmpeg -i a.png -vf crop=w:h:x:y a_cat.png`.
3. **Đọc từng ảnh** rồi cắt bỏ chữ nhạy cảm: nút Tải về/Download/Get App, mã QR, số điện thoại, "liên hệ", banner cookie, giá khuyến mãi. Mỗi lần dời vùng cắt thì xem lại, vì có thể làm lộ nút khác.
4. Chữ trong ảnh **mâu thuẫn với lời** (ảnh ghi bản cũ, tên sản phẩm đã đổi): cắt phần đó, hoặc ghi rõ trên thanh nguồn rằng đây là trang hiện tại. Báo người dùng.
5. Trang chặn bot hoặc bắt CAPTCHA: **không vượt CAPTCHA**. Lấy trang Wikipedia (vi trước, en sau) hoặc trang khác của chính chủ. Không có nguồn nào thì dùng thẻ chữ trung tính, **không** dùng ảnh "na ná" hay ảnh tự vẽ giả làm ảnh chụp.
6. Mỗi ảnh có dòng nguồn trên hình ("vbpl.vn · Bộ luật Dân sự 2015", "Wikipedia"). Ghi vào `FACTS.md`: ảnh → URL → ngày chụp → 1–2 câu chữ đọc được trong ảnh. Câu chữ này là "dấu vân tay" để người chấm ở pha 7 chứng minh đã thật sự xem (xem `7-kiem-tra.md`).

## Quay giao diện thật — `quay_web.mjs`

Chạy trong thư mục dự án video. Phải có server đang phục vụ sản phẩm: dev server, `vite preview`, hoặc `python3 -m http.server` trỏ vào thư mục build. Với bản build có `base` (vd. `/Law/`), tạo symlink thư mục build thành `<thư mục>/Law`.

```json
[
  { "name": "quiz", "url": "http://localhost:8765/Law/#/bo/dat-coc", "viewport": [432, 768], "scale": 2.5, "sec": 3,
    "waitFor": "text=Bảo đảm việc giao kết", "actions": [{ "at": 0.6, "type": "click", "target": "text=Bảo đảm việc giao kết" }] },
  { "name": "tim", "url": "…/#/mon/dan-su-2/khai-niem", "viewport": [432, 768], "scale": 2.5, "sec": 2.5, "waitFor": "input",
    "actions": [{ "at": 0.3, "type": "type", "target": "input", "text": "dat coc", "every": 0.12 }] },
  { "name": "the", "url": "http://localhost:5199/#card?%7B%22count%22%3A100%7D", "element": "#app svg", "alpha": true, "scale": 3 }
]
```

Cỡ khung:
- dọc: `[432,768]` @2,5 → 1080×1920;
- ngang: `[1280,720]` @1,5 → 1920×1080;
- ảnh tĩnh để phóng to: `scale` 3.

Đầu ra:
- `public/cap/<name>.mp4` (hoặc `.webm` nếu `alpha`);
- `<name>-0.png`: khung đầu, dùng làm poster giữ hình trước khi video chạy.

**Ghi lại thời điểm sự kiện** trong bản quay (click ở `at`, số đổi ở mốc của animation) để pha 6 canh vào phách.

### Vì sao phải quay theo "thời gian ảo"

Chụp ảnh 60 lần/giây bằng trình duyệt thật chậm hơn thời gian thực, nên animation sẽ chạy vượt và giật. Script làm 3 việc:
- (1) dùng `page.clock` **đã pauseAt** để giờ chỉ tiến khi gọi `runFor`. Mặc định clock vẫn trôi theo giờ thật, chính là nguyên nhân bản quay chạy vượt rồi tự đóng.
- (2) mỗi khung, dừng mọi Web Animation/CSS animation và đặt `currentTime` theo đồng hồ ảo. Đây là phần timesnap không làm được.
- (3) đặt `setCurrentTime` cho SVG SMIL.

## Harness — mount component của sản phẩm

Dùng khi sản phẩm là SPA (Svelte, React, Vue) và cần trạng thái đặc biệt.

- Tạo một thư mục `harness/`:
  - `vite.config` dùng đúng plugin framework và alias (`$lib`, `@/`) trỏ vào mã nguồn sản phẩm;
  - `server: { port, strictPort: true, hmr: false, watch: null }`;
  - `fs.allow` trỏ tới gốc repo.
- `index.html` phải ép nền trong suốt: `html,body{background:transparent!important;background-image:none!important}`. **Thiếu dòng này thì ảnh bị viền nền ở góc bo.**
- `main.ts` import CSS toàn cục của sản phẩm, rồi `mount(Component, { target, props })` theo hash `#tên?{json props}`. Xong thì đặt `document.body.dataset.ready = "1"`.
- **Không sửa file nào trong lúc đang quay.** Tắt HMR vẫn có thể tải lại khi đổi `tsconfig`.
- **Truyền props giống hệt cách sản phẩm truyền.** Đọc component cha, không đoán. Truyền thiếu thì trang phục, màu, trạng thái sẽ sai so với sản phẩm thật.

## Dữ liệu demo cho màn "đầy"

Để có màn "đầy" (tiến độ cao, nhiều huy hiệu):
- ghi dữ liệu giả vào IndexedDB/localStorage qua `init: [{ "js": "…" }]`;
- đọc lược đồ lưu trữ trong code (Dexie, idb) trước khi ghi, rồi reload;
- **ghi chú trong REVIEW.md** rằng đây là dữ liệu demo.

## Kiểm asset trước khi dựng

- Ghép nhanh một tờ: `ffmpeg -i a.png -i b.png -filter_complex hstack sheet.png`, rồi xem bằng mắt. Cần thấy: góc bo sạch, chữ nét ở cỡ sẽ dùng, trạng thái đúng như sản phẩm.
- Với video: lấy 4–6 khung (`select=eq(n\,N)`) xem animation có thật sự chạy, không trắng, không đóng sớm.
