#!/usr/bin/env python3
"""Đóng gói skill thành file .zip để tải lên claude.ai, KÈM kho luật lấy từ repo Luyện Luật.

  python3 scripts/dong_goi.py                      # ra ./vn-legal-exam-analysis.zip
  python3 scripts/dong_goi.py --out <file.zip> --kho <thư mục kho>

Trong repo, kho luật chỉ có một bản ở packages/content/data/laws (không chép vào thư mục skill). Bản zip thì mang theo
kho-luat/ để tra_dieu.py và kiem_can_cu.py chạy được ở nơi không có repo, không có mạng. Kho đổi thì đóng gói lại.
"""
import argparse
import datetime
import os
import sys
import zipfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kho_luat as K  # noqa: E402

TEN = os.path.basename(K.GOC_SKILL)


def main(argv=None):
    ap = argparse.ArgumentParser(description="Đóng gói skill kèm kho luật")
    ap.add_argument("--out", default=f"{TEN}.zip")
    ap.add_argument("--kho", help="thư mục kho luật .txt (mặc định: tự tìm trong repo)")
    a = ap.parse_args(argv)
    kho = K.tim_kho(a.kho)
    if not kho:
        print("Không tìm thấy kho luật: chạy trong repo Luyện Luật hoặc chỉ --kho.", file=sys.stderr)
        return 2
    vb = K.mo_kho(kho)
    muc_luc = [f"# Kho luật đóng kèm skill — đóng gói ngày {datetime.date.today():%d/%m/%Y}", "",
               "Bản chữ lấy từ repo Luyện Luật (`packages/content/data/laws`). Dòng đầu mỗi file ghi nguồn và ngày đối chiếu; "
               "nhật ký nguồn đầy đủ ở `NGUON.md`. Căn cứ lấy từ kho là mức B cho đến khi đối chiếu vbpl.vn.", "",
               "| File | Văn bản | Số hiệu | Số điều |", "|---|---|---|---|"]
    muc_luc += [f"| {v.tep} | {v.ten} | {v.so or (v.nam or '')} | {len(v.dieu)} |" for v in vb]
    so_tep = 0
    with zipfile.ZipFile(a.out, "w", zipfile.ZIP_DEFLATED) as z:
        for goc, thu_muc, tep in os.walk(K.GOC_SKILL):
            thu_muc[:] = [d for d in thu_muc if d not in ("__pycache__", "kho-luat", ".git")]
            for t in sorted(tep):
                if t.endswith((".pyc", ".zip")):
                    continue
                duong = os.path.join(goc, t)
                z.write(duong, os.path.join(TEN, os.path.relpath(duong, K.GOC_SKILL)))
                so_tep += 1
        for t in sorted(os.listdir(kho)):
            if t.endswith(".txt"):
                z.write(os.path.join(kho, t), f"{TEN}/kho-luat/{t}")
        nguon = os.path.join(os.path.dirname(kho), "SOURCES.md")
        if os.path.isfile(nguon):
            z.write(nguon, f"{TEN}/kho-luat/NGUON.md")
        z.writestr(f"{TEN}/kho-luat/MUC-LUC.md", "\n".join(muc_luc) + "\n")
    print(f"Đã đóng gói {a.out}: {so_tep} file của skill + {len(vb)} văn bản trong kho-luat/ "
          f"({os.path.getsize(a.out) / 1e6:.1f} MB). Tải file này lên claude.ai để thay bản cũ.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
