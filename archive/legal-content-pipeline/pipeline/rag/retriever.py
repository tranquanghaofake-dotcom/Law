"""BM25 trên chunk điều luật. Đủ tốt cho tiếng Việt ở quy mô vài nghìn điều; nâng cấp sau: bge-m3 + pgvector."""
import re

from rank_bm25 import BM25Okapi

from . import ingest

_INDEX = None
_CHUNKS = None


def _tok(s: str):
    return re.findall(r"\w+", s.lower())


def _ensure():
    global _INDEX, _CHUNKS
    if _INDEX is None:
        _CHUNKS = ingest.load()
        _INDEX = BM25Okapi([_tok(c["law"] + " " + c["title"] + " " + c["text"]) for c in _CHUNKS]) if _CHUNKS else None


def search(query: str, k: int = 6):
    _ensure()
    if not _CHUNKS:
        return []
    scores = _INDEX.get_scores(_tok(query))
    top = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:k]
    return [dict(_CHUNKS[i], score=float(scores[i])) for i in top if scores[i] > 0]
