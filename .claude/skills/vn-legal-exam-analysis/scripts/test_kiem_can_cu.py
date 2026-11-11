"""Test cho kho_luat.py và kiem_can_cu.py. Chạy: python3 -m unittest discover -s scripts -p 'test_*.py'"""
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kho_luat as K  # noqa: E402
import kiem_can_cu as C  # noqa: E402

LDN = ("# Luật Doanh nghiệp 59/2020/QH14 (hiệu lực 01/01/2021), sửa đổi bởi Luật 03/2022/QH15 — bản thử\n\nChương I\n\n"
       "Điều 58. Điều kiện họp\n\n1. Cuộc họp Hội đồng thành viên được tiến hành khi có số thành viên dự họp sở hữu từ 65% vốn điều lệ trở lên.\n\n"
       "2. Trường hợp cuộc họp lần thứ nhất không đủ điều kiện:\n\na) Thông báo mời họp lần thứ hai phải được gửi trong thời hạn 15 ngày;\n\n"
       "b) Cuộc họp lần thứ ba được tiến hành không phụ thuộc số thành viên dự họp.\n\n"
       "Điều 59. Nghị quyết\n\nNghị quyết được thông qua theo quy định của Điều lệ.\n")
BLDS = ("# Bộ luật Dân sự 91/2015/QH13 (hiệu lực 01/01/2017)\n\nĐiều 117. Điều kiện có hiệu lực của giao dịch dân sự\n\n"
        "1. Giao dịch dân sự có hiệu lực khi có đủ các điều kiện sau đây:\n\na) Chủ thể có năng lực pháp luật dân sự;\n\n"
        "Điều 129. Giao dịch vô hiệu do hình thức\n\nGiao dịch dân sự vi phạm quy định điều kiện có hiệu lực về hình thức thì vô hiệu.\n")
HP = "# LAW: Hiến pháp nước Cộng hòa xã hội chủ nghĩa Việt Nam 2013, đã sửa đổi\n\nĐiều 1\n\nNước Việt Nam là một nước độc lập.\n\nĐiều 2\n\n1. Nhà nước pháp quyền.\n"
CBCC = "# Luật Cán bộ, công chức số 80/2025/QH15 (hiệu lực 01/7/2025)\n\nĐiều 1. Phạm vi\n\nLuật này quy định về cán bộ, công chức.\n"


class Kho(unittest.TestCase):
    def setUp(self):
        self.tam = tempfile.TemporaryDirectory()
        for ten, nd in (("ldn-thu.txt", LDN), ("blds-thu.txt", BLDS), ("hp-thu.txt", HP), ("cbcc-thu.txt", CBCC),
                        ("ghi-chu.txt", "# Trích slide bài giảng\n\nKhông phải văn bản.\n")):
            with open(os.path.join(self.tam.name, ten), "w", encoding="utf-8") as f:
                f.write(nd)
        self.may = C.May(self.tam.name)

    def tearDown(self):
        self.tam.cleanup()

    def kq(self, van):
        return [(r["kq"], r["dieu"], r["vb"].ten if r["vb"] else None) for r in self.may.kiem(van)]

    # ---- chỉ mục kho
    def test_doc_tieu_de(self):
        theo_tep = {v.tep: v for v in self.may.vb}
        self.assertNotIn("ghi-chu.txt", theo_tep)
        self.assertEqual((theo_tep["ldn-thu.txt"].ten, theo_tep["ldn-thu.txt"].so, theo_tep["ldn-thu.txt"].nam), ("Luật Doanh nghiệp", "59/2020/QH14", 2020))
        self.assertEqual(theo_tep["cbcc-thu.txt"].ten, "Luật Cán bộ, công chức")
        self.assertEqual((theo_tep["hp-thu.txt"].ten, theo_tep["hp-thu.txt"].nam), ("Hiến pháp", 2013))
        self.assertIn("BLDS", theo_tep["blds-thu.txt"].ten_goi())

    def test_dieu_khong_co_ten_cua_hien_phap(self):
        self.assertEqual(sorted(K.doc_cac_dieu(os.path.join(self.tam.name, "hp-thu.txt"))), ["1", "2"])

    def test_tieu_de_dieu_dinh_ten_chuong(self):
        with open(os.path.join(self.tam.name, "dinh.txt"), "w", encoding="utf-8") as f:
            f.write("# Luật Thử dính 01/2024/QH15\n\nĐiều 1. Phạm vi\n\nNội dung.\n\nChương X\n\nĐIỀU KHOẢN THI HÀNH Điều 2. Hiệu lực thi hành\n\nLuật này có hiệu lực.\n")
        self.assertEqual(sorted(K.doc_cac_dieu(os.path.join(self.tam.name, "dinh.txt"))), ["1", "2"])

    def test_van_ban_viet_tat_ngoai_kho_khong_bi_gan_nham(self):
        van = "Hạn mức chấp thuận (Điều 58 LDN ↔ Điều 293 NĐ 155 sửa đổi bởi NĐ 245/2025) là ngách của đề tài."
        self.assertEqual(self.kq(van), [("khop", "58", "Luật Doanh nghiệp"), ("ngoai_kho", "293", None)])

    # ---- căn cứ đúng
    def test_khop_dieu_khoan_diem(self):
        self.assertEqual(self.kq("Theo điểm a khoản 2 Điều 58 Luật Doanh nghiệp năm 2020 thì phải gửi thông báo."), [("khop", "58", "Luật Doanh nghiệp")])

    def test_van_ban_dung_truoc_va_cung_luat(self):
        van = "Luật Doanh nghiệp năm 2020 quy định tại khoản 1 Điều 58 về điều kiện họp. Điều 59 cùng luật nói về nghị quyết."
        self.assertEqual(self.kq(van), [("khop", "58", "Luật Doanh nghiệp"), ("khop", "59", "Luật Doanh nghiệp")])

    def test_viet_tat_va_so_hieu(self):
        self.assertEqual(self.kq("Điều 117 BLDS 2015 và Điều 129 Bộ luật Dân sự số 91/2015/QH13."), [("khop", "117", "Bộ luật Dân sự"), ("khop", "129", "Bộ luật Dân sự")])

    def test_danh_sach_dieu(self):
        self.assertEqual([k for k, _, _ in self.kq("Điều 58, 59 Luật Doanh nghiệp quy định.")], ["khop", "khop"])

    # ---- căn cứ sai: đây là thứ máy sinh ra để bắt
    def test_dieu_khong_ton_tai(self):
        r = self.may.kiem("Theo Điều 300 Luật Doanh nghiệp năm 2020 thì hợp đồng vô hiệu.")[0]
        self.assertEqual((r["kq"], r["dich_danh"]), ("sai", True))
        self.assertIn("không có Điều 300", r["loi"])

    def test_van_ban_dung_truoc_cung_cau_la_dich_danh_khac_cau_thi_khong(self):
        r = self.may.kiem("Luật Doanh nghiệp năm 2020 quy định tại khoản 9 Điều 58 về điều kiện họp.")[0]
        self.assertEqual((r["kq"], r["dich_danh"]), ("sai", True))
        r = self.may.kiem("Luật Doanh nghiệp năm 2020 có nhiều quy định. Ngưỡng tại Điều 293 chưa rõ.")[0]
        self.assertEqual((r["kq"], r["dich_danh"]), ("sai", False))

    def test_khoan_khong_ton_tai(self):
        r = self.may.kiem("khoản 5 Điều 58 Luật Doanh nghiệp năm 2020")[0]
        self.assertEqual(r["kq"], "sai")
        self.assertIn("không có khoản 5", r["loi"])
        self.assertIn("điều này không chia khoản", self.may.kiem("khoản 2 Điều 129 Bộ luật Dân sự 2015")[0]["loi"])

    def test_diem_khong_ton_tai(self):
        self.assertIn("không có điểm d", self.may.kiem("điểm d khoản 2 Điều 58 Luật Doanh nghiệp")[0]["loi"])

    def test_ma_thoat(self):
        tep = os.path.join(self.tam.name, "nhap.md")
        with open(tep, "w", encoding="utf-8") as f:
            f.write("Sai. Khoản 9 Điều 58 Luật Doanh nghiệp năm 2020 cấm việc này.")
        self.assertEqual(C.main([tep, "--kho", self.tam.name]), 1)
        with open(tep, "w", encoding="utf-8") as f:
            f.write("Sai. Khoản 1 Điều 58 Luật Doanh nghiệp năm 2020 yêu cầu 65%.")
        self.assertEqual(C.main([tep, "--kho", self.tam.name]), 0)

    # ---- không kiểm được thì nói là không kiểm được, không báo sai
    def test_ngoai_kho_va_khac_ban(self):
        self.assertEqual(self.kq("Điều 8 Nghị quyết 04/2019/NQ-HĐTP quy định.")[0][0], "ngoai_kho")
        self.assertEqual(self.kq("Điều 1(1)(a) CISG đòi cả hai quốc gia.")[0][0], "ngoai_kho")
        r = self.may.kiem("Điều 122 Bộ luật Dân sự năm 2005 quy định điều kiện có hiệu lực.")[0]
        self.assertEqual(r["kq"], "khac_ban")
        self.assertIn("CŨ hơn", r["loi"])

    def test_khong_ro_van_ban(self):
        self.assertEqual(self.kq("Theo Điều 5 thì không được.")[0][0], "khong_ro")

    def test_luat_sua_doi_khong_lam_ngu_canh(self):
        van = "Luật Doanh nghiệp năm 2020 (đã được sửa đổi, bổ sung bởi Luật số 91/2015/QH13) quy định tại khoản 2 Điều 58."
        self.assertEqual(self.kq(van), [("khop", "58", "Luật Doanh nghiệp")])

    def test_ngu_canh_muc_thu_van_ban_khac(self):
        van = "## Mục\n\nLuật Doanh nghiệp năm 2020 có Điều 58.\n\nBộ luật Dân sự 2015 có Điều 117.\n\nRiêng điểm a khoản 2 Điều 58 thì khác."
        r = self.may.kiem(van)[-1]
        self.assertEqual((r["kq"], r["vb"].ten, r["suy"]), ("khop", "Luật Doanh nghiệp", True))

    def test_dieu_da_bai_bo(self):
        self.assertEqual(self.kq("Luật mới bãi bỏ từ Điều 102 đến Điều 104 Luật Doanh nghiệp năm 2020.")[0][0], "bai_bo")

    # ---- nguyên văn
    def test_trich_nguyen_van(self):
        dung = 'Khoản 1 Điều 58 Luật Doanh nghiệp quy định “Cuộc họp Hội đồng thành viên được tiến hành khi có số thành viên dự họp sở hữu từ 65% vốn điều lệ trở lên”.'
        self.assertEqual(self.may.kiem(dung)[0].get("trich"), "khop")
        lech = 'Khoản 1 Điều 58 Luật Doanh nghiệp quy định “Cuộc họp chỉ được tiến hành khi có đủ 75% vốn điều lệ dự họp”.'
        self.assertIn("trich_lech", [r["kq"] for r in self.may.kiem(lech)])
        nham = 'Điều 59 Luật Doanh nghiệp quy định “Cuộc họp Hội đồng thành viên được tiến hành khi có số thành viên dự họp sở hữu từ 65% vốn điều lệ trở lên”.'
        self.assertIn("nằm ở Điều 58", [r for r in self.may.kiem(nham) if r["kq"] == "trich_lech"][0]["loi"])


if __name__ == "__main__":
    unittest.main()
