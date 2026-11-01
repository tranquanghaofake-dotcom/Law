/** Dữ liệu kệ sách dùng chung cho sidebar và Hồ sơ; làm mới sau mỗi phiên học (cùng lúc với refreshHeader). */
import type { Level } from '$lib/content/types';
import { loadIndex, loadSubject } from '$lib/content/loader';
import { repo } from '$lib/store/progress-repo';
import { shelfBooks, type Book } from './shelf';

export const shelf = $state<{ books: Book[]; ready: boolean }>({ books: [], ready: false });

export async function refreshShelf(): Promise<void> {
  try {
    const idx = await loadIndex();
    const subjects = await Promise.all(idx.subjects.filter((s) => (idx.conceptCount[s.id] ?? 0) > 0).map((s) => loadSubject(s.id)));
    const levels = Object.fromEntries((await repo.all()).map((p) => [p.conceptId, p.level])) as Record<string, Level>;
    shelf.books = shelfBooks(subjects, levels);
    shelf.ready = true;
  } catch { /* chưa tải được nội dung: giữ kệ trống */ }
}
