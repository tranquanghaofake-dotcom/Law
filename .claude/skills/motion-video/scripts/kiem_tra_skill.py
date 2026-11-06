#!/usr/bin/env python3
"""Kiểm cấu trúc skill motion-video: frontmatter, độ dài, file được trỏ tới tồn tại, template đủ file.

Chạy: python3 scripts/kiem_tra_skill.py
"""
import os
import re
import sys

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAN = ["template/package.json", "template/remotion.config.ts", "template/tsconfig.json", "template/src/index.ts", "template/src/Root.tsx",
       "template/src/Main.tsx", "template/src/storyboard.json", "template/src/icons.json", "template/src/core/timeline.ts",
       "template/src/core/look.tsx", "template/src/core/fx.tsx", "template/src/core/types.ts", "template/src/scenes/index.tsx",
       "template/public/sfx/LICENSE.txt", "NOTICE.md"]


def main():
    loi = []
    van = open(os.path.join(GOC, "SKILL.md"), encoding="utf-8").read()
    m = re.match(r"^---\n(.*?)\n---\n", van, re.S)
    if not m:
        loi.append("thiếu frontmatter YAML")
    else:
        fm = dict(re.findall(r"^(\w+):\s*(.+)$", m.group(1), re.M))
        if not re.fullmatch(r"[a-z0-9-]{1,64}", fm.get("name", "")):
            loi.append("name không hợp lệ")
        mo_ta = fm.get("description", "")
        if not mo_ta.startswith("Use when"):
            loi.append("description phải bắt đầu bằng 'Use when'")
        if len(mo_ta) > 1024:
            loi.append(f"description dài {len(mo_ta)} > 1024")
    so_dong = van.count("\n") + 1
    if so_dong >= 500:
        loi.append(f"SKILL.md {so_dong} dòng (phải < 500)")
    tham = set(re.findall(r"(?<![\w/])((?:references|scripts)/[\w\-./]+\.(?:md|py|mjs|sh))", van))
    for t in sorted(tham):
        if not os.path.isfile(os.path.join(GOC, t)):
            loi.append(f"thiếu file được trỏ tới: {t}")
    for d in ("references", "scripts"):
        for f in os.listdir(os.path.join(GOC, d)):
            if f"{d}/{f}" not in tham and not f.startswith("__"):
                loi.append(f"{d}/{f} không được SKILL.md nhắc tới")
    for f in CAN:
        if not os.path.isfile(os.path.join(GOC, f)):
            loi.append(f"thiếu {f}")
    if os.path.isdir(os.path.join(GOC, "template", "node_modules")):
        loi.append("template/node_modules không được nằm trong skill (gói zip sẽ phình)")
    print(f"SKILL.md: {so_dong} dòng · {len(tham)} tham chiếu")
    for x in loi:
        print("  LỖI:", x)
    print("XANH" if not loi else f"ĐỎ ({len(loi)} lỗi)")
    sys.exit(1 if loi else 0)


if __name__ == "__main__":
    main()
