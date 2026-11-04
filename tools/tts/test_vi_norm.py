"""python3 -m unittest tools/tts/test_vi_norm.py"""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(__file__))
from vi_norm import normalize, number_words  # noqa: E402


class SoThanhChu(unittest.TestCase):
    def test_so_co_ban(self):
        self.assertEqual(number_words(0), 'không')
        self.assertEqual(number_words(5), 'năm')
        self.assertEqual(number_words(10), 'mười')
        self.assertEqual(number_words(15), 'mười lăm')
        self.assertEqual(number_words(21), 'hai mươi mốt')
        self.assertEqual(number_words(24), 'hai mươi tư')
        self.assertEqual(number_words(105), 'một trăm lẻ năm')
        self.assertEqual(number_words(119), 'một trăm mười chín')

    def test_so_lon(self):
        self.assertEqual(number_words(2013), 'hai nghìn không trăm mười ba')
        self.assertEqual(number_words(2025), 'hai nghìn không trăm hai mươi lăm')
        self.assertEqual(number_words(1000000), 'một triệu')
        self.assertEqual(number_words(1500), 'một nghìn năm trăm')


class ChuanHoaCau(unittest.TestCase):
    def test_dieu_luat(self):
        self.assertEqual(normalize('Khoản 1 Điều 119 Hiến pháp 2013.'), 'khoản một điều một trăm mười chín hiến pháp hai nghìn không trăm mười ba.')

    def test_viet_tat(self):
        self.assertEqual(normalize('BHXH bắt buộc theo NĐ-CP.'), 'bảo hiểm xã hội bắt buộc theo nghị định chính phủ.')
        self.assertIn('văn bản hợp nhất văn phòng quốc hội', normalize('(VBHN 19/VBHN-VPQH 2026)'))

    def test_phan_tram_va_dau(self):
        self.assertEqual(normalize('Mức đóng 8% tiền lương.'), 'mức đóng tám phần trăm tiền lương.')
        self.assertEqual(normalize('Đây là định nghĩa «Hiến pháp» — văn bản gốc.'), 'đây là định nghĩa hiến pháp, văn bản gốc.')

    def test_chu_hoa_nhan_manh(self):
        self.assertEqual(normalize('KHÔNG ĐÓNG, do NGÂN SÁCH bảo đảm.'), 'không đóng, do ngân sách bảo đảm.')

    def test_so_hieu_van_ban(self):
        self.assertEqual(normalize('Nghị quyết 51/2001/QH10.'), 'nghị quyết số năm mươi mốt năm hai nghìn không trăm lẻ một quốc hội mười.')
        self.assertEqual(normalize('Ngày 25/12/2001 là ngày thông qua.'), 'ngày hai mươi lăm tháng mười hai năm hai nghìn không trăm lẻ một là ngày thông qua.')

    def test_ngoac_thanh_cho_ngat(self):
        self.assertEqual(normalize('Phân biệt chủ thể (khác nhãn hiệu).'), 'phân biệt chủ thể, khác nhãn hiệu.')
        self.assertEqual(normalize('Quỹ mở (Điều 4) là quỹ.'), 'quỹ mở, điều bốn, là quỹ.')

    def test_day_so_dieu_khoan(self):
        self.assertEqual(normalize('Khoản 2, 3, 4 Điều 27.'), 'khoản hai, khoản ba, khoản bốn điều hai mươi bảy.')
        self.assertEqual(normalize('Khoản 1 và 2 Điều 5.'), 'khoản một và khoản hai điều năm.')
        self.assertEqual(normalize('Điểm a, b khoản 1.'), 'điểm a, điểm b khoản một.')
        self.assertEqual(normalize('Điều 1, 5, 6 Hiến pháp.'), 'điều một, điều năm, điều sáu hiến pháp.')

    def test_day_so_khong_doi_nham(self):
        self.assertEqual(normalize('Khoản 1, khoản 2 Điều 3.'), 'khoản một, khoản hai điều ba.')
        self.assertEqual(normalize('Theo khoản 1, a là người thuê.'), 'theo khoản một, a là người thuê.')
        self.assertEqual(normalize('Các điểm a, b, c, d và đ khoản 1.'), 'các điểm a, b, c, d và đ khoản một.')
        self.assertEqual(normalize('Nghị quyết 51/2001/QH10.'), 'nghị quyết số năm mươi mốt năm hai nghìn không trăm lẻ một quốc hội mười.')

    def test_khong_doi_cau_thuong(self):
        self.assertEqual(normalize('Chính xác.'), 'chính xác.')


if __name__ == '__main__':
    unittest.main()
