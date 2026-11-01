#!/usr/bin/env python3
"""Kiểm tra mọi bộ câu hỏi trong data/sets/*.json rồi ghi data/catalog.json cho trang web.

  python web/build_catalog.py

Chạy lại mỗi khi thêm/sửa bộ câu hỏi.
Bộ nào sai định dạng sẽ bị loại khỏi catalog kèm thông báo lỗi, để câu hỏi lỗi không lên web."""
import json
import sys
from pathlib import Path

WEB = Path(__file__).resolve().parent
SETS = WEB / "data" / "sets"
GROUPS = {"pldc", "dan-su", "lao-dong", "hinh-su"}  # mã môn, trùng với GROUPS trong assets/app.js


def check(s: dict) -> list:
    errs = []
    for k in ("id", "group", "title", "questions"):
        if not s.get(k):
            errs.append(f"thiếu '{k}'")
    if s.get("group") and s["group"] not in GROUPS:
        errs.append(f"group phải là {sorted(GROUPS)}")
    for i, q in enumerate(s.get("questions", []), start=1):
        opts = q.get("options", [])
        if not q.get("q"):
            errs.append(f"câu {i}: thiếu đề")
        if len(opts) != 4 or len(set(opts)) != 4:
            errs.append(f"câu {i}: cần đúng 4 phương án khác nhau")
        if not isinstance(q.get("answer"), int) or not 0 <= q["answer"] < len(opts):
            errs.append(f"câu {i}: 'answer' phải là chỉ số 0–3")
        if not q.get("explain") or not q.get("basis"):
            errs.append(f"câu {i}: thiếu giải thích hoặc căn cứ")
    return errs


def build() -> int:
    entries, bad = [], 0
    for f in sorted(SETS.glob("*.json")):
        try:
            s = json.loads(f.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(f"[catalog] {f.name}: JSON lỗi — {e}")
            bad += 1
            continue
        errs = check(s)
        if s.get("id") and s["id"] != f.stem:
            errs.append(f"id '{s['id']}' phải trùng tên file '{f.stem}'")
        if errs:
            print(f"[catalog] {f.name}: BỎ QUA — " + "; ".join(errs))
            bad += 1
            continue
        n = len(s["questions"])
        if n != 10:
            print(f"[catalog] {f.name}: lưu ý có {n} câu (trang chủ ghi 10 câu/bộ)")
        entries.append({k: s.get(k, "") for k in ("id", "group", "title", "subtitle", "updated")} | {"count": n})
    order = {g: i for i, g in enumerate(("pldc", "dan-su", "lao-dong", "hinh-su"))}
    entries.sort(key=lambda e: (order.get(e["group"], 99), e["title"]))
    out = WEB / "data" / "catalog.json"
    out.write_text(json.dumps({"sets": entries}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"[catalog] {len(entries)} bộ → {out.relative_to(WEB.parent)}" + (f" ({bad} bộ lỗi)" if bad else ""))
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(build())
