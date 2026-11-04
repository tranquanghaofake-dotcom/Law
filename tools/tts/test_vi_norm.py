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
        self.assertEqual(normalize('(VBHN 19/VBHN-VPQH 2026)'), 'văn bản hợp nhất số mười chín năm hai nghìn không trăm hai mươi sáu')
        self.assertEqual(normalize('Luật 2015 (VBHN 54/VBHN-VPQH).'), 'luật hai nghìn không trăm mười lăm, văn bản hợp nhất số năm mươi tư.')
        self.assertEqual(normalize('(VBHN 142/2026).'), 'văn bản hợp nhất số một trăm bốn mươi hai năm hai nghìn không trăm hai mươi sáu.')

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
        self.assertEqual(normalize('Điểm a, b khoản 1.'), 'điểm a, điểm bê khoản một.')
        self.assertEqual(normalize('Điểm đ khoản 2 Điều 9.'), 'điểm đê khoản hai điều chín.')
        self.assertEqual(normalize('Điều 1, 5, 6 Hiến pháp.'), 'điều một, điều năm, điều sáu hiến pháp.')

    def test_day_so_khong_doi_nham(self):
        self.assertEqual(normalize('Khoản 1, khoản 2 Điều 3.'), 'khoản một, khoản hai điều ba.')
        self.assertEqual(normalize('Theo khoản 1, a là người thuê.'), 'theo khoản một, a là người thuê.')
        self.assertEqual(normalize('Các điểm a, b, c, d và đ khoản 1.'), 'các điểm a, bê, xê, dê và đê khoản một.')
        self.assertEqual(normalize('Nghị quyết 51/2001/QH10.'), 'nghị quyết số năm mươi mốt năm hai nghìn không trăm lẻ một quốc hội mười.')

    def test_ky_hieu_don_vi_la_ma(self):
        self.assertEqual(normalize('Đáp án: Nhà nước · phải tham gia.'), 'đáp án, nhà nước, phải tham gia.')
        self.assertEqual(normalize('Tự doanh = đầu tư bằng tiền của mình.'), 'tự doanh là đầu tư bằng tiền của mình.')
        self.assertEqual(normalize('Thị phần ≥ 30%.'), 'thị phần lớn hơn hoặc bằng ba mươi phần trăm.')
        self.assertEqual(normalize('Mức: 03 ha.'), 'mức, ba héc ta.')
        self.assertEqual(normalize('Tội tại Chương XXVI.'), 'tội tại chương hai mươi sáu.')
        self.assertEqual(normalize('Nước CHXHCN Việt Nam.'), 'nước cộng hòa xã hội chủ nghĩa việt nam.')
        self.assertEqual(normalize('Sắc lệnh 63/SL (1945).'), 'sắc lệnh số sáu mươi ba sắc lệnh, một nghìn chín trăm bốn mươi lăm.')

    def test_muc_danh_so_khoang_so_cho_trong(self):
        self.assertEqual(normalize('Công ty trong đó: 1- Phần vốn góp phải đóng đủ.'), 'công ty trong đó, một, phần vốn góp phải đóng đủ.')
        self.assertEqual(normalize('Điều hòa 24.000–90.000 BTU.'), 'điều hòa hai mươi tư nghìn đến chín mươi nghìn bê tê u.')
        self.assertEqual(normalize('Mô tô trên 125 cm3.'), 'mô tô trên một trăm hai mươi lăm phân khối.')
        self.assertEqual(normalize('Đáp án: 1- […] là hành vi nguy hiểm (…).'), 'đáp án, một, là hành vi nguy hiểm.')
        self.assertEqual(normalize('Phát triển kinh tế- xã hội.'), 'phát triển kinh tế xã hội.')
        self.assertEqual(normalize('Văn bản 51/2001/QH10 và NĐ-CP.'), 'văn bản số năm mươi mốt năm hai nghìn không trăm lẻ một quốc hội mười và nghị định chính phủ.')

    def test_thu_tu_thang_phan_so(self):
        self.assertEqual(normalize('Điều thứ 1 và người thứ 4.'), 'điều thứ nhất và người thứ tư.')
        self.assertEqual(normalize('Kỳ họp thứ 11.'), 'kỳ họp thứ mười một.')
        self.assertEqual(normalize('Ngày 30/4/1975.'), 'ngày ba mươi tháng tư năm một nghìn chín trăm bảy mươi lăm.')
        self.assertEqual(normalize('Thông qua với 2/3 tổng số đại biểu.'), 'thông qua với hai phần ba tổng số đại biểu.')
        self.assertEqual(normalize('Hạn chót 31/12 hằng năm.'), 'hạn chót ngày ba mươi mốt tháng mười hai hằng năm.')
        self.assertEqual(normalize('Từ ngày 01/01.'), 'từ ngày một tháng một.')
        self.assertEqual(normalize('Đường trên 5g/100mL.'), 'đường trên năm gam trên một trăm mi li lít.')

    def test_bo_ghi_chu_noi_bo_ve_nguon(self):
        self.assertEqual(normalize('Nguyễn Ngọc Bích) — đã khớp nguyên văn slide (laws/hc-slide-trich.txt); slide không phải giáo trình, giáo trình chưa đối chiếu).'),
                         'nguyễn ngọc bích, đã khớp nguyên văn slide, slide không phải giáo trình, giáo trình chưa đối chiếu.')  # giữ cảnh báo độ tin cậy
        self.assertEqual(normalize('Đây là định nghĩa «A» (Ghi chép ôn thi Lý luận chung (Drive HLU/KÌ I/LLC: VD8) và Tài liệu hướng dẫn).'),
                         'đây là định nghĩa a, ghi chép ôn thi lý luận chung và tài liệu hướng dẫn.')
        self.assertEqual(normalize('(Slide bài giảng, vấn đề 1 ("LMS Vấn đề 1", ThS.'), 'slide bài giảng, vấn đề một, thạc sĩ.')
        self.assertEqual(normalize('Trường Đại học Luật Hà Nội, vấn đề 4 ("VĐ 04 -HCPC") — đã khớp nguyên văn slide (laws/a.txt).'), 'trường đại học luật hà nội, vấn đề bốn, đã khớp nguyên văn slide.')
        self.assertEqual(normalize('Điều thứ 1 (vbpl.vn: hết hiệu lực toàn bộ).'), 'điều thứ nhất, hết hiệu lực toàn bộ.')
        self.assertEqual(normalize('(Nghị định 63/2010/NĐ-CP, khoản 1 Điều 3 — đã khớp nguyên văn Văn bản hợp nhất 10272/VBHN-VPCP ngày 27/9/2017 (tài liệu seminar, Drive HLU); chưa đối chiếu nguyên văn Văn bản hợp nhất 2/VBHN-VPCP năm 2025).'),
                         'nghị định số sáu mươi ba năm hai nghìn không trăm mười nghị định chính phủ, khoản một điều ba, đã khớp nguyên văn văn bản hợp nhất số mười nghìn hai trăm bảy mươi hai ngày hai mươi bảy tháng chín năm hai nghìn không trăm mười bảy, tài liệu seminar, chưa đối chiếu nguyên văn văn bản hợp nhất số hai năm hai nghìn không trăm hai mươi lăm.')

    def test_khong_doi_cau_thuong(self):
        self.assertEqual(normalize('Chính xác.'), 'chính xác.')


if __name__ == '__main__':
    unittest.main()
