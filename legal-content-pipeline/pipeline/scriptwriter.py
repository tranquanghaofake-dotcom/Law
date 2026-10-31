"""Soạn kịch bản 5 khối theo Brief, bắt buộc căn cứ từ RAG (điều luật thật) + sinh thẻ web."""
import json

from . import db
from .llm import chat_json
from .rag import retriever
from .settings import CFG

DISCLAIMER = "Mình là sinh viên Luật, đây là thông tin chung, không phải tư vấn pháp lý cho trường hợp cụ thể."

SYSTEM = """Bạn viết kịch bản video TikTok 60–75 giây (200–230 từ lời đọc) cho kênh của một sinh viên Luật Kinh tế
giải đáp câu hỏi pháp lý thật từ mạng xã hội. Giọng: thân thiện, chắc chắn, không giáo điều, ngôi "mình/bạn".

QUY TẮC CỨNG:
1. CHỈ dùng điều luật có trong phần "CĂN CỨ ĐƯỢC CUNG CẤP". Không bịa số điều. Nếu căn cứ cung cấp không đủ để
   trả lời chắc chắn, đặt "insufficient": true và giải thích thiếu gì.
2. Mỗi căn cứ ghi: số điều + tên văn bản + năm. Trích tối đa 1 câu nguyên văn/điều.
3. Phần quote: giữ nguyên trích đoạn được cấp, không thêm tên riêng.
4. Kết luận phải có 2–3 bước hành động cụ thể.
5. Không khẳng định "người này có tội". Không nhắc tên thật, tên công ty.

Trả về JSON:
{{
 "insufficient": false,
 "missing": "",
 "title": "tiêu đề ngắn",
 "hook": "1 câu 0-3s",
 "basis": "lời đọc phần căn cứ (12-50s)",
 "conclusion": "lời đọc kết luận + 2-3 bước hành động (50-68s)",
 "cta": "1 câu CTA về web, nhắc chủ đề thẻ",
 "citations": [{{"article":"328","law":"Bộ luật Dân sự","year":"2015","excerpt":"<=1 câu nguyên văn"}}],
 "cards": [
   {{"type":"cloze","front":"Điều ... : ... {{{{c1::...}}}} ...","back":"...","citation":"Điều ... BLDS 2015"}},
   {{"type":"mcq","question":"mini tình huống 1-2 câu","options":["A","B","C","D"],"answer":0,"explain":"...","citation":"..."}}
 ]
}}
Chỉ trả JSON."""


def _demo(user: str) -> dict:
    return {
        "insufficient": False, "missing": "",
        "title": "[DEMO] Kịch bản mẫu",
        "hook": "[DEMO] Câu hook sẽ do LLM viết khi có API key.",
        "basis": "[DEMO] Phần căn cứ sẽ chỉ dùng các điều luật được RAG cung cấp bên dưới.",
        "conclusion": "[DEMO] Kết luận + 3 bước hành động.",
        "cta": "Luyện 10 câu về chủ đề này ở link bio.",
        "citations": [{"article": "—", "law": "—", "year": "—", "excerpt": "demo"}],
        "cards": [{"type": "cloze", "front": "[DEMO] Điều ... {{c1::...}}", "back": "...", "citation": "—"}],
    }


def write_selected(limit: int = 10):
    with db.connect() as con:
        rows = db.items(con, status="selected", limit=limit)
        print(f"[write] {len(rows)} item 'selected'")
        for r in rows:
            query = f"{r['summary'] or ''} {r['text'][:400]}"
            ctx = retriever.search(query, k=6)
            ctx_txt = "\n\n".join(f"[{c['law']} — Điều {c['article']}] {c['text'][:1200]}" for c in ctx) or "(không có căn cứ nào trong kho — hãy đặt insufficient=true)"
            user = (
                f"TRỤ: {r['pillar']} — {CFG['pillars'].get(r['pillar'], {}).get('name', 'wildcard')}\n"
                f"TÓM TẮT: {r['summary']}\nTRÍCH ĐOẠN ĐƯỢC PHÉP DÙNG: \"{r['quote']}\"\n"
                f"BÀI GỐC (chỉ để hiểu ngữ cảnh, không đọc lại):\n{r['text'][:1500]}\n\n"
                f"CĂN CỨ ĐƯỢC CUNG CẤP:\n{ctx_txt}"
            )
            try:
                s = chat_json(SYSTEM, user, _demo)
            except Exception as e:
                print(f"[write] lỗi item {r['id']}: {e}")
                continue
            if s.get("insufficient"):
                print(f"[write] item {r['id']}: thiếu căn cứ — {s.get('missing')}. Thêm văn bản vào data/laws/.")
                con.execute("UPDATE items SET status='rejected', risk_flags=? WHERE id=?",
                            (json.dumps(["thieu_can_cu: " + str(s.get("missing", ""))], ensure_ascii=False), r["id"]))
                continue
            full = " ".join([s["hook"], f"Có bạn hỏi: \"{r['quote']}\"", s["basis"], s["conclusion"], s["cta"], DISCLAIMER])
            # gắn nguồn cho citation từ RAG
            src = {c["law"]: c["source"] for c in ctx}
            for c in s.get("citations", []):
                c.setdefault("source", src.get(c.get("law"), ""))
            rec = {
                "item_id": r["id"], "pillar": r["pillar"], "title": s["title"], "hook": s["hook"], "quote": r["quote"],
                "basis": s["basis"], "conclusion": s["conclusion"], "cta": s["cta"],
                "citations": s.get("citations", []), "cards": s.get("cards", []),
                "full_text": full, "word_count": len(full.split()),
            }
            sid = db.insert_script(con, rec)
            print(f"[write] kịch bản #{sid} ({rec['word_count']} từ) — {rec['title']}")
        con.commit()
