"""YouTube Data API v3: lấy comment dưới video mới nhất của các kênh luật (mỏ câu hỏi thật, ít người khai thác).
Tạo API key tại Google Cloud Console → bật 'YouTube Data API v3'. Hạn mức mặc định 10.000 unit/ngày (đủ)."""
import requests

from ..settings import CFG, env

API = "https://www.googleapis.com/youtube/v3"


def _get(path, **params):
    params["key"] = env("YOUTUBE_API_KEY")
    r = requests.get(f"{API}/{path}", params=params, timeout=30)
    r.raise_for_status()
    return r.json()


def collect():
    if not env("YOUTUBE_API_KEY"):
        print("[youtube] bỏ qua: chưa có YOUTUBE_API_KEY")
        return []
    cfg = CFG["sources"]["youtube"]
    out = []
    for ch in cfg.get("channel_ids", []):
        # uploads playlist = UC... -> UU...
        playlist = "UU" + ch[2:]
        vids = _get("playlistItems", part="contentDetails", playlistId=playlist, maxResults=cfg["max_videos_per_channel"])
        for v in vids.get("items", []):
            vid = v["contentDetails"]["videoId"]
            try:
                cm = _get("commentThreads", part="snippet", videoId=vid, maxResults=min(100, cfg["max_comments_per_video"]), order="relevance", textFormat="plainText")
            except requests.HTTPError:
                continue  # video tắt comment
            for c in cm.get("items", []):
                s = c["snippet"]["topLevelComment"]["snippet"]
                text = s["textDisplay"].strip()
                if len(text) < 40 or "?" not in text:
                    continue
                out.append({
                    "platform": "youtube",
                    "url": f"https://www.youtube.com/watch?v={vid}&lc={c['id']}",
                    "author": s.get("authorDisplayName", ""),
                    "text": text[:2000],
                    "engagement": int(s.get("likeCount", 0)) + 3 * int(c["snippet"].get("totalReplyCount", 0)),
                })
    return out
