// Bảng so sánh cặp dễ nhầm (đề xuất ④): hai cột (khái niệm ↔ khái niệm dễ nhầm), hàng = giống nhau / định nghĩa / dấu hiệu / ví dụ.
// Dựng thuần từ dữ liệu đã kiểm (definition, keywords, example); không viết khẳng định pháp lý mới.
import type { Concept } from '$lib/content/types';
import { clip } from './text';

export type CompareRow =
  | { kind: 'text'; label: string; a: string; b: string }
  | { kind: 'signs'; label: string; a: string[]; b: string[] };
export type Compare = {
  a: { id: string; term: string };
  b: { id: string; term: string };
  /** Điểm giống (nêu trước, theo Alfieri 2013): cùng chương/môn; rỗng nếu không có. */
  common: string | null;
  rows: CompareRow[];
};

const clean = (s: string): string => s.replace(/\s+/g, ' ').trim();

/** Dựng bảng so sánh; null khi hai bên là một khái niệm hoặc thiếu dữ liệu để so (không có định nghĩa/ví dụ cả hai). */
export function compareConcepts(a: Concept, b: Concept, max = { def: 210, example: 170 }): Compare | null {
  if (a.id === b.id) return null;
  const rows: CompareRow[] = [];
  if (a.definition && b.definition) rows.push({ kind: 'text', label: 'Định nghĩa', a: clip(clean(a.definition), max.def), b: clip(clean(b.definition), max.def) });
  const ak = a.keywords.filter((k) => k.trim()), bk = b.keywords.filter((k) => k.trim());
  if (ak.length || bk.length) rows.push({ kind: 'signs', label: 'Dấu hiệu', a: ak, b: bk });
  if (a.example && b.example) rows.push({ kind: 'text', label: 'Ví dụ', a: clip(clean(a.example), max.example), b: clip(clean(b.example), max.example) });
  if (!rows.length) return null;
  const common = a.chapter === b.chapter && a.subject === b.subject ? 'Cùng chương, cùng môn.' : a.subject === b.subject ? 'Cùng môn.' : null;
  return { a: { id: a.id, term: a.term }, b: { id: b.id, term: b.term }, common, rows };
}

/** Khái niệm dễ nhầm đầu tiên có trong `pool` và đủ dữ liệu để so sánh với `c`. */
export function firstComparable(c: Concept, pool: Concept[]): Concept | null {
  for (const id of c.confusables) {
    const o = pool.find((x) => x.id === id);
    if (o && compareConcepts(c, o)) return o;
  }
  return null;
}
