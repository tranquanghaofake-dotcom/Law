"""Dựng kịch bản đã duyệt. render.mode = carousel (mặc định): bộ ảnh TikTok dạng lướt, xem pipeline/carousel.py.
render.mode = mpt: gửi sang MoneyPrinterTurbo (REST API) để render video 9:16 với Edge TTS vi-VN.
MPT: https://github.com/harry0703/MoneyPrinterTurbo — chạy `docker compose up` rồi API ở :8080.
API có thể đổi theo phiên bản; nếu lỗi, xem http://localhost:8080/docs và chỉnh payload bên dưới."""
import json
import time

import requests

from . import db
from .settings import CFG, OUT_DIR


def _payload(s):
    r = CFG["render"]
    return {
        "video_subject": s["title"],
        "video_script": s["full_text"],      # dùng kịch bản đã duyệt, KHÔNG để MPT tự sinh script
        "video_terms": "law, contract, office, city, money",  # từ khóa tìm footage stock
        "video_aspect": r["video_aspect"],
        "video_concat_mode": "random",
        "video_clip_duration": 5,
        "video_count": 1,
        "video_language": "vi-VN",
        "voice_name": r["voice_name"],
        "voice_rate": 1.0,
        "bgm_type": "random" if r["bgm"] else "",
        "bgm_volume": 0.15,
        "subtitle_enabled": r["subtitle_enabled"],
        "subtitle_position": "center",
        "font_size": 60,
        "stroke_width": 2,
    }


def render_carousels():
    from .carousel import render_script
    with db.connect() as con:
        rows = [s for s in db.scripts(con, review_status="approved") if not s["rendered_path"]]
        print(f"[render] {len(rows)} kịch bản đã duyệt chưa dựng (carousel)")
        for s in rows:
            folder = render_script(dict(s))
            if folder:
                con.execute("UPDATE scripts SET rendered_path=? WHERE id=?", (str(folder), s["id"]))
        con.commit()


def render_approved(wait: bool = True):
    if CFG["render"].get("mode", "carousel") == "carousel":
        return render_carousels()
    base = CFG["render"]["mpt_base_url"].rstrip("/")
    with db.connect() as con:
        rows = [s for s in db.scripts(con, review_status="approved") if not s["rendered_path"]]
        print(f"[render] {len(rows)} kịch bản đã duyệt chưa render")
        for s in rows:
            # luôn xuất file kịch bản + thẻ để dùng tay nếu MPT không chạy
            stem = OUT_DIR / f"script_{s['id']:04d}"
            stem.with_suffix(".txt").write_text(s["full_text"], encoding="utf-8")
            stem.with_suffix(".cards.json").write_text(s["cards"], encoding="utf-8")
            try:
                r = requests.post(f"{base}/api/v1/videos", json=_payload(s), timeout=30)
                r.raise_for_status()
                task_id = r.json()["data"]["task_id"]
            except Exception as e:
                print(f"[render] #{s['id']}: MPT không phản hồi ({e}). Đã xuất {stem}.txt để dựng tay.")
                continue
            print(f"[render] #{s['id']} → task {task_id}")
            if not wait:
                continue
            for _ in range(120):  # tối đa ~20 phút
                time.sleep(10)
                st = requests.get(f"{base}/api/v1/tasks/{task_id}", timeout=30).json().get("data", {})
                if st.get("state") == 1 and st.get("videos"):
                    path = st["videos"][0]
                    con.execute("UPDATE scripts SET rendered_path=? WHERE id=?", (path, s["id"]))
                    con.commit()
                    print(f"[render] #{s['id']} xong: {path}")
                    break
                if st.get("state") == -1:
                    print(f"[render] #{s['id']} thất bại: {json.dumps(st)[:200]}")
                    break
