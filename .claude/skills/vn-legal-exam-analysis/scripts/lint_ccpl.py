#!/usr/bin/env python3
"""Lint quy cach can cu phap ly (CCPL) cho skill vn-legal-exam-analysis.

Dung:
  python3 -I scripts/lint_ccpl.py <file|thu muc>...
  python3 -I scripts/lint_ccpl.py --stdin < cau_tra_loi.txt

Dau ra: file:dong: [ma/muc] mo ta — doan trich
Exit 1 neu co loi muc error; 0 neu chi co warning hoac khong co gi.
Bo qua: code block ```, `code` inline, dong co 'lint-ignore' (vd <!-- lint-ignore -->),
dong co dau hieu minh hoa loi ('sai chuẩn', 'ví dụ sai', '(sai)'), va doan trich
trong ngoac kep khi dong co cue cam/neu vi du sai ('không được viết', 'kiểu'...).
Chi dung thu vien chuan, khong goi mang.
"""
import argparse
import json
import os
import re
import sys
from collections import namedtuple

Finding = namedtuple("Finding", "line code severity message excerpt")

HERE = os.path.dirname(os.path.abspath(__file__))
SUPERSEDED_PATH = os.path.join(HERE, "superseded.json")

IGNORE_LINE = re.compile(r"lint-ignore|sai chuẩn|ví dụ sai|\(sai\)", re.I)
MENTION_CUE = re.compile(r"không được viết|không viết|đừng viết|chớ viết|kiểu|bị cấm|\bcấm\b|cần tránh|tránh dùng", re.I)
SUPERSEDED_CTX = re.compile(
    r"hết hiệu lực|thay thế|bị thay|đã thay|thay bằng|thay cho|thay\s+(?:Luật|Bộ luật|Nghị định|Pháp lệnh|Thông tư)\b|trước đây|bãi bỏ|không còn hiệu lực|bản cũ|từng là|cũ hơn",
    re.I)
SENT_SPLIT = re.compile(r"(?<=[.!?;])\s+")


def load_superseded(path=SUPERSEDED_PATH):
    with open(path, encoding="utf-8") as fh:
        data = json.load(fh)
    items = []
    for it in data.get("items", []):
        items.append((it["id"], re.compile(it["pattern"], re.I), it.get("ten", it["id"]),
                      it.get("thay_boi", "")))
    return items


_SUPERSEDED = None


def superseded():
    global _SUPERSEDED
    if _SUPERSEDED is None:
        try:
            _SUPERSEDED = load_superseded()
        except (OSError, ValueError, KeyError):
            _SUPERSEDED = []
    return _SUPERSEDED


def mask(line):
    """Che code inline va comment HTML bang khoang trang (giu nguyen do dai)."""
    def blank(m):
        return " " * len(m.group(0))
    line = re.sub(r"`[^`]*`", blank, line)
    line = re.sub(r"<!--.*?-->", blank, line)
    return line


def in_quotes(line, idx):
    pre = line[:idx]
    return pre.count('"') % 2 == 1 or pre.count("“") > pre.count("”")


def sentence_bounds(line, idx):
    start = 0
    end = len(line)
    for m in SENT_SPLIT.finditer(line):
        if m.end() <= idx:
            start = m.end()
        elif m.start() >= idx:
            end = m.start() + 1
            break
    return start, end


def at_sentence_start(line, idx, line_start_ok):
    pre = line[:idx].rstrip(" *_\"“‘'([")
    if not pre.strip():
        return line_start_ok
    if re.fullmatch(r"\s*(?:[-*+>]|\d+[.)]|#+)", pre):
        return True
    return pre[-1] in ".!?|"


RE_01 = re.compile(r"\b(?:Khoản\s+(?:\d+|[a-zđ]\b)|Điểm\s+(?:\d+|[a-zđ]\b))")
# "các điều 25, 26 và 27" viết thường là cách viết của chính văn bản luật (số nhiều) -> không bắt
RE_02 = re.compile(r"(?<!các )(?<!Các )(?<!những )(?<!Những )\bđiều\s+\d")
RE_03 = [re.compile(r"\bĐiều\s+\d+[a-z]?,?\s+(?:khoản\s+\d|điểm\s+[a-zđ]\b)"),
         re.compile(r"\bkhoản\s+\d+,?\s+điểm\s+[a-zđ]\b")]
# phần còn lại sau "Điều N, khoản M": cho phép liệt kê "1, 2", "1–5", "khoản 1, khoản 2", "4, 5 và 6" trước Điều kế tiếp
_SO = r"[\da-zđ]+(?:\s*[–-]\s*\d+)?"
RE_03_NEXT = re.compile(r"[\da-zđ]*(?:\s*[–-]\s*\d+)?(?:\s*(?:,|và)\s*(?:khoản\s+|điểm\s+)?" + _SO + r")*"
                        r"\s+(?:khoản\s+\d+[a-z]?\s+)?Điều\s+\d")
RE_04 = [re.compile(r"(?<![\w.])(?:Đ|k|đ)\.\s?\d"), re.compile(r"(?<![\w/\-])[KĐ]\d{1,3}\b")]
RE_05 = re.compile(r"(?<!\bcác )(?<!\bnhững )(?<!\bmọi )(?<!\bmột )(?<!\bloại )"
                   r"\b(?:nghị định|thông tư|nghị quyết)\s+về\b", re.I)
RE_06A = re.compile(r"\b(?:Nghị định|Thông tư|Nghị quyết)\s+(?:số\s+)?\d+/\d{4}\b(?!/)")
RE_06B = re.compile(r"\d+/\d{4}/(?:ND-CP|NDCP|NĐCP|NĐ\s+CP|NĐ[–—]CP|CP\b)")
RE_06C = re.compile(r"\d+/(\d{4})/QH(\d{1,2})\b")
RE_07 = re.compile(r"VBHN")
RE_07_CTX = re.compile(r"\b(?:theo|căn cứ)\b", re.I)
RE_07_NEG = re.compile(r"không (?:dùng|dẫn|trích|được)|đừng|không phải|tuyệt đối không|cấm", re.I)
RE_09 = re.compile(r"theo quy định (?:của )?pháp luật hiện hành", re.I)


def expected_qh(year):
    if 2017 <= year <= 2020:
        return 14
    if 2022 <= year <= 2025:
        return 15
    return None


def lint_line(line, line_start_ok):
    """Tra ve list (code, severity, message, start, end) tren mot dong."""
    out = []
    m_line = mask(line)

    def add(code, sev, msg, m):
        out.append((code, sev, msg, m.start(), m.end()))

    for m in RE_01.finditer(m_line):
        if not at_sentence_start(m_line, m.start(), line_start_ok):
            pre = m_line[:m.start()].rstrip(" *_\"“‘'([")
            sev = "warning" if pre and pre[-1] in ":;" else "error"
            add("CCPL01", sev, "'Khoản'/'Điểm' phải viết thường khi không đứng đầu câu", m)
    for m in RE_02.finditer(m_line):
        add("CCPL02", "error", "'Điều' viện dẫn phải viết hoa chữ Đ", m)
    for r in RE_03:
        for m in r.finditer(m_line):
            # "Điều 26, khoản 3 Điều 35": khoản/điểm thuộc một Điều khác -> căn cứ mới, không phải trật tự ngược
            if r is RE_03[0] and RE_03_NEXT.match(m_line[m.end():]):
                continue
            add("CCPL03", "error", "trật tự ngược; viện dẫn từ nhỏ đến lớn (điểm → khoản → Điều)", m)
    for r in RE_04:
        for m in r.finditer(m_line):
            add("CCPL04", "error", "không viết tắt Đ./k./đ. trước số", m)
    for m in RE_05.finditer(m_line):
        add("CCPL05", "warning", "văn bản dưới luật cần số hiệu dạng NN/YYYY/XX", m)
    for m in RE_06A.finditer(m_line):
        add("CCPL06", "warning", "số hiệu thiếu phần đuôi (vd. /NĐ-CP, /TT-BXX, /QH15)", m)
    for m in RE_06B.finditer(m_line):
        add("CCPL06", "warning", "đuôi số hiệu sai dạng (phải là /NĐ-CP)", m)
    for m in RE_06C.finditer(m_line):
        exp = expected_qh(int(m.group(1)))
        if exp and int(m.group(2)) != exp:
            add("CCPL06", "warning", "khóa Quốc hội không khớp năm ban hành (kỳ vọng QH%d)" % exp, m)
        elif int(m.group(1)) <= 2015 and int(m.group(2)) >= 14:
            add("CCPL06", "warning", "khóa Quốc hội không khớp năm ban hành (kỳ vọng ≤ QH13)", m)
    seen07 = set()
    for m in RE_07.finditer(m_line):
        s, e = sentence_bounds(m_line, m.start())
        if (s, e) in seen07:
            continue
        seen07.add((s, e))
        if RE_07_CTX.search(m_line[s:e]) and not RE_07_NEG.search(m_line[s:e]):
            add("CCPL07", "warning", "không dẫn văn bản hợp nhất (VBHN) làm căn cứ; dẫn luật gốc và luật sửa đổi", m)
    for _id, rx, ten, thay in superseded():
        for m in rx.finditer(m_line):
            s, e = sentence_bounds(m_line, m.start())
            if SUPERSEDED_CTX.search(m_line[s:e]):
                continue
            hint = " (thay bởi: %s)" % thay if thay else ""
            add("CCPL08", "warning", "văn bản đã bị thay thế/hết hiệu lực: %s%s" % (ten, hint), m)
    for m in RE_09.finditer(m_line):
        add("CCPL09", "warning", "cụm viện dẫn chung chung, vô giá trị về điểm; dẫn Điều cụ thể", m)

    # loai doan trich nam trong ngoac kep khi dong dang neu vi du bi cam
    if MENTION_CUE.search(line):
        out = [o for o in out if not in_quotes(m_line, o[3])]
    return out


def lint_text(text, name=None):
    findings = []
    in_fence = False
    line_start_ok = True
    for no, raw in enumerate(text.splitlines(), 1):
        line = raw.rstrip("\n")
        stripped = line.strip()
        if stripped.startswith("```"):
            in_fence = not in_fence
            line_start_ok = True
            continue
        if in_fence:
            continue
        if not stripped:
            line_start_ok = True
            continue
        if not IGNORE_LINE.search(line):
            for code, sev, msg, s, e in lint_line(line, line_start_ok):
                ex = line[max(0, s - 25):e + 25].strip()
                findings.append(Finding(no, code, sev, msg, ex))
        line_start_ok = bool(re.search(r"[.!?:|]\s*(?:\*+|_+|[\"”)])*$", stripped)) \
            or stripped.startswith(("#", "|", "-", "*", ">"))
    findings.sort(key=lambda f: (f.line, f.code))
    return findings


def iter_files(paths):
    for p in paths:
        if os.path.isdir(p):
            for root, _dirs, files in sorted(os.walk(p)):
                for fn in sorted(files):
                    if fn.endswith((".md", ".txt")):
                        yield os.path.join(root, fn)
        else:
            yield p


def main(argv=None):
    ap = argparse.ArgumentParser(description="Lint quy cách CCPL")
    ap.add_argument("paths", nargs="*", help="file hoặc thư mục (.md/.txt)")
    ap.add_argument("--stdin", action="store_true", help="đọc câu trả lời từ stdin")
    ap.add_argument("--errors-only", action="store_true", help="chỉ in mức error")
    args = ap.parse_args(argv)
    if not args.paths and not args.stdin:
        ap.error("cần file/thư mục hoặc --stdin")
    n_err = n_warn = 0
    jobs = []
    if args.stdin:
        jobs.append(("<stdin>", sys.stdin.read()))
    for p in iter_files(args.paths):
        try:
            with open(p, encoding="utf-8") as fh:
                jobs.append((p, fh.read()))
        except (OSError, UnicodeDecodeError) as exc:
            print("%s:0: [IO/error] không đọc được — %s" % (p, exc))
            n_err += 1
    for name, text in jobs:
        for f in lint_text(text, name):
            if f.severity == "error":
                n_err += 1
            else:
                n_warn += 1
                if args.errors_only:
                    continue
            print("%s:%d: [%s/%s] %s — %s" % (name, f.line, f.code, f.severity, f.message, f.excerpt))
    if n_err or n_warn:
        print("Tổng: %d error, %d warning" % (n_err, n_warn), file=sys.stderr)
    return 1 if n_err else 0


if __name__ == "__main__":
    sys.exit(main())
