#!/usr/bin/env python3
"""CLI của pipeline.

  python run.py init                 # tạo DB + index luật
  python run.py collect [--demo]     # thu thập từ các nguồn bật trong config.yaml
  python run.py score                # chấm điểm item mới (LLM)
  python run.py write                # soạn kịch bản cho item 'selected' (LLM + RAG)
  python run.py review               # mở giao diện duyệt http://127.0.0.1:8765
  python run.py render               # render kịch bản đã duyệt (MoneyPrinterTurbo)
  python run.py publish              # xuất hàng đợi đăng / gọi TikTok API
  python run.py mark-published <id>
  python run.py daily                # collect → score → write (chạy bằng cron)
  python run.py status
"""
import sys

from pipeline import db
from pipeline.settings import CFG, DEMO


def cmd_init():
    db.init()
    from pipeline.rag import ingest
    ingest.build()
    print("[init] xong. DEMO =", DEMO)


def cmd_collect(demo=False):
    from pipeline.collectors import COLLECTORS
    from pipeline.dedupe import fingerprint, is_near_duplicate

    db.init()
    added = 0
    with db.connect() as con:
        recent = [r["text"] for r in con.execute("SELECT text FROM items ORDER BY id DESC LIMIT 500")]
        batches = []
        if demo:
            from pipeline.collectors import inbound
            batches.append(("demo", inbound.collect()))
        else:
            for name, fn in COLLECTORS.items():
                if not CFG["sources"].get(name, {}).get("enabled"):
                    continue
                try:
                    batches.append((name, fn()))
                except Exception as e:
                    print(f"[collect] {name} lỗi: {e}")
        for name, rows in batches:
            n = 0
            for it in rows:
                if is_near_duplicate(it["text"], recent):
                    continue
                item_id = db.insert_item(con, it["platform"], it["url"], it["author"], it["text"], it["engagement"], fingerprint(it["text"]))
                if item_id:
                    if it.get("manual"):
                        from pipeline.scorer import decide
                        res = dict(it["manual"])
                        res["status"] = decide(res)
                        db.update_item_score(con, item_id, res)
                    recent.append(it["text"])
                    n += 1
            print(f"[collect] {name}: +{n} (đã lọc trùng từ {len(rows)})")
            added += n
        con.commit()
    print(f"[collect] tổng thêm {added} item")


def cmd_status():
    with db.connect() as con:
        for st in ("new", "scored", "selected", "rejected", "scripted"):
            n = con.execute("SELECT COUNT(*) FROM items WHERE status=?", (st,)).fetchone()[0]
            print(f"  items/{st:9}: {n}")
        for st in ("pending", "approved", "rejected"):
            n = con.execute("SELECT COUNT(*) FROM scripts WHERE review_status=?", (st,)).fetchone()[0]
            print(f"  scripts/{st:8}: {n}")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return
    cmd = sys.argv[1]
    if cmd == "init":
        cmd_init()
    elif cmd == "collect":
        cmd_collect(demo="--demo" in sys.argv)
    elif cmd == "score":
        from pipeline.scorer import score_pending
        score_pending()
    elif cmd == "write":
        from pipeline.scriptwriter import write_selected
        write_selected()
    elif cmd == "review":
        import uvicorn
        uvicorn.run("review.app:app", host="127.0.0.1", port=8765, reload=False)
    elif cmd == "render":
        from pipeline.render import render_approved
        render_approved(wait="--nowait" not in sys.argv)
    elif cmd == "publish":
        from pipeline.publish import publish_queue
        publish_queue()
    elif cmd == "mark-published":
        from pipeline.publish import mark_published
        mark_published(int(sys.argv[2]))
    elif cmd == "daily":
        from pipeline.scorer import score_pending
        from pipeline.scriptwriter import write_selected
        cmd_collect()
        score_pending()
        write_selected()
        cmd_status()
    elif cmd == "status":
        cmd_status()
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
