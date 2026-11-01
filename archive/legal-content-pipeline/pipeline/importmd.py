"""Nhập kịch bản viết tay dạng markdown (định dạng của docs/TikTok-Phap-Ly_Script_v1.md) vào DB để duyệt và dựng.

Mỗi kịch bản bắt đầu bằng '## 01 · T1 · Tiêu đề', gồm các khối **Hook:**, **[TRÍCH]:**, **Căn cứ:**, **Kết luận:**, **CTA:**
(nhãn có thể kèm mốc giờ trong ngoặc). Căn cứ in đậm dạng **Điều 328 BLDS 2015** được lấy làm citations."""
import json
import re
from pathlib import Path

from . import db
from .scriptwriter import DISCLAIMER

HEAD = re.compile(r"^##\s+(\d+)\s*·\s*(T\d|WC)[^·]*·\s*(.+?)\s*$", re.M)
LABEL = re.compile(r"^\*\*(Hook|\[TRÍCH\]|Căn cứ|Kết luận|CTA)[^*]*:\*\*\s*", re.M)
KEYS = {"Hook": "hook", "[TRÍCH]": "quote", "Căn cứ": "basis", "Kết luận": "conclusion", "CTA": "cta"}
CITE = re.compile(r"\*\*((?:(?:Điểm|điểm|Khoản|khoản) [^*]*?)?Điều (\d+[a-z]?)(?: và \d+)?\s*([^*]*))\*\*")


def parse(text: str):
    heads = list(HEAD.finditer(text))
    for i, h in enumerate(heads):
        body = text[h.end(): heads[i + 1].start() if i + 1 < len(heads) else len(text)]
        body = re.split(r"^---\s*$|^## ", body, maxsplit=1, flags=re.M)[0]
        parts, labels = {}, list(LABEL.finditer(body))
        for j, m in enumerate(labels):
            end = labels[j + 1].start() if j + 1 < len(labels) else len(body)
            parts[KEYS[m.group(1)]] = body[m.end():end].strip()
        if not {"hook", "basis", "conclusion"} <= parts.keys():
            print(f"[import-md] bỏ qua kịch bản {h.group(1)}: thiếu Hook/Căn cứ/Kết luận")
            continue
        quote = re.sub(r"\s*—\s*nguồn:.*$", "", parts.get("quote", ""), flags=re.S).strip().strip('*"“” ')
        cites, seen = [], set()
        for m in CITE.finditer(parts["basis"]):
            art, law = m.group(2), m.group(3).strip(" ,.;:")
            if art in seen:
                continue
            seen.add(art)
            cites.append({"article": art, "law": law, "year": "", "excerpt": ""})
        yield {
            "no": h.group(1), "pillar": h.group(2), "title": h.group(3),
            "hook": parts["hook"], "quote": quote, "basis": parts["basis"],
            "conclusion": parts["conclusion"], "cta": parts.get("cta", ""), "citations": cites,
        }


def import_markdown(path: str):
    text = Path(path).read_text(encoding="utf-8")
    added = 0
    with db.connect() as con:
        existing = {r["title"] for r in con.execute("SELECT title FROM scripts")}
        for s in parse(text):
            if s["title"] in existing:
                print(f"[import-md] {s['no']}: đã có '{s['title']}' — bỏ qua")
                continue
            full = " ".join(x for x in [s["hook"], f"Có bạn hỏi: \"{s['quote']}\"" if s["quote"] else "",
                                         s["basis"], s["conclusion"], s["cta"], DISCLAIMER] if x)
            full = re.sub(r"\*+", "", full)
            rec = {"item_id": None, "pillar": s["pillar"], "title": s["title"], "hook": s["hook"], "quote": s["quote"],
                   "basis": s["basis"], "conclusion": s["conclusion"], "cta": s["cta"], "citations": s["citations"],
                   "cards": [], "full_text": full, "word_count": len(full.split())}
            sid = db.insert_script(con, rec)
            print(f"[import-md] {s['no']} → kịch bản #{sid} ({len(s['citations'])} căn cứ) — {s['title']}")
            added += 1
        con.commit()
    print(f"[import-md] thêm {added} kịch bản, trạng thái 'pending' — duyệt bằng: python run.py review")
