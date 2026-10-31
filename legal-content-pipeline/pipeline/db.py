"""SQLite đơn giản. Hai bảng: items (câu hỏi thu thập) và scripts (kịch bản + thẻ web)."""
import json
import sqlite3
from datetime import datetime, timezone

from .settings import DB_PATH

SCHEMA = """
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fingerprint TEXT UNIQUE,          -- hash để chống trùng
  platform TEXT NOT NULL,           -- threads/reddit/youtube/rss/inbound
  url TEXT,
  author TEXT,
  text TEXT NOT NULL,
  engagement INTEGER DEFAULT 0,
  collected_at TEXT NOT NULL,
  -- kết quả chấm điểm (LLM)
  pillar TEXT,                      -- T1/T2/T3/WC/NONE
  score_viral INTEGER,
  score_audience INTEGER,
  score_confident INTEGER,
  score_total INTEGER,
  risk_flags TEXT,                  -- JSON list: tên thật, vụ đang xử, ngoài phạm vi...
  summary TEXT,                     -- tóm tắt 1 câu
  quote TEXT,                       -- trích đoạn <=40 từ được phép dùng
  status TEXT DEFAULT 'new'         -- new/scored/selected/rejected/scripted
);
CREATE TABLE IF NOT EXISTS scripts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id INTEGER REFERENCES items(id),
  pillar TEXT,
  title TEXT,
  hook TEXT,
  quote TEXT,
  basis TEXT,                       -- căn cứ (lời đọc)
  conclusion TEXT,
  cta TEXT,
  citations TEXT,                   -- JSON list [{article, law, year, excerpt, source}]
  cards TEXT,                       -- JSON list thẻ web (cloze/MCQ)
  full_text TEXT,                   -- toàn bộ lời đọc ghép lại
  word_count INTEGER,
  review_status TEXT DEFAULT 'pending',  -- pending/approved/rejected
  review_note TEXT,
  created_at TEXT,
  rendered_path TEXT,
  published_at TEXT,
  metrics TEXT                      -- JSON: views, completion, saves, comments
);
"""


def connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con


def init():
    with connect() as con:
        con.executescript(SCHEMA)


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def insert_item(con, platform, url, author, text, engagement, fingerprint) -> bool:
    """Trả về True nếu chèn mới, False nếu trùng."""
    try:
        con.execute(
            "INSERT INTO items(fingerprint, platform, url, author, text, engagement, collected_at) VALUES (?,?,?,?,?,?,?)",
            (fingerprint, platform, url, author, text, engagement, now()),
        )
        return True
    except sqlite3.IntegrityError:
        return False


def items(con, status=None, limit=200):
    q = "SELECT * FROM items"
    args = ()
    if status:
        q += " WHERE status=?"
        args = (status,)
    q += " ORDER BY score_total DESC NULLS LAST, engagement DESC, id DESC LIMIT ?"
    return con.execute(q, args + (limit,)).fetchall()


def update_item_score(con, item_id, r: dict):
    con.execute(
        """UPDATE items SET pillar=?, score_viral=?, score_audience=?, score_confident=?, score_total=?,
           risk_flags=?, summary=?, quote=?, status=? WHERE id=?""",
        (
            r["pillar"], r["viral"], r["audience"], r["confident"],
            r["viral"] + r["audience"] + r["confident"],
            json.dumps(r.get("risk_flags", []), ensure_ascii=False),
            r.get("summary", ""), r.get("quote", ""), r["status"], item_id,
        ),
    )


def insert_script(con, s: dict) -> int:
    cur = con.execute(
        """INSERT INTO scripts(item_id, pillar, title, hook, quote, basis, conclusion, cta, citations, cards,
           full_text, word_count, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            s["item_id"], s["pillar"], s["title"], s["hook"], s["quote"], s["basis"], s["conclusion"], s["cta"],
            json.dumps(s["citations"], ensure_ascii=False), json.dumps(s["cards"], ensure_ascii=False),
            s["full_text"], s["word_count"], now(),
        ),
    )
    con.execute("UPDATE items SET status='scripted' WHERE id=?", (s["item_id"],))
    return cur.lastrowid


def scripts(con, review_status=None):
    q = "SELECT s.*, i.url AS item_url, i.platform AS item_platform FROM scripts s LEFT JOIN items i ON i.id=s.item_id"
    args = ()
    if review_status:
        q += " WHERE s.review_status=?"
        args = (review_status,)
    q += " ORDER BY s.id DESC"
    return con.execute(q, args).fetchall()


def get_script(con, sid):
    return con.execute(
        "SELECT s.*, i.url AS item_url, i.platform AS item_platform, i.author AS item_author FROM scripts s LEFT JOIN items i ON i.id=s.item_id WHERE s.id=?",
        (sid,),
    ).fetchone()
