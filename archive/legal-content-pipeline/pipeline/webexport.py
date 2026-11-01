"""Xuất câu trắc nghiệm (thẻ mcq) của kịch bản đã duyệt sang web/data/sets/ rồi dựng lại catalog của web.
Mỗi video có một bộ câu hỏi riêng → CTA "luyện 10 câu ở link bio" dẫn đúng chỗ. Bộ viết tay trong web/ không bị đụng tới."""
import json
import subprocess
import sys
from pathlib import Path

from . import db
from .settings import CFG, ROOT


def export_web():
    web = (ROOT / CFG.get("web", {}).get("dir", "../web")).resolve()
    sets_dir = web / "data" / "sets"
    sets_dir.mkdir(parents=True, exist_ok=True)
    n_sets = 0
    with db.connect() as con:
        for s in db.scripts(con, review_status="approved"):
            qs = []
            for c in json.loads(s["cards"] or "[]"):
                if c.get("type") != "mcq" or len(c.get("options", [])) != 4:
                    continue
                qs.append({"q": c.get("question", ""), "options": c["options"], "answer": int(c.get("answer", 0)),
                           "explain": c.get("explain", ""), "basis": c.get("citation", ""), "url": c.get("url", "")})
            if not qs:
                continue
            sid = f"video-{s['id']:04d}"
            data = {"id": sid, "group": "video", "video": f"{s['id']:02d}", "title": s["title"], "subtitle": s["hook"],
                    "updated": (s["created_at"] or "")[:10], "questions": qs}
            (sets_dir / f"{sid}.json").write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
            print(f"[export-web] #{s['id']} → {sid}.json ({len(qs)} câu)")
            n_sets += 1
    print(f"[export-web] {n_sets} bộ từ kịch bản đã duyệt")
    subprocess.run([sys.executable, str(web / "build_catalog.py")], check=False)
