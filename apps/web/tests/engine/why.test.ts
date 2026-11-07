import { describe, expect, it } from 'vitest';
import type { Concept } from '$lib/content/types';
import type { StepItem } from '$lib/engine/session';
import { clauses, isCiteOnly, keyOf, marksIn, pickedWhy, relevantClause, segments, whyOf } from '$lib/engine/why';

const c = (o: Partial<Concept> = {}): Concept => ({
  id: 'thu-viec', subject: 'lao-dong', chapter: 'c1', term: 'Thời gian thử việc',
  definition: 'Thời gian thử việc do hai bên thỏa thuận nhưng chỉ được thử việc một lần đối với một công việc và bảo đảm điều kiện sau đây: 1. Không quá 180 ngày đối với công việc của người quản lý doanh nghiệp; 2. Không quá 60 ngày đối với công việc có chức danh nghề nghiệp cần trình độ cao đẳng trở lên; 3. Không quá 30 ngày đối với công việc cần trình độ trung cấp.',
  plain: 'Chỉ thử việc MỘT LẦN cho một công việc. Mốc: 180 ngày, 60 ngày, 30 ngày.', example: 'e',
  source: { kind: 'statute', cite: 'Điều 25' }, checked: '2026-11-01', confusables: [], keywords: ['chỉ thử việc một lần', '60 ngày', '30 ngày'], items: [], ...o,
});
const mcq = (q: string, ans: string, explain = 'Điều 25.'): StepItem => ({ type: 'mcq', level: 1, q, options: ['A', ans, 'C'], answer: 1, explain });

describe('isCiteOnly: explain chỉ là trích dẫn điều khoản', () => {
  it.each(['Khoản 2 Điều 107.', 'Điều 25.', 'Điểm a khoản 1 Điều 20; điểm b khoản 2 Điều 21', '', 'Điều 5, 6.'])('%j là trích dẫn', (s) => expect(isCiteOnly(s)).toBe(true));
  it('lời giải thích thật không bị coi là trích dẫn', () => {
    expect(isCiteOnly('Người lao động có quyền đơn phương chấm dứt hợp đồng, nhưng phải báo trước theo thời hạn luật định (Điều 35).')).toBe(false);
  });
});

describe('relevantClause: trích đúng đoạn định nghĩa liên quan', () => {
  it('chia mục đánh số thành đoạn riêng', () => {
    expect(clauses(c().definition).length).toBeGreaterThanOrEqual(4);
  });
  it('chọn đoạn trùng nhiều tiếng nhất với câu hỏi + đáp án, kèm vế mở đầu cho mục đánh số', () => {
    const t = relevantClause(c().definition, 'Thử việc người quản lý doanh nghiệp tối đa bao nhiêu ngày? 180 ngày', 240, 'Thời gian thử việc');
    expect(t).toContain('180 ngày');
    expect(t).toContain('người quản lý doanh nghiệp');
    expect(t.startsWith('Thời gian thử việc')).toBe(true);
    expect(t).not.toContain('60 ngày');
  });
  it('không trùng gì thì lấy đoạn đầu; luôn là chữ nguyên văn của định nghĩa (không thêm nội dung)', () => {
    const t = relevantClause(c().definition, 'xyz');
    expect(c().definition.includes(t.replace(/ \(…\)$| …$/, ''))).toBe(true);
  });
  it('keyOf lấy câu hỏi và đáp án đúng', () => {
    expect(keyOf(mcq('Hỏi gì?', 'Đáp án đúng'))).toBe('Hỏi gì? Đáp án đúng');
    expect(keyOf({ type: 'truefalse', level: 4, statement: 'S', answer: true, explain: '' })).toBe('S');
  });
});

describe('marksIn / segments: in đậm dấu hiệu nằm nguyên văn', () => {
  it('chỉ lấy dấu hiệu có đúng trong đoạn, giữ hoa thường của đoạn', () => {
    expect(marksIn('Chỉ thử việc một lần, không quá 60 ngày', ['chỉ thử việc một lần', '60 ngày', '180 ngày quản lý'])).toEqual(['Chỉ thử việc một lần', '60 ngày']);
  });
  it('segments chia đúng khúc và ghép lại ra đúng chuỗi gốc', () => {
    const s = segments('Chỉ thử việc một lần, không quá 60 ngày', ['Chỉ thử việc một lần', '60 ngày']);
    expect(s.map((x) => x.t).join('')).toBe('Chỉ thử việc một lần, không quá 60 ngày');
    expect(s.filter((x) => x.b).map((x) => x.t)).toEqual(['Chỉ thử việc một lần', '60 ngày']);
  });
});

describe('whyOf', () => {
  it('câu đúng: chỉ một dòng dấu hiệu quyết định (tối đa 3); không dấu hiệu thì null', () => {
    const w = whyOf(c(), mcq('Q', 'A'), { correct: true });
    expect(w?.signs).toEqual(['chỉ thử việc một lần', '60 ngày', '30 ngày']);
    expect(w?.excerpt).toBeNull();
    expect(whyOf(c({ keywords: [] }), mcq('Q', 'A'), { correct: true })).toBeNull();
  });
  it('câu sai: trích định nghĩa, dấu hiệu in đậm; thêm giải nghĩa gọn khi explain chỉ là trích dẫn', () => {
    const w = whyOf(c(), mcq('Thử việc cao đẳng', '60 ngày', 'Điều 25.'), { correct: false, explain: 'Điều 25.' })!;
    expect(w.citeOnly).toBe(true);
    expect(w.excerpt!.text).toContain('60 ngày');
    expect(w.excerpt!.marks).toContain('60 ngày');
    expect(w.plain).toBe('Chỉ thử việc MỘT LẦN cho một công việc.');
  });
  it('explain đủ ý và đoạn trích đủ dài thì không thêm giải nghĩa', () => {
    const w = whyOf(c(), mcq('Thử việc cao đẳng', '60 ngày'), { correct: false, explain: 'Mức 60 ngày áp dụng với công việc cần trình độ cao đẳng trở lên theo Điều 25.' })!;
    expect(w.citeOnly).toBe(false);
    expect(w.plain).toBeNull();
  });
  it('"dễ nhầm" chỉ khi dữ liệu đủ: cả hai bên ≥ 2 dấu hiệu; chọn đúng khái niệm đó thì picked', () => {
    const other = c({ id: 'hd', term: 'Hợp đồng thử việc', keywords: ['hủy bỏ không báo trước', 'lương ít nhất 85 %'] });
    const w = whyOf(c(), mcq('Q', 'A'), { correct: false, chosen: 'Hợp đồng thử việc', confusables: [other] })!;
    expect(w.mixup).toEqual({ id: 'hd', term: 'Hợp đồng thử việc', theirs: ['hủy bỏ không báo trước', 'lương ít nhất 85 %'], ours: ['chỉ thử việc một lần', '60 ngày', '30 ngày'], picked: true });
    expect(whyOf(c(), mcq('Q', 'A'), { correct: false, confusables: [other] })!.mixup).toBeNull(); // không chọn, không được nhắc → không gán
    expect(whyOf(c(), mcq('Hợp đồng thử việc khác gì?', 'A'), { correct: false, confusables: [other] })!.mixup?.picked).toBe(false); // có nhắc tên
    expect(whyOf(c(), mcq('Q', 'A'), { correct: false, confusables: [c({ id: 'x', keywords: ['một'] })] })!.mixup).toBeNull();
    expect(whyOf(c({ keywords: ['một'] }), mcq('Q', 'A'), { correct: false, confusables: [other] })!.mixup).toBeNull();
  });
  it('mọi chữ hiển thị đều lấy từ dữ liệu: đoạn trích nằm trong định nghĩa, giải nghĩa nằm trong plain', () => {
    const w = whyOf(c(), mcq('Q 30 ngày', '30 ngày', 'Điều 25.'), { correct: false, explain: 'Điều 25.' })!;
    const body = w.excerpt!.text.replace(/ \(…\)$| …$/, '').split(/ (?=\d+\. )/).pop()!;
    expect(c().definition).toContain(body.slice(0, 20));
    expect(c().plain).toContain(w.plain!);
  });
  it('vì sao phương án sai: chọn nhiễu có `why` thì trả đúng câu giải thích của phương án đó', () => {
    const item: StepItem = { type: 'mcq', level: 1, q: 'Q', options: ['A', 'B', 'C', 'D'], answer: 1, explain: 'Điều 25.', why: ['A sai vì x.', 'B đúng.', 'C sai vì y.', 'D sai vì z.'] };
    expect(whyOf(c(), item, { correct: false, chosen: 'C' })!.wrong).toEqual({ option: 'C', text: 'C sai vì y.' });
    expect(whyOf(c(), item, { correct: false, chosen: 'không có' })!.wrong).toBeNull();
    expect(whyOf(c(), mcq('Q', 'A'), { correct: false, chosen: 'C' })!.wrong).toBeNull(); // không có why
    expect(whyOf(c(), item, { correct: true, chosen: 'B' })?.wrong ?? null).toBeNull();
  });
});

describe('pickedWhy: lời giải thích phương án đã chọn (dùng cho bộ đề)', () => {
  const q = { options: ['A', 'B', 'C', 'D'], answer: 2, why: ['Sai: a.', 'Sai: b.', 'Đúng: c.', 'Sai: d.'] };
  it('chọn sai thì trả câu why đúng vị trí gốc, kể cả khi đáp án không ở đầu', () => {
    expect(pickedWhy(q, 'B')).toEqual({ option: 'B', text: 'Sai: b.' });
    expect(pickedWhy(q, 'D')).toEqual({ option: 'D', text: 'Sai: d.' });
  });
  it('chọn đúng, không có why hoặc phương án lạ thì null', () => {
    expect(pickedWhy(q, 'C')).toBeNull();
    expect(pickedWhy({ ...q, why: undefined }, 'B')).toBeNull();
    expect(pickedWhy(q, 'X')).toBeNull();
    expect(pickedWhy(q, undefined)).toBeNull();
  });
});
