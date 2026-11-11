#!/usr/bin/env python3
"""Xem trước 3 theme trên chính nội dung của bạn để chọn bằng mắt.
Dùng: python3 scripts/preview.py deck.json [out.jpg]
Lấy slide bìa + 2 slide tiêu biểu (ưu tiên flow/ledger/scene, rồi stats/compare/cards), dựng bằng teal/kem/son, ghép 1 ảnh."""
import sys, os, json, subprocess, tempfile, glob, shutil
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
POS = [a for a in sys.argv[1:] if not a.startswith("--")]
deck_path = os.path.abspath(POS[0]); out = os.path.abspath(POS[1] if len(POS) > 1 else os.path.splitext(deck_path)[0] + "_preview.jpg")
deck = json.load(open(deck_path, encoding="utf8")); sl = deck["slides"]
pick = [0] + [i for t in ("flow", "ledger", "scene", "stats", "compare", "cards", "duel", "evidence") for i, s in enumerate(sl) if s["type"] == t][:2]
pick = sorted(set(pick))[:3]
tmp = tempfile.mkdtemp(); mini = dict(deck, slides=[dict(sl[i], notes="") for i in pick])
mini["meta"] = dict(deck.get("meta", {})); mini["meta"].pop("notesFile", None)
if mini["meta"].get("logo") and not os.path.isabs(mini["meta"]["logo"]):
    mini["meta"]["logo"] = os.path.join(os.path.dirname(deck_path), mini["meta"]["logo"])
for sl in mini["slides"]:  # ảnh thật: đường dẫn tương đối tính từ thư mục deck gốc
    if sl.get("photo") and not os.path.isabs(sl["photo"]):
        sl["photo"] = os.path.join(os.path.dirname(deck_path), sl["photo"])
mj = os.path.join(tmp, "mini.json"); json.dump(mini, open(mj, "w", encoding="utf8"), ensure_ascii=False)
soffice = shutil.which("soffice") or shutil.which("libreoffice")
rows = []
THEMES = [a.split("=",1)[1] for a in sys.argv if a.startswith("--themes=")]
THEMES = THEMES[0].split(",") if THEMES else ["teal", "kem", "son"]  # --themes=teal,toa,xanh,muc… (mặc định 3 theme gốc)
for th in THEMES:
    pp = os.path.join(tmp, th + ".pptx")
    subprocess.run(["node", os.path.join(ROOT, "engine", "build.js"), mj, pp, "--theme", th], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    subprocess.run([soffice, "--headless", "--convert-to", "pdf", "--outdir", tmp, pp], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    subprocess.run(["pdftoppm", "-png", "-r", "50", os.path.join(tmp, th + ".pdf"), os.path.join(tmp, th)], check=True)
    rows.append((th, [Image.open(f) for f in sorted(glob.glob(os.path.join(tmp, th + "-*.png")))]))
w, h = rows[0][1][0].size; lab = 70; g = 14
sheet = Image.new("RGB", (lab + len(rows[0][1]) * (w + g) + g, len(rows) * (h + g) + g), "white"); d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype("DejaVuSans-Bold.ttf", 26)
except Exception: font = ImageFont.load_default()
for r, (th, ims) in enumerate(rows):
    y = g + r * (h + g); d.text((12, y + h // 2 - 14), th, fill="black", font=font)
    for c, im in enumerate(ims): sheet.paste(im, (lab + g + c * (w + g), y))
sheet.save(out, quality=88); print(out)
