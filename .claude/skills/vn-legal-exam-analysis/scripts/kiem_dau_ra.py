#!/usr/bin/env python3
"""Chấm hình thức một câu trả lời trước khi gửi: ngân sách hình thức của references/lap-luan.md thành máy kiểm.

Dùng:
  python3 -I scripts/kiem_dau_ra.py --dang nhan-dinh nháp.txt
  python3 -I scripts/kiem_dau_ra.py --dang tinh-huong --so-issue 2 --stdin < nháp.txt
  python3 -I scripts/kiem_dau_ra.py --dang so-sanh nháp.txt
Chữa nhiều nhận định trong một file: ngăn mỗi câu trả lời bằng một dòng chỉ có '---'.

Thoát mã 1 nếu còn lỗi mức error. Script kiểm thứ nhìn là thấy (kết luận ở câu đầu, độ dài, câu quá dài, gạch đầu dòng,
viện dẫn chung chung, quy cách CCPL qua lint_ccpl) và, khi tìm thấy kho luật, đối chiếu luôn từng căn cứ với nguyên văn
(kiem_can_cu: điều, khoản, điểm có tồn tại không; câu trong ngoặc kép có khớp không). Căn cứ ngoài kho: bước 6 vẫn phải chạy.
"""
import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lint_ccpl  # noqa: E402
import kho_luat  # noqa: E402
import kiem_can_cu  # noqa: E402

_MAY = {}


def may_kiem(kho):
    if kho not in _MAY:
        _MAY[kho] = kiem_can_cu.May(kho)
    return _MAY[kho]

DONG_NHAC = "Cần đối chiếu trước khi dùng:"
CAU_TOI_DA = 40          # "Câu quá 40 chữ phải tách"
DOAN_TOI_DA = 6          # "Đoạn quá sáu câu đang gánh hai bước"
NGAN_SACH = {            # (đủ, trần mềm, trần cứng) tính bằng chữ, cho MỘT nhận định / MỘT issue
    "nhan-dinh": (150, 250, 400),
    "tinh-huong": (350, 600, 600),
}
MO_DAU_NHAN_DINH = re.compile(r"^(Đúng một phần|Đúng|Sai)\b")
MO_DAU_NGUONG_DUNG = re.compile(r"^(Chưa đủ căn cứ|Chưa thể kết luận|Chưa chốt được)", re.I)
VIET_TAT = re.compile(r"\b(TP|Tp|ThS|TS|PGS|GS|tr|vd|Vd|v\.v|St|No|Đ|k|đ)\.$")
CHUNG_CHUNG = re.compile(r"theo quy định (của )?pháp luật( hiện hành)?(?! (về|của) )|theo pháp luật hiện hành|theo luật định", re.I)
MIEN_TRU = re.compile(r"không (phải|thay thế) (là )?(ý kiến )?tư vấn pháp lý|chỉ mang tính (chất )?tham khảo|nên tham khảo ý kiến luật sư", re.I)
DEM_BAT_DINH = re.compile(r"cần lưu ý rằng|nhìn chung|có lẽ|dường như|về cơ bản|có thể nói rằng", re.I)
TOM_TAT = re.compile(r"^(Tóm lại|Tổng kết|Như vậy, tóm lại|Kết luận:|Tóm tắt:)", re.I)
GACH_DAU_DONG = re.compile(r"^\s*([-*•–+]|[✓✗✔✘►▪●★])\s+\S")
DANH_SO = re.compile(r"^\s*\d+[.)]\s+\S")
BIEU_TUONG = re.compile("[\U0001F300-\U0001FAFF☀-➿⭐✅❌]")
DIEU = re.compile(r"\bĐiều\s+(\d+[a-zđ]?)")
TRICH = re.compile(r"“[^”]*”|\"[^\"]*\"")


def so_chu(s):
    return len([w for w in s.split() if re.search(r"\w", w)])


def tach_cau(doan):
    """Tách đoạn thành câu ở . ? ! … (không tách ở ; và :), bỏ qua chữ viết tắt và số thập phân."""
    cau, dau = [], 0
    for m in re.finditer(r"[.?!…]+[”\")\]]*\s+(?=[A-ZÀ-ỸĐ“\"(\[\d*])", doan):
        truoc = doan[dau:m.start() + 1]
        if VIET_TAT.search(truoc.rstrip()[-8:]) or re.search(r"\d\.$", truoc) and re.match(r"\s*\d", doan[m.end():]):
            continue
        cau.append(doan[dau:m.end()].strip())
        dau = m.end()
    cuoi = doan[dau:].strip()
    if cuoi:
        cau.append(cuoi)
    return cau


def kiem(van, dang="nhan-dinh", so_issue=1, kho=None):
    """Trả danh sách (mã, mức, lời). mức: error | warning | info. Có kho thì đối chiếu luôn từng căn cứ với nguyên văn luật."""
    kq = []
    van = van.strip()
    if not van:
        return [("DR00", "error", "câu trả lời rỗng")]
    dong = van.split("\n")
    vi_tri_nhac = [i for i, d in enumerate(dong) if DONG_NHAC in d]
    than = "\n".join(d for d in dong if DONG_NHAC not in d).strip()
    doan = [p.strip() for p in re.split(r"\n\s*\n", than) if p.strip()]
    cau_dau = tach_cau(doan[0])[0] if doan else ""
    cau_dau_tran = re.sub(r"^[*_>#\s]+", "", cau_dau)
    nguong_dung = bool(MO_DAU_NGUONG_DUNG.match(cau_dau_tran))

    # DR01 — kết luận ở câu đầu
    if dang == "nhan-dinh" and not nguong_dung and not MO_DAU_NHAN_DINH.match(cau_dau_tran):
        kq.append(("DR01", "error", f"câu đầu phải là kết luận Đúng / Sai / Đúng một phần (hoặc nói rõ chưa đủ căn cứ khi chạm Ngưỡng dừng), đang là: “{cau_dau_tran[:60]}…”"))
    if nguong_dung and re.search(r"(^|\n)\s*(Đúng|Sai)[,.:]", than):
        kq.append(("DR01", "error", "đã chạm Ngưỡng dừng thì không viết câu kết luận Đúng/Sai như thể đã chốt"))

    # DR02 — ngân sách chữ
    n = so_chu(than)
    if dang in NGAN_SACH:
        du, mem, cung = (x * so_issue for x in NGAN_SACH[dang])
        don_vi = "nhận định" if dang == "nhan-dinh" else "issue"
        if n > cung:
            kq.append(("DR02", "error", f"{n} chữ, vượt trần {cung} chữ cho {so_issue} {don_vi}: cắt theo thứ tự ba tầng trong SKILL.md"))
        elif n > mem:
            kq.append(("DR02", "warning", f"{n} chữ, quá {mem}: chỉ chấp nhận khi đề chạm nhiều chế định"))
        elif n < du * 0.6:
            kq.append(("DR02", "warning", f"{n} chữ, dưới 60% ngân sách {du}–{mem}: kiểm xem có hụt nhịp Giải thích không"))

    # DR03, DR04 — câu và đoạn
    for d in doan:
        cs = tach_cau(d)
        if len(cs) > DOAN_TOI_DA:
            kq.append(("DR04", "error", f"đoạn {len(cs)} câu (quá {DOAN_TOI_DA}): đang gánh hai bước lập luận, tách ra — “{d[:50]}…”"))
        for c in cs:
            k = so_chu(TRICH.sub(" ", c))  # chữ trong ngoặc kép là nguyên văn quy phạm, không tính
            if k > CAU_TOI_DA:
                kq.append(("DR03", "error", f"câu {k} chữ (quá {CAU_TOI_DA}), phải tách — “{c[:60]}…”"))

    # DR05, DR06 — hình thức dòng
    bang = [d for d in dong if d.strip().startswith("|")]
    if bang and dang != "so-sanh":
        kq.append(("DR05", "error", "có bảng: chỉ dạng so sánh mới dùng bảng, và chỉ khi người dùng yêu cầu"))
    for d in dong:
        if GACH_DAU_DONG.match(d):
            kq.append(("DR05", "error", f"gạch đầu dòng: viết thành đoạn văn — “{d.strip()[:50]}”"))
        elif re.match(r"^\s*#{1,6}\s", d):
            kq.append(("DR05", "error", f"đề mục markdown trong câu trả lời — “{d.strip()[:50]}”"))
        elif DANH_SO.match(d):
            kq.append(("DR06", "warning", f"đánh số dòng: chỉ khi trình tự là bắt buộc pháp lý — “{d.strip()[:50]}”"))
        if BIEU_TUONG.search(d):
            kq.append(("DR05", "error", f"icon/emoji — “{d.strip()[:50]}”"))
    dam = [d for d in dong if re.match(r"^\s*\*\*[^*]+\*\*", d)]
    if dang == "nhan-dinh" and len(dam) >= 2:
        kq.append(("DR05", "warning", f"{len(dam)} dòng mở bằng chữ in đậm: không chia đề mục in đậm cho một nhận định"))

    # DR07–DR09 — nội dung thừa
    if CHUNG_CHUNG.search(than):
        kq.append(("DR08", "error", f"viện dẫn chung chung “{CHUNG_CHUNG.search(than).group(0)}”: thay bằng điều khoản cụ thể"))
    if MIEN_TRU.search(than):
        kq.append(("DR07", "warning", "có câu miễn trừ: chỉ giữ khi có rủi ro pháp lý thật"))
    dem = DEM_BAT_DINH.findall(than)
    if len(dem) >= 2:
        kq.append(("DR09", "warning", f"{len(dem)} cụm đệm bất định ({', '.join(sorted(set(x.lower() for x in dem)))}): dồn độ bất định vào dòng “{DONG_NHAC}”"))
    if doan and TOM_TAT.match(re.sub(r"^[*_\s]+", "", doan[-1])) and len(doan) > 1:
        kq.append(("DR09", "warning", "đoạn cuối là tóm tắt lại: bỏ, trừ khi người dùng yêu cầu"))

    # DR10, DR11 — căn cứ
    cac_dieu = set(DIEU.findall(than))
    if not cac_dieu and not nguong_dung and dang != "so-sanh":
        kq.append(("DR10", "error", "không có căn cứ pháp lý nào đến cấp Điều"))
    if dang == "nhan-dinh" and len(cac_dieu) > 4 * so_issue:
        kq.append(("DR11", "warning", f"{len(cac_dieu)} điều luật khác nhau cho {so_issue} nhận định: một đến hai CCPL chính là đủ, căn cứ phụ tăng rủi ro dẫn sai"))

    # DR12 — dòng nhắc đối chiếu
    if len(vi_tri_nhac) > 1:
        kq.append(("DR12", "error", f"dòng “{DONG_NHAC}” xuất hiện {len(vi_tri_nhac)} lần: gom vào một dòng duy nhất ở cuối"))
    elif vi_tri_nhac:
        sau = [d for d in dong[vi_tri_nhac[0] + 1:] if d.strip()]
        if sau:
            kq.append(("DR12", "error", f"dòng “{DONG_NHAC}” phải là dòng cuối cùng"))
    else:
        kq.append(("DR12", "info", f"không có dòng “{DONG_NHAC}”: chỉ đúng khi mọi căn cứ đã đối chiếu văn bản gốc trong phiên (mức A)"))

    # quy cách CCPL
    for f in lint_ccpl.lint_text(van):
        kq.append((f.code, f.severity, f.message))

    # CC01–CC04 — đối chiếu từng căn cứ với kho luật (điều, khoản, điểm có tồn tại không; nguyên văn có khớp không)
    if kho:
        dem, da = {}, set()
        for r in may_kiem(kho).kiem(van):
            dem[r["kq"]] = dem.get(r["kq"], 0) + 1
            ten = r["vb"].ten if r["vb"] else ""
            khoa = (r["vien_dan"], r["kq"])
            if khoa in da:
                continue
            da.add(khoa)
            if r["kq"] == "sai":
                kq.append(("CC01", "error" if r.get("dich_danh") else "warning",
                           f"căn cứ không khớp kho luật: {r['vien_dan']} {ten}{'' if r.get('dich_danh') else ' (văn bản suy theo ngữ cảnh)'} — {r['loi']}"))
            elif r["kq"] == "trich_lech":
                kq.append(("CC02", "error", f"nguyên văn lệch: {r['vien_dan']} — {r['loi']}"))
            elif r["kq"] == "khac_ban":
                kq.append(("CC03", "warning", f"{r['vien_dan']} {ten} — {r['loi']}"))
        chua = dem.get("ngoai_kho", 0) + dem.get("khong_ro", 0)
        kq.append(("CC04", "info", f"{dem.get('khop', 0)} căn cứ khớp kho luật (mức B)"
                   + (f"; {chua} căn cứ ngoài kho hoặc không rõ văn bản: phải đối chiếu theo bước 6 và nêu ở dòng nhắc" if chua else "")))
    return kq


def main(argv=None):
    ap = argparse.ArgumentParser(description="Chấm hình thức câu trả lời pháp luật trước khi gửi")
    ap.add_argument("path", nargs="?", help="file nháp (.txt/.md)")
    ap.add_argument("--stdin", action="store_true", help="đọc nháp từ stdin")
    ap.add_argument("--dang", choices=["nhan-dinh", "tinh-huong", "so-sanh"], default="nhan-dinh")
    ap.add_argument("--so-issue", type=int, default=1, help="số issue của tình huống (ngân sách nhân theo)")
    ap.add_argument("--kho", help="thư mục kho luật .txt (mặc định: tự tìm repo Luyện Luật hoặc kho-luat/ đóng kèm skill)")
    ap.add_argument("--khong-kho", action="store_true", help="chỉ chấm hình thức, không đối chiếu căn cứ với kho luật")
    a = ap.parse_args(argv)
    if a.stdin:
        van = sys.stdin.read()
    elif a.path:
        with open(a.path, encoding="utf-8") as f:
            van = f.read()
    else:
        ap.error("cần file nháp hoặc --stdin")
    khoi = [k for k in re.split(r"(?m)^\s*---\s*$", van) if k.strip()] if a.dang == "nhan-dinh" else [van]
    kho = None if a.khong_kho else kho_luat.tim_kho(a.kho)
    if not kho and not a.khong_kho:
        print("(không tìm thấy kho luật: chỉ chấm hình thức; căn cứ phải đối chiếu theo bước 6)")
    loi = 0
    for i, k in enumerate(khoi, 1):
        kq = kiem(k, a.dang, a.so_issue, kho)
        nhan = f"Câu {i}: " if len(khoi) > 1 else ""
        print(f"{nhan}{so_chu(chr(10).join(d for d in k.split(chr(10)) if DONG_NHAC not in d))} chữ · dạng {a.dang}")
        for ma, muc, loi_van in kq:
            print(f"  {muc.upper():7} {ma}  {loi_van}")
        loi += sum(1 for _, muc, _ in kq if muc == "error")
    print(("ĐẠT hình thức" + (" và căn cứ khớp kho" if kho else "")) if not loi else f"CHƯA ĐẠT ({loi} lỗi error)")
    return 1 if loi else 0


if __name__ == "__main__":
    sys.exit(main())
