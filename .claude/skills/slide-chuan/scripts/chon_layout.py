#!/usr/bin/env python3
"""Gợi ý type / kiểu biểu đồ / theme từ mô tả nội dung, dựa trên references/layouts_index.json (luật "chọn khi / bỏ qua khi → thay bằng").
Dùng: python3 scripts/chon_layout.py "hai quy định cũ và mới về thời hạn nộp hồ sơ"
      python3 scripts/chon_layout.py --list            # in toàn bộ thư viện theo nhóm
Chỉ là gợi ý theo từ khoá — quyết định cuối vẫn theo câu hỏi "người nghe cần thấy gì" (SKILL.md bước 3)."""
import json, os, re, sys, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IDX = json.load(open(os.path.join(ROOT, "references", "layouts_index.json"), encoding="utf8"))
STOP = set("và của các cho một những có là được khi thì với theo từ trong ra về để này đó cần nào bao nhiêu".split())

def toks(s):
    s = unicodedata.normalize("NFC", s.lower())
    w = [x for x in re.findall(r"[\wđ%]+", s) if x not in STOP and len(x) > 1]
    return set(w) | {a + " " + b for a, b in zip(w, w[1:])}

def score(q, pick, skip):
    p, k = toks(pick), toks(skip)
    return len(q & p) * 2 - len(q & k)

def main(argv):
    if not argv or argv[0] in ("-h", "--help"):
        print(__doc__); return 0
    if argv[0] == "--list":
        for g, name in IDX["meta"]["groups"].items():
            print(f"\n## {name}")
            for t, e in IDX["types"].items():
                if e["group"] == g: print(f"  {t:12} chọn: {e['pick']}\n  {'':12} bỏ qua: {e['skip']} → {', '.join(e['alt']) or '—'}")
        print("\n## Biểu đồ (chart kind)")
        for t, e in IDX["charts"].items(): print(f"  {t:10} chọn: {e['pick']} · bỏ qua: {e['skip']} → {', '.join(e['alt'])}")
        print("\n## Theme")
        for t, e in IDX["themes"].items(): print(f"  {t:6} {e}")
        return 0
    q = toks(" ".join(argv))
    rows = [(score(q, e["pick"], e["skip"]), "type", t, e) for t, e in IDX["types"].items()]
    rows += [(score(q, e["pick"], e["skip"]), "chart", t, e) for t, e in IDX["charts"].items()]
    rows = sorted([r for r in rows if r[0] > 0], key=lambda r: -r[0])[:5]
    if not rows:
        print("Không khớp từ khoá nào — xem toàn bộ: python3 scripts/chon_layout.py --list"); return 1
    for s, kind, t, e in rows:
        name = f'chart kind "{t}"' if kind == "chart" else f'type "{t}"'
        print(f"• {name} (điểm {s})\n    chọn khi: {e['pick']}\n    bỏ qua khi: {e['skip']} → {', '.join(e['alt']) or '—'}")
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
