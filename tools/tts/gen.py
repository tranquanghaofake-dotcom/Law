"""Sinh mp3 giọng neural cho lời đọc của Luyện Luật (định nghĩa, đáp án, giải thích).

Dùng edge-tts (https://github.com/rany2/edge-tts, mã nguồn mở, MIT) gọi giọng neural vi-VN của Microsoft Edge "Đọc to".
Đây là dịch vụ miễn phí nhưng KHÔNG chính thức: Microsoft có thể đổi/chặn bất cứ lúc nào — app tự quay về giọng trình duyệt.

  pip install edge-tts
  python tools/tts/gen.py --out .tts-cache                   # ~8 500 câu, ~100 MB ở 24 kbps; KHÔNG commit mp3 vào repo
  python tools/tts/gen.py --out /tmp/tts --limit 20          # thử 20 câu

Tên tệp = textKey(câu) — FNV-1a 32 bit giống hệt apps/web/src/lib/fx/prosody.ts; app chỉ phát mp3 khi MỌI câu của lời đều có tệp.
Chạy lại chỉ sinh câu còn thiếu (dùng được với cache của GitHub Actions).
"""
import argparse, asyncio, glob, json, os, re, sys, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FIXED = ['Chính xác.', 'Chưa đúng.']
BLANK = re.compile(r'\{\{([^{}]+)\}\}')


def norm(s: str) -> str:
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFC', s)).strip()


def sentences(text: str) -> list[str]:
    t = norm(text)
    return [s for s in re.split(r'(?<=[.!?…])\s+', t) if s] if t else []


def sentence(s: str) -> str:
    """Giống sentence() trong lib/ui/session/speech.ts: thêm dấu chấm nếu thiếu."""
    t = norm(s)
    return t if not t or re.search(r'[.!?…]$', t) else t + '.'


def text_key(text: str) -> str:
    h = 0x811C9DC5
    for ch in norm(text):
        h ^= ord(ch)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f'{h:08x}'


def collect() -> list[str]:
    """Các câu app có thể đọc: định nghĩa (thẻ giới thiệu), đáp án, giải thích, đáp án mẫu."""
    out: list[str] = list(FIXED)
    def add(text: str):
        out.extend(sentences(text))
    def walk(node):
        if isinstance(node, dict):
            if 'term' in node and 'definition' in node:
                add(f"{node['term']}. {node['definition']}")
            for k in ('explain', 'model'):
                if isinstance(node.get(k), str):
                    add(sentence(node[k]))
            opts, ans = node.get('options'), node.get('answer', node.get('answerIdx'))
            if isinstance(opts, list) and isinstance(ans, int) and 0 <= ans < len(opts):
                add(f'Đáp án: {sentence(opts[ans])}')
            if isinstance(node.get('statement'), str) and isinstance(ans, bool):
                add(f"Đáp án: {'Đúng' if ans else 'Sai'}.")
            if isinstance(node.get('text'), str) and BLANK.search(node['text']):
                add('Đáp án: ' + sentence(' · '.join(m.group(1) for m in BLANK.finditer(node['text']))))
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)
    for f in sorted(glob.glob(os.path.join(ROOT, 'packages/content/data/**/*.json'), recursive=True)):
        with open(f, encoding='utf-8') as fh:
            walk(json.load(fh))
    seen, uniq = set(), []
    for s in out:
        k = text_key(s)
        if k not in seen:
            seen.add(k); uniq.append(s)
    return uniq


def style(s: str) -> tuple[str, str]:
    """Nhấn nhá theo mẫu giọng kể chậm, trầm: (rate, pitch) cho edge-tts."""
    bare = re.sub(r'[^\w]', '', s.lower())
    if bare in ('chínhxác', 'đúngrồi'):
        return '+0%', '+12Hz'
    if bare in ('chưađúng', 'sairồi'):
        return '-14%', '-10Hz'
    if s.endswith('?'):
        return '-8%', '+6Hz'
    return '-8%', '-4Hz'


async def synth(edge_tts, s: str, path: str, voice: str, bitrate: str):
    rate, pitch = style(s)
    tmp = path + '.part.mp3'
    await edge_tts.Communicate(s, voice, rate=rate, pitch=pitch).save(tmp)
    if bitrate:  # nén lại (mặc định edge-tts 48 kbps) cho nhẹ trang
        small = path + '.small.mp3'
        p = await asyncio.create_subprocess_exec('ffmpeg', '-v', 'error', '-y', '-i', tmp, '-ac', '1', '-b:a', bitrate, small)
        if await p.wait() == 0:
            os.replace(small, tmp)
    os.replace(tmp, path)


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', required=True)
    ap.add_argument('--voice', default='vi-VN-NamMinhNeural', help='vi-VN-NamMinhNeural (nam) hoặc vi-VN-HoaiMyNeural (nữ)')
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--jobs', type=int, default=6)
    ap.add_argument('--bitrate', default='24k', help="nén bằng ffmpeg; '' để giữ nguyên")
    a = ap.parse_args()
    import edge_tts
    os.makedirs(a.out, exist_ok=True)
    texts = collect()
    if a.limit:
        texts = texts[: a.limit]
    todo = [s for s in texts if not os.path.exists(os.path.join(a.out, text_key(s) + '.mp3'))]
    print(f'{len(texts)} câu, cần sinh {len(todo)}', flush=True)
    sem = asyncio.Semaphore(a.jobs)
    fails = 0
    async def one(s):
        nonlocal fails
        async with sem:
            for attempt in range(3):
                try:
                    await synth(edge_tts, s, os.path.join(a.out, text_key(s) + '.mp3'), a.voice, a.bitrate)
                    return
                except Exception as e:  # mạng chập chờn: thử lại
                    if attempt == 2:
                        fails += 1
                        print(f'lỗi: {s[:50]}… ({e})', file=sys.stderr)
                    await asyncio.sleep(2 ** attempt)
    await asyncio.gather(*(one(s) for s in todo))
    keys = sorted(f[:-4] for f in os.listdir(a.out) if f.endswith('.mp3'))
    with open(os.path.join(a.out, 'manifest.json'), 'w', encoding='utf-8') as fh:
        json.dump({'voice': a.voice, 'keys': keys}, fh)
    print(f'xong: {len(keys)} tệp, lỗi {fails}')


if __name__ == '__main__':
    asyncio.run(main())
