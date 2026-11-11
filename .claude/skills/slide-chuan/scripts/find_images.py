#!/usr/bin/env python3
"""Tìm ảnh THẬT, chất lượng cao, giấy phép mở cho slide — kèm thông tin ghi nguồn bắt buộc.
Dùng (KHUYÊN DÙNG — theo brief): python3 scripts/find_images.py <thư_mục_deck> --brief <thư_mục_deck>/briefs.json
        → images/_candidates.jpg (ảnh nhỏ, mỗi brief một hàng, có điểm) → chấm bằng mắt → --take <id>-<số> để tải ảnh lớn
     Dùng nhanh (từ khoá rời): python3 scripts/find_images.py <thư_mục_deck> "từ khoá 1" ["từ khoá 2" ...] [--n 8] [--min 1600] [--no-commons] [--no-loc] [--nasa] [--rijks]
  (--no-commons: bỏ Wikimedia khi mạng bị giới hạn tần suất — lỗi 429)
  - Nguồn (xem references/image-sources.md):
      có khoá (miễn phí): Pexels (PEXELS_API_KEY), Unsplash (UNSPLASH_ACCESS_KEY), Pixabay (PIXABAY_API_KEY, ảnh ≤1280px), Smithsonian (SI_API_KEY, CC0)
      không cần khoá: Openverse (gom Flickr, Wikimedia...), Thư viện Quốc hội Mỹ loc.gov (--no-loc để bỏ), Wikimedia Commons (--no-commons để bỏ),
        NASA images.nasa.gov (--nasa để bật: ảnh vệ tinh / Trái Đất từ ISS — chỉ hợp đề tài môi trường, đất đai, địa lý),
        Rijksmuseum (--rijks để bật: tranh, bản in cổ phạm vi công cộng — Justitia, toà án, khế ước; từ khoá Hà Lan cho nhiều kết quả hơn)
  - KHÔNG lấy ảnh từ Pinterest/Google/báo: đó là nơi đăng lại ảnh của người khác, không cấp giấy phép — chỉ dùng để tham khảo bố cục.
  - Chỉ giữ giấy phép cho phép dùng lại và chỉnh sửa (cắt khung): CC0, Public Domain, CC BY, CC BY-SA.
    Loại ND (cấm chỉnh sửa) và NC (cấm thương mại) — tránh rủi ro khi slide được dùng lại.
  - Chỉ giữ ảnh rộng ≥ --min px (mặc định 1600, đủ nét cho slide 16:9 chiếu toàn màn hình).
  - Ảnh tải về <thư_mục_deck>/images/, thông tin ghi nguồn ở images/images.json,
    ảnh tổng để CHỌN BẰNG MẮT ở images/_candidates.jpg (đánh số khớp với images.json).
Sau đó ghi vào deck.json: "photo": "images/<tên file>" — engine tự cắt khung theo vùng nổi bật và in dòng ghi nguồn.
Thoát 0 = có ảnh; 1 = không tìm được ảnh hợp lệ; 2 = lỗi mạng/thiếu thư viện."""
import sys, os, json, time, re, io, urllib.request, urllib.parse

UA = "slide-chuan/1.0 (educational slide generator; open-license image search)"
OK_LICENSE = {"cc0", "pdm", "by", "by-sa", "publicdomain", "public domain", "cc-by", "cc-by-sa", "cc by", "cc by-sa"}


sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from img_quality import assess, label  # chấm chất lượng kỹ thuật (nét, sáng, cháy, nhiễu, cỡ)


def get(url, tries=4):
    for k in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read()
        except Exception as e:
            if k == tries - 1:
                raise
            time.sleep(2 ** (k + 1))


def norm_license(s):
    s = (s or "").lower().strip().replace("cc-", "").replace("cc ", "")
    s = re.sub(r"\s*\d(\.\d)?$", "", s)  # bỏ số phiên bản
    return "pdm" if "public" in s or s == "pd" else s


def wm_thumb(url, w):
    """Ảnh gốc trên upload.wikimedia.org bị chặn 429 khi tải từ cloud; ảnh thu nhỏ cỡ CHUẨN 1920px thì tải được (kiểm 04/11/2026)
    → đổi link ảnh gốc rộng > 1920px sang link thu nhỏ 1920px (vẫn đủ nét cho slide 16:9)."""
    m = re.match(r"https://upload\.wikimedia\.org/wikipedia/commons/(?!thumb/)([0-9a-f]/[0-9a-f]{2})/([^/?#]+)$", url or "")
    if not m or (w or 0) <= 1920:
        return url, w
    return f"https://upload.wikimedia.org/wikipedia/commons/thumb/{m.group(1)}/{m.group(2)}/1920px-{m.group(2)}", 1920


def openverse(q, n):
    url = "https://api.openverse.org/v1/images/?" + urllib.parse.urlencode(
        {"q": q, "license": "cc0,pdm,by,by-sa", "size": "large", "page_size": max(n * 3, 20), "mature": "false"})
    out = []
    for r in json.loads(get(url)).get("results", []):
        lic = norm_license(r.get("license"))
        if lic not in {"cc0", "pdm", "by", "by-sa"}:
            continue
        u, w = wm_thumb(r.get("url"), r.get("width") or 0)
        out.append({"url": u, "title": r.get("title") or "", "creator": r.get("creator") or "không rõ",
                    "license": lic.upper() if lic not in ("cc0", "pdm") else ("CC0" if lic == "cc0" else "Public Domain"),
                    "license_version": r.get("license_version") or "", "license_url": r.get("license_url") or "",
                    "source": r.get("foreign_landing_url") or r.get("url"), "w": w, "h": round((r.get("height") or 0) * w / max(1, r.get("width") or 1)), "via": "Openverse",
                    "thumb": r.get("thumbnail") or "", "text": " ".join([r.get("title") or ""] + [t.get("name", "") for t in (r.get("tags") or [])])})
    return out


def pexels(q, n):
    """Pexels (giấy phép Pexels: dùng miễn phí, không bắt buộc ghi nguồn — engine vẫn ghi). Cần biến môi trường PEXELS_API_KEY."""
    key = os.environ.get("PEXELS_API_KEY")
    if not key:
        return []
    url = "https://api.pexels.com/v1/search?" + urllib.parse.urlencode({"query": q, "per_page": max(n * 2, 10), "orientation": "landscape"})
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Authorization": key})
        data = json.loads(urllib.request.urlopen(req, timeout=30).read())
    except Exception as e:
        print(f"  (Pexels không trả lời: {e})"); return []
    return [{"url": (p.get("src") or {}).get("original"), "title": p.get("alt") or "", "creator": p.get("photographer") or "không rõ",
             "license": "Pexels License", "license_version": "", "license_url": "https://www.pexels.com/license/",
             "source": p.get("url") or "", "w": p.get("width") or 0, "h": p.get("height") or 0, "via": "Pexels"} for p in data.get("photos", [])]


def unsplash(q, n):
    """Unsplash (giấy phép Unsplash: dùng miễn phí, không bắt buộc ghi nguồn; API yêu cầu ghi tên tác giả + báo lượt tải). Cần UNSPLASH_ACCESS_KEY."""
    key = os.environ.get("UNSPLASH_ACCESS_KEY")
    if not key:
        return []
    url = "https://api.unsplash.com/search/photos?" + urllib.parse.urlencode({"query": q, "per_page": max(n * 2, 10), "orientation": "landscape", "content_filter": "high"})
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Authorization": "Client-ID " + key, "Accept-Version": "v1"})
        data = json.loads(urllib.request.urlopen(req, timeout=30).read())
    except Exception as e:
        print(f"  (Unsplash không trả lời: {e})"); return []
    out = []
    for p in data.get("results", []):
        out.append({"url": ((p.get("urls") or {}).get("raw") or "") + "&w=2400&q=85&fm=jpg", "title": p.get("alt_description") or p.get("description") or "",
                    "creator": (p.get("user") or {}).get("name") or "không rõ", "license": "Unsplash License", "license_version": "",
                    "license_url": "https://unsplash.com/license", "source": (p.get("links") or {}).get("html") or "", "w": p.get("width") or 0, "h": p.get("height") or 0,
                    "via": "Unsplash", "_track": (p.get("links") or {}).get("download_location"), "_key": key})
    return out


def pixabay(q, n):
    """Pixabay (giấy phép Pixabay Content License: dùng miễn phí, không bắt buộc ghi nguồn). Cần PIXABAY_API_KEY.
    Lưu ý: khoá thường chỉ trả ảnh rộng tối đa 1280px (largeImageURL) — dưới ngưỡng HD 1600px, nên dùng cho ảnh nhỏ/khung, không tràn viền."""
    key = os.environ.get("PIXABAY_API_KEY")
    if not key:
        return []
    url = "https://pixabay.com/api/?" + urllib.parse.urlencode({"key": key, "q": q, "image_type": "photo", "orientation": "horizontal", "per_page": max(n * 2, 10), "safesearch": "true"})
    try:
        data = json.loads(get(url))
    except Exception as e:
        print(f"  (Pixabay không trả lời: {e})"); return []
    return [{"url": h.get("largeImageURL"), "title": h.get("tags") or "", "creator": h.get("user") or "không rõ", "license": "Pixabay Content License",
             "license_version": "", "license_url": "https://pixabay.com/service/license-summary/", "source": h.get("pageURL") or "",
             "w": 1280 if (h.get("imageWidth") or 0) >= 1280 else h.get("imageWidth") or 0, "h": 0, "via": "Pixabay"} for h in data.get("hits", [])]


def loc(q, n):
    """Thư viện Quốc hội Hoa Kỳ (loc.gov) — không cần khoá. Chỉ giữ ảnh có ghi "No known restrictions on publication".
    Hợp với tư liệu lịch sử, kiến trúc, toà án, văn bản cổ; ít ảnh Việt Nam đương đại."""
    url = "https://www.loc.gov/photos/?" + urllib.parse.urlencode({"q": q, "fo": "json", "c": max(n * 3, 15), "at": "results"})
    try:
        res = json.loads(get(url)).get("results", [])
    except Exception as e:
        print(f"  (loc.gov không trả lời: {e})"); return []
    out = []
    for r in res:
        imgs = [u for u in (r.get("image_url") or []) if ".jpg" in u]
        if not imgs or str(r.get("access_restricted")) == "True":
            continue
        try:
            item = json.loads(get(("https:" + r["url"]) if r["url"].startswith("//") else r["url"] + "?fo=json")).get("item", {})
        except Exception:
            continue
        rights = " ".join(item.get("rights_advisory") or []) if isinstance(item.get("rights_advisory"), list) else str(item.get("rights_advisory") or "")
        if "no known restrictions" not in rights.lower():
            continue
        big = imgs[-1].split("#")[0]; m = re.search(r"#h=(\d+)&w=(\d+)", imgs[-1])
        out.append({"url": big, "title": r.get("title") or "", "creator": ", ".join(r.get("contributor") or []) or "Library of Congress",
                    "license": "No known restrictions (LoC)", "license_version": "", "license_url": "https://www.loc.gov/legal/",
                    "source": r.get("url") or "", "w": int(m.group(2)) if m else 0, "h": int(m.group(1)) if m else 0, "via": "Library of Congress"})
        if len(out) >= n * 2:
            break
    return out


def nasa(q, n):
    """NASA Image and Video Library (images.nasa.gov) — không cần khoá, tải được từ cloud.
    Điều khoản NASA: nội dung "thường không chịu bản quyền ở Hoa Kỳ", dùng cho giáo dục/thông tin; PHẢI ghi NASA là nguồn,
    không được ngụ ý NASA bảo trợ; ảnh có logo NASA / người nhận diện được → không dùng cho mục đích quảng bá.
    Ảnh có ghi "secondary_creator"/"©" có thể là của bên thứ ba → bỏ. Hợp với: ảnh vệ tinh, Trái Đất nhìn từ ISS
    (đồng bằng sông Cửu Long, lũ lụt, cháy rừng, đô thị hoá) — đề tài môi trường, đất đai, biến đổi khí hậu."""
    url = "https://images-api.nasa.gov/search?" + urllib.parse.urlencode({"q": q, "media_type": "image", "page_size": max(n * 3, 20)})
    try:
        items = json.loads(get(url)).get("collection", {}).get("items", [])
    except Exception as e:
        print(f"  (NASA không trả lời: {e})"); return []
    out = []
    for it in items:
        dd = (it.get("data") or [{}])[0]
        txt = " ".join(str(dd.get(k) or "") for k in ("description", "title", "secondary_creator"))
        if dd.get("secondary_creator") or "©" in txt or "copyright" in txt.lower():
            continue  # có dấu hiệu bản quyền của bên thứ ba
        nid = dd.get("nasa_id")
        if not nid:
            continue
        out.append({"url": f"https://images-assets.nasa.gov/image/{urllib.parse.quote(nid)}/{urllib.parse.quote(nid)}~large.jpg", "title": dd.get("title") or "",
                    "creator": dd.get("photographer") or ("NASA " + (dd.get("center") or "")).strip(), "license": "NASA Media Usage Guidelines",
                    "license_version": "", "license_url": "https://www.nasa.gov/nasa-brand-center/images-and-media/",
                    "source": f"https://images.nasa.gov/details/{urllib.parse.quote(nid)}", "w": 0, "h": 0, "via": "NASA", "text": txt + " " + " ".join(dd.get("keywords") or []),
                    "thumb": f"https://images-assets.nasa.gov/image/{urllib.parse.quote(nid)}/{urllib.parse.quote(nid)}~thumb.jpg"})
        if len(out) >= n * 2:
            break
    return out


def _rk_text(v, lang="en"):
    """Linked Art: chọn chữ theo ngôn ngữ trong notation/content."""
    if isinstance(v, list):
        for x in v:
            if isinstance(x, dict) and x.get("@language") == lang: return x.get("@value", "")
        return (v[0].get("@value", "") if v and isinstance(v[0], dict) else "")
    return v or ""


def rijks_record(obj):
    """Rút ảnh + giấy phép + tác giả từ một bản ghi Linked Art của Rijksmuseum (tách riêng để test offline)."""
    img, lic = None, ""
    for so in obj.get("subject_of") or []:
        for dc in so.get("digitally_carried_by") or []:
            ap = [a.get("id") for a in dc.get("access_point") or [] if a.get("id")]
            lb = " ".join(str(r.get("_label") or "") for r in dc.get("referred_to_by") or [])
            if ap and not img: img, lic = ap[0], lb
    if not img or not re.search(r"public domain|cc0", lic, re.I):
        return None  # không có ảnh, hoặc ảnh không phải phạm vi công cộng/CC0
    title, objno = "", ""
    for i in obj.get("identified_by") or []:
        if i.get("type") == "Name" and not title: title = i.get("content") or ""
        if i.get("type") == "Identifier" and not objno: objno = i.get("content") or ""
    who = []
    prod = obj.get("produced_by") or {}
    for part in (prod.get("part") or [prod]):
        for p in part.get("carried_out_by") or []:
            nm = _rk_text(p.get("notation")) or p.get("_label") or ""
            if nm and nm not in who: who.append(nm)
    m = re.match(r"(https://[^/]+/[^/]+)/full/", img)
    url = (m.group(1) + "/full/!2400,2400/0/default.jpg") if m else img  # IIIF: thu về ≤ 2400px, không tải bản gốc hàng chục MB
    return {"url": url, "title": title, "creator": ", ".join(who) or "không rõ", "license": "CC0" if re.search("cc0", lic, re.I) else "Public Domain",
            "license_version": "", "license_url": "https://www.rijksmuseum.nl/en/information-and-data-policy",
            "source": f"https://www.rijksmuseum.nl/en/collection/{objno}" if objno else obj.get("id", ""), "w": 0, "h": 0, "via": "Rijksmuseum"}


def rijks(q, n):
    """Rijksmuseum (data.rijksmuseum.nl) — không cần khoá. Chỉ giữ ảnh ghi Public Domain / CC0.
    Hợp với: tranh, bản in cổ về công lý (Justitia), toà án, hợp đồng, khế ước, đời sống thương mại châu Âu thế kỷ 16–19.
    Mô tả hiện vật chủ yếu tiếng Hà Lan → thử cả từ khoá Hà Lan: justitia, rechtspraak, contract, notaris, rechtbank."""
    ids = []
    for field in ("title", "description"):
        try:
            data = json.loads(get("https://data.rijksmuseum.nl/search/collection?" + urllib.parse.urlencode({field: q, "imageAvailable": "true"})))
        except Exception as e:
            print(f"  (Rijksmuseum không trả lời: {e})"); return []
        ids += [it["id"] for it in data.get("orderedItems", []) if it.get("id") not in ids]
    out = []
    for oid in ids[: n * 3]:
        try:
            req = urllib.request.Request(oid, headers={"User-Agent": UA, "Accept": "application/ld+json"})
            obj = json.loads(urllib.request.urlopen(req, timeout=30).read())
        except Exception:
            continue
        r = rijks_record(obj)
        if r: out.append(r)
        if len(out) >= n * 2: break
    return out


def smithsonian_record(row):
    """Rút ảnh CC0 từ một bản ghi EDAN của Smithsonian (tách riêng để test offline). Chỉ giữ media có usage.access == CC0."""
    c = row.get("content") or {}; dn = c.get("descriptiveNonRepeating") or {}
    for m in (dn.get("online_media") or {}).get("media") or []:
        if m.get("type") != "Images" or (m.get("usage") or {}).get("access") != "CC0":
            continue
        res = {r.get("label"): r for r in m.get("resources") or []}
        big = res.get("High-resolution JPEG") or {}
        url = big.get("url") or m.get("content")
        if not url: continue
        names = (c.get("freetext") or {}).get("name") or []
        who = ", ".join(x.get("content", "") for x in names if x.get("content") and x.get("content") != "Unidentified")
        return {"url": url, "title": row.get("title") or "", "creator": who or (dn.get("data_source") or "Smithsonian"), "license": "CC0",
                "license_version": "", "license_url": "https://www.si.edu/openaccess", "source": dn.get("record_link") or row.get("url") or "",
                "w": big.get("width") or m.get("width") or 0, "h": big.get("height") or m.get("height") or 0, "via": "Smithsonian"}
    return None


def smithsonian(q, n):
    """Smithsonian Open Access (CC0). Cần SI_API_KEY (miễn phí: https://api.data.gov/signup/ — khoá DEMO_KEY bị giới hạn rất nhanh).
    Hợp với: hiện vật, ảnh lịch sử, khoa học, kiến trúc Mỹ; ít ảnh Việt Nam."""
    key = os.environ.get("SI_API_KEY")
    if not key:
        return []
    url = "https://api.si.edu/openaccess/api/v1.0/search?" + urllib.parse.urlencode({"q": f"{q} AND online_media_type:Images", "rows": max(n * 3, 20), "api_key": key})
    try:
        rows = json.loads(get(url, tries=2)).get("response", {}).get("rows", [])
    except Exception as e:
        print(f"  (Smithsonian không trả lời: {e} — kiểm SI_API_KEY)"); return []
    return [r for r in (smithsonian_record(x) for x in rows) if r][: n * 2]


def commons(q, n):
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "query", "format": "json", "generator": "search", "gsrnamespace": 6, "gsrsearch": q + " filetype:bitmap",
        "gsrlimit": max(n * 2, 10), "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": 1920})  # 1920: cỡ thu nhỏ chuẩn của Wikimedia (cỡ lạ bị chặn 429)
    try:
        data = json.loads(get(url))
    except Exception as e:
        print(f"  (Wikimedia Commons không trả lời: {e} — bỏ qua nguồn này)")
        return []
    out = []
    for p in (data.get("query", {}).get("pages", {}) or {}).values():
        ii = (p.get("imageinfo") or [{}])[0]; md = ii.get("extmetadata", {})
        lic = norm_license((md.get("LicenseShortName", {}) or {}).get("value", ""))
        if lic not in {"cc0", "pdm", "by", "by-sa"}:
            continue
        artist = re.sub(r"<[^>]+>", "", (md.get("Artist", {}) or {}).get("value", "")).strip() or "không rõ"
        out.append({"url": ii.get("thumburl") or ii.get("url"), "title": p.get("title", "").replace("File:", ""), "creator": artist,
                    "license": (md.get("LicenseShortName", {}) or {}).get("value", ""), "license_version": "",
                    "license_url": (md.get("LicenseUrl", {}) or {}).get("value", ""), "source": ii.get("descriptionurl", ""),
                    "w": ii.get("width") or 0, "h": ii.get("height") or 0, "via": "Wikimedia Commons"})
    return out


# ===================== TÌM ẢNH THEO BRIEF =====================
# Vì sao: tìm theo một từ khoá rồi lấy ảnh "đẹp nhất" cho ra ảnh lạc đề (thử thật: "construction site Vietnam" ra ảnh hội nghị).
# Brief = mô tả slide CẦN THẤY GÌ trước khi tìm; script tìm nhiều từ khoá, chấm điểm theo chữ mô tả ảnh (tiêu đề, thẻ, mô tả),
# chỉ tải ẢNH NHỎ để xem; người làm slide chấm bằng mắt theo brief rồi mới tải ảnh lớn (--take).
# briefs.json: {"briefs": [{"id": "ruong", "slide": 4, "want": "Cánh đồng lúa ĐBSCL, nhìn rộng, không có người cận cảnh",
#   "queries": ["Mekong Delta rice paddy", "An Giang rice field"], "must": ["rice", "paddy"], "place": ["Mekong", "Vietnam"],
#   "avoid": ["portrait", "market"], "sources": ["openverse", "nasa", "rijks", "loc"]}]}

def fold(t):
    import unicodedata
    t = unicodedata.normalize("NFD", str(t or "")).replace("đ", "d").replace("Đ", "D")
    return "".join(ch for ch in t if unicodedata.category(ch) != "Mn").lower()


def score(r, b):
    """Điểm phù hợp theo chữ mô tả ảnh: có từ bắt buộc (must) +2 (+1 mỗi từ thêm, tối đa +2); đúng địa danh (place) +2;
    dính từ cần tránh (avoid) −3 mỗi từ; ảnh nét (≥ 2400px) +0.5; ảnh ngang +0.5. Chữ mô tả chỉ là gợi ý — vẫn phải xem ảnh."""
    txt = " " + re.sub(r"[^a-z0-9]+", " ", fold(" ".join([r.get("title", ""), r.get("text", "")]))) + " "
    has = lambda w: (" " + re.sub(r"[^a-z0-9]+", " ", fold(w)).strip() + " ") in txt
    must = [w for w in b.get("must", []) if has(w)]
    sc = (2 + min(2, len(must) - 1) if must else 0) + (2 if any(has(w) for w in b.get("place", [])) else 0)
    sc -= 3 * sum(1 for w in b.get("avoid", []) if has(w))
    if b.get("place") and not any(has(w) for w in b["place"]): sc -= 1  # brief có địa danh mà mô tả ảnh không nhắc nơi nào → nghi sai địa điểm
    if (r.get("w") or 0) >= 2400: sc += 0.5
    if r.get("qi"): sc += 1 + (0.5 if r.get("fp") else 0)  # đã qua bình chọn chất lượng của Wikimedia Commons
    if r.get("w") and r.get("h") and r["w"] / max(1, r["h"]) >= 1.3: sc += 0.5
    return sc


def thumb_of(r):
    """Ảnh nhỏ để xem (không tải ảnh lớn cho mọi ứng viên)."""
    u = r.get("url") or ""
    if "/thumb/" in u and "upload.wikimedia.org" in u: return re.sub(r"/\d+px-", "/500px-", u)  # ảnh nhỏ Openverse của ảnh Wikimedia lỗi 424 → lấy thẳng cỡ chuẩn 500px
    m = re.match(r"https://upload\.wikimedia\.org/wikipedia/commons/([0-9a-f]/[0-9a-f]{2})/([^/?#]+)$", u)
    if m: return f"https://upload.wikimedia.org/wikipedia/commons/thumb/{m.group(1)}/{m.group(2)}/500px-{m.group(2)}"
    if r.get("thumb"): return r["thumb"]
    if "images-assets.nasa.gov" in u: return u.replace("~large.jpg", "~thumb.jpg")
    if "iiif.micr.io" in u: return u.replace("!2400,2400", "!500,500")
    if "/thumb/" in u and "upload.wikimedia.org" in u: return re.sub(r"/\d+px-", "/500px-", u)
    if "images.pexels.com" in u: return u.split("?")[0] + "?auto=compress&w=500"
    if "images.unsplash.com" in u: return u.replace("&w=2400", "&w=500")
    if "ids.si.edu/ids/download" in u: return u.replace(".jpg", "_screen").replace("download?id=", "download?id=")
    return u


def commons_qi(q, n):
    """Wikimedia Commons, chỉ ảnh đã được cộng đồng thẩm định "Quality images" (đủ nét, đúng sáng, bố cục tốt — có quy trình bình chọn)."""
    out = commons(q + ' incategory:"Quality_images"', n)
    for r in out: r["qi"] = True; r["via"] = "Commons (Quality image)"
    return out


def commons_fp(q, n):
    """Wikimedia Commons "Featured pictures" — ảnh xuất sắc nhất, rất ít nhưng đẹp nhất."""
    out = commons(q + ' incategory:"Featured_pictures_on_Wikimedia_Commons"', n)
    for r in out: r["qi"] = True; r["fp"] = True; r["via"] = "Commons (Featured picture)"
    return out


SOURCES = {"commons-qi": commons_qi, "commons-fp": commons_fp, "openverse": openverse, "nasa": nasa, "rijks": rijks, "loc": loc, "commons": commons, "pexels": pexels, "unsplash": unsplash, "pixabay": pixabay, "smithsonian": smithsonian}


def font(size):
    from PIL import ImageFont
    for f in ["/usr/share/fonts/truetype/crosextra/Carlito-Regular.ttf", "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
              "C:/Windows/Fonts/calibri.ttf", "/Library/Fonts/Arial.ttf", "/System/Library/Fonts/Supplemental/Arial.ttf"]:
        if os.path.exists(f): return ImageFont.truetype(f, size)
    return ImageFont.load_default()  # font mặc định không có dấu tiếng Việt


def brief_mode(deck_dir, brief_path, k=8):
    from PIL import Image, ImageDraw
    raw = json.load(open(brief_path, encoding="utf8"))
    briefs = raw["briefs"] if isinstance(raw, dict) else raw  # nhận cả {"briefs": [...]} lẫn mảng [...]
    img_dir = os.path.join(deck_dir, "images"); os.makedirs(img_dir, exist_ok=True)
    allc = {}
    # GỘP với lượt tìm trước: chạy lại --brief cho vài brief (vd. lượt 1 bị Wikimedia 429) không được xoá ứng viên của brief khác —
    # trước đây candidates.json bị ghi đè nên --take <id>-<số> của lượt trước báo "không có trong candidates.json"
    _cp = os.path.join(img_dir, "candidates.json")
    if os.path.exists(_cp):
        try: allc.update(json.load(open(_cp, encoding="utf8")))
        except Exception: pass
    for b in briefs:
        print(f"• Brief {b['id']}: {b.get('want', '')}")
        pool, seen = [], set()
        srcs = b.get("sources") or ["pexels", "unsplash", "pixabay", "openverse", "nasa", "loc", "smithsonian"]
        for q in b.get("queries") or [b.get("want", "")]:
            for name in srcs:
                fn = SOURCES.get(name)
                if not fn: continue
                try: res = fn(q, 6)
                except Exception as e: print(f"  ({name} lỗi: {e})"); res = []
                for r in res:
                    if not r.get("url") or r["url"] in seen: continue
                    if r.get("w") and r["w"] < 1600: continue
                    seen.add(r["url"]); r["query"] = q; r["score"] = score(r, b); pool.append(r)
        if len([r for r in pool if r["score"] >= 2]) < k:  # thiếu ứng viên → nới từ khoá: ghép từ ngắn must × place
            extra = [f"{m} {p}" for m in b.get("must", [])[:3] for p in b.get("place", [])[:2]]
            for q in extra:
                for name in srcs:
                    fn = SOURCES.get(name)
                    if not fn: continue
                    try: res = fn(q, 6)
                    except Exception: res = []
                    for r in res:
                        if not r.get("url") or r["url"] in seen or (r.get("w") and r["w"] < 1600): continue
                        seen.add(r["url"]); r["query"] = q; r["score"] = score(r, b); pool.append(r)
        pool.sort(key=lambda r: -r["score"])
        top = [r for r in pool if r["score"] > -1][:k]
        print(f"  {len(pool)} ứng viên, giữ {len(top)} điểm cao nhất" + ("" if top else " — KHÔNG có ảnh hợp: đổi từ khoá / nguồn, hoặc dùng hình vẽ của engine"))
        allc[b["id"]] = {"brief": b, "cands": [{k_: v for k_, v in r.items() if not k_.startswith("_")} for r in top]}
    json.dump(allc, open(os.path.join(img_dir, "candidates.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
    sheet_mode(deck_dir)


def sheet_mode(deck_dir):
    """Dựng bảng ứng viên từ images/candidates.json (không tìm lại) — chạy lại khi ảnh nhỏ bị lỗi mạng."""
    from PIL import Image, ImageDraw
    img_dir = os.path.join(deck_dir, "images"); allc = json.load(open(os.path.join(img_dir, "candidates.json"), encoding="utf8"))
    tw, th, cols = 360, 220, 8
    rows = [b for b in allc.values() if b["cands"]]
    if not rows:
        print("✗ Không brief nào có ứng viên."); sys.exit(1)
    W_ = cols * (tw + 8) + 8; H_ = len(rows) * (th + 92) + 8
    sheet = Image.new("RGB", (W_, H_), "white"); d = ImageDraw.Draw(sheet); f1, f2 = font(22), font(16)
    y, miss = 8, 0
    for row in rows:
        b = row["brief"]; d.text((10, y), f"[{b['id']}] {b.get('want', '')}" + (f"   — tránh: {', '.join(b.get('avoid', []))}" if b.get("avoid") else ""), fill=(20, 60, 60), font=f1)
        for j, r in enumerate(row["cands"]):
            x = 8 + j * (tw + 8)
            try:
                im = Image.open(io.BytesIO(get(thumb_of(r), tries=4))).convert("RGB")
                q = assess(im, r.get("w") or None, thumb=True); r["kt"] = q  # chất lượng kỹ thuật đo trên ảnh nhỏ — sàng lọc, không thay mắt người
                im.thumbnail((tw, th)); sheet.paste(im, (x, y + 32))
                if q["diem"] < 2: d.rectangle([x - 2, y + 30, x + im.width + 2, y + 34 + im.height], outline=(200, 40, 40), width=4)
            except Exception:
                miss += 1; d.rectangle([x, y + 32, x + tw, y + 32 + th], outline=(200, 200, 200)); d.text((x + 10, y + 120), "không tải được ảnh nhỏ", fill="gray", font=f2)
            d.text((x, y + 36 + th), f"{b['id']}-{j + 1}  điểm {r['score']:.1f}  {r['via']} {r['license']}", fill="black", font=f2)
            if r.get("kt"): d.text((x, y + 56 + th), label(r["kt"]), fill=(200, 40, 40) if r["kt"]["diem"] < 2 else (30, 110, 60), font=f2)
            time.sleep(1.0 if "wikimedia" in thumb_of(r) else 0.3)  # Wikimedia giới hạn tốc độ: tải dồn → 429
        y += th + 92
    json.dump(allc, open(os.path.join(img_dir, "candidates.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)  # lưu điểm kỹ thuật
    out = os.path.join(img_dir, "_candidates.jpg"); sheet.save(out, quality=85)
    if miss: print(f"⚠ {miss} ảnh nhỏ không tải được (mạng/giới hạn tốc độ) — chạy lại: python3 scripts/find_images.py {deck_dir} --sheet")
    print("  Viền đỏ / chữ đỏ \"KT < 2\" = ảnh kỹ thuật yếu (mờ, tối, cháy, nhiễu, nhỏ) — loại, dù đúng chủ đề.")
    print(f"→ Xem {out}: chấm từng ảnh 0–3 theo brief (SKILL.md bước 5). Chỉ lấy ảnh ≥ 2 điểm:\n   python3 scripts/find_images.py {deck_dir} --take <id>-<số> [--take ...]")


def take_mode(deck_dir, picks):
    from PIL import Image
    img_dir = os.path.join(deck_dir, "images"); cpath = os.path.join(img_dir, "candidates.json")
    allc = json.load(open(cpath, encoding="utf8")); meta_path = os.path.join(img_dir, "images.json")
    meta = json.load(open(meta_path, encoding="utf8")) if os.path.exists(meta_path) else {}
    used = {m.get("source") for m in meta.values()}
    for pk in picks:
        bid, _, num = pk.rpartition("-")
        if bid not in allc or not num.isdigit() or not (1 <= int(num) <= len(allc[bid]["cands"])):
            print(f"✗ {pk}: không có trong candidates.json"); continue
        r = dict(allc[bid]["cands"][int(num) - 1]); b = allc[bid]["brief"]
        if r.get("source") in used: print(f"⚠ {pk}: ảnh này đã tải cho brief khác — mỗi slide một ảnh riêng")
        u = r["url"] + ("?auto=compress&cs=tinysrgb&w=2400" if r["via"] == "Pexels" and "?" not in r["url"] else "")
        if "wikimedia" in u: time.sleep(4)  # Wikimedia chặn 429 khi tải ảnh lớn liên tiếp
        try: im = Image.open(io.BytesIO(get(u))).convert("RGB")
        except Exception as e: print(f"✗ {pk}: không tải được ({e}) — đợi vài phút rồi chạy lại --take {pk}"); continue
        q = assess(im, im.width)
        if q["diem"] < 2 and "--force" not in sys.argv:
            print(f"✗ {pk}: ảnh kỹ thuật yếu — {label(q)}. Chọn ảnh khác (hoặc thêm --force nếu chắc chắn)."); continue
        if im.width > 2400: im = im.resize((2400, round(im.height * 2400 / im.width)), Image.LANCZOS)
        fn = re.sub(r"[^a-z0-9]+", "-", fold(bid)).strip("-") + f"-{num}.jpg"  # nhiều ảnh cùng brief không ghi đè nhau
        im.save(os.path.join(img_dir, fn), quality=86)
        r.update({"file": f"images/{fn}", "w": im.width, "h": im.height, "brief": b.get("want", ""), "brief_id": bid, "kt": q})
        meta[fn] = r; used.add(r.get("source"))
        print(f"✓ {fn}  {im.width}×{im.height}  {r['license']} — {r['creator'][:40]}  {label(q)}  (brief: {b.get('want', '')[:60]})")
    json.dump(meta, open(meta_path, "w", encoding="utf8"), ensure_ascii=False, indent=1)


def main():
    args = sys.argv[1:]
    if len(args) < 2:
        sys.exit(__doc__)
    n, mn, use_commons, use_loc = 8, 1600, True, True
    use_nasa, use_rijks = "--nasa" in args, "--rijks" in args
    for f in ("--nasa", "--rijks"):
        if f in args: args.remove(f)
    if "--no-loc" in args: args.remove("--no-loc"); use_loc = False
    if "--no-commons" in args: args.remove("--no-commons"); use_commons = False
    if "--n" in args: i = args.index("--n"); n = int(args[i + 1]); del args[i:i + 2]
    if "--min" in args: i = args.index("--min"); mn = int(args[i + 1]); del args[i:i + 2]
    if "--brief" in args:
        i = args.index("--brief"); bp = args[i + 1]; del args[i:i + 2]
        return brief_mode(args[0], bp, n)
    if "--sheet" in args:
        args.remove("--sheet"); return sheet_mode(args[0])
    if "--force" in args: args.remove("--force")
    if "--take" in args:
        picks = [args[i + 1] for i, a_ in enumerate(args) if a_ == "--take"]
        return take_mode(args[0], picks)
    deck_dir, queries = args[0], args[1:]
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print("Thiếu Pillow (pip install Pillow)"); sys.exit(2)
    img_dir = os.path.join(deck_dir, "images"); os.makedirs(img_dir, exist_ok=True)
    meta_path = os.path.join(img_dir, "images.json")
    meta = json.load(open(meta_path, encoding="utf8")) if os.path.exists(meta_path) else {}
    cands = []
    for q in queries:
        print(f"• Tìm: {q}")
        pool = pexels(q, n) + unsplash(q, n) + pixabay(q, n) + openverse(q, n) + (loc(q, n) if use_loc else []) + (nasa(q, n) if use_nasa else []) + (rijks(q, n) if use_rijks else []) + smithsonian(q, n) + (commons(q, n) if use_commons else [])
        found = [r for r in pool if r["url"] and (r["w"] >= mn or r["w"] == 0)]
        found.sort(key=lambda r: (abs(r["w"] / max(r["h"], 1) - 16 / 9), -r["w"]))  # ưu tiên ảnh ngang gần 16:9, nét
        seen = 0
        for r in found:
            if seen >= n: break
            slug = re.sub(r"[^a-z0-9]+", "-", (q + "-" + str(len(meta) + 1)).lower()).strip("-")[:50]
            fn = f"{slug}.jpg"
            time.sleep(1.5)
            if r["via"] == "Pexels" and "?" not in r["url"]: r["url"] += "?auto=compress&cs=tinysrgb&w=2400"  # giãn nhịp tải — tôn trọng giới hạn của Wikimedia/Flickr
            try:
                raw = get(r["url"]); im = Image.open(io.BytesIO(raw)).convert("RGB")
            except Exception as e:
                print(f"  ✗ không tải được {r['url'][:60]}… ({e})"); continue
            if im.width < mn:
                print(f"  – bỏ {r['via']}: chỉ rộng {im.width}px (< {mn}px, sẽ mờ khi chiếu)"); continue
            if r.get("_track"):  # điều kiện API Unsplash: báo lượt tải
                try: urllib.request.urlopen(urllib.request.Request(r["_track"], headers={"Authorization": "Client-ID " + r["_key"], "User-Agent": UA}), timeout=15)
                except Exception: pass
            r = {k: v for k, v in r.items() if not k.startswith("_")}
            if im.width > 2400: im = im.resize((2400, round(im.height * 2400 / im.width)), Image.LANCZOS)
            im.save(os.path.join(img_dir, fn), quality=88)
            r.update({"file": f"images/{fn}", "query": q, "w": im.width, "h": im.height})
            meta[fn] = r; cands.append((fn, im)); seen += 1
            print(f"  ✓ {fn}  {im.width}×{im.height}  {r['license']}  — {r['creator'][:40]}")
    json.dump(meta, open(meta_path, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    if not cands:
        print("✗ Không có ảnh hợp lệ (giấy phép mở + đủ nét). Đổi từ khoá (tiếng Anh thường cho nhiều kết quả hơn) hoặc dùng hình vẽ của engine."); sys.exit(1)
    # ảnh tổng để chọn bằng mắt
    tw, th = 480, 270; cols = 4; rows = (len(cands) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (tw + 10) + 10, rows * (th + 40) + 10), "white"); d = ImageDraw.Draw(sheet)
    for k, (fn, im) in enumerate(cands):
        x, y = 10 + (k % cols) * (tw + 10), 10 + (k // cols) * (th + 40)
        t = im.copy(); t.thumbnail((tw, th)); sheet.paste(t, (x, y)); d.text((x, y + th + 6), f"{k + 1}. {fn}  [{meta[fn]['license']}]", fill="black")
    sheet.save(os.path.join(img_dir, "_candidates.jpg"), quality=85)
    print(f"→ Xem {os.path.join(img_dir, '_candidates.jpg')} rồi chọn ảnh ĐÚNG chủ đề; thông tin ghi nguồn: {meta_path}")


if __name__ == "__main__":
    main()
