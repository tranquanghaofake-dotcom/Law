#!/usr/bin/env python3
"""Kiểm bản thảo khóa luận / NCKH luật viết bằng Markdown.

Cách dùng:
  python3 kiem_tra_ban_thao.py chuong-2.md               # bản nháp: nhãn chỉ là cảnh báo
  python3 kiem_tra_ban_thao.py ban-cuoi.md --nop         # bản nộp: còn nhãn = lỗi CHẶN
  python3 kiem_tra_ban_thao.py ban-cuoi.md --an-danh "Nguyễn Văn A,Đại học Luật X"
  python3 kiem_tra_ban_thao.py khoa-luan/de-tai/0*.md   # nhiều file: kiểm cả tham chiếu "Phụ lục N" giữa các file
  python3 kiem_tra_ban_thao.py 06-chuong-2.md --nguyen-van 05-nguon/nguyen-van.md   # trích dẫn phải có trong file nguyên văn

Mức: CHẶN (phải sửa), NẶNG, NHẸ. Thoát mã 1 nếu có lỗi CHẶN.
Script chỉ bắt lỗi hình thức có quy luật; KHÔNG thay việc kiểm nguồn và hiệu lực bằng tay.
"""
import argparse
import re
import sys

NHAN = ["CẦN KIỂM", "NGUYÊN VĂN", "NGUỒN NÓI", "SUY LUẬN", "ĐỀ XUẤT", "NGƯỜI DÙNG", "TODO"]
RE_NHAN = re.compile(r"\[(" + "|".join(re.escape(n) for n in NHAN) + r")[^\]]*\]")

# Văn bản dưới luật thường bị nhắc mà quên số hiệu.
LOAI_VB = ["Nghị định", "Thông tư liên tịch", "Thông tư", "Nghị quyết", "Quyết định", "Pháp lệnh"]
# 01/2021/NĐ-CP · 59/2020/QH14 · 57-NQ/TW · 1140/BGDĐT-KHCNTT
RE_SO_HIEU = re.compile(r"\d+/\d{4}/[A-ZĐ\-]+|\d+-[A-ZĐ]+/[A-ZĐ]+|\d+/[A-ZĐ]+-[A-ZĐ]+")
RE_LOAI_VB = re.compile(r"\b(" + "|".join(LOAI_VB) + r")\b")

SAO_RONG = [
    "vô cùng quan trọng", "hết sức cấp thiết", "hết sức quan trọng", "bối cảnh hội nhập",
    "ngày càng sâu rộng", "tăng cường tuyên truyền", "nâng cao nhận thức", "đóng vai trò then chốt",
    "không thể phủ nhận", "có thể thấy rằng",
]

MO_SAO = re.compile(r"^(Trong bối cảnh|Hiện nay,|Có thể nói|Nhìn chung|Ngày nay,|Trong thời đại)", re.I)
KET_LAP = re.compile(r"^(Tóm lại|Như vậy|Nhìn chung|Có thể thấy|Từ những phân tích trên)", re.I)
CHU_MOI_TRANG = 430  # Times New Roman 13, dòng 1,3, A4, lề mặc định: khoảng 430 chữ tiếng Việt


def _than_bai(van):
    """Bỏ footnote, tiêu đề, bảng; giữ các đoạn văn xuôi."""
    van = re.sub(r"(?m)^\[\^[^\]]+\]:.*$", "", van)
    van = re.sub(r"(?m)^(#.*|\|.*)$", "", van)
    return van


def uoc_trang(van):
    """Ước số trang thân bài (không tính footnote, tiêu đề, bảng)."""
    return len(re.findall(r"\w+", _than_bai(van))) / CHU_MOI_TRANG


RE_FN_DUNG = re.compile(r"\[\^([^\]]+)\](?!:)")
RE_FN_DN = re.compile(r"^\[\^([^\]]+)\]:", re.M)


def _dong(van, vi_tri):
    return van.count("\n", 0, vi_tri) + 1


RE_PHU_LUC = re.compile(r"Phụ lục\s+(\d+)")
RE_TIEU_DE = re.compile(r"^#+\s*(.+)$", re.M)


def tieu_de(van):
    """Danh sách tiêu đề Markdown trong văn bản (dùng để kiểm tham chiếu chéo)."""
    return [m.group(1).strip() for m in RE_TIEU_DE.finditer(van)]


def _doan_trich(van):
    """Các đoạn trích (vị trí, nội dung) ≥ 25 ký tự. Ngoặc thẳng ghép theo cặp liên tiếp trong từng dòng."""
    kq = []
    vt_dong = 0
    for dong in van.split("\n"):
        mo = None
        for i, ch in enumerate(dong):
            if ch == "“" or (ch == '"' and mo is None):
                mo = i
            elif (ch == "”" or ch == '"') and mo is not None:
                noi_dung = dong[mo + 1:i]
                if len(noi_dung) >= 25:
                    kq.append((vt_dong + mo, noi_dung))
                mo = None
        vt_dong += len(dong) + 1
    return kq


def _chuan_hoa(s):
    return re.sub(r"[\s*_]+", " ", s.replace("“", '"').replace("”", '"')).strip().lower()


def kiem_tra(van, nop=False, an_danh=None, tieu_de_khac=None, nguyen_van=None, bang_van_ban=None):
    """Trả về danh sách vi phạm: {ma, muc, dong, noi_dung}.

    bang_van_ban: nội dung 05-nguon/van-ban.md. Có thì mọi số hiệu VBQPPL dạng N/YYYY/... trong bài
    (trừ số bản án) phải có dòng trong bảng hiệu lực.

    tieu_de_khac: tiêu đề của các file khác trong cùng dự án (để kiểm "Phụ lục N" có tồn tại).
    nguyen_van: nội dung file trích nguyên văn (05-nguon/nguyen-van.md). Có thì mọi đoạn trích
        trong ngoặc kép dài ≥ 25 ký tự phải xuất hiện trong đó.
    """
    kq = []

    def them(ma, muc, dong, noi_dung):
        kq.append({"ma": ma, "muc": muc, "dong": dong, "noi_dung": noi_dung})

    # 1. Nhãn nghiên cứu còn sót
    for m in RE_NHAN.finditer(van):
        muc = "CHẶN" if nop else ("NẶNG" if m.group(1) == "CẦN KIỂM" else "NHẸ")
        them("nhan-con-sot", muc, _dong(van, m.start()), m.group(0))

    # 1b. Ghi chú tự đặt trong ngoặc vuông (không theo bộ nhãn chuẩn) — dễ lọt vào bản nộp
    for m in re.finditer(r"\[(?!\^)([^\[\]\n]{8,})\](?!\()", van):
        if RE_NHAN.match(m.group(0)):
            continue
        them("ghi-chu-ngoac-vuong", "CHẶN" if nop else "NHẸ", _dong(van, m.start()),
             f"ghi chú '{m.group(0)[:50]}…' — dùng nhãn chuẩn hoặc xóa trước khi nộp")

    # 2. Footnote dùng mà không định nghĩa, hoặc ngược lại
    dung = {}
    for m in RE_FN_DUNG.finditer(van):
        dung.setdefault(m.group(1), m.start())
    dinh_nghia = {m.group(1): m.start() for m in RE_FN_DN.finditer(van)}
    for ma, vt in dung.items():
        if ma not in dinh_nghia:
            them("footnote-thieu", "CHẶN", _dong(van, vt), f"[^{ma}] chưa có nội dung chú thích")
    for ma, vt in dinh_nghia.items():
        if ma not in dung:
            them("footnote-thua", "NẶNG", _dong(van, vt), f"[^{ma}] định nghĩa nhưng không dùng")

    # 3. Văn bản dưới luật thiếu số hiệu trong cùng câu
    for m in RE_LOAI_VB.finditer(van):
        dau = max(van.rfind(".", 0, m.start()), van.rfind("\n", 0, m.start())) + 1
        cuoi_cau = re.search(r"[.;\n]", van[m.end():])
        cuoi = m.end() + (cuoi_cau.start() if cuoi_cau else len(van) - m.end())
        if not RE_SO_HIEU.search(van[dau:cuoi]):
            them("thieu-so-hieu", "NẶNG", _dong(van, m.start()),
                 f"'{m.group(1)}' không kèm số hiệu trong câu")

    # 4. Lộ danh tính (bài dự giải)
    if an_danh is not None:
        thap = van.lower()
        for chuoi in an_danh:
            chuoi = chuoi.strip()
            if chuoi and chuoi.lower() in thap:
                them("lo-danh-tinh", "CHẶN", _dong(van, thap.find(chuoi.lower())), f"xuất hiện '{chuoi}'")
        m = re.search(r"^#+\s*l[ờo]i c[ảa]m [ơo]n", van, re.I | re.M)
        if m:
            them("lo-danh-tinh", "CHẶN", _dong(van, m.start()), "bài ẩn danh không được có Lời cảm ơn")

    # 5. Tham chiếu "Phụ lục N" phải có tiêu đề tương ứng (trong file này hoặc file khác của dự án)
    co_tieu_de = tieu_de(van) + list(tieu_de_khac or [])
    da_bao = set()
    for m in RE_PHU_LUC.finditer(van):
        so = m.group(1)
        if so in da_bao:
            continue
        if not any(re.match(rf"Phụ lục\s+{so}\b", t) for t in co_tieu_de):
            them("tham-chieu-hong", "NẶNG", _dong(van, m.start()),
                 f"nhắc 'Phụ lục {so}' nhưng không có tiêu đề '# Phụ lục {so}' trong dự án")
            da_bao.add(so)

    # 5b. Mỗi hạn chế (i), (ii)… trong mục "hạn chế" phải có dấu vết kiểm phản chứng:
    #     một footnote, hoặc câu "chưa tìm thấy …", hoặc nhãn [CẦN KIỂM: phản chứng]
    for m_muc in re.finditer(r"^#+[^\n]*h[ạa]n ch[ếe][^\n]*\n(.*?)(?=^#|\Z)", van, re.I | re.M | re.S):
        vt_muc = m_muc.start(1)
        for m in re.finditer(r"^\(([ivx]+)\)(.*)$", m_muc.group(1), re.M):
            dong_hc = m.group(2)
            if not re.search(r"\[\^[^\]]+\]|chưa tìm thấy|CẦN KIỂM|xem (mục )?\d+(\.\d+)+", dong_hc, re.I):
                them("han-che-chua-phan-chung", "NẶNG", _dong(van, vt_muc + m.start()),
                     f"hạn chế ({m.group(1)}) chưa có footnote, '(xem x.y.z)', 'chưa tìm thấy …' hoặc [CẦN KIỂM: phản chứng]")

    # 5c. Khẳng định so sánh với quá khứ ("lần đầu", "chưa từng"…) phải có footnote ngay trong câu:
    #     muốn nói "lần đầu" thì phải đã đọc cả văn bản cũ, không suy từ văn bản mới
    #     Bỏ qua footnote, tiêu đề, đoạn trong ngoặc kép (thường là nguyên văn hoặc tên thuật ngữ);
    #     "đầu tiên" chỉ tính khi đi sau "là / trở thành …" ("là văn bản đầu tiên"), không tính khi là
    #     một phần thuật ngữ ("tin nhắn đăng ký quảng cáo đầu tiên").
    def _xoa(mau, chuoi):
        return re.sub(mau, lambda x: " " * len(x.group(0)), chuoi)
    than = _xoa(r"(?m)^\[\^[^\]]+\]:.*$", van)
    than = _xoa(r"(?m)^#.*$", than)
    than = _xoa(r"\"[^\"\n]*\"|“[^”\n]*”", than)
    tu_khoa = r"lần đầu|chưa từng|duy nhất|(?:là|trở thành)\s+[^.,;\n]{0,40}?đầu tiên"
    for m in re.finditer(rf"[^.!?\n]*\b({tu_khoa})\b[^.!?\n]*[.!?]?(\[\^[^\]]+\])?", than, re.I):
        dong_chua = than[than.rfind("\n", 0, m.start()) + 1: (than.find("\n", m.end()) + 1 or len(than) + 1) - 1]
        if not m.group(2) and "[^" not in m.group(0) and not re.search(r"\(xem (mục )?\d+(\.\d+)+", dong_chua):
            them("khang-dinh-so-sanh-khong-nguon", "NẶNG", _dong(van, m.start()),
                 f"câu có '{m.group(1)}' nhưng không có footnote dẫn nguồn so sánh với văn bản cũ")

    # 6. Trích dẫn phải có trong file nguyên văn (chống trích theo trí nhớ, sửa chữ)
    if nguyen_van is not None:
        kho = _chuan_hoa(nguyen_van)
        for vt, noi_dung in _doan_trich(van):
            if van.rfind("[^", 0, vt) > van.rfind("\n", 0, vt):
                continue  # bỏ qua tên bài trong footnote
            manh = [p for p in re.split(r"…|\.\.\.", noi_dung) if len(p.strip()) >= 10]
            if any(_chuan_hoa(p) not in kho for p in manh):
                them("trich-ngoai-nguyen-van", "NẶNG", _dong(van, vt),
                     f"trích \"{noi_dung[:50]}…\" không có trong file nguyên văn")

    # 7. Cụm từ sáo rỗng
    thap = van.lower()
    for cum in SAO_RONG:
        vt = thap.find(cum)
        while vt != -1:
            them("van-sao-rong", "NHẸ", _dong(van, vt), f"'{cum}' — thay bằng căn cứ cụ thể")
            vt = thap.find(cum, vt + 1)

    # 6b. Dấu hiệu văn phong AI (chỉ NHẸ — gợi ý soát, không phải lỗi): mở đoạn bằng câu sáo,
    #     kết đoạn bằng câu tổng kết lặp ý, đoạn ≥ 4 câu có độ dài câu đều nhau
    vt_doan = 0
    for doan in re.split(r"\n\s*\n", _than_bai(van)):
        d = doan.strip()
        vt = van.find(d[:40], vt_doan) if d else -1
        if vt >= 0:
            vt_doan = vt
        if not d or d.startswith(("(", "-", "*", ">")):
            continue
        cau = [c.strip() for c in re.split(r"(?<=[.!?])\s+", re.sub(r"\[\^[^\]]+\]", "", d)) if len(c.strip()) > 3]
        dong = _dong(van, max(vt, 0))
        if MO_SAO.match(d):
            them("van-phong-ai", "NHẸ", dong, "đoạn mở bằng câu sáo — mở bằng vấn đề pháp lý cụ thể")
        if len(cau) >= 2 and KET_LAP.match(cau[-1]):
            them("van-phong-ai", "NHẸ", dong, "đoạn kết bằng câu tổng kết lặp ý — bỏ hoặc thay bằng hệ quả mới")
        if len(cau) >= 4:
            do_dai = [len(c.split()) for c in cau]
            tb = sum(do_dai) / len(do_dai)
            lech = (sum((x - tb) ** 2 for x in do_dai) / len(do_dai)) ** 0.5
            if tb > 8 and lech / tb < 0.15:
                them("van-phong-ai", "NHẸ", dong, f"{len(cau)} câu dài đều nhau (~{tb:.0f} chữ) — xen câu ngắn, tách ý")

    # 7. Mọi số hiệu VBQPPL trong bài phải có dòng trong bảng hiệu lực (05-nguon/van-ban.md)
    if bang_van_ban is not None:
        da_bao_sh = set()
        for m in re.finditer(r"\b\d+/\d{4}/[A-ZĐ][A-ZĐ0-9\-]*", van):
            sh = m.group(0).rstrip("-")
            if re.search(r"/(HS|DS|KDTM|HC|LĐ|HNGĐ|KT|PS|DSST|HSST)-|ĐHĐCĐ|HĐQT|HĐTV", sh) or sh in da_bao_sh:
                continue  # số bản án, văn bản nội bộ doanh nghiệp, hoặc đã báo
            if sh not in bang_van_ban:
                da_bao_sh.add(sh)
                them("van-ban-chua-kiem-hieu-luc", "NẶNG", _dong(van, m.start()),
                     f"'{sh}' chưa có dòng trong bảng hiệu lực (05-nguon/van-ban.md)")

    return kq


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("tep", nargs="+")
    ap.add_argument("--nop", action="store_true", help="bản nộp: còn nhãn nghiên cứu là lỗi CHẶN")
    ap.add_argument("--an-danh", default=None, help="các chuỗi không được xuất hiện, cách nhau dấu phẩy")
    ap.add_argument("--nguyen-van", default=None, help="file trích nguyên văn; đoạn trích ≥ 25 ký tự phải có trong đó")
    ap.add_argument("--trang", type=float, default=None, help="số trang dự kiến của phần này (theo đề cương); lệch quá 20%% thì cảnh báo")
    ap.add_argument("--van-ban", default=None, help="bảng hiệu lực 05-nguon/van-ban.md; mọi số hiệu trong bài phải có trong đó")
    a = ap.parse_args()
    nv = None
    if a.nguyen_van:
        with open(a.nguyen_van, encoding="utf-8") as f:
            nv = f.read()
    an_danh = a.an_danh.split(",") if a.an_danh is not None else None
    bvb = None
    if a.van_ban:
        with open(a.van_ban, encoding="utf-8") as f:
            bvb = f.read()

    van_ban = {}
    for tep in a.tep:
        with open(tep, encoding="utf-8") as f:
            van_ban[tep] = f.read()
    co_chan = False
    for tep, van in van_ban.items():
        khac = [t for t2, v2 in van_ban.items() if t2 != tep for t in tieu_de(v2)]
        kq = kiem_tra(van, nop=a.nop, an_danh=an_danh, tieu_de_khac=khac, nguyen_van=nv, bang_van_ban=bvb)
        dem = {m: sum(1 for v in kq if v["muc"] == m) for m in ("CHẶN", "NẶNG", "NHẸ")}
        tr = uoc_trang(van)
        if a.trang:
            lech = (tr - a.trang) / a.trang
            if abs(lech) > 0.2:
                kq.append({"ma": "ngan-sach-trang", "muc": "NHẸ", "dong": 1,
                           "noi_dung": f"ước {tr:.1f} trang, đề cương dự kiến {a.trang:g} trang ({lech:+.0%})"})
                dem = {m: sum(1 for v in kq if v["muc"] == m) for m in ("CHẶN", "NẶNG", "NHẸ")}
        print(f"== {tep}: CHẶN {dem['CHẶN']} · NẶNG {dem['NẶNG']} · NHẸ {dem['NHẸ']} · ước {tr:.1f} trang")
        for v in sorted(kq, key=lambda v: (("CHẶN", "NẶNG", "NHẸ").index(v["muc"]), v["dong"])):
            print(f"  [{v['muc']}] dòng {v['dong']}: {v['ma']} — {v['noi_dung']}")
        co_chan = co_chan or dem["CHẶN"] > 0
    sys.exit(1 if co_chan else 0)


if __name__ == "__main__":
    main()
