"""Chấm điểm từng item bằng LLM theo đúng 3 cột của Brief + cờ rủi ro. Chế độ DEMO dùng từ khóa."""
import json

from . import db
from .llm import chat_json
from .settings import CFG

SYSTEM = """Bạn là biên tập viên nội dung cho kênh TikTok giải đáp câu hỏi pháp lý Việt Nam.
Khán giả: {audience}.
Trụ nội dung:
{pillars}

Nhiệm vụ: với mỗi bài đăng, trả về JSON:
{{
 "is_question": true/false,          // có phải câu hỏi/tình huống cần giải đáp pháp lý không
 "pillar": "T1"|"T2"|"T3"|"WC"|"NONE", // WC = wildcard (hay nhưng ngoài trụ)
 "viral": 0|1,                        // có hook tự nhiên, nhiều người gặp, gây tò mò
 "audience": 0|1,                     // đúng khán giả 18-30
 "confident": 0|1,                    // có thể trả lời chắc chắn bằng 1-2 điều luật phổ biến (BLDS, BLLĐ, BLHS, Luật Doanh nghiệp...)
 "risk_flags": [],                    // "ten_that", "vu_dang_xet_xu", "ngoai_pham_vi", "nhay_cam", "qua_phuc_tap"
 "summary": "tóm tắt 1 câu bằng tiếng Việt",
 "quote": "trích nguyên văn <= 40 từ phần cốt lõi nhất của câu hỏi, không chứa tên riêng"
}}
Chỉ trả JSON."""


def _demo(user: str) -> dict:
    t = user.lower()
    pillar, conf = "NONE", 0
    kw = {
        "T1": ["cọc", "vay", "chuyển khoản", "tài khoản", "mua hàng", "thuê trọ", "lừa", "nợ"],
        "T2": ["lương", "thử việc", "nghỉ việc", "công ty", "hợp đồng lao động", "bằng", "bhxh", "sa thải", "cộng tác viên"],
        "T3": ["đi tù", "hình sự", "tố giác", "công an", "tội"],
    }
    for p, ws in kw.items():
        if any(w in t for w in ws):
            pillar, conf = p, 1
            break
    is_q = "?" in t or "có được" in t or "có bị" in t
    quote = " ".join(user.split()[:40])
    return {
        "is_question": is_q, "pillar": pillar, "viral": 1 if is_q else 0, "audience": 1 if pillar != "NONE" else 0,
        "confident": conf, "risk_flags": [], "summary": quote[:120], "quote": quote,
    }


def _system():
    pillars = "\n".join(f"- {k}: {v['name']} — {v['desc']}" for k, v in CFG["pillars"].items())
    return SYSTEM.format(audience=CFG["audience"], pillars=pillars)


def score_pending(limit: int = 50):
    sel = CFG["selection"]
    with db.connect() as con:
        rows = db.items(con, status="new", limit=limit)
        print(f"[score] {len(rows)} item cần chấm")
        for r in rows:
            user = f"Nền tảng: {r['platform']}\nEngagement: {r['engagement']}\nBài đăng:\n{r['text']}"
            try:
                res = chat_json(_system(), user, _demo)
            except Exception as e:
                print(f"[score] lỗi item {r['id']}: {e}")
                continue
            for k in ("viral", "audience", "confident"):
                res[k] = int(bool(res.get(k, 0)))
            total = res["viral"] + res["audience"] + res["confident"]
            ok = res.get("is_question", True) and res.get("pillar") != "NONE" and total >= sel["min_total"]
            if sel["require_confident"] and not res["confident"]:
                ok = False
            if res.get("risk_flags"):
                ok = ok and not ({"ten_that", "vu_dang_xet_xu", "nhay_cam"} & set(res["risk_flags"]))
            res["status"] = "selected" if ok else "rejected"
            res["pillar"] = res.get("pillar", "NONE")
            db.update_item_score(con, r["id"], res)
        con.commit()
        n_sel = con.execute("SELECT COUNT(*) FROM items WHERE status='selected'").fetchone()[0]
        print(f"[score] đang có {n_sel} item 'selected' chờ viết kịch bản")
