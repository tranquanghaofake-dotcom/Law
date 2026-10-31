"""Client LLM OpenAI-compatible, trả JSON. Có chế độ DEMO (không cần key) để chạy thử toàn tuyến."""
import json
import re

from .settings import CFG, DEMO, env


def _extract_json(text: str):
    text = text.strip()
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        raise ValueError("LLM không trả JSON: " + text[:200])
    return json.loads(m.group(0))


def chat_json(system: str, user: str, demo_fallback) -> dict:
    """Gọi LLM và ép trả JSON. Khi DEMO=True, dùng demo_fallback(user) thay cho LLM."""
    if DEMO:
        return demo_fallback(user)
    from openai import OpenAI

    client = OpenAI(api_key=env("LLM_API_KEY"), base_url=env("LLM_BASE_URL") or None)
    resp = client.chat.completions.create(
        model=CFG["llm"]["model"],
        temperature=CFG["llm"].get("temperature", 0.3),
        messages=[{"role": "system", "content": system}, {"role": "user", "content": user}],
        response_format={"type": "json_object"},
    )
    return _extract_json(resp.choices[0].message.content)
