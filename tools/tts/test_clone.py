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


@unittest.skipUnless(importlib.util.find_spec('numpy') and importlib.util.find_spec('scipy'), 'cần numpy + scipy (chạy trong môi trường requirements-clone.txt)')
class HauKy(unittest.TestCase):
    def test_eq_noi_suy_va_giu_bien(self):
        g = clone.eq_gains([100, 1000, 10000], [-4, 0, 2], [50, 100, 316.2, 1000, 20000])
        self.assertAlmostEqual(g[0], -4); self.assertAlmostEqual(g[1], -4); self.assertAlmostEqual(g[2], -2, places=2)
        self.assertAlmostEqual(g[3], 0); self.assertAlmostEqual(g[4], 2)

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
