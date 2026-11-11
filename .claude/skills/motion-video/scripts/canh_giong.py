#!/usr/bin/env python3
"""Khớp kịch bản vào file giọng đọc → mốc giây của từng câu và TỪNG TỪ (chế độ "giọng đọc là đồng hồ").

  python3 scripts/canh_giong.py <dự án> <giọng.mp3|wav> <kich_ban.json> [--model small] [--uoc-luong]

kich_ban.json: [["a1", "Câu thứ nhất."], ["a2", "Câu thứ hai."], ["b1", "Cảnh mới…"], …]
  id = <chữ cái cảnh><số>; mỗi mục đúng một câu, viết y như giọng đọc (kể cả số: "hai nghìn mười lăm" hay "2015").

Ghi:
  public/voice/voice.wav  — giọng đã chuẩn hoá (48 kHz, mono) để Remotion phát
  src/giong.json          — {"engine", "sentences":[{id,text,start,end,match,words:[{w,t,end}]}]}
In bảng câu → giây → % khớp. Câu khớp < 50 % = giọng đọc khác kịch bản → hỏi lại người dùng, đừng đoán.

Nhận dạng giọng (lấy mốc từ): faster-whisper (`pip install faster-whisper`, mô hình tải từ huggingface.co lần đầu),
không có thì openai-whisper. `--uoc-luong` hoặc không có cả hai: chia theo khoảng lặng + độ dài ký tự (lệch vài trăm ms —
chỉ để dựng nháp, phải báo người dùng).
"""
import difflib
import json
import os
import re
import subprocess
import sys
import unicodedata


def norm(w):
    """Chuẩn hoá một từ để so: chữ thường, NFC, bỏ dấu câu. Trả thêm bản bỏ dấu thanh để chịu lỗi nhận dạng."""
    w = unicodedata.normalize("NFC", w.lower())
    w = re.sub(r"[^\w]", "", w)
    khong_dau = "".join(c for c in unicodedata.normalize("NFD", w) if unicodedata.category(c) != "Mn").replace("đ", "d")
    return w, khong_dau


def tach_tu(s):
    return [t for t in re.split(r"\s+", s.strip()) if norm(t)[0]]


def pcm16k(wav):
    """Giải mã bằng ffmpeg → mảng float32 16 kHz (tránh lỗi lệch phiên bản thư viện `av` của faster-whisper)."""
    import numpy as np

    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", wav, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def asr_faster(wav, model):
    from faster_whisper import WhisperModel

    m = WhisperModel(model, device="cpu", compute_type="int8")
    segs, _ = m.transcribe(pcm16k(wav), language="vi", word_timestamps=True, vad_filter=True, beam_size=5)
    return [(w.word.strip(), w.start, w.end) for s in segs for w in (s.words or []) if w.word.strip()]


def asr_openai(wav, model):
    import whisper

    r = whisper.load_model(model).transcribe(pcm16k(wav), language="vi", word_timestamps=True)
    return [(w["word"].strip(), w["start"], w["end"]) for s in r["segments"] for w in s.get("words", []) if w["word"].strip()]


def khoang_noi(wav, dur):
    """Các khoảng có tiếng nói (ffmpeg silencedetect) — dùng cho chế độ ước lượng."""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", wav, "-af", "silencedetect=noise=-35dB:d=0.25", "-f", "null", "-"], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r)]
    out, cur = [], 0.0
    for a, z in zip(st, en + [dur] * (len(st) - len(en))):
        if a - cur > 0.15:
            out.append((cur, a))
        cur = z
    if dur - cur > 0.15:
        out.append((cur, dur))
    return out or [(0.0, dur)]


def uoc_luong(script, wav, dur):
    """Không có nhận dạng: rải từ theo tỉ lệ ký tự trên các khoảng có tiếng."""
    vung = khoang_noi(wav, dur)
    tong = sum(z - a for a, z in vung)
    tu = [w for _, s in script for w in tach_tu(s)]
    nang = [len(norm(w)[0]) + 1 for w in tu]
    k = tong / max(1, sum(nang))
    out, vi, pos = [], 0, vung[0][0]
    for w, n in zip(tu, nang):
        d = n * k
        while vi < len(vung) - 1 and pos + d > vung[vi][1] + 1e-6:
            vi += 1
            pos = vung[vi][0]
        out.append((w, pos, pos + d))
        pos += d
    return out


def canh(script, asr):
    """Khớp chuỗi từ kịch bản với chuỗi từ nhận dạng; từ không khớp nội suy theo hàng xóm."""
    tu = [(sid, w) for sid, s in script for w in tach_tu(s)]
    a = [norm(w)[1] for _, w in tu]
    b = [norm(w)[1] for w, _, _ in asr]
    t0 = [None] * len(tu)
    t1 = [None] * len(tu)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            t0[blk.a + k] = asr[blk.b + k][1]
            t1[blk.a + k] = asr[blk.b + k][2]
    khop = [x is not None for x in t0]
    # nội suy: đoạn từ chưa khớp nằm giữa hai từ đã khớp → chia đều theo ký tự
    n = len(tu)
    dau = asr[0][1] if asr else 0.0
    cuoi = asr[-1][2] if asr else 0.0
    i = 0
    while i < n:
        if t0[i] is not None:
            i += 1
            continue
        j = i
        while j < n and t0[j] is None:
            j += 1
        lo = t1[i - 1] if i > 0 else dau
        hi = t0[j] if j < n else cuoi
        w = [len(norm(tu[k][1])[0]) + 1 for k in range(i, j)]
        s, acc = sum(w), 0
        for k in range(i, j):
            t0[k] = lo + (hi - lo) * acc / s
            acc += w[k - i]
            t1[k] = lo + (hi - lo) * acc / s
        i = j
    cau = []
    for sid, text in script:
        idx = [k for k, (s2, _) in enumerate(tu) if s2 == sid]
        if not idx:
            continue
        cau.append({
            "id": sid,
            "text": text,
            "start": round(t0[idx[0]], 3),
            "end": round(t1[idx[-1]], 3),
            "match": round(sum(khop[k] for k in idx) / len(idx), 2),
            "words": [{"w": tu[k][1], "t": round(t0[k], 3), "end": round(t1[k], 3)} for k in idx],
        })
    return cau


def main():
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    if len(args) < 3:
        print(__doc__)
        sys.exit(1)
    proj, voice, kb = args
    model = sys.argv[sys.argv.index("--model") + 1] if "--model" in sys.argv else os.environ.get("MV_ASR_MODEL", "small")
    script = json.load(open(kb, encoding="utf-8"))
    ids = [s[0] for s in script]
    if len(set(ids)) != len(ids):
        sys.exit("kich_ban.json có id trùng")
    for sid in ids:
        if not re.fullmatch(r"[a-z]\d+", sid):
            sys.exit(f"id '{sid}' phải dạng <chữ cái><số>, vd. a1, b3")

    os.makedirs(os.path.join(proj, "public", "voice"), exist_ok=True)
    wav = os.path.join(proj, "public", "voice", "voice.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", voice, "-ac", "1", "-ar", "48000", wav], check=True)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav], capture_output=True, text=True, check=True).stdout)

    asr, engine = None, "uoc-luong"
    if "--uoc-luong" not in sys.argv:
        for name, fn in (("faster-whisper", asr_faster), ("openai-whisper", asr_openai)):
            try:
                asr, engine = fn(wav, model), f"{name}:{model}"
                break
            except ImportError:
                continue
    if asr is None:
        print("! Không có faster-whisper/openai-whisper → ƯỚC LƯỢNG theo khoảng lặng + ký tự (lệch vài trăm ms). Báo người dùng.")
        asr = uoc_luong(script, wav, dur)
    cau = canh(script, asr)
    if engine == "uoc-luong":
        for c in cau:
            c["match"] = 0.0  # không có nhận dạng → không có từ nào "khớp thật"
    out = os.path.join(proj, "src", "giong.json")
    json.dump({"engine": engine, "duration": round(dur, 3), "sentences": cau}, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    print(f"{engine} · giọng {dur:.2f} s · {len(cau)} câu → {out}")
    yeu = 0
    for c in cau:
        flag = "  (ước lượng)" if engine == "uoc-luong" else "" if c["match"] >= 0.5 else "  ← KHỚP KÉM: giọng đọc khác kịch bản?"
        yeu += bool(flag)
        print(f"  {c['id']:>4}  {c['start']:7.2f}–{c['end']:7.2f} s  {int(c['match'] * 100):3d}%  {c['text'][:60]}{flag}")
    if engine != "uoc-luong":
        print("Đọc lại tên riêng, số, từ tiếng Anh: nhận dạng hay nghe khác chữ; mốc các từ đó được nội suy từ từ lân cận.")
    sys.exit(1 if yeu else 0)  # ước lượng không tính là lỗi, nhưng kiem_tra_storyboard sẽ cảnh báo


if __name__ == "__main__":
    main()
