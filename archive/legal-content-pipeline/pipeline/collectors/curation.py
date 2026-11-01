"""Bảng curation thủ công theo Brief (15 phút/ngày) — nguồn chính, đã chấm điểm bằng tay.
Đặt file .csv vào data/curation/ (mẫu: TikTok-Phap-Ly_Curation_v1.csv). Chỉ nạp dòng trang_thai=chua có link_goc thật.
Điểm 3 cột của bạn được giữ nguyên (khóa 'manual'), scorer LLM không chấm lại."""
import csv
from pathlib import Path

from ..settings import CFG, ROOT

PILLARS = {"T1", "T2", "T3", "WC"}


def _row(raw: dict) -> dict:
    # tiêu đề cột có chú thích, vd "tru(T1/T2/T3/WC)" -> "tru"
    return {(k or "").split("(")[0].strip(): (v or "").strip() for k, v in raw.items()}


def collect():
    folder = ROOT / CFG["sources"]["curation"]["path"]
    out = []
    for f in sorted(Path(folder).glob("*.csv")):
        with open(f, encoding="utf-8-sig") as fh:
            for i, raw in enumerate(csv.DictReader(fh), start=2):
                r = _row(raw)
                if r.get("trang_thai", "chua") != "chua":
                    continue
                link = r.get("link_goc", "")
                if not link.startswith("http") or link.endswith("..."):
                    continue  # dòng mẫu / chưa có nguồn — Brief mục 3.2: phải ghi nguồn thật
                quote = r.get("trich_doan_duoc_phep_dung", "")
                if not quote or len(quote.split()) > 40:
                    print(f"[curation] {f.name} dòng {i}: trích đoạn rỗng hoặc > 40 từ — rút gọn trong CSV")
                    continue
                pillar = r.get("tru", "").upper().split("/")[0].strip()
                try:
                    scores = {k: int(r.get(c) or 0) for k, c in
                              (("viral", "diem_viral"), ("audience", "diem_dung_khan_gia"), ("confident", "diem_tra_loi_chac"))}
                except ValueError:
                    print(f"[curation] {f.name} dòng {i}: điểm không phải 0/1 — bỏ qua")
                    continue
                summary = r.get("tom_tat_cau_hoi", "")
                text = f"{quote}\n{summary}"
                if r.get("can_cu_du_kien"):
                    text += f"\n[Ghi chú curation] Căn cứ dự kiến: {r['can_cu_du_kien']}"
                out.append({
                    "platform": f"curation/{(r.get('nen_tang') or 'khac').lower()}",
                    "url": link,
                    "author": r.get("tac_gia_hien_thi", ""),
                    "text": text[:2000],
                    "engagement": 0,
                    "manual": {"pillar": pillar if pillar in PILLARS else "NONE", **scores,
                               "risk_flags": [], "summary": summary, "quote": quote},
                })
    return out
