#!/usr/bin/env python3
"""Kiểm file video đã render và dựng tờ xem nhanh để soát bằng mắt.

  python3 scripts/kiem_tra_video.py <dự án> [out/video.mp4]

Ghi vào <dự án>/out/review/:
  canh.png   — mỗi cảnh 2 khung (ngay sau khi vào + giữa cảnh), kèm số khung
  cat.png    — mỗi điểm cắt: −0,2 s / 0 / +0,2 s (bắt nhảy hình, chớp trắng quá đà)
  phone.png  — các khung giữa cảnh thu về bề ngang 360 px (chữ còn đọc được trên điện thoại?)
In: khổ, fps, thời lượng so với storyboard, độ to (LUFS) nếu có âm thanh. Âm thanh chỉ ĐO, không nghe được — ghi rõ khi báo cáo.
"""
import json
import os
import re
import subprocess
import sys


def probe(f):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,width,height,r_frame_rate:format=duration", "-of", "json", f], capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def frame_png(video, n, out, scale):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vf", f"select=eq(n\\,{n}),scale={scale}:-1", "-frames:v", "1", out], check=True)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    proj = sys.argv[1]
    video = sys.argv[2] if len(sys.argv) > 2 else os.path.join(proj, "out", "video.mp4")
    sb = json.load(open(os.path.join(proj, "src", "storyboard.json"), encoding="utf-8"))
    fps = sb["format"]["fps"]
    fpb = fps * 60 / sb["music"]["bpm"]
    off = round(sb["music"]["offsetSec"] * fps)
    bt = lambda n: off + round(n * fpb)
    starts, bar = [], 0
    for i, s in enumerate(sb["scenes"]):
        starts.append((s["id"], 0 if i == 0 else bt(bar * 4), bt((bar + s["bars"]) * 4)))
        bar += s["bars"]
    total = bt(bar * 4)

    p = probe(video)
    v = next(s for s in p["streams"] if s["codec_type"] == "video")
    num, den = map(int, v["r_frame_rate"].split("/"))
    dur = float(p["format"]["duration"])
    loi = []
    print(f"{video}: {v['width']}×{v['height']} @ {num / den:g} fps · {dur:.2f} s (storyboard {total / fps:.2f} s)")
    if (v["width"], v["height"]) != (sb["format"]["width"], sb["format"]["height"]):
        loi.append("khổ khác storyboard")
    if abs(num / den - 60) > 0.01:
        loi.append("không phải 60 fps")
    if abs(dur - total / fps) > 0.1:
        loi.append("thời lượng lệch storyboard > 0,1 s")
    if any(s["codec_type"] == "audio" for s in p["streams"]):
        r = subprocess.run(["ffmpeg", "-hide_banner", "-i", video, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
        m = re.findall(r"I:\s+(-?[\d.]+) LUFS", r)
        if m:
            lufs = float(m[-1])
            print(f"Độ to tích hợp {lufs} LUFS (mạng xã hội: −16 đến −14; nhạc ghép trên nền tảng thì hiệu ứng nên thấp hơn)")

    rv = os.path.join(proj, "out", "review")
    os.makedirs(rv, exist_ok=True)
    tmp = []

    def sheet(frames, name, scale, cols):
        files = []
        for n in frames:
            f = os.path.join(rv, f"_{name}_{n}.png")
            frame_png(video, n, f, scale)
            files.append(f)
        tmp.extend(files)
        rows = [files[i : i + cols] for i in range(0, len(files), cols)]
        row_files = []
        for k, r in enumerate(rows):
            rf = os.path.join(rv, f"_{name}_row{k}.png")
            args = sum([["-i", f] for f in r], [])
            pad = cols - len(r)
            filt = f"{''.join(f'[{i}]' for i in range(len(r)))}hstack=inputs={len(r)}" if len(r) > 1 else "[0]copy"
            if pad:
                filt += f",pad=iw*{cols}/{len(r)}:ih:0:0:black"
            subprocess.run(["ffmpeg", "-v", "error", "-y", *args, "-filter_complex", filt, rf], check=True)
            row_files.append(rf)
        tmp.extend(row_files)
        out = os.path.join(rv, f"{name}.png")
        if len(row_files) == 1:
            os.replace(row_files[0], out)
            tmp.remove(row_files[0])
        else:
            args = sum([["-i", f] for f in row_files], [])
            subprocess.run(["ffmpeg", "-v", "error", "-y", *args, "-filter_complex", f"{''.join(f'[{i}]' for i in range(len(row_files)))}vstack=inputs={len(row_files)}", out], check=True)
        print("  →", out)

    last = int(dur * fps) - 1
    canh = []
    for _, a, z in starts:
        canh += [min(last, a + 12), min(last, (a + z) // 2)]
    sheet(canh, "canh", 270, 8)
    cuts = []
    for _, a, _z in starts[1:]:
        cuts += [max(0, a - 12), a, min(last, a + 12)]
    if cuts:
        sheet(cuts, "cat", 200, 9)
    sheet([min(last, (a + z) // 2) for _, a, z in starts], "phone", 360 if sb["format"]["height"] > sb["format"]["width"] else 640, 6)
    for f in tmp:
        if os.path.exists(f):
            os.remove(f)
    for x in loi:
        print("  LỖI:", x)
    print("Soát tờ xem nhanh theo references/7-kiem-tra.md; âm thanh mới chỉ được ĐO, chưa ai nghe.")
    print("XANH" if not loi else f"ĐỎ ({len(loi)} lỗi)")
    sys.exit(1 if loi else 0)


if __name__ == "__main__":
    main()
