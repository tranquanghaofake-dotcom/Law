# Công cụ phát triển: dựng hinh/the_gioi_cham.json — bản đồ thế giới bằng chấm cho nền bộ hình "bàn hội nghị quốc tế" (hinh/hoi_nghi.js).
# Nguồn: Natural Earth 1:110m land (phạm vi công cộng): https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson
# Phép chiếu equirectangular, rộng 1920 px, vĩ độ 84°B → 58°N (bỏ châu Nam Cực), chấm cách nhau 15 px.
# Dữ liệu 110m không có Hoàng Sa, Trường Sa → thêm chấm cho hai quần đảo (bản đồ có Việt Nam phải có Hoàng Sa, Trường Sa).
# Dùng: python3 scripts/build_the_gioi_cham.py ne_110m_land.geojson hinh/the_gioi_cham.json
import json, sys
src, out = sys.argv[1], sys.argv[2]
W, LAT0, LAT1, STEP = 1920, 84.0, -58.0, 15
H = round(W * (LAT0 - LAT1) / 360)
polys = []
for f in json.load(open(src))['features']:
    g = f['geometry']; P = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
    for p in P:
        ring = p[0]; xs = [c[0] for c in ring]; ys = [c[1] for c in ring]
        polys.append((min(xs), max(xs), min(ys), max(ys), ring, p[1:]))
def inside(ring, x, y):
    c = False; n = len(ring); j = n - 1
    for i in range(n):
        xi, yi = ring[i]; xj, yj = ring[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi: c = not c
        j = i
    return c
def land(lon, lat):
    for a, b, c, d, ring, holes in polys:
        if a <= lon <= b and c <= lat <= d and inside(ring, lon, lat) and not any(inside(h, lon, lat) for h in holes): return True
    return False
pts = []
for py in range(STEP // 2, H, STEP):
    lat = LAT0 - py / H * (LAT0 - LAT1)
    for px in range(STEP // 2, W, STEP):
        if land(px / W * 360 - 180, lat): pts.append((px, py))
xy = lambda lon, lat: (round((lon + 180) / 360 * W), round((LAT0 - lat) / (LAT0 - LAT1) * H))
dao = [(111.8, 16.6), (112.6, 16.4), (112.2, 15.9), (114.3, 11.2), (115.6, 10.4), (113.6, 9.6), (114.9, 8.9)]   # Hoàng Sa · Trường Sa
d = ''.join(f'M{x} {y}h0' for x, y in pts) + ''.join('M%d %dh0' % xy(lo, la) for lo, la in dao)
json.dump({'w': W, 'h': H, 'step': STEP, 'd': d, 'nguon': 'Natural Earth 1:110m land (phạm vi công cộng) — chấm 15 px, phép chiếu equirectangular 84°B–58°N; thêm chấm Hoàng Sa, Trường Sa'}, open(out, 'w'), ensure_ascii=False)
print(len(pts) + len(dao), 'chấm', W, 'x', H)
