#!/usr/bin/env python3
"""BẢNG THAM CHIẾU — người dùng chọn phong cách bằng mắt (bo-cuc.md mục 7, 18/11/2026).
  python3 scripts/tham_chieu.py bang <thư_mục_ra> <từ khoá> [<từ khoá>…]   → <ra>/bang.jpg: bìa mẫu Slidesgo đánh số + <ra>/mau.json (số → slug)
  python3 scripts/tham_chieu.py trong <thư_mục_ra> <slug> [<slug>…]        → <ra>/<slug>.jpg: tờ ghép slide bên trong của mẫu
  python3 scripts/tham_chieu.py capdoi <thư_mục_ra> [--sang|--toi] <từ khoá>…  → <ra>/capdoi.jpg: MỖI MẪU MỘT CẶP — bìa + một slide nội dung thật
     (không lấy mục lục, giới thiệu mẫu, tài nguyên), đánh số theo mẫu. Đây là bảng mặc định cho người dùng chọn (Hào 18/11/2026).
  python3 scripts/tham_chieu.py noidung <thư_mục_ra> [--sang|--toi] <từ khoá>… → <ra>/noidung.jpg: chỉ slide nội dung của nhiều mẫu
     Hào 18/11/2026: "một vài slide chỉ đẹp ở phần bìa, phần nội dung lại xấu" → luôn cho người dùng chọn bằng slide nội dung, không bằng bìa.
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
def noidung(ra, tus, sang=None, toi_da=24):
    os.makedirs(ra, exist_ok=True); slugs = []
    for tu in tus:
        h = trang("https://slidesgo.com/search?q=" + tu.replace(" ", "+"))
        for m in re.finditer(r'https://media\.slidesgo\.com/storage/\d+/([a-z0-9-]+?)\d{10}\.jpg', h):
            if m.group(1) not in slugs and not re.search(r'christmas|xmas|thanksgiving|halloween|easter|valentine|winter|snow|turkey|new-year|holiday|kids|baby', m.group(1)): slugs.append(m.group(1))   # bỏ mẫu theo mùa lễ / trẻ em
    chon, ban = [], {}
    for slug in slugs:
        if len(chon) >= toi_da: break
        h = trang(f"https://slidesgo.com/theme/{slug}"); tot = {}
        for m in re.finditer(r'https://media\.slidesgo\.com/storage/\d+/responsive-images/(\d+)-' + re.escape(slug) + r'___media_library_original_(\d+)_\d+\.jpg', h):
            n, w = int(m.group(1)), int(m.group(2))
            if n not in tot or w > tot[n][1]: tot[n] = (m.group(0), w)
        so = sorted(tot)
        if len(so) < 20: continue
        lay = 0
        for n in [so[len(so) // 4 + 3], so[len(so) // 3 + 2], so[len(so) // 2 - 4]]:   # vùng slide nội dung (bỏ bìa, mục lục, phần tài nguyên cuối)
            f = os.path.join(ra, f"{slug}-{n:02d}.jpg")
            if not tai(tot[n][0], f): continue
            im = Image.open(f).convert("L").resize((64, 36)); tb = sum(im.getdata()) / (64 * 36)
            if sang is True and tb < 170: continue
            if sang is False and tb > 110: continue
            chon.append((slug, n, f)); lay += 1
            if lay == 2 or len(chon) >= toi_da: break
    cols = 4; c = Image.new("RGB", (cols * 652 + 12, ((len(chon) + cols - 1) // cols) * 372 + 12), "#222"); d = ImageDraw.Draw(c); fo = phong()
    for i, (slug, n, f) in enumerate(chon):
        x, y = 12 + (i % cols) * 652, 12 + (i // cols) * 372; c.paste(Image.open(f).convert("RGB").resize((640, 360)), (x, y)); d.rectangle([x, y, x + 70, y + 56], fill="#B13A2E"); d.text((x + 10, y + 4), str(i + 1), fill="white", font=fo)
    c.save(os.path.join(ra, "noidung.jpg"), quality=85)
    json.dump({i + 1: [slug, n] for i, (slug, n, _) in enumerate(chon)}, open(os.path.join(ra, "noidung.json"), "w"), ensure_ascii=False, indent=1)
    print(os.path.join(ra, "noidung.jpg"), len(chon))

def capdoi(ra, tus, sang=None, toi_da=12):
    """Mỗi mẫu: slide 1 (bìa) + một slide nội dung ở khoảng 35–55 % deck (sau mục lục / mở phần, trước phần tài nguyên Slidesgo)."""
    os.makedirs(ra, exist_ok=True); slugs = []
    for tu in tus:
        h = trang("https://slidesgo.com/search?q=" + tu.replace(" ", "+"))
        for m in re.finditer(r'https://media\.slidesgo\.com/storage/\d+/([a-z0-9-]+?)\d{10}\.jpg', h):
            if m.group(1) not in slugs and not re.search(r'christmas|xmas|thanksgiving|halloween|easter|valentine|winter|snow|turkey|new-year|holiday|kids|baby|infographics|calendar|december|planner', m.group(1)): slugs.append(m.group(1))
    cap = []
    for slug in slugs:
        if len(cap) >= toi_da: break
        h = trang(f"https://slidesgo.com/theme/{slug}"); tot = {}
        for m in re.finditer(r'https://media\.slidesgo\.com/storage/\d+/responsive-images/(\d+)-' + re.escape(slug) + r'___media_library_original_(\d+)_\d+\.jpg', h):
            n, w = int(m.group(1)), int(m.group(2))
            if n not in tot or w > tot[n][1]: tot[n] = (m.group(0), w)
        so = sorted(tot)
        if len(so) < 25: continue
        nd = len([n for n in so if n < 60]) or len(so)   # số slide nội dung ≈ trước phần tài nguyên (thường ~ 2/3 deck)
        fb, fn = os.path.join(ra, f"{slug}-bia.jpg"), os.path.join(ra, f"{slug}-nd.jpg")
        if not tai(tot[so[0]][0], fb): continue
        # slide nội dung: trong 5 ứng viên ở khoảng 25–55 % phần nội dung, giữ slide NHIỀU CHI TIẾT nhất (bảng, biểu đồ, sơ đồ)
        # — slide "Awesome words", câu trích, mockup, ảnh to ít nét nên bị loại
        from PIL import ImageFilter
        tot_nd = so[:max(int(nd * 0.62), 6)]; ung = sorted({tot_nd[int(len(tot_nd) * t)] for t in (0.22, 0.28, 0.34, 0.4, 0.46, 0.52, 0.58)}); tot_diem = -1
        for n in ung:
            f = os.path.join(ra, f"{slug}-u{n:02d}.jpg")
            if not tai(tot[n][0], f): continue
            g = Image.open(f).convert("L").resize((320, 180)); px = list(g.getdata())
            mode = max(range(0, 256, 8), key=lambda b0: sum(1 for v in px if b0 <= v < b0 + 8)); phang = sum(1 for v in px if abs(v - mode - 4) <= 14) / len(px)
            diem = sum(1 for v in g.filter(ImageFilter.FIND_EDGES).getdata() if v > 40) if phang >= 0.5 else -1   # ảnh chụp tràn slide: nền không phẳng → loại
            if diem >= 0 and diem > tot_diem: tot_diem = diem; os.replace(f, fn)
            else: os.remove(f)
        if tot_diem < 0: continue
        tb = sum(Image.open(fb).convert("L").resize((64, 36)).getdata()) / 2304
        if sang is True and tb < 160: continue
        if sang is False and tb > 110: continue
        cap.append((slug, fb, fn))
    W, H = 560, 315; cols = 2; ow = 2 * W + 16
    c = Image.new("RGB", (cols * (ow + 28) + 12, ((len(cap) + cols - 1) // cols) * (H + 28) + 12), "#222"); d = ImageDraw.Draw(c); fo = phong()
    for i, (slug, fb, fn) in enumerate(cap):
        x, y = 12 + (i % cols) * (ow + 28), 12 + (i // cols) * (H + 28)
        c.paste(Image.open(fb).convert("RGB").resize((W, H)), (x, y)); c.paste(Image.open(fn).convert("RGB").resize((W, H)), (x + W + 16, y))
        d.rectangle([x, y, x + 70, y + 56], fill="#B13A2E"); d.text((x + 10, y + 4), str(i + 1), fill="white", font=fo)
    c.save(os.path.join(ra, "capdoi.jpg"), quality=85)
    json.dump({i + 1: slug for i, (slug, _, _) in enumerate(cap)}, open(os.path.join(ra, "capdoi.json"), "w"), ensure_ascii=False, indent=1)
    print(os.path.join(ra, "capdoi.jpg"), len(cap))

if __name__ == "__main__":
    if len(sys.argv) >= 4 and sys.argv[1] == "capdoi":
        a = sys.argv[3:]; sang = True if "--sang" in a else False if "--toi" in a else None
        capdoi(sys.argv[2], [x for x in a if not x.startswith("--")], sang); sys.exit(0)
    if len(sys.argv) >= 4 and sys.argv[1] == "noidung":
        a = sys.argv[3:]; sang = True if "--sang" in a else False if "--toi" in a else None
        noidung(sys.argv[2], [x for x in a if not x.startswith("--")], sang); sys.exit(0)
    if len(sys.argv) < 4 or sys.argv[1] not in ("bang", "trong", "noidung", "capdoi"): print(__doc__); sys.exit(2)
    (bang if sys.argv[1] == "bang" else trong)(sys.argv[2], sys.argv[3:])
