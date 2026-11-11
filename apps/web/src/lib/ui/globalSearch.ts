// Tìm kiếm toàn cục (spec 2026-11-11): một ô tìm cho khái niệm của mọi môn, môn học và bộ đề. Thuần, không chạm mạng.
import { fold, type TermHit, type TermIndex } from './conceptSearch';

export type SubjectHit = { id: string; title: string; short: string };
export type SetHit = { id: string; title: string; subtitle: string; group: string };
export type SearchSource = { terms: TermIndex; subjects: SubjectHit[]; sets: SetHit[] };
export type SearchLimits = { concepts: number; subjects: number; sets: number };
export type SearchResult = {
  concepts: TermHit[];
  subjects: SubjectHit[];
  sets: SetHit[];
  /** Tổng số khái niệm khớp (kể cả phần không hiện) — để ghi "và N khái niệm khác". */
  conceptTotal: number;
  /** Số dòng đang hiện ở cả ba nhóm. */
  total: number;
};

export const LIMITS: SearchLimits = { concepts: 8, subjects: 3, sets: 4 };
export const EMPTY: SearchResult = { concepts: [], subjects: [], sets: [], conceptTotal: 0, total: 0 };

/** Mức khớp sau khi bỏ dấu: 0 trùng hẳn · 1 bắt đầu bằng truy vấn · 2 mọi từ khớp đầu một từ · 3 mọi từ có mặt · -1 không khớp. */
export function matchRank(text: string, query: string): number {
  const t = fold(text);
  const q = fold(query);
  if (!q) return -1;
  if (t === q) return 0;
  if (t.startsWith(q)) return 1;
  const words = q.split(' ');
  const heads = t.split(/[^\p{L}\p{N}]+/u);
  if (words.every((w) => heads.some((h) => h.startsWith(w)))) return 2;
  return words.every((w) => t.includes(w)) ? 3 : -1;
}

const best = (...ranks: number[]): number => {
  const hit = ranks.filter((r) => r >= 0);
  return hit.length ? Math.min(...hit) : -1;
};

/** Xếp theo mức khớp, rồi tên ngắn hơn trước, rồi thứ tự chữ cái tiếng Việt. */
function ranked<T>(rows: { item: T; rank: number; name: string }[]): T[] {
  return rows
    .filter((r) => r.rank >= 0)
    .sort((a, b) => a.rank - b.rank || a.name.length - b.name.length || a.name.localeCompare(b.name, 'vi'))
    .map((r) => r.item);
}

export function searchAll(query: string, src: SearchSource, limits: SearchLimits = LIMITS): SearchResult {
  const q = fold(query);
  if (q.length < 2) return EMPTY;

  const allConcepts = ranked(
    src.terms.flatMap((s) =>
      Object.entries(s.terms).map(([id, term]) => ({ item: { subject: s.id, short: s.short, id, term } satisfies TermHit, rank: matchRank(term, q), name: term })),
    ),
  );
  const subjects = ranked(src.subjects.map((s) => ({ item: s, rank: best(matchRank(s.title, q), matchRank(s.short, q)), name: s.title }))).slice(0, limits.subjects);
  // Bộ đề: khớp tên trước; chỉ khớp mô tả thì xếp sau mọi đề khớp tên.
  const sets = ranked(
    src.sets.map((s) => {
      const byTitle = matchRank(s.title, q);
      return { item: s, rank: byTitle >= 0 ? byTitle : matchRank(s.subtitle, q) >= 0 ? 4 : -1, name: s.title };
    }),
  ).slice(0, limits.sets);

  const concepts = allConcepts.slice(0, limits.concepts);
  return { concepts, subjects, sets, conceptTotal: allConcepts.length, total: concepts.length + subjects.length + sets.length };
}
