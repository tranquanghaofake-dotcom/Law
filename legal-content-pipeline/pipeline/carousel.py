"""Dựng bộ ảnh TikTok dạng lướt (photo carousel) 1080x1920 từ kịch bản đã duyệt — không cần Docker hay API key.
Khung theo Brief: bìa (hook) → câu hỏi (ẩn danh) → nguyên văn điều luật (nếu có) → căn cứ → việc cần làm → CTA + disclaimer.
Chữ trong **...** được tô màu nhấn. Kịch bản còn dấu [KIỂM TRA] bị từ chối để không đăng căn cứ chưa đối chiếu."""
import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from .settings import CFG, OUT_DIR, ROOT

W, H = 1080, 1920
MX = 96                      # lề trái/phải
HEADER_Y, LABEL_Y = 150, 270 # tên kênh + số trang; nhãn mục
TOP, BOTTOM = 370, 1500      # vùng nội dung, tránh thanh trên và phần caption của TikTok
NO_SPACE_BEFORE = tuple(",.;:!?)]}”’…%")
NO_SPACE_AFTER = tuple("([{“‘")
FONT_DIR = ROOT / "assets" / "fonts"
PALETTE = {"T1": "#0f4c5c", "T2": "#14213d", "T3": "#6b1d2a", "WC": "#2b2d42"}
PAPER, MUTED, ACCENT = "#f7f4ee", "#b9c2d0", "#f0a04b"
UNVERIFIED = "[KIỂM TRA"

_fonts = {}


def font(weight: str, size: int):
    key = (weight, size)
    if key not in _fonts:
        _fonts[key] = ImageFont.truetype(str(FONT_DIR / f"BeVietnamPro-{weight}.ttf"), size)
    return _fonts[key]


def words(text: str):
    """'a **b c** d' -> [('a', False), ('b', True), ('c', True), ('d', False)]; đoạn mới -> None."""
    out = []
    for p_i, para in enumerate(re.split(r"\n\s*\n", text.strip())):
        if p_i:
            out.append(None)
        for r_i, run in enumerate(para.split("**")):
            out += [(w.replace("*", "").replace("→", "»"), r_i % 2 == 1) for w in run.split() if w.strip("*")]
    return out


def gap(prev, w, space):
    if prev is None or w[0].startswith(NO_SPACE_BEFORE) or prev[0].endswith(NO_SPACE_AFTER):
        return 0
    return space


def layout(ws, size, width, weight="Regular", bold="ExtraBold"):
    lines, line, x = [], [], 0
    space = font(weight, size).getlength(" ")
    for w in ws:
        if w is None:
            lines.append(line)
            line, x = [], 0
            continue
        wl = font(bold if w[1] else weight, size).getlength(w[0])
        g = gap(line[-1] if line else None, w, space)
        if line and x + g + wl > width:
            lines.append(line)
            line, x, g = [], 0, 0
        line.append(w)
        x += g + wl
    if line:
        lines.append(line)
    return lines


def fits(ws, width, height, size, lh=1.32, **kw):
    return len(layout(ws, size, width, **kw)) * size * lh <= height


def fit(ws, width, height, sizes, lh=1.32, **kw):
    """Cỡ chữ lớn nhất trong `sizes` mà khối chữ vừa khung; trả (size, lines, lineheight)."""
    for s in sizes:
        lines = layout(ws, s, width, **kw)
        if len(lines) * s * lh <= height:
            return s, lines, int(s * lh)
    s = sizes[-1]
    return s, layout(ws, s, width, **kw), int(s * lh)


def draw_lines(d, lines, x, y, size, lh, color=PAPER, weight="Regular", bold="ExtraBold", align="left", width=W - 2 * MX):
    space = font(weight, size).getlength(" ")
    for line in lines:
        widths = [font(bold if b else weight, size).getlength(t) for t, b in line]
        gaps = [gap(line[i - 1] if i else None, w, space) for i, w in enumerate(line)]
        total = sum(widths) + sum(gaps)
        cx = x + (width - total) / 2 if align == "center" else x
        for (t, b), wl, g in zip(line, widths, gaps):
            cx += g
            d.text((cx, y), t, font=font(bold if b else weight, size), fill=ACCENT if b else color)
            cx += wl
        y += lh
    return y


def sentences_of(text: str):
    ws = [w for w in words(text) if w is not None]
    sentences, cur = [], []
    for w in ws:
        cur.append(w)
        if re.search(r"[.!?…]$", w[0]):
            sentences.append(cur)
            cur = []
    if cur:
        sentences.append(cur)
    return sentences


def paginate(text: str, width: int, height: int, size: int, lh=1.32):
    """Gom câu vào slide sao cho mỗi slide vừa khung ở cỡ chữ `size` (giữ nguyên dấu **...**)."""
    pages, cur = [], []
    for s in sentences_of(text):
        if cur and len(layout(cur + s, size, width)) * size * lh > height:
            pages.append(cur)
            cur = []
        cur += s
    if cur:
        pages.append(cur)
    return pages


def steps(text: str):
    parts = [p.strip(" .") for p in re.split(r"Bước\s*\d+\s*:", text) if p.strip(" .")]
    if len(parts) < 2:
        parts = [" ".join(t for t, _ in s) for s in sentences_of(text)]
    return [p[0].upper() + p[1:] for p in parts]


def step_pages(items, width, height, min_size=44):
    """3 bước/slide nếu đủ chỗ cho cỡ chữ dễ đọc, không thì 2 rồi 1."""
    for per in (3, 2, 1):
        pages = [items[i:i + per] for i in range(0, len(items), per)]
        if all(fits(words(it), width, height // len(p) - 60, min_size) for p in pages for it in p) or per == 1:
            return pages


class Deck:
    def __init__(self, pillar: str):
        self.bg = PALETTE.get(pillar, PALETTE["WC"])
        self.slides = []

    def new(self, label: str = ""):
        im = Image.new("RGB", (W, H), self.bg)
        d = ImageDraw.Draw(im)
        if label:
            d.text((MX, LABEL_Y), label.upper(), font=font("ExtraBold", 36), fill=ACCENT)
        self.slides.append(im)
        return d

    def save(self, folder: Path, header: str):
        folder.mkdir(parents=True, exist_ok=True)
        for old in folder.glob("*.png"):
            old.unlink()
        n = len(self.slides)
        paths = []
        for i, im in enumerate(self.slides, start=1):
            d = ImageDraw.Draw(im)
            d.text((MX, HEADER_Y), header, font=font("SemiBold", 30), fill=MUTED)
            d.text((W - MX, HEADER_Y), f"{i}/{n}", font=font("SemiBold", 30), fill=MUTED, anchor="ra")
            p = folder / f"{i:02d}.png"
            im.save(p, optimize=True)
            paths.append(p)
        return paths


def build(s: dict) -> Deck:
    cfg = CFG.get("carousel", {})
    pillar = (s.get("pillar") or "WC").split("/")[0]
    deck = Deck(pillar)
    box_w, box_h = W - 2 * MX, BOTTOM - TOP

    # 1. Bìa
    d = deck.new(CFG["pillars"].get(pillar, {}).get("name", "Hỏi đáp pháp lý"))
    size, lines, lh = fit(words(s["hook"]), box_w, box_h - 200, range(108, 60, -4), lh=1.2, weight="ExtraBold")
    y = TOP + (box_h - 200 - len(lines) * lh) * 2 // 5
    draw_lines(d, lines, MX, y, size, lh, weight="ExtraBold")
    d.text((MX, BOTTOM - 70), "Lướt sang để xem căn cứ  »", font=font("SemiBold", 40), fill=ACCENT)

    # 2. Câu hỏi (ẩn danh)
    if s.get("quote"):
        d = deck.new("Có bạn hỏi")
        d.text((MX - 10, TOP - 30), "“", font=font("ExtraBold", 220), fill=ACCENT)
        size, lines, lh = fit(words(s["quote"]), box_w, box_h - 300, range(80, 44, -2), weight="SemiBold", bold="ExtraBold")
        y = draw_lines(d, lines, MX, TOP + 190, size, lh, weight="SemiBold")
        src = (s.get("item_platform") or "mạng xã hội").replace("curation/", "")
        d.text((MX, y + 40), f"Nguồn: {src.capitalize()} · đã ẩn danh", font=font("Regular", 36), fill=MUTED)

    # 3. Nguyên văn điều luật (khi kịch bản có trích nguyên văn)
    cites = [c for c in json.loads(s.get("citations") or "[]") if isinstance(c, dict)]
    quoted = [c for c in cites if c.get("excerpt") and c["excerpt"] not in ("demo", "—")][:2]
    if quoted:
        d = deck.new("Nguyên văn điều luật")
        y = TOP
        for c in quoted:
            head = " ".join(str(c.get(k, "")).strip() for k in ("article", "law", "year")).strip()
            head = f"Điều {head}" if not head.lower().startswith("điều") else head
            d.text((MX, y), head, font=font("ExtraBold", 44), fill=ACCENT)
            size, lines, lh = fit(words(c["excerpt"]), box_w - 40, (box_h // len(quoted)) - 120, range(44, 30, -2))
            d.rectangle((MX, y + 70, MX + 6, y + 70 + len(lines) * lh), fill=ACCENT)
            y = draw_lines(d, lines, MX + 36, y + 70, size, lh) + 60

    # 4. Căn cứ (lời giải thích), chia theo câu
    for i, ch in enumerate(paginate(s["basis"], box_w, box_h, 60)):
        d = deck.new("Luật nói gì?" if i == 0 else "Luật nói gì? (tiếp)")
        size, lines, lh = fit(ch, box_w, box_h, range(72, 38, -2))
        draw_lines(d, lines, MX, TOP + (box_h - len(lines) * lh) * 2 // 5, size, lh)

    # 5. Việc cần làm
    items = steps(s["conclusion"])
    pages = step_pages(items, box_w - 110, box_h)
    for p_i, page in enumerate(pages):
        d = deck.new("Bạn nên làm gì?")
        slot = box_h // len(page)
        size = min(fit(words(it), box_w - 110, slot - 60, range(60, 32, -2))[0] for it in page)
        blocks = [layout(words(it), size, box_w - 110) for it in page]
        lh = int(size * 1.32)
        total = sum(max(len(b) * lh, 72) for b in blocks) + 56 * (len(blocks) - 1)
        y = TOP + (box_h - total) * 2 // 5
        for n, lines in enumerate(blocks, start=sum(len(p) for p in pages[:p_i]) + 1):
            d.ellipse((MX, y, MX + 72, y + 72), fill=ACCENT)
            d.text((MX + 36, y + 36), str(n), font=font("ExtraBold", 40), fill=deck.bg, anchor="mm")
            y = max(draw_lines(d, lines, MX + 110, y + (72 - lh) // 2 + 4, size, lh), y + 72) + 56

    # 6. CTA + disclaimer
    d = deck.new()
    cta = s.get("cta") or cfg.get("default_cta", "Luyện 10 câu về chủ đề này ở link bio.")
    size, lines, lh = fit(words(cta), box_w, 560, range(92, 48, -4), lh=1.2, weight="ExtraBold")
    y = draw_lines(d, lines, MX, TOP + 200, size, lh, weight="ExtraBold")
    d.rounded_rectangle((MX, y + 60, MX + 460, y + 160), radius=50, fill=ACCENT)
    d.text((MX + 230, y + 110), "Link ở bio", font=font("ExtraBold", 44), fill=deck.bg, anchor="mm")
    disc = cfg.get("disclaimer", "")
    size, lines, lh = fit(words(disc), box_w, 260, range(38, 28, -2))
    draw_lines(d, lines, MX, BOTTOM - len(lines) * lh, size, lh, color=MUTED)
    return deck


def unverified(s: dict) -> bool:
    return any(UNVERIFIED in str(s.get(k) or "") for k in ("hook", "quote", "basis", "conclusion", "cta", "citations"))


def render_script(s: dict):
    """Dựng carousel cho 1 kịch bản (dict từ db.get_script/db.scripts). Trả thư mục ảnh hoặc None nếu bị từ chối."""
    if unverified(s):
        print(f"[carousel] #{s['id']}: còn dấu [KIỂM TRA] — tra nguyên văn, sửa trong giao diện duyệt rồi dựng lại.")
        return None
    folder = OUT_DIR / "carousel" / f"script_{s['id']:04d}"
    cfg = CFG.get("carousel", {})
    paths = build(s).save(folder, cfg.get("handle") or cfg.get("author", ""))
    from .publish import caption
    (folder / "caption.txt").write_text(caption(s), encoding="utf-8")
    print(f"[carousel] #{s['id']} → {folder} ({len(paths)} ảnh)")
    return folder
