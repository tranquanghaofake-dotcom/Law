// Xếp thứ tự bước trong phiên: không hai bước liền nhau cùng một khái niệm (khi còn cách xếp khác),
// ưu tiên đổi dạng câu giữa hai bước liền nhau, giữ nguyên thứ tự các bước của cùng một khái niệm.
import type { Step } from './step';

/** Khoá "dạng" của bước để xen kẽ: dạng sinh tự động nếu có, không thì loại item. */
export const typeKey = (s: Step): string => s.meta?.gen ?? s.item.type;

type Q = { id: string; items: { step: Step; order: number }[] };

/** Sau khi lấy 1 bước của `pick`, phần còn lại còn xếp được không liền nhau (bước đầu ≠ `pick`) không. */
function feasibleAfter(queues: Q[], pick: Q): boolean {
  let total = 0, max = 0, maxIsPick = false;
  for (const q of queues) {
    const n = q.items.length - (q === pick ? 1 : 0);
    total += n;
    if (n > max || (n === max && q === pick)) { max = n; maxIsPick = q === pick; }
  }
  return maxIsPick ? max <= total - max : max <= total - max + 1;
}

/**
 * Trộn các hàng đợi (mỗi hàng = các bước của một khái niệm, đúng thứ tự) thành một dãy.
 * `rng` có thì chọn ngẫu nhiên giữa các lựa chọn ngang nhau; không có thì lấy bước xuất hiện sớm nhất (tất định).
 */
export function interleave(queues: Step[][], opts: { rng?: () => number; prevConcept?: string; prevType?: string } = {}): Step[] {
  let order = 0;
  const qs: Q[] = queues.filter((q) => q.length).map((q) => ({ id: q[0].conceptId, items: q.map((step) => ({ step, order: order++ })) }));
  const out: Step[] = [];
  let prevConcept = opts.prevConcept;
  let prevType = opts.prevType;
  while (qs.some((q) => q.items.length)) {
    const live = qs.filter((q) => q.items.length);
    const notPrev = live.filter((q) => q.id !== prevConcept);
    let pool = notPrev.filter((q) => feasibleAfter(live, q));
    if (!pool.length) pool = notPrev.length ? [notPrev.reduce((a, b) => (b.items.length > a.items.length ? b : a))] : live;
    const diffType = pool.filter((q) => typeKey(q.items[0].step) !== prevType);
    if (diffType.length) pool = diffType;
    const pick = opts.rng
      ? pool[Math.floor(opts.rng() * pool.length)]
      : pool.reduce((a, b) => (b.items[0].order < a.items[0].order ? b : a));
    const { step } = pick.items.shift()!;
    out.push(step);
    prevConcept = step.conceptId;
    prevType = typeKey(step);
  }
  return out;
}

/** Gom theo khái niệm (giữ thứ tự xuất hiện) rồi xếp lại tất định, bước đầu tránh `prevConcept`. Dùng cho vòng sửa sai. */
export function spreadByConcept(steps: Step[], prevConcept?: string): Step[] {
  const by = new Map<string, Step[]>();
  for (const s of steps) by.set(s.conceptId, [...(by.get(s.conceptId) ?? []), s]);
  return interleave([...by.values()], { prevConcept });
}
