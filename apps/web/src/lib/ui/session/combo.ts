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

// ───────── Viền sáng theo chuỗi đúng liên tiếp ─────────
/** Mốc chuỗi đúng: 1 → 2 → 3 → 5 → 8 → 13 (Fibonacci sau mốc 5). Bốn mốc đầu đi hết dải bậc màu thẻ chuyên cần. */
export const GLOW_MILESTONES = [1, 2, 3, 5, 8, 13] as const;
export type GlowTier = 'do' | 'lam' | 'tim' | 'trang-den';
/** Bậc màu theo mốc (chỉ số 1…6); mốc 8 và 13 giữ "Trắng – đen giao thoa" nhưng dày và rực hơn. */
const LEVEL_TIER: GlowTier[] = ['do', 'lam', 'tim', 'trang-den', 'trang-den', 'trang-den'];

/** Màu theo bậc (cùng gam thẻ chuyên cần, lib/ui/streakView.ts): line = nét, glow = quầng, alt = nét xen kẽ (chỉ Trắng – đen). */
export const COMBO_COLORS: Record<GlowTier, { line: string; glow: string; alt: string }> = {
  do: { line: '#e3300b', glow: '#ff6a3a', alt: 'transparent' },
  lam: { line: '#0a5cff', glow: '#38b6ff', alt: 'transparent' },
  tim: { line: '#7417ff', glow: '#b65cff', alt: 'transparent' },
  'trang-den': { line: '#ffffff', glow: '#9db2cf', alt: '#050507' },
};

/** Số mốc đã đạt: 0 (chưa có chuỗi) … 6. */
export function glowLevel(combo: number): number {
  const c = Math.max(0, Math.floor(combo));
  let n = 0;
  for (const m of GLOW_MILESTONES) if (c >= m) n += 1;
  return n;
}

export type EdgeGlow = { level: number; tier: GlowTier | null; width: number; blur: number; alpha: number };
const WIDTH = [0, 2, 3, 4, 5, 6, 8];
const BLUR = [0, 10, 16, 24, 32, 42, 56];
const ALPHA = [0, 0.5, 0.6, 0.7, 0.82, 0.92, 1];

/** Viền màn hình theo chuỗi: mỗi mốc dày hơn, quầng rộng hơn, đậm hơn và đổi bậc màu. Chuỗi 0 → tắt. */
export function edgeGlow(combo: number): EdgeGlow {
  const level = glowLevel(combo);
  return { level, tier: level ? LEVEL_TIER[level - 1] : null, width: WIDTH[level], blur: BLUR[level], alpha: ALPHA[level] };
}

// ───────── Một nguồn màu "lửa" cho viền, ngọn lửa, thanh tiến độ, +XP ─────────
/** a = thân đậm, b = thân sáng, c = lõi; line/glow/alt lấy nguyên từ COMBO_COLORS (viền). scale: cỡ ngọn lửa theo mốc. */
export type FireTheme = { level: number; tier: GlowTier; a: string; b: string; c: string; line: string; glow: string; alt: string; scale: number };
const FIRE: Record<GlowTier, { a: string; b: string; c: string }> = {
  do: { a: '#c4220a', b: '#ff6a3a', c: '#ffd9a0' },
  lam: { a: '#0847d6', b: '#38b6ff', c: '#e0f4ff' },
  tim: { a: '#5a0fd0', b: '#b65cff', c: '#f3e4ff' },
  // thanh tiến độ trên nền giấy sáng: thân tối, ánh bạc, lõi trắng
  'trang-den': { a: '#14161f', b: '#8da3c4', c: '#ffffff' },
};
const SCALE = [1, 1, 1.08, 1.18, 1.3, 1.42, 1.55];

export function fireTheme(combo: number): FireTheme {
  const level = glowLevel(combo);
  const tier = level ? LEVEL_TIER[level - 1] : 'do';
  return { level, tier, ...FIRE[tier], ...COMBO_COLORS[tier], scale: SCALE[level] };
}

/** Chuỗi style gán custom property; app.css đã đăng ký @property --fire-* nên đổi mốc là chuyển màu mượt. */
export function fireStyle(combo: number): string {
  const f = fireTheme(combo);
  return `--fire-a:${f.a};--fire-b:${f.b};--fire-c:${f.c};--fire-line:${f.line};--fire-glow:${f.glow};--fire-alt:${f.alt}`;
}

/** Một chữ "+10" đang bay: toạ độ viewport nơi vừa bấm. */
export type XpFloat = { id: number; x: number; y: number; text: string; golden: boolean; fire?: string };
