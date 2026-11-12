#!/usr/bin/env python3
"""BƯỚC 0 — GÓI CHUẨN BỊ trước khi viết deck.json (bắt buộc với mọi deck).

Chốt MỌI THỨ cần cho deck rồi đưa người dùng duyệt, để không phải sửa giữa chừng:
  loại bài + khung slide · nguồn (văn bản luật đã kiểm hiệu lực, số liệu có nguồn) · điều chưa chắc ·
  ảnh đã chấm điểm/tải về · hình vẽ engine có sẵn sẽ dùng · hình engine CHƯA có · kế hoạch type từng slide.

Dùng:
  python3 scripts/prep.py init    <thư_mục_deck> --kind lecture|case|report [--minutes 25] [--topic "..."]
  python3 scripts/prep.py check   <thư_mục_deck>     # báo mục còn trống; exit 1 nếu chưa đủ
  python3 scripts/prep.py summary <thư_mục_deck>     # in bản tóm tắt Markdown (+ ghi prep.md) để GỬI NGƯỜI DÙNG duyệt
  python3 scripts/prep.py approve <thư_mục_deck> --by "Tên người duyệt"
      → CHỈ chạy sau khi người dùng nói rõ là duyệt. Claude không tự duyệt thay người dùng.

build.js đọc prep.json cạnh deck.json (hoặc meta.prep): thiếu / chưa duyệt / kế hoạch lệch deck > 25% → cảnh báo, --strict dừng.
"""
import sys, os, json, datetime

FRAMES = {
    "lecture": ["cover", "statement — ý cốt lõi của chương", "agenda — câu hỏi/mục tiêu chương (≤ 4)", "section mỗi phần",
                "nội dung: khái niệm → ví dụ/tình huống thật (mỗi slide một ý)", "quiz hỏi → quiz đáp án (why có căn cứ)",
                "closing — trả lời từng câu của agenda + chuẩn bị bài sau", "end"],
    "case": ["cover", "statement — nghịch lý của vụ việc", "agenda — 2–4 câu hỏi pháp lý", "section mỗi phần",
             "flow/ledger/scene — các bên, diễn biến, được–mất", "evidence/quote — trích bản án, điều luật",
             "cards — bài học cho từng bên", "closing — answers + verdict + rec", "end"],
    "report": ["cover", "statement — phát hiện chính", "agenda — các phần", "section mỗi phần",
               "chart/table/map — số liệu có nguồn (insight là câu kết luận)", "closing — lessons + rec", "end"],
}
STATUS = ["hiện hành", "hết hiệu lực", "dự thảo", "học thuật", "chưa kiểm"]


def path_of(d): return os.path.join(d, "prep.json")


def load(d):
    p = path_of(d)
    if not os.path.exists(p): sys.exit(f"✗ Chưa có {p} — chạy: python3 scripts/prep.py init {d} --kind lecture|case|report")
    return json.load(open(p, encoding="utf8"))


def save(d, pr): json.dump(pr, open(path_of(d), "w", encoding="utf8"), ensure_ascii=False, indent=1)


def init(d, kind, minutes, topic):
    if kind not in FRAMES: sys.exit(f"✗ --kind phải là một trong: {', '.join(FRAMES)}")
    os.makedirs(d, exist_ok=True)
    if os.path.exists(path_of(d)): sys.exit(f"✗ {path_of(d)} đã có — sửa trực tiếp, hoặc xoá đi nếu muốn làm lại từ đầu")
    photos = []
    ij = os.path.join(d, "images", "images.json")
    if os.path.exists(ij):
        for f, m in json.load(open(ij, encoding="utf8")).items():
            photos.append({"file": "images/" + f, "brief": m.get("brief", ""), "score": None, "license": m.get("license", ""), "use": ""})
    pr = {
        "kind": kind, "topic": topic or "", "audience": "", "minutes": minutes,
        "frame": FRAMES[kind],
        "sources": [{"title": "", "legal": False, "status": "", "checked": "", "note": ""}],
        "unsure": [],
        # phạm vi bài: "in" = đúng đối tượng phân tích (vd. "BHXH bắt buộc"), "out" = cụm từ KHÔNG được xuất hiện (vd. "BHYT") → chép sang deck.json meta.scopeOut
        "scope": {"in": "", "out": []},
        # bước 0 — thế giới hình ảnh (references/the-gioi-hinh-anh.md): 10 vật thấy tận mắt → 1 vật chủ đạo + 2 vật phụ → world (meta.kit)
        "world": {"objects": [], "main": "", "minor": [], "kit": ""},
        # số liệu (bài report): mỗi con số dùng trên slide một dòng — nguồn + ngày đối chiếu; số mâu thuẫn giữa các bảng ghi ở note
        "data": [{"figure": "", "value": "", "source": "", "checked": "", "note": ""}],
        # nhận xét của giảng viên / người duyệt cho bản trước: mỗi ý ghi cách đã xử lý (fix) — build không biết, người làm phải tự đối chiếu
        "feedback": [],
        "assets": {"photos": photos, "art": [], "missing": []},
        "plan": [{"slide": 1, "question": "người nghe đang thắc mắc gì", "title": "câu kết luận", "type": "cover", "covers": []}],
        "approved": False, "approvedBy": "", "approvedAt": "",
    }
    save(d, pr)
    print(f"✓ {path_of(d)} — điền: topic, audience, sources (văn bản luật: legal true + status), unsure, assets, plan (mỗi slide một dòng).")
    print("  Khung gợi ý cho loại bài này:\n   - " + "\n   - ".join(FRAMES[kind]))


def problems(pr):
    out = []
    if pr.get("kind") not in FRAMES: out.append(f"kind: chọn {' | '.join(FRAMES)}")
    for k in ["topic", "audience"]:
        if not str(pr.get(k) or "").strip(): out.append(f"{k}: còn trống")
    if not pr.get("minutes"): out.append("minutes: thời lượng thuyết trình (phút) — chưa biết thì hỏi người dùng")
    src = [s for s in pr.get("sources") or [] if str(s.get("title") or "").strip()]
    if not src: out.append("sources: chưa có nguồn nào (tài liệu gốc, giáo trình, văn bản luật, nguồn số liệu)")
    for i, s in enumerate(src):
        if s.get("legal") and not any(str(s.get("status") or "").strip().startswith(x) for x in STATUS): out.append(f"sources[{i}] \"{s['title'][:40]}\": văn bản luật cần status ({' / '.join(STATUS)})")
    wd = pr.get("world") or {}
    if pr.get("kind") in ("report", "lecture") and (len(wd.get("objects") or []) < 8 or not str(wd.get("main") or "").strip() or len(wd.get("minor") or []) < 2 or not str(wd.get("kit") or "").strip()):
        out.append("world: bước 0 thế giới hình ảnh chưa đủ — ≥ 8 vật thấy tận mắt (objects), 1 vật chủ đạo (main), 2 vật phụ (minor), world chọn (kit) — xem references/the-gioi-hinh-anh.md")
    sc = pr.get("scope") or {}
    if pr.get("kind") == "report" and not str(sc.get("in") or "").strip(): out.append("scope.in: bài báo cáo cần ghi rõ đối tượng phân tích (vd. \"chỉ BHXH bắt buộc\") — nội dung ngoài phạm vi ghi ở scope.out")
    if pr.get("kind") == "report":
        dt = [x for x in pr.get("data") or [] if str(x.get("figure") or "").strip()]
        if not dt: out.append("data: bài báo cáo chưa liệt kê số liệu nào (mỗi con số: figure, value, source, checked)")
        for i, x in enumerate(dt):
            if not str(x.get("source") or "").strip(): out.append(f"data[{i}] \"{x['figure'][:40]}\": thiếu nguồn (báo cáo BHXH Việt Nam, Tổng cục Thống kê, báo chí…)")
    for i, f in enumerate(pr.get("feedback") or []):
        if not str((f or {}).get("fix") or "").strip(): out.append(f"feedback[{i}] \"{str((f or {}).get('note') or '')[:40]}\": chưa ghi cách xử lý (fix)")
    a = pr.get("assets") or {}
    for i, p in enumerate(a.get("photos") or []):
        if p.get("score") is None: out.append(f"assets.photos[{i}] {p.get('file')}: chưa chấm điểm bằng mắt (0–3; chỉ dùng ảnh ≥ 2)")
        elif p.get("score", 0) < 2 and p.get("use"): out.append(f"assets.photos[{i}] {p.get('file')}: điểm {p['score']} < 2 nhưng vẫn ghi dùng ở \"{p['use']}\"")
    plan = [q for q in pr.get("plan") or [] if q.get("type")]
    if len(plan) < 3: out.append("plan: chưa có kế hoạch slide (mỗi slide: question, title = câu kết luận, type)")
    for q in plan:
        t = str(q.get("title") or "")
        if t.strip().endswith("?") and q.get("type") not in ("agenda", "quiz", "quizgo", "bigq", "picks", "section", "cover", "end"): out.append(f"plan slide {q.get('slide')}: tiêu đề là câu hỏi — viết thành câu kết luận")
    if pr.get("kind") == "lecture" and not any(q.get("type") in ("quiz", "quizgo") for q in plan): out.append("plan: bài giảng cần ít nhất 1 cặp quiz (hỏi → đáp án)")
    return out


def check(d):
    pr = load(d); pb = problems(pr)
    if pb: print("✗ Gói chuẩn bị chưa đủ:\n  - " + "\n  - ".join(pb)); return 1
    print(f"✓ Gói chuẩn bị đủ mục ({len(pr.get('plan') or [])} slide dự kiến) — {'ĐÃ' if pr.get('approved') else 'CHƯA'} được duyệt")
    return 0


def summary(d):
    pr = load(d); L = []
    L.append(f"# Gói chuẩn bị — {pr.get('topic') or '(chưa có chủ đề)'}")
    L.append(f"Loại bài: **{pr.get('kind')}** · Người nghe: {pr.get('audience') or '?'} · Thời lượng: {pr.get('minutes') or '?'} phút · Dự kiến {len(pr.get('plan') or [])} slide\n")
    L.append("## Nguồn")
    for s in pr.get("sources") or []:
        if s.get("title"): L.append(f"- {s['title']}" + (f" — **{s.get('status') or 'chưa ghi tình trạng'}**" if s.get("legal") else "") + (f" ({s['note']})" if s.get("note") else ""))
    wd = pr.get("world") or {}
    if wd.get("main"): L.append(f"\n## Thế giới hình ảnh\n- Vật chủ đạo: {wd['main']} · vật phụ: {', '.join(wd.get('minor') or [])} · world: `{wd.get('kit') or '?'}`\n- Thấy tận mắt: {', '.join(wd.get('objects') or [])}")
    sc = pr.get("scope") or {}
    if sc.get("in") or sc.get("out"): L.append(f"\n## Phạm vi\n- Phân tích: {sc.get('in') or '?'}" + (f"\n- Không đưa vào: {', '.join(sc.get('out') or [])}" if sc.get("out") else ""))
    dt = [x for x in pr.get("data") or [] if str(x.get("figure") or "").strip()]
    if dt:
        L.append("\n## Số liệu\n| Số liệu | Giá trị | Nguồn | Đối chiếu |\n|---|---|---|---|")
        L += [f"| {x['figure']} | {x.get('value', '')} | {x.get('source', '')} | {x.get('checked') or '**chưa**'} |" for x in dt]
    if pr.get("feedback"):
        L.append("\n## Nhận xét bản trước → cách xử lý"); L += [f"- {f.get('note', '')} → {f.get('fix') or '**chưa xử lý**'}" for f in pr["feedback"]]
    if pr.get("unsure"):
        L.append("\n## Điều chưa chắc (sẽ ghi rõ trên slide/ghi chú)"); L += [f"- {u}" for u in pr["unsure"]]
    a = pr.get("assets") or {}
    L.append("\n## Ảnh và hình vẽ")
    for p in a.get("photos") or []: L.append(f"- {p.get('file')} · điểm {p.get('score')} · {p.get('license', '')} · dùng: {p.get('use') or '—'}")
    if a.get("art"): L.append("- Hình vẽ engine: " + ", ".join(a["art"]))
    if a.get("missing"): L.append("- **Engine chưa có (sẽ thay bằng cách khác):** " + "; ".join(a["missing"]))
    L.append("\n## Kế hoạch slide\n| # | Người nghe thắc mắc | Tiêu đề (kết luận) | Type |\n|---|---|---|---|")
    for q in pr.get("plan") or []: L.append(f"| {q.get('slide', '')} | {q.get('question', '')} | {q.get('title', '')} | `{q.get('type', '')}` |")
    pb = problems(pr)
    if pb: L.append("\n## Còn thiếu\n" + "\n".join(f"- {x}" for x in pb))
    L.append(f"\nTrạng thái: {'đã duyệt bởi ' + pr.get('approvedBy', '') + ' (' + pr.get('approvedAt', '') + ')' if pr.get('approved') else 'CHỜ NGƯỜI DÙNG DUYỆT'}")
    md = "\n".join(L); open(os.path.join(d, "prep.md"), "w", encoding="utf8").write(md + "\n"); print(md)


def approve(d, by):
    pr = load(d); pb = problems(pr)
    if pb: print("✗ Chưa duyệt được — gói chuẩn bị còn thiếu:\n  - " + "\n  - ".join(pb)); return 1
    if not by: sys.exit('✗ Cần --by "Tên người duyệt" (người dùng đã đồng ý)')
    pr.update(approved=True, approvedBy=by, approvedAt=datetime.date.today().isoformat()); save(d, pr)
    print(f"✓ Đã ghi duyệt: {by} · {pr['approvedAt']}"); return 0


def arg(name, default=None):
    a = sys.argv
    return a[a.index(name) + 1] if name in a and a.index(name) + 1 < len(a) else default


if __name__ == "__main__":
    if len(sys.argv) < 3 or sys.argv[1] not in ("init", "check", "summary", "approve"): sys.exit(__doc__)
    cmd, d = sys.argv[1], sys.argv[2]
    if cmd == "init": init(d, arg("--kind", ""), int(arg("--minutes", "0") or 0) or None, arg("--topic", ""))
    elif cmd == "check": sys.exit(check(d))
    elif cmd == "summary": summary(d)
    else: sys.exit(approve(d, arg("--by", "")))
