#!/usr/bin/env python3
"""Đo nhịp một bài nhạc để dựng video khớp phách: BPM, phách đầu, cụm nhạc, chỗ bass tắt.

  python3 scripts/do_nhip.py <file nhạc|bản nghe thử> [--bpm 111] [--json out.json]

Đọc mọi định dạng ffmpeg đọc được (mp3, m4a, wav…). Chỉ cần numpy + ffmpeg.
Cách làm: spectral flux (onset) → tự tương quan để tìm tempo (ưu tiên 70–180 BPM, in kèm ứng viên nửa/gấp đôi),
pha phách = độ lệch làm tổng onset trên lưới lớn nhất; năng lượng dải trầm (< 150 Hz) theo từng phách để tìm
"bass tắt" (≥ 60 % thấp hơn trung vị) → khoảng cách giữa các lần tắt = độ dài cụm (ô nhịp).
Kết quả là ƯỚC LƯỢNG: luôn nghe/so lại với bài thật; bản nghe thử 30 s chỉ phản ánh đoạn đó của bài.
"""
import json
import subprocess
import sys

import numpy as np

SR = 22050


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(float) / 32768


def analyse(x, bpm_fixed=None):
    hop, n = 256, 1024
    frames = np.lib.stride_tricks.sliding_window_view(x, n)[::hop] * np.hanning(n)
    S = np.log1p(10 * np.abs(np.fft.rfft(frames, axis=1)))
    # onset toàn dải + onset dải trầm (trống kick/808, ~0–260 Hz) — dải trầm chống nhầm tempo do hi-hat chùm ba
    def norm(v):
        return (v - v.mean()) / (v.std() + 1e-9)
    full = norm(np.maximum(0, np.diff(S, axis=0)).sum(1))
    lowf = norm(np.maximum(0, np.diff(S[:, :12], axis=0)).sum(1))
    flux = 0.5 * full + 0.5 * lowf
    fps = SR / hop
    ac = np.correlate(flux, flux, "full")[len(flux) - 1 :]
    cands = []
    for bpm in np.arange(60, 200, 0.25):
        i = int(round(60 / bpm * fps))
        if 4 * i >= len(ac):
            continue
        score = ac[i] + 0.5 * ac[2 * i] + 0.25 * ac[4 * i]
        score *= 1.0 if 70 <= bpm <= 180 else 0.85  # vùng tempo nhạc nền phổ biến
        cands.append((score, bpm))
    cands.sort(reverse=True)
    bpm = bpm_fixed or cands[0][1]
    per = 60 / bpm * fps
    phases = np.arange(0, per, 0.25)
    # pha phách tính trên onset TOÀN DẢI (808 hay đánh lệch phách, dùng dải trầm sẽ lệch nửa phách)
    ph = max(phases, key=lambda p: full[np.round(np.arange(p, len(full) - per, per)).astype(int)].sum())
    t0 = ph / fps
    beat = 60 / bpm
    # năng lượng dải trầm theo phách
    low = []
    k = 0
    while t0 + (k + 1) * beat < len(x) / SR:
        seg = x[int((t0 + k * beat) * SR) : int((t0 + (k + 1) * beat) * SR)]
        F = np.abs(np.fft.rfft(seg))
        f = np.fft.rfftfreq(len(seg), 1 / SR)
        low.append(float(np.sqrt((F[(f >= 20) & (f < 150)] ** 2).sum()) / max(1, len(seg))))
        k += 1
    low = np.array(low)
    med = np.median(low) if len(low) else 0
    # phách "bass tắt": thấp hơn 40 % trung vị VÀ bass trở lại trong ≤ 3 phách (loại đoạn lắng/kết bài)
    quiet = [i for i, v in enumerate(low) if med and v < 0.4 * med and any(j < len(low) and low[j] > 0.8 * med for j in range(i + 1, i + 4))]
    # gom các phách tắt liền nhau thành một "khoảng bass tắt"
    gaps = []
    for i in quiet:
        if gaps and i == gaps[-1][1] + 1:
            gaps[-1][1] = i
        else:
            gaps.append([i, i])
    # phách mạnh: khoảng tắt thường kết thúc ngay trước phách đầu một ô → căn ô nhịp theo đó
    downbeat_shift = ((gaps[0][1] + 1) % 4) if gaps else 0
    phrase = None
    if len(gaps) >= 2:
        d = [x for x in (np.diff([g[1] + 1 for g in gaps]) / 4) if x >= 2]
        if d:
            vals, cnt = np.unique(np.round(d), return_counts=True)
            phrase = float(vals[np.argmax(cnt)])
    return {
        "bpm": float(bpm),
        "ung_vien_bpm": [float(b) for _, b in cands[:5]],
        "nua_gap_doi": [float(bpm / 2), float(bpm * 2)],
        "ty_le_3_2": [round(float(bpm) * 2 / 3, 2), round(float(bpm) * 3 / 2, 2)],
        "giay_moi_phach": round(beat, 4),
        "phach_dau_giay": round(t0, 3),
        "phach_manh_dau_giay": round(t0 + downbeat_shift * beat, 3),
        "khoang_bass_tat": [{"tu_phach": g[0], "den_phach": g[1], "so_phach": g[1] - g[0] + 1, "giay": round(t0 + g[0] * beat, 2)} for g in gaps],
        "cum_o_nhip_uoc_luong": phrase,
        "so_phach_phan_tich": int(len(low)),
    }


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    fixed = float(sys.argv[sys.argv.index("--bpm") + 1]) if "--bpm" in sys.argv else None
    r = analyse(load(sys.argv[1]), fixed)
    print(f"BPM {'(đặt tay) ' if fixed else '≈ '}{r['bpm']} (ứng viên {r['ung_vien_bpm'][:3]}; nửa/gấp đôi {r['nua_gap_doi']}; 2/3 và 3/2 {r['ty_le_3_2']})")
    print("  → Đối chiếu BPM với cơ sở dữ liệu công khai (Tunebat, songbpm). Nhịp lệch phách/chùm ba dễ bị nhận 2/3 hoặc 3/2; khi đã biết BPM thật: --bpm <số>.")
    print(f"Phách đầu {r['phach_dau_giay']} s · phách mạnh đầu (theo chỗ bass tắt) {r['phach_manh_dau_giay']} s")
    for g in r["khoang_bass_tat"]:
        print(f"  bass tắt: phách {g['tu_phach']}–{g['den_phach']} ({g['so_phach']} phách) lúc {g['giay']} s")
    print(f"Cụm nhạc ≈ {r['cum_o_nhip_uoc_luong']} ô nhịp" if r["cum_o_nhip_uoc_luong"] else "Chưa đủ dữ liệu để ước lượng cụm nhạc (cần ≥ 2 chỗ bass tắt).")
    if "--json" in sys.argv:
        out = sys.argv[sys.argv.index("--json") + 1]
        with open(out, "w", encoding="utf-8") as f:
            json.dump(r, f, ensure_ascii=False, indent=1)
        print("Đã ghi", out)


if __name__ == "__main__":
    main()
