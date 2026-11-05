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

    def test_tham_chieu_phu_luc_khong_ton_tai(self):
        kq = kiem_tra("Tiêu chí chọn mẫu tại Phụ lục 1.", tieu_de_khac=[])
        self.assertEqual(len(muc(kq, "tham-chieu-hong")), 1)

    def test_tham_chieu_phu_luc_co_trong_file_khac(self):
        kq = kiem_tra("Xem Phụ lục 1.", tieu_de_khac=["Phụ lục 1. Tiêu chí chọn mẫu"])
        self.assertEqual(len(muc(kq, "tham-chieu-hong")), 0)

    def test_tham_chieu_phu_luc_co_trong_cung_file(self):
        kq = kiem_tra("Xem Phụ lục 2.\n\n## Phụ lục 2. Bảng hỏi\n…")
        self.assertEqual(len(muc(kq, "tham-chieu-hong")), 0)

    def test_trich_dan_khong_co_trong_nguyen_van(self):
        nv = "K5: \"Hợp đồng, giao dịch bị vô hiệu theo quyết định của Tòa án\""
        van = "Khoản 5 quy định \"Hợp đồng, giao dịch bị hủy bỏ theo quyết định của Tòa án\"."
        kq = kiem_tra(van, nguyen_van=nv)
        self.assertEqual(len(muc(kq, "trich-ngoai-nguyen-van")), 1)

    def test_trich_dan_co_trong_nguyen_van(self):
        nv = "K5: \"Hợp đồng, giao dịch bị vô hiệu theo quyết định của Tòa án và xử lý\""
        van = "Khoản 5 quy định hợp đồng “bị vô hiệu theo quyết định của Tòa án và xử lý”."
        kq = kiem_tra(van, nguyen_van=nv)
        self.assertEqual(len(muc(kq, "trich-ngoai-nguyen-van")), 0)

    def test_ngoac_thang_ghep_dung_cap(self):
        nv = "\"trình dự thảo hợp đồng, giao dịch hoặc giải trình\" và \"nội dung chủ yếu của hợp đồng, giao dịch\""
        van = ("Khoản 4 yêu cầu \"trình dự thảo hợp đồng, giao dịch hoặc giải trình\". Đoạn văn của người viết "
               "dài hơn hai mươi lăm ký tự ở giữa. Rồi \"nội dung chủ yếu của hợp đồng, giao dịch\".")
        kq = kiem_tra(van, nguyen_van=nv)
        self.assertEqual(len(muc(kq, "trich-ngoai-nguyen-van")), 0)

    def test_trich_co_dau_luoc_bo(self):
        nv = "\"ủy quyền cho HĐQT phê duyệt việc triển khai thực hiện các hợp đồng, giao dịch nêu trên, đảm bảo những hợp đồng này được thực hiện công bằng\""
        van = "Tờ trình đề nghị \"ủy quyền cho HĐQT phê duyệt việc triển khai … đảm bảo những hợp đồng này được thực hiện công bằng\"."
        kq = kiem_tra(van, nguyen_van=nv)
        self.assertEqual(len(muc(kq, "trich-ngoai-nguyen-van")), 0)

    def test_trich_ngan_bo_qua(self):
        kq = kiem_tra("Luật dùng chữ \"hoặc\".", nguyen_van="")
        self.assertEqual(len(muc(kq, "trich-ngoai-nguyen-van")), 0)

    def test_ghi_chu_ngoac_vuong_tu_dat_bi_chan_khi_nop(self):
        kq = kiem_tra("Hạn chế (iii). [Giả thuyết cần khảo sát: doanh nghiệp vẫn làm X.]", nop=True)
        self.assertTrue(any(v["muc"] == "CHẶN" for v in muc(kq, "ghi-chu-ngoac-vuong")))

    def test_ngoac_vuong_ngan_va_link_khong_bao(self):
        van = "Bărbulescu c. Roumanie [GC], xem [trang này](https://x.vn).[^1]\n\n[^1]: Nguồn."
        kq = kiem_tra(van, nop=True)
        self.assertEqual(len(muc(kq, "ghi-chu-ngoac-vuong")), 0)

    def test_han_che_khong_co_phan_chung(self):
        van = ("### 2.2.4. Những hạn chế rút ra\n\n"
               "(i) Luật chưa quy định X, nên doanh nghiệp lúng túng.\n"
               "(ii) Thiếu tiêu chí Y; theo trả lời của Bộ Z thì…[^3]\n"
               "(iii) Chưa có hướng dẫn W (chưa tìm thấy hướng dẫn chính thức, tìm ngày 05/11/2026).\n"
               "(iv) Mâu thuẫn V (xem 2.2.2).\n\n"
               "[^3]: Nguồn.")
        v = muc(kiem_tra(van), "han-che-chua-phan-chung")
        self.assertEqual(len(v), 1)
        self.assertIn("(i)", v[0]["noi_dung"])

    def test_ngoai_muc_han_che_khong_kiem(self):
        van = "### 2.2.1. Bối cảnh\n\n(i) Một ý không có chú thích.\n"
        self.assertEqual(len(muc(kiem_tra(van), "han-che-chua-phan-chung")), 0)

    def test_khang_dinh_lan_dau_khong_nguon(self):
        van = "Luật số 106/2025/QH15 lần đầu đưa tài sản số vào biện pháp phong tỏa. Câu sau.[^1]\n\n[^1]: Nguồn."
        self.assertEqual(len(muc(kiem_tra(van), "khang-dinh-so-sanh-khong-nguon")), 1)

    def test_khang_dinh_lan_dau_co_nguon(self):
        van = "Luật số 106/2025/QH15 lần đầu đưa tài sản số vào biện pháp phong tỏa.[^1]\n\n[^1]: Nguồn."
        self.assertEqual(len(muc(kiem_tra(van), "khang-dinh-so-sanh-khong-nguon")), 0)

    def test_dau_tien_trong_thuat_ngu_va_tieu_de_khong_bao(self):
        van = ("### 2.1. Tin nhắn đăng ký quảng cáo đầu tiên\n\n"
               "Người quảng cáo gửi tin nhắn đăng ký quảng cáo đầu tiên khi chưa có đồng ý. "
               "Nghị định cho gửi \"tin nhắn đăng ký quảng cáo đầu tiên và duy nhất\".")
        self.assertEqual(len(muc(kiem_tra(van), "khang-dinh-so-sanh-khong-nguon")), 0)

    def test_la_van_ban_dau_tien_van_bao(self):
        van = "Luật số 91/2025/QH15 là văn bản đầu tiên quy định về quảng cáo dựa trên dữ liệu."
        self.assertEqual(len(muc(kiem_tra(van), "khang-dinh-so-sanh-khong-nguon")), 1)

    def test_ban_sach_khong_loi_chan(self):
        van = (
            "Khoản 1 Điều 4 Luật Doanh nghiệp (Luật số 59/2020/QH14) quy định…[^1]\n\n"
            "[^1]: Nguyễn Văn A (2022), \"Tên bài\", *Tạp chí Luật học*, số 3, tr. 10"
        )
        kq = kiem_tra(van, nop=True)
        self.assertFalse(any(v["muc"] == "CHẶN" for v in kq))


if __name__ == "__main__":
    unittest.main()
