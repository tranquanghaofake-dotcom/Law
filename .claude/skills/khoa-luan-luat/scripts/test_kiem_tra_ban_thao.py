"""Test cho kiem_tra_ban_thao.py — chạy: python3 -m unittest discover -s scripts -p 'test_*.py'"""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kiem_tra_ban_thao import kiem_tra  # noqa: E402


def muc(ket_qua, ma):
    return [v for v in ket_qua if v["ma"] == ma]


class KiemTraBanThao(unittest.TestCase):
    def test_nhan_can_kiem_la_loi_chan_khi_nop(self):
        kq = kiem_tra("Theo bài viết [CẦN KIỂM: số trang] thì…", nop=True)
        self.assertTrue(any(v["muc"] == "CHẶN" for v in muc(kq, "nhan-con-sot")))

    def test_nhan_suy_luan_chi_canh_bao_khi_nhap(self):
        kq = kiem_tra("[SUY LUẬN] Quy định này chưa hợp lý.", nop=False)
        v = muc(kq, "nhan-con-sot")
        self.assertEqual(len(v), 1)
        self.assertEqual(v[0]["muc"], "NHẸ")

    def test_footnote_dung_ma_khong_dinh_nghia(self):
        kq = kiem_tra("Câu có chú thích.[^1] Câu khác.[^2]\n\n[^1]: Nguồn A, tr. 3")
        self.assertEqual(len(muc(kq, "footnote-thieu")), 1)

    def test_footnote_dinh_nghia_khong_dung(self):
        kq = kiem_tra("Không chú thích.\n\n[^9]: Nguồn thừa")
        self.assertEqual(len(muc(kq, "footnote-thua")), 1)

    def test_nghi_dinh_thieu_so_hieu(self):
        kq = kiem_tra("Nghị định của Chính phủ hướng dẫn Luật Doanh nghiệp quy định rằng…")
        self.assertEqual(len(muc(kq, "thieu-so-hieu")), 1)

    def test_nghi_dinh_co_so_hieu_khong_bao(self):
        kq = kiem_tra("Nghị định số 01/2021/NĐ-CP ngày 04/01/2021 quy định…")
        self.assertEqual(len(muc(kq, "thieu-so-hieu")), 0)

    def test_nghi_quyet_dang_co_so_hieu_khong_bao(self):
        kq = kiem_tra("Nghị quyết số 57-NQ/TW ngày 22/12/2024 của Bộ Chính trị đặt mục tiêu…")
        self.assertEqual(len(muc(kq, "thieu-so-hieu")), 0)

    def test_an_danh_phat_hien_ten_truong(self):
        kq = kiem_tra("Nhóm sinh viên Trường Đại học Luật X thực hiện.", an_danh=["Đại học Luật X"])
        self.assertTrue(any(v["muc"] == "CHẶN" for v in muc(kq, "lo-danh-tinh")))

    def test_an_danh_cam_loi_cam_on(self):
        kq = kiem_tra("# LỜI CẢM ƠN\nXin cảm ơn thầy.", an_danh=[])
        self.assertEqual(len(muc(kq, "lo-danh-tinh")), 1)

    def test_cum_tu_sao_rong(self):
        kq = kiem_tra("Vấn đề này vô cùng quan trọng trong bối cảnh hội nhập quốc tế sâu rộng.")
        self.assertGreaterEqual(len(muc(kq, "van-sao-rong")), 1)

    def test_ban_sach_khong_loi_chan(self):
        van = (
            "Khoản 1 Điều 4 Luật Doanh nghiệp (Luật số 59/2020/QH14) quy định…[^1]\n\n"
            "[^1]: Nguyễn Văn A (2022), \"Tên bài\", *Tạp chí Luật học*, số 3, tr. 10"
        )
        kq = kiem_tra(van, nop=True)
        self.assertFalse(any(v["muc"] == "CHẶN" for v in kq))


if __name__ == "__main__":
    unittest.main()
