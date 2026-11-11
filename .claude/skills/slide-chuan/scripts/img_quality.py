#!/usr/bin/env python3
"""Chấm CHẤT LƯỢNG KỸ THUẬT của ảnh (không chấm "đúng chủ đề" — việc đó vẫn phải xem bằng mắt theo brief).
Đo ở cỡ chiếu thật (cạnh dài 1600px):
  nét      — lọc Laplace theo 64 ô, lấy ô nét nhất (phân vị 90) — ảnh mờ, nhoè, phóng to từ ảnh nhỏ → thấp
  sáng     — độ sáng trung bình 0–1 (quá tối < 0.18, quá sáng > 0.85)
  cháy     — tỉ lệ điểm ảnh cháy trắng / bệt đen (> 6% là xấu)
  tương phản — độ lệch chuẩn độ sáng (ảnh "bẹt", mù sương → thấp)
  cỡ       — cạnh ngang thật (ảnh < 1600px sẽ vỡ khi chiếu toàn màn hình)
Ngưỡng hiệu chỉnh trên ảnh thật: ảnh tốt 0.10–0.20; phóng to ×2 ≈ 0.05–0.10; ×4 ≈ 0.03.
Điểm 0–3: 3 = dùng được cho bìa / ảnh tràn viền; 2 = dùng được trong khung (split, cards, frame); < 2 = không dùng.
Dùng: python3 scripts/img_quality.py <ảnh.jpg> [ảnh khác …]"""
import sys

def assess(im, width=None, thumb=False):
    """thumb=True: ảnh nhỏ xem trước (≈500px) — KHÔNG kết luận độ nét (ảnh nhỏ luôn trông nét), chỉ chấm sáng / cháy / tương phản / cỡ."""
    from PIL import Image, ImageFilter
    import numpy as np
    W0 = width or im.width
    g = im.convert("L"); g.thumbnail((1600, 1600))  # đo ở cỡ chiếu thật: ảnh phóng to từ ảnh nhỏ lộ ra ở đây, không lộ ở 800px
    a = np.asarray(g, dtype=np.float32) / 255.0
    lap = np.asarray(g.filter(ImageFilter.Kernel((3, 3), [0, 1, 0, 1, -4, 1, 0, 1, 0], scale=1, offset=128)), dtype=np.float32) / 255.0 - 0.502
    h, w = lap.shape
    tiles = [lap[i * h // 8:(i + 1) * h // 8, j * w // 8:(j + 1) * w // 8].std() for i in range(8) for j in range(8)]
    sharp = float(np.percentile(tiles, 90))  # vùng NÉT NHẤT (chủ thể) — ảnh xoá phông vẫn được tính là nét
    bright = float(a.mean()); contrast = float(a.std())
    clip = float(((a > 0.985) | (a < 0.015)).mean())
    notes, sc = [], 3.0
    if not thumb:
        if sharp < 0.05: sc -= 1.5; notes.append("mờ / phóng to từ ảnh nhỏ")
        elif sharp < 0.075: sc -= 0.75; notes.append("hơi mờ")
    if bright < 0.18: sc -= 1; notes.append("quá tối")
    elif bright > 0.85: sc -= 1; notes.append("quá sáng")
    if clip > 0.06: sc -= 0.75; notes.append("cháy sáng/bệt đen")
    if contrast < 0.12: sc -= 0.75; notes.append("bẹt, thiếu tương phản")
    if W0 and W0 < 1600: sc -= 1.5; notes.append(f"nhỏ ({W0}px)")
    elif W0 and W0 < 2000: sc -= 0.25
    sc = max(0.0, round(sc * 4) / 4)
    return {"diem": sc, "net": None if thumb else round(sharp, 3), "sang": round(bright, 2), "chay": round(clip, 3), "tuong_phan": round(contrast, 3), "ghi_chu": notes}

def label(q):
    return f"KT {q['diem']:.1f}/3" + (" · " + ", ".join(q["ghi_chu"]) if q["ghi_chu"] else "")

if __name__ == "__main__":
    from PIL import Image
    if len(sys.argv) < 2: sys.exit(__doc__)
    bad = 0
    for p in sys.argv[1:]:
        im = Image.open(p).convert("RGB"); q = assess(im)
        bad += q["diem"] < 2
        print(f"{'✓' if q['diem'] >= 2 else '✗'} {p}: {label(q)}  (nét {q['net']}, sáng {q['sang']}, tương phản {q['tuong_phan']})")
    sys.exit(1 if bad else 0)
