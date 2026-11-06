#!/usr/bin/env python3
"""Kiểm storyboard.json TRƯỚC khi render: khớp nhịp, đủ thời gian đọc, vùng an toàn, dấu hiệu "video do máy tạo".

  python3 scripts/kiem_tra_storyboard.py <dự án>/src/storyboard.json

LỖI (phải sửa) · CẢNH BÁO (sửa, hoặc giữ có chủ đích và ghi lý do vào REVIEW.md).
"""
import json
import os
import re
import sys

TYPES = {"TitleSlam", "LogoReveal", "StatCount", "KnowledgeCard", "FeatureSteps", "DeviceDemo", "MediaHero", "CardCycle", "Ladder", "LineReveal", "EndCard"}
# Từ sáo của video quảng cáo do máy viết (spec HyperFrames, mở rộng tiếng Việt)
SAO = ["introducing", "meet ", "unlock", "seamless", "supercharge", "game-changer", "revolutioniz", "effortless", "in seconds",
       "đột phá", "cách mạng", "vượt trội", "tối ưu hóa trải nghiệm", "liền mạch", "chỉ trong vài giây", "giới thiệu"]


def texts(obj):
    if isinstance(obj, str):
        yield obj
    elif isinstance(obj, dict):
        for k, v in obj.items():
            if k not in ("src", "image", "poster", "url", "icon", "file", "tone", "color", "kind", "size", "device"):
                yield from texts(v)
    elif isinstance(obj, list):
        for v in obj:
            yield from texts(v)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    path = sys.argv[1]
    sb = json.load(open(path, encoding="utf-8"))
    root = os.path.dirname(os.path.dirname(os.path.abspath(path)))
    loi, canh = [], []
    fmt, mu, th = sb["format"], sb["music"], sb["theme"]
    if fmt.get("fps") != 60:
        loi.append(f"fps = {fmt.get('fps')} (yêu cầu 60)")
    if sorted([fmt["width"], fmt["height"]]) != [1080, 1920]:
        loi.append(f"khổ {fmt['width']}×{fmt['height']} (Full HD là 1080×1920 hoặc 1920×1080)")
    spb = 60 / mu["bpm"]
    bars = sum(s["bars"] for s in sb["scenes"])
    secs = bars * 4 * spb
    if bars % mu["phraseBars"]:
        canh.append(f"tổng {bars} ô không chia hết cụm {mu['phraseBars']} ô → video kết giữa cụm nhạc")
    if mu.get("file") and not os.path.exists(os.path.join(root, "public", mu["file"])):
        loi.append(f"thiếu file nhạc public/{mu['file']}")
    deco = th.get("decor") or {}
    for k in ("particles", "rays", "glow"):
        if deco.get(k):
            canh.append(f"theme.decor.{k} bật — trang trí này là dấu hiệu video máy tạo; chỉ giữ khi thương hiệu có chất liệu đó (ghi lý do)")
    seen_types = []
    for i, s in enumerate(sb["scenes"]):
        tag = f"cảnh {i + 1} '{s.get('id')}'"
        if s["type"] not in TYPES:
            loi.append(f"{tag}: loại '{s['type']}' không có")
            continue
        dur = s["bars"] * 4 * spb
        # thời gian đọc: 0,5 s + 0,3 s/từ cho chữ cần đọc
        words = sum(len(t.split()) for t in texts(s["props"]))
        need = 0.5 + 0.3 * words
        if need > dur * 1.15:
            canh.append(f"{tag}: {words} chữ cần ~{need:.1f} s để đọc nhưng cảnh dài {dur:.1f} s → bớt chữ hoặc thêm ô nhịp")
        for t in texts(s["props"]):
            low = t.lower()
            for w in SAO:
                if w in low:
                    canh.append(f"{tag}: từ sáo '{w.strip()}' trong \"{t[:50]}\"")
        for ln in s["props"].get("lines", []) if isinstance(s["props"].get("lines"), list) else []:
            if len(ln.get("text", "").split()) > 6:
                canh.append(f"{tag}: dòng tiêu đề > 6 chữ: \"{ln['text']}\"")
        # asset tồn tại
        for m in re.findall(r'"(?:src|image|poster)":\s*"([^"]+)"', json.dumps(s["props"], ensure_ascii=False)):
            if not m.startswith("http") and not os.path.exists(os.path.join(root, "public", m)):
                loi.append(f"{tag}: thiếu asset public/{m}")
        seen_types.append(s["type"])
    if sb["scenes"] and sb["scenes"][0]["type"] in ("LogoReveal", "EndCard"):
        canh.append("khung đầu là logo — khung 0 là ảnh bìa/hook: mở bằng câu hỏi, kết quả hoặc nỗi đau của người xem")
    if sb["scenes"] and sb["scenes"][-1]["type"] != "EndCard":
        canh.append("không kết bằng EndCard (dấu thương hiệu + kêu gọi giữ 2–3 s)")
    for t in set(seen_types):
        if seen_types.count(t) > 2:
            canh.append(f"loại cảnh {t} dùng {seen_types.count(t)} lần — các cảnh giống nhau vào giống nhau là dấu hiệu máy tạo")
    if not sb.get("cues"):
        canh.append("không có hiệu ứng âm thanh (cues) — mỗi hành động thấy được nên có tiếng, ít mà đúng")
    print(f"{sb.get('title', '')}: {len(sb['scenes'])} cảnh · {bars} ô · {secs:.1f} s · {mu['bpm']} BPM · {fmt['width']}×{fmt['height']}@{fmt['fps']}")
    for x in loi:
        print("  LỖI:", x)
    for x in canh:
        print("  CẢNH BÁO:", x)
    print("XANH" if not loi else f"ĐỎ ({len(loi)} lỗi)")
    sys.exit(1 if loi else 0)


if __name__ == "__main__":
    main()
