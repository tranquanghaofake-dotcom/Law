"""Sinh bản thô VoxCPM2 (https://github.com/OpenBMB/VoxCPM, Apache-2.0, 2 tỉ tham số, có tiếng Việt) cho bộ câu nghe thử của ab.py.

Mỗi chế độ một thư mục `<out>/<chế độ>/<khoá câu>-<số>.wav` (48 kHz); khai các thư mục đó trong tệp --extra của ab.py (khoá "raw")
để chúng đi qua đúng khâu chặn lỗi và hậu kỳ như giọng VieNeu. Cần môi trường riêng (khác bộ gói của clone.py):

  pip install voxcpm soundfile        # Python 3.10–3.12; trên máy không có GPU thêm --extra-index-url https://download.pytorch.org/whl/cpu
  python tools/tts/vox_raw.py --out /tmp/vox --modes vox-loi,vox-clone,vox-style

Đo ngày 12/11/2026 trên CPU 4 nhân: ~4 giây máy cho mỗi giây âm thanh (model tải ~4,7 GB). Câu dài đọc ổn; câu 1–4 từ hay hỏng
(đọc thành chữ khác) nên sinh thêm một bản cho câu ngắn. Chỉ dẫn giọng trong ngoặc làm câu ngắn hỏng nhiều hơn.
"""
import argparse, os, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from ab import SENTENCES  # noqa: E402
from gen import text_key  # noqa: E402
from vi_norm import normalize  # noqa: E402

REF = os.path.join(HERE, 'voice', 'ref.wav')
# lời của voice/ref.wav (đã đối chiếu bằng Whisper medium) — chế độ "kèm lời mẫu" cần đúng từng chữ
REF_TEXT = ('Sự bóc lột này rất khó thấy bằng mắt thường, khi lương tăng nhẹ mà thời gian làm việc không đổi, '
            'công nhân tưởng mình có lợi, nhưng thực chất số giá trị thặng dư tạo ra cho nhà tư bản đã vượt xa mức mong đợi.')
MODES = {
    'vox-clone': {'kw': {'reference_wav_path': REF}, 'prefix': ''},                                          # chỉ lấy âm sắc
    'vox-style': {'kw': {'reference_wav_path': REF}, 'prefix': '(giọng kể chuyện ấm áp, truyền cảm, nhấn nhá rõ ràng)'},
    'vox-loi': {'kw': {'prompt_wav_path': REF, 'prompt_text': REF_TEXT, 'reference_wav_path': REF}, 'prefix': ''},  # nối tiếp clip mẫu
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', required=True)
    ap.add_argument('--modes', default='vox-loi,vox-clone')
    ap.add_argument('--takes', type=int, default=2, help='số bản mỗi câu (câu ngắn: thêm 1)')
    ap.add_argument('--pick', default='', help='chỉ số câu trong SENTENCES, cách nhau bằng dấu phẩy (mặc định: tất cả)')
    ap.add_argument('--steps', type=int, default=10)
    ap.add_argument('--threads', type=int, default=4)
    a = ap.parse_args()
    import soundfile as sf
    import torch
    from voxcpm import VoxCPM
    torch.set_num_threads(a.threads)
    model = VoxCPM.from_pretrained('openbmb/VoxCPM2', load_denoiser=False)
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
