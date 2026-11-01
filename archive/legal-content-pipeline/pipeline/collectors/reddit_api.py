"""Reddit API chính thức qua PRAW (OAuth). Tạo app 'script' tại https://www.reddit.com/prefs/apps
Lưu ý ToS: free tier dành cho mục đích phi thương mại — đọc kỹ trước khi dựa vào nguồn này."""
from ..settings import CFG, env


def collect():
    cid, sec = env("REDDIT_CLIENT_ID"), env("REDDIT_CLIENT_SECRET")
    if not (cid and sec):
        print("[reddit] bỏ qua: chưa có REDDIT_CLIENT_ID/SECRET")
        return []
    import praw

    reddit = praw.Reddit(client_id=cid, client_secret=sec, user_agent=env("REDDIT_USER_AGENT", "legal-content-pipeline/0.1"))
    cfg = CFG["sources"]["reddit"]
    kws = [k.lower() for k in cfg["keywords"]]
    out = []
    for sub in cfg["subreddits"]:
        for post in reddit.subreddit(sub).new(limit=cfg.get("limit", 50)):
            text = f"{post.title}\n{post.selftext or ''}".strip()
            if not any(k in text.lower() for k in kws):
                continue
            out.append({
                "platform": "reddit",
                "url": "https://www.reddit.com" + post.permalink,
                "author": str(post.author) if post.author else "",
                "text": text[:2000],
                "engagement": int(post.score) + 3 * int(post.num_comments),
            })
    return out
