// Thẻ chuyên cần (spec thăng chức §1, §3.13, §3.16): mỗi vòng 30 ngày tiến độ — 1–27 sáng 27 ký hoạ, 28 sáng viền,
// 29 lửa tụ về huy hiệu, 30 huy hiệu bừng cháy (thắp cuối cùng). Huy hiệu xám khi chưa thắp.
// 4 cấp lửa theo vòng: đỏ → xanh lam → tím → trắng–đen giao thoa (giữ mãi). Chỗ chưa tới lượt giữ màu vòng trước.
// Mốc thúc đẩy: ngày chuỗi chạm 1, 5, 10, 15… được thêm 1 ngày tiến độ, nhưng không vượt mốc 30 của vòng (logo luôn được thắp).
export const CARD_DAYS = 30;
export const GLYPHS = 27;
export const TIERS = ['do', 'lam', 'tim', 'trang-den'] as const;
export type Tier = (typeof TIERS)[number];
export const TIER_NAMES: Record<Tier, string> = { do: 'Đỏ', lam: 'Xanh lam', tim: 'Tím', 'trang-den': 'Trắng – đen giao thoa' };

export type CardState = {
  day: number; cycle: number; tier: Tier | null; prev: Tier | null;
  glyphs: (Tier | null)[]; logo: Tier | null; border: Tier | null; charge: Tier | null; burst: boolean; record: Tier | null;
};

const tierOf = (cycle: number): Tier => TIERS[Math.min(cycle, TIERS.length - 1)];

/** Ngày chuỗi `d` là mốc thúc đẩy: ngày 1 và mọi bội của 5. */
export const isMilestone = (d: number): boolean => d === 1 || (d > 0 && d % 5 === 0);

/** Tiến độ thẻ sau `count` ngày chuỗi: mỗi ngày +1, ngày mốc +2, không vượt quá mốc 30 của vòng đang chạy. */
export function progressOf(count: number): number {
  let p = 0;
  for (let d = 1; d <= count; d++) {
    const end = (Math.floor(p / CARD_DAYS) + 1) * CARD_DAYS;
    p = Math.min(p + (isMilestone(d) ? 2 : 1), end);
  }
  return p;
}

/** Trạng thái thẻ theo chuỗi thật (đã quy đổi tiến độ có mốc thúc đẩy). */
export function cardFor(count: number, longest: number): CardState {
  return cardAt(progressOf(count), progressOf(Math.max(longest, count)));
}

/** Trạng thái thẻ theo tiến độ (`count` ở đây là tiến độ, không phải số ngày chuỗi). */
export function cardAt(count: number, longest: number): CardState {
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


/** Có chạy hiệu ứng "vừa thắp" không: chuỗi khác 0 và khác lần xem trước (tăng, hoặc bắt đầu lại sau khi đứt).
 *  `seen = null` (chưa từng lưu) → không chạy, chỉ ghi nhận. */
export function justLit(count: number, seen: number | null): boolean {
  return seen !== null && count > 0 && count !== seen;
}
