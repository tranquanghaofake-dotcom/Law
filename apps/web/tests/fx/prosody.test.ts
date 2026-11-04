import { describe, expect, it } from 'vitest';
import { phrases, sentences, textKey } from '$lib/fx/prosody';

describe('prosody — tách cụm và nhấn nhá', () => {
  it('tách theo dấu câu, giữ nội dung, nghỉ câu dài hơn nghỉ phẩy', () => {
    const p = phrases('Hiến pháp là luật cơ bản, có hiệu lực pháp lý cao nhất. Mọi văn bản phải phù hợp.');
    expect(p.map((x) => x.text)).toEqual(['Hiến pháp là luật cơ bản,', 'có hiệu lực pháp lý cao nhất.', 'Mọi văn bản phải phù hợp.']);
    expect(p[0].pauseAfter).toBeLessThan(p[1].pauseAfter);
  });
  it('cụm cuối câu hạ giọng, câu hỏi lên giọng', () => {
    const [a, b] = phrases('Dù anh là ai, thì anh vẫn phải tuân theo pháp luật.');
    expect(b.pitch).toBeLessThan(a.pitch);
    const q = phrases('Dù anh là ai?');
    expect(q[0].pitch).toBeGreaterThan(1);
  });
  it('câu dài không dấu phẩy được ngắt trước từ nối', () => {
    const p = phrases('Người lao động được hưởng trợ cấp thất nghiệp khi đã đóng bảo hiểm thất nghiệp đủ mười hai tháng trở lên.');
    expect(p.length).toBeGreaterThan(1);
    expect(p[1].text.startsWith('khi')).toBe(true);
  });
  it('"Chính xác." vui, cao giọng; "Chưa đúng." trầm, chậm', () => {
    const [ok] = phrases('Chính xác.');
    const [no] = phrases('Chưa đúng.');
    expect(ok.pitch).toBeGreaterThan(no.pitch);
    expect(ok.rate).toBeGreaterThan(no.rate);
  });
  it('cụm có từ khoá phủ định/bắt buộc đọc chậm hơn để nhấn', () => {
    const [plain, strong] = phrases('Cá nhân có quyền tự do kinh doanh, nhưng không được kinh doanh ngành nghề bị cấm.');
    expect(strong.rate).toBeLessThan(plain.rate);
  });
  it('cao độ giữ trong khoảng an toàn cho tiếng Việt có thanh điệu', () => {
    for (const p of phrases('A? B! C, d. Không được. Chính xác. Chưa đúng.')) {
      expect(p.pitch).toBeGreaterThanOrEqual(0.85);
      expect(p.pitch).toBeLessThanOrEqual(1.2);
    }
  });
  it('chuỗi rỗng → không cụm nào', () => {
    expect(phrases('   ')).toEqual([]);
  });
  it('sentences tách câu; textKey ổn định, bỏ khác biệt khoảng trắng', () => {
    expect(sentences('Một. Hai?  Ba')).toEqual(['Một.', 'Hai?', 'Ba']);
    expect(textKey('Chính  xác.')).toBe(textKey(' Chính xác. '));
    expect(textKey('Chính xác.')).not.toBe(textKey('Chưa đúng.'));
    expect(textKey('x')).toMatch(/^[0-9a-f]{8}$/);
  });
});
