#!/usr/bin/env python3
"""Kiem schema evals/evals.json (dinh dang skill-creator cua anthropics/skills).

Dung: python3 -I scripts/check_evals.py evals/evals.json
Moi ca: id (int, duy nhat), prompt (str khong rong), expected_output (str khong rong),
expectations (list str khong rong), files (list, neu co: file phai ton tai),
source (list duong dan toi file nguon trong skill, phan sau '#' bi bo qua, file phai ton tai).
Exit 0 neu hop le, 1 neu co loi.
"""
import json
import os
import sys


def check(path):
    errors = []
    root = os.path.dirname(os.path.dirname(os.path.abspath(path)))  # thu muc skill
    try:
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
    except (OSError, ValueError) as exc:
        return ["không đọc được JSON: %s" % exc], 0
    if not isinstance(data, dict):
        return ["gốc phải là object"], 0
    if not isinstance(data.get("skill_name"), str) or not data["skill_name"]:
        errors.append("thiếu skill_name")
    evals = data.get("evals")
    if not isinstance(evals, list) or not evals:
        return errors + ["evals phải là list không rỗng"], 0
    seen = set()
    for i, ev in enumerate(evals):
        tag = "evals[%d]" % i
        if not isinstance(ev, dict):
            errors.append("%s: không phải object" % tag)
            continue
        eid = ev.get("id")
        if not isinstance(eid, int) or isinstance(eid, bool):
            errors.append("%s: id phải là số nguyên" % tag)
        elif eid in seen:
            errors.append("%s: id %d trùng" % (tag, eid))
        else:
            seen.add(eid)
        tag = "ca %s" % eid
        for key in ("prompt", "expected_output"):
            if not isinstance(ev.get(key), str) or not ev[key].strip():
                errors.append("%s: thiếu hoặc rỗng '%s'" % (tag, key))
        exps = ev.get("expectations")
        if not isinstance(exps, list) or not exps or not all(isinstance(x, str) and x.strip() for x in exps):
            errors.append("%s: expectations phải là list chuỗi không rỗng" % tag)
        files = ev.get("files", [])
        if not isinstance(files, list):
            errors.append("%s: files phải là list" % tag)
        else:
            for f in files:
                if not os.path.exists(os.path.join(root, f)):
                    errors.append("%s: file đầu vào không tồn tại: %s" % (tag, f))
        src = ev.get("source")
        if not isinstance(src, list) or not src:
            errors.append("%s: thiếu source (list file nguồn trong skill)" % tag)
        else:
            for s in src:
                rel = str(s).split("#", 1)[0]
                if not rel or not os.path.isfile(os.path.join(root, rel)):
                    errors.append("%s: file nguồn không tồn tại: %s" % (tag, s))
    return errors, len(evals)


def main(argv):
    if len(argv) != 2:
        print("Dùng: check_evals.py <evals.json>", file=sys.stderr)
        return 2
    errors, n = check(argv[1])
    for e in errors:
        print("LỖI: " + e)
    if errors:
        return 1
    print("OK: %d ca hợp lệ" % n)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
