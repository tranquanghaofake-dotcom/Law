# Pha 6 · Dựng bằng template Remotion

## Tạo dự án

```bash
bash <skill>/scripts/tao_du_an.sh ~/video-ten   # chép template/, npm install
cd ~/video-ten
# asset → public/cap/, nhạc có quyền → public/music/, sửa src/storyboard.json
python3 <skill>/scripts/kiem_tra_storyboard.py src/storyboard.json
npx remotion still Main out/thu.png --frame=120 --scale=0.4   # soát từng khung
npx remotion render Main out/video.mp4 --codec=h264 --crf=16  # khi đã duyệt
```

Remotion miễn phí cho cá nhân và nhóm ≤ 3 người, công ty lớn hơn cần license (remotion.pro/license). Nói điều này khi người dùng là doanh nghiệp. Chromium: dùng `PW_CHROMIUM` hoặc `/opt/pw-browsers/chromium` nếu có, không thì Remotion tự tải.

## Cấu trúc

```text
src/storyboard.json   ← chỉ sửa file này cho phần lớn video
src/core/timeline.ts  lưới nhịp b(n), vị trí cảnh, cụm, khoảng bass tắt, beatPulse
src/core/look.tsx     theme → font Google có tiếng Việt, cỡ chữ theo khung, vùng an toàn, easing, useBeats/useT/useCol
src/core/fx.tsx       SceneShell (vào/ra), Words, Glitch, Shockwave, LightLeak, Device, MediaView, Icon, decor (tắt mặc định)
src/scenes/index.tsx  11 cảnh mẫu
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
- `bars`: độ dài cảnh, tính bằng ô nhịp.
- **Mốc trong `props`:** tính bằng **phách kể từ đầu cảnh**.
- `cues.beat`: phách tuyệt đối tính từ đầu video.
- `bg`:
  - `"ground"`: mặc định;
  - `"ground2"`, `"accent"`, hoặc mã màu;
  - `"dark"`: đảo ink↔ground để chữ luôn đủ tương phản.
- `enter`:
  - `"auto"`: cảnh đầu cắt thẳng; đầu cụm nhạc thì nện (`zoom`); còn lại `whip`;
  - đặt tay: `cut` / `curve` (= `whip`) / `zoom` / `flood` / `iris`. Mặc định giữa các cảnh là **cut-the-curve sang trái**; đầu cụm là `zoom` (tiếp tục lao tới).
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
| `LineReveal` | đường số liệu vẽ dần | `title`, `points[[x,y]]`, `marks[{x,label}]`, `captions[]`, `drawBeats`, `axisX`/`axisY` (nhãn trục: người lạ cần biết đang xem gì) |
| `EndCard` | dấu thương hiệu + kêu gọi | `mark`, `name`, `tags[]`, `cta`, `url`, `disclaimer` |

`Media` = `{ "kind": "image"|"video", "src": "cap/x.mp4", "alpha": false }`. `src` tính từ `public/`.

## Thêm loại cảnh mới

Viết component trong `src/scenes/` theo mẫu có sẵn, đăng ký vào `SCENE_VIEWS` và `SceneType` (`core/types.ts`), thêm tên vào `TYPES` của `kiem_tra_storyboard.py`. Quy ước bắt buộc:
- `const T = useT(); const col = useCol();` cho màu (đúng bảng của cảnh);
- `const bt = useBeats();` cho mọi mốc thời gian (khớp lưới tuyệt đối);
- `SAFE_PAD`/`SAFE` cho vùng an toàn; `SIZE` cho cỡ chữ;
- không thêm `filter` thường trực, không `box-shadow` lớn trên phần tử lặp (xem bảng hiệu năng trong `SKILL.md`).

## Soát trước khi render

Render khung tĩnh ở: giữa mỗi cảnh, 2 khung sau mỗi cú nện, giữa mỗi khoảng bass tắt, khung 0. Mỗi khung khoảng 10 giây.

```bash
for f in 0 120 520 1030 1045 …; do npx remotion still Main out/f$f.png --frame=$f --scale=0.35; done
ffmpeg $(for f in …; do echo -i out/f$f.png; done) -filter_complex hstack=N out/sheet.png
```

Đo tốc độ: `npx remotion render Main out/t.mp4 --frames=1000-1119`. Nếu quá 1 s/khung, tìm `filter`/SVG filter/box-shadow theo bảng hiệu năng trước khi render cả video.
