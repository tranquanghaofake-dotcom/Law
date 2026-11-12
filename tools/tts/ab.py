"""Nghe thử A/B giọng đọc: cùng một bộ câu, nhiều cấu hình → MỘT trang HTML tự chứa để nghe mù rồi chọn.

Dùng trước khi đổi bất kỳ tham số giọng nào trong clone.py (đổi là phải sinh lại ~13 800 câu): sinh thử vài câu, nghe, rồi mới chốt.
Chỉ ghi đè tham số LÚC CHẠY — không sửa clone.py, không đụng .tts-cache hay manifest. Máy chỉ đo được lỗi chữ, độ giống giọng,
độ lên xuống và tốc độ; hay hay dở phải do người nghe quyết định.

  pip install -r tools/tts/requirements-clone.txt   (+ ffmpeg; model như README)
  python tools/tts/ab.py --out /tmp/ab                              # sinh + viết /tmp/ab/index.html
  python tools/tts/ab.py --out /tmp/ab --page-only                  # dựng lại trang từ report.json có sẵn
  python tools/tts/ab.py --out /tmp/ab --only hien-tai,am-sac       # chỉ các cấu hình này (cả lúc sinh lẫn trên trang; chạy tiếp được)
  python tools/tts/ab.py --out /tmp/ab --extra them.json            # thêm cấu hình ngoài CONFIGS, kể cả engine khác (xem `raw`)

Thêm/bớt cấu hình: sửa CONFIGS. Bộ câu SENTENCES giữ cố định để các đợt nghe thử so được với nhau.
Engine khác (không phải VoxCPM2): sinh sẵn bản thô `<khoá câu>-<số>.wav` vào một thư mục rồi khai cấu hình {"id", "name", "note", "raw": "<thư mục>"}
trong tệp --extra; các bản đó đi qua đúng khâu chặn lỗi, chọn bản và hậu kỳ như giọng chính nên so được công bằng.
Hai vòng nghe ngày 12/11/2026 (VieNeu v3 Turbo với 5 cấu hình, rồi VoxCPM2 với 3 cách clone) chọn ra bản đang chạy: VoxCPM2 kèm lời mẫu.
"""
import argparse, base64, glob, html, json, os, random, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from gen import text_key  # noqa: E402

# 12 câu thật của app, mỗi nhóm một kiểu khó: phản hồi ngắn, tên khái niệm, định nghĩa dài (bị cắt khúc), giải thích có nhấn, điều khoản, đáp án.
SENTENCES = [
    'Chính xác.',
    'Chưa đúng.',
    'Tình thế cấp thiết.',
    'Tình thế cấp thiết là tình thế của người vì muốn tránh gây thiệt hại cho quyền, lợi ích hợp pháp của mình, của người khác hoặc lợi ích của Nhà nước, của cơ quan, tổ chức mà không còn cách nào khác là phải gây một thiệt hại nhỏ hơn thiệt hại cần ngăn ngừa.',
    'Hợp đồng tặng cho tài sản là sự thỏa thuận giữa các bên, theo đó bên tặng cho giao tài sản của mình và chuyển quyền sở hữu cho bên được tặng cho mà không yêu cầu đền bù, bên được tặng cho đồng ý nhận.',
    'Người phạm tội nhận thức rõ hành vi của mình là nguy hiểm cho xã hội, thấy trước hậu quả của hành vi đó có thể xảy ra, tuy không mong muốn nhưng vẫn có ý thức để mặc cho hậu quả xảy ra.',
    'Kinh tế (cơ sở hạ tầng) quyết định pháp luật; pháp luật chỉ tác động trở lại.',
    'Cấu thành tội phạm hình thức chỉ cần hành vi; hậu quả là dấu hiệu bắt buộc trong cấu thành tội phạm vật chất.',
    '(…) Không ai bị bắt nếu không có quyết định của Toà án nhân dân, quyết định hoặc phê chuẩn của Viện kiểm sát nhân dân, trừ trường hợp phạm tội quả tang.',
    'Khoản 1 Điều 19: công dân nước ngoài VÀ người không quốc tịch có đơn thì có thể được nhập quốc tịch Việt Nam nếu đủ điều kiện.',
    'Đáp án: Không áp dụng vì yêu cầu phải đưa ra trước khi Tòa sơ thẩm ra bản án, quyết định.',
    'Đáp án: 75 năm kể từ khi công bố lần đầu tiên.',
]

# Mỗi cấu hình ghi đè đúng các hằng số tương ứng của clone.py (USE_REF_TEXT, CFG, STEPS). Cột đầu luôn là bản đang chạy trên web.
CONFIGS = [
    {'id': 'hien-tai', 'name': 'Hiện tại (vox2-1)', 'note': 'đúng bản đang chạy trên web: VoxCPM2 clone kèm lời mẫu · cfg 2,0 · 10 bước',
     'ref_text': True, 'cfg': 2.0, 'steps': 10},
    {'id': 'am-sac', 'name': 'Chỉ lấy âm sắc', 'note': 'VoxCPM2 clone không kèm lời mẫu · cfg 2,0 · 10 bước',
     'ref_text': False, 'cfg': 2.0, 'steps': 10},
    {'id': 'bam-mau', 'name': 'Bám mẫu hơn', 'note': 'VoxCPM2 clone kèm lời mẫu · cfg 2,6 · 10 bước',
     'ref_text': True, 'cfg': 2.6, 'steps': 10},
]


# ───────────── hàm thuần (có test: tools/tts/test_ab.py) ─────────────

def order(n: int, row: int, seed: int = 11) -> list[int]:
    """Thứ tự hiển thị các bản của một câu khi nghe mù: hoán vị cố định theo (seed, row) — mỗi câu xáo khác nhau, tải lại trang không đổi chỗ."""
    idx = list(range(n))
    random.Random(f'{seed}:{row}').shuffle(idx)
    return idx


def all_configs(extra: list[dict] | None = None, only: set[str] | None = None) -> list[dict]:
    """CONFIGS + cấu hình thêm (--extra), lọc theo --only và giữ nguyên thứ tự. Trùng id là lỗi: mỗi id một thư mục tệp."""
    cfgs = CONFIGS + list(extra or [])
    ids = [c['id'] for c in cfgs]
    dup = sorted({i for i in ids if ids.count(i) > 1})
    if dup:
        raise ValueError(f'trùng id cấu hình: {dup}')
    return [c for c in cfgs if not only or c['id'] in only]


def take_file(files: list[str], k: int) -> str:
    """Bản thô thứ k của một câu; khâu chặn lỗi xin nhiều bản hơn số tệp có thì quay vòng."""
    return sorted(files)[k % len(files)]


def summary(configs: list[dict], report: dict) -> list[dict]:
    """Số đo gộp của từng cấu hình: số câu có tệp, số câu đạt chặn lỗi, tổng lỗi chữ, trung bình độ giống / độ lên xuống (bán âm) / tốc độ (từ mỗi giây)."""
    out = []
    for c in configs:
        items = [r for r in report.get(c['id'], {}).values() if 'err' in r]
        mean = lambda k: round(sum(r[k] for r in items) / len(items), 2) if items else None
        dur, words = sum(r.get('dur', 0) for r in items), sum(len(r.get('spoken', '').split()) for r in items)
        out.append({'id': c['id'], 'n': len(items), 'ok': sum(1 for r in items if r.get('ok')), 'err': sum(r['err'] for r in items),
                    'sim': mean('sim'), 'pv': mean('pv'), 'rate': round(words / dur, 2) if dur else None})
    return out


def page(sentences: list[str], configs: list[dict], report: dict, audio: dict, seed: int = 11) -> str:
    """Trang nghe thử tự chứa. `audio[(id cấu hình, khoá câu)]` = bytes mp3. Tên cấu hình và số đo ẩn cho tới khi bấm "Xem kết quả"."""
    rows = []
    for i, s in enumerate(sentences):
        key, takes = text_key(s), []
        for pos, ci in enumerate(order(len(configs), i, seed)):
            c = configs[ci]
            mp3, r = audio.get((c['id'], key)), report.get(c['id'], {}).get(key, {})
            player = (f'<audio controls preload="none" src="data:audio/mpeg;base64,{base64.b64encode(mp3).decode()}"></audio>'
                      if mp3 else '<p class="thieu">chưa có tệp</p>')
            meta = (f"lỗi chữ {r['err']} · giống {r['sim']:.2f} · lên xuống {r['pv']:.1f} · {r['tries']} lần sinh" + ('' if r.get('ok') else ' · CỜ')
                    if 'err' in r else html.escape(str(r.get('error', '')))[:80])
            takes.append(f'<div class="take"><div class="dau"><b>Bản {pos + 1}</b><span class="ten" hidden>{html.escape(c["name"])}</span></div>{player}'
                         f'<label class="chon"><input type="radio" name="r{i}" value="{ci}"> Bản này hay nhất</label>'
                         f'<small class="so" hidden>{meta}</small></div>')
        rows.append(f'<section class="cau"><h2>Câu {i + 1}</h2><p class="chu">{html.escape(s)}</p><div class="takes">{"".join(takes)}</div></section>')
    data = {'cfg': [{'name': c['name'], 'note': c['note']} for c in configs], 'sum': summary(configs, report), 'n': len(sentences),
            'key': 'ab-giong-' + text_key(json.dumps([c['id'] for c in configs]) + str(seed))}
    return (PAGE.replace('__ROWS__', '\n'.join(rows)).replace('__N__', str(len(sentences))).replace('__M__', str(len(configs)))
            .replace('__DATA__', json.dumps(data, ensure_ascii=False).replace('</', '<\\/')))


PAGE = '''<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Nghe thử giọng đọc</title>
<style>
:root{--nen:#f6f1e7;--giay:#fffdf8;--chu:#2a241c;--mo:#6b6155;--vien:#ddd3c2;--nhan:#8a2f1f;--chon:#efe2cf}
@media (prefers-color-scheme:dark){:root{--nen:#191612;--giay:#221e19;--chu:#eee6d8;--mo:#a89c8b;--vien:#3a332b;--nhan:#e08a6f;--chon:#3a2f25}}
*{box-sizing:border-box}body{margin:0;background:var(--nen);color:var(--chu);font:16px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:1100px;margin:0 auto;padding:24px 16px 80px}h1{font-size:1.6rem;margin:0 0 8px}h2{font-size:.85rem;letter-spacing:.06em;text-transform:uppercase;color:var(--mo);margin:0 0 6px}
.dan{color:var(--mo);margin:0 0 20px;max-width:70ch}.cau{background:var(--giay);border:1px solid var(--vien);border-radius:12px;padding:16px;margin:0 0 16px}
.chu{margin:0 0 12px;font-size:1.05rem}.takes{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px}
.take{border:1px solid var(--vien);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px}.take:has(input:checked){background:var(--chon);border-color:var(--nhan)}
.dau{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}.ten{color:var(--nhan);font-weight:600}audio{width:100%;height:36px}
.chon{display:flex;gap:8px;align-items:center;cursor:pointer;min-height:32px}.so{color:var(--mo)}.thieu{color:var(--mo);margin:0}
button{font:inherit;padding:10px 16px;border-radius:10px;border:1px solid var(--nhan);background:var(--nhan);color:#fff;cursor:pointer}button.phu{background:transparent;color:var(--nhan)}
.nut{display:flex;gap:10px;flex-wrap:wrap;margin:8px 0 16px}table{border-collapse:collapse;width:100%;font-size:.95rem}th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--vien);vertical-align:top}
td.so2,th.so2{text-align:right;white-space:nowrap}td:first-child{min-width:190px}.cuon{overflow-x:auto}textarea{width:100%;min-height:150px;font:13px/1.4 ui-monospace,monospace;background:var(--giay);color:var(--chu);border:1px solid var(--vien);border-radius:8px;padding:8px}
</style></head><body><main>
<h1>Nghe thử giọng đọc</h1>
<p class="dan">__N__ câu, mỗi câu __M__ bản. Tên cấu hình đang ẩn và thứ tự các bản xáo khác nhau ở từng câu để tai không bị dẫn trước.
Mỗi câu chọn một bản nghe hay nhất (cuốn hút, có cảm xúc, vẫn rõ chữ), rồi bấm “Xem kết quả” ở cuối trang. Nên nghe bằng tai nghe.</p>
__ROWS__
<section class="cau" id="ket-qua"><h2>Kết quả</h2>
<div class="nut"><button id="xem">Xem kết quả</button><button class="phu" id="chep" hidden>Chép kết quả</button></div>
<div id="bang" hidden></div></section>
</main><script>
const D=__DATA__;
const doc=()=>{try{return JSON.parse(localStorage.getItem(D.key)||'{}')}catch(e){return {}}};
const ghi=o=>{try{localStorage.setItem(D.key,JSON.stringify(o))}catch(e){}};
const da=doc();
for(const [k,v] of Object.entries(da)){const el=document.querySelector('input[name="'+k+'"][value="'+v+'"]');if(el)el.checked=true}
document.addEventListener('change',e=>{if(e.target.type==='radio'){da[e.target.name]=e.target.value;ghi(da)}});
document.addEventListener('play',e=>{document.querySelectorAll('audio').forEach(a=>{if(a!==e.target)a.pause()})},true);
function ketQua(){
  const phieu=D.cfg.map(()=>0);let chon=0;
  for(let i=0;i<D.n;i++){const el=document.querySelector('input[name="r'+i+'"]:checked');if(el){phieu[+el.value]++;chon++}}
  const so=x=>x==null?'—':String(x).replace('.',',');
  const dong=D.cfg.map((c,i)=>({c,i,p:phieu[i],s:D.sum[i]})).sort((a,b)=>b.p-a.p);
  let h='<p>Đã chọn '+chon+'/'+D.n+' câu.</p><div class="cuon"><table><tr><th>Cấu hình</th><th class="so2">Phiếu</th><th class="so2">Đạt chặn lỗi</th><th class="so2">Lỗi chữ</th><th class="so2">Giống giọng</th><th class="so2">Lên xuống</th><th class="so2">Từ/giây</th></tr>';
  for(const d of dong)h+='<tr><td><b>'+d.c.name+'</b><br><small class="so">'+d.c.note+'</small></td><td class="so2">'+d.p+'</td><td class="so2">'+d.s.ok+'/'+d.s.n+'</td><td class="so2">'+d.s.err+'</td><td class="so2">'+so(d.s.sim)+'</td><td class="so2">'+so(d.s.pv)+'</td><td class="so2">'+so(d.s.rate)+'</td></tr>';
  h+='</table></div><p class="so">Phiếu = số câu Hào chọn bản đó. Lỗi chữ do Whisper nghe lại; giống giọng so với clip mẫu (0–1); lên xuống = độ lệch chuẩn cao độ, tính bằng bán âm.</p>';
  const chu='Kết quả nghe thử giọng ('+chon+'/'+D.n+' câu):\\n'+dong.map(d=>'- '+d.c.name+': '+d.p+' phiếu').join('\\n');
  h+='<textarea readonly id="vanban">'+chu+'</textarea>';
  const b=document.getElementById('bang');b.innerHTML=h;b.hidden=false;
  document.querySelectorAll('.ten,.so[hidden]').forEach(e=>e.hidden=false);
  document.getElementById('chep').hidden=false;
}
document.getElementById('xem').onclick=ketQua;
document.getElementById('chep').onclick=()=>{const t=document.getElementById('vanban');t.select();
  (navigator.clipboard?navigator.clipboard.writeText(t.value):Promise.reject()).catch(()=>{try{document.execCommand('copy')}catch(e){}})};
</script></body></html>
'''


# ───────────── phần nặng (model) ─────────────

def raw_synth(eng, raw_dir: str):
    """Thay bước sinh giọng bằng bản thô có sẵn của engine khác: mỗi lần được gọi trả tệp kế tiếp của câu đang làm (eng.ab_key)."""
    served: dict[str, int] = {}

    def synth(_spoken: str):
        files = glob.glob(os.path.join(raw_dir, f'{eng.ab_key}-*.wav'))
        if not files:
            raise FileNotFoundError(f'thiếu bản thô {eng.ab_key}-*.wav trong {raw_dir}')
        k = served.get(eng.ab_key, 0)
        served[eng.ab_key] = k + 1
        y, sr = eng.sf.read(take_file(files, k), dtype='float32')
        if y.ndim > 1:
            y = y.mean(axis=1)
        return y if sr == eng.sr else eng.librosa.resample(y, orig_sr=sr, target_sr=eng.sr)
    return synth


def apply(eng, clone, cfg: dict):
    """Đặt một cấu hình lên Engine đang chạy (ghi đè hằng số của clone.py trong tiến trình này, không ghi ra tệp)."""
    eng.__dict__.pop('synth', None)  # bỏ bước sinh thay thế của cấu hình trước
    if cfg.get('raw'):
        eng.synth = raw_synth(eng, cfg['raw'])
        return
    clone.USE_REF_TEXT, clone.CFG, clone.STEPS = cfg['ref_text'], cfg['cfg'], cfg['steps']


def load(out: str) -> tuple[dict, dict]:
    report, audio = {}, {}
    rp = os.path.join(out, 'report.json')
    if os.path.exists(rp):
        with open(rp, encoding='utf-8') as fh:
            report = json.load(fh)
    for cid, items in report.items():
        for key in items:
            p = os.path.join(out, cid, key + '.mp3')
            if os.path.exists(p):
                with open(p, 'rb') as fh:
                    audio[(cid, key)] = fh.read()
    return report, audio


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', required=True)
    ap.add_argument('--threads', type=int, default=4)
    ap.add_argument('--only', default='', help='id cấu hình, cách nhau bằng dấu phẩy (mặc định: tất cả) — áp cho cả lúc sinh lẫn các cột trên trang')
    ap.add_argument('--extra', help='tệp JSON: mảng cấu hình thêm ngoài CONFIGS (kể cả engine khác qua khoá "raw")')
    ap.add_argument('--limit', type=int, default=0, help='chỉ N câu đầu (thử nhanh)')
    ap.add_argument('--page-only', action='store_true')
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    sents = SENTENCES[: a.limit] if a.limit else SENTENCES
    extra = []
    if a.extra:
        with open(a.extra, encoding='utf-8') as fh:
            extra = json.load(fh)
    cfgs = all_configs(extra, {x for x in a.only.split(',') if x})
    report, _ = load(a.out)
    if not a.page_only:
        import clone
        eng = clone.Engine(a.threads)
        for cfg in cfgs:
            apply(eng, clone, cfg)
            os.makedirs(os.path.join(a.out, cfg['id']), exist_ok=True)
            done = report.setdefault(cfg['id'], {})
            for s in sents:
                key = text_key(s)
                path = os.path.join(a.out, cfg['id'], key + '.mp3')
                if key in done and 'err' in done[key] and os.path.exists(path):
                    continue
                t0 = time.time()
                eng.ab_key = key
                try:
                    y, info = eng.make(s)
                    clone.write_mp3(y, path)
                    info = {**info, 'dur': round(len(y) / clone.OUT_SR, 2)}
                except Exception as e:  # một câu lỗi không làm hỏng cả đợt
                    info = {'text': s, 'ok': False, 'error': str(e)[:200]}
                done[key] = {**info, 'secs': round(time.time() - t0, 1)}
                with open(os.path.join(a.out, 'report.json'), 'w', encoding='utf-8') as fh:
                    json.dump(report, fh, ensure_ascii=False)
                print(f"{cfg['id']} · {'đạt' if info.get('ok') else 'CỜ'} · {done[key]['secs']} s · {s[:50]}", flush=True)
    report, audio = load(a.out)
    with open(os.path.join(a.out, 'index.html'), 'w', encoding='utf-8') as fh:
        fh.write(page(sents, cfgs, report, audio))
    for row in summary(cfgs, report):
        print(row)
    print('trang nghe thử:', os.path.join(a.out, 'index.html'))


if __name__ == '__main__':
    main()
