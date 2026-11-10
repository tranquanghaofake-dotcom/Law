#!/usr/bin/env python3
"""Kiểm cấu trúc skill vn-legal-exam-analysis: frontmatter, độ dài, file được trỏ tới.

Chạy sau mỗi lần sửa skill:  python3 scripts/kiem_tra_skill.py   (từ thư mục skill hoặc bất kỳ đâu)
Thoát mã 0 = XANH. Giới hạn 1024 ký tự của description là giới hạn cứng của chuẩn Agent Skills
(agentskills.io/specification): vượt thì claude.ai từ chối khi tải skill lên.
"""
import os
import re
import sys

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Skill này bật cho mọi câu hỏi pháp luật nên phần lõi dài hơn chuẩn 3000 chữ của các skill khác;
# vượt mức dưới đây thì chuyển chi tiết sang references/ thay vì viết thêm vào SKILL.md.
GIOI_HAN_CHU = 8500
GIOI_HAN_DONG = 500
MUC_LUC_TU_DONG = 100  # reference dài hơn số dòng này phải có "## Mục lục"


def doc_frontmatter(van):
    m = re.match(r"^---\n(.*?)\n---\n", van, re.S)
    if not m:
        return None, {}, []
    loi, fm = [], {}
    for dong in m.group(1).split("\n"):
        k = re.match(r"^([\w-]+):\s*(.*)$", dong)
        if not k:
            loi.append(f"dòng frontmatter không đúng dạng 'khóa: giá trị': {dong[:60]!r}")
            continue
        khoa, gt = k.group(1), k.group(2).strip()
        if len(gt) >= 2 and gt[0] == gt[-1] and gt[0] in "\"'":
            gt = gt[1:-1].replace('\\"', '"')
        elif re.search(r":\s", gt) or gt.startswith(("[", "{", "&", "*", "!", "|", ">", "%", "@", "`")):
            loi.append(f"{khoa}: giá trị không đặt trong ngoặc kép mà chứa ': ' hoặc ký tự đầu đặc biệt — YAML chuẩn không đọc được")
        fm[khoa] = gt
    return m, fm, loi


def main():
    loi = []
    with open(os.path.join(GOC, "SKILL.md"), encoding="utf-8") as f:
        van = f.read()

    m, fm, loi_fm = doc_frontmatter(van)
    if not m:
        loi.append("thiếu frontmatter YAML")
    loi += loi_fm
    ten, mo_ta = fm.get("name", ""), fm.get("description", "")
    if m:
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", ten) or len(ten) > 64:
            loi.append(f"name không hợp lệ: {ten!r}")
        if ten != os.path.basename(GOC):
            loi.append(f"name {ten!r} khác tên thư mục {os.path.basename(GOC)!r}")
        if not mo_ta.startswith("Use when"):
            loi.append("description phải bắt đầu bằng 'Use when'")
        if len(mo_ta) > 1024:
            loi.append(f"description dài {len(mo_ta)} > 1024 ký tự")
        if "<" in mo_ta or ">" in mo_ta:
            loi.append("description không được chứa dấu < >")

    than = van[m.end():] if m else van
    so_dong = van.count("\n") + 1
    if so_dong >= GIOI_HAN_DONG:
        loi.append(f"SKILL.md có {so_dong} dòng (phải < {GIOI_HAN_DONG})")
    so_chu = len(than.split())
    if so_chu > GIOI_HAN_CHU:
        loi.append(f"SKILL.md có {so_chu} chữ (phải ≤ {GIOI_HAN_CHU}; chuyển chi tiết sang references/)")

    tham_chieu = set(re.findall(r"`((?:references|scripts|evals)/[\w\-./]+\.(?:md|py|json))`", van))
    for tc in sorted(tham_chieu):
        if not os.path.isfile(os.path.join(GOC, tc)):
            loi.append(f"thiếu file được trỏ tới: {tc}")
    for ten_tep in sorted(os.listdir(os.path.join(GOC, "references"))):
        duong = os.path.join(GOC, "references", ten_tep)
        if f"references/{ten_tep}" not in tham_chieu:
            loi.append(f"references/{ten_tep} không được SKILL.md trỏ tới")
        with open(duong, encoding="utf-8") as f:
            noi_dung = f.read()
        if noi_dung.count("\n") > MUC_LUC_TU_DONG and "## Mục lục" not in noi_dung:
            loi.append(f"references/{ten_tep} dài hơn {MUC_LUC_TU_DONG} dòng mà chưa có '## Mục lục'")
    for thu_muc, _, tep in os.walk(GOC):
        if "__pycache__" in thu_muc or any(t.endswith(".pyc") for t in tep):
            loi.append(f"file rác trong gói: {os.path.relpath(thu_muc, GOC)}")

    print(f"SKILL.md: {so_dong} dòng · {so_chu} chữ · description {len(mo_ta)} ký tự · {len(tham_chieu)} tham chiếu")
    for l in loi:
        print("  LỖI:", l)
    print("XANH" if not loi else f"ĐỎ ({len(loi)} lỗi)")
    sys.exit(1 if loi else 0)


if __name__ == "__main__":
    main()
