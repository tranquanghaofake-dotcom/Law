# Pha 6 · Dựng bằng template Remotion

## Mục lục

1. Tạo dự án
2. Cấu trúc
3. storyboard.json
4. 11 cảnh mẫu — props chính
5. Bộ cảnh áp phích — 8 cảnh `Poster*`
6. Thêm loại cảnh mới
7. Soát trước khi render

## Tạo dự án

```bash
bash <skill>/scripts/tao_du_an.sh ~/video-ten   # chép template/, npm install
cd ~/video-ten
# asset → public/cap/, nhạc có quyền → public/music/, sửa src/storyboard.json
python3 <skill>/scripts/kiem_tra_storyboard.py src/storyboard.json
node <skill>/scripts/kiem_tra_bo_cuc.mjs .                    # máy đo bố cục
node <skill>/scripts/khung_tinh.mjs . --n 14                  # khung tĩnh + tờ soát out/khung/to-soat.jpg
npx remotion render Main out/video.mp4 --codec=h264 --crf=16  # khi đã duyệt
```

Remotion miễn phí cho cá nhân và nhóm ≤ 3 người, công ty lớn hơn cần license (remotion.pro/license). Nói điều này khi người dùng là doanh nghiệp. Chromium: dùng `PW_CHROMIUM` hoặc `/opt/pw-browsers/chromium` nếu có, không thì Remotion tự tải.

## Cấu trúc

```text
src/storyboard.json   ← chỉ sửa file này cho phần lớn video
src/core/timeline.ts  lưới nhịp b(n), vị trí cảnh, cụm, khoảng bass tắt, beatPulse; chế độ voice: sayFrame, PROPS (mốc lời → phách)
src/core/probe.tsx    đo hộp chữ/ảnh từng khung cho kiem_tra_bo_cuc.mjs (chỉ bật khi inputProps {probe:true})
src/giong.json        mốc từng câu/từng từ của giọng đọc (canh_giong.py sinh; mẫu để trống)
src/core/look.tsx     theme → font Google có tiếng Việt, cỡ chữ theo khung, vùng an toàn, easing, useBeats/useT/useCol
src/core/fx.tsx       SceneShell (vào/ra), Words, Glitch, Shockwave, LightLeak, Device, MediaView, Icon, decor (tắt mặc định)
src/scenes/index.tsx  11 cảnh mẫu
src/scenes/poster.tsx 8 cảnh áp phích (Poster*): chữ Anton tự co cho lấp khung, mảng màu quét, tờ giấy nghiêng, con dấu, số đếm
src/Main.tsx          ghép cảnh + lớp nhịp (đập theo phách, nện đầu cụm, tách màu chữ, tối viền lúc bass tắt) + âm thanh
src/icons.json        bộ icon nét mảnh (lưới 24, path/circle/text)
```

## storyboard.json

```jsonc
{
  "title": "…",
  "format": { "width": 1080, "height": 1920, "fps": 60 },
  "music": { "bpm": 111, "offsetSec": 0, "phraseBars": 8, "gapBeats": 1.5, "file": null },
  "theme": { "ground": "#f7f4ee", "ground2": "#ffffff", "ink": "#14213d", "inkSoft": "#5b6475",
             "accent": "#d97a1e", "accent2": "#1f7a4d", "display": "noto-serif-display", "ui": "be-vietnam-pro",
             "decor": { "particles": false, "rays": false } },
  "scenes": [ { "id": "hook", "type": "TitleSlam", "bars": 2, "bg": "dark", "enter": "auto", "props": { … } } ],
  "cues": [ { "sfx": "select_001", "beat": 18, "volume": 0.25 } ]
}
```

Các trường:
- `bars`: độ dài cảnh, tính bằng ô nhịp (chế độ nhạc).
- `clock: "voice"` + `voice` + `say` thay cho `bars`, mốc `{ "say": "a2:từ khoá" }`: video có giọng đọc, xem `9-giong-doc.md`.
- **Mốc trong `props`:** tính bằng **phách kể từ đầu cảnh**.
- `cues.beat`: phách tuyệt đối tính từ đầu video.
- `bg`:
  - `"ground"`: mặc định;
  - `"ground2"`, `"accent"`, hoặc mã màu;
  - `"dark"`: đảo ink↔ground để chữ luôn đủ tương phản.
- `enter`:
  - `"auto"`: cảnh đầu cắt thẳng; đầu cụm nhạc thì nện (`zoom`); còn lại `whip`;
  - đặt tay: `cut` / `curve` (= `whip`) / `zoom` / `flood` / `iris`. Mặc định giữa các cảnh là **cut-the-curve sang trái**; đầu cụm là `zoom` (tiếp tục lao tới).
- **`props.cursor`** (mọi cảnh): `[{ beat, x, y, click }]` toạ độ tuyệt đối; điểm đầu và cuối nên nằm ngoài khung (y > H). **`props.notes`**: `[{ kind: "circle"|"underline", x, y, w, h, beat, color }]`. Toạ độ mục tiêu trong `DeviceDemo` dọc: màn hình bắt đầu ở (W−dw)/2+14, H·0,27+14 với dw = min(0,52W, 600), cao dw·16/9.
- **`props.hits`:** mảng phách trong cảnh để thêm cú nện (loé, sóng, rung, tách màu chữ). Ví dụ: số chuỗi đổi, nhận chức.
- **`theme.cutMark`** `{ text, color, ink }`: "mắt cắt" ở đầu mỗi cụm nhạc bằng dấu thương hiệu (vd. § son), phủ khung rồi mở ra cảnh mới. Đây là chuyển cảnh có chữ ký riêng, thay cho light leak/glow. Không đặt thì đầu cụm chỉ có nện.
- **Mốc âm:** `at` âm (vd. `-2.2`) làm chữ đã đáp xong trước khung 0. Dùng cho dòng hook, để ảnh bìa không bao giờ trống.
- **Font** (đều có bộ chữ tiếng Việt): `be-vietnam-pro`, `noto-serif-display`, `inter`, `montserrat`, `lexend`, `playfair-display`.

Ví dụ đầy đủ một storyboard thật (16:9, 7 cảnh): `examples/giai-thich-dat-coc-16x9/storyboard.json`.

## 11 cảnh mẫu — props chính

| Loại | Dùng cho | Props |
|---|---|---|
| `TitleSlam` | hook, chuyển chương | `lines[{text, at, size:"hero"\|"title", color, glitch}]`, `sub{text,at}`, `align` |
| `LogoReveal` | lộ diện tên | `mark{text\|image}`, `markColor`, `name`, `tagline`, `art` (Media: tranh/ảnh thật) |
| `StatCount` | con số thật đếm lên; **một số duy nhất** thì chữ số khổng lồ, căn giữa ("một con số đáp xuống") | `kicker`, `stats[{value,from,label,at}]`, `sub{text,at}`, `ring[Media ảnh]` (vòng 3D) |
| `KnowledgeCard` | một khái niệm/ví dụ cụ thể | `kicker`, `term`, `gist`, `branches[{label,icon,children,tone}]`, `hook`, `qa{q,a}`, `cite`, `at{gist,branches,hook,qa,answer}` |
| `FeatureSteps` | các bước/bậc | `kicker`, `title`, `accentWords`, `steps[{label,sub,icon}]`, `start`, `every`, `note{text,at}` |
| `CardMontage` | nhiều thẻ/màn thật của sản phẩm lướt theo phách | `kicker`, `title`, `accentWords`, `cards[{image,label}]`, `start`, `every` |
| `DeviceDemo` | UI thật trong máy | `device`, `media`, `poster`, `syncSec`, `syncBeat`, `chips[{text,at,x,y,tone}]`, `title`, `kicker`, `zoomAt`/`zoom`/`zoomFocus` (phóng máy; kiểm không che tiêu đề), `freeze{after,frames}` (impact freeze sau cú bấm), `exitPush` (máy lao tới lấp khung; cảnh sau đặt `enter: "zoom"`) |
| `MediaHero` | cú chốt toàn khung (animation thật) | `media`, `poster`, `syncSec`, `hitBeat`, `focus{x,y}`, `pushIn` (đẩy máy vào tiêu điểm 2 phách trước cú nện rồi lùi ra, vd. 2,3), `cutBottom` (px cắt đáy, vd. nút của app ngoài vùng an toàn), `lines[{text,at,color}]`, `linesOut`, `darkIntroSec`, `freezeFrames` (đứng hình đúng lúc sự kiện), `baseScale` (phủ kín khung), `skipFrames` (giữ khung N cho tới khi thời gian đuổi kịp — bỏ đoạn đầu bản quay), `cutBottom` giờ là mặt nạ mờ đáy |
| `CardCycle` | vài trạng thái/biến thể lật theo phách | `kicker`, `items[{image,label,color}]`, `every` |
| `Ladder` | thăng tiến → toả nhánh → chốt | `titles{climb,fan,finale}`, `climb[{image,label}]`, `fan[{image,label,sub}]`, `fanAt`, `finale{media,at}`, `finaleLabel` (nện dưới vật chốt), `aspect` (cao/rộng ảnh), `note` |
| `LineReveal` | đường số liệu vẽ dần (`rider`: nhãn ví dụ chạy theo nét) | `title`, `points[[x,y]]`, `marks[{x,label}]`, `captions[]`, `drawBeats`, `axisX`/`axisY` (nhãn trục: người lạ cần biết đang xem gì) |
| `EndCard` | dấu thương hiệu + kêu gọi | `mark`, `name`, `tags[]`, `cta`, `url`, `disclaimer` |

`Media` = `{ "kind": "image"|"video", "src": "cap/x.mp4", "alpha": false }`. `src` tính từ `public/`.

## Bộ cảnh áp phích — 8 cảnh `Poster*`

Dùng khi video **chủ yếu là chữ và số** (giải thích luật, khái niệm, số liệu, clip mạng xã hội) — không có giao diện thật để quay. Một ngôn ngữ thị giác thống nhất: chữ Anton in hoa **tự co cỡ cho vừa khít bề ngang** (bề ngang từng ký tự đo từ file font), ba nền luân phiên `dark` → giấy → màu nhấn, vào cảnh bằng **mặt nạ trồi lên / mảng màu quét** thay cho trượt-lên-mờ-dần, cú chốt là **con dấu đóng xuống** hoặc **màu tràn từ tâm**.

Theme: `"display": "anton"`, thêm `"pop"` (màu bật thứ ba, vd. vàng nghệ `#f6b93b`) — xem mẫu ở `references/3-phong-cach.md`. Mẫu chạy đủ: `examples/nghi-viec-bao-truoc-9x16/`.

| Loại | Dùng cho | Props |
|---|---|---|
| `PosterHook` | câu hỏi mở đầu lấp khung | `kicker`, `lines[{text, at, tone:"ink"\|"accent"\|"pop"\|"box"}]` (`box` = dòng nằm trên mảng màu nhấn, hơi nghiêng), `sub{text,at}`, `glyph` (ký tự viền rỗng khổ lớn làm nền: `?`, `§`, `%`) |
| `PosterLaw` | **nguyên văn điều luật** trên tờ giấy nghiêng | `cite` ("Điều 35"), `source` (tên văn bản, khoản — bắt buộc), `quote` (cụm cần tô đặt trong `[ngoặc vuông]`), `at`, `quoteAt`, `markAt` (bút dạ quét), `stamp{text, at, tone:"bad"\|"good"}` |
| `PosterSteps` | 2–4 mức / bước, mỗi dải một con số lớn | `kicker`, `title`, `steps[{label, sub, big}]` (`big` = chữ đầu dải: "45", "30"; bỏ trống = số thứ tự), `start`, `every` |
| `PosterNumber` | một con số đếm lên lấp bề ngang | `kicker`, `value`, `from`, `decimals`, `prefix`, `suffix`, `unit`, `label`, `at`, `dur`, `cells` (lưới ô đếm theo: 45 ô = 45 ngày, ≤ 120), `note{text,at}` |
| `PosterVersus` | hai phía đối nhau (phải / không phải, cũ / mới) | `left{label, sub, items[]}`, `right{…}`, `vs` ("VS", "HAY", "≠"), `at`, `atRight`, `atVs`, `itemsAt`, `itemEvery` |
| `PosterTimeline` | 2–5 mốc trên một đường chạy dọc | `kicker`, `title`, `events[{when, text}]`, `start`, `every`, `focus` |
| `PosterVerdict` | câu trả lời: một từ nện xuống + lý do | `question`, `word` ("Trái luật", "Được"), `tone:"bad"\|"good"`, `at`, `reasons[{text,at}]`, `cite`, `citeAt` |
| `PosterEnd` | thẻ kết: câu nhớ + kêu gọi + **căn cứ** | `lines[]` (dòng trong `[ngoặc vuông]` = màu bật), `at`, `every`, `cta`, `ctaAt`, `sources[]` (số hiệu văn bản, điều khoản, hiệu lực), `sourcesLabel`, `sourcesAt`, `glyph` |

Luật viết cho bộ này (máy kiểm bắt được phần lớn):
- **Một dòng áp phích ≤ 18 ký tự.** Dài hơn thì chữ tự co nhỏ và mất lực → tách thành hai dòng (`kiem_tra_storyboard.py` cảnh báo).
- **Cú nện phải ghi vào `props.hits`** (phách trong cảnh): lúc dòng `box` quét, lúc con dấu đóng, lúc `PosterVerdict.at`, lúc số đáp (`at + dur`). Không ghi thì khung không rung, không chớp, tiếng động lệch hình.
- **Thời gian đọc vẫn là luật:** 0,5 s + 0,3 s mỗi chữ. Kịch bản mẫu ban đầu dài 32 s bị cảnh báo 6/7 cảnh; rút chữ và giãn thành 48 s mới XANH. Khối `sources` không tính vào thời gian đọc.
- **Điều luật trích nguyên văn** (được lược bằng dấu `…`), không viết lại; ngoại lệ quan trọng của quy tắc phải có một cảnh riêng (mẫu: khoản 2 Điều 35 đứng cạnh khoản 1).
- Khổ dọc: mọi chữ nằm trong dải an toàn tới 1330 px; phần dưới để nền, mảng màu, ký tự viền — không đặt chữ cần đọc.
- Trộn với 11 cảnh gốc được (vd. `PosterHook` → `DeviceDemo` → `PosterEnd`), miễn cùng theme.

## Thêm loại cảnh mới

Viết component trong `src/scenes/` theo mẫu có sẵn (cảnh áp phích: thêm vào `poster.tsx` và `POSTER_VIEWS`), đăng ký vào `SCENE_VIEWS` và `SceneType` (`src/core/types.ts`), thêm tên vào `TYPES` của `kiem_tra_storyboard.py`. Quy ước bắt buộc:
- chữ trang trí nhân bản (bóng màu, lớp glitch) gắn `data-probe="skip"`, để `kiem_tra_bo_cuc.mjs` không coi là chữ đè chữ;
- chữ IN HOA có dấu chồng (Ố, Ễ, Ự…) xuống dòng thì `lineHeight ≥ 1,15` cho tiêu đề và `≥ 1,35` cho chữ thường, nếu không dấu dòng dưới chạm chân dòng trên;
- `const T = useT(); const col = useCol();` cho màu (đúng bảng của cảnh);
- `const bt = useBeats();` cho mọi mốc thời gian (khớp lưới tuyệt đối);
- `SAFE_PAD`/`SAFE` cho vùng an toàn; `SIZE` cho cỡ chữ;
- phần tử trượt vào từ ngoài khung: đặt `visibility: hidden` cho tới mốc vào, nếu không máy đo coi chữ đang chờ ngoài khung là TRÀN KHUNG;
- font một độ đậm (Anton): `fontWeight: 400`, đừng 800 — trình duyệt sẽ làm đậm giả, nét bệt;
- không thêm `filter` thường trực, không `box-shadow` lớn trên phần tử lặp (xem bảng hiệu năng trong `SKILL.md`).

## Soát trước khi render

**Máy kiểm trước, mắt soát sau:**

```bash
node <skill>/scripts/kiem_tra_bo_cuc.mjs .            # mỗi 0,25 s; ~1 phút cho 30 s video (CPU 4 nhân)
node <skill>/scripts/kiem_tra_bo_cuc.mjs . --from 20 --to 35   # chỉ đoạn vừa sửa
```

Sau khi máy XANH, dựng khung tĩnh để soát bằng mắt (đóng gói một lần, nhanh hơn nhiều so với gọi `remotion still` từng khung):

```bash
node <skill>/scripts/khung_tinh.mjs . --n 14                 # mỗi cảnh 2 khung: giữa cảnh và ngay trước điểm cắt
node <skill>/scripts/khung_tinh.mjs . --frames 225,470,930   # đúng những khung cần xem lại
```

Script đo **hộp chữ/ảnh thật trong trình duyệt** ở từng khung lấy mẫu, nên bắt được lỗi mà tờ xem nhanh bỏ sót.
- **LỖI** (phải về XANH):
  - chữ đè chữ > 15 % (tính theo hộp dòng);
  - chữ tràn khỏi khung;
  - khung TRỐNG (không chữ, không ảnh) quá 0,8 s.
- **CẢNH BÁO**:
  - chữ ngoài vùng an toàn của nền tảng (dọc: trên 168 px, dưới 1330 px, cột nút phải 120 px);
  - chữ nhỏ hơn 2,4 % cạnh ngắn (thu về điện thoại không đọc được);
  - khung THƯA (phủ < 4 %) quá 2 s.

Một lỗi chỉ được tính khi **có ở 2 mẫu liên tiếp**: khung đang nện chữ (scale 2→1) hay đang whip chồng nhau vài khung là bình thường. Số đo từng khung ghi ở `out/review/bo_cuc.json`. Cảnh báo giữ lại có chủ đích thì ghi lý do vào `REVIEW.md`.

Sau đó render khung tĩnh ở: giữa mỗi cảnh, 2 khung sau mỗi cú nện, giữa mỗi khoảng bass tắt, khung 0. Mỗi khung khoảng 10 giây.

```bash
for f in 0 120 520 1030 1045 …; do npx remotion still Main out/f$f.png --frame=$f --scale=0.35; done
ffmpeg $(for f in …; do echo -i out/f$f.png; done) -filter_complex hstack=N out/sheet.png
```

Đo tốc độ: `npx remotion render Main out/t.mp4 --frames=1000-1119`. Nếu quá 1 s/khung, tìm `filter`/SVG filter/box-shadow theo bảng hiệu năng trước khi render cả video.
