#!/usr/bin/env python3
"""Kiểm "NHÌN MỜ": xoá hết chữ, làm mờ ảnh slide — còn đoán được đề tài không? (tiêu chí world, 11/2026)

Dùng:
  python3 scripts/nhin_mo.py deck.pptx [out.jpg]
      → ảnh tổng các slide đã xoá chữ + làm mờ.
  python3 scripts/nhin_mo.py --worlds deck.json [out.jpg] [--slides 2,3,5] [--kits so-bhxh,hoa-don,...]
      → dựng CÙNG deck ở mọi world (meta.kit thay lần lượt), mỗi world một hàng, rồi in độ khác nhau
        giữa các world (0–100, trung bình chênh lệch điểm ảnh của ảnh mờ). Hai world < 6 điểm = khó phân biệt (điểm = khác màu + khác HÌNH sau khi bỏ nền phẳng).
Cần LibreOffice + pdftoppm + Pillow (như scripts/render.py)."""
import sys, os, re, json, shutil, subprocess, tempfile, zipfile, glob
from PIL import Image, ImageFilter, ImageChops, ImageStat, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TW = 480  # bề ngang mỗi ô (nhìn từ xa ~ 3 m)

def blank_text(src, dst):
    """Bản sao PPTX với mọi đoạn chữ rỗng (giữ nguyên hình, ảnh, nền)."""
    with zipfile.ZipFile(src) as zi, zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED) as zo:
        for it in zi.infolist():
            b = zi.read(it.filename)
            if re.match(r"ppt/slides/slide\d+\.xml$", it.filename):
                b = re.sub(rb"<a:t>[^<]*</a:t>", b"<a:t></a:t>", b)
            zo.writestr(it.filename, b)

def render(pptx, work):
    soffice = shutil.which("soffice") or shutil.which("libreoffice")
    if not soffice: sys.exit("Thiếu LibreOffice (soffice).")
    subprocess.run([soffice, "--headless", "--convert-to", "pdf", "--outdir", work, pptx], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    pdf = os.path.join(work, os.path.splitext(os.path.basename(pptx))[0] + ".pdf")
    subprocess.run(["pdftoppm", "-png", "-r", "40", pdf, os.path.join(work, "m")], check=True)
    files = sorted(glob.glob(os.path.join(work, "m-*.png")), key=lambda f: int(re.search(r"-(\d+)\.png$", f).group(1)))
    return [Image.open(f).convert("RGB") for f in files]

def squint(pptx, work):
    blanked = os.path.join(work, "blank.pptx"); blank_text(pptx, blanked)
    return [im.resize((TW, round(im.height * TW / im.width)), Image.LANCZOS).filter(ImageFilter.GaussianBlur(3)) for im in render(blanked, work)]

def sheet(rows, labels, out):
    w, h = rows[0][0].size; lab = 150; cols = max(len(r) for r in rows)
    S = Image.new("RGB", (lab + cols * (w + 10) + 10, len(rows) * (h + 10) + 10), "white"); d = ImageDraw.Draw(S)
    for j, r in enumerate(rows):
        d.text((10, 10 + j * (h + 10) + h // 2 - 6), labels[j], fill="black")
        for i, im in enumerate(r): S.paste(im, (lab + 10 + i * (w + 10), 10 + j * (h + 10)))
    S.save(out, quality=86); return out

def struct(im):
    """Phần "hình" của ảnh mờ: bỏ mảng nền phẳng (ảnh trừ bản làm mờ mạnh) — nền cùng màu không còn kéo điểm xuống."""
    g = im.convert("L"); return ImageChops.difference(g, g.filter(ImageFilter.GaussianBlur(14)))
def diff(a, b):
    """0–100: chênh lệch MÀU (trung bình) + chênh lệch HÌNH (phần đã bỏ nền, nhân 4 vì biên độ nhỏ)."""
    col = sum(ImageStat.Stat(ImageChops.difference(a, b)).mean) / 3 / 2.55
    shp = ImageStat.Stat(ImageChops.difference(struct(a), struct(b))).mean[0] / 2.55 * 4
    return min(100, col + shp)

def main(argv):
    if not argv: sys.exit(__doc__)
    if argv[0] != "--worlds":
        src = os.path.abspath(argv[0]); out = argv[1] if len(argv) > 1 else os.path.splitext(src)[0] + "_nhinmo.jpg"
        with tempfile.TemporaryDirectory() as t: ims = squint(src, t)
        print(sheet([ims], [os.path.basename(src)[:20]], out)); return
    deck = json.load(open(argv[1], encoding="utf-8")); out = next((a for a in argv[2:] if a.endswith(".jpg")), os.path.splitext(argv[1])[0] + "_worlds.jpg")
    opt = dict(zip(argv[2::1], argv[3::1]))
    sys.path.insert(0, ROOT)
    kits = opt.get("--kits", "").split(",") if opt.get("--kits") else json.loads(subprocess.run(["node", "-e", "const K=require('./engine/kits');console.log(JSON.stringify(Object.keys(K.KITS).filter(k=>K.KITS[k].fits)))"], cwd=ROOT, capture_output=True, text=True).stdout)
    pick = [int(x) for x in opt["--slides"].split(",")] if opt.get("--slides") else None
    rows, labels = [], []
    deck_dir = os.path.dirname(os.path.abspath(argv[1]))
    for k in kits:
        d = json.loads(json.dumps(deck)); d.setdefault("meta", {})["kit"] = k
        with tempfile.TemporaryDirectory(dir=deck_dir) as t:
            dj = os.path.join(t, "deck.json"); json.dump(d, open(dj, "w", encoding="utf-8"), ensure_ascii=False)
            px = os.path.join(t, "out.pptx")
            r = subprocess.run(["node", os.path.join(ROOT, "engine", "build.js"), dj, px], capture_output=True, text=True, env=dict(os.environ, SLIDE_CHUAN_NO_PREP="1"))
            if not os.path.isfile(px): print(f"✗ {k}: không dựng được\n{r.stdout[-400:]}{r.stderr[-400:]}"); continue
            ims = squint(px, t)
        rows.append([ims[i - 1] for i in pick] if pick else ims); labels.append(k)
    print(sheet(rows, labels, out))
    print("Độ khác nhau giữa các world khi đã xoá chữ (màu + hình, trung bình theo slide, 0–100; < 6 = khó phân biệt):")
    worst = []
    for a in range(len(rows)):
        for b in range(a + 1, len(rows)):
            v = sum(diff(x, y) for x, y in zip(rows[a], rows[b])) / len(rows[a]); worst.append((v, labels[a], labels[b]))
    for v, a, b in sorted(worst)[:8]: print(f"  {a:>10} ↔ {b:<10} {v:5.1f}{'  ⚠ khó phân biệt' if v < 6 else ''}")

if __name__ == "__main__": main(sys.argv[1:])
