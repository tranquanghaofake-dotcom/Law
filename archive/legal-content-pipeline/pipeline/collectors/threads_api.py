"""Threads API chính thức (Meta). Cần: THREADS_ACCESS_TOKEN, quyền threads_keyword_search (qua App Review).
Tài liệu: https://developers.facebook.com/docs/threads/keyword-search
"""
import requests

from ..settings import CFG, env

BASE = "https://graph.threads.net/v1.0"


def collect(limit_per_keyword: int = 25):
    token = env("THREADS_ACCESS_TOKEN")
    if not token:
        print("[threads] bỏ qua: chưa có THREADS_ACCESS_TOKEN")
        return []
    out = []
    for kw in CFG["sources"]["threads"]["keywords"]:
        r = requests.get(
            f"{BASE}/keyword_search",
            params={
                "q": kw,
                "search_type": "RECENT",
                "fields": "id,text,permalink,username,timestamp,like_count,reply_count",  # like/reply có thể không trả tùy quyền
                "limit": limit_per_keyword,
                "access_token": token,
            },
            timeout=30,
        )
        if r.status_code != 200:
            print(f"[threads] {kw}: HTTP {r.status_code} {r.text[:150]}")
            continue
        for p in r.json().get("data", []):
            text = (p.get("text") or "").strip()
            if len(text) < 40 or "?" not in text:
                continue  # chỉ lấy bài có câu hỏi
            out.append({
                "platform": "threads",
                "url": p.get("permalink", ""),
                "author": p.get("username", ""),
                "text": text,
                "engagement": int(p.get("like_count", 0) or 0) + 3 * int(p.get("reply_count", 0) or 0),
            })
    return out
