// Màn thắp chuỗi toàn màn hình (StreakIgnite): khi nào chạy và đường bay của đốm sáng. Hàm thuần, test ở tests/ui/ignite.test.ts.
import type { StreakEvent } from '$lib/game/streak';

/** Khoá localStorage ghi ngày đã chiếu màn thắp (chỉ là tiện ích hiển thị, mất cũng không sao). */
export const IGNITE_KEY = 'll-ignite-day';

/** Chạy khi chuỗi vừa tăng trong phiên này (bắt đầu, +1, bùa cứu) và hôm nay chưa chiếu. */
export function shouldIgnite(event: StreakEvent, today: string, shownDay: string | null): boolean {
  return (event === 'started' || event === 'extended' || event === 'froze') && shownDay !== today;
}

export type Mote = { x0: number; y0: number; cx: number; cy: number; x1: number; y1: number; delay: number; size: number };

/** `n` đốm sáng bay từ ngoài mép thẻ (khung w×h) vào `to` theo đường cong bậc hai; trễ tăng dần để thành dòng. */
export function flight(n: number, to: { x: number; y: number }, box: { w: number; h: number }, seed = 1): Mote[] {
  let s = seed * 7919 + 13;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const R = Math.hypot(box.w, box.h) * 0.62;
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + rnd() * 0.9;
    const r = R * (0.95 + rnd() * 0.35);
    const x0 = box.w / 2 + Math.cos(a) * r, y0 = box.h / 2 + Math.sin(a) * r;
    // điểm điều khiển lệch vuông góc với hướng bay → đường cong xoáy nhẹ
    const mx = (x0 + to.x) / 2, my = (y0 + to.y) / 2, k = (rnd() - 0.5) * 0.9;
    return { x0, y0, cx: mx - (to.y - y0) * k, cy: my + (to.x - x0) * k, x1: to.x, y1: to.y, delay: Math.round(i * 55 + rnd() * 40), size: 5 + rnd() * 7 };
  });
}
