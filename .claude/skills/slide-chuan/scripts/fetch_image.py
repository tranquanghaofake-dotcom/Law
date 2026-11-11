#!/usr/bin/env python3
"""Lấy MỘT ảnh từ đường dẫn bất kỳ (Google Images, Pinterest, báo, trang cơ quan...) vào deck — kèm ghi nguồn.
Dùng: python3 scripts/fetch_image.py <thư_mục_deck> <url_ảnh> --source <url_trang_gốc> [--name ten-file] [--credit "Tác giả"] [--license "..."] [--min 1600]
  - Kiểm độ nét (mặc định rộng ≥ 1600px); ảnh nhỏ hơn vẫn lưu nhưng cảnh báo (chỉ hợp ảnh nhỏ trong khung / gallery).
  - Ghi images/images.json: nguồn, tác giả (nếu biết), giấy phép (mặc định "không rõ — chỉ dùng trên lớp").
  - Ảnh không rõ giấy phép: deck phải đặt meta.imagePolicy = "classroom" và CHỈ chiếu trên lớp, không đăng công khai.
  - Pinterest: --source nên là trang GỐC của ảnh (nút "Truy cập" trên pin), không phải trang pin.
Thoát 0 = đã lưu; 1 = tải được nhưng quá mờ (vẫn lưu); 2 = không tải được."""
import sys, os, io, json, re, urllib.request, urllib.parse

UA = "Mozilla/5.0 (slide-chuan; educational slide tool)"


def main():
    a = sys.argv[1:]
    if len(a) < 2 or "--source" not in a:
        sys.exit(__doc__)
    deck_dir, url = a[0], a[1]
    opt = {k: a[a.index(k) + 1] for k in ("--source", "--name", "--credit", "--license", "--min") if k in a}
    mn = int(opt.get("--min", 1600))
    try:
        from PIL import Image
    except ImportError:
        print("Thiếu Pillow (pip install Pillow)"); sys.exit(2)
    try:
        raw = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA, "Referer": opt["--source"]}), timeout=40).read()
        im = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception as e:
        print(f"✗ Không tải được ảnh: {e}"); sys.exit(2)
    img_dir = os.path.join(deck_dir, "images"); os.makedirs(img_dir, exist_ok=True)
    host = urllib.parse.urlparse(opt["--source"]).hostname or "web"
    name = opt.get("--name") or re.sub(r"[^a-z0-9]+", "-", os.path.splitext(os.path.basename(urllib.parse.urlparse(url).path))[0].lower()).strip("-")[:40] or "anh"
    fn = name + ".jpg"
    if im.width > 2400: im = im.resize((2400, round(im.height * 2400 / im.width)), Image.LANCZOS)
    im.save(os.path.join(img_dir, fn), quality=88)
    mp = os.path.join(img_dir, "images.json"); meta = json.load(open(mp, encoding="utf8")) if os.path.exists(mp) else {}
    meta[fn] = {"title": "", "creator": opt.get("--credit") or host, "license": opt.get("--license") or "không rõ — chỉ dùng trên lớp",
                "license_version": "", "license_url": "", "source": opt["--source"], "via": host.replace("www.", ""), "w": im.width, "h": im.height}
    json.dump(meta, open(mp, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print(f"✓ images/{fn}  {im.width}×{im.height}  nguồn: {opt['--source']}")
    if im.width < mn:
        print(f"⚠ Ảnh chỉ rộng {im.width}px (< {mn}px): mờ nếu tràn viền — dùng trong khung nhỏ / gallery, hoặc tìm bản lớn hơn"); sys.exit(1)
    if not opt.get("--license"):
        print('ℹ Giấy phép không rõ → trong deck đặt meta.imagePolicy = "classroom"; chỉ chiếu trên lớp, không đăng công khai.')


if __name__ == "__main__":
    main()
