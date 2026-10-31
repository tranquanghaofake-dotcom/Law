"""Chống trùng: hash chuẩn hóa + so khớp mờ với các item gần đây."""
import hashlib
import re

from rapidfuzz import fuzz


def normalize(text: str) -> str:
    t = text.lower()
    t = re.sub(r"https?://\S+", "", t)
    t = re.sub(r"[^\w\sàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def fingerprint(text: str) -> str:
    return hashlib.sha1(normalize(text)[:300].encode("utf-8")).hexdigest()


def is_near_duplicate(text: str, recent_texts, threshold: int = 88) -> bool:
    n = normalize(text)
    return any(fuzz.token_set_ratio(n, normalize(r)) >= threshold for r in recent_texts)
