"""Sinh giọng clone "v5b" cho mọi câu app đọc (giọng kênh kiến thức xã hội — đã được phép, web phi thương mại).

Mỗi câu:
  1. chuẩn hoá cách đọc (vi_norm: số, số hiệu văn bản, chữ viết tắt → chữ);
  2. VieNeu-TTS v3 Turbo (Apache-2.0, ONNX/CPU) clone từ voice/ref.wav, phong cách "tin tức", nhiệt độ 0,5;
  3. KHÂU CHẶN LỖI: Whisper small nghe lại, so với câu gốc (sai chữ) + độ giống giọng mẫu (Resemblyzer).
     Không đạt → sinh lại (tối đa TRIES lần), giữ bản tốt nhất; vẫn không đạt → ghi cờ trong báo cáo để người nghe lại;
     câu ngắn/hay gặp ("Chính xác.") luôn sinh BEST_OF bản, chọn bản tốt nhất;
  4. hậu kỳ v5b: VoiceFixer (phục hồi, mở dải tần) → EQ cố định voice/eq.json → chuỗi phòng thu ấm/dày → chuẩn độ lớn.
Tên tệp = textKey(câu GỐC) như gen.py/app. Chạy lại chỉ sinh câu thiếu (manifest cùng STYLE).

  pip install -r tools/tts/requirements-clone.txt && pip install --no-deps voicefixer==0.1.3   (+ ffmpeg)
  python tools/tts/clone.py plan  --texts .tts-texts.json --cache .tts-cache --shards 20 --out plan   # chia việc
  python tools/tts/clone.py run   --todo plan/shard-3.json --onnx-dir models/vieneu --out out-3      # một máy
  python tools/tts/clone.py merge --cache .tts-cache --texts .tts-texts.json --parts 'out-*'        # gộp + manifest + báo cáo
  python tools/tts/clone.py run   --text "Chính xác." --onnx-dir models/vieneu --out /tmp/thu       # thử một câu
"""
import argparse, glob, json, os, re, shutil, subprocess, sys, tempfile, time, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from vi_norm import normalize  # noqa: E402
from gen import FIXED, collect, norm, text_key  # noqa: E402

# Đổi bất kỳ tham số giọng nào dưới đây → đổi STYLE để lần chạy sau sinh lại TOÀN BỘ (không lẫn hai kiểu trong một lời).
STYLE = 'v5b'
VOICE = 'clone:kienthucxahoi0'
STYLE_ID = 17          # VieNeu v3: 16 tự nhiên · 17 tin tức · 18 đọc truyện
TEMPERATURE = 0.5
MAX_CHARS = 90         # VieNeu tự chia câu dài theo dấu câu
TRIES = 4              # số lần sinh tối đa cho câu thường
MIN_TAKES = 2          # luôn sinh ít nhất 2 bản để chọn bản biểu cảm hơn (ngữ điệu lên xuống rõ hơn)
EXPRESS = 0.03         # trọng số độ lên xuống giọng (bán âm) khi chọn giữa các bản đã đạt
BEST_OF = 5            # câu ngắn/hay gặp: luôn sinh đủ, chọn bản tốt nhất
SHORT_WORDS = 4
SHORT_CHECK = 8        # câu dưới 8 từ: kiểm tra bằng Whisper medium
SIM_MIN = 0.75         # độ giống tối thiểu so với voice/ref.wav (đầu ra thô, chưa hậu kỳ)
OUT_SR = 44100
PRE_LUFS = -16.0       # độ lớn vào chuỗi phòng thu (đo: −16 cho chất âm bằng bản v5b đã duyệt, −13 làm nén quá tay)
TARGET_LUFS = -16.0    # độ lớn cuối của MỌI câu (chuẩn podcast; câu ghép liền nhau không to nhỏ thất thường)
BITRATE = '64k'
EDGE = 0.03            # giữ 30 ms hai đầu khi cắt im lặng (app tự chèn khoảng nghỉ giữa câu)


# ───────────── hàm thuần (có test: tools/tts/test_clone.py) ─────────────

TONES = {'\u0300', '\u0301', '\u0303', '\u0309', '\u0323'}  # huyền, sắc, ngã, hỏi, nặng


def sound(w: str) -> str:
    """So theo ÂM, không theo chữ viết: dấu thanh đặt kiểu cũ/mới như nhau (hoạ = họa);
    giọng Bắc đọc x = s, tr = ch, d = gi = r nên Whisper không phân biệt được."""
    d = unicodedata.normalize('NFD', w)
    w = unicodedata.normalize('NFC', ''.join(c for c in d if c not in TONES)) + ''.join(c for c in d if c in TONES)
    for a, b in (('tr', 'ch'), ('gi', 'd'), ('x', 's'), ('r', 'd')):
        if w.startswith(a):
            return b + w[len(a):]
    return w


def words(text: str) -> list[str]:
    """Từ để so khớp: chuẩn hoá giống hệt lúc đọc (số → chữ), bỏ dấu câu, quy về âm đọc."""
    return [sound(w) for w in re.findall(r'\w+', normalize(text))]


def errors(hyp: str, ref: str) -> int:
    """Số lỗi từ (thêm/bớt/thay) giữa lời Whisper nghe được và câu gốc."""
    h, r = words(hyp), words(ref)
    d = list(range(len(h) + 1))
    for i, x in enumerate(r, 1):
        prev, d[0] = d[:], i
        for j, y in enumerate(h, 1):
            d[j] = min(prev[j] + 1, d[j - 1] + 1, prev[j - 1] + (x != y))
    return d[-1]


def allowed_errors(n_words: int) -> int:
    """Whisper small cũng nghe nhầm: câu dưới 6 từ phải đúng hết; từ 6 từ cho phép ~1 lỗi mỗi 12 từ (làm tròn)."""
    return 0 if n_words < 6 else (n_words + 6) // 12


NUMBER_WORDS = set('không một mốt hai ba bốn tư năm lăm sáu bảy tám chín mười mươi lẻ linh trăm nghìn ngàn triệu tỷ'.split())


def numbers_match(hyp: str, ref: str) -> bool:
    """Số điều, khoản, năm, tỷ lệ phải đọc đúng TUYỆT ĐỐI: dãy từ chỉ số của hai bên phải trùng nhau."""
    pick = lambda t: [w for w in re.findall(r'\w+', normalize(t)) if w in NUMBER_WORDS]
    return pick(hyp) == pick(ref)


def passes(c: dict, text: str) -> bool:
    n = len(words(text))
    # câu quá ngắn (< 2 giây) thì đo độ giống giọng không tin được: chỉ xét đúng chữ
    return c['err'] <= allowed_errors(n) and c.get('num', True) and (n < 6 or c['sim'] >= SIM_MIN)


def rank(c: dict, text: str) -> tuple:
    """Khoá sắp xếp (nhỏ hơn = tốt hơn). Bản đạt chặn lỗi: chọn bản giống giọng + biểu cảm hơn.
    Không bản nào đạt: ưu tiên đọc đúng số, rồi ít lỗi, rồi giống giọng."""
    if passes(c, text):
        return (0, 0, 0, -(c['sim'] + EXPRESS * c.get('pv', 0.0)))
    return (1, not c.get('num', True), c['err'], -c['sim'])


def best(cands: list[dict], text: str) -> dict:
    return min(cands, key=lambda c: rank(c, text))


def is_short(text: str) -> bool:
    return text in FIXED or len(words(text)) <= SHORT_WORDS


def shard_of(key: str, n: int) -> int:
    return int(key, 16) % n


def plan(texts: list[str], done: set[str], shards: int) -> list[list[str]]:
    """Chia câu chưa có tệp thành `shards` phần, cân theo độ dài (tổng ký tự) để các máy xong gần cùng lúc."""
    todo = sorted({text_key(t): t for t in texts if text_key(t) not in done}.values(), key=len, reverse=True)
    parts: list[list[str]] = [[] for _ in range(max(1, shards))]
    load = [0] * len(parts)
    for t in todo:
        i = load.index(min(load))
        parts[i].append(t)
        load[i] += len(t)
    return [p for p in parts if p]


SAMPLE_KINDS = [  # (tên, điều kiện) — mỗi loại một cái bẫy đọc khác nhau
    ('ngắn', lambda t: is_short(t)),
    ('điều-khoản', lambda t: re.search(r'\b(?:[Đđ]iều|[Kk]hoản|[Đđ]iểm)\s+\d', t)),
    ('dãy-số', lambda t: re.search(r'\b(?:[Đđ]iều|[Kk]hoản|[Đđ]iểm)\s+\w+\s*,\s*\w+', t)),
    ('số-hiệu', lambda t: re.search(r'\d+/\d{4}/|VBHN|\d+/[A-ZĐ]', t)),
    ('viết-tắt', lambda t: re.search(r'\b[A-ZĐ]{2,}\b', t)),
    ('ký-hiệu', lambda t: re.search(r'[=≥≤·+×%↔]|\d\s*[–-]\s*\d', t)),
    ('ngày-năm', lambda t: re.search(r'\d{1,2}/\d{1,2}/\d{4}|năm \d{4}', t)),
    ('câu-hỏi', lambda t: t.rstrip().endswith('?')),
    ('đáp-án', lambda t: t.startswith('Đáp án')),
    ('định-nghĩa-dài', lambda t: len(t) > 220),
    ('thường', lambda t: True),
]


def sample(texts: list[str], n: int, seed: int = 7) -> list[str]:
    """Mẫu thử có chủ đích: chia đều cho các loại câu khó (vòng tròn), mỗi câu chỉ chọn một lần."""
    import random
    rnd = random.Random(seed)
    pools = []
    for _, cond in SAMPLE_KINDS:
        pool = [t for t in texts if cond(t)]
        rnd.shuffle(pool)
        pools.append(pool)
    out, seen = [], set()
    while len(out) < n and any(pools):
        for pool in pools:
            while pool and pool[-1] in seen:
                pool.pop()
            if pool and len(out) < n:
                seen.add(pool[-1]); out.append(pool.pop())
    return out


def eq_gains(hz: list[float], db: list[float], freqs):
    """Nội suy đường cong EQ (theo log tần số) tại các tần số cho trước; ngoài dải thì giữ mức biên."""
    import numpy as np
    f = np.clip(np.asarray(freqs, dtype=float), hz[0], hz[-1])
    return np.interp(np.log(f), np.log(hz), db)


def peak_limit(x, sr: int, ceiling: float = 0.89):
    """Chặn đỉnh ở `ceiling` (≈ −1 dBFS) mà KHÔNG tự tăng âm lượng (Limiter của pedalboard/JUCE tự cộng thêm vài dB).
    Hệ số giảm = min trong cửa sổ ±4 ms rồi làm mượt ±2 ms → không méo, mọi mẫu ≤ ceiling."""
    import numpy as np
    from scipy.ndimage import minimum_filter1d, uniform_filter1d
    a = np.abs(x)
    if a.max(initial=0) <= ceiling:
        return x
    need = np.minimum(1.0, ceiling / np.maximum(a, 1e-9))
    w = max(1, int(0.002 * sr))
    g = uniform_filter1d(minimum_filter1d(need, size=4 * w + 1), size=2 * w + 1)
    return (x * np.minimum(g, need)).astype(x.dtype)


def trim(x, sr: int, threshold: float = 0.012):
    import numpy as np
    nz = np.where(np.abs(x) > threshold)[0]
    if not len(nz):
        return x[:0]
    k = int(EDGE * sr)
    return x[max(0, nz[0] - k): nz[-1] + 1 + k]


# ───────────── phần nặng (model) ─────────────

class Engine:
    def __init__(self, onnx_dir: str, threads: int = 4):
        import numpy as np
        import torch
        from faster_whisper import WhisperModel
        from resemblyzer import VoiceEncoder, preprocess_wav
        from vieneu import Vieneu
        from voicefixer import VoiceFixer
        from pedalboard import Pedalboard, HighpassFilter, LowShelfFilter, PeakFilter, HighShelfFilter, Compressor, Limiter, Gain
        import pyloudnorm, librosa, soundfile
        torch.set_num_threads(threads)
        self.np, self.librosa, self.sf, self.pre = np, librosa, soundfile, preprocess_wav
        self.tts = Vieneu(onnx_dir=onnx_dir, threads=threads)
        self.tts.engine.default_style_id = STYLE_ID
        emb, codes = self.tts.encode_reference(os.path.join(HERE, 'voice', 'ref.wav'))
        self.voice = {'speaker_emb': emb, 'codes': codes}
        # small cho câu dài (nhanh); medium cho câu ngắn — small hay nghe nhầm câu 1–2 giây, medium bắt được cả tiếng nói thừa cuối câu
        self.whisper = WhisperModel('small', device='cpu', compute_type='int8', cpu_threads=threads)
        self.whisper_short = WhisperModel('medium', device='cpu', compute_type='int8', cpu_threads=threads)
        self.enc = VoiceEncoder('cpu', verbose=False)
        ref, rsr = soundfile.read(os.path.join(HERE, 'voice', 'ref.wav'), dtype='float32')
        self.ref_emb = self.enc.embed_utterance(preprocess_wav(ref, source_sr=rsr))
        self.vf = VoiceFixer()
        with open(os.path.join(HERE, 'voice', 'eq.json'), encoding='utf-8') as fh:
            eq = json.load(fh)
        self.eq = (eq['hz'], eq['db'])
        # chuỗi phòng thu "E5" của bản v5b đã duyệt: ấm (low shelf), bớt đục 350 Hz, nén nhẹ, chặn đỉnh
        self.chain = Pedalboard([HighpassFilter(70), LowShelfFilter(160, 2.0, 0.7), PeakFilter(350, -1.0, 1.0), PeakFilter(3200, 0.0, 0.9),
                                 HighShelfFilter(8000, -0.5, 0.7), Compressor(-20, 2.0, 15, 150), Gain(1.5), Limiter(-1.0)])
        self.meter = pyloudnorm.Meter(OUT_SR, block_size=0.2)

    def synth(self, spoken: str):
        return self.tts.infer(spoken, voice=self.voice, temperature=TEMPERATURE, max_chars=MAX_CHARS, apply_watermark=False)

    def hear(self, w16, careful: bool) -> str:
        model = self.whisper_short if careful else self.whisper
        segs, _ = model.transcribe(w16, language='vi', beam_size=5 if careful else 1, condition_on_previous_text=False)
        return ' '.join(s.text for s in segs).strip()

    def recheck(self, c: dict, audio, text: str) -> dict:
        """Nghe lại lần hai bằng Whisper medium: tách lỗi do Whisper small nghe nhầm thuật ngữ khỏi lỗi đọc thật."""
        w16 = self.librosa.resample(self.np.asarray(audio, dtype=self.np.float32), orig_sr=self.tts.sample_rate, target_sr=16000)
        heard = self.hear(w16, True)
        return {**c, 'err': errors(heard, text), 'num': numbers_match(heard, text), 'heard': heard, 'rechecked': True}

    def score(self, audio, text: str) -> dict:
        np = self.np
        w16 = self.librosa.resample(np.asarray(audio, dtype=np.float32), orig_sr=self.tts.sample_rate, target_sr=16000)
        heard = self.hear(w16, len(words(text)) < SHORT_CHECK)
        sim = float(self.enc.embed_utterance(self.pre(w16, source_sr=16000)) @ self.ref_emb)
        return {'err': errors(heard, text), 'num': numbers_match(heard, text), 'sim': round(sim, 4), 'pv': self.pitch_var(w16), 'heard': heard}

    def pitch_var(self, w16) -> float:
        """Độ lên xuống giọng (độ lệch chuẩn cao độ, bán âm) trên các khung có tiếng — đo nhanh bằng YIN."""
        np, librosa = self.np, self.librosa
        f0 = librosa.yin(w16, fmin=70, fmax=400, sr=16000, frame_length=1024)
        rms = librosa.feature.rms(y=w16, frame_length=1024, hop_length=256)[0][: len(f0)]
        f = f0[: len(rms)][rms > 0.3 * rms.max()]
        return round(float(np.std(12 * np.log2(f / np.median(f)))), 3) if len(f) > 10 else 0.0

    def gain_to(self, x, lufs: float):
        np = self.np
        try:
            cur = self.meter.integrated_loudness(x)
        except ValueError:  # quá ngắn để đo LUFS: dùng RMS
            cur = 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9) - 3
        if not np.isfinite(cur):
            return x
        return (x * 10 ** ((lufs - cur) / 20)).astype(np.float32)

    def post(self, audio):
        np, librosa = self.np, self.librosa
        x = librosa.resample(np.asarray(audio, dtype=np.float32), orig_sr=self.tts.sample_rate, target_sr=OUT_SR)
        x = np.asarray(self.vf.restore_inmem(x, cuda=False, mode=0), dtype=np.float32).reshape(-1)
        n = len(x)
        spec = np.fft.rfft(x)
        spec *= 10 ** (eq_gains(*self.eq, np.fft.rfftfreq(n, 1 / OUT_SR) + 1e-3) / 20)  # EQ pha 0, không trễ
        x = np.fft.irfft(spec, n).astype(np.float32)
        x = self.gain_to(x, PRE_LUFS)
        y = self.chain(x[None], OUT_SR)[0]
        y = 0.97 * y + 0.03 * np.tanh(2 * y) / np.tanh(2)  # bão hoà rất nhẹ cho giọng dày
        y = trim(y, OUT_SR)  # cắt im lặng TRƯỚC khi đo độ lớn: câu ngắn hay dài đều cùng mức
        return peak_limit(self.gain_to(y, TARGET_LUFS), OUT_SR)

    def make(self, text: str) -> tuple[object, dict]:
        spoken = normalize(text)
        if not re.search(r'\w', spoken):  # mảnh câu không có gì để đọc ("VD11.", "(…)."): im lặng ngắn để cả lời vẫn dùng giọng clone
            return self.np.zeros(int(0.05 * OUT_SR), dtype=self.np.float32), {'text': text, 'spoken': spoken, 'tries': 0, 'ok': True, 'silent': True}
        short = is_short(text)
        cands = []
        for k in range(BEST_OF if short else TRIES):
            a = self.synth(spoken)
            c = self.score(a, text)
            c['k'] = k
            cands.append((c, a))
            if not short and k + 1 >= MIN_TAKES and any(passes(x, text) for x, _ in cands):
                break
        if not any(passes(x, text) for x, _ in cands) and len(words(text)) >= SHORT_CHECK:
            cands = [(self.recheck(x, a, text), a) for x, a in cands]
        c, a = min(cands, key=lambda p: rank(p[0], text))
        info = {'text': text, 'spoken': spoken, 'tries': len(cands), 'ok': passes(c, text), **{k: c[k] for k in ('err', 'num', 'sim', 'pv', 'heard')}, 'rechecked': c.get('rechecked', False)}
        return self.post(a), info


def write_mp3(y, path: str):
    import soundfile
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as fh:
        tmp = fh.name
    soundfile.write(tmp, y, OUT_SR, subtype='PCM_16')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-ac', '1', '-b:a', BITRATE, path + '.part.mp3'], check=True)
    os.replace(path + '.part.mp3', path)
    os.remove(tmp)


# ───────────── lệnh ─────────────

def load_texts(path: str | None) -> list[str]:
    texts = collect()
    if path and os.path.exists(path):
        with open(path, encoding='utf-8') as fh:
            extra = [norm(x) for x in json.load(fh) if isinstance(x, str) and norm(x)]
        seen = {text_key(x) for x in texts}
        texts += [x for x in extra if not (text_key(x) in seen or seen.add(text_key(x)))]
    return texts


def read_manifest(cache: str) -> dict:
    p = os.path.join(cache, 'manifest.json')
    if os.path.exists(p):
        with open(p, encoding='utf-8') as fh:
            return json.load(fh)
    return {}


def cmd_plan(a):
    texts = load_texts(a.texts)
    if a.limit:
        texts = texts[: a.limit]
    if a.sample:
        texts = sample(texts, a.sample)
    m = read_manifest(a.cache)
    same = m.get('style') == STYLE and m.get('voice') == VOICE
    done = {k for k in m.get('keys', []) if os.path.exists(os.path.join(a.cache, k + '.mp3'))} if same else set()
    parts = plan(texts, done, a.shards)
    os.makedirs(a.out, exist_ok=True)
    for i, p in enumerate(parts):
        with open(os.path.join(a.out, f'shard-{i}.json'), 'w', encoding='utf-8') as fh:
            json.dump(p, fh, ensure_ascii=False)
    chars = sum(len(t) for p in parts for t in p)
    print(f"{len(texts)} câu · đã có {len(done)}{'' if same else ' (kiểu giọng đổi → sinh lại toàn bộ)'} · cần sinh {sum(map(len, parts))} câu (~{chars / 20 / 3600:.1f} giờ âm thanh) · {len(parts)} phần")
    if a.github_output:
        with open(a.github_output, 'a') as fh:
            fh.write(f"shards={json.dumps(list(range(len(parts))))}\ncount={len(parts)}\n")


def cmd_run(a):
    texts = [a.text] if a.text else json.load(open(a.todo, encoding='utf-8'))
    if a.limit:
        texts = texts[: a.limit]
    os.makedirs(a.out, exist_ok=True)
    rep_path = os.path.join(a.out, 'report.jsonl')
    have = set()
    if os.path.exists(rep_path):  # làm tiếp sau khi bị ngắt
        with open(rep_path, encoding='utf-8') as fh:
            have = {json.loads(l)['key'] for l in fh if l.strip()}
    eng = Engine(a.onnx_dir, a.threads)
    t0, n = time.time(), 0
    with open(rep_path, 'a', encoding='utf-8') as rep:
        for t in texts:
            key = text_key(t)
            if key in have and os.path.exists(os.path.join(a.out, key + '.mp3')):
                continue
            try:
                y, info = eng.make(t)
                write_mp3(y, os.path.join(a.out, key + '.mp3'))
            except Exception as e:  # một câu lỗi không làm hỏng cả phần
                info = {'text': t, 'ok': False, 'error': str(e)[:200]}
            rep.write(json.dumps({'key': key, **info}, ensure_ascii=False) + '\n')
            rep.flush()
            n += 1
            if n % 25 == 0 or a.text:
                el = time.time() - t0
                print(f'{n}/{len(texts)} câu · {el / 60:.0f} phút · {"đạt" if info.get("ok") else "CỜ"}: {t[:60]}', flush=True)
            if a.deadline and time.time() - t0 > a.deadline * 60:
                print(f'hết giờ ({a.deadline} phút): dừng, phần còn lại để lần chạy sau', flush=True)
                break


def cmd_merge(a):
    texts = load_texts(a.texts)
    want = {text_key(t) for t in texts}
    m = read_manifest(a.cache)
    same = m.get('style') == STYLE and m.get('voice') == VOICE
    os.makedirs(a.cache, exist_ok=True)
    if not same:  # kiểu giọng đổi: bỏ toàn bộ tệp cũ để không lẫn giọng
        for f in glob.glob(os.path.join(a.cache, '*.mp3')):
            os.remove(f)
    old = {}
    rp = os.path.join(a.cache, 'report.json')
    if same and os.path.exists(rp):
        with open(rp, encoding='utf-8') as fh:
            old = {r['key']: r for r in json.load(fh).get('items', [])}
    for d in sorted(glob.glob(a.parts)):
        for f in glob.glob(os.path.join(d, '*.mp3')):
            shutil.copy2(f, os.path.join(a.cache, os.path.basename(f)))
        rj = os.path.join(d, 'report.jsonl')
        if os.path.exists(rj):
            with open(rj, encoding='utf-8') as fh:
                for l in fh:
                    if l.strip():
                        r = json.loads(l)
                        old[r['key']] = r
    for f in glob.glob(os.path.join(a.cache, '*.mp3')):  # dọn câu không còn dùng
        if os.path.basename(f)[:-4] not in want:
            os.remove(f)
    keys = sorted(k for k in want if os.path.exists(os.path.join(a.cache, k + '.mp3')))
    items = [old[k] for k in keys if k in old]
    flagged = [r for r in items if not r.get('ok')]
    with open(os.path.join(a.cache, 'manifest.json'), 'w', encoding='utf-8') as fh:
        json.dump({'voice': VOICE, 'style': STYLE, 'keys': keys}, fh)
    with open(rp, 'w', encoding='utf-8') as fh:
        json.dump({'style': STYLE, 'items': items}, fh, ensure_ascii=False)
    sims = [r['sim'] for r in items if 'sim' in r]
    lines = [f'## Giọng đọc {STYLE}', '',
             f'- Có tệp: **{len(keys)} / {len(want)}** câu',
             f'- Đạt khâu chặn lỗi: **{len(items) - len(flagged)} / {len(items)}** ({(len(items) - len(flagged)) / max(1, len(items)):.1%})',
             f'- Độ giống giọng mẫu trung bình: {sum(sims) / max(1, len(sims)):.3f}', '']
    if flagged:
        lines += ['### Câu cần nghe lại (tệp vẫn được dùng; sai thì sửa chữ trong dữ liệu hoặc thêm cách đọc vào vi_norm.py)', '',
                  '| Tệp | Câu | Whisper nghe được | Lỗi | Giống |', '|---|---|---|---|---|']
        for r in sorted(flagged, key=lambda r: -r.get('err', 99))[:300]:
            esc = lambda s: str(s).replace('|', '\\|')[:140]
            lines.append(f"| `{r['key']}.mp3` | {esc(r['text'])} | {esc(r.get('heard', r.get('error', '')))} | {r.get('err', '—')} | {r.get('sim', '—')} |")
    summary = '\n'.join(lines) + '\n'
    with open(os.path.join(a.cache, 'report.md'), 'w', encoding='utf-8') as fh:
        fh.write(summary)
    if a.summary:
        with open(a.summary, 'a', encoding='utf-8') as fh:
            fh.write(summary)
    print(summary)


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest='cmd', required=True)
    p = sub.add_parser('plan')
    p.add_argument('--texts'); p.add_argument('--cache', required=True); p.add_argument('--shards', type=int, default=20)
    p.add_argument('--out', required=True); p.add_argument('--limit', type=int, default=0); p.add_argument('--github-output')
    p.add_argument('--sample', type=int, default=0, help='chạy thử N câu chọn đều theo loại câu khó (số điều khoản, viết tắt, ký hiệu…)')
    r = sub.add_parser('run')
    r.add_argument('--todo'); r.add_argument('--text'); r.add_argument('--onnx-dir', required=True); r.add_argument('--out', required=True)
    r.add_argument('--threads', type=int, default=4); r.add_argument('--limit', type=int, default=0)
    r.add_argument('--deadline', type=float, default=0, help='phút; quá thì dừng an toàn (giới hạn 6 giờ của Actions)')
    g = sub.add_parser('merge')
    g.add_argument('--cache', required=True); g.add_argument('--texts'); g.add_argument('--parts', required=True); g.add_argument('--summary')
    a = ap.parse_args()
    {'plan': cmd_plan, 'run': cmd_run, 'merge': cmd_merge}[a.cmd](a)


if __name__ == '__main__':
    main()
