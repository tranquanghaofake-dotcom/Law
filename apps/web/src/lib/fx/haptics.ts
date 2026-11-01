const PATTERNS = { ok: [10], bad: [30, 40, 30], milestone: [20, 40, 20, 40, 60] } as const;

export function buzz(pattern: keyof typeof PATTERNS): void {
  try { navigator.vibrate?.(PATTERNS[pattern] as unknown as number[]); } catch { /* không hỗ trợ */ }
}
