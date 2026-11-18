#!/usr/bin/env python3
"""MINH HOẠ STORYSET (Freepik) — hình do hoạ sĩ vẽ, cùng nguồn với minh hoạ trong mẫu Slidesgo (references/nguon-hinh.md).
Hào duyệt 18/11/2026. Giấy phép: miễn phí kể cả thương mại, BẮT BUỘC ghi công "Illustrations by Storyset" + đường dẫn
(slide cuối hoặc dòng nguồn) và có giới hạn lượt tải mỗi ngày — tải ít, lưu vào thư mục bài, không tải lại.

  python3 scripts/storyset.py tim <thư_mục_ra> <từ khoá> [--kieu=rafiki|bro|amico|pana|cuate] [--toi-da=16]
        → <ra>/tim-<từ khoá>.jpg: bảng xem thử đánh số + <ra>/tim-<từ khoá>.json (số → slug/kiểu, đường dẫn SVG)
  python3 scripts/storyset.py tai <slug/kiểu> <ra.svg> [--mau=#5DA93F] [--bo-nen]   (--bo-nen: xoá lớp nền phòng / mảng blob mờ của Storyset)
        → SVG đã tô lại: màu nhấn của hình (màu không trung tính xuất hiện nhiều nhất) đổi thành --mau; in dòng ghi công.

MỘT DECK = MỘT KIỂU (cùng rafiki, hoặc cùng pana…) + MỘT MÀU NHẤN → cả bộ cùng một giọng hình. Không trộn kiểu, không trộn ảnh chụp.
Không có hình đúng ý → thứ tự xử lý ở nguon-hinh.md (hình gần nghĩa cùng bộ → tách một vật khỏi cảnh → để số liệu làm hình → slide chữ lớn).
"""
import json, os, re, subprocess, sys, colorsys
UA = ["-A", "Mozilla/5.0"]
KIEU = ("rafiki", "bro", "amico", "pana", "cuate")


def trang(url):
    r = subprocess.run(["curl", "-sfL", *UA, url], capture_output=True); return r.stdout.decode("utf8", "ignore")


def svg_cua(slug_kieu):
    h = trang(f"https://storyset.com/illustration/{slug_kieu}")
    m = re.search(r'<img src="(https://stories\.freepiklabs\.com/storage/\d+/[^"]+\.svg)"', h)
    return m.group(1) if m else None


def tim(ra, tu, kieu=None, toi_da=16):
    os.makedirs(ra, exist_ok=True)
    h = trang("https://storyset.com/search?q=" + tu.replace(" ", "+"))
    ds = []
    for m in re.finditer(r'/illustration/([a-z0-9-]+)/(rafiki|bro|amico|pana|cuate)', h):
        k = f"{m.group(1)}/{m.group(2)}"
        if k not in ds and (not kieu or m.group(2) == kieu): ds.append(k)
    ds = ds[:toi_da]; ket = {}
    for i, k in enumerate(ds):
        u = svg_cua(k)
        if u: ket[i + 1] = {"slug": k, "svg": u}
    json.dump(ket, open(os.path.join(ra, f"tim-{tu}.json"), "w"), ensure_ascii=False, indent=1)
    # bảng xem thử: dựng SVG trong Chromium (Playwright có sẵn trong môi trường)
    o = "".join(f'<div style="position:relative;width:420px;height:420px;background:#fff;border:1px solid #ddd"><img src="{v["svg"]}" style="width:100%;height:100%;object-fit:contain"><b style="position:absolute;left:0;top:0;background:#B13A2E;color:#fff;font:700 28px sans-serif;padding:4px 10px">{n}</b><i style="position:absolute;left:6px;bottom:4px;font:14px sans-serif;color:#555">{v["slug"]}</i></div>' for n, v in ket.items())
    html = os.path.join(ra, f"tim-{tu}.html"); open(html, "w").write(f'<body style="margin:0;display:grid;grid-template-columns:repeat(4,422px);gap:6px;background:#333">{o}</body>')
    js = ("const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1720,height:400}});"
          f"await p.goto('file://'+process.cwd()+'/tim-{tu}.html');await p.waitForLoadState('networkidle');await p.screenshot({{path:'tim-{tu}.jpg',fullPage:true,type:'jpeg',quality:80}});await b.close();}})().catch(e=>{{console.error(e.message);process.exit(1)}})")
    goc = subprocess.run("npm root -g", shell=True, capture_output=True, text=True).stdout.strip()
    subprocess.run(["node", "-e", js], cwd=ra, env=dict(os.environ, NODE_PATH=goc))
    print(os.path.join(ra, f"tim-{tu}.jpg"), len(ket))


def mau_nhan(s):
    """Màu nhấn = màu có độ bão hoà cao xuất hiện nhiều nhất (Storyset dùng 1 màu nhấn + xám đậm + xám nhạt + da)."""
    dem = {}
    for c in re.findall(r'#[0-9a-fA-F]{6}\b', s):
        r, g, b = (int(c[i:i + 2], 16) / 255 for i in (1, 3, 5)); hh, l, sat = colorsys.rgb_to_hls(r, g, b)
        if sat > 0.45 and 0.25 < l < 0.85 and not (0.0 < hh < 0.1 and sat < 0.7 and l < 0.6):   # bỏ màu da (cam nâu nhạt)
            dem[c.lower()] = dem.get(c.lower(), 0) + 1
    return max(dem, key=dem.get) if dem else None


def bo_nen(s):
    """Xoá các nhóm nền của Storyset (id chứa 'background' hoặc 'Floor'): cửa sổ, bàn mờ, mảng blob — giữ nhân vật và đồ vật."""
    import xml.etree.ElementTree as ET
    ET.register_namespace("", "http://www.w3.org/2000/svg"); ET.register_namespace("xlink", "http://www.w3.org/1999/xlink")
    goc = ET.fromstring(s)
    def quet(cha):
        for con in list(cha):
            i = (con.get("id") or "").lower()
            if "background" in i or "floor" in i: cha.remove(con)
            else: quet(con)
    quet(goc); return ET.tostring(goc, encoding="unicode")


def tai(slug_kieu, ra, mau=None, nen=True):
    u = slug_kieu if slug_kieu.startswith("http") else svg_cua(slug_kieu)
    if not u: print("✗ không tìm thấy SVG", slug_kieu); sys.exit(1)
    s = subprocess.run(["curl", "-sfL", *UA, u], capture_output=True).stdout.decode("utf8", "ignore")
    goc = mau_nhan(s)
    if mau and goc: s = re.sub(goc, mau, s, flags=re.I)
    if not nen: s = bo_nen(s)
    os.makedirs(os.path.dirname(os.path.abspath(ra)), exist_ok=True); open(ra, "w").write(s)
    print(f"✓ {ra} (màu nhấn {goc} → {mau or 'giữ'})")
    print(f"  ghi công: Illustrations by Storyset — https://storyset.com/illustration/{slug_kieu if not slug_kieu.startswith('http') else ''}")


if __name__ == "__main__":
    a = sys.argv[1:]; f = {x.split("=")[0][2:]: (x.split("=", 1)[1] if "=" in x else True) for x in a if x.startswith("--")}; p = [x for x in a if not x.startswith("--")]
    if len(p) >= 3 and p[0] == "tim": tim(p[1], " ".join(p[2:]), f.get("kieu"), int(f.get("toi-da", 16)))
    elif len(p) == 3 and p[0] == "tai": tai(p[1], p[2], f.get("mau"), nen=not f.get("bo-nen"))
    else: print(__doc__); sys.exit(2)
