// Thẻ chuyên cần (spec thăng chức §1): chu kỳ 30 ngày — ngày 1–27 sáng 27 ký hoạ, 28 sáng viền, 29 lửa tụ về huy hiệu,
// 30 huy hiệu bừng cháy (thắp cuối cùng) + bừng sáng. Huy hiệu xám khi chưa thắp.
// Mỗi chu kỳ sau đổi màu lửa; chỗ chưa tới lượt giữ màu chu kỳ trước. Kỷ lục suy từ chuỗi dài nhất (streak.longest).
export const CARD_DAYS = 30;
export const GLYPHS = 27;
export const TIERS = ['do', 'lam', 'tim', 'trang', 'den', 'vo-cuc'] as const;
export type Tier = (typeof TIERS)[number];
export const TIER_NAMES: Record<Tier, string> = { do: 'Đỏ', lam: 'Xanh lam', tim: 'Tím', trang: 'Trắng', den: 'Đen ánh kim', 'vo-cuc': 'Vô cực' };

export type CardState = {
  day: number; cycle: number; tier: Tier | null; prev: Tier | null;
  glyphs: (Tier | null)[]; logo: Tier | null; border: Tier | null; charge: Tier | null; burst: boolean; record: Tier | null;
};

const tierOf = (cycle: number): Tier => TIERS[Math.min(cycle, TIERS.length - 1)];

export function cardFor(count: number, longest: number): CardState {
  const best = Math.max(longest, count);
  const record = best > 0 ? tierOf(Math.floor((best - 1) / CARD_DAYS)) : null;
  if (count <= 0) return { day: 0, cycle: 0, tier: null, prev: null, glyphs: Array(GLYPHS).fill(null), logo: null, border: null, charge: null, burst: false, record };
  const cycle = Math.floor((count - 1) / CARD_DAYS);
  const day = ((count - 1) % CARD_DAYS) + 1;
  const tier = tierOf(cycle);
  const prev = cycle > 0 ? tierOf(cycle - 1) : null;
  const glyphs = Array.from({ length: GLYPHS }, (_, i) => (i < day ? tier : prev));
  return { day, cycle, tier, prev, glyphs, logo: day >= 30 ? tier : prev, border: day >= 28 ? tier : prev, charge: day === 29 ? tier : null, burst: day === CARD_DAYS, record };
}
