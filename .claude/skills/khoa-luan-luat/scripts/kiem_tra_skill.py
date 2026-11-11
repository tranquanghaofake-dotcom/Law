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
        fm = {}
        for khoa, gt in re.findall(r"^([\w-]+):\s*(.+)$", m.group(1), re.M):
            gt = gt.strip()
            if len(gt) >= 2 and gt[0] == gt[-1] and gt[0] in "\"'":
                gt = gt[1:-1].replace('\\"', '"')
            elif re.search(r":\s", gt):
                # YAML chuẩn (và claude.ai khi tải skill lên) không đọc được giá trị trần có ": "
                loi.append(f"{khoa}: giá trị chứa ': ' phải đặt trong ngoặc kép")
            fm[khoa] = gt
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

    so_chu = len(re.findall(r"\w+", van[m.end():] if m else van))
    if so_chu > 3000:
        loi.append(f"SKILL.md có {so_chu} chữ (phải ≤ 3000; chuyển chi tiết sang references/)")

    tham_chieu = set(re.findall(r"`((?:references|scripts)/[\w\-./]+\.(?:md|py))", van))
    for tc in sorted(tham_chieu):
        if not os.path.isfile(os.path.join(GOC, tc)):
            loi.append(f"thiếu file được trỏ tới: {tc}")
    for ten_tep in os.listdir(os.path.join(GOC, "references")):
        if f"references/{ten_tep}" not in tham_chieu:
            loi.append(f"references/{ten_tep} không được SKILL.md trỏ tới")

    for thu_muc, _, tep in os.walk(GOC):
        if "__pycache__" in thu_muc or any(t.endswith(".pyc") for t in tep):
            loi.append(f"file rác trong gói: {os.path.relpath(thu_muc, GOC)}")

    print(f"SKILL.md: {so_dong} dòng · {so_chu} chữ · {len(tham_chieu)} tham chiếu")
    for l in loi:
        print("  LỖI:", l)
    print("XANH" if not loi else f"ĐỎ ({len(loi)} lỗi)")
    sys.exit(1 if loi else 0)


if __name__ == "__main__":
    main()
