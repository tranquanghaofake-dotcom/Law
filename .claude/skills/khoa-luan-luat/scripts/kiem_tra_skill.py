#!/usr/bin/env python3
"""Kiểm cấu trúc skill khoa-luan-luat: frontmatter, độ dài, file tham chiếu tồn tại.

Chạy: python3 scripts/kiem_tra_skill.py   (từ thư mục skill hoặc bất kỳ đâu)
"""
import os
import re
import sys

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    loi = []
    with open(os.path.join(GOC, "SKILL.md"), encoding="utf-8") as f:
        van = f.read()

    m = re.match(r"^---\n(.*?)\n---\n", van, re.S)
    if not m:
        loi.append("thiếu frontmatter YAML")
    else:
        fm = dict(re.findall(r"^(\w+):\s*(.+)$", m.group(1), re.M))
        ten, mo_ta = fm.get("name", ""), fm.get("description", "")
        if not re.fullmatch(r"[a-z0-9-]{1,64}", ten):
            loi.append(f"name không hợp lệ: {ten!r}")
        if not mo_ta.startswith("Use when"):
            loi.append("description phải bắt đầu bằng 'Use when'")
        if len(mo_ta) > 1024:
            loi.append(f"description dài {len(mo_ta)} > 1024 ký tự")
        if len(m.group(0)) > 1024 + 64:
            loi.append("frontmatter quá dài")

    so_dong = van.count("\n") + 1
    if so_dong >= 500:
        loi.append(f"SKILL.md có {so_dong} dòng (phải < 500)")

    tham_chieu = set(re.findall(r"`((?:references|scripts)/[\w\-./]+\.(?:md|py))", van))
    for tc in sorted(tham_chieu):
        if not os.path.isfile(os.path.join(GOC, tc)):
            loi.append(f"thiếu file được trỏ tới: {tc}")
    for ten_tep in os.listdir(os.path.join(GOC, "references")):
        if f"references/{ten_tep}" not in tham_chieu:
            loi.append(f"references/{ten_tep} không được SKILL.md trỏ tới")

    print(f"SKILL.md: {so_dong} dòng · {len(tham_chieu)} tham chiếu")
    for l in loi:
        print("  LỖI:", l)
    print("XANH" if not loi else f"ĐỎ ({len(loi)} lỗi)")
    sys.exit(1 if loi else 0)


if __name__ == "__main__":
    main()
