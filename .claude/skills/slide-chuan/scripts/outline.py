#!/usr/bin/env python3
"""Rút DÀN Ý (các đề mục) từ tài liệu nguồn để đối chiếu với slide — không mục nào bị bỏ sót mà không ai biết.
Dùng: python3 scripts/outline.py <tài_liệu.docx|.pptx|.md|.txt|.pdf> [outline.json]
Ra outline.json: [{"id": "1.3.2", "title": "Bối cảnh triển khai…", "level": 3, "words": 120}, ...]
Trong deck.json: "meta": {"outline": "outline.json", "minutes": 15, "skip": {"1.1": "lý do bỏ"}} và mỗi slide "covers": ["1.3.2"].
Build in bảng mục chưa có slide nào (mục lá chưa được trình bày, không có lý do trong skip → cảnh báo).

Nhận đề mục theo: kiểu Heading của Word; dòng Markdown '#'; dòng bắt đầu bằng số mục (1., 1.2, 3.3.1),
"Phần I/II…", "Chương 1…", "KẾT LUẬN…". Số chữ của mỗi mục (words) giúp ước lượng nên dành bao nhiêu slide."""
import sys, os, re, json, zipfile

ROMAN = {"I": 1, "II": 2, "III": 3, "IV": 4, "V": 5, "VI": 6, "VII": 7, "VIII": 8, "IX": 9, "X": 10}

def paragraphs(path):
    ext = os.path.splitext(path)[1].lower()
    if ext == ".docx":
        x = zipfile.ZipFile(path).read("word/document.xml").decode("utf8")
        for p in re.findall(r"<w:p[ >].*?</w:p>", x, flags=re.S):
            st = re.search(r'<w:pStyle w:val="([^"]+)"', p)
            text = "".join(re.findall(r"<w:t[^>]*>([^<]*)</w:t>", p)).strip()
            if text: yield text, (st.group(1) if st else "")
    elif ext == ".pptx":
        # bài giảng cũ: tiêu đề mỗi slide = đề mục (có số "1.2." → đề mục đánh số; không số → mục con của đề mục số gần nhất),
        # chữ trong thân + bảng = nội dung (đếm chữ). Bỏ số trang, chữ mẫu ("Text in here", "Company Logo").
        from pptx import Presentation
        JUNK = re.compile(r"^(\d{1,3}|text in here|company logo|click to .*|your text.*)$", re.I)
        for sl in Presentation(path).slides:
            shapes = sorted([sh for sh in sl.shapes if sh.has_text_frame and sh.text_frame.text.strip()], key=lambda sh: (sh.top or 0, sh.left or 0))
            tt = sl.shapes.title if sl.shapes.title is not None and sl.shapes.title.has_text_frame and sl.shapes.title.text_frame.text.strip() else (shapes[0] if shapes else None)
            if tt is not None: yield " ".join(tt.text_frame.text.split()), "SlideTitle"
            for sh in sl.shapes:
                if sh is tt: continue
                rows = [c.text for r in sh.table.rows for c in r.cells] if getattr(sh, "has_table", False) and sh.has_table else (sh.text_frame.text.splitlines() if sh.has_text_frame else [])
                for line in rows:
                    line = " ".join(line.split())
                    if line and not JUNK.match(line): yield line, "SlideBody"  # thân slide: KHÔNG bao giờ là đề mục
    elif ext == ".pdf":
        import pdfplumber
        with pdfplumber.open(path) as pdf:
            for pg in pdf.pages:
                for line in (pg.extract_text() or "").splitlines():
                    if line.strip(): yield line.strip(), ""
    else:
        for line in open(path, encoding="utf8"):
            if line.strip(): yield line.strip(), ""

NUM = re.compile(r"^(\d+(?:\.\d+){0,3})\.?\s+(\S.{2,150})$")
PART = re.compile(r"^(Phần|PHẦN|Chương|CHƯƠNG)\s+([IVX]+|\d+)\.?\s*[.:\-–]?\s*(.*)$")
END = re.compile(r"^(KẾT LUẬN|Kết luận chung|KẾT LUẬN CHUNG|MỞ ĐẦU|LỜI MỞ ĐẦU)\b", re.I)
SKIP = re.compile(r"^(DANH MỤC|TÀI LIỆU THAM KHẢO|MỤC LỤC)", re.I)

def outline(path):
    out, cur, part = [], None, None
    for text, style in paragraphs(path):
        h = None
        if style == "SlideBody":
            if cur: cur["words"] += len(text.split())
            continue
        m = re.match(r"^(#{1,4})\s+(.*)", text)
        if m: h = (None, m.group(2), len(m.group(1)))
        elif PART.match(text):
            pm = PART.match(text); n = ROMAN.get(pm.group(2), pm.group(2)); part = str(n)
            h = ("P" + part, (pm.group(1) + " " + pm.group(2) + ". " + pm.group(3)).strip(), 1)
        elif END.match(text) and len(text) < 60 and not text.rstrip().endswith(":"): h = ("KL" if "LUẬN" in text.upper() else "MD", text, 1)  # "Kết luận:" giữa mục = tiểu kết, không phải phần
        elif SKIP.match(text) and len(text) < 60: break  # tài liệu tham khảo / mục lục: hết phần nội dung
        else:
            m = NUM.match(text)
            if m and len(text) < 160 and not text.endswith((";", ",")) and (style.lower().startswith("heading") or style == "SlideTitle" or len(text.split()) <= 22):
                num = m.group(1)
                # đánh số lệch phần (vd. "2. Đối với BHXH tự nguyện" nằm trong Phần III) → gắn vào phần đang đọc
                if part and "." not in num and num != part and out and out[-1]["id"] != "P" + part: num = f"{part}.{num}x"
                h = (num, m.group(2).rstrip(":."), num.count(".") + 2)
            elif style == "SlideTitle":
                last = next((o for o in reversed(out) if re.match(r"^\d+(\.\d+)*$", o["id"])), None)
                slug = re.sub(r"\W+", "-", text.lower())[:30].strip("-")
                h = (f'{last["id"]}.{slug}', text, last["level"] + 1) if last else (None, text, 2)
            elif style.lower().startswith("heading"): h = (None, text, 2)
        if h and style == "SlideTitle" and cur and cur["title"].lower() == h[1].lower(): continue  # slide nối tiếp cùng tiêu đề: gộp vào mục trước
        if h:
            id_, title, lvl = h
            if id_ is None: id_ = re.sub(r"\W+", "-", title.lower())[:30].strip("-")
            cur = {"id": id_, "title": title[:120], "level": lvl, "words": 0}; out.append(cur)
        elif cur: cur["words"] += len(text.split())
    # bỏ trùng id (mục đánh số lặp lại trong các phần khác nhau): thêm tiền tố phần
    seen = {}
    for o in out:
        if o["id"] in seen: seen[o["id"]] += 1; o["id"] = f'{o["id"]}-{seen[o["id"]]}'
        else: seen[o["id"]] = 1
    return out

if __name__ == "__main__":
    if len(sys.argv) < 2: sys.exit(__doc__)
    src = sys.argv[1]; dst = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(src)), "outline.json")
    o = outline(src)
    json.dump(o, open(dst, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    tot = sum(x["words"] for x in o) or 1
    for x in o: print(f'{"  " * (x["level"] - 1)}{x["id"]:<8} {x["title"][:70]:<72} {x["words"]:>5} chữ ({100 * x["words"] / tot:.0f}%)')
    print(f"→ {dst}: {len(o)} đề mục. Mục nhiều chữ cần nhiều slide hơn; ghi 'covers' vào từng slide và lý do bỏ vào meta.skip.")
