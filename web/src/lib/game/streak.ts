export type StreakState = { count: number; lastDay: string; freezes: number; longest: number };
export type StreakEvent = 'same-day' | 'extended' | 'froze' | 'reset' | 'started';

export const MAX_FREEZES = 2;

/** YYYY-MM-DD theo giờ địa phương của thiết bị. */
export function localDay(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function dayDiff(a: string, b: string): number {
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}

function withFreezeBonus(s: StreakState, prevCount: number): StreakState {
  // mỗi lần đạt bội số của 7 (từ dưới lên) được +1 bùa, tối đa 2
  const earned = Math.floor(s.count / 7) - Math.floor(prevCount / 7);
  return earned > 0 ? { ...s, freezes: Math.min(MAX_FREEZES, s.freezes + earned) } : s;
}

export function applySession(s: StreakState, now: Date): { state: StreakState; event: StreakEvent } {
  const today = localDay(now);
  if (!s.lastDay) {
    return { state: { count: 1, lastDay: today, freezes: s.freezes, longest: Math.max(s.longest, 1) }, event: 'started' };
  }
  const gap = dayDiff(s.lastDay, today);
  if (gap <= 0) return { state: s, event: 'same-day' };
  if (gap === 1) {
    const next = withFreezeBonus({ ...s, count: s.count + 1, lastDay: today }, s.count);
    return { state: { ...next, longest: Math.max(next.longest, next.count) }, event: 'extended' };
  }
  if (gap === 2 && s.freezes > 0) {
    const next = withFreezeBonus({ ...s, count: s.count + 1, lastDay: today, freezes: s.freezes - 1 }, s.count);
    return { state: { ...next, longest: Math.max(next.longest, next.count) }, event: 'froze' };
  }
  return { state: { count: 1, lastDay: today, freezes: s.freezes, longest: Math.max(s.longest, s.count) }, event: 'reset' };
}
