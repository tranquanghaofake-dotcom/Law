import { describe, expect, it } from 'vitest';
import { applySession, localDay, type StreakState } from '$lib/game/streak';

const d = (y: number, m: number, day: number, h = 12, min = 0) => new Date(y, m - 1, day, h, min);
const fresh: StreakState = { count: 0, lastDay: '', freezes: 0, longest: 0 };

describe('localDay', () => {
  it('dùng ngày địa phương', () => {
    expect(localDay(d(2026, 11, 2, 0, 5))).toBe('2026-11-02');
  });
});

describe('applySession', () => {
  it('phiên đầu → started, count 1', () => {
    const r = applySession(fresh, d(2026, 11, 1));
    expect(r.event).toBe('started');
    expect(r.state.count).toBe(1);
  });
  it('2 phiên cùng ngày → same-day, count giữ', () => {
    const s = applySession(fresh, d(2026, 11, 1)).state;
    const r = applySession(s, d(2026, 11, 1, 20));
    expect(r.event).toBe('same-day');
    expect(r.state.count).toBe(1);
  });
  it('hôm sau → extended', () => {
    const s = applySession(fresh, d(2026, 11, 1)).state;
    expect(applySession(s, d(2026, 11, 2)).event).toBe('extended');
  });
  it('qua nửa đêm 00:05 sau phiên 23:50 → extended (ngày địa phương)', () => {
    const s = applySession(fresh, d(2026, 11, 1, 23, 50)).state;
    const r = applySession(s, d(2026, 11, 2, 0, 5));
    expect(r.event).toBe('extended');
    expect(r.state.count).toBe(2);
  });
  it('lỡ 1 ngày có bùa → froze, count giữ, bùa −1', () => {
    const s = { ...applySession(fresh, d(2026, 11, 1)).state, freezes: 1, count: 5 };
    const r = applySession(s, d(2026, 11, 3));
    expect(r.event).toBe('froze');
    expect(r.state.count).toBe(6);
    expect(r.state.freezes).toBe(0);
  });
  it('lỡ 1 ngày không bùa → reset về 1', () => {
    const s = { ...applySession(fresh, d(2026, 11, 1)).state, count: 5 };
    const r = applySession(s, d(2026, 11, 3));
    expect(r.event).toBe('reset');
    expect(r.state.count).toBe(1);
    expect(r.state.longest).toBe(5);
  });
  it('7 ngày liên tiếp → +1 bùa, tối đa 2', () => {
    let s = fresh;
    for (let day = 1; day <= 14; day++) s = applySession(s, d(2026, 11, day)).state;
    expect(s.count).toBe(14);
    expect(s.freezes).toBe(2);
    for (let day = 15; day <= 21; day++) s = applySession(s, d(2026, 11, day)).state;
    expect(s.freezes).toBe(2);
  });
});
