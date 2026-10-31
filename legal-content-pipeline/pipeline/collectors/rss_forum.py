"""RSS công khai (báo pháp luật, diễn đàn có RSS). Không cần key. Chỉ lấy tiêu đề + mô tả để làm nguyên liệu,
không sao chép bài; kiểm tra robots.txt và điều khoản của từng trang trước khi thêm feed."""
import re

import feedparser

from ..settings import CFG


def _strip_html(s: str) -> str:
    return re.sub(r"<[^>]+>", " ", s or "").strip()


def collect():
    out = []
    for url in CFG["sources"]["rss"]["feeds"]:
        feed = feedparser.parse(url)
        if feed.bozo and not feed.entries:
            print(f"[rss] lỗi feed {url}: {getattr(feed, 'bozo_exception', '')}")
            continue
        for e in feed.entries[:50]:
            text = f"{e.get('title','')}\n{_strip_html(e.get('summary',''))}".strip()
            if len(text) < 40:
                continue
            out.append({
                "platform": "rss",
                "url": e.get("link", ""),
                "author": feed.feed.get("title", url),
                "text": text[:1500],
                "engagement": 0,
            })
    return out
