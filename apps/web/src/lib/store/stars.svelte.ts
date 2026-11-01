// ★ Đánh dấu khái niệm (Quizlet "star", Anki "flag"). Lưu trong bảng settings, key 'starred'.
import { LuyenLuatDB } from './db';

const KEY = 'starred';

export function createStars(dbName = 'luyen-luat') {
  const state = $state({ ids: [] as string[] });
  let db: LuyenLuatDB | null = null;
  function getDb(): LuyenLuatDB | null {
    try {
      if (typeof indexedDB === 'undefined') return null;
      db ??= new LuyenLuatDB(dbName);
      return db;
    } catch { return null; }
  }
  return {
    get ids() { return state.ids; },
    has(id: string) { return state.ids.includes(id); },
    async load() {
      try {
        const row = await getDb()?.settings.get(KEY);
        if (Array.isArray(row?.value)) state.ids = row.value.filter((x): x is string => typeof x === 'string');
      } catch { /* chế độ riêng tư: chỉ giữ trong bộ nhớ */ }
    },
    /** Đổi trạng thái; trả về true nếu sau khi đổi là đang đánh dấu. */
    async toggle(id: string): Promise<boolean> {
      const on = !state.ids.includes(id);
      state.ids = on ? [...state.ids, id] : state.ids.filter((x) => x !== id);
      try { await getDb()?.settings.put({ key: KEY, value: $state.snapshot(state.ids) }); } catch { /* bỏ qua */ }
      return on;
    },
  };
}

export const stars = createStars();
