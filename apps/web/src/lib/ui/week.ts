import { localDay } from '$lib/game/streak';

/** 7 cờ "có học" từ 6 ngày trước tới hôm nay (giờ địa phương). */
export function weekFlags(days: Set<string>, now: Date = new Date()): boolean[] {
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(now); d.setDate(d.getDate() - (6 - i)); return days.has(localDay(d)); });
}

/** Mốc bắt đầu của cửa sổ 7 ngày (0 giờ của 6 ngày trước). */
export function weekStart(now: Date = new Date()): Date {
  const d = new Date(now); d.setDate(d.getDate() - 6); d.setHours(0, 0, 0, 0); return d;
}
