#!/usr/bin/env python3
"""Bản in ghi chú cho người trình bày: mỗi slide một trang A4 — ảnh slide, tiêu đề, ghi chú thuyết trình, số giây nói ước tính.

Dùng:
  python3 scripts/ban_ghi_chu.py <file.pptx> [out.pdf]

- Ghi chú và tiêu đề đọc thẳng từ file PPTX (python-pptx) — đúng bản sẽ chiếu, kể cả slide phản hồi của trắc nghiệm.
- Ảnh slide lấy từ thư mục <tên>_lop/h-NN.jpg mà hinh/dung.js để lại cạnh file PPTX; không có thì in chữ không ảnh.
- Số giây nói = số tiếng ÷ 160 tiếng/phút — cùng cách tính thời lượng của hinh/dung.js.
- Mặc định ghi <tên>_ghi-chu.pdf cạnh file PPTX. Ảnh trong bản in là ảnh slide — deck dùng ảnh "chỉ chiếu trên lớp" thì bản in cũng chỉ dùng trong lớp.
"""
import io
import os
import re
import sys

from PIL import Image as PILImage

from pptx import Presentation
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Image, KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from xml.sax.saxutils import escape

FONTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "hinh", "fonts")
pdfmetrics.registerFont(TTFont("BVP", os.path.join(FONTS, "BeVietnamPro-Regular.ttf")))
pdfmetrics.registerFont(TTFont("BVP-Dam", os.path.join(FONTS, "BeVietnam-Dam.ttf")))
TIENG_PHUT = 160  # tiếng / phút khi nói tiếng Việt — như hinh/kiem_noi_dung.js
MUC = HexColor("#13213f")
XAM = HexColor("#56627c")


def tieu_de(slide):
    """Tiêu đề slide: placeholder tiêu đề (gồm cả tiêu đề ẩn ngoài khung), viết thường lại nếu toàn chữ hoa."""
    t = slide.shapes.title
    s = re.sub(r"\s+", " ", t.text_frame.text).strip() if t is not None and t.has_text_frame else ""
    return s[:1] + s[1:].lower() if s and s == s.upper() and any(c.isalpha() for c in s) else s


def ghi_chu(slide):
    if not slide.has_notes_slide:
        return ""
    return slide.notes_slide.notes_text_frame.text.strip()


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    pptx = argv[1]
    goc = os.path.splitext(pptx)[0]
    out = argv[2] if len(argv) > 2 else goc + "_ghi-chu.pdf"
    lop = goc + "_lop"
    pr = Presentation(pptx)
    n = len(pr.slides)

    s_dau = ParagraphStyle("dau", fontName="BVP", fontSize=9, textColor=XAM, leading=12)
    s_dau_phai = ParagraphStyle("dau_phai", parent=s_dau, alignment=2)
    s_td = ParagraphStyle("td", fontName="BVP-Dam", fontSize=14, textColor=MUC, leading=19, spaceBefore=8, spaceAfter=6)
    s_gc = ParagraphStyle("gc", fontName="BVP", fontSize=11.5, textColor=MUC, leading=17, spaceAfter=6)
    s_rong = ParagraphStyle("rong", parent=s_gc, textColor=XAM)

    W = A4[0] - 36 * mm
    truyen = []
    tong_giay, truoc = 0, None
    for i, sl in enumerate(pr.slides, 1):
        gc = ghi_chu(sl)
        lap = bool(gc) and gc == truoc   # slide hai bước: bước 2 mang lại nguyên ghi chú bước 1 — in một lần, không cộng giờ hai lần
        truoc = gc
        tieng = 0 if lap else len(gc.split())
        giay = round(tieng / TIENG_PHUT * 60)
        # slide NHÁNH của trắc nghiệm (build.js ghi tên slide "Nhánh trắc nghiệm: sai A / đúng"): nhánh sai chỉ nói khi người học chọn → không cộng vào tổng
        nhanh = (sl.name or "").split("Nhánh trắc nghiệm:", 1)[1].strip() if (sl.name or "").startswith("Nhánh trắc nghiệm:") else ""
        if not nhanh.startswith("sai"):
            tong_giay += giay
        nhan = f" · Nhánh {nhanh} — chỉ nói khi người học chọn{' (không tính vào tổng)' if nhanh.startswith('sai') else ''}" if nhanh else ""
        dau = Table([[Paragraph(f"Slide {i} / {n}{escape(nhan)}", s_dau), Paragraph(f"~{giay} giây nói · {tieng} tiếng" if tieng else "", s_dau_phai)]],
                    colWidths=[W / 2, W / 2])
        dau.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]))
        khoi = [dau]
        anh = os.path.join(lop, f"h-{i:02d}.jpg")
        if os.path.exists(anh):   # ảnh 4K của bước soát → thu về 1600 px cho bản in nhẹ (19 MB → vài MB)
            im = PILImage.open(anh).convert("RGB")
            im.thumbnail((1600, 900))
            buf = io.BytesIO()
            im.save(buf, "JPEG", quality=82)
            buf.seek(0)
            khoi.append(Image(buf, width=W, height=W * 9 / 16))
        td = tieu_de(sl)
        if td:
            khoi.append(Paragraph(escape(td), s_td))
        truyen.append(KeepTogether(khoi))
        if lap:
            truyen.append(Paragraph("(Bước tiếp theo của slide trước — cùng ghi chú, không tính thêm thời gian.)", s_rong))
        elif gc:
            for doan in [d for d in re.split(r"\n\s*\n|\n", gc) if d.strip()]:
                truyen.append(Paragraph(escape(doan.strip()), s_gc))
        else:
            truyen.append(Paragraph("(không có ghi chú)", s_rong))
        truyen.append(PageBreak())

    ten = os.path.basename(goc)

    def chan_trang(c, doc):
        c.saveState()
        c.setFont("BVP", 8)
        c.setFillColor(XAM)
        c.drawString(18 * mm, 10 * mm, f"{ten} — bản ghi chú người trình bày · tổng ~{tong_giay // 60} phút {tong_giay % 60} giây nói")
        c.drawRightString(A4[0] - 18 * mm, 10 * mm, str(doc.page))
        c.restoreState()

    doc = SimpleDocTemplate(out, pagesize=A4, leftMargin=18 * mm, rightMargin=18 * mm, topMargin=16 * mm, bottomMargin=18 * mm,
                            title=f"{ten} — ghi chú", author="slide-chuan")
    doc.build(truyen[:-1] if truyen and isinstance(truyen[-1], PageBreak) else truyen, onFirstPage=chan_trang, onLaterPages=chan_trang)
    print(f"✓ {out} — {n} slide, ~{tong_giay // 60} phút {tong_giay % 60} giây nói ({TIENG_PHUT} tiếng/phút)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
