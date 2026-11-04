import { describe, expect, it } from 'vitest';
import { COMBO_COLORS, edgeGlow, fireStyle, fireTheme } from '$lib/ui/session/combo';

describe('fireTheme — một nguồn màu theo mốc', () => {
  it('cùng bậc màu với viền sáng ở mọi chuỗi', () => {
    for (const c of [0, 1, 2, 3, 4, 5, 7, 8, 12, 13, 40]) {
      const f = fireTheme(c), e = edgeGlow(c);
      expect(f.level).toBe(e.level);
      expect(f.tier).toBe(e.tier ?? 'do');
    }
  });
  it('mốc 1/2/3/5 đi Đỏ → Xanh lam → Tím → Trắng–đen, màu viền lấy từ COMBO_COLORS', () => {
    expect([1, 2, 3, 5].map((c) => fireTheme(c).tier)).toEqual(['do', 'lam', 'tim', 'trang-den']);
    expect(fireTheme(2).line).toBe(COMBO_COLORS.lam.line);
    expect(fireTheme(3).glow).toBe(COMBO_COLORS.tim.glow);
  });
  it('giữa hai mốc không đổi màu; chuỗi 0 trả bậc Đỏ (để lửa tắt dịu không nháy màu)', () => {
    expect(fireTheme(4)).toEqual(fireTheme(3));
    expect(fireTheme(0).tier).toBe('do');
    expect(fireTheme(0).level).toBe(0);
  });
  it('ba lớp lửa a/b/c đều có màu', () => {
    for (const c of [1, 2, 3, 5]) { const f = fireTheme(c); expect(f.a && f.b && f.c).toBeTruthy(); }
  });
  it('mốc trắng–đen: viền than đậm, thân trắng sáng, tâm vàng nhạt; scale ≤ 1.3', () => {
    const f = fireTheme(5);
    expect(f.a).toBe('#14161f'); expect(f.b).toBe('#f4f6fb'); expect(f.c).toBe('#ffd77a');
    expect(fireTheme(13).scale).toBeLessThanOrEqual(1.3);
  });
  it('lửa to dần theo mốc, tăng nghiêm ngặt', () => {
    const s = [1, 2, 3, 5, 8, 13].map((c) => fireTheme(c).scale);
    for (let i = 1; i < s.length; i++) expect(s[i]).toBeGreaterThan(s[i - 1]);
  });
  it('fireStyle là chuỗi custom property dùng chung', () => {
    const s = fireStyle(2);
    expect(s).toContain('--fire-a:');
    expect(s).toContain('--fire-b:');
    expect(s).toContain('--fire-c:');
    expect(s).toContain(`--fire-glow:${COMBO_COLORS.lam.glow}`);
  });
});
