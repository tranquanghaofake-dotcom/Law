#!/usr/bin/env python3
"""Đối chiếu MỌI căn cứ pháp lý trong một văn bản (bản nháp câu trả lời, chương khóa luận, file reference) với kho luật.

Với từng viện dẫn "điểm a khoản 2 Điều 59 Luật Doanh nghiệp": văn bản có trong kho không, Điều có tồn tại không,
có đúng khoản, điểm đó không; in tên điều để soát đúng chủ đề. Câu trong ngoặc kép đặt ngay sau viện dẫn được so
nguyên văn với điều luật. Năm viện dẫn cũ hơn bản trong kho → nhắc soát hiệu lực.

Dùng:
  python3 -I scripts/kiem_can_cu.py nháp.txt                 # chỉ in chỗ có vấn đề + tổng kết
  python3 -I scripts/kiem_can_cu.py --stdin --chi-tiet < nháp.txt
  python3 -I scripts/kiem_can_cu.py references/ --kho <thư mục kho>

Thoát mã 1 khi có căn cứ SAI (điều, khoản, điểm không tồn tại trong văn bản được dẫn đích danh). Căn cứ "khớp kho"
là mức B: đúng với bản chữ trong kho tại ngày đối chiếu ghi ở đầu mỗi file, chưa phải đối chiếu vbpl.vn.
Văn bản ngoài kho (nghị định, thông tư, điều ước…) không được kiểm ở đây: vẫn phải chạy bước 6.
"""
import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kho_luat as K  # noqa: E402

REF = re.compile(
    r"(?:(?P<diem>[Đđ]iểm\s+[a-zđ](?:\s*(?:,|và)\s*[a-zđ])*)\s+)?"
    r"(?:(?P<khoan>[Kk]hoản\s+\d+(?:\s*(?:,|và)\s*\d+)*)\s+)?"
    r"Điều\s+(?P<dieu>\d+[a-zđ]?(?:\s*(?:,|và|–|-|đến)\s*(?:Điều\s+)?\d+[a-zđ]?)*)(?![\d/])")
SO_HIEU = re.compile(r"(?<![\d/])(\d+/\d{4}/[A-ZĐ][\wĐ-]*)")
VB_LA = re.compile(r"\b(?:Bộ luật|Luật|Pháp lệnh|Nghị định|Nghị quyết|Thông tư|Công ước|Hiệp định|Quy tắc|Hiến chương)\s+(?:số\s+)?[A-ZĐÀ-Ỹ\d][\wÀ-ỹ/-]*"
                   r"|\b(?:NĐ|TT|TTLT|NQ|QĐ|PL|CV)\s*(?:số\s*)?\d+(?:/\d{4})?(?:/[\wĐ-]+)?"  # viết tắt: "NĐ 155", "TT 45/2020"
                   r"|\b(?:Quyết định|Công văn|Thông tư liên tịch|Chỉ thị)\s+(?:số\s+)?\d[\w/-]*"
                   r"|\b(?:CISG|GATT|GATS|TRIPS|DSU|ADA|SCM|UCP|ISBP|URC|Incoterms|EVFTA|CPTPP|RCEP|GDPR|BLTTHS|UNCITRAL)\b")
CUNG_VB = re.compile(r"cùng (bộ )?luật|(bộ )?luật này|cùng văn bản", re.I)
TRICH = re.compile(r"“([^”]{25,})”|\"([A-Za-zÀ-ỹĐđ\d][^\"\n]{24,})\"")  # ngoặc thẳng: phải mở bằng chữ, không vắt dòng
NAM_SAU = re.compile(r"\s*(?:năm\s+)?((?:19|20)\d{2})(?!\s*[–-]\s*\d|/)")


def chuan(s):
    s = re.sub(r"[*_`]", "", s.lower())
    s = re.sub(r"[“”\"'‘’]", "", s)
    return re.sub(r"[\s ]+", " ", re.sub(r"[–—-]", "-", s)).strip(" .,;:")


class May:
    def __init__(self, kho):
        self.kho = kho
        self.vb = K.mo_kho(kho)
        self.theo_so = {v.so: v for v in self.vb if v.so}
        ten = []
        for v in self.vb:
            for g in v.ten_goi():
                viet_tat = g.isupper() or g.split()[-1].isupper()
                ten.append((g, v, viet_tat))
        ten.sort(key=lambda x: -len(x[0]))
        self.ten = [(re.compile((r"(?<![\wÀ-ỹ])" + re.escape(g).replace(r"\ ", r"\s+") + r"(?![\wÀ-ỹ])"), 0 if vt else re.I), v) for g, v, vt in ten]

    def nhac_van_ban(self, van):
        """Mọi chỗ nhắc tới một văn bản: (đầu, cuối, VanBan | None nếu ngoài kho, năm viện dẫn | None)."""
        kq, da = [], []

        def trong(a, b):
            return any(x <= a < y or x < b <= y for x, y in da)

        for mau, v in self.ten:
            for m in mau.finditer(van):
                if trong(m.start(), m.end()):
                    continue
                cuoi, nam = m.end(), None
                n = NAM_SAU.match(van, cuoi)
                if n:
                    nam, cuoi = int(n.group(1)), n.end()
                s = re.match(r"\s*(?:số\s+)?(\d+/\d{4}/[A-ZĐ][\wĐ-]*)", van[cuoi:cuoi + 40])
                if s:
                    cuoi += s.end()
                    nam = nam or int(s.group(1).split("/")[1])
                da.append((m.start(), cuoi))
                kq.append((m.start(), cuoi, v, nam))
        for m in SO_HIEU.finditer(van):
            if not trong(m.start(), m.end()):
                v = self.theo_so.get(m.group(1))
                da.append((m.start(), m.end()))
                kq.append((m.start(), m.end(), v, None))
        for m in VB_LA.finditer(van):
            if not trong(m.start(), m.end()):
                da.append((m.start(), m.end()))
                kq.append((m.start(), m.end(), None, None))
        return sorted(kq)

    @staticmethod
    def xet(vb, so, khoan, diem, mot_dieu):
        if so not in vb.dieu:
            return {"kq": "sai", "loi": f"{vb.ten} không có Điều {so} (văn bản có {len(vb.dieu)} điều)"}
        dd, loi = vb.dieu[so], None
        if mot_dieu:
            for k in khoan:
                dk = K.lay_khoan(dd, k)
                if not dk:
                    co = [x.group(1) for x in (K.KHOAN.match(d.strip()) for d in dd[1:]) if x]
                    loi = f"Điều {so} không có khoản {k}" + (f" (có khoản {co[0]}–{co[-1]})" if co else " (điều này không chia khoản)")
                    break
                for c in diem if len(khoan) == 1 else []:
                    if not K.co_diem(dk, c):
                        loi = f"khoản {k} Điều {so} không có điểm {c}"
            if not khoan:
                for c in diem:
                    if not K.co_diem(dd, c):
                        loi = f"Điều {so} không có điểm {c}"
        return {"kq": "sai" if loi else "khop", "loi": loi, "ten_dieu": dd[0]}

    def kiem(self, van):
        """Trả danh sách dict: mỗi viện dẫn một dòng kết quả."""
        van = re.sub(r"<!--.*?-->", lambda m: " " * len(m.group(0)), van, flags=re.S)
        kq = []
        muc = [m.start() for m in re.finditer(r"(?m)^#{1,6}\s", van)] + [len(van)]
        nhac = self.nhac_van_ban(van)
        for m in REF.finditer(van):
            dong = van.count("\n", 0, m.start()) + 1
            dau_dong = van.rfind("\n", 0, m.start()) + 1
            ca_dong = van[dau_dong:van.find("\n", m.end()) if van.find("\n", m.end()) > 0 else len(van)]
            if "lint-ignore" in ca_dong or re.search(r"\((sai|ví dụ sai)\)", ca_dong):
                continue
            # 1. văn bản đứng ngay sau viện dẫn ("Điều 59 Luật Doanh nghiệp")
            vb, nam, suy, ro, truc_tiep = None, None, False, False, False
            cuoi_dong = van.find("\n", m.end()) if van.find("\n", m.end()) > 0 else len(van)
            i = van.rfind("\n\n", 0, m.start())
            dau_doan = i + 2 if i >= 0 else 0  # rfind trả -1 khi viện dẫn nằm ở đoạn đầu
            if re.match(r"\s*([-*+|]|\d+[.)])\s", ca_dong):  # mỗi gạch đầu dòng, mỗi hàng bảng là một đoạn riêng
                dau_doan = dau_dong
            dau_muc = max([x for x in muc if x <= m.start()] or [0])
            cuoi_muc = min([x for x in muc if x > m.start()] or [len(van)])
            ngu_canh = [x for x in nhac if not re.search(r"(sửa đổi|bổ sung|hợp nhất|thay thế|đã thay|bãi bỏ)[^.;\n]{0,60}$", van[max(0, x[0] - 70):x[0]])]
            ung_vien = [x[2] for x in ngu_canh if dau_muc <= x[0] < cuoi_muc and x[2] is not None]
            sau = [x for x in nhac if m.end() <= x[0] <= m.end() + 45 and not re.search(r"[.;:\n]|Điều\s+\d", van[m.end():x[0]])]
            if sau:
                _, _, vb, nam = sau[0]
                ro = truc_tiep = True
            elif CUNG_VB.match(van[m.end():m.end() + 25].strip()) or True:
                # 2. văn bản gần nhất phía trước trong cùng đoạn; 3. văn bản phía sau trên cùng dòng; 4. cùng mục (đánh dấu là suy)
                truoc = [x for x in ngu_canh if dau_doan <= x[0] < m.start()]
                if not truoc:
                    truoc = [x for x in ngu_canh if m.end() <= x[0] < cuoi_dong][:1]
                if not truoc:
                    truoc, suy = [x for x in ngu_canh if dau_muc <= x[0] < m.start()], True
                if truoc:
                    _, cuoi_nhac, vb, nam = truoc[-1]
                    ro = True
                    # văn bản đứng trước, cùng câu, sát viện dẫn ("Luật X quy định tại khoản 2 Điều 5") cũng là dẫn đích danh
                    giua = van[cuoi_nhac:m.start()]
                    truc_tiep = not suy and cuoi_nhac <= m.start() and len(giua) <= 120 and not re.search(r"[.;!?](\s|$)|\n", giua)
            cac_dieu = []
            for manh in re.split(r"\s*(?:,|và)\s*", re.sub(r"Điều\s+", "", m.group("dieu"))):
                kh = re.split(r"\s*(?:–|-|đến)\s*", manh)
                if len(kh) == 2 and kh[0].isdigit() and kh[1].isdigit() and 0 < int(kh[1]) - int(kh[0]) <= 25:
                    cac_dieu += [str(i) for i in range(int(kh[0]), int(kh[1]) + 1)]
                else:
                    cac_dieu += kh
            khoan = re.findall(r"\d+", m.group("khoan") or "")
            diem = re.findall(r"\b[a-zđ]\b", re.sub(r"[Đđ]iểm|và", "", m.group("diem") or ""))
            bai_bo = bool(re.search(r"bãi bỏ|hết hiệu lực|đã bị thay|bị thay thế", van[max(dau_dong, m.start() - 60):m.end() + 40]))
            for so in cac_dieu:
                r = {"dong": dong, "vien_dan": re.sub(r"\s+", " ", m.group(0)), "dieu": so, "vb": vb, "suy": suy, "dich_danh": truc_tiep, "cuoi": m.end(), "dau": m.start()}
                if not ro:
                    r.update(kq="khong_ro", loi="không rõ văn bản nào")
                elif vb is None:
                    r.update(kq="ngoai_kho", loi="văn bản không có trong kho")
                elif nam and vb.nam and nam != vb.nam and not (vb.nam < nam and str(nam) in vb.tieu_de):
                    cu = nam < vb.nam
                    r.update(kq="khac_ban", loi=f"dẫn bản năm {nam}, kho có bản {vb.nam} ({vb.so or vb.tep})"
                             + (" — bản được dẫn CŨ hơn: soát xem còn hiệu lực với thời điểm của đề không" if cu else ""))
                else:
                    r.update(self.xet(vb, so, khoan, diem, len(cac_dieu) == 1))
                    if r["kq"] == "sai" and not truc_tiep:
                        # văn bản lấy theo ngữ cảnh: thử các văn bản khác được nhắc trong cùng mục, khớp đúng một thì nhận văn bản đó
                        khac = []
                        for x in ung_vien:
                            if x is not vb and x not in khac and self.xet(x, so, khoan, diem, len(cac_dieu) == 1)["kq"] == "khop":
                                khac.append(x)
                        if len(khac) == 1:
                            r.update(self.xet(khac[0], so, khoan, diem, len(cac_dieu) == 1), vb=khac[0], suy=True)
                    if r["kq"] == "sai" and bai_bo and "không có Điều" in r["loi"]:
                        r.update(kq="bai_bo", loi="điều đã bị bãi bỏ, không còn trong bản chữ của kho (khớp với lời văn)")
                kq.append(r)
        # nguyên văn trong ngoặc kép đứng ngay sau một viện dẫn đã khớp
        for m in TRICH.finditer(van):
            cau = m.group(1) or m.group(2)
            gan = [r for r in kq if r["kq"] == "khop" and 0 <= m.start() - r["cuoi"] <= 140 and not re.search(r"[.;!?\n]", van[r["cuoi"]:m.start()])]
            if not gan:
                continue
            r = gan[-1]
            manh = [chuan(x) for x in re.split(r"…|\.\.\.|\[…\]", cau) if len(chuan(x)) >= 12]
            if not manh:
                continue
            bai = chuan(" ".join(r["vb"].dieu[r["dieu"]]))
            if all(x in bai for x in manh):
                r["trich"] = "khop"
                continue
            noi_khac = [so for so, dd in r["vb"].dieu.items() if all(x in chuan(" ".join(dd)) for x in manh)]
            kq.append({"dong": van.count("\n", 0, m.start()) + 1, "vien_dan": f"“{cau[:50]}…”", "dieu": r["dieu"], "vb": r["vb"], "suy": False, "dich_danh": True,
                       "kq": "trich_lech", "cuoi": m.end(), "dau": m.start(),
                       "loi": (f"câu trong ngoặc kép không có trong Điều {r['dieu']} mà nằm ở Điều {', '.join(noi_khac[:3])}" if noi_khac
                               else f"câu trong ngoặc kép không khớp nguyên văn Điều {r['dieu']} {r['vb'].ten}: bỏ ngoặc kép nếu là diễn đạt lại, hoặc chép lại đúng chữ")})
        return sorted(kq, key=lambda r: r["dau"])


def in_ket_qua(ten, kq, chi_tiet):
    dem, da_in = {}, set()
    for r in kq:
        dem[r["kq"]] = dem.get(r["kq"], 0) + 1
    for r in kq:
        ten_vb = r["vb"].ten if r["vb"] else ""
        ngo = not r.get("dich_danh")
        suy = f" (văn bản suy theo ngữ cảnh: {ten_vb})" if (r["suy"] or (ngo and r["kq"] == "sai")) and r["vb"] else ""
        if r["kq"] == "sai":
            dong = f"{'⚠' if ngo else '✗'} {ten}:{r['dong']}  {r['vien_dan']} {'' if ngo else ten_vb}{suy} — {re.sub(r'Điều [0-9a-zđ]+ ', 'Điều … ', r['loi']) if ',' in r['vien_dan'] or 'đến' in r['vien_dan'] else r['loi']}"
        elif r["kq"] == "khac_ban":
            dong = f"⚠ {ten}:{r['dong']}  {r['vien_dan']} {ten_vb} — {r['loi']}"
        elif r["kq"] == "trich_lech":
            dong = f"⚠ {ten}:{r['dong']}  {r['vien_dan']} — {r['loi']}"
        elif chi_tiet and r["kq"] == "khop":
            dong = f"✓ {ten}:{r['dong']}  {r['vien_dan']} {'' if r['suy'] else ten_vb}{suy} → {r['ten_dieu']}{' · nguyên văn khớp' if r.get('trich') else ''}"
        elif chi_tiet:
            dong = f"· {ten}:{r['dong']}  {r['vien_dan']} — {r['loi']}"
        else:
            continue
        khoa = (r["dong"], r["vien_dan"], r["kq"]) if r["kq"] != "khop" else dong
        if khoa not in da_in:
            da_in.add(khoa)
            print(dong)
    return dem


def main(argv=None):
    ap = argparse.ArgumentParser(description="Đối chiếu căn cứ pháp lý trong văn bản với kho luật")
    ap.add_argument("duong", nargs="*", help="file hoặc thư mục (.md/.txt)")
    ap.add_argument("--stdin", action="store_true")
    ap.add_argument("--kho", help="thư mục kho luật .txt")
    ap.add_argument("--chi-tiet", action="store_true", help="in cả căn cứ đã khớp kèm tên điều")
    a = ap.parse_args(argv)
    kho = K.tim_kho(a.kho)
    if not kho:
        print("Không tìm thấy kho luật. Chỉ thư mục bằng --kho hoặc biến KHO_LUAT; không có kho thì đối chiếu theo "
              "references/quy-trinh-xac-minh.md.", file=sys.stderr)
        return 2
    may = May(kho)
    nguon = []
    if a.stdin:
        nguon.append(("<stdin>", sys.stdin.read()))
    for d in a.duong:
        tep = [os.path.join(g, t) for g, _, ts in os.walk(d) for t in sorted(ts) if t.endswith((".md", ".txt"))] if os.path.isdir(d) else [d]
        for t in tep:
            with open(t, encoding="utf-8") as f:
                nguon.append((os.path.relpath(t), f.read()))
    if not nguon:
        ap.error("cần file, thư mục hoặc --stdin")
    tong = {}
    for ten, van in nguon:
        for k, n in in_ket_qua(ten, may.kiem(van), a.chi_tiet).items():
            tong[k] = tong.get(k, 0) + n
    sai_ro = sum(1 for ten, van in nguon for r in may.kiem(van) if r["kq"] == "sai" and r.get("dich_danh")) if tong.get("sai") else 0
    print(f"Kho: {kho} ({len(may.vb)} văn bản). {tong.get('khop', 0)} căn cứ khớp kho · {sai_ro} SAI · "
          f"{tong.get('sai', 0) - sai_ro} nghi sai (văn bản suy theo ngữ cảnh) · {tong.get('trich_lech', 0)} nguyên văn lệch · "
          f"{tong.get('khac_ban', 0)} khác bản · {tong.get('bai_bo', 0)} đã bãi bỏ · {tong.get('ngoai_kho', 0)} ngoài kho · {tong.get('khong_ro', 0)} không rõ văn bản")
    print("Khớp kho = mức B (đúng với bản chữ trong kho, chưa phải đối chiếu vbpl.vn). Căn cứ ngoài kho và không rõ văn bản: bước 6 vẫn phải chạy.")
    return 1 if sai_ro else 0


if __name__ == "__main__":
    sys.exit(main())
