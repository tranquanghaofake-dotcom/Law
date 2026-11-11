#!/usr/bin/env python3
"""Tách nền ảnh thật (chìa khoá, cuốn sổ, toà nhà...) để đặt VẬT THẬT vào chỗ hình vẽ `art` của slide.
Dùng: python3 scripts/cutout.py <thư_mục_deck> images/<ảnh>.jpg [--model u2net] [--pad 0.04]
  → ghi images/<ảnh>_cut.png (nền trong suốt, cắt sát chủ thể) + thông tin ghi nguồn vào images/images.json.
  Trong deck.json: "cutout": "images/<ảnh>_cut.png" ở slide statement / agenda / panelrows / section (thay `art`).

Công cụ: rembg (MIT) + mô hình U²-Net "u2net" (Apache-2.0, xuebinqin/U-2-Net). Cài một lần:
  pip install "rembg[cpu]"      (lần chạy đầu tự tải mô hình ~170 MB về ~/.u2net)
KHÔNG dùng mô hình "bria-rmbg" (BRIA RMBG-2.0): giấy phép riêng, dùng thương mại phải trả phí.

Giấy phép ảnh — tách nền là CHỈNH SỬA tác phẩm:
  - ảnh ND (cấm phái sinh) → từ chối;  ảnh không có trong images.json → từ chối (không rõ giấy phép thì không chỉnh sửa).
  - CC BY / CC BY-SA: được sửa nhưng phải ghi nguồn VÀ ghi rõ đã sửa; BY-SA còn buộc bản sửa theo cùng giấy phép → script tự ghi.
Thoát 0 = xong; 1 = ảnh không hợp lệ / giấy phép không cho sửa / không tách được chủ thể; 2 = thiếu thư viện."""
import sys, os, json, io


def license_ok(meta):
    """Trả về (được phép, lý do). Tách riêng để test không cần rembg."""
    if not meta:
        return False, "ảnh không có trong images/images.json — không rõ giấy phép, không được chỉnh sửa (tải ảnh bằng find_images.py / fetch_image.py)"
    lic = str(meta.get("license", "")).upper()
    if "ND" in lic.replace("-", " ").split() or "-ND" in lic:
        return False, f"giấy phép {meta.get('license')} cấm tác phẩm phái sinh (ND) — không được tách nền"
    if meta.get("via") == "web":
        return False, "ảnh lấy từ web không rõ giấy phép (chế độ classroom) — không chỉnh sửa"
    return True, ""


def trim(im, pad):
    """Cắt sát vùng có chủ thể (alpha > 8) + chừa lề pad (tỉ lệ cạnh dài)."""
    a = im.getchannel("A").point(lambda v: 255 if v > 8 else 0)
    box = a.getbbox()
    if not box:
        return None
    p = int(max(box[2] - box[0], box[3] - box[1]) * pad)
    return im.crop((max(0, box[0] - p), max(0, box[1] - p), min(im.width, box[2] + p), min(im.height, box[3] + p)))


def main():
    args = sys.argv[1:]
    if len(args) < 2:
        sys.exit(__doc__)
    model, pad = "u2net", 0.04
    if "--model" in args: i = args.index("--model"); model = args[i + 1]; del args[i:i + 2]
    if "--pad" in args: i = args.index("--pad"); pad = float(args[i + 1]); del args[i:i + 2]
    if model.startswith("bria"):
        print("✗ Mô hình BRIA RMBG có giấy phép trả phí khi dùng thương mại — dùng u2net / isnet-general-use"); sys.exit(1)
    deck, rel = args[0], args[1]
    src = os.path.join(deck, rel)
    if not os.path.exists(src):
        print(f"✗ Không thấy {src}"); sys.exit(1)
    mpath = os.path.join(deck, "images", "images.json")
    allmeta = json.load(open(mpath, encoding="utf8")) if os.path.exists(mpath) else {}
    meta = allmeta.get(os.path.basename(rel))
    ok, why = license_ok(meta)
    if not ok:
        print("✗ " + why); sys.exit(1)
    try:
        from PIL import Image
        from rembg import remove, new_session
    except ImportError:
        print('Thiếu thư viện: pip install "rembg[cpu]" Pillow'); sys.exit(2)
    im = Image.open(src).convert("RGB")
    if max(im.size) > 2400:
        im.thumbnail((2400, 2400))
    out = remove(im, session=new_session(model))  # RGBA
    cut = trim(out, pad)
    if cut is None:
        print("✗ Không tách được chủ thể (ảnh không có vật nổi bật) — dùng ảnh nguyên trong frame/split"); sys.exit(1)
    cov = sum(cut.getchannel("A").histogram()[9:]) / (cut.width * cut.height)
    name = os.path.splitext(os.path.basename(rel))[0] + "_cut.png"
    dst = os.path.join(deck, "images", name)
    cut.save(dst, optimize=True)
    m = dict(meta)
    m.update({"file": f"images/{name}", "w": cut.width, "h": cut.height, "derived_from": os.path.basename(rel),
              "title": (meta.get("title") or "") + " (đã tách nền)", "edited": f"Đã tách nền bằng rembg/{model}"})
    if "SA" in str(meta.get("license", "")).upper():
        m["edited"] += f" — bản sửa phát hành theo cùng giấy phép {meta.get('license')}"
    allmeta[name] = m
    json.dump(allmeta, open(mpath, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print(f"✓ {dst}  {cut.width}×{cut.height}  (chủ thể chiếm {cov:.0%} khung)")
    if cov < 0.15:
        print("⚠ Chủ thể rất mảnh/nhỏ — mở ảnh xem lại; nếu tách sai thì thử --model isnet-general-use")
    print(f'→ Ghi vào slide: "cutout": "images/{name}"  (statement / agenda / panelrows / section). XEM ẢNH trước khi dùng: mép tóc, lá cây hay bị răng cưa.')


if __name__ == "__main__":
    main()
