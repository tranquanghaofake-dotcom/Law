#!/usr/bin/env python3
"""Render PPTX -> PNG từng slide (150 dpi) + 1 ảnh tổng (contact sheet) để soát bằng mắt.
Sau khi render, chạy thêm scripts/check_overflow.py để kiểm tràn/đè tự động.
Dùng: python3 scripts/render.py deck.pptx [out_dir]   (cần LibreOffice + pdftoppm + Pillow)"""
import sys, os, re, subprocess, glob, shutil
from PIL import Image
if len(sys.argv) < 2: sys.exit("Dùng: python3 scripts/render.py deck.pptx [out_dir]")
src = os.path.abspath(sys.argv[1])
if not os.path.isfile(src): sys.exit(f"✗ Không có file {src} — build chưa tạo ra PPTX (xem lỗi của engine/build.js ở trên).")
out = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else os.path.splitext(src)[0] + "_render")
os.makedirs(out, exist_ok=True)
soffice = shutil.which("soffice") or shutil.which("libreoffice")
if not soffice: sys.exit("Thiếu LibreOffice (soffice). Mở file bằng PowerPoint để xem thay thế.")
subprocess.run([soffice, "--headless", "--convert-to", "pdf", "--outdir", out, src], check=True, stdout=subprocess.DEVNULL)
pdf = os.path.join(out, os.path.splitext(os.path.basename(src))[0] + ".pdf")
if not os.path.isfile(pdf): sys.exit(f"✗ LibreOffice không xuất được PDF từ {src} — mở thử file bằng PowerPoint/LibreOffice.")
for f in glob.glob(os.path.join(out, "s-*.png")): os.remove(f)
subprocess.run(["pdftoppm", "-png", "-r", "150", pdf, os.path.join(out, "s")], check=True)
ims = [Image.open(f) for f in sorted(glob.glob(os.path.join(out, "s-*.png")))]
TW = 800  # ảnh tổng: thu mỗi slide về rộng 800px (ảnh từng slide vẫn 150 dpi)
ims = [im.resize((TW, round(im.height * TW / im.width)), Image.LANCZOS) for im in ims]
w, h = ims[0].size; cols = 4; rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * w + (cols + 1) * 12, rows * h + (rows + 1) * 12), "white")
for i, im in enumerate(ims): sheet.paste(im, (12 + (i % cols) * (w + 12), 12 + (i // cols) * (h + 12)))
sheet.save(os.path.join(out, "sheet.jpg"), quality=88); print(os.path.join(out, "sheet.jpg"))
if shutil.which("pdffonts"):  # font dự phòng (DejaVu...) => chữ trong ảnh có thể sai dấu/độ rộng
    fonts = subprocess.run(["pdffonts", pdf], capture_output=True, text=True).stdout.splitlines()[2:]
    bad = sorted({l.split()[0] for l in fonts if l.strip() and not re.search(r"Carlito|Liberation|OpenSymbol", l.split()[0], re.I)})
    if bad: print("⚠ PDF dùng font dự phòng:", ", ".join(bad), "- ảnh soát có thể sai chữ Việt, không tin được.")
