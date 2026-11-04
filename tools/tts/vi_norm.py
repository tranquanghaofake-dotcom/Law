"""Chuẩn hoá câu trước khi đưa vào giọng clone (F5-TTS tiếng Việt).

Model học từ văn bản chữ thường, không có chữ viết tắt và chữ số, nên câu luật phải được "đọc ra chữ":
  "Điều 119 Hiến pháp 2013" → "điều một trăm mười chín hiến pháp hai nghìn không trăm mười ba"
  "BHXH" → "bảo hiểm xã hội", "NĐ-CP" → "nghị định chính phủ", "50%" → "năm mươi phần trăm".
Chỉ đổi CÁCH ĐỌC; khoá tệp mp3 (text_key) vẫn tính trên câu GỐC để app tìm đúng tệp.
"""
import re
import unicodedata

# Chữ viết tắt hay gặp trong dữ liệu (đếm từ packages/content/data). Dài trước ngắn để thay đúng.
ABBR = {
    'VBHN-LQ-VPQH': 'văn bản hợp nhất văn phòng quốc hội', 'VBHN-PL-VPQH': 'văn bản hợp nhất văn phòng quốc hội',
    'VBHN-VPQH': 'văn bản hợp nhất văn phòng quốc hội', 'VBHN': 'văn bản hợp nhất', 'VBQPPL': 'văn bản quy phạm pháp luật',
    'LLCNN&PL': 'lý luận chung nhà nước và pháp luật', 'NN&PL': 'nhà nước và pháp luật', 'NĐ-CP': 'nghị định chính phủ',
    'QĐ-TTg': 'quyết định thủ tướng', 'NQ-HĐTP': 'nghị quyết hội đồng thẩm phán', 'TT-BTC': 'thông tư bộ tài chính',
    'UBTVQH': 'ủy ban thường vụ quốc hội', 'TANDTC': 'tòa án nhân dân tối cao', 'VKSNDTC': 'viện kiểm sát nhân dân tối cao',
    'VKSND': 'viện kiểm sát nhân dân', 'TAND': 'tòa án nhân dân', 'UBND': 'ủy ban nhân dân', 'HĐND': 'hội đồng nhân dân',
    'ĐBQH': 'đại biểu quốc hội', 'BLTTDS': 'bộ luật tố tụng dân sự', 'BLTTHS': 'bộ luật tố tụng hình sự', 'BLDS': 'bộ luật dân sự',
    'BLHS': 'bộ luật hình sự', 'BLLĐ': 'bộ luật lao động', 'HĐLĐ': 'hợp đồng lao động', 'HNGĐ': 'hôn nhân và gia đình',
    'BHXH': 'bảo hiểm xã hội', 'BHYT': 'bảo hiểm y tế', 'BHTN': 'bảo hiểm thất nghiệp', 'SHTT': 'sở hữu trí tuệ',
    'SHCN': 'sở hữu công nghiệp', 'TNHH': 'trách nhiệm hữu hạn', 'TNHS': 'trách nhiệm hình sự', 'TNDN': 'thu nhập doanh nghiệp',
    'TNCN': 'thu nhập cá nhân', 'GTGT': 'giá trị gia tăng', 'TTĐB': 'tiêu thụ đặc biệt', 'NSNN': 'ngân sách nhà nước',
    'TCTD': 'tổ chức tín dụng', 'DNTN': 'doanh nghiệp tư nhân', 'HTX': 'hợp tác xã', 'XLVPHC': 'xử lý vi phạm hành chính',
    'KHXH': 'khoa học xã hội', 'NXB': 'nhà xuất bản', 'HLU': 'đại học luật hà nội', 'CTTP': 'cấu thành tội phạm',
    'BCC': 'bê xê xê', 'IPO': 'i pi âu', 'ETF': 'i ti ép', 'NAV': 'en ây vi', 'ILO': 'i eo âu', 'WTO': 'vê kép tê âu',
    'CISG': 'xi ai ét gi', 'GATT': 'gát', 'ĐH': 'đại học', 'QH': 'quốc hội', 'CP': 'chính phủ', 'VN': 'việt nam',
    # bổ sung sau khi quét toàn bộ câu app đọc
    'CHXHCN': 'cộng hòa xã hội chủ nghĩa', 'XHCN': 'xã hội chủ nghĩa', 'BHVBQPPL': 'ban hành văn bản quy phạm pháp luật',
    'LLVTND': 'lực lượng vũ trang nhân dân', 'ĐHĐCĐ': 'đại hội đồng cổ đông', 'HĐQT': 'hội đồng quản trị',
    'HĐTV': 'hội đồng thành viên', 'HĐTP': 'hội đồng thẩm phán', 'ĐBSCL': 'đồng bằng sông cửu long', 'QLHC': 'quản lý hành chính',
    'TTHC': 'thủ tục hành chính', 'UBHC': 'ủy ban hành chính', 'VPCP': 'văn phòng chính phủ', 'VPQH': 'văn phòng quốc hội',
    'LTM': 'luật thương mại', 'TCN': 'trước công nguyên', 'ThS': 'thạc sĩ', 'PGS': 'phó giáo sư', 'TS': 'tiến sĩ', 'GS': 'giáo sư',
    'NĐ': 'nghị định', 'NQ': 'nghị quyết', 'SL': 'sắc lệnh', 'PL': 'pháp lệnh', 'LQ': 'luật', 'ĐB': 'đại biểu', 'DN': 'doanh nghiệp',
    'NT': 'nguyên tắc', 'HC': 'hành chính', 'HOSE': 'hô xê', 'HNX': 'hát en ích', 'VSDC': 'vê ét đê xê', 'VNM': 'vê en em',
    'CPTPP': 'xê pê tê pê pê', 'EVFTA': 'e vê ép tê a', 'TRIPS': 'tríp', 'UPOV': 'u pốp', 'FATF': 'ép a tê ép', 'RIA': 'ri a',
    'EPS': 'e pê ét', 'BTU': 'bê tê u', 'HCFC': 'hát xê ép xê', 'NHNN': 'ngân hàng nhà nước', 'QPPL': 'quy phạm pháp luật',
    'XNK': 'xuất nhập khẩu', 'TTTM': 'trọng tài thương mại', 'DNNN': 'doanh nghiệp nhà nước', 'VBPL': 'văn bản pháp luật',
    'TP': 'thành phố', 'VD': 'ví dụ',
}
# mã học phần / mã bài nội bộ trong ghi chú nguồn: không đọc
CODES = re.compile(r'\s*\(?\b(?:SHTTTT|HCPC|LHC\.VĐ\d*|VĐ\d+|VD\d+(?:\s*,\s*VD\d+)*)\b\)?')
SYMBOLS = {'≥': ' lớn hơn hoặc bằng ', '≤': ' nhỏ hơn hoặc bằng ', '≈': ' xấp xỉ ', '×': ' nhân ', '↔': ' tương ứng với ',
           '=': ' là ', '+': ' và ', '<': ' dưới ', '>': ' trên ', '·': ', ', '，': ', ', '；': ', ', '：': ', ', '%': ' phần trăm', '⊂': ' thuộc '}
UNITS = {'ha': 'héc ta', 'km': 'ki lô mét', 'cm': 'xăng ti mét', 'm2': 'mét vuông', 'm²': 'mét vuông', 'kg': 'ki lô gam', 'g': 'gam', 'mL': 'mi li lít', 'ml': 'mi li lít'}
DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']


def roman(r: str) -> int:
    """Số La Mã → số (XXVI = 26); không hợp lệ → 0."""
    v = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100}
    if not r or any(c not in v for c in r):
        return 0
    n = sum(-v[a] if v[a] < v[b] else v[a] for a, b in zip(r, r[1:])) + v[r[-1]]
    return n if 0 < n < 400 else 0


def _under_1000(n: int, full: bool) -> str:
    """0–999; full=True đọc đủ "không trăm" (khi đứng sau hàng nghìn)."""
    h, t, u = n // 100, (n // 10) % 10, n % 10
    out = []
    if h or full:
        out += [DIGITS[h], 'trăm']
    if t == 0:
        if u and (h or full):
            out.append('lẻ')
        if u:
            out.append(DIGITS[u])
    elif t == 1:
        out.append('mười')
        if u:
            out.append('lăm' if u == 5 else DIGITS[u])
    else:
        out += [DIGITS[t], 'mươi']
        if u == 1:
            out.append('mốt')
        elif u == 4:
            out.append('tư')
        elif u == 5:
            out.append('lăm')
        elif u:
            out.append(DIGITS[u])
    return ' '.join(out)


def number_words(n: int) -> str:
    if n == 0:
        return 'không'
    units = ['', 'nghìn', 'triệu', 'tỷ']
    groups = []
    while n:
        groups.append(n % 1000)
        n //= 1000
    parts = []
    for i in range(len(groups) - 1, -1, -1):
        g = groups[i]
        if g == 0:
            continue
        lead = i == len(groups) - 1
        parts.append(_under_1000(g, full=not lead))
        if units[i % 4]:
            parts.append(units[i % 4])
    return ' '.join(parts)


def _num(m: re.Match) -> str:
    raw = m.group(0)
    if re.fullmatch(r'\d{1,3}(\.\d{3})+', raw):  # 1.000.000 = một triệu
        return ' ' + number_words(int(raw.replace('.', ''))) + ' '
    if ',' in raw:  # 2,5 = hai phẩy năm
        a, b = raw.split(',', 1)
        return f" {number_words(int(a))} phẩy {' '.join(DIGITS[int(d)] for d in b) if b.startswith('0') else number_words(int(b))} "
    if len(raw) > 1 and raw.startswith('0'):  # số điện thoại/mã: đọc từng chữ số
        return ' ' + ' '.join(DIGITS[int(d)] for d in raw) + ' '
    return ' ' + number_words(int(raw)) + ' '


# "Khoản 2, 3, 4 Điều 27" đọc liền dễ dính số ("khoản 2,34,27") → lặp tên đơn vị: "khoản 2, khoản 3 và khoản 4 Điều 27".
_UNIT = r'(Khoản|khoản|Điều|điều|Điểm|điểm|Mục|mục|Chương|chương)'
_ITEM = r'(?:\d+[a-zđ]?|[a-zđ]|[IVX]{1,5})'
_LIST = re.compile(rf'\b{_UNIT}\s+({_ITEM}(?:\s*,\s*{_ITEM})*(?:\s*,?\s+(?:và|hoặc|đến)\s+{_ITEM})?)(?![\w/])')


# tên chữ cái khi đọc điểm của khoản ("điểm b" → "điểm bê"), theo cách đọc văn bản luật
LETTERS = {'a': 'a', 'b': 'bê', 'c': 'xê', 'd': 'dê', 'đ': 'đê', 'e': 'e', 'g': 'giê', 'h': 'hát', 'i': 'i', 'k': 'ca',
           'l': 'e lờ', 'm': 'em mờ', 'n': 'en nờ', 'o': 'o', 'p': 'pê', 'q': 'quy', 'r': 'e rờ', 's': 'ét xì', 't': 'tê',
           'u': 'u', 'v': 'vê', 'x': 'ích xì', 'y': 'i dài'}


def _expand_list(m: re.Match) -> str:
    unit, body = m.group(1), m.group(2)
    parts = re.split(r'\s*,?\s+(và|hoặc|đến)\s+|\s*,\s*', body)
    items, seps = parts[0::2], parts[1::2]
    if len(items) < 2 or any(not re.fullmatch(_ITEM, i) for i in items):
        return m.group(0)
    # chữ cái đơn chỉ hợp lệ sau "điểm"; số La Mã chỉ sau "chương/mục" → câu thường không bị đổi nhầm
    letters = any(re.fullmatch(r'[a-zđ]', i) for i in items)
    if letters and unit.lower() != 'điểm':
        return m.group(0)
    # danh sách chữ cái dài ("các điểm a, b, c, …, m và n"): không dính số nên giữ nguyên cho đỡ nặng nề
    if letters and len(items) > 3:
        return m.group(0)
    lower = unit.lower()
    out = f'{unit} {items[0]}'
    for sep, it in zip(seps, items[1:]):
        out += (f' {sep} ' if sep else ', ') + f'{lower} {it}'
    return out


def clean_source(t: str) -> str:
    """Bỏ khỏi LỜI ĐỌC phần máy móc trong ghi chú nguồn (đường dẫn Drive, tên tệp, tên miền, mã học phần/mã bài) —
    chữ hiển thị và tên tệp âm thanh không đổi. GIỮ trích dẫn luật và mọi cảnh báo độ tin cậy ("chưa đối chiếu nguyên văn",
    "quan điểm học thuật", "slide không phải giáo trình") vì người học cần phân biệt luật hiện hành với tài liệu giảng dạy."""
    t = re.sub(r'\s*\(Drive [^()]*(?:\([^()]*\)[^()]*)*(?:\)|$)', '', t)  # câu bị cắt giữa ngoặc: bỏ tới hết câu
    t = re.sub(r'\b(?:https?://)?[\w-]+(?:\.[\w-]+)*\.(?:vn|com|org|gov|net)\b[^\s,;)]*\s*:?', '', t)
    t = re.sub(r',?\s*\bDrive\s+HLU[^;(),]*', '', t)  # "…, Drive HLU/Kỳ II năm II/…" giữa ngoặc
    t = CODES.sub('', t)
    t = re.sub(r'\s*\(?[\w./-]+\.(?:txt|pdf|docx?|json|md)\)?', '', t)
    t = re.sub(r'\("[^"]*"\s*,\s*', '(', t)
    t = re.sub(r'\s*\("[^"]*"\)', '', t)  # mã bài trong ngoặc kép: ("VĐ 04 -HCPC")
    t = re.sub(r'\s*\(\s*\)', '', t)
    return t


def normalize(text: str) -> str:
    t = unicodedata.normalize('NFC', text)
    t = clean_source(t)
    t = _LIST.sub(_expand_list, t)
    # trích dẫn văn bản hợp nhất: "VBHN 67/VBHN-VPQH 2025" → "văn bản hợp nhất số 67 năm 2025" (không lặp "văn bản hợp nhất")
    t = re.sub(r'(?:\bVBHN|[Vv]ăn bản hợp nhất)\s*(\d+)/(?:\d{4}/)?VBHN-[A-ZĐ-]+(?:\s+(\d{4}))?', lambda m: f'văn bản hợp nhất số {m.group(1)}' + (f' năm {m.group(2)}' if m.group(2) else ''), t)
    t = re.sub(r'\bVBHN\s*(\d+)/(\d{4})\b', r'văn bản hợp nhất số \1 năm \2', t)
    # "điểm b", "điểm a, b và c": chữ cái đứng một mình sau "điểm" (và sau dấu phẩy/và/hoặc trong dãy điểm) → tên chữ cái
    t = re.sub(r'\b([Đđ]iểm)\s+([a-zđ](?:\s*(?:,|và|hoặc)\s*[a-zđ])*)(?![\w])',
               lambda m: m.group(1) + ' ' + re.sub(r'(?<![\w])[a-zđ](?![\w])', lambda x: LETTERS.get(x.group(0), x.group(0)), m.group(2)), t)
    t = re.sub(r'[\u3400-\u9fff]+', ' ', t)  # chữ Hán (trích cổ văn): bỏ, phần dịch tiếng Việt vẫn đọc
    t = re.sub(r'(?<=\d)\s*(ha|km|cm|m2|m²|kg|mL|ml|g)\b', lambda m: ' ' + UNITS[m.group(1)], t)
    t = re.sub(r'\b0(\d)\b', r'\1', t)  # 03 ha, 02 cổ đông, 01/7 → đọc như số, không đọc từng chữ số
    t = t.replace('[…]', ' ').replace('[...]', ' ')  # chỗ trống trong đáp án điền từ
    t = re.sub(r'(?<![\w,.])(\d{1,2})\s*-\s+(?=\w)', r'\1, ', t)  # mục đánh số "1- Phần vốn…" → "một, phần vốn…"
    t = re.sub(r'(?<=\d)\s*[–—-]\s*(?=\d)', ' đến ', t)  # khoảng số 24.000–90.000, 2019-2020
    t = re.sub(r'(?<=\d)\s*cm3\b', ' phân khối', t)
    t = re.sub(r'(?<=\w)\s*-\s+(?=\w)|\s+-\s+', ' ', t)  # "xã hội - nghề nghiệp", "kinh tế- xã hội" là một cụm
    # số hiệu văn bản: 51/2001/QH10 → số 51 năm 2001 QH 10; 102/VBHN-VPQH → số 102 VBHN-VPQH
    t = re.sub(r'(\d+)/(\d{4})/([A-ZĐ][\wĐđ-]*)', r'số \1 năm \2 \3', t)
    t = re.sub(r'(\d+)/([A-ZĐ])', r'số \1 \2', t)
    t = re.sub(r'([A-ZĐ]{2,})(\d+)', r'\1 \2', t)
    for k in sorted(ABBR, key=len, reverse=True):
        t = re.sub(rf'(?<![\w]){re.escape(k)}(?![\w])', ABBR[k], t)
    # số La Mã sau "chương/phần/mục/khoá"
    t = re.sub(r'\b(Chương|chương|Phần|phần|Mục|mục|Khoá|khoá|Khóa|khóa)\s+([IVXLC]{1,7})\b',
               lambda m: f'{m.group(1)} {number_words(roman(m.group(2)))}' if roman(m.group(2)) else m.group(0), t)
    t = re.sub(r'(\d+(?:[.,]\d+)*)\s*%', r'\1 phần trăm', t)
    t = re.sub(r'(\d+)/(\d+)/(\d{4})', lambda m: f'ngày {m.group(1)} tháng {m.group(2)} năm {m.group(3)}', t)
    t = re.sub(r'(\d+)/(\d+)', r'\1 trên \2', t)
    t = re.sub(r'\d{1,3}(?:\.\d{3})+|\d+,\d+|\d+', _num, t)
    t = t.replace('&', ' và ').replace('→', ', ').replace('…', '.').replace('(…)', '')
    for k, v in SYMBOLS.items():
        t = t.replace(k, v)
    t = re.sub(r'\s*[(\[]\s*', ', ', t)
    t = re.sub(r'\s*[)\]]\s*(?=[.,!?]|$)', '', t)
    t = re.sub(r'\s*[)\]]\s*', ', ', t)
    t = re.sub(r'[«»“”"\'{}]', ' ', t)
    t = t.replace('/', ' ')
    t = re.sub(r'\s*[–—]\s*', ', ', t)
    t = re.sub(r'(?<=\w)-(?=\w)', ' ', t)
    t = re.sub(r'[;:]', ',', t)
    t = re.sub(r'\s+([,.!?])', r'\1', t)
    t = re.sub(r',\s*,', ',', t)
    t = re.sub(r'\s+', ' ', t).strip().lower()
    t = re.sub(r'\bngày ngày\b', 'ngày', t)
    t = re.sub(r'^,\s*', '', t)
    t = re.sub(r',\s*([.!?])', r'\1', t)
    t = re.sub(r'(,\s*)+', ', ', t)
    t = re.sub(r'\.{2,}', '.', t)
    t = re.sub(r',\s*\.', '.', t)
    return t
