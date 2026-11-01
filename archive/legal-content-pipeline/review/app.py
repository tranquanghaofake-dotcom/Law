"""Giao diện duyệt tối giản — CỔNG DUYỆT duy nhất của pipeline (10 phút/ngày).
Chạy: python run.py review → http://127.0.0.1:8765  (mật khẩu: REVIEW_PASSWORD trong .env)"""
import json
import secrets
from pathlib import Path

from fastapi import Depends, FastAPI, Form, HTTPException, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.templating import Jinja2Templates

from pipeline import db
from pipeline.settings import env

app = FastAPI(title="Review")
templates = Jinja2Templates(directory=str(Path(__file__).parent / "templates"))
security = HTTPBasic()


def auth(c: HTTPBasicCredentials = Depends(security)):
    if not secrets.compare_digest(c.password, env("REVIEW_PASSWORD", "review")):
        raise HTTPException(401, headers={"WWW-Authenticate": "Basic"})
    return c.username


@app.get("/", response_class=HTMLResponse)
def index(request: Request, status: str = "pending", _=Depends(auth)):
    with db.connect() as con:
        rows = [dict(r) for r in db.scripts(con, review_status=status)]
        counts = {s: con.execute("SELECT COUNT(*) FROM scripts WHERE review_status=?", (s,)).fetchone()[0] for s in ("pending", "approved", "rejected")}
    return templates.TemplateResponse(request, "index.html", {"rows": rows, "status": status, "counts": counts})


@app.get("/s/{sid}", response_class=HTMLResponse)
def detail(request: Request, sid: int, _=Depends(auth)):
    with db.connect() as con:
        s = db.get_script(con, sid)
        if not s:
            raise HTTPException(404)
        s = dict(s)
        s["citations_list"] = json.loads(s["citations"] or "[]")
        s["cards_list"] = json.loads(s["cards"] or "[]")
    return templates.TemplateResponse(request, "detail.html", {"s": s})


@app.post("/s/{sid}")
def decide(sid: int, action: str = Form(...), note: str = Form(""), hook: str = Form(""), basis: str = Form(""),
           conclusion: str = Form(""), cta: str = Form(""), _=Depends(auth)):
    with db.connect() as con:
        s = db.get_script(con, sid)
        if not s:
            raise HTTPException(404)
        # lưu chỉnh sửa của người duyệt (nếu có) rồi ghép lại full_text
        from pipeline.scriptwriter import DISCLAIMER
        hook, basis, conclusion, cta = hook or s["hook"], basis or s["basis"], conclusion or s["conclusion"], cta or s["cta"]
        full = " ".join([hook, f"Có bạn hỏi: \"{s['quote']}\"", basis, conclusion, cta, DISCLAIMER])
        st = {"approve": "approved", "reject": "rejected", "save": "pending"}[action]
        con.execute(
            "UPDATE scripts SET hook=?, basis=?, conclusion=?, cta=?, full_text=?, word_count=?, review_status=?, review_note=? WHERE id=?",
            (hook, basis, conclusion, cta, full, len(full.split()), st, note, sid),
        )
        con.commit()
    return RedirectResponse("/", status_code=303)
