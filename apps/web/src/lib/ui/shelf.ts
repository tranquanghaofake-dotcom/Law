// Kệ sách: mỗi môn là một cuốn sách luật; sách hiện dần theo % khái niệm thuần thục (cùng ngưỡng MASTERED với % môn), đóng dấu khi đủ 100%.
import type { Level, Subject } from '$lib/content/types';
import { subjectSummary } from './subjectSummary';
import { shelfOf } from './shelves';

/** Màu bìa/gáy (hex) — lấy từ kệ nhóm ngành, một môn một màu ở mọi nơi (spec phần nhìn đợt 4, Q6). */
export type BookScheme = string;
export type BookState = 'ghost' | 'growing' | 'done';
export type Book = { id: string; title: string; short: string; percent: number; mastered: number; total: number; state: BookState; scheme: BookScheme; href: string };

/** Số ô tối thiểu trên kệ (ô trống vẽ khung "sắp có" cho kệ không trơ trọi). */
export const SHELF_MIN = 4;

/** Màu bìa của môn = màu kệ nhóm ngành. Tham số `index` giữ để không đổi chữ ký nơi gọi (trước đây xoay vòng 3 bộ màu). */
export function schemeFor(id: string, _index = 0): BookScheme {
  return shelfOf(id).color;
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
