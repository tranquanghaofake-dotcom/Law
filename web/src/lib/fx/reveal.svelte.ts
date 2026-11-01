/** Nền lộ dần: `total` ô, mỗi câu đúng lộ thêm ô (spec mục 6). */
export type Reveal = { readonly revealed: number; readonly tiles: boolean[]; readonly total: number; reveal(n?: number): void; reset(): void };

export function createReveal(total: number, rng: () => number = Math.random): Reveal {
  let tiles = $state<boolean[]>(Array.from({ length: total }, () => false));
  // thứ tự lộ ngẫu nhiên nhưng cố định cho phiên
  const order = Array.from({ length: total }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  let k = $state(0);
  return {
    get revealed() { return k; },
    get tiles() { return tiles; },
    get total() { return total; },
    reveal(n = 1) {
      for (let c = 0; c < n && k < total; c++) { tiles[order[k]] = true; k += 1; }
    },
    reset() { tiles = tiles.map(() => false); k = 0; },
  };
}
