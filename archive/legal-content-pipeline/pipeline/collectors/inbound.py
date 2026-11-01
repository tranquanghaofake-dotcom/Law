"""Câu hỏi khán giả gửi về qua Google Form (export CSV) — nguồn độc quyền, không vấn đề bản quyền.
Đặt file .csv vào data/inbound/. Cột bắt buộc: 'cau_hoi'; tùy chọn: 'ten_hien_thi', 'thoi_gian'.
Google Form: tạo form 1 câu hỏi dài, Responses → link Sheets → File → Download → CSV (đổi tên cột cho khớp)."""
import csv
from pathlib import Path

from ..settings import CFG, ROOT


def collect():
    folder = ROOT / CFG["sources"]["inbound"]["path"]
    out = []
    for f in sorted(Path(folder).glob("*.csv")):
        with open(f, encoding="utf-8-sig") as fh:
            for row in csv.DictReader(fh):
                q = (row.get("cau_hoi") or row.get("Câu hỏi") or "").strip()
                if len(q) < 20:
                    continue
                out.append({
                    "platform": "inbound",
                    "url": f"inbound://{f.name}",
                    "author": row.get("ten_hien_thi", "ẩn danh") or "ẩn danh",
                    "text": q[:2000],
                    "engagement": 5,  # ưu tiên nhẹ: câu hỏi độc quyền
                })
    return out
