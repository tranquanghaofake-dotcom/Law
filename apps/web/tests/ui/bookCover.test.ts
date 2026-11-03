import { describe, expect, it } from 'vitest';
import { coverTitle, coverParts, fitTitle, subjectHaystack, matchSubject } from '$lib/ui/bookCover';
import { mixWhite, mixBlack } from '$lib/ui/shelves';

const OPTS = { maxWidth: 100, maxLines: 3, maxSize: 17, minSize: 10, charW: 0.62 };
/** Bề rộng ước tính của dòng dài nhất ở cỡ đã chọn. */
const widest = (r: { lines: string[]; size: number }) => Math.max(...r.lines.map((l) => l.length)) * OPTS.charW * r.size;

describe('bìa sách giáo trình (spec phần nhìn đợt 4 §3.2, bìa v2)', () => {
  it('coverTitle bỏ phần trong ngoặc ở cuối', () => {
    expect(coverTitle('Luật Thương mại 1 (doanh nghiệp, hợp tác xã, phá sản)')).toBe('Luật Thương mại 1');
    expect(coverTitle('Luật Hiến pháp')).toBe('Luật Hiến pháp');
  });
  it('coverParts: tách dòng nhỏ "LUẬT"/"PHÁP LUẬT", tên môn và số học phần', () => {
    expect(coverParts('Luật Dân sự 1')).toEqual({ kicker: 'LUẬT', name: 'Dân sự', num: '1' });
    expect(coverParts('Luật Thương mại 2')).toEqual({ kicker: 'LUẬT', name: 'Thương mại', num: '2' });
    expect(coverParts('Luật Hiến pháp')).toEqual({ kicker: 'LUẬT', name: 'Hiến pháp', num: null });
    expect(coverParts('Pháp luật tài chính doanh nghiệp')).toEqual({ kicker: 'PHÁP LUẬT', name: 'tài chính doanh nghiệp', num: null });
    expect(coverParts('Lý luận chung về Nhà nước và Pháp luật')).toEqual({ kicker: '', name: 'Lý luận chung về Nhà nước và Pháp luật', num: null });
    expect(coverParts('Luật')).toEqual({ kicker: '', name: 'Luật', num: null });
  });
  it('fitTitle: tên ngắn một dòng cỡ tối đa, in hoa', () => {
    expect(fitTitle('Hiến pháp', OPTS)).toEqual({ lines: ['HIẾN PHÁP'], size: 17 });
  });
  it('fitTitle: "Tố tụng dân sự" xuống 2 dòng để giữ chữ to', () => {
    const r = fitTitle('Tố tụng dân sự', OPTS);
    expect(r.lines).toEqual(['TỐ TỤNG', 'DÂN SỰ']);
    expect(r.size).toBe(17);
  });
  it('fitTitle: tên rất dài → 3 dòng, cỡ ≈ 11–12.5, không dòng nào vượt maxWidth', () => {
    const r = fitTitle('Lý luận chung về Nhà nước và Pháp luật', OPTS);
    expect(r.lines).toHaveLength(3);
    expect(r.size).toBeGreaterThanOrEqual(11);
    expect(r.size).toBeLessThanOrEqual(12.5);
    expect(widest(r)).toBeLessThanOrEqual(OPTS.maxWidth);
    expect(r.lines.join(' ')).toBe('LÝ LUẬN CHUNG VỀ NHÀ NƯỚC VÀ PHÁP LUẬT');
  });
  it('fitTitle: một dòng hơi nhỏ hơn được ưu tiên hơn bẻ đôi một cụm 2 từ ("Thương mại")', () => {
    const r = fitTitle('Thương mại', OPTS);
    expect(r.lines).toEqual(['THƯƠNG MẠI']);
    expect(widest(r)).toBeLessThanOrEqual(OPTS.maxWidth);
    expect(r.size).toBeGreaterThanOrEqual(15);
  });
  it('fitTitle: số từ chẵn → giữ từ ghép hai âm tiết trên cùng dòng ("QUẢN TRỊ / TÀI SẢN / TRÍ TUỆ", không "QUẢN TRỊ TÀI / SẢN…")', () => {
    expect(fitTitle('Quản trị tài sản trí tuệ', OPTS).lines).toEqual(['QUẢN TRỊ', 'TÀI SẢN', 'TRÍ TUỆ']);
    expect(fitTitle('Tài chính doanh nghiệp', { ...OPTS, maxHeight: 48 }).lines).toEqual(['TÀI CHÍNH', 'DOANH NGHIỆP']);
    expect(fitTitle('Chứng khoán', { ...OPTS, charW: 0.7 }).lines).toEqual(['CHỨNG KHOÁN']);
    // không vừa nếu giữ cặp → bỏ ràng buộc cặp thay vì cắt chữ
    const loose = fitTitle('Aaaaaaaaaaaaaaa Bb Cc Dddddddddddddd', OPTS);
    expect(loose.lines).toEqual(['AAAAAAAAAAAAAAA', 'BB CC', 'DDDDDDDDDDDDDD']);
    expect(loose.size).toBeGreaterThan(OPTS.minSize);
  });
  it('fitTitle: maxHeight chặn cỡ theo tổng chiều cao (số dòng × cỡ × 1,2)', () => {
    const r = fitTitle('Xây dựng văn bản pháp luật', { ...OPTS, maxHeight: 52 });
    expect(r.lines).toEqual(['XÂY DỰNG', 'VĂN BẢN', 'PHÁP LUẬT']);
    expect(r.size).toBe(14);
    expect(fitTitle('Hiến pháp', { ...OPTS, maxHeight: 52 }).size).toBe(17);
  });
  it('fitTitle: cỡ làm tròn xuống 0,5 và luôn trong [minSize, maxSize]', () => {
    for (const t of ['Đầu tư', 'Sở hữu trí tuệ', 'Xây dựng văn bản pháp luật', 'Lịch sử Nhà nước và Pháp luật Việt Nam', 'Quản trị tài sản trí tuệ']) {
      const r = fitTitle(t, OPTS);
      expect(r.size * 2, t).toBe(Math.floor(r.size * 2));
      expect(r.size, t).toBeGreaterThanOrEqual(OPTS.minSize);
      expect(r.size, t).toBeLessThanOrEqual(OPTS.maxSize);
      expect(r.lines.length, t).toBeLessThanOrEqual(OPTS.maxLines);
      expect(widest(r), t).toBeLessThanOrEqual(OPTS.maxWidth);
    }
  });
  it('fitTitle: không vừa ở cỡ nhỏ nhất → cỡ nhỏ nhất, cắt bằng "…", không quá maxLines', () => {
    const r = fitTitle('Một hai ba bốn năm sáu bảy tám chín mười mười một mười hai mười ba mười bốn', OPTS);
    expect(r.size).toBe(OPTS.minSize);
    expect(r.lines).toHaveLength(3);
    expect(r.lines[2].endsWith('…')).toBe(true);
    expect(widest(r)).toBeLessThanOrEqual(OPTS.maxWidth);
    const one = fitTitle('Siêuuuuuuuuuuuuuuuuuuuuudài', OPTS);
    expect(one.lines).toHaveLength(1);
    expect(widest(one)).toBeLessThanOrEqual(OPTS.maxWidth);
    expect(fitTitle('', OPTS)).toEqual({ lines: [], size: OPTS.maxSize });
  });
  it('mixWhite/mixBlack: pha màu bìa với trắng/đen', () => {
    expect(mixWhite('#000000', 1)).toBe('#ffffff');
    expect(mixWhite('#1F5F4A', 0)).toBe('#1f5f4a');
    expect(mixWhite('#000000', 0.5)).toBe('#808080');
    expect(mixBlack('#ffffff', 0.5)).toBe('#808080');
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
