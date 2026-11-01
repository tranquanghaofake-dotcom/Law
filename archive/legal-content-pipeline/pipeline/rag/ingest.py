"""Nạp văn bản luật từ data/laws/*.txt, cắt theo 'Điều N.' thành chunk. Mỗi file .txt cần dòng đầu dạng:
# LAW: Bộ luật Dân sự 2015 | SOURCE: https://vbpl.vn/...
Văn bản QPPL không được bảo hộ quyền tác giả (Điều 15 Luật SHTT) nên được dùng nguyên văn."""
import json
import re
from pathlib import Path

from ..settings import LAWS_DIR, ROOT

INDEX_PATH = ROOT / "data" / "law_index.json"
ART_RE = re.compile(r"^\s*Điều\s+(\d+[a-z]?)\s*[.:]?\s*(.*)$", re.M)


def parse_file(path: Path):
    text = path.read_text(encoding="utf-8")
    law, source = path.stem, ""
    first = text.splitlines()[0] if text else ""
    m = re.match(r"#\s*LAW:\s*(.+?)\s*(\|\s*SOURCE:\s*(.+))?$", first.strip())
    if m:
        law = m.group(1).strip()
        source = (m.group(3) or "").strip()
        text = "\n".join(text.splitlines()[1:])
    chunks = []
    matches = list(ART_RE.finditer(text))
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end].strip()
        chunks.append({
            "law": law,
            "source": source,
            "article": m.group(1),
            "title": m.group(2).strip(),
            "text": body[:4000],
        })
    return chunks


def build():
    all_chunks = []
    for p in sorted(LAWS_DIR.glob("*.txt")):
        c = parse_file(p)
        print(f"[rag] {p.name}: {len(c)} điều")
        all_chunks.extend(c)
    INDEX_PATH.write_text(json.dumps(all_chunks, ensure_ascii=False), encoding="utf-8")
    print(f"[rag] tổng {len(all_chunks)} chunk → {INDEX_PATH}")
    return all_chunks


def load():
    if not INDEX_PATH.exists():
        return build()
    return json.loads(INDEX_PATH.read_text(encoding="utf-8"))
