#!/usr/bin/env python3
"""BẢNG THAM CHIẾU — người dùng chọn phong cách bằng mắt (bo-cuc.md mục 7, 18/11/2026).
  python3 scripts/tham_chieu.py bang <thư_mục_ra> <từ khoá> [<từ khoá>…]   → <ra>/bang.jpg: bìa mẫu Slidesgo đánh số + <ra>/mau.json (số → slug)
  python3 scripts/tham_chieu.py trong <thư_mục_ra> <slug> [<slug>…]        → <ra>/<slug>.jpg: tờ ghép slide bên trong của mẫu
Ảnh mẫu chỉ để học quy tắc — để trong thư mục tạm / scratchpad, không commit, không chép hình hay bố cục."""
import json, os, re, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
UA = ["-A", "Mozilla/5.0"]
def tai(url, ra): return subprocess.run(["curl", "-sfL", *UA, "-o", ra, url]).returncode == 0
def trang(url):
    r = subprocess.run(["curl", "-sfL", *UA, url], capture_output=True); return r.stdout.decode("utf8", "ignore")
def phong(): 
    for f in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]:
        if os.path.exists(f): return ImageFont.truetype(f, 40)
    return None
def bang(ra, tus, toi_da=20):
    os.makedirs(ra, exist_ok=True); ds = []
    for tu in tus:
        h = trang("https://slidesgo.com/search?q=" + tu.replace(" ", "+"))
        for m in re.finditer(r'https://media\.slidesgo\.com/storage/\d+/([a-z0-9-]+?)\d{10}\.jpg', h):
            if m.group(1) not in [d[0] for d in ds]: ds.append((m.group(1), m.group(0)))
    ds = ds[:toi_da]; ims = []
    for k, (slug, u) in enumerate(ds):
        f = os.path.join(ra, f"{k+1:02d}.jpg")
        if tai(u, f): ims.append((k + 1, Image.open(f).convert("RGB").resize((640, 360))))
    cols = 4; c = Image.new("RGB", (cols * 652 + 12, ((len(ims) + cols - 1) // cols) * 372 + 12), "#222"); d = ImageDraw.Draw(c); fo = phong()
    for i, (n, im) in enumerate(ims):
        x, y = 12 + (i % cols) * 652, 12 + (i // cols) * 372; c.paste(im, (x, y)); d.rectangle([x, y, x + 70, y + 56], fill="#B13A2E"); d.text((x + 10, y + 4), str(n), fill="white", font=fo)
    c.save(os.path.join(ra, "bang.jpg"), quality=85)
    json.dump({n: ds[n - 1][0] for n, _ in ims}, open(os.path.join(ra, "mau.json"), "w"), ensure_ascii=False, indent=1)
    print(os.path.join(ra, "bang.jpg"))
def trong(ra, slugs):
    os.makedirs(ra, exist_ok=True)
    for slug in slugs:
        h = trang(f"https://slidesgo.com/theme/{slug}"); tot = {}
        for m in re.finditer(r'https://media\.slidesgo\.com/storage/\d+/responsive-images/(\d+)-' + re.escape(slug) + r'___media_library_original_(\d+)_\d+\.jpg', h):
            n, w = int(m.group(1)), int(m.group(2))
            if n not in tot or w > tot[n][1]: tot[n] = (m.group(0), w)
        ims = []
        for n, (u, _) in sorted(tot.items())[:36]:   # bỏ phần tài nguyên Slidesgo ở cuối
            f = os.path.join(ra, f"{slug}-{n:02d}.jpg")
            if tai(u, f): ims.append(Image.open(f).convert("RGB").resize((480, 270)))
        cols = 6; c = Image.new("RGB", (cols * 490 + 10, ((len(ims) + cols - 1) // cols) * 280 + 10), "#333")
        for k, im in enumerate(ims): c.paste(im, (10 + (k % cols) * 490, 10 + (k // cols) * 280))
        p = os.path.join(ra, f"{slug}.jpg"); c.save(p, quality=82); print(p)
if __name__ == "__main__":
    if len(sys.argv) < 4 or sys.argv[1] not in ("bang", "trong"): print(__doc__); sys.exit(2)
    (bang if sys.argv[1] == "bang" else trong)(sys.argv[2], sys.argv[3:])
