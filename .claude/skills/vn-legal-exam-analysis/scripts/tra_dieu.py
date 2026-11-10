#!/usr/bin/env python3
"""In nguyên văn một điều luật từ kho văn bản dạng .txt (mỗi điều mở bằng dòng "Điều N. Tên điều").

Dùng cho bước 6: trích nguyên văn quy phạm thay vì nhớ. Ví dụ:
  python3 -I scripts/tra_dieu.py --liet-ke                       # các văn bản có trong kho
  python3 -I scripts/tra_dieu.py "doanh nghiệp" 59               # Điều 59 của văn bản khớp từ khóa
  python3 -I scripts/tra_dieu.py ldn-vbhn-2025 59 --khoan 3      # chỉ khoản 3 Điều 59
  python3 -I scripts/tra_dieu.py "dân sự" --tim "hai phần ba"    # điều nào chứa cụm từ này

Kho: --kho <thư mục>, hoặc biến môi trường KHO_LUAT, hoặc packages/content/data/laws tìm từ thư mục hiện tại đi lên
(repo Luyện Luật). Căn cứ lấy từ kho là mức B cho đến khi đối chiếu vbpl.vn. Thoát mã 2 khi không tìm thấy.
"""
import argparse
import os
import re
import sys
import unicodedata

DIEU = re.compile(r"^Điều\s+(\d+[a-zđ]?)\s*\.\s*(.*)$")
TIEU_DE_KHAC = re.compile(r"^(Chương|Mục|Phần|Tiểu mục)\s+([IVXLC\d]+|thứ\s)", re.I)
KHOAN = re.compile(r"^(\d+)\.\s")


def bo_dau(s):
    s = unicodedata.normalize("NFD", s.lower().replace("đ", "d"))
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def tim_kho(chi_dinh=None):
    if chi_dinh:
        return chi_dinh if os.path.isdir(chi_dinh) else None
    if os.environ.get("KHO_LUAT") and os.path.isdir(os.environ["KHO_LUAT"]):
        return os.environ["KHO_LUAT"]
    d = os.getcwd()
    while True:
        thu = os.path.join(d, "packages", "content", "data", "laws")
        if os.path.isdir(thu):
            return thu
        cha = os.path.dirname(d)
        if cha == d:
            return None
        d = cha


def dong_dau(duong):
    with open(duong, encoding="utf-8") as f:
        return f.readline().strip().lstrip("# ").strip()


def chon_van_ban(kho, tu_khoa):
    """Trả (đường dẫn | None, danh sách ứng viên). Khớp theo tên file trước, rồi đến dòng tiêu đề."""
    tep = sorted(t for t in os.listdir(kho) if t.endswith(".txt"))
    k = bo_dau(tu_khoa)
    for t in tep:
        if bo_dau(t[:-4]) == k:
            return os.path.join(kho, t), [t]
    ung = [t for t in tep if k in bo_dau(t)]
    if not ung:
        ung = [t for t in tep if k in bo_dau(dong_dau(os.path.join(kho, t)).split("—")[0].split("(")[0])]
    if not ung:
        ung = [t for t in tep if k in bo_dau(dong_dau(os.path.join(kho, t)))]
    return (os.path.join(kho, ung[0]) if len(ung) == 1 else None), ung


def doc_cac_dieu(duong):
    """Trả dict số điều → danh sách dòng (kể cả dòng tiêu đề điều)."""
    cac, hien = {}, None
    with open(duong, encoding="utf-8") as f:
        for dong in f.read().split("\n"):
            m = DIEU.match(dong.strip())
            if m:
                hien = m.group(1)
                cac.setdefault(hien, [])  # điều trùng số (hiếm) thì nối tiếp
                cac[hien].append(dong.strip())
            elif hien is not None:
                if TIEU_DE_KHAC.match(dong.strip()):
                    hien = None
                else:
                    cac[hien].append(dong.rstrip())
    return {k: "\n".join(v).strip().split("\n") for k, v in cac.items()}


def lay_khoan(dong_dieu, so):
    lay, kq = False, []
    for d in dong_dieu[1:]:
        m = KHOAN.match(d.strip())
        if m:
            lay = m.group(1) == str(so)
        if lay:
            kq.append(d)
    return [x for x in "\n".join(kq).strip().split("\n") if x or kq]


def main(argv=None):
    ap = argparse.ArgumentParser(description="In nguyên văn một điều luật từ kho văn bản .txt")
    ap.add_argument("van_ban", nargs="?", help="tên file (không cần .txt) hoặc từ khóa trong tên văn bản")
    ap.add_argument("dieu", nargs="?", help="số điều, vd. 59 hoặc 132a")
    ap.add_argument("--khoan", help="chỉ in khoản này")
    ap.add_argument("--tim", help="tìm cụm từ trong văn bản, in các điều chứa nó")
    ap.add_argument("--kho", help="thư mục chứa các file luật .txt")
    ap.add_argument("--liet-ke", action="store_true", help="liệt kê văn bản trong kho")
    a = ap.parse_args(argv)

    kho = tim_kho(a.kho)
    if not kho:
        print("Không tìm thấy kho luật (packages/content/data/laws). Chỉ thư mục bằng --kho hoặc biến KHO_LUAT;"
              " không có kho thì tra vbpl.vn theo references/quy-trinh-xac-minh.md.", file=sys.stderr)
        return 2
    if a.liet_ke or not a.van_ban:
        for t in sorted(os.listdir(kho)):
            if t.endswith(".txt"):
                print(f"{t[:-4]:28} {dong_dau(os.path.join(kho, t))[:110]}")
        return 0

    duong, ung = chon_van_ban(kho, a.van_ban)
    if not duong:
        if ung:
            print(f"“{a.van_ban}” khớp {len(ung)} văn bản, chọn một tên file:", file=sys.stderr)
            for t in ung:
                print(f"  {t[:-4]:28} {dong_dau(os.path.join(kho, t))[:100]}", file=sys.stderr)
        else:
            print(f"Kho không có văn bản khớp “{a.van_ban}”. Xem: tra_dieu.py --liet-ke", file=sys.stderr)
        return 2
    cac = doc_cac_dieu(duong)
    print(f"[{os.path.basename(duong)}] {dong_dau(duong)}")

    if a.tim:
        k = a.tim.lower()
        trung = [(so, d) for so, ds in cac.items() for d in ds if k in d.lower()]
        if not trung:
            print(f"Không điều nào chứa “{a.tim}”.")
            return 2
        for so, d in trung[:40]:
            print(f"Điều {so}: {d.strip()[:200]}")
        return 0
    if not a.dieu:
        print(f"{len(cac)} điều. Thêm số điều để in nguyên văn.")
        return 0
    so = a.dieu.lower().replace("điều", "").strip()
    if so not in cac:
        print(f"Văn bản này không có Điều {so} (có {len(cac)} điều).", file=sys.stderr)
        return 2
    dong = cac[so]
    if a.khoan:
        kh = lay_khoan(dong, a.khoan)
        if not kh:
            print(f"Điều {so} không có khoản {a.khoan}.", file=sys.stderr)
            return 2
        dong = [dong[0]] + kh
    print("\n".join(dong))
    print("\n— Mức B cho đến khi đối chiếu vbpl.vn. Ghi CCPL về luật gốc và luật sửa đổi, không ghi văn bản hợp nhất.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
