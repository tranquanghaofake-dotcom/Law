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

describe('IGNITE_TIMING — màn thắp chậm lại (05/11/2026) và đủ thì giờ xem từng chặng', () => {
  it('các chặng theo đúng thứ tự: thẻ bay vào → tụ lửa → đốm bay → số đổi → tàn lửa bay lên → tự đóng', async () => {
    const { IGNITE_TIMING: t } = await import('$lib/ui/ignite');
    expect(t.cardIn).toBeLessThanOrEqual(t.charge);
    expect(t.charge).toBeLessThan(t.motes);
    expect(t.motes + t.fly).toBeLessThan(t.arrive);
    expect(t.arrive).toBeLessThan(t.embers);
    expect(t.embers).toBeLessThan(t.autoClose - 4000);
  });
  it('chậm hơn bản cũ ít nhất 1,5 lần (số đổi lúc 1,73 s, bay 0,95 s, tự đóng 7 s)', async () => {
    const { IGNITE_TIMING: t } = await import('$lib/ui/ignite');
    expect(t.arrive).toBeGreaterThanOrEqual(1730 * 1.5);
    expect(t.fly).toBeGreaterThanOrEqual(950 * 1.5);
    expect(t.autoClose).toBeGreaterThanOrEqual(10000);
  });
  it('flight giãn dòng đốm: khoảng cách trễ trung bình ≥ 85 ms', () => {
    const a = flight(14, { x: 100, y: 60 }, { w: 400, h: 250 }, 5);
    expect((a[13].delay - a[0].delay) / 13).toBeGreaterThanOrEqual(85);
  });
});

describe('embers — tàn lửa bay lên sau khi thắp', () => {
  it('cùng hạt giống cùng kết quả; vị trí ngang trong 0–100 %, trễ/độ cao/thời lượng hợp lý', async () => {
    const { embers } = await import('$lib/ui/ignite');
    const a = embers(18, 4);
    expect(a).toEqual(embers(18, 4));
    expect(a).toHaveLength(18);
    for (const e of a) {
      expect(e.x).toBeGreaterThanOrEqual(0); expect(e.x).toBeLessThanOrEqual(100);
      expect(e.rise).toBeGreaterThan(80); expect(e.dur).toBeGreaterThanOrEqual(1800); expect(e.delay).toBeGreaterThanOrEqual(0);
    }
  });
});
