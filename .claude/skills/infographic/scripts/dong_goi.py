#!/usr/bin/env python3
"""Đóng gói skill infographic thành một file zip tải lên claude.ai được.

  python3 scripts/dong_goi.py [đường dẫn zip]        (mặc định: infographic.zip cạnh thư mục skill)

claude.ai từ chối zip skill có hơn 200 file ("Zip contains too many files (maximum 200)"). Vì vậy:
- icon và hình dán lẻ trong assets/icons/, assets/emoji/ được GỘP vào assets/icons.json, assets/emoji.json (tên → SVG);
  file lẻ ở lại máy làm nguồn, không vào zip. icons.mjs đọc kho gộp.
- không đóng gói: node_modules, PDF sinh ra khi xuất (sinh lại bằng render.mjs), __pycache__, package-lock.json,
  bản chép hình dán trong examples/*/assets/emoji/ (chạy icons.mjs trên bài mẫu để bung lại từ kho gộp).
- ảnh infographic.png của bài mẫu được thu về rộng 1080 px trong zip (cần gói Pillow; không có thì giữ nguyên).
Script dừng với mã lỗi nếu zip vượt 200 file.
"""
import json
import os
import sys
import zipfile

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEN = os.path.basename(GOC)
RA = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(os.path.dirname(GOC), TEN + ".zip")
GIOI_HAN = 200


def gop(loai):
    """Gộp assets/<loai>/*.svg vào assets/<loai>.json (giữ mục đã có trong kho, file lẻ ghi đè)."""
    thu_muc, kho_tep = os.path.join(GOC, "assets", loai), os.path.join(GOC, "assets", loai + ".json")
    kho = json.load(open(kho_tep, encoding="utf-8")) if os.path.exists(kho_tep) else {}
    if os.path.isdir(thu_muc):
        for f in sorted(os.listdir(thu_muc)):
            if f.endswith(".svg"):
                kho[f[:-4]] = open(os.path.join(thu_muc, f), encoding="utf-8").read()
    json.dump(dict(sorted(kho.items())), open(kho_tep, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    return len(kho)


so = {loai: gop(loai) for loai in ("icons", "emoji")}
bo_thu_muc = {"node_modules", "__pycache__"}
tep = []
for d, ds, fs in os.walk(GOC):
    ds[:] = sorted(x for x in ds if x not in bo_thu_muc)
    for f in sorted(fs):
        rel = os.path.relpath(os.path.join(d, f), GOC).replace(os.sep, "/")
        if f in ("infographic.pdf", "package-lock.json", ".DS_Store") or f.endswith(".pyc"):
            continue
        if f.endswith(".svg") and (rel.startswith("assets/icons/") or rel.startswith("assets/emoji/")):
            continue  # đã nằm trong kho gộp
        if f.endswith(".svg") and rel.startswith("examples/") and "/assets/emoji/" in rel:
            continue  # bản chép hình dán của bài mẫu: icons.mjs bung lại từ kho gộp khi cần
        tep.append(rel)
if len(tep) > GIOI_HAN:
    sys.exit(f"ĐỎ: {len(tep)} file > {GIOI_HAN} — claude.ai sẽ từ chối. Gộp hoặc bỏ bớt file rồi chạy lại.")
# ảnh xem trước của bài mẫu: trong zip chỉ cần bản rộng 1080 px (bản 2160 px sinh lại bằng render.mjs) — gói nhẹ đi khoảng ba lần
try:
    from PIL import Image
except ImportError:
    Image = None


def anh_nho(duong):
    import io
    with Image.open(duong) as im:
        if im.width <= 1080:
            return None
        nho = im.convert("RGB").resize((1080, round(im.height * 1080 / im.width)), Image.LANCZOS)
        bo = io.BytesIO()
        nho.save(bo, "PNG", optimize=True)
        return bo.getvalue()


tam = RA + ".moi"
with zipfile.ZipFile(tam, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for rel in tep:
        duong = os.path.join(GOC, rel)
        du_lieu = anh_nho(duong) if Image and rel.startswith("examples/") and rel.endswith("/infographic.png") else None
        if du_lieu:
            z.writestr(TEN + "/" + rel, du_lieu)
        else:
            z.write(duong, TEN + "/" + rel)
os.replace(tam, RA)
print(f"XANH: {len(tep)} / {GIOI_HAN} file · {os.path.getsize(RA) / 1e6:.1f} MB · kho gộp: {so['icons']} icon, {so['emoji']} hình dán → {RA}")
