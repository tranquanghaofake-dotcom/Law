#!/usr/bin/env python3
"""Kiểm storyboard.json TRƯỚC khi render: khớp nhịp (hoặc khớp lời), đủ thời gian đọc, nhãn ngắn, dấu hiệu "video do máy tạo".

  python3 scripts/kiem_tra_storyboard.py <dự án>/src/storyboard.json

LỖI (phải sửa) · CẢNH BÁO (sửa, hoặc giữ có chủ đích và ghi lý do vào REVIEW.md).
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from thoi_gian import load_giong, place, say_sec  # noqa: E402

TYPES = {"TitleSlam", "LogoReveal", "StatCount", "KnowledgeCard", "FeatureSteps", "DeviceDemo", "MediaHero", "CardCycle", "CardMontage", "Ladder", "LineReveal", "EndCard",
         # bộ cảnh áp phích (template/src/scenes/poster.tsx)
         "PosterHook", "PosterLaw", "PosterSteps", "PosterNumber", "PosterVersus", "PosterTimeline", "PosterVerdict", "PosterEnd"}
POSTER_MAX_CH = 18  # một dòng Anton dài hơn mức này phải co chữ dưới ~9 % bề ngang khung: mất lực áp phích
# Từ sáo của video quảng cáo do máy viết (spec HyperFrames, mở rộng tiếng Việt)
SAO = ["introducing", "meet ", "unlock", "seamless", "supercharge", "game-changer", "revolutioniz", "effortless", "in seconds",
       "đột phá", "cách mạng", "vượt trội", "tối ưu hóa trải nghiệm", "liền mạch", "chỉ trong vài giây", "giới thiệu"]


def texts(obj):
    if isinstance(obj, str):
        yield obj
    elif isinstance(obj, dict):
        for k, v in obj.items():
            if k not in ("src", "image", "poster", "url", "icon", "file", "tone", "color", "kind", "size", "device", "say"):
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
    voice = sb.get("clock") == "voice"
    spb = 60 / mu["bpm"]
    placed, total, ploi = place(sb, root)
    loi += ploi
    secs = total / fmt["fps"]
    bars = sum(s.get("bars", 0) for s in sb["scenes"])
    if voice:
        g = load_giong(root)
        sents = g["sentences"]
        if not sents:
            loi.append("chế độ voice nhưng src/giong.json trống — chạy scripts/canh_giong.py trước")
        if g.get("engine") == "uoc-luong":
            canh.append("giong.json là ƯỚC LƯỢNG (không có nhận dạng giọng) — mốc từ lệch vài trăm ms; chỉ dùng dựng nháp, báo người dùng")
        for c in sents:
            if g.get("engine") != "uoc-luong" and c.get("match", 1) < 0.5:
                loi.append(f"câu {c['id']} chỉ khớp {int(c['match'] * 100)} % — giọng đọc khác kịch bản, hỏi lại người dùng")
        said = [i for s in sb["scenes"] for i in (s.get("say") or [])]
        for c in sents:
            if c["id"] not in said:
                canh.append(f"câu {c['id']} không thuộc cảnh nào (\"say\") — lời đó sẽ nói trên hình của cảnh trước")
        if not (sb.get("voice") or {}).get("file") or not os.path.exists(os.path.join(root, "public", (sb.get("voice") or {}).get("file", "_"))):
            loi.append("thiếu voice.file trong public/ (canh_giong.py ghi public/voice/voice.wav)")
        # mọi mốc { say } phải tìm thấy trong lời
        for s in sb["scenes"]:
            for ref in re.findall(r'"say":\s*"([^"]+)"', json.dumps(s["props"], ensure_ascii=False)):
                if say_sec(ref, sents, s.get("say") or []) is None:
                    loi.append(f"cảnh '{s['id']}': không thấy mốc lời \"{ref}\" — từ phải có thật trong kịch bản")
        for c in sb.get("cues") or []:
            if isinstance(c.get("at"), dict) and say_sec(c["at"]["say"], sents) is None:
                loi.append(f"cue {c.get('sfx')}: không thấy mốc lời \"{c['at']['say']}\"")
    elif bars % mu["phraseBars"]:
        canh.append(f"tổng {bars} ô không chia hết cụm {mu['phraseBars']} ô → video kết giữa cụm nhạc")
    if secs > 60:
        canh.append(f"video dài {secs:.0f} s > 60 s — dựng MẪU 20–30 s đầu cho người dùng duyệt phong cách trước khi làm cả bài")
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
        dur = (placed[i][2] - placed[i][1]) / fmt["fps"]
        if voice and dur < 1.2:
            canh.append(f"{tag}: chỉ {dur:.1f} s — cảnh quá ngắn để đọc, gộp vào cảnh bên cạnh")
        # thời gian đọc: 0,5 s + 0,3 s/từ cho chữ cần đọc
        # cảnh hiện LẦN LƯỢT từng mục (mỗi phách một thẻ/ảnh): chỉ tính mục dài nhất + phần chữ cố định, không cộng dồn
        seq = {"CardCycle": "items", "CardMontage": "cards", "Ladder": "climb"}.get(s["type"])
        if seq and isinstance(s["props"].get(seq), list):
            fixed = {k: v for k, v in s["props"].items() if k not in (seq, "fan")}
            longest = max((sum(len(t.split()) for t in texts(it)) for it in s["props"][seq]), default=0)
            words = sum(len(t.split()) for t in texts(fixed)) + longest
        else:
            # khối căn cứ / nguồn (PosterEnd.sources, PosterLaw.source) là chữ tra cứu như phần ghi công, không tính vào thời gian đọc
            body = {k: v for k, v in s["props"].items() if k not in ("sources", "source", "sourcesLabel")} if s["type"].startswith("Poster") else s["props"]
            words = sum(len(t.split()) for t in texts(body))
        need = 0.5 + 0.3 * words
        if need > dur * 1.15:
            canh.append(f"{tag}: {words} chữ cần ~{need:.1f} s để đọc nhưng cảnh dài {dur:.1f} s → bớt chữ hoặc thêm ô nhịp")
        for t in texts(s["props"]):
            low = t.lower()
            for w in SAO:
                if w in low:
                    canh.append(f"{tag}: từ sáo '{w.strip()}' trong \"{t[:50]}\"")
        # nhãn (kicker) = 1–3 từ IN HOA rút từ lời, không chép nguyên cụm lời
        kk = s["props"].get("kicker")
        poster = s["type"].startswith("Poster")
        if isinstance(kk, str) and len(kk.split()) > (7 if poster else 3):
            canh.append(f"{tag}: nhãn \"{kk}\" dài {len(kk.split())} từ — nhãn nên {'≤ 7' if poster else '1–3'} từ (vd. \"CĂN CỨ\", \"HẬU QUẢ\")")
        if poster:
            # chữ Anton tự co cho vừa bề ngang: dòng càng dài chữ càng nhỏ → tách dòng thay vì nhồi
            big = [ln.get("text", "") if isinstance(ln, dict) else str(ln) for ln in (s["props"].get("lines") or [])]
            big += [s["props"].get(k, "") for k in ("title", "word")] + [x.get("label", "") for x in (s["props"].get("steps") or [])]
            big += [(s["props"].get(k) or {}).get("label", "") for k in ("left", "right")]
            for ln in big:
                ln = re.sub(r"^\[|\]$", "", ln or "")
                if len(ln) > POSTER_MAX_CH:
                    canh.append(f"{tag}: dòng áp phích \"{ln}\" dài {len(ln)} ký tự (> {POSTER_MAX_CH}) — chữ sẽ co nhỏ; tách thành hai dòng hoặc rút gọn")
            if s["type"] == "PosterLaw":
                q = s["props"].get("quote", "")
                if "[" not in q:
                    canh.append(f"{tag}: quote chưa đánh dấu [cụm cần tô] — người xem không biết nhìn vào đâu")
                if not s["props"].get("source"):
                    loi.append(f"{tag}: PosterLaw thiếu source (tên văn bản, khoản) — trích luật phải có nguồn")
            if s["type"] == "PosterEnd" and re.search(r"luật|điều \d|nghị định|thông tư", json.dumps(sb, ensure_ascii=False).lower()) and not s["props"].get("sources"):
                canh.append(f"{tag}: video có nội dung pháp luật nhưng thẻ kết thiếu sources (số hiệu văn bản, điều khoản, hiệu lực)")
            hits = s["props"].get("hits") or []
            if s["type"] in ("PosterVerdict", "PosterLaw") and not hits:
                canh.append(f"{tag}: cú nện / đóng dấu chưa ghi vào props.hits — khung sẽ không rung, không chớp đúng lúc")
        for ln in s["props"].get("lines", []) if isinstance(s["props"].get("lines"), list) else []:
            txt = ln.get("text", "") if isinstance(ln, dict) else str(ln)  # PosterEnd.lines là mảng chuỗi
            if len(txt.split()) > 6:
                canh.append(f"{tag}: dòng tiêu đề > 6 chữ: \"{txt}\"")
        # asset tồn tại
        for m in re.findall(r'"(?:src|image|poster)":\s*"([^"]+)"', json.dumps(s["props"], ensure_ascii=False)):
            if not m.startswith("http") and not os.path.exists(os.path.join(root, "public", m)):
                loi.append(f"{tag}: thiếu asset public/{m}")
        seen_types.append(s["type"])
    if sb["scenes"] and sb["scenes"][0]["type"] in ("LogoReveal", "EndCard"):
        canh.append("khung đầu là logo — khung 0 là ảnh bìa/hook: mở bằng câu hỏi, kết quả hoặc nỗi đau của người xem")
    if sb["scenes"] and sb["scenes"][-1]["type"] not in ("EndCard", "PosterEnd"):
        canh.append("không kết bằng EndCard / PosterEnd (dấu thương hiệu hoặc câu nhớ + kêu gọi giữ 2–3 s)")
    for t in set(seen_types):
        if seen_types.count(t) > 2:
            canh.append(f"loại cảnh {t} dùng {seen_types.count(t)} lần — các cảnh giống nhau vào giống nhau là dấu hiệu máy tạo")
    if not sb.get("cues"):
        canh.append("không có hiệu ứng âm thanh (cues) — mỗi hành động thấy được nên có tiếng, ít mà đúng")
    nhip = "đồng hồ = giọng đọc" if voice else f"{bars} ô · {mu['bpm']} BPM"
    print(f"{sb.get('title', '')}: {len(sb['scenes'])} cảnh · {nhip} · {secs:.1f} s · {fmt['width']}×{fmt['height']}@{fmt['fps']}")
    for x in loi:
        print("  LỖI:", x)
    for x in canh:
        print("  CẢNH BÁO:", x)
    print("XANH" if not loi else f"ĐỎ ({len(loi)} lỗi)")
    sys.exit(1 if loi else 0)


if __name__ == "__main__":
    main()
