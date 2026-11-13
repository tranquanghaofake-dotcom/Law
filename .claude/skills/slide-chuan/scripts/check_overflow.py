#!/usr/bin/env python3
"""Kiểm tra SAU KHI DỰNG: chữ có tràn khỏi ô hoặc đè lên chữ ô khác không (đo trên PDF render thật).
Dùng: python3 scripts/check_overflow.py deck.pptx [deck.pdf]
  - Không đưa PDF thì tự render bằng LibreOffice (soffice).
  - Ô chữ do build.js tạo có tên dạng  S<slide>|<type>|<trường>  nên khớp chính xác ô <-> chữ trong PDF.
  - Cũng báo nếu PDF phải dùng font dự phòng (DejaVu, Caladea...) vì khi đó số đo không đáng tin.
Thoát 0 = sạch; 1 = có tràn/đè/font dự phòng; 2 = không chạy được (thiếu công cụ/file)."""
import sys, os, re, shutil, subprocess, tempfile, unicodedata

TOL_V = 0.06   # inch, sai số cho phép theo chiều dọc (hộp từ của pdfplumber cao bằng cả dòng)
TOL_H = 0.05   # inch, theo chiều ngang
EMU = 914400.0
NAME = re.compile(r"^S(\d+)\|([^|]*)\|(.*)$")
EXPECTED_FONT = re.compile(r"(Carlito|Liberation|OpenSymbol)", re.I)


def norm(s):
    s = unicodedata.normalize("NFKC", s)
    return re.sub(r"[\s• ]+", "", s)


def render_pdf(pptx, outdir):
    soffice = shutil.which("soffice") or shutil.which("libreoffice")
    if not soffice:
        sys.exit("Thiếu LibreOffice (soffice) để render PDF. Cài LibreOffice hoặc đưa file PDF làm tham số thứ 2.")
    subprocess.run([soffice, "--headless", "--convert-to", "pdf", "--outdir", outdir, pptx],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return os.path.join(outdir, os.path.splitext(os.path.basename(pptx))[0] + ".pdf")


def fonts_of(pdf):
    if not shutil.which("pdffonts"):
        return []
    out = subprocess.run(["pdffonts", pdf], capture_output=True, text=True).stdout.splitlines()[2:]
    return sorted({l.split()[0] for l in out if l.strip()})


def match(words, start, target):
    """Tìm dãy từ liên tiếp (bắt đầu từ vị trí >= start) ghép lại đúng bằng target. Trả (chỉ số đầu, cuối+1) hoặc None."""
    n = len(words)
    for i in range(start, n):
        acc = ""
        for j in range(i, n):
            acc += norm(words[j]["text"])
            if acc == target:
                return i, j + 1
            if not target.startswith(acc):
                break
    return None


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    try:
        from pptx import Presentation
        import pdfplumber
    except ImportError as e:
        print("Thiếu thư viện Python:", e, "(pip install python-pptx pdfplumber)"); sys.exit(2)
    pptx = os.path.abspath(sys.argv[1])
    if not os.path.isfile(pptx): print(f"✗ Không có file {pptx} — build chưa tạo ra PPTX (xem lỗi của engine/build.js)."); sys.exit(2)
    import zipfile
    if os.environ.get("SLIDE_CHUAN_FORCE_OVERFLOW") != "1" and any(n.startswith("ppt/fonts/") for n in zipfile.ZipFile(pptx).namelist()):
        print("ℹ PPTX tầng hình ảnh (có font nhúng Anton / Be Vietnam): LibreOffice không đọc font nhúng nên phép đo này sẽ sai.\n"
              "  Kiểm tràn của tầng này: node hinh/dung.js <deck.json> --soat (đo bằng Chromium với đúng font). Bỏ qua, thoát 0.\n"
              "  Muốn chạy vẫn: SLIDE_CHUAN_FORCE_OVERFLOW=1")
        sys.exit(0)
    tmp = tempfile.mkdtemp()
    pdf = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else render_pdf(pptx, tmp)
    prs = Presentation(pptx)
    errors, notes = [], []

    fonts = [f for f in fonts_of(pdf) if not EXPECTED_FONT.search(f)]
    for f in fonts:
        errors.append(f"Font dự phòng trong PDF: {f} — ảnh soát và số đo không đáng tin (kiểm font trong themes.js)")

    with pdfplumber.open(pdf) as doc:
        for si, (slide, page) in enumerate(zip(prs.slides, doc.pages), 1):
            k = page.width / (prs.slide_width / EMU)  # điểm PDF trên 1 inch
            words = page.extract_words(use_text_flow=True, keep_blank_chars=False)
            cursor = 0
            found = []  # (tên, hộp ô (l,t,r,b), hộp chữ (l,t,r,b), các từ)
            for sh in slide.shapes:
                m = NAME.match(sh.name or "")
                if not m or not sh.has_text_frame:
                    continue
                target = norm(sh.text_frame.text)
                if not target:
                    continue
                hit = match(words, cursor, target)
                if not hit:
                    notes.append(f"Slide {si}: không khớp được chữ của ô '{sh.name}' trong PDF (bỏ qua ô này)")
                    continue
                cursor = hit[1]
                if sh.rotation:   # tem xoay: chỉ để khớp thứ tự, không kiểm
                    continue
                ws = words[hit[0]:hit[1]]
                box = (sh.left / EMU, sh.top / EMU, (sh.left + sh.width) / EMU, (sh.top + sh.height) / EMU)
                txt = (min(w["x0"] for w in ws) / k, min(w["top"] for w in ws) / k,
                       max(w["x1"] for w in ws) / k, max(w["bottom"] for w in ws) / k)
                found.append((sh.name, box, txt, ws))
                label = f"Slide {si} [{m.group(2)} {m.group(3)}]"
                if txt[3] > box[3] + TOL_V:
                    errors.append(f"{label}: chữ tràn đáy ô {txt[3] - box[3]:.2f}in")
                if txt[2] > box[2] + TOL_H:
                    errors.append(f"{label}: chữ tràn phải ô {txt[2] - box[2]:.2f}in")
                if txt[1] < box[1] - TOL_V:
                    errors.append(f"{label}: chữ tràn lên trên ô {box[1] - txt[1]:.2f}in")
            # đè giữa chữ của hai ô khác nhau (so từng từ, thu nhỏ hộp một chút)
            for a in range(len(found)):
                for b in range(a + 1, len(found)):
                    na, _, ta, wa = found[a]; nb, _, tb, wb = found[b]
                    if ta[2] < tb[0] or tb[2] < ta[0] or ta[3] < tb[1] or tb[3] < ta[1]:
                        continue
                    if any(ov(x, y, k) for x in wa for y in wb):
                        ma, mb = NAME.match(na), NAME.match(nb)
                        errors.append(f"Slide {si}: chữ đè nhau giữa [{ma.group(2)} {ma.group(3)}] và [{mb.group(2)} {mb.group(3)}]")

    for n in notes:
        print("ℹ", n)
    if errors:
        print(f"✗ {len(errors)} vấn đề:")
        for e in errors:
            print("  -", e)
        sys.exit(1)
    print("✓ Không có chữ tràn/đè, không dùng font dự phòng.")


def ov(x, y, k):
    """Hai từ đè nhau? Thu mỗi hộp 20% chiều cao (bỏ phần ascender/descender) để tránh báo nhầm dòng sát nhau."""
    def shrink(w):
        h = (w["bottom"] - w["top"]) * 0.2
        return w["x0"], w["top"] + h, w["x1"], w["bottom"] - h
    a, b = shrink(x), shrink(y)
    return min(a[2], b[2]) - max(a[0], b[0]) > 1.0 and min(a[3], b[3]) - max(a[1], b[1]) > 1.0


if __name__ == "__main__":
    main()
