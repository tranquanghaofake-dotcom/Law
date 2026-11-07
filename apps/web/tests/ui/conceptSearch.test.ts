import { describe, expect, it } from 'vitest';
import { fold, matchConcept, searchOtherSubjects, type TermIndex } from '$lib/ui/conceptSearch';

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

describe('searchOtherSubjects', () => {
  const idx: TermIndex = [
    { id: 'dan-su', short: 'Dân sự 1', terms: { 'giao-dich': 'Giao dịch dân sự' } },
    { id: 'dan-su-2', short: 'Dân sự 2', terms: { 'dat-coc': 'Đặt cọc', 'cam-co': 'Cầm cố tài sản', 'the-chap': 'Thế chấp tài sản' } },
    { id: 'dat-dai', short: 'Đất đai', terms: { 'coc-dat': 'Đặt cọc mua đất' } },
  ];
  it('tìm theo tên không dấu ở các môn khác, bỏ môn đang xem, tên khớp đúng lên trước', () => {
    expect(searchOtherSubjects('dat coc', idx, 'dan-su')).toEqual([
      { subject: 'dan-su-2', short: 'Dân sự 2', id: 'dat-coc', term: 'Đặt cọc' },
      { subject: 'dat-dai', short: 'Đất đai', id: 'coc-dat', term: 'Đặt cọc mua đất' },
    ]);
    expect(searchOtherSubjects('dat coc', idx, 'dan-su-2').map((x) => x.id)).toEqual(['coc-dat']);
  });
  it('truy vấn < 2 ký tự → rỗng; giới hạn số kết quả', () => {
    expect(searchOtherSubjects('d', idx, 'x')).toEqual([]);
    expect(searchOtherSubjects('tai san', idx, 'x', 1).length).toBe(1);
  });
});
