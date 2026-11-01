import { describe, expect, it } from 'vitest';
import { fold, matchConcept } from '$lib/ui/conceptSearch';

const c = { term: 'Chủ quyền Nhân dân', definition: 'Tất cả quyền lực nhà nước thuộc về Nhân dân', plain: 'Dân là gốc', keywords: ['bầu cử', 'trưng cầu ý dân'] };

describe('tìm khái niệm', () => {
  it('fold bỏ dấu, đ → d, chữ thường, gộp khoảng trắng', () => {
    expect(fold('  Đặt   CỌC ')).toBe('dat coc');
  });
  it('khớp không dấu trên tên, định nghĩa, từ khoá', () => {
    expect(matchConcept(c, 'chu quyen')).toBe(true);
    expect(matchConcept(c, 'quyền lực')).toBe(true);
    expect(matchConcept(c, 'trung cau')).toBe(true);
  });
  it('mọi từ trong truy vấn phải xuất hiện; truy vấn rỗng khớp hết', () => {
    expect(matchConcept(c, 'nhan dan bau')).toBe(true);
    expect(matchConcept(c, 'nhan dan toa an')).toBe(false);
    expect(matchConcept(c, '   ')).toBe(true);
  });
});
