// Sách theo chương (spec thăng chức §2.1): cấp xét bậc thấp nhất của các khái niệm trong chương — ≥3 cấp 1, ≥5 cấp 2, =6 cấp 3.
// Sách giữ cấp cao nhất từng đạt (lưu trong settings 'books'); tụt bậc khi ôn chỉ bật cờ "cần ôn".
import type { Level, Subject } from '$lib/content/types';
import { fieldOf, type Field } from './fields';

export type BookLevel = 0 | 1 | 2 | 3;
export type StoredBooks = Record<string, { level: BookLevel; at: string }>;
export type BookRec = {
  key: string; subject: string; subjectTitle: string; subjectShort: string; chapter: string; title: string; index: number;
  field: Field; level: BookLevel; current: BookLevel; needsReview: boolean; at: string | null;
};
export const LEVEL_LABEL: Record<BookLevel, string> = { 0: 'Chưa có', 1: 'Cấp 1 · bìa mềm', 2: 'Cấp 2 · bìa cứng', 3: 'Cấp 3 · bìa da mạ vàng' };

export function chapterLevel(ids: string[], levels: Record<string, Level>): BookLevel {
  if (!ids.length) return 0;
  const min = Math.min(...ids.map((id) => levels[id] ?? 0));
  return min >= 6 ? 3 : min >= 5 ? 2 : min >= 3 ? 1 : 0;
}

export function collectBooks(subjects: Subject[], levels: Record<string, Level>, stored: StoredBooks): BookRec[] {
  return subjects.flatMap((s) => s.chapters.map((ch, i) => {
    const key = `${s.id}/${ch.id}`;
    const current = chapterLevel(ch.lessons.flatMap((l) => l.concepts), levels);
    const kept = stored[key]?.level ?? 0;
    const level = (Math.max(kept, current) as BookLevel);
    return {
      key, subject: s.id, subjectTitle: s.title, subjectShort: s.short, chapter: ch.id, title: ch.title, index: i + 1,
      field: fieldOf(s.id, ch.id), level, current, needsReview: current < level, at: stored[key]?.at ?? null,
    };
  }));
}

/** Gộp cấp hiện tại vào kho đã lưu: chỉ nâng, ghi ngày đạt khi lên cấp. */
export function mergeStored(stored: StoredBooks, books: BookRec[], today: string): StoredBooks {
  const out: StoredBooks = { ...stored };
  for (const b of books) if (b.current > (out[b.key]?.level ?? 0)) out[b.key] = { level: b.current, at: today };
  return out;
}
