"""Test cho lint_ccpl.py. Chay: python3 -I scripts/test_lint_ccpl.py"""
import os
import subprocess
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lint_ccpl  # noqa: E402

SCRIPT = os.path.join(HERE, "lint_ccpl.py")


def codes(text):
    return [f.code for f in lint_ccpl.lint_text(text)]


class RuleTests(unittest.TestCase):
    # CCPL01 viet hoa Khoan/Diem
    def test_01_sai_giua_cau(self):
        self.assertIn("CCPL01", codes("Theo Khoản 2 Điều 5 Bộ luật Dân sự năm 2015 thì đúng."))
        self.assertIn("CCPL01", codes("Căn cứ Điểm a khoản 1 Điều 5 thì sai."))

    def test_01_dung(self):
        self.assertNotIn("CCPL01", codes("Theo khoản 2 Điều 5 Bộ luật Dân sự năm 2015 thì đúng."))
        self.assertNotIn("CCPL01", codes("Khoản 2 Điều 5 quy định như vậy."))  # dau cau
        self.assertNotIn("CCPL01", codes("Đúng. Điểm a khoản 1 Điều 5 cho phép."))
        self.assertNotIn("CCPL01", codes("- Khoản 2 Điều 5 cho phép."))
        self.assertNotIn("CCPL01", codes("Theo Điểm yếu của lập luận này thì sai."))  # khong di kem chu/so

    # CCPL02 dieu viet thuong
    def test_02(self):
        self.assertIn("CCPL02", codes("Theo điều 58 Luật Doanh nghiệp năm 2020 thì đúng."))
        self.assertNotIn("CCPL02", codes("Theo Điều 58 Luật Doanh nghiệp năm 2020 thì đúng."))
        self.assertNotIn("CCPL02", codes("Các điều ước quốc tế và điều kiện có hiệu lực."))

    # CCPL03 trat tu nguoc
    def test_03(self):
        self.assertIn("CCPL03", codes("Theo Điều 51 khoản 2 điểm a Luật Thương mại năm 2005."))
        self.assertIn("CCPL03", codes("Theo khoản 2 điểm a Điều 51 Luật Thương mại năm 2005."))
        self.assertNotIn("CCPL03", codes("Theo điểm a khoản 2 Điều 51 Luật Thương mại năm 2005."))
        self.assertNotIn("CCPL03", codes("Điều 51 khoản này không liên quan; Điều 5 điểm yếu."))

    # CCPL04 viet tat
    def test_04(self):
        self.assertIn("CCPL04", codes("Theo k.2 Đ.5 BLDS thì đúng."))
        self.assertIn("CCPL04", codes("Theo đ. 3 k. 2 Đ. 5 BLDS."))
        self.assertIn("CCPL04", codes("Theo K2 Đ5 BLDS."))
        self.assertNotIn("CCPL04", codes("Phạt 500.000 đ. Sau đó Đồng nai."))
        self.assertNotIn("CCPL04", codes("Theo khoản 2 Điều 5 BLDS."))

    # CCPL05 duoi luat thieu so hieu
    def test_05(self):
        self.assertIn("CCPL05", codes("Theo nghị định về bảo vệ dữ liệu cá nhân thì đúng."))
        self.assertNotIn("CCPL05", codes("Nghị định quy định chi tiết điều này; thông tư hướng dẫn mức phạt."))
        self.assertNotIn("CCPL05", codes("Các nghị định về lĩnh vực này thường sửa đổi."))
        self.assertNotIn("CCPL05", codes("Theo Nghị định 356/2025/NĐ-CP về bảo vệ dữ liệu cá nhân thì đúng."))
        self.assertNotIn("CCPL05", codes("Nghị định số 30/2020/NĐ-CP về công tác văn thư."))

    # CCPL06 so hieu sai dang
    def test_06(self):
        self.assertIn("CCPL06", codes("Theo Nghị định 356/2025 thì đúng."))
        self.assertIn("CCPL06", codes("Nghị định 356/2025/ND-CP quy định."))
        self.assertIn("CCPL06", codes("Nghị định 356/2025/NĐCP quy định."))
        self.assertIn("CCPL06", codes("Luật Doanh nghiệp số 59/2020/QH15."))
        self.assertNotIn("CCPL06", codes("Theo Luật 64/2025 thì đúng."))
        self.assertNotIn("CCPL06", codes("Nghị định 356/2025/NĐ-CP và Luật số 59/2020/QH14."))
        self.assertNotIn("CCPL06", codes("Bộ luật Dân sự số 91/2015/QH13."))

    # CCPL07 VBHN
    def test_07(self):
        self.assertIn("CCPL07", codes("Theo Văn bản hợp nhất 05/VBHN-VPQH thì đúng."))
        self.assertIn("CCPL07", codes("Căn cứ 10/VBHN-BTP để kết luận."))
        self.assertNotIn("CCPL07", codes("Văn bản hợp nhất (ký hiệu VBHN) chỉ là công cụ tra cứu."))
        self.assertNotIn("CCPL07", codes("Văn bản 11/VBHN-TANDTC để đọc nhanh, tuyệt đối không dùng làm căn cứ theo quy tắc chung."))

    # CCPL08 van ban bi thay the
    def test_08(self):
        self.assertIn("CCPL08", codes("Theo Nghị định 13/2023/NĐ-CP thì phải có sự đồng ý."))
        self.assertIn("CCPL08", codes("Theo Luật Ban hành văn bản quy phạm pháp luật số 80/2015/QH13 thì đúng."))
        self.assertIn("CCPL08", codes("Theo Điều 122 Bộ luật Dân sự năm 2005 thì giao dịch có hiệu lực."))
        self.assertIn("CCPL08", codes("Theo Thông tư 01/2011/TT-BNV thì viết hoa."))
        self.assertNotIn("CCPL08", codes("Nghị định 13/2023/NĐ-CP đã hết hiệu lực từ 01/01/2026."))
        self.assertNotIn("CCPL08", codes("Nghị định 356/2025/NĐ-CP thay thế Nghị định 13/2023/NĐ-CP."))
        self.assertNotIn("CCPL08", codes("Trước đây Điều 122 Bộ luật Dân sự năm 2005 quy định điều kiện."))
        self.assertNotIn("CCPL08", codes("Theo Nghị định 356/2025/NĐ-CP thì đúng."))

    # CCPL09 cum vo gia tri
    def test_09(self):
        self.assertIn("CCPL09", codes("Việc này bị cấm theo quy định pháp luật hiện hành."))
        self.assertNotIn("CCPL09", codes("Việc này bị cấm theo Điều 5 Bộ luật Dân sự năm 2015."))


class IgnoreTests(unittest.TestCase):
    def test_code_block(self):
        self.assertEqual(codes("```\nTheo Khoản 2 điều 5\n```\n"), [])

    def test_inline_code(self):
        self.assertEqual(codes("Viết `Khoản 2` là sai."), [])

    def test_lint_ignore_marker(self):
        self.assertEqual(codes("Theo Khoản 2 điều 5 <!-- lint-ignore -->"), [])
        self.assertEqual(codes("Theo Khoản 2 điều 5 lint-ignore"), [])

    def test_sai_chuan_markers(self):
        self.assertEqual(codes('Trật tự "Điều 51 khoản 2" là sai chuẩn.'), [])
        self.assertEqual(codes("Ví dụ sai: theo Khoản 2 Điều 5."), [])
        self.assertEqual(codes("Theo Khoản 2 Điều 5 (sai)"), [])

    def test_quoted_mention_with_prohibition(self):
        self.assertEqual(
            codes('Không được viết "nghị định về bảo vệ dữ liệu cá nhân".'), [])

    def test_line_numbers(self):
        f = lint_ccpl.lint_text("ok\nTheo điều 5 BLDS.\n")
        self.assertEqual([(x.line, x.code) for x in f], [(2, "CCPL02")])


class CliTests(unittest.TestCase):
    def run_cli(self, *args, stdin=None):
        return subprocess.run([sys.executable, "-I", SCRIPT, *args], input=stdin,
                              capture_output=True, text=True)

    def test_exit_1_on_error_and_format(self):
        with tempfile.TemporaryDirectory() as d:
            p = os.path.join(d, "a.md")
            with open(p, "w", encoding="utf-8") as fh:
                fh.write("Theo điều 5 BLDS.\n")
            r = self.run_cli(p)
            self.assertEqual(r.returncode, 1)
            self.assertIn(p + ":1: [CCPL02", r.stdout)
            self.assertIn(" — ", r.stdout)

    def test_exit_0_on_warning_only(self):
        r = self.run_cli("--stdin", stdin="Theo quy định pháp luật hiện hành thì sai.\n")
        self.assertEqual(r.returncode, 0)
        self.assertIn("CCPL09", r.stdout)

    def test_exit_0_clean(self):
        r = self.run_cli("--stdin", stdin="Sai. Theo khoản 2 Điều 5 Bộ luật Dân sự năm 2015.\n")
        self.assertEqual(r.returncode, 0)
        self.assertEqual(r.stdout.strip(), "")

    def test_stdin_error(self):
        r = self.run_cli("--stdin", stdin="Theo Khoản 2 Điều 5 BLDS.\n")
        self.assertEqual(r.returncode, 1)
        self.assertIn("<stdin>:1:", r.stdout)

    def test_directory(self):
        with tempfile.TemporaryDirectory() as d:
            with open(os.path.join(d, "x.md"), "w", encoding="utf-8") as fh:
                fh.write("Theo điều 5.\n")
            self.assertEqual(self.run_cli(d).returncode, 1)

    def test_superseded_json_loads(self):
        data = lint_ccpl.load_superseded()
        self.assertTrue(len(data) >= 4)


class ReviewFixTests(unittest.TestCase):
    """Cac ca bao nham do review cuoi chi ra."""
    def test_03_liet_ke_nhieu_can_cu(self):
        self.assertNotIn("CCPL03", codes("Căn cứ Điều 26, khoản 3 Điều 35 Bộ luật Tố tụng dân sự năm 2015."))
        self.assertNotIn("CCPL03", codes("Căn cứ Điều 147, điểm b khoản 1 Điều 228 Bộ luật Tố tụng dân sự năm 2015."))
        self.assertIn("CCPL03", codes("Theo Điều 51 khoản 2 Luật Thương mại năm 2005."))

    def test_08_thong_tu_trung_so(self):
        for s in ("Thông tư số 80/2015/TT-BTC quy định.", "Thông tư số 13/2023/TT-BYT quy định.", "Thông tư 69/2018/TT-BTC quy định."):
            self.assertNotIn("CCPL08", codes(s), s)
        self.assertIn("CCPL08", codes("Theo Nghị định 13/2023/NĐ-CP thì phải xin đồng ý."))
        self.assertIn("CCPL08", codes("Theo Nghị định 13/2023 thì phải xin đồng ý."))

    def test_08_dieu_122_khong_nam(self):
        self.assertIn("CCPL08", codes("Theo Điều 122 Bộ luật Dân sự, giao dịch có hiệu lực khi đủ điều kiện."))
        self.assertNotIn("CCPL08", codes("Theo Điều 122 Bộ luật Dân sự năm 2015, giao dịch không đủ điều kiện thì vô hiệu."))

    def test_02_cac_dieu_so_nhieu(self):
        # cach viet cua chinh van ban luat: "cac dieu 26, 28, 30 va 32"
        self.assertNotIn("CCPL02", codes("Tranh chấp quy định tại các điều 26, 28, 30 và 32 của Bộ luật này."))
        self.assertNotIn("CCPL02", codes("Các điều 374–376 còn quy định chia hương hỏa."))
        self.assertIn("CCPL02", codes("Theo điều 26 Bộ luật Tố tụng dân sự năm 2015 thì đúng."))

    def test_03_liet_ke_khoan_khoang(self):
        self.assertNotIn("CCPL03", codes("Căn cứ Điều 609, khoản 1, khoản 2 Điều 611 Bộ luật Dân sự năm 2015."))
        self.assertNotIn("CCPL03", codes("Căn cứ Điều 4, khoản 4, 5 Điều 5, khoản 6 Điều 19 Luật Quốc tịch."))
        self.assertNotIn("CCPL03", codes("Căn cứ Điều 93, khoản 1–5 Điều 94 Bộ luật Tố tụng dân sự năm 2015."))
        self.assertIn("CCPL03", codes("Theo Điều 2, khoản 7 thì đây là tội bất đạo."))

    def test_08_dong_tu_thay(self):
        self.assertNotIn("CCPL08", codes("Luật Phục hồi, phá sản 142/2025/QH15 thay Luật Phá sản 2014 từ 01/3/2026."))

    def test_08_van_ban_thay_the_2025_2026(self):
        self.assertIn("CCPL08", codes("Theo Điều 3 Luật Đầu tư năm 2020 thì nhà đầu tư được ưu đãi."))
        self.assertIn("CCPL08", codes("Theo Luật Phá sản 51/2014/QH13 thì Tòa án mở thủ tục."))
        self.assertIn("CCPL08", codes("Căn cứ Nghị định 01/2021/NĐ-CP thì hộ kinh doanh đăng ký tại xã."))
        self.assertNotIn("CCPL08", codes("Luật Đầu tư số 143/2025/QH15 thay thế Luật Đầu tư năm 2020 từ 01/3/2026."))
        # khong nham ngay thang voi so hieu
        self.assertNotIn("CCPL08", codes("Bộ luật Lao động có hiệu lực từ 01/01/2021."))
        self.assertNotIn("CCPL08", codes("Hợp đồng ký ngày 15/06/2012 và ngày 01/04/2007."))

    def test_07_mot_lan_moi_cau(self):
        self.assertEqual(codes("Theo VBHN 01/VBHN-VPQH, quy định như sau.").count("CCPL07"), 1)

    def test_01_sau_hai_cham_la_warning(self):
        fs = [f for f in lint_ccpl.lint_text("Lưu ý: Khoản 2 Điều 5 Bộ luật Dân sự năm 2015 cho phép.") if f.code == "CCPL01"]
        self.assertTrue(fs and all(f.severity == "warning" for f in fs))


if __name__ == "__main__":
    unittest.main()
