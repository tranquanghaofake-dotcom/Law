"""python3 -m unittest tools/tts/test_clone.py — phần thuần của bộ sinh giọng clone (không cần model)."""
import importlib.util
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(__file__))
import clone  # noqa: E402
from gen import text_key  # noqa: E402


class SoKhopLoi(unittest.TestCase):
    def test_whisper_viet_so_van_khop(self):
        # Whisper hay viết chữ số; câu gốc đọc ra chữ — hai bên cùng qua vi_norm nên vẫn khớp
        self.assertEqual(clone.errors('Theo Điều 19 Bộ luật Dân sự 2015.', 'theo điều mười chín bộ luật dân sự hai nghìn không trăm mười lăm'), 0)

    def test_dem_loi(self):
        self.assertEqual(clone.errors('đây lại là chiều khóa', 'đây lại là chìa khóa'), 1)
        self.assertEqual(clone.errors('', 'chính xác'), 2)
        self.assertEqual(clone.errors('Chính xác.', 'Chính xác.'), 0)


class ChanLoi(unittest.TestCase):
    def test_cau_ngan_phai_dung_het(self):
        self.assertFalse(clone.passes({'err': 1, 'sim': 0.9}, 'Chưa đúng.'))
        self.assertTrue(clone.passes({'err': 0, 'sim': 0.9}, 'Chưa đúng.'))

    def test_cau_dai_cho_phep_whisper_nham_it(self):
        t = 'Năng lực hành vi dân sự của cá nhân là khả năng của cá nhân bằng hành vi của mình xác lập, thực hiện quyền, nghĩa vụ dân sự.'
        self.assertTrue(clone.passes({'err': 2, 'sim': 0.9}, t))
        self.assertFalse(clone.passes({'err': 4, 'sim': 0.9}, t))

    def test_so_phai_doc_dung_tuyet_doi(self):
        ref = 'Theo Điều 19 Bộ luật Dân sự 2015, năng lực hành vi dân sự của cá nhân là khả năng.'
        self.assertTrue(clone.numbers_match('Theo điều mười chín bộ luật dân sự 2015, năng lực hành vi dân sự của cá nhân là khả năng', ref))
        self.assertFalse(clone.numbers_match('Tiêu điều mới 9 Bộ luật Dân sự 2015, năng lực hành vi dân sự của cá nhân là khả năng', ref))
        self.assertFalse(clone.passes({'err': 1, 'num': False, 'sim': 0.9}, ref))

    def test_khong_giong_thi_truot(self):
        t = 'Hiến pháp là luật cơ bản của nhà nước.'
        self.assertFalse(clone.passes({'err': 0, 'sim': clone.SIM_MIN - 0.01}, t))
        self.assertTrue(clone.passes({'err': 0, 'sim': 0.6}, 'Chính xác.'))  # câu ngắn: không xét độ giống

    def test_so_theo_am_giong_bac(self):
        self.assertEqual(clone.errors('Chính sác!', 'Chính xác.'), 0)
        self.assertEqual(clone.errors('Chính xác từ sinh vụ', 'Chính xác.'), 3)  # tiếng nói thừa cuối câu bị bắt
        self.assertEqual(clone.errors('chẻ dất', 'trẻ giất'), 0)
        self.assertEqual(clone.errors('minh họa, hòa giải, thủy lợi', 'minh hoạ, hoà giải, thuỷ lợi'), 0)  # dấu thanh kiểu cũ/mới
        self.assertEqual(clone.errors('sơ thầm', 'sơ thẩm'), 1)  # khác thanh vẫn là lỗi
        self.assertEqual(clone.errors('miễn điểm C, điểm D, điểm E khoản 1', 'miễn điểm c, đ, e khoản 1.'), 0)  # tên chữ cái; Whisper viết đ thành D
        self.assertEqual(clone.errors('Năng lực thành vi dân sự là gì?', 'Năng lực hành vi dân sự là gì?'), 1)

    def test_cat_duoi_noi_thua(self):
        ref = clone.words('Đáp án: cùng loại · lãi.')
        self.assertEqual(clone.tail_cut(clone.words('Đáp án cùng loại lãi thịt'), ref), 5)
        self.assertEqual(clone.tail_cut(clone.words('Hội nghị chủ nợ. Hẹn gặp lại các bạn'), clone.words('Hội nghị chủ nợ.')), 4)
        self.assertEqual(clone.tail_cut(clone.words('Chính xác'), clone.words('Chính xác.')), 2)  # không thừa: giữ nguyên
        self.assertEqual(clone.tail_cut(clone.words('Đáp án cùng loại lại chia sẻ'), ref), 5)  # sai thanh vẫn giữ, chỉ cắt phần thừa

    def test_whisper_viet_khoang_cho_khoan_khong_tinh_loi(self):
        ref = 'Khoản 1, 2, 5–8 Điều 26 Luật Đất đai 2024.'
        self.assertEqual(clone.errors('Khoảng 1, khoảng 2, khoảng 5 đến 8 Điều 26 Luật đất đai 2024.', ref), 0)
        self.assertEqual(clone.errors('Khoảng 1, khoảng 2, khoảng 5 đến 9 Điều 26 Luật đất đai 2024.', ref), 1)

    def test_ten_don_vi_truoc_so_phai_dung(self):
        self.assertTrue(clone.numbers_match('Điều 275', 'Điều 275.'))
        self.assertFalse(clone.numbers_match('Điểm 275', 'Điều 275.'))
        self.assertFalse(clone.numbers_match('tiểu 275', 'Điều 275.'))
        self.assertFalse(clone.numbers_match('khoảng 3.106.', 'Khoản 3 Điều 106.'))
        self.assertTrue(clone.numbers_match('khoảng 3 điều 106.', 'Khoản 3 Điều 106.'))      # Whisper viết "khoảng" cho "khoản"
        self.assertTrue(clone.numbers_match('Điều 309, Điều 317', 'Điều 309, 317.'))            # vi_norm đọc lặp tên đơn vị
        self.assertTrue(clone.numbers_match('Khoảng 1, khoảng 2, khoảng 5 đến 8 đều 26 luật đất đai 2024', 'Khoản 1, 2, 5–8 Điều 26 Luật Đất đai 2024.'))
        self.assertFalse(clone.numbers_match('Khoảng 1, khoảng 2, khoảng 5 đến 8.26 luật đất đai 2024', 'Khoản 1, 2, 5–8 Điều 26 Luật Đất đai 2024.'))
        self.assertTrue(clone.numbers_match('điều kiện để được nhập quốc tịch', 'Điều kiện để được nhập quốc tịch.'))  # "điều" thường: không xét

    def test_tieng_thua_dau_cau(self):
        ref = clone.words('Khoản 1 Điều 19: công dân nước ngoài có đơn thì có thể được nhập quốc tịch.')
        self.assertEqual(clone.head_extra(clone.words('Càng khoản 1 điều 19, công dân nước ngoài có đơn thì có thể được nhập quốc tịch.'), ref), 1)
        self.assertEqual(clone.head_extra(clone.words('à ờ khoản 1 điều 19, công dân nước ngoài có đơn thì có thể được nhập quốc tịch.'), ref), 2)
        self.assertEqual(clone.head_extra(clone.words('Khoản 1 điều 19, công dân nước ngoài có đơn thì có thể được nhập quốc tịch.'), ref), 0)
        self.assertEqual(clone.head_extra(clone.words('Khoảng 1 điều 19, công dân nước ngoài có đơn thì có thể được nhập quốc tịch.'), ref), 0)  # nghe nhầm từ đầu ≠ thừa
        self.assertEqual(clone.head_extra(clone.words('Hình xác.'), clone.words('Chính xác.')), 0)

    def test_thua_dau_cau_thi_truot(self):
        t = 'Hiến pháp là luật cơ bản của nhà nước.'
        self.assertTrue(clone.passes({'err': 0, 'num': True, 'head': 0, 'sim': 0.9}, t))
        self.assertFalse(clone.passes({'err': 1, 'num': True, 'head': 1, 'sim': 0.9}, t))

    def test_nguong_loi_theo_do_dai(self):
        self.assertEqual(clone.allowed_errors(5), 0)
        self.assertEqual(clone.allowed_errors(7), 1)
        self.assertEqual(clone.allowed_errors(18), 2)

    def test_chon_ban_tot_nhat(self):
        t = 'Chính xác.'
        c = [{'err': 1, 'sim': 0.95}, {'err': 0, 'sim': 0.80}, {'err': 0, 'sim': 0.86}]
        self.assertEqual(clone.best(c, t), {'err': 0, 'sim': 0.86})

    def test_chon_ban_bieu_cam_hon_khi_deu_dat(self):
        t = 'Hiến pháp là luật cơ bản của nhà nước.'
        a, b = {'err': 0, 'sim': 0.90, 'pv': 3.0}, {'err': 0, 'sim': 0.89, 'pv': 4.5}
        self.assertIs(clone.best([a, b], t), b)
        self.assertIs(clone.best([{'err': 3, 'sim': 0.99, 'pv': 9}, a], t), a)  # đạt chặn lỗi luôn thắng

    def test_cau_ngan_sinh_nhieu_ban(self):
        self.assertTrue(clone.is_short('Chính xác.'))
        self.assertTrue(clone.is_short('Đáp án: Đúng.'))
        self.assertFalse(clone.is_short('Hiến pháp là luật cơ bản của nhà nước.'))

    def test_dung_sinh_khi_du_ban_dat(self):
        self.assertTrue(clone.enough(1, 1, short=False))       # câu thường: bản đầu đạt là dùng
        self.assertFalse(clone.enough(3, 0, short=False))      # chưa bản nào đạt: sinh tiếp
        self.assertFalse(clone.enough(1, 1, short=True))       # câu ngắn: cần 2 bản đạt để chọn
        self.assertTrue(clone.enough(3, 2, short=True))

    def test_doc_sai_so_thi_khong_vao_manifest(self):
        self.assertTrue(clone.usable({'ok': True, 'num': True}))
        self.assertTrue(clone.usable({'ok': False, 'err': 3, 'num': True}))   # sai chữ: vẫn dùng, ghi cờ để nghe lại
        self.assertFalse(clone.usable({'ok': False, 'err': 1, 'num': False}))
        self.assertTrue(clone.usable({}))                                      # tệp cũ không có báo cáo


class CatKhuc(unittest.TestCase):
    def test_cau_vua_thi_giu_nguyen(self):
        self.assertEqual(clone.chunks('Hiến pháp là luật cơ bản.'), ['Hiến pháp là luật cơ bản.'])
        self.assertEqual(clone.chunks('   '), [])

    def test_cat_o_dau_cau_va_khong_mat_chu(self):
        s = 'tòa án nơi bị đơn cư trú, làm việc; ' * 20
        got = clone.chunks(s, 100)
        self.assertGreater(len(got), 3)
        self.assertTrue(all(len(c) <= 100 for c in got))
        self.assertTrue(all(c[-1] in ',;' for c in got))
        self.assertEqual(' '.join(got).split(), s.split())

    def test_ve_khong_dau_cau_thi_cat_o_khoang_trang(self):
        s = ' '.join(['chữ'] * 120)
        got = clone.chunks(s, 100)
        self.assertTrue(all(len(c) <= 100 for c in got))
        self.assertEqual(' '.join(got).split(), s.split())


class KieuSo(unittest.TestCase):
    def test_chi_dung_bfloat16_khi_cpu_co_amx(self):
        self.assertTrue(clone.cpu_bf16('flags : fpu avx2 avx512f amx_bf16 amx_tile'))
        self.assertFalse(clone.cpu_bf16('flags : fpu avx2 avx512f avx512_bf16'))
        self.assertFalse(clone.cpu_bf16('flags : fpu avx2'))


class ChiaViec(unittest.TestCase):
    def test_bo_cau_da_co_va_chia_deu(self):
        texts = [f'Câu số {i} ' + 'x' * (i % 7) + '.' for i in range(100)]
        done = {text_key(texts[0]), text_key(texts[1])}
        parts = clone.plan(texts + texts[:5], done, 4)  # trùng lặp bị gộp
        flat = [t for p in parts for t in p]
        self.assertEqual(len(flat), 98)
        self.assertEqual(len(set(flat)), 98)
        loads = [sum(map(len, p)) for p in parts]
        self.assertLessEqual(max(loads) - min(loads), 12)

    def test_mau_thu_chia_deu_loai_cau(self):
        texts = ['Chính xác.', 'Khoản 2, 3 Điều 5.', 'Theo Điều 19 Bộ luật Dân sự.', 'Nghị quyết 51/2001/QH10.', 'BHXH bắt buộc.',
                 'Thị phần ≥ 30%.', 'Ngày 25/12/2001 là ngày thông qua.', 'Hiến pháp là gì?', 'Đáp án: Quốc hội.'] + [f'Câu thường số {i} về pháp luật.' for i in range(20)]
        got = clone.sample(texts, 10)
        self.assertEqual(len(got), 10)
        self.assertEqual(len(set(got)), 10)
        for must in ['Chính xác.', 'Khoản 2, 3 Điều 5.', 'Thị phần ≥ 30%.', 'Hiến pháp là gì?']:
            self.assertIn(must, got)
        self.assertEqual(clone.sample(texts, 10), got)  # cố định theo seed: lần chạy nào cũng cùng mẫu

    def test_it_cau_hon_so_may(self):
        self.assertEqual(len(clone.plan(['A.', 'B.'], set(), 20)), 2)
        self.assertEqual(clone.plan([], set(), 20), [])


def _write(path, text):
    with open(path, 'w', encoding='utf-8') as fh:
        fh.write(text)


def _read(path):
    with open(path, encoding='utf-8') as fh:
        return fh.read()


class GopTheoDot(unittest.TestCase):
    """Đổi kiểu giọng: bộ mới gom vào thư mục chờ, bộ cũ trên web chỉ bị thay khi bộ mới phủ đủ PROMOTE số câu."""

    def setUp(self):
        import json, tempfile, types
        self.json, self.types = json, types
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.texts = [f'Câu số {i}.' for i in range(200)]
        self.keys = [text_key(t) for t in self.texts]
        self._load = clone.load_texts
        clone.load_texts = lambda path: list(self.texts)
        self.addCleanup(lambda: setattr(clone, 'load_texts', self._load))
        self.cache = os.path.join(self.tmp.name, 'cache')
        os.makedirs(self.cache)
        for k in self.keys:  # bộ cũ đang chạy trên web
            _write(os.path.join(self.cache, k + '.mp3'), 'cu')
        _write(os.path.join(self.cache, 'manifest.json'), json.dumps({'voice': clone.VOICE, 'style': 'kieu-cu', 'keys': self.keys}))

    def part(self, name, keys, bad=()):
        d = os.path.join(self.tmp.name, name)
        os.makedirs(d)
        with open(os.path.join(d, 'report.jsonl'), 'w', encoding='utf-8') as rep:
            for k in keys:
                _write(os.path.join(d, k + '.mp3'), 'moi')
                rep.write(self.json.dumps({'key': k, 'text': k, 'ok': k not in bad, 'err': 0, 'num': k not in bad, 'sim': 0.9}) + '\n')
        return d

    def merge(self, parts):
        out = os.path.join(self.tmp.name, 'gh-output')
        _write(out, '')
        clone.cmd_merge(self.types.SimpleNamespace(cache=self.cache, texts=None, parts=parts, summary=None, github_output=out))
        return dict(l.split('=') for l in _read(out).split())

    def top(self):
        return self.json.loads(_read(os.path.join(self.cache, 'manifest.json')))

    def test_chua_du_thi_giu_bo_cu_va_chay_tiep(self):
        self.part('out-0', self.keys[:120])
        got = self.merge(os.path.join(self.tmp.name, 'out-*'))
        self.assertEqual(got, {'switched': 'false', 'more': 'true'})
        self.assertEqual(self.top()['style'], 'kieu-cu')                                  # web vẫn bộ cũ, không mất tệp nào
        self.assertEqual(_read(os.path.join(self.cache, self.keys[0] + '.mp3')), 'cu')
        nxt = self.json.loads(_read(os.path.join(self.cache, clone.NEXT, 'manifest.json')))
        self.assertEqual((nxt['style'], len(nxt['keys'])), (clone.STYLE, 120))
        plan_out = os.path.join(self.tmp.name, 'plan')                                     # lần chạy sau chỉ sinh phần thiếu
        clone.cmd_plan(self.types.SimpleNamespace(texts=None, limit=0, sample=0, cache=self.cache, shards=4, out=plan_out, github_output=None))
        todo = [t for f in sorted(os.listdir(plan_out)) for t in self.json.loads(_read(os.path.join(plan_out, f)))]
        self.assertEqual(sorted(todo), sorted(self.texts[120:]))

    def test_du_thi_thay_bo_cu(self):
        self.part('out-0', self.keys[:120])
        self.merge(os.path.join(self.tmp.name, 'out-0'))
        self.part('out-1', self.keys[120:], bad={self.keys[199]})                          # 1 câu đọc sai số: 199/200 = 99,5% vẫn đủ
        got = self.merge(os.path.join(self.tmp.name, 'out-1'))
        self.assertEqual(got, {'switched': 'true', 'more': 'false'})
        m = self.top()
        self.assertEqual((m['style'], len(m['keys'])), (clone.STYLE, 199))
        self.assertNotIn(self.keys[199], m['keys'])
        self.assertEqual(_read(os.path.join(self.cache, self.keys[0] + '.mp3')), 'moi')
        self.assertFalse(os.path.exists(os.path.join(self.cache, clone.NEXT)))

    def test_khong_tien_trien_thi_khong_tu_chay_tiep(self):
        self.part('out-0', [])
        self.assertEqual(self.merge(os.path.join(self.tmp.name, 'out-*')), {'switched': 'false', 'more': 'false'})

    def test_cung_kieu_thi_gop_thang_nhu_cu(self):
        _write(os.path.join(self.cache, 'manifest.json'), self.json.dumps({'voice': clone.VOICE, 'style': clone.STYLE, 'keys': self.keys[:150]}))
        self.part('out-0', self.keys[150:160])
        got = self.merge(os.path.join(self.tmp.name, 'out-*'))
        self.assertEqual(got['switched'], 'true')
        self.assertEqual(len(self.top()['keys']), 200)                                     # tệp sẵn có trong cache đều được tính
        self.assertFalse(os.path.exists(os.path.join(self.cache, clone.NEXT)))


@unittest.skipUnless(importlib.util.find_spec('numpy') and importlib.util.find_spec('scipy'), 'cần numpy + scipy (chạy trong môi trường requirements-clone.txt)')
class HauKy(unittest.TestCase):
    def test_chan_dinh_khong_tang_am_luong(self):
        import numpy as np
        sr = 8000; x = (0.3 * np.sin(np.arange(sr) / 5)).astype(np.float32)
        self.assertIs(clone.peak_limit(x, sr), x)  # dưới trần: giữ nguyên
        x[4000] = 1.5
        y = clone.peak_limit(x, sr)
        self.assertLessEqual(float(np.abs(y).max()), 0.89 + 1e-6)
        self.assertAlmostEqual(float(y[100]), float(x[100]), places=6)  # xa đỉnh: không đổi

    def test_de_esser_chi_ha_am_xi(self):
        import numpy as np
        sr = 44100; t = np.arange(sr) / sr
        tone = (0.3 * np.sin(2 * np.pi * 300 * t)).astype(np.float32)
        self.assertLess(float(np.abs(clone.deess(tone, sr) - tone).max()), 1e-4)  # nguyên âm/giọng trầm: đi qua nguyên vẹn
        rng = np.random.default_rng(0)
        hiss = np.fft.irfft(np.fft.rfft(rng.standard_normal(sr)) * ((np.fft.rfftfreq(sr, 1 / sr) > 5000) & (np.fft.rfftfreq(sr, 1 / sr) < 10000))).astype(np.float32) * 0.1
        y = clone.deess(tone * 0.05 + hiss, sr)
        drop = 20 * np.log10(np.sqrt(np.mean(hiss ** 2)) / np.sqrt(np.mean((y - tone * 0.05) ** 2)))
        self.assertGreater(drop, 3.0)  # âm xì bị hạ
        self.assertLessEqual(drop, clone.DEESS_CUT + 0.5)  # nhưng không quá mức cắt tối đa

    def test_cat_im_lang_giu_mep(self):
        import numpy as np
        x = np.zeros(1000, dtype=np.float32); x[400:500] = 0.5
        y = clone.trim(x, 1000)
        self.assertEqual(len(y), 100 + 2 * 30)
        self.assertEqual(len(clone.trim(np.zeros(10, dtype=np.float32), 1000)), 0)


if __name__ == '__main__':
    unittest.main()
