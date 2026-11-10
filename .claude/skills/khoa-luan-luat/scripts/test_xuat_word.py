"""Test cho xuat_word.py — chạy: python3 -m unittest discover -s scripts -p 'test_*.py'"""
import contextlib
import io
import os
import shutil
import sys
import tempfile
import unittest
import zipfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import xuat_word  # noqa: E402

try:
    import docx
    from docx.shared import Cm
    CO_CONG_CU = bool(shutil.which("pandoc"))
except ImportError:
    CO_CONG_CU = False

CHUONG = """# CHƯƠNG 2. THỰC TRẠNG

## 2.1. Quy định hiện hành

Khoản 2 Điều 3 quy định về phạm vi áp dụng.[^1] Đoạn này đủ dài để kiểm căn đều hai bên và lùi đầu dòng.

> Đoạn trích dài hơn ba câu được tách riêng. Câu thứ hai của đoạn trích. Câu thứ ba của đoạn trích. Câu thứ tư.

| Tiêu chí | Việt Nam |
|---|---|
| Căn cứ | Điều 3 |

[^1]: Nguyễn Văn A (2024), "Tên bài", *Tạp chí Luật học*, số 3, tr. 12.
"""


def chay(*doi_so):
    ra, loi = io.StringIO(), io.StringIO()
    with contextlib.redirect_stdout(ra), contextlib.redirect_stderr(loi):
        ma = xuat_word.main(list(doi_so))
    return ma, ra.getvalue(), loi.getvalue()


class XuatWord(unittest.TestCase):
    def setUp(self):
        self.tam = tempfile.TemporaryDirectory()
        self.md = os.path.join(self.tam.name, "06-chuong-2.md")
        self.out = os.path.join(self.tam.name, "ra", "bai.docx")
        with open(self.md, "w", encoding="utf-8") as f:
            f.write(CHUONG)

    def tearDown(self):
        self.tam.cleanup()

    def test_tu_choi_ban_nop_con_nhan(self):
        with open(self.md, "a", encoding="utf-8") as f:
            f.write("\nMột ý chưa xác minh. [CẦN KIỂM: số liệu năm 2025]\n")
        ma, _, loi = chay(self.md, "-o", self.out)
        self.assertEqual(ma, 1)
        self.assertIn("CHẶN", loi)
        self.assertFalse(os.path.exists(self.out))

    def test_thieu_file_va_le_sai(self):
        self.assertEqual(chay(os.path.join(self.tam.name, "khong-co.md"), "-o", self.out)[0], 2)
        self.assertEqual(chay(self.md, "-o", self.out, "--le", "2,2,2")[0], 2)

    @unittest.skipUnless(CO_CONG_CU, "cần pandoc và python-docx")
    def test_hinh_thuc_trang_mac_dinh(self):
        ma, ra, _ = chay(self.md, "-o", self.out, "--tieu-de", "Đề tài thử", "--tac-gia", "Người Viết")
        self.assertEqual(ma, 0)
        self.assertIn("1 footnote", ra)
        d = docx.Document(self.out)
        s = d.sections[0]
        for thuc, mong in ((s.top_margin, 2.0), (s.bottom_margin, 2.5), (s.left_margin, 3.5), (s.right_margin, 2.0),
                           (s.page_width, 21.0), (s.page_height, 29.7)):
            self.assertAlmostEqual(thuc / Cm(1), mong, places=1)
        kieu_theo_ten = {k.name: k for k in d.styles}  # pandoc ghi "Heading 2" viết hoa nên tra qua tên hiển thị
        than = kieu_theo_ten["Body Text"]
        self.assertEqual(than.font.size.pt, 13)
        self.assertAlmostEqual(than.paragraph_format.line_spacing, 1.3)
        self.assertAlmostEqual(than.paragraph_format.first_line_indent / Cm(1), 1.0, places=1)
        self.assertEqual(kieu_theo_ten["Footnote Text"].font.size.pt, 10)
        self.assertAlmostEqual(kieu_theo_ten["Block Text"].paragraph_format.left_indent / Cm(1), 1.27, places=1)
        self.assertTrue(kieu_theo_ten["Heading 2"].font.bold)
        self.assertIn("PAGE", s.footer._element.xml)
        self.assertEqual(d.core_properties.author, "Người Viết")
        with zipfile.ZipFile(self.out) as z:
            self.assertIn("Tạp chí Luật học", z.read("word/footnotes.xml").decode("utf-8"))
            kieu = z.read("word/styles.xml").decode("utf-8")
        self.assertIn("Times New Roman", kieu)
        self.assertNotIn("asciiTheme", kieu.split("<w:style ", 1)[1])

    @unittest.skipUnless(CO_CONG_CU, "cần pandoc và python-docx")
    def test_bai_du_giai_an_danh_so_trang_tren(self):
        ma, _, _ = chay(self.md, "-o", self.out, "--an-danh", "--tac-gia", "Người Viết", "--so-trang", "tren")
        self.assertEqual(ma, 0)
        d = docx.Document(self.out)
        self.assertEqual(d.core_properties.author, "")
        self.assertIn("PAGE", d.sections[0].header._element.xml)
        self.assertNotIn("PAGE", d.sections[0].footer._element.xml)

    @unittest.skipUnless(CO_CONG_CU, "cần pandoc và python-docx")
    def test_ban_nhap_cho_phep_con_nhan(self):
        with open(self.md, "a", encoding="utf-8") as f:
            f.write("\nMột ý. [SUY LUẬN]\n")
        ma, ra, _ = chay(self.md, "-o", self.out, "--nhap")
        self.assertEqual(ma, 0)
        self.assertIn("BẢN NHÁP", ra)


if __name__ == "__main__":
    unittest.main()
