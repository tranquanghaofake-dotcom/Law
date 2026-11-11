#!/usr/bin/env python3
"""(Công cụ phát triển — chạy một lần) Thêm lớp 34 tỉnh/thành (sau sắp xếp ĐVHC năm 2025) vào engine/assets/vn_provinces.json.
Căn cứ: Nghị quyết số 202/2025/QH15 ngày 12/6/2025 (Điều 1, khoản 1–23 hợp nhất NGUYÊN tỉnh; khoản 24: 11 tỉnh, thành giữ nguyên).
Vì hợp nhất nguyên tỉnh nên ranh giới mới = hợp (union) ranh giới các tỉnh cũ — không phải ước lượng.
Cần: pip install shapely. Dùng: python3 scripts/build_vn_map34.py"""
import json, re
from shapely.geometry import Polygon
from shapely.ops import unary_union

P = "engine/assets/vn_provinces.json"
RENAME = {"Đông Bắc": "Bắc Kạn", "Đông Nam Bộ": "Đồng Nai", "Đồng Bằng Sông Hồng": "Hưng Yên"}  # Natural Earth gắn nhãn sai (đã đối chiếu toạ độ)
MERGE = {  # tên mới: [tỉnh cũ] — theo thứ tự khoản 1..23 Điều 1 NQ 202/2025/QH15
    "Tuyên Quang": ["Tuyên Quang", "Hà Giang"], "Lào Cai": ["Lào Cai", "Yên Bái"], "Thái Nguyên": ["Thái Nguyên", "Bắc Kạn"],
    "Phú Thọ": ["Phú Thọ", "Vĩnh Phúc", "Hòa Bình"], "Bắc Ninh": ["Bắc Ninh", "Bắc Giang"], "Hưng Yên": ["Hưng Yên", "Thái Bình"],
    "Hải Phòng": ["Hải Phòng", "Hải Dương"], "Ninh Bình": ["Ninh Bình", "Hà Nam", "Nam Định"], "Quảng Trị": ["Quảng Trị", "Quảng Bình"],
    "Đà Nẵng": ["Đà Nẵng", "Quảng Nam"], "Quảng Ngãi": ["Quảng Ngãi", "Kon Tum"], "Gia Lai": ["Gia Lai", "Bình Định"],
    "Khánh Hòa": ["Khánh Hòa", "Ninh Thuận"], "Lâm Đồng": ["Lâm Đồng", "Đắk Nông", "Bình Thuận"], "Đắk Lắk": ["Đắk Lắk", "Phú Yên"],
    "TP. Hồ Chí Minh": ["TP. Hồ Chí Minh", "Bình Dương", "Bà Rịa - Vũng Tàu"], "Đồng Nai": ["Đồng Nai", "Bình Phước"],
    "Tây Ninh": ["Tây Ninh", "Long An"], "Cần Thơ": ["Cần Thơ", "Sóc Trăng", "Hậu Giang"], "Vĩnh Long": ["Vĩnh Long", "Bến Tre", "Trà Vinh"],
    "Đồng Tháp": ["Đồng Tháp", "Tiền Giang"], "Cà Mau": ["Cà Mau", "Bạc Liêu"], "An Giang": ["An Giang", "Kiên Giang"]}
KEEP = ["Cao Bằng", "Điện Biên", "Hà Tĩnh", "Lai Châu", "Lạng Sơn", "Nghệ An", "Quảng Ninh", "Thanh Hóa", "Sơn La", "Hà Nội", "Thừa Thiên Huế"]


def polys(d):
    for part in re.findall(r"M([^Z]+)Z", d):
        pts = [tuple(map(float, q.split())) for q in part.split(" L")]
        if len(pts) >= 3: yield Polygon(pts).buffer(0)


def to_d(g):
    gs = getattr(g, "geoms", [g]); out = []
    for p in gs:
        if p.area < 2: continue
        out.append("M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in list(p.exterior.coords)[:-1]) + "Z")
    return "".join(out)


def main():
    m = json.load(open(P, encoding="utf8"))
    m["provinces"] = {RENAME.get(k, k): v for k, v in m["provinces"].items()}
    old = m["provinces"]; groups = {**MERGE, **{("Huế" if k == "Thừa Thiên Huế" else k): [k] for k in KEEP}}
    used = [o for g in groups.values() for o in g]
    assert len(groups) == 34 and len(used) == 63 == len(set(used)) == len(old) and set(used) == set(old), set(old) ^ set(used)
    out = {}
    for new, olds in groups.items():
        g = unary_union([p for o in olds for p in polys(old[o]["d"])]).buffer(0.8, join_style=2).buffer(-0.8, join_style=2).simplify(0.4)
        r = max(getattr(g, "geoms", [g]), key=lambda p: p.area).representative_point()
        out[new] = {"d": to_d(g), "c": [round(r.x, 1), round(r.y, 1)], "from": olds}
    m["provinces34"] = out
    m["source"] = ("Natural Earth 1:10m admin-1 (public domain). provinces: 63 tỉnh trước 01/7/2025; "
                   "provinces34: hợp ranh giới theo NQ 202/2025/QH15")
    json.dump(m, open(P, "w", encoding="utf8"), ensure_ascii=False, separators=(",", ":"))
    print(len(old), "tỉnh cũ →", len(out), "tỉnh mới")


if __name__ == "__main__":
    main()
