"""Đăng. mode=queue: ghi hàng đợi CSV (caption, hashtag, đường dẫn video) để đăng tay/lên lịch trong TikTok Studio.
mode=tiktok: TikTok Content Posting API (Direct Post) — cần app đã qua audit, token có scope video.publish.
Tài liệu: https://developers.tiktok.com/doc/content-posting-api-get-started"""
import csv
import json

import requests

from . import db
from .settings import CFG, OUT_DIR, env

HASHTAGS = {"T1": "#phapluat #hopdong #datcoc", "T2": "#phapluat #laodong #dilam", "T3": "#phapluat #hinhsu"}


def caption(s):
    cites = ", ".join(" ".join(x for x in (f"Điều {c.get('article', '')}", c.get("law", ""), str(c.get("year", ""))) if x.strip())
                      for c in json.loads(s["citations"] or "[]"))
    return f"{s['hook']}\nCăn cứ: {cites}\nLuyện 10 câu ở link bio. {HASHTAGS.get(s['pillar'], '#phapluat')}\n(Không phải tư vấn pháp lý)"


def publish_queue():
    mode = CFG["publish"]["mode"]
    with db.connect() as con:
        rows = [s for s in db.scripts(con, review_status="approved") if not s["published_at"]]
        print(f"[publish] {len(rows)} kịch bản chờ đăng (mode={mode})")
        if mode == "queue":
            path = OUT_DIR / "publish_queue.csv"
            with open(path, "w", newline="", encoding="utf-8-sig") as f:
                w = csv.writer(f)
                w.writerow(["script_id", "title", "media_path", "caption"])
                for s in rows:
                    w.writerow([s["id"], s["title"], s["rendered_path"] or "(chưa dựng)", caption(s)])
            print(f"[publish] hàng đợi → {path}. Sau khi đăng tay, chạy: python run.py mark-published <id>")
            return
        token = env("TIKTOK_ACCESS_TOKEN")
        for s in rows:
            if not s["rendered_path"]:
                continue
            init = requests.post(
                "https://open.tiktokapis.com/v2/post/publish/video/init/",
                headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json; charset=UTF-8"},
                json={
                    "post_info": {"title": caption(s)[:2200], "privacy_level": "SELF_ONLY", "disable_comment": False},
                    "source_info": {"source": "FILE_UPLOAD", "video_size": 0, "chunk_size": 0, "total_chunk_count": 1},
                },
                timeout=30,
            )
            print(f"[publish] #{s['id']} init: {init.status_code} {init.text[:200]} — bước upload chunk làm theo docs TikTok")


def mark_published(sid: int):
    with db.connect() as con:
        con.execute("UPDATE scripts SET published_at=? WHERE id=?", (db.now(), sid))
        con.commit()
    print(f"[publish] #{sid} đã đánh dấu đăng")
