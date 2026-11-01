import { describe, expect, it } from 'vitest';
import { cardFor, CARD_DAYS, GLYPHS, TIERS } from '$lib/game/card';

describe('thẻ chuyên cần', () => {
  it('chuỗi 0: thẻ tắt hết, không kỷ lục', () => {
    const c = cardFor(0, 0);
    expect(c.glyphs.every((g) => g === null)).toBe(true);
    expect([c.logo, c.border, c.burst, c.record]).toEqual([null, null, false, null]);
  });
  it('ngày 1–27 sáng từng ký tự theo màu đỏ; 28 sáng logo; 29 sáng viền; 30 bừng sáng', () => {
    expect(cardFor(1, 1).glyphs.filter(Boolean)).toHaveLength(1);
    const d27 = cardFor(27, 27);
    expect(d27.glyphs.every((g) => g === 'do')).toBe(true);
    expect(d27.logo).toBeNull();
    expect(cardFor(28, 28).logo).toBe('do');
    expect(cardFor(28, 28).border).toBeNull();
    expect(cardFor(29, 29).border).toBe('do');
    expect(cardFor(30, 30).burst).toBe(true);
    expect(cardFor(30, 30)).toMatchObject({ day: 30, cycle: 0, tier: 'do' });
  });
  it('chu kỳ mới tô màu mới; chỗ chưa tới vẫn giữ màu chu kỳ trước', () => {
    const c = cardFor(CARD_DAYS + 3, 40);
    expect(c).toMatchObject({ day: 3, cycle: 1, tier: 'lam', burst: false });
    expect(c.glyphs.slice(0, 3)).toEqual(['lam', 'lam', 'lam']);
    expect(c.glyphs[3]).toBe('do');
    expect([c.logo, c.border]).toEqual(['do', 'do']);
  });
  it('thứ tự màu đỏ → lam → tím → trắng → đen → vô cực, vô cực giữ mãi', () => {
    expect(TIERS).toEqual(['do', 'lam', 'tim', 'trang', 'den', 'vo-cuc']);
    expect(cardFor(5 * CARD_DAYS + 1, 200).tier).toBe('vo-cuc');
    expect(cardFor(40 * CARD_DAYS + 1, 2000).tier).toBe('vo-cuc');
  });
  it('kỷ lục = màu của chuỗi dài nhất, giữ khi đứt chuỗi', () => {
    expect(cardFor(0, 75).record).toBe('tim');
    expect(cardFor(2, 31).record).toBe('lam');
    expect(GLYPHS).toBe(27);
  });
  it('mọi ngày 0–200: đúng 27 ô, số ô sáng màu chu kỳ hiện tại = min(ngày, 27)', () => {
    for (let n = 0; n <= 200; n++) {
      const c = cardFor(n, n);
      expect(c.glyphs).toHaveLength(GLYPHS);
      if (n > 0) expect(c.glyphs.filter((g) => g === c.tier).length).toBeGreaterThanOrEqual(Math.min(c.day, GLYPHS));
    }
  });
});
