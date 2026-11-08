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

/**
 * (đợt 7, đề xuất ⑤) Xen kẽ có chủ đích: hai khái niệm dễ nhầm (`isPair`) đứng gần nhau — giữa chúng 1–3 bước
 * (khoảng cách vị trí 2–4). Bước sau của cặp được dời lên vị trí cách bước trước 2 (hoặc xa hơn nếu bước ngay trước
 * chỗ đặt vừa hiện tên khái niệm đó — `leaksInto`, tránh lộ đáp án). Không tạo hai bước liền cùng khái niệm;
 * mỗi bước chỉ ghép một cặp. Không động intro và bước `meta.kind` 'boss' / 'pretest'.
 */
export function nearConfusables(
  steps: Step[],
  isPair: (a: string, b: string) => boolean,
  leaksInto: (from: Step, toConceptId: string) => boolean = () => false,
): Step[] {
  let out = steps.slice();
  const fixed = (s: Step) => s.item.type === 'intro' || s.meta?.kind === 'boss' || s.meta?.kind === 'pretest';
  const paired = new Set<Step>();
  const okAt = (arr: Step[], pos: number, s: Step) =>
    arr[pos - 1]?.conceptId !== s.conceptId && arr[pos]?.conceptId !== s.conceptId && !(arr[pos - 1] && leaksInto(arr[pos - 1], s.conceptId));
  for (let i = 0; i < out.length; i++) {
    const a = out[i];
    if (fixed(a) || paired.has(a)) continue;
    const j = out.findIndex((b, k) => k > i && !fixed(b) && !paired.has(b) && b.conceptId !== a.conceptId && isPair(a.conceptId, b.conceptId));
    if (j < 0) continue;
    const b = out[j];
    if (j - i >= 2 && j - i <= 4 && !leaksInto(out[j - 1], b.conceptId)) { paired.add(a); paired.add(b); continue; }
    const rest = out.slice(0, j).concat(out.slice(j + 1));
    // sau a (giữa chúng 1–3 bước), không được thì trước a; không đặt sau câu chốt cuối phiên
    const lastFixed = rest.length > 0 && fixed(rest[rest.length - 1]) ? rest.length - 1 : rest.length;
    for (const pos of [i + 2, i + 3, i + 4, i - 1, i - 2, i - 3]) {
      if (pos < 0 || pos > lastFixed) continue;
      if (!okAt(rest, pos, b)) continue;
      rest.splice(pos, 0, b);
      out = rest;
      paired.add(a); paired.add(b);
      break;
    }
  }
  return out;
}

// ---------- Chống chuỗi cùng dạng ----------

/** Số vị trí làm chuỗi cùng dạng dài quá `maxRun`. Thẻ giới thiệu không tính và cắt chuỗi (người học thấy nó xen giữa). */
export function longRuns(steps: Step[], maxRun = 2): number {
  let run = 0, n = 0, prev = '';
  for (const s of steps) {
    if (s.item.type === 'intro') { run = 0; prev = ''; continue; }
    const k = typeKey(s);
    run = k === prev ? run + 1 : 1;
    prev = k;
    if (run > maxRun) n++;
  }
  return n;
}

const adjacentSameConcept = (steps: Step[]): number =>
  steps.reduce((n, s, k) => n + (k > 0 && s.conceptId === steps[k - 1].conceptId && s.item.type !== 'intro' ? 1 : 0), 0);

/**
 * Phá chuỗi ≥ 3 bước cùng dạng liền nhau bằng cách DỜI một bước của chuỗi sang vị trí khác (khi có chỗ).
 * Không đổi: số bước, thứ tự các bước của cùng một khái niệm (kể cả thẻ giới thiệu đứng trước câu của nó),
 * thẻ giới thiệu, câu chốt (`meta.kind` 'boss'/'pretest'); không tạo thêm cặp liền nhau cùng khái niệm.
 * Mỗi lần dời phải giảm số chuỗi dài; không có cách dời thì giữ nguyên.
 */
export function breakRuns(steps: Step[], maxRun = 2): Step[] {
  let out = steps.slice();
  const fixedAt = (arr: Step[], k: number) => arr[k].item.type === 'intro' || arr[k].meta?.kind === 'boss' || arr[k].meta?.kind === 'pretest';
  const conceptOrder = (arr: Step[], id: string) => arr.filter((x) => x.conceptId === id);
  const sameOrder = (a: Step[], b: Step[], id: string) => { const x = conceptOrder(a, id), y = conceptOrder(b, id); return x.every((v, i) => v === y[i]); };
  for (let guard = 0; guard < out.length * 4 && longRuns(out, maxRun) > 0; guard++) {
    const before = longRuns(out, maxRun), clashes = adjacentSameConcept(out);
    let run = 0, prev = '', at = -1;
    for (let k = 0; k < out.length && at < 0; k++) {
      if (out[k].item.type === 'intro') { run = 0; prev = ''; continue; }
      const key = typeKey(out[k]);
      run = key === prev ? run + 1 : 1; prev = key;
      if (run > maxRun) at = k;
    }
    let best: Step[] | null = null;
    for (const cand of [at, at - 1, at - 2]) {
      if (cand < 0 || fixedAt(out, cand)) continue;
      const rest = out.slice(0, cand).concat(out.slice(cand + 1));
      for (let p = 0; p <= rest.length && !best; p++) {
        if (p === cand) continue;
        const next = rest.slice(0, p).concat(out[cand], rest.slice(p));
        // câu chốt/đoán trước giữ vị trí tương đối; không chèn sau câu chốt cuối phiên
        if (next.at(-1) !== out.at(-1) && fixedAt(out, out.length - 1)) continue;
        if (!sameOrder(out, next, out[cand].conceptId)) continue;
        if (longRuns(next, maxRun) < before && adjacentSameConcept(next) <= clashes) best = next;
      }
      if (best) break;
    }
    if (!best) break;
    out = best;
  }
  return out;
}
