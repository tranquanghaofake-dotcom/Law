import { describe, expect, it } from 'vitest';
import { countAt, isStampCombo, litPercent, stampFor, strokeColors } from '$lib/ui/session/reward';
import { comboBuzzPattern } from '$lib/fx/haptics';

describe('stampFor: khi nào đóng dấu', () => {
  it('chỉ ở mốc 2·3·5·8·10·13 rồi mỗi 5 câu', () => {
    const hit = Array.from({ length: 22 }, (_, i) => i).filter(isStampCombo);
    expect(hit).toEqual([2, 3, 5, 8, 10, 13, 15, 20]);
  });
  it('chỉ khi chuỗi thực sự tăng (vòng sửa sai/sai: không đóng dấu)', () => {
    expect(stampFor(2, 3)?.big).toBe('×3');
    expect(stampFor(3, 3)).toBeNull();
    expect(stampFor(5, 0)).toBeNull();
    expect(stampFor(0, 1)).toBeNull();
  });
  it('confetti ở mốc 5 và từ 10; overlay kỳ quan ở mốc 5·8·13', () => {
    const f = (c: number) => stampFor(c - 1, c)!;
    expect([2, 3, 5, 8, 10, 13, 15].map((c) => f(c).confetti)).toEqual([false, false, true, false, true, true, true]);
    expect([2, 3, 5, 8, 10, 13, 15].map((c) => f(c).overlay)).toEqual([false, false, true, true, false, true, false]);
    expect(f(13).sub).toBe('CHUỖI!');
  });
  it('màu bậc theo mốc', () => {
    expect(stampFor(1, 2)!.tier).toBe('lam');
    expect(stampFor(4, 5)!.tier).toBe('trang-den');
  });
});

describe('litPercent', () => {
  it('làm tròn xuống, chỉ 100 khi sáng đủ', () => {
    expect(litPercent(0, 40)).toBe(0);
    expect(litPercent(13, 40)).toBe(32);
    expect(litPercent(39, 40)).toBe(97);
    expect(litPercent(399, 400)).toBe(99);
    expect(litPercent(40, 40)).toBe(100);
    expect(litPercent(5, 0)).toBe(0);
  });
});

describe('countAt / haptics / màu nét', () => {
  it('đếm số ease-out từ from tới to', () => {
    expect(countAt(10, 30, 0)).toBe(10);
    expect(countAt(10, 30, 1)).toBe(30);
    expect(countAt(10, 30, 0.5)).toBeGreaterThan(20);
    expect(countAt(10, 30, 2)).toBe(30);
  });
  it('rung mạnh dần theo mốc, mốc 0 không rung', () => {
    expect(comboBuzzPattern(0)).toEqual([]);
    const total = (l: number) => comboBuzzPattern(l).reduce((a, b) => a + b, 0);
    for (let l = 2; l <= 6; l++) expect(total(l)).toBeGreaterThan(total(l - 1));
  });
  it('Trắng – đen: nét chẵn đen, nét lẻ trắng', () => {
    expect(strokeColors('trang-den', 0).line).toBe('#050507');
    expect(strokeColors('trang-den', 1).line).toBe('#ffffff');
    expect(strokeColors('final', 3).line).toBe('#d9a21e');
  });
});
