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

describe('conceptSchema: memo (sơ đồ/mẹo nhớ do người soạn — diễn giải để học)', () => {
  const tree = [{ label: 'Chủ thể', children: ['Nhân dân', 'Quốc hội'] }, { label: 'Phân loại', children: ['chung', 'cụ thể'] }];
  it('chấp nhận memo có mẹo nhớ và cây 2–6 nhánh', () => {
    expect(conceptSchema.safeParse({ ...base, memo: { hook: 'Nhớ: chủ thể đặc biệt.', tree } }).success).toBe(true);
  });
  it('từ chối cây chỉ 1 nhánh hoặc nhãn quá 60 ký tự', () => {
    expect(conceptSchema.safeParse({ ...base, memo: { tree: [tree[0]] } }).success).toBe(false);
    expect(conceptSchema.safeParse({ ...base, memo: { tree: [tree[0], { label: 'x'.repeat(61) }] } }).success).toBe(false);
  });
  it('từ chối memo rỗng (không hook, không cây)', () => {
    expect(conceptSchema.safeParse({ ...base, memo: {} }).success).toBe(false);
  });
});

describe('memo.gist + kind — luật viết lời thường (thí điểm 05/11/2026)', () => {
  const tree = [{ label: 'Cao nhất', children: ['Hiến pháp'] }, { label: 'Dưới', children: ['Luật'] }];
  const ok = { gist: 'Văn bản luật có thứ bậc: cấp dưới không được trái cấp trên.', kind: 'ladder', hook: 'Cao nhất là Hiến pháp.', tree };
  it('chấp nhận gist ngắn, lời thường, kind hợp lệ', () => {
    expect(conceptSchema.safeParse({ ...base, memo: ok }).success).toBe(true);
  });
  it('từ chối gist quá 25 chữ', () => {
    const r = conceptSchema.safeParse({ ...base, memo: { ...ok, gist: 'chữ '.repeat(26).trim() + '.' } });
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.error?.issues)).toMatch(/25 chữ/);
  });
  it.each([
    ['viết tắt trong gist', { gist: 'Do UBTVQH ban hành.' }],
    ['IN HOA trong mẹo nhớ', { hook: 'Nhớ HIẾN PHÁP cao nhất.' }],
    ['dấu (…) trong gist', { gist: 'Hiến pháp (…) cao nhất.' }],
    ['viết tắt trong nhánh', { tree: [{ label: 'Trung ương', children: ['VBQPPL'] }, tree[1]] }],
  ])('có gist thì từ chối %s', (_n, patch) => {
    const r = conceptSchema.safeParse({ ...base, memo: { ...ok, ...patch } });
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.error?.issues)).toMatch(/lời thường/);
  });
  it('từ chối kind lạ', () => {
    expect(conceptSchema.safeParse({ ...base, memo: { ...ok, kind: 'pie' } }).success).toBe(false);
  });
  it('memo cũ chưa có gist vẫn hợp lệ (chưa áp luật viết)', () => {
    expect(conceptSchema.safeParse({ ...base, memo: { hook: 'Nhớ HIẾN PHÁP.', tree } }).success).toBe(true);
  });
});
