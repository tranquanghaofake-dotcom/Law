// Logic thuần của thẻ ghép cặp chạm–chạm: chạm một thuật ngữ rồi một mô tả (hoặc ngược lại).
export type Side = 'term' | 'desc';
export type MatchState = {
  /** ô đang chọn (chỉ số cặp), mỗi bên một ô; chạm ô cùng bên thì đổi ô chọn */
  sel: { term: number | null; desc: number | null };
  done: boolean[];
  wrongs: number;
  /** cặp đã từng bị ghép sai (để tính "đúng ngay lần đầu") */
  missed: number[];
};
export type Outcome = 'none' | 'select' | 'ok' | 'bad';

export const createMatch = (n: number): MatchState => ({ sel: { term: null, desc: null }, done: Array(n).fill(false), wrongs: 0, missed: [] });

/** Chạm một ô. `term`/`desc` là hai chỉ số cặp vừa được so khớp (khi ok/bad). */
export function tap(s: MatchState, side: Side, idx: number): { state: MatchState; outcome: Outcome; term?: number; desc?: number } {
  if (s.done[idx]) return { state: s, outcome: 'none' };
  const sel = { ...s.sel, [side]: s.sel[side] === idx ? null : idx };
  const other: Side = side === 'term' ? 'desc' : 'term';
  if (sel[side] === null || sel[other] === null) return { state: { ...s, sel }, outcome: 'select' };
  const term = sel.term!, desc = sel.desc!;
  const ok = term === desc;
  const state: MatchState = ok
    ? { ...s, sel: { term: null, desc: null }, done: s.done.map((d, k) => d || k === term) }
    : { ...s, sel: { term: null, desc: null }, wrongs: s.wrongs + 1, missed: s.missed.includes(term) ? s.missed : [...s.missed, term] };
  return { state, outcome: ok ? 'ok' : 'bad', term, desc };
}

export const isComplete = (s: MatchState) => s.done.every(Boolean);
/** Quyết định: tính đúng khi không ghép sai quá 1 lần. */
export const MATCH_MAX_WRONGS = 1;
export const matchCorrect = (s: MatchState) => s.wrongs <= MATCH_MAX_WRONGS;
/** Số cặp ghép đúng ngay lần đầu. */
export const firstTry = (s: MatchState) => s.done.length - s.missed.length;
