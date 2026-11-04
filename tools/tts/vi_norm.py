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
}
ROMAN = {'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12,
         'XIII': 13, 'XIV': 14, 'XV': 15, 'XVI': 16, 'XVII': 17, 'XVIII': 18, 'XIX': 19, 'XX': 20}
DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']


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


def normalize(text: str) -> str:
    t = unicodedata.normalize('NFC', text)
    # số hiệu văn bản: 51/2001/QH10 → số 51 năm 2001 QH 10; 102/VBHN-VPQH → số 102 VBHN-VPQH
    t = re.sub(r'(\d+)/(\d{4})/([A-ZĐ][\wĐđ-]*)', r'số \1 năm \2 \3', t)
    t = re.sub(r'(\d+)/([A-ZĐ])', r'số \1 \2', t)
    t = re.sub(r'([A-ZĐ]{2,})(\d+)', r'\1 \2', t)
    for k in sorted(ABBR, key=len, reverse=True):
        t = re.sub(rf'(?<![\w]){re.escape(k)}(?![\w])', ABBR[k], t)
    # số La Mã sau "chương/phần/mục/khoá"
    t = re.sub(r'\b(Chương|chương|Phần|phần|Mục|mục|Khoá|khoá|Khóa|khóa)\s+([IVX]{1,6})\b',
               lambda m: f'{m.group(1)} {number_words(ROMAN.get(m.group(2), 0)) if m.group(2) in ROMAN else m.group(2)}', t)
    t = re.sub(r'(\d+(?:[.,]\d+)*)\s*%', r'\1 phần trăm', t)
    t = re.sub(r'(\d+)/(\d+)/(\d{4})', lambda m: f'ngày {m.group(1)} tháng {m.group(2)} năm {m.group(3)}', t)
    t = re.sub(r'(\d+)/(\d+)', r'\1 trên \2', t)
    t = re.sub(r'\d{1,3}(?:\.\d{3})+|\d+,\d+|\d+', _num, t)
    t = t.replace('&', ' và ').replace('→', ', ').replace('…', '.').replace('(…)', '')
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
    return t
