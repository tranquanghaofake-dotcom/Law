# Pha 3 · Phong cách: SPEC.md, chuyển động, danh sách CẤM

Phần "đổi tính từ thành số", "dấu hiệu video máy tạo" và "chuyển động" phỏng theo `spec.md` và `motion.md` của HeyGen HyperFrames (Apache-2.0). Phần còn lại rút từ lần dựng thực tế.

## SPEC.md — bản chỉ đạo, chỗ nào định viết tính từ thì viết số

```text
MỤC TIÊU:  người xem cảm/làm gì khi hết video — một câu
ĐẦU RA:    Remotion, 1080×1920 @ 60 fps, ~45 s
THỜI GIAN: 111 BPM → 32,43 khung/phách; 5 cụm × 8 ô; cú nện ở 0:17,3 · 0:34,6 · …
NHÌN:      nền (hex, chất liệu và độ đậm), mực, MỘT màu nhấn và nơi được dùng;
           font tiêu đề + độ đậm + cỡ px + giãn chữ; font thường; hạt phim %, viền tối %
VẬT:       những vật người xem phải nhận ra (điện thoại, thẻ, cuốn sách) với chi tiết khiến nó đọc ra mà không cần nhãn
CHUYỂN ĐỘNG: easing theo vai trò; lò xo theo damping; thời lượng và độ so le tính bằng khung
CẢNH:      mỗi cảnh một dòng: ô nhịp, một chuyển động chính, chữ người xem đọc, âm thanh, cách trao sang cảnh sau
CẤM:       danh sách dưới đây + điều video này không được thành
QA:        khung cần soát và mỗi khung phải cho thấy gì
```

## Lấy chất liệu từ chính sản phẩm

- **Màu và font:** lấy token có sẵn (CSS `:root`, tailwind, theme), không tự chế bảng màu. Ví dụ bảng "Văn Miếu": ink `#14213d`, giấy `#f7f4ee`, cam `#d97a1e`, son `#b3261e`.
- **Hình thật:** dùng tranh, icon, thẻ, huy hiệu, animation của chính sản phẩm (pha 5). Nét riêng của video đến từ đây, không đến từ hiệu ứng chung chung.
- **Một "chất liệu" giữ cả video:** giấy và mực, kính, kim loại, sơn mài… Mô tả nó bằng các phần và quy tắc riêng, ví dụ: giấy phẳng có sợi, mực A cho mọi chữ cần đọc, mực B chỉ cho một tiêu điểm mỗi khung.

## Đổi tính từ thành số

| Từ | Thành |
|---|---|
| sang | một chất liệu có số: giấy satin hạt 2 %, bóng tiếp xúc 0,55 |
| hiện đại | font tiêu đề cao 9 % khung, giãn chữ −2 %; một cú đẩy máy 30 khung trên một easing |
| sạch | lưới 12 cột, lề 96 px, màu nhấn cho một chữ mỗi cảnh |
| sôi động | cắt theo phách, đổi bố cục mỗi ô nhịp, một chuyển động chính mỗi cảnh |
| vui | lò xo damping 0,45–0,6 trên vị trí/cỡ (không trên độ mờ/màu) |
| điện ảnh | khuôn 35 mm, đèn chính trên-trái, viền tối 6 % |

## Bố cục bằng số

- Vật chính của một cảnh chiếm ≥ 40 % chiều cao hoặc chiều rộng khung. Không để vật nhỏ trôi giữa khung trống.
- Một chuyển động chính mỗi cảnh. Chuyển động phụ chỉ đi 50–70 % quãng, bắt đầu sau 100–200 ms; mọi thứ khác đứng yên.
- Có cái mới mỗi 2–4 s. Có nhạc thì đổi bố cục mỗi ô nhịp.
- Chữ cần đọc ≥ 2,6 % cạnh ngắn (28 px ở 1080). Nhiều chữ quá thì cắt chữ, không thu nhỏ.
- Tiêu đề cao 4–9 % chiều cao khung (dọc thì nhân 1,35).

## Ngôn ngữ áp phích (bộ cảnh `Poster*`)

Chọn khi video chủ yếu là chữ và số. Chất liệu là **tranh cổ động / áp phích in lưới**: giấy ngà, mực đêm, một màu son, một màu bật; chữ in hoa nén (Anton) cỡ lấp khung; hạt in; không gradient, không bo góc mềm, không đổ bóng mờ (bóng là một mảng mực lệch 2 %).

```json
"theme": { "ground": "#f4eddc", "ground2": "#fffaf0", "ink": "#0c1222", "inkSoft": "#5b5443",
           "accent": "#e2402a", "accent2": "#2c9566", "pop": "#f6b93b", "display": "anton", "ui": "be-vietnam-pro" }
```

Bằng số:
- chữ chính cao 12–30 % cạnh ngắn, một dòng ≤ 18 ký tự; chữ thường ≥ 2,6 % cạnh ngắn;
- nhịp nền: tối → giấy → giấy → **màu nhấn tràn khung đúng một lần** (cú trả lời) → tối; không hai cảnh màu nhấn liền nhau;
- màu bật (`pop`) chỉ cho: con số chính, cụm được tô trong điều luật, dấu ngăn; màu nhấn (`accent`) cho mảng và con dấu;
- chuyển động vào: mặt nạ trồi 15 khung, mảng quét 11–14 khung, dấu đóng 9 khung từ 3,2× về 1× (ghi `hits`), số đếm 2–3 phách rồi nảy 6 %;
- đổi bảng màu theo môn bằng cách đổi 4 mã `ink` / `accent` / `pop` / `ground` (vd. xanh rừng `#0e2a22` + cam đất `#d94f1f`; chàm `#121a4b` + vàng `#ffd23f`) — giữ nguyên cấu trúc.

## CẤM mặc định (dấu hiệu video do máy tạo)

Mỗi điều dưới đây bị cấm, **trừ khi chất liệu thật của thương hiệu có nó**, và khi đó chỉ dùng đúng như thương hiệu dùng. Template tắt sẵn (`theme.decor` = tắt).

- nền xanh đen/đen trống làm nền chính, vật nhỏ trôi giữa khung;
- glow, bloom, neon, lens flare, quả cầu/vòng phát sáng; hạt bay làm trang trí;
- gradient tím/xanh, gradient lưới, thẻ kính;
- nền giấy kem + tiêu đề serif + chữ nghiêng nhấn + nhãn "01 / 02" + nhãn mono in hoa nhỏ + chip bo tròn;
- mọi thứ căn giữa; mọi thứ hiện cùng lúc; mọi thứ mờ dần và trượt lên;
- chữ chuyển động trong lúc đang được đọc; tiêu đề cứ trôi sau khi đã đáp;
- nhãn ở góc, khung viền, góc ngoặc, chỉ số HUD làm trang trí;
- ba thẻ một hàng, lưới KPI, tiêu đề đè lên ảnh chụp màn hình bị làm tối;
- logo nằm ở góc.

Sau lần render đầu, gọi tên mọi mặc định đã dính (trong danh sách hay chưa), thêm vào dòng CẤM của `SPEC.md`, sửa trước mọi việc khác. Danh sách dài thêm sau mỗi video.

## Chuyển động

| Vai trò | Easing (template: `easeOut` / `easeInOut` / `easeIn`) | Thời lượng |
|---|---|---|
| Vào/đáp | đuôi dài (expo.out, bezier .16,1,.3,1) | 0,3–0,6 s; vào lâu hơn ra |
| Máy quay, tràn màu | vào–ra (bezier .65,0,.35,1) | 0,4–0,7 s |
| Rời, lao qua | tăng tốc (bezier .4,0,1,1) | ngắn hơn lúc vào 40–50 % |
| Lò xo | damping ~0,75 = cao cấp; 0,45–0,6 = vui; chỉ trên vị trí/cỡ | — |

- **So le:** chữ 1 khung, từ 60–120 ms, mục danh sách 40–80 ms. Phần tử sau bắt đầu khi phần tử trước xong 30–50 %.
- **Tiêu đề:** vào bằng nhoè → nét theo từng từ (template `Words`), hoặc nện (phóng to + nhoè) cho một chữ chốt. Không trượt lên. Đã đáp thì đứng yên.
- **Chuyển cảnh:** dùng 3–5 kiểu, mỗi kiểu có nguyên nhân:
  - whip: vệt nhoè ngang 0,13–0,3 s;
  - nện đầu cụm: phóng từ 1,25 về 1, có nhoè;
  - tràn màu: 0,4 s;
  - iris: mở từ điểm bấm;
  - hút vào: lúc bass tắt, phóng + nhoè + nhạt màu + tối viền.

  Tối đa một phần ba số điểm cắt là cắt cứng. Hai thế giới không hoà mờ vào nhau.
- **Theo nhạc:** đổi bố cục theo ô nhịp, cắt theo phách. Cú nện lớn nhất (loé, tách màu RGB trên chữ, sóng xung kích, rung) chỉ ở đầu cụm và ở cú chốt. Nện khắp nơi thì không còn gì là nện.
