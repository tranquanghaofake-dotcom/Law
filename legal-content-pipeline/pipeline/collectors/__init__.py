"""Mỗi collector trả về list dict: {platform, url, author, text, engagement}.
Chỉ dùng API chính thức hoặc RSS/HTML công khai được phép. Không dùng cookie tài khoản cá nhân."""
from . import inbound, reddit_api, rss_forum, threads_api, youtube_api

COLLECTORS = {
    "threads": threads_api.collect,
    "reddit": reddit_api.collect,
    "youtube": youtube_api.collect,
    "rss": rss_forum.collect,
    "inbound": inbound.collect,
}
