#!/usr/bin/env python3
"""Đóng gói skill slide-chuan thành một file zip tải lên claude.ai được.

  python3 scripts/dong_goi.py [đường dẫn zip]        (mặc định: slide-chuan.zip cạnh thư mục skill)

claude.ai từ chối zip skill có hơn 200 file ("Zip contains too many files (maximum 200)"). Vì vậy:
- chỉ lấy file đã commit (git ls-files) — không lẫn ảnh "chỉ chiếu trên lớp", file .pptx, thư mục *_lop/ sinh ra khi dựng;
- icon lẻ hinh/icons/*.svg gộp thành hinh/icons.json (tên → SVG), vật 3D hinh/f3d/*.png gộp thành hinh/f3d.json
  (tên → PNG base64); hinh/icon.js, hinh/f3d.js đọc kho gộp khi không có file lẻ. File lẻ ở lại repo làm nguồn;
- không đóng gói tests/ (chỉ dùng khi sửa skill), node_modules, __pycache__.
Script dừng với mã lỗi 1 nếu zip vượt 200 file — đừng gửi zip đóng tay (git archive, zip -r).
"""
import base64
import json
import os
import subprocess
import sys
import zipfile

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEN = os.path.basename(GOC)
GIOI_HAN = 200
BO_DAU = ("tests/", "node_modules/")


def ds_tep():
    """File đã commit trong thư mục skill; ngoài git thì đi cây thư mục."""
    try:
        r = subprocess.run(["git", "-C", GOC, "ls-files", "-z", "."], capture_output=True, check=True)
        tep = [x.decode("utf-8") for x in r.stdout.split(b"\0") if x]
        tep = [x for x in tep if os.path.exists(os.path.join(GOC, x))]   # bỏ file đã xoá mà chưa commit
        if tep:
            return sorted(tep)
    except (OSError, subprocess.CalledProcessError):
        pass
    tep = []
    for d, ds, fs in os.walk(GOC):
        ds[:] = sorted(x for x in ds if x not in ("node_modules", "__pycache__", ".git"))
        tep += [os.path.relpath(os.path.join(d, f), GOC).replace(os.sep, "/") for f in sorted(fs)]
    return tep


def dong_goi(ra):
    tep, icons, f3d = [], {}, {}
    for rel in ds_tep():
        if rel.startswith(BO_DAU) or "/__pycache__/" in rel or rel.endswith((".pyc", ".DS_Store")):
            continue
        if rel.startswith("hinh/icons/") and rel.endswith(".svg"):
            icons[rel[len("hinh/icons/"):-4]] = open(os.path.join(GOC, rel), encoding="utf-8").read()
            continue
        if rel.startswith("hinh/f3d/") and rel.endswith(".png"):
            f3d[rel[len("hinh/f3d/"):-4]] = base64.b64encode(open(os.path.join(GOC, rel), "rb").read()).decode("ascii")
            continue
        tep.append(rel)
    kho = {"hinh/icons.json": icons, "hinh/f3d.json": f3d}
    tong = len(tep) + len(kho)
    if tong > GIOI_HAN:
        print(f"ĐỎ: {tong} file > {GIOI_HAN} — claude.ai sẽ từ chối. Gộp thêm tài nguyên vào kho JSON hoặc bỏ file chỉ dùng khi phát triển.",
              file=sys.stderr)
        return 1
    tam = ra + ".moi"
    with zipfile.ZipFile(tam, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for rel in tep:
            z.write(os.path.join(GOC, rel), TEN + "/" + rel)
        for rel, du_lieu in kho.items():
            z.writestr(TEN + "/" + rel, json.dumps(dict(sorted(du_lieu.items())), ensure_ascii=False, separators=(",", ":")))
    os.replace(tam, ra)
    print(f"XANH: {tong} / {GIOI_HAN} file · {os.path.getsize(ra) / 1e6:.1f} MB · kho gộp: {len(icons)} icon, {len(f3d)} vật 3D → {ra}")
    return 0


if __name__ == "__main__":
    sys.exit(dong_goi(os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(os.path.dirname(GOC), TEN + ".zip")))
