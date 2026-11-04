// Hàm thuần cho trang Luyện đề và màn kết quả: số liệu, gợi ý, ngẫu nhiên có seed, sắp xếp, nhận xét.
import { groupSets, shelfOfGroup } from './groups';
import { OTHER_SHELF, SHELVES, type Shelf } from './shelves';

type SetLike = { id: string; group: string; count: number };
export type BestMap = Record<string, number | null | undefined>;
export type SortMode = 'shelf' | 'new-first' | 'low-first';
export type QuizStatus = 'new' | 'done' | 'perfect';

/** Thứ tự kệ của mọi đề: nhóm theo GROUPS, trong nhóm giữ thứ tự đưa vào. */
export function orderIds<T extends { id: string; group: string }>(sets: readonly T[]): string[] {
  return groupSets([...sets]).flatMap(([, v]) => v.map((s) => s.id));
}

/** Số đề "01", "02"… theo thứ tự kệ; id lạ → null. */
export function ticketNo(order: readonly string[], id: string): string | null {
  const i = order.indexOf(id);
  return i < 0 ? null : String(i + 1).padStart(2, '0');
}

/** Đề đứng ngay sau `id` theo thứ tự kệ (null nếu là đề cuối hoặc id lạ). */
export function nextAfter<T extends { id: string; group: string }>(sets: readonly T[], id: string): T | null {
  const order = orderIds(sets);
  const i = order.indexOf(id);
  if (i < 0 || i + 1 >= order.length) return null;
  return sets.find((s) => s.id === order[i + 1]) ?? null;
}

/** Dải số liệu: đã làm / tổng, số đề đạt tối đa, điểm trung bình (%) trên các đề đã làm (null nếu chưa làm đề nào). */
export function quizStats(sets: readonly SetLike[], best: BestMap): { total: number; done: number; perfect: number; avgPct: number | null; donePct: number } {
  const done = sets.filter((s) => best[s.id] != null);
  const perfect = done.filter((s) => (best[s.id] as number) >= s.count).length;
  const avg = done.length ? (done.reduce((n, s) => n + (best[s.id] as number) / s.count, 0) / done.length) * 100 : null;
  return { total: sets.length, done: done.length, perfect, avgPct: avg === null ? null : Math.round(avg), donePct: sets.length ? Math.round((done.length / sets.length) * 100) : 0 };
}

export function quizStatus(best: number | null | undefined, count: number): QuizStatus {
  if (best == null) return 'new';
  return best >= count ? 'perfect' : 'done';
}

/** Gợi ý: `next` = đề chưa làm đầu tiên theo `order`; `retry` = đề đã làm nhưng chưa tối đa có tỉ lệ thấp nhất (hoà → đứng trước theo `order`). */
export function suggestSets<T extends SetLike>(sets: readonly T[], best: BestMap, order: readonly string[]): { next: T | null; retry: T | null } {
  const rank = (s: T) => { const i = order.indexOf(s.id); return i < 0 ? order.length : i; };
  const ordered = [...sets].sort((a, b) => rank(a) - rank(b));
  const next = ordered.find((s) => best[s.id] == null) ?? null;
  let retry: T | null = null;
  for (const s of ordered) {
    const b = best[s.id];
    if (b == null || b >= s.count) continue;
    if (!retry || b / s.count < (best[retry.id] as number) / retry.count) retry = s;
  }
  return { next, retry };
}

/** Bộ sinh số giả ngẫu nhiên mulberry32: cùng seed → cùng dãy (test được). */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Chọn một đề theo seed; `avoidId` để nút "Xáo" không trả lại đề đang hiện (trừ khi chỉ còn một đề). */
export function pickRandom<T extends { id: string }>(sets: readonly T[], seed: number, avoidId?: string | null): T | null {
  if (!sets.length) return null;
  const pool = avoidId && sets.length > 1 ? sets.filter((s) => s.id !== avoidId) : [...sets];
  const rnd = mulberry32(seed);
  rnd(); // bỏ giá trị đầu: seed gần nhau cho giá trị đầu khá giống nhau
  return pool[Math.floor(rnd() * pool.length)];
}

/** Sắp xếp để hiển thị (không đổi mảng gốc): theo kệ · chưa làm trước · điểm thấp trước. */
export function sortSets<T extends SetLike>(sets: readonly T[], best: BestMap, mode: SortMode): T[] {
  const order = orderIds(sets);
  const rank = (s: T) => order.indexOf(s.id);
  const byShelf = [...sets].sort((a, b) => rank(a) - rank(b));
  if (mode === 'shelf') return byShelf;
  const isNew = (s: T) => best[s.id] == null;
  const ratio = (s: T) => (best[s.id] as number) / s.count;
  if (mode === 'new-first') return [...byShelf].sort((a, b) => Number(isNew(b)) - Number(isNew(a)));
  return [...byShelf].sort((a, b) => (isNew(a) ? 1 : 0) - (isNew(b) ? 1 : 0) || (isNew(a) ? 0 : ratio(a) - ratio(b)));
}

export const estMinutes = (count: number): number => Math.max(1, Math.round(count * 0.5));

export type VerdictTier = 'perfect' | 'great' | 'good' | 'fair' | 'low';
/** Nhận xét theo mức điểm trên màn kết quả. */
export function verdictFor(score: number, total: number): { tier: VerdictTier; title: string; msg: string } {
  const r = total ? score / total : 0;
  if (r >= 1) return { tier: 'perfect', title: 'Tuyệt đối', msg: 'Bạn nắm chắc phần này. Thử một đề khác để giữ nhịp.' };
  if (r >= 0.9) return { tier: 'great', title: 'Rất vững', msg: 'Chỉ lệch một chút. Đọc kỹ câu sai bên dưới để chốt nốt.' };
  if (r >= 0.7) return { tier: 'good', title: 'Khá chắc', msg: 'Nền đã tốt. Xem lại các câu sai rồi làm lại để lên điểm tối đa.' };
  if (r >= 0.5) return { tier: 'fair', title: 'Cần ôn thêm', msg: 'Mới được nửa đường. Đọc giải thích từng câu sai trước khi làm lại.' };
  return { tier: 'low', title: 'Nên học lại phần này', msg: 'Quay về bài học của môn này, rồi thử lại. Điểm thấp lúc đầu là bình thường.' };
}

/** Kệ nhóm ngành của một nhóm đề (màu đầu phiếu); nhóm lạ → kệ "Khác". */
export function shelfFor(group: string): Shelf {
  const id = shelfOfGroup(group);
  return SHELVES.find((k) => k.id === id) ?? OTHER_SHELF;
}

/** Tiến độ theo kệ cho rail: mỗi kệ có đề, theo thứ tự SHELVES (kệ "Khác" cuối). */
export function shelfProgress(sets: readonly SetLike[], best: BestMap): { id: string; name: string; color: string; done: number; total: number }[] {
  return [...SHELVES, OTHER_SHELF]
    .map((k) => {
      const mine = sets.filter((s) => shelfOfGroup(s.group) === k.id);
      return { id: k.id, name: k.name, color: k.color, done: mine.filter((s) => best[s.id] != null).length, total: mine.length };
    })
    .filter((k) => k.total > 0);
}

/**
 * Môn để ghi tiến độ cho câu Luyện đề có `concept` (id khái niệm, không kèm môn). Nhóm đề (`group`) chỉ trùng mã môn ở một số bộ
 * (vd. "hinh-su"); nhóm khác (vd. "pldc", "thuong-mai-1" chưa chắc) không suy ra được môn → trả null để KHÔNG ghi sai môn.
 */
export function quizConceptSubject(group: string, subjectIds: readonly string[]): string | null {
  return subjectIds.includes(group) ? group : null;
}

/** Gom đề theo kệ (heading mỗi kệ ở Luyện đề — Q-3). Kệ theo thứ tự xuất hiện đầu tiên, đề trong kệ giữ thứ tự đầu vào.
 *  Không chỉ gom liên tiếp: thứ tự "theo kệ" của sortSets đi theo nhóm môn, một kệ có thể bị nhóm khác chen giữa. */
export function groupByShelf<T extends { group: string }>(sets: readonly T[]): { id: string; name: string; color: string; sets: T[] }[] {
  const out: { id: string; name: string; color: string; sets: T[] }[] = [];
  for (const s of sets) {
    const sh = shelfFor(s.group);
    const hit = out.find((g) => g.id === sh.id);
    if (hit) hit.sets.push(s);
    else out.push({ id: sh.id, name: sh.name, color: sh.color, sets: [s] });
  }
  return out;
}
