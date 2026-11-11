#!/usr/bin/env python3
"""Tính vị trí cảnh từ storyboard.json cho các script kiểm (dùng chung, không chạy riêng).

Giống hệt template/src/core/timeline.ts: chế độ "music" theo ô nhịp; chế độ "voice" theo câu nói trong src/giong.json.
"""
import json
import os
import re
import unicodedata


def nrm(s):
    s = unicodedata.normalize("NFC", s).lower()
    return [w for w in re.sub(r"[^\w\s]", " ", s).split() if w]


def load_giong(proj):
    p = os.path.join(proj, "src", "giong.json")
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else {"engine": "", "sentences": []}


def say_sec(ref, sents, scope=()):
    """Giây của một mốc lời "a2" / "a2:từ" / "từ". Trả None nếu không thấy."""
    m = re.fullmatch(r"([a-z]\d+)(?::(.*))?", ref)
    by = {s["id"]: s for s in sents}
    if m and not m.group(2):
        return by[m.group(1)]["start"] if m.group(1) in by else None
    phrase = nrm(m.group(2) if m else ref)
    pool = [by[m.group(1)]] if m and m.group(1) in by else ([] if m else [by[i] for i in scope if i in by] + [s for s in sents if s["id"] not in scope])
    for s in pool:
        ws = [" ".join(nrm(w["w"])) for w in s["words"]]
        for i in range(len(ws) - len(phrase) + 1):
            if ws[i : i + len(phrase)] == phrase:
                return s["words"][i]["t"]
    return None


def place(sb, proj):
    """→ (danh sách (id, khung_bắt_đầu, khung_kết_thúc), tổng khung, lỗi[])."""
    fps = sb["format"]["fps"]
    fpb = fps * 60 / sb["music"]["bpm"]
    loi = []
    if sb.get("clock") == "voice":
        g = load_giong(proj)
        sents = g["sentences"]
        by = {s["id"]: s for s in sents}
        lead = round(sb.get("voice", {}).get("leadSec", 0) * fps)
        starts = []
        for i, s in enumerate(sb["scenes"]):
            say = s.get("say") or []
            if not say:
                loi.append(f"cảnh '{s['id']}' thiếu \"say\" (chế độ voice)")
                starts.append(0)
            elif say[0] not in by:
                loi.append(f"cảnh '{s['id']}': giong.json không có câu '{say[0]}'")
                starts.append(0)
            else:
                starts.append(0 if i == 0 else lead + round(by[say[0]]["start"] * fps))
        last = (sb["scenes"][-1].get("say") or [None])[-1]
        end = lead + round(((by[last]["end"] if last in by else 0) + sb.get("voice", {}).get("tailSec", 1.5)) * fps)
        out = [(s["id"], starts[i], starts[i + 1] if i + 1 < len(starts) else end) for i, s in enumerate(sb["scenes"])]
        return out, end, loi
    off = round(sb["music"]["offsetSec"] * fps)
    bt = lambda n: off + round(n * fpb)
    out, bar = [], 0
    for i, s in enumerate(sb["scenes"]):
        out.append((s["id"], 0 if i == 0 else bt(bar * 4), bt((bar + s.get("bars", 0)) * 4)))
        bar += s.get("bars", 0)
    return out, bt(bar * 4), loi
