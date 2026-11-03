// Kệ sách: mỗi môn là một cuốn sách luật; sách hiện dần theo % khái niệm thuần thục (cùng ngưỡng MASTERED với % môn), đóng dấu khi đủ 100%.
import type { Level, Subject } from '$lib/content/types';
import { subjectSummary } from './subjectSummary';

export type BookScheme = 'vang' | 'xanh' | 'dem';
export type BookState = 'ghost' | 'growing' | 'done';
export type Book = { id: string; title: string; short: string; percent: number; mastered: number; total: number; state: BookState; scheme: BookScheme; href: string };

/** Số ô tối thiểu trên kệ (ô trống vẽ khung "sắp có" cho kệ không trơ trọi). */
export const SHELF_MIN = 4;

const FIXED: Record<string, BookScheme> = { 'hien-phap': 'vang', 'chung-khoan': 'xanh', 'lich-su-nn-pl': 'dem' };
const CYCLE: BookScheme[] = ['xanh', 'dem', 'vang'];

/** Bộ màu bìa (cách điệu theo dòng sách luật in trong nước): Hiến pháp vàng; môn khác xoay vòng theo vị trí. */
export function schemeFor(id: string, index: number): BookScheme {
  return FIXED[id] ?? CYCLE[index % CYCLE.length];
}

export function shelfBooks(subjects: Subject[], levels: Record<string, Level>): Book[] {
  return subjects
    .map((s) => ({ s, x: subjectSummary(s, levels) }))
    .filter(({ x }) => x.total > 0)
    .map(({ s, x }, i) => ({
      id: s.id, title: s.title, short: s.short, percent: x.percent, mastered: x.mastered, total: x.total,
      state: x.mastered === x.total ? 'done' : x.mastered > 0 ? 'growing' : 'ghost',
      scheme: schemeFor(s.id, i + 1), href: `#/mon/${s.id}`,
    }));
}
