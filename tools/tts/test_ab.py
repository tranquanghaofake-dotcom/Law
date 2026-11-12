"""Test phần thuần của ab.py: python3 -m unittest tools/tts/test_ab.py"""
import os, sys, unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ab import CONFIGS, SENTENCES, order, page, summary  # noqa: E402
from gen import collect, text_key  # noqa: E402


class Order(unittest.TestCase):
    def test_la_hoan_vi_co_dinh(self):
        for row in range(12):
            self.assertEqual(sorted(order(5, row)), [0, 1, 2, 3, 4])
            self.assertEqual(order(5, row), order(5, row))

    def test_moi_cau_xao_khac_nhau(self):
        self.assertGreater(len({tuple(order(5, row)) for row in range(12)}), 6)


class BoCau(unittest.TestCase):
    def test_cau_thu_la_cau_that_cua_app(self):
        have = set(collect())
        self.assertEqual([s for s in SENTENCES if s not in have], [])

    def test_id_cau_hinh_khong_trung(self):
        ids = [c['id'] for c in CONFIGS]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(ids[0], 'hien-tai')  # cột đối chứng luôn có


class Summary(unittest.TestCase):
    def test_gop_so_do(self):
        cfg = [{'id': 'a'}, {'id': 'b'}]
        rep = {'a': {'k1': {'err': 1, 'ok': True, 'sim': 0.8, 'pv': 2.0, 'dur': 2.0, 'spoken': 'một hai ba bốn'},
                     'k2': {'err': 0, 'ok': False, 'sim': 0.6, 'pv': 3.0, 'dur': 2.0, 'spoken': 'năm sáu'},
                     'k3': {'ok': False, 'error': 'hỏng'}}}
        a, b = summary(cfg, rep)
        self.assertEqual((a['n'], a['ok'], a['err'], a['sim'], a['pv'], a['rate']), (2, 1, 1, 0.7, 2.5, 1.5))
        self.assertEqual((b['n'], b['sim'], b['rate']), (0, None, None))


class Page(unittest.TestCase):
    def setUp(self):
        self.cfg = [{'id': 'a', 'name': 'Cấu hình <A>', 'note': 'ghi chú a'}, {'id': 'b', 'name': 'Cấu hình B', 'note': 'ghi chú b'}]
        self.sents = ['Câu <một>.', 'Câu hai.']
        k = text_key(self.sents[0])
        self.rep = {'a': {k: {'err': 0, 'ok': True, 'sim': 0.81, 'pv': 2.4, 'tries': 2, 'dur': 1.0, 'spoken': 'câu một'}}}
        self.html = page(self.sents, self.cfg, self.rep, {('a', k): b'ID3'})

    def test_moi_cau_du_so_ban(self):
        self.assertEqual(self.html.count('class="take"'), 4)
        self.assertEqual(self.html.count('<audio '), 1)
        self.assertEqual(self.html.count('chưa có tệp'), 3)

    def test_an_ten_va_so_do_khi_nghe_mu(self):
        self.assertIn('<span class="ten" hidden>Cấu hình &lt;A&gt;</span>', self.html)
        self.assertIn('<small class="so" hidden>lỗi chữ 0 · giống 0.81 · lên xuống 2.4 · 2 lần sinh</small>', self.html)

    def test_thoat_ky_tu_html(self):
        self.assertIn('Câu &lt;một&gt;.', self.html)
        self.assertNotIn('Câu <một>.', self.html)
        self.assertNotIn('__DATA__', self.html)


if __name__ == '__main__':
    unittest.main()
