import type { StreakState } from '$lib/game/streak';
import type { ContentIndex } from '$lib/content/types';
import { LuyenLuatDB } from './db';

const mem = new Map<string, unknown>();
let db: LuyenLuatDB | null | undefined;
function getDb(): LuyenLuatDB | null {
  if (db !== undefined) return db;
  try { db = typeof indexedDB !== 'undefined' ? new LuyenLuatDB() : null; } catch { db = null; }
  return db;
}

async function get<T>(key: string, fallback: T): Promise<T> {
  const d = getDb();
  if (d) { try { const r = await d.stats.get(key); return (r?.value as T) ?? fallback; } catch { /* rơi xuống bộ nhớ */ } }
  return (mem.get(key) as T) ?? fallback;
}
async function set(key: string, value: unknown): Promise<void> {
  mem.set(key, value);
  const d = getDb();
  if (d) { try { await d.stats.put({ key, value }); } catch { /* bỏ qua */ } }
}

export const EMPTY_STREAK: StreakState = { count: 0, lastDay: '', freezes: 0, longest: 0 };

export const stats = {
  xp: () => get<number>('xp', 0),
  async addXp(n: number): Promise<number> { const v = (await stats.xp()) + n; await set('xp', v); return v; },
  streak: () => get<StreakState>('streak', EMPTY_STREAK),
  setStreak: (s: StreakState) => set('streak', s),
  lessonsDone: () => get<string[]>('lessons', []),
  async markLesson(id: string): Promise<boolean> {
    const list = await stats.lessonsDone();
    if (list.includes(id)) return false;
    await set('lessons', [...list, id]);
    return true;
  },
  best: (setId: string) => get<number | null>(`best:${setId}`, null),
  setBest: (setId: string, score: number) => set(`best:${setId}`, score),
  /** Nhập điểm cao nhất từ web v1 (localStorage `best:<id>`) một lần rồi xoá khỏi localStorage. */
  async migrateV1Best(index: ContentIndex): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    for (const set of index.sets) {
      try {
        const old = localStorage.getItem(`best:${set.id}`);
        if (old == null) continue;
        if ((await stats.best(set.id)) == null) await stats.setBest(set.id, Number(JSON.parse(old)));
        localStorage.removeItem(`best:${set.id}`);
      } catch { /* bỏ qua giá trị hỏng */ }
    }
  },
  get, set,
};
