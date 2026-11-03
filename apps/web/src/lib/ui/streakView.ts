// Một nguồn số liệu cho mọi chỗ hiển thị chuỗi (rail Hôm nay, đáy sidebar, topbar điện thoại) và tiến độ chức danh.
// Không tự tính tiến độ: lấy từ cardFor/progressOf (lib/game/card.ts) nên khớp chú thích trên thẻ chuyên cần.
import { CARD_DAYS, TIERS, TIER_NAMES, cardFor, type Tier } from '$lib/game/card';
import { totalNeed, type CareerState } from '$lib/game/career';

// Màu lửa theo chu kỳ (cùng bảng với StreakCard): flame = thân lửa (viền thẻ tối), glow = quầng và thanh tiến độ trên nền sáng.
const FLAME: Record<Tier, { flame: string; glow: string }> = {
  do: { flame: '#ffa32a', glow: '#e3300b' },
  lam: { flame: '#38b6ff', glow: '#0a5cff' },
  tim: { flame: '#b65cff', glow: '#7417ff' },
  'trang-den': { flame: '#eef3fa', glow: '#8ea4bf' },
};
const COLD = { flame: '#8b93a5', glow: '#8b93a5' };

export type StreakView = {
  count: number; longest: number;
  /** Tiến độ trong vòng 30 ngày (có cộng ngày mốc) — số duy nhất, bằng "x/30" trên thẻ. */
  day: number; total: number; left: number; pct: number;
  tier: Tier | null; tierName: string | null; nextTierName: string | null;
  flame: string; glow: string; color: string;
  /** "Đỏ · 3/30" hoặc "Chưa có chuỗi". */
  label: string;
};

export function streakView(count: number, longest: number): StreakView {
  const c = cardFor(count, longest);
  const tier = c.tier;
  const pal = tier ? FLAME[tier] : COLD;
  const next = tier && c.cycle + 1 < TIERS.length ? TIER_NAMES[TIERS[c.cycle + 1]] : null;
  return {
    count, longest: Math.max(longest, count),
    day: c.day, total: CARD_DAYS, left: CARD_DAYS - c.day, pct: Math.round((c.day / CARD_DAYS) * 100),
    tier, tierName: tier ? TIER_NAMES[tier] : null, nextTierName: next,
    flame: pal.flame, glow: pal.glow, color: pal.glow,
    label: tier ? `${TIER_NAMES[tier]} · ${c.day}/${CARD_DAYS}` : 'Chưa có chuỗi',
  };
}

export type PostProgress = { title: string; have: number; need: number; pct: number };

/** Tiến độ tới chức kế tiếp của nhánh: số sách đã đủ / tổng số sách cần (không vượt số cần của từng điều kiện). */
export function postProgress(next: CareerState['next'][keyof CareerState['next']]): PostProgress | null {
  if (!next) return null;
  const need = totalNeed(next.post);
  const lacking = next.missing.reduce((n, m) => n + Math.max(0, m.req.count - m.have), 0);
  const have = Math.max(0, need - lacking);
  return { title: next.post.title, have, need, pct: need ? Math.round((have / need) * 100) : 0 };
}
