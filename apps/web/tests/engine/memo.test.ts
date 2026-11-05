import { describe, expect, it } from 'vitest';
import type { Concept } from '$lib/content/types';
import type { StepItem } from '$lib/engine/session';
import { branchesOf, emphasis, gistOf } from '$lib/engine/memo';

const c = (o: Partial<Concept> = {}): Concept => ({
  id: 'qh', subject: 'hien-phap', chapter: 'c1', term: 'Quan hệ pháp luật Hiến pháp',
  definition: 'Quan hệ pháp luật Hiến pháp là những quan hệ xã hội thuộc đối tượng điều chỉnh của ngành luật Hiến pháp.',
  plain: 'Đặc điểm theo giáo trình: CHỦ THỂ đặc biệt, có những chủ thể chỉ xuất hiện trong luật Hiến pháp: Nhân dân, Quốc hội, cử tri. Có quan hệ chung và quan hệ cụ thể.',
  example: 'Cử tri đi bỏ phiếu.', source: { kind: 'statute', cite: 'Điều 1' }, checked: '2026-11-01', confusables: [],
  keywords: ['chủ thể đặc biệt', 'Nhân dân, Quốc hội, cử tri', 'quan hệ chung và quan hệ cụ thể', 'quy phạm và sự kiện pháp lý', 'thừa'], items: [], ...o,
});
const mcq = (explain: string): StepItem => ({ type: 'mcq', level: 1, q: 'q', options: ['A', 'B'], answer: 0, explain });

describe('emphasis: chữ IN HOA tác giả dùng để nhấn → khúc in đậm', () => {
  it('tách cụm in hoa nhiều tiếng thành một khúc nhấn', () => {
    expect(emphasis('Đặc điểm: CHỦ THỂ đặc biệt')).toEqual([{ t: 'Đặc điểm: ', b: false }, { t: 'CHỦ THỂ', b: true }, { t: ' đặc biệt', b: false }]);
  });
  it('không nhấn chữ hoa đầu câu, số La Mã hay chữ viết tắt hai chữ cái', () => {
    for (const s of ['Chương II Hiến pháp', 'Quốc hội họp', 'theo NQ 203']) expect(emphasis(s).every((x) => !x.b), s).toBe(true);
  });
});

describe('gistOf: lời "nói gọn" thay cho cả đoạn sớ', () => {
  it('giải thích dài → câu đầu làm lời gọn, phần còn lại để mở thêm', () => {
    const g = gistOf(c(), mcq('Câu một giải thích đủ dài để hiểu ý chính. Câu hai bổ sung chi tiết dài dòng hơn nữa.'));
    expect(g.lead).toBe('Câu một giải thích đủ dài để hiểu ý chính.');
    expect(g.full).toContain('Câu hai');
  });
  it('giải thích chỉ là số điều → lấy câu đầu của plain, không có phần mở thêm là chính trích dẫn', () => {
    const g = gistOf(c(), mcq('Điều 1.'));
    expect(g.lead.startsWith('Đặc điểm theo giáo trình')).toBe(true);
    expect(g.full).toBeNull();
  });
  it('lời gọn không quá 170 ký tự', () => {
    const g = gistOf(c(), mcq(`${'chữ '.repeat(80)}hết.`));
    expect(g.lead.length).toBeLessThanOrEqual(170);
    expect(g.full).not.toBeNull();
  });
  it('giải thích ngắn một câu → không có phần mở thêm', () => {
    expect(gistOf(c(), mcq('Chủ thể đặc biệt là dấu hiệu chính của quan hệ này.')).full).toBeNull();
  });
});

describe('branchesOf: nhánh sơ đồ', () => {
  it('mặc định: tối đa 4 dấu hiệu, mỗi dấu hiệu một nhánh lá, nhãn "tự động"', () => {
    const b = branchesOf(c());
    expect(b.authored).toBe(false);
    expect(b.nodes.map((n) => n.label)).toEqual(['chủ thể đặc biệt', 'Nhân dân, Quốc hội, cử tri', 'quan hệ chung và quan hệ cụ thể', 'quy phạm và sự kiện pháp lý']);
  });
  it('không có dấu hiệu → không có nhánh', () => {
    expect(branchesOf(c({ keywords: [' '] })).nodes).toEqual([]);
  });
});
