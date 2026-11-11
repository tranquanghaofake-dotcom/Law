import { describe, expect, it } from 'vitest';
import { matchRank, searchAll, type SearchSource } from '$lib/ui/globalSearch';

const src: SearchSource = {
  terms: [
    { id: 'hien-phap', short: 'Hiến pháp', terms: { 'chu-quyen-nhan-dan': 'Chủ quyền nhân dân', 'quyen-con-nguoi': 'Quyền con người', 'chu-quyen-quoc-gia': 'Chủ quyền quốc gia' } },
    { id: 'dan-su', short: 'Dân sự', terms: { 'dat-coc': 'Đặt cọc', 'quyen-so-huu': 'Quyền sở hữu', 'thua-ke-the-vi': 'Thừa kế thế vị', 'chu-so-huu': 'Chủ sở hữu' } },
  ],
  subjects: [
    { id: 'hien-phap', title: 'Luật Hiến pháp', short: 'Hiến pháp' },
    { id: 'dan-su', title: 'Luật Dân sự 1', short: 'Dân sự' },
  ],
  sets: [
    { id: 'dat-coc', title: 'Đặt cọc', subtitle: 'Biện pháp bảo đảm thực hiện nghĩa vụ', group: 'dan-su' },
    { id: 'quan-he-phap-luat', title: 'Quan hệ pháp luật', subtitle: 'Chủ thể, năng lực pháp luật', group: 'pldc' },
  ],
};

describe('matchRank — xếp hạng mức khớp sau khi bỏ dấu', () => {
  it('trùng hẳn 0, bắt đầu bằng 1, khớp đầu từ 2, có mặt 3, không khớp -1', () => {
    expect(matchRank('Đặt cọc', 'dat coc')).toBe(0);
    expect(matchRank('Chủ quyền nhân dân', 'chu quyen')).toBe(1);
    expect(matchRank('Chủ quyền nhân dân', 'nhan dan')).toBe(2);
    expect(matchRank('Chủ quyền nhân dân', 'uyen')).toBe(3);
    expect(matchRank('Chủ quyền nhân dân', 'hop dong')).toBe(-1);
  });
  it('không phụ thuộc thứ tự từ', () => {
    expect(matchRank('Chủ quyền nhân dân', 'dan chu')).toBe(2);
  });
});

describe('searchAll — tìm khái niệm, môn, bộ đề ở mọi môn', () => {
  it('truy vấn dưới 2 ký tự trả rỗng', () => {
    const r = searchAll(' c ', src);
    expect(r.concepts).toEqual([]);
    expect(r.subjects).toEqual([]);
    expect(r.sets).toEqual([]);
    expect(r.total).toBe(0);
  });

  it('gõ không dấu vẫn ra khái niệm, kèm môn của nó', () => {
    const r = searchAll('chu quyen', src);
    expect(r.concepts.map((h) => h.term)).toEqual(['Chủ quyền nhân dân', 'Chủ quyền quốc gia']);
    expect(r.concepts[0]).toEqual({ subject: 'hien-phap', short: 'Hiến pháp', id: 'chu-quyen-nhan-dan', term: 'Chủ quyền nhân dân' });
  });

  it('tên trùng hẳn đứng trước tên bắt đầu bằng, rồi tới tên chỉ chứa', () => {
    const r = searchAll('quyen', src);
    // "Quyền con người", "Quyền sở hữu" bắt đầu bằng "quyen" (ngắn hơn trước); "Chủ quyền …" chỉ khớp đầu từ
    expect(r.concepts.map((h) => h.term)).toEqual(['Quyền sở hữu', 'Quyền con người', 'Chủ quyền nhân dân', 'Chủ quyền quốc gia']);
  });

  it('một truy vấn ra cả khái niệm lẫn bộ đề cùng tên', () => {
    const r = searchAll('dat coc', src);
    expect(r.concepts.map((h) => h.id)).toEqual(['dat-coc']);
    expect(r.sets.map((s) => s.id)).toEqual(['dat-coc']);
    expect(r.total).toBe(2);
  });

  it('tìm môn theo tên hoặc tên ngắn; bộ đề theo tên rồi tới mô tả', () => {
    expect(searchAll('hien phap', src).subjects.map((s) => s.id)).toEqual(['hien-phap']);
    expect(searchAll('nang luc', src).sets.map((s) => s.id)).toEqual(['quan-he-phap-luat']);
  });

  it('giới hạn số dòng nhưng vẫn báo tổng số khái niệm khớp', () => {
    const r = searchAll('chu', src, { concepts: 2, subjects: 3, sets: 4 });
    expect(r.concepts).toHaveLength(2);
    expect(r.conceptTotal).toBe(3);
  });
});
