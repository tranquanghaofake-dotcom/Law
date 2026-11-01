import type { Concept, Item, Level } from '$lib/content/types';

export type Pass = 1 | 2 | 3;
export type IntroItem = { type: 'intro' };
export type Step = { conceptId: string; item: Item | IntroItem; level: Level };

export function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Pass theo bậc thấp nhất trong đợt: 0 → 1; 1–2 → 2; ≥3 → 3. */
export function passFor(levels: Record<string, Level>): Pass {
  const min = Math.min(...Object.values(levels)) as Level;
  if (min <= 0) return 1;
  if (min <= 2) return 2;
  return 3;
}

const PRACTICE_LEVELS: Level[] = [1, 2, 3, 4, 5];

/** Chọn item cho bậc; bậc 6 → ngẫu nhiên 1–5; thiếu loại → bậc gần nhất thấp hơn. */
export function pickItem(concept: Concept, level: Level, rng: () => number): Item {
  let want: Level = level === 6 ? PRACTICE_LEVELS[Math.floor(rng() * PRACTICE_LEVELS.length)] : level;
  if (want < 1) want = 1;
  for (let l = want; l >= 1; l--) {
    const pool = concept.items.filter((i) => i.level === l);
    if (pool.length) return pool[Math.floor(rng() * pool.length)];
  }
  const pool = concept.items.filter((i) => i.level > want);
  if (!pool.length) throw new Error(`Khái niệm ${concept.id} không có item nào`);
  return pool[0];
}

function stageSteps(concepts: Concept[], level: Level, rng: () => number): Step[] {
  return shuffle(concepts, rng).map((c) => ({ conceptId: c.id, item: pickItem(c, level, rng), level }));
}

/**
 * Pass 1: intro + bậc 1 xen kẽ theo khối 2–3 khái niệm (intro của khối rồi bậc 1 của khối).
 * Pass 2: bậc 2 cho mọi khái niệm rồi bậc 3. Pass 3: bậc 4 rồi bậc 5.
 */
export function buildLearnSession(concepts: Concept[], levels: Record<string, Level>, rng: () => number): Step[] {
  const pass = passFor(Object.fromEntries(concepts.map((c) => [c.id, levels[c.id] ?? 0])));
  if (pass === 1) {
    const order = shuffle(concepts, rng);
    const steps: Step[] = [];
    const blockSize = order.length <= 3 ? order.length : order.length === 4 ? 2 : 3;
    for (let i = 0; i < order.length; i += blockSize) {
      const block = order.slice(i, i + blockSize);
      for (const c of block) steps.push({ conceptId: c.id, item: { type: 'intro' }, level: 0 });
      for (const c of shuffle(block, rng)) steps.push({ conceptId: c.id, item: pickItem(c, 1, rng), level: 1 });
    }
    return steps;
  }
  const [a, b]: [Level, Level] = pass === 2 ? [2, 3] : [4, 5];
  return [...stageSteps(concepts, a, rng), ...stageSteps(concepts, b, rng)];
}

/** Ôn: mỗi khái niệm 1 bước ở bậc hiện tại (bậc 6 → ngẫu nhiên 1–5), tối đa `max`. */
export function buildReviewSession(concepts: Concept[], levels: Record<string, Level>, rng: () => number, max = 20): Step[] {
  return shuffle(concepts, rng)
    .slice(0, max)
    .map((c) => {
      const lv = (levels[c.id] ?? 1) as Level;
      const level: Level = lv < 1 ? 1 : lv;
      return { conceptId: c.id, item: pickItem(c, level, rng), level };
    });
}
