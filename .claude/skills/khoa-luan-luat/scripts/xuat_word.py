#!/usr/bin/env python3
"""Xuất các file chương .md thành MỘT file Word đúng hình thức trang mặc định của references/trinh-bay-trich-dan.md.

Dùng (pha 8):
  python3 scripts/xuat_word.py 06-chuong-1.md 06-chuong-2.md 06-chuong-3.md -o khoa-luan.docx
  python3 scripts/xuat_word.py 06-chuong-*.md -o bai-du-giai.docx --so-trang tren --an-danh      # Euréka
  python3 scripts/xuat_word.py 06-chuong-2.md -o nhap.docx --nhap                                # bản nháp còn nhãn

Mặc định: A4 · Times New Roman 13 · dòng 1,3 · lề trên 2,0 / dưới 2,5 / trái 3,5 / phải 2,0 cm · số trang giữa phía dưới
· footnote tự động cỡ 10 · đoạn trích tách riêng lùi trái 1,27 cm. Quy định của trường nói khác thì đổi bằng tham số.
Footnote viết trong .md theo dạng [^1] … [^1]: nội dung. Cần pandoc và python-docx; thiếu thì script báo và in thông số
để dựng bằng công cụ khác. Bản nộp còn nhãn [CẦN KIỂM], [SUY LUẬN]… thì script từ chối (thêm --nhap để xuất bản nháp).
"""
import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile

NHAN = re.compile(r"\[(CẦN KIỂM[^\]]*|NGUYÊN VĂN|NGUỒN NÓI|SUY LUẬN|ĐỀ XUẤT|NGƯỜI DÙNG)\]")
FONT = "Times New Roman"


def loi(thong_bao, ma=1):
    print(thong_bao, file=sys.stderr)
    return ma


def dat_font(style, co=None, dam=None, nghieng=None):
    """Đặt Times New Roman cho mọi hệ chữ và gỡ font theo theme của mẫu pandoc."""
    from docx.oxml.ns import qn
    from docx.shared import Pt, RGBColor
    rpr = style.element.get_or_add_rPr()
    rf = rpr.find(qn("w:rFonts"))
    if rf is None:
        rf = rpr.makeelement(qn("w:rFonts"), {})
        rpr.insert(0, rf)
    for a in list(rf.attrib):
        if a.endswith("Theme"):
            del rf.attrib[a]
    for a in ("w:ascii", "w:hAnsi", "w:eastAsia", "w:cs"):
        rf.set(qn(a), FONT)
    style.font.color.rgb = RGBColor(0, 0, 0)
    if co:
        style.font.size = Pt(co)
    if dam is not None:
        style.font.bold = dam
    if nghieng is not None:
        style.font.italic = nghieng


def them_so_trang(section, tren):
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn
    khu = section.header if tren else section.footer
    khu.is_linked_to_previous = False
    p = khu.paragraphs[0] if khu.paragraphs else khu.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run()
    for loai, chu in (("begin", None), (None, "PAGE"), ("end", None)):
        if loai:
            e = OxmlElement("w:fldChar")
            e.set(qn("w:fldCharType"), loai)
        else:
            e = OxmlElement("w:instrText")
            e.set(qn("xml:space"), "preserve")
            e.text = chu
        r._r.append(e)
    r.font.name = FONT


def ke_bang(bang):
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn
    pr = bang._tbl.tblPr
    vien = OxmlElement("w:tblBorders")
    for canh in ("top", "left", "bottom", "right", "insideH", "insideV"):
        e = OxmlElement(f"w:{canh}")
        e.set(qn("w:val"), "single")
        e.set(qn("w:sz"), "4")
        e.set(qn("w:color"), "000000")
        vien.append(e)
    pr.append(vien)


def dinh_dang(duong, a):
    import docx
    from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
    from docx.shared import Cm, Pt

    d = docx.Document(duong)
    tren, duoi, trai, phai = a.le
    for s in d.sections:
        s.page_width, s.page_height = Cm(21.0), Cm(29.7)
        s.top_margin, s.bottom_margin, s.left_margin, s.right_margin = Cm(tren), Cm(duoi), Cm(trai), Cm(phai)
        if a.so_trang != "khong":
            them_so_trang(s, a.so_trang == "tren")

    than = {"Normal", "Body Text", "First Paragraph", "Compact", "Block Text", "Bibliography", "Table"}
    for st in d.styles:
        if st.type not in (1, 2) or st.element.find("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}rPr") is None and st.type == 2:
            continue
        ten = st.name
        if st.type == 2:  # style ký tự: chỉ ép font
            dat_font(st)
            continue
        pf = st.paragraph_format
        if ten in than:
            dat_font(st, a.co_chu)
            pf.line_spacing_rule, pf.line_spacing = WD_LINE_SPACING.MULTIPLE, a.dong
            pf.space_before, pf.space_after = Pt(0), Pt(6)
            pf.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            if ten in ("Body Text", "First Paragraph"):
                pf.first_line_indent = Cm(a.lui_dau_dong)
            if ten == "Block Text":  # trích dài: tách đoạn riêng, lùi trái 1,27 cm
                pf.left_indent, pf.first_line_indent = Cm(1.27), Cm(0)
                st.font.italic = False
            if ten in ("Compact", "Table"):
                pf.first_line_indent = Cm(0)
                pf.alignment = WD_ALIGN_PARAGRAPH.LEFT
        elif ten == "Footnote Text":
            dat_font(st, 10)
            pf.line_spacing_rule, pf.line_spacing = WD_LINE_SPACING.SINGLE, 1.0
            pf.space_before, pf.space_after, pf.first_line_indent = Pt(0), Pt(2), Cm(0)
            pf.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        elif ten in ("Title", "Heading 1"):
            dat_font(st, a.co_chu + 1, dam=True, nghieng=False)
            pf.alignment = WD_ALIGN_PARAGRAPH.CENTER
            pf.space_before, pf.space_after, pf.keep_with_next = Pt(0), Pt(12), True
            pf.page_break_before = ten == "Heading 1"
        elif ten == "Heading 2":
            dat_font(st, a.co_chu, dam=True, nghieng=False)
            pf.space_before, pf.space_after, pf.keep_with_next = Pt(12), Pt(6), True
        elif ten == "Heading 3":
            dat_font(st, a.co_chu, dam=True, nghieng=True)
            pf.space_before, pf.space_after, pf.keep_with_next = Pt(6), Pt(6), True
        elif ten.startswith("Heading"):
            dat_font(st, a.co_chu, dam=False, nghieng=True)
            pf.space_before, pf.space_after, pf.keep_with_next = Pt(6), Pt(6), True
        else:
            dat_font(st)
    for b in d.tables:
        ke_bang(b)

    cp = d.core_properties
    cp.title = a.tieu_de or ""
    cp.author = "" if a.an_danh else (a.tac_gia or "")
    cp.last_modified_by, cp.comments, cp.keywords, cp.subject, cp.category = "", "", "", "", ""
    d.save(duong)


def main(argv=None):
    ap = argparse.ArgumentParser(description="Xuất các chương .md thành file Word đúng hình thức trang")
    ap.add_argument("tep", nargs="+", help="các file .md theo đúng thứ tự trong bài")
    ap.add_argument("-o", "--out", required=True, help="file .docx đầu ra")
    ap.add_argument("--tieu-de", help="tên đề tài (ghi vào thuộc tính file)")
    ap.add_argument("--tac-gia", help="tên tác giả (bỏ khi --an-danh)")
    ap.add_argument("--co-chu", type=float, default=13)
    ap.add_argument("--dong", type=float, default=1.3, help="giãn dòng (mặc định 1,3)")
    ap.add_argument("--le", default="2.0,2.5,3.5,2.0", help="lề trên,dưới,trái,phải tính bằng cm")
    ap.add_argument("--lui-dau-dong", type=float, default=1.0, help="lùi đầu dòng đoạn văn, cm (0 để tắt)")
    ap.add_argument("--so-trang", choices=["duoi", "tren", "khong"], default="duoi", help="Euréka: tren")
    ap.add_argument("--muc-luc", action="store_true", help="chèn mục lục tự động ở đầu file (mở Word bấm F9 để cập nhật)")
    ap.add_argument("--an-danh", action="store_true", help="bài dự giải: xóa tên tác giả khỏi thuộc tính file")
    ap.add_argument("--nhap", action="store_true", help="cho phép còn nhãn [CẦN KIỂM], [SUY LUẬN]… (bản nháp)")
    a = ap.parse_args(argv)
    try:
        a.le = [float(x) for x in a.le.split(",")]
        assert len(a.le) == 4
    except (ValueError, AssertionError):
        return loi("--le cần đúng 4 số: trên,dưới,trái,phải (cm), vd. 2.0,2.5,3.5,2.0", 2)

    for t in a.tep:
        if not os.path.isfile(t):
            return loi(f"Không có file {t}", 2)
    con_nhan = {}
    for t in a.tep:
        with open(t, encoding="utf-8") as f:
            n = len(NHAN.findall(f.read()))
        if n:
            con_nhan[t] = n
    if con_nhan and not a.nhap:
        chi_tiet = "; ".join(f"{t}: {n}" for t, n in con_nhan.items())
        return loi(f"CHẶN: còn nhãn nghiên cứu trong bản nộp ({chi_tiet}). Thay nhãn bằng footnote hoặc lời văn rồi chạy "
                   "kiem_tra_ban_thao.py --nop; muốn xuất bản nháp thì thêm --nhap.")

    thong_so = (f"A4 · {FONT} {a.co_chu:g} · dòng {a.dong:g} · lề trên {a.le[0]:g} / dưới {a.le[1]:g} / trái {a.le[2]:g} / "
                f"phải {a.le[3]:g} cm · lùi đầu dòng {a.lui_dau_dong:g} cm · số trang: {a.so_trang} · footnote cỡ 10")
    try:
        import docx  # noqa: F401
    except ImportError:
        return loi("Thiếu python-docx (pip install python-docx). Dựng bằng skill docx theo đúng thông số: " + thong_so, 3)
    if not shutil.which("pandoc"):
        return loi("Thiếu pandoc. Dựng bằng skill docx theo đúng thông số: " + thong_so, 3)

    with tempfile.TemporaryDirectory() as tam:
        tho = os.path.join(tam, "tho.docx")
        lenh = ["pandoc", "-f", "markdown", "-t", "docx", "-o", tho, *a.tep]
        if a.muc_luc:
            lenh += ["--toc", "--toc-depth=3"]
        kq = subprocess.run(lenh, capture_output=True, text=True)
        if kq.returncode:
            return loi("pandoc lỗi: " + kq.stderr.strip(), 3)
        dinh_dang(tho, a)
        os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
        shutil.copyfile(tho, a.out)

    with zipfile.ZipFile(a.out) as z:
        chu_thich = 0
        if "word/footnotes.xml" in z.namelist():
            chu_thich = max(0, len(re.findall(r"<w:footnote ", z.read("word/footnotes.xml").decode("utf-8"))) - 2)
    print(f"Đã xuất {a.out}: {len(a.tep)} file · {chu_thich} footnote")
    print("Hình thức: " + thong_so)
    if con_nhan:
        print("BẢN NHÁP: còn nhãn nghiên cứu, chưa phải bản nộp.")
    print("Mở lại file để soát: footnote ở cuối trang, số trang, đề mục; có --muc-luc thì bấm F9 trong Word để cập nhật mục lục.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
