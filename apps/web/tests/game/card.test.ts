import { describe, expect, it } from 'vitest';
import { cardAt, cardFor, justLit, progressOf, isMilestone, streakMedals, CARD_DAYS, GLYPHS, TIERS } from '$lib/game/card';

describe('thẻ chuyên cần (theo tiến độ trong vòng 30)', () => {
  it('chuỗi 0: thẻ tắt hết, không kỷ lục', () => {
    const c = cardFor(0, 0);
    expect(c.glyphs.every((g) => g === null)).toBe(true);
    expect([c.logo, c.border, c.charge, c.burst, c.record]).toEqual([null, null, null, false, null]);
  });
  it('tiến độ 1–27 sáng từng ký tự màu đỏ; 28 viền; 29 lửa tụ về logo; 30 logo bừng cháy cuối cùng', () => {
    expect(cardAt(1, 1).glyphs.filter(Boolean)).toHaveLength(1);
    const d27 = cardAt(27, 27);
    expect(d27.glyphs.every((g) => g === 'do')).toBe(true);
    expect([d27.logo, d27.border, d27.charge]).toEqual([null, null, null]);
    expect(cardAt(28, 28)).toMatchObject({ border: 'do', charge: null, logo: null });
    expect(cardAt(29, 29)).toMatchObject({ border: 'do', charge: 'do', logo: null });
    expect(cardAt(30, 30)).toMatchObject({ logo: 'do', burst: true, day: 30, cycle: 0, tier: 'do' });
  });
  it('vòng mới tô màu mới; chỗ chưa tới vẫn giữ màu vòng trước', () => {
    const c = cardAt(CARD_DAYS + 3, 40);
    expect(c).toMatchObject({ day: 3, cycle: 1, tier: 'lam', burst: false });
    expect(c.glyphs.slice(0, 3)).toEqual(['lam', 'lam', 'lam']);
    expect(c.glyphs[3]).toBe('do');
    expect([c.logo, c.border]).toEqual(['do', 'do']);
  });
  it('4 cấp lửa: đỏ → lam → tím → trắng–đen giao thoa, cấp cuối giữ mãi', () => {
    expect(TIERS).toEqual(['do', 'lam', 'tim', 'trang-den']);
    expect(cardAt(3 * CARD_DAYS + 1, 200).tier).toBe('trang-den');
    expect(cardAt(40 * CARD_DAYS + 1, 2000).tier).toBe('trang-den');
  });
  it('kỷ lục = màu của chuỗi dài nhất, giữ khi đứt chuỗi', () => {
    expect(cardAt(0, 75).record).toBe('tim');
    expect(cardAt(2, 31).record).toBe('lam');
    expect(GLYPHS).toBe(27);
  });
});

describe('mốc thúc đẩy: chạm 1, 5, 10, 15… ngày thì nhanh thêm 1 ngày', () => {
  it('mốc là ngày 1 và mọi bội của 5', () => {
    expect([1, 2, 4, 5, 9, 10, 15, 20].map(isMilestone)).toEqual([true, false, false, true, false, true, true, true]);
  });
  it('tiến độ cộng thêm 1 ở mỗi mốc', () => {
    expect([0, 1, 2, 4, 5, 6, 10].map(progressOf)).toEqual([0, 2, 3, 5, 7, 8, 13]);
  });
  it('vòng đầu xong sau 25 ngày học thật, và không bao giờ nhảy qua ngày 30 (logo luôn được thắp)', () => {
    const first = Array.from({ length: 40 }, (_, i) => i + 1).find((n) => progressOf(n) >= CARD_DAYS);
    expect(first).toBe(25);
    const seen = new Set(Array.from({ length: 400 }, (_, n) => progressOf(n)));
    for (let k = 1; k <= 8; k++) expect(seen.has(k * CARD_DAYS)).toBe(true);
  });
  it('tiến độ không giảm khi chuỗi tăng; cardFor dùng tiến độ', () => {
    for (let n = 1; n < 300; n++) expect(progressOf(n + 1)).toBeGreaterThan(progressOf(n));
    expect(cardFor(25, 25)).toMatchObject({ day: 30, logo: 'do', burst: true });
    expect(cardFor(1, 1).glyphs.filter(Boolean)).toHaveLength(2);
  });
  it('mọi chuỗi 0–300: đúng 27 ô, số ô màu hiện tại ≥ min(ngày, 27)', () => {
    for (let n = 0; n <= 300; n++) {
      const c = cardFor(n, n);
      expect(c.glyphs).toHaveLength(GLYPHS);
      if (n > 0) expect(c.glyphs.filter((g) => g === c.tier).length).toBeGreaterThanOrEqual(Math.min(c.day, GLYPHS));
    }
  });
});

describe('vừa thắp chuỗi', () => {
  it('lần đầu chưa lưu: không chạy hiệu ứng', () => expect(justLit(5, null)).toBe(false));
  it('chuỗi tăng so với lần xem trước: chạy hiệu ứng', () => expect(justLit(6, 5)).toBe(true));
  it('không đổi, giảm hoặc về 0: không chạy', () => {
    expect(justLit(5, 5)).toBe(false);
    expect(justLit(1, 9)).toBe(true); // chuỗi mới bắt đầu lại sau khi đứt vẫn là vừa thắp
    expect(justLit(0, 3)).toBe(false);
  });
});

describe('kỷ niệm chương vòng lửa (trưng trong tủ)', () => {
  it('chưa xong vòng nào: không có', () => expect(streakMedals(24)).toEqual([]));
  it('mỗi vòng hoàn tất (theo chuỗi dài nhất) được một chương theo màu vòng đó; vòng sau cấp cuối cộng dồn', () => {
    expect(streakMedals(25)).toEqual([{ tier: 'do', count: 1 }]);
    const n = Array.from({ length: 400 }, (_, i) => i).find((d) => progressOf(d) >= 5 * CARD_DAYS)!;
    expect(streakMedals(n)).toEqual([{ tier: 'do', count: 1 }, { tier: 'lam', count: 1 }, { tier: 'tim', count: 1 }, { tier: 'trang-den', count: 2 }]);
  });
});
