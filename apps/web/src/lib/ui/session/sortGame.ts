// Logic thuần của thẻ xếp hai cột. Đặt sai thì tình huống vẫn rơi vào cột ĐÚNG (đánh dấu sai) để người học thấy lời giải.
export type SortCase = { text: string; answer: 'left' | 'right' };
export type Placed = { index: number; side: 'left' | 'right'; ok: boolean };

export function place(cases: SortCase[], placed: Placed[], pick: 'left' | 'right'): { placed: Placed[]; ok: boolean; done: boolean } | null {
  const index = placed.length;
  if (index >= cases.length) return null;
  const ok = cases[index].answer === pick;
  const next = [...placed, { index, side: cases[index].answer, ok }];
  return { placed: next, ok, done: next.length === cases.length };
}

export const sortWrongs = (placed: Placed[]) => placed.filter((p) => !p.ok).length;
/** Quyết định: xếp đúng khi không sai tình huống nào. */
export const sortCorrect = (placed: Placed[]) => sortWrongs(placed) === 0;

/** Cột nằm dưới một điểm (kéo thả bằng Pointer Events): đọc `data-side` của phần tử gần nhất. */
export function sideAt(el: Element | null): 'left' | 'right' | null {
  const hit = el?.closest?.('[data-side]') as HTMLElement | null;
  const v = hit?.dataset.side;
  return v === 'left' || v === 'right' ? v : null;
}
