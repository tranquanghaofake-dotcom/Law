/** Số liệu hiển thị ở header (XP, chuỗi); các route cập nhật qua refreshHeader(). */
import { LuyenLuatDB } from '$lib/store/db';
import type { StreakState } from '$lib/game/streak';

export const header = $state({ xp: 0, streak: 0 });

export async function refreshHeader(): Promise<void> {
  try {
    if (typeof indexedDB === 'undefined') return;
    const db = new LuyenLuatDB();
    const [xp, streak] = await Promise.all([db.stats.get('xp'), db.stats.get('streak')]);
    header.xp = Number(xp?.value ?? 0);
    header.streak = (streak?.value as StreakState | undefined)?.count ?? 0;
  } catch { /* chế độ riêng tư */ }
}
refreshHeader();
