"""Tổng hợp nhạc nền phong cách phonk cho video giới thiệu — tự tạo 100% bằng code, không dùng sample của ai.

  python3 scripts/phonk.py public/music/phonk.wav

150 BPM, nhịp half-time, 20 ô nhịp = 32 giây (khớp 960 khung hình ở 30 fps: 1 phách = 12 khung, 1 ô = 48 khung).
Bố cục: ô 0–1 intro (cowbell lọc + riser) → ô 2 "drop" → ô 2–17 đủ trống → ô 18–19 outro.
Âm sắc học theo kiểu máy trống TR-808 (cowbell = 2 sóng vuông ~1:1,48; 808 = sine trượt cao độ + méo tanh).
Chỉ cần numpy.
"""
import sys
import wave

import numpy as np

SR = 44100
BPM = 150
BEAT = 60 / BPM
STEP = BEAT / 4  # nốt móc kép
BAR = BEAT * 4
BARS = 20
N = int(SR * BAR * BARS)
rng = np.random.default_rng(7)


def t(sec):
    return np.arange(int(SR * sec)) / SR


def onepole_lp(x, cutoff):
    """Lọc thông thấp một cực; cutoff có thể là số hoặc mảng (Hz) để quét."""
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def hp(x, cutoff):
    return x - onepole_lp(x, cutoff)


def add(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    buf[0, i : i + len(sig)] += sig * l * np.sqrt(2)
    buf[1, i : i + len(sig)] += sig * r * np.sqrt(2)


# ---------- nhạc cụ ----------
_cow_cache = {}


def cowbell(semi):
    if semi in _cow_cache:
        return _cow_cache[semi]
    f = 588 * 2 ** (semi / 12)
    tt = t(0.42)
    sq = np.sign(np.sin(2 * np.pi * f * tt)) + np.sign(np.sin(2 * np.pi * f * 1.48 * tt))
    sq = hp(onepole_lp(sq, 2600), 420)
    env = np.where(tt < 0.012, tt / 0.012, 1) * (0.55 * np.exp(-tt / 0.03) + 0.45 * np.exp(-tt / 0.16))
    _cow_cache[semi] = np.tanh(1.6 * sq * env) * 0.5
    return _cow_cache[semi]


def bass808(semi, dur):
    f = 49 * 2 ** (semi / 12)  # G1
    tt = t(dur)
    freq = f * (1 + 1.4 * np.exp(-tt / 0.03))
    ph = 2 * np.pi * np.cumsum(freq) / SR
    env = np.exp(-tt / (dur * 0.55)) * np.minimum(1, (dur - tt) / 0.02 + 0.0)
    env = np.clip(env, 0, 1)
    return np.tanh(3.2 * np.sin(ph) * env) * 0.62


def kick():
    tt = t(0.25)
    freq = 55 + 160 * np.exp(-tt / 0.018)
    ph = 2 * np.pi * np.cumsum(freq) / SR
    click = rng.standard_normal(len(tt)) * np.exp(-tt / 0.002) * 0.4
    return np.tanh(2.5 * (np.sin(ph) * np.exp(-tt / 0.07) + click)) * 0.7


def clap():
    tt = t(0.35)
    nz = hp(rng.standard_normal(len(tt)), 900)
    env = np.zeros_like(tt)
    for k, d in enumerate([0, 0.011, 0.022]):
        m = tt >= d
        env[m] += np.exp(-(tt[m] - d) / (0.007 if k < 2 else 0.11))
    tone = np.sin(2 * np.pi * 190 * tt) * np.exp(-tt / 0.05) * 0.5
    return np.tanh(1.4 * (nz * env * 0.6 + tone)) * 0.55


def hat(open_=False):
    tt = t(0.32 if open_ else 0.06)
    nz = hp(hp(rng.standard_normal(len(tt)), 6000), 6000)
    return nz * np.exp(-tt / (0.09 if open_ else 0.014)) * 0.33


def riser(sec):
    tt = t(sec)
    nz = rng.standard_normal(len(tt))
    cut = 300 * (40 ** (tt / sec))
    return onepole_lp(nz, cut) * (tt / sec) ** 2 * 0.5


def pad(semis, sec):
    tt = t(sec)
    s = np.zeros_like(tt)
    for sm in semis:
        f = 196 * 2 ** (sm / 12)
        for det in (-0.35, 0.35):
            s += np.sin(2 * np.pi * (f + det) * tt + rng.uniform(0, 6))
    env = np.minimum(1, tt / 0.6) * np.minimum(1, (sec - tt) / 0.6)
    return s / (len(semis) * 2) * env * 0.22


def impact():
    tt = t(1.4)
    boom = np.sin(2 * np.pi * (40 + 60 * np.exp(-tt / 0.05)) * tt) * np.exp(-tt / 0.45)
    nz = onepole_lp(rng.standard_normal(len(tt)), 1800) * np.exp(-tt / 0.25)
    return np.tanh(2 * (boom + nz * 0.5)) * 0.6


# ---------- bản phối ----------
COW = [  # 2 ô nhịp, (bước 16tel, bán cung)
    {0: 0, 3: 0, 6: 3, 8: 0, 10: 7, 12: 5, 14: 3},
    {0: 0, 3: 0, 6: 3, 8: 10, 10: 7, 12: 5, 13: 3, 14: 2},
]
BASS = [  # (bước, bán cung, độ dài theo bước)
    [(0, 0, 6), (6, 0, 4), (10, 3, 6)],
    [(0, -4, 6), (6, -4, 4), (10, -2, 4), (14, 0, 2)],
]

drums = np.zeros((2, N))
music = np.zeros((2, N))
duck = np.ones(N)

for bar in range(BARS):
    b0 = bar * BAR
    full = 2 <= bar <= 17
    outro = bar >= 18
    # cowbell: intro lọc tối, sau drop sáng; vang bằng delay chấm 3/16 sang phải
    for step, semi in COW[bar % 2].items():
        if outro and bar == 19 and step > 8:
            continue
        sig = cowbell(semi)
        if bar < 2:
            sig = onepole_lp(sig, 900 + 900 * bar)
        g = 0.85 if full else 0.6
        at = b0 + step * STEP
        add(music, sig, at, g, -0.15)
        add(music, sig, at + 3 * STEP, g * 0.32, 0.6)
        add(music, sig, at + 6 * STEP, g * 0.12, -0.6)
    if full or bar == 18:
        for step, semi, ln in BASS[bar % 2]:
            at = b0 + step * STEP
            add(drums, bass808(semi, ln * STEP), at, 1.0)
            add(drums, kick(), at, 0.9)
            i = int(at * SR)
            k = np.linspace(0.45, 1, int(0.18 * SR)) ** 1.5
            duck[i : i + len(k)] = np.minimum(duck[i : i + len(k)], k[: N - i])
        if bar != 18:
            add(drums, clap(), b0 + 8 * STEP, 1.0)
            # hi-hat 16tel, cuối mỗi 2 ô có cuộn chùm ba
            for s in range(16):
                if bar % 2 == 1 and s >= 12:
                    continue
                add(drums, hat(open_=(s == 14 and bar % 4 == 0)), b0 + s * STEP, 0.7 if s % 2 else 1.0, 0.35 if s % 2 else -0.25)
            if bar % 2 == 1:
                for k3 in range(6):
                    add(drums, hat(), b0 + 12 * STEP + k3 * (BEAT / 6), 0.55 + 0.08 * k3, 0.2)
        # khoảng lặng trước mỗi đoạn: bỏ trống nửa ô 9 và 13 (giật nhịp)
    if bar in (9, 13):
        i0, i1 = int((b0 + 12 * STEP) * SR), int((b0 + BAR) * SR)
        drums[:, i0:i1] *= 0.15

# intro: pad tối + riser vào drop, cú "impact" đúng drop và ở CTA
add(music, pad([0, 3, 7, -12], BAR * 2 + 0.3), 0, 1.0)
add(music, riser(BAR * 1.5), BAR * 0.5, 0.8)
add(music, impact(), BAR * 2, 1.0)
add(music, impact(), BAR * 17, 0.7)
add(music, pad([0, 3, 7, 10], BAR * 3), BAR * 17, 0.8)

mix = drums + music * duck
mix = np.tanh(mix * 0.7)
fade = np.ones(N)
fl = int(SR * 1.2)
fade[-fl:] = np.linspace(1, 0, fl) ** 2
mix *= fade
mix /= np.max(np.abs(mix)) / 0.89  # đỉnh ≈ -1 dBFS

out = sys.argv[1] if len(sys.argv) > 1 else "phonk.wav"
pcm = (mix.T * 32767).astype(np.int16)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"Đã ghi {out}: {N / SR:.1f}s, {BPM} BPM, {BARS} ô nhịp")
