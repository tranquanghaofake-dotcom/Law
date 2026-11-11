"""Test cho kiem_dau_ra.py và tra_dieu.py. Chạy: python3 -m unittest discover -s scripts -p 'test_*.py'"""
import io
import os
import re
import sys
import tempfile
import unittest
from contextlib import redirect_stderr, redirect_stdout

HERE = os.path.dirname(os.path.abspath(__file__))
GOC = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import kiem_dau_ra as K  # noqa: E402
import tra_dieu as T  # noqa: E402

TOT = (
    "Sai. Khoản 3 Điều 188 Luật Doanh nghiệp năm 2020 chỉ cấm chủ doanh nghiệp tư nhân đồng thời là thành viên hợp danh. "
    "Khoản 1 Điều 177 cùng luật cho thấy công ty hợp danh có hai loại thành viên. Cấm một loại không đồng nghĩa cấm cả hai.\n\n"
    "Nhận định đánh vào chênh lệch giữa hai cụm từ gần giống nhau nhưng phạm vi khác nhau. Chủ thể bị cấm ở khoản 4 Điều 188 là doanh nghiệp, "
    "không phải cá nhân chủ doanh nghiệp. Viện dẫn khoản đó để chứng minh nhận định đúng là dẫn nhầm chủ thể. "
    "Nguyên tắc chống bẫy là phải chỉ ra điều cấm phủ đúng tình huống, không suy từ cảm giác. "
    "Hệ quả là chủ doanh nghiệp tư nhân vẫn có thể góp vốn vào công ty hợp danh với tư cách thành viên góp vốn, "
    "miễn là không tham gia điều hành.\n\n"
    "Cần đối chiếu trước khi dùng: khoản 3 Điều 188 — chưa đối chiếu số khoản."
)


def ma(van, dang="nhan-dinh", n=1, muc=("error",)):
    return [m for m, s, _ in K.kiem(van, dang, n) if s in muc]


class KiemDauRa(unittest.TestCase):
    def test_bai_tot_khong_loi(self):
        self.assertEqual(ma(TOT), [])

    def test_cau_dau_khong_phai_ket_luan(self):
        self.assertIn("DR01", ma("Nhận định này cần xem xét kỹ. Theo Điều 5 thì sai." + " chữ" * 150))

    def test_nguong_dung_duoc_mo_dau_bang_chua_du_can_cu(self):
        van = "Chưa đủ căn cứ để chốt: chưa đối chiếu được số khoản quyết định kết luận." + " chữ" * 120
        self.assertNotIn("DR01", ma(van))
        self.assertNotIn("DR10", ma(van))

    def test_cau_qua_40_chu(self):
        dai = "Sai. " + " ".join(["chữ"] * 45) + " theo Điều 5. Hết."
        self.assertIn("DR03", ma(dai))

    def test_chu_trong_ngoac_kep_khong_tinh_vao_cau(self):
        van = "Sai. Điều 5 quy định “" + " ".join(["chữ"] * 45) + "” nên nhận định sai.\n\n" + "Thêm một câu ngắn theo Điều 6. " * 5
        self.assertNotIn("DR03", ma(van))

    def test_khong_tach_cau_o_chu_viet_tat_va_so(self):
        cau = K.tach_cau("Đại học Luật TP. Hồ Chí Minh ra đề này. Tỷ lệ là 43,33% vốn điều lệ. Xong.")
        self.assertEqual(len(cau), 3)

    def test_doan_qua_sau_cau(self):
        van = "Sai. " + "Điều 5 nói vậy. " * 7
        self.assertIn("DR04", ma(van))

    def test_gach_dau_dong_va_de_muc(self):
        van = "Sai. Theo Điều 5 thì:\n- ý một\n- ý hai\n## Kết luận\n" + "chữ " * 150
        self.assertEqual(ma(van).count("DR05"), 3)

    def test_bang_chi_cho_so_sanh(self):
        van = "Hai chế định khác nhau ở Điều 5.\n\n| Tiêu chí | A | B |\n|---|---|---|\n| x | y | z |"
        self.assertIn("DR05", ma(van, "nhan-dinh"))
        self.assertNotIn("DR05", ma(van, "so-sanh"))

    def test_vien_dan_chung_chung(self):
        self.assertIn("DR08", ma("Sai. Theo quy định pháp luật hiện hành thì không được. Điều 5." + " chữ" * 150))

    def test_khong_bao_nham_theo_quy_dinh_phap_luat_ve(self):
        self.assertNotIn("DR08", ma("Sai. Theo quy định của pháp luật về đất đai tại Điều 5 thì không được." + " chữ" * 150))

    def test_vuot_tran_chu(self):
        self.assertIn("DR02", ma("Sai. Điều 5. " + "chữ " * 420))

    def test_tinh_huong_ngan_sach_nhan_theo_issue(self):
        van = "Hợp đồng vô hiệu theo Điều 5. " + "chữ " * 900
        self.assertIn("DR02", ma(van, "tinh-huong", 1))
        self.assertNotIn("DR02", ma(van, "tinh-huong", 2))

    def test_khong_co_ccpl(self):
        self.assertIn("DR10", ma("Sai. Vì luật không cho phép như vậy." + " chữ" * 150))

    def test_dong_nhac_phai_o_cuoi_va_duy_nhat(self):
        van = TOT + "\n\nThêm một đoạn sau dòng nhắc theo Điều 5."
        self.assertIn("DR12", ma(van))
        self.assertIn("DR12", ma(TOT + "\n" + K.DONG_NHAC + " lần hai."))

    def test_vang_dong_nhac_chi_la_info(self):
        van = TOT.split("\n\nCần đối chiếu")[0]
        self.assertEqual(ma(van), [])
        self.assertIn("DR12", ma(van, muc=("info",)))

    def test_goi_lint_ccpl(self):
        self.assertIn("CCPL01", ma("Sai. Theo Khoản 2 Điều 5 Bộ luật Dân sự năm 2015 thì không được." + " chữ" * 150))


class ViDuMauPhaiDat(unittest.TestCase):
    """Ví dụ là thứ được bắt chước: ví dụ vi phạm luật hình thức thì mọi câu trả lời sau đó vi phạm theo."""

    def lay(self, tep, ten):
        with open(os.path.join(GOC, tep), encoding="utf-8") as f:
            t = f.read()
        a = t.index(ten)
        ket = [x for x in (t.find("\n## ", a + 5), t.find("\n### ", a + 5)) if x > 0]
        khoi = t[a:(min(ket) if ket else len(t))]
        khoi = khoi[khoi.index("**Cách xử lý đúng:**") + len("**Cách xử lý đúng:**"):]
        return "\n".join(d for d in khoi.split("\n") if not re.match(r"^\*[^*].*\*$", d.strip())).strip()

    def test_nam_vi_du(self):
        ds = [("SKILL.md", "### Ví dụ 1", "nhan-dinh"), ("SKILL.md", "### Ví dụ 2", "nhan-dinh"),
              ("references/bai-tap-dinh-luong.md", "## Ví dụ 3", "tinh-huong"),
              ("references/cap-khai-niem-de-lan.md", "## Ví dụ 4", "so-sanh"),
              ("references/thuong-mai-quoc-te.md", "## Ví dụ 5", "nhan-dinh")]
        for tep, ten, dang in ds:
            with self.subTest(ten):
                loi = [(m, l) for m, s, l in K.kiem(self.lay(tep, ten), dang) if s == "error"]
                self.assertEqual(loi, [], f"{ten} vi phạm luật hình thức của chính skill")


class TraDieu(unittest.TestCase):
    LUAT = ("# Luật Thử nghiệm 01/2020/QH14 (hiệu lực 01/01/2021) — bản thử\n\nChương I\n\nQUY ĐỊNH CHUNG\n\n"
            "Điều 1. Phạm vi\n\nLuật này quy định về thử nghiệm.\n\n"
            "Điều 2. Tỷ lệ\n\n1. Cuộc họp được tiến hành khi có từ 65% vốn điều lệ trở lên.\n\n"
            "2. Nghị quyết được thông qua khi:\n\na) Được 65% tán thành;\n\nb) Được 75% tán thành đối với tổ chức lại.\n\n"
            "Chương II\n\nĐIỀU KHOẢN THI HÀNH\n\nĐiều 3. Hiệu lực\n\nLuật này có hiệu lực từ ngày 01 tháng 01 năm 2021.\n")

    def setUp(self):
        self.tam = tempfile.TemporaryDirectory()
        with open(os.path.join(self.tam.name, "thu-nghiem-2020.txt"), "w", encoding="utf-8") as f:
            f.write(self.LUAT)
        with open(os.path.join(self.tam.name, "blds-2015.txt"), "w", encoding="utf-8") as f:
            f.write("# Bộ luật Dân sự 91/2015/QH13\n\nĐiều 1. Phạm vi\n\nBộ luật này quy định địa vị pháp lý.\n")

    def tearDown(self):
        self.tam.cleanup()

    def chay(self, *doi_so):
        ra, loi = io.StringIO(), io.StringIO()
        with redirect_stdout(ra), redirect_stderr(loi):
            ma_thoat = T.main(["--kho", self.tam.name, *doi_so])
        return ma_thoat, ra.getvalue(), loi.getvalue()

    def test_in_dieu_khong_lan_sang_chuong_sau(self):
        ma_thoat, ra, _ = self.chay("thử nghiệm", "2")
        self.assertEqual(ma_thoat, 0)
        self.assertIn("Điều 2. Tỷ lệ", ra)
        self.assertIn("b) Được 75% tán thành", ra)
        self.assertNotIn("ĐIỀU KHOẢN THI HÀNH", ra)
        self.assertNotIn("Điều 3.", ra)

    def test_in_mot_khoan(self):
        ma_thoat, ra, _ = self.chay("thu-nghiem-2020", "2", "--khoan", "2")
        self.assertEqual(ma_thoat, 0)
        self.assertIn("a) Được 65% tán thành", ra)
        self.assertNotIn("Cuộc họp được tiến hành", ra)

    def test_tu_khoa_khong_dau_va_ten_van_ban(self):
        self.assertEqual(self.chay("dan su", "1")[0], 0)
        self.assertEqual(self.chay("THU NGHIEM", "1")[0], 0)

    def test_khong_co_dieu_hoac_van_ban(self):
        self.assertEqual(self.chay("thử nghiệm", "99")[0], 2)
        self.assertEqual(self.chay("hình sự", "1")[0], 2)
        self.assertEqual(self.chay("thử nghiệm", "2", "--khoan", "9")[0], 2)

    def test_tim_cum_tu(self):
        ma_thoat, ra, _ = self.chay("thử nghiệm", "--tim", "75%")
        self.assertEqual(ma_thoat, 0)
        self.assertIn("Điều 2:", ra)

    def test_tu_khoa_trung_nhieu_van_ban_uu_tien_ten_mo_dau(self):
        with open(os.path.join(self.tam.name, "tttn-2010.txt"), "w", encoding="utf-8") as f:
            f.write("# Luật Trọng tài thử nghiệm 54/2010/QH12\n\nĐiều 1. Phạm vi\n\nLuật này quy định về trọng tài.\n")
        ma_thoat, ra, _ = self.chay("thử nghiệm", "1")
        self.assertEqual(ma_thoat, 0)
        self.assertIn("thu-nghiem-2020.txt", ra)
        self.assertEqual(self.chay("luật", "1")[0], 2)  # vẫn mơ hồ thì liệt kê, không đoán

    def test_liet_ke(self):
        ma_thoat, ra, _ = self.chay("--liet-ke")
        self.assertEqual(ma_thoat, 0)
        self.assertIn("thu-nghiem-2020", ra)


if __name__ == "__main__":
    unittest.main()
