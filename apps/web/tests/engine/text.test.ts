import { describe, expect, it } from 'vitest';
import { MASK, clip, coverage, leaks, maskTerms, nearDuplicate, termParts } from '$lib/engine/text';

describe('termParts', () => {
  it('thuật ngữ ghép tách thành các vế ≥ 2 tiếng, giữ cả thuật ngữ gốc, dài trước', () => {
    expect(termParts('Thừa kế theo pháp luật và hàng thừa kế')).toEqual(['Thừa kế theo pháp luật và hàng thừa kế', 'Thừa kế theo pháp luật', 'hàng thừa kế']);
  });
  it('lấy chữ viết tắt trong ngoặc, bỏ vế mở đầu bằng hư từ', () => {
    expect(termParts('Giá trị tài sản ròng (NAV) của quỹ')).toEqual(['Giá trị tài sản ròng (NAV) của quỹ', 'Giá trị tài sản ròng', 'NAV']);
  });
  it('vế một tiếng không lấy', () => {
    expect(termParts('Hình thức chính thể: quân chủ và cộng hòa')).toEqual(['Hình thức chính thể: quân chủ và cộng hòa', 'Hình thức chính thể', 'quân chủ', 'cộng hòa']);
    expect(termParts('Tố cáo')).toEqual(['Tố cáo']);
  });
});

describe('maskTerms', () => {
  it('che thuật ngữ không phân biệt hoa thường, đúng ranh giới từ', () => {
    expect(maskTerms('Môi giới chứng khoán là việc làm trung gian.', ['Môi giới chứng khoán'])).toBe(`${MASK} là việc làm trung gian.`);
    expect(maskTerms('Người không quốc tịch là người không có quốc tịch Việt Nam', ['người không quốc tịch'])).toBe(`${MASK} là người không có quốc tịch Việt Nam`);
  });
  it('không che giữa chừng một từ khác', () => {
    expect(maskTerms('Quỹ đóng góp', ['Quỹ đóng'])).toBe(`${MASK} góp`);
    expect(maskTerms('BHXHA', ['BHXH'])).toBe('BHXHA');
  });
  it('che các vế của thuật ngữ ghép', () => {
    expect(maskTerms('Thừa kế theo pháp luật là thừa kế theo hàng thừa kế', termParts('Thừa kế theo pháp luật và hàng thừa kế'))).toBe(`${MASK} là thừa kế theo ${MASK}`);
  });
});

describe('clip', () => {
  it('ngắn thì giữ nguyên', () => {
    expect(clip('Ngắn gọn.', 50)).toBe('Ngắn gọn.');
  });
  it('dài thì cắt ở cuối câu nếu có, không thì ở khoảng trắng và thêm …', () => {
    const t = 'Câu thứ nhất khá dài để kiểm tra. Câu thứ hai còn dài hơn nữa và sẽ bị cắt bỏ hoàn toàn.';
    expect(clip(t, 50)).toBe('Câu thứ nhất khá dài để kiểm tra. (…)');
    const u = 'một hai ba bốn năm sáu bảy tám chín mười mười một mười hai';
    const c = clip(u, 30);
    expect(c.endsWith('…')).toBe(true);
    expect(c.length).toBeLessThanOrEqual(32);
    expect(u.startsWith(c.slice(0, -2))).toBe(true);
  });
});

describe('coverage / leaks / nearDuplicate', () => {
  it('coverage: tỉ lệ cặp tiếng của a có trong b', () => {
    expect(coverage('chào bán chứng khoán ra công chúng', 'vẫn là chào bán ra công chúng')).toBeCloseTo(0.5);
    expect(coverage('quyền sở hữu', 'quyền sở hữu')).toBe(1);
  });
  it('leaks: văn bản chứa thuật ngữ, vế thuật ngữ, hoặc ≥ 1/2 cặp tiếng', () => {
    expect(leaks('Công ty mở bán cổ phần cho bất kỳ ai: vẫn là chào bán ra công chúng.', 'Chào bán chứng khoán ra công chúng')).toBe(true);
    expect(leaks('Anh C có quyền tố cáo dù không bị thiệt hại.', 'Tố cáo')).toBe(true);
    expect(leaks('Anh C biết công chức nhận tiền.', 'Tố cáo')).toBe(false);
  });
  it('nearDuplicate: trùng sau chuẩn hoá hoặc rất giống', () => {
    expect(nearDuplicate('Quỹ mở', 'quỹ mở.')).toBe(true);
    expect(nearDuplicate('Quỹ mở', 'Quỹ đóng')).toBe(false);
    expect(nearDuplicate('Hiệu lực của Bộ luật Hình sự trên lãnh thổ Việt Nam', 'Hiệu lực của Bộ luật Hình sự ngoài lãnh thổ Việt Nam')).toBe(false);
  });
});
