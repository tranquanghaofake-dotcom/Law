#!/usr/bin/env python3
"""(Công cụ phát triển — chạy một lần) Dựng engine/assets/vn_provinces.json từ Natural Earth 10m admin-1 (phạm vi công cộng).
Dùng: python3 scripts/build_vn_map.py <ne_10m_admin_1_states_provinces.geojson>
Ranh giới: 63 tỉnh/thành TRƯỚC đợt sắp xếp đơn vị hành chính năm 2025 (phù hợp vụ việc xảy ra trước đó).
Hoàng Sa, Trường Sa: Natural Earth không gắn vào Việt Nam — engine LUÔN tự vẽ và ghi tên hai quần đảo."""
import sys, json, math, unicodedata

LON0, LON1, LAT0, LAT1 = 101.8, 117.6, 7.2, 23.6          # khung gồm cả Hoàng Sa, Trường Sa
K = math.cos(math.radians(15.5))                            # hệ số co kinh độ (vĩ độ giữa)
SCALE = 60                                                  # đơn vị SVG / độ
FIX = {"Đông Bắc": "Bắc Kạn", "Đông Nam Bộ": "Đồng Nai", "Đồng Bằng Sông Hồng": "Hưng Yên", "Quàng Nam": "Quảng Nam", "Ha Noi": "Hà Nội", "Ha Tinh": "Hà Tĩnh", "Can Tho": "Cần Thơ", "Son La": "Sơn La", "Lai Chau": "Lai Châu",
       "Hau Giang": "Hậu Giang", "Ðong Tháp": "Đồng Tháp", "Hồ Chí Minh city": "TP. Hồ Chí Minh", "Thừa Thiên - Huế": "Thừa Thiên Huế"}


def xy(lon, lat):
    return round((lon - LON0) * K * SCALE, 1), round((LAT1 - lat) * SCALE, 1)


def simplify(pts, tol):
    if len(pts) < 4: return pts
    a, b = pts[0], pts[-1]; dmax, k = 0, 0
    for i in range(1, len(pts) - 1):
        p = pts[i]; dx, dy = b[0] - a[0], b[1] - a[1]
        d = abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / (math.hypot(dx, dy) or 1)
        if d > dmax: dmax, k = d, i
    if dmax > tol: return simplify(pts[:k + 1], tol)[:-1] + simplify(pts[k:], tol)
    return [a, b]


def main():
    d = json.load(open(sys.argv[1], encoding="utf8"))
    out = {"viewBox": [0, 0, round((LON1 - LON0) * K * SCALE, 1), round((LAT1 - LAT0) * SCALE, 1)], "lon0": LON0, "lat1": LAT1, "k": K, "scale": SCALE,
           "source": "Natural Earth 1:10m admin-1 (public domain); ranh giới trước sắp xếp ĐVHC năm 2025", "provinces": {},
           "islands": {"Quần đảo Hoàng Sa": [[111.2, 16.9], [111.6, 16.5], [112.3, 16.8], [111.9, 16.2], [112.6, 16.4], [111.5, 15.8]],
                       "Quần đảo Trường Sa": [[114.3, 11.4], [114.9, 10.9], [115.8, 10.2], [113.9, 10.0], [114.6, 9.6], [116.2, 9.1], [115.2, 8.7], [113.0, 8.9], [112.4, 8.6]]}}
    for f in d["features"]:
        p = f["properties"]
        if p.get("adm0_a3") != "VNM": continue
        name = FIX.get(p.get("name"), p.get("name"))
        g = f["geometry"]; polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        parts, area_best, cen = [], 0, None
        for poly in polys:
            ring = [xy(lo, la) for lo, la in poly[0]]
            # vòng khép kín: tách đôi tại điểm xa điểm đầu nhất rồi giản lược từng nửa (Douglas–Peucker không chạy trên vòng kín)
            far = max(range(len(ring)), key=lambda i: math.hypot(ring[i][0] - ring[0][0], ring[i][1] - ring[0][1]))
            ring = simplify(ring[:far + 1], 0.9)[:-1] + simplify(ring[far:], 0.9)
            if len(ring) < 3: continue
            a = 0.5 * sum(ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1] for i in range(len(ring) - 1))
            if abs(a) < 2: continue  # bỏ đảo quá nhỏ ở tỉ lệ slide
            parts.append("M" + " L".join(f"{x} {y}" for x, y in ring) + "Z")
            if abs(a) > area_best:
                area_best = abs(a); cx = sum(x for x, _ in ring) / len(ring); cy = sum(y for _, y in ring) / len(ring); cen = [round(cx, 1), round(cy, 1)]
        if parts: out["provinces"][name] = {"d": "".join(parts), "c": cen}
    json.dump(out, open("engine/assets/vn_provinces.json", "w", encoding="utf8"), ensure_ascii=False, separators=(",", ":"))
    print(len(out["provinces"]), "tỉnh; viewBox", out["viewBox"])


if __name__ == "__main__":
    main()
