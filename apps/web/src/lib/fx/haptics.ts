const PATTERNS = { ok: [10], bad: [22], milestone: [20, 40, 20, 40, 60] } as const;

/** Rung khi đúng, mạnh dần theo mốc chuỗi (glowLevel 1…6). Sai chỉ rung ngắn một nhịp. */
export const COMBO_BUZZ: readonly (readonly number[])[] = [
  [], [8], [10], [12], [14, 30, 16], [16, 30, 16, 30, 24], [20, 40, 20, 40, 40],
];
export function comboBuzzPattern(level: number): readonly number[] {
  return COMBO_BUZZ[Math.max(0, Math.min(COMBO_BUZZ.length - 1, Math.floor(level)))];
}

export function buzz(pattern: keyof typeof PATTERNS): void {
  try { navigator.vibrate?.(PATTERNS[pattern] as unknown as number[]); } catch { /* không hỗ trợ */ }
}
export function buzzCombo(level: number): void {
  const p = comboBuzzPattern(level);
  if (!p.length) return;
  try { navigator.vibrate?.(p as unknown as number[]); } catch { /* không hỗ trợ */ }
}
