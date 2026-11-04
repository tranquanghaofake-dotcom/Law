import { describe, it, expect } from 'vitest';
import { shouldIgnite, flight } from '$lib/ui/ignite';

describe('shouldIgnite — màn thắp chuỗi toàn màn hình, mỗi ngày một lần', () => {
  it('chạy khi chuỗi vừa tăng hôm nay (bắt đầu, +1, bùa cứu) và hôm nay chưa chiếu', () => {
    for (const e of ['started', 'extended', 'froze'] as const) expect(shouldIgnite(e, '2026-11-04', null)).toBe(true);
    expect(shouldIgnite('extended', '2026-11-04', '2026-11-03')).toBe(true);
  });
  it('không chạy khi hôm nay đã tính chuỗi, chuỗi đặt lại, hoặc đã chiếu hôm nay', () => {
    expect(shouldIgnite('same-day', '2026-11-04', null)).toBe(false);
    expect(shouldIgnite('reset', '2026-11-04', null)).toBe(false);
    expect(shouldIgnite('extended', '2026-11-04', '2026-11-04')).toBe(false);
  });
});

describe('flight — đường bay đốm sáng', () => {
  it('bắt đầu ngoài thẻ, kết thúc đúng đích, độ trễ tăng dần, cùng hạt giống cho cùng kết quả', () => {
    const a = flight(12, { x: 100, y: 60 }, { w: 400, h: 250 }, 3);
    const b = flight(12, { x: 100, y: 60 }, { w: 400, h: 250 }, 3);
    expect(a).toEqual(b);
    expect(a).toHaveLength(12);
    for (const p of a) {
      const out = p.x0 < 0 || p.x0 > 400 || p.y0 < 0 || p.y0 > 250;
      expect(out).toBe(true);
      expect([p.x1, p.y1]).toEqual([100, 60]);
    }
    expect(a.every((p, i) => i === 0 || p.delay >= a[i - 1].delay)).toBe(true);
  });
});
