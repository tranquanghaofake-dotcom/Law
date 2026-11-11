"""Dựng font tự host cho web (apps/web/src/fonts/*.woff2) từ bản gốc trong kho google/fonts (giấy phép OFL 1.1).

Vì sao: trước đây trang tải 16 file font từ fonts.gstatic.com (mỗi độ đậm 2–3 file theo nhóm ký tự) và một file CSS
chặn hiển thị từ fonts.googleapis.com. Gộp nhóm "latin" + "vietnamese" vào một file cho mỗi độ đậm, đặt cùng máy chủ
với web: ít request hơn, không phụ thuộc máy chủ ngoài, mở được ngay cả khi chưa có mạng (service worker precache).

Cách chạy (chỉ khi cần dựng lại, ví dụ thêm độ đậm):
    python3 -m venv .venv && .venv/bin/pip install fonttools brotli
    .venv/bin/python tools/fonts/build.py <thư mục chứa file .ttf gốc>
File gốc: https://github.com/google/fonts/tree/main/ofl/{bevietnampro,notoserif,notoserifdisplay}
"""
import sys
from io import BytesIO
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SRC = Path(sys.argv[1])
OUT = Path(__file__).resolve().parents[2] / "apps" / "web" / "src" / "fonts"

# Đúng hai nhóm ký tự Google Fonts đang phục vụ cho trang tiếng Việt: "latin" và "vietnamese".
LATIN = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
VIET = "U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB"

# (file gốc, file ra, giới hạn trục biến thiên). Noto Serif/Display là font biến thiên: giữ đúng dải độ đậm app dùng.
JOBS = [
    ("BeVietnamPro-Regular.ttf", "be-vietnam-pro-400.woff2", None),
    ("BeVietnamPro-Medium.ttf", "be-vietnam-pro-500.woff2", None),
    ("BeVietnamPro-SemiBold.ttf", "be-vietnam-pro-600.woff2", None),
    ("BeVietnamPro-Bold.ttf", "be-vietnam-pro-700.woff2", None),
    ("BeVietnamPro-ExtraBold.ttf", "be-vietnam-pro-800.woff2", None),
    ("NotoSerif[wdth,wght].ttf", "noto-serif-400-600.woff2", {"wdth": 100, "wght": (400, 600)}),
    ("NotoSerif-Italic[wdth,wght].ttf", "noto-serif-italic-400.woff2", {"wdth": 100, "wght": 400}),
]


def unicodes(spec: str) -> list[int]:
    out: list[int] = []
    for part in spec.split(","):
        lo, _, hi = part.strip()[2:].partition("-")
        out.extend(range(int(lo, 16), int(hi or lo, 16) + 1))
    return out


OUT.mkdir(parents=True, exist_ok=True)
for src, dst, axes in JOBS:
    font = TTFont(SRC / src)
    if axes:
        # Ghi ra bộ nhớ rồi đọc lại: bảng gvar sau khi thu hẹp trục cần được dựng lại thì bước cắt ký tự mới chạy được.
        buf = BytesIO()
        instancer.instantiateVariableFont(font, axes).save(buf)
        buf.seek(0)
        font = TTFont(buf)
    opts = subset.Options(flavor="woff2", notdef_outline=True, name_IDs=[0, 1, 2, 3, 4, 6, 13, 14])
    # Bộ tính năng mặc định (kern, liga, dấu…) + kiểu chữ số: app dùng `font-variant-numeric: tabular-nums` cho điểm, số ngày.
    opts.layout_features += ["tnum", "lnum", "pnum", "onum"]
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=unicodes(LATIN + "," + VIET))
    sub.subset(font)
    font.flavor = "woff2"
    font.save(OUT / dst)
    print(f"{dst}: {(OUT / dst).stat().st_size / 1024:.1f} kB, {len(font.getBestCmap())} ký tự")
