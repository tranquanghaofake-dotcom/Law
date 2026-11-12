"""Sinh bản thô VoxCPM2 theo CÁCH CLONE KHÁC với bản đang chạy, cho bộ câu nghe thử của ab.py (vòng 2 ngày 12/11/2026 dùng script này).

Mỗi chế độ một thư mục `<out>/<chế độ>/<khoá câu>-<số>.wav` (48 kHz); khai các thư mục đó trong tệp --extra của ab.py (khoá "raw").
Bản đang chạy (kèm lời mẫu) đã nằm trong clone.py; script này giữ lại để thử chế độ có chỉ dẫn giọng trong ngoặc.

  python tools/tts/vox_raw.py --out /tmp/vox --modes vox-style

Đo trên CPU 4 nhân có AMX: ~4 giây máy cho mỗi giây âm thanh. Câu dài đọc ổn; câu 1–4 từ hay hỏng (đọc thành chữ khác) nên sinh thêm
một bản cho câu ngắn. Chỉ dẫn giọng trong ngoặc làm câu ngắn hỏng nhiều hơn ("Chính xác." thành "tạm biệt").
"""
import argparse, os, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from ab import SENTENCES  # noqa: E402
from clone import MODEL, REF_TEXT, cpu_bf16  # noqa: E402
from gen import text_key  # noqa: E402
from vi_norm import normalize  # noqa: E402

REF = os.path.join(HERE, 'voice', 'ref.wav')
MODES = {
    'vox-clone': {'kw': {'reference_wav_path': REF}, 'prefix': ''},                                          # chỉ lấy âm sắc
    'vox-style': {'kw': {'reference_wav_path': REF}, 'prefix': '(giọng kể chuyện ấm áp, truyền cảm, nhấn nhá rõ ràng)'},
    'vox-loi': {'kw': {'prompt_wav_path': REF, 'prompt_text': REF_TEXT, 'reference_wav_path': REF}, 'prefix': ''},  # nối tiếp clip mẫu
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', required=True)
    ap.add_argument('--modes', default='vox-style')
    ap.add_argument('--takes', type=int, default=2, help='số bản mỗi câu (câu ngắn: thêm 1)')
    ap.add_argument('--pick', default='', help='chỉ số câu trong SENTENCES, cách nhau bằng dấu phẩy (mặc định: tất cả)')
    ap.add_argument('--steps', type=int, default=10)
    ap.add_argument('--threads', type=int, default=4)
    a = ap.parse_args()
    import soundfile as sf
    import torch
    import voxcpm.model.voxcpm2 as vox2
    from voxcpm import VoxCPM
    torch.set_num_threads(a.threads)
    if not cpu_bf16():
        vox2.pick_runtime_dtype = lambda device, dtype: 'float32'
    model = VoxCPM.from_pretrained(MODEL, load_denoiser=False, optimize=False)
    sr = model.tts_model.sample_rate
    idx = [int(x) for x in a.pick.split(',')] if a.pick else range(len(SENTENCES))
    for mode in a.modes.split(','):
        m = MODES[mode]
        os.makedirs(os.path.join(a.out, mode), exist_ok=True)
        for i in idx:
            key, spoken = text_key(SENTENCES[i]), normalize(SENTENCES[i])
            for k in range(a.takes + (1 if len(spoken.split()) <= 4 else 0)):
                path = os.path.join(a.out, mode, f'{key}-{k}.wav')
                if os.path.exists(path):  # chạy lại thì làm tiếp
                    continue
                t = time.time()
                wav = model.generate(text=m['prefix'] + spoken, cfg_value=2.0, inference_timesteps=a.steps, normalize=False, **m['kw'])
                sf.write(path, wav, sr)
                d = len(wav) / sr
                print(f'{mode} · câu {i} bản {k} · {d:.1f} s âm thanh · {time.time() - t:.0f} s máy', flush=True)


if __name__ == '__main__':
    main()
