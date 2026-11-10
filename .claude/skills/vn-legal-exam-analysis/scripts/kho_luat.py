#!/usr/bin/env python3
"""Kho văn bản luật dạng .txt: tìm kho, lập chỉ mục tên văn bản, đọc từng điều / khoản / điểm.

Dùng chung cho tra_dieu.py (in nguyên văn) và kiem_can_cu.py (đối chiếu căn cứ trong bản nháp).
Mỗi file trong kho: dòng đầu "# <Tên văn bản> <số hiệu> (…)", mỗi điều mở bằng dòng "Điều N. Tên điều".

Thứ tự tìm kho: --kho → biến môi trường KHO_LUAT → packages/content/data/laws của repo Luyện Luật
(tìm từ thư mục hiện tại và từ chỗ đặt skill đi lên) → thư mục kho-luat/ đóng kèm trong skill (bản tải lên claude.ai).
"""
import os
import re
import unicodedata

GOC_SKILL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIEU = re.compile(r"^Điều\s+(\d+[a-zđ]?)\s*(?:\.\s*(.*))?$")  # Hiến pháp: "Điều 1" đứng một mình, không có tên điều
TIEU_DE_KHAC = re.compile(r"^(Chương|Mục|Phần|Tiểu mục)\s+([IVXLC\d]+|thứ\s)", re.I)
KHOAN = re.compile(r"^(\d+)\.\s")
DIEM = re.compile(r"^([a-zđ])\)\s")
LOAI = r"Hiến pháp|Bộ luật|Luật|Pháp lệnh|Nghị quyết|Nghị định|Thông tư"
SO_HIEU = re.compile(r"(?:số\s+)?(\d+/\d{4}/[\wĐ-]+)")
NAM = re.compile(r"\b((?:19|20)\d{2})\b")


def tach_tieu_de(tieu_de):
    """'Luật Doanh nghiệp 59/2020/QH14 (hiệu lực…)' → ('Luật Doanh nghiệp', '59/2020/QH14', 2020)."""
    t = re.sub(r"^LAW:\s*", "", tieu_de)
    if not re.match(LOAI, t):
        return None, None, None
    m_so, m_nam = SO_HIEU.search(t), NAM.search(t)
    moc = [x.start() for x in (m_so, m_nam) if x]  # tên có dấu phẩy ("Luật Cán bộ, công chức"): cắt ở số hiệu, không cắt ở phẩy
    cat = min(moc + [x.start() for x in (re.search(r"[(—–]", t),) if x] or [len(t)]) if moc else \
        min([x.start() for x in (re.search(r"[(—–,]", t),) if x] or [len(t)])
    ten = re.sub(r"\s+số$", "", t[:cat].strip(" .:"))
    so = m_so.group(1) if m_so and m_so.start() <= cat + 4 else None
    nam = int(so.split("/")[1]) if so else (int(m_nam.group(1)) if m_nam and m_nam.start() <= cat + 1 else None)
    return ten, so, nam


# tên gọi tắt quen dùng mà chữ cái đầu không sinh ra được
BIET_DANH = {"Luật Hôn nhân và gia đình": ["Luật HNGĐ", "LHNGĐ"], "Luật Doanh nghiệp": ["LDN"], "Luật Thương mại": ["LTM"],
             "Luật Đất đai": ["LĐĐ"], "Luật Cạnh tranh": ["LCT"],
             "Luật Tố tụng hành chính": ["Luật TTHC", "LTTHC"], "Luật Sở hữu trí tuệ": ["Luật SHTT"],
             "Luật Ban hành văn bản quy phạm pháp luật": ["Luật Ban hành VBQPPL", "Luật BHVBQPPL"],
             "Luật Xử lý vi phạm hành chính": ["Luật XLVPHC"], "Luật Các tổ chức tín dụng": ["Luật TCTD"]}


def bo_dau(s):
    s = unicodedata.normalize("NFD", s.lower().replace("đ", "d"))
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def _leo(d):
    while True:
        thu = os.path.join(d, "packages", "content", "data", "laws")
        if os.path.isdir(thu):
            return thu
        cha = os.path.dirname(d)
        if cha == d:
            return None
        d = cha


def tim_kho(chi_dinh=None):
    """Trả đường dẫn kho, hoặc None."""
    if chi_dinh:
        return chi_dinh if os.path.isdir(chi_dinh) else None
    if os.environ.get("KHO_LUAT") and os.path.isdir(os.environ["KHO_LUAT"]):
        return os.environ["KHO_LUAT"]
    for goc in (os.getcwd(), GOC_SKILL):
        thu = _leo(goc)
        if thu:
            return thu
    kem = os.path.join(GOC_SKILL, "kho-luat")
    return kem if os.path.isdir(kem) else None


def dong_dau(duong):
    with open(duong, encoding="utf-8") as f:
        return re.sub(r"^LAW:\s*", "", f.readline().strip().lstrip("# ").strip())


def doc_cac_dieu(duong):
    """Trả dict số điều → danh sách dòng (dòng 0 là tiêu đề điều)."""
    cac, hien = {}, None
    with open(duong, encoding="utf-8") as f:
        for dong in f.read().split("\n"):
            m = DIEU.match(dong.strip())
            if m:
                hien = m.group(1)
                cac.setdefault(hien, [])
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
    return "\n".join(kq).strip().split("\n") if kq else []


def co_diem(dong_khoan_hoac_dieu, chu):
    return any((DIEM.match(d.strip()) or [None, None])[1] == chu for d in dong_khoan_hoac_dieu)


class VanBan:
    def __init__(self, duong):
        self.duong, self.tep = duong, os.path.basename(duong)
        self.tieu_de = dong_dau(duong)
        self.ten, self.so, self.nam = tach_tieu_de(self.tieu_de)
        if self.ten and self.ten.startswith("Hiến pháp"):
            self.ten = "Hiến pháp"
        self._dieu = None

    @property
    def dieu(self):
        if self._dieu is None:
            self._dieu = doc_cac_dieu(self.duong)
        return self._dieu

    def ten_goi(self):
        """Các cách gọi văn bản này trong văn viết: tên đầy đủ, chữ cái đầu (BLDS, LDN), biệt danh, số hiệu."""
        if not self.ten:
            return []
        if self.ten in ("Nghị định", "Nghị quyết", "Thông tư", "Pháp lệnh", "Luật", "Bộ luật"):
            return []  # tên trần không đủ phân biệt, chỉ nhận qua số hiệu
        goi = [self.ten]
        if self.ten.startswith("Bộ luật"):  # BLDS, BLHS, BLLĐ: chữ cái đầu là cách viết tắt thông dụng
            goi.append("".join(w[0] for w in self.ten.split()).upper())
        goi += BIET_DANH.get(self.ten, [])
        return goi


def mo_kho(kho):
    """Trả danh sách VanBan của các file là văn bản quy phạm (bỏ file trích sử liệu, slide)."""
    vb = []
    for t in sorted(os.listdir(kho)):
        if t.endswith(".txt"):
            v = VanBan(os.path.join(kho, t))
            if v.ten:
                vb.append(v)
    return vb
