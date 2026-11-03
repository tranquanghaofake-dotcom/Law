import { describe, expect, it } from 'vitest';
import { coverTitle, wrapTitle, monogramFor, subjectHaystack, matchSubject } from '$lib/ui/bookCover';

describe('bìa sách giáo trình (spec phần nhìn đợt 4 §3.2)', () => {
  it('coverTitle bỏ phần trong ngoặc ở cuối', () => {
    expect(coverTitle('Luật Thương mại 1 (doanh nghiệp, hợp tác xã, phá sản)')).toBe('Luật Thương mại 1');
    expect(coverTitle('Luật Hiến pháp')).toBe('Luật Hiến pháp');
  });
  it('wrapTitle: ngắt theo từ, không quá maxChars mỗi dòng, tối đa maxLines, dòng cuối có …', () => {
    expect(wrapTitle('Luật Hiến pháp', 14)).toEqual(['Luật Hiến pháp']);
    expect(wrapTitle('Lý luận chung về Nhà nước và Pháp luật', 14)).toEqual(['Lý luận chung', 'về Nhà nước và', 'Pháp luật']);
    const long = wrapTitle('Một hai ba bốn năm sáu bảy tám chín mười mười một', 10, 2);
    expect(long).toHaveLength(2);
    expect(long[1].endsWith('…')).toBe(true);
    expect(wrapTitle('Siêuuuuuuuuuuuuuuudài', 8)).toEqual(['Siêuuuu…']);
  });
  it('monogramFor: chữ lồng từ tên ngắn, giữ số học phần, có bảng ghi đè cho tên viết tắt', () => {
    expect(monogramFor({ id: 'hien-phap', short: 'Hiến pháp' })).toBe('HP');
    expect(monogramFor({ id: 'dan-su', short: 'Dân sự 1' })).toBe('DS 1');
    expect(monogramFor({ id: 'lao-dong-2', short: 'Lao động 2' })).toBe('LĐ 2');
    expect(monogramFor({ id: 'to-tung-dan-su', short: 'TTDS' })).toBe('TTDS');
    expect(monogramFor({ id: 'ly-luan-nn-pl', short: 'Lý luận NN&PL' })).toBe('LL');
    expect(monogramFor({ id: 'tai-chinh-doanh-nghiep', short: 'Tài chính DN' })).toBe('TCDN');
    expect(monogramFor({ id: 'mon-la', short: 'Môn Lạ Nào Đó Dài' }).length).toBeLessThanOrEqual(4);
  });
  it('tìm không dấu, có chữ cái đầu: "ds" ra Dân sự 1, Dân sự 2, Tố tụng dân sự', () => {
    const ds1 = { id: 'dan-su', title: 'Luật Dân sự 1', short: 'Dân sự 1' };
    const ds2 = { id: 'dan-su-2', title: 'Luật Dân sự 2', short: 'Dân sự 2' };
    const ttds = { id: 'to-tung-dan-su', title: 'Luật Tố tụng dân sự', short: 'TTDS' };
    const hp = { id: 'hien-phap', title: 'Luật Hiến pháp', short: 'Hiến pháp' };
    const all = [ds1, ds2, ttds, hp];
    expect(all.filter((s) => matchSubject(s, 'ds')).map((s) => s.id)).toEqual(['dan-su', 'dan-su-2', 'to-tung-dan-su']);
    expect(all.filter((s) => matchSubject(s, 'dan su 2')).map((s) => s.id)).toEqual(['dan-su-2']);
    expect(all.filter((s) => matchSubject(s, 'hien')).map((s) => s.id)).toEqual(['hien-phap']);
    expect(all.filter((s) => matchSubject(s, '')).length).toBe(4);
    expect(subjectHaystack(hp)).toContain('hp');
  });
});
