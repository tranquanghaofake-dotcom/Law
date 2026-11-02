/** Tủ sách theo chương (spec thăng chức §2): tính cấp sách từ tiến độ, gộp với cấp đã lưu (chỉ nâng), làm mới sau mỗi phiên học. */
import type { Level, Subject } from '$lib/content/types';
import { loadIndex, loadSubject } from '$lib/content/loader';
import { repo } from '$lib/store/progress-repo';
import { LuyenLuatDB } from '$lib/store/db';
import { localDay } from '$lib/game/streak';
import { collectBooks, mergeStored, type BookRec, type StoredBooks } from '$lib/game/books';

const KEY = 'books';
export const shelf = $state<{ books: BookRec[]; subjects: Subject[]; ready: boolean }>({ books: [], subjects: [], ready: false });

async function readStored(db: LuyenLuatDB | null): Promise<StoredBooks> {
  try { const row = await db?.settings.get(KEY); return (row?.value && typeof row.value === 'object' ? row.value : {}) as StoredBooks; } catch { return {}; }
}

export async function refreshShelf(): Promise<void> {
  try {
    const idx = await loadIndex();
    const subjects = await Promise.all(idx.subjects.filter((s) => (idx.conceptCount[s.id] ?? 0) > 0).map((s) => loadSubject(s.id)));
    const levels = Object.fromEntries((await repo.all()).map((p) => [p.conceptId, p.level])) as Record<string, Level>;
    let db: LuyenLuatDB | null = null;
    try { if (typeof indexedDB !== 'undefined') db = new LuyenLuatDB(); } catch { db = null; }
    const stored = await readStored(db);
    const merged = mergeStored(stored, collectBooks(subjects, levels, stored), localDay(new Date()));
    if (JSON.stringify(merged) !== JSON.stringify(stored)) { try { await db?.settings.put({ key: KEY, value: merged }); } catch { /* chế độ riêng tư */ } }
    shelf.subjects = subjects;
    shelf.books = collectBooks(subjects, levels, merged);
    shelf.ready = true;
  } catch { /* chưa tải được nội dung: giữ tủ trống */ }
}
