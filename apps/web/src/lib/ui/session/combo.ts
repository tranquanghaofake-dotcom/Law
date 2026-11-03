// Mức combo → lửa trên thanh phiên. Ngưỡng khớp lib/game/xp.ts: ×1,5 từ 5 câu đúng liên tiếp, ×2 từ 10.
export type ComboTier = { tier: 0 | 1 | 2 | 3; mult: number; label: string; next: number | null; progress: number };

export function comboTier(combo: number): ComboTier {
  const c = Math.max(0, Math.floor(combo));
  // tier 0: chưa có lửa (0–1); 1: đang nóng (2–4); 2: ×1,5 (5–9); 3: ×2 (≥10)
  if (c >= 10) return { tier: 3, mult: 2, label: '×2 XP', next: null, progress: 1 };
  if (c >= 5) return { tier: 2, mult: 1.5, label: '×1,5 XP', next: 10, progress: (c - 5) / 5 };
  if (c >= 2) return { tier: 1, mult: 1, label: `${c} liên tiếp`, next: 5, progress: c / 5 };
  return { tier: 0, mult: 1, label: '', next: 5, progress: c / 5 };
}

/** Một chữ "+10" đang bay: toạ độ viewport nơi vừa bấm. */
export type XpFloat = { id: number; x: number; y: number; text: string; golden: boolean };
