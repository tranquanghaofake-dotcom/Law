import { describe, expect, it } from 'vitest';
import { chapterSchema, conceptSchema } from '../src/schema';

const base = {
  id: 'tai-san', subject: 'dan-su', chapter: 'tai-san', term: 'Tài sản',
  definition: 'Tài sản là vật, tiền, giấy tờ có giá và quyền tài sản.',
  plain: 'Mọi thứ có giá trị mà pháp luật cho phép sở hữu.',
  example: 'Xe máy, tiền trong tài khoản, quyền đòi nợ.',
  source: { kind: 'statute', cite: 'Khoản 1 Điều 105 BLDS 2015', url: 'https://vbpl.vn/x' },
  checked: '2026-10-31', confusables: ['quyen-tai-san'], keywords: ['vật', 'tiền'],
  items: [
    { type: 'mcq', level: 1, q: 'Tài sản gồm?', options: ['A', 'B', 'C', 'D'], answer: 0, explain: 'Điều 105.' },
    { type: 'cloze', level: 3, text: 'Tài sản là {{vật}}, tiền, giấy tờ có giá và quyền tài sản.' },
    { type: 'case', level: 4, q: 'Tình huống?', options: ['A', 'B', 'C', 'D'], answer: 1, explain: 'Vì…' },
  ],
};

describe('conceptSchema', () => {
  it('chấp nhận khái niệm hợp lệ', () => {
    expect(conceptSchema.safeParse(base).success).toBe(true);
  });
  it('từ chối mcq không đủ 4 phương án', () => {
    const bad = { ...base, items: [{ ...base.items[0], options: ['A', 'B', 'C'] }, base.items[1], base.items[2]] };
    const r = conceptSchema.safeParse(bad);
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.error?.issues)).toMatch(/4 phương án/);
  });
  it('từ chối cloze không có chỗ trống', () => {
    const bad = { ...base, items: [base.items[0], { type: 'cloze', level: 3, text: 'Không có chỗ trống.' }, base.items[2]] };
    expect(conceptSchema.safeParse(bad).success).toBe(false);
  });
  it('từ chối ngày checked sai định dạng', () => {
    expect(conceptSchema.safeParse({ ...base, checked: '31/10/2026' }).success).toBe(false);
  });
  it('từ chối khái niệm thiếu item bậc 3', () => {
    const bad = { ...base, items: [base.items[0], base.items[2]] };
    expect(conceptSchema.safeParse(bad).success).toBe(false);
  });
});

describe('mở rộng cho bộ đề theo giáo trình', () => {
  it('khái niệm chấp nhận trường note (cập nhật luật so với giáo trình)', () => {
    expect(conceptSchema.safeParse({ ...base, note: 'Luật 56/2024/QH15 đã sửa điểm này.' }).success).toBe(true);
  });
  it('từ chối note rỗng', () => {
    expect(conceptSchema.safeParse({ ...base, note: '' }).success).toBe(false);
  });
  it('chương chấp nhận cờ advanced (mục Nâng cao, ngoài giáo trình)', () => {
    const ch = { id: 'nang-cao', title: 'Nâng cao', advanced: true, lessons: [{ id: 'nc-1', title: 'x', concepts: ['a'] }] };
    expect(chapterSchema.safeParse(ch).success).toBe(true);
    expect(chapterSchema.safeParse({ ...ch, advanced: 'có' }).success).toBe(false);
  });
});
