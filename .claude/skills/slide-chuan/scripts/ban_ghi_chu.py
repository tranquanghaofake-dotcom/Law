#!/usr/bin/env python3
"""Bản in ghi chú cho người trình bày: mỗi slide một trang A4 — ảnh slide, tiêu đề, ghi chú thuyết trình, số giây nói ước tính.

Dùng:
  python3 scripts/ban_ghi_chu.py <file.pptx> [out.pdf]

- Ghi chú và tiêu đề đọc thẳng từ file PPTX (python-pptx) — đúng bản sẽ chiếu, kể cả slide phản hồi của trắc nghiệm.
- Ảnh slide lấy từ thư mục <tên>_lop/h-NN.jpg mà hinh/dung.js để lại cạnh file PPTX; không có thì in chữ không ảnh.
- Số giây nói = số tiếng ÷ 160 tiếng/phút — cùng cách tính thời lượng của hinh/dung.js.
- Mặc định ghi <tên>_ghi-chu.pdf cạnh file PPTX. Ảnh trong bản in là ảnh slide — deck dùng ảnh "chỉ chiếu trên lớp" thì bản in cũng chỉ dùng trong lớp.
"""
import html
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


def tieu_de_html(lop):
    """Tiêu đề đúng cách viết hoa của deck.json, lấy từ <tên>_lop/deck.html (data-tieu-de-an trước, rồi data-title) — chữ trong PPTX
    thường là chữ in hoa (Anton), đổi về chữ thường sẽ làm hỏng "BHXH", "Việt Nam"."""
    f = os.path.join(lop, "deck.html")
    if not os.path.exists(f):
        return []
    out = []
    for at in re.findall(r"<section ([^>]*)>", open(f, encoding="utf-8").read()):
        m = re.search(r'data-tieu-de-an="([^"]*)"', at) or re.search(r'data-title="([^"]*)"', at)
        t = re.search(r'data-type="([^"]*)"', at)
        out.append((re.sub(r"\s+", " ", html.unescape(m.group(1))).strip() if m else "", t.group(1) if t else ""))
    return out


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
    td_html = tieu_de_html(lop)
    if len(td_html) != n:
        td_html = []   # deck.html không khớp số slide (dựng lại PPTX mà chưa dựng lại thư mục _lop) → dùng tiêu đề trong PPTX
    tieu = lambda i, sl: (td_html[i - 1][0] if td_html and td_html[i - 1][0] else tieu_de(sl))
    CHUONG = {"section", "bhchuong", "bcchuong", "qtchuong"}
    la_chuong = lambda i: bool(td_html) and td_html[i - 1][1] in CHUONG

    s_dau = ParagraphStyle("dau", fontName="BVP", fontSize=9, textColor=XAM, leading=12)
    s_dau_phai = ParagraphStyle("dau_phai", parent=s_dau, alignment=2)
    s_td = ParagraphStyle("td", fontName="BVP-Dam", fontSize=14, textColor=MUC, leading=19, spaceBefore=8, spaceAfter=6)
    s_gc = ParagraphStyle("gc", fontName="BVP", fontSize=11.5, textColor=MUC, leading=17, spaceAfter=6)
    s_rong = ParagraphStyle("rong", parent=s_gc, textColor=XAM)

    W = A4[0] - 36 * mm
    truyen = []
    tong_giay, truoc, lich = 0, None, []
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
        lich.append((i, tieu(i, sl), giay, nhanh, lap, None if nhanh.startswith("sai") else tong_giay))
        nhan = f" · Nhánh {nhanh} — chỉ nói khi người học chọn{' (không tính vào tổng)' if nhanh.startswith('sai') else ''}" if nhanh else ""
        moc = "" if nhanh.startswith("sai") else f" · nói xong lúc {tong_giay // 60}:{tong_giay % 60:02d}"
        dau = Table([[Paragraph(f"Slide {i} / {n}{escape(nhan)}", s_dau), Paragraph((f"~{giay} giây nói · {tieng} tiếng" if tieng else "") + moc, s_dau_phai)]],
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
        td = tieu(i, sl)
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
    # TRANG ĐẦU — LỊCH NÓI: mỗi slide một dòng, mốc thời gian cộng dồn ("đến slide 14 nên ở phút 9") để người trình bày biết mình nhanh hay chậm
    mmss = lambda g: f"{g // 60}:{g % 60:02d}"
    s_o = ParagraphStyle("o", fontName="BVP", fontSize=8.5, textColor=MUC, leading=11)
    s_oh = ParagraphStyle("oh", parent=s_o, fontName="BVP-Dam")
    hang = [[Paragraph(x, s_oh) for x in ("Slide", "Tiêu đề", "Giây", "Mốc")]]
    for i, td, g, nh, lap, moc in lich:
        ghi = " (bước tiếp, cùng ghi chú)" if lap else f" — nhánh {nh}, chỉ khi người học chọn" if nh else ""
        st = s_oh if la_chuong(i) else s_o   # dòng mở chương in đậm: thấy từng phần chiếm bao lâu
        hang.append([Paragraph(str(i), st), Paragraph(escape(td + ghi), st), Paragraph(str(g) if g else "—", st), Paragraph(mmss(moc) if moc is not None else "—", st)])
    bang = Table(hang, colWidths=[14 * mm, W - 44 * mm, 14 * mm, 16 * mm], repeatRows=1)
    bang.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, 0), 0.8, MUC), ("LINEBELOW", (0, 1), (-1, -1), 0.25, HexColor("#d6e2f3")),
                              ("VALIGN", (0, 0), (-1, -1), "TOP"), ("TOPPADDING", (0, 0), (-1, -1), 2), ("BOTTOMPADDING", (0, 0), (-1, -1), 2)]))
    dau_lich = [Paragraph("Lịch nói", ParagraphStyle("lich", parent=s_td, fontSize=18, leading=24)),
                Paragraph(f"Tổng ~{tong_giay // 60} phút {tong_giay % 60} giây nói ({TIENG_PHUT} tiếng/phút; nhánh sai của câu hỏi không tính). "
                          "Cột Mốc = thời điểm nên nói xong slide đó, tính từ lúc bắt đầu.", s_rong), Spacer(1, 4), bang, PageBreak()]
    truyen = dau_lich + truyen

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
