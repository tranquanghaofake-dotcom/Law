#!/usr/bin/env python3
"""Liệt kê cặp Morph thật giữa các slide kề nhau của một PPTX tầng hình ảnh — kiểm Morph khi KHÔNG có PowerPoint.
PowerPoint chỉ ghép chắc chắn các hình có tên "!!tên" trùng ở hai slide liền nhau (bộ dựng đặt tên từ `data-m`).
Hình KHÔNG có tên "!!" mà trùng ảnh ở hai slide thì PowerPoint tự đoán ghép → hay bay vô nghĩa (lỗi "vân tay bay qua bay về").
Dùng:  python3 scripts/morph_cap.py <file.pptx>"""
import re, sys, zipfile
if len(sys.argv) != 2: sys.exit(__doc__)
z = zipfile.ZipFile(sys.argv[1])
slides = sorted((int(m.group(1)), n) for n in z.namelist() if (m := re.match(r"ppt/slides/slide(\d+)\.xml$", n)))
chrome = {"so-trang", "td", "ten-bai"}   # thanh đầu slide, bộ dựng tự ghép
names = []
for _, n in slides:
    x = z.read(n).decode("utf8")
    names.append({m for m in re.findall(r'name="!!([^"]+)"', x)})
print(f"{len(slides)} slide — cặp Morph có chủ ý giữa hai slide kề nhau (bỏ thanh đầu):")
for i in range(1, len(slides)):
    c = sorted(k for k in names[i] & names[i - 1] if k not in chrome and not re.search(r"-chu\d+$", k))
    print(f"  {i:2d} → {i + 1:2d}: {', '.join(c) if c else '— (chỉ mờ dần / Morph tự đoán)'}")
